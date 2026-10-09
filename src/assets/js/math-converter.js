/**
 * Lufya CBT - SoalCreator Math-to-LaTeX Converter Engine v2.0
 * Converts Microsoft Word equations, natural math syntax, unicode symbols,
 * and full question blocks into standardized LaTeX KaTeX format.
 */

(function () {
    const MathConverter = {
        /**
         * Main conversion routine: converts mathematical expressions/text to LaTeX
         * @param {string} input 
         * @param {object} options { wrapWithDollar: boolean, preservePlainText: boolean }
         * @returns {string} Converted LaTeX string
         */
        toLatex: function (input, options = {}) {
            if (!input || typeof input !== 'string') return '';
            let str = input.trim();

            const wrap = options.wrapWithDollar ?? false;

            // 1. Normalize unicode math symbols & spaces
            str = this.normalizeUnicode(str);

            // 2. Convert Limits: e.g. "lim x->3 (4x^2 + 5x + 1)" or "lim_{x->3}" or "lim(x->3)"
            str = this.convertLimits(str);

            // 3. Convert Integrals & Summations
            str = this.convertCalculus(str);

            // 4. Convert Derivatives: f'(x), f''(x), g'(2) = 4, dy/dx
            str = this.convertDerivatives(str);

            // 5. Convert Roots: sqrt(...), akar(...), √(...)
            str = this.convertRoots(str);

            // 6. Convert Fractions: (a+b)/(c+d), 2/6, -5/6, mixed fractions 1 1/2
            str = this.convertFractions(str);

            // 7. Convert Powers & Superscripts: x^2, x^{n}, etc.
            str = this.convertPowers(str);

            // 8. Convert Greek Letters & Math Symbols
            str = this.convertSymbols(str);

            // 9. Convert Trigonometry & Logarithms
            str = this.convertFunctions(str);

            // 10. Clean up redundant spaces and standard formatting
            str = this.cleanLatex(str);

            if (wrap && str && !str.startsWith('$') && !str.endsWith('$')) {
                return `$${str}$`;
            }

            return str;
        },

        /**
         * Normalize common unicode math characters from Microsoft Word / PDF
         */
        normalizeUnicode: function (str) {
            return str
                .replace(/[\u200B-\u200D\uFEFF]/g, '') // Zero-width spaces
                .replace(/\u00A0/g, ' ') // Non-breaking space
                .replace(/–|—/g, '-') // En-dash, Em-dash to minus
                .replace(/[“”]/g, '"')
                .replace(/[‘’]/g, "'")
                // Superscripts
                .replace(/⁰/g, '^0')
                .replace(/¹/g, '^1')
                .replace(/²/g, '^2')
                .replace(/³/g, '^3')
                .replace(/⁴/g, '^4')
                .replace(/⁵/g, '^5')
                .replace(/⁶/g, '^6')
                .replace(/⁷/g, '^7')
                .replace(/⁸/g, '^8')
                .replace(/⁹/g, '^9')
                .replace(/ⁿ/g, '^n')
                .replace(/ˣ/g, '^x')
                .replace(/⁺/g, '^+')
                .replace(/⁻/g, '^-')
                // Subscripts
                .replace(/₀/g, '_0')
                .replace(/₁/g, '_1')
                .replace(/₂/g, '_2')
                .replace(/₃/g, '_3')
                .replace(/₄/g, '_4')
                .replace(/₅/g, '_5')
                .replace(/₆/g, '_6')
                .replace(/₇/g, '_7')
                .replace(/₈/g, '_8')
                .replace(/₉/g, '_9')
                .replace(/ₙ/g, '_n')
                .replace(/ᵢ/g, '_i')
                .replace(/ⱼ/g, '_j')
                // Common Unicode Fractions
                .replace(/½/g, ' 1/2 ')
                .replace(/⅓/g, ' 1/3 ')
                .replace(/¼/g, ' 1/4 ')
                .replace(/¾/g, ' 3/4 ')
                .replace(/⅔/g, ' 2/3 ')
                .replace(/⅕/g, ' 1/5 ')
                .replace(/⅖/g, ' 2/5 ')
                .replace(/⅗/g, ' 3/5 ')
                .replace(/⅘/g, ' 4/5 ')
                .replace(/⅙/g, ' 1/6 ')
                .replace(/⅚/g, ' 5/6 ')
                .replace(/⅛/g, ' 1/8 ')
                .replace(/⅜/g, ' 3/8 ')
                .replace(/⅝/g, ' 5/8 ')
                .replace(/⅞/g, ' 7/8 ')
                // Operators & symbols
                .replace(/±/g, ' \\pm ')
                .replace(/∓/g, ' \\mp ')
                .replace(/×/g, ' \\times ')
                .replace(/÷/g, ' \\div ')
                .replace(/≤/g, ' \\le ')
                .replace(/≥/g, ' \\ge ')
                .replace(/≠/g, ' \\ne ')
                .replace(/≈/g, ' \\approx ')
                .replace(/∞/g, ' \\infty ')
                .replace(/°/g, '^{\\circ}')
                .replace(/→/g, ' \\to ')
                .replace(/←/g, ' \\leftarrow ')
                .replace(/↔/g, ' \\leftrightarrow ')
                .replace(/∈/g, ' \\in ')
                .replace(/∉/g, ' \\notin ')
                .replace(/⊂/g, ' \\subset ')
                .replace(/⊆/g, ' \\subseteq ')
                .replace(/∪/g, ' \\cup ')
                .replace(/∩/g, ' \\cap ')
                .replace(/∅/g, ' \\emptyset ')
                .replace(/∑/g, ' \\sum ')
                .replace(/∏/g, ' \\prod ')
                .replace(/∫/g, ' \\int ');
        },

        /**
         * Convert Limit expressions: e.g. "lim x->3", "lim_(x->3)", "lim_{x->\infty}"
         */
        convertLimits: function (str) {
            return str
                .replace(/\\?lim\s*_{?\s*([a-zA-Z0-9]+)\s*(?:->|\\to|→)\s*([^} )]+)\s*}?/gi, '\\lim_{$1 \\to $2}')
                .replace(/\\?lim\s*\(\s*([a-zA-Z0-9]+)\s*(?:->|\\to|→)\s*([^)]+)\s*\)/gi, '\\lim_{$1 \\to $2}')
                .replace(/\\?lim\s+([a-zA-Z0-9]+)\s*(?:->|\\to|→)\s*([a-zA-Z0-9_\\^+-]+)/gi, '\\lim_{$1 \\to $2}');
        },

        /**
         * Convert Calculus (Integrals, Summations, Limits)
         */
        convertCalculus: function (str) {
            return str
                .replace(/\\?int\s+([a-zA-Z0-9_\\^+-]+)\s+to\s+([a-zA-Z0-9_\\^+-]+)/gi, '\\int_{$1}^{$2}')
                .replace(/\\?int_([a-zA-Z0-9]+)\^([a-zA-Z0-9]+)/gi, '\\int_{$1}^{$2}')
                .replace(/\\?int(?!\w)/gi, '\\int ')
                .replace(/\\?sum\s+([a-zA-Z0-9]+)\s*=\s*([a-zA-Z0-9]+)\s+to\s+([a-zA-Z0-9]+)/gi, '\\sum_{$1=$2}^{$3}')
                .replace(/\\?sum(?!\w)/gi, '\\sum ');
        },

        /**
         * Convert Derivatives: f'(x), dy/dx, etc.
         */
        convertDerivatives: function (str) {
            return str
                .replace(/\bdy\s*\/\s*dx\b/gi, '\\frac{dy}{dx}')
                .replace(/\bd\s*\/\s*dx\b/gi, '\\frac{d}{dx}')
                .replace(/\b([fg])\s*'\s*\(\s*([^)]+)\s*\)/g, "$1'($2)")
                .replace(/\b([fg])\s*''\s*\(\s*([^)]+)\s*\)/g, "$1''($2)");
        },

        /**
         * Convert Roots: sqrt(x), akar(x), √(x), root(n, x)
         */
        convertRoots: function (str) {
            str = str.replace(/√\s*\(([^)]+)\)/g, '\\sqrt{$1}');
            str = str.replace(/√\s*([a-zA-Z0-9]+)/g, '\\sqrt{$1}');
            str = str.replace(/akar\s*\(([^)]+)\)/gi, '\\sqrt{$1}');
            str = str.replace(/akar\s+([a-zA-Z0-9]+)/gi, '\\sqrt{$1}');
            str = str.replace(/\\?sqrt\s*\[\s*([^\]]+)\s*\]\s*\(\s*([^)]+)\s*\)/gi, '\\sqrt[$1]{$2}');
            str = str.replace(/\\?sqrt\s*\(\s*([^)]+)\s*\)/gi, '\\sqrt{$1}');
            return str;
        },

        /**
         * Convert Fractions: (a + b) / (c + d), -5/6, 2/3, mixed fractions 1 1/2
         */
        convertFractions: function (str) {
            str = str.replace(/\b(\d+)\s+(\d+)\s*\/\s*(\d+)\b/g, '$1\\frac{$2}{$3}');

            let prev;
            let count = 0;
            do {
                prev = str;
                str = str.replace(/\(([^()]+)\)\s*\/\s*\(([^()]+)\)/g, '\\frac{$1}{$2}');
                str = str.replace(/\(([^()]+)\)\s*\/\s*([a-zA-Z0-9_\\^+-]+)/g, '\\frac{$1}{$2}');
                str = str.replace(/([a-zA-Z0-9_\\^+-]+)\s*\/\s*\(([^()]+)\)/g, '\\frac{$1}{$2}');
                count++;
            } while (prev !== str && count < 5);

            str = str.replace(/(^|[\s=+\-*(\[])-(\d+|[a-zA-Z])\s*\/\s*(\d+|[a-zA-Z]+)\b/g, '$1-\\frac{$2}{$3}');
            str = str.replace(/(^|[\s=+\-*(\[])([0-9a-zA-Z_\\^]+)\s*\/\s*([0-9a-zA-Z_\\^]+)(?=$|[\s=+\-*)\],.])/g, '$1\\frac{$2}{$3}');

            return str;
        },

        /**
         * Convert Powers & Superscripts: x^2 -> x^{2}, x^(2x+1) -> x^{2x+1}
         */
        convertPowers: function (str) {
            return str
                .replace(/\^([a-zA-Z0-9]+)/g, '^{$1}')
                .replace(/\^\(([^)]+)\)/g, '^{$1}')
                .replace(/_([a-zA-Z0-9]+)/g, '_{$1}')
                .replace(/_\(([^)]+)\)/g, '_{$1}');
        },

        /**
         * Convert Greek Letters & Math Symbols
         */
        convertSymbols: function (str) {
            const greekMap = {
                '\\bpi\\b': '\\pi',
                '\\bPI\\b': '\\pi',
                'π': '\\pi',
                '\\balpha\\b': '\\alpha',
                'α': '\\alpha',
                '\\bbeta\\b': '\\beta',
                'β': '\\beta',
                '\\bgamma\\b': '\\gamma',
                'γ': '\\gamma',
                '\\btheta\\b': '\\theta',
                'θ': '\\theta',
                '\\blambda\\b': '\\lambda',
                'λ': '\\lambda',
                '\\bmu\\b': '\\mu',
                'μ': '\\mu',
                '\\bsigma\\b': '\\sigma',
                'σ': '\\sigma',
                '\\bomega\\b': '\\omega',
                'ω': '\\omega',
                '\\bdelta\\b': '\\delta',
                'Δ': '\\Delta',
                'Ω': '\\Omega',
                'Σ': '\\Sigma'
            };

            for (const [key, val] of Object.entries(greekMap)) {
                const regex = key.startsWith('\\b') ? new RegExp(key, 'g') : new RegExp(key, 'g');
                str = str.replace(regex, val);
            }

            str = str.replace(/\.{3,}/g, '\\dots');
            return str;
        },

        /**
         * Convert Functions: sin, cos, tan, log, ln
         */
        convertFunctions: function (str) {
            return str
                .replace(/\b(sin|cos|tan|cot|sec|csc|log|ln|exp)\b(?!\w)/gi, function (m, fn) {
                    return '\\' + fn.toLowerCase();
                });
        },

        /**
         * Clean up redundant LaTeX syntax
         */
        cleanLatex: function (str) {
            return str
                .replace(/\\\\+/g, '\\')
                .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, function (m, num, den) {
                    return `\\frac{${num.trim()}}{${den.trim()}}`;
                })
                .replace(/\s+/g, ' ')
                .trim();
        },

        /**
         * Parses a full question text block containing Stem, Options (A-E), Key, and Explanation.
         * Auto-converts math formulas in question stem and all options!
         * @param {string} rawText 
         * @returns {Array<object>} Array of structured questions
         */
        parseQuestionBlock: function (rawText) {
            if (!rawText || !rawText.trim()) return [];

            const questions = [];
            const text = rawText.trim();

            const qBlocks = text.split(/(?:^|\n)(?=(?:No\.?\s*)?\d+[\.\)]\s+)/i).filter(b => b.trim().length > 0);

            if (qBlocks.length === 0) {
                const single = this.parseSingleQuestion(text, 1);
                if (single) questions.push(single);
                return questions;
            }

            qBlocks.forEach((block, idx) => {
                const parsed = this.parseSingleQuestion(block, idx + 1);
                if (parsed) {
                    questions.push(parsed);
                }
            });

            return questions;
        },

        /**
         * Parse a single question block into Stem, Options A-E, Key, Score, and Explanation
         */
        parseSingleQuestion: function (blockText, fallbackNum = 1) {
            let clean = blockText.trim();
            if (!clean) return null;

            let numMatch = clean.match(/^(?:No\.?\s*)?(\d+)[\.\)]\s+/i);
            let qNum = numMatch ? numMatch[1] : fallbackNum;
            if (numMatch) {
                clean = clean.substring(numMatch[0].length).trim();
            }

            let correctKey = '';
            const keyMatch = clean.match(/(?:Kunci(?: Jawaban)?|Jawaban|Key|Ans)\s*[:=]\s*([A-Ea-e])/i);
            if (keyMatch) {
                correctKey = keyMatch[1].toUpperCase();
                clean = clean.replace(keyMatch[0], '').trim();
            }

            let explanation = '';
            const expMatch = clean.match(/(?:Pembahasan|Penjelasan|Explanation)\s*[:=]\s*([\s\S]+?)$/i);
            if (expMatch) {
                explanation = expMatch[1].trim();
                clean = clean.replace(expMatch[0], '').trim();
            }

            const options = { A: '', B: '', C: '', D: '', E: '' };
            let stem = clean;

            const optRegex = /(?:^|\s|\n)([A-Ea-e])[\.\)]\s+([\s\S]*?)(?=(?:^|\s|\n)[A-Ea-e][\.\)]\s+|$)/g;
            const matches = [...clean.matchAll(optRegex)];

            if (matches.length >= 2) {
                const firstOptIdx = matches[0].index;
                stem = clean.substring(0, firstOptIdx).trim();

                matches.forEach(m => {
                    const optKey = m[1].toUpperCase();
                    let optVal = m[2].trim();
                    options[optKey] = this.smartConvertMathSentence(optVal);
                });
            }

            const convertedStem = this.smartConvertMathSentence(stem);
            const convertedExplanation = explanation ? this.smartConvertMathSentence(explanation) : '';

            return {
                id: 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                num: qNum,
                stem: convertedStem,
                options: options,
                correctKey: correctKey || 'A',
                score: 2,
                explanation: convertedExplanation
            };
        },

        /**
         * Intelligently detects and converts math expressions inside a normal sentence
         */
        smartConvertMathSentence: function (text) {
            if (!text || typeof text !== 'string') return '';
            let s = text.trim();

            if (s.startsWith('$') && s.endsWith('$')) {
                return s;
            }

            const isPureMath = /^[-+*/=0-9a-zA-Z_()^\\ \.,√±≤≥≠≈∞°→π]+$/.test(s) && 
                (/[=^/\\√±≤≥≠π]|lim|sqrt|akar|int|sum|f'|g'|\b[a-z]\^/i.test(s) || /^[A-Z0-9\s.,-]+$/i.test(s) === false);

            if (isPureMath && s.length > 0) {
                const converted = this.toLatex(s);
                return `$${converted}$`;
            }

            s = s.replace(/(?:Nilai\s+)?(lim\s+[a-zA-Z0-9]+\s*(?:->|\\to|→)\s*[\s\S]+?)(?=\s+adalah|\s+pada|\s*=\s*\.{2,}|$)/gi, function (m, expr) {
                return ` $${MathConverter.toLatex(expr)}$ `;
            });

            s = s.replace(/([fg]\(x\)\s*=\s*[^,.\s]+(?:\s*[+\-*/]\s*[^,.\s]+)*)/gi, function (m, expr) {
                return ` $${MathConverter.toLatex(expr)}$ `;
            });

            s = s.replace(/([fg]'\([x0-9]+\)\s*=\s*[^,.\s]+)/gi, function (m, expr) {
                return ` $${MathConverter.toLatex(expr)}$ `;
            });

            s = s.replace(/\.{3,}/g, '.....');
            return s.replace(/\s{2,}/g, ' ').trim();
        },

        /**
         * Render KaTeX into an HTML element with graceful fallback
         */
        renderKaTeX: function (element, latexString) {
            if (!element) return;
            if (!latexString || !latexString.trim()) {
                element.innerHTML = '<span class="text-muted" style="font-style: italic; font-size: 0.8125rem;">(Pratinjau visual rumus KaTeX akan muncul otomatis di sini...)</span>';
                return;
            }

            let cleanLatex = latexString.trim();
            if (cleanLatex.startsWith('$') && cleanLatex.endsWith('$')) {
                cleanLatex = cleanLatex.substring(1, cleanLatex.length - 1).trim();
            }

            if (window.katex) {
                try {
                    window.katex.render(cleanLatex, element, {
                        displayMode: true,
                        throwOnError: false,
                        output: 'htmlAndMathml'
                    });
                    return;
                } catch (err) {
                    console.warn('KaTeX render error:', err);
                }
            }

            element.textContent = cleanLatex;
        }
    };

    window.MathConverter = MathConverter;
})();
