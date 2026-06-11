document.addEventListener("DOMContentLoaded", function() {
    
    // --- CONTROLE DAS ABAS HORIZONTAIS DE INVESTIMENTO ---
    const tabButtons = document.querySelectorAll('.tab-btn');
    const contentSections = document.querySelectorAll('.content-section');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const product = this.getAttribute('data-product');
            
            // Desativa botões e seções anteriores
            tabButtons.forEach(btn => btn.classList.remove('active'));
            contentSections.forEach(section => section.classList.remove('active'));
            
            // Ativa os elementos correspondentes
            this.classList.add('active');
            const targetSection = document.getElementById(product);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });

    // --- CÁLCULO EM TEMPO REAL: MEU PORQUINHO ---
    const porquinhoInput = document.getElementById('porquinhoAmount');
    if (porquinhoInput) {
        porquinhoInput.addEventListener('input', function() {
            const amount = parseFloat(this.value) || 0;
            const earning = amount * 0.075; // Rendimento de 7.5% a.a.
            const total = amount + earning;
            
            document.getElementById('porquinhoResult').textContent = new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
            }).format(total);
        });
    }
});

// --- CONTROLE DO MODAL DE PROJEÇÃO DE GANHOS ---
function mostrarProjecao(produto, valor, nome, taxaAnual) {
    const amount = parseFloat(valor) || 0;
    
    if (amount <= 0 || isNaN(amount)) {
        alert('Por favor, digite um valor válido para investir!');
        return;
    }

    const modal = document.getElementById('modalProjecao');
    const title = document.getElementById('modalTitle');
    const info = document.getElementById('modalInfo');
    const tbody = document.getElementById('tableBody');

    title.textContent = `Projeção - ${nome}`;
    
    const taxaMensal = taxaAnual / 12;
    let rows = '';
    let saldoTotal = amount;

    // Gerador reativo dos 12 meses de aplicação
    for (let mes = 1; mes <= 12; mes++) {
        const ganhoMes = saldoTotal * taxaMensal;
        saldoTotal += ganhoMes;

        rows += `
            <tr>
                <td>Mês ${mes}</td>
                <td>${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)}</td>
                <td style="color: #4caf50; font-weight: 600;">+ ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ganhoMes)}</td>
                <td style="font-weight: 600;">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldoTotal)}</td>
            </tr>
        `;
    }

    info.innerHTML = `
        <div class="info-grid">
            <div class="info-box">
                <div class="info-label">Valor Investido</div>
                <div class="info-value">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)}</div>
            </div>
            <div class="info-box">
                <div class="info-label">Taxa Anual</div>
                <div class="info-value">${(taxaAnual * 100).toFixed(2)}%</div>
            </div>
        </div>
    `;

    tbody.innerHTML = rows;
    modal.classList.add('active');
}

function fecharModal() {
    const modal = document.getElementById('modalProjecao');
    modal.classList.remove('active');
}

// Fechar o modal caso clique na máscara escura de fora
window.onclick = function(event) {
    const modal = document.getElementById('modalProjecao');
    if (event.target === modal) {
        fecharModal();
    }
}

// --- CONFIRMAÇÃO DO INVESTIMENTO ---
function confirmarInvestimento() {
    const titulo = document.getElementById('modalTitle').textContent;
    const nomeInvestimento = titulo.replace('Projeção - ', '');
    
    fecharModal();
    mostrarToast(`✓ Investimento em ${nomeInvestimento} confirmado com sucesso! Seu dinheiro já está rendendo.`, 'success');
}

// --- DISPARADOR DE NOTIFICAÇÕES (TOAST) ---
function mostrarToast(mensagem, tipo = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = mensagem;
    toast.className = `toast ${tipo} show`;
    
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => {
            toast.classList.remove('show', 'hide');
        }, 300);
    }, 4000);
}