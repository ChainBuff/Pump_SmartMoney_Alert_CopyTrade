import { CommandContext, Context } from "grammy";

export const startCommand = async (ctx: CommandContext<Context>) => {
  try {
    await ctx.reply(`start命令测试`, {
      message_thread_id: ctx.message!.message_thread_id,
    });
  } catch (e) {
    console.log(e);
  }
};
