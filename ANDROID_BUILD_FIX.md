# Android APK 战利品载入问题修复

## 问题描述

在 v1.0.5 及之前的版本中，Android APK安装后，战利品功能会显示错误：

```
战利品载入失败：牌库文件载入失败。原存档未修改。
```

## 根本原因

Android 构建工具（aapt）默认会压缩 assets 目录中的 JSON 文件。由于 `data/loot.json` 文件较大（734KB），压缩后的文件无法被 Capacitor WebView 的 `fetch()` API 正确读取。

## 修复方案

### 1. 防止 JSON 文件压缩

在 `android/app/build.gradle` 文件的 `aaptOptions` 中添加 `noCompress` 配置：

```gradle
aaptOptions {
    // Files and dirs to omit from the packaged assets dir, modified to accommodate modern web apps.
    // Default: https://android.googlesource.com/platform/frameworks/base/+/282e181b58cf72b6ca770dc7ca5f91f135444502/tools/aapt/AaptAssets.cpp#61
    ignoreAssetsPattern = '!.svn:!.git:!.ds_store:!*.scc:.*:!CVS:!thumbs.db:!picasa.ini:!*~'
    // Prevent compression of JSON files to allow WebView fetch API to read large data files
    noCompress 'json'
}
```

### 2. 增强前端错误处理

在 `assets/loot-ui.js` 中改进文件加载逻辑，尝试多种路径以提高 Android 兼容性：

```javascript
async function init(){
  try{
    // Try multiple paths for Android compatibility
    let response;
    const paths=['data/loot.json','./data/loot.json','/data/loot.json'];
    let lastError='';
    for(const path of paths){
      try{
        response=await fetch(path);
        if(response.ok){data=await response.json();break;}
        lastError=`HTTP ${response.status}`;
      }catch(e){lastError=e.message;continue;}
    }
    if(!data)throw new Error(`牌库文件载入失败 (${lastError})`);
    // ... rest of init code
  }catch(e){
    loadError='战利品载入失败：'+e.message+'。原存档未修改。';
    data=null;
    notice(loadError,true);
    $('lootNew').disabled=true;
  }
}
```

## 应用修复

由于 `android/` 目录在 `.gitignore` 中，需要在本地或 CI 构建时手动应用此修复：

1. 生成 Android 项目：
   ```bash
   npm install
   npx cap add android
   ```

2. 手动编辑 `android/app/build.gradle`，在 `defaultConfig.aaptOptions` 块中添加：
   ```gradle
   noCompress 'json'
   ```

3. 继续正常构建流程：
   ```bash
   npm run android:sync
   ./gradlew :app:assembleDebug
   ```

## GitHub Actions CI 集成

需要在 `.github/workflows/android-build.yml` 中添加自动应用此修复的步骤：

```yaml
- name: Fix Android asset compression for large JSON files
  run: |
    sed -i "/ignoreAssetsPattern/a\\            noCompress 'json'" android/app/build.gradle
```

## 验证

构建完成后，安装 APK 并测试：

1. 打开应用
2. 点击顶部"战利品"按钮
3. 应该看到 "牌库已准备好。选择 Boss 和等级开始，或恢复已有战斗。"
4. 可以正常选择 Boss 和等级，开始战斗

## 影响版本

- **受影响**：v1.0.5 及之前所有包含战利品功能的版本
- **已修复**：v1.0.6 及之后版本

## 参考

- [Android Asset Compression](https://developer.android.com/tools/aapt2#compression)
- [Capacitor WebView Configuration](https://capacitorjs.com/docs/config)
