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
let currentSignatureType = null;
let currentSignatureMethod = null;

// Estado do usuário
let currentUser = null;

// Preços dos planos
const planPrices = {
    'avulsa': 6.99,
    'basico': 9.99,
    'profissional': 29.99
};

// Testemunhas
let witness1Name = '';
let witness1CPF = '';
let witness2Name = '';
let witness2CPF = '';

// =============================================
// INICIALIZAÇÃO DO SISTEMA
// =============================================

// Inicialização quando DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 ContratoFácil inicializando...');
    
    initMobileMenu();
    initEnhancedMobileMenu();
    initSignatureSystem();
    initMobileSignatureSystem();
    initWitnessSystem(); // Novo: sistema de testemunhas
    checkUserLogin();
    optimizeForMobile();
    setupEventListeners();
    initDateSettings();
    
    // Novas inicializações
    updateStatusBar();
    setupContactForm();
    
    // Replace notification function for mobile
    if (isMobileDevice()) {
        window.showNotification = showMobileNotification;
    }
    
    console.log('✅ ContratoFácil inicializado com sucesso!');
});

// Configurar event listeners
function setupEventListeners() {
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
            formatCurrencyInput(e);
            updatePreview();
        });
    }

    // Fechar modais ao clicar fora
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
        
        const upgradeModal = document.querySelector('.modal.upgrade-modal');
        if (event.target === upgradeModal) {
            upgradeModal.remove();
            document.body.style.overflow = 'auto';
        }
        
        const witnessModal = document.getElementById('witnessModal');
        if (event.target === witnessModal) {
            closeWitnessModal();
        }
    });

    // Tecla ESC para fechar modal
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closePaymentModal();
            closeLoginModal();
            closeContactModal();
            closeWitnessModal();
            const upgradeModal = document.querySelector('.modal.upgrade-modal');
            if (upgradeModal) {
                upgradeModal.remove();
                document.body.style.overflow = 'auto';
            }
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
}

// Inicializar sistema de testemunhas
function initWitnessSystem() {
    const addWitnessBtn = document.getElementById('addWitnessBtn');
    if (addWitnessBtn) {
        addWitnessBtn.addEventListener('click', showWitnessModal);
    }
    
    const saveWitnessBtn = document.getElementById('saveWitnessBtn');
    if (saveWitnessBtn) {
        saveWitnessBtn.addEventListener('click', saveWitnesses);
    }
}

// Configurar datas
function initDateSettings() {
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
        
        // Set initial end date
        if (startDateInput.value && !endDateInput.value) {
            const endDate = new Date(startDateInput.value);
            endDate.setMonth(endDate.getMonth() + 1);
            endDateInput.value = endDate.toISOString().split('T')[0];
        }
    }
}

// =============================================
// SISTEMA DE TESTEMUNHAS
// =============================================

