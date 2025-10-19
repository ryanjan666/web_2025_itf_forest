# 步驟 1: 選擇一個官方的 Node.js LTS 版本作為基礎映像檔
# 我們使用 -alpine 版本，因為它的體積非常小
FROM node:20-alpine

# 步驟 2: 在容器 (Container) 內建立一個工作目錄
WORKDIR /app

# RUN apk update 是為了更新套件庫列表，確保能抓到最新的套件
# && apk add git 則是安裝 git
RUN apk update && apk add git

# 步驟 3: 複製 package.json 和 package-lock.json
# 透過只先複製這兩個檔案，可以利用 Docker 的快取機制，未來若只有程式碼變動，就不用重新安裝所有套件
COPY package*.json ./

# 步驟 4: 安裝專案依賴套件
RUN npm install

# 步驟 5: 複製專案的所有檔案到工作目錄
COPY . .

# 步驟 6: 告知 Docker，這個容器將會使用 8080 連接埠 (webpack-dev-server 預設)
EXPOSE 8080

# 步驟 7: 設定容器啟動時要執行的預設指令，也就是您原本的 npm start
CMD ["npm", "start"]