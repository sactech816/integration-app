/**
 * AI Provider Abstraction Layer
 * OpenAI、Gemini、Anthropic を統一的に扱うための抽象化レイヤー
 */

import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { PlanTier, getAIModelForPlan, getAIProviderForPlan } from './subscription';

// Supabase Service Client（サーバーサイド用）
function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceKey);
}

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
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
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

    // o1/o3系モデルは max_completion_tokens を使用、それ以外は max_tokens
    const isReasoningModel = this.model.startsWith('o1') || this.model.startsWith('o3');
    
    const completionParams: any = {
      model: this.model,
      messages,
      response_format: responseFormat,
    };

    // o1/o3系は temperature をサポートしない
    if (!isReasoningModel) {
      completionParams.temperature = request.temperature ?? 0.8;
    }

    // トークン制限パラメータの設定
    if (request.maxTokens) {
      if (isReasoningModel) {
        completionParams.max_completion_tokens = request.maxTokens;
      } else {
        completionParams.max_tokens = request.maxTokens;
      }
    }

    const response = await this.client.chat.completions.create(completionParams);

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI returned empty response');
    }

    // トークン使用量を取得
    const usage = response.usage ? {
      inputTokens: response.usage.prompt_tokens || 0,
      outputTokens: response.usage.completion_tokens || 0,
    } : undefined;

    return {
      content,
      model: this.model,
      provider: 'openai',
      usage,
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

    // トークン使用量を取得
    const usageMetadata = response.usageMetadata;
    const usage = usageMetadata ? {
      inputTokens: usageMetadata.promptTokenCount || 0,
      outputTokens: usageMetadata.candidatesTokenCount || 0,
    } : undefined;

    return {
      content,
      model: this.model,
      provider: 'gemini',
      usage,
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

    // トークン使用量を取得
    const usage = response.usage ? {
      inputTokens: response.usage.input_tokens || 0,
      outputTokens: response.usage.output_tokens || 0,
    } : undefined;

    return {
      content,
      model: this.model,
      provider: 'anthropic',
      usage,
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
 * 利用可能なAIモデル一覧（管理者設定用）
 * 価格は1Mトークンあたりのドル
 */
export interface AIModelInfo {
  id: string;
  name: string;
  provider: 'OpenAI' | 'Google' | 'Anthropic';
  inputCost: number;      // 入力コスト（$/1M tokens）
  outputCost: number;     // 出力コスト（$/1M tokens）
  cachedInputCost?: number; // キャッシュ入力コスト（$/1M tokens）
  contextLength: string;  // コンテキスト長
  performance: number;    // 性能レベル（1-6）
  status: 'recommended' | 'available' | 'preview';
  description: string;
}

export const AVAILABLE_AI_MODELS: AIModelInfo[] = [
  // ========================================
  // OpenAI GPT Models
  // ========================================
  {
    id: 'gpt-5.1',
    name: 'GPT-5.1',
    provider: 'OpenAI',
    inputCost: 1.25,
    outputCost: 10.00,
    cachedInputCost: 0.125,
    contextLength: '128K tokens',
    performance: 6,
    status: 'available',
    description: '最新フラッグシップモデル',
  },
  {
    id: 'gpt-5',
    name: 'GPT-5',
    provider: 'OpenAI',
    inputCost: 1.25,
    outputCost: 10.00,
    cachedInputCost: 0.125,
    contextLength: '128K tokens',
    performance: 6,
    status: 'available',
    description: 'フラッグシップモデル',
  },
  {
    id: 'gpt-5-mini',
    name: 'GPT-5 Mini',
    provider: 'OpenAI',
    inputCost: 0.25,
    outputCost: 2.00,
    cachedInputCost: 0.025,
    contextLength: '128K tokens',
    performance: 4,
    status: 'available',
    description: '高性能・コスパ良好',
  },
  {
    id: 'gpt-5-nano',
    name: 'GPT-5 Nano',
    provider: 'OpenAI',
    inputCost: 0.05,
    outputCost: 0.40,
    cachedInputCost: 0.005,
    contextLength: '128K tokens',
    performance: 3,
    status: 'recommended',
    description: '最安値・大量処理向け',
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    inputCost: 0.15,
    outputCost: 0.60,
    cachedInputCost: 0.075,
    contextLength: '128K tokens',
    performance: 4,
    status: 'available',
    description: '安定・実績あり',
  },
  // ========================================
  // OpenAI Reasoning Models (o1/o3系)
  // ========================================
  {
    id: 'o3-mini',
    name: 'o3 Mini',
    provider: 'OpenAI',
    inputCost: 1.10,
    outputCost: 4.40,
    contextLength: '200K tokens',
    performance: 5,
    status: 'available',
    description: '推論特化・コスパ良好',
  },
  {
    id: 'o1',
    name: 'o1',
    provider: 'OpenAI',
    inputCost: 15.00,
    outputCost: 60.00,
    contextLength: '200K tokens',
    performance: 6,
    status: 'available',
    description: '最高峰推論モデル',
  },
  {
    id: 'o1-mini',
    name: 'o1 Mini',
    provider: 'OpenAI',
    inputCost: 3.00,
    outputCost: 12.00,
    contextLength: '128K tokens',
    performance: 5,
    status: 'available',
    description: '推論特化・軽量版',
  },
  // ========================================
  // Google Gemini Models
  // ========================================
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    provider: 'Google',
    inputCost: 0.075,
    outputCost: 0.30,
    contextLength: '1M tokens',
    performance: 3,
    status: 'recommended',
    description: '最安・大量処理向け',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    inputCost: 0.10,
    outputCost: 0.40,
    contextLength: '1M tokens',
    performance: 4,
    status: 'recommended',
    description: 'コスパ最強・万能',
  },
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash Preview',
    provider: 'Google',
    inputCost: 0.50,
    outputCost: 3.00,
    contextLength: '1M tokens',
    performance: 4,
    status: 'preview',
    description: '次世代プレビュー',
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    inputCost: 1.25,
    outputCost: 10.00,
    contextLength: '2M tokens',
    performance: 5,
    status: 'available',
    description: '高精度・長文分析',
  },
  {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro Preview',
    provider: 'Google',
    inputCost: 2.00,
    outputCost: 12.00,
    contextLength: '2M tokens',
    performance: 6,
    status: 'preview',
    description: '最高性能（プレビュー）',
  },
  // ========================================
  // Anthropic Claude Models
  // ========================================
  // Claude 4.5シリーズ（最新）
  {
    id: 'claude-sonnet-4-5-20250929',
    name: 'Claude Sonnet 4.5',
    provider: 'Anthropic',
    inputCost: 3.00,
    outputCost: 15.00,
    contextLength: '200K tokens',
    performance: 5,
    status: 'recommended',
    description: '最新Sonnet・高性能推奨',
  },
  {
    id: 'claude-haiku-4-5-20251001',
    name: 'Claude Haiku 4.5',
    provider: 'Anthropic',
    inputCost: 1.00,
    outputCost: 5.00,
    contextLength: '200K tokens',
    performance: 4,
    status: 'recommended',
    description: '最新Haiku・最速コスパ良好',
  },
  // Claude 3.5シリーズ
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet v2',
    provider: 'Anthropic',
    inputCost: 3.00,
    outputCost: 15.00,
    contextLength: '200K tokens',
    performance: 4,
    status: 'available',
    description: '3.5 Sonnet最新版',
  },
  {
    id: 'claude-3-5-sonnet-20240620',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    inputCost: 3.00,
    outputCost: 15.00,
    contextLength: '200K tokens',
    performance: 4,
    status: 'available',
    description: '3.5 Sonnet初期版',
  },
  // Claude 3シリーズ
  {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    inputCost: 0.25,
    outputCost: 1.25,
    contextLength: '200K tokens',
    performance: 3,
    status: 'available',
    description: '最安・軽量モデル',
  },
];

