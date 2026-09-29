# Rootis V10 — autenticação segura

Esta versão remove credenciais administrativas, hashes de senha e contas do `script.js` e do `localStorage`.

## O que fica no navegador
- Interface, agenda e dados locais atuais.
- Cookie de sessão `HttpOnly` (o JavaScript não consegue ler o token).
- Nenhuma senha administrativa, hash de senha ou string de conexão com o Neon.

## O que fica no servidor/Vercel
- `DATABASE_URL` do Neon.
- O cadastro cria a conta diretamente, sem código de ativação por e-mail, SMS ou WhatsApp.
- Recuperação de senha está temporariamente desativada nesta versão.
- Senhas armazenadas apenas como hash `scrypt` com salt individual.
- Sessões armazenadas por hash no Neon.

## Antes de publicar
1. Execute `db/schema.sql` no Neon.
2. Configure as variáveis de ambiente usando `.env.example` como referência.
3. Instale dependências: `npm install`.
4. Crie a conta proprietária com variáveis de ambiente e `npm run create-admin`.
5. Resend/Twilio não são necessários nesta versão porque a recuperação de senha está desativada.
6. Nunca suba `.env`, `.env.local` ou credenciais para o GitHub.

O arquivo `Rootis_executavelV10.html` serve para visualizar a interface. Login seguro requer as rotas `/api` em execução no Vercel (ou ambiente local equivalente).
