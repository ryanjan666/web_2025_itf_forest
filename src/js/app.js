/**
 * 主應用程式入口點
 * 功能：應用程式初始化、全域狀態管理、事件監聽器設定
 * - 管理應用程式生命週期和頁面初始化
 * - 統一處理所有按鈕的事件綁定和視覺效果
 * - 提供全域狀態物件供其他模組使用
 * - 防止多點觸控和頁面捲動（行動端優化）
 */
import { DOM } from './config.js'
import { checkSavedLoginInfo, createUserAndLogin, checkItemState, handleTokenVerify, handelRedeemClick, handelRedeem } from './auth.js'
import { initializePage, switchPage, openPage, closePage, applyButtonScaleEffect } from './ui.js'

// 全域狀態管理物件 - 儲存應用程式的重要狀態
export const state = {
	// 使用者的user id
	user_id: null,
	// 目前的集點狀態
	item_get_status: {
		item_1: false,
		item_2: false,
		item_3: false,
		item_4: false,
		redeemed: false,
	},
}

//#region 網頁載入完成後的初始化
document.addEventListener('DOMContentLoaded', async () => {
	// 防止多點觸控
	preventMultiTouch()
	// 初始化頁面
	initializePage()
	// 初始化按鈕監聽
	initButtonListen()

	// 檢查是否為已登入過的使用者
	const is_returning_user = checkSavedLoginInfo()

	if (is_returning_user) {
		// 如果是，直接顯示遊戲頁面
		DOM.page_game.style.display = 'block'
		// 檢查並顯示正確的集點狀態
		await checkItemState(state)
		// 檢查網址參數 (QR code)
		handleTokenVerify()
	} else {
		// 如果是新使用者，顯示開始頁面
		DOM.page_start.style.display = 'block'
	}
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

//#region ＊初始化按鈕監聽
function initButtonListen() {
	// === 按鈕視覺效果設定 ===
	// 為所有 id 以 'btn' 開頭的按鈕添加點擊縮放事件監聽
	document.querySelectorAll('[id^="btn"]').forEach(applyButtonScaleEffect)

	// === 觸控行為限制 ===
	// 防止頁面捲動（適用於全螢幕遊戲）
	document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false })
	// 防止手勢縮放
	document.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false })

	// === 按鈕功能監聽設定 ===
	// 開始遊戲按鈕 (新使用者流程)
	DOM.btn_start_go.addEventListener('click', async () => {
		// 1. 建立使用者資料並存入 Cookie
		createUserAndLogin()
		// 2. 切換到遊戲頁面
		switchPage('game')
		// 3. 檢查並顯示初始的集點狀態 (此時應全為 unget)
		await checkItemState(state)
		// 4. 檢查網址參數 (QR code)
		handleTokenVerify()
	})
	// 兌換按鈕
	DOM.btn_game_redeem.addEventListener('click', handelRedeemClick)
	DOM.btn_redeem_confirm.addEventListener('click', handelRedeem)
	DOM.btn_redeem_cancel.addEventListener('click', () => closePage('redeem'))
}
//#endregion
