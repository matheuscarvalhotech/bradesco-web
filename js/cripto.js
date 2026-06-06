// --- 1. ESTADO GLOBAL ---
let cryptoData = {};
let topCoins = [];
let topCoinsDisplayLimit = 50;
let fiatData = {};
let currentCryptoId = 'bitcoin'; 
let currentCryptoSymbol = 'BTC'; 
let cryptoChartInstance = null;
let pieChartInstance = null;

let saldoFiatOculto = true;
let saldoCriptoOculto = true;
let saldoTotalBRL = 0;
let saldoBRLDisponivel = 50000.00; 
let carteiraCripto = { 'bitcoin': 0.05, 'ethereum': 0.5, 'litecoin': 10 }; 

let tradeType = 'buy'; 
let currentDays = 15;
let currentCategoria = 'Todas';
let sortColumn = 'var';
let sortDesc = true;
let favoritos = JSON.parse(localStorage.getItem('bradesco-favoritos')) || [];
let ordensFeitas = JSON.parse(localStorage.getItem('bradesco-ordens')) || [];

let liveInterval = null;
let searchDebounceTimer = null;

const FIAT_LIST = [
    { id: 'BRL', nome: 'Real Brasileiro', emoji: '🇧🇷' },
    { id: 'USD', nome: 'Dólar Americano', emoji: '🇺🇸' },
    { id: 'EUR', nome: 'Euro', emoji: '🇪🇺' },
    { id: 'GBP', nome: 'Libra Esterlina', emoji: '🇬🇧' },
    { id: 'JPY', nome: 'Iene Japonês', emoji: '🇯🇵' },
    { id: 'ARS', nome: 'Peso Argentino', emoji: '🇦🇷' },
    { id: 'CAD', nome: 'Dólar Canadense', emoji: '🇨🇦' }
];

// --- UTILS & HELPERS ---
const escapeHtml = (unsafe) => {
    return (unsafe || '').toString().replace(/[&<"'>]/g, function (m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
};

const formatCryptoValue = (val) => {
    if (val === 0 || isNaN(val)) return '0.00000000';
    if (val > 1) return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 });
};

const formatFiatValue = (val, currency = 'BRL') => {
    if (isNaN(val)) return '0,00';
    if (currency === 'JPY') return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(val);
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(val);
};

const countUpAnimation = (elementId, targetValue, duration = 600) => {
    const el = document.getElementById(elementId);
    if (!el) return;
    const startValue = 0;
    const startTime = performance.now();
    
    const update = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = startValue + (targetValue - startValue) * easeOutQuart;
        
        el.innerText = formatFiatValue(current);
        if (progress < 1) requestAnimationFrame(update);
        else el.innerText = formatFiatValue(targetValue);
    };
    requestAnimationFrame(update);
};

const fetchWithTimeout = async (url, options = {}, timeoutMs = 10000) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
    } catch (e) {
        clearTimeout(timeout);
        throw e;
    }
};

// --- 2. INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', async () => {
    const savedWallet = localStorage.getItem('carteira-cripto-bradesco');
    if (savedWallet) carteiraCripto = JSON.parse(savedWallet);
    const savedSaldo = localStorage.getItem('saldo-brl-bradesco');
    if (savedSaldo) saldoBRLDisponivel = parseFloat(savedSaldo);

    await initMarketTracker();
    atualizarDisplaySaldoGeral();
    atualizarListaOrdens();

    window.addEventListener('beforeunload', () => {
        if(liveInterval) clearInterval(liveInterval);
    });
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden' && liveInterval) clearInterval(liveInterval);
        else if (document.visibilityState === 'visible' && document.querySelector('.btn-live').classList.contains('ativo')) {
            liveInterval = setInterval(buscarPrecoAoVivo, 5000);
        }
    });

    document.getElementById('crypto-search').addEventListener('input', (e) => {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            renderizarTabela();
        }, 150);
    });
});

