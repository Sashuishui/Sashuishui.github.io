import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 部署后把 site 改成你的真实地址，RSS 和 sitemap 都用它生成绝对链接
// 仓库名为 <用户名>.github.io 时：https://<用户名>.github.io
// 其他仓库名时：https://<用户名>.github.io/<仓库名>
export default defineConfig({
  site: 'https://sashuishui.github.io',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'github-light',
      wrap: true,
    },
  },
});
