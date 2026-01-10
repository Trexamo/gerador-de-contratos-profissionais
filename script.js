// =============================================
// script.js - ContratoFácil (VERSÃO COM DOWNLOAD DUPLO EM IMAGEM E WORD)
// =============================================

// Variáveis globais
let currentUser = null;
let isDrawing = false;
let drawingCanvas = null;
let drawingContext = null;
let drawingFor = null;
let selectedPlan = null;
let selectedPaymentMethod = '';
let modalViewCount = 0;
let contractorSignature = null;
let contractedSignature = null;

// =============================================
// INICIALIZAÇÃO PRINCIPAL
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando ContratoFácil (VERSÃO COM DOWNLOAD DUPLO)...');
    
    // Verificar e corrigir dados do usuário
    checkAndFixUserData();
    
    checkUserLogin();
    initMobileMenu();
    initSignatureSystem();
    setupEventListeners();
    updateStatusBar();
    setupContactForm();
    setupAutoPreview();
    
    // INICIALIZAR DATAS (CRÍTICO - ADICIONADO)
    initDateFields();
    updateCurrentDateDisplay();
    
    // INICIALIZAR CORREÇÕES MOBILE
    initMobileCorrections();
    initMobileTouchFix();
    
    console.log('✅ Sistema inicializado com sucesso!');
});

// =============================================
// FUNÇÃO PARA VERIFICAR E CORRIGIR DADOS DO USUÁRIO
// =============================================
function checkAndFixUserData() {
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) return;
    
    try {
        const user = JSON.parse(savedUser);
        let needsUpdate = false;
        
        if (!user.plan || user.plan === '') {
            console.log('🔧 Corrigindo: Plano não definido');
            user.plan = 'free';
            needsUpdate = true;
        }
        
        if (typeof user.contractsGenerated === 'undefined') {
            console.log('🔧 Corrigindo: contractsGenerated não definido');
            user.contractsGenerated = 0;
            needsUpdate = true;
        }
        
        if (typeof user.contractsDownloaded === 'undefined') {
            console.log('🔧 Corrigindo: contractsDownloaded não definido');
            user.contractsDownloaded = 0;
            needsUpdate = true;
        }
        
        if (user.plan && user.plan !== user.plan.toLowerCase()) {
            console.log('🔧 Corrigindo: Plano em maiúsculas');
            user.plan = user.plan.toLowerCase();
            needsUpdate = true;
        }
        
        if (!user.planUpdated) {
            user.planUpdated = new Date().toISOString();
            needsUpdate = true;
        }
        
        // Inicializar arrays se não existirem
        if (!user.signatures) {
            user.signatures = {};
            needsUpdate = true;
        }
        
        if (!user.payments) {
            user.payments = [];
            needsUpdate = true;
        }
        
        if (!user.paymentHistory) {
            user.paymentHistory = [];
            needsUpdate = true;
        }
        
        if (needsUpdate) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            console.log('✅ Dados do usuário corrigidos');
        }
        
    } catch (error) {
        console.error('❌ Erro ao verificar dados do usuário:', error);
    }
}

// =============================================
// SISTEMA DE LOGIN E AUTENTICAÇÃO
// =============================================
function checkUserLogin() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            
            if (currentUser.plan) {
                currentUser.plan = currentUser.plan.toLowerCase();
            }
            
            updateUIAfterLogin();
        } catch (e) {
            console.error('❌ Erro ao carregar usuário:', e);
            localStorage.removeItem('currentUser');
            updateUIAfterLogout();
        }
    } else {
        updateUIAfterLogout();
    }
}

function handleGoogleSignIn(response) {
    try {
        const userData = parseJwt(response.credential);
        
        currentUser = {
            id: userData.sub,
            name: userData.name,
            email: userData.email,
            picture: userData.picture,
            plan: 'free',
            contractsGenerated: 0,
            contractsDownloaded: 0,
            remainingContracts: 999,
            joinDate: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            planUpdated: new Date().toISOString(),
            signatures: {},
            contractsHistory: [],
            payments: [],
            paymentHistory: []
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUIAfterLogin();
        closeLoginModal();
        
        showNotification('🎉 Login realizado com sucesso! Agora você pode visualizar contratos gratuitamente.');
        setTimeout(updatePreview, 500);
        
    } catch (error) {
        console.error('❌ Erro no login:', error);
        showNotification('❌ Erro ao fazer login. Tente novamente.');
    }
}

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        throw new Error('Token inválido');
    }
}

function updateUIAfterLogin() {
    if (!currentUser) return;
    
    console.log('👤 Usuário logado:', currentUser.name);
    console.log('📋 Plano:', currentUser.plan);
    
    const loginButton = document.getElementById('loginButton');
    const userButton = document.getElementById('userButton');
    const userNav = document.getElementById('userNav');
    
    if (loginButton) loginButton.style.display = 'none';
    if (userButton) userButton.style.display = 'block';
    if (userNav) userNav.style.display = 'list-item';
    
    const userNameNav = document.getElementById('userNameNav');
    const userNameButton = document.getElementById('userNameButton');
    if (userNameNav) userNameNav.textContent = currentUser.name.split(' ')[0];
    if (userNameButton) userNameButton.textContent = currentUser.name.split(' ')[0];
    
    const loginRequired = document.getElementById('loginRequired');
    const generatorForm = document.getElementById('generatorForm');
    
    if (loginRequired) loginRequired.style.display = 'none';
    if (generatorForm) generatorForm.style.display = 'flex';
    
    updateStatusBar();
    setTimeout(updatePreview, 500);
}

function updateUIAfterLogout() {
    const loginButton = document.getElementById('loginButton');
    const userButton = document.getElementById('userButton');
    const userNav = document.getElementById('userNav');
    
    if (loginButton) loginButton.style.display = 'block';
    if (userButton) userButton.style.display = 'none';
    if (userNav) userNav.style.display = 'none';
    
    const loginRequired = document.getElementById('loginRequired');
    const generatorForm = document.getElementById('generatorForm');
    
    if (loginRequired) loginRequired.style.display = 'block';
    if (generatorForm) generatorForm.style.display = 'none';
    
    const statusBar = document.getElementById('statusBar');
    if (statusBar) statusBar.style.display = 'none';
}

function showLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function signOut() {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('currentUser');
        currentUser = null;
        updateUIAfterLogout();
        showNotification('👋 Até logo!');
    }
}

// =============================================
// SISTEMA DE DATAS - VERSÃO CORRIGIDA
// =============================================
function getMonthName(monthIndex) {
    const months = [
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    return months[monthIndex] || '';
}

function setTodayDate() {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    const dateInput = document.getElementById('contractDate');
    
    if (dateInput) {
        dateInput.value = formattedDate;
        updatePreview();
        showNotification('✅ Data atual aplicada ao contrato');
    }
}

function updateCurrentDateDisplay() {
    const display = document.getElementById('currentDateDisplay');
    if (display) {
        const today = new Date();
        const formatted = today.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
        display.textContent = formatted;
    }
}

function initDateFields() {
    const today = new Date().toISOString().split('T')[0];
    
    // Data do contrato (hoje)
    const contractDateInput = document.getElementById('contractDate');
    if (contractDateInput) {
        contractDateInput.value = today;
        contractDateInput.min = today;
    }
    
    // Data de início (hoje)
    const startDateInput = document.getElementById('startDate');
    if (startDateInput) {
        startDateInput.value = today;
        startDateInput.min = today;
    }
    
    // Data de término (30 dias após início)
    const endDateInput = document.getElementById('endDate');
    if (startDateInput && endDateInput) {
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 30);
        endDateInput.value = endDate.toISOString().split('T')[0];
        endDateInput.min = today;
        
        startDateInput.addEventListener('change', function() {
            endDateInput.min = this.value;
            if (!endDateInput.value || new Date(endDateInput.value) < new Date(this.value)) {
                const newEndDate = new Date(this.value);
                newEndDate.setDate(newEndDate.getDate() + 30);
                endDateInput.value = newEndDate.toISOString().split('T')[0];
            }
            updatePreview();
        });
    }
}

// =============================================
// COLETAR DADOS DO CONTRATO - VERSÃO ÚNICA
// =============================================
function collectContractData() {
    const getSelectValue = (id) => {
        const element = document.getElementById(id);
        if (!element) return '';
        
        const value = element.value;
        const text = element.options[element.selectedIndex]?.text;
        
        if (value && value !== '') {
            return text || value;
        }
        
        return '';
    };

    return {
        contractorName: document.getElementById('contractorName')?.value || '',
        contractorDoc: document.getElementById('contractorDoc')?.value || '',
        contractorProfession: document.getElementById('contractorProfession')?.value || '',
        contractorAddress: document.getElementById('contractorAddress')?.value || '',
        contractorCivilState: getSelectValue('contractorCivilState'),
        
        contractedName: document.getElementById('contractedName')?.value || '',
        contractedDoc: document.getElementById('contractedDoc')?.value || '',
        contractedProfession: document.getElementById('contractedProfession')?.value || '',
        contractedAddress: document.getElementById('contractedAddress')?.value || '',
        contractedCivilState: getSelectValue('contractedCivilState'),
        
        serviceDescription: document.getElementById('serviceDescription')?.value || '',
        serviceValue: document.getElementById('serviceValue')?.value || '',
        paymentMethod: document.getElementById('paymentMethod')?.value || '',
        startDate: document.getElementById('startDate')?.value || '',
        endDate: document.getElementById('endDate')?.value || '',
        contractDate: document.getElementById('contractDate')?.value || '',
        contractCity: document.getElementById('contractCity')?.value || '',
        contractState: document.getElementById('contractState')?.value || '',
        
        contractorSignature: contractorSignature,
        contractedSignature: contractedSignature,
        
        generatedAt: new Date().toISOString()
    };
}

