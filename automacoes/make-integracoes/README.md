# 🔗 Integrações Make — SRS Corretora

Automações construídas no Make (ex-Integromat) conectando o site, HubSpot CRM e Google Sheets.

---

## 🔄 Fluxos Ativos

### Fluxo 1 — Venda Fechada no HubSpot → Planilha
Quando um negócio é marcado como **ganho** no HubSpot CRM, o cliente migra automaticamente para a aba de clientes no Google Sheets.
HubSpot CRM (negócio ganho)
↓
Make (automação)
↓
Google Sheets (nova linha na aba "Todos os clientes")

**Resultado:** zero trabalho manual na migração de lead para cliente.

---

### Fluxo 2 — Formulário do Site → HubSpot + Planilha
Quando um visitante preenche o formulário no site da SRS Corretora, o lead entra simultaneamente no CRM e na planilha.
Formulário do site (visitante preenche)
↓
Make (automação)
↓       ↓
HubSpot    Google Sheets
CRM       (aba leads)

**Resultado:** nenhum lead se perde, tudo centralizado automaticamente.

---

## 🛠️ Tecnologias

- Make (Integromat)
- HubSpot CRM
- Google Sheets
- Webhooks

---

## 📸 Preview

> *Prints dos fluxos do Make em breve*

---

*Parte do projeto [automatizando-corretora-do-zero](https://github.com/luquette-dev/automatizando-corretora-do-zero)*
