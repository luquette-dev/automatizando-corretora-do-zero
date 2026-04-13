# 🏢 Automatizando uma Corretora de Seguros do Zero

Projeto real de automação completa da **SRS Corretora** — uma corretora de seguros que transformei do processo manual para um sistema inteligente usando tecnologia, integrações e automações.

---

## 🚀 O que foi automatizado

### 📊 Planilha Inteligente (Google Sheets)
- Cadastro completo de clientes com histórico de apólices
- **Alertas automáticos de renovação** enviados por e-mail para os corretores antes do vencimento
- **Alertas de aniversário** dos clientes enviados automaticamente por e-mail
- Quando uma venda é fechada no HubSpot, o cliente **cai automaticamente na planilha**
- Dashboard com visão geral da carteira
- Tudo construído com **Google Apps Script**

### 🔗 Integrações via Make
- Venda fechada no **HubSpot CRM** → lead migra automaticamente para a planilha de clientes
- Formulário preenchido no **site** → lead cai direto no HubSpot CRM e na planilha simultaneamente
- Zero trabalho manual em nenhuma etapa do funil

### 🌐 Site SRS Corretora *(em construção)*
- Site institucional moderno e responsivo
- Landing pages individuais para cada produto:
  - Seguro Auto
  - Plano de Saúde
  - Consórcio
- Formulários de captação integrados ao HubSpot e Google Sheets via Make
- Botão direto para WhatsApp em todos os serviços
- Link de compra direta pela Porto Seguro com comissão automática

---

## 🔄 Fluxo completo de automação

```
Cliente preenche formulário no site
             ↓
       Make (automação)
        ↓           ↓
 HubSpot CRM    Planilha Google Sheets
        ↓
 Venda fechada no HubSpot
        ↓
 Cliente migra para planilha
        ↓
 Alertas automáticos de renovação
 e aniversário por e-mail

## 🛠️ Tecnologias utilizadas

| Ferramenta | Uso |
|---|---|
| Google Sheets | Planilha inteligente de clientes |
| Google Apps Script | Automações de e-mail e alertas |
| HubSpot CRM | Gestão de leads e vendas |
| Make (Integromat) | Integrações entre todas as ferramentas |
| HTML / CSS / JavaScript | Site e landing pages |
| GitHub | Versionamento e documentação |

---

## 📁 Estrutura do projeto
automatizando-corretora-do-zero/
├── site/                         # Site institucional da SRS Corretora
├── automacoes/
│   ├── planilha-inteligente/     # Scripts e documentação da planilha
│   └── make-integracoes/         # Fluxos de automação do Make
└── README.md

---

## 📅 Progresso

- [x] Estrutura inicial do projeto
- [x] Planilha inteligente com alertas automáticos de renovação
- [x] Alertas automáticos de aniversário dos clientes
- [x] Integração HubSpot → Google Sheets via Make
- [x] Integração Site → HubSpot + Planilha via Make
- [ ] Site institucional — home page
- [ ] Landing page Seguro Auto
- [ ] Landing page Plano de Saúde
- [ ] Landing page Consórcio
- [ ] Deploy no ar

---

## 👨‍💻 Autor

**Gabriel** — [@luquette-dev](https://github.com/luquette-dev)

Corretor de seguros que decidiu automatizar tudo e aprender tecnologia na prática.
