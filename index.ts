import { subscriptionManager } from "./stream";
import { setupBot } from "./tg/bot/bot";

async function main(): Promise<void> {
  try {
    console.log("Starting application...");

    // 初始化tg机器人 启动黄石grpc数据订阅
    await Promise.all([setupBot(), subscriptionManager.setupStream()]);

    console.log("Application started successfully");
  } catch (error) {
    console.error("Failed to start application:", error);
    process.exit(1);
  }
}
main();
