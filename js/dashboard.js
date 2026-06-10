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