// ==UserScript==
// @name         NGA优化摸鱼体验插件-Excel模式显示版头
// @namespace    https://github.com/shizzhang0/NGA-BBS-Script-Plugins/tree/main/ExcelShowForumHeader
// @version      1.1.0
// @author       timothy
// @description  Excel模式下显示版头与子版面，首页也进入Excel模式并将版面列表伪装为表格
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
    // 首页的行高，所有单元格的高度均为行高的整数倍，与背景网格线对齐
    const INDEX_ROW_HEIGHT = 26
    // 首页的版面与轮播单元格最少所占的列数
    const INDEX_CELL_COLUMNS = 3

    registerPlugin({
        name: 'ExcelShowForumHeader',
        title: 'Excel模式显示版头',
        desc: 'Excel模式下显示版头与子版面，首页也进入Excel模式并将版面列表伪装为表格',
        settings: [{
            key: 'indexEnabled',
            title: '首页显示为Excel表格',
            desc: '开启本体的Excel模式后，首页也自动进入Excel模式，并将分类、轮播与版面排成表格\n关闭后首页保持本体原有的行为\n修改后刷新页面生效',
            default: true
        }],
        styleReady: false,
        indexStyleReady: false,
        columnWidth: 0,
        // 是否取消过本体对版头内容的隐藏
        toppedTopicUnhidden: false,
        // 上次自动进入Excel模式的首页地址
        indexUrl: '',
        renderAlwaysFunc() {
            this.renderIndex()
            this.renderForumHeader()
        },
        /**
         * 首页: 进入Excel模式，并将各分类的轮播与版面伪装为表格
         */
        renderIndex() {
            // 本体保存插件配置后需刷新页面生效
            if (!this.pluginSettings.indexEnabled) return
            const sheet = document.querySelector('#m_cate5 > .w100')
            if (!sheet || !document.getElementById('indexBlockLeft')) return
            // 本体的Excel模式只在列表页与详情页自动进入，首页需自行进入
            // 仅在打开首页时进入一次，之后仍可用本体的快捷键切换回普通模式
            if (this.indexUrl != location.href) {
                this.indexUrl = location.href
                this.mainScript.setting.normal.excelMode && document.body.classList.add('hld__excel-body')
            }
            if (!document.body.classList.contains('hld__excel-body')) return
            if (!this.indexStyleReady && !this.initIndexStyle()) return
            sheet.querySelectorAll('.catetitle:not([hld-title])').forEach(title => {
                // 去掉分类名两侧的"::"，没有分类名的区块(如电竞)显示为"undefined"，置空后隐藏
                // 不修改原文字，切换回普通模式后保持原样
                const name = title.textContent.replace(/::/g, '').trim()
                title.setAttribute('hld-title', name == 'undefined' ? '' : name)
            })
            this.mergeCells(sheet.querySelectorAll('.headline td:not(:empty), .contentBlock .c'), INDEX_CELL_COLUMNS)
            this.renderRowNumbers(sheet)
        },
        /**
         * 按Excel表格的实际尺寸与颜色生成首页样式
         * 首页没有帖子列表，按本体帖子列表的结构临时插入一行，读取当前主题的行号列与文字样式
         * @returns {Boolean} 是否已生成
         */
        initIndexStyle() {
            const $ = this.mainScript.libs.$
            const sub = $('.hld__excel-h4:visible').first().children('.hld__excel-sub')[0]
            const column = $('.hld__excel-h4:visible').first().children('.hld__excel-column')[0]
            if (!sub || !sub.offsetWidth || !column || !column.offsetWidth) return false
            const probe = $('<table style="position:absolute;visibility:hidden;"><tbody><tr class="topicrow"><td class="c1"></td><td class="c2"><a class="topic">A</a></td></tr></tbody></table>').appendTo('body')
            const rowHeaderStyle = getComputedStyle(probe.find('.c1')[0])
            const numberStyle = getComputedStyle(probe.find('.c1')[0], '::before')
            const titleStyle = getComputedStyle(probe.find('a')[0])
            const subWidth = sub.offsetWidth
            const columnWidth = column.offsetWidth
            const lineColor = getComputedStyle(column).borderRightColor
            const rowHeaderColor = rowHeaderStyle.backgroundColor
            const numberColor = numberStyle.color
            const text = `color:${titleStyle.color} !important;font-family:${titleStyle.fontFamily} !important;font-size:14px !important;font-weight:normal !important;text-shadow:none !important;`
            probe.remove()
            const R = INDEX_ROW_HEIGHT
            const sheet = 'body.hld__excel-body #m_cate5 > .w100'
            // 首页分为左右两栏，各栏由多个分类区块组成，每个区块含分类名、轮播(.headline)、版面列表(.contentBlock)
            // 去掉各层容器，使所有区块从上到下排成一张表；轮播与版面列表各自为一个网格，保证每个区块从新的一行开始
            // 所有单元格高度均为行高的整数倍，表格背景绘制网格线，空白单元格也显示网格
            // 版面列表中"显示更多>>"后的版面在点击前为内联隐藏，展开后才显示
            const grid = `display:grid !important;grid-template-columns:repeat(auto-fill, ${columnWidth}px);grid-auto-rows:${R}px;height:auto !important;margin:0 !important;padding:0 !important;border:none !important;background:none !important;box-shadow:none !important;`
            const cell = `grid-column:span ${INDEX_CELL_COLUMNS};display:block !important;width:auto !important;height:auto !important;float:none !important;margin:0 !important;padding:0 6px !important;box-sizing:border-box;overflow:hidden;white-space:nowrap;line-height:${R - 1}px !important;border:none !important;border-right:1px solid ${lineColor} !important;border-bottom:1px solid ${lineColor} !important;border-radius:0 !important;background:#fff !important;box-shadow:none !important;`
            const style = document.createElement('style')
            style.textContent = `
            body.hld__excel-body #m_cate5 {margin:0 !important;padding:0 !important;border:none !important;box-shadow:none !important;background:none !important;}
            ${sheet} {position:relative;margin:0 !important;padding:0 0 0 ${subWidth}px !important;box-sizing:border-box;background-color:#fff !important;background-image:linear-gradient(to right, transparent ${columnWidth - 1}px, ${lineColor} ${columnWidth - 1}px), linear-gradient(to bottom, transparent ${R - 1}px, ${lineColor} ${R - 1}px) !important;background-size:${columnWidth}px 100%, 100% ${R}px !important;background-origin:content-box !important;background-clip:content-box !important;}
            ${sheet} > div:not([id]):not(.clear), ${sheet} > #indexBlockCenter, ${sheet} > .adsc, ${sheet} > .clear, ${sheet} .contentBlock > .clear, ${sheet} .headline td:empty, ${sheet} .catetitle[hld-title=""] {display:none !important;}
            ${sheet} > #indexBlockLeft, ${sheet} > #indexBlockRight, ${sheet} .indexblock, ${sheet} .catenew, ${sheet} .contentBlock > span:not([style*="none"]), ${sheet} .headline table, ${sheet} .headline tbody, ${sheet} .headline tr {display:contents !important;}
            ${sheet} .headline, ${sheet} .contentBlock {${grid}}
            ${sheet} .catetitle {grid-column:1 / -1;display:block !important;height:${R}px !important;margin:0 !important;padding:0 6px !important;box-sizing:border-box;line-height:${R - 1}px !important;text-align:left !important;${text}font-weight:bold !important;border:none !important;border-bottom:1px solid ${lineColor} !important;border-radius:0 !important;background:#fff !important;box-shadow:none !important;font-size:0 !important;}
            ${sheet} .catetitle::before {content:attr(hld-title);font-size:14px;}
            ${sheet} .headline td {${cell}}
            ${sheet} .headline a {display:inline !important;width:auto !important;height:auto !important;padding:0 !important;line-height:inherit !important;background:none !important;box-shadow:none !important;}
            ${sheet} .headline a span {display:inline !important;padding:0 !important;line-height:inherit !important;background:none !important;${text}color:#0563c1 !important;text-decoration:underline;}
            ${sheet} .c {${cell}}
            ${sheet} .c .a, ${sheet} .c .b {margin:0 !important;padding:0 !important;border:none !important;background:none !important;box-shadow:none !important;}
            ${sheet} .c br {display:none;}
            ${sheet} .c a {${text}}
            ${sheet} .c p {display:inline;margin:0 0 0 6px !important;padding:0 !important;color:#999 !important;font-size:12px !important;}
            #hld__excel-row-numbers {display:none;}
            ${sheet} > #hld__excel-row-numbers {display:block;position:absolute;top:0;left:0;width:${subWidth}px;}
            ${sheet} > #hld__excel-row-numbers > div {height:${R}px;line-height:${R - 1}px;box-sizing:border-box;text-align:center;color:${numberColor};font-size:14px;background:${rowHeaderColor};border-right:1px solid ${lineColor};border-bottom:1px solid ${lineColor};}
            `
            document.head.appendChild(style)
            this.columnWidth = columnWidth
            this.indexStyleReady = true
            return true
        },
        /**
         * 首页的行号列，行数随展开"显示更多"、窗口宽度变化而变化
         * @param {Element} sheet 首页表格
         */
        renderRowNumbers(sheet) {
            let numbers = document.getElementById('hld__excel-row-numbers')
            if (!numbers) {
                numbers = document.createElement('div')
                numbers.id = 'hld__excel-row-numbers'
                sheet.appendChild(numbers)
            }
            const rows = Math.round(sheet.offsetHeight / INDEX_ROW_HEIGHT)
            if (numbers.childElementCount == rows) return
            numbers.innerHTML = Array.from({length: rows}, (_, i) => `<div>${i + 1}</div>`).join('')
        },
        /**
         * 列表页: 显示版头与子版面
         */
        renderForumHeader() {
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
            this.mergeCells(document.querySelectorAll('#sub_forums .c'), SUB_FORUM_COLUMNS)
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
         * 内容过长的单元格，像Excel合并单元格一样占用更多列以完整显示
         * 未显示的单元格(如首页"显示更多"中的版面)待显示后再处理
         * @param {NodeList} cells 单元格
         * @param {Number} minColumns 最少所占的列数
         */
        mergeCells(cells, minColumns) {
            cells.forEach(cell => {
                if (cell.hasAttribute('hld-merged') || !cell.offsetWidth) return
                const columns = Math.max(minColumns, Math.ceil(cell.scrollWidth / this.columnWidth))
                if (columns > minColumns) cell.style.gridColumn = `span ${columns}`
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
