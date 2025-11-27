// =============================================
// VARIÁVEIS GLOBAIS E INICIALIZAÇÃO
// =============================================

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

// Estado do usuário
let currentUser = null;

// Inicialização quando DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    updatePreview();
    initSignatureSystem();
    checkUserLogin();
    
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

// =============================================
// SISTEMA DE LOGIN E AUTENTICAÇÃO
// =============================================

// Verificar se usuário está logado
function checkUserLogin() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIAfterLogin();
    } else {
        updateUIAfterLogout();
    }
}

// Função para processar login do Google
function handleGoogleSignIn(response) {
    console.log('Google Sign-In response:', response);
    
    try {
        // Decodifica o JWT para obter os dados do usuário
        const userData = parseJwt(response.credential);
        
        // Salva os dados do usuário
        currentUser = {
            id: userData.sub,
            name: userData.name,
            email: userData.email,
            picture: userData.picture,
            plan: 'free',
            contractsGenerated: 0,
            remainingContracts: 3,
            trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            joinDate: new Date().toISOString()
        };
        
        // Salva no localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Atualiza a UI
        updateUIAfterLogin();
        
        // Fecha o modal
        closeLoginModal();
        
        showNotification('🎉 Login realizado com sucesso!');
        
    } catch (error) {
        console.error('Erro no login:', error);
        showNotification('❌ Erro ao fazer login. Tente novamente.');
    }
}

// Função para decodificar JWT
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error parsing JWT:', error);
        throw new Error('Token inválido');
    }
}

// Atualizar UI após login
function updateUIAfterLogin() {
    if (!currentUser) return;
    
    // Atualizar header
    const loginButton = document.getElementById('loginButton');
    const userButton = document.getElementById('userButton');
    const userNav = document.getElementById('userNav');
    
    if (loginButton) loginButton.style.display = 'none';
    if (userButton) userButton.style.display = 'inline-block';
    if (userNav) userNav.style.display = 'list-item';
    
    // Atualizar nome do usuário no header
    const userNameNav = document.getElementById('userNameNav');
    if (userNameNav) {
        userNameNav.textContent = currentUser.name.split(' ')[0];
    }
    
    // Atualizar seções principais
    const loginSection = document.getElementById('loginSection');
    const userSection = document.getElementById('userSection');
    const loginRequired = document.getElementById('loginRequired');
    const generatorForm = document.getElementById('generatorForm');
    
    if (loginSection) loginSection.style.display = 'none';
    if (userSection) userSection.style.display = 'block';
    if (loginRequired) loginRequired.style.display = 'none';
    if (generatorForm) generatorForm.style.display = 'block';
    
    // Atualizar dashboard do usuário
    updateUserDashboard();
}

// Atualizar UI após logout
function updateUIAfterLogout() {
    // Atualizar header
    const loginButton = document.getElementById('loginButton');
    const userButton = document.getElementById('userButton');
    const userNav = document.getElementById('userNav');
    
    if (loginButton) loginButton.style.display = 'inline-block';
    if (userButton) userButton.style.display = 'none';
    if (userNav) userNav.style.display = 'none';
    
    // Atualizar seções principais
    const loginSection = document.getElementById('loginSection');
    const userSection = document.getElementById('userSection');
    const loginRequired = document.getElementById('loginRequired');
    const generatorForm = document.getElementById('generatorForm');
    
    if (loginSection) loginSection.style.display = 'block';
    if (userSection) userSection.style.display = 'none';
    if (loginRequired) loginRequired.style.display = 'block';
    if (generatorForm) generatorForm.style.display = 'none';
}

// Atualizar dashboard do usuário
function updateUserDashboard() {
    if (!currentUser) return;
    
    // Atualizar avatar
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar && currentUser.picture) {
        userAvatar.src = currentUser.picture;
        userAvatar.onerror = function() {
            this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiMyYzlhYTAiLz4KPHBhdGggZD0iTTQwIDQ0QzQ2LjYgNDQgNTIgMzguNiA1MiAzMkM1MiAyNS40IDQ2LjYgMjAgNDAgMjBDMzMuNCAyMCAyOCAyNS40IDI4IDMyQzI4IDM4LjYgMzMuNCA0NCA0MCA0NFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yOCA1MkMyOCA1OC42IDMzLjQgNjQgNDAgNjRDNDYuNiA2NCA1MiA1OC42IDUyIDUyVjUySDI4VjUyWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+';
        };
    }
    
    // Atualizar nome e email
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    if (userName) userName.textContent = currentUser.name;
    if (userEmail) userEmail.textContent = currentUser.email;
    
    // Atualizar informações do plano
    updatePlanInfo();
}

