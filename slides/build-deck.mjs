import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const toolPath = 'C:/Users/ASUS/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
const { Presentation, PresentationFile } = await import(pathToFileURL(toolPath).href);
const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const buildDir = path.join(root, '.ppt-build');
const outputDir = path.join(root, 'slides');
await fs.mkdir(buildDir, { recursive: true });
await fs.mkdir(outputDir, { recursive: true });

const C = {
  ink: '#163238',
  teal: '#0E3B43',
  mint: '#A7D7D2',
  pale: '#F3F8F7',
  line: '#C9DAD8',
  green: '#2C8C6B',
  amber: '#D98A2B',
  red: '#B42318',
  blue: '#2C6BED',
  gray: '#66777C',
  white: '#FFFFFF'
};

const presentation = Presentation.create({ slideSize: { width: 1280, height: 720 } });

function box(slide, x, y, w, h, fill = 'none', line = 'none', radius = 0) {
  return slide.shapes.add({
    geometry: radius ? 'roundRect' : 'rect',
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: { style: 'solid', fill: line === 'none' ? 'none' : line, width: line === 'none' ? 0 : 1 },
    borderRadius: radius ? 'rounded-xl' : undefined
  });
}

function text(slide, value, x, y, w, h, style = {}) {
  const shape = slide.shapes.add({
    geometry: 'textbox',
    position: { left: x, top: y, width: w, height: h },
    fill: 'none',
    line: { style: 'solid', fill: 'none', width: 0 }
  });
  shape.text = value;
  shape.text.style = { fontFamily: 'Microsoft YaHei', color: C.ink, fontSize: 20, ...style };
  return shape;
}

function title(slide, heading, sub = '') {
  text(slide, heading, 72, 48, 900, 54, { fontSize: 32, bold: true, color: C.teal });
  if (sub) text(slide, sub, 74, 101, 1000, 28, { fontSize: 15, color: C.gray });
  box(slide, 72, 137, 1136, 2, C.mint);
}

function footer(slide, page) {
  text(slide, `城市公园应急巡查 WebGIS  ·  ${page}/7`, 72, 684, 460, 20, { fontSize: 11, color: C.gray });
  text(slide, '样例数据 / 可审计空间逻辑', 1010, 684, 198, 20, { fontSize: 11, color: C.gray, align: 'right' });
}

function bulletList(slide, items, x, y, w, gap = 42, fontSize = 20) {
  items.forEach((item, i) => {
    text(slide, '•', x, y + i * gap, 24, 30, { fontSize: fontSize + 2, bold: true, color: C.green });
    text(slide, item, x + 30, y + i * gap, w - 30, 34, { fontSize, color: C.ink });
  });
}

// 1. Cover
{
  const s = presentation.slides.add();
  s.background.fill = C.teal;
  box(s, 72, 90, 12, 360, C.mint);
  text(s, 'GIS 生命周期课程工程', 120, 104, 500, 30, { fontSize: 16, bold: true, color: C.mint });
  text(s, '城市公园应急巡查\n与服务设施可达性 WebGIS', 120, 178, 790, 160, { fontSize: 44, bold: true, color: C.white });
  text(s, '从需求、设计、开发、测试到部署的完整闭环', 124, 370, 690, 36, { fontSize: 21, color: '#D7ECEA' });
  box(s, 900, 130, 250, 250, '#1C5960', '#4A8887', 1);
  text(s, '5', 955, 160, 120, 90, { fontSize: 76, bold: true, color: C.mint, align: 'center' });
  text(s, '公园样例', 930, 255, 190, 28, { fontSize: 18, bold: true, color: C.white, align: 'center' });
  text(s, '点面关系 · 距离 · 风险分级', 920, 304, 210, 42, { fontSize: 13, color: '#D7ECEA', align: 'center' });
  text(s, '何联国  ·  学号 2104260065  ·  GIS软件工程  ·  2026年11月1日', 120, 640, 760, 28, { fontSize: 13, color: '#B9D7D4' });
}

// 2. Business
{
  const s = presentation.slides.add();
  s.background.fill = C.white;
  title(s, '业务问题与项目边界', '一个可复现的城市公园应急巡查教学案例');
  box(s, 72, 185, 520, 354, C.pale, C.line, 1);
  text(s, '业务问题', 104, 214, 220, 32, { fontSize: 22, bold: true, color: C.teal });
  bulletList(s, ['风险事件是否落在具体公园范围内？', '最近应急服务点距离是否可接受？', '如何把空间结论变成可解释的巡查建议？'], 104, 275, 430, 62, 20);
  box(s, 642, 185, 566, 354, '#FFF9EF', '#EDD9B3', 1);
  text(s, '本项目交付', 674, 214, 240, 32, { fontSize: 22, bold: true, color: C.teal });
  bulletList(s, ['WebGIS：公园、风险点、服务点三类图层', '空间分析：点在面内 + Haversine + 最近点', '全套证据：需求、设计、测试、部署、AI 审查'], 674, 275, 485, 62, 20);
  text(s, '数据声明：GeoJSON 为脱敏/构造样例，字段和空间关系按真实业务流程设计，不代表生产数据。', 82, 575, 1110, 44, { fontSize: 16, color: C.red, bold: true });
  footer(s, 2);
}