async function initMarketTracker() {
    try {
        // Cache Fiat (5 min)
        const fiatCacheKey = 'bradesco-fiat-cache';
        const fiatCacheInfo = JSON.parse(sessionStorage.getItem(fiatCacheKey) || 'null');
        let fiatRaw = null;
        
        if (fiatCacheInfo && (Date.now() - fiatCacheInfo.time < 300000)) {
            fiatRaw = fiatCacheInfo.data;
        } else {
            const fiatPairs = FIAT_LIST.filter(f => f.id !== 'BRL').map(f => `${f.id}-BRL`).join(',');
            fiatRaw = await fetchWithTimeout(`https://economia.awesomeapi.com.br/json/last/${fiatPairs}`);
            sessionStorage.setItem(fiatCacheKey, JSON.stringify({ time: Date.now(), data: fiatRaw }));
        }

        fiatData['BRL'] = 1; 
        FIAT_LIST.forEach(f => {
            if(f.id !== 'BRL' && fiatRaw[f.id + 'BRL']) {
                fiatData[f.id] = parseFloat(fiatRaw[f.id + 'BRL'].bid);
            }
        });

        // Cache Crypto (1 min)
        const cryptoCacheKey = 'bradesco-crypto-cache';
        const cryptoCacheInfo = JSON.parse(sessionStorage.getItem(cryptoCacheKey) || 'null');
        let cgData = null;

        if (cryptoCacheInfo && (Date.now() - cryptoCacheInfo.time < 60000)) {
            cgData = cryptoCacheInfo.data;
        } else {
            cgData = await fetchWithTimeout('https://api.coingecko.com/api/v3/coins/markets?vs_currency=brl&order=market_cap_desc&per_page=100&page=1&sparkline=false');
            sessionStorage.setItem(cryptoCacheKey, JSON.stringify({ time: Date.now(), data: cgData }));
        }

        topCoins = cgData;
        topCoins.forEach((coin, index) => {
            let cat = 'Novos Ativos';
            if(index < 10) cat = 'Blue Chips';
            if(['USDT', 'USDC', 'DAI', 'BUSD'].includes(coin.symbol.toUpperCase())) cat = 'Stablecoins';
            if(['UNI', 'LINK', 'AAVE', 'MKR', 'SNX'].includes(coin.symbol.toUpperCase())) cat = 'DeFi';

            cryptoData[coin.id] = {
                id: coin.id,
                symbol: escapeHtml(coin.symbol.toUpperCase()),
                nome: escapeHtml(coin.name),
                precoBRL: coin.current_price,
                pct: coin.price_change_percentage_24h || 0,
                image: escapeHtml(coin.image),
                categoria: cat
            };
        });

        renderizarTabela();
        preencherSelectsConversor();
        selecionarMoeda('bitcoin'); 
        renderizarPieChart(); 

    } catch (error) {
        console.error("Erro ao carregar o mercado:", error);
        document.getElementById('crypto-tbody').innerHTML = '<tr><td colspan="4" class="text-center text-danger py-4">Sistemas de mercado temporariamente indisponíveis.<br>Por favor, recarregue a página em instantes.</td></tr>';
    }
}

