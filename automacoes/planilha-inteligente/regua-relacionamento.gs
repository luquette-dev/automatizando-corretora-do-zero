// ============================================================
//  RÉGUA DE RELACIONAMENTO
//  Corretora de Seguros — Google Apps Script
//
//  Envia alertas automáticos para o corretor nos meses
//  5, 7 e 9 do seguro com texto sugerido para WhatsApp,
//  oferecendo produtos complementares com base no perfil
//  de cada cliente.
//
//  Gatilho: todo dia às 8h (configurado em configurar-gatilhos.gs)
// ============================================================

function enviarAlertasProgramaRelacionamento() {
  var planilha    = SpreadsheetApp.getActiveSpreadsheet();
  var abaClientes = planilha.getSheetByName("Todos os clientes");
  var abaOpor     = planilha.getSheetByName("Oportunidades do Mês");

  if (!abaClientes) {
    Logger.log("Erro: Aba 'Todos os clientes' não encontrada.");
    return;
  }

  var dados = abaClientes.getDataRange().getValues();
  var hoje  = new Date();
  hoje.setHours(0, 0, 0, 0);

  var COL_NOME           = 0;
  var COL_PRODUTO_ATUAL  = 1;
  var COL_VENCIMENTO     = 4;
  var COL_EMAIL_CORRETOR = 8;
  var COL_CELULAR        = 13;
  var COL_RESIDENCIAL    = 17;
  var COL_SAUDE          = 18;
  var COL_CONSORCIO      = 19;

  // Carrega controle de fases já enviadas da aba Oportunidades (col B)
  var controlesEnvio = {};
  if (abaOpor) {
    var dadosOpor = abaOpor.getDataRange().getValues();
    for (var x = 1; x < dadosOpor.length; x++) {
      var nomeOpor = dadosOpor[x][0];
      var faseOpor = dadosOpor[x][1];
      if (nomeOpor) controlesEnvio[nomeOpor.toString().toUpperCase()] = faseOpor;
    }
  }

  var emailsEnviados = 0;

  for (var i = 1; i < dados.length; i++) {
    var linha         = dados[i];
    var nome          = linha[COL_NOME];
    var produtoAtual  = linha[COL_PRODUTO_ATUAL];
    var dataVencRaw   = linha[COL_VENCIMENTO];
    var emailCorretor = linha[COL_EMAIL_CORRETOR];
    var celular       = linha[COL_CELULAR];

    if (!nome || !dataVencRaw || !emailCorretor) continue;
    if (produtoAtual !== "SEGURO AUTO" && produtoAtual !== "RASTREADOR") continue;

    // Parse seguro de data BR
    var dataVencimento = _parseDateBR(dataVencRaw.toString());
    if (!dataVencimento && dataVencRaw instanceof Date) dataVencimento = dataVencRaw;
    if (!dataVencimento) continue;
    dataVencimento.setHours(0, 0, 0, 0);

    var diasAteVencer = Math.round((dataVencimento - hoje) / (1000 * 60 * 60 * 24));

    var temResidencial = (String(linha[COL_RESIDENCIAL] != null ? linha[COL_RESIDENCIAL] : "").toUpperCase() === "TRUE");
    var temSaude       = (String(linha[COL_SAUDE]       != null ? linha[COL_SAUDE]       : "").toUpperCase() === "TRUE");
    var temConsorcio   = (String(linha[COL_CONSORCIO]   != null ? linha[COL_CONSORCIO]   : "").toUpperCase() === "TRUE");

    var chaveNome  = nome.toString().toUpperCase();
    var faseAtual  = controlesEnvio[chaveNome] || "";

    var celularLimpo = celular != null ? celular.toString().replace(/\D/g, "") : "";
    var linkZap      = celularLimpo ? "https://wa.me/55" + celularLimpo : "(sem celular)";

    var assunto    = "";
    var corpoEmail = "";
    var novaFase   = "";

    // ── MÊS 5 (210 dias antes do vencimento) ──────────────
    if (diasAteVencer === 210 && faseAtual === "") {

      if (!temResidencial) {
        novaFase   = "🏠 Mês 5: Res. Enviado";
        assunto    = "🏠 [Relacionamento] Oferecer Residencial — " + nome;
        corpoEmail =
          "Olá!\n\n" +
          "O cliente " + nome + " completou 5 meses de seguro Auto. Como ele NÃO tem residencial, hora de oferecer!\n\n" +
          "📱 WhatsApp: " + linkZap + "\n\n" +
          "💬 TEXTO SUGERIDO PARA WHATSAPP:\n" +
          "\"Oi, " + nome + ", tudo bem? Estava revisando a sua apólice do carro e notei que liberamos um bônus especial para você. " +
          "Conseguimos uma cobertura completa para a sua casa por menos de R$ 1 por dia. " +
          "Vale muito a pena proteger o teto onde o seu carro fica guardado! Posso te mandar uma simulação sem compromisso?\"\n\n" +
          "Boas vendas! 🚀";

      } else if (!temConsorcio) {
        novaFase   = "💰 Mês 5: Cons. Enviado (já tem Res.)";
        assunto    = "💰 [Relacionamento] Cliente já tem Residencial — Oferecer Consórcio — " + nome;
        corpoEmail =
          "Olá!\n\n" +
          "O cliente " + nome + " completou 5 meses de Auto e JÁ TEM Residencial. Vamos oferecer Consórcio!\n\n" +
          "📱 WhatsApp: " + linkZap + "\n\n" +
          "💬 TEXTO SUGERIDO PARA WHATSAPP:\n" +
          "\"Oi, " + nome + ", tudo bem? Passando para agradecer a confiança com o seguro do seu carro e da sua casa! " +
          "Sabia que quem protege tudo com a gente tem prioridade em grupos de consórcio em andamento? " +
          "Se você estiver pensando em trocar de carro ou fazer um investimento sem pagar juros de banco, " +
          "eu consigo uma taxa de administração reduzida para você este mês. Quer dar uma olhada?\"\n\n" +
          "Boas vendas! 🚀";
      }
    }

    // ── MÊS 7 (150 dias antes do vencimento) ──────────────
    else if (diasAteVencer === 150 && !temConsorcio &&
             faseAtual !== "💰 Mês 7: Cons. Enviado" &&
             faseAtual !== "❌ Cons: Não teve interesse") {

      novaFase   = "💰 Mês 7: Cons. Enviado";
      assunto    = "💰 [Relacionamento] Oferecer Consórcio — " + nome;
      corpoEmail =
        "Olá!\n\n" +
        "O cliente " + nome + " entrou no 7º mês do seguro. Momento de falar sobre planejamento de futuro!\n\n" +
        "📱 WhatsApp: " + linkZap + "\n\n" +
        "💬 TEXTO SUGERIDO PARA WHATSAPP:\n" +
        "\"Fala, " + nome + ", tudo bem? Passando para saber se o carro está 100%! " +
        "Muitos clientes nossos estão aproveitando este semestre para planejar a troca do carro pelo consórcio, " +
        "fugindo dos juros altos dos bancos. Como você já é nosso cliente parceiro, " +
        "eu consigo uma tabela com taxa de administração reduzida. " +
        "Quer dar uma olhada em como ficariam as parcelas?\"\n\n" +
        "Boas vendas! 🚀";
    }

    // ── MÊS 9 (90 dias antes do vencimento) ───────────────
    else if (diasAteVencer === 90 && !temSaude &&
             faseAtual !== "🏥 Mês 9: Saúde Enviado" &&
             faseAtual !== "❌ Saúde: Não teve interesse") {

      novaFase   = "🏥 Mês 9: Saúde Enviado";
      assunto    = "🏥 [Relacionamento] Oferecer Saúde/Vida — " + nome;
      corpoEmail =
        "Olá!\n\n" +
        "O cliente " + nome + " está a 3 meses da renovação. Hora de falar sobre proteção pessoal!\n\n" +
        "📱 WhatsApp: " + linkZap + "\n\n" +
        "💬 TEXTO SUGERIDO PARA WHATSAPP:\n" +
        "\"Olá, " + nome + ", tudo certo? Já cuidamos muito bem do seu veículo, " +
        "mas fazendo um check-up na sua ficha vi que ainda não conversamos sobre a proteção da sua saúde e da sua família. " +
        "Fechamos novas parcerias com operadoras excelentes com tabelas especiais para quem já é cliente. " +
        "Se estiver precisando reduzir o custo do plano atual ou pesquisando um novo, " +
        "me avisa que faço um estudo!\"\n\n" +
        "Boas vendas! 🚀";
    }

    // ── ENVIA E ATUALIZA FASE ──────────────────────────────
    if (assunto !== "") {
      try {
        MailApp.sendEmail(emailCorretor, assunto, corpoEmail);
        emailsEnviados++;
        Logger.log("✅ Enviado para: " + emailCorretor + " | Cliente: " + nome + " | Fase: " + novaFase);
        if (abaOpor) _atualizarFaseRegua(abaOpor, nome, novaFase);
      } catch (err) {
        Logger.log("❌ Erro ao enviar para " + emailCorretor + " | " + nome + ": " + err.message);
      }
    }
  }

  SpreadsheetApp.getActiveSpreadsheet().toast(
    emailsEnviados + " alerta(s) de relacionamento enviado(s)!",
    "Régua de relacionamento", 5
  );
}

