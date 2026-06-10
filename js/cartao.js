let saldoOculto = false;
function toggleSaldo() {
    const saldoDiv = document.getElementById('saldo-valor');
    const btnOcultar = document.getElementById('btn-ocultar');
    if (!saldoOculto) {
        saldoDiv.innerText = 'R$ *******';
        btnOcultar.innerHTML = '<i class="fa-solid fa-eye-slash"></i> Mostrar';
        saldoOculto = true;
    } else {
        saldoDiv.innerText = 'R$ 4.250,00';
        btnOcultar.innerHTML = '<i class="fa-solid fa-eye"></i> Ocultar';
        saldoOculto = false;
    }
}

// --- BANCO DE DADOS DINÂMICO E EXPANDIDO DOS CARTÕES ---
const dadosCartoes = {
    visa: {
        numero: '**** **** **** 4591',
        limiteTotal: 5000,
        fatura: 1500.00,
        bloqueado: false,
        classeCSS: 'cartao-visa-design',
        classeIcone: 'fa-brands fa-cc-visa fa-2x',
        validade: 'VAL: 12/31',
        lancamentos: [
            { local: 'Posto Ipiranga', data: 'Ontem, 18:20', valor: '- R$ 150,00' },
            { local: 'Restaurante Sabor', data: '02 Jun, 13:15', valor: '- R$ 85,40' },
            { local: 'Lojas Americanas', data: '29 Mai, 11:00', valor: '- R$ 1.264,60' }
        ]
    },
    master: {
        numero: '**** **** **** 8832',
        limiteTotal: 12000,
        fatura: 4120.50,
        bloqueado: false,
        classeCSS: 'cartao-master-design',
        classeIcone: 'fa-brands fa-cc-mastercard fa-2x',
        validade: 'VAL: 08/29',
        lancamentos: [
            { local: 'Passagens Gol', data: '30 Mai, 22:40', valor: '- R$ 3.500,00' },
            { local: 'Uber Trip', data: '28 Mai, 08:12', valor: '- R$ 42,50' },
            { local: 'Droga Raia', data: '25 Mai, 17:30', valor: '- R$ 578,00' }
        ]
    },
    virtual: {
        numero: '4551 2309 8812 0493',
        limiteTotal: 2000,
        fatura: 0.00,
        bloqueado: false,
        classeCSS: 'cartao-visa-design', // Virtual emitido sob bandeira Visa
        classeIcone: 'fa-solid fa-bolt fa-2x',
        validade: 'CVV: 581 (Dina)',
        lancamentos: [
            { local: 'Nenhum gasto registrado', data: 'Cartão virtual ativo para uso', valor: 'R$ 0,00' }
        ]
    }
};

let cartaoAtual = 'visa';

// Alternância de Abas Dinâmicas
function mudarCartaoVisual(bandeira) {
    cartaoAtual = bandeira;

    // Tratamento de classes ativas nos botões
    document.getElementById('aba-visa').classList.toggle('ativa', bandeira === 'visa');
    document.getElementById('aba-master').classList.toggle('ativa', bandeira === 'master');
    document.getElementById('aba-virtual').classList.toggle('ativa', bandeira === 'virtual');

    const card = dadosCartoes[bandeira];

    // Renderiza estrutura visual básica do cartão gráfico
    const containerDesign = document.getElementById('design-cartao-container');
    containerDesign.className = 'cartao-design-base ' + card.classeCSS;
    if (card.bloqueado) containerDesign.classList.add('bloqueado');

    document.getElementById('icone-bandeira').className = card.classeIcone;
    document.getElementById('txt-num-cartao').innerText = card.numero;
    document.getElementById('txt-validade-cartao').innerText = card.validade;
    document.getElementById('switch-bloqueio').checked = card.bloqueado;

    // Altera comportamento caso seja a tela do Cartão Virtual Dinâmico
    if (bandeira === 'virtual') {
        document.getElementById('txt-marca-banco').innerText = 'CARTÃO VIRTUAL';
        document.getElementById('titulo-painel-direito').innerText = 'Segurança Online';
        document.getElementById('corpo-painel-direito').innerHTML = `
                    <span style="font-size: 14px; color: #666;">CVV Dinâmico Atual:</span>
                    <div style="font-size: 28px; font-weight: bold; color: #2e7d32; margin-top: 5px;">581</div>
                    <p style="font-size: 12px; color: #666; margin-top: 5px;">Este código muda a cada compra para evitar fraudes em sites.</p>
                `;
        document.getElementById('btn-acao-fatura').innerText = 'Copiar Número do Cartão';
        document.getElementById('card-historico-fatura').style.display = 'none'; // Virtual não precisa listar a fatura consolidada
    } else {
        document.getElementById('txt-marca-banco').innerText = 'BRADESCO';
        document.getElementById('titulo-painel-direito').innerText = 'Fatura Atual';
        document.getElementById('corpo-painel-direito').innerHTML = `
                    <span style="font-size: 14px; color: #666;">Total a pagar:</span>
                    <div id="txt-fatura-valor" style="font-size: 32px; font-weight: bold; color: #333; margin-top: 5px;">
                        R$ ${card.fatura.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <p style="font-size: 13px; color: #cc092f; margin-top: 8px;"><i class="fa-solid fa-calendar"></i> Vence em 10/06/2026</p>
                `;
        document.getElementById('btn-acao-fatura').innerText = 'Copiar Código de Barras';
        document.getElementById('card-historico-fatura').style.display = 'block';
    }

    atualizarValoresLimiteTela();
    renderizarLancamentosFatura();
    verificarBloqueioControles(card.bloqueado);
}

