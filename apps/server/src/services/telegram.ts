import TelegramBot from "node-telegram-bot-api";
import { db } from "../utils/db";

const TOKEN = "8695103652:AAFR4PEh-tRwcC88S-PBEwW-dRe5sr4Tn6I";

let bot: TelegramBot | null = null;

export function initTelegramBot() {
  if (bot) return bot;

  bot = new TelegramBot(TOKEN, { polling: true });

  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text?.trim() || "";
    const lower = text.toLowerCase();

    if (text === "/start" || lower === "copatner" || lower === "hi" || lower === "hello") {
      await bot!.sendMessage(
        chatId,
        "Welcome to Co-Patner!\n\nTo receive your OTP, send your phone number with country code.\nExample: <code>+919876543210</code>",
        { parse_mode: "HTML" }
      );
      return;
    }

    const phoneMatch = text.match(/\+\d{10,15}/);

    if (phoneMatch) {
      const phone = phoneMatch[0];
      const otp = db.otp.get(phone);
      if (otp) {
        await bot!.sendMessage(chatId, `Your OTP is: <b>${otp}</b>\n\nIt expires in 5 minutes.`, { parse_mode: "HTML" });
        await bot!.sendMessage(chatId, "Enter this OTP in the app to complete login.");
      } else {
        await bot!.sendMessage(chatId, "No pending OTP found for this number. Please request OTP from the app first.");
      }
      return;
    }

    await bot!.sendMessage(
      chatId,
      "Welcome to Co-Patner!\n\nTo receive your OTP, send your phone number with country code.\nExample: <code>+919876543210</code>",
      { parse_mode: "HTML" }
    );
  });

  // Cleanup expired OTPs every 60 seconds
  setInterval(() => db.otp.cleanup(), 60_000);

  console.log("Telegram bot started (polling)");
  return bot;
}
