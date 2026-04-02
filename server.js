const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");

const app = express();
app.use(bodyParser.json());

const serviceAccount = require("./firebase-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const LINE_TOKEN = process.env.LINE_TOKEN;
const OPENAI_KEY = process.env.OPENAI_KEY;

app.post("/webhook", async (req, res) => {
  const events = req.body.events;

  for (let event of events) {
    if (event.message && event.message.type === "text") {
      await reply(event.replyToken, "我已經可以用了 🎉 傳收據給我試試");
    }
  }

  res.sendStatus(200);
});

async function reply(token, text) {
  await axios.post("https://api.line.me/v2/bot/message/reply", {
    replyToken: token,
    messages: [{ type: "text", text }]
  }, {
    headers: {
      Authorization: `Bearer ${LINE_TOKEN}`,
      "Content-Type": "application/json"
    }
  });
}

app.listen(3000, () => console.log("running"));