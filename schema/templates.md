---
title: "页面格式模板"
type: reference
created: 2026-06-06
updated: 2026-08-27
tags:
  - wiki/meta
---

# 页面格式模板

> 所有 wiki 和 output 页面的 frontmatter 与正文结构规范。

**通用字段 `source`（所有 wiki 内容页必填）：** 适用于 source、entity、concept、comparison，指向原始素材文件 `[[raw/文件名.md]]`。多个来源用列表格式。非 raw 文件来源（如对话产生）填来源说明。`index` 和 `domain-index` 是聚合索引页，不要求 `source`。

**通用字段 `domain`（所有 wiki 内容页与 domain-index 必填）：** 内容页使用 YAML 列表，领域路径用斜杠分隔层级，如 `domain: [编程/Python, AI, 思维工具]`；domain-index 按下方索引模板使用单一路径。根聚合页 `wiki/index.md` 不要求 `domain`。无斜杠即一级领域，内容页最多 4 个领域路径。子领域展开规则见 [[schema/domain-rules.md]]，当前领域清单见 [[wiki/index.md]]。

---

## 字段对照表

| 字段 | source | entity | concept | comparison |
|------|:------:|:------:|:-------:|:----------:|
| title | ✅ | ✅ | ✅ | ✅ |
| type | ✅ | ✅ | ✅ | ✅ |
| source | ✅ | ✅ | ✅ | ✅ |
| domain | ✅ | ✅ | ✅ | ✅ |
| created | ✅ | ✅ | ✅ | ✅ |
| updated | ✅ | ✅ | ✅ | ✅ |
| tags | ✅ | ✅ | ✅ | ✅ |
| author | 可选 | — | — | — |
| entity_type | — | ✅ | — | — |
| confidence | — | 可选 | — | — |
| repo | — | 可选（工具类必填） | — | — |
| subjects | — | — | — | ✅ |

### 字段兼容与扩展规则

上表定义各页面类型的核心字段，不是禁止扩展字段的封闭白名单。核心必填字段缺失属于 Lint 错误；已登记的扩展字段允许保留，不得仅因其未列入核心字段表而删除。

现有兼容扩展字段：

| 字段 | 适用页面 | 用途 |
|---|---|---|
| aliases | concept / entity | 页面别名 |
| status | concept | 既有概念页的内容状态 |
| origin | concept | 既有页面的形成来源 |
| roleLabel | 客户类 entity | 当前角色描述 |
| currentWorkScenarios | 客户类 entity | 当前工作场景 |
| aiGoals | 客户类 entity | AI 使用目标 |
| activeProjects | 客户类 entity | 当前项目 |
| toolStack | 客户类 entity | 当前工具栈 |
| advisorNotes | 客户类 entity | 服务与判断边界 |
| priorityTopics | 客户类 entity | 优先议题 |

新增其他扩展字段前，必须先在本节登记名称、适用页面和语义；同一含义不得重复创建不同字段。Lint 对未登记字段先报告为“待确认扩展”，不得自动删除。

---

## Source（素材摘要）页面

```yaml
---
title: "素材标题"
type: source
source: "[[raw/原始文件名.md]]"
author: "作者"
domain:
  - 领域名
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags:
  - wiki/source
---
```

**正文结构：**
1. 概述（1-2 段总结核心内容）
2. 关键要点（分条列出）
3. 详细笔记（按原文结构展开）
4. 关联页面（列出相关 wiki 链接）

---

## Entity（实体）页面

```yaml
---
title: "实体名称"
type: entity
entity_type: person | organization | tool | project  # 兼容既有中文值：人物 | 组织 | 工具 | 项目
source: "[[raw/原始文件名.md]]"
repo: "https://github.com/owner/name"   # 工具类（tool/project）必填
domain:
  - 领域名
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags:
  - wiki/entity
---
```

**entity_type 兼容规则：** `person/人物`、`organization/组织`、`tool/工具`、`project/项目` 分别视为同一类型。现有页面保留原值；新页面优先使用英文规范值。Lint 和批量解析必须先按此映射归一化，不得把中文值报为错误，也不得为统一格式批量改写现有页面。

