# AI Harness Atlas｜观察图谱

一份面向中文开发者社区的独立 AI Harness 观察图谱：记录多类 Harness 的架构、版本与公开讨论；DSH 是第一份深度专题。

本站不是任何 Harness 项目的官方文档，也不代表 DeepSeek、OpenAI、Anthropic、Google、Cline 或其他项目方。

在线阅读：[AI Harness Atlas](https://fieldnote-ops.github.io/ai-harness-atlas/) · 仓库：[fieldnote-ops/ai-harness-atlas](https://github.com/fieldnote-ops/ai-harness-atlas)

它试图回答一个具体问题：`Everything is a plugin` 在运行时究竟意味着什么？站点从 Profile / Bundle / Patch 开始，穿过 Loader、Cordis Context、Fiber 生命周期与领域服务，最后还原一次对话如何由一组可替换插件临时组成。

DSH（DeepSeek Harness）是 DeepSeek AI 开源的 Agent Harness。简单说，模型负责判断下一步，而 Harness 负责把模型接到会话、上下文、工具、权限、沙箱、文件系统和界面，让这一步可执行、可追踪。官方仓库：[deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)。

## 观察图谱

首页先按对象类型区分 Harness runtime、Agent SDK、编排运行时和 Coding Agent，再沿“运行循环、上下文、工具、权限、恢复、观测”六个问题比较。当前首期对象包括 DSH、Pi、OpenAI Agents SDK、OpenHands、LangGraph / Deep Agents、Codex CLI、Gemini CLI、Cline、Claude Code 与 OpenCode。

对象档案入口：[AI Harness Atlas Docs](docs/atlas.html)。比较内容只使用公开资料；缺少版本或证据时明确显示未知，不做质量排名。

## 站点内容

- 五层交互架构图：声明层、协调层、Context、Fiber、领域插件；
- 常见文档站式的中文文档：按“开始、架构、运行指南、参考”组织，带搜索、页内目录和前后篇；
- DSH 简介、官方资料链接和一行启动命令；
- `ctx.*` 服务拓扑与一次对话的六个架构时刻；
- 可逆效应、响应式依赖、事务协调三个机制实验台；
- DSH 工程六态 Fiber 状态机；
- 论文机制到 DSH / Cordis 源码的证据矩阵；
- 恢复可信度、状态迁移、异步事件与 Web HMR 等已知边界；
- 按研究基线维护的版本选择器与永久链接。

## 本地查看

无需构建和第三方依赖：

```bash
python3 -m http.server 8080
```

然后打开 `http://localhost:8080`。直接双击 `index.html` 也可以浏览；本地服务器主要用于模拟 GitHub Pages 路径。

验证：

```bash
npm test
```

## 新增解读版本

可视化版本内容集中在 `data/versions.js`，分层文档放在对应的 `docs/dsh-<version>/` 目录：

1. 复制现有版本对象并赋予新的 `id`；
2. 更新 `dshVersion`、`sourceCommit`、`cordisVersion`、`paperDraft` 与日期；
3. 只写入能由公开源码或论文核对的变化；
4. 复制版本文档目录，更新概念说明、运行指南、版本边界和前后篇导航；
5. 把 `latest` 指向新版本，并让主站各层的 `docsUrl` 指向新目录；
6. 运行 `npm test`，提交后 GitHub Pages 会自动部署。

旧版本对象和 Docs 目录都应保持不变，以确保 `?version=dsh-0.1.0-rc.5` 与 `docs/dsh-0.1.0-rc.5/` 这类链接仍可复查当时的判断。

## 主要资料

- [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)
- [DSH Architecture](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md)
- [A Programming Paradigm for Spatiotemporal Composability](https://github.com/cordiverse/paper)
- [Cordis](https://github.com/cordiverse/cordis)

## 公开边界

本站是独立、非官方、AI 辅助且以公开证据复核的社区解读，与 DeepSeek、Cordis 或 GitHub 无隶属、赞助或背书关系。DSH 与 Cordis 均处于快速迭代期；请以每个解读版本标注的源码提交和上游最新文档为准。

站点不加载第三方脚本，不使用分析、Cookie、表单或远程字体。

## License

站点原创代码与解读文字以 [MIT License](LICENSE) 发布。上游项目、论文、名称与商标仍遵循各自许可。
