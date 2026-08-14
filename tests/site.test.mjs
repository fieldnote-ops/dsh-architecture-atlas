import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { createHash } from "node:crypto";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");

function filesUnder(path) {
  const absolute = resolve(root, path);
  return readdirSync(absolute).flatMap((name) => {
    const child = resolve(absolute, name);
    const relative = child.slice(root.length + 1);
    return statSync(child).isDirectory() ? filesUnder(relative) : [relative];
  });
}

const htmlFiles = ["index.html", ...filesUnder("docs").filter((path) => path.endsWith(".html"))];

function loadRegistry() {
  const sandbox = { window: {} };
  vm.runInNewContext(read("data/versions.js"), sandbox);
  return sandbox.window.DSH_ATLAS;
}

function loadAtlas() {
  const sandbox = { window: {} };
  vm.runInNewContext(read("data/atlas.js"), sandbox);
  return sandbox.window.AI_HARNESS_ATLAS;
}

test("version registry has a valid latest release", () => {
  const registry = loadRegistry();
  assert.ok(registry);
  assert.ok(Array.isArray(registry.versions));
  assert.ok(registry.versions.length >= 1);
  assert.ok(registry.versions.some((version) => version.id === registry.latest));

  const ids = registry.versions.map((version) => version.id);
  assert.equal(new Set(ids).size, ids.length, "version ids must be unique");
});

test("AI Harness catalogue is typed, comparable, and reader-facing", () => {
  const atlas = loadAtlas();
  assert.ok(atlas);
  assert.deepEqual(Array.from(atlas.dimensions), ["运行循环", "上下文与记忆", "工具与扩展", "权限与恢复", "编排与交接", "观测与验证"]);
  assert.ok(atlas.objects.length >= 8);
  assert.ok(atlas.objects.some((item) => item.id === "dsh"));
  assert.ok(atlas.objects.some((item) => item.id === "pi"));
  for (const item of atlas.objects) {
    for (const field of ["id", "name", "type", "typeLabel", "version", "description", "officialUrl", "docsUrl"]) {
      assert.equal(typeof item[field], "string", `${item.id}.${field} must be a string`);
    }
    assert.equal(Object.keys(item.dimensions).length, atlas.dimensions.length, `${item.id} must cover every comparison dimension`);
  }
});

