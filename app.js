// ═══════════════════════════════════════════
//  EDUWALLET — app.js
//  ProofChain · HackWeb · Residência TIC29
// ═══════════════════════════════════════════
//
//  ESTRUTURA:
//  1. Configuração ethers.js + Contrato
//  2. Conexão MetaMask — conectarCarteira()
//  3. Eventos MetaMask (troca de conta/rede)
//  4. Funções de Escrita e Leitura do Contrato
//  5. Utilitários (hash, toast, helpers de UI)
//  6. Dropzone (drag & drop)
//  7. Área da Instituição (registrar)
//  8. Área da Empresa (validar)
//  9. Init
// ═══════════════════════════════════════════


// ──────────────────────────────────────────
// 1. CONFIGURAÇÃO ETHERS.JS + CONTRATO
//    ⚠️  João Lucas: preencha CONTRACT_ADDRESS
//    e CONTRACT_ABI após o deploy no Remix IDE.
// ──────────────────────────────────────────

/**
 * Endereço do contrato na Sepolia Testnet.
 * Substituir após o deploy no Remix IDE.
 * Exemplo: "0xAbC123...def456"
 */
const CONTRACT_ADDRESS = "0xbcc2610B5d6C940e57fC7D2B94A5b436b7e471C6";

/**
 * ABI mínima do contrato EduWallet.
 * Substituir pela ABI completa gerada pelo Remix.
 */
const CONTRACT_ABI = [
  // Registra um diploma na blockchain (escrita — gasta gas)
  "function registrarDiploma(string memory hashDoc, string memory nomeAluno, string memory instituicao) public",

  // Verifica se um hash existe e retorna os dados (leitura — grátis)
  "function verificarDiploma(string memory hashDoc) public view returns (bool valido, string memory nomeAluno, string memory instituicao, uint256 timestamp)"
];

// RPC público Sepolia para leituras sem MetaMask
const SEPOLIA_RPC = "https://rpc.sepolia.org";

// Estado global da conexão
let provider         = null; // ethers.BrowserProvider (MetaMask)
let signer           = null; // carteira conectada (assina transações)
let contract         = null; // instância do contrato com signer (escrita)
let contractReadOnly = null; // instância somente leitura (sem signer)


// ──────────────────────────────────────────
// 2. CONEXÃO METAMASK — conectarCarteira()
//    Chamada pelo botão 🦊 no header.
// ──────────────────────────────────────────

async function conectarCarteira() {
  const btnLabel = document.getElementById('wallet-label');
  const btnIcon  = document.getElementById('wallet-icon');
  const btn      = document.getElementById('btn-wallet');

  if (typeof window.ethereum === 'undefined') {
    showToast('error', '🦊 MetaMask não encontrada! Instale em metamask.io');
    return;
  }

  try {
    btn.disabled = true;
    btnLabel.textContent = 'Conectando...';

    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();

    const endereco = await signer.getAddress();
    const rede     = await provider.getNetwork();

    // Instancia contrato com escrita (signer) e leitura (provider)
    contract         = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    contractReadOnly = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    // Atualiza UI do botão
    btnIcon.textContent  = '✅';
    btnLabel.textContent = endereco.slice(0, 6) + '...' + endereco.slice(-4);
    btn.classList.add('btn-wallet--connected');
    btn.disabled = false;

    // Atualiza status da rede no footer
    atualizarFooterRede(rede);

    // Avisa se não está na Sepolia (chainId 11155111)
    if (rede.chainId !== 11155111n) {
      showToast('warn', `⚠️ Rede "${rede.name}" detectada. Use a Sepolia Testnet.`);
    } else {
      showToast('success', '✅ Carteira conectada com sucesso!');
    }

    // Habilita botão registrar se hash já está disponível (via PDF ou campo manual)
    const hashViaPDF    = document.getElementById('inst-hash-value').textContent;
    const hashViaManual = document.getElementById('inst-hash-manual').value.trim();
    if ((hashViaPDF && hashViaPDF !== '—') || hashViaManual) {
      document.getElementById('btn-registrar').disabled = false;
    }

    console.log(`✅ Carteira: ${endereco} | Rede: ${rede.name} (${rede.chainId})`);

  } catch (err) {
    btnLabel.textContent = 'Conectar Carteira';
    btnIcon.textContent  = '🦊';
    btn.classList.remove('btn-wallet--connected');
    btn.disabled = false;
    signer = null;
    contract = null;

    if (err.code !== 4001) { // 4001 = usuário clicou em "Cancelar"
      showToast('error', '❌ Erro ao conectar: ' + (err.message || err));
      console.error('Erro MetaMask:', err);
    }
  }
}


