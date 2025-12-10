// =============================================
// script.js - ContratoFácil (VERSÃO COMPLETA E CORRIGIDA)
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

// Inicialização quando DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando ContratoFácil...');
    
    // Verificar e corrigir dados do usuário
    checkAndFixUserData();
    
    checkUserLogin();
    initMobileMenu();
    initSignatureSystem();
    setupEventListeners();
    initDateSettings();
    updateStatusBar();
    setupContactForm();
    setupAutoPreview();
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
        
        // Verificar se o plano está definido
        if (!user.plan || user.plan === '') {
            console.log('🔧 Corrigindo: Plano não definido');
            user.plan = 'free';
            needsUpdate = true;
        }
        
        // Verificar se os contadores existem
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
        
        // Garantir que o plano esteja em minúsculas
        if (user.plan && user.plan !== user.plan.toLowerCase()) {
            console.log('🔧 Corrigindo: Plano em maiúsculas');
            user.plan = user.plan.toLowerCase();
            needsUpdate = true;
        }
        
        // Adicionar data de atualização do plano se não existir
        if (!user.planUpdated) {
            user.planUpdated = new Date().toISOString();
            needsUpdate = true;
        }
        
        // Salvar se houve alterações
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

// Verificar se usuário está logado
function checkUserLogin() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            
            // Garantir que o plano esteja em minúsculas
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

// Função para processar login do Google
function handleGoogleSignIn(response) {
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
            joinDate: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            planUpdated: new Date().toISOString(),
            signatures: {},
            contractsHistory: []
        };
        
        // Salva no localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Atualiza a UI
        updateUIAfterLogin();
        
        // Fecha o modal
        closeLoginModal();
        
        showNotification('🎉 Login realizado com sucesso! Agora você pode visualizar contratos gratuitamente.');
        
        // Forçar atualização do preview após login
        setTimeout(updatePreview, 500);
        
    } catch (error) {
        console.error('❌ Erro no login:', error);
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
        throw new Error('Token inválido');
    }
}

// Atualizar UI após login
function updateUIAfterLogin() {
    if (!currentUser) return;
    
    console.log('👤 Usuário logado:', currentUser.name);
    console.log('📋 Plano:', currentUser.plan);
    
    // Atualizar header
    const loginButton = document.getElementById('loginButton');
    const userButton = document.getElementById('userButton');
    const userNav = document.getElementById('userNav');
    
    if (loginButton) loginButton.style.display = 'none';
    if (userButton) userButton.style.display = 'block';
    if (userNav) userNav.style.display = 'list-item';
    
    // Atualizar nome do usuário
    const userNameNav = document.getElementById('userNameNav');
    const userNameButton = document.getElementById('userNameButton');
    if (userNameNav) userNameNav.textContent = currentUser.name.split(' ')[0];
    if (userNameButton) userNameButton.textContent = currentUser.name.split(' ')[0];
    
    // Atualizar seções principais
    const loginRequired = document.getElementById('loginRequired');
    const generatorForm = document.getElementById('generatorForm');
    
    if (loginRequired) loginRequired.style.display = 'none';
    if (generatorForm) generatorForm.style.display = 'flex';
    
    // Atualizar status bar
    updateStatusBar();
    
    // Configurar event listeners após login
    setupEventListeners();
    
    // Forçar primeira atualização
    setTimeout(updatePreview, 500);
}

// Atualizar UI após logout
function updateUIAfterLogout() {
    // Atualizar header
    const loginButton = document.getElementById('loginButton');
    const userButton = document.getElementById('userButton');
    const userNav = document.getElementById('userNav');
    
    if (loginButton) loginButton.style.display = 'block';
    if (userButton) userButton.style.display = 'none';
    if (userNav) userNav.style.display = 'none';
    
    // Atualizar seções principais
    const loginRequired = document.getElementById('loginRequired');
    const generatorForm = document.getElementById('generatorForm');
    
    if (loginRequired) loginRequired.style.display = 'block';
    if (generatorForm) generatorForm.style.display = 'none';
    
    // Esconder status bar
    const statusBar = document.getElementById('statusBar');
    if (statusBar) statusBar.style.display = 'none';
}

// Funções do Modal de Login
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

// Logout
function signOut() {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('currentUser');
        currentUser = null;
        updateUIAfterLogout();
        showNotification('👋 Até logo!');
    }
}

// =============================================
// CONFIGURAÇÃO DE EVENT LISTENERS
// =============================================

function setupEventListeners() {
    // Atualizar preview em tempo real
    const formInputs = document.querySelectorAll('#generatorForm input, #generatorForm select, #generatorForm textarea');
    
    formInputs.forEach(input => {
        // Remover event listeners antigos para evitar duplicação
        input.removeEventListener('input', handleFormInput);
        input.removeEventListener('change', handleFormInput);
        
        // Adicionar novos listeners
        input.addEventListener('input', handleFormInput);
        input.addEventListener('change', handleFormInput);
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
        
        const contractModal = document.getElementById('contractModal');
        if (event.target === contractModal) {
            closeContractModal();
        }
        
        const upgradeModal = document.querySelector('.modal.upgrade-modal');
        if (event.target === upgradeModal) {
            upgradeModal.remove();
            document.body.style.overflow = 'auto';
        }
    });

    // Tecla ESC para fechar todos os modais
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closePaymentModal();
            closeLoginModal();
            closeContactModal();
            closeContractModal();
            
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
        const contractViewContent = document.getElementById('contractViewContent');
        
        if ((contractPreview && contractPreview.contains(e.target)) || 
            (contractViewContent && contractViewContent.contains(e.target))) {
            e.preventDefault();
            showNotification('❌ Cópia do conteúdo do contrato não é permitida');
        }
    });

    // Prevenir clique direito no contrato
    document.addEventListener('contextmenu', function(e) {
        const contractPreview = document.getElementById('contractPreview');
        const contractViewContent = document.getElementById('contractViewContent');
        
        if ((contractPreview && contractPreview.contains(e.target)) || 
            (contractViewContent && contractViewContent.contains(e.target))) {
            e.preventDefault();
            showNotification('❌ Ação não permitida no contrato');
        }
    });
}

// Função para lidar com input do formulário
function handleFormInput(e) {
    updatePreview();
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
// FUNÇÃO DE ATUALIZAÇÃO DO PREVIEW
// =============================================

// Update contract preview - FUNÇÃO PRINCIPAL
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
        
        // Gerar o contrato
        const contractHTML = generateProfessionalContractPlus();
        
        if (!contractHTML || contractHTML.trim() === '') {
            contractPreview.innerHTML = '<p style="color: #666; text-align: center;">Preencha os campos acima para gerar o contrato...</p>';
            return;
        }
        
        // Inserir no DOM
        contractPreview.innerHTML = contractHTML;
        
        // Incrementar contador de visualizações
        if (currentUser) {
            incrementContractCount();
        }
        
    } catch (error) {
        console.error('Erro ao atualizar preview:', error);
        showNotification('❌ Erro ao atualizar visualização do contrato');
    }
}

