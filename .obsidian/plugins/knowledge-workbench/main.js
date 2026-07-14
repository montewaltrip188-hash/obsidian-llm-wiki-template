"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => WorkbenchPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian14 = require("obsidian");

// src/view.ts
var import_obsidian11 = require("obsidian");

// src/sparks/index.ts
var import_obsidian = require("obsidian");

// src/util.ts
var p2 = (n) => n.toString().padStart(2, "0");
function todayDateStr(d = /* @__PURE__ */ new Date()) {
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
}
function nowTimeStr(d = /* @__PURE__ */ new Date()) {
  return `${p2(d.getHours())}:${p2(d.getMinutes())}`;
}

// src/sparks/parser.ts
var SPARK_RE = /^- \*\*(\d{2}:\d{2})\*\*\s+(.+)$/;
function parseSparkLine(line) {
  const m = SPARK_RE.exec(line);
  return m ? { time: m[1], text: m[2] } : null;
}
function parseSparkContent(content) {
  const out = [];
  for (const line of content.split(/\r?\n/)) {
    const e = parseSparkLine(line);
    if (e) out.push(e);
  }
  return out;
}
function serializeSpark(time, text) {
  const lines = text.split(/\r?\n/);
  const first = lines.shift() ?? "";
  const rest = lines.map((l) => `  ${l}`).join("\n");
  return rest ? `- **${time}** ${first}
${rest}` : `- **${time}** ${first}`;
}

// src/sparks/index.ts
var SPARK_DIR = "inbox/sparks/Dailynote";
function todaySparkPath() {
  return (0, import_obsidian.normalizePath)(`${SPARK_DIR}/${todayDateStr()}.md`);
}
async function appendSpark(app, text) {
  const normalized = text.replace(/\r\n?/g, "\n").replace(/\u0000/g, "");
  const trimmed = normalized.trim();
  if (!trimmed) throw new Error("\u5185\u5BB9\u4E3A\u7A7A");
  const indented = trimmed.replace(/\n/g, "\n  ");
  const path = todaySparkPath();
  if (!path.startsWith("inbox/")) throw new Error(`\u62D2\u7EDD\u5199\u5165 inbox/ \u4E4B\u5916\uFF1A${path}`);
  await ensureFolder(app, SPARK_DIR);
  const entry = serializeSpark(nowTimeStr(), indented);
  const existing = app.vault.getAbstractFileByPath(path);
  if (!(existing instanceof import_obsidian.TFile)) {
    const header = `---
type: dailynote
date: ${todayDateStr()}
tags:
  - inbox/spark
---

`;
    await app.vault.create(path, header + entry + "\n");
  } else {
    await app.vault.process(existing, (data) => {
      const needsNl = data.length > 0 && !data.endsWith("\n");
      return data + (needsNl ? "\n" : "") + entry + "\n";
    });
  }
  return path;
}
async function readTodaySparks(app) {
  const path = todaySparkPath();
  const file = app.vault.getAbstractFileByPath(path);
  if (!(file instanceof import_obsidian.TFile)) return [];
  const content = await app.vault.cachedRead(file);
  return parseSparkContent(content);
}
async function ensureFolder(app, folder) {
  const existing = app.vault.getAbstractFileByPath(folder);
  if (existing instanceof import_obsidian.TFolder) return;
  if (existing) throw new Error(`\u8DEF\u5F84\u5DF2\u5B58\u5728\u4F46\u4E0D\u662F\u6587\u4EF6\u5939\uFF1A${folder}`);
  const parts = folder.split("/");
  let cur = "";
  for (const p of parts) {
    cur = cur ? `${cur}/${p}` : p;
    if (!app.vault.getAbstractFileByPath(cur)) {
      await app.vault.createFolder(cur);
    }
  }
}
var SparkModal = class extends import_obsidian.Modal {
  constructor(app, onSubmit) {
    super(app);
    this.onSubmit = onSubmit;
  }
  onOpen() {
    const { contentEl, titleEl } = this;
    titleEl.setText("\u26A1 \u968F\u624B\u8BB0");
    const input = contentEl.createEl("input", {
      cls: "kw-modal-input",
      attr: { type: "text", placeholder: "\u8F93\u5165\u5185\u5BB9\uFF0C\u56DE\u8F66\u5373\u5B58\u5230\u4ECA\u65E5 Dailynote\u2026" }
    });
    input.focus();
    input.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const v = input.value.trim();
        if (!v) return;
        try {
          await this.onSubmit(v);
          new import_obsidian.Notice("\u5DF2\u8FFD\u52A0\u5230\u4ECA\u65E5\u968F\u624B\u8BB0");
          this.close();
        } catch (err) {
          new import_obsidian.Notice(`\u4FDD\u5B58\u5931\u8D25\uFF1A${err.message}`);
        }
      } else if (e.key === "Escape") {
        this.close();
      }
    });
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/sparks/section.ts
var import_obsidian7 = require("obsidian");

// src/sparks/convert.ts
var import_obsidian2 = require("obsidian");

// src/tasks/sanitize.ts
var ILLEGAL_CHARS = /[\\/:*?"<>|]/g;
var CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;
function sanitizePlanFileName(title) {
  let s = title.replace(CONTROL_CHARS, "").replace(ILLEGAL_CHARS, "").trim();
  s = s.replace(/\.\.+/g, ".");
  s = s.replace(/^[.\s]+|[.\s]+$/g, "");
  if (s.length === 0) throw new Error("\u6807\u9898\u4E0D\u80FD\u4E3A\u7A7A");
  return s;
}

// src/sparks/convert.ts
var SPARK_DRAFT_DIR = "inbox/sparks";
var DAILYNOTE_PREFIX = "inbox/sparks/Dailynote/";
function sparkEntryToLine(e) {
  return `- **${e.time}** ${e.text}`;
}
function hasSourceLink(text) {
  return / → \[\[/.test(text);
}
async function convertSparkToDraft(app, sparkText, dailyPath, title) {
  const safeTitle = sanitizePlanFileName(title);
  const dateStr2 = todayDateStr();
  const baseStem = `${dateStr2}-${safeTitle}`;
  if (!app.vault.getAbstractFileByPath(SPARK_DRAFT_DIR)) {
    await app.vault.createFolder(SPARK_DRAFT_DIR);
  }
  let stem = baseStem;
  let path = (0, import_obsidian2.normalizePath)(`${SPARK_DRAFT_DIR}/${stem}.md`);
  let n = 2;
  while (app.vault.getAbstractFileByPath(path)) {
    stem = `${baseStem}-${n}`;
    path = (0, import_obsidian2.normalizePath)(`${SPARK_DRAFT_DIR}/${stem}.md`);
    n++;
  }
  if (!path.startsWith("inbox/")) {
    throw new Error(`\u62D2\u7EDD\u5199\u5165 inbox/ \u4E4B\u5916\uFF1A${path}`);
  }
  const dailyLink = dailyPath.replace(/\.md$/i, "");
  const quoted = sparkText.split(/\r?\n/).map((l) => `> ${l}`).join("\n");
  const body = `---
title: "${safeTitle.replace(/"/g, '\\"')}"
type: spark-draft
created: ${dateStr2}
source: "[[${dailyLink}]]"
tags:
  - inbox/spark-draft
---

# ${safeTitle}

${quoted}

## \u5C55\u5F00

## \u5173\u8054

`;
  await app.vault.create(path, body);
  return path;
}
async function appendSourceLinkToSpark(app, dailyPath, sparkLineText, linkTarget) {
  if (!dailyPath.startsWith(DAILYNOTE_PREFIX)) {
    throw new Error(`\u62D2\u7EDD\u5199\u5165 Dailynote \u4E4B\u5916\uFF1A${dailyPath}`);
  }
  if (/[\r\n\u0000]/.test(sparkLineText) || /[\r\n\u0000]/.test(linkTarget)) {
    throw new Error("\u6EAF\u6E90\u5199\u56DE\u5185\u5BB9\u4E0D\u80FD\u542B\u6362\u884C");
  }
  if (linkTarget.includes("]]")) {
    throw new Error("\u94FE\u63A5\u76EE\u6807\u975E\u6CD5");
  }
  const file = app.vault.getAbstractFileByPath(dailyPath);
  if (!(file instanceof import_obsidian2.TFile)) throw new Error(`Dailynote \u4E0D\u5B58\u5728\uFF1A${dailyPath}`);
  await app.vault.process(file, (data) => {
    const lines = data.split(/\r?\n/);
    const hits = [];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i] === sparkLineText) hits.push(i);
    }
    if (hits.length === 0) {
      throw new Error(`\u672A\u627E\u5230\u76EE\u6807 spark \u884C\uFF08\u53EF\u80FD\u5DF2\u88AB\u4FEE\u6539\uFF09
\u76EE\u6807\uFF1A${sparkLineText}`);
    }
    if (hits.length > 1) {
      throw new Error("\u76EE\u6807 spark \u884C\u4E0D\u552F\u4E00\uFF0C\u65E0\u6CD5\u5B89\u5168\u5199\u56DE");
    }
    lines[hits[0]] = `${sparkLineText} \u2192 [[${linkTarget}]]`;
    return lines.join("\n");
  });
}
function defaultDraftTitle(sparkText) {
  const cleaned = sparkText.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  return cleaned.slice(0, 12);
}

// src/sparks/draft-modal.ts
var import_obsidian3 = require("obsidian");
var DraftTitleModal = class extends import_obsidian3.Modal {
  constructor(app, initial, onConfirm) {
    super(app);
    this.initial = initial;
    this.onConfirm = onConfirm;
  }
  onOpen() {
    const { contentEl, titleEl } = this;
    titleEl.setText("\u8F6C\u4E3A\u8349\u7A3F\uFF1A\u547D\u540D");
    contentEl.empty();
    const input = contentEl.createEl("input", {
      cls: "kw-modal-input",
      attr: { type: "text", placeholder: "\u8349\u7A3F\u6807\u9898" }
    });
    input.value = this.initial;
    input.focus();
    input.select();
    const foot = contentEl.createDiv({ cls: "kw-modal-foot" });
    const btn = foot.createEl("button", { cls: "mod-cta", text: "\u521B\u5EFA" });
    const submit = async () => {
      const v = input.value.trim();
      if (!v) {
        new import_obsidian3.Notice("\u6807\u9898\u4E0D\u80FD\u4E3A\u7A7A");
        return;
      }
      try {
        await this.onConfirm(v);
        this.close();
      } catch (err) {
        new import_obsidian3.Notice(`\u521B\u5EFA\u5931\u8D25\uFF1A${err.message}`);
      }
    };
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        void submit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        this.close();
      }
    });
    btn.addEventListener("click", () => void submit());
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/sparks/search-modal.ts
var import_obsidian4 = require("obsidian");

// src/sparks/search.ts
var DAILYNOTE_DIR = "inbox/sparks/Dailynote/";
async function searchAllSparks(app, keyword) {
  const kw = keyword.replace(/[\u0000-\u001f\u007f]/g, "").trim().toLowerCase();
  if (!kw) return [];
  const files = app.vault.getMarkdownFiles().filter(
    (f) => f.path.startsWith(DAILYNOTE_DIR)
  );
  files.sort((a, b) => a.path < b.path ? 1 : a.path > b.path ? -1 : 0);
  const hits = [];
  for (const file of files) {
    const date = extractDate(file);
    const content = await app.vault.cachedRead(file);
    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const entry = parseSparkLine(lines[i]);
      if (!entry) continue;
      if (entry.text.toLowerCase().includes(kw)) {
        hits.push({
          filePath: file.path,
          line: i,
          date,
          time: entry.time,
          text: entry.text
        });
      }
    }
  }
  return hits;
}
function extractDate(file) {
  const m = /(\d{4}-\d{2}-\d{2})\.md$/i.exec(file.path);
  return m ? m[1] : file.basename;
}

// src/sparks/search-modal.ts
var SparkSearchModal = class extends import_obsidian4.SuggestModal {
  constructor(app) {
    super(app);
    this.setPlaceholder("\u641C\u7D22\u6240\u6709\u968F\u624B\u8BB0\u2026");
  }
  async getSuggestions(query) {
    return searchAllSparks(this.app, query);
  }
  renderSuggestion(hit, el) {
    const line1 = el.createDiv({ cls: "kw-spark-hit-line" });
    line1.createSpan({ cls: "kw-spark-hit-date", text: hit.date });
    line1.createSpan({ cls: "kw-spark-hit-time", text: hit.time });
    el.createDiv({ cls: "kw-spark-hit-text", text: hit.text });
  }
  async onChooseSuggestion(hit) {
    const file = this.app.vault.getAbstractFileByPath(hit.filePath);
    if (!(file instanceof import_obsidian4.TFile)) {
      new import_obsidian4.Notice(`\u6587\u4EF6\u4E0D\u5B58\u5728\uFF1A${hit.filePath}`);
      return;
    }
    const leaf = this.app.workspace.getLeaf(false);
    await leaf.openFile(file, {
      eState: { line: hit.line, mark: true }
    });
  }
};

// src/tasks/modals.ts
var import_obsidian6 = require("obsidian");

// src/tasks/writeback.ts
var import_obsidian5 = require("obsidian");

// src/tasks/parser.ts
var TASK_RE = /^([ \t]*)- \[( |x|X)\] (.*)$/;
var DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
var PRIO_MAP = { "\u23EB": "high", "\u{1F53C}": "medium", "\u{1F53D}": "low" };
var PRIO_EMOJI = { high: "\u23EB", medium: "\u{1F53C}", low: "\u{1F53D}" };
function parseTaskLine(line) {
  const m = TASK_RE.exec(line);
  if (!m) return null;
  const indent = m[1];
  const checked = m[2].toLowerCase() === "x";
  const body = m[3];
  const words = body.split(/\s+/).filter((w) => w.length > 0);
  const tokens = [];
  while (words.length > 0) {
    const last = words[words.length - 1];
    if (last in PRIO_MAP) {
      tokens.unshift({ kind: "priority", raw: last, value: PRIO_MAP[last] });
      words.pop();
      continue;
    }
    if (words.length >= 2 && DATE_RE.test(last)) {
      const prev = words[words.length - 2];
      if (prev === "\u{1F4C5}") {
        tokens.unshift({ kind: "due", raw: `\u{1F4C5} ${last}`, value: last });
        words.pop();
        words.pop();
        continue;
      }
      if (prev === "\u2705") {
        tokens.unshift({ kind: "completed", raw: `\u2705 ${last}`, value: last });
        words.pop();
        words.pop();
        continue;
      }
    }
    break;
  }
  return { indent, checked, text: words.join(" "), tokens };
}
function serializeTask(task) {
  const box = task.checked ? "x" : " ";
  const parts = [];
  if (task.text.length > 0) parts.push(task.text);
  for (const t of task.tokens) parts.push(t.raw);
  const tail = parts.length > 0 ? " " + parts.join(" ") : "";
  return `${task.indent}- [${box}]${tail}`;
}
function getDue(task) {
  const t = task.tokens.find((x) => x.kind === "due");
  return t ? t.value : null;
}
function getPriority(task) {
  const t = task.tokens.find((x) => x.kind === "priority");
  return t ? t.value : null;
}
function withCompleted(task, date) {
  const raw = `\u2705 ${date}`;
  const tokens = task.tokens.filter((t) => t.kind !== "completed");
  tokens.push({ kind: "completed", raw, value: date });
  return { ...task, checked: true, tokens };
}
function withDue(task, date) {
  if (date === null) {
    return { ...task, tokens: task.tokens.filter((t) => t.kind !== "due") };
  }
  const raw = `\u{1F4C5} ${date}`;
  const idx = task.tokens.findIndex((t) => t.kind === "due");
  const tokens = [...task.tokens];
  const newTok = { kind: "due", raw, value: date };
  if (idx >= 0) tokens[idx] = newTok;
  else tokens.push(newTok);
  return { ...task, tokens };
}
function withPriority(task, prio) {
  if (prio === null) {
    return { ...task, tokens: task.tokens.filter((t) => t.kind !== "priority") };
  }
  const raw = PRIO_EMOJI[prio];
  const idx = task.tokens.findIndex((t) => t.kind === "priority");
  const tokens = [...task.tokens];
  const newTok = { kind: "priority", raw, value: prio };
  if (idx >= 0) tokens[idx] = newTok;
  else tokens.push(newTok);
  return { ...task, tokens };
}
function withText(task, text) {
  return { ...task, text };
}

// src/tasks/writeback.ts
var TASKS_DIR = "inbox/tasks";
async function toggleTaskComplete(app, locator) {
  if (!locator.filePath.startsWith(TASKS_DIR + "/")) {
    throw new Error(`\u62D2\u7EDD\u5199\u5165 ${TASKS_DIR}/ \u4E4B\u5916\uFF1A${locator.filePath}`);
  }
  const file = app.vault.getAbstractFileByPath(locator.filePath);
  if (!(file instanceof import_obsidian5.TFile)) {
    throw new Error(`\u8BA1\u5212\u6587\u4EF6\u4E0D\u5B58\u5728\uFF1A${locator.filePath}`);
  }
  const today = todayDateStr();
  await app.vault.process(file, (data) => {
    const lines = data.split(/\r?\n/);
    let seen = 0;
    let hitIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i] === locator.lineText) {
        if (seen === locator.occurrence) {
          hitIndex = i;
          break;
        }
        seen++;
      }
    }
    if (hitIndex < 0) {
      throw new Error(
        `\u65E0\u6CD5\u552F\u4E00\u5B9A\u4F4D\u76EE\u6807\u884C\uFF08\u6587\u4EF6\u5DF2\u88AB\u4FEE\u6539\uFF1F\u8BF7\u624B\u52A8\u52FE\u9009\uFF09
\u76EE\u6807\uFF1A${locator.lineText}`
      );
    }
    const parsed = parseTaskLine(lines[hitIndex]);
    if (!parsed) throw new Error("\u76EE\u6807\u884C\u4E0D\u662F\u5408\u89C4\u4EFB\u52A1\u884C");
    if (parsed.checked) return data;
    lines[hitIndex] = serializeTask(withCompleted(parsed, today));
    return lines.join("\n");
  });
}
async function appendTaskToPlan(app, planPath, taskLine) {
  if (!planPath.startsWith(TASKS_DIR + "/")) {
    throw new Error(`\u8BA1\u5212\u6587\u4EF6\u5FC5\u987B\u5728 ${TASKS_DIR}/ \u4E0B`);
  }
  if (/[\r\n\u0000]/.test(taskLine)) {
    throw new Error("\u4EFB\u52A1\u5185\u5BB9\u4E0D\u80FD\u5305\u542B\u6362\u884C");
  }
  const file = app.vault.getAbstractFileByPath(planPath);
  if (!(file instanceof import_obsidian5.TFile)) throw new Error(`\u8BA1\u5212\u6587\u4EF6\u4E0D\u5B58\u5728\uFF1A${planPath}`);
  await app.vault.process(file, (data) => {
    const needsNl = data.length > 0 && !data.endsWith("\n");
    return data + (needsNl ? "\n" : "") + taskLine + "\n";
  });
}
async function createPlanFile(app, title) {
  const safeName = sanitizePlanFileName(title);
  const dir = app.vault.getAbstractFileByPath(TASKS_DIR);
  if (!dir) await app.vault.createFolder(TASKS_DIR);
  let path = (0, import_obsidian5.normalizePath)(`${TASKS_DIR}/${safeName}.md`);
  let n = 1;
  while (app.vault.getAbstractFileByPath(path)) {
    path = (0, import_obsidian5.normalizePath)(`${TASKS_DIR}/${safeName}-${n}.md`);
    n++;
  }
  if (!path.startsWith(TASKS_DIR + "/")) {
    throw new Error(`\u62D2\u7EDD\u521B\u5EFA\uFF1A\u8DEF\u5F84\u9003\u9038 ${path}`);
  }
  const today = todayDateStr();
  const body = `---
title: "${safeName.replace(/"/g, '\\"')}"
type: plan
status: active
created: ${today}
updated: ${today}
tags:
  - inbox/task
---

# ${safeName}

`;
  await app.vault.create(path, body);
  return path;
}
function reportWriteError(err) {
  const msg = err instanceof Error ? err.message : String(err);
  new import_obsidian5.Notice(`\u5199\u56DE\u5931\u8D25\uFF1A${msg}`, 6e3);
}
async function updateTaskLine(app, locator, newLineText) {
  if (!locator.filePath.startsWith(TASKS_DIR + "/")) {
    throw new Error(`\u62D2\u7EDD\u5199\u5165 ${TASKS_DIR}/ \u4E4B\u5916\uFF1A${locator.filePath}`);
  }
  if (/[\r\n\u0000]/.test(newLineText)) {
    throw new Error("\u4EFB\u52A1\u884C\u4E0D\u80FD\u5305\u542B\u6362\u884C");
  }
  const file = app.vault.getAbstractFileByPath(locator.filePath);
  if (!(file instanceof import_obsidian5.TFile)) {
    throw new Error(`\u8BA1\u5212\u6587\u4EF6\u4E0D\u5B58\u5728\uFF1A${locator.filePath}`);
  }
  await app.vault.process(file, (data) => {
    const lines = data.split(/\r?\n/);
    let seen = 0;
    let hitIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i] === locator.lineText) {
        if (seen === locator.occurrence) {
          hitIndex = i;
          break;
        }
        seen++;
      }
    }
    if (hitIndex < 0) {
      throw new Error(
        `\u65E0\u6CD5\u552F\u4E00\u5B9A\u4F4D\u76EE\u6807\u884C\uFF08\u6587\u4EF6\u5DF2\u88AB\u4FEE\u6539\uFF1F\u8BF7\u624B\u52A8\u7F16\u8F91\uFF09
\u76EE\u6807\uFF1A${locator.lineText}`
      );
    }
    if (!parseTaskLine(lines[hitIndex])) {
      throw new Error("\u76EE\u6807\u884C\u4E0D\u662F\u5408\u89C4\u4EFB\u52A1\u884C");
    }
    if (lines[hitIndex] === newLineText) return data;
    lines[hitIndex] = newLineText;
    return lines.join("\n");
  });
}

// src/tasks/plan.ts
var TASKS_DIR2 = "inbox/tasks/";
async function loadPlans(app) {
  const plans = [];
  for (const f of app.vault.getMarkdownFiles()) {
    if (!f.path.startsWith(TASKS_DIR2)) continue;
    const cache = app.metadataCache.getFileCache(f);
    const fm = cache?.frontmatter;
    if (!fm || fm.type !== "plan") continue;
    const rawStatus = String(fm.status ?? "active").toLowerCase();
    const status = rawStatus === "done" || rawStatus === "archived" ? rawStatus : "active";
    const title = f.basename;
    const content = await app.vault.cachedRead(f);
    const lines = content.split(/\r?\n/);
    const tasks = [];
    const occCount = /* @__PURE__ */ new Map();
    for (let i = 0; i < lines.length; i++) {
      const parsed = parseTaskLine(lines[i]);
      if (!parsed) continue;
      const rawLine = lines[i];
      const occ = occCount.get(rawLine) ?? 0;
      occCount.set(rawLine, occ + 1);
      tasks.push({
        planPath: f.path,
        planTitle: title,
        planStatus: status,
        lineNumber: i,
        parsed,
        locator: { filePath: f.path, lineText: rawLine, occurrence: occ }
      });
    }
    plans.push({ file: f, path: f.path, title, status, tasks });
  }
  plans.sort(
    (a, b) => a.title < b.title ? -1 : a.title > b.title ? 1 : 0
  );
  return plans;
}

// src/tasks/modals.ts
var NewPlanModal = class extends import_obsidian6.Modal {
  constructor(app, onCreated) {
    super(app);
    this.onCreated = onCreated;
  }
  onOpen() {
    const { contentEl, titleEl } = this;
    titleEl.setText("\u65B0\u5EFA\u8BA1\u5212");
    contentEl.empty();
    const input = contentEl.createEl("input", {
      cls: "kw-modal-input",
      attr: { type: "text", placeholder: "\u8BA1\u5212\u6807\u9898\uFF08\u5982\uFF1AQ3 \u76EE\u6807\uFF09" }
    });
    input.focus();
    const foot = contentEl.createDiv({ cls: "kw-modal-foot" });
    const btn = foot.createEl("button", {
      cls: "mod-cta",
      text: "\u521B\u5EFA"
    });
    const submit = async () => {
      const v = input.value.trim();
      if (!v) return;
      try {
        const path = await createPlanFile(this.app, v);
        new import_obsidian6.Notice(`\u5DF2\u521B\u5EFA ${path}`);
        this.close();
        const f = this.app.vault.getAbstractFileByPath(path);
        if (f instanceof import_obsidian6.TFile) {
          await this.app.workspace.getLeaf(false).openFile(f);
        }
        this.onCreated?.(path);
      } catch (err) {
        new import_obsidian6.Notice(`\u521B\u5EFA\u5931\u8D25\uFF1A${err.message}`);
      }
    };
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submit();
    });
    btn.addEventListener("click", submit);
  }
  onClose() {
    this.contentEl.empty();
  }
};
var QuickAddTaskModal = class extends import_obsidian6.Modal {
  constructor(app, opts) {
    super(app);
    this.plans = [];
    this.defaultPlanPath = opts?.defaultPlanPath;
    this.prefillText = opts?.prefillText;
    this.onAdded = opts?.onAdded;
  }
  async onOpen() {
    const { contentEl, titleEl } = this;
    titleEl.setText("\u5FEB\u901F\u6DFB\u52A0\u4EFB\u52A1");
    contentEl.empty();
    this.plans = (await loadPlans(this.app)).filter((p) => p.status === "active");
    if (this.plans.length === 0) {
      contentEl.createDiv({
        cls: "kw-empty",
        text: "\u5C1A\u65E0 active \u8BA1\u5212\u6587\u4EF6\uFF0C\u8BF7\u5148\u65B0\u5EFA\u4E00\u4E2A"
      });
      return;
    }
    const textInput = contentEl.createEl("input", {
      cls: "kw-modal-input",
      attr: { type: "text", placeholder: "\u4EFB\u52A1\u63CF\u8FF0" }
    });
    if (this.prefillText) textInput.value = this.prefillText;
    textInput.focus();
    if (this.prefillText) {
      textInput.setSelectionRange(this.prefillText.length, this.prefillText.length);
    }
    const row = contentEl.createDiv({ cls: "kw-modal-row" });
    const planSelect = row.createEl("select", { cls: "kw-modal-select" });
    for (const p of this.plans) {
      const opt = planSelect.createEl("option", { text: p.title });
      opt.value = p.path;
    }
    if (this.defaultPlanPath && this.plans.some((p) => p.path === this.defaultPlanPath)) {
      planSelect.value = this.defaultPlanPath;
    }
    const dateInput = row.createEl("input", {
      cls: "kw-modal-input",
      attr: { type: "date" }
    });
    const prioSelect = row.createEl("select", { cls: "kw-modal-select" });
    prioSelect.createEl("option", { text: "\u65E0\u4F18\u5148\u7EA7" }).value = "";
    prioSelect.createEl("option", { text: "\u23EB \u9AD8" }).value = "high";
    prioSelect.createEl("option", { text: "\u{1F53C} \u4E2D" }).value = "medium";
    prioSelect.createEl("option", { text: "\u{1F53D} \u4F4E" }).value = "low";
    const foot = contentEl.createDiv({ cls: "kw-modal-foot" });
    const btn = foot.createEl("button", { cls: "mod-cta", text: "\u6DFB\u52A0" });
    const submit = async () => {
      const text = textInput.value.replace(/[\r\n\t\u0000-\u001f]/g, " ").trim();
      if (!text) return;
      const planPath = planSelect.value;
      const parts = [`- [ ] ${text}`];
      const dateVal = dateInput.value;
      if (dateVal) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
          new import_obsidian6.Notice("\u65E5\u671F\u683C\u5F0F\u4E0D\u6B63\u786E");
          return;
        }
        parts.push(`\u{1F4C5} ${dateVal}`);
      }
      const prio = prioSelect.value;
      if (prio) parts.push(PRIO_EMOJI[prio]);
      const line = parts.join(" ");
      try {
        await appendTaskToPlan(this.app, planPath, line);
        new import_obsidian6.Notice(`\u5DF2\u8FFD\u52A0\u5230 ${planPath}`);
        this.close();
        if (this.onAdded) await this.onAdded(planPath, line);
      } catch (err) {
        new import_obsidian6.Notice(`\u8FFD\u52A0\u5931\u8D25\uFF1A${err.message}`);
      }
    };
    textInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submit();
    });
    btn.addEventListener("click", submit);
  }
  onClose() {
    this.contentEl.empty();
  }
};
var DatePickerModal = class extends import_obsidian6.Modal {
  constructor(app, initial, onPick) {
    super(app);
    this.initial = initial;
    this.onPick = onPick;
  }
  onOpen() {
    const { contentEl, titleEl } = this;
    titleEl.setText("\u9009\u62E9\u65E5\u671F");
    contentEl.empty();
    const input = contentEl.createEl("input", {
      cls: "kw-modal-input",
      attr: { type: "date" }
    });
    if (this.initial) input.value = this.initial;
    input.focus();
    const foot = contentEl.createDiv({ cls: "kw-modal-foot" });
    const btn = foot.createEl("button", { cls: "mod-cta", text: "\u786E\u5B9A" });
    const submit = () => {
      const v = input.value;
      if (!v) return;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) {
        new import_obsidian6.Notice("\u65E5\u671F\u683C\u5F0F\u4E0D\u6B63\u786E");
        return;
      }
      this.onPick(v);
      this.close();
    };
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submit();
    });
    btn.addEventListener("click", submit);
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/sparks/section.ts
var SparksSection = class {
  constructor(app, plugin, barContainer, panelContainer) {
    this.app = app;
    this.plugin = plugin;
    this.barContainer = barContainer;
    this.panelContainer = panelContainer;
    this.suppressNextRefresh = false;
    /** 侧边面板显示模式；session 内切换，不持久化 */
    this.mode = "default";
  }
  render() {
    this.renderBar();
    this.renderPanel();
    void this.refresh();
  }
  /** 输入框是否处于聚焦态——供 View 判断是否暂缓刷新 */
  isInputFocused() {
    return document.activeElement === this.inputEl;
  }
  /** 消费一次「自身写入抑制刷新」标志。返回 true 表示本次事件应被忽略 */
  consumeSuppressFlag() {
    if (this.suppressNextRefresh) {
      this.suppressNextRefresh = false;
      return true;
    }
    return false;
  }
  async refresh() {
    if (!this.listEl) return;
    const entries = await readTodaySparks(this.app);
    this.listEl.empty();
    if (entries.length === 0) {
      this.listEl.createDiv({ cls: "kw-empty", text: "\u4ECA\u65E5\u6682\u65E0\u968F\u624B\u8BB0" });
      return;
    }
    if (this.mode === "timeline") {
      this.listEl.addClass("is-timeline");
      entries.forEach((e) => this.renderSparkItem(
        e,
        /* timeline */
        true
      ));
    } else {
      this.listEl.removeClass("is-timeline");
      entries.slice(-5).reverse().forEach((e) => this.renderSparkItem(e, false));
    }
  }
  renderBar() {
    this.barContainer.empty();
    this.barContainer.addClass("kw-sparkbar");
    this.barContainer.createSpan({ cls: "kw-prefix", text: "\u26A1 \u968F\u624B\u8BB0" });
    this.inputEl = this.barContainer.createEl("input", {
      cls: "kw-spark-input",
      attr: { type: "text", placeholder: "\u56DE\u8F66\u5373\u5B58\u5230\u4ECA\u65E5 Dailynote\u2026" }
    });
    this.barContainer.createSpan({ cls: "kw-hint", text: "Enter" });
    this.inputEl.addEventListener("keydown", async (e) => {
      if (e.key !== "Enter") return;
      const v = this.inputEl.value.trim();
      if (!v) return;
      this.inputEl.value = "";
      try {
        this.suppressNextRefresh = true;
        const path = await appendSpark(this.app, v);
        new import_obsidian7.Notice(`\u5DF2\u8FFD\u52A0\u5230 ${path}`);
        await this.refresh();
      } catch (err) {
        this.suppressNextRefresh = false;
        new import_obsidian7.Notice(`\u4FDD\u5B58\u5931\u8D25\uFF1A${err.message}`);
      }
    });
  }
  renderPanel() {
    this.panelContainer.empty();
    this.panelContainer.addClass("kw-panel");
    this.panelContainer.addClass("kw-panel-sparks");
    const head = this.panelContainer.createDiv({ cls: "kw-panel-head" });
    head.createSpan({ text: "\u26A1 \u4ECA\u65E5\u968F\u624B\u8BB0" });
    head.createSpan({ cls: "kw-date", text: todayDateStr() });
    const search = head.createSpan({ cls: "kw-mode-toggle" });
    (0, import_obsidian7.setIcon)(search, "search");
    search.setAttr("title", "\u641C\u7D22\u6240\u6709\u968F\u624B\u8BB0");
    search.addEventListener("click", () => {
      new SparkSearchModal(this.app).open();
    });
    const toggle = head.createSpan({
      cls: "kw-mode-toggle" + (this.mode === "timeline" ? " is-active" : "")
    });
    (0, import_obsidian7.setIcon)(toggle, this.mode === "timeline" ? "list" : "clock");
    toggle.setAttr(
      "title",
      this.mode === "timeline" ? "\u5207\u56DE\u9ED8\u8BA4\u89C6\u56FE" : "\u5207\u6362\u5230\u65F6\u95F4\u8F74\uFF08\u5F53\u65E5\u5168\u90E8\uFF09"
    );
    toggle.addEventListener("click", () => {
      this.mode = this.mode === "timeline" ? "default" : "timeline";
      this.renderPanel();
      void this.refresh();
    });
    this.listEl = this.panelContainer.createDiv({
      cls: "kw-panel-body kw-spark-list"
    });
  }
  renderSparkItem(entry, timeline) {
    const el = this.listEl.createDiv({
      cls: "kw-spark-item" + (timeline ? " kw-spark-tl" : "")
    });
    el.createSpan({ cls: "kw-time", text: entry.time });
    el.createSpan({ cls: "kw-content", text: entry.text });
    el.addEventListener("click", async () => {
      const file = this.app.vault.getAbstractFileByPath(todaySparkPath());
      if (file instanceof import_obsidian7.TFile) {
        await this.app.workspace.getLeaf(false).openFile(file);
      }
    });
    const actions = el.createDiv({ cls: "kw-spark-actions" });
    const toTaskBtn = actions.createSpan({
      cls: "kw-spark-act",
      text: "\u2192\u4EFB\u52A1"
    });
    toTaskBtn.setAttr("title", "\u8F6C\u4E3A\u4EFB\u52A1");
    toTaskBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.onConvertToTask(entry);
    });
    if (!hasSourceLink(entry.text)) {
      const toDraftBtn = actions.createSpan({
        cls: "kw-spark-act",
        text: "\u2192\u8349\u7A3F"
      });
      toDraftBtn.setAttr("title", "\u8F6C\u4E3A\u8349\u7A3F");
      toDraftBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.onConvertToDraft(entry);
      });
    }
  }
  // ==================== 转换 ====================
  onConvertToTask(entry) {
    void this.plugin;
    new QuickAddTaskModal(this.app, {
      prefillText: entry.text
    }).open();
  }
  onConvertToDraft(entry) {
    const dailyPath = todaySparkPath();
    new DraftTitleModal(
      this.app,
      defaultDraftTitle(entry.text),
      async (title) => {
        const path = await convertSparkToDraft(
          this.app,
          entry.text,
          dailyPath,
          title
        );
        const link = path.replace(/\.md$/i, "");
        try {
          this.suppressNextRefresh = true;
          await appendSourceLinkToSpark(
            this.app,
            dailyPath,
            sparkEntryToLine(entry),
            link
          );
        } catch (err) {
          this.suppressNextRefresh = false;
          new import_obsidian7.Notice(
            `\u8349\u7A3F\u5DF2\u521B\u5EFA\u4F46\u6EAF\u6E90\u5199\u56DE\u5931\u8D25\uFF1A${err.message}`,
            6e3
          );
        }
        new import_obsidian7.Notice(`\u5DF2\u521B\u5EFA\u8349\u7A3F ${path}`);
        await this.refresh();
      }
    ).open();
  }
};

// src/matrix/section.ts
var import_obsidian8 = require("obsidian");

// src/matrix/providers.ts
var WIKI_TYPES = ["source", "entity", "concept", "comparison"];
var WIKI_TYPE_LABELS = {
  source: "Source",
  entity: "Entity",
  concept: "Concept",
  comparison: "Comparison"
};
function collectWikiFiles(app) {
  const recs = [];
  for (const f of app.vault.getMarkdownFiles()) {
    if (!f.path.startsWith("wiki/")) continue;
    const cache = app.metadataCache.getFileCache(f);
    const fm = cache?.frontmatter;
    if (!fm) continue;
    const t = String(fm.type ?? "").toLowerCase();
    if (!WIKI_TYPES.includes(t)) continue;
    let domains;
    const rawDomain = fm.domain;
    if (Array.isArray(rawDomain)) {
      domains = rawDomain.map((x) => String(x)).filter((s) => s.length > 0);
    } else if (typeof rawDomain === "string" && rawDomain.length > 0) {
      domains = [rawDomain];
    } else {
      domains = [];
    }
    if (domains.length === 0) domains = ["\u672A\u6807\u6CE8"];
    recs.push({
      path: f.path,
      name: f.name,
      mtime: f.stat.mtime,
      file: f,
      type: t,
      domains
    });
  }
  return recs;
}
function aggregateWikiMatrix(recs) {
  const cells = /* @__PURE__ */ new Map();
  const l1Set = /* @__PURE__ */ new Set();
  const childMap = /* @__PURE__ */ new Map();
  const hasExactL1 = /* @__PURE__ */ new Set();
  const pushCell = (key, rec) => {
    let c = cells.get(key);
    if (!c) {
      c = { key, label: key, files: [] };
      cells.set(key, c);
    }
    c.files.push({ path: rec.path, name: rec.name, mtime: rec.mtime, file: rec.file });
  };
  for (const r of recs) {
    for (const d of r.domains) {
      const parts = d.split("/");
      const l1 = parts[0];
      l1Set.add(l1);
      pushCell(`${d}|${r.type}`, r);
      if (parts.length >= 2) {
        const leafLabel = parts.slice(1).join("/");
        if (!childMap.has(l1)) childMap.set(l1, /* @__PURE__ */ new Map());
        childMap.get(l1).set(leafLabel, d);
      } else {
        hasExactL1.add(l1);
      }
    }
  }
  const children = /* @__PURE__ */ new Map();
  for (const l1 of l1Set) {
    const list = [];
    const leaves = childMap.get(l1);
    const hasChildren = !!leaves && leaves.size > 0;
    if (hasChildren) {
      const sorted = [...leaves.entries()].sort(
        (a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0
      );
      for (const [label, fullPath] of sorted) {
        list.push({ label, fullPath, isOther: false });
      }
      if (hasExactL1.has(l1)) {
        list.push({ label: "\u5176\u4ED6", fullPath: l1, isOther: true });
      }
      for (const t of WIKI_TYPES) {
        const files = [];
        for (const kid of list) {
          const c = cells.get(`${kid.fullPath}|${t}`);
          if (c) files.push(...c.files);
        }
        if (files.length > 0) {
          const key = `__L1__|${l1}|${t}`;
          cells.set(key, { key, label: key, files });
        }
      }
    }
    children.set(l1, list);
  }
  const l1Domains = [...l1Set].sort((a, b) => {
    if (a === "\u672A\u6807\u6CE8") return 1;
    if (b === "\u672A\u6807\u6CE8") return -1;
    return a < b ? -1 : a > b ? 1 : 0;
  });
  return { l1Domains, children, cells };
}
function aggregateDirTree(files, root) {
  const prefix = root.endsWith("/") ? root : root + "/";
  const byL1 = /* @__PURE__ */ new Map();
  const uncategorized = [];
  for (const f of files) {
    if (!f.path.startsWith(prefix)) continue;
    const rest = f.path.slice(prefix.length);
    const parts = rest.split("/");
    const rec = { path: f.path, name: f.name, mtime: f.stat.mtime, file: f };
    if (parts.length === 1) {
      uncategorized.push(rec);
      continue;
    }
    const l1 = parts[0];
    let entry = byL1.get(l1);
    if (!entry) {
      entry = {
        cell: { key: l1, label: l1, files: [] },
        subdirs: /* @__PURE__ */ new Map()
      };
      byL1.set(l1, entry);
    }
    entry.cell.files.push(rec);
    if (parts.length >= 3) {
      const l2 = parts[1];
      let sub = entry.subdirs.get(l2);
      if (!sub) {
        sub = { key: `${l1}/${l2}`, label: l2, files: [] };
        entry.subdirs.set(l2, sub);
      }
      sub.files.push(rec);
    }
  }
  const entries = [...byL1.values()].sort(
    (a, b) => a.cell.label < b.cell.label ? -1 : a.cell.label > b.cell.label ? 1 : 0
  );
  const cells = [];
  for (const e of entries) {
    if (e.subdirs.size > 0) {
      e.cell.subdirs = [...e.subdirs.values()].sort(
        (a, b) => a.label < b.label ? -1 : a.label > b.label ? 1 : 0
      );
    }
    cells.push(e.cell);
  }
  if (uncategorized.length > 0) {
    cells.push({ key: "__uncategorized__", label: "\u672A\u5206\u7C7B", files: uncategorized });
  }
  return cells;
}
function latestMtimeOf(files) {
  let m = 0;
  for (const f of files) if (f.mtime > m) m = f.mtime;
  return m;
}
function latestMtime(cell) {
  return latestMtimeOf(cell.files);
}

// src/matrix/section.ts
var FILE_LIST_LIMIT = 50;
var MatrixSection = class {
  constructor(app, plugin, container) {
    this.app = app;
    this.plugin = plugin;
    this.container = container;
    this.state = {
      tab: "wiki",
      selectedL1: null,
      selectedL2: null,
      filter: ""
    };
    this.filterInputEl = null;
    this.bodyEl = null;
    this.listEl = null;
    this.splitTopEl = null;
    this.splitBottomEl = null;
    /** 拖拽保存的上区（矩阵）像素高度；null = 默认 50% */
    this.topPaneHeight = null;
    /** 两区各自的滚动位置（重渲染前后保持） */
    this.topScroll = 0;
    this.bottomScroll = 0;
    /** wiki 页签下的一级领域展开态（session 内，不持久化） */
    this.expandedL1 = /* @__PURE__ */ new Set();
  }
  hasFocus() {
    return document.activeElement === this.filterInputEl;
  }
  render() {
    if (this.splitTopEl) this.topScroll = this.splitTopEl.scrollTop;
    if (this.splitBottomEl) this.bottomScroll = this.splitBottomEl.scrollTop;
    const filterWasFocused = this.hasFocus();
    this.container.empty();
    this.container.addClass("kw-matrix");
    const tabs = this.container.createDiv({ cls: "kw-tabs" });
    ["wiki", "raw", "output"].forEach((t) => {
      const el = tabs.createDiv({
        cls: "kw-tab" + (this.state.tab === t ? " active" : ""),
        text: t
      });
      el.addEventListener("click", () => {
        if (this.state.tab === t) return;
        this.state.tab = t;
        this.state.selectedL1 = null;
        this.state.selectedL2 = null;
        this.state.filter = "";
        this.topScroll = 0;
        this.bottomScroll = 0;
        this.render();
      });
    });
    this.renderPinRow();
    this.bodyEl = this.container.createDiv({ cls: "kw-matrix-body" });
    const filterBox = this.bodyEl.createDiv({ cls: "kw-filter" });
    filterBox.createSpan({ cls: "kw-filter-icon", text: "\u{1F50D}" });
    this.filterInputEl = filterBox.createEl("input", {
      cls: "kw-matrix-filter",
      attr: {
        type: "text",
        placeholder: "\u8FC7\u6EE4\u5F53\u524D\u9009\u4E2D\u533A\u5757\u7684\u6587\u4EF6\u540D\uFF08fuzzy\uFF09\u2026"
      }
    });
    this.filterInputEl.value = this.state.filter;
    this.filterInputEl.addEventListener("input", () => {
      this.state.filter = this.filterInputEl.value;
      this.renderFileList();
    });
    if (filterWasFocused) this.filterInputEl.focus();
    const split = this.bodyEl.createDiv({ cls: "kw-split" });
    this.splitTopEl = split.createDiv({ cls: "kw-split-top" });
    this.splitTopEl.addEventListener("scroll", () => {
      if (this.splitTopEl) this.topScroll = this.splitTopEl.scrollTop;
    });
    if (this.state.tab === "wiki") this.renderWikiGrid(this.splitTopEl);
    else this.renderDirSection(this.splitTopEl, this.state.tab);
    if (this.state.selectedL1) {
      const divider = split.createDiv({ cls: "kw-split-divider" });
      divider.setAttr("aria-label", "\u62D6\u52A8\u8C03\u6574\u4E0A\u4E0B\u533A\u9AD8\u5EA6");
      this.attachDividerDrag(split, divider);
      this.splitBottomEl = split.createDiv({ cls: "kw-split-bottom" });
      this.splitBottomEl.addEventListener("scroll", () => {
        if (this.splitBottomEl) this.bottomScroll = this.splitBottomEl.scrollTop;
      });
      if (this.topPaneHeight !== null) {
        this.splitTopEl.style.height = `${this.topPaneHeight}px`;
        this.splitTopEl.style.flex = "0 0 auto";
      }
      this.renderFileList();
    } else {
      this.splitBottomEl = null;
      this.splitTopEl.style.flex = "1 1 auto";
      this.splitTopEl.style.height = "";
    }
    const savedTop = this.topScroll;
    const savedBottom = this.bottomScroll;
    window.requestAnimationFrame(() => {
      if (this.splitTopEl && savedTop > 0) this.splitTopEl.scrollTop = savedTop;
      if (this.splitBottomEl && savedBottom > 0) this.splitBottomEl.scrollTop = savedBottom;
    });
  }
  /** divider 拖拽：更新上区像素高度并 clamp */
  attachDividerDrag(split, divider) {
    divider.addEventListener("mousedown", (e) => {
      e.preventDefault();
      const startY = e.clientY;
      const rect = split.getBoundingClientRect();
      const startTopH = this.splitTopEl?.offsetHeight ?? rect.height / 2;
      const minPx = 80;
      const maxPx = rect.height - 80;
      const onMove = (ev) => {
        let h = startTopH + (ev.clientY - startY);
        if (h < minPx) h = minPx;
        if (h > maxPx) h = maxPx;
        this.topPaneHeight = h;
        if (this.splitTopEl) {
          this.splitTopEl.style.height = `${h}px`;
          this.splitTopEl.style.flex = "0 0 auto";
        }
      };
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
      document.body.style.cursor = "row-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });
  }
  // ==================== wiki ====================
  renderWikiGrid(host) {
    const recs = collectWikiFiles(this.app);
    const { l1Domains, children, cells } = aggregateWikiMatrix(recs);
    const grid = host.createDiv({ cls: "kw-wiki-grid" });
    grid.createDiv({ cls: "kw-grid-corner" });
    for (const t of WIKI_TYPES) {
      grid.createDiv({ cls: "kw-grid-colhead", text: WIKI_TYPE_LABELS[t] });
    }
    if (l1Domains.length === 0) {
      host.createDiv({
        cls: "kw-empty",
        text: "wiki/ \u4E0B\u6CA1\u6709\u7B26\u5408 type \u7684\u9875\u9762\uFF08source/entity/concept/comparison\uFF09"
      });
      return;
    }
    for (const l1 of l1Domains) {
      const kids = children.get(l1) ?? [];
      const hasChildren = kids.length > 0;
      const expanded = hasChildren && this.expandedL1.has(l1);
      const head = grid.createDiv({
        cls: "kw-grid-rowhead kw-grid-rowhead-l1" + (hasChildren ? " is-expandable" : "")
      });
      if (hasChildren) {
        head.createSpan({ cls: "kw-caret", text: expanded ? "\u25BC" : "\u25B6" });
      } else {
        head.createSpan({ cls: "kw-caret kw-caret-placeholder", text: "" });
      }
      head.createSpan({ cls: "kw-l1-name", text: l1 });
      if (hasChildren) {
        head.addEventListener("click", () => {
          if (expanded) this.expandedL1.delete(l1);
          else this.expandedL1.add(l1);
          this.render();
        });
      }
      for (const t of WIKI_TYPES) {
        const cellKey = hasChildren ? `__L1__|${l1}|${t}` : `${l1}|${t}`;
        this.renderMatrixCell(grid, cellKey, cells.get(cellKey));
      }
      if (expanded) {
        for (const kid of kids) {
          grid.createDiv({
            cls: "kw-grid-rowhead kw-grid-rowhead-l2" + (kid.isOther ? " is-other" : ""),
            text: kid.label
          });
          for (const t of WIKI_TYPES) {
            const cellKey = `${kid.fullPath}|${t}`;
            this.renderMatrixCell(grid, cellKey, cells.get(cellKey));
          }
        }
      }
    }
  }
  renderMatrixCell(grid, key, cell) {
    const isEmpty = !cell || cell.files.length === 0;
    const active = this.state.selectedL1 === key;
    const el = grid.createDiv({
      cls: "kw-cell" + (isEmpty ? " empty" : "") + (active ? " active" : "")
    });
    el.createDiv({ cls: "kw-cell-n", text: isEmpty ? "\u2014" : String(cell.files.length) });
    if (!isEmpty && cell) {
      el.createDiv({ cls: "kw-cell-sub", text: `\u6700\u65B0 ${fmtDate(latestMtime(cell))}` });
      el.addEventListener("click", () => this.toggleL1(key));
    }
  }
  // ==================== raw / output ====================
  renderDirSection(host, root) {
    const cells = aggregateDirTree(this.app.vault.getFiles(), root);
    if (cells.length === 0) {
      host.createDiv({ cls: "kw-empty", text: `${root}/ \u4E0B\u6CA1\u6709\u6587\u4EF6` });
      return;
    }
    const grid = host.createDiv({ cls: "kw-dir-grid" });
    let selectedCell;
    for (const cell of cells) {
      const active = this.state.selectedL1 === cell.key;
      if (active) selectedCell = cell;
      const el = grid.createDiv({ cls: "kw-dir-cell" + (active ? " active" : "") });
      el.createDiv({ cls: "kw-dir-name", text: cell.label });
      const meta = el.createDiv({ cls: "kw-dir-meta" });
      meta.createSpan({ text: `${cell.files.length} \u9879` });
      meta.createSpan({ text: fmtDate(latestMtime(cell)) });
      el.addEventListener("click", () => this.toggleL1(cell.key));
    }
    if (selectedCell?.subdirs && selectedCell.subdirs.length > 0) {
      const strip = host.createDiv({ cls: "kw-subdir-strip" });
      strip.createDiv({
        cls: "kw-subdir-label",
        text: `\u2514 ${selectedCell.label} \u7684\u5B50\u76EE\u5F55`
      });
      const stripBody = strip.createDiv({ cls: "kw-subdir-body" });
      for (const sub of selectedCell.subdirs) {
        this.renderSubdirCell(stripBody, sub);
      }
    }
  }
  renderSubdirCell(host, sub) {
    const active = this.state.selectedL2 === sub.key;
    const el = host.createDiv({ cls: "kw-subdir-cell" + (active ? " active" : "") });
    el.createDiv({ cls: "kw-subdir-name", text: sub.label });
    const meta = el.createDiv({ cls: "kw-subdir-meta" });
    meta.createSpan({ text: `${sub.files.length}` });
    meta.createSpan({ text: fmtDate(latestMtimeOf(sub.files)) });
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleL2(sub.key);
    });
  }
  // ==================== 选中态切换 ====================
  toggleL1(key) {
    if (this.state.selectedL1 === key) {
      this.state.selectedL1 = null;
      this.state.selectedL2 = null;
    } else {
      this.state.selectedL1 = key;
      this.state.selectedL2 = null;
    }
    this.render();
  }
  toggleL2(key) {
    this.state.selectedL2 = this.state.selectedL2 === key ? null : key;
    this.render();
  }
  // ==================== pin 行 ====================
  renderPinRow() {
    const pinned = this.plugin.settings.pinnedFiles;
    if (pinned.length === 0) return;
    const row = this.container.createDiv({ cls: "kw-pin-row" });
    row.createSpan({ cls: "kw-pin-label", text: "\u{1F4CC}" });
    const list = row.createDiv({ cls: "kw-pin-list" });
    for (const path of pinned) {
      const abs = this.app.vault.getAbstractFileByPath(path);
      const stale = !(abs instanceof import_obsidian8.TFile);
      const chip = list.createSpan({
        cls: "kw-chip kw-pin-chip" + (stale ? " is-stale" : ""),
        text: displayName(path)
      });
      chip.setAttr("title", stale ? `\u5DF2\u5931\u6548\uFF1A${path}` : path);
      chip.addEventListener("click", () => {
        if (stale) {
          new import_obsidian8.Notice(`\u6587\u4EF6\u5DF2\u5931\u6548\uFF1A${path}`);
          return;
        }
        if (abs instanceof import_obsidian8.TFile) {
          this.app.workspace.getLeaf(false).openFile(abs);
        }
      });
      chip.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        const menu = new import_obsidian8.Menu();
        menu.addItem(
          (it) => it.setTitle("\u53D6\u6D88 pin").setIcon("pin-off").onClick(async () => {
            await this.togglePin(path);
          })
        );
        menu.showAtMouseEvent(e);
      });
    }
  }
  async togglePin(path) {
    const arr = this.plugin.settings.pinnedFiles;
    const idx = arr.indexOf(path);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push(path);
    await this.plugin.saveSettings();
    this.render();
  }
  // ==================== 文件列表 ====================
  currentCellFiles() {
    const l1 = this.state.selectedL1;
    if (!l1) return [];
    if (this.state.tab === "wiki") {
      const { cells: cells2 } = aggregateWikiMatrix(collectWikiFiles(this.app));
      const cell2 = cells2.get(l1);
      return cell2 ? sortMtimeDesc(cell2.files) : [];
    }
    const cells = aggregateDirTree(this.app.vault.getFiles(), this.state.tab);
    const cell = cells.find((c) => c.key === l1);
    if (!cell) return [];
    if (this.state.selectedL2) {
      const sub = cell.subdirs?.find((s) => s.key === this.state.selectedL2);
      if (sub) return sortMtimeDesc(sub.files);
    }
    return sortMtimeDesc(cell.files);
  }
  renderFileList() {
    this.listEl?.remove();
    this.listEl = null;
    const host = this.splitBottomEl;
    if (!host) return;
    if (!this.state.selectedL1) return;
    const files = this.currentCellFiles();
    const filtered = this.applyFilter(files);
    const list = host.createDiv({ cls: "kw-file-list" });
    this.listEl = list;
    const title = list.createDiv({ cls: "kw-file-list-title" });
    title.createSpan({
      text: `${filtered.length}${filtered.length !== files.length ? ` / ${files.length}` : ""} \u4E2A\u6587\u4EF6${this.state.selectedL2 ? "\uFF08\u5B50\u76EE\u5F55\uFF09" : ""}`
    });
    const closeBtn = title.createSpan({ cls: "kw-file-list-close", text: "\xD7" });
    closeBtn.setAttr("aria-label", "\u5173\u95ED\u5217\u8868");
    closeBtn.addEventListener("click", () => {
      this.state.selectedL1 = null;
      this.state.selectedL2 = null;
      this.render();
    });
    if (filtered.length === 0) {
      list.createDiv({ cls: "kw-empty", text: "\u6CA1\u6709\u5339\u914D\u9879" });
      return;
    }
    for (const f of filtered.slice(0, FILE_LIST_LIMIT)) {
      const item = list.createDiv({ cls: "kw-file-item" });
      item.createSpan({ cls: "kw-file-name", text: f.name });
      item.createSpan({ cls: "kw-file-mtime", text: fmtDate(f.mtime) });
      const isPinned = this.plugin.settings.pinnedFiles.includes(f.path);
      const pinBtn = item.createSpan({
        cls: "kw-pin-btn" + (isPinned ? " is-pinned" : ""),
        text: "\u{1F4CC}"
      });
      pinBtn.setAttr("aria-label", isPinned ? "\u53D6\u6D88 pin" : "pin \u5230\u77E9\u9635\u9876\u90E8");
      pinBtn.setAttr("title", isPinned ? "\u53D6\u6D88 pin" : "pin \u5230\u77E9\u9635\u9876\u90E8");
      pinBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        await this.togglePin(f.path);
      });
      item.setAttr("title", f.path);
      item.addEventListener("click", () => {
        this.app.workspace.getLeaf(true).openFile(f.file);
      });
    }
    if (filtered.length > FILE_LIST_LIMIT) {
      list.createDiv({
        cls: "kw-empty",
        text: `\u22EF \u8FD8\u6709 ${filtered.length - FILE_LIST_LIMIT} \u4E2A\uFF0C\u7528\u8FC7\u6EE4\u6846\u7F29\u5C0F\u8303\u56F4`
      });
    }
  }
  applyFilter(files) {
    const q = this.state.filter.trim();
    if (!q) return files;
    const search = (0, import_obsidian8.prepareFuzzySearch)(q);
    const scored = [];
    for (const f of files) {
      const m = search(f.path);
      if (m) scored.push({ rec: f, score: m.score });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.map((s) => s.rec);
  }
};
function sortMtimeDesc(files) {
  return [...files].sort((a, b) => b.mtime - a.mtime);
}
function fmtDate(ms) {
  if (!ms) return "\u2014";
  const d = new Date(ms);
  const p = (n) => n.toString().padStart(2, "0");
  return `${d.getFullYear().toString().slice(2)}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function displayName(path) {
  const base = path.split("/").pop() ?? path;
  return base.replace(/\.md$/i, "");
}

// src/matrix/recent.ts
var import_obsidian9 = require("obsidian");
function renderRecent(app, container) {
  container.empty();
  container.addClass("kw-recent");
  container.createSpan({ cls: "kw-recent-label", text: "\u6700\u8FD1" });
  const paths = app.workspace.getLastOpenFiles().slice(0, 10);
  if (paths.length === 0) {
    container.createSpan({ cls: "kw-recent-empty", text: "\u65E0\u6700\u8FD1\u6587\u4EF6" });
    return;
  }
  for (const p of paths) {
    const name = p.split("/").pop() || p;
    const chip = container.createSpan({ cls: "kw-chip", text: displayName2(name) });
    chip.setAttr("title", p);
    chip.addEventListener("click", () => {
      const f = app.vault.getAbstractFileByPath(p);
      if (f instanceof import_obsidian9.TFile) {
        app.workspace.getLeaf(false).openFile(f);
      }
    });
  }
}
function displayName2(name) {
  return name.endsWith(".md") ? name.slice(0, -3) : name;
}

// src/tasks/section.ts
var import_obsidian10 = require("obsidian");

// src/tasks/groups.ts
var p22 = (n) => n.toString().padStart(2, "0");
function dateStr(d) {
  return `${d.getFullYear()}-${p22(d.getMonth() + 1)}-${p22(d.getDate())}`;
}
function addDays(base, n) {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  d.setDate(d.getDate() + n);
  return d;
}
function isoWeekKey(d) {
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 864e5 + 1) / 7);
  return `${tmp.getUTCFullYear()}-W${p22(weekNo)}`;
}
function weekdayLabel(d) {
  return ["\u5468\u65E5", "\u5468\u4E00", "\u5468\u4E8C", "\u5468\u4E09", "\u5468\u56DB", "\u5468\u4E94", "\u5468\u516D"][d.getDay()];
}
function buildTodayGroups(plans, today) {
  const overdue = [];
  const todayItems = [];
  const unscheduled = [];
  for (const p of plans) {
    if (p.status !== "active") continue;
    for (const t of p.tasks) {
      if (t.parsed.checked) continue;
      const due = getDue(t.parsed);
      if (!due) {
        unscheduled.push(t);
        continue;
      }
      if (due < today) overdue.push(t);
      else if (due === today) todayItems.push(t);
    }
  }
  overdue.sort((a, b) => cmpStr(getDue(a.parsed), getDue(b.parsed)));
  const groups = [];
  if (overdue.length > 0) {
    groups.push({
      key: "overdue",
      label: "\u8FC7\u671F",
      summary: String(overdue.length),
      tasks: overdue,
      collapsed: false
    });
  }
  groups.push({
    key: "today",
    label: "\u4ECA\u5929",
    summary: String(todayItems.length),
    tasks: todayItems,
    collapsed: false
  });
  if (unscheduled.length > 0) {
    groups.push({
      key: "unscheduled",
      label: "\u672A\u6392\u671F",
      summary: String(unscheduled.length),
      tasks: unscheduled,
      collapsed: true
      // 默认折叠，防黑洞
    });
  }
  return groups;
}
function buildUpcomingGroups(plans, todayDate) {
  const today = dateStr(todayDate);
  const dayLimit = dateStr(addDays(todayDate, 7));
  const perDay = /* @__PURE__ */ new Map();
  const perWeek = /* @__PURE__ */ new Map();
  for (const p of plans) {
    if (p.status !== "active") continue;
    for (const t of p.tasks) {
      if (t.parsed.checked) continue;
      const due = getDue(t.parsed);
      if (!due) continue;
      if (due <= today) continue;
      if (due <= dayLimit) {
        pushMap(perDay, due, t);
      } else {
        const wk = isoWeekKey(parseDate(due));
        pushMap(perWeek, wk, t);
      }
    }
  }
  const groups = [];
  for (let i = 1; i <= 7; i++) {
    const d = addDays(todayDate, i);
    const key = dateStr(d);
    const items = perDay.get(key);
    if (!items || items.length === 0) continue;
    items.sort((a, b) => cmpTaskInGroup(a, b));
    const label = i === 1 ? `\u660E\u5929 \xB7 ${key}` : `${key} \xB7 ${weekdayLabel(d)}`;
    groups.push({
      key: `day-${key}`,
      label,
      summary: String(items.length),
      tasks: items,
      collapsed: false
    });
  }
  const weekKeys = [...perWeek.keys()].sort();
  for (const wk of weekKeys) {
    const items = perWeek.get(wk);
    items.sort((a, b) => cmpStr(getDue(a.parsed), getDue(b.parsed)));
    groups.push({
      key: `week-${wk}`,
      label: `\u7B2C ${wk} \u5468`,
      summary: String(items.length),
      tasks: items,
      collapsed: false
    });
  }
  return groups;
}
function buildAllGroups(plans) {
  const groups = [];
  for (const p of plans) {
    const unchecked = p.tasks.filter((t) => !t.parsed.checked).length;
    const total = p.tasks.length;
    const suffix = p.status === "active" ? "" : ` [${p.status}]`;
    groups.push({
      key: `plan-${p.path}`,
      label: `${p.title}${suffix}`,
      summary: `${unchecked}/${total}`,
      tasks: p.tasks,
      collapsed: p.status !== "active"
      // 非 active 默认折叠
    });
  }
  return groups;
}
function cmpStr(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}
function cmpTaskInGroup(a, b) {
  const c = cmpStr(a.planTitle, b.planTitle);
  return c !== 0 ? c : a.lineNumber - b.lineNumber;
}
function pushMap(m, k, v) {
  const arr = m.get(k);
  if (arr) arr.push(v);
  else m.set(k, [v]);
}
function parseDate(s) {
  const [y, mo, d] = s.split("-").map((x) => parseInt(x, 10));
  return new Date(y, mo - 1, d);
}

// src/tasks/section.ts
var TasksSection = class {
  constructor(app, plugin, container) {
    this.plans = [];
    /** 插件自身刚发起的写回，忽略下一次外部 refresh 触发 */
    this.suppressRefresh = false;
    /** 已初始化过组的折叠默认（用于第一次渲染时应用 group.collapsed） */
    this.initedGroups = /* @__PURE__ */ new Set();
    this.app = app;
    this.plugin = plugin;
    this.root = container;
    this.root.addClass("kw-panel");
    this.root.addClass("kw-panel-tasks");
    const now = /* @__PURE__ */ new Date();
    this.state = {
      viewport: plugin.settings.defaultViewport,
      collapsed: /* @__PURE__ */ new Set(),
      scrollTop: 0,
      calYear: now.getFullYear(),
      calMonth: now.getMonth(),
      selectedDate: null
    };
  }
  /** 是否由插件自身写入触发的 vault 事件——若是，跳过刷新 */
  consumeSelfWriteFlag() {
    if (this.suppressRefresh) {
      this.suppressRefresh = false;
      return true;
    }
    return false;
  }
  async render() {
    const body = this.root.querySelector(".kw-panel-body");
    if (body) this.state.scrollTop = body.scrollTop;
    this.plans = await loadPlans(this.app);
    this.root.empty();
    this.renderHead();
    this.renderBody();
  }
  renderHead() {
    const head = this.root.createDiv({ cls: "kw-panel-head kw-tasks-head" });
    head.createSpan({ cls: "kw-tasks-title", text: "\u{1F4CB} \u4EFB\u52A1" });
    const tabs = head.createDiv({ cls: "kw-tasks-tabs" });
    const mk = (key, label) => {
      const el = tabs.createSpan({ cls: "kw-tasks-tab", text: label });
      if (this.state.viewport === key) el.addClass("active");
      el.addEventListener("click", () => {
        if (this.state.viewport === key) return;
        this.state.viewport = key;
        this.render();
      });
    };
    mk("today", "\u4ECA\u5929");
    mk("upcoming", "\u8BA1\u5212");
    mk("all", "\u5168\u90E8");
    mk("calendar", "\u65E5\u5386");
    const actions = head.createDiv({ cls: "kw-tasks-actions" });
    const addBtn = actions.createSpan({ cls: "kw-tasks-btn", text: "+ \u4EFB\u52A1" });
    addBtn.setAttribute("aria-label", "\u5FEB\u901F\u6DFB\u52A0\u4EFB\u52A1");
    addBtn.addEventListener("click", () => {
      new QuickAddTaskModal(this.app).open();
    });
    const newPlanBtn = actions.createSpan({ cls: "kw-tasks-btn", text: "+ \u8BA1\u5212" });
    newPlanBtn.setAttribute("aria-label", "\u65B0\u5EFA\u8BA1\u5212");
    newPlanBtn.addEventListener("click", () => {
      new NewPlanModal(this.app).open();
    });
  }
  renderBody() {
    const body = this.root.createDiv({ cls: "kw-panel-body kw-tasks-body" });
    if (this.state.viewport === "calendar") {
      this.renderCalendar(body);
      requestAnimationFrame(() => body.scrollTop = this.state.scrollTop);
      return;
    }
    let groups;
    if (this.state.viewport === "today") {
      groups = buildTodayGroups(this.plans, todayDateStr());
    } else if (this.state.viewport === "upcoming") {
      groups = buildUpcomingGroups(this.plans, /* @__PURE__ */ new Date());
    } else {
      groups = buildAllGroups(this.plans);
      if (this.plugin.settings.hideCompleted) {
        for (const g of groups) {
          g.tasks = g.tasks.filter((t) => !t.parsed.checked);
          g.summary = String(g.tasks.length);
        }
      }
    }
    if (groups.every((g) => g.tasks.length === 0)) {
      body.createDiv({ cls: "kw-empty", text: this.emptyHint() });
      return;
    }
    for (const g of groups) {
      this.renderGroup(body, g);
    }
    requestAnimationFrame(() => {
      body.scrollTop = this.state.scrollTop;
    });
  }
  emptyHint() {
    switch (this.state.viewport) {
      case "today":
        return "\u4ECA\u5929\u6CA1\u6709\u5F85\u529E \u2728";
      case "upcoming":
        return "\u8FD1\u671F\u65E0\u6392\u671F\u4EFB\u52A1";
      case "all":
        if (this.plans.length === 0) return "\u5C1A\u65E0\u8BA1\u5212\u6587\u4EF6\uFF0C\u70B9\u51FB\u53F3\u4E0A\u300C+ \u8BA1\u5212\u300D\u65B0\u5EFA";
        if (this.plugin.settings.hideCompleted)
          return "\u6240\u6709\u4EFB\u52A1\u5DF2\u5B8C\u6210 \u{1F389}\uFF08\u5728\u8BBE\u7F6E\u4E2D\u5173\u95ED\u300C\u9690\u85CF\u5DF2\u5B8C\u6210\u300D\u53EF\u67E5\u770B\uFF09";
        return "\u6240\u6709\u8BA1\u5212\u90FD\u662F\u7A7A\u7684\uFF0C\u70B9\u51FB\u53F3\u4E0A\u300C+ \u4EFB\u52A1\u300D\u6DFB\u52A0";
      case "calendar":
        return "";
    }
  }
  renderGroup(parent, g) {
    if (!this.initedGroups.has(g.key)) {
      this.initedGroups.add(g.key);
      if (g.collapsed) this.state.collapsed.add(g.key);
    }
    const collapsed = this.state.collapsed.has(g.key);
    const wrap = parent.createDiv({ cls: "kw-task-group" });
    if (g.key === "overdue") wrap.addClass("is-overdue");
    const head = wrap.createDiv({ cls: "kw-task-group-head" });
    head.createSpan({ cls: "kw-task-caret", text: collapsed ? "\u25B8" : "\u25BE" });
    head.createSpan({ cls: "kw-task-group-label", text: g.label });
    head.createSpan({ cls: "kw-task-group-count", text: g.summary });
    head.addEventListener("click", () => {
      if (collapsed) this.state.collapsed.delete(g.key);
      else this.state.collapsed.add(g.key);
      this.render();
    });
    if (collapsed) return;
    const list = wrap.createDiv({ cls: "kw-task-list" });
    if (g.tasks.length === 0) {
      list.createDiv({ cls: "kw-empty", text: "\u65E0" });
      return;
    }
    for (const t of g.tasks) this.renderTask(list, t, g.key);
  }
  renderTask(parent, t, groupKey) {
    const row = parent.createDiv({ cls: "kw-task-row" });
    row.dataset.groupKey = groupKey;
    if (t.parsed.checked) row.addClass("is-checked");
    const box = row.createEl("input", {
      attr: { type: "checkbox" },
      cls: "kw-task-check"
    });
    box.checked = t.parsed.checked;
    box.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (t.parsed.checked) {
        box.checked = true;
        new import_obsidian10.Notice("\u5DF2\u5B8C\u6210\u4EFB\u52A1\u4E0D\u652F\u6301\u5728\u5DE5\u4F5C\u53F0\u53D6\u6D88\u52FE\u9009");
        return;
      }
      try {
        this.suppressRefresh = true;
        await toggleTaskComplete(this.app, t.locator);
        t.parsed.checked = true;
        row.addClass("is-checked");
      } catch (err) {
        this.suppressRefresh = false;
        box.checked = false;
        reportWriteError(err);
      }
    });
    const prio = getPriority(t.parsed);
    const dot = row.createSpan({
      cls: "kw-task-prio " + (prio ? `kw-prio-${prio}` : "kw-prio-none")
    });
    dot.setAttribute("aria-label", prio ? `\u4F18\u5148\u7EA7\uFF1A${prio}` : "\u8BBE\u7F6E\u4F18\u5148\u7EA7");
    dot.setAttribute("title", prio ? `\u4F18\u5148\u7EA7\uFF1A${prio}` : "\u70B9\u51FB\u8BBE\u7F6E\u4F18\u5148\u7EA7");
    if (!t.parsed.checked) {
      dot.addEventListener("click", (e) => {
        e.stopPropagation();
        this.openPriorityMenu(e, t, row);
      });
    }
    const text = row.createSpan({ cls: "kw-task-text", text: t.parsed.text });
    let clickTimer = null;
    text.addEventListener("click", () => {
      if (clickTimer !== null) window.clearTimeout(clickTimer);
      clickTimer = window.setTimeout(() => {
        clickTimer = null;
        void this.openTaskFile(t);
      }, 220);
    });
    if (!t.parsed.checked) {
      text.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        if (clickTimer !== null) {
          window.clearTimeout(clickTimer);
          clickTimer = null;
        }
        this.enterTextEdit(text, t, row);
      });
    }
    const due = getDue(t.parsed);
    const today = todayDateStr();
    const dueEl = row.createSpan({
      cls: "kw-task-due" + (due ? "" : " kw-due-empty"),
      text: due ?? "+ \u65E5\u671F"
    });
    if (due) {
      const isOverdue = due < today && !t.parsed.checked;
      const isToday = due === today;
      if (isOverdue) dueEl.addClass("is-overdue");
      else if (isToday) dueEl.addClass("is-today");
    }
    dueEl.setAttribute("title", due ? "\u70B9\u51FB\u4FEE\u6539\u65E5\u671F" : "\u70B9\u51FB\u8BBE\u7F6E\u65E5\u671F");
    if (!t.parsed.checked) {
      dueEl.addEventListener("click", (e) => {
        e.stopPropagation();
        this.openDueMenu(e, t, row);
      });
    }
    if (groupKey !== "all" && !groupKey.startsWith("plan-")) {
      row.createSpan({ cls: "kw-task-plan", text: t.planTitle });
    }
  }
  // ==================== 行内编辑 ====================
  async openTaskFile(t) {
    const f = this.app.vault.getAbstractFileByPath(t.planPath);
    if (!(f instanceof import_obsidian10.TFile)) return;
    const leaf = this.app.workspace.getLeaf(false);
    await leaf.openFile(f);
    const view = leaf.view;
    const ed = view?.editor;
    if (ed) {
      ed.setCursor({ line: t.lineNumber, ch: 0 });
      ed.scrollIntoView(
        { from: { line: t.lineNumber, ch: 0 }, to: { line: t.lineNumber, ch: 0 } },
        true
      );
    }
  }
  openPriorityMenu(e, t, row) {
    const cur = getPriority(t.parsed);
    const menu = new import_obsidian10.Menu();
    const opts = [
      { label: "\u23EB \u9AD8", value: "high" },
      { label: "\u{1F53C} \u4E2D", value: "medium" },
      { label: "\u{1F53D} \u4F4E", value: "low" },
      { label: "\u6E05\u9664", value: null }
    ];
    for (const o of opts) {
      menu.addItem(
        (it) => it.setTitle(o.label + (o.value === cur ? "  \u2713" : "")).onClick(() => {
          if (o.value === cur) return;
          void this.commitTaskUpdate(t, row, withPriority(t.parsed, o.value));
        })
      );
    }
    menu.showAtMouseEvent(e);
  }
  openDueMenu(e, t, row) {
    const cur = getDue(t.parsed);
    const now = /* @__PURE__ */ new Date();
    const today = ymd(now);
    const tomorrow = ymd(addDays2(now, 1));
    const sunday = ymd(addDays2(now, (7 - now.getDay()) % 7 || 7));
    const menu = new import_obsidian10.Menu();
    const items = [
      { label: `\u4ECA\u5929\uFF08${today}\uFF09`, value: today },
      { label: `\u660E\u5929\uFF08${tomorrow}\uFF09`, value: tomorrow },
      { label: `\u672C\u5468\u65E5\uFF08${sunday}\uFF09`, value: sunday }
    ];
    for (const o of items) {
      menu.addItem(
        (it) => it.setTitle(o.label + (o.value === cur ? "  \u2713" : "")).onClick(() => {
          if (o.value === cur) return;
          void this.commitTaskUpdate(t, row, withDue(t.parsed, o.value));
        })
      );
    }
    menu.addItem(
      (it) => it.setTitle("\u81EA\u5B9A\u4E49\u2026").onClick(() => {
        new DatePickerModal(this.app, cur ?? today, (v) => {
          if (v === cur) return;
          void this.commitTaskUpdate(t, row, withDue(t.parsed, v));
        }).open();
      })
    );
    if (cur) {
      menu.addSeparator();
      menu.addItem(
        (it) => it.setTitle("\u6E05\u9664").onClick(() => {
          void this.commitTaskUpdate(t, row, withDue(t.parsed, null));
        })
      );
    }
    menu.showAtMouseEvent(e);
  }
  enterTextEdit(textEl, t, row) {
    const original = t.parsed.text;
    const input = row.createEl("input", {
      cls: "kw-task-text-input",
      attr: { type: "text" }
    });
    input.value = original;
    textEl.replaceWith(input);
    input.focus();
    input.select();
    let cancelled = false;
    let submitted = false;
    const cleanup = (finalText) => {
      input.replaceWith(finalText);
    };
    const finish = async () => {
      if (submitted) return;
      submitted = true;
      if (cancelled) {
        cleanup(this.rebuildTextEl(original));
        return;
      }
      const v = input.value.replace(/[\r\n\t\u0000-\u001f]/g, " ").trim();
      if (!v || v === original) {
        cleanup(this.rebuildTextEl(original));
        return;
      }
      cleanup(this.rebuildTextEl(v));
      await this.commitTaskUpdate(t, row, withText(t.parsed, v));
    };
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        void finish();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancelled = true;
        void finish();
      }
    });
    input.addEventListener("blur", () => void finish());
  }
  /** 构造与原始 kw-task-text 结构一致的 span，以便退出编辑后继续可点击/双击 */
  rebuildTextEl(text) {
    const span = document.createElement("span");
    span.className = "kw-task-text";
    span.textContent = text;
    return span;
  }
  async commitTaskUpdate(t, row, newParsed) {
    const newLine = serializeTask(newParsed);
    if (newLine === t.locator.lineText) return;
    try {
      this.suppressRefresh = true;
      await updateTaskLine(this.app, t.locator, newLine);
      t.parsed = newParsed;
      t.locator = { ...t.locator, lineText: newLine };
      this.rerenderRow(t, row);
    } catch (err) {
      this.suppressRefresh = false;
      reportWriteError(err);
    }
  }
  /** 单行局部重渲染：找到 row 的父容器与 groupKey，替换掉这一行 */
  rerenderRow(t, row) {
    const parent = row.parentElement;
    if (!parent) return;
    const groupKey = row.dataset.groupKey ?? "";
    const marker = document.createComment("kw-row");
    parent.insertBefore(marker, row);
    row.remove();
    const tmp = document.createElement("div");
    this.renderTask(tmp, t, groupKey);
    const newRow = tmp.firstElementChild;
    if (newRow) parent.insertBefore(newRow, marker);
    marker.remove();
  }
  // ==================== 日历视口 ====================
  /** 按 due 日期聚合 active 计划的任务 */
  buildDateIndex() {
    const idx = /* @__PURE__ */ new Map();
    for (const p of this.plans) {
      if (p.status !== "active") continue;
      for (const t of p.tasks) {
        const due = getDue(t.parsed);
        if (!due) continue;
        const arr = idx.get(due);
        if (arr) arr.push(t);
        else idx.set(due, [t]);
      }
    }
    return idx;
  }
  shiftMonth(n) {
    let m = this.state.calMonth + n;
    let y = this.state.calYear;
    while (m < 0) {
      m += 12;
      y -= 1;
    }
    while (m > 11) {
      m -= 12;
      y += 1;
    }
    this.state.calMonth = m;
    this.state.calYear = y;
    this.render();
  }
  renderCalendar(body) {
    const y = this.state.calYear;
    const m = this.state.calMonth;
    const today = todayDateStr();
    const idx = this.buildDateIndex();
    const hdr = body.createDiv({ cls: "kw-cal-head" });
    const prev = hdr.createSpan({ cls: "kw-cal-nav", text: "\u2039" });
    prev.setAttribute("aria-label", "\u4E0A\u4E2A\u6708");
    hdr.createSpan({ cls: "kw-cal-title", text: `${y} \u5E74 ${m + 1} \u6708` });
    const next = hdr.createSpan({ cls: "kw-cal-nav", text: "\u203A" });
    next.setAttribute("aria-label", "\u4E0B\u4E2A\u6708");
    const todayBtn = hdr.createSpan({ cls: "kw-cal-today-btn", text: "\u56DE\u4ECA\u5929" });
    prev.addEventListener("click", () => this.shiftMonth(-1));
    next.addEventListener("click", () => this.shiftMonth(1));
    todayBtn.addEventListener("click", () => {
      const d = /* @__PURE__ */ new Date();
      this.state.calYear = d.getFullYear();
      this.state.calMonth = d.getMonth();
      this.state.selectedDate = today;
      this.render();
    });
    const wk = body.createDiv({ cls: "kw-cal-wkhead" });
    for (const w of ["\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D", "\u65E5"]) {
      wk.createSpan({ cls: "kw-cal-wk", text: w });
    }
    const first = new Date(y, m, 1);
    const offset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const rows = Math.ceil((offset + daysInMonth) / 7);
    const totalCells = rows * 7;
    const grid = body.createDiv({ cls: "kw-cal-grid" });
    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - offset + 1;
      const cellDate = new Date(y, m, dayNum);
      const iso = dateStr(cellDate);
      const isCurMonth = dayNum >= 1 && dayNum <= daysInMonth;
      const cell = grid.createDiv({ cls: "kw-cal-cell" });
      if (!isCurMonth) cell.addClass("is-other");
      if (iso === today) cell.addClass("is-today");
      if (this.state.selectedDate === iso) cell.addClass("is-selected");
      cell.createSpan({ cls: "kw-cal-day", text: String(cellDate.getDate()) });
      const items = idx.get(iso);
      if (items && items.length > 0) {
        const unchecked = items.filter((t) => !t.parsed.checked).length;
        const badge = cell.createSpan({ cls: "kw-cal-badge" });
        if (unchecked === 0) {
          badge.addClass("is-done");
          badge.setText("\u2713");
        } else {
          if (iso < today) badge.addClass("is-overdue");
          badge.setText(String(unchecked));
        }
      }
      cell.addEventListener("click", () => {
        if (this.state.selectedDate === iso) {
          this.state.selectedDate = null;
        } else {
          this.state.selectedDate = iso;
          if (!isCurMonth) {
            this.state.calYear = cellDate.getFullYear();
            this.state.calMonth = cellDate.getMonth();
          }
        }
        this.render();
      });
    }
    if (this.state.selectedDate) {
      let items = (idx.get(this.state.selectedDate) ?? []).slice();
      if (this.plugin.settings.hideCompleted) {
        items = items.filter((t) => !t.parsed.checked);
      }
      items.sort((a, b) => {
        if (a.parsed.checked !== b.parsed.checked) return a.parsed.checked ? 1 : -1;
        const c = a.planTitle < b.planTitle ? -1 : a.planTitle > b.planTitle ? 1 : 0;
        return c !== 0 ? c : a.lineNumber - b.lineNumber;
      });
      const panel = body.createDiv({ cls: "kw-cal-daypanel" });
      const ph = panel.createDiv({ cls: "kw-cal-daypanel-head" });
      ph.createSpan({ cls: "kw-cal-daypanel-date", text: this.state.selectedDate });
      ph.createSpan({ cls: "kw-cal-daypanel-count", text: `${items.length} \u9879` });
      if (items.length === 0) {
        panel.createDiv({ cls: "kw-empty", text: "\u8FD9\u4E00\u5929\u6CA1\u6709\u4EFB\u52A1" });
      } else {
        const list = panel.createDiv({ cls: "kw-task-list" });
        for (const t of items) this.renderTask(list, t, "calendar");
      }
    }
  }
};
function ymd(d) {
  const p = (n) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function addDays2(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

// src/view.ts
var VIEW_TYPE_WORKBENCH = "knowledge-workbench-view";
var SPARK_REFRESH_DELAY = 200;
var MATRIX_REFRESH_DELAY = 300;
var TASKS_REFRESH_DELAY = 300;
var WorkbenchView = class extends import_obsidian11.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.sparkTimer = null;
    this.matrixTimer = null;
    this.tasksTimer = null;
    this.plugin = plugin;
  }
  getViewType() {
    return VIEW_TYPE_WORKBENCH;
  }
  getDisplayText() {
    return "\u5DE5\u4F5C\u53F0";
  }
  getIcon() {
    return "layout-dashboard";
  }
  async onOpen() {
    this.render();
    this.registerEvent(this.app.vault.on("modify", (f) => this.onVaultChange(f)));
    this.registerEvent(this.app.vault.on("create", (f) => this.onVaultChange(f)));
    this.registerEvent(this.app.vault.on("delete", (f) => this.onVaultChange(f)));
    this.registerEvent(this.app.vault.on("rename", (f) => this.onVaultChange(f)));
    this.registerEvent(
      this.app.metadataCache.on("resolved", () => {
        this.scheduleMatrixRefresh();
        this.scheduleTasksRefresh();
      })
    );
    this.registerEvent(
      this.app.workspace.on("file-open", () => this.refreshRecent())
    );
  }
  async onClose() {
    if (this.sparkTimer !== null) window.clearTimeout(this.sparkTimer);
    if (this.matrixTimer !== null) window.clearTimeout(this.matrixTimer);
    if (this.tasksTimer !== null) window.clearTimeout(this.tasksTimer);
  }
  // ==================== 事件调度 ====================
  onVaultChange(f) {
    if (f instanceof import_obsidian11.TFile && f.path === todaySparkPath()) {
      if (this.sparks?.consumeSuppressFlag()) {
      } else if (!this.sparks?.isInputFocused()) {
        this.scheduleSparkRefresh();
      }
    }
    this.scheduleMatrixRefresh();
    if (f instanceof import_obsidian11.TFile && f.path.startsWith("inbox/tasks/")) {
      this.scheduleTasksRefresh();
    }
  }
  scheduleSparkRefresh() {
    if (this.sparkTimer !== null) window.clearTimeout(this.sparkTimer);
    this.sparkTimer = window.setTimeout(() => {
      void this.sparks?.refresh();
    }, SPARK_REFRESH_DELAY);
  }
  scheduleMatrixRefresh() {
    if (this.matrixTimer !== null) window.clearTimeout(this.matrixTimer);
    this.matrixTimer = window.setTimeout(() => {
      if (this.matrix?.hasFocus()) {
        this.scheduleMatrixRefresh();
        return;
      }
      this.matrix?.render();
      this.refreshRecent();
    }, MATRIX_REFRESH_DELAY);
  }
  scheduleTasksRefresh() {
    if (this.tasksTimer !== null) window.clearTimeout(this.tasksTimer);
    this.tasksTimer = window.setTimeout(() => {
      if (this.tasks?.consumeSelfWriteFlag()) return;
      this.tasks?.render();
    }, TASKS_REFRESH_DELAY);
  }
  // ==================== 渲染 ====================
  render() {
    const root = this.contentEl;
    root.empty();
    root.addClass("kw-workbench");
    const bar = root.createDiv();
    const main = root.createDiv({ cls: "kw-main" });
    const matrixEl = main.createDiv();
    this.matrix = new MatrixSection(this.app, this.plugin, matrixEl);
    this.matrix.render();
    const side = main.createDiv({ cls: "kw-side" });
    const tasksPanel = side.createDiv();
    this.tasks = new TasksSection(this.app, this.plugin, tasksPanel);
    this.tasks.render();
    const sparksPanel = side.createDiv();
    this.sparks = new SparksSection(this.app, this.plugin, bar, sparksPanel);
    this.sparks.render();
    this.recentEl = root.createDiv();
    this.refreshRecent();
  }
  // ==================== 最近 ====================
  refreshRecent() {
    if (this.recentEl) renderRecent(this.app, this.recentEl);
  }
  /** 供 plugin 从设置页触发的主动刷新 */
  refreshTasks() {
    this.tasks?.render();
  }
};

// src/settings.ts
var import_obsidian12 = require("obsidian");
var DEFAULT_SETTINGS = {
  defaultViewport: "today",
  hideCompleted: false,
  pinnedFiles: []
};
var WorkbenchSettingTab = class extends import_obsidian12.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian12.Setting(containerEl).setName("\u9ED8\u8BA4\u89C6\u53E3").setDesc("\u6253\u5F00\u5DE5\u4F5C\u53F0\u65F6\uFF0C\u4EFB\u52A1\u9762\u677F\u521D\u59CB\u663E\u793A\u7684\u89C6\u53E3").addDropdown(
      (dd) => dd.addOption("today", "\u4ECA\u5929").addOption("upcoming", "\u8BA1\u5212").addOption("all", "\u5168\u90E8").addOption("calendar", "\u65E5\u5386").setValue(this.plugin.settings.defaultViewport).onChange(async (v) => {
        this.plugin.settings.defaultViewport = v;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian12.Setting(containerEl).setName("\u9690\u85CF\u5DF2\u5B8C\u6210\u4EFB\u52A1").setDesc("\u5728\u300C\u5168\u90E8\u300D\u89C6\u53E3\u4E0E\u65E5\u5386\u65E5\u9762\u677F\u4E2D\u4E0D\u663E\u793A\u5DF2 \u2705 \u7684\u4EFB\u52A1\uFF1B\u4ECA\u5929/\u8BA1\u5212\u89C6\u53E3\u672C\u5C31\u4E0D\u542B\u5DF2\u5B8C\u6210\uFF0C\u4E0D\u53D7\u5F71\u54CD").addToggle(
      (tg) => tg.setValue(this.plugin.settings.hideCompleted).onChange(async (v) => {
        this.plugin.settings.hideCompleted = v;
        await this.plugin.saveSettings();
        this.plugin.refreshTasks();
      })
    );
  }
};

// src/perf.ts
var import_obsidian13 = require("obsidian");
async function samplePerformance(app) {
  const samples = [];
  const t0 = performance.now();
  const wiki = collectWikiFiles(app);
  samples.push({ label: "collectWikiFiles", ms: performance.now() - t0, count: wiki.length });
  const t1 = performance.now();
  const matrix = aggregateWikiMatrix(wiki);
  samples.push({ label: "aggregateWikiMatrix", ms: performance.now() - t1, count: matrix.cells.size });
  const allFiles = app.vault.getFiles();
  const t2 = performance.now();
  const rawCells = aggregateDirTree(allFiles, "raw");
  samples.push({ label: "aggregateDirTree(raw)", ms: performance.now() - t2, count: rawCells.length });
  const t3 = performance.now();
  const outCells = aggregateDirTree(allFiles, "output");
  samples.push({ label: "aggregateDirTree(output)", ms: performance.now() - t3, count: outCells.length });
  const t4 = performance.now();
  const plans = await loadPlans(app);
  const planTaskCount = plans.reduce((s, p) => s + p.tasks.length, 0);
  samples.push({ label: "loadPlans", ms: performance.now() - t4, count: planTaskCount });
  const today = todayDateStr();
  const t5 = performance.now();
  buildTodayGroups(plans, today);
  buildUpcomingGroups(plans, /* @__PURE__ */ new Date());
  buildAllGroups(plans);
  samples.push({ label: "3 \u89C6\u53E3 build", ms: performance.now() - t5 });
  const total = samples.reduce((s, x) => s + x.ms, 0);
  const detail = samples.map((s) => `${s.label}: ${s.ms.toFixed(1)}ms${s.count !== void 0 ? ` (${s.count})` : ""}`).join("\n");
  const verdict = total < 100 ? "\u2705 \u8FBE\u6807" : "\u26A0\uFE0F \u8D85\u9608\u503C";
  const msg = `${verdict} \u5168\u5E93\u904D\u5386\u5408\u8BA1 ${total.toFixed(1)}ms\uFF08\u9608\u503C 100ms\uFF09

${detail}`;
  new import_obsidian13.Notice(msg, 12e3);
  console.log("[knowledge-workbench] " + msg);
}

// src/main.ts
var WorkbenchPlugin = class extends import_obsidian14.Plugin {
  constructor() {
    super(...arguments);
    this.settings = { ...DEFAULT_SETTINGS };
  }
  async onload() {
    await this.loadSettings();
    this.registerView(
      VIEW_TYPE_WORKBENCH,
      (leaf) => new WorkbenchView(leaf, this)
    );
    this.addSettingTab(new WorkbenchSettingTab(this.app, this));
    this.addRibbonIcon("layout-dashboard", "\u6253\u5F00\u5DE5\u4F5C\u53F0", () => this.activateView());
    this.addCommand({
      id: "open-workbench",
      name: "\u6253\u5F00\u5DE5\u4F5C\u53F0",
      callback: () => this.activateView()
    });
    this.addCommand({
      id: "quick-capture-spark",
      name: "\u968F\u624B\u8BB0\uFF1A\u5FEB\u901F\u6355\u83B7",
      callback: () => {
        new SparkModal(this.app, async (text) => {
          await appendSpark(this.app, text);
        }).open();
      }
    });
    this.addCommand({
      id: "search-sparks",
      name: "\u968F\u624B\u8BB0\uFF1A\u5168\u6587\u641C\u7D22",
      callback: () => new SparkSearchModal(this.app).open()
    });
    this.addCommand({
      id: "quick-add-task",
      name: "\u4EFB\u52A1\uFF1A\u5FEB\u901F\u6DFB\u52A0",
      callback: () => new QuickAddTaskModal(this.app).open()
    });
    this.addCommand({
      id: "new-plan",
      name: "\u4EFB\u52A1\uFF1A\u65B0\u5EFA\u8BA1\u5212",
      callback: () => new NewPlanModal(this.app).open()
    });
    this.addCommand({
      id: "sample-performance",
      name: "\u8BCA\u65AD\uFF1A\u5168\u5E93\u904D\u5386\u8017\u65F6\u91C7\u6837",
      callback: () => samplePerformance(this.app)
    });
  }
  async loadSettings() {
    const raw = await this.loadData();
    this.settings = { ...DEFAULT_SETTINGS, ...raw ?? {} };
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  /** 让设置页在改动后能主动触发任务面板重渲染 */
  refreshTasks() {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_WORKBENCH);
    for (const leaf of leaves) {
      const view = leaf.view;
      view.refreshTasks?.();
    }
  }
  async activateView() {
    const { workspace } = this.app;
    const existing = workspace.getLeavesOfType(VIEW_TYPE_WORKBENCH);
    if (existing.length > 0) {
      workspace.revealLeaf(existing[0]);
      return;
    }
    const leaf = workspace.getLeaf(true);
    await leaf.setViewState({ type: VIEW_TYPE_WORKBENCH, active: true });
    workspace.revealLeaf(leaf);
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vLi4vZGV2L2tub3dsZWRnZS13b3JrYmVuY2gvc3JjL21haW4udHMiLCAiLi4vLi4vLi4vLi4vLi4vZGV2L2tub3dsZWRnZS13b3JrYmVuY2gvc3JjL3ZpZXcudHMiLCAiLi4vLi4vLi4vLi4vLi4vZGV2L2tub3dsZWRnZS13b3JrYmVuY2gvc3JjL3NwYXJrcy9pbmRleC50cyIsICIuLi8uLi8uLi8uLi8uLi9kZXYva25vd2xlZGdlLXdvcmtiZW5jaC9zcmMvdXRpbC50cyIsICIuLi8uLi8uLi8uLi8uLi9kZXYva25vd2xlZGdlLXdvcmtiZW5jaC9zcmMvc3BhcmtzL3BhcnNlci50cyIsICIuLi8uLi8uLi8uLi8uLi9kZXYva25vd2xlZGdlLXdvcmtiZW5jaC9zcmMvc3BhcmtzL3NlY3Rpb24udHMiLCAiLi4vLi4vLi4vLi4vLi4vZGV2L2tub3dsZWRnZS13b3JrYmVuY2gvc3JjL3NwYXJrcy9jb252ZXJ0LnRzIiwgIi4uLy4uLy4uLy4uLy4uL2Rldi9rbm93bGVkZ2Utd29ya2JlbmNoL3NyYy90YXNrcy9zYW5pdGl6ZS50cyIsICIuLi8uLi8uLi8uLi8uLi9kZXYva25vd2xlZGdlLXdvcmtiZW5jaC9zcmMvc3BhcmtzL2RyYWZ0LW1vZGFsLnRzIiwgIi4uLy4uLy4uLy4uLy4uL2Rldi9rbm93bGVkZ2Utd29ya2JlbmNoL3NyYy9zcGFya3Mvc2VhcmNoLW1vZGFsLnRzIiwgIi4uLy4uLy4uLy4uLy4uL2Rldi9rbm93bGVkZ2Utd29ya2JlbmNoL3NyYy9zcGFya3Mvc2VhcmNoLnRzIiwgIi4uLy4uLy4uLy4uLy4uL2Rldi9rbm93bGVkZ2Utd29ya2JlbmNoL3NyYy90YXNrcy9tb2RhbHMudHMiLCAiLi4vLi4vLi4vLi4vLi4vZGV2L2tub3dsZWRnZS13b3JrYmVuY2gvc3JjL3Rhc2tzL3dyaXRlYmFjay50cyIsICIuLi8uLi8uLi8uLi8uLi9kZXYva25vd2xlZGdlLXdvcmtiZW5jaC9zcmMvdGFza3MvcGFyc2VyLnRzIiwgIi4uLy4uLy4uLy4uLy4uL2Rldi9rbm93bGVkZ2Utd29ya2JlbmNoL3NyYy90YXNrcy9wbGFuLnRzIiwgIi4uLy4uLy4uLy4uLy4uL2Rldi9rbm93bGVkZ2Utd29ya2JlbmNoL3NyYy9tYXRyaXgvc2VjdGlvbi50cyIsICIuLi8uLi8uLi8uLi8uLi9kZXYva25vd2xlZGdlLXdvcmtiZW5jaC9zcmMvbWF0cml4L3Byb3ZpZGVycy50cyIsICIuLi8uLi8uLi8uLi8uLi9kZXYva25vd2xlZGdlLXdvcmtiZW5jaC9zcmMvbWF0cml4L3JlY2VudC50cyIsICIuLi8uLi8uLi8uLi8uLi9kZXYva25vd2xlZGdlLXdvcmtiZW5jaC9zcmMvdGFza3Mvc2VjdGlvbi50cyIsICIuLi8uLi8uLi8uLi8uLi9kZXYva25vd2xlZGdlLXdvcmtiZW5jaC9zcmMvdGFza3MvZ3JvdXBzLnRzIiwgIi4uLy4uLy4uLy4uLy4uL2Rldi9rbm93bGVkZ2Utd29ya2JlbmNoL3NyYy9zZXR0aW5ncy50cyIsICIuLi8uLi8uLi8uLi8uLi9kZXYva25vd2xlZGdlLXdvcmtiZW5jaC9zcmMvcGVyZi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgUGx1Z2luIH0gZnJvbSBcIm9ic2lkaWFuXCI7XG5pbXBvcnQgeyBWSUVXX1RZUEVfV09SS0JFTkNILCBXb3JrYmVuY2hWaWV3IH0gZnJvbSBcIi4vdmlld1wiO1xuaW1wb3J0IHsgU3BhcmtNb2RhbCwgYXBwZW5kU3BhcmsgfSBmcm9tIFwiLi9zcGFya3NcIjtcbmltcG9ydCB7IFNwYXJrU2VhcmNoTW9kYWwgfSBmcm9tIFwiLi9zcGFya3Mvc2VhcmNoLW1vZGFsXCI7XG5pbXBvcnQgeyBOZXdQbGFuTW9kYWwsIFF1aWNrQWRkVGFza01vZGFsIH0gZnJvbSBcIi4vdGFza3MvbW9kYWxzXCI7XG5pbXBvcnQgeyBERUZBVUxUX1NFVFRJTkdTLCBXb3JrYmVuY2hTZXR0aW5ncywgV29ya2JlbmNoU2V0dGluZ1RhYiB9IGZyb20gXCIuL3NldHRpbmdzXCI7XG5pbXBvcnQgeyBzYW1wbGVQZXJmb3JtYW5jZSB9IGZyb20gXCIuL3BlcmZcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV29ya2JlbmNoUGx1Z2luIGV4dGVuZHMgUGx1Z2luIHtcbiAgc2V0dGluZ3M6IFdvcmtiZW5jaFNldHRpbmdzID0geyAuLi5ERUZBVUxUX1NFVFRJTkdTIH07XG5cbiAgYXN5bmMgb25sb2FkKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMubG9hZFNldHRpbmdzKCk7XG5cbiAgICB0aGlzLnJlZ2lzdGVyVmlldyhcbiAgICAgIFZJRVdfVFlQRV9XT1JLQkVOQ0gsXG4gICAgICAobGVhZikgPT4gbmV3IFdvcmtiZW5jaFZpZXcobGVhZiwgdGhpcyksXG4gICAgKTtcblxuICAgIHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgV29ya2JlbmNoU2V0dGluZ1RhYih0aGlzLmFwcCwgdGhpcykpO1xuXG4gICAgdGhpcy5hZGRSaWJib25JY29uKFwibGF5b3V0LWRhc2hib2FyZFwiLCBcIlx1NjI1M1x1NUYwMFx1NURFNVx1NEY1Q1x1NTNGMFwiLCAoKSA9PiB0aGlzLmFjdGl2YXRlVmlldygpKTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogXCJvcGVuLXdvcmtiZW5jaFwiLFxuICAgICAgbmFtZTogXCJcdTYyNTNcdTVGMDBcdTVERTVcdTRGNUNcdTUzRjBcIixcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0aGlzLmFjdGl2YXRlVmlldygpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiBcInF1aWNrLWNhcHR1cmUtc3BhcmtcIixcbiAgICAgIG5hbWU6IFwiXHU5NjhGXHU2MjRCXHU4QkIwXHVGRjFBXHU1RkVCXHU5MDFGXHU2MzU1XHU4M0I3XCIsXG4gICAgICBjYWxsYmFjazogKCkgPT4ge1xuICAgICAgICBuZXcgU3BhcmtNb2RhbCh0aGlzLmFwcCwgYXN5bmMgKHRleHQpID0+IHtcbiAgICAgICAgICBhd2FpdCBhcHBlbmRTcGFyayh0aGlzLmFwcCwgdGV4dCk7XG4gICAgICAgIH0pLm9wZW4oKTtcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6IFwic2VhcmNoLXNwYXJrc1wiLFxuICAgICAgbmFtZTogXCJcdTk2OEZcdTYyNEJcdThCQjBcdUZGMUFcdTUxNjhcdTY1ODdcdTY0MUNcdTdEMjJcIixcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiBuZXcgU3BhcmtTZWFyY2hNb2RhbCh0aGlzLmFwcCkub3BlbigpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiBcInF1aWNrLWFkZC10YXNrXCIsXG4gICAgICBuYW1lOiBcIlx1NEVGQlx1NTJBMVx1RkYxQVx1NUZFQlx1OTAxRlx1NkRGQlx1NTJBMFwiLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IG5ldyBRdWlja0FkZFRhc2tNb2RhbCh0aGlzLmFwcCkub3BlbigpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiBcIm5ldy1wbGFuXCIsXG4gICAgICBuYW1lOiBcIlx1NEVGQlx1NTJBMVx1RkYxQVx1NjVCMFx1NUVGQVx1OEJBMVx1NTIxMlwiLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IG5ldyBOZXdQbGFuTW9kYWwodGhpcy5hcHApLm9wZW4oKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogXCJzYW1wbGUtcGVyZm9ybWFuY2VcIixcbiAgICAgIG5hbWU6IFwiXHU4QkNBXHU2NUFEXHVGRjFBXHU1MTY4XHU1RTkzXHU5MDREXHU1Mzg2XHU4MDE3XHU2NUY2XHU5MUM3XHU2ODM3XCIsXG4gICAgICBjYWxsYmFjazogKCkgPT4gc2FtcGxlUGVyZm9ybWFuY2UodGhpcy5hcHApLFxuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgbG9hZFNldHRpbmdzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHJhdyA9IChhd2FpdCB0aGlzLmxvYWREYXRhKCkpIGFzIFBhcnRpYWw8V29ya2JlbmNoU2V0dGluZ3M+IHwgbnVsbDtcbiAgICB0aGlzLnNldHRpbmdzID0geyAuLi5ERUZBVUxUX1NFVFRJTkdTLCAuLi4ocmF3ID8/IHt9KSB9O1xuICB9XG5cbiAgYXN5bmMgc2F2ZVNldHRpbmdzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5zZXR0aW5ncyk7XG4gIH1cblxuICAvKiogXHU4QkE5XHU4QkJFXHU3RjZFXHU5ODc1XHU1NzI4XHU2NTM5XHU1MkE4XHU1NDBFXHU4MEZEXHU0RTNCXHU1MkE4XHU4OUU2XHU1M0QxXHU0RUZCXHU1MkExXHU5NzYyXHU2NzdGXHU5MUNEXHU2RTMyXHU2N0QzICovXG4gIHJlZnJlc2hUYXNrcygpOiB2b2lkIHtcbiAgICBjb25zdCBsZWF2ZXMgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0TGVhdmVzT2ZUeXBlKFZJRVdfVFlQRV9XT1JLQkVOQ0gpO1xuICAgIGZvciAoY29uc3QgbGVhZiBvZiBsZWF2ZXMpIHtcbiAgICAgIGNvbnN0IHZpZXcgPSBsZWFmLnZpZXcgYXMgV29ya2JlbmNoVmlldztcbiAgICAgIHZpZXcucmVmcmVzaFRhc2tzPy4oKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBhY3RpdmF0ZVZpZXcoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgeyB3b3Jrc3BhY2UgfSA9IHRoaXMuYXBwO1xuICAgIGNvbnN0IGV4aXN0aW5nID0gd29ya3NwYWNlLmdldExlYXZlc09mVHlwZShWSUVXX1RZUEVfV09SS0JFTkNIKTtcbiAgICBpZiAoZXhpc3RpbmcubGVuZ3RoID4gMCkge1xuICAgICAgd29ya3NwYWNlLnJldmVhbExlYWYoZXhpc3RpbmdbMF0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBsZWFmID0gd29ya3NwYWNlLmdldExlYWYodHJ1ZSk7XG4gICAgYXdhaXQgbGVhZi5zZXRWaWV3U3RhdGUoeyB0eXBlOiBWSUVXX1RZUEVfV09SS0JFTkNILCBhY3RpdmU6IHRydWUgfSk7XG4gICAgd29ya3NwYWNlLnJldmVhbExlYWYobGVhZik7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBJdGVtVmlldywgVEFic3RyYWN0RmlsZSwgVEZpbGUsIFdvcmtzcGFjZUxlYWYgfSBmcm9tIFwib2JzaWRpYW5cIjtcbmltcG9ydCB0eXBlIFdvcmtiZW5jaFBsdWdpbiBmcm9tIFwiLi9tYWluXCI7XG5pbXBvcnQgeyB0b2RheVNwYXJrUGF0aCB9IGZyb20gXCIuL3NwYXJrc1wiO1xuaW1wb3J0IHsgU3BhcmtzU2VjdGlvbiB9IGZyb20gXCIuL3NwYXJrcy9zZWN0aW9uXCI7XG5pbXBvcnQgeyBNYXRyaXhTZWN0aW9uIH0gZnJvbSBcIi4vbWF0cml4L3NlY3Rpb25cIjtcbmltcG9ydCB7IHJlbmRlclJlY2VudCB9IGZyb20gXCIuL21hdHJpeC9yZWNlbnRcIjtcbmltcG9ydCB7IFRhc2tzU2VjdGlvbiB9IGZyb20gXCIuL3Rhc2tzL3NlY3Rpb25cIjtcblxuZXhwb3J0IGNvbnN0IFZJRVdfVFlQRV9XT1JLQkVOQ0ggPSBcImtub3dsZWRnZS13b3JrYmVuY2gtdmlld1wiO1xuXG5jb25zdCBTUEFSS19SRUZSRVNIX0RFTEFZID0gMjAwO1xuY29uc3QgTUFUUklYX1JFRlJFU0hfREVMQVkgPSAzMDA7XG5jb25zdCBUQVNLU19SRUZSRVNIX0RFTEFZID0gMzAwO1xuXG5leHBvcnQgY2xhc3MgV29ya2JlbmNoVmlldyBleHRlbmRzIEl0ZW1WaWV3IHtcbiAgcHJpdmF0ZSByZWFkb25seSBwbHVnaW46IFdvcmtiZW5jaFBsdWdpbjtcbiAgcHJpdmF0ZSBzcGFya3MhOiBTcGFya3NTZWN0aW9uO1xuICBwcml2YXRlIG1hdHJpeCE6IE1hdHJpeFNlY3Rpb247XG4gIHByaXZhdGUgdGFza3MhOiBUYXNrc1NlY3Rpb247XG4gIHByaXZhdGUgcmVjZW50RWwhOiBIVE1MRWxlbWVudDtcblxuICBwcml2YXRlIHNwYXJrVGltZXI6IG51bWJlciB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIG1hdHJpeFRpbWVyOiBudW1iZXIgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSB0YXNrc1RpbWVyOiBudW1iZXIgfCBudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihsZWFmOiBXb3Jrc3BhY2VMZWFmLCBwbHVnaW46IFdvcmtiZW5jaFBsdWdpbikge1xuICAgIHN1cGVyKGxlYWYpO1xuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xuICB9XG5cbiAgZ2V0Vmlld1R5cGUoKTogc3RyaW5nIHsgcmV0dXJuIFZJRVdfVFlQRV9XT1JLQkVOQ0g7IH1cbiAgZ2V0RGlzcGxheVRleHQoKTogc3RyaW5nIHsgcmV0dXJuIFwiXHU1REU1XHU0RjVDXHU1M0YwXCI7IH1cbiAgZ2V0SWNvbigpOiBzdHJpbmcgeyByZXR1cm4gXCJsYXlvdXQtZGFzaGJvYXJkXCI7IH1cblxuICBhc3luYyBvbk9wZW4oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5yZW5kZXIoKTtcblxuICAgIHRoaXMucmVnaXN0ZXJFdmVudCh0aGlzLmFwcC52YXVsdC5vbihcIm1vZGlmeVwiLCAoZikgPT4gdGhpcy5vblZhdWx0Q2hhbmdlKGYpKSk7XG4gICAgdGhpcy5yZWdpc3RlckV2ZW50KHRoaXMuYXBwLnZhdWx0Lm9uKFwiY3JlYXRlXCIsIChmKSA9PiB0aGlzLm9uVmF1bHRDaGFuZ2UoZikpKTtcbiAgICB0aGlzLnJlZ2lzdGVyRXZlbnQodGhpcy5hcHAudmF1bHQub24oXCJkZWxldGVcIiwgKGYpID0+IHRoaXMub25WYXVsdENoYW5nZShmKSkpO1xuICAgIHRoaXMucmVnaXN0ZXJFdmVudCh0aGlzLmFwcC52YXVsdC5vbihcInJlbmFtZVwiLCAoZikgPT4gdGhpcy5vblZhdWx0Q2hhbmdlKGYpKSk7XG5cbiAgICAvLyBtZXRhZGF0YUNhY2hlIFx1NjZGNFx1NjVCMFx1RkYwOGZyb250bWF0dGVyIFx1NTNEOFx1NTMxNlx1RkYwOVx1MjE5MiBcdTg5RTZcdTUzRDFcdTc3RTlcdTk2MzUvXHU0RUZCXHU1MkExXHU1MjM3XHU2NUIwXG4gICAgdGhpcy5yZWdpc3RlckV2ZW50KFxuICAgICAgdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5vbihcInJlc29sdmVkXCIsICgpID0+IHtcbiAgICAgICAgdGhpcy5zY2hlZHVsZU1hdHJpeFJlZnJlc2goKTtcbiAgICAgICAgdGhpcy5zY2hlZHVsZVRhc2tzUmVmcmVzaCgpO1xuICAgICAgfSksXG4gICAgKTtcblxuICAgIC8vIFx1NjI1M1x1NUYwMFx1NjVCMFx1NjU4N1x1NEVGNiBcdTIxOTIgXHU1MjM3XHU2NUIwXHUzMDBDXHU2NzAwXHU4RkQxXHUzMDBEXG4gICAgdGhpcy5yZWdpc3RlckV2ZW50KFxuICAgICAgdGhpcy5hcHAud29ya3NwYWNlLm9uKFwiZmlsZS1vcGVuXCIsICgpID0+IHRoaXMucmVmcmVzaFJlY2VudCgpKSxcbiAgICApO1xuICB9XG5cbiAgYXN5bmMgb25DbG9zZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5zcGFya1RpbWVyICE9PSBudWxsKSB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMuc3BhcmtUaW1lcik7XG4gICAgaWYgKHRoaXMubWF0cml4VGltZXIgIT09IG51bGwpIHdpbmRvdy5jbGVhclRpbWVvdXQodGhpcy5tYXRyaXhUaW1lcik7XG4gICAgaWYgKHRoaXMudGFza3NUaW1lciAhPT0gbnVsbCkgd2luZG93LmNsZWFyVGltZW91dCh0aGlzLnRhc2tzVGltZXIpO1xuICB9XG5cbiAgLy8gPT09PT09PT09PT09PT09PT09PT0gXHU0RThCXHU0RUY2XHU4QzAzXHU1RUE2ID09PT09PT09PT09PT09PT09PT09XG5cbiAgcHJpdmF0ZSBvblZhdWx0Q2hhbmdlKGY6IFRBYnN0cmFjdEZpbGUpOiB2b2lkIHtcbiAgICBpZiAoZiBpbnN0YW5jZW9mIFRGaWxlICYmIGYucGF0aCA9PT0gdG9kYXlTcGFya1BhdGgoKSkge1xuICAgICAgaWYgKHRoaXMuc3BhcmtzPy5jb25zdW1lU3VwcHJlc3NGbGFnKCkpIHtcbiAgICAgICAgLy8gXHU4MUVBXHU4RUFCXHU1MTk5XHU1MTY1XHU4OUU2XHU1M0QxXHU3Njg0XHU0RThCXHU0RUY2XHVGRjBDXHU1RkZEXHU3NTY1XG4gICAgICB9IGVsc2UgaWYgKCF0aGlzLnNwYXJrcz8uaXNJbnB1dEZvY3VzZWQoKSkge1xuICAgICAgICB0aGlzLnNjaGVkdWxlU3BhcmtSZWZyZXNoKCk7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIFx1NEVGQlx1NEY1NVx1NjU4N1x1NEVGNlx1NTNEOFx1NTJBOFx1OTBGRFx1NEYxQVx1NUY3MVx1NTRDRFx1NzdFOVx1OTYzNS9cdTY3MDBcdThGRDFcbiAgICB0aGlzLnNjaGVkdWxlTWF0cml4UmVmcmVzaCgpO1xuICAgIC8vIFx1NEVGQlx1NTJBMVx1OTc2Mlx1Njc3Rlx1RkYxQWluYm94L3Rhc2tzLyBcdTUxODVcdTUzRDhcdTUyQThcdTYyNERcdTUyMzdcdTY1QjBcbiAgICBpZiAoZiBpbnN0YW5jZW9mIFRGaWxlICYmIGYucGF0aC5zdGFydHNXaXRoKFwiaW5ib3gvdGFza3MvXCIpKSB7XG4gICAgICB0aGlzLnNjaGVkdWxlVGFza3NSZWZyZXNoKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzY2hlZHVsZVNwYXJrUmVmcmVzaCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5zcGFya1RpbWVyICE9PSBudWxsKSB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMuc3BhcmtUaW1lcik7XG4gICAgdGhpcy5zcGFya1RpbWVyID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdm9pZCB0aGlzLnNwYXJrcz8ucmVmcmVzaCgpO1xuICAgIH0sIFNQQVJLX1JFRlJFU0hfREVMQVkpO1xuICB9XG5cbiAgcHJpdmF0ZSBzY2hlZHVsZU1hdHJpeFJlZnJlc2goKTogdm9pZCB7XG4gICAgaWYgKHRoaXMubWF0cml4VGltZXIgIT09IG51bGwpIHdpbmRvdy5jbGVhclRpbWVvdXQodGhpcy5tYXRyaXhUaW1lcik7XG4gICAgdGhpcy5tYXRyaXhUaW1lciA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIC8vIFx1OEZDN1x1NkVFNFx1OEY5M1x1NTE2NVx1ODA1QVx1NzEyNlx1NjVGNlx1NjY4Mlx1N0YxM1x1NTIzN1x1NjVCMFx1RkYwOFNQRUMgXHUwMEE3N1x1RkYwOVxuICAgICAgaWYgKHRoaXMubWF0cml4Py5oYXNGb2N1cygpKSB7XG4gICAgICAgIHRoaXMuc2NoZWR1bGVNYXRyaXhSZWZyZXNoKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMubWF0cml4Py5yZW5kZXIoKTtcbiAgICAgIHRoaXMucmVmcmVzaFJlY2VudCgpO1xuICAgIH0sIE1BVFJJWF9SRUZSRVNIX0RFTEFZKTtcbiAgfVxuXG4gIHByaXZhdGUgc2NoZWR1bGVUYXNrc1JlZnJlc2goKTogdm9pZCB7XG4gICAgaWYgKHRoaXMudGFza3NUaW1lciAhPT0gbnVsbCkgd2luZG93LmNsZWFyVGltZW91dCh0aGlzLnRhc2tzVGltZXIpO1xuICAgIHRoaXMudGFza3NUaW1lciA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmICh0aGlzLnRhc2tzPy5jb25zdW1lU2VsZldyaXRlRmxhZygpKSByZXR1cm47XG4gICAgICB0aGlzLnRhc2tzPy5yZW5kZXIoKTtcbiAgICB9LCBUQVNLU19SRUZSRVNIX0RFTEFZKTtcbiAgfVxuXG4gIC8vID09PT09PT09PT09PT09PT09PT09IFx1NkUzMlx1NjdEMyA9PT09PT09PT09PT09PT09PT09PVxuXG4gIHByaXZhdGUgcmVuZGVyKCk6IHZvaWQge1xuICAgIGNvbnN0IHJvb3QgPSB0aGlzLmNvbnRlbnRFbDtcbiAgICByb290LmVtcHR5KCk7XG4gICAgcm9vdC5hZGRDbGFzcyhcImt3LXdvcmtiZW5jaFwiKTtcblxuICAgIC8vIFx1OTg3Nlx1OTBFOFx1RkYxQVx1OTY4Rlx1NjI0Qlx1OEJCMFx1OEY5M1x1NTE2NVx1Njc2MVxuICAgIGNvbnN0IGJhciA9IHJvb3QuY3JlYXRlRGl2KCk7XG5cbiAgICAvLyBcdTRFM0JcdTUzM0FcbiAgICBjb25zdCBtYWluID0gcm9vdC5jcmVhdGVEaXYoeyBjbHM6IFwia3ctbWFpblwiIH0pO1xuXG4gICAgY29uc3QgbWF0cml4RWwgPSBtYWluLmNyZWF0ZURpdigpO1xuICAgIHRoaXMubWF0cml4ID0gbmV3IE1hdHJpeFNlY3Rpb24odGhpcy5hcHAsIHRoaXMucGx1Z2luLCBtYXRyaXhFbCk7XG4gICAgdGhpcy5tYXRyaXgucmVuZGVyKCk7XG5cbiAgICBjb25zdCBzaWRlID0gbWFpbi5jcmVhdGVEaXYoeyBjbHM6IFwia3ctc2lkZVwiIH0pO1xuXG4gICAgY29uc3QgdGFza3NQYW5lbCA9IHNpZGUuY3JlYXRlRGl2KCk7XG4gICAgdGhpcy50YXNrcyA9IG5ldyBUYXNrc1NlY3Rpb24odGhpcy5hcHAsIHRoaXMucGx1Z2luLCB0YXNrc1BhbmVsKTtcbiAgICB0aGlzLnRhc2tzLnJlbmRlcigpO1xuXG4gICAgLy8gXHU0RkE3XHU4RkI5XHVGRjFBXHU0RUNBXHU2NUU1XHU5NjhGXHU2MjRCXHU4QkIwXHU1MjE3XHU4ODY4XG4gICAgY29uc3Qgc3BhcmtzUGFuZWwgPSBzaWRlLmNyZWF0ZURpdigpO1xuXG4gICAgLy8gXHU5NjhGXHU2MjRCXHU4QkIwXHU0RTI0XHU1QkI5XHU1NjY4XHU0RUE0XHU3RUQ5IFNwYXJrc1NlY3Rpb24gXHU3RURGXHU0RTAwXHU3QkExXHU3NDA2XG4gICAgdGhpcy5zcGFya3MgPSBuZXcgU3BhcmtzU2VjdGlvbih0aGlzLmFwcCwgdGhpcy5wbHVnaW4sIGJhciwgc3BhcmtzUGFuZWwpO1xuICAgIHRoaXMuc3BhcmtzLnJlbmRlcigpO1xuXG4gICAgLy8gXHU1RTk1XHU5MEU4XHVGRjFBXHU2NzAwXHU4RkQxXG4gICAgdGhpcy5yZWNlbnRFbCA9IHJvb3QuY3JlYXRlRGl2KCk7XG4gICAgdGhpcy5yZWZyZXNoUmVjZW50KCk7XG4gIH1cblxuICAvLyA9PT09PT09PT09PT09PT09PT09PSBcdTY3MDBcdThGRDEgPT09PT09PT09PT09PT09PT09PT1cblxuICBwcml2YXRlIHJlZnJlc2hSZWNlbnQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMucmVjZW50RWwpIHJlbmRlclJlY2VudCh0aGlzLmFwcCwgdGhpcy5yZWNlbnRFbCk7XG4gIH1cblxuICAvKiogXHU0RjlCIHBsdWdpbiBcdTRFQ0VcdThCQkVcdTdGNkVcdTk4NzVcdTg5RTZcdTUzRDFcdTc2ODRcdTRFM0JcdTUyQThcdTUyMzdcdTY1QjAgKi9cbiAgcmVmcmVzaFRhc2tzKCk6IHZvaWQge1xuICAgIHRoaXMudGFza3M/LnJlbmRlcigpO1xuICB9XG59XG5cbiIsICJpbXBvcnQgeyBBcHAsIE1vZGFsLCBOb3RpY2UsIFRGaWxlLCBURm9sZGVyLCBub3JtYWxpemVQYXRoIH0gZnJvbSBcIm9ic2lkaWFuXCI7XG5pbXBvcnQgeyB0b2RheURhdGVTdHIsIG5vd1RpbWVTdHIgfSBmcm9tIFwiLi4vdXRpbFwiO1xuaW1wb3J0IHsgcGFyc2VTcGFya0NvbnRlbnQsIHNlcmlhbGl6ZVNwYXJrLCBTcGFya0VudHJ5IH0gZnJvbSBcIi4vcGFyc2VyXCI7XG5cbmV4cG9ydCB0eXBlIHsgU3BhcmtFbnRyeSB9IGZyb20gXCIuL3BhcnNlclwiO1xuXG5jb25zdCBTUEFSS19ESVIgPSBcImluYm94L3NwYXJrcy9EYWlseW5vdGVcIjtcblxuLyoqIFx1NEVDQVx1NjVFNSBzcGFyayBcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcdUZGMDhcdTY3MkNcdTU3MzBcdTY1RjZcdTUzM0FcdUZGMDkgKi9cbmV4cG9ydCBmdW5jdGlvbiB0b2RheVNwYXJrUGF0aCgpOiBzdHJpbmcge1xuICByZXR1cm4gbm9ybWFsaXplUGF0aChgJHtTUEFSS19ESVJ9LyR7dG9kYXlEYXRlU3RyKCl9Lm1kYCk7XG59XG5cbi8qKlxuICogXHU4RkZEXHU1MkEwXHU0RTAwXHU2NzYxXHU5NjhGXHU2MjRCXHU4QkIwXHU1MjMwXHU0RUNBXHU2NUU1IERhaWx5bm90ZVx1MzAwMlxuICogLSBcdTUxOTlcdTUxNjVcdThERUZcdTVGODRcdTc4NkNcdTYwMjdcdTk2NTBcdTVCOUFcdTU3MjggaW5ib3gvIFx1NEU0Qlx1NEUwQlx1RkYwOFx1NTE5OVx1NTE2NVx1NjcwMFx1NUMwRlx1Njc0M1x1OTY1MFx1RkYwQ1NQRUMgMi4yIzZcdUZGMDlcbiAqIC0gYXBwZW5kLW9ubHlcdUZGMDhcdTRFOTFcdTU0MENcdTZCNjVcdTUxQjJcdTdBODFcdTk3NjJcdTY3MDBcdTVDMEZcdUZGMENTUEVDIFx1MDBBN1x1NTE2RFx1RkYwOVxuICogLSBWYXVsdC5wcm9jZXNzIFx1NTM5Rlx1NUI1MFx1OEJGQlx1NjUzOVx1NTE5OVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYXBwZW5kU3BhcmsoYXBwOiBBcHAsIHRleHQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gIC8vIFx1ODlDNFx1ODMwM1x1NTMxNlx1NjM2Mlx1ODg0Q1x1RkYxQVxcclxcbiBcdTIxOTIgXFxuXHVGRjFCXHU5NjMyIE5VTFx1RkYxQlx1NTkxQVx1ODg0Q1x1NTE4NVx1NUJCOVx1NjMwOSBTUEVDIFx1MDBBN1x1NTE2RFx1N0YyOVx1OEZEQlx1NEUzQVx1NUI1MFx1ODg0Q1x1RkYwOFx1NEZERCBhcHBlbmQtb25seSBcdTUzNTVcdTg4NENcdTk5OTZcdTY4M0NcdTVGMEZcdUZGMDlcbiAgY29uc3Qgbm9ybWFsaXplZCA9IHRleHQucmVwbGFjZSgvXFxyXFxuPy9nLCBcIlxcblwiKS5yZXBsYWNlKC9cXHUwMDAwL2csIFwiXCIpO1xuICBjb25zdCB0cmltbWVkID0gbm9ybWFsaXplZC50cmltKCk7XG4gIGlmICghdHJpbW1lZCkgdGhyb3cgbmV3IEVycm9yKFwiXHU1MTg1XHU1QkI5XHU0RTNBXHU3QTdBXCIpO1xuICBjb25zdCBpbmRlbnRlZCA9IHRyaW1tZWQucmVwbGFjZSgvXFxuL2csIFwiXFxuICBcIik7XG5cbiAgY29uc3QgcGF0aCA9IHRvZGF5U3BhcmtQYXRoKCk7XG4gIGlmICghcGF0aC5zdGFydHNXaXRoKFwiaW5ib3gvXCIpKSB0aHJvdyBuZXcgRXJyb3IoYFx1NjJEMlx1N0VERFx1NTE5OVx1NTE2NSBpbmJveC8gXHU0RTRCXHU1OTE2XHVGRjFBJHtwYXRofWApO1xuXG4gIGF3YWl0IGVuc3VyZUZvbGRlcihhcHAsIFNQQVJLX0RJUik7XG5cbiAgY29uc3QgZW50cnkgPSBzZXJpYWxpemVTcGFyayhub3dUaW1lU3RyKCksIGluZGVudGVkKTtcbiAgY29uc3QgZXhpc3RpbmcgPSBhcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKHBhdGgpO1xuXG4gIGlmICghKGV4aXN0aW5nIGluc3RhbmNlb2YgVEZpbGUpKSB7XG4gICAgY29uc3QgaGVhZGVyID1cbiAgICAgIGAtLS1cXG5gICtcbiAgICAgIGB0eXBlOiBkYWlseW5vdGVcXG5gICtcbiAgICAgIGBkYXRlOiAke3RvZGF5RGF0ZVN0cigpfVxcbmAgK1xuICAgICAgYHRhZ3M6XFxuICAtIGluYm94L3NwYXJrXFxuYCArXG4gICAgICBgLS0tXFxuXFxuYDtcbiAgICBhd2FpdCBhcHAudmF1bHQuY3JlYXRlKHBhdGgsIGhlYWRlciArIGVudHJ5ICsgXCJcXG5cIik7XG4gIH0gZWxzZSB7XG4gICAgYXdhaXQgYXBwLnZhdWx0LnByb2Nlc3MoZXhpc3RpbmcsIChkYXRhKSA9PiB7XG4gICAgICBjb25zdCBuZWVkc05sID0gZGF0YS5sZW5ndGggPiAwICYmICFkYXRhLmVuZHNXaXRoKFwiXFxuXCIpO1xuICAgICAgcmV0dXJuIGRhdGEgKyAobmVlZHNObCA/IFwiXFxuXCIgOiBcIlwiKSArIGVudHJ5ICsgXCJcXG5cIjtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gcGF0aDtcbn1cblxuLyoqIFx1OEJGQlx1NTNENlx1NEVDQVx1NjVFNVx1NjI0MFx1NjcwOSBzcGFyayBcdTY3NjFcdTc2RUVcdUZGMDhcdTYzMDlcdTY1ODdcdTRFRjZcdTUxRkFcdTczQjBcdTk4N0FcdTVFOEZcdUZGMENcdTUzNzNcdTY1RjZcdTk1RjRcdTUzNDdcdTVFOEZcdUZGMDkgKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWFkVG9kYXlTcGFya3MoYXBwOiBBcHApOiBQcm9taXNlPFNwYXJrRW50cnlbXT4ge1xuICBjb25zdCBwYXRoID0gdG9kYXlTcGFya1BhdGgoKTtcbiAgY29uc3QgZmlsZSA9IGFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgocGF0aCk7XG4gIGlmICghKGZpbGUgaW5zdGFuY2VvZiBURmlsZSkpIHJldHVybiBbXTtcbiAgY29uc3QgY29udGVudCA9IGF3YWl0IGFwcC52YXVsdC5jYWNoZWRSZWFkKGZpbGUpO1xuICByZXR1cm4gcGFyc2VTcGFya0NvbnRlbnQoY29udGVudCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGVuc3VyZUZvbGRlcihhcHA6IEFwcCwgZm9sZGVyOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgZXhpc3RpbmcgPSBhcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKGZvbGRlcik7XG4gIGlmIChleGlzdGluZyBpbnN0YW5jZW9mIFRGb2xkZXIpIHJldHVybjtcbiAgaWYgKGV4aXN0aW5nKSB0aHJvdyBuZXcgRXJyb3IoYFx1OERFRlx1NUY4NFx1NURGMlx1NUI1OFx1NTcyOFx1NEY0Nlx1NEUwRFx1NjYyRlx1NjU4N1x1NEVGNlx1NTkzOVx1RkYxQSR7Zm9sZGVyfWApO1xuICBjb25zdCBwYXJ0cyA9IGZvbGRlci5zcGxpdChcIi9cIik7XG4gIGxldCBjdXIgPSBcIlwiO1xuICBmb3IgKGNvbnN0IHAgb2YgcGFydHMpIHtcbiAgICBjdXIgPSBjdXIgPyBgJHtjdXJ9LyR7cH1gIDogcDtcbiAgICBpZiAoIWFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoY3VyKSkge1xuICAgICAgYXdhaXQgYXBwLnZhdWx0LmNyZWF0ZUZvbGRlcihjdXIpO1xuICAgIH1cbiAgfVxufVxuXG4vKiogXHU1MTY4XHU1QzQwXHU1RkVCXHU5MDFGXHU2MzU1XHU4M0I3IE1vZGFsIFx1MjAxNFx1MjAxNCBcdTRGOUJcdTU0N0RcdTRFRTRcdTk3NjJcdTY3N0YvXHU1RkVCXHU2Mzc3XHU5NTJFXHU4QzAzXHU3NTI4ICovXG5leHBvcnQgY2xhc3MgU3BhcmtNb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgcHJpdmF0ZSBvblN1Ym1pdDogKHRleHQ6IHN0cmluZykgPT4gUHJvbWlzZTx2b2lkPiB8IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIG9uU3VibWl0OiAodGV4dDogc3RyaW5nKSA9PiBQcm9taXNlPHZvaWQ+IHwgdm9pZCkge1xuICAgIHN1cGVyKGFwcCk7XG4gICAgdGhpcy5vblN1Ym1pdCA9IG9uU3VibWl0O1xuICB9XG5cbiAgb25PcGVuKCkge1xuICAgIGNvbnN0IHsgY29udGVudEVsLCB0aXRsZUVsIH0gPSB0aGlzO1xuICAgIHRpdGxlRWwuc2V0VGV4dChcIlx1MjZBMSBcdTk2OEZcdTYyNEJcdThCQjBcIik7XG5cbiAgICBjb25zdCBpbnB1dCA9IGNvbnRlbnRFbC5jcmVhdGVFbChcImlucHV0XCIsIHtcbiAgICAgIGNsczogXCJrdy1tb2RhbC1pbnB1dFwiLFxuICAgICAgYXR0cjogeyB0eXBlOiBcInRleHRcIiwgcGxhY2Vob2xkZXI6IFwiXHU4RjkzXHU1MTY1XHU1MTg1XHU1QkI5XHVGRjBDXHU1NkRFXHU4RjY2XHU1MzczXHU1QjU4XHU1MjMwXHU0RUNBXHU2NUU1IERhaWx5bm90ZVx1MjAyNlwiIH0sXG4gICAgfSk7XG4gICAgaW5wdXQuZm9jdXMoKTtcblxuICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGFzeW5jIChlKSA9PiB7XG4gICAgICBpZiAoZS5rZXkgPT09IFwiRW50ZXJcIikge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGNvbnN0IHYgPSBpbnB1dC52YWx1ZS50cmltKCk7XG4gICAgICAgIGlmICghdikgcmV0dXJuO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGF3YWl0IHRoaXMub25TdWJtaXQodik7XG4gICAgICAgICAgbmV3IE5vdGljZShcIlx1NURGMlx1OEZGRFx1NTJBMFx1NTIzMFx1NEVDQVx1NjVFNVx1OTY4Rlx1NjI0Qlx1OEJCMFwiKTtcbiAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIG5ldyBOb3RpY2UoYFx1NEZERFx1NUI1OFx1NTkzMVx1OEQyNVx1RkYxQSR7KGVyciBhcyBFcnJvcikubWVzc2FnZX1gKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChlLmtleSA9PT0gXCJFc2NhcGVcIikge1xuICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBvbkNsb3NlKCkge1xuICAgIHRoaXMuY29udGVudEVsLmVtcHR5KCk7XG4gIH1cbn1cbiIsICJjb25zdCBwMiA9IChuOiBudW1iZXIpID0+IG4udG9TdHJpbmcoKS5wYWRTdGFydCgyLCBcIjBcIik7XG5cbi8qKiBcdTY3MkNcdTU3MzBcdTY1RjZcdTUzM0EgWVlZWS1NTS1ERCAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvZGF5RGF0ZVN0cihkOiBEYXRlID0gbmV3IERhdGUoKSk6IHN0cmluZyB7XG4gIHJldHVybiBgJHtkLmdldEZ1bGxZZWFyKCl9LSR7cDIoZC5nZXRNb250aCgpICsgMSl9LSR7cDIoZC5nZXREYXRlKCkpfWA7XG59XG5cbi8qKiBcdTY3MkNcdTU3MzBcdTY1RjZcdTUzM0EgSEg6bW0gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3dUaW1lU3RyKGQ6IERhdGUgPSBuZXcgRGF0ZSgpKTogc3RyaW5nIHtcbiAgcmV0dXJuIGAke3AyKGQuZ2V0SG91cnMoKSl9OiR7cDIoZC5nZXRNaW51dGVzKCkpfWA7XG59XG4iLCAiLyoqXG4gKiBcdTk2OEZcdTYyNEJcdThCQjBcdTg4NENcdTg5RTNcdTY3OTBcdTMwMDJTUEVDIFx1N0VBNlx1NUI5QVx1NzY4NFx1NjgzQ1x1NUYwRlx1RkYxQWAtICoqSEg6bW0qKiBcdTUxODVcdTVCQjlgXHUzMDAyXG4gKiBcdTRFMERcdTUzMzlcdTkxNERcdTc2ODRcdTg4NENcdTUzOUZcdTY4MzdcdTVGRkRcdTc1NjVcdUZGMDhcdTg5RTNcdTY3OTBcdTVCQkRcdTVCQjlcdTUzOUZcdTUyMTlcdUZGMENcdTg5QzEgU1BFQyAyLjIjN1x1RkYwOVx1MzAwMlxuICovXG5cbmV4cG9ydCBpbnRlcmZhY2UgU3BhcmtFbnRyeSB7XG4gIHRpbWU6IHN0cmluZzsgLy8gSEg6bW1cbiAgdGV4dDogc3RyaW5nO1xufVxuXG5jb25zdCBTUEFSS19SRSA9IC9eLSBcXCpcXCooXFxkezJ9OlxcZHsyfSlcXCpcXCpcXHMrKC4rKSQvO1xuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VTcGFya0xpbmUobGluZTogc3RyaW5nKTogU3BhcmtFbnRyeSB8IG51bGwge1xuICBjb25zdCBtID0gU1BBUktfUkUuZXhlYyhsaW5lKTtcbiAgcmV0dXJuIG0gPyB7IHRpbWU6IG1bMV0sIHRleHQ6IG1bMl0gfSA6IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVNwYXJrQ29udGVudChjb250ZW50OiBzdHJpbmcpOiBTcGFya0VudHJ5W10ge1xuICBjb25zdCBvdXQ6IFNwYXJrRW50cnlbXSA9IFtdO1xuICBmb3IgKGNvbnN0IGxpbmUgb2YgY29udGVudC5zcGxpdCgvXFxyP1xcbi8pKSB7XG4gICAgY29uc3QgZSA9IHBhcnNlU3BhcmtMaW5lKGxpbmUpO1xuICAgIGlmIChlKSBvdXQucHVzaChlKTtcbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG4vKiogXHU1RThGXHU1MjE3XHU1MzE2XHU0RTAwXHU2NzYxIHNwYXJrIFx1ODg0Q1x1RkYwOFx1NTkxQVx1ODg0Q1x1NTE4NVx1NUJCOVx1NUI1MFx1ODg0Q1x1N0YyOVx1OEZEQlx1NEUyNFx1NjgzQ1x1RkYwOSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNlcmlhbGl6ZVNwYXJrKHRpbWU6IHN0cmluZywgdGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgbGluZXMgPSB0ZXh0LnNwbGl0KC9cXHI/XFxuLyk7XG4gIGNvbnN0IGZpcnN0ID0gbGluZXMuc2hpZnQoKSA/PyBcIlwiO1xuICBjb25zdCByZXN0ID0gbGluZXMubWFwKChsKSA9PiBgICAke2x9YCkuam9pbihcIlxcblwiKTtcbiAgcmV0dXJuIHJlc3QgPyBgLSAqKiR7dGltZX0qKiAke2ZpcnN0fVxcbiR7cmVzdH1gIDogYC0gKioke3RpbWV9KiogJHtmaXJzdH1gO1xufVxuIiwgImltcG9ydCB7IEFwcCwgTm90aWNlLCBURmlsZSwgc2V0SWNvbiB9IGZyb20gXCJvYnNpZGlhblwiO1xuaW1wb3J0IHR5cGUgV29ya2JlbmNoUGx1Z2luIGZyb20gXCIuLi9tYWluXCI7XG5pbXBvcnQgeyBhcHBlbmRTcGFyaywgcmVhZFRvZGF5U3BhcmtzLCB0b2RheVNwYXJrUGF0aCwgU3BhcmtFbnRyeSB9IGZyb20gXCIuL2luZGV4XCI7XG5pbXBvcnQgeyB0b2RheURhdGVTdHIgfSBmcm9tIFwiLi4vdXRpbFwiO1xuaW1wb3J0IHtcbiAgYXBwZW5kU291cmNlTGlua1RvU3BhcmssXG4gIGNvbnZlcnRTcGFya1RvRHJhZnQsXG4gIGRlZmF1bHREcmFmdFRpdGxlLFxuICBoYXNTb3VyY2VMaW5rLFxuICBzcGFya0VudHJ5VG9MaW5lLFxufSBmcm9tIFwiLi9jb252ZXJ0XCI7XG5pbXBvcnQgeyBEcmFmdFRpdGxlTW9kYWwgfSBmcm9tIFwiLi9kcmFmdC1tb2RhbFwiO1xuaW1wb3J0IHsgU3BhcmtTZWFyY2hNb2RhbCB9IGZyb20gXCIuL3NlYXJjaC1tb2RhbFwiO1xuaW1wb3J0IHsgUXVpY2tBZGRUYXNrTW9kYWwgfSBmcm9tIFwiLi4vdGFza3MvbW9kYWxzXCI7XG5cbnR5cGUgTW9kZSA9IFwiZGVmYXVsdFwiIHwgXCJ0aW1lbGluZVwiO1xuXG4vKipcbiAqIFx1OTY4Rlx1NjI0Qlx1OEJCMFx1NkEyMVx1NTc1N1x1NUMwMVx1ODhDNVx1MzAwMlxuICogXHU5ODc2XHU5MEU4XHU4RjkzXHU1MTY1XHU1MzNBICsgXHU0RkE3XHU4RkI5XHUzMDBDXHU0RUNBXHU2NUU1XHU5NjhGXHU2MjRCXHU4QkIwXHUzMDBEXHU1MjE3XHU4ODY4XHU3NTMxXHU2NzJDXHU3QzdCXHU3RURGXHU0RTAwXHU2MzAxXHU2NzA5XHUzMDAyXG4gKiBWaWV3IFx1NUM0Mlx1OTAxQVx1OEZDNyBgaXNJbnB1dEZvY3VzZWQoKWAgLyBgY29uc3VtZVN1cHByZXNzRmxhZygpYCBcdTRFMEVcdTY3MkNcdTdDN0JcdTUzNEZcdTRGNUNcdUZGMENcbiAqIFx1OTA3Rlx1NTE0RFx1ODFFQVx1OEVBQlx1NTE5OVx1NTE2NVx1ODlFNlx1NTNEMVx1NTIzN1x1NjVCMFx1NjI1M1x1NjVBRFx1NzUyOFx1NjIzN1x1OEY5M1x1NTE2NVx1RkYwOFNQRUMgXHUwMEE3N1x1RkYwOVx1MzAwMlxuICovXG5leHBvcnQgY2xhc3MgU3BhcmtzU2VjdGlvbiB7XG4gIHByaXZhdGUgaW5wdXRFbCE6IEhUTUxJbnB1dEVsZW1lbnQ7XG4gIHByaXZhdGUgbGlzdEVsITogSFRNTEVsZW1lbnQ7XG4gIHByaXZhdGUgc3VwcHJlc3NOZXh0UmVmcmVzaCA9IGZhbHNlO1xuICAvKiogXHU0RkE3XHU4RkI5XHU5NzYyXHU2NzdGXHU2NjNFXHU3OTNBXHU2QTIxXHU1RjBGXHVGRjFCc2Vzc2lvbiBcdTUxODVcdTUyMDdcdTYzNjJcdUZGMENcdTRFMERcdTYzMDFcdTRFNDVcdTUzMTYgKi9cbiAgcHJpdmF0ZSBtb2RlOiBNb2RlID0gXCJkZWZhdWx0XCI7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSBhcHA6IEFwcCxcbiAgICAvLyBwbHVnaW4gXHU3M0IwXHU5NjM2XHU2QkI1XHU2NzJBXHU3NkY0XHU2M0E1XHU0RjdGXHU3NTI4XHVGRjBDXHU0RkREXHU3NTU5XHU0RUU1XHU1QkY5XHU5RjUwIE1hdHJpeFNlY3Rpb24vVGFza3NTZWN0aW9uIFx1NzY4NFx1Njc4NFx1OTAyMFx1N0I3RVx1NTQwRFx1RkYwQ1xuICAgIC8vIFx1NTQwRVx1N0VFRCBNNSBcdThGNkNcdTRFRkJcdTUyQTEvXHU4RjZDXHU4MzQ5XHU3QTNGL1x1NjVGNlx1OTVGNFx1OEY3NC9cdTY0MUNcdTdEMjJcdTRGMUFcdTc1MjhcdTUyMzBcdThCQkVcdTdGNkVcdTRFMEVcdTU0N0RcdTRFRTRcdTZDRThcdTUxOENcbiAgICBwcml2YXRlIHJlYWRvbmx5IHBsdWdpbjogV29ya2JlbmNoUGx1Z2luLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgYmFyQ29udGFpbmVyOiBIVE1MRWxlbWVudCxcbiAgICBwcml2YXRlIHJlYWRvbmx5IHBhbmVsQ29udGFpbmVyOiBIVE1MRWxlbWVudCxcbiAgKSB7fVxuXG4gIHJlbmRlcigpOiB2b2lkIHtcbiAgICB0aGlzLnJlbmRlckJhcigpO1xuICAgIHRoaXMucmVuZGVyUGFuZWwoKTtcbiAgICB2b2lkIHRoaXMucmVmcmVzaCgpO1xuICB9XG5cbiAgLyoqIFx1OEY5M1x1NTE2NVx1Njg0Nlx1NjYyRlx1NTQyNlx1NTkwNFx1NEU4RVx1ODA1QVx1NzEyNlx1NjAwMVx1MjAxNFx1MjAxNFx1NEY5QiBWaWV3IFx1NTIyNFx1NjVBRFx1NjYyRlx1NTQyNlx1NjY4Mlx1N0YxM1x1NTIzN1x1NjVCMCAqL1xuICBpc0lucHV0Rm9jdXNlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuYWN0aXZlRWxlbWVudCA9PT0gdGhpcy5pbnB1dEVsO1xuICB9XG5cbiAgLyoqIFx1NkQ4OFx1OEQzOVx1NEUwMFx1NkIyMVx1MzAwQ1x1ODFFQVx1OEVBQlx1NTE5OVx1NTE2NVx1NjI5MVx1NTIzNlx1NTIzN1x1NjVCMFx1MzAwRFx1NjgwN1x1NUZEN1x1MzAwMlx1OEZENFx1NTZERSB0cnVlIFx1ODg2OFx1NzkzQVx1NjcyQ1x1NkIyMVx1NEU4Qlx1NEVGNlx1NUU5NFx1ODhBQlx1NUZGRFx1NzU2NSAqL1xuICBjb25zdW1lU3VwcHJlc3NGbGFnKCk6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLnN1cHByZXNzTmV4dFJlZnJlc2gpIHtcbiAgICAgIHRoaXMuc3VwcHJlc3NOZXh0UmVmcmVzaCA9IGZhbHNlO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGFzeW5jIHJlZnJlc2goKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCF0aGlzLmxpc3RFbCkgcmV0dXJuO1xuICAgIGNvbnN0IGVudHJpZXMgPSBhd2FpdCByZWFkVG9kYXlTcGFya3ModGhpcy5hcHApO1xuICAgIHRoaXMubGlzdEVsLmVtcHR5KCk7XG4gICAgaWYgKGVudHJpZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLmxpc3RFbC5jcmVhdGVEaXYoeyBjbHM6IFwia3ctZW1wdHlcIiwgdGV4dDogXCJcdTRFQ0FcdTY1RTVcdTY2ODJcdTY1RTBcdTk2OEZcdTYyNEJcdThCQjBcIiB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRoaXMubW9kZSA9PT0gXCJ0aW1lbGluZVwiKSB7XG4gICAgICAvLyBcdTY1RjZcdTk1RjRcdThGNzRcdUZGMUFcdTUxNjhcdTU5MjlcdTY1RjZcdTk1RjRcdTcwQjlcdTdBRDZcdTYzOTJcdUZGMENcdTZCNjNcdTVFOEZcdUZGMDhcdTY1RTkgXHUyMTkyIFx1NjY1QVx1RkYwOVx1RkYwQ1x1NkJDRlx1Njc2MVx1NTQyQlx1NkVBRlx1NkU5MFx1NEUwRVx1OEY2Q1x1NjM2Mlx1NjMwOVx1OTRBRVxuICAgICAgdGhpcy5saXN0RWwuYWRkQ2xhc3MoXCJpcy10aW1lbGluZVwiKTtcbiAgICAgIGVudHJpZXMuZm9yRWFjaCgoZSkgPT4gdGhpcy5yZW5kZXJTcGFya0l0ZW0oZSwgLyogdGltZWxpbmUgKi8gdHJ1ZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBcdTlFRDhcdThCQTRcdUZGMUFcdTY3MDBcdThGRDEgNSBcdTY3NjFcdTUwMTJcdTVFOEZcbiAgICAgIHRoaXMubGlzdEVsLnJlbW92ZUNsYXNzKFwiaXMtdGltZWxpbmVcIik7XG4gICAgICBlbnRyaWVzLnNsaWNlKC01KS5yZXZlcnNlKCkuZm9yRWFjaCgoZSkgPT4gdGhpcy5yZW5kZXJTcGFya0l0ZW0oZSwgZmFsc2UpKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlbmRlckJhcigpOiB2b2lkIHtcbiAgICB0aGlzLmJhckNvbnRhaW5lci5lbXB0eSgpO1xuICAgIHRoaXMuYmFyQ29udGFpbmVyLmFkZENsYXNzKFwia3ctc3BhcmtiYXJcIik7XG4gICAgdGhpcy5iYXJDb250YWluZXIuY3JlYXRlU3Bhbih7IGNsczogXCJrdy1wcmVmaXhcIiwgdGV4dDogXCJcdTI2QTEgXHU5NjhGXHU2MjRCXHU4QkIwXCIgfSk7XG4gICAgdGhpcy5pbnB1dEVsID0gdGhpcy5iYXJDb250YWluZXIuY3JlYXRlRWwoXCJpbnB1dFwiLCB7XG4gICAgICBjbHM6IFwia3ctc3BhcmstaW5wdXRcIixcbiAgICAgIGF0dHI6IHsgdHlwZTogXCJ0ZXh0XCIsIHBsYWNlaG9sZGVyOiBcIlx1NTZERVx1OEY2Nlx1NTM3M1x1NUI1OFx1NTIzMFx1NEVDQVx1NjVFNSBEYWlseW5vdGVcdTIwMjZcIiB9LFxuICAgIH0pO1xuICAgIHRoaXMuYmFyQ29udGFpbmVyLmNyZWF0ZVNwYW4oeyBjbHM6IFwia3ctaGludFwiLCB0ZXh0OiBcIkVudGVyXCIgfSk7XG4gICAgdGhpcy5pbnB1dEVsLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGFzeW5jIChlKSA9PiB7XG4gICAgICBpZiAoZS5rZXkgIT09IFwiRW50ZXJcIikgcmV0dXJuO1xuICAgICAgY29uc3QgdiA9IHRoaXMuaW5wdXRFbC52YWx1ZS50cmltKCk7XG4gICAgICBpZiAoIXYpIHJldHVybjtcbiAgICAgIHRoaXMuaW5wdXRFbC52YWx1ZSA9IFwiXCI7XG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLnN1cHByZXNzTmV4dFJlZnJlc2ggPSB0cnVlO1xuICAgICAgICBjb25zdCBwYXRoID0gYXdhaXQgYXBwZW5kU3BhcmsodGhpcy5hcHAsIHYpO1xuICAgICAgICBuZXcgTm90aWNlKGBcdTVERjJcdThGRkRcdTUyQTBcdTUyMzAgJHtwYXRofWApO1xuICAgICAgICBhd2FpdCB0aGlzLnJlZnJlc2goKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICB0aGlzLnN1cHByZXNzTmV4dFJlZnJlc2ggPSBmYWxzZTtcbiAgICAgICAgbmV3IE5vdGljZShgXHU0RkREXHU1QjU4XHU1OTMxXHU4RDI1XHVGRjFBJHsoZXJyIGFzIEVycm9yKS5tZXNzYWdlfWApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJQYW5lbCgpOiB2b2lkIHtcbiAgICB0aGlzLnBhbmVsQ29udGFpbmVyLmVtcHR5KCk7XG4gICAgdGhpcy5wYW5lbENvbnRhaW5lci5hZGRDbGFzcyhcImt3LXBhbmVsXCIpO1xuICAgIHRoaXMucGFuZWxDb250YWluZXIuYWRkQ2xhc3MoXCJrdy1wYW5lbC1zcGFya3NcIik7XG4gICAgY29uc3QgaGVhZCA9IHRoaXMucGFuZWxDb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcImt3LXBhbmVsLWhlYWRcIiB9KTtcbiAgICBoZWFkLmNyZWF0ZVNwYW4oeyB0ZXh0OiBcIlx1MjZBMSBcdTRFQ0FcdTY1RTVcdTk2OEZcdTYyNEJcdThCQjBcIiB9KTtcbiAgICBoZWFkLmNyZWF0ZVNwYW4oeyBjbHM6IFwia3ctZGF0ZVwiLCB0ZXh0OiB0b2RheURhdGVTdHIoKSB9KTtcblxuICAgIC8vIFx1NkEyMVx1NUYwRlx1NTIwN1x1NjM2Mlx1NjMwOVx1OTRBRVx1RkYwOFx1NTNGM1x1NEUwQVx1ODlEMlx1RkYwOVxuICAgIGNvbnN0IHNlYXJjaCA9IGhlYWQuY3JlYXRlU3Bhbih7IGNsczogXCJrdy1tb2RlLXRvZ2dsZVwiIH0pO1xuICAgIHNldEljb24oc2VhcmNoLCBcInNlYXJjaFwiKTtcbiAgICBzZWFyY2guc2V0QXR0cihcInRpdGxlXCIsIFwiXHU2NDFDXHU3RDIyXHU2MjQwXHU2NzA5XHU5NjhGXHU2MjRCXHU4QkIwXCIpO1xuICAgIHNlYXJjaC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgbmV3IFNwYXJrU2VhcmNoTW9kYWwodGhpcy5hcHApLm9wZW4oKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IHRvZ2dsZSA9IGhlYWQuY3JlYXRlU3Bhbih7XG4gICAgICBjbHM6IFwia3ctbW9kZS10b2dnbGVcIiArICh0aGlzLm1vZGUgPT09IFwidGltZWxpbmVcIiA/IFwiIGlzLWFjdGl2ZVwiIDogXCJcIiksXG4gICAgfSk7XG4gICAgc2V0SWNvbih0b2dnbGUsIHRoaXMubW9kZSA9PT0gXCJ0aW1lbGluZVwiID8gXCJsaXN0XCIgOiBcImNsb2NrXCIpO1xuICAgIHRvZ2dsZS5zZXRBdHRyKFxuICAgICAgXCJ0aXRsZVwiLFxuICAgICAgdGhpcy5tb2RlID09PSBcInRpbWVsaW5lXCIgPyBcIlx1NTIwN1x1NTZERVx1OUVEOFx1OEJBNFx1ODlDNlx1NTZGRVwiIDogXCJcdTUyMDdcdTYzNjJcdTUyMzBcdTY1RjZcdTk1RjRcdThGNzRcdUZGMDhcdTVGNTNcdTY1RTVcdTUxNjhcdTkwRThcdUZGMDlcIixcbiAgICApO1xuICAgIHRvZ2dsZS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgdGhpcy5tb2RlID0gdGhpcy5tb2RlID09PSBcInRpbWVsaW5lXCIgPyBcImRlZmF1bHRcIiA6IFwidGltZWxpbmVcIjtcbiAgICAgIC8vIFx1NTNFQVx1OTcwMFx1OTFDRFx1NkUzMlx1NjdEMyBwYW5lbFx1RkYwOFx1NEZERFx1NjMwMVx1OEY5M1x1NTE2NVx1Njg0Nlx1NzJCNlx1NjAwMVx1NEUwRFx1NTNEOFx1RkYwOVxuICAgICAgdGhpcy5yZW5kZXJQYW5lbCgpO1xuICAgICAgdm9pZCB0aGlzLnJlZnJlc2goKTtcbiAgICB9KTtcblxuICAgIHRoaXMubGlzdEVsID0gdGhpcy5wYW5lbENvbnRhaW5lci5jcmVhdGVEaXYoe1xuICAgICAgY2xzOiBcImt3LXBhbmVsLWJvZHkga3ctc3BhcmstbGlzdFwiLFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJTcGFya0l0ZW0oZW50cnk6IFNwYXJrRW50cnksIHRpbWVsaW5lOiBib29sZWFuKTogdm9pZCB7XG4gICAgY29uc3QgZWwgPSB0aGlzLmxpc3RFbC5jcmVhdGVEaXYoe1xuICAgICAgY2xzOiBcImt3LXNwYXJrLWl0ZW1cIiArICh0aW1lbGluZSA/IFwiIGt3LXNwYXJrLXRsXCIgOiBcIlwiKSxcbiAgICB9KTtcbiAgICBlbC5jcmVhdGVTcGFuKHsgY2xzOiBcImt3LXRpbWVcIiwgdGV4dDogZW50cnkudGltZSB9KTtcbiAgICBlbC5jcmVhdGVTcGFuKHsgY2xzOiBcImt3LWNvbnRlbnRcIiwgdGV4dDogZW50cnkudGV4dCB9KTtcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgZmlsZSA9IHRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aCh0b2RheVNwYXJrUGF0aCgpKTtcbiAgICAgIGlmIChmaWxlIGluc3RhbmNlb2YgVEZpbGUpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5hcHAud29ya3NwYWNlLmdldExlYWYoZmFsc2UpLm9wZW5GaWxlKGZpbGUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gXHU1REYyXHU1NDJCXHU2RUFGXHU2RTkwXHU2ODA3XHU4QkIwIFx1MjE5MiBcdTk2OTBcdTg1Q0ZcdTMwMENcdThGNkNcdTgzNDlcdTdBM0ZcdTMwMERcdTYzMDlcdTk0QUVcdTk2MzJcdTkxQ0RcdTU5MERcdUZGMUJcdTMwMENcdThGNkNcdTRFRkJcdTUyQTFcdTMwMERcdTU5Q0JcdTdFQzhcdTUxNDFcdThCQjhcbiAgICBjb25zdCBhY3Rpb25zID0gZWwuY3JlYXRlRGl2KHsgY2xzOiBcImt3LXNwYXJrLWFjdGlvbnNcIiB9KTtcbiAgICBjb25zdCB0b1Rhc2tCdG4gPSBhY3Rpb25zLmNyZWF0ZVNwYW4oe1xuICAgICAgY2xzOiBcImt3LXNwYXJrLWFjdFwiLFxuICAgICAgdGV4dDogXCJcdTIxOTJcdTRFRkJcdTUyQTFcIixcbiAgICB9KTtcbiAgICB0b1Rhc2tCdG4uc2V0QXR0cihcInRpdGxlXCIsIFwiXHU4RjZDXHU0RTNBXHU0RUZCXHU1MkExXCIpO1xuICAgIHRvVGFza0J0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGUpID0+IHtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICB0aGlzLm9uQ29udmVydFRvVGFzayhlbnRyeSk7XG4gICAgfSk7XG4gICAgaWYgKCFoYXNTb3VyY2VMaW5rKGVudHJ5LnRleHQpKSB7XG4gICAgICBjb25zdCB0b0RyYWZ0QnRuID0gYWN0aW9ucy5jcmVhdGVTcGFuKHtcbiAgICAgICAgY2xzOiBcImt3LXNwYXJrLWFjdFwiLFxuICAgICAgICB0ZXh0OiBcIlx1MjE5Mlx1ODM0OVx1N0EzRlwiLFxuICAgICAgfSk7XG4gICAgICB0b0RyYWZ0QnRuLnNldEF0dHIoXCJ0aXRsZVwiLCBcIlx1OEY2Q1x1NEUzQVx1ODM0OVx1N0EzRlwiKTtcbiAgICAgIHRvRHJhZnRCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlKSA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRoaXMub25Db252ZXJ0VG9EcmFmdChlbnRyeSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvLyA9PT09PT09PT09PT09PT09PT09PSBcdThGNkNcdTYzNjIgPT09PT09PT09PT09PT09PT09PT1cblxuICBwcml2YXRlIG9uQ29udmVydFRvVGFzayhlbnRyeTogU3BhcmtFbnRyeSk6IHZvaWQge1xuICAgIC8vIFx1NzZGNFx1NjNBNVx1NjI1M1x1NUYwMFx1NUZFQlx1OTAxRlx1NkRGQlx1NTJBMFx1NEVGQlx1NTJBMSBNb2RhbFx1RkYwQ1x1OTg4NFx1NTg2QiBzcGFyayBcdTY1ODdcdTY3MkNcbiAgICB2b2lkIHRoaXMucGx1Z2luOyAvLyBcdTRGRERcdTc1NTlcdTVGMTVcdTc1MjhcdUZGMENcdTkwN0ZcdTUxNEQgVFMgXHU2NzJBXHU0RjdGXHU3NTI4XHU1NDRBXHU4QjY2XHVGRjA4XHU1NDBFXHU3RUVEXHU1M0VGXHU4MEZEXHU4QkZCIHNldHRpbmdzXHVGRjA5XG4gICAgbmV3IFF1aWNrQWRkVGFza01vZGFsKHRoaXMuYXBwLCB7XG4gICAgICBwcmVmaWxsVGV4dDogZW50cnkudGV4dCxcbiAgICB9KS5vcGVuKCk7XG4gIH1cblxuICBwcml2YXRlIG9uQ29udmVydFRvRHJhZnQoZW50cnk6IFNwYXJrRW50cnkpOiB2b2lkIHtcbiAgICBjb25zdCBkYWlseVBhdGggPSB0b2RheVNwYXJrUGF0aCgpO1xuICAgIG5ldyBEcmFmdFRpdGxlTW9kYWwoXG4gICAgICB0aGlzLmFwcCxcbiAgICAgIGRlZmF1bHREcmFmdFRpdGxlKGVudHJ5LnRleHQpLFxuICAgICAgYXN5bmMgKHRpdGxlKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhdGggPSBhd2FpdCBjb252ZXJ0U3BhcmtUb0RyYWZ0KFxuICAgICAgICAgIHRoaXMuYXBwLFxuICAgICAgICAgIGVudHJ5LnRleHQsXG4gICAgICAgICAgZGFpbHlQYXRoLFxuICAgICAgICAgIHRpdGxlLFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBsaW5rID0gcGF0aC5yZXBsYWNlKC9cXC5tZCQvaSwgXCJcIik7XG4gICAgICAgIC8vIFx1OEZGRFx1NTJBMFx1NkVBRlx1NkU5MFx1OTRGRVx1NjNBNVx1NTIzMFx1NTM5RiBEYWlseW5vdGUgXHU4ODRDXHVGRjFCXHU1OTMxXHU4RDI1XHU0RTBEXHU1NkRFXHU2RURBXHU4MzQ5XHU3QTNGXHU2NTg3XHU0RUY2XHVGRjBDXHU0RjQ2XHU1RjM5IE5vdGljZVxuICAgICAgICB0cnkge1xuICAgICAgICAgIHRoaXMuc3VwcHJlc3NOZXh0UmVmcmVzaCA9IHRydWU7XG4gICAgICAgICAgYXdhaXQgYXBwZW5kU291cmNlTGlua1RvU3BhcmsoXG4gICAgICAgICAgICB0aGlzLmFwcCxcbiAgICAgICAgICAgIGRhaWx5UGF0aCxcbiAgICAgICAgICAgIHNwYXJrRW50cnlUb0xpbmUoZW50cnkpLFxuICAgICAgICAgICAgbGluayxcbiAgICAgICAgICApO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICB0aGlzLnN1cHByZXNzTmV4dFJlZnJlc2ggPSBmYWxzZTtcbiAgICAgICAgICBuZXcgTm90aWNlKFxuICAgICAgICAgICAgYFx1ODM0OVx1N0EzRlx1NURGMlx1NTIxQlx1NUVGQVx1NEY0Nlx1NkVBRlx1NkU5MFx1NTE5OVx1NTZERVx1NTkzMVx1OEQyNVx1RkYxQSR7KGVyciBhcyBFcnJvcikubWVzc2FnZX1gLFxuICAgICAgICAgICAgNjAwMCxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIG5ldyBOb3RpY2UoYFx1NURGMlx1NTIxQlx1NUVGQVx1ODM0OVx1N0EzRiAke3BhdGh9YCk7XG4gICAgICAgIGF3YWl0IHRoaXMucmVmcmVzaCgpO1xuICAgICAgfSxcbiAgICApLm9wZW4oKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IEFwcCwgbm9ybWFsaXplUGF0aCwgVEZpbGUgfSBmcm9tIFwib2JzaWRpYW5cIjtcbmltcG9ydCB7IHNhbml0aXplUGxhbkZpbGVOYW1lIH0gZnJvbSBcIi4uL3Rhc2tzL3Nhbml0aXplXCI7XG5pbXBvcnQgeyB0b2RheURhdGVTdHIgfSBmcm9tIFwiLi4vdXRpbFwiO1xuaW1wb3J0IHR5cGUgeyBTcGFya0VudHJ5IH0gZnJvbSBcIi4vcGFyc2VyXCI7XG5cbmNvbnN0IFNQQVJLX0RSQUZUX0RJUiA9IFwiaW5ib3gvc3BhcmtzXCI7IC8vIFx1NEUwRVx1NEUzQlx1OTg5OCBzcGFyayBcdTk4NzVcdTU0MENcdTdFQTdcdUZGMDhEYWlseW5vdGUgXHU2NjJGXHU1QjgzXHU3Njg0XHU1QjUwXHU3NkVFXHU1RjU1XHVGRjA5XG5jb25zdCBEQUlMWU5PVEVfUFJFRklYID0gXCJpbmJveC9zcGFya3MvRGFpbHlub3RlL1wiO1xuXG4vKiogXHU4RkQ4XHU1MzlGIFNwYXJrRW50cnkgXHU1QkY5XHU1RTk0XHU3Njg0IERhaWx5bm90ZSBcdTk5OTZcdTg4NENcdTVCNTdcdTk3NjJcdTkxQ0ZcdUZGMDhcdTU5MUFcdTg4NEMgc3BhcmsgXHU3Njg0XHU1QjUwXHU4ODRDXHU0RTBEXHU1NzI4XHU2QjY0XHU1MjE3XHVGRjA5ICovXG5leHBvcnQgZnVuY3Rpb24gc3BhcmtFbnRyeVRvTGluZShlOiBTcGFya0VudHJ5KTogc3RyaW5nIHtcbiAgcmV0dXJuIGAtICoqJHtlLnRpbWV9KiogJHtlLnRleHR9YDtcbn1cblxuLyoqIFx1NTIyNFx1NjVBRFx1NkI2NCBzcGFyayBcdTg4NENcdTY2MkZcdTU0MjZcdTVERjJcdTg4QUJcdThGNkNcdTYzNjJcdUZGMDhcdTU0MkJcdTZFQUZcdTZFOTBcdTk0RkVcdTYzQTVcdUZGMDkgKi9cbmV4cG9ydCBmdW5jdGlvbiBoYXNTb3VyY2VMaW5rKHRleHQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gLyBcdTIxOTIgXFxbXFxbLy50ZXN0KHRleHQpO1xufVxuXG4vKipcbiAqIFx1NTIxQlx1NUVGQSBzcGFyayBcdTgzNDlcdTdBM0ZcdUZGMUFgaW5ib3gvc3BhcmtzL1lZWVktTU0tREQtXHU2ODA3XHU5ODk4Lm1kYFxuICogZnJvbnRtYXR0ZXJcdUZGMUF0aXRsZSAvIHR5cGU6IHNwYXJrLWRyYWZ0IC8gY3JlYXRlZCAvIHNvdXJjZVx1RkYwOFx1NjMwN1x1NTQxMVx1NTM5RiBEYWlseW5vdGVcdUZGMDlcbiAqIFx1NkI2M1x1NjU4N1x1RkYxQVx1NTM5RiBzcGFyayBcdTUxODVcdTVCQjlcdTRGNUNcdTRFM0FcdTVGMTVcdThBMDAgKyBcdTMwMENcdTVDNTVcdTVGMDBcdTMwMERcdTMwMENcdTUxNzNcdTgwNTRcdTMwMERcdTRFMjRcdTgyODJcbiAqIFx1NTFCMlx1N0E4MVx1NTQwRVx1N0YwMFx1RkYxQS0yIC8gLTMgLyBcdTIwMjZcbiAqIFx1OEZENFx1NTZERVx1NjVCMFx1NUVGQVx1NjU4N1x1NEVGNlx1OERFRlx1NUY4NFx1RkYwOFx1NEUwRFx1NTQyQlx1NjI2OVx1NUM1NVx1NTQwRFx1NzY4NCB2YXVsdCBsaW5rIFx1NzZFRVx1NjgwNyA9IHBhdGggXHU1M0JCXHU2Mzg5IC5tZFx1RkYwOVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY29udmVydFNwYXJrVG9EcmFmdChcbiAgYXBwOiBBcHAsXG4gIHNwYXJrVGV4dDogc3RyaW5nLFxuICBkYWlseVBhdGg6IHN0cmluZyxcbiAgdGl0bGU6IHN0cmluZyxcbik6IFByb21pc2U8c3RyaW5nPiB7XG4gIGNvbnN0IHNhZmVUaXRsZSA9IHNhbml0aXplUGxhbkZpbGVOYW1lKHRpdGxlKTtcbiAgY29uc3QgZGF0ZVN0ciA9IHRvZGF5RGF0ZVN0cigpO1xuICBjb25zdCBiYXNlU3RlbSA9IGAke2RhdGVTdHJ9LSR7c2FmZVRpdGxlfWA7XG5cbiAgLy8gXHU3ODZFXHU0RkREIHNwYXJrIFx1NzZFRVx1NUY1NVx1NUI1OFx1NTcyOFxuICBpZiAoIWFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoU1BBUktfRFJBRlRfRElSKSkge1xuICAgIGF3YWl0IGFwcC52YXVsdC5jcmVhdGVGb2xkZXIoU1BBUktfRFJBRlRfRElSKTtcbiAgfVxuXG4gIC8vIFx1NTFCMlx1N0E4MVx1NTkwNFx1NzQwNlxuICBsZXQgc3RlbSA9IGJhc2VTdGVtO1xuICBsZXQgcGF0aCA9IG5vcm1hbGl6ZVBhdGgoYCR7U1BBUktfRFJBRlRfRElSfS8ke3N0ZW19Lm1kYCk7XG4gIGxldCBuID0gMjtcbiAgd2hpbGUgKGFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgocGF0aCkpIHtcbiAgICBzdGVtID0gYCR7YmFzZVN0ZW19LSR7bn1gO1xuICAgIHBhdGggPSBub3JtYWxpemVQYXRoKGAke1NQQVJLX0RSQUZUX0RJUn0vJHtzdGVtfS5tZGApO1xuICAgIG4rKztcbiAgfVxuICAvLyBcdTRFOENcdTZCMjFcdTY4MjFcdTlBOENcdUZGMUFcdTRFQ0RcdTU3MjggaW5ib3gvIFx1NTE4NVxuICBpZiAoIXBhdGguc3RhcnRzV2l0aChcImluYm94L1wiKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgXHU2MkQyXHU3RUREXHU1MTk5XHU1MTY1IGluYm94LyBcdTRFNEJcdTU5MTZcdUZGMUEke3BhdGh9YCk7XG4gIH1cblxuICAvLyBcdTZFOTAgRGFpbHlub3RlIFx1NzY4NCB3aWtpLWxpbmsgXHU3NkVFXHU2ODA3XHVGRjA4XHU1M0JCXHU2Mzg5IC5tZFx1RkYwOVxuICBjb25zdCBkYWlseUxpbmsgPSBkYWlseVBhdGgucmVwbGFjZSgvXFwubWQkL2ksIFwiXCIpO1xuXG4gIC8vIFx1NUYxNVx1OEEwMFx1NTc1N1x1RkYxQVx1NTkxQVx1ODg0Q1x1NTE4NVx1NUJCOVx1NjMwOSBtYXJrZG93biBibG9ja3F1b3RlIFx1NkJDRlx1ODg0Q1x1NTI0RFx1N0YwMCA+XG4gIGNvbnN0IHF1b3RlZCA9IHNwYXJrVGV4dFxuICAgIC5zcGxpdCgvXFxyP1xcbi8pXG4gICAgLm1hcCgobCkgPT4gYD4gJHtsfWApXG4gICAgLmpvaW4oXCJcXG5cIik7XG5cbiAgY29uc3QgYm9keSA9XG4gICAgYC0tLVxcbmAgK1xuICAgIGB0aXRsZTogXCIke3NhZmVUaXRsZS5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJyl9XCJcXG5gICtcbiAgICBgdHlwZTogc3BhcmstZHJhZnRcXG5gICtcbiAgICBgY3JlYXRlZDogJHtkYXRlU3RyfVxcbmAgK1xuICAgIGBzb3VyY2U6IFwiW1ske2RhaWx5TGlua31dXVwiXFxuYCArXG4gICAgYHRhZ3M6XFxuICAtIGluYm94L3NwYXJrLWRyYWZ0XFxuYCArXG4gICAgYC0tLVxcblxcbmAgK1xuICAgIGAjICR7c2FmZVRpdGxlfVxcblxcbmAgK1xuICAgIGAke3F1b3RlZH1cXG5cXG5gICtcbiAgICBgIyMgXHU1QzU1XHU1RjAwXFxuXFxuYCArXG4gICAgYCMjIFx1NTE3M1x1ODA1NFxcblxcbmA7XG5cbiAgYXdhaXQgYXBwLnZhdWx0LmNyZWF0ZShwYXRoLCBib2R5KTtcbiAgcmV0dXJuIHBhdGg7XG59XG5cbi8qKlxuICogXHU1NzI4IERhaWx5bm90ZSBcdTc2ODRcdTc2RUVcdTY4MDcgc3BhcmsgXHU4ODRDXHU1QzNFXHU4RkZEXHU1MkEwIGAgXHUyMTkyIFtbbGlua1RhcmdldF1dYFx1MzAwMlxuICogXHU1QjlBXHU0RjREXHVGRjFBXHU1MTg1XHU1QkI5XHU1MzM5XHU5MTREXHVGRjBDXHU0RUM1XHU1RjUzXHU4QkU1XHU4ODRDKipcdTU1MkZcdTRFMDAqKlx1NTMzOVx1OTE0RFx1NjVGNlx1NjI0RFx1NTE5OVx1RkYxQlx1NTQyNlx1NTIxOVx1NjUzRVx1NUYwM1x1MzAwMlxuICogXHU1MTk5XHU1MTY1XHU1MjREXHU2ODIxXHU5QThDXHU4REVGXHU1Rjg0XHU0RTBFXHU1MTg1XHU1QkI5XHU0RTBEXHU1NDJCXHU2MzYyXHU4ODRDL05VTFx1MzAwMlxuICpcbiAqIFx1OEJGNFx1NjYwRVx1RkYxQURhaWx5bm90ZSBcdTUzOUZcdTY3MkMgYXBwZW5kLW9ubHlcdTMwMDJcdTZCNjRcdTU5MDRcdTUxNDFcdThCQjhcdTMwMENcdTU0MENcdTRFMDBcdTg4NENcdTg4NENcdTVDM0VcdThGRkRcdTUyQTBcdTZFQUZcdTZFOTBcdTY4MDdcdThCQjBcdTMwMERcdTY2MkZcbiAqIE01IFx1NzY4NFx1NEY4Qlx1NTkxNlx1RkYwQ1NQRUMgXHUwMEE3XHU1MTZEXHU5NzAwXHU1NDBDXHU2QjY1XHU4QkY0XHU2NjBFXHUzMDAyXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhcHBlbmRTb3VyY2VMaW5rVG9TcGFyayhcbiAgYXBwOiBBcHAsXG4gIGRhaWx5UGF0aDogc3RyaW5nLFxuICBzcGFya0xpbmVUZXh0OiBzdHJpbmcsXG4gIGxpbmtUYXJnZXQ6IHN0cmluZyxcbik6IFByb21pc2U8dm9pZD4ge1xuICBpZiAoIWRhaWx5UGF0aC5zdGFydHNXaXRoKERBSUxZTk9URV9QUkVGSVgpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBcdTYyRDJcdTdFRERcdTUxOTlcdTUxNjUgRGFpbHlub3RlIFx1NEU0Qlx1NTkxNlx1RkYxQSR7ZGFpbHlQYXRofWApO1xuICB9XG4gIGlmICgvW1xcclxcblxcdTAwMDBdLy50ZXN0KHNwYXJrTGluZVRleHQpIHx8IC9bXFxyXFxuXFx1MDAwMF0vLnRlc3QobGlua1RhcmdldCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJcdTZFQUZcdTZFOTBcdTUxOTlcdTU2REVcdTUxODVcdTVCQjlcdTRFMERcdTgwRkRcdTU0MkJcdTYzNjJcdTg4NENcIik7XG4gIH1cbiAgaWYgKGxpbmtUYXJnZXQuaW5jbHVkZXMoXCJdXVwiKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlx1OTRGRVx1NjNBNVx1NzZFRVx1NjgwN1x1OTc1RVx1NkNENVwiKTtcbiAgfVxuXG4gIGNvbnN0IGZpbGUgPSBhcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKGRhaWx5UGF0aCk7XG4gIGlmICghKGZpbGUgaW5zdGFuY2VvZiBURmlsZSkpIHRocm93IG5ldyBFcnJvcihgRGFpbHlub3RlIFx1NEUwRFx1NUI1OFx1NTcyOFx1RkYxQSR7ZGFpbHlQYXRofWApO1xuXG4gIGF3YWl0IGFwcC52YXVsdC5wcm9jZXNzKGZpbGUsIChkYXRhKSA9PiB7XG4gICAgY29uc3QgbGluZXMgPSBkYXRhLnNwbGl0KC9cXHI/XFxuLyk7XG4gICAgY29uc3QgaGl0czogbnVtYmVyW10gPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAobGluZXNbaV0gPT09IHNwYXJrTGluZVRleHQpIGhpdHMucHVzaChpKTtcbiAgICB9XG4gICAgaWYgKGhpdHMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFx1NjcyQVx1NjI3RVx1NTIzMFx1NzZFRVx1NjgwNyBzcGFyayBcdTg4NENcdUZGMDhcdTUzRUZcdTgwRkRcdTVERjJcdTg4QUJcdTRGRUVcdTY1MzlcdUZGMDlcXG5cdTc2RUVcdTY4MDdcdUZGMUEke3NwYXJrTGluZVRleHR9YCk7XG4gICAgfVxuICAgIGlmIChoaXRzLmxlbmd0aCA+IDEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlx1NzZFRVx1NjgwNyBzcGFyayBcdTg4NENcdTRFMERcdTU1MkZcdTRFMDBcdUZGMENcdTY1RTBcdTZDRDVcdTVCODlcdTUxNjhcdTUxOTlcdTU2REVcIik7XG4gICAgfVxuICAgIGxpbmVzW2hpdHNbMF1dID0gYCR7c3BhcmtMaW5lVGV4dH0gXHUyMTkyIFtbJHtsaW5rVGFyZ2V0fV1dYDtcbiAgICByZXR1cm4gbGluZXMuam9pbihcIlxcblwiKTtcbiAgfSk7XG59XG5cbi8qKiBcdTRFQ0Ugc3BhcmsgXHU2NTg3XHU2NzJDXHU2MkJEXHU1M0Q2XHU5RUQ4XHU4QkE0XHU4MzQ5XHU3QTNGXHU2ODA3XHU5ODk4XHVGRjA4XHU1MjREIDEyIFx1NUI1N1x1RkYwQ1x1NTI1NFx1NjNBN1x1NTIzNlx1NUI1N1x1N0IyNlx1NEUwRVx1OTk5Nlx1NUMzRVx1N0E3QVx1NzY3RFx1RkYwOSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHREcmFmdFRpdGxlKHNwYXJrVGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgY2xlYW5lZCA9IHNwYXJrVGV4dC5yZXBsYWNlKC9bXFx1MDAwMC1cXHUwMDFmXFx1MDA3Zl0vZywgXCJcIikudHJpbSgpO1xuICByZXR1cm4gY2xlYW5lZC5zbGljZSgwLCAxMik7XG59XG4iLCAiY29uc3QgSUxMRUdBTF9DSEFSUyA9IC9bXFxcXC86Kj9cIjw+fF0vZztcbmNvbnN0IENPTlRST0xfQ0hBUlMgPSAvW1xcdTAwMDAtXFx1MDAxZlxcdTAwN2ZdL2c7XG5cbi8qKlxuICogXHU1MUMwXHU1MzE2XHU3NTI4XHU2MjM3XHU4RjkzXHU1MTY1XHU3Njg0XHU2ODA3XHU5ODk4XHU0RTNBXHU1NDA4XHU2Q0Q1XHU2NTg3XHU0RUY2XHU1NDBEXHUzMDAyXG4gKiAtIFx1NTI1NFx1OTY2NCBXaW5kb3dzIFx1OTc1RVx1NkNENVx1NUI1N1x1N0IyNiBcXCAvIDogKiA/IFwiIDwgPiB8XG4gKiAtIFx1NTI1NFx1OTY2NFx1NjNBN1x1NTIzNlx1NUI1N1x1N0IyNlx1RkYwOFx1NTQyQiBcXG4gXFxyIFxcdCBOVUxcdUZGMENcdTk2MzIgZnJvbnRtYXR0ZXIgXHU2Q0U4XHU1MTY1XHVGRjA5XG4gKiAtIFx1NTI1NFx1OTY2NFx1OERFRlx1NUY4NFx1N0E3Rlx1OEQ4QSAuLlxuICogLSBcdTUyNTRcdTk2NjRcdTk5OTZcdTVDM0VcdTdBN0FcdTc2N0RcdTRFMEVcdTdFRDNcdTVDM0VcdTcwQjlcbiAqIC0gXHU3QTdBXHU0RTMyXHU2MjlCXHU5NTE5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZVBsYW5GaWxlTmFtZSh0aXRsZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgbGV0IHMgPSB0aXRsZS5yZXBsYWNlKENPTlRST0xfQ0hBUlMsIFwiXCIpLnJlcGxhY2UoSUxMRUdBTF9DSEFSUywgXCJcIikudHJpbSgpO1xuICBzID0gcy5yZXBsYWNlKC9cXC5cXC4rL2csIFwiLlwiKTtcbiAgcyA9IHMucmVwbGFjZSgvXlsuXFxzXSt8Wy5cXHNdKyQvZywgXCJcIik7XG4gIGlmIChzLmxlbmd0aCA9PT0gMCkgdGhyb3cgbmV3IEVycm9yKFwiXHU2ODA3XHU5ODk4XHU0RTBEXHU4MEZEXHU0RTNBXHU3QTdBXCIpO1xuICByZXR1cm4gcztcbn1cbiIsICJpbXBvcnQgeyBBcHAsIE1vZGFsLCBOb3RpY2UgfSBmcm9tIFwib2JzaWRpYW5cIjtcblxuLyoqIFx1OEZGN1x1NEY2MFx1NjgwN1x1OTg5OFx1OEY5M1x1NTE2NSBNb2RhbFx1RkYxQXNwYXJrIFx1OEY2Q1x1ODM0OVx1N0EzRlx1NjVGNlx1NzUyOFx1MzAwMkVudGVyIFx1Nzg2RVx1OEJBNFx1MzAwMUVzYyBcdTUzRDZcdTZEODggKi9cbmV4cG9ydCBjbGFzcyBEcmFmdFRpdGxlTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG4gIHByaXZhdGUgaW5pdGlhbDogc3RyaW5nO1xuICBwcml2YXRlIG9uQ29uZmlybTogKHRpdGxlOiBzdHJpbmcpID0+IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xuXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBpbml0aWFsOiBzdHJpbmcsIG9uQ29uZmlybTogKHRpdGxlOiBzdHJpbmcpID0+IHZvaWQgfCBQcm9taXNlPHZvaWQ+KSB7XG4gICAgc3VwZXIoYXBwKTtcbiAgICB0aGlzLmluaXRpYWwgPSBpbml0aWFsO1xuICAgIHRoaXMub25Db25maXJtID0gb25Db25maXJtO1xuICB9XG5cbiAgb25PcGVuKCk6IHZvaWQge1xuICAgIGNvbnN0IHsgY29udGVudEVsLCB0aXRsZUVsIH0gPSB0aGlzO1xuICAgIHRpdGxlRWwuc2V0VGV4dChcIlx1OEY2Q1x1NEUzQVx1ODM0OVx1N0EzRlx1RkYxQVx1NTQ3RFx1NTQwRFwiKTtcbiAgICBjb250ZW50RWwuZW1wdHkoKTtcblxuICAgIGNvbnN0IGlucHV0ID0gY29udGVudEVsLmNyZWF0ZUVsKFwiaW5wdXRcIiwge1xuICAgICAgY2xzOiBcImt3LW1vZGFsLWlucHV0XCIsXG4gICAgICBhdHRyOiB7IHR5cGU6IFwidGV4dFwiLCBwbGFjZWhvbGRlcjogXCJcdTgzNDlcdTdBM0ZcdTY4MDdcdTk4OThcIiB9LFxuICAgIH0pO1xuICAgIGlucHV0LnZhbHVlID0gdGhpcy5pbml0aWFsO1xuICAgIGlucHV0LmZvY3VzKCk7XG4gICAgaW5wdXQuc2VsZWN0KCk7XG5cbiAgICBjb25zdCBmb290ID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogXCJrdy1tb2RhbC1mb290XCIgfSk7XG4gICAgY29uc3QgYnRuID0gZm9vdC5jcmVhdGVFbChcImJ1dHRvblwiLCB7IGNsczogXCJtb2QtY3RhXCIsIHRleHQ6IFwiXHU1MjFCXHU1RUZBXCIgfSk7XG5cbiAgICBjb25zdCBzdWJtaXQgPSBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCB2ID0gaW5wdXQudmFsdWUudHJpbSgpO1xuICAgICAgaWYgKCF2KSB7XG4gICAgICAgIG5ldyBOb3RpY2UoXCJcdTY4MDdcdTk4OThcdTRFMERcdTgwRkRcdTRFM0FcdTdBN0FcIik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHRoaXMub25Db25maXJtKHYpO1xuICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgbmV3IE5vdGljZShgXHU1MjFCXHU1RUZBXHU1OTMxXHU4RDI1XHVGRjFBJHsoZXJyIGFzIEVycm9yKS5tZXNzYWdlfWApO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZSkgPT4ge1xuICAgICAgaWYgKGUua2V5ID09PSBcIkVudGVyXCIpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB2b2lkIHN1Ym1pdCgpO1xuICAgICAgfSBlbHNlIGlmIChlLmtleSA9PT0gXCJFc2NhcGVcIikge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHZvaWQgc3VibWl0KCkpO1xuICB9XG5cbiAgb25DbG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmNvbnRlbnRFbC5lbXB0eSgpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgQXBwLCBTdWdnZXN0TW9kYWwsIFRGaWxlLCBOb3RpY2UgfSBmcm9tIFwib2JzaWRpYW5cIjtcbmltcG9ydCB7IHNlYXJjaEFsbFNwYXJrcywgU3BhcmtIaXQgfSBmcm9tIFwiLi9zZWFyY2hcIjtcblxuLyoqXG4gKiBzcGFyayBcdTUxNjhcdTY1ODdcdTY0MUNcdTdEMjIgTW9kYWwgXHUyMDE0XHUyMDE0IFx1NTkwRFx1NzUyOCBPYnNpZGlhbiBcdTUxODVcdTdGNkUgU3VnZ2VzdE1vZGFsIFx1NzY4NCBVSVx1MzAwMlxuICogXHU4RjkzXHU1MTY1XHU1MzczXHU4OUU2XHU1M0QxIGdldFN1Z2dlc3Rpb25zXHVGRjFCXHU5MDA5XHU0RTJEXHU1NDBFXHU4REYzXHU4RjZDXHU1MjMwXHU2RTkwXHU2NTg3XHU0RUY2XHU3Njg0XHU1QkY5XHU1RTk0XHU4ODRDXHUzMDAyXG4gKi9cbmV4cG9ydCBjbGFzcyBTcGFya1NlYXJjaE1vZGFsIGV4dGVuZHMgU3VnZ2VzdE1vZGFsPFNwYXJrSGl0PiB7XG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwKSB7XG4gICAgc3VwZXIoYXBwKTtcbiAgICB0aGlzLnNldFBsYWNlaG9sZGVyKFwiXHU2NDFDXHU3RDIyXHU2MjQwXHU2NzA5XHU5NjhGXHU2MjRCXHU4QkIwXHUyMDI2XCIpO1xuICB9XG5cbiAgYXN5bmMgZ2V0U3VnZ2VzdGlvbnMocXVlcnk6IHN0cmluZyk6IFByb21pc2U8U3BhcmtIaXRbXT4ge1xuICAgIHJldHVybiBzZWFyY2hBbGxTcGFya3ModGhpcy5hcHAsIHF1ZXJ5KTtcbiAgfVxuXG4gIHJlbmRlclN1Z2dlc3Rpb24oaGl0OiBTcGFya0hpdCwgZWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgY29uc3QgbGluZTEgPSBlbC5jcmVhdGVEaXYoeyBjbHM6IFwia3ctc3BhcmstaGl0LWxpbmVcIiB9KTtcbiAgICBsaW5lMS5jcmVhdGVTcGFuKHsgY2xzOiBcImt3LXNwYXJrLWhpdC1kYXRlXCIsIHRleHQ6IGhpdC5kYXRlIH0pO1xuICAgIGxpbmUxLmNyZWF0ZVNwYW4oeyBjbHM6IFwia3ctc3BhcmstaGl0LXRpbWVcIiwgdGV4dDogaGl0LnRpbWUgfSk7XG4gICAgZWwuY3JlYXRlRGl2KHsgY2xzOiBcImt3LXNwYXJrLWhpdC10ZXh0XCIsIHRleHQ6IGhpdC50ZXh0IH0pO1xuICB9XG5cbiAgYXN5bmMgb25DaG9vc2VTdWdnZXN0aW9uKGhpdDogU3BhcmtIaXQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBmaWxlID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKGhpdC5maWxlUGF0aCk7XG4gICAgaWYgKCEoZmlsZSBpbnN0YW5jZW9mIFRGaWxlKSkge1xuICAgICAgbmV3IE5vdGljZShgXHU2NTg3XHU0RUY2XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjFBJHtoaXQuZmlsZVBhdGh9YCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGxlYWYgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0TGVhZihmYWxzZSk7XG4gICAgYXdhaXQgbGVhZi5vcGVuRmlsZShmaWxlLCB7XG4gICAgICBlU3RhdGU6IHsgbGluZTogaGl0LmxpbmUsIG1hcms6IHRydWUgfSxcbiAgICB9KTtcbiAgfVxufVxuIiwgImltcG9ydCB7IEFwcCwgVEZpbGUgfSBmcm9tIFwib2JzaWRpYW5cIjtcbmltcG9ydCB7IHBhcnNlU3BhcmtMaW5lIH0gZnJvbSBcIi4vcGFyc2VyXCI7XG5cbmNvbnN0IERBSUxZTk9URV9ESVIgPSBcImluYm94L3NwYXJrcy9EYWlseW5vdGUvXCI7XG5cbi8qKiBcdTRFMDBcdTY3NjEgc3BhcmsgXHU2NDFDXHU3RDIyXHU1NDdEXHU0RTJEXHVGRjFBXHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0ICsgXHU4ODRDXHU1M0Y3XHVGRjA4MC1iYXNlZFx1RkYwOSsgXHU2NUY2XHU5NUY0ICsgXHU2NTg3XHU2NzJDICovXG5leHBvcnQgaW50ZXJmYWNlIFNwYXJrSGl0IHtcbiAgZmlsZVBhdGg6IHN0cmluZztcbiAgLyoqIFx1ODg0Q1x1NTNGN1x1RkYwODAtYmFzZWRcdUZGMDlcdUZGMUJcdTc1MjhcdTRFOEUgT2JzaWRpYW4gZVN0YXRlIFx1OERGM1x1OEY2QyAqL1xuICBsaW5lOiBudW1iZXI7XG4gIC8qKiBcdTY1RTVcdTY3MUZcdUZGMDhcdTRFQ0VcdTY1ODdcdTRFRjZcdTU0MERcdTYzQThcdTY1QURcdUZGMENZWVlZLU1NLUREXHVGRjA5ICovXG4gIGRhdGU6IHN0cmluZztcbiAgdGltZTogc3RyaW5nO1xuICB0ZXh0OiBzdHJpbmc7XG59XG5cbi8qKlxuICogXHU1MTY4XHU1RTkzIHNwYXJrIFx1NjQxQ1x1N0QyMlx1RkYxQVx1OTA0RFx1NTM4NiBgaW5ib3gvc3BhcmtzL0RhaWx5bm90ZS8qLm1kYFx1RkYwQ1x1NjMwOVx1ODg0QyBzdWJzdHJpbmcgXHU1MzM5XHU5MTREXHUzMDAyXG4gKiAtIGtleXdvcmQgXHU1OTI3XHU1QzBGXHU1MTk5XHU0RTBEXHU2NTRGXHU2MTFGXHVGRjFCXHU1MjU0XHU2M0E3XHU1MjM2XHU1QjU3XHU3QjI2ICsgdHJpbVx1RkYxQlx1N0E3QVx1NTE3M1x1OTUyRVx1OEJDRFx1OEZENFx1NTZERVx1N0E3QVx1NjU3MFx1N0VDNFxuICogLSBcdTUzRUFcdTUzMzlcdTkxNERcdTUzRUZcdTg5RTNcdTY3OTBcdTc2ODQgc3BhcmsgXHU4ODRDXHVGRjA4YC0gKipISDptbSoqIFx1NTE4NVx1NUJCOWBcdUZGMDlcdUZGMENcdTRFMERcdTUzMzlcdTkxNEQgZnJvbnRtYXR0ZXIgLyBcdTdBN0FcdTg4NENcbiAqIC0gXHU3RUQzXHU2NzlDXHU2MzA5XHU2NUU1XHU2NzFGXHU1MDEyXHU1RThGICsgXHU4ODRDXHU1M0Y3XHU5ODdBXHU1RThGXHVGRjA4XHU2NzAwXHU2NUIwXHU3Njg0XHU2NUU1XHU2NzFGXHU1NzI4XHU1MjREXHVGRjA5XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZWFyY2hBbGxTcGFya3MoYXBwOiBBcHAsIGtleXdvcmQ6IHN0cmluZyk6IFByb21pc2U8U3BhcmtIaXRbXT4ge1xuICBjb25zdCBrdyA9IGtleXdvcmQucmVwbGFjZSgvW1xcdTAwMDAtXFx1MDAxZlxcdTAwN2ZdL2csIFwiXCIpLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xuICBpZiAoIWt3KSByZXR1cm4gW107XG5cbiAgY29uc3QgZmlsZXMgPSBhcHAudmF1bHQuZ2V0TWFya2Rvd25GaWxlcygpLmZpbHRlcihcbiAgICAoZikgPT4gZi5wYXRoLnN0YXJ0c1dpdGgoREFJTFlOT1RFX0RJUiksXG4gICk7XG4gIC8vIFx1NjMwOVx1OERFRlx1NUY4NFx1NTAxMlx1NUU4RiBcdTIxOTIgRGFpbHlub3RlIFx1NjU4N1x1NEVGNlx1NTQwRFx1NjYyRiBZWVlZLU1NLUREXHVGRjBDXHU1QjU3XHU1MTc4XHU1RThGXHU1MzczXHU2NUY2XHU5NUY0XHU1RThGXG4gIGZpbGVzLnNvcnQoKGEsIGIpID0+IChhLnBhdGggPCBiLnBhdGggPyAxIDogYS5wYXRoID4gYi5wYXRoID8gLTEgOiAwKSk7XG5cbiAgY29uc3QgaGl0czogU3BhcmtIaXRbXSA9IFtdO1xuICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICBjb25zdCBkYXRlID0gZXh0cmFjdERhdGUoZmlsZSk7XG4gICAgY29uc3QgY29udGVudCA9IGF3YWl0IGFwcC52YXVsdC5jYWNoZWRSZWFkKGZpbGUpO1xuICAgIGNvbnN0IGxpbmVzID0gY29udGVudC5zcGxpdCgvXFxyP1xcbi8pO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGVudHJ5ID0gcGFyc2VTcGFya0xpbmUobGluZXNbaV0pO1xuICAgICAgaWYgKCFlbnRyeSkgY29udGludWU7XG4gICAgICBpZiAoZW50cnkudGV4dC50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGt3KSkge1xuICAgICAgICBoaXRzLnB1c2goe1xuICAgICAgICAgIGZpbGVQYXRoOiBmaWxlLnBhdGgsXG4gICAgICAgICAgbGluZTogaSxcbiAgICAgICAgICBkYXRlLFxuICAgICAgICAgIHRpbWU6IGVudHJ5LnRpbWUsXG4gICAgICAgICAgdGV4dDogZW50cnkudGV4dCxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBoaXRzO1xufVxuXG5mdW5jdGlvbiBleHRyYWN0RGF0ZShmaWxlOiBURmlsZSk6IHN0cmluZyB7XG4gIGNvbnN0IG0gPSAvKFxcZHs0fS1cXGR7Mn0tXFxkezJ9KVxcLm1kJC9pLmV4ZWMoZmlsZS5wYXRoKTtcbiAgcmV0dXJuIG0gPyBtWzFdIDogZmlsZS5iYXNlbmFtZTtcbn1cbiIsICJpbXBvcnQgeyBBcHAsIE1vZGFsLCBOb3RpY2UsIFRGaWxlIH0gZnJvbSBcIm9ic2lkaWFuXCI7XG5pbXBvcnQgeyBjcmVhdGVQbGFuRmlsZSwgYXBwZW5kVGFza1RvUGxhbiB9IGZyb20gXCIuL3dyaXRlYmFja1wiO1xuaW1wb3J0IHsgbG9hZFBsYW5zIH0gZnJvbSBcIi4vcGxhblwiO1xuaW1wb3J0IHR5cGUgeyBQbGFuIH0gZnJvbSBcIi4vcGxhblwiO1xuaW1wb3J0IHsgUFJJT19FTU9KSSwgUHJpb3JpdHkgfSBmcm9tIFwiLi9wYXJzZXJcIjtcblxuLyoqIFx1NjVCMFx1NUVGQVx1OEJBMVx1NTIxMiBNb2RhbFx1RkYxQVx1NEVDNVx1OEY5M1x1NTE2NVx1NjgwN1x1OTg5OFx1RkYwQ1x1NTIxQlx1NUVGQSBpbmJveC90YXNrcy88dGl0bGU+Lm1kIFx1NUU3Nlx1OERGM1x1OEY2QyAqL1xuZXhwb3J0IGNsYXNzIE5ld1BsYW5Nb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgcHJpdmF0ZSBvbkNyZWF0ZWQ/OiAocGF0aDogc3RyaW5nKSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBvbkNyZWF0ZWQ/OiAocGF0aDogc3RyaW5nKSA9PiB2b2lkKSB7XG4gICAgc3VwZXIoYXBwKTtcbiAgICB0aGlzLm9uQ3JlYXRlZCA9IG9uQ3JlYXRlZDtcbiAgfVxuXG4gIG9uT3BlbigpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNvbnRlbnRFbCwgdGl0bGVFbCB9ID0gdGhpcztcbiAgICB0aXRsZUVsLnNldFRleHQoXCJcdTY1QjBcdTVFRkFcdThCQTFcdTUyMTJcIik7XG4gICAgY29udGVudEVsLmVtcHR5KCk7XG5cbiAgICBjb25zdCBpbnB1dCA9IGNvbnRlbnRFbC5jcmVhdGVFbChcImlucHV0XCIsIHtcbiAgICAgIGNsczogXCJrdy1tb2RhbC1pbnB1dFwiLFxuICAgICAgYXR0cjogeyB0eXBlOiBcInRleHRcIiwgcGxhY2Vob2xkZXI6IFwiXHU4QkExXHU1MjEyXHU2ODA3XHU5ODk4XHVGRjA4XHU1OTgyXHVGRjFBUTMgXHU3NkVFXHU2ODA3XHVGRjA5XCIgfSxcbiAgICB9KTtcbiAgICBpbnB1dC5mb2N1cygpO1xuXG4gICAgY29uc3QgZm9vdCA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoeyBjbHM6IFwia3ctbW9kYWwtZm9vdFwiIH0pO1xuICAgIGNvbnN0IGJ0biA9IGZvb3QuY3JlYXRlRWwoXCJidXR0b25cIiwge1xuICAgICAgY2xzOiBcIm1vZC1jdGFcIixcbiAgICAgIHRleHQ6IFwiXHU1MjFCXHU1RUZBXCIsXG4gICAgfSk7XG5cbiAgICBjb25zdCBzdWJtaXQgPSBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCB2ID0gaW5wdXQudmFsdWUudHJpbSgpO1xuICAgICAgaWYgKCF2KSByZXR1cm47XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBwYXRoID0gYXdhaXQgY3JlYXRlUGxhbkZpbGUodGhpcy5hcHAsIHYpO1xuICAgICAgICBuZXcgTm90aWNlKGBcdTVERjJcdTUyMUJcdTVFRkEgJHtwYXRofWApO1xuICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgIC8vIFx1NjI1M1x1NUYwMFx1NjU4N1x1NEVGNlxuICAgICAgICBjb25zdCBmID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKHBhdGgpO1xuICAgICAgICBpZiAoZiBpbnN0YW5jZW9mIFRGaWxlKSB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5hcHAud29ya3NwYWNlLmdldExlYWYoZmFsc2UpLm9wZW5GaWxlKGYpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMub25DcmVhdGVkPy4ocGF0aCk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgbmV3IE5vdGljZShgXHU1MjFCXHU1RUZBXHU1OTMxXHU4RDI1XHVGRjFBJHsoZXJyIGFzIEVycm9yKS5tZXNzYWdlfWApO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZSkgPT4ge1xuICAgICAgaWYgKGUua2V5ID09PSBcIkVudGVyXCIpIHN1Ym1pdCgpO1xuICAgIH0pO1xuICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgc3VibWl0KTtcbiAgfVxuXG4gIG9uQ2xvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5jb250ZW50RWwuZW1wdHkoKTtcbiAgfVxufVxuXG4vKiogXHU1RkVCXHU5MDFGXHU2REZCXHU1MkEwXHU0RUZCXHU1MkExIE1vZGFsXHVGRjFBXHU2NTg3XHU2NzJDICsgXHU4QkExXHU1MjEyXHU0RTBCXHU2MkM5ICsgXHU2NUU1XHU2NzFGICsgXHU0RjE4XHU1MTQ4XHU3RUE3ICovXG5leHBvcnQgY2xhc3MgUXVpY2tBZGRUYXNrTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG4gIHByaXZhdGUgcGxhbnM6IFBsYW5bXSA9IFtdO1xuICBwcml2YXRlIGRlZmF1bHRQbGFuUGF0aD86IHN0cmluZztcbiAgcHJpdmF0ZSBwcmVmaWxsVGV4dD86IHN0cmluZztcbiAgcHJpdmF0ZSBvbkFkZGVkPzogKHBsYW5QYXRoOiBzdHJpbmcsIHRhc2tMaW5lOiBzdHJpbmcpID0+IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGFwcDogQXBwLFxuICAgIG9wdHM/OiB7XG4gICAgICBkZWZhdWx0UGxhblBhdGg/OiBzdHJpbmc7XG4gICAgICBwcmVmaWxsVGV4dD86IHN0cmluZztcbiAgICAgIG9uQWRkZWQ/OiAocGxhblBhdGg6IHN0cmluZywgdGFza0xpbmU6IHN0cmluZykgPT4gdm9pZCB8IFByb21pc2U8dm9pZD47XG4gICAgfSxcbiAgKSB7XG4gICAgc3VwZXIoYXBwKTtcbiAgICB0aGlzLmRlZmF1bHRQbGFuUGF0aCA9IG9wdHM/LmRlZmF1bHRQbGFuUGF0aDtcbiAgICB0aGlzLnByZWZpbGxUZXh0ID0gb3B0cz8ucHJlZmlsbFRleHQ7XG4gICAgdGhpcy5vbkFkZGVkID0gb3B0cz8ub25BZGRlZDtcbiAgfVxuXG4gIGFzeW5jIG9uT3BlbigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB7IGNvbnRlbnRFbCwgdGl0bGVFbCB9ID0gdGhpcztcbiAgICB0aXRsZUVsLnNldFRleHQoXCJcdTVGRUJcdTkwMUZcdTZERkJcdTUyQTBcdTRFRkJcdTUyQTFcIik7XG4gICAgY29udGVudEVsLmVtcHR5KCk7XG5cbiAgICB0aGlzLnBsYW5zID0gKGF3YWl0IGxvYWRQbGFucyh0aGlzLmFwcCkpLmZpbHRlcigocCkgPT4gcC5zdGF0dXMgPT09IFwiYWN0aXZlXCIpO1xuICAgIGlmICh0aGlzLnBsYW5zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29udGVudEVsLmNyZWF0ZURpdih7XG4gICAgICAgIGNsczogXCJrdy1lbXB0eVwiLFxuICAgICAgICB0ZXh0OiBcIlx1NUMxQVx1NjVFMCBhY3RpdmUgXHU4QkExXHU1MjEyXHU2NTg3XHU0RUY2XHVGRjBDXHU4QkY3XHU1MTQ4XHU2NUIwXHU1RUZBXHU0RTAwXHU0RTJBXCIsXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBcdTY1ODdcdTY3MkNcbiAgICBjb25zdCB0ZXh0SW5wdXQgPSBjb250ZW50RWwuY3JlYXRlRWwoXCJpbnB1dFwiLCB7XG4gICAgICBjbHM6IFwia3ctbW9kYWwtaW5wdXRcIixcbiAgICAgIGF0dHI6IHsgdHlwZTogXCJ0ZXh0XCIsIHBsYWNlaG9sZGVyOiBcIlx1NEVGQlx1NTJBMVx1NjNDRlx1OEZGMFwiIH0sXG4gICAgfSk7XG4gICAgaWYgKHRoaXMucHJlZmlsbFRleHQpIHRleHRJbnB1dC52YWx1ZSA9IHRoaXMucHJlZmlsbFRleHQ7XG4gICAgdGV4dElucHV0LmZvY3VzKCk7XG4gICAgaWYgKHRoaXMucHJlZmlsbFRleHQpIHtcbiAgICAgIC8vIFx1OEJBOVx1NTE0OVx1NjgwN1x1NTA1Q1x1NTcyOFx1NjcyQlx1NUMzRVx1RkYwQ1x1NjVCOVx1NEZCRlx1N0VFN1x1N0VFRFx1OEY5M1x1NTE2NVxuICAgICAgdGV4dElucHV0LnNldFNlbGVjdGlvblJhbmdlKHRoaXMucHJlZmlsbFRleHQubGVuZ3RoLCB0aGlzLnByZWZpbGxUZXh0Lmxlbmd0aCk7XG4gICAgfVxuXG4gICAgY29uc3Qgcm93ID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogXCJrdy1tb2RhbC1yb3dcIiB9KTtcblxuICAgIC8vIFx1OEJBMVx1NTIxMlx1OTAwOVx1NjJFOVxuICAgIGNvbnN0IHBsYW5TZWxlY3QgPSByb3cuY3JlYXRlRWwoXCJzZWxlY3RcIiwgeyBjbHM6IFwia3ctbW9kYWwtc2VsZWN0XCIgfSk7XG4gICAgZm9yIChjb25zdCBwIG9mIHRoaXMucGxhbnMpIHtcbiAgICAgIGNvbnN0IG9wdCA9IHBsYW5TZWxlY3QuY3JlYXRlRWwoXCJvcHRpb25cIiwgeyB0ZXh0OiBwLnRpdGxlIH0pO1xuICAgICAgb3B0LnZhbHVlID0gcC5wYXRoO1xuICAgIH1cbiAgICBpZiAodGhpcy5kZWZhdWx0UGxhblBhdGggJiYgdGhpcy5wbGFucy5zb21lKChwKSA9PiBwLnBhdGggPT09IHRoaXMuZGVmYXVsdFBsYW5QYXRoKSkge1xuICAgICAgcGxhblNlbGVjdC52YWx1ZSA9IHRoaXMuZGVmYXVsdFBsYW5QYXRoO1xuICAgIH1cblxuICAgIC8vIFx1NjVFNVx1NjcxRlxuICAgIGNvbnN0IGRhdGVJbnB1dCA9IHJvdy5jcmVhdGVFbChcImlucHV0XCIsIHtcbiAgICAgIGNsczogXCJrdy1tb2RhbC1pbnB1dFwiLFxuICAgICAgYXR0cjogeyB0eXBlOiBcImRhdGVcIiB9LFxuICAgIH0pIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG5cbiAgICAvLyBcdTRGMThcdTUxNDhcdTdFQTdcbiAgICBjb25zdCBwcmlvU2VsZWN0ID0gcm93LmNyZWF0ZUVsKFwic2VsZWN0XCIsIHsgY2xzOiBcImt3LW1vZGFsLXNlbGVjdFwiIH0pO1xuICAgIHByaW9TZWxlY3QuY3JlYXRlRWwoXCJvcHRpb25cIiwgeyB0ZXh0OiBcIlx1NjVFMFx1NEYxOFx1NTE0OFx1N0VBN1wiIH0pLnZhbHVlID0gXCJcIjtcbiAgICBwcmlvU2VsZWN0LmNyZWF0ZUVsKFwib3B0aW9uXCIsIHsgdGV4dDogXCJcdTIzRUIgXHU5QUQ4XCIgfSkudmFsdWUgPSBcImhpZ2hcIjtcbiAgICBwcmlvU2VsZWN0LmNyZWF0ZUVsKFwib3B0aW9uXCIsIHsgdGV4dDogXCJcdUQ4M0RcdUREM0MgXHU0RTJEXCIgfSkudmFsdWUgPSBcIm1lZGl1bVwiO1xuICAgIHByaW9TZWxlY3QuY3JlYXRlRWwoXCJvcHRpb25cIiwgeyB0ZXh0OiBcIlx1RDgzRFx1REQzRCBcdTRGNEVcIiB9KS52YWx1ZSA9IFwibG93XCI7XG5cbiAgICBjb25zdCBmb290ID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogXCJrdy1tb2RhbC1mb290XCIgfSk7XG4gICAgY29uc3QgYnRuID0gZm9vdC5jcmVhdGVFbChcImJ1dHRvblwiLCB7IGNsczogXCJtb2QtY3RhXCIsIHRleHQ6IFwiXHU2REZCXHU1MkEwXCIgfSk7XG5cbiAgICBjb25zdCBzdWJtaXQgPSBhc3luYyAoKSA9PiB7XG4gICAgICAvLyBcdTUyNjVcdTc5QkJcdTYzNjJcdTg4NENcdTRFMEVcdTYzQTdcdTUyMzZcdTVCNTdcdTdCMjZcdUZGMENcdTk2MzJcdTZCNjJcdTYyOEEgbWFya2Rvd24gXHU2MjUzXHU2MjEwXHU1OTFBXHU4ODRDXHU2Q0U4XHU1MTY1XG4gICAgICBjb25zdCB0ZXh0ID0gdGV4dElucHV0LnZhbHVlLnJlcGxhY2UoL1tcXHJcXG5cXHRcXHUwMDAwLVxcdTAwMWZdL2csIFwiIFwiKS50cmltKCk7XG4gICAgICBpZiAoIXRleHQpIHJldHVybjtcbiAgICAgIGNvbnN0IHBsYW5QYXRoID0gcGxhblNlbGVjdC52YWx1ZTtcbiAgICAgIGNvbnN0IHBhcnRzID0gW2AtIFsgXSAke3RleHR9YF07XG4gICAgICBjb25zdCBkYXRlVmFsID0gZGF0ZUlucHV0LnZhbHVlO1xuICAgICAgaWYgKGRhdGVWYWwpIHtcbiAgICAgICAgaWYgKCEvXlxcZHs0fS1cXGR7Mn0tXFxkezJ9JC8udGVzdChkYXRlVmFsKSkge1xuICAgICAgICAgIG5ldyBOb3RpY2UoXCJcdTY1RTVcdTY3MUZcdTY4M0NcdTVGMEZcdTRFMERcdTZCNjNcdTc4NkVcIik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHBhcnRzLnB1c2goYFx1RDgzRFx1RENDNSAke2RhdGVWYWx9YCk7XG4gICAgICB9XG4gICAgICBjb25zdCBwcmlvID0gcHJpb1NlbGVjdC52YWx1ZSBhcyBQcmlvcml0eSB8IFwiXCI7XG4gICAgICBpZiAocHJpbykgcGFydHMucHVzaChQUklPX0VNT0pJW3ByaW9dKTtcbiAgICAgIGNvbnN0IGxpbmUgPSBwYXJ0cy5qb2luKFwiIFwiKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGFwcGVuZFRhc2tUb1BsYW4odGhpcy5hcHAsIHBsYW5QYXRoLCBsaW5lKTtcbiAgICAgICAgbmV3IE5vdGljZShgXHU1REYyXHU4RkZEXHU1MkEwXHU1MjMwICR7cGxhblBhdGh9YCk7XG4gICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgaWYgKHRoaXMub25BZGRlZCkgYXdhaXQgdGhpcy5vbkFkZGVkKHBsYW5QYXRoLCBsaW5lKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBuZXcgTm90aWNlKGBcdThGRkRcdTUyQTBcdTU5MzFcdThEMjVcdUZGMUEkeyhlcnIgYXMgRXJyb3IpLm1lc3NhZ2V9YCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHRleHRJbnB1dC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZSkgPT4ge1xuICAgICAgaWYgKGUua2V5ID09PSBcIkVudGVyXCIpIHN1Ym1pdCgpO1xuICAgIH0pO1xuICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgc3VibWl0KTtcbiAgfVxuXG4gIG9uQ2xvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5jb250ZW50RWwuZW1wdHkoKTtcbiAgfVxufVxuXG4vKiogXHU4RkY3XHU0RjYwXHU2NUU1XHU2NzFGXHU5MDA5XHU2MkU5IE1vZGFsXHVGRjFBXHU0RUM1XHU0RTAwXHU0RTJBIGRhdGUgaW5wdXRcdUZGMENcdTRGOUJcdTg4NENcdTUxODVcdTdGMTZcdThGOTFcdTMwMENcdTgxRUFcdTVCOUFcdTRFNDlcdTY1RTVcdTY3MUZcdTMwMERcdThDMDNcdTc1MjggKi9cbmV4cG9ydCBjbGFzcyBEYXRlUGlja2VyTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG4gIHByaXZhdGUgaW5pdGlhbDogc3RyaW5nO1xuICBwcml2YXRlIG9uUGljazogKGRhdGU6IHN0cmluZykgPT4gdm9pZDtcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgaW5pdGlhbDogc3RyaW5nLCBvblBpY2s6IChkYXRlOiBzdHJpbmcpID0+IHZvaWQpIHtcbiAgICBzdXBlcihhcHApO1xuICAgIHRoaXMuaW5pdGlhbCA9IGluaXRpYWw7XG4gICAgdGhpcy5vblBpY2sgPSBvblBpY2s7XG4gIH1cblxuICBvbk9wZW4oKTogdm9pZCB7XG4gICAgY29uc3QgeyBjb250ZW50RWwsIHRpdGxlRWwgfSA9IHRoaXM7XG4gICAgdGl0bGVFbC5zZXRUZXh0KFwiXHU5MDA5XHU2MkU5XHU2NUU1XHU2NzFGXCIpO1xuICAgIGNvbnRlbnRFbC5lbXB0eSgpO1xuXG4gICAgY29uc3QgaW5wdXQgPSBjb250ZW50RWwuY3JlYXRlRWwoXCJpbnB1dFwiLCB7XG4gICAgICBjbHM6IFwia3ctbW9kYWwtaW5wdXRcIixcbiAgICAgIGF0dHI6IHsgdHlwZTogXCJkYXRlXCIgfSxcbiAgICB9KSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgIGlmICh0aGlzLmluaXRpYWwpIGlucHV0LnZhbHVlID0gdGhpcy5pbml0aWFsO1xuICAgIGlucHV0LmZvY3VzKCk7XG5cbiAgICBjb25zdCBmb290ID0gY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogXCJrdy1tb2RhbC1mb290XCIgfSk7XG4gICAgY29uc3QgYnRuID0gZm9vdC5jcmVhdGVFbChcImJ1dHRvblwiLCB7IGNsczogXCJtb2QtY3RhXCIsIHRleHQ6IFwiXHU3ODZFXHU1QjlBXCIgfSk7XG5cbiAgICBjb25zdCBzdWJtaXQgPSAoKSA9PiB7XG4gICAgICBjb25zdCB2ID0gaW5wdXQudmFsdWU7XG4gICAgICBpZiAoIXYpIHJldHVybjtcbiAgICAgIGlmICghL15cXGR7NH0tXFxkezJ9LVxcZHsyfSQvLnRlc3QodikpIHtcbiAgICAgICAgbmV3IE5vdGljZShcIlx1NjVFNVx1NjcxRlx1NjgzQ1x1NUYwRlx1NEUwRFx1NkI2M1x1Nzg2RVwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5vblBpY2sodik7XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgfTtcblxuICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIChlKSA9PiB7XG4gICAgICBpZiAoZS5rZXkgPT09IFwiRW50ZXJcIikgc3VibWl0KCk7XG4gICAgfSk7XG4gICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBzdWJtaXQpO1xuICB9XG5cbiAgb25DbG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmNvbnRlbnRFbC5lbXB0eSgpO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgQXBwLCBub3JtYWxpemVQYXRoLCBOb3RpY2UsIFRGaWxlIH0gZnJvbSBcIm9ic2lkaWFuXCI7XG5pbXBvcnQgeyBwYXJzZVRhc2tMaW5lLCBzZXJpYWxpemVUYXNrLCB3aXRoQ29tcGxldGVkIH0gZnJvbSBcIi4vcGFyc2VyXCI7XG5pbXBvcnQgeyBUYXNrTG9jYXRvciB9IGZyb20gXCIuL3R5cGVzXCI7XG5pbXBvcnQgeyBzYW5pdGl6ZVBsYW5GaWxlTmFtZSB9IGZyb20gXCIuL3Nhbml0aXplXCI7XG5pbXBvcnQgeyB0b2RheURhdGVTdHIgfSBmcm9tIFwiLi4vdXRpbFwiO1xuXG5leHBvcnQgeyBzYW5pdGl6ZVBsYW5GaWxlTmFtZSB9IGZyb20gXCIuL3Nhbml0aXplXCI7XG5cbmNvbnN0IFRBU0tTX0RJUiA9IFwiaW5ib3gvdGFza3NcIjtcblxuLyoqXG4gKiBcdTUyRkVcdTkwMDlcdTRFRkJcdTUyQTFcdUZGMUFcdTYyOEEgYC0gWyBdYCBcdTY1MzlcdTYyMTAgYC0gW3hdYCBcdTVFNzZcdThGRkRcdTUyQTAgYFx1MjcwNSBZWVlZLU1NLUREYFx1MzAwMlxuICpcbiAqIFx1NUI5QVx1NEY0RFx1N0I1Nlx1NzU2NVx1RkYxQVx1NEUwRFx1NzUyOFx1ODg0Q1x1NTNGN1x1MjAxNFx1MjAxNFx1NjU4N1x1NEVGNlx1OTY4Rlx1NjVGNlx1NTNFRlx1ODBGRFx1NURGMlx1ODhBQlx1NzUyOFx1NjIzNy9MTE0gXHU2NTM5XHU1MkE4XHUzMDAyXG4gKiBcdTkxQ0RcdThCRkJcdTY1ODdcdTRFRjZcdUZGMENcdTYzMDlcdTMwMENcdTg4NENcdTUxODVcdTVCQjlcdTdDQkVcdTc4NkVcdTUzMzlcdTkxNEQgKyBcdTU0MENcdTUxODVcdTVCQjlcdTdCMkMgTiBcdTZCMjFcdTUxRkFcdTczQjBcdTMwMERcdTVCOUFcdTRGNERcdTMwMDJcbiAqIFx1ODJFNVx1NjVFMFx1NkNENVx1NTUyRlx1NEUwMFx1NUI5QVx1NEY0RFx1RkYwOFx1NTE4NVx1NUJCOVx1NURGMlx1NjUzOSAvIFx1NjI3RVx1NTIzMFx1NEY0Nlx1NUU4Rlx1NTNGN1x1NEUwRFx1NTMzOVx1OTE0RCAvIFx1NTMzOVx1OTE0RFx1NEUzQSAwXHVGRjA5XHUyMTkyIHRocm93XHVGRjBDXG4gKiBcdTRFMEFcdTZFMzhcdTYzNTVcdTgzQjdcdTU0MEVcdTVGMzkgTm90aWNlIFx1NjNEMFx1NzkzQVx1NjI0Qlx1NTJBOFx1NTkwNFx1NzQwNlx1RkYwOFx1NTE5OVx1NTE2NVx1NEZERFx1NUI4OFx1RkYwQ1NQRUMgMi4yIzdcdUZGMDlcdTMwMDJcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHRvZ2dsZVRhc2tDb21wbGV0ZShcbiAgYXBwOiBBcHAsXG4gIGxvY2F0b3I6IFRhc2tMb2NhdG9yLFxuKTogUHJvbWlzZTx2b2lkPiB7XG4gIC8vIFx1OTYzMlx1NUZBMVx1NjAyN1x1NjgyMVx1OUE4Q1x1RkYxQWxvY2F0b3IgXHU1M0VBXHU1MTQxXHU4QkI4XHU2MzA3XHU1NDExIGluYm94L3Rhc2tzLyBcdTRFMEJcdUZGMDhTUEVDIDIuMiM2IFx1NTE5OVx1NTE2NVx1NjcwMFx1NUMwRlx1Njc0M1x1OTY1MFx1RkYwOVxuICBpZiAoIWxvY2F0b3IuZmlsZVBhdGguc3RhcnRzV2l0aChUQVNLU19ESVIgKyBcIi9cIikpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFx1NjJEMlx1N0VERFx1NTE5OVx1NTE2NSAke1RBU0tTX0RJUn0vIFx1NEU0Qlx1NTkxNlx1RkYxQSR7bG9jYXRvci5maWxlUGF0aH1gKTtcbiAgfVxuICBjb25zdCBmaWxlID0gYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChsb2NhdG9yLmZpbGVQYXRoKTtcbiAgaWYgKCEoZmlsZSBpbnN0YW5jZW9mIFRGaWxlKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgXHU4QkExXHU1MjEyXHU2NTg3XHU0RUY2XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjFBJHtsb2NhdG9yLmZpbGVQYXRofWApO1xuICB9XG4gIGNvbnN0IHRvZGF5ID0gdG9kYXlEYXRlU3RyKCk7XG5cbiAgYXdhaXQgYXBwLnZhdWx0LnByb2Nlc3MoZmlsZSwgKGRhdGEpID0+IHtcbiAgICBjb25zdCBsaW5lcyA9IGRhdGEuc3BsaXQoL1xccj9cXG4vKTtcbiAgICBsZXQgc2VlbiA9IDA7XG4gICAgbGV0IGhpdEluZGV4ID0gLTE7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGxpbmVzW2ldID09PSBsb2NhdG9yLmxpbmVUZXh0KSB7XG4gICAgICAgIGlmIChzZWVuID09PSBsb2NhdG9yLm9jY3VycmVuY2UpIHtcbiAgICAgICAgICBoaXRJbmRleCA9IGk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgc2VlbisrO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoaGl0SW5kZXggPCAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBcdTY1RTBcdTZDRDVcdTU1MkZcdTRFMDBcdTVCOUFcdTRGNERcdTc2RUVcdTY4MDdcdTg4NENcdUZGMDhcdTY1ODdcdTRFRjZcdTVERjJcdTg4QUJcdTRGRUVcdTY1MzlcdUZGMUZcdThCRjdcdTYyNEJcdTUyQThcdTUyRkVcdTkwMDlcdUZGMDlcXG5cdTc2RUVcdTY4MDdcdUZGMUEke2xvY2F0b3IubGluZVRleHR9YCxcbiAgICAgICk7XG4gICAgfVxuICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlVGFza0xpbmUobGluZXNbaGl0SW5kZXhdKTtcbiAgICBpZiAoIXBhcnNlZCkgdGhyb3cgbmV3IEVycm9yKFwiXHU3NkVFXHU2ODA3XHU4ODRDXHU0RTBEXHU2NjJGXHU1NDA4XHU4OUM0XHU0RUZCXHU1MkExXHU4ODRDXCIpO1xuICAgIGlmIChwYXJzZWQuY2hlY2tlZCkgcmV0dXJuIGRhdGE7IC8vIFx1NURGMlx1NUI4Q1x1NjIxMFx1RkYwQ25vb3BcblxuICAgIGxpbmVzW2hpdEluZGV4XSA9IHNlcmlhbGl6ZVRhc2sod2l0aENvbXBsZXRlZChwYXJzZWQsIHRvZGF5KSk7XG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oXCJcXG5cIik7XG4gIH0pO1xufVxuXG4vKipcbiAqIFx1OEZGRFx1NTJBMFx1NEUwMFx1Njc2MVx1NEVGQlx1NTJBMVx1NTIzMFx1OEJBMVx1NTIxMlx1NjU4N1x1NEVGNlx1NjcyQlx1NUMzRVx1RkYwOFx1NjVCMFx1ODg0Q1x1RkYwOVx1MzAwMlxuICogcGxhbiBcdTY1ODdcdTRFRjZcdTVGQzVcdTk4N0JcdTVCNThcdTU3MjhcdTRFOEUgaW5ib3gvdGFza3MvIFx1NEUwQlx1MzAwMlxuICogdGFza0xpbmUgXHU0RTBEXHU1MTQxXHU4QkI4XHU1NDJCXHU2MzYyXHU4ODRDL1x1NTZERVx1OEY2Ni9OVUxcdUZGMDhcdTk2MzJcdTZDRThcdTUxNjVcdTU5MUFcdTg4NEMgbWFya2Rvd25cdUZGMDlcdTMwMDJcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFwcGVuZFRhc2tUb1BsYW4oXG4gIGFwcDogQXBwLFxuICBwbGFuUGF0aDogc3RyaW5nLFxuICB0YXNrTGluZTogc3RyaW5nLFxuKTogUHJvbWlzZTx2b2lkPiB7XG4gIGlmICghcGxhblBhdGguc3RhcnRzV2l0aChUQVNLU19ESVIgKyBcIi9cIikpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFx1OEJBMVx1NTIxMlx1NjU4N1x1NEVGNlx1NUZDNVx1OTg3Qlx1NTcyOCAke1RBU0tTX0RJUn0vIFx1NEUwQmApO1xuICB9XG4gIGlmICgvW1xcclxcblxcdTAwMDBdLy50ZXN0KHRhc2tMaW5lKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlx1NEVGQlx1NTJBMVx1NTE4NVx1NUJCOVx1NEUwRFx1ODBGRFx1NTMwNVx1NTQyQlx1NjM2Mlx1ODg0Q1wiKTtcbiAgfVxuICBjb25zdCBmaWxlID0gYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChwbGFuUGF0aCk7XG4gIGlmICghKGZpbGUgaW5zdGFuY2VvZiBURmlsZSkpIHRocm93IG5ldyBFcnJvcihgXHU4QkExXHU1MjEyXHU2NTg3XHU0RUY2XHU0RTBEXHU1QjU4XHU1NzI4XHVGRjFBJHtwbGFuUGF0aH1gKTtcblxuICBhd2FpdCBhcHAudmF1bHQucHJvY2VzcyhmaWxlLCAoZGF0YSkgPT4ge1xuICAgIGNvbnN0IG5lZWRzTmwgPSBkYXRhLmxlbmd0aCA+IDAgJiYgIWRhdGEuZW5kc1dpdGgoXCJcXG5cIik7XG4gICAgcmV0dXJuIGRhdGEgKyAobmVlZHNObCA/IFwiXFxuXCIgOiBcIlwiKSArIHRhc2tMaW5lICsgXCJcXG5cIjtcbiAgfSk7XG59XG5cbi8qKlxuICogXHU2NUIwXHU1RUZBXHU4QkExXHU1MjEyXHU2NTg3XHU0RUY2XHVGRjA4U1BFQyBcdTAwQTc1LjJcdUZGMDlcdTMwMDJcbiAqIFx1OERFRlx1NUY4NFx1Nzg2Q1x1NjAyN1x1OTY1MFx1NUI5QVx1NTcyOCBpbmJveC90YXNrcy8gXHU0RTBCXHVGRjFCXHU1NDBDXHU1NDBEXHU1MUIyXHU3QTgxXHU2NUY2XHU4RkZEXHU1MkEwIC0xLy0yLy4uLiBcdTU0MEVcdTdGMDBcdTMwMDJcbiAqIFx1OEZENFx1NTZERVx1NTIxQlx1NUVGQVx1NTQwRVx1NzY4NFx1NjU4N1x1NEVGNlx1OERFRlx1NUY4NFx1MzAwMlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlUGxhbkZpbGUoYXBwOiBBcHAsIHRpdGxlOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICBjb25zdCBzYWZlTmFtZSA9IHNhbml0aXplUGxhbkZpbGVOYW1lKHRpdGxlKTtcblxuICAvLyBcdTc4NkVcdTRGRERcdTc2RUVcdTVGNTVcbiAgY29uc3QgZGlyID0gYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChUQVNLU19ESVIpO1xuICBpZiAoIWRpcikgYXdhaXQgYXBwLnZhdWx0LmNyZWF0ZUZvbGRlcihUQVNLU19ESVIpO1xuXG4gIC8vIFx1NTFCMlx1N0E4MVx1NTkwNFx1NzQwNlxuICBsZXQgcGF0aCA9IG5vcm1hbGl6ZVBhdGgoYCR7VEFTS1NfRElSfS8ke3NhZmVOYW1lfS5tZGApO1xuICBsZXQgbiA9IDE7XG4gIHdoaWxlIChhcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKHBhdGgpKSB7XG4gICAgcGF0aCA9IG5vcm1hbGl6ZVBhdGgoYCR7VEFTS1NfRElSfS8ke3NhZmVOYW1lfS0ke259Lm1kYCk7XG4gICAgbisrO1xuICB9XG4gIC8vIFx1NEU4Q1x1NkIyMVx1OTYzMlx1NUZBMVx1RkYxQVx1Nzg2RVx1OEJBNFx1OERFRlx1NUY4NFx1NEVDRFx1NTcyOCBpbmJveC90YXNrcy8gXHU1MTg1XG4gIGlmICghcGF0aC5zdGFydHNXaXRoKFRBU0tTX0RJUiArIFwiL1wiKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgXHU2MkQyXHU3RUREXHU1MjFCXHU1RUZBXHVGRjFBXHU4REVGXHU1Rjg0XHU5MDAzXHU5MDM4ICR7cGF0aH1gKTtcbiAgfVxuXG4gIGNvbnN0IHRvZGF5ID0gdG9kYXlEYXRlU3RyKCk7XG4gIGNvbnN0IGJvZHkgPVxuICAgIGAtLS1cXG5gICtcbiAgICBgdGl0bGU6IFwiJHtzYWZlTmFtZS5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJyl9XCJcXG5gICtcbiAgICBgdHlwZTogcGxhblxcbmAgK1xuICAgIGBzdGF0dXM6IGFjdGl2ZVxcbmAgK1xuICAgIGBjcmVhdGVkOiAke3RvZGF5fVxcbmAgK1xuICAgIGB1cGRhdGVkOiAke3RvZGF5fVxcbmAgK1xuICAgIGB0YWdzOlxcbiAgLSBpbmJveC90YXNrXFxuYCArXG4gICAgYC0tLVxcblxcbmAgK1xuICAgIGAjICR7c2FmZU5hbWV9XFxuXFxuYDtcbiAgYXdhaXQgYXBwLnZhdWx0LmNyZWF0ZShwYXRoLCBib2R5KTtcbiAgcmV0dXJuIHBhdGg7XG59XG5cbi8qKiBcdTRGOUIgVUkgXHU1QzQyXHU4QzAzXHU3NTI4XHVGRjFBXHU1MkZFXHU5MDA5XHU1OTMxXHU4RDI1XHU2NUY2XHU3RURGXHU0RTAwXHU2NjNFXHU3OTNBIE5vdGljZSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlcG9ydFdyaXRlRXJyb3IoZXJyOiB1bmtub3duKTogdm9pZCB7XG4gIGNvbnN0IG1zZyA9IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKTtcbiAgbmV3IE5vdGljZShgXHU1MTk5XHU1NkRFXHU1OTMxXHU4RDI1XHVGRjFBJHttc2d9YCwgNjAwMCk7XG59XG5cbi8qKlxuICogXHU4OTg2XHU3NkQ2XHU1RjBGXHU2NTM5XHU1MTk5XHU0RUZCXHU1MkExXHU4ODRDXHVGRjA4XHU3NTI4XHU0RThFXHU4ODRDXHU1MTg1XHU3RjE2XHU4RjkxXHVGRjFBXHU2NTM5XHU2NUU1XHU2NzFGL1x1NEYxOFx1NTE0OFx1N0VBNy9cdTYzQ0ZcdThGRjBcdUZGMDlcdTMwMDJcbiAqIFx1NUI5QVx1NEY0RFx1N0I1Nlx1NzU2NVx1NEUwRSB0b2dnbGVUYXNrQ29tcGxldGUgXHU0RTAwXHU4MUY0XHVGRjFBXHU1MTg1XHU1QkI5XHU1MzM5XHU5MTREICsgXHU1MUZBXHU3M0IwXHU1RThGXHU1M0Y3XHVGRjBDXHU0RTBEXHU1NDAzXHU4ODRDXHU1M0Y3XHU2RjAyXHU3OUZCXHUzMDAyXG4gKiBuZXdMaW5lVGV4dCBcdTVGQzVcdTk4N0JcdTY2MkZcdTVCOENcdTY1NzRcdTc2ODRcdTRFMDBcdTg4NENcdUZGMDhcdTU0MkIgaW5kZW50ICsgYC0gWyBdIC4uLmBcdUZGMDlcdUZGMENcdTRFMTRcdTRFMERcdTVGOTdcdTU0MkJcdTYzNjJcdTg4NEMvXHU1NkRFXHU4RjY2L05VTFx1MzAwMlxuICogXHU4MkU1XHU2NUUwXHU2Q0Q1XHU1NTJGXHU0RTAwXHU1QjlBXHU0RjREXHU1MjE5IHRocm93XHVGRjBDVUkgXHU1QzQyXHU1RjM5IE5vdGljZSBcdTYzRDBcdTc5M0FcdTYyNEJcdTUyQThcdTU5MDRcdTc0MDZcdTMwMDJcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVwZGF0ZVRhc2tMaW5lKFxuICBhcHA6IEFwcCxcbiAgbG9jYXRvcjogVGFza0xvY2F0b3IsXG4gIG5ld0xpbmVUZXh0OiBzdHJpbmcsXG4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgaWYgKCFsb2NhdG9yLmZpbGVQYXRoLnN0YXJ0c1dpdGgoVEFTS1NfRElSICsgXCIvXCIpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBcdTYyRDJcdTdFRERcdTUxOTlcdTUxNjUgJHtUQVNLU19ESVJ9LyBcdTRFNEJcdTU5MTZcdUZGMUEke2xvY2F0b3IuZmlsZVBhdGh9YCk7XG4gIH1cbiAgaWYgKC9bXFxyXFxuXFx1MDAwMF0vLnRlc3QobmV3TGluZVRleHQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiXHU0RUZCXHU1MkExXHU4ODRDXHU0RTBEXHU4MEZEXHU1MzA1XHU1NDJCXHU2MzYyXHU4ODRDXCIpO1xuICB9XG4gIGNvbnN0IGZpbGUgPSBhcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKGxvY2F0b3IuZmlsZVBhdGgpO1xuICBpZiAoIShmaWxlIGluc3RhbmNlb2YgVEZpbGUpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBcdThCQTFcdTUyMTJcdTY1ODdcdTRFRjZcdTRFMERcdTVCNThcdTU3MjhcdUZGMUEke2xvY2F0b3IuZmlsZVBhdGh9YCk7XG4gIH1cblxuICBhd2FpdCBhcHAudmF1bHQucHJvY2VzcyhmaWxlLCAoZGF0YSkgPT4ge1xuICAgIGNvbnN0IGxpbmVzID0gZGF0YS5zcGxpdCgvXFxyP1xcbi8pO1xuICAgIGxldCBzZWVuID0gMDtcbiAgICBsZXQgaGl0SW5kZXggPSAtMTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAobGluZXNbaV0gPT09IGxvY2F0b3IubGluZVRleHQpIHtcbiAgICAgICAgaWYgKHNlZW4gPT09IGxvY2F0b3Iub2NjdXJyZW5jZSkge1xuICAgICAgICAgIGhpdEluZGV4ID0gaTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBzZWVuKys7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChoaXRJbmRleCA8IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYFx1NjVFMFx1NkNENVx1NTUyRlx1NEUwMFx1NUI5QVx1NEY0RFx1NzZFRVx1NjgwN1x1ODg0Q1x1RkYwOFx1NjU4N1x1NEVGNlx1NURGMlx1ODhBQlx1NEZFRVx1NjUzOVx1RkYxRlx1OEJGN1x1NjI0Qlx1NTJBOFx1N0YxNlx1OEY5MVx1RkYwOVxcblx1NzZFRVx1NjgwN1x1RkYxQSR7bG9jYXRvci5saW5lVGV4dH1gLFxuICAgICAgKTtcbiAgICB9XG4gICAgLy8gXHU2ODIxXHU5QThDXHU3NkVFXHU2ODA3XHU4ODRDXHU3ODZFXHU0RTNBXHU0RUZCXHU1MkExXHU4ODRDXHVGRjBDXHU5MDdGXHU1MTREXHU4QkVGXHU2NTM5XG4gICAgaWYgKCFwYXJzZVRhc2tMaW5lKGxpbmVzW2hpdEluZGV4XSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlx1NzZFRVx1NjgwN1x1ODg0Q1x1NEUwRFx1NjYyRlx1NTQwOFx1ODlDNFx1NEVGQlx1NTJBMVx1ODg0Q1wiKTtcbiAgICB9XG4gICAgaWYgKGxpbmVzW2hpdEluZGV4XSA9PT0gbmV3TGluZVRleHQpIHJldHVybiBkYXRhOyAvLyBub29wXG4gICAgbGluZXNbaGl0SW5kZXhdID0gbmV3TGluZVRleHQ7XG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oXCJcXG5cIik7XG4gIH0pO1xufVxuIiwgIi8qKlxuICogXHU0RUZCXHU1MkExXHU4ODRDXHU4OUUzXHU2NzkwXHU0RTBFXHU1RThGXHU1MjE3XHU1MzE2XHUzMDAyXG4gKlxuICogXHU2NTcwXHU2MzZFXHU1OTUxXHU3RUE2XHVGRjA4XHU0RTBFIFNQRUMgXHUwMEE3NS4xIFx1NEUwMFx1ODFGNFx1RkYwOVx1RkYxQVxuICogICAtIFsgXSBcdTYzQ0ZcdThGRjAgXHVEODNEXHVEQ0M1IFlZWVktTU0tREQgXHUyM0VCXG4gKiAgIC0gW3hdIFx1NURGMlx1NUI4Q1x1NjIxMFx1NEVGQlx1NTJBMSBcdTI3MDUgMjAyNi0wNy0xMVxuICpcbiAqIFx1NTE3M1x1OTUyRVx1ODlDNFx1NTIxOVx1RkYxQVxuICogLSBcdTUxNDNcdTY1NzBcdTYzNkUgZW1vamkgdG9rZW4gXHU1M0VBXHU4QkM2XHU1MjJCKipcdTg4NENcdTVDM0VcdThGREVcdTdFRUQgdG9rZW4gXHU1RThGXHU1MjE3KipcdUZGMUJcdTYzQ0ZcdThGRjBcdTZCNjNcdTY1ODdcdTRFMkRcdTc2ODRcdTU0MENcdTZCM0UgZW1vamkgXHU0RTBEXHU4OUUzXHU2NzkwXHUzMDAyXG4gKiAtIFx1NEZERFx1NzU1OSB0b2tlbiBcdTUzOUZcdTY3MDlcdTk4N0FcdTVFOEZcdUZGMENcdTc4NkVcdTRGRERcdTg5RTNcdTY3OTBcdTIxOTJcdTVFOEZcdTUyMTdcdTUzMTZcdTVCRjlcdTU0MDhcdTg5QzRcdTg4NEMqKlx1NjVFMFx1NjM1Rlx1NUY4MFx1OEZENCoqXHUzMDAyXG4gKiAtIFx1NjVFNVx1NjcxRlx1NjgzQ1x1NUYwRiBZWVlZLU1NLUREXHVGRjFCXHU0RTBEXHU3QjI2XHU1NDA4XHU2ODNDXHU1RjBGXHU3Njg0IGVtb2ppIHRva2VuIFx1NTA1Q1x1NkI2Mlx1OEJDNlx1NTIyQlx1RkYwQ1x1NEZERFx1NzU1OVx1NTcyOFx1NjNDRlx1OEZGMFx1NEUyRFx1MzAwMlxuICogLSBcdTRFMERcdTU0MDhcdTg5QzRcdTg4NENcdThGRDRcdTU2REUgbnVsbFx1RkYwOFx1NUJCRFx1NUJCOVx1NTM5Rlx1NTIxOVx1RkYwQ1NQRUMgMi4yIzdcdUZGMDlcdUZGMENcdTc1MzFcdTRFMEFcdTZFMzhcdTUxQjNcdTVCOUFcdThERjNcdThGQzdcdTYyMTZcdTUzOUZcdTY4MzdcdTRGRERcdTc1NTlcdTMwMDJcbiAqL1xuXG5leHBvcnQgdHlwZSBQcmlvcml0eSA9IFwiaGlnaFwiIHwgXCJtZWRpdW1cIiB8IFwibG93XCI7XG5leHBvcnQgdHlwZSBUb2tlbktpbmQgPSBcImR1ZVwiIHwgXCJwcmlvcml0eVwiIHwgXCJjb21wbGV0ZWRcIjtcblxuZXhwb3J0IGludGVyZmFjZSBUYXNrVG9rZW4ge1xuICBraW5kOiBUb2tlbktpbmQ7XG4gIC8qKiBcdTVFOEZcdTUyMTdcdTUzMTZcdTY1RjZcdTdDQkVcdTc4NkVcdTU2REVcdTUxOTlcdTc2ODRcdTVCNTdcdTk3NjJcdTkxQ0ZcdUZGMDhcdTU5ODIgYFx1RDgzRFx1RENDNSAyMDI2LTA3LTE1YFx1RkYwOSAqL1xuICByYXc6IHN0cmluZztcbiAgLyoqIFx1NUJGOSBkdWUvY29tcGxldGVkIFx1NEUzQSBZWVlZLU1NLUREXHVGRjFCXHU1QkY5IHByaW9yaXR5IFx1NEUzQSBoaWdoL21lZGl1bS9sb3cgKi9cbiAgdmFsdWU6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQYXJzZWRUYXNrIHtcbiAgaW5kZW50OiBzdHJpbmc7XG4gIGNoZWNrZWQ6IGJvb2xlYW47XG4gIHRleHQ6IHN0cmluZztcbiAgdG9rZW5zOiBUYXNrVG9rZW5bXTtcbn1cblxuY29uc3QgVEFTS19SRSA9IC9eKFsgXFx0XSopLSBcXFsoIHx4fFgpXFxdICguKikkLztcbmNvbnN0IERBVEVfUkUgPSAvXlxcZHs0fS1cXGR7Mn0tXFxkezJ9JC87XG5jb25zdCBQUklPX01BUDogUmVjb3JkPHN0cmluZywgUHJpb3JpdHk+ID0geyBcIlx1MjNFQlwiOiBcImhpZ2hcIiwgXCJcdUQ4M0RcdUREM0NcIjogXCJtZWRpdW1cIiwgXCJcdUQ4M0RcdUREM0RcIjogXCJsb3dcIiB9O1xuZXhwb3J0IGNvbnN0IFBSSU9fRU1PSkk6IFJlY29yZDxQcmlvcml0eSwgc3RyaW5nPiA9IHsgaGlnaDogXCJcdTIzRUJcIiwgbWVkaXVtOiBcIlx1RDgzRFx1REQzQ1wiLCBsb3c6IFwiXHVEODNEXHVERDNEXCIgfTtcblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlVGFza0xpbmUobGluZTogc3RyaW5nKTogUGFyc2VkVGFzayB8IG51bGwge1xuICBjb25zdCBtID0gVEFTS19SRS5leGVjKGxpbmUpO1xuICBpZiAoIW0pIHJldHVybiBudWxsO1xuICBjb25zdCBpbmRlbnQgPSBtWzFdO1xuICBjb25zdCBjaGVja2VkID0gbVsyXS50b0xvd2VyQ2FzZSgpID09PSBcInhcIjtcbiAgY29uc3QgYm9keSA9IG1bM107XG5cbiAgLy8gXHU2MzA5XHU3QTdBXHU3NjdEXHU2MkM2XHU4QkNEXHVGRjBDXHU0RUNFXHU2NzJCXHU1QzNFXHU1RjgwXHU1MjREXHU4QkM2XHU1MjJCXHU4ODRDXHU1QzNFXHU4RkRFXHU3RUVEIHRva2VuIFx1NUU4Rlx1NTIxN1xuICBjb25zdCB3b3JkcyA9IGJvZHkuc3BsaXQoL1xccysvKS5maWx0ZXIoKHcpID0+IHcubGVuZ3RoID4gMCk7XG4gIGNvbnN0IHRva2VuczogVGFza1Rva2VuW10gPSBbXTtcblxuICB3aGlsZSAod29yZHMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IGxhc3QgPSB3b3Jkc1t3b3Jkcy5sZW5ndGggLSAxXTtcbiAgICAvLyBcdTUzNTVcdThCQ0QgdG9rZW5cdUZGMUFcdTRGMThcdTUxNDhcdTdFQTdcbiAgICBpZiAobGFzdCBpbiBQUklPX01BUCkge1xuICAgICAgdG9rZW5zLnVuc2hpZnQoeyBraW5kOiBcInByaW9yaXR5XCIsIHJhdzogbGFzdCwgdmFsdWU6IFBSSU9fTUFQW2xhc3RdIH0pO1xuICAgICAgd29yZHMucG9wKCk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgLy8gXHU1M0NDXHU4QkNEIHRva2VuXHVGRjFBXHVEODNEXHVEQ0M1L1x1MjcwNSArIFlZWVktTU0tRERcbiAgICBpZiAod29yZHMubGVuZ3RoID49IDIgJiYgREFURV9SRS50ZXN0KGxhc3QpKSB7XG4gICAgICBjb25zdCBwcmV2ID0gd29yZHNbd29yZHMubGVuZ3RoIC0gMl07XG4gICAgICBpZiAocHJldiA9PT0gXCJcdUQ4M0RcdURDQzVcIikge1xuICAgICAgICB0b2tlbnMudW5zaGlmdCh7IGtpbmQ6IFwiZHVlXCIsIHJhdzogYFx1RDgzRFx1RENDNSAke2xhc3R9YCwgdmFsdWU6IGxhc3QgfSk7XG4gICAgICAgIHdvcmRzLnBvcCgpO1xuICAgICAgICB3b3Jkcy5wb3AoKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBpZiAocHJldiA9PT0gXCJcdTI3MDVcIikge1xuICAgICAgICB0b2tlbnMudW5zaGlmdCh7IGtpbmQ6IFwiY29tcGxldGVkXCIsIHJhdzogYFx1MjcwNSAke2xhc3R9YCwgdmFsdWU6IGxhc3QgfSk7XG4gICAgICAgIHdvcmRzLnBvcCgpO1xuICAgICAgICB3b3Jkcy5wb3AoKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgfVxuICAgIGJyZWFrO1xuICB9XG5cbiAgcmV0dXJuIHsgaW5kZW50LCBjaGVja2VkLCB0ZXh0OiB3b3Jkcy5qb2luKFwiIFwiKSwgdG9rZW5zIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXJpYWxpemVUYXNrKHRhc2s6IFBhcnNlZFRhc2spOiBzdHJpbmcge1xuICBjb25zdCBib3ggPSB0YXNrLmNoZWNrZWQgPyBcInhcIiA6IFwiIFwiO1xuICBjb25zdCBwYXJ0czogc3RyaW5nW10gPSBbXTtcbiAgaWYgKHRhc2sudGV4dC5sZW5ndGggPiAwKSBwYXJ0cy5wdXNoKHRhc2sudGV4dCk7XG4gIGZvciAoY29uc3QgdCBvZiB0YXNrLnRva2VucykgcGFydHMucHVzaCh0LnJhdyk7XG4gIGNvbnN0IHRhaWwgPSBwYXJ0cy5sZW5ndGggPiAwID8gXCIgXCIgKyBwYXJ0cy5qb2luKFwiIFwiKSA6IFwiXCI7XG4gIHJldHVybiBgJHt0YXNrLmluZGVudH0tIFske2JveH1dJHt0YWlsfWA7XG59XG5cbi8qKiBcdTRGQkZcdTYzNzdcdThCQkZcdTk1RUVcdTU2NjggKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXREdWUodGFzazogUGFyc2VkVGFzayk6IHN0cmluZyB8IG51bGwge1xuICBjb25zdCB0ID0gdGFzay50b2tlbnMuZmluZCgoeCkgPT4geC5raW5kID09PSBcImR1ZVwiKTtcbiAgcmV0dXJuIHQgPyB0LnZhbHVlIDogbnVsbDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRQcmlvcml0eSh0YXNrOiBQYXJzZWRUYXNrKTogUHJpb3JpdHkgfCBudWxsIHtcbiAgY29uc3QgdCA9IHRhc2sudG9rZW5zLmZpbmQoKHgpID0+IHgua2luZCA9PT0gXCJwcmlvcml0eVwiKTtcbiAgcmV0dXJuIHQgPyAodC52YWx1ZSBhcyBQcmlvcml0eSkgOiBudWxsO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbXBsZXRlZCh0YXNrOiBQYXJzZWRUYXNrKTogc3RyaW5nIHwgbnVsbCB7XG4gIGNvbnN0IHQgPSB0YXNrLnRva2Vucy5maW5kKCh4KSA9PiB4LmtpbmQgPT09IFwiY29tcGxldGVkXCIpO1xuICByZXR1cm4gdCA/IHQudmFsdWUgOiBudWxsO1xufVxuXG4vKiogXHU1NzI4XHU0RUZCXHU1MkExXHU0RTBBXHU2REZCXHU1MkEwXHU2MjE2XHU2NkZGXHU2MzYyIGNvbXBsZXRlZCB0b2tlblx1RkYwQ1x1OEZENFx1NTZERVx1NjVCMFx1NUJGOVx1OEM2MSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhDb21wbGV0ZWQodGFzazogUGFyc2VkVGFzaywgZGF0ZTogc3RyaW5nKTogUGFyc2VkVGFzayB7XG4gIGNvbnN0IHJhdyA9IGBcdTI3MDUgJHtkYXRlfWA7XG4gIGNvbnN0IHRva2VucyA9IHRhc2sudG9rZW5zLmZpbHRlcigodCkgPT4gdC5raW5kICE9PSBcImNvbXBsZXRlZFwiKTtcbiAgdG9rZW5zLnB1c2goeyBraW5kOiBcImNvbXBsZXRlZFwiLCByYXcsIHZhbHVlOiBkYXRlIH0pO1xuICByZXR1cm4geyAuLi50YXNrLCBjaGVja2VkOiB0cnVlLCB0b2tlbnMgfTtcbn1cblxuLyoqXG4gKiBcdTY2RkZcdTYzNjJcdTYyMTZcdTc5RkJcdTk2NjRcdTYzMDdcdTVCOUEga2luZCBcdTc2ODQgdG9rZW5cdTMwMDJcdTVERjJcdTVCNThcdTU3MjhcdTU0MEMga2luZCBcdTY1RjYqKlx1NEZERFx1NjMwMVx1NTM5Rlx1NEY0RFx1N0Y2RSoqXHVGRjA4XHU0RTBEXHU5MUNEXHU2MzkyXHVGRjA5XHVGRjBDXG4gKiBcdTRGRERcdThCQzEgVUkgXHU3RjE2XHU4RjkxXHU3Njg0XHU4OUM2XHU4OUM5XHU3QTMzXHU1QjlBXHVGRjFCXHU0RTBEXHU1QjU4XHU1NzI4XHU2NUY2XHU4RkZEXHU1MkEwXHU1MjMwXHU2NzJCXHU1QzNFXHUzMDAyXG4gKiBkYXRlID09PSBudWxsIC8gcHJpbyA9PT0gbnVsbCBcdTg4NjhcdTc5M0FcdTc5RkJcdTk2NjRcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhEdWUodGFzazogUGFyc2VkVGFzaywgZGF0ZTogc3RyaW5nIHwgbnVsbCk6IFBhcnNlZFRhc2sge1xuICBpZiAoZGF0ZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiB7IC4uLnRhc2ssIHRva2VuczogdGFzay50b2tlbnMuZmlsdGVyKCh0KSA9PiB0LmtpbmQgIT09IFwiZHVlXCIpIH07XG4gIH1cbiAgY29uc3QgcmF3ID0gYFx1RDgzRFx1RENDNSAke2RhdGV9YDtcbiAgY29uc3QgaWR4ID0gdGFzay50b2tlbnMuZmluZEluZGV4KCh0KSA9PiB0LmtpbmQgPT09IFwiZHVlXCIpO1xuICBjb25zdCB0b2tlbnMgPSBbLi4udGFzay50b2tlbnNdO1xuICBjb25zdCBuZXdUb2s6IFRhc2tUb2tlbiA9IHsga2luZDogXCJkdWVcIiwgcmF3LCB2YWx1ZTogZGF0ZSB9O1xuICBpZiAoaWR4ID49IDApIHRva2Vuc1tpZHhdID0gbmV3VG9rO1xuICBlbHNlIHRva2Vucy5wdXNoKG5ld1Rvayk7XG4gIHJldHVybiB7IC4uLnRhc2ssIHRva2VucyB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd2l0aFByaW9yaXR5KHRhc2s6IFBhcnNlZFRhc2ssIHByaW86IFByaW9yaXR5IHwgbnVsbCk6IFBhcnNlZFRhc2sge1xuICBpZiAocHJpbyA9PT0gbnVsbCkge1xuICAgIHJldHVybiB7IC4uLnRhc2ssIHRva2VuczogdGFzay50b2tlbnMuZmlsdGVyKCh0KSA9PiB0LmtpbmQgIT09IFwicHJpb3JpdHlcIikgfTtcbiAgfVxuICBjb25zdCByYXcgPSBQUklPX0VNT0pJW3ByaW9dO1xuICBjb25zdCBpZHggPSB0YXNrLnRva2Vucy5maW5kSW5kZXgoKHQpID0+IHQua2luZCA9PT0gXCJwcmlvcml0eVwiKTtcbiAgY29uc3QgdG9rZW5zID0gWy4uLnRhc2sudG9rZW5zXTtcbiAgY29uc3QgbmV3VG9rOiBUYXNrVG9rZW4gPSB7IGtpbmQ6IFwicHJpb3JpdHlcIiwgcmF3LCB2YWx1ZTogcHJpbyB9O1xuICBpZiAoaWR4ID49IDApIHRva2Vuc1tpZHhdID0gbmV3VG9rO1xuICBlbHNlIHRva2Vucy5wdXNoKG5ld1Rvayk7XG4gIHJldHVybiB7IC4uLnRhc2ssIHRva2VucyB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd2l0aFRleHQodGFzazogUGFyc2VkVGFzaywgdGV4dDogc3RyaW5nKTogUGFyc2VkVGFzayB7XG4gIHJldHVybiB7IC4uLnRhc2ssIHRleHQgfTtcbn1cbiIsICJpbXBvcnQgeyBBcHAsIFRGaWxlIH0gZnJvbSBcIm9ic2lkaWFuXCI7XG5pbXBvcnQgeyBwYXJzZVRhc2tMaW5lIH0gZnJvbSBcIi4vcGFyc2VyXCI7XG5pbXBvcnQgdHlwZSB7IFBsYW5TdGF0dXMsIFRhc2tJdGVtLCBQbGFuQmFzZSB9IGZyb20gXCIuL3R5cGVzXCI7XG5cbmV4cG9ydCB0eXBlIHsgUGxhblN0YXR1cywgVGFza0xvY2F0b3IsIFRhc2tJdGVtLCBQbGFuQmFzZSB9IGZyb20gXCIuL3R5cGVzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGxhbiBleHRlbmRzIFBsYW5CYXNlIHtcbiAgZmlsZTogVEZpbGU7XG59XG5cbmNvbnN0IFRBU0tTX0RJUiA9IFwiaW5ib3gvdGFza3MvXCI7XG5cbi8qKiBcdTkwNERcdTUzODYgaW5ib3gvdGFza3MvIFx1NEUwQlx1NjI0MFx1NjcwOSBmcm9udG1hdHRlciB0eXBlPXBsYW4gXHU3Njg0IG1kIFx1NjU4N1x1NEVGNiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWRQbGFucyhhcHA6IEFwcCk6IFByb21pc2U8UGxhbltdPiB7XG4gIGNvbnN0IHBsYW5zOiBQbGFuW10gPSBbXTtcbiAgZm9yIChjb25zdCBmIG9mIGFwcC52YXVsdC5nZXRNYXJrZG93bkZpbGVzKCkpIHtcbiAgICBpZiAoIWYucGF0aC5zdGFydHNXaXRoKFRBU0tTX0RJUikpIGNvbnRpbnVlO1xuICAgIGNvbnN0IGNhY2hlID0gYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0RmlsZUNhY2hlKGYpO1xuICAgIGNvbnN0IGZtID0gY2FjaGU/LmZyb250bWF0dGVyIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkO1xuICAgIGlmICghZm0gfHwgZm0udHlwZSAhPT0gXCJwbGFuXCIpIGNvbnRpbnVlO1xuXG4gICAgY29uc3QgcmF3U3RhdHVzID0gU3RyaW5nKGZtLnN0YXR1cyA/PyBcImFjdGl2ZVwiKS50b0xvd2VyQ2FzZSgpO1xuICAgIGNvbnN0IHN0YXR1czogUGxhblN0YXR1cyA9XG4gICAgICByYXdTdGF0dXMgPT09IFwiZG9uZVwiIHx8IHJhd1N0YXR1cyA9PT0gXCJhcmNoaXZlZFwiID8gcmF3U3RhdHVzIDogXCJhY3RpdmVcIjtcbiAgICBjb25zdCB0aXRsZSA9IGYuYmFzZW5hbWU7XG5cbiAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgYXBwLnZhdWx0LmNhY2hlZFJlYWQoZik7XG4gICAgY29uc3QgbGluZXMgPSBjb250ZW50LnNwbGl0KC9cXHI/XFxuLyk7XG4gICAgY29uc3QgdGFza3M6IFRhc2tJdGVtW10gPSBbXTtcbiAgICBjb25zdCBvY2NDb3VudCA9IG5ldyBNYXA8c3RyaW5nLCBudW1iZXI+KCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBwYXJzZWQgPSBwYXJzZVRhc2tMaW5lKGxpbmVzW2ldKTtcbiAgICAgIGlmICghcGFyc2VkKSBjb250aW51ZTtcbiAgICAgIGNvbnN0IHJhd0xpbmUgPSBsaW5lc1tpXTtcbiAgICAgIGNvbnN0IG9jYyA9IG9jY0NvdW50LmdldChyYXdMaW5lKSA/PyAwO1xuICAgICAgb2NjQ291bnQuc2V0KHJhd0xpbmUsIG9jYyArIDEpO1xuICAgICAgdGFza3MucHVzaCh7XG4gICAgICAgIHBsYW5QYXRoOiBmLnBhdGgsXG4gICAgICAgIHBsYW5UaXRsZTogdGl0bGUsXG4gICAgICAgIHBsYW5TdGF0dXM6IHN0YXR1cyxcbiAgICAgICAgbGluZU51bWJlcjogaSxcbiAgICAgICAgcGFyc2VkLFxuICAgICAgICBsb2NhdG9yOiB7IGZpbGVQYXRoOiBmLnBhdGgsIGxpbmVUZXh0OiByYXdMaW5lLCBvY2N1cnJlbmNlOiBvY2MgfSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHBsYW5zLnB1c2goeyBmaWxlOiBmLCBwYXRoOiBmLnBhdGgsIHRpdGxlLCBzdGF0dXMsIHRhc2tzIH0pO1xuICB9XG4gIHBsYW5zLnNvcnQoKGEsIGIpID0+XG4gICAgYS50aXRsZSA8IGIudGl0bGUgPyAtMSA6IGEudGl0bGUgPiBiLnRpdGxlID8gMSA6IDAsXG4gICk7XG4gIHJldHVybiBwbGFucztcbn1cbiIsICJpbXBvcnQgeyBBcHAsIE1lbnUsIE5vdGljZSwgVEZpbGUsIHByZXBhcmVGdXp6eVNlYXJjaCB9IGZyb20gXCJvYnNpZGlhblwiO1xuaW1wb3J0IHR5cGUgV29ya2JlbmNoUGx1Z2luIGZyb20gXCIuLi9tYWluXCI7XG5pbXBvcnQge1xuICBhZ2dyZWdhdGVEaXJUcmVlLFxuICBhZ2dyZWdhdGVXaWtpTWF0cml4LFxuICBDZWxsLFxuICBjb2xsZWN0V2lraUZpbGVzLFxuICBGaWxlUmVjLFxuICBsYXRlc3RNdGltZSxcbiAgbGF0ZXN0TXRpbWVPZixcbiAgU3ViZGlyQ2VsbCxcbiAgV0lLSV9UWVBFUyxcbiAgV0lLSV9UWVBFX0xBQkVMUyxcbn0gZnJvbSBcIi4vcHJvdmlkZXJzXCI7XG5cbnR5cGUgVGFiID0gXCJ3aWtpXCIgfCBcInJhd1wiIHwgXCJvdXRwdXRcIjtcblxuaW50ZXJmYWNlIFN0YXRlIHtcbiAgdGFiOiBUYWI7XG4gIC8qKlxuICAgKiBcdTkwMDlcdTRFMkRcdTc2ODRcdTRFMDBcdTdFQTdcdTUzNTVcdTUxNDNcdTY4M0Mga2V5XHVGRjFBXG4gICAqIC0gd2lraTogYCR7ZG9tYWlufXwke3R5cGV9YFxuICAgKiAtIHJhdy9vdXRwdXQ6IFx1NEUwMFx1N0VBN1x1NzZFRVx1NUY1NVx1NTQwRFx1RkYwOFx1NjIxNiBgX191bmNhdGVnb3JpemVkX19gXHVGRjA5XG4gICAqL1xuICBzZWxlY3RlZEwxOiBzdHJpbmcgfCBudWxsO1xuICAvKiogXHU5MDA5XHU0RTJEXHU3Njg0XHU0RThDXHU3RUE3XHU1QjUwXHU3NkVFXHU1RjU1IGtleVx1RkYwOFx1NEVDNSByYXcvb3V0cHV0IFx1NEY3Rlx1NzUyOFx1RkYwOVx1RkYwQ1x1NjgzQ1x1NUYwRiBgJHtsMX0vJHtsMn1gICovXG4gIHNlbGVjdGVkTDI6IHN0cmluZyB8IG51bGw7XG4gIGZpbHRlcjogc3RyaW5nO1xufVxuXG5jb25zdCBGSUxFX0xJU1RfTElNSVQgPSA1MDtcblxuZXhwb3J0IGNsYXNzIE1hdHJpeFNlY3Rpb24ge1xuICBwcml2YXRlIHN0YXRlOiBTdGF0ZSA9IHtcbiAgICB0YWI6IFwid2lraVwiLFxuICAgIHNlbGVjdGVkTDE6IG51bGwsXG4gICAgc2VsZWN0ZWRMMjogbnVsbCxcbiAgICBmaWx0ZXI6IFwiXCIsXG4gIH07XG4gIHByaXZhdGUgZmlsdGVySW5wdXRFbDogSFRNTElucHV0RWxlbWVudCB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGJvZHlFbDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBsaXN0RWw6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgc3BsaXRUb3BFbDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBzcGxpdEJvdHRvbUVsOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsO1xuICAvKiogXHU2MkQ2XHU2MkZEXHU0RkREXHU1QjU4XHU3Njg0XHU0RTBBXHU1MzNBXHVGRjA4XHU3N0U5XHU5NjM1XHVGRjA5XHU1MENGXHU3RDIwXHU5QUQ4XHU1RUE2XHVGRjFCbnVsbCA9IFx1OUVEOFx1OEJBNCA1MCUgKi9cbiAgcHJpdmF0ZSB0b3BQYW5lSGVpZ2h0OiBudW1iZXIgfCBudWxsID0gbnVsbDtcbiAgLyoqIFx1NEUyNFx1NTMzQVx1NTQwNFx1ODFFQVx1NzY4NFx1NkVEQVx1NTJBOFx1NEY0RFx1N0Y2RVx1RkYwOFx1OTFDRFx1NkUzMlx1NjdEM1x1NTI0RFx1NTQwRVx1NEZERFx1NjMwMVx1RkYwOSAqL1xuICBwcml2YXRlIHRvcFNjcm9sbCA9IDA7XG4gIHByaXZhdGUgYm90dG9tU2Nyb2xsID0gMDtcbiAgLyoqIHdpa2kgXHU5ODc1XHU3QjdFXHU0RTBCXHU3Njg0XHU0RTAwXHU3RUE3XHU5ODg2XHU1N0RGXHU1QzU1XHU1RjAwXHU2MDAxXHVGRjA4c2Vzc2lvbiBcdTUxODVcdUZGMENcdTRFMERcdTYzMDFcdTRFNDVcdTUzMTZcdUZGMDkgKi9cbiAgcHJpdmF0ZSBleHBhbmRlZEwxID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBhcHA6IEFwcCxcbiAgICBwcml2YXRlIHBsdWdpbjogV29ya2JlbmNoUGx1Z2luLFxuICAgIHByaXZhdGUgY29udGFpbmVyOiBIVE1MRWxlbWVudCxcbiAgKSB7fVxuXG4gIGhhc0ZvY3VzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ID09PSB0aGlzLmZpbHRlcklucHV0RWw7XG4gIH1cblxuICByZW5kZXIoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuc3BsaXRUb3BFbCkgdGhpcy50b3BTY3JvbGwgPSB0aGlzLnNwbGl0VG9wRWwuc2Nyb2xsVG9wO1xuICAgIGlmICh0aGlzLnNwbGl0Qm90dG9tRWwpIHRoaXMuYm90dG9tU2Nyb2xsID0gdGhpcy5zcGxpdEJvdHRvbUVsLnNjcm9sbFRvcDtcbiAgICBjb25zdCBmaWx0ZXJXYXNGb2N1c2VkID0gdGhpcy5oYXNGb2N1cygpO1xuXG4gICAgdGhpcy5jb250YWluZXIuZW1wdHkoKTtcbiAgICB0aGlzLmNvbnRhaW5lci5hZGRDbGFzcyhcImt3LW1hdHJpeFwiKTtcblxuICAgIC8vID09PT0gXHU5ODc1XHU3QjdFID09PT1cbiAgICBjb25zdCB0YWJzID0gdGhpcy5jb250YWluZXIuY3JlYXRlRGl2KHsgY2xzOiBcImt3LXRhYnNcIiB9KTtcbiAgICAoW1wid2lraVwiLCBcInJhd1wiLCBcIm91dHB1dFwiXSBhcyBjb25zdCkuZm9yRWFjaCgodCkgPT4ge1xuICAgICAgY29uc3QgZWwgPSB0YWJzLmNyZWF0ZURpdih7XG4gICAgICAgIGNsczogXCJrdy10YWJcIiArICh0aGlzLnN0YXRlLnRhYiA9PT0gdCA/IFwiIGFjdGl2ZVwiIDogXCJcIiksXG4gICAgICAgIHRleHQ6IHQsXG4gICAgICB9KTtcbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnRhYiA9PT0gdCkgcmV0dXJuO1xuICAgICAgICB0aGlzLnN0YXRlLnRhYiA9IHQ7XG4gICAgICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWRMMSA9IG51bGw7XG4gICAgICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWRMMiA9IG51bGw7XG4gICAgICAgIHRoaXMuc3RhdGUuZmlsdGVyID0gXCJcIjtcbiAgICAgICAgdGhpcy50b3BTY3JvbGwgPSAwO1xuICAgICAgICB0aGlzLmJvdHRvbVNjcm9sbCA9IDA7XG4gICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vID09PT0gcGluIFx1ODg0QyA9PT09XHVGRjA4dGFicyBcdTRFMEUgYm9keSBcdTRFNEJcdTk1RjRcdUZGMENcdTRFMERcdTUzQzJcdTRFMEUgYm9keSBcdTZFREFcdTUyQThcdUZGMDlcbiAgICB0aGlzLnJlbmRlclBpblJvdygpO1xuXG4gICAgLy8gPT09PSBib2R5ID09PT1cbiAgICB0aGlzLmJvZHlFbCA9IHRoaXMuY29udGFpbmVyLmNyZWF0ZURpdih7IGNsczogXCJrdy1tYXRyaXgtYm9keVwiIH0pO1xuXG4gICAgLy8gXHU4RkM3XHU2RUU0XHU4RjkzXHU1MTY1XG4gICAgY29uc3QgZmlsdGVyQm94ID0gdGhpcy5ib2R5RWwuY3JlYXRlRGl2KHsgY2xzOiBcImt3LWZpbHRlclwiIH0pO1xuICAgIGZpbHRlckJveC5jcmVhdGVTcGFuKHsgY2xzOiBcImt3LWZpbHRlci1pY29uXCIsIHRleHQ6IFwiXHVEODNEXHVERDBEXCIgfSk7XG4gICAgdGhpcy5maWx0ZXJJbnB1dEVsID0gZmlsdGVyQm94LmNyZWF0ZUVsKFwiaW5wdXRcIiwge1xuICAgICAgY2xzOiBcImt3LW1hdHJpeC1maWx0ZXJcIixcbiAgICAgIGF0dHI6IHtcbiAgICAgICAgdHlwZTogXCJ0ZXh0XCIsXG4gICAgICAgIHBsYWNlaG9sZGVyOiBcIlx1OEZDN1x1NkVFNFx1NUY1M1x1NTI0RFx1OTAwOVx1NEUyRFx1NTMzQVx1NTc1N1x1NzY4NFx1NjU4N1x1NEVGNlx1NTQwRFx1RkYwOGZ1enp5XHVGRjA5XHUyMDI2XCIsXG4gICAgICB9LFxuICAgIH0pO1xuICAgIHRoaXMuZmlsdGVySW5wdXRFbC52YWx1ZSA9IHRoaXMuc3RhdGUuZmlsdGVyO1xuICAgIHRoaXMuZmlsdGVySW5wdXRFbC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xuICAgICAgdGhpcy5zdGF0ZS5maWx0ZXIgPSB0aGlzLmZpbHRlcklucHV0RWwhLnZhbHVlO1xuICAgICAgdGhpcy5yZW5kZXJGaWxlTGlzdCgpO1xuICAgIH0pO1xuICAgIGlmIChmaWx0ZXJXYXNGb2N1c2VkKSB0aGlzLmZpbHRlcklucHV0RWwuZm9jdXMoKTtcblxuICAgIC8vID09PT0gXHU0RTBBXHU0RTBCXHU1MjA2XHU2ODBGID09PT1cbiAgICBjb25zdCBzcGxpdCA9IHRoaXMuYm9keUVsLmNyZWF0ZURpdih7IGNsczogXCJrdy1zcGxpdFwiIH0pO1xuICAgIHRoaXMuc3BsaXRUb3BFbCA9IHNwbGl0LmNyZWF0ZURpdih7IGNsczogXCJrdy1zcGxpdC10b3BcIiB9KTtcbiAgICB0aGlzLnNwbGl0VG9wRWwuYWRkRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCAoKSA9PiB7XG4gICAgICBpZiAodGhpcy5zcGxpdFRvcEVsKSB0aGlzLnRvcFNjcm9sbCA9IHRoaXMuc3BsaXRUb3BFbC5zY3JvbGxUb3A7XG4gICAgfSk7XG5cbiAgICAvLyBcdTdGNTFcdTY4M0MgJiBcdTRFOENcdTdFQTdcdTY3NjEgXHUyMDE0XHUyMDE0IFx1ODQzRFx1NTcyOFx1NEUwQVx1NTMzQVxuICAgIGlmICh0aGlzLnN0YXRlLnRhYiA9PT0gXCJ3aWtpXCIpIHRoaXMucmVuZGVyV2lraUdyaWQodGhpcy5zcGxpdFRvcEVsKTtcbiAgICBlbHNlIHRoaXMucmVuZGVyRGlyU2VjdGlvbih0aGlzLnNwbGl0VG9wRWwsIHRoaXMuc3RhdGUudGFiKTtcblxuICAgIC8vIFx1NjU4N1x1NEVGNlx1NTIxN1x1ODg2OFx1RkYxQVx1NEVDNVx1NTcyOFx1NjcwOVx1OTAwOVx1NEUyRFx1NjVGNlx1NUVGQVx1NEUwQlx1NTMzQSArIGRpdmlkZXJcbiAgICBpZiAodGhpcy5zdGF0ZS5zZWxlY3RlZEwxKSB7XG4gICAgICBjb25zdCBkaXZpZGVyID0gc3BsaXQuY3JlYXRlRGl2KHsgY2xzOiBcImt3LXNwbGl0LWRpdmlkZXJcIiB9KTtcbiAgICAgIGRpdmlkZXIuc2V0QXR0cihcImFyaWEtbGFiZWxcIiwgXCJcdTYyRDZcdTUyQThcdThDMDNcdTY1NzRcdTRFMEFcdTRFMEJcdTUzM0FcdTlBRDhcdTVFQTZcIik7XG4gICAgICB0aGlzLmF0dGFjaERpdmlkZXJEcmFnKHNwbGl0LCBkaXZpZGVyKTtcblxuICAgICAgdGhpcy5zcGxpdEJvdHRvbUVsID0gc3BsaXQuY3JlYXRlRGl2KHsgY2xzOiBcImt3LXNwbGl0LWJvdHRvbVwiIH0pO1xuICAgICAgdGhpcy5zcGxpdEJvdHRvbUVsLmFkZEV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIiwgKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5zcGxpdEJvdHRvbUVsKSB0aGlzLmJvdHRvbVNjcm9sbCA9IHRoaXMuc3BsaXRCb3R0b21FbC5zY3JvbGxUb3A7XG4gICAgICB9KTtcblxuICAgICAgLy8gXHU1RTk0XHU3NTI4XHU0RkREXHU1QjU4XHU3Njg0XHU0RTBBXHU1MzNBXHU5QUQ4XHU1RUE2XG4gICAgICBpZiAodGhpcy50b3BQYW5lSGVpZ2h0ICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuc3BsaXRUb3BFbC5zdHlsZS5oZWlnaHQgPSBgJHt0aGlzLnRvcFBhbmVIZWlnaHR9cHhgO1xuICAgICAgICB0aGlzLnNwbGl0VG9wRWwuc3R5bGUuZmxleCA9IFwiMCAwIGF1dG9cIjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5yZW5kZXJGaWxlTGlzdCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBcdTY1RTBcdTkwMDlcdTRFMkRcdUZGMUFcdTRFMEFcdTUzM0FcdTcyRUNcdTUzNjBcdUZGMENcdTRFMEJcdTUzM0FcdTRFMERcdTVCNThcdTU3MjhcbiAgICAgIHRoaXMuc3BsaXRCb3R0b21FbCA9IG51bGw7XG4gICAgICB0aGlzLnNwbGl0VG9wRWwuc3R5bGUuZmxleCA9IFwiMSAxIGF1dG9cIjtcbiAgICAgIHRoaXMuc3BsaXRUb3BFbC5zdHlsZS5oZWlnaHQgPSBcIlwiO1xuICAgIH1cblxuICAgIC8vIFx1NjA2Mlx1NTkwRFx1NkVEQVx1NTJBOFxuICAgIGNvbnN0IHNhdmVkVG9wID0gdGhpcy50b3BTY3JvbGw7XG4gICAgY29uc3Qgc2F2ZWRCb3R0b20gPSB0aGlzLmJvdHRvbVNjcm9sbDtcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgIGlmICh0aGlzLnNwbGl0VG9wRWwgJiYgc2F2ZWRUb3AgPiAwKSB0aGlzLnNwbGl0VG9wRWwuc2Nyb2xsVG9wID0gc2F2ZWRUb3A7XG4gICAgICBpZiAodGhpcy5zcGxpdEJvdHRvbUVsICYmIHNhdmVkQm90dG9tID4gMCkgdGhpcy5zcGxpdEJvdHRvbUVsLnNjcm9sbFRvcCA9IHNhdmVkQm90dG9tO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIGRpdmlkZXIgXHU2MkQ2XHU2MkZEXHVGRjFBXHU2NkY0XHU2NUIwXHU0RTBBXHU1MzNBXHU1MENGXHU3RDIwXHU5QUQ4XHU1RUE2XHU1RTc2IGNsYW1wICovXG4gIHByaXZhdGUgYXR0YWNoRGl2aWRlckRyYWcoc3BsaXQ6IEhUTUxFbGVtZW50LCBkaXZpZGVyOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgIGRpdmlkZXIuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCAoZSkgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgY29uc3Qgc3RhcnRZID0gZS5jbGllbnRZO1xuICAgICAgY29uc3QgcmVjdCA9IHNwbGl0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgY29uc3Qgc3RhcnRUb3BIID0gdGhpcy5zcGxpdFRvcEVsPy5vZmZzZXRIZWlnaHQgPz8gcmVjdC5oZWlnaHQgLyAyO1xuICAgICAgY29uc3QgbWluUHggPSA4MDtcbiAgICAgIGNvbnN0IG1heFB4ID0gcmVjdC5oZWlnaHQgLSA4MDtcblxuICAgICAgY29uc3Qgb25Nb3ZlID0gKGV2OiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgIGxldCBoID0gc3RhcnRUb3BIICsgKGV2LmNsaWVudFkgLSBzdGFydFkpO1xuICAgICAgICBpZiAoaCA8IG1pblB4KSBoID0gbWluUHg7XG4gICAgICAgIGlmIChoID4gbWF4UHgpIGggPSBtYXhQeDtcbiAgICAgICAgdGhpcy50b3BQYW5lSGVpZ2h0ID0gaDtcbiAgICAgICAgaWYgKHRoaXMuc3BsaXRUb3BFbCkge1xuICAgICAgICAgIHRoaXMuc3BsaXRUb3BFbC5zdHlsZS5oZWlnaHQgPSBgJHtofXB4YDtcbiAgICAgICAgICB0aGlzLnNwbGl0VG9wRWwuc3R5bGUuZmxleCA9IFwiMCAwIGF1dG9cIjtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGNvbnN0IG9uVXAgPSAoKSA9PiB7XG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgb25Nb3ZlKTtcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgb25VcCk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gXCJcIjtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS51c2VyU2VsZWN0ID0gXCJcIjtcbiAgICAgIH07XG4gICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9IFwicm93LXJlc2l6ZVwiO1xuICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS51c2VyU2VsZWN0ID0gXCJub25lXCI7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIG9uTW92ZSk7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBvblVwKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vID09PT09PT09PT09PT09PT09PT09IHdpa2kgPT09PT09PT09PT09PT09PT09PT1cbiAgcHJpdmF0ZSByZW5kZXJXaWtpR3JpZChob3N0OiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgIGNvbnN0IHJlY3MgPSBjb2xsZWN0V2lraUZpbGVzKHRoaXMuYXBwKTtcbiAgICBjb25zdCB7IGwxRG9tYWlucywgY2hpbGRyZW4sIGNlbGxzIH0gPSBhZ2dyZWdhdGVXaWtpTWF0cml4KHJlY3MpO1xuXG4gICAgY29uc3QgZ3JpZCA9IGhvc3QuY3JlYXRlRGl2KHsgY2xzOiBcImt3LXdpa2ktZ3JpZFwiIH0pO1xuICAgIGdyaWQuY3JlYXRlRGl2KHsgY2xzOiBcImt3LWdyaWQtY29ybmVyXCIgfSk7XG4gICAgZm9yIChjb25zdCB0IG9mIFdJS0lfVFlQRVMpIHtcbiAgICAgIGdyaWQuY3JlYXRlRGl2KHsgY2xzOiBcImt3LWdyaWQtY29saGVhZFwiLCB0ZXh0OiBXSUtJX1RZUEVfTEFCRUxTW3RdIH0pO1xuICAgIH1cblxuICAgIGlmIChsMURvbWFpbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICBob3N0LmNyZWF0ZURpdih7XG4gICAgICAgIGNsczogXCJrdy1lbXB0eVwiLFxuICAgICAgICB0ZXh0OiBcIndpa2kvIFx1NEUwQlx1NkNBMVx1NjcwOVx1N0IyNlx1NTQwOCB0eXBlIFx1NzY4NFx1OTg3NVx1OTc2Mlx1RkYwOHNvdXJjZS9lbnRpdHkvY29uY2VwdC9jb21wYXJpc29uXHVGRjA5XCIsXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGwxIG9mIGwxRG9tYWlucykge1xuICAgICAgY29uc3Qga2lkcyA9IGNoaWxkcmVuLmdldChsMSkgPz8gW107XG4gICAgICBjb25zdCBoYXNDaGlsZHJlbiA9IGtpZHMubGVuZ3RoID4gMDtcbiAgICAgIGNvbnN0IGV4cGFuZGVkID0gaGFzQ2hpbGRyZW4gJiYgdGhpcy5leHBhbmRlZEwxLmhhcyhsMSk7XG5cbiAgICAgIC8vIFx1NEUwMFx1N0VBN1x1ODg0Q1x1NTkzNFxuICAgICAgY29uc3QgaGVhZCA9IGdyaWQuY3JlYXRlRGl2KHtcbiAgICAgICAgY2xzOiBcImt3LWdyaWQtcm93aGVhZCBrdy1ncmlkLXJvd2hlYWQtbDFcIiArIChoYXNDaGlsZHJlbiA/IFwiIGlzLWV4cGFuZGFibGVcIiA6IFwiXCIpLFxuICAgICAgfSk7XG4gICAgICBpZiAoaGFzQ2hpbGRyZW4pIHtcbiAgICAgICAgaGVhZC5jcmVhdGVTcGFuKHsgY2xzOiBcImt3LWNhcmV0XCIsIHRleHQ6IGV4cGFuZGVkID8gXCJcdTI1QkNcIiA6IFwiXHUyNUI2XCIgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBoZWFkLmNyZWF0ZVNwYW4oeyBjbHM6IFwia3ctY2FyZXQga3ctY2FyZXQtcGxhY2Vob2xkZXJcIiwgdGV4dDogXCJcIiB9KTtcbiAgICAgIH1cbiAgICAgIGhlYWQuY3JlYXRlU3Bhbih7IGNsczogXCJrdy1sMS1uYW1lXCIsIHRleHQ6IGwxIH0pO1xuICAgICAgaWYgKGhhc0NoaWxkcmVuKSB7XG4gICAgICAgIGhlYWQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgICBpZiAoZXhwYW5kZWQpIHRoaXMuZXhwYW5kZWRMMS5kZWxldGUobDEpO1xuICAgICAgICAgIGVsc2UgdGhpcy5leHBhbmRlZEwxLmFkZChsMSk7XG4gICAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NEUwMFx1N0VBN1x1ODg0Q1x1NTM1NVx1NTE0M1x1NjgzQ1x1RkYxQVx1NjcwOVx1NUI1MFx1OTg4Nlx1NTdERlx1NzUyOFx1ODA1QVx1NTQwOCBrZXlcdUZGMENcdTU0MjZcdTUyMTlcdTc1MjhcdTdDQkVcdTc4NkUga2V5XG4gICAgICBmb3IgKGNvbnN0IHQgb2YgV0lLSV9UWVBFUykge1xuICAgICAgICBjb25zdCBjZWxsS2V5ID0gaGFzQ2hpbGRyZW4gPyBgX19MMV9ffCR7bDF9fCR7dH1gIDogYCR7bDF9fCR7dH1gO1xuICAgICAgICB0aGlzLnJlbmRlck1hdHJpeENlbGwoZ3JpZCwgY2VsbEtleSwgY2VsbHMuZ2V0KGNlbGxLZXkpKTtcbiAgICAgIH1cblxuICAgICAgLy8gXHU1QjUwXHU4ODRDXG4gICAgICBpZiAoZXhwYW5kZWQpIHtcbiAgICAgICAgZm9yIChjb25zdCBraWQgb2Yga2lkcykge1xuICAgICAgICAgIGdyaWQuY3JlYXRlRGl2KHtcbiAgICAgICAgICAgIGNsczpcbiAgICAgICAgICAgICAgXCJrdy1ncmlkLXJvd2hlYWQga3ctZ3JpZC1yb3doZWFkLWwyXCIgKyAoa2lkLmlzT3RoZXIgPyBcIiBpcy1vdGhlclwiIDogXCJcIiksXG4gICAgICAgICAgICB0ZXh0OiBraWQubGFiZWwsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgZm9yIChjb25zdCB0IG9mIFdJS0lfVFlQRVMpIHtcbiAgICAgICAgICAgIGNvbnN0IGNlbGxLZXkgPSBgJHtraWQuZnVsbFBhdGh9fCR7dH1gO1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJNYXRyaXhDZWxsKGdyaWQsIGNlbGxLZXksIGNlbGxzLmdldChjZWxsS2V5KSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJNYXRyaXhDZWxsKGdyaWQ6IEhUTUxFbGVtZW50LCBrZXk6IHN0cmluZywgY2VsbDogQ2VsbCB8IHVuZGVmaW5lZCk6IHZvaWQge1xuICAgIGNvbnN0IGlzRW1wdHkgPSAhY2VsbCB8fCBjZWxsLmZpbGVzLmxlbmd0aCA9PT0gMDtcbiAgICBjb25zdCBhY3RpdmUgPSB0aGlzLnN0YXRlLnNlbGVjdGVkTDEgPT09IGtleTtcbiAgICBjb25zdCBlbCA9IGdyaWQuY3JlYXRlRGl2KHtcbiAgICAgIGNsczpcbiAgICAgICAgXCJrdy1jZWxsXCIgK1xuICAgICAgICAoaXNFbXB0eSA/IFwiIGVtcHR5XCIgOiBcIlwiKSArXG4gICAgICAgIChhY3RpdmUgPyBcIiBhY3RpdmVcIiA6IFwiXCIpLFxuICAgIH0pO1xuICAgIGVsLmNyZWF0ZURpdih7IGNsczogXCJrdy1jZWxsLW5cIiwgdGV4dDogaXNFbXB0eSA/IFwiXHUyMDE0XCIgOiBTdHJpbmcoY2VsbCEuZmlsZXMubGVuZ3RoKSB9KTtcbiAgICBpZiAoIWlzRW1wdHkgJiYgY2VsbCkge1xuICAgICAgZWwuY3JlYXRlRGl2KHsgY2xzOiBcImt3LWNlbGwtc3ViXCIsIHRleHQ6IGBcdTY3MDBcdTY1QjAgJHtmbXREYXRlKGxhdGVzdE10aW1lKGNlbGwpKX1gIH0pO1xuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHRoaXMudG9nZ2xlTDEoa2V5KSk7XG4gICAgfVxuICB9XG5cbiAgLy8gPT09PT09PT09PT09PT09PT09PT0gcmF3IC8gb3V0cHV0ID09PT09PT09PT09PT09PT09PT09XG4gIHByaXZhdGUgcmVuZGVyRGlyU2VjdGlvbihob3N0OiBIVE1MRWxlbWVudCwgcm9vdDogXCJyYXdcIiB8IFwib3V0cHV0XCIpOiB2b2lkIHtcbiAgICBjb25zdCBjZWxscyA9IGFnZ3JlZ2F0ZURpclRyZWUodGhpcy5hcHAudmF1bHQuZ2V0RmlsZXMoKSwgcm9vdCk7XG4gICAgaWYgKGNlbGxzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgaG9zdC5jcmVhdGVEaXYoeyBjbHM6IFwia3ctZW1wdHlcIiwgdGV4dDogYCR7cm9vdH0vIFx1NEUwQlx1NkNBMVx1NjcwOVx1NjU4N1x1NEVGNmAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gXHU0RTAwXHU3RUE3XHU3RjUxXHU2ODNDXG4gICAgY29uc3QgZ3JpZCA9IGhvc3QuY3JlYXRlRGl2KHsgY2xzOiBcImt3LWRpci1ncmlkXCIgfSk7XG4gICAgbGV0IHNlbGVjdGVkQ2VsbDogQ2VsbCB8IHVuZGVmaW5lZDtcbiAgICBmb3IgKGNvbnN0IGNlbGwgb2YgY2VsbHMpIHtcbiAgICAgIGNvbnN0IGFjdGl2ZSA9IHRoaXMuc3RhdGUuc2VsZWN0ZWRMMSA9PT0gY2VsbC5rZXk7XG4gICAgICBpZiAoYWN0aXZlKSBzZWxlY3RlZENlbGwgPSBjZWxsO1xuICAgICAgY29uc3QgZWwgPSBncmlkLmNyZWF0ZURpdih7IGNsczogXCJrdy1kaXItY2VsbFwiICsgKGFjdGl2ZSA/IFwiIGFjdGl2ZVwiIDogXCJcIikgfSk7XG4gICAgICBlbC5jcmVhdGVEaXYoeyBjbHM6IFwia3ctZGlyLW5hbWVcIiwgdGV4dDogY2VsbC5sYWJlbCB9KTtcbiAgICAgIGNvbnN0IG1ldGEgPSBlbC5jcmVhdGVEaXYoeyBjbHM6IFwia3ctZGlyLW1ldGFcIiB9KTtcbiAgICAgIG1ldGEuY3JlYXRlU3Bhbih7IHRleHQ6IGAke2NlbGwuZmlsZXMubGVuZ3RofSBcdTk4NzlgIH0pO1xuICAgICAgbWV0YS5jcmVhdGVTcGFuKHsgdGV4dDogZm10RGF0ZShsYXRlc3RNdGltZShjZWxsKSkgfSk7XG4gICAgICBlbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gdGhpcy50b2dnbGVMMShjZWxsLmtleSkpO1xuICAgIH1cblxuICAgIC8vIFx1NEU4Q1x1N0VBN1x1Njc2MVx1RkYwOFx1NkI2M1x1NEUwQlx1NjVCOVx1RkYxQlx1NTQwQ1x1NEUwMFx1NjVGNlx1OTVGNFx1NjcwMFx1NTkxQVx1NEUwMFx1Njc2MVx1RkYwOVxuICAgIGlmIChzZWxlY3RlZENlbGw/LnN1YmRpcnMgJiYgc2VsZWN0ZWRDZWxsLnN1YmRpcnMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3Qgc3RyaXAgPSBob3N0LmNyZWF0ZURpdih7IGNsczogXCJrdy1zdWJkaXItc3RyaXBcIiB9KTtcbiAgICAgIHN0cmlwLmNyZWF0ZURpdih7XG4gICAgICAgIGNsczogXCJrdy1zdWJkaXItbGFiZWxcIixcbiAgICAgICAgdGV4dDogYFx1MjUxNCAke3NlbGVjdGVkQ2VsbC5sYWJlbH0gXHU3Njg0XHU1QjUwXHU3NkVFXHU1RjU1YCxcbiAgICAgIH0pO1xuICAgICAgY29uc3Qgc3RyaXBCb2R5ID0gc3RyaXAuY3JlYXRlRGl2KHsgY2xzOiBcImt3LXN1YmRpci1ib2R5XCIgfSk7XG4gICAgICBmb3IgKGNvbnN0IHN1YiBvZiBzZWxlY3RlZENlbGwuc3ViZGlycykge1xuICAgICAgICB0aGlzLnJlbmRlclN1YmRpckNlbGwoc3RyaXBCb2R5LCBzdWIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyU3ViZGlyQ2VsbChob3N0OiBIVE1MRWxlbWVudCwgc3ViOiBTdWJkaXJDZWxsKTogdm9pZCB7XG4gICAgY29uc3QgYWN0aXZlID0gdGhpcy5zdGF0ZS5zZWxlY3RlZEwyID09PSBzdWIua2V5O1xuICAgIGNvbnN0IGVsID0gaG9zdC5jcmVhdGVEaXYoeyBjbHM6IFwia3ctc3ViZGlyLWNlbGxcIiArIChhY3RpdmUgPyBcIiBhY3RpdmVcIiA6IFwiXCIpIH0pO1xuICAgIGVsLmNyZWF0ZURpdih7IGNsczogXCJrdy1zdWJkaXItbmFtZVwiLCB0ZXh0OiBzdWIubGFiZWwgfSk7XG4gICAgY29uc3QgbWV0YSA9IGVsLmNyZWF0ZURpdih7IGNsczogXCJrdy1zdWJkaXItbWV0YVwiIH0pO1xuICAgIG1ldGEuY3JlYXRlU3Bhbih7IHRleHQ6IGAke3N1Yi5maWxlcy5sZW5ndGh9YCB9KTtcbiAgICBtZXRhLmNyZWF0ZVNwYW4oeyB0ZXh0OiBmbXREYXRlKGxhdGVzdE10aW1lT2Yoc3ViLmZpbGVzKSkgfSk7XG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlKSA9PiB7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgdGhpcy50b2dnbGVMMihzdWIua2V5KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vID09PT09PT09PT09PT09PT09PT09IFx1OTAwOVx1NEUyRFx1NjAwMVx1NTIwN1x1NjM2MiA9PT09PT09PT09PT09PT09PT09PVxuICBwcml2YXRlIHRvZ2dsZUwxKGtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuc3RhdGUuc2VsZWN0ZWRMMSA9PT0ga2V5KSB7XG4gICAgICAvLyBcdTUxOERcdTZCMjFcdTcwQjlcdTUxRkIgXHUyMTkyIFx1NjUzNlx1OEQ3N1x1RkYwOFx1NTQyQlx1NEU4Q1x1N0VBN1x1Njc2MVx1RkYwOVxuICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZEwxID0gbnVsbDtcbiAgICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWRMMiA9IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFx1NTIwN1x1NTIzMFx1NjVCMFx1NEUwMFx1N0VBNyBcdTIxOTIgXHU2NkZGXHU2MzYyXHVGRjBDXHU2RTA1XHU3QTdBXHU0RThDXHU3RUE3XG4gICAgICB0aGlzLnN0YXRlLnNlbGVjdGVkTDEgPSBrZXk7XG4gICAgICB0aGlzLnN0YXRlLnNlbGVjdGVkTDIgPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgcHJpdmF0ZSB0b2dnbGVMMihrZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWRMMiA9IHRoaXMuc3RhdGUuc2VsZWN0ZWRMMiA9PT0ga2V5ID8gbnVsbCA6IGtleTtcbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgLy8gPT09PT09PT09PT09PT09PT09PT0gcGluIFx1ODg0QyA9PT09PT09PT09PT09PT09PT09PVxuXG4gIHByaXZhdGUgcmVuZGVyUGluUm93KCk6IHZvaWQge1xuICAgIGNvbnN0IHBpbm5lZCA9IHRoaXMucGx1Z2luLnNldHRpbmdzLnBpbm5lZEZpbGVzO1xuICAgIGlmIChwaW5uZWQubGVuZ3RoID09PSAwKSByZXR1cm47XG5cbiAgICBjb25zdCByb3cgPSB0aGlzLmNvbnRhaW5lci5jcmVhdGVEaXYoeyBjbHM6IFwia3ctcGluLXJvd1wiIH0pO1xuICAgIHJvdy5jcmVhdGVTcGFuKHsgY2xzOiBcImt3LXBpbi1sYWJlbFwiLCB0ZXh0OiBcIlx1RDgzRFx1RENDQ1wiIH0pO1xuICAgIGNvbnN0IGxpc3QgPSByb3cuY3JlYXRlRGl2KHsgY2xzOiBcImt3LXBpbi1saXN0XCIgfSk7XG5cbiAgICBmb3IgKGNvbnN0IHBhdGggb2YgcGlubmVkKSB7XG4gICAgICBjb25zdCBhYnMgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgocGF0aCk7XG4gICAgICBjb25zdCBzdGFsZSA9ICEoYWJzIGluc3RhbmNlb2YgVEZpbGUpO1xuICAgICAgY29uc3QgY2hpcCA9IGxpc3QuY3JlYXRlU3Bhbih7XG4gICAgICAgIGNsczogXCJrdy1jaGlwIGt3LXBpbi1jaGlwXCIgKyAoc3RhbGUgPyBcIiBpcy1zdGFsZVwiIDogXCJcIiksXG4gICAgICAgIHRleHQ6IGRpc3BsYXlOYW1lKHBhdGgpLFxuICAgICAgfSk7XG4gICAgICBjaGlwLnNldEF0dHIoXCJ0aXRsZVwiLCBzdGFsZSA/IGBcdTVERjJcdTU5MzFcdTY1NDhcdUZGMUEke3BhdGh9YCA6IHBhdGgpO1xuICAgICAgY2hpcC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICBpZiAoc3RhbGUpIHtcbiAgICAgICAgICBuZXcgTm90aWNlKGBcdTY1ODdcdTRFRjZcdTVERjJcdTU5MzFcdTY1NDhcdUZGMUEke3BhdGh9YCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhYnMgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgICAgIHRoaXMuYXBwLndvcmtzcGFjZS5nZXRMZWFmKGZhbHNlKS5vcGVuRmlsZShhYnMpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGNoaXAuYWRkRXZlbnRMaXN0ZW5lcihcImNvbnRleHRtZW51XCIsIChlKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgY29uc3QgbWVudSA9IG5ldyBNZW51KCk7XG4gICAgICAgIG1lbnUuYWRkSXRlbSgoaXQpID0+XG4gICAgICAgICAgaXRcbiAgICAgICAgICAgIC5zZXRUaXRsZShcIlx1NTNENlx1NkQ4OCBwaW5cIilcbiAgICAgICAgICAgIC5zZXRJY29uKFwicGluLW9mZlwiKVxuICAgICAgICAgICAgLm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICBhd2FpdCB0aGlzLnRvZ2dsZVBpbihwYXRoKTtcbiAgICAgICAgICAgIH0pLFxuICAgICAgICApO1xuICAgICAgICBtZW51LnNob3dBdE1vdXNlRXZlbnQoZSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHRvZ2dsZVBpbihwYXRoOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBhcnIgPSB0aGlzLnBsdWdpbi5zZXR0aW5ncy5waW5uZWRGaWxlcztcbiAgICBjb25zdCBpZHggPSBhcnIuaW5kZXhPZihwYXRoKTtcbiAgICBpZiAoaWR4ID49IDApIGFyci5zcGxpY2UoaWR4LCAxKTtcbiAgICBlbHNlIGFyci5wdXNoKHBhdGgpO1xuICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgIHRoaXMucmVuZGVyKCk7XG4gIH1cblxuICAvLyA9PT09PT09PT09PT09PT09PT09PSBcdTY1ODdcdTRFRjZcdTUyMTdcdTg4NjggPT09PT09PT09PT09PT09PT09PT1cbiAgcHJpdmF0ZSBjdXJyZW50Q2VsbEZpbGVzKCk6IEZpbGVSZWNbXSB7XG4gICAgY29uc3QgbDEgPSB0aGlzLnN0YXRlLnNlbGVjdGVkTDE7XG4gICAgaWYgKCFsMSkgcmV0dXJuIFtdO1xuXG4gICAgaWYgKHRoaXMuc3RhdGUudGFiID09PSBcIndpa2lcIikge1xuICAgICAgY29uc3QgeyBjZWxscyB9ID0gYWdncmVnYXRlV2lraU1hdHJpeChjb2xsZWN0V2lraUZpbGVzKHRoaXMuYXBwKSk7XG4gICAgICBjb25zdCBjZWxsID0gY2VsbHMuZ2V0KGwxKTtcbiAgICAgIHJldHVybiBjZWxsID8gc29ydE10aW1lRGVzYyhjZWxsLmZpbGVzKSA6IFtdO1xuICAgIH1cblxuICAgIGNvbnN0IGNlbGxzID0gYWdncmVnYXRlRGlyVHJlZSh0aGlzLmFwcC52YXVsdC5nZXRGaWxlcygpLCB0aGlzLnN0YXRlLnRhYik7XG4gICAgY29uc3QgY2VsbCA9IGNlbGxzLmZpbmQoKGMpID0+IGMua2V5ID09PSBsMSk7XG4gICAgaWYgKCFjZWxsKSByZXR1cm4gW107XG5cbiAgICBpZiAodGhpcy5zdGF0ZS5zZWxlY3RlZEwyKSB7XG4gICAgICBjb25zdCBzdWIgPSBjZWxsLnN1YmRpcnM/LmZpbmQoKHMpID0+IHMua2V5ID09PSB0aGlzLnN0YXRlLnNlbGVjdGVkTDIpO1xuICAgICAgLy8gXHU4MkU1XHU0RThDXHU3RUE3XHU1NzU3XHU1REYyXHU2RDg4XHU1OTMxXHVGRjA4XHU1OTgyXHU1RTk1XHU1QzQyXHU2NTg3XHU0RUY2XHU4OEFCXHU1MjIwXHU1QjhDXHVGRjA5XHVGRjBDXHU1NkRFXHU5MDAwXHU1MjMwXHU0RTAwXHU3RUE3XG4gICAgICBpZiAoc3ViKSByZXR1cm4gc29ydE10aW1lRGVzYyhzdWIuZmlsZXMpO1xuICAgIH1cbiAgICByZXR1cm4gc29ydE10aW1lRGVzYyhjZWxsLmZpbGVzKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyRmlsZUxpc3QoKTogdm9pZCB7XG4gICAgdGhpcy5saXN0RWw/LnJlbW92ZSgpO1xuICAgIHRoaXMubGlzdEVsID0gbnVsbDtcbiAgICBjb25zdCBob3N0ID0gdGhpcy5zcGxpdEJvdHRvbUVsO1xuICAgIGlmICghaG9zdCkgcmV0dXJuO1xuICAgIGlmICghdGhpcy5zdGF0ZS5zZWxlY3RlZEwxKSByZXR1cm47XG5cbiAgICBjb25zdCBmaWxlcyA9IHRoaXMuY3VycmVudENlbGxGaWxlcygpO1xuICAgIGNvbnN0IGZpbHRlcmVkID0gdGhpcy5hcHBseUZpbHRlcihmaWxlcyk7XG4gICAgY29uc3QgbGlzdCA9IGhvc3QuY3JlYXRlRGl2KHsgY2xzOiBcImt3LWZpbGUtbGlzdFwiIH0pO1xuICAgIHRoaXMubGlzdEVsID0gbGlzdDtcblxuICAgIGNvbnN0IHRpdGxlID0gbGlzdC5jcmVhdGVEaXYoeyBjbHM6IFwia3ctZmlsZS1saXN0LXRpdGxlXCIgfSk7XG4gICAgdGl0bGUuY3JlYXRlU3Bhbih7XG4gICAgICB0ZXh0OiBgJHtmaWx0ZXJlZC5sZW5ndGh9JHtmaWx0ZXJlZC5sZW5ndGggIT09IGZpbGVzLmxlbmd0aCA/IGAgLyAke2ZpbGVzLmxlbmd0aH1gIDogXCJcIn0gXHU0RTJBXHU2NTg3XHU0RUY2JHtcbiAgICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZEwyID8gXCJcdUZGMDhcdTVCNTBcdTc2RUVcdTVGNTVcdUZGMDlcIiA6IFwiXCJcbiAgICAgIH1gLFxuICAgIH0pO1xuICAgIGNvbnN0IGNsb3NlQnRuID0gdGl0bGUuY3JlYXRlU3Bhbih7IGNsczogXCJrdy1maWxlLWxpc3QtY2xvc2VcIiwgdGV4dDogXCJcdTAwRDdcIiB9KTtcbiAgICBjbG9zZUJ0bi5zZXRBdHRyKFwiYXJpYS1sYWJlbFwiLCBcIlx1NTE3M1x1OTVFRFx1NTIxN1x1ODg2OFwiKTtcbiAgICBjbG9zZUJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZEwxID0gbnVsbDtcbiAgICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWRMMiA9IG51bGw7XG4gICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH0pO1xuXG4gICAgaWYgKGZpbHRlcmVkLmxlbmd0aCA9PT0gMCkge1xuICAgICAgbGlzdC5jcmVhdGVEaXYoeyBjbHM6IFwia3ctZW1wdHlcIiwgdGV4dDogXCJcdTZDQTFcdTY3MDlcdTUzMzlcdTkxNERcdTk4NzlcIiB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGYgb2YgZmlsdGVyZWQuc2xpY2UoMCwgRklMRV9MSVNUX0xJTUlUKSkge1xuICAgICAgY29uc3QgaXRlbSA9IGxpc3QuY3JlYXRlRGl2KHsgY2xzOiBcImt3LWZpbGUtaXRlbVwiIH0pO1xuICAgICAgaXRlbS5jcmVhdGVTcGFuKHsgY2xzOiBcImt3LWZpbGUtbmFtZVwiLCB0ZXh0OiBmLm5hbWUgfSk7XG4gICAgICBpdGVtLmNyZWF0ZVNwYW4oeyBjbHM6IFwia3ctZmlsZS1tdGltZVwiLCB0ZXh0OiBmbXREYXRlKGYubXRpbWUpIH0pO1xuICAgICAgY29uc3QgaXNQaW5uZWQgPSB0aGlzLnBsdWdpbi5zZXR0aW5ncy5waW5uZWRGaWxlcy5pbmNsdWRlcyhmLnBhdGgpO1xuICAgICAgY29uc3QgcGluQnRuID0gaXRlbS5jcmVhdGVTcGFuKHtcbiAgICAgICAgY2xzOiBcImt3LXBpbi1idG5cIiArIChpc1Bpbm5lZCA/IFwiIGlzLXBpbm5lZFwiIDogXCJcIiksXG4gICAgICAgIHRleHQ6IFwiXHVEODNEXHVEQ0NDXCIsXG4gICAgICB9KTtcbiAgICAgIHBpbkJ0bi5zZXRBdHRyKFwiYXJpYS1sYWJlbFwiLCBpc1Bpbm5lZCA/IFwiXHU1M0Q2XHU2RDg4IHBpblwiIDogXCJwaW4gXHU1MjMwXHU3N0U5XHU5NjM1XHU5ODc2XHU5MEU4XCIpO1xuICAgICAgcGluQnRuLnNldEF0dHIoXCJ0aXRsZVwiLCBpc1Bpbm5lZCA/IFwiXHU1M0Q2XHU2RDg4IHBpblwiIDogXCJwaW4gXHU1MjMwXHU3N0U5XHU5NjM1XHU5ODc2XHU5MEU4XCIpO1xuICAgICAgcGluQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBhc3luYyAoZSkgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBhd2FpdCB0aGlzLnRvZ2dsZVBpbihmLnBhdGgpO1xuICAgICAgfSk7XG4gICAgICBpdGVtLnNldEF0dHIoXCJ0aXRsZVwiLCBmLnBhdGgpO1xuICAgICAgaXRlbS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0TGVhZih0cnVlKS5vcGVuRmlsZShmLmZpbGUpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKGZpbHRlcmVkLmxlbmd0aCA+IEZJTEVfTElTVF9MSU1JVCkge1xuICAgICAgbGlzdC5jcmVhdGVEaXYoe1xuICAgICAgICBjbHM6IFwia3ctZW1wdHlcIixcbiAgICAgICAgdGV4dDogYFx1MjJFRiBcdThGRDhcdTY3MDkgJHtmaWx0ZXJlZC5sZW5ndGggLSBGSUxFX0xJU1RfTElNSVR9IFx1NEUyQVx1RkYwQ1x1NzUyOFx1OEZDN1x1NkVFNFx1Njg0Nlx1N0YyOVx1NUMwRlx1ODMwM1x1NTZGNGAsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFwcGx5RmlsdGVyKGZpbGVzOiBGaWxlUmVjW10pOiBGaWxlUmVjW10ge1xuICAgIGNvbnN0IHEgPSB0aGlzLnN0YXRlLmZpbHRlci50cmltKCk7XG4gICAgaWYgKCFxKSByZXR1cm4gZmlsZXM7XG4gICAgY29uc3Qgc2VhcmNoID0gcHJlcGFyZUZ1enp5U2VhcmNoKHEpO1xuICAgIGNvbnN0IHNjb3JlZDogeyByZWM6IEZpbGVSZWM7IHNjb3JlOiBudW1iZXIgfVtdID0gW107XG4gICAgZm9yIChjb25zdCBmIG9mIGZpbGVzKSB7XG4gICAgICBjb25zdCBtID0gc2VhcmNoKGYucGF0aCk7XG4gICAgICBpZiAobSkgc2NvcmVkLnB1c2goeyByZWM6IGYsIHNjb3JlOiBtLnNjb3JlIH0pO1xuICAgIH1cbiAgICBzY29yZWQuc29ydCgoYSwgYikgPT4gYi5zY29yZSAtIGEuc2NvcmUpO1xuICAgIHJldHVybiBzY29yZWQubWFwKChzKSA9PiBzLnJlYyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc29ydE10aW1lRGVzYyhmaWxlczogRmlsZVJlY1tdKTogRmlsZVJlY1tdIHtcbiAgcmV0dXJuIFsuLi5maWxlc10uc29ydCgoYSwgYikgPT4gYi5tdGltZSAtIGEubXRpbWUpO1xufVxuXG5mdW5jdGlvbiBmbXREYXRlKG1zOiBudW1iZXIpOiBzdHJpbmcge1xuICBpZiAoIW1zKSByZXR1cm4gXCJcdTIwMTRcIjtcbiAgY29uc3QgZCA9IG5ldyBEYXRlKG1zKTtcbiAgY29uc3QgcCA9IChuOiBudW1iZXIpID0+IG4udG9TdHJpbmcoKS5wYWRTdGFydCgyLCBcIjBcIik7XG4gIHJldHVybiBgJHtkLmdldEZ1bGxZZWFyKCkudG9TdHJpbmcoKS5zbGljZSgyKX0tJHtwKGQuZ2V0TW9udGgoKSArIDEpfS0ke3AoZC5nZXREYXRlKCkpfWA7XG59XG5cbmZ1bmN0aW9uIGRpc3BsYXlOYW1lKHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IGJhc2UgPSBwYXRoLnNwbGl0KFwiL1wiKS5wb3AoKSA/PyBwYXRoO1xuICByZXR1cm4gYmFzZS5yZXBsYWNlKC9cXC5tZCQvaSwgXCJcIik7XG59XG4iLCAiaW1wb3J0IHsgQXBwLCBDYWNoZWRNZXRhZGF0YSwgVEZpbGUgfSBmcm9tIFwib2JzaWRpYW5cIjtcblxuZXhwb3J0IGludGVyZmFjZSBGaWxlUmVjIHtcbiAgcGF0aDogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG4gIG10aW1lOiBudW1iZXI7XG4gIGZpbGU6IFRGaWxlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFdpa2lGaWxlUmVjIGV4dGVuZHMgRmlsZVJlYyB7XG4gIHR5cGU6IHN0cmluZzsgLy8gXHU1REYyIGxvd2VyY2FzZVxuICBkb21haW5zOiBzdHJpbmdbXTsgLy8gXHU4MUYzXHU1QzExXHU0RTAwXHU0RTJBXHU1MTQzXHU3RDIwXHVGRjFCXHU2NUUwIGRvbWFpbiBcdTIxOTIgW1wiXHU2NzJBXHU2ODA3XHU2Q0U4XCJdXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2VsbCB7XG4gIGtleTogc3RyaW5nO1xuICBsYWJlbDogc3RyaW5nO1xuICBmaWxlczogRmlsZVJlY1tdO1xuICAvKiogcmF3L291dHB1dCBcdTc2ODRcdTRFOENcdTdFQTdcdTVCNTBcdTc2RUVcdTVGNTVcdUZGMDh3aWtpIFx1NEUwRFx1NEY3Rlx1NzUyOFx1RkYwOVx1RkYwQ1x1NURGMlx1NjMwOSBsYWJlbCBcdTYzOTJcdTVFOEYgKi9cbiAgc3ViZGlycz86IFN1YmRpckNlbGxbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTdWJkaXJDZWxsIHtcbiAgLyoqIGAke2wxfS8ke2wyfWAgXHU1RjYyXHU1RjBGXHVGRjBDXHU1MTY4XHU1QzQwXHU1NTJGXHU0RTAwICovXG4gIGtleTogc3RyaW5nO1xuICBsYWJlbDogc3RyaW5nO1xuICBmaWxlczogRmlsZVJlY1tdO1xufVxuXG5leHBvcnQgY29uc3QgV0lLSV9UWVBFUyA9IFtcInNvdXJjZVwiLCBcImVudGl0eVwiLCBcImNvbmNlcHRcIiwgXCJjb21wYXJpc29uXCJdIGFzIGNvbnN0O1xuZXhwb3J0IHR5cGUgV2lraVR5cGUgPSAodHlwZW9mIFdJS0lfVFlQRVMpW251bWJlcl07XG5leHBvcnQgY29uc3QgV0lLSV9UWVBFX0xBQkVMUzogUmVjb3JkPFdpa2lUeXBlLCBzdHJpbmc+ID0ge1xuICBzb3VyY2U6IFwiU291cmNlXCIsXG4gIGVudGl0eTogXCJFbnRpdHlcIixcbiAgY29uY2VwdDogXCJDb25jZXB0XCIsXG4gIGNvbXBhcmlzb246IFwiQ29tcGFyaXNvblwiLFxufTtcblxuLyoqIFx1NEVDRSBPYnNpZGlhbiBBUEkgXHU2NTM2XHU5NkM2IHdpa2kgXHU2NTg3XHU0RUY2XHU4QkIwXHU1RjU1XHVGRjA4XHU1NDJCIGZyb250bWF0dGVyIFx1OEZDN1x1NkVFNFx1RkYwOSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbGxlY3RXaWtpRmlsZXMoYXBwOiBBcHApOiBXaWtpRmlsZVJlY1tdIHtcbiAgY29uc3QgcmVjczogV2lraUZpbGVSZWNbXSA9IFtdO1xuICBmb3IgKGNvbnN0IGYgb2YgYXBwLnZhdWx0LmdldE1hcmtkb3duRmlsZXMoKSkge1xuICAgIGlmICghZi5wYXRoLnN0YXJ0c1dpdGgoXCJ3aWtpL1wiKSkgY29udGludWU7XG4gICAgY29uc3QgY2FjaGU6IENhY2hlZE1ldGFkYXRhIHwgbnVsbCA9IGFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShmKTtcbiAgICBjb25zdCBmbSA9IGNhY2hlPy5mcm9udG1hdHRlciBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVuZGVmaW5lZDtcbiAgICBpZiAoIWZtKSBjb250aW51ZTtcbiAgICBjb25zdCB0ID0gU3RyaW5nKGZtLnR5cGUgPz8gXCJcIikudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAoIShXSUtJX1RZUEVTIGFzIHJlYWRvbmx5IHN0cmluZ1tdKS5pbmNsdWRlcyh0KSkgY29udGludWU7XG5cbiAgICBsZXQgZG9tYWluczogc3RyaW5nW107XG4gICAgY29uc3QgcmF3RG9tYWluID0gZm0uZG9tYWluO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHJhd0RvbWFpbikpIHtcbiAgICAgIGRvbWFpbnMgPSByYXdEb21haW4ubWFwKCh4KSA9PiBTdHJpbmcoeCkpLmZpbHRlcigocykgPT4gcy5sZW5ndGggPiAwKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiByYXdEb21haW4gPT09IFwic3RyaW5nXCIgJiYgcmF3RG9tYWluLmxlbmd0aCA+IDApIHtcbiAgICAgIGRvbWFpbnMgPSBbcmF3RG9tYWluXTtcbiAgICB9IGVsc2Uge1xuICAgICAgZG9tYWlucyA9IFtdO1xuICAgIH1cbiAgICBpZiAoZG9tYWlucy5sZW5ndGggPT09IDApIGRvbWFpbnMgPSBbXCJcdTY3MkFcdTY4MDdcdTZDRThcIl07XG5cbiAgICByZWNzLnB1c2goe1xuICAgICAgcGF0aDogZi5wYXRoLFxuICAgICAgbmFtZTogZi5uYW1lLFxuICAgICAgbXRpbWU6IGYuc3RhdC5tdGltZSxcbiAgICAgIGZpbGU6IGYsXG4gICAgICB0eXBlOiB0LFxuICAgICAgZG9tYWlucyxcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gcmVjcztcbn1cblxuLyoqIHdpa2kgXHU3N0U5XHU5NjM1XHU4MDVBXHU1NDA4XHU2NTcwXHU2MzZFICovXG5leHBvcnQgaW50ZXJmYWNlIFdpa2lNYXRyaXhEYXRhIHtcbiAgLyoqIFx1NEUwMFx1N0VBN1x1OTg4Nlx1NTdERlx1NTIxN1x1ODg2OFx1RkYwOFx1NjcyQVx1NjgwN1x1NkNFOFx1N0Y2RVx1NUU5NVx1RkYwOSAqL1xuICBsMURvbWFpbnM6IHN0cmluZ1tdO1xuICAvKipcbiAgICogXHU2QkNGXHU0RTJBXHU0RTAwXHU3RUE3XHU5ODg2XHU1N0RGXHU0RTBCXHU3Njg0XHU1QjUwXHU5ODg2XHU1N0RGXHU4ODRDXHVGRjA4XHU1QzU1XHU1RjAwXHU2NUY2XHU2NjNFXHU3OTNBXHVGRjA5XHVGRjFBXG4gICAqIC0gXHU4MkU1IEwxIFx1NEUwQlx1NjcwOVx1OTg3NVx1OTc2MiBkb21haW4gXHU1RTI2IGAvYFx1RkYwOFx1NTk4MiBgQUkvTG9vcC1FbmdpbmVlcmluZ2BcdUZGMDlcdTIxOTIgXHU3NTFGXHU2MjEwXHU1QkY5XHU1RTk0XHU1QjUwXHU4ODRDXG4gICAqIC0gXHU4MkU1IEwxIFx1NEUwQlx1NTQwQ1x1NjVGNlx1NUI1OFx1NTcyOFx1N0NCRVx1Nzg2RVx1NTMzOVx1OTE0RFx1RkYwOGRvbWFpbiBcdTVDMzFcdTY2MkYgYEFJYFx1RkYwOVx1MjE5MiBcdTY3MkJcdTVDM0VcdThGRkRcdTUyQTBcdTMwMENcdTUxNzZcdTRFRDZcdTMwMERcdTVCNTBcdTg4NENcbiAgICogLSBcdTgyRTUgTDEgXHU0RTBCKipcdTUzRUFcdTY3MDkqKlx1N0NCRVx1Nzg2RVx1NTMzOVx1OTE0RFx1RkYwOFx1NjVFMFx1NUI1MFx1OTg4Nlx1NTdERlx1RkYwOVx1MjE5MiBcdTdBN0FcdTY1NzBcdTdFQzRcdUZGMENcdTRFMDBcdTdFQTdcdTg4NENcdTRFMERcdTUzRUZcdTVDNTVcdTVGMDBcbiAgICovXG4gIGNoaWxkcmVuOiBNYXA8c3RyaW5nLCBEb21haW5DaGlsZFtdPjtcbiAgLyoqXG4gICAqIFx1NTM1NVx1NTE0M1x1NjgzQ1x1RkYxQVxuICAgKiAtIFx1NTE3N1x1NEY1MyBkb21haW5cdUZGMUEga2V5ID0gYCR7ZnVsbFBhdGh9fCR7dHlwZX1gXG4gICAqIC0gTDEgXHU4MDVBXHU1NDA4XHVGRjA4XHU0RUM1XHU1RjUzXHU4QkU1IEwxIFx1NjcwOVx1NUI1MFx1OTg4Nlx1NTdERlx1NjVGNlx1NjI0RFx1NzUxRlx1NjIxMFx1RkYwOVx1RkYxQWtleSA9IGBfX0wxX198JHtsMX18JHt0eXBlfWBcbiAgICovXG4gIGNlbGxzOiBNYXA8c3RyaW5nLCBDZWxsPjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEb21haW5DaGlsZCB7XG4gIC8qKiBcdTVCNTBcdTg4NENcdTY2M0VcdTc5M0FcdTU0MERcdUZGMDhcdTRFMERcdTU0MkIgTDEgXHU1MjREXHU3RjAwXHVGRjA5ICovXG4gIGxhYmVsOiBzdHJpbmc7XG4gIC8qKiBcdTc1MjhcdTRFOEVcdTY3RTUgY2VsbHMgXHU3Njg0XHU1QjhDXHU2NTc0IGRvbWFpbiBcdThERUZcdTVGODRcdUZGMUJcdTMwMENcdTUxNzZcdTRFRDZcdTMwMERcdTg4NENcdTc1MjggTDEgXHU4MUVBXHU4RUFCICovXG4gIGZ1bGxQYXRoOiBzdHJpbmc7XG4gIGlzT3RoZXI6IGJvb2xlYW47XG59XG5cbi8qKiBcdTRFQ0Ugd2lraSBcdThCQjBcdTVGNTVcdTgwNUFcdTU0MDhcdTYyMTBcdTUyMDZcdTdFQTdcdTc3RTlcdTk2MzUgKi9cbmV4cG9ydCBmdW5jdGlvbiBhZ2dyZWdhdGVXaWtpTWF0cml4KHJlY3M6IFdpa2lGaWxlUmVjW10pOiBXaWtpTWF0cml4RGF0YSB7XG4gIGNvbnN0IGNlbGxzID0gbmV3IE1hcDxzdHJpbmcsIENlbGw+KCk7XG4gIGNvbnN0IGwxU2V0ID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIGNvbnN0IGNoaWxkTWFwID0gbmV3IE1hcDxzdHJpbmcsIE1hcDxzdHJpbmcsIHN0cmluZz4+KCk7IC8vIEwxIFx1MjE5MiAobGVhZkxhYmVsIFx1MjE5MiBmdWxsUGF0aClcbiAgY29uc3QgaGFzRXhhY3RMMSA9IG5ldyBTZXQ8c3RyaW5nPigpOyAvLyBMMSBcdTVCNThcdTU3MjhcdTdDQkVcdTc4NkVcdTUzMzlcdTkxNERcblxuICBjb25zdCBwdXNoQ2VsbCA9IChrZXk6IHN0cmluZywgcmVjOiBXaWtpRmlsZVJlYykgPT4ge1xuICAgIGxldCBjID0gY2VsbHMuZ2V0KGtleSk7XG4gICAgaWYgKCFjKSB7XG4gICAgICBjID0geyBrZXksIGxhYmVsOiBrZXksIGZpbGVzOiBbXSB9O1xuICAgICAgY2VsbHMuc2V0KGtleSwgYyk7XG4gICAgfVxuICAgIGMuZmlsZXMucHVzaCh7IHBhdGg6IHJlYy5wYXRoLCBuYW1lOiByZWMubmFtZSwgbXRpbWU6IHJlYy5tdGltZSwgZmlsZTogcmVjLmZpbGUgfSk7XG4gIH07XG5cbiAgZm9yIChjb25zdCByIG9mIHJlY3MpIHtcbiAgICBmb3IgKGNvbnN0IGQgb2Ygci5kb21haW5zKSB7XG4gICAgICBjb25zdCBwYXJ0cyA9IGQuc3BsaXQoXCIvXCIpO1xuICAgICAgY29uc3QgbDEgPSBwYXJ0c1swXTtcbiAgICAgIGwxU2V0LmFkZChsMSk7XG5cbiAgICAgIHB1c2hDZWxsKGAke2R9fCR7ci50eXBlfWAsIHIpO1xuXG4gICAgICBpZiAocGFydHMubGVuZ3RoID49IDIpIHtcbiAgICAgICAgY29uc3QgbGVhZkxhYmVsID0gcGFydHMuc2xpY2UoMSkuam9pbihcIi9cIik7IC8vIFx1NEZERFx1NzU1OSAzKyBcdTdFQTdcdTRGNUNcdTRFM0FcdTVCNTBcdTg4NENcdTY4MDdcdTdCN0VcbiAgICAgICAgaWYgKCFjaGlsZE1hcC5oYXMobDEpKSBjaGlsZE1hcC5zZXQobDEsIG5ldyBNYXAoKSk7XG4gICAgICAgIGNoaWxkTWFwLmdldChsMSkhLnNldChsZWFmTGFiZWwsIGQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaGFzRXhhY3RMMS5hZGQobDEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGNoaWxkcmVuID0gbmV3IE1hcDxzdHJpbmcsIERvbWFpbkNoaWxkW10+KCk7XG4gIGZvciAoY29uc3QgbDEgb2YgbDFTZXQpIHtcbiAgICBjb25zdCBsaXN0OiBEb21haW5DaGlsZFtdID0gW107XG4gICAgY29uc3QgbGVhdmVzID0gY2hpbGRNYXAuZ2V0KGwxKTtcbiAgICBjb25zdCBoYXNDaGlsZHJlbiA9ICEhbGVhdmVzICYmIGxlYXZlcy5zaXplID4gMDtcblxuICAgIGlmIChoYXNDaGlsZHJlbikge1xuICAgICAgY29uc3Qgc29ydGVkID0gWy4uLmxlYXZlcy5lbnRyaWVzKCldLnNvcnQoKGEsIGIpID0+XG4gICAgICAgIGFbMF0gPCBiWzBdID8gLTEgOiBhWzBdID4gYlswXSA/IDEgOiAwLFxuICAgICAgKTtcbiAgICAgIGZvciAoY29uc3QgW2xhYmVsLCBmdWxsUGF0aF0gb2Ygc29ydGVkKSB7XG4gICAgICAgIGxpc3QucHVzaCh7IGxhYmVsLCBmdWxsUGF0aCwgaXNPdGhlcjogZmFsc2UgfSk7XG4gICAgICB9XG4gICAgICBpZiAoaGFzRXhhY3RMMS5oYXMobDEpKSB7XG4gICAgICAgIGxpc3QucHVzaCh7IGxhYmVsOiBcIlx1NTE3Nlx1NEVENlwiLCBmdWxsUGF0aDogbDEsIGlzT3RoZXI6IHRydWUgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NzUxRlx1NjIxMCBMMSBcdTgwNUFcdTU0MDggY2VsbHNcdUZGMDhcdTU0MkJcdTVCNTBcdTk4ODZcdTU3REYgKyBcdTMwMENcdTUxNzZcdTRFRDZcdTMwMERcdUZGMDlcbiAgICAgIGZvciAoY29uc3QgdCBvZiBXSUtJX1RZUEVTKSB7XG4gICAgICAgIGNvbnN0IGZpbGVzOiBGaWxlUmVjW10gPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBraWQgb2YgbGlzdCkge1xuICAgICAgICAgIGNvbnN0IGMgPSBjZWxscy5nZXQoYCR7a2lkLmZ1bGxQYXRofXwke3R9YCk7XG4gICAgICAgICAgaWYgKGMpIGZpbGVzLnB1c2goLi4uYy5maWxlcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBjb25zdCBrZXkgPSBgX19MMV9ffCR7bDF9fCR7dH1gO1xuICAgICAgICAgIGNlbGxzLnNldChrZXksIHsga2V5LCBsYWJlbDoga2V5LCBmaWxlcyB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBjaGlsZHJlbi5zZXQobDEsIGxpc3QpO1xuICB9XG5cbiAgY29uc3QgbDFEb21haW5zID0gWy4uLmwxU2V0XS5zb3J0KChhLCBiKSA9PiB7XG4gICAgaWYgKGEgPT09IFwiXHU2NzJBXHU2ODA3XHU2Q0U4XCIpIHJldHVybiAxO1xuICAgIGlmIChiID09PSBcIlx1NjcyQVx1NjgwN1x1NkNFOFwiKSByZXR1cm4gLTE7XG4gICAgcmV0dXJuIGEgPCBiID8gLTEgOiBhID4gYiA/IDEgOiAwO1xuICB9KTtcblxuICByZXR1cm4geyBsMURvbWFpbnMsIGNoaWxkcmVuLCBjZWxscyB9O1xufVxuXG4vKipcbiAqIFx1NEVDRSB2YXVsdC5nZXRGaWxlcygpIFx1ODA1QVx1NTQwOFx1NjIxMCByb290IFx1NEUwQlx1NEUyNFx1N0VBN1x1NzZFRVx1NUY1NVx1NjgxMVx1RkYxQVxuICogLSBcdTRFMDBcdTdFQTdcdUZGMUFcdTc2RjRcdTYzQTVcdTVCNTBcdTc2RUVcdTVGNTVcdUZGMDhcdTY1NjNcdTg0M0RcdTY1ODdcdTRFRjZcdTVGNTJcdTUxNjVcdTMwMENcdTY3MkFcdTUyMDZcdTdDN0JcdTMwMERcdUZGMDlcbiAqIC0gXHU0RThDXHU3RUE3XHVGRjFBXHU0RTAwXHU3RUE3XHU3NkVFXHU1RjU1XHU1MTg1XHU3Njg0XHU3NkY0XHU2M0E1XHU1QjUwXHU2NTg3XHU0RUY2XHU1OTM5XHVGRjA4XHU5MDEyXHU1RjUyXHU4QkExXHU1MTY1XHU2NTg3XHU0RUY2XHU2NTcwXHVGRjA5XG4gKiAtIFx1NUM0Mlx1N0VBN1x1NUMwMVx1OTg3Nlx1NEUyNFx1NUM0Mlx1RkYxQVx1N0IyQ1x1NEUwOVx1NUM0Mlx1NTNDQVx1NjZGNFx1NkRGMVx1NjU4N1x1NEVGNlx1NTkzOVx1NEUwRFx1NTE4RFx1NTM1NVx1NzJFQ1x1NTFGQVx1NTc1N1x1RkYwQ1x1NTE3Nlx1NjU4N1x1NEVGNlx1OEJBMVx1NTE2NVx1NjI0MFx1NTcyOFx1NEU4Q1x1N0VBN1x1NTc1N1xuICovXG5leHBvcnQgZnVuY3Rpb24gYWdncmVnYXRlRGlyVHJlZShmaWxlczogVEZpbGVbXSwgcm9vdDogc3RyaW5nKTogQ2VsbFtdIHtcbiAgY29uc3QgcHJlZml4ID0gcm9vdC5lbmRzV2l0aChcIi9cIikgPyByb290IDogcm9vdCArIFwiL1wiO1xuICBjb25zdCBieUwxID0gbmV3IE1hcDxzdHJpbmcsIHsgY2VsbDogQ2VsbDsgc3ViZGlyczogTWFwPHN0cmluZywgU3ViZGlyQ2VsbD4gfT4oKTtcbiAgY29uc3QgdW5jYXRlZ29yaXplZDogRmlsZVJlY1tdID0gW107XG5cbiAgZm9yIChjb25zdCBmIG9mIGZpbGVzKSB7XG4gICAgaWYgKCFmLnBhdGguc3RhcnRzV2l0aChwcmVmaXgpKSBjb250aW51ZTtcbiAgICBjb25zdCByZXN0ID0gZi5wYXRoLnNsaWNlKHByZWZpeC5sZW5ndGgpO1xuICAgIGNvbnN0IHBhcnRzID0gcmVzdC5zcGxpdChcIi9cIik7XG4gICAgY29uc3QgcmVjOiBGaWxlUmVjID0geyBwYXRoOiBmLnBhdGgsIG5hbWU6IGYubmFtZSwgbXRpbWU6IGYuc3RhdC5tdGltZSwgZmlsZTogZiB9O1xuXG4gICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgLy8gcm9vdCBcdTRFMEJcdTc2ODRcdTY1NjNcdTg0M0RcdTY1ODdcdTRFRjZcbiAgICAgIHVuY2F0ZWdvcml6ZWQucHVzaChyZWMpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgY29uc3QgbDEgPSBwYXJ0c1swXTtcbiAgICBsZXQgZW50cnkgPSBieUwxLmdldChsMSk7XG4gICAgaWYgKCFlbnRyeSkge1xuICAgICAgZW50cnkgPSB7XG4gICAgICAgIGNlbGw6IHsga2V5OiBsMSwgbGFiZWw6IGwxLCBmaWxlczogW10gfSxcbiAgICAgICAgc3ViZGlyczogbmV3IE1hcCgpLFxuICAgICAgfTtcbiAgICAgIGJ5TDEuc2V0KGwxLCBlbnRyeSk7XG4gICAgfVxuICAgIGVudHJ5LmNlbGwuZmlsZXMucHVzaChyZWMpO1xuXG4gICAgaWYgKHBhcnRzLmxlbmd0aCA+PSAzKSB7XG4gICAgICAvLyBcdTgxRjNcdTVDMTFcdTY3MDkgTDIgXHU3NkVFXHU1RjU1XHVGRjFBcGFydHMgPSBbTDEsIEwyLCAuLi4sIGZpbGVuYW1lXVxuICAgICAgY29uc3QgbDIgPSBwYXJ0c1sxXTtcbiAgICAgIGxldCBzdWIgPSBlbnRyeS5zdWJkaXJzLmdldChsMik7XG4gICAgICBpZiAoIXN1Yikge1xuICAgICAgICBzdWIgPSB7IGtleTogYCR7bDF9LyR7bDJ9YCwgbGFiZWw6IGwyLCBmaWxlczogW10gfTtcbiAgICAgICAgZW50cnkuc3ViZGlycy5zZXQobDIsIHN1Yik7XG4gICAgICB9XG4gICAgICBzdWIuZmlsZXMucHVzaChyZWMpO1xuICAgIH1cbiAgICAvLyBwYXJ0cy5sZW5ndGggPT09IDJcdUZGMUFcdTc2RjRcdTYzQTVcdTRGNERcdTRFOEUgTDEgXHU0RTBCXHU3Njg0XHU2NTg3XHU0RUY2XHVGRjBDXHU1M0VBXHU4QkExXHU1MTY1IGNlbGwuZmlsZXNcdUZGMENcdTRFMERcdTRFQTdcdTc1MUYgTDIgXHU1NzU3XG4gIH1cblxuICBjb25zdCBlbnRyaWVzID0gWy4uLmJ5TDEudmFsdWVzKCldLnNvcnQoKGEsIGIpID0+XG4gICAgYS5jZWxsLmxhYmVsIDwgYi5jZWxsLmxhYmVsID8gLTEgOiBhLmNlbGwubGFiZWwgPiBiLmNlbGwubGFiZWwgPyAxIDogMCxcbiAgKTtcbiAgY29uc3QgY2VsbHM6IENlbGxbXSA9IFtdO1xuICBmb3IgKGNvbnN0IGUgb2YgZW50cmllcykge1xuICAgIGlmIChlLnN1YmRpcnMuc2l6ZSA+IDApIHtcbiAgICAgIGUuY2VsbC5zdWJkaXJzID0gWy4uLmUuc3ViZGlycy52YWx1ZXMoKV0uc29ydCgoYSwgYikgPT5cbiAgICAgICAgYS5sYWJlbCA8IGIubGFiZWwgPyAtMSA6IGEubGFiZWwgPiBiLmxhYmVsID8gMSA6IDAsXG4gICAgICApO1xuICAgIH1cbiAgICBjZWxscy5wdXNoKGUuY2VsbCk7XG4gIH1cbiAgaWYgKHVuY2F0ZWdvcml6ZWQubGVuZ3RoID4gMCkge1xuICAgIGNlbGxzLnB1c2goeyBrZXk6IFwiX191bmNhdGVnb3JpemVkX19cIiwgbGFiZWw6IFwiXHU2NzJBXHU1MjA2XHU3QzdCXCIsIGZpbGVzOiB1bmNhdGVnb3JpemVkIH0pO1xuICB9XG4gIHJldHVybiBjZWxscztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxhdGVzdE10aW1lT2YoZmlsZXM6IEZpbGVSZWNbXSk6IG51bWJlciB7XG4gIGxldCBtID0gMDtcbiAgZm9yIChjb25zdCBmIG9mIGZpbGVzKSBpZiAoZi5tdGltZSA+IG0pIG0gPSBmLm10aW1lO1xuICByZXR1cm4gbTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxhdGVzdE10aW1lKGNlbGw6IHsgZmlsZXM6IEZpbGVSZWNbXSB9KTogbnVtYmVyIHtcbiAgcmV0dXJuIGxhdGVzdE10aW1lT2YoY2VsbC5maWxlcyk7XG59XG4iLCAiaW1wb3J0IHsgQXBwLCBURmlsZSB9IGZyb20gXCJvYnNpZGlhblwiO1xuXG4vKiogXHU1RTk1XHU5MEU4XHUzMDBDXHU2NzAwXHU4RkQxXHUzMDBEXHU1RkVCXHU2Mzc3XHU2NzYxXHVGRjFBd29ya3NwYWNlLmdldExhc3RPcGVuRmlsZXMoKSBcdTY3MDBcdThGRDEgMTAgXHU0RTJBICovXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyUmVjZW50KGFwcDogQXBwLCBjb250YWluZXI6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gIGNvbnRhaW5lci5lbXB0eSgpO1xuICBjb250YWluZXIuYWRkQ2xhc3MoXCJrdy1yZWNlbnRcIik7XG5cbiAgY29udGFpbmVyLmNyZWF0ZVNwYW4oeyBjbHM6IFwia3ctcmVjZW50LWxhYmVsXCIsIHRleHQ6IFwiXHU2NzAwXHU4RkQxXCIgfSk7XG5cbiAgY29uc3QgcGF0aHMgPSBhcHAud29ya3NwYWNlLmdldExhc3RPcGVuRmlsZXMoKS5zbGljZSgwLCAxMCk7XG4gIGlmIChwYXRocy5sZW5ndGggPT09IDApIHtcbiAgICBjb250YWluZXIuY3JlYXRlU3Bhbih7IGNsczogXCJrdy1yZWNlbnQtZW1wdHlcIiwgdGV4dDogXCJcdTY1RTBcdTY3MDBcdThGRDFcdTY1ODdcdTRFRjZcIiB9KTtcbiAgICByZXR1cm47XG4gIH1cblxuICBmb3IgKGNvbnN0IHAgb2YgcGF0aHMpIHtcbiAgICBjb25zdCBuYW1lID0gcC5zcGxpdChcIi9cIikucG9wKCkgfHwgcDtcbiAgICBjb25zdCBjaGlwID0gY29udGFpbmVyLmNyZWF0ZVNwYW4oeyBjbHM6IFwia3ctY2hpcFwiLCB0ZXh0OiBkaXNwbGF5TmFtZShuYW1lKSB9KTtcbiAgICBjaGlwLnNldEF0dHIoXCJ0aXRsZVwiLCBwKTtcbiAgICBjaGlwLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICBjb25zdCBmID0gYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChwKTtcbiAgICAgIGlmIChmIGluc3RhbmNlb2YgVEZpbGUpIHtcbiAgICAgICAgYXBwLndvcmtzcGFjZS5nZXRMZWFmKGZhbHNlKS5vcGVuRmlsZShmKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBkaXNwbGF5TmFtZShuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAvLyBcdTUzQkJcdTYzODkgLm1kIFx1NTQwRVx1N0YwMFx1OEJBOSBjaGlwIFx1NjZGNFx1N0QyN1x1NTFEMVx1RkYxQlx1NTE3Nlx1NEVENlx1NjI2OVx1NUM1NVx1NTQwRFx1NEZERFx1NzU1OVx1RkYwOHBkZi9wbmcgXHU3QjQ5XHVGRjA5XG4gIHJldHVybiBuYW1lLmVuZHNXaXRoKFwiLm1kXCIpID8gbmFtZS5zbGljZSgwLCAtMykgOiBuYW1lO1xufVxuIiwgImltcG9ydCB7IEFwcCwgTWVudSwgTm90aWNlLCBURmlsZSB9IGZyb20gXCJvYnNpZGlhblwiO1xuaW1wb3J0IHR5cGUgV29ya2JlbmNoUGx1Z2luIGZyb20gXCIuLi9tYWluXCI7XG5pbXBvcnQgeyBsb2FkUGxhbnMsIFBsYW4gfSBmcm9tIFwiLi9wbGFuXCI7XG5pbXBvcnQgdHlwZSB7IFRhc2tJdGVtIH0gZnJvbSBcIi4vdHlwZXNcIjtcbmltcG9ydCB7IGJ1aWxkVG9kYXlHcm91cHMsIGJ1aWxkVXBjb21pbmdHcm91cHMsIGJ1aWxkQWxsR3JvdXBzLCBWaWV3cG9ydEdyb3VwLCBkYXRlU3RyIH0gZnJvbSBcIi4vZ3JvdXBzXCI7XG5pbXBvcnQgeyB0b2dnbGVUYXNrQ29tcGxldGUsIHJlcG9ydFdyaXRlRXJyb3IsIHVwZGF0ZVRhc2tMaW5lIH0gZnJvbSBcIi4vd3JpdGViYWNrXCI7XG5pbXBvcnQgeyBnZXREdWUsIGdldFByaW9yaXR5LCBzZXJpYWxpemVUYXNrLCB3aXRoRHVlLCB3aXRoUHJpb3JpdHksIHdpdGhUZXh0LCBQcmlvcml0eSB9IGZyb20gXCIuL3BhcnNlclwiO1xuaW1wb3J0IHsgdG9kYXlEYXRlU3RyIH0gZnJvbSBcIi4uL3V0aWxcIjtcbmltcG9ydCB7IERhdGVQaWNrZXJNb2RhbCwgTmV3UGxhbk1vZGFsLCBRdWlja0FkZFRhc2tNb2RhbCB9IGZyb20gXCIuL21vZGFsc1wiO1xuXG50eXBlIFZpZXdwb3J0S2V5ID0gXCJ0b2RheVwiIHwgXCJ1cGNvbWluZ1wiIHwgXCJhbGxcIiB8IFwiY2FsZW5kYXJcIjtcblxuaW50ZXJmYWNlIFVJU3RhdGUge1xuICB2aWV3cG9ydDogVmlld3BvcnRLZXk7XG4gIC8qKiBcdTYyOThcdTUzRTBcdTcyQjZcdTYwMDFcdUZGMUFrZXkgPSBncm91cEtleSAqL1xuICBjb2xsYXBzZWQ6IFNldDxzdHJpbmc+O1xuICBzY3JvbGxUb3A6IG51bWJlcjtcbiAgLyoqIFx1NjVFNVx1NTM4Nlx1ODlDNlx1NTNFM1x1RkYxQVx1NUY1M1x1NTI0RFx1NjYzRVx1NzkzQVx1NzY4NFx1NUU3NC9cdTY3MDhcdUZGMDhcdTY3MDhcdTRFRkQgMC1iYXNlZFx1RkYwOSAqL1xuICBjYWxZZWFyOiBudW1iZXI7XG4gIGNhbE1vbnRoOiBudW1iZXI7XG4gIC8qKiBcdTY1RTVcdTUzODZcdTg5QzZcdTUzRTNcdUZGMUFcdTkwMDlcdTRFMkRcdTc2ODRcdTY1RTVcdTY3MUZcdUZGMDhZWVlZLU1NLUREXHVGRjA5XHVGRjBDbnVsbCBcdTg4NjhcdTc5M0FcdTY3MkFcdTVDNTVcdTVGMDAgKi9cbiAgc2VsZWN0ZWREYXRlOiBzdHJpbmcgfCBudWxsO1xufVxuXG5leHBvcnQgY2xhc3MgVGFza3NTZWN0aW9uIHtcbiAgcHJpdmF0ZSByZWFkb25seSBhcHA6IEFwcDtcbiAgcHJpdmF0ZSByZWFkb25seSBwbHVnaW46IFdvcmtiZW5jaFBsdWdpbjtcbiAgcHJpdmF0ZSByZWFkb25seSByb290OiBIVE1MRWxlbWVudDtcbiAgcHJpdmF0ZSBwbGFuczogUGxhbltdID0gW107XG4gIHByaXZhdGUgc3RhdGU6IFVJU3RhdGU7XG4gIC8qKiBcdTYzRDJcdTRFRjZcdTgxRUFcdThFQUJcdTUyMUFcdTUzRDFcdThENzdcdTc2ODRcdTUxOTlcdTU2REVcdUZGMENcdTVGRkRcdTc1NjVcdTRFMEJcdTRFMDBcdTZCMjFcdTU5MTZcdTkwRTggcmVmcmVzaCBcdTg5RTZcdTUzRDEgKi9cbiAgcHJpdmF0ZSBzdXBwcmVzc1JlZnJlc2ggPSBmYWxzZTtcbiAgLyoqIFx1NURGMlx1NTIxRFx1NTlDQlx1NTMxNlx1OEZDN1x1N0VDNFx1NzY4NFx1NjI5OFx1NTNFMFx1OUVEOFx1OEJBNFx1RkYwOFx1NzUyOFx1NEU4RVx1N0IyQ1x1NEUwMFx1NkIyMVx1NkUzMlx1NjdEM1x1NjVGNlx1NUU5NFx1NzUyOCBncm91cC5jb2xsYXBzZWRcdUZGMDkgKi9cbiAgcHJpdmF0ZSBpbml0ZWRHcm91cHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBXb3JrYmVuY2hQbHVnaW4sIGNvbnRhaW5lcjogSFRNTEVsZW1lbnQpIHtcbiAgICB0aGlzLmFwcCA9IGFwcDtcbiAgICB0aGlzLnBsdWdpbiA9IHBsdWdpbjtcbiAgICB0aGlzLnJvb3QgPSBjb250YWluZXI7XG4gICAgdGhpcy5yb290LmFkZENsYXNzKFwia3ctcGFuZWxcIik7XG4gICAgdGhpcy5yb290LmFkZENsYXNzKFwia3ctcGFuZWwtdGFza3NcIik7XG4gICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgdmlld3BvcnQ6IHBsdWdpbi5zZXR0aW5ncy5kZWZhdWx0Vmlld3BvcnQsXG4gICAgICBjb2xsYXBzZWQ6IG5ldyBTZXQoKSxcbiAgICAgIHNjcm9sbFRvcDogMCxcbiAgICAgIGNhbFllYXI6IG5vdy5nZXRGdWxsWWVhcigpLFxuICAgICAgY2FsTW9udGg6IG5vdy5nZXRNb250aCgpLFxuICAgICAgc2VsZWN0ZWREYXRlOiBudWxsLFxuICAgIH07XG4gIH1cblxuICAvKiogXHU2NjJGXHU1NDI2XHU3NTMxXHU2M0QyXHU0RUY2XHU4MUVBXHU4RUFCXHU1MTk5XHU1MTY1XHU4OUU2XHU1M0QxXHU3Njg0IHZhdWx0IFx1NEU4Qlx1NEVGNlx1MjAxNFx1MjAxNFx1ODJFNVx1NjYyRlx1RkYwQ1x1OERGM1x1OEZDN1x1NTIzN1x1NjVCMCAqL1xuICBjb25zdW1lU2VsZldyaXRlRmxhZygpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5zdXBwcmVzc1JlZnJlc2gpIHtcbiAgICAgIHRoaXMuc3VwcHJlc3NSZWZyZXNoID0gZmFsc2U7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgYXN5bmMgcmVuZGVyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFx1NUZFQlx1NzE2N1x1NkVEQVx1NTJBOFxuICAgIGNvbnN0IGJvZHkgPSB0aGlzLnJvb3QucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oXCIua3ctcGFuZWwtYm9keVwiKTtcbiAgICBpZiAoYm9keSkgdGhpcy5zdGF0ZS5zY3JvbGxUb3AgPSBib2R5LnNjcm9sbFRvcDtcblxuICAgIHRoaXMucGxhbnMgPSBhd2FpdCBsb2FkUGxhbnModGhpcy5hcHApO1xuXG4gICAgdGhpcy5yb290LmVtcHR5KCk7XG4gICAgdGhpcy5yZW5kZXJIZWFkKCk7XG4gICAgdGhpcy5yZW5kZXJCb2R5KCk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlckhlYWQoKTogdm9pZCB7XG4gICAgY29uc3QgaGVhZCA9IHRoaXMucm9vdC5jcmVhdGVEaXYoeyBjbHM6IFwia3ctcGFuZWwtaGVhZCBrdy10YXNrcy1oZWFkXCIgfSk7XG4gICAgaGVhZC5jcmVhdGVTcGFuKHsgY2xzOiBcImt3LXRhc2tzLXRpdGxlXCIsIHRleHQ6IFwiXHVEODNEXHVEQ0NCIFx1NEVGQlx1NTJBMVwiIH0pO1xuXG4gICAgY29uc3QgdGFicyA9IGhlYWQuY3JlYXRlRGl2KHsgY2xzOiBcImt3LXRhc2tzLXRhYnNcIiB9KTtcbiAgICBjb25zdCBtayA9IChrZXk6IFZpZXdwb3J0S2V5LCBsYWJlbDogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCBlbCA9IHRhYnMuY3JlYXRlU3Bhbih7IGNsczogXCJrdy10YXNrcy10YWJcIiwgdGV4dDogbGFiZWwgfSk7XG4gICAgICBpZiAodGhpcy5zdGF0ZS52aWV3cG9ydCA9PT0ga2V5KSBlbC5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnZpZXdwb3J0ID09PSBrZXkpIHJldHVybjtcbiAgICAgICAgdGhpcy5zdGF0ZS52aWV3cG9ydCA9IGtleTtcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgIH0pO1xuICAgIH07XG4gICAgbWsoXCJ0b2RheVwiLCBcIlx1NEVDQVx1NTkyOVwiKTtcbiAgICBtayhcInVwY29taW5nXCIsIFwiXHU4QkExXHU1MjEyXCIpO1xuICAgIG1rKFwiYWxsXCIsIFwiXHU1MTY4XHU5MEU4XCIpO1xuICAgIG1rKFwiY2FsZW5kYXJcIiwgXCJcdTY1RTVcdTUzODZcIik7XG5cbiAgICBjb25zdCBhY3Rpb25zID0gaGVhZC5jcmVhdGVEaXYoeyBjbHM6IFwia3ctdGFza3MtYWN0aW9uc1wiIH0pO1xuICAgIGNvbnN0IGFkZEJ0biA9IGFjdGlvbnMuY3JlYXRlU3Bhbih7IGNsczogXCJrdy10YXNrcy1idG5cIiwgdGV4dDogXCIrIFx1NEVGQlx1NTJBMVwiIH0pO1xuICAgIGFkZEJ0bi5zZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsXCIsIFwiXHU1RkVCXHU5MDFGXHU2REZCXHU1MkEwXHU0RUZCXHU1MkExXCIpO1xuICAgIGFkZEJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgbmV3IFF1aWNrQWRkVGFza01vZGFsKHRoaXMuYXBwKS5vcGVuKCk7XG4gICAgfSk7XG4gICAgY29uc3QgbmV3UGxhbkJ0biA9IGFjdGlvbnMuY3JlYXRlU3Bhbih7IGNsczogXCJrdy10YXNrcy1idG5cIiwgdGV4dDogXCIrIFx1OEJBMVx1NTIxMlwiIH0pO1xuICAgIG5ld1BsYW5CdG4uc2V0QXR0cmlidXRlKFwiYXJpYS1sYWJlbFwiLCBcIlx1NjVCMFx1NUVGQVx1OEJBMVx1NTIxMlwiKTtcbiAgICBuZXdQbGFuQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICBuZXcgTmV3UGxhbk1vZGFsKHRoaXMuYXBwKS5vcGVuKCk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlckJvZHkoKTogdm9pZCB7XG4gICAgY29uc3QgYm9keSA9IHRoaXMucm9vdC5jcmVhdGVEaXYoeyBjbHM6IFwia3ctcGFuZWwtYm9keSBrdy10YXNrcy1ib2R5XCIgfSk7XG5cbiAgICBpZiAodGhpcy5zdGF0ZS52aWV3cG9ydCA9PT0gXCJjYWxlbmRhclwiKSB7XG4gICAgICB0aGlzLnJlbmRlckNhbGVuZGFyKGJvZHkpO1xuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IChib2R5LnNjcm9sbFRvcCA9IHRoaXMuc3RhdGUuc2Nyb2xsVG9wKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGdyb3VwczogVmlld3BvcnRHcm91cFtdO1xuICAgIGlmICh0aGlzLnN0YXRlLnZpZXdwb3J0ID09PSBcInRvZGF5XCIpIHtcbiAgICAgIGdyb3VwcyA9IGJ1aWxkVG9kYXlHcm91cHModGhpcy5wbGFucywgdG9kYXlEYXRlU3RyKCkpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS52aWV3cG9ydCA9PT0gXCJ1cGNvbWluZ1wiKSB7XG4gICAgICBncm91cHMgPSBidWlsZFVwY29taW5nR3JvdXBzKHRoaXMucGxhbnMsIG5ldyBEYXRlKCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBncm91cHMgPSBidWlsZEFsbEdyb3Vwcyh0aGlzLnBsYW5zKTtcbiAgICAgIGlmICh0aGlzLnBsdWdpbi5zZXR0aW5ncy5oaWRlQ29tcGxldGVkKSB7XG4gICAgICAgIGZvciAoY29uc3QgZyBvZiBncm91cHMpIHtcbiAgICAgICAgICBnLnRhc2tzID0gZy50YXNrcy5maWx0ZXIoKHQpID0+ICF0LnBhcnNlZC5jaGVja2VkKTtcbiAgICAgICAgICBnLnN1bW1hcnkgPSBTdHJpbmcoZy50YXNrcy5sZW5ndGgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGdyb3Vwcy5ldmVyeSgoZykgPT4gZy50YXNrcy5sZW5ndGggPT09IDApKSB7XG4gICAgICBib2R5LmNyZWF0ZURpdih7IGNsczogXCJrdy1lbXB0eVwiLCB0ZXh0OiB0aGlzLmVtcHR5SGludCgpIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgZyBvZiBncm91cHMpIHtcbiAgICAgIHRoaXMucmVuZGVyR3JvdXAoYm9keSwgZyk7XG4gICAgfVxuXG4gICAgLy8gXHU2MDYyXHU1OTBEXHU2RURBXHU1MkE4XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgIGJvZHkuc2Nyb2xsVG9wID0gdGhpcy5zdGF0ZS5zY3JvbGxUb3A7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGVtcHR5SGludCgpOiBzdHJpbmcge1xuICAgIHN3aXRjaCAodGhpcy5zdGF0ZS52aWV3cG9ydCkge1xuICAgICAgY2FzZSBcInRvZGF5XCI6XG4gICAgICAgIHJldHVybiBcIlx1NEVDQVx1NTkyOVx1NkNBMVx1NjcwOVx1NUY4NVx1NTI5RSBcdTI3MjhcIjtcbiAgICAgIGNhc2UgXCJ1cGNvbWluZ1wiOlxuICAgICAgICByZXR1cm4gXCJcdThGRDFcdTY3MUZcdTY1RTBcdTYzOTJcdTY3MUZcdTRFRkJcdTUyQTFcIjtcbiAgICAgIGNhc2UgXCJhbGxcIjpcbiAgICAgICAgaWYgKHRoaXMucGxhbnMubGVuZ3RoID09PSAwKSByZXR1cm4gXCJcdTVDMUFcdTY1RTBcdThCQTFcdTUyMTJcdTY1ODdcdTRFRjZcdUZGMENcdTcwQjlcdTUxRkJcdTUzRjNcdTRFMEFcdTMwMEMrIFx1OEJBMVx1NTIxMlx1MzAwRFx1NjVCMFx1NUVGQVwiO1xuICAgICAgICBpZiAodGhpcy5wbHVnaW4uc2V0dGluZ3MuaGlkZUNvbXBsZXRlZClcbiAgICAgICAgICByZXR1cm4gXCJcdTYyNDBcdTY3MDlcdTRFRkJcdTUyQTFcdTVERjJcdTVCOENcdTYyMTAgXHVEODNDXHVERjg5XHVGRjA4XHU1NzI4XHU4QkJFXHU3RjZFXHU0RTJEXHU1MTczXHU5NUVEXHUzMDBDXHU5NjkwXHU4NUNGXHU1REYyXHU1QjhDXHU2MjEwXHUzMDBEXHU1M0VGXHU2N0U1XHU3NzBCXHVGRjA5XCI7XG4gICAgICAgIHJldHVybiBcIlx1NjI0MFx1NjcwOVx1OEJBMVx1NTIxMlx1OTBGRFx1NjYyRlx1N0E3QVx1NzY4NFx1RkYwQ1x1NzBCOVx1NTFGQlx1NTNGM1x1NEUwQVx1MzAwQysgXHU0RUZCXHU1MkExXHUzMDBEXHU2REZCXHU1MkEwXCI7XG4gICAgICBjYXNlIFwiY2FsZW5kYXJcIjpcbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJHcm91cChwYXJlbnQ6IEhUTUxFbGVtZW50LCBnOiBWaWV3cG9ydEdyb3VwKTogdm9pZCB7XG4gICAgLy8gXHU5OTk2XHU2QjIxXHU5MDQ3XHU1MjMwXHU2N0QwXHU3RUM0XHU2NUY2XHU1RTk0XHU3NTI4XHU5RUQ4XHU4QkE0XHU2Mjk4XHU1M0UwXG4gICAgaWYgKCF0aGlzLmluaXRlZEdyb3Vwcy5oYXMoZy5rZXkpKSB7XG4gICAgICB0aGlzLmluaXRlZEdyb3Vwcy5hZGQoZy5rZXkpO1xuICAgICAgaWYgKGcuY29sbGFwc2VkKSB0aGlzLnN0YXRlLmNvbGxhcHNlZC5hZGQoZy5rZXkpO1xuICAgIH1cbiAgICBjb25zdCBjb2xsYXBzZWQgPSB0aGlzLnN0YXRlLmNvbGxhcHNlZC5oYXMoZy5rZXkpO1xuXG4gICAgY29uc3Qgd3JhcCA9IHBhcmVudC5jcmVhdGVEaXYoeyBjbHM6IFwia3ctdGFzay1ncm91cFwiIH0pO1xuICAgIGlmIChnLmtleSA9PT0gXCJvdmVyZHVlXCIpIHdyYXAuYWRkQ2xhc3MoXCJpcy1vdmVyZHVlXCIpO1xuXG4gICAgY29uc3QgaGVhZCA9IHdyYXAuY3JlYXRlRGl2KHsgY2xzOiBcImt3LXRhc2stZ3JvdXAtaGVhZFwiIH0pO1xuICAgIGhlYWQuY3JlYXRlU3Bhbih7IGNsczogXCJrdy10YXNrLWNhcmV0XCIsIHRleHQ6IGNvbGxhcHNlZCA/IFwiXHUyNUI4XCIgOiBcIlx1MjVCRVwiIH0pO1xuICAgIGhlYWQuY3JlYXRlU3Bhbih7IGNsczogXCJrdy10YXNrLWdyb3VwLWxhYmVsXCIsIHRleHQ6IGcubGFiZWwgfSk7XG4gICAgaGVhZC5jcmVhdGVTcGFuKHsgY2xzOiBcImt3LXRhc2stZ3JvdXAtY291bnRcIiwgdGV4dDogZy5zdW1tYXJ5IH0pO1xuICAgIGhlYWQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgIGlmIChjb2xsYXBzZWQpIHRoaXMuc3RhdGUuY29sbGFwc2VkLmRlbGV0ZShnLmtleSk7XG4gICAgICBlbHNlIHRoaXMuc3RhdGUuY29sbGFwc2VkLmFkZChnLmtleSk7XG4gICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH0pO1xuXG4gICAgaWYgKGNvbGxhcHNlZCkgcmV0dXJuO1xuXG4gICAgY29uc3QgbGlzdCA9IHdyYXAuY3JlYXRlRGl2KHsgY2xzOiBcImt3LXRhc2stbGlzdFwiIH0pO1xuICAgIGlmIChnLnRhc2tzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgbGlzdC5jcmVhdGVEaXYoeyBjbHM6IFwia3ctZW1wdHlcIiwgdGV4dDogXCJcdTY1RTBcIiB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZm9yIChjb25zdCB0IG9mIGcudGFza3MpIHRoaXMucmVuZGVyVGFzayhsaXN0LCB0LCBnLmtleSk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlclRhc2socGFyZW50OiBIVE1MRWxlbWVudCwgdDogVGFza0l0ZW0sIGdyb3VwS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCByb3cgPSBwYXJlbnQuY3JlYXRlRGl2KHsgY2xzOiBcImt3LXRhc2stcm93XCIgfSk7XG4gICAgcm93LmRhdGFzZXQuZ3JvdXBLZXkgPSBncm91cEtleTtcbiAgICBpZiAodC5wYXJzZWQuY2hlY2tlZCkgcm93LmFkZENsYXNzKFwiaXMtY2hlY2tlZFwiKTtcblxuICAgIC8vIGNoZWNrYm94XG4gICAgY29uc3QgYm94ID0gcm93LmNyZWF0ZUVsKFwiaW5wdXRcIiwge1xuICAgICAgYXR0cjogeyB0eXBlOiBcImNoZWNrYm94XCIgfSxcbiAgICAgIGNsczogXCJrdy10YXNrLWNoZWNrXCIsXG4gICAgfSkgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICBib3guY2hlY2tlZCA9IHQucGFyc2VkLmNoZWNrZWQ7XG4gICAgYm94LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBhc3luYyAoZSkgPT4ge1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIGlmICh0LnBhcnNlZC5jaGVja2VkKSB7XG4gICAgICAgIC8vIFx1NURGMlx1NUI4Q1x1NjIxMFx1NEVGQlx1NTJBMVx1NzY4NFx1NTNENlx1NkQ4OFx1NTJGRVx1OTAwOVx1RkYxQVNQRUMgXHU2NzJBXHU1QjlBXHU0RTQ5XHVGRjBDXHU2NjgyXHU0RTBEXHU2NTJGXHU2MzAxXG4gICAgICAgIGJveC5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgbmV3IE5vdGljZShcIlx1NURGMlx1NUI4Q1x1NjIxMFx1NEVGQlx1NTJBMVx1NEUwRFx1NjUyRlx1NjMwMVx1NTcyOFx1NURFNVx1NEY1Q1x1NTNGMFx1NTNENlx1NkQ4OFx1NTJGRVx1OTAwOVwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5zdXBwcmVzc1JlZnJlc2ggPSB0cnVlO1xuICAgICAgICBhd2FpdCB0b2dnbGVUYXNrQ29tcGxldGUodGhpcy5hcHAsIHQubG9jYXRvcik7XG4gICAgICAgIC8vIFx1NjcyQ1x1NTczMFx1N0FDQlx1NTM3M1x1ODlDNlx1ODlDOVx1NTNDRFx1OTk4OFxuICAgICAgICB0LnBhcnNlZC5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgcm93LmFkZENsYXNzKFwiaXMtY2hlY2tlZFwiKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICB0aGlzLnN1cHByZXNzUmVmcmVzaCA9IGZhbHNlO1xuICAgICAgICBib3guY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICByZXBvcnRXcml0ZUVycm9yKGVycik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBcdTRGMThcdTUxNDhcdTdFQTdcdTcwQjlcdUZGMDhcdTU5Q0JcdTdFQzhcdTZFMzJcdTY3RDNcdUZGMENcdTY1RTBcdTRGMThcdTUxNDhcdTdFQTdcdTY1RjZcdTUzNEFcdTkwMEZcdTY2MEVcdTUzNjBcdTRGNERcdUZGMUJcdTVERjJcdTVCOENcdTYyMTBcdTRFRkJcdTUyQTFcdTRFMERcdTUzRUZcdTdGMTZcdThGOTFcdUZGMDlcbiAgICBjb25zdCBwcmlvID0gZ2V0UHJpb3JpdHkodC5wYXJzZWQpO1xuICAgIGNvbnN0IGRvdCA9IHJvdy5jcmVhdGVTcGFuKHtcbiAgICAgIGNsczpcbiAgICAgICAgXCJrdy10YXNrLXByaW8gXCIgK1xuICAgICAgICAocHJpbyA/IGBrdy1wcmlvLSR7cHJpb31gIDogXCJrdy1wcmlvLW5vbmVcIiksXG4gICAgfSk7XG4gICAgZG90LnNldEF0dHJpYnV0ZShcImFyaWEtbGFiZWxcIiwgcHJpbyA/IGBcdTRGMThcdTUxNDhcdTdFQTdcdUZGMUEke3ByaW99YCA6IFwiXHU4QkJFXHU3RjZFXHU0RjE4XHU1MTQ4XHU3RUE3XCIpO1xuICAgIGRvdC5zZXRBdHRyaWJ1dGUoXCJ0aXRsZVwiLCBwcmlvID8gYFx1NEYxOFx1NTE0OFx1N0VBN1x1RkYxQSR7cHJpb31gIDogXCJcdTcwQjlcdTUxRkJcdThCQkVcdTdGNkVcdTRGMThcdTUxNDhcdTdFQTdcIik7XG4gICAgaWYgKCF0LnBhcnNlZC5jaGVja2VkKSB7XG4gICAgICBkb3QuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlKSA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRoaXMub3BlblByaW9yaXR5TWVudShlLCB0LCByb3cpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gXHU2NTg3XHU2NzJDXHVGRjA4XHU1MzU1XHU1MUZCXHU4REYzXHU4RjZDIC8gXHU1M0NDXHU1MUZCXHU1QzMxXHU1NzMwXHU3RjE2XHU4RjkxXHVGRjA5XG4gICAgY29uc3QgdGV4dCA9IHJvdy5jcmVhdGVTcGFuKHsgY2xzOiBcImt3LXRhc2stdGV4dFwiLCB0ZXh0OiB0LnBhcnNlZC50ZXh0IH0pO1xuICAgIGxldCBjbGlja1RpbWVyOiBudW1iZXIgfCBudWxsID0gbnVsbDtcbiAgICB0ZXh0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICBpZiAoY2xpY2tUaW1lciAhPT0gbnVsbCkgd2luZG93LmNsZWFyVGltZW91dChjbGlja1RpbWVyKTtcbiAgICAgIGNsaWNrVGltZXIgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNsaWNrVGltZXIgPSBudWxsO1xuICAgICAgICB2b2lkIHRoaXMub3BlblRhc2tGaWxlKHQpO1xuICAgICAgfSwgMjIwKTtcbiAgICB9KTtcbiAgICBpZiAoIXQucGFyc2VkLmNoZWNrZWQpIHtcbiAgICAgIHRleHQuYWRkRXZlbnRMaXN0ZW5lcihcImRibGNsaWNrXCIsIChlKSA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGlmIChjbGlja1RpbWVyICE9PSBudWxsKSB7XG4gICAgICAgICAgd2luZG93LmNsZWFyVGltZW91dChjbGlja1RpbWVyKTtcbiAgICAgICAgICBjbGlja1RpbWVyID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVudGVyVGV4dEVkaXQodGV4dCwgdCwgcm93KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIGR1ZSBjaGlwXHVGRjA4XHU1OUNCXHU3RUM4XHU2RTMyXHU2N0QzXHVGRjBDXHU2NUUwIGR1ZSBcdTY1RjZcdTY2M0VcdTc5M0FcdTUzNjBcdTRGNERcdUZGMUJcdTVERjJcdTVCOENcdTYyMTBcdTRFRkJcdTUyQTFcdTRFMERcdTUzRUZcdTdGMTZcdThGOTFcdUZGMDlcbiAgICBjb25zdCBkdWUgPSBnZXREdWUodC5wYXJzZWQpO1xuICAgIGNvbnN0IHRvZGF5ID0gdG9kYXlEYXRlU3RyKCk7XG4gICAgY29uc3QgZHVlRWwgPSByb3cuY3JlYXRlU3Bhbih7XG4gICAgICBjbHM6IFwia3ctdGFzay1kdWVcIiArIChkdWUgPyBcIlwiIDogXCIga3ctZHVlLWVtcHR5XCIpLFxuICAgICAgdGV4dDogZHVlID8/IFwiKyBcdTY1RTVcdTY3MUZcIixcbiAgICB9KTtcbiAgICBpZiAoZHVlKSB7XG4gICAgICBjb25zdCBpc092ZXJkdWUgPSBkdWUgPCB0b2RheSAmJiAhdC5wYXJzZWQuY2hlY2tlZDtcbiAgICAgIGNvbnN0IGlzVG9kYXkgPSBkdWUgPT09IHRvZGF5O1xuICAgICAgaWYgKGlzT3ZlcmR1ZSkgZHVlRWwuYWRkQ2xhc3MoXCJpcy1vdmVyZHVlXCIpO1xuICAgICAgZWxzZSBpZiAoaXNUb2RheSkgZHVlRWwuYWRkQ2xhc3MoXCJpcy10b2RheVwiKTtcbiAgICB9XG4gICAgZHVlRWwuc2V0QXR0cmlidXRlKFwidGl0bGVcIiwgZHVlID8gXCJcdTcwQjlcdTUxRkJcdTRGRUVcdTY1MzlcdTY1RTVcdTY3MUZcIiA6IFwiXHU3MEI5XHU1MUZCXHU4QkJFXHU3RjZFXHU2NUU1XHU2NzFGXCIpO1xuICAgIGlmICghdC5wYXJzZWQuY2hlY2tlZCkge1xuICAgICAgZHVlRWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlKSA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRoaXMub3BlbkR1ZU1lbnUoZSwgdCwgcm93KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIFx1OEJBMVx1NTIxMlx1NTQwRFx1RkYwOFx1NTcyOCB0b2RheS91cGNvbWluZy9jYWxlbmRhciBcdTg5QzZcdTUzRTNcdTY2M0VcdTc5M0FcdUZGMUJhbGwgXHU4OUM2XHU1M0UzXHU2MzA5XHU4QkExXHU1MjEyXHU1MjA2XHU3RUM0XHU1REYyXHU3N0U1XHU0RTBEXHU2NjNFXHU3OTNBXHVGRjA5XG4gICAgaWYgKGdyb3VwS2V5ICE9PSBcImFsbFwiICYmICFncm91cEtleS5zdGFydHNXaXRoKFwicGxhbi1cIikpIHtcbiAgICAgIHJvdy5jcmVhdGVTcGFuKHsgY2xzOiBcImt3LXRhc2stcGxhblwiLCB0ZXh0OiB0LnBsYW5UaXRsZSB9KTtcbiAgICB9XG4gIH1cblxuICAvLyA9PT09PT09PT09PT09PT09PT09PSBcdTg4NENcdTUxODVcdTdGMTZcdThGOTEgPT09PT09PT09PT09PT09PT09PT1cblxuICBwcml2YXRlIGFzeW5jIG9wZW5UYXNrRmlsZSh0OiBUYXNrSXRlbSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGYgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgodC5wbGFuUGF0aCk7XG4gICAgaWYgKCEoZiBpbnN0YW5jZW9mIFRGaWxlKSkgcmV0dXJuO1xuICAgIGNvbnN0IGxlYWYgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0TGVhZihmYWxzZSk7XG4gICAgYXdhaXQgbGVhZi5vcGVuRmlsZShmKTtcbiAgICBjb25zdCB2aWV3ID0gbGVhZi52aWV3IGFzIHVua25vd24gYXMge1xuICAgICAgZWRpdG9yPzoge1xuICAgICAgICBzZXRDdXJzb3I6IChwb3M6IHsgbGluZTogbnVtYmVyOyBjaDogbnVtYmVyIH0pID0+IHZvaWQ7XG4gICAgICAgIHNjcm9sbEludG9WaWV3OiAoXG4gICAgICAgICAgcjogeyBmcm9tOiB7IGxpbmU6IG51bWJlcjsgY2g6IG51bWJlciB9OyB0bzogeyBsaW5lOiBudW1iZXI7IGNoOiBudW1iZXIgfSB9LFxuICAgICAgICAgIGNlbnRlcj86IGJvb2xlYW4sXG4gICAgICAgICkgPT4gdm9pZDtcbiAgICAgIH07XG4gICAgfTtcbiAgICBjb25zdCBlZCA9IHZpZXc/LmVkaXRvcjtcbiAgICBpZiAoZWQpIHtcbiAgICAgIGVkLnNldEN1cnNvcih7IGxpbmU6IHQubGluZU51bWJlciwgY2g6IDAgfSk7XG4gICAgICBlZC5zY3JvbGxJbnRvVmlldyhcbiAgICAgICAgeyBmcm9tOiB7IGxpbmU6IHQubGluZU51bWJlciwgY2g6IDAgfSwgdG86IHsgbGluZTogdC5saW5lTnVtYmVyLCBjaDogMCB9IH0sXG4gICAgICAgIHRydWUsXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgb3BlblByaW9yaXR5TWVudShlOiBNb3VzZUV2ZW50LCB0OiBUYXNrSXRlbSwgcm93OiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgIGNvbnN0IGN1ciA9IGdldFByaW9yaXR5KHQucGFyc2VkKTtcbiAgICBjb25zdCBtZW51ID0gbmV3IE1lbnUoKTtcbiAgICBjb25zdCBvcHRzOiB7IGxhYmVsOiBzdHJpbmc7IHZhbHVlOiBQcmlvcml0eSB8IG51bGwgfVtdID0gW1xuICAgICAgeyBsYWJlbDogXCJcdTIzRUIgXHU5QUQ4XCIsIHZhbHVlOiBcImhpZ2hcIiB9LFxuICAgICAgeyBsYWJlbDogXCJcdUQ4M0RcdUREM0MgXHU0RTJEXCIsIHZhbHVlOiBcIm1lZGl1bVwiIH0sXG4gICAgICB7IGxhYmVsOiBcIlx1RDgzRFx1REQzRCBcdTRGNEVcIiwgdmFsdWU6IFwibG93XCIgfSxcbiAgICAgIHsgbGFiZWw6IFwiXHU2RTA1XHU5NjY0XCIsIHZhbHVlOiBudWxsIH0sXG4gICAgXTtcbiAgICBmb3IgKGNvbnN0IG8gb2Ygb3B0cykge1xuICAgICAgbWVudS5hZGRJdGVtKChpdCkgPT5cbiAgICAgICAgaXRcbiAgICAgICAgICAuc2V0VGl0bGUoby5sYWJlbCArIChvLnZhbHVlID09PSBjdXIgPyBcIiAgXHUyNzEzXCIgOiBcIlwiKSlcbiAgICAgICAgICAub25DbGljaygoKSA9PiB7XG4gICAgICAgICAgICBpZiAoby52YWx1ZSA9PT0gY3VyKSByZXR1cm47XG4gICAgICAgICAgICB2b2lkIHRoaXMuY29tbWl0VGFza1VwZGF0ZSh0LCByb3csIHdpdGhQcmlvcml0eSh0LnBhcnNlZCwgby52YWx1ZSkpO1xuICAgICAgICAgIH0pLFxuICAgICAgKTtcbiAgICB9XG4gICAgbWVudS5zaG93QXRNb3VzZUV2ZW50KGUpO1xuICB9XG5cbiAgcHJpdmF0ZSBvcGVuRHVlTWVudShlOiBNb3VzZUV2ZW50LCB0OiBUYXNrSXRlbSwgcm93OiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgIGNvbnN0IGN1ciA9IGdldER1ZSh0LnBhcnNlZCk7XG4gICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcbiAgICBjb25zdCB0b2RheSA9IHltZChub3cpO1xuICAgIGNvbnN0IHRvbW9ycm93ID0geW1kKGFkZERheXMobm93LCAxKSk7XG4gICAgY29uc3Qgc3VuZGF5ID0geW1kKGFkZERheXMobm93LCAoNyAtIG5vdy5nZXREYXkoKSkgJSA3IHx8IDcpKTtcblxuICAgIGNvbnN0IG1lbnUgPSBuZXcgTWVudSgpO1xuICAgIGNvbnN0IGl0ZW1zOiB7IGxhYmVsOiBzdHJpbmc7IHZhbHVlOiBzdHJpbmcgfCBudWxsIH1bXSA9IFtcbiAgICAgIHsgbGFiZWw6IGBcdTRFQ0FcdTU5MjlcdUZGMDgke3RvZGF5fVx1RkYwOWAsIHZhbHVlOiB0b2RheSB9LFxuICAgICAgeyBsYWJlbDogYFx1NjYwRVx1NTkyOVx1RkYwOCR7dG9tb3Jyb3d9XHVGRjA5YCwgdmFsdWU6IHRvbW9ycm93IH0sXG4gICAgICB7IGxhYmVsOiBgXHU2NzJDXHU1NDY4XHU2NUU1XHVGRjA4JHtzdW5kYXl9XHVGRjA5YCwgdmFsdWU6IHN1bmRheSB9LFxuICAgIF07XG4gICAgZm9yIChjb25zdCBvIG9mIGl0ZW1zKSB7XG4gICAgICBtZW51LmFkZEl0ZW0oKGl0KSA9PlxuICAgICAgICBpdFxuICAgICAgICAgIC5zZXRUaXRsZShvLmxhYmVsICsgKG8udmFsdWUgPT09IGN1ciA/IFwiICBcdTI3MTNcIiA6IFwiXCIpKVxuICAgICAgICAgIC5vbkNsaWNrKCgpID0+IHtcbiAgICAgICAgICAgIGlmIChvLnZhbHVlID09PSBjdXIpIHJldHVybjtcbiAgICAgICAgICAgIHZvaWQgdGhpcy5jb21taXRUYXNrVXBkYXRlKHQsIHJvdywgd2l0aER1ZSh0LnBhcnNlZCwgby52YWx1ZSkpO1xuICAgICAgICAgIH0pLFxuICAgICAgKTtcbiAgICB9XG4gICAgbWVudS5hZGRJdGVtKChpdCkgPT5cbiAgICAgIGl0LnNldFRpdGxlKFwiXHU4MUVBXHU1QjlBXHU0RTQ5XHUyMDI2XCIpLm9uQ2xpY2soKCkgPT4ge1xuICAgICAgICBuZXcgRGF0ZVBpY2tlck1vZGFsKHRoaXMuYXBwLCBjdXIgPz8gdG9kYXksICh2KSA9PiB7XG4gICAgICAgICAgaWYgKHYgPT09IGN1cikgcmV0dXJuO1xuICAgICAgICAgIHZvaWQgdGhpcy5jb21taXRUYXNrVXBkYXRlKHQsIHJvdywgd2l0aER1ZSh0LnBhcnNlZCwgdikpO1xuICAgICAgICB9KS5vcGVuKCk7XG4gICAgICB9KSxcbiAgICApO1xuICAgIGlmIChjdXIpIHtcbiAgICAgIG1lbnUuYWRkU2VwYXJhdG9yKCk7XG4gICAgICBtZW51LmFkZEl0ZW0oKGl0KSA9PlxuICAgICAgICBpdC5zZXRUaXRsZShcIlx1NkUwNVx1OTY2NFwiKS5vbkNsaWNrKCgpID0+IHtcbiAgICAgICAgICB2b2lkIHRoaXMuY29tbWl0VGFza1VwZGF0ZSh0LCByb3csIHdpdGhEdWUodC5wYXJzZWQsIG51bGwpKTtcbiAgICAgICAgfSksXG4gICAgICApO1xuICAgIH1cbiAgICBtZW51LnNob3dBdE1vdXNlRXZlbnQoZSk7XG4gIH1cblxuICBwcml2YXRlIGVudGVyVGV4dEVkaXQodGV4dEVsOiBIVE1MRWxlbWVudCwgdDogVGFza0l0ZW0sIHJvdzogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICBjb25zdCBvcmlnaW5hbCA9IHQucGFyc2VkLnRleHQ7XG4gICAgY29uc3QgaW5wdXQgPSByb3cuY3JlYXRlRWwoXCJpbnB1dFwiLCB7XG4gICAgICBjbHM6IFwia3ctdGFzay10ZXh0LWlucHV0XCIsXG4gICAgICBhdHRyOiB7IHR5cGU6IFwidGV4dFwiIH0sXG4gICAgfSkgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICBpbnB1dC52YWx1ZSA9IG9yaWdpbmFsO1xuICAgIHRleHRFbC5yZXBsYWNlV2l0aChpbnB1dCk7XG4gICAgaW5wdXQuZm9jdXMoKTtcbiAgICBpbnB1dC5zZWxlY3QoKTtcblxuICAgIGxldCBjYW5jZWxsZWQgPSBmYWxzZTtcbiAgICBsZXQgc3VibWl0dGVkID0gZmFsc2U7XG4gICAgY29uc3QgY2xlYW51cCA9IChmaW5hbFRleHQ6IEhUTUxFbGVtZW50KSA9PiB7XG4gICAgICBpbnB1dC5yZXBsYWNlV2l0aChmaW5hbFRleHQpO1xuICAgIH07XG4gICAgY29uc3QgZmluaXNoID0gYXN5bmMgKCkgPT4ge1xuICAgICAgaWYgKHN1Ym1pdHRlZCkgcmV0dXJuO1xuICAgICAgc3VibWl0dGVkID0gdHJ1ZTtcbiAgICAgIGlmIChjYW5jZWxsZWQpIHtcbiAgICAgICAgY2xlYW51cCh0aGlzLnJlYnVpbGRUZXh0RWwob3JpZ2luYWwpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgdiA9IGlucHV0LnZhbHVlLnJlcGxhY2UoL1tcXHJcXG5cXHRcXHUwMDAwLVxcdTAwMWZdL2csIFwiIFwiKS50cmltKCk7XG4gICAgICBpZiAoIXYgfHwgdiA9PT0gb3JpZ2luYWwpIHtcbiAgICAgICAgY2xlYW51cCh0aGlzLnJlYnVpbGRUZXh0RWwob3JpZ2luYWwpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY2xlYW51cCh0aGlzLnJlYnVpbGRUZXh0RWwodikpO1xuICAgICAgYXdhaXQgdGhpcy5jb21taXRUYXNrVXBkYXRlKHQsIHJvdywgd2l0aFRleHQodC5wYXJzZWQsIHYpKTtcbiAgICB9O1xuICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIChlKSA9PiB7XG4gICAgICBpZiAoZS5rZXkgPT09IFwiRW50ZXJcIikge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHZvaWQgZmluaXNoKCk7XG4gICAgICB9IGVsc2UgaWYgKGUua2V5ID09PSBcIkVzY2FwZVwiKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgY2FuY2VsbGVkID0gdHJ1ZTtcbiAgICAgICAgdm9pZCBmaW5pc2goKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiYmx1clwiLCAoKSA9PiB2b2lkIGZpbmlzaCgpKTtcbiAgfVxuXG4gIC8qKiBcdTY3ODRcdTkwMjBcdTRFMEVcdTUzOUZcdTU5Q0Iga3ctdGFzay10ZXh0IFx1N0VEM1x1Njc4NFx1NEUwMFx1ODFGNFx1NzY4NCBzcGFuXHVGRjBDXHU0RUU1XHU0RkJGXHU5MDAwXHU1MUZBXHU3RjE2XHU4RjkxXHU1NDBFXHU3RUU3XHU3RUVEXHU1M0VGXHU3MEI5XHU1MUZCL1x1NTNDQ1x1NTFGQiAqL1xuICBwcml2YXRlIHJlYnVpbGRUZXh0RWwodGV4dDogc3RyaW5nKTogSFRNTEVsZW1lbnQge1xuICAgIGNvbnN0IHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgICBzcGFuLmNsYXNzTmFtZSA9IFwia3ctdGFzay10ZXh0XCI7XG4gICAgc3Bhbi50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgcmV0dXJuIHNwYW47XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGNvbW1pdFRhc2tVcGRhdGUoXG4gICAgdDogVGFza0l0ZW0sXG4gICAgcm93OiBIVE1MRWxlbWVudCxcbiAgICBuZXdQYXJzZWQ6IHR5cGVvZiB0LnBhcnNlZCxcbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgbmV3TGluZSA9IHNlcmlhbGl6ZVRhc2sobmV3UGFyc2VkKTtcbiAgICBpZiAobmV3TGluZSA9PT0gdC5sb2NhdG9yLmxpbmVUZXh0KSByZXR1cm47XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuc3VwcHJlc3NSZWZyZXNoID0gdHJ1ZTtcbiAgICAgIGF3YWl0IHVwZGF0ZVRhc2tMaW5lKHRoaXMuYXBwLCB0LmxvY2F0b3IsIG5ld0xpbmUpO1xuICAgICAgLy8gXHU1NDBDXHU2QjY1XHU1MTg1XHU1QjU4XHU2MDAxXHVGRjBDXHU5MDdGXHU1MTREXHU0RTBCXHU2QjIxXHU3RjE2XHU4RjkxXHU0RUNEXHU3NTI4XHU2NUU3IGxvY2F0b3IgXHU2MjdFXHU0RTBEXHU1MjMwXG4gICAgICB0LnBhcnNlZCA9IG5ld1BhcnNlZDtcbiAgICAgIHQubG9jYXRvciA9IHsgLi4udC5sb2NhdG9yLCBsaW5lVGV4dDogbmV3TGluZSB9O1xuICAgICAgLy8gXHU1QzQwXHU5MEU4XHU1MjM3XHU2NUIwXHU4QkU1XHU4ODRDXHVGRjFBXHU5MUNEXHU1RUZBXHU2NTc0XHU4ODRDXHU2NkY0XHU3QjgwXHU1MzU1XG4gICAgICB0aGlzLnJlcmVuZGVyUm93KHQsIHJvdyk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aGlzLnN1cHByZXNzUmVmcmVzaCA9IGZhbHNlO1xuICAgICAgcmVwb3J0V3JpdGVFcnJvcihlcnIpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBcdTUzNTVcdTg4NENcdTVDNDBcdTkwRThcdTkxQ0RcdTZFMzJcdTY3RDNcdUZGMUFcdTYyN0VcdTUyMzAgcm93IFx1NzY4NFx1NzIzNlx1NUJCOVx1NTY2OFx1NEUwRSBncm91cEtleVx1RkYwQ1x1NjZGRlx1NjM2Mlx1NjM4OVx1OEZEOVx1NEUwMFx1ODg0QyAqL1xuICBwcml2YXRlIHJlcmVuZGVyUm93KHQ6IFRhc2tJdGVtLCByb3c6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgY29uc3QgcGFyZW50ID0gcm93LnBhcmVudEVsZW1lbnQ7XG4gICAgaWYgKCFwYXJlbnQpIHJldHVybjtcbiAgICBjb25zdCBncm91cEtleSA9IHJvdy5kYXRhc2V0Lmdyb3VwS2V5ID8/IFwiXCI7XG4gICAgY29uc3QgbWFya2VyID0gZG9jdW1lbnQuY3JlYXRlQ29tbWVudChcImt3LXJvd1wiKTtcbiAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKG1hcmtlciwgcm93KTtcbiAgICByb3cucmVtb3ZlKCk7XG4gICAgLy8gXHU5MDFBXHU4RkM3XHU0RTAwXHU0RTJBXHU0RTM0XHU2NUY2XHU1QkI5XHU1NjY4XHU2NUIwXHU1RUZBXHU4ODRDXHVGRjBDXHU3MTM2XHU1NDBFXHU2M0QyXHU1MjMwIG1hcmtlciBcdTU5MDRcbiAgICBjb25zdCB0bXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHRoaXMucmVuZGVyVGFzayh0bXAsIHQsIGdyb3VwS2V5KTtcbiAgICBjb25zdCBuZXdSb3cgPSB0bXAuZmlyc3RFbGVtZW50Q2hpbGQgYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xuICAgIGlmIChuZXdSb3cpIHBhcmVudC5pbnNlcnRCZWZvcmUobmV3Um93LCBtYXJrZXIpO1xuICAgIG1hcmtlci5yZW1vdmUoKTtcbiAgfVxuXG4gIC8vID09PT09PT09PT09PT09PT09PT09IFx1NjVFNVx1NTM4Nlx1ODlDNlx1NTNFMyA9PT09PT09PT09PT09PT09PT09PVxuXG4gIC8qKiBcdTYzMDkgZHVlIFx1NjVFNVx1NjcxRlx1ODA1QVx1NTQwOCBhY3RpdmUgXHU4QkExXHU1MjEyXHU3Njg0XHU0RUZCXHU1MkExICovXG4gIHByaXZhdGUgYnVpbGREYXRlSW5kZXgoKTogTWFwPHN0cmluZywgVGFza0l0ZW1bXT4ge1xuICAgIGNvbnN0IGlkeCA9IG5ldyBNYXA8c3RyaW5nLCBUYXNrSXRlbVtdPigpO1xuICAgIGZvciAoY29uc3QgcCBvZiB0aGlzLnBsYW5zKSB7XG4gICAgICBpZiAocC5zdGF0dXMgIT09IFwiYWN0aXZlXCIpIGNvbnRpbnVlO1xuICAgICAgZm9yIChjb25zdCB0IG9mIHAudGFza3MpIHtcbiAgICAgICAgY29uc3QgZHVlID0gZ2V0RHVlKHQucGFyc2VkKTtcbiAgICAgICAgaWYgKCFkdWUpIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBhcnIgPSBpZHguZ2V0KGR1ZSk7XG4gICAgICAgIGlmIChhcnIpIGFyci5wdXNoKHQpO1xuICAgICAgICBlbHNlIGlkeC5zZXQoZHVlLCBbdF0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaWR4O1xuICB9XG5cbiAgcHJpdmF0ZSBzaGlmdE1vbnRoKG46IG51bWJlcik6IHZvaWQge1xuICAgIGxldCBtID0gdGhpcy5zdGF0ZS5jYWxNb250aCArIG47XG4gICAgbGV0IHkgPSB0aGlzLnN0YXRlLmNhbFllYXI7XG4gICAgd2hpbGUgKG0gPCAwKSB7IG0gKz0gMTI7IHkgLT0gMTsgfVxuICAgIHdoaWxlIChtID4gMTEpIHsgbSAtPSAxMjsgeSArPSAxOyB9XG4gICAgdGhpcy5zdGF0ZS5jYWxNb250aCA9IG07XG4gICAgdGhpcy5zdGF0ZS5jYWxZZWFyID0geTtcbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJDYWxlbmRhcihib2R5OiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgIGNvbnN0IHkgPSB0aGlzLnN0YXRlLmNhbFllYXI7XG4gICAgY29uc3QgbSA9IHRoaXMuc3RhdGUuY2FsTW9udGg7XG4gICAgY29uc3QgdG9kYXkgPSB0b2RheURhdGVTdHIoKTtcbiAgICBjb25zdCBpZHggPSB0aGlzLmJ1aWxkRGF0ZUluZGV4KCk7XG5cbiAgICAvLyBcdTU5MzRcdTkwRThcdUZGMUFcdTUyMDdcdTY3MDggKyBcdTU2REVcdTRFQ0FcdTU5MjlcbiAgICBjb25zdCBoZHIgPSBib2R5LmNyZWF0ZURpdih7IGNsczogXCJrdy1jYWwtaGVhZFwiIH0pO1xuICAgIGNvbnN0IHByZXYgPSBoZHIuY3JlYXRlU3Bhbih7IGNsczogXCJrdy1jYWwtbmF2XCIsIHRleHQ6IFwiXHUyMDM5XCIgfSk7XG4gICAgcHJldi5zZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsXCIsIFwiXHU0RTBBXHU0RTJBXHU2NzA4XCIpO1xuICAgIGhkci5jcmVhdGVTcGFuKHsgY2xzOiBcImt3LWNhbC10aXRsZVwiLCB0ZXh0OiBgJHt5fSBcdTVFNzQgJHttICsgMX0gXHU2NzA4YCB9KTtcbiAgICBjb25zdCBuZXh0ID0gaGRyLmNyZWF0ZVNwYW4oeyBjbHM6IFwia3ctY2FsLW5hdlwiLCB0ZXh0OiBcIlx1MjAzQVwiIH0pO1xuICAgIG5leHQuc2V0QXR0cmlidXRlKFwiYXJpYS1sYWJlbFwiLCBcIlx1NEUwQlx1NEUyQVx1NjcwOFwiKTtcbiAgICBjb25zdCB0b2RheUJ0biA9IGhkci5jcmVhdGVTcGFuKHsgY2xzOiBcImt3LWNhbC10b2RheS1idG5cIiwgdGV4dDogXCJcdTU2REVcdTRFQ0FcdTU5MjlcIiB9KTtcbiAgICBwcmV2LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB0aGlzLnNoaWZ0TW9udGgoLTEpKTtcbiAgICBuZXh0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB0aGlzLnNoaWZ0TW9udGgoMSkpO1xuICAgIHRvZGF5QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICBjb25zdCBkID0gbmV3IERhdGUoKTtcbiAgICAgIHRoaXMuc3RhdGUuY2FsWWVhciA9IGQuZ2V0RnVsbFllYXIoKTtcbiAgICAgIHRoaXMuc3RhdGUuY2FsTW9udGggPSBkLmdldE1vbnRoKCk7XG4gICAgICB0aGlzLnN0YXRlLnNlbGVjdGVkRGF0ZSA9IHRvZGF5O1xuICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9KTtcblxuICAgIC8vIFx1NTQ2OFx1ODg2OFx1NTkzNFx1RkYwOFx1NTQ2OFx1NEUwMFx1OEQ3N1x1NTlDQlx1RkYwOVxuICAgIGNvbnN0IHdrID0gYm9keS5jcmVhdGVEaXYoeyBjbHM6IFwia3ctY2FsLXdraGVhZFwiIH0pO1xuICAgIGZvciAoY29uc3QgdyBvZiBbXCJcdTRFMDBcIiwgXCJcdTRFOENcIiwgXCJcdTRFMDlcIiwgXCJcdTU2REJcIiwgXCJcdTRFOTRcIiwgXCJcdTUxNkRcIiwgXCJcdTY1RTVcIl0pIHtcbiAgICAgIHdrLmNyZWF0ZVNwYW4oeyBjbHM6IFwia3ctY2FsLXdrXCIsIHRleHQ6IHcgfSk7XG4gICAgfVxuXG4gICAgLy8gXHU2NzA4XHU2ODNDXG4gICAgY29uc3QgZmlyc3QgPSBuZXcgRGF0ZSh5LCBtLCAxKTtcbiAgICBjb25zdCBvZmZzZXQgPSAoZmlyc3QuZ2V0RGF5KCkgKyA2KSAlIDc7IC8vIFx1NTQ2OFx1NEUwMD0wXG4gICAgY29uc3QgZGF5c0luTW9udGggPSBuZXcgRGF0ZSh5LCBtICsgMSwgMCkuZ2V0RGF0ZSgpO1xuICAgIGNvbnN0IHJvd3MgPSBNYXRoLmNlaWwoKG9mZnNldCArIGRheXNJbk1vbnRoKSAvIDcpO1xuICAgIGNvbnN0IHRvdGFsQ2VsbHMgPSByb3dzICogNztcblxuICAgIGNvbnN0IGdyaWQgPSBib2R5LmNyZWF0ZURpdih7IGNsczogXCJrdy1jYWwtZ3JpZFwiIH0pO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdG90YWxDZWxsczsgaSsrKSB7XG4gICAgICBjb25zdCBkYXlOdW0gPSBpIC0gb2Zmc2V0ICsgMTtcbiAgICAgIGNvbnN0IGNlbGxEYXRlID0gbmV3IERhdGUoeSwgbSwgZGF5TnVtKTtcbiAgICAgIGNvbnN0IGlzbyA9IGRhdGVTdHIoY2VsbERhdGUpO1xuICAgICAgY29uc3QgaXNDdXJNb250aCA9IGRheU51bSA+PSAxICYmIGRheU51bSA8PSBkYXlzSW5Nb250aDtcblxuICAgICAgY29uc3QgY2VsbCA9IGdyaWQuY3JlYXRlRGl2KHsgY2xzOiBcImt3LWNhbC1jZWxsXCIgfSk7XG4gICAgICBpZiAoIWlzQ3VyTW9udGgpIGNlbGwuYWRkQ2xhc3MoXCJpcy1vdGhlclwiKTtcbiAgICAgIGlmIChpc28gPT09IHRvZGF5KSBjZWxsLmFkZENsYXNzKFwiaXMtdG9kYXlcIik7XG4gICAgICBpZiAodGhpcy5zdGF0ZS5zZWxlY3RlZERhdGUgPT09IGlzbykgY2VsbC5hZGRDbGFzcyhcImlzLXNlbGVjdGVkXCIpO1xuXG4gICAgICBjZWxsLmNyZWF0ZVNwYW4oeyBjbHM6IFwia3ctY2FsLWRheVwiLCB0ZXh0OiBTdHJpbmcoY2VsbERhdGUuZ2V0RGF0ZSgpKSB9KTtcblxuICAgICAgY29uc3QgaXRlbXMgPSBpZHguZ2V0KGlzbyk7XG4gICAgICBpZiAoaXRlbXMgJiYgaXRlbXMubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCB1bmNoZWNrZWQgPSBpdGVtcy5maWx0ZXIoKHQpID0+ICF0LnBhcnNlZC5jaGVja2VkKS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGJhZGdlID0gY2VsbC5jcmVhdGVTcGFuKHsgY2xzOiBcImt3LWNhbC1iYWRnZVwiIH0pO1xuICAgICAgICBpZiAodW5jaGVja2VkID09PSAwKSB7XG4gICAgICAgICAgYmFkZ2UuYWRkQ2xhc3MoXCJpcy1kb25lXCIpO1xuICAgICAgICAgIGJhZGdlLnNldFRleHQoXCJcdTI3MTNcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGlzbyA8IHRvZGF5KSBiYWRnZS5hZGRDbGFzcyhcImlzLW92ZXJkdWVcIik7XG4gICAgICAgICAgYmFkZ2Uuc2V0VGV4dChTdHJpbmcodW5jaGVja2VkKSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5zZWxlY3RlZERhdGUgPT09IGlzbykge1xuICAgICAgICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWREYXRlID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnN0YXRlLnNlbGVjdGVkRGF0ZSA9IGlzbztcbiAgICAgICAgICAvLyBcdTcwQjlcdTUxRkJcdTk3NUVcdTVGNTNcdTY3MDhcdTY4M0MgXHUyMTkyIFx1OERGM1x1NTIzMFx1OEJFNVx1NjcwOFxuICAgICAgICAgIGlmICghaXNDdXJNb250aCkge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS5jYWxZZWFyID0gY2VsbERhdGUuZ2V0RnVsbFllYXIoKTtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuY2FsTW9udGggPSBjZWxsRGF0ZS5nZXRNb250aCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gXHU1QzU1XHU1RjAwXHU5NzYyXHU2NzdGXG4gICAgaWYgKHRoaXMuc3RhdGUuc2VsZWN0ZWREYXRlKSB7XG4gICAgICBsZXQgaXRlbXMgPSAoaWR4LmdldCh0aGlzLnN0YXRlLnNlbGVjdGVkRGF0ZSkgPz8gW10pLnNsaWNlKCk7XG4gICAgICBpZiAodGhpcy5wbHVnaW4uc2V0dGluZ3MuaGlkZUNvbXBsZXRlZCkge1xuICAgICAgICBpdGVtcyA9IGl0ZW1zLmZpbHRlcigodCkgPT4gIXQucGFyc2VkLmNoZWNrZWQpO1xuICAgICAgfVxuICAgICAgLy8gXHU2MzkyXHU1RThGXHVGRjFBXHU2NzJBXHU1QjhDXHU2MjEwXHU1NzI4XHU1MjREXHVGRjBDXHU1NDBDXHU3MkI2XHU2MDAxXHU2MzA5XHU4QkExXHU1MjEyK1x1ODg0Q1x1NTNGN1xuICAgICAgaXRlbXMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICBpZiAoYS5wYXJzZWQuY2hlY2tlZCAhPT0gYi5wYXJzZWQuY2hlY2tlZCkgcmV0dXJuIGEucGFyc2VkLmNoZWNrZWQgPyAxIDogLTE7XG4gICAgICAgIGNvbnN0IGMgPSBhLnBsYW5UaXRsZSA8IGIucGxhblRpdGxlID8gLTEgOiBhLnBsYW5UaXRsZSA+IGIucGxhblRpdGxlID8gMSA6IDA7XG4gICAgICAgIHJldHVybiBjICE9PSAwID8gYyA6IGEubGluZU51bWJlciAtIGIubGluZU51bWJlcjtcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBwYW5lbCA9IGJvZHkuY3JlYXRlRGl2KHsgY2xzOiBcImt3LWNhbC1kYXlwYW5lbFwiIH0pO1xuICAgICAgY29uc3QgcGggPSBwYW5lbC5jcmVhdGVEaXYoeyBjbHM6IFwia3ctY2FsLWRheXBhbmVsLWhlYWRcIiB9KTtcbiAgICAgIHBoLmNyZWF0ZVNwYW4oeyBjbHM6IFwia3ctY2FsLWRheXBhbmVsLWRhdGVcIiwgdGV4dDogdGhpcy5zdGF0ZS5zZWxlY3RlZERhdGUgfSk7XG4gICAgICBwaC5jcmVhdGVTcGFuKHsgY2xzOiBcImt3LWNhbC1kYXlwYW5lbC1jb3VudFwiLCB0ZXh0OiBgJHtpdGVtcy5sZW5ndGh9IFx1OTg3OWAgfSk7XG4gICAgICBpZiAoaXRlbXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHBhbmVsLmNyZWF0ZURpdih7IGNsczogXCJrdy1lbXB0eVwiLCB0ZXh0OiBcIlx1OEZEOVx1NEUwMFx1NTkyOVx1NkNBMVx1NjcwOVx1NEVGQlx1NTJBMVwiIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbGlzdCA9IHBhbmVsLmNyZWF0ZURpdih7IGNsczogXCJrdy10YXNrLWxpc3RcIiB9KTtcbiAgICAgICAgZm9yIChjb25zdCB0IG9mIGl0ZW1zKSB0aGlzLnJlbmRlclRhc2sobGlzdCwgdCwgXCJjYWxlbmRhclwiKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gXHU1REU1XHU1MTc3XHU1MUZEXHU2NTcwID09PT09PT09PT09PT09PT09PT09XG5cbmZ1bmN0aW9uIHltZChkOiBEYXRlKTogc3RyaW5nIHtcbiAgY29uc3QgcCA9IChuOiBudW1iZXIpID0+IG4udG9TdHJpbmcoKS5wYWRTdGFydCgyLCBcIjBcIik7XG4gIHJldHVybiBgJHtkLmdldEZ1bGxZZWFyKCl9LSR7cChkLmdldE1vbnRoKCkgKyAxKX0tJHtwKGQuZ2V0RGF0ZSgpKX1gO1xufVxuXG5mdW5jdGlvbiBhZGREYXlzKGQ6IERhdGUsIG46IG51bWJlcik6IERhdGUge1xuICBjb25zdCByID0gbmV3IERhdGUoZCk7XG4gIHIuc2V0RGF0ZShyLmdldERhdGUoKSArIG4pO1xuICByZXR1cm4gcjtcbn1cbiIsICJpbXBvcnQgeyBnZXRDb21wbGV0ZWQsIGdldER1ZSB9IGZyb20gXCIuL3BhcnNlclwiO1xuaW1wb3J0IHR5cGUgeyBQbGFuQmFzZSBhcyBQbGFuLCBUYXNrSXRlbSB9IGZyb20gXCIuL3R5cGVzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVmlld3BvcnRHcm91cCB7XG4gIGtleTogc3RyaW5nO1xuICBsYWJlbDogc3RyaW5nO1xuICAvKiogXHU2NDU4XHU4OTgxXHVGRjA4XHU1OTgyIFwiM1wiIFx1NjIxNiBcIjEvNVwiIFx1NzUyOFx1NEU4RVx1NTE2OFx1OTBFOFx1ODlDNlx1NTNFM1x1RkYwOSAqL1xuICBzdW1tYXJ5OiBzdHJpbmc7XG4gIHRhc2tzOiBUYXNrSXRlbVtdO1xuICAvKiogXHU5RUQ4XHU4QkE0XHU2NjJGXHU1NDI2XHU2Mjk4XHU1M0UwICovXG4gIGNvbGxhcHNlZDogYm9vbGVhbjtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gXHU2NUU1XHU2NzFGXHU1REU1XHU1MTc3XHVGRjA4XHU2NzJDXHU1NzMwXHU2NUY2XHU1MzNBXHVGRjA5ID09PT09PT09PT09PT09PT09PT09XG5cbmNvbnN0IHAyID0gKG46IG51bWJlcikgPT4gbi50b1N0cmluZygpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGRhdGVTdHIoZDogRGF0ZSk6IHN0cmluZyB7XG4gIHJldHVybiBgJHtkLmdldEZ1bGxZZWFyKCl9LSR7cDIoZC5nZXRNb250aCgpICsgMSl9LSR7cDIoZC5nZXREYXRlKCkpfWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGREYXlzKGJhc2U6IERhdGUsIG46IG51bWJlcik6IERhdGUge1xuICBjb25zdCBkID0gbmV3IERhdGUoYmFzZS5nZXRGdWxsWWVhcigpLCBiYXNlLmdldE1vbnRoKCksIGJhc2UuZ2V0RGF0ZSgpKTtcbiAgZC5zZXREYXRlKGQuZ2V0RGF0ZSgpICsgbik7XG4gIHJldHVybiBkO1xufVxuXG4vKiogXHU1NDY4XHU0RTAwXHU0RTNBXHU4RDc3XHU3MEI5XHU3Njg0IElTTyBcdTU0NjhcdTdGMTZcdTUzRjdcdUZGMDhcdTVFNzQtXHU1NDY4XHVGRjA5ICovXG5leHBvcnQgZnVuY3Rpb24gaXNvV2Vla0tleShkOiBEYXRlKTogc3RyaW5nIHtcbiAgLy8gXHU1OTBEXHU1MjM2XHU1RTc2XHU1RjUyXHU0RTAwXHU1MzE2XHU1MjMwXHU1RjUzXHU2NUU1IDAwOjAwIFVUQyBcdTRFRTVcdTkwN0ZcdTUxNERcdTU5MEZcdTRFRTRcdTY1RjZcbiAgY29uc3QgdG1wID0gbmV3IERhdGUoRGF0ZS5VVEMoZC5nZXRGdWxsWWVhcigpLCBkLmdldE1vbnRoKCksIGQuZ2V0RGF0ZSgpKSk7XG4gIGNvbnN0IGRheSA9IHRtcC5nZXRVVENEYXkoKSB8fCA3OyAvLyBcdTU0NjhcdTY1RTU9N1xuICB0bXAuc2V0VVRDRGF0ZSh0bXAuZ2V0VVRDRGF0ZSgpICsgNCAtIGRheSk7XG4gIGNvbnN0IHllYXJTdGFydCA9IG5ldyBEYXRlKERhdGUuVVRDKHRtcC5nZXRVVENGdWxsWWVhcigpLCAwLCAxKSk7XG4gIGNvbnN0IHdlZWtObyA9IE1hdGguY2VpbCgoKCh0bXAuZ2V0VGltZSgpIC0geWVhclN0YXJ0LmdldFRpbWUoKSkgLyA4NjQwMDAwMCkgKyAxKSAvIDcpO1xuICByZXR1cm4gYCR7dG1wLmdldFVUQ0Z1bGxZZWFyKCl9LVcke3AyKHdlZWtObyl9YDtcbn1cblxuZnVuY3Rpb24gd2Vla2RheUxhYmVsKGQ6IERhdGUpOiBzdHJpbmcge1xuICByZXR1cm4gW1wiXHU1NDY4XHU2NUU1XCIsIFwiXHU1NDY4XHU0RTAwXCIsIFwiXHU1NDY4XHU0RThDXCIsIFwiXHU1NDY4XHU0RTA5XCIsIFwiXHU1NDY4XHU1NkRCXCIsIFwiXHU1NDY4XHU0RTk0XCIsIFwiXHU1NDY4XHU1MTZEXCJdW2QuZ2V0RGF5KCldO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBcdTg5QzZcdTUzRTNcdTY3ODRcdTkwMjAgPT09PT09PT09PT09PT09PT09PT1cblxuLyoqXG4gKiBcdTRFQ0FcdTU5MjlcdTg5QzZcdTUzRTNcdUZGMUFcdThGQzdcdTY3MUZcdUZGMDhcdTdFQTJcdTY4MDdcdTdGNkVcdTk4NzZcdUZGMDkrIFx1NEVDQVx1NTkyOSArIFx1NjcyQVx1NjM5Mlx1NjcxRlx1RkYwOFx1NjI5OFx1NTNFMFx1RkYwOVxuICogXHU1M0VBXHU4MDVBXHU1NDA4IHN0YXR1cz1hY3RpdmUgXHU3Njg0XHU4QkExXHU1MjEyXHU2NTg3XHU0RUY2XHVGRjBDXHU1M0VBXHU2NjNFXHU3OTNBXHU2NzJBXHU1QjhDXHU2MjEwXHU0RUZCXHU1MkExXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFRvZGF5R3JvdXBzKHBsYW5zOiBQbGFuW10sIHRvZGF5OiBzdHJpbmcpOiBWaWV3cG9ydEdyb3VwW10ge1xuICBjb25zdCBvdmVyZHVlOiBUYXNrSXRlbVtdID0gW107XG4gIGNvbnN0IHRvZGF5SXRlbXM6IFRhc2tJdGVtW10gPSBbXTtcbiAgY29uc3QgdW5zY2hlZHVsZWQ6IFRhc2tJdGVtW10gPSBbXTtcblxuICBmb3IgKGNvbnN0IHAgb2YgcGxhbnMpIHtcbiAgICBpZiAocC5zdGF0dXMgIT09IFwiYWN0aXZlXCIpIGNvbnRpbnVlO1xuICAgIGZvciAoY29uc3QgdCBvZiBwLnRhc2tzKSB7XG4gICAgICBpZiAodC5wYXJzZWQuY2hlY2tlZCkgY29udGludWU7XG4gICAgICBjb25zdCBkdWUgPSBnZXREdWUodC5wYXJzZWQpO1xuICAgICAgaWYgKCFkdWUpIHtcbiAgICAgICAgdW5zY2hlZHVsZWQucHVzaCh0KTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBpZiAoZHVlIDwgdG9kYXkpIG92ZXJkdWUucHVzaCh0KTtcbiAgICAgIGVsc2UgaWYgKGR1ZSA9PT0gdG9kYXkpIHRvZGF5SXRlbXMucHVzaCh0KTtcbiAgICAgIC8vIGR1ZSA+IHRvZGF5XHVGRjFBXHU0RTBEXHU4RkRCXHUzMDBDXHU0RUNBXHU1OTI5XHUzMDBEXHU4OUM2XHU1M0UzXG4gICAgfVxuICB9XG5cbiAgLy8gXHU2MzkyXHU1RThGXHVGRjFBXHU4RkM3XHU2NzFGXHU2MzA5IGR1ZSBcdTUzNDdcdTVFOEZcdUZGMDhcdThEOEFcdTY1RTdcdThEOEFcdTk3NjBcdTUyNERcdUZGMDlcdUZGMENcdTRFQ0FcdTU5MjlcdTYzMDkgcGxhbit0ZXh0IFx1N0EzM1x1NUI5QVx1OTg3QVx1NUU4RlxuICBvdmVyZHVlLnNvcnQoKGEsIGIpID0+IGNtcFN0cihnZXREdWUoYS5wYXJzZWQpISwgZ2V0RHVlKGIucGFyc2VkKSEpKTtcblxuICBjb25zdCBncm91cHM6IFZpZXdwb3J0R3JvdXBbXSA9IFtdO1xuICBpZiAob3ZlcmR1ZS5sZW5ndGggPiAwKSB7XG4gICAgZ3JvdXBzLnB1c2goe1xuICAgICAga2V5OiBcIm92ZXJkdWVcIixcbiAgICAgIGxhYmVsOiBcIlx1OEZDN1x1NjcxRlwiLFxuICAgICAgc3VtbWFyeTogU3RyaW5nKG92ZXJkdWUubGVuZ3RoKSxcbiAgICAgIHRhc2tzOiBvdmVyZHVlLFxuICAgICAgY29sbGFwc2VkOiBmYWxzZSxcbiAgICB9KTtcbiAgfVxuICBncm91cHMucHVzaCh7XG4gICAga2V5OiBcInRvZGF5XCIsXG4gICAgbGFiZWw6IFwiXHU0RUNBXHU1OTI5XCIsXG4gICAgc3VtbWFyeTogU3RyaW5nKHRvZGF5SXRlbXMubGVuZ3RoKSxcbiAgICB0YXNrczogdG9kYXlJdGVtcyxcbiAgICBjb2xsYXBzZWQ6IGZhbHNlLFxuICB9KTtcbiAgaWYgKHVuc2NoZWR1bGVkLmxlbmd0aCA+IDApIHtcbiAgICBncm91cHMucHVzaCh7XG4gICAgICBrZXk6IFwidW5zY2hlZHVsZWRcIixcbiAgICAgIGxhYmVsOiBcIlx1NjcyQVx1NjM5Mlx1NjcxRlwiLFxuICAgICAgc3VtbWFyeTogU3RyaW5nKHVuc2NoZWR1bGVkLmxlbmd0aCksXG4gICAgICB0YXNrczogdW5zY2hlZHVsZWQsXG4gICAgICBjb2xsYXBzZWQ6IHRydWUsIC8vIFx1OUVEOFx1OEJBNFx1NjI5OFx1NTNFMFx1RkYwQ1x1OTYzMlx1OUVEMVx1NkQxRVxuICAgIH0pO1xuICB9XG4gIHJldHVybiBncm91cHM7XG59XG5cbi8qKlxuICogXHU4QkExXHU1MjEyXHU4OUM2XHU1M0UzXHVGRjFBXHU2NzJBXHU2NzY1IDcgXHU1OTI5XHU2MzA5XHU2NUU1ICsgXHU0RTRCXHU1NDBFXHU2MzA5IElTTyBcdTU0NjhcdTgwNUFcdTU0MDhcdTMwMDJcbiAqIFx1NTNFQVx1ODA1QVx1NTQwOCBzdGF0dXM9YWN0aXZlXHVGRjBDXHU1M0VBXHU2NzJBXHU1QjhDXHU2MjEwXHVGRjBDXHU1NDJCIGR1ZSBcdTc2ODRcdTRFRkJcdTUyQTFcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkVXBjb21pbmdHcm91cHMocGxhbnM6IFBsYW5bXSwgdG9kYXlEYXRlOiBEYXRlKTogVmlld3BvcnRHcm91cFtdIHtcbiAgY29uc3QgdG9kYXkgPSBkYXRlU3RyKHRvZGF5RGF0ZSk7XG4gIGNvbnN0IGRheUxpbWl0ID0gZGF0ZVN0cihhZGREYXlzKHRvZGF5RGF0ZSwgNykpOyAvLyBcdTY2MEVcdTU5MjkrNlx1NTkyOVx1RkYwQ1x1NTE3MSA3IFx1NTkyOVxuXG4gIGNvbnN0IHBlckRheSA9IG5ldyBNYXA8c3RyaW5nLCBUYXNrSXRlbVtdPigpO1xuICBjb25zdCBwZXJXZWVrID0gbmV3IE1hcDxzdHJpbmcsIFRhc2tJdGVtW10+KCk7XG5cbiAgZm9yIChjb25zdCBwIG9mIHBsYW5zKSB7XG4gICAgaWYgKHAuc3RhdHVzICE9PSBcImFjdGl2ZVwiKSBjb250aW51ZTtcbiAgICBmb3IgKGNvbnN0IHQgb2YgcC50YXNrcykge1xuICAgICAgaWYgKHQucGFyc2VkLmNoZWNrZWQpIGNvbnRpbnVlO1xuICAgICAgY29uc3QgZHVlID0gZ2V0RHVlKHQucGFyc2VkKTtcbiAgICAgIGlmICghZHVlKSBjb250aW51ZTtcbiAgICAgIGlmIChkdWUgPD0gdG9kYXkpIGNvbnRpbnVlOyAvLyBcdThGQzdcdTY3MUYvXHU0RUNBXHU1OTI5XHU0RTBEXHU4RkRCXHU2QjY0XHU4OUM2XHU1M0UzXG4gICAgICBpZiAoZHVlIDw9IGRheUxpbWl0KSB7XG4gICAgICAgIHB1c2hNYXAocGVyRGF5LCBkdWUsIHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgd2sgPSBpc29XZWVrS2V5KHBhcnNlRGF0ZShkdWUpKTtcbiAgICAgICAgcHVzaE1hcChwZXJXZWVrLCB3aywgdCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29uc3QgZ3JvdXBzOiBWaWV3cG9ydEdyb3VwW10gPSBbXTtcblxuICAvLyBcdTYzMDlcdTY1RTVcdUZGMUFcdTY2MEVcdTU5MjlcdTVGMDBcdTU5Q0JcbiAgZm9yIChsZXQgaSA9IDE7IGkgPD0gNzsgaSsrKSB7XG4gICAgY29uc3QgZCA9IGFkZERheXModG9kYXlEYXRlLCBpKTtcbiAgICBjb25zdCBrZXkgPSBkYXRlU3RyKGQpO1xuICAgIGNvbnN0IGl0ZW1zID0gcGVyRGF5LmdldChrZXkpO1xuICAgIGlmICghaXRlbXMgfHwgaXRlbXMubGVuZ3RoID09PSAwKSBjb250aW51ZTtcbiAgICBpdGVtcy5zb3J0KChhLCBiKSA9PiBjbXBUYXNrSW5Hcm91cChhLCBiKSk7XG4gICAgY29uc3QgbGFiZWwgPSBpID09PSAxID8gYFx1NjYwRVx1NTkyOSBcdTAwQjcgJHtrZXl9YCA6IGAke2tleX0gXHUwMEI3ICR7d2Vla2RheUxhYmVsKGQpfWA7XG4gICAgZ3JvdXBzLnB1c2goe1xuICAgICAga2V5OiBgZGF5LSR7a2V5fWAsXG4gICAgICBsYWJlbCxcbiAgICAgIHN1bW1hcnk6IFN0cmluZyhpdGVtcy5sZW5ndGgpLFxuICAgICAgdGFza3M6IGl0ZW1zLFxuICAgICAgY29sbGFwc2VkOiBmYWxzZSxcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFx1NjMwOVx1NTQ2OFxuICBjb25zdCB3ZWVrS2V5cyA9IFsuLi5wZXJXZWVrLmtleXMoKV0uc29ydCgpO1xuICBmb3IgKGNvbnN0IHdrIG9mIHdlZWtLZXlzKSB7XG4gICAgY29uc3QgaXRlbXMgPSBwZXJXZWVrLmdldCh3aykhO1xuICAgIGl0ZW1zLnNvcnQoKGEsIGIpID0+IGNtcFN0cihnZXREdWUoYS5wYXJzZWQpISwgZ2V0RHVlKGIucGFyc2VkKSEpKTtcbiAgICBncm91cHMucHVzaCh7XG4gICAgICBrZXk6IGB3ZWVrLSR7d2t9YCxcbiAgICAgIGxhYmVsOiBgXHU3QjJDICR7d2t9IFx1NTQ2OGAsXG4gICAgICBzdW1tYXJ5OiBTdHJpbmcoaXRlbXMubGVuZ3RoKSxcbiAgICAgIHRhc2tzOiBpdGVtcyxcbiAgICAgIGNvbGxhcHNlZDogZmFsc2UsXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gZ3JvdXBzO1xufVxuXG4vKipcbiAqIFx1NTE2OFx1OTBFOFx1ODlDNlx1NTNFM1x1RkYxQVx1NjMwOVx1OEJBMVx1NTIxMlx1NjU4N1x1NEVGNlx1NTIwNlx1N0VDNFx1RkYwQ1x1NTQyQlx1NURGMlx1NUI4Q1x1NjIxMFx1RkYwOFx1NTQwNFx1N0VDNFx1NTE4NVx1NjI5OFx1NTNFMFx1NTNFRlx1OTAwOVx1RkYwQ1x1NkI2NFx1NTkwNFx1NEVBNFx1N0VEOSBVSVx1RkYwOVx1MzAwMlxuICogXHU1REYyXHU1RjUyXHU2ODYzL1x1NURGMlx1NUI4Q1x1NjIxMFx1NzY4NFx1OEJBMVx1NTIxMlx1NjU4N1x1NEVGNlx1NEVDRFx1NjYzRVx1NzkzQVx1NEY0Nlx1N0VDNFx1NjgwN1x1OTg5OFx1NUUyNlx1NzJCNlx1NjAwMVx1NjgwN1x1OEJCMFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRBbGxHcm91cHMocGxhbnM6IFBsYW5bXSk6IFZpZXdwb3J0R3JvdXBbXSB7XG4gIGNvbnN0IGdyb3VwczogVmlld3BvcnRHcm91cFtdID0gW107XG4gIGZvciAoY29uc3QgcCBvZiBwbGFucykge1xuICAgIGNvbnN0IHVuY2hlY2tlZCA9IHAudGFza3MuZmlsdGVyKCh0KSA9PiAhdC5wYXJzZWQuY2hlY2tlZCkubGVuZ3RoO1xuICAgIGNvbnN0IHRvdGFsID0gcC50YXNrcy5sZW5ndGg7XG4gICAgY29uc3Qgc3VmZml4ID0gcC5zdGF0dXMgPT09IFwiYWN0aXZlXCIgPyBcIlwiIDogYCBbJHtwLnN0YXR1c31dYDtcbiAgICBncm91cHMucHVzaCh7XG4gICAgICBrZXk6IGBwbGFuLSR7cC5wYXRofWAsXG4gICAgICBsYWJlbDogYCR7cC50aXRsZX0ke3N1ZmZpeH1gLFxuICAgICAgc3VtbWFyeTogYCR7dW5jaGVja2VkfS8ke3RvdGFsfWAsXG4gICAgICB0YXNrczogcC50YXNrcyxcbiAgICAgIGNvbGxhcHNlZDogcC5zdGF0dXMgIT09IFwiYWN0aXZlXCIsIC8vIFx1OTc1RSBhY3RpdmUgXHU5RUQ4XHU4QkE0XHU2Mjk4XHU1M0UwXG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIGdyb3Vwcztcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gXHU1REU1XHU1MTc3ID09PT09PT09PT09PT09PT09PT09XG5cbmZ1bmN0aW9uIGNtcFN0cihhOiBzdHJpbmcsIGI6IHN0cmluZyk6IG51bWJlciB7XG4gIHJldHVybiBhIDwgYiA/IC0xIDogYSA+IGIgPyAxIDogMDtcbn1cblxuZnVuY3Rpb24gY21wVGFza0luR3JvdXAoYTogVGFza0l0ZW0sIGI6IFRhc2tJdGVtKTogbnVtYmVyIHtcbiAgLy8gXHU3RUM0XHU1MTg1XHU2MzA5XHU4QkExXHU1MjEyXHU1NDBEICsgXHU4ODRDXHU1M0Y3XHU3QTMzXHU1QjlBXHU2MzkyXHU1RThGXG4gIGNvbnN0IGMgPSBjbXBTdHIoYS5wbGFuVGl0bGUsIGIucGxhblRpdGxlKTtcbiAgcmV0dXJuIGMgIT09IDAgPyBjIDogYS5saW5lTnVtYmVyIC0gYi5saW5lTnVtYmVyO1xufVxuXG5mdW5jdGlvbiBwdXNoTWFwPFQ+KG06IE1hcDxzdHJpbmcsIFRbXT4sIGs6IHN0cmluZywgdjogVCk6IHZvaWQge1xuICBjb25zdCBhcnIgPSBtLmdldChrKTtcbiAgaWYgKGFycikgYXJyLnB1c2godik7XG4gIGVsc2UgbS5zZXQoaywgW3ZdKTtcbn1cblxuZnVuY3Rpb24gcGFyc2VEYXRlKHM6IHN0cmluZyk6IERhdGUge1xuICBjb25zdCBbeSwgbW8sIGRdID0gcy5zcGxpdChcIi1cIikubWFwKCh4KSA9PiBwYXJzZUludCh4LCAxMCkpO1xuICByZXR1cm4gbmV3IERhdGUoeSwgbW8gLSAxLCBkKTtcbn1cbiIsICJpbXBvcnQgeyBBcHAsIFBsdWdpblNldHRpbmdUYWIsIFNldHRpbmcgfSBmcm9tIFwib2JzaWRpYW5cIjtcbmltcG9ydCB0eXBlIFdvcmtiZW5jaFBsdWdpbiBmcm9tIFwiLi9tYWluXCI7XG5cbmV4cG9ydCB0eXBlIERlZmF1bHRWaWV3cG9ydCA9IFwidG9kYXlcIiB8IFwidXBjb21pbmdcIiB8IFwiYWxsXCIgfCBcImNhbGVuZGFyXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2JlbmNoU2V0dGluZ3Mge1xuICBkZWZhdWx0Vmlld3BvcnQ6IERlZmF1bHRWaWV3cG9ydDtcbiAgLyoqIFx1MzAwQ1x1NTE2OFx1OTBFOFx1MzAwRFx1ODlDNlx1NTNFM1x1NEUwRVx1NjVFNVx1NTM4Nlx1NjVFNVx1OTc2Mlx1Njc3Rlx1NjYyRlx1NTQyNlx1OTY5MFx1ODVDRlx1NURGMlx1NUI4Q1x1NjIxMFx1NEVGQlx1NTJBMSAqL1xuICBoaWRlQ29tcGxldGVkOiBib29sZWFuO1xuICAvKiogXHU3N0U5XHU5NjM1XHU1MzNBXHU5ODc2XHU5MEU4IHBpbiBcdTc2ODRcdTY1ODdcdTRFRjZcdTdFRERcdTVCRjlcdThERUZcdTVGODRcdTUyMTdcdTg4NjhcdUZGMDh2YXVsdCBcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdUZGMDlcdUZGMENcdTk4N0FcdTVFOEZcdTUzNzNcdTY2M0VcdTc5M0FcdTk4N0FcdTVFOEYgKi9cbiAgcGlubmVkRmlsZXM6IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9TRVRUSU5HUzogV29ya2JlbmNoU2V0dGluZ3MgPSB7XG4gIGRlZmF1bHRWaWV3cG9ydDogXCJ0b2RheVwiLFxuICBoaWRlQ29tcGxldGVkOiBmYWxzZSxcbiAgcGlubmVkRmlsZXM6IFtdLFxufTtcblxuZXhwb3J0IGNsYXNzIFdvcmtiZW5jaFNldHRpbmdUYWIgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcbiAgcHJpdmF0ZSByZWFkb25seSBwbHVnaW46IFdvcmtiZW5jaFBsdWdpbjtcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBXb3JrYmVuY2hQbHVnaW4pIHtcbiAgICBzdXBlcihhcHAsIHBsdWdpbik7XG4gICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XG4gIH1cblxuICBkaXNwbGF5KCk6IHZvaWQge1xuICAgIGNvbnN0IHsgY29udGFpbmVyRWwgfSA9IHRoaXM7XG4gICAgY29udGFpbmVyRWwuZW1wdHkoKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoXCJcdTlFRDhcdThCQTRcdTg5QzZcdTUzRTNcIilcbiAgICAgIC5zZXREZXNjKFwiXHU2MjUzXHU1RjAwXHU1REU1XHU0RjVDXHU1M0YwXHU2NUY2XHVGRjBDXHU0RUZCXHU1MkExXHU5NzYyXHU2NzdGXHU1MjFEXHU1OUNCXHU2NjNFXHU3OTNBXHU3Njg0XHU4OUM2XHU1M0UzXCIpXG4gICAgICAuYWRkRHJvcGRvd24oKGRkKSA9PlxuICAgICAgICBkZFxuICAgICAgICAgIC5hZGRPcHRpb24oXCJ0b2RheVwiLCBcIlx1NEVDQVx1NTkyOVwiKVxuICAgICAgICAgIC5hZGRPcHRpb24oXCJ1cGNvbWluZ1wiLCBcIlx1OEJBMVx1NTIxMlwiKVxuICAgICAgICAgIC5hZGRPcHRpb24oXCJhbGxcIiwgXCJcdTUxNjhcdTkwRThcIilcbiAgICAgICAgICAuYWRkT3B0aW9uKFwiY2FsZW5kYXJcIiwgXCJcdTY1RTVcdTUzODZcIilcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVmYXVsdFZpZXdwb3J0KVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodikgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVmYXVsdFZpZXdwb3J0ID0gdiBhcyBEZWZhdWx0Vmlld3BvcnQ7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KSxcbiAgICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKFwiXHU5NjkwXHU4NUNGXHU1REYyXHU1QjhDXHU2MjEwXHU0RUZCXHU1MkExXCIpXG4gICAgICAuc2V0RGVzYyhcIlx1NTcyOFx1MzAwQ1x1NTE2OFx1OTBFOFx1MzAwRFx1ODlDNlx1NTNFM1x1NEUwRVx1NjVFNVx1NTM4Nlx1NjVFNVx1OTc2Mlx1Njc3Rlx1NEUyRFx1NEUwRFx1NjYzRVx1NzkzQVx1NURGMiBcdTI3MDUgXHU3Njg0XHU0RUZCXHU1MkExXHVGRjFCXHU0RUNBXHU1OTI5L1x1OEJBMVx1NTIxMlx1ODlDNlx1NTNFM1x1NjcyQ1x1NUMzMVx1NEUwRFx1NTQyQlx1NURGMlx1NUI4Q1x1NjIxMFx1RkYwQ1x1NEUwRFx1NTNEN1x1NUY3MVx1NTRDRFwiKVxuICAgICAgLmFkZFRvZ2dsZSgodGcpID0+XG4gICAgICAgIHRnLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmhpZGVDb21wbGV0ZWQpLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7XG4gICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuaGlkZUNvbXBsZXRlZCA9IHY7XG4gICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgdGhpcy5wbHVnaW4ucmVmcmVzaFRhc2tzKCk7XG4gICAgICAgIH0pLFxuICAgICAgKTtcbiAgfVxufVxuIiwgImltcG9ydCB7IEFwcCwgTm90aWNlIH0gZnJvbSBcIm9ic2lkaWFuXCI7XG5pbXBvcnQgeyBjb2xsZWN0V2lraUZpbGVzLCBhZ2dyZWdhdGVXaWtpTWF0cml4LCBhZ2dyZWdhdGVEaXJUcmVlIH0gZnJvbSBcIi4vbWF0cml4L3Byb3ZpZGVyc1wiO1xuaW1wb3J0IHsgbG9hZFBsYW5zIH0gZnJvbSBcIi4vdGFza3MvcGxhblwiO1xuaW1wb3J0IHsgYnVpbGRUb2RheUdyb3VwcywgYnVpbGRVcGNvbWluZ0dyb3VwcywgYnVpbGRBbGxHcm91cHMgfSBmcm9tIFwiLi90YXNrcy9ncm91cHNcIjtcbmltcG9ydCB7IHRvZGF5RGF0ZVN0ciB9IGZyb20gXCIuL3V0aWxcIjtcblxuaW50ZXJmYWNlIFNhbXBsZSB7XG4gIGxhYmVsOiBzdHJpbmc7XG4gIG1zOiBudW1iZXI7XG4gIGNvdW50PzogbnVtYmVyO1xufVxuXG4vKiogXHU5MUM3XHU2ODM3XHU0RTAwXHU2QjIxXHU1MTY4XHU1RTkzXHU5MDREXHU1Mzg2XHU1NDA0XHU5NjM2XHU2QkI1XHU4MDE3XHU2NUY2XHVGRjBDXHU3NTI4XHU0RThFXHU5QThDXHU2NTM2IFNQRUMgXHUzMDBDXHU1MTY4XHU1RTkzIDwxMDBtc1x1MzAwRCAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhbXBsZVBlcmZvcm1hbmNlKGFwcDogQXBwKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IHNhbXBsZXM6IFNhbXBsZVtdID0gW107XG5cbiAgY29uc3QgdDAgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgY29uc3Qgd2lraSA9IGNvbGxlY3RXaWtpRmlsZXMoYXBwKTtcbiAgc2FtcGxlcy5wdXNoKHsgbGFiZWw6IFwiY29sbGVjdFdpa2lGaWxlc1wiLCBtczogcGVyZm9ybWFuY2Uubm93KCkgLSB0MCwgY291bnQ6IHdpa2kubGVuZ3RoIH0pO1xuXG4gIGNvbnN0IHQxID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gIGNvbnN0IG1hdHJpeCA9IGFnZ3JlZ2F0ZVdpa2lNYXRyaXgod2lraSk7XG4gIHNhbXBsZXMucHVzaCh7IGxhYmVsOiBcImFnZ3JlZ2F0ZVdpa2lNYXRyaXhcIiwgbXM6IHBlcmZvcm1hbmNlLm5vdygpIC0gdDEsIGNvdW50OiBtYXRyaXguY2VsbHMuc2l6ZSB9KTtcblxuICBjb25zdCBhbGxGaWxlcyA9IGFwcC52YXVsdC5nZXRGaWxlcygpO1xuICBjb25zdCB0MiA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICBjb25zdCByYXdDZWxscyA9IGFnZ3JlZ2F0ZURpclRyZWUoYWxsRmlsZXMsIFwicmF3XCIpO1xuICBzYW1wbGVzLnB1c2goeyBsYWJlbDogXCJhZ2dyZWdhdGVEaXJUcmVlKHJhdylcIiwgbXM6IHBlcmZvcm1hbmNlLm5vdygpIC0gdDIsIGNvdW50OiByYXdDZWxscy5sZW5ndGggfSk7XG5cbiAgY29uc3QgdDMgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgY29uc3Qgb3V0Q2VsbHMgPSBhZ2dyZWdhdGVEaXJUcmVlKGFsbEZpbGVzLCBcIm91dHB1dFwiKTtcbiAgc2FtcGxlcy5wdXNoKHsgbGFiZWw6IFwiYWdncmVnYXRlRGlyVHJlZShvdXRwdXQpXCIsIG1zOiBwZXJmb3JtYW5jZS5ub3coKSAtIHQzLCBjb3VudDogb3V0Q2VsbHMubGVuZ3RoIH0pO1xuXG4gIGNvbnN0IHQ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gIGNvbnN0IHBsYW5zID0gYXdhaXQgbG9hZFBsYW5zKGFwcCk7XG4gIGNvbnN0IHBsYW5UYXNrQ291bnQgPSBwbGFucy5yZWR1Y2UoKHMsIHApID0+IHMgKyBwLnRhc2tzLmxlbmd0aCwgMCk7XG4gIHNhbXBsZXMucHVzaCh7IGxhYmVsOiBcImxvYWRQbGFuc1wiLCBtczogcGVyZm9ybWFuY2Uubm93KCkgLSB0NCwgY291bnQ6IHBsYW5UYXNrQ291bnQgfSk7XG5cbiAgY29uc3QgdG9kYXkgPSB0b2RheURhdGVTdHIoKTtcbiAgY29uc3QgdDUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgYnVpbGRUb2RheUdyb3VwcyhwbGFucywgdG9kYXkpO1xuICBidWlsZFVwY29taW5nR3JvdXBzKHBsYW5zLCBuZXcgRGF0ZSgpKTtcbiAgYnVpbGRBbGxHcm91cHMocGxhbnMpO1xuICBzYW1wbGVzLnB1c2goeyBsYWJlbDogXCIzIFx1ODlDNlx1NTNFMyBidWlsZFwiLCBtczogcGVyZm9ybWFuY2Uubm93KCkgLSB0NSB9KTtcblxuICBjb25zdCB0b3RhbCA9IHNhbXBsZXMucmVkdWNlKChzLCB4KSA9PiBzICsgeC5tcywgMCk7XG4gIGNvbnN0IGRldGFpbCA9IHNhbXBsZXNcbiAgICAubWFwKChzKSA9PiBgJHtzLmxhYmVsfTogJHtzLm1zLnRvRml4ZWQoMSl9bXMke3MuY291bnQgIT09IHVuZGVmaW5lZCA/IGAgKCR7cy5jb3VudH0pYCA6IFwiXCJ9YClcbiAgICAuam9pbihcIlxcblwiKTtcbiAgY29uc3QgdmVyZGljdCA9IHRvdGFsIDwgMTAwID8gXCJcdTI3MDUgXHU4RkJFXHU2ODA3XCIgOiBcIlx1MjZBMFx1RkUwRiBcdThEODVcdTk2MDhcdTUwM0NcIjtcbiAgY29uc3QgbXNnID0gYCR7dmVyZGljdH0gXHU1MTY4XHU1RTkzXHU5MDREXHU1Mzg2XHU1NDA4XHU4QkExICR7dG90YWwudG9GaXhlZCgxKX1tc1x1RkYwOFx1OTYwOFx1NTAzQyAxMDBtc1x1RkYwOVxcblxcbiR7ZGV0YWlsfWA7XG4gIG5ldyBOb3RpY2UobXNnLCAxMjAwMCk7XG4gIGNvbnNvbGUubG9nKFwiW2tub3dsZWRnZS13b3JrYmVuY2hdIFwiICsgbXNnKTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBQUFBLG9CQUF1Qjs7O0FDQXZCLElBQUFDLG9CQUE4RDs7O0FDQTlELHNCQUFrRTs7O0FDQWxFLElBQU0sS0FBSyxDQUFDLE1BQWMsRUFBRSxTQUFTLEVBQUUsU0FBUyxHQUFHLEdBQUc7QUFHL0MsU0FBUyxhQUFhLElBQVUsb0JBQUksS0FBSyxHQUFXO0FBQ3pELFNBQU8sR0FBRyxFQUFFLFlBQVksQ0FBQyxJQUFJLEdBQUcsRUFBRSxTQUFTLElBQUksQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ3RFO0FBR08sU0FBUyxXQUFXLElBQVUsb0JBQUksS0FBSyxHQUFXO0FBQ3ZELFNBQU8sR0FBRyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUMsSUFBSSxHQUFHLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDbEQ7OztBQ0FBLElBQU0sV0FBVztBQUVWLFNBQVMsZUFBZSxNQUFpQztBQUM5RCxRQUFNLElBQUksU0FBUyxLQUFLLElBQUk7QUFDNUIsU0FBTyxJQUFJLEVBQUUsTUFBTSxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLElBQUk7QUFDMUM7QUFFTyxTQUFTLGtCQUFrQixTQUErQjtBQUMvRCxRQUFNLE1BQW9CLENBQUM7QUFDM0IsYUFBVyxRQUFRLFFBQVEsTUFBTSxPQUFPLEdBQUc7QUFDekMsVUFBTSxJQUFJLGVBQWUsSUFBSTtBQUM3QixRQUFJLEVBQUcsS0FBSSxLQUFLLENBQUM7QUFBQSxFQUNuQjtBQUNBLFNBQU87QUFDVDtBQUdPLFNBQVMsZUFBZSxNQUFjLE1BQXNCO0FBQ2pFLFFBQU0sUUFBUSxLQUFLLE1BQU0sT0FBTztBQUNoQyxRQUFNLFFBQVEsTUFBTSxNQUFNLEtBQUs7QUFDL0IsUUFBTSxPQUFPLE1BQU0sSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsRUFBRSxLQUFLLElBQUk7QUFDakQsU0FBTyxPQUFPLE9BQU8sSUFBSSxNQUFNLEtBQUs7QUFBQSxFQUFLLElBQUksS0FBSyxPQUFPLElBQUksTUFBTSxLQUFLO0FBQzFFOzs7QUYxQkEsSUFBTSxZQUFZO0FBR1gsU0FBUyxpQkFBeUI7QUFDdkMsYUFBTywrQkFBYyxHQUFHLFNBQVMsSUFBSSxhQUFhLENBQUMsS0FBSztBQUMxRDtBQVFBLGVBQXNCLFlBQVksS0FBVSxNQUErQjtBQUV6RSxRQUFNLGFBQWEsS0FBSyxRQUFRLFVBQVUsSUFBSSxFQUFFLFFBQVEsV0FBVyxFQUFFO0FBQ3JFLFFBQU0sVUFBVSxXQUFXLEtBQUs7QUFDaEMsTUFBSSxDQUFDLFFBQVMsT0FBTSxJQUFJLE1BQU0sMEJBQU07QUFDcEMsUUFBTSxXQUFXLFFBQVEsUUFBUSxPQUFPLE1BQU07QUFFOUMsUUFBTSxPQUFPLGVBQWU7QUFDNUIsTUFBSSxDQUFDLEtBQUssV0FBVyxRQUFRLEVBQUcsT0FBTSxJQUFJLE1BQU0scURBQWtCLElBQUksRUFBRTtBQUV4RSxRQUFNLGFBQWEsS0FBSyxTQUFTO0FBRWpDLFFBQU0sUUFBUSxlQUFlLFdBQVcsR0FBRyxRQUFRO0FBQ25ELFFBQU0sV0FBVyxJQUFJLE1BQU0sc0JBQXNCLElBQUk7QUFFckQsTUFBSSxFQUFFLG9CQUFvQix3QkFBUTtBQUNoQyxVQUFNLFNBQ0o7QUFBQTtBQUFBLFFBRVMsYUFBYSxDQUFDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUd6QixVQUFNLElBQUksTUFBTSxPQUFPLE1BQU0sU0FBUyxRQUFRLElBQUk7QUFBQSxFQUNwRCxPQUFPO0FBQ0wsVUFBTSxJQUFJLE1BQU0sUUFBUSxVQUFVLENBQUMsU0FBUztBQUMxQyxZQUFNLFVBQVUsS0FBSyxTQUFTLEtBQUssQ0FBQyxLQUFLLFNBQVMsSUFBSTtBQUN0RCxhQUFPLFFBQVEsVUFBVSxPQUFPLE1BQU0sUUFBUTtBQUFBLElBQ2hELENBQUM7QUFBQSxFQUNIO0FBQ0EsU0FBTztBQUNUO0FBR0EsZUFBc0IsZ0JBQWdCLEtBQWlDO0FBQ3JFLFFBQU0sT0FBTyxlQUFlO0FBQzVCLFFBQU0sT0FBTyxJQUFJLE1BQU0sc0JBQXNCLElBQUk7QUFDakQsTUFBSSxFQUFFLGdCQUFnQix1QkFBUSxRQUFPLENBQUM7QUFDdEMsUUFBTSxVQUFVLE1BQU0sSUFBSSxNQUFNLFdBQVcsSUFBSTtBQUMvQyxTQUFPLGtCQUFrQixPQUFPO0FBQ2xDO0FBRUEsZUFBZSxhQUFhLEtBQVUsUUFBK0I7QUFDbkUsUUFBTSxXQUFXLElBQUksTUFBTSxzQkFBc0IsTUFBTTtBQUN2RCxNQUFJLG9CQUFvQix3QkFBUztBQUNqQyxNQUFJLFNBQVUsT0FBTSxJQUFJLE1BQU0sMkVBQWUsTUFBTSxFQUFFO0FBQ3JELFFBQU0sUUFBUSxPQUFPLE1BQU0sR0FBRztBQUM5QixNQUFJLE1BQU07QUFDVixhQUFXLEtBQUssT0FBTztBQUNyQixVQUFNLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLO0FBQzVCLFFBQUksQ0FBQyxJQUFJLE1BQU0sc0JBQXNCLEdBQUcsR0FBRztBQUN6QyxZQUFNLElBQUksTUFBTSxhQUFhLEdBQUc7QUFBQSxJQUNsQztBQUFBLEVBQ0Y7QUFDRjtBQUdPLElBQU0sYUFBTixjQUF5QixzQkFBTTtBQUFBLEVBR3BDLFlBQVksS0FBVSxVQUFrRDtBQUN0RSxVQUFNLEdBQUc7QUFDVCxTQUFLLFdBQVc7QUFBQSxFQUNsQjtBQUFBLEVBRUEsU0FBUztBQUNQLFVBQU0sRUFBRSxXQUFXLFFBQVEsSUFBSTtBQUMvQixZQUFRLFFBQVEsMkJBQU87QUFFdkIsVUFBTSxRQUFRLFVBQVUsU0FBUyxTQUFTO0FBQUEsTUFDeEMsS0FBSztBQUFBLE1BQ0wsTUFBTSxFQUFFLE1BQU0sUUFBUSxhQUFhLDJGQUEwQjtBQUFBLElBQy9ELENBQUM7QUFDRCxVQUFNLE1BQU07QUFFWixVQUFNLGlCQUFpQixXQUFXLE9BQU8sTUFBTTtBQUM3QyxVQUFJLEVBQUUsUUFBUSxTQUFTO0FBQ3JCLFVBQUUsZUFBZTtBQUNqQixjQUFNLElBQUksTUFBTSxNQUFNLEtBQUs7QUFDM0IsWUFBSSxDQUFDLEVBQUc7QUFDUixZQUFJO0FBQ0YsZ0JBQU0sS0FBSyxTQUFTLENBQUM7QUFDckIsY0FBSSx1QkFBTyx3REFBVztBQUN0QixlQUFLLE1BQU07QUFBQSxRQUNiLFNBQVMsS0FBSztBQUNaLGNBQUksdUJBQU8saUNBQVMsSUFBYyxPQUFPLEVBQUU7QUFBQSxRQUM3QztBQUFBLE1BQ0YsV0FBVyxFQUFFLFFBQVEsVUFBVTtBQUM3QixhQUFLLE1BQU07QUFBQSxNQUNiO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBRUEsVUFBVTtBQUNSLFNBQUssVUFBVSxNQUFNO0FBQUEsRUFDdkI7QUFDRjs7O0FHbEhBLElBQUFDLG1CQUE0Qzs7O0FDQTVDLElBQUFDLG1CQUEwQzs7O0FDQTFDLElBQU0sZ0JBQWdCO0FBQ3RCLElBQU0sZ0JBQWdCO0FBVWYsU0FBUyxxQkFBcUIsT0FBdUI7QUFDMUQsTUFBSSxJQUFJLE1BQU0sUUFBUSxlQUFlLEVBQUUsRUFBRSxRQUFRLGVBQWUsRUFBRSxFQUFFLEtBQUs7QUFDekUsTUFBSSxFQUFFLFFBQVEsVUFBVSxHQUFHO0FBQzNCLE1BQUksRUFBRSxRQUFRLG9CQUFvQixFQUFFO0FBQ3BDLE1BQUksRUFBRSxXQUFXLEVBQUcsT0FBTSxJQUFJLE1BQU0sc0NBQVE7QUFDNUMsU0FBTztBQUNUOzs7QURaQSxJQUFNLGtCQUFrQjtBQUN4QixJQUFNLG1CQUFtQjtBQUdsQixTQUFTLGlCQUFpQixHQUF1QjtBQUN0RCxTQUFPLE9BQU8sRUFBRSxJQUFJLE1BQU0sRUFBRSxJQUFJO0FBQ2xDO0FBR08sU0FBUyxjQUFjLE1BQXVCO0FBQ25ELFNBQU8sVUFBVSxLQUFLLElBQUk7QUFDNUI7QUFTQSxlQUFzQixvQkFDcEIsS0FDQSxXQUNBLFdBQ0EsT0FDaUI7QUFDakIsUUFBTSxZQUFZLHFCQUFxQixLQUFLO0FBQzVDLFFBQU1DLFdBQVUsYUFBYTtBQUM3QixRQUFNLFdBQVcsR0FBR0EsUUFBTyxJQUFJLFNBQVM7QUFHeEMsTUFBSSxDQUFDLElBQUksTUFBTSxzQkFBc0IsZUFBZSxHQUFHO0FBQ3JELFVBQU0sSUFBSSxNQUFNLGFBQWEsZUFBZTtBQUFBLEVBQzlDO0FBR0EsTUFBSSxPQUFPO0FBQ1gsTUFBSSxXQUFPLGdDQUFjLEdBQUcsZUFBZSxJQUFJLElBQUksS0FBSztBQUN4RCxNQUFJLElBQUk7QUFDUixTQUFPLElBQUksTUFBTSxzQkFBc0IsSUFBSSxHQUFHO0FBQzVDLFdBQU8sR0FBRyxRQUFRLElBQUksQ0FBQztBQUN2QixlQUFPLGdDQUFjLEdBQUcsZUFBZSxJQUFJLElBQUksS0FBSztBQUNwRDtBQUFBLEVBQ0Y7QUFFQSxNQUFJLENBQUMsS0FBSyxXQUFXLFFBQVEsR0FBRztBQUM5QixVQUFNLElBQUksTUFBTSxxREFBa0IsSUFBSSxFQUFFO0FBQUEsRUFDMUM7QUFHQSxRQUFNLFlBQVksVUFBVSxRQUFRLFVBQVUsRUFBRTtBQUdoRCxRQUFNLFNBQVMsVUFDWixNQUFNLE9BQU8sRUFDYixJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxFQUNuQixLQUFLLElBQUk7QUFFWixRQUFNLE9BQ0o7QUFBQSxVQUNXLFVBQVUsUUFBUSxNQUFNLEtBQUssQ0FBQztBQUFBO0FBQUEsV0FFN0JBLFFBQU87QUFBQSxhQUNMLFNBQVM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBR2xCLFNBQVM7QUFBQTtBQUFBLEVBQ1gsTUFBTTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUlYLFFBQU0sSUFBSSxNQUFNLE9BQU8sTUFBTSxJQUFJO0FBQ2pDLFNBQU87QUFDVDtBQVVBLGVBQXNCLHdCQUNwQixLQUNBLFdBQ0EsZUFDQSxZQUNlO0FBQ2YsTUFBSSxDQUFDLFVBQVUsV0FBVyxnQkFBZ0IsR0FBRztBQUMzQyxVQUFNLElBQUksTUFBTSx3REFBcUIsU0FBUyxFQUFFO0FBQUEsRUFDbEQ7QUFDQSxNQUFJLGVBQWUsS0FBSyxhQUFhLEtBQUssZUFBZSxLQUFLLFVBQVUsR0FBRztBQUN6RSxVQUFNLElBQUksTUFBTSxvRUFBYTtBQUFBLEVBQy9CO0FBQ0EsTUFBSSxXQUFXLFNBQVMsSUFBSSxHQUFHO0FBQzdCLFVBQU0sSUFBSSxNQUFNLHNDQUFRO0FBQUEsRUFDMUI7QUFFQSxRQUFNLE9BQU8sSUFBSSxNQUFNLHNCQUFzQixTQUFTO0FBQ3RELE1BQUksRUFBRSxnQkFBZ0Isd0JBQVEsT0FBTSxJQUFJLE1BQU0scUNBQWlCLFNBQVMsRUFBRTtBQUUxRSxRQUFNLElBQUksTUFBTSxRQUFRLE1BQU0sQ0FBQyxTQUFTO0FBQ3RDLFVBQU0sUUFBUSxLQUFLLE1BQU0sT0FBTztBQUNoQyxVQUFNLE9BQWlCLENBQUM7QUFDeEIsYUFBUyxJQUFJLEdBQUcsSUFBSSxNQUFNLFFBQVEsS0FBSztBQUNyQyxVQUFJLE1BQU0sQ0FBQyxNQUFNLGNBQWUsTUFBSyxLQUFLLENBQUM7QUFBQSxJQUM3QztBQUNBLFFBQUksS0FBSyxXQUFXLEdBQUc7QUFDckIsWUFBTSxJQUFJLE1BQU07QUFBQSxvQkFBNkIsYUFBYSxFQUFFO0FBQUEsSUFDOUQ7QUFDQSxRQUFJLEtBQUssU0FBUyxHQUFHO0FBQ25CLFlBQU0sSUFBSSxNQUFNLHVGQUFzQjtBQUFBLElBQ3hDO0FBQ0EsVUFBTSxLQUFLLENBQUMsQ0FBQyxJQUFJLEdBQUcsYUFBYSxhQUFRLFVBQVU7QUFDbkQsV0FBTyxNQUFNLEtBQUssSUFBSTtBQUFBLEVBQ3hCLENBQUM7QUFDSDtBQUdPLFNBQVMsa0JBQWtCLFdBQTJCO0FBQzNELFFBQU0sVUFBVSxVQUFVLFFBQVEsMEJBQTBCLEVBQUUsRUFBRSxLQUFLO0FBQ3JFLFNBQU8sUUFBUSxNQUFNLEdBQUcsRUFBRTtBQUM1Qjs7O0FFaElBLElBQUFDLG1CQUFtQztBQUc1QixJQUFNLGtCQUFOLGNBQThCLHVCQUFNO0FBQUEsRUFJekMsWUFBWSxLQUFVLFNBQWlCLFdBQW9EO0FBQ3pGLFVBQU0sR0FBRztBQUNULFNBQUssVUFBVTtBQUNmLFNBQUssWUFBWTtBQUFBLEVBQ25CO0FBQUEsRUFFQSxTQUFlO0FBQ2IsVUFBTSxFQUFFLFdBQVcsUUFBUSxJQUFJO0FBQy9CLFlBQVEsUUFBUSw0Q0FBUztBQUN6QixjQUFVLE1BQU07QUFFaEIsVUFBTSxRQUFRLFVBQVUsU0FBUyxTQUFTO0FBQUEsTUFDeEMsS0FBSztBQUFBLE1BQ0wsTUFBTSxFQUFFLE1BQU0sUUFBUSxhQUFhLDJCQUFPO0FBQUEsSUFDNUMsQ0FBQztBQUNELFVBQU0sUUFBUSxLQUFLO0FBQ25CLFVBQU0sTUFBTTtBQUNaLFVBQU0sT0FBTztBQUViLFVBQU0sT0FBTyxVQUFVLFVBQVUsRUFBRSxLQUFLLGdCQUFnQixDQUFDO0FBQ3pELFVBQU0sTUFBTSxLQUFLLFNBQVMsVUFBVSxFQUFFLEtBQUssV0FBVyxNQUFNLGVBQUssQ0FBQztBQUVsRSxVQUFNLFNBQVMsWUFBWTtBQUN6QixZQUFNLElBQUksTUFBTSxNQUFNLEtBQUs7QUFDM0IsVUFBSSxDQUFDLEdBQUc7QUFDTixZQUFJLHdCQUFPLHNDQUFRO0FBQ25CO0FBQUEsTUFDRjtBQUNBLFVBQUk7QUFDRixjQUFNLEtBQUssVUFBVSxDQUFDO0FBQ3RCLGFBQUssTUFBTTtBQUFBLE1BQ2IsU0FBUyxLQUFLO0FBQ1osWUFBSSx3QkFBTyxpQ0FBUyxJQUFjLE9BQU8sRUFBRTtBQUFBLE1BQzdDO0FBQUEsSUFDRjtBQUVBLFVBQU0saUJBQWlCLFdBQVcsQ0FBQyxNQUFNO0FBQ3ZDLFVBQUksRUFBRSxRQUFRLFNBQVM7QUFDckIsVUFBRSxlQUFlO0FBQ2pCLGFBQUssT0FBTztBQUFBLE1BQ2QsV0FBVyxFQUFFLFFBQVEsVUFBVTtBQUM3QixVQUFFLGVBQWU7QUFDakIsYUFBSyxNQUFNO0FBQUEsTUFDYjtBQUFBLElBQ0YsQ0FBQztBQUNELFFBQUksaUJBQWlCLFNBQVMsTUFBTSxLQUFLLE9BQU8sQ0FBQztBQUFBLEVBQ25EO0FBQUEsRUFFQSxVQUFnQjtBQUNkLFNBQUssVUFBVSxNQUFNO0FBQUEsRUFDdkI7QUFDRjs7O0FDMURBLElBQUFDLG1CQUFpRDs7O0FDR2pELElBQU0sZ0JBQWdCO0FBbUJ0QixlQUFzQixnQkFBZ0IsS0FBVSxTQUFzQztBQUNwRixRQUFNLEtBQUssUUFBUSxRQUFRLDBCQUEwQixFQUFFLEVBQUUsS0FBSyxFQUFFLFlBQVk7QUFDNUUsTUFBSSxDQUFDLEdBQUksUUFBTyxDQUFDO0FBRWpCLFFBQU0sUUFBUSxJQUFJLE1BQU0saUJBQWlCLEVBQUU7QUFBQSxJQUN6QyxDQUFDLE1BQU0sRUFBRSxLQUFLLFdBQVcsYUFBYTtBQUFBLEVBQ3hDO0FBRUEsUUFBTSxLQUFLLENBQUMsR0FBRyxNQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sSUFBSSxFQUFFLE9BQU8sRUFBRSxPQUFPLEtBQUssQ0FBRTtBQUVyRSxRQUFNLE9BQW1CLENBQUM7QUFDMUIsYUFBVyxRQUFRLE9BQU87QUFDeEIsVUFBTSxPQUFPLFlBQVksSUFBSTtBQUM3QixVQUFNLFVBQVUsTUFBTSxJQUFJLE1BQU0sV0FBVyxJQUFJO0FBQy9DLFVBQU0sUUFBUSxRQUFRLE1BQU0sT0FBTztBQUNuQyxhQUFTLElBQUksR0FBRyxJQUFJLE1BQU0sUUFBUSxLQUFLO0FBQ3JDLFlBQU0sUUFBUSxlQUFlLE1BQU0sQ0FBQyxDQUFDO0FBQ3JDLFVBQUksQ0FBQyxNQUFPO0FBQ1osVUFBSSxNQUFNLEtBQUssWUFBWSxFQUFFLFNBQVMsRUFBRSxHQUFHO0FBQ3pDLGFBQUssS0FBSztBQUFBLFVBQ1IsVUFBVSxLQUFLO0FBQUEsVUFDZixNQUFNO0FBQUEsVUFDTjtBQUFBLFVBQ0EsTUFBTSxNQUFNO0FBQUEsVUFDWixNQUFNLE1BQU07QUFBQSxRQUNkLENBQUM7QUFBQSxNQUNIO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDQSxTQUFPO0FBQ1Q7QUFFQSxTQUFTLFlBQVksTUFBcUI7QUFDeEMsUUFBTSxJQUFJLDRCQUE0QixLQUFLLEtBQUssSUFBSTtBQUNwRCxTQUFPLElBQUksRUFBRSxDQUFDLElBQUksS0FBSztBQUN6Qjs7O0FEbERPLElBQU0sbUJBQU4sY0FBK0IsOEJBQXVCO0FBQUEsRUFDM0QsWUFBWSxLQUFVO0FBQ3BCLFVBQU0sR0FBRztBQUNULFNBQUssZUFBZSxrREFBVTtBQUFBLEVBQ2hDO0FBQUEsRUFFQSxNQUFNLGVBQWUsT0FBb0M7QUFDdkQsV0FBTyxnQkFBZ0IsS0FBSyxLQUFLLEtBQUs7QUFBQSxFQUN4QztBQUFBLEVBRUEsaUJBQWlCLEtBQWUsSUFBdUI7QUFDckQsVUFBTSxRQUFRLEdBQUcsVUFBVSxFQUFFLEtBQUssb0JBQW9CLENBQUM7QUFDdkQsVUFBTSxXQUFXLEVBQUUsS0FBSyxxQkFBcUIsTUFBTSxJQUFJLEtBQUssQ0FBQztBQUM3RCxVQUFNLFdBQVcsRUFBRSxLQUFLLHFCQUFxQixNQUFNLElBQUksS0FBSyxDQUFDO0FBQzdELE9BQUcsVUFBVSxFQUFFLEtBQUsscUJBQXFCLE1BQU0sSUFBSSxLQUFLLENBQUM7QUFBQSxFQUMzRDtBQUFBLEVBRUEsTUFBTSxtQkFBbUIsS0FBOEI7QUFDckQsVUFBTSxPQUFPLEtBQUssSUFBSSxNQUFNLHNCQUFzQixJQUFJLFFBQVE7QUFDOUQsUUFBSSxFQUFFLGdCQUFnQix5QkFBUTtBQUM1QixVQUFJLHdCQUFPLHVDQUFTLElBQUksUUFBUSxFQUFFO0FBQ2xDO0FBQUEsSUFDRjtBQUNBLFVBQU0sT0FBTyxLQUFLLElBQUksVUFBVSxRQUFRLEtBQUs7QUFDN0MsVUFBTSxLQUFLLFNBQVMsTUFBTTtBQUFBLE1BQ3hCLFFBQVEsRUFBRSxNQUFNLElBQUksTUFBTSxNQUFNLEtBQUs7QUFBQSxJQUN2QyxDQUFDO0FBQUEsRUFDSDtBQUNGOzs7QUVuQ0EsSUFBQUMsbUJBQTBDOzs7QUNBMUMsSUFBQUMsbUJBQWtEOzs7QUNnQ2xELElBQU0sVUFBVTtBQUNoQixJQUFNLFVBQVU7QUFDaEIsSUFBTSxXQUFxQyxFQUFFLFVBQUssUUFBUSxhQUFNLFVBQVUsYUFBTSxNQUFNO0FBQy9FLElBQU0sYUFBdUMsRUFBRSxNQUFNLFVBQUssUUFBUSxhQUFNLEtBQUssWUFBSztBQUVsRixTQUFTLGNBQWMsTUFBaUM7QUFDN0QsUUFBTSxJQUFJLFFBQVEsS0FBSyxJQUFJO0FBQzNCLE1BQUksQ0FBQyxFQUFHLFFBQU87QUFDZixRQUFNLFNBQVMsRUFBRSxDQUFDO0FBQ2xCLFFBQU0sVUFBVSxFQUFFLENBQUMsRUFBRSxZQUFZLE1BQU07QUFDdkMsUUFBTSxPQUFPLEVBQUUsQ0FBQztBQUdoQixRQUFNLFFBQVEsS0FBSyxNQUFNLEtBQUssRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQztBQUMxRCxRQUFNLFNBQXNCLENBQUM7QUFFN0IsU0FBTyxNQUFNLFNBQVMsR0FBRztBQUN2QixVQUFNLE9BQU8sTUFBTSxNQUFNLFNBQVMsQ0FBQztBQUVuQyxRQUFJLFFBQVEsVUFBVTtBQUNwQixhQUFPLFFBQVEsRUFBRSxNQUFNLFlBQVksS0FBSyxNQUFNLE9BQU8sU0FBUyxJQUFJLEVBQUUsQ0FBQztBQUNyRSxZQUFNLElBQUk7QUFDVjtBQUFBLElBQ0Y7QUFFQSxRQUFJLE1BQU0sVUFBVSxLQUFLLFFBQVEsS0FBSyxJQUFJLEdBQUc7QUFDM0MsWUFBTSxPQUFPLE1BQU0sTUFBTSxTQUFTLENBQUM7QUFDbkMsVUFBSSxTQUFTLGFBQU07QUFDakIsZUFBTyxRQUFRLEVBQUUsTUFBTSxPQUFPLEtBQUssYUFBTSxJQUFJLElBQUksT0FBTyxLQUFLLENBQUM7QUFDOUQsY0FBTSxJQUFJO0FBQ1YsY0FBTSxJQUFJO0FBQ1Y7QUFBQSxNQUNGO0FBQ0EsVUFBSSxTQUFTLFVBQUs7QUFDaEIsZUFBTyxRQUFRLEVBQUUsTUFBTSxhQUFhLEtBQUssVUFBSyxJQUFJLElBQUksT0FBTyxLQUFLLENBQUM7QUFDbkUsY0FBTSxJQUFJO0FBQ1YsY0FBTSxJQUFJO0FBQ1Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUNBO0FBQUEsRUFDRjtBQUVBLFNBQU8sRUFBRSxRQUFRLFNBQVMsTUFBTSxNQUFNLEtBQUssR0FBRyxHQUFHLE9BQU87QUFDMUQ7QUFFTyxTQUFTLGNBQWMsTUFBMEI7QUFDdEQsUUFBTSxNQUFNLEtBQUssVUFBVSxNQUFNO0FBQ2pDLFFBQU0sUUFBa0IsQ0FBQztBQUN6QixNQUFJLEtBQUssS0FBSyxTQUFTLEVBQUcsT0FBTSxLQUFLLEtBQUssSUFBSTtBQUM5QyxhQUFXLEtBQUssS0FBSyxPQUFRLE9BQU0sS0FBSyxFQUFFLEdBQUc7QUFDN0MsUUFBTSxPQUFPLE1BQU0sU0FBUyxJQUFJLE1BQU0sTUFBTSxLQUFLLEdBQUcsSUFBSTtBQUN4RCxTQUFPLEdBQUcsS0FBSyxNQUFNLE1BQU0sR0FBRyxJQUFJLElBQUk7QUFDeEM7QUFHTyxTQUFTLE9BQU8sTUFBaUM7QUFDdEQsUUFBTSxJQUFJLEtBQUssT0FBTyxLQUFLLENBQUMsTUFBTSxFQUFFLFNBQVMsS0FBSztBQUNsRCxTQUFPLElBQUksRUFBRSxRQUFRO0FBQ3ZCO0FBQ08sU0FBUyxZQUFZLE1BQW1DO0FBQzdELFFBQU0sSUFBSSxLQUFLLE9BQU8sS0FBSyxDQUFDLE1BQU0sRUFBRSxTQUFTLFVBQVU7QUFDdkQsU0FBTyxJQUFLLEVBQUUsUUFBcUI7QUFDckM7QUFPTyxTQUFTLGNBQWMsTUFBa0IsTUFBMEI7QUFDeEUsUUFBTSxNQUFNLFVBQUssSUFBSTtBQUNyQixRQUFNLFNBQVMsS0FBSyxPQUFPLE9BQU8sQ0FBQyxNQUFNLEVBQUUsU0FBUyxXQUFXO0FBQy9ELFNBQU8sS0FBSyxFQUFFLE1BQU0sYUFBYSxLQUFLLE9BQU8sS0FBSyxDQUFDO0FBQ25ELFNBQU8sRUFBRSxHQUFHLE1BQU0sU0FBUyxNQUFNLE9BQU87QUFDMUM7QUFPTyxTQUFTLFFBQVEsTUFBa0IsTUFBaUM7QUFDekUsTUFBSSxTQUFTLE1BQU07QUFDakIsV0FBTyxFQUFFLEdBQUcsTUFBTSxRQUFRLEtBQUssT0FBTyxPQUFPLENBQUMsTUFBTSxFQUFFLFNBQVMsS0FBSyxFQUFFO0FBQUEsRUFDeEU7QUFDQSxRQUFNLE1BQU0sYUFBTSxJQUFJO0FBQ3RCLFFBQU0sTUFBTSxLQUFLLE9BQU8sVUFBVSxDQUFDLE1BQU0sRUFBRSxTQUFTLEtBQUs7QUFDekQsUUFBTSxTQUFTLENBQUMsR0FBRyxLQUFLLE1BQU07QUFDOUIsUUFBTSxTQUFvQixFQUFFLE1BQU0sT0FBTyxLQUFLLE9BQU8sS0FBSztBQUMxRCxNQUFJLE9BQU8sRUFBRyxRQUFPLEdBQUcsSUFBSTtBQUFBLE1BQ3ZCLFFBQU8sS0FBSyxNQUFNO0FBQ3ZCLFNBQU8sRUFBRSxHQUFHLE1BQU0sT0FBTztBQUMzQjtBQUVPLFNBQVMsYUFBYSxNQUFrQixNQUFtQztBQUNoRixNQUFJLFNBQVMsTUFBTTtBQUNqQixXQUFPLEVBQUUsR0FBRyxNQUFNLFFBQVEsS0FBSyxPQUFPLE9BQU8sQ0FBQyxNQUFNLEVBQUUsU0FBUyxVQUFVLEVBQUU7QUFBQSxFQUM3RTtBQUNBLFFBQU0sTUFBTSxXQUFXLElBQUk7QUFDM0IsUUFBTSxNQUFNLEtBQUssT0FBTyxVQUFVLENBQUMsTUFBTSxFQUFFLFNBQVMsVUFBVTtBQUM5RCxRQUFNLFNBQVMsQ0FBQyxHQUFHLEtBQUssTUFBTTtBQUM5QixRQUFNLFNBQW9CLEVBQUUsTUFBTSxZQUFZLEtBQUssT0FBTyxLQUFLO0FBQy9ELE1BQUksT0FBTyxFQUFHLFFBQU8sR0FBRyxJQUFJO0FBQUEsTUFDdkIsUUFBTyxLQUFLLE1BQU07QUFDdkIsU0FBTyxFQUFFLEdBQUcsTUFBTSxPQUFPO0FBQzNCO0FBRU8sU0FBUyxTQUFTLE1BQWtCLE1BQTBCO0FBQ25FLFNBQU8sRUFBRSxHQUFHLE1BQU0sS0FBSztBQUN6Qjs7O0FEdElBLElBQU0sWUFBWTtBQVVsQixlQUFzQixtQkFDcEIsS0FDQSxTQUNlO0FBRWYsTUFBSSxDQUFDLFFBQVEsU0FBUyxXQUFXLFlBQVksR0FBRyxHQUFHO0FBQ2pELFVBQU0sSUFBSSxNQUFNLDRCQUFRLFNBQVMsdUJBQVEsUUFBUSxRQUFRLEVBQUU7QUFBQSxFQUM3RDtBQUNBLFFBQU0sT0FBTyxJQUFJLE1BQU0sc0JBQXNCLFFBQVEsUUFBUTtBQUM3RCxNQUFJLEVBQUUsZ0JBQWdCLHlCQUFRO0FBQzVCLFVBQU0sSUFBSSxNQUFNLG1EQUFXLFFBQVEsUUFBUSxFQUFFO0FBQUEsRUFDL0M7QUFDQSxRQUFNLFFBQVEsYUFBYTtBQUUzQixRQUFNLElBQUksTUFBTSxRQUFRLE1BQU0sQ0FBQyxTQUFTO0FBQ3RDLFVBQU0sUUFBUSxLQUFLLE1BQU0sT0FBTztBQUNoQyxRQUFJLE9BQU87QUFDWCxRQUFJLFdBQVc7QUFDZixhQUFTLElBQUksR0FBRyxJQUFJLE1BQU0sUUFBUSxLQUFLO0FBQ3JDLFVBQUksTUFBTSxDQUFDLE1BQU0sUUFBUSxVQUFVO0FBQ2pDLFlBQUksU0FBUyxRQUFRLFlBQVk7QUFDL0IscUJBQVc7QUFDWDtBQUFBLFFBQ0Y7QUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQ0EsUUFBSSxXQUFXLEdBQUc7QUFDaEIsWUFBTSxJQUFJO0FBQUEsUUFDUjtBQUFBLG9CQUErQixRQUFRLFFBQVE7QUFBQSxNQUNqRDtBQUFBLElBQ0Y7QUFDQSxVQUFNLFNBQVMsY0FBYyxNQUFNLFFBQVEsQ0FBQztBQUM1QyxRQUFJLENBQUMsT0FBUSxPQUFNLElBQUksTUFBTSw4REFBWTtBQUN6QyxRQUFJLE9BQU8sUUFBUyxRQUFPO0FBRTNCLFVBQU0sUUFBUSxJQUFJLGNBQWMsY0FBYyxRQUFRLEtBQUssQ0FBQztBQUM1RCxXQUFPLE1BQU0sS0FBSyxJQUFJO0FBQUEsRUFDeEIsQ0FBQztBQUNIO0FBT0EsZUFBc0IsaUJBQ3BCLEtBQ0EsVUFDQSxVQUNlO0FBQ2YsTUFBSSxDQUFDLFNBQVMsV0FBVyxZQUFZLEdBQUcsR0FBRztBQUN6QyxVQUFNLElBQUksTUFBTSw4Q0FBVyxTQUFTLFVBQUs7QUFBQSxFQUMzQztBQUNBLE1BQUksZUFBZSxLQUFLLFFBQVEsR0FBRztBQUNqQyxVQUFNLElBQUksTUFBTSw4REFBWTtBQUFBLEVBQzlCO0FBQ0EsUUFBTSxPQUFPLElBQUksTUFBTSxzQkFBc0IsUUFBUTtBQUNyRCxNQUFJLEVBQUUsZ0JBQWdCLHdCQUFRLE9BQU0sSUFBSSxNQUFNLG1EQUFXLFFBQVEsRUFBRTtBQUVuRSxRQUFNLElBQUksTUFBTSxRQUFRLE1BQU0sQ0FBQyxTQUFTO0FBQ3RDLFVBQU0sVUFBVSxLQUFLLFNBQVMsS0FBSyxDQUFDLEtBQUssU0FBUyxJQUFJO0FBQ3RELFdBQU8sUUFBUSxVQUFVLE9BQU8sTUFBTSxXQUFXO0FBQUEsRUFDbkQsQ0FBQztBQUNIO0FBT0EsZUFBc0IsZUFBZSxLQUFVLE9BQWdDO0FBQzdFLFFBQU0sV0FBVyxxQkFBcUIsS0FBSztBQUczQyxRQUFNLE1BQU0sSUFBSSxNQUFNLHNCQUFzQixTQUFTO0FBQ3JELE1BQUksQ0FBQyxJQUFLLE9BQU0sSUFBSSxNQUFNLGFBQWEsU0FBUztBQUdoRCxNQUFJLFdBQU8sZ0NBQWMsR0FBRyxTQUFTLElBQUksUUFBUSxLQUFLO0FBQ3RELE1BQUksSUFBSTtBQUNSLFNBQU8sSUFBSSxNQUFNLHNCQUFzQixJQUFJLEdBQUc7QUFDNUMsZUFBTyxnQ0FBYyxHQUFHLFNBQVMsSUFBSSxRQUFRLElBQUksQ0FBQyxLQUFLO0FBQ3ZEO0FBQUEsRUFDRjtBQUVBLE1BQUksQ0FBQyxLQUFLLFdBQVcsWUFBWSxHQUFHLEdBQUc7QUFDckMsVUFBTSxJQUFJLE1BQU0sMERBQWEsSUFBSSxFQUFFO0FBQUEsRUFDckM7QUFFQSxRQUFNLFFBQVEsYUFBYTtBQUMzQixRQUFNLE9BQ0o7QUFBQSxVQUNXLFNBQVMsUUFBUSxNQUFNLEtBQUssQ0FBQztBQUFBO0FBQUE7QUFBQSxXQUc1QixLQUFLO0FBQUEsV0FDTCxLQUFLO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUdaLFFBQVE7QUFBQTtBQUFBO0FBQ2YsUUFBTSxJQUFJLE1BQU0sT0FBTyxNQUFNLElBQUk7QUFDakMsU0FBTztBQUNUO0FBR08sU0FBUyxpQkFBaUIsS0FBb0I7QUFDbkQsUUFBTSxNQUFNLGVBQWUsUUFBUSxJQUFJLFVBQVUsT0FBTyxHQUFHO0FBQzNELE1BQUksd0JBQU8saUNBQVEsR0FBRyxJQUFJLEdBQUk7QUFDaEM7QUFRQSxlQUFzQixlQUNwQixLQUNBLFNBQ0EsYUFDZTtBQUNmLE1BQUksQ0FBQyxRQUFRLFNBQVMsV0FBVyxZQUFZLEdBQUcsR0FBRztBQUNqRCxVQUFNLElBQUksTUFBTSw0QkFBUSxTQUFTLHVCQUFRLFFBQVEsUUFBUSxFQUFFO0FBQUEsRUFDN0Q7QUFDQSxNQUFJLGVBQWUsS0FBSyxXQUFXLEdBQUc7QUFDcEMsVUFBTSxJQUFJLE1BQU0sd0RBQVc7QUFBQSxFQUM3QjtBQUNBLFFBQU0sT0FBTyxJQUFJLE1BQU0sc0JBQXNCLFFBQVEsUUFBUTtBQUM3RCxNQUFJLEVBQUUsZ0JBQWdCLHlCQUFRO0FBQzVCLFVBQU0sSUFBSSxNQUFNLG1EQUFXLFFBQVEsUUFBUSxFQUFFO0FBQUEsRUFDL0M7QUFFQSxRQUFNLElBQUksTUFBTSxRQUFRLE1BQU0sQ0FBQyxTQUFTO0FBQ3RDLFVBQU0sUUFBUSxLQUFLLE1BQU0sT0FBTztBQUNoQyxRQUFJLE9BQU87QUFDWCxRQUFJLFdBQVc7QUFDZixhQUFTLElBQUksR0FBRyxJQUFJLE1BQU0sUUFBUSxLQUFLO0FBQ3JDLFVBQUksTUFBTSxDQUFDLE1BQU0sUUFBUSxVQUFVO0FBQ2pDLFlBQUksU0FBUyxRQUFRLFlBQVk7QUFDL0IscUJBQVc7QUFDWDtBQUFBLFFBQ0Y7QUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQ0EsUUFBSSxXQUFXLEdBQUc7QUFDaEIsWUFBTSxJQUFJO0FBQUEsUUFDUjtBQUFBLG9CQUErQixRQUFRLFFBQVE7QUFBQSxNQUNqRDtBQUFBLElBQ0Y7QUFFQSxRQUFJLENBQUMsY0FBYyxNQUFNLFFBQVEsQ0FBQyxHQUFHO0FBQ25DLFlBQU0sSUFBSSxNQUFNLDhEQUFZO0FBQUEsSUFDOUI7QUFDQSxRQUFJLE1BQU0sUUFBUSxNQUFNLFlBQWEsUUFBTztBQUM1QyxVQUFNLFFBQVEsSUFBSTtBQUNsQixXQUFPLE1BQU0sS0FBSyxJQUFJO0FBQUEsRUFDeEIsQ0FBQztBQUNIOzs7QUV2S0EsSUFBTUMsYUFBWTtBQUdsQixlQUFzQixVQUFVLEtBQTJCO0FBQ3pELFFBQU0sUUFBZ0IsQ0FBQztBQUN2QixhQUFXLEtBQUssSUFBSSxNQUFNLGlCQUFpQixHQUFHO0FBQzVDLFFBQUksQ0FBQyxFQUFFLEtBQUssV0FBV0EsVUFBUyxFQUFHO0FBQ25DLFVBQU0sUUFBUSxJQUFJLGNBQWMsYUFBYSxDQUFDO0FBQzlDLFVBQU0sS0FBSyxPQUFPO0FBQ2xCLFFBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxPQUFRO0FBRS9CLFVBQU0sWUFBWSxPQUFPLEdBQUcsVUFBVSxRQUFRLEVBQUUsWUFBWTtBQUM1RCxVQUFNLFNBQ0osY0FBYyxVQUFVLGNBQWMsYUFBYSxZQUFZO0FBQ2pFLFVBQU0sUUFBUSxFQUFFO0FBRWhCLFVBQU0sVUFBVSxNQUFNLElBQUksTUFBTSxXQUFXLENBQUM7QUFDNUMsVUFBTSxRQUFRLFFBQVEsTUFBTSxPQUFPO0FBQ25DLFVBQU0sUUFBb0IsQ0FBQztBQUMzQixVQUFNLFdBQVcsb0JBQUksSUFBb0I7QUFFekMsYUFBUyxJQUFJLEdBQUcsSUFBSSxNQUFNLFFBQVEsS0FBSztBQUNyQyxZQUFNLFNBQVMsY0FBYyxNQUFNLENBQUMsQ0FBQztBQUNyQyxVQUFJLENBQUMsT0FBUTtBQUNiLFlBQU0sVUFBVSxNQUFNLENBQUM7QUFDdkIsWUFBTSxNQUFNLFNBQVMsSUFBSSxPQUFPLEtBQUs7QUFDckMsZUFBUyxJQUFJLFNBQVMsTUFBTSxDQUFDO0FBQzdCLFlBQU0sS0FBSztBQUFBLFFBQ1QsVUFBVSxFQUFFO0FBQUEsUUFDWixXQUFXO0FBQUEsUUFDWCxZQUFZO0FBQUEsUUFDWixZQUFZO0FBQUEsUUFDWjtBQUFBLFFBQ0EsU0FBUyxFQUFFLFVBQVUsRUFBRSxNQUFNLFVBQVUsU0FBUyxZQUFZLElBQUk7QUFBQSxNQUNsRSxDQUFDO0FBQUEsSUFDSDtBQUVBLFVBQU0sS0FBSyxFQUFFLE1BQU0sR0FBRyxNQUFNLEVBQUUsTUFBTSxPQUFPLFFBQVEsTUFBTSxDQUFDO0FBQUEsRUFDNUQ7QUFDQSxRQUFNO0FBQUEsSUFBSyxDQUFDLEdBQUcsTUFDYixFQUFFLFFBQVEsRUFBRSxRQUFRLEtBQUssRUFBRSxRQUFRLEVBQUUsUUFBUSxJQUFJO0FBQUEsRUFDbkQ7QUFDQSxTQUFPO0FBQ1Q7OztBSDlDTyxJQUFNLGVBQU4sY0FBMkIsdUJBQU07QUFBQSxFQUd0QyxZQUFZLEtBQVUsV0FBb0M7QUFDeEQsVUFBTSxHQUFHO0FBQ1QsU0FBSyxZQUFZO0FBQUEsRUFDbkI7QUFBQSxFQUVBLFNBQWU7QUFDYixVQUFNLEVBQUUsV0FBVyxRQUFRLElBQUk7QUFDL0IsWUFBUSxRQUFRLDBCQUFNO0FBQ3RCLGNBQVUsTUFBTTtBQUVoQixVQUFNLFFBQVEsVUFBVSxTQUFTLFNBQVM7QUFBQSxNQUN4QyxLQUFLO0FBQUEsTUFDTCxNQUFNLEVBQUUsTUFBTSxRQUFRLGFBQWEsa0VBQWdCO0FBQUEsSUFDckQsQ0FBQztBQUNELFVBQU0sTUFBTTtBQUVaLFVBQU0sT0FBTyxVQUFVLFVBQVUsRUFBRSxLQUFLLGdCQUFnQixDQUFDO0FBQ3pELFVBQU0sTUFBTSxLQUFLLFNBQVMsVUFBVTtBQUFBLE1BQ2xDLEtBQUs7QUFBQSxNQUNMLE1BQU07QUFBQSxJQUNSLENBQUM7QUFFRCxVQUFNLFNBQVMsWUFBWTtBQUN6QixZQUFNLElBQUksTUFBTSxNQUFNLEtBQUs7QUFDM0IsVUFBSSxDQUFDLEVBQUc7QUFDUixVQUFJO0FBQ0YsY0FBTSxPQUFPLE1BQU0sZUFBZSxLQUFLLEtBQUssQ0FBQztBQUM3QyxZQUFJLHdCQUFPLHNCQUFPLElBQUksRUFBRTtBQUN4QixhQUFLLE1BQU07QUFFWCxjQUFNLElBQUksS0FBSyxJQUFJLE1BQU0sc0JBQXNCLElBQUk7QUFDbkQsWUFBSSxhQUFhLHdCQUFPO0FBQ3RCLGdCQUFNLEtBQUssSUFBSSxVQUFVLFFBQVEsS0FBSyxFQUFFLFNBQVMsQ0FBQztBQUFBLFFBQ3BEO0FBQ0EsYUFBSyxZQUFZLElBQUk7QUFBQSxNQUN2QixTQUFTLEtBQUs7QUFDWixZQUFJLHdCQUFPLGlDQUFTLElBQWMsT0FBTyxFQUFFO0FBQUEsTUFDN0M7QUFBQSxJQUNGO0FBRUEsVUFBTSxpQkFBaUIsV0FBVyxDQUFDLE1BQU07QUFDdkMsVUFBSSxFQUFFLFFBQVEsUUFBUyxRQUFPO0FBQUEsSUFDaEMsQ0FBQztBQUNELFFBQUksaUJBQWlCLFNBQVMsTUFBTTtBQUFBLEVBQ3RDO0FBQUEsRUFFQSxVQUFnQjtBQUNkLFNBQUssVUFBVSxNQUFNO0FBQUEsRUFDdkI7QUFDRjtBQUdPLElBQU0sb0JBQU4sY0FBZ0MsdUJBQU07QUFBQSxFQU0zQyxZQUNFLEtBQ0EsTUFLQTtBQUNBLFVBQU0sR0FBRztBQWJYLFNBQVEsUUFBZ0IsQ0FBQztBQWN2QixTQUFLLGtCQUFrQixNQUFNO0FBQzdCLFNBQUssY0FBYyxNQUFNO0FBQ3pCLFNBQUssVUFBVSxNQUFNO0FBQUEsRUFDdkI7QUFBQSxFQUVBLE1BQU0sU0FBd0I7QUFDNUIsVUFBTSxFQUFFLFdBQVcsUUFBUSxJQUFJO0FBQy9CLFlBQVEsUUFBUSxzQ0FBUTtBQUN4QixjQUFVLE1BQU07QUFFaEIsU0FBSyxTQUFTLE1BQU0sVUFBVSxLQUFLLEdBQUcsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLFdBQVcsUUFBUTtBQUM1RSxRQUFJLEtBQUssTUFBTSxXQUFXLEdBQUc7QUFDM0IsZ0JBQVUsVUFBVTtBQUFBLFFBQ2xCLEtBQUs7QUFBQSxRQUNMLE1BQU07QUFBQSxNQUNSLENBQUM7QUFDRDtBQUFBLElBQ0Y7QUFHQSxVQUFNLFlBQVksVUFBVSxTQUFTLFNBQVM7QUFBQSxNQUM1QyxLQUFLO0FBQUEsTUFDTCxNQUFNLEVBQUUsTUFBTSxRQUFRLGFBQWEsMkJBQU87QUFBQSxJQUM1QyxDQUFDO0FBQ0QsUUFBSSxLQUFLLFlBQWEsV0FBVSxRQUFRLEtBQUs7QUFDN0MsY0FBVSxNQUFNO0FBQ2hCLFFBQUksS0FBSyxhQUFhO0FBRXBCLGdCQUFVLGtCQUFrQixLQUFLLFlBQVksUUFBUSxLQUFLLFlBQVksTUFBTTtBQUFBLElBQzlFO0FBRUEsVUFBTSxNQUFNLFVBQVUsVUFBVSxFQUFFLEtBQUssZUFBZSxDQUFDO0FBR3ZELFVBQU0sYUFBYSxJQUFJLFNBQVMsVUFBVSxFQUFFLEtBQUssa0JBQWtCLENBQUM7QUFDcEUsZUFBVyxLQUFLLEtBQUssT0FBTztBQUMxQixZQUFNLE1BQU0sV0FBVyxTQUFTLFVBQVUsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDO0FBQzNELFVBQUksUUFBUSxFQUFFO0FBQUEsSUFDaEI7QUFDQSxRQUFJLEtBQUssbUJBQW1CLEtBQUssTUFBTSxLQUFLLENBQUMsTUFBTSxFQUFFLFNBQVMsS0FBSyxlQUFlLEdBQUc7QUFDbkYsaUJBQVcsUUFBUSxLQUFLO0FBQUEsSUFDMUI7QUFHQSxVQUFNLFlBQVksSUFBSSxTQUFTLFNBQVM7QUFBQSxNQUN0QyxLQUFLO0FBQUEsTUFDTCxNQUFNLEVBQUUsTUFBTSxPQUFPO0FBQUEsSUFDdkIsQ0FBQztBQUdELFVBQU0sYUFBYSxJQUFJLFNBQVMsVUFBVSxFQUFFLEtBQUssa0JBQWtCLENBQUM7QUFDcEUsZUFBVyxTQUFTLFVBQVUsRUFBRSxNQUFNLDJCQUFPLENBQUMsRUFBRSxRQUFRO0FBQ3hELGVBQVcsU0FBUyxVQUFVLEVBQUUsTUFBTSxnQkFBTSxDQUFDLEVBQUUsUUFBUTtBQUN2RCxlQUFXLFNBQVMsVUFBVSxFQUFFLE1BQU0sbUJBQU8sQ0FBQyxFQUFFLFFBQVE7QUFDeEQsZUFBVyxTQUFTLFVBQVUsRUFBRSxNQUFNLG1CQUFPLENBQUMsRUFBRSxRQUFRO0FBRXhELFVBQU0sT0FBTyxVQUFVLFVBQVUsRUFBRSxLQUFLLGdCQUFnQixDQUFDO0FBQ3pELFVBQU0sTUFBTSxLQUFLLFNBQVMsVUFBVSxFQUFFLEtBQUssV0FBVyxNQUFNLGVBQUssQ0FBQztBQUVsRSxVQUFNLFNBQVMsWUFBWTtBQUV6QixZQUFNLE9BQU8sVUFBVSxNQUFNLFFBQVEsMEJBQTBCLEdBQUcsRUFBRSxLQUFLO0FBQ3pFLFVBQUksQ0FBQyxLQUFNO0FBQ1gsWUFBTSxXQUFXLFdBQVc7QUFDNUIsWUFBTSxRQUFRLENBQUMsU0FBUyxJQUFJLEVBQUU7QUFDOUIsWUFBTSxVQUFVLFVBQVU7QUFDMUIsVUFBSSxTQUFTO0FBQ1gsWUFBSSxDQUFDLHNCQUFzQixLQUFLLE9BQU8sR0FBRztBQUN4QyxjQUFJLHdCQUFPLDRDQUFTO0FBQ3BCO0FBQUEsUUFDRjtBQUNBLGNBQU0sS0FBSyxhQUFNLE9BQU8sRUFBRTtBQUFBLE1BQzVCO0FBQ0EsWUFBTSxPQUFPLFdBQVc7QUFDeEIsVUFBSSxLQUFNLE9BQU0sS0FBSyxXQUFXLElBQUksQ0FBQztBQUNyQyxZQUFNLE9BQU8sTUFBTSxLQUFLLEdBQUc7QUFDM0IsVUFBSTtBQUNGLGNBQU0saUJBQWlCLEtBQUssS0FBSyxVQUFVLElBQUk7QUFDL0MsWUFBSSx3QkFBTyw0QkFBUSxRQUFRLEVBQUU7QUFDN0IsYUFBSyxNQUFNO0FBQ1gsWUFBSSxLQUFLLFFBQVMsT0FBTSxLQUFLLFFBQVEsVUFBVSxJQUFJO0FBQUEsTUFDckQsU0FBUyxLQUFLO0FBQ1osWUFBSSx3QkFBTyxpQ0FBUyxJQUFjLE9BQU8sRUFBRTtBQUFBLE1BQzdDO0FBQUEsSUFDRjtBQUVBLGNBQVUsaUJBQWlCLFdBQVcsQ0FBQyxNQUFNO0FBQzNDLFVBQUksRUFBRSxRQUFRLFFBQVMsUUFBTztBQUFBLElBQ2hDLENBQUM7QUFDRCxRQUFJLGlCQUFpQixTQUFTLE1BQU07QUFBQSxFQUN0QztBQUFBLEVBRUEsVUFBZ0I7QUFDZCxTQUFLLFVBQVUsTUFBTTtBQUFBLEVBQ3ZCO0FBQ0Y7QUFHTyxJQUFNLGtCQUFOLGNBQThCLHVCQUFNO0FBQUEsRUFJekMsWUFBWSxLQUFVLFNBQWlCLFFBQWdDO0FBQ3JFLFVBQU0sR0FBRztBQUNULFNBQUssVUFBVTtBQUNmLFNBQUssU0FBUztBQUFBLEVBQ2hCO0FBQUEsRUFFQSxTQUFlO0FBQ2IsVUFBTSxFQUFFLFdBQVcsUUFBUSxJQUFJO0FBQy9CLFlBQVEsUUFBUSwwQkFBTTtBQUN0QixjQUFVLE1BQU07QUFFaEIsVUFBTSxRQUFRLFVBQVUsU0FBUyxTQUFTO0FBQUEsTUFDeEMsS0FBSztBQUFBLE1BQ0wsTUFBTSxFQUFFLE1BQU0sT0FBTztBQUFBLElBQ3ZCLENBQUM7QUFDRCxRQUFJLEtBQUssUUFBUyxPQUFNLFFBQVEsS0FBSztBQUNyQyxVQUFNLE1BQU07QUFFWixVQUFNLE9BQU8sVUFBVSxVQUFVLEVBQUUsS0FBSyxnQkFBZ0IsQ0FBQztBQUN6RCxVQUFNLE1BQU0sS0FBSyxTQUFTLFVBQVUsRUFBRSxLQUFLLFdBQVcsTUFBTSxlQUFLLENBQUM7QUFFbEUsVUFBTSxTQUFTLE1BQU07QUFDbkIsWUFBTSxJQUFJLE1BQU07QUFDaEIsVUFBSSxDQUFDLEVBQUc7QUFDUixVQUFJLENBQUMsc0JBQXNCLEtBQUssQ0FBQyxHQUFHO0FBQ2xDLFlBQUksd0JBQU8sNENBQVM7QUFDcEI7QUFBQSxNQUNGO0FBQ0EsV0FBSyxPQUFPLENBQUM7QUFDYixXQUFLLE1BQU07QUFBQSxJQUNiO0FBRUEsVUFBTSxpQkFBaUIsV0FBVyxDQUFDLE1BQU07QUFDdkMsVUFBSSxFQUFFLFFBQVEsUUFBUyxRQUFPO0FBQUEsSUFDaEMsQ0FBQztBQUNELFFBQUksaUJBQWlCLFNBQVMsTUFBTTtBQUFBLEVBQ3RDO0FBQUEsRUFFQSxVQUFnQjtBQUNkLFNBQUssVUFBVSxNQUFNO0FBQUEsRUFDdkI7QUFDRjs7O0FOck1PLElBQU0sZ0JBQU4sTUFBb0I7QUFBQSxFQU96QixZQUNtQixLQUdBLFFBQ0EsY0FDQSxnQkFDakI7QUFOaUI7QUFHQTtBQUNBO0FBQ0E7QUFWbkIsU0FBUSxzQkFBc0I7QUFFOUI7QUFBQSxTQUFRLE9BQWE7QUFBQSxFQVNsQjtBQUFBLEVBRUgsU0FBZTtBQUNiLFNBQUssVUFBVTtBQUNmLFNBQUssWUFBWTtBQUNqQixTQUFLLEtBQUssUUFBUTtBQUFBLEVBQ3BCO0FBQUE7QUFBQSxFQUdBLGlCQUEwQjtBQUN4QixXQUFPLFNBQVMsa0JBQWtCLEtBQUs7QUFBQSxFQUN6QztBQUFBO0FBQUEsRUFHQSxzQkFBK0I7QUFDN0IsUUFBSSxLQUFLLHFCQUFxQjtBQUM1QixXQUFLLHNCQUFzQjtBQUMzQixhQUFPO0FBQUEsSUFDVDtBQUNBLFdBQU87QUFBQSxFQUNUO0FBQUEsRUFFQSxNQUFNLFVBQXlCO0FBQzdCLFFBQUksQ0FBQyxLQUFLLE9BQVE7QUFDbEIsVUFBTSxVQUFVLE1BQU0sZ0JBQWdCLEtBQUssR0FBRztBQUM5QyxTQUFLLE9BQU8sTUFBTTtBQUNsQixRQUFJLFFBQVEsV0FBVyxHQUFHO0FBQ3hCLFdBQUssT0FBTyxVQUFVLEVBQUUsS0FBSyxZQUFZLE1BQU0sNkNBQVUsQ0FBQztBQUMxRDtBQUFBLElBQ0Y7QUFDQSxRQUFJLEtBQUssU0FBUyxZQUFZO0FBRTVCLFdBQUssT0FBTyxTQUFTLGFBQWE7QUFDbEMsY0FBUSxRQUFRLENBQUMsTUFBTSxLQUFLO0FBQUEsUUFBZ0I7QUFBQTtBQUFBLFFBQWtCO0FBQUEsTUFBSSxDQUFDO0FBQUEsSUFDckUsT0FBTztBQUVMLFdBQUssT0FBTyxZQUFZLGFBQWE7QUFDckMsY0FBUSxNQUFNLEVBQUUsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLE1BQU0sS0FBSyxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7QUFBQSxJQUMzRTtBQUFBLEVBQ0Y7QUFBQSxFQUVRLFlBQWtCO0FBQ3hCLFNBQUssYUFBYSxNQUFNO0FBQ3hCLFNBQUssYUFBYSxTQUFTLGFBQWE7QUFDeEMsU0FBSyxhQUFhLFdBQVcsRUFBRSxLQUFLLGFBQWEsTUFBTSw0QkFBUSxDQUFDO0FBQ2hFLFNBQUssVUFBVSxLQUFLLGFBQWEsU0FBUyxTQUFTO0FBQUEsTUFDakQsS0FBSztBQUFBLE1BQ0wsTUFBTSxFQUFFLE1BQU0sUUFBUSxhQUFhLDZEQUFxQjtBQUFBLElBQzFELENBQUM7QUFDRCxTQUFLLGFBQWEsV0FBVyxFQUFFLEtBQUssV0FBVyxNQUFNLFFBQVEsQ0FBQztBQUM5RCxTQUFLLFFBQVEsaUJBQWlCLFdBQVcsT0FBTyxNQUFNO0FBQ3BELFVBQUksRUFBRSxRQUFRLFFBQVM7QUFDdkIsWUFBTSxJQUFJLEtBQUssUUFBUSxNQUFNLEtBQUs7QUFDbEMsVUFBSSxDQUFDLEVBQUc7QUFDUixXQUFLLFFBQVEsUUFBUTtBQUNyQixVQUFJO0FBQ0YsYUFBSyxzQkFBc0I7QUFDM0IsY0FBTSxPQUFPLE1BQU0sWUFBWSxLQUFLLEtBQUssQ0FBQztBQUMxQyxZQUFJLHdCQUFPLDRCQUFRLElBQUksRUFBRTtBQUN6QixjQUFNLEtBQUssUUFBUTtBQUFBLE1BQ3JCLFNBQVMsS0FBSztBQUNaLGFBQUssc0JBQXNCO0FBQzNCLFlBQUksd0JBQU8saUNBQVMsSUFBYyxPQUFPLEVBQUU7QUFBQSxNQUM3QztBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUVRLGNBQW9CO0FBQzFCLFNBQUssZUFBZSxNQUFNO0FBQzFCLFNBQUssZUFBZSxTQUFTLFVBQVU7QUFDdkMsU0FBSyxlQUFlLFNBQVMsaUJBQWlCO0FBQzlDLFVBQU0sT0FBTyxLQUFLLGVBQWUsVUFBVSxFQUFFLEtBQUssZ0JBQWdCLENBQUM7QUFDbkUsU0FBSyxXQUFXLEVBQUUsTUFBTSx3Q0FBVSxDQUFDO0FBQ25DLFNBQUssV0FBVyxFQUFFLEtBQUssV0FBVyxNQUFNLGFBQWEsRUFBRSxDQUFDO0FBR3hELFVBQU0sU0FBUyxLQUFLLFdBQVcsRUFBRSxLQUFLLGlCQUFpQixDQUFDO0FBQ3hELGtDQUFRLFFBQVEsUUFBUTtBQUN4QixXQUFPLFFBQVEsU0FBUyw0Q0FBUztBQUNqQyxXQUFPLGlCQUFpQixTQUFTLE1BQU07QUFDckMsVUFBSSxpQkFBaUIsS0FBSyxHQUFHLEVBQUUsS0FBSztBQUFBLElBQ3RDLENBQUM7QUFFRCxVQUFNLFNBQVMsS0FBSyxXQUFXO0FBQUEsTUFDN0IsS0FBSyxvQkFBb0IsS0FBSyxTQUFTLGFBQWEsZUFBZTtBQUFBLElBQ3JFLENBQUM7QUFDRCxrQ0FBUSxRQUFRLEtBQUssU0FBUyxhQUFhLFNBQVMsT0FBTztBQUMzRCxXQUFPO0FBQUEsTUFDTDtBQUFBLE1BQ0EsS0FBSyxTQUFTLGFBQWEseUNBQVc7QUFBQSxJQUN4QztBQUNBLFdBQU8saUJBQWlCLFNBQVMsTUFBTTtBQUNyQyxXQUFLLE9BQU8sS0FBSyxTQUFTLGFBQWEsWUFBWTtBQUVuRCxXQUFLLFlBQVk7QUFDakIsV0FBSyxLQUFLLFFBQVE7QUFBQSxJQUNwQixDQUFDO0FBRUQsU0FBSyxTQUFTLEtBQUssZUFBZSxVQUFVO0FBQUEsTUFDMUMsS0FBSztBQUFBLElBQ1AsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUVRLGdCQUFnQixPQUFtQixVQUF5QjtBQUNsRSxVQUFNLEtBQUssS0FBSyxPQUFPLFVBQVU7QUFBQSxNQUMvQixLQUFLLG1CQUFtQixXQUFXLGlCQUFpQjtBQUFBLElBQ3RELENBQUM7QUFDRCxPQUFHLFdBQVcsRUFBRSxLQUFLLFdBQVcsTUFBTSxNQUFNLEtBQUssQ0FBQztBQUNsRCxPQUFHLFdBQVcsRUFBRSxLQUFLLGNBQWMsTUFBTSxNQUFNLEtBQUssQ0FBQztBQUNyRCxPQUFHLGlCQUFpQixTQUFTLFlBQVk7QUFDdkMsWUFBTSxPQUFPLEtBQUssSUFBSSxNQUFNLHNCQUFzQixlQUFlLENBQUM7QUFDbEUsVUFBSSxnQkFBZ0Isd0JBQU87QUFDekIsY0FBTSxLQUFLLElBQUksVUFBVSxRQUFRLEtBQUssRUFBRSxTQUFTLElBQUk7QUFBQSxNQUN2RDtBQUFBLElBQ0YsQ0FBQztBQUdELFVBQU0sVUFBVSxHQUFHLFVBQVUsRUFBRSxLQUFLLG1CQUFtQixDQUFDO0FBQ3hELFVBQU0sWUFBWSxRQUFRLFdBQVc7QUFBQSxNQUNuQyxLQUFLO0FBQUEsTUFDTCxNQUFNO0FBQUEsSUFDUixDQUFDO0FBQ0QsY0FBVSxRQUFRLFNBQVMsMEJBQU07QUFDakMsY0FBVSxpQkFBaUIsU0FBUyxDQUFDLE1BQU07QUFDekMsUUFBRSxnQkFBZ0I7QUFDbEIsV0FBSyxnQkFBZ0IsS0FBSztBQUFBLElBQzVCLENBQUM7QUFDRCxRQUFJLENBQUMsY0FBYyxNQUFNLElBQUksR0FBRztBQUM5QixZQUFNLGFBQWEsUUFBUSxXQUFXO0FBQUEsUUFDcEMsS0FBSztBQUFBLFFBQ0wsTUFBTTtBQUFBLE1BQ1IsQ0FBQztBQUNELGlCQUFXLFFBQVEsU0FBUywwQkFBTTtBQUNsQyxpQkFBVyxpQkFBaUIsU0FBUyxDQUFDLE1BQU07QUFDMUMsVUFBRSxnQkFBZ0I7QUFDbEIsYUFBSyxpQkFBaUIsS0FBSztBQUFBLE1BQzdCLENBQUM7QUFBQSxJQUNIO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFJUSxnQkFBZ0IsT0FBeUI7QUFFL0MsU0FBSyxLQUFLO0FBQ1YsUUFBSSxrQkFBa0IsS0FBSyxLQUFLO0FBQUEsTUFDOUIsYUFBYSxNQUFNO0FBQUEsSUFDckIsQ0FBQyxFQUFFLEtBQUs7QUFBQSxFQUNWO0FBQUEsRUFFUSxpQkFBaUIsT0FBeUI7QUFDaEQsVUFBTSxZQUFZLGVBQWU7QUFDakMsUUFBSTtBQUFBLE1BQ0YsS0FBSztBQUFBLE1BQ0wsa0JBQWtCLE1BQU0sSUFBSTtBQUFBLE1BQzVCLE9BQU8sVUFBVTtBQUNmLGNBQU0sT0FBTyxNQUFNO0FBQUEsVUFDakIsS0FBSztBQUFBLFVBQ0wsTUFBTTtBQUFBLFVBQ047QUFBQSxVQUNBO0FBQUEsUUFDRjtBQUNBLGNBQU0sT0FBTyxLQUFLLFFBQVEsVUFBVSxFQUFFO0FBRXRDLFlBQUk7QUFDRixlQUFLLHNCQUFzQjtBQUMzQixnQkFBTTtBQUFBLFlBQ0osS0FBSztBQUFBLFlBQ0w7QUFBQSxZQUNBLGlCQUFpQixLQUFLO0FBQUEsWUFDdEI7QUFBQSxVQUNGO0FBQUEsUUFDRixTQUFTLEtBQUs7QUFDWixlQUFLLHNCQUFzQjtBQUMzQixjQUFJO0FBQUEsWUFDRixpRkFBaUIsSUFBYyxPQUFPO0FBQUEsWUFDdEM7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUNBLFlBQUksd0JBQU8sa0NBQVMsSUFBSSxFQUFFO0FBQzFCLGNBQU0sS0FBSyxRQUFRO0FBQUEsTUFDckI7QUFBQSxJQUNGLEVBQUUsS0FBSztBQUFBLEVBQ1Q7QUFDRjs7O0FVN05BLElBQUFDLG1CQUE2RDs7O0FDNkJ0RCxJQUFNLGFBQWEsQ0FBQyxVQUFVLFVBQVUsV0FBVyxZQUFZO0FBRS9ELElBQU0sbUJBQTZDO0FBQUEsRUFDeEQsUUFBUTtBQUFBLEVBQ1IsUUFBUTtBQUFBLEVBQ1IsU0FBUztBQUFBLEVBQ1QsWUFBWTtBQUNkO0FBR08sU0FBUyxpQkFBaUIsS0FBeUI7QUFDeEQsUUFBTSxPQUFzQixDQUFDO0FBQzdCLGFBQVcsS0FBSyxJQUFJLE1BQU0saUJBQWlCLEdBQUc7QUFDNUMsUUFBSSxDQUFDLEVBQUUsS0FBSyxXQUFXLE9BQU8sRUFBRztBQUNqQyxVQUFNLFFBQStCLElBQUksY0FBYyxhQUFhLENBQUM7QUFDckUsVUFBTSxLQUFLLE9BQU87QUFDbEIsUUFBSSxDQUFDLEdBQUk7QUFDVCxVQUFNLElBQUksT0FBTyxHQUFHLFFBQVEsRUFBRSxFQUFFLFlBQVk7QUFDNUMsUUFBSSxDQUFFLFdBQWlDLFNBQVMsQ0FBQyxFQUFHO0FBRXBELFFBQUk7QUFDSixVQUFNLFlBQVksR0FBRztBQUNyQixRQUFJLE1BQU0sUUFBUSxTQUFTLEdBQUc7QUFDNUIsZ0JBQVUsVUFBVSxJQUFJLENBQUMsTUFBTSxPQUFPLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDO0FBQUEsSUFDdEUsV0FBVyxPQUFPLGNBQWMsWUFBWSxVQUFVLFNBQVMsR0FBRztBQUNoRSxnQkFBVSxDQUFDLFNBQVM7QUFBQSxJQUN0QixPQUFPO0FBQ0wsZ0JBQVUsQ0FBQztBQUFBLElBQ2I7QUFDQSxRQUFJLFFBQVEsV0FBVyxFQUFHLFdBQVUsQ0FBQyxvQkFBSztBQUUxQyxTQUFLLEtBQUs7QUFBQSxNQUNSLE1BQU0sRUFBRTtBQUFBLE1BQ1IsTUFBTSxFQUFFO0FBQUEsTUFDUixPQUFPLEVBQUUsS0FBSztBQUFBLE1BQ2QsTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ047QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQ0EsU0FBTztBQUNUO0FBOEJPLFNBQVMsb0JBQW9CLE1BQXFDO0FBQ3ZFLFFBQU0sUUFBUSxvQkFBSSxJQUFrQjtBQUNwQyxRQUFNLFFBQVEsb0JBQUksSUFBWTtBQUM5QixRQUFNLFdBQVcsb0JBQUksSUFBaUM7QUFDdEQsUUFBTSxhQUFhLG9CQUFJLElBQVk7QUFFbkMsUUFBTSxXQUFXLENBQUMsS0FBYSxRQUFxQjtBQUNsRCxRQUFJLElBQUksTUFBTSxJQUFJLEdBQUc7QUFDckIsUUFBSSxDQUFDLEdBQUc7QUFDTixVQUFJLEVBQUUsS0FBSyxPQUFPLEtBQUssT0FBTyxDQUFDLEVBQUU7QUFDakMsWUFBTSxJQUFJLEtBQUssQ0FBQztBQUFBLElBQ2xCO0FBQ0EsTUFBRSxNQUFNLEtBQUssRUFBRSxNQUFNLElBQUksTUFBTSxNQUFNLElBQUksTUFBTSxPQUFPLElBQUksT0FBTyxNQUFNLElBQUksS0FBSyxDQUFDO0FBQUEsRUFDbkY7QUFFQSxhQUFXLEtBQUssTUFBTTtBQUNwQixlQUFXLEtBQUssRUFBRSxTQUFTO0FBQ3pCLFlBQU0sUUFBUSxFQUFFLE1BQU0sR0FBRztBQUN6QixZQUFNLEtBQUssTUFBTSxDQUFDO0FBQ2xCLFlBQU0sSUFBSSxFQUFFO0FBRVosZUFBUyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksSUFBSSxDQUFDO0FBRTVCLFVBQUksTUFBTSxVQUFVLEdBQUc7QUFDckIsY0FBTSxZQUFZLE1BQU0sTUFBTSxDQUFDLEVBQUUsS0FBSyxHQUFHO0FBQ3pDLFlBQUksQ0FBQyxTQUFTLElBQUksRUFBRSxFQUFHLFVBQVMsSUFBSSxJQUFJLG9CQUFJLElBQUksQ0FBQztBQUNqRCxpQkFBUyxJQUFJLEVBQUUsRUFBRyxJQUFJLFdBQVcsQ0FBQztBQUFBLE1BQ3BDLE9BQU87QUFDTCxtQkFBVyxJQUFJLEVBQUU7QUFBQSxNQUNuQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBRUEsUUFBTSxXQUFXLG9CQUFJLElBQTJCO0FBQ2hELGFBQVcsTUFBTSxPQUFPO0FBQ3RCLFVBQU0sT0FBc0IsQ0FBQztBQUM3QixVQUFNLFNBQVMsU0FBUyxJQUFJLEVBQUU7QUFDOUIsVUFBTSxjQUFjLENBQUMsQ0FBQyxVQUFVLE9BQU8sT0FBTztBQUU5QyxRQUFJLGFBQWE7QUFDZixZQUFNLFNBQVMsQ0FBQyxHQUFHLE9BQU8sUUFBUSxDQUFDLEVBQUU7QUFBQSxRQUFLLENBQUMsR0FBRyxNQUM1QyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLElBQUk7QUFBQSxNQUN2QztBQUNBLGlCQUFXLENBQUMsT0FBTyxRQUFRLEtBQUssUUFBUTtBQUN0QyxhQUFLLEtBQUssRUFBRSxPQUFPLFVBQVUsU0FBUyxNQUFNLENBQUM7QUFBQSxNQUMvQztBQUNBLFVBQUksV0FBVyxJQUFJLEVBQUUsR0FBRztBQUN0QixhQUFLLEtBQUssRUFBRSxPQUFPLGdCQUFNLFVBQVUsSUFBSSxTQUFTLEtBQUssQ0FBQztBQUFBLE1BQ3hEO0FBR0EsaUJBQVcsS0FBSyxZQUFZO0FBQzFCLGNBQU0sUUFBbUIsQ0FBQztBQUMxQixtQkFBVyxPQUFPLE1BQU07QUFDdEIsZ0JBQU0sSUFBSSxNQUFNLElBQUksR0FBRyxJQUFJLFFBQVEsSUFBSSxDQUFDLEVBQUU7QUFDMUMsY0FBSSxFQUFHLE9BQU0sS0FBSyxHQUFHLEVBQUUsS0FBSztBQUFBLFFBQzlCO0FBQ0EsWUFBSSxNQUFNLFNBQVMsR0FBRztBQUNwQixnQkFBTSxNQUFNLFVBQVUsRUFBRSxJQUFJLENBQUM7QUFDN0IsZ0JBQU0sSUFBSSxLQUFLLEVBQUUsS0FBSyxPQUFPLEtBQUssTUFBTSxDQUFDO0FBQUEsUUFDM0M7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUNBLGFBQVMsSUFBSSxJQUFJLElBQUk7QUFBQSxFQUN2QjtBQUVBLFFBQU0sWUFBWSxDQUFDLEdBQUcsS0FBSyxFQUFFLEtBQUssQ0FBQyxHQUFHLE1BQU07QUFDMUMsUUFBSSxNQUFNLHFCQUFPLFFBQU87QUFDeEIsUUFBSSxNQUFNLHFCQUFPLFFBQU87QUFDeEIsV0FBTyxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksSUFBSTtBQUFBLEVBQ2xDLENBQUM7QUFFRCxTQUFPLEVBQUUsV0FBVyxVQUFVLE1BQU07QUFDdEM7QUFRTyxTQUFTLGlCQUFpQixPQUFnQixNQUFzQjtBQUNyRSxRQUFNLFNBQVMsS0FBSyxTQUFTLEdBQUcsSUFBSSxPQUFPLE9BQU87QUFDbEQsUUFBTSxPQUFPLG9CQUFJLElBQThEO0FBQy9FLFFBQU0sZ0JBQTJCLENBQUM7QUFFbEMsYUFBVyxLQUFLLE9BQU87QUFDckIsUUFBSSxDQUFDLEVBQUUsS0FBSyxXQUFXLE1BQU0sRUFBRztBQUNoQyxVQUFNLE9BQU8sRUFBRSxLQUFLLE1BQU0sT0FBTyxNQUFNO0FBQ3ZDLFVBQU0sUUFBUSxLQUFLLE1BQU0sR0FBRztBQUM1QixVQUFNLE1BQWUsRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLEVBQUUsTUFBTSxPQUFPLEVBQUUsS0FBSyxPQUFPLE1BQU0sRUFBRTtBQUVoRixRQUFJLE1BQU0sV0FBVyxHQUFHO0FBRXRCLG9CQUFjLEtBQUssR0FBRztBQUN0QjtBQUFBLElBQ0Y7QUFFQSxVQUFNLEtBQUssTUFBTSxDQUFDO0FBQ2xCLFFBQUksUUFBUSxLQUFLLElBQUksRUFBRTtBQUN2QixRQUFJLENBQUMsT0FBTztBQUNWLGNBQVE7QUFBQSxRQUNOLE1BQU0sRUFBRSxLQUFLLElBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxFQUFFO0FBQUEsUUFDdEMsU0FBUyxvQkFBSSxJQUFJO0FBQUEsTUFDbkI7QUFDQSxXQUFLLElBQUksSUFBSSxLQUFLO0FBQUEsSUFDcEI7QUFDQSxVQUFNLEtBQUssTUFBTSxLQUFLLEdBQUc7QUFFekIsUUFBSSxNQUFNLFVBQVUsR0FBRztBQUVyQixZQUFNLEtBQUssTUFBTSxDQUFDO0FBQ2xCLFVBQUksTUFBTSxNQUFNLFFBQVEsSUFBSSxFQUFFO0FBQzlCLFVBQUksQ0FBQyxLQUFLO0FBQ1IsY0FBTSxFQUFFLEtBQUssR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsRUFBRTtBQUNqRCxjQUFNLFFBQVEsSUFBSSxJQUFJLEdBQUc7QUFBQSxNQUMzQjtBQUNBLFVBQUksTUFBTSxLQUFLLEdBQUc7QUFBQSxJQUNwQjtBQUFBLEVBRUY7QUFFQSxRQUFNLFVBQVUsQ0FBQyxHQUFHLEtBQUssT0FBTyxDQUFDLEVBQUU7QUFBQSxJQUFLLENBQUMsR0FBRyxNQUMxQyxFQUFFLEtBQUssUUFBUSxFQUFFLEtBQUssUUFBUSxLQUFLLEVBQUUsS0FBSyxRQUFRLEVBQUUsS0FBSyxRQUFRLElBQUk7QUFBQSxFQUN2RTtBQUNBLFFBQU0sUUFBZ0IsQ0FBQztBQUN2QixhQUFXLEtBQUssU0FBUztBQUN2QixRQUFJLEVBQUUsUUFBUSxPQUFPLEdBQUc7QUFDdEIsUUFBRSxLQUFLLFVBQVUsQ0FBQyxHQUFHLEVBQUUsUUFBUSxPQUFPLENBQUMsRUFBRTtBQUFBLFFBQUssQ0FBQyxHQUFHLE1BQ2hELEVBQUUsUUFBUSxFQUFFLFFBQVEsS0FBSyxFQUFFLFFBQVEsRUFBRSxRQUFRLElBQUk7QUFBQSxNQUNuRDtBQUFBLElBQ0Y7QUFDQSxVQUFNLEtBQUssRUFBRSxJQUFJO0FBQUEsRUFDbkI7QUFDQSxNQUFJLGNBQWMsU0FBUyxHQUFHO0FBQzVCLFVBQU0sS0FBSyxFQUFFLEtBQUsscUJBQXFCLE9BQU8sc0JBQU8sT0FBTyxjQUFjLENBQUM7QUFBQSxFQUM3RTtBQUNBLFNBQU87QUFDVDtBQUVPLFNBQVMsY0FBYyxPQUEwQjtBQUN0RCxNQUFJLElBQUk7QUFDUixhQUFXLEtBQUssTUFBTyxLQUFJLEVBQUUsUUFBUSxFQUFHLEtBQUksRUFBRTtBQUM5QyxTQUFPO0FBQ1Q7QUFFTyxTQUFTLFlBQVksTUFBb0M7QUFDOUQsU0FBTyxjQUFjLEtBQUssS0FBSztBQUNqQzs7O0FEMU5BLElBQU0sa0JBQWtCO0FBRWpCLElBQU0sZ0JBQU4sTUFBb0I7QUFBQSxFQW9CekIsWUFDVSxLQUNBLFFBQ0EsV0FDUjtBQUhRO0FBQ0E7QUFDQTtBQXRCVixTQUFRLFFBQWU7QUFBQSxNQUNyQixLQUFLO0FBQUEsTUFDTCxZQUFZO0FBQUEsTUFDWixZQUFZO0FBQUEsTUFDWixRQUFRO0FBQUEsSUFDVjtBQUNBLFNBQVEsZ0JBQXlDO0FBQ2pELFNBQVEsU0FBNkI7QUFDckMsU0FBUSxTQUE2QjtBQUNyQyxTQUFRLGFBQWlDO0FBQ3pDLFNBQVEsZ0JBQW9DO0FBRTVDO0FBQUEsU0FBUSxnQkFBK0I7QUFFdkM7QUFBQSxTQUFRLFlBQVk7QUFDcEIsU0FBUSxlQUFlO0FBRXZCO0FBQUEsU0FBUSxhQUFhLG9CQUFJLElBQVk7QUFBQSxFQU1sQztBQUFBLEVBRUgsV0FBb0I7QUFDbEIsV0FBTyxTQUFTLGtCQUFrQixLQUFLO0FBQUEsRUFDekM7QUFBQSxFQUVBLFNBQWU7QUFDYixRQUFJLEtBQUssV0FBWSxNQUFLLFlBQVksS0FBSyxXQUFXO0FBQ3RELFFBQUksS0FBSyxjQUFlLE1BQUssZUFBZSxLQUFLLGNBQWM7QUFDL0QsVUFBTSxtQkFBbUIsS0FBSyxTQUFTO0FBRXZDLFNBQUssVUFBVSxNQUFNO0FBQ3JCLFNBQUssVUFBVSxTQUFTLFdBQVc7QUFHbkMsVUFBTSxPQUFPLEtBQUssVUFBVSxVQUFVLEVBQUUsS0FBSyxVQUFVLENBQUM7QUFDeEQsSUFBQyxDQUFDLFFBQVEsT0FBTyxRQUFRLEVBQVksUUFBUSxDQUFDLE1BQU07QUFDbEQsWUFBTSxLQUFLLEtBQUssVUFBVTtBQUFBLFFBQ3hCLEtBQUssWUFBWSxLQUFLLE1BQU0sUUFBUSxJQUFJLFlBQVk7QUFBQSxRQUNwRCxNQUFNO0FBQUEsTUFDUixDQUFDO0FBQ0QsU0FBRyxpQkFBaUIsU0FBUyxNQUFNO0FBQ2pDLFlBQUksS0FBSyxNQUFNLFFBQVEsRUFBRztBQUMxQixhQUFLLE1BQU0sTUFBTTtBQUNqQixhQUFLLE1BQU0sYUFBYTtBQUN4QixhQUFLLE1BQU0sYUFBYTtBQUN4QixhQUFLLE1BQU0sU0FBUztBQUNwQixhQUFLLFlBQVk7QUFDakIsYUFBSyxlQUFlO0FBQ3BCLGFBQUssT0FBTztBQUFBLE1BQ2QsQ0FBQztBQUFBLElBQ0gsQ0FBQztBQUdELFNBQUssYUFBYTtBQUdsQixTQUFLLFNBQVMsS0FBSyxVQUFVLFVBQVUsRUFBRSxLQUFLLGlCQUFpQixDQUFDO0FBR2hFLFVBQU0sWUFBWSxLQUFLLE9BQU8sVUFBVSxFQUFFLEtBQUssWUFBWSxDQUFDO0FBQzVELGNBQVUsV0FBVyxFQUFFLEtBQUssa0JBQWtCLE1BQU0sWUFBSyxDQUFDO0FBQzFELFNBQUssZ0JBQWdCLFVBQVUsU0FBUyxTQUFTO0FBQUEsTUFDL0MsS0FBSztBQUFBLE1BQ0wsTUFBTTtBQUFBLFFBQ0osTUFBTTtBQUFBLFFBQ04sYUFBYTtBQUFBLE1BQ2Y7QUFBQSxJQUNGLENBQUM7QUFDRCxTQUFLLGNBQWMsUUFBUSxLQUFLLE1BQU07QUFDdEMsU0FBSyxjQUFjLGlCQUFpQixTQUFTLE1BQU07QUFDakQsV0FBSyxNQUFNLFNBQVMsS0FBSyxjQUFlO0FBQ3hDLFdBQUssZUFBZTtBQUFBLElBQ3RCLENBQUM7QUFDRCxRQUFJLGlCQUFrQixNQUFLLGNBQWMsTUFBTTtBQUcvQyxVQUFNLFFBQVEsS0FBSyxPQUFPLFVBQVUsRUFBRSxLQUFLLFdBQVcsQ0FBQztBQUN2RCxTQUFLLGFBQWEsTUFBTSxVQUFVLEVBQUUsS0FBSyxlQUFlLENBQUM7QUFDekQsU0FBSyxXQUFXLGlCQUFpQixVQUFVLE1BQU07QUFDL0MsVUFBSSxLQUFLLFdBQVksTUFBSyxZQUFZLEtBQUssV0FBVztBQUFBLElBQ3hELENBQUM7QUFHRCxRQUFJLEtBQUssTUFBTSxRQUFRLE9BQVEsTUFBSyxlQUFlLEtBQUssVUFBVTtBQUFBLFFBQzdELE1BQUssaUJBQWlCLEtBQUssWUFBWSxLQUFLLE1BQU0sR0FBRztBQUcxRCxRQUFJLEtBQUssTUFBTSxZQUFZO0FBQ3pCLFlBQU0sVUFBVSxNQUFNLFVBQVUsRUFBRSxLQUFLLG1CQUFtQixDQUFDO0FBQzNELGNBQVEsUUFBUSxjQUFjLHdEQUFXO0FBQ3pDLFdBQUssa0JBQWtCLE9BQU8sT0FBTztBQUVyQyxXQUFLLGdCQUFnQixNQUFNLFVBQVUsRUFBRSxLQUFLLGtCQUFrQixDQUFDO0FBQy9ELFdBQUssY0FBYyxpQkFBaUIsVUFBVSxNQUFNO0FBQ2xELFlBQUksS0FBSyxjQUFlLE1BQUssZUFBZSxLQUFLLGNBQWM7QUFBQSxNQUNqRSxDQUFDO0FBR0QsVUFBSSxLQUFLLGtCQUFrQixNQUFNO0FBQy9CLGFBQUssV0FBVyxNQUFNLFNBQVMsR0FBRyxLQUFLLGFBQWE7QUFDcEQsYUFBSyxXQUFXLE1BQU0sT0FBTztBQUFBLE1BQy9CO0FBRUEsV0FBSyxlQUFlO0FBQUEsSUFDdEIsT0FBTztBQUVMLFdBQUssZ0JBQWdCO0FBQ3JCLFdBQUssV0FBVyxNQUFNLE9BQU87QUFDN0IsV0FBSyxXQUFXLE1BQU0sU0FBUztBQUFBLElBQ2pDO0FBR0EsVUFBTSxXQUFXLEtBQUs7QUFDdEIsVUFBTSxjQUFjLEtBQUs7QUFDekIsV0FBTyxzQkFBc0IsTUFBTTtBQUNqQyxVQUFJLEtBQUssY0FBYyxXQUFXLEVBQUcsTUFBSyxXQUFXLFlBQVk7QUFDakUsVUFBSSxLQUFLLGlCQUFpQixjQUFjLEVBQUcsTUFBSyxjQUFjLFlBQVk7QUFBQSxJQUM1RSxDQUFDO0FBQUEsRUFDSDtBQUFBO0FBQUEsRUFHUSxrQkFBa0IsT0FBb0IsU0FBNEI7QUFDeEUsWUFBUSxpQkFBaUIsYUFBYSxDQUFDLE1BQU07QUFDM0MsUUFBRSxlQUFlO0FBQ2pCLFlBQU0sU0FBUyxFQUFFO0FBQ2pCLFlBQU0sT0FBTyxNQUFNLHNCQUFzQjtBQUN6QyxZQUFNLFlBQVksS0FBSyxZQUFZLGdCQUFnQixLQUFLLFNBQVM7QUFDakUsWUFBTSxRQUFRO0FBQ2QsWUFBTSxRQUFRLEtBQUssU0FBUztBQUU1QixZQUFNLFNBQVMsQ0FBQyxPQUFtQjtBQUNqQyxZQUFJLElBQUksYUFBYSxHQUFHLFVBQVU7QUFDbEMsWUFBSSxJQUFJLE1BQU8sS0FBSTtBQUNuQixZQUFJLElBQUksTUFBTyxLQUFJO0FBQ25CLGFBQUssZ0JBQWdCO0FBQ3JCLFlBQUksS0FBSyxZQUFZO0FBQ25CLGVBQUssV0FBVyxNQUFNLFNBQVMsR0FBRyxDQUFDO0FBQ25DLGVBQUssV0FBVyxNQUFNLE9BQU87QUFBQSxRQUMvQjtBQUFBLE1BQ0Y7QUFDQSxZQUFNLE9BQU8sTUFBTTtBQUNqQixpQkFBUyxvQkFBb0IsYUFBYSxNQUFNO0FBQ2hELGlCQUFTLG9CQUFvQixXQUFXLElBQUk7QUFDNUMsaUJBQVMsS0FBSyxNQUFNLFNBQVM7QUFDN0IsaUJBQVMsS0FBSyxNQUFNLGFBQWE7QUFBQSxNQUNuQztBQUNBLGVBQVMsS0FBSyxNQUFNLFNBQVM7QUFDN0IsZUFBUyxLQUFLLE1BQU0sYUFBYTtBQUNqQyxlQUFTLGlCQUFpQixhQUFhLE1BQU07QUFDN0MsZUFBUyxpQkFBaUIsV0FBVyxJQUFJO0FBQUEsSUFDM0MsQ0FBQztBQUFBLEVBQ0g7QUFBQTtBQUFBLEVBR1EsZUFBZSxNQUF5QjtBQUM5QyxVQUFNLE9BQU8saUJBQWlCLEtBQUssR0FBRztBQUN0QyxVQUFNLEVBQUUsV0FBVyxVQUFVLE1BQU0sSUFBSSxvQkFBb0IsSUFBSTtBQUUvRCxVQUFNLE9BQU8sS0FBSyxVQUFVLEVBQUUsS0FBSyxlQUFlLENBQUM7QUFDbkQsU0FBSyxVQUFVLEVBQUUsS0FBSyxpQkFBaUIsQ0FBQztBQUN4QyxlQUFXLEtBQUssWUFBWTtBQUMxQixXQUFLLFVBQVUsRUFBRSxLQUFLLG1CQUFtQixNQUFNLGlCQUFpQixDQUFDLEVBQUUsQ0FBQztBQUFBLElBQ3RFO0FBRUEsUUFBSSxVQUFVLFdBQVcsR0FBRztBQUMxQixXQUFLLFVBQVU7QUFBQSxRQUNiLEtBQUs7QUFBQSxRQUNMLE1BQU07QUFBQSxNQUNSLENBQUM7QUFDRDtBQUFBLElBQ0Y7QUFFQSxlQUFXLE1BQU0sV0FBVztBQUMxQixZQUFNLE9BQU8sU0FBUyxJQUFJLEVBQUUsS0FBSyxDQUFDO0FBQ2xDLFlBQU0sY0FBYyxLQUFLLFNBQVM7QUFDbEMsWUFBTSxXQUFXLGVBQWUsS0FBSyxXQUFXLElBQUksRUFBRTtBQUd0RCxZQUFNLE9BQU8sS0FBSyxVQUFVO0FBQUEsUUFDMUIsS0FBSyx3Q0FBd0MsY0FBYyxtQkFBbUI7QUFBQSxNQUNoRixDQUFDO0FBQ0QsVUFBSSxhQUFhO0FBQ2YsYUFBSyxXQUFXLEVBQUUsS0FBSyxZQUFZLE1BQU0sV0FBVyxXQUFNLFNBQUksQ0FBQztBQUFBLE1BQ2pFLE9BQU87QUFDTCxhQUFLLFdBQVcsRUFBRSxLQUFLLGlDQUFpQyxNQUFNLEdBQUcsQ0FBQztBQUFBLE1BQ3BFO0FBQ0EsV0FBSyxXQUFXLEVBQUUsS0FBSyxjQUFjLE1BQU0sR0FBRyxDQUFDO0FBQy9DLFVBQUksYUFBYTtBQUNmLGFBQUssaUJBQWlCLFNBQVMsTUFBTTtBQUNuQyxjQUFJLFNBQVUsTUFBSyxXQUFXLE9BQU8sRUFBRTtBQUFBLGNBQ2xDLE1BQUssV0FBVyxJQUFJLEVBQUU7QUFDM0IsZUFBSyxPQUFPO0FBQUEsUUFDZCxDQUFDO0FBQUEsTUFDSDtBQUdBLGlCQUFXLEtBQUssWUFBWTtBQUMxQixjQUFNLFVBQVUsY0FBYyxVQUFVLEVBQUUsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLElBQUksQ0FBQztBQUM5RCxhQUFLLGlCQUFpQixNQUFNLFNBQVMsTUFBTSxJQUFJLE9BQU8sQ0FBQztBQUFBLE1BQ3pEO0FBR0EsVUFBSSxVQUFVO0FBQ1osbUJBQVcsT0FBTyxNQUFNO0FBQ3RCLGVBQUssVUFBVTtBQUFBLFlBQ2IsS0FDRSx3Q0FBd0MsSUFBSSxVQUFVLGNBQWM7QUFBQSxZQUN0RSxNQUFNLElBQUk7QUFBQSxVQUNaLENBQUM7QUFDRCxxQkFBVyxLQUFLLFlBQVk7QUFDMUIsa0JBQU0sVUFBVSxHQUFHLElBQUksUUFBUSxJQUFJLENBQUM7QUFDcEMsaUJBQUssaUJBQWlCLE1BQU0sU0FBUyxNQUFNLElBQUksT0FBTyxDQUFDO0FBQUEsVUFDekQ7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFFUSxpQkFBaUIsTUFBbUIsS0FBYSxNQUE4QjtBQUNyRixVQUFNLFVBQVUsQ0FBQyxRQUFRLEtBQUssTUFBTSxXQUFXO0FBQy9DLFVBQU0sU0FBUyxLQUFLLE1BQU0sZUFBZTtBQUN6QyxVQUFNLEtBQUssS0FBSyxVQUFVO0FBQUEsTUFDeEIsS0FDRSxhQUNDLFVBQVUsV0FBVyxPQUNyQixTQUFTLFlBQVk7QUFBQSxJQUMxQixDQUFDO0FBQ0QsT0FBRyxVQUFVLEVBQUUsS0FBSyxhQUFhLE1BQU0sVUFBVSxXQUFNLE9BQU8sS0FBTSxNQUFNLE1BQU0sRUFBRSxDQUFDO0FBQ25GLFFBQUksQ0FBQyxXQUFXLE1BQU07QUFDcEIsU0FBRyxVQUFVLEVBQUUsS0FBSyxlQUFlLE1BQU0sZ0JBQU0sUUFBUSxZQUFZLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQztBQUM3RSxTQUFHLGlCQUFpQixTQUFTLE1BQU0sS0FBSyxTQUFTLEdBQUcsQ0FBQztBQUFBLElBQ3ZEO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFHUSxpQkFBaUIsTUFBbUIsTUFBOEI7QUFDeEUsVUFBTSxRQUFRLGlCQUFpQixLQUFLLElBQUksTUFBTSxTQUFTLEdBQUcsSUFBSTtBQUM5RCxRQUFJLE1BQU0sV0FBVyxHQUFHO0FBQ3RCLFdBQUssVUFBVSxFQUFFLEtBQUssWUFBWSxNQUFNLEdBQUcsSUFBSSxtQ0FBVSxDQUFDO0FBQzFEO0FBQUEsSUFDRjtBQUdBLFVBQU0sT0FBTyxLQUFLLFVBQVUsRUFBRSxLQUFLLGNBQWMsQ0FBQztBQUNsRCxRQUFJO0FBQ0osZUFBVyxRQUFRLE9BQU87QUFDeEIsWUFBTSxTQUFTLEtBQUssTUFBTSxlQUFlLEtBQUs7QUFDOUMsVUFBSSxPQUFRLGdCQUFlO0FBQzNCLFlBQU0sS0FBSyxLQUFLLFVBQVUsRUFBRSxLQUFLLGlCQUFpQixTQUFTLFlBQVksSUFBSSxDQUFDO0FBQzVFLFNBQUcsVUFBVSxFQUFFLEtBQUssZUFBZSxNQUFNLEtBQUssTUFBTSxDQUFDO0FBQ3JELFlBQU0sT0FBTyxHQUFHLFVBQVUsRUFBRSxLQUFLLGNBQWMsQ0FBQztBQUNoRCxXQUFLLFdBQVcsRUFBRSxNQUFNLEdBQUcsS0FBSyxNQUFNLE1BQU0sVUFBSyxDQUFDO0FBQ2xELFdBQUssV0FBVyxFQUFFLE1BQU0sUUFBUSxZQUFZLElBQUksQ0FBQyxFQUFFLENBQUM7QUFDcEQsU0FBRyxpQkFBaUIsU0FBUyxNQUFNLEtBQUssU0FBUyxLQUFLLEdBQUcsQ0FBQztBQUFBLElBQzVEO0FBR0EsUUFBSSxjQUFjLFdBQVcsYUFBYSxRQUFRLFNBQVMsR0FBRztBQUM1RCxZQUFNLFFBQVEsS0FBSyxVQUFVLEVBQUUsS0FBSyxrQkFBa0IsQ0FBQztBQUN2RCxZQUFNLFVBQVU7QUFBQSxRQUNkLEtBQUs7QUFBQSxRQUNMLE1BQU0sVUFBSyxhQUFhLEtBQUs7QUFBQSxNQUMvQixDQUFDO0FBQ0QsWUFBTSxZQUFZLE1BQU0sVUFBVSxFQUFFLEtBQUssaUJBQWlCLENBQUM7QUFDM0QsaUJBQVcsT0FBTyxhQUFhLFNBQVM7QUFDdEMsYUFBSyxpQkFBaUIsV0FBVyxHQUFHO0FBQUEsTUFDdEM7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBRVEsaUJBQWlCLE1BQW1CLEtBQXVCO0FBQ2pFLFVBQU0sU0FBUyxLQUFLLE1BQU0sZUFBZSxJQUFJO0FBQzdDLFVBQU0sS0FBSyxLQUFLLFVBQVUsRUFBRSxLQUFLLG9CQUFvQixTQUFTLFlBQVksSUFBSSxDQUFDO0FBQy9FLE9BQUcsVUFBVSxFQUFFLEtBQUssa0JBQWtCLE1BQU0sSUFBSSxNQUFNLENBQUM7QUFDdkQsVUFBTSxPQUFPLEdBQUcsVUFBVSxFQUFFLEtBQUssaUJBQWlCLENBQUM7QUFDbkQsU0FBSyxXQUFXLEVBQUUsTUFBTSxHQUFHLElBQUksTUFBTSxNQUFNLEdBQUcsQ0FBQztBQUMvQyxTQUFLLFdBQVcsRUFBRSxNQUFNLFFBQVEsY0FBYyxJQUFJLEtBQUssQ0FBQyxFQUFFLENBQUM7QUFDM0QsT0FBRyxpQkFBaUIsU0FBUyxDQUFDLE1BQU07QUFDbEMsUUFBRSxnQkFBZ0I7QUFDbEIsV0FBSyxTQUFTLElBQUksR0FBRztBQUFBLElBQ3ZCLENBQUM7QUFBQSxFQUNIO0FBQUE7QUFBQSxFQUdRLFNBQVMsS0FBbUI7QUFDbEMsUUFBSSxLQUFLLE1BQU0sZUFBZSxLQUFLO0FBRWpDLFdBQUssTUFBTSxhQUFhO0FBQ3hCLFdBQUssTUFBTSxhQUFhO0FBQUEsSUFDMUIsT0FBTztBQUVMLFdBQUssTUFBTSxhQUFhO0FBQ3hCLFdBQUssTUFBTSxhQUFhO0FBQUEsSUFDMUI7QUFDQSxTQUFLLE9BQU87QUFBQSxFQUNkO0FBQUEsRUFFUSxTQUFTLEtBQW1CO0FBQ2xDLFNBQUssTUFBTSxhQUFhLEtBQUssTUFBTSxlQUFlLE1BQU0sT0FBTztBQUMvRCxTQUFLLE9BQU87QUFBQSxFQUNkO0FBQUE7QUFBQSxFQUlRLGVBQXFCO0FBQzNCLFVBQU0sU0FBUyxLQUFLLE9BQU8sU0FBUztBQUNwQyxRQUFJLE9BQU8sV0FBVyxFQUFHO0FBRXpCLFVBQU0sTUFBTSxLQUFLLFVBQVUsVUFBVSxFQUFFLEtBQUssYUFBYSxDQUFDO0FBQzFELFFBQUksV0FBVyxFQUFFLEtBQUssZ0JBQWdCLE1BQU0sWUFBSyxDQUFDO0FBQ2xELFVBQU0sT0FBTyxJQUFJLFVBQVUsRUFBRSxLQUFLLGNBQWMsQ0FBQztBQUVqRCxlQUFXLFFBQVEsUUFBUTtBQUN6QixZQUFNLE1BQU0sS0FBSyxJQUFJLE1BQU0sc0JBQXNCLElBQUk7QUFDckQsWUFBTSxRQUFRLEVBQUUsZUFBZTtBQUMvQixZQUFNLE9BQU8sS0FBSyxXQUFXO0FBQUEsUUFDM0IsS0FBSyx5QkFBeUIsUUFBUSxjQUFjO0FBQUEsUUFDcEQsTUFBTSxZQUFZLElBQUk7QUFBQSxNQUN4QixDQUFDO0FBQ0QsV0FBSyxRQUFRLFNBQVMsUUFBUSwyQkFBTyxJQUFJLEtBQUssSUFBSTtBQUNsRCxXQUFLLGlCQUFpQixTQUFTLE1BQU07QUFDbkMsWUFBSSxPQUFPO0FBQ1QsY0FBSSx3QkFBTyx1Q0FBUyxJQUFJLEVBQUU7QUFDMUI7QUFBQSxRQUNGO0FBQ0EsWUFBSSxlQUFlLHdCQUFPO0FBQ3hCLGVBQUssSUFBSSxVQUFVLFFBQVEsS0FBSyxFQUFFLFNBQVMsR0FBRztBQUFBLFFBQ2hEO0FBQUEsTUFDRixDQUFDO0FBQ0QsV0FBSyxpQkFBaUIsZUFBZSxDQUFDLE1BQU07QUFDMUMsVUFBRSxlQUFlO0FBQ2pCLGNBQU0sT0FBTyxJQUFJLHNCQUFLO0FBQ3RCLGFBQUs7QUFBQSxVQUFRLENBQUMsT0FDWixHQUNHLFNBQVMsa0JBQVEsRUFDakIsUUFBUSxTQUFTLEVBQ2pCLFFBQVEsWUFBWTtBQUNuQixrQkFBTSxLQUFLLFVBQVUsSUFBSTtBQUFBLFVBQzNCLENBQUM7QUFBQSxRQUNMO0FBQ0EsYUFBSyxpQkFBaUIsQ0FBQztBQUFBLE1BQ3pCLENBQUM7QUFBQSxJQUNIO0FBQUEsRUFDRjtBQUFBLEVBRUEsTUFBYyxVQUFVLE1BQTZCO0FBQ25ELFVBQU0sTUFBTSxLQUFLLE9BQU8sU0FBUztBQUNqQyxVQUFNLE1BQU0sSUFBSSxRQUFRLElBQUk7QUFDNUIsUUFBSSxPQUFPLEVBQUcsS0FBSSxPQUFPLEtBQUssQ0FBQztBQUFBLFFBQzFCLEtBQUksS0FBSyxJQUFJO0FBQ2xCLFVBQU0sS0FBSyxPQUFPLGFBQWE7QUFDL0IsU0FBSyxPQUFPO0FBQUEsRUFDZDtBQUFBO0FBQUEsRUFHUSxtQkFBOEI7QUFDcEMsVUFBTSxLQUFLLEtBQUssTUFBTTtBQUN0QixRQUFJLENBQUMsR0FBSSxRQUFPLENBQUM7QUFFakIsUUFBSSxLQUFLLE1BQU0sUUFBUSxRQUFRO0FBQzdCLFlBQU0sRUFBRSxPQUFBQyxPQUFNLElBQUksb0JBQW9CLGlCQUFpQixLQUFLLEdBQUcsQ0FBQztBQUNoRSxZQUFNQyxRQUFPRCxPQUFNLElBQUksRUFBRTtBQUN6QixhQUFPQyxRQUFPLGNBQWNBLE1BQUssS0FBSyxJQUFJLENBQUM7QUFBQSxJQUM3QztBQUVBLFVBQU0sUUFBUSxpQkFBaUIsS0FBSyxJQUFJLE1BQU0sU0FBUyxHQUFHLEtBQUssTUFBTSxHQUFHO0FBQ3hFLFVBQU0sT0FBTyxNQUFNLEtBQUssQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFO0FBQzNDLFFBQUksQ0FBQyxLQUFNLFFBQU8sQ0FBQztBQUVuQixRQUFJLEtBQUssTUFBTSxZQUFZO0FBQ3pCLFlBQU0sTUFBTSxLQUFLLFNBQVMsS0FBSyxDQUFDLE1BQU0sRUFBRSxRQUFRLEtBQUssTUFBTSxVQUFVO0FBRXJFLFVBQUksSUFBSyxRQUFPLGNBQWMsSUFBSSxLQUFLO0FBQUEsSUFDekM7QUFDQSxXQUFPLGNBQWMsS0FBSyxLQUFLO0FBQUEsRUFDakM7QUFBQSxFQUVRLGlCQUF1QjtBQUM3QixTQUFLLFFBQVEsT0FBTztBQUNwQixTQUFLLFNBQVM7QUFDZCxVQUFNLE9BQU8sS0FBSztBQUNsQixRQUFJLENBQUMsS0FBTTtBQUNYLFFBQUksQ0FBQyxLQUFLLE1BQU0sV0FBWTtBQUU1QixVQUFNLFFBQVEsS0FBSyxpQkFBaUI7QUFDcEMsVUFBTSxXQUFXLEtBQUssWUFBWSxLQUFLO0FBQ3ZDLFVBQU0sT0FBTyxLQUFLLFVBQVUsRUFBRSxLQUFLLGVBQWUsQ0FBQztBQUNuRCxTQUFLLFNBQVM7QUFFZCxVQUFNLFFBQVEsS0FBSyxVQUFVLEVBQUUsS0FBSyxxQkFBcUIsQ0FBQztBQUMxRCxVQUFNLFdBQVc7QUFBQSxNQUNmLE1BQU0sR0FBRyxTQUFTLE1BQU0sR0FBRyxTQUFTLFdBQVcsTUFBTSxTQUFTLE1BQU0sTUFBTSxNQUFNLEtBQUssRUFBRSxzQkFDckYsS0FBSyxNQUFNLGFBQWEsbUNBQVUsRUFDcEM7QUFBQSxJQUNGLENBQUM7QUFDRCxVQUFNLFdBQVcsTUFBTSxXQUFXLEVBQUUsS0FBSyxzQkFBc0IsTUFBTSxPQUFJLENBQUM7QUFDMUUsYUFBUyxRQUFRLGNBQWMsMEJBQU07QUFDckMsYUFBUyxpQkFBaUIsU0FBUyxNQUFNO0FBQ3ZDLFdBQUssTUFBTSxhQUFhO0FBQ3hCLFdBQUssTUFBTSxhQUFhO0FBQ3hCLFdBQUssT0FBTztBQUFBLElBQ2QsQ0FBQztBQUVELFFBQUksU0FBUyxXQUFXLEdBQUc7QUFDekIsV0FBSyxVQUFVLEVBQUUsS0FBSyxZQUFZLE1BQU0saUNBQVEsQ0FBQztBQUNqRDtBQUFBLElBQ0Y7QUFFQSxlQUFXLEtBQUssU0FBUyxNQUFNLEdBQUcsZUFBZSxHQUFHO0FBQ2xELFlBQU0sT0FBTyxLQUFLLFVBQVUsRUFBRSxLQUFLLGVBQWUsQ0FBQztBQUNuRCxXQUFLLFdBQVcsRUFBRSxLQUFLLGdCQUFnQixNQUFNLEVBQUUsS0FBSyxDQUFDO0FBQ3JELFdBQUssV0FBVyxFQUFFLEtBQUssaUJBQWlCLE1BQU0sUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFDO0FBQ2hFLFlBQU0sV0FBVyxLQUFLLE9BQU8sU0FBUyxZQUFZLFNBQVMsRUFBRSxJQUFJO0FBQ2pFLFlBQU0sU0FBUyxLQUFLLFdBQVc7QUFBQSxRQUM3QixLQUFLLGdCQUFnQixXQUFXLGVBQWU7QUFBQSxRQUMvQyxNQUFNO0FBQUEsTUFDUixDQUFDO0FBQ0QsYUFBTyxRQUFRLGNBQWMsV0FBVyxxQkFBVyxvQ0FBVztBQUM5RCxhQUFPLFFBQVEsU0FBUyxXQUFXLHFCQUFXLG9DQUFXO0FBQ3pELGFBQU8saUJBQWlCLFNBQVMsT0FBTyxNQUFNO0FBQzVDLFVBQUUsZ0JBQWdCO0FBQ2xCLGNBQU0sS0FBSyxVQUFVLEVBQUUsSUFBSTtBQUFBLE1BQzdCLENBQUM7QUFDRCxXQUFLLFFBQVEsU0FBUyxFQUFFLElBQUk7QUFDNUIsV0FBSyxpQkFBaUIsU0FBUyxNQUFNO0FBQ25DLGFBQUssSUFBSSxVQUFVLFFBQVEsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJO0FBQUEsTUFDbEQsQ0FBQztBQUFBLElBQ0g7QUFFQSxRQUFJLFNBQVMsU0FBUyxpQkFBaUI7QUFDckMsV0FBSyxVQUFVO0FBQUEsUUFDYixLQUFLO0FBQUEsUUFDTCxNQUFNLHVCQUFRLFNBQVMsU0FBUyxlQUFlO0FBQUEsTUFDakQsQ0FBQztBQUFBLElBQ0g7QUFBQSxFQUNGO0FBQUEsRUFFUSxZQUFZLE9BQTZCO0FBQy9DLFVBQU0sSUFBSSxLQUFLLE1BQU0sT0FBTyxLQUFLO0FBQ2pDLFFBQUksQ0FBQyxFQUFHLFFBQU87QUFDZixVQUFNLGFBQVMscUNBQW1CLENBQUM7QUFDbkMsVUFBTSxTQUE0QyxDQUFDO0FBQ25ELGVBQVcsS0FBSyxPQUFPO0FBQ3JCLFlBQU0sSUFBSSxPQUFPLEVBQUUsSUFBSTtBQUN2QixVQUFJLEVBQUcsUUFBTyxLQUFLLEVBQUUsS0FBSyxHQUFHLE9BQU8sRUFBRSxNQUFNLENBQUM7QUFBQSxJQUMvQztBQUNBLFdBQU8sS0FBSyxDQUFDLEdBQUcsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLO0FBQ3ZDLFdBQU8sT0FBTyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUc7QUFBQSxFQUNoQztBQUNGO0FBRUEsU0FBUyxjQUFjLE9BQTZCO0FBQ2xELFNBQU8sQ0FBQyxHQUFHLEtBQUssRUFBRSxLQUFLLENBQUMsR0FBRyxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUs7QUFDcEQ7QUFFQSxTQUFTLFFBQVEsSUFBb0I7QUFDbkMsTUFBSSxDQUFDLEdBQUksUUFBTztBQUNoQixRQUFNLElBQUksSUFBSSxLQUFLLEVBQUU7QUFDckIsUUFBTSxJQUFJLENBQUMsTUFBYyxFQUFFLFNBQVMsRUFBRSxTQUFTLEdBQUcsR0FBRztBQUNyRCxTQUFPLEdBQUcsRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLFNBQVMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDeEY7QUFFQSxTQUFTLFlBQVksTUFBc0I7QUFDekMsUUFBTSxPQUFPLEtBQUssTUFBTSxHQUFHLEVBQUUsSUFBSSxLQUFLO0FBQ3RDLFNBQU8sS0FBSyxRQUFRLFVBQVUsRUFBRTtBQUNsQzs7O0FFdGZBLElBQUFDLG1CQUEyQjtBQUdwQixTQUFTLGFBQWEsS0FBVSxXQUE4QjtBQUNuRSxZQUFVLE1BQU07QUFDaEIsWUFBVSxTQUFTLFdBQVc7QUFFOUIsWUFBVSxXQUFXLEVBQUUsS0FBSyxtQkFBbUIsTUFBTSxlQUFLLENBQUM7QUFFM0QsUUFBTSxRQUFRLElBQUksVUFBVSxpQkFBaUIsRUFBRSxNQUFNLEdBQUcsRUFBRTtBQUMxRCxNQUFJLE1BQU0sV0FBVyxHQUFHO0FBQ3RCLGNBQVUsV0FBVyxFQUFFLEtBQUssbUJBQW1CLE1BQU0saUNBQVEsQ0FBQztBQUM5RDtBQUFBLEVBQ0Y7QUFFQSxhQUFXLEtBQUssT0FBTztBQUNyQixVQUFNLE9BQU8sRUFBRSxNQUFNLEdBQUcsRUFBRSxJQUFJLEtBQUs7QUFDbkMsVUFBTSxPQUFPLFVBQVUsV0FBVyxFQUFFLEtBQUssV0FBVyxNQUFNQyxhQUFZLElBQUksRUFBRSxDQUFDO0FBQzdFLFNBQUssUUFBUSxTQUFTLENBQUM7QUFDdkIsU0FBSyxpQkFBaUIsU0FBUyxNQUFNO0FBQ25DLFlBQU0sSUFBSSxJQUFJLE1BQU0sc0JBQXNCLENBQUM7QUFDM0MsVUFBSSxhQUFhLHdCQUFPO0FBQ3RCLFlBQUksVUFBVSxRQUFRLEtBQUssRUFBRSxTQUFTLENBQUM7QUFBQSxNQUN6QztBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFDRjtBQUVBLFNBQVNBLGFBQVksTUFBc0I7QUFFekMsU0FBTyxLQUFLLFNBQVMsS0FBSyxJQUFJLEtBQUssTUFBTSxHQUFHLEVBQUUsSUFBSTtBQUNwRDs7O0FDL0JBLElBQUFDLG9CQUF5Qzs7O0FDZXpDLElBQU1DLE1BQUssQ0FBQyxNQUFjLEVBQUUsU0FBUyxFQUFFLFNBQVMsR0FBRyxHQUFHO0FBRS9DLFNBQVMsUUFBUSxHQUFpQjtBQUN2QyxTQUFPLEdBQUcsRUFBRSxZQUFZLENBQUMsSUFBSUEsSUFBRyxFQUFFLFNBQVMsSUFBSSxDQUFDLENBQUMsSUFBSUEsSUFBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ3RFO0FBRU8sU0FBUyxRQUFRLE1BQVksR0FBaUI7QUFDbkQsUUFBTSxJQUFJLElBQUksS0FBSyxLQUFLLFlBQVksR0FBRyxLQUFLLFNBQVMsR0FBRyxLQUFLLFFBQVEsQ0FBQztBQUN0RSxJQUFFLFFBQVEsRUFBRSxRQUFRLElBQUksQ0FBQztBQUN6QixTQUFPO0FBQ1Q7QUFHTyxTQUFTLFdBQVcsR0FBaUI7QUFFMUMsUUFBTSxNQUFNLElBQUksS0FBSyxLQUFLLElBQUksRUFBRSxZQUFZLEdBQUcsRUFBRSxTQUFTLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUN6RSxRQUFNLE1BQU0sSUFBSSxVQUFVLEtBQUs7QUFDL0IsTUFBSSxXQUFXLElBQUksV0FBVyxJQUFJLElBQUksR0FBRztBQUN6QyxRQUFNLFlBQVksSUFBSSxLQUFLLEtBQUssSUFBSSxJQUFJLGVBQWUsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUMvRCxRQUFNLFNBQVMsS0FBSyxPQUFRLElBQUksUUFBUSxJQUFJLFVBQVUsUUFBUSxLQUFLLFFBQVksS0FBSyxDQUFDO0FBQ3JGLFNBQU8sR0FBRyxJQUFJLGVBQWUsQ0FBQyxLQUFLQSxJQUFHLE1BQU0sQ0FBQztBQUMvQztBQUVBLFNBQVMsYUFBYSxHQUFpQjtBQUNyQyxTQUFPLENBQUMsZ0JBQU0sZ0JBQU0sZ0JBQU0sZ0JBQU0sZ0JBQU0sZ0JBQU0sY0FBSSxFQUFFLEVBQUUsT0FBTyxDQUFDO0FBQzlEO0FBUU8sU0FBUyxpQkFBaUIsT0FBZSxPQUFnQztBQUM5RSxRQUFNLFVBQXNCLENBQUM7QUFDN0IsUUFBTSxhQUF5QixDQUFDO0FBQ2hDLFFBQU0sY0FBMEIsQ0FBQztBQUVqQyxhQUFXLEtBQUssT0FBTztBQUNyQixRQUFJLEVBQUUsV0FBVyxTQUFVO0FBQzNCLGVBQVcsS0FBSyxFQUFFLE9BQU87QUFDdkIsVUFBSSxFQUFFLE9BQU8sUUFBUztBQUN0QixZQUFNLE1BQU0sT0FBTyxFQUFFLE1BQU07QUFDM0IsVUFBSSxDQUFDLEtBQUs7QUFDUixvQkFBWSxLQUFLLENBQUM7QUFDbEI7QUFBQSxNQUNGO0FBQ0EsVUFBSSxNQUFNLE1BQU8sU0FBUSxLQUFLLENBQUM7QUFBQSxlQUN0QixRQUFRLE1BQU8sWUFBVyxLQUFLLENBQUM7QUFBQSxJQUUzQztBQUFBLEVBQ0Y7QUFHQSxVQUFRLEtBQUssQ0FBQyxHQUFHLE1BQU0sT0FBTyxPQUFPLEVBQUUsTUFBTSxHQUFJLE9BQU8sRUFBRSxNQUFNLENBQUUsQ0FBQztBQUVuRSxRQUFNLFNBQTBCLENBQUM7QUFDakMsTUFBSSxRQUFRLFNBQVMsR0FBRztBQUN0QixXQUFPLEtBQUs7QUFBQSxNQUNWLEtBQUs7QUFBQSxNQUNMLE9BQU87QUFBQSxNQUNQLFNBQVMsT0FBTyxRQUFRLE1BQU07QUFBQSxNQUM5QixPQUFPO0FBQUEsTUFDUCxXQUFXO0FBQUEsSUFDYixDQUFDO0FBQUEsRUFDSDtBQUNBLFNBQU8sS0FBSztBQUFBLElBQ1YsS0FBSztBQUFBLElBQ0wsT0FBTztBQUFBLElBQ1AsU0FBUyxPQUFPLFdBQVcsTUFBTTtBQUFBLElBQ2pDLE9BQU87QUFBQSxJQUNQLFdBQVc7QUFBQSxFQUNiLENBQUM7QUFDRCxNQUFJLFlBQVksU0FBUyxHQUFHO0FBQzFCLFdBQU8sS0FBSztBQUFBLE1BQ1YsS0FBSztBQUFBLE1BQ0wsT0FBTztBQUFBLE1BQ1AsU0FBUyxPQUFPLFlBQVksTUFBTTtBQUFBLE1BQ2xDLE9BQU87QUFBQSxNQUNQLFdBQVc7QUFBQTtBQUFBLElBQ2IsQ0FBQztBQUFBLEVBQ0g7QUFDQSxTQUFPO0FBQ1Q7QUFNTyxTQUFTLG9CQUFvQixPQUFlLFdBQWtDO0FBQ25GLFFBQU0sUUFBUSxRQUFRLFNBQVM7QUFDL0IsUUFBTSxXQUFXLFFBQVEsUUFBUSxXQUFXLENBQUMsQ0FBQztBQUU5QyxRQUFNLFNBQVMsb0JBQUksSUFBd0I7QUFDM0MsUUFBTSxVQUFVLG9CQUFJLElBQXdCO0FBRTVDLGFBQVcsS0FBSyxPQUFPO0FBQ3JCLFFBQUksRUFBRSxXQUFXLFNBQVU7QUFDM0IsZUFBVyxLQUFLLEVBQUUsT0FBTztBQUN2QixVQUFJLEVBQUUsT0FBTyxRQUFTO0FBQ3RCLFlBQU0sTUFBTSxPQUFPLEVBQUUsTUFBTTtBQUMzQixVQUFJLENBQUMsSUFBSztBQUNWLFVBQUksT0FBTyxNQUFPO0FBQ2xCLFVBQUksT0FBTyxVQUFVO0FBQ25CLGdCQUFRLFFBQVEsS0FBSyxDQUFDO0FBQUEsTUFDeEIsT0FBTztBQUNMLGNBQU0sS0FBSyxXQUFXLFVBQVUsR0FBRyxDQUFDO0FBQ3BDLGdCQUFRLFNBQVMsSUFBSSxDQUFDO0FBQUEsTUFDeEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUVBLFFBQU0sU0FBMEIsQ0FBQztBQUdqQyxXQUFTLElBQUksR0FBRyxLQUFLLEdBQUcsS0FBSztBQUMzQixVQUFNLElBQUksUUFBUSxXQUFXLENBQUM7QUFDOUIsVUFBTSxNQUFNLFFBQVEsQ0FBQztBQUNyQixVQUFNLFFBQVEsT0FBTyxJQUFJLEdBQUc7QUFDNUIsUUFBSSxDQUFDLFNBQVMsTUFBTSxXQUFXLEVBQUc7QUFDbEMsVUFBTSxLQUFLLENBQUMsR0FBRyxNQUFNLGVBQWUsR0FBRyxDQUFDLENBQUM7QUFDekMsVUFBTSxRQUFRLE1BQU0sSUFBSSxxQkFBUSxHQUFHLEtBQUssR0FBRyxHQUFHLFNBQU0sYUFBYSxDQUFDLENBQUM7QUFDbkUsV0FBTyxLQUFLO0FBQUEsTUFDVixLQUFLLE9BQU8sR0FBRztBQUFBLE1BQ2Y7QUFBQSxNQUNBLFNBQVMsT0FBTyxNQUFNLE1BQU07QUFBQSxNQUM1QixPQUFPO0FBQUEsTUFDUCxXQUFXO0FBQUEsSUFDYixDQUFDO0FBQUEsRUFDSDtBQUdBLFFBQU0sV0FBVyxDQUFDLEdBQUcsUUFBUSxLQUFLLENBQUMsRUFBRSxLQUFLO0FBQzFDLGFBQVcsTUFBTSxVQUFVO0FBQ3pCLFVBQU0sUUFBUSxRQUFRLElBQUksRUFBRTtBQUM1QixVQUFNLEtBQUssQ0FBQyxHQUFHLE1BQU0sT0FBTyxPQUFPLEVBQUUsTUFBTSxHQUFJLE9BQU8sRUFBRSxNQUFNLENBQUUsQ0FBQztBQUNqRSxXQUFPLEtBQUs7QUFBQSxNQUNWLEtBQUssUUFBUSxFQUFFO0FBQUEsTUFDZixPQUFPLFVBQUssRUFBRTtBQUFBLE1BQ2QsU0FBUyxPQUFPLE1BQU0sTUFBTTtBQUFBLE1BQzVCLE9BQU87QUFBQSxNQUNQLFdBQVc7QUFBQSxJQUNiLENBQUM7QUFBQSxFQUNIO0FBRUEsU0FBTztBQUNUO0FBTU8sU0FBUyxlQUFlLE9BQWdDO0FBQzdELFFBQU0sU0FBMEIsQ0FBQztBQUNqQyxhQUFXLEtBQUssT0FBTztBQUNyQixVQUFNLFlBQVksRUFBRSxNQUFNLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxPQUFPLE9BQU8sRUFBRTtBQUMzRCxVQUFNLFFBQVEsRUFBRSxNQUFNO0FBQ3RCLFVBQU0sU0FBUyxFQUFFLFdBQVcsV0FBVyxLQUFLLEtBQUssRUFBRSxNQUFNO0FBQ3pELFdBQU8sS0FBSztBQUFBLE1BQ1YsS0FBSyxRQUFRLEVBQUUsSUFBSTtBQUFBLE1BQ25CLE9BQU8sR0FBRyxFQUFFLEtBQUssR0FBRyxNQUFNO0FBQUEsTUFDMUIsU0FBUyxHQUFHLFNBQVMsSUFBSSxLQUFLO0FBQUEsTUFDOUIsT0FBTyxFQUFFO0FBQUEsTUFDVCxXQUFXLEVBQUUsV0FBVztBQUFBO0FBQUEsSUFDMUIsQ0FBQztBQUFBLEVBQ0g7QUFDQSxTQUFPO0FBQ1Q7QUFJQSxTQUFTLE9BQU8sR0FBVyxHQUFtQjtBQUM1QyxTQUFPLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJO0FBQ2xDO0FBRUEsU0FBUyxlQUFlLEdBQWEsR0FBcUI7QUFFeEQsUUFBTSxJQUFJLE9BQU8sRUFBRSxXQUFXLEVBQUUsU0FBUztBQUN6QyxTQUFPLE1BQU0sSUFBSSxJQUFJLEVBQUUsYUFBYSxFQUFFO0FBQ3hDO0FBRUEsU0FBUyxRQUFXLEdBQXFCLEdBQVcsR0FBWTtBQUM5RCxRQUFNLE1BQU0sRUFBRSxJQUFJLENBQUM7QUFDbkIsTUFBSSxJQUFLLEtBQUksS0FBSyxDQUFDO0FBQUEsTUFDZCxHQUFFLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNuQjtBQUVBLFNBQVMsVUFBVSxHQUFpQjtBQUNsQyxRQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFNLFNBQVMsR0FBRyxFQUFFLENBQUM7QUFDMUQsU0FBTyxJQUFJLEtBQUssR0FBRyxLQUFLLEdBQUcsQ0FBQztBQUM5Qjs7O0FEckxPLElBQU0sZUFBTixNQUFtQjtBQUFBLEVBV3hCLFlBQVksS0FBVSxRQUF5QixXQUF3QjtBQVB2RSxTQUFRLFFBQWdCLENBQUM7QUFHekI7QUFBQSxTQUFRLGtCQUFrQjtBQUUxQjtBQUFBLFNBQVEsZUFBZSxvQkFBSSxJQUFZO0FBR3JDLFNBQUssTUFBTTtBQUNYLFNBQUssU0FBUztBQUNkLFNBQUssT0FBTztBQUNaLFNBQUssS0FBSyxTQUFTLFVBQVU7QUFDN0IsU0FBSyxLQUFLLFNBQVMsZ0JBQWdCO0FBQ25DLFVBQU0sTUFBTSxvQkFBSSxLQUFLO0FBQ3JCLFNBQUssUUFBUTtBQUFBLE1BQ1gsVUFBVSxPQUFPLFNBQVM7QUFBQSxNQUMxQixXQUFXLG9CQUFJLElBQUk7QUFBQSxNQUNuQixXQUFXO0FBQUEsTUFDWCxTQUFTLElBQUksWUFBWTtBQUFBLE1BQ3pCLFVBQVUsSUFBSSxTQUFTO0FBQUEsTUFDdkIsY0FBYztBQUFBLElBQ2hCO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFHQSx1QkFBZ0M7QUFDOUIsUUFBSSxLQUFLLGlCQUFpQjtBQUN4QixXQUFLLGtCQUFrQjtBQUN2QixhQUFPO0FBQUEsSUFDVDtBQUNBLFdBQU87QUFBQSxFQUNUO0FBQUEsRUFFQSxNQUFNLFNBQXdCO0FBRTVCLFVBQU0sT0FBTyxLQUFLLEtBQUssY0FBMkIsZ0JBQWdCO0FBQ2xFLFFBQUksS0FBTSxNQUFLLE1BQU0sWUFBWSxLQUFLO0FBRXRDLFNBQUssUUFBUSxNQUFNLFVBQVUsS0FBSyxHQUFHO0FBRXJDLFNBQUssS0FBSyxNQUFNO0FBQ2hCLFNBQUssV0FBVztBQUNoQixTQUFLLFdBQVc7QUFBQSxFQUNsQjtBQUFBLEVBRVEsYUFBbUI7QUFDekIsVUFBTSxPQUFPLEtBQUssS0FBSyxVQUFVLEVBQUUsS0FBSyw4QkFBOEIsQ0FBQztBQUN2RSxTQUFLLFdBQVcsRUFBRSxLQUFLLGtCQUFrQixNQUFNLHlCQUFRLENBQUM7QUFFeEQsVUFBTSxPQUFPLEtBQUssVUFBVSxFQUFFLEtBQUssZ0JBQWdCLENBQUM7QUFDcEQsVUFBTSxLQUFLLENBQUMsS0FBa0IsVUFBa0I7QUFDOUMsWUFBTSxLQUFLLEtBQUssV0FBVyxFQUFFLEtBQUssZ0JBQWdCLE1BQU0sTUFBTSxDQUFDO0FBQy9ELFVBQUksS0FBSyxNQUFNLGFBQWEsSUFBSyxJQUFHLFNBQVMsUUFBUTtBQUNyRCxTQUFHLGlCQUFpQixTQUFTLE1BQU07QUFDakMsWUFBSSxLQUFLLE1BQU0sYUFBYSxJQUFLO0FBQ2pDLGFBQUssTUFBTSxXQUFXO0FBQ3RCLGFBQUssT0FBTztBQUFBLE1BQ2QsQ0FBQztBQUFBLElBQ0g7QUFDQSxPQUFHLFNBQVMsY0FBSTtBQUNoQixPQUFHLFlBQVksY0FBSTtBQUNuQixPQUFHLE9BQU8sY0FBSTtBQUNkLE9BQUcsWUFBWSxjQUFJO0FBRW5CLFVBQU0sVUFBVSxLQUFLLFVBQVUsRUFBRSxLQUFLLG1CQUFtQixDQUFDO0FBQzFELFVBQU0sU0FBUyxRQUFRLFdBQVcsRUFBRSxLQUFLLGdCQUFnQixNQUFNLGlCQUFPLENBQUM7QUFDdkUsV0FBTyxhQUFhLGNBQWMsc0NBQVE7QUFDMUMsV0FBTyxpQkFBaUIsU0FBUyxNQUFNO0FBQ3JDLFVBQUksa0JBQWtCLEtBQUssR0FBRyxFQUFFLEtBQUs7QUFBQSxJQUN2QyxDQUFDO0FBQ0QsVUFBTSxhQUFhLFFBQVEsV0FBVyxFQUFFLEtBQUssZ0JBQWdCLE1BQU0saUJBQU8sQ0FBQztBQUMzRSxlQUFXLGFBQWEsY0FBYywwQkFBTTtBQUM1QyxlQUFXLGlCQUFpQixTQUFTLE1BQU07QUFDekMsVUFBSSxhQUFhLEtBQUssR0FBRyxFQUFFLEtBQUs7QUFBQSxJQUNsQyxDQUFDO0FBQUEsRUFDSDtBQUFBLEVBRVEsYUFBbUI7QUFDekIsVUFBTSxPQUFPLEtBQUssS0FBSyxVQUFVLEVBQUUsS0FBSyw4QkFBOEIsQ0FBQztBQUV2RSxRQUFJLEtBQUssTUFBTSxhQUFhLFlBQVk7QUFDdEMsV0FBSyxlQUFlLElBQUk7QUFDeEIsNEJBQXNCLE1BQU8sS0FBSyxZQUFZLEtBQUssTUFBTSxTQUFVO0FBQ25FO0FBQUEsSUFDRjtBQUVBLFFBQUk7QUFDSixRQUFJLEtBQUssTUFBTSxhQUFhLFNBQVM7QUFDbkMsZUFBUyxpQkFBaUIsS0FBSyxPQUFPLGFBQWEsQ0FBQztBQUFBLElBQ3RELFdBQVcsS0FBSyxNQUFNLGFBQWEsWUFBWTtBQUM3QyxlQUFTLG9CQUFvQixLQUFLLE9BQU8sb0JBQUksS0FBSyxDQUFDO0FBQUEsSUFDckQsT0FBTztBQUNMLGVBQVMsZUFBZSxLQUFLLEtBQUs7QUFDbEMsVUFBSSxLQUFLLE9BQU8sU0FBUyxlQUFlO0FBQ3RDLG1CQUFXLEtBQUssUUFBUTtBQUN0QixZQUFFLFFBQVEsRUFBRSxNQUFNLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxPQUFPLE9BQU87QUFDakQsWUFBRSxVQUFVLE9BQU8sRUFBRSxNQUFNLE1BQU07QUFBQSxRQUNuQztBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBRUEsUUFBSSxPQUFPLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxXQUFXLENBQUMsR0FBRztBQUM3QyxXQUFLLFVBQVUsRUFBRSxLQUFLLFlBQVksTUFBTSxLQUFLLFVBQVUsRUFBRSxDQUFDO0FBQzFEO0FBQUEsSUFDRjtBQUVBLGVBQVcsS0FBSyxRQUFRO0FBQ3RCLFdBQUssWUFBWSxNQUFNLENBQUM7QUFBQSxJQUMxQjtBQUdBLDBCQUFzQixNQUFNO0FBQzFCLFdBQUssWUFBWSxLQUFLLE1BQU07QUFBQSxJQUM5QixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBRVEsWUFBb0I7QUFDMUIsWUFBUSxLQUFLLE1BQU0sVUFBVTtBQUFBLE1BQzNCLEtBQUs7QUFDSCxlQUFPO0FBQUEsTUFDVCxLQUFLO0FBQ0gsZUFBTztBQUFBLE1BQ1QsS0FBSztBQUNILFlBQUksS0FBSyxNQUFNLFdBQVcsRUFBRyxRQUFPO0FBQ3BDLFlBQUksS0FBSyxPQUFPLFNBQVM7QUFDdkIsaUJBQU87QUFDVCxlQUFPO0FBQUEsTUFDVCxLQUFLO0FBQ0gsZUFBTztBQUFBLElBQ1g7QUFBQSxFQUNGO0FBQUEsRUFFUSxZQUFZLFFBQXFCLEdBQXdCO0FBRS9ELFFBQUksQ0FBQyxLQUFLLGFBQWEsSUFBSSxFQUFFLEdBQUcsR0FBRztBQUNqQyxXQUFLLGFBQWEsSUFBSSxFQUFFLEdBQUc7QUFDM0IsVUFBSSxFQUFFLFVBQVcsTUFBSyxNQUFNLFVBQVUsSUFBSSxFQUFFLEdBQUc7QUFBQSxJQUNqRDtBQUNBLFVBQU0sWUFBWSxLQUFLLE1BQU0sVUFBVSxJQUFJLEVBQUUsR0FBRztBQUVoRCxVQUFNLE9BQU8sT0FBTyxVQUFVLEVBQUUsS0FBSyxnQkFBZ0IsQ0FBQztBQUN0RCxRQUFJLEVBQUUsUUFBUSxVQUFXLE1BQUssU0FBUyxZQUFZO0FBRW5ELFVBQU0sT0FBTyxLQUFLLFVBQVUsRUFBRSxLQUFLLHFCQUFxQixDQUFDO0FBQ3pELFNBQUssV0FBVyxFQUFFLEtBQUssaUJBQWlCLE1BQU0sWUFBWSxXQUFNLFNBQUksQ0FBQztBQUNyRSxTQUFLLFdBQVcsRUFBRSxLQUFLLHVCQUF1QixNQUFNLEVBQUUsTUFBTSxDQUFDO0FBQzdELFNBQUssV0FBVyxFQUFFLEtBQUssdUJBQXVCLE1BQU0sRUFBRSxRQUFRLENBQUM7QUFDL0QsU0FBSyxpQkFBaUIsU0FBUyxNQUFNO0FBQ25DLFVBQUksVUFBVyxNQUFLLE1BQU0sVUFBVSxPQUFPLEVBQUUsR0FBRztBQUFBLFVBQzNDLE1BQUssTUFBTSxVQUFVLElBQUksRUFBRSxHQUFHO0FBQ25DLFdBQUssT0FBTztBQUFBLElBQ2QsQ0FBQztBQUVELFFBQUksVUFBVztBQUVmLFVBQU0sT0FBTyxLQUFLLFVBQVUsRUFBRSxLQUFLLGVBQWUsQ0FBQztBQUNuRCxRQUFJLEVBQUUsTUFBTSxXQUFXLEdBQUc7QUFDeEIsV0FBSyxVQUFVLEVBQUUsS0FBSyxZQUFZLE1BQU0sU0FBSSxDQUFDO0FBQzdDO0FBQUEsSUFDRjtBQUNBLGVBQVcsS0FBSyxFQUFFLE1BQU8sTUFBSyxXQUFXLE1BQU0sR0FBRyxFQUFFLEdBQUc7QUFBQSxFQUN6RDtBQUFBLEVBRVEsV0FBVyxRQUFxQixHQUFhLFVBQXdCO0FBQzNFLFVBQU0sTUFBTSxPQUFPLFVBQVUsRUFBRSxLQUFLLGNBQWMsQ0FBQztBQUNuRCxRQUFJLFFBQVEsV0FBVztBQUN2QixRQUFJLEVBQUUsT0FBTyxRQUFTLEtBQUksU0FBUyxZQUFZO0FBRy9DLFVBQU0sTUFBTSxJQUFJLFNBQVMsU0FBUztBQUFBLE1BQ2hDLE1BQU0sRUFBRSxNQUFNLFdBQVc7QUFBQSxNQUN6QixLQUFLO0FBQUEsSUFDUCxDQUFDO0FBQ0QsUUFBSSxVQUFVLEVBQUUsT0FBTztBQUN2QixRQUFJLGlCQUFpQixTQUFTLE9BQU8sTUFBTTtBQUN6QyxRQUFFLGdCQUFnQjtBQUNsQixVQUFJLEVBQUUsT0FBTyxTQUFTO0FBRXBCLFlBQUksVUFBVTtBQUNkLFlBQUkseUJBQU8sa0dBQWtCO0FBQzdCO0FBQUEsTUFDRjtBQUNBLFVBQUk7QUFDRixhQUFLLGtCQUFrQjtBQUN2QixjQUFNLG1CQUFtQixLQUFLLEtBQUssRUFBRSxPQUFPO0FBRTVDLFVBQUUsT0FBTyxVQUFVO0FBQ25CLFlBQUksU0FBUyxZQUFZO0FBQUEsTUFDM0IsU0FBUyxLQUFLO0FBQ1osYUFBSyxrQkFBa0I7QUFDdkIsWUFBSSxVQUFVO0FBQ2QseUJBQWlCLEdBQUc7QUFBQSxNQUN0QjtBQUFBLElBQ0YsQ0FBQztBQUdELFVBQU0sT0FBTyxZQUFZLEVBQUUsTUFBTTtBQUNqQyxVQUFNLE1BQU0sSUFBSSxXQUFXO0FBQUEsTUFDekIsS0FDRSxtQkFDQyxPQUFPLFdBQVcsSUFBSSxLQUFLO0FBQUEsSUFDaEMsQ0FBQztBQUNELFFBQUksYUFBYSxjQUFjLE9BQU8sMkJBQU8sSUFBSSxLQUFLLGdDQUFPO0FBQzdELFFBQUksYUFBYSxTQUFTLE9BQU8sMkJBQU8sSUFBSSxLQUFLLDRDQUFTO0FBQzFELFFBQUksQ0FBQyxFQUFFLE9BQU8sU0FBUztBQUNyQixVQUFJLGlCQUFpQixTQUFTLENBQUMsTUFBTTtBQUNuQyxVQUFFLGdCQUFnQjtBQUNsQixhQUFLLGlCQUFpQixHQUFHLEdBQUcsR0FBRztBQUFBLE1BQ2pDLENBQUM7QUFBQSxJQUNIO0FBR0EsVUFBTSxPQUFPLElBQUksV0FBVyxFQUFFLEtBQUssZ0JBQWdCLE1BQU0sRUFBRSxPQUFPLEtBQUssQ0FBQztBQUN4RSxRQUFJLGFBQTRCO0FBQ2hDLFNBQUssaUJBQWlCLFNBQVMsTUFBTTtBQUNuQyxVQUFJLGVBQWUsS0FBTSxRQUFPLGFBQWEsVUFBVTtBQUN2RCxtQkFBYSxPQUFPLFdBQVcsTUFBTTtBQUNuQyxxQkFBYTtBQUNiLGFBQUssS0FBSyxhQUFhLENBQUM7QUFBQSxNQUMxQixHQUFHLEdBQUc7QUFBQSxJQUNSLENBQUM7QUFDRCxRQUFJLENBQUMsRUFBRSxPQUFPLFNBQVM7QUFDckIsV0FBSyxpQkFBaUIsWUFBWSxDQUFDLE1BQU07QUFDdkMsVUFBRSxnQkFBZ0I7QUFDbEIsWUFBSSxlQUFlLE1BQU07QUFDdkIsaUJBQU8sYUFBYSxVQUFVO0FBQzlCLHVCQUFhO0FBQUEsUUFDZjtBQUNBLGFBQUssY0FBYyxNQUFNLEdBQUcsR0FBRztBQUFBLE1BQ2pDLENBQUM7QUFBQSxJQUNIO0FBR0EsVUFBTSxNQUFNLE9BQU8sRUFBRSxNQUFNO0FBQzNCLFVBQU0sUUFBUSxhQUFhO0FBQzNCLFVBQU0sUUFBUSxJQUFJLFdBQVc7QUFBQSxNQUMzQixLQUFLLGlCQUFpQixNQUFNLEtBQUs7QUFBQSxNQUNqQyxNQUFNLE9BQU87QUFBQSxJQUNmLENBQUM7QUFDRCxRQUFJLEtBQUs7QUFDUCxZQUFNLFlBQVksTUFBTSxTQUFTLENBQUMsRUFBRSxPQUFPO0FBQzNDLFlBQU0sVUFBVSxRQUFRO0FBQ3hCLFVBQUksVUFBVyxPQUFNLFNBQVMsWUFBWTtBQUFBLGVBQ2pDLFFBQVMsT0FBTSxTQUFTLFVBQVU7QUFBQSxJQUM3QztBQUNBLFVBQU0sYUFBYSxTQUFTLE1BQU0seUNBQVcsc0NBQVE7QUFDckQsUUFBSSxDQUFDLEVBQUUsT0FBTyxTQUFTO0FBQ3JCLFlBQU0saUJBQWlCLFNBQVMsQ0FBQyxNQUFNO0FBQ3JDLFVBQUUsZ0JBQWdCO0FBQ2xCLGFBQUssWUFBWSxHQUFHLEdBQUcsR0FBRztBQUFBLE1BQzVCLENBQUM7QUFBQSxJQUNIO0FBR0EsUUFBSSxhQUFhLFNBQVMsQ0FBQyxTQUFTLFdBQVcsT0FBTyxHQUFHO0FBQ3ZELFVBQUksV0FBVyxFQUFFLEtBQUssZ0JBQWdCLE1BQU0sRUFBRSxVQUFVLENBQUM7QUFBQSxJQUMzRDtBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBSUEsTUFBYyxhQUFhLEdBQTRCO0FBQ3JELFVBQU0sSUFBSSxLQUFLLElBQUksTUFBTSxzQkFBc0IsRUFBRSxRQUFRO0FBQ3pELFFBQUksRUFBRSxhQUFhLHlCQUFRO0FBQzNCLFVBQU0sT0FBTyxLQUFLLElBQUksVUFBVSxRQUFRLEtBQUs7QUFDN0MsVUFBTSxLQUFLLFNBQVMsQ0FBQztBQUNyQixVQUFNLE9BQU8sS0FBSztBQVNsQixVQUFNLEtBQUssTUFBTTtBQUNqQixRQUFJLElBQUk7QUFDTixTQUFHLFVBQVUsRUFBRSxNQUFNLEVBQUUsWUFBWSxJQUFJLEVBQUUsQ0FBQztBQUMxQyxTQUFHO0FBQUEsUUFDRCxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsWUFBWSxJQUFJLEVBQUUsR0FBRyxJQUFJLEVBQUUsTUFBTSxFQUFFLFlBQVksSUFBSSxFQUFFLEVBQUU7QUFBQSxRQUN6RTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBRVEsaUJBQWlCLEdBQWUsR0FBYSxLQUF3QjtBQUMzRSxVQUFNLE1BQU0sWUFBWSxFQUFFLE1BQU07QUFDaEMsVUFBTSxPQUFPLElBQUksdUJBQUs7QUFDdEIsVUFBTSxPQUFvRDtBQUFBLE1BQ3hELEVBQUUsT0FBTyxpQkFBTyxPQUFPLE9BQU87QUFBQSxNQUM5QixFQUFFLE9BQU8sb0JBQVEsT0FBTyxTQUFTO0FBQUEsTUFDakMsRUFBRSxPQUFPLG9CQUFRLE9BQU8sTUFBTTtBQUFBLE1BQzlCLEVBQUUsT0FBTyxnQkFBTSxPQUFPLEtBQUs7QUFBQSxJQUM3QjtBQUNBLGVBQVcsS0FBSyxNQUFNO0FBQ3BCLFdBQUs7QUFBQSxRQUFRLENBQUMsT0FDWixHQUNHLFNBQVMsRUFBRSxTQUFTLEVBQUUsVUFBVSxNQUFNLGFBQVEsR0FBRyxFQUNqRCxRQUFRLE1BQU07QUFDYixjQUFJLEVBQUUsVUFBVSxJQUFLO0FBQ3JCLGVBQUssS0FBSyxpQkFBaUIsR0FBRyxLQUFLLGFBQWEsRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDO0FBQUEsUUFDcEUsQ0FBQztBQUFBLE1BQ0w7QUFBQSxJQUNGO0FBQ0EsU0FBSyxpQkFBaUIsQ0FBQztBQUFBLEVBQ3pCO0FBQUEsRUFFUSxZQUFZLEdBQWUsR0FBYSxLQUF3QjtBQUN0RSxVQUFNLE1BQU0sT0FBTyxFQUFFLE1BQU07QUFDM0IsVUFBTSxNQUFNLG9CQUFJLEtBQUs7QUFDckIsVUFBTSxRQUFRLElBQUksR0FBRztBQUNyQixVQUFNLFdBQVcsSUFBSUMsU0FBUSxLQUFLLENBQUMsQ0FBQztBQUNwQyxVQUFNLFNBQVMsSUFBSUEsU0FBUSxNQUFNLElBQUksSUFBSSxPQUFPLEtBQUssS0FBSyxDQUFDLENBQUM7QUFFNUQsVUFBTSxPQUFPLElBQUksdUJBQUs7QUFDdEIsVUFBTSxRQUFtRDtBQUFBLE1BQ3ZELEVBQUUsT0FBTyxxQkFBTSxLQUFLLFVBQUssT0FBTyxNQUFNO0FBQUEsTUFDdEMsRUFBRSxPQUFPLHFCQUFNLFFBQVEsVUFBSyxPQUFPLFNBQVM7QUFBQSxNQUM1QyxFQUFFLE9BQU8sMkJBQU8sTUFBTSxVQUFLLE9BQU8sT0FBTztBQUFBLElBQzNDO0FBQ0EsZUFBVyxLQUFLLE9BQU87QUFDckIsV0FBSztBQUFBLFFBQVEsQ0FBQyxPQUNaLEdBQ0csU0FBUyxFQUFFLFNBQVMsRUFBRSxVQUFVLE1BQU0sYUFBUSxHQUFHLEVBQ2pELFFBQVEsTUFBTTtBQUNiLGNBQUksRUFBRSxVQUFVLElBQUs7QUFDckIsZUFBSyxLQUFLLGlCQUFpQixHQUFHLEtBQUssUUFBUSxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUM7QUFBQSxRQUMvRCxDQUFDO0FBQUEsTUFDTDtBQUFBLElBQ0Y7QUFDQSxTQUFLO0FBQUEsTUFBUSxDQUFDLE9BQ1osR0FBRyxTQUFTLDBCQUFNLEVBQUUsUUFBUSxNQUFNO0FBQ2hDLFlBQUksZ0JBQWdCLEtBQUssS0FBSyxPQUFPLE9BQU8sQ0FBQyxNQUFNO0FBQ2pELGNBQUksTUFBTSxJQUFLO0FBQ2YsZUFBSyxLQUFLLGlCQUFpQixHQUFHLEtBQUssUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQUEsUUFDekQsQ0FBQyxFQUFFLEtBQUs7QUFBQSxNQUNWLENBQUM7QUFBQSxJQUNIO0FBQ0EsUUFBSSxLQUFLO0FBQ1AsV0FBSyxhQUFhO0FBQ2xCLFdBQUs7QUFBQSxRQUFRLENBQUMsT0FDWixHQUFHLFNBQVMsY0FBSSxFQUFFLFFBQVEsTUFBTTtBQUM5QixlQUFLLEtBQUssaUJBQWlCLEdBQUcsS0FBSyxRQUFRLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFBQSxRQUM1RCxDQUFDO0FBQUEsTUFDSDtBQUFBLElBQ0Y7QUFDQSxTQUFLLGlCQUFpQixDQUFDO0FBQUEsRUFDekI7QUFBQSxFQUVRLGNBQWMsUUFBcUIsR0FBYSxLQUF3QjtBQUM5RSxVQUFNLFdBQVcsRUFBRSxPQUFPO0FBQzFCLFVBQU0sUUFBUSxJQUFJLFNBQVMsU0FBUztBQUFBLE1BQ2xDLEtBQUs7QUFBQSxNQUNMLE1BQU0sRUFBRSxNQUFNLE9BQU87QUFBQSxJQUN2QixDQUFDO0FBQ0QsVUFBTSxRQUFRO0FBQ2QsV0FBTyxZQUFZLEtBQUs7QUFDeEIsVUFBTSxNQUFNO0FBQ1osVUFBTSxPQUFPO0FBRWIsUUFBSSxZQUFZO0FBQ2hCLFFBQUksWUFBWTtBQUNoQixVQUFNLFVBQVUsQ0FBQyxjQUEyQjtBQUMxQyxZQUFNLFlBQVksU0FBUztBQUFBLElBQzdCO0FBQ0EsVUFBTSxTQUFTLFlBQVk7QUFDekIsVUFBSSxVQUFXO0FBQ2Ysa0JBQVk7QUFDWixVQUFJLFdBQVc7QUFDYixnQkFBUSxLQUFLLGNBQWMsUUFBUSxDQUFDO0FBQ3BDO0FBQUEsTUFDRjtBQUNBLFlBQU0sSUFBSSxNQUFNLE1BQU0sUUFBUSwwQkFBMEIsR0FBRyxFQUFFLEtBQUs7QUFDbEUsVUFBSSxDQUFDLEtBQUssTUFBTSxVQUFVO0FBQ3hCLGdCQUFRLEtBQUssY0FBYyxRQUFRLENBQUM7QUFDcEM7QUFBQSxNQUNGO0FBQ0EsY0FBUSxLQUFLLGNBQWMsQ0FBQyxDQUFDO0FBQzdCLFlBQU0sS0FBSyxpQkFBaUIsR0FBRyxLQUFLLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUFBLElBQzNEO0FBQ0EsVUFBTSxpQkFBaUIsV0FBVyxDQUFDLE1BQU07QUFDdkMsVUFBSSxFQUFFLFFBQVEsU0FBUztBQUNyQixVQUFFLGVBQWU7QUFDakIsYUFBSyxPQUFPO0FBQUEsTUFDZCxXQUFXLEVBQUUsUUFBUSxVQUFVO0FBQzdCLFVBQUUsZUFBZTtBQUNqQixvQkFBWTtBQUNaLGFBQUssT0FBTztBQUFBLE1BQ2Q7QUFBQSxJQUNGLENBQUM7QUFDRCxVQUFNLGlCQUFpQixRQUFRLE1BQU0sS0FBSyxPQUFPLENBQUM7QUFBQSxFQUNwRDtBQUFBO0FBQUEsRUFHUSxjQUFjLE1BQTJCO0FBQy9DLFVBQU0sT0FBTyxTQUFTLGNBQWMsTUFBTTtBQUMxQyxTQUFLLFlBQVk7QUFDakIsU0FBSyxjQUFjO0FBQ25CLFdBQU87QUFBQSxFQUNUO0FBQUEsRUFFQSxNQUFjLGlCQUNaLEdBQ0EsS0FDQSxXQUNlO0FBQ2YsVUFBTSxVQUFVLGNBQWMsU0FBUztBQUN2QyxRQUFJLFlBQVksRUFBRSxRQUFRLFNBQVU7QUFDcEMsUUFBSTtBQUNGLFdBQUssa0JBQWtCO0FBQ3ZCLFlBQU0sZUFBZSxLQUFLLEtBQUssRUFBRSxTQUFTLE9BQU87QUFFakQsUUFBRSxTQUFTO0FBQ1gsUUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLFNBQVMsVUFBVSxRQUFRO0FBRTlDLFdBQUssWUFBWSxHQUFHLEdBQUc7QUFBQSxJQUN6QixTQUFTLEtBQUs7QUFDWixXQUFLLGtCQUFrQjtBQUN2Qix1QkFBaUIsR0FBRztBQUFBLElBQ3RCO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFHUSxZQUFZLEdBQWEsS0FBd0I7QUFDdkQsVUFBTSxTQUFTLElBQUk7QUFDbkIsUUFBSSxDQUFDLE9BQVE7QUFDYixVQUFNLFdBQVcsSUFBSSxRQUFRLFlBQVk7QUFDekMsVUFBTSxTQUFTLFNBQVMsY0FBYyxRQUFRO0FBQzlDLFdBQU8sYUFBYSxRQUFRLEdBQUc7QUFDL0IsUUFBSSxPQUFPO0FBRVgsVUFBTSxNQUFNLFNBQVMsY0FBYyxLQUFLO0FBQ3hDLFNBQUssV0FBVyxLQUFLLEdBQUcsUUFBUTtBQUNoQyxVQUFNLFNBQVMsSUFBSTtBQUNuQixRQUFJLE9BQVEsUUFBTyxhQUFhLFFBQVEsTUFBTTtBQUM5QyxXQUFPLE9BQU87QUFBQSxFQUNoQjtBQUFBO0FBQUE7QUFBQSxFQUtRLGlCQUEwQztBQUNoRCxVQUFNLE1BQU0sb0JBQUksSUFBd0I7QUFDeEMsZUFBVyxLQUFLLEtBQUssT0FBTztBQUMxQixVQUFJLEVBQUUsV0FBVyxTQUFVO0FBQzNCLGlCQUFXLEtBQUssRUFBRSxPQUFPO0FBQ3ZCLGNBQU0sTUFBTSxPQUFPLEVBQUUsTUFBTTtBQUMzQixZQUFJLENBQUMsSUFBSztBQUNWLGNBQU0sTUFBTSxJQUFJLElBQUksR0FBRztBQUN2QixZQUFJLElBQUssS0FBSSxLQUFLLENBQUM7QUFBQSxZQUNkLEtBQUksSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQUEsTUFDdkI7QUFBQSxJQUNGO0FBQ0EsV0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUVRLFdBQVcsR0FBaUI7QUFDbEMsUUFBSSxJQUFJLEtBQUssTUFBTSxXQUFXO0FBQzlCLFFBQUksSUFBSSxLQUFLLE1BQU07QUFDbkIsV0FBTyxJQUFJLEdBQUc7QUFBRSxXQUFLO0FBQUksV0FBSztBQUFBLElBQUc7QUFDakMsV0FBTyxJQUFJLElBQUk7QUFBRSxXQUFLO0FBQUksV0FBSztBQUFBLElBQUc7QUFDbEMsU0FBSyxNQUFNLFdBQVc7QUFDdEIsU0FBSyxNQUFNLFVBQVU7QUFDckIsU0FBSyxPQUFPO0FBQUEsRUFDZDtBQUFBLEVBRVEsZUFBZSxNQUF5QjtBQUM5QyxVQUFNLElBQUksS0FBSyxNQUFNO0FBQ3JCLFVBQU0sSUFBSSxLQUFLLE1BQU07QUFDckIsVUFBTSxRQUFRLGFBQWE7QUFDM0IsVUFBTSxNQUFNLEtBQUssZUFBZTtBQUdoQyxVQUFNLE1BQU0sS0FBSyxVQUFVLEVBQUUsS0FBSyxjQUFjLENBQUM7QUFDakQsVUFBTSxPQUFPLElBQUksV0FBVyxFQUFFLEtBQUssY0FBYyxNQUFNLFNBQUksQ0FBQztBQUM1RCxTQUFLLGFBQWEsY0FBYyxvQkFBSztBQUNyQyxRQUFJLFdBQVcsRUFBRSxLQUFLLGdCQUFnQixNQUFNLEdBQUcsQ0FBQyxXQUFNLElBQUksQ0FBQyxVQUFLLENBQUM7QUFDakUsVUFBTSxPQUFPLElBQUksV0FBVyxFQUFFLEtBQUssY0FBYyxNQUFNLFNBQUksQ0FBQztBQUM1RCxTQUFLLGFBQWEsY0FBYyxvQkFBSztBQUNyQyxVQUFNLFdBQVcsSUFBSSxXQUFXLEVBQUUsS0FBSyxvQkFBb0IsTUFBTSxxQkFBTSxDQUFDO0FBQ3hFLFNBQUssaUJBQWlCLFNBQVMsTUFBTSxLQUFLLFdBQVcsRUFBRSxDQUFDO0FBQ3hELFNBQUssaUJBQWlCLFNBQVMsTUFBTSxLQUFLLFdBQVcsQ0FBQyxDQUFDO0FBQ3ZELGFBQVMsaUJBQWlCLFNBQVMsTUFBTTtBQUN2QyxZQUFNLElBQUksb0JBQUksS0FBSztBQUNuQixXQUFLLE1BQU0sVUFBVSxFQUFFLFlBQVk7QUFDbkMsV0FBSyxNQUFNLFdBQVcsRUFBRSxTQUFTO0FBQ2pDLFdBQUssTUFBTSxlQUFlO0FBQzFCLFdBQUssT0FBTztBQUFBLElBQ2QsQ0FBQztBQUdELFVBQU0sS0FBSyxLQUFLLFVBQVUsRUFBRSxLQUFLLGdCQUFnQixDQUFDO0FBQ2xELGVBQVcsS0FBSyxDQUFDLFVBQUssVUFBSyxVQUFLLFVBQUssVUFBSyxVQUFLLFFBQUcsR0FBRztBQUNuRCxTQUFHLFdBQVcsRUFBRSxLQUFLLGFBQWEsTUFBTSxFQUFFLENBQUM7QUFBQSxJQUM3QztBQUdBLFVBQU0sUUFBUSxJQUFJLEtBQUssR0FBRyxHQUFHLENBQUM7QUFDOUIsVUFBTSxVQUFVLE1BQU0sT0FBTyxJQUFJLEtBQUs7QUFDdEMsVUFBTSxjQUFjLElBQUksS0FBSyxHQUFHLElBQUksR0FBRyxDQUFDLEVBQUUsUUFBUTtBQUNsRCxVQUFNLE9BQU8sS0FBSyxNQUFNLFNBQVMsZUFBZSxDQUFDO0FBQ2pELFVBQU0sYUFBYSxPQUFPO0FBRTFCLFVBQU0sT0FBTyxLQUFLLFVBQVUsRUFBRSxLQUFLLGNBQWMsQ0FBQztBQUNsRCxhQUFTLElBQUksR0FBRyxJQUFJLFlBQVksS0FBSztBQUNuQyxZQUFNLFNBQVMsSUFBSSxTQUFTO0FBQzVCLFlBQU0sV0FBVyxJQUFJLEtBQUssR0FBRyxHQUFHLE1BQU07QUFDdEMsWUFBTSxNQUFNLFFBQVEsUUFBUTtBQUM1QixZQUFNLGFBQWEsVUFBVSxLQUFLLFVBQVU7QUFFNUMsWUFBTSxPQUFPLEtBQUssVUFBVSxFQUFFLEtBQUssY0FBYyxDQUFDO0FBQ2xELFVBQUksQ0FBQyxXQUFZLE1BQUssU0FBUyxVQUFVO0FBQ3pDLFVBQUksUUFBUSxNQUFPLE1BQUssU0FBUyxVQUFVO0FBQzNDLFVBQUksS0FBSyxNQUFNLGlCQUFpQixJQUFLLE1BQUssU0FBUyxhQUFhO0FBRWhFLFdBQUssV0FBVyxFQUFFLEtBQUssY0FBYyxNQUFNLE9BQU8sU0FBUyxRQUFRLENBQUMsRUFBRSxDQUFDO0FBRXZFLFlBQU0sUUFBUSxJQUFJLElBQUksR0FBRztBQUN6QixVQUFJLFNBQVMsTUFBTSxTQUFTLEdBQUc7QUFDN0IsY0FBTSxZQUFZLE1BQU0sT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLE9BQU8sT0FBTyxFQUFFO0FBQ3pELGNBQU0sUUFBUSxLQUFLLFdBQVcsRUFBRSxLQUFLLGVBQWUsQ0FBQztBQUNyRCxZQUFJLGNBQWMsR0FBRztBQUNuQixnQkFBTSxTQUFTLFNBQVM7QUFDeEIsZ0JBQU0sUUFBUSxRQUFHO0FBQUEsUUFDbkIsT0FBTztBQUNMLGNBQUksTUFBTSxNQUFPLE9BQU0sU0FBUyxZQUFZO0FBQzVDLGdCQUFNLFFBQVEsT0FBTyxTQUFTLENBQUM7QUFBQSxRQUNqQztBQUFBLE1BQ0Y7QUFFQSxXQUFLLGlCQUFpQixTQUFTLE1BQU07QUFDbkMsWUFBSSxLQUFLLE1BQU0saUJBQWlCLEtBQUs7QUFDbkMsZUFBSyxNQUFNLGVBQWU7QUFBQSxRQUM1QixPQUFPO0FBQ0wsZUFBSyxNQUFNLGVBQWU7QUFFMUIsY0FBSSxDQUFDLFlBQVk7QUFDZixpQkFBSyxNQUFNLFVBQVUsU0FBUyxZQUFZO0FBQzFDLGlCQUFLLE1BQU0sV0FBVyxTQUFTLFNBQVM7QUFBQSxVQUMxQztBQUFBLFFBQ0Y7QUFDQSxhQUFLLE9BQU87QUFBQSxNQUNkLENBQUM7QUFBQSxJQUNIO0FBR0EsUUFBSSxLQUFLLE1BQU0sY0FBYztBQUMzQixVQUFJLFNBQVMsSUFBSSxJQUFJLEtBQUssTUFBTSxZQUFZLEtBQUssQ0FBQyxHQUFHLE1BQU07QUFDM0QsVUFBSSxLQUFLLE9BQU8sU0FBUyxlQUFlO0FBQ3RDLGdCQUFRLE1BQU0sT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLE9BQU8sT0FBTztBQUFBLE1BQy9DO0FBRUEsWUFBTSxLQUFLLENBQUMsR0FBRyxNQUFNO0FBQ25CLFlBQUksRUFBRSxPQUFPLFlBQVksRUFBRSxPQUFPLFFBQVMsUUFBTyxFQUFFLE9BQU8sVUFBVSxJQUFJO0FBQ3pFLGNBQU0sSUFBSSxFQUFFLFlBQVksRUFBRSxZQUFZLEtBQUssRUFBRSxZQUFZLEVBQUUsWUFBWSxJQUFJO0FBQzNFLGVBQU8sTUFBTSxJQUFJLElBQUksRUFBRSxhQUFhLEVBQUU7QUFBQSxNQUN4QyxDQUFDO0FBRUQsWUFBTSxRQUFRLEtBQUssVUFBVSxFQUFFLEtBQUssa0JBQWtCLENBQUM7QUFDdkQsWUFBTSxLQUFLLE1BQU0sVUFBVSxFQUFFLEtBQUssdUJBQXVCLENBQUM7QUFDMUQsU0FBRyxXQUFXLEVBQUUsS0FBSyx3QkFBd0IsTUFBTSxLQUFLLE1BQU0sYUFBYSxDQUFDO0FBQzVFLFNBQUcsV0FBVyxFQUFFLEtBQUsseUJBQXlCLE1BQU0sR0FBRyxNQUFNLE1BQU0sVUFBSyxDQUFDO0FBQ3pFLFVBQUksTUFBTSxXQUFXLEdBQUc7QUFDdEIsY0FBTSxVQUFVLEVBQUUsS0FBSyxZQUFZLE1BQU0sNkNBQVUsQ0FBQztBQUFBLE1BQ3RELE9BQU87QUFDTCxjQUFNLE9BQU8sTUFBTSxVQUFVLEVBQUUsS0FBSyxlQUFlLENBQUM7QUFDcEQsbUJBQVcsS0FBSyxNQUFPLE1BQUssV0FBVyxNQUFNLEdBQUcsVUFBVTtBQUFBLE1BQzVEO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRjtBQUlBLFNBQVMsSUFBSSxHQUFpQjtBQUM1QixRQUFNLElBQUksQ0FBQyxNQUFjLEVBQUUsU0FBUyxFQUFFLFNBQVMsR0FBRyxHQUFHO0FBQ3JELFNBQU8sR0FBRyxFQUFFLFlBQVksQ0FBQyxJQUFJLEVBQUUsRUFBRSxTQUFTLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ3BFO0FBRUEsU0FBU0EsU0FBUSxHQUFTLEdBQWlCO0FBQ3pDLFFBQU0sSUFBSSxJQUFJLEtBQUssQ0FBQztBQUNwQixJQUFFLFFBQVEsRUFBRSxRQUFRLElBQUksQ0FBQztBQUN6QixTQUFPO0FBQ1Q7OztBakIzbEJPLElBQU0sc0JBQXNCO0FBRW5DLElBQU0sc0JBQXNCO0FBQzVCLElBQU0sdUJBQXVCO0FBQzdCLElBQU0sc0JBQXNCO0FBRXJCLElBQU0sZ0JBQU4sY0FBNEIsMkJBQVM7QUFBQSxFQVcxQyxZQUFZLE1BQXFCLFFBQXlCO0FBQ3hELFVBQU0sSUFBSTtBQUxaLFNBQVEsYUFBNEI7QUFDcEMsU0FBUSxjQUE2QjtBQUNyQyxTQUFRLGFBQTRCO0FBSWxDLFNBQUssU0FBUztBQUFBLEVBQ2hCO0FBQUEsRUFFQSxjQUFzQjtBQUFFLFdBQU87QUFBQSxFQUFxQjtBQUFBLEVBQ3BELGlCQUF5QjtBQUFFLFdBQU87QUFBQSxFQUFPO0FBQUEsRUFDekMsVUFBa0I7QUFBRSxXQUFPO0FBQUEsRUFBb0I7QUFBQSxFQUUvQyxNQUFNLFNBQXdCO0FBQzVCLFNBQUssT0FBTztBQUVaLFNBQUssY0FBYyxLQUFLLElBQUksTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLEtBQUssY0FBYyxDQUFDLENBQUMsQ0FBQztBQUM1RSxTQUFLLGNBQWMsS0FBSyxJQUFJLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxLQUFLLGNBQWMsQ0FBQyxDQUFDLENBQUM7QUFDNUUsU0FBSyxjQUFjLEtBQUssSUFBSSxNQUFNLEdBQUcsVUFBVSxDQUFDLE1BQU0sS0FBSyxjQUFjLENBQUMsQ0FBQyxDQUFDO0FBQzVFLFNBQUssY0FBYyxLQUFLLElBQUksTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLEtBQUssY0FBYyxDQUFDLENBQUMsQ0FBQztBQUc1RSxTQUFLO0FBQUEsTUFDSCxLQUFLLElBQUksY0FBYyxHQUFHLFlBQVksTUFBTTtBQUMxQyxhQUFLLHNCQUFzQjtBQUMzQixhQUFLLHFCQUFxQjtBQUFBLE1BQzVCLENBQUM7QUFBQSxJQUNIO0FBR0EsU0FBSztBQUFBLE1BQ0gsS0FBSyxJQUFJLFVBQVUsR0FBRyxhQUFhLE1BQU0sS0FBSyxjQUFjLENBQUM7QUFBQSxJQUMvRDtBQUFBLEVBQ0Y7QUFBQSxFQUVBLE1BQU0sVUFBeUI7QUFDN0IsUUFBSSxLQUFLLGVBQWUsS0FBTSxRQUFPLGFBQWEsS0FBSyxVQUFVO0FBQ2pFLFFBQUksS0FBSyxnQkFBZ0IsS0FBTSxRQUFPLGFBQWEsS0FBSyxXQUFXO0FBQ25FLFFBQUksS0FBSyxlQUFlLEtBQU0sUUFBTyxhQUFhLEtBQUssVUFBVTtBQUFBLEVBQ25FO0FBQUE7QUFBQSxFQUlRLGNBQWMsR0FBd0I7QUFDNUMsUUFBSSxhQUFhLDJCQUFTLEVBQUUsU0FBUyxlQUFlLEdBQUc7QUFDckQsVUFBSSxLQUFLLFFBQVEsb0JBQW9CLEdBQUc7QUFBQSxNQUV4QyxXQUFXLENBQUMsS0FBSyxRQUFRLGVBQWUsR0FBRztBQUN6QyxhQUFLLHFCQUFxQjtBQUFBLE1BQzVCO0FBQUEsSUFDRjtBQUVBLFNBQUssc0JBQXNCO0FBRTNCLFFBQUksYUFBYSwyQkFBUyxFQUFFLEtBQUssV0FBVyxjQUFjLEdBQUc7QUFDM0QsV0FBSyxxQkFBcUI7QUFBQSxJQUM1QjtBQUFBLEVBQ0Y7QUFBQSxFQUVRLHVCQUE2QjtBQUNuQyxRQUFJLEtBQUssZUFBZSxLQUFNLFFBQU8sYUFBYSxLQUFLLFVBQVU7QUFDakUsU0FBSyxhQUFhLE9BQU8sV0FBVyxNQUFNO0FBQ3hDLFdBQUssS0FBSyxRQUFRLFFBQVE7QUFBQSxJQUM1QixHQUFHLG1CQUFtQjtBQUFBLEVBQ3hCO0FBQUEsRUFFUSx3QkFBOEI7QUFDcEMsUUFBSSxLQUFLLGdCQUFnQixLQUFNLFFBQU8sYUFBYSxLQUFLLFdBQVc7QUFDbkUsU0FBSyxjQUFjLE9BQU8sV0FBVyxNQUFNO0FBRXpDLFVBQUksS0FBSyxRQUFRLFNBQVMsR0FBRztBQUMzQixhQUFLLHNCQUFzQjtBQUMzQjtBQUFBLE1BQ0Y7QUFDQSxXQUFLLFFBQVEsT0FBTztBQUNwQixXQUFLLGNBQWM7QUFBQSxJQUNyQixHQUFHLG9CQUFvQjtBQUFBLEVBQ3pCO0FBQUEsRUFFUSx1QkFBNkI7QUFDbkMsUUFBSSxLQUFLLGVBQWUsS0FBTSxRQUFPLGFBQWEsS0FBSyxVQUFVO0FBQ2pFLFNBQUssYUFBYSxPQUFPLFdBQVcsTUFBTTtBQUN4QyxVQUFJLEtBQUssT0FBTyxxQkFBcUIsRUFBRztBQUN4QyxXQUFLLE9BQU8sT0FBTztBQUFBLElBQ3JCLEdBQUcsbUJBQW1CO0FBQUEsRUFDeEI7QUFBQTtBQUFBLEVBSVEsU0FBZTtBQUNyQixVQUFNLE9BQU8sS0FBSztBQUNsQixTQUFLLE1BQU07QUFDWCxTQUFLLFNBQVMsY0FBYztBQUc1QixVQUFNLE1BQU0sS0FBSyxVQUFVO0FBRzNCLFVBQU0sT0FBTyxLQUFLLFVBQVUsRUFBRSxLQUFLLFVBQVUsQ0FBQztBQUU5QyxVQUFNLFdBQVcsS0FBSyxVQUFVO0FBQ2hDLFNBQUssU0FBUyxJQUFJLGNBQWMsS0FBSyxLQUFLLEtBQUssUUFBUSxRQUFRO0FBQy9ELFNBQUssT0FBTyxPQUFPO0FBRW5CLFVBQU0sT0FBTyxLQUFLLFVBQVUsRUFBRSxLQUFLLFVBQVUsQ0FBQztBQUU5QyxVQUFNLGFBQWEsS0FBSyxVQUFVO0FBQ2xDLFNBQUssUUFBUSxJQUFJLGFBQWEsS0FBSyxLQUFLLEtBQUssUUFBUSxVQUFVO0FBQy9ELFNBQUssTUFBTSxPQUFPO0FBR2xCLFVBQU0sY0FBYyxLQUFLLFVBQVU7QUFHbkMsU0FBSyxTQUFTLElBQUksY0FBYyxLQUFLLEtBQUssS0FBSyxRQUFRLEtBQUssV0FBVztBQUN2RSxTQUFLLE9BQU8sT0FBTztBQUduQixTQUFLLFdBQVcsS0FBSyxVQUFVO0FBQy9CLFNBQUssY0FBYztBQUFBLEVBQ3JCO0FBQUE7QUFBQSxFQUlRLGdCQUFzQjtBQUM1QixRQUFJLEtBQUssU0FBVSxjQUFhLEtBQUssS0FBSyxLQUFLLFFBQVE7QUFBQSxFQUN6RDtBQUFBO0FBQUEsRUFHQSxlQUFxQjtBQUNuQixTQUFLLE9BQU8sT0FBTztBQUFBLEVBQ3JCO0FBQ0Y7OztBbUJ6SkEsSUFBQUMsb0JBQStDO0FBYXhDLElBQU0sbUJBQXNDO0FBQUEsRUFDakQsaUJBQWlCO0FBQUEsRUFDakIsZUFBZTtBQUFBLEVBQ2YsYUFBYSxDQUFDO0FBQ2hCO0FBRU8sSUFBTSxzQkFBTixjQUFrQyxtQ0FBaUI7QUFBQSxFQUd4RCxZQUFZLEtBQVUsUUFBeUI7QUFDN0MsVUFBTSxLQUFLLE1BQU07QUFDakIsU0FBSyxTQUFTO0FBQUEsRUFDaEI7QUFBQSxFQUVBLFVBQWdCO0FBQ2QsVUFBTSxFQUFFLFlBQVksSUFBSTtBQUN4QixnQkFBWSxNQUFNO0FBRWxCLFFBQUksMEJBQVEsV0FBVyxFQUNwQixRQUFRLDBCQUFNLEVBQ2QsUUFBUSw4R0FBb0IsRUFDNUI7QUFBQSxNQUFZLENBQUMsT0FDWixHQUNHLFVBQVUsU0FBUyxjQUFJLEVBQ3ZCLFVBQVUsWUFBWSxjQUFJLEVBQzFCLFVBQVUsT0FBTyxjQUFJLEVBQ3JCLFVBQVUsWUFBWSxjQUFJLEVBQzFCLFNBQVMsS0FBSyxPQUFPLFNBQVMsZUFBZSxFQUM3QyxTQUFTLE9BQU8sTUFBTTtBQUNyQixhQUFLLE9BQU8sU0FBUyxrQkFBa0I7QUFDdkMsY0FBTSxLQUFLLE9BQU8sYUFBYTtBQUFBLE1BQ2pDLENBQUM7QUFBQSxJQUNMO0FBRUYsUUFBSSwwQkFBUSxXQUFXLEVBQ3BCLFFBQVEsNENBQVMsRUFDakIsUUFBUSwyUEFBOEMsRUFDdEQ7QUFBQSxNQUFVLENBQUMsT0FDVixHQUFHLFNBQVMsS0FBSyxPQUFPLFNBQVMsYUFBYSxFQUFFLFNBQVMsT0FBTyxNQUFNO0FBQ3BFLGFBQUssT0FBTyxTQUFTLGdCQUFnQjtBQUNyQyxjQUFNLEtBQUssT0FBTyxhQUFhO0FBQy9CLGFBQUssT0FBTyxhQUFhO0FBQUEsTUFDM0IsQ0FBQztBQUFBLElBQ0g7QUFBQSxFQUNKO0FBQ0Y7OztBQzFEQSxJQUFBQyxvQkFBNEI7QUFhNUIsZUFBc0Isa0JBQWtCLEtBQXlCO0FBQy9ELFFBQU0sVUFBb0IsQ0FBQztBQUUzQixRQUFNLEtBQUssWUFBWSxJQUFJO0FBQzNCLFFBQU0sT0FBTyxpQkFBaUIsR0FBRztBQUNqQyxVQUFRLEtBQUssRUFBRSxPQUFPLG9CQUFvQixJQUFJLFlBQVksSUFBSSxJQUFJLElBQUksT0FBTyxLQUFLLE9BQU8sQ0FBQztBQUUxRixRQUFNLEtBQUssWUFBWSxJQUFJO0FBQzNCLFFBQU0sU0FBUyxvQkFBb0IsSUFBSTtBQUN2QyxVQUFRLEtBQUssRUFBRSxPQUFPLHVCQUF1QixJQUFJLFlBQVksSUFBSSxJQUFJLElBQUksT0FBTyxPQUFPLE1BQU0sS0FBSyxDQUFDO0FBRW5HLFFBQU0sV0FBVyxJQUFJLE1BQU0sU0FBUztBQUNwQyxRQUFNLEtBQUssWUFBWSxJQUFJO0FBQzNCLFFBQU0sV0FBVyxpQkFBaUIsVUFBVSxLQUFLO0FBQ2pELFVBQVEsS0FBSyxFQUFFLE9BQU8seUJBQXlCLElBQUksWUFBWSxJQUFJLElBQUksSUFBSSxPQUFPLFNBQVMsT0FBTyxDQUFDO0FBRW5HLFFBQU0sS0FBSyxZQUFZLElBQUk7QUFDM0IsUUFBTSxXQUFXLGlCQUFpQixVQUFVLFFBQVE7QUFDcEQsVUFBUSxLQUFLLEVBQUUsT0FBTyw0QkFBNEIsSUFBSSxZQUFZLElBQUksSUFBSSxJQUFJLE9BQU8sU0FBUyxPQUFPLENBQUM7QUFFdEcsUUFBTSxLQUFLLFlBQVksSUFBSTtBQUMzQixRQUFNLFFBQVEsTUFBTSxVQUFVLEdBQUc7QUFDakMsUUFBTSxnQkFBZ0IsTUFBTSxPQUFPLENBQUMsR0FBRyxNQUFNLElBQUksRUFBRSxNQUFNLFFBQVEsQ0FBQztBQUNsRSxVQUFRLEtBQUssRUFBRSxPQUFPLGFBQWEsSUFBSSxZQUFZLElBQUksSUFBSSxJQUFJLE9BQU8sY0FBYyxDQUFDO0FBRXJGLFFBQU0sUUFBUSxhQUFhO0FBQzNCLFFBQU0sS0FBSyxZQUFZLElBQUk7QUFDM0IsbUJBQWlCLE9BQU8sS0FBSztBQUM3QixzQkFBb0IsT0FBTyxvQkFBSSxLQUFLLENBQUM7QUFDckMsaUJBQWUsS0FBSztBQUNwQixVQUFRLEtBQUssRUFBRSxPQUFPLHdCQUFjLElBQUksWUFBWSxJQUFJLElBQUksR0FBRyxDQUFDO0FBRWhFLFFBQU0sUUFBUSxRQUFRLE9BQU8sQ0FBQyxHQUFHLE1BQU0sSUFBSSxFQUFFLElBQUksQ0FBQztBQUNsRCxRQUFNLFNBQVMsUUFDWixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsS0FBSyxLQUFLLEVBQUUsR0FBRyxRQUFRLENBQUMsQ0FBQyxLQUFLLEVBQUUsVUFBVSxTQUFZLEtBQUssRUFBRSxLQUFLLE1BQU0sRUFBRSxFQUFFLEVBQzVGLEtBQUssSUFBSTtBQUNaLFFBQU0sVUFBVSxRQUFRLE1BQU0sd0JBQVM7QUFDdkMsUUFBTSxNQUFNLEdBQUcsT0FBTyx5Q0FBVyxNQUFNLFFBQVEsQ0FBQyxDQUFDO0FBQUE7QUFBQSxFQUFtQixNQUFNO0FBQzFFLE1BQUkseUJBQU8sS0FBSyxJQUFLO0FBQ3JCLFVBQVEsSUFBSSwyQkFBMkIsR0FBRztBQUM1Qzs7O0FyQjdDQSxJQUFxQixrQkFBckIsY0FBNkMseUJBQU87QUFBQSxFQUFwRDtBQUFBO0FBQ0Usb0JBQThCLEVBQUUsR0FBRyxpQkFBaUI7QUFBQTtBQUFBLEVBRXBELE1BQU0sU0FBd0I7QUFDNUIsVUFBTSxLQUFLLGFBQWE7QUFFeEIsU0FBSztBQUFBLE1BQ0g7QUFBQSxNQUNBLENBQUMsU0FBUyxJQUFJLGNBQWMsTUFBTSxJQUFJO0FBQUEsSUFDeEM7QUFFQSxTQUFLLGNBQWMsSUFBSSxvQkFBb0IsS0FBSyxLQUFLLElBQUksQ0FBQztBQUUxRCxTQUFLLGNBQWMsb0JBQW9CLGtDQUFTLE1BQU0sS0FBSyxhQUFhLENBQUM7QUFFekUsU0FBSyxXQUFXO0FBQUEsTUFDZCxJQUFJO0FBQUEsTUFDSixNQUFNO0FBQUEsTUFDTixVQUFVLE1BQU0sS0FBSyxhQUFhO0FBQUEsSUFDcEMsQ0FBQztBQUVELFNBQUssV0FBVztBQUFBLE1BQ2QsSUFBSTtBQUFBLE1BQ0osTUFBTTtBQUFBLE1BQ04sVUFBVSxNQUFNO0FBQ2QsWUFBSSxXQUFXLEtBQUssS0FBSyxPQUFPLFNBQVM7QUFDdkMsZ0JBQU0sWUFBWSxLQUFLLEtBQUssSUFBSTtBQUFBLFFBQ2xDLENBQUMsRUFBRSxLQUFLO0FBQUEsTUFDVjtBQUFBLElBQ0YsQ0FBQztBQUVELFNBQUssV0FBVztBQUFBLE1BQ2QsSUFBSTtBQUFBLE1BQ0osTUFBTTtBQUFBLE1BQ04sVUFBVSxNQUFNLElBQUksaUJBQWlCLEtBQUssR0FBRyxFQUFFLEtBQUs7QUFBQSxJQUN0RCxDQUFDO0FBRUQsU0FBSyxXQUFXO0FBQUEsTUFDZCxJQUFJO0FBQUEsTUFDSixNQUFNO0FBQUEsTUFDTixVQUFVLE1BQU0sSUFBSSxrQkFBa0IsS0FBSyxHQUFHLEVBQUUsS0FBSztBQUFBLElBQ3ZELENBQUM7QUFFRCxTQUFLLFdBQVc7QUFBQSxNQUNkLElBQUk7QUFBQSxNQUNKLE1BQU07QUFBQSxNQUNOLFVBQVUsTUFBTSxJQUFJLGFBQWEsS0FBSyxHQUFHLEVBQUUsS0FBSztBQUFBLElBQ2xELENBQUM7QUFFRCxTQUFLLFdBQVc7QUFBQSxNQUNkLElBQUk7QUFBQSxNQUNKLE1BQU07QUFBQSxNQUNOLFVBQVUsTUFBTSxrQkFBa0IsS0FBSyxHQUFHO0FBQUEsSUFDNUMsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUVBLE1BQU0sZUFBOEI7QUFDbEMsVUFBTSxNQUFPLE1BQU0sS0FBSyxTQUFTO0FBQ2pDLFNBQUssV0FBVyxFQUFFLEdBQUcsa0JBQWtCLEdBQUksT0FBTyxDQUFDLEVBQUc7QUFBQSxFQUN4RDtBQUFBLEVBRUEsTUFBTSxlQUE4QjtBQUNsQyxVQUFNLEtBQUssU0FBUyxLQUFLLFFBQVE7QUFBQSxFQUNuQztBQUFBO0FBQUEsRUFHQSxlQUFxQjtBQUNuQixVQUFNLFNBQVMsS0FBSyxJQUFJLFVBQVUsZ0JBQWdCLG1CQUFtQjtBQUNyRSxlQUFXLFFBQVEsUUFBUTtBQUN6QixZQUFNLE9BQU8sS0FBSztBQUNsQixXQUFLLGVBQWU7QUFBQSxJQUN0QjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLE1BQU0sZUFBOEI7QUFDbEMsVUFBTSxFQUFFLFVBQVUsSUFBSSxLQUFLO0FBQzNCLFVBQU0sV0FBVyxVQUFVLGdCQUFnQixtQkFBbUI7QUFDOUQsUUFBSSxTQUFTLFNBQVMsR0FBRztBQUN2QixnQkFBVSxXQUFXLFNBQVMsQ0FBQyxDQUFDO0FBQ2hDO0FBQUEsSUFDRjtBQUNBLFVBQU0sT0FBTyxVQUFVLFFBQVEsSUFBSTtBQUNuQyxVQUFNLEtBQUssYUFBYSxFQUFFLE1BQU0scUJBQXFCLFFBQVEsS0FBSyxDQUFDO0FBQ25FLGNBQVUsV0FBVyxJQUFJO0FBQUEsRUFDM0I7QUFDRjsiLAogICJuYW1lcyI6IFsiaW1wb3J0X29ic2lkaWFuIiwgImltcG9ydF9vYnNpZGlhbiIsICJpbXBvcnRfb2JzaWRpYW4iLCAiaW1wb3J0X29ic2lkaWFuIiwgImRhdGVTdHIiLCAiaW1wb3J0X29ic2lkaWFuIiwgImltcG9ydF9vYnNpZGlhbiIsICJpbXBvcnRfb2JzaWRpYW4iLCAiaW1wb3J0X29ic2lkaWFuIiwgIlRBU0tTX0RJUiIsICJpbXBvcnRfb2JzaWRpYW4iLCAiY2VsbHMiLCAiY2VsbCIsICJpbXBvcnRfb2JzaWRpYW4iLCAiZGlzcGxheU5hbWUiLCAiaW1wb3J0X29ic2lkaWFuIiwgInAyIiwgImFkZERheXMiLCAiaW1wb3J0X29ic2lkaWFuIiwgImltcG9ydF9vYnNpZGlhbiJdCn0K
