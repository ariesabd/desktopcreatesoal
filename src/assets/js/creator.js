/**
 * Lufya CBT - SoalCreator Core Application Logic v2.0
 * Multi-Mode Studio (Matematika, Bahasa Arab, Umum, AI Lab),
 * Smart Quick Paste Parser, Visual Card Editor, RTL, LocalStorage Sync & Exporter
 */

(function () {
    const STORAGE_KEY = 'lufya_soal_creator_clean_v2';
    const MODE_STORAGE_KEY = 'lufya_creator_mode';

    window.CreatorApp = {
        currentMode: 'landing', // 'landing' | 'matematika' | 'arab' | 'umum'
        metadata: {
            bankName: '',
            bankCode: '',
            subjectName: '',
            grade: 'X'
        },

        questions: [],
        debounceTimer: null,

        init: function () {
            this.loadDraft();
            this.initModeFromStorage();
            this.bindGlobalEvents();
            this.renderAll();
        },

        genId: function () {
            return 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        },

        // =========================================================================
        // MODE SELECTION & HUB ROUTING
        // =========================================================================
        initModeFromStorage: function () {
            const savedMode = localStorage.getItem(MODE_STORAGE_KEY);
            if (savedMode && ['matematika', 'arab', 'umum'].includes(savedMode)) {
                this.applyModeUI(savedMode, false);
            } else {
                this.returnToHub(false);
            }
        },

        selectMode: function (modeName) {
            this.applyModeUI(modeName, true);
        },

        applyModeUI: function (modeName, notify = true) {
            this.currentMode = modeName;
            localStorage.setItem(MODE_STORAGE_KEY, modeName);

            const hubSec = document.getElementById('landingHubSection');
            const workSec = document.getElementById('workspaceSection');
            const navMode = document.getElementById('navModeIndicator');
            const navText = document.getElementById('navModeText');
            const workPill = document.getElementById('workspaceModePill');
            const landingNav = document.getElementById('landingNavLinks');
            const landingActions = document.getElementById('landingNavActions');
            const workNav = document.getElementById('workspaceNavActions');

            if (hubSec) hubSec.style.display = 'none';
            if (workSec) workSec.style.display = 'block';
            if (landingNav) landingNav.style.display = 'none';
            if (landingActions) landingActions.style.display = 'none';
            if (workNav) workNav.style.display = 'flex';
            if (navMode) navMode.style.display = 'inline-flex';

            let modeLabel = 'Mode: Umum';
            let pillClass = 'badge-purple';

            if (modeName === 'matematika') {
                modeLabel = 'Mode: Matematika & Sains';
                pillClass = 'badge-blue';
                if (!this.metadata.subjectName) this.metadata.subjectName = 'Matematika';
                if (workSec) workSec.classList.remove('workspace-mode-arab');
            } else if (modeName === 'arab') {
                modeLabel = 'Mode: Bahasa Arab & PAI';
                pillClass = 'badge-emerald';
                if (!this.metadata.subjectName) this.metadata.subjectName = 'Bahasa Arab';
                if (workSec) workSec.classList.add('workspace-mode-arab');
            } else {
                modeLabel = 'Mode: Umum & Bahasa';
                pillClass = 'badge-purple';
                if (!this.metadata.subjectName) this.metadata.subjectName = 'Umum';
                if (workSec) workSec.classList.remove('workspace-mode-arab');
            }

            if (navText) navText.textContent = modeLabel;
            if (workPill) {
                workPill.textContent = modeLabel;
                workPill.className = 'creator-logo-badge ' + pillClass;
            }

            // Sync Drawer State
            const drawerModeText = document.getElementById('drawerModeText');
            const drawerWorkspace = document.getElementById('drawerWorkspaceActions');
            if (drawerModeText) drawerModeText.textContent = modeLabel;
            if (drawerWorkspace) drawerWorkspace.style.display = 'flex';

            // Sync metadata inputs
            const subjInput = document.getElementById('metaSubject');
            if (subjInput && !subjInput.value) {
                subjInput.value = this.metadata.subjectName;
            }

            this.renderAll();
            if (notify) {
                this.showToast(`Masuk ke ${modeLabel}`, 'info');
            }
        },

        returnToHub: function (notify = true) {
            this.currentMode = 'landing';
            localStorage.setItem(MODE_STORAGE_KEY, 'landing');

            const hubSec = document.getElementById('landingHubSection');
            const workSec = document.getElementById('workspaceSection');
            const navMode = document.getElementById('navModeIndicator');
            const landingNav = document.getElementById('landingNavLinks');
            const landingActions = document.getElementById('landingNavActions');
            const workNav = document.getElementById('workspaceNavActions');

            if (hubSec) hubSec.style.display = 'block';
            if (workSec) workSec.style.display = 'none';
            if (landingNav) landingNav.style.display = 'flex';
            if (landingActions) landingActions.style.display = 'flex';
            if (workNav) workNav.style.display = 'none';
            if (navMode) navMode.style.display = 'none';

            // Sync Drawer State
            const drawerModeText = document.getElementById('drawerModeText');
            const drawerWorkspace = document.getElementById('drawerWorkspaceActions');
            if (drawerModeText) drawerModeText.textContent = 'Beranda Hub';
            if (drawerWorkspace) drawerWorkspace.style.display = 'none';

            window.scrollTo({ top: 0, behavior: 'smooth' });
            if (notify) {
                this.showToast('Kembali ke Beranda Hub', 'info');
            }
        },

        // =========================================================================
        // MOBILE OFF-CANVAS DRAWER CONTROLS
        // =========================================================================
        toggleMobileDrawer: function () {
            const drawer = document.getElementById('mobileDrawer');
            const backdrop = document.getElementById('mobileDrawerBackdrop');
            if (!drawer || !backdrop) return;
            const isOpen = drawer.classList.contains('active');
            if (isOpen) {
                this.closeMobileDrawer();
            } else {
                this.openMobileDrawer();
            }
        },

        openMobileDrawer: function () {
            const drawer = document.getElementById('mobileDrawer');
            const backdrop = document.getElementById('mobileDrawerBackdrop');
            if (drawer && backdrop) {
                drawer.classList.add('active');
                backdrop.classList.add('active');
                document.body.style.overflow = 'hidden';
                if (window.lucide) window.lucide.createIcons();
            }
        },

        closeMobileDrawer: function () {
            const drawer = document.getElementById('mobileDrawer');
            const backdrop = document.getElementById('mobileDrawerBackdrop');
            if (drawer && backdrop) {
                drawer.classList.remove('active');
                backdrop.classList.remove('active');
                document.body.style.overflow = '';
            }
        },

        toggleUsageGuide: function () {
            const guide = document.getElementById('usageGuideSection');
            const chevron = document.getElementById('guideChevron');
            if (!guide) return;
            if (guide.style.display === 'none' || !guide.style.display) {
                guide.style.display = 'block';
                if (chevron) chevron.style.transform = 'rotate(180deg)';
            } else {
                guide.style.display = 'none';
                if (chevron) chevron.style.transform = 'rotate(0deg)';
            }
        },

        openDevInfoModal: function () {
            const modal = document.getElementById('modalDevInfo');
            if (modal) {
                modal.style.display = 'flex';
                modal.classList.add('active');
                if (window.lucide) lucide.createIcons();
            }
        },

        closeDevInfoModal: function () {
            const modal = document.getElementById('modalDevInfo');
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('active');
            }
        },

        openAiLab: function () {
            if (window.AIPromptModule) {
                const subj = (this.metadata && this.metadata.subjectName) ? this.metadata.subjectName : (document.getElementById('metaSubject')?.value || '');
                window.AIPromptModule.openModal(subj);
            }
        },

        openConverterModal: function () {
            const modal = document.getElementById('modalLatexConverter');
            if (modal) {
                modal.style.display = 'flex';
                modal.classList.add('active');
                if (window.lucide) lucide.createIcons();
                this.runConverter();
            }
        },

        closeConverterModal: function () {
            const modal = document.getElementById('modalLatexConverter');
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('active');
            }
        },

        loadConverterPreset: function (presetKey) {
            const PRESETS = {
                limit_basic: "Nilai lim x->3 (4x^2 + 5x + 1) = .....\nA. 36\nB. 37\nC. 53\nD. 84\nE. 85\nKunci: E",
                limit_frac: "Nilai lim x->3 (2x^2 + 3x - 2)/(x^2 + 5x + 6) = .....\nA. -5/6\nB. -2/6\nC. 1/6\nD. 2/6\nE. 5/6\nKunci: B",
                turunan: "Turunan f(x) = 2x + 1/(2x) pada x = 1 adalah .....\nA. 1\nB. 1 1/2\nC. 2\nD. 2 1/2\nE. 3\nKunci: D",
                akar_pecahan: "Jika f(x) = sqrt(x^2 + 5) dan g(x) = (3x + 1)/(x - 2), maka nilai (f o g)(3) adalah .....\nA. sqrt(105)\nB. 10\nC. sqrt(109)\nD. 12\nE. 15\nKunci: A"
            };
            const input = document.getElementById('desktopConverterInput');
            if (input && PRESETS[presetKey]) {
                input.value = PRESETS[presetKey];
                this.runConverter();
            }
        },

        runConverter: function () {
            const input = document.getElementById('desktopConverterInput');
            const preview = document.getElementById('desktopConverterPreview');
            if (!input || !preview) return;
            const raw = input.value.trim();
            if (!raw) {
                preview.innerHTML = '<span class="text-muted" style="font-style: italic; font-size: 0.8125rem;">(Hasil render KaTeX akan otomatis muncul di sini)</span>';
                return;
            }
            if (window.MathConverter) {
                const latex = window.MathConverter.toLatex(raw, { wrapWithDollar: true });
                window.MathConverter.renderKaTeX(preview, latex);
            }
        },

        importConvertedToQuestions: function () {
            const input = document.getElementById('desktopConverterInput');
            if (!input) return;
            const raw = input.value.trim();
            if (!raw) {
                this.showToast('Masukkan teks naskah soal terlebih dahulu!', 'warning');
                return;
            }

            if (window.MathConverter) {
                const parsed = window.MathConverter.parseQuestions(raw);
                if (parsed && parsed.length > 0) {
                    parsed.forEach(q => {
                        const newQ = {
                            id: this.genId(),
                            number: this.questions.length + 1,
                            stem: q.stem || '',
                            options: q.options || { A: '', B: '', C: '', D: '', E: '' },
                            correctKey: q.correctKey || 'A',
                            score: q.score || 2,
                            difficulty: q.difficulty || 'medium',
                            explanation: q.explanation || ''
                        };
                        this.questions.push(newQ);
                    });
                    this.saveState();
                    this.renderAll();
                    this.closeConverterModal();
                    this.selectMode('matematika');
                    this.showToast(`Berhasil menambahkan ${parsed.length} butir soal ke Studio Matematika!`, 'success');
                    return;
                }
            }

            // Fallback: convert text and add 1 question
            const latex = window.MathConverter ? window.MathConverter.toLatex(raw, { wrapWithDollar: true }) : raw;
            const newQ = {
                id: this.genId(),
                number: this.questions.length + 1,
                stem: latex,
                options: { A: '', B: '', C: '', D: '', E: '' },
                correctKey: 'A',
                score: 2,
                difficulty: 'medium',
                explanation: ''
            };
            this.questions.push(newQ);
            this.saveState();
            this.renderAll();
            this.closeConverterModal();
            this.selectMode('matematika');
            this.showToast('Berhasil menambahkan soal ke Studio Matematika!', 'success');
        },

        // =========================================================================
        // GLOBAL EVENT LISTENERS
        // =========================================================================
        bindGlobalEvents: function () {
            // Paste image handler for clipboard
            document.addEventListener('paste', (e) => {
                const active = document.activeElement;
                if (!active || (!active.classList.contains('rich-editor-area') && !active.classList.contains('opt-editor-area'))) {
                    return;
                }

                const items = (e.clipboardData || e.originalEvent.clipboardData).items;
                for (let index in items) {
                    const item = items[index];
                    if (item.kind === 'file' && item.type.indexOf('image/') !== -1) {
                        e.preventDefault();
                        const blob = item.getAsFile();
                        this.uploadImageFile(blob, (imgUrl) => {
                            const imgHtml = `<img src="${imgUrl}" style="max-width: 100%; border-radius: 6px; margin: 6px 0;" alt="Gambar Soal" /><br>`;
                            active.focus();
                            document.execCommand('insertHTML', false, imgHtml);
                            this.saveState();
                            this.showToast('Gambar tersimpan ke folder img/!', 'success');
                        });
                        break;
                    }
                }
            });

            // Auto sync metadata inputs
            const bName = document.getElementById('metaBankName');
            const bCode = document.getElementById('metaBankCode');
            const bSubject = document.getElementById('metaSubject');
            const bGrade = document.getElementById('metaGrade');

            if (bName) bName.addEventListener('input', () => { this.metadata.bankName = bName.value; this.saveState(); });
            if (bCode) bCode.addEventListener('input', () => { this.metadata.bankCode = bCode.value; this.saveState(); });
            if (bSubject) bSubject.addEventListener('input', () => { this.metadata.subjectName = bSubject.value; this.saveState(); });
            if (bGrade) bGrade.addEventListener('change', () => { this.metadata.grade = bGrade.value; this.saveState(); });

            // Dropdown triggers
            document.querySelectorAll('.dropdown-toggle').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const parent = btn.closest('.dropdown-wrapper');
                    document.querySelectorAll('.dropdown-wrapper').forEach(dw => {
                        if (dw !== parent) dw.classList.remove('active');
                    });
                    if (parent) parent.classList.toggle('active');
                });
            });

            document.addEventListener('click', () => {
                document.querySelectorAll('.dropdown-wrapper').forEach(dw => dw.classList.remove('active'));
            });

            // Modal backdrop click to close
            document.querySelectorAll('.c-modal-backdrop').forEach(backdrop => {
                backdrop.addEventListener('click', (e) => {
                    if (e.target === backdrop) {
                        backdrop.style.display = 'none';
                        backdrop.classList.remove('active');
                    }
                });
            });
        },

        // =========================================================================
        // RENDERING & CARD BUILDER
        // =========================================================================
        renderAll: function () {
            // Update metadata form
            const bName = document.getElementById('metaBankName');
            const bCode = document.getElementById('metaBankCode');
            const bSubject = document.getElementById('metaSubject');
            const bGrade = document.getElementById('metaGrade');

            if (bName && this.metadata.bankName !== undefined) bName.value = this.metadata.bankName;
            if (bCode && this.metadata.bankCode !== undefined) bCode.value = this.metadata.bankCode;
            if (bSubject && this.metadata.subjectName !== undefined) bSubject.value = this.metadata.subjectName;
            if (bGrade && this.metadata.grade !== undefined) bGrade.value = this.metadata.grade;

            this.renderQuestionList();
            this.updateStats();
        },

        updateStats: function () {
            const totalQ = this.questions.length;
            let totalScore = 0;
            let answeredKeys = 0;

            this.questions.forEach(q => {
                totalScore += Number(q.score || 1.0);
                if (q.correctKey && ['A', 'B', 'C', 'D', 'E'].includes(q.correctKey.toUpperCase())) {
                    answeredKeys++;
                }
            });

            const elTotalQ = document.getElementById('statTotalQ');
            const elTotalScore = document.getElementById('statTotalScore');
            const elAnswered = document.getElementById('statAnsweredKeys');
            const emptyState = document.getElementById('emptyState');

            if (elTotalQ) elTotalQ.textContent = totalQ;
            if (elTotalScore) elTotalScore.textContent = totalScore.toFixed(1);
            if (elAnswered) elAnswered.textContent = `${answeredKeys}/${totalQ}`;

            if (emptyState) {
                emptyState.style.display = totalQ === 0 ? 'flex' : 'none';
            }
            if (window.lucide) {
                lucide.createIcons();
            }
        },

        renderQuestionList: function () {
            const container = document.getElementById('questionListContainer');
            if (!container) return;

            if (this.questions.length === 0) {
                container.innerHTML = '';
                return;
            }

            let html = '';
            this.questions.forEach((q, idx) => {
                const num = idx + 1;
                const isRtl = (q.isRtl || this.currentMode === 'arab') ? 'dir="rtl" style="text-align: right; font-family: var(--font-arabic); font-size: 1.0625rem;"' : '';

                let optionsHtml = '';
                ['A', 'B', 'C', 'D', 'E'].forEach(k => {
                    const isChecked = q.correctKey === k ? 'checked' : '';
                    const isCorrectClass = q.correctKey === k ? 'is-correct' : '';
                    const optVal = q.options[k] || '';

                    optionsHtml += `
                        <div class="opt-row ${isCorrectClass}" id="optRow_${q.id}_${k}">
                            <div class="opt-key-selector">
                                <label class="opt-radio-label">
                                    <input type="radio" name="correct_${q.id}" value="${k}" ${isChecked} onchange="CreatorApp.setCorrectKey('${q.id}', '${k}')">
                                    <span class="opt-key-badge">${k}</span>
                                </label>
                                <span class="opt-key-title">Pilihan ${k}</span>
                            </div>
                            <div class="opt-input-wrapper">
                                <div class="opt-editor-area" id="optArea_${q.id}_${k}" contenteditable="true" ${isRtl} placeholder="Ketik opsi jawaban ${k}..." oninput="CreatorApp.updateOptionText('${q.id}', '${k}', this.innerHTML)">
                                    ${optVal}
                                </div>
                                <div class="opt-quick-tools">
                                    <button type="button" class="tool-btn btn-icon-only" title="Sisipkan Gambar Opsi" onclick="CreatorApp.triggerImageUpload('optArea_${q.id}_${k}')">
                                        <i data-lucide="image" style="width: 13px; height: 13px;"></i>
                                    </button>
                                    <button type="button" class="tool-btn btn-icon-only" title="Palet Rumus KaTeX" onclick="MathPalette.open('optArea_${q.id}_${k}')">
                                        <span style="font-weight: 700; font-size: 0.8125rem;">&Sigma;</span>
                                    </button>
                                    <button type="button" class="tool-btn btn-icon-only" title="Palet Harakat Arab" onclick="ArabicPalette.openModal('optArea_${q.id}_${k}')">
                                        <span style="font-family: var(--font-arabic); font-weight: 700; font-size: 0.9375rem;">ع</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                });

                html += `
                    <div class="q-card" id="card_${q.id}">
                        <div class="q-card-header">
                            <div class="q-card-meta">
                                <span class="q-num-badge">Soal #${num}</span>
                                <span class="q-key-pill"><i data-lucide="check" style="width: 12px; height: 12px;"></i> Kunci: <strong>${q.correctKey || 'A'}</strong></span>
                                <span class="q-score-pill"><i data-lucide="award" style="width: 12px; height: 12px;"></i> Bobot: <strong>${Number(q.score || 1.0).toFixed(1)}</strong></span>
                                ${q.isRtl || this.currentMode === 'arab' ? '<span class="q-mode-pill badge-emerald">Mode Arab / RTL</span>' : ''}
                            </div>
                            <div class="q-card-actions">
                                <button type="button" class="tool-btn" title="Pindah ke Atas" onclick="CreatorApp.moveQuestion(${idx}, -1)" ${idx === 0 ? 'disabled style="opacity:0.4;"' : ''}>
                                    <i data-lucide="arrow-up" style="width: 14px; height: 14px;"></i>
                                    <span>Naik</span>
                                </button>
                                <button type="button" class="tool-btn" title="Pindah ke Bawah" onclick="CreatorApp.moveQuestion(${idx}, 1)" ${idx === this.questions.length - 1 ? 'disabled style="opacity:0.4;"' : ''}>
                                    <i data-lucide="arrow-down" style="width: 14px; height: 14px;"></i>
                                    <span>Turun</span>
                                </button>
                                <button type="button" class="tool-btn" title="Duplikasi Soal" onclick="CreatorApp.duplicateQuestion('${q.id}')">
                                    <i data-lucide="copy" style="width: 14px; height: 14px;"></i>
                                    <span>Duplikat</span>
                                </button>
                                <button type="button" class="tool-btn btn-danger-soft" title="Hapus Soal" onclick="CreatorApp.deleteQuestion('${q.id}')">
                                    <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                                    <span>Hapus</span>
                                </button>
                            </div>
                        </div>

                        <!-- Question Stem Toolbar -->
                        <div class="toolbar-c">
                            <div class="toolbar-group">
                                <button type="button" class="tool-btn btn-icon-only" title="Tebal (Ctrl+B)" onclick="CreatorApp.execFormat('stemArea_${q.id}', 'bold')"><strong>B</strong></button>
                                <button type="button" class="tool-btn btn-icon-only" title="Miring (Ctrl+I)" onclick="CreatorApp.execFormat('stemArea_${q.id}', 'italic')"><em>I</em></button>
                                <button type="button" class="tool-btn btn-icon-only" title="Garis Bawah (Ctrl+U)" onclick="CreatorApp.execFormat('stemArea_${q.id}', 'underline')"><u>U</u></button>
                                <button type="button" class="tool-btn btn-icon-only" title="Pangkat (x²)" onclick="CreatorApp.execFormat('stemArea_${q.id}', 'superscript')">x²</button>
                                <button type="button" class="tool-btn btn-icon-only" title="Indeks (H₂O)" onclick="CreatorApp.execFormat('stemArea_${q.id}', 'subscript')">x₂</button>
                            </div>
                            
                            <div class="tool-divider"></div>
                            
                            <div class="toolbar-group">
                                <button type="button" class="tool-btn tool-btn-action ${this.currentMode === 'matematika' ? 'active-tool' : ''}" title="Palet Rumus KaTeX" onclick="MathPalette.open('stemArea_${q.id}')">
                                    <i data-lucide="sigma" style="width: 14px; height: 14px; color: var(--brand-600);"></i>
                                    <span>Rumus Math</span>
                                </button>
                                <button type="button" class="tool-btn tool-btn-action ${this.currentMode === 'arab' ? 'active-tool' : ''}" title="Palet Harakat Arab" onclick="ArabicPalette.openModal('stemArea_${q.id}')">
                                    <span style="font-family: var(--font-arabic); font-weight: 700; font-size: 0.9375rem; line-height: 1; color: var(--emerald-text);">ع</span>
                                    <span>Harakat</span>
                                </button>
                                <button type="button" class="tool-btn tool-btn-action ${q.isRtl ? 'active-tool' : ''}" title="Arah Teks RTL / LTR" onclick="CreatorApp.toggleRtl('${q.id}')">
                                    <i data-lucide="languages" style="width: 14px; height: 14px; color: var(--purple-text);"></i>
                                    <span>RTL</span>
                                </button>
                                <button type="button" class="tool-btn tool-btn-action" title="Unggah / Sisipkan Gambar" onclick="CreatorApp.triggerImageUpload('stemArea_${q.id}')">
                                    <i data-lucide="image" style="width: 14px; height: 14px; color: var(--brand-600);"></i>
                                    <span>Gambar</span>
                                </button>
                                <button type="button" class="tool-btn tool-btn-action" title="Sisipkan Tabel Mini" onclick="CreatorApp.insertMiniTable('stemArea_${q.id}')">
                                    <i data-lucide="table" style="width: 14px; height: 14px; color: var(--amber-text);"></i>
                                    <span>Tabel</span>
                                </button>
                            </div>
                        </div>

                        <!-- Question Stem Area -->
                        <div class="rich-editor-area" id="stemArea_${q.id}" contenteditable="true" ${isRtl} placeholder="Tuliskan teks pertanyaan soal nomor ${num} di sini..." oninput="CreatorApp.updateStemText('${q.id}', this.innerHTML)">
                            ${q.stem}
                        </div>

                        <!-- Options List -->
                        <div class="options-container">
                            ${optionsHtml}
                        </div>

                        <!-- Meta Settings (Bobot, Kesulitan, Pembahasan) -->
                        <div class="q-card-footer">
                            <div class="form-field-c" style="flex: 1 1 120px;">
                                <label class="form-label-c"><i data-lucide="award" style="width: 12px; height: 12px;"></i> Bobot Nilai</label>
                                <input type="number" step="0.5" min="0.5" value="${q.score || 1.0}" class="form-input-c" onchange="CreatorApp.updateScore('${q.id}', this.value)">
                            </div>
                            <div class="form-field-c" style="flex: 1 1 140px;">
                                <label class="form-label-c"><i data-lucide="bar-chart-2" style="width: 12px; height: 12px;"></i> Tingkat Kesulitan</label>
                                <select class="form-select-c" onchange="CreatorApp.updateDifficulty('${q.id}', this.value)">
                                    <option value="easy" ${q.difficulty === 'easy' ? 'selected' : ''}>Mudah</option>
                                    <option value="medium" ${q.difficulty === 'medium' || !q.difficulty ? 'selected' : ''}>Sedang</option>
                                    <option value="hard" ${q.difficulty === 'hard' ? 'selected' : ''}>Sulit (HOTS)</option>
                                </select>
                            </div>
                            <div class="form-field-c" style="flex: 2 1 280px;">
                                <label class="form-label-c"><i data-lucide="message-square" style="width: 12px; height: 12px;"></i> Pembahasan / Penjelasan Kunci</label>
                                <input type="text" value="${q.explanation || ''}" placeholder="Langkah penyelesaian / pembahasan..." class="form-input-c" onchange="CreatorApp.updateExplanation('${q.id}', this.value)">
                            </div>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;
            if (window.lucide) lucide.createIcons();
        },

        // =========================================================================
        // QUESTION MANAGEMENT ACTIONS
        // =========================================================================
        addQuestion: function () {
            const newQ = {
                id: this.genId(),
                stem: "",
                options: { A: "", B: "", C: "", D: "", E: "" },
                correctKey: "A",
                score: 1.0,
                difficulty: "medium",
                explanation: "",
                isRtl: this.currentMode === 'arab'
            };
            this.questions.push(newQ);
            this.saveState();
            this.renderAll();

            setTimeout(() => {
                const el = document.getElementById('card_' + newQ.id);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    const stem = document.getElementById('stemArea_' + newQ.id);
                    if (stem) stem.focus();
                }
            }, 100);
        },

        duplicateQuestion: function (id) {
            const idx = this.questions.findIndex(q => q.id === id);
            if (idx === -1) return;

            const orig = this.questions[idx];
            const dup = JSON.parse(JSON.stringify(orig));
            dup.id = this.genId();

            this.questions.splice(idx + 1, 0, dup);
            this.saveState();
            this.renderAll();
            this.showToast('Soal berhasil diduplikasi!', 'success');
        },

        deleteQuestion: function (id) {
            if (!confirm('Hapus butir soal ini?')) return;
            this.questions = this.questions.filter(q => q.id !== id);
            this.saveState();
            this.renderAll();
            this.showToast('Soal dihapus.', 'info');
        },

        moveQuestion: function (fromIdx, dir) {
            const toIdx = fromIdx + dir;
            if (toIdx < 0 || toIdx >= this.questions.length) return;

            const temp = this.questions[fromIdx];
            this.questions[fromIdx] = this.questions[toIdx];
            this.questions[toIdx] = temp;

            this.saveState();
            this.renderAll();
        },

        toggleRtl: function (id) {
            const q = this.questions.find(item => item.id === id);
            if (!q) return;

            q.isRtl = !q.isRtl;
            this.saveState();
            this.renderAll();
            this.showToast(q.isRtl ? 'Arah teks Arab (RTL) aktif' : 'Arah teks LTR aktif', 'info');
        },

        execFormat: function (elementId, command) {
            const el = document.getElementById(elementId);
            if (el) el.focus();
            document.execCommand(command, false, null);
            this.saveState();
        },

        updateStemText: function (id, html) {
            const q = this.questions.find(item => item.id === id);
            if (q) {
                q.stem = html;
                this.saveStateDebounced();
            }
        },

        updateOptionText: function (id, key, html) {
            const q = this.questions.find(item => item.id === id);
            if (q) {
                q.options[key] = html;
                this.saveStateDebounced();
            }
        },

        setCorrectKey: function (id, key) {
            const q = this.questions.find(item => item.id === id);
            if (q) {
                q.correctKey = key;
                this.saveState();
                ['A', 'B', 'C', 'D', 'E'].forEach(k => {
                    const row = document.getElementById(`optRow_${id}_${k}`);
                    if (row) {
                        if (k === key) row.classList.add('is-correct');
                        else row.classList.remove('is-correct');
                    }
                });
                this.updateStats();
                this.showToast(`Kunci jawaban: ${key}`, 'success');
            }
        },

        updateScore: function (id, val) {
            const q = this.questions.find(item => item.id === id);
            if (q) {
                q.score = parseFloat(val) || 1.0;
                this.saveStateDebounced();
                this.updateStats();
            }
        },

        updateDifficulty: function (id, val) {
            const q = this.questions.find(item => item.id === id);
            if (q) {
                q.difficulty = val;
                this.saveStateDebounced();
            }
        },

        updateExplanation: function (id, val) {
            const q = this.questions.find(item => item.id === id);
            if (q) {
                q.explanation = val;
                this.saveStateDebounced();
            }
        },

        // =========================================================================
        // IMAGE UPLOAD & OFFLINE INSERT (BASE64)
        // =========================================================================
        uploadImageFile: function (file, onDone) {
            const reader = new FileReader();
            reader.onload = (e) => onDone(e.target.result);
            reader.readAsDataURL(file);
        },

        triggerImageUpload: function (targetElementId) {
            const fileInput = document.getElementById('hiddenImageFileInput');
            if (!fileInput) return;

            fileInput.onchange = (e) => {
                if (fileInput.files && fileInput.files[0]) {
                    const file = fileInput.files[0];
                    const target = document.getElementById(targetElementId);
                    if (target) {
                        this.uploadImageFile(file, (imgUrl) => {
                            target.focus();
                            const imgHtml = `<img src="${imgUrl}" style="max-width: 100%; border-radius: 6px; margin: 6px 0;" alt="Gambar Soal" /><br>`;
                            document.execCommand('insertHTML', false, imgHtml);
                            this.saveState();
                            this.showToast('Gambar berhasil disisipkan!', 'success');
                        });
                    }
                }
                fileInput.value = '';
            };
            fileInput.click();
        },

        insertMiniTable: function (targetElementId) {
            const target = document.getElementById(targetElementId);
            if (!target) return;

            const tableHtml = `
                <table style="border-collapse: collapse; width: 85%; margin: 10px 0; border: 1px solid #cbd5e1; font-size: 0.8125rem;">
                    <thead>
                        <tr style="background: #f1f5f9;">
                            <th style="border: 1px solid #cbd5e1; padding: 6px 10px;">Kolom 1</th>
                            <th style="border: 1px solid #cbd5e1; padding: 6px 10px;">Kolom 2</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">Data A</td>
                            <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">Data B</td>
                        </tr>
                    </tbody>
                </table><br>
            `;
            target.focus();
            document.execCommand('insertHTML', false, tableHtml);
            this.saveState();
            this.showToast('Tabel kecil disisipkan!', 'success');
        },

        // =========================================================================
        // SMART QUICK PASTE PARSER
        // =========================================================================
        openQuickPasteModal: function () {
            const modal = document.getElementById('modalQuickPaste');
            if (modal) {
                modal.style.display = 'flex';
                modal.classList.add('active');
                if (window.lucide) lucide.createIcons();
            }
        },

        closeQuickPasteModal: function () {
            const modal = document.getElementById('modalQuickPaste');
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('active');
            }
        },

        processQuickPaste: function () {
            const text = document.getElementById('quickPasteInput')?.value || '';
            const isAppend = document.getElementById('chkQuickPasteAppend')?.checked ?? true;

            if (!text.trim()) {
                this.showToast('Silakan tempelkan teks soal terlebih dahulu.', 'warning');
                return;
            }

            const parsed = this.parseRawQuestions(text);
            if (parsed.length === 0) {
                alert('Tidak ada butir soal yang terdeteksi. Pastikan naskah memiliki format nomor (contoh: 1. Soal...), opsi (A. B. C. D. E.), dan Kunci (Kunci: A).');
                return;
            }

            if (isAppend) {
                this.questions = this.questions.concat(parsed);
            } else {
                this.questions = parsed;
            }

            this.saveState();
            this.renderAll();
            this.closeQuickPasteModal();
            document.getElementById('quickPasteInput').value = '';
            this.showToast(`Berhasil mengonversi ${parsed.length} butir soal!`, 'success');
        },

        parseRawQuestions: function (rawText) {
            const lines = rawText.split(/\r?\n/);
            const list = [];
            let cur = null;
            let curOptKey = null;

            const qNumRegex = /^(\d+)[\.\)]\s*(.*)$/;
            const optRegex = /^([A-Ea-e])[\.\)]\s*(.*)$/;
            const keyRegex = /^(?:Kunci|Jawaban|Ans|Key)\s*[:=]\s*([A-Ea-e])/i;
            const scoreRegex = /^(?:Bobot|Score|Poin)\s*[:=]\s*([\d\.]+)/i;
            const expRegex = /^(?:Pembahasan|Bahasan|Penjelasan|Exp)\s*[:=]\s*(.*)$/i;

            lines.forEach(line => {
                const trimmed = line.trim();
                if (!trimmed) return;

                const qMatch = trimmed.match(qNumRegex);
                if (qMatch) {
                    if (cur) list.push(cur);
                    cur = {
                        id: this.genId(),
                        stem: qMatch[2].trim(),
                        options: { A: '', B: '', C: '', D: '', E: '' },
                        correctKey: 'A',
                        score: 1.0,
                        difficulty: 'medium',
                        explanation: '',
                        isRtl: this.currentMode === 'arab'
                    };
                    curOptKey = null;
                    return;
                }

                if (!cur) {
                    cur = {
                        id: this.genId(),
                        stem: trimmed,
                        options: { A: '', B: '', C: '', D: '', E: '' },
                        correctKey: 'A',
                        score: 1.0,
                        difficulty: 'medium',
                        explanation: '',
                        isRtl: this.currentMode === 'arab'
                    };
                    return;
                }

                const keyMatch = trimmed.match(keyRegex);
                if (keyMatch) {
                    cur.correctKey = keyMatch[1].toUpperCase();
                    curOptKey = null;
                    return;
                }

                const scoreMatch = trimmed.match(scoreRegex);
                if (scoreMatch) {
                    cur.score = parseFloat(scoreMatch[1]) || 1.0;
                    curOptKey = null;
                    return;
                }

                const expMatch = trimmed.match(expRegex);
                if (expMatch) {
                    cur.explanation = expMatch[1].trim();
                    curOptKey = null;
                    return;
                }

                const optMatch = trimmed.match(optRegex);
                if (optMatch) {
                    curOptKey = optMatch[1].toUpperCase();
                    cur.options[curOptKey] = optMatch[2].trim();
                    return;
                }

                if (curOptKey) {
                    cur.options[curOptKey] += '<br>' + trimmed;
                } else {
                    cur.stem += '<br>' + trimmed;
                }
            });

            if (cur) list.push(cur);
            return list;
        },

        // =========================================================================
        // LIVE PREVIEW MODAL
        // =========================================================================
        openLivePreview: function () {
            const modal = document.getElementById('modalLivePreview');
            const previewBox = document.getElementById('livePreviewContent');
            if (!modal || !previewBox) return;

            if (this.questions.length === 0) {
                previewBox.innerHTML = `
                    <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
                        <i data-lucide="file-x" style="width: 40px; height: 40px; margin: 0 auto 12px; display: block;"></i>
                        <h4>Belum ada soal untuk dipratinjau</h4>
                        <p style="font-size: 0.8125rem;">Tambahkan soal terlebih dahulu di lembar kerja.</p>
                    </div>
                `;
            } else {
                let html = `
                    <div style="text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #0f172a;">
                        <h2 style="font-size: 1.25rem; font-weight: 800; text-transform: uppercase;">${this.metadata.bankName || 'Naskah Soal Ujian CBT'}</h2>
                        <p style="font-size: 0.8125rem; color: var(--text-secondary); margin-top: 4px;">
                            Mata Pelajaran: <strong>${this.metadata.subjectName || 'Umum'}</strong> | Kelas: <strong>${this.metadata.grade || 'Semua'}</strong> | Kode: <strong>${this.metadata.bankCode || '-'}</strong>
                        </p>
                    </div>
                `;

                this.questions.forEach((q, idx) => {
                    const isRtl = (q.isRtl || this.currentMode === 'arab') ? 'dir="rtl" style="text-align: right; font-family: var(--font-arabic);"' : '';
                    html += `
                        <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px dashed var(--border-color);" ${isRtl}>
                            <div style="font-weight: 700; margin-bottom: 8px;">
                                <span>${idx + 1}.</span> <span>${q.stem || '(Teks Soal Kosong)'}</span>
                            </div>
                            <div style="padding-left: 20px; margin-bottom: 8px;">
                    `;
                    ['A', 'B', 'C', 'D', 'E'].forEach(k => {
                        const opt = q.options[k];
                        if (opt && opt.trim() !== '') {
                            const isKey = q.correctKey === k ? 'color: var(--success); font-weight: 700;' : '';
                            html += `
                                <div style="margin-bottom: 4px; ${isKey}">
                                    <strong>${k}.</strong> ${opt}
                                </div>
                            `;
                        }
                    });
                    html += `
                            </div>
                            <div style="font-size: 0.75rem; color: var(--text-muted); background: var(--bg-subtle); padding: 6px 10px; border-radius: var(--radius-sm); display: inline-flex; gap: 14px;">
                                <span>Kunci: <strong style="color: var(--success);">${q.correctKey || 'A'}</strong></span>
                                <span>Bobot: <strong>${Number(q.score || 1.0).toFixed(1)}</strong></span>
                                ${q.explanation ? `<span>Bahasan: <em>${q.explanation}</em></span>` : ''}
                            </div>
                        </div>
                    `;
                });

                previewBox.innerHTML = html;
            }

            modal.style.display = 'flex';
            modal.classList.add('active');
            if (window.lucide) lucide.createIcons();
        },

        closeLivePreview: function () {
            const modal = document.getElementById('modalLivePreview');
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('active');
            }
        },

        // =========================================================================
        // DRAFT BACKUP & RESTORE (JSON)
        // =========================================================================
        saveState: function () {
            const payload = {
                metadata: this.metadata,
                questions: this.questions,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        },

        saveStateDebounced: function () {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.saveState();
            }, 300);
        },

        loadDraft: function () {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed && typeof parsed === 'object') {
                        this.metadata = parsed.metadata || this.metadata;
                        this.questions = parsed.questions || [];
                    }
                }
            } catch (e) {
                this.questions = [];
            }
        },

        exportJsonDraft: function () {
            const payload = {
                generator: 'Lufya CBT SoalCreator v2.0',
                exportedAt: new Date().toISOString(),
                metadata: this.metadata,
                questions: this.questions
            };
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
            const dlAnchor = document.createElement('a');
            const fname = (this.metadata.bankName || 'draft_soal').replace(/[^a-zA-Z0-9_-]/g, '_') + '.json';
            dlAnchor.setAttribute("href", dataStr);
            dlAnchor.setAttribute("download", fname);
            document.body.appendChild(dlAnchor);
            dlAnchor.click();
            dlAnchor.remove();
            this.showToast('Draft JSON berhasil diunduh!', 'success');
        },

        importJsonDraft: function () {
            const fileInput = document.getElementById('hiddenJsonFileInput');
            if (!fileInput) return;

            fileInput.onchange = (e) => {
                if (fileInput.files && fileInput.files[0]) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        try {
                            const parsed = JSON.parse(ev.target.result);
                            if (parsed.questions && Array.isArray(parsed.questions)) {
                                this.questions = parsed.questions;
                                if (parsed.metadata) this.metadata = parsed.metadata;
                                this.saveState();
                                this.renderAll();
                                this.showToast(`Berhasil memuat ${this.questions.length} butir soal dari JSON!`, 'success');
                            } else if (Array.isArray(parsed)) {
                                this.questions = parsed;
                                this.saveState();
                                this.renderAll();
                                this.showToast(`Berhasil memuat ${this.questions.length} butir soal!`, 'success');
                            } else {
                                alert('Format berkas JSON tidak valid.');
                            }
                        } catch (err) {
                            alert('Gagal membaca berkas JSON: ' + err.message);
                        }
                    };
                    reader.readAsText(fileInput.files[0]);
                }
                fileInput.value = '';
            };
            fileInput.click();
        },

        clearAllDraft: function () {
            if (!confirm('Apakah Anda yakin ingin menghapus semua butir soal dan memulai dari awal?')) return;
            this.questions = [];
            this.saveState();
            this.renderAll();
            this.showToast('Lembar kerja berhasil dikosongkan.', 'info');
        },

        // =========================================================================
        // CLIENT-SIDE EXPORT DISPATCHER (WORD, EXCEL, TEXT)
        // =========================================================================
        submitExport: function (format) {
            if (this.questions.length === 0) {
                alert('Tidak ada butir soal untuk diekspor. Silakan buat atau tambahkan soal terlebih dahulu.');
                return;
            }

            this.showToast('Menyiapkan berkas ekspor...', 'info');

            try {
                if (format === 'docx_table') {
                    if (window.DocxExporter) {
                        DocxExporter.exportTableDocx(this.metadata, this.questions);
                        this.showToast('Berkas Word Tabel (.docx) berhasil diunduh!', 'success');
                    } else {
                        alert('Pustaka DocxExporter belum termuat.');
                    }
                } else if (format === 'docx_linear') {
                    if (window.DocxExporter) {
                        DocxExporter.exportLinearDocx(this.metadata, this.questions);
                        this.showToast('Berkas Word Linier (.docx) berhasil diunduh!', 'success');
                    } else {
                        alert('Pustaka DocxExporter belum termuat.');
                    }
                } else if (format === 'excel') {
                    if (window.ExcelExporter) {
                        ExcelExporter.exportSpreadsheet(this.metadata, this.questions);
                        this.showToast('Berkas Excel CBT (.xlsx) berhasil diunduh!', 'success');
                    } else {
                        alert('Pustaka ExcelExporter belum termuat.');
                    }
                } else if (format === 'txt') {
                    if (window.DocxExporter) {
                        DocxExporter.exportPlainText(this.metadata, this.questions);
                        this.showToast('Berkas Teks (.txt) berhasil diunduh!', 'success');
                    }
                } else {
                    this.exportJsonDraft();
                }
            } catch (err) {
                console.error(err);
                alert('Gagal mengekspor berkas: ' + err.message);
            }
        },

        // =========================================================================
        // TOAST NOTIFICATIONS
        // =========================================================================
        showToast: function (msg, type = 'info') {
            const container = document.querySelector('.toast-container');
            if (!container) return;

            const toast = document.createElement('div');
            toast.className = `c-toast toast-${type}`;
            toast.innerHTML = `
                <i data-lucide="${type === 'success' ? 'check-circle' : type === 'warning' ? 'alert-triangle' : 'info'}" style="width: 16px; height: 16px;"></i>
                <span>${msg}</span>
            `;
            container.appendChild(toast);
            if (window.lucide) lucide.createIcons();

            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(10px)';
                toast.style.transition = 'all 0.25s ease';
                setTimeout(() => toast.remove(), 250);
            }, 3200);
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        CreatorApp.init();
    });
})();