// --- 3. NOVA VITRINE: TABELA INTELIGENTE ---
function renderizarTabela() {
    const tbody = document.getElementById('crypto-tbody');
    tbody.innerHTML = '';
    const query = escapeHtml(document.getElementById('crypto-search').value.toLowerCase());

    let list = topCoins.filter(coin => {
        const d = cryptoData[coin.id];
        const matchBusca = d.nome.toLowerCase().includes(query) || d.symbol.toLowerCase().includes(query);
        let matchCat = false;

        if (currentCategoria === 'Todas') matchCat = true;
        else if (currentCategoria === 'Favoritos') matchCat = favoritos.includes(coin.id);
        else matchCat = (d.categoria === currentCategoria);

        return matchBusca && matchCat;
    });

    list.sort((a, b) => {
        let valA, valB;
        if(sortColumn === 'nome') { valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); }
        else if(sortColumn === 'preco') { valA = cryptoData[a.id].precoBRL; valB = cryptoData[b.id].precoBRL; }
        else { valA = cryptoData[a.id].pct; valB = cryptoData[b.id].pct; } 

        if(valA < valB) return sortDesc ? 1 : -1;
        if(valA > valB) return sortDesc ? -1 : 1;
        return 0;
    });

    if(list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">Nenhum ativo encontrado nesta categoria.</td></tr>`;
        document.getElementById('btn-ver-mais').style.display = 'none';
        return;
    }

    const limitedList = list.slice(0, topCoinsDisplayLimit);
    if(list.length > topCoinsDisplayLimit) document.getElementById('btn-ver-mais').style.display = 'inline-block';
    else document.getElementById('btn-ver-mais').style.display = 'none';

    limitedList.forEach(coin => {
        const d = cryptoData[coin.id];
        const isFav = favoritos.includes(coin.id);
        const up = d.pct >= 0;
        const pctClass = up ? 'up' : 'down';
        const pctPrefix = up ? '+' : '';
        const starClass = isFav ? 'fav-ativo' : '';

        const tr = document.createElement('tr');
        tr.className = 'cursor-pointer';
        tr.setAttribute('data-coin-id', coin.id);
        tr.onclick = (e) => {
            if(e.target.closest('.star-btn')) return;
            selecionarMoeda(coin.id);
            rolarParaTopo();
        };

        tr.innerHTML = `
            <td class="td-star">
                <button class="star-btn ${starClass}" onclick="toggleFavorito('${d.id}')" aria-label="${isFav ? 'Remover' : 'Adicionar'} aos favoritos">
                    <i class="fa-solid fa-star"></i>
                </button>
            </td>
            <td>
                <div class="crypto-row-info">
                    <img src="${d.image}" alt="${d.nome} logo" class="crypto-row-icon" loading="lazy" width="32" height="32" decoding="async">
                    <div>
                        <strong>${d.nome}</strong> <span class="text-muted" style="font-size:12px;">${d.symbol}</span>
                    </div>
                </div>
            </td>
            <td class="text-right tabular-nums price-cell" style="font-weight: 500;">${formatFiatValue(d.precoBRL)}</td>
            <td class="text-right td-var">
                <span class="chip-var ${pctClass} var-cell tabular-nums">${pctPrefix}${d.pct.toFixed(2)}%</span>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll('.sortable').forEach(th => th.classList.remove('active'));
    const atvTh = document.querySelector(`.sortable[data-col="${sortColumn}"]`);
    if(atvTh) {
        atvTh.classList.add('active');
        const i = atvTh.querySelector('i');
        i.className = sortDesc ? 'fa-solid fa-sort-down sort-icon' : 'fa-solid fa-sort-up sort-icon';
    }
}

function loadMoreCoins() {
    topCoinsDisplayLimit += 50;
    renderizarTabela();
}

function rolarParaTopo() {
    document.getElementById('main-chart-container').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function ordenarTabela(col) {
    if(sortColumn === col) sortDesc = !sortDesc;
    else { sortColumn = col; sortDesc = true; }
    renderizarTabela();
}

function filtrarCategoria(cat) {
    currentCategoria = cat;
    document.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('ativo'));
    const target = document.querySelector(`.cat-tab[data-cat="${cat}"]`);
    if(target) target.classList.add('ativo');
    renderizarTabela();
}

function toggleFavorito(id) {
    if(favoritos.includes(id)) {
        favoritos = favoritos.filter(f => f !== id);
    } else {
        favoritos.push(id);
    }
    localStorage.setItem('bradesco-favoritos', JSON.stringify(favoritos));
    renderizarTabela();
}

function selecionarMoeda(id) {
    if(!cryptoData[id]) return;
    currentCryptoId = id;
    currentCryptoSymbol = cryptoData[id].symbol;

    document.getElementById('grafico-titulo').innerText = `Análise - ${cryptoData[id].nome}`;
    
    // XSS safety
    document.querySelectorAll('.safe-html').forEach(el => {
        if(el.id === 'moeda-selecionada-nome') el.textContent = cryptoData[id].nome;
        else if(el.id === 'moeda-selecionada-sigla' && tradeType==='buy') el.textContent = cryptoData[id].symbol;
    });
    
    document.getElementById('conv-to').value = id;

    if(liveInterval) {
        mudarTempo('LIVE');
    } else {
        carregarGraficoHistorico(currentDays);
    }
    calcularTrade();
    converterMoedas();
}

// --- 4. GRÁFICOS E MODO "AO VIVO" ---

// Plugin customizado: Bolinha pulsante no último ponto (Ao Vivo)
const pulsingDotPlugin = {
    id: 'pulsingDot',
    afterDraw(chart) {
        if (!chart._isLive) return;
        const meta = chart.getDatasetMeta(0);
        if (!meta || meta.data.length === 0) return;
        const lastPoint = meta.data[meta.data.length - 1];
        if (!lastPoint) return;

        const ctx = chart.ctx;
        const x = lastPoint.x;
        const y = lastPoint.y;

        // Fase baseada no tempo real (ciclo de 2 segundos)
        const phase = ((Date.now() % 2000) / 2000);
        const maxRadius = 16;
        const radius = 5 + (maxRadius - 5) * phase;
        const opacity = 1 - phase;

        // Desenhar fora da área de clip do chart
        ctx.save();
        ctx.restore(); // Limpar clip anterior
        ctx.save();

        // Anel pulsante (fade out)
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(204, 0, 0, ${opacity * 0.6})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        // Bolinha central sólida
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#CC0000';
        ctx.fill();
        ctx.strokeStyle = document.body.classList.contains('dark-mode') ? '#1e1e1e' : '#FFF';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    }
};

// Timer para reanimar o pulso suavemente (30fps, não 60)
let pulseAnimFrame = null;
function iniciarPulseAnimation() {
    pararPulseAnimation();
    function tick() {
        if (cryptoChartInstance && cryptoChartInstance._isLive) {
            cryptoChartInstance.draw();
        }
        pulseAnimFrame = setTimeout(tick, 33); // ~30fps
    }
    tick();
}
function pararPulseAnimation() {
    if (pulseAnimFrame) { clearTimeout(pulseAnimFrame); pulseAnimFrame = null; }
}

// Relógio em tempo real
let clockInterval = null;
function iniciarRelogio() {
    if (clockInterval) clearInterval(clockInterval);
    atualizarRelogio();
    clockInterval = setInterval(atualizarRelogio, 1000);
}
function atualizarRelogio() {
    const agora = new Date();
    const h = agora.getHours().toString().padStart(2, '0');
    const m = agora.getMinutes().toString().padStart(2, '0');
    const s = agora.getSeconds().toString().padStart(2, '0');
    const el = document.getElementById('live-clock');
    if (el) el.innerHTML = `<i class="fa-regular fa-clock"></i> ${h}:${m}:${s}`;
}

function atualizarInfoBar(preco, pct) {
    const priceEl = document.getElementById('live-price');
    const changeEl = document.getElementById('live-change');
    if (priceEl) priceEl.innerText = formatFiatValue(preco);
    if (changeEl) {
        const up = pct >= 0;
        changeEl.className = `live-change ${up ? 'up' : 'down'}`;
        changeEl.innerText = `${up ? '▲' : '▼'} ${Math.abs(pct).toFixed(2)}%`;
    }
}

async function carregarGraficoHistorico(dias, isLive = false) {
    currentDays = dias;
    if(!isLive) document.getElementById('main-chart-container').classList.add('skeleton-light');
    
    try {
        const diasReq = isLive ? 1 : dias;
        const historico = await fetchWithTimeout(`https://api.coingecko.com/api/v3/coins/${currentCryptoId}/market_chart?vs_currency=brl&days=${diasReq}`);
        
        let labels = historico.prices.map(item => {
            const data = new Date(item[0]);
            if (diasReq === 1 || isLive) return `${data.getHours()}:${data.getMinutes().toString().padStart(2, '0')}`;
            return `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth()+1).toString().padStart(2, '0')}`;
        });
        let prices = historico.prices.map(item => item[1]);

        renderizarGraficoArea(labels, prices, isLive);

        // Atualizar info bar
        if (cryptoData[currentCryptoId]) {
            atualizarInfoBar(cryptoData[currentCryptoId].precoBRL, cryptoData[currentCryptoId].pct);
        }
        iniciarRelogio();
    } catch (e) {
        console.error(e);
    } finally {
        document.getElementById('main-chart-container').classList.remove('skeleton-light');
    }
}

