// Exibe a data atual na saudação
function exibirData() {
    const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];


    const hoje = new Date();
    const texto = `${diasSemana[hoje.getDay()]}, ${hoje.getDate()} de ${meses[hoje.getMonth()]}`;

    const el = document.getElementById('data-hoje');
    if (el) el.textContent = texto;
}

//Oculta ou exibe o saldo
function toggleSaldo() {
    const saldo = document.getElementById('saldo-valor');
    const btn = document.getElementById('btn-ocultar');
    if (!saldo || !btn) return;

    if (saldo.textContent.includes('R$')) {
        saldo.textContent = '•••••••';
        btn.textContent = '👁️ Mostrar';
    } else {
        saldo.textContent = 'R$ 4.250,00';
        btn.textContent = '👁️ Ocultar';
    }
}

//Roda ao carregar a página
exibirData();

//dashboard
function criarGrafico() {
    const canvas = document.getElementById('graficoMensal')
    if (!canvas) return; //só roda na página do dash

    const ctx = canvas.getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai'],
            datasets: [
                {
                    label: 'Receitas',
                    data: [4800, 5000, 4200, 5500, 5000, 5000],
                    backgroundColor: '#1A7A3C',
                    borderRadius: 8,
                },
                {
                    label: 'Despesas',
                    data: [2100, 1950, 2300, 1800, 1750, 1890],
                    backgroundColor: '#CC0000',
                    borderRadius: 8,
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    }
                }
            }
        }
    });
}

criarGrafico();

//EXTRATO
function filtrarExtrato() {
    const dataInicio = document.getElementById('dataInicio').value;
    const dataFim = document.getElementById('dataFim').value;
    const tipo = document.getElementById('tipoTransacao').value;

    if (!dataInicio || !dataFim) {
        alert('Selecione o período desejado');
        return;
    }

    alert(`Filtrando extrato de ${dataInicio} até ${dataFim}${tipo ? ` - Tipo: ${tipo}` : ''}`);
}

function exportarCSV() {
    alert('Extrato exportado em CSV');
}

function imprimirExtrato() {
    window.print();
}

//RECARGA CELULAR
let operadoraSelecionada = null;
let valorSelecionado = null;

function selecionarOperadora(btn) {
    document.querySelectorAll('.operadora-btn').forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');
    operadoraSelecionada = btn.getAttribute('data-operadora');
    atualizarResumo();
    verificarFormulario();
}

function selecionarValor(btn, valor) {
    document.querySelectorAll('.valor-btn').forEach(b => b.classList.remove('selecionado'));
    btn.classList.add('selecionado');
    valorSelecionado = valor;
    const customizado = document.getElementById('valor-customizado');
    if (customizado) customizado.value = '';
    atualizarResumo();
    verificarFormulario();
}

function limparSelecaoRapida() {
    document.querySelectorAll('.valor-btn').forEach(b => b.classList.remove('selecionado'));
    const customizado = document.getElementById('valor-customizado');
    valorSelecionado = customizado && customizado.value ? parseFloat(customizado.value) : null;
    atualizarResumo();
    verificarFormulario();
}

function aoFocarValorCustomizado() {
    document.querySelectorAll('.valor-btn').forEach(b => b.classList.remove('selecionado'));
    valorSelecionado = null;
}

function aoSairValorCustomizado() {
    const customizado = document.getElementById('valor-customizado');
    if (customizado && customizado.value) {
        valorSelecionado = parseFloat(customizado.value);
        atualizarResumo();
        verificarFormulario();
    }
}

