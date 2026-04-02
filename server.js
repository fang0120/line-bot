const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const LINE_TOKEN = process.env.LINE_TOKEN;

// webhook
app.post("/webhook", async (req, res) => {
  console.log("🔥 收到 webhook");

  const events = req.body.events;

  for (let event of events) {

    console.log("事件類型：", event.message?.type);

    // 📷 圖片
    if (event.message && event.message.type === "image") {
      await reply(event.replyToken, "📷 我收到圖片了！");
    }

    // 💬 文字
    if (event.message && event.message.type === "text") {
      await reply(event.replyToken, "我收到文字了 👍");
    }
  }

  res.sendStatus(200);
});

// 回覆
async function reply(token, text) {
  try {
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
  } catch (err) {
    console.error("❌ 回覆錯誤:", err.response?.data || err.message);
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Server running"));
