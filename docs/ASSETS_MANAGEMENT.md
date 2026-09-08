# KDM Hunt 资源管理说明

## 概述

游戏资源（约 483MB）不提交到 Git 仓库，而是通过 GitHub Release 分发，保持仓库轻量。

## 资源分类

### 📦 公开资源（通过 Release 分发）
- `assets/board/` - 游戏面板图片 (3.7MB)
- `assets/cards/` - 卡牌图片 (34MB，不含 HD)
- `assets/hunt-backs/` - 狩猎背景图 (41MB)
- `assets/hunt-sheets/` - 狩猎表单 (117MB)
- `assets/loot/` - 战利品图片 (289MB，不含 HD)

### 🔒 私有资源（仅本地保留）
- `assets/cards/rulebook-hd/` - 高清规则书卡牌
- `assets/loot/hd/` - 高清战利品图片
- 任何带 `-hd` 或 `_hd` 后缀的文件

**私有资源永远不会：**
- ❌ 提交到 Git 仓库
- ❌ 上传到 GitHub Release
- ❌ 包含在公开的压缩包中

## 本地开发

### 如果你有完整资源（包括 HD）

确保 `assets/` 目录存在并包含所有子目录，正常开发即可。Git 会自动忽略这些文件。

### 如果你是新克隆的仓库

运行下载脚本获取公开资源：

```bash
node scripts/download-assets.cjs
```

这会从 GitHub Release 下载所有公开资源（不含 HD）。

## 创建/更新 Release 资源包

### 1. 打包公开资源

```bash
node scripts/pack-assets.cjs
```

这会：
- ✅ 包含所有公开资源
- ❌ 自动排除所有 HD 资源
- 生成 `kdm-hunt-assets.tar.gz`（约 100-150MB 压缩后）

### 2. 上传到 GitHub Release

**重要：** `assets-v2` 标签已被配置为不触发 CI 构建，专门用于存储资源。

**方式 A：使用 gh CLI（推荐）**

```bash
gh release create assets-v2 \
  --title "Game Assets" \
  --notes "游戏资源包（不含HD资源）- 用于CI自动构建" \
  kdm-hunt-assets.tar.gz
```

更新已有 Release：

```bash
gh release upload assets-v2 kdm-hunt-assets.tar.gz --clobber
```

**方式 B：通过网页上传**

1. 访问 https://github.com/banard2049-cpu/KDM_hunt/releases/new
2. 在 "Choose a tag" 下拉框中输入：`assets-v2`（选择 "Create new tag: assets-v2 on publish"）
3. 在 "Release title" 填写：`Game Assets`
4. 在描述填写：`游戏资源包（不含HD资源）- 用于CI自动构建`
5. 拖拽 `kdm-hunt-assets.tar.gz` 文件到上传区域
6. 点击 "Publish release"

### 3. 测试下载

```bash
# 备份现有资源（如果需要）
mv assets assets.backup

# 测试下载脚本
node scripts/download-assets.cjs

# 验证文件完整性
ls -lh assets/*/
```

## CI 构建流程

GitHub Actions 会在构建 APK 前自动执行：

1. 检查 `assets/` 目录是否完整
2. 如果不完整，从 Release `assets-v2` 下载 `kdm-hunt-assets.tar.gz`
3. 解压到项目根目录
4. 验证所有必需的子目录都存在
5. 继续构建流程

**注意：** CI 构建的 APK 不包含 HD 资源，只包含标准分辨率资源。

## 本地构建完整版（含 HD）

如果你本地有 HD 资源，可以构建包含 HD 的完整版 APK：

```bash
# 确保 assets/ 包含 HD 资源
ls assets/cards/rulebook-hd/
ls assets/loot/hd/

# 正常构建
npm run web:stage
npx cap sync android
cd android && ./gradlew assembleDebug
```

生成的本地 APK 会包含 HD 资源，但这个版本不会通过 CI 发布。

## 使用自定义下载源

如果你想从其他地方下载资源（如私有 CDN、对象存储）：

### 方式 A：本地开发

```bash
ASSETS_URL=https://your-cdn.com/kdm-hunt-assets.tar.gz node scripts/download-assets.cjs
```

### 方式 B：CI 构建

在 `.github/workflows/android-build.yml` 中设置：

```yaml
- name: Download game assets
  run: node scripts/download-assets.cjs
  env:
    ASSETS_URL: https://your-cdn.com/kdm-hunt-assets.tar.gz
```

## 故障排查

### 打包时意外包含了 HD 资源

检查 `scripts/pack-assets.cjs` 中的 `EXCLUDE_PATTERNS`，确保包含：

```javascript
const EXCLUDE_PATTERNS = [
  '--exclude=**/hd',
  '--exclude=**/hd/*',
  '--exclude=**/*-hd.*',
  '--exclude=**/*_hd.*',
  '--exclude=**/rulebook-hd',
  '--exclude=**/rulebook-hd/*'
];
```

### 下载失败

1. 确认 Release `assets-v2` 存在
2. 确认其中包含 `kdm-hunt-assets.tar.gz` 文件
3. 检查网络连接和 GitHub API 访问

### Git 意外追踪了资源文件

```bash
# 从 Git 缓存中删除（但保留本地文件）
git rm -r --cached assets/board assets/cards assets/hunt-backs assets/hunt-sheets assets/loot

# 提交更改
git commit -m "Remove assets from Git tracking"
```

## 文件结构

```
assets/
├── board/              # 公开 - 游戏面板
├── cards/              # 公开 - 卡牌（不含 HD）
│   └── rulebook-hd/    # 🔒 私有 - 高清规则书（不上传）
├── hunt-backs/         # 公开 - 狩猎背景
├── hunt-sheets/        # 公开 - 狩猎表单
└── loot/               # 公开 - 战利品（不含 HD）
    └── hd/             # 🔒 私有 - 高清战利品（不上传）
```

## 安全提示

- ✅ HD 资源已被多层保护（.gitignore + tar 排除规则）
- ✅ 即使误操作，Git 和 Release 都不会包含 HD 资源
- ⚠️ 打包前可以手动检查压缩包内容：

```bash
# 列出压缩包内容，确认没有 hd 目录
tar -tzf kdm-hunt-assets.tar.gz | grep -i hd
# 如果没有输出，说明没有 HD 资源（正确）
```

## 相关文件

- `.gitignore` - 忽略所有 assets 和 HD 资源
- `scripts/pack-assets.cjs` - 打包脚本（自动排除 HD）
- `scripts/download-assets.cjs` - 下载脚本
- `.github/workflows/android-build.yml` - CI 构建流程
