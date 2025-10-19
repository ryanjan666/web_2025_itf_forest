/**
 * 使用者介面控制模組
 * 功能：頁面切換、載入效果、獎項顯示等 UI 操作
 * - 單頁應用程式的頁面切換邏輯 (switchPage)
 * - 載入中動畫的顯示與隱藏
 * - 圖片的動態顯示和錯誤處理
 */
import $ from 'jquery'
import Swal from 'sweetalert2'
import { DOM, swal_btn_color, ARRAY_IMG_ITEM } from './config.js'

/**
 * 初始化頁面顯示狀態
 * 隱藏所有頁面，然後顯示指定的初始頁面
 */
export function initializePage() {
	// 隱藏所有 'page_' 開頭的 div
	Object.keys(DOM).forEach((key) => {
		if (key.startsWith('page_')) {
			DOM[key].style.display = 'none'
		}
	})
}

/**
 * 切換頁面
 * 使用淡入淡出效果切換顯示不同的頁面 div
 * @param {string} pageName - 要切換到的頁面名稱 (例如 'start', 'game')
 * @param {number} [fadeSpeed=500] - 淡入淡出的速度 (毫秒)
 */
export function switchPage(pageName, fadeSpeed = 500) {
	// 淡出所有 'page_' 開頭的 div
	Object.keys(DOM).forEach((key) => {
		if (key.startsWith('page_')) {
			$(DOM[key]).fadeOut(fadeSpeed)
		}
	})
	// 在淡出動畫結束後，淡入目標頁面
	setTimeout(() => {
		const targetPage = DOM[`page_${pageName}`]
		if (targetPage) {
			$(targetPage).fadeIn(fadeSpeed)
		}
	}, fadeSpeed)
}

/**
 * 開啟頁面
 * 使用淡入效果開啟顯示不同的頁面 div
 * @param {string} pageName - 要淡入的頁面名稱 (例如 'start', 'game')
 * @param {number} [fadeSpeed=500] - 淡入的速度 (毫秒)
 */
export function openPage(pageName, fadeSpeed = 500) {
	const targetPage = DOM[`page_${pageName}`]
	if (targetPage) {
		$(targetPage).fadeIn(fadeSpeed)
	}
}

/**
 * 關閉頁面
 * 使用淡出效果關閉顯示不同的頁面 div
 * @param {string} pageName - 要淡出的頁面名稱 (例如 'start', 'game')
 * @param {number} [fadeSpeed=500] - 淡出的速度 (毫秒)
 */
export function closePage(pageName, fadeSpeed = 500) {
	const targetPage = DOM[`page_${pageName}`]
	if (targetPage) {
		$(targetPage).fadeOut(fadeSpeed)
	}
}

/**
 * 隱藏載入中動畫
 * 關閉 SweetAlert2 彈出視窗
 */
export function hideLoading() {
	Swal.close()
}

/**
 * 使用淡入淡出動畫更新單個集點項目的圖片
 * @param {string} itemKey - 項目鑰匙，例如 'item_1'
 */
export function updateItemImageWithAnimation(itemKey) {
	const itemIndex = parseInt(itemKey.split('_')[1]) - 1
	const domElement = DOM[itemKey]
	const newImageSrc = ARRAY_IMG_ITEM[itemIndex].get

	if (domElement && domElement.src !== newImageSrc) {
		// 淡出
		$(domElement).hide()
		// 更換圖片來源
		domElement.src = newImageSrc
		// 淡入
		$(domElement).fadeIn(1500)
	}
}

/**
 * 動態啟用一個按鈕的點擊縮放效果
 * @param {HTMLElement} button - 要啟用的按鈕 DOM 元素
 */
export function enableButtonClickEffect(button) {
	if (button) {
		button.setAttribute('data-enable', 'true')
		button.classList.add('is_can_click')
	}
}

/**
 * 停用按鈕的點擊縮放效果
 * @param {HTMLElement} button - 要停用的按鈕 DOM 元素
 */
export function disableButtonClickEffect(button) {
	if (button) {
		button.setAttribute('data-enable', 'false')
		button.classList.remove('is_can_click')
	}
}

/**
 * 為指定的按鈕加上點擊縮放的事件監聽
 * @param {HTMLElement} button - 要加上效果的按鈕 DOM 元素
 */
export function applyButtonScaleEffect(button) {
	// 定義事件處理函式
	const listener = () => {
		// 只有在 data-enable 為 true 時才觸發縮放
		if (button.dataset.enable === 'true') {
			button.classList.add('center-button-scale')
			button.addEventListener('animationend', () => button.classList.remove('center-button-scale'), { once: true })
		}
	}

	// 同時監聽滑鼠點擊和觸控事件
	;['mousedown', 'touchstart'].forEach((eventType) => {
		button.addEventListener(eventType, listener)
	})
}
