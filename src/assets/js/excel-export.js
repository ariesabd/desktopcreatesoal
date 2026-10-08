/**
 * Lufya CBT - SoalCreator Desktop Client-Side Excel (.xlsx) Generator
 * 100% Offline, Pure JavaScript via SheetJS (xlsx.full.js) and FileSaver.js
 */

window.ExcelExporter = {
    cleanHtml: function (html) {
        if (!html) return '';
        let text = html.replace(/<br\s*[\/]?>/gi, '\n');
        text = text.replace(/<\/p>/gi, '\n');
        text = text.replace(/<[^>]+>/g, '');
        const doc = new DOMParser().parseFromString(text, 'text/html');
        return doc.body.textContent || '';
    },

    exportSpreadsheet: function (meta, questions) {
        if (!window.XLSX) {
            alert('Pustaka SheetJS belum siap.');
            return;
        }

        const bankName = meta.bankName || 'Naskah Soal Ujian';

        // 11-column standard CBT Excel header
        const headers = ['NO', 'JENIS', 'SOAL', 'OPSI_A', 'OPSI_B', 'OPSI_C', 'OPSI_D', 'OPSI_E', 'KUNCI', 'BOBOT', 'PEMBAHASAN'];
        const dataRows = [headers];

        questions.forEach((q, idx) => {
            const row = [
                idx + 1,
                'PG',
                this.cleanHtml(q.stem || ''),
                this.cleanHtml(q.options?.A || ''),
                this.cleanHtml(q.options?.B || ''),
                this.cleanHtml(q.options?.C || ''),
                this.cleanHtml(q.options?.D || ''),
                this.cleanHtml(q.options?.E || ''),
                (q.correctKey || 'A').toUpperCase(),
                Number(q.score || 1.0),
                this.cleanHtml(q.explanation || '')
            ];
            dataRows.push(row);
        });

        const ws = XLSX.utils.aoa_to_sheet(dataRows);

        // Column widths
        ws['!cols'] = [
            { wch: 6 },  // NO
            { wch: 8 },  // JENIS
            { wch: 45 }, // SOAL
            { wch: 25 }, // OPSI_A
            { wch: 25 }, // OPSI_B
            { wch: 25 }, // OPSI_C
            { wch: 25 }, // OPSI_D
            { wch: 25 }, // OPSI_E
            { wch: 8 },  // KUNCI
            { wch: 8 },  // BOBOT
            { wch: 30 }  // PEMBAHASAN
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'FORMAT_IMPORT_SOAL');

        // Write binary Excel buffer
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        const cleanName = bankName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'naskah_soal';
        saveAs(blob, `soal_excel_${cleanName}.xlsx`);
    }
};