// Função para incrementar contador de contratos
function incrementContractCount() {
    if (!currentUser) return;
    
    // Rate limiting: Só permitir 1 visualização por segundo
    window.lastContractView = window.lastContractView || 0;
    const now = Date.now();
    const timeSinceLastView = now - window.lastContractView;
    
    if (timeSinceLastView < 1000) {
        return;
    }
    
    window.lastContractView = now;
    
    // Incrementar normalmente
    currentUser.contractsGenerated = (currentUser.contractsGenerated || 0) + 1;
    currentUser.lastLogin = new Date().toISOString();
    
    // Garantir que não passe de um limite razoável
    if (currentUser.contractsGenerated > 999) {
        currentUser.contractsGenerated = 999;
    }
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateStatusBar();
    
    console.log('📊 Contador atualizado:', currentUser.contractsGenerated);
}

// Função para setup automático do preview
function setupAutoPreview() {
    // Verificar se o usuário está logado
    if (currentUser) {
        // Atualizar uma vez para mostrar contrato inicial
        setTimeout(updatePreview, 500);
    }
}

// =============================================
// SISTEMA DE BARRA DE STATUS - VERSÃO CORRIGIDA
// =============================================

// Atualizar barra de status - VERSÃO CORRIGIDA
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
    
    // CORREÇÃO: Verificar plano corretamente
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
        // Fallback para plano não reconhecido
        statusIcon.className = 'fas fa-user';
        statusText.textContent = 'Plano Gratuito - Visualizações Ilimitadas';
        statusCount.innerHTML = `Contratos visualizados: <strong>${currentUser.contractsGenerated || 0}</strong>`;
    }
}

// =============================================
// SISTEMA DE ASSINATURAS
// =============================================

// Sistema de Assinaturas
function initSignatureSystem() {
    // Inicializar ambas as assinaturas
    ['contractor', 'contracted'].forEach(type => {
        // Configurar eventos de upload
        const uploadInput = document.getElementById(`${type}SignatureUpload`);
        if (uploadInput) {
            uploadInput.addEventListener('change', function(e) {
                handleSignatureUpload(e, type);
            });
        }

        // Inicializar canvas
        initSignatureCanvas(type);
    });
}

// Função para selecionar opção de assinatura
function selectSignatureOption(type, method) {
    const uploadInput = document.getElementById(`${type}SignatureUpload`);
    const canvas = document.getElementById(`${type}SignatureDraw`);
    
    // Remover seleção de todas as opções do mesmo tipo
    const signatureOptions = document.querySelectorAll(`.signature-options`);
    signatureOptions.forEach(section => {
        const options = section.querySelectorAll('.signature-option');
        options.forEach(option => {
            option.classList.remove('selected');
        });
    });
    
    if (method === 'upload') {
        // Método de upload - clicar no input file
        if (uploadInput) {
            uploadInput.click();
        }
    } else if (method === 'draw') {
        // Método de desenho - mostrar canvas
        if (canvas) {
            canvas.style.display = 'block';
            
            // Limpar canvas
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Configurar estilo do pincel
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            // Limpar input file
            if (uploadInput) {
                uploadInput.value = '';
            }
            
            // Limpar assinatura atual da variável
            if (type === 'contractor') {
                contractorSignature = null;
            } else {
                contractedSignature = null;
            }
            
            // Ativar modo de desenho
            drawingCanvas = canvas;
            drawingContext = ctx;
            drawingFor = type;
            
            updateSignaturePreview(type);
            updatePreview();
        }
    }
}

// Função para lidar com upload de assinatura
function handleSignatureUpload(event, type) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    // Validar tipo de arquivo
    if (!file.type.match('image.*')) {
        showNotification('❌ Por favor, selecione uma imagem válida (JPG, PNG, etc.)');
        return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('❌ A imagem deve ser menor que 5MB');
        return;
    }

    const reader = new FileReader();
    
    reader.onload = function(e) {
        const img = new Image();
        
        img.onload = function() {
            // Criar canvas para processar a imagem
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Definir tamanho fixo para a assinatura
            canvas.width = 300;
            canvas.height = 100;
            
            // Limpar canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Calcular dimensões para manter proporção
            const ratio = Math.min(
                canvas.width / img.width,
                canvas.height / img.height
            );
            const width = img.width * ratio;
            const height = img.height * ratio;
            const x = (canvas.width - width) / 2;
            const y = (canvas.height - height) / 2;
            
            // Desenhar imagem centralizada no canvas
            ctx.drawImage(img, x, y, width, height);
            
            // Salvar assinatura como data URL
            const signatureData = canvas.toDataURL('image/png');
            
            // Salvar na variável correspondente
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
            
            // Atualizar preview
            updateSignaturePreview(type);
            
            // Esconder canvas de desenho se estiver visível
            const drawCanvas = document.getElementById(`${type}SignatureDraw`);
            if (drawCanvas) {
                drawCanvas.style.display = 'none';
            }
            
            showNotification('✅ Assinatura carregada com sucesso!');
            
            // Atualizar o preview do contrato
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

// Função para inicializar canvas de desenho - VERSÃO CORRIGIDA PARA MOBILE
function initSignatureCanvas(type) {
    const canvasId = `${type}SignatureDraw`;
    const canvas = document.getElementById(canvasId);
    
    if (!canvas) {
        console.error(`❌ Canvas não encontrado: ${canvasId}`);
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

    // Função para obter coordenadas corrigidas para mobile
    function getCoordinates(e) {
        let clientX, clientY;
        
        if (e.type.includes('touch')) {
            // Para touch events
            const touch = e.touches[0] || e.changedTouches[0];
            clientX = touch.clientX;
            clientY = touch.clientY;
        } else {
            // Para mouse events
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
        
        // Atualizar assinatura na variável em tempo real
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
            
            // Salvar assinatura no usuário
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
            
            // Atualizar preview
            updateSignaturePreview(type);
            
            // Mostrar botões de confirmação
            const confirmation = document.getElementById(`${type}SignatureConfirmation`);
            if (confirmation) {
                confirmation.style.display = 'flex';
            }
            
            // Atualizar o preview do contrato
            updatePreview();
        }
    }

    // CORREÇÃO PARA MOBILE: Event listeners otimizados
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // CORREÇÃO: Event listeners para mobile melhorados
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
    
    // CORREÇÃO ADICIONAL: Prevenir scroll enquanto desenha
    canvas.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
            // Apenas um dedo - permitir desenho, prevenir scroll
            document.body.style.overflow = 'hidden';
        }
    });
    
    canvas.addEventListener('touchend', function() {
        // Restaurar scroll após desenho
        document.body.style.overflow = '';
    });
    
    console.log(`✅ Canvas ${type} inicializado para mobile`);
}

// Função para atualizar preview da assinatura
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

