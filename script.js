// Função para gerar o contrato PROFISSIONAL CORRETAMENTE PREENCHIDO
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

    // Formatar valor por extenso (função simplificada)
    function valorPorExtenso(valor) {
        if (!valor || valor === '__________') return '_________________________';
        // Aqui você pode implementar uma função mais robusta para converter números em extenso
        return `(${valor} reais)`;
    }

    // Construir o contrato PROFISSIONAL CORRETAMENTE PREENCHIDO
    const contractHTML = `
        <div class="contract-header">
            <div class="contract-title">CONTRATO DE PRESTAÇÃO DE SERVIÇOS</div>
        </div>
        
        <div class="contract-body">
            <div class="contract-intro">
                <p>Pelo presente instrumento de <strong>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</strong> que celebram entre si, de um lado <strong>${contractorName}</strong>, nacionalidade brasileira, estado civil ______________, profissão <strong>${contractorProfession}</strong>, portador do documento <strong>${contractorDoc}</strong>, residente e domiciliado à <strong>${contractorAddress}</strong>, doravante denominado <strong>CONTRATANTE</strong>, e de outro lado <strong>${contractedName}</strong>, nacionalidade brasileira, estado civil ______________, profissão <strong>${contractedProfession}</strong>, portador do documento <strong>${contractedDoc}</strong>, residente e domiciliado à <strong>${contractedAddress}</strong>, doravante denominado <strong>CONTRATADO(A)</strong>, pelas cláusulas pactuadas a seguir:</p>
            </div>

            <div class="contract-clause">
                <h4>CLÁUSULA PRIMEIRA - DO OBJETO</h4>
                <p>O presente contrato tem por OBJETO a prestação de serviço de <strong>${serviceDescription}</strong>, a ser realizado no período compreendido entre <strong>${formatDate(startDate)}</strong> e <strong>${formatDate(endDate)}</strong>.</p>
            </div>

            <div class="contract-clause">
                <h4>CLÁUSULA SEGUNDA - DO VALOR E FORMA DE PAGAMENTO</h4>
                <p>O <strong>CONTRATANTE</strong> obriga-se a pagar ao <strong>CONTRATADO(A)</strong> a importância de <strong>R$ ${serviceValue}</strong> ${valorPorExtenso(serviceValue)}, a ser pago na seguinte forma: <strong>${paymentMethodText}</strong>.</p>
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
                
                <div class="signature-line">
                    <div class="signature-box">
                        <p><strong>${contractCity}</strong>, ${new Date().getDate()} de ${getMonthName(new Date().getMonth())} de ${new Date().getFullYear()}</p>
                        <div class="signature-space"></div>
                        <p><strong>${contractorName}</strong></p>
                        <p><strong>CONTRATANTE</strong></p>
                        <p>Documento: ${contractorDoc}</p>
                    </div>
                    
                    <div class="signature-box">
                        <p>&nbsp;</p>
                        <div class="signature-space"></div>
                        <p><strong>${contractedName}</strong></p>
                        <p><strong>CONTRATADO(A)</strong></p>
                        <p>Documento: ${contractedDoc}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return contractHTML;
}

// Função auxiliar para obter nome do mês
function getMonthName(monthIndex) {
    const months = [
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    return months[monthIndex];
}

// Função para formatar valor por extenso (mais robusta)
function formatarValorExtenso(valor) {
    if (!valor || isNaN(valor)) return '_________________________';
    
    const numeros = [
        'zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove',
        'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 
        'dezoito', 'dezenove'
    ];
    
    const dezenas = [
        '', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 
        'oitenta', 'noventa'
    ];
    
    const centenas = [
        '', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 
        'seiscentos', 'setecentos', 'oitocentos', 'novecentos'
    ];
    
    let valorNumero = parseFloat(valor.replace(',', '.'));
    let inteiro = Math.floor(valorNumero);
    let decimal = Math.round((valorNumero - inteiro) * 100);
    
    if (inteiro === 0) {
        return 'zero reais';
    }
    
    let extenso = '';
    
    // Parte inteira
    if (inteiro === 100) {
        extenso = 'cem';
    } else if (inteiro < 20) {
        extenso = numeros[inteiro];
    } else if (inteiro < 100) {
        extenso = dezenas[Math.floor(inteiro / 10)];
        if (inteiro % 10 !== 0) {
            extenso += ' e ' + numeros[inteiro % 10];
        }
    } else {
        extenso = centenas[Math.floor(inteiro / 100)];
        let resto = inteiro % 100;
        if (resto !== 0) {
            if (resto < 20) {
                extenso += ' e ' + numeros[resto];
            } else {
                extenso += ' e ' + dezenas[Math.floor(resto / 10)];
                if (resto % 10 !== 0) {
                    extenso += ' e ' + numeros[resto % 10];
                }
            }
        }
    }
    
    extenso += inteiro === 1 ? ' real' : ' reais';
    
    // Parte decimal
    if (decimal > 0) {
        extenso += ' e ';
        if (decimal < 20) {
            extenso += numeros[decimal];
        } else {
            extenso += dezenas[Math.floor(decimal / 10)];
            if (decimal % 10 !== 0) {
                extenso += ' e ' + numeros[decimal % 10];
            }
        }
        extenso += decimal === 1 ? ' centavo' : ' centavos';
    }
    
    return extenso;
}

// Atualizar a função valorPorExtenso para usar a nova formatação
function valorPorExtenso(valor) {
    if (!valor || valor === '__________') return '_________________________';
    try {
        return `(${formatarValorExtenso(valor)})`;
    } catch (e) {
        return '_________________________';
    }
}
