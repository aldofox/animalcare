# AnimalCare Institute

Aplicação web para apresentar os serviços do AnimalCare Institute e apoiar a gestão dos atendimentos veterinários. O projeto reúne um site institucional, uma área administrativa e uma API local com persistência em MySQL.

## Funcionalidades

- Apresentação do instituto, serviços, veterinários, galeria, depoimentos e perguntas frequentes.
- Solicitação e administração de agendamentos.
- Formulário de contato e gerenciamento de mensagens.
- Área administrativa para gerenciar serviços, equipe, galeria, depoimentos, perguntas frequentes, usuários e informações financeiras.
- API Express com autenticação, upload de imagens e integração opcional com o Google Calendar.

## Tecnologias

- **Interface:** React 18, Vite, Tailwind CSS e componentes Radix UI.
- **API:** Node.js, Express e MySQL.
- **Autenticação:** JSON Web Tokens (JWT).
- **Plataforma:** integração com Base44 para desenvolvimento e publicação.

## Requisitos

- Node.js e npm.
- MySQL para executar a API local.
- Base44 CLI somente para usar o fluxo de desenvolvimento ou publicação da plataforma Base44.

## Configuração local

1. Clone o repositório e entre na pasta do projeto.
2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure o banco de dados local:
   - Crie um banco MySQL e importe [`database/schema.sql`](./database/schema.sql).
   - Copie `.env.example` para `.env` (no PowerShell, use `Copy-Item .env.example .env`).
   - Atualize as variáveis de banco de dados e substitua `JWT_SECRET` por uma chave forte e exclusiva.
   - Para detalhes sobre migrações, acesso inicial e Google Calendar, consulte [`README_BACKEND.md`](./README_BACKEND.md).

4. Inicie a API e a interface:

   ```bash
   npm run dev:all
   ```

   O frontend fica disponível no endereço local informado pelo Vite (normalmente `http://localhost:5173`) e a API usa `http://localhost:3001`. O Vite encaminha as chamadas de `/api` e `/uploads` para a API.

Também é possível iniciar os processos separadamente, usando `npm run server` e `npm run dev` em terminais distintos.

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento do frontend. |
| `npm run server` | Inicia a API Express. |
| `npm run dev:all` | Inicia frontend e API em paralelo. |
| `npm run build` | Gera a versão de produção em `dist/`. |
| `npm run preview` | Serve localmente a versão gerada pelo build. |
| `npm run lint` | Executa o ESLint. |
| `npm run typecheck` | Executa a verificação de tipos do TypeScript. |

## Estrutura do projeto

```text
base44/                 Configuração e entidades da plataforma Base44
database/               Esquema e migrações do MySQL
server/                 API Express
src/components/admin/   Componentes da área administrativa
src/components/site/    Componentes do site institucional
src/pages/              Páginas da aplicação
src/api/                Cliente da API usado pelo frontend
```

## Variáveis de ambiente e segurança

- As variáveis da API local estão documentadas em `.env.example`.
- Não versione `.env`, `.env.local` nem credenciais ou tokens.
- Troque qualquer valor de exemplo antes de usar a aplicação fora de um ambiente local.
- Configure as origens permitidas em `FRONTEND_ORIGINS`; evite liberar origens indiscriminadamente.
- A integração com o Google Calendar é opcional e requer credenciais próprias.

## Desenvolvimento e publicação com Base44

Para usar o fluxo da plataforma Base44, instale a CLI conforme a [documentação oficial](https://docs.db.com/developers/references/cli/get-started/overview) e execute `base44 dev` na raiz do projeto. Para abrir o painel de publicação:

```bash
base44 dashboard open
```

O fluxo da plataforma é separado da API Express/MySQL descrita neste README. Consulte a [referência de comandos da CLI](https://docs.db.com/developers/references/cli/commands/introduction) e a documentação de [integração com GitHub](https://docs.db.com/Integrations/Using-GitHub) para mais informações.
