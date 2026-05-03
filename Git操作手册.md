# Git 操作手册

> 本文档记录 noname 项目及蒸蒸日上扩展的 Git 操作流程
> 创建时间：2025-03-27

---

## 🚨 顶级安全约束（请优先阅读）

**本项目采用 Fork + upstream 协作模式，以下红线任何情况下都不得跨越：**

| 类别 | 操作 | 允许 | 说明 |
|------|------|------|------|
| ✅ 拉取 | `git fetch upstream` | 允许 | 仅下载官方代码到本地 |
| ✅ 合并 | `git merge upstream/main` | 允许 | 将官方代码合并到本地分支 |
| ✅ 推送 | `git push origin main` | 允许 | 推送到你的 Fork 仓库 |
| ⛔ 推送 | `git push upstream <任何分支>` | **严禁** | 不得向官方仓库推送 |
| ⛔ 推送 | `git push --all upstream` | **严禁** | 同上 |
| ⛔ 推送 | `git push --force upstream <任何分支>` | **严禁** | 同上 |

**为避免误操作，推荐关闭向 upstream 的推送能力（可选）**：

```powershell
# 将 upstream 的 push URL 设为无效地址，仅保留 fetch 能力
git remote set-url --push upstream DISABLE
# 验证：
git remote -v
# upstream  https://github.com/libnoname/noname.git (fetch)
# upstream  DISABLE                                       (push)
```

---

## 仓库结构说明

本项目包含两个 Git 仓库：

1. **主仓库** `fzq567/noname` - 无名杀项目本体
2. **扩展仓库** `fzq567/noname-extension` - 蒸蒸日上扩展（通过 submodule 挂载到 `apps/core/extension/蒸蒸日上/`）

---

## 一、主仓库（noname）代码提交

**适用场景**：修改了主仓库代码（如 `apps/core/` 下的文件、`scripts/` 等）

```powershell
# 1. 进入主仓库目录
cd e:\Users\Fu.zq\gitHub\noname

# 2. 查看变更
git status

# 3. 添加变更文件
git add <文件路径>
# 或添加所有变更
git add .

# 4. 提交
git commit -m "feat: 描述你的修改"

# 5. 推送到你的 Fork（origin）
git push origin main
```

**⚠️ 重要**：只能推送到 `origin`（你的 Fork），**严禁**推送到 `upstream`（官方仓库）

---

## 二、从官方仓库同步代码

**适用场景**：官方仓库（libnoname/noname）有更新，你想同步到本地

> ⚠️ **本节会接触 upstream 远程仓库**，请严格遵守：
> - 允许从 upstream **拉取**（fetch）和 **合并**（merge）
> - 严禁向 upstream **推送**（push）任何代码
> - 任何 `git push` 命令都只能面向 `origin`

```powershell
# 1. 进入主仓库目录
cd e:\Users\Fu.zq\gitHub\noname

# 2. 获取官方仓库最新代码
git fetch upstream

# 3. 合并到本地 main 分支
git merge upstream/main

# 4. 如果有冲突，解决后提交
# ...解决冲突...
git add .
git commit -m "merge: 同步官方仓库更新"

# 5. 推送到你的 Fork
git push origin main
```

### `git merge upstream/main` 命令详解

```
git merge upstream/main
         └─────┬─────┘
               │
               └── 将 upstream 远程仓库的 main 分支
                   合并到【当前所在分支】
```

**合并方向**：`upstream/main`（官方仓库）→ `当前分支`（你的本地 main）

**示例流程**：

```powershell
# 查看当前分支（假设你在 main 分支）
git branch
# 输出: * main   ← 当前在 main 分支

# 查看远程仓库配置
git remote -v
# 输出:
# origin    https://github.com/fzq567/noname.git (fetch)      ← 你的 Fork
# upstream  https://github.com/libnoname/noname.git (fetch)   ← 官方仓库

# 获取官方最新代码（仅下载，不合并）
git fetch upstream

# 将官方仓库的 main 分支合并到你当前的 main 分支
git merge upstream/main
```

**合并后状态**：
- 你的本地 main 分支现在包含：官方新代码 + 你自己的代码
- 然后执行 `git push origin main` 推送到你的 Fork

**注意**：我们修改过的文件（`vite.config.ts`、`scripts/dev.ts`、`.gitignore` 等）可能会与无名杀官方仓库的代码有冲突，需要仔细处理。

---

## 三、扩展仓库（蒸蒸日上）代码提交

**适用场景**：修改了扩展代码（`apps/core/extension/蒸蒸日上/` 下的文件）

