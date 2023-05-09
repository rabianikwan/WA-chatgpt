const fs = require("fs");
const ytdl = require("ytdl-core");

//ytdl("https://www.youtube.com/watch?v=qal34e9v_pk").pipe(
//  fs.createWriteStream("video.mp4")
//);

const video = ytdl("https://www.youtube.com/watch?v=qal34e9v_pk", {
  quality: 136,
});
video.on("progress", function (info) {
  console.log("Download progress");
});
video.on("end", function (info) {
  console.log("Download finish");
});

video.pipe(fs.createWriteStream("video.mp4"));
