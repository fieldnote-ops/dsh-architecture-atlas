(function () {
  "use strict";

  const versionPath = "dsh-0.1.0-rc.5";
  const pages = [
    { group: "开始", slug: "atlas", title: "观察图谱", description: "先区分 Harness 运行时、Agent SDK、编排层和 Coding Agent。", keywords: "harness atlas runtime sdk orchestration coding agent 比较" },
    { group: "开始", slug: "introduction", title: "DSH 是什么", description: "认识 Harness 的职责、项目状态与阅读入口。", keywords: "入门 harness agent deepseek" },
    { group: "开始", slug: "mental-model", title: "核心心智模型", description: "用目标拓扑、服务可用性和可逆生命周期理解 DSH。", keywords: "架构 everything plugin 拓扑" },
    { group: "架构", slug: "profile", title: "声明与配置", description: "Profile、Bundle 与 Patch 如何描述目标系统。", keywords: "profile bundle patch 配置" },
    { group: "架构", slug: "loader", title: "运行时协调", description: "Loader 如何把配置变化协调成运行态。", keywords: "loader include hmr 更新 热更新" },
    { group: "架构", slug: "context", title: "统一上下文", description: "Context 如何承载服务、隔离、事件与效应。", keywords: "context service isolate event" },
    { group: "架构", slug: "fiber", title: "插件生命周期", description: "Fiber 六态、依赖等待和逆序撤销。", keywords: "fiber effect inject disposer" },
    { group: "架构", slug: "plugins", title: "Agent 能力", description: "Session、Prompt、Tools、Agent Loop 与 LLM。", keywords: "session prompt tools agent llm" },
    { group: "运行指南", slug: "conversation", title: "一次对话如何运行", description: "沿一条消息追踪 Session、Loop、LLM 与工具调用。", keywords: "conversation turn step message tool" },
    { group: "运行指南", slug: "updates", title: "更新与恢复", description: "配置更新、热重载、汇合与失败恢复。", keywords: "reload rollback settlement update 热更新 hmr" },
    { group: "参考", slug: "boundaries", title: "能力边界与版本", description: "哪些是框架保证，哪些仍取决于实现与版本。", keywords: "boundary version developer preview 限制" },
    { group: "参考", slug: "community", title: "公开讨论观察", description: "按当前 DSH 版本查看 GitHub、知乎、X、Reddit 等公开讨论观察。", keywords: "community observation github 知乎 x reddit 时间戳 版本" }
  ];

  const currentFile = window.location.pathname.split("/").pop() || "index.html";
  const currentSlug = currentFile.replace(/\.html$/, "");
  const insideVersion = window.location.pathname.includes(`/${versionPath}/`);
  const hrefFor = (slug) => `${insideVersion ? "" : `${versionPath}/`}${slug}.html`;

  function setupHeaderCommunityLink() {
    const nav = document.querySelector(".docs-header .header-nav");
    if (!nav || nav.querySelector('[data-header-community]')) return;
    const link = document.createElement("a");
    link.dataset.headerCommunity = "";
    link.href = hrefFor("community");
    link.textContent = "公开讨论观察";
    if (currentSlug === "community") {
      nav.querySelector('a[aria-current="page"]')?.removeAttribute("aria-current");
      link.setAttribute("aria-current", "page");
    }
    nav.append(link);
  }

  function buildSidebar() {
    const sidebar = document.getElementById("docs-sidebar");
    if (!sidebar) return;

    const toggle = document.createElement("button");
    toggle.className = "docs-nav-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = `<span>浏览文档</span><b aria-hidden="true">＋</b>`;

    const body = document.createElement("div");
    body.className = "docs-nav-body";
    [...new Set(pages.map((page) => page.group))].forEach((group) => {
      const section = document.createElement("section");
      const heading = document.createElement("h2");
      heading.textContent = group;
      const nav = document.createElement("nav");
      nav.setAttribute("aria-label", `${group}文档`);
      pages.filter((page) => page.group === group).forEach((page) => {
        const link = document.createElement("a");
        link.href = hrefFor(page.slug);
        link.textContent = page.title;
        if (page.slug === currentSlug) link.setAttribute("aria-current", "page");
        nav.append(link);
      });
      section.append(heading, nav);
      body.append(section);
    });

    const overview = document.createElement("a");
    overview.className = "docs-overview-link";
    overview.href = insideVersion ? "../../#atlas" : "../#atlas-overview";
    overview.textContent = "查看交互架构图 ↗";
    body.append(overview);
    sidebar.replaceChildren(toggle, body);

    toggle.addEventListener("click", () => {
      const open = sidebar.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.querySelector("b").textContent = open ? "−" : "＋";
    });
  }

  function buildTableOfContents() {
    const article = document.querySelector(".doc-article");
    const shell = document.querySelector(".docs-shell");
    if (!article || !shell || document.getElementById("docs-toc")) return;
    const headings = [...article.querySelectorAll(".doc-section > h2")];
    if (headings.length < 2) return;

    const aside = document.createElement("aside");
    aside.className = "docs-toc";
    aside.id = "docs-toc";
    aside.setAttribute("aria-label", "本页目录");
    const label = document.createElement("p");
    label.textContent = "本页内容";
    const nav = document.createElement("nav");
    headings.forEach((heading, index) => {
      if (!heading.id) heading.id = `section-${index + 1}`;
      const link = document.createElement("a");
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent;
      nav.append(link);
    });
    aside.append(label, nav);
    shell.append(aside);
  }

  function setupSearch() {
    const actions = document.querySelector(".docs-header .header-actions");
    if (!actions || document.getElementById("docs-search-open")) return;

    const openButton = document.createElement("button");
    openButton.className = "docs-search-button";
    openButton.id = "docs-search-open";
    openButton.type = "button";
    openButton.innerHTML = `<span aria-hidden="true">⌕</span><span>搜索文档</span><kbd>/</kbd>`;
    actions.prepend(openButton);

    const dialog = document.createElement("dialog");
    dialog.className = "docs-search-dialog";
    dialog.innerHTML = `
      <div class="docs-search-box">
        <label for="docs-search-input">搜索文档</label>
        <div class="docs-search-input-row"><span aria-hidden="true">⌕</span><input id="docs-search-input" type="search" autocomplete="off" placeholder="例如：Fiber、工具调用、热更新"><button id="docs-search-close" type="button" aria-label="关闭搜索">Esc</button></div>
        <div class="docs-search-results" id="docs-search-results"></div>
      </div>`;
    document.body.append(dialog);

    const input = dialog.querySelector("input");
    const results = dialog.querySelector(".docs-search-results");
    const render = (query = "") => {
      const term = query.trim().toLowerCase();
      const matches = pages.filter((page) => !term || `${page.title} ${page.description} ${page.keywords}`.toLowerCase().includes(term));
      results.replaceChildren(...matches.map((page) => {
        const link = document.createElement("a");
        link.href = hrefFor(page.slug);
        link.innerHTML = `<span><small>${page.group}</small><strong>${page.title}</strong><p>${page.description}</p></span><b aria-hidden="true">→</b>`;
        return link;
      }));
      if (!matches.length) results.innerHTML = `<p class="docs-search-empty">没有匹配结果。换一个词试试。</p>`;
    };

    let opener = null;
    const open = () => {
      opener = document.activeElement;
      render(input.value);
      dialog.showModal();
      window.setTimeout(() => input.focus(), 0);
    };
    openButton.addEventListener("click", open);
    dialog.querySelector("#docs-search-close").addEventListener("click", () => dialog.close());
    input.addEventListener("input", () => render(input.value));
    document.addEventListener("keydown", (event) => {
      if (event.key === "/" && !dialog.open && !/input|textarea|select/i.test(document.activeElement?.tagName || "")) {
        event.preventDefault();
        open();
      }
    });
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", () => {
      if (opener instanceof HTMLElement) opener.focus();
    });
    input.addEventListener("keydown", (event) => {
      const firstResult = results.querySelector("a");
      if (event.key === "ArrowDown" && firstResult) {
        event.preventDefault();
        firstResult.focus();
      }
      if (event.key === "Enter" && firstResult) {
        event.preventDefault();
        firstResult.click();
      }
    });
  }

  function setupCopyButtons() {
    document.querySelectorAll('[data-copy-text]').forEach((button) => {
      button.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(button.dataset.copyText);
          const original = button.textContent;
          button.textContent = "已复制";
          window.setTimeout(() => { button.textContent = original; }, 1600);
        } catch (_) {
          button.textContent = "请手动复制";
        }
      });
    });
  }

  function setupReadingProgress() {
    const header = document.querySelector(".docs-header");
    if (!header) return;
    const progress = document.createElement("div");
    progress.className = "reading-progress";
    progress.setAttribute("aria-hidden", "true");
    const bar = document.createElement("span");
    progress.append(bar);
    header.after(progress);
    let queued = false;
    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0})`;
      queued = false;
    };
    window.addEventListener("scroll", () => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  function setupActiveTableOfContents() {
    const tocLinks = [...document.querySelectorAll(".docs-toc a")];
    if (!tocLinks.length || !("IntersectionObserver" in window)) return;
    const linksById = new Map(tocLinks.map((link) => [decodeURIComponent(link.hash.slice(1)), link]));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!visible) return;
      tocLinks.forEach((link) => link.removeAttribute("aria-current"));
      linksById.get(visible.target.id)?.setAttribute("aria-current", "location");
    }, { rootMargin: "-90px 0px -62%", threshold: 0 });
    linksById.forEach((_, id) => {
      const heading = document.getElementById(id);
      if (heading) observer.observe(heading);
    });
  }

  setupHeaderCommunityLink();
  buildSidebar();
  buildTableOfContents();
  setupSearch();
  setupCopyButtons();
  setupReadingProgress();
  setupActiveTableOfContents();
})();