```powershell
# 1. 进入扩展目录（submodule）
cd e:\Users\Fu.zq\gitHub\noname\apps\core\extension\蒸蒸日上

# 2. 查看变更
git status

# 3. 添加并提交到扩展仓库
git add .
git commit -m "feat: 新增技能 xxx"
# 或 git commit -m "fix: 修复 xxx 问题"

# 4. 推送到独立仓库
git push origin main
```

---

## 四、更新主仓库的 submodule 引用

**适用场景**：扩展代码已推送，需要让主仓库记录最新的扩展版本

```powershell
# 1. 进入主仓库目录
cd e:\Users\Fu.zq\gitHub\noname

# 2. 查看 submodule 状态（应该显示有变更）
git status

# 3. 添加 submodule 变更
git add apps/core/extension/蒸蒸日上

# 4. 提交
git commit -m "chore: 更新 蒸蒸日上 submodule 到最新版本"

# 5. 推送到你的 Fork
git push origin main
```

---

## 五、完整工作流程示例

**日常开发扩展的流程**：

```powershell
# ========== 第 1 步：修改扩展代码 ==========
cd e:\Users\Fu.zq\gitHub\noname\apps\core\extension\蒸蒸日上
# 编辑 extension.js 等文件...

# ========== 第 2 步：提交到扩展仓库 ==========
git add .
git commit -m "feat: 新增武将 xxx"
git push origin main

# ========== 第 3 步：更新主仓库引用 ==========
cd e:\Users\Fu.zq\gitHub\noname
git add apps/core/extension/蒸蒸日上
git commit -m "chore: 更新 蒸蒸日上 submodule"
git push origin main
```

---

## 六、常用命令速查表

| 操作 | 命令 |
|-----|------|
| 查看当前分支 | `git branch -v` |
| 查看远程仓库 | `git remote -v` |
| 查看变更状态 | `git status` |
| 查看提交历史 | `git log --oneline -5` |
| 查看 submodule 状态 | `git submodule status` |
| 更新所有 submodule | `git submodule update --init --recursive` |
| 拉取最新代码 | `git pull origin main` |
| 拉取官方代码（不合并） | `git fetch upstream` |
| 检查推送路径是否安全 | `git remote -v` （确认 push 不是 upstream）|

### ⛔ 禁用命令（违反安全约束）

| 禁用命令 | 原因 |
|---------|------|
| `git push upstream <任何分支>` | 会向官方仓库推送 |
| `git push --all upstream` | 同上 |
| `git push --force upstream <任何分支>` | 同上，且会强制覆盖 |
| `git push --mirror upstream` | 会镜像推送所有引用 |

---

## 七、注意事项

### 0. ⛔ 最重要：推送路径隔离
- **所有 `git push` 命令只能面向 `origin`**（你的 Fork 仓库 `fzq567/noname`）
- **严禁向 `upstream`（官方仓库 `libnoname/noname`）推送任何代码**
- 同样适用于扩展仓库：只能 push 到 `fzq567/noname-extension`
- 推荐使用顶级安全约束中的 `git remote set-url --push upstream DISABLE` 物理隔离

### 1. Submodule 特殊处理
- 修改扩展代码时，**必须**在 `apps/core/extension/蒸蒸日上` 目录内执行 Git 命令
- 扩展代码的提交和推送是**独立的**，不会自动同步到主仓库

### 2. 避免冲突
- 定期从官方仓库同步代码（`git fetch upstream`）
- 修改文件前先看是否有官方更新

### 3. 我们修改过的文件（同步官方代码时需特别注意）
- `apps/core/vite.config.ts`（端口 5173）
- `scripts/dev.ts`（stdio inherit + 注释 packages/extension）
- `.gitignore`（白名单路径更新）

### 4. 如果 submodule 显示为空
```powershell
git submodule update --init --recursive
```

---

## 八、项目配置变更记录

| 时间 | 变更内容 | 文件 |
|-----|---------|------|
| 2025-03-27 | 前端端口从 8080 改为 5173 | `apps/core/vite.config.ts` |
| 2025-03-27 | 添加子进程日志输出；注释空目录构建命令 | `scripts/dev.ts` |
| 2025-03-27 | 更新扩展白名单路径到 apps/core/extension/ | `.gitignore` |
| 2025-03-27 | 将 蒸蒸日上 改为 submodule 管理 | `.gitmodules` |

---

*本文档由 Qoder 辅助生成，如有疑问请查阅 Git 官方文档或咨询项目维护者。*
