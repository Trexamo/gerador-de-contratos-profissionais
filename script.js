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

// =============================================
// INICIALIZAÇÃO DO SISTEMA
// =============================================

// Inicialização quando DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 ContratoFácil inicializando...');
    
    initMobileMenu();
    initEnhancedMobileMenu();
    updatePreview();
    initSignatureSystem();
    initMobileSignatureSystem();
    checkUserLogin();
    optimizeForMobile();
    setupEventListeners();
    initDateSettings();
    
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
        
        const upgradeModal = document.querySelector('.modal.upgrade-modal');
        if (event.target === upgradeModal) {
            upgradeModal.remove();
            document.body.style.overflow = 'auto';
        }
    });

    // Tecla ESC para fechar modal
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closePaymentModal();
            closeLoginModal();
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
        planExpiry.textContent = 'Visualização Gratuita';
        planExpiry.style.color = 'var(--success)';
    }
    
    if (contractsCount) {
        contractsCount.textContent = currentUser.contractsGenerated || 0;
    }
    
    if (remainingContracts) {
        const remaining = currentUser.plan === 'free' ? 
                         'Ilimitado' :
                         currentUser.plan === 'basico' ? 5 : 'Ilimitado';
        remainingContracts.textContent = remaining;
    }
    
    if (daysLeft) {
        daysLeft.textContent = '∞';
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
    
    return true;
}

// Função para incrementar contador de contratos
function incrementContractCount() {
    if (!currentUser) return;
    
    currentUser.contractsGenerated = (currentUser.contractsGenerated || 0) + 1;
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

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showNotification('❌ A imagem deve ser menor que 5MB');
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
            
            // Limpar canvas
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
            
            // Desenhar imagem no canvas
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
    const canvas = document.getElementById(`${type}SignatureDraw`);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Configurar estilo do pincel
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Limpar canvas inicial
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Event listeners para desktop
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Event listeners para mobile
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', stopDrawing);

    function startDrawing(e) {
        isDrawing = true;
        currentCanvas = type;
        const rect = canvas.getBoundingClientRect();
        lastX = e.clientX - rect.left;
        lastY = e.clientY - rect.top;
        
        // Começar um novo caminho
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
    }

    function draw(e) {
        if (!isDrawing || currentCanvas !== type) return;
        
        const rect = canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        
        lastX = currentX;
        lastY = currentY;
    }

    function stopDrawing() {
        if (isDrawing && currentCanvas === type) {
            isDrawing = false;
            ctx.beginPath(); // Resetar o caminho
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
    // Remover seleção de todas as opções
    document.querySelectorAll('.signature-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Selecionar a opção clicada
    event.target.closest('.signature-option').classList.add('selected');
    
    currentSignatureType = type;
    currentSignatureMethod = method;
    
    if (method === 'upload') {
        document.getElementById(`${type}SignatureUpload`).click();
    } else {
        const canvas = document.getElementById(`${type}SignatureDraw`);
        const uploadInput = document.getElementById(`${type}SignatureUpload`);
        
        if (canvas) {
            canvas.style.display = 'block';
            // Limpar canvas
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
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
    
    // Remover seleção de todas as opções
    document.querySelectorAll('.signature-option').forEach(option => {
        option.classList.remove('selected');
    });
    
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

            <!-- CLÁUSULA 2 - OBJETO -->
            <div class="contract-clause">
                <h4>CLÁUSULA SEGUNDA - DO OBJETO CONTRATUAL</h4>
                <p>Constitui objeto do presente contrato a prestação dos seguintes serviços: <strong>${serviceDescription}</strong>.</p>
            </div>

            <!-- CLÁUSULA 3 - PRAZOS -->
            <div class="contract-clause">
                <h4>CLÁUSULA TERCEIRA - DOS PRAZOS E ENTREGÁVEIS</h4>
                <p><strong>3.1.</strong> O prazo para execução dos serviços é de <strong>${calculateDays()}</strong> dias, iniciando-se em <strong>${formatDate(startDate)}</strong> e terminando em <strong>${formatDate(endDate)}</strong>.</p>
            </div>

            <!-- CLÁUSULA 4 - VALOR E PAGAMENTO -->
            <div class="contract-clause">
                <h4>CLÁUSULA QUARTA - DO VALOR E CONDIÇÕES DE PAGAMENTO</h4>
                <p><strong>4.1.</strong> Pelo fiel cumprimento deste contrato, o CONTRATANTE pagará ao CONTRATADO(A) a importância de <strong>R$ ${serviceValue}</strong> (${valorExtenso}).</p>
                <p><strong>4.2.</strong> O pagamento será efetuado mediante: <strong>${paymentMethodText}</strong>.</p>
            </div>

            <!-- CLÁUSULA 5 - OBRIGAÇÕES -->
            <div class="contract-clause">
                <h4>CLÁUSULA QUINTA - DAS OBRIGAÇÕES DAS PARTES</h4>
                <p><strong>5.1.</strong> O CONTRATADO(A) obriga-se a executar os serviços com zelo, diligência e capacidade técnica adequada.</p>
                <p><strong>5.2.</strong> O CONTRATANTE obriga-se a fornecer todas as informações necessárias e efetuar o pagamento nos prazos ajustados.</p>
            </div>

            <!-- CLÁUSULA 6 - CONFIDENCIALIDADE -->
            <div class="contract-clause">
                <h4>CLÁUSULA SEXTA - DA CONFIDENCIALIDADE</h4>
                <p>As partes obrigam-se a manter sigilo sobre todas as informações confidenciais a que tiverem acesso.</p>
            </div>

            <!-- CLÁUSULA 7 - RESCISÃO -->
            <div class="contract-clause">
                <h4>CLÁUSULA SÉTIMA - DA RESCISÃO CONTRATUAL</h4>
                <p>Este contrato poderá ser rescindido por mútuo acordo, inadimplemento ou caso fortuito que impossibilite o cumprimento.</p>
            </div>

            <!-- CLÁUSULA 8 - FORO -->
            <div class="contract-clause">
                <h4>CLÁUSULA OITAVA - DO FORO</h4>
                <p>Para dirimir quaisquer controvérsias, as partes elegem o foro da comarca de <strong>${contractCity}</strong>.</p>
            </div>

            <!-- ÁREA DE ASSINATURAS -->
            <div class="signature-area">
                <p>E por estarem assim justos e contratados, firmam o presente instrumento em duas vias de igual teor e forma.</p>
                
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
                    </div>
                </div>

                <!-- RODAPÉ -->
                <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #000; text-align: center; font-size: 0.8rem; color: #666;">
                    <p><strong>Contrato gerado por ContratoFácil</strong></p>
                    <p>Documento juridicamente válido</p>
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
        
        // Incrementar contador de contratos
        incrementContractCount();
        
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

// Função para validar email
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
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
window.clearSignature = clearSignature;
window.confirmSignature = confirmSignature;
window.toggleFAQ = toggleFAQ;
window.updatePreview = updatePreview;
window.openPaymentModal = openPaymentModal;
window.closePaymentModal = closePaymentModal;
window.selectPayment = selectPayment;
window.generateWordPlus = generateWordPlus;
window.canDownloadContract = canDownloadContract;

console.log('📦 Todas as funções JavaScript carregadas com sucesso!');

// Inicialização final
setTimeout(() => {
    if (currentUser) {
        console.log(`👤 Usuário logado: ${currentUser.name}`);
    } else {
        console.log('🔒 Usuário não logado - Modo visualização ativo');
    }
}, 1000);
