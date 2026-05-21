// ============================================================
//  RESUMO SEMANAL
//  Corretora de Seguros — Google Apps Script
//
//  Envia toda segunda-feira às 8h um e-mail com:
//  - Vendas realizadas nos últimos 7 dias (pela data de vigência)
//  - Renovações realizadas na semana
//  - Clientes com score alto sem abordagem
//  - Renovações previstas nos próximos 30 dias
//
//  Gatilho: toda segunda às 8h (configurado em configurar-gatilhos.gs)
// ============================================================

function enviarResumoSemanal() {
  const ss          = SpreadsheetApp.getActiveSpreadsheet();
  const abaClientes = ss.getSheetByName("Todos os clientes");
  const abaOpor     = ss.getSheetByName("Oportunidades do Mês");
  const abaConfig   = ss.getSheetByName("Configuracoes");
  const abaHist     = ss.getSheetByName("Historico de Apolices");

  const hoje      = new Date();
  hoje.setHours(0, 0, 0, 0);
  const inicioSem = new Date(hoje);
  inicioSem.setDate(hoje.getDate() - 7);

  const dadosClientes = abaClientes.getRange(2, 1, abaClientes.getLastRow() - 1, 16).getValues();
  const dadosOpor     = abaOpor ? abaOpor.getDataRange().getValues() : [];
  const dadosConfig   = abaConfig.getDataRange().getValues();

  // E-mails dos corretores
  const emailsCorretores = {};
  for (let i = 1; i < dadosConfig.length; i++) {
    if (dadosConfig[i][0] && dadosConfig[i][1]) {
      emailsCorretores[dadosConfig[i][1]] = dadosConfig[i][0];
    }
  }

  // ── 1. VENDAS NOS ÚLTIMOS 7 DIAS (início vigência = vencimento - 1 ano) ──
  let totalVendasSemana = 0;
  let qtdVendasSemana   = 0;
  let listaVendas       = "";

  dadosClientes.forEach(row => {
    const segurado   = row[0];
    const venc       = row[4];
    const premio     = row[6];
    const comissao   = row[10];
    const seguradora = row[12];

    if (!segurado || !venc) return;

    let dataVenc = _parseDateBRSemanal(venc.toString());
    if (!dataVenc && venc instanceof Date) dataVenc = new Date(venc);
    if (!dataVenc) return;

    // Início da vigência = vencimento - 1 ano
    let dataInicio = new Date(dataVenc);
    dataInicio.setFullYear(dataInicio.getFullYear() - 1);
    dataInicio.setHours(0, 0, 0, 0);

    if (dataInicio >= inicioSem && dataInicio <= hoje) {
      let comissaoNum = parseFloat((comissao || "").toString().replace("R$","").replace(/\./g,"").replace(",",".").trim());
      let premioNum   = parseFloat((premio   || "").toString().replace("R$","").replace(/\./g,"").replace(",",".").trim());
      if (!isNaN(comissaoNum) && comissaoNum > 0) totalVendasSemana += comissaoNum;
      qtdVendasSemana++;
      listaVendas +=
        "   • " + segurado + " (" + seguradora + ")\n" +
        "     Prêmio: R$ " + (isNaN(premioNum) ? "—" : premioNum.toFixed(2)) +
        " | Comissão: R$ " + (isNaN(comissaoNum) ? "—" : comissaoNum.toFixed(2)) +
        " | Início: " + Utilities.formatDate(dataInicio, "GMT-3", "dd/MM/yyyy") + "\n";
    }
  });

  // ── 2. RENOVAÇÕES DA SEMANA (via aba histórico) ───────────
  let renovacoesSemana = 0;
  let listaRenovacoes  = "";

  if (abaHist) {
    const dadosHist = abaHist.getDataRange().getValues();
    dadosHist.forEach((row, i) => {
      if (i === 0) return;
      const status  = row[15];
      const dataArq = row[16];
      if (status === "RENOVADA" && dataArq instanceof Date && dataArq >= inicioSem && dataArq <= hoje) {
        renovacoesSemana++;
        listaRenovacoes += "   • " + row[0] + " — " + row[12] + " | Novo prêmio: R$ " + row[17] + "\n";
      }
    });
  }

  // ── 3. CLIENTES SCORE ALTO SEM ABORDAGEM ─────────────────
  let listaScore = "";
  let qtdScore   = 0;

  if (dadosOpor.length > 1) {
    dadosOpor.forEach((row, i) => {
      if (i === 0) return;
      const nome        = row[0];
      const celular     = row[1]  || "";
      const scoreTexto  = row[7]  != null ? row[7].toString() : "";
      const statusAbord = row[8]  != null ? row[8].toString() : "";
      if (!nome) return;

      const matchScore = scoreTexto.match(/Score:\s*(\d+)/);
      const scoreNum   = matchScore ? parseInt(matchScore[1]) : 0;

      if (scoreNum >= 2 && (!statusAbord || statusAbord.trim() === "")) {
        qtdScore++;
        const celularLimpo = celular.toString().replace(/\D/g, "");
        const linkZap      = celularLimpo ? "https://wa.me/55" + celularLimpo : "sem celular";
        listaScore += "   • " + nome + " | " + scoreTexto.replace(/\|.*/, "").trim() + "\n";
        listaScore += "     WhatsApp: " + linkZap + "\n";
      }
    });
  }

  // ── 4. RENOVAÇÕES NOS PRÓXIMOS 30 DIAS ───────────────────
  let proximasRenovacoes = 0;
  let listaProximas      = "";
  const daqui30          = new Date(hoje);
  daqui30.setDate(hoje.getDate() + 30);

  dadosClientes.forEach(row => {
    const segurado   = row[0];
    const venc       = row[4];
    const seguradora = row[12];
    const celular    = row[13];
    if (!segurado || !venc) return;

    let dataVenc = _parseDateBRSemanal(venc.toString());
    if (!dataVenc && venc instanceof Date) dataVenc = new Date(venc);
    if (!dataVenc) return;
    dataVenc.setHours(0, 0, 0, 0);

    if (dataVenc >= hoje && dataVenc <= daqui30) {
      proximasRenovacoes++;
      const dataFormatada = Utilities.formatDate(dataVenc, "GMT-3", "dd/MM/yyyy");
      const celularLimpo  = (celular || "").toString().replace(/\D/g, "");
      const linkZap       = celularLimpo ? "https://wa.me/55" + celularLimpo : "sem celular";
      listaProximas += "   • " + segurado + " — " + seguradora + " | Vence: " + dataFormatada + "\n";
      listaProximas += "     WhatsApp: " + linkZap + "\n";
    }
  });

  // ── MONTA E ENVIA O E-MAIL ────────────────────────────────
  const semanaFormatada =
    Utilities.formatDate(inicioSem, "GMT-3", "dd/MM") + " a " +
    Utilities.formatDate(hoje, "GMT-3", "dd/MM/yyyy");

  const assunto = "📊 Resumo semanal da corretora — " + semanaFormatada;

  let corpo =
    "Bom dia! Aqui está o resumo da semana.\n\n" +
    "══════════════════════════════\n" +
    "🚀 VENDAS REALIZADAS NOS ÚLTIMOS 7 DIAS\n" +
    "══════════════════════════════\n";
  corpo += qtdVendasSemana > 0
    ? qtdVendasSemana + " venda(s) | Total comissões: R$ " + totalVendasSemana.toFixed(2) + "\n\n" + listaVendas
    : "Nenhuma venda registrada nos últimos 7 dias.\n";

  corpo +=
    "\n══════════════════════════════\n" +
    "🔄 RENOVAÇÕES REALIZADAS\n" +
    "══════════════════════════════\n";
  corpo += renovacoesSemana > 0
    ? renovacoesSemana + " renovação(ões):\n\n" + listaRenovacoes
    : "Nenhuma renovação registrada essa semana.\n";

  corpo +=
    "\n══════════════════════════════\n" +
    "⭐ CLIENTES SCORE ALTO SEM ABORDAGEM\n" +
    "══════════════════════════════\n";
  corpo += qtdScore > 0
    ? qtdScore + " cliente(s) aguardando contato:\n\n" + listaScore
    : "Todos os clientes com score alto já foram abordados!\n";

  corpo +=
    "\n══════════════════════════════\n" +
    "📅 RENOVAÇÕES NOS PRÓXIMOS 30 DIAS (" + proximasRenovacoes + ")\n" +
    "══════════════════════════════\n";
  corpo += proximasRenovacoes > 0
    ? listaProximas
    : "Nenhuma renovação prevista para os próximos 30 dias.\n";

  corpo += "\n\nBoa semana e boas vendas! 🚀\n";

  Object.keys(emailsCorretores).forEach(email => {
    try {
      MailApp.sendEmail(email, assunto, corpo);
    } catch (e) {
      Logger.log("Erro ao enviar para " + email + ": " + e.message);
    }
  });

  SpreadsheetApp.getActiveSpreadsheet().toast("Resumo semanal enviado!", "Pronto", 5);
}

// ── Função interna ────────────────────────────────────────

function _parseDateBRSemanal(dateStr) {
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