// ──────────────────────────────────────────
// 3. EVENTOS METAMASK
//    Ouve troca de conta e troca de rede
//    para manter a UI sempre sincronizada.
// ──────────────────────────────────────────

function iniciarEventosMetaMask() {
  if (typeof window.ethereum === 'undefined') return;

  // Usuário trocou de conta na MetaMask
  window.ethereum.on('accountsChanged', (accounts) => {
    if (accounts.length === 0) {
      // Desconectou todas as contas
      signer   = null;
      contract = null;
      contractReadOnly = null;

      document.getElementById('wallet-icon').textContent  = '🦊';
      document.getElementById('wallet-label').textContent = 'Conectar Carteira';
      document.getElementById('btn-wallet').classList.remove('btn-wallet--connected');
      document.getElementById('btn-registrar').disabled = true;
      atualizarFooterRede(null);
      showToast('warn', '⚠️ Carteira desconectada.');
    } else {
      // Reconecta com a nova conta
      showToast('warn', '🔄 Conta trocada. Reconectando...');
      conectarCarteira();
    }
  });

  // Usuário trocou de rede na MetaMask
  window.ethereum.on('chainChanged', () => {
    showToast('warn', '🔄 Rede alterada. Recarregando...');
    // Recarregar é a prática recomendada pela MetaMask para troca de rede
    setTimeout(() => window.location.reload(), 1200);
  });
}

/** Atualiza o status da rede no footer */
function atualizarFooterRede(rede) {
  const dot = document.getElementById('footer-dot');
  const txt = document.getElementById('footer-net');

  if (!rede) {
    dot.style.background = 'var(--muted)';
    txt.textContent = 'Aguardando carteira';
    return;
  }

  const naSepolia = rede.chainId === 11155111n;
  dot.style.background = naSepolia ? 'var(--success)' : 'var(--warn, #f59e0b)';
  txt.textContent = naSepolia
    ? 'Sepolia Testnet · Conectado'
    : `${rede.name} · Rede incorreta`;
}


// ──────────────────────────────────────────
// 4. FUNÇÕES DE ESCRITA E LEITURA
//    Ponte direta frontend → smart contract.
// ──────────────────────────────────────────

/**
 * ESCRITA — registrarDiplomaContrato()
 * Envia tx ao contrato. Abre MetaMask para o usuário confirmar.
 * Requer carteira conectada (signer).
 *
 * @param {string} hashDoc     - Hash SHA-256 do PDF
 * @param {string} nomeAluno   - Nome completo do aluno
 * @param {string} instituicao - Nome da instituição emissora
 * @returns {{ tx: string, bloco: number, timestamp: string }}
 */
async function registrarDiplomaContrato(hashDoc, nomeAluno, instituicao) {
  if (!contract) {
    throw new Error('Carteira não conectada. Conecte a MetaMask primeiro.');
  }
  if (!signer) {
    throw new Error('Signer indisponível. Reconecte a carteira.');
  }

  // Envia a transação — MetaMask abre para o usuário aprovar e pagar gas
  const tx = await contract.registrarDiploma(hashDoc, nomeAluno, instituicao);

  // Aguarda confirmação na blockchain (1 bloco)
  const recibo = await tx.wait(1);

  return {
    tx:        recibo.hash,
    bloco:     recibo.blockNumber,
    timestamp: new Date().toLocaleDateString('pt-BR'),
  };
}

/**
 * LEITURA — verificarDiplomaContrato()
 * Consulta o contrato via eth_call (sem gas, sem carteira obrigatória).
 * Usa RPC público da Sepolia como fallback se não houver provider.
 *
 * @param {string} hashDoc - Hash SHA-256 do PDF a verificar
 * @returns {object|null}  - Dados do diploma ou null se não encontrado
 */
async function verificarDiplomaContrato(hashDoc) {
  // Garante que existe um leitor — usa provider da MetaMask ou RPC público
  if (!contractReadOnly) {
    const providerFallback = new ethers.JsonRpcProvider(SEPOLIA_RPC);
    contractReadOnly = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, providerFallback);
  }

  // eth_call — gratuito, não precisa de signer
  const resultado = await contractReadOnly.verificarDiploma(hashDoc);

  // resultado[0] = bool valido
  if (!resultado[0]) return null;

  return {
    aluno:       resultado[1],
    instituicao: resultado[2],
    data:        new Date(Number(resultado[3]) * 1000).toLocaleDateString('pt-BR'),
  };
}


// ──────────────────────────────────────────
// 5. UTILITÁRIOS
// ──────────────────────────────────────────

/** Gera string hex aleatória (usada no mock) */
function randomHex(len) {
  const chars = '0123456789abcdef';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * 16)]).join('');
}

