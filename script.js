// Variáveis globais
let selectedPlan = 'avulsa';
let selectedPaymentMethod = '';
let contractorSignature = null;
let contractedSignature = null;
let isDrawing = false;
let currentCanvas = null;
let lastX = 0;
let lastY = 0;
let activeFAQ = null;

// Inicialização quando DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    updatePreview();
    initSignatureSystem();
    
    // Configurar datas
    const today = new Date().toISOString().split('T')[0];
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (startDateInput) {
        startDateInput.min = today;
        startDateInput.value = today;
    }
    
    if (startDateInput && endDateInput) {
        startDateInput.addEventListener('change', function() {
            endDateInput.min = this.value;
            if (!endDateInput.value) {
                const endDate = new Date(this.value);
                endDate.setMonth(endDate.getMonth() + 1);
                endDateInput.value = endDate.toISOString().split('T')[0];
            }
            updatePreview();
        });
    }
    
    // Atualizar preview em tempo real
    const formInputs = document.querySelectorAll('#generator input, #generator select, #generator textarea');
    formInputs.forEach(input => {
        input.addEventListener('input', updatePreview);
        input.addEventListener('change', updatePreview);
    });

    // Formatação automática do valor
    const serviceValueInput = document.getElementById('serviceValue');
    if (serviceValueInput) {
        serviceValueInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = (value / 100).toFixed(2);
            value = value.replace('.', ',');
            value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
            e.target.value = value;
            updatePreview();
        });
    }

    console.log('ContratoFácil inicializado com sucesso!');
});

// Mobile Menu Toggle
function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            // Alternar ícone
            const icon = menuToggle.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Fechar menu ao clicar em um link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                menuToggle.querySelector('i').classList.remove('fa-times');
                menuToggle.querySelector('i').classList.add('fa-bars');
            });
        });
    }
}

// Sistema de Assinaturas
function initSignatureSystem() {
    // Upload de assinatura - Contratante
    const contractorUpload = document.getElementById('contractorSignatureUpload');
    const contractorPreview = document.getElementById('contractorSignaturePreview');
    
    if (contractorUpload && contractorPreview) {
        contractorUpload.addEventListener('change', function(e) {
            handleSignatureUpload(e, 'contractor');
        });
    }

    // Upload de assinatura - Contratado
    const contractedUpload = document.getElementById('contractedSignatureUpload');
    const contractedPreview = document.getElementById('contractedSignaturePreview');
    
    if (contractedUpload && contractedPreview) {
        contractedUpload.addEventListener('change', function(e) {
            handleSignatureUpload(e, 'contracted');
        });
    }

    // Inicializar canvas de desenho
    initSignatureCanvas('contractor');
    initSignatureCanvas('contracted');
}

function handleSignatureUpload(event, type) {
    const file = event.target.files[0];
    if (!file) return;

    // Verificar se é imagem
    if (!file.type.match('image.*')) {
        showNotification('❌ Por favor, selecione uma imagem válida');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Criar canvas temporário para processamento
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = 300;
            tempCanvas.height = 100;
            
            // Desenhar imagem no canvas
            tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
            
            // Salvar assinatura
            if (type === 'contractor') {
                contractorSignature = tempCanvas.toDataURL();
            } else {
                contractedSignature = tempCanvas.toDataURL();
            }
            
            // Atualizar preview
            updateSignaturePreview(type);
            
            // Mostrar opções de confirmação
            showSignatureConfirmation(type);
            
            showNotification('✅ Assinatura carregada com sucesso!');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function initSignatureCanvas(type) {
    const canvas = document.getElementById(`${type}SignatureDraw`);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Configurar canvas
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Eventos do mouse
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Eventos touch para mobile
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', stopDrawing);

    function startDrawing(e) {
        isDrawing = true;
        currentCanvas = type;
        const rect = canvas.getBoundingClientRect();
        lastX = e.clientX - rect.left;
        lastY = e.clientY - rect.top;
    }

    function draw(e) {
        if (!isDrawing || currentCanvas !== type) return;
        
        const rect = canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        
        lastX = currentX;
        lastY = currentY;
    }

    function stopDrawing() {
        if (isDrawing && currentCanvas === type) {
            isDrawing = false;
            updateSignaturePreview(type);
            showSignatureConfirmation(type);
        }
    }

    function handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    }

    function handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    }
}