function renderizarGraficoArea(labels, prices, isLive) {
    const canvas = document.getElementById('cryptoTrendGraph');
    const ctx = canvas.getContext('2d');
    if (cryptoChartInstance) cryptoChartInstance.destroy();

    const isDark = document.body.classList.contains('dark-mode');
    Chart.defaults.color = isDark ? '#f5f5f5' : '#666';

    // Detectar plugin de zoom de forma segura
    let hasZoomPlugin = false;
    try { hasZoomPlugin = !!Chart.registry.getPlugin('zoom'); } catch(e) {}

    const zoomOptions = hasZoomPlugin ? {
        zoom: {
            wheel: { enabled: true },
            pinch: { enabled: true },
            mode: 'x',
            onZoomComplete: () => {
                document.getElementById('btn-reset-zoom').style.display = 'inline-flex';
            }
        },
        pan: {
            enabled: true,
            mode: 'x',
            onPanComplete: () => {
                document.getElementById('btn-reset-zoom').style.display = 'inline-flex';
            }
        }
    } : {};

    cryptoChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cotação',
                data: prices,
                fill: false,
                borderWidth: 2.5,
                tension: 0.2,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#CC0000',
                pointHoverBorderColor: isDark ? '#1e1e1e' : '#FFF',
                pointHoverBorderWidth: 2,
                segment: {
                    borderColor: ctx => {
                        if(!ctx.p0 || !ctx.p1) return '#999';
                        return ctx.p0.parsed.y <= ctx.p1.parsed.y ? '#1A7A3C' : '#CC0000';
                    }
                }
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: isDark ? '#333' : '#FFF',
                    titleColor: isDark ? '#FFF' : '#000',
                    bodyColor: isDark ? '#CCC' : '#333',
                    borderColor: isDark ? '#555' : '#E0E0E0',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: (ctx) => `Cotação: ${formatFiatValue(ctx.parsed.y)}`
                    }
                },
                zoom: zoomOptions
            },
            layout: {
                padding: { top: 20, right: 20 } // Espaço para a bolinha pulsante não cortar
            },
            scales: {
                x: { grid: { display: false }, ticks: { maxTicksLimit: 10 } },
                y: { grid: { color: isDark ? '#333' : '#f0f0f0' } }
            },
            animation: isLive ? { duration: 0 } : { duration: 600, easing: 'easeOutQuart' }
        },
        plugins: isLive ? [pulsingDotPlugin] : []
    });

    cryptoChartInstance._isLive = isLive;
    document.getElementById('btn-reset-zoom').style.display = 'none';

    if (isLive) {
        iniciarPulseAnimation();
    } else {
        pararPulseAnimation();
    }
}

