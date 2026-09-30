# NGA-BBS-Script-Plugins

[NGA优化摸鱼体验](https://github.com/kisshang1993/NGA-BBS-Script) 的插件合集

## ⚠插件需配合[NGA优化摸鱼体验](https://greasyfork.org/zh-CN/scripts/393991-nga%E4%BC%98%E5%8C%96%E6%91%B8%E9%B1%BC%E4%BD%93%E9%AA%8C)使用，请先安装👉[本体](https://greasyfork.org/zh-CN/scripts/393991-nga%E4%BC%98%E5%8C%96%E6%91%B8%E9%B1%BC%E4%BD%93%E9%AA%8C)👈

## 插件列表

| 插件 | 说明 | 安装 |
| ---- | ---- | ---- |
| [隐形广告屏蔽](StealthAdBlock) | 用占位卡片在视觉上遮盖广告，广告元素、广告请求与曝光统计保持原样，不易被网站察觉 | [GreasyFork](https://greasyfork.org/zh-CN/scripts/598029) / [GitHub](https://raw.githubusercontent.com/shizzhang0/NGA-BBS-Script-Plugins/main/StealthAdBlock/StealthAdBlock.user.js) |
| [Excel模式显示版头](ExcelShowForumHeader) | Excel模式下显示版头与子版面，并伪装为表格单元格，跟随本体的隐藏版头/版规/子版入口设置 | [GreasyFork](https://greasyfork.org/zh-CN/scripts/598042) / [GitHub](https://raw.githubusercontent.com/shizzhang0/NGA-BBS-Script-Plugins/main/ExcelShowForumHeader/ExcelShowForumHeader.user.js) |

## 安装

1. 安装脚本管理器 [Tampermonkey](https://www.tampermonkey.net/) 或 [Violentmonkey](https://violentmonkey.github.io/)
2. 安装本体 [NGA优化摸鱼体验](https://greasyfork.org/zh-CN/scripts/393991-nga%E4%BC%98%E5%8C%96%E6%91%B8%E9%B1%BC%E4%BD%93%E9%AA%8C)
3. 点击插件列表中的 **GreasyFork** 链接，在脚本页面点击**安装此脚本**

无法访问 GreasyFork 时，可以点击 **GitHub** 链接安装，或打开插件目录下的 `.user.js` 文件，复制全部内容，在脚本管理器中新建脚本并粘贴保存

也可以在 GreasyFork 上搜索👉[NGA优化摸鱼体验插件](https://greasyfork.org/zh-CN/scripts?q=NGA%E4%BC%98%E5%8C%96%E6%91%B8%E9%B1%BC%E4%BD%93%E9%AA%8C%E6%8F%92%E4%BB%B6)获取更多插件

安装后可在[NGA优化摸鱼体验]**设置面板** -> **插件管理** 中查看和配置插件

## 开发

插件基于本体的插件机制开发，参考 [插件开发文档](https://github.com/kisshang1993/NGA-BBS-Script/blob/master/plugins/Documentation.md)

每个插件单独一个目录，目录名与插件的 `name` 保持一致：

```
<PluginName>/
├── <PluginName>.user.js   # 插件脚本
└── README.md              # 插件说明
```

## 反馈问题

https://github.com/shizzhang0/NGA-BBS-Script-Plugins/issues

## License

[MIT](LICENSE)
