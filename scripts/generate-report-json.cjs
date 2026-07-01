const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  Header,
  Footer,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  WidthType,
  ShadingType,
  PageNumber,
  PageBreak,
  LevelFormat,
} = require("docx");
const fs = require("fs");
const path = require("path");

// Load configuration
const CONFIG_PATH = path.resolve(process.cwd(), "REPORT_CONFIG.json");
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));

const colors = config.styles.colors;
const fonts = config.styles.fonts;
const spacing = config.styles.spacing;

// Border definitions
const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: colors.borderColor };
const thickBorder = { style: BorderStyle.SINGLE, size: 12, color: colors.primary };
const headerBorder = { style: BorderStyle.SINGLE, size: 8, color: colors.primary };

const borders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
const headerBorders = { top: headerBorder, bottom: headerBorder, left: headerBorder, right: headerBorder };

// ===== STYLED COMPONENTS =====

function createHeading(text, level = 1) {
  const sizes = { 1: 36, 2: 28, 3: 24 };
  const color = level === 1 ? colors.primary : colors.secondary;
  const spaceBefore = level === 1 ? spacing.heading1Before : spacing.heading2Before;
  const spaceAfter = level === 1 ? spacing.heading1After : spacing.heading2After;

  return new Paragraph({
    heading: level === 1 ? HeadingLevel.HEADING_1 : level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
    alignment: AlignmentType.LEFT,
    spacing: { before: spaceBefore, after: spaceAfter },
    border: level === 1 ? { bottom: { style: BorderStyle.SINGLE, size: 12, color: colors.primary, space: 4 } } : undefined,
    children: [
      new TextRun({
        text,
        font: fonts.headings,
        size: sizes[level] * 2,
        bold: true,
        color,
      }),
    ],
  });
}

function createParagraph(text, opts = {}) {
  return new Paragraph({
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
    spacing: {
      before: opts.spBefore ?? spacing.paragraphBefore,
      after: opts.spAfter ?? spacing.paragraphAfter,
      line: spacing.lineHeight,
    },
    indent: opts.indent ? { left: opts.indent, right: opts.indent } : undefined,
    children: [
      new TextRun({
        text,
        font: fonts.body,
        size: opts.size ?? 24,
        bold: opts.bold ?? false,
        italics: opts.italic ?? false,
        color: opts.color ?? colors.darkGrey,
      }),
    ],
  });
}

function createBullet(text) {
  const cleanText = text.replace(/^[•\-\*]\s*/, "");
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 60, after: 60, line: spacing.lineHeight },
    children: [
      new TextRun({
        text: cleanText,
        font: fonts.body,
        size: 24,
        color: colors.darkGrey,
      }),
    ],
  });
}

function createTableCell(text, isHeader = false, textAlign = AlignmentType.LEFT) {
  const bgColor = isHeader ? colors.headerBg : colors.lightGrey;
  const textColor = isHeader ? colors.headerText : colors.darkGrey;
  const cellBorders = isHeader ? headerBorders : borders;
  const isBold = isHeader;
  const fontSize = isHeader ? 22 : 20;

  return new TableCell({
    borders: cellBorders,
    width: { size: 25, type: WidthType.PERCENTAGE },
    shading: { fill: bgColor, type: ShadingType.CLEAR },
    margins: { top: 150, bottom: 150, left: 200, right: 200 },
    verticalAlign: "center",
    children: [
      new Paragraph({
        alignment: textAlign,
        spacing: { before: 40, after: 40, line: spacing.lineHeight },
        children: [
          new TextRun({
            text: text || "N/A",
            font: fonts.body,
            size: fontSize,
            bold: isBold,
            color: textColor,
          }),
        ],
      }),
    ],
  });
}

function createDataTable(title, headers, rows) {
  const tableRows = [
    new TableRow({
      tableHeader: true,
      children: headers.map((header) => createTableCell(header, true, AlignmentType.CENTER)),
    }),
  ];

  rows.forEach((row, idx) => {
    const isAlternate = idx % 2 === 1;
    const bgColor = isAlternate ? colors.lightGrey : colors.headerText;

    const cells = row.map((cell, cellIdx) => {
      const cellBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
      return new TableCell({
        borders: cellBorders,
        width: { size: 25, type: WidthType.PERCENTAGE },
        shading: { fill: bgColor, type: ShadingType.CLEAR },
        margins: { top: 120, bottom: 120, left: 150, right: 150 },
        verticalAlign: "center",
        children: [
          new Paragraph({
            alignment: cellIdx === 0 ? AlignmentType.LEFT : AlignmentType.LEFT,
            spacing: { before: 40, after: 40, line: 280 },
            children: [
              new TextRun({
                text: cell || "N/A",
                font: fonts.body,
                size: 20,
                bold: false,
                color: colors.darkGrey,
              }),
            ],
          }),
        ],
      });
    });

    tableRows.push(new TableRow({ children: cells }));
  });

  return [
    new Paragraph({ spacing: { before: spacing.tableSpaceBefore, after: 0 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 0, after: 150 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: colors.secondary, space: 2 } },
      children: [
        new TextRun({
          text: title,
          font: fonts.headings,
          size: 26,
          bold: true,
          color: colors.primary,
        }),
      ],
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: tableRows,
    }),
    new Paragraph({ spacing: { before: 150, after: spacing.tableSpaceAfter }, children: [] }),
  ];
}

