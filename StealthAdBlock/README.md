# NGA优化摸鱼体验插件-隐形广告屏蔽

## ⚠本脚本为[NGA优化摸鱼体验](https://greasyfork.org/zh-CN/scripts/393991-nga%E4%BC%98%E5%8C%96%E6%91%B8%E9%B1%BC%E4%BD%93%E9%AA%8C)的插件，使用需先安装👉[本体](https://greasyfork.org/zh-CN/scripts/393991-nga%E4%BC%98%E5%8C%96%E6%91%B8%E9%B1%BC%E4%BD%93%E9%AA%8C)👈

### 概述

用占位卡片在视觉上遮盖广告，而不是删除广告

广告元素、广告请求与曝光统计都保持原样，从网站的角度看与正常浏览没有区别，不易被察觉

- 遮盖版块页、帖子页的横幅广告，楼层右侧的竖条广告，以及进入帖子前的插页广告
- 占位卡片不显示任何文字，并拦截点击，避免误点广告
- 自动适配本体的显示模式

| 模式 | 占位卡片样式 |
| ---- | ------------ |
| 默认 | NGA 米黄配色与淡斜纹，融入页面 |
| 夜间模式 | 深色卡片 |
| 护眼模式 | 绿色卡片 |
| Excel 模式 | 一行空白单元格，行号列与表格对齐，支持腾讯文档、WPS、Office 主题 |

### 使用方式

👉[点击安装](https://raw.githubusercontent.com/shizzhang0/NGA-BBS-Script-Plugins/main/StealthAdBlock/StealthAdBlock.user.js)，安装即可，无需配置

安装后可在[NGA优化摸鱼体验]**设置面板** -> **插件管理** 中看到本插件

### 配置项

暂无可配置项

### 原理

- NGA 的广告由 `ngaAds.genAds()` 生成，每种广告结构里都带有引用 `ngaAds` 或 `SG_GG` 的 `onload`/`onerror` 属性，帖子内容中的事件属性会被 NGA 过滤，所以可以用它精确识别广告位
- 楼层右侧的广告图片会被本体的图片增强移除 `onload`，所以额外通过 NGA 给该广告位设置的 `class="null"` 来识别
- 插件只注入一段 CSS：用 `:has()` 选中广告位容器，在其上叠加一个 `::after` 伪元素作为占位卡片
  - 不删除、不移动、不修改广告元素，不拦截任何请求
  - 广告元素的尺寸、`display`、`visibility`、`opacity` 均不变
  - NGA 用 `IntersectionObserver` 统计广告曝光，它只判断元素是否进入视口，不判断是否被遮挡，所以被遮盖的广告仍会正常上报曝光
- 插页广告只遮盖，不主动跳过，页面停留时间与请求顺序和正常用户一致

### 注意事项

- 需要浏览器支持 CSS `:has()` 选择器：Chrome / Edge 105+、Firefox 121+、Safari 15.4+
- 不安装本体也可以遮盖广告，但不会适配显示模式

### 已知问题

- 楼层右侧广告位的高度跟随整个楼层，长楼层的占位卡片会同样很长，与 NGA 原生的深色广告栏一致
- Excel 模式下如果页面出现横向滚动条并左右滚动，占位卡片的行号列不会跟随移动
- 只识别由 `ngaAds.genAds()` 生成的广告，如果 NGA 将来改用其他方式投放广告，需要更新识别规则

### 反馈问题

https://github.com/shizzhang0/NGA-BBS-Script-Plugins/issues
