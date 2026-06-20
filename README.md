# Zezhong Wang Personal Website

一个无需构建工具、可直接发布到 GitHub Pages 的中英双语个人网站。

## 已包含

- 响应式单页设计，支持手机、平板和桌面
- 中文 / English 切换
- 深色 / 浅色主题
- 自动读取 `meiqingg` 的 GitHub 公开仓库和统计数据
- About、Focus、Projects、Updates、Contact 区域
- 自定义 404 页面、favicon 和社交分享图
- 无第三方统计、无 Cookie、无外部字体依赖

## 上线方法（网页操作）

1. 登录 GitHub，新建公开仓库：`meiqingg.github.io`
2. 将本项目所有文件上传到仓库根目录并提交
3. 打开仓库的 **Settings → Pages**
4. 在 **Build and deployment** 中选择：
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
5. 保存后访问：`https://meiqingg.github.io`

## 上线方法（Git 命令）

```bash
git init
git add .
git commit -m "Launch personal website"
git branch -M main
git remote add origin https://github.com/meiqingg/meiqingg.github.io.git
git push -u origin main
```

然后在仓库 **Settings → Pages** 中选择从 `main` 分支根目录发布。

## 修改内容

- 网站主要文字：`assets/js/content.js`
- 页面结构和邮箱：`index.html`
- 配色和样式：`assets/css/style.css`
- 头像：替换 `assets/img/avatar.png`
- GitHub 用户名：修改 `assets/js/main.js` 顶部的 `GITHUB_USERNAME`

## 自定义域名

在仓库 **Settings → Pages → Custom domain** 中填写域名，并按 GitHub 提示配置 DNS。启用域名后建议同时开启 HTTPS。

## License

MIT
