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

window.addEventListener('load', criarGrafico);

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

//CARTÕES DE CREDITO E DEBITO
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


/* CRIPTOMOEDAS */

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