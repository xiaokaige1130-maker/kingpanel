# KingPanel

KingPanel 是一个自用导航面板，后端使用 FastAPI + SQLite，前端使用 React + Vite，构建结果输出到 `site/` 后由同一个 FastAPI 服务托管。

## 功能

- 分类和站点增删改
- 常用站点按访问次数排序
- 背景、Logo、主题设置
- JSON 导入/导出
- 本机和 SSH 主机运维遥测
- 简单密码登录

## 登录

启动服务前必须通过环境变量设置访问密码：

```bash
export KINGPANEL_PASSWORD='your-password'
```

如果服务跑在 HTTPS 后面，可以开启 Secure Cookie：

```bash
export KINGPANEL_COOKIE_SECURE=1
```

登录状态保存在 HttpOnly Cookie 中。所有 `/api/*` 接口除 `/api/auth/login`、`/api/auth/logout`、`/api/auth/status` 外都会校验登录状态。
同一 IP 连续输错 5 次会冷却 60 秒。

## 本地运行

安装 Python 依赖：

```bash
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
```

安装前端依赖并构建：

```bash
cd frontend
npm install
npm run build
```

启动服务：

```bash
. .venv/bin/activate
python main.py
```

访问：

```text
http://localhost:5180
```

## 开发

前端开发服务：

```bash
cd frontend
npm run dev
```

Vite 会把 `/api` 和 `/uploads` 代理到 `http://localhost:5180`。

检查前端：

```bash
cd frontend
npm run lint
npm run build
```

检查 Python 语法：

```bash
python3 -m py_compile main.py db.py models.py routers/*.py
```

## 构建产物

前端构建输出为稳定文件名：

```text
site/assets/index.js
site/assets/index.css
```

这样每次构建不会生成一堆带 hash 的历史文件。`site/index.html` 会固定引用这两个文件。

## 运维遥测

本机状态默认展示。远程主机配置放在本地文件：

```text
ops_hosts.local.json
```

该文件已加入 `.gitignore`，不要提交。建议只使用密钥登录，不在配置里保存有效密码。

## 数据文件

- SQLite 数据库：`nav.db`，已忽略
- 上传文件目录：`site/uploads/`
- 备份文件：`nav.db.bak*`，已忽略

上传图片限制为 5MB，支持 `.png`、`.jpg`、`.jpeg`、`.gif`、`.webp`、`.ico`。导入 JSON 会先自动备份当前数据库，再覆盖数据。

## PM2

仓库包含 `ecosystem.config.js`，可用 PM2 启动：

```bash
pm2 start ecosystem.config.js
pm2 logs kingpanel
```
