const valoresPorTipo = {
    'Comum': [10, 20, 30, 50, 100],
    'Estudante': [10, 20, 30, 50],
    'Mensal': [167.40],
    'TOP': [20, 50, 100, 200]
};

let tipoBilheteSelecionado = null;
let valorBilheteSelecionado = null;
let numeroBilheteSelecionado = null;

function selecionarCartaoSalvo(btn, numero) {
    document.querySelectorAll('.cartao-salvo-btn').forEach(b => b.classList.remove('selecionado'));
    btn.classList.add('selecionado');
    numeroBilheteSelecionado = numero;

    // Esconde o campo manual se estava aberto
    document.getElementById('novo-cartao-container').style.display = 'none';
    const inputManual = document.getElementById('numero-bilhete');
    if (inputManual) inputManual.value = '';

    atualizarResumoBilhete();
    verificarFormularioBilhete();
}

function toggleNovoCartao() {
    const container = document.getElementById('novo-cartao-container');
    const visivel = container.style.display !== 'none';

    if (visivel) {
        container.style.display = 'none';
    } else {
        container.style.display = 'block';
        // Desmarca cartão salvo ao digitar manualmente
        document.querySelectorAll('.cartao-salvo-btn').forEach(b => b.classList.remove('selecionado'));
        numeroBilheteSelecionado = null;
        document.getElementById('numero-bilhete').focus();
    }

    atualizarResumoBilhete();
    verificarFormularioBilhete();
}

function formatarBilhete(input) {
    let val = input.value.replace(/\D/g, '').slice(0, 16);
    val = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    input.value = val;
}

function validarBilhete() {
    const input = document.getElementById('numero-bilhete');
    const erro = document.getElementById('erro-bilhete');
    const numeros = input.value.replace(/\D/g, '');
    const valido = numeros.length === 16;
    if (erro) {
        erro.textContent = input.value.length > 0 && !valido
            ? 'O cartão deve ter 16 dígitos' : '';
    }
    input.classList.toggle('erro', input.value.length > 0 && !valido);
}

function selecionarTipoBilhete(btn, tipo) {
    document.querySelectorAll('#grupo-valores-bilhete .valor-btn')
        .forEach(b => b.classList.remove('selecionado'));
    document.querySelectorAll('.operadora-btn').forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');
    tipoBilheteSelecionado = tipo;
    valorBilheteSelecionado = null;

    // Monta os botões de valor
    const container = document.getElementById('valores-bilhete');
    const valores = valoresPorTipo[tipo];
    container.innerHTML = valores.map(v =>
        `<button class="valor-btn" onclick="selecionarValorBilhete(this, ${v})">
            R$ ${v.toFixed(2).replace('.', ',')}
        </button>`
    ).join('');

    // Se for mensal, seleciona automaticamente
    if (tipo === 'Mensal') {
        valorBilheteSelecionado = 167.40;
        container.querySelector('.valor-btn').classList.add('selecionado');
    }

    document.getElementById('grupo-valores-bilhete').style.display = 'block';
    document.getElementById('grupo-custom-bilhete').style.display =
        tipo !== 'Mensal' ? 'block' : 'none';

    atualizarResumoBilhete();
    verificarFormularioBilhete();
}

function selecionarValorBilhete(btn, valor) {
    document.querySelectorAll('#valores-bilhete .valor-btn')
        .forEach(b => b.classList.remove('selecionado'));
    btn.classList.add('selecionado');
    valorBilheteSelecionado = valor;
    const custom = document.getElementById('valor-custom-bilhete');
    if (custom) custom.value = '';
    atualizarResumoBilhete();
    verificarFormularioBilhete();
}

function aoFocarCustomBilhete() {
    document.querySelectorAll('#valores-bilhete .valor-btn')
        .forEach(b => b.classList.remove('selecionado'));
    valorBilheteSelecionado = null;
}