function resetarZoom() {
    if (cryptoChartInstance) {
        cryptoChartInstance.resetZoom();
        document.getElementById('btn-reset-zoom').style.display = 'none';
    }
}

function aplicarTemaChart() {
    if (!cryptoChartInstance) return;
    const isDark = document.body.classList.contains('dark-mode');
    Chart.defaults.color = isDark ? '#f5f5f5' : '#666';
    cryptoChartInstance.options.scales.y.grid.color = isDark ? '#333' : '#f0f0f0';
    cryptoChartInstance.options.plugins.tooltip.backgroundColor = isDark ? '#333' : '#FFF';
    cryptoChartInstance.options.plugins.tooltip.titleColor = isDark ? '#FFF' : '#000';
    cryptoChartInstance.options.plugins.tooltip.bodyColor = isDark ? '#CCC' : '#333';
    cryptoChartInstance.options.plugins.tooltip.borderColor = isDark ? '#555' : '#E0E0E0';
    cryptoChartInstance.data.datasets[0].pointHoverBorderColor = isDark ? '#1e1e1e' : '#FFF';
    cryptoChartInstance.update('none');
}

function mudarTempo(tipo) {
    document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('ativo'));
    const targetBtn = document.querySelector(`.time-btn[data-tf="${tipo}"]`);
    if(targetBtn) targetBtn.classList.add('ativo');
    
    if (liveInterval) { clearInterval(liveInterval); liveInterval = null; }

    if (tipo === 'LIVE') {
        carregarGraficoHistorico(1, true).then(() => {
            liveInterval = setInterval(buscarPrecoAoVivo, 5000); 
        });
    }
    else if (tipo === '1D') carregarGraficoHistorico(1);
    else if (tipo === '15D') carregarGraficoHistorico(15);
    else if (tipo === '1M') carregarGraficoHistorico(30);
}

// Polling do Preço em Tempo Real
async function buscarPrecoAoVivo() {
    if(!cryptoChartInstance || document.visibilityState === 'hidden') return;
    try {
        const data = await fetchWithTimeout(`https://api.coingecko.com/api/v3/simple/price?ids=${currentCryptoId}&vs_currencies=brl&include_24hr_change=true`, {}, 4000);
        const novoPreco = data[currentCryptoId].brl;
        const novoPct = data[currentCryptoId].brl_24h_change || 0;

        const agora = new Date();
        const label = `${agora.getHours()}:${agora.getMinutes().toString().padStart(2, '0')}:${agora.getSeconds().toString().padStart(2, '0')}`;

        const precoAntigo = cryptoData[currentCryptoId].precoBRL;
        cryptoData[currentCryptoId].precoBRL = novoPreco;
        cryptoData[currentCryptoId].pct = novoPct;
        document.getElementById('trade-cotacao').innerText = formatFiatValue(novoPreco);

        // Atualizar info bar
        atualizarInfoBar(novoPreco, novoPct);

        // Atualiza Chart
        const chartData = cryptoChartInstance.data;
        chartData.labels.push(label);
        chartData.datasets[0].data.push(novoPreco);
        if(chartData.labels.length > 60) { 
            chartData.labels.shift();
            chartData.datasets[0].data.shift();
        }
        cryptoChartInstance.update('none');

        // Atualiza Row específica na tabela sem re-renderizar tudo
        const row = document.querySelector(`tr[data-coin-id="${currentCryptoId}"]`);
        if(row) {
            const priceCell = row.querySelector('.price-cell');
            if(priceCell) {
                priceCell.innerText = formatFiatValue(novoPreco);
                const color = novoPreco >= precoAntigo ? '#1A7A3C' : '#CC0000';
                priceCell.style.color = color;
                setTimeout(() => priceCell.style.color = '', 1000);
            }
        }

    } catch(e) { console.warn("Polling error silenciado", e); }
}


