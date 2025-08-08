// docling.js
import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';

/**
 * Выполняет конвертацию PDF в Markdown через Docling CLI
 * @param {string} projectId - ID проекта в local-db
 * @param {string} fileName - имя PDF-файла
 * @returns {Promise<{success: boolean, fileName: string}>}
 */
export async function doclingProcessing(projectId, fileName) {
  console.log('executing Docling conversion strategy...');

  // Корень проекта и папка с файлами
  const projectRoot = path.join(process.cwd(), 'local-db');
  const projectPath = path.join(projectRoot, projectId, 'files');
  const filePath    = path.join(projectPath, fileName);
  const outName     = fileName.replace(/\.pdf$/i, '.md');
  const outPath     = path.join(projectPath, outName);

  // Запускаем Docling CLI: опции до источника
  const args = [
    '--to', 'md',
    '--output', projectPath,
    filePath
  ];

  return new Promise((resolve, reject) => {
    execFile('docling', args, { maxBuffer: 100 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        console.error('Docling CLI error:', stderr || err);
        return reject(err);
      }
      // Если CLI сам создал файл .md
      if (fs.existsSync(outPath)) {
        console.log(`Docling: wrote ${outName}`);
        return resolve({ success: true, fileName: outName });
      }
      // Иначе сохраняем stdout в файл
      fs.writeFileSync(outPath, stdout, 'utf8');
      console.log(`Docling: wrote ${outName} from stdout`);
      resolve({ success: true, fileName: outName });
    });
  });
}

export default { doclingProcessing };
