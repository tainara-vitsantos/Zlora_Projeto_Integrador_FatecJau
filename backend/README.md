# Zlora — backend C# + MongoDB

Este pacote mantém os arquivos do frontend React/Vite originais, sem alterações, e organiza a API C# na pasta `backend`.

## Compatibilidade conferida com o frontend

O formulário de cadastro usa estes nomes: `nome`, `nomecontato`, `telefone`, `email`, `senha` e `conduso`. A API recebe esses campos em `POST /api/auth/register` (o ASP.NET Core aceita a diferença entre maiúsculas/minúsculas no JSON). O login recebe `email` e `senha` em `POST /api/auth/login`.

**Importante:** o frontend enviado ainda usa funções `MOCK` em `src/contexts/AuthContext.jsx`: ele simula cadastro/login e grava um token falso no `localStorage`; ele não faz requisições HTTP para a API. Como você pediu para não alterar o frontend, deixei-o exatamente como estava. Portanto, este backend está preparado para receber os dados do formulário, mas o site só vai usar o banco real depois que o contexto de autenticação for conectado à API. Só o backend não consegue substituir chamadas que o frontend ainda não faz.

## Estrutura

- `backend/Controllers`: rotas da API (cadastro/login, serviços, clientes e agendamentos).
- `backend/Models`: modelos que representam os documentos do MongoDB e os dados recebidos.
- `backend/Data`: configuração e acesso às coleções MongoDB.
- `backend/Program.cs`: configuração da API, CORS, autenticação e Swagger.
- `zlora-frontend/`: frontend original, sem alterações.

## Executar o backend

1. Abra o terminal na pasta `backend`.
2. Confirme que o MongoDB está em execução em `mongodb://localhost:27017`. O banco usado é `zlora`.
3. Configure uma chave JWT local com pelo menos 32 caracteres (não publique essa chave no Git):

   **PowerShell:**
   ```powershell
   $env:Jwt__SecretKey = "Zlora_Dev_Key_2026_Evellyn_Projeto_Integrador_123456"
   dotnet restore
   dotnet run
   ```

4. Abra o endereço mostrado no terminal e acrescente `/swagger` para testar as rotas.

## Executar o frontend

Em outro terminal, entre em `zlora-frontend` e execute `npm install` e `npm run dev`. O Vite normalmente inicia em `http://localhost:5173`.

## Observação sobre autenticação

As rotas de dados protegidas exigem um JWT real obtido por `POST /api/auth/login` ou `POST /api/auth/register`. O token falso que o frontend atual cria não será aceito pela API. Para integrar de verdade, será necessário trocar as funções simuladas por chamadas `fetch`/HTTP e guardar o token retornado pela API. Isso é uma mudança futura no frontend, não foi feita neste pacote.
