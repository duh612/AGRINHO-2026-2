// ==========================================
// NAVEGAÇÃO E MENU MOBILE
// ==========================================
const btnMenu = document.querySelector('.btn-menu');
const nav = document.getElementById('nav');
const header = document.getElementById('header');

btnMenu.addEventListener('click', () => {
    const isExpanded = btnMenu.getAttribute('aria-expanded') === 'true';
    btnMenu.setAttribute('aria-expanded', !isExpanded);
    nav.classList.toggle('active');
    btnMenu.textContent = isExpanded ? '☰' : '✕';
});

// Fechar menu ao clicar em um link
nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.remove('active');
        btnMenu.setAttribute('aria-expanded', 'false');
        btnMenu.textContent = '☰';
    });
});

// Header scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// ==========================================
// ANIMAÇÃO DE SCROLL
// ==========================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            
            // Animar números se for stat-item
            const statNumber = entry.target.querySelector('.stat-number');
            if (statNumber) {
                animateNumber(statNumber);
            }
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// ==========================================
// ANIMAÇÃO DE NÚMEROS
// ==========================================
function animateNumber(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            element.textContent = target + (target === 100 ? '%' : '+');
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// ==========================================
// MODAL CALCULADORA
// ==========================================
const modal = document.getElementById('modal-calculator');

function openModal() {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Focar no primeiro input para acessibilidade
    setTimeout(() => {
        document.getElementById('area').focus();
    }, 100);
}

function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    // Limpar resultados
    document.getElementById('calc-result').classList.remove('active');
    document.getElementById('calc-form').reset();
}

// Fechar ao clicar fora
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Fechar com ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

// Trap de foco no modal
modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    
    const focusable = modal.querySelectorAll('button, input, select');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
    }
});

