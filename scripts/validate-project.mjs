import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const required = [
  'README.md', 'package.json', 'src/index.html', 'src/app.js', 'src/spatial.mjs', 'data/city-parks.geojson',
  'docs/Git代码仓库说明.md', 'docs/需求文档.md', 'docs/设计文档.md', 'docs/测试文档.md', 'docs/部署文档.md', 'docs/开发总结.md',
  'docs/AI协作日志.md', 'docs/提示词记录.md', 'docs/AI错误案例集.md', 'docs/空间逻辑校验报告.md',
  'docs/题目要求合规检查清单.md', 'docs/系统演示说明.md', 'docs/题目要求合规复核报告.md', 'slides/答辩PPT.pptx'
];
const missing = [];
for (const file of required) {
  try { await fs.access(path.join(root, file)); } catch { missing.push(file); }
}
const data = JSON.parse(await fs.readFile(path.join(root, 'data/city-parks.geojson'), 'utf8'));
const counts = Object.fromEntries(Object.entries(data.layers).map(([name, layer]) => [name, layer.features.length]));
if (missing.length) {
  console.error(`缺少交付文件: ${missing.join(', ')}`);
  process.exitCode = 1;
} else {
  console.log('项目结构校验通过');
  console.log(`数据层: parks=${counts.parks}, hazards=${counts.hazards}, services=${counts.services}`);
}