// Função para limpar assinatura
function clearSignature(type) {
    // Limpar variável
    if (type === 'contractor') {
        contractorSignature = null;
    } else {
        contractedSignature = null;
    }
    
    // Limpar do usuário
    if (currentUser && currentUser.signatures) {
        delete currentUser.signatures[type];
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    // Limpar preview
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
    
    // Limpar canvas
    const canvas = document.getElementById(`${type}SignatureDraw`);
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.display = 'none';
    }
    
    // Limpar input file
    const uploadInput = document.getElementById(`${type}SignatureUpload`);
    if (uploadInput) {
        uploadInput.value = '';
    }
    
    // Remover seleção de opções
    const signatureSection = document.querySelector(`.signature-options:has(#${type}SignaturePreview)`);
    if (signatureSection) {
        const options = signatureSection.querySelectorAll('.signature-option');
        options.forEach(option => {
            option.classList.remove('selected');
        });
    }
    
    // Esconder confirmação
    const confirmation = document.getElementById(`${type}SignatureConfirmation`);
    if (confirmation) {
        confirmation.style.display = 'none';
    }
    
    updatePreview();
    showNotification('🔄 Assinatura removida');
}

// Função para confirmar assinatura desenhada
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
// SISTEMA DE PAGAMENTO - VERSÃO CORRIGIDA
// =============================================

