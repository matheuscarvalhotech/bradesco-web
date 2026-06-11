// =====================
// PIX
// =====================
let tipChavePix = null;

const configChaves = {
    cpf:    { label: 'CPF *', placeholder: '000.000.000-00', hint: 'Digite o CPF no formato: 000.000.000-00' },
    phone:  { label: 'Celular *', placeholder: '(11) 99999-9999', hint: 'Digite com DDD: (11) 99999-9999' },
    email:  { label: 'E-mail *', placeholder: 'exemplo@email.com', hint: 'Digite o e-mail completo do destinatário' },
    random: { label: 'Chave Aleatória *', placeholder: '550e8400-e29b-41d4-a716-446655440000', hint: 'Cole a chave aleatória gerada pelo banco' }
};

const tiposLabels = {
    cpf: 'CPF', phone: 'Celular', email: 'E-mail', random: 'Chave Aleatória'
};

function selecionarChavePix(btn, tipo) {
    document.querySelectorAll('#etapa-pix-1 .tipo-btn').forEach(b => b.classList.remove('selecionado'));
    btn.classList.add('selecionado');
    tipChavePix = tipo;

    const config = configChaves[tipo];
    document.getElementById('label-chave-pix').textContent = config.label;
    document.getElementById('input-chave-pix').placeholder = config.placeholder;
    document.getElementById('hint-chave-pix').textContent = config.hint;
    document.getElementById('input-chave-pix').value = '';
    document.getElementById('erro-chave-pix').textContent = '';
    document.getElementById('campo-chave-pix').style.display = 'block';
    document.getElementById('btn-prox-pix-1').disabled = true;
    document.getElementById('input-chave-pix').focus();
}

function formatarChavePix(input) {
    if (tipChavePix === 'cpf') {
        input.value = input.value.replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{2})$/, '$1-$2');
    } else if (tipChavePix === 'phone') {
        input.value = input.value.replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2');
    }
}

function validarChavePix(valor) {
    if (!tipChavePix) return false;
    const limpo = valor.replace(/\D/g, '');
    if (tipChavePix === 'cpf')    return limpo.length === 11;
    if (tipChavePix === 'phone')  return limpo.length === 11;
    if (tipChavePix === 'email')  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
    if (tipChavePix === 'random') return valor.length > 10;
    return false;
}

function formatarValorPix(input) {
    let val = input.value.replace(/\D/g, '');
    if (!val) { input.value = ''; return; }
    val = (parseInt(val) / 100).toFixed(2);
    input.value = 'R$ ' + val.replace('.', ',');
}

function verificarEtapaPix1() {
    const chave = document.getElementById('input-chave-pix').value;
    const valor = document.getElementById('valor-pix').value;
    const btn = document.getElementById('btn-prox-pix-1');
    if (!btn) return;
    btn.disabled = !(validarChavePix(chave) && valor);
}

function irParaEtapaPix(numero) {
    document.querySelectorAll('.etapa-conteudo[id^="etapa-pix"]').forEach(el => el.style.display = 'none');
    document.getElementById('etapa-pix-' + numero).style.display = 'block';

    // Atualiza indicador
    for (let i = 1; i <= 2; i++) {
        const ind = document.getElementById('ind-etapa-pix-' + i);
        const linhas = document.querySelectorAll('.etapas-indicador .etapa-linha');
        ind.classList.remove('ativa', 'concluida');
        if (linhas[i - 1]) linhas[i - 1].classList.remove('concluida');

        if (i < numero) {
            ind.classList.add('concluida');
            if (linhas[i - 1]) linhas[i - 1].classList.add('concluida');
        } else if (i === numero) {
            ind.classList.add('ativa');
        }
    }

    if (numero === 2) preencherConfirmacaoPix();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function preencherConfirmacaoPix() {
    const chave = document.getElementById('input-chave-pix').value;
    const valor = document.getElementById('valor-pix').value;
    const descricao = document.getElementById('descricao-pix').value;

    document.getElementById('conf-pix-tipo').textContent = tiposLabels[tipChavePix];
    document.getElementById('conf-pix-chave').textContent = chave;
    document.getElementById('conf-pix-valor').textContent = valor;

    const linhaDesc = document.getElementById('conf-pix-linha-desc');
    if (descricao) {
        linhaDesc.style.display = 'flex';
        document.getElementById('conf-pix-descricao').textContent = descricao;
    } else {
        linhaDesc.style.display = 'none';
    }
}

function confirmarPix() {
    const protocolo = 'PIX' + Date.now().toString().slice(-8);
    document.getElementById('modal-pix-nome').textContent = document.getElementById('conf-pix-nome').textContent;
    document.getElementById('modal-pix-chave').textContent = document.getElementById('conf-pix-chave').textContent;
    document.getElementById('modal-pix-valor').textContent = document.getElementById('conf-pix-valor').textContent;
    document.getElementById('modal-pix-protocolo').textContent = protocolo;
    document.getElementById('modal-sucesso-pix').classList.add('ativo');
}

function fecharModalPix() {
    document.getElementById('modal-sucesso-pix').classList.remove('ativo');
    irParaEtapaPix(1);
    document.querySelectorAll('#etapa-pix-1 .tipo-btn').forEach(b => b.classList.remove('selecionado'));
    document.getElementById('campo-chave-pix').style.display = 'none';
    document.getElementById('input-chave-pix').value = '';
    document.getElementById('valor-pix').value = '';
    document.getElementById('descricao-pix').value = '';
    tipChavePix = null;
    document.getElementById('btn-prox-pix-1').disabled = true;
}

function toggleSaldoPix() {
    const saldo = document.getElementById('saldo-valor-pix');
    const btn = document.getElementById('btn-ocultar');
    if (!saldo || !btn) return;
    if (saldo.textContent.includes('R$')) {
        saldo.textContent = '•••••••';
        btn.innerHTML = '<i class="fa-solid fa-eye-slash"></i> Mostrar';
    } else {
        saldo.textContent = 'R$ 4.250,00';
        btn.innerHTML = '<i class="fa-solid fa-eye"></i> Ocultar';
    }
}

// Data de hoje
(function() {
    const dias = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
    const meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
    const hoje = new Date();
    const el = document.getElementById('data-hoje');
    if (el) el.textContent = `${dias[hoje.getDay()]}, ${hoje.getDate()} de ${meses[hoje.getMonth()]}`;
})();