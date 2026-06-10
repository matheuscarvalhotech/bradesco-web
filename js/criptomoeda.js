// ─── DADOS MOCKADOS ───────────────────────────────────────────
const CR_MOEDAS = [
    { id: 'btc',  nome: 'Bitcoin',       sigla: 'BTC',  cor: '#F7931A', emoji: '₿',  preco: 312540.00, pct: 2.34,  mktCap: 'R$ 6,1 tri',  carteira: 0.05  },
    { id: 'eth',  nome: 'Ethereum',      sigla: 'ETH',  cor: '#627EEA', emoji: 'Ξ',  preco: 16890.50,  pct: -1.12, mktCap: 'R$ 2,0 tri',  carteira: 0.50  },
    { id: 'bnb',  nome: 'BNB',           sigla: 'BNB',  cor: '#F3BA2F', emoji: 'B',  preco: 2748.20,   pct: 0.88,  mktCap: 'R$ 415 bi',   carteira: 2.00  },
    { id: 'sol',  nome: 'Solana',        sigla: 'SOL',  cor: '#9945FF', emoji: '◎',  preco: 831.40,    pct: 4.51,  mktCap: 'R$ 390 bi',   carteira: 5.00  },
    { id: 'xrp',  nome: 'XRP',           sigla: 'XRP',  cor: '#346AA9', emoji: 'X',  preco: 3.18,      pct: -0.45, mktCap: 'R$ 180 bi',   carteira: 0     },
    { id: 'doge', nome: 'Dogecoin',      sigla: 'DOGE', cor: '#C2A633', emoji: 'Ð',  preco: 0.87,      pct: 6.20,  mktCap: 'R$ 128 bi',   carteira: 0     },
    { id: 'ada',  nome: 'Cardano',       sigla: 'ADA',  cor: '#0033AD', emoji: '₳',  preco: 2.21,      pct: -2.80, mktCap: 'R$ 79 bi',    carteira: 0     },
    { id: 'avax', nome: 'Avalanche',     sigla: 'AVAX', cor: '#E84142', emoji: 'A',  preco: 152.60,    pct: 1.95,  mktCap: 'R$ 63 bi',    carteira: 0     },
    { id: 'dot',  nome: 'Polkadot',      sigla: 'DOT',  cor: '#E6007A', emoji: '●',  preco: 34.50,     pct: -0.70, mktCap: 'R$ 51 bi',    carteira: 0     },
    { id: 'matic',nome: 'Polygon',       sigla: 'MATIC',cor: '#8247E5', emoji: 'M',  preco: 2.94,      pct: 3.10,  mktCap: 'R$ 27 bi',    carteira: 0     },
    { id: 'link', nome: 'Chainlink',     sigla: 'LINK', cor: '#375BD2', emoji: '⬡',  preco: 76.30,     pct: 1.40,  mktCap: 'R$ 46 bi',    carteira: 0     },
    { id: 'ltc',  nome: 'Litecoin',      sigla: 'LTC',  cor: '#345D9D', emoji: 'Ł',  preco: 458.90,    pct: -1.55, mktCap: 'R$ 34 bi',    carteira: 0     },
];

// Gera histórico de preço simulado (N dias)
function crGerarHistorico(preco, dias) {
    const pts = [];
    let p = preco * (0.75 + Math.random() * 0.1);
    for (let i = 0; i < dias; i++) {
        p = p * (1 + (Math.random() - 0.48) * 0.04);
        pts.push(parseFloat(p.toFixed(2)));
    }
    pts.push(preco); // último ponto é o preço atual
    return pts;
}

function crGerarLabels(dias) {
    const labels = [];
    const hoje = new Date();
    for (let i = dias; i >= 0; i--) {
        const d = new Date(hoje);
        d.setDate(d.getDate() - i);
        labels.push(`${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`);
    }
    return labels;
}

// ─── ESTADO ───────────────────────────────────────────────────
let crSaldoBRL     = 50000.00;
let crCarteira     = {};  // id -> qtd
let crMoedaAtual   = CR_MOEDAS[0];
let crTradeType    = 'buy';
let crTfAtual      = 15;
let crLineChart    = null;
let crPizzaChart   = null;
let crFiatOculto   = true;
let crCriptoOculto = true;
let crOrdens       = [];

const crFmt = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const crFmtCripto = (v) => {
    if (v === 0) return '0.00000000';
    if (v >= 1)  return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 });
};

