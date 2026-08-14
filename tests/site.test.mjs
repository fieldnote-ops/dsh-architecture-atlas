import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");

function loadRegistry() {
  const sandbox = { window: {} };
  vm.runInNewContext(read("data/versions.js"), sandbox);
  return sandbox.window.DSH_ATLAS;
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

test("every release includes the required architecture evidence", () => {
  const registry = loadRegistry();
  for (const version of registry.versions) {
    for (const field of ["id", "date", "dshVersion", "sourceCommit", "sourceUrl", "cordisVersion", "paperDraft"]) {
      assert.equal(typeof version[field], "string", `${version.id}.${field} must be a string`);
      assert.ok(version[field].length > 0, `${version.id}.${field} must not be empty`);
    }
    assert.equal(version.layers.length, 5, `${version.id} must describe five architecture layers`);
    assert.equal(version.fiberStates.length, 6, `${version.id} must describe six Fiber states`);
    assert.ok(version.mechanisms.length >= 3);
    assert.ok(version.matrix.length >= 6);
    assert.ok(version.gaps.length >= 3);
  }
});

test("all local page assets exist and scripts/styles are same-origin", () => {
  const html = read("index.html");
  const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((match) => match[1]);
  const localReferences = references.filter((ref) => !/^(?:https?:|#|mailto:)/.test(ref));
  for (const reference of localReferences) {
    const localPath = reference.split(/[?#]/, 1)[0];
    assert.ok(existsSync(resolve(root, localPath)), `missing local asset: ${reference}`);
  }

  const executableReferences = [...html.matchAll(/<(?:script|link)[^>]+(?:src|href)="([^"]+)"/g)]
    .map((match) => match[1]);
  assert.ok(executableReferences.every((ref) => !/^https?:/.test(ref)), "remote script or stylesheet detected");
});

test("page contains accessibility and sharing essentials", () => {
  const html = read("index.html");
  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /class="skip-link"/);
  assert.match(html, /aria-label="选择 DSH 版本"/);
  assert.match(html, /property="og:image" content="assets\/social-card\.png"/);
  assert.ok(existsSync(resolve(root, "assets/social-card.png")));
});

test("reader-facing copy does not expose production language", () => {
  const publicCopy = `${read("index.html")}\n${read("data/versions.js")}`;
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
    "生成产物"
  ];
  for (const phrase of producerPhrases) {
    assert.ok(!publicCopy.includes(phrase), `producer-facing phrase leaked into public copy: ${phrase}`);
  }
});