// Nova Funcionalidade 1: Lógica do Switch de Bloqueio Físico/Lógico
function toggleBloqueioCartao(isBloqueado) {
    dadosCartoes[cartaoAtual].bloqueado = isBloqueado;
    const containerDesign = document.getElementById('design-cartao-container');

    if (isBloqueado) {
        containerDesign.classList.add('bloqueado');
    } else {
        containerDesign.classList.remove('bloqueado');
    }
    verificarBloqueioControles(isBloqueado);
}

function verificarBloqueioControles(bloqueado) {
    // Desabilita os botões operacionais se o cartão estiver travado
    document.getElementById('btn-ajuste-limite-trigger').disabled = bloqueado;
    document.getElementById('btn-acao-fatura').disabled = bloqueado;
}

// Direcionamento do botão de ação do painel direito
function executarAcaoPainelDireito() {
    if (cartaoAtual === 'virtual') {
        alert('Número do Cartão Virtual copiado com sucesso! Pronto para colar no e-commerce.');
    } else {
        alert('Código de barras da fatura Bradesco copiado para a área de transferência!');
    }
}

// Nova Funcionalidade 3: Montagem Dinâmica da Fatura
function renderizarLancamentosFatura() {
    const lista = document.getElementById('lista-gastos-cartao');
    lista.innerHTML = ''; // Limpa a lista corrente

    dadosCartoes[cartaoAtual].lancamentos.forEach(item => {
        const li = document.createElement('li');
        li.className = 'transacao';
        li.style.marginBottom = '12px';
        li.innerHTML = `
                    <div class="transacao-info">
                        <span class="transacao-nome">${item.local}</span>
                        <span class="transacao-data">${item.data}</span>
                    </div>
                    <span class="transacao-valor negativo">${item.valor}</span>
                `;
        lista.appendChild(li);
    });
}

// Controle de Cálculos de Limites na Interface
function atualizarValoresLimiteTela() {
    const card = dadosCartoes[cartaoAtual];
    const disponivel = card.limiteTotal - card.fatura;

    document.getElementById('val-limite-total').innerText = 'R$ ' + card.limiteTotal.toLocaleString('pt-BR') + ',00';
    document.getElementById('val-limite-disp').innerText = 'R$ ' + disponivel.toLocaleString('pt-BR') + ',00';
}

// Modais de Limite Interativo
function abrirModalLimite() {
    const card = dadosCartoes[cartaoAtual];
    const modalInput = document.getElementById('input-range-limite');

    if (cartaoAtual === 'visa') {
        modalInput.min = 2000; modalInput.max = 10000;
    } else if (cartaoAtual === 'master') {
        modalInput.min = 5000; modalInput.max = 30000;
    } else {
        modalInput.min = 500; modalInput.max = 5000;
    }

    modalInput.value = card.limiteTotal;
    atualizarLabelModal(card.limiteTotal);
    document.getElementById('modal-ajuste').classList.add('ativo');
}

function fecharModalLimite() {
    document.getElementById('modal-ajuste').classList.remove('ativo');
}

function atualizarLabelModal(valor) {
    document.getElementById('label-modal-valor').innerText = Number(valor).toLocaleString('pt-BR');
}

function salvarNovoLimite() {
    const novoValor = document.getElementById('input-range-limite').value;
    dadosCartoes[cartaoAtual].limiteTotal = Number(novoValor);
    atualizarValoresLimiteTela();
    fecharModalLimite();
}

// Inicializadores de Carga Primária da Página
if (document.getElementById('design-cartao-container')) atualizarValoresLimiteTela();
if (document.getElementById('lista-gastos-cartao'))     renderizarLancamentosFatura();

const elDataHoje = document.getElementById('data-hoje');
if (elDataHoje) elDataHoje.innerText = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});