// Payment modal functions
function openPaymentModal(plan) {
    console.log('💰 Abrindo modal de pagamento para plano:', plan);
    
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
        paymentModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closePaymentModal() {
    const paymentModal = document.getElementById('paymentModal');
    if (paymentModal) {
        paymentModal.style.display = 'none';
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

// Atualizar plano do usuário - VERSÃO CORRIGIDA
function updateUserPlan(planType) {
    if (!currentUser) {
        console.error('❌ Nenhum usuário para atualizar plano');
        showNotification('❌ Erro: Faça login primeiro');
        return;
    }
    
    console.log('🔄 Atualizando plano para:', planType);
    console.log('📋 Plano anterior:', currentUser.plan);
    console.log('📊 Downloads anteriores:', currentUser.contractsDownloaded || 0);
    
    // CORREÇÃO: Verificar se já tem plano profissional
    if (currentUser.plan === 'profissional' && planType === 'profissional') {
        console.log('✅ Usuário já tem plano profissional ativo');
        showNotification('✅ Seu plano profissional já está ativo!');
        return;
    }
    
    // CORREÇÃO: Para plano básico, resetar contador se mudar de plano
    if (planType === 'basico' && currentUser.plan !== 'basico') {
        currentUser.contractsDownloaded = 0;
        console.log('🔄 Resetando contador de downloads para novo plano básico');
    }
    
    // Salvar plano anterior para referência
    const previousPlan = currentUser.plan;
    
    // Atualizar plano
    currentUser.plan = planType;
    currentUser.planUpdated = new Date().toISOString();
    
    // Configurar limites conforme o plano
    switch(planType) {
        case 'free':
            currentUser.remainingContracts = 999;
            currentUser.maxDownloads = 0;
            break;
        case 'basico':
            currentUser.remainingContracts = 5;
            currentUser.maxDownloads = 5;
            // Resetar contador de downloads se estiver mudando de outro plano
            if (previousPlan !== 'basico') {
                currentUser.contractsDownloaded = 0;
                console.log('🔄 Resetando contador de downloads para plano básico');
            }
            break;
        case 'profissional':
            currentUser.remainingContracts = 9999; // Praticamente ilimitado
            currentUser.maxDownloads = 9999;
            // Resetar contador para plano profissional
            currentUser.contractsDownloaded = 0;
            console.log('🔄 Resetando contador para plano profissional');
            break;
        case 'avulsa':
            // Para contrato avulso, não mudar o plano principal
            console.log('💰 Contrato avulso comprado - Plano principal mantido:', currentUser.plan);
            // Mas permitir o download imediato
            setTimeout(() => {
                generateWordPlus();
            }, 1000);
            return;
    }
    
    // Salvar no localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Atualizar UI
    updateStatusBar();
    updateUIAfterLogin();
    
    // Mostrar notificação
    let planName = '';
    switch(planType) {
        case 'free': planName = 'Gratuito'; break;
        case 'basico': planName = 'Básico'; break;
        case 'profissional': planName = 'Profissional'; break;
    }
    
    showNotification(`🎉 Plano ${planName} ativado com sucesso!`);
    
    // Log para debug
    console.log('✅ Plano atualizado com sucesso:', currentUser);
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
// VERIFICAR SE USUÁRIO PODE BAIXAR CONTRATO - VERSÃO CORRIGIDA
// =============================================

function canDownloadContract() {
    console.log('🔍 Verificando permissões de download...');
    
    if (!currentUser) {
        showNotification('❌ Faça login para baixar contratos');
        showLoginModal();
        return false;
    }
    
    console.log('👤 Usuário:', currentUser.name);
    console.log('📋 Plano atual:', currentUser.plan);
    console.log('📊 Downloads feitos:', currentUser.contractsDownloaded || 0);
    console.log('📈 Visualizações:', currentUser.contractsGenerated || 0);
    
    // VERIFICAÇÃO CORRIGIDA DOS PLANOS
    if (currentUser.plan === 'free') {
        console.log('🆓 Usuário free - Mostrando modal de upgrade');
        showUpgradeModal();
        return false;
    }
    
    // VERIFICAÇÃO DO PLANO BÁSICO CORRIGIDA
    if (currentUser.plan === 'basico') {
        const downloadsFeitos = currentUser.contractsDownloaded || 0;
        const limiteBasico = 5; // Limite do plano básico
        
        if (downloadsFeitos >= limiteBasico) {
            console.log('📉 Limite do plano básico atingido:', downloadsFeitos);
            
            // Verificar se passou 1 mês desde a última atualização do plano
            const planUpdated = new Date(currentUser.planUpdated || currentUser.joinDate);
            const now = new Date();
            const diffMonths = (now.getFullYear() - planUpdated.getFullYear()) * 12 + 
                              (now.getMonth() - planUpdated.getMonth());
            
            if (diffMonths >= 1) {
                // Resetar contador se passou 1 mês
                console.log('🔄 Passou 1 mês - Resetando contador do plano básico');
                currentUser.contractsDownloaded = 0;
                currentUser.planUpdated = now.toISOString();
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                return true;
            } else {
                // Ainda não passou 1 mês, mostrar upgrade
                showNotification('❌ Você atingiu o limite de 5 contratos deste mês. Faça upgrade para o plano profissional.');
                openPaymentModal('profissional');
                return false;
            }
        }
        
        console.log('✅ Plano básico - Downloads restantes:', (limiteBasico - downloadsFeitos));
        return true;
    }
    
    // VERIFICAÇÃO DO PLANO PROFISSIONAL CORRIGIDA
    if (currentUser.plan === 'profissional') {
        console.log('💎 Plano profissional - Download permitido');
        return true;
    }
    
    // PLANOS AVULSOS (PAGAMENTO ÚNICO)
    if (selectedPlan === 'avulsa') {
        console.log('💰 Contrato avulso - Download permitido após pagamento');
        return true;
    }
    
    console.log('⚠️ Plano não reconhecido:', currentUser.plan);
    showNotification('❌ Seu plano não foi reconhecido. Entre em contato com o suporte.');
    return false;
}

// =============================================
// CONTRATO PROFISSIONAL PLUS - GERADOR MELHORADO
// =============================================

// Coletar dados do contrato
function collectContractData() {
    // Função auxiliar para pegar valor do select com verificação
    const getSelectValue = (id) => {
        const element = document.getElementById(id);
        if (!element) return '';
        
        const value = element.value;
        const text = element.options[element.selectedIndex]?.text;
        
        // Se tem valor, retorna o texto da opção selecionada
        if (value && value !== '') {
            return text || value;
        }
        
        return ''; // Retorna vazio se não selecionado
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
        contractCity: document.getElementById('contractCity')?.value || '',
        
        contractorSignature: contractorSignature,
        contractedSignature: contractedSignature,
        
        generatedAt: new Date().toISOString()
    };
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
        return '_________________________';
    }
}

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

    // Determinar tipo de documento e formatar corretamente
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

    // Construir o contrato PROFISSIONAL PLUS
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

            <!-- CLÁUSULA 1 - IDENTIFICAÇÃO DAS PARTES -->
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

            <!-- CLÁUSULA 5 - DIREITOS E OBRIGAÇÕES -->
            <div class="contract-clause">
                <h4>CLÁUSULA QUINTA - DOS DIREITOS E OBRIGAÇÕES</h4>
                <p><strong>5.1.</strong> São obrigações do CONTRATADO:</p>
                <ol type="a">
                    <li>Executar os serviços com zelo, diligência e eficiência;</li>
                    <li>Cumprir os prazos estabelecidos;</li>
                    <li>Fornecer relatórios periódicos de andamento;</li>
                    <li>Manter sigilo sobre informações confidenciais.</li>
                </ol>
                
                <p><strong>5.2.</strong> São obrigações do CONTRANTE:</p>
                <ol type="a">
                    <li>Fornecer todas as informações necessárias;</li>
                    <li>Realizar os pagamentos nos prazos acordados;</li>
                    <li>Colaborar para a execução dos serviços;</li>
                    <li>Fornecer ambiente adequado quando necessário.</li>
                </ol>
            </div>

            <!-- CLÁUSULA 6 - CONFIDENCIALIDADE -->
            <div class="contract-clause">
                <h4>CLÁUSULA SEXTA - DA CONFIDENCIALIDADE</h4>
                <p><strong>6.1.</strong> As partes se comprometem a manter sigilo absoluto sobre todas as informações confidenciais a que tiverem acesso durante a vigência deste contrato.</p>
                <p><strong>6.2.</strong> A obrigação de confidencialidade permanecerá válida mesmo após o término do contrato.</p>
            </div>

            <!-- CLÁUSULA 7 - PROPRIEDADE INTELECTUAL -->
            <div class="contract-clause">
                <h4>CLÁUSULA SÉTIMA - DA PROPRIEDADE INTELECTUAL</h4>
                <p><strong>7.1.</strong> Todo e qualquer material intelectual produzido durante a execução deste contrato será de propriedade exclusiva do CONTRATANTE.</p>
                <p><strong>7.2.</strong> O CONTRATADO não poderá utilizar os materiais produzidos para outros clientes sem autorização por escrito.</p>
            </div>

            <!-- CLÁUSULA 8 - RESCISÃO -->
            <div class="contract-clause">
                <h4>CLÁUSULA OITAVA - DA RESCISÃO</h4>
                <p><strong>8.1.</strong> Este contrato poderá ser rescindido por qualquer das partes mediante aviso prévio de 30 (trinta) dias.</p>
                <p><strong>8.2.</strong> Em caso de descumprimento de cláusulas essenciais, a rescisão poderá ser imediata.</p>
            </div>

            <!-- CLÁUSULA 9 - PENALIDADES -->
            <div class="contract-clause">
                <h4>CLÁUSULA NONA - DAS PENALIDADES</h4>
                <p><strong>9.1.</strong> Em caso de descumprimento contratual, a parte inadimplente pagará multa equivalente a 10% (dez por cento) do valor total do contrato.</p>
            </div>

            <!-- CLÁUSULA 10 - FORÇA MAIOR -->
            <div class="contract-clause">
                <h4>CLÁUSULA DÉCIMA - DA FORÇA MAIOR</h4>
                <p><strong>10.1.</strong> Eventos de força maior que impeçam a execução do contrato não caracterizarão descumprimento.</p>
            </div>

            <!-- CLÁUSULA 11 - INDENIZAÇÃO -->
            <div class="contract-clause">
                <h4>CLÁUSULA DÉCIMA PRIMEIRA - DA INDENIZAÇÃO</h4>
                <p><strong>11.1.</strong> A parte que causar danos à outra em decorrência do descumprimento deste contrato indenizará integralmente os prejuízos causados.</p>
            </div>

            <!-- CLÁUSULA 12 - ELEIÇÃO DE FORO -->
            <div class="contract-clause">
                <h4>CLÁUSULA DÉCIMA SEGUNDA - DO FORO</h4>
                <p><strong>12.1.</strong> Para dirimir quaisquer controvérsias oriundas deste contrato, as partes elegem o foro da comarca de <strong>${data.contractCity || '________________________'}</strong>.</p>
    </div>

            <!-- CLÁUSULA 13 - DISPOSIÇÕES GERAIS -->
            <div class="contract-clause">
                <h4>CLÁUSULA DÉCIMA TERCEIRA - DAS DISPOSIÇÕES GERAIS</h4>
                <p><strong>13.1.</strong> Este contrato constitui acordo completo entre as partes.</p>
                <p><strong>13.2.</strong> Quaisquer alterações devem ser feitas por escrito e assinadas por ambas as partes.</p>
            </div>

            <!-- ÁREA DE ASSINATURAS -->
            <div class="signature-area">
                <p>E por estarem assim justos e contratados, firmam o presente instrumento em duas vias de igual teor e forma, na presença de duas testemunhas.</p>
                
                <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
                    <!-- CONTRATANTE -->
                    <div style="width: 48%; text-align: center;">
                        <p><strong>${data.contractCity || '________________________'}</strong>, ${day} de ${month} de ${year}.</p>
                        
                        <div style="margin: 1rem 0; min-height: 80px; display: flex; align-items: center; justify-content: center;">
                            ${data.contractorSignature ? `
                                <img src="${data.contractorSignature}" 
                                     style="max-width: 200px; max-height: 60px; border: 1px solid #ddd; background: white; padding: 5px;">
                            ` : '<div style="width: 100%; height: 80px; border-bottom: 1px solid #000;"></div>'}
                        </div>
                        
                        <div style="margin-top: 0.5rem; font-weight: bold;">${data.contractorName || '________________________'}</div>
                        <div style="font-style: italic; color: #666; margin-bottom: 0.3rem;">CONTRATANTE</div>
                        <div style="font-size: 0.8em; color: #555;">${contractorDocInfo.type}: ${contractorDocInfo.number}</div>
                    </div>
                    
                    <!-- CONTRATADO -->
                    <div style="width: 48%; text-align: center;">
                        <p>&nbsp;</p>
                        
                        <div style="margin: 1rem 0; min-height: 80px; display: flex; align-items: center; justify-content: center;">
                            ${data.contractedSignature ? `
                                <img src="${data.contractedSignature}" 
                                     style="max-width: 200px; max-height: 60px; border: 1px solid #ddd; background: white; padding: 5px;">
                            ` : '<div style="width: 100%; height: 80px; border-bottom: 1px solid #000;"></div>'}
                        </div>
                        
                        <div style="margin-top: 0.5rem; font-weight: bold;">${data.contractedName || '________________________'}</div>
                        <div style="font-style: italic; color: #666; margin-bottom: 0.3rem;">CONTRATADO(A)</div>
                        <div style="font-size: 0.8em; color: #555;">${contractedDocInfo.type}: ${contractedDocInfo.number}</div>
                    </div>
                </div>

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
// CORREÇÕES ESPECÍFICAS PARA MOBILE
// =============================================

// Função para corrigir problemas de toque no mobile
function initMobileTouchFix() {
    if ('ontouchstart' in window || navigator.maxTouchPoints) {
        console.log('📱 Dispositivo touch detectado - Aplicando correções...');
        
        // Corrigir comportamento de canvas em mobile
        const canvases = document.querySelectorAll('canvas');
        canvases.forEach(canvas => {
            // Remover event listeners duplicados se existirem
            canvas.removeEventListener('touchstart', handleCanvasTouch);
            canvas.removeEventListener('touchmove', handleCanvasTouch);
            
            // Adicionar novos listeners otimizados
            canvas.addEventListener('touchstart', handleCanvasTouch, { passive: false });
            canvas.addEventListener('touchmove', handleCanvasTouch, { passive: false });
        });
        
        // Corrigir visualização do contrato em mobile
        fixMobileContractView();
    }
}

// Handler otimizado para toque
function handleCanvasTouch(e) {
    // Permitir que o sistema de assinatura lide com o toque
    return true;
}

// Corrigir visualização do contrato em mobile
function fixMobileContractView() {
    const contractPreview = document.getElementById('contractPreview');
    if (!contractPreview) return;
    
    // Aplicar estilos específicos para mobile
    contractPreview.style.cssText = `
        font-size: 11px !important;
        padding: 1rem !important;
        overflow-x: auto !important;
        -webkit-overflow-scrolling: touch !important;
        background: white !important;
        width: 100% !important;
        max-width: 100vw !important;
    `;
    
    // Adicionar aviso se for muito pequeno
    if (window.innerWidth < 400) {
        contractPreview.innerHTML = `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: #666; margin-bottom: 1rem;">
                    📱 <strong>Modo Mobile Ativado</strong><br>
                    O contrato foi otimizado para visualização em celular
                </p>
                ${contractPreview.innerHTML}
            </div>
        `;
    }
}

// Inicializar correções mobile quando DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initMobileTouchFix, 1000);
});

// Redimensionamento da janela
window.addEventListener('resize', function() {
    if (window.innerWidth <= 768) {
        fixMobileContractView();
    }
});

// =============================================
// SISTEMA DE DOWNLOAD E EXPORTAÇÃO - VERSÃO CORRIGIDA
// =============================================

// Função para incrementar contador de downloads - VERSÃO CORRIGIDA
function incrementDownloadCount() {
    if (!currentUser) return;
    
    currentUser.contractsDownloaded = (currentUser.contractsDownloaded || 0) + 1;
    currentUser.lastDownload = new Date().toISOString();
    
    // Adicionar ao histórico
    currentUser.contractsHistory = currentUser.contractsHistory || [];
    currentUser.contractsHistory.push({
        id: Date.now(),
        name: `Contrato de Prestação de Serviços`,
        createdAt: new Date().toISOString(),
        downloaded: true
    });
    
    // Atualizar no localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Atualizar status bar
    updateStatusBar();
    
    console.log('✅ Download contabilizado. Total:', currentUser.contractsDownloaded);
}

// Função para gerar Word - VERSÃO CORRIGIDA
function generateWordPlus() {
    console.log('🖨️ Iniciando geração de Word...');
    
    // Validar dados antes de gerar
    const validationErrors = validateContractData();
    if (validationErrors.length > 0) {
        showNotification(`❌ Corrija os seguintes campos: ${validationErrors.join(', ')}`);
        return;
    }
    
    // Verificar se pode baixar
    if (!canDownloadContract()) {
        console.log('❌ Download não autorizado');
        return;
    }
    
    try {
        // Mostrar loading
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            const originalText = downloadBtn.querySelector('#downloadText')?.textContent || 'Baixar Contrato - R$ 6,99';
            const spinner = downloadBtn.querySelector('.spinner');
            downloadBtn.querySelector('#downloadText').textContent = 'Gerando contrato...';
            if (spinner) spinner.style.display = 'inline-block';
            downloadBtn.disabled = true;
        }
        
        // Gerar conteúdo do contrato
        const contractContent = generateProfessionalContractPlus();
        
        // Criar HTML completo para Word
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
        
        // Criar blob e link de download
        const blob = new Blob([fullHTML], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        // Nome do arquivo
        const contractorName = document.getElementById('contractorName')?.value || 'contratante';
        const cleanName = contractorName.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');
        const fileName = `Contrato_${cleanName}_${new Date().getTime()}.doc`;
        
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Incrementar contador de downloads
        incrementDownloadCount();
        
        // Mostrar notificação de sucesso
        showNotification('✅ Contrato baixado com sucesso!');
        
        // Restaurar botão
        if (downloadBtn) {
            setTimeout(() => {
                downloadBtn.querySelector('#downloadText').textContent = originalText;
                const spinner = downloadBtn.querySelector('.spinner');
                if (spinner) spinner.style.display = 'none';
                downloadBtn.disabled = false;
            }, 1000);
        }
        
    } catch (error) {
        console.error('❌ Erro ao gerar documento Word:', error);
        showNotification('❌ Erro ao baixar contrato. Tente novamente.');
        
        // Restaurar botão em caso de erro
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.querySelector('#downloadText').textContent = 'Baixar Contrato - R$ 6,99';
            const spinner = downloadBtn.querySelector('.spinner');
            if (spinner) spinner.style.display = 'none';
            downloadBtn.disabled = false;
        }
    }
}