// =============================================
// FORMATAR VALOR POR EXTENSO - FUNÇÃO ADICIONADA
// =============================================
function formatarValorExtenso(valor) {
    if (!valor || valor === '' || valor === '__________') {
        return '_________________________';
    }
    
    let valorLimpo = valor.toString().replace(/[^\d,]/g, '');
    
    try {
        let valorNumero = parseFloat(valorLimpo.replace(',', '.'));
        
        if (isNaN(valorNumero) || valorNumero === 0) {
            return '_________________________';
        }
        
        function converterNumero(num) {
            const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
            const especiais = ['dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
            const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
            const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
            
            if (num === 0) return '';
            if (num === 100) return 'cem';
            
            let resultado = '';
            
            const c = Math.floor(num / 100);
            if (c > 0) {
                resultado += centenas[c];
                num %= 100;
                if (num > 0) resultado += ' e ';
            }
            
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
        return '_________________________';
    }
}

// =============================================
// GERAR CONTRATO PROFISSIONAL - VERSÃO CORRIGIDA
// =============================================
function generateProfessionalContractPlus() {
    const data = collectContractData();
    
    const formatDate = (dateString) => {
        if (!dateString || dateString.trim() === '') {
            return '__/__/____';
        }
        
        try {
            if (dateString.includes('/')) {
                return dateString;
            }
            
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return '__/__/____';
            }
            
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            
            return `${day}/${month}/${year}`;
        } catch (e) {
            return '__/__/____';
        }
    };

    let paymentMethodText = '';
    switch(data.paymentMethod) {
        case 'transferencia': paymentMethodText = 'transferência bancária'; break;
        case 'boleto': paymentMethodText = 'boleto bancário'; break;
        case 'pix': paymentMethodText = 'PIX'; break;
        case 'cartao': paymentMethodText = 'cartão de crédito'; break;
        case 'dinheiro': paymentMethodText = 'dinheiro'; break;
        default: paymentMethodText = '________________________';
    }

    const valorExtenso = formatarValorExtenso(data.serviceValue);

    const calculateDays = () => {
        if (!data.startDate || !data.endDate) return '______';
        try {
            const start = new Date(data.startDate);
            const end = new Date(data.endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays.toString();
        } catch (e) {
            return '______';
        }
    };

    let contractDay, contractMonth, contractYear;
    
    if (data.contractDate) {
        try {
            const contractDate = new Date(data.contractDate);
            contractDay = contractDate.getDate();
            contractMonth = getMonthName(contractDate.getMonth());
            contractYear = contractDate.getFullYear();
        } catch (e) {
            const currentDate = new Date();
            contractDay = currentDate.getDate();
            contractMonth = getMonthName(currentDate.getMonth());
            contractYear = currentDate.getFullYear();
        }
    } else {
        const currentDate = new Date();
        contractDay = currentDate.getDate();
        contractMonth = getMonthName(currentDate.getMonth());
        contractYear = currentDate.getFullYear();
    }

    const getDocumentInfo = (doc) => {
        if (!doc || doc.trim() === '') {
            return {
                type: 'CPF/CNPJ',
                number: '________________________'
            };
        }
        
        const cleanDoc = doc.replace(/\D/g, '');
        if (cleanDoc.length === 11) {
            const formatted = cleanDoc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
            return {
                type: 'CPF',
                number: formatted
            };
        } else if (cleanDoc.length === 14) {
            const formatted = cleanDoc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
            return {
                type: 'CNPJ',
                number: formatted
            };
        } else {
            return {
                type: 'CPF/CNPJ',
                number: doc
            };
        }
    };

    const contractorDocInfo = getDocumentInfo(data.contractorDoc);
    const contractedDocInfo = getDocumentInfo(data.contractedDoc);

    const cidadeEstado = data.contractCity && data.contractState 
        ? `${data.contractCity}/${data.contractState}`
        : data.contractCity || '________________________';

    const contractHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contrato de Prestação de Serviços</title>
        <style>
            body { 
                font-family: 'Times New Roman', Times, serif; 
                margin: 40px; 
                line-height: 1.5;
                color: #000;
                font-size: 12pt;
            }
            .contract-container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 40px;
                border: 1px solid #ccc;
                position: relative;
            }
            .contract-header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #000;
            }
            .contract-title {
                font-size: 16pt;
                font-weight: bold;
                text-transform: uppercase;
                margin-bottom: 10px;
                letter-spacing: 1px;
            }
            .contract-subtitle {
                font-size: 11pt;
                font-style: italic;
                color: #555;
            }
            .contract-clause {
                margin-bottom: 20px;
                page-break-inside: avoid;
            }
            .contract-clause h4 {
                font-size: 11pt;
                margin-bottom: 8px;
                font-weight: bold;
                text-transform: uppercase;
                color: #000;
                border-bottom: 1px solid #ccc;
                padding-bottom: 3px;
            }
            .contract-clause p {
                margin-bottom: 8px;
                text-align: justify;
            }
            .contract-clause ol, .contract-clause ul {
                margin: 8px 0 8px 25px;
            }
            .contract-clause li {
                margin-bottom: 4px;
            }
            .signature-area {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #000;
            }
            .signature-row {
                display: flex;
                justify-content: space-between;
                margin-top: 20px;
            }
            .signature-box {
                width: 45%;
                text-align: center;
            }
            .signature-line {
                width: 100%;
                height: 1px;
                background: #000;
                margin: 20px 0 5px 0;
            }
            .signature-name {
                font-weight: bold;
                margin-top: 5px;
            }
            .signature-role {
                font-style: italic;
                color: #555;
                font-size: 10pt;
            }
            .watermark {
                position: fixed;
                opacity: 0.1;
                font-size: 80px;
                transform: rotate(-45deg);
                top: 40%;
                left: 20%;
                z-index: -1;
                color: #ccc;
                font-weight: bold;
                white-space: nowrap;
            }
            @media print {
                body { margin: 0; }
                .watermark { display: none; }
            }
        </style>
    </head>
    <body>
        <div class="watermark">CONTRATO VÁLIDO</div>
        <div class="contract-container">
            <div class="contract-header">
                <div class="contract-title">CONTRATO DE PRESTAÇÃO DE SERVIÇOS PROFISSIONAIS</div>
                <div class="contract-subtitle">Instrumento Jurídico Particular - Lei nº 13.467/2017</div>
            </div>
            
            <div class="contract-body">
                <div class="contract-clause">
                    <p style="text-align: justify; font-style: italic;">
                        As partes abaixo qualificadas celebram o presente Contrato de Prestação de Serviços, 
                        que se regerá pelas cláusulas e condições seguintes, bem como pela legislação aplicável.
                    </p>
                </div>

                <div class="contract-clause">
                    <h4>CLÁUSULA PRIMEIRA - DAS PARTES CONTRATANTES</h4>
                    <p><strong>CONTRATANTE:</strong> ${data.contractorName || '________________________'}, ${data.contractorCivilState || '______________'}, ${data.contractorProfession || '________________________'}, portador(a) do ${contractorDocInfo.type} nº ${contractorDocInfo.number}, residente e domiciliado(a) na ${data.contractorAddress || '______________________________________'}.</p>
                    
                    <p><strong>CONTRATADO(A):</strong> ${data.contractedName || '________________________'}, ${data.contractedCivilState || '______________'}, ${data.contractedProfession || '________________________'}, portador(a) do ${contractedDocInfo.type} nº ${contractedDocInfo.number}, residente e domiciliado(a) na ${data.contractedAddress || '______________________________________'}.</p>
                    
                    <p>As partes declaram, sob as penas da lei, que os dados acima são verdadeiros e assumem a responsabilidade por sua exatidão.</p>
                </div>

                <div class="contract-clause">
                    <h4>CLÁUSULA SEGUNDA - DO OBJETO CONTRATUAL</h4>
                    <p><strong>2.1.</strong> Constitui objeto do presente contrato a prestação dos seguintes serviços profissionais: <strong>${data.serviceDescription || '________________________'}</strong>.</p>
                    
                    <p><strong>2.2.</strong> Os serviços serão executados observando-se as seguintes especificações técnicas:</p>
                    <ol type="a">
                        <li>Padrões de qualidade técnica e profissional estabelecidos pela legislação pertinente;</li>
                        <li>Normas técnicas aplicáveis ao serviço contratado;</li>
                        <li>Especificações complementares acordadas entre as partes;</li>
                        <li>Prazos e cronogramas estabelecidos neste instrumento.</li>
                    </ol>
                    
                    <p><strong>2.3.</strong> O CONTRATADO compromete-se a empregar todo o cuidado, zelo e diligência necessários à perfeita execução dos serviços.</p>
                </div>

                <div class="contract-clause">
                    <h4>CLÁUSULA TERCEIRA - DOS PRAZOS E ENTREGÁVEIS</h4>
                    <p><strong>3.1.</strong> O prazo para execução total dos serviços é de <strong>${calculateDays()}</strong> dias, contados a partir de <strong>${formatDate(data.startDate)}</strong>, com término previsto para <strong>${formatDate(data.endDate)}</strong>.</p>
                    
                    <p><strong>3.2.</strong> Os serviços serão entregues conforme o seguinte cronograma:</p>
                    <ol type="a">
                        <li>Relatório de planejamento: até 5 dias úteis após a assinatura;</li>
                        <li>Entregas parciais: conforme acordado entre as partes;</li>
                        <li>Versão final: na data de término estabelecida.</li>
                    </ol>
                </div>

                <div class="contract-clause">
                    <h4>CLÁUSULA QUARTA - DO VALOR E CONDIÇÕES DE PAGAMENTO</h4>
                    <p><strong>4.1.</strong> Pelo fiel e integral cumprimento deste contrato, o CONTRATANTE pagará ao CONTRATADO a importância total de <strong>R$ ${data.serviceValue || '__________'}</strong> (${valorExtenso}).</p>
                    
                    <p><strong>4.2.</strong> O pagamento será efetuado mediante: <strong>${paymentMethodText}</strong>.</p>
                    
                    <p><strong>4.3.</strong> Forma de pagamento: <strong>50% na assinatura e 50% na entrega final</strong>, salvo acordo diferente entre as partes.</p>
                    
                    <p><strong>4.4.</strong> O não pagamento no prazo estipulado sujeitará o CONTRATANTE à incidência de multa moratória de 2% (dois por cento) sobre o valor devido, além de juros de mora de 1% (um por cento) ao mês e correção monetária.</p>
                </div>

                <div class="contract-clause">
                    <h4>CLÁUSULA QUINTA - DAS OBRIGAÇÕES DO CONTRATADO</h4>
                    <p><strong>5.1.</strong> O CONTRATADO compromete-se a:</p>
                    <ol type="a">
                        <li>Executar os serviços com zelo, diligência e competência técnica;</li>
                        <li>Cumprir os prazos estabelecidos;</li>
                        <li>Fornecer todos os relatórios e documentação necessária;</li>
                        <li>Manter sigilo sobre informações confidenciais;</li>
                        <li>Comunicar eventuais impedimentos à execução dos serviços.</li>
                    </ol>
                </div>

                <div class="contract-clause">
                    <h4>CLÁUSULA SEXTA - DAS OBRIGAÇÕES DO CONTRATANTE</h4>
                    <p><strong>6.1.</strong> O CONTRATANTE compromete-se a:</p>
                    <ol type="a">
                        <li>Fornecer todas as informações necessárias à execução dos serviços;</li>
                        <li>Realizar os pagamentos nos prazos estabelecidos;</li>
                        <li>Fornecer acesso a instalações e equipamentos quando necessário;</li>
                        <li>Indicar um responsável para acompanhamento dos serviços;</li>
                        <li>Fornecer feedback em tempo hábil sobre entregas parciais.</li>
                    </ol>
                </div>

                <div class="contract-clause">
                    <h4>CLÁUSULA SÉTIMA - DA PROPRIEDADE INTELECTUAL</h4>
                    <p><strong>7.1.</strong> Todo e qualquer material produzido no âmbito deste contrato, incluindo mas não se limitando a textos, códigos, designs, estratégias e metodologias, será de propriedade exclusiva do CONTRATANTE após o pagamento integral.</p>
                    
                    <p><strong>7.2.</strong> O CONTRATADO mantém o direito de incluir o trabalho em seu portfólio, exceto quando houver cláusula específica de confidencialidade.</p>
                </div>

                <div class="contract-clause">
                    <h4>CLÁUSULA OITAVA - DA CONFIDENCIALIDADE</h4>
                    <p><strong>8.1.</strong> As partes comprometem-se a manter em sigilo todas as informações confidenciais a que tiverem acesso durante a vigência deste contrato.</p>
                    
                    <p><strong>8.2.</strong> A obrigação de confidencialidade permanece válida mesmo após o término do contrato.</p>
                    
                    <p><strong>8.3.</strong> São consideradas informações confidenciais: dados financeiros, estratégias de negócio, listas de clientes, processos internos e qualquer informação não pública.</p>
                </div>

                <div class="contract-clause">
                    <h4>CLÁUSULA NONA - DAS GARANTIAS</h4>
                    <p><strong>9.1.</strong> O CONTRATADO garante que os serviços serão executados conforme os mais altos padrões profissionais do mercado.</p>
                    
                    <p><strong>9.2.</strong> O CONTRATADO oferece garantia de 30 (trinta) dias sobre os serviços prestados, contados a partir da entrega final.</p>
                    
                    <p><strong>9.3.</strong> Durante o período de garantia, eventuais ajustes e correções necessárias serão realizados sem custo adicional.</p>
                </div>

                <div class="contract-clause">
                    <h4>CLÁUSULA DÉCIMA - DA RESCISÃO</h4>
                    <p><strong>10.1.</strong> Este contrato poderá ser rescindido por qualquer das partes mediante notificação por escrito com 30 (trinta) dias de antecedência.</p>
                    
                    <p><strong>10.2.</strong> Em caso de rescisão por descumprimento contratual, a parte inocente terá direito às perdas e danos.</p>
                    
                    <p><strong>10.3.</strong> O CONTRATANTE poderá rescindir o contrato se o CONTRATADO:</p>
                    <ol type="a">
                        <li>Deixar de cumprir obrigações essenciais;</li>
                        <li>Cometer falta grave no exercício das atividades;</li>
                        <li>Descumprir prazos estabelecidos sem justificativa.</li>
                    </ol>
                </div>

                <div class="contract-clause">
                    <h4>CLÁUSULA DÉCIMA PRIMEIRA - DAS DISPOSIÇÕES GERAIS</h4>
                    <p><strong>11.1.</strong> As partes elegeram o foro da comarca de <strong>${cidadeEstado}</strong> para dirimir quaisquer dúvidas oriundas deste contrato.</p>
                    
                    <p><strong>11.2.</strong> Este contrato constitui a totalidade do acordo entre as partes, substituindo qualquer acordo anterior.</p>
                    
                    <p><strong>11.3.</strong> Quaisquer alterações neste contrato deverão ser feitas por escrito e assinadas por ambas as partes.</p>
                    
                    <p><strong>11.4.</strong> A tolerância de uma parte em relação ao descumprimento eventual de obrigações pela outra não constituirá novação nem alteração contratual.</p>
                    
                    <p><strong>11.5.</strong> As cláusulas deste contrato são independentes, de modo que a nulidade de uma não afetará as demais.</p>
                </div>

                <div class="contract-clause">
                    <h4>CLÁUSULA DÉCIMA SEGUNDA - DAS COMUNICAÇÕES</h4>
                    <p><strong>12.1.</strong> Todas as comunicações relativas a este contrato deverão ser feitas por escrito, considerando-se efetivadas:</p>
                    <ol type="a">
                        <li>No momento do recebimento, se entregues pessoalmente;</li>
                        <li>No 3º dia útil após o envio, se por correio;</li>
                        <li>No momento da confirmação de entrega, se por e-mail.</li>
                    </ol>
                    
                    <p><strong>12.2.</strong> Endereços para comunicação:</p>
                    <ul>
                        <li><strong>CONTRATANTE:</strong> ${data.contractorAddress || '______________________________________'}</li>
                        <li><strong>CONTRATADO:</strong> ${data.contractedAddress || '______________________________________'}</li>
                    </ul>
                </div>

                <div class="contract-clause">
                    <h4>CLÁUSULA DÉCIMA TERCEIRA - DOS IMPEDIMENTOS (FORÇA MAIOR)</h4>
                    <p><strong>13.1.</strong> Nenhuma das partes será responsável por atrasos ou falhas no cumprimento de obrigações decorrentes de eventos de força maior.</p>
                    
                    <p><strong>13.2.</strong> Consideram-se eventos de força maior: desastres naturais, guerras, greves gerais, pandemias, atos governamentais e quaisquer eventos imprevisíveis e inevitáveis.</p>
                    
                    <p><strong>13.3.</strong> A parte afetada deverá notificar a outra imediatamente sobre o evento de força maior.</p>
                </div>

                <div class="contract-clause">
                    <h4>CLÁUSULA DÉCIMA QUARTA - DOS ANEXOS</h4>
                    <p><strong>14.1.</strong> Fazem parte integrante deste contrato os seguintes anexos:</p>
                    <ol type="a">
                        <li>Especificação detalhada dos serviços;</li>
                        <li>Cronograma de execução;</li>
                        <li>Critérios de aceitação;</li>
                        <li>Documentos complementares acordados entre as partes.</li>
                    </ol>
                </div>

                <div class="contract-clause">
                    <h4>CLÁUSULA DÉCIMA QUINTA - DO PRAZO DE VIGÊNCIA</h4>
                    <p><strong>15.1.</strong> Este contrato entra em vigor na data de sua assinatura e permanecerá válido até <strong>${formatDate(data.endDate)}</strong>.</p>
                    
                    <p><strong>15.2.</strong> Findo o prazo de vigência, o contrato poderá ser renovado por acordo escrito entre as partes.</p>
                    
                    <p><strong>15.3.</strong> As obrigações de confidencialidade, propriedade intelectual e indenização permanecerão vigentes mesmo após o término do contrato.</p>
                </div>

                <div class="signature-area">
                    <p><strong>${cidadeEstado}</strong>, ${contractDay} de ${contractMonth} de ${contractYear}.</p>
                    
                    <div class="signature-row">
                        <div class="signature-box">
                            <div class="signature-line"></div>
                            ${data.contractorSignature ? `
                                <img src="${data.contractorSignature}" style="max-width: 200px; max-height: 60px; display: block; margin: 0 auto;">
                            ` : ''}
                            <div class="signature-name">${data.contractorName || '________________________'}</div>
                            <div class="signature-role">CONTRATANTE</div>
                            <div style="font-size: 9pt; color: #555;">${contractorDocInfo.type}: ${contractorDocInfo.number}</div>
                        </div>
                        
                        <div class="signature-box">
                            <div class="signature-line"></div>
                            ${data.contractedSignature ? `
                                <img src="${data.contractedSignature}" style="max-width: 200px; max-height: 60px; display: block; margin: 0 auto;">
                            ` : ''}
                            <div class="signature-name">${data.contractedName || '________________________'}</div>
                            <div class="signature-role">CONTRATADO(A)</div>
                            <div style="font-size: 9pt; color: #555;">${contractedDocInfo.type}: ${contractedDocInfo.number}</div>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #000; text-align: center; font-size: 10pt; color: #666;">
                    <p><strong>Contrato gerado por ContratoFácil - Sistema Profissional de Criação de Contratos</strong></p>
                    <p>Documento juridicamente válido - Registro: ${new Date().getTime()} - ${new Date().toLocaleDateString('pt-BR')}</p>
                    <p style="font-size: 9pt; color: #999; margin-top: 0.5rem;">
                        ⚖️ Este documento atende aos requisitos do Código Civil (Lei 10.406/2002) e Lei do Prestador de Serviços (13.467/2017)
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
    
    return contractHTML;
}

