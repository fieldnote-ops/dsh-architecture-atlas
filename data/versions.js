/*
 * Public, reviewable content registry.
 *
 * Add a release by copying the object below, changing its `id`, `dshVersion`,
 * `sourceCommit`, and evidence-backed content. Keep `latest` pointed at the
 * newest reviewed entry. The UI and permalink switcher update automatically.
 */
window.DSH_ATLAS = {
  latest: "0.1.0",
  versions: [
    {
      id: "0.1.0",
      label: "v0.1.0 · 首发基线",
      date: "2026-08-14",
      dshVersion: "v0.1.0-rc.5",
      sourceCommit: "47f9438",
      sourceUrl: "https://github.com/deepseek-ai/deepseek-harness/tree/47f9438",
      cordisVersion: "4.0.1",
      paperDraft: "2026-08-13",
      status: "研究快照",
      lede: "把 DSH 看成一个可替换的插件拓扑，而不是一个不断长大的 Agent 单体。",
      summary: "Profile 决定要什么，Loader 负责把声明协调成运行态，Cordis Context 承载服务与效应，Fiber 让每个插件可激活、可失败、可卸载，领域插件最终拼成一次可追踪的对话。",
      layers: [
        {
          id: "profile",
          index: "01",
          eyebrow: "声明层",
          title: "Profile · Bundle · Patch",
          short: "描述想要的系统，而不是写死启动顺序。",
          detail: "Bundle 提供基础行，Profile 组合 bundle，用户 patch 做最后覆盖。同一 id 后写胜出；覆盖的是整行配置，不是深合并。行顺序不承担加载语义。",
          evidence: "packages/bundle/{base,web-app,headless}/cordis.patch.yml",
          principle: "声明是目标态，不是命令序列",
          tone: "yellow"
        },
        {
          id: "loader",
          index: "02",
          eyebrow: "协调层",
          title: "Loader · Include · HMR",
          short: "把配置差异翻译成最小生命周期动作。",
          detail: "Loader 根据 id/name/isolate/intercept/config/disabled 的变化选择重建、原位更新、卸载或重载。候选配置先验证并等待生命周期沉淀；失败时恢复旧插件或旧配置。",
          evidence: "vendor/cordis-plugin-loader · vendor/cordis-plugin-include",
          principle: "先准备候选，再提交运行态",
          tone: "orange"
        },
        {
          id: "context",
          index: "03",
          eyebrow: "运行时底座",
          title: "Cordis Context · Γ∞",
          short: "服务、隔离、拦截和效应共享一个上下文。",
          detail: "Context 是统一载体：服务以键进入 ctx，隔离决定同一键在不同上下文解析到哪个值，拦截承载横切元数据，ctx.effect 记录变更及其逆。",
          evidence: "vendor/cordis/src/context.ts",
          principle: "跨插件共享状态必须实体化为上下文键",
          tone: "mint"
        },
        {
          id: "fiber",
          index: "04",
          eyebrow: "生命周期引擎",
          title: "Fiber · Effect · Inject",
          short: "依赖可用才激活；撤销按 LIFO 自动发生。",
          detail: "每个插件实例对应 Fiber。target 与 committed 的差异驱动 reload/unload；inject 声明读取边界；effect 收集 disposer。卸载先停止供给，再等待依赖者排空，最后逆序恢复。",
          evidence: "vendor/cordis/src/fiber.ts",
          principle: "装载写效果，拆卸由逆自动推导",
          tone: "cyan"
        },
        {
          id: "plugins",
          index: "05",
          eyebrow: "领域词汇",
          title: "Session · Prompt · Tools · Agent · LLM",
          short: "连 Agent Loop 都只是可替换插件。",
          detail: "核心包分别贡献 ctx.sessions、ctx.systemPrompt、ctx.tools、ctx.agents、ctx.agentLoop 与 ctx.llm。它们不是围绕特权核心的挂件，而是共同临时组成一个 agent。",
          evidence: "packages/core/* · packages/llm/*",
          principle: "Everything is a plugin",
          tone: "blue"
        }
      ],
      serviceTopology: [
        { key: "sessions", owner: "session", role: "追加式会话事件日志", x: 10, y: 19 },
        { key: "systemPrompt", owner: "system-prompt", role: "提示词片段与工具 schema", x: 36, y: 8 },
        { key: "tools", owner: "tools", role: "工具注册表与执行管线", x: 67, y: 14 },
        { key: "agents", owner: "agent", role: "Agent 接口与活注册表", x: 78, y: 46 },
        { key: "agentLoop", owner: "agent-loop", role: "Turn / Step 默认驱动", x: 55, y: 70 },
        { key: "llm", owner: "llm", role: "模型适配器接缝", x: 20, y: 68 }
      ],
      conversation: [
        { step: "01", actor: "Profile", title: "目标态被组合", body: "base bundle、模式 bundle 与用户 patch 通过同一 id 覆盖，形成这次运行想要的插件集合。", signal: "configuration" },
        { step: "02", actor: "Loader", title: "依赖图开始收敛", body: "插件代码可以先导入，但只有 inject 所需服务全部可用，Fiber 才从 PENDING 进入 LOADING。", signal: "availability" },
        { step: "03", actor: "Session", title: "用户输入进入事件日志", body: "会话日志是模型上下文的事实来源：模型可见意味着可从日志重建。", signal: "event append" },
        { step: "04", actor: "Agent Loop", title: "一次 Turn 展开为 Step", body: "默认 loop 读取 prompt、tools、agent 与 llm 服务；它本身仍可被另一个 loop 插件替换。", signal: "service read" },
        { step: "05", actor: "Tools / LLM", title: "事件和工具管线协作", body: "模型请求、流式输出与工具调用在类型化事件和服务操作上流动；这些异步控制流超出了论文演算的显式范围。", signal: "runtime flow" },
        { step: "06", actor: "Fiber", title: "替换时精确撤销", body: "旧插件停止供给，依赖者先卸载，disposer 逆序执行；候选失败则恢复旧配置，避免半重载态。", signal: "recovery" }
      ],
      mechanisms: [
        {
          id: "effects",
          label: "可逆效应",
          title: "时间维度：每一次写入，都带着回去的路",
          intro: "ctx.effect 不只是执行一个副作用。它同时把对应 disposer 收入 Fiber 的逆栈。多个效应按 LIFO 组合，拆卸因此从装载逻辑自动推导。",
          code: [
            "ctx.effect(() => {",
            "  registry.set(key, service)",
            "  return () => registry.delete(key)",
            "})"
          ],
          beats: [
            { n: "A", title: "Apply", text: "注册服务、监听器或资源，同时返回逆。" },
            { n: "B", title: "Accumulate", text: "Fiber 把逆前置进 disposer 链。" },
            { n: "C", title: "Recover", text: "卸载时后注册先释放，恢复到观察等价状态。" }
          ],
          caveat: "逆的诚实性依赖组件作者与测试；运行时不会证明恢复真的等价。"
        },
        {
          id: "coeffects",
          label: "响应式依赖",
          title: "空间维度：加载顺序退场，服务可用性接管",
          intro: "inject 声明插件需要哪些 ctx 键。上下文变化后，Fiber 重新计算 target：依赖满足才激活，供给消失就停用；行序因此不再是隐式依赖。",
          code: [
            "class AgentLoop extends Service {",
            "  static inject = ['agents', 'llm', 'tools']",
            "  apply(ctx) { /* activate when ready */ }",
            "}"
          ],
          beats: [
            { n: "A", title: "Declare", text: "组件先声明所需服务键。" },
            { n: "B", title: "Resolve", text: "Context 代理在访问点解析与检查。" },
            { n: "C", title: "React", text: "服务变化驱动激活、停用或保持。" }
          ],
          caveat: "声明能暴露依赖环，但直接 import 内部模块或修改全局仍可绕开边界。"
        },
        {
          id: "reconcile",
          label: "事务协调",
          title: "配置维度：从旧拓扑到新拓扑，不留下半成品",
          intro: "Patch 描述目标，不直接命令运行时。Loader 对差异分类，先准备候选并等待 settlement，再提交；候选失败时恢复旧插件或配置。",
          code: [
            "current config",
            "  → clone + patch",
            "  → validate + settle",
            "  → commit  |  restore"
          ],
          beats: [
            { n: "A", title: "Diff", text: "按条目 id 和字段识别最小变化。" },
            { n: "B", title: "Stage", text: "导入、验证并让异步生命周期沉淀。" },
            { n: "C", title: "Commit", text: "全部候选成功后才切换缓存与运行态。" }
          ],
          caveat: "整行 config 替换而非深合并；漏写字段会被有意删除。"
        }
      ],
      fiberStates: [
        { id: "PENDING", no: "00", title: "等待依赖", body: "uid 存在、没有错误、runner 未激活。依赖未满足时不读取服务。", theory: "Inactive(⊥)" },
        { id: "LOADING", no: "01", title: "执行插件回调", body: "setup/apply 正在产生效应，旧 committed 视图仍用于判断转移。", theory: "Reloading" },
        { id: "ACTIVE", no: "02", title: "服务已供给", body: "runner epoch 活跃，插件的提供项可被依赖者解析。", theory: "Active" },
        { id: "UNLOADING", no: "03", title: "排空并撤销", body: "先停止供给，等待依赖者停用，再逐步运行 disposer。此时拒绝创建新效应。", theory: "Unloading" },
        { id: "FAILED", no: "04", title: "失败被物化", body: "同步或异步设置错误被记录；已收集的效应必须回滚。", theory: "Inactive(ξ)" },
        { id: "DISPOSED", no: "05", title: "离开注册表", body: "uid 被清除，Fiber 不再参与协调。", theory: "Retired / removed" }
      ],
      matrix: [
        { theory: "统一上下文 Γ∞", runtime: "Context 类 + ctx 代理", evidence: "vendor/cordis/src/context.ts", verdict: "直接落点" },
        { theory: "可逆效应 effectΓ(e)", runtime: "ctx.effect(callback) + disposer 链", evidence: "context.ts · fiber.ts", verdict: "直接落点" },
        { theory: "组件与 Fiber", runtime: "Service(inject + apply) + 六态 Fiber", evidence: "fiber.ts:147+", verdict: "工程精化" },
        { theory: "目标 / 已提交视图", runtime: "fiber.target / fiber.committed", evidence: "fiber.ts · loader", verdict: "直接落点" },
        { theory: "声明式 entry", runtime: "id/name/config/disabled 等配置行", evidence: "cordis.patch.yml", verdict: "字段映射" },
        { theory: "增量协调与汇合", runtime: "Loader / Include 事务性候选与恢复", evidence: "vendor 修改 #8", verdict: "工程加固" },
        { theory: "效应迭代器与逐步回滚", runtime: "execute / reload / unload / inertia", evidence: "fiber.ts", verdict: "直接落点" },
        { theory: "键上的操作集", runtime: "emit / waterfall / parallel / serial", evidence: "events.ts", verdict: "工程扩展" }
      ],
      gaps: [
        { id: "01", title: "恢复靠可信的逆", body: "框架能保证按正确顺序调用 disposer，却不能证明 disposer 把外部世界恢复到观察等价状态。" },
        { id: "02", title: "组件内存态不跨重载", body: "HMR 是撤销旧组件并重放新组件。要保留缓存或连接，状态必须放到被替换组件之外。" },
        { id: "03", title: "事件与流式控制在演算之外", body: "waterfall、异步工具调用和流式 LLM 输出是必要工程扩展，但没有被十条转移规则完整形式化。" },
        { id: "04", title: "Web HMR 仍是边界", body: "该基线中 web-app 明确禁用共享 HMR，等待浏览器侧重载生命周期被验证。" }
      ],
      changelog: [
        "新增 DSH 是什么、官方资料入口与一行启动命令",
        "建立五层架构交互图与服务拓扑",
        "补全六态 Fiber 状态机、三类核心机制和一次对话旅程",
        "加入理论—源码证据矩阵、局限说明和版本永久链接",
        "站点零第三方脚本、零追踪、零网络请求"
      ]
    }
  ]
};
