const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  WidthType,
  BorderStyle,
  HeadingLevel,
  ShadingType,
  TableOfContents,
  PageBreak,
  Footer,
  PageNumber,
  ImageRun
} = require('docx');

const content = require('./content.js');

const FONT_FAMILY = 'Times New Roman';
const COLOR_BLACK = '000000';
const BORDER_COLOR = '000000';
const LIGHT_GRAY_BG = 'F2F2F2';

// Standard 1.5 line spacing = 360 twips
const LINE_SPACING_1_5 = 360;

// Helper to create body paragraphs with 1.5 line spacing, Times New Roman 12pt, black text, and 0.5 inch (720 twips) first line indent
const createBodyParagraph = (text, options = {}) => {
  const runs = [];

  if (typeof text === 'string') {
    runs.push(
      new TextRun({
        text,
        font: FONT_FAMILY,
        size: options.size || 24, // 12pt
        bold: options.bold || false,
        italic: options.italic || false,
        color: COLOR_BLACK,
      })
    );
  } else if (Array.isArray(text)) {
    text.forEach((part) => {
      runs.push(
        new TextRun({
          text: part.text,
          font: FONT_FAMILY,
          size: options.size || 24,
          bold: part.bold || options.bold || false,
          italic: part.italic || options.italic || false,
          color: COLOR_BLACK,
        })
      );
    });
  }

  return new Paragraph({
    alignment: options.alignment || AlignmentType.JUSTIFY,
    indent: options.noIndent ? undefined : { firstLine: 720 }, // 1 cm / 0.5 inch first line indent
    spacing: {
      before: options.spaceBefore || 0,
      after: options.spaceAfter || 120, // 6pt
      line: LINE_SPACING_1_5,
    },
    children: runs,
  });
};

// Helper to create Headings for TOC compatibility
const createHeading = (text, level = 1) => {
  let size = 28; // 14pt for H1
  let spaceBefore = 240;
  let spaceAfter = 120;
  let headingLevel = HeadingLevel.HEADING_1;

  if (level === 2) {
    size = 24; // 12pt for H2
    spaceBefore = 200;
    spaceAfter = 100;
    headingLevel = HeadingLevel.HEADING_2;
  } else if (level === 3) {
    size = 24; // 12pt for H3
    spaceBefore = 160;
    spaceAfter = 80;
    headingLevel = HeadingLevel.HEADING_3;
  }

  return new Paragraph({
    alignment: AlignmentType.JUSTIFY,
    heading: headingLevel,
    spacing: { before: spaceBefore, after: spaceAfter, line: LINE_SPACING_1_5 },
    children: [
      new TextRun({
        text,
        font: FONT_FAMILY,
        size,
        bold: true,
        color: COLOR_BLACK,
      }),
    ],
  });
};

// Helper for numbered list items with hanging indent
const createNumberedItem = (numText, text, indentLevel = 1) => {
  const leftIndent = indentLevel * 720;
  const hanging = 360;

  return new Paragraph({
    alignment: AlignmentType.JUSTIFY,
    indent: { left: leftIndent, hanging: hanging },
    spacing: { before: 40, after: 80, line: LINE_SPACING_1_5 },
    children: [
      new TextRun({
        text: `${numText} `,
        font: FONT_FAMILY,
        size: 24, // 12pt
        bold: true,
        color: COLOR_BLACK,
      }),
      new TextRun({
        text,
        font: FONT_FAMILY,
        size: 24, // 12pt
        color: COLOR_BLACK,
      }),
    ],
  });
};

