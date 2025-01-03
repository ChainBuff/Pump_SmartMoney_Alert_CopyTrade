import { CommandContext, Context, InputFile } from "grammy";
import { addressManager } from "../../../../addressManager";
/**
 * tg bot添加聪明钱命令处理
 */
export const addSmartAddressCommand = async (ctx: CommandContext<Context>) => {
  try {
    const input = ctx.message?.text.split(" ").slice(1).join(" ");
    // 验证是否有输入
    if (!input) {
      await ctx.reply("❌ 格式错误！\n正确格式: /add 钱包地址 名称", {
        message_thread_id: ctx.message?.message_thread_id,
      });
      return;
    }
    // 解析地址和名称
    const [address, name] = input.split(" ").map((item) => item.trim());
    // 验证参数完整性
    if (!address || !name) {
      await ctx.reply("❌ 参数不完整！\n正确格式: /add 钱包地址 名称", {
        message_thread_id: ctx.message?.message_thread_id,
      });
      return;
    }
    // 添加地址
    const result = await addressManager.addAddress(address, name);
    if (result.success) {
      await ctx.reply(`✅ 添加成功！\n地址: ${address}\n名称: ${name}`, {
        message_thread_id: ctx.message?.message_thread_id,
      });
    } else {
      await ctx.reply(`❌ ${result.message}`, {
        message_thread_id: ctx.message?.message_thread_id,
      });
    }
  } catch (error) {
    await ctx.reply(`添加失败: ${error}`, {
      message_thread_id: ctx.message?.message_thread_id,
    });
  }
};