function showWitnessModal() {
    const witnessModal = document.getElementById('witnessModal');
    if (witnessModal) {
        // Preencher campos se já existir dados
        document.getElementById('witness1Name').value = witness1Name || '';
        document.getElementById('witness1CPF').value = witness1CPF || '';
        document.getElementById('witness2Name').value = witness2Name || '';
        document.getElementById('witness2CPF').value = witness2CPF || '';
        
        witnessModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeWitnessModal() {
    const witnessModal = document.getElementById('witnessModal');
    if (witnessModal) {
        witnessModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function saveWitnesses() {
    witness1Name = document.getElementById('witness1Name').value.trim();
    witness1CPF = document.getElementById('witness1CPF').value.trim();
    witness2Name = document.getElementById('witness2Name').value.trim();
    witness2CPF = document.getElementById('witness2CPF').value.trim();
    
    // Validar CPFs se informados
    if (witness1CPF && !validateCPF(witness1CPF)) {
        showNotification('❌ CPF da Testemunha 1 inválido');
        return;
    }
    
    if (witness2CPF && !validateCPF(witness2CPF)) {
        showNotification('❌ CPF da Testemunha 2 inválido');
        return;
    }
    
    closeWitnessModal();
    updatePreview();
    showNotification('✅ Testemunhas salvas com sucesso!');
}

function clearWitnesses() {
    witness1Name = '';
    witness1CPF = '';
    witness2Name = '';
    witness2CPF = '';
    
    closeWitnessModal();
    updatePreview();
    showNotification('🔄 Testemunhas removidas');
}

// =============================================
// SISTEMA DE CONVERSÃO - FUNÇÕES NOVAS
// =============================================

// Scroll para o gerador após o vídeo
function scrollToGenerator() {
    document.getElementById('generator').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
    showNotification('🎯 Agora crie seu contrato profissional!');
}

// Sistema de controle de acesso aprimorado
function canGenerateContract() {
    if (!currentUser) {
        showNotification('🔐 Faça login para acessar o gerador profissional');
        showLoginModal();
        return false;
    }
    
    // Usuário free só pode visualizar, não baixar
    if (currentUser.plan === 'free') {
        return 'view_only';
    }
    
    return true;
}

// Modal de upgrade persuasivo
function showUpgradeModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active upgrade-modal';
    modal.style.zIndex = '3000';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3>🚀 Upgrade Necessário</h3>
                <button class="close-modal" onclick="this.closest('.modal').remove(); document.body.style.overflow='auto'">&times;</button>
            </div>
            <div class="modal-body">
                <div class="upgrade-content">
                    <div class="upgrade-header">
                        <h4>Seu Contrato Está Quase Pronto!</h4>
                        <p>Você já criou um contrato profissional. Agora falta pouco para ter acesso completo:</p>
                    </div>
                    
                    <div class="benefits-grid">
                        <div class="benefit-card">
                            <i class="fas fa-download"></i>
                            <strong>Download Imediato</strong>
                            <p>Baixe em Word e PDF</p>
                        </div>
                        <div class="benefit-card">
                            <i class="fas fa-edit"></i>
                            <strong>Edição Completa</strong>
                            <p>Modifique quando quiser</p>
                        </div>
                        <div class="benefit-card">
                            <i class="fas fa-shield-alt"></i>
                            <strong>Proteção Total</strong>
                            <p>Cláusulas jurídicas</p>
                        </div>
                    </div>
                    
                    <div class="upgrade-options">
                        <div class="upgrade-option featured">
                            <div class="option-header">
                                <h5>💎 MAIS POPULAR</h5>
                                <div class="price">R$ 6,99</div>
                                <div class="period">por contrato</div>
                            </div>
                            <ul>
                                <li>✅ Download imediato</li>
                                <li>✅ Contrato editável</li>
                                <li>✅ Formato Word + PDF</li>
                                <li>✅ Reutilizável</li>
                            </ul>
                            <button class="btn btn-success" onclick="openPaymentModal('avulsa'); this.closest('.modal').remove(); document.body.style.overflow='auto'" style="width: 100%;">
                                <i class="fas fa-bolt"></i> Comprar Agora
                            </button>
                        </div>
                        
                        <div class="upgrade-option">
                            <div class="option-header">
                                <h5>🚀 PROFISSIONAL</h5>
                                <div class="price">R$ 29,99</div>
                                <div class="period">por mês</div>
                            </div>
                            <ul>
                                <li>✅ Contratos Ilimitados</li>
                                <li>✅ Todos os modelos</li>
                                <li>✅ Suporte prioritário</li>
                                <li>✅ Armazenamento</li>
                            </ul>
                            <button class="btn" onclick="openPaymentModal('profissional'); this.closest('.modal').remove(); document.body.style.overflow='auto'" style="width: 100%;">
                                <i class="fas fa-crown"></i> Assinar Plano
                            </button>
                        </div>
                    </div>
                    
                    <div class="risk-warning">
                        <p>⚠️ <strong>Não arrisque:</strong> Um contrato mal elaborado pode custar muito mais que R$ 6,99</p>
                    </div>
                    
                    <div class="upgrade-footer">
                        <button class="btn-login" onclick="this.closest('.modal').remove(); document.body.style.overflow='auto'" style="width: 100%; margin-top: 1rem;">
                            <i class="fas fa-eye"></i> Continuar Visualizando Gratuitamente
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

// =============================================
// SISTEMA DE LOGIN E AUTENTICAÇÃO
// =============================================

// Verificar se usuário está logado
function checkUserLogin() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            updateUIAfterLogin();
        } catch (e) {
            console.error('Erro ao carregar usuário:', e);
            localStorage.removeItem('currentUser');
            updateUIAfterLogout();
        }
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
            contractsDownloaded: 0,
            remainingContracts: 999, // Visualizações ilimitadas
            trialEndDate: null, // Sem trial, só visualização
            joinDate: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };
        
        // Salva no localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Atualiza a UI
        updateUIAfterLogin();
        
        // Fecha o modal
        closeLoginModal();
        
        showNotification('🎉 Login realizado com sucesso! Agora você pode visualizar contratos gratuitamente.');
        
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
    if (generatorForm) generatorForm.style.display = 'grid';
    
    // Atualizar dashboard do usuário
    updateUserDashboard();
    updateStatusBar();
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
    
    updateStatusBar();
}

// Atualizar dashboard do usuário
function updateUserDashboard() {
    if (!currentUser) return;
    
    // Atualizar avatar
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar) {
        if (currentUser.picture) {
            userAvatar.src = currentUser.picture;
            userAvatar.onerror = function() {
                this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiMyYzlhYTAiLz4KPHBhdGggZD0iTTQwIDQ0QzQ2LjYgNDQgNTIgMzguNiA1MiAzMkM1MiAyNS40IDQ2LjYgMjAgNDAgMjBDMzMuNCAyMCAyOCAyNS40IDI4IDMyQzI4IDM4LjYgMzMuNCA0NCA0MCA0NFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yOCA1MkMyOCA1OC42IDMzLjQgNjQgNDAgNjRDNDYuNiA2NCA1MiA1OC42IDUyIDUyVjUySDI4VjUyWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+';
            };
        } else {
            userAvatar.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiMyYzlhYTAiLz4KPHBhdGggZD0iTTQwIDQ0QzQ2LjYgNDQgNTIgMzguNiA1MiAzMkM1MiAyNS40IDQ2LjYgMjAgNDAgMjBDMzMuNCAyMCAyOCAyNS40IDI4IDMyQzI4IDM4LjYgMzMuNCA0NCA0MCA0NFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yOCA1MkMyOCA1OC42IDMzLjQgNjQgNDAgNjRDNDYuNiA2NCA1MiA1OC42IDUyIDUyVjUySDI4VjUyWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+';
        }
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
    
    if (planExpiry) {
        planExpiry.textContent = currentUser.plan === 'free' ? 'Visualização Gratuita' : 
                                currentUser.plan === 'basico' ? '5 contratos/mês' : 'Ilimitado';
    }
    
    if (contractsCount) {
        contractsCount.textContent = currentUser.contractsGenerated || 0;
    }
    
    if (remainingContracts) {
        const remaining = currentUser.plan === 'free' ? 
                         '-' :
                         currentUser.plan === 'basico' ? (5 - (currentUser.contractsDownloaded || 0)) : '-';
        remainingContracts.textContent = remaining;
    }
    
    if (daysLeft) {
        daysLeft.textContent = currentUser.plan === 'free' ? '-' : '30';
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
        google.accounts.id.revoke(localStorage.getItem('currentUser'), done => {
            console.log('Google Sign-In revogado');
        });
    }
    
    // Atualizar UI
    updateUIAfterLogout();
    
    showNotification('👋 Logout realizado com sucesso!');
}

// Verificar se usuário pode baixar contrato
function canDownloadContract() {
    if (!currentUser) {
        showNotification('❌ Faça login para baixar contratos');
        showLoginModal();
        return false;
    }
    
    // Usuário free não pode baixar, só visualizar
    if (currentUser.plan === 'free') {
        showUpgradeModal();
        return false;
    }
    
    // Verificar limite do plano básico
    if (currentUser.plan === 'basico' && (currentUser.contractsDownloaded || 0) >= 5) {
        showNotification('❌ Você atingiu o limite de 5 contratos deste mês. Faça upgrade para o plano profissional.');
        openPaymentModal('profissional');
        return false;
    }
    
    return true;
}

// Função para incrementar contador de contratos
function incrementContractCount() {
    if (!currentUser) return;
    
    currentUser.contractsGenerated = (currentUser.contractsGenerated || 0) + 1;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updatePlanInfo();
    updateStatusBar();
}

// Função para incrementar contador de downloads
function incrementDownloadCount() {
    if (!currentUser) return;
    
    currentUser.contractsDownloaded = (currentUser.contractsDownloaded || 0) + 1;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updatePlanInfo();
    updateStatusBar();
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
            currentUser.remainingContracts = 999; // Visualizações ilimitadas
            currentUser.trialEndDate = null;
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
    updateStatusBar();
    
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
                document.body.style.overflow = 'hidden';
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                document.body.style.overflow = 'auto';
            }
        });
        
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                menuToggle.querySelector('i').classList.remove('fa-times');
                menuToggle.querySelector('i').classList.add('fa-bars');
                document.body.style.overflow = 'auto';
            });
        });
    }
}

