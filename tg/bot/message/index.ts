import { TG_CHAT_ID, TG_MESSAGE_THREAD_ID } from "../../../config";
import { bot } from "../bot.js";

async function sendToTelegram(message: string) {
  try {
    await bot.api.sendMessage(TG_CHAT_ID, message, {
      message_thread_id: +TG_MESSAGE_THREAD_ID,
    });
  } catch (error) {
    console.error("发送消息到 Telegram 失败:", error);
  }
}
export { sendToTelegram };
