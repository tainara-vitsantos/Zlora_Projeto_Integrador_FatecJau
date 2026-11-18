# Zlora: plataforma de gestão e agendamento para beleza e estética

**Projeto Interdisciplinar**  
**Instituição:** Centro Paula Souza - Faculdade de Tecnologia de Jahu  
**Curso:** Tecnologia em Desenvolvimento de Software Multiplataforma  
**Integrantes:** Evellyn Santana Marinho, Rafael Henrique Biliasi e Tainara Santos  
**Ano:** 2026

## 1 Introdução

O Zlora é um projeto de aplicação web destinado à gestão de estabelecimentos do setor de beleza e estética. Sua proposta é reunir informações de clientes, profissionais, serviços e agendamentos em um ambiente organizado, contribuindo para o acompanhamento das atividades administrativas e operacionais.

O uso de agendas físicas, planilhas e canais de comunicação separados pode dificultar a consulta de horários e o registro dos atendimentos. A centralização dessas informações busca reduzir o retrabalho, facilitar a organização da agenda e oferecer uma visão mais clara das atividades do estabelecimento.

A solução considera três perfis de interação: administrador, profissional e cliente. O administrador gerencia os cadastros e acompanha os registros do negócio; o profissional consulta sua agenda e organiza sua jornada; o cliente acessa os serviços do estabelecimento e realiza agendamentos. A personalização visual por estabelecimento integra a proposta white-label do projeto.

### 1.1 Público-alvo

O projeto é direcionado a salões de beleza, barbearias, clínicas de estética, manicures, profissionais autônomos e clientes desses estabelecimentos.

### 1.2 Justificativa

A organização dos atendimentos exige que informações de clientes, serviços e horários estejam acessíveis e relacionadas. Uma plataforma integrada pode apoiar esse processo ao reunir os registros em uma única base e oferecer interfaces adequadas às necessidades de cada perfil de usuário. No contexto acadêmico, o desenvolvimento do Zlora articula conteúdos de programação web, banco de dados, engenharia de software e interação humano-computador.

## 2 Objetivos

### 2.1 Objetivo geral

Desenvolver uma plataforma web para centralizar informações e apoiar a gestão de agendamentos e atendimentos em estabelecimentos de beleza e estética.

### 2.2 Objetivos específicos

- Organizar os cadastros de clientes, profissionais e serviços.
- Estruturar o agendamento de serviços e a consulta das agendas individuais.
- Permitir o acompanhamento do histórico de atendimentos.
- Apoiar o controle de produtos, movimentações de estoque e informações financeiras.
- Disponibilizar recursos de personalização visual por estabelecimento.
- Permitir a consulta de indicadores e a emissão de relatórios.
- Oferecer uma interface clara e adequada aos diferentes perfis de usuário.

## 3 Metodologia

O desenvolvimento foi organizado com práticas simplificadas de Scrum, reuniões de acompanhamento, definição de atividades por sprint e uso de quadro Kanban no Trello. O versionamento do código utiliza Git e GitHub, permitindo registrar alterações e apoiar a colaboração entre os integrantes.

O planejamento visual utiliza o Figma, enquanto os materiais de interação humano-computador apresentam personas, mapas de empatia e fluxos de interação. Esses instrumentos orientam a organização das telas e a identificação das necessidades dos usuários. A documentação do projeto reúne requisitos, estrutura de dados, decisões de arquitetura e orientações de utilização.

## 4 Requisitos do sistema

### 4.1 Requisitos funcionais

