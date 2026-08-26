---
title: "Lint 检查规则"
type: reference
domain:
  - 知识库管理
created: 2026-07-07
updated: 2026-08-18
tags:
  - wiki/lint
---

# Lint 检查规则

> 检查范围仅限 `wiki/` 目录。`raw/` 只读不检查，`inbox/skills/output` 暂不纳入。

## 小检查（轻量，扫结构不读正文，可高频运行）

- **Frontmatter 完整性**：必填字段是否缺失、type/domain 值是否合法、日期格式和逻辑是否正确
- **交叉引用双向性**：只把页面 `## 关联页面` 章节中的 wiki 关系链接作为双向性硬约束；A 的关联页面列出 B 时，B 的关联页面也应列出 A。正文内联提及、frontmatter 的 `source` / `subjects` 和示例代码中的 wikilink 不要求机械反链，可作为补链提示但不得计入硬错误。对 raw 的引用始终是单向溯源，不检查反向
- **死链检测**：wikilink 指向的页面是否存在
- **index.md 一致性**：与实际文件是否匹配（多收录/漏收录）
- **空壳页面**：排除 frontmatter 后正文 < 15 行的页面
- **页面结构**：按主题而非时间组织

## 大检查（重量，逐页读正文做语义分析，用户要求时执行）

- **跨页面矛盾检测**：事实矛盾（必须修）、定义冲突（需统一）、立场矛盾（不同来源有不同观点正常，标记即可）
- **过时信息标记**：含版本号/定价/时效性词汇（"最新""目前"）且 updated 超过 3 个月的内容
- **孤立页面分析**：零入链页面为什么没人引用，是遗漏还是确实没价值
- **被多篇页面提及但未创建的概念/实体**
- **目录覆盖度**：comparisons/ 是否为空（评估是否需要建对比页）、entities/ 是否过少（核心工具/人物应建实体页）

## 常见 frontmatter 错误

| 错误 | 原因 | 修复 |
|---|---|---|
| FM 字段解析失败 | 开头用了 `***` 而非 `---` | 把 `***\n\n` 替换为 `---\n\n` |
| 双层关闭符 | 插入 `---` 时重复 | 删除多余的 `---\n---` 行 |
| V2 字段跑到正文里 | 关闭符 `---` 插入位置不对 | 确认 `updated:` 后紧跟 `---\n` |
| relates_to 空列表 | YAML 空值未正确填写 | 展开为多行列表格式 |
| relates_to 括号不闭合 | `[tag, [[页面]]` 少写 `]` | 展开为多行格式 |
| YAML 列表某行缺 `-` | 前缀横线被遗漏 | 检查每行是否以 `- ` 开头 |

## 假阳性陷阱

### 双层关闭符检测

直接用 `content.count('---') >= 4` 会产生大量误判（Markdown 表格分隔符 `| --- | --- |` 被误识别）。

正确做法：先提取 frontmatter 区域，在结束后查找 `---` 时，检查前面几行是否在表格上下文（包含 `|`）。

大多数"双层关闭符"警报实际上是 Markdown 水平线，无需修复。

### relates_to 空列表检查

```python
# ❌ 错误方式：只检查字段存在（有内容的列表也会触发）
if 'relates_to:' in fm_text:
    issues.append(f"[空relates_to] {rel}")

# ✅ 正确方式：检查列表是否有实际条目
m = re.search(r'^relates_to:\s*\n((?:\s*-.*\n)*)', content, re.MULTILINE)
if m:
    items = m.group(1).strip()
    if not items:
        issues.append(f"[空relates_to] {rel}")
```

### 空壳页面检查

统计行数时必须先排除 frontmatter，否则 30+ 行正常页面会被误判为空壳：

```python
def count_lines(content):
    lines = content.split('\n')
    in_fm = False
    count = 0
    for line in lines:
        if line.strip() == '---':
            in_fm = not in_fm
            continue
        if not in_fm and line.strip():
            count += 1
    return count
```

实测经验：cron 报告的"120个页面缺少 relates_to"是误判，实际只有 28 个。

## 修复优先级

frontmatter 缺失 > 内容重复 > 格式问题。每次修一类，重新运行确认。

## 问题分类与处理

- **可直接修复**（补引用、修格式、改索引、删空壳）→ 列出修复计划，用户确认后执行
- **需要判断**（过时信息是否更新、新概念是否创建、矛盾如何处理）→ 给出建议，等用户决定

## 报告产出

检查完成后形成体检报告，写入 `lint/YYYY-MM-DD.md`（当天已有报告则追加章节，不覆盖）。

报告包含：
- **检查概况**：检查类型（小检查/大检查）、检查日期、页面总数
- **可直接修复**：问题清单（页面 + 问题 + 修复建议），表格形式
- **需要判断**：问题清单（页面 + 问题 + 建议），表格形式
- **修复记录**：用户确认后执行修复，在此记录结果

Frontmatter 格式参考 [[schema/templates.md]]，type 用 `lint`。

## 触发方式

- 「lint 检查」「review 一下」「格式检查」「小检查」→ 执行小检查
- 「深度检查」「大检查」→ 执行大检查
- 每入库 5-10 篇后 → 建议执行小检查

## 关联页面

- [[schema/templates.md]] — Frontmatter 字段模板，判断"必填字段是否完整"的依据
