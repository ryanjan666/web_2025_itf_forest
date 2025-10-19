/**
 * @file starlite.js
 * @description 一個現代化的 API 客戶端模組，提供通用工具和一個可配置的 API 客戶端工廠。
 * @version 2.0.0
 * @date 2025-06-12
 */

import Swal from 'sweetalert2'

// ===================================================================
//  1. 獨立的通用工具函式 (Stateless Utility Functions)
//  這些函式不依賴任何外部設定，可以獨立匯出使用。
// ===================================================================

/**
 * 顯示 Loading 提示視窗。
 * @param {string} [msg='處理中...'] - 顯示的訊息
 */
export function showLoadingSwal(msg = '處理中...') {
    Swal.fire({
        title: msg,
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
    })
}

/**
 * 顯示錯誤提示視窗。
 * @param {string} title - 錯誤標題
 * @param {string} [text] - 錯誤內文
 */
export function showErrorSwal(title, text) {
    Swal.fire({
        icon: 'error',
        title: title,
        text: text,
    })
}

/**
 * 關閉目前所有 SweetAlert2 視窗。
 */
export function closeLoadingSwal() {
    Swal.close()
}

/**
 * 將 Data URL 轉換為 Blob 物件 (使用 fetch API，更簡潔可靠)。
 * @param {string} dataUrl - Data URL 字串
 * @returns {Promise<Blob>}
 */
export async function dataURLtoBlob(dataUrl) {
    const response = await fetch(dataUrl)
    return await response.blob()
}

/**
 * 取得網址中的查詢參數。
 * @param {string} param - 參數名稱
 * @returns {string | null}
 */
export function getQueryParam(param) {
    return new URLSearchParams(window.location.search).get(param)
}

/**
 * 取得 Cookie。
 * @param {string} name - Cookie 名稱
 * @returns {string | null}
 */
export function getCookie(name) {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1')}=([^;]*)`))
    return match ? decodeURIComponent(match[1]) : null
}

/**
 * 設定 Cookie。
 * @param {string} name - Cookie 名稱
 * @param {string} value - Cookie 值
 * @param {number} [maxAge=604800] - 有效時間 (秒)，預設為 7 天
 */
export function setCookie(name, value, maxAge = 60 * 60 * 24 * 7) {
    // 增加 secure 標籤，要求只在 HTTPS 連線下傳送 cookie
    document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax; secure`
}

/**
 * 刪除 Cookie。
 * @param {string} name - Cookie 名稱
 */
export function deleteCookie(name) {
    // 將 Max-Age 設為負值是更現代的刪除方式
    document.cookie = `${name}=; Max-Age=-1; path=/;`
}

// ===================================================================
//  2. API 客戶端工廠函式 (API Client Factory Function)
// ===================================================================

/**
 * 建立一個 API 客戶端實例。
 * @param {object} config - 客戶端設定
 * @param {string} config.baseUrl - API 的基礎 URL (例如 'https://your-server.com/')
 * @param {string} config.actid - 活動 ID
 * @param {function} config.passwordProvider - 一個提供密碼的函式，增加安全性。
 * @returns {{checkAndGetToken: function(): Promise<string>, fetchToken: function(): Promise<any>, postData: function(string, (object|FormData), object): Promise<any>}} 包含所有 API 方法的客戶端物件
 */
export function createApiClient(config) {
    const { baseUrl, actid, passwordProvider } = config
    const tokenCookieName = `${actid}_token`

    if (!baseUrl || !actid || !passwordProvider) {
        throw new Error('ApiClient configuration is incomplete. Required: baseUrl, actid, passwordProvider.')
    }

    /**
     * 核心 API 請求函式 (內部使用，不匯出)
     */
    async function apiFetch(endpoint, options = {}) {
        const { body, method = 'POST', needsToken = true, retry = true } = options

        const headers = new Headers({ Accept: 'application/json' })

        if (needsToken) {
            const token = getCookie(tokenCookieName)
            if (!token) throw new Error('Unauthorized') // 由上層邏輯處理
            headers.append('Authorization', `Bearer ${token}`)
        }

        const isFormData = body instanceof FormData
        if (!isFormData && body) {
            headers.append('Content-Type', 'application/json')
        }

        try {
            const fullUrl = new URL(endpoint, baseUrl).href
            const response = await fetch(fullUrl, {
                method: method,
                headers: headers,
                body: isFormData ? body : body ? JSON.stringify(body) : null,
            })

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Could not read error response.')
                throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`)
            }

            const data = await response.json()

            if (data.status === false && data.msg === 'Unauthorized' && retry) {
                console.warn('Token expired or invalid. Attempting to refresh...')
                deleteCookie(tokenCookieName)
                const newTokenData = await fetchToken()
                setCookie(tokenCookieName, newTokenData.token)
                return apiFetch(endpoint, { ...options, retry: false })
            }
            return data
        } catch (error) {
            console.error(`API Fetch Error at endpoint "${endpoint}":`, error)
            showErrorSwal('網路或伺服器錯誤', error.message)
            throw error
        }
    }

    /**
     * 從伺服器獲取新的 Token。
     */
    function fetchToken() {
        // ❗❗❗ 警告：passwordProvider 只是將密碼的來源從這裡移到外部，
        // 但如果外部仍然是寫死的字串，安全風險依然存在。
        // 正確作法應確保密碼的傳遞與儲存全程安全。
        const password = passwordProvider()
        return postData('api/auth_token_get', { actid, pwd: password }, { needsToken: false, retry: false })
    }

    /**
     * 檢查 Token 是否存在，若不存在則自動獲取。
     * @returns {Promise<string>} 成功時回傳 token
     */
    async function checkAndGetToken() {
        let token = getCookie(tokenCookieName)
        if (token) {
            return token
        }

        try {
            const tokenData = await fetchToken()
            if (tokenData.status) {
                token = tokenData.token
                setCookie(tokenCookieName, token)
                return token
            } else {
                throw new Error(tokenData.msg || 'Failed to get a valid token.')
            }
        } catch (error) {
            showErrorSwal('授權失敗', error.message)
            throw error
        }
    }

    /**
     * 專門用於 POST 資料的輔助函式。
     */
    function postData(endpoint, data, options = {}) {
        return apiFetch(endpoint, { ...options, body: data, method: 'POST' })
    }

    // 將需要暴露給外部的函式，作為物件回傳
    return {
        checkAndGetToken,
        fetchToken,
        postData,
    }
}
