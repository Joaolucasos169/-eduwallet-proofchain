# 🎓 EduWallet — ProofChain

> **Projeto desenvolvido para o HackWeb Web 3.0 · Residência TIC29**
> Uma solução descentralizada para emissão, armazenamento e verificação instantânea de diplomas acadêmicos utilizando a tecnologia Blockchain.

🌍 **Acesse o projeto online:** [eduwallet-proofchain.vercel.app](https://eduwallet-proofchain.vercel.app/)
---

## 📄 Sobre o Projeto

O **EduWallet** é uma plataforma Web3 criada para solucionar um problema crítico no mercado educacional e profissional: a **fraude e a falsificação de diplomas e certificados de conclusão de curso**. 

Através da imutabilidade da rede blockchain, o sistema atua como um cartório digital descentralizado, permitindo que instituições de ensino registrem a autenticidade de seus documentos oficiais e que empresas ou recrutadores validem essas credenciais em segundos, sem burocracia e sem custos de intermediários.

---

## 🎯 Para que Serve?

* **Para Instituições de Ensino (Ex: SENAC, Universidades):** Permite registrar de forma perene e inviolável que um aluno realmente se formou e obteve aquela qualificação, associando o documento digital à assinatura da instituição na rede.
* **Para Alunos/Candidatos:** Garante a posse de uma credencial digital auditável e infalsificável, pronta para ser apresentada ao mercado de trabalho.
* **Para Empresas e Recrutadores:** Elimina o tempo de espera de auditoria de currículos. Permite verificar de forma imediata se o diploma apresentado por um candidato é legítimo ou se sofreu qualquer tipo de alteração pós-emissão.

---

## ⚙️ Como Funciona?

O funcionamento do sistema é dividido em duas grandes frentes operacionais totalmente integradas:

### 1. Área da Instituição (Emissão e Registro)
1. A instituição de ensino preenche os dados do aluno (Nome Completo e Nome da Instituição) e anexa o arquivo PDF oficial do diploma.
2. O sistema calcula a **impressão digital única (Hash SHA-256)** do arquivo PDF localmente no navegador (garantindo privacidade, já que o arquivo em si não é enviado para a rede).
3. A instituição inicia o registro. A extensão **MetaMask** é acionada para assinar a transação.
4. Os dados (Hash, Nome do Aluno, Nome da Instituição e o Timestamp exato da blockchain) são imutavelmente gravados no Smart Contract na rede de testes **Sepolia**.

### 2. Área da Empresa (Validação e Auditoria)
1. O recrutador recebe o PDF do candidato ou o código Hash do documento.
2. Na interface do sistema, o recrutador anexa o PDF (que gera o mesmo Hash SHA-256 instantaneamente) ou cola o código manualmente.
3. O sistema faz uma consulta direta (*read-only*) ao Smart Contract na Blockchain.
4. Se o Hash for localizado, a interface exibe um alerta de **Documento Autêntico**, trazendo o nome do aluno, a instituição que emitiu e a data exata do registro. Se houver qualquer alteração de uma única letra no PDF, o Hash muda e o sistema acusa o documento como inválido.

---

## 🛠️ Tecnologias Utilizadas

A arquitetura do projeto foi desenhada com foco em performance, agilidade e Web3 nativa, utilizando as seguintes ferramentas:

### Back-end & Blockchain
* **Solidity:** Linguagem utilizada para o desenvolvimento das regras de negócio e persistência de dados no Smart Contract (`EduWallet.sol`), garantindo governança e segurança.
* **JavaScript (ES6+) & Ethers.js v6:** Responsável por criar a ponte (*Web3 Integration*) entre a interface do usuário e a rede blockchain, gerenciando conexões com o provedor da MetaMask e requisições RPC.

### Front-end
* **HTML5:** Estruturação semântica da aplicação e áreas operacionais.
* **CSS3:** Estilização moderna, layout responsivo em grid/flexbox e efeitos visuais imersivos utilizando variáveis nativas (design system focado no tema dark/cybersecurity).

### Ambientes de Desenvolvimento (IDEs) & Deploy
* **Remix IDE:** Ambiente utilizado para a compilação, testes unitários de funções de escrita/leitura e deploy oficial do contrato inteligente na rede Sepolia Testnet.
* **VS Code (Visual Studio Code):** IDE utilizada para o desenvolvimento unificado do código-fonte do ecossistema front-end e scripts de integração do Git.
* **Vercel:** Plataforma de nuvem utilizada para a hospedagem de produção e CI/CD automatizado, integrando o repositório diretamente com o ambiente online.

---

## 📊 Metodologia Ágil

Para garantir a entrega do Produto Mínimo Viável (MVP) dentro do prazo do Hackathon, adotamos a metodologia ágil **Kanban**. 
O fluxo de trabalho foi dividido visualmente em etapas (*To Do, Doing, Done*), permitindo que a equipe acompanhasse o progresso em tempo real, priorizasse as tarefas críticas (como o deploy do Smart Contract e a integração com o Front-end) e evitasse gargalos de desenvolvimento, mantendo todos alinhados e focados no mesmo objetivo.

---

## 👥 Equipe do Projeto

O desenvolvimento deste projeto foi resultado do esforço conjunto da nossa equipe, dividida nas seguintes frentes de atuação:

* **João Lucas:** Back-end (Desenvolvimento do Smart Contract em Solidity e integração lógica com JavaScript/Ethers.js).
* **Mirtes:** Front-end (Estruturação visual e de interface em HTML, CSS e interações dinâmicas em JavaScript).
* **Leila:** Gestão de Produto (Produção de toda a documentação, organização geral e preparação do Pitch de apresentação).

---

## 📁 Estrutura do Repositório
Saída de código
README.md generated successfully.

```text
├── contracts/
│   └── EduWallet.sol       # Código-fonte do Smart Contract em Solidity
├── index.html              # Estrutura principal da interface Web3
├── style.css               # Estilização completa e tokens visuais
├── app.js                  # Lógica de integração Ethers.js e manipulação da UI
└── README.md               # Documentação técnica do projeto
```
## 🚀 Como Executar o Projeto Localmente
Para rodar este projeto na sua máquina, é obrigatório ter a extensão da carteira digital MetaMask instalada no seu navegador.

Clone este repositório para a sua máquina executando o comando no terminal:

```Bash
git clone [https://github.com/Joaolucasos169/eduwallet-proofchain.git]
```

1. Abra a pasta clonada do projeto no seu VS Code.
2. Instale a extensão Live Server no seu VS Code (caso ainda não tenha).
3. No VS Code, clique com o botão direito no arquivo index.html e selecione Open with Live Server. O projeto abrirá no seu navegador padrão.
4. No seu navegador, abra a extensão MetaMask, faça o login e certifique-se de alterar a rede para a Sepolia Testnet.
5. Pronto! Agora é só interagir com a aplicação clicando em "Conectar Carteira".
