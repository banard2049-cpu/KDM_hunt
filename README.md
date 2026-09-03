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

当前工作流构建的是 **debug 签名** APK —— 无需任何密钥即可在任意设备上安装
（Android 会提示“未知来源”，允许后安装）。

> ⚠️ debug 签名每次构建密钥不同。若以后要支持“装新版本直接覆盖升级”，需要改用**稳定
> keystore**：生成一个 `.jks`，把密钥与口令存为仓库 Secrets，再改工作流里用
> `assembleRelease` + 对应 signingConfig。这一步需要你提供正式签名证书。

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
