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

// Colors - Professional Academic Theme
const BLUE = "1F4E79";
const DARK_BLUE = "0D47A1";
const MID_BLUE = "2E75B6";
const TEAL = "1A7A6E";
const DARK_GREY = "404040";
const LIGHT_GREY = "F5F5F5";
const HEADER_BG = "1F4E79";
const HEADER_TEXT = "FFFFFF";
const ALTERNATE_ROW = "FAFAFA";
const WHITE = "FFFFFF";

// Professional borders
const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" };
const thickBorder = { style: BorderStyle.SINGLE, size: 12, color: "1F4E79" };
const headerBorder = { style: BorderStyle.SINGLE, size: 8, color: "1F4E79" };

const borders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
const headerBorders = { top: headerBorder, bottom: headerBorder, left: headerBorder, right: headerBorder };

function h(text, level, color = BLUE, spBefore = 280, spAfter = 120) {
  const sizes = { 1: 36, 2: 28, 3: 24 };
  return new Paragraph({
    heading:
      level === 1
        ? HeadingLevel.HEADING_1
        : level === 2
        ? HeadingLevel.HEADING_2
        : HeadingLevel.HEADING_3,
    children: [
      new TextRun({
        text,
        bold: true,
        color,
        font: "Arial",
        size: sizes[level] || 24,
      }),
    ],
    spacing: { before: spBefore, after: spAfter },
    border:
      level === 1
        ? {
            bottom: {
              style: BorderStyle.SINGLE,
              size: 6,
              color: MID_BLUE,
              space: 4,
            },
          }
        : undefined,
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
    spacing: { before: opts.spBefore ?? 70, after: opts.spAfter ?? 70, line: 280 },
    children: [
      new TextRun({
        text,
        font: opts.font || "Arial",
        size: opts.size ?? 22,
        bold: opts.bold ?? false,
        color: opts.color ?? DARK_GREY,
        italics: opts.italic ?? false,
      }),
    ],
    shading: opts.shade
      ? {
          fill: opts.shade,
          type: ShadingType.CLEAR,
        }
      : undefined,
    indent: opts.indent
      ? {
          left: opts.indent,
          right: opts.indent,
        }
      : undefined,
  });
}

function bullet(text, bold = false) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 50, after: 50 },
    children: [
      new TextRun({ text, font: "Arial", size: 22, color: DARK_GREY, bold }),
    ],
  });
}

function numbered(text) {
  return new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    spacing: { before: 50, after: 50 },
    children: [new TextRun({ text, font: "Arial", size: 22, color: DARK_GREY })],
  });
}

function codeLine(text) {
  return new Paragraph({
    spacing: { before: 0, after: 0 },
    shading: { fill: "1E1E1E", type: ShadingType.CLEAR },
    indent: { left: 360, right: 360 },
    children: [
      new TextRun({
        text: text || " ",
        font: "Courier New",
        size: 18,
        color: "D4D4D4",
      }),
    ],
  });
}

function codeBlock(lines) {
  return [
    new Paragraph({ spacing: { before: 110, after: 0 }, children: [] }),
    ...lines.map((line) => codeLine(line)),
    new Paragraph({ spacing: { before: 0, after: 110 }, children: [] }),
  ];
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function sectionLabel(num, title) {
  return new Paragraph({
    spacing: { before: 360, after: 180 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 8, color: TEAL, space: 4 },
    },
    children: [
      new TextRun({ text: `SECTION ${num}  `, font: "Arial", size: 28, bold: true, color: TEAL }),
      new TextRun({ text: title, font: "Arial", size: 28, bold: true, color: BLUE }),
    ],
  });
}

