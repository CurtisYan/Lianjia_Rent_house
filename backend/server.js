const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const path = require('path');
const process = require('process');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 提供静态文件服务 - data目录下的CSV文件
app.use('/data', express.static(path.join(__dirname, '../data')));

// 地区映射
const AREA_MAP = {
  '': '不限',
  '天河区': '天河',
  '越秀区': '越秀',
  '海珠区': '海珠',
  '荔湾区': '荔湾',
  '白云区': '白云',
  '黄埔区': '黄埔',
  '番禺区': '番禺',
  '花都区': '花都',
  '南沙区': '南沙',
  '从化区': '从化',
  '增城区': '增城'
};

app.post('/api/update-data', (req, res) => {
  const { city, area } = req.body;
  
  if (city !== 'guangzhou') {
    return res.status(400).json({ error: '目前只支持广州地区数据更新' });
  }
  
  const areaName = AREA_MAP[area] || '不限';
  console.log(`开始更新数据: ${city} - ${areaName}`);
  
  // 设置响应头以支持流式传输
  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Transfer-Encoding': 'chunked',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  
  // 执行数据更新的函数
  const executeDataUpdate = () => {
    res.write(`开始爬取 ${areaName} 地区数据...\n`);
    
    // 跨平台Python命令检测
    const pythonCmd = process.platform === 'win32' ? 'py' : 'python3';
    
    // 第一步：启动爬虫脚本
    const crawlerProcess = spawn(pythonCmd, ['../scripts/guangzhou_main.py', areaName], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true
    });
    
    // 处理爬虫输出
    crawlerProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output);
      res.write(output);
    });
    
    crawlerProcess.stderr.on('data', (data) => {
      const output = data.toString();
      console.error(output);
      res.write(`Error: ${output}`);
    });
    
    // 爬虫完成后执行预处理
    crawlerProcess.on('close', (code) => {
      if (code === 0) {
        res.write(`\n爬虫完成，退出码: ${code}\n`);
        res.write(`\n========================================\n`);
        res.write(`开始数据预处理...\n`);
        
        // 第二步：启动预处理脚本
        const preprocessProcess = spawn(pythonCmd, ['../scripts/preprocess_data.py'], {
          cwd: __dirname,
          stdio: ['pipe', 'pipe', 'pipe'],
          shell: true
        });
        
        // 处理预处理输出
        preprocessProcess.stdout.on('data', (data) => {
          const output = data.toString();
          console.log(output);
          res.write(output);
        });
        
        preprocessProcess.stderr.on('data', (data) => {
          const output = data.toString();
          console.error(output);
          res.write(`预处理错误: ${output}`);
        });
        
        // 预处理完成
        preprocessProcess.on('close', (preprocessCode) => {
          const message = `\n预处理完成，退出码: ${preprocessCode}\n`;
          console.log(message);
          res.write(message);
          
          if (preprocessCode === 0) {
            res.write(`\n🎉 数据更新和预处理全部完成！\n`);
            res.write(`数据已同步到前端，可以刷新页面查看最新数据。\n`);
          } else {
            res.write(`\n❌ 预处理失败，请检查错误信息。\n`);
          }
          
          res.end();
        });
        
        // 预处理脚本错误处理
        preprocessProcess.on('error', (error) => {
          const message = `\n预处理脚本启动失败: ${error.message}\n`;
          console.error(message);
          res.write(message);
          res.end();
        });
        
      } else {
        const message = `\n爬虫失败，退出码: ${code}，跳过预处理步骤\n`;
        console.log(message);
        res.write(message);
        res.end();
      }
    });
    
    // 爬虫脚本错误处理
    crawlerProcess.on('error', (error) => {
      const message = `\n爬虫脚本启动失败: ${error.message}\n`;
      console.error(message);
      res.write(message);
      res.end();
    });
  };
  
  // 开始执行
  executeDataUpdate();
});

app.listen(PORT, () => {
  console.log(`API服务器运行在 http://localhost:${PORT}`);
}); 