// =============================================
// VALIDAÇÃO DE DADOS - VERSÃO ÚNICA
// =============================================
function validateContractData() {
    const requiredFields = {
        'contractorName': 'Nome do Contratante',
        'contractorDoc': 'CPF/CNPJ do Contratante', 
        'contractedName': 'Nome do Contratado',
        'contractedDoc': 'CPF/CNPJ do Contratado',
        'serviceDescription': 'Descrição do Serviço',
        'serviceValue': 'Valor do Serviço',
        'startDate': 'Data de Início',
        'contractCity': 'Cidade do Contrato',
        'contractState': 'Estado (UF)'
    };

    const errors = [];
    
    for (const [fieldId, fieldName] of Object.entries(requiredFields)) {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
            errors.push(fieldName);
            if (field) {
                field.style.borderColor = '#dc3545';
                field.style.animation = 'shake 0.5s ease-in-out';
                setTimeout(() => {
                    field.style.animation = '';
                }, 500);
            }
        } else if (field) {
            field.style.borderColor = '#e0e0e0';
        }
    }

    const contractorDoc = document.getElementById('contractorDoc')?.value;
    const contractedDoc = document.getElementById('contractedDoc')?.value;
    
    if (contractorDoc && contractorDoc.trim() && !validateCPFCNPJ(contractorDoc)) {
        errors.push('CPF/CNPJ do Contratante inválido');
    }
    
    if (contractedDoc && contractedDoc.trim() && !validateCPFCNPJ(contractedDoc)) {
        errors.push('CPF/CNPJ do Contratado inválido');
    }

    const serviceValue = document.getElementById('serviceValue')?.value;
    if (serviceValue && serviceValue.trim()) {
        const valorNumerico = parseFloat(serviceValue.replace(/[^\d,]/g, '').replace(',', '.'));
        if (isNaN(valorNumerico) || valorNumerico <= 0) {
            errors.push('Valor do serviço deve ser maior que zero');
        }
    }

    return errors;
}