/**
 * デフォルトのAIモデル設定（最安値）
 */
export const DEFAULT_AI_MODELS = {
  primary: {
    outline: 'gpt-4o-mini',    // 構成用: $0.15/入力（バランス良好）
    writing: 'gpt-4o-mini',    // 執筆用: $0.15/入力（バランス良好）
  },
  backup: {
    outline: 'gemini-2.5-flash-lite',  // バックアップ構成用（最安値）
    writing: 'gemini-2.5-flash-lite',  // バックアップ執筆用（最安値）
  },
} as const;

/**
 * モデルIDからプロバイダーを推測
 */
export function getProviderFromModelId(modelId: string): 'openai' | 'gemini' | 'anthropic' {
  if (modelId.startsWith('gpt') || modelId.startsWith('o1') || modelId.startsWith('o3')) {
    return 'openai';
  }
  if (modelId.startsWith('gemini')) {
    return 'gemini';
  }
  if (modelId.startsWith('claude')) {
    return 'anthropic';
  }
  return 'gemini'; // デフォルト
}

/**
 * admin_ai_settingsの設定型
 */
export interface AdminAISettingsResult {
  model: string;
  backupModel: string;
}

/**
 * モデルIDが有効かどうかをチェック
 */
function isValidModelId(modelId: string): boolean {
  return AVAILABLE_AI_MODELS.some(m => m.id === modelId);
}

