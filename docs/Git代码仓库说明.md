# Git代码仓库说明

项目成员：何联国  
学号：2104260065  
课程：GIS软件工程  
项目时间：2026年11月1日  
AI 工具：Codex Desktop / GPT-5（2026.11）  
运行环境：Node.js v24.22.1，PowerShell 7.x

Git远程仓库：<https://github.com/hlg111111/GIS-WebGIS-Project.git>

本工程的代码仓库包含以下内容：

- `src/`：WebGIS 页面、样式和空间分析模块。
- `data/`：GeoJSON 样例数据。
- `tests/`：点面关系、距离、最近服务点和风险阈值测试。
- `scripts/`：本地静态服务器和交付结构校验脚本。
- `docs/`：中文需求、设计、测试、部署、总结及 AI 审查文档。
- `slides/`：答辩 PPT 和 PPT 生成脚本。

## 提交到远程 Git

```powershell
cd <项目目录>
git init
git add .
git commit -m "完成城市公园应急巡查 WebGIS 工程"
git branch -M main
git remote add origin https://github.com/hlg111111/GIS-WebGIS-Project.git
git push -u origin main
```

提交前应补充学号、远程地址和真实数据来源。`node_modules/`、PPT 中间预览和临时构建目录不应提交。

