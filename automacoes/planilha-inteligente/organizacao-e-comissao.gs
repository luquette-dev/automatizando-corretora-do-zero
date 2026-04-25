/**
 * Organização e Comissão — SRS Corretora
 * - Organiza a tabela por data de vencimento ao editar
 * - Preenche e-mail do corretor automaticamente ao selecionar o nome
 * - Calcula comissão ao informar prêmio e percentual
 */
function organizarTudo() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const aba = ss.getSheetByName("Todos os clientes");
  const ultimaLinha = aba.getLastRow();
  if (ultimaLinha < 2) return;
  const intervalo = aba.getRange(2, 1, ultimaLinha - 1, 15);
  intervalo.sort({ column: 5, ascending: true });
}

function onEdit(e) {
  const ss = e.source;
  const abaPrincipal = ss.getActiveSheet();
  if (abaPrincipal.getName() !== "Todos os clientes") return;

  const rangeEditado = e.range;
  const colunaEditada = rangeEditado.getColumn();
  const linhaEditada = rangeEditado.getRow();
  const ultimaLinha = abaPrincipal.getLastRow();

  if (linhaEditada < 2) return;

  // 1. Preenche e-mail do corretor automaticamente (Coluna H → I)
  if (colunaEditada === 8) {
    const nomeCorretor = rangeEditado.getValue();
    const abaConfig = ss.getSheetByName("Configuracoes");
    const dadosConfig = abaConfig.getRange("A2:B" + abaConfig.getLastRow()).getValues();
    let emailEncontrado = "";
    for (let i = 0; i < dadosConfig.length; i++) {
      if (dadosConfig[i][0] === nomeCorretor) {
        emailEncontrado = dadosConfig[i][1];
        break;
      }
    }
    abaPrincipal.getRange(linhaEditada, 9).setValue(emailEncontrado);
  }

  // 2. Calcula comissão (Prêmio G × Percentual J → resultado K)
  if (colunaEditada === 7 || colunaEditada === 10) {
    const dados = abaPrincipal.getRange(2, 7, ultimaLinha - 1, 4).getValues();
    const resultadosK = [];
    for (let i = 0; i < dados.length; i++) {
      let valorBruto = dados[i][0];
      let porcentagem = dados[i][3];
      let premioNum = 0;
      if (typeof valorBruto === "number") {
        premioNum = valorBruto;
      } else {
        let textoLimpo = valorBruto.toString().replace("R$", "").replace(/\s/g, "");
        if (textoLimpo.includes(".") && textoLimpo.includes(",")) {
          textoLimpo = textoLimpo.replace(/\./g, "").replace(",", ".");
        } else {
          textoLimpo = textoLimpo.replace(",", ".");
        }
        premioNum = parseFloat(textoLimpo);
      }
      if (!isNaN(premioNum) && !isNaN(porcentagem) && porcentagem !== "") {
        resultadosK.push([Math.round(premioNum * porcentagem * 100) / 100]);
      } else {
        resultadosK.push([""]);
      }
    }
    abaPrincipal.getRange(2, 11, resultadosK.length, 1).setValues(resultadosK);
  }

  // 3. Organiza por data ao editar coluna de vencimento (E)
  if (colunaEditada === 5) {
    organizarTudo();
  }
}
