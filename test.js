const express = require('express');
const line = require('@line/bot-sdk');
//ポートの制御
const PORT = process.env.PORT || 3000;
//キーを別ファイルから読み込み
const setting = require('./setting');
//形態素解析の読み込み
const kuromoji = require('kuromoji');

const app = express();
//middleware: Expressの関数 req,resを呼び出すときに使う
app.post('/webhook', line.middleware(setting.config), (req, res) => {
  //Promise: 非同期処理 callback地獄を避ける
  Promise
    //all: 非同期処理が成功した場合にcallbackする 引数は監視するオブジェクト郡(配列)  
    .all(req.body.events.map(handleEvent))
    //全部成功->thenを実行 resultをjson形式で戻す
    .then((result) => res.json(result));
});


const client = new line.Client(setting.config);
const handleEvent = event => {
  //メッセージでなかったらnullを返して終了
  if (event.type !== 'message') {
    //スタンプでもテキストでもなかったらnullを返す
    if(event.message.type !== 'sticker' && event.message.type !== 'text') {
      return Promise.resolve(null);
    }
  }

  if(event.message.type === 'text') {
    
    let replyText = '';

    //形態素解析の辞書の設定
    const builder = kuromoji.builder({
      dicPath: 'node_modules/kuromoji/dict/'
    });


    //形態素解析する関数
    const analysis = async(err, tokenizer) => {

        if(err) { throw err; }
        await new Promise(resolve => {
            let string = event.message.text;
            let result = string.split(/\s+/);
            let path = [];
            // let replyText = '';
            for(let i = 0; i < result.length; i++) {
                path[i] = tokenizer.tokenize(result[i]);
            }
            for(let i = 0; i < path.length; i++) {
                for(let j = 0; j < path[i].length; j++) {
                    replyText += path[i][j].surface_form + '\t' +path[i][j].pos+ ':' +path[i][j].pos_detail_1+'\n';
                }
            }
            console.log(replyText + 'ビルド部分');
            resolve();
        });
        reply();

    };
    // これをどうにかする(実行する関数?)
    builder.build(analysis);
      //返信する
      const reply = () => {

          console.log(replyText + '返信部分');
          return client.replyMessage(event.replyToken, {
              type: 'text',
              text: replyText,
          });

      };

    //Promisで非同期処理が終わるまでawitする

    //ここまで
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