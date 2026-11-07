#!/bin/bash
# 首次把本地博客接到 GitHub。用法：
#   bash setup.sh git@github.com:用户名/仓库名.git
# 或 HTTPS：
#   bash setup.sh https://github.com/用户名/仓库名.git

set -e
REPO="$1"

if [ -z "$REPO" ]; then
  echo "用法: bash setup.sh <仓库地址>"
  echo "例如: bash setup.sh git@github.com:zzc/blog.git"
  exit 1
fi

cd "$(dirname "$0")"

if [ ! -d .git ]; then
  git init -b main
fi

git add -A
if git diff --cached --quiet; then
  echo "没有需要提交的内容。"
else
  git commit -m "init: 博客初始化"
fi

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REPO"
else
  git remote add origin "$REPO"
fi

git push -u origin main

echo ""
echo "完成。接着去仓库 Settings → Pages → Source 选 GitHub Actions，等一分钟就有网址了。"
