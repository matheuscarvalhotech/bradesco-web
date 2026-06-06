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
atualizarValoresLimiteTela();
renderizarLancamentosFatura();

document.getElementById('data-hoje').innerText = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});


/* CRIPTOMOEDAS */
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
 
// --- UTILS ---
const escapeHtml = (unsafe) =>
    (unsafe || '').toString().replace(/[&<"'>]/g, m =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m])
    );
 
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
    const startTime = performance.now();
    const update = (currentTime) => {
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4);
        el.innerText = formatFiatValue(targetValue * ease);
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
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (e) {
        clearTimeout(timeout);
        throw e;
    }
};
 
// --- 2. INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', async () => {
    // Só executa se estivermos na página de cripto
    if (!document.getElementById('crypto-tbody')) return;
 
    const savedWallet = localStorage.getItem('carteira-cripto-bradesco');
    if (savedWallet) carteiraCripto = JSON.parse(savedWallet);
    const savedSaldo = localStorage.getItem('saldo-brl-bradesco');
    if (savedSaldo) saldoBRLDisponivel = parseFloat(savedSaldo);
 
    await initMarketTracker();
    atualizarDisplaySaldoGeral();
    atualizarListaOrdens();
 
    window.addEventListener('beforeunload', () => { if (liveInterval) clearInterval(liveInterval); });
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden' && liveInterval) clearInterval(liveInterval);
        else if (document.visibilityState === 'visible' && document.querySelector('.btn-live')?.classList.contains('ativo')) {
            liveInterval = setInterval(buscarPrecoAoVivo, 5000);
        }
    });
    document.getElementById('crypto-search').addEventListener('input', () => {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(renderizarTabela, 150);
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
            const pairs = FIAT_LIST.filter(f => f.id !== 'BRL').map(f => `${f.id}-BRL`).join(',');
            fiatRaw = await fetchWithTimeout(`https://economia.awesomeapi.com.br/json/last/${pairs}`);
            sessionStorage.setItem(fiatCacheKey, JSON.stringify({ time: Date.now(), data: fiatRaw }));
        }
        fiatData['BRL'] = 1;
        FIAT_LIST.forEach(f => {
            if (f.id !== 'BRL' && fiatRaw[f.id + 'BRL']) fiatData[f.id] = parseFloat(fiatRaw[f.id + 'BRL'].bid);
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
            if (index < 10) cat = 'Blue Chips';
            if (['USDT', 'USDC', 'DAI', 'BUSD'].includes(coin.symbol.toUpperCase())) cat = 'Stablecoins';
            if (['UNI', 'LINK', 'AAVE', 'MKR', 'SNX'].includes(coin.symbol.toUpperCase())) cat = 'DeFi';
            cryptoData[coin.id] = {
                id: coin.id, symbol: escapeHtml(coin.symbol.toUpperCase()),
                nome: escapeHtml(coin.name), precoBRL: coin.current_price,
                pct: coin.price_change_percentage_24h || 0,
                image: escapeHtml(coin.image), categoria: cat
            };
        });
 
        renderizarTabela();
        preencherSelectsConversor();
        selecionarMoeda('bitcoin');
        renderizarPieChart();
    } catch (error) {
        console.error('Erro ao carregar mercado:', error);
        document.getElementById('crypto-tbody').innerHTML =
            '<tr><td colspan="4" class="text-center text-danger" style="padding:24px;">Sistemas temporariamente indisponíveis. Recarregue a página.</td></tr>';
    }
}
 
