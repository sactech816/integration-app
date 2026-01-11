/**
 * AI Provider Abstraction Layer
 * OpenAI、Gemini、Anthropic を統一的に扱うための抽象化レイヤー
 */

import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { PlanTier, getAIModelForPlan, getAIProviderForPlan } from './subscription';

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
  provider: 'openai' | 'gemini' | 'anthropic';
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
 * Anthropic Provider
 */
export class AnthropicProvider implements AIProvider {
  private client: Anthropic;
  private model: string;

  constructor(apiKey?: string, model: string = 'claude-3-haiku-20240307') {
    if (!apiKey) {
      throw new Error('Anthropic API key is required');
    }
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async generate(request: AIGenerateRequest): Promise<AIGenerateResponse> {
    // System メッセージと User/Assistant メッセージを分離
    const systemMessages = request.messages
      .filter((msg) => msg.role === 'system')
      .map((msg) => msg.content)
      .join('\n\n');

    // User と Assistant メッセージを Anthropic 形式に変換
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    
    for (const msg of request.messages) {
      if (msg.role === 'system') continue;
      
      // Anthropic では 'user' と 'assistant' のみサポート
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // リクエストパラメータの構築
    const params: any = {
      model: this.model,
      max_tokens: request.maxTokens || 4096,
      messages: messages,
    };

    // System メッセージがある場合は追加
    if (systemMessages) {
      params.system = systemMessages;
    }

    // Temperature の設定（Anthropic では 0-1 の範囲）
    if (request.temperature !== undefined) {
      params.temperature = request.temperature;
    }

    // JSON モードの設定
    if (request.responseFormat === 'json') {
      params.response_format = { type: 'json_object' };
    }

    const response = await this.client.messages.create(params);

    // レスポンスからテキストコンテンツを取得
    const contentBlock = response.content[0];
    if (!contentBlock || contentBlock.type !== 'text') {
      throw new Error('Anthropic returned non-text response');
    }

    const content = contentBlock.text;
    if (!content) {
      throw new Error('Anthropic returned empty response');
    }

    return {
      content,
      model: this.model,
      provider: 'anthropic',
    };
  }

  isAvailable(): boolean {
    return !!process.env.ANTHROPIC_API_KEY;
  }

  getProviderName(): string {
    return 'Anthropic';
  }
}

/**
 * プロバイダーのファクトリー関数
 * 環境変数に基づいて適切なプロバイダーを返す
 */
export function createAIProvider(options?: {
  preferProvider?: 'openai' | 'gemini' | 'anthropic';
  model?: string;
}): AIProvider {
  const preferProvider = options?.preferProvider || process.env.AI_PROVIDER || 'openai';

  // 優先プロバイダーを試す
  if (preferProvider === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
    return new AnthropicProvider(
      process.env.ANTHROPIC_API_KEY,
      options?.model || 'claude-3-haiku-20240307'
    );
  }

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

  if (process.env.ANTHROPIC_API_KEY) {
    return new AnthropicProvider(
      process.env.ANTHROPIC_API_KEY,
      options?.model || 'claude-3-haiku-20240307'
    );
  }

  if (process.env.GEMINI_API_KEY) {
    return new GeminiProvider(
      process.env.GEMINI_API_KEY,
      options?.model || process.env.GEMINI_MODEL || 'gemini-1.5-flash'
    );
  }

  throw new Error('No AI provider available. Please set OPENAI_API_KEY, GEMINI_API_KEY, or ANTHROPIC_API_KEY');
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
 * プラン別AIモデルプリセット設定
 */
export const PLAN_AI_PRESETS = {
  lite: {
    presetA: {
      name: 'コスト特化',
      outline: { model: 'gemini-2.0-flash-lite', provider: 'gemini' as const, cost: 0.30 },
      writing: { model: 'gemini-2.0-flash-lite', provider: 'gemini' as const, cost: 0.30 },
      description: 'Flash-Liteで最安値。速度重視の量産向け。',
    },
    presetB: {
      name: 'バランス',
      outline: { model: 'gemini-2.0-flash-exp', provider: 'gemini' as const, cost: 0.40 },
      writing: { model: 'gemini-2.0-flash-exp', provider: 'gemini' as const, cost: 0.40 },
      description: 'Flashで統一。指示理解度が高く、実用的。（推奨）',
    },
  },
  standard: {
    presetA: {
      name: '利益重視',
      outline: { model: 'gemini-2.0-flash-exp', provider: 'gemini' as const, cost: 0.40 },
      writing: { model: 'claude-3-haiku-20240307', provider: 'anthropic' as const, cost: 1.25 },
      description: 'Flashで構成、Haikuで執筆。コストを抑えつつ品質向上。',
    },
    presetB: {
      name: '品質重視',
      outline: { model: 'claude-3-haiku-20240307', provider: 'anthropic' as const, cost: 1.25 },
      writing: { model: 'gemini-2.0-flash-exp', provider: 'gemini' as const, cost: 0.40 },
      description: 'Haikuで人間味のある構成、Flashで大量執筆。（推奨）',
    },
  },
  pro: {
    presetA: {
      name: '論理重視',
      outline: { model: 'o3-mini', provider: 'openai' as const, cost: 4.40 },
      writing: { model: 'o3-mini', provider: 'openai' as const, cost: 4.40 },
      description: 'o3-miniで統一。売れるロジックと賢い執筆。',
    },
    presetB: {
      name: '情緒重視',
      outline: { model: 'claude-3-5-sonnet-20240620', provider: 'anthropic' as const, cost: 15.00 },
      writing: { model: 'claude-3-haiku-20240307', provider: 'anthropic' as const, cost: 1.25 },
      description: 'Sonnetでエモい構成、Haikuで執筆。※構成のみ高コスト',
    },
  },
  business: {
    presetA: {
      name: '最高峰',
      outline: { model: 'o1', provider: 'openai' as const, cost: 60.00 },
      writing: { model: 'claude-3-5-sonnet-20240620', provider: 'anthropic' as const, cost: 15.00 },
      description: 'o1で最高の構成、Sonnetで最高品質の執筆。',
    },
    presetB: {
      name: '推論特化',
      outline: { model: 'claude-3-5-sonnet-20240620', provider: 'anthropic' as const, cost: 15.00 },
      writing: { model: 'o1', provider: 'openai' as const, cost: 60.00 },
      description: 'Sonnetで構成、o1で深い推論執筆。※執筆が遅い',
    },
  },
  none: {
    presetA: {
      name: '無料トライアル',
      outline: { model: 'gemini-2.0-flash-exp', provider: 'gemini' as const, cost: 0.40 },
      writing: { model: 'gemini-2.0-flash-exp', provider: 'gemini' as const, cost: 0.40 },
      description: 'Gemini Flashでお試し利用。',
    },
    presetB: {
      name: '無料トライアル',
      outline: { model: 'gemini-2.0-flash-exp', provider: 'gemini' as const, cost: 0.40 },
      writing: { model: 'gemini-2.0-flash-exp', provider: 'gemini' as const, cost: 0.40 },
      description: 'Gemini Flashでお試し利用。',
    },
  },
  enterprise: {
    presetA: {
      name: 'カスタム',
      outline: { model: 'custom', provider: 'openai' as const, cost: 0 },
      writing: { model: 'custom', provider: 'openai' as const, cost: 0 },
      description: 'カスタムAI環境（要設定）',
    },
    presetB: {
      name: 'カスタム',
      outline: { model: 'custom', provider: 'openai' as const, cost: 0 },
      writing: { model: 'custom', provider: 'openai' as const, cost: 0 },
      description: 'カスタムAI環境（要設定）',
    },
  },
} as const;

/**
 * ハイブリッドクレジットシステム用モデル設定（レガシー互換）
 * quality: 高品質AI（Premium Credits使用）
 * speed: 高速AI（Standard Credits使用）
 */
export const MODEL_CONFIG = {
  quality: {
    outline: 'o3-mini',                      // 構成作成用（高品質）
    writing: 'claude-3-5-sonnet-20240620',  // 執筆用（高品質）
    provider: 'openai' as const,            // OpenAI系モデル
  },
  speed: {
    outline: 'gemini-2.0-flash-exp',        // 構成作成用（高速）
    writing: 'gemini-2.0-flash-exp',        // 執筆用（高速）
    provider: 'gemini' as const,            // Gemini系モデル
  },
} as const;

/**
 * プランとプリセットからAIプロバイダーを取得
 */
export function getProviderForPlanAndPreset(
  planTier: PlanTier,
  preset: 'presetA' | 'presetB',
  phase: 'outline' | 'writing'
): AIProvider {
  const planPresets = PLAN_AI_PRESETS[planTier];
  const selectedPreset = planPresets[preset];
  const config = selectedPreset[phase];

  return createAIProvider({
    preferProvider: config.provider,
    model: config.model,
  });
}

/**
 * 管理者設定からAIプロバイダーを取得
 * admin_ai_settingsテーブルに保存された設定を使用
 */
export async function getProviderFromAdminSettings(
  phase: 'outline' | 'writing'
): Promise<AIProvider> {
  // TODO: admin_ai_settingsから設定を取得
  // 現在はデフォルトでpresetBを使用
  return getProviderForPlanAndPreset('standard', 'presetB', phase);
}

/**
 * プラン別AIモデル情報を取得（フロントエンド表示用）
 */
export function getAIPresetsForPlan(planTier: PlanTier) {
  return PLAN_AI_PRESETS[planTier];
}

/**
 * モード（quality/speed）からモデル名を取得
 */
export function getModelForMode(
  mode: 'quality' | 'speed',
  phase: 'outline' | 'writing'
): string {
  return MODEL_CONFIG[mode][phase];
}

/**
 * モード（quality/speed）からプロバイダーを取得
 */
export function getProviderForMode(mode: 'quality' | 'speed'): 'openai' | 'gemini' {
  return MODEL_CONFIG[mode].provider;
}

/**
 * モードとフェーズからAIプロバイダーを取得
 */
export function getProviderForModeAndPhase(
  mode: 'quality' | 'speed',
  phase: 'outline' | 'writing'
): AIProvider {
  const provider = getProviderForMode(mode);
  const model = getModelForMode(mode, phase);

  return createAIProvider({
    preferProvider: provider,
    model,
  });
}

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

/**
 * プランTierに応じたプロバイダーを取得
 * 
 * プランごとに使用するAIモデルが異なる:
 * - none/lite: Gemini Flash（標準AI）
 * - standard/pro: GPT-4o-mini（標準AI+/高性能AI）
 * - business/enterprise: GPT-4o（最高性能AI）
 */
export function getProviderForPlanTier(planTier: PlanTier): AIProvider {
  const preferProvider = getAIProviderForPlan(planTier);
  const model = getAIModelForPlan(planTier);

  return createAIProvider({
    preferProvider,
    model,
  });
}

/**
 * プランTierとフェーズに応じたプロバイダーを取得
 * 
 * 上位プランでは執筆フェーズでより高品質なモデルを使用
 */
export function getProviderForPlanAndPhase(
  planTier: PlanTier, 
  phase: 'planning' | 'writing'
): AIProvider {
  // プランに応じた基本プロバイダーを取得
  const baseProvider = getAIProviderForPlan(planTier);
  
  // プランに応じたモデルを取得
  let model = getAIModelForPlan(planTier);
  
  // 執筆フェーズでは、上位プランの場合より高品質なモデルを使用
  if (phase === 'writing') {
    switch (planTier) {
      case 'business':
      case 'enterprise':
        // ビジネス/エンタープライズは常にGPT-4o
        model = 'gpt-4o';
        break;
      case 'pro':
        // プロは執筆時もGPT-4o-mini（十分な品質）
        model = 'gpt-4o-mini';
        break;
      case 'standard':
        // スタンダードは執筆時もGPT-4o-mini
        model = 'gpt-4o-mini';
        break;
      default:
        // ライト以下はGemini Flash
        model = 'gemini-1.5-flash';
    }
  }

  return createAIProvider({
    preferProvider: baseProvider,
    model,
  });
}

/**
 * プランTierからAIモデル表示名を取得（ユーザー向け）
 */
export function getAIModelDisplayName(planTier: PlanTier): string {
  switch (planTier) {
    case 'business':
    case 'enterprise':
      return '最高性能AI';
    case 'pro':
      return '高性能AI';
    case 'standard':
      return '標準AI+';
    case 'lite':
    case 'none':
    default:
      return '標準AI';
  }
}
























