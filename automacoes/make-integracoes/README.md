# 🔗 Integrações Make — SRS Corretora

Automações construídas no Make (ex-Integromat) conectando WhatsApp, site, HubSpot CRM e Google Sheets.

---

## 🏗️ Arquitetura Geral

```
WhatsApp (Evolution API)
        │
        ▼
     Make (Fluxo 3)
        │
        ├── Novo lead ──────► HubSpot: Cria Contato + Abre Negócio
        └── Cliente antigo ──► HubSpot: Abre Negócio (vincula ao contato existente)

Formulário do site
        │
        ▼
     Make (Fluxo 2)
        │
        ├──────────────────► HubSpot CRM (novo lead)
        └──────────────────► Google Sheets (aba leads)

HubSpot CRM (Venda Fechada)
        │
        ▼
     Make (Fluxo 1)
        │
        ▼
  Google Sheets (nova linha em "Todos os clientes")
        │
        ▼
  Alertas de renovação + Régua de relacionamento (Apps Script)
```

---

## 🔄 Fluxos Ativos

### Fluxo 1 — Venda Fechada no HubSpot → Planilha

Quando um negócio é marcado como **ganho** no HubSpot CRM, o cliente migra automaticamente para a aba de clientes no Google Sheets.

```
HubSpot CRM (negócio ganho)
        ↓
     Make
        ↓
Google Sheets (nova linha em "Todos os clientes")
```

**Resultado:** zero trabalho manual na migração de lead para cliente. Assim que entra na planilha, os alertas de renovação e a régua de relacionamento já entram em ação automaticamente.

---

### Fluxo 2 — Formulário do Site → HubSpot + Planilha

Quando um visitante preenche o formulário no site da SRS Corretora, o lead entra simultaneamente no CRM e na planilha.

```
Formulário do site (visitante preenche)
        ↓
      Make
      ↓       ↓
 HubSpot    Google Sheets
   CRM       (aba leads)
```

**Resultado:** nenhum lead se perde, tudo centralizado automaticamente.

---

### Fluxo 3 — WhatsApp → HubSpot CRM *(novo)*

Qualquer mensagem recebida de um contato novo no WhatsApp cria automaticamente um lead no HubSpot com nome e número capturados em tempo real.

```
WhatsApp (Evolution API → messages.upsert)
        ↓
      Make
        ↓
   Busca no HubSpot pelo telefone (anti-duplicação)
        ↓
   Router condicional
        ├── 0 resultados → Cria Contato + Abre Negócio
        └── > 0 resultados → Abre Negócio (vincula ao ID existente)
```

**Inteligência anti-duplicação:** antes de criar qualquer registro, o fluxo busca o número no HubSpot. Se o contato já existir, apenas abre um novo negócio vinculado — o CRM nunca fica com cadastros repetidos.

**Campos capturados automaticamente:**

| Campo | Origem |
|---|---|
| Nome | `pushName` (nome do perfil WhatsApp) |
| Telefone | `sender` (número com DDI) |
| Origem | `WhatsApp` (fixo) |

**Resultado:** todo contato que manda mensagem vira lead no CRM sem nenhuma ação manual.

---

## 🛠️ Camada de Desenvolvimento Customizado

Para garantir a comunicação entre o Google Apps Script e a Evolution API v2, foram desenvolvidos scripts com `UrlFetchApp` que automatizam o registro e ativação dos webhooks:

```javascript
// Registro de webhook via Apps Script
function registrarWebhook() {
  var url     = "https://sua-instancia.render.com/webhook/set/instancia";
  var payload = {
    webhook: {
      enabled: true,
      url: "https://hook.make.com/seu-webhook",
      events: ["MESSAGES_UPSERT"]
    }
  };

  var options = {
    method: "POST",
    contentType: "application/json",
    headers: { "apikey": "SUA_API_KEY" },
    payload: JSON.stringify(payload)
  };

  var response = UrlFetchApp.fetch(url, options);
  Logger.log(response.getContentText());
}
```

**O que os scripts fazem:**
- Registro de webhooks na Evolution API v2 via `POST`
- Ativação de instâncias com payloads JSON estruturados
- Tratamento de erros HTTP (correção de retornos `404`)
- Gerenciamento de cabeçalhos e chaves de autenticação

---

## 🧠 Competências Técnicas Aplicadas

| Competência | Como foi aplicada |
|---|---|
| Arquitetura híbrida | No-Code (Make) + código próprio (JavaScript / Apps Script) |
| Consumo de APIs REST | Requisições GET e POST com headers, autenticação e tratamento de retorno |
| Lógica condicional | Router no Make com filtros por `Total number of bundles` |
| Variáveis dinâmicas | `sender`, `pushName`, `Record ID` mapeados entre sistemas em tempo real |
| Anti-duplicação | Busca prévia no HubSpot antes de qualquer criação de registro |
| Engenharia de processos | Problema analógico de negócio → solução automatizada escalável |

---

## 🔧 Stack Técnica

| Ferramenta | Função |
|---|---|
| Make (Integromat) | Orquestração de todos os cenários |
| Evolution API v2 | Interface com WhatsApp Business |
| HubSpot CRM | Gestão de contatos, negócios e funil |
| Google Sheets | Banco de dados operacional da corretora |
| Google Apps Script | Registro e ativação de webhooks |
| Render.com | Hospedagem da Evolution API |
| Webhooks | Comunicação em tempo real entre sistemas |

---

## 📁 Estrutura de Arquivos

```
make-integracoes/
├── README.md
├── fluxo-1-hubspot-sheets.md       # Venda fechada → planilha
├── fluxo-2-formulario-hubspot.md   # Formulário do site → CRM + planilha
└── fluxo-3-whatsapp-hubspot.md     # WhatsApp → CRM (com anti-duplicação)
```

---

## 📸 Preview

> *Prints dos fluxos do Make em breve*

---

*Parte do projeto [automatizando-corretora-do-zero](https://github.com/luquette-dev/automatizando-corretora-do-zero)*
