// ==========================================
// AGROFUTURO - SCRIPT PRINCIPAL (ES6+)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. NAVEGAÇÃO E HEADER
    // ==========================================
    const header = document.getElementById('header');
    const btnMenu = document.querySelector('.btn-menu');
    const nav = document.getElementById('nav');
    const menuIcon = btnMenu.querySelector('.menu-icon');

    // Efeito de scroll no header
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Toggle do menu mobile
    btnMenu.addEventListener('click', () => {
        const isExpanded = btnMenu.getAttribute('aria-expanded') === 'true';
        btnMenu.setAttribute('aria-expanded', !isExpanded);
        nav.classList.toggle('active');
        menuIcon.textContent = isExpanded ? '☰' : '✕';
    });

    // Fechar menu ao clicar em um link
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            btnMenu.setAttribute('aria-expanded', 'false');
            menuIcon.textContent = '☰';
        });
    });

    // ==========================================
    // 2. ANIMAÇÕES DE SCROLL E CONTADORES
    // ==========================================
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Animação de números nas estatísticas
                const statNumber = entry.target.querySelector('.stat-number');
                if (statNumber && !statNumber.classList.contains('animated')) {
                    animateCounter(statNumber);
                    statNumber.classList.add('animated');
                }
                
                // Parar de observar após animar
                scrollObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => {
        scrollObserver.observe(el);
    });

    // Função de animação de contadores
    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000; // 2 segundos
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    }

    // ==========================================
    // 3. MODAL DA CALCULADORA
    // ==========================================
    const modal = document.getElementById('modal-calculator');

    // Tornar funções globais para o HTML (onsubmit, onclick)
    window.openModal = function() {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Bloqueia scroll do body
        
        // Foco no primeiro input para acessibilidade
        setTimeout(() => {
            document.getElementById('area').focus();
        }, 100);
    };

    window.closeModal = function() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = ''; // Libera scroll
        document.getElementById('calc-form').reset();
        document.getElementById('calc-result').classList.remove('active');
    };

    // Fechar ao clicar no backdrop (fundo escuro)
    modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);

    // Fechar com tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Trap de foco (Acessibilidade: mantém o foco dentro do modal)
    modal.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;
        const focusable = modal.querySelectorAll('button, input, select, [tabindex]:not([tabindex="-1"])');
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
    // 4. LÓGICA DA CALCULADORA DE IMPACTO
    // ==========================================
    window.calculateImpact = function(event) {
        event.preventDefault();

        // Captura de valores
        const area = parseFloat(document.getElementById('area').value);
        const atividade = document.getElementById('atividade').value;
        const emissaoInput = parseFloat(document.getElementById('emissao').value);
        const arvores = parseInt(document.getElementById('arvores').value) || 0;

        // Validação
        if (isNaN(area) || area <= 0) {
            alert('⚠️ Por favor, insira uma área válida maior que zero.');
            document.getElementById('area').focus();
            return;
        }
        if (!atividade) {
            alert('️ Por favor, selecione o tipo de atividade.');
            document.getElementById('atividade').focus();
            return;
        }

        // Fatores de emissão médios (ton CO₂/ha/ano)
        const fatoresEmissao = {
            'lavoura': 2.0,
            'pecuaria': 7.5,
            'pecuaria-leite': 6.0,
            'ilpf': 3.0,
            'floresta': -5.0 // Sequestro de carbono (negativo)
        };

        const emissaoPorHa = !isNaN(emissaoInput) ? emissaoInput : fatoresEmissao[atividade];
        
        // Cálculos
        const emissaoTotal = area * emissaoPorHa;
        const sequestroArvores = arvores * 0.02; // 1 árvore sequestra ~0.02 ton/ano
        const emissaoLiquida = emissaoTotal - sequestroArvores;
        
        const custoPorTon = 15; // R$ 15,00 por tonelada (valor hipotético de mercado)
        const custoMitigacao = Math.max(0, emissaoLiquida) * custoPorTon;
        
        const arvoresNecessarias = Math.ceil(Math.max(0, emissaoLiquida) / 0.02);

        // Exibição dos Resultados
        const resultContent = document.getElementById('result-content');
        const isPositivo = emissaoLiquida > 0;
        const corLiquida = isPositivo ? '#e74c3c' : '#27ae60';

        resultContent.innerHTML = `
            <div class="result-item">
                <span>Emissão Total Estimada:</span>
                <strong>${formatNumber(emissaoTotal)} ton CO₂/ano</strong>
            </div>
            <div class="result-item">
                <span>Sequestro pelas Árvores Atuais:</span>
                <strong style="color: var(--secondary-green);">-${formatNumber(sequestroArvores)} ton CO₂/ano</strong>
            </div>
            <div class="result-item highlight">
                <span>Emissão Líquida:</span>
                <strong style="color: ${corLiquida}; font-size: 1.2rem;">
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

        // Gerar Recomendações Dinâmicas
        const recommendationsList = document.getElementById('recommendations');
        recommendationsList.innerHTML = generateRecommendations(atividade, emissaoLiquida, arvores, arvoresNecessarias);

        // Mostrar caixa de resultados com animação
        document.getElementById('calc-result').classList.add('active');
        
        // Scroll suave até o resultado dentro do modal
        setTimeout(() => {
            document.getElementById('calc-result').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    };

    // Função auxiliar para gerar recomendações
    function generateRecommendations(atividade, emissaoLiquida, arvoresAtuais, arvoresNecessarias) {
        const recs = [];

        if (emissaoLiquida > 0) {
            const faltam = arvoresNecessarias - arvoresAtuais;
            recs.push(`<li> <strong>Plante mais árvores:</strong> Você precisa de aproximadamente ${formatNumber(faltam)} árvores adicionais para zerar suas emissões.</li>`);
        } else {
            recs.push(`<li>🎉 <strong>Parabéns!</strong> Sua propriedade já é um sumidouro de carbono líquido. Continue mantendo essa prática!</li>`);
        }

        switch(atividade) {
            case 'pecuaria':
            case 'pecuaria-leite':
                recs.push(`<li>🐄 <strong>Implemente ILPF:</strong> A integração Lavoura-Pecuária-Floresta pode reduzir emissões em até 60%.</li>`);
                recs.push(`<li>🌾 <strong>Recupere pastagens:</strong> Pastagens degradadas emitem mais metano. A recuperação melhora a produtividade.</li>`);
                break;
            case 'lavoura':
                recs.push(`<li>🌱 <strong>Adote plantio direto:</strong> Preserva o solo, retém umidade e sequestra carbono.</li>`);
                recs.push(`<li>🔄 <strong>Pratique rotação de culturas:</strong> Melhora a saúde do solo e reduz necessidade de fertilizantes sintéticos.</li>`);
                break;
            case 'ilpf':
                recs.push(`<li>✅ <strong>Excelente escolha!</strong> Você já utiliza um dos sistemas mais sustentáveis. Monitore a biodiversidade local.</li>`);
                break;
            case 'floresta':
                recs.push(`<li>🌲 <strong>Mantenha o manejo sustentável:</strong> Florestas plantadas são vitais para o sequestro de carbono e economia circular.</li>`);
                break;
        }

        if (emissaoLiquida > 0) {
            recs.push(`<li>☀️ <strong>Invista em energia renovável:</strong> Painéis solares e biodigestores reduzem custos operacionais e emissões.</li>`);
            recs.push(`<li>💧 <strong>Otimize a irrigação:</strong> Sistemas de gotejamento economizam água e a energia usada para bombeamento.</li>`);
        }

        return recs.join('');
    }

    // Função auxiliar para formatar números (pt-BR)
    function formatNumber(num) {
        return num.toLocaleString('pt-BR', { 
            minimumFractionDigits: 1, 
            maximumFractionDigits: 2 
        });
    }

    // ==========================================
    // 5. SMOOTH SCROLL (Navegação suave)
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
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
    // 6. ATUALIZAÇÃO DINÂMICA DO FORMULÁRIO
    // ==========================================
    const atividadeSelect = document.getElementById('atividade');
    const emissaoInput = document.getElementById('emissao');

    atividadeSelect.addEventListener('change', function() {
        const fatores = {
            'lavoura': '2.0',
            'pecuaria': '7.5',
            'pecuaria-leite': '6.0',
            'ilpf': '3.0',
            'floresta': '-5.0'
        };
        
        // Preenche automaticamente se o campo estiver vazio
        if (this.value && !emissaoInput.value) {
            emissaoInput.value = fatores[this.value] || '';
            emissaoInput.style.backgroundColor = '#e8f5e9';
            setTimeout(() => { emissaoInput.style.backgroundColor = ''; }, 1000);
        }
    });

    // ==========================================
    // MENSAGEM NO CONSOLE (Easter Egg)
    // ==========================================
    console.log('%c🌱 AgroFuturo', 'color: #2d5a27; font-size: 24px; font-weight: bold;');
    console.log('%cAgricultura Sustentável Moderna', 'color: #4caf50; font-size: 14px;');
    console.log('%cDesenvolvido com 💚 para um futuro mais verde.', 'color: #81c784; font-size: 12px;');
});
