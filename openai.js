//853d3b5a9cca06b9961a640c0dac1d482e1a91f5
const { Deepgram } = require("@deepgram/sdk");
const fs = require("fs");

// The API key you created in step 1
const deepgramApiKey = "853d3b5a9cca06b9961a640c0dac1d482e1a91f5";

// Replace with your file path and audio mimetype
const pathToFile = "./speech.wav";
const mimetype = "audio/wav";

// Initializes the Deepgram SDK
const deepgram = new Deepgram(deepgramApiKey);

console.log("Requesting transcript...");
console.log("Your file may take up to a couple minutes to process.");
console.log(
  "While you wait, did you know that Deepgram accepts over 40 audio file formats? Even MP4s."
);
console.log(
  "To learn more about customizing your transcripts check out developers.deepgram.com."
);

const result = deepgram.transcription
  .preRecorded(
    { buffer: fs.readFileSync(pathToFile), mimetype },
    { punctuate: true, language: "en-US" }
  )
  .then((transcription) => {
    console.dir(transcription, { depth: null });
  })
  .catch((err) => {
    console.log(err);
  });