function aoSairCustomBilhete() {
    const input = document.getElementById('valor-custom-bilhete');
    if (input && input.value) {
        const val = parseFloat(input.value.replace(/\D/g, '')) / 100;
        if (val > 0) {
            valorBilheteSelecionado = val;
            atualizarResumoBilhete();
            verificarFormularioBilhete();
        }
    }
}

function formatarValorBilhete(input) {
    let val = input.value.replace(/\D/g, '');
    if (!val) { input.value = ''; return; }
    val = (parseInt(val) / 100).toFixed(2);
    input.value = 'R$ ' + val.replace('.', ',');
}

function atualizarResumoBilhete() {
    const inputManual = document.getElementById('numero-bilhete');
    const container = document.getElementById('resumo-bilhete-container');
    if (!container) return;

    const numeroManual = inputManual ? inputManual.value.replace(/\D/g, '') : '';
    const numeroFinal = numeroBilheteSelecionado || (numeroManual.length === 16 ? inputManual.value : null);

    const temAlgo = numeroFinal || tipoBilheteSelecionado || valorBilheteSelecionado;
    container.style.display = temAlgo ? 'block' : 'none';

    document.getElementById('resumo-bilhete-numero').textContent = numeroFinal || '-';
    document.getElementById('resumo-bilhete-tipo').textContent = tipoBilheteSelecionado || '-';
    document.getElementById('resumo-bilhete-valor').textContent = valorBilheteSelecionado
        ? 'R$ ' + valorBilheteSelecionado.toFixed(2).replace('.', ',') : '-';
}

function verificarFormularioBilhete() {
    const inputManual = document.getElementById('numero-bilhete');
    const btn = document.getElementById('btn-confirmar-bilhete');
    if (!btn) return;

    const numeroManual = inputManual ? inputManual.value.replace(/\D/g, '').length === 16 : false;
    const temNumero = numeroBilheteSelecionado || numeroManual;
    btn.disabled = !(temNumero && tipoBilheteSelecionado && valorBilheteSelecionado);
}

function confirmarBilhete() {
    const inputManual = document.getElementById('numero-bilhete');
    const numero = numeroBilheteSelecionado || (inputManual ? inputManual.value : '-');
    const protocolo = 'BRD' + Date.now().toString().slice(-8);

    document.getElementById('modal-bilhete-numero').textContent = numero;
    document.getElementById('modal-bilhete-tipo').textContent = tipoBilheteSelecionado;
    document.getElementById('modal-bilhete-valor').textContent =
        'R$ ' + valorBilheteSelecionado.toFixed(2).replace('.', ',');
    document.getElementById('modal-bilhete-protocolo').textContent = protocolo;
    document.getElementById('modal-sucesso-bilhete').classList.add('ativo');
}

function fecharModalBilhete() {
    document.getElementById('modal-sucesso-bilhete').classList.remove('ativo');
    limparFormularioBilhete();
}

function limparFormularioBilhete() {
    const numero = document.getElementById('numero-bilhete');
    const custom = document.getElementById('valor-custom-bilhete');
    if (numero) numero.value = '';
    if (custom) custom.value = '';
    document.querySelectorAll('.cartao-salvo-btn').forEach(b => b.classList.remove('selecionado'));
    document.querySelectorAll('.operadora-btn').forEach(b => b.classList.remove('ativo'));
    numeroBilheteSelecionado = null;
    tipoBilheteSelecionado = null;
    valorBilheteSelecionado = null;
    document.getElementById('grupo-valores-bilhete').style.display = 'none';
    document.getElementById('grupo-custom-bilhete').style.display = 'none';
    document.getElementById('novo-cartao-container').style.display = 'none';
    document.getElementById('resumo-bilhete-container').style.display = 'none';
    document.getElementById('btn-confirmar-bilhete').disabled = true;
    const erro = document.getElementById('erro-bilhete');
    if (erro) erro.textContent = '';
}