function validarFormatoTelefone() {
    const input = document.getElementById('numero-celular');
    const erro = document.getElementById('erro-telefone');
    if (!input) return;

    let val = input.value.replace(/\D/g, '');
    if (val.length <= 11) {
        val = val.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
    input.value = val;

    const valido = /^\(\d{2}\) \d{5}-\d{4}$/.test(input.value);
    if (erro) erro.classList.toggle('ativo', input.value.length > 0 && !valido);
    input.classList.toggle('erro', input.value.length > 0 && !valido);

    atualizarResumo();
    verificarFormulario();
}

function atualizarResumo() {
    const numero = document.getElementById('numero-celular');
    const resumoContainer = document.getElementById('resumo-container');
    if (!resumoContainer) return;

    const temNumero = numero && /^\(\d{2}\) \d{5}-\d{4}$/.test(numero.value);

    if (temNumero || operadoraSelecionada || valorSelecionado) {
        resumoContainer.style.display = 'block';
        document.getElementById('resumo-numero').textContent = temNumero ? numero.value : '-';
        document.getElementById('resumo-operadora').textContent = operadoraSelecionada
            ? operadoraSelecionada.charAt(0).toUpperCase() + operadoraSelecionada.slice(1)
            : '-';
        document.getElementById('resumo-valor').textContent = valorSelecionado
            ? 'R$ ' + valorSelecionado.toFixed(2).replace('.', ',')
            : '-';
    } else {
        resumoContainer.style.display = 'none';
    }
}

function verificarFormulario() {
    const numero = document.getElementById('numero-celular');
    const btnConfirmar = document.getElementById('btn-confirmar');
    if (!btnConfirmar) return;

    const numeroValido = numero && /^\(\d{2}\) \d{5}-\d{4}$/.test(numero.value);
    btnConfirmar.disabled = !(numeroValido && operadoraSelecionada && valorSelecionado);
}

function confirmarRecarga() {
    const numero = document.getElementById('numero-celular').value;
    const operadora = operadoraSelecionada.charAt(0).toUpperCase() + operadoraSelecionada.slice(1);
    const valor = 'R$ ' + valorSelecionado.toFixed(2).replace('.', ',');
    const protocolo = 'BRD' + Date.now().toString().slice(-8);

    if (valorSelecionado <= 500) {
        document.getElementById('modal-numero').textContent = numero;
        document.getElementById('modal-operadora').textContent = operadora;
        document.getElementById('modal-valor').textContent = valor;
        document.getElementById('modal-protocolo').textContent = protocolo;
        document.getElementById('modal-sucesso').classList.add('ativo');
    } else {
        document.getElementById('processamento-celular').textContent = numero;
        document.getElementById('modal-processamento').classList.add('ativo');
    }
}

function fecharModal() {
    document.getElementById('modal-sucesso').classList.remove('ativo');
    limparFormulario();
}

function fecharModalProcessamento() {
    document.getElementById('modal-processamento').classList.remove('ativo');
    limparFormulario();
}

function limparFormulario() {
    const numero = document.getElementById('numero-celular');
    const customizado = document.getElementById('valor-customizado');
    if (numero) numero.value = '';
    if (customizado) customizado.value = '';
    document.querySelectorAll('.operadora-btn').forEach(b => b.classList.remove('ativo'));
    document.querySelectorAll('.valor-btn').forEach(b => b.classList.remove('selecionado'));
    operadoraSelecionada = null;
    valorSelecionado = null;
    const resumo = document.getElementById('resumo-container');
    if (resumo) resumo.style.display = 'none';
    const btnConfirmar = document.getElementById('btn-confirmar');
    if (btnConfirmar) btnConfirmar.disabled = true;
}

// Tranferência
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

//BILHETE UNICO
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
    const numero = document.getElementById('numero-bilhete');
    const container = document.getElementById('resumo-bilhete-container');
    if (!container) return;

    const numeros = numero.value.replace(/\D/g, '');
    const numeroValido = numeros.length === 16;
    const temAlgo = numeroValido || tipoBilheteSelecionado || valorBilheteSelecionado;
    container.style.display = temAlgo ? 'block' : 'none';

    document.getElementById('resumo-bilhete-numero').textContent =
        numeroValido ? numero.value : '-';
    document.getElementById('resumo-bilhete-tipo').textContent =
        tipoBilheteSelecionado || '-';
    document.getElementById('resumo-bilhete-valor').textContent =
        valorBilheteSelecionado
            ? 'R$ ' + valorBilheteSelecionado.toFixed(2).replace('.', ',')
            : '-';
}

function verificarFormularioBilhete() {
    const numero = document.getElementById('numero-bilhete');
    const btn = document.getElementById('btn-confirmar-bilhete');
    if (!btn) return;
    const numeroValido = numero.value.replace(/\D/g, '').length === 16;
    btn.disabled = !(numeroValido && tipoBilheteSelecionado && valorBilheteSelecionado);
}

function confirmarBilhete() {
    const numero = document.getElementById('numero-bilhete').value;
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
    document.querySelectorAll('.operadora-btn').forEach(b => b.classList.remove('ativo'));
    tipoBilheteSelecionado = null;
    valorBilheteSelecionado = null;
    document.getElementById('grupo-valores-bilhete').style.display = 'none';
    document.getElementById('grupo-custom-bilhete').style.display = 'none';
    document.getElementById('resumo-bilhete-container').style.display = 'none';
    document.getElementById('btn-confirmar-bilhete').disabled = true;
    const erro = document.getElementById('erro-bilhete');
    if (erro) erro.textContent = '';
}