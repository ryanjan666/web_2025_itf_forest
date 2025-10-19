const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WebpackObfuscator = require('webpack-obfuscator')
const TerserPlugin = require('terser-webpack-plugin')

console.log('Current environment is: ', process.env.NODE_ENV)

//  宣告build模式
const isProduction = process.env.NODE_ENV === 'production'

//  建立插件 plugins
const plugins = [
    new MiniCssExtractPlugin({
        filename: isProduction ? 'css/[name].[contenthash].css' : 'css/[name].css',
    }),
    new HtmlWebpackPlugin({
        template: './src/index.html',
        filename: 'index.html',
        chunks: ['head', 'app'],
        inject: false, // 不自動注入js
        scriptLoading: 'defer',
    }),
]

//  建立加密 optimization
let optimization = {}

//  build模式再加密
if (isProduction) {
    plugins.push(
        new WebpackObfuscator({
            rotateStringArray: true,
            controlFlowFlattening: true,
        })
    )

    optimization = {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: true, // 刪除 console 語句
                    },
                    mangle: true, // 混淆代碼
                    format: {
                        comments: false, // 刪除註解
                    },
                },
                extractComments: false, // 移除所有註釋
            }),
        ],
    }
}

module.exports = {
    // 根據環境決定 devtool 的模式，生產環境可設為 false 或 hidden-source-map 增加安全性
    devtool: isProduction ? 'hidden-source-map' : 'source-map',
    mode: isProduction ? 'production' : 'development', // 明確指定 mode
    // 預設入口js
    entry: {
        head: './src/js/head.js',
        app: './src/js/app.js',
    },
    // 輸出js
    output: {
        path: path.resolve(__dirname, 'dist'),
        // 根據環境決定檔名，開發模式不加 hash
        filename: isProduction ? 'js/[name].[contenthash].js' : 'js/[name].js',
        // 加上 publicPath，確保開發伺服器和最終部署的路徑正確
        publicPath: isProduction ? '' : '/',
        clean: true, // 自動清空 dist
    },
    //以下是服務環境配置
    devServer: {
        //本機的區域網ip
        //host: "192.168.51.101",
        //是否執行成功後直接開啟頁面
        open: true,
        liveReload: true, // 強制啟用自動重整
        hot: false, // 禁用熱模組替換
        static: {
            directory: path.join(__dirname, 'dist'), // 告知 devServer 從哪裡提供靜態檔案
        },
    },
    // 模組載入規則
    module: {
        rules: [
            {
                // css/scss 根據環境切換 loader
                test: /\.(sass|scss|css)$/i,
                use: [
                    // 當是生產環境時，使用帶有 options 的物件來設定 loader
                    isProduction
                        ? {
                              loader: MiniCssExtractPlugin.loader,
                              options: {
                                  // 關鍵！告訴 CSS 檔案，它引用的其他資源(如圖片、字型)的路徑，
                                  // 公共路徑是相對於 CSS 檔案自己的上一層目錄。
                                  publicPath: '../',
                              },
                          }
                        : 'style-loader', // 開發環境維持不變
                    'css-loader',
                    'sass-loader',
                ],
            },
            {
                //  圖片輸出在 images 資料夾中
                test: /\.(png|jpg|jpeg|gif|svg)$/i,
                type: 'asset/resource',
                generator: {
                    filename: isProduction ? 'images/[name].[contenthash][ext]' : 'images/[name][ext]',
                },
            },
            {
                //  影片輸出在 videos 資料夾中
                test: /\.(mp4)$/i,
                type: 'asset/resource',
                generator: {
                    filename: isProduction ? 'video/[name].[contenthash][ext]' : 'video/[name][ext]',
                },
            },
            {
                //  音樂輸出在 audio 資料夾中
                test: /\.(mp3)$/i,
                type: 'asset/resource',
                generator: {
                    filename: isProduction ? 'audio/[name].[contenthash][ext]' : 'audio/[name][ext]',
                },
            },
            {
                //  模型輸出在 models 資料夾中
                test: /\.(glb)$/i,
                type: 'asset/resource',
                generator: {
                    filename: isProduction ? 'models/[name].[contenthash][ext]' : 'models/[name][ext]',
                },
            },
            {
                //  AR辨識檔用輸出在 minds 資料夾中
                test: /\.(mind)$/i,
                type: 'asset/resource',
                generator: {
                    filename: isProduction ? 'minds/[name].[contenthash].[ext]' : 'minds/[name][ext]',
                },
            },
        ],
    },
    optimization,
    plugins,
}