test("every release includes the required architecture evidence", () => {
  const registry = loadRegistry();
  for (const version of registry.versions) {
    for (const field of ["id", "date", "dshVersion", "sourceCommit", "sourceUrl", "cordisVersion", "paperDraft"]) {
      assert.equal(typeof version[field], "string", `${version.id}.${field} must be a string`);
      assert.ok(version[field].length > 0, `${version.id}.${field} must not be empty`);
    }
    assert.equal(version.layers.length, 5, `${version.id} must describe five architecture layers`);
    assert.ok(version.layers.every((layer) => typeof layer.docsUrl === "string" && layer.docsUrl.length > 0));
    assert.equal(version.fiberStates.length, 6, `${version.id} must describe six Fiber states`);
    assert.ok(version.mechanisms.length >= 3);
    assert.ok(version.matrix.length >= 6);
    assert.ok(version.gaps.length >= 3);
    assert.equal(typeof version.community?.docsUrl, "string");
    assert.equal(version.community?.keyword, "DeepSeek Harness");
    assert.match(version.community?.scanTime || "", /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    assert.equal(typeof version.community?.submitUrl, "string");
  }
});

test("all local links and assets resolve from every HTML page", () => {
  for (const page of htmlFiles) {
    const html = read(page);
    const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((match) => match[1]);
    const localReferences = references.filter((ref) => !/^(?:https?:|#|mailto:)/.test(ref));
    for (const reference of localReferences) {
      const localPath = reference.split(/[?#]/, 1)[0];
      assert.ok(existsSync(resolve(root, dirname(page), localPath)), `${page} has missing local target: ${reference}`);
    }

    const executableReferences = [...html.matchAll(/<(?:script|link)[^>]+(?:src|href)="([^"]+)"/g)]
      .map((match) => match[1]);
    assert.ok(executableReferences.every((ref) => !/^https?:/.test(ref)), `${page} loads a remote script or stylesheet`);
  }
});

test("versioned documentation covers onboarding, architecture, operations, and reference", () => {
  const expected = ["introduction", "mental-model", "profile", "loader", "context", "fiber", "plugins", "conversation", "updates", "boundaries", "community"];
  assert.ok(existsSync(resolve(root, "docs/index.html")));
  for (const name of expected) {
    const page = read(`docs/dsh-0.1.0-rc.5/${name}.html`);
    assert.match(page, /<h1>/, `${name} document needs a title`);
    assert.match(page, /id="docs-sidebar"/, `${name} document needs the global sidebar`);
    assert.match(page, /class="doc-pagination"/, `${name} document needs continuous navigation`);
    assert.match(page, /docs\.js/, `${name} document needs documentation interactions`);
  }
});

test("AI Harness Atlas docs provide a public object taxonomy and evidence boundary", () => {
  const page = read("docs/atlas.html");
  assert.match(page, /AI Harness Atlas/);
  assert.match(page, /Harness runtime/);
  assert.match(page, /Agent SDK/);
  assert.match(page, /Coding Agent/);
  assert.match(page, /版本档案/);
  assert.match(page, /公开讨论观察/);
  assert.match(page, /未知项保留未知/);
  assert.match(read("docs/docs.js"), /slug: "atlas"/);
});

test("implementation paths are optional references, not the documentation model", () => {
  const architecturePages = ["profile", "loader", "context", "fiber", "plugins"];
  for (const name of architecturePages) {
    const page = read(`docs/dsh-0.1.0-rc.5/${name}.html`);
    assert.match(page, /<details class="implementation-reference">/, `${name} should fold implementation links`);
    assert.match(page, /常见误解/, `${name} needs reader-oriented misconceptions`);
    assert.ok(!page.includes("源码阅读顺序"), `${name} must not present source order as the reading model`);
  }
});

test("documentation shell provides grouped navigation, local search, and page outline", () => {
  const script = read("docs/docs.js");
  for (const group of ["开始", "架构", "运行指南", "参考"]) assert.ok(script.includes(`group: "${group}"`));
  assert.match(script, /docs-search-dialog/);
  assert.match(script, /buildTableOfContents/);
  assert.match(script, /setupReadingProgress/);
  assert.match(script, /setupActiveTableOfContents/);
  assert.match(read("docs/index.html"), /所有文档/);
  assert.ok(!script.includes("<form"), "local documentation search must not create a submission surface");
});

test("community observations are version-scoped, timestamped, multi-community, and privacy-aware", () => {
  const page = read("docs/dsh-0.1.0-rc.5/community.html");
  for (const community of ["GitHub", "知乎", "X", "Reddit"]) assert.ok(page.includes(community));
  assert.ok(!page.includes("用什么关键词观察"));
  assert.ok(!page.includes("主检索词为"));
  assert.match(page, /本站不是 DeepSeek 或 DeepSeek Harness 官方/);
  assert.ok(!page.includes("社区反馈"));
  assert.match(page, /独立观察 · 非官方/);
  assert.match(page, /按本站当前文档版本的观察窗口累计/);
  assert.match(page, /当前观察窗口讨论已归档/);
  assert.equal((page.match(/class="community-record"/g) || []).length, 3);
  assert.match(page, /仅限 DSH v0\.1\.0-rc\.5/);
  assert.match(page, /datetime="2026-08-14T05:48:32Z"/);
  assert.match(page, /原帖时间/);
  assert.match(page, /收录时间/);
  assert.match(page, /纳入时间/);
  assert.match(page, /0 条改变当前架构结论/);
  assert.match(page, /请勿提交私密信息/);
  assert.match(page, /github\.com\/search\?q=%22DeepSeek\+Harness%22/);
  assert.match(page, /zhihu\.com\/search\?type=content&amp;q=%22DeepSeek%20Harness%22/);
  assert.match(page, /x\.com\/search\?q=%22DeepSeek%20Harness%22/);
  assert.match(page, /reddit\.com\/search\/\?q=%22DeepSeek%20Harness%22/);

  const issueForm = read(".github/ISSUE_TEMPLATE/community-observation.yml");
  assert.match(issueForm, /v0\.1\.0-rc\.5 \(commit 47f9438\)/);
  assert.match(issueForm, /独立的社区观察与解读项目/);
  assert.ok(!issueForm.includes("社区反馈"));
  assert.match(issueForm, /并非官方支持渠道/);
  assert.ok(!issueForm.includes("主检索词为"));
  assert.match(issueForm, /来源社区/);
  assert.match(issueForm, /原帖时间/);
  assert.match(issueForm, /Token/);
});

test("motion is purposeful, keyboard reachable, and reduced-motion aware", () => {
  const html = read("index.html");
  const script = read("app.js");
  assert.match(html, /id="journey-track"/);
  assert.ok(!html.includes('id="journey-play"'));
  assert.ok(!html.includes('id="journey-progress-bar"'));
  assert.match(html, /id="reading-progress-bar"/);
  assert.match(script, /prefers-reduced-motion: reduce/);
  assert.ok(!script.includes("toggleJourneyPlayback"));
  assert.ok(!script.includes("selectJourneyStep"));
  assert.match(script, /article\.className = "journey-card"/);
  assert.match(script, /handleChoiceKeys/);
  assert.ok(!/<body[^>]+autoplay/i.test(html));
});

test("public manifest pins every deployed byte", () => {
  const manifest = JSON.parse(read("PUBLIC_MANIFEST.json"));
  assert.equal(manifest.publication_target.repository, "fieldnote-ops/dsh-architecture-atlas");
  assert.ok(manifest.site_files.includes("PUBLIC_MANIFEST.json"));
  assert.deepEqual(Object.keys(manifest.files).sort(), manifest.site_files.filter((path) => path !== "PUBLIC_MANIFEST.json").sort());
  for (const [path, evidence] of Object.entries(manifest.files)) {
    const data = readFileSync(resolve(root, path));
    assert.equal(evidence.bytes, data.length, `${path} byte count drifted`);
    assert.equal(evidence.sha256, createHash("sha256").update(data).digest("hex"), `${path} hash drifted`);
  }
});

test("the architecture map exposes one version-aware Docs link per layer", () => {
  const html = read("index.html");
  const layerLinks = [...html.matchAll(/data-docs-layer="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(layerLinks, ["profile", "loader", "context", "fiber", "plugins"]);
  assert.match(read("app.js"), /layer\.docsUrl/);
});

test("page contains accessibility and sharing essentials", () => {
  const html = read("index.html");
  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /class="skip-link"/);
  assert.match(html, /aria-label="选择 DSH 版本"/);
  assert.match(html, /property="og:image" content="assets\/social-card\.png"/);
  assert.ok(existsSync(resolve(root, "assets/social-card.png")));
});

test("homepage keeps the Atlas mental model ahead of the DSH case study", () => {
  const html = read("index.html");
  const header = html.match(/<header[\s\S]*?<\/header>/)?.[0] || "";
  assert.match(html, /class="atlas-scope"/);
  assert.match(html, /id="dsh-case"/);
  assert.match(html, /<details class="dsh-deep-dive" id="dsh-deep-dive">/);
  assert.ok(!header.includes('id="version-select"'), "DSH version control must stay inside its case study");
  assert.match(html, /10 个观察对象/);
  assert.match(html, /DSH 是第一份完整深度档案/);
});

test("reader-facing copy does not expose production language", () => {
  const publicCopy = `${htmlFiles.map(read).join("\n")}\n${read("data/versions.js")}`;
  const producerPhrases = [
    "首发基线",
    "CURRENT RELEASE",
    "CHANGELOG",
    "本版包含",
    "解读站发布版",
    "公共笔记",
    "新增 DSH",
    "站点零",
    "AI 辅助",
    "人工式证据核对",
    "生成产物",
    "源码阅读顺序",
    "用什么关键词观察",
    "主检索词为",
    "采集流程"
  ];
  for (const phrase of producerPhrases) {
    assert.ok(!publicCopy.includes(phrase), `producer-facing phrase leaked into public copy: ${phrase}`);
  }
});
