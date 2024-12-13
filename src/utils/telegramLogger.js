const TelegramBot = require("node-telegram-bot-api");
const telegramConfig = require("../config/telegram.json");

const BOT_TOKEN = telegramConfig.botToken;
const CHANNEL_ID = telegramConfig.channelId;

let bot = null;
const initBot = () => {
  console.log("\n[Telegram Bot] Initializing...", BOT_TOKEN);
  const validationErrors = [];

  if (!BOT_TOKEN) {
    validationErrors.push("Bot token is missing");
  } else if (BOT_TOKEN === "YOUR_BOT_TOKEN") {
    validationErrors.push("Bot token is not configured");
  }

  if (!CHANNEL_ID) {
    validationErrors.push("Channel ID is missing");
  } else if (CHANNEL_ID === "YOUR_CHANNEL_ID") {
    validationErrors.push("Channel ID is not configured");
  }

  if (validationErrors.length > 0) {
    console.log(
      "[Telegram Bot] Skipped initialization - Configuration errors:"
    );
    validationErrors.forEach((error) => console.log(`  - ${error}`));
    return;
  }

  try {
    bot = new TelegramBot(BOT_TOKEN, { polling: true });
    console.log("[Telegram Bot] Connected successfully");

    // Listen for any kind of message
    bot.on("message", (msg) => {
      const chatId = msg.chat.id;
      console.log(`[Telegram Bot] Message received - Chat ID: ${chatId}`);
      console.log(`[Telegram Bot] Message type: ${msg.chat.type}`);

      // Reply with the chat ID
      bot.sendMessage(chatId, `This chat ID is: ${chatId}`);
    });

    // Listen for channel posts
    bot.on("channel_post", (msg) => {
      const channelId = msg.chat.id;
      const channelTitle = msg.chat.title;
      console.log(`[Telegram Bot] Channel post received from: ${channelTitle}`);
      console.log(`[Telegram Bot] Channel ID: ${channelId}`);
      console.log(`[Telegram Bot] Message: ${msg.text}`);
    });

    return bot;
  } catch (error) {
    console.error(`[Telegram Bot] Connection failed - ${error.message}`);
  }
};

const sendToTelegram = async (message) => {
  try {
    if (!bot) {
      return; // Skip Telegram logging if bot is not initialized
    }
    await bot.sendMessage(CHANNEL_ID, message, { parse_mode: "HTML" });
  } catch (error) {
    console.error("Error sending to Telegram:", error);
  }
};

module.exports = {
  sendToTelegram,
  initBot,
};
