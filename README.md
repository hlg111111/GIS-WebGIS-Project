# 城市公园应急巡查与服务设施可达性 WebGIS

这是一个面向 GIS 软件生命周期课程的完整工程样例，覆盖需求、设计、开发、测试、部署和总结。系统面向城市公园管理人员，支持公园、风险事件和应急服务点的可视化，以及“风险事件落入公园范围 + 最近服务点距离”的空间分析。

项目成员：何联国  |  学号：2104260065  |  课程：GIS软件工程  |  项目时间：2026年11月1日

Git远程仓库：[https://github.com/hlg111111/GIS-WebGIS-Project.git](https://github.com/hlg111111/GIS-WebGIS-Project.git)

## 工程定位

- 案例：城市公园应急巡查与服务设施可达性评估。
- 实现层级：基础层 WebGIS + 轻量 GeoAI 原型。
- 数据：用于课堂演示的脱敏/构造样例数据，字段和空间关系按真实业务流程设计，不代表任何生产数据。
- 技术：原生 HTML/CSS/JavaScript、GeoJSON、SVG 地图渲染、Node.js 内置 HTTP 服务、Node Test Runner。
- 空间逻辑：点在面内判断、球面近似距离、最近服务点、风险分级与解释性建议。

## 快速运行

```powershell
npm test
npm run validate
npm start
```

打开 <http://localhost:8080/src/index.html>。

如果环境没有 npm，可以直接使用 Node：

```powershell
node --test
node scripts/server.mjs
```

## 目录

```text
src/                 前端页面、样式、空间分析模块
data/                GeoJSON 样例数据
tests/               空间逻辑与项目结构测试
scripts/             本地静态服务器与交付前校验脚本
docs/                需求、设计、测试、部署、总结及 AI 证据
slides/              答辩 PPT 源文件或导出文件
```

## 交付说明

本项目将“人机协作”当作可审计环节：`docs/AI协作日志.md` 记录生成与人工修改，`docs/提示词记录.md` 记录关键提示词，`docs/AI错误案例集.md` 记录 AI 生成错误及修复，`docs/空间逻辑校验报告.md` 汇总空间逻辑校验。

最终合规复核见 `docs/题目要求合规复核报告.md`。

正式提交前应补充 Git 远程仓库地址、真实数据来源/授权证明和部署地址。当前样例已提供可运行的本地演示和检查清单。

