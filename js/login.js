// =====================
// SENHA CORRETA (mockada)
// =====================
const SENHA_CORRETA = '123456';

// =====================
// NAVEGAÇÃO ENTRE CAMPOS
// =====================
const inputs = document.querySelectorAll('.login-senha-input');

inputs.forEach((input, index) => {
    input.addEventListener('input', function () {
        // Aceita só número
        this.value = this.value.replace(/\D/g, '');

        if (this.value.length === 1 && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }

        verificarSenhaCompleta();
    });

    input.addEventListener('keydown', function (e) {
        // Backspace volta ao campo anterior
        if (e.key === 'Backspace' && this.value === '' && index > 0) {
            inputs[index - 1].focus();
            inputs[index - 1].value = '';
            verificarSenhaCompleta();
        }

        // Enter tenta login se completo
        if (e.key === 'Enter') tentarLogin();
    });

    // Foco visual
    input.addEventListener('focus', function () {
        this.classList.add('focado');
    });
    input.addEventListener('blur', function () {
        this.classList.remove('focado');
    });
});

// Foca no primeiro campo ao carregar
inputs[0].focus();

// =====================
// VERIFICAR SE SENHA ESTÁ COMPLETA
// =====================
function verificarSenhaCompleta() {
    const senhaDigitada = Array.from(inputs).map(i => i.value).join('');
    const btnEntrar = document.getElementById('btn-entrar');
    btnEntrar.disabled = senhaDigitada.length < 6;

    // Limpa erro ao digitar
    document.getElementById('login-erro').textContent = '';
}

// =====================
// TENTAR LOGIN
// =====================
function tentarLogin() {
    const senhaDigitada = Array.from(inputs).map(i => i.value).join('');

    if (senhaDigitada.length < 6) return;

    if (senhaDigitada === SENHA_CORRETA) {
        mostrarSplash('login');
    } else {
        // Senha errada — shake e limpa
        const grid = document.getElementById('senha-grid');
        grid.classList.add('login-shake');
        setTimeout(() => grid.classList.remove('login-shake'), 500);

        document.getElementById('login-erro').textContent = 'Senha incorreta. Tente novamente.';

        inputs.forEach(i => i.value = '');
        inputs[0].focus();
        document.getElementById('btn-entrar').disabled = true;
    }
}

// =====================
// SPLASH — TELA DE CARREGAMENTO
// =====================
const mensagensSplashLogin = [
    'Verificando credenciais...',
    'Autenticando acesso...',
    'Carregando sua conta...',
    'Quase lá...'
];

function mostrarSplash(origem, destino = 'index.html') {
    const splash = document.getElementById('splash');
    const texto = document.getElementById('splash-texto');
    if (!splash || !texto) return;

    splash.classList.add('ativo');

    // Cicla pelas mensagens
    let i = 0;
    const msgs = origem === 'login' ? mensagensSplashLogin : ['Carregando...'];
    texto.textContent = msgs[0];

    const intervalo = setInterval(() => {
        i++;
        if (i < msgs.length) {
            texto.textContent = msgs[i];
        }
    }, 600);

    // Redireciona após 2.5s
    setTimeout(() => {
        clearInterval(intervalo);
        window.location.href = destino;
    }, 2500);
}