// =============================================
// CONFIGURAÇÃO DE EVENT LISTENERS
// =============================================
function setupEventListeners() {
    const formInputs = document.querySelectorAll('#generatorForm input, #generatorForm select, #generatorForm textarea');
    
    formInputs.forEach(input => {
        input.removeEventListener('input', handleFormInput);
        input.removeEventListener('change', handleFormInput);
        
        input.addEventListener('input', handleFormInput);
        input.addEventListener('change', handleFormInput);
    });

    const serviceValueInput = document.getElementById('serviceValue');
    if (serviceValueInput) {
        serviceValueInput.addEventListener('input', function(e) {
            formatCurrencyInput(e);
            updatePreview();
        });
    }

    document.addEventListener('click', function(event) {
        const paymentModal = document.getElementById('paymentModal');
        if (event.target === paymentModal) {
            closePaymentModal();
        }
        
        const loginModal = document.getElementById('loginModal');
        if (event.target === loginModal) {
            closeLoginModal();
        }
        
        const contactModal = document.getElementById('contactModal');
        if (event.target === contactModal) {
            closeContactModal();
        }
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closePaymentModal();
            closeLoginModal();
            closeContactModal();
            
            const upgradeModal = document.querySelector('.modal.upgrade-modal');
            if (upgradeModal) {
                upgradeModal.remove();
                document.body.style.overflow = 'auto';
            }
        }
    });

    document.addEventListener('copy', function(e) {
        const contractPreview = document.getElementById('contractPreview');
        if (contractPreview && contractPreview.contains(e.target)) {
            e.preventDefault();
            showNotification('❌ Cópia do conteúdo do contrato não é permitida');
        }
    });

    document.addEventListener('contextmenu', function(e) {
        const contractPreview = document.getElementById('contractPreview');
        if (contractPreview && contractPreview.contains(e.target)) {
            e.preventDefault();
            showNotification('❌ Ação não permitida no contrato');
        }
    });
}

function handleFormInput(e) {
    updatePreview();
}

// =============================================
// FUNÇÃO DE ATUALIZAÇÃO DO PREVIEW
// =============================================
function updatePreview() {
    try {
        const contractPreview = document.getElementById('contractPreview');
        if (!contractPreview) {
            return;
        }
        
        if (!currentUser) {
            contractPreview.innerHTML = '<p style="color: #666; text-align: center;">Faça login para visualizar o contrato...</p>';
            return;
        }
        
        const contractHTML = generateProfessionalContractPlus();
        
        if (!contractHTML || contractHTML.trim() === '') {
            contractPreview.innerHTML = '<p style="color: #666; text-align: center;">Preencha os campos acima para gerar o contrato...</p>';
            return;
        }
        
        contractPreview.innerHTML = contractHTML;
        
        if (currentUser) {
            incrementContractCount();
        }
        
    } catch (error) {
        console.error('Erro ao atualizar preview:', error);
        showNotification('❌ Erro ao atualizar visualização do contrato');
    }
}

function incrementContractCount() {
    if (!currentUser) return;
    
    window.lastContractView = window.lastContractView || 0;
    const now = Date.now();
    const timeSinceLastView = now - window.lastContractView;
    
    if (timeSinceLastView < 1000) {
        return;
    }
    
    window.lastContractView = now;
    
    currentUser.contractsGenerated = (currentUser.contractsGenerated || 0) + 1;
    currentUser.lastLogin = new Date().toISOString();
    
    if (currentUser.contractsGenerated > 999) {
        currentUser.contractsGenerated = 999;
    }
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateStatusBar();
    
    console.log('📊 Contador atualizado:', currentUser.contractsGenerated);
}

function setupAutoPreview() {
    if (currentUser) {
        setTimeout(updatePreview, 500);
    }
}

// =============================================
// SISTEMA DE BARRA DE STATUS
// =============================================
function updateStatusBar() {
    const statusBar = document.getElementById('statusBar');
    const statusIcon = document.getElementById('statusIcon');
    const statusText = document.getElementById('statusText');
    const statusCount = document.getElementById('statusCount');
    
    if (!currentUser || !statusBar) {
        if (statusBar) statusBar.style.display = 'none';
        return;
    }
    
    statusBar.style.display = 'block';
    
    console.log('📊 Atualizando status bar - Plano:', currentUser.plan);
    
    if (currentUser.plan === 'free') {
        statusIcon.className = 'fas fa-eye';
        statusText.textContent = 'Plano Gratuito - Visualizações Ilimitadas';
        statusCount.innerHTML = `Contratos visualizados: <strong>${currentUser.contractsGenerated || 0}</strong>`;
    } else if (currentUser.plan === 'basico') {
        statusIcon.className = 'fas fa-crown';
        statusText.textContent = 'Plano Básico - 5 contratos/mês';
        const remaining = Math.max(0, 5 - (currentUser.contractsDownloaded || 0));
        statusCount.innerHTML = `Contratos restantes: <strong>${remaining}</strong>`;
    } else if (currentUser.plan === 'profissional') {
        statusIcon.className = 'fas fa-gem';
        statusText.textContent = 'Plano Profissional - Downloads Ilimitados';
        const downloads = currentUser.contractsDownloaded || 0;
        statusCount.innerHTML = `Contratos baixados: <strong>${downloads}</strong>`;
    } else {
        statusIcon.className = 'fas fa-user';
        statusText.textContent = 'Plano Gratuito - Visualizações Ilimitadas';
        statusCount.innerHTML = `Contratos visualizados: <strong>${currentUser.contractsGenerated || 0}</strong>`;
    }
}

// =============================================
// SISTEMA DE ASSINATURAS (MANTIDO)
// =============================================
function initSignatureSystem() {
    ['contractor', 'contracted'].forEach(type => {
        const uploadInput = document.getElementById(`${type}SignatureUpload`);
        if (uploadInput) {
            uploadInput.addEventListener('change', function(e) {
                handleSignatureUpload(e, type);
            });
        }
        initSignatureCanvas(type);
    });
}

function selectSignatureOption(type, method) {
    const uploadInput = document.getElementById(`${type}SignatureUpload`);
    const canvas = document.getElementById(`${type}SignatureDraw`);
    
    const signatureOptions = document.querySelectorAll(`.signature-options`);
    signatureOptions.forEach(section => {
        const options = section.querySelectorAll('.signature-option');
        options.forEach(option => {
            option.classList.remove('selected');
        });
    });
    
    if (method === 'upload') {
        if (uploadInput) {
            uploadInput.click();
        }
    } else if (method === 'draw') {
        if (canvas) {
            canvas.style.display = 'block';
            
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            if (uploadInput) {
                uploadInput.value = '';
            }
            
            if (type === 'contractor') {
                contractorSignature = null;
            } else {
                contractedSignature = null;
            }
            
            drawingCanvas = canvas;
            drawingContext = ctx;
            drawingFor = type;
            
            updateSignaturePreview(type);
            updatePreview();
        }
    }
}

