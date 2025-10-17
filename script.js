document.addEventListener("DOMContentLoaded", function() {
    // --- CONSTANTES DE DIMENSÃO FIXA ---
    const TARGET_WIDTH = 1280;
    const TARGET_HEIGHT = 720;
    const fixedViewportWrapper = document.getElementById('fixed-viewport-wrapper');
    const container = document.querySelector('.container');

    // --- ELEMENTOS DO DOM ---
    const modoTelaBtn = document.getElementById('modo-tela-btn'); 
    const tabelas = ['tabela-esquerda', 'tabela-direita'];
    const titulos = ['titulo-esquerda', 'titulo-direita'];
    const radioNumLinhas = document.querySelectorAll('input[name="num-linhas"]');
    const checkSextoSetimo = document.getElementById('sexto-setimo');
    const checkAutomatico = document.getElementById('automatico');
    const checkInverterNumeros = document.getElementById('inverter-numeros');
    const labelAutomatico = document.getElementById('label-automatico');
    const grupoSextoSetimo = document.getElementById('grupo-sexto-setimo');
    const tableTargetRadios = document.querySelectorAll('input[name="table-target"]');

    const sidebar = document.getElementById('mySidebar');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const configModal = document.getElementById('config-modal');
    const openConfigBtn = document.getElementById('open-config-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const root = document.documentElement;
    
    // ADIÇÃO: Um Set para rastrear os ícones que já executaram a animação de pulso.
    const pulsedIcons = new Set();

    const FONT_OPTIONS = [
        { name: 'Padrão do Sistema', value: 'sans-serif' },
        { name: 'Roboto', value: 'Roboto' },
        { name: 'Open Sans', value: 'Open Sans' },
        { name: 'Lato', value: 'Lato' }
    ];

    // --- ESTADO DA APLICAÇÃO ---
    const defaultConfig = {
        numLinhas: 10,
        mostrarExtras: false,
        calculoAutomatico: false
    };

    let configEsquerda = { ...defaultConfig };
    let configDireita = { ...defaultConfig };
    
    const defaultSettings = {
        layout: {
            general: { showTableLines: true },
            titulo: { fontSize: 24, isBold: true, isItalic: false, fontFamily: 'Roboto', hasShadow: false, textColor: '#ffffff', bgColor: '#333333', bgAlpha: 0 },
            cabecalho: { fontSize: 16, isBold: false, isItalic: false, fontFamily: 'Open Sans', hasShadow: false, textColor: '#ffffff', bgColor: '#555555', bgAlpha: 0 },
            tabela: { fontSize: 16, isBold: true, isItalic: false, fontFamily: 'sans-serif', hasShadow: false },
            colunas: {
                // ATUALIZAÇÃO INÍCIO
                icone: { fontSize: 16, isBold: true, isItalic: false, fontFamily: 'sans-serif', hasShadow: false, textColor: '#ffffff', bgColor: '#333333', bgAlpha: 0 },
                // ATUALIZAÇÃO FIM
                premio: { textColor: '#ffffff', bgColor: '#333333', bgAlpha: 0 },
                milhar: { textColor: '#ffffff', bgColor: '#333333', bgAlpha: 0 },
                grupo: { textColor: '#ffffff', bgColor: '#333333', bgAlpha: 0 }
            }
        }
    };
    let currentSettings = {};

    const grupos = {
        1: { nome: 'Avestruz', dezenas: ['01', '02', '03', '04'] }, 2: { nome: 'Águia', dezenas: ['05', '06', '07', '08'] },
        3: { nome: 'Burro', dezenas: ['09', '10', '11', '12'] }, 4: { nome: 'Borboleta', dezenas: ['13', '14', '15', '16'] },
        5: { nome: 'Cachorro', dezenas: ['17', '18', '19', '20'] }, 6: { nome: 'Cabra', dezenas: ['21', '22', '23', '24'] },
        7: { nome: 'Carneiro', dezenas: ['25', '26', '27', '28'] }, 8: { nome: 'Camelo', dezenas: ['29', '30', '31', '32'] },
        9: { nome: 'Cobra', dezenas: ['33', '34', '35', '36'] }, 10: { nome: 'Coelho', dezenas: ['37', '38', '39', '40'] },
        11: { nome: 'Cavalo', dezenas: ['41', '42', '43', '44'] }, 12: { nome: 'Elefante', dezenas: ['45', '46', '47', '48'] },
        13: { nome: 'Galo', dezenas: ['49', '50', '51', '52'] }, 14: { nome: 'Gato', dezenas: ['53', '54', '55', '56'] },
        15: { nome: 'Jacaré', dezenas: ['57', '58', '59', '60'] }, 16: { nome: 'Leão', dezenas: ['61', '62', '63', '64'] },
        17: { nome: 'Macaco', dezenas: ['65', '66', '67', '68'] }, 18: { nome: 'Porco', dezenas: ['69', '70', '71', '72'] },
        19: { nome: 'Pavão', dezenas: ['73', '74', '75', '76'] }, 20: { nome: 'Peru', dezenas: ['77', '78', '79', '80'] },
        21: { nome: 'Touro', dezenas: ['81', '82', '83', '84'] }, 22: { nome: 'Tigre', dezenas: ['85', '86', '87', '88'] },
        23: { nome: 'Urso', dezenas: ['89', '90', '91', '92'] }, 24: { nome: 'Veado', dezenas: ['93', '94', '95', '96'] },
        25: { nome: 'Vaca', dezenas: ['97', '98', '99', '00'] }
    };

    /**
     * Carrega as imagens dos grupos em segundo plano e as armazena no localStorage.
     */
    function preloadAndCacheImages() {
        if (localStorage.getItem('bicho_images_cached_v1')) {
            return;
        }

        let imagesToCache = 25;
        let imagesCached = 0;

        for (let i = 1; i <= imagesToCache; i++) {
            const paddedIndex = i.toString().padStart(2, '0');
            const imageUrl = `assets/img/grupos/${paddedIndex}.webp`;
            const storageKey = `bicho_group_image_${i}`;
            const img = new Image();
            img.crossOrigin = "Anonymous";

            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                try {
                    const dataURL = canvas.toDataURL('image/webp');
                    localStorage.setItem(storageKey, dataURL);
                } catch (e) {
                    console.error('Não foi possível salvar a imagem no localStorage', e);
                }
                imagesCached++;
                if (imagesCached === imagesToCache) {
                    localStorage.setItem('bicho_images_cached_v1', 'true');
                }
            };
            img.onerror = () => {
                console.error(`Falha ao carregar a imagem: ${imageUrl}`);
                imagesCached++;
                 if (imagesCached === imagesToCache) {
                    localStorage.setItem('bicho_images_cached_v1', 'true');
                }
            };
            img.src = imageUrl;
        }
    }


    function getNumeroGrupo(milhar) {
        if (!milhar || milhar.length < 2) return '';
        const dezena = milhar.slice(-2); 
        for (const grupo in grupos) {
            if (grupos[grupo].dezenas.includes(dezena.padStart(2, '0'))) return grupo;
        }
        return '';
    }
    
    function getGrupoFormatado(numeroGrupo) {
         if (numeroGrupo && grupos[numeroGrupo]) {
             return `${numeroGrupo} - ${grupos[numeroGrupo].nome}`;
         }
         return '';
    }

    function getConfigForTable(idTabela) {
        return idTabela === 'tabela-esquerda' ? configEsquerda : configDireita;
    }

    function getSelectedTarget() {
        return document.querySelector('input[name="table-target"]:checked').value;
    }

    function ajustarEscalaConteudo() {
        const currentWidth = fixedViewportWrapper.offsetWidth;
        const currentHeight = fixedViewportWrapper.offsetHeight;
        const scaleX = currentWidth / TARGET_WIDTH;
        const scaleY = currentHeight / TARGET_HEIGHT;
        const scale = Math.min(scaleX, scaleY);
        container.style.transform = `scale(${scale})`;
    }

    function toggleFullscreenMode() {
        document.body.classList.toggle('fullscreen-mode');
        if (sidebar.style.width === "250px") closeSidebar(); 
        ajustarEscalaConteudo();
    }

    function hexToRgba(hex, alpha) {
        let r = 0, g = 0, b = 0;
        if (hex.length == 4) { // #RGB
            r = "0x" + hex[1] + hex[1];
            g = "0x" + hex[2] + hex[2];
            b = "0x" + hex[3] + hex[3];
        } else if (hex.length == 7) { // #RRGGBB
            r = "0x" + hex[1] + hex[2];
            g = "0x" + hex[3] + hex[4];
            b = "0x" + hex[5] + hex[6];
        }
        return `rgba(${+r},${+g},${+b},${alpha})`;
    }

    function atualizarVisibilidadeOpcoesExtras() {
        const isCincoLinhas = document.querySelector('input[name="num-linhas"]:checked').value === '5';
        const isSextoSetimoChecked = checkSextoSetimo.checked;

        grupoSextoSetimo.style.display = isCincoLinhas ? 'flex' : 'none';
        labelAutomatico.style.display = (isCincoLinhas && isSextoSetimoChecked) ? 'flex' : 'none';
    }

    function updateConfigurationsDisplay() {
        const target = getSelectedTarget();
        const config = (target === 'E') ? configEsquerda : configDireita;
        
        document.querySelector(`input[name="num-linhas"][value="${config.numLinhas}"]`).checked = true;
        checkSextoSetimo.checked = config.mostrarExtras;
        checkAutomatico.checked = config.calculoAutomatico;
        
        atualizarVisibilidadeOpcoesExtras();
    }

    function executarCalculoAutomatico(idTabela) {
        const config = getConfigForTable(idTabela);
        if (!config.calculoAutomatico) return;
        
        const inputs = Array.from(document.querySelectorAll(`#${idTabela} .milhar-input`));
        const milharInputs = inputs.slice(0, 5).map(input => input.value);
        
        const sextoInput = document.querySelector(`#${idTabela}-6`);
        const setimoInput = document.querySelector(`#${idTabela}-7`);

        if (milharInputs.some(m => m.length < 4)) {
            if (sextoInput) {
                sextoInput.value = '';
                updateGrupoIcone(sextoInput, sextoInput.closest('tr'));
            }
            if (setimoInput) {
                setimoInput.value = '';
                updateGrupoIcone(setimoInput, setimoInput.closest('tr'));
            }
            return;
        }

        const numeros = milharInputs.map(m => parseInt(m, 10));
        const somaTotal = numeros.reduce((acc, val) => acc + val, 0);
        const sextoPremio = somaTotal.toString().slice(-4).padStart(4, '0');

        if (sextoInput) {
            sextoInput.value = sextoPremio;
            updateGrupoIcone(sextoInput, sextoInput.closest('tr'));
        }

        const m1 = parseInt(milharInputs[0], 10);
        const m2 = parseInt(milharInputs[1], 10);
        const produto = (m1 * m2).toString();
        const setimoPremio = produto.slice(-3).padStart(3, '0');
        
        if (setimoInput) {
            setimoInput.value = setimoPremio;
            updateGrupoIcone(setimoInput, setimoInput.closest('tr'));
        }
    }
    
    function updateGrupoIcone(inputElement, rowElement) {
        const milharValue = inputElement.value;
        const premioText = rowElement.querySelector('.col-premio').textContent;
        const grupoTextCell = rowElement.querySelector('.col-grupo');
        const iconeDiv = rowElement.querySelector('.icone-grupo');
        const inverterMarcada = checkInverterNumeros.checked;

        const idTabela = inputElement.id.includes('esquerda') ? 'tabela-esquerda' : 'tabela-direita';
        const config = getConfigForTable(idTabela);
        
        const isCincoPrimeirosChecked = config.numLinhas === 5;
        const isLinhaSeisOuSete = (premioText.includes('6º') || premioText.includes('7º'));
        
        grupoTextCell.classList.remove('soma-mult-text');

        let deveExibirGrupo = false;
        if (isCincoPrimeirosChecked && config.mostrarExtras && premioText.includes('7º')) {
            deveExibirGrupo = milharValue.length === 3;
        } else {
            deveExibirGrupo = inverterMarcada ? milharValue.length >= 2 : milharValue.length === 4;
        }

        if (isCincoPrimeirosChecked && config.mostrarExtras && isLinhaSeisOuSete) {
            if (config.calculoAutomatico && milharValue.length > 0) {
                grupoTextCell.textContent = (premioText.includes('6º')) ? '[soma]' : '[mult]';
                grupoTextCell.classList.add('soma-mult-text');
            } else {
                grupoTextCell.textContent = '---';
            }
            if (iconeDiv) {
                iconeDiv.textContent = '';
                iconeDiv.style.backgroundImage = 'none';
            }
            return;
        }

        if (!deveExibirGrupo) {
            grupoTextCell.textContent = '---';
            if (iconeDiv) {
                iconeDiv.textContent = '?';
                iconeDiv.style.backgroundImage = 'none';
                // ALTERAÇÃO: Se o campo for limpo, removemos do Set para permitir que pulse novamente.
                pulsedIcons.delete(inputElement.id);
            }
            return;
        }
        
        const numeroGrupo = getNumeroGrupo(milharValue);
        grupoTextCell.textContent = getGrupoFormatado(numeroGrupo) || '---';
        
        if (iconeDiv) {
            if (numeroGrupo) {
                iconeDiv.textContent = '';
                
                const storageKey = `bicho_group_image_${numeroGrupo}`;
                const cachedImage = localStorage.getItem(storageKey);
                const newImageUrl = cachedImage ? `url(${cachedImage})` : `url('assets/img/grupos/${numeroGrupo.toString().padStart(2, '0')}.webp')`;
                
                iconeDiv.style.backgroundImage = newImageUrl;
                
                // ALTERAÇÃO: A lógica de animação agora verifica se o ícone já pulsou antes.
                if (!pulsedIcons.has(inputElement.id)) {
                    iconeDiv.classList.add('pulse-effect');
                    pulsedIcons.add(inputElement.id); // Adiciona ao Set para não pulsar novamente.

                    iconeDiv.addEventListener('animationend', () => {
                        iconeDiv.classList.remove('pulse-effect');
                    }, { once: true });
                }

            } else {
                iconeDiv.textContent = '?';
                iconeDiv.style.backgroundImage = 'none';
                // ALTERAÇÃO: Se o número for inválido, removemos para permitir novo pulso.
                pulsedIcons.delete(inputElement.id);
            }
        }
    }

    function renderizarTabela(idTabela) {
        const tbody = document.getElementById(idTabela);
        const config = getConfigForTable(idTabela);
        tbody.innerHTML = ''; 

        for (let i = 1; i <= config.numLinhas; i++) {
            tbody.appendChild(criarLinha(i, idTabela));
        }

        if (config.numLinhas === 5 && config.mostrarExtras) {
            tbody.appendChild(criarLinha(6, idTabela, true));
            tbody.appendChild(criarLinha(7, idTabela, true));
        }
        
        setTimeout(() => {
            const state = JSON.parse(localStorage.getItem('jogoDosBichos')) || {};
            const loadedValues = idTabela === 'tabela-esquerda' ? state.valoresMilharEsquerda : state.valoresMilharDireita;
            
            if (loadedValues) {
                const inputs = document.querySelectorAll(`#${idTabela} .milhar-input`);
                inputs.forEach((input, index) => {
                    if(loadedValues[index] !== undefined) {
                        input.value = loadedValues[index];
                    }
                    if (config.calculoAutomatico && (index === 5 || index === 6)) {
                        input.readOnly = true;
                    }
                    updateGrupoIcone(input, input.closest('tr'));
                });
            }
            executarCalculoAutomatico(idTabela);
        }, 0);
    }

    function renderizarTabelas() {
        tabelas.forEach(renderizarTabela);
    }
    
    function criarLinha(index, idTabela, isExtra = false) {
        const tr = document.createElement('tr');
        const config = getConfigForTable(idTabela);
        
        const tdIcone = document.createElement('td');
        tdIcone.className = 'col-icone';
        
        if (!isExtra) {
            const iconeDiv = document.createElement('span');
            iconeDiv.className = 'icone-grupo';
            iconeDiv.textContent = '?';
            tdIcone.appendChild(iconeDiv);
        }

        const tdPremio = document.createElement('td');
        tdPremio.className = 'col-premio';
        tdPremio.textContent = `${index}º`;
        
        const tdMilhar = document.createElement('td');
        tdMilhar.className = 'col-milhar';
        const inputMilhar = document.createElement('input');
        inputMilhar.type = 'text';
        inputMilhar.className = 'milhar-input';
        inputMilhar.id = `${idTabela}-${index}`;
        inputMilhar.maxLength = (index === 7 && isExtra) ? 3 : 4; 
        inputMilhar.pattern = "\\d*";
        inputMilhar.autocomplete = "off";
        
        if (isExtra && config.calculoAutomatico) {
            inputMilhar.readOnly = true;
        }

        const tdGrupo = document.createElement('td');
        tdGrupo.className = 'col-grupo';
        tdGrupo.textContent = '---';
        
        inputMilhar.addEventListener('keydown', function(e) {
            if (!checkInverterNumeros.checked) return;
            if (e.key.length > 1 && e.key !== 'Backspace' && e.key !== 'Delete') return;
            if (e.ctrlKey || e.altKey || e.metaKey) return;
            
            if (/\d/.test(e.key) && this.value.length < this.maxLength) {
                e.preventDefault();
                this.value = e.key + this.value; 
                this.dispatchEvent(new Event('input'));
            } else if (/\d/.test(e.key)) {
                 e.preventDefault();
            }
        });

        inputMilhar.addEventListener("input", (e) => {
            e.target.value = e.target.value.replace(/\D/g, "");
            updateGrupoIcone(e.target, tr);
            
            if (index <= 5) {
                executarCalculoAutomatico(idTabela);
            }

            if (e.target.value.length === parseInt(e.target.maxLength, 10) && !e.target.readOnly) {
                const allInputs = Array.from(document.querySelectorAll(`#${idTabela} .milhar-input:not([readonly])`));
                const currentIndex = allInputs.indexOf(e.target);
                if (currentIndex > -1 && currentIndex < allInputs.length - 1) {
                    allInputs[currentIndex + 1].focus();
                }
            }
            saveAllSettings();
        });

        tdMilhar.appendChild(inputMilhar);
        tr.appendChild(tdIcone); 
        tr.appendChild(tdPremio);
        tr.appendChild(tdMilhar);
        tr.appendChild(tdGrupo);
        return tr;
    }

    function aplicarConfiguracaoParaTabelas(callback) {
        const target = getSelectedTarget();
        const idTabela = (target === 'E') ? 'tabela-esquerda' : 'tabela-direita';
        callback(idTabela);
    }
    
    function populateFontSelectors() {
        // ATUALIZAÇÃO INÍCIO
        const selectors = ['titulo-font-family', 'cabecalho-font-family', 'tabela-font-family', 'col-icone-font-family'];
        // ATUALIZAÇÃO FIM
        selectors.forEach(id => {
            const select = document.getElementById(id);
            if (!select) return;
            select.innerHTML = '';
            FONT_OPTIONS.forEach(option => {
                const opt = document.createElement('option');
                opt.value = option.value;
                opt.textContent = option.name;
                select.appendChild(opt);
            });
        });
    }

    function openSidebar() { sidebar.style.width = "250px"; hamburgerBtn.classList.add("open"); }
    function closeSidebar() { sidebar.style.width = "0"; hamburgerBtn.classList.remove("open"); }
    
    function openModal() {
        closeSidebar(); 
        configModal.style.display = "block";
        document.body.classList.add('modal-open');
        document.querySelector(".config-pane").classList.add("active");
        document.querySelector(".config-menu li").classList.add("active");
        initializeModal();
    }
    
    function closeModal() { configModal.style.display = "none"; document.body.classList.remove('modal-open'); }
    
    function applySettings(settings) {
        const { layout } = settings;
        root.style.setProperty('--font-size-titulo', layout.titulo.fontSize + 'px');
        root.style.setProperty('--font-weight-titulo', layout.titulo.isBold ? 'bold' : 'normal');
        root.style.setProperty('--font-style-titulo', layout.titulo.isItalic ? 'italic' : 'normal');
        root.style.setProperty('--font-family-titulo', layout.titulo.fontFamily);
        root.style.setProperty('--text-shadow-titulo', layout.titulo.hasShadow ? '2px 2px 4px rgba(0,0,0,0.7)' : 'none');
        root.style.setProperty('--color-titulo', layout.titulo.textColor);
        root.style.setProperty('--bg-color-titulo', hexToRgba(layout.titulo.bgColor, layout.titulo.bgAlpha));

        root.style.setProperty('--font-size-cabecalho', layout.cabecalho.fontSize + 'px');
        root.style.setProperty('--font-weight-cabecalho', layout.cabecalho.isBold ? 'bold' : 'normal');
        root.style.setProperty('--font-style-cabecalho', layout.cabecalho.isItalic ? 'italic' : 'normal');
        root.style.setProperty('--font-family-cabecalho', layout.cabecalho.fontFamily);
        root.style.setProperty('--text-shadow-cabecalho', layout.cabecalho.hasShadow ? '2px 2px 4px rgba(0,0,0,0.7)' : 'none');
        root.style.setProperty('--color-cabecalho', layout.cabecalho.textColor);
        root.style.setProperty('--bg-color-cabecalho', hexToRgba(layout.cabecalho.bgColor, layout.cabecalho.bgAlpha));
        
        root.style.setProperty('--font-size-tabela', layout.tabela.fontSize + 'px');
        root.style.setProperty('--font-weight-tabela', layout.tabela.isBold ? 'bold' : 'normal');
        root.style.setProperty('--font-style-tabela', layout.tabela.isItalic ? 'italic' : 'normal');
        root.style.setProperty('--font-family-tabela', layout.tabela.fontFamily);
        root.style.setProperty('--text-shadow-tabela', layout.tabela.hasShadow ? '1px 1px 2px rgba(0,0,0,0.7)' : 'none');
        
        root.style.setProperty('--table-border-style', layout.general.showTableLines ? '1px solid #ffffff' : 'none');

        // ATUALIZAÇÃO INÍCIO
        root.style.setProperty('--col-icone-text-color', layout.colunas.icone.textColor);
        root.style.setProperty('--col-icone-font-size', layout.colunas.icone.fontSize + 'px');
        root.style.setProperty('--col-icone-font-family', layout.colunas.icone.fontFamily);
        root.style.setProperty('--col-icone-font-weight', layout.colunas.icone.isBold ? 'bold' : 'normal');
        root.style.setProperty('--col-icone-font-style', layout.colunas.icone.isItalic ? 'italic' : 'normal');
        root.style.setProperty('--col-icone-text-shadow', layout.colunas.icone.hasShadow ? '1px 1px 2px rgba(0,0,0,0.7)' : 'none');
        root.style.setProperty('--bg-color-col-icone', hexToRgba(layout.colunas.icone.bgColor, layout.colunas.icone.bgAlpha));
        // ATUALIZAÇÃO FIM

        root.style.setProperty('--color-col-premio', layout.colunas.premio.textColor);
        root.style.setProperty('--bg-color-col-premio', hexToRgba(layout.colunas.premio.bgColor, layout.colunas.premio.bgAlpha));
        root.style.setProperty('--color-col-milhar', layout.colunas.milhar.textColor);
        root.style.setProperty('--bg-color-col-milhar', hexToRgba(layout.colunas.milhar.bgColor, layout.colunas.milhar.bgAlpha));
        root.style.setProperty('--color-col-grupo', layout.colunas.grupo.textColor);
        root.style.setProperty('--bg-color-col-grupo', hexToRgba(layout.colunas.grupo.bgColor, layout.colunas.grupo.bgAlpha));
    }

    function initializeModal() {
        populateFontSelectors();
        const { layout } = currentSettings;
        
        document.getElementById('tabela-show-lines').checked = layout.general.showTableLines;
        
        document.getElementById('titulo-font-size').value = layout.titulo.fontSize;
        document.getElementById('titulo-font-family').value = layout.titulo.fontFamily;
        document.getElementById('titulo-is-bold').checked = layout.titulo.isBold;
        document.getElementById('titulo-is-italic').checked = layout.titulo.isItalic;
        document.getElementById('titulo-has-shadow').checked = layout.titulo.hasShadow;
        document.getElementById('titulo-text-color').value = layout.titulo.textColor;
        document.getElementById('titulo-bg-color').value = layout.titulo.bgColor;
        document.getElementById('titulo-bg-alpha').value = layout.titulo.bgAlpha;
        
        document.getElementById('cabecalho-font-size').value = layout.cabecalho.fontSize;
        document.getElementById('cabecalho-font-family').value = layout.cabecalho.fontFamily;
        document.getElementById('cabecalho-is-bold').checked = layout.cabecalho.isBold;
        document.getElementById('cabecalho-is-italic').checked = layout.cabecalho.isItalic;
        document.getElementById('cabecalho-has-shadow').checked = layout.cabecalho.hasShadow;
        document.getElementById('cabecalho-text-color').value = layout.cabecalho.textColor;
        document.getElementById('cabecalho-bg-color').value = layout.cabecalho.bgColor;
        document.getElementById('cabecalho-bg-alpha').value = layout.cabecalho.bgAlpha;
        
        document.getElementById('tabela-font-size').value = layout.tabela.fontSize;
        document.getElementById('tabela-font-family').value = layout.tabela.fontFamily;
        document.getElementById('tabela-is-bold').checked = layout.tabela.isBold;
        document.getElementById('tabela-is-italic').checked = layout.tabela.isItalic;
        document.getElementById('tabela-has-shadow').checked = layout.tabela.hasShadow;
        
        // ATUALIZAÇÃO INÍCIO
        document.getElementById('col-icone-font-size').value = layout.colunas.icone.fontSize;
        document.getElementById('col-icone-font-family').value = layout.colunas.icone.fontFamily;
        document.getElementById('col-icone-text-color').value = layout.colunas.icone.textColor;
        document.getElementById('col-icone-is-bold').checked = layout.colunas.icone.isBold;
        document.getElementById('col-icone-is-italic').checked = layout.colunas.icone.isItalic;
        document.getElementById('col-icone-has-shadow').checked = layout.colunas.icone.hasShadow;
        document.getElementById('col-icone-bg-color').value = layout.colunas.icone.bgColor;
        document.getElementById('col-icone-bg-alpha').value = layout.colunas.icone.bgAlpha;
        // ATUALIZAÇÃO FIM
        
        document.getElementById('col-premio-text-color').value = layout.colunas.premio.textColor;
        document.getElementById('col-premio-bg-color').value = layout.colunas.premio.bgColor;
        document.getElementById('col-premio-bg-alpha').value = layout.colunas.premio.bgAlpha;

        document.getElementById('col-milhar-text-color').value = layout.colunas.milhar.textColor;
        document.getElementById('col-milhar-bg-color').value = layout.colunas.milhar.bgColor;
        document.getElementById('col-milhar-bg-alpha').value = layout.colunas.milhar.bgAlpha;

        document.getElementById('col-grupo-text-color').value = layout.colunas.grupo.textColor;
        document.getElementById('col-grupo-bg-color').value = layout.colunas.grupo.bgColor;
        document.getElementById('col-grupo-bg-alpha').value = layout.colunas.grupo.bgAlpha;
        
        const configInputs = document.querySelectorAll('#config-settings-container input, #config-settings-container select');
        configInputs.forEach(input => {
            input.removeEventListener('input', saveConfigFromModal);
            input.removeEventListener('change', saveConfigFromModal);
            input.addEventListener('input', saveConfigFromModal);
            input.addEventListener('change', saveConfigFromModal);
        });
    }

    function saveConfigFromModal() {
        const { layout } = currentSettings;

        layout.general.showTableLines = document.getElementById('tabela-show-lines').checked;

        layout.titulo.fontSize = parseInt(document.getElementById('titulo-font-size').value, 10);
        layout.titulo.fontFamily = document.getElementById('titulo-font-family').value;
        layout.titulo.isBold = document.getElementById('titulo-is-bold').checked;
        layout.titulo.isItalic = document.getElementById("titulo-is-italic").checked;
        layout.titulo.hasShadow = document.getElementById("titulo-has-shadow").checked;
        layout.titulo.textColor = document.getElementById('titulo-text-color').value;
        layout.titulo.bgColor = document.getElementById('titulo-bg-color').value;
        layout.titulo.bgAlpha = parseFloat(document.getElementById('titulo-bg-alpha').value);
        
        layout.cabecalho.fontSize = parseInt(document.getElementById('cabecalho-font-size').value, 10);
        layout.cabecalho.fontFamily = document.getElementById('cabecalho-font-family').value;
        layout.cabecalho.isBold = document.getElementById('cabecalho-is-bold').checked;
        layout.cabecalho.isItalic = document.getElementById("cabecalho-is-italic").checked;
        layout.cabecalho.hasShadow = document.getElementById("cabecalho-has-shadow").checked;
        layout.cabecalho.textColor = document.getElementById('cabecalho-text-color').value;
        layout.cabecalho.bgColor = document.getElementById('cabecalho-bg-color').value;
        layout.cabecalho.bgAlpha = parseFloat(document.getElementById('cabecalho-bg-alpha').value);
        
        layout.tabela.fontSize = parseInt(document.getElementById('tabela-font-size').value, 10);
        layout.tabela.fontFamily = document.getElementById('tabela-font-family').value;
        layout.tabela.isBold = document.getElementById('tabela-is-bold').checked;
        layout.tabela.isItalic = document.getElementById("tabela-is-italic").checked;
        layout.tabela.hasShadow = document.getElementById("tabela-has-shadow").checked;

        // ATUALIZAÇÃO INÍCIO
        layout.colunas.icone.fontSize = parseInt(document.getElementById('col-icone-font-size').value, 10);
        layout.colunas.icone.fontFamily = document.getElementById('col-icone-font-family').value;
        layout.colunas.icone.textColor = document.getElementById('col-icone-text-color').value;
        layout.colunas.icone.isBold = document.getElementById('col-icone-is-bold').checked;
        layout.colunas.icone.isItalic = document.getElementById('col-icone-is-italic').checked;
        layout.colunas.icone.hasShadow = document.getElementById('col-icone-has-shadow').checked;
        layout.colunas.icone.bgColor = document.getElementById('col-icone-bg-color').value;
        layout.colunas.icone.bgAlpha = parseFloat(document.getElementById('col-icone-bg-alpha').value);
        // ATUALIZAÇÃO FIM

        layout.colunas.premio.textColor = document.getElementById('col-premio-text-color').value;
        layout.colunas.premio.bgColor = document.getElementById('col-premio-bg-color').value;
        layout.colunas.premio.bgAlpha = parseFloat(document.getElementById('col-premio-bg-alpha').value);

        layout.colunas.milhar.textColor = document.getElementById('col-milhar-text-color').value;
        layout.colunas.milhar.bgColor = document.getElementById('col-milhar-bg-color').value;
        layout.colunas.milhar.bgAlpha = parseFloat(document.getElementById('col-milhar-bg-alpha').value);

        layout.colunas.grupo.textColor = document.getElementById('col-grupo-text-color').value;
        layout.colunas.grupo.bgColor = document.getElementById('col-grupo-bg-color').value;
        layout.colunas.grupo.bgAlpha = parseFloat(document.getElementById('col-grupo-bg-alpha').value);

        applySettings(currentSettings);
        saveAllSettings();
    }

    function saveAllSettings() {
        const allSettings = {
            layoutSettings: currentSettings.layout,
            configEsquerda: configEsquerda,
            configDireita: configDireita,
            inverterNumeros: checkInverterNumeros.checked,
            selectedTarget: getSelectedTarget(),
            tituloEsquerda: document.getElementById('titulo-esquerda').value,
            tituloDireita: document.getElementById('titulo-direita').value,
            valoresMilharEsquerda: Array.from(document.querySelectorAll('#tabela-esquerda .milhar-input')).map(input => input.value),
            valoresMilharDireita: Array.from(document.querySelectorAll('#tabela-direita .milhar-input')).map(input => input.value)
        };
        
        localStorage.setItem('jogoDosBichos', JSON.stringify(allSettings));
    }

    function loadSettings() {
        const saved = localStorage.getItem('jogoDosBichos');
        const loaded = saved ? JSON.parse(saved) : {};

        // CORREÇÃO: A lógica de merge foi ajustada para carregar 'layoutSettings' do objeto salvo ('loaded')
        // para dentro do 'defaultSettings.layout', garantindo que as configurações salvas sejam aplicadas.
        currentSettings.layout = deepMerge(JSON.parse(JSON.stringify(defaultSettings.layout)), loaded.layoutSettings || {});

        configEsquerda = loaded.configEsquerda || { ...defaultConfig };
        configDireita = loaded.configDireita || { ...defaultConfig };
        
        checkInverterNumeros.checked = loaded.inverterNumeros !== undefined ? loaded.inverterNumeros : false;
        if (loaded.selectedTarget) {
            const targetRadio = document.querySelector(`input[name="table-target"][value="${loaded.selectedTarget}"]`);
            if (targetRadio) targetRadio.checked = true;
        }
        
        document.getElementById('titulo-esquerda').value = loaded.tituloEsquerda || '';
        document.getElementById('titulo-direita').value = loaded.tituloDireita || '';
        
        applySettings(currentSettings);
        updateConfigurationsDisplay();
        renderizarTabelas(); 
    }
    
    function deepMerge(target, source) {
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    target[key] = target[key] || {};
                    deepMerge(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        }
        return target;
    }

    // --- EVENTOS ---
    
    modoTelaBtn.addEventListener('click', toggleFullscreenMode);
    hamburgerBtn.addEventListener("click", () => {
        if (sidebar.style.width === "250px") closeSidebar(); else openSidebar();
    });
    openConfigBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => { if (e.target == configModal) closeModal(); });
    window.addEventListener('resize', ajustarEscalaConteudo);
    
    tableTargetRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            updateConfigurationsDisplay();
            saveAllSettings();
        });
    });
    
    radioNumLinhas.forEach(radio => {
        radio.addEventListener("change", () => {
            const novoValor = parseInt(radio.value, 10);
            const target = getSelectedTarget();
            const config = (target === 'E') ? configEsquerda : configDireita;

            config.numLinhas = novoValor;
            if (novoValor === 10) {
                config.mostrarExtras = false;
                config.calculoAutomatico = false;
                checkSextoSetimo.checked = false;
                checkAutomatico.checked = false;
            }
            updateConfigurationsDisplay();
            renderizarTabela(target === 'E' ? 'tabela-esquerda' : 'tabela-direita');
            saveAllSettings();
        });
    });

    checkSextoSetimo.addEventListener("change", (e) => {
        const novoValor = e.target.checked;
        const target = getSelectedTarget();
        const config = (target === 'E') ? configEsquerda : configDireita;
        config.mostrarExtras = novoValor;
        if (!novoValor) {
            config.calculoAutomatico = false;
            checkAutomatico.checked = false;
        }
        updateConfigurationsDisplay();
        renderizarTabela(target === 'E' ? 'tabela-esquerda' : 'tabela-direita');
        saveAllSettings();
    });
    
    checkAutomatico.addEventListener("change", (e) => {
        const novoValor = e.target.checked;
        const target = getSelectedTarget();
        const config = (target === 'E') ? configEsquerda : configDireita;
        config.calculoAutomatico = novoValor;
        renderizarTabela(target === 'E' ? 'tabela-esquerda' : 'tabela-direita');
        saveAllSettings();
    });

    checkInverterNumeros.addEventListener("change", () => {
         document.querySelectorAll(".milhar-input").forEach(input => {
             updateGrupoIcone(input, input.closest("tr"));
         });
         saveAllSettings();
    });

    document.getElementById("novo").addEventListener("click", () => {
        // ALTERAÇÃO: Limpa o Set de ícones pulsados ao criar um novo sorteio.
        pulsedIcons.clear();
        aplicarConfiguracaoParaTabelas((idTabela) => {
            document.querySelectorAll(`#${idTabela} .milhar-input`).forEach(input => {
                input.value = "";
                updateGrupoIcone(input, input.closest('tr'));
            });
            const primeiroInput = document.querySelector(`#${idTabela} .milhar-input:not([readonly])`);
            if (primeiroInput) primeiroInput.focus();
        });
        saveAllSettings();
    });

    titulos.forEach(id => {
        document.getElementById(id).addEventListener("input", saveAllSettings);
    });

    const configMenuItems = document.querySelectorAll(".config-menu a");
    configMenuItems.forEach(item => {
        item.addEventListener("click", function(e) {
            e.preventDefault();
            document.querySelectorAll(".config-menu li").forEach(li => li.classList.remove("active"));
            this.parentElement.classList.add("active");
            document.querySelectorAll(".config-pane").forEach(pane => pane.classList.remove("active"));
            document.getElementById(this.dataset.target).classList.add("active");
        });
    });

    // --- INICIALIZAÇÃO ---
    loadSettings(); 
    ajustarEscalaConteudo();
    
    // ADIÇÃO: Dispara o cache das imagens após o carregamento completo da página
    window.addEventListener('load', preloadAndCacheImages);
});