const createPlaceholderBox = (label, captionText) => {
  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: 'FFFFFF', type: ShadingType.CLEAR },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BLACK },
              bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BLACK },
              left: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BLACK },
              right: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BLACK },
            },
            margins: { top: 200, bottom: 200, left: 200, right: 200 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 100, after: 100, line: LINE_SPACING_1_5 },
                children: [
                  new TextRun({
                    text: `[ TEMPAT FOTO GRAFIK: ${label} ]`,
                    font: FONT_FAMILY,
                    size: 24,
                    bold: true,
                    color: COLOR_BLACK,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 60, after: 60, line: LINE_SPACING_1_5 },
                children: [
                  new TextRun({
                    text: `(Silakan lampirkan foto/gambar grafik secara manual di bagian ini)`,
                    font: FONT_FAMILY,
                    size: 22,
                    italic: true,
                    color: COLOR_BLACK,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const captionParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 200, line: LINE_SPACING_1_5 },
    children: [
      new TextRun({
        text: captionText,
        font: FONT_FAMILY,
        size: 22, // 11pt
        bold: true,
        italic: true,
        color: COLOR_BLACK,
      }),
    ],
  });

  return [table, captionParagraph];
};

const buildTable = (tableData) => {
  const rows = [];

  // Header Row
  const headerCells = tableData.header.map((colText) => {
    return new TableCell({
      shading: { fill: LIGHT_GRAY_BG, type: ShadingType.CLEAR },
      margins: { top: 120, bottom: 120, left: 140, right: 140 },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 12, color: COLOR_BLACK },
        bottom: { style: BorderStyle.SINGLE, size: 12, color: COLOR_BLACK },
        left: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
        right: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { line: LINE_SPACING_1_5 },
          children: [
            new TextRun({
              text: colText,
              font: FONT_FAMILY,
              size: 22, // 11pt
              bold: true,
              color: COLOR_BLACK,
            }),
          ],
        }),
      ],
    });
  });

  rows.push(new TableRow({ tableHeader: true, children: headerCells }));

  // Data Rows
  tableData.rows.forEach((rowValues) => {
    const cells = rowValues.map((cellText, cellIdx) => {
      const isNum = cellIdx === 0 && tableData.header.length > 2;
      return new TableCell({
        margins: { top: 100, bottom: 100, left: 140, right: 140 },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
          left: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
          right: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
        },
        children: [
          new Paragraph({
            alignment: isNum ? AlignmentType.CENTER : AlignmentType.JUSTIFY,
            spacing: { line: LINE_SPACING_1_5 },
            children: [
              new TextRun({
                text: cellText,
                font: FONT_FAMILY,
                size: 22, // 11pt
                color: COLOR_BLACK,
              }),
            ],
          }),
        ],
      });
    });

    rows.push(new TableRow({ children: cells }));
  });

  // Total Row if present
  if (tableData.totalRow) {
    const totalCells = tableData.totalRow.map((cellText, cellIdx) => {
      return new TableCell({
        shading: { fill: LIGHT_GRAY_BG, type: ShadingType.CLEAR },
        margins: { top: 120, bottom: 120, left: 140, right: 140 },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 12, color: COLOR_BLACK },
          bottom: { style: BorderStyle.SINGLE, size: 12, color: COLOR_BLACK },
          left: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
          right: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
        },
        children: [
          new Paragraph({
            alignment: cellIdx === 1 ? AlignmentType.JUSTIFY : AlignmentType.CENTER,
            spacing: { line: LINE_SPACING_1_5 },
            children: [
              new TextRun({
                text: cellText,
                font: FONT_FAMILY,
                size: 22,
                bold: true,
                color: COLOR_BLACK,
              }),
            ],
          }),
        ],
      });
    });

    rows.push(new TableRow({ children: totalCells }));
  }

  const tableObj = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows,
  });

  const captionParagraph = new Paragraph({
    alignment: AlignmentType.JUSTIFY,
    spacing: { before: 200, after: 100, line: LINE_SPACING_1_5 },
    children: [
      new TextRun({
        text: tableData.caption,
        font: FONT_FAMILY,
        size: 22,
        bold: true,
        color: COLOR_BLACK,
      }),
    ],
  });

  const sourceParagraph = new Paragraph({
    alignment: AlignmentType.JUSTIFY,
    spacing: { before: 80, after: 200, line: LINE_SPACING_1_5 },
    children: [
      new TextRun({
        text: tableData.source,
        font: FONT_FAMILY,
        size: 20, // 10pt
        italic: true,
        color: COLOR_BLACK,
      }),
    ],
  });

  return [captionParagraph, tableObj, sourceParagraph];
};

