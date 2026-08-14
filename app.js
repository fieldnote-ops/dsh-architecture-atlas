(function () {
  "use strict";

  const registry = window.DSH_ATLAS;
  if (!registry || !Array.isArray(registry.versions) || !registry.versions.length) {
    document.body.classList.add("data-error");
    return;
  }

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const byId = (id) => document.getElementById(id);

  const state = {
    version: null,
    layerId: null,
    mechanismId: null,
    fiberId: null,
    fiberTimer: null,
    toastTimer: null
  };

  function requestedVersion() {
    const params = new URLSearchParams(window.location.search);
    return params.get("version") || registry.latest;
  }

  function findVersion(id) {
    return registry.versions.find((version) => version.id === id)
      || registry.versions.find((version) => version.id === registry.latest)
      || registry.versions[0];
  }

  function versionLabel(version) {
    return version.label || `v${version.id}`;
  }

  function bindVersionText(version) {
    const values = {
      versionLabel: versionLabel(version),
      status: version.status,
      dshVersion: version.dshVersion,
      sourceCommit: version.sourceCommit,
      cordisVersion: version.cordisVersion,
      paperDraft: version.paperDraft,
      date: version.date,
      lede: version.lede,
      summary: version.summary
    };

    $$('[data-bind]').forEach((element) => {
      const value = values[element.dataset.bind];
      if (typeof value === "string") element.textContent = value;
    });
    byId("source-commit-link").href = version.sourceUrl;
  }

  function setupVersionSelect() {
    const select = byId("version-select");
    select.replaceChildren(...registry.versions.map((version) => {
      const option = document.createElement("option");
      option.value = version.id;
      option.textContent = versionLabel(version);
      return option;
    }));

    select.addEventListener("change", () => {
      const next = findVersion(select.value);
      const url = new URL(window.location.href);
      url.searchParams.set("version", next.id);
      window.history.pushState({ version: next.id }, "", url);
      renderVersion(next);
      showToast(`已切换到 ${versionLabel(next)}`);
    });

    window.addEventListener("popstate", () => renderVersion(findVersion(requestedVersion())));
  }

  function renderArchitecture(version) {
    const map = byId("architecture-map");
    map.innerHTML = "";
    if (!version.layers.some((layer) => layer.id === state.layerId)) {
      state.layerId = version.layers[0].id;
    }

    version.layers.forEach((layer) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `layer-button${layer.id === state.layerId ? " is-active" : ""}`;
      button.dataset.layer = layer.id;
      button.style.setProperty("--layer-color", `var(--${layer.tone})`);
      button.setAttribute("aria-pressed", String(layer.id === state.layerId));
      button.innerHTML = `
        <span class="layer-index">${layer.index}</span>
        <span class="layer-title"><small>${layer.eyebrow}</small><strong>${layer.title}</strong></span>
        <span class="layer-short">${layer.short}</span>
        <span class="layer-arrow" aria-hidden="true">→</span>`;
      button.addEventListener("click", () => selectLayer(layer.id));
      map.append(button);
    });

    updateLayerInspector();
  }

  function selectLayer(id) {
    state.layerId = id;
    $$(".layer-button").forEach((button) => {
      const active = button.dataset.layer === id;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    updateLayerInspector();
  }

  function updateLayerInspector() {
    const layer = state.version.layers.find((item) => item.id === state.layerId);
    if (!layer) return;
    byId("inspector-eyebrow").textContent = `${layer.index} / ${layer.eyebrow}`;
    byId("inspector-title").textContent = layer.title;
    byId("inspector-detail").textContent = layer.detail;
    byId("inspector-principle").textContent = layer.principle;
    byId("inspector-evidence").textContent = layer.evidence;
  }

  function renderTopology(version) {
    const field = byId("context-field");
    $$(".service-node", field).forEach((node) => node.remove());
    const lines = byId("topology-lines");
    const legend = byId("topology-legend");
    lines.innerHTML = "";
    legend.innerHTML = "";

    version.serviceTopology.forEach((service) => {
      const node = document.createElement("div");
      node.className = "service-node";
      node.style.left = `clamp(64px, ${service.x}%, calc(100% - 64px))`;
      node.style.top = `clamp(62px, ${service.y}%, calc(100% - 62px))`;
      node.innerHTML = `<code>ctx.${service.key}</code><small>${service.owner}</small>`;
      node.title = service.role;
      field.append(node);

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", "50");
      line.setAttribute("y1", "50");
      line.setAttribute("x2", String(service.x));
      line.setAttribute("y2", String(service.y));
      lines.append(line);

      const item = document.createElement("li");
      item.innerHTML = `<code>ctx.${service.key}</code><span>${service.role}</span>`;
      legend.append(item);
    });
  }

  function renderJourney(version) {
    const track = byId("journey-track");
    track.innerHTML = "";
    version.conversation.forEach((moment) => {
      const article = document.createElement("article");
      article.className = "journey-card reveal";
      article.innerHTML = `
        <div class="journey-step"><strong>${moment.step}</strong><span>${moment.actor}</span></div>
        <h3>${moment.title}</h3>
        <p>${moment.body}</p>
        <span class="journey-signal">${moment.signal}</span>`;
      track.append(article);
      observeReveal(article);
    });
  }

  function renderMechanisms(version) {
    if (!version.mechanisms.some((mechanism) => mechanism.id === state.mechanismId)) {
      state.mechanismId = version.mechanisms[0].id;
    }
    const tabs = byId("mechanism-tabs");
    tabs.innerHTML = "";
    version.mechanisms.forEach((mechanism, index) => {
      const button = document.createElement("button");
      const selected = mechanism.id === state.mechanismId;
      button.type = "button";
      button.className = "tab-button";
      button.id = `tab-${mechanism.id}`;
      button.dataset.mechanism = mechanism.id;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", "mechanism-panel");
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
      button.textContent = `0${index + 1} / ${mechanism.label}`;
      button.addEventListener("click", () => selectMechanism(mechanism.id));
      button.addEventListener("keydown", handleTabKeys);
      tabs.append(button);
    });
    updateMechanismPanel();
  }

  function handleTabKeys(event) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const tabs = $$(".tab-button", byId("mechanism-tabs"));
    const current = tabs.indexOf(event.currentTarget);
    let next = current;
    if (event.key === "ArrowLeft") next = (current - 1 + tabs.length) % tabs.length;
    if (event.key === "ArrowRight") next = (current + 1) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    event.preventDefault();
    tabs[next].focus();
    selectMechanism(tabs[next].dataset.mechanism);
  }

  function selectMechanism(id) {
    state.mechanismId = id;
    $$(".tab-button").forEach((button) => {
      const active = button.dataset.mechanism === id;
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });
    updateMechanismPanel();
  }

  function updateMechanismPanel() {
    const index = state.version.mechanisms.findIndex((item) => item.id === state.mechanismId);
    const mechanism = state.version.mechanisms[index];
    if (!mechanism) return;
    byId("mechanism-panel").setAttribute("aria-labelledby", `tab-${mechanism.id}`);
    byId("mechanism-index").textContent = `0${index + 1} / ${mechanism.label}`;
    byId("mechanism-heading").textContent = mechanism.title;
    byId("mechanism-intro").textContent = mechanism.intro;
    byId("mechanism-code").textContent = mechanism.code.join("\n");
    byId("mechanism-caveat").textContent = mechanism.caveat;
    const beats = byId("mechanism-beats");
    beats.innerHTML = "";
    mechanism.beats.forEach((beat) => {
      const item = document.createElement("li");
      item.innerHTML = `<span>${beat.n}</span><strong>${beat.title}</strong><p>${beat.text}</p>`;
      beats.append(item);
    });
    byId("effect-stack").hidden = mechanism.id !== "effects";
  }

  function renderFiber(version) {
    clearFiberTimer();
    if (!version.fiberStates.some((fiber) => fiber.id === state.fiberId)) {
      state.fiberId = version.fiberStates[0].id;
    }
    const rail = byId("fiber-rail");
    rail.innerHTML = "";
    version.fiberStates.forEach((fiber) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `fiber-state${fiber.id === state.fiberId ? " is-active" : ""}`;
      button.dataset.fiber = fiber.id;
      button.setAttribute("role", "listitem");
      button.setAttribute("aria-pressed", String(fiber.id === state.fiberId));
      button.innerHTML = `<span class="fiber-state-dot">${fiber.no}</span><strong>${fiber.id}</strong><small>${fiber.title}</small>`;
      button.addEventListener("click", () => selectFiber(fiber.id));
      rail.append(button);
    });
    updateFiberDetail();
  }

  function selectFiber(id) {
    state.fiberId = id;
    $$(".fiber-state").forEach((button) => {
      const active = button.dataset.fiber === id;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    updateFiberDetail();
  }

  function updateFiberDetail() {
    const fiber = state.version.fiberStates.find((item) => item.id === state.fiberId);
    if (!fiber) return;
    byId("fiber-detail").innerHTML = `
      <h3>${fiber.title}</h3>
      <p>${fiber.body}</p>
      <span class="fiber-theory">理论映射 · ${fiber.theory}</span>`;
  }

  function playFiberLifecycle() {
    clearFiberTimer();
    const sequence = ["PENDING", "LOADING", "ACTIVE", "UNLOADING", "DISPOSED"]
      .filter((id) => state.version.fiberStates.some((fiber) => fiber.id === id));
    let index = 0;
    selectFiber(sequence[index]);
    byId("fiber-play").setAttribute("aria-label", "生命周期演示进行中");
    state.fiberTimer = window.setInterval(() => {
      index += 1;
      if (index >= sequence.length) {
        clearFiberTimer();
        byId("fiber-play").removeAttribute("aria-label");
        return;
      }
      selectFiber(sequence[index]);
    }, 850);
  }

  function clearFiberTimer() {
    if (state.fiberTimer) window.clearInterval(state.fiberTimer);
    state.fiberTimer = null;
  }

  function renderEvidence(version) {
    const body = byId("evidence-body");
    body.innerHTML = "";
    version.matrix.forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.theory}</td>
        <td>${row.runtime}</td>
        <td><code>${row.evidence}</code></td>
        <td><span class="verdict">${row.verdict}</span></td>`;
      body.append(tr);
    });
  }

  function renderGaps(version) {
    const grid = byId("gap-grid");
    grid.innerHTML = "";
    version.gaps.forEach((gap) => {
      const article = document.createElement("article");
      article.className = "gap-card reveal";
      article.innerHTML = `<span>GAP / ${gap.id}</span><h3>${gap.title}</h3><p>${gap.body}</p>`;
      grid.append(article);
      observeReveal(article);
    });
  }

  function renderChangelog(version) {
    const list = byId("changelog");
    list.innerHTML = "";
    version.changelog.forEach((change) => {
      const item = document.createElement("li");
      item.textContent = change;
      list.append(item);
    });
  }

  function renderVersion(version) {
    state.version = version;
    document.documentElement.dataset.version = version.id;
    document.title = `DSH Architecture Atlas ${versionLabel(version)}｜可视化架构解读`;
    byId("version-select").value = version.id;
    bindVersionText(version);
    renderArchitecture(version);
    renderTopology(version);
    renderJourney(version);
    renderMechanisms(version);
    renderFiber(version);
    renderEvidence(version);
    renderGaps(version);
    renderChangelog(version);
  }

  function canonicalVersionUrl() {
    const url = new URL(window.location.href);
    url.searchParams.set("version", state.version.id);
    url.hash = "";
    return url.toString();
  }

  async function copyText(text, message) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.append(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    showToast(message);
  }

  function showToast(message) {
    const toast = byId("toast");
    toast.textContent = message;
    toast.classList.add("is-visible");
    if (state.toastTimer) window.clearTimeout(state.toastTimer);
    state.toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
  }

  function setupActions() {
    byId("share-button").addEventListener("click", () => copyText(canonicalVersionUrl(), "当前版本链接已复制"));
    byId("permalink-button").addEventListener("click", () => copyText(canonicalVersionUrl(), "永久链接已复制"));
    byId("fiber-play").addEventListener("click", playFiberLifecycle);
    byId("copy-summary").addEventListener("click", () => {
      const text = `DSH 不是“一个 Agent 核心 + 一堆插件”，而是 Profile 描述目标、Loader 协调差异、Cordis Context 承载服务、Fiber 保证可逆生命周期，最后由一组可替换插件临时组成 agent。\n\n可视化解读（${versionLabel(state.version)}）：${canonicalVersionUrl()}`;
      copyText(text, "社区摘要已复制");
    });
  }

  const revealObserver = "IntersectionObserver" in window
    ? new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.08, rootMargin: "0px 0px -35px" })
    : null;

  function observeReveal(element) {
    if (revealObserver) revealObserver.observe(element);
    else element.classList.add("is-visible");
  }

  function setupReveals() {
    $$(".reveal").forEach(observeReveal);
  }

  setupVersionSelect();
  setupActions();
  renderVersion(findVersion(requestedVersion()));
  setupReveals();
})();
