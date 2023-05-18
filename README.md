# Whatsapp Bot CHAT-GPT

If you want to create a WhatsApp bot with GPT base, download this project or with CLI :
```
git clone
```
If you don’t have node.js: <a href = "https://github.com/nvm-sh/nvm/blob/master/README.md"> install here</a>, and if you already have install this library :

```
npm i @adiwajshing/baileys@4.4.0
npm i qrcode-terminal@0.12.0
npm i @hapi/boom
npm I openai
```
Make <a href='https://platform.openai.com/account/api-keys'>openAI APIkey</a>.

## Edit this line in app.js
line 11 :
```
const configuration = new Configuration({
  apiKey: "", //fill with your APIkey
});
```
Line 78 :
```
const apaMentionBot = pengirimWhatsApp.includes("@"); //Fill with bot phone number
```
Run your project with
```
npm run start
```
It’s done easy, right? Want app to run 24/7? do these steps :
```
npm install pm2 -g
pm2 start whatsapp.js --name "whatsapp"
```
Run this to check the physical memory used or delete the background process.
```
pm2 ps
pm2 delete 0
pm2 logs
```
New Features :
- Continuous chat 
- Image Finder: text ‘gambar…’, ex ‘gambar kucing’, it’ll send cat pic
- Video Downloader: put the Youtube link; it’ll automatically download

Next Features :
- Audio Recognition
- Image Editing
- Tiktok Video Downloader