function handleSignatureUpload(event, type) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    if (!file.type.match('image.*')) {
        showNotification('❌ Por favor, selecione uma imagem válida (JPG, PNG, etc.)');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        showNotification('❌ A imagem deve ser menor que 5MB');
        return;
    }

    const reader = new FileReader();
    
    reader.onload = function(e) {
        const img = new Image();
        
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = 300;
            canvas.height = 100;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const ratio = Math.min(
                canvas.width / img.width,
                canvas.height / img.height
            );
            const width = img.width * ratio;
            const height = img.height * ratio;
            const x = (canvas.width - width) / 2;
            const y = (canvas.height - height) / 2;
            
            ctx.drawImage(img, x, y, width, height);
            
            const signatureData = canvas.toDataURL('image/png');
            
            if (type === 'contractor') {
                contractorSignature = signatureData;
                if (currentUser) {
                    currentUser.signatures = currentUser.signatures || {};
                    currentUser.signatures.contractor = signatureData;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                }
            } else {
                contractedSignature = signatureData;
                if (currentUser) {
                    currentUser.signatures = currentUser.signatures || {};
                    currentUser.signatures.contracted = signatureData;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                }
            }
            
            updateSignaturePreview(type);
            
            const drawCanvas = document.getElementById(`${type}SignatureDraw`);
            if (drawCanvas) {
                drawCanvas.style.display = 'none';
            }
            
            showNotification('✅ Assinatura carregada com sucesso!');
            updatePreview();
        };
        
        img.onerror = function() {
            showNotification('❌ Erro ao carregar a imagem');
        };
        
        img.src = e.target.result;
    };
    
    reader.onerror = function() {
        showNotification('❌ Erro ao ler o arquivo');
    };
    
    reader.readAsDataURL(file);
}

function initSignatureCanvas(type) {
    const canvasId = `${type}SignatureDraw`;
    const canvas = document.getElementById(canvasId);
    
    if (!canvas) {
        console.error(`❌ Canvas não encontrado: ${canvasId}`);
        return;
    }

    const ctx = canvas.getContext('2d');
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    function getCoordinates(e) {
        let clientX, clientY;
        
        if (e.type.includes('touch')) {
            const touch = e.touches[0] || e.changedTouches[0];
            clientX = touch.clientX;
            clientY = touch.clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        return [
            (clientX - rect.left) * scaleX,
            (clientY - rect.top) * scaleY
        ];
    }

    function startDrawing(e) {
        e.preventDefault();
        isDrawing = true;
        [lastX, lastY] = getCoordinates(e);
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
    }

    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        
        const [currentX, currentY] = getCoordinates(e);
        
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        
        [lastX, lastY] = [currentX, currentY];
        
        const signatureData = canvas.toDataURL();
        if (type === 'contractor') {
            contractorSignature = signatureData;
        } else {
            contractedSignature = signatureData;
        }
    }

    function stopDrawing() {
        if (isDrawing) {
            isDrawing = false;
            ctx.closePath();
            
            const signatureData = canvas.toDataURL();
            if (type === 'contractor') {
                contractorSignature = signatureData;
                if (currentUser) {
                    currentUser.signatures = currentUser.signatures || {};
                    currentUser.signatures.contractor = signatureData;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                }
            } else {
                contractedSignature = signatureData;
                if (currentUser) {
                    currentUser.signatures = currentUser.signatures || {};
                    currentUser.signatures.contracted = signatureData;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                }
            }
            
            updateSignaturePreview(type);
            
            const confirmation = document.getElementById(`${type}SignatureConfirmation`);
            if (confirmation) {
                confirmation.style.display = 'flex';
            }
            
            updatePreview();
        }
    }

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        startDrawing(e);
    }, { passive: false });
    
    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
        draw(e);
    }, { passive: false });
    
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);
    
    canvas.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
            document.body.style.overflow = 'hidden';
        }
    });
    
    canvas.addEventListener('touchend', function() {
        document.body.style.overflow = '';
    });
    
    console.log(`✅ Canvas ${type} inicializado para mobile`);
}

function updateSignaturePreview(type) {
    const preview = document.getElementById(`${type}SignaturePreview`);
    if (!preview) return;
    
    const signatureData = type === 'contractor' ? contractorSignature : contractedSignature;
    
    if (signatureData) {
        preview.innerHTML = `
            <div style="text-align: center;">
                <img src="${signatureData}" 
                     alt="Assinatura ${type === 'contractor' ? 'do Contratante' : 'do Contratado'}" 
                     style="max-width: 100%; max-height: 80px; border: 1px solid #ddd; border-radius: 4px; background: white;">
                <p style="margin-top: 0.5rem; font-size: 0.8rem; color: #666;">
                    ✅ Assinatura confirmada
                </p>
                <button onclick="clearSignature('${type}')" 
                        style="margin-top: 5px; padding: 3px 10px; font-size: 0.7rem; background: #ff6b6b; color: white; border: none; border-radius: 3px; cursor: pointer;">
                    Remover
                </button>
            </div>
        `;
    } else {
        preview.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <i class="fas fa-signature" style="font-size: 2rem; color: #ccc; margin-bottom: 10px;"></i>
                <p style="color: #666; font-size: 0.9rem;">
                    Assinatura ${type === 'contractor' ? 'do CONTRATANTE' : 'do CONTRATADO'} aparecerá aqui
                </p>
            </div>
        `;
    }
}

function clearSignature(type) {
    if (type === 'contractor') {
        contractorSignature = null;
    } else {
        contractedSignature = null;
    }
    
    if (currentUser && currentUser.signatures) {
        delete currentUser.signatures[type];
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    const preview = document.getElementById(`${type}SignaturePreview`);
    if (preview) {
        preview.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <i class="fas fa-signature" style="font-size: 2rem; color: #ccc; margin-bottom: 10px;"></i>
                <p style="color: #666; font-size: 0.9rem;">
                    Assinatura ${type === 'contractor' ? 'do CONTRATANTE' : 'do CONTRATADO'} aparecerá aqui
                </p>
            </div>
        `;
    }
    
    const canvas = document.getElementById(`${type}SignatureDraw`);
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.display = 'none';
    }
    
    const uploadInput = document.getElementById(`${type}SignatureUpload`);
    if (uploadInput) {
        uploadInput.value = '';
    }
    
    const signatureSection = document.querySelector(`.signature-options:has(#${type}SignaturePreview)`);
    if (signatureSection) {
        const options = signatureSection.querySelectorAll('.signature-option');
        options.forEach(option => {
            option.classList.remove('selected');
        });
    }
    
    const confirmation = document.getElementById(`${type}SignatureConfirmation`);
    if (confirmation) {
        confirmation.style.display = 'none';
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
    
    const canvas = document.getElementById(`${type}SignatureDraw`);
    if (canvas) {
        canvas.style.display = 'none';
    }
}

// =============================================
// FUNÇÕES DE VALIDAÇÃO CPF/CNPJ
// =============================================
function validateCPFCNPJ(doc) {
    const cleanDoc = doc.replace(/\D/g, '');
    
    if (cleanDoc.length === 11) {
        return validateCPF(cleanDoc);
    } else if (cleanDoc.length === 14) {
        return validateCNPJ(cleanDoc);
    }
    
    return false;
}

function validateCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validar primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;
    
    // Validar segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;
    
    return true;
}

function validateCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, '');
    
    if (cnpj.length !== 14) return false;
    
    // Eliminar CNPJs inválidos conhecidos
    if (/^(\d)\1{13}$/.test(cnpj)) return false;
    
    // Validar primeiro dígito
    let length = 12;
    let numbers = cnpj.substring(0, length);
    let digits = cnpj.substring(length);
    let sum = 0;
    let pos = length - 7;
    
    for (let i = length; i >= 1; i--) {
        sum += numbers.charAt(length - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;
    
    // Validar segundo dígito
    length = 13;
    numbers = cnpj.substring(0, length);
    sum = 0;
    pos = length - 7;
    
    for (let i = length; i >= 1; i--) {
        sum += numbers.charAt(length - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;
    
    return true;
}

// =============================================
// FUNÇÃO DE FORMATAÇÃO DE MOEDA
// =============================================
function formatCurrencyInput(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value === '') {
        e.target.value = '';
        return;
    }
    
    // Converter para número
    value = parseInt(value, 10) / 100;
    
    // Formatar como moeda brasileira
    e.target.value = value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// =============================================
// FUNÇÃO PARA VERIFICAR SE PODE BAIXAR (100% CORRIGIDA)
// =============================================
function canDownloadContract() {
    if (!currentUser) {
        showNotification('🔐 Faça login para baixar contratos');
        showLoginModal();
        return false;
    }
    
    console.log('📋 Verificando plano do usuário:', currentUser.plan);
    console.log('🎁 Dados completos do usuário:', {
        plan: currentUser.plan,
        contractsDownloaded: currentUser.contractsDownloaded || 0,
        adminGifted: currentUser.adminGifted || false,
        giftedContracts: currentUser.giftedContracts || 0,
        singleDownloads: currentUser.singleDownloads || 0,
        payments: currentUser.payments || []
    });
    
    // ✅ 1. VERIFICAR SE TEM CONTRATOS GRATUITOS DO ADMIN
    if (currentUser.adminGifted) {
        if (currentUser.giftedContracts === 'unlimited') {
            console.log('✅ Usuário tem contratos ILIMITADOS do admin');
            showNotification('🎁 Contratos ilimitados disponíveis!');
            return true;
        }
        
        if (currentUser.giftedContracts && currentUser.giftedContracts > 0) {
            const contractsUsed = currentUser.contractsDownloaded || 0;
            const giftedContracts = parseInt(currentUser.giftedContracts);
            
            if (contractsUsed < giftedContracts) {
                const remaining = giftedContracts - contractsUsed;
                showNotification(`🎁 Você tem ${remaining} contrato(s) gratuito(s) restante(s)`);
                return true;
            }
        }
    }
    
    // ✅ 2. VERIFICAR DOWNLOADS AVULSOS PAGOS
    if (currentUser.singleDownloads && currentUser.singleDownloads > 0) {
        const downloadsUsed = currentUser.contractsDownloaded || 0;
        if (downloadsUsed < currentUser.singleDownloads) {
            const remaining = currentUser.singleDownloads - downloadsUsed;
            showNotification(`✅ Downloads disponíveis: ${remaining}`);
            return true;
        }
    }
    
    // ✅ 3. VERIFICAR SE TEM PAGAMENTOS REGISTRADOS
    if (currentUser.payments && currentUser.payments.length > 0) {
        const validPayments = currentUser.payments.filter(p => 
            p.status === 'completed' || p.status === 'approved'
        );
        
        if (validPayments.length > 0) {
            console.log('✅ Usuário tem pagamentos válidos:', validPayments);
            return true;
        }
    }
    
    // ✅ 4. VERIFICAR PLANOS NORMAIS
    if (currentUser.plan === 'free') {
        showNotification('🚀 Faça upgrade para baixar contratos!');
        showUpgradeModal();
        return false;
    }
    
    if (currentUser.plan === 'basico') {
        const maxDownloads = 5;
        const currentDownloads = currentUser.contractsDownloaded || 0;
        const remaining = maxDownloads - currentDownloads;
        
        if (remaining <= 0) {
            showNotification('❌ Limite mensal atingido (5 contratos). Faça upgrade para Profissional!');
            showUpgradeModal();
            return false;
        }
        
        showNotification(`✅ Downloads restantes este mês: ${remaining}`);
        return true;
    }
    
    if (currentUser.plan === 'profissional') {
        return true; // Downloads ilimitados
    }
    
    // ✅ 5. PLANOS ESPECIAIS DO ADMIN
    if (currentUser.plan === 'admin_free' || 
        currentUser.plan === 'vip' ||
        currentUser.plan === 'free_plus' ||
        currentUser.plan === 'single_payment' ||
        currentUser.plan === 'trial') {
        console.log('✅ Plano especial válido para download:', currentUser.plan);
        return true;
    }
    
    // ❌ SE CHEGOU AQUI, NÃO PODE BAIXAR
    showNotification('💳 Você precisa adquirir um plano para baixar contratos');
    showUpgradeModal();
    return false;
}

// =============================================
// FUNÇÃO DE PAGAMENTO 100% CORRIGIDA
// =============================================
function openPaymentModal(plan) {
    selectedPlan = plan;
    
    const modal = document.getElementById('paymentModal');
    const modalTitle = document.getElementById('modalTitle');
    const planDescription = document.getElementById('modalPlanDescription');
    const modalPrice = document.getElementById('modalPrice');
    const pixValue = document.getElementById('pixValue');
    const cardValue = document.getElementById('cardValue');
    const pixLink = document.getElementById('pixLink');
    const cardLink = document.getElementById('cardLink');
    
    if (!modal) {
        console.error('❌ Modal de pagamento não encontrado');
        return;
    }
    
    // Tentar carregar links do localStorage
    let mercadoPagoLinks = {
        single: 'https://mpago.li/1xTcy3g',
        basico: 'https://mpago.li/1xTcy3g',
        profissional: 'https://mpago.li/1xTcy3g'
    };
    
    try {
        const savedLinks = localStorage.getItem('mercadoPagoLinks');
        if (savedLinks) {
            mercadoPagoLinks = JSON.parse(savedLinks);
        }
    } catch (e) {
        console.warn('⚠️ Usando links padrão do Mercado Pago');
    }
    
    // Definir valores baseados no plano
    let price, description, title, link;
    
    switch(plan) {
        case 'basico':
            price = 9.99;
            description = 'Plano Básico - 5 contratos por mês';
            title = 'Assinar Plano Básico';
            link = mercadoPagoLinks.basico;
            break;
        case 'profissional':
            price = 29.99;
            description = 'Plano Profissional - Downloads Ilimitados';
            title = 'Assinar Plano Profissional';
            link = mercadoPagoLinks.profissional;
            break;
        case 'single':
            price = 6.99;
            description = 'Download Único de Contrato';
            title = 'Download Único';
            link = mercadoPagoLinks.single;
            break;
        default:
            price = 6.99;
            description = 'Download do Contrato';
            title = 'Finalizar Compra';
            link = mercadoPagoLinks.single;
    }
    
    // Atualizar modal
    if (modalTitle) modalTitle.textContent = title;
    if (planDescription) planDescription.textContent = description;
    if (modalPrice) modalPrice.textContent = `Total: R$ ${price.toFixed(2)}`;
    if (pixValue) pixValue.textContent = `R$ ${price.toFixed(2)}`;
    if (cardValue) cardValue.textContent = `R$ ${price.toFixed(2)}`;
    
    // Configurar links COM REGISTRO DE PAGAMENTO
    if (pixLink) {
        pixLink.href = link;
        pixLink.onclick = function(e) {
            e.preventDefault();
            
            console.log('💰 Processando pagamento via PIX para plano:', plan);
            
            // REGISTRAR O PAGAMENTO LOCALMENTE
            if (currentUser) {
                // Inicializar arrays se não existirem
                currentUser.payments = currentUser.payments || [];
                currentUser.paymentHistory = currentUser.paymentHistory || [];
                
                // Criar registro de pagamento
                const paymentRecord = {
                    id: 'payment_' + Date.now(),
                    type: plan,
                    amount: price,
                    method: 'pix',
                    date: new Date().toISOString(),
                    status: 'completed',
                    description: description
                };
                
                // Adicionar aos registros
                currentUser.payments.push(paymentRecord);
                currentUser.paymentHistory.push(paymentRecord);
                
                // Atualizar plano do usuário
                if (plan === 'single') {
                    currentUser.singleDownloads = (currentUser.singleDownloads || 0) + 1;
                    showNotification('✅ 1 download disponível! Você pode baixar seu contrato.');
                } else {
                    // Para planos mensais
                    currentUser.plan = plan;
                    currentUser.planUpdated = new Date().toISOString();
                    
                    if (plan === 'basico') {
                        currentUser.contractsDownloaded = 0; // Reset mensal
                    }
                    
                    showNotification(`✅ Plano ${plan} ativado! Agora você pode baixar contratos.`);
                }
                
                // Adicionar data do último pagamento
                currentUser.lastPayment = new Date().toISOString();
                
                // Salvar no localStorage
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                console.log('✅ Pagamento registrado:', paymentRecord);
                console.log('📊 Usuário atualizado:', currentUser);
                
                // Fechar modal
                closePaymentModal();
                
                // Redirecionar para o link de pagamento (em nova aba)
                window.open(link, '_blank');
                
                // Atualizar status bar
                setTimeout(updateStatusBar, 500);
            }
            
            return false;
        };
    }
    
    if (cardLink) {
        cardLink.href = link;
        cardLink.onclick = function(e) {
            e.preventDefault();
            
            console.log('💳 Processando pagamento via Cartão para plano:', plan);
            
            // MESMA LÓGICA DO PIX
            if (currentUser) {
                currentUser.payments = currentUser.payments || [];
                currentUser.paymentHistory = currentUser.paymentHistory || [];
                
                const paymentRecord = {
                    id: 'payment_' + Date.now(),
                    type: plan,
                    amount: price,
                    method: 'card',
                    date: new Date().toISOString(),
                    status: 'completed',
                    description: description
                };
                
                currentUser.payments.push(paymentRecord);
                currentUser.paymentHistory.push(paymentRecord);
                
                if (plan === 'single') {
                    currentUser.singleDownloads = (currentUser.singleDownloads || 0) + 1;
                    showNotification('✅ 1 download disponível! Você pode baixar seu contrato.');
                } else {
                    currentUser.plan = plan;
                    currentUser.planUpdated = new Date().toISOString();
                    
                    if (plan === 'basico') {
                        currentUser.contractsDownloaded = 0;
                    }
                    
                    showNotification(`✅ Plano ${plan} ativado! Agora você pode baixar contratos.`);
                }
                
                currentUser.lastPayment = new Date().toISOString();
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                console.log('✅ Pagamento registrado:', paymentRecord);
                
                closePaymentModal();
                window.open(link, '_blank');
                setTimeout(updateStatusBar, 500);
            }
            
            return false;
        };
    }
    
    // Resetar seleção de pagamento
    selectedPaymentMethod = '';
    const paymentOptions = document.querySelectorAll('.payment-option');
    paymentOptions.forEach(option => option.classList.remove('selected'));
    
    const pixDetails = document.getElementById('pixDetails');
    const cardDetails = document.getElementById('cardDetails');
    if (pixDetails) pixDetails.style.display = 'none';
    if (cardDetails) cardDetails.style.display = 'none';
    
    // Mostrar modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function selectPayment(element, method) {
    selectedPaymentMethod = method;
    
    const paymentOptions = document.querySelectorAll('.payment-option');
    paymentOptions.forEach(option => option.classList.remove('selected'));
    
    if (element) {
        element.classList.add('selected');
    }
    
    const pixDetails = document.getElementById('pixDetails');
    const cardDetails = document.getElementById('cardDetails');
    
    if (method === 'pix' && pixDetails) {
        pixDetails.style.display = 'block';
        if (cardDetails) cardDetails.style.display = 'none';
    } else if (method === 'cartao' && cardDetails) {
        cardDetails.style.display = 'block';
        if (pixDetails) pixDetails.style.display = 'none';
    }
}

// =============================================
// FUNÇÃO DE UPGRADE DO USUÁRIO (CORRIGIDA)
// =============================================
function updateUserPlan(plan, paymentId = null) {
    if (!currentUser) {
        showNotification('❌ Faça login antes de atualizar seu plano');
        return false;
    }
    
    // Atualizar plano do usuário
    currentUser.plan = plan;
    currentUser.planUpdated = new Date().toISOString();
    
    // Resetar contadores se necessário
    if (plan === 'basico') {
        currentUser.contractsDownloaded = 0; // Reset mensal
    }
    
    // Adicionar histórico de pagamento
    if (paymentId) {
        currentUser.paymentHistory = currentUser.paymentHistory || [];
        currentUser.paymentHistory.push({
            id: paymentId,
            plan: plan,
            date: new Date().toISOString(),
            amount: plan === 'basico' ? 9.99 : plan === 'profissional' ? 29.99 : 6.99
        });
    }
    
    // Salvar no localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Atualizar UI
    updateStatusBar();
    
    showNotification(`✅ Plano atualizado para: ${plan === 'basico' ? 'Básico' : 'Profissional'}`);
    closePaymentModal();
    
    return true;
}

// =============================================
// FUNÇÃO DE INCREMENTAR DOWNLOADS
// =============================================
function incrementDownloadCount() {
    if (!currentUser) return;
    
    currentUser.contractsDownloaded = (currentUser.contractsDownloaded || 0) + 1;
    currentUser.lastDownload = new Date().toISOString();
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateStatusBar();
    
    console.log('📥 Download contabilizado:', currentUser.contractsDownloaded);
}

// =============================================
// FUNÇÃO PARA GERAR CONTRATO EM AMBOS OS FORMATOS (IMAGEM E WORD)
// =============================================
function generateWordPlus() {
    try {
        console.log('🔄 Iniciando download duplo (imagem + word)...');
        
        // VALIDAR DADOS PRIMEIRO
        const validationErrors = validateContractData();
        if (validationErrors.length > 0) {
            showNotification(`❌ Corrija: ${validationErrors.join(', ')}`);
            return;
        }
        
        // VERIFICAR SE PODE BAIXAR
        if (!canDownloadContract()) {
            return; // O canDownloadContract já mostra as mensagens apropriadas
        }
        
        // COLETAR DADOS
        const contractData = collectContractData();
        
        // ATUALIZAR CONTADOR DE DOWNLOADS
        incrementDownloadCount();
        
        // MOSTRAR MENSAGEM DE SUCESSO
        showNotification('✅ Gerando contrato em imagem e Word...');
        
        // GERAR O CONTRATO HTML
        const contractHTML = generateProfessionalContractPlus();
        
        // =============================================
        // 1. CRIAR E BAIXAR COMO IMAGEM (PNG)
        // =============================================
        createAndDownloadAsImage(contractHTML);
        
        // =============================================
        // 2. CRIAR E BAIXAR COMO DOCUMENTO WORD
        // =============================================
        createAndDownloadAsWord(contractHTML);
        
        // =============================================
        // 3. ABRIR AMBAS AS VERSÕES EM NOVAS ABAS
        // =============================================
        openBothVersions(contractHTML);
        
        showNotification('✅ Contrato gerado em imagem e Word! Verifique suas abas abertas.');
        
    } catch (error) {
        console.error('❌ Erro ao gerar contrato:', error);
        showNotification('❌ Erro ao gerar contrato. Tente novamente.');
    }
}

// =============================================
// FUNÇÃO PARA CRIAR E BAIXAR COMO IMAGEM
// =============================================
function createAndDownloadAsImage(contractHTML) {
    try {
        // Criar um iframe temporário para renderizar o HTML
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.top = '-9999px';
        iframe.style.width = '800px';
        iframe.style.height = '1200px';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);
        
        // Escrever o HTML no iframe
        iframe.contentDocument.write(contractHTML);
        iframe.contentDocument.close();
        
        // Aguardar o conteúdo carregar
        setTimeout(() => {
            const html2canvasScript = document.createElement('script');
            html2canvasScript.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
            html2canvasScript.onload = function() {
                // Capturar o iframe como imagem
                html2canvas(iframe.contentDocument.body, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff'
                }).then(canvas => {
                    // Converter canvas para imagem
                    const imageData = canvas.toDataURL('image/png');
                    
                    // Criar link para download da imagem
                    const link = document.createElement('a');
                    link.href = imageData;
                    link.download = `Contrato_${new Date().getTime()}.png`;
                    link.click();
                    
                    // Remover iframe
                    document.body.removeChild(iframe);
                }).catch(error => {
                    console.error('Erro ao gerar imagem:', error);
                    document.body.removeChild(iframe);
                });
            };
            
            document.head.appendChild(html2canvasScript);
        }, 1000);
        
    } catch (error) {
        console.error('Erro ao criar imagem:', error);
    }
}

// =============================================
// FUNÇÃO PARA CRIAR E BAIXAR COMO WORD
// =============================================
function createAndDownloadAsWord(contractHTML) {
    try {
        // Criar um blob com o conteúdo HTML formatado para Word
        const wordContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Contrato de Prestação de Serviços</title>
            <style>
                body { 
                    font-family: 'Times New Roman', Times, serif; 
                    margin: 2.54cm; 
                    line-height: 1.5;
                    font-size: 12pt;
                }
                h1, h2, h3, h4 { 
                    font-family: Arial, sans-serif; 
                    margin-top: 20pt;
                }
                .page-break { 
                    page-break-before: always; 
                }
            </style>
        </head>
        <body>
            ${contractHTML}
        </body>
        </html>
        `;
        
        const blob = new Blob(['\ufeff', wordContent], { 
            type: 'application/msword;charset=utf-8' 
        });
        const url = URL.createObjectURL(blob);
        
        // Criar link para download
        const link = document.createElement('a');
        link.href = url;
        link.download = `Contrato_${new Date().getTime()}.doc`;
        link.click();
        
        // Liberar URL
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
    } catch (error) {
        console.error('Erro ao criar documento Word:', error);
    }
}

// =============================================
// FUNÇÃO PARA ABRIR AMBAS AS VERSÕES EM NOVAS ABAS
// =============================================
function openBothVersions(contractHTML) {
    try {
        // Timestamp único para evitar cache
        const timestamp = new Date().getTime();
        
        // =============================================
        // 1. ABRIR VERSÃO HTML (PARA VISUALIZAÇÃO)
        // =============================================
        const htmlWindow = window.open('', '_blank');
        if (htmlWindow) {
            htmlWindow.document.write(contractHTML);
            htmlWindow.document.close();
            htmlWindow.document.title = `Contrato - ${timestamp}`;
        }
        
        // =============================================
        // 2. ABRIR VERSÃO PARA IMPRESSÃO/PDF
        // =============================================
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            const printHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Contrato para Impressão</title>
                <style>
                    @media print {
                        body { margin: 0; padding: 0; }
                        .no-print { display: none; }
                        .page-break { page-break-before: always; }
                    }
                    body { 
                        font-family: 'Times New Roman', Times, serif; 
                        margin: 2cm; 
                        line-height: 1.5;
                        font-size: 12pt;
                    }
                    .print-button {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        padding: 10px 20px;
                        background: #007bff;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        z-index: 1000;
                    }
                    .print-button:hover {
                        background: #0056b3;
                    }
                </style>
            </head>
            <body>
                <button class="print-button no-print" onclick="window.print()">
                    <i class="fas fa-print"></i> Imprimir / Salvar como PDF
                </button>
                ${contractHTML}
                <script>
                    // Auto-print se o usuário preferir
                    setTimeout(() => {
                        if (confirm('Deseja imprimir o contrato agora?')) {
                            window.print();
                        }
                    }, 1000);
                </script>
            </body>
            </html>
            `;
            
            printWindow.document.write(printHTML);
            printWindow.document.close();
        }
        
    } catch (error) {
        console.error('Erro ao abrir versões:', error);
    }
}

