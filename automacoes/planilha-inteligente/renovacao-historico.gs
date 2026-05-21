// ============================================================
//  RENOVAÇÃO COM HISTÓRICO
//  Corretora de Seguros — Google Apps Script
//
//  Adiciona o menu "Corretora" na planilha com as opções:
//  - Renovar apólice selecionada
//  - Cancelar / Perder apólice
//  - Ver histórico do cliente
//  - Criar aba Histórico (primeira vez)
// ============================================================

const CONFIG = {
  aba_clientes:  "Todos os clientes",
  aba_historico: "Historico de Apolices",
  aba_perdidos:  "Perdidos ou cancelados",

  col_segurado:       1,
  col_tipo:           2,
  col_modelo:         3,
  col_apolice:        4,
  col_vencimento:     5,
  col_bonus:          6,
  col_premio:         7,
  col_corretor:       8,
  col_email_corretor: 9,
  col_comissao_pct:  10,
  col_comissao_val:  11,
  col_pago:          12,
  col_seguradora:    13,
  col_celular:       14,
  col_obs:           15,
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Corretora")
    .addItem("🔄 Renovar apólice selecionada",             "renovarApolice")
    .addItem("❌ Cancelar / Perder apólice selecionada",   "cancelarApolice")
    .addSeparator()
    .addItem("📋 Ver histórico do cliente",                "verHistoricoCliente")
    .addSeparator()
    .addItem("📊 Enviar resumo semanal agora",             "enviarResumoSemanal")
    .addItem("💬 Disparar régua de relacionamento agora",  "enviarAlertasProgramaRelacionamento")
    .addSeparator()
    .addItem("⚙️  Organizar aba Oportunidades (1ª vez)",   "corrigirEOrganizarColunas")
    .addItem("⚙️  Criar aba Histórico (1ª vez)",           "criarAbaHistorico")
    .addToUi();
}

function configurarMenu() {
  onOpen();
  SpreadsheetApp.getActiveSpreadsheet().toast(
    "Menu 'Corretora' adicionado com sucesso!",
    "Configuração concluída", 5
  );
}

function criarAbaHistorico() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  if (ss.getSheetByName(CONFIG.aba_historico)) {
    SpreadsheetApp.getUi().alert("A aba '" + CONFIG.aba_historico + "' já existe!");
    return;
  }

  const aba = ss.insertSheet(CONFIG.aba_historico);

  const cabecalho = [
    "SEGURADO", "TIPO", "MODELO", "APÓLICE",
    "VENCIMENTO ORIGINAL", "CLASSE BÔNUS", "PRÊMIO (R$)", "CORRETOR",
    "EMAIL CORRETOR", "COMISSÃO %", "VALOR COMISSÃO", "FOI PAGO?",
    "SEGURADORA", "CELULAR", "OBSERVAÇÕES",
    "STATUS", "DATA ARQUIVAMENTO", "NOVO PRÊMIO (R$)", "OBS. DA RENOVAÇÃO"
  ];

  aba.getRange(1, 1, 1, cabecalho.length).setValues([cabecalho]);

  const headerRange = aba.getRange(1, 1, 1, cabecalho.length);
  headerRange.setBackground("#1a1a2e");
  headerRange.setFontColor("#ffffff");
  headerRange.setFontWeight("bold");
  headerRange.setFontSize(11);

  aba.setColumnWidth(1, 200);
  aba.setColumnWidth(4, 160);
  aba.setColumnWidth(5, 140);
  aba.setColumnWidth(16, 120);
  aba.setColumnWidth(17, 160);
  aba.setColumnWidth(19, 220);
  aba.setFrozenRows(1);

  ss.toast("Aba '" + CONFIG.aba_historico + "' criada com sucesso!", "Pronto", 4);
}

