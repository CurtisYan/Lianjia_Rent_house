# 广州房源数据更新系统

## 📊 项目简介

本系统是一个基于Vue 3和Node.js的房源数据爬取、处理和可视化平台，主要针对广州地区的链家租房数据。支持实时数据更新、多维度数据分析和可视化展示。

## ✨ 主要功能

- 🕷️ **智能数据爬取**: 支持广州各区域的房源数据爬取
- 🔄 **实时数据更新**: 通过Web界面一键更新房源数据
- 📊 **数据可视化**: 多种图表展示房源数据分析结果
- 🎯 **智能筛选**: 支持按区域、价格、面积等条件筛选
- 📱 **响应式界面**: 现代化UI设计，支持多设备访问
- 🔧 **数据质量监控**: 实时评估数据完整性、准确性和新鲜度

## 🛠️ 技术栈

### 后端
- **Node.js** - 服务器运行环境
- **Express** - Web应用框架
- **Python 3** - 数据爬取和处理

### 前端
- **Vue 3** - 前端框架
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **ECharts** - 数据可视化
- **Axios** - HTTP客户端

### 数据处理
- **Python requests** - HTTP请求库
- **parsel** - HTML解析库
- **pandas/csv** - 数据处理

## 🚀 快速开始

### 环境要求

- **Node.js** >= 16.0.0
- **Python** >= 3.7
- **npm** 或 **yarn** 包管理器
- **Git** (用于克隆项目)

### 安装步骤

#### 方法1: 自动化安装 (推荐)

```bash
# 1. 克隆项目
git clone <项目地址>
cd <项目目录>

# 2. 运行自动配置脚本
chmod +x setup.sh
./setup.sh
```

自动配置脚本会：
- 检查Node.js和Python环境
- 自动安装所有Node.js和Python依赖
- 创建必要的目录结构
- 显示详细的安装状态

#### 方法2: 手动安装

#### 1. 克隆项目
```bash
git clone <项目地址>
cd <项目目录>
```

#### 2. 安装Node.js依赖

**安装后端依赖:**
```bash
npm install
```

**安装前端依赖:**
```bash
cd ui/frontend
npm install
cd ../..
```

#### 3. 安装Python依赖

**直接安装 (推荐):**
```bash
# 使用requirements.txt文件
pip install -r requirements.txt

# 或手动安装
pip install requests parsel
```

**使用虚拟环境 (可选):**
```bash
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
```

> 💡 **说明**: 由于本项目Python依赖很简单(只有2个常用包)，一般直接安装即可。如果你有多个Python项目或担心包冲突，再考虑使用虚拟环境。

#### 4. 创建必要目录
```bash
mkdir -p data
mkdir -p ui/frontend/public/data
```

## 🎯 运行项目

### 方式1: 一键启动 (推荐)
```bash
chmod +x start.sh
./start.sh
```

### 方式2: 分别启动

**终端1 - 启动API服务器:**
```bash
node server.js
```

**终端2 - 启动前端开发服务器:**
```bash
cd ui/frontend
npm run dev
```

## 📝 使用说明

### 访问地址
- **前端界面**: http://localhost:5176
- **API服务器**: http://localhost:3001

### 基本操作流程

1. **选择区域**: 在下拉菜单中选择要查看的广州地区
2. **更新数据**: 点击"更新数据"按钮爬取最新房源信息
3. **查看进度**: 在弹出窗口中实时查看爬取进度
4. **数据分析**: 爬取完成后查看各种数据分析图表
5. **筛选数据**: 使用价格、面积等筛选条件查看特定数据

### 支持的地区
- 不限 (全广州)
- 天河区
- 越秀区
- 荔湾区
- 海珠区
- 番禺区
- 白云区
- 黄埔区
- 从化区
- 增城区
- 花都区
- 南沙区

## 🔧 高级功能

### 手动数据处理
```bash
# 处理原始数据并同步到前端
python preprocess_data.py
```

### 单独运行爬虫
```bash
# 爬取特定地区数据
python guangzhou_main.py 天河
```

### 数据文件位置
- **原始数据**: `./data/houses_*.csv`
- **处理后数据**: `./ui/frontend/public/data/houses_*.csv`

## 📊 数据质量标准

### 有效数据筛选标准
- ✅ 价格范围: 500-50,000元/月
- ✅ 面积范围: 10-500㎡
- ✅ 标题完整且不含异常关键词
- ✅ 区域信息准确
- ✅ 户型信息标准化

### 数据质量评分
- **新鲜度**: 基于房源维护时间计算 (0-100分)
- **准确性**: 多维度数据合理性检查 (0-100分)
- **完整性**: 必填和可选字段完整程度 (0-100分)

## 🐛 常见问题

### Q: 爬取数据时出现网络错误
**A**: 检查网络连接，或等待片刻后重试。系统内置重试机制。

### Q: 前端页面无法加载数据
**A**: 确保API服务器(端口3001)正常运行，检查控制台是否有错误信息。

### Q: Python模块导入错误
**A**: 确保已安装所需Python包:
```bash
pip install requests parsel
```

### Q: 端口冲突
**A**: 修改以下文件中的端口配置:
- `server.js`: 修改API服务器端口 (默认3001)
- `ui/frontend/vite.config.js`: 修改前端端口 (默认5176)

### Q: Mac/Linux权限问题
**A**: 给启动脚本执行权限:
```bash
chmod +x start.sh
```

## 📁 项目结构

```
广州房源数据更新系统/
├── backend/                 # 后端服务
│   ├── server.js           # Express API服务器
│   ├── package.json        # Node.js依赖配置
│   ├── package-lock.json   # 依赖锁定文件
│   └── node_modules/       # Node.js模块
├── scripts/                # 数据处理脚本
│   ├── guangzhou_main.py   # 链家数据爬虫
│   ├── preprocess_data.py  # 数据预处理脚本
│   └── requirements.txt    # Python依赖
├── ui/                     # 前端页面
│   ├── index.html         # 主页面
│   ├── css/               # 样式文件
│   ├── js/                # JavaScript文件
│   └── data/              # 前端数据文件
├── data/                   # 原始数据存储
│   └── houses_*.csv       # 爬取的原始数据
├── setup.sh               # 环境配置脚本
├── start.sh               # 启动脚本
├── .gitignore            # Git忽略文件
└── README.md             # 项目说明
```

## 🔄 开发模式

### 热重载
项目支持热重载，修改代码后无需重启服务器:
- **前端**: Vite自动热重载
- **后端**: 如需要可安装nodemon实现热重载

### 添加新功能
1. **新增爬虫地区**: 修改`guangzhou_main.py`中的`AREA_MAP`
2. **自定义数据处理**: 修改`preprocess_data.py`
3. **新增前端组件**: 在`ui/frontend/src/components/`目录下添加

## 🤝 贡献指南

1. Fork本项目
2. 创建功能分支: `git checkout -b feature/新功能`
3. 提交更改: `git commit -m '添加新功能'`
4. 推送分支: `git push origin feature/新功能`
5. 提交Pull Request

## 📄 许可证

本项目仅供学习和研究使用，请遵守相关网站的robots.txt和使用条款。

## 📞 支持

如遇到问题，请查看:
1. 本README的常见问题部分
2. 检查控制台错误信息
3. 确认所有依赖正确安装
4. 验证网络连接正常

---

**祝你使用愉快！** 🎉 