// --- 3. TABELA ---
function renderizarTabela() {
    const tbody = document.getElementById('crypto-tbody');
    tbody.innerHTML = '';
    const query = document.getElementById('crypto-search').value.toLowerCase();
 
    let list = topCoins.filter(coin => {
        const d = cryptoData[coin.id];
        const matchBusca = d.nome.toLowerCase().includes(query) || d.symbol.toLowerCase().includes(query);
        let matchCat = currentCategoria === 'Todas' ? true
            : currentCategoria === 'Favoritos' ? favoritos.includes(coin.id)
            : d.categoria === currentCategoria;
        return matchBusca && matchCat;
    });
 
    list.sort((a, b) => {
        let valA, valB;
        if (sortColumn === 'nome')  { valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); }
        else if (sortColumn === 'preco') { valA = cryptoData[a.id].precoBRL; valB = cryptoData[b.id].precoBRL; }
        else { valA = cryptoData[a.id].pct; valB = cryptoData[b.id].pct; }
        if (valA < valB) return sortDesc ? 1 : -1;
        if (valA > valB) return sortDesc ? -1 : 1;
        return 0;
    });
 
    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted" style="padding:24px;">Nenhum ativo encontrado.</td></tr>';
        document.getElementById('btn-ver-mais').style.display = 'none';
        return;
    }
 
    const limited = list.slice(0, topCoinsDisplayLimit);
    document.getElementById('btn-ver-mais').style.display = list.length > topCoinsDisplayLimit ? 'inline-block' : 'none';
 
    limited.forEach(coin => {
        const d = cryptoData[coin.id];
        const isFav = favoritos.includes(coin.id);
        const up = d.pct >= 0;
        const tr = document.createElement('tr');
        tr.setAttribute('data-coin-id', coin.id);
        tr.onclick = (e) => { if (e.target.closest('.star-btn')) return; selecionarMoeda(coin.id); rolarParaTopo(); };
        tr.innerHTML = `
            <td class="td-star">
                <button class="star-btn ${isFav ? 'fav-ativo' : ''}" onclick="toggleFavorito('${d.id}')" aria-label="${isFav ? 'Remover' : 'Adicionar'} aos favoritos">
                    <i class="fa-solid fa-star"></i>
                </button>
            </td>
            <td>
                <div class="crypto-row-info">
                    <img src="${d.image}" alt="${d.nome}" class="crypto-row-icon" loading="lazy" width="32" height="32">
                    <div><strong>${d.nome}</strong> <span class="text-muted" style="font-size:12px;">${d.symbol}</span></div>
                </div>
            </td>
            <td class="text-right tabular-nums price-cell" style="font-weight:500;">${formatFiatValue(d.precoBRL)}</td>
            <td class="text-right td-var">
                <span class="chip-var ${up ? 'up' : 'down'} tabular-nums">${up ? '+' : ''}${d.pct.toFixed(2)}%</span>
            </td>`;
        tbody.appendChild(tr);
    });
 
    document.querySelectorAll('.sortable').forEach(th => th.classList.remove('active'));
    const atvTh = document.querySelector(`.sortable[data-col="${sortColumn}"]`);
    if (atvTh) {
        atvTh.classList.add('active');
        const i = atvTh.querySelector('i');
        if (i) i.className = sortDesc ? 'fa-solid fa-sort-down sort-icon' : 'fa-solid fa-sort-up sort-icon';
    }
}
 