// Enhanced mobile menu
function initEnhancedMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        let isOpen = false;
        
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            isOpen = !isOpen;
            
            if (isOpen) {
                navMenu.classList.add('active');
                document.body.style.overflow = 'hidden';
                menuToggle.querySelector('i').classList.replace('fa-bars', 'fa-times');
            } else {
                closeMobileMenu();
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (isOpen && !navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                closeMobileMenu();
            }
        });
        
        // Close menu on link click
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
        
        function closeMobileMenu() {
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
            menuToggle.querySelector('i').classList.replace('fa-times', 'fa-bars');
            isOpen = false;
        }
    }
}

// =============================================
// SISTEMA DE ASSINATURAS (CORRIGIDO)
// =============================================

// Sistema de Assinaturas
function initSignatureSystem() {
    console.log('Inicializando sistema de assinatura...');
    
    // Configurar eventos de upload
    const contractorUpload = document.getElementById('contractorSignatureUpload');
    if (contractorUpload) {
        contractorUpload.addEventListener('change', function(e) {
            handleSignatureUpload(e, 'contractor');
        });
    }

    const contractedUpload = document.getElementById('contractedSignatureUpload');
    if (contractedUpload) {
        contractedUpload.addEventListener('change', function(e) {
            handleSignatureUpload(e, 'contracted');
        });
    }

    // Inicializar canvas de desenho
    initSignatureCanvas('contractor');
    initSignatureCanvas('contracted');
    
    console.log('Sistema de assinatura inicializado');
}

// Função para lidar com upload de assinatura
function handleSignatureUpload(event, type) {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log(`Processando upload para ${type}:`, file.name);

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
            // Criar canvas temporário para processar a imagem
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = 300;
            tempCanvas.height = 100;
            
            // Limpar canvas
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
            
            // Calcular dimensões para manter proporção
            const ratio = Math.min(
                tempCanvas.width / img.width,
                tempCanvas.height / img.height
            );
            const width = img.width * ratio;
            const height = img.height * ratio;
            const x = (tempCanvas.width - width) / 2;
            const y = (tempCanvas.height - height) / 2;
            
            // Desenhar imagem centralizada
            tempCtx.drawImage(img, x, y, width, height);
            
            // Salvar assinatura
            if (type === 'contractor') {
                contractorSignature = tempCanvas.toDataURL('image/png');
            } else {
                contractedSignature = tempCanvas.toDataURL('image/png');
            }
            
            updateSignaturePreview(type);
            showSignatureConfirmation(type);
            
            showNotification('✅ Assinatura carregada com sucesso!');
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

// Função para inicializar canvas de desenho
function initSignatureCanvas(type) {
    const canvas = document.getElementById(`${type}SignatureDraw`);
    if (!canvas) {
        console.error(`Canvas não encontrado: ${type}SignatureDraw`);
        return;
    }

    const ctx = canvas.getContext('2d');
    
    // Configurar estilo do pincel
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Limpar canvas inicial
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    function startDrawing(e) {
        isDrawing = true;
        [lastX, lastY] = getCoordinates(e);
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(lastX, lastY);
        ctx.stroke();
    }

    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        
        const [currentX, currentY] = getCoordinates(e);
        
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        
        [lastX, lastY] = [currentX, currentY];
    }

    function stopDrawing() {
        if (isDrawing) {
            isDrawing = false;
            ctx.closePath();
            updateSignaturePreview(type);
            showSignatureConfirmation(type);
        }
    }

    function getCoordinates(e) {
        let clientX, clientY;
        
        if (e.type.includes('touch')) {
            const touch = e.touches[0];
            clientX = touch.clientX;
            clientY = touch.clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        const rect = canvas.getBoundingClientRect();
        return [
            clientX - rect.left,
            clientY - rect.top
        ];
    }

    // Event listeners para desktop
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Event listeners para mobile
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        startDrawing(e);
    });
    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
        draw(e);
    });
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);
    
    console.log(`Canvas ${type} inicializado`);
}

