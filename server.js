const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const LINE_TOKEN = process.env.LINE_TOKEN;
const OPENAI_KEY = process.env.OPENAI_KEY;

async function getImage(messageId) {
  const res = await axios.get(
    `https://api-data.line.me/v2/bot/message/${messageId}/content`,
    {
      headers: { Authorization: `Bearer ${LINE_TOKEN}` },
      responseType: "arraybuffer"
    }
  );
  return Buffer.from(res.data).toString("base64");
}

async function analyze(base64) {
  try {
    const res = await axios.post(
      "https://api.openai.com/v1/responses",
      {
        model: "gpt-4.1-mini",
        input: [{
          role: "user",
          content: [
            { type: "input_text", text: "請解析收據，只回JSON" },
            { type: "input_image", image_url: "data:image/jpeg;base64," + base64 }
          ]
        }]
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("AI回應：", res.data);

    return res.data.output[0].content[0].text;

  } catch (err) {
    console.error("🔥 AI錯誤：", err.response?.data || err.message);
    throw err;
  }
}

app.post("/webhook", async (req, res) => {
  const events = req.body.events;

  for (let event of events) {

    if (event.message && event.message.type === "image") {
      try {
        const base64 = await getImage(event.message.id);
        const result = await analyze(base64);

        await reply(event.replyToken, "📊 結果：\n" + result);

      } catch (err) {
        await reply(event.replyToken, "❌ AI出錯，請看後台log");
      }
    }

    if (event.message && event.message.type === "text") {
      await reply(event.replyToken, "傳收據給我 📷");
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
