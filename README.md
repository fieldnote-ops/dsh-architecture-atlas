# DSH Architecture Atlas

一份面向中文开发者社区的 DeepSeek Harness（DSH）架构可视化解读。

它试图回答一个具体问题：`Everything is a plugin` 在运行时究竟意味着什么？站点从 Profile / Bundle / Patch 开始，穿过 Loader、Cordis Context、Fiber 生命周期与领域服务，最后还原一次对话如何由一组可替换插件临时组成。

## 站点内容

- 五层交互架构图：声明层、协调层、Context、Fiber、领域插件；
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

版本内容集中在 `data/versions.js`：

1. 复制现有版本对象并赋予新的 `id`；
2. 更新 `dshVersion`、`sourceCommit`、`cordisVersion`、`paperDraft` 与日期；
3. 只写入能由公开源码或论文核对的变化；
4. 把 `latest` 指向新版本；
5. 运行 `npm test`，提交后 GitHub Pages 会自动部署。

旧版本对象应保持不变，以确保 `?version=0.1.0` 这类链接仍可复查当时的判断。

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
