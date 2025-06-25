#!/bin/bash

echo "🚀 房源数据系统 - 环境配置脚本"
echo "=================================="

# 检查Node.js
echo "检查Node.js环境..."
if ! command -v node &> /dev/null; then
    echo "❌ 未安装Node.js，请先安装Node.js >= 16.0.0"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2)
echo "✅ Node.js版本: $NODE_VERSION"

# 检查Python
echo "检查Python环境..."
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "❌ 未安装Python，请先安装Python >= 3.7"
    echo "下载地址: https://python.org/"
    exit 1
fi

if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
    PIP_CMD="pip3"
else
    PYTHON_CMD="python"
    PIP_CMD="pip"
fi

PYTHON_VERSION=$($PYTHON_CMD --version 2>&1 | cut -d' ' -f2)
echo "✅ Python版本: $PYTHON_VERSION"

# 创建目录
echo "创建必要目录..."
mkdir -p data
mkdir -p ui/frontend/public/data
echo "✅ 目录创建完成"

# 安装后端依赖
echo "📦 安装Node.js依赖..."
cd backend
npm install
cd ..

# 安装前端依赖
echo "安装前端依赖..."
cd ui/frontend
npm install
if [ $? -eq 0 ]; then
    echo "✅ 前端依赖安装成功"
else
    echo "❌ 前端依赖安装失败"
    exit 1
fi
cd ../..

# 安装Python依赖
echo "📦 安装Python依赖..."
pip3 install -r scripts/requirements.txt
if [ $? -eq 0 ]; then
    echo "✅ Python依赖安装成功"
else
    echo "❌ Python依赖安装失败，可能需要管理员权限"
    echo "请尝试: sudo $PIP_CMD install -r requirements.txt"
    exit 1
fi

echo ""
echo "🎉 环境配置完成！"
echo "=================================="
echo "现在可以运行以下命令启动系统:"
echo ""
echo "一键启动:"
echo "  ./start.sh"
echo ""
echo "分别启动:"
echo "  终端1: node server.js"
echo "  终端2: cd ui/frontend && npm run dev"
echo ""
echo "访问地址:"
echo "  前端: http://localhost:5176"
echo "  API:  http://localhost:3000"
echo ""
echo "💡 提示: 如果担心包冲突，也可以手动创建虚拟环境："
echo "  python -m venv venv"
echo "  source venv/bin/activate  # macOS/Linux"
echo "  pip install -r requirements.txt"
echo "" 