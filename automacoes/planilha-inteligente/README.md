# 📊 Planilha Inteligente — SRS Corretora

Antes dessa planilha, a operação da corretora era manual: renovações esquecidas, leads perdidos, comissão calculada na mão. Construí esse sistema do zero para resolver cada um desses problemas — uma automação por vez.

Hoje a planilha funciona como o sistema operacional da corretora. Cada vencimento é alertado no prazo certo, cada aniversário chega pro corretor com link de WhatsApp, cada venda fechada atualiza o histórico automaticamente.

---

## O que tem dentro

### Abas da planilha

| Aba | Função |
|---|---|
| Todos os clientes | Banco de dados completo com apólices, vencimentos e alertas visuais automáticos |
| Oportunidades do Mês | Cross-sell com sistema de score de prioridade e régua de relacionamento |
| Aniversários | Aniversariantes do mês atual gerados automaticamente por fórmula |
| Radar de Concorrência | Monitoramento de anúncios e estratégias dos concorrentes |
| Dashboard | Visão geral da carteira com KPIs, faturamento e renovações |
| Perdidos ou cancelados | Histórico de apólices não renovadas com motivo da perda |
| Histórico de Apólices | Registro permanente de todas as renovações — nada é apagado jamais |

---

## Automações (Google Apps Script)

### Alerta de renovação
Roda todo dia às 8h via gatilho programado. Verifica apólices com vencimento em 15 dias e manda e-mail para o corretor responsável com todos os dados do cliente — seguradora, número da apólice, prêmio, comissão e link direto para o WhatsApp.

Antes de enviar, verifica se o alerta já foi mandado para aquele cliente. Se sim, pula. Isso evita que o corretor receba o mesmo e-mail várias vezes.

A planilha também aplica cores automaticamente: vermelho para apólices vencidas, amarelo para as que vencem em 15 dias.

### Alerta de aniversário
Todo dia o script verifica quem faz aniversário e manda e-mail para o corretor com o nome do cliente e link direto para o WhatsApp. Uma mensagem de parabéns no dia certo gera indicações — isso é relacionamento.

### Cálculo automático de comissão
Ao selecionar o nome do corretor, o e-mail dele é preenchido automaticamente a partir de uma aba de configurações. Ao digitar o prêmio e o percentual, a comissão é calculada na hora — sem fórmula manual, sem erro.

### Renovação com histórico permanente
Esse foi o mais trabalhoso de construir e o que mais mudou a operação.

Quando uma apólice é renovada pelo menu "Corretora" na planilha:
- Os dados da apólice anterior vão para o Histórico com status **RENOVADA** (em verde)
- A linha principal é atualizada com os novos dados — nova apólice, novo vencimento, novo prêmio
- A comissão é recalculada automaticamente
- Nada é apagado — dá para ver todo o histórico de qualquer cliente com um clique

Quando uma apólice é cancelada:
- O cliente vai para "Perdidos ou cancelados" com o motivo registrado
- O histórico recebe o registro com status **CANCELADA** (em vermelho)
- Se o cliente ainda tiver outros produtos ativos, ele fica no pipeline — só o produto cancelado é atualizado

### Régua de relacionamento
Esse módulo foi construído para gerar cross-sell de forma não invasiva, no momento certo.

O sistema acompanha cada cliente ao longo do ano e aciona o corretor nos momentos de maior abertura:

| Mês do seguro | Produto oferecido |
|---|---|
| Mês 5 (210 dias antes do vencimento) | Residencial — ou Consórcio se já tiver |
| Mês 7 (150 dias antes) | Consórcio |
| Mês 9 (90 dias antes) | Saúde / Vida |

Cada alerta inclui um texto sugerido para WhatsApp, personalizado por produto. A coluna "Fase da Régua" controla em que etapa cada cliente está — o sistema nunca manda o mesmo alerta duas vezes.

**Fases do pipeline de relacionamento:**

| Status | Significado |
|---|---|
| ⏳ Aguardando Régua | Cliente ainda não entrou em nenhuma fase |
| 🏠 Mês 5: Res. Enviado | Alerta de residencial enviado |
| 💰 Mês 7: Cons. Enviado | Alerta de consórcio enviado |
| 🏥 Mês 9: Saúde Enviado | Alerta de saúde/vida enviado |
| ✅ Cross-Sell Fechado! | Venda realizada |
| ❌ Não teve interesse | Registrado manualmente pelo corretor |