**可选字段：**

```yaml
confidence: 1.0    # 置信度，只在 entity 页面可选。标在信源（人/组织）上，不标在每条信息上。
                    # 范围 0.0-1.0（实际 0.7-1.0，低质量信源不入库）
                    # 创建时 Claude Code 联网搜索 → 给初始分 → 询问用户确认

repo: "https://github.com/owner/name"    # GitHub 仓库地址。工具类实体（entity_type: tool/project/工具）必填，
                                         # 闭源无官方仓库的工具（如 Obsidian）留空并在正文注明闭源。
                                         # source 字段不放 GitHub URL（由 repo 接管），保持 source 的 raw 溯源原义。
```

置信度参考（分级核心维度：**是否从业** + **级别**。从业 = 在 AI 公司任职 / sota agent 或知名开源项目作者）：

| 分数 | 信源类型 | 例子 |
|------|---------|------|
| 1.0 | 顶级从业（top 公司创始人、sota agent 作者等） | Karpathy（OpenAI 创始成员/特斯拉 AI 总监）、Boris Cherny（Claude Code 创建者）、Peter Steinberger（OpenClaw 作者） |
| 0.9 | 其他知名从业 | 李昕（字节 DeerFlow 核心开发者） |
| 0.8 | 头部非从业 KOL | 数字生命卡兹克 |
| 0.7 | 其他非从业 KOL | （存疑但值得记录的非从业 KOL） |

**创建 entity 时的流程：**

1. Claude Code 联网搜索了解这个人/组织
2. 基于搜索结果给出初始 confidence 值
3. 告诉用户理由，询问是否调整
4. 用户确认后写入 frontmatter

单片入库的素材不需要标 confidence，也不需要建 entity。同一信源第二次出现时再提醒建 entity 页。

**正文结构：**
1. 概述（一段话介绍是谁/是什么）
2. 关键信息（背景、成就、特点等）
3. 相关观点与贡献
4. 关联页面

---

## Concept（概念）页面

```yaml
---
title: "概念名称"
type: concept
source: "[[raw/原始文件名.md]]"
domain:
  - 领域名
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags:
  - wiki/concept
---
```

**正文结构：**
1. 叙事线
2. 定义（一句话解释）
3. 详细说明
4. 应用场景 / 实例
5. 关联页面

**叙事线写法：** 用 ASCII 代码块画本页大标题之间的**逻辑链路**--它不是目录，而是「这页为什么按这个顺序讲」的说明。每个大标题作为一个节点，节点间用 `│`/`▼` 串起递进，竖线旁的小字解释**每一节为什么接着上一节**（过渡逻辑）。简化示例：

```
定义（是什么）
  │  知道了是什么 -> 接着问怎么组成
  ▼
构成（怎么组成）
  │  知道了构成 -> 接着问怎么用
  ▼
应用（怎么用）
```

**维护规则：** 每次增删改大标题或调整章节顺序，必须同步更新叙事线图。新增内容时问自己「它该塞在哪两节之间、为什么接在这」--把那个「为什么」写成过渡句；答不上来就说明不该接在这。完整范本见 [[wiki/concepts/Harness.md]]（含 HTML 注释 + 树状图 + blockquote 三段式写法）。

---

## Comparison（对比分析）页面

```yaml
---
title: "A vs B"
type: comparison
source: "[[raw/原始文件名.md]]"
subjects:
  - "[[wiki/xxx/A.md]]"
  - "[[wiki/xxx/B.md]]"
domain:
  - 领域名
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags:
  - wiki/comparison
---
```

**正文结构：**
1. 对比背景（为什么要对比）
2. 对比维度表格
3. 总结与建议
4. 关联页面

---

## Output（交付物）页面

```yaml
---
title: "交付物标题"
type: output
domain:
  - 领域名
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags:
  - output/项目名
---
```

