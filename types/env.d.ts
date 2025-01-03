// types/env.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GRPC_URL_MAIN: string;
      GRPC_URL_TEST: string;
      SMART_MONEY_MAP: string;
      TG_API_TOKEN: string;
      TG_CHAT_ID: string;
      TG_MESSAGE_THREAD_ID: string;
      RPC_ENDPOINT: string;
      PRIVATE_KEY: string;
      TWITTER_ACCESS_TOKEN: string;
      TWITTER_ACCESS_TOKEN_SECRET: string;
      TWITTER_API_KEY: string;
      TWITTER_API_SECRET: string;
      TWITTER_BEARER_TOKEN: string;
      OPENAI_API_KEY: string;
      Grok_API_KEY: string;
      IS_JITO: boolean;
      JITO_FEE: number;
    }
  }
}
export interface MessageTemplateParam {
  /** 智能钱包持有者名称 */
  smartMoneyName: string;
  /** 智能钱包地址 */
  smartMoneyAddress: string;
  /** 交易类型 (BUY/SELL) */
  type: "BUY" | "SELL";
  /** 代币地址 */
  tokenMintAccount: string;
  /** 交易金额 */
  solAmount: string | number;
  /** 交易金额 */
  tokenAmount: string | number;
  /** token价格 */
  tokenPrice: string | number;
  /** token市值 */
  tokenMarketCap: string | number;
  /** 交易哈希 */
  txHash: string;
  /** 交易时间戳 */
  time: string;
  /** slot */
  slot?: string;
  /** 代币名称 */
  tokenName?: string;
}