function renovarApolice() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const ui    = SpreadsheetApp.getUi();
  const sheet = ss.getSheetByName(CONFIG.aba_clientes);

  if (!ss.getSheetByName(CONFIG.aba_historico)) {
    ui.alert("Atenção", "Crie a aba Histórico primeiro:\nMenu Corretora > Criar aba Histórico (1ª vez)", ui.ButtonSet.OK);
    return;
  }

  const linha = sheet.getActiveCell().getRow();
  if (linha <= 1) { ui.alert("Selecione uma linha de cliente antes de renovar."); return; }

  const dados        = sheet.getRange(linha, 1, 1, 20).getValues()[0];
  const nomeSegurado = dados[CONFIG.col_segurado - 1];
  const apoliceAtual = dados[CONFIG.col_apolice - 1];

  if (!nomeSegurado) { ui.alert("Linha vazia. Selecione uma linha com dados de cliente."); return; }

  const confirmacao = ui.alert(
    "Renovar apólice",
    "Confirma a renovação de:\n\nCliente:  " + nomeSegurado + "\nApólice:  " + apoliceAtual +
    "\n\nO registro atual será arquivado no Histórico e\na linha será atualizada com os novos dados.",
    ui.ButtonSet.YES_NO
  );
  if (confirmacao !== ui.Button.YES) return;

  const novaApolice    = ui.prompt("Renovação — 1/3", "Número da NOVA apólice:", ui.ButtonSet.OK_CANCEL);
  if (novaApolice.getSelectedButton() !== ui.Button.OK) return;

  const novoVencimento = ui.prompt("Renovação — 2/3", "Novo vencimento (dd/mm/aaaa):", ui.ButtonSet.OK_CANCEL);
  if (novoVencimento.getSelectedButton() !== ui.Button.OK) return;

  const novoPremio     = ui.prompt("Renovação — 3/3", "Novo prêmio líquido (apenas número, ex: 2500.00):", ui.ButtonSet.OK_CANCEL);
  if (novoPremio.getSelectedButton() !== ui.Button.OK) return;

  const obsRenovacao   = ui.prompt("Observação (opcional)", "Alguma observação sobre essa renovação?", ui.ButtonSet.OK_CANCEL);

  _arquivarNoHistorico(
    dados, "RENOVADA",
    novoVencimento.getResponseText().trim(),
    novoPremio.getResponseText().trim(),
    obsRenovacao.getResponseText().trim()
  );

  const dataVenc = _parseDateBR(novoVencimento.getResponseText().trim());
  sheet.getRange(linha, CONFIG.col_apolice).setValue(novaApolice.getResponseText().trim());
  sheet.getRange(linha, CONFIG.col_vencimento).setValue(dataVenc || novoVencimento.getResponseText().trim());
  sheet.getRange(linha, CONFIG.col_premio).setValue(parseFloat(novoPremio.getResponseText().replace(",", ".")) || novoPremio.getResponseText().trim());
  sheet.getRange(linha, CONFIG.col_pago).setValue(false);
  sheet.getRange(linha, 16).setValue("");

  const pctComissao = dados[CONFIG.col_comissao_pct - 1];
  if (pctComissao && !isNaN(parseFloat(pctComissao))) {
    const novoValComissao = parseFloat(novoPremio.getResponseText().replace(",", ".")) * parseFloat(pctComissao);
    sheet.getRange(linha, CONFIG.col_comissao_val).setValue(Math.round(novoValComissao * 100) / 100);
  }

  const linhaRange = sheet.getRange(linha, 1, 1, 20);
  linhaRange.setBackground("#d4edda");
  SpreadsheetApp.flush();
  Utilities.sleep(1500);
  linhaRange.setBackground(null);

  ss.toast("Apólice de " + nomeSegurado + " renovada e arquivada no histórico!", "Renovação concluída", 6);
}

function cancelarApolice() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const ui    = SpreadsheetApp.getUi();
  const sheet = ss.getSheetByName(CONFIG.aba_clientes);

  const linha = sheet.getActiveCell().getRow();
  if (linha <= 1) { ui.alert("Selecione uma linha de cliente antes de cancelar."); return; }

  const dados        = sheet.getRange(linha, 1, 1, 20).getValues()[0];
  const nomeSegurado = dados[CONFIG.col_segurado - 1];
  if (!nomeSegurado) { ui.alert("Linha vazia."); return; }

  const confirmacao = ui.alert(
    "Cancelar / Perder apólice",
    "Confirma o cancelamento de:\n\nCliente: " + nomeSegurado +
    "\nApólice: " + dados[CONFIG.col_apolice - 1] +
    "\n\nO registro será movido para 'Perdidos ou cancelados'.",
    ui.ButtonSet.YES_NO
  );
  if (confirmacao !== ui.Button.YES) return;

  const motivoResp = ui.prompt(
    "Motivo da perda / cancelamento:",
    "Ex: Cliente achou preço melhor, vendeu o carro, inadimplência...",
    ui.ButtonSet.OK_CANCEL
  );
  if (motivoResp.getSelectedButton() !== ui.Button.OK) return;

  const abaPerdidos = ss.getSheetByName(CONFIG.aba_perdidos);
  if (!abaPerdidos) { ui.alert("Aba 'Perdidos ou cancelados' não encontrada."); return; }

  const proximaLinhaPerdidos = abaPerdidos.getLastRow() + 1;
  const linhaCompleta = [...dados.slice(0, 15), motivoResp.getResponseText().trim(), new Date()];
  abaPerdidos.getRange(proximaLinhaPerdidos, 1, 1, linhaCompleta.length).setValues([linhaCompleta]);

  _arquivarNoHistorico(dados, "CANCELADA", "", "", motivoResp.getResponseText().trim());
  sheet.deleteRow(linha);

  ss.toast(nomeSegurado + " movido para 'Perdidos ou cancelados'.", "Cancelamento registrado", 5);
}

