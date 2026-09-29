# Rootis V10 — Guia de Publicação Online

Guia oficial do projeto **Rootis V10** para colocar o sistema online usando:

- **GitHub** — repositório do código;
- **Vercel** — hospedagem do site e execução das rotas `/api`;
- **Neon** — banco de dados PostgreSQL;
- **Domínio** — `www.rootis.com.br`.

> Atualizado em 27/09/2026.

---

## 1. Arquitetura do Rootis

O Rootis V10 foi preparado para funcionar com esta arquitetura:

```text
NAVEGADOR DO USUÁRIO
        │
        ▼
     VERCEL
 ┌───────────────────────────────┐
 │ index.html / style.css / JS   │
 │                               │
 │ /api/*  → backend seguro      │
 └───────────────┬───────────────┘
                 │
                 │ DATABASE_URL
                 ▼
              NEON
          PostgreSQL seguro
```

### Regra de segurança mais importante

**Nunca** coloque no GitHub, no HTML ou no `script.js`:

- senha do administrador;
- senha do banco;
- `DATABASE_URL` real;
- token de sessão;
- segredo de autenticação;
- chaves privadas de e-mail, SMS ou WhatsApp.

Esses dados devem existir **somente nas variáveis de ambiente do servidor**.

---

# 2. Antes de publicar: confira os arquivos do projeto

A versão de produção do Rootis deve ter uma estrutura parecida com esta:

```text
rootis/
├── index.html
├── style.css
├── script.js
├── api/
│   └── ... rotas de autenticação ...
├── db/
│   └── schema.sql
├── scripts/
│   └── create-admin.mjs
├── .env.example
├── package.json
├── .gitignore
└── README.md
```

## ATENÇÃO

Se o repositório tiver **somente**:

```text
index.html
style.css
script.js
```

**não faça ainda o deploy definitivo da autenticação.**

A interface poderá abrir, mas o login seguro não funcionará, pois o frontend do Rootis V10 já chama rotas como:

```text
/api/auth/login
/api/auth/logout
/api/auth/me
/api/auth/register/request
/api/auth/recovery/request
/api/auth/recovery/reset
/api/account/profile
/api/admin/users
/api/admin/delete-user
```

Essas rotas precisam existir dentro da pasta `/api` do pacote seguro.

---

# 3. Criar ou preparar o repositório no GitHub

No GitHub, use o repositório do Rootis.

Na raiz do projeto, os arquivos devem estar diretamente disponíveis. Evite deixar tudo dentro de uma pasta extra como:

```text
rootis/rootis/index.html
```

O correto, para nosso projeto, é:

```text
rootis/index.html
```

## Enviar alterações pelo Git

Exemplo:

```bash
git add .
git commit -m "deploy: prepara Rootis V10 para produção"
git push origin main
```

---

# 4. Criar o arquivo `.gitignore`

O projeto deve conter um `.gitignore` para impedir o envio de segredos ao GitHub.

Use, no mínimo:

```gitignore
node_modules/
.vercel/
.env
.env.local
.env.production
.env.development
.env.*
!.env.example
```

## Nunca faça isso

Não envie arquivos contendo valores reais de produção:

```text
.env
.env.local
.env.production
```

O arquivo `.env.example` pode ficar no GitHub porque ele deve conter apenas os **nomes** das variáveis, sem os valores secretos.

---

# 5. Criar o banco no Neon

Acesse:

https://console.neon.tech/

Entre na sua conta e crie um projeto PostgreSQL para o Rootis.

Sugestão de nome:

```text
rootis-production
```

Escolha uma região adequada para o projeto. Sempre que possível, mantenha o banco em uma região próxima da região onde as Functions do Vercel serão executadas.

---

# 6. Obter a conexão PostgreSQL do Neon

Dentro do projeto do Neon, abra a opção **Connect**.

Para aplicações serverless como o Rootis no Vercel, prefira a conexão indicada pelo Neon para aplicações/serverless, normalmente a **pooled connection string**.

Ela terá formato semelhante a:

```text
postgresql://USUARIO:SENHA@HOST.neon.tech/NOME_DO_BANCO?sslmode=require
```

## Importante

Esse endereço contém senha.

**Não cole essa URL no README, no JavaScript ou no GitHub.**

Ela será cadastrada no Vercel como:

```text
DATABASE_URL
```

---

# 7. Criar as tabelas do Rootis no Neon

No painel do Neon:

1. abra **SQL Editor**;
2. abra, no computador, o arquivo:

```text
db/schema.sql
```

3. copie o conteúdo do `schema.sql` do pacote seguro do Rootis;
4. cole no SQL Editor do Neon;
5. execute o script;
6. confirme que as tabelas foram criadas sem erro.

> Use somente o `db/schema.sql` pertencente ao pacote seguro do **Rootis**. Não use schemas de outros projetos.

---

# 8. Criar o projeto no Vercel

Acesse:

https://vercel.com/

Entre usando a conta ligada ao GitHub.

Depois:

1. clique em **Add New**;
2. escolha **Project**;
3. selecione/importe o repositório do Rootis no GitHub;
4. mantenha a raiz do projeto apontando para a pasta onde está o `index.html`.

---

# 9. Configuração de Build do Rootis no Vercel

Como o frontend do Rootis é HTML/CSS/JavaScript puro, configure:

```text
Framework Preset: Other
Root Directory: ./
Build Command: vazio
Output Directory: .
```

Se o Vercel reconhecer automaticamente a raiz e servir o `index.html`, não é necessário criar um build artificial.

A pasta `/api` continuará sendo usada para as Functions do backend.

---

# 10. Conectar Neon ao Vercel — método recomendado

Existem duas formas.

## Opção A — Integração Neon + Vercel

É a forma recomendada.

No projeto do Vercel:

1. abra **Integrations / Marketplace**;
2. procure por **Neon**;
3. conecte o projeto Neon do Rootis;
4. autorize o uso no projeto do Vercel;
5. habilite pelo menos o ambiente **Production**;
6. confira se a integração adicionou a variável de conexão do banco.

A integração atual do Neon com o Vercel pode provisionar/injetar variáveis como `DATABASE_URL` diretamente no projeto.

### Alternativa pelo terminal

Com Vercel CLI instalado e o projeto já vinculado:

```bash
vercel integration add neon
```

Siga as opções mostradas pelo Vercel.

---

# 11. Conectar Neon ao Vercel — método manual

Se não utilizar a integração:

No Vercel:

1. abra o projeto Rootis;
2. vá em **Settings**;
3. abra **Environment Variables**;
4. clique em **Add Environment Variable**;
5. informe:

```text
Name: DATABASE_URL
Value: [COLE A CONNECTION STRING DO NEON]
```

Marque:

```text
Production
```

Se quiser testar Preview Deployments com banco separado ou controlado, configure Preview conscientemente. Não compartilhe dados reais de pacientes em ambientes de teste.

Depois clique em **Save**.

## Muito importante

Depois de adicionar ou alterar uma variável no Vercel, faça um **Redeploy** para que a nova configuração seja aplicada.

---

# 12. Demais variáveis secretas

Abra o arquivo:

```text
.env.example
```

Ele é a fonte de verdade dos **nomes das variáveis** usadas pelo backend seguro do Rootis.

Para cada variável existente no `.env.example`:

1. abra **Vercel → Rootis → Settings → Environment Variables**;
2. crie a variável com o **mesmo nome**;
3. coloque o valor real apenas no painel do Vercel;
4. não coloque o valor no GitHub.

Exemplo conceitual:

```text
DATABASE_URL=...
SEGREDO_DE_SESSAO=...
CHAVE_DE_EMAIL=...
CHAVE_DE_SMS=...
```

**Os nomes reais devem ser exatamente os que estiverem no `.env.example` do pacote seguro.**

---

# 13. Configurar a região das Functions

No Vercel:

1. abra **Settings**;
2. abra a seção de **Functions**;
3. escolha uma região adequada e, quando possível, próxima do banco Neon.

Isso reduz a latência entre a API do Rootis e o PostgreSQL.

Depois da alteração, faça novo deploy.

---

# 14. Criar a conta administrativa do proprietário

A senha do administrador **não deve ser escrita no código**.

Depois que o banco Neon estiver criado e a conexão estiver configurada, use o script seguro:

```text
scripts/create-admin.mjs
```

No computador, entre na pasta do projeto.

Se o pacote possuir `package.json`, instale primeiro as dependências:

```bash
npm install
```

Configure localmente as variáveis necessárias sem enviá-las ao GitHub.

