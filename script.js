// Mobile Menu Toggle
function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
}

// Função atualizada para selecionar pagamento
function selectPayment(element, type) {
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    if (element) {
        element.classList.add('selected');
        
        // Esconder todos os detalhes primeiro
        document.getElementById('pixDetails').style.display = 'none';
        document.getElementById('cardDetails').style.display = 'none';
        
        // Mostrar detalhes específicos
        if (type === 'pix') {
            document.getElementById('pixDetails').style.display = 'block';
            selectedPaymentMethod = 'pix';
        } else if (type === 'cartao') {
            document.getElementById('cardDetails').style.display = 'block';
            selectedPaymentMethod = 'cartao';
        }
    }
}

// Função para redirecionar para pagamento PIX
function redirectToPix() {
    window.open('https://mpago.la/1FgMNje', '_blank');
    showDownloadOptions();
}

// Inicialização quando DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    updatePreview();
    
    // Configurar datas
    const today = new Date().toISOString().split('T')[0];
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (startDateInput) {
        startDateInput.min = today;
    }
    
    if (startDateInput && endDateInput) {
        startDateInput.addEventListener('change', function() {
            endDateInput.min = this.value;
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
            value = (value / 100).toFixed(2).replace('.', ',');
            value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
            e.target.value = value;
            updatePreview();
        });
    }
});