function fieldRow(field, type, constraint, desc, rowIndex, isHeader = false) {
  // Alternating row colors for non-header rows
  let bgColor = WHITE;
  if (!isHeader) {
    bgColor = rowIndex % 2 === 0 ? WHITE : LIGHT_GREY;
  } else {
    bgColor = HEADER_BG;
  }

  const textColor = isHeader ? HEADER_TEXT : DARK_GREY;
  const isBold = isHeader ? true : false;
  const fontSize = isHeader ? 22 : 20;
  const cellBorders = isHeader ? headerBorders : borders;

  const cell = (text, flex) =>
    new TableCell({
      borders: cellBorders,
      width: { size: flex, type: WidthType.PERCENTAGE },
      shading: { fill: bgColor, type: ShadingType.CLEAR },
      margins: { top: 150, bottom: 150, left: 200, right: 200 }, // Generous padding
      verticalAlign: "center",
      children: [
        new Paragraph({
          alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
          spacing: { before: 40, after: 40, line: 280 },
          children: [
            new TextRun({
              text: text || "N/A",
              font: "Times New Roman",
              size: fontSize,
              bold: isBold,
              color: textColor,
              italics: false,
            }),
          ],
        }),
      ],
    });

  return new TableRow({
    tableHeader: isHeader,
    children: [cell(field, 15), cell(type, 15), cell(constraint, 20), cell(desc, 50)],
  });
}

function dataTable(title, rows) {
  const tableRows = [fieldRow("Field Name", "Type", "Constraints", "Description", 0, true)];
  
  rows.forEach((r, idx) => {
    tableRows.push(fieldRow(r[0], r[1], r[2], r[3], idx + 1, false));
  });

  return [
    new Paragraph({ spacing: { before: 280, after: 0 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 0, after: 150 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: MID_BLUE, space: 2 } },
      children: [
        new TextRun({
          text: title,
          font: "Times New Roman",
          size: 26,
          bold: true,
          color: BLUE,
        }),
      ],
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: tableRows,
    }),
    new Paragraph({ spacing: { before: 150, after: 280 }, children: [] }),
  ];
}

function getReportText() {
  const sourcePath = path.resolve(process.cwd(), "MINI_PROJECT_REPORT_FORMAT.txt");
  if (fs.existsSync(sourcePath)) {
    return fs.readFileSync(sourcePath, "utf8");
  }
  return "";
}

function extractSection(reportText, sectionTitle) {
  const text = reportText.replace(/\r/g, "");
  const sectionRegex = new RegExp(
    `-+\\n\\s*${sectionTitle.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\s*\\n-+\\n([\\s\\S]*?)(?=\\n-+\\n\\s*\\d+\\.|$)`,
    "i"
  );
  const match = text.match(sectionRegex);
  return match ? match[1].trim() : "";
}

function textToParagraphs(text) {
  if (!text) return [p("Content not available in source file.", { italic: true })];

  const out = [];
  const lines = text.split("\n");
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      out.push(new Paragraph({ spacing: { before: 40, after: 40 }, children: [] }));
      continue;
    }

    if (/^[-=]{5,}$/.test(line)) continue;

    if (/^\|.*\|$/.test(line)) {
      out.push(
        p(line, {
          font: "Consolas",
          size: 18,
          shade: "F2F2F2",
          indent: 240,
          spBefore: 0,
          spAfter: 0,
        })
      );
      continue;
    }

    if (/^\d+\./.test(line)) {
      out.push(numbered(line.replace(/^\d+\.\s*/, "")));
      continue;
    }

    if (/^[\u2022\-*]\s+/.test(line)) {
      out.push(bullet(line.replace(/^[\u2022\-*]\s+/, "")));
      continue;
    }

    if (/^[A-Z][A-Z0-9\s&()\-]{4,}:$/.test(line) || /^MODULE\s+\d+/i.test(line)) {
      out.push(h(line.replace(/:$/, ""), 3, TEAL, 180, 70));
      continue;
    }

    out.push(p(line));
  }

  return out;
}

function fileSnippetLines(relPath, start = 1, end = 80) {
  const abs = path.resolve(process.cwd(), relPath);
  if (!fs.existsSync(abs)) {
    return [`// File not found: ${relPath}`];
  }
  const lines = fs.readFileSync(abs, "utf8").split(/\r?\n/);
  return lines.slice(start - 1, Math.min(end, lines.length));
}