// --- 5. O MEGA CONVERSOR ---
function preencherSelectsConversor() {
    const fromSelect = document.getElementById('conv-from');
    const toSelect = document.getElementById('conv-to');
    
    let fiatOptions = FIAT_LIST.map(f => `<option value="${f.id}">${f.emoji} ${f.id} - ${f.nome}</option>`).join('');
    let cryptoOptions = topCoins.map(c => `<option value="${c.id}">✧ ${escapeHtml(c.symbol.toUpperCase())} - ${escapeHtml(c.name)}</option>`).join('');
    
    const allOptions = `<optgroup label="Moedas Mundiais (Fiat)">${fiatOptions}</optgroup><optgroup label="Criptomoedas">${cryptoOptions}</optgroup>`;

    fromSelect.innerHTML = allOptions;
    toSelect.innerHTML = allOptions;
    fromSelect.value = 'BRL';
    toSelect.value = 'bitcoin';
}

function swapCurrencies() {
    const fromSelect = document.getElementById('conv-from');
    const toSelect = document.getElementById('conv-to');
    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;
    converterMoedas();
}

function converterMoedas() {
    const amount = parseFloat(document.getElementById('conv-amount').value);
    const from = document.getElementById('conv-from').value;
    const to = document.getElementById('conv-to').value;
    const resultEl = document.getElementById('conv-result');

    if (isNaN(amount) || amount === 0) { resultEl.value = '0'; return; }

    let valorEmBRL = 0;
    if (fiatData[from]) valorEmBRL = amount * fiatData[from];
    else if (cryptoData[from]) valorEmBRL = amount * cryptoData[from].precoBRL;

    let resultado = 0;
    if (fiatData[to]) resultado = valorEmBRL / fiatData[to];
    else if (cryptoData[to]) resultado = valorEmBRL / cryptoData[to].precoBRL;

    if (!fiatData[to]) {
        resultEl.value = formatCryptoValue(resultado); // Bug 1.7 resolvido
    } else {
        resultEl.value = formatFiatValue(resultado, to).replace(/[^\d.,]/g, '').trim(); 
    }
}


// --- 6. DASHBOARDS E PIZZA ---
function renderizarPieChart() {
    const ctx = document.getElementById('portfolioPieChart').getContext('2d');
    let labels = [];
    let values = [];
    let totalCustodia = 0;
    
    Object.keys(carteiraCripto).forEach(id => {
        if(carteiraCripto[id] > 0 && cryptoData[id]) {
            const valBRL = carteiraCripto[id] * cryptoData[id].precoBRL;
            labels.push(cryptoData[id].symbol);
            values.push(valBRL);
            totalCustodia += valBRL;
        }
    });

    saldoTotalBRL = totalCustodia;
    atualizarDisplaySaldoGeral(true);

    if (pieChartInstance) pieChartInstance.destroy();
    
    if (values.length === 0) {
        pieChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: { labels: ['Vazio'], datasets: [{ data: [1], backgroundColor: ['#e0e0e0'], borderWidth: 0 }] },
            options: { cutout: '75%', plugins: { legend: { display: false }, tooltip: { enabled: false } } }
        });
    } else {
        pieChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: { labels: labels, datasets: [{ data: values, backgroundColor: ['#F7931A', '#627EEA', '#345D9D', '#14C784', '#E23C6D'], borderWidth: 0 }] },
            options: {
                responsive: true, maintainAspectRatio: false, cutout: '75%',
                plugins: { legend: { display: false } }
            }
        });
    }
}


