// Variáveis globais
let selectedPlan = 'avulsa';

// Funções do FAQ
function toggleFAQ(element) {
    const item = element.parentElement;
    item.classList.toggle('active');
}

// Função para gerar o contrato profissional
function generateProfessionalContract() {
    // Obter valores do formulário
    const contractorName = document.getElementById('contractorName').value || '[NOME DO CONTRATANTE]';
    const contractorDoc = document.getElementById('contractorDoc').value || '[CPF/CNPJ]';
    const contractorProfession = document.getElementById('contractorProfession').value || '[PROFISSÃO]';
    
    const contractedName = document.getElementById('contractedName').value || '[NOME DO CONTRATADO]';
    const contractedDoc = document.getElementById('contractedDoc').value || '[CPF/CNPJ]';
    const contractedProfession = document.getElementById('contractedProfession').value || '[PROFISSÃO]';
    
    const serviceDescription = document.getElementById('serviceDescription').value || '[DESCRIÇÃO DO SERVIÇO]';
    const serviceValue = document.getElementById('serviceValue').value || '0,00';
    const paymentMethod = document.getElementById('paymentMethod').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const contractCity = document.getElementById('contractCity').value || '[CIDADE]';
    
    // Formatar datas
    const formatDate = (dateString) => {
        if (!dateString) return '[DATA]';
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
        default: paymentMethodText = '[FORMA DE PAGAMENTO]';
    }
    
    // Gerar número do contrato
    const contractNumber = Math.floor(1000 + Math.random() * 9000);
    const currentYear = new Date().getFullYear();
    
    // Construir o contrato PREMIUM
    const contractHTML = `
        <div class="contract-seal">CONTRATO<br>VÁLIDO</div>
        
        <div class="contract-header">
            <div class="contract-title">CONTRATO DE PRESTAÇÃO DE SERVIÇOS</div>
            <div class="contract-subtitle">Instrumento Particular de Prestação de Serviços Profissionais</div>
            <div class="contract-number">Nº ${contractNumber}/${currentYear}</div>
        </div>
        
        <div class="contract-body">
            <div class="contract-clause">
                <h4>DAS PARTES CONTRATANTES</h4>
                <p>Pelo presente instrumento particular, de um lado:</p>
                <p><strong>CONTRATANTE:</strong> ${contractorName}, portador(a) do ${contractorDoc}, ${contractorProfession};</p>
                <p>E de outro lado:</p>
                <p><strong>CONTRATADO:</strong> ${contractedName}, portador(a) do ${contractedDoc}, ${contractedProfession}.</p>
                <p>As partes acima identificadas têm, entre si, justo e acertado o presente Contrato de Prestação de Serviços.</p>
            </div>

            <div class="contract-clause">
                <h4>DO OBJETO DO CONTRATO</h4>
                <p>O presente contrato tem por objeto a prestação dos seguintes serviços especializados:</p>
                <div class="service-description-box">
                    "${serviceDescription}"
                </div>
            </div>

            <div class="contract-clause">
                <h4>DO PRAZO DE VIGÊNCIA</h4>
                <p>Este contrato terá vigência a partir de <strong>${formatDate(startDate)}</strong>, com término previsto para <strong>${formatDate(endDate)}</strong>.</p>
            </div>

            <div class="contract-clause">
                <h4>DO VALOR E FORMA DE PAGAMENTO</h4>
                <div class="highlight-box">
                    <p>Valor total acordado: <span class="value-emphasis">R$ ${serviceValue}</span></p>
                    <p>Forma de pagamento: <strong>${paymentMethodText}</strong></p>
                </div>
            </div>

            <div class="contract-clause">
                <h4>DAS OBRIGAÇÕES DAS PARTES</h4>
                <p><strong>CONTRATADO se obriga a:</strong></p>
                <ul>
                    <li>Executar os serviços com qualidade profissional e técnica adequada</li>
                    <li>Cumprir rigorosamente os prazos estabelecidos</li>
                    <li>Manter absoluto sigilo sobre informações confidenciais</li>
                    <li>Comunicar eventuais impedimentos ou dificuldades</li>
                </ul>
                
                <p><strong>CONTRATANTE se obriga a:</strong></p>
                <ul>
                    <li>Fornecer todas as informações necessárias para execução dos serviços</li>
                    <li>Efetuar os pagamentos nos prazos acordados</li>
                    <li>Fornecer feedbacks e aprovações em tempo hábil</li>
                </ul>
            </div>

            <div class="contract-clause">
                <h4>DA CONFIDENCIALIDADE</h4>
                <p>As partes se comprometem a manter sigilo absoluto sobre todas as informações confidenciais a que tiverem acesso, obrigando-se a não divulgá-las sob qualquer circunstância.</p>
            </div>

            <div class="contract-clause">
                <h4>DA PROPRIEDADE INTELECTUAL</h4>
                <p>Todo e qualquer direito de propriedade intelectual relativo aos serviços prestados será de propriedade exclusiva do CONTRATANTE, após o pagamento integral dos valores devidos.</p>
            </div>

            <div class="contract-clause">
                <h4>DO FORO</h4>
                <p>Para dirimir quaisquer controvérsias oriundas deste contrato, as partes elegem o foro da comarca de <strong>${contractCity}</strong>.</p>
            </div>

            <div class="signature-area">
                <p style="text-align: center; font-style: italic; margin-bottom: 2rem;">
                    E por estarem assim justos e contratados, firmam o presente instrumento em duas vias de igual teor e forma, para um único efeito.
                </p>
                
                <div class="signature-line">
                    <div class="signature-box">
                        <div class="signature-line-style"></div>
                        <p class="signature-name">${contractorName}</p>
                        <p class="signature-doc">${contractorDoc}</p>
                        <p class="signature-role">CONTRATANTE</p>
                    </div>
                    
                    <div class="signature-box">
                        <div class="signature-line-style"></div>
                        <p class="signature-name">${contractedName}</p>
                        <p class="signature-doc">${contractedDoc}</p>
                        <p class="signature-role">CONTRATADO</p>
                    </div>
                </div>
                
                <div class="contract-footer">
                    <p>${contractCity}, ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    <p style="margin-top: 5px;">Documento gerado eletronicamente via ContratoFácil - www.contratofacil.com</p>
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

// Payment modal functions
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
        alert('❌ Por favor, preencha todos os campos obrigatórios marcados com *');
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
}

function closePaymentModal() {
    document.getElementById('paymentModal').classList.remove('active');
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
        alert('❌ Erro ao baixar o contrato. Tente novamente.');
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
            font-family: 'Georgia', 'Times New Roman', serif; 
            margin: 2.5cm; 
            line-height: 1.7; 
            font-size: 14px;
            color: #2c2c2c;
            background: linear-gradient(135deg, #fffdf8 0%, #ffffff 100%);
        }
        .contract-header { 
            text-align: center; 
            margin-bottom: 2.5rem; 
            padding-bottom: 1.5rem;
            border-bottom: 2px solid #d4af37;
        }
        .contract-title { 
            font-size: 22px; 
            font-weight: bold; 
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            color: #2c5aa0;
            letter-spacing: 1.5px;
        }
        .contract-clause { 
            margin-bottom: 20px; 
            padding: 20px;
            background: #fafafa;
            border-radius: 6px;
            border-left: 4px solid #d4af37;
        }
        .contract-clause h4 {
            font-size: 13px;
            margin-bottom: 12px;
            font-weight: bold;
            color: #2c5aa0;
            text-transform: uppercase;
        }
        .signature-line-style {
            border-top: 2px solid #2c5aa0;
            padding-top: 12px;
            margin-top: 60px;
            width: 80%;
            margin-left: auto;
            margin-right: auto;
        }
        .service-description-box {
            background: linear-gradient(135deg, #fff9e6, #fff);
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 18px;
            margin: 12px 0;
            font-style: italic;
            color: #555;
            border-left: 4px solid #fdcb6e;
        }
        @media print {
            body { margin: 1.5cm; }
        }
    </style>
</head>
<body>
    ${contractHTML}
</body>
</html>`;
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.animation = 'slideIn 0.3s ease';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <div>
            <strong>${message}</strong>
        </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
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
        alert('Por favor, selecione uma forma de pagamento.');
        return;
    }

    alert('💳 Processando pagamento...');
    
    setTimeout(() => {
        downloadContract();
        alert('🎉 Pagamento aprovado! Contrato baixado com sucesso!');
        closePaymentModal();
    }, 2000);
}

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
});