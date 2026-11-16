# Backend AnimalCare

## Configuração

1. Instale o MySQL e crie o banco executando `database/schema.sql` com um usuário que possa criar tabelas.
2. Copie `.env.example` para `.env` e ajuste `DB_HOST`, `DB_USER`, `DB_PASSWORD` e `DB_NAME`.
3. Execute `npm install`.
4. Inicie a API com `npm run server` e o frontend com `npm run dev` (ou ambos com `npm run dev:all`).

Se o banco já existia antes do controle de pagamentos dos agendamentos, execute
`database/migration-financial-payments.sql` uma vez para adicionar os campos de método,
status e data do pagamento.

A API usa `http://localhost:3001` e o Vite encaminha `/api` para ela.
As imagens enviadas são armazenadas em `uploads/` e servidas pela API.

O CORS aceita apenas as origens listadas em `FRONTEND_ORIGINS`, separadas por
vírgula. O padrão permite somente os servidores locais do Vite
(`http://localhost:5173` e `http://localhost:4173`). Em produção, substitua
esse valor pelos domínios reais do frontend; não use `*`.

## Acesso inicial

O script SQL cria o administrador `admin@animalcare.local` com senha `Admin@123`.
Altere essa senha após o primeiro acesso. O código de confirmação de cadastro no ambiente local é `123456`.

## Rotas

- `POST /api/auth/register`, `/login`, `/verify-otp`, `/forgot-password` e `/reset-password`
- `GET /api/auth/me`
- `POST /api/functions/sync-google-calendar`
- `GET/POST/PATCH/DELETE /api/entities/:entidade/:id`
- `GET /api/health`

Leituras públicas ficam disponíveis para conteúdo do site e criação pública de agendamentos/mensagens.
Alterações administrativas exigem um JWT de usuário com `role = admin`.

A API local expõe o contrato de funções usado pelo frontend através de
`POST /api/functions/:name`. A função `sync-google-calendar` valida a ação e
as permissões e cria/remove eventos usando a API do Google Calendar.

Para habilitar a integração, configure no `.env`:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
GOOGLE_CALENDAR_ID=...
GOOGLE_CALENDAR_TIME_ZONE=America/Sao_Paulo
```

O usuário usado para gerar o refresh token precisa ter acesso de edição ao
calendário informado. O escopo OAuth recomendado é
`https://www.googleapis.com/auth/calendar.events`. Sem essas variáveis, a API
retorna `501 GOOGLE_CALENDAR_NOT_CONFIGURED` de forma explícita.
