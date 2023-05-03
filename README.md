# Whatsapp Bot CHAT-GPT

Jika anda ingin membuat bot wa dengan base chat GPT download project ini atau dengan CLI :
```
https://github.com/rabianikwan/WA-chatgpt.git
```
kemudian, jika belum memiliki node js: <a href = "https://github.com/nvm-sh/nvm/blob/master/README.md"> cara install disini</a>, jika sudah punya install library ini :

```
npm i @adiwajshing/baileys@4.4.0
npm i qrcode-terminal@0.12.0
npm i @hapi/boom
npm i openai
```
buat <a href='https://platform.openai.com/account/api-keys'>openAI APIkey jika belum punya</a>.

## edit bagian - bagian ini dalam main js
baris ke 11 :
```
const configuration = new Configuration({
  apiKey: "", //isi dengan APIkey milik kalian
});
```
baris ke 78 :
```
const apaMentionBot = pengirimWhatsApp.includes("@"); //isi dgn no hp BOT
```
jalankan project dengan node js di folder utama
```
npm run start
```
sudah selesai, gampang kan? jika pengen bot berjalan 24 jam, begini caranya :
```
npm install pm2 -g
pm2 --name wabot start npm -- start
```
jika ingin mengecek & menghapus background proses begini caranya :
```
pm2 ps
pm2 delete 0
pm2 logs
```
