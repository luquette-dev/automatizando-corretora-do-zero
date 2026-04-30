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
- Sistema de score de oportunidades com ARRAYFORMULA, pontuando clientes por vencimento, aniversário e
inadimplência
- Aba de Radar de Concorrência monitorando anúncios e estratégias de corretoras concorrentes
- Tudo construído com **Google Apps Script**

### 🔗 Integrações via Make
- Venda fechada no **HubSpot CRM** → lead migra automaticamente para a planilha de clientes
- Formulário preenchido no **site** → lead cai direto no HubSpot CRM e na planilha simultaneamente
- Zero trabalho manual em nenhuma etapa do funil

### 🌐 Site SRS Corretora *(em construção)*

O site foi dividido em quatro pilares principais para facilitar a navegação do cliente e a conversão de leads:

### 👤 Para Você
Soluções completas para proteger o que é importante para o indivíduo e sua família.

| | | |
| :--- | :--- | :--- |
| 🚗 Seguro Auto | 🏠 Seguro Residencial | ✈️ Seguro Viagem |
| 💰 Consórcio | 📱 Equip. Portáteis | 🚴 Seguro Bike |
| 🩺 Seguro Saúde | 🦷 Odontológico | 🐕 Seguro Pet |
| 🧬 Seguro de Vida | 🩹 Acidentes Pessoais | 🏍️ Seguro de Moto |
| 🔑 Fiança Locatícia | 🚜 Seguro Rural | 🎓 Educacional |
| 📈 Previdência | | |

### 🏢 Para Empresa
Gestão de riscos e benefícios para negócios de todos os portes.

*   **Pessoas:** Vida Empresarial, Plano de Saúde, Escolar.
*   **Operacional:** Seguro Frota, Equipamentos, Agrícola.
*   **Patrimonial:** Empresarial, Condomínio, Aeronáutico, Náutico.
*   **Garantias:** Responsabilidade Civil, Risco de Engenharia, Seguro Garantia, Fiança Aluguel.

### ✍️ Blog & Social
Integração direta com o **Instagram** para manter os clientes atualizados sobre o mercado de seguros e dicas de prevenção.

### 📞 Contato
*   Atendimento humano via **WhatsApp** integrado em todas as páginas.
*   Formulários inteligentes de captação.

---

## 🛠️ Stack Técnica & Automação

O diferencial deste projeto é o seu **back-end invisível**, focado em produtividade:

*   **Frontend:** HTML5, Tailwind CSS (Design Moderno e Responsivo).
*   **CRM:** `HubSpot` para gestão de leads em tempo real.
*   **Dados:** `Google Sheets` para backup e relatórios de performance.
*   **Conversão:** Links diretos da Porto Seguro com rastreio de comissionamento automático.

---

## 🔄 Fluxo completo de automação
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

---

## 🛠️ Tecnologias utilizadas
O problema é que faltava o --- depois do bloco de código para separar as seções. Faz o commit com:
fix: corrige formatação do README

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