// ─── INICIALIZAÇÃO ─────────────────────────────────────────────
(function crInit() {
    if (!document.getElementById('cr-tbody')) return;

    // Carrega carteira salva
    const savedWallet = localStorage.getItem('cr-carteira');
    if (savedWallet) {
        crCarteira = JSON.parse(savedWallet);
    } else {
        CR_MOEDAS.forEach(m => { if (m.carteira > 0) crCarteira[m.id] = m.carteira; });
    }
    const savedSaldo = localStorage.getItem('cr-saldo-brl');
    if (savedSaldo) crSaldoBRL = parseFloat(savedSaldo);

    crRenderTabela();
    crSelecionarMoeda(CR_MOEDAS[0]);
    crRenderPizza();
    crAtualizarSaldos();
    crRenderOrdens();
})();

// ─── TABELA ────────────────────────────────────────────────────
function crRenderTabela() {
    const query = (document.getElementById('cr-search')?.value || '').toLowerCase();
    const tbody = document.getElementById('cr-tbody');
    if (!tbody) return;

    const lista = CR_MOEDAS.filter(m =>
        m.nome.toLowerCase().includes(query) || m.sigla.toLowerCase().includes(query)
    );

    tbody.innerHTML = lista.map(m => {
        const up    = m.pct >= 0;
        const ativo = m.id === crMoedaAtual.id ? 'cr-row-ativa' : '';
        return `
        <tr class="${ativo}" onclick="crSelecionarMoeda(CR_MOEDAS.find(x=>x.id==='${m.id}'))">
            <td style="width:40px;">
                <div class="cr-coin-icon" style="background:${m.cor}22;color:${m.cor};">
                    ${m.emoji}
                </div>
            </td>
            <td>
                <div class="cr-coin-info">
                    <div>
                        <strong>${m.nome}</strong>
                        <div style="font-size:12px;color:var(--texto-claro);">${m.sigla}</div>
                    </div>
                </div>
            </td>
            <td class="cr-right" style="font-weight:600;">${crFmt(m.preco)}</td>
            <td class="cr-right">
                <span class="cr-chip ${up ? 'up' : 'down'}">${up ? '+' : ''}${m.pct.toFixed(2)}%</span>
            </td>
            <td class="cr-right" style="font-size:12px;color:var(--texto-claro);">${m.mktCap}</td>
        </tr>`;
    }).join('');
}

function crFiltrar() { crRenderTabela(); }

// ─── SELEÇÃO DE MOEDA ──────────────────────────────────────────
function crSelecionarMoeda(moeda) {
    if (!moeda) return;
    crMoedaAtual = moeda;

    // Atualiza header
    document.getElementById('cr-grafico-titulo').innerText = `Análise — ${moeda.nome} (${moeda.sigla})`;
    const up = moeda.pct >= 0;
    const precoEl = document.getElementById('cr-live-preco');
    const varEl   = document.getElementById('cr-live-var');
    if (precoEl) precoEl.innerText = crFmt(moeda.preco);
    if (varEl) {
        varEl.innerText   = `${up ? '▲' : '▼'} ${Math.abs(moeda.pct).toFixed(2)}%`;
        varEl.className   = `cr-live-var ${up ? 'up' : 'down'}`;
    }

    // Atualiza trade
    document.getElementById('cr-label-moeda').innerText = moeda.nome;
    document.getElementById('cr-cotacao').innerText      = crFmt(moeda.preco);
    document.getElementById('cr-sigla-resultado').innerText = crTradeType === 'buy' ? moeda.sigla : 'BRL';
    crCalcular();

    // Destaca linha ativa na tabela
    crRenderTabela();

    // Desenha gráfico
    crRenderGrafico(crTfAtual);
}

// ─── GRÁFICO ───────────────────────────────────────────────────
function crRenderGrafico(dias) {
    const canvas = document.getElementById('cr-line-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (crLineChart) crLineChart.destroy();

    const labels = crGerarLabels(dias);
    const dados  = crGerarHistorico(crMoedaAtual.preco, dias);
    const cor    = crMoedaAtual.cor;

    crLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: crMoedaAtual.sigla,
                data: dados,
                borderColor: cor,
                backgroundColor: cor + '18',
                fill: true,
                borderWidth: 2,
                tension: 0.3,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: cor,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { intersect: false, mode: 'index' },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#FFF',
                    titleColor: '#333',
                    bodyColor: '#333',
                    borderColor: '#E0E0E0',
                    borderWidth: 1,
                    padding: 10,
                    displayColors: false,
                    callbacks: {
                        label: ctx => `${crMoedaAtual.sigla}: ${crFmt(ctx.parsed.y)}`
                    }
                }
            },
            scales: {
                x: { grid: { display: false }, ticks: { maxTicksLimit: 8, font: { size: 11 } } },
                y: {
                    grid: { color: '#F0F0F0' },
                    ticks: {
                        font: { size: 11 },
                        callback: v => crMoedaAtual.preco >= 100
                            ? 'R$ ' + (v/1000).toFixed(0) + 'k'
                            : crFmt(v)
                    }
                }
            },
            animation: { duration: 400 }
        }
    });
}

