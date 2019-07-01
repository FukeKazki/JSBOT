import express from 'express';
import * as line from '@line/bot-sdk';
//ポートの制御
const PORT = process.env.PORT || 3000;
//キーを別ファイルから読み込み
import config  from './setting';
//形態素解析の読み込み
import kuromoji from 'kuromoji';

const app = express();
//middleware: Expressの関数 req,resを呼び出すときに使う
app.post('/webhook', line.middleware(config), (req, res) => {
    console.log(req.body.events);
    Promise
    //all: 非同期処理が成功した場合にcallbackする 引数は監視するオブジェクト郡(配列)
        .all(req.body.events.map(handleEvent))
        //全部成功->thenを実行 resultをjson形式で戻す
        .then((result) => {
            console.log(result);
            res.json(result);
        });
});


const client = new line.Client(config);
const handleEvent = event => {
    //メッセージでなかったらnullを返して終了
    if (event.type !== 'message') {
        //スタンプでもテキストでもなかったらnullを返す
        if(event.message.type !== 'sticker' && event.message.type !== 'text') {
            return Promise.resolve(null);
        }
    }

    if(event.message.type === 'text') {
        if(event.message.text === '大園桃子') {
            return client.replyMessage(event.replyToken, {
                "type": "image",
                "originalContentUrl": "https://img.nogizaka46.com/blog/momoko.oozono/img/2019/02/05/6738863/0000.jpeg",
                "previewImageUrl": "https://i.daily.jp/gossip/2019/04/17/Images/12249930.jpg"
            });
        }
        switch (event.message.text) {
            case 'ガウスの法則':
                return client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: '閉曲面を貫いて出ていく電気力線の総本数は閉曲面が内包する電荷の総和に比例する.',
                });
            case '電界':
                return client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: 'ある空間に仮に+1[c]の電荷を置いたとき, その空間に働く力の大きさがその空間における電界の大きさである.',
                });
            case '電気力線':
                return client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: '電気力線の特徴\n・電気力線上の各点の接点はその点の電界方向である.\n・電気力線の密度は各点の電界の強さに比例する.\n・電気力線は正電荷で発生し, 負電荷で消滅する.',
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
