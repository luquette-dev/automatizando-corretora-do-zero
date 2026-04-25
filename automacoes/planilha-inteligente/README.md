# 📊 Planilha Inteligente — SRS Corretora

Sistema completo de gestão de clientes construído no Google Sheets com automações em Google Apps Script.

---

## 🗂️ Abas da Planilha

| Aba | Função |
|---|---|
| Todos os clientes | Cadastro completo com apólices, vencimentos e corretores |
| Oportunidades do Mês | Leads quentes priorizados pelo sistema de score |
| Aniversários | Clientes com aniversário no mês para contato |
| Radar de Concorrência | Monitoramento de anúncios e estratégias dos concorrentes |
| Dashboard | Visão geral da carteira em tempo real |
| Perdidos ou cancelados | Histórico de apólices não renovadas |

---

## ⚙️ Automações (Google Apps Script)

### 🔔 Alerta de Renovação
- Roda automaticamente todo dia via gatilho programado
- Verifica apólices com vencimento em **15 dias**
- Envia e-mail automático para o corretor responsável
- Marca a coluna de status como `ENVIADO` para evitar reenvios duplicados

### 🎂 Alerta de Aniversário
- Verifica diariamente os aniversários dos clientes
- Envia e-mail automático para o corretor lembrar de parabenizar
- Fortalece o relacionamento com a carteira

### 🏆 Sistema de Score de Oportunidades
- Usa `ARRAYFORMULA` para calcular score de cada cliente automaticamente
- Pontua por:
  - 🔥 +3 pontos — apólice vence esse mês
  - 📅 +2 pontos — apólice vence mês que vem
  - 🎂 +1 ponto — aniversário esse mês
  - ⚠️ -5 pontos — inadimplente
- Resultado aparece como: `Score: 4 | 🔥 Vence este mês 🎂 Aniversário`

### 🔗 Integração com HubSpot via Make
- Quando uma venda é fechada no HubSpot CRM, o cliente cai automaticamente na planilha
- Zero trabalho manual na migração de lead para cliente

---

## 🛠️ Tecnologias

- Google Sheets
- Google Apps Script (JavaScript)
- Make (Integromat)
- HubSpot CRM

---

## 📸 Preview

> *Prints da planilha em funcionamento em breve*

---

## 📁 Arquivos
planilha-inteligente/
├── README.md
├── alerta-renovacao.gs       # Script de alerta 15 dias antes do vencimento
├── alerta-aniversario.gs     # Script de alerta de aniversário
└── score-oportunidades.gs    # Fórmula de score de clientes

---

*Parte do projeto [automatizando-corretora-do-zero](https://github.com/luquette-dev/automatizando-corretora-do-zero)*
