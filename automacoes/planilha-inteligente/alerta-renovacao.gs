/**
 * Alerta de Renovação — SRS Corretora
 * Envia e-mail automático ao corretor 15 dias antes do vencimento da apólice.
 * Controla duplicidade pela coluna P (status "ENVIADO").
 * Configurar acionador: executar diariamente (gatilho por tempo)
 */
function enviarAlertaDefinitivo() {
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Todos os clientes");
  const dados = aba.getRange(1, 1, aba.getLastRow(), 16).getDisplayValues();
  
  const hoje = new Date();
  const dataAlvo = new Date();
  dataAlvo.setDate(hoje.getDate() + 15);
  const dataAlvoTexto = Utilities.formatDate(dataAlvo, "GMT-3", "dd/MM/yyyy");

  for (let i = 1; i < dados.length; i++) {
    let segurado = dados[i][0];
    let vencimento = dados[i][4];
    let email = dados[i][8];
    let statusEnviado = dados[i][15];

    if (vencimento === dataAlvoTexto && statusEnviado !== "ENVIADO") {
      if (email && email.includes("@")) {
        try {
          MailApp.sendEmail(email, "⚠️ Renovação Próxima: " + segurado,
            "Olá,\n\nO seguro de " + segurado + " vence em 15 dias (" + vencimento + ").");
          aba.getRange(i + 1, 16).setValue("ENVIADO");
          console.log("✅ Enviado para: " + segurado);
        } catch (e) {
          console.log("❌ Erro no envio: " + e.message);
        }
      }
    }
  }
}
