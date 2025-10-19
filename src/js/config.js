/**
 * 設定檔與資源管理模組
 * 功能：集中管理應用程式的所有設定、資源和 DOM 元素
 * - 圖片資源的統一匯入和管理
 * - 內容設定參數
 * - DOM 元素的統一存取介面
 * - API 伺服器設定和應用程式 ID
 * - Cookie 設定
 */
import img_game_item_1_get from '../images/ui/game_item_1_get.png'
import img_game_item_2_get from '../images/ui/game_item_2_get.png'
import img_game_item_3_get from '../images/ui/game_item_3_get.png'
import img_game_item_4_get from '../images/ui/game_item_4_get.png'

import img_game_item_1_unget from '../images/ui/game_item_1_unget.png'
import img_game_item_2_unget from '../images/ui/game_item_2_unget.png'
import img_game_item_3_unget from '../images/ui/game_item_3_unget.png'
import img_game_item_4_unget from '../images/ui/game_item_4_unget.png'

import img_game_redeem from '../images/ui/game_redeem.png'
import img_game_unredeem from '../images/ui/game_unredeem.png'

//#region 素材圖片
export const ARRAY_IMG_ITEM = [
	{
		get: img_game_item_1_get,
		unget: img_game_item_1_unget,
	},
	{
		get: img_game_item_2_get,
		unget: img_game_item_2_unget,
	},
	{
		get: img_game_item_3_get,
		unget: img_game_item_3_unget,
	},
	{
		get: img_game_item_4_get,
		unget: img_game_item_4_unget,
	},
]

export const OBJ_IMG_REDEEM = {
	can_redeem: img_game_redeem,
	cannot_redeem: img_game_unredeem,
}
//#endregion

//#region 可手動調整參數設定
//  ＊伺服器位置
// const SERVER = 'http://127.0.0.1:8000/'
export const SERVER = 'https://starlitetw.com/'
//  ＊活動id，通常讓token辨識使用
export const ACTID = 'web_2025_itf_forest'
//  ＊sweetalert2按鈕顏色
export const swal_btn_color = '#000'
export const QR_CODE_MAP = {
	h4f9k2w7p1xR: 'item_1',
	z8m3n6v2b9qE: 'item_2',
	a1s7d4f2g9kL: 'item_3',
	p5o8i3u7y2tW: 'item_4',
}
//#endregion

//#region 不可手動調整參數設定
export const COOKIE_CONFIG = {
	USER_ID_NAME: ACTID + '_user_id',
	ITEM_1_STATE: ACTID + '_item_1_state',
	ITEM_2_STATE: ACTID + '_item_2_state',
	ITEM_3_STATE: ACTID + '_item_3_state',
	ITEM_4_STATE: ACTID + '_item_4_state',
	REDEEM_STATE: ACTID + '_redeem_state',
	EXPIRES_DAYS: 7,
}
//#endregion

//#region DOM 元素
export const DOM = {
	page_start: document.getElementById('div_start'),
	page_game: document.getElementById('div_game'),
	page_redeem: document.getElementById('div_redeem'),
	btn_start_go: document.getElementById('btn_start_go'),
	btn_game_redeem: document.getElementById('btn_game_redeem'),
	btn_redeem_confirm: document.getElementById('btn_redeem_confirm'),
	btn_redeem_cancel: document.getElementById('btn_redeem_cancel'),
	item_1: document.getElementById('item_1'),
	item_2: document.getElementById('item_2'),
	item_3: document.getElementById('item_3'),
	item_4: document.getElementById('item_4'),
	redeem_status: document.getElementById('redeem_status'),
}
//#endregion