// Atualizar informações do plano
function updatePlanInfo() {
    if (!currentUser) return;
    
    const userPlan = document.getElementById('userPlan');
    const planExpiry = document.getElementById('planExpiry');
    const contractsCount = document.getElementById('contractsCount');
    const remainingContracts = document.getElementById('remainingContracts');
    const daysLeft = document.getElementById('daysLeft');
    
    if (userPlan) {
        userPlan.textContent = currentUser.plan === 'free' ? 'Plano Gratuito' : 
                              currentUser.plan === 'basico' ? 'Plano Básico' : 'Plano Profissional';
        
        // Cor do badge conforme o plano
        userPlan.className = 'plan-badge ' + currentUser.plan;
    }
    
    if (planExpiry && currentUser.trialEndDate) {
        const endDate = new Date(currentUser.trialEndDate);
        const today = new Date();
        const diffTime = endDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 0) {
            planExpiry.textContent = `Expira em ${diffDays} dias`;
            planExpiry.style.color = 'var(--success)';
        } else {
            planExpiry.textContent = 'Expirado';
            planExpiry.style.color = 'var(--danger)';
        }
    }
    
    if (contractsCount) {
        contractsCount.textContent = currentUser.contractsGenerated || 0;
    }
    
    if (remainingContracts) {
        const remaining = currentUser.plan === 'free' ? 
                         (currentUser.remainingContracts || 0) :
                         currentUser.plan === 'basico' ? 5 : 'Ilimitado';
        remainingContracts.textContent = remaining;
    }
    
    if (daysLeft && currentUser.trialEndDate) {
        const endDate = new Date(currentUser.trialEndDate);
        const today = new Date();
        const diffTime = endDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        daysLeft.textContent = Math.max(0, diffDays);
    }
}

// Funções do Modal de Login
function showLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function showUserMenu() {
    showNotification(`👋 Olá, ${currentUser.name.split(' ')[0]}!`);
}

// Função de Logout
function signOut() {
    // Limpar dados do usuário
    currentUser = null;
    localStorage.removeItem('currentUser');
    
    // Fazer logout do Google
    if (window.google && google.accounts && google.accounts.id) {
        google.accounts.id.disableAutoSelect();
    }
    
    // Atualizar UI
    updateUIAfterLogout();
    
    showNotification('👋 Logout realizado com sucesso!');
}

// Verificar se usuário pode gerar contrato
function canGenerateContract() {
    if (!currentUser) {
        showNotification('❌ Faça login para gerar contratos');
        showLoginModal();
        return false;
    }
    
    // Verificar se ainda tem contratos disponíveis
    if (currentUser.plan === 'free' && currentUser.remainingContracts <= 0) {
        showNotification('❌ Você atingiu o limite de contratos do plano gratuito');
        openPaymentModal('basico');
        return false;
    }
    
    // Verificar se o trial não expirou
    if (currentUser.plan === 'free' && currentUser.trialEndDate) {
        const endDate = new Date(currentUser.trialEndDate);
        const today = new Date();
        if (today > endDate) {
            showNotification('❌ Seu período de teste expirou. Faça upgrade!');
            openPaymentModal('basico');
            return false;
        }
    }
    
    return true;
}

// Função para incrementar contador de contratos
function incrementContractCount() {
    if (!currentUser) return;
    
    currentUser.contractsGenerated = (currentUser.contractsGenerated || 0) + 1;
    
    if (currentUser.plan === 'free') {
        currentUser.remainingContracts = Math.max(0, (currentUser.remainingContracts || 3) - 1);
    }
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updatePlanInfo();
}

// =============================================
// SISTEMA DE PLANOS REAIS
// =============================================

// Atualizar plano do usuário
function updateUserPlan(planType) {
    if (!currentUser) return;
    
    currentUser.plan = planType;
    
    // Configurar limites conforme o plano
    switch(planType) {
        case 'free':
            currentUser.remainingContracts = 3;
            currentUser.trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
            break;
        case 'basico':
            currentUser.remainingContracts = 5;
            currentUser.trialEndDate = null;
            break;
        case 'profissional':
            currentUser.remainingContracts = 999;
            currentUser.trialEndDate = null;
            break;
    }
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updatePlanInfo();
    
    showNotification(`🎉 Plano atualizado para ${planType === 'basico' ? 'Básico' : 'Profissional'}!`);
}

// =============================================
// FUNÇÕES DO SISTEMA PRINCIPAL
// =============================================