function crMudarTf(btn, dias) {
    crTfAtual = dias;
    document.querySelectorAll('.cr-tf-btn').forEach(b => b.classList.remove('cr-tf-ativo'));
    btn.classList.add('cr-tf-ativo');
    crRenderGrafico(dias);
}

// ─── PIZZA ────────────────────────────────────────────────────
function crRenderPizza() {
    const canvas = document.getElementById('cr-pizza-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (crPizzaChart) crPizzaChart.destroy();

    const labels = [], vals = [], cores = [];
    CR_MOEDAS.forEach(m => {
        const qtd = crCarteira[m.id] || 0;
        if (qtd > 0) {
            labels.push(m.sigla);
            vals.push(qtd * m.preco);
            cores.push(m.cor);
        }
    });

    crPizzaChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels.length ? labels : ['Vazio'],
            datasets: [{
                data: vals.length ? vals : [1],
                backgroundColor: cores.length ? cores : ['#E0E0E0'],
                borderWidth: 0,
            }]
        },
        options: {
            cutout: '72%',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: vals.length > 0 }
            }
        }
    });
}

// ─── SALDOS ───────────────────────────────────────────────────
function crAtualizarSaldos() {
    let totalCripto = 0;
    CR_MOEDAS.forEach(m => { totalCripto += (crCarteira[m.id] || 0) * m.preco; });

    if (!crFiatOculto)   document.getElementById('cr-val-fiat').innerText   = crFmt(crSaldoBRL);
    if (!crCriptoOculto) document.getElementById('cr-val-cripto').innerText = crFmt(totalCripto);
}

function crToggleFiat() {
    crFiatOculto = !crFiatOculto;
    const el   = document.getElementById('cr-val-fiat');
    const icon = document.getElementById('cr-eye-fiat');
    if (crFiatOculto) {
        el.innerText   = 'R$ *****';
        icon.className = 'fa-solid fa-eye-slash';
    } else {
        el.innerText   = crFmt(crSaldoBRL);
        icon.className = 'fa-solid fa-eye';
    }
}

function crToggleCripto() {
    crCriptoOculto = !crCriptoOculto;
    const el   = document.getElementById('cr-val-cripto');
    const icon = document.getElementById('cr-eye-cripto');
    let totalCripto = 0;
    CR_MOEDAS.forEach(m => { totalCripto += (crCarteira[m.id] || 0) * m.preco; });
    if (crCriptoOculto) {
        el.innerText   = 'R$ *****';
        icon.className = 'fa-solid fa-eye-slash';
    } else {
        el.innerText   = crFmt(totalCripto);
        icon.className = 'fa-solid fa-eye';
    }
}

// ─── TRADE ────────────────────────────────────────────────────
function crSetTrade(type) {
    crTradeType = type;
    document.getElementById('cr-tab-buy').classList.toggle('cr-tab-ativo', type === 'buy');
    document.getElementById('cr-tab-sell').classList.toggle('cr-tab-ativo', type === 'sell');
    document.getElementById('cr-label-acao').innerText = type === 'buy' ? 'Comprar' : 'Vender';
    document.getElementById('cr-sigla-resultado').innerText = type === 'buy' ? crMoedaAtual.sigla : 'BRL';
    document.getElementById('cr-input-valor').value = '';
    crCalcular();
}

function crQuick(pct) {
    let val;
    if (crTradeType === 'buy') {
        val = crSaldoBRL * (pct / 100);
    } else {
        const qtd = crCarteira[crMoedaAtual.id] || 0;
        val = qtd * crMoedaAtual.preco * (pct / 100);
    }
    document.getElementById('cr-input-valor').value = val.toFixed(2);
    crCalcular();
}