Se estiver usando o Vercel CLI e o projeto estiver vinculado, você também pode baixar as variáveis de desenvolvimento com:

```bash
vercel env pull
```

Depois execute:

```bash
node scripts/create-admin.mjs
```

Siga as instruções do script.

A senha deverá ser transformada em hash pelo servidor/script antes de ser armazenada no banco.

## Nunca faça isso

```javascript
const ADMIN_PASSWORD = "minhaSenha";
```

Também não grave a senha em:

```text
script.js
index.html
localStorage
README.md
GitHub
```

---

# 15. Fazer o primeiro deploy

Depois de confirmar:

- código seguro completo no GitHub;
- pasta `/api` presente;
- `DATABASE_URL` configurada;
- outras variáveis configuradas;
- schema executado no Neon;
- administrador criado;

vá ao Vercel e faça o deploy.

Se o projeto já tiver sido publicado antes das variáveis serem configuradas:

```text
Vercel → Deployments → último deployment → Redeploy
```

---

# 16. Testar o backend antes de configurar o domínio

O Vercel fornecerá um endereço semelhante a:

```text
https://rootis-xxxxx.vercel.app
```

Abra esse endereço.

## Testes mínimos

### Teste 1 — página inicial

A interface deve carregar normalmente.

### Teste 2 — API

A rota:

```text
/api/auth/me
```

não deve retornar erro `404` por ausência da Function.

Sem login ela pode retornar uma resposta de não autenticado, conforme implementado no backend; isso é diferente de a rota não existir.

### Teste 3 — login

Entre usando a conta administrativa criada pelo script.

### Teste 4 — sessão

Atualize a página.

A sessão deve continuar válida por meio do cookie seguro do backend.

### Teste 5 — logout

Clique em sair e confirme que o acesso autenticado foi encerrado.

### Teste 6 — armazenamento de senha

Abra DevTools → Application/Storage.

A senha e o token de sessão não devem aparecer no `localStorage`.

### Teste 7 — painel de proprietário

Confirme que a área **Administrador** somente é exibida para a conta com permissão de proprietário.

---

# 17. Como o frontend do Rootis chama a API

Na versão online o frontend usa:

```text
/api
```

na mesma origem do site.

Exemplo:

```text
https://www.rootis.com.br/api/auth/login
```

Isso evita colocar credenciais ou conexão direta do Neon no navegador.

O navegador conversa com a API do Vercel; a API conversa com o Neon.

```text
Navegador
   ↓
/api do Vercel
   ↓
DATABASE_URL privada
   ↓
Neon
```

---

# 18. Configurar `www.rootis.com.br`

Depois que o endereço `.vercel.app` estiver funcionando:

1. abra o projeto no Vercel;
2. vá em **Settings → Domains**;
3. adicione:

```text
rootis.com.br
```

4. adicione também:

```text
www.rootis.com.br
```

5. escolha `www.rootis.com.br` como domínio principal se quiser manter o padrão já usado no Rootis;
6. configure o redirecionamento do domínio sem `www` para o domínio principal;
7. siga exatamente os registros DNS que o painel do Vercel indicar.

## Importante

Não copie registros DNS antigos de tutoriais. O próprio painel do Vercel mostrará os registros corretos para o domínio e para o provedor DNS atual.

Após alterar DNS, aguarde a propagação e confirme no Vercel que o domínio aparece como válido.

---

# 19. Checklist final de produção

Antes de considerar o Rootis publicado:

```text
[ ] GitHub contém a versão segura completa
[ ] /api está presente
[ ] db/schema.sql correto foi executado no Neon
[ ] DATABASE_URL está somente no servidor
[ ] .env real não foi enviado ao GitHub
[ ] .env.example não contém segredos
[ ] conta administrativa foi criada pelo script seguro
[ ] login funciona no endereço .vercel.app
[ ] sessão sobrevive ao refresh
[ ] logout funciona
[ ] usuário comum não acessa área de proprietário
[ ] /api/auth/me existe e não retorna 404
[ ] senha não aparece no localStorage
[ ] banco não é acessado diretamente pelo frontend
[ ] domínio rootis.com.br está conectado
[ ] www.rootis.com.br está conectado
[ ] HTTPS está ativo
[ ] deploy de produção foi testado em janela anônima
```

