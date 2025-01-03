import { Bot } from "grammy";
import {
  addSmartAddressCommand,
  removeSmartAddressCommand,
  searchTokenInTwitter,
  smartAddressCommand,
  startCommand,
} from "./handlers/command";
import { TG_API_TOKEN } from "../../config";

export const bot = new Bot(TG_API_TOKEN);

const setupBot = async () => {
  // set commands
  const commands = [
    {
      command: "start",
      description: "Start the bot",
    },
    {
      command: "smart",
      description: "Show smart address",
    },
    {
      command: "add",
      description: "add smart address",
    },
    {
      command: "remove",
      description: "remove smart address",
    },
    // {
    //   command: "search",
    //   description: "search test",
    // },
  ];
  await bot.api.setMyCommands(commands);
  // commands
  bot.command("start", startCommand);
  bot.command("smart", smartAddressCommand);
  bot.command("add", addSmartAddressCommand);
  bot.command("remove", removeSmartAddressCommand);
  // bot.command("search", searchTokenInTwitter);
  // messages

  await bot.start({
    onStart: () => {
      console.log("Bot started successfully");
    },
  });
};
export { setupBot };
