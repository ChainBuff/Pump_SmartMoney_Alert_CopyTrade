import { CommandContext, Context, InputFile } from "grammy";
import { addressManager } from "../../../../addressManager";
/**
 * tg bot移除聪明钱命令处理
 */
export const removeSmartAddressCommand = async (
  ctx: CommandContext<Context>
) => {
  try {
    // 获取命令后的参数
    const address = ctx.message?.text.split(" ").slice(1).join(" ").trim();
    if (!address) {
      await ctx.reply("❌ 请提供要移除的钱包地址\n正确格式: /remove 钱包地址", {
        message_thread_id: ctx.message?.message_thread_id,
      });
      return;
    }
    // 直接调用 addressManager，它会处理所有验证
    const result = await addressManager.removeAddress(address);
    await ctx.reply(`${result.success ? "✅" : "❌"} ${result.message}`, {
      message_thread_id: ctx.message?.message_thread_id,
    });
  } catch (error) {
    console.error("移除地址错误:", error);
    await ctx.reply("❌ 移除失败，请稍后重试", {
      message_thread_id: ctx.message?.message_thread_id,
    });
  }
};