async function generateReport() {
  const reportText = getReportText();

  const abstractText = extractSection(reportText, "1. ABSTRACT");
  const introText = extractSection(reportText, "2. INTRODUCTION (SCOPE & PURPOSE)");
  const functionalText = extractSection(reportText, "4. FUNCTIONAL REQUIREMENTS");
  const dataText = extractSection(reportText, "5. DATA MODELLING & DATABASE DESIGN");

  const usersTableRows = [
    ["_id", "ObjectId", "Primary Key", "Auto-generated MongoDB identifier"],
    ["userId", "String", "Unique", "Application-level user identifier"],
    ["email", "String", "Unique, Required", "Login identity"],
    ["password", "String", "Required", "bcrypt hash"],
    ["role", "String", "Enum", "student, counselor, admin"],
    ["createdAt", "Date", "Required", "Account creation timestamp"],
  ];

  const moodTableRows = [
    ["entryId", "String", "Unique", "Mood entry identifier"],
    ["userId", "ObjectId", "Indexed", "Reference to user"],
    ["moodLv", "Integer", "1-10", "Mood score"],
    ["notes", "String", "Optional", "Daily journal note"],
    ["date", "Date", "Required", "Date of mood entry"],
  ];

  const children = [];

  // Cover page
  children.push(new Paragraph({ spacing: { before: 520, after: 0 }, children: [] }));
  children.push(p("SAVITRIBAI PHULE PUNE UNIVERSITY", { center: true, size: 24, bold: true, spAfter: 30 }));
  children.push(p("[University Logo Placeholder]", { center: true, size: 20, color: "888888", italic: true, spAfter: 30 }));
  children.push(p("PIMPRI CHINCHWAD COLLEGE OF ENGINEERING (PCCOE), PUNE", { center: true, size: 22, bold: true, spAfter: 30 }));
  children.push(p("Department of Information Technology", { center: true, size: 22, spAfter: 300 }));
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: {
        top: { style: BorderStyle.SINGLE, size: 8, color: TEAL, space: 4 },
        bottom: { style: BorderStyle.SINGLE, size: 8, color: TEAL, space: 4 },
      },
      spacing: { before: 110, after: 110 },
      children: [new TextRun({ text: "DBMS LABORATORY - MINI PROJECT REPORT", font: "Arial", size: 28, bold: true, color: BLUE })],
    })
  );
  children.push(p("CLARITY", { center: true, size: 64, bold: true, color: TEAL, spBefore: 140, spAfter: 40 }));
  children.push(p("An AI-Driven Mental Health and Student Support Platform", { center: true, size: 24, italic: true, spAfter: 260 }));
  children.push(p("Submitted in Partial Fulfillment of the Requirements for the Degree of", { center: true, size: 20, spAfter: 60 }));
  children.push(p("Bachelor of Engineering in Information Technology", { center: true, size: 24, bold: true, color: BLUE, spAfter: 220 }));
  children.push(p("Submitted By", { center: true, size: 22, bold: true, spAfter: 50 }));
  children.push(p("[Student 1 Full Name] | Roll No: [XXXXXX] | PRN: [XXXXXXXXXXXX]", { center: true, size: 22, spAfter: 30 }));
  children.push(p("[Student 2 Full Name] | Roll No: [XXXXXX] | PRN: [XXXXXXXXXXXX]", { center: true, size: 22, spAfter: 120 }));
  children.push(p("Under the Guidance of", { center: true, size: 22, bold: true, spAfter: 30 }));
  children.push(p("[Guide Name, Designation, Department]", { center: true, size: 22, spAfter: 130 }));
  children.push(p("Academic Year: 2025-26 | Semester: V (OE-5)", { center: true, size: 22, spAfter: 30 }));
  children.push(p("SPPU, Pune - Maharashtra, India", { center: true, size: 22 }));

  // Section 2
  children.push(pageBreak());
  children.push(sectionLabel("2", "ABSTRACT"));
  children.push(...textToParagraphs(abstractText));

  // Section 3
  children.push(pageBreak());
  children.push(sectionLabel("3", "INTRODUCTION"));
  children.push(...textToParagraphs(introText));

  // Section 4
  children.push(pageBreak());
  children.push(sectionLabel("4", "FUNCTIONAL REQUIREMENTS"));
  children.push(...textToParagraphs(functionalText));

  // Section 5
  children.push(pageBreak());
  children.push(sectionLabel("5", "DATA MODELLING AND DATABASE DESIGN"));
  children.push(...textToParagraphs(dataText));
  children.push(...dataTable("Table: USERS", usersTableRows));
  children.push(...dataTable("Table: MOOD_ENTRIES", moodTableRows));

  // Section 6 (GUI summary)
  children.push(pageBreak());
  children.push(sectionLabel("6", "GRAPHICAL USER INTERFACE"));
  children.push(p("Add screenshots in the final report for each key screen and keep captions under each image.", { shade: "F7FBFF", indent: 220 }));
  children.push(bullet("Landing Page / Homepage"));
  children.push(bullet("Login / Registration Page"));
  children.push(bullet("Wellness Dashboard"));
  children.push(bullet("AI Chat Interface"));
  children.push(bullet("Anonymous Peer Forum"));
  children.push(bullet("Admin Dashboard"));

  // Section 7 (Source code)
  children.push(pageBreak());
  children.push(sectionLabel("7", "IMPORTANT SOURCE CODE MODULES"));

  children.push(h("7.1 Backend Authentication Route (server/index.ts)", 2));
  children.push(...codeBlock(fileSnippetLines("server/index.ts", 1, 90)));

  children.push(h("7.2 Mood Tracker Component (client/src/components/mood-tracker.tsx)", 2));
  children.push(...codeBlock(fileSnippetLines("client/src/components/mood-tracker.tsx", 1, 120)));

  children.push(h("7.3 Database Utilities (server/db-utilities.ts)", 2));
  children.push(...codeBlock(fileSnippetLines("server/db-utilities.ts", 1, 120)));

  // Section 8+
  children.push(pageBreak());
  children.push(sectionLabel("8", "TESTING, DEPLOYMENT, AND CONCLUSION"));
  children.push(h("8.1 Testing", 2));
  children.push(bullet("Unit tests for key components and API routes"));
  children.push(bullet("Integration tests for auth and mood tracking flow"));
  children.push(bullet("Manual testing for accessibility and responsive behavior"));

  children.push(h("8.2 Deployment", 2));
  children.push(bullet("Frontend build with Vite"));
  children.push(bullet("Backend deployment on Node.js runtime"));
  children.push(bullet("MongoDB Atlas as managed cloud database"));

  children.push(h("8.3 Conclusion", 2));
  children.push(
    p(
      "Clarity demonstrates a production-oriented DBMS mini-project with secure authentication, structured NoSQL modeling, modular service architecture, and measurable social impact in student mental wellness.",
      { shade: "F7FBFF", indent: 220 }
    )
  );

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
        {
          reference: "numbers",
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: "%1.",
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
            size: { width: 11906, height: 16838 },
            margin: { top: 1080, right: 1080, bottom: 1080, left: 1440 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                border: {
                  bottom: { style: BorderStyle.SINGLE, size: 6, color: MID_BLUE, space: 4 },
                },
                spacing: { before: 0, after: 100 },
                children: [
                  new TextRun({
                    text: "CLARITY | DBMS Lab Mini-Project Report",
                    font: "Arial",
                    size: 18,
                    color: "888888",
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                border: {
                  top: { style: BorderStyle.SINGLE, size: 4, color: MID_BLUE, space: 4 },
                },
                spacing: { before: 100, after: 0 },
                children: [
                  new TextRun({
                    text: "Department of Information Technology | PCCOE, Pune | Page ",
                    font: "Arial",
                    size: 16,
                    color: "888888",
                  }),
                  new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: "888888" }),
                  new TextRun({ text: " of ", font: "Arial", size: 16, color: "888888" }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], font: "Arial", size: 16, color: "888888" }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const outputDir = path.resolve(process.cwd(), "reports");
  fs.mkdirSync(outputDir, { recursive: true });
  const baseName = "Clarity_DBMS_Lab_Mini_Project_Report";
  const preferredPath = path.join(outputDir, `${baseName}.docx`);

  const buffer = await Packer.toBuffer(doc);

  let finalPath = preferredPath;
  try {
    fs.writeFileSync(finalPath, buffer);
  } catch (err) {
    if (err && (err.code === "EBUSY" || err.code === "EPERM")) {
      const stamp = new Date()
        .toISOString()
        .replace(/[:]/g, "-")
        .replace(/\..+$/, "")
        .replace("T", "_");
      finalPath = path.join(outputDir, `${baseName}_${stamp}.docx`);
      fs.writeFileSync(finalPath, buffer);
      console.log("Primary report file is currently open/locked, saved with timestamp instead.");
    } else {
      throw err;
    }
  }

  console.log(`Report generated successfully: ${finalPath}`);
}

generateReport().catch((err) => {
  console.error("Failed to generate report:", err);
  process.exit(1);
});