/** Calcula SHA-256 de um File e retorna hex string */
async function sha256(file) {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Mostra/oculta spinner e troca label do botão */
function setLoading(spinnerId, labelId, loading, label) {
  document.getElementById(spinnerId).style.display = loading ? 'block' : 'none';
  document.getElementById(labelId).textContent = label;
}

/** Exibe elemento (flex ou block) */
function show(id, flex = false) {
  const el = document.getElementById(id);
  el.style.display = flex ? 'flex' : 'block';
}

/** Oculta elemento */
function hide(id) {
  document.getElementById(id).style.display = 'none';
}

/** Trunca hash para exibição resumida */
function shortHash(hash) {
  return hash.slice(0, 10) + '...' + hash.slice(-8);
}

/**
 * Toast visual (substitui alert nativo).
 * @param {'success'|'error'|'warn'} tipo
 * @param {string} mensagem
 */
function showToast(tipo, mensagem) {
  const toast = document.getElementById('toast');
  const msg   = document.getElementById('toast-msg');

  msg.textContent = mensagem;

  // Remove classes anteriores
  toast.classList.remove('toast--success', 'toast--error', 'toast--warn', 'toast--show');

  toast.classList.add(`toast--${tipo}`);

  // Força reflow para reiniciar animação
  void toast.offsetWidth;
  toast.classList.add('toast--show');

  // Remove após 4 segundos
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('toast--show'), 4000);
}

/** Copia o hash da instituição para a área de transferência */
async function copiarHash() {
  const hash = document.getElementById('inst-hash-value').textContent;
  if (!hash || hash === '—') return;

  try {
    await navigator.clipboard.writeText(hash);
    document.getElementById('copy-icon').textContent = '✅';
    setTimeout(() => { document.getElementById('copy-icon').textContent = '⎘'; }, 1800);
  } catch {
    showToast('error', '❌ Não foi possível copiar. Selecione e copie manualmente.');
  }
}

/**
 * Mock local — fallback enquanto contrato não está deployado.
 * Quando CONTRACT_ADDRESS for preenchido, usarMock() retorna false
 * e todas as chamadas vão para a blockchain real.
 */
const _mock = { _data: {} };
function usarMock() {
  return CONTRACT_ADDRESS === "COLE_O_ENDERECO_DO_CONTRATO_AQUI";
}


// ──────────────────────────────────────────
// 6. DROPZONE — DRAG & DROP
// ──────────────────────────────────────────

function initDropzone(dzId, fileInputId, onFile) {
  const dz    = document.getElementById(dzId);
  const input = document.getElementById(fileInputId);

  dz.addEventListener('dragover', (e) => {
    e.preventDefault();
    dz.classList.add('dragging');
  });

  dz.addEventListener('dragleave', () => dz.classList.remove('dragging'));

  dz.addEventListener('drop', (e) => {
    e.preventDefault();
    dz.classList.remove('dragging');
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  });

  input.addEventListener('change', () => {
    if (input.files[0]) onFile(input.files[0]);
  });
}


// ──────────────────────────────────────────
// 7. ÁREA DA INSTITUIÇÃO — REGISTRAR
// ──────────────────────────────────────────

let instHashAtual = null;

function initInstituicao() {
  initDropzone('dz-inst', 'inst-file', async (file) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      showToast('error', '❌ Apenas arquivos PDF são aceitos.');
      return;
    }

    const fname = document.getElementById('inst-filename');
    fname.textContent = '📎 ' + file.name;
    fname.style.display = 'block';

    const hash = await sha256(file);
    instHashAtual = hash;

    // Mostra a hash-box e preenche o campo manual também
    show('inst-hash-box');
    document.getElementById('inst-hash-value').textContent = hash;
    document.getElementById('inst-hash-manual').value = hash;

    document.getElementById('btn-registrar').disabled = !usarMock() && !signer;
    hide('inst-result');
  });

  // Campo hash manual: habilita botão ao digitar e sincroniza instHashAtual
  document.getElementById('inst-hash-manual').addEventListener('input', (e) => {
    const val = e.target.value.trim();
    instHashAtual = val || null;
    document.getElementById('btn-registrar').disabled =
      !val || (!usarMock() && !signer);
    hide('inst-result');
  });

  document.getElementById('btn-registrar').addEventListener('click', registrar);
}