/**
 * admin_ai_settingsからAI設定を取得（共通関数）
 * 
 * @param service - サービス識別子（'kdl' | 'makers'）
 * @param planTier - プランTier
 * @param phase - フェーズ（'outline' | 'writing'）
 * @returns モデルとバックアップモデルの設定
 */
export async function getAISettingsFromAdmin(
  service: 'kdl' | 'makers',
  planTier: string,
  phase: 'outline' | 'writing'
): Promise<AdminAISettingsResult> {
  const supabase = getServiceClient();
  
  const defaultSettings: AdminAISettingsResult = {
    model: DEFAULT_AI_MODELS.primary[phase],
    backupModel: DEFAULT_AI_MODELS.backup[phase],
  };

  if (!supabase) {
    console.warn('[AI Settings] Supabase client not available, using defaults');
    return defaultSettings;
  }

  try {
    const modelColumn = phase === 'outline' ? 'custom_outline_model' : 'custom_writing_model';
    const backupColumn = phase === 'outline' ? 'backup_outline_model' : 'backup_writing_model';

    const { data, error } = await supabase
      .from('admin_ai_settings')
      .select(`${modelColumn}, ${backupColumn}`)
      .eq('service', service)
      .eq('plan_tier', planTier)
      .single();

    if (error || !data) {
      console.warn(`[AI Settings] No settings found for service=${service}, plan=${planTier}, phase=${phase}, using defaults`);
      return defaultSettings;
    }

    const model = data[modelColumn as keyof typeof data] as string;
    const backupModel = data[backupColumn as keyof typeof data] as string;

    // 無効なモデル名の場合はデフォルトにフォールバック
    const validModel = model && isValidModelId(model) ? model : defaultSettings.model;
    const validBackupModel = backupModel && isValidModelId(backupModel) ? backupModel : defaultSettings.backupModel;

    if (model && !isValidModelId(model)) {
      console.warn(`[AI Settings] Invalid model "${model}" for service=${service}, plan=${planTier}, phase=${phase}, falling back to "${validModel}"`);
    }
    if (backupModel && !isValidModelId(backupModel)) {
      console.warn(`[AI Settings] Invalid backup model "${backupModel}" for service=${service}, plan=${planTier}, phase=${phase}, falling back to "${validBackupModel}"`);
    }

    console.log(`[AI Settings] Loaded: service=${service}, plan=${planTier}, phase=${phase}, model=${validModel}, backup=${validBackupModel}`);

    return {
      model: validModel,
      backupModel: validBackupModel,
    };
  } catch (err) {
    console.error('[AI Settings] Failed to get AI settings:', err);
    return defaultSettings;
  }
}

/**
 * モデルIDからモデル情報を取得
 */
export function getModelInfo(modelId: string): AIModelInfo | undefined {
  return AVAILABLE_AI_MODELS.find(m => m.id === modelId);
}

/**
 * プロバイダー別にモデルをグループ化
 */
