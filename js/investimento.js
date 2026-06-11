// =====================
// DATA DE HOJE
// =====================
(function () {
    const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const hoje = new Date();
    const el = document.getElementById('data-hoje');
    if (el) el.textContent = `${dias[hoje.getDay()]}, ${hoje.getDate()} de ${meses[hoje.getMonth()]}`;
})();

// =====================
// ABAS DE INVESTIMENTO
// =====================
document.addEventListener('DOMContentLoaded', function () {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const contentSections = document.querySelectorAll('.content-section');

    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            const product = this.getAttribute('data-product');
            tabButtons.forEach(btn => btn.classList.remove('active'));
            contentSections.forEach(section => section.classList.remove('active'));
            this.classList.add('active');
            const target = document.getElementById(product);
            if (target) target.classList.add('active');
        });
    });
});

// =====================
// MEU PORQUINHO — estado mockado
// =====================
let porquinhoSaldoAtual = 1250.00;
let porquinhoRendimentoAtual = 93.75;

const fmt = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

function atualizarExibicaoPorquinho() {
    document.getElementById('porquinhoSaldo').textContent = fmt(porquinhoSaldoAtual);
    document.getElementById('porquinhoRendimento').textContent = fmt(porquinhoRendimentoAtual);
}

function calcularPorquinho() {
    const amount = parseFloat(document.getElementById('porquinhoAmount').value) || 0;
    const total = amount + (amount * 0.075);
    document.getElementById('porquinhoResult').textContent = fmt(total);
}

function guardarPorquinho() {
    const amount = parseFloat(document.getElementById('porquinhoAmount').value) || 0;
    if (amount < 1) {
        alert('Digite um valor mínimo de R$ 1,00 para guardar.');
        return;
    }

    porquinhoSaldoAtual += amount;
    porquinhoRendimentoAtual = porquinhoSaldoAtual * 0.075;
    atualizarExibicaoPorquinho();

    const protocolo = 'PQ' + Date.now().toString().slice(-8);
    document.getElementById('modal-guardar-valor').textContent = fmt(amount);
    document.getElementById('modal-guardar-saldo').textContent = fmt(porquinhoSaldoAtual);
    document.getElementById('modal-guardar-protocolo').textContent = protocolo;
    document.getElementById('modal-porquinho-guardar').classList.add('ativo');

    document.getElementById('porquinhoAmount').value = '';
    document.getElementById('porquinhoResult').textContent = 'R$ 0,00';
}

function fecharModalGuardar() {
    document.getElementById('modal-porquinho-guardar').classList.remove('ativo');
}

function resgatarPorquinho() {
    const amount = parseFloat(document.getElementById('porquinhoResgate').value) || 0;
    if (amount < 1) {
        alert('Digite um valor mínimo de R$ 1,00 para resgatar.');
        return;
    }
    if (amount > porquinhoSaldoAtual) {
        alert('Valor de resgate maior que o saldo disponível.');
        return;
    }

    porquinhoSaldoAtual -= amount;
    porquinhoRendimentoAtual = porquinhoSaldoAtual * 0.075;
    atualizarExibicaoPorquinho();

    const protocolo = 'RS' + Date.now().toString().slice(-8);
    document.getElementById('modal-resgatar-valor').textContent = fmt(amount);
    document.getElementById('modal-resgatar-saldo').textContent = fmt(porquinhoSaldoAtual);
    document.getElementById('modal-resgatar-protocolo').textContent = protocolo;
    document.getElementById('modal-porquinho-resgatar').classList.add('ativo');

    document.getElementById('porquinhoResgate').value = '';
}

function fecharModalResgatar() {
    document.getElementById('modal-porquinho-resgatar').classList.remove('ativo');
}

// =====================
// MODAL DE PROJEÇÃO
// =====================
function mostrarProjecao(produto, valor, nome, taxaAnual) {
    const amount = parseFloat(valor) || 0;
    if (amount <= 0 || isNaN(amount)) {
        alert('Por favor, digite um valor válido para investir!');
        return;
    }

    document.getElementById('modalTitle').textContent = `Projeção - ${nome}`;

    const taxaMensal = taxaAnual / 12;
    let rows = '';
    let saldoTotal = amount;

    for (let mes = 1; mes <= 12; mes++) {
        const ganhoMes = saldoTotal * taxaMensal;
        saldoTotal += ganhoMes;
        rows += `
            <tr>
                <td>Mês ${mes}</td>
                <td>${fmt(amount)}</td>
                <td style="color: #4caf50; font-weight: 600;">+ ${fmt(ganhoMes)}</td>
                <td style="font-weight: 600;">${fmt(saldoTotal)}</td>
            </tr>
        `;
    }

    document.getElementById('modalInfo').innerHTML = `
        <div class="info-grid">
            <div class="info-box">
                <div class="info-label">Valor Investido</div>
                <div class="info-value">${fmt(amount)}</div>
            </div>
            <div class="info-box">
                <div class="info-label">Taxa Anual</div>
                <div class="info-value">${(taxaAnual * 100).toFixed(2)}%</div>
            </div>
        </div>
    `;

    document.getElementById('tableBody').innerHTML = rows;
    document.getElementById('modalProjecao').classList.add('active');
}

function fecharModal() {
    document.getElementById('modalProjecao').classList.remove('active');
}

window.onclick = function (event) {
    const modal = document.getElementById('modalProjecao');
    if (event.target === modal) fecharModal();
}

function confirmarInvestimento() {
    const titulo = document.getElementById('modalTitle').textContent;
    const nomeInvestimento = titulo.replace('Projeção - ', '');
    fecharModal();
    mostrarToast(`✓ Investimento em ${nomeInvestimento} confirmado! Seu dinheiro já está rendendo.`, 'success');
}

// =====================
// TOAST
// =====================
function mostrarToast(mensagem, tipo = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = mensagem;
    toast.className = `toast ${tipo} show`;
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.classList.remove('show', 'hide'), 300);
    }, 4000);
}