# 线性代数之美 | The Beauty of Linear Algebra

一个展示线性代数美学的交互式3D可视化宣传片。

## 本地播放

### 方式1：直接打开（最简单）
双击 `index.html` 文件，在浏览器中直接打开即可。

> ⚠️ 注意：部分浏览器（如Chrome）可能因为CORS安全策略阻止加载Three.js模块。如果遇到问题，使用方式2。

### 方式2：本地服务器（推荐）

**使用Python（通常预装）：**
```bash
# Python 3
python -m http.server 8000

# Python 2（如果你的系统还在用）
python -m SimpleHTTPServer 8000
```

然后访问 `http://localhost:8000`

**使用Node.js：**
```bash
# 全局安装http-server（只需一次）
npm install -g http-server

# 启动服务器
http-server -p 8000
```

**使用VS Code：**
安装 "Live Server" 扩展，右键 `index.html` → "Open with Live Server"

## 分享给他人

### 方式1：压缩包分享
将这两个文件打包成zip：
- `index.html`
- `main.js`

接收者解压后用上述任一方式打开即可。

### 方式2：在线托管（最方便）

#### GitHub Pages（免费）
1. 在GitHub创建仓库
2. 上传 `index.html` 和 `main.js`
3. 进入仓库 Settings → Pages
4. Source选择 `main` 分支
5. 几分钟后访问 `https://你的用户名.github.io/仓库名/`

#### Netlify Drop（免费，无需账号）
1. 访问 https://app.netlify.com/drop
2. 直接拖入包含 `index.html` 和 `main.js` 的文件夹
3. 立即获得一个分享链接

#### Vercel（免费）
```bash
# 安装vercel CLI
npm i -g vercel

# 在项目目录运行
vercel

# 按提示操作即可得到在线链接
```

## 交互控制

- **播放/暂停**：点击右上角"播放"按钮 或 按空格键
- **场景切换**：左右箭头键
- **重新开始**：点击"重新开始"按钮

## 技术栈

- Three.js 0.160.0（通过CDN加载）
- 纯原生JavaScript，无构建依赖
- WebGL渲染

## 场景列表

1. **开场**（5秒）- 从点到向量
2. **向量场**（8秒）- 流动的力量
3. **矩阵变换**（10秒）- 空间的重塑
4. **特征向量**（8秒）- 不变的灵魂
5. **现实应用**（10秒）- 3D渲染·人脸识别·神经网络·量子计算
6. **高维投影**（12秒）- 4D超立方体finale

总时长：约53秒

---

💡 建议使用现代浏览器（Chrome/Edge/Firefox/Safari）获得最佳体验。