export function getModelsByProvider(): Record<string, AIModelInfo[]> {
  return AVAILABLE_AI_MODELS.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, AIModelInfo[]>);
}

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
    // カスタム用おすすめ設定
    customDefault: {
      outlineModel: 'gemini-2.0-flash-exp',
      writingModel: 'claude-3-haiku-20240307',
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
    // カスタム用おすすめ設定
    customDefault: {
      outlineModel: 'gpt-4o-mini',
      writingModel: 'claude-3-haiku-20240307',
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
    // カスタム用おすすめ設定
    customDefault: {
      outlineModel: 'claude-3-5-sonnet-20240620',
      writingModel: 'gpt-4o-mini',
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
    // カスタム用おすすめ設定
    customDefault: {
      outlineModel: 'o3-mini',
      writingModel: 'claude-3-5-sonnet-20240620',
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
    // カスタム用おすすめ設定
    customDefault: {
      outlineModel: 'gemini-2.0-flash-exp',
      writingModel: 'gemini-2.0-flash-exp',
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
    // カスタム用おすすめ設定
    customDefault: {
      outlineModel: 'gpt-4o',
      writingModel: 'claude-3-5-sonnet-20240620',
    },
  },
  // ========================================
  // 集客メーカー用プラン（診断・LP生成など、執筆ではない用途）
  // 候補A: 論理重視（1つのAI）、候補B: 情緒重視（1つのAI）
  // ========================================
  guest: {
    presetA: {
      name: '論理重視',
      outline: { model: 'gemini-2.0-flash-exp', provider: 'gemini' as const, cost: 0.40 },
      writing: { model: 'gemini-2.0-flash-exp', provider: 'gemini' as const, cost: 0.40 },
      description: 'Gemini Flash。論理的で分かりやすい出力。',
    },
    presetB: {
      name: '情緒重視',
      outline: { model: 'claude-3-haiku-20240307', provider: 'anthropic' as const, cost: 1.25 },
      writing: { model: 'claude-3-haiku-20240307', provider: 'anthropic' as const, cost: 1.25 },
      description: 'Claude Haiku。人間味のある温かい出力。',
    },
    // カスタム用おすすめ設定
    customDefault: {
      outlineModel: 'gemini-2.0-flash-exp',
      writingModel: 'gemini-2.0-flash-exp',
    },
  },
  free: {
    presetA: {
      name: '論理重視',
      outline: { model: 'gemini-2.0-flash-exp', provider: 'gemini' as const, cost: 0.40 },
      writing: { model: 'gemini-2.0-flash-exp', provider: 'gemini' as const, cost: 0.40 },
      description: 'Gemini Flash。論理的で分かりやすい出力。',
    },
    presetB: {
      name: '情緒重視',
      outline: { model: 'claude-3-haiku-20240307', provider: 'anthropic' as const, cost: 1.25 },
      writing: { model: 'claude-3-haiku-20240307', provider: 'anthropic' as const, cost: 1.25 },
      description: 'Claude Haiku。人間味のある温かい出力。',
    },
    // カスタム用おすすめ設定
    customDefault: {
      outlineModel: 'gpt-4o-mini',
      writingModel: 'gpt-4o-mini',
    },
  },
  // 集客メーカー Pro（有料）
  makers_pro: {
    presetA: {
      name: '論理重視',
      outline: { model: 'gpt-4o-mini', provider: 'openai' as const, cost: 0.60 },
      writing: { model: 'gpt-4o-mini', provider: 'openai' as const, cost: 0.60 },
      description: 'GPT-4o Mini。論理的で高品質な出力。',
    },
    presetB: {
      name: '情緒重視',
      outline: { model: 'claude-3-5-sonnet-20240620', provider: 'anthropic' as const, cost: 15.00 },
      writing: { model: 'claude-3-5-sonnet-20240620', provider: 'anthropic' as const, cost: 15.00 },
      description: 'Claude Sonnet。情緒豊かで共感を呼ぶ出力。',
    },
    // カスタム用おすすめ設定
    customDefault: {
      outlineModel: 'claude-3-5-sonnet-20240620',
      writingModel: 'claude-3-5-sonnet-20240620',
    },
  },
  // ========================================
  // Kindle初回プラン（一括）
  // ========================================
  initial_trial: {
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
    // カスタム用おすすめ設定
    customDefault: {
      outlineModel: 'gemini-2.0-flash-exp',
      writingModel: 'claude-3-haiku-20240307',
    },
  },
  initial_standard: {
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
    // カスタム用おすすめ設定
    customDefault: {
      outlineModel: 'gpt-4o-mini',
      writingModel: 'claude-3-haiku-20240307',
    },
  },
  initial_business: {
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
    // カスタム用おすすめ設定
    customDefault: {
      outlineModel: 'claude-3-5-sonnet-20240620',
      writingModel: 'gpt-4o-mini',
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
    outline: 'o3-mini',                       // 構成作成用（高品質）
    writing: 'claude-sonnet-4-5-20250929',   // 執筆用（Claude Sonnet 4.5）
    provider: 'openai' as const,              // OpenAI系モデル（outlineに合わせる）
  },
  speed: {
    outline: 'gemini-2.5-flash',              // 構成作成用（高速）
    writing: 'gemini-2.5-flash',              // 執筆用（高速）
    provider: 'gemini' as const,              // Gemini系モデル
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
 * 管理者設定からAIプロバイダーとモデル情報を取得
 * admin_ai_settingsテーブルに保存された設定を使用
 * 
 * @param service - サービス識別子（'kdl' | 'makers'）
 * @param planTier - プランTier（'none', 'lite', 'standard', 'pro', 'business', 'enterprise', etc.）
 * @param phase - フェーズ（'outline' = 構成用, 'writing' = 執筆用）
 * @returns プロバイダー、モデル、バックアップモデルの情報
 */
export async function getProviderFromAdminSettings(
  service: 'kdl' | 'makers',
  planTier: string,
  phase: 'outline' | 'writing'
): Promise<{
  provider: AIProvider;
  model: string;
  backupModel: string;
  backupProvider: AIProvider;
}> {
  const settings = await getAISettingsFromAdmin(service, planTier, phase);
  
  const provider = createAIProvider({
    preferProvider: getProviderFromModelId(settings.model),
    model: settings.model,
  });

  const backupProvider = createAIProvider({
    preferProvider: getProviderFromModelId(settings.backupModel),
    model: settings.backupModel,
  });

  return {
    provider,
    model: settings.model,
    backupModel: settings.backupModel,
    backupProvider,
  };
}

/**
 * フォールバック付きでAI生成を実行
 * メインモデルが失敗した場合、バックアップモデルで再試行
 * 
 * @param mainProvider - メインのAIプロバイダー
 * @param backupProvider - バックアップのAIプロバイダー
 * @param request - AI生成リクエスト
 * @param context - ログ用のコンテキスト情報
 * @returns AI生成レスポンス
 */
export async function generateWithFallback(
  mainProvider: AIProvider,
  backupProvider: AIProvider,
  request: AIGenerateRequest,
  context: { service: string; phase: string; model: string; backupModel: string }
): Promise<AIGenerateResponse> {
  try {
    console.log(`[AI Generate] Starting with model=${context.model}, service=${context.service}, phase=${context.phase}`);
    const response = await mainProvider.generate(request);
    console.log(`[AI Generate] Success with model=${context.model}`);
    return response;
  } catch (mainError) {
    console.warn(`[AI Generate] Main model failed (${context.model}):`, mainError);
    console.log(`[AI Generate] Falling back to backup model=${context.backupModel}`);
    
    try {
      const backupResponse = await backupProvider.generate(request);
      console.log(`[AI Generate] Success with backup model=${context.backupModel}`);
      return backupResponse;
    } catch (backupError) {
      console.error(`[AI Generate] Backup model also failed (${context.backupModel}):`, backupError);
      throw new Error(`AI generation failed. Main: ${mainError}, Backup: ${backupError}`);
    }
  }
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
 * モデル名から自動的にプロバイダーを判定
 */
export function getProviderForModeAndPhase(
  mode: 'quality' | 'speed',
  phase: 'outline' | 'writing'
): AIProvider {
  const model = getModelForMode(mode, phase);
  // モデル名からプロバイダーを自動判定
  const provider = getProviderFromModelId(model);

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
























