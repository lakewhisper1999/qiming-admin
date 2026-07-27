# 启明管理后台（qiming-admin）

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

启明艺术空间的**后台管理系统**，用于管理作品、提问、图文笔记、分类、用户、日志与站点设置（含「关于我」）。基于 **Vue 3 + Vite + Element Plus + axios + Vue Router（hash 模式）** 构建。

> 本后台只是「管理端」，真正的数据与接口来自后端 [qiming-server](https://github.com/lakewhisper1999/qiming-server)。
> 使用前请先启动后端（默认 `http://localhost:8088`）。

---

## ✨ 功能特性

- 仪表盘概览、作品 / 图文笔记 / 分类的 CRUD 与媒体上传
- 用户提问审核与回复、用户管理
- 访客日志、操作日志审计
- 站点设置：编辑「关于我」（`about_subtitle` / `about_content`）等站点配置
- 基于 JWT 的路由守卫与请求拦截器

## 🧱 技术栈

| 分类 | 技术 | 说明 |
|------|------|------|
| 框架 | Vue 3 | Composition API + `<script setup>` |
| 构建 | Vite 5 | 开发服务器、打包 |
| UI | Element Plus 2.7 | 组件库 |
| 图标 | @element-plus/icons-vue | Element Plus 配套图标 |
| 路由 | Vue Router 4 | hash 模式（`createWebHashHistory`） |
| 请求 | axios 1.7 | 封装于 `src/utils/request.js` |

## 📋 环境要求

- Node.js **18+**（推荐 20 LTS）
- npm（随 Node 自带）
- 后端 [qiming-server](https://github.com/lakewhisper1999/qiming-server) 已启动并监听 `8088`

## 🚀 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器（默认端口 5174）
npm run dev

# 3. 浏览器打开
#    http://localhost:5174
```

构建生产包：

```bash
npm run build      # 产物输出到 dist/
npm run preview    # 本地预览构建产物
```

## 👤 默认管理员账号

| 账号 | 密码 | 权限 |
|------|------|------|
| `admin` | `admin123` | 管理员（可访问全部后台功能） |

> 该账号由后端 `qiming-server` 在**首次启动**时由 `DataInitializer` 自动创建。
> 若后端尚未初始化，请先按后端 README 建库跑 `init.sql` 并启动后端。

## 🔗 与后端联调

开发模式下，Vite 已配置代理，无需手动处理跨域：

```js
// vite.config.js
server: {
  port: 5174,
  proxy: {
    '/api':     { target: 'http://localhost:8088', changeOrigin: true },
    '/uploads': { target: 'http://localhost:8088', changeOrigin: true }
  }
}
```

- 所有请求通过 `src/utils/request.js` 发出，`baseURL` 留空；
- **请求拦截器**自动为 URL 补 `/api` 前缀，并从 `localStorage.admin_token` 读取 JWT 附加 `Authorization: Bearer <token>`；
- **响应拦截器**统一处理错误：`401` 自动清除 token 并跳登录页，`403` 提示无权限；
- **路由守卫**（`src/router/index.js`）在每次跳转前检查 `admin_token`，未登录强制跳 `/login`。

## 🗺️ 功能模块

| 路由 | 页面 | 说明 |
|------|------|------|
| `/login` | 登录 | JWT 登录入口 |
| `/dashboard` | 仪表盘 | 概览数据 |
| `/artwork` | 作品管理 | 作品 CRUD、封面/媒体上传 |
| `/comment` | 提问管理 | 用户提问审核与回复 |
| `/article` | 图文笔记 | 图文内容管理 |
| `/category` | 分类管理 | 作品/笔记分类维护 |
| `/user` | 用户管理 | 用户列表、编辑、禁用 |
| `/profile` | 个人中心 | 管理员信息修改、**关于我编辑** |
| `/log/visit` | 访客日志 | 站点访问记录 |
| `/log/operation` | 操作日志 | 后台操作审计 |
| `/settings` | 站点设置 | 站点名称/描述/Logo 等 |

## 📁 目录结构

```
qiming-admin/
├── index.html
├── vite.config.js          # 端口 5174 + 后端代理
├── package.json
└── src/
    ├── main.js
    ├── App.vue
    ├── router/index.js      # 路由 + 登录守卫
    ├── utils/request.js     # axios 封装（Token / 前缀 / 错误处理）
    ├── styles/              # 全局样式
    ├── components/          # 公共组件
    └── views/               # 页面（按模块分目录）
        ├── Login.vue
        ├── Dashboard.vue
        ├── layout/AdminLayout.vue
        └── artwork / comment / article / category / user / log / settings
```

## 🚢 部署说明

后台为纯前端 SPA，可部署到任意静态托管（Cloudflare Pages / Vercel / Nginx 等）。

要点：
1. `npm run build` 生成 `dist/`；
2. 托管平台**根目录填 `dist`**；
3. 因使用 hash 路由，**无需**服务端 fallback 配置（子路由刷新不会 404）；
4. 生产环境需把后端地址改为真实域名：在 `vite.config.js` 的 proxy 改为目标服务器，或在前端通过环境变量统一注入接口前缀（建议）。

## 🤝 参与贡献

欢迎提 Issue 与 PR。提交前请确保 `node_modules/`、`dist/`、`.idea/`、`.vscode/` 已被 `.gitignore` 忽略。

## 📄 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。© 2026 lakewhisper1999。

## 🔗 相关仓库

- 前端艺术空间（已部署）：<https://github.com/lakewhisper1999/qiming-artspace>
- 后端服务（接口/数据）：<https://github.com/lakewhisper1999/qiming-server>
