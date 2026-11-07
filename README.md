# Blog

一个用 Astro 写的极简个人博客。零客户端 JS（除了深浅色切换那十几行），构建产物 50KB 左右。

## 日常三步

```bash
npm run new "今天的标题" --tags 随笔,读书   # 1. 新建文章
# 写内容，图片丢进提示的目录里
npm run pub                                  # 2. 发布（commit + push，GitHub 自动部署）
```

想边写边看效果：

```bash
npm run dev     # http://localhost:4321
```

## 文章怎么写

文章都在 `src/content/posts/`，一个 `.md` 一个文件，开头是 frontmatter：

```markdown
---
title: 今天的标题
date: 2026-11-07
tags: [随笔, 读书]
summary: 一句话摘要，会显示在列表页，也可以留空
draft: false
---

正文从这里开始。
```

- `tags` 里写什么，站点就会自动生成对应的标签页，不用另外登记。
- `draft: true` 的文章只在 `npm run dev` 时能看到，不会被发布。
- `summary` 留空就不显示摘要。

## 图片

```markdown
![图注](/images/2026-11-07/1.png)
```

图片放在 `public/images/` 下，`npm run new` 会顺手建好当天的文件夹。直接引用路径，不走图片压缩流程——这也是这个站这么轻的原因之一。

## 目录结构

```
src/
  config.ts            站点标题、简介、导航（想改名字改这里）
  content/posts/       所有文章
  pages/
    index.astro        首页列表
    posts/[...slug]    文章页
    tags/              标签总览 + 每个标签的页
    about.astro        关于页
    rss.xml.ts         RSS
  styles/global.css    全部样式，约 500 行，改配色看最上面的变量
public/images/         图片
scripts/new.mjs        新建文章
scripts/publish.mjs    一键发布
```

## 部署

推到 `main` 分支后，`.github/workflows/deploy.yml` 会自动构建并发布到 GitHub Pages。

第一次需要在仓库的 **Settings → Pages → Build and deployment → Source** 里选 **GitHub Actions**。

## 配置站点地址

编辑 `astro.config.mjs` 里的 `site`，RSS 和 sitemap 用它生成绝对链接：

- 仓库叫 `<用户名>.github.io`：`https://<用户名>.github.io`
- 仓库叫 `blog`：`https://<用户名>.github.io/blog`（这时还要加 `base: '/blog'`）

## 关于体积

`node_modules` 约 130MB，构建产物约 50KB。真要再省，删掉 `node_modules` 后随时 `npm install` 能重建，源码本身不到 100KB。
