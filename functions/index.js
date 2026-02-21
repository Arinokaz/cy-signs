const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");

setGlobalOptions({ maxInstances: 10 });

const fetch = require("node-fetch");
const { defineSecret } = require("firebase-functions/params");

const TELEGRAM_TOKEN = defineSecret("TELEGRAM_TOKEN");
const TELEGRAM_CHAT_ID = defineSecret("TELEGRAM_CHAT_ID");

exports.sendFeedback = onRequest(
  { secrets: [TELEGRAM_TOKEN, TELEGRAM_CHAT_ID], cors: true },
  async (req, res) => {
    // CORS preflight handling
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    
    const token = TELEGRAM_TOKEN.value();
    const chatId = TELEGRAM_CHAT_ID.value();
    const message = req.body.message;

    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message
        })
      });

      res.status(200).send("OK");
    } catch (error) {
      logger.error('Telegram API error:', error);
      res.status(500).send("Error sending feedback");
    }
  }
);

