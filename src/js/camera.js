/**
 * @file camera.js
 * @description 一個現代化的相機控制模組，提供一個可配置的相機處理器工廠。
 * @version 2.0.0
 * @date 2025-06-12
 */

// 假設您的 Swal 提示函式也已經被獨立到一個 ui.js 模組中
import { showLoadingSwal, closeLoadingSwal } from './starlite.js'

// ===================================================================
//  1. 模組級別的設定與 Polyfill
// ===================================================================

// 錯誤訊息映射表
const ERROR_MESSAGES = {
    OverconstrainedError:
        '硬體不支援或發生錯誤，請重新整理網頁。\nHardware not supported or an error occurred. Please refresh the page.',
    AbortError: '瀏覽器或系統中止了操作，請確認相機權限。\nThe operation was aborted. Please check camera permissions.',
    SecurityError:
        '相機權限被拒絕，請允許相機權限以進行體驗。\nCamera access was denied. Please allow camera permissions to proceed.',
    NotAllowedError:
        '相機權限被拒絕，請允許相機權限以進行體驗。\nCamera access was denied. Please allow camera permissions to proceed.',
    NotFoundError: '找不到指定的相機裝置。\nCould not find the specified camera device.',
}

// 執行一次性的 Polyfill 設定，確保舊版瀏覽器相容性
;(function initializeGetUserMediaPolyfill() {
    if (typeof navigator.mediaDevices === 'undefined') {
        navigator.mediaDevices = {}
    }
    if (typeof navigator.mediaDevices.getUserMedia === 'undefined') {
        navigator.mediaDevices.getUserMedia = function (constraints) {
            const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia
            if (!getUserMedia) {
                return Promise.reject(new Error('getUserMedia is not implemented in this browser'))
            }
            return new Promise((resolve, reject) => {
                getUserMedia.call(navigator, constraints, resolve, reject)
            })
        }
    }
})()

// ===================================================================
//  2. 相機處理器工廠函式 (Camera Handler Factory Function)
// ===================================================================

/**
 * 建立一個相機處理器實例，用於控制特定的 <video> 元素。
 * @param {object} config - 處理器設定
 * @param {HTMLVideoElement} config.videoElement - 要綁定相機畫面的 <video> DOM 元素。
 * @returns {object} 包含所有相機控制方法的物件。
 */
export function createCameraHandler(config) {
    const { videoElement } = config

    if (!(videoElement instanceof HTMLVideoElement)) {
        throw new Error('Configuration error: `videoElement` must be a valid HTMLVideoElement.')
    }

    // 每個相機處理器實例都有自己獨立的狀態
    const cameraState = {
        isEnabled: false,
        wasEnabled: false,
        stream: null,
    }

    /**
     * 將相機串流渲染到指定的 video 元素上 (內部函式)。
     */
    function _renderStreamToVideo(stream, afterOpen) {
        cameraState.stream = stream
        videoElement.srcObject = stream
        videoElement.onloadedmetadata = () => {
            videoElement.play()
            closeLoadingSwal()
            cameraState.isEnabled = true
            console.log('Camera opened and streaming.')
            if (afterOpen) afterOpen()
        }
    }

    /**
     * 處理開啟相機時發生的錯誤 (內部函式)。
     */
    function _handleCameraError(err, onError) {
        closeLoadingSwal()
        cameraState.isEnabled = false
        const errorMessage = ERROR_MESSAGES[err.name] || `An unexpected error occurred: ${err.name}`
        console.error('Camera Error:', err)
        // 您可以將 showErrorSwal 也傳入或直接使用
        // showErrorSwal('相機開啟失敗', errorMessage);
        if (onError) onError(err)
    }

    /**
     * 停止當前的相機串流 (內部函式)。
     */
    function _internalStopStream() {
        if (cameraState.stream) {
            cameraState.stream.getTracks().forEach((track) => track.stop())
            cameraState.stream = null
            cameraState.isEnabled = false
            console.log('Camera stream stopped.')
        }
    }

    // --- 公開的 API 方法 ---

    /**
     * 開啟相機。
     * @param {object} [options={}] - 開啟選項
     * @param {'user' | 'environment'} [options.cameraType='environment'] - 相機類型
     * @param {function} [options.afterOpen] - 成功開啟後的回呼
     * @param {function} [options.onError] - 發生錯誤時的回呼
     */
    async function open(options = {}) {
        const { cameraType = 'environment', afterOpen, onError } = options

        showLoadingSwal('相機開啟中…')
        _internalStopStream() // 先確保舊的串流已關閉

        const constraints = { video: { facingMode: cameraType } }

        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints)
            _renderStreamToVideo(stream, afterOpen)
        } catch (err) {
            _handleCameraError(err, onError)
        }
    }

    /**
     * 完全停止相機串流並重設狀態。
     */
    function stop() {
        _internalStopStream()
        cameraState.wasEnabled = false
    }

    /**
     * 暫停相機串流 (實際上是停止，但記錄狀態以便恢復)。
     */
    function pause() {
        if (cameraState.isEnabled) {
            _internalStopStream()
            cameraState.wasEnabled = true
        }
    }

    /**
     * 如果相機先前是被暫停的，則恢復相機串流。
     * @param {object} [options={}] - 選項，同 open()
     */
    function resume(options = {}) {
        if (cameraState.wasEnabled) {
            console.log('Resuming camera stream...')
            cameraState.wasEnabled = false // 重置狀態
            open(options)
        }
    }

    // 回傳一個物件，包含所有我們希望從外部呼叫的方法
    return {
        open,
        stop,
        pause,
        resume,
        // 也可提供讀取狀態的 getter 函式，避免外部直接修改狀態
        getIsEnabled: () => cameraState.isEnabled,
        getWasEnabled: () => cameraState.wasEnabled,
    }
}
