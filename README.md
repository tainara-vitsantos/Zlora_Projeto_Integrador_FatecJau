# Projeto Interdisciplinar - Fatec Jahu

Projeto desenvolvido com apoio dos conteúdos das disciplinas do curso de DSM – Fatec Jahu. Documentação do Projeto Interdisciplinar (PI).

## 1. Introdução

A criação desta solução de gestão comercial surgiu da necessidade de modernizar e otimizar os processos internos de diversos estabelecimentos, garantindo mais organização, agilidade e qualidade no atendimento. No cotidiano das empresas, é comum que agendamentos, históricos de procedimentos, registros financeiros e controle de produtos sejam realizados de forma manual ou em aplicações separadas. Essa realidade gera falhas de comunicação, retrabalho e perda de informações essenciais para uma boa experiência do cliente. 

A partir de uma análise de mercado e de conversas com profissionais da área, identificou-se que mais de 80% das clínicas e negócios de atendimento enfrentam dificuldades na gestão de horários, acompanhamento de clientes e controle de estoque — fatores que impactam diretamente na produtividade e na fidelização. Da mesma forma, foi constatado que a centralização desses processos em uma plataforma digital seria altamente benéfica tanto para os colaboradores quanto para os gestores. 

Com base nesses resultados, o **Zlora** foi idealizado como uma solução completa para integrar e digitalizar os principais processos do estabelecimento contratante. O objetivo é proporcionar um ambiente intuitivo, eficiente e seguro, capaz de melhorar o fluxo de trabalho, reduzir erros, facilitar a comunicação e elevar o padrão de atendimento. Sua estrutura *white-label* permite que o produto seja expandido comercialmente para diversos setores que envolvem o atendimento ao cliente e o agendamento de procedimentos, como clínicas de estética, manicures, cabeleireiros, entre outros. 

### Objetivos

**Objetivo Geral:** 
A plataforma de gestão e agendamentos tem como objetivo otimizar os processos administrativos e operacionais, garantindo maior organização, eficiência e qualidade no atendimento. Por meio de uma aplicação digital segura e intuitiva, busca-se centralizar informações, automatizar rotinas e oferecer suporte à tomada de decisões, elevando o padrão de serviço oferecido aos clientes e facilitando o trabalho diário dos profissionais. 

**Objetivos Específicos:** 
* **Otimizar o Agendamento de Procedimentos:** Desenvolver um módulo integrado de agendamentos que permita organizar horários, evitar conflitos, reduzir atrasos e facilitar a visualização da agenda dos profissionais. 
* **Facilitar o Controle de Clientes e Histórico de Atendimentos:** Criar um recurso para registrar informações completas dos clientes, incluindo histórico de procedimentos, preferências e observações, permitindo um atendimento mais personalizado e eficiente. 
* **Gerenciar Estoque e Produtos Utilizados:** Implementar funcionalidades para monitorar níveis de estoque, controlar entradas e saídas de produtos e gerar alertas de reposição, evitando faltas e desperdícios. 
* **Automatizar Processos Financeiros:** Oferecer ferramentas para registrar pagamentos, controlar contas, emitir relatórios financeiros e acompanhar o faturamento, contribuindo para uma gestão mais profissional e organizada. 
* **Aprimorar a Experiência do Cliente:** Construir uma solução que contribua para um atendimento mais rápido, organizado e personalizado, aumentando a satisfação, fidelização e percepção de qualidade dos serviços prestados. 

## Metodologia

Para o desenvolvimento do Zlora foram adotados métodos, ferramentas e tecnologias que garantiram organização, colaboração eficiente e agilidade na construção das funcionalidades. 

### Métodos e Processo 
* Aplicação de um modelo ágil baseado no Scrum (versão simplificada). 
* Reuniões frequentes para alinhamento e definição de prioridades. 
* Sprints semanais com metas individuais e coletivas. 
* Controle de tarefas utilizando Trello, organizado em listas no estilo Kanban. 
* Registro de decisões e histórico de desenvolvimento por meio de Issues. 

