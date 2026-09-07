#!/usr/bin/env node
/**
 * 删除未使用的图片资源
 */

const fs = require('fs');
const path = require('path');

// 未使用的图片列表（来自检查结果）
const unusedImages = [
  // assets/cards/ (8 个文件)
  'assets/cards/hunt-events-1-11.jpg',
  'assets/cards/hunt-events-12-25.jpg',
  'assets/cards/hunt-events-26-38.jpg',
  'assets/cards/hunt-events-39-53.jpg',
  'assets/cards/hunt-events-54-69.jpg',
  'assets/cards/hunt-events-70-79.jpg',
  'assets/cards/hunt-events-80-94.jpg',
  'assets/cards/hunt-events-95-100.jpg',

  // assets/cards/rulebook-hd/ (8 个文件)
  'assets/cards/rulebook-hd/hunt-events-1.jpg',
  'assets/cards/rulebook-hd/hunt-events-2.jpg',
  'assets/cards/rulebook-hd/hunt-events-3.jpg',
  'assets/cards/rulebook-hd/hunt-events-4.jpg',
  'assets/cards/rulebook-hd/hunt-events-5.jpg',
  'assets/cards/rulebook-hd/hunt-events-6.jpg',
  'assets/cards/rulebook-hd/hunt-events-7.jpg',
  'assets/cards/rulebook-hd/hunt-events-8.jpg',

  // assets/loot/ (18 个文件)
  'assets/loot/0c7e6eb1ded6821155b6.jpg',
  'assets/loot/116211a717a5cd1ff4c5.png',
  'assets/loot/511dbade3a11-p12.jpg',
  'assets/loot/51359936b52d6c3ada48.jpg',
  'assets/loot/67ade038eaacdf230e3f.jpg',
  'assets/loot/697f65c306cc11553879.png',
  'assets/loot/7e697d528bbc8ce13504.jpg',
  'assets/loot/7ee8edf647b24120c9a6.png',
  'assets/loot/9f8433609341f73d345b.png',
  'assets/loot/a036cf4482e4b3d81826.png',
  'assets/loot/c78c1198aae8-p18.jpg',
  'assets/loot/c78c1198aae8-p19.jpg',
  'assets/loot/c78c1198aae8-p5.jpg',
  'assets/loot/c78c1198aae8-p6.jpg',
  'assets/loot/ceaf6b266bc9f4936bb3.png',
  'assets/loot/ec2e2ee3ff220c02ba89.png',
  'assets/loot/f1ebb548a2f3-p62.jpg',
  'assets/loot/f1ebb548a2f3-p63.jpg'
];

console.log('开始删除未使用的图片...\n');

let deletedCount = 0;
let deletedSize = 0;
let notFoundCount = 0;

unusedImages.forEach(imgPath => {
  const fullPath = path.join(__dirname, '..', imgPath);

  if (fs.existsSync(fullPath)) {
    try {
      const stats = fs.statSync(fullPath);
      fs.unlinkSync(fullPath);
      deletedCount++;
      deletedSize += stats.size;
      console.log(`✅ 已删除: ${imgPath}`);
    } catch (err) {
      console.error(`❌ 删除失败: ${imgPath} - ${err.message}`);
    }
  } else {
    notFoundCount++;
    console.log(`⚠️  文件不存在: ${imgPath}`);
  }
});

console.log(`\n删除完成！`);
console.log(`- 成功删除: ${deletedCount} 个文件`);
console.log(`- 文件不存在: ${notFoundCount} 个`);
console.log(`- 释放空间: ${(deletedSize / 1024 / 1024).toFixed(2)} MB`);

// 检查并删除空文件夹
const dirsToCheck = [
  'assets/cards/rulebook-hd'
];

dirsToCheck.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(fullPath)) {
    const files = fs.readdirSync(fullPath);
    if (files.length === 0) {
      fs.rmdirSync(fullPath);
      console.log(`\n🗑️  已删除空文件夹: ${dir}`);
    }
  }
});