// Mobile Menu Toggle
function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
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

    if (!file.type.match('image.*')) {
        showNotification('❌ Por favor, selecione uma imagem válida');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = 300;
            tempCanvas.height = 100;
            
            tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
            
            if (type === 'contractor') {
                contractorSignature = tempCanvas.toDataURL();
            } else {
                contractedSignature = tempCanvas.toDataURL();
            }
            
            updateSignaturePreview(type);
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
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
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
    document.querySelectorAll('.signature-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    event.target.closest('.signature-option').classList.add('selected');
    
    if (method === 'upload') {
        document.getElementById(`${type}SignatureUpload`).click();
    } else {
        const canvas = document.getElementById(`${type}SignatureDraw`);
        if (canvas) {
            canvas.style.display = 'block';
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
        const canvas = document.getElementById(`${type}SignatureDraw`);
        if (canvas) {
            signatureData = canvas.toDataURL();
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
    const drawCanvas = document.getElementById(`${type}SignatureDraw`);
    if (drawCanvas) {
        const ctx = drawCanvas.getContext('2d');
        ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
        drawCanvas.style.display = 'none';
    }
    
    const uploadInput = document.getElementById(`${type}SignatureUpload`);
    if (uploadInput) {
        uploadInput.value = '';
    }
    
    const preview = document.getElementById(`${type}SignaturePreview`);
    if (preview) {
        preview.innerHTML = '<p style="color: #666;">Assinatura aparecerá aqui</p>';
    }
    
    const confirmation = document.getElementById(`${type}SignatureConfirmation`);
    if (confirmation) {
        confirmation.style.display = 'none';
    }
    
    document.querySelectorAll('.signature-option').forEach(option => {
        option.classList.remove('selected');
    });
    
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
    
    if (activeFAQ && activeFAQ !== item) {
        activeFAQ.classList.remove('active');
    }
    
    item.classList.toggle('active');
    
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
        console.error('Erro ao converter valor:', e);
        return '_________________________';
    }
}

// =============================================
// VALIDAÇÕES AVANÇADAS
// =============================================

// Validar dados do contrato antes de gerar
function validateContractData() {
    const requiredFields = {
        'contractorName': 'Nome do Contratante',
        'contractorDoc': 'CPF/CNPJ do Contratante', 
        'contractedName': 'Nome do Contratado',
        'contractedDoc': 'CPF/CNPJ do Contratado',
        'serviceDescription': 'Descrição do Serviço',
        'serviceValue': 'Valor do Serviço',
        'startDate': 'Data de Início',
        'contractCity': 'Cidade de Vigência'
    };

    const errors = [];
    
    for (const [fieldId, fieldName] of Object.entries(requiredFields)) {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
            errors.push(fieldName);
            if (field) {
                field.style.borderColor = 'var(--danger)';
            }
        } else if (field) {
            field.style.borderColor = '#e0e0e0';
        }
    }

    // Validação específica de CPF/CNPJ
    const contractorDoc = document.getElementById('contractorDoc')?.value;
    const contractedDoc = document.getElementById('contractedDoc')?.value;
    
    if (contractorDoc && !validateCPFCNPJ(contractorDoc)) {
        errors.push('CPF/CNPJ do Contratante inválido');
    }
    
    if (contractedDoc && !validateCPFCNPJ(contractedDoc)) {
        errors.push('CPF/CNPJ do Contratado inválido');
    }

    return errors;
}

// Validar CPF/CNPJ
function validateCPFCNPJ(doc) {
    const cleanDoc = doc.replace(/\D/g, '');
    
    if (cleanDoc.length === 11) {
        return validateCPF(cleanDoc);
    } else if (cleanDoc.length === 14) {
        return validateCNPJ(cleanDoc);
    }
    
    return false;
}

// Validação de CPF
function validateCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpf)) return false;

    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
        sum = sum + parseInt(cpf.substring(i-1, i)) * (11 - i);
    }
    
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum = sum + parseInt(cpf.substring(i-1, i)) * (12 - i);
    }
    
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
}

