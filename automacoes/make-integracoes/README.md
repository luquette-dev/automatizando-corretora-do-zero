# 🔗 Integrações Make — SRS Corretora

Esse arquivo documenta as automações que construí no Make para conectar WhatsApp, site, HubSpot CRM e Google Sheets numa operação integrada.

O objetivo foi simples: **nenhum lead se perde e nenhuma tarefa depende de alguém lembrar de fazer.**

---

## Como tudo se conecta

```
WhatsApp (Evolution API)
        │
        ▼
   Make — Fluxo 3
        │
        ├── Contato novo ────► HubSpot: cria contato + abre negócio
        └── Contato existente► HubSpot: abre negócio (vincula ao registro existente)

Formulário do site
        │
        ▼
   Make — Fluxo 2
        │
        ├────────────────────► HubSpot CRM (novo lead)
        └────────────────────► Google Sheets (aba leads)

HubSpot CRM — venda fechada
        │
        ▼
   Make — Fluxo 1
        │
        ▼
  Google Sheets ("Todos os clientes")
        │
        ▼
  Alertas de renovação + régua de relacionamento (Apps Script)
```

---

## Fluxo 1 — Venda fechada no HubSpot → Planilha

Quando um negócio é marcado como ganho no HubSpot, o cliente migra automaticamente para a planilha de clientes.

```
HubSpot CRM (negócio ganho)
        ↓
      Make
        ↓
Google Sheets (nova linha em "Todos os clientes")
        ↓
Apps Script entra em ação automaticamente:
  • Calcula comissão
  • Agenda alerta de renovação 15 dias antes do vencimento
  • Adiciona cliente ao pipeline de follow-up
  • Dispara régua de relacionamento
```

**Por que isso importa:** antes dessa automação, a migração de lead para cliente era feita manualmente, linha por linha. Agora acontece em segundos, sem nenhuma ação humana — e já com tudo configurado para o pós-venda.

---

## Fluxo 2 — Formulário do site → HubSpot + Planilha

Quando um visitante preenche o formulário no site, o lead entra simultaneamente no CRM e na planilha.

```
Formulário do site (visitante preenche)
        ↓
      Make
      ↓         ↓
 HubSpot     Google Sheets
  CRM         (aba leads)
```

**Resultado:** nenhum lead cai no esquecimento. Seja qual for o volume de formulários enviados, tudo chega nos dois lugares ao mesmo tempo.

---

## Fluxo 3 — WhatsApp → HubSpot (operação normal + campanhas)

Esse foi o fluxo mais complexo de construir e o que mais impacta a operação.

### Funcionamento no dia a dia

Qualquer mensagem recebida de um número novo no WhatsApp cria automaticamente um lead no HubSpot — com nome e telefone capturados em tempo real via Evolution API.

```
WhatsApp (Evolution API — messages.upsert)
        ↓
      Make
        ↓
   Busca o número no HubSpot
        ↓
   Roteamento condicional
        ├── 0 resultados → cria contato + abre negócio
        └── > 0 resultados → abre negócio (vincula ao contato existente)
```

### Durante campanhas de tráfego pago

Quando rodo campanhas no Meta Ads ou Google Ads, o volume de mensagens aumenta muito. O fluxo foi pensado exatamente para isso — aguenta qualquer volume sem criar duplicatas ou perder contato.

**O que acontece em cada lead de campanha:**

1. Lead clica no anúncio e manda mensagem no WhatsApp
2. Evolution API captura a mensagem via webhook em tempo real
3. Make busca o número no HubSpot antes de qualquer ação
4. Se for novo: cria contato com nome, telefone e origem "WhatsApp" + abre negócio no pipeline
5. Se já existir: só abre negócio novo vinculado ao contato — sem duplicar cadastro
6. Corretor recebe o lead no CRM na hora, pronto para atender

**Campos capturados automaticamente:**

| Campo | Origem |
|---|---|
| Nome | `pushName` — nome do perfil no WhatsApp |
| Telefone | `sender` — número com DDI |
| Origem | "WhatsApp" (fixo) |
| Data de entrada | Timestamp do evento |

**Por que a lógica anti-duplicação é essencial em campanhas:**

Em períodos de campanha ativa, o mesmo número pode mandar mais de uma mensagem — curiosidade, dúvida, retorno. Sem a busca prévia, cada mensagem criaria um contato novo e o CRM viraria uma bagunça. Com o roteamento condicional, o histórico fica limpo independente do volume.

---

## A camada de código por baixo

Para conectar o Google Apps Script com a Evolution API v2, escrevi scripts que registram e ativam os webhooks via código — sem depender de painel visual.

```javascript
function registrarWebhook() {
  var url = "https://sua-instancia.render.com/webhook/set/instancia";
  
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

Isso me deu controle total sobre o registro — consigo reativar o webhook, trocar a URL de destino ou mudar os eventos sem precisar abrir a interface da Evolution API.

---

## O que aprendi construindo esses fluxos

**Webhooks não são mágica.** No começo achei complexo, mas é simples: você registra uma URL e avisa o sistema "quando acontecer X, manda os dados pra cá". O trabalho real é tratar o que chega.

**A ordem das operações importa.** No Fluxo 3, se eu criasse o contato antes de buscar, teria duplicatas. Buscar primeiro, criar depois — essa sequência é o que faz o sistema funcionar bem em escala.

**No-code e código se complementam.** O Make cuida da orquestração visual. O Apps Script cuida do que o Make não consegue fazer nativamente. Juntos, cobrem praticamente qualquer automação de negócio.

**Testar em produção com cautela.** Aprendi a usar números de teste antes de ativar qualquer webhook num ambiente real. Um erro numa campanha ativa pode perder leads.

---

## Stack desse módulo

| Ferramenta | Função |
|---|---|
| Make (Integromat) | Orquestração de todos os fluxos |
| Evolution API v2 | Interface com WhatsApp Business |
| HubSpot CRM | Gestão de contatos, negócios e funil |
| Google Sheets | Base de dados operacional |
| Google Apps Script | Registro de webhooks e automações customizadas |
| Render.com | Hospedagem da Evolution API |

---

## Estrutura de arquivos

```
make-integracoes/
├── README.md
├── fluxo-1-hubspot-sheets.md
├── fluxo-2-formulario-hubspot.md
└── fluxo-3-whatsapp-hubspot.md
```

---

Parte do projeto **[automatizando-corretora-do-zero](https://github.com/luquette-dev/automatizando-corretora-do-zero)**
