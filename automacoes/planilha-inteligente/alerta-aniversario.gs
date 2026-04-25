/**
 * Alerta de Aniversário — SRS Corretora
 * Envia e-mail ao corretor no dia do aniversário do cliente.
 * Inclui link direto para WhatsApp do cliente.
 * Configurar acionador: executar diariamente (gatilho por tempo)
 */
function avisarAniversariantes() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var abaAniv = ss.getSheetByName("Aniversários");
  var abaConfig = ss.getSheetByName("Configuracoes");
  var dadosAniv = abaAniv.getDataRange().getValues();
  var dadosConfig = abaConfig.getDataRange().getValues();

  var hoje = new Date();
  var diaHoje = hoje.getDate();
  var mesHoje = hoje.getMonth() + 1;

  // Monta dicionário de e-mails dos corretores
  var emailsCorretores = {};
  for (var i = 1; i < dadosConfig.length; i++) {
    if (dadosConfig[i][0]) {
      emailsCorretores[dadosConfig[i][0]] = dadosConfig[i][1];
    }
  }

  // Verifica aniversariantes do dia
  for (var j = 1; j < dadosAniv.length; j++) {
    var nomeCliente = dadosAniv[j][0];
    if (!nomeCliente || nomeCliente == "") continue;

    var nomeCorretor = dadosAniv[j][2];
    var dataNasc = dadosAniv[j][4];
    var celular = dadosAniv[j][5];

    if (dataNasc instanceof Date) {
      if (dataNasc.getDate() == diaHoje && (dataNasc.getMonth() + 1) == mesHoje) {
        var emailDestino = emailsCorretores[nomeCorretor];
        if (emailDestino) {
          var celularLimpo = celular.toString().replace(/\D/g, "");
          var linkZap = "https://wa.me/55" + celularLimpo;
          var assunto = "🎂 Aniversário de Cliente: " + nomeCliente;
          var corpo = "Olá " + nomeCorretor + ",\n\n" +
            "Seu cliente " + nomeCliente + " está fazendo aniversário hoje!\n\n" +
            "Clique no link abaixo para enviar uma mensagem de parabéns:\n" +
            linkZap + "\n\n" +
            "Dica: Um atendimento próximo gera fidelidade e indicações!\n\n" +
            "Atenciosamente,\nSistema SRS Corretora";
          MailApp.sendEmail(emailDestino, assunto, corpo);
          console.log("✅ E-mail enviado para " + nomeCorretor + " — cliente: " + nomeCliente);
        } else {
          console.warn("⚠️ E-mail não encontrado para o corretor: " + nomeCorretor);
        }
      }
    }
  }
}
