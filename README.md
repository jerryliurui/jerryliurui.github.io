# JerryLiu Blog

这是我的个人博客仓库，当前运行在 `AstroPage` 分支上，基于 `Astro` 构建，并参考了 `Mizuki` 主题做了定制化修改。

## 当前状态

- 博客地址：`https://jerryliu.org`
- 技术栈：`Astro + TypeScript + Tailwind CSS + Svelte`
- 主题基础：`Mizuki`
- 评论系统：默认 `Twikoo`，已预留 `Giscus` 切换能力
- 已接入功能：
  - 页面顶部进度条
  - 相关文章推荐
  - 随机文章推荐
  - RSS
  - 站内搜索（Pagefind）
  - 文章加密

## 目录说明

- `src/content/posts/`
  博客正文，新增文章主要放这里
- `src/content/spec/about.md`
  About 页面内容
- `src/content/spec/friends.md`
  友链页面内容
- `src/config.ts`
  站点标题、导航、头像、侧边栏、评论、推荐模块等核心配置
- `src/pages/`
  页面路由
- `src/components/`
  页面组件
- `scripts/new-post.js`
  新建文章脚本

## 常用命令

```bash
pnpm install
pnpm dev
pnpm check
pnpm build
pnpm new-post -- <filename>
```

示例：

```bash
pnpm new-post -- iOS/my-new-post
```

这会在 `src/content/posts/` 下生成新的 markdown 文章文件。

## 写博客时最常改的地方

1. 新文章：`src/content/posts/`
2. 站点配置：`src/config.ts`
3. 关于页：`src/content/spec/about.md`
4. 技能 / 时间线数据：`src/data/skills.ts`、`src/data/timeline.ts`

## 关于主题升级

当前仓库不是直接跟随官方模板自动同步的 fork 维护方式，而是基于 `Mizuki` 做了本地修改。

如果后续要升级主题，建议：

1. 不要直接覆盖当前仓库
2. 先把官方新版单独 clone 到旁边目录做对比
3. 优先迁移低风险增量功能
4. 布局系统这类大改单独做一轮迁移

当前用于对照官方主题的参考目录：

```bash
/Users/jerryliu/Documents/RuiBlog-upstream
```

## 备注

仓库里较早期的 README/Jekyll 描述已经不再代表当前实现，当前博客主线以 `Astro + Mizuki` 为准。
