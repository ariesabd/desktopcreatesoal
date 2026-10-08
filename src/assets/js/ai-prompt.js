/**
 * Lufya CBT - SoalCreator AI Master Prompt Generator & JSON Importer
 * Enables teachers to generate professional prompts for ChatGPT, Claude, Gemini, DeepSeek
 * and directly import AI-generated JSON into SoalCreator with 1-click.
 */

(function () {
    window.AIPromptModule = {
        currentTab: 'generator', // 'generator' | 'direct_import'

        init: function () {
            this.updateGeneratedPrompt();
        },

        openModal: function (prefillSubject = '') {
            const modal = document.getElementById('aiPromptModal');
            if (modal) {
                if (prefillSubject) {
                    const subjSelect = document.getElementById('aiPromptSubject');
                    if (subjSelect) {
                        subjSelect.value = prefillSubject;
                    }
                }
                this.switchTab('generator');
                this.updateGeneratedPrompt();
                modal.style.display = 'flex';
                modal.classList.add('active');
                if (window.lucide) {
                    lucide.createIcons();
                }
            }
        },

        closeModal: function () {
            const modal = document.getElementById('aiPromptModal');
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('active');
            }
        },

        switchTab: function (tabName) {
            this.currentTab = tabName;
            const tabGen = document.getElementById('aiTabGenerator');
            const tabImp = document.getElementById('aiTabImport');
            const btnGen = document.getElementById('aiBtnTabGen');
            const btnImp = document.getElementById('aiBtnTabImp');

            if (tabName === 'generator') {
                if (tabGen) tabGen.style.display = 'block';
                if (tabImp) tabImp.style.display = 'none';
                if (btnGen) btnGen.classList.add('active');
                if (btnImp) btnImp.classList.remove('active');
            } else {
                if (tabGen) tabGen.style.display = 'none';
                if (tabImp) tabImp.style.display = 'block';
                if (btnGen) btnGen.classList.remove('active');
                if (btnImp) btnImp.classList.add('active');
            }
        },

        updateGeneratedPrompt: function () {
            const subject = document.getElementById('aiPromptSubject')?.value || 'Matematika';
            const level = document.getElementById('aiPromptLevel')?.value || 'SMA Kelas 11';
            const topic = document.getElementById('aiPromptTopic')?.value?.trim() || 'Persamaan Kuadrat dan Fungsi Kuadrat';
            const countRaw = document.getElementById('aiPromptCount')?.value?.trim();
            const count = (countRaw && !isNaN(countRaw) && parseInt(countRaw, 10) > 0) ? parseInt(countRaw, 10) : 10;
            const difficulty = document.getElementById('aiPromptDiff')?.value || 'medium';
            const formatType = document.getElementById('aiPromptFormat')?.value || 'json';

            let diffText = 'Tingkat kesulitan bervariasi (Sedang dan Sulit berstandar HOTS - Higher Order Thinking Skills)';
            if (difficulty === 'easy') diffText = 'Tingkat kesulitan Mudah hingga Sedang (konseptual dasar)';
            if (difficulty === 'hard') diffText = 'Tingkat kesulitan Sulit / HOTS (High Order Thinking Skills, analisis mendalam)';

            let formatInstructions = '';
            if (formatType === 'json') {
                formatInstructions = `
KETENTUAN OUTPUT & STRUKTUR JSON:
1. Output WAJIB HANYA berupa raw valid JSON Array murni tanpa komentar, tanpa markdown code block \`\`\`json, dan tanpa kalimat pembuka/penutup apapun.
2. DISTRIBUSI KUNCI JAWABAN: Kunci jawaban ("correctKey") WAJIB DIACAK & TERSEBAR MERATA di antara pilihan A, B, C, D, dan E (JANGAN semua soal berkunci 'A' atau membentuk pola tebakan).
3. Setiap butir soal dalam array JSON harus mengikuti format baku berikut:
[
  {
    "stem": "Teks pertanyaan soal secara lengkap dan jelas...",
    "options": {
      "A": "Pilihan teks opsi A",
      "B": "Pilihan teks opsi B",
      "C": "Pilihan teks opsi C",
      "D": "Pilihan teks opsi D",
      "E": "Pilihan teks opsi E"
    },
    "correctKey": "C",
    "score": 2,
    "difficulty": "${difficulty}",
    "explanation": "Penjelasan langkah penyelesaian dan alasan mengapa opsi kunci jawaban tersebut benar."
  }
]
`;
            } else {
                formatInstructions = `
KETENTUAN OUTPUT TEKS:
1. Tuliskan naskah soal dalam format bernomor linier yang rapi.
2. DISTRIBUSI KUNCI JAWABAN: Kunci jawaban WAJIB DIACAK & TERSEBAR MERATA di antara A, B, C, D, dan E (jangan semua A atau berpola).
3. Setiap butir soal wajib memiliki komponen:
   - Nomor dan teks soal
   - Pilihan A, B, C, D, E
   - Kunci Jawaban (Kunci: A/B/C/D/E acak)
   - Bobot Soal (Bobot: 2)
   - Pembahasan Lengkap (Pembahasan: ...)
Contoh:
1. Teks pertanyaan soal nomor satu...
A. Pilihan jawaban A
B. Pilihan jawaban B
C. Pilihan jawaban C
D. Pilihan jawaban D
E. Pilihan jawaban E
Kunci: B
Bobot: 2
Pembahasan: Langkah penyelesaian logis...
`;
            }

            let specificModeTip = '';
            if (subject.toLowerCase().includes('matematika') || subject.toLowerCase().includes('fisika') || subject.toLowerCase().includes('kimia')) {
                specificModeTip = '\n4. Untuk rumus matematika/sains, tuliskan notasi matematika dalam sintaks LaTeX standar KaTeX (contoh: $x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$ atau $H_2SO_4$).';
            } else if (subject.toLowerCase().includes('arab') || subject.toLowerCase().includes('pai') || subject.toLowerCase().includes('agama')) {
                specificModeTip = '\n4. Tuliskan teks Arab dengan tanda harakat yang lengkap, jelas, dan benar secara kaidah nahwu & sharaf.';
            }

            const masterPrompt = `Anda adalah seorang Guru Ahli dan Pembuat Soal Ujian Profesional Berstandar Nasional.
Tolong buatkan ${count} butir soal Pilihan Ganda (opsi A sampai E) untuk:
- Mata Pelajaran : ${subject}
- Tingkat / Kelas: ${level}
- Materi / Topik : ${topic}
- Kriteria Soal  : ${diffText}
${specificModeTip}
${formatInstructions}
Pastikan setiap butir soal bermutu tinggi, pilihan pengecoh logis, kunci jawaban terdistribusi acak merata (A, B, C, D, E), dan penjelasan/pembahasan 100% akurat.`;

            const textarea = document.getElementById('aiGeneratedPromptOutput');
            if (textarea) {
                textarea.value = masterPrompt.trim();
            }
        },

        copyPromptToClipboard: function () {
            const textarea = document.getElementById('aiGeneratedPromptOutput');
            if (!textarea) return;

            textarea.select();
            navigator.clipboard.writeText(textarea.value).then(() => {
                if (window.CreatorApp) {
                    window.CreatorApp.showToast('Prompt AI berhasil disalin ke clipboard!', 'success');
                }
                const copyBtn = document.getElementById('aiCopyPromptBtn');
                if (copyBtn) {
                    const originalHtml = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<i data-lucide="check" style="width: 15px; height: 15px;"></i> Tersalin!';
                    if (window.lucide) lucide.createIcons();
                    setTimeout(() => {
                        copyBtn.innerHTML = originalHtml;
                        if (window.lucide) lucide.createIcons();
                    }, 2000);
                }
            }).catch(err => {
                document.execCommand('copy');
                if (window.CreatorApp) {
                    window.CreatorApp.showToast('Prompt disalin!', 'success');
                }
            });
        },

        executeDirectImport: function () {
            const rawJsonInput = document.getElementById('aiDirectJsonInput')?.value?.trim();
            if (!rawJsonInput) {
                if (window.CreatorApp) {
                    window.CreatorApp.showToast('Tempelkan hasil JSON dari AI terlebih dahulu.', 'warning');
                }
                return;
            }

            try {
                // Clean markdown code blocks if AI included ```json ... ```
                let cleaned = rawJsonInput.replace(/```json/gi, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(cleaned);

                let questionArray = [];
                if (Array.isArray(parsed)) {
                    questionArray = parsed;
                } else if (parsed.questions && Array.isArray(parsed.questions)) {
                    questionArray = parsed.questions;
                } else {
                    throw new Error('Format JSON tidak berisi daftar soal array.');
                }

                if (questionArray.length === 0) {
                    throw new Error('Daftar soal kosong.');
                }

                // Map into Creator internal schema
                const standardizedQuestions = questionArray.map((q, index) => {
                    const opts = q.options || {};
                    return {
                        id: 'q_' + Date.now() + '_' + index + '_' + Math.random().toString(36).substr(2, 4),
                        stem: q.stem || q.question || q.soal || `Soal ${index + 1}`,
                        options: {
                            A: opts.A || opts.a || '',
                            B: opts.B || opts.b || '',
                            C: opts.C || opts.c || '',
                            D: opts.D || opts.d || '',
                            E: opts.E || opts.e || ''
                        },
                        correctKey: (q.correctKey || q.kunci || q.answer || 'A').toUpperCase(),
                        score: Number(q.score || q.bobot || 1.0),
                        difficulty: q.difficulty || q.kesulitan || 'medium',
                        explanation: q.explanation || q.pembahasan || '',
                        isRtl: false
                    };
                });

                if (window.CreatorApp) {
                    // If currently on landing page, switch into workspace first!
                    if (window.CreatorApp.currentMode === 'landing') {
                        const currentSubject = document.getElementById('aiPromptSubject')?.value || 'Umum';
                        let modeToApply = 'umum';
                        if (currentSubject.toLowerCase().includes('matematika')) modeToApply = 'matematika';
                        if (currentSubject.toLowerCase().includes('arab')) modeToApply = 'arab';
                        window.CreatorApp.applyModeUI(modeToApply, false);
                    }
                    window.CreatorApp.questions = standardizedQuestions;
                    window.CreatorApp.saveState();
                    window.CreatorApp.renderQuestionList();
                    window.CreatorApp.updateStats();
                    window.CreatorApp.showToast(`Berhasil mengimpor ${standardizedQuestions.length} butir soal dari AI!`, 'success');
                    this.closeModal();
                }
            } catch (e) {
                alert('Gagal memproses JSON AI: ' + e.message + '\n\nPastikan format yang ditempel adalah JSON array yang valid.');
            }
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        window.AIPromptModule.init();
    });
})();
