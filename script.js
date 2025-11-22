// Variáveis globais
let selectedPlan = 'avulsa';

// Funções do FAQ
function toggleFAQ(element) {
    const item = element.parentElement;
    item.classList.toggle('active');
}

// Função para gerar o contrato PROFISSIONAL
function generateProfessionalContract() {
    // Obter valores do formulário
    const contractorName = document.getElementById('contractorName').value || '________________________';
    const contractorDoc = document.getElementById('contractorDoc').value || '________________________';
    const contractorProfession = document.getElementById('contractorProfession').value || '________________________';
    const contractorAddress = document.getElementById('contractorAddress').value || '______________________________________';
    
    const contractedName = document.getElementById('contractedName').value || '________________________';
    const contractedDoc = document.getElementById('contractedDoc').value || '________________________';
    const contractedProfession = document.getElementById('contractedProfession').value || '________________________';
    const contractedAddress = document.getElementById('contractedAddress').value || '______________________________________';
    
    const serviceDescription = document.getElementById('serviceDescription').value || '________________________';
    const serviceValue = document.getElementById('serviceValue').value || '__________';
    const paymentMethod = document.getElementById('paymentMethod').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const contractCity = document.getElementById('contractCity').value || '________________________';

    // Formatar datas
    const formatDate = (dateString) => {
        if (!dateString) return '__/__/____';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    };

    // Formatar método de pagamento
    let paymentMethodText = '';
    switch(paymentMethod) {
        case 'transferencia': paymentMethodText = 'transferência bancária'; break;
        case 'boleto': paymentMethodText = 'boleto bancário'; break;
        case 'pix': paymentMethodText = 'PIX'; break;
        case 'cartao': paymentMethodText = 'cartão de crédito'; break;
        case 'dinheiro': paymentMethodText = 'dinheiro'; break;
        default: paymentMethodText = '________________________';
    }

    // Construir o contrato PROFISSIONAL
    const contractHTML = `
        <div class="contract-header">
            <div class="contract-title">CONTRATO DE PRESTAÇÃO DE SERVIÇOS</div>
        </div>
        
        <div class="contract-body">
            <div class="contract-intro">
                <p>Pelo presente instrumento de <strong>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</strong> que celebram entre si, de um lado <strong>${contractorName}</strong>, nacionalidade <strong>________________________</strong>, estado civil <strong>________________________</strong>, profissão <strong>${contractorProfession}</strong>, portador do <strong>${contractorDoc}</strong>, residente e domiciliado à <strong>${contractorAddress}</strong>, doravante denominado <strong>CONTRATANTE</strong>, e de outro lado <strong>${contractedName}</strong>, nacionalidade <strong>________________________</strong>, estado civil <strong>________________________</strong>, profissão <strong>${contractedProfession}</strong>, portador do <strong>${contractedDoc}</strong>, residente e domiciliado à <strong>${contractedAddress}</strong>, doravante denominado <strong>CONTRATADO(A)</strong>, pelas cláusulas pactuadas a seguir:</p>
            </div>

            <div class="contract-clause">
                <h4>CLÁUSULA PRIMEIRA - DO OBJETO</h4>
                <p>O presente contrato tem por OBJETO a prestação de serviço de <strong>${serviceDescription}</strong>, a ser realizado no período compreendido entre <strong>${formatDate(startDate)}</strong> e <strong>${formatDate(endDate)}</strong>, contendo as seguintes atividades:</p>
                <ol>
                    <li>_________________________________________________________</li>
                    <li>_________________________________________________________</li>
                    <li>_________________________________________________________</li>
                    <li>_________________________________________________________</li>
                </ol>
            </div>

            <div class="contract-clause">
                <h4>CLÁUSULA SEGUNDA - DAS OBRIGAÇÕES DO CONTRATANTE</h4>
                <p>O <strong>CONTRATANTE</strong> obriga-se a pagar ao <strong>CONTRATADO(A)</strong> a importância de <strong>R$ ${serviceValue}</strong> (_______________________________________), sendo <strong>R$ __________</strong> (________________________), referente a _________________________ e <strong>R$ __________</strong> (________________________), a ser pago na seguinte forma: <strong>${paymentMethodText}</strong>.</p>
                <p>O pagamento será efetuado mediante apresentação de nota fiscal ou recibo, ficando o CONTRATADO(A) obrigado(a) à quitação do tributo incidente na operação.</p>
            </div>

            <div class="contract-clause">
                <h4>CLÁUSULA TERCEIRA - DAS OBRIGAÇÕES DO CONTRATADO</h4>
                <p>O <strong>CONTRATADO(A)</strong> obriga-se a:</p>
                <ol>
                    <li>Executar os serviços contratados com zelo, diligência e capacidade técnica adequada;</li>
                    <li>Cumprir rigorosamente os prazos estabelecidos para a execução dos serviços;</li>
                    <li>Fornecer todos os materiais, equipamentos e recursos necessários para a execução dos serviços, salvo estipulação em contrário;</li>
                    <li>Comunicar imediatamente ao CONTRATANTE qualquer impedimento ou dificuldade que possa afetar o cumprimento do objeto deste contrato;</li>
                    <li>Emitir nota fiscal ou recibo correspondente aos valores recebidos;</li>
                    <li>Manter sigilo absoluto sobre todas as informações confidenciais a que tiver acesso.</li>
                </ol>
            </div>

            <div class="contract-clause">
                <h4>CLÁUSULA QUARTA - DO PRAZO DE VIGÊNCIA</h4>
                <p>O presente contrato terá vigência a partir de <strong>${formatDate(startDate)}</strong> e será encerrado em <strong>${formatDate(endDate)}</strong>, podendo ser renovado ou prorrogado mediante acordo escrito entre as partes.</p>
            </div>

            <div class="contract-clause">
                <h4>CLÁUSULA QUINTA - DA CONFIDENCIALIDADE</h4>
                <p>As partes se obrigam a manter caráter confidencial sobre todas as informações a que tiverem acesso em razão deste contrato, obrigando-se a não divulgá-los, inclusive após seu término, pelo prazo de <strong>__________ anos</strong>, sob pena de responsabilização civil e criminal.</p>
            </div>

            <div class="contract-clause">
                <h4>CLÁUSULA SEXTA - DA PROPRIEDADE INTELECTUAL</h4>
                <p>Todo e qualquer direito de propriedade intelectual relativo aos serviços prestados, incluindo mas não se limitando a projetos, desenhos, especificações, relatórios e documentação técnica, será de propriedade exclusiva do <strong>CONTRATANTE</strong>, após o pagamento integral dos valores devidos.</p>
            </div>

            <div class="contract-clause">
                <h4>CLÁUSULA SÉTIMA - DAS GARANTIAS</h4>
                <p>O <strong>CONTRATADO(A)</strong> garante a qualidade dos serviços prestados e se obriga a reparar, sem custo adicional, quaisquer vícios, defeitos ou não conformidades apontados pelo <strong>CONTRATANTE</strong> no prazo de <strong>______ dias</strong> a partir da entrega ou conclusão dos serviços.</p>
            </div>

            <div class="contract-clause">
                <h4>CLÁUSULA OITAVA - DA RESCISÃO CONTRATUAL</h4>
                <p>Este contrato poderá ser rescindido nas seguintes hipóteses:</p>
                <ol>
                    <li>Por mútuo acordo entre as partes;</li>
                    <li>Por inadimplemento de qualquer das obrigações assumidas por qualquer das partes;</li>
                    <li>Por força maior ou caso fortuito que impossibilite o cumprimento do objeto;</li>
                    <li>Por iniciativa de qualquer das partes, mediante aviso prévio de <strong>______ dias</strong>.</li>
                </ol>
                <p>Em caso de descumprimento dos prazos estabelecidos, o CONTRATADO(A) pagará multa moratória de <strong>______%</strong> sobre o valor do serviço por dia de atraso, limitada a <strong>______%</strong> do valor total do contrato.</p>
            </div>

            <div class="contract-clause">
                <h4>CLÁUSULA NONA - DAS MULTAS E INDENIZAÇÕES</h4>
                <p>Em caso de descumprimento de qualquer obrigação assumida neste instrumento, a parte inadimplente pagará à outra multa compensatória no valor de <strong>______%</strong> do valor total do contrato, sem prejuízo de perdas e danos.</p>
            </div>

            <div class="contract-clause">
                <h4>CLÁUSULA DÉCIMA - DO FORO</h4>
                <p>Para dirimir quaisquer controvérsias oriundas deste contrato, as partes elegem o foro da comarca de <strong>${contractCity}</strong>, com expressa renúncia a qualquer outro, por mais privilegiado que seja.</p>
            </div>

            <div class="signature-area">
                <p>E por estarem assim justos e contratados, firmam o presente instrumento em duas vias de igual teor e forma, para um único efeito.</p>
                
                <div class="signature-line">
                    <div class="signature-box">
                        <p><strong>${contractCity}</strong>, _____ de __________________ de ______</p>
                        <div class="signature-space"></div>
                        <p>___________________________________</p>
                        <p><strong>CONTRATANTE</strong></p>
                    </div>
                    
                    <div class="signature-box">
                        <p>&nbsp;</p>
                        <div class="signature-space"></div>
                        <p>___________________________________</p>
                        <p><strong>CONTRATADO(A)</strong></p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return contractHTML;
}

// Update contract preview
function updatePreview() {
    const contractPreview = document.getElementById('contractPreview');
    contractPreview.innerHTML = generateProfessionalContract();
}

// Payment modal functions - CORRIGIDO PARA MOBILE
function openPaymentModal(plan) {
    selectedPlan = plan;
    
    // Verificar campos obrigatórios
    const requiredFields = ['contractorName', 'contractorDoc', 'contractedName', 'contractedDoc', 'serviceDescription', 'serviceValue', 'startDate', 'contractCity'];
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = 'var(--danger)';
        } else {
            field.style.borderColor = '#e0e0e0';
        }
    });

    if (!isValid) {
        showNotification('❌ Preencha todos os campos obrigatórios marcados com *');
        return;
    }
    
    // Configurar modal
    const modalTitle = document.getElementById('modalTitle');
    const modalPlanDescription = document.getElementById('modalPlanDescription');
    const modalPrice = document.getElementById('modalPrice');
    
    switch(plan) {
        case 'avulsa':
            modalTitle.textContent = 'Comprar Contrato Avulso';
            modalPlanDescription.textContent = '1 Contrato de Prestação de Serviços Personalizado';
            modalPrice.textContent = 'Total: R$ 9,90';
            break;
        case 'basico':
            modalTitle.textContent = 'Assinar Plano Básico';
            modalPlanDescription.textContent = 'Plano Básico - 3 contratos por mês';
            modalPrice.textContent = 'Total: R$ 14,90/mês';
            break;
        case 'intermediario':
            modalTitle.textContent = 'Assinar Plano Intermediário';
            modalPlanDescription.textContent = 'Plano Intermediário - 10-20 contratos por mês';
            modalPrice.textContent = 'Total: R$ 29,90/mês';
            break;
        case 'ilimitado':
            modalTitle.textContent = 'Assinar Plano Ilimitado';
            modalPlanDescription.textContent = 'Plano Ilimitado - Contratos ilimitados';
            modalPrice.textContent = 'Total: R$ 49,90/mês';
            break;
    }
    
    document.getElementById('paymentModal').classList.add('active');
    document.body.style.overflow = 'hidden'; // Previne scroll no mobile
}

function closePaymentModal() {
    document.getElementById('paymentModal').classList.remove('active');
    document.body.style.overflow = 'auto'; // Restaura scroll
}

function selectPayment(element) {
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('selected');
    });
    element.classList.add('selected');
}

function downloadContract() {
    try {
        const contractContent = generateContractContent();
        const blob = new Blob([contractContent], { 
            type: 'text/html;charset=utf-8' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const timestamp = new Date().getTime();
        a.download = `contrato-profissional-${timestamp}.html`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        showNotification('✅ Contrato baixado com sucesso!');
    } catch (error) {
        console.error('Erro no download:', error);
        showNotification('❌ Erro ao baixar o contrato');
    }
}

function generateContractContent() {
    const contractHTML = generateProfessionalContract();
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Contrato Profissional - ContratoFácil</title>
    <style>
        body { 
            font-family: 'Times New Roman', Times, serif; 
            margin: 2.5cm; 
            line-height: 1.6; 
            font-size: 14px;
            color: #000;
        }
        .contract-header { 
            text-align: center; 
            margin-bottom: 2rem; 
            padding-bottom: 1rem;
            border-bottom: 2px solid #000;
        }
        .contract-title { 
            font-size: 18px; 
            font-weight: bold; 
            margin-bottom: 0.5rem;
            text-transform: uppercase;
        }
        .contract-clause { 
            margin-bottom: 20px; 
        }
        .contract-clause h4 {
            font-size: 14px;
            margin-bottom: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .signature-space {
            border-top: 1px solid #000;
            margin: 40px 0 10px 0;
            padding-top: 10px;
        }
        @media print {
            body { margin: 1.5cm; }
        }
        @media (max-width: 768px) {
            body { margin: 1cm; }
        }
    </style>
</head>
<body>
    ${contractHTML}
</body>
</html>`;
}