// Validação de CNPJ
function validateCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, '');
    if (cnpj.length !== 14) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cnpj)) return false;

    let size = cnpj.length - 2;
    let numbers = cnpj.substring(0, size);
    const digits = cnpj.substring(size);
    let sum = 0;
    let pos = size - 7;

    for (let i = size; i >= 1; i--) {
        sum += numbers.charAt(size - i) * pos--;
        if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (result !== parseInt(digits.charAt(0))) return false;

    size = size + 1;
    numbers = cnpj.substring(0, size);
    sum = 0;
    pos = size - 7;

    for (let i = size; i >= 1; i--) {
        sum += numbers.charAt(size - i) * pos--;
        if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (result !== parseInt(digits.charAt(1))) return false;

    return true;
}

// =============================================
// CONTRATO PROFISSIONAL PLUS - GERADOR MELHORADO
// =============================================

// Função para gerar o contrato PROFISSIONAL PLUS
function generateProfessionalContractPlus() {
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

    // Calcular prazo em dias
    const calculateDays = () => {
        if (!startDate || !endDate) return '______';
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays.toString();
        } catch (e) {
            return '______';
        }
    };

    // Data atual por extenso
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = getMonthName(currentDate.getMonth());
    const year = currentDate.getFullYear();

    // Construir o contrato PROFISSIONAL PLUS
    const contractHTML = `
        <div class="contract-header">
            <div class="contract-title">CONTRATO DE PRESTAÇÃO DE SERVIÇOS</div>
            <div class="contract-subtitle">Instrumento Jurídico Particular</div>
        </div>
        
        <div class="contract-body">
            <!-- CLÁUSULA 1 - IDENTIFICAÇÃO DAS PARTES -->
            <div class="contract-clause">
                <h4>CLÁUSULA PRIMEIRA - DAS PARTES CONTRATANTES</h4>
                <p><strong>CONTRATANTE:</strong> ${contractorName}, ${contractorCivilState}, ${contractorProfession}, portador(a) do ${contractorDoc.length === 11 ? 'CPF' : 'CNPJ'} nº ${contractorDoc}, residente e domiciliado(a) na ${contractorAddress}.</p>
                <p><strong>CONTRATADO(A):</strong> ${contractedName}, ${contractedCivilState}, ${contractedProfession}, portador(a) do ${contractedDoc.length === 11 ? 'CPF' : 'CNPJ'} nº ${contractedDoc}, residente e domiciliado(a) na ${contractedAddress}.</p>
            </div>

            <!-- CLÁUSULA 2 - DEFINIÇÕES -->
            <div class="contract-clause">
                <h4>CLÁUSULA SEGUNDA - DEFINIÇÕES E INTERPRETAÇÃO</h4>
                <p>Para os efeitos deste instrumento, consideram-se:</p>
                <ol>
                    <li><strong>Serviços:</strong> atividades descritas na Cláusula Terceira;</li>
                    <li><strong>Prazo de Execução:</strong> período para realização dos serviços;</li>
                    <li><strong>Entregáveis:</strong> produtos ou resultados dos serviços;</li>
                    <li><strong>Valor Contratual:</strong> contraprestação pelos serviços.</li>
                </ol>
            </div>

            <!-- CLÁUSULA 3 - OBJETO -->
            <div class="contract-clause">
                <h4>CLÁUSULA TERCEIRA - DO OBJETO CONTRATUAL</h4>
                <p>Constitui objeto do presente contrato a prestação dos seguintes serviços: <strong>${serviceDescription}</strong>.</p>
                <p><strong>Especificações Técnicas:</strong> Os serviços serão executados conforme padrões técnicos e de qualidade do mercado, observadas as melhores práticas da atividade.</p>
            </div>

            <!-- CLÁUSULA 4 - PRAZOS -->
            <div class="contract-clause">
                <h4>CLÁUSULA QUARTA - DOS PRAZOS E ENTREGÁVEIS</h4>
                <p><strong>4.1.</strong> O prazo para execução dos serviços é de <strong>${calculateDays()}</strong> dias, iniciando-se em <strong>${formatDate(startDate)}</strong> e terminando em <strong>${formatDate(endDate)}</strong>.</p>
                <p><strong>4.2.</strong> Os prazos poderão ser prorrogados mediante acordo escrito entre as partes, desde que justificado por motivos de força maior ou caso fortuito.</p>
                <p><strong>4.3.</strong> Considera-se entregue o serviço mediante aceitação formal pelo CONTRATANTE, que se manifestará no prazo de 5 (cinco) dias úteis.</p>
            </div>

            <!-- CLÁUSULA 5 - VALOR E PAGAMENTO -->
            <div class="contract-clause">
                <h4>CLÁUSULA QUINTA - DO VALOR E CONDIÇÕES DE PAGAMENTO</h4>
                <p><strong>5.1.</strong> Pelo fiel cumprimento deste contrato, o CONTRATANTE pagará ao CONTRATADO(A) a importância de <strong>R$ ${serviceValue}</strong> (${valorExtenso}).</p>
                <p><strong>5.2.</strong> O pagamento será efetuado mediante: <strong>${paymentMethodText}</strong>.</p>
                <p><strong>5.3.</strong> O CONTRATADO(A) obriga-se a emitir nota fiscal ou recibo correspondente, arcando com todos os tributos incidentes sobre a operação.</p>
                <p><strong>5.4.</strong> Em caso de atraso no pagamento, incidirá multa moratória de 2% (dois por cento) sobre o valor devido, mais juros de 1% (um por cento) ao mês.</p>
            </div>

            <!-- CLÁUSULA 6 - OBRIGAÇÕES DO CONTRATADO -->
            <div class="contract-clause">
                <h4>CLÁUSULA SEXTA - DAS OBRIGAÇÕES DO CONTRATADO</h4>
                <p>O CONTRATADO(A) obriga-se a:</p>
                <ol>
                    <li>Executar os serviços com zelo, diligência e capacidade técnica adequada;</li>
                    <li>Cumprir rigorosamente os prazos estabelecidos;</li>
                    <li>Fornecer todos os materiais, equipamentos e recursos necessários, salvo estipulação em contrário;</li>
                    <li>Comunicar imediatamente qualquer impedimento para o cumprimento do objeto;</li>
                    <li>Emitir documentação fiscal correspondente;</li>
                    <li>Manter sigilo absoluto sobre informações confidenciais;</li>
                    <li>Prestar contas detalhadas dos recursos eventualmente adiantados;</li>
                    <li>Cumprir todas as normas técnicas e legais aplicáveis à atividade.</li>
                </ol>
            </div>

            <!-- CLÁUSULA 7 - OBRIGAÇÕES DO CONTRATANTE -->
            <div class="contract-clause">
                <h4>CLÁUSULA SÉTIMA - DAS OBRIGAÇÕES DO CONTRATANTE</h4>
                <p>O CONTRATANTE obriga-se a:</p>
                <ol>
                    <li>Fornecer todas as informações necessárias para a execução dos serviços;</li>
                    <li>Colaborar com o CONTRATADO(A) para o bom andamento dos trabalhos;</li>
                    <li>Efetuar o pagamento nos prazos e condições ajustados;</li>
                    <li>Fornecer ambiente adequado quando necessário para a execução;</li>
                    <li>Manter sigilo sobre informações técnicas e comerciais do CONTRATADO(A);</li>
                    <li>Manifestar-se sobre a aceitação dos serviços no prazo estabelecido.</li>
                </ol>
            </div>

            <!-- CLÁUSULA 8 - CONFIDENCIALIDADE -->
            <div class="contract-clause">
                <h4>CLÁUSULA OITAVA - DA CONFIDENCIALIDADE</h4>
                <p><strong>8.1.</strong> As partes obrigam-se a manter estrito sigilo sobre todas as informações confidenciais a que tiverem acesso, inclusive após o término do contrato.</p>
                <p><strong>8.2.</strong> A obrigação de confidencialidade permanecerá por prazo indeterminado, aplicando-se multa de 50% (cinquenta por cento) do valor do contrato em caso de violação.</p>
            </div>

            <!-- CLÁUSULA 9 - PROPRIEDADE INTELECTUAL -->
            <div class="contract-clause">
                <h4>CLÁUSULA NONA - DA PROPRIEDADE INTELECTUAL</h4>
                <p><strong>9.1.</strong> Todos os direitos de propriedade intelectual relativos aos serviços prestados serão de propriedade exclusiva do CONTRATANTE, após o pagamento integral.</p>
                <p><strong>9.2.</strong> O CONTRATADO(A) cede desde já todos os direitos autorais e de propriedade industrial sobre os trabalhos desenvolvidos.</p>
            </div>

            <!-- CLÁUSULA 10 - GARANTIAS -->
            <div class="contract-clause">
                <h4>CLÁUSULA DÉCIMA - DAS GARANTIAS</h4>
                <p><strong>10.1.</strong> O CONTRATADO(A) garante a qualidade dos serviços e obriga-se a reparar, sem custo adicional, quaisquer vícios ou defeitos apontados no prazo de 30 (trinta) dias.</p>
                <p><strong>10.2.</strong> A garantia cobre todos os vícios aparentes e ocultos, exceto os decorrentes de uso inadequado pelo CONTRATANTE.</p>
            </div>

            <!-- CLÁUSULA 11 - RESCISÃO -->
            <div class="contract-clause">
                <h4>CLÁUSULA DÉCIMA PRIMEIRA - DA RESCISÃO CONTRATUAL</h4>
                <p>Este contrato poderá ser rescindido nas seguintes hipóteses:</p>
                <ol>
                    <li>Por mútuo acordo entre as partes;</li>
                    <li>Por inadimplemento de qualquer obrigação assumida;</li>
                    <li>Por força maior ou caso fortuito que impossibilite o cumprimento;</li>
                    <li>Por iniciativa unilateral, mediante aviso prévio de 30 (trinta) dias;</li>
                    <li>Por falência, insolvência ou dissolução de qualquer das partes.</li>
                </ol>
            </div>

            <!-- CLÁUSULA 12 - MULTAS E INDENIZAÇÕES -->
            <div class="contract-clause">
                <h4>CLÁUSULA DÉCIMA SEGUNDA - DAS MULTAS E INDENIZAÇÕES</h4>
                <p><strong>12.1.</strong> Em caso de descumprimento de prazos, o CONTRATADO(A) pagará multa de 2% (dois por cento) por dia de atraso, limitada a 20% (vinte por cento) do valor do contrato.</p>
                <p><strong>12.2.</strong> Por descumprimento de qualquer obrigação, a parte inadimplente pagará multa compensatória de 10% (dez por cento) do valor total, sem prejuízo de perdas e danos.</p>
            </div>

            <!-- CLÁUSULA 13 - LIMITAÇÃO DE RESPONSABILIDADE -->
            <div class="contract-clause">
                <h4>CLÁUSULA DÉCIMA TERCEIRA - LIMITAÇÃO DE RESPONSABILIDADE</h4>
                <p><strong>13.1.</strong> A responsabilidade total do CONTRATADO(A) por quaisquer danos diretos ficará limitada ao valor total deste contrato.</p>
                <p><strong>13.2.</strong> As partes excluem reciprocamente a responsabilidade por danos indiretos, lucros cessantes ou danos emergentes.</p>
            </div>

            <!-- CLÁUSULA 14 - NÃO VÍNCULO EMPREGATÍCIO -->
            <div class="contract-clause">
                <h4>CLÁUSULA DÉCIMA QUARTA - NÃO CONSTITUIÇÃO DE VÍNCULO EMPREGATÍCIO</h4>
                <p><strong>14.1.</strong> Fica expressamente estabelecido que não há qualquer vínculo empregatício entre as partes, sendo este contrato de natureza estritamente civil-comercial.</p>
                <p><strong>14.2.</strong> O CONTRATADO(A) atua como profissional autônomo, responsável por seus próprios encargos tributários e previdenciários.</p>
            </div>

            <!-- CLÁUSULA 15 - FORÇA MAIOR -->
            <div class="contract-clause">
                <h4>CLÁUSULA DÉCIMA QUINTA - CASO FORTUITO E FORÇA MAIOR</h4>
                <p><strong>15.1.</strong> As partes estarão isentas de responsabilidade pelo não cumprimento das obrigações quando decorrente de caso fortuito ou força maior.</p>
                <p><strong>15.2.</strong> Consideram-se caso fortuito ou força maior: catástrofes naturais, guerras, atos de autoridade, greves, pandemias e outros eventos imprevisíveis.</p>
            </div>

            <!-- CLÁUSULA 16 - ELEIÇÃO DE FORO -->
            <div class="contract-clause">
                <h4>CLÁUSULA DÉCIMA SEXTA - DO FORO</h4>
                <p>Para dirimir quaisquer controvérsias decorrentes deste contrato, as partes elegem o foro da comarca de <strong>${contractCity}</strong>, com expressa renúncia a qualquer outro, por mais privilegiado que seja.</p>
            </div>

            <!-- CLÁUSULA 17 - DISPOSIÇÕES GERAIS -->
            <div class="contract-clause">
                <h4>CLÁUSULA DÉCIMA SÉTIMA - DISPOSIÇÕES GERAIS</h4>
                <p><strong>17.1.</strong> As eventuais alterações neste contrato somente produzirão efeitos se realizadas por escrito e assinadas por ambas as partes.</p>
                <p><strong>17.2.</strong> A tolerância de qualquer das partes quanto ao descumprimento de obrigação não importará em novação ou renúncia de direitos.</p>
                <p><strong>17.3.</strong> As cláusulas deste contrato são independentes, de modo que a nulidade de uma não afetará as demais.</p>
            </div>

            <!-- ÁREA DE ASSINATURAS MELHORADA -->
            <div class="signature-area">
                <p>E por estarem assim justos e contratados, firmam o presente instrumento em duas vias de igual teor e forma, para um único efeito, na presença das testemunhas abaixo.</p>
                
                <div class="signature-line-improved">
                    <div class="signature-box-improved">
                        <p><strong>${contractCity}</strong>, ${day} de ${month} de ${year}.</p>
                        <div class="signature-space"></div>
                        ${contractorSignature ? `
                            <div style="text-align: center; margin: 10px 0;">
                                <img src="${contractorSignature}" style="max-width: 200px; max-height: 60px; border: 1px solid #ddd;">
                                <p style="font-size: 0.8rem; color: #666; margin-top: 5px;">Assinatura digital do CONTRATANTE</p>
                            </div>
                        ` : '<div style="height: 80px; margin: 10px 0; border-bottom: 1px solid #000;"></div>'}
                        <div class="signature-name">${contractorName}</div>
                        <div class="signature-role">CONTRATANTE</div>
                        <div class="signature-document">${contractorDoc.length === 11 ? 'CPF' : 'CNPJ'}: ${contractorDoc}</div>
                        
                        <!-- Testemunha 1 -->
                        <div style="margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px;">
                            <div style="height: 60px; border-bottom: 1px solid #000;"></div>
                            <div class="signature-name">_________________________</div>
                            <div class="signature-role">Testemunha</div>
                            <div class="signature-document">CPF: __________________</div>
                        </div>
                    </div>
                    
                    <div class="signature-box-improved">
                        <p>&nbsp;</p>
                        <div class="signature-space"></div>
                        ${contractedSignature ? `
                            <div style="text-align: center; margin: 10px 0;">
                                <img src="${contractedSignature}" style="max-width: 200px; max-height: 60px; border: 1px solid #ddd;">
                                <p style="font-size: 0.8rem; color: #666; margin-top: 5px;">Assinatura digital do CONTRATADO(A)</p>
                            </div>
                        ` : '<div style="height: 80px; margin: 10px 0; border-bottom: 1px solid #000;"></div>'}
                        <div class="signature-name">${contractedName}</div>
                        <div class="signature-role">CONTRATADO(A)</div>
                        <div class="signature-document">${contractedDoc.length === 11 ? 'CPF' : 'CNPJ'}: ${contractedDoc}</div>
                        
                        <!-- Testemunha 2 -->
                        <div style="margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px;">
                            <div style="height: 60px; border-bottom: 1px solid #000;"></div>
                            <div class="signature-name">_________________________</div>
                            <div class="signature-role">Testemunha</div>
                            <div class="signature-document">CPF: __________________</div>
                        </div>
                    </div>
                </div>

                <!-- RODAPÉ PROFISSIONAL -->
                <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #000; text-align: center; font-size: 0.8rem; color: #666;">
                    <p><strong>Contrato gerado eletronicamente por ContratoFácil</strong></p>
                    <p>Documento juridicamente válido - Processo nº: CF${Date.now().toString().slice(-8)}</p>
                    <p>Data e hora da geração: ${new Date().toLocaleString('pt-BR')}</p>
                </div>
            </div>
        </div>
    `;
    
    return contractHTML;
}

