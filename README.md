# 🏢 Automatizando uma Corretora de Seguros do Zero

Esse projeto nasceu de um problema real: eu trabalhava numa corretora de seguros e via todo dia quanto tempo era perdido em tarefas manuais — mandar e-mail de renovação, copiar lead do WhatsApp pro sistema, atualizar planilha na mão.

Decidi resolver isso. Fui aprendendo e construindo ao mesmo tempo, usando a própria corretora como laboratório. Hoje o sistema roda em produção e automatiza praticamente todo o operacional da empresa.

---

## O que o sistema faz

### 📊 Planilha inteligente (Google Sheets + Apps Script)
A planilha deixou de ser só uma tabela e virou o centro de controle da operação.

- **Alertas automáticos de renovação** — 15 dias antes do vencimento, o corretor responsável recebe um e-mail com todos os dados do cliente, link direto pro WhatsApp e valor da comissão
- **Alertas de aniversário** — todo dia de manhã o sistema verifica quem faz aniversário e avisa o corretor para entrar em contato
- **Cálculo automático de comissão** — ao digitar o prêmio, a comissão já é calculada na hora
- **Preenchimento automático de e-mail do corretor** — ao selecionar o nome, o e-mail é buscado automaticamente numa aba de configurações
- **Resumo semanal por e-mail** — toda segunda de manhã chega um resumo com vendas da semana, renovações feitas e vencimentos dos próximos 30 dias

### 🔗 Pipeline de Follow-up
Quando um novo cliente é cadastrado, ele entra automaticamente num pipeline com todos os produtos que ainda não contratou.

- Cada produto tem um prazo de retorno configurável (ex: Seguro Auto = 15 dias, Consórcio = 60 dias)
- Todo dia de manhã chega um e-mail listando quem precisa de contato hoje e quem vence essa semana
- Quando uma apólice é cancelada, o sistema atualiza o status do produto no pipeline automaticamente

### 📈 Dashboard automático
Um painel completo gerado com um clique, sem fórmula manual.

- Total de apólices, prêmio, comissões totais, pagas e a receber
- Vencimentos por faixa (7, 15, 30 e 60 dias)
- Ranking de corretores com percentual de comissão recebida
- Distribuição por seguradora e por produto
- Oportunidades de cross-sell: clientes com auto que ainda não têm residencial, saúde ou consórcio
- Lista de vencimentos urgentes com link direto pro WhatsApp de cada cliente

### 🔄 Histórico de apólices
Renovação e cancelamento com rastreamento completo.

- Ao renovar, os dados da apólice anterior vão pro histórico e a linha principal é atualizada
- Ao cancelar, o cliente vai pra aba "Perdidos ou cancelados" com motivo registrado
- Dá pra consultar todo o histórico de qualquer cliente direto pelo menu

### 🕵️ Radar de Concorrência
Aba para monitorar corretoras concorrentes — status dos anúncios, links da biblioteca do Meta, Instagram, estratégia observada. O sistema alerta quando um concorrente não foi verificado há mais de 30 dias.

### 📱 Integração WhatsApp → HubSpot (via Evolution API + Make)
Essa foi a parte mais complexa do projeto.

Quando chega uma mensagem no WhatsApp da corretora, o fluxo funciona assim:

```
Mensagem no WhatsApp
        ↓
  Evolution API (captura via webhook)
        ↓
     Make (automação)
        ↓
  Busca o número no HubSpot
        ↓
  0 resultados → cria contato + negócio novo
  >0 resultados → vincula ao registro existente
        ↓
  Lead disponível no CRM em tempo real
```

A lógica anti-duplicação foi o ponto mais importante — sem ela, o mesmo contato entrava várias vezes no HubSpot e bagunçava o pipeline de vendas.

### 🌐 Integração Site → HubSpot + Planilha
Formulário preenchido no site cai automaticamente no HubSpot CRM e na planilha de clientes via Make. Zero trabalho manual em nenhuma etapa do funil.

---

## Stack técnica

| Ferramenta | Como foi usada |
|---|---|
| Google Apps Script | Toda a lógica da planilha, e-mails automáticos, gatilhos |
| Google Sheets | Base de dados, dashboard, pipeline, radar |
| HubSpot CRM | Gestão de leads e negócios |
| Make (Integromat) | Integrações entre todos os sistemas |
| Evolution API | Captura de mensagens do WhatsApp via webhook |
| HTML + CSS + JavaScript | Site institucional e landing pages |
| GitHub | Versionamento e documentação |

---

## Estrutura do projeto

```
automatizando-corretora-do-zero/
├── scripts/
│   ├── corretora.gs          # Script principal — planilha, pipeline, dashboard
│   └── whatsapp-evolution.gs # Integração Evolution API + webhook
├── site/                     # Site institucional (em construção)
└── README.md
```

---

## O que aprendi construindo isso

Esse projeto me ensinou mais do que qualquer curso. Alguns pontos que ficaram:

- **APIs REST na prática** — autenticação por header, payload JSON, tratamento de erro HTTP 404, diferença entre POST e GET em contexto real
- **Lógica de deduplicação** — o problema de criar registros duplicados é clássico em qualquer sistema de CRM. Aprendi a resolver com uma busca antes de criar
- **Webhooks** — entender que o sistema precisa "escutar" um evento externo, não ficar perguntando se tem algo novo
- **Gatilhos baseados em tempo** — como automatizar tarefas recorrentes sem depender de alguém lembrar de rodar
- **Pensar em erro** — `try/catch` não é só sintaxe. É a diferença entre um sistema que quebra silenciosamente e um que avisa quando algo deu errado

---

## Progresso

- [x] Planilha inteligente com alertas automáticos de renovação
- [x] Alertas automáticos de aniversário
- [x] Cálculo automático de comissão
- [x] Pipeline de follow-up com alertas diários
- [x] Dashboard completo gerado automaticamente
- [x] Histórico de apólices com renovação e cancelamento
- [x] Radar de Concorrência
- [x] Resumo semanal por e-mail
- [x] Integração WhatsApp → HubSpot via Evolution API + Make
- [x] Integração Site → HubSpot + Planilha via Make
- [ ] Site institucional completo
- [ ] Landing pages por produto

---

## Sobre o projeto

Sou estudante de Sistemas de Informação (3º semestre) e trabalho numa corretora de seguros. Em vez de esperar terminar a faculdade para aplicar o que aprendo, decidi usar a própria empresa como ambiente real de desenvolvimento.

Cada automação aqui resolve um problema que eu via acontecer todo dia. Isso fez toda a diferença — quando o problema é real, a motivação para resolver é diferente.

**[@luquette-dev](https://github.com/luquette-dev)**
