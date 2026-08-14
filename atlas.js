(function () {
  "use strict";

  const atlas = window.AI_HARNESS_ATLAS;
  if (!atlas) return;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const state = { filter: "全部", a: "dsh", b: "pi" };

  const typeGroups = [
    { id: "全部", label: "全部对象" },
    { id: "Harness runtime", label: "Harness 运行时" },
    { id: "Agent SDK", label: "Agent SDK" },
    { id: "Orchestration + harness layer", label: "编排 / Harness 层" },
    { id: "Coding agent", label: "Coding Agent" },
    { id: "Runtime + coding agent", label: "运行时 + Coding Agent" },
    { id: "Coding agent + SDK", label: "Coding Agent + SDK" }
  ];

  function findObject(id) {
    return atlas.objects.find((item) => item.id === id) || atlas.objects[0];
  }

  function renderFilters() {
    const root = $("#atlas-filters");
    if (!root) return;
    root.replaceChildren(...typeGroups.map((group) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "atlas-filter";
      button.textContent = group.label;
      button.dataset.filter = group.id;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(group.id === state.filter));
      button.addEventListener("click", () => {
        state.filter = group.id;
        renderFilters();
        renderCards();
      });
      return button;
    }));
  }

  function visibleObjects() {
    return state.filter === "全部" ? atlas.objects : atlas.objects.filter((item) => item.type === state.filter);
  }

  function renderCards() {
    const root = $("#atlas-object-grid");
    const count = $("#atlas-result-count");
    if (!root || !count) return;
    const objects = visibleObjects();
    count.textContent = `${objects.length} 个观察对象`;
    root.replaceChildren(...objects.map((item) => {
      const article = document.createElement("article");
      article.className = "atlas-object-card";
      article.style.setProperty("--object-accent", `var(--${item.accent})`);
      article.innerHTML = `
        <div class="atlas-object-top"><span class="atlas-object-short">${item.short}</span><span class="atlas-object-depth">${item.depth}</span></div>
        <p class="atlas-object-type">${item.typeLabel}</p>
        <h3>${item.name}</h3>
        <p class="atlas-object-description">${item.description}</p>
        <div class="atlas-object-meta"><span>${item.version}</span><span>${item.status}</span></div>
        <p class="atlas-object-lens"><strong>阅读镜头</strong>${item.lens}</p>
        <div class="atlas-object-actions"><a href="${item.docsUrl}">${item.id === "dsh" ? "进入 DSH 文档" : "查看官方资料"} <span aria-hidden="true">↗</span></a><button type="button" data-compare-object="${item.id}">加入比较</button></div>`;
      article.querySelector("[data-compare-object]").addEventListener("click", () => {
        state.a = state.a === item.id ? state.a : item.id;
        if (state.a === item.id && state.b === item.id) state.b = atlas.objects.find((candidate) => candidate.id !== item.id)?.id || item.id;
        const selectA = $("#compare-a");
        const selectB = $("#compare-b");
        if (selectA) selectA.value = state.a;
        if (selectB) selectB.value = state.b;
        renderComparison();
        $("#atlas-compare")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return article;
    }));
  }

  function populateSelect(select, selected) {
    if (!select) return;
    select.replaceChildren(...atlas.objects.map((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = `${item.name} · ${item.typeLabel}`;
      option.selected = item.id === selected;
      return option;
    }));
  }

  function renderComparison() {
    const a = findObject(state.a);
    const b = findObject(state.b);
    const nameA = $("#compare-a-name");
    const nameB = $("#compare-b-name");
    const body = $("#compare-body");
    if (!body) return;
    if (nameA) nameA.textContent = a.name;
    if (nameB) nameB.textContent = b.name;
    body.replaceChildren(...atlas.dimensions.map((dimension) => {
      const row = document.createElement("tr");
      row.innerHTML = `<th scope="row">${dimension}</th><td>${a.dimensions[dimension] || "公开资料未说明"}</td><td>${b.dimensions[dimension] || "公开资料未说明"}</td>`;
      return row;
    }));
  }

  function setupComparison() {
    const selectA = $("#compare-a");
    const selectB = $("#compare-b");
    if (!selectA || !selectB) return;
    populateSelect(selectA, state.a);
    populateSelect(selectB, state.b);
    selectA.addEventListener("change", () => { state.a = selectA.value; if (state.a === state.b) state.b = atlas.objects.find((item) => item.id !== state.a)?.id || state.b; populateSelect(selectB, state.b); renderComparison(); });
    selectB.addEventListener("change", () => { state.b = selectB.value; if (state.a === state.b) state.a = atlas.objects.find((item) => item.id !== state.b)?.id || state.a; populateSelect(selectA, state.a); renderComparison(); });
    renderComparison();
  }

  renderFilters();
  renderCards();
  setupComparison();
})();
