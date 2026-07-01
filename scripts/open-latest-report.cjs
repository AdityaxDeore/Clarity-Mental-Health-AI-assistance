const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const reportsDir = path.resolve(process.cwd(), "reports");
if (!fs.existsSync(reportsDir)) {
  console.error("Reports directory not found.");
  process.exit(1);
}

const candidates = fs
  .readdirSync(reportsDir)
  .filter((name) => /^Clarity_DBMS_Lab_Mini_Project_Report.*\.docx$/i.test(name))
  .map((name) => {
    const fullPath = path.join(reportsDir, name);
    return { fullPath, mtimeMs: fs.statSync(fullPath).mtimeMs };
  })
  .sort((a, b) => b.mtimeMs - a.mtimeMs);

if (!candidates.length) {
  console.error("No generated report file found.");
  process.exit(1);
}

const target = candidates[0].fullPath;
execSync(`cmd /c start "" "${target}"`);
console.log(`Opened report: ${target}`);