// =============================================
// ATUALIZAR FUNÇÃO PRINCIPAL DE PREVIEW
// =============================================

// Update contract preview - USAR ESTA VERSÃO MELHORADA
function updatePreview() {
    try {
        const contractPreview = document.getElementById('contractPreview');
        if (contractPreview) {
            contractPreview.innerHTML = generateProfessionalContractPlus();
        }
    } catch (error) {
        console.error('Erro ao atualizar preview:', error);
        showNotification('❌ Erro ao atualizar visualização do contrato');
    }
}

// =============================================
// SISTEMA DE PAGAMENTO INTEGRADO
// =============================================

// Payment modal functions
function openPaymentModal(plan) {
    if (plan !== 'avulsa' && !currentUser) {
        showNotification('❌ Faça login para assinar um plano');
        showLoginModal();
        return;
    }
    
    // Validar dados para contrato avulso
    if (plan === 'avulsa') {
        const validationErrors = validateContractData();
        if (validationErrors.length > 0) {
            showNotification(`❌ Preencha corretamente: ${validationErrors.join(', ')}`);
            
            // Scroll para o primeiro campo com erro
            const firstErrorField = document.getElementById(Object.keys(validationErrors)[0]);
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstErrorField.focus();
            }
            return;
        }
    }
    
    selectedPlan = plan;
    
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
        let description = '';
        let pixUrl = '#';
        let cardUrl = '#';
        
        switch(plan) {
            case 'free':
                modalTitle.textContent = 'Teste Grátis - 7 Dias';
                description = 'Plano Teste Grátis - 3 contratos profissionais por 7 dias';
                modalPrice.textContent = 'Total: R$ 0,00 (Após 7 dias: R$ 10,99/mês)';
                price = '0,00';
                break;
            case 'avulsa':
                modalTitle.textContent = 'Comprar Contrato Avulso';
                description = '1 Contrato de Prestação de Serviços Personalizado';
                modalPrice.textContent = 'Total: R$ 6,99';
                price = '6,99';
                pixUrl = 'https://mpago.la/1FgMNje';
                cardUrl = 'https://mpago.la/1FgMNje';
                break;
            case 'basico':
                modalTitle.textContent = 'Assinar Plano Básico';
                description = 'Plano Básico - 5 contratos por mês';
                modalPrice.textContent = 'Total: R$ 9,99/mês';
                price = '9,99';
                pixUrl = 'https://mpago.li/1LcKs1M';
                cardUrl = 'https://mpago.li/1LcKs1M';
                break;
            case 'profissional':
                modalTitle.textContent = 'Assinar Plano Profissional';
                description = 'Plano Profissional - Contratos ilimitados';
                modalPrice.textContent = 'Total: R$ 29,99/mês';
                price = '29,99';
                pixUrl = 'https://mpago.li/1xTcy3g';
                cardUrl = 'https://mpago.li/1xTcy3g';
                break;
        }
        
        modalPlanDescription.textContent = description;
        
        // Atualizar links de pagamento
        if (pixValue) pixValue.textContent = `R$ ${price}`;
        if (cardValue) cardValue.textContent = `R$ ${price}`;
        if (pixLink) {
            pixLink.href = pixUrl;
            pixLink.onclick = function() {
                if (plan !== 'avulsa') {
                    setTimeout(() => {
                        updateUserPlan(plan);
                        showNotification(`🎉 Plano ${plan} ativado com sucesso!`);
                    }, 2000);
                }
                return true;
            };
        }
        if (cardLink) {
            cardLink.href = cardUrl;
            cardLink.onclick = function() {
                if (plan !== 'avulsa') {
                    setTimeout(() => {
                        updateUserPlan(plan);
                        showNotification(`🎉 Plano ${plan} ativado com sucesso!`);
                    }, 2000);
                }
                return true;
            };
        }
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
        
        const pixDetails = document.getElementById('pixDetails');
        const cardDetails = document.getElementById('cardDetails');
        if (pixDetails) pixDetails.style.display = 'none';
        if (cardDetails) cardDetails.style.display = 'none';
        
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
    if (!currentUser) {
        showNotification('🔐 Faça login primeiro para ativar o teste grátis');
        showLoginModal();
        return;
    }
    
    // Atualizar dados do usuário para plano free
    updateUserPlan('free');
    
    showNotification('🎉 Teste grátis ativado! Você tem 7 dias gratuitos com 3 contratos profissionais.');
    
    // Redirecionar para o gerador de contratos
    setTimeout(() => {
        window.location.href = 'index.html#generator';
    }, 2000);
}