### Tecnologias e Ferramentas 
* **Frontend:** HTML5, CSS3 e JavaScript. 
* **Backend:** ASP.NET e C#.
* **Design e prototipação:** Figma. 
* **Versionamento:** Git e GitHub. 
* **Documentação:** Markdown. 
* **Comunicação:** WhatsApp e reuniões presenciais/online. 
* **Apresentação:** PowerPoint. 

### Onde e quando aplicamos
O desenvolvimento da plataforma ocorreu de forma híbrida, combinando encontros presenciais e atividades remotas. O projeto foi desenvolvido ao longo do curso de desenvolvimento de software multiplataforma, com ajustes finais realizados nos últimos encontros da equipe. 

## 2. Requisitos

Um documento de requisitos descreve o que a aplicação deve fazer, suas funções, regras e limitações. Ele serve como guia para o desenvolvimento, ajudando a garantir que o produto atenda às necessidades dos usuários e funcione corretamente. 

### 2.1 Requisitos Funcionais 
* **RF01 – Registrar Cliente:** A plataforma deve permitir que o cliente se registre. 
* **RF02 – Realizar Login do cliente:** A solução deve permitir que o cliente faça login e tenha acesso a seus recursos. 
* **RF03 – Cancelar Sessão pelo Cliente:** O software deve permitir que o cliente cancele uma sessão com antecedência mínima de 24 horas. 
* **RF04 – Cancelar Sessão pelo profissional:** A aplicação deve permitir que o profissional cancele o horário de um cliente, notificando o cliente automaticamente. 
* **RF05 – Acessar Agenda Individual:** A plataforma deve permitir que cada profissional possua login individual, com acesso apenas à sua própria agenda. 
* **RF06 – Escolher profissional:** A ferramenta deve permitir que o cliente escolha o profissional desejado no momento do agendamento. 
* **RF07 – Enviar Notificações e Lembretes:** A solução deve enviar notificações/lembretes de consultas aos clientes. 
* **RF08 – Integrar com Redes Sociais e Aplicativos:** O software deve permitir integração com redes sociais e WhatsApp. 
* **RF09 – Permitir Autonomia da Administradora:** A plataforma deve permitir que o estabelecimento contratante tenha autonomia para realizar alterações, como ajustes em funcionalidades, regras ou conteúdos. 
* **RF10 – Agendar e Pagar Online:** A aplicação deve permitir o agendamento e a realização de pagamentos online. 

### 2.2 Requisitos Não Funcionais
* **RNF01 – Segurança (Autenticação):** A solução deve exigir login e senha válidos para acesso, garantindo a proteção dos dados do usuário. 
* **RNF02 – Desempenho:** As páginas do software devem carregar em no máximo 3 segundos, mesmo em condições de internet limitada. 
* **RNF03 – Usabilidade:** Um novo usuário deve conseguir realizar um agendamento em até 3 minutos, sem necessidade de treinamento prévio. 
* **RNF04 – Personalização da Interface:** A interface deve ser personalizável (*white-label*) e detalhada, sem comprometer a clareza e a facilidade de uso. 
* **RNF05 – Experiência do Usuário:** A plataforma deve proporcionar uma experiência agradável e intuitiva, incentivando o retorno e a fidelização dos clientes. 
* **RNF06 – Segurança (Dados Sensíveis):** Os dados de pagamento devem ser armazenados e transmitidos de forma criptografada, seguindo boas práticas de segurança. 
* **RNF07 – Responsividade:** O produto deve ser responsivo, funcionando corretamente em dispositivos desktop e mobile. 

## 7. Estudo de Viabilidade

