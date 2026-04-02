const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const Tesseract = require("tesseract.js");

const app = express();
app.use(bodyParser.json());

const LINE_TOKEN = process.env.LINE_TOKEN;

// 下載圖片
async function getImage(messageId) {
  const res = await axios.get(
    `https://api-data.line.me/v2/bot/message/${messageId}/content`,
    {
      headers: { Authorization: `Bearer ${LINE_TOKEN}` },
      responseType: "arraybuffer"
    }
  );
  return Buffer.from(res.data);
}

// OCR 辨識
async function ocr(buffer) {
  const { data: { text } } = await Tesseract.recognize(buffer, "chi_tra+eng");
  return text;
}

// 簡單解析價格
function parse(text) {
  const lines = text.split("\n");
  let results = [];

  lines.forEach(line => {
    const match = line.match(/(.+?)\s+(\d+)/);
    if (match) {
      results.push({
        name: match[1].trim(),
        price: match[2]
      });
    }
  });

  return results.slice(0, 10);
}

app.post("/webhook", async (req, res) => {
  const events = req.body.events;

  for (let event of events) {

    if (event.message && event.message.type === "image") {
      try {
        const buffer = await getImage(event.message.id);
        const text = await ocr(buffer);
        const items = parse(text);

        await reply(event.replyToken, "📊 辨識結果：\n" + JSON.stringify(items, null, 2));

      } catch (err) {
        console.error(err);
        await reply(event.replyToken, "❌ 辨識失敗");
      }
    }

    if (event.message && event.message.type === "text") {
      await reply(event.replyToken, "傳收據給我 📷（免費版）");
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