async function registrar() {
  const nome = document.getElementById('inst-nome').value.trim();
  const inst = document.getElementById('inst-nome-inst').value.trim();

  if (!nome || !inst) {
    showToast('error', '❌ Preencha o nome do aluno e a instituição.');
    return;
  }
  if (!instHashAtual) {
    showToast('error', '❌ Anexe o PDF do diploma antes de registrar.');
    return;
  }
  if (!usarMock() && !signer) {
    showToast('warn', '🦊 Conecte sua carteira MetaMask para registrar.');
    return;
  }

  setLoading('spin-inst', 'btn-inst-label', true, 'Enviando para a blockchain...');
  document.getElementById('btn-registrar').disabled = true;
  hide('inst-result');

  try {
    let registro;

    if (usarMock()) {
      // ── MODO MOCK ──
      await new Promise(r => setTimeout(r, 2000));
      _mock._data[instHashAtual] = {
        aluno:       nome,
        instituicao: inst,
        data:        new Date().toLocaleDateString('pt-BR'),
      };
      registro = {
        tx:    '0x' + randomHex(64),
        bloco: Math.floor(Math.random() * 1e6 + 5e6),
      };
    } else {
      // ── MODO REAL (Sepolia) ──
      registro = await registrarDiplomaContrato(instHashAtual, nome, inst);
    }

    setLoading('spin-inst', 'btn-inst-label', false, '📋 Registrar Diploma');
    document.getElementById('btn-registrar').disabled = false;
    document.getElementById('inst-result-sub').textContent =
      `Aluno: ${nome} · Tx: ${shortHash(registro.tx)} · Bloco #${registro.bloco}`;
    show('inst-result', true);
    showToast('success', '✅ Diploma registrado na blockchain!');

  } catch (err) {
    setLoading('spin-inst', 'btn-inst-label', false, '📋 Registrar Diploma');
    document.getElementById('btn-registrar').disabled = false;
    showToast('error', '❌ Erro: ' + (err.reason || err.message || 'Tente novamente.'));
    console.error('Erro ao registrar:', err);
  }
}


// ──────────────────────────────────────────
// 8. ÁREA DA EMPRESA — VALIDAR
// ──────────────────────────────────────────

function initEmpresa() {
  initDropzone('dz-emp', 'emp-file', async (file) => {
    // Valida tipo do arquivo
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      showToast('error', '❌ Apenas arquivos PDF são aceitos.');
      return;
    }

    const fname = document.getElementById('emp-filename');
    fname.textContent = '📎 ' + file.name;
    fname.style.display = 'block';

    const hash = await sha256(file);

    // Preenche o campo de hash e limpa campo anterior
    const campoHash = document.getElementById('emp-hash');
    campoHash.value = hash;

    // Esconde resultados anteriores ao carregar novo arquivo
    hide('emp-result-ok');
    hide('emp-result-fail');
  });

  document.getElementById('btn-validar').addEventListener('click', validar);

  // Limpa resultados quando o usuário edita o hash manualmente
  document.getElementById('emp-hash').addEventListener('input', () => {
    hide('emp-result-ok');
    hide('emp-result-fail');
  });
}

async function validar() {
  const hash = document.getElementById('emp-hash').value.trim();

  if (!hash) {
    showToast('error', '❌ Anexe um PDF ou informe o hash para validar.');
    return;
  }

  setLoading('spin-emp', 'btn-emp-label', true, 'Consultando blockchain...');
  document.getElementById('btn-validar').disabled = true;
  hide('emp-result-ok');
  hide('emp-result-fail');

  try {
    let dados;

    if (usarMock()) {
      // ── MODO MOCK ──
      await new Promise(r => setTimeout(r, 1800));
      dados = _mock._data[hash] || null;
    } else {
      // ── MODO REAL ──
      dados = await verificarDiplomaContrato(hash);
    }

    setLoading('spin-emp', 'btn-emp-label', false, '🔍 Verificar Autenticidade');
    document.getElementById('btn-validar').disabled = false;

    if (dados) {
      document.getElementById('emp-result-ok-sub').textContent =
        `Aluno: ${dados.aluno} · Instituição: ${dados.instituicao} · Emitido em: ${dados.data}`;
      show('emp-result-ok', true);
      showToast('success', '✅ Diploma autêntico e verificado!');
    } else {
      show('emp-result-fail', true);
      showToast('error', '❌ Hash não encontrado na blockchain.');
    }

  } catch (err) {
    setLoading('spin-emp', 'btn-emp-label', false, '🔍 Verificar Autenticidade');
    document.getElementById('btn-validar').disabled = false;
    showToast('error', '❌ Erro: ' + (err.reason || err.message || 'Tente novamente.'));
    console.error('Erro ao verificar:', err);
  }
}


// ──────────────────────────────────────────
// 9. INIT
// ──────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initInstituicao();
  initEmpresa();
  iniciarEventosMetaMask();

  // Se MetaMask já tinha conta autorizada, reconecta silenciosamente
  if (typeof window.ethereum !== 'undefined') {
    window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
      if (accounts.length > 0) conectarCarteira();
    });
  }
});
