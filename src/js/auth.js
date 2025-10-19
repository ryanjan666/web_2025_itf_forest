/**
 * 使用者認證模組
 * 功能：登入流程、表單驗證、使用者狀態管理
 * - 格式驗證和表單狀態更新
 * - 自動登入和手動登入處理
 * - Cookie 資料的儲存與清除
 * - 隱藏的開發者清除功能
 */
import { DOM, COOKIE_CONFIG, swal_btn_color, QR_CODE_MAP, ARRAY_IMG_ITEM, OBJ_IMG_REDEEM } from './config.js'
import { getCookie, setCookie, deleteCookie, getUrlParam, GArecord } from './utils.js'
import { state } from './app.js'
import { enableButtonClickEffect, disableButtonClickEffect, updateItemImageWithAnimation, switchPage, openPage, closePage } from './ui.js'

/**
 * 檢查儲存的登入資訊
 * 應用程式啟動時檢查 Cookie 中是否有使用者資料，如果有則自動填入並嘗試自動登入
 */
export function checkSavedLoginInfo() {
	// 從 Cookie 讀取先前儲存的user id
	const saved_user_id = getCookie(COOKIE_CONFIG.USER_ID_NAME)

	if (saved_user_id) {
		const saved_item_1_state = getCookie(COOKIE_CONFIG.ITEM_1_STATE)
		const saved_item_2_state = getCookie(COOKIE_CONFIG.ITEM_2_STATE)
		const saved_item_3_state = getCookie(COOKIE_CONFIG.ITEM_3_STATE)
		const saved_item_4_state = getCookie(COOKIE_CONFIG.ITEM_4_STATE)
		const saved_redeemed_state = getCookie(COOKIE_CONFIG.REDEEM_STATE)

		// 設定全域user id
		state.user_id = saved_user_id
		// 設定集點狀態
		state.item_get_status.item_1 = saved_item_1_state === 'true'
		state.item_get_status.item_2 = saved_item_2_state === 'true'
		state.item_get_status.item_3 = saved_item_3_state === 'true'
		state.item_get_status.item_4 = saved_item_4_state === 'true'
		state.item_get_status.redeemed = saved_redeemed_state === 'true'

		// 表示是已登入過的使用者
		return true
	}

	// 表示是新使用者
	return false
}

/**
 * 建立新使用者並儲存 Cookie
 * 當新使用者首次點擊開始時呼叫
 */
export function createUserAndLogin() {
	// 產生新的 user_id 並設定預設值
	const new_user_id = 'user_' + Date.now() + Math.random().toString(36).substring(2, 9)
	state.user_id = new_user_id
	state.item_get_status.item_1 = false
	state.item_get_status.item_2 = false
	state.item_get_status.item_3 = false
	state.item_get_status.item_4 = false
	state.item_get_status.redeemed = false

	// 將新產生的資訊存入 Cookie
	setCookie(COOKIE_CONFIG.USER_ID_NAME, new_user_id, COOKIE_CONFIG.EXPIRES_DAYS)
	setCookie(COOKIE_CONFIG.ITEM_1_STATE, false, COOKIE_CONFIG.EXPIRES_DAYS)
	setCookie(COOKIE_CONFIG.ITEM_2_STATE, false, COOKIE_CONFIG.EXPIRES_DAYS)
	setCookie(COOKIE_CONFIG.ITEM_3_STATE, false, COOKIE_CONFIG.EXPIRES_DAYS)
	setCookie(COOKIE_CONFIG.ITEM_4_STATE, false, COOKIE_CONFIG.EXPIRES_DAYS)
	setCookie(COOKIE_CONFIG.REDEEM_STATE, false, COOKIE_CONFIG.EXPIRES_DAYS)
}

/** 檢查並更新集點狀態的顯示
 * 根據使用者的集點狀態更新頁面上的圖片和按鈕狀態
 * @param {object} user_state - 使用者的集點狀態物件
 */
