#!/usr/bin/env node
// 一键发布：把改动 commit 并 push 到 GitHub，剩下的交给 Actions 自动部署
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

// 系统代理会让 git 推送超时，这里剔除掉再执行
const env = { ...process.env };
for (const key of [
  'HTTP_PROXY',
  'HTTPS_PROXY',
  'http_proxy',
  'https_proxy',
  'ALL_PROXY',
  'all_proxy',
  'NPM_CONFIG_PROXY',
  'npm_config_proxy',
]) {
  delete env[key];
}

function git(args, opts = {}) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', env, ...opts });
}

function run(args) {
  execFileSync('git', args, { cwd: root, stdio: 'inherit', env });
}

try {
  git(['rev-parse', '--is-inside-work-tree']);
} catch {
  console.error('这个目录还不是 git 仓库，先执行: git init && git remote add origin <你的仓库地址>');
  process.exit(1);
}

function push() {
  let hasUpstream = true;
  try {
    git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
  } catch {
    hasUpstream = false;
  }

  if (hasUpstream) {
    run(['push']);
  } else {
    run(['push', '-u', 'origin', 'HEAD']);
  }
}

function unpushedCount() {
  try {
    return Number(git(['rev-list', '--count', '@{u}..HEAD']).trim()) || 0;
  } catch {
    return 0;
  }
}

run(['add', '-A']);

const staged = git(['diff', '--cached', '--name-only']).trim();

if (!staged) {
  const ahead = unpushedCount();
  if (ahead > 0) {
    console.log(`没有新的改动，但有 ${ahead} 个提交还没推送，正在补推...`);
    try {
      push();
      console.log('已推送。');
    } catch {
      console.error('推送失败，检查网络后再执行一次 npm run pub。');
      process.exit(1);
    }
    process.exit(0);
  }
  console.log('没有新的改动，不用发布。');
  process.exit(0);
}

const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

const message = process.argv.slice(2).join(' ').trim() || `post: ${stamp}`;
const files = staged.split('\n');

console.log(`\n本次改动 ${files.length} 个文件：`);
console.log(files.map((f) => `  ${f}`).join('\n'));
console.log('');

run(['commit', '-m', message]);

try {
  push();
} catch {
  console.error('\n提交已经生成了，但推送失败。网络恢复后再执行一次 npm run pub 会自动补推，不会重复提交。');
  process.exit(1);
}

console.log('\n已推送。GitHub Actions 大约 1 分钟后完成部署。');
