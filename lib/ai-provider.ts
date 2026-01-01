/**
 * AI Provider Abstraction Layer
 * OpenAI と Gemini を統一的に扱うための抽象化レイヤー
 */

import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 共通のメッセージ型
export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// 共通のリクエスト型
export interface AIGenerateRequest {
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json' | 'text';
}

// 共通のレスポンス型
export interface AIGenerateResponse {
  content: string;
  model: string;
  provider: 'openai' | 'gemini';
}

// AI Provider の共通インターフェース
export interface AIProvider {
  generate(request: AIGenerateRequest): Promise<AIGenerateResponse>;
  isAvailable(): boolean;
  getProviderName(): string;
}

/**
 * OpenAI Provider
 */
export class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey?: string, model: string = 'gpt-4o-mini') {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async generate(request: AIGenerateRequest): Promise<AIGenerateResponse> {
    const messages = request.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const responseFormat =
      request.responseFormat === 'json' ? { type: 'json_object' as const } : undefined;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature: request.temperature ?? 0.8,
      max_tokens: request.maxTokens,
      response_format: responseFormat,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI returned empty response');
    }

    return {
      content,
      model: this.model,
      provider: 'openai',
    };
  }

  isAvailable(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }

  getProviderName(): string {
    return 'OpenAI';
  }
}

/**
 * Gemini Provider
 */
export class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey?: string, model: string = 'gemini-1.5-flash') {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = model;
  }

  async generate(request: AIGenerateRequest): Promise<AIGenerateResponse> {
    // Gemini は system と user を区別しないため、統合する
    const systemMessages = request.messages
      .filter((msg) => msg.role === 'system')
      .map((msg) => msg.content)
      .join('\n\n');

    const userMessages = request.messages
      .filter((msg) => msg.role === 'user')
      .map((msg) => msg.content)
      .join('\n\n');

    const fullPrompt = systemMessages
      ? `${systemMessages}\n\n---\n\n${userMessages}`
      : userMessages;

    // モデルの取得と設定
    const generationConfig: any = {
      temperature: request.temperature ?? 0.8,
      maxOutputTokens: request.maxTokens,
    };

    // JSON モードの設定
    if (request.responseFormat === 'json') {
      generationConfig.responseMimeType = 'application/json';
    }

    const model = this.client.getGenerativeModel({
      model: this.model,
      generationConfig,
    });

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const content = response.text();

    if (!content) {
      throw new Error('Gemini returned empty response');
    }

    return {
      content,
      model: this.model,
      provider: 'gemini',
    };
  }

  isAvailable(): boolean {
    return !!process.env.GEMINI_API_KEY;
  }

  getProviderName(): string {
    return 'Gemini';
  }
}

/**
 * プロバイダーのファクトリー関数
 * 環境変数に基づいて適切なプロバイダーを返す
 */
export function createAIProvider(options?: {
  preferProvider?: 'openai' | 'gemini';
  model?: string;
}): AIProvider {
  const preferProvider = options?.preferProvider || process.env.AI_PROVIDER || 'openai';

  // 優先プロバイダーを試す
  if (preferProvider === 'gemini' && process.env.GEMINI_API_KEY) {
    return new GeminiProvider(
      process.env.GEMINI_API_KEY,
      options?.model || process.env.GEMINI_MODEL || 'gemini-1.5-flash'
    );
  }

  if (preferProvider === 'openai' && process.env.OPENAI_API_KEY) {
    return new OpenAIProvider(
      process.env.OPENAI_API_KEY,
      options?.model || 'gpt-4o-mini'
    );
  }

  // フォールバック: 利用可能なプロバイダーを探す
  if (process.env.OPENAI_API_KEY) {
    return new OpenAIProvider(
      process.env.OPENAI_API_KEY,
      options?.model || 'gpt-4o-mini'
    );
  }

  if (process.env.GEMINI_API_KEY) {
    return new GeminiProvider(
      process.env.GEMINI_API_KEY,
      options?.model || 'gemini-1.5-flash'
    );
  }

  throw new Error('No AI provider available. Please set OPENAI_API_KEY or GEMINI_API_KEY');
}

/**
 * モデル設定のヘルパー
 */
export const AI_MODELS = {
  // 思考・構成フェーズ用（コスト重視）
  planning: {
    openai: 'gpt-4o-mini',
    gemini: 'gemini-1.5-flash',
  },
  // 文章生成フェーズ用（品質重視）
  writing: {
    openai: 'gpt-4o-2024-08-06',
    gemini: 'gemini-1.5-pro',
  },
} as const;

/**
 * フェーズに応じたプロバイダーを取得
 */
export function getProviderForPhase(phase: 'planning' | 'writing'): AIProvider {
  const preferProvider = (process.env.AI_PROVIDER || 'openai') as 'openai' | 'gemini';
  const model = AI_MODELS[phase][preferProvider];

  return createAIProvider({
    preferProvider,
    model,
  });
}