// =============================================
// FUNÇÃO SHOW UPGRADE MODAL (NOVA)
// =============================================
function showUpgradeModal() {
    // Fechar outros modais
    closePaymentModal();
    closeLoginModal();
    
    // Criar modal de upgrade
    const modalHTML = `
        <div class="modal active upgrade-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🚀 Faça Upgrade Agora!</h3>
                    <button class="close-modal" onclick="this.closest('.modal').remove(); document.body.style.overflow='auto'">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="text-align: center; padding: 2rem;">
                        <i class="fas fa-crown" style="font-size: 3rem; color: #f59e0b; margin-bottom: 1rem;"></i>
                        <h4 style="color: var(--primary); margin-bottom: 1rem;">Acesso Completo aos Downloads</h4>
                        <p style="color: var(--dark-gray); margin-bottom: 1.5rem;">
                            Para baixar contratos completos, escolha um plano:
                        </p>
                        
                        <div style="display: flex; flex-direction: column; gap: 1rem; margin: 2rem 0;">
                            <div style="background: #f8fafc; padding: 1rem; border-radius: 10px; border: 2px solid var(--primary);">
                                <h5 style="color: var(--primary); margin-bottom: 0.5rem;">Plano Básico</h5>
                                <p style="font-size: 0.9rem; color: var(--dark-gray); margin-bottom: 0.5rem;">
                                    <strong>R$ 9,99/mês</strong>
                                </p>
                                <ul style="text-align: left; font-size: 0.85rem; color: #555; margin-bottom: 1rem; padding-left: 1rem;">
                                    <li>✓ 5 contratos por mês</li>
                                    <li>✓ Download Word + Imagem</li>
                                    <li>✓ Todos os modelos</li>
                                </ul>
                                <button class="btn" onclick="openPaymentModal('basico'); this.closest('.modal').remove();" 
                                        style="width: 100%; padding: 0.8rem;">
                                    <i class="fas fa-rocket"></i> Escolher Plano Básico
                                </button>
                            </div>
                            
                            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 1rem; border-radius: 10px; border: 2px solid #f59e0b;">
                                <div style="background: #f59e0b; color: white; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem; display: inline-block; margin-bottom: 0.5rem;">
                                    RECOMENDADO
                                </div>
                                <h5 style="color: #92400e; margin-bottom: 0.5rem;">Plano Profissional</h5>
                                <p style="font-size: 0.9rem; color: #92400e; margin-bottom: 0.5rem;">
                                    <strong>R$ 29,99/mês</strong>
                                </p>
                                <ul style="text-align: left; font-size: 0.85rem; color: #92400e; margin-bottom: 1rem; padding-left: 1rem;">
                                    <li>✓ Downloads Ilimitados</li>
                                    <li>✓ Word + Imagem Premium</li>
                                    <li>✓ Suporte Prioritário</li>
                                    <li>✓ Armazenamento</li>
                                </ul>
                                <button class="btn" onclick="openPaymentModal('profissional'); this.closest('.modal').remove();" 
                                        style="width: 100%; padding: 0.8rem; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
                                    <i class="fas fa-gem"></i> Escolher Plano Profissional
                                </button>
                            </div>
                        </div>
                        
                        <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #e2e8f0;">
                            <p style="font-size: 0.8rem; color: #666;">
                                <i class="fas fa-shield-alt"></i> Pagamento 100% seguro • Cancelamento a qualquer momento
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
}

// =============================================
// FUNÇÃO DE MENU MOBILE
// =============================================
function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (toggle && navMenu) {
        toggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            toggle.innerHTML = navMenu.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
        
        // Fechar menu ao clicar em um link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                toggle.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
    }
}

// =============================================
// FUNÇÃO TOGGLE FAQ
// =============================================
function toggleFAQ(element) {
    const item = element.closest('.faq-item');
    const isActive = item.classList.contains('active');
    
    // Fechar todos os outros
    document.querySelectorAll('.faq-item').forEach(otherItem => {
        if (otherItem !== item) {
            otherItem.classList.remove('active');
        }
    });
    
    // Alternar o atual
    item.classList.toggle('active', !isActive);
}

// =============================================
// FUNÇÕES DO FORMULÁRIO DE CONTATO
// =============================================
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', submitContactForm);
    }
}

function showContactModal() {
    const contactModal = document.getElementById('contactModal');
    if (contactModal) {
        contactModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeContactModal() {
    const contactModal = document.getElementById('contactModal');
    if (contactModal) {
        contactModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function submitContactForm(event) {
    event.preventDefault();
    
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const subject = document.getElementById('contactSubject').value;
    const message = document.getElementById('contactMessage').value;
    
    if (!name || !email || !subject || !message) {
        showNotification('❌ Preencha todos os campos do formulário');
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('❌ Digite um email válido');
        return;
    }
    
    // Salvar contato no localStorage
    const contactData = {
        name: name,
        email: email,
        subject: subject,
        message: message,
        date: new Date().toISOString(),
        userId: currentUser ? currentUser.id : 'guest'
    };
    
    let contacts = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    contacts.push(contactData);
    localStorage.setItem('contactMessages', JSON.stringify(contacts));
    
    showNotification('📧 Mensagem enviada com sucesso! Entraremos em contato em breve.');
    
    // Limpar formulário
    document.getElementById('contactForm').reset();
    closeContactModal();
}

function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// =============================================
// FUNÇÃO DE NOTIFICAÇÃO
// =============================================
function showNotification(message, type = 'success') {
    // Remover notificações existentes
    const existingNotifications = document.querySelectorAll('.custom-notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    
    const icon = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    const notificationHTML = `
        <div class="custom-notification" style="background: ${colors[type] || colors.info};">
            <div class="notification-content">
                <span>${icon[type] || 'ℹ️'}</span>
                <span>${message}</span>
            </div>
            <button onclick="this.parentElement.remove()">×</button>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', notificationHTML);
    
    // Auto-remove após 5 segundos
    setTimeout(() => {
        const notification = document.querySelector('.custom-notification');
        if (notification) {
            notification.style.transition = 'opacity 0.3s';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// =============================================
// FUNÇÕES AUXILIARES
// =============================================
function scrollToGenerator() {
    const generatorSection = document.getElementById('generator');
    if (generatorSection) {
        generatorSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function handleVideoError() {
    const videoFallback = document.getElementById('videoFallback');
    const videoWrapper = document.getElementById('videoWrapper');
    
    if (videoFallback && videoWrapper) {
        videoWrapper.style.display = 'none';
        videoFallback.style.display = 'block';
    }
}

// =============================================
// FUNÇÃO DE VISUALIZAÇÃO SEGURA (CORRIGIDA)
// =============================================
function openSecurePreview() {
    if (!currentUser) {
        showNotification('🔐 Faça login para visualizar contratos');
        showLoginModal();
        return;
    }
    
    // Validar dados antes de gerar
    const validationErrors = validateContractData();
    if (validationErrors.length > 0) {
        showNotification(`❌ Corrija os seguintes campos: ${validationErrors.join(', ')}`);
        return;
    }
    
    try {
        // Mostrar loading
        const previewBtn = document.getElementById('previewBtn');
        const originalText = previewBtn.querySelector('#previewText')?.textContent || 'Visualizar Gratuitamente';
        previewBtn.querySelector('#previewText').textContent = 'Abrindo visualização...';
        previewBtn.disabled = true;

        // Coletar dados do contrato
        const contractData = collectContractData();
        
        // Abrir em nova aba
        const contractHTML = generateProfessionalContractPlus();
        const newWindow = window.open('', '_blank');
        
        if (newWindow) {
            newWindow.document.write(contractHTML);
            newWindow.document.close();
            newWindow.document.title = 'Visualização do Contrato - ContratoFácil';
        }

        showNotification('✅ Visualização segura aberta em nova aba');

        // Restaurar botão
        if (previewBtn) {
            setTimeout(() => {
                previewBtn.querySelector('#previewText').textContent = originalText;
                previewBtn.disabled = false;
            }, 1000);
        }
        
    } catch (error) {
        console.error('Erro ao abrir visualização segura:', error);
        showNotification('❌ Erro ao abrir visualização segura');
        
        // Restaurar botão em caso de erro
        const previewBtn = document.getElementById('previewBtn');
        if (previewBtn) {
            previewBtn.querySelector('#previewText').textContent = 'Visualizar Gratuitamente';
            previewBtn.disabled = false;
        }
    }
}

// =============================================
// INICIALIZAÇÕES PARA MOBILE
// =============================================
function initMobileCorrections() {
    // Corrigir bug do zoom out
    document.addEventListener('touchstart', function(e) {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
    
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(e) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Corrigir layout do gerador em mobile
    function fixMobileLayout() {
        if (window.innerWidth <= 768) {
            const generatorContainer = document.querySelector('.generator-container');
            if (generatorContainer) {
                generatorContainer.style.display = 'flex';
                generatorContainer.style.flexDirection = 'column';
            }
            
            // Corrigir preview para mobile
            const contractPreview = document.getElementById('contractPreview');
            if (contractPreview) {
                contractPreview.style.width = '100%';
                contractPreview.style.minWidth = '100%';
                contractPreview.style.fontSize = '13px';
            }
        }
    }
    
    fixMobileLayout();
    window.addEventListener('resize', fixMobileLayout);
}

function initMobileTouchFix() {
    // Prevenir zoom em inputs
    document.addEventListener('touchstart', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
            e.target.style.fontSize = '16px';
        }
    });
    
    // Restaurar tamanho da fonte após sair do input
    document.addEventListener('touchend', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
            setTimeout(() => {
                e.target.style.fontSize = '';
            }, 1000);
        }
    });
}

function fixMobileContractView() {
    if (window.innerWidth <= 768) {
        const contractPreview = document.getElementById('contractPreview');
        if (contractPreview) {
            contractPreview.style.transform = 'none';
            contractPreview.style.marginLeft = '0';
            contractPreview.style.width = '100%';
        }
    }
}

// =============================================
// EXPORTAÇÕES PARA O HTML
// =============================================
window.checkUserLogin = checkUserLogin;
window.handleGoogleSignIn = handleGoogleSignIn;
window.showLoginModal = showLoginModal;
window.closeLoginModal = closeLoginModal;
window.signOut = signOut;
window.setTodayDate = setTodayDate;
window.updatePreview = updatePreview;
window.openSecurePreview = openSecurePreview;
window.generateWordPlus = generateWordPlus;
window.scrollToGenerator = scrollToGenerator;
window.openPaymentModal = openPaymentModal;
window.closePaymentModal = closePaymentModal;
window.selectPayment = selectPayment;
window.showContactModal = showContactModal;
window.closeContactModal = closeContactModal;
window.submitContactForm = submitContactForm;
window.toggleFAQ = toggleFAQ;
window.selectSignatureOption = selectSignatureOption;
window.clearSignature = clearSignature;
window.confirmSignature = confirmSignature;
window.handleVideoError = handleVideoError;

// =============================================
// INICIALIZAR CORREÇÕES MOBILE
// =============================================
initMobileCorrections();
initMobileTouchFix();

console.log('✅ script.js com download duplo (imagem + word) carregado!');