function verHistoricoCliente() {
  const ss      = SpreadsheetApp.getActiveSpreadsheet();
  const ui      = SpreadsheetApp.getUi();
  const sheet   = ss.getSheetByName(CONFIG.aba_clientes);
  const abaHist = ss.getSheetByName(CONFIG.aba_historico);

  if (!abaHist) { ui.alert("Crie a aba Histórico primeiro:\nMenu Corretora > Criar aba Histórico (1ª vez)"); return; }

  const linha = sheet.getActiveCell().getRow();
  if (linha <= 1) { ui.alert("Selecione um cliente para ver o histórico."); return; }

  const nomeSegurado = sheet.getRange(linha, CONFIG.col_segurado).getValue();
  if (!nomeSegurado) { ui.alert("Linha vazia."); return; }

  const dadosHist = abaHist.getDataRange().getValues();
  const registros = dadosHist.filter((r, i) =>
    i > 0 && r[0].toString().toLowerCase() === nomeSegurado.toString().toLowerCase()
  );

  if (registros.length === 0) {
    ui.alert("Histórico de " + nomeSegurado, "Nenhum registro ainda.\nAs renovações e cancelamentos futuros aparecerão aqui.", ui.ButtonSet.OK);
    return;
  }

  let msg = registros.length + " registro(s) encontrado(s):\n\n";
  registros.forEach((r, i) => {
    const dataArq = r[16] ? Utilities.formatDate(new Date(r[16]), "America/Sao_Paulo", "dd/MM/yyyy") : "—";
    const venc    = r[4]  ? Utilities.formatDate(new Date(r[4]),  "America/Sao_Paulo", "dd/MM/yyyy") : "—";
    msg += (i + 1) + ". " + r[1] + " — " + r[12] + "\n";
    msg += "   Apólice: " + r[3] + "\n";
    msg += "   Vencimento: " + venc + " | Prêmio: R$ " + r[6] + "\n";
    msg += "   Status: " + r[15] + " em " + dataArq + "\n\n";
  });

  ui.alert("Histórico — " + nomeSegurado, msg, ui.ButtonSet.OK);
}

// ── Funções internas ──────────────────────────────────────

function _arquivarNoHistorico(dados, status, novoVencimento, novoPremio, obs) {
  const ss      = SpreadsheetApp.getActiveSpreadsheet();
  const abaHist = ss.getSheetByName(CONFIG.aba_historico);
  if (!abaHist) return;

  const proximaLinha = abaHist.getLastRow() + 1;
  const registro = [
    dados[CONFIG.col_segurado - 1],    dados[CONFIG.col_tipo - 1],
    dados[CONFIG.col_modelo - 1],      dados[CONFIG.col_apolice - 1],
    dados[CONFIG.col_vencimento - 1],  dados[CONFIG.col_bonus - 1],
    dados[CONFIG.col_premio - 1],      dados[CONFIG.col_corretor - 1],
    dados[CONFIG.col_email_corretor - 1], dados[CONFIG.col_comissao_pct - 1],
    dados[CONFIG.col_comissao_val - 1],dados[CONFIG.col_pago - 1],
    dados[CONFIG.col_seguradora - 1],  dados[CONFIG.col_celular - 1],
    dados[CONFIG.col_obs - 1],         status,
    new Date(), novoPremio, obs
  ];

  abaHist.getRange(proximaLinha, 1, 1, registro.length).setValues([registro]);
  const cor = status === "RENOVADA" ? "#d4edda" : "#f8d7da";
  abaHist.getRange(proximaLinha, 1, 1, registro.length).setBackground(cor);
  abaHist.getRange(proximaLinha, 17).setNumberFormat("dd/mm/yyyy");
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
