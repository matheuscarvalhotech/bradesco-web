// Exibe a data atual na saudação
function exibirData() {
    const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];


    const hoje = new Date();
    const texto = `${diasSemana[hoje.getDay()]}, ${hoje.getDate()} de ${meses[hoje.getMonth()]}`;

    document.getElementById('data-hoje').textContent = texto;
}

//Oculta ou exibe o saldo
function toggleSaldo() {
    const saldo = document.getElementById('saldo-valor');
    const btn = document.getElementById('btn-ocultar');

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