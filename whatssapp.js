"use strict";
const {
  default: makeWASocket,
  DisconnectReason,
  useSingleFileAuthState,
} = require("@adiwajshing/baileys");
const { Boom } = require("@hapi/boom");
const {
  MessageType,
  MessageOptions,
  Mimetype,
} = require("@adiwajshing/baileys");
const fs = require("fs");
const profs = require("fs").promises;
const ytdl = require("ytdl-core");
const { writeFile } = require("fs/promises");
const { downloadContentFromMessage } = require("@adiwajshing/baileys");
const { state, saveState } = useSingleFileAuthState("./login.json");
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: "", //isi dengan APIkey
});
const openai = new OpenAIApi(configuration);

//Fungsi ChatGPT
async function chatResponse(message) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `anda asisten profesional bernama abby ${message}`,
    temperature: 0.4,
    max_tokens: 3000,
    top_p: 0.7,
    frequency_penalty: 0.8,
    presence_penalty: 0.0,
  });
  return response.data.choices[0].text;
}
async function bikinGambar(message) {
  const response = await openai.createImage({
    prompt: message,
    n: 1,
    size: "1024x1024",
  });
  return response.data.data[0].url;
}

// Fungsi OpenAI selesai
// Connect WA
async function hubungkanKeWhatsApp() {
  //make login to wa
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    defaultQueryTimeoutMs: undefined,
  });
  //check for connection
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect.error = Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut;
      console.log(
        "Koneksi terputus:",
        lastDisconnect.error,
        ", hubungkan kembali!",
        shouldReconnect
      );
      if (shouldReconnect) {
        hubungkanKeWhatsApp();
      }
    } else if (connection === "open") {
      console.log("Wa Terhubung");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    //console.log("Tipe Pesan: ", type);
    //console.log(messages);
    const m = messages[0];
    const messageFormat = Object.keys(m.message)[0]; // get what type of message it is -- text, image, video
    if (!m.message) return;
    console.log("Format pesan: ", messageFormat); //audioMessage
    if (
      messageFormat === "conversation" ||
      (messageFormat === "extendedTextMessage" && !messages[0].key.fromMe)
    ) {
      try {
        //keep no. phone & message & log to console
        const pengirimWhatsApp = messages[0].key.remoteJid;
        let pesanMasuk = messages[0].message.conversation;
        //keep variable to store incoming message from group
        if (!pesanMasuk) {
          pesanMasuk = messages[0].message.extendedTextMessage.text;
        }

        //keep info from group or mention Bot
        const apaPsnDariGrup = pengirimWhatsApp.includes("@g.us");
        pesanMasuk = pesanMasuk.toLowerCase();
        const apaMentionBot = pengirimWhatsApp.includes("@"); //isi dgn no hp BOT

        //log to console sender, message, from group or mention bot
        console.log("No Pengirim:", pengirimWhatsApp);
        console.log("Pesan Masuk:", pesanMasuk);
        console.log("Apa mention bot?", apaMentionBot);
        console.log("Pesan dari grup?", apaPsnDariGrup);

        //OPEN AI integration
        if (
          pesanMasuk.includes("hapus chat") ||
          pesanMasuk.includes("clear chat")
        ) {
          await profs.writeFile(`${pengirimWhatsApp}.txt`, "", "utf-8");
          await sock.sendMessage(
            pengirimWhatsApp,
            { text: "history chat sudah dihapus" },
            { quoted: messages[0] },
            5000
          );
        } else if (
          (!apaPsnDariGrup && pesanMasuk.includes("youtube.com")) ||
          pesanMasuk.includes("youtu.be")
        ) {
          const video = ytdl(pesanMasuk, { quality: 18 });
          video.on("progress", function (info) {
            console.log("Download progress");
          });
          video.on("end", function (info) {
            console.log("Download finish");
          });
          video.pipe(fs.createWriteStream("video.mp4"));
          await sock.sendMessage(pengirimWhatsApp, {
            video: fs.readFileSync("video.mp4"),
            caption: "Selesai ^^",
          });
        } else if (!pesanMasuk.includes("gambar")) {
          let pesan = await profs.appendFile(
            `${pengirimWhatsApp}.txt`,
            `Aku:${pesanMasuk}->Abby:`,
            "utf-8"
          );
          pesan = await profs.readFile(`${pengirimWhatsApp}.txt`, "utf-8");
          async function chatGPT() {
            let result = await chatResponse(pesan);
            result = result.trim();
            console.log(result);
            await sock.sendMessage(
              pengirimWhatsApp,
              { text: result },
              { quoted: messages[0] }
            );
            await profs.appendFile(
              `${pengirimWhatsApp}.txt`,
              `${result}\n`,
              "utf-8"
            );
          }
          chatGPT();
        }
        if (
          pesanMasuk.includes("gambar") &&
          !pesanMasuk.includes("t-rex") &&
          !pesanMasuk.includes("kim jong un")
        ) {
          async function imageGPT() {
            let result = await bikinGambar(pesanMasuk);
            await sock.sendMessage(pengirimWhatsApp, {
              image: { url: result },
            });
          }
          imageGPT();
        }
      } catch (error) {
        console.log("Pesan Error:", error);
      }
    } else if (messageFormat === "audioMessage") {
      const pengirimWhatsApp = messages[0].key.remoteJid;
      await sock.sendMessage(
        pengirimWhatsApp,
        {
          text: "Maaf, saya belum diajarkan mengenali suara nanti saya bakal belajar kok",
        },
        { quoted: messages[0] }
      );
    }
  });
}

hubungkanKeWhatsApp().catch((err) => {
  console.log("Terjadi Error: " + err);
});
