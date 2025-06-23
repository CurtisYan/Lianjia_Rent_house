# frontend

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

# 前端项目配置说明

## 环境变量配置

本项目使用环境变量来配置后端服务器地址，避免硬编码端口号的问题。

### 配置步骤

1. 复制环境变量模板：
   ```bash
   cp .env.example .env
   ```

2. 根据你的后端服务器配置修改 `.env` 文件：
   ```env
   # 后端API基础URL
   VITE_API_BASE_URL=http://localhost:3001
   
   # 后端服务器端口
   VITE_SERVER_PORT=3001
   ```

### 常见配置示例

- **默认配置**（后端运行在 3001 端口）：
  ```env
  VITE_API_BASE_URL=http://localhost:3001
  ```

- **后端运行在 3000 端口**：
  ```env
  VITE_API_BASE_URL=http://localhost:3000
  ```

- **后端运行在其他主机**：
  ```env
  VITE_API_BASE_URL=http://192.168.1.100:3001
  ```

### 启动项目

```bash
npm install
npm run dev
```

## 图表显示优化

### 片区分布图表

- 默认情况下隐藏图表标签，减少视觉混乱
- 鼠标悬停时显示详细标签信息
- 点击"放大查看"可查看完整标签和详细分析

### 饼图优化

所有饼图（价格分布、房型分布、片区分布等）都采用了以下优化：
- 默认隐藏标签和引导线
- 鼠标悬停时显示标签
- 数据项过多时自动隐藏图例
- 详情模式下显示完整信息

这样既保持了图表的简洁美观，又能在需要时提供详细信息。