export async function checkItemState(user_state) {
	try {
		// 更新集點狀態
		if (user_state.item_get_status.item_1) {
			DOM.item_1.src = ARRAY_IMG_ITEM[0].get
		} else {
			DOM.item_1.src = ARRAY_IMG_ITEM[0].unget
		}

		if (user_state.item_get_status.item_2) {
			DOM.item_2.src = ARRAY_IMG_ITEM[1].get
		} else {
			DOM.item_2.src = ARRAY_IMG_ITEM[1].unget
		}

		if (user_state.item_get_status.item_3) {
			DOM.item_3.src = ARRAY_IMG_ITEM[2].get
		} else {
			DOM.item_3.src = ARRAY_IMG_ITEM[2].unget
		}

		if (user_state.item_get_status.item_4) {
			DOM.item_4.src = ARRAY_IMG_ITEM[3].get
		} else {
			DOM.item_4.src = ARRAY_IMG_ITEM[3].unget
		}

		if (user_state.item_get_status.item_1 && user_state.item_get_status.item_2 && user_state.item_get_status.item_3 && user_state.item_get_status.item_4 && !user_state.item_get_status.redeemed) {
			DOM.btn_game_redeem.src = OBJ_IMG_REDEEM.can_redeem
			enableButtonClickEffect(DOM.btn_game_redeem)
		} else {
			DOM.btn_game_redeem.src = OBJ_IMG_REDEEM.cannot_redeem
			disableButtonClickEffect(DOM.btn_game_redeem)
		}
	} catch (error) {
		console.error('Check item state error:', error)
	}
}

/**
 * 處理 參數結果
 * 檢查 URL 參數，如果匹配，則更新集點狀態
 * @returns {boolean} - 如果成功獲得新集點則返回 true，否則返回 false
 */
export function handleTokenVerify() {
	const token = getUrlParam('token')
	if (!token) return false

	const item_key = QR_CODE_MAP[token]
	if (item_key && !state.item_get_status[item_key]) {
		state.item_get_status[item_key] = true
		// 更新 Cookie
		const cookieNameKey = `ITEM_${item_key.split('_')[1]}_STATE`
		setCookie(COOKIE_CONFIG[cookieNameKey], true, COOKIE_CONFIG.EXPIRES_DAYS)

		// 更新 UI 顯示 (使用帶有動畫的新函式)
		updateItemImageWithAnimation(item_key)

		// 從 URL 中移除 token 參數，避免重新整理時重複觸發
		const newUrl = window.location.protocol + '//' + window.location.host + window.location.pathname
		window.history.replaceState({ path: newUrl }, '', newUrl)
		// 關閉提示後，重新檢查一次所有項目狀態，特別是兌換按鈕
		checkItemState(state)

		return true // 表示有成功集點
	}
	return false // 表示沒有集點或點已存在
}

export function handelRedeemClick() {
	if (state.item_get_status.item_1 && state.item_get_status.item_2 && state.item_get_status.item_3 && state.item_get_status.item_4 && !state.item_get_status.redeemed) {
		// 顯示兌換確認視窗
		openPage('redeem')
	}
}

export function handelRedeem() {
	if (state.item_get_status.item_1 && state.item_get_status.item_2 && state.item_get_status.item_3 && state.item_get_status.item_4 && !state.item_get_status.redeemed) {
		state.item_get_status.redeemed = true
		setCookie(COOKIE_CONFIG.REDEEM_STATE, true, COOKIE_CONFIG.EXPIRES_DAYS)
		DOM.btn_game_redeem.src = OBJ_IMG_REDEEM.cannot_redeem
		disableButtonClickEffect(DOM.btn_game_redeem)
		// 顯示兌換確認視窗
		closePage('redeem')
	}
}

/**
 * 清除儲存的登入資訊
 * 刪除 Cookie 並重新載入頁面
 */
export function clearSavedLoginInfo() {
	// 刪除儲存在 Cookie 中的所有使用者資料
	Object.keys(COOKIE_CONFIG).forEach((key) => {
		if (key !== 'EXPIRES_DAYS') {
			deleteCookie(COOKIE_CONFIG[key])
		}
	})

	// 重新載入頁面，回到初始狀態
	window.location.reload()
}

/**
 * 初始化隱藏的清除功能
 * 開發者工具：在遊戲選擇頁面快速點擊隱藏按鈕8次可清除所有資料
 * 用於測試和除錯
 */
export function initHiddenClearFunction() {
	// 尋找隱藏的清除按鈕
	const hiddenButton = document.getElementById('choose_hide_button')
	if (!hiddenButton) return

	// 記錄點擊次數和計時器
	let clickCount = 0
	let clickTimeout = null

	hiddenButton.addEventListener('click', () => {
		clickCount++ // 增加點擊計數

		// 清除之前的計時器
		if (clickTimeout) clearTimeout(clickTimeout)

		// 如果在短時間內點擊8次，觸發清除功能
		if (clickCount >= 8) {
			clearSavedLoginInfo() // 清除所有儲存的登入資訊
			clickCount = 0 // 重置計數器
		} else {
			// 設定3秒後重置計數器
			clickTimeout = setTimeout(() => {
				clickCount = 0
			}, 3000)
		}
	})
}
