# Design: portfolio "ASCII vivo" (direção C)

Data: 2026-10-23 · Autor: Rafael André (decisões) com Claude (redação)
Protótipo de referência: artifact "Motion Lab" (https://claude.ai/artifact/XT7PSKRhR4UYJyJgA4pRzJ). Tem demos interativas de quase todas as peças descritas aqui. É uma referência visual e não código para copiar: está escrito em JS solto, sem React.

## 1. Intenção

O portfolio já tem identidade de terminal: fundo `#14141a`, verde `#34d399`, Fira Code e Geist, `$ whoami` a escrever, divisores `$ cd ../projects`, backdrops com glifos, terminal de contacto, 404 em terminal e Konami. O Rafael quer que o site seja uma experiência única e dele, no espírito do animejs.com: movimento brincalhão e tecnicamente impressionante.

A direção escolhida é a **C, ASCII generativo**: o site é um terminal vivo feito de caracteres. O conteúdo continua a ser uma página normal com scroll. As animações reforçam a metáfora de terminal sem esconder o conteúdo.

## 2. Objetivos, não-objetivos e anti-objetivos

**Objetivos**
- Hero com um campo ASCII vivo como assinatura do site.
- Cada secção ganha uma metáfora de terminal própria (git log, npm install, glitch) aplicada aos componentes que já existem.
- Camada de exploração opcional: shell com Ctrl+K, som e modo CRT.

**Não-objetivos**
- Não usar WebGL, three.js, GSAP nem Lenis.
- O divisor em circuito SVG e o cursor em bloco ficam fora. Foram testados no Motion Lab e descartados.
- Não mudar o conteúdo nem a estrutura das secções: Hero, Experience, Projects, Contact e Footer continuam iguais.
- Não criar tema claro.
- Não fazer um site navegável só por comandos.

**Anti-objetivos.** Mesmo que tudo funcione, o trabalho falhou se:
- um recrutador não vir nome, função, projetos e contacto em menos de 5 segundos;
- o arranque aparecer em todas as visitas ou não der para saltar;
- houver jank visível num telemóvel médio, ou mais de um canvas pesado a correr ao mesmo tempo;
- aparecerem erros de hidratação (SSR ≠ primeiro render do cliente);
- o texto animado deixar de ser legível ou acessível a leitores de ecrã.

## 3. Restrições

- Stack existente: Next.js 16 App Router, React 19.2, TypeScript, Tailwind v4 e framer-motion 12.
- **Biblioteca nova: `animejs` fixada em `4.5.0`**, sem `^`. Houve breaking changes dentro da 4.x. Importar só o necessário (subpaths `animejs/text`, `animejs/svg`, etc.). Usar o padrão `createScope({ root })` dentro de `useEffect`, com `scope.revert()` no cleanup.
- **Divisão de trabalho entre bibliotecas:** o framer-motion continua com o que já faz (`AnimatePresence`, `layoutId`, `whileInView`). O anime.js entra para scramble, split text, desenho de SVG, staggers e timelines. **Nunca animar o mesmo elemento com as duas.** Se for preciso, envolver o elemento num wrapper.
- **Movimento reduzido:** `HONOR_REDUCED_MOTION = false` em `app/src/lib/motion.ts` é uma decisão deliberada do Rafael e não se altera. Todos os componentes novos têm de passar por `useSiteReducedMotion()` ou `siteReducedMotion()`, para que mudar essa flag continue a controlar o site inteiro num só passo.
- **SSR:** nada de ramificar JSX com base em valores que só existem no cliente, como o padrão já documentado em `motion.ts`.
- **Canvas:** param fora do ecrã (IntersectionObserver) e com o separador escondido. DPR limitado a 2. Densidade menor em ecrãs pequenos ou quando `navigator.hardwareConcurrency <= 4`. O `SectionBackdrop` já segue este modelo e serve de referência.
- Paleta e tipografia atuais, sem cores novas além das que o Motion Lab já usa: hash `#e5c07b` e ref `#7dd3fc` para o git log.

## 4. O que foi decidido, peça a peça

### 4.1 Arranque (primeira visita)
- Ecrã tipo BIOS com no máximo 1,5 s, **uma vez por sessão** (`sessionStorage`). Salta-se com clique, qualquer tecla ou o botão "skip".
- Enquanto passam as linhas `[ OK ]`, as **iniciais RA formam-se em ASCII a partir de ruído**, como logótipo de boot ao estilo do neofetch. Referência: demos "Monograma em ASCII" e "Arranque tipo BIOS" no Motion Lab.
- A última linha é `$ whoami`, e o hero continua a partir daí. O `$ whoami` do hero não deve aparecer duas vezes de forma visível no corte.
- Sem JavaScript, o arranque nunca aparece e o hero vê-se normalmente.
- O ecrã de arranque não pode piscar o hero antes de aparecer. A abordagem sugerida é um script inline mínimo no `<head>`, que marca `<html>` quando a flag de sessão não existe, mais o markup do overlay presente no HTML do servidor e mostrado só com essa marca. A forma exata fica para quem implementa, desde que respeite os anti-objetivos.

### 4.2 Hero: campo de glifos
- **Um único canvas** substitui o `StarfieldBackground` (`components/ui/starfield.tsx`) no `Hero.tsx`.
- Em repouso é um **starfield feito de caracteres**: cada estrela é um glifo que cresce de `.` até `#` à medida que se aproxima. Perto do cursor, os caracteres ficam mais densos (rampa ` .·:-=+*#%@`), e cada clique ou toque solta uma onda. Referências: demos "Campo ASCII reativo" e "Starfield em glifos". Este canvas junta as duas.
- Sem cursor (touch), o foco de densidade deriva sozinho e o toque cria ondas.
- **Modelo de render: um canvas, dois passes no mesmo frame.**
  1. Estrelas em glifos, esparsas e visíveis em toda a área. O cursor desloca ligeiramente o centro de fuga.
  2. A grelha de densidade fica **invisível em repouso** e só aparece à volta do cursor (raio de cerca de 45% do lado menor) e nas ondas. Nas células onde aparece, sobrepõe-se às estrelas.

  Assim o hero lê-se como starfield e o cursor "acende" a matriz de caracteres. Em telemóveis fracos, o passe 2 reduz a densidade das células.
- O texto do hero (nome, função a escrever, botões) não muda.

### 4.3 Texto
- **Títulos que se decifram** (`scrambleText`) aplicam-se em três sítios:
  1. no hover dos itens da navbar;
  2. no título do emprego quando se muda de separador na Experience;
  3. no título do projeto quando se muda de separador em Projects.

  **Não** se aplicam aos `SectionDivider`, que mantêm a digitação atual.
- **Revelação palavra a palavra** (`splitText` com `words: { wrap: 'clip' }`) aplica-se à descrição do projeto, sempre que se muda de projeto. Tem de continuar acessível: `accessible: true`, que é o default.

### 4.4 Experience: lista lateral como `git log --graph`
- A estrutura da secção mantém-se: janela, separadores à esquerda, detalhe à direita e anexos.
- **A lista lateral passa a ser um grafo de commits:**
  - Ordem do mais recente para o mais antigo, como no `git log`. Hoje `WORK_EXPERIENCE` está do mais antigo para o mais recente.
  - Cada emprego mostra hash curto, empresa, cargo e data.
  - Linhas SVG ligam os commits e desenham-se (`createDrawable`) quando a secção entra no ecrã.
  - O estágio de verão na BorgWarner é um **ramo** que sai do commit anterior e volta ao commit "BorgWarner · Software Developer Intern".
  - **Só empregos.** O grafo não tem commit `init` nem ramo `rhy` (os nós extra do Motion Lab ficam fora). A única ref mostrada é `(HEAD -> main)` no emprego mais recente.
  - Clicar num commit abre o detalhe à direita, apresentado como `git show <hash>`.
  - O separador ativo continua a usar o indicador `layoutId` atual ou um equivalente.
  - Referência: demo "Experiência como git log".
- **Hashes estáveis**, derivados de título e data, iguais entre o servidor e o cliente.
- **"Skills gained" passa a `npm install`:** ao abrir um emprego, as skills instalam-se como pacotes. Há spinner, barra `[████░░]` e linhas `+ customer-service`, e termina em `added N packages`. Isto substitui a animação atual das pills. Referência: demo "Stack como npm install".

### 4.5 Projects
- A estrutura mantém-se: separadores à esquerda e um projeto de cada vez à direita.
- **Spotlight:** um brilho verde segue o cursor dentro do painel do projeto ativo e acende a borda. Substitui o glow de hover atual do preview.
- **Botões magnéticos:** os links do projeto (GitHub, live, vídeo) são puxados para o cursor quando ele se aproxima. Usar `createAnimatable`.
- Mais o scramble do título e a revelação da descrição de 4.3.

### 4.6 Navegação: glitch
- Clicar num item da navbar (e no botão "View Projects" do hero) troca o scroll suave por um **glitch de cerca de 250 ms**: fatias com `clip-path`, separação RGB e salto direto para a secção a meio do efeito.
- O `SectionDivider` de destino escreve o `cd` como já faz hoje.
- Os anchors reais mantêm-se (clique direito e deep links funcionam).

### 4.7 Shell com Ctrl+K
- Overlay global que abre com Ctrl/⌘+K. Em touch, abre por um botão de terminal na navbar.
- Comandos: `help`, `whoami`, `ls`, `ls projects`, `cat about.txt`, `cat <projeto>`, `open <projeto>`, `neofetch`, `history`, `clear`, `theme crt` / `theme default`, `sudo hire-me`.
- Tem Tab-complete e histórico com ↑/↓. Há botões rápidos com os comandos principais para quem não quer escrever.
- Os dados vêm de `app/src/data/data.ts`. Nada é duplicado à mão.
- `sudo hire-me` (e `contact`) fecha o overlay, leva a `#contact` e põe o foco no input do `ContactTerminal`.
- O vocabulário e o estilo das respostas devem ser consistentes com o `ContactTerminal` e o `NotFoundTerminal`.
- Referência: demo "Mini shell".

### 4.8 Som
- Toggle na navbar, **desligado por defeito** e lembrado em `localStorage`.
- Sons gerados com WebAudio, sem ficheiros: clique ao escrever, bip no Enter e bip grave em erro.
- Usado no shell e no `ContactTerminal`. **O arranque não tem som:** acontece antes de qualquer interação, por isso o browser bloquearia o áudio de qualquer forma.
- O `AudioContext` só é criado depois de o utilizador ligar o som.

### 4.9 Easter eggs
- **Modo CRT:** scanlines, brilho de fósforo e vinheta sobre a página toda. O Konami passa a ligar e desligar o CRT, **substituindo o arco-íris atual**, e o toast mantém-se. Também liga com `theme crt` no shell.
- **Tokens da stack nos backdrops:** os glifos do `SectionBackdrop` (variante `glyph`) passam a ser tokens da stack (`const`, `=>`, `{}`, `prisma`, `await`…) em vez de caracteres aleatórios.
- **Chuva de tokens completa** atrás do `NotFoundTerminal`, só na 404. A página de erro (`error.tsx`) não a usa. Referência: demo "Chuva de tokens".

### 4.10 Progresso de scroll em texto
- O `ScrollProgress` passa a mostrar `[██████░░░░] 62%` em Fira Code, discreto.
- Em ecrãs pequenos pode manter-se a barra de 2 px atual.

## 4.10b Perfil (texto de identidade)
- Nova exportação `PROFILE` em `app/src/data/data.ts`, lida pelo arranque, `whoami`, `neofetch` e `cat about.txt`:
  - função: **"Software Engineer @ RHY Consulting"** (decidido pelo Rafael);
  - about: "Software engineer. Builds platforms end to end: schema, auth, payments, deploy pipelines. Currently at RHY Consulting, through Alongside." (aprovado pelo Rafael).
- A função rotativa do hero (`ROLES` em `Hero.tsx`) e o título do site não mudam neste trabalho.
- Atenção: a entrada "Alongside" em `WORK_EXPERIENCE` diz o contrário ("at Alongside… through RHY Consulting"). O Rafael confirmou que o certo é RHY através da Alongside. Corrigir só com o OK dele, porque o ficheiro tem alterações dele por guardar.

## 4.11 Âmbito global
- A camada global (shell, som, CRT e Konami) existe **em todas as rotas**, incluindo a 404 e a página de erro. Os providers e o script pré-pintura vão para `app/layout.tsx`, através de um componente cliente.
- Fora da home, os comandos que apontam para secções navegam para `/#<secção>`. Por exemplo, `sudo hire-me` vai para `/#contact`.
- O arranque e o glitch de navegação são só da home.

## 5. Escolhas do Claude (o Rafael pode reverter)
- Juntar o starfield de glifos e o campo reativo num só canvas, e levar as iniciais RA para o arranque. A proposta foi aceite pelo Rafael ("faz sentido").
- Na navegação fica só o glitch; o "clear" fica apenas dentro do shell. Também aceite.
- O CRT persiste até ser desligado, apenas na sessão: não fica guardado em `localStorage`.
- Abrir o shell em touch com um botão na navbar.
- Usar o glitch também no botão "View Projects" do hero, por consistência.
- Remover `components/ui/starfield.tsx` se deixar de ser usado.
- Modelo de render do hero (4.2): estrelas sempre visíveis e grelha só à volta do cursor e das ondas.
- Grafo só com empregos, sem `init` nem ramo `rhy` (4.4).
- Arranque sem som (4.8).
- Camada global em todas as rotas (4.11).

## 6. O que fica para quem implementa
- Nomes e organização dos componentes novos. Os caminhos usados no Motion Lab (ex.: `Hero/GlyphField.tsx`, `CommandPalette/Shell.tsx`, `lib/sfx.ts`) são sugestões.
- A técnica exata para o arranque não piscar (dentro das restrições de 4.1).
- Como guardar a forma do grafo (que entrada é ramo): um campo opcional em `WORK_EXPERIENCE` ou um mapa no componente.
- A disposição da Experience e de Projects em telemóvel. Hoje os separadores passam a scroll horizontal; o grafo pode simplificar-se aí, desde que hash e empresa continuem visíveis.
- A ordem de implementação e a divisão em PRs. Sugestão: anime.js e utilitários base primeiro; depois o hero e o arranque; depois as secções; por fim a camada global (shell, som, CRT, glitch).
- Os valores finos de animação (durações, eases, densidades), guiados pelo Motion Lab.

## 7. Verificação esperada
- `npm run lint` e `npm run build` sem erros.
- Sem avisos de hidratação na consola em `npm run dev`.
- Verificação visual a 1280 px e a 400 px: hero legível em menos de 5 s; arranque só na primeira visita da sessão; sem scroll horizontal.
- Com o separador escondido ou a secção fora do ecrã, os canvas param (verificável no profiler).
- Com `HONOR_REDUCED_MOTION = true` e o SO a pedir menos movimento, todas as peças novas assentam no estado final sem animar.
