# 未使用的图片资源清理报告

清理日期: 2026-09-07

## 清理结果 ✅

- **成功删除**: 34 个文件
- **释放空间**: 62.41 MB
- **剩余图片**: 377 个（全部在使用中）

## 已删除的文件

### 1. assets/cards/ (8 个文件)
旧版狩猎事件卡片合集：
- hunt-events-1-11.jpg
- hunt-events-12-25.jpg
- hunt-events-26-38.jpg
- hunt-events-39-53.jpg
- hunt-events-54-69.jpg
- hunt-events-70-79.jpg
- hunt-events-80-94.jpg
- hunt-events-95-100.jpg

### 2. assets/cards/rulebook-hd/ (8 个文件)
未使用的狩猎事件高清版本：
- hunt-events-1.jpg ~ hunt-events-8.jpg

**注**: rulebook-hd 文件夹保留，因为还有其他文件在使用（darkness.jpg, herb-gathering.jpg, ore-gathering.jpg）

### 3. assets/loot/ (18 个文件)
未使用的战利品图片资源

## 验证结果

重新扫描后确认：
- ✅ 所有剩余的 377 个图片文件都有被引用
- ✅ 没有遗留未使用的图片
- ✅ 项目文件大小减少了 62.41 MB

## 使用的脚本

1. **检查脚本**: `scripts/check-unused-images.cjs`
2. **删除脚本**: `scripts/delete-unused-images.cjs`

以后需要清理时可以重复使用这些脚本。
