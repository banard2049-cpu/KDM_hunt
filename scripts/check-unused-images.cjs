#!/usr/bin/env node
/**
 * 检查未使用的图片资源
 */

const fs = require('fs');
const path = require('path');

// 读取所有需要检查的文件
const filesToCheck = [
  'data/loot.json',
  'data/huntdecks.json',
  'data/monsters.json',
  'index.html',
  'test-loot-images.html',
  'debug-loot.html'
];

// 收集所有引用的图片路径
const referencedImages = new Set();

console.log('正在检查文件中的图片引用...\n');

filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  文件不存在: ${file}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  // 匹配 assets/xxx 路径
  const matches = content.matchAll(/assets\/(cards|hunt-backs|hunt-sheets|loot|board)\/[^"'\s)]+/g);

  for (const match of matches) {
    referencedImages.add(match[0]);
  }
});

console.log(`找到 ${referencedImages.size} 个被引用的图片\n`);

// 获取所有实际存在的图片文件
const imageExtensions = ['.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp'];

function getAllImages(dir, baseDir = dir) {
  const images = [];

  if (!fs.existsSync(dir)) {
    return images;
  }

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      images.push(...getAllImages(fullPath, baseDir));
    } else if (imageExtensions.includes(path.extname(item).toLowerCase())) {
      // 转换为相对路径
      const relativePath = path.relative(path.join(__dirname, '..'), fullPath).replace(/\\/g, '/');
      images.push(relativePath);
    }
  }

  return images;
}

const assetsDirs = [
  'assets/cards',
  'assets/hunt-backs',
  'assets/hunt-sheets',
  'assets/loot',
  'assets/board'
];

const allImages = [];
assetsDirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  allImages.push(...getAllImages(fullPath));
});

console.log(`磁盘上共有 ${allImages.length} 个图片文件\n`);

// 找出未使用的图片
const unusedImages = allImages.filter(img => !referencedImages.has(img));

if (unusedImages.length === 0) {
  console.log('✅ 所有图片都在使用中！');
} else {
  console.log(`❌ 找到 ${unusedImages.length} 个未使用的图片:\n`);

  // 按目录分组
  const byDir = {};
  unusedImages.forEach(img => {
    const dir = path.dirname(img);
    if (!byDir[dir]) {
      byDir[dir] = [];
    }
    byDir[dir].push(path.basename(img));
  });

  // 输出
  Object.keys(byDir).sort().forEach(dir => {
    console.log(`\n${dir}/ (${byDir[dir].length} 个文件):`);
    byDir[dir].sort().forEach(file => {
      console.log(`  - ${file}`);
    });
  });

  // 统计大小
  let totalSize = 0;
  unusedImages.forEach(img => {
    const fullPath = path.join(__dirname, '..', img);
    if (fs.existsSync(fullPath)) {
      totalSize += fs.statSync(fullPath).size;
    }
  });

  console.log(`\n总计未使用空间: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
}
