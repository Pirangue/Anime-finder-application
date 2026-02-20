import './style.css'

// ── State ──
let isLoading = false;
let results = [];
let quotaInfo = null;
let errorMsg = '';
let previewFile = null; // para armazenar a imagem selecionada localmente

// ── Render principal ──
function render() {
  const app = document.querySelector('#app');
  app.innerHTML = `
    <header class="header">
      <div class="header-inner">
        <h1 class="logo">🔍 <span>Anime Scene Finder</span></h1>
        <p class="subtitle">Descubra de qual anime é aquela cena! Envie uma imagem e encontraremos o anime, episódio e momento exato.</p>
        <button class="btn-quota" id="btn-quota" title="Ver cota de uso">📊 Minha Cota</button>
      </div>
    </header>

    <main class="main">
      <!-- Seção de busca -->
      <section class="search-section card">
        <h2>📤 Enviar Imagem</h2>

        <!-- Abas -->
        <div class="tabs" role="tablist">
          <button class="tab active" data-tab="upload" role="tab">📁 Upload de Arquivo</button>
          <button class="tab" data-tab="url" role="tab">🔗 URL da Imagem</button>
        </div>

        <!-- Upload tab -->
        <div class="tab-panel active" id="panel-upload">
          <div class="drop-zone" id="drop-zone">
            <div class="drop-zone-content">
              ${previewFile 
                ? `<img src="${previewFile}" class="preview-thumb" alt="Preview" />`
                : `<span class="drop-icon">📂</span>
                   <p>Arraste uma imagem aqui ou <strong>clique para selecionar</strong></p>
                   <p class="drop-hint">JPG, PNG, GIF, WEBP ou vídeo (máx. 25MB)</p>`
              }
            </div>
            <input type="file" id="file-input" accept="image/*,video/*" hidden />
          </div>
        </div>

        <!-- URL tab -->
        <div class="tab-panel" id="panel-url">
          <div class="url-input-group">
            <input type="url" id="url-input" placeholder="https://exemplo.com/screenshot.jpg" />
          </div>
        </div>

        <!-- Opções -->
        <div class="options">
          <label class="checkbox-label" title="Remove bordas pretas automaticamente para melhor precisão">
            <input type="checkbox" id="opt-cut-borders" />
            <span>✂️ Cortar bordas pretas</span>
          </label>
          <label class="checkbox-label" title="Inclui informações detalhadas do anime (títulos, status adulto, etc.)">
            <input type="checkbox" id="opt-anilist-info" checked />
            <span>ℹ️ Incluir info do Anilist</span>
          </label>
          <div class="anilist-filter">
            <label for="opt-anilist-id">🎯 Filtrar por Anilist ID (opcional):</label>
            <input type="number" id="opt-anilist-id" placeholder="Ex: 21 (Death Note)" min="1" />
          </div>
        </div>

        <!-- API Key (opcional) -->
        <details class="api-key-details">
          <summary>🔑 API Key (opcional)</summary>
          <div class="api-key-group">
            <input type="password" id="api-key" placeholder="Sua chave de API trace.moe" />
            <p class="hint">Somente necessário se você é patrocinador e deseja maior cota.</p>
          </div>
        </details>

        <button class="btn-search" id="btn-search" ${isLoading ? 'disabled' : ''}>
          ${isLoading ? '<span class="spinner"></span> Buscando...' : '🔎 Buscar Anime'}
        </button>
      </section>

      <!-- Erro -->
      ${errorMsg ? `<div class="error-banner">${errorMsg}</div>` : ''}

      <!-- Loading -->
      ${isLoading ? `
        <div class="loading-section">
          <div class="loader"></div>
          <p>Analisando a imagem... Isso pode levar alguns segundos.</p>
        </div>
      ` : ''}

      <!-- Resultados -->
      ${results.length > 0 ? `
        <section class="results-section">
          <h2>🎯 Resultados Encontrados (${results.length})</h2>
          <div class="results-grid">
            ${results.map((r, i) => renderResult(r, i)).join('')}
          </div>
        </section>
      ` : ''}

      <!-- Quota modal -->
      <div class="modal-overlay" id="quota-modal" style="display:none">
        <div class="modal card">
          <button class="modal-close" id="modal-close">✕</button>
          <h2>📊 Informações da Sua Cota</h2>
          <div id="quota-content">
            ${quotaInfo ? renderQuota(quotaInfo) : '<p>Carregando...</p>'}
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">
      <p>Feito com ❤️ usando a <a href="https://soruly.github.io/trace.moe-api/#/" target="_blank" rel="noopener">API do trace.moe</a></p>
      <p class="footer-hint">Dica: Similaridade acima de 90% geralmente indica um resultado correto.</p>
    </footer>
  `;

  attachEvents();
}

