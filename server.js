const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const LINE_TOKEN = process.env.LINE_TOKEN;

app.post("/webhook", async (req, res) => {
  console.log("🔥 收到 webhook");

  const events = req.body.events;

  for (let event of events) {

    // 👉 一定要先確認是 message 類型
    if (event.type !== "message") continue;

    console.log("完整事件：", JSON.stringify(event, null, 2));

    const msgType = event.message.type;

    console.log("訊息類型：", msgType);

    // 📷 圖片
    if (msgType === "image") {
      await reply(event.replyToken, "📷 我收到圖片了！");
      continue;
    }

    // 💬 文字
    if (msgType === "text") {
      await reply(event.replyToken, "我收到文字了 👍");
      continue;
    }

    // 其他類型
    await reply(event.replyToken, "收到其他類型訊息");
  }

  res.sendStatus(200);
});

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