// ==========================================
// LÓGICA DA CALCULADORA
// ==========================================
function calculateImpact(event) {
    event.preventDefault();

    const area = parseFloat(document.getElementById('area').value);
    const atividade = document.getElementById('atividade').value;
    const emissaoInput = parseFloat(document.getElementById('emissao').value) || 0;
    const arvores = parseInt(document.getElementById('arvores').value) || 0;

    // Validação
    if (isNaN(area) || area <= 0) {
        alert('Por favor, insira uma área válida maior que zero.');
        document.getElementById('area').focus();
        return;
    }

    if (!atividade) {
        alert('Por favor, selecione o tipo de atividade.');
        document.getElementById('atividade').focus();
        return;
    }

    // Fatores de emissão médios (ton CO₂/ha/ano)
    const fatoresEmissao = {
        'lavoura': 2.0,
        'pecuaria': 7.5,
        'pecuaria-leite': 6.0,
        'ilpf': 3.0,
        'floresta': -5.0 // Sequestro de carbono
    };

    const emissaoPorHa = emissaoInput || fatoresEmissao[atividade] || 2.0;
    const emissaoTotal = area * emissaoPorHa;
    
    // Sequestro de carbono pelas árvores (média: 0.02 ton CO₂/árvore/ano)
    const sequestroArvores = arvores * 0.02;
    const emissaoLiquida = emissaoTotal - sequestroArvores;

    // Custo estimado de mitigação (R$ 10 por tonelada)
    const custoPorTon = 10;
    const custoMitigacao = Math.max(0, emissaoLiquida) * custoPorTon;

    // Árvores necessárias para compensar (1 árvore sequestra ~0.02 ton/ano)
    const arvoresNecessarias = Math.ceil(Math.max(0, emissaoLiquida) / 0.02);

    // Exibir resultados
    const resultBox = document.getElementById('calc-result');
    const resultContent = document.getElementById('result-content');
    
    resultContent.innerHTML = `
        <div class="result-item">
            <span>Emissão Total Estimada:</span>
            <strong>${formatNumber(emissaoTotal)} ton CO₂/ano</strong>
        </div>
        <div class="result-item">
            <span>Sequestro pelas Árvores:</span>
            <strong style="color: var(--secondary-green);">-${formatNumber(sequestroArvores)} ton CO₂/ano</strong>
        </div>
        <div class="result-item" style="background: var(--light-bg); padding: 0.5rem; margin-top: 0.5rem; border-radius: 5px;">
            <span>Emissão Líquida:</span>
            <strong style="color: ${emissaoLiquida > 0 ? '#e74c3c' : '#27ae60'};">
                ${formatNumber(emissaoLiquida)} ton CO₂/ano
            </strong>
        </div>
        <div class="result-item">
            <span>Custo Estimado de Mitigação:</span>
            <strong>R$ ${formatNumber(custoMitigacao)}</strong>
        </div>
        <div class="result-item">
            <span>Árvores para Compensação Total:</span>
            <strong>${formatNumber(arvoresNecessarias)} árvores</strong>
        </div>
    `;

    // Gerar recomendações
    const recommendations = document.getElementById('recommendations');
    recommendations.innerHTML = generateRecommendations(atividade, emissaoLiquida, arvores, arvoresNecessarias);

    resultBox.classList.add('active');
    
    // Scroll para o resultado
    setTimeout(() => {
        resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

function generateRecommendations(atividade, emissaoLiquida, arvoresAtuais, arvoresNecessarias) {
    const recs = [];

    if (emissaoLiquida > 0) {
        recs.push(`<li>🌳 <strong>Plante mais árvores:</strong> Você precisa de aproximadamente ${formatNumber(arvoresNecessarias - arvoresAtuais)} árvores adicionais para compensar suas emissões.</li>`);
    }

    switch(atividade) {
        case 'pecuaria':
        case 'pecuaria-leite':
            recs.push(`<li>🐄 <strong>Implemente ILPF:</strong> A integração lavoura-pecuária-floresta pode reduzir emissões em até 60%.</li>`);
            recs.push(`<li>🌾 <strong>Recupere pastagens:</strong> Pastagens degradadas emitem mais metano. A recuperação melhora a produtividade e reduz emissões.</li>`);
            break;
        case 'lavoura':
            recs.push(`<li>🌱 <strong>Adote plantio direto:</strong> Essa técnica preserva o solo e sequestra carbono.</li>`);
            recs.push(`<li>🔄 <strong>Pratique rotação de culturas:</strong> Melhora a saúde do solo e reduz necessidade de fertilizantes.</li>`);
            break;
        case 'ilpf':
            recs.push(`<li>✅ <strong>Parabéns!</strong> Você já utiliza um dos sistemas mais sustentáveis. Continue monitorando e melhorando!</li>`);
            break;
    }

    if (emissaoLiquida > 0) {
        recs.push(`<li>☀️ <strong>Invista em energia renovável:</strong> Painéis solares e biodigestores reduzem custos e emissões.</li>`);
        recs.push(`<li>💧 <strong>Otimize o uso da água:</strong> Sistemas de irrigação eficientes economizam água e energia.</li>`);
    }

    return recs.join('');
}

function formatNumber(num) {
    return num.toLocaleString('pt-BR', { 
        minimumFractionDigits: 1, 
        maximumFractionDigits: 2 
    });
}

// ==========================================
// SMOOTH SCROLL PARA LINKS
// ==========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            const target = document.querySelector(href);
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ==========================================
// ATUALIZAÇÃO DINÂMICA DE CONTEÚDO
// ==========================================
// Atualizar fator de emissão automaticamente baseado na atividade
document.getElementById('atividade')?.addEventListener('change', function() {
    const fatores = {
        'lavoura': '2.0',
        'pecuaria': '7.5',
        'pecuaria-leite': '6.0',
        'ilpf': '3.0',
        'floresta': '-5.0'
    };
    
    const emissaoInput = document.getElementById('emissao');
    if (this.value && !emissaoInput.value) {
        emissaoInput.value = fatores[this.value] || '';
        emissaoInput.style.background = '#f5f9f5';
    }
});

// ==========================================
// PERFORMANCE: LAZY LOADING PARA IMAGENS
// ==========================================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ==========================================
// ANALYTICS SIMPLIFICADO (opcional)
// ==========================================
// Registrar interações importantes
const interactions = {
    calculatorOpens: 0,
    calculations: 0,
    timeOnPage: 0
};

// Track calculator opens
window.trackCalculatorOpen = function() {
    interactions.calculatorOpens++;
    console.log('Calculadora aberta:', interactions.calculatorOpens, 'vezes');
};

// Track calculations
const originalCalculate = calculateImpact;
calculateImpact = function(e) {
    interactions.calculations++;
    console.log('Cálculos realizados:', interactions.calculations);
    originalCalculate.call(this, e);
};

// Track time on page
setInterval(() => {
    interactions.timeOnPage++;
}, 60000); // A cada minuto

// ==========================================
// MENSAGEM DE BOAS-VINDAS NO CONSOLE
// ==========================================
console.log('%c🌱 AgroFuturo - Agro Forte, Futuro Sustentável', 'color: #2d5a27; font-size: 20px; font-weight: bold;');
console.log('%cProjeto desenvolvido para o Programa Agrinho 2026', 'color: #4caf50; font-size: 14px;');
console.log('%cTema: Equilíbrio entre produção e meio ambiente', 'color: #81c784; font-size: 12px;');
