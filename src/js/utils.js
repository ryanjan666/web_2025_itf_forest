/**
 * 工具函式模組
 * 功能：提供通用的輔助函式
 * - Google Analytics 事件追蹤
 * - URL 參數解析
 * - Cookie 操作（設定、讀取、刪除）
 * - 跨模組共用的工具函式
 */
export function GArecord(msg) {
	try {
		if (typeof gtag === 'function') {
			gtag('event', msg)
		}
	} catch (e) {
		console.log('GA error:', e)
	}
	console.log('GA:', msg)
}

export function getUrlParam(name) {
	const urlParams = new URLSearchParams(window.location.search)
	return urlParams.get(name)
}

export function setCookie(name, value, days) {
	const expires = new Date()
	expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
	document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

export function getCookie(name) {
	const nameEQ = name + '='
	const ca = document.cookie.split(';')
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i]
		while (c.charAt(0) === ' ') c = c.substring(1, c.length)
		if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
	}
	return null
}

export function deleteCookie(name) {
	document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
}