function createCoverPage() {
  const meta = config.metadata;
  const children = [];

  children.push(new Paragraph({ spacing: { before: 520, after: 0 }, children: [] }));
  children.push(
    createParagraph(meta.university, {
      center: true,
      size: 28,
      bold: true,
      color: colors.primary,
      spAfter: 50,
    })
  );
  children.push(
    createParagraph(meta.college, {
      center: true,
      size: 26,
      bold: true,
      color: colors.darkGrey,
      spAfter: 50,
    })
  );
  children.push(
    createParagraph(meta.department, {
      center: true,
      size: 24,
      color: colors.darkGrey,
      spAfter: 300,
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: {
        top: { style: BorderStyle.SINGLE, size: 8, color: colors.primary, space: 4 },
        bottom: { style: BorderStyle.SINGLE, size: 8, color: colors.primary, space: 4 },
      },
      spacing: { before: 110, after: 110 },
      children: [
        new TextRun({
          text: "DBMS LABORATORY - MINI PROJECT REPORT",
          font: fonts.headings,
          size: 32,
          bold: true,
          color: colors.headerText,
        }),
      ],
    })
  );

  children.push(
    createParagraph(meta.projectTitle, {
      center: true,
      size: 64,
      bold: true,
      color: colors.accent,
      spBefore: 200,
      spAfter: 50,
    })
  );
  children.push(
    createParagraph(meta.projectSubtitle, {
      center: true,
      size: 28,
      italic: true,
      color: colors.darkGrey,
      spAfter: 260,
    })
  );
  children.push(
    createParagraph("Submitted in Partial Fulfillment of the Requirements for", {
      center: true,
      size: 22,
      spAfter: 30,
    })
  );
  children.push(
    createParagraph("Bachelor of Engineering in Information Technology", {
      center: true,
      size: 24,
      bold: true,
      color: colors.primary,
      spAfter: 220,
    })
  );
  children.push(
    createParagraph("Submitted By", {
      center: true,
      size: 24,
      bold: true,
      color: colors.secondary,
      spAfter: 60,
    })
  );
  children.push(
    createParagraph("Mr. Aditya Chandrajit Deore | Roll No: 124B1F116", {
      center: true,
      size: 22,
      spAfter: 120,
    })
  );
  children.push(
    createParagraph("Under the Guidance of", {
      center: true,
      size: 24,
      bold: true,
      color: colors.secondary,
      spAfter: 50,
    })
  );
  children.push(
    createParagraph(meta.guide, { center: true, size: 22, spAfter: 130 })
  );
  children.push(
    createParagraph(`Academic Year: ${meta.academicYear} | Semester: ${meta.semester}`, {
      center: true,
      size: 22,
      spAfter: 30,
    })
  );
  children.push(
    createParagraph("SPPU, Pune - Maharashtra, India", { center: true, size: 22 })
  );

  return children;
}

async function generateReport() {
  const children = [];

  // Cover page
  children.push(...createCoverPage());

  // Process sections
  for (const section of config.sections) {
    children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(createHeading(section.title, 1));

    if (section.type === "section") {
      // Parse paragraphs and bullets
      if (section.content) {
        const lines = section.content.split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
            children.push(createBullet(trimmed));
          } else {
            children.push(createParagraph(trimmed));
          }
        }
      }

      // Handle subsections
      if (section.subsections) {
        for (const sub of section.subsections) {
          children.push(createHeading(sub.subtitle, 2));
          if (sub.content) {
            const subLines = sub.content.split("\n");
            for (const line of subLines) {
              const trimmed = line.trim();
              if (!trimmed) continue;
              if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
                children.push(createBullet(trimmed));
              } else {
                children.push(createParagraph(trimmed));
              }
            }
          }
        }
      }
    } else if (section.type === "table") {
      children.push(...createDataTable(section.title, section.headers, section.rows));
    }
  }

  // Create document
  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "\u2022",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 }, // A4
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1800 },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                border: { top: { style: BorderStyle.SINGLE, size: 4, color: colors.borderColor, space: 4 } },
                spacing: { before: 100, after: 0 },
                children: [
                  new TextRun({
                    text: "PCCOE, Pune | Clarity - DBMS Mini Project | Page ",
                    font: fonts.body,
                    size: 20,
                    color: "666666",
                  }),
                  new TextRun({ children: [PageNumber.CURRENT], font: fonts.body, size: 20, color: "666666" }),
                  new TextRun({ text: " of ", font: fonts.body, size: 20, color: "666666" }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], font: fonts.body, size: 20, color: "666666" }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  // Save document
  const outputDir = path.resolve(process.cwd(), "reports");
  fs.mkdirSync(outputDir, { recursive: true });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(outputDir, "Clarity_DBMS_Lab_Mini_Project_Report.docx");

  try {
    fs.writeFileSync(outputPath, buffer);
    console.log(`✓ Report generated successfully: ${outputPath}`);
  } catch (err) {
    if (err.code === "EBUSY" || err.code === "EPERM") {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
      const fallbackPath = path.join(outputDir, `Clarity_DBMS_Lab_Mini_Project_Report_${timestamp}.docx`);
      fs.writeFileSync(fallbackPath, buffer);
      console.log(`✓ File locked, saved with timestamp: ${fallbackPath}`);
    } else {
      throw err;
    }
  }
}

generateReport().catch(console.error);