function loadMoreCoins() { topCoinsDisplayLimit += 50; renderizarTabela(); }
function rolarParaTopo() { document.getElementById('main-chart-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
function ordenarTabela(col) { sortColumn === col ? sortDesc = !sortDesc : (sortColumn = col, sortDesc = true); renderizarTabela(); }
function filtrarCategoria(cat) {
    currentCategoria = cat;
    document.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('ativo'));
    document.querySelector(`.cat-tab[data-cat="${cat}"]`)?.classList.add('ativo');
    renderizarTabela();
}
function toggleFavorito(id) {
    favoritos = favoritos.includes(id) ? favoritos.filter(f => f !== id) : [...favoritos, id];
    localStorage.setItem('bradesco-favoritos', JSON.stringify(favoritos));
    renderizarTabela();
}
function selecionarMoeda(id) {
    if (!cryptoData[id]) return;
    currentCryptoId = id;
    currentCryptoSymbol = cryptoData[id].symbol;
    document.getElementById('grafico-titulo').innerText = `Análise - ${cryptoData[id].nome}`;
    document.querySelectorAll('.safe-html').forEach(el => {
        if (el.id === 'moeda-selecionada-nome') el.textContent = cryptoData[id].nome;
        else if (el.id === 'moeda-selecionada-sigla' && tradeType === 'buy') el.textContent = cryptoData[id].symbol;
    });
    document.getElementById('conv-to').value = id;
    liveInterval ? mudarTempo('LIVE') : carregarGraficoHistorico(currentDays);
    calcularTrade();
    converterMoedas();
}
 
// --- 4. GRÁFICOS ---
const pulsingDotPlugin = {
    id: 'pulsingDot',
    afterDraw(chart) {
        if (!chart._isLive) return;
        const meta = chart.getDatasetMeta(0);
        if (!meta || meta.data.length === 0) return;
        const last = meta.data[meta.data.length - 1];
        if (!last) return;
        const ctx = chart.ctx;
        const phase = (Date.now() % 2000) / 2000;
        ctx.save();
        ctx.beginPath();
        ctx.arc(last.x, last.y, 5 + (16 - 5) * phase, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(204,0,0,${(1 - phase) * 0.6})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(last.x, last.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#CC0000';
        ctx.fill();
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }
};
 
let pulseAnimFrame = null;
function iniciarPulseAnimation() {
    pararPulseAnimation();
    const tick = () => { if (cryptoChartInstance?._isLive) cryptoChartInstance.draw(); pulseAnimFrame = setTimeout(tick, 33); };
    tick();
}
function pararPulseAnimation() { if (pulseAnimFrame) { clearTimeout(pulseAnimFrame); pulseAnimFrame = null; } }
 
let clockInterval = null;
function iniciarRelogio() {
    if (clockInterval) clearInterval(clockInterval);
    atualizarRelogio();
    clockInterval = setInterval(atualizarRelogio, 1000);
}
function atualizarRelogio() {
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const el = document.getElementById('live-clock');
    if (el) el.innerHTML = `<i class="fa-regular fa-clock"></i> ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}
function atualizarInfoBar(preco, pct) {
    const el = document.getElementById('live-price');
    const ch = document.getElementById('live-change');
    if (el) el.innerText = formatFiatValue(preco);
    if (ch) {
        ch.className = `live-change ${pct >= 0 ? 'up' : 'down'}`;
        ch.innerText = `${pct >= 0 ? '▲' : '▼'} ${Math.abs(pct).toFixed(2)}%`;
    }
}
 
async function carregarGraficoHistorico(dias, isLive = false) {
    currentDays = dias;
    if (!isLive) document.getElementById('main-chart-container')?.classList.add('skeleton-light');
    try {
        const diasReq = isLive ? 1 : dias;
        const hist = await fetchWithTimeout(`https://api.coingecko.com/api/v3/coins/${currentCryptoId}/market_chart?vs_currency=brl&days=${diasReq}`);
        const labels = hist.prices.map(item => {
            const d = new Date(item[0]);
            return diasReq === 1 || isLive ? `${d.getHours()}:${d.getMinutes().toString().padStart(2,'0')}` : `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
        });
        renderizarGraficoArea(labels, hist.prices.map(i => i[1]), isLive);
        if (cryptoData[currentCryptoId]) atualizarInfoBar(cryptoData[currentCryptoId].precoBRL, cryptoData[currentCryptoId].pct);
        iniciarRelogio();
    } catch (e) { console.error(e); }
    finally { document.getElementById('main-chart-container')?.classList.remove('skeleton-light'); }
}
 
function renderizarGraficoArea(labels, prices, isLive) {
    const canvas = document.getElementById('cryptoTrendGraph');
    const ctx = canvas.getContext('2d');
    if (cryptoChartInstance) cryptoChartInstance.destroy();
    Chart.defaults.color = '#666';
    let hasZoom = false;
    try { hasZoom = !!Chart.registry.getPlugin('zoom'); } catch (e) {}
    const zoomOptions = hasZoom ? {
        zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x', onZoomComplete: () => { document.getElementById('btn-reset-zoom').style.display = 'inline-flex'; } },
        pan:  { enabled: true, mode: 'x', onPanComplete: () => { document.getElementById('btn-reset-zoom').style.display = 'inline-flex'; } }
    } : {};
 
    cryptoChartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets: [{ label: 'Cotação', data: prices, fill: false, borderWidth: 2.5, tension: 0.2, pointRadius: 0, pointHoverRadius: 6, pointHoverBackgroundColor: '#CC0000', pointHoverBorderColor: '#FFF', pointHoverBorderWidth: 2,
            segment: { borderColor: ctx => (!ctx.p0 || !ctx.p1) ? '#999' : ctx.p0.parsed.y <= ctx.p1.parsed.y ? '#1A7A3C' : '#CC0000' }
        }] },
        options: {
            responsive: true, maintainAspectRatio: false,
            interaction: { intersect: false, mode: 'index' },
            plugins: {
                legend: { display: false },
                tooltip: { backgroundColor: '#FFF', titleColor: '#000', bodyColor: '#333', borderColor: '#E0E0E0', borderWidth: 1, padding: 12, displayColors: false, callbacks: { label: ctx => `Cotação: ${formatFiatValue(ctx.parsed.y)}` } },
                zoom: zoomOptions
            },
            layout: { padding: { top: 20, right: 20 } },
            scales: { x: { grid: { display: false }, ticks: { maxTicksLimit: 10 } }, y: { grid: { color: '#f0f0f0' } } },
            animation: isLive ? { duration: 0 } : { duration: 600, easing: 'easeOutQuart' }
        },
        plugins: isLive ? [pulsingDotPlugin] : []
    });
    cryptoChartInstance._isLive = isLive;
    document.getElementById('btn-reset-zoom').style.display = 'none';
    isLive ? iniciarPulseAnimation() : pararPulseAnimation();
}
 
function resetarZoom() {
    cryptoChartInstance?.resetZoom();
    document.getElementById('btn-reset-zoom').style.display = 'none';
}
 
function mudarTempo(tipo) {
    document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('ativo'));
    document.querySelector(`.time-btn[data-tf="${tipo}"]`)?.classList.add('ativo');
    if (liveInterval) { clearInterval(liveInterval); liveInterval = null; }
    if (tipo === 'LIVE') carregarGraficoHistorico(1, true).then(() => { liveInterval = setInterval(buscarPrecoAoVivo, 5000); });
    else if (tipo === '1D') carregarGraficoHistorico(1);
    else if (tipo === '15D') carregarGraficoHistorico(15);
    else if (tipo === '1M') carregarGraficoHistorico(30);
}
 
async function buscarPrecoAoVivo() {
    if (!cryptoChartInstance || document.visibilityState === 'hidden') return;
    try {
        const data = await fetchWithTimeout(`https://api.coingecko.com/api/v3/simple/price?ids=${currentCryptoId}&vs_currencies=brl&include_24hr_change=true`, {}, 4000);
        const novoPreco = data[currentCryptoId].brl;
        const novoPct  = data[currentCryptoId].brl_24h_change || 0;
        const agora = new Date();
        const label = `${agora.getHours()}:${String(agora.getMinutes()).padStart(2,'0')}:${String(agora.getSeconds()).padStart(2,'0')}`;
        const precoAntigo = cryptoData[currentCryptoId].precoBRL;
        cryptoData[currentCryptoId].precoBRL = novoPreco;
        cryptoData[currentCryptoId].pct = novoPct;
        document.getElementById('trade-cotacao').innerText = formatFiatValue(novoPreco);
        atualizarInfoBar(novoPreco, novoPct);
        const cd = cryptoChartInstance.data;
        cd.labels.push(label);
        cd.datasets[0].data.push(novoPreco);
        if (cd.labels.length > 60) { cd.labels.shift(); cd.datasets[0].data.shift(); }
        cryptoChartInstance.update('none');
        const row = document.querySelector(`tr[data-coin-id="${currentCryptoId}"]`);
        if (row) {
            const cell = row.querySelector('.price-cell');
            if (cell) {
                cell.innerText = formatFiatValue(novoPreco);
                cell.style.color = novoPreco >= precoAntigo ? '#1A7A3C' : '#CC0000';
                setTimeout(() => cell.style.color = '', 1000);
            }
        }
    } catch (e) { console.warn('Polling silenciado', e); }
}
 
// --- 5. CONVERSOR ---
function preencherSelectsConversor() {
    const from = document.getElementById('conv-from');
    const to   = document.getElementById('conv-to');
    const fiatOpts   = FIAT_LIST.map(f => `<option value="${f.id}">${f.emoji} ${f.id} - ${f.nome}</option>`).join('');
    const cryptoOpts = topCoins.map(c => `<option value="${c.id}">✧ ${escapeHtml(c.symbol.toUpperCase())} - ${escapeHtml(c.name)}</option>`).join('');
    const all = `<optgroup label="Moedas Mundiais (Fiat)">${fiatOpts}</optgroup><optgroup label="Criptomoedas">${cryptoOpts}</optgroup>`;
    from.innerHTML = to.innerHTML = all;
    from.value = 'BRL';
    to.value = 'bitcoin';
}
function swapCurrencies() {
    const from = document.getElementById('conv-from');
    const to   = document.getElementById('conv-to');
    [from.value, to.value] = [to.value, from.value];
    converterMoedas();
}
function converterMoedas() {
    const amount = parseFloat(document.getElementById('conv-amount').value);
    const from   = document.getElementById('conv-from').value;
    const to     = document.getElementById('conv-to').value;
    const resultEl = document.getElementById('conv-result');
    if (isNaN(amount) || amount === 0) { resultEl.value = '0'; return; }
    const emBRL = fiatData[from] ? amount * fiatData[from] : (cryptoData[from] ? amount * cryptoData[from].precoBRL : 0);
    const resultado = fiatData[to] ? emBRL / fiatData[to] : (cryptoData[to] ? emBRL / cryptoData[to].precoBRL : 0);
    resultEl.value = fiatData[to] ? formatFiatValue(resultado, to).replace(/[^\d.,]/g, '').trim() : formatCryptoValue(resultado);
}
 
// --- 6. PIZZA ---
function renderizarPieChart() {
    const ctx = document.getElementById('portfolioPieChart').getContext('2d');
    let labels = [], values = [], total = 0;
    Object.keys(carteiraCripto).forEach(id => {
        if (carteiraCripto[id] > 0 && cryptoData[id]) {
            const val = carteiraCripto[id] * cryptoData[id].precoBRL;
            labels.push(cryptoData[id].symbol);
            values.push(val);
            total += val;
        }
    });
    saldoTotalBRL = total;
    atualizarDisplaySaldoGeral(true);
    if (pieChartInstance) pieChartInstance.destroy();
    const opts = { cutout: '75%', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };
    pieChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: values.length === 0
            ? { labels: ['Vazio'], datasets: [{ data: [1], backgroundColor: ['#e0e0e0'], borderWidth: 0 }] }
            : { labels, datasets: [{ data: values, backgroundColor: ['#F7931A','#627EEA','#345D9D','#14C784','#E23C6D'], borderWidth: 0 }] },
        options: values.length === 0 ? { ...opts, plugins: { ...opts.plugins, tooltip: { enabled: false } } } : opts
    });
}
 
// --- 7. TRADE ---
function setTradeType(type) {
    tradeType = type;
    ['buy','sell'].forEach(t => document.getElementById(`tab-${t}`).classList.toggle('ativo', t === type));
    document.getElementById('label-trade-acao').innerText = type === 'buy' ? 'Comprar' : 'Vender';
    document.getElementById('moeda-selecionada-sigla').textContent = type === 'buy' ? currentCryptoSymbol : 'BRL';
    document.getElementById('valor-trade').value = '';
    calcularTrade();
}
function setQuickValue(pct) {
    const val = tradeType === 'buy'
        ? saldoBRLDisponivel * (pct / 100)
        : (carteiraCripto[currentCryptoId] || 0) * (pct / 100) * cryptoData[currentCryptoId].precoBRL;
    document.getElementById('valor-trade').value = val.toFixed(2);
    calcularTrade();
}
function calcularTrade() {
    if (!cryptoData[currentCryptoId]) return;
    const valInput = document.getElementById('valor-trade').value;
    const val   = parseFloat(valInput);
    const preco = cryptoData[currentCryptoId].precoBRL;
    const btn   = document.getElementById('btn-comprar');
    const erroEl = document.getElementById('trade-error');
    document.getElementById('trade-cotacao').innerText = formatFiatValue(preco);
 
    const resetZero = () => {
        document.getElementById('fracao-recebida').innerText = '0.00000000';
        document.getElementById('trade-taxa').innerText = '- R$ 0,00';
        document.getElementById('trade-total-brl').innerText = 'R$ 0,00';
        btn.disabled = true;
    };
    if (!valInput || isNaN(val) || val === 0) {
        resetZero();
        erroEl.innerText = 'Digite um valor a partir de R$ 10,00.';
        erroEl.style.display = 'block';
        erroEl.className = 'form-erro text-muted';
        return;
    }
    if (val < 10) {
        resetZero();
        erroEl.innerText = 'O valor mínimo para operar é R$ 10,00.';
        erroEl.style.display = 'block';
        erroEl.className = 'form-erro text-danger';
        return;
    }
    const maxPermitido = tradeType === 'buy' ? saldoBRLDisponivel : (carteiraCripto[currentCryptoId] || 0) * preco;
    if (val > maxPermitido) {
        resetZero();
        erroEl.innerText = tradeType === 'buy' ? 'Saldo BRL insuficiente.' : 'Saldo Cripto insuficiente.';
        erroEl.style.display = 'block';
        erroEl.className = 'form-erro text-danger';
        return;
    }
    erroEl.style.display = 'none';
    btn.disabled = false;
    const taxa = val * 0.005;
    const liquido = val - taxa;
    document.getElementById('trade-taxa').innerText = `- ${formatFiatValue(taxa)}`;
    document.getElementById('trade-total-brl').innerText = formatFiatValue(liquido);
    if (tradeType === 'buy') {
        document.getElementById('fracao-recebida').innerText = formatCryptoValue(liquido / preco);
        document.getElementById('moeda-selecionada-sigla').textContent = currentCryptoSymbol;
    } else {
        document.getElementById('fracao-recebida').innerText = formatFiatValue(liquido).replace('R$','').trim();
        document.getElementById('moeda-selecionada-sigla').textContent = 'BRL';
    }
}
function confirmarTrade() {
    const val    = parseFloat(document.getElementById('valor-trade').value);
    const fracaoStr = document.getElementById('fracao-recebida').innerText;
    const preco  = cryptoData[currentCryptoId].precoBRL;
    const taxa   = val * 0.005;
    const liquido = val - taxa;
    if (!carteiraCripto[currentCryptoId]) carteiraCripto[currentCryptoId] = 0;
    if (tradeType === 'buy') {
        carteiraCripto[currentCryptoId] += liquido / preco;
        saldoBRLDisponivel -= val;
    } else {
        carteiraCripto[currentCryptoId] -= val / preco;
        if (carteiraCripto[currentCryptoId] < 0) carteiraCripto[currentCryptoId] = 0;
        saldoBRLDisponivel += liquido;
    }
    localStorage.setItem('carteira-cripto-bradesco', JSON.stringify(carteiraCripto));
    localStorage.setItem('saldo-brl-bradesco', saldoBRLDisponivel.toString());
    renderizarPieChart();
    document.getElementById('modal-tipo').textContent = tradeType === 'buy' ? 'Compra' : 'Venda';
    document.getElementById('modal-valor-pago').innerText = formatFiatValue(val);
    document.getElementById('modal-valor-recebido').textContent = tradeType === 'buy' ? `${fracaoStr} ${currentCryptoSymbol}` : `R$ ${fracaoStr}`;
    document.getElementById('modal-icon').innerHTML = tradeType === 'buy'
        ? '<i class="fa-solid fa-circle-arrow-down text-success"></i>'
        : '<i class="fa-solid fa-circle-arrow-up text-danger"></i>';
    const ordem = { tipo: tradeType, moeda: currentCryptoSymbol, valor: val, qtd: fracaoStr, data: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    ordensFeitas.unshift(ordem);
    if (ordensFeitas.length > 20) ordensFeitas.pop();
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
    ul.innerHTML = ordensFeitas.map(o => `
        <li class="transacao">
            <div class="transacao-info">
                <span class="transacao-nome sora-font" style="font-size:14px;">${o.tipo === 'buy' ? 'Compra' : 'Venda'} ${escapeHtml(o.moeda)}</span>
                <span class="transacao-data">${o.data}</span>
            </div>
            <span class="transacao-valor ${o.tipo === 'buy' ? 'text-success' : 'text-danger'} tabular-nums" style="font-weight:600;">${o.tipo === 'buy' ? '+' : '-'} ${escapeHtml(o.qtd)}</span>
        </li>`).join('');
}
 
// --- 8. SALDOS ---
function toggleFiatSaldo() {
    saldoFiatOculto = !saldoFiatOculto;
    const icon = document.getElementById('icon-eye-fiat');
    if (saldoFiatOculto) {
        document.querySelectorAll('.ocultavel-fiat').forEach(el => el.innerText = 'R$ *****');
        icon.className = 'fa-solid fa-eye-slash';
    } else {
        countUpAnimation('brl-saldo-valor', saldoBRLDisponivel);
        icon.className = 'fa-solid fa-eye';
    }
}
function toggleCriptoSaldo() {
    saldoCriptoOculto = !saldoCriptoOculto;
    const icon = document.getElementById('icon-eye-cripto');
    if (saldoCriptoOculto) {
        document.querySelectorAll('.ocultavel-cripto').forEach(el => el.innerText = 'R$ *****');
        icon.className = 'fa-solid fa-eye-slash';
    } else {
        countUpAnimation('crypto-saldo-valor', saldoTotalBRL);
        icon.className = 'fa-solid fa-eye';
    }
}
function atualizarDisplaySaldoGeral(animar = false) {
    if (!saldoFiatOculto) {
        animar ? countUpAnimation('brl-saldo-valor', saldoBRLDisponivel)
               : (document.getElementById('brl-saldo-valor').innerText = formatFiatValue(saldoBRLDisponivel));
    }
    if (!saldoCriptoOculto) {
        animar ? countUpAnimation('crypto-saldo-valor', saldoTotalBRL)
               : (document.getElementById('crypto-saldo-valor').innerText = formatFiatValue(saldoTotalBRL));
    }
}
