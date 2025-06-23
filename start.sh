#!/bin/bash

# 广州房源数据系统启动脚本
echo "🚀 启动广州房源数据系统..."

# 检查依赖
echo "📋 检查依赖..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未安装，请先安装 Python3"
    exit 1
fi

# 启动后端服务器
echo "🔧 启动后端API服务器..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "📦 安装Node.js依赖..."
    npm install
fi

# 后台启动API服务器
node server.js &
SERVER_PID=$!
cd ..

echo "✅ 后端服务器已启动 (PID: $SERVER_PID)"
echo "📡 API服务器: http://localhost:3000"

# 启动前端开发服务器
echo "🎨 启动前端开发服务器..."
cd ui/frontend
if [ ! -d "node_modules" ]; then
    echo "📦 安装前端依赖..."
    npm install
fi

# 后台启动前端开发服务器
npm run dev &
FRONTEND_PID=$!
cd ../..

echo "✅ 前端服务器已启动 (PID: $FRONTEND_PID)"
echo "🌐 前端页面: http://localhost:5173"
echo ""
echo "⚠️  按 Ctrl+C 停止所有服务"

# 等待中断信号，同时停止前后端服务器
trap "echo '🛑 正在停止服务器...'; kill $SERVER_PID $FRONTEND_PID 2>/dev/null; exit 0" INT

# 保持脚本运行
wait 