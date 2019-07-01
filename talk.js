import express from 'express';
import * as line from '@line/bot-sdk';
//ポートの制御
const PORT = process.env.PORT || 3000;
//キーを別ファイルから読み込み
import config  from './setting';
const app = express();
const client = new line.Client(config);
// 検証用
import crypto from 'crypto';
// API接続用
import axios from 'axios';

// グローバル変数の宣言
const QIITA_TAGS = ['Python', 'PHP', 'Java', 'Node.js', 'C#', 'C++', 'Xcode', 'CentOS', 'Vue.js', '#migrated', 'React', 'Scala', 'C', 'Heroku', 'centos7', 'IoT', 'kubernetes', 'Firebase', 'Haskell', '新人プログラマ応援', 'VSCode', 'api', 'JSON', 'Twitter', 'oracle', 'JavaScript', 'iOS', 'Swift', 'Git', 'Python3', 'CSS', '初心者', 'GitHub', 'Objective-C', 'Bash', 'TypeScript', 'R', 'Kotlin', 'TensorFlow', 'Azure', 'Ansible', 'MachineLearning', 'iPhone', 'Excel', 'EC2', 'GoogleAppsScript', 'reactjs', 'docker-compose', 'npm', 'shell', 'Ruby', 'AWS', 'Docker', 'Mac', 'MySQL', 'Windows', 'HTML', 'RaspberryPi', 'Vagrant', 'Vim', 'WordPress', 'HTML5', 'Slack', 'PostageSQL', 'lambda', 'Django', 'Windows10', 'VirtualBox', 'Emacs', 'AndroidStudio', 'PowerShell', 'Qiita', 'homebrew', 'GoogleCloudPlatform', 'AngularJS', 'Rails', 'Android', 'Linux', 'Unity', 'Go', '機械学習', 'Ubuntu', 'Laravel', 'jQuery', 'DeepLearning', 'golang', 'MacOSX', 'nginx', 'ShellScript', 'SQL', 'Apache', 'SSH', 'Arduino', 'OpenCV', 'Chrome', 'ポエム', 'Elixir', '数学', 'Perl', 'S3'];

app.post('/webhook', line.middleware(config), async(req, res) => {
   // 署名の検証
   if (!validate_signature(req.headers['x-line-signature'], req.body)) return;

   // 返信用の汎用関数を作成
   // タグ一覧の送信
   if(req.body.events[0].message.text === 'タグ') {
      let text = '';
      for(const tag of QIITA_TAGS) {
         text += tag + '\n';
      }
      client.replyMessage(req.body.events[0].replyToken, {type: 'text', text: text});
      return true;
   }

   if(QIITA_TAGS.indexOf(req.body.events[0].message.text) === -1) {
      client.replyMessage(req.body.events[0].replyToken, {type: 'text', text: 'タグ一覧には含まれていません。\nタグ一覧を知りたい場合は タグ と送信してください。'});
      return true;
   }


   searchQiitaArticle(req.body.events[0].message.text).then((data) => {
      client.replyMessage(req.body.events[0].replyToken, {type: 'text', text: data});
   }).catch((e) => {
      console.log(e);
      client.replyMessage(req.body.events[0].replyToken, {type: 'text', text: 'REJECT_ERROR'});
   });


});


app.listen(PORT);
console.log(`Server running at ${PORT}`);

/**
 * 署名の検証
 * @param signature
 * @param body
 * @returns {boolean}
 */
const validate_signature = (signature, body) => {
   return signature === crypto.createHmac('SHA256', config.channelSecret).update(JSON.stringify(body)).digest('base64');
};


const searchQiitaArticle = async(tag) => {
   // tagは日本語で来る場合があるのでencodeする
   const url = `http://qiita.com/api/v2/items?page=1&per_page=5&query=tag:${encodeURIComponent(tag)}`;
   try {
      const articles = await axios.get(url);
      let titles = '';
      for(const item of articles.data) {
         titles += item.title + '\n' + item.url + '\n\n';
      }
      return Promise.resolve(titles);
   } catch (e) {
      console.log('rejectします');
      return Promise.reject(e);
   }
};


//Memo: 起動コマンド babel-node talk.js
