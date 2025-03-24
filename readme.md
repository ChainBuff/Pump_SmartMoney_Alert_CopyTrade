# Solana Smart Money Monitor

# Solana 智能资金监控

[English](#english) | [中文](#chinese)

---

<a name="english"></a>

# English Version

**⚠️ Educational Purpose Only**

This project is created strictly for educational purposes to demonstrate blockchain monitoring and interaction techniques. It is not intended for actual trading or financial activities. Users should be aware that:

- Trading cryptocurrencies involves significant risks
- Copy trading can result in substantial losses
- This code should not be used for real trading decisions
- The project is meant for learning blockchain development concepts only

## Features

### 1. Real-time Smart Money Monitoring

- Uses `yellowstone-grpc` to monitor Solana blockchain transactions
- Tracks specified "smart money" wallet addresses
- Real-time transaction notification system

### 2. Telegram Bot Integration

Commands available:

- `/start` - Start the bot
- `/smart` - View current smart money addresses
- `/add` - Add new smart money address
- `/remove` - Remove existing smart money address

Features:

- Real-time transaction notifications
- Automatic subscription updates when address list changes

### 3. Transaction Features

- Real-time transaction monitoring system
- Optional Jito-based transaction execution
- Configurable transaction parameters

### 4. MemeCoin Analysis (AI-Powered)

- Twitter information search for specified MemeCoin addresses
- AI-powered narrative analysis and summarization
- Telegram bot interface for requesting analysis

## Technical Stack

- **Blockchain Monitoring**: yellowstone-grpc
- **Bot Framework**: Grammy (Telegram Bot API)
- **Transaction Execution**: Jito-solana
- **AI Integration**: OpenAI API
- **Language**: TypeScript

## Setup Guide

1. Environment Setup

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

2. Configure Required API Keys in `.env`:

```
TG_API_TOKEN=your_telegram_token
OPENAI_API_KEY=your_openai_key
```

3. start
   `ts-node index.ts`

## Disclaimer

This software is provided for educational purposes only. It should not be used for:

- Real trading or investment decisions
- Financial advice
- Automated trading systems
- Production environments

---

<a name="chinese"></a>

# 中文版本

**⚠️ 仅供教育目的**

本项目严格用于教育目的，旨在演示区块链监控和交互技术。不适用于实际交易或金融活动。用户应注意：

- 加密货币交易具有重大风险
- 跟单交易可能导致重大损失
- 本代码不应用于实际交易决策
- 本项目仅用于学习区块链开发概念

## 功能特性

### 1. 实时智能资金监控

- 使用 `yellowstone-grpc` 监控 Solana 区块链交易
- 追踪指定的"智能资金"钱包地址
- 实时交易通知系统

### 2. Telegram 机器人集成

可用命令：

- `/start` - 启动机器人
- `/smart` - 查看当前智能资金地址
- `/add` - 添加新的智能资金地址
- `/remove` - 移除现有智能资金地址

功能特点：

- 实时交易通知
- 地址列表变更时自动更新订阅

### 3. 交易功能

- 实时交易监控系统
- 可选的基于 Jito 的交易执行
- 可配置的交易参数

### 4. 迷因币分析（AI 支持）

- 搜索指定迷因币地址的 Twitter 信息
- AI 驱动的叙事分析和总结
- Telegram 机器人接口用于请求分析

## 技术栈

- **区块链监控**: yellowstone-grpc
- **机器人框架**: Grammy (Telegram Bot API)
- **交易执行**: Jito-solana
- **AI 集成**: OpenAI API
- **开发语言**: TypeScript

## 设置指南

1. 环境设置

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.copy .env
```

2. 在 `.env` 中配置所需的 API 密钥：

```
TG_API_TOKEN=你的_telegram_token
OPENAI_API_KEY=你的_openai_key
```

3. 启动项目
   `ts-node index.ts`

## 免责声明

本软件仅供教育目的使用。不应用于：

- 实际交易或投资决策
- 金融建议
- 自动交易系统
- 生产环境

这是一个教育项目。欢迎 fork 并根据自己的学习目的进行修改。