### Resumo semanal
Toda segunda-feira às 8h, todos os corretores recebem um e-mail com:
- Vendas dos últimos 7 dias com valor de comissão
- Renovações feitas na semana
- Clientes com score alto que ainda não foram abordados
- Vencimentos previstos nos próximos 30 dias com link de WhatsApp de cada um

---

## Sistema de score de oportunidades

Cada cliente recebe uma pontuação calculada automaticamente por `ARRAYFORMULA`:

| Situação | Pontos |
|---|---|
| Apólice vence esse mês | +3 |
| Apólice vence mês que vem | +2 |
| Aniversário esse mês | +1 |
| Inadimplente | -5 |

Resultado na célula: `Score: 4 | 🔥 Vence este mês 🎂 Aniversário`

A fórmula usa `LET` para calcular tudo numa passagem só, sem colunas auxiliares:

```
=ARRAYFORMULA(SE(A2:A=""; "";
  SEERRO(
    LET(
      venc; SEERRO(PROCV(A2:A; 'Todos os clientes'!A:E; 5; 0); 0);
      nasc; SEERRO(PROCV(A2:A; 'Todos os clientes'!A:Q; 17; 0); 0);
      status; SEERRO(PROCV(A2:A; 'Todos os clientes'!A:O; 15; 0); "");
      pt_venc; SE(venc=0; 0; SE(MÊS(venc)=MÊS(HOJE()); 3;
               SE(MÊS(venc)=MÊS(DATAM(HOJE();1)); 2; 0)));
      pt_nasc; SE(nasc=0; 0; SE(MÊS(nasc)=MÊS(HOJE()); 1; 0));
      pt_inad; SE(ÉNÚM(LOCALIZAR("INADIMPLENTE"; status)); -5; 0);
      score_total; pt_venc + pt_nasc + pt_inad;
      "Score: " & score_total & " | " &
      SE(pt_venc=3; "🔥 Vence este mês"; SE(pt_venc=2; "📅 Vence mês que vem"; "")) & " " &
      SE(pt_nasc=1; "🎂 Aniversário"; "") & " " &
      SE(pt_inad=-5; "⚠️ INADIMPLENTE"; "")
    ); "Score: 0")
))
```

---

## Radar de Concorrência

Aba para monitorar corretoras concorrentes — status dos anúncios, estilo de atendimento, post campeão, estratégia observada.

Os links da Biblioteca de Anúncios do Meta e do Instagram são gerados automaticamente a partir do nome do concorrente:

```
=ARRAYFORMULA(SE(A2:A<>"";
  "https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=BR&q="
  & ENCODEURL(A2:A) & "&search_type=keyword_unordered"; ""))
```

O script alerta toda segunda quando algum concorrente não foi verificado há mais de 30 dias.

---

## Dashboard

> 📸 Prints atualizados em breve — o dashboard passou por melhorias recentes e as imagens anteriores estão desatualizadas.

O dashboard é gerado com um clique e calcula tudo dinamicamente — sem fórmula manual, sem atualização manual.

O que aparece:
- Total de apólices, prêmio total, comissões totais, pagas e a receber
- Inadimplentes e vencimentos por faixa (7, 15, 30 e 60 dias)
- Ranking de corretores com percentual de comissão já recebida
- Distribuição da carteira por seguradora e por produto
- Oportunidades de cross-sell: clientes com auto sem residencial, saúde ou consórcio
- Lista de vencimentos urgentes dos próximos 15 dias com link de WhatsApp de cada cliente

---

## Como instalar

1. Abra sua planilha no Google Sheets
2. Acesse **Extensões → Apps Script**
3. Cole o conteúdo de cada arquivo `.gs` no editor
4. Salve com `Ctrl+S`
5. Execute `configurarMenu` — o menu **Corretora** aparece na barra superior
6. Execute `criarAbaHistorico` — cria a aba de histórico já formatada
7. Execute `corrigirEOrganizarColunas` — organiza a aba Oportunidades
8. Execute `configurarGatilhos` — ativa todas as automações diárias e semanais

> O passo 8 só precisa ser feito uma vez. A partir daí, tudo roda automaticamente.

---

## Estrutura de arquivos

```
planilha-inteligente/
├── README.md
├── alerta-renovacao.gs
├── alerta-aniversario.gs
├── organizacao-e-comissao.gs
├── renovacao-historico.gs
├── regua-relacionamento.gs
├── resumo-semanal.gs
└── configurar-gatilhos.gs
```

---

Parte do projeto **[automatizando-corretora-do-zero](https://github.com/luquette-dev/automatizando-corretora-do-zero)**
