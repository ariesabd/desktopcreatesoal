/**
 * Lufya CBT - SoalCreator Arabic Palette & Typography Normalizer
 * Specialized tools for Arabic & PAI Question Creation (RTL, Harakat, Ligatures, Normalization)
 */

const ArabicPalette = {
    // Harakat & Arabic Diacritics
    harakatList: [
        { char: '\u064E', name: 'Fathah', label: 'ـَ', desc: 'Fathah' },
        { char: '\u064F', name: 'Dammah', label: 'ـُ', desc: 'Dammah' },
        { char: '\u0650', name: 'Kasrah', label: 'ـِ', desc: 'Kasrah' },
        { char: '\u064B', name: 'Fathatain', label: 'ـً', desc: 'Tanwin Fathah' },
        { char: '\u064C', name: 'Dammatain', label: 'ـٌ', desc: 'Tanwin Dammah' },
        { char: '\u064D', name: 'Kasratain', label: 'ـٍ', desc: 'Tanwin Kasrah' },
        { char: '\u0652', name: 'Sukun', label: 'ـْ', desc: 'Sukun' },
        { char: '\u0651', name: 'Shaddah', label: 'ـّ', desc: 'Tasydid' },
        { char: '\u0670', name: 'Dagger Alif', label: 'ـٰ', desc: 'Alif Khanjariyah' },
        { char: '\u0653', name: 'Maddah', label: 'ـٓ', desc: 'Maddah' },
        { char: '\u0654', name: 'Hamza Above', label: 'ـٔ', desc: 'Hamzah Atas' },
        { char: '\u0655', name: 'Hamza Below', label: 'ـٕ', desc: 'Hamzah Bawah' },
        { char: '\u0640', name: 'Tatweel', label: 'ـ', desc: 'Pemanjang Karakter' }
    ],

    // Common Arabic Quranic / Exam Symbols
    symbolList: [
        { char: 'ﷻ', name: 'Jalla Jalaluh', label: 'ﷻ' },
        { char: 'ﷺ', name: 'Salawat', label: 'ﷺ' },
        { char: '﷽', name: 'Bismillah Full', label: '﷽' },
        { char: '۝', name: 'Ayah End', label: '۝' },
        { char: '۞', name: 'Rub el Hizb', label: '۞' },
        { char: '۩', name: 'Sajdah', label: '۩' },
        { char: '؟', name: 'Tanya Arab', label: '؟' },
        { char: '؛', name: 'Titik Koma Arab', label: '؛' },
        { char: '،', name: 'Koma Arab', label: '،' }
    ],

    // Arabic Numerals
    numeralsList: [
        { char: '٠', name: '0', label: '٠' },
        { char: '١', name: '1', label: '١' },
        { char: '٢', name: '2', label: '٢' },
        { char: '٣', name: '3', label: '٣' },
        { char: '٤', name: '4', label: '٤' },
        { char: '٥', name: '5', label: '٥' },
        { char: '٦', name: '6', label: '٦' },
        { char: '٧', name: '7', label: '٧' },
        { char: '٨', name: '8', label: '٨' },
        { char: '٩', name: '9', label: '٩' }
    ],

    activeTargetId: null,

    init: function () {
        this.renderPaletteModal();
    },

    openModal: function (targetElementId) {
        this.activeTargetId = targetElementId;
        const modal = document.getElementById('arabicPaletteModal');
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('active');
        }
    },

    closeModal: function () {
        const modal = document.getElementById('arabicPaletteModal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('active');
        }
    },

    insertChar: function (char) {
        if (!this.activeTargetId) return;
        const target = document.getElementById(this.activeTargetId);
        if (!target) return;

        target.focus();
        document.execCommand('insertText', false, char);
        if (window.CreatorApp) {
            window.CreatorApp.saveStateDebounced();
        }
    },

    renderPaletteModal: function () {
        const modal = document.getElementById('arabicPaletteModal');
        if (!modal) return;

        let harakatHtml = this.harakatList.map(item => `
            <button type="button" class="arabic-char-btn" onclick="ArabicPalette.insertChar('${item.char}')" title="${item.desc}">
                <span class="arabic-char-label">${item.label}</span>
                <span class="arabic-char-desc">${item.name}</span>
            </button>
        `).join('');

        let symbolHtml = this.symbolList.map(item => `
            <button type="button" class="arabic-char-btn" onclick="ArabicPalette.insertChar('${item.char}')" title="${item.name}">
                <span class="arabic-char-label" style="font-size: 1.25rem;">${item.label}</span>
                <span class="arabic-char-desc">${item.name}</span>
            </button>
        `).join('');

        let numeralHtml = this.numeralsList.map(item => `
            <button type="button" class="arabic-char-btn" onclick="ArabicPalette.insertChar('${item.char}')" title="Angka ${item.name}">
                <span class="arabic-char-label" style="font-size: 1.25rem;">${item.label}</span>
                <span class="arabic-char-desc">${item.name}</span>
            </button>
        `).join('');

        const content = document.getElementById('arabicPaletteModalContent');
        if (content) {
            content.innerHTML = `
                <div class="arabic-section">
                    <h5 class="arabic-section-title">Tanda Harakat & Sukun</h5>
                    <div class="arabic-grid">${harakatHtml}</div>
                </div>
                <div class="arabic-section" style="margin-top: 16px;">
                    <h5 class="arabic-section-title">Simbol & Tanda Baca Arab</h5>
                    <div class="arabic-grid">${symbolHtml}</div>
                </div>
                <div class="arabic-section" style="margin-top: 16px;">
                    <h5 class="arabic-section-title">Angka Arab (Hijaiyah)</h5>
                    <div class="arabic-grid">${numeralHtml}</div>
                </div>
            `;
        }
    },

    // Normalize and clean Arabic text (Removes corrupt BOM, hidden non-printing chars, normalize standard unicode)
    normalizeArabicText: function (text) {
        if (!text) return '';
        let cleaned = text;
        // Clean zero-width non-joiners & hidden control chars
        cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF]/g, '');
        // Normalize Arabic Alef variants to standard Alef if needed
        // (Keep Harakat intact)
        return cleaned.trim();
    },

    // Convert Western numbers (0-9) to Eastern Arabic (٠-٩) or vice versa
    convertNumerals: function (text, toArabic = true) {
        const western = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        const eastern = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

        let res = text;
        if (toArabic) {
            for (let i = 0; i < 10; i++) {
                res = res.replaceAll(western[i], eastern[i]);
            }
        } else {
            for (let i = 0; i < 10; i++) {
                res = res.replaceAll(eastern[i], western[i]);
            }
        }
        return res;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ArabicPalette.init();
});
