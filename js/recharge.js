let operadoraSelecionada = null;
        let valorSelecionado = null;
        let telefoneValido = false;

        //Se o saldo não estiver no localStorage, usa o valor padrão
        function verificarESalvarSaldoPadrao() {
            let saldoTotal = localStorage.getItem('saldoTotal');
            if (!saldoTotal) {
                localStorage.setItem('saldoTotal', '4250.00');
            }
        }

        //Carrega e exibe o saldo do localStorage
        function carregarSaldoDisponivel() {
            verificarESalvarSaldoPadrao();
            const saldoNumerico = parseFloat(localStorage.getItem('saldoTotal')) || 4250.00;
            const saldoFormatado = formatarSaldo(saldoNumerico);
            const saldoRechargeEl = document.getElementById('saldo-valor-recharge');
            if (saldoRechargeEl) {
                saldoRechargeEl.textContent = saldoFormatado;
            }
        }

        //Formata um número para o padrão brasileiro de moeda
        function formatarSaldo(valor) {
            return 'R$ ' + valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        //Atualiza o saldo após uma recarga
        function atualizarSaldoAposRecarga(valorRecarga) {
            let saldoAtual = parseFloat(localStorage.getItem('saldoTotal')) || 4250.00;
            saldoAtual -= valorRecarga;
            localStorage.setItem('saldoTotal', saldoAtual);
            console.log('Saldo atualizado:', saldoAtual);
            carregarSaldoDisponivel();
        }

        // Inicializa o campo de telefone com formatação automática
        window.addEventListener('load', function() {
            carregarSaldoDisponivel();
            const inputTelefone = document.getElementById('numero-celular');
            
            inputTelefone.addEventListener('keydown', function(e) {
                // Impede deletar se o campo está vazio ou tem menos de 2 caracteres
                if (this.value.length <= 2 && (e.key === 'Backspace' || e.key === 'Delete')) {
                    e.preventDefault();
                    this.value = '';
                }
            });

            // Carrega as recargas recentes ao abrir a página
            carregarRecargasRecentes();
        });

        function formatarTelefone(valor) {
            // Remove tudo que não é dígito
            const apenasDigitos = valor.replace(/\D/g, '');
            
            // Limita a 11 dígitos (DDD + 9 dígitos do celular)
            const limitado = apenasDigitos.slice(0, 11);
            
            // Formata: (XX)XXXXX-XXXX
            if (limitado.length === 0) {
                return '';
            } else if (limitado.length <= 2) {
                return '(' + limitado;
            } else if (limitado.length <= 7) {
                return '(' + limitado.slice(0, 2) + ')' + limitado.slice(2);
            } else {
                return '(' + limitado.slice(0, 2) + ')' + limitado.slice(2, 7) + '-' + limitado.slice(7);
            }
        }

        function validarFormatoTelefone() {
            const inputTelefone = document.getElementById('numero-celular');
            const erroTelefone = document.getElementById('erro-telefone');
            
            // Formata o telefone automaticamente
            inputTelefone.value = formatarTelefone(inputTelefone.value);
            
            const valor = inputTelefone.value.trim();
            const padrao = /^\(\d{2}\)\d{5}-\d{4}$/;

            if (valor === '') {
                telefoneValido = false;
                inputTelefone.classList.remove('erro');
                erroTelefone.classList.remove('ativo');
            } else if (padrao.test(valor)) {
                telefoneValido = true;
                inputTelefone.classList.remove('erro');
                erroTelefone.classList.remove('ativo');
            } else {
                telefoneValido = false;
                inputTelefone.classList.add('erro');
                erroTelefone.classList.add('ativo');
            }

            validarFormulario();
            atualizarResumo();
        }

        function selecionarOperadora(btn) {
            document.querySelectorAll('.operadora-btn').forEach(function (botao) {
                botao.classList.remove('ativo');
            });

            btn.classList.add('ativo');
            operadoraSelecionada = btn.getAttribute('data-operadora');

            validarFormulario();
            atualizarResumo();
        }

        function selecionarValor(btn, valor) {
            document.querySelectorAll('.valor-btn').forEach(function (botao) {
                botao.classList.remove('selecionado');
            });

            btn.classList.add('selecionado');
            valorSelecionado = valor;

            document.getElementById('valor-customizado').value = '';
            document.getElementById('valor-customizado').classList.remove('ativo');

            validarFormulario();
            atualizarResumo();
        }

        function limparSelecaoRapida() {
            const inputValor = document.getElementById('valor-customizado');

            document.querySelectorAll('.valor-btn').forEach(function (botao) {
                botao.classList.remove('selecionado');
            });

            if (inputValor.value) {
                valorSelecionado = parseFloat(inputValor.value);
            } else {
                valorSelecionado = null;
            }

            validarFormulario();
            atualizarResumo();
        }

        function validarFormulario() {
            const numero = document.getElementById('numero-celular').value.trim();
            const temOperadora = operadoraSelecionada !== null;
            const temValor = valorSelecionado !== null && valorSelecionado > 0;
            const btnConfirmar = document.getElementById('btn-confirmar');

            btnConfirmar.disabled = !(numero && temOperadora && temValor && telefoneValido);
        }

        function atualizarResumo() {
            const numero = document.getElementById('numero-celular').value.trim();

            if (numero && operadoraSelecionada && valorSelecionado) {
                document.getElementById('resumo-numero').textContent = numero;
                document.getElementById('resumo-operadora').textContent =
                    operadoraSelecionada.charAt(0).toUpperCase() + operadoraSelecionada.slice(1);
                document.getElementById('resumo-valor').textContent =
                    'R$ ' + valorSelecionado.toFixed(2).replace('.', ',');

                document.getElementById('resumo-container').style.display = 'block';
            } else {
                document.getElementById('resumo-container').style.display = 'none';
            }
        }

        function aoFocarValorCustomizado() {
            document.querySelectorAll('.valor-btn').forEach(function (botao) {
                botao.classList.remove('selecionado');
            });

            document.getElementById('valor-customizado').classList.add('ativo');
        }

        function aoSairValorCustomizado() {
            const inputValor = document.getElementById('valor-customizado');

            if (!inputValor.value) {
                inputValor.classList.remove('ativo');
            }
        }

        function confirmarRecarga() {
            if (!telefoneValido) {
                document.getElementById('erro-telefone').classList.add('ativo');
                document.getElementById('numero-celular').classList.add('erro');
                return;
            }

            const numero = document.getElementById('numero-celular').value.trim();
            const operadora = operadoraSelecionada.charAt(0).toUpperCase() + operadoraSelecionada.slice(1);
            const valor = valorSelecionado;

            if (valor > 500) {
                document.getElementById('processamento-celular').textContent = numero;
                
                // Salva a recarga como aguardando aprovação
                salvarRecargaRecente(numero, operadora, valor, true);
                
                // Atualiza o saldo
                atualizarSaldoAposRecarga(valor);
                
                document.getElementById('modal-processamento').classList.add('ativo');
            } else {
                const protocolo = 'BR' + Math.random().toString(36).substring(2, 15).toUpperCase();

                document.getElementById('modal-numero').textContent = numero;
                document.getElementById('modal-operadora').textContent = operadora;
                document.getElementById('modal-valor').textContent =
                    'R$ ' + valor.toFixed(2).replace('.', ',');
                document.getElementById('modal-protocolo').textContent = protocolo;

                // Salva a recarga como concluída
                salvarRecargaRecente(numero, operadora, valor, false);

                // Atualiza o saldo
                atualizarSaldoAposRecarga(valor);

                document.getElementById('modal-sucesso').classList.add('ativo');
            }
        }

        function salvarRecargaRecente(numero, operadora, valor, aguardandoAprovacao = false) {
            // Obter hora atual
            const agora = new Date();
            const hora = String(agora.getHours()).padStart(2, '0') + 'h' + String(agora.getMinutes()).padStart(2, '0');
            const data = agora.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
            
            // Formatar como "Hoje, 10h30" ou "02 Jun, 14h15"
            const hoje = new Date();
            const ehHoje = agora.toLocaleDateString('pt-BR') === hoje.toLocaleDateString('pt-BR');
            const dataFormatada = ehHoje ? 'Hoje, ' + hora : data + ', ' + hora;

            // Criar objeto da recarga
            const recarga = {
                numero: numero,
                operadora: operadora,
                valor: valor,
                data: dataFormatada,
                timestamp: Date.now(),
                status: aguardandoAprovacao ? 'aguardando' : 'concluida'
            };

            // Obter recargas existentes do localStorage
            let recargas = JSON.parse(localStorage.getItem('recargasRecentes')) || [];
            
            // Adicionar a nova recarga no início da lista
            recargas.unshift(recarga);
            
            // Manter apenas as últimas 10 recargas
            recargas = recargas.slice(0, 10);
            
            // Salvar no localStorage
            localStorage.setItem('recargasRecentes', JSON.stringify(recargas));
            
            // Atualizar a lista na página
            carregarRecargasRecentes();
        }

        function carregarRecargasRecentes() {
            const recargas = JSON.parse(localStorage.getItem('recargasRecentes')) || [];
            const transacoesUl = document.querySelector('.transacoes');
            
            // Limpar a lista completamente
            transacoesUl.innerHTML = '';

            // Se não há recargas, mostrar uma mensagem
            if (recargas.length === 0) {
                const li = document.createElement('li');
                li.style.textAlign = 'center';
                li.style.color = '#999';
                li.style.padding = '20px';
                li.textContent = 'Nenhuma recarga realizada';
                transacoesUl.appendChild(li);
                return;
            }

            // Ordenar recargas por data de criação (mais recentes primeiro)
            recargas.sort((a, b) => b.timestamp - a.timestamp);

            // Adicionar as recargas recentes salvas
            recargas.forEach((recarga, index) => {
                const li = document.createElement('li');
                li.className = 'transacao';
                
                // Determinar classe e cor do valor
                const isAguardando = recarga.status === 'aguardando';
                const classeStatus = isAguardando ? 'aguardando-aprovacao' : 'negativo';
                const statusTexto = isAguardando ? '<span style="color: #FF8C00; font-size: 12px; font-weight: 600;">Aguardando aprovação</span>' : '';
                
                li.innerHTML = `
                    <div class="transacao-info">
                        <span class="transacao-nome">${recarga.numero} - ${recarga.operadora}</span>
                        <span class="transacao-data">${recarga.data}</span>
                        ${statusTexto}
                    </div>
                    <span class="transacao-valor ${classeStatus}">- R$ ${recarga.valor.toFixed(2).replace('.', ',')}</span>
                `;
                transacoesUl.appendChild(li);
                
                // Adicionar <br> entre os itens, exceto após o último
                if (index < recargas.length - 1) {
                    transacoesUl.appendChild(document.createElement('br'));
                }
            });
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
            const inputTelefone = document.getElementById('numero-celular');
            const inputValor = document.getElementById('valor-customizado');
            const erroTelefone = document.getElementById('erro-telefone');

            inputTelefone.value = '';
            inputTelefone.classList.remove('erro');

            inputValor.value = '';
            inputValor.classList.remove('ativo');

            erroTelefone.classList.remove('ativo');

            document.querySelectorAll('.operadora-btn').forEach(function (botao) {
                botao.classList.remove('ativo');
            });

            document.querySelectorAll('.valor-btn').forEach(function (botao) {
                botao.classList.remove('selecionado');
            });

            operadoraSelecionada = null;
            valorSelecionado = null;
            telefoneValido = false;

            document.getElementById('resumo-container').style.display = 'none';

            validarFormulario();
        }