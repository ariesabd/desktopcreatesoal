/**
 * Lufya CBT - SoalCreator Math Palette & Formula Helper
 * Interactive visual formula builder with LaTeX support
 */

(function () {
    window.MathPalette = {
        activeTarget: null,

        categories: [
            {
                name: "Aritmatika & Dasar",
                items: [
                    { label: "a/b", latex: "\\frac{a}{b}", text: " a/b " },
                    { label: "√x", latex: "\\sqrt{x}", text: "√x" },
                    { label: "ⁿ√x", latex: "\\sqrt[n]{x}", text: "ⁿ√x" },
                    { label: "xⁿ", latex: "x^{n}", text: "xⁿ" },
                    { label: "xₙ", latex: "x_{n}", text: "xₙ" },
                    { label: "|x|", latex: "|x|", text: "|x|" },
                    { label: "±", latex: "\\pm", text: "±" },
                    { label: "×", latex: "\\times", text: "×" },
                    { label: "÷", latex: "\\div", text: "÷" },
                    { label: "°", latex: "^\\circ", text: "°" },
                    { label: "≠", latex: "\\ne", text: "≠" },
                    { label: "≈", latex: "\\approx", text: "≈" },
                    { label: "≤", latex: "\\le", text: "≤" },
                    { label: "≥", latex: "\\ge", text: "≥" },
                    { label: "∞", latex: "\\infty", text: "∞" },
                    { label: "%", latex: "\\%", text: "%" }
                ]
            },
            {
                name: "Simbol Yunani (Greek)",
                items: [
                    { label: "α", latex: "\\alpha", text: "α" },
                    { label: "β", latex: "\\beta", text: "β" },
                    { label: "γ", latex: "\\gamma", text: "γ" },
                    { label: "θ", latex: "\\theta", text: "θ" },
                    { label: "λ", latex: "\\lambda", text: "λ" },
                    { label: "μ", latex: "\\mu", text: "μ" },
                    { label: "π", latex: "\\pi", text: "π" },
                    { label: "σ", latex: "\\sigma", text: "σ" },
                    { label: "ω", latex: "\\omega", text: "ω" },
                    { label: "Δ", latex: "\\Delta", text: "Δ" },
                    { label: "Ω", latex: "\\Omega", text: "Ω" },
                    { label: "Σ", latex: "\\Sigma", text: "Σ" }
                ]
            },
            {
                name: "Lanjutan / Kalkulus / Himpunan",
                items: [
                    { label: "∫ dx", latex: "\\int f(x)\\,dx", text: "∫ f(x) dx" },
                    { label: "∫ₐᵇ", latex: "\\int_{a}^{b} f(x)\\,dx", text: "∫ₐᵇ f(x) dx" },
                    { label: "∑", latex: "\\sum_{i=1}^{n}", text: "∑" },
                    { label: "∏", latex: "\\prod", text: "∏" },
                    { label: "lim", latex: "\\lim_{x \\to a}", text: "lim" },
                    { label: "∈", latex: "\\in", text: "∈" },
                    { label: "∉", latex: "\\notin", text: "∉" },
                    { label: "⊂", latex: "\\subset", text: "⊂" },
                    { label: "∪", latex: "\\cup", text: "∪" },
                    { label: "∩", latex: "\\cap", text: "∩" },
                    { label: "→", latex: "\\rightarrow", text: "→" },
                    { label: "⇄", latex: "\\rightleftharpoons", text: "⇄" }
                ]
            },
            {
                name: "Template Cepat Rumus Populer",
                items: [
                    { label: "Rumus ABC", latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}", text: "x = (-b ± √(b² - 4ac)) / (2a)" },
                    { label: "Pythagoras", latex: "c = \\sqrt{a^2 + b^2}", text: "c = √(a² + b²)" },
                    { label: "Trigonometri", latex: "\\sin^2(\\theta) + \\cos^2(\\theta) = 1", text: "sin²(θ) + cos²(θ) = 1" },
                    { label: "Matriks 2x2", latex: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}", text: "[a, b; c, d]" }
                ]
            }
        ],

        open: function (targetElement) {
            if (typeof targetElement === 'string') {
                targetElement = document.getElementById(targetElement);
            }
            this.activeTarget = targetElement;
            this.render();
            const modal = document.getElementById('modalMathPalette');
            if (modal) {
                modal.style.display = 'flex';
                modal.classList.add('active');
            }
        },

        close: function () {
            const modal = document.getElementById('modalMathPalette');
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('active');
            }
        },

        render: function () {
            const container = document.getElementById('mathPaletteContainer');
            if (!container) return;

            let html = '';
            this.categories.forEach(cat => {
                html += `<div class="math-section-title">${cat.name}</div>`;
                html += `<div class="math-grid">`;
                cat.items.forEach(item => {
                    const escLatex = this.escapeAttr(item.latex);
                    const escText = this.escapeAttr(item.text);
                    html += `
                        <button type="button" class="math-btn" onclick="MathPalette.insert('${escLatex}', '${escText}')" title="${escLatex}">
                            <span>${item.label}</span>
                        </button>
                    `;
                });
                html += `</div>`;
            });

            container.innerHTML = html;
        },

        insert: function (latex, fallbackText) {
            if (!this.activeTarget) {
                this.close();
                return;
            }

            // Insert as LaTeX wrapper or formatted text into contenteditable
            const insertContent = ` ${fallbackText} `;
            
            this.activeTarget.focus();
            if (document.queryCommandSupported('insertText')) {
                document.execCommand('insertText', false, insertContent);
            } else {
                this.activeTarget.innerHTML += insertContent;
            }

            // Trigger change event / auto-save
            if (typeof window.CreatorApp !== 'undefined') {
                window.CreatorApp.saveState();
            }

            this.close();
            if (typeof window.CreatorApp !== 'undefined') {
                window.CreatorApp.showToast('Rumus berhasil disisipkan!', 'success');
            }
        },

        insertCustomLatex: function () {
            const input = document.getElementById('customLatexInput');
            if (!input || !input.value.trim()) return;

            const latex = input.value.trim();
            const formatted = ` $${latex}$ `;
            
            if (this.activeTarget) {
                this.activeTarget.focus();
                document.execCommand('insertText', false, formatted);
            }

            input.value = '';
            this.close();
            if (typeof window.CreatorApp !== 'undefined') {
                window.CreatorApp.saveState();
                window.CreatorApp.showToast('Formula LaTeX disisipkan!', 'success');
            }
        },

        escapeAttr: function (str) {
            return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
        }
    };
})();
