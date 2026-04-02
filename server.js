const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const LINE_TOKEN = process.env.LINE_TOKEN;

app.post("/webhook", async (req, res) => {
  console.log("🔥 有收到請求");

  const events = req.body.events;

  for (let event of events) {

    console.log("事件：", event);

    if (event.message) {
      await reply(event.replyToken, "我收到訊息了 👍");
    }
  }

  res.sendStatus(200);
});

async function reply(token, text) {
  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken: token,
      messages: [{ type: "text", text }]
    },
    {
      headers: {
        Authorization: `Bearer ${LINE_TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("running"));
