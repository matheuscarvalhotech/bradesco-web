console.log('Transferir.js carregado');

let tipoTransferencia = null;

function selecionarTipo(btn, tipo) {
    document.querySelectorAll('.tipo-btn').forEach(b => b.classList.remove('selecionado'));
    btn.classList.add('selecionado');
    tipoTransferencia = tipo;

    // Mostra campo de data se for agendada
    const grupoData = document.getElementById('grupo-data');
    if (grupoData) grupoData.style.display = tipo === 'Agendada' ? 'block' : 'none';

    document.getElementById('btn-prox-1').disabled = false;
}

function irParaEtapa(numero) {
    // Esconde todas as etapas
    document.querySelectorAll('.etapa-conteudo').forEach(el => el.style.display = 'none');

    // Mostra a etapa alvo
    document.getElementById('etapa-' + numero).style.display = 'block';

    // Atualiza indicador
    for (let i = 1; i <= 4; i++) {
        const ind = document.getElementById('ind-etapa-' + i);
        const linha = document.querySelectorAll('.etapa-linha')[i - 1];
        ind.classList.remove('ativa', 'concluida');
        if (linha) linha.classList.remove('concluida');

        if (i < numero) {
            ind.classList.add('concluida');
            if (linha) linha.classList.add('concluida');
        } else if (i === numero) {
            ind.classList.add('ativa');
        }
    }

    // Se chegou na etapa 4, preenche o resumo
    if (numero === 4) preencherConfirmacao();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function verificarEtapa2() {
    const nome = document.getElementById('nome-favorecido').value.trim();
    const banco = document.getElementById('banco').value;
    const agencia = document.getElementById('agencia').value;
    const conta = document.getElementById('conta').value;
    const btn = document.getElementById('btn-prox-2');
    if (btn) btn.disabled = !(nome && banco && agencia.length >= 4 && conta.length >= 7);
}

function verificarEtapa3() {
    const valor = document.getElementById('valor-transferencia').value;
    const btn = document.getElementById('btn-prox-3');
    if (!btn) return;

    if (tipoTransferencia === 'Agendada') {
        const data = document.getElementById('data-agendamento').value;
        btn.disabled = !(valor && data);
    } else {
        btn.disabled = !valor;
    }
}

function preencherConfirmacao() {
    const agencia = document.getElementById('agencia').value;
    const conta = document.getElementById('conta').value;
    const descricao = document.getElementById('descricao').value;
    const data = document.getElementById('data-agendamento')?.value;

    document.getElementById('conf-tipo').textContent = tipoTransferencia;
    document.getElementById('conf-favorecido').textContent = document.getElementById('nome-favorecido').value;
    document.getElementById('conf-banco').textContent = document.getElementById('banco').value;
    document.getElementById('conf-agencia-conta').textContent = agencia + ' / ' + conta;
    document.getElementById('conf-valor').textContent = document.getElementById('valor-transferencia').value;

    const linhaData = document.getElementById('conf-linha-data');
    if (data && tipoTransferencia === 'Agendada') {
        linhaData.style.display = 'flex';
        document.getElementById('conf-data').textContent = data.split('-').reverse().join('/');
    } else {
        linhaData.style.display = 'none';
    }

    const linhaDesc = document.getElementById('conf-linha-descricao');
    if (descricao) {
        linhaDesc.style.display = 'flex';
        document.getElementById('conf-descricao').textContent = descricao;
    } else {
        linhaDesc.style.display = 'none';
    }
}

function confirmarTransferencia() {
    const protocolo = 'BRD' + Date.now().toString().slice(-8);
    document.getElementById('modal-favorecido').textContent = document.getElementById('nome-favorecido').value;
    document.getElementById('modal-banco').textContent = document.getElementById('banco').value;
    document.getElementById('modal-valor-transferencia').textContent = document.getElementById('valor-transferencia').value;
    document.getElementById('modal-protocolo-transferencia').textContent = protocolo;
    document.getElementById('modal-sucesso-transferencia').classList.add('ativo');
}

function fecharModalTransferencia() {
    document.getElementById('modal-sucesso-transferencia').classList.remove('ativo');
    irParaEtapa(1);
    document.querySelectorAll('.tipo-btn').forEach(b => b.classList.remove('selecionado'));
    ['nome-favorecido', 'banco', 'agencia', 'conta', 'valor-transferencia', 'descricao'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    tipoTransferencia = null;
    document.getElementById('btn-prox-1').disabled = true;
}

function formatarConta(input) {
    let val = input.value.replace(/\D/g, '');
    if (val.length > 6) val = val.slice(0, 6);
    if (val.length > 5) val = val.slice(0, 5) + '-' + val.slice(5);
    input.value = val;
}

function formatarValorTransferencia(input) {
    let val = input.value.replace(/\D/g, '');
    if (!val) { input.value = ''; return; }
    val = (parseInt(val) / 100).toFixed(2);
    input.value = 'R$ ' + val.replace('.', ',');
}