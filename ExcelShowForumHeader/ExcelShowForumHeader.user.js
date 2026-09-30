// ==UserScript==
// @name         NGA优化摸鱼体验插件-Excel模式显示版头
// @namespace    https://github.com/shizzhang0/NGA-BBS-Script-Plugins/tree/main/ExcelShowForumHeader
// @version      1.0.0
// @author       timothy
// @description  Excel模式下显示版头与子版面，并伪装为表格单元格，跟随本体的隐藏版头/版规/子版入口设置
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
    // 启用后添加到body上的class，所有样式以此为前提，未测量完表格尺寸前不显示，避免错位闪烁
    const ENABLED_CLASS = 'hld__excel-forum-header'
    // 版头图片的最大高度
    const IMG_MAX_HEIGHT = 160
    // 每个子版面单元格最少所占的列数，名称过长时自动合并更多列
    const SUB_FORUM_COLUMNS = 3

    registerPlugin({
        name: 'ExcelShowForumHeader',
        title: 'Excel模式显示版头',
        desc: 'Excel模式下显示版头与子版面，并伪装为表格单元格，跟随本体的隐藏版头/版规/子版入口设置',
        styleReady: false,
        columnWidth: 0,
        // 是否取消过本体对版头内容的隐藏
        toppedTopicUnhidden: false,
        renderAlwaysFunc() {
            // 本体的Excel模式会隐藏版头(#toptopics)与子版面(#sub_forums)，仅在未开启隐藏版头时恢复显示
            // 本体保存设置后不刷新页面，所以每次循环都检查设置，开启隐藏版头后立即撤销样式
            const hideHeader = this.mainScript.setting.normal.hideHeader
            const enabled = document.body.classList.contains('hld__excel-body') && !hideHeader && this.mainScript.isThreads()
            if (!enabled) {
                document.body.classList.remove(ENABLED_CLASS)
                // 重新开启隐藏版头时，还原被取消的隐藏，避免切换回普通模式后版头仍显示
                if (hideHeader && this.toppedTopicUnhidden) {
                    document.getElementById('toppedtopic').style.display = 'none'
                    this.toppedTopicUnhidden = false
                }
                return
            }
            if (!this.styleReady && !this.initStyle()) return
            document.body.classList.add(ENABLED_CLASS)
            this.expandToppedTopic()
            this.mergeSubForumCells()
        },
        /**
         * 按Excel表格的实际尺寸与颜色生成样式
         * 主脚本的样式在初始化结束时才插入，行号单元格在渲染列表时才添加，所以在循环中等待就绪
         * @returns {Boolean} 是否已生成
         */
        initStyle() {
            const $ = this.mainScript.libs.$
            const sub = $('.hld__excel-h4:visible').first().children('.hld__excel-sub')[0]
            const column = $('.hld__excel-h4:visible').first().children('.hld__excel-column')[0]
            const rowHeader = $('.topicrow .c1')[0]
            const title = $('.topicrow .c2 a.topic')[0]
            if (!sub || !sub.offsetWidth || !column || !column.offsetWidth || !rowHeader || !title) return false
            // 不同Excel主题的行号列宽、列宽、颜色均不同，从表头与帖子列表读取实际值
            const left = sub.getBoundingClientRect().left
            const subWidth = sub.offsetWidth
            const columnWidth = column.offsetWidth
            const lineColor = getComputedStyle(column).borderRightColor
            const rowHeaderStyle = getComputedStyle(rowHeader)
            const titleStyle = getComputedStyle(title)
            const body = `body.hld__excel-body.${ENABLED_CLASS}`
            // 行号列按视口固定定位(background-attachment:fixed)，与表头保持水平对齐
            const row = `margin:0 !important;padding:0 0 0 ${subWidth}px !important;border:none !important;border-bottom:1px solid ${rowHeaderStyle.borderBottomColor} !important;border-radius:0 !important;box-shadow:none !important;background-color:#fff !important;background-image:linear-gradient(to right, ${rowHeaderStyle.backgroundColor} ${subWidth - 1}px, ${rowHeaderStyle.borderRightColor} ${subWidth - 1}px ${subWidth}px, transparent ${subWidth}px) !important;background-position:${left}px 0 !important;background-repeat:no-repeat !important;background-attachment:fixed !important;`
            const text = `color:${titleStyle.color} !important;font-family:${titleStyle.fontFamily} !important;`
            // NGA的图片带有内联min-height等尺寸，需一并覆盖；子版面列表折叠时外层有button与span，展开时直接为单元格
            // "快速浏览这个帖子"的T按钮在表格中显得杂乱，隐藏；链接两侧的[ ]用于分隔连续的链接，保留为浅灰色
            const style = document.createElement('style')
            style.textContent = `
            ${body} #toptopics, ${body} #sub_forums {display:block !important;${row}}
            ${body} #toptopics .contentBlock {margin:0 !important;padding:6px !important;border:none !important;box-shadow:none !important;background:none !important;}
            ${body} #toptopics .contentBlock > h3, ${body} #toptopics .contentBlock > br, ${body} #toptopics .collapse_btn, ${body} #toptopics a.block_txt[onclick*="fastViewPost"] {display:none !important;}
            ${body} #toptopics *:not(img) {${text}background-color:transparent !important;background-image:none !important;box-shadow:none !important;text-shadow:none !important;}
            ${body} #toptopics .apd {color:#ccc !important;}
            ${body} #toptopics table, ${body} #toptopics td, ${body} #toptopics th {border-color:${lineColor} !important;border-radius:0 !important;}
            ${body} #toptopics img {max-height:${IMG_MAX_HEIGHT}px !important;max-width:100% !important;min-height:0 !important;min-width:0 !important;width:auto !important;height:auto !important;}
            ${body} #sub_forums {display:grid !important;grid-template-columns:repeat(auto-fill, ${columnWidth}px);}
            ${body} #sub_forums > button {display:none !important;}
            ${body} #sub_forums > span {display:contents !important;}
            ${body} #sub_forums .c {grid-column:span ${SUB_FORUM_COLUMNS};width:auto !important;float:none !important;margin:0 !important;padding:4px 6px !important;box-sizing:border-box;white-space:nowrap;border:none !important;border-right:1px solid ${lineColor} !important;border-bottom:1px solid ${lineColor} !important;border-radius:0 !important;background:none !important;box-shadow:none !important;}
            ${body} #sub_forums .c .a, ${body} #sub_forums .c .b {margin:0 !important;padding:0 !important;border:none !important;background:none !important;box-shadow:none !important;}
            ${body} #sub_forums .c br {display:none;}
            ${body} #sub_forums .c a {${text}}
            ${body} #sub_forums .c p {display:inline;margin:0 0 0 6px !important;padding:0 !important;color:#999 !important;font-size:12px !important;}
            `
            document.head.appendChild(style)
            this.columnWidth = columnWidth
            this.styleReady = true
            return true
        },
        /**
         * 名称或描述过长的子版面，像Excel合并单元格一样占用更多列以完整显示
         */
        mergeSubForumCells() {
            document.querySelectorAll('#sub_forums .c:not([hld-merged])').forEach(cell => {
                if (!cell.offsetWidth) return
                const columns = Math.max(SUB_FORUM_COLUMNS, Math.ceil(cell.scrollWidth / this.columnWidth))
                if (columns > SUB_FORUM_COLUMNS) cell.style.gridColumn = `span ${columns}`
                cell.setAttribute('hld-merged', columns)
            })
        },
        /**
         * 显示版头内容，版头有两种被隐藏的情况:
         * - NGA将版头折叠为"点击显示隐藏的置顶内容"，此时内容未渲染，点击NGA自己的展开按钮渲染
         *   该按钮只在当前页面展开内容，不会保存为用户的显示偏好
         * - 页面加载时开启了隐藏版头，本体隐藏了已渲染的内容，关闭设置后需要取消隐藏
         */
        expandToppedTopic() {
            const toppedTopic = document.getElementById('toppedtopic')
            if (!toppedTopic || toppedTopic.style.display != 'none') return
            const collapse = document.querySelector('#toptopics .collapse_btn')
            if (collapse && collapse.style.display != 'none') {
                collapse.querySelector('button').click()
            } else {
                toppedTopic.style.display = 'block'
                this.toppedTopicUnhidden = true
            }
        }
    })

})(function(plugin) {
    plugin.meta = GM_info.script
    unsafeWindow.ngaScriptPlugins = unsafeWindow.ngaScriptPlugins || []
    unsafeWindow.ngaScriptPlugins.push(plugin)
});
