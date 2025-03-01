# ASSBBS Web

ASSBBS Web 是一个基于 Bun + Hono 的轻量级论坛系统。

## 技术栈

- **运行时**: [Bun](https://bun.sh/) - 一个快速的 JavaScript 运行时和工具链
- **Web 框架**: [Hono](https://hono.dev/) - 轻量级、快速的 Web 框架
- **数据库**: SQLite (使用 Turso/LibSQL) - 分布式 SQLite 数据库
- **ORM**: Drizzle ORM - 类型安全的 ORM
- **CSS**: Tailwind CSS - 实用优先的 CSS 框架
- **其他工具**:
  - `happy-dom`: 用于服务端 DOM 操作
  - `dompurify`: HTML 内容净化
  - `xregexp`: 增强的正则表达式库

## 项目结构

```
assbbs-web/
├── app/                # 主应用代码目录
│   ├── app.ts         # 应用入口文件
│   ├── base.ts        # 基础配置和工具函数
│   ├── data.ts        # 数据库模型定义
│   ├── iAuth.ts       # 认证相关
│   ├── iConf.ts       # 配置相关
│   ├── iData.ts       # 用户数据处理
│   ├── nList.ts       # 通知列表
│   ├── pData.ts       # 帖子数据处理
│   ├── pEdit.ts       # 帖子编辑
│   ├── pList.ts       # 帖子列表
│   ├── tData.ts       # 主题数据处理
│   └── tList.ts       # 主题列表
├── bare/              # 静态资源目录
├── const/             # 常量和配置文件
└── package.json       # 项目依赖配置

## 数据库结构

系统使用 SQLite 数据库，通过 Drizzle ORM 进行管理，主要包含以下表：

- **conf**: 系统配置表
- **notice**: 通知表
- **post**: 帖子表
- **thread**: 主题表
- **user**: 用户表 (推测)

## 主要功能

- 用户认证（登录/注册）
- 主题管理
- 帖子管理
- 通知系统
- 内容过滤和安全处理

## 开发环境设置

1. 安装依赖:
```bash
bun install
```

2. 配置环境变量:
创建 .env 文件并设置以下变量:
```
TURSO_DATABASE_URL=your_turso_database_url
TURSO_AUTH_TOKEN=your_turso_auth_token
```

3. 启动开发服务器:
```bash
bun run dev
```

服务器将在 http://localhost:3000 启动。

## 部署脚本

### 装依赖：
bun install

### 杀进程：
while pgrep -f "bun"; do pkill -f "bun"; done;

### 拉代码：
cd /www/assbbs_com && git fetch && git reset --hard && git pull

### 热启动：
cd /www/assbbs_com && chmod 755 *; nohup bun dev > app.log 2>&1 &
