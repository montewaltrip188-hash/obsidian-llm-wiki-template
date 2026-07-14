---
title: "页面格式模板"
type: reference
created: 2026-06-06
updated: 2026-06-06
tags:
  - wiki/meta
---

# 页面格式模板

> 所有 wiki 和 output 页面的 frontmatter 与正文结构规范。

**通用字段 `source`（所有 wiki 页面必填）：** 指向原始素材文件 `[[raw/文件名.md]]`。多个来源用列表格式。非 raw 文件来源（如对话产生）填来源说明。

**通用字段 `domain`（所有 wiki 页面必填）：** YAML 列表，领域路径用斜杠分隔层级。如 `domain: [编程/Python, AI, 思维工具]`。无斜杠即一级领域。最多 4 个领域路径。子领域展开规则见 [[schema/domain-rules.md]]，当前领域清单见 [[wiki/index.md]]。

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
| subjects | — | — | — | ✅ |

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
entity_type: person | organization | tool | project
source: "[[raw/原始文件名.md]]"
domain:
  - 领域名
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags:
  - wiki/entity
---
```

**可选字段：**

```yaml
confidence: 1.0    # 置信度，只在 entity 页面可选。标在信源（人/组织）上，不标在每条信息上。
                    # 范围 0.0-1.0（实际 0.7-1.0，低质量信源不入库）
                    # 创建时 Claude Code 联网搜索 → 给初始分 → 询问用户确认
```

置信度参考：

| 分数 | 信源类型 | 例子 |
|------|---------|------|
| 1.0 | 领域顶级专家/权威机构 | Karpathy（对 AI） |
| 0.9 | 知名从业者/博主 | 数字生命卡兹克 |
| 0.8 | 普通信源 | 不知名博主 |
| 0.7 | 需交叉验证 | 存疑但值得记录 |

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
1. 定义（一句话解释）
2. 详细说明
3. 应用场景 / 实例
4. 关联页面

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

```markdown
## 关联页面

- [[wiki/concepts/LLM-Wiki方法论.md|LLM Wiki 方法论]] — 本文的概念详解
- [[wiki/entities/Andrej-Karpathy.md|Andrej Karpathy]] — 作者
- [[wiki/sources/某反对观点.md|某反对观点]] — ⚠️ contradicts（与本文观点矛盾）
```

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

如果 A 引用了 B，B 的关联页面章节也应引用 A，确保双向连通。