async function generateDocx() {
  const children = [];

  // ==================== COVER PAGE ====================
  // Top spacing
  children.push(
    new Paragraph({
      spacing: { before: 1440, line: LINE_SPACING_1_5 },
      children: [],
    })
  );

  // Document Title on Cover
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 240, after: 240, line: LINE_SPACING_1_5 },
      children: [
        new TextRun({
          text: content.TITLE,
          font: FONT_FAMILY,
          size: 36, // 18pt
          bold: true,
          color: COLOR_BLACK,
        }),
      ],
    })
  );

  // Subtitle / Document Category
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 1440, line: LINE_SPACING_1_5 },
      children: [
        new TextRun({
          text: "DOKUMEN STRATEGIS DAN DIAGNOSIS PERMASALAHAN\nPENYERAPAN ASPIRASI MASYARAKAT",
          font: FONT_FAMILY,
          size: 26, // 13pt
          bold: true,
          color: COLOR_BLACK,
        }),
      ],
    })
  );

  // Decorative Horizontal Line on Cover
  children.push(
    new Table({
      width: { size: 60, type: WidthType.PERCENTAGE },
      alignment: AlignmentType.CENTER,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: {
                top: { style: BorderStyle.SINGLE, size: 12, color: COLOR_BLACK },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
              children: [new Paragraph({ children: [] })],
            }),
          ],
        }),
      ],
    })
  );

  // Spacing before Institution metadata
  children.push(
    new Paragraph({
      spacing: { before: 2880, line: LINE_SPACING_1_5 },
      children: [],
    })
  );

  // Institution Metadata
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 60, line: LINE_SPACING_1_5 },
      children: [
        new TextRun({
          text: "DEWAN PERWAKILAN RAKYAT DAERAH",
          font: FONT_FAMILY,
          size: 28, // 14pt
          bold: true,
          color: COLOR_BLACK,
        }),
      ],
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 60, line: LINE_SPACING_1_5 },
      children: [
        new TextRun({
          text: "PROVINSI JAWA BARAT",
          font: FONT_FAMILY,
          size: 28, // 14pt
          bold: true,
          color: COLOR_BLACK,
        }),
      ],
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240, line: LINE_SPACING_1_5 },
      children: [
        new TextRun({
          text: "2026",
          font: FONT_FAMILY,
          size: 26, // 13pt
          bold: true,
          color: COLOR_BLACK,
        }),
      ],
    })
  );

  // Page Break after Cover
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ==================== TABLE OF CONTENTS ====================
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 240, after: 180, line: LINE_SPACING_1_5 },
      children: [
        new TextRun({
          text: "DAFTAR ISI",
          font: FONT_FAMILY,
          size: 28, // 14pt
          bold: true,
          color: COLOR_BLACK,
        }),
      ],
    })
  );

  children.push(
    new TableOfContents("DAFTAR ISI", {
      hyperlink: true,
      headingStyleRange: "1-3",
    })
  );

  // Page Break after TOC
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ==================== MAIN CONTENT ====================
  // SECTION 1
  children.push(createHeading("1. PENDAHULUAN DAN LATAR BELAKANG", 1));
  children.push(createBodyParagraph(content.sectionA_p1));
  children.push(createBodyParagraph(content.sectionA_p2));
  children.push(createBodyParagraph(content.sectionA_p3));
  children.push(createBodyParagraph(content.sectionA_p4));

  // Gambar 1 (Peta Wilayah)
  const imagePath = path.join(__dirname, 'peta_jawa_barat.png');
  if (fs.existsSync(imagePath)) {
    const imageBuffer = fs.readFileSync(imagePath);
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 120, line: LINE_SPACING_1_5 },
        children: [
          new ImageRun({
            data: imageBuffer,
            transformation: {
              width: 480,
              height: 422,
            },
          }),
        ],
      })
    );

    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 140, line: LINE_SPACING_1_5 },
        children: [
          new TextRun({
            text: content.gambar1Caption,
            font: FONT_FAMILY,
            size: 22, // 11pt
            bold: true,
            italic: true,
            color: COLOR_BLACK,
          }),
        ],
      })
    );

    children.push(createBodyParagraph(content.gambar1Keterangan));
  }

  // Table 1
  children.push(...buildTable(content.table1));

  children.push(createBodyParagraph(content.sectionA_p5));
  children.push(createBodyParagraph(content.sectionA_p6));
  children.push(createBodyParagraph(content.sectionA_p7));

  // SECTION 2
  children.push(createHeading("2. VISUALISASI DAN DATA PENGELOLAAN ASPIRASI", 1));
  children.push(...createPlaceholderBox("Grafik 1", content.grafik1Caption));
  children.push(createBodyParagraph(content.deskripsiData_p1));

  children.push(...createPlaceholderBox("Grafik 2", content.grafik2Caption));
  children.push(createBodyParagraph(content.deskripsiData_p2));

  children.push(createBodyParagraph(content.penjelasanGrafis_p1));
  children.push(createBodyParagraph(content.penjelasanGrafis_p2));
  children.push(createBodyParagraph(content.penjelasanGrafis_p3));

  // SECTION 3
  children.push(createHeading("3. IDENTIFIKASI MASALAH PENGELOLAAN ASPIRASI", 1));
  children.push(createBodyParagraph(content.identifikasiIntro, { spaceAfter: 60 }));

  content.identifikasiList.forEach((item, index) => {
    children.push(createNumberedItem(`${index + 1}.`, item, 1));
  });

  children.push(createBodyParagraph(content.identifikasi_p1_parts, { spaceBefore: 140 }));
  children.push(createBodyParagraph(content.identifikasi_p2));

  // SECTION 4
  children.push(createHeading("4. ANALISIS DIAGNOSIS MASALAH (MODEL ASTRID)", 1));
  children.push(createBodyParagraph(content.analisis_p1));
  children.push(...buildTable(content.table2));
  children.push(createBodyParagraph(content.analisis_p2));

  // Sub-section 4.1
  children.push(createHeading("4.1 Belum Adanya Regulasi yang Mengatur tentang Aspirasi secara Detail", 2));
  children.push(createBodyParagraph(content.p1_intro));
  
  children.push(createBodyParagraph("4.1.1 Dampak Jika Tidak Ditangani:", { bold: true, noIndent: true, spaceBefore: 100, spaceAfter: 40 }));
  content.p1_dampak.forEach((d, i) => children.push(createNumberedItem(`${i + 1}.`, d, 1)));

  children.push(createBodyParagraph("4.1.2 Potensi Risiko / Permasalahan Lanjutan:", { bold: true, noIndent: true, spaceBefore: 100, spaceAfter: 40 }));
  content.p1_potensi.forEach((p, i) => children.push(createNumberedItem(`${i + 1}.`, p, 1)));

  children.push(createBodyParagraph("4.1.3 Rekomendasi Tindak Lanjut:", { bold: true, noIndent: true, spaceBefore: 100, spaceAfter: 40 }));
  content.p1_rekomendasi.forEach((r, i) => children.push(createNumberedItem(`${i + 1}.`, r, 1)));

  // Sub-section 4.2
  children.push(createHeading("4.2 Pelaksanaan Desk Verifikasi dan Validasi dalam Proses Aspirasi", 2));
  children.push(createBodyParagraph(content.p2_intro));

  children.push(createBodyParagraph("4.2.1 Dampak Jika Tidak Ditangani:", { bold: true, noIndent: true, spaceBefore: 100, spaceAfter: 40 }));
  content.p2_dampak.forEach((d, i) => children.push(createNumberedItem(`${i + 1}.`, d, 1)));

  children.push(createBodyParagraph("4.2.2 Potensi Risiko / Permasalahan Lanjutan:", { bold: true, noIndent: true, spaceBefore: 100, spaceAfter: 40 }));
  content.p2_potensi.forEach((p, i) => children.push(createNumberedItem(`${i + 1}.`, p, 1)));

  children.push(createBodyParagraph("4.2.3 Rekomendasi Tindak Lanjut:", { bold: true, noIndent: true, spaceBefore: 100, spaceAfter: 40 }));
  content.p2_rekomendasi.forEach((r, i) => children.push(createNumberedItem(`${i + 1}.`, r, 1)));

  // Sub-section 4.3
  children.push(createHeading("4.3 Belum Adanya Digitalisasi Layanan Aspirasi yang Mengakomodasi Kebutuhan Masyarakat dan Konstituen", 2));
  children.push(createBodyParagraph(content.p3_intro));

  children.push(createBodyParagraph(`4.3.1 ${content.p3_dampak_title}:`, { bold: true, noIndent: true, spaceBefore: 100, spaceAfter: 40 }));
  content.p3_dampak.forEach((d, i) => children.push(createNumberedItem(`${i + 1}.`, d, 1)));

  children.push(createBodyParagraph("4.3.2 Potensi Risiko / Permasalahan Lanjutan:", { bold: true, noIndent: true, spaceBefore: 100, spaceAfter: 40 }));
  content.p3_potensi.forEach((p, i) => children.push(createNumberedItem(`${i + 1}.`, p, 1)));

  children.push(createBodyParagraph("4.3.3 Rekomendasi Tindak Lanjut:", { bold: true, noIndent: true, spaceBefore: 100, spaceAfter: 40 }));
  content.p3_rekomendasi.forEach((r, i) => children.push(createNumberedItem(`${i + 1}.`, r, 1)));

  // SECTION 5
  children.push(createHeading("5. PENETAPAN MASALAH PRIORITAS", 1));
  children.push(createBodyParagraph(content.penetapan_p1));
  children.push(createBodyParagraph(content.penetapan_p2));

  // Build Document
  const doc = new Document({
    features: {
      updateFields: true, // Auto update TOC on open
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch (2.54 cm)
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
          titlePage: true, // Excludes header/footer from cover page (page 1)
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { line: LINE_SPACING_1_5 },
                children: [
                  new TextRun({
                    text: "Halaman ",
                    font: FONT_FAMILY,
                    size: 20,
                    color: COLOR_BLACK,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: FONT_FAMILY,
                    size: 20,
                    color: COLOR_BLACK,
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(__dirname, 'STRATEGI_PENGELOLAAN_ASPIRASI_DPRD_JABAR.docx');
  fs.writeFileSync(outputPath, buffer);
  console.log(`[SUCCESS] Document saved with Cover Page to: ${outputPath}`);
}

generateDocx().catch((err) => {
  console.error('[ERROR]', err);
  process.exit(1);
});
