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