// --- 7. TRADE ---
function setTradeType(type) {
    tradeType = type;
    document.getElementById('tab-buy').classList.remove('ativo');
    document.getElementById('tab-sell').classList.remove('ativo');
    document.getElementById(`tab-${type}`).classList.add('ativo');
    
    document.getElementById('label-trade-acao').innerText = type === 'buy' ? 'Comprar' : 'Vender';
    document.getElementById('moeda-selecionada-sigla').textContent = type === 'buy' ? currentCryptoSymbol : 'BRL';
    document.getElementById('valor-trade').value = '';
    
    calcularTrade();
}

function setQuickValue(pct) {
    if (tradeType === 'buy') {
        document.getElementById('valor-trade').value = (saldoBRLDisponivel * (pct/100)).toFixed(2);
    } else {
        const disponivelCripto = carteiraCripto[currentCryptoId] || 0;
        const valorEmReais = (disponivelCripto * (pct/100)) * cryptoData[currentCryptoId].precoBRL;
        document.getElementById('valor-trade').value = valorEmReais.toFixed(2);
    }
    calcularTrade();
}

function calcularTrade() {
    if(!cryptoData[currentCryptoId]) return;
    const valInput = document.getElementById('valor-trade').value;
    const val = parseFloat(valInput);
    const preco = cryptoData[currentCryptoId].precoBRL;
    const btn = document.getElementById('btn-comprar');
    const erroEl = document.getElementById('trade-error');
    
    document.getElementById('trade-cotacao').innerText = formatFiatValue(preco);
    
    if (!valInput || isNaN(val) || val === 0) {
        document.getElementById('fracao-recebida').innerText = '0.00000000';
        document.getElementById('trade-taxa').innerText = '- R$ 0,00';
        document.getElementById('trade-total-brl').innerText = 'R$ 0,00';
        btn.disabled = true;
        erroEl.innerText = "Digite um valor a partir de R$ 10,00.";
        erroEl.style.display = 'block';
        erroEl.className = 'form-erro text-muted';
        return;
    }
    
    if (val > 0 && val < 10) {
        document.getElementById('fracao-recebida').innerText = '0.00000000';
        document.getElementById('trade-taxa').innerText = '- R$ 0,00';
        document.getElementById('trade-total-brl').innerText = 'R$ 0,00';
        btn.disabled = true;
        erroEl.innerText = "O valor mínimo para operar é R$ 10,00.";
        erroEl.style.display = 'block';
        erroEl.className = 'form-erro text-danger';
        return;
    }
    
    let maxPermitido = tradeType === 'buy' ? saldoBRLDisponivel : ((carteiraCripto[currentCryptoId] || 0) * preco);
    if (val > maxPermitido) {
        btn.disabled = true;
        erroEl.innerText = tradeType === 'buy' ? "Saldo BRL insuficiente." : "Saldo Cripto insuficiente.";
        erroEl.style.display = 'block';
        erroEl.className = 'form-erro text-danger';
        return;
    }

    erroEl.style.display = 'none';
    btn.disabled = false;
    const taxa = val * 0.005;
    const totalLiquido = val - taxa;

    document.getElementById('trade-taxa').innerText = `- ${formatFiatValue(taxa)}`;
    document.getElementById('trade-total-brl').innerText = formatFiatValue(totalLiquido);

    if (tradeType === 'buy') {
        document.getElementById('fracao-recebida').innerText = formatCryptoValue(totalLiquido / preco);
        document.getElementById('moeda-selecionada-sigla').textContent = currentCryptoSymbol;
    } else {
        document.getElementById('fracao-recebida').innerText = formatFiatValue(totalLiquido).replace('R$', '').trim();
        document.getElementById('moeda-selecionada-sigla').textContent = 'BRL';
    }
}