// =============================================
// SISTEMA DE DOWNLOAD E EXPORTAÇÃO
// =============================================

// Função para mostrar contrato em tela cheia
function showContractFullscreen() {
    if (!canGenerateContract()) {
        return;
    }
    
    const contractContent = generateProfessionalContractPlus();
    
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
                    <button class="btn btn-success" onclick="generateWordPlus()">
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

// Função para gerar Word - VERSÃO MELHORADA
function generateWordPlus() {
    if (!canGenerateContract()) {
        return;
    }
    
    // Validar dados antes de gerar
    const validationErrors = validateContractData();
    if (validationErrors.length > 0) {
        showNotification(`❌ Corrija os seguintes campos: ${validationErrors.join(', ')}`);
        return;
    }
    
    try {
        const contractContent = generateProfessionalContractPlus();
        
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
            font-size: 12px;
            color: #000;
        }
        .contract-header { 
            text-align: center; 
            margin-bottom: 2rem; 
            padding-bottom: 1rem;
            border-bottom: 2px solid #000;
        }
        .contract-title { 
            font-size: 16px; 
            font-weight: bold; 
            margin-bottom: 0.5rem;
            text-transform: uppercase;
        }
        .contract-subtitle {
            font-size: 12px;
            font-style: italic;
            color: #666;
        }
        .contract-clause { 
            margin-bottom: 15px; 
            page-break-inside: avoid;
        }
        .contract-clause h4 {
            font-size: 12px;
            margin-bottom: 8px;
            font-weight: bold;
            text-transform: uppercase;
            color: #000;
            border-bottom: 1px solid #ccc;
            padding-bottom: 2px;
        }
        .contract-clause p {
            margin-bottom: 8px;
            text-align: justify;
        }
        .contract-clause ol {
            margin: 8px 0;
            padding-left: 25px;
        }
        .contract-clause li {
            margin-bottom: 4px;
            line-height: 1.4;
        }
        .signature-line-improved {
            display: table;
            width: 100%;
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 2px solid #000;
        }
        .signature-box-improved {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            padding: 0 15px;
        }
        .signature-space {
            border-top: 1px solid #000;
            margin: 1rem 0 0.5rem 0;
            padding-top: 0.5rem;
        }
        .signature-name {
            margin-top: 0.3rem;
            font-weight: bold;
            font-size: 1em;
        }
        .signature-role {
            font-style: italic;
            color: #666;
            margin-bottom: 0.3rem;
            font-size: 0.9em;
        }
        .signature-document {
            font-size: 0.8em;
            color: #555;
        }
        @media print {
            body { margin: 1.5cm; }
            .contract-clause { page-break-inside: avoid; }
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
        
        // Nome do arquivo mais profissional
        const contractorName = document.getElementById('contractorName')?.value || 'contratante';
        const fileName = `Contrato_${contractorName.replace(/\s+/g, '_')}_${new Date().getTime()}.doc`;
        
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Incrementar contador de contratos
        incrementContractCount();
        
        showNotification('✅ Contrato profissional baixado com sucesso!');
        
    } catch (error) {
        console.error('Erro no generateWord:', error);
        showNotification('❌ Erro ao gerar documento Word');
    }
}

// Função para mostrar opções de download
function showDownloadOptions() {
    if (!canGenerateContract()) {
        return;
    }
    
    const modal = document.getElementById('paymentModal');
    if (!modal) return;

    const modalBody = modal.querySelector('.modal-body');
    if (!modalBody) return;

    modalBody.innerHTML = `
        <div style="text-align: center;">
            <h3 style="color: var(--success); margin-bottom: 1rem;">
                <i class="fas fa-check-circle"></i> Contrato Gerado com Sucesso!
            </h3>
            <p>Seu contrato está pronto para visualização e download.</p>
            
            <div class="download-options">
                <button class="btn btn-secondary" onclick="showContractFullscreen()">
                    <i class="fas fa-eye"></i> Visualizar Contrato
                </button>
                <button class="btn btn-secondary" onclick="generateWordPlus()">
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
        
        showDownloadOptions();
        
    }, 2000);
}

// =============================================
// FUNÇÕES UTILITÁRIAS
// =============================================

function showNotification(message) {
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

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

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
    
    const loginModal = document.getElementById('loginModal');
    if (event.target === loginModal) {
        closeLoginModal();
    }
});

// Tecla ESC para fechar modal
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closePaymentModal();
        closeLoginModal();
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
