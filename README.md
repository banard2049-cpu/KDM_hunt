# KDM-Hunt 狩猎纯净版 — Android 离线版

本项目原本是一个需要 Python 后端的纯网页狩猎面板（`index.html` + `assets/` + `data/`）。
为了在手机/平板上离线单机使用，仓库加入了 **Capacitor + Android** 打包支持：

- `index.html` 已改造为**离线可用**：优先读取随包内置的 `data/*.json`，不再强制依赖
  Python 的 `/api/data`（后端仅在静态文件缺失时作为回退）。
- 用 **GitHub Actions** 自动构建 release APK 并发布到 **GitHub Release**。
  本机不需要安装任何 Android 工具链。

## 打包结构

| 文件 / 目录 | 作用 |
| --- | --- |
| `index.html` | 游戏 UI（离线自足） |
| `assets/`, `data/` | 图片与数据（随 APK 内置） |
| `capacitor.config.json` | Capacitor 配置（`appId`/`appName`/`webDir`） |
| `package.json` | Capacitor npm 依赖（仅 CI 构建需要） |
| `.github/workflows/android-build.yml` | 一键构建 + 发布 Release 的工作流 |

> `android/`、`www/`、`node_modules/` 都是 CI 运行时生成的，已加入 `.gitignore`，
> 不会进入仓库。

## 如何获取 APK

### 方式 A：手动触发（推荐，无需打 tag）

1. 把本仓库推到 GitHub（`git push`）。
2. 在仓库页面点 **Actions** → **Android Release APK** → **Run workflow** → 运行。
3. 构建完成后，可在该次运行页底部 **Artifacts** 下载 `kdm-hunt-apk`（zip 内含 APK）。

### 方式 B：打版本 tag 自动发布到 Release

```bash
git tag v1.0.0
git push origin v1.0.0
```

工作流会构建并把 APK 以 `kdm-hunt-v1.0.0.apk` 上传到对应的 **GitHub Release** 页面。

## 签名说明

当前工作流构建的是使用仓库内项目专用开发证书签名的 **debug APK**。从 `v1.0.3`
开始，各版本签名保持一致，可以直接覆盖升级（Android 仍会提示允许安装未知来源）。

> ⚠️ `v1.0.2` 及以前由 CI 临时 debug 证书签名，与新证书不同，因此首次升级到
> `v1.0.3` 时需要先卸载旧版；之后的版本即可直接覆盖安装。仓库内证书仅供自用测试，
> 若发布到应用商店，应改用保存在 GitHub Secrets 中的正式私有签名证书。

## 手动在本地构建（可选）

若你装了 Node + JDK 21 + Android SDK，可本地构建：

```bash
npm install
mkdir -p www
cp index.html www/
cp -R assets www/
cp -R data www/
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
```

APK 输出在 `android/app/build/outputs/apk/debug/`。