function crCalcular() {
    const valStr = document.getElementById('cr-input-valor').value;
    const val    = parseFloat(valStr);
    const preco  = crMoedaAtual.preco;
    const btn    = document.getElementById('cr-btn-executar');
    const erroEl = document.getElementById('cr-erro');

    document.getElementById('cr-cotacao').innerText = crFmt(preco);

    const reset = () => {
        document.getElementById('cr-fracao').innerText = '0.00000000';
        document.getElementById('cr-taxa').innerText   = '- R$ 0,00';
        document.getElementById('cr-total').innerText  = 'R$ 0,00';
        btn.disabled = true;
    };

    if (!valStr || isNaN(val) || val <= 0) {
        reset();
        erroEl.innerText = '';
        return;
    }
    if (val < 10) {
        reset();
        erroEl.innerText = 'Valor mínimo: R$ 10,00';
        erroEl.className = 'form-erro ativo';
        return;
    }
    const max = crTradeType === 'buy'
        ? crSaldoBRL
        : (crCarteira[crMoedaAtual.id] || 0) * preco;

    if (val > max) {
        reset();
        erroEl.innerText = crTradeType === 'buy' ? 'Saldo BRL insuficiente.' : 'Saldo em cripto insuficiente.';
        erroEl.className = 'form-erro ativo';
        return;
    }

    erroEl.className = 'form-erro';
    erroEl.innerText = '';
    btn.disabled = false;

    const taxa   = val * 0.005;
    const liquido = val - taxa;

    document.getElementById('cr-taxa').innerText  = `- ${crFmt(taxa)}`;
    document.getElementById('cr-total').innerText = crFmt(liquido);

    if (crTradeType === 'buy') {
        document.getElementById('cr-fracao').innerText = crFmtCripto(liquido / preco);
        document.getElementById('cr-sigla-resultado').innerText = crMoedaAtual.sigla;
    } else {
        document.getElementById('cr-fracao').innerText = crFmt(liquido).replace('R$','').trim();
        document.getElementById('cr-sigla-resultado').innerText = 'BRL';
    }
}

function crConfirmar() {
    const val    = parseFloat(document.getElementById('cr-input-valor').value);
    const preco  = crMoedaAtual.preco;
    const taxa   = val * 0.005;
    const liquido = val - taxa;
    const fracao  = document.getElementById('cr-fracao').innerText;

    if (!crCarteira[crMoedaAtual.id]) crCarteira[crMoedaAtual.id] = 0;

    if (crTradeType === 'buy') {
        crCarteira[crMoedaAtual.id] += liquido / preco;
        crSaldoBRL -= val;
    } else {
        crCarteira[crMoedaAtual.id] -= val / preco;
        if (crCarteira[crMoedaAtual.id] < 0) crCarteira[crMoedaAtual.id] = 0;
        crSaldoBRL += liquido;
    }

    localStorage.setItem('cr-carteira', JSON.stringify(crCarteira));
    localStorage.setItem('cr-saldo-brl', crSaldoBRL.toString());

    crRenderPizza();
    crAtualizarSaldos();

    // Modal
    document.getElementById('cr-m-tipo').innerText  = crTradeType === 'buy' ? 'Compra' : 'Venda';
    document.getElementById('cr-m-valor').innerText = crFmt(val);
    document.getElementById('cr-m-ativo').innerText = crTradeType === 'buy'
        ? `${fracao} ${crMoedaAtual.sigla}`
        : `R$ ${fracao}`;
    const icone = document.getElementById('cr-modal-icone');
    icone.innerHTML = crTradeType === 'buy'
        ? '<i class="fa-solid fa-circle-arrow-down" style="color:#1A7A3C"></i>'
        : '<i class="fa-solid fa-circle-arrow-up" style="color:#CC0000"></i>';

    const ordem = {
        tipo: crTradeType, moeda: crMoedaAtual.sigla,
        valor: crFmt(val), qtd: fracao,
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
    crOrdens.unshift(ordem);
    if (crOrdens.length > 20) crOrdens.pop();
    crRenderOrdens();

    document.getElementById('cr-modal').classList.add('ativo');

    // Limpa input
    document.getElementById('cr-input-valor').value = '';
    crCalcular();
}

function crFecharModal() {
    document.getElementById('cr-modal').classList.remove('ativo');
}

// ─── ORDENS ───────────────────────────────────────────────────
function crRenderOrdens() {
    const ul = document.getElementById('cr-ordens');
    if (!ul) return;
    if (crOrdens.length === 0) {
        ul.innerHTML = '<li class="cr-ordem-vazia">Nenhuma ordem executada ainda nesta sessão.</li>';
        return;
    }
    ul.innerHTML = crOrdens.map(o => `
        <li class="cr-ordem-item">
            <div class="cr-ordem-info">
                <span class="cr-ordem-nome">${o.tipo === 'buy' ? 'Compra' : 'Venda'} ${o.moeda}</span>
                <span class="cr-ordem-data">${o.hora}</span>
            </div>
            <span class="${o.tipo === 'buy' ? 'cr-ordem-val-pos' : 'cr-ordem-val-neg'}">
                ${o.tipo === 'buy' ? '+' : '-'} ${o.qtd} ${o.tipo === 'buy' ? o.moeda : 'BRL'}
            </span>
        </li>`).join('');
    }