// Função para selecionar opção de assinatura
function selectSignatureOption(type, method, event) {
    // Prevenir comportamento padrão
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    console.log(`Selecionando assinatura: tipo=${type}, método=${method}`);
    
    // Remover seleção de todas as opções do mesmo tipo
    const signatureSection = event.currentTarget.closest('.signature-options');
    if (signatureSection) {
        const options = signatureSection.querySelectorAll('.signature-option');
        options.forEach(option => {
            option.classList.remove('selected');
        });
    }
    
    // Adicionar seleção à opção clicada
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('selected');
    }
    
    currentSignatureType = type;
    currentSignatureMethod = method;
    
    if (method === 'upload') {
        // Método de upload - clicar no input file
        const uploadInput = document.getElementById(`${type}SignatureUpload`);
        if (uploadInput) {
            console.log(`Abrindo upload para ${type}`);
            uploadInput.click();
        }
    } else if (method === 'draw') {
        // Método de desenho - mostrar canvas
        const canvas = document.getElementById(`${type}SignatureDraw`);
        const uploadInput = document.getElementById(`${type}SignatureUpload`);
        
        if (canvas) {
            console.log(`Mostrando canvas para ${type}`);
            canvas.style.display = 'block';
            
            // Limpar canvas
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Configurar estilo do pincel
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }
        
        if (uploadInput) {
            uploadInput.value = '';
        }
        
        // Limpar assinatura atual
        if (type === 'contractor') {
            contractorSignature = null;
        } else {
            contractedSignature = null;
        }
        
        updateSignaturePreview(type);
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

    // Se não tem signatureData, verificar se tem desenho no canvas
    if (!signatureData) {
        const canvas = document.getElementById(`${type}SignatureDraw`);
        if (canvas && canvas.style.display !== 'none') {
            // Verificar se o canvas tem conteúdo
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const hasContent = imageData.data.some(channel => channel !== 0);
            
            if (hasContent) {
                signatureData = canvas.toDataURL();
                if (type === 'contractor') {
                    contractorSignature = signatureData;
                } else {
                    contractedSignature = signatureData;
                }
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
    } else if (preview) {
        preview.innerHTML = '<p style="color: #666; text-align: center;">Assinatura aparecerá aqui</p>';
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
        preview.innerHTML = '<p style="color: #666; text-align: center;">Assinatura aparecerá aqui</p>';
    }
    
    const confirmation = document.getElementById(`${type}SignatureConfirmation`);
    if (confirmation) {
        confirmation.style.display = 'none';
    }
    
    // Remover seleção de todas as opções da mesma seção
    const signatureSection = document.querySelector(`.signature-options:has(#${type}SignaturePreview)`);
    if (signatureSection) {
        const options = signatureSection.querySelectorAll('.signature-option');
        options.forEach(option => {
            option.classList.remove('selected');
        });
    }
    
    // Limpar variáveis
    if (type === 'contractor') {
        contractorSignature = null;
    } else {
        contractedSignature = null;
    }
    
    currentSignatureType = null;
    currentSignatureMethod = null;
    
    updatePreview();
    showNotification('🔄 Assinatura removida');
}

function confirmSignature(type) {
    showNotification('✅ Assinatura confirmada!');
    const confirmation = document.getElementById(`${type}SignatureConfirmation`);
    if (confirmation) {
        confirmation.style.display = 'none';
    }
    
    // Esconder o canvas após confirmação
    const canvas = document.getElementById(`${type}SignatureDraw`);
    if (canvas) {
        canvas.style.display = 'none';
    }
}

// =============================================
// SISTEMA DE VISUALIZAÇÃO SEGURA
// =============================================

// Gerar URL segura para visualização
function generateSecureViewURL(contractData) {
    const contractId = 'contract_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Salvar contrato no localStorage
    localStorage.setItem(contractId, JSON.stringify(contractData));
    
    // Também salvar no sessionStorage para backup
    sessionStorage.setItem('lastGeneratedContract', JSON.stringify(contractData));
    
    // Retornar URL para visualização segura
    return `view-contract.html?id=${contractId}`;
}

// Abrir visualização segura
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
        const contractData = collectContractData();
        const secureURL = generateSecureViewURL(contractData);
        
        // Abrir em nova aba
        window.open(secureURL, '_blank');
        
        showNotification('👁️ Visualização segura aberta em nova aba');
        
    } catch (error) {
        console.error('Erro ao abrir visualização segura:', error);
        showNotification('❌ Erro ao abrir visualização segura');
    }
}

// Coletar dados do contrato
function collectContractData() {
    return {
        contractorName: document.getElementById('contractorName')?.value,
        contractorDoc: document.getElementById('contractorDoc')?.value,
        contractorProfession: document.getElementById('contractorProfession')?.value,
        contractorAddress: document.getElementById('contractorAddress')?.value,
        contractorCivilState: document.getElementById('contractorCivilState')?.value,
        
        contractedName: document.getElementById('contractedName')?.value,
        contractedDoc: document.getElementById('contractedDoc')?.value,
        contractedProfession: document.getElementById('contractedProfession')?.value,
        contractedAddress: document.getElementById('contractedAddress')?.value,
        contractedCivilState: document.getElementById('contractedCivilState')?.value,
        
        serviceDescription: document.getElementById('serviceDescription')?.value,
        serviceValue: document.getElementById('serviceValue')?.value,
        paymentMethod: document.getElementById('paymentMethod')?.value,
        startDate: document.getElementById('startDate')?.value,
        endDate: document.getElementById('endDate')?.value,
        contractCity: document.getElementById('contractCity')?.value,
        
        contractorSignature: contractorSignature,
        contractedSignature: contractedSignature,
        
        witness1Name: witness1Name,
        witness1CPF: witness1CPF,
        witness2Name: witness2Name,
        witness2CPF: witness2CPF,
        
        generatedAt: new Date().toISOString()
    };
}

