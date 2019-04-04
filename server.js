const express = require('express');
const line = require('@line/bot-sdk');
//ポートの制御
const PORT = process.env.PORT || 3000;
//キーを別ファイルから読み込み
const setting = require('./setting');

const app = express();
//middleware: Expressの関数 req,resを呼び出すときに使う
app.post('/webhook', line.middleware(setting.config), (req, res) => {
  //Promese: 非同期処理 callback地獄を避ける
  Promise
    //all: 非同期処理が成功した場合にcallbackする 引数は監視するオブジェクト郡(配列)  
    .all(req.body.events.map(handleEvent))
    //全部成功->thenを実行 resultをjson形式で戻す
    .then((result) => res.json(result));
});

const client = new line.Client(setting.config);
const handleEvent = event => {
  // console.log(event);
  //メッセージでなかったらnullを返して終了
  if (event.type !== 'message') {
    //スタンプでもテキストでもなかったらnullを返す
    if(event.message.type !== 'sticker' && event.message.type !== 'text') {
      return Promise.resolve(null);
    }
  }

  if(event.message.type === 'text') {

    let replyText = '';
    if(event.message.text === 'こんにちは') {
      replyText = 'こんばんはの時間ですよ';
    } else {
      replyText = 'うざ';
    }

    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: replyText,
    });
    
  }

  if(event.message.type === 'sticker') {
    return client.replyMessage(event.replyToken, {
      type: 'sticker',
      packageId: 2,
      stickerId: 163,
    });
  }

}


app.listen(PORT);
console.log(`Server running at ${PORT}`);
