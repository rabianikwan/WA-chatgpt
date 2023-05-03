"use strict";
const {
  default: makeWASocket,
  DisconnectReason,
  useSingleFileAuthState,
} = require("@adiwajshing/baileys");
const { Boom } = require("@hapi/boom");
const { state, saveState } = useSingleFileAuthState("./login.json");
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: "", //isi dengan APIkey
});
const openai = new OpenAIApi(configuration);

//chat gpt
async function generateResponse(message) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: message,
    temperature: 0.3,
    max_tokens: 1000,
    top_p: 1,
    frequency_penalty: 0.0,
    presence_penalty: 0.3,
  });
  return response.data.choices[0].text;
}

function noHP(string) {
  string.indexOf("@");
  return string.slice(0, string.indexOf("@"));
}

// main func AI to connect WA
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
    console.log("Tipe Pesan: ", type);
    console.log(messages);
    if (type === "notify" && !messages[0].key.fromMe) {
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
        console.log("No Pengirim:", noHP(pengirimWhatsApp));
        console.log("Pesan Masuk:", pesanMasuk);
        console.log("Apa mention bot?", apaMentionBot);
        console.log("Pesan dari grup?", apaPsnDariGrup);

        //OPEN AI integration
        if (!apaPsnDariGrup) {
          async function chatGPT() {
            const result = await generateResponse(pesanMasuk);
            console.log(result);
            await sock.sendMessage(
              pengirimWhatsApp,
              { text: result },
              { quoted: messages[0] },
              2000
            );
          }

          chatGPT();
        }
      } catch (error) {
        console.log("Pesan Error:", error);
      }
    }
  });
}

hubungkanKeWhatsApp().catch((err) => {
  console.log("Terjadi Error: " + err);
});
