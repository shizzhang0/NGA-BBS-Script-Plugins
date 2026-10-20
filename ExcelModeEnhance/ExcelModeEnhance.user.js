// ==UserScript==
// @name         NGA优化摸鱼体验插件-Excel模式增强
// @namespace    https://github.com/shizzhang0/NGA-BBS-Script-Plugins/tree/main/ExcelModeEnhance
// @version      1.3.0
// @author       timothy
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjggMTI4Ij48cmVjdCB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgcng9IjI0IiBmaWxsPSIjMDAwIi8+PHRleHQgeD0iNjQiIHk9IjUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIiBmb250LXNpemU9IjM2IiBmaWxsPSIjZmZmIj5OR0E8L3RleHQ+PHJlY3QgeD0iMTQiIHk9IjYwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQ0IiByeD0iNiIgZmlsbD0iI2Y5MCIvPjxwYXRoIGQ9Ik0zNiA2OWg1NnYyNkgzNnpNMzYgODJoNTZNNTUgNjl2MjZNNzMgNjl2MjYiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSI2Ii8+PC9zdmc+
// @description  Excel模式下显示版头、子版面与顶部分页栏，首页、发帖页、用户中心、短消息等页面也进入Excel模式并伪装为表格，弹框改为白色样式
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
    // 发帖页添加到body上的class，发帖页的样式以此为前提
    const POST_CLASS = 'hld__excel-post'
    // 用户中心与短消息添加到body上的class，两者均由分类标题(.catetitle)与内容块(.cateblock)组成，共用基础样式
    const CATE_CLASS = 'hld__excel-cate'
    const UCP_CLASS = 'hld__excel-ucp'
    const MESSAGE_CLASS = 'hld__excel-message'
    // 提示页与版面权限页添加到body上的class，两者均为纯文字页面，由插件按换行拆分为表格行
    const ROWS_CLASS = 'hld__excel-rows'

    registerPlugin({
        name: 'ExcelModeEnhance',
        title: 'Excel模式增强',
        desc: 'Excel模式下显示版头、子版面与顶部分页栏，首页、发帖页、用户中心、短消息等页面也进入Excel模式并伪装为表格，弹框改为白色样式',
        settings: [{
            key: 'indexEnabled',
            title: '首页显示为Excel表格',
            desc: '开启本体的Excel模式后，首页也自动进入Excel模式，并将分类、轮播与版面排成表格\n关闭后首页保持本体原有的行为\n修改后刷新页面生效',
            default: true
        }, {
            key: 'popupEnabled',
            title: '弹框使用白色样式',
            desc: 'Excel模式下，将NGA的弹框(开始菜单、回复、评分等)由米黄色改为白色，底部的用户名改为浅灰色的状态栏\n修改后刷新页面生效',
            default: true
        }, {
            key: 'postEnabled',
            title: '发帖页显示为Excel表格',
            desc: '开启本体的Excel模式后，发帖、回复、编辑页也自动进入Excel模式，并将标题、按钮栏、正文等排成表格\n关闭后发帖页保持本体原有的行为\n修改后刷新页面生效',
            default: true
        }, {
            key: 'ucpEnabled',
            title: '用户中心显示为Excel表格',
            desc: '开启本体的Excel模式后，用户中心(用户资料页)也自动进入Excel模式，每个分类的标题与内容各占一行\n关闭后用户中心保持本体原有的行为\n修改后刷新页面生效',
            default: true
        }, {
            key: 'messageEnabled',
            title: '短消息显示为Excel表格',
            desc: '开启本体的Excel模式后，短消息页面也自动进入Excel模式，收件箱的每条消息、读信页的每条回复各占一行\n关闭后短消息页面保持本体原有的行为\n修改后刷新页面生效',
            default: true
        }, {
            key: 'noticeEnabled',
            title: '提示页显示为Excel表格',
            desc: '开启本体的Excel模式后，"找不到主题"、"你没有登录"等提示页每行文字占一行表格\n关闭后提示页保持本体原有的行为\n修改后刷新页面生效',
            default: true
        }, {
            key: 'privilegeEnabled',
            title: '版面权限页显示为Excel表格',
            desc: '开启本体的Excel模式后，版面的"权限/版主"页面也自动进入Excel模式，每个条件、每位版主各占一行\n关闭后版面权限页保持原样\n修改后刷新页面生效',
            default: true
        }, {
            key: 'listFixEnabled',
            title: '收藏与回复列表细节优化',
            desc: 'Excel模式下，收藏夹切换栏的按钮改为白底细边框，收藏列表的勾选框只在鼠标悬停或勾选时显示，"我的回复"中回复内容上方的分隔线改为网格线颜色\n修改后刷新页面生效',
            default: true
        }, {
            key: 'topPagerEnabled',
            title: '显示顶部分页栏',
            desc: 'Excel模式下，在版面与帖子页的顶部重新显示分页栏(含精华区、收藏版面、发表新帖等按钮)，样式与底部的分页栏一致\n修改后刷新页面生效',
            default: true
        }],
        styleReady: false,
        indexStyleReady: false,
        popupStyleReady: false,
        postStyleReady: false,
        cateStyleReady: false,
        rowsStyleReady: false,
        listFixStyleReady: false,
        topPagerStyleReady: false,
        columnWidth: 0,
        // 是否取消过本体对版头内容的隐藏
        toppedTopicUnhidden: false,
        // 上次自动进入Excel模式的页面地址
        excelUrl: '',
        renderAlwaysFunc() {
            this.renderIndex()
            this.renderPost()
            this.renderCate()
            this.renderRows()
            this.renderForumHeader()
            this.renderPopup()
            this.renderListFix()
            this.renderTopPager()
        },
        /**
         * 顶部分页栏: 本体的Excel模式隐藏了顶部的分页栏(#m_pbtntop)，只保留底部的分页栏(#m_pbtnbtm)
         * 重新显示顶部的分页栏，并按底部分页栏的实际样式伪装为一行表格，行号列显示"#"
         * 样式均以Excel模式的body class为前提，切换模式后自动生效或恢复，只需生成一次
         */
        renderTopPager() {
            // 本体保存插件配置后需刷新页面生效
            if (this.topPagerStyleReady || !this.pluginSettings.topPagerEnabled) return
            // 不同Excel主题的行号列宽与颜色不同，从底部分页栏的行号单元格读取，未进入Excel模式时不显示，等待进入后再生成
            const bottom = document.getElementById('pagebbtm')
            const column = this.mainScript.libs.$('.hld__excel-h4:visible').first().children('.hld__excel-column')[0]
            if (!document.getElementById('m_pbtntop') || !bottom || !column) return
            const number = getComputedStyle(bottom, '::before')
            if (number.display != 'block') return
            // 网格线颜色跟随表头，与上下的版头、帖子列表一致
            const lineColor = getComputedStyle(column).borderRightColor
            const body = 'body.hld__excel-body'
            // NGA会给分页按钮加米黄色背景与圆角边框，改为表格中的纯文字，精华区等按钮的文字放大了1.23倍，统一为表格字号；
            // 按钮栏两侧的.left与.right_为浮动布局，保持原样；
            // 本体开启自动翻页时，帖子页底部的收藏、发表回复按钮(#postbbtm)已固定在右上角，顶部的同一组按钮(#postbtop)不再重复显示，
            // 此时只有一页的帖子没有页码，整行为空，一并隐藏
            const style = document.createElement('style')
            style.textContent = `
            ${body} #m_pbtntop {display:block !important;margin:0 !important;padding:0 !important;border-bottom:1px solid ${lineColor};background:#fff;}
            ${body}.hld__reply-fixed #postbtop, ${body}.hld__reply-fixed #m_pbtntop:has(#pagebtop:empty) {display:none !important;}
            ${body} #pagebtop, ${body} #m_pbtntop .right_ {margin:0 !important;}
            ${body} #pagebtop::before {display:block;float:left;content:"#";box-sizing:${number.boxSizing};width:${number.width};line-height:35px;border-right:1px solid ${lineColor};color:${number.color};font-size:${number.fontSize};text-align:center;background:${number.backgroundColor};}
            ${body} #m_pbtntop td {line-height:35px;padding:0 5px;}
            ${body} #m_pbtntop .stdbtn {box-shadow:none !important;border:none !important;padding:0 0 0 5px !important;background:none !important;border-radius:0 !important;font-size:13px !important;}
            ${body} #m_pbtntop .stdbtn a {padding:0 !important;border:none !important;border-radius:0 !important;background:none !important;box-shadow:none !important;font-weight:normal !important;}
            ${body} #m_pbtntop .stdbtn a span {font-size:1em !important;}
            ${body} #m_pbtntop .stdbtn .invert {color:#591804 !important;}
            `
            document.head.appendChild(style)
            this.topPagerStyleReady = true
        },
        /**
         * 弹框: 将NGA的弹框改为白色样式
         * 样式均以Excel模式的body class为前提，切换模式后自动生效或恢复，只需生成一次
         */
        renderPopup() {
            // 本体保存插件配置后需刷新页面生效
            if (this.popupStyleReady || !this.pluginSettings.popupEnabled) return
            // 边框颜色跟随当前Excel主题的网格线，未进入Excel模式时表头不显示，等待进入后再生成
            const column = this.mainScript.libs.$('.hld__excel-h4:visible').first().children('.hld__excel-column')[0]
            if (!column) return
            const lineColor = getComputedStyle(column).borderRightColor
            // 本体的暗色模式与护眼模式可与Excel模式同时开启，且已有各自的弹框配色，此时不修改
            const pop = 'body.hld__excel-body:not(.hld__dark-mode):not(.hld__eye-care) .single_ttip2'
            // NGA所有弹框共用.single_ttip2，只修改外框、标题栏与内容区的背景，不改动弹框内部的内容，避免影响回复框等
            // 开始菜单(#startmenu)的分栏线与选中项改为灰色，NGA会拉长每栏最后一项的高度使各栏等高，选中项的灰底只画一行高；
            // Excel模式下开始菜单固定在右上角，展开多栏后宽度不足，本体的设置入口会换行，而菜单项为固定高度，换行后会溢出盖住下方，改为自适应高度；底部的用户名(#usernamebg)原为40px的深棕色大字，
            // 改为一行浅灰色的状态栏，NGA会给较短的一行加letter-spacing以与最长的一行等宽，需一并取消
            const style = document.createElement('style')
            style.textContent = `
            ${pop} {border:1px solid ${lineColor} !important;border-radius:0 !important;background:#fff !important;box-shadow:0 2px 8px rgba(0, 0, 0, 0.15) !important;}
            ${pop} .tip_title {background:#fff !important;border-bottom:none !important;color:#333 !important;}
            ${pop} .colored_text_btn {background:#fff !important;color:#666 !important;}
            ${pop} .colored_text_btn svg {fill:#666 !important;}
            ${pop} .colored_text_btn:hover {background:#e6e6e6 !important;color:#333 !important;}
            ${pop} .colored_text_btn:hover svg {fill:#333 !important;}
            ${pop} .div2 {background:#fff !important;}
            ${pop} #startmenu .item {border-right-color:${lineColor} !important;}
            ${pop} #startmenu .select {border-color:transparent !important;border-radius:0 !important;background:linear-gradient(#e6e6e6, #e6e6e6) no-repeat 0 0 / 100% 2.5em !important;}
            ${pop} #startmenu .select .arrow {color:#333 !important;}
            ${pop} #startmenu .recent {border-radius:0 !important;background:#f5f5f5 !important;box-shadow:none !important;}
            ${pop} #startmenu .hld__setting-box {height:auto !important;min-height:2.5em;box-sizing:border-box;padding-top:0.5em !important;padding-bottom:0.5em !important;line-height:1.5em !important;}
            ${pop} #usernamebg {display:flex !important;align-items:center;gap:8px;height:auto !important;margin:0 !important;padding:0 10px !important;border-top:1px solid ${lineColor} !important;background:#f3f3f3 !important;color:#555 !important;font-family:inherit !important;font-size:12px !important;font-weight:normal !important;line-height:24px !important;text-transform:none !important;}
            ${pop} #usernamebg span {display:inline !important;float:none !important;clear:none !important;padding:0 !important;font:inherit !important;letter-spacing:normal !important;}
            ${pop} #usernamebg .title {color:#999 !important;}
            ${pop} #usernamebg .id {margin-left:auto;color:#999 !important;}
            ${pop} #usernamebg .id::before {content:"UID ";}
            `
            document.head.appendChild(style)
            this.popupStyleReady = true
        },
        /**
         * 首页: 进入Excel模式，并将各分类的轮播与版面伪装为表格
         */
        renderIndex() {
            // 本体保存插件配置后需刷新页面生效
            if (!this.pluginSettings.indexEnabled) return
            const sheet = document.querySelector('#m_cate5 > .w100')
            if (!sheet || !document.getElementById('indexBlockLeft')) return
            this.enterExcelMode()
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
         * 本体的Excel模式只在列表页与详情页自动进入，首页与发帖页需自行进入
         * 仅在打开页面时进入一次，之后仍可用本体的快捷键切换回普通模式
         */
        enterExcelMode() {
            if (this.excelUrl == location.href) return
            this.excelUrl = location.href
            this.mainScript.setting.normal.excelMode && document.body.classList.add('hld__excel-body')
        },
        /**
         * 读取当前Excel主题的表格尺寸与颜色，并生成各页面共用的样式片段
         * 首页、发帖页等没有帖子列表，按本体帖子列表的结构临时插入一行，读取行号列与文字样式
         * @returns {Object|null} 表格样式，表头未显示时为null
         */
        measureSheet() {
            const $ = this.mainScript.libs.$
            const sub = $('.hld__excel-h4:visible').first().children('.hld__excel-sub')[0]
            const column = $('.hld__excel-h4:visible').first().children('.hld__excel-column')[0]
            if (!sub || !sub.offsetWidth || !column || !column.offsetWidth) return null
            const probe = $('<table style="position:absolute;visibility:hidden;"><tbody><tr class="topicrow"><td class="c1"></td><td class="c2"><a class="topic">A</a></td></tr></tbody></table>').appendTo('body')
            const titleStyle = getComputedStyle(probe.find('a')[0])
            const subWidth = sub.offsetWidth
            const lineColor = getComputedStyle(column).borderRightColor
            const rowHeaderColor = getComputedStyle(probe.find('.c1')[0]).backgroundColor
            const numberColor = getComputedStyle(probe.find('.c1')[0], '::before').color
            const textColor = titleStyle.color
            probe.remove()
            return {
                subWidth,
                columnWidth: column.offsetWidth,
                lineColor,
                rowHeaderColor,
                numberColor,
                textColor,
                text: `color:${textColor} !important;font-family:${titleStyle.fontFamily} !important;font-size:14px !important;font-weight:normal !important;text-shadow:none !important;`,
                // 表格行: 左侧留出行号列，底部为网格线，配合rowHeader在::before中绘制行号单元格
                row: `position:relative;padding:6px 6px 6px ${subWidth + 6}px !important;border:none !important;border-bottom:1px solid ${lineColor} !important;border-radius:0 !important;background:#fff !important;box-shadow:none !important;`,
                // 行号单元格: 由外层容器以counter-reset:hld-row重置计数，从1开始编号
                rowHeader: `content:counter(hld-row);counter-increment:hld-row;position:absolute;top:0;bottom:0;left:0;width:${subWidth}px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;border-right:1px solid ${lineColor};background:${rowHeaderColor};color:${numberColor};font-size:14px;font-weight:normal;`,
                // 按钮: NGA的深棕色、米黄色按钮改为白底细边框，部分按钮的颜色为内联样式，需!important覆盖
                button: `display:inline-block;height:auto !important;margin:2px 4px 2px 0 !important;padding:0 8px !important;border:1px solid ${lineColor} !important;border-radius:2px !important;background:#fff !important;color:${textColor} !important;box-shadow:none !important;text-shadow:none !important;font-size:13px !important;font-weight:normal !important;line-height:24px !important;`,
                buttonHover: 'background:#e6e6e6 !important;',
                input: `background:#fff !important;border:1px solid ${lineColor} !important;border-radius:0 !important;box-shadow:none !important;color:${textColor} !important;`
            }
        },
        /**
         * 按Excel表格的实际尺寸与颜色生成首页样式
         * @returns {Boolean} 是否已生成
         */
        initIndexStyle() {
            const measured = this.measureSheet()
            if (!measured) return false
            const {subWidth, columnWidth, lineColor, rowHeaderColor, numberColor, text} = measured
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
         * 发帖页: 进入Excel模式，并将发帖表单伪装为表格
         * 发帖、回复、编辑均为post.php，表单结构相同
         */
        renderPost() {
            // 本体保存插件配置后需刷新页面生效
            const enabled = this.pluginSettings.postEnabled && location.pathname == '/post.php' && !!document.querySelector('#mc .forumbox')
            document.body.classList.toggle(POST_CLASS, enabled)
            if (!enabled) return
            this.enterExcelMode()
            if (!this.postStyleReady && document.body.classList.contains('hld__excel-body')) this.initPostStyle()
        },
        /**
         * 按Excel表格的实际尺寸与颜色生成发帖页样式
         * @returns {Boolean} 是否已生成
         */
        initPostStyle() {
            const measured = this.measureSheet()
            if (!measured) return false
            const {subWidth, text, row, rowHeader, button, buttonHover, input} = measured
            const form = `body.hld__excel-body.${POST_CLASS} #mc > .module_wrap:not(#m_nav)`
            // 表单为一张米黄色的表格，每一行(标题、BBCode按钮、格式按钮、选项、正文、附件)只有一个单元格，改为白底的表格行，左侧用伪元素绘制行号单元格
            // NGA加载页面时按窗口宽度固定了表单宽度，改为铺满；标题"发布/编辑"与深棕色的表头隐藏；按钮改为白底细边框
            const style = document.createElement('style')
            style.textContent = `
            ${form}, ${form} > .w100 {width:auto !important;margin:0 !important;padding:0 !important;counter-reset:hld-row;}
            ${form} .forumbox {width:100% !important;margin:0 !important;border:none !important;border-radius:0 !important;box-shadow:none !important;background:#fff !important;border-collapse:collapse;}
            ${form} .forumbox caption, ${form} .forumbox thead {display:none !important;}
            ${form} .forumbox td.c2 {${row}${text}}
            ${form} .forumbox td.c2::before {${rowHeader}}
            ${form} .forumbox .small_colored_text_btn, ${form} .forumbox button, ${form} .stdbtn a {${button}}
            ${form} .forumbox .small_colored_text_btn:hover, ${form} .forumbox button:hover, ${form} .stdbtn a:hover {${buttonHover}}
            ${form} .forumbox input:not([type="checkbox"]), ${form} .forumbox select, ${form} .forumbox textarea {${input}}
            ${form} .stdbtn {margin:12px 0 0 ${subWidth + 6}px !important;border:none !important;border-radius:0 !important;background:none !important;box-shadow:none !important;}
            ${form} .stdbtn td {padding:0 !important;border:none !important;background:none !important;}
            ${form} .stdbtn a span {font-size:1em !important;}
            ${form} .stdbtn a.uitxt1 {font-weight:bold !important;}
            `
            document.head.appendChild(style)
            this.postStyleReady = true
            return true
        },
        /**
         * 用户中心与短消息: 进入Excel模式，并将分类标题与内容伪装为表格行
         */
        renderCate() {
            // 本体保存插件配置后需刷新页面生效
            const func = location.pathname == '/nuke.php' ? new URLSearchParams(location.search).get('func') : ''
            const ucp = func == 'ucp' && this.pluginSettings.ucpEnabled && !!document.getElementById('ucp_block')
            const message = func == 'message' && this.pluginSettings.messageEnabled && !!document.getElementById('msg_block_c')
            document.body.classList.toggle(UCP_CLASS, ucp)
            document.body.classList.toggle(MESSAGE_CLASS, message)
            document.body.classList.toggle(CATE_CLASS, ucp || message)
            if (!ucp && !message) return
            this.enterExcelMode()
            if (!document.body.classList.contains('hld__excel-body')) return
            if (!this.cateStyleReady && !this.initCateStyle()) return
            // 去掉分类名两侧的"::"，不修改原文字，切换回普通模式后保持原样
            document.querySelectorAll('#mc .catetitle:not([hld-title])').forEach(title => {
                title.setAttribute('hld-title', title.textContent.replace(/::/g, '').trim())
            })
        },
        /**
         * 按Excel表格的实际尺寸与颜色生成用户中心与短消息的样式
         * @returns {Boolean} 是否已生成
         */
        initCateStyle() {
            const measured = this.measureSheet()
            if (!measured) return false
            const {subWidth, lineColor, text, row, rowHeader, button, buttonHover, input} = measured
            const cate = `body.hld__excel-body.${CATE_CLASS} #mc`
            const ucp = `body.hld__excel-body.${UCP_CLASS} #mc`
            const message = `body.hld__excel-body.${MESSAGE_CLASS} #mc`
            // 页面由多个分类组成，每个分类为标题(.catetitle)加米黄色的内容块(.cateblock > .contentBlock)，标题改为加粗的表格行，内容块去掉底色与边框；
            // 分类名的"::"通过hld-title属性去掉，标题的::before已用于行号，分类名改用::after显示
            // 用户中心: 每个分类的内容合并为一行；签名框与头像原为5px的灰色粗边框，物品列表的标题与物品框为深灰色边框，均改为网格线
            // 短消息: 菜单、收件箱的每条消息、读信页的上下导航与每条回复、写新消息的收件人、标题、内容、页码各占一行，单元格之间显示网格线；
            // 写新消息的输入框宽度为100%，加上边框后会超出单元格，改为包含边框
            const style = document.createElement('style')
            style.textContent = `
            ${cate} {counter-reset:hld-row;}
            ${cate} > div:not(#mainmenu):not(#m_nav):not(.clear) {margin:0 !important;padding:0 !important;}
            ${cate} .catetitle {${row}display:block !important;height:auto !important;margin:0 !important;text-align:left !important;${text}font-size:0 !important;line-height:20px !important;}
            ${cate} .catetitle::before {${rowHeader}}
            ${cate} .catetitle::after {content:attr(hld-title);font-size:14px;font-weight:bold;}
            ${cate} .cateblock, ${cate} .contentBlock {margin:0 !important;padding:0 !important;border:none !important;border-radius:0 !important;background:#fff !important;box-shadow:none !important;}
            ${cate} .block_txt_c2, ${cate} .small_colored_text_btn, ${cate} .cateblock button {${button}}
            ${cate} .block_txt_c2:hover, ${cate} .small_colored_text_btn:hover, ${cate} .cateblock button:hover {${buttonHover}}
            ${cate} .cateblock input:not([type="checkbox"]):not([type="radio"]), ${cate} .cateblock select, ${cate} .cateblock textarea {${input}}
            ${ucp} .contentBlock {${row}${text}}
            ${ucp} .contentBlock::before {${rowHeader}}
            ${ucp} .contentBlock img, ${ucp} #userSignC {border:1px solid ${lineColor} !important;}
            ${ucp} .item_ui, ${ucp} .item_ui * {border-color:${lineColor} !important;}
            ${ucp} .item_ui .textTitle {font-size:14px !important;}
            ${message} .subblock {margin:0 !important;padding:0 !important;border:none !important;background:#fff !important;}
            ${message} .contentBlock > span > .menu, ${message} .subblock > div:not(.pager), ${message} .subblock > .pager {margin:0 !important;${row}${text}}
            ${message} .contentBlock > span > .menu::before, ${message} .subblock > div:not(.pager)::before, ${message} .subblock > .pager::before {${rowHeader}}
            ${message} .forumbox, ${message} .msgpost {width:100% !important;margin:0 !important;border:none !important;border-radius:0 !important;box-shadow:none !important;background:#fff !important;border-collapse:collapse;}
            ${message} .forumbox td, ${message} .msgpost td {padding:6px !important;border:none !important;border-right:1px solid ${lineColor} !important;border-bottom:1px solid ${lineColor} !important;background:#fff !important;}
            ${message} .forumbox tr > td:first-child, ${message} .msgpost tr > td:first-child {position:relative;padding-left:${subWidth + 6}px !important;white-space:nowrap;}
            ${message} .forumbox tr > td:first-child::before, ${message} .msgpost tr > td:first-child::before {${rowHeader}}
            ${message} .msgpost input, ${message} .msgpost textarea {box-sizing:border-box;}
            ${message} .subblock > button {margin:6px 0 6px ${subWidth + 6}px !important;}
            `
            document.head.appendChild(style)
            this.cateStyleReady = true
            return true
        },
        /**
         * 提示页与版面权限页: 进入Excel模式，并将文字按换行拆分为表格行
         * 两者均为没有NGA页面框架的纯文字页面，文字直接以<br>换行，CSS无法为每行添加行号，所以将每行包入单独的元素
         */
        renderRows() {
            const built = document.getElementById('hld__excel-rows')
            const page = built ? null : this.findRowsPage()
            const enabled = !!(built || page)
            document.body.classList.toggle(ROWS_CLASS, enabled)
            if (!enabled) return
            this.enterExcelMode()
            // 仅在进入Excel模式后拆分，普通模式下保持页面原样
            if (!document.body.classList.contains('hld__excel-body')) return
            if (!this.rowsStyleReady && !this.initRowsStyle()) return
            page && this.buildRows(page.container, page.nodes)
        },
        /**
         * 判断当前页面是否为提示页或版面权限页
         * @returns {Object|null} 文字所在的容器与需要拆分的节点
         */
        findRowsPage() {
            if (document.getElementById('mc')) return null
            const body = document.body
            // 提示页: NGA以注释标记提示信息，文字直接位于body下，本体与插件添加的元素均在其后，以hld__开头的元素为界
            if (this.pluginSettings.noticeEnabled && [...body.childNodes].some(node => node.nodeType == 8 && node.textContent == 'msginfostart')) {
                const nodes = []
                for (const node of body.childNodes) {
                    if (node.nodeType == 1 && /hld__|sp-container/.test(node.id + ' ' + node.className)) break
                    nodes.push(node)
                }
                return {container: body, nodes}
            }
            // 版面权限页: 文字位于#page_default_container中，小标题为h4
            const container = document.getElementById('page_default_container')
            if (this.pluginSettings.privilegeEnabled && container && new URLSearchParams(location.search).get('__lib') == 'view_privilege') {
                return {container, nodes: [...container.childNodes]}
            }
            return null
        },
        /**
         * 将节点按<br>拆分为表格行，标题(h2、h4)单独占一行
         * @param {Element} container 文字所在的容器
         * @param {Array} nodes 需要拆分的节点
         */
        buildRows(container, nodes) {
            const rows = document.createElement('div')
            rows.id = 'hld__excel-rows'
            container.insertBefore(rows, nodes[0] || null)
            let row = null
            nodes.forEach(node => {
                // 脚本保持原位，换行由行代替
                if (node.nodeName == 'SCRIPT') return
                if (node.nodeName == 'BR') {
                    node.remove()
                    row = null
                    return
                }
                const title = /^H\d$/.test(node.nodeName)
                if (!row || title) {
                    // 行首的空白不单独成行
                    if (node.nodeType == 3 && !node.textContent.trim()) return
                    row = document.createElement('div')
                    row.className = title ? 'hld__excel-row hld__excel-row-title' : 'hld__excel-row'
                    rows.appendChild(row)
                }
                row.appendChild(node)
                if (title) row = null
            })
            // NGA隐藏的内容(如提示页的"使用APP打开")所在的行没有可见文字，不显示
            rows.querySelectorAll('.hld__excel-row').forEach(item => {
                item.innerText.trim() || item.classList.add('hld__excel-row-empty')
            })
        },
        /**
         * 按Excel表格的实际尺寸与颜色生成提示页与版面权限页的样式
         * @returns {Boolean} 是否已生成
         */
        initRowsStyle() {
            const measured = this.measureSheet()
            if (!measured) return false
            // 表头与表尾均为固定定位，部分主题的列标题行超出表头容器的高度，以列标题行的底边为准
            const top = Math.ceil(this.mainScript.libs.$('.hld__excel-h4:visible')[0].getBoundingClientRect().bottom)
            const footer = document.querySelector('.hld__excel-footer')
            const {text, row, rowHeader} = measured
            const body = `body.hld__excel-body.${ROWS_CLASS}`
            // 页面没有NGA的页面框架，本体按出错处理加了固定的上边距，改为按表头与表尾的实际高度留出空间
            // 第一行(提示信息、页面标题)与小标题加粗
            const style = document.createElement('style')
            style.textContent = `
            ${body} {margin:0 !important;padding:0 !important;}
            ${body} #page_default_container {display:block;margin:0;padding:0;}
            ${body} #hld__excel-rows {margin:${top}px 0 ${footer ? footer.offsetHeight : 0}px;counter-reset:hld-row;}
            ${body} .hld__excel-row {${row}${text}line-height:20px;}
            ${body} .hld__excel-row::before {${rowHeader}}
            ${body} #hld__excel-rows > .hld__excel-row:first-child, ${body} .hld__excel-row-title {font-weight:bold !important;}
            ${body} .hld__excel-row h2, ${body} .hld__excel-row h4 {display:inline;margin:0;padding:0;border:none;background:none;font:inherit;color:inherit;}
            ${body} .hld__excel-row-empty {display:none !important;}
            `
            document.head.appendChild(style)
            this.rowsStyleReady = true
            return true
        },
        /**
         * 收藏与回复列表: 修正本体的Excel模式在收藏列表与"我的回复"中遗留的NGA原有样式
         * 样式均以Excel模式的body class为前提，切换模式后自动生效或恢复，只需生成一次
         */
        renderListFix() {
            // 本体保存插件配置后需刷新页面生效
            if (this.listFixStyleReady || !this.pluginSettings.listFixEnabled) return
            if (!document.body.classList.contains('hld__excel-body') || !this.mainScript.isThreads()) return
            const measured = this.measureSheet()
            if (!measured) return
            const {lineColor, button, buttonHover} = measured
            const body = 'body.hld__excel-body'
            // 收藏夹切换栏(#sub_forums)的"默认"、"修改"按钮为内联背景色的彩色按钮；
            // 收藏列表每行的行号单元格右上角有一个半透明的勾选框(用于批量操作)，会压住行号，改为鼠标悬停该行或已勾选时才显示；
            // "我的回复"中每条回复内容的上方有一条棕色分隔线
            const style = document.createElement('style')
            style.textContent = `
            ${body} #sub_forums .small_colored_text_btn {${button}margin:0 0 0 4px !important;padding:0 6px !important;line-height:20px !important;}
            ${body} #sub_forums .small_colored_text_btn:hover {${buttonHover}}
            ${body} .topicrow .c1 input[type="checkbox"] {opacity:0 !important;}
            ${body} .topicrow:hover .c1 input[type="checkbox"], ${body} .topicrow .c1 input[type="checkbox"]:checked {opacity:1 !important;}
            ${body} .topic_content .postcontent {border-top-color:${lineColor} !important;}
            `
            document.head.appendChild(style)
            this.listFixStyleReady = true
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