* **Viabilidade Técnica:** A viabilidade técnica demonstra que o Zlora pode ser desenvolvido e mantido com os recursos tecnológicos e conhecimentos atualmente disponíveis pela equipe. As tecnologias selecionadas para a construção da plataforma — como HTML, CSS, JavaScript e Bootstrap — são amplamente utilizadas, possuem documentação robusta e contam com grande suporte da comunidade, garantindo estabilidade e facilidade de implementação. A infraestrutura necessária para o funcionamento da aplicação é simples e acessível, exigindo apenas um ambiente de hospedagem padrão. A arquitetura garante que a ferramenta possa ser implementada com qualidade, além de permitir futuras expansões sem comprometer a estrutura inicial. O produto é flexível e pode ser integrado futuramente com APIs de pagamento ou serviços de gestão corporativa. 
* **Viabilidade Operacional:** A viabilidade operacional demonstra que o software proposto pode ser implementado e utilizado de forma eficiente pelos usuários finais. O funcionamento da plataforma é sustentado por uma estrutura intuitiva e compatível com os administradores das empresas contratantes. A interface foi planejada para ser clara e de fácil navegação, garantindo que clientes e colaboradores consigam realizar operações sem necessidade de treinamento avançado. A estrutura permite fácil integração de novas funcionalidades no futuro, garantindo que o produto possa evoluir conforme a necessidade de escala dos negócios atendidos. 
* **Viabilidade Financeira:** A análise de viabilidade financeira demonstra que a construção da plataforma B2B é executável com os recursos disponíveis e apresenta bom potencial de retorno. O investimento inicial envolve custos relacionados ao desenvolvimento, infraestrutura e contratação de serviços de hospedagem, mantendo-se dentro de um orçamento acessível. Do ponto de vista de retorno financeiro, a solução tem potencial para gerar receita através de funcionalidades avançadas, pacotes de assinaturas para as clínicas e automações de vendas, aumentando a rentabilidade do negócio matriz. 
* **Viabilidade de Mercado:** A viabilidade de mercado revela que existe uma demanda crescente por agendamento de serviços de bem-estar, estética e atendimento comercial, o que favorece a adoção em massa da plataforma. O cenário de consumo atual valoriza ferramentas digitais que melhorem o atendimento ao cliente e reduzam gargalos de tempo. A adoção da ferramenta por estabelecimentos comerciais aumenta a competitividade deles em relação a concorrentes que ainda não possuem presença digital estruturada. 

## 8. Regras de Negócio (Modelo Canvas)

Para compreender de forma clara a proposta de valor do software e como a plataforma se integra ao mercado comercial, desenvolvemos o Modelo de Negócio Canvas. Esse quadro permite visualizar os principais elementos que sustentam o funcionamento do projeto SaaS, incluindo público-alvo, proposta de valor, canais, parcerias, estrutura de custos e fontes de receita. O Canvas alinha a solução *white-label* às necessidades reais dos estabelecimentos comerciais, garantindo coerência entre o produto e o mercado. 

## 9. Design

A identidade visual base do projeto foi desenvolvida para transmitir leveza, bem-estar e confiança, e foi idealizada para ser adaptável às marcas que utilizarem o modelo. 

* **Paleta de Cores:** Transmite equilíbrio através dos tons `#C8E6E2`, `#9ED5D1`, `#63C1BB`, `#3A9295` e `#105F68`. 
* **Tipografia:** Roboto Bold (Títulos) e Roboto Regular (Corpo de texto). 

## 10. Protótipo

Antes do desenvolvimento, as telas foram planejadas e testadas através de um protótipo navegável no Figma. 

## 11. Aplicação

Nesta seção apresentamos a versão final da aplicação hospedada, permitindo navegar e visualizar o ERP funcionando em um de seus casos de uso (como a Essense SPA). 

## Considerações Finais

O desenvolvimento da plataforma representou uma experiência completa de integração entre análise, design, prototipação e implementação. A solução SaaS *white-label* proposta busca facilitar o dia a dia comercial dos estabelecimentos, oferecendo agilidade, organização e ferramentas gerenciais que fortalecem a tomada de decisão. O produto permanece em evolução, e melhorias futuras poderão ser incorporadas conforme novas demandas e feedbacks dos parceiros comerciais surgirem.
