# Foco

Pomodoro (com botão de mini janela PiP) + Kanban de tarefas + Agenda + Relatórios + Dashboard.
React (Vite) puro no front, Supabase como backend (Postgres + auth), pensado pra rodar
de graça no GitHub Pages.

## 1. Criar o projeto no Supabase

1. Crie uma conta/projeto em [supabase.com](https://supabase.com) (plano free serve).
2. No painel do projeto, abra **SQL Editor > New query**, cole o conteúdo de
   `schema.sql` (raiz deste projeto) e rode. Isso cria as 3 tabelas
   (`projects`, `tasks`, `pomodoro_sessions`) já com Row Level Security —
   cada linha só é visível/editável por quem a criou.
3. Em **Project Settings > API**, copie a **Project URL** e a chave
   **anon public**. Você vai precisar dos dois em dois lugares (local e
   GitHub Actions, abaixo).
4. (Opcional) Em **Authentication > Providers > Email**, se quiser testar
   rápido sem lidar com confirmação por e-mail, desative "Confirm email".
   Por padrão ela vem ligada.

## 2. Rodar local

\`\`\`bash
npm install
cp .env.example .env
# edite .env com a URL e a anon key do passo 1
npm run dev
\`\`\`

## 3. Publicar no GitHub Pages

O repo já vem com \`.github/workflows/deploy.yml\`: todo push em \`main\` builda
e publica automaticamente. Você só precisa:

1. Criar o repositório no GitHub e dar push neste código.
2. Em **Settings > Pages**, mudar "Source" para **GitHub Actions**.
3. Em **Settings > Secrets and variables > Actions > New repository secret**,
   criar dois secrets:
   - \`VITE_SUPABASE_URL\`
   - \`VITE_SUPABASE_ANON_KEY\`
   (mesmos valores do \`.env\` local — sem eles o build passa mas o app fica
   sem falar com o banco).
4. Dar push em \`main\`. Acompanhe em **Actions**; quando terminar, o link
   fica em Settings > Pages.

O workflow já monta o \`base\` do Vite como \`/nome-do-repo/\` automaticamente.
Se o repositório for uma página raiz (\`usuario.github.io\`), apague a linha
\`VITE_BASE_PATH\` do \`deploy.yml\`.

## 4. Login com Google (opcional)

1. No [Google Cloud Console](https://console.cloud.google.com/), crie (ou
   reaproveite) um projeto e vá em **APIs & Services > OAuth consent screen**.
   Configure como "External", preencha nome do app e e-mail de suporte, e
   publique (ou deixe em "Testing" e adicione seu e-mail como test user).
2. Em **APIs & Services > Credentials > Create Credentials > OAuth client
   ID**, tipo **Web application**.
3. Em **Authorized redirect URIs**, adicione a URL de callback do Supabase:
   `https://<seu-projeto>.supabase.co/auth/v1/callback` (pegue o
   `<seu-projeto>` na Project URL do passo 1).
4. Copie o **Client ID** e o **Client secret** gerados.
5. No painel do Supabase, vá em **Authentication > Providers > Google**,
   ative, cole o Client ID e o Client secret, e salve.
6. Pronto — o botão "Continuar com Google" na tela de login já funciona,
   local e em produção (o `redirectTo` usa a própria origem da página).

## Decisões técnicas que valem registrar

- **Sem back-end próprio.** GitHub Pages só serve estático — não roda Node.
  O Supabase faz o papel do back-end (Postgres + API REST autogerada + auth),
  chamado direto do navegador via SDK. Isso troca prática de design de API
  por um produto pronto mais rápido; RLS em SQL ainda dá alguma prática de
  modelagem/autorização.
- **RLS assume uso individual.** Cada linha pertence a quem criou
  (\`auth.uid() = user_id\`). Não há conceito de time/compartilhamento — se
  quiser abrir pra outras pessoas usarem, a política de segurança muda.
- **\`HashRouter\`, não \`BrowserRouter\`.** GitHub Pages não reescreve rota no
  servidor; uma URL tipo \`/tarefas\` daria 404 num F5. Com hash
  (\`/#/tarefas\`) a navegação nunca depende do servidor.
- **Timer com precisão por timestamp, não por contagem de tick.** O
  navegador reduz a frequência de timers em abas em segundo plano — contar
  ticks atrasaria o pomodoro depois de um tempo minimizado. O tempo restante
  é sempre recalculado contra \`Date.now()\`.
- **Estado do timer persiste no localStorage** e é reidratado ao carregar a
  página, pra um F5 não zerar um ciclo em andamento.
- **PiP é Document Picture-in-Picture (Chrome/Edge only).** É uma API que
  abre uma janela real do SO com um \`document\` próprio — por isso o hook
  copia as folhas de estilo pra dentro dela. Ela só existe enquanto a aba de
  origem segue aberta (pode estar em segundo plano, não pode estar fechada).
  Em navegadores sem suporte, o botão fica desativado e o timer roda normal
  na aba.
- **Uma sessão de pomodoro só é registrada quando o ciclo de foco termina
  naturalmente** (chega a zero rodando). Pausar/reiniciar no meio não grava
  nada parcial — é a definição clássica do método, e evita relatório com
  ciclo incompleto contando como completo.
- **Agenda é uma view sobre \`tasks.due_date\`**, não uma tabela própria de
  evento. Serve pra prazo de tarefa; não serve pra compromisso sem tarefa
  associada (reunião, por exemplo) — se precisar disso, é tabela nova.

## O que ficou de fora (de propósito, por escopo)

- Reordenar tarefas dentro da mesma coluna (dá pra mover entre colunas, não
  dá pra definir ordem manual dentro de uma).
- Tema claro — só existe o tema escuro definido em \`src/index.css\`. Trocar é
  questão de adicionar as variáveis equivalentes sob
  \`@media (prefers-color-scheme: light)\`.
- Notificação/som quando o ciclo termina.
