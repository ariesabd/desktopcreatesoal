/**
 * Lufya CBT - SoalCreator Desktop Client-Side DOCX & Plain Text Generator
 * 100% Offline, Pure JavaScript via docx.js and FileSaver.js
 */

window.DocxExporter = {
    cleanHtml: function (html) {
        if (!html) return '';
        let text = html.replace(/<br\s*[\/]?>/gi, '\n');
        text = text.replace(/<\/p>/gi, '\n');
        text = text.replace(/<[^>]+>/g, '');
        // decode html entities
        const doc = new DOMParser().parseFromString(text, 'text/html');
        return doc.body.textContent || '';
    },

    exportTableDocx: async function (meta, questions) {
        if (!window.docx) {
            alert('Pustaka docx.js belum siap.');
            return;
        }

        const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, AlignmentType, WidthType, BorderStyle, HeadingLevel } = window.docx;

        const bankName = meta.bankName || 'Naskah Soal Ujian';
        const subject = meta.subjectName || 'Umum';
        const bankCode = meta.bankCode || 'SOAL-01';
        const grade = meta.grade || 'Umum';

        const tableBorderNone = {
            top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        };

        const standardBorder = {
            top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
            left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
            right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
        };

        // 1. Info Header Table
        const infoTable = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorderNone,
            rows: [
                new TableRow({
                    children: [
                        new TableCell({
                            width: { size: 50, type: WidthType.PERCENTAGE },
                            borders: tableBorderNone,
                            children: [
                                new Paragraph({ children: [new TextRun({ text: 'Mata Pelajaran: ', bold: true }), new TextRun(subject)] }),
                                new Paragraph({ children: [new TextRun({ text: 'Kode Bank Soal: ', bold: true }), new TextRun(bankCode)] })
                            ]
                        }),
                        new TableCell({
                            width: { size: 50, type: WidthType.PERCENTAGE },
                            borders: tableBorderNone,
                            children: [
                                new Paragraph({ children: [new TextRun({ text: 'Jenjang / Kelas: ', bold: true }), new TextRun(grade)] }),
                                new Paragraph({ children: [new TextRun({ text: 'Total Butir Soal: ', bold: true }), new TextRun(questions.length.toString())] })
                            ]
                        })
                    ]
                })
            ]
        });

        // 2. Question Table Rows
        const questionRows = [
            new TableRow({
                tableHeader: true,
                children: [
                    new TableCell({
                        width: { size: 600, type: WidthType.DXA },
                        borders: standardBorder,
                        shading: { fill: 'F1F5F9' },
                        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'NO', bold: true })] })]
                    }),
                    new TableCell({
                        width: { size: 5000, type: WidthType.DXA },
                        borders: standardBorder,
                        shading: { fill: 'F1F5F9' },
                        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'PERTANYAAN / SOAL', bold: true })] })]
                    }),
                    new TableCell({
                        width: { size: 4000, type: WidthType.DXA },
                        borders: standardBorder,
                        shading: { fill: 'F1F5F9' },
                        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'OPSI & KUNCI JAWABAN', bold: true })] })]
                    })
                ]
            })
        ];

        questions.forEach((q, idx) => {
            const num = (idx + 1).toString();
            const stemText = this.cleanHtml(q.stem || '');
            const stemParas = stemText.split('\n').filter(Boolean).map(line => new Paragraph({ text: line, spacing: { after: 100 } }));
            if (stemParas.length === 0) stemParas.push(new Paragraph({ text: '-' }));

            const optionParas = [];
            ['A', 'B', 'C', 'D', 'E'].forEach(k => {
                const optText = this.cleanHtml(q.options[k] || '');
                const isCorrect = (q.correctKey === k);
                optionParas.push(new Paragraph({
                    spacing: { after: 60 },
                    children: [
                        new TextRun({ text: `${k}. `, bold: true }),
                        new TextRun({ text: optText, bold: isCorrect, color: isCorrect ? '15803D' : '000000' })
                    ]
                }));
            });

            // Kunci, bobot & pembahasan
            optionParas.push(new Paragraph({
                spacing: { before: 100, after: 40 },
                children: [
                    new TextRun({ text: `Kunci Jawaban: `, bold: true }),
                    new TextRun({ text: q.correctKey || '-', bold: true, color: '15803D' })
                ]
            }));

            optionParas.push(new Paragraph({
                spacing: { after: 40 },
                children: [
                    new TextRun({ text: `Bobot: `, bold: true }),
                    new TextRun({ text: Number(q.score || 1.0).toFixed(1) })
                ]
            }));

            if (q.explanation) {
                optionParas.push(new Paragraph({
                    spacing: { after: 60 },
                    children: [
                        new TextRun({ text: `Pembahasan: `, bold: true, italics: true }),
                        new TextRun({ text: this.cleanHtml(q.explanation), italics: true })
                    ]
                }));
            }

            questionRows.push(new TableRow({
                children: [
                    new TableCell({
                        width: { size: 600, type: WidthType.DXA },
                        borders: standardBorder,
                        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: num, bold: true })] })]
                    }),
                    new TableCell({
                        width: { size: 5000, type: WidthType.DXA },
                        borders: standardBorder,
                        children: stemParas
                    }),
                    new TableCell({
                        width: { size: 4000, type: WidthType.DXA },
                        borders: standardBorder,
                        children: optionParas
                    })
                ]
            }));
        });

        const mainTable = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: standardBorder,
            rows: questionRows
        });

        const doc = new Document({
            sections: [{
                properties: {
                    page: {
                        margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 }
                    }
                },
                children: [
                    new Paragraph({
                        text: bankName.toUpperCase(),
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 200 }
                    }),
                    infoTable,
                    new Paragraph({ text: '', spacing: { after: 200 } }),
                    mainTable
                ]
            }]
        });

        const blob = await Packer.toBlob(doc);
        const cleanName = bankName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'naskah_soal';
        saveAs(blob, `soal_tabel_${cleanName}.docx`);
    },

    exportLinearDocx: async function (meta, questions) {
        if (!window.docx) {
            alert('Pustaka docx.js belum siap.');
            return;
        }

        const { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } = window.docx;

        const bankName = meta.bankName || 'Naskah Soal Ujian';
        const subject = meta.subjectName || 'Umum';
        const bankCode = meta.bankCode || 'SOAL-01';
        const grade = meta.grade || 'Umum';

        const children = [
            new Paragraph({
                text: bankName.toUpperCase(),
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { after: 150 }
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 250 },
                children: [
                    new TextRun({ text: `Mata Pelajaran: ${subject}  |  Kode: ${bankCode}  |  Kelas: ${grade}`, italics: true })
                ]
            })
        ];

        questions.forEach((q, idx) => {
            const num = (idx + 1).toString();
            const stemText = this.cleanHtml(q.stem || '');

            children.push(new Paragraph({
                spacing: { before: 180, after: 80 },
                children: [
                    new TextRun({ text: `${num}. `, bold: true }),
                    new TextRun(stemText)
                ]
            }));

            ['A', 'B', 'C', 'D', 'E'].forEach(k => {
                const optText = this.cleanHtml(q.options[k] || '');
                const isCorrect = (q.correctKey === k);
                children.push(new Paragraph({
                    indent: { left: 360 },
                    spacing: { after: 40 },
                    children: [
                        new TextRun({ text: `${k}. `, bold: true }),
                        new TextRun({ text: optText, bold: isCorrect, color: isCorrect ? '15803D' : '000000' })
                    ]
                }));
            });

            children.push(new Paragraph({
                indent: { left: 360 },
                spacing: { before: 60, after: 40 },
                children: [
                    new TextRun({ text: `Kunci: `, bold: true }),
                    new TextRun({ text: q.correctKey || '-', bold: true, color: '15803D' }),
                    new TextRun({ text: `  |  Bobot: `, bold: true }),
                    new TextRun(Number(q.score || 1.0).toFixed(1))
                ]
            }));

            if (q.explanation) {
                children.push(new Paragraph({
                    indent: { left: 360 },
                    spacing: { after: 120 },
                    children: [
                        new TextRun({ text: `Pembahasan: `, bold: true, italics: true }),
                        new TextRun({ text: this.cleanHtml(q.explanation), italics: true })
                    ]
                }));
            }
        });

        const doc = new Document({
            sections: [{
                properties: {
                    page: {
                        margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 }
                    }
                },
                children: children
            }]
        });

        const blob = await Packer.toBlob(doc);
        const cleanName = bankName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'naskah_soal';
        saveAs(blob, `soal_linier_${cleanName}.docx`);
    },

    exportPlainText: function (meta, questions) {
        const bankName = meta.bankName || 'Naskah Soal Ujian';
        const subject = meta.subjectName || 'Umum';
        const bankCode = meta.bankCode || 'SOAL-01';
        const grade = meta.grade || 'Umum';

        let out = `====================================================\n`;
        out += `${bankName.toUpperCase()}\n`;
        out += `Mata Pelajaran : ${subject}\n`;
        out += `Kode Bank Soal : ${bankCode}\n`;
        out += `Jenjang / Kelas: ${grade}\n`;
        out += `Total Soal     : ${questions.length} Butir\n`;
        out += `====================================================\n\n`;

        questions.forEach((q, idx) => {
            const num = idx + 1;
            out += `${num}. ${this.cleanHtml(q.stem || '')}\n`;
            ['A', 'B', 'C', 'D', 'E'].forEach(k => {
                out += `   ${k}. ${this.cleanHtml(q.options[k] || '')}\n`;
            });
            out += `   Kunci: ${q.correctKey || '-'}\n`;
            out += `   Bobot: ${Number(q.score || 1.0).toFixed(1)}\n`;
            if (q.explanation) {
                out += `   Pembahasan: ${this.cleanHtml(q.explanation)}\n`;
            }
            out += `\n`;
        });

        const blob = new Blob([out], { type: 'text/plain;charset=utf-8' });
        const cleanName = bankName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'naskah_soal';
        saveAs(blob, `soal_${cleanName}.txt`);
    }
};
