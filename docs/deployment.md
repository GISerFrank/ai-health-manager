# IntelliJ IDEA 项目配置指南

## 🏗️ 项目文件结构

创建以下文件夹结构：

```
ai-health-management/
├── index.html                    # 主页面（已生成）
├── package.json                  # 项目配置（已生成）
├── README.md                     # 项目说明（已生成）
├── .gitignore                    # Git忽略文件（已生成）
├── assets/
│   ├── css/
│   │   └── style.css            # 样式文件（已生成）
│   ├── js/
│   │   └── app.js              # JavaScript文件（已生成）
│   └── images/                   # 图片资源文件夹（需手动创建）
│       ├── icons/               # 图标文件
│       └── screenshots/         # 应用截图
└── docs/                        # 文档文件夹（可选）
    ├── api.md                   # API文档
    └── deployment.md            # 部署说明
```

## 🚀 在IDEA中设置项目

### 1. 创建新项目
1. 打开IntelliJ IDEA
2. File → New → Project
3. 选择 "Empty Project" 或 "Static Web"
4. 项目名称：`ai-health-management`
5. 点击 "Create"

### 2. 添加文件
按照上述结构创建文件和文件夹，然后将生成的代码复制到对应文件中。

### 3. 配置Web服务器
1. **方法一：使用内置服务器**
    - 右键点击 `index.html`
    - 选择 "Open in Browser" → "Built-in Preview"

2. **方法二：配置外部服务器**
    - File → Settings → Build, Execution, Deployment → Deployment
    - 添加本地服务器配置

### 4. 启用Live Edit（实时预览）
1. File → Settings → Build, Execution, Deployment → Debugger → Live Edit
2. 勾选 "Update application in Chrome on changes in"
3. 选择 "HTML", "CSS", "JavaScript"

## 🔧 开发环境配置

### 安装Node.js（可选）
如果要使用npm脚本：
1. 下载并安装 [Node.js](https://nodejs.org/)
2. 在IDEA终端中运行：
```bash
npm install
npm run dev
```

### 配置代码格式化
1. File → Settings → Editor → Code Style
2. HTML：设置缩进为2空格
3. CSS：设置缩进为2空格
4. JavaScript：设置缩进为2空格

### 启用代码提示
1. File → Settings → Editor → General → Code Completion
2. 启用 "Auto-completion" 和 "Smart completion"

## 🔍 调试配置

### 浏览器调试
1. 安装 "JetBrains IDE Support" 浏览器扩展
2. 在IDEA中设置断点
3. 右键 → "Debug index.html"

### 控制台调试
1. 在浏览器中按F12打开开发者工具
2. 在Console中查看应用日志
3. 使用 `console.log()` 进行调试

## 📱 移动端测试

### 在IDEA中模拟移动设备
1. 打开浏览器预览
2. 按F12打开开发者工具
3. 点击设备模拟器图标
4. 选择不同的设备进行测试

### 真机测试
1. 确保电脑和手机在同一网络
2. 运行 `npm run dev`
3. 在手机浏览器中访问显示的IP地址

## 🎨 UI开发技巧

### CSS编辑
- 使用IDEA的CSS预览功能
- 启用颜色预览（在颜色值旁显示色块）
- 使用CSS检查器查看样式层级

### JavaScript开发
- 启用ES6+语法支持
- 使用内置的JavaScript调试器
- 配置ESLint（可选）

## 📦 项目打包和部署

### 本地打包
```bash
npm run build
```

### 部署到GitHub Pages
```bash
npm run deploy
```

### 部署到服务器
1. 将所有文件上传到Web服务器
2. 确保服务器支持HTTPS（PWA要求）
3. 配置正确的MIME类型

## 🔄 版本控制

### Git集成
1. VCS → Import into Version Control → Create Git Repository
2. 添加远程仓库：VCS → Git → Remotes
3. 使用IDEA的Git工具进行版本管理

### 提交最佳实践
- 遵循约定式提交规范
- 每个功能一个提交
- 编写清晰的提交信息

## 🧪 测试配置

### 单元测试（计划中）
```bash
# 安装测试框架
npm install --save-dev jest
npm install --save-dev @testing-library/dom
```

### E2E测试（计划中）
```bash
# 安装Cypress
npm install --save-dev cypress
```

## 📊 性能优化

### 代码分析
1. 使用IDEA的代码检查功能
2. 查看Performance监控
3. 优化资源加载

### 资源优化
- 压缩CSS和JavaScript
- 优化图片大小
- 启用浏览器缓存

## 🚀 进阶配置

### TypeScript支持（可选）
如果要升级到TypeScript：
1. 安装TypeScript：`npm install -D typescript`
2. 创建 `tsconfig.json`
3. 将 `.js` 文件重命名为 `.ts`

### PWA配置
添加 `manifest.json` 和 Service Worker：
```json
{
  "name": "智医伴侣",
  "short_name": "智医伴侣",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#667eea",
  "background_color": "#ffffff"
}
```

## 📋 常见问题

### Q: 页面不能正常显示？
A: 检查文件路径是否正确，确保所有CSS和JS文件都能正确加载。

### Q: 样式不生效？
A: 清除浏览器缓存，或者使用Ctrl+F5强制刷新。

### Q: JavaScript报错？
A: 打开浏览器控制台查看具体错误信息，检查语法是否正确。

### Q: 移动端显示异常？
A: 检查viewport设置，确保CSS媒体查询正确。

## 📞 技术支持

如果遇到问题：
1. 查看浏览器控制台错误信息
2. 检查IDEA的Event Log
3. 查阅项目README.md文档
4. 提交Issue到项目仓库

---

**祝你开发顺利！** 🎉