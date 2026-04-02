const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// 從 Render 環境變數拿 LINE Token
const LINE_TOKEN = process.env.LINE_TOKEN;

// Webhook（LINE 會打這個）
app.post("/webhook", async (req, res) => {
  const events = req.body.events;

  for (let event of events) {
    if (event.message && event.message.type === "text") {
      await reply(event.replyToken, "我已經可以用了 🎉");
    }
  }

  res.sendStatus(200);
});

// 回覆訊息給 LINE
async function reply(token, text) {
  try {
    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken: token,
        messages: [{ type: "text", text: text }]
      },
      {
        headers: {
          Authorization: `Bearer ${LINE_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (err) {
    console.error("回覆失敗:", err.response?.data || err.message);
  }
}

// Render 必須用 PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
