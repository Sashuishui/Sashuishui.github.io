#!/usr/bin/env node
// 新建一篇文章：
//   npm run new "今天的标题"
//   npm run new "今天的标题" 随笔,读书
//
// 说明：npm 会截走 --tags 这类参数，所以标签直接跟在后边，不加 flag。
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2).filter((a) => a !== '--');

const title = (args[0] ?? '').trim();
const tags = args
  .slice(1)
  .join(',')
  .split(/[,，]/)
  .map((t) => t.trim())
  .filter(Boolean);

if (!title) {
  console.log('用法: npm run new "文章标题" [标签1,标签2]');
  process.exit(1);
}

const now = new Date();
const ymd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

// 文件名用日期，干净且 URL 友好；同一天多篇自动加序号
let slug = ymd;
let n = 2;
while (existsSync(join(root, 'src/content/posts', `${slug}.md`))) {
  slug = `${ymd}-${n}`;
  n += 1;
}

const postPath = join(root, 'src/content/posts', `${slug}.md`);
const imageDir = join(root, 'public/images', slug);
mkdirSync(imageDir, { recursive: true });

const frontmatter = `---
title: ${title}
date: ${ymd}
tags: [${tags.join(', ')}]
summary:
draft: false
---

`;

writeFileSync(postPath, frontmatter, 'utf8');

console.log(`
  已创建  src/content/posts/${slug}.md
  图片放  public/images/${slug}/
         正文里这样引用: ![说明](/images/${slug}/1.png)

  本地预览: npm run dev
  写完发布: npm run pub
`);
