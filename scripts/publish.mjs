#!/usr/bin/env node
// 一键发布：把改动 commit 并 push 到 GitHub，剩下的交给 Actions 自动部署
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

function git(args, opts = {}) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', ...opts });
}

function run(args) {
  execFileSync('git', args, { cwd: root, stdio: 'inherit' });
}

try {
  git(['rev-parse', '--is-inside-work-tree']);
} catch {
  console.error('这个目录还不是 git 仓库，先执行: git init && git remote add origin <你的仓库地址>');
  process.exit(1);
}

run(['add', '-A']);

let staged = '';
try {
  staged = git(['diff', '--cached', '--name-only']).trim();
} catch {
  staged = '';
}

if (!staged) {
  console.log('没有新的改动，不用发布。');
  process.exit(0);
}

const now = new Date();
const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

const message = process.argv.slice(2).join(' ').trim() || `post: ${stamp}`;

console.log(`\n本次改动 ${staged.split('\n').length} 个文件：`);
console.log(staged.split('\n').map((f) => `  ${f}`).join('\n'));
console.log('');

run(['commit', '-m', message]);

let hasUpstream = true;
try {
  git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
} catch {
  hasUpstream = false;
}

try {
  if (hasUpstream) {
    run(['push']);
  } else {
    run(['push', '-u', 'origin', 'HEAD']);
  }
  console.log('\n已推送。GitHub Actions 大约 1 分钟后完成部署。');
} catch {
  console.error('\n提交成功，但推送失败。检查网络或仓库地址后再执行一次 npm run pub。');
  process.exit(1);
}