**正文结构：**
1. 需求背景
2. 正文内容
3. 结论 / 要点
4. 参考来源（wiki 或 raw 链接）

---

## Skill（技能流程）页面

```yaml
---
title: "技能名称"
type: skill
domain:
  - 领域名
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags:
  - skill
---
```

**正文结构：**
1. 适用场景
2. 操作步骤
3. 注意事项 / 常见问题
4. 关联页面

---

## Domain Index（领域分表索引）

### 一级领域分表

```yaml
---
title: "领域名 领域索引"
type: domain-index
domain: 领域名
level: 1
parent: null
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
```

### 子领域分表（路径式 domain + parent + level）

```yaml
---
title: "父领域/子领域 子领域索引"
type: domain-index
domain: 父领域/子领域
level: 2
parent: 父领域
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
```

三级领域同理：`domain: 父领域/子领域/孙领域`、`level: 3`、`parent: 父领域/子领域`，文件名 `父领域-子领域-孙领域.md`。

**正文结构（一/子领域通用）：**
1. 标题 + 一句话领域描述 + 页数
2. Sources 表格（页面 | 简介 | 创建日期）
3. Entities 表格
4. Concepts 表格
5. Comparisons 表格

无内容的类型写 `*暂无*`。

---

## Log（日志）格式

文件路径：`log/YYYY-MM/YYYY-MM-DD.md`

```yaml
---
title: "YYYY-MM-DD"
type: log
created: YYYY-MM-DD
---
```

**条目格式：**

```markdown
## 操作类型 | 简要标题

描述内容，包含涉及的页面链接。
```

操作类型：`ingest` | `query` | `enrich` | `output` | `lint` | `update` | `daily`

---

## 关系标签（用于正文"关联页面"章节）

页面间关系不用 frontmatter 字段，而是在正文末尾的 `## 关联页面` 章节用 wikilink + 文字描述：

`memory_layer` 和 Frontmatter 键 `relates_to` 不属于现行字段模型；不得要求或自动补写。正文中的 `relates_to` 仍是合法关系标签，与已废弃的同名 Frontmatter 键不是一回事。

```markdown
## 关联页面

- [[wiki/concepts/LLM-Wiki方法论.md|LLM Wiki 方法论]] — 本文的概念详解
- [[wiki/entities/Andrej-Karpathy.md|Andrej Karpathy]] — 作者
- [[wiki/sources/某反对观点.md|某反对观点]] — ⚠️ contradicts（与本文观点矛盾）
```

**关联页面只放 wiki 内部页面**（entity / concept / comparison / source 等），不放 `[[raw/...]]`。raw 是外部原始素材，不参与 wiki 关系网络，也无法完成双向链接（raw 无「关联页面」章节）。raw 的溯源走两条路：① frontmatter `source` 字段（每个 Wiki 内容页必填，已挂靠 raw）；② 正文中具体论点/数据处 inline 链接 `[[raw/...]]`。concept 页表达「本页来源」时链 source 页（raw 的 wiki 化代理，能参与双向链接），不直接链 raw。

### 7 种关系标签

| 标签 | 含义 | 示例 |
|------|------|------|
| supports | 支持/佐证 | "[[AI绘图]] supports [[AIGC]]" |
| contradicts | 矛盾/反驳 | "[[某观点]] contradicts [[传统认知]]" |
| refines | 细化/深化 | "「上下文压缩」refines「LLM工作原理」" |
| supersedes | 取代/替代 | "「MiniMax-M2.5」supersedes「mimo-v2.5」" |
| relates_to | 一般关联 | "「NAS」relates_to「Docker」" |
| example_of | 实例 | "「设计虱」example_of「自媒体博主」" |
| implements | 实现 | "「Hermes」implements「Agent工作流」" |

### 双向链接规则

如果 A 在 `## 关联页面` 章节列出 B，B 的关联页面章节也应引用 A，确保关系网络双向连通。正文内联提及用于解释上下文，不强制机械反链；frontmatter 的 `source` / `subjects` 与示例代码也不纳入双向性硬检查。