// ── Renderizar um resultado ──
function renderResult(r, index) {
  const similarity = (r.similarity * 100).toFixed(1);
  const isGoodMatch = r.similarity >= 0.9;
  const simClass = isGoodMatch ? 'sim-good' : 'sim-low';

  // Anilist info
  let titleDisplay = `Anilist ID: ${typeof r.anilist === 'object' ? r.anilist.id : r.anilist}`;
  let nativeTitle = '';
  let romajiTitle = '';
  let isAdult = false;
  let anilistId = typeof r.anilist === 'object' ? r.anilist.id : r.anilist;

  if (typeof r.anilist === 'object' && r.anilist.title) {
    titleDisplay = r.anilist.title.english || r.anilist.title.romaji || r.anilist.title.native || titleDisplay;
    nativeTitle = r.anilist.title.native || '';
    romajiTitle = r.anilist.title.romaji || '';
    isAdult = r.anilist.isAdult || false;
  }

  const fromTime = formatTime(r.from);
  const toTime = formatTime(r.to);
  const episodeText = r.episode !== null && r.episode !== undefined ? `Ep. ${r.episode}` : 'N/A';

  return `
    <div class="result-card card ${isGoodMatch ? 'match-good' : 'match-low'}">
      <div class="result-header">
        <span class="result-rank">#${index + 1}</span>
        <span class="result-sim ${simClass}">${similarity}%</span>
        ${isAdult ? '<span class="badge-adult">🔞 Adulto</span>' : ''}
      </div>

      <div class="result-media">
        <img src="${r.image}" alt="Cena encontrada" class="result-img" loading="lazy" />
      </div>

      <div class="result-info">
        <h3 class="result-title">${titleDisplay}</h3>
        ${nativeTitle ? `<p class="result-native">${nativeTitle}</p>` : ''}
        ${romajiTitle && romajiTitle !== titleDisplay ? `<p class="result-romaji">${romajiTitle}</p>` : ''}

        <div class="result-details">
          <div class="detail"><span class="detail-label">📺 Episódio</span><span class="detail-value">${episodeText}</span></div>
          <div class="detail"><span class="detail-label">⏱️ Cena</span><span class="detail-value">${fromTime} — ${toTime}</span></div>
          <div class="detail"><span class="detail-label">📁 Arquivo</span><span class="detail-value filename">${r.filename}</span></div>
        </div>

        <div class="result-actions">
          <a href="${r.video}" target="_blank" rel="noopener" class="btn-preview">▶️ Ver Vídeo</a>
          <a href="https://anilist.co/anime/${anilistId}" target="_blank" rel="noopener" class="btn-anilist">🔗 Anilist</a>
        </div>
      </div>
    </div>
  `;
}

// ── Renderizar quota ──
function renderQuota(q) {
  const quotaPercent = ((q.quotaUsed / q.quota) * 100).toFixed(1);
  return `
    <div class="quota-grid">
      <div class="quota-item">
        <span class="quota-label">👤 Identificação</span>
        <span class="quota-value">${q.id}</span>
      </div>
      <div class="quota-item">
        <span class="quota-label">⚡ Prioridade</span>
        <span class="quota-value">${q.priority}</span>
      </div>
      <div class="quota-item">
        <span class="quota-label">🔄 Concorrência</span>
        <span class="quota-value">${q.concurrency}</span>
      </div>
      <div class="quota-item">
        <span class="quota-label">📊 Cota Usada</span>
        <span class="quota-value">${q.quotaUsed} / ${q.quota}</span>
      </div>
      <div class="quota-bar-container">
        <div class="quota-bar" style="width: ${Math.min(quotaPercent, 100)}%"></div>
      </div>
      <p class="quota-percent">${quotaPercent}% usada</p>
    </div>
  `;
}

// ── Formatar tempo ──
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// ── Montar headers com API key (se houver) ──
function getHeaders() {
  const key = document.getElementById('api-key')?.value?.trim();
  const headers = {};
  if (key) headers['x-trace-key'] = key;
  return headers;
}

function getKeyParam() {
  const key = document.getElementById('api-key')?.value?.trim();
  return key ? `&key=${encodeURIComponent(key)}` : '';
}

// ── Buscar por URL ──
async function searchByURL(url) {
  const cutBorders = document.getElementById('opt-cut-borders').checked;
  const anilistInfo = document.getElementById('opt-anilist-info').checked;
  const anilistId = document.getElementById('opt-anilist-id').value.trim();

  let endpoint = `https://api.trace.moe/search?url=${encodeURIComponent(url)}`;
  if (cutBorders) endpoint += '&cutBorders';
  if (anilistInfo) endpoint += '&anilistInfo';
  if (anilistId) endpoint += `&anilistID=${anilistId}`;
  endpoint += getKeyParam();

  const resp = await fetch(endpoint, { headers: getHeaders() });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error || `Erro HTTP ${resp.status}`);
  }
  return resp.json();
}