function showNotification(message) {
    // Remove notificação existente
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <div>
            <strong>${message}</strong>
        </div>
    `;
    document.body.appendChild(notification);

    // Animação de entrada
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);

    // Remover após 5 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

function processPayment() {
    const selectedPayment = document.querySelector('.payment-option.selected');
    if (!selectedPayment) {
        showNotification('❌ Selecione uma forma de pagamento');
        return;
    }

    showNotification('💳 Processando pagamento...');
    
    setTimeout(() => {
        downloadContract();
        showNotification('🎉 Pagamento aprovado! Contrato baixado.');
        closePaymentModal();
    }, 2000);
}

// Fechar modal ao clicar fora
document.addEventListener('click', function(event) {
    const modal = document.getElementById('paymentModal');
    if (event.target === modal) {
        closePaymentModal();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updatePreview();
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').min = today;
    
    document.getElementById('startDate').addEventListener('change', function() {
        document.getElementById('endDate').min = this.value;
    });
    
    const formInputs = document.querySelectorAll('#generator input, #generator select, #generator textarea');
    formInputs.forEach(input => {
        input.addEventListener('input', updatePreview);
        input.addEventListener('change', updatePreview);
    });

    // Adicionar campo de endereço se não existir
    if (!document.getElementById('contractorAddress')) {
        const formSection = document.querySelector('.form-section');
        const addressHTML = `
            <div class="form-group">
                <label for="contractorAddress">Endereço do Contratante</label>
                <input type="text" id="contractorAddress" placeholder="Endereço completo">
            </div>
            <div class="form-group">
                <label for="contractedAddress">Endereço do Contratado</label>
                <input type="text" id="contractedAddress" placeholder="Endereço completo">
            </div>
        `;
        const contractedNameField = document.getElementById('contractedName');
        contractedNameField.parentNode.insertAdjacentHTML('afterend', addressHTML);
    }
});