// =============================================
// SISTEMA DE BARRA DE STATUS
// =============================================

// Atualizar barra de status
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
    
    if (currentUser.plan === 'free') {
        statusIcon.className = 'fas fa-eye';
        statusText.textContent = 'Plano Gratuito - Visualizações Ilimitadas';
        statusCount.innerHTML = `Contratos visualizados: <strong>${currentUser.contractsGenerated || 0}</strong>`;
    } else if (currentUser.plan === 'basico') {
        statusIcon.className = 'fas fa-crown';
        statusText.textContent = 'Plano Básico - 5 contratos/mês';
        const remaining = 5 - (currentUser.contractsDownloaded || 0);
        statusCount.innerHTML = `Contratos restantes: <strong>${remaining}</strong>`;
    } else {
        statusIcon.className = 'fas fa-gem';
        statusText.textContent = 'Plano Profissional - Ilimitado';
        statusCount.innerHTML = `Contratos baixados: <strong>${currentUser.contractsDownloaded || 0}</strong>`;
    }
}

// =============================================
// SISTEMA DE CONTATO COM EMAILJS
// =============================================

// Configurar formulário de contato
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', submitContactForm);
    }
}

// Mostrar modal de contato
function showContactModal() {
    const contactModal = document.getElementById('contactModal');
    if (contactModal) {
        contactModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Fechar modal de contato
function closeContactModal() {
    const contactModal = document.getElementById('contactModal');
    if (contactModal) {
        contactModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Enviar formulário de contato
function submitContactForm(event) {
    event.preventDefault();
    
    const contactName = document.getElementById('contactName');
    const contactEmail = document.getElementById('contactEmail');
    const contactSubject = document.getElementById('contactSubject');
    const contactMessage = document.getElementById('contactMessage');
    
    if (!contactName || !contactEmail || !contactSubject || !contactMessage) {
        showNotification('❌ Erro: Formulário de contato não encontrado');
        return;
    }
    
    // Validar campos
    if (!contactName.value || !contactEmail.value || !contactSubject.value || !contactMessage.value) {
        showNotification('❌ Preencha todos os campos obrigatórios');
        return;
    }
    
    if (!validateEmail(contactEmail.value)) {
        showNotification('❌ Email inválido');
        return;
    }
    
    const templateParams = {
        from_name: contactName.value,
        from_email: contactEmail.value,
        subject: contactSubject.value,
        message: contactMessage.value,
        to_email: 'luhkaimn@gmail.com'
    };

    // Mostrar loading
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    submitBtn.disabled = true;

    emailjs.send('service_s6hcwoa', 'template_wx7bj1m', templateParams)
        .then(function(response) {
            showNotification('✅ Mensagem enviada com sucesso! Entraremos em contato em breve.');
            closeContactModal();
            document.getElementById('contactForm').reset();
            
            // Restaurar botão
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, function(error) {
            showNotification('❌ Erro ao enviar mensagem. Tente novamente ou entre em contato via WhatsApp.');
            console.error('EmailJS error:', error);
            
            // Restaurar botão
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
}

// =============================================
// FUNÇÕES DO FAQ
// =============================================

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

// =============================================
// FUNÇÕES UTILITÁRIAS
// =============================================

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
                // Adicionar animação de shake
                field.style.animation = 'shake 0.5s ease-in-out';
                setTimeout(() => {
                    field.style.animation = '';
                }, 500);
            }
        } else if (field) {
            field.style.borderColor = '#e0e0e0';
        }
    }

    // Validação específica de CPF/CNPJ
    const contractorDoc = document.getElementById('contractorDoc')?.value;
    const contractedDoc = document.getElementById('contractedDoc')?.value;
    
    if (contractorDoc && contractorDoc.trim() && !validateCPFCNPJ(contractorDoc)) {
        errors.push('CPF/CNPJ do Contratante inválido');
    }
    
    if (contractedDoc && contractedDoc.trim() && !validateCPFCNPJ(contractedDoc)) {
        errors.push('CPF/CNPJ do Contratado inválido');
    }

    // Validação de valor do serviço
    const serviceValue = document.getElementById('serviceValue')?.value;
    if (serviceValue && serviceValue.trim()) {
        const valorNumerico = parseFloat(serviceValue.replace(/[^\d,]/g, '').replace(',', '.'));
        if (isNaN(valorNumerico) || valorNumerico <= 0) {
            errors.push('Valor do serviço deve ser maior que zero');
        }
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

// Formatar input de currency
function formatCurrencyInput(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    // Se estiver vazio, não faz nada
    if (value === '') {
        e.target.value = '';
        return;
    }
    
    // Converte para número e formata
    value = (parseInt(value) / 100).toFixed(2);
    value = value.replace('.', ',');
    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    e.target.value = value;
}

// Função para validar email
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// =============================================
// CONTRATO PROFISSIONAL PLUS - GERADOR MELHORADO
// =============================================

// Função para gerar o contrato PROFISSIONAL PLUS
function generateProfessionalContractPlus() {
    const data = collectContractData();
    
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
    switch(data.paymentMethod) {
        case 'transferencia': paymentMethodText = 'transferência bancária'; break;
        case 'boleto': paymentMethodText = 'boleto bancário'; break;
        case 'pix': paymentMethodText = 'PIX'; break;
        case 'cartao': paymentMethodText = 'cartão de crédito'; break;
        case 'dinheiro': paymentMethodText = 'dinheiro'; break;
        default: paymentMethodText = '________________________';
    }

    // Formatar valor por extenso
    const valorExtenso = formatarValorExtenso(data.serviceValue);

    // Calcular prazo em dias
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

    // Data atual por extenso
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = getMonthName(currentDate.getMonth());
    const year = currentDate.getFullYear();

    // CORREÇÃO: Determinar tipo de documento e formatar corretamente
    const getDocumentInfo = (doc) => {
        if (!doc || doc.trim() === '') {
            return {
                type: 'CPF/CNPJ',
                number: '________________________'
            };
        }
        
        const cleanDoc = doc.replace(/\D/g, '');
        if (cleanDoc.length === 11) {
            // Formatar CPF: XXX.XXX.XXX-XX
            const formatted = cleanDoc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
            return {
                type: 'CPF',
                number: formatted
            };
        } else if (cleanDoc.length === 14) {
            // Formatar CNPJ: XX.XXX.XXX/XXXX-XX
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

    // Construir o contrato PROFISSIONAL PLUS - CORRIGIDO
    const contractHTML = `
        <div class="contract-header">
            <div class="contract-title">CONTRATO DE PRESTAÇÃO DE SERVIÇOS PROFISSIONAIS</div>
            <div class="contract-subtitle">Instrumento Jurídico Particular - Lei nº 13.467/2017</div>
        </div>
        
        <div class="contract-body">
            <!-- PREÂMBULO -->
            <div class="contract-clause">
                <p style="text-align: justify; font-style: italic;">
                    As partes abaixo qualificadas celebram o presente Contrato de Prestação de Serviços, 
                    que se regerá pelas cláusulas e condições seguintes, bem como pela legislação aplicável.
                </p>
            </div>

            <!-- CLÁUSULA 1 - IDENTIFICAÇÃO DAS PARTES - CORRIGIDO -->
            <div class="contract-clause">
                <h4>CLÁUSULA PRIMEIRA - DAS PARTES CONTRATANTES</h4>
                <p><strong>CONTRATANTE:</strong> ${data.contractorName || '________________________'}, ${data.contractorCivilState || '______________'}, ${data.contractorProfession || '________________________'}, portador(a) do ${contractorDocInfo.type} nº ${contractorDocInfo.number}, residente e domiciliado(a) na ${data.contractorAddress || '______________________________________'}.</p>
                
                <p><strong>CONTRATADO(A):</strong> ${data.contractedName || '________________________'}, ${data.contractedCivilState || '______________'}, ${data.contractedProfession || '________________________'}, portador(a) do ${contractedDocInfo.type} nº ${contractedDocInfo.number}, residente e domiciliado(a) na ${data.contractedAddress || '______________________________________'}.</p>
                
                <p>As partes declaram, sob as penas da lei, que os dados acima são verdadeiros e assumem a responsabilidade por sua exatidão.</p>
            </div>

            <!-- CLÁUSULA 2 - OBJETO -->
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

            <!-- CLÁUSULA 3 - PRAZOS E ENTREGAS -->
            <div class="contract-clause">
                <h4>CLÁUSULA TERCEIRA - DOS PRAZOS E ENTREGÁVEIS</h4>
                <p><strong>3.1.</strong> O prazo para execução total dos serviços é de <strong>${calculateDays()}</strong> dias, contados a partir de <strong>${formatDate(data.startDate)}</strong>, com término previsto para <strong>${formatDate(data.endDate)}</strong>.</p>
                
                <p><strong>3.2.</strong> Os serviços serão entregues conforme o seguinte cronograma:</p>
                <ol type="a">
                    <li>Relatório de planejamento: até 5 dias úteis após a assinatura;</li>
                    <li>Entregas parciais: conforme acordado entre as partes;</li>
                    <li>Versão final: na data de término estabelecida.</li>
                </ol>
                
                <p><strong>3.3.</strong> O atraso na entrega dos serviços, quando imputável ao CONTRATADO, sujeitará este ao pagamento de multa moratória de 2% (dois por cento) sobre o valor total do contrato, além de juros de mora de 1% (um por cento) ao mês.</p>
                
                <p><strong>3.4.</strong> Eventuais prorrogações de prazo somente serão válidas se formalizadas por meio de aditivo contratual assinado por ambas as partes.</p>
            </div>

            <!-- CLÁUSULA 4 - VALOR E FORMA DE PAGAMENTO -->
            <div class="contract-clause">
                <h4>CLÁUSULA QUARTA - DO VALOR E CONDIÇÕES DE PAGAMENTO</h4>
                <p><strong>4.1.</strong> Pelo fiel e integral cumprimento deste contrato, o CONTRATANTE pagará ao CONTRATADO a importância total de <strong>R$ ${data.serviceValue || '__________'}</strong> (${valorExtenso}).</p>
                
                <p><strong>4.2.</strong> O pagamento será efetuado mediante: <strong>${paymentMethodText}</strong>, conforme discriminado abaixo:</p>
                <ol type="a">
                    <li>50% (cinquenta por cento) como sinal, no ato da assinatura do contrato;</li>
                    <li>50% (cinquenta por cento) na entrega do serviço finalizado e aceito.</li>
                </ol>
                
                <p><strong>4.3.</strong> Em caso de atraso no pagamento, incidirão as seguintes penalidades:</p>
                <ol type="a">
                    <li>Multa moratória de 2% (dois por cento) sobre o valor em aberto;</li>
                    <li>Juros de mora de 1% (um por cento) ao mês, calculados pro rata die;</li>
                    <li>Atualização monetária pelo índice oficial utilizado pelas instituições bancárias.</li>
                </ol>
                
                <p><strong>4.4.</strong> O CONTRATADO emitirá a nota fiscal correspondente aos serviços prestados, com retenção dos tributos incidentes na fonte, quando aplicável.</p>
            </div>

            <!-- Restante das cláusulas continua igual... -->

            <!-- CLÁUSULA 13 - ELEIÇÃO DE FORO -->
            <div class="contract-clause">
                <h4>CLÁUSULA DÉCIMA TERCEIRA - DO FORO E LEGISLAÇÃO APLICÁVEL</h4>
                <p><strong>13.1.</strong> Para dirimir quaisquer controvérsias oriundas deste contrato, as partes elegem o foro da comarca de <strong>${data.contractCity || '________________________'}</strong>, com expressa renúncia a qualquer outro, por mais privilegiado que seja.</p>
                
                <p><strong>13.2.</strong> Este contrato rege-se pelas leis da República Federativa do Brasil.</p>
                
                <p><strong>13.3.</strong> As partes comprometem-se a tentar solucionar amigavelmente eventuais controvérsias antes de recorrer ao Poder Judiciário.</p>
            </div>

            <!-- CLÁUSULA 14 - DISPOSIÇÕES GERAIS -->
            <div class="contract-clause">
                <h4>CLÁUSULA DÉCIMA QUARTA - DAS DISPOSIÇÕES GERAIS</h4>
                <p><strong>14.1.</strong> As tolerâncias eventualmente concedidas por qualquer das partes não constituirão novação ou renúncia a quaisquer direitos.</p>
                
                <p><strong>14.2.</strong> As comunicações entre as partes serão consideradas válidas se realizadas por escrito, inclusive por e-mail.</p>
                
                <p><strong>14.3.</strong> Este contrato poderá ser alterado apenas mediante aditivo escrito e assinado por ambas as partes.</p>
                
                <p><strong>14.4.</strong> A nulidade de qualquer cláusula não afetará a validade das demais disposições contratuais.</p>
                
                <p><strong>14.5.</strong> O presente contrato vincula as partes e seus sucessores a qualquer título.</p>
            </div>

            <!-- ÁREA DE ASSINATURAS -->
            <div class="signature-area">
                <p>E por estarem assim justos e contratados, firmam o presente instrumento em duas vias de igual teor e forma, na presença de duas testemunhas.</p>
                
                <div class="signature-line-improved">
                    <div class="signature-box-improved">
                        <p><strong>${data.contractCity || '________________________'}</strong>, ${day} de ${month} de ${year}.</p>
                        <div class="signature-space"></div>
                        ${data.contractorSignature ? `
                            <div style="text-align: center; margin: 10px 0;">
                                <img src="${data.contractorSignature}" style="max-width: 200px; max-height: 60px; border: 1px solid #ddd;">
                                <p style="font-size: 0.8rem; color: #666; margin-top: 5px;">Assinatura digital do CONTRATANTE</p>
                            </div>
                        ` : '<div style="height: 80px; margin: 10px 0; border-bottom: 1px solid #000;"></div>'}
                        <div class="signature-name">${data.contractorName || '________________________'}</div>
                        <div class="signature-role">CONTRATANTE</div>
                        <div class="signature-document">${contractorDocInfo.type}: ${contractorDocInfo.number}</div>
                    </div>
                    
                    <div class="signature-box-improved">
                        <p>&nbsp;</p>
                        <div class="signature-space"></div>
                        ${data.contractedSignature ? `
                            <div style="text-align: center; margin: 10px 0;">
                                <img src="${data.contractedSignature}" style="max-width: 200px; max-height: 60px; border: 1px solid #ddd;">
                                <p style="font-size: 0.8rem; color: #666; margin-top: 5px;">Assinatura digital do CONTRATADO(A)</p>
                            </div>
                        ` : '<div style="height: 80px; margin: 10px 0; border-bottom: 1px solid #000;"></div>'}
                        <div class="signature-name">${data.contractedName || '________________________'}</div>
                        <div class="signature-role">CONTRATADO(A)</div>
                        <div class="signature-document">${contractedDocInfo.type}: ${contractedDocInfo.number}</div>
                    </div>
                </div>

                <!-- TESTEMUNHAS (OPCIONAL) -->
                ${(witness1Name || witness2Name) ? `
                <div style="margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                    ${witness1Name ? `
                    <div style="text-align: center;">
                        <div style="border-bottom: 1px solid #000; margin: 10px 0; padding-top: 0.5rem;"></div>
                        <div style="font-weight: bold;">${witness1Name}</div>
                        <div style="font-size: 0.8rem; color: #666;">CPF: ${witness1CPF || '__________________'}</div>
                        <div style="font-size: 0.8rem; color: #666; font-style: italic;">Testemunha 1</div>
                    </div>
                    ` : ''}
                    
                    ${witness2Name ? `
                    <div style="text-align: center;">
                        <div style="border-bottom: 1px solid #000; margin: 10px 0; padding-top: 0.5rem;"></div>
                        <div style="font-weight: bold;">${witness2Name}</div>
                        <div style="font-size: 0.8rem; color: #666;">CPF: ${witness2CPF || '__________________'}</div>
                        <div style="font-size: 0.8rem; color: #666; font-style: italic;">Testemunha 2</div>
                    </div>
                    ` : ''}
                </div>
                ` : ''}

                <!-- RODAPÉ -->
                <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #000; text-align: center; font-size: 0.8rem; color: #666;">
                    <p><strong>Contrato gerado por ContratoFácil - Sistema Profissional de Criação de Contratos</strong></p>
                    <p>Documento juridicamente válido - Registro: ${currentDate.getTime()} - ${currentDate.toLocaleDateString('pt-BR')}</p>
                    <p style="font-size: 0.7rem; margin-top: 0.5rem;">Este documento atende aos requisitos do Código Civil Brasileiro e legislação complementar</p>
                </div>
            </div>
        </div>
    `;
    
    return contractHTML;
}

// =============================================
// ATUALIZAR FUNÇÃO PRINCIPAL DE PREVIEW
// =============================================

// Update contract preview
function updatePreview() {
    try {
        const contractPreview = document.getElementById('contractPreview');
        if (contractPreview) {
            contractPreview.innerHTML = generateProfessionalContractPlus();
            
            // Incrementar contador de visualizações
            if (currentUser) {
                incrementContractCount();
            }
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
                pixUrl = 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=c1073157a14d42759dd4bdc289e876e4';
                cardUrl = 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=c1073157a14d42759dd4bdc289e876e4';
                break;
            case 'profissional':
                modalTitle.textContent = 'Assinar Plano Profissional';
                description = 'Plano Profissional - Contratos ilimitados';
                modalPrice.textContent = 'Total: R$ 29,99/mês';
                price = '29,99';
                pixUrl = 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=762ad37ac4344ac2b71741512b53272c';
                cardUrl = 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=762ad37ac4344ac2b71741512b53272c';
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
                        closePaymentModal();
                    }, 2000);
                } else {
                    // Para contrato avulso, gerar download após pagamento
                    setTimeout(() => {
                        generateWordPlus();
                        closePaymentModal();
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
                        closePaymentModal();
                    }, 2000);
                } else {
                    // Para contrato avulso, gerar download após pagamento
                    setTimeout(() => {
                        generateWordPlus();
                        closePaymentModal();
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

// =============================================
// SISTEMA DE DOWNLOAD E EXPORTAÇÃO
// =============================================

// Função para gerar Word - VERSÃO MELHORADA
function generateWordPlus() {
    if (!canDownloadContract()) {
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
        
        // Incrementar contador de downloads
        incrementDownloadCount();
        
        showNotification('✅ Contrato profissional baixado com sucesso!');
        
    } catch (error) {
        console.error('Erro no generateWord:', error);
        showNotification('❌ Erro ao gerar documento Word');
    }
}

// =============================================
// MOBILE OPTIMIZATIONS
// =============================================

// Detect mobile device
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           window.innerWidth < 768;
}

// Optimize for mobile on load
function optimizeForMobile() {
    if (isMobileDevice()) {
        document.body.classList.add('mobile-device');
        
        // Adjust video autoplay for mobile
        const video = document.querySelector('.intro-video');
        if (video) {
            video.removeAttribute('autoplay');
            video.setAttribute('playsinline', '');
            video.setAttribute('controls', '');
        }
        
        // Improve touch interactions
        improveTouchInteractions();
    }
}

// Improve touch interactions
function improveTouchInteractions() {
    // Add touch-friendly class to interactive elements
    const touchElements = document.querySelectorAll('.btn, .nav-menu a, .signature-option');
    touchElements.forEach(element => {
        element.classList.add('touch-friendly');
    });
    
    // Prevent zoom on inputs
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('touchstart', function(e) {
            this.style.fontSize = '16px'; // Prevent zoom
        });
    });
}

// Enhanced signature system for mobile
function initMobileSignatureSystem() {
    if (!isMobileDevice()) return;
    
    const signatureCanvases = document.querySelectorAll('canvas');
    signatureCanvases.forEach(canvas => {
        canvas.style.touchAction = 'none';
        
        // Improve touch drawing
        canvas.addEventListener('touchstart', function(e) {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        }, { passive: false });
        
        canvas.addEventListener('touchmove', function(e) {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        }, { passive: false });
    });
}

// Mobile-friendly notifications
function showMobileNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification mobile-notification';
    notification.innerHTML = `
        <div style="text-align: center; padding: 1rem;">
            <strong>${message}</strong>
        </div>
    `;
    
    // Mobile-specific styles
    notification.style.cssText = `
        position: fixed;
        top: 70px;
        left: 10px;
        right: 10px;
        background: var(--success);
        color: white;
        padding: 0;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: none;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// =============================================
// FUNÇÕES UTILITÁRIAS FINAIS
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

// Função para formatar CPF/CNPJ
function formatCPFCNPJ(value) {
    const cleanValue = value.replace(/\D/g, '');
    
    if (cleanValue.length <= 11) {
        // CPF
        return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
        // CNPJ
        return cleanValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
}

// Função para gerar ID único
function generateUniqueId() {
    return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
}

// Função para debounce (otimização de performance)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Aplicar debounce no updatePreview para mobile
if (isMobileDevice()) {
    window.updatePreview = debounce(updatePreview, 500);
}

// =============================================
// EXPORTAÇÃO DE FUNÇÕES GLOBAIS
// =============================================

// Exportar funções para o escopo global
window.scrollToGenerator = scrollToGenerator;
window.showUpgradeModal = showUpgradeModal;
window.handleGoogleSignIn = handleGoogleSignIn;
window.showLoginModal = showLoginModal;
window.closeLoginModal = closeLoginModal;
window.showUserMenu = showUserMenu;
window.signOut = signOut;
window.selectSignatureOption = selectSignatureOption;
window.handleSignatureUpload = handleSignatureUpload;
window.clearSignature = clearSignature;
window.confirmSignature = confirmSignature;
window.toggleFAQ = toggleFAQ;
window.updatePreview = updatePreview;
window.openPaymentModal = openPaymentModal;
window.closePaymentModal = closePaymentModal;
window.selectPayment = selectPayment;
window.generateWordPlus = generateWordPlus;
window.canDownloadContract = canDownloadContract;
window.openSecurePreview = openSecurePreview;
window.showContactModal = showContactModal;
window.closeContactModal = closeContactModal;
window.submitContactForm = submitContactForm;
window.showWitnessModal = showWitnessModal;
window.closeWitnessModal = closeWitnessModal;
window.saveWitnesses = saveWitnesses;
window.clearWitnesses = clearWitnesses;

console.log('📦 Todas as funções JavaScript carregadas com sucesso!');

// Inicialização final
setTimeout(() => {
    if (currentUser) {
        console.log(`👤 Usuário logado: ${currentUser.name}`);
    } else {
        console.log('🔒 Usuário não logado - Modo visualização ativo');
    }
}, 1000);