// 3. Architecture
{
  const s = presentation.slides.add();
  s.background.fill = C.white;
  title(s, '系统架构与工程链路', '数据、空间分析和交互展示保持分层，便于审查与替换');
  const steps = [
    ['数据', 'GeoJSON\nEPSG:4326', C.green],
    ['前端状态', 'parks / hazards\nservices', C.blue],
    ['空间分析', '点面包含\n距离与评分', C.amber],
    ['结果面板', '风险等级\n解释性建议', C.red]
  ];
  steps.forEach(([name, detail, color], i) => {
    const x = 92 + i * 285;
    box(s, x, 240, 210, 150, '#F9FBFB', color, 1);
    box(s, x, 240, 210, 12, color);
    text(s, name, x + 22, 274, 168, 30, { fontSize: 21, bold: true, color: C.teal, align: 'center' });
    text(s, detail, x + 22, 320, 168, 54, { fontSize: 17, color: C.gray, align: 'center' });
    if (i < 3) text(s, '→', x + 225, 292, 40, 40, { fontSize: 30, bold: true, color: C.gray, align: 'center' });
  });
  box(s, 170, 457, 940, 88, C.pale, C.line, 1);
  text(s, 'Node.js 内置 HTTP 服务  |  原生 HTML/CSS/ES Modules  |  无数据库、无额外依赖', 200, 487, 880, 30, { fontSize: 19, color: C.teal, bold: true, align: 'center' });
  text(s, '生产化路线：Leaflet/OpenLayers + PostGIS + 规则版本化 + 审批后的 GeoAI 服务', 115, 598, 1050, 30, { fontSize: 16, color: C.gray, align: 'center' });
  footer(s, 3);
}

// 4. Spatial logic
{
  const s = presentation.slides.add();
  s.background.fill = C.white;
  title(s, '空间逻辑：先证明空间关系，再生成业务建议', '核心结论均可由输入要素和规则复核');
  box(s, 72, 180, 510, 360, C.pale, C.line, 1);
  text(s, '空间分析规则', 104, 208, 250, 30, { fontSize: 22, bold: true, color: C.teal });
  text(s, '1', 110, 270, 40, 42, { fontSize: 30, bold: true, color: C.green });
  text(s, '风险点是否落入公园 Polygon', 160, 276, 350, 30, { fontSize: 19, color: C.ink });
  text(s, '2', 110, 340, 40, 42, { fontSize: 30, bold: true, color: C.amber });
  text(s, '公园质心到服务点的 Haversine 距离', 160, 346, 370, 30, { fontSize: 19, color: C.ink });
  text(s, '3', 110, 410, 40, 42, { fontSize: 30, bold: true, color: C.red });
  text(s, '事件数 + 高严重度 + 距离阈值 → 风险分级', 160, 416, 390, 30, { fontSize: 19, color: C.ink });
  box(s, 642, 180, 566, 360, '#FFFCF5', '#E7D3A7', 1);
  text(s, '可审计示例：中央河滨公园', 674, 208, 400, 30, { fontSize: 22, bold: true, color: C.teal });
  const rows = [['落入事件', 'hazard-001'], ['最近服务点', 'service-001'], ['可达性阈值', '2 km'], ['逻辑证据', '5 个自动化测试']];
  rows.forEach(([a, b], i) => {
    const y = 274 + i * 51;
    text(s, a, 674, y, 170, 26, { fontSize: 17, color: C.gray });
    text(s, b, 870, y, 290, 26, { fontSize: 18, bold: true, color: C.teal });
    box(s, 674, y + 34, 480, 1, C.line);
  });
  footer(s, 4);
}