// =============================================
// SISTEMA DE VISUALIZAÇÃO EM MODAL (REMOVIDA)
// =============================================

// REMOVER ou COMENTAR as funções relacionadas ao view-contract.html
// Essas funções não são mais necessárias

// =============================================
// SISTEMA DE MOBILE
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
// Função para alternar FAQ
function toggleFAQ(element) {
    const faqItem = element.parentElement;
    const answer = element.nextElementSibling;
    const toggleIcon = element.querySelector('.faq-toggle i');
    
    // Fechar todos os outros itens (opcional - remove se quiser múltiplos abertos)
    const allFaqItems = document.querySelectorAll('.faq-item');
    allFaqItems.forEach(item => {
        if (item !== faqItem && item.classList.contains('active')) {
            item.classList.remove('active');
            const otherAnswer = item.querySelector('.faq-answer');
            const otherIcon = item.querySelector('.faq-toggle i');
            otherAnswer.style.maxHeight = null;
            otherIcon.classList.remove('fa-chevron-down');
            otherIcon.classList.add('fa-chevron-right');
        }
    });
    
    // Alternar classe 'active' no item atual
    faqItem.classList.toggle('active');
    
    // Alternar altura da resposta
    if (answer.style.maxHeight) {
        answer.style.maxHeight = null;
        // Mudar ícone para chevron-right
        toggleIcon.classList.remove('fa-chevron-down');
        toggleIcon.classList.add('fa-chevron-right');
    } else {
        answer.style.maxHeight = answer.scrollHeight + "px";
        // Mudar ícone para chevron-down
        toggleIcon.classList.remove('fa-chevron-right');
        toggleIcon.classList.add('fa-chevron-down');
    }
}