---

# 20. Fluxo de atualização depois que o site estiver online

Depois da primeira publicação, o fluxo normal será:

```text
Editar o Rootis
      ↓
Testar localmente
      ↓
git add .
      ↓
git commit
      ↓
git push origin main
      ↓
Vercel detecta o commit
      ↓
Novo deploy automático
```

Assim, não será necessário subir manualmente o site a cada alteração.

---

# 21. Comandos úteis

## Ver o repositório atual

```bash
git remote -v
```

## Ver arquivos alterados

```bash
git status
```

## Enviar atualização

```bash
git add .
git commit -m "update: atualiza Rootis"
git push origin main
```

## Instalar Vercel CLI

```bash
npm install -g vercel
```

## Vincular a pasta local ao projeto Vercel

```bash
vercel link
```

## Baixar variáveis de desenvolvimento

```bash
vercel env pull
```

## Testar usando o ambiente Vercel local

```bash
vercel dev
```

## Deploy manual de produção

```bash
vercel --prod
```

---

# 22. Solução de problemas

## Site abre, mas login diz que não consegue conectar ao servidor

Verifique:

```text
1. a pasta /api existe no GitHub;
2. as rotas de autenticação estão dentro dela;
3. o Vercel publicou as Functions;
4. DATABASE_URL está configurada;
5. o Neon está acessível;
6. foi feito Redeploy após adicionar variáveis.
```

---

## `/api/auth/me` retorna 404

Isso normalmente significa que a rota/backend não foi publicada.

Confira se o pacote seguro com a pasta `/api` está realmente no repositório usado pelo Vercel.

---

## Erro de conexão com o banco

Confira:

```text
DATABASE_URL
usuário do Neon
senha do Neon
nome do banco
SSL
connection string correta
```

Se estiver usando integração Neon + Vercel, confira a integração no projeto e o escopo da variável para **Production**.

---

## Variável foi alterada, mas o erro continua

Faça novo deploy.

No Vercel:

```text
Deployments → Redeploy
```

Variáveis novas/alteradas precisam estar disponíveis no deployment que está sendo executado.

---

## O site retorna 404 na raiz

No Vercel, confira:

```text
Framework Preset: Other
Root Directory: ./
Build Command: vazio
Output Directory: .
```

E confirme que `index.html` está na raiz escolhida.

---

# 23. Regras permanentes de segurança do Rootis

1. Nunca armazenar senha em JavaScript do navegador.
2. Nunca armazenar senha no `localStorage`.
3. Nunca colocar a `DATABASE_URL` no frontend.
4. Nunca enviar `.env` real ao GitHub.
5. Usar cookie de sessão `HttpOnly` no backend.
6. Validar permissões no servidor, e não apenas esconder botões no HTML.
7. Manter credenciais e integrações somente em variáveis de ambiente.
8. Trocar credenciais imediatamente se algum segredo for publicado acidentalmente.
9. Usar HTTPS em produção.
10. Manter backups e proteção adequada para dados de pacientes.

---

# 24. Sequência recomendada para colocar o Rootis no ar

Siga exatamente esta ordem:

```text
1. Confirmar pacote seguro completo
2. Subir código no GitHub
3. Criar projeto no Neon
4. Executar db/schema.sql do Rootis
5. Criar projeto no Vercel a partir do GitHub
6. Conectar Neon ao Vercel
7. Configurar DATABASE_URL e demais variáveis
8. Criar administrador com create-admin.mjs
9. Fazer Redeploy
10. Testar login no endereço .vercel.app
11. Testar permissões e logout
12. Conectar rootis.com.br
13. Conectar www.rootis.com.br
14. Testar novamente em produção
```

---

# 25. Referências oficiais

Vercel — Configuração de Build:

https://vercel.com/docs/builds/configure-a-build

Vercel — Configuração de projeto:

https://vercel.com/docs/project-configuration

Vercel — Variáveis de ambiente:

https://vercel.com/docs/environment-variables

Vercel — Domains:

https://vercel.com/docs/domains

Neon — Documentação:

https://neon.com/docs

Neon — Vercel:

https://neon.com/blog/neon-vercel-native-integration

---

# Rootis

**Agenda, gestão e relacionamento odontológico em uma única plataforma.**

Produção planejada:

```text
https://www.rootis.com.br
```

