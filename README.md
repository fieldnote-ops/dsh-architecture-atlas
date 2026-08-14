# AI Harness Atlas｜观察图谱

一份面向中文开发者社区的独立观察图谱：把多类 AI Harness、Agent SDK、编排运行时和 Coding Agent 放在同一张可比较的地图上。

本站不是任何项目的官方文档，也不代表 DeepSeek、OpenAI、Anthropic、Google、Cline 或其他项目方。

在线阅读：[AI Harness Atlas](https://fieldnote-ops.github.io/ai-harness-atlas/) · 仓库：[fieldnote-ops/ai-harness-atlas](https://github.com/fieldnote-ops/ai-harness-atlas)

## 这张图谱观察什么

当模型开始调用工具、读取上下文、改变文件、等待权限或交接给另一个 Agent 时，究竟是哪一层在负责运行循环、状态、权限、恢复和证据？

Atlas 不做“谁最好”的榜单，而是沿六个共同问题阅读不同对象：

- 运行循环
- 上下文与记忆
- 工具与扩展
- 权限与恢复
- 编排与交接
- 观测与验证

当前对象包括 Harness runtime、Agent SDK、编排 / Harness 层、Coding Agent，以及它们之间的组合形态：DSH、Pi、OpenAI Agents SDK、OpenHands SDK、LangGraph / Deep Agents、Codex CLI、Gemini CLI、Cline、Claude Code 和 OpenCode。

对象档案入口：[AI Harness Atlas Docs](docs/atlas.html)。比较内容只使用公开资料；缺少版本或证据时明确显示未知，不做质量排名。

## DSH 在图谱中的位置

DSH（DeepSeek Harness）是本图谱目前第一份完整深度档案，而不是整个项目的唯一对象。它提供一个清晰的案例：Profile、Loader、Cordis Context、Fiber 和领域插件如何共同组成一个可替换的 Agent 运行壳。

简单说，模型负责判断下一步，Harness 负责把这一步接到会话、上下文、工具、权限、沙箱、文件系统和界面，并让过程可执行、可追踪。DSH 的官方资料见 [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)；本站只做独立观察与中文解读。

## 站点阅读路径

- **观察图谱**：按对象类型筛选 10 个观察对象，沿六个维度比较差异；
- **对象档案**：查看对象的公开定位、版本状态、官方资料和阅读镜头；
- **文档**：用常见文档网站的方式按“开始、架构、运行指南、参考”阅读；
- **DSH 精选案例**：进入五层交互架构图、Context 拓扑、生命周期、证据矩阵和版本边界；
- **公开讨论观察**：按时间窗口、来源平台和对象版本记录可核验的公开讨论，不把不同版本混在一起。

## 对象与版本

图谱层面的对象档案和对象之间的比较，独立于某一个项目的版本选择。DSH 的版本选择只作用于 DSH 精选案例和对应的版本文档；其他对象按各自公开发布节奏记录。这样可以避免把“全站当前版本”误读成某个项目的官方版本声明。

每个版本页都尽量标出来源提交、核对日期、公开资料和不确定边界。版本变化只在有公开证据时记录，旧版本档案保留以便复查当时的判断。

## 本地查看

无需构建和第三方依赖：

```bash
python3 -m http.server 8080
```

然后打开 `http://localhost:8080`。本地服务器主要用于模拟 GitHub Pages 的相对路径。

验证：

```bash
npm test
```

## 主要资料

- [AI Harness Atlas 在线站点](https://fieldnote-ops.github.io/ai-harness-atlas/)
- [AI Harness Atlas 对象档案](docs/atlas.html)
- [DeepSeek Harness 官方仓库](https://github.com/deepseek-ai/deepseek-harness)
- [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/)
- [OpenHands SDK](https://docs.openhands.dev/sdk)
- [LangGraph](https://langchain-ai.github.io/langgraph/)
- [Codex CLI](https://github.com/openai/codex#readme)
- [Gemini CLI](https://github.com/google-gemini/gemini-cli#readme)
- [Cline](https://docs.cline.bot/)
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview)
- [OpenCode](https://opencode.ai/docs/)
- [时空可组合性论文](https://github.com/cordiverse/paper)
- [Cordis](https://github.com/cordiverse/cordis)

## 公开边界

本站是独立、非官方、AI 辅助且以公开证据复核的社区解读，与任何被观察项目无隶属、赞助或背书关系。项目名称、上游代码、论文和商标仍归各自权利人所有。

站点不加载第三方脚本，不使用分析、Cookie、远程字体或站点侧表单存储。公开讨论入口只接受可公开核验的链接，请勿提交账号、Token、内部链接、个人信息、客户数据、未公开材料或安全漏洞细节。

## License

站点原创代码与解读文字以 [MIT License](LICENSE) 发布。上游项目、论文、名称与商标仍遵循各自许可。
