# JSBOT
## 依存関係
* **Node.js**  
* **Express**  
* **LineAPI**  

## コマンド
```bash
$ ngrok http 3000
$ babel-node test.js
```

## コードメモ
```javascript
// プッシュメッセージを送る
client.pushMessage('送信先のID', [メッセージオブジェクトの配列], 通知するかどうか);
// 応答メッセージを送る
client.replyMessage('応答トークン', [メッセージオブジェクトの配列], 通知するかどうか);
```