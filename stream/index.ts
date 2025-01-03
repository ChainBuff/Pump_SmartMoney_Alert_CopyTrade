import Client, {
  CommitmentLevel,
  SubscribeRequest,
  SubscribeUpdate,
} from "@triton-one/yellowstone-grpc";
import { ClientDuplexStream } from "@grpc/grpc-js";
import handleData from "../strategy/handleData";
import { GRPC_URL_MAIN, PUMP_FUN_PROGRAM_ID } from "../config";
import { addressEvents, addressManager } from "../addressManager";
/**
 * yellowstone-grpc 数据订阅管理器
 */
class SubscriptionManager {
  private client: Client;
  private currentStream: ClientDuplexStream<
    SubscribeRequest,
    SubscribeUpdate
  > | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  // 是否整个在更新订阅
  private isUpdating: boolean = false;
  // 初始化客户端 启动聪明钱地址变动监听器
  constructor() {
    this.client = new Client(GRPC_URL_MAIN, undefined, {
      "grpc.max_receive_message_length": 16 * 1024 * 1024,
    });
    this.setupAddressEventListener();
  }
  /**
   * 启动黄石订阅
   */
  async setupStream() {
    // 正在更新订阅 直接返回
    if (this.isUpdating) {
      console.log("[Setup already in progress, skipping...]");
      return;
    }
    this.isUpdating = true;
    console.log("执行setupStream");
    try {
      // 保证只初始化一次黄石订阅和心跳检测 避免创建多次stream订阅
      if (!this.currentStream) {
        this.currentStream = await this.client.subscribe();
        await this.setupStreamEventHandlers(this.currentStream);
        await this.startPingPong(this.currentStream);
      }
      // 如果currentStream已经存在 执行 updateSubscription
      await this.updateSubscription();
      this.isUpdating = false;
    } catch (error) {
      console.error("[Stream setup error:]", error);
      this.isUpdating = false;
      throw error;
    }
  }
  /**
   * 聪明钱地址数据变动监听
   * @example 添加或者移除聪明钱地址 重新进行黄石grpc的数据订阅 保证 data
   */
  private setupAddressEventListener() {
    addressEvents.on("addressesUpdated", async () => {
      try {
        if (this.isUpdating) {
          console.log("[Update in progress, skipping...]");
          return;
        }
        console.log(
          "[Smart money addresses updated, updating subscription...]"
        );
        await this.updateSubscription();
        console.log("[Subscription updated successfully]");
      } catch (error) {
        console.error("[Error updating subscription:]", error);
        this.isUpdating = false;
      }
    });
  }
  /**
   * 在聪明钱列表数据变动时--->使用这个更新订阅函数
   */
  private async updateSubscription() {
    if (!this.currentStream || this.currentStream.destroyed) {
      console.log("[Stream not available, creating new stream]");
      this.currentStream = await this.client.subscribe();
      await this.setupStreamEventHandlers(this.currentStream);
      await this.startPingPong(this.currentStream);
    }

    const SMART_ADDRESS_ARRAY = await addressManager.getAddressArray();
    console.log("Smart money addresses:", SMART_ADDRESS_ARRAY);

    const subRequestConfig: SubscribeRequest = {
      accounts: {},
      slots: {},
      transactions: {
        pumpFun: {
          // 聪明钱地址
          accountInclude: SMART_ADDRESS_ARRAY,
          accountExclude: [],
          // 必须 与 PumpFun程序相关
          accountRequired: [PUMP_FUN_PROGRAM_ID],
          // 过滤掉失败的交易
          failed: false,
        },
      },
      transactionsStatus: {},
      blocks: {},
      blocksMeta: {},
      entry: {},
      accountsDataSlice: [],
      commitment: CommitmentLevel.CONFIRMED,
    };

    await this.sendSubscribeRequest(this.currentStream, subRequestConfig);
  }
  /**
   * stream事件handler
   * @example data事件 error事件 end事件 close事件
   */
  private async setupStreamEventHandlers(
    stream: ClientDuplexStream<SubscribeRequest, SubscribeUpdate>
  ): Promise<void> {
    console.log("Setting up stream event handlers");

    return new Promise<void>((resolve) => {
      stream.on("data", async (data: SubscribeUpdate) => {
        try {
          await handleData(data);
        } catch (error) {
          console.error("[Data handling error:]", error);
        }
      });

      stream.on("error", (error: Error) => {
        console.error("[Stream error:]", error);
        this.handleStreamError();
      });

      stream.on("end", () => {
        console.log("[Stream ended]");
        this.handleStreamEnd();
      });

      stream.on("close", () => {
        console.log("[Stream closed]");
        this.handleStreamEnd();
      });

      resolve();
    });
  }
  /**
   * 发送订阅请求函数
   * @param stream 流
   * @param request filter
   * @returns
   */
  private sendSubscribeRequest = async (
    stream: ClientDuplexStream<SubscribeRequest, SubscribeUpdate>,
    request: SubscribeRequest
  ): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      console.log("发送订阅请求");
      stream.write(request, (err: Error | null) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };
  private async handleStreamError() {
    console.log("[Handling stream error]");
    this.currentStream = null;
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (!this.isUpdating) {
      await this.setupStream().catch(console.error);
    }
  }

  private async handleStreamEnd() {
    console.log("[Handling stream end]");
    this.currentStream = null;
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
  /**
   * 心跳检测
   */
  private async startPingPong(
    stream: ClientDuplexStream<SubscribeRequest, SubscribeUpdate>
  ): Promise<void> {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    const sendPing = async () => {
      if (!stream || stream.destroyed) {
        if (this.pingInterval) {
          clearInterval(this.pingInterval);
          this.pingInterval = null;
        }
        return;
      }

      try {
        await this.sendPing(stream);
      } catch (error) {
        console.error("[Ping error:]", error);
        await this.handleStreamError();
      }
    };

    this.pingInterval = setInterval(sendPing, 5000);
    return sendPing(); // Send first ping immediately
  }

  private sendPing = async (
    stream: ClientDuplexStream<SubscribeRequest, SubscribeUpdate>
  ): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      stream.write(
        {
          accounts: {},
          slots: {},
          transactions: {},
          transactionsStatus: {},
          blocks: {},
          blocksMeta: {},
          entry: {},
          accountsDataSlice: [],
          commitment: undefined,
          ping: { id: 1 },
        },
        (err: Error | null) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  };
}

export const subscriptionManager = new SubscriptionManager();