// Inicializar FAQ após carregamento da página
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar event listeners para teclado (acessibilidade)
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleFAQ(this);
            }
        });
        
        // Adicionar role para acessibilidade
        question.setAttribute('role', 'button');
        question.setAttribute('tabindex', '0');
        question.setAttribute('aria-expanded', 'false');
        
        question.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
        });
    });
});

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
        contactModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// Fechar modal de contato
function closeContactModal() {
    const contactModal = document.getElementById('contactModal');
    if (contactModal) {
        contactModal.style.display = 'none';
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
            
            // Restaurar botão
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
}

// Função para validar email
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// =============================================
// FUNÇÕES UTILITÁRIAS FINAIS
// =============================================

// Sistema de notificações
function showNotification(message, type = 'success') {
    // Remover notificações anteriores
    const existing = document.querySelectorAll('.custom-notification');
    existing.forEach(el => el.remove());

    const notification = document.createElement('div');
    notification.className = `custom-notification`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;

    document.body.appendChild(notification);

    // Adicionar estilos de animação
    const style = document.createElement('style');
    if (!document.querySelector('#notification-styles')) {
        style.id = 'notification-styles';
        style.textContent = `
            .custom-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                animation: slideIn 0.3s ease;
                max-width: 300px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .custom-notification button {
                background: none;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
                margin-left: 10px;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease';
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Scroll para o gerador
function scrollToGenerator() {
    document.getElementById('generator').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
    showNotification('🎯 Agora crie seu contrato profissional!');
}

// Modal de upgrade persuasivo
function showUpgradeModal() {
    const modal = document.createElement('div');
    modal.className = 'modal upgrade-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3000;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div class="modal-content" style="background: white; border-radius: 12px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto;">
            <div class="modal-header" style="padding: 1.5rem; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; color: #2c5aa0;">🚀 Upgrade Necessário</h3>
                <button class="close-modal" onclick="this.closest('.modal').remove(); document.body.style.overflow='auto'" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #666;">&times;</button>
            </div>
            <div class="modal-body" style="padding: 1.5rem;">
                <div class="upgrade-content">
                    <div class="upgrade-header" style="text-align: center; margin-bottom: 1.5rem;">
                        <h4 style="color: #2c5aa0; margin-bottom: 0.5rem;">Seu Contrato Está Quase Pronto!</h4>
                        <p style="color: #666;">Você já criou um contrato profissional. Agora falta pouco para ter acesso completo:</p>
                    </div>
                    
                    <div class="benefits-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
                        <div class="benefit-card" style="text-align: center; padding: 1rem; border: 1px solid #e0e0e0; border-radius: 8px;">
                            <i class="fas fa-download" style="font-size: 2rem; color: #2c5aa0; margin-bottom: 0.5rem;"></i>
                            <strong style="display: block; margin-bottom: 0.3rem;">Download Imediato</strong>
                            <p style="font-size: 0.8rem; color: #666; margin: 0;">Baixe em Word e PDF</p>
                        </div>
                        <div class="benefit-card" style="text-align: center; padding: 1rem; border: 1px solid #e0e0e0; border-radius: 8px;">
                            <i class="fas fa-edit" style="font-size: 2rem; color: #2c5aa0; margin-bottom: 0.5rem;"></i>
                            <strong style="display: block; margin-bottom: 0.3rem;">Edição Completa</strong>
                            <p style="font-size: 0.8rem; color: #666; margin: 0;">Modifique quando quiser</p>
                        </div>
                        <div class="benefit-card" style="text-align: center; padding: 1rem; border: 1px solid #e0e0e0; border-radius: 8px;">
                            <i class="fas fa-shield-alt" style="font-size: 2rem; color: #2c5aa0; margin-bottom: 0.5rem;"></i>
                            <strong style="display: block; margin-bottom: 0.3rem;">Proteção Total</strong>
                            <p style="font-size: 0.8rem; color: #666; margin: 0;">Cláusulas jurídicas</p>
                        </div>
                    </div>
                    
                    <div class="upgrade-options" style="display: grid; grid-template-columns: 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                        <div class="upgrade-option featured" style="border: 2px solid #2c5aa0; border-radius: 12px; padding: 1.5rem; position: relative;">
                            <div style="position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background: #2c5aa0; color: white; padding: 0.3rem 1rem; border-radius: 20px; font-size: 0.8rem; font-weight: bold;">
                                💎 MAIS POPULAR
                            </div>
                            <div class="option-header" style="text-align: center; margin-bottom: 1rem;">
                                <div style="font-size: 1.8rem; font-weight: bold; color: #2c5aa0;">R$ 6,99</div>
                                <div style="color: #666; font-size: 0.9rem;">por contrato</div>
                            </div>
                            <ul style="list-style: none; padding: 0; margin-bottom: 1rem;">
                                <li style="padding: 0.3rem 0; display: flex; align-items: center; gap: 0.5rem;"><i class="fas fa-check" style="color: #28a745;"></i> Download imediato</li>
                                <li style="padding: 0.3rem 0; display: flex; align-items: center; gap: 0.5rem;"><i class="fas fa-check" style="color: #28a745;"></i> Contrato editável</li>
                                <li style="padding: 0.3rem 0; display: flex; align-items: center; gap: 0.5rem;"><i class="fas fa-check" style="color: #28a745;"></i> Formato Word + PDF</li>
                                <li style="padding: 0.3rem 0; display: flex; align-items: center; gap: 0.5rem;"><i class="fas fa-check" style="color: #28a745;"></i> Reutilizável</li>
                            </ul>
                            <button class="btn btn-success" onclick="openPaymentModal('avulsa'); this.closest('.modal').remove(); document.body.style.overflow='auto'" style="width: 100%; padding: 0.8rem; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
                                <i class="fas fa-bolt"></i> Comprar Agora
                            </button>
                        </div>
                        
                        <div class="upgrade-option" style="border: 1px solid #e0e0e0; border-radius: 12px; padding: 1.5rem;">
                            <div class="option-header" style="text-align: center; margin-bottom: 1rem;">
                                <div style="font-size: 1.8rem; font-weight: bold; color: #2c5aa0;">R$ 29,99</div>
                                <div style="color: #666; font-size: 0.9rem;">por mês</div>
                            </div>
                            <ul style="list-style: none; padding: 0; margin-bottom: 1rem;">
                                <li style="padding: 0.3rem 0; display: flex; align-items: center; gap: 0.5rem;"><i class="fas fa-check" style="color: #28a745;"></i> Contratos Ilimitados</li>
                                <li style="padding: 0.3rem 0; display: flex; align-items: center; gap: 0.5rem;"><i class="fas fa-check" style="color: #28a745;"></i> Todos os modelos</li>
                                <li style="padding: 0.3rem 0; display: flex; align-items: center; gap: 0.5rem;"><i class="fas fa-check" style="color: #28a745;"></i> Suporte prioritário</li>
                                <li style="padding: 0.3rem 0; display: flex; align-items: center; gap: 0.5rem;"><i class="fas fa-check" style="color: #28a745;"></i> Armazenamento</li>
                            </ul>
                            <button class="btn" onclick="openPaymentModal('profissional'); this.closest('.modal').remove(); document.body.style.overflow='auto'" style="width: 100%; padding: 0.8rem; background: #2c5aa0; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
                                <i class="fas fa-crown"></i> Assinar Plano
                            </button>
                        </div>
                    </div>
                    
                    <div class="risk-warning" style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; text-align: center;">
                        <p style="margin: 0; color: #856404;"><strong>⚠️ Não arrisque:</strong> Um contrato mal elaborado pode custar muito mais que R$ 6,99</p>
                    </div>
                    
                    <div class="upgrade-footer">
                        <button class="btn-login" onclick="this.closest('.modal').remove(); document.body.style.overflow='auto'" style="width: 100%; padding: 0.8rem; background: #666; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
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

// Função para tratar erro no vídeo
function handleVideoError() {
    const videoWrapper = document.getElementById('videoWrapper');
    const videoFallback = document.getElementById('videoFallback');
    
    if (videoWrapper && videoFallback) {
        videoWrapper.style.display = 'none';
        videoFallback.style.display = 'block';
    }
}

// =============================================
// EXPORTAÇÃO DE FUNÇÕES GLOBAIS
// =============================================

// Funções principais
window.scrollToGenerator = scrollToGenerator;
window.showUpgradeModal = showUpgradeModal;
window.handleGoogleSignIn = handleGoogleSignIn;
window.showLoginModal = showLoginModal;
window.closeLoginModal = closeLoginModal;
window.selectSignatureOption = selectSignatureOption;
window.handleSignatureUpload = handleSignatureUpload;
window.clearSignature = clearSignature;
window.confirmSignature = confirmSignature;
window.updatePreview = updatePreview;
window.openPaymentModal = openPaymentModal;
window.closePaymentModal = closePaymentModal;
window.selectPayment = selectPayment;
window.generateWordPlus = generateWordPlus;
window.canDownloadContract = canDownloadContract;
window.showContactModal = showContactModal;
window.closeContactModal = closeContactModal;
window.submitContactForm = submitContactForm;
window.handleVideoError = handleVideoError;
window.signOut = signOut;

// Funções utilitárias
window.formatCurrencyInput = formatCurrencyInput;
window.handleFormInput = handleFormInput;
window.validateContractData = validateContractData;
window.validateCPFCNPJ = validateCPFCNPJ;
window.updateStatusBar = updateStatusBar;
window.getMonthName = getMonthName;
window.formatarValorExtenso = formatarValorExtenso;
window.incrementContractCount = incrementContractCount;
window.updateUIAfterLogin = updateUIAfterLogin;
window.updateUIAfterLogout = updateUIAfterLogout;
window.checkUserLogin = checkUserLogin;
window.initMobileMenu = initMobileMenu;
window.initSignatureSystem = initSignatureSystem;
window.setupEventListeners = setupEventListeners;
window.initDateSettings = initDateSettings;
window.setupAutoPreview = setupAutoPreview;
window.setupContactForm = setupContactForm;
window.validateEmail = validateEmail;
window.generateProfessionalContractPlus = generateProfessionalContractPlus;
window.collectContractData = collectContractData;
window.incrementDownloadCount = incrementDownloadCount;

// Funções de navegação
window.goBack = function() {
    if (document.referrer.includes('index.html') || document.referrer.includes(window.location.origin)) {
        window.history.back();
    } else {
        window.location.href = 'index.html';
    };
}

console.log('✅ script.js carregado com sucesso!');
// ===== FUNÇÕES PARA MODAIS DE PAGAMENTO =====

// Função para abrir modal de login
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Função para fechar modal de login
function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Função para abrir modal de pagamento
function openPaymentModal(plan) {
    const modal = document.getElementById('paymentModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalPlanDescription = document.getElementById('modalPlanDescription');
    const modalPrice = document.getElementById('modalPrice');
    const pixValue = document.getElementById('pixValue');
    const cardValue = document.getElementById('cardValue');
    
    let price = '';
    let planName = '';
    let description = '';
    
    // Definir informações do plano
    switch(plan) {
        case 'basico':
            price = '9,99';
            planName = 'Plano Básico';
            description = 'Plano Básico - R$ 9,99/mês (5 contratos por mês)';
            break;
        case 'profissional':
            price = '29,99';
            planName = 'Plano Profissional';
            description = 'Plano Profissional - R$ 29,99/mês (Downloads ilimitados)';
            break;
        default:
            price = '6,99';
            planName = 'Contrato Avulso';
            description = 'Contrato Avulso - R$ 6,99 por contrato';
    }
    
    // Atualizar informações no modal
    modalTitle.textContent = `Assinar ${planName}`;
    modalPlanDescription.textContent = description;
    modalPrice.textContent = `Total: R$ ${price}`;
    pixValue.textContent = `R$ ${price}`;
    cardValue.textContent = `R$ ${price}`;
    
    // Criar links de pagamento
    const pixLink = document.getElementById('pixLink');
    const cardLink = document.getElementById('cardLink');
    
    // Gerar link Mercado Pago (exemplo - você precisa configurar seu link real)
    const pixPaymentLink = `https://www.mercadopago.com.br/checkout/v1/payment/redirect?preference-id=${generatePreferenceId(plan)}`;
    const cardPaymentLink = `https://www.mercadopago.com.br/checkout/v1/payment/redirect?preference-id=${generatePreferenceId(plan)}&payment-method=card`;
    
    pixLink.href = pixPaymentLink;
    cardLink.href = cardPaymentLink;
    
    // Abrir modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Esconder detalhes de pagamento
    document.getElementById('pixDetails').style.display = 'none';
    document.getElementById('cardDetails').style.display = 'none';
}

// Função para fechar modal de pagamento
function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Função para selecionar método de pagamento
function selectPayment(element, method) {
    // Remover seleção de todos
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Adicionar seleção ao elemento clicado
    element.classList.add('selected');
    
    // Mostrar detalhes do método selecionado
    document.getElementById('pixDetails').style.display = method === 'pix' ? 'block' : 'none';
    document.getElementById('cardDetails').style.display = method === 'cartao' ? 'block' : 'none';
}

// Função para gerar ID de preferência (exemplo)
function generatePreferenceId(plan) {
    const planIds = {
        'basico': 'PLANO-BASICO-999',
        'profissional': 'PLANO-PRO-2999',
        'avulso': 'CONTRATO-AVULSO-699'
    };
    return planIds[plan] || 'DEFAULT-PLAN';
}

// ===== FUNÇÕES DO GOOGLE SIGN-IN =====

// Configurar Google Sign-In
function initializeGoogleSignIn() {
    if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
            client_id: '395303260900-usl0idov344ud7qo9ptr82mnmqfidebd.apps.googleusercontent.com',
            callback: handleGoogleSignIn,
            auto_select: false,
            cancel_on_tap_outside: true
        });
        
        // Renderizar botão nos modais que precisam
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            google.accounts.id.renderButton(
                document.querySelector('#g_id_onload'),
                { theme: "filled_blue", size: "large", width: 300 }
            );
        }
    }
}

