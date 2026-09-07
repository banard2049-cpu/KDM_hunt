# KDM-Hunt 狩猎纯净版 — Android 离线版

本项目原本是一个需要 Python 后端的纯网页狩猎面板（`index.html` + `assets/` + `data/`）。
为了在手机/平板上离线单机使用，仓库加入了 **Capacitor + Android** 打包支持：

- `index.html` 已改造为**离线可用**：优先读取随包内置的 `data/*.json`，不再强制依赖
  Python 的 `/api/data`（后端仅在静态文件缺失时作为回退）。
- 用 **GitHub Actions** 自动构建 release APK 并发布到 **GitHub Release**。
  本机不需要安装任何 Android 工具链。

## 打包结构

## Boss 战利品

顶部的”战利品”入口支持 45 个 Boss／变体、136 个独立等级，包含本体、赌博者宝箱、千宰屠夫、官方和粉丝扩展。狩猎推进或手动调位触发遭遇时，会立即预选对应 Boss 与具体等级；获胜后再点击”抽取战后奖励”。非狩猎战斗可手动选择。

卡牌按实例逐张展示，可点击放大、弃置和撤销。弃置不回牌库，同场不能再次抽到或指定拿取该实例；同名的其他实例不受影响。随机补抽、指定拿牌与标准奖励共用剩余牌库，牌库不足时不洗回、不部分发奖。标准奖励每场一次，领取后不能通过撤销后续操作再次领取。

战利品进度保存于浏览器 `kdm-loot-v1`，独立于狩猎的清理操作。可切换已有战斗、导出全部记录；狩猎导出的 JSON 包含关联的 `lootBattle`。旧狩猎存档仍可恢复，首次遭遇时补建唯一战斗标识。

清晰度”高”使用用户提供的 9 张高清基础规则页，覆盖 8 个本体 Boss 和传奇补充规则，原图不重新压缩。**自动奖励始终沿用 TTS 模组规则，清晰度不改变结算。**尖叫羚羊、王之禁卫、屠夫等与基础书存在差异，页面会列出具体差异。

资料例外均在界面说明：年老大师的胜利文字被模组水印遮挡，Young Lion 缺少专用规则，使用手动拿牌；Scourgelord 骰表缺失总点数 11 时保留骰子并提示手动结算；Gnasher 的 Ragesoul Shard 与牌库名称无法确认对应，提示自行核对。其他非卡牌效果与后续故事事件以文字提醒和原图结算。

### Android 打包注意事项

由于 `data/loot.json` 文件较大（734KB），Android 在打包时会默认压缩 assets 中的 JSON 文件。这会导致 WebView 的 fetch API 无法正确读取，出现”牌库文件载入失败”错误。

**解决方案**：在 `android/app/build.gradle` 的 `aaptOptions` 中添加 `noCompress 'json'` 配置，防止 JSON 文件被压缩。已在 v1.0.6 版本中修复。

### 数据来源与重建

运行时使用 `data/loot.json`、`assets/loot/`、`assets/loot-engine.js` 和 `assets/loot-ui.js`，无需新增服务器接口或联网取图。GCE 原始归档为主，千宰屠夫专用归档优先；不同归档和变体分开保留。卡牌包含独立实例标识、原 CardID、图集格坐标及来源 GUID／归档路径。

某些指定奖励需要多张卡，而 TTS 只归档了少量模板，例如千宰屠夫的 5 张破损提灯。导入器按规则所需的最大数量建立有限”指定奖励备牌”，保留模板来源；先消耗原牌库，再消耗备牌。它不会改变原随机牌库的张数，也不会在弃置后补牌或无限复制。

```powershell
node scripts/import-loot.cjs “<TTS Mods 目录>”
python scripts/render-loot-rules.py .research-scratch/loot-pdf-jobs.json
node scripts/import-loot-hd.cjs “<高清规则书目录>”
npm test
npm run web:stage
```

Python 重建步骤需要 PyMuPDF 和 Pillow；应用运行与日常打包不需要它们。导入器只解析 Lua 的数据表，不执行模组脚本。`npm test` 检查所有奖励骰表边界、条件分支、实例守恒、弃置与撤销、重复领取、存档恢复、高清图片、60 个狩猎等级的遭遇与导出，并运行原有狩猎回归测试。

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
npm run web:stage
npx cap add android
npm run android:sync
npm run android:version
cd android
./gradlew :app:assembleDebug
```

APK 输出在 `android/app/build/outputs/apk/debug/`。
