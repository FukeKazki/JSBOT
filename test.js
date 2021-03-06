import express from 'express';
import * as line from '@line/bot-sdk';
//ポートの制御
const PORT = process.env.PORT || 3000;
//キーを別ファイルから読み込み
import config  from './setting';
//形態素解析の読み込み
import kuromoji from 'kuromoji';
// ファイル操作の読み込み
import fs from 'fs';
const app = express();
const client = new line.Client(config);
const message = {
    type: 'text',
    text: 'Hello World!'
};

// client.pushMessage('Ubb6a383637380981e03b1eaf851199d8', message);
// client.getProfile('Ubb6a383637380981e03b1eaf851199d8')
//     .then(profile => {
//         console.log(profile);
//     });
//middleware: Expressの関数 req,resを呼び出すときに使う
app.post('/webhook', line.middleware(config), (req, res) => {
    console.log(req.body.events);
    Promise
    //all: 非同期処理が成功した場合にcallbackする 引数は監視するオブジェクト郡(配列)
        .all(req.body.events.map(handleEvent))
        //全部成功->thenを実行 resultをjson形式で戻す
        .then((result) => res.json(result));
});


const handleEvent = event => {
    //メッセージでなかったらnullを返して終了
    if (event.type !== 'message') {
        //スタンプでもテキストでもなかったらnullを返す
        if(event.message.type !== 'sticker' && event.message.type !== 'text') {
            return Promise.resolve(null);
        }
    }

    if(event.message.type === 'text') {
        // fs.appendFile('out.txt', event.message.text+"\n", (err, data) => {
        //    if(err) console.log(err);
        //    else console.log('write end');
        // });
        // fs.readFile('out.txt', 'utf8', (err, data) => {
        //    if(err) throw err;
        //    let lines = data.split("\n");
        //    console.log(lines);
        // });
        //
        fs.readFile('test.json', 'utf8', (err, data) => {
            if(err) throw err;
            JSON.parse(data, (key, value) => {
               if(key === event.message.text) {
                   client.replyMessage(event.replyToken, {
                       type: 'text',
                       text: value,
                   });
               }
            });
        });

        if(event.message.text === '大園桃子') {
            return client.replyMessage(event.replyToken, {
                "type": "image",
                "originalContentUrl": "https://img.nogizaka46.com/blog/momoko.oozono/img/2019/02/05/6738863/0000.jpeg",
                "previewImageUrl": "https://i.daily.jp/gossip/2019/04/17/Images/12249930.jpg"
            });
        }
        let replyText = '';

        //形態素解析の辞書の設定
        const builder = kuromoji.builder({
            dicPath: 'node_modules/kuromoji/dict/'
        });

        const exec = async() => {
            await new Promise(resolve => {
                builder.build((err, tokenizer) => {
                    if(err) { throw err; }
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
                    resolve();
                });
            });
            await new Promise(resolve => {
                return client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: replyText,
                });
            });
        };
        exec();

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
//Memo: 起動コマンド babel-node test.js