// 5. Demo
{
  const s = presentation.slides.add();
  s.background.fill = C.white;
  title(s, '系统演示路径', '3 分钟内从地图浏览进入可解释分析结果');
  box(s, 72, 187, 710, 360, '#EAF3F1', C.line, 1);
  // Editable map-like diagram, used as a presentation diagram rather than a screenshot.
  box(s, 98, 216, 280, 100, '#9BD3B8', '#2C8C6B', 1);
  box(s, 450, 340, 238, 105, '#9BD3B8', '#2C8C6B', 1);
  box(s, 240, 400, 180, 80, '#9BD3B8', '#2C8C6B', 1);
  text(s, '中央河滨公园', 130, 254, 220, 25, { fontSize: 16, bold: true, color: C.teal, align: 'center' });
  text(s, '东湖湿地公园', 466, 378, 205, 25, { fontSize: 16, bold: true, color: C.teal, align: 'center' });
  text(s, '南城社区公园', 254, 428, 150, 25, { fontSize: 15, bold: true, color: C.teal, align: 'center' });
  [[265,270,C.red],[530,365,C.amber],[335,430,C.red],[610,255,C.blue],[184,450,C.blue]].forEach(([x,y,c]) => { box(s, x, y, 18, 18, c, C.white, 1); });
  text(s, '风险点 / 服务点', 108, 506, 250, 24, { fontSize: 14, color: C.gray });
  box(s, 827, 187, 381, 360, C.pale, C.line, 1);
  const demo = [['①', '打开页面', '加载三类 GeoJSON 图层'], ['②', '选择公园', '点击面或下拉框'], ['③', '运行分析', '统计事件与最近服务点'], ['④', '解释结果', '风险分 + GeoAI 建议']];
  demo.forEach(([n, h, d], i) => {
    const y = 225 + i * 73;
    text(s, n, 856, y, 32, 30, { fontSize: 20, bold: true, color: C.green });
    text(s, h, 902, y, 250, 28, { fontSize: 18, bold: true, color: C.teal });
    text(s, d, 902, y + 28, 255, 24, { fontSize: 14, color: C.gray });
  });
  footer(s, 5);
}

// 6. Tests and AI
{
  const s = presentation.slides.add();
  s.background.fill = C.white;
  title(s, '测试与 AI 生成代码审查', '把“能显示”与“空间结论正确”分开验证');
  box(s, 72, 180, 540, 380, C.pale, C.line, 1);
  text(s, '自动化测试 5/5 通过', 106, 210, 430, 34, { fontSize: 24, bold: true, color: C.teal });
  const tests = ['点在面内 / 面外', 'Haversine 单位与误差', '中央公园事件包含关系', '最近服务点确定性', '风险阈值可解释性'];
  tests.forEach((item, i) => { text(s, '✓', 110, 274 + i * 44, 26, 26, { fontSize: 19, bold: true, color: C.green }); text(s, item, 150, 274 + i * 44, 370, 26, { fontSize: 17, color: C.ink }); });
  box(s, 670, 180, 538, 380, '#FFF9EF', '#EDD9B3', 1);
  text(s, 'AI 协作证据链', 704, 210, 370, 34, { fontSize: 24, bold: true, color: C.teal });
  bulletList(s, ['协作日志：记录生成、人工修改和证据', '提示词记录：需求、算法、审查、测试', '错误案例：距离、点面、数据声明、启动方式', '空间报告：明确坐标系、单位、边界限制'], 704, 276, 460, 52, 17);
  text(s, '关键原则：AI 加速脚手架，人审空间逻辑。', 86, 603, 1110, 30, { fontSize: 19, bold: true, color: C.red, align: 'center' });
  text(s, '记录人：何联国  |  学号：2104260065  |  课程：GIS软件工程  |  工具：Codex Desktop / GPT-5（2026.11）', 86, 640, 1110, 20, { fontSize: 11, color: C.gray, align: 'center' });
  footer(s, 6);
}

// 7. Summary
{
  const s = presentation.slides.add();
  s.background.fill = C.teal;
  text(s, '项目结论', 80, 70, 400, 40, { fontSize: 32, bold: true, color: C.white });
  box(s, 80, 145, 1120, 2, C.mint);
  text(s, '一个可运行的 WebGIS 原型，配套一套可审计的工程证据。', 80, 190, 1050, 58, { fontSize: 32, bold: true, color: C.white });
  const items = [
    ['基础层', 'WebGIS、GeoJSON、图层控制、点面查询'],
    ['进阶层', '可审计规则式 GeoAI 建议，预留模型服务接口'],
    ['挑战层', '空间智能体与数字孪生作为后续扩展'],
  ];
  items.forEach(([head, body], i) => {
    const x = 100 + i * 370;
    box(s, x, 320, 310, 130, '#1C5960', '#4A8887', 1);
    text(s, head, x + 22, 346, 266, 28, { fontSize: 20, bold: true, color: C.mint, align: 'center' });
    text(s, body, x + 24, 389, 262, 42, { fontSize: 15, color: C.white, align: 'center' });
  });
  text(s, '提交前：补充真实团队信息、数据来源/授权、远程 Git 地址和演示录屏。', 80, 555, 1110, 30, { fontSize: 17, color: '#D7ECEA', align: 'center' });
  text(s, '谢谢', 80, 632, 1120, 42, { fontSize: 24, bold: true, color: C.mint, align: 'center' });
}

for (const [index, slide] of presentation.slides.items.entries()) {
  const png = await presentation.export({ slide, format: 'png', scale: 1 });
  await fs.writeFile(path.join(buildDir, `slide-${String(index + 1).padStart(2, '0')}.png`), new Uint8Array(await png.arrayBuffer()));
}

const pptx = await PresentationFile.exportPptx(presentation);
await pptx.save(path.join(outputDir, '答辩PPT.pptx'));
console.log(`created ${path.join(outputDir, '答辩PPT.pptx')}`);

