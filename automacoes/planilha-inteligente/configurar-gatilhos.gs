// ============================================================
//  CONFIGURAR GATILHOS
//  Corretora de Seguros — Google Apps Script
//
//  Execute esta função UMA ÚNICA VEZ para ativar todas
//  as automações automáticas da corretora.
//
//  Gatilhos configurados:
//  - enviarAlertaDefinitivo       → todo dia às 8h
//  - avisarAniversariantes        → todo dia às 8h
//  - enviarAlertasProgramaRelacionamento → todo dia às 8h
//  - enviarResumoSemanal          → toda segunda-feira às 8h
// ============================================================

function configurarGatilhos() {
  // Remove gatilhos antigos para evitar duplicatas
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));

  // Alerta de renovação 15 dias antes — todo dia às 8h
  ScriptApp.newTrigger("enviarAlertaDefinitivo")
    .timeBased().everyDays(1).atHour(8).create();

  // Aniversariantes — todo dia às 8h
  ScriptApp.newTrigger("avisarAniversariantes")
    .timeBased().everyDays(1).atHour(8).create();

  // Régua de relacionamento — todo dia às 8h
  ScriptApp.newTrigger("enviarAlertasProgramaRelacionamento")
    .timeBased().everyDays(1).atHour(8).create();

  // Resumo semanal — toda segunda-feira às 8h
  ScriptApp.newTrigger("enviarResumoSemanal")
    .timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(8).create();

  SpreadsheetApp.getActiveSpreadsheet().toast(
    "4 gatilhos ativos!\n• Alertas renovação: todo dia 8h\n• Aniversários: todo dia 8h\n• Régua relacionamento: todo dia 8h\n• Resumo semanal: toda segunda 8h",
    "Automação completa ativa!", 10
  );

  Logger.log("Gatilhos configurados com sucesso!");
}