function corrigirEOrganizarColunas() {
  var planilha         = SpreadsheetApp.getActiveSpreadsheet();
  var abaOportunidades = planilha.getSheetByName("Oportunidades do Mês") ||
                         planilha.getSheetByName("Oportunidades do mês");

  if (!abaOportunidades) {
    SpreadsheetApp.getActiveSpreadsheet().toast("Aba 'Oportunidades do Mês' não encontrada.", "Erro", 5);
    return;
  }

  abaOportunidades.getRange("H1:H500").clearDataValidations();
  abaOportunidades.getRange("H1:H500").clearContent();
  abaOportunidades.getRange("B1").setValue("Fase da Régua");

  var statusRegua = [
    "⏳ Aguardando Régua",
    "🏠 Mês 5: Res. Enviado",
    "❌ Res: Não teve interesse",
    "💰 Mês 7: Cons. Enviado",
    "💰 Mês 5: Cons. Enviado (já tem Res.)",
    "❌ Cons: Não teve interesse",
    "🏥 Mês 9: Saúde Enviado",
    "❌ Saúde: Não teve interesse",
    "✅ Cross-Sell Fechado!"
  ];

  var regra = SpreadsheetApp.newDataValidation()
    .requireValueInList(statusRegua, true)
    .setAllowInvalid(false)
    .build();

  var ultimaLinha = Math.max(abaOportunidades.getLastRow(), 2);
  abaOportunidades.getRange(2, 2, ultimaLinha - 1, 1).setDataValidation(regra);

  var headerB = abaOportunidades.getRange("B1");
  headerB.setBackground("#1a1a2e");
  headerB.setFontColor("#ffffff");
  headerB.setFontWeight("bold");
  abaOportunidades.setColumnWidth(2, 220);

  SpreadsheetApp.getActiveSpreadsheet().toast(
    "Aba Oportunidades organizada! Coluna B pronta para uso.",
    "Configuração concluída", 5
  );
}

// ── Funções internas ──────────────────────────────────────

function _atualizarFaseRegua(abaOpor, nome, novaFase) {
  var dadosOpor = abaOpor.getDataRange().getValues();
  for (var i = 1; i < dadosOpor.length; i++) {
    if (dadosOpor[i][0].toString().toUpperCase() === nome.toString().toUpperCase()) {
      abaOpor.getRange(i + 1, 2).setValue(novaFase);
      return;
    }
  }
}

function _parseDateBR(dateStr) {
  if (!dateStr) return null;
  var str    = dateStr.toString().trim();
  var partes = str.includes("/") ? str.split("/") : str.split("-");
  if (partes.length !== 3) return null;
  var d = parseInt(partes[0]), m = parseInt(partes[1]) - 1, a = parseInt(partes[2]);
  if (isNaN(d) || isNaN(m) || isNaN(a)) return null;
  var dt = new Date(a, m, d);
  dt.setHours(0, 0, 0, 0);
  return dt;
}
