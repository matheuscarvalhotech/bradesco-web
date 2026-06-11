// ─── Data de hoje ───────────────────────────────────────────────────────────
const hoje = new Date();
const opcoes = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
const dataFormatada = hoje.toLocaleDateString('pt-BR', opcoes);
const elementoData = document.getElementById('data-hoje');
if (elementoData) {
    elementoData.textContent = dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1);
}

// Define data mínima para os campos de data como hoje
const dataHojeISO = hoje.toISOString().split('T')[0];
document.querySelectorAll('input[type="date"]').forEach(input => {
    input.min = dataHojeISO;
    input.value = dataHojeISO;
});

// ─── Seleção de método ───────────────────────────────────────────────────────
let metodoAtivo = 'digitar';

function selecionarMetodo(metodo, btn) {
    metodoAtivo = metodo;

    document.querySelectorAll('.tipo-btn').forEach(b => b.classList.remove('tipo-btn--ativo'));
    btn.classList.add('tipo-btn--ativo');

    document.getElementById('painel-digitar').style.display = metodo === 'digitar' ? 'block' : 'none';
    document.getElementById('painel-anexar').style.display  = metodo === 'anexar'  ? 'block' : 'none';
}

// ─── FLUXO DE ETAPAS (painel digitar) ───────────────────────────────────────
let etapaAtual = 1;

function irParaEtapa(numero) {
    // Esconde etapa atual
    document.getElementById(`etapa-${etapaAtual}`).style.display = 'none';
    document.getElementById(`ind-etapa-${etapaAtual}`).classList.remove('ativa');

    // Mostra nova etapa
    etapaAtual = numero;
    document.getElementById(`etapa-${etapaAtual}`).style.display = 'block';
    document.getElementById(`ind-etapa-${etapaAtual}`).classList.add('ativa');

    if (numero === 3) preencherConfirmacao();
}

// ─── Etapa 1: formatação e validação do código ───────────────────────────────
function formatarCodigo(input) {
    let v = input.value.replace(/\D/g, '');
    // Limita a 48 dígitos numéricos
    v = v.substring(0, 48);
    input.value = v;
}

function verificarEtapa1() {
    const codigo = document.getElementById('codigo-barras').value.replace(/\D/g, '');
    const btn = document.getElementById('btn-prox-1');
    const erro = document.getElementById('erro-codigo');

    if (codigo.length >= 44) {
        btn.disabled = false;
        erro.style.display = 'none';
    } else {
        btn.disabled = true;
        if (codigo.length > 0 && codigo.length < 44) {
            erro.style.display = 'block';
        } else {
            erro.style.display = 'none';
        }
    }
}

// ─── Etapa 2: verificar data de pagamento ────────────────────────────────────
function verificarEtapa2() {
    const data = document.getElementById('data-pagamento').value;
    document.getElementById('btn-prox-2').disabled = !data;
}

// Dispara verificação ao carregar (campo já tem valor padrão = hoje)
document.getElementById('data-pagamento').addEventListener('input', verificarEtapa2);
verificarEtapa2();

// ─── Etapa 3: preencher tela de confirmação ───────────────────────────────────
function preencherConfirmacao() {
    const descricao = document.getElementById('descricao-pagamento').value.trim();

    document.getElementById('conf-beneficiario').textContent = document.getElementById('det-beneficiario').textContent;
    document.getElementById('conf-vencimento').textContent   = document.getElementById('det-vencimento').textContent;
    document.getElementById('conf-valor').textContent        = document.getElementById('det-valor').textContent;

    const dataPgto = document.getElementById('data-pagamento').value;
    document.getElementById('conf-data-pgto').textContent = formatarDataBR(dataPgto);

    const linhaDesc = document.getElementById('conf-linha-descricao');
    if (descricao) {
        document.getElementById('conf-descricao').textContent = descricao;
        linhaDesc.style.display = 'flex';
    } else {
        linhaDesc.style.display = 'none';
    }
}

function formatarDataBR(dataISO) {
    if (!dataISO) return '-';
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
}

// ─── Confirmar pagamento (fluxo digitar) ─────────────────────────────────────
function confirmarPagamento() {
    document.getElementById('modal-beneficiario').textContent  = document.getElementById('conf-beneficiario').textContent;
    document.getElementById('modal-valor-pago').textContent    = document.getElementById('conf-valor').textContent;
    document.getElementById('modal-data-pago').textContent     = document.getElementById('conf-data-pgto').textContent;
    document.getElementById('modal-protocolo-pago').textContent = gerarProtocolo();

    document.getElementById('modal-sucesso-pagamento').style.display = 'flex';
}

function fecharModalPagamento() {
    window.location.href = 'index.html';
}

// ─── FLUXO DO UPLOAD ─────────────────────────────────────────────────────────
function handleArquivo(arquivo) {
    const erro = document.getElementById('erro-arquivo');

    if (!arquivo) return;

    const tiposValidos = ['application/pdf', 'image/jpeg', 'image/png'];
    const tamanhoMaxMB = 5 * 1024 * 1024;

    if (!tiposValidos.includes(arquivo.type) || arquivo.size > tamanhoMaxMB) {
        erro.style.display = 'block';
        document.getElementById('input-arquivo').value = '';
        return;
    }

    erro.style.display = 'none';

    // Atualiza preview da área de upload
    document.getElementById('upload-placeholder').style.display = 'none';
    document.getElementById('upload-preview').style.display     = 'block';
    document.getElementById('upload-nome-arquivo').textContent  = arquivo.name;
    document.getElementById('upload-tamanho-arquivo').textContent = formatarTamanho(arquivo.size);

    // Simula "leitura" do boleto com delay
    setTimeout(() => {
        document.getElementById('dados-arquivo').style.display = 'block';
        // Aciona verificação da data (já preenchida com hoje)
        verificarPagamentoArquivo();
        document.getElementById('dados-arquivo').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 900);
}

function handleDrop(event) {
    event.preventDefault();
    document.getElementById('upload-area').classList.remove('upload-area--hover');
    const arquivo = event.dataTransfer.files[0];
    if (arquivo) handleArquivo(arquivo);
}

function removerArquivo() {
    document.getElementById('input-arquivo').value = '';
    document.getElementById('upload-placeholder').style.display = 'block';
    document.getElementById('upload-preview').style.display     = 'none';
    document.getElementById('dados-arquivo').style.display      = 'none';
    document.getElementById('erro-arquivo').style.display       = 'none';
    document.getElementById('btn-pagar-arquivo').disabled       = true;
}

function verificarPagamentoArquivo() {
    const data = document.getElementById('data-pagamento-arquivo').value;
    document.getElementById('btn-pagar-arquivo').disabled = !data;
}

function confirmarPagamentoArquivo() {
    document.getElementById('modal-beneficiario').textContent  = 'Serviço de Água e Saneamento';
    document.getElementById('modal-valor-pago').textContent    = 'R$ 94,30';
    document.getElementById('modal-data-pago').textContent     = formatarDataBR(document.getElementById('data-pagamento-arquivo').value);
    document.getElementById('modal-protocolo-pago').textContent = gerarProtocolo();

    document.getElementById('modal-sucesso-pagamento').style.display = 'flex';
}

// ─── Utilitários ─────────────────────────────────────────────────────────────
function formatarTamanho(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function gerarProtocolo() {
    return 'PAG' + Date.now().toString().slice(-8).toUpperCase();
}