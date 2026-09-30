// ==UserScript==
// @name         NGA优化摸鱼体验插件-隐形广告屏蔽
// @namespace    https://github.com/shizzhang0/NGA-BBS-Script-Plugins/tree/main/StealthAdBlock
// @version      1.0.0
// @author       timothy
// @description  用占位卡片在视觉上遮盖广告，广告元素、广告请求与曝光统计保持原样，不易被网站察觉
// @license      MIT
// @match        *://bbs.nga.cn/*
// @match        *://ngabbs.com/*
// @match        *://nga.178.com/*
// @match        *://g.nga.cn/*
// @grant        unsafeWindow
// @run-at       document-start
// @inject-into  content
// ==/UserScript==

(function (registerPlugin) {
    'use strict';
    // 广告标记: NGA的ngaAds.genAds()生成的各类广告(图片/iframe/联盟/占位)中，都会带有引用ngaAds或SG_GG的事件属性
    // 帖子内容中的事件属性会被NGA过滤，所以此标记只会出现在广告中
    const AD_MARKER = ':is([onload*="ngaAds["], [onerror*="ngaAds["], [onerror*="SG_GG("])'
    // 广告位容器: genAds()输出根节点的父元素，如横幅的div、楼层右侧的td
    // 主脚本的图片增强模块会移除楼层内所有图片的onload，楼层右侧广告因此丢失标记
    // 该广告位是NGA用className=null改造的td，用td.null补充识别
    const AD_SLOT = `:is(:is(div, td, span):has(> * > ${AD_MARKER}), td.null:has(> * > :is(img, iframe)))`
    // 只叠加伪元素遮盖，不修改广告的尺寸、display、visibility、opacity，也不拦截请求
    // 广告仍会正常加载并被IntersectionObserver判定为可见，曝光统计与正常用户一致
    // 部分广告位容器自带1px内联边框(如楼层间横幅的左右边框)，遮盖层需要向外扩展覆盖边框
    // 窗口较窄时广告会溢出容器，用clip-path裁剪到容器边框为止(不影响布局，也不会裁掉覆盖边框的遮盖层)
    // Excel模式: 行号列在renderAlwaysFunc()中按表头实际尺寸生成，此前先显示为空白单元格
    // 楼层右侧广告位处于楼层这个合并单元格内，不画格线
    const style = `
    ${AD_SLOT} {position:relative;isolation:isolate;clip-path:inset(0);}
    ${AD_SLOT}::after {content:'';position:absolute;inset:0;z-index:2147483647;box-sizing:border-box;cursor:default;border:1px solid #e6c3a8;background-color:#fff3d5;background-image:repeating-linear-gradient(-45deg, rgba(230,195,168,.35) 0 1px, transparent 1px 8px);}
    ${AD_SLOT}[style*="border:1px"]::after {inset:-1px;}
    ${AD_SLOT}[style*="border-top:none"]::after {top:0;}
    ${AD_SLOT}[style*="border-bottom:none"]::after {bottom:0;}
    body.hld__eye-care ${AD_SLOT}::after {border-color:#fff;background-color:#c7edcc;background-image:repeating-linear-gradient(-45deg, rgba(255,255,255,.5) 0 1px, transparent 1px 8px);}
    body.hld__dark-mode ${AD_SLOT}::after {border-color:#21262d;background-color:#141b22;background-image:repeating-linear-gradient(-45deg, rgba(255,255,255,.04) 0 1px, transparent 1px 8px);}
    body.hld__excel-body ${AD_SLOT}::after {border-color:#bbb;background-color:#fff;background-image:none;}
    body.hld__excel-body td${AD_SLOT}::after {background-image:none;}
    #s7 > #s9:has(> * > ${AD_MARKER})::after {border-color:#555;background-color:#222;background-image:repeating-linear-gradient(-45deg, rgba(255,255,255,.04) 0 1px, transparent 1px 8px);}
    `
    // 不使用插件的style字段: 主脚本初始化较晚，期间广告会闪现，这里在document-start时直接注入
    const $style = document.createElement('style')
    $style.textContent = style
    ;(document.head || document.documentElement).appendChild($style)

    registerPlugin({
        name: 'StealthAdBlock',
        title: '隐形广告屏蔽',
        desc: '用占位卡片在视觉上遮盖广告，广告元素、广告请求与曝光统计保持原样，不易被网站察觉',
        excelGridDone: false,
        renderAlwaysFunc() {
            // 主脚本的样式在初始化结束时才插入，所以在循环中等到Excel表头显示后再生成一次行号列
            if (this.excelGridDone || !document.body.classList.contains('hld__excel-body')) return
            const $ = this.mainScript.libs.$
            const sub = $('.hld__excel-h4:visible').first().children('.hld__excel-sub')[0]
            // 行号单元格由主脚本渲染楼层/列表时才添加，需一并等待
            const rowHeader = $('#m_posts .c0, .topicrow .c1')[0]
            if (!sub || !sub.offsetWidth || !rowHeader) return
            this.excelGridDone = true
            // 不同Excel主题的行号列宽、颜色均不同，从表头与行号单元格读取实际值
            const left = sub.getBoundingClientRect().left
            const subWidth = sub.offsetWidth
            const rowHeaderStyle = getComputedStyle(rowHeader)
            // 画成一行两列: 与表头对齐的行号列 + 合并的空白单元格
            // 行号列按视口固定定位(background-attachment:fixed)，与表头保持水平对齐
            $style.textContent += `
            body.hld__excel-body ${AD_SLOT}::after {border-color:${rowHeaderStyle.borderBottomColor};background-image:linear-gradient(to right, ${rowHeaderStyle.backgroundColor} ${subWidth - 1}px, ${rowHeaderStyle.borderRightColor} ${subWidth - 1}px ${subWidth}px, transparent ${subWidth}px);background-position:${left}px 0;background-repeat:no-repeat;background-attachment:fixed;}
            `
        }
    })

})(function(plugin) {
    plugin.meta = GM_info.script
    unsafeWindow.ngaScriptPlugins = unsafeWindow.ngaScriptPlugins || []
    unsafeWindow.ngaScriptPlugins.push(plugin)
});