function confirmarTrade() {
    const val = parseFloat(document.getElementById('valor-trade').value);
    const fracaoStr = document.getElementById('fracao-recebida').innerText;
    const preco = cryptoData[currentCryptoId].precoBRL;
    const taxa = val * 0.005;
    const totalLiquido = val - taxa;
    
    if(!carteiraCripto[currentCryptoId]) carteiraCripto[currentCryptoId] = 0;

    if(tradeType === 'buy') {
        carteiraCripto[currentCryptoId] += (totalLiquido / preco);
        saldoBRLDisponivel -= val;
    } else {
        // Bug 1.6 Resolvido: debitar corretamente em cripto a porção que o usuário está vendendo
        // Ele quer vender 'val' reais de cripto. Então debito (val/preco). E recebe totalLiquido.
        carteiraCripto[currentCryptoId] -= (val / preco);
        if(carteiraCripto[currentCryptoId] < 0) carteiraCripto[currentCryptoId] = 0; 
        saldoBRLDisponivel += totalLiquido;
    }

    localStorage.setItem('carteira-cripto-bradesco', JSON.stringify(carteiraCripto));
    localStorage.setItem('saldo-brl-bradesco', saldoBRLDisponivel.toString());
    renderizarPieChart();

    document.getElementById('modal-tipo').textContent = tradeType === 'buy' ? 'Compra' : 'Venda';
    document.getElementById('modal-valor-pago').innerText = formatFiatValue(val);
    document.getElementById('modal-valor-recebido').textContent = tradeType === 'buy' ? `${fracaoStr} ${currentCryptoSymbol}` : `R$ ${fracaoStr}`;
    document.getElementById('modal-icon').innerHTML = tradeType === 'buy' ? '<i class="fa-solid fa-circle-arrow-down text-success"></i>' : '<i class="fa-solid fa-circle-arrow-up text-danger"></i>';

    const objOrdem = { tipo: tradeType, moeda: currentCryptoSymbol, valor: val, qtd: fracaoStr, data: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    ordensFeitas.unshift(objOrdem);
    if(ordensFeitas.length > 20) ordensFeitas.pop();
    localStorage.setItem('bradesco-ordens', JSON.stringify(ordensFeitas));

    const modal = document.getElementById('modal-sucesso-cripto');
    modal.classList.add('ativo');
    document.getElementById('btn-modal-close').focus();
}

function fecharModalCripto() {
    document.getElementById('modal-sucesso-cripto').classList.remove('ativo');
    setTradeType(tradeType);
    atualizarListaOrdens();
}

function atualizarListaOrdens() {
    const ul = document.getElementById('lista-ordens');
    if (!ul) return;
    if (ordensFeitas.length === 0) {
        ul.innerHTML = '<li class="transacao text-muted">Nenhuma ordem executada ainda nesta sessão.</li>';
        return;
    }
    ul.innerHTML = '';
    ordensFeitas.forEach(o => {
        const color = o.tipo === 'buy' ? 'text-success' : 'text-danger';
        ul.innerHTML += `
            <li class="transacao">
                <div class="transacao-info">
                    <span class="transacao-nome sora-font" style="font-size:14px;">${o.tipo === 'buy' ? 'Compra' : 'Venda'} ${escapeHtml(o.moeda)}</span>
                    <span class="transacao-data" style="font-size: 11px; color:var(--texto-claro);">${o.data}</span>
                </div>
                <span class="transacao-valor ${color} tabular-nums" style="font-weight: 600;">${o.tipo === 'buy' ? '+' : '-'} ${escapeHtml(o.qtd)}</span>
            </li>`;
    });
}

// --- 8. UTILITÁRIOS ---
function toggleFiatSaldo() {
    saldoFiatOculto = !saldoFiatOculto;
    const txtEls = document.querySelectorAll('.ocultavel-fiat');
    const icon = document.getElementById('icon-eye-fiat');
    
    if(saldoFiatOculto) {
        txtEls.forEach(el => el.innerText = 'R$ *****');
        icon.className = 'fa-solid fa-eye-slash';
    } else {
        countUpAnimation('brl-saldo-valor', saldoBRLDisponivel);
        icon.className = 'fa-solid fa-eye';
    }
}

function toggleCriptoSaldo() {
    saldoCriptoOculto = !saldoCriptoOculto;
    const txtEls = document.querySelectorAll('.ocultavel-cripto');
    const icon = document.getElementById('icon-eye-cripto');
    
    if(saldoCriptoOculto) {
        txtEls.forEach(el => el.innerText = 'R$ *****');
        icon.className = 'fa-solid fa-eye-slash';
    } else {
        countUpAnimation('crypto-saldo-valor', saldoTotalBRL);
        icon.className = 'fa-solid fa-eye';
    }
}

function atualizarDisplaySaldoGeral(animar = false) {
    if(!saldoFiatOculto) {
        if(animar) countUpAnimation('brl-saldo-valor', saldoBRLDisponivel);
        else document.getElementById('brl-saldo-valor').innerText = formatFiatValue(saldoBRLDisponivel);
    }
    if(!saldoCriptoOculto) {
        if(animar) countUpAnimation('crypto-saldo-valor', saldoTotalBRL);
        else document.getElementById('crypto-saldo-valor').innerText = formatFiatValue(saldoTotalBRL);
    }
}
