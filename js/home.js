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