| Código | Requisito | Descrição |
| --- | --- | --- |
| RF01 | Registrar cliente | A plataforma deve permitir que o cliente realize seu cadastro. |
| RF02 | Autenticar cliente | A plataforma deve permitir que o cliente faça login e acesse os recursos associados à sua conta. |
| RF03 | Cancelar sessão pelo cliente | A plataforma deve permitir que o cliente cancele uma sessão com antecedência mínima de 24 horas. |
| RF04 | Cancelar sessão pelo profissional | A plataforma deve permitir que o profissional cancele o horário de um cliente e deve notificar o cliente automaticamente. |
| RF05 | Acessar agenda individual | A plataforma deve permitir que cada profissional possua login individual e acesso apenas à sua própria agenda. |
| RF06 | Escolher profissional | A plataforma deve permitir que o cliente escolha o profissional desejado no momento do agendamento. |
| RF07 | Enviar notificações e lembretes | A plataforma deve enviar notificações e lembretes de atendimento aos clientes. |
| RF08 | Integrar redes sociais e aplicativos | A plataforma deve permitir integração com redes sociais e WhatsApp. |
| RF09 | Permitir autonomia administrativa | A plataforma deve permitir que o estabelecimento ajuste conteúdos, regras e configurações administrativas de acordo com suas necessidades. |
| RF10 | Agendar e pagar online | A plataforma deve permitir o agendamento de serviços e a realização de pagamentos online. |
| RF11 | Gerenciar clientes | A plataforma deve permitir ao administrador cadastrar, consultar, atualizar e excluir registros de clientes, incluindo informações de contato e observações. |
| RF12 | Gerenciar serviços | A plataforma deve permitir ao administrador cadastrar, consultar, atualizar e excluir serviços, informando descrição, duração, preço e situação. |
| RF13 | Gerenciar profissionais | A plataforma deve permitir ao administrador cadastrar, consultar, atualizar e excluir profissionais, registrando especialidade, contato e informações de atendimento. |
| RF14 | Consultar histórico | A plataforma deve permitir a consulta do histórico de agendamentos, relacionando cliente, profissional, serviço, data, horário e status. |
| RF15 | Gerar relatórios em PDF | A plataforma deve permitir ao administrador filtrar o histórico de agendamentos por período e status e exportar o resultado em PDF. |
| RF16 | Personalizar o estabelecimento | A plataforma deve permitir configurar a identidade visual e as informações públicas do estabelecimento, incluindo cor, logotipo, imagem de capa, endereço e rede social. |
| RF17 | Consultar indicadores | A plataforma deve apresentar indicadores administrativos relacionados a agendamentos, clientes e valores dos serviços. |
| RF18 | Gerenciar estoque | A plataforma deve permitir o controle de produtos, entradas e saídas de estoque e a emissão de alertas de reposição. |

### 4.2 Requisitos não funcionais

| Código | Requisito | Descrição |
| --- | --- | --- |
| RNF01 | Segurança da autenticação | A plataforma deve exigir login e senha válidos para o acesso às áreas restritas e proteger os dados de autenticação dos usuários. |
| RNF02 | Desempenho | As páginas da plataforma devem carregar em até 3 segundos, inclusive nas condições de internet limitada definidas para avaliação. |
| RNF03 | Usabilidade | A plataforma deve permitir que um novo usuário realize um agendamento em até 3 minutos, sem treinamento prévio. |
| RNF04 | Personalização da interface | A interface deve permitir personalização por estabelecimento, mantendo clareza, legibilidade e facilidade de uso. |
| RNF05 | Experiência do usuário | A plataforma deve oferecer navegação intuitiva, organização consistente das informações e mensagens compreensíveis. |
| RNF06 | Proteção dos dados sensíveis | Os dados de pagamento devem ser armazenados e transmitidos de forma criptografada, seguindo boas práticas de segurança. |
| RNF07 | Responsividade | A plataforma deve adaptar a apresentação e a interação às telas de computadores e dispositivos móveis. |

## 5 Organização funcional

| Área | Responsabilidade |
| --- | --- |
| Administrador | Gerenciamento de clientes, serviços, profissionais, agenda, informações financeiras, relatórios e configurações. |
| Profissional | Consulta da agenda individual, atualização de perfil e configuração da jornada de trabalho. |
| Cliente | Acesso à conta e consulta dos próprios agendamentos. |
| Página pública do estabelecimento | Apresentação da identidade visual, dos serviços e dos profissionais, com formulário de agendamento. |
| Relatórios | Consulta do histórico com filtros e exportação para PDF. |

O cadastro de um estabelecimento associa uma conta administrativa à empresa. Os serviços descrevem os atendimentos oferecidos, enquanto os agendamentos relacionam cliente, profissional, serviço e intervalo de tempo. Essa organização fornece os dados necessários para as consultas do painel e para a geração de relatórios.

### 5.1 Relatórios de agendamentos

A tela de relatórios consulta as informações de agendamentos, clientes, serviços e profissionais. O administrador seleciona a data inicial, a data final e o status dos registros. A tabela apresenta data e hora, cliente, serviço, profissional e situação, acompanhada do total de agendamentos selecionados.

A exportação utiliza o recurso de impressão do navegador, acionado por `window.print()`. O CSS de impressão organiza o documento em A4 paisagem e retira os elementos de navegação, filtros e botões. Na janela de impressão, o usuário seleciona **Salvar como PDF**.

### 5.2 Informações financeiras

O painel financeiro apresenta valores calculados a partir dos agendamentos e dos preços dos serviços, além de indicadores e da listagem dos registros. Esses valores apoiam a consulta administrativa do movimento do estabelecimento.

## 6 Arquitetura e tecnologias

