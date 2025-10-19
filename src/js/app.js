import $ from 'jquery'
import Swal from 'sweetalert2'

//#region 參數設定
//  ＊伺服器位置
// const server = 'http://127.0.0.1:8000/'
const server = 'https://starlitetw.com/'
//  ＊活動id，通常讓token辨識使用
const actid = 'sample_web_basic'
//  ＊sweetalert2按鈕顏色
const swal_btn_color = '#000'
//#endregion

//#region 網頁載入完成後的初始化
document.addEventListener('DOMContentLoaded', () => {
    // 防止多點觸控
    preventMultiTouch()
    // 初始化頁面
    initializePage()
    // 初始化按鈕監聽
    initButtonListen()
})
//#endregion

//#region 防止多點觸控
function preventMultiTouch() {
    if (/Mobi|Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)) {
        document.addEventListener(
            'touchstart',
            (event) => {
                if (event.touches && event.touches.length > 1) {
                    event.preventDefault() // 阻止多點觸控的預設行為
                }
            },
            { passive: false }
        )
    }
}
//#endregion

//#region ＊初始化頁面
function initializePage() {}
//#endregion

//#region ＊初始化按鈕監聽
function initButtonListen() {}

//#region GA 紀錄
export function GArecord(msg) {
    try {
        if (typeof gtag === 'function') {
            gtag('event', msg)
        }
    } catch (e) {
        // 可選：記錄錯誤或忽略
        console.log('GA error:', e)
    }
    console.log('GA:', msg) // 紀錄 GA 事件
}
//#endregion