// ── Buscar por upload de arquivo ──
async function searchByFile(file) {
  const cutBorders = document.getElementById('opt-cut-borders').checked;
  const anilistInfo = document.getElementById('opt-anilist-info').checked;
  const anilistId = document.getElementById('opt-anilist-id').value.trim();

  let endpoint = `https://api.trace.moe/search?`;
  const params = [];
  if (cutBorders) params.push('cutBorders');
  if (anilistInfo) params.push('anilistInfo');
  if (anilistId) params.push(`anilistID=${anilistId}`);
  const keyParam = getKeyParam();
  if (keyParam) params.push(keyParam.substring(1));
  endpoint += params.join('&');

  const formData = new FormData();
  formData.append('image', file);

  const resp = await fetch(endpoint, {
    method: 'POST',
    body: formData,
    headers: getHeaders(),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error || `Erro HTTP ${resp.status}`);
  }
  return resp.json();
}

// ── Buscar cota ──
async function fetchQuota() {
  let endpoint = 'https://api.trace.moe/me';
  const key = document.getElementById('api-key')?.value?.trim();
  if (key) endpoint += `?key=${encodeURIComponent(key)}`;

  const resp = await fetch(endpoint, { headers: getHeaders() });
  return resp.json();
}

// ── Eventos ──
function attachEvents() {
  // Tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`panel-${tab.dataset.tab}`).classList.add('active');
    });
  });

  // Drop zone
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');

  dropZone?.addEventListener('click', () => fileInput.click());

  dropZone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone?.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });

  dropZone?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files.length > 0) {
      fileInput.files = e.dataTransfer.files;
      showFilePreview(e.dataTransfer.files[0]);
    }
  });

  fileInput?.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      showFilePreview(fileInput.files[0]);
    }
  });

  // Botão buscar
  document.getElementById('btn-search')?.addEventListener('click', handleSearch);

  // Quota
  document.getElementById('btn-quota')?.addEventListener('click', async () => {
    document.getElementById('quota-modal').style.display = 'flex';
    try {
      quotaInfo = await fetchQuota();
      document.getElementById('quota-content').innerHTML = renderQuota(quotaInfo);
    } catch (e) {
      document.getElementById('quota-content').innerHTML = `<p class="error-text">Erro ao carregar cota: ${e.message}</p>`;
    }
  });

  document.getElementById('modal-close')?.addEventListener('click', () => {
    document.getElementById('quota-modal').style.display = 'none';
  });

  document.getElementById('quota-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'quota-modal') {
      document.getElementById('quota-modal').style.display = 'none';
    }
  });
}

// ── Preview do arquivo selecionado ──
function showFilePreview(file) {
  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewFile = e.target.result;
      render();
    };
    reader.readAsDataURL(file);
  } else {
    previewFile = null;
    // Se não é imagem, mostra o nome do arquivo
    const dropContent = document.querySelector('.drop-zone-content');
    if (dropContent) {
      dropContent.innerHTML = `<p>📎 <strong>${file.name}</strong> selecionado</p>`;
    }
  }
}

// ── Handler principal de busca ──
async function handleSearch() {
  const activeTab = document.querySelector('.tab.active')?.dataset.tab;
  errorMsg = '';
  results = [];

  if (activeTab === 'url') {
    const url = document.getElementById('url-input')?.value?.trim();
    if (!url) {
      errorMsg = '⚠️ Por favor, insira uma URL de imagem.';
      render();
      return;
    }

    isLoading = true;
    render();

    try {
      const data = await searchByURL(url);
      if (data.error) throw new Error(data.error);
      results = data.result || [];
      if (results.length === 0) errorMsg = 'Nenhum resultado encontrado. Tente outra imagem.';
    } catch (e) {
      errorMsg = `❌ Erro na busca: ${e.message}`;
    }

  } else {
    const fileInput = document.getElementById('file-input');
    if (!fileInput?.files?.length) {
      errorMsg = '⚠️ Por favor, selecione um arquivo de imagem.';
      render();
      return;
    }

    isLoading = true;
    render();

    try {
      const data = await searchByFile(fileInput.files[0]);
      if (data.error) throw new Error(data.error);
      results = data.result || [];
      if (results.length === 0) errorMsg = 'Nenhum resultado encontrado. Tente outra imagem.';
    } catch (e) {
      errorMsg = `❌ Erro na busca: ${e.message}`;
    }
  }

  isLoading = false;
  previewFile = null;
  render();
}

// ── Inicializar ──
render();