A aplicação é organizada em frontend, backend e banco de dados. O frontend apresenta as telas e recebe as ações do usuário. A API processa as requisições, aplica validações e acessa as coleções do banco. As respostas são retornadas em JSON para atualização da interface.

```text
Interface React -> Requisições HTTP/JSON -> API ASP.NET Core -> MongoDB
```

| Camada ou finalidade | Tecnologias |
| --- | --- |
| Interface | React, JavaScript, HTML e CSS |
| Ambiente de desenvolvimento frontend | Node.js, npm e Vite |
| Navegação e componentes | React Router e React Icons |
| Gráficos e formulários | Recharts, React Hook Form e Zod |
| Backend | C# e ASP.NET Core, com projeto direcionado ao .NET 10 |
| Banco de dados | MongoDB e MongoDB.Driver |
| Autenticação | JWT e PasswordHasher do ASP.NET Core |
| Documentação da API | Swagger/OpenAPI |
| Relatórios | Impressão nativa do navegador e CSS |

O fluxo de autenticação retorna um token JWT utilizado nas requisições protegidas. As senhas são tratadas por meio do `PasswordHasher`. O backend utiliza papéis de acesso para organizar as permissões administrativas, profissionais e de clientes.

## 7 Modelo de dados

| Coleção | Responsabilidade |
| --- | --- |
| `usuarios` | Contas de acesso, dados de identificação e hash de senha. |
| `empresas` | Estabelecimentos, proprietário, endereço público e personalização. |
| `membros_empresa` | Associação entre usuário, empresa, papel e permissões. |
| `clientes` | Dados cadastrais, informações de contato e observações. |
| `profissionais` | Identificação, especialidade, jornada e informações profissionais. |
| `servicos` | Descrição, duração, preço e situação dos serviços. |
| `agendamentos` | Relacionamento entre cliente, profissional e serviço, com datas e status. |

Os documentos utilizam identificadores para representar as associações entre as coleções. O agendamento mantém referências ao cliente, ao serviço e ao profissional, além de sua vinculação ao estabelecimento. O contexto de dados concentra o acesso às coleções utilizadas pelos controllers.

O banco possui índice único para o e-mail dos usuários. As consultas do dashboard utilizam agregações para reunir indicadores. A rotina `scripts/backup-mongodb.ps1` executa `mongodump` e registra o resultado em arquivo de log.

## 8 Design e experiência de uso

A identidade visual utiliza roxos e lilases, com organização das telas por menu lateral, cartões, formulários e tabelas. A tipografia definida no CSS utiliza Inter para o corpo do texto e Outfit para os títulos, acompanhadas de fontes alternativas do sistema.

| Aplicação | Cor |
| --- | --- |
| Primária | `#6F3CE7` |
| Texto principal | `#24173C` |
| Lilás de apoio | `#EDE7FF` |
| Fundo | `#FAF9FF` |

A personalização da página pública permite adequar a apresentação à identidade do estabelecimento. A consistência entre formulários, botões e tabelas orienta a navegação e facilita o reconhecimento das ações disponíveis.

## 9 Viabilidade e modelo de negócio

### 9.1 Viabilidade técnica

A arquitetura separa as responsabilidades de interface, processamento e persistência. A infraestrutura deve contemplar a execução do frontend, da API e do MongoDB, com configuração dos ambientes, das conexões e das rotinas de manutenção.

### 9.2 Viabilidade operacional

A proposta concentra atividades relacionadas ao atendimento em um ambiente comum aos diferentes perfis. Essa organização busca facilitar a consulta de informações e reduzir a dependência de registros dispersos.

### 9.3 Viabilidade financeira

O modelo comercial proposto considera assinaturas para estabelecimentos. A composição dos custos envolve desenvolvimento, hospedagem, banco de dados, manutenção e suporte. Esses elementos orientam o planejamento financeiro e a definição dos serviços oferecidos.

### 9.4 Modelo Canvas

O Canvas organiza os segmentos de clientes, a proposta de valor, os canais, o relacionamento, as fontes de receita, os recursos, as atividades, os parceiros e a estrutura de custos. A proposta de valor está relacionada à centralização das informações e ao apoio à organização dos atendimentos.

## 11 Considerações finais

O projeto Zlora reúne conhecimentos de interface web, programação em JavaScript e C#, desenvolvimento de APIs, autenticação e persistência não relacional. Sua organização permite relacionar os cadastros ao fluxo de agendamento e às consultas administrativas, aproximando os conteúdos trabalhados no curso das necessidades de gestão do setor de beleza e estética.

A documentação apresenta os objetivos, os requisitos e a estrutura técnica da solução, servindo como referência para a compreensão do sistema e para a continuidade de seu desenvolvimento.
