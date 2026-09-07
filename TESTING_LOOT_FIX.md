# 战利品载入修复验证指南

## 问题症状

在安装 v1.0.5 及之前版本的 APK 后，点击"战利品"按钮会显示：

```
战利品载入失败：牌库文件载入失败。原存档未修改。
```

## 修复内容

已在以下提交中修复此问题：

1. **66b4015** - 前端增强和文档
   - 在 `assets/loot-ui.js` 中添加多路径尝试逻辑
   - 更新 README.md 和使用说明.txt
   - 添加 ANDROID_BUILD_FIX.md 详细文档

2. **0eac24e** - CI 自动化修复
   - 在 GitHub Actions 工作流中添加自动修复步骤
   - 构建时自动注入 `noCompress 'json'` 配置

## 如何测试修复

### 方法 1：使用 GitHub Actions 构建（推荐）

1. 推送代码到 GitHub：
   ```bash
   git push origin master
   ```

2. 在 GitHub 仓库页面，点击 **Actions** → **Android Release APK** → **Run workflow**

3. 等待构建完成（约 5-10 分钟）

4. 在构建结果页面下载 Artifacts 中的 `kdm-hunt-apk.zip`

5. 解压并安装 APK 到 Android 设备

6. 打开应用，点击顶部"战利品"按钮

7. **验证成功标志**：
   - 应该看到 "牌库已准备好。选择 Boss 和等级开始，或恢复已有战斗。"
   - 可以在左侧选择 Boss（如"White Lion"）
   - 可以选择等级（如"Level 1"）
   - 点击"开始新战斗"后能看到战斗界面

### 方法 2：本地构建测试

如果你有 Android SDK 和 JDK 21：

```bash
# 1. 清理并准备
npm install
npm run web:stage

# 2. 生成 Android 项目
npx cap add android

# 3. 手动应用修复（参考 ANDROID_BUILD_FIX.md）
# 编辑 android/app/build.gradle，在 aaptOptions 中添加：
#   noCompress 'json'

# 4. 同步和构建
npx cap sync android
npm run android:version
cd android
./gradlew :app:assembleDebug

# 5. 安装 APK
adb install app/build/outputs/apk/debug/app-debug.apk
```

## 预期结果

### 修复前
- 点击"战利品"：显示错误消息
- 无法选择 Boss 或等级
- "开始新战斗"按钮禁用

### 修复后
- 点击"战利品"：显示 "牌库已准备好"
- 可以正常选择 Boss（45个选项）和等级（136个选项）
- 可以开始新战斗并抽取战后奖励
- 卡牌图片正确显示，可以点击放大

## 技术细节

### 修复原理

1. **根本原因**：Android 构建工具（aapt）默认压缩 assets 中的 JSON 文件，而 Capacitor WebView 的 `fetch()` API 无法读取压缩后的大文件（loot.json 为 734KB）

2. **解决方案**：
   - 在 `build.gradle` 中添加 `noCompress 'json'`，防止 JSON 文件被压缩
   - 在前端添加容错逻辑，尝试多个路径加载文件
   - 在 CI 工作流中自动应用此配置

### 相关文件

- **前端**: `assets/loot-ui.js` - 文件加载逻辑
- **数据**: `data/loot.json` - 战利品数据（734KB）
- **构建**: `android/app/build.gradle` - Android 构建配置（gitignored）
- **CI**: `.github/workflows/android-build.yml` - 自动化构建流程
- **文档**: `ANDROID_BUILD_FIX.md` - 详细修复说明

## 回归测试清单

- [ ] 战利品页面能正常打开
- [ ] 能选择不同的 Boss 和等级
- [ ] 能开始新战斗
- [ ] 能抽取战后奖励
- [ ] 卡牌图片正确显示
- [ ] 能点击卡牌放大查看
- [ ] 能弃置卡牌
- [ ] 能撤销操作
- [ ] 能在"已有战斗记录"中切换战斗
- [ ] 狩猎功能不受影响（独立验证）

## 版本标记

修复版本：**v1.0.6**

建议在 `package.json` 中更新版本号后，打 tag 发布：

```bash
npm run android:version  # 更新 Android versionCode
git tag v1.0.6
git push origin v1.0.6
```

GitHub Actions 会自动构建并发布到 Release 页面。
