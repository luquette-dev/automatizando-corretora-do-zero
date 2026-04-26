# 📊 Planilha Inteligente — SRS Corretora

Sistema completo de gestão de clientes construído no Google Sheets com automações em Google Apps Script.

---

## 🗂️ Abas da Planilha

| Aba | Função |
|---|---|
| Todos os clientes | Banco de dados completo com apólices, vencimentos e alertas de cores automáticos |
| Oportunidades do Mês | Cross-sell inteligente com sistema de score de prioridade |
| Aniversários | Aniversariantes do mês atual gerados automaticamente |
| Radar de Concorrência | Monitoramento de anúncios e estratégias dos concorrentes |
| Dashboard | Visão geral da carteira com faturamento, gráficos e renovações |
| Perdidos ou cancelados | Histórico de apólices não renovadas |

---

## ⚙️ Automações (Google Apps Script)

### 🔔 Alerta de Renovação
- Roda automaticamente todo dia via gatilho programado
- Verifica apólices com vencimento em **15 dias**
- Envia e-mail automático para o corretor responsável
- Marca a coluna P como `ENVIADO` para evitar reenvios duplicados
- Cores automáticas: 🔴 Vermelho = vencida · 🟡 Amarelo = vence em 15 dias

### 🎂 Alerta de Aniversário
- Verifica diariamente os aniversários dos clientes
- Envia e-mail automático para o corretor com **link direto para o WhatsApp do cliente**
- Fortalece o relacionamento e gera indicações

### ⚡ Organização e Comissão Automática
- Ordena a tabela por data de vencimento ao editar qualquer linha
- Preenche e-mail do corretor automaticamente ao selecionar o nome
- Calcula comissão automaticamente ao informar prêmio e percentual

---

## 🏆 Sistema de Score de Oportunidades

Fórmula `ARRAYFORMULA` com `LET` que calcula prioridade de cada cliente automaticamente:

| Situação | Pontos |
|---|---|
| 🔥 Apólice vence esse mês | +3 |
| 📅 Apólice vence mês que vem | +2 |
| 🎂 Aniversário esse mês | +1 |
| ⚠️ Inadimplente | -5 |

**Resultado:** `Score: 4 | 🔥 Vence este mês 🎂 Aniversário`

```excel
=ARRAYFORMULA(SE(A2:A=""; "";
  SEERRO(
    LET(
      venc; SEERRO(PROCV(A2:A; 'Todos os clientes'!A:E; 5; 0); 0);
      nasc; SEERRO(PROCV(A2:A; 'Todos os clientes'!A:Q; 17; 0); 0);
      status; SEERRO(PROCV(A2:A; 'Todos os clientes'!A:O; 15; 0); "");
      pt_venc; SE(venc=0; 0; SE(MÊS(venc)=MÊS(HOJE()); 3; SE(MÊS(venc)=MÊS(DATAM(HOJE();1)); 2; 0)));
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

## 🔄 Cross-Sell — Oportunidades do Mês

Identifica clientes com seguro auto que ainda não têm residencial, saúde ou consórcio:

```excel
=SORT(UNIQUE(FILTER('Todos os clientes'!A2:A;
  ÉNÚM(LOCALIZAR("AUTO"; 'Todos os clientes'!B2:B));
  NÃO(ÉNÚM(LOCALIZAR("INADIMPLENTE"; 'Todos os clientes'!O2:O)));
  'Todos os clientes'!A2:A <> ""
)); 1; VERDADEIRO)
```

---

## 🎂 Aniversários do Mês

Filtra e exibe apenas os aniversariantes do mês atual, ordenados por data:

```excel
={ "SEGURADO" \ "TIPO" \ "CORRETOR" \ "SEGURADORA" \ "ANIVERSÁRIO" \ "CELULAR";
  SORT(
    SORTN(
      FILTER(
        {'Todos os clientes'!A2:B \ 'Todos os clientes'!H2:H \
         'Todos os clientes'!M2:M \ 'Todos os clientes'!Q2:Q \
         'Todos os clientes'!N2:N};
        MÊS('Todos os clientes'!Q2:Q) = MÊS(HOJE())
      ); 999999; 2; 1; 1
    ); 5; VERDADEIRO
  )
}
```

---

## 🕵️ Radar de Concorrência

Gera automaticamente links da Biblioteca de Anúncios do Facebook e perfil do Instagram de cada concorrente:

```excel
=ARRAYFORMULA(SE(A2:A<>"";
  "https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=BR&q="
  & ENCODEURL(A2:A) & "&search_type=keyword_unordered"; ""))

=ARRAYFORMULA(SE(A2:A<>"";
  "https://www.instagram.com/" & MINÚSCULA(SUBSTITUIR(A2:A; " "; "")); ""))
```

**Campos monitorados:** Nome · Link de anúncios · Status · Última verificação · Observações · Instagram · Post campeão · Estilo de atendimento · Resumo da estratégia

---

## 📸 Dashboard

![Dashboard Cross-Sell](images/dashboard-crossell_1.png)
![Dashboard Faturamento](images/dashboard-faturamento_1.png)

---

## 📁 Arquivos
planilha-inteligente/
├── README.md
├── alerta-renovacao.gs
├── alerta-aniversario.gs
└── organizacao-e-comissao.gs

---

*Parte do projeto [automatizando-corretora-do-zero](https://github.com/luquette-dev/automatizando-corretora-do-zero)*