// Handler para login com Google
function handleGoogleSignIn(response) {
    console.log('Google Sign-In response:', response);
    
    // Decodificar credencial JWT
    const responsePayload = decodeJWTResponse(response.credential);
    
    if (responsePayload) {
        console.log('User info:', responsePayload);
        
        // Salvar dados do usuário
        localStorage.setItem('userEmail', responsePayload.email);
        localStorage.setItem('userName', responsePayload.name);
        localStorage.setItem('userPicture', responsePayload.picture);
        localStorage.setItem('userToken', response.credential);
        
        // Mostrar mensagem de sucesso
        showNotification('Login realizado com sucesso!', 'success');
        
        // Fechar modal de login
        closeLoginModal();
        
        // Redirecionar para criar contrato
        setTimeout(() => {
            window.location.href = 'index.html#generator';
        }, 1500);
    }
}

// Função para decodificar JWT
function decodeJWTResponse(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
}

// ===== FUNÇÃO DE NOTIFICAÇÃO =====

function showNotification(message, type = 'info') {
    // Remover notificação existente
    const existingNotification = document.querySelector('.custom-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Criar nova notificação
    const notification = document.createElement('div');
    notification.className = `custom-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Adicionar ao corpo
    document.body.appendChild(notification);
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// ===== EVENT LISTENERS =====

document.addEventListener('DOMContentLoaded', function() {
    // Fechar modais ao clicar fora
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
    
    // Fechar modais com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
            });
            document.body.style.overflow = 'auto';
        }
    });
    
    // Inicializar Google Sign-In
    if (document.getElementById('loginModal')) {
        // Carregar script Google se não estiver carregado
        if (!document.querySelector('script[src*="accounts.google.com"]')) {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = initializeGoogleSignIn;
            document.head.appendChild(script);
        } else {
            initializeGoogleSignIn();
        }
    }
    
    // Adicionar accordion para mobile FAQ
    const detailsElements = document.querySelectorAll('details');
    detailsElements.forEach(details => {
        details.addEventListener('toggle', function() {
            if (this.open) {
                // Fechar outros details
                detailsElements.forEach(otherDetails => {
                    if (otherDetails !== this) {
                        otherDetails.open = false;
                    }
                });
            }
        });
    });
});
// Adicione ao final do script.js, antes das exportações:

// ===== CORREÇÕES MOBILE OTIMIZADAS =====
function initMobileCorrections() {
    console.log('📱 Inicializando correções mobile otimizadas...');
    
    // 1. Prevenir zoom duplo-toque
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(e) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false });
    
    // 2. Layout responsivo com debounce
    function fixMobileLayout() {
        if (window.innerWidth <= 768) {
            const generatorContainer = document.querySelector('.generator-container');
            const contractPreview = document.getElementById('contractPreview');
            
            if (generatorContainer) {
                generatorContainer.style.display = 'flex';
                generatorContainer.style.flexDirection = 'column';
            }
            
            if (contractPreview) {
                contractPreview.style.width = '100%';
                contractPreview.style.minWidth = '100%';
                contractPreview.style.fontSize = '12px';
            }
        }
    }
    
    // Debounce para evitar execução excessiva
    let resizeTimeout;
    function debouncedFixMobileLayout() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(fixMobileLayout, 250);
    }
    
    // Executar uma vez no carregamento
    setTimeout(fixMobileLayout, 100);
    
    // Redimensionamento com debounce
    window.addEventListener('resize', debouncedFixMobileLayout);
    
    // 3. Cleanup ao sair da página
    window.addEventListener('beforeunload', function() {
        window.removeEventListener('resize', debouncedFixMobileLayout);
    });
}

// Adicionar ao DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // ... código existente ...
    
    // Adicionar esta linha:
    initMobileCorrections();
    
    // ... resto do código ...
});

// ===== FUNÇÃO DE VISUALIZAÇÃO SEGURA CORRIGIDA =====
function openSecurePreview() {
    if (!currentUser) {
        showNotification('🔐 Faça login para visualizar contratos');
        showLoginModal();
        return;
    }
    
    const validationErrors = validateContractData();
    if (validationErrors.length > 0) {
        showNotification(`❌ Corrija: ${validationErrors.join(', ')}`);
        return;
    }
    
    try {
        // Coletar dados
        const contractData = collectContractData();
        
        // Usar localStorage para passar dados
        localStorage.setItem('tempContractData', JSON.stringify(contractData));
        localStorage.setItem('tempContractTimestamp', Date.now().toString());
        
        // Abrir em nova aba
        const newWindow = window.open('view-contract.html', '_blank', 'width=1200,height=700');
        
        if (!newWindow) {
            // Pop-up bloqueado, usar mesma janela
            window.location.href = 'view-contract.html';
        }
        
    } catch (error) {
        console.error('Erro ao abrir visualização:', error);
        showNotification('❌ Erro ao abrir visualização');
    }
}

// Exportar para uso global
window.openSecurePreview = openSecurePreview;