function selectSignatureOption(type, method) {
    // Resetar seleção visual
    document.querySelectorAll('.signature-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Selecionar a opção clicada
    event.target.closest('.signature-option').classList.add('selected');
    
    if (method === 'upload') {
        document.getElementById(`${type}SignatureUpload`).click();
    } else {
        // Mostrar canvas de desenho
        const canvas = document.getElementById(`${type}SignatureDraw`);
        if (canvas) {
            canvas.style.display = 'block';
            // Limpar canvas
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
}

function updateSignaturePreview(type) {
    const preview = document.getElementById(`${type}SignaturePreview`);
    let signatureData = null;

    if (type === 'contractor') {
        signatureData = contractorSignature;
    } else {
        signatureData = contractedSignature;
    }

    if (!signatureData) {
        // Tentar obter do canvas de desenho
        const canvas = document.getElementById(`${type}SignatureDraw`);
        if (canvas) {
            signatureData = canvas.toDataURL();
            // Salvar assinatura
            if (type === 'contractor') {
                contractorSignature = signatureData;
            } else {
                contractedSignature = signatureData;
            }
        }
    }

    if (preview && signatureData) {
        preview.innerHTML = `
            <div style="text-align: center;">
                <img src="${signatureData}" alt="Assinatura ${type}" style="max-width: 100%; max-height: 80px; border: 1px solid #ddd; border-radius: 4px;">
                <p style="margin-top: 0.5rem; font-size: 0.8rem; color: #666;">Pré-visualização da assinatura</p>
            </div>
        `;
    }
    
    updatePreview();
}

function showSignatureConfirmation(type) {
    const confirmation = document.getElementById(`${type}SignatureConfirmation`);
    if (confirmation) {
        confirmation.style.display = 'flex';
    }
}

function clearSignature(type) {
    // Limpar canvas de desenho
    const drawCanvas = document.getElementById(`${type}SignatureDraw`);
    if (drawCanvas) {
        const ctx = drawCanvas.getContext('2d');
        ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
        drawCanvas.style.display = 'none';
    }
    
    // Limpar upload
    const uploadInput = document.getElementById(`${type}SignatureUpload`);
    if (uploadInput) {
        uploadInput.value = '';
    }
    
    // Limpar preview
    const preview = document.getElementById(`${type}SignaturePreview`);
    if (preview) {
        preview.innerHTML = '<p style="color: #666;">Assinatura aparecerá aqui</p>';
    }
    
    // Esconder confirmação
    const confirmation = document.getElementById(`${type}SignatureConfirmation`);
    if (confirmation) {
        confirmation.style.display = 'none';
    }
    
    // Limpar seleção visual
    document.querySelectorAll('.signature-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Limpar variáveis
    if (type === 'contractor') {
        contractorSignature = null;
    } else {
        contractedSignature = null;
    }
    
    updatePreview();
    showNotification('🔄 Assinatura removida');
}

function confirmSignature(type) {
    showNotification('✅ Assinatura confirmada!');
    const confirmation = document.getElementById(`${type}SignatureConfirmation`);
    if (confirmation) {
        confirmation.style.display = 'none';
    }
}

// Funções do FAQ
function toggleFAQ(element) {
    const item = element.parentElement;
    
    // Fecha o FAQ ativo se for diferente do clicado
    if (activeFAQ && activeFAQ !== item) {
        activeFAQ.classList.remove('active');
    }
    
    // Alterna o FAQ clicado
    item.classList.toggle('active');
    
    // Atualiza o FAQ ativo
    if (item.classList.contains('active')) {
        activeFAQ = item;
    } else {
        activeFAQ = null;
    }
}

// Função para obter nome do mês
function getMonthName(monthIndex) {
    const months = [
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    return months[monthIndex];
}

// Função para formatar valor por extenso
function formatarValorExtenso(valor) {
    if (!valor || valor === '' || valor === '__________') {
        return '_________________________';
    }
    
    // Remove caracteres não numéricos, exceto vírgula
    let valorLimpo = valor.toString().replace(/[^\d,]/g, '');
    
    try {
        // Converte para número
        let valorNumero = parseFloat(valorLimpo.replace(',', '.'));
        
        if (isNaN(valorNumero) || valorNumero === 0) {
            return '_________________________';
        }
        
        // Função interna para converter números
        function converterNumero(num) {
            const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
            const especiais = ['dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
            const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
            const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
            
            if (num === 0) return '';
            if (num === 100) return 'cem';
            
            let resultado = '';
            
            // Centenas
            const c = Math.floor(num / 100);
            if (c > 0) {
                resultado += centenas[c];
                num %= 100;
                if (num > 0) resultado += ' e ';
            }
            
            // Dezenas e unidades
            if (num < 20 && num > 0) {
                resultado += especiais[num - 10] || unidades[num];
            } else {
                const d = Math.floor(num / 10);
                const u = num % 10;
                if (d > 0) {
                    resultado += dezenas[d];
                    if (u > 0) resultado += ' e ' + unidades[u];
                } else if (u > 0) {
                    resultado += unidades[u];
                }
            }
            
            return resultado;
        }
        
        let parteInteira = Math.floor(valorNumero);
        let parteDecimal = Math.round((valorNumero - parteInteira) * 100);
        
        let extenso = '';
        
        if (parteInteira > 0) {
            if (parteInteira === 1) {
                extenso = 'um real';
            } else {
                extenso = converterNumero(parteInteira) + ' reais';
            }
        }
        
        if (parteDecimal > 0) {
            if (extenso !== '') extenso += ' e ';
            if (parteDecimal === 1) {
                extenso += 'um centavo';
            } else {
                extenso += converterNumero(parteDecimal) + ' centavos';
            }
        }
        
        return extenso || '_________________________';
        
    } catch (e) {
        console.error('Erro ao converter valor:', e);
        return '_________________________';
    }
}

// Função para gerar o contrato PROFISSIONAL
function generateProfessionalContract() {
    // Obter valores do formulário
    const contractorName = document.getElementById('contractorName')?.value || '________________________';
    const contractorDoc = document.getElementById('contractorDoc')?.value || '________________________';
    const contractorProfession = document.getElementById('contractorProfession')?.value || '________________________';
    const contractorAddress = document.getElementById('contractorAddress')?.value || '______________________________________';
    const contractorCivilState = document.getElementById('contractorCivilState')?.value || '______________';
    
    const contractedName = document.getElementById('contractedName')?.value || '________________________';
    const contractedDoc = document.getElementById('contractedDoc')?.value || '________________________';
    const contractedProfession = document.getElementById('contractedProfession')?.value || '________________________';
    const contractedAddress = document.getElementById('contractedAddress')?.value || '______________________________________';
    const contractedCivilState = document.getElementById('contractedCivilState')?.value || '______________';
    
    const serviceDescription = document.getElementById('serviceDescription')?.value || '________________________';
    const serviceValue = document.getElementById('serviceValue')?.value || '__________';
    const paymentMethod = document.getElementById('paymentMethod')?.value;
    const startDate = document.getElementById('startDate')?.value;
    const endDate = document.getElementById('endDate')?.value;
    const contractCity = document.getElementById('contractCity')?.value || '________________________';

    // Formatar datas
    const formatDate = (dateString) => {
        if (!dateString) return '__/__/____';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR');
        } catch (e) {
            return '__/__/____';
        }
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

    // Formatar valor por extenso
    const valorExtenso = formatarValorExtenso(serviceValue);

    // Construir o contrato PROFISSIONAL
    const contractHTML = `
        <div class="contract-header">
            <div class="contract-title">CONTRATO DE PRESTAÇÃO DE SERVIÇOS</div>
        </div>
        
        <div class="contract-body">
            <div class="contract-intro">
                <p>Pelo presente instrumento de <strong>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</strong> que celebram entre si, de um lado <strong>${contractorName}</strong>, nacionalidade brasileira, estado civil <strong>${contractorCivilState}</strong>, profissão <strong>${contractorProfession}</strong>, portador do documento <strong>${contractorDoc}</strong>, residente e domiciliado à <strong>${contractorAddress}</strong>, doravante denominado <strong>CONTRATANTE</strong>, e de outro lado <strong>${contractedName}</strong>, nacionalidade brasileira, estado civil <strong>${contractedCivilState}</strong>, profissão <strong>${contractedProfession}</strong>, portador do documento <strong>${contractedDoc}</strong>, residente e domiciliado à <strong>${contractedAddress}</strong>, doravante denominado <strong>CONTRATADO(A)</strong>, pelas cláusulas pactuadas a seguir:</p>
            </div>

            <div class="contract-clause">
                <h4>CLÁUSULA PRIMEIRA - DO OBJETO</h4>
                <p>O presente contrato tem por OBJETO a prestação de serviço de <strong>${serviceDescription}</strong>, a ser realizado no período compreendido entre <strong>${formatDate(startDate)}</strong> e <strong>${formatDate(endDate)}</strong>.</p>
            </div>

            <div class="contract-clause">
                <h4>CLÁUSULA SEGUNDA - DO VALOR E FORMA DE PAGAMENTO</h4>
                <p>O <strong>CONTRATANTE</strong> obriga-se a pagar ao <strong>CONTRATADO(A)</strong> a importância de <strong>R$ ${serviceValue}</strong> (${valorExtenso}), a ser pago na seguinte forma: <strong>${paymentMethodText}</strong>.</p>
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
                <p>As partes se obrigam a manter caráter confidencial sobre todas as informações a que tiverem acesso em razão deste contrato, obrigando-se a não divulgá-los, inclusive após seu término, pelo prazo de 05 (cinco) anos, sob pena de responsabilização civil e criminal.</p>
            </div>

            <div class="contract-clause">
                <h4>CLÁUSULA SEXTA - DA PROPRIEDADE INTELECTUAL</h4>
                <p>Todo e qualquer direito de propriedade intelectual relativo aos serviços prestados, incluindo mas não se limitando a projetos, desenhos, especificações, relatórios e documentação técnica, será de propriedade exclusiva do <strong>CONTRATANTE</strong>, após o pagamento integral dos valores devidos.</p>
            </div>

            <div class="contract-clause">
                <h4>CLÁUSULA SÉTIMA - DAS GARANTIAS</h4>
                <p>O <strong>CONTRATADO(A)</strong> garante a qualidade dos serviços prestados e se obriga a reparar, sem custo adicional, quaisquer vícios, defeitos ou não conformidades apontados pelo <strong>CONTRATANTE</strong> no prazo de 30 (trinta) dias a partir da entrega ou conclusão dos serviços.</p>
            </div>

            <div class="contract-clause">
                <h4>CLÁUSULA OITAVA - DA RESCISÃO CONTRATUAL</h4>
                <p>Este contrato poderá ser rescindido nas seguintes hipóteses:</p>
                <ol>
                    <li>Por mútuo acordo entre as partes;</li>
                    <li>Por inadimplemento de qualquer das obrigações assumidas por qualquer das partes;</li>
                    <li>Por força maior ou caso fortuito que impossibilite o cumprimento do objeto;</li>
                    <li>Por iniciativa de qualquer das partes, mediante aviso prévio de 30 (trinta) dias.</li>
                </ol>
                <p>Em caso de descumprimento dos prazos estabelecidos, o CONTRATADO(A) pagará multa moratória de 2% sobre o valor do serviço por dia de atraso, limitada a 20% do valor total do contrato.</p>
            </div>

            <div class="contract-clause">
                <h4>CLÁUSULA NONA - DAS MULTAS E INDENIZAÇÕES</h4>
                <p>Em caso de descumprimento de qualquer obrigação assumida neste instrumento, a parte inadimplente pagará à outra multa compensatória no valor de 10% do valor total do contrato, sem prejuízo de perdas e danos.</p>
            </div>

            <div class="contract-clause">
                <h4>CLÁUSULA DÉCIMA - DO FORO</h4>
                <p>Para dirimir quaisquer controvérsias oriundas deste contrato, as partes elegem o foro da comarca de <strong>${contractCity}</strong>, com expressa renúncia a qualquer outro, por mais privilegiado que seja.</p>
            </div>

            <div class="signature-area">
                <p>E por estarem assim justos e contratados, firmam o presente instrumento em duas vias de igual teor e forma, para um único efeito.</p>
                
                <div class="signature-line-improved">
                    <div class="signature-box-improved">
                        <p><strong>${contractCity}</strong>, ${new Date().getDate()} de ${getMonthName(new Date().getMonth())} de ${new Date().getFullYear()}</p>
                        <div class="signature-space"></div>
                        ${contractorSignature ? `<div style="text-align: center; margin: 10px 0;"><img src="${contractorSignature}" style="max-width: 200px; max-height: 60px; border: 1px solid #ddd;"></div>` : '<div style="height: 60px; margin: 10px 0;"></div>'}
                        <div class="signature-name">${contractorName}</div>
                        <div class="signature-role">CONTRATANTE</div>
                        <div class="signature-document">Documento: ${contractorDoc}</div>
                    </div>
                    
                    <div class="signature-box-improved">
                        <p>&nbsp;</p>
                        <div class="signature-space"></div>
                        ${contractedSignature ? `<div style="text-align: center; margin: 10px 0;"><img src="${contractedSignature}" style="max-width: 200px; max-height: 60px; border: 1px solid #ddd;"></div>` : '<div style="height: 60px; margin: 10px 0;"></div>'}
                        <div class="signature-name">${contractedName}</div>
                        <div class="signature-role">CONTRATADO(A)</div>
                        <div class="signature-document">Documento: ${contractedDoc}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return contractHTML;
}

// Update contract preview
function updatePreview() {
    try {
        const contractPreview = document.getElementById('contractPreview');
        if (contractPreview) {
            contractPreview.innerHTML = generateProfessionalContract();
        }
    } catch (error) {
        console.error('Erro ao atualizar preview:', error);
        showNotification('❌ Erro ao atualizar visualização do contrato');
    }
}

// Payment modal functions
function openPaymentModal(plan) {
    selectedPlan = plan;
    
    // Verificar campos obrigatórios apenas se for contrato avulso
    if (plan === 'avulsa') {
        const requiredFields = ['contractorName', 'contractorDoc', 'contractedName', 'contractedDoc', 'serviceDescription', 'serviceValue', 'startDate', 'contractCity'];
        let isValid = true;
        let emptyFields = [];
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                isValid = false;
                emptyFields.push(fieldId);
                if (field) {
                    field.style.borderColor = 'var(--danger)';
                }
            } else if (field) {
                field.style.borderColor = '#e0e0e0';
            }
        });

        if (!isValid) {
            showNotification('❌ Preencha todos os campos obrigatórios marcados com *');
            // Scroll para o primeiro campo vazio
            const firstEmptyField = document.getElementById(emptyFields[0]);
            if (firstEmptyField) {
                firstEmptyField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstEmptyField.focus();
            }
            return;
        }
    }
    
    // Configurar modal
    const modalTitle = document.getElementById('modalTitle');
    const modalPlanDescription = document.getElementById('modalPlanDescription');
    const modalPrice = document.getElementById('modalPrice');
    const pixValue = document.getElementById('pixValue');
    const cardValue = document.getElementById('cardValue');
    const pixLink = document.getElementById('pixLink');
    const cardLink = document.getElementById('cardLink');
    
    if (modalTitle && modalPlanDescription && modalPrice) {
        let price = '0,00';
        let pixUrl = '#';
        let cardUrl = '#';
        
        switch(plan) {
            case 'free':
                modalTitle.textContent = 'Teste Grátis - 7 Dias';
                modalPlanDescription.textContent = 'Plano Teste Grátis - 3 contratos profissionais por 7 dias';
                modalPrice.textContent = 'Total: R$ 0,00 (Após 7 dias: R$ 10,99/mês)';
                price = '0,00';
                break;
            case 'avulsa':
                modalTitle.textContent = 'Comprar Contrato Avulso';
                modalPlanDescription.textContent = '1 Contrato de Prestação de Serviços Personalizado';
                modalPrice.textContent = 'Total: R$ 6,99';
                price = '6,99';
                pixUrl = 'https://mpago.la/1FgMNje';
                cardUrl = 'https://mpago.la/1FgMNje';
                break;
            case 'basico':
                modalTitle.textContent = 'Assinar Plano Básico';
                modalPlanDescription.textContent = 'Plano Básico - 5 contratos por mês';
                modalPrice.textContent = 'Total: R$ 9,99/mês';
                price = '9,99';
                pixUrl = 'https://mpago.li/1LcKs1M';
                cardUrl = 'https://mpago.li/1LcKs1M';
                break;
            case 'profissional':
                modalTitle.textContent = 'Assinar Plano Profissional';
                modalPlanDescription.textContent = 'Plano Profissional - Contratos ilimitados';
                modalPrice.textContent = 'Total: R$ 29,99/mês';
                price = '29,99';
                pixUrl = 'https://mpago.li/1xTcy3g';
                cardUrl = 'https://mpago.li/1xTcy3g';
                break;
        }
        
        // Atualizar links de pagamento
        if (pixValue) pixValue.textContent = `R$ ${price}`;
        if (cardValue) cardValue.textContent = `R$ ${price}`;
        if (pixLink) pixLink.href = pixUrl;
        if (cardLink) cardLink.href = cardUrl;
    }
    
    // Reset payment selection
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Esconder detalhes de pagamento
    const pixDetails = document.getElementById('pixDetails');
    const cardDetails = document.getElementById('cardDetails');
    if (pixDetails) pixDetails.style.display = 'none';
    if (cardDetails) cardDetails.style.display = 'none';
    
    selectedPaymentMethod = '';
    
    const paymentModal = document.getElementById('paymentModal');
    if (paymentModal) {
        paymentModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closePaymentModal() {
    const paymentModal = document.getElementById('paymentModal');
    if (paymentModal) {
        paymentModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function selectPayment(element, type) {
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    if (element) {
        element.classList.add('selected');
        
        // Esconder todos os detalhes primeiro
        const pixDetails = document.getElementById('pixDetails');
        const cardDetails = document.getElementById('cardDetails');
        if (pixDetails) pixDetails.style.display = 'none';
        if (cardDetails) cardDetails.style.display = 'none';
        
        // Mostrar detalhes específicos
        if (type === 'pix') {
            if (pixDetails) pixDetails.style.display = 'block';
            selectedPaymentMethod = 'pix';
        } else if (type === 'cartao') {
            if (cardDetails) cardDetails.style.display = 'block';
            selectedPaymentMethod = 'cartao';
        }
    }
}

// Função para ativar teste grátis
function activateFreeTrial() {
    showNotification('🎉 Teste grátis ativado! Você tem 7 dias gratuitos com 3 contratos profissionais.');
    // Redirecionar para o gerador de contratos
    setTimeout(() => {
        window.location.href = 'index.html#generator';
    }, 2000);
}

// Função para mostrar contrato em tela cheia
function showContractFullscreen() {
    const contractContent = generateProfessionalContract();
    
    // Criar modal para exibir o contrato
    const fullscreenModal = document.createElement('div');
    fullscreenModal.className = 'modal active';
    fullscreenModal.style.zIndex = '3000';
    fullscreenModal.innerHTML = `
        <div class="modal-content" style="max-width: 90%; max-height: 90%;">
            <div class="modal-header">
                <h3>Contrato Gerado - ContratoFácil</h3>
                <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body" style="padding: 0;">
                <div class="contract-fullscreen">
                    ${contractContent}
                </div>
                <div style="padding: 1.5rem; text-align: center; border-top: 1px solid #e0e0e0;">
                    <button class="btn btn-success" onclick="generateWord()">
                        <i class="fas fa-file-word"></i> Baixar em Word
                    </button>
                    <button class="btn" onclick="this.closest('.modal').remove()" style="margin-left: 1rem;">
                        <i class="fas fa-times"></i> Fechar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(fullscreenModal);
    document.body.style.overflow = 'hidden';
}

// Função para gerar Word
function generateWord() {
    try {
        const contractContent = generateProfessionalContract();
        
        // Criar um blob com conteúdo HTML que pode ser aberto no Word
        const fullHTML = `
<!DOCTYPE html>
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
        .contract-clause p {
            margin-bottom: 10px;
            text-indent: 20px;
        }
        .contract-clause ol {
            margin: 12px 0;
            padding-left: 30px;
        }
        .contract-clause li {
            margin-bottom: 6px;
            line-height: 1.5;
        }
        .signature-line-improved {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 2px solid #000;
        }
        .signature-box-improved {
            text-align: center;
            padding: 1rem;
        }
        .signature-space {
            border-top: 1px solid #000;
            margin: 2rem 0 1rem 0;
            padding-top: 0.5rem;
        }
        .signature-name {
            margin-top: 0.5rem;
            font-weight: bold;
            font-size: 1.1em;
        }
        .signature-role {
            font-style: italic;
            color: #666;
            margin-bottom: 0.5rem;
        }
        .signature-document {
            font-size: 0.9em;
            color: #555;
        }
        @media print {
            body { margin: 1.5cm; }
        }
    </style>
</head>
<body>
    ${contractContent}
</body>
</html>`;
        
        const blob = new Blob([fullHTML], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contrato-${new Date().getTime()}.doc`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('✅ Documento Word baixado com sucesso!');
        
    } catch (error) {
        console.error('Erro no generateWord:', error);
        showNotification('❌ Erro ao gerar documento Word');
    }
}

// Função para mostrar opções de download
function showDownloadOptions() {
    const modal = document.getElementById('paymentModal');
    if (!modal) return;

    const modalBody = modal.querySelector('.modal-body');
    if (!modalBody) return;

    modalBody.innerHTML = `
        <div style="text-align: center;">
            <h3 style="color: var(--success); margin-bottom: 1rem;">
                <i class="fas fa-check-circle"></i> Pagamento Aprovado!
            </h3>
            <p>Seu contrato está pronto para visualização e download.</p>
            
            <div class="download-options">
                <button class="btn btn-secondary" onclick="showContractFullscreen()">
                    <i class="fas fa-eye"></i> Visualizar Contrato
                </button>
                <button class="btn btn-secondary" onclick="generateWord()">
                    <i class="fas fa-file-word"></i> Baixar Word
                </button>
            </div>
            
            <button class="btn btn-success" onclick="closePaymentModal()" style="margin-top: 1.5rem; width: 100%;">
                <i class="fas fa-check"></i> Concluir
            </button>
        </div>
    `;
}

function processPayment() {
    const selectedPayment = document.querySelector('.payment-option.selected');
    if (!selectedPayment) {
        showNotification('❌ Selecione uma forma de pagamento');
        return;
    }

    showNotification('💳 Processando pagamento...');
    
    setTimeout(() => {
        if (selectedPlan === 'free') {
            showNotification('🎉 Teste grátis ativado! Você tem 7 dias gratuitos.');
        } else {
            showNotification('🎉 Pagamento aprovado com sucesso!');
        }
        
        // Mostrar opções de download
        showDownloadOptions();
        
    }, 2000);
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
        <div>
            <strong>${message}</strong>
        </div>
    `;
    document.body.appendChild(notification);

    // Mostrar notificação
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Remover após 5 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Fechar modal ao clicar fora
document.addEventListener('click', function(event) {
    const modal = document.getElementById('paymentModal');
    if (event.target === modal) {
        closePaymentModal();
    }
});

// Tecla ESC para fechar modal
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closePaymentModal();
    }
});

// Prevenir cópia do conteúdo do contrato
document.addEventListener('copy', function(e) {
    const contractPreview = document.getElementById('contractPreview');
    if (contractPreview && contractPreview.contains(e.target)) {
        e.preventDefault();
        showNotification('❌ Cópia do conteúdo do contrato não é permitida');
    }
});

// Prevenir clique direito no contrato
document.addEventListener('contextmenu', function(e) {
    const contractPreview = document.getElementById('contractPreview');
    if (contractPreview && contractPreview.contains(e.target)) {
        e.preventDefault();
        showNotification('❌ Ação não permitida no contrato');
    }
});
