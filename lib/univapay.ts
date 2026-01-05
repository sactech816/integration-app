/**
 * UnivaPay API クライアント
 * 
 * 環境変数:
 * - UNIVAPAY_APP_TOKEN: アプリトークン
 * - UNIVAPAY_SECRET: シークレットキー
 * - UNIVAPAY_STORE_ID: 店舗ID（オプション）
 */

const UNIVAPAY_API_URL = process.env.UNIVAPAY_API_URL || 'https://api.univapay.com';

export interface UnivaPayConfig {
  appToken: string;
  secret: string;
  storeId?: string;
}

export interface SubscriptionPlan {
  amount: number;
  currency: string;
  period: 'monthly' | 'yearly';
  name: string;
  description?: string;
}

export interface CreateSubscriptionParams {
  email: string;
  amount: number;
  currency?: string;
  period?: 'monthly' | 'yearly';
  metadata?: Record<string, string>;
  successUrl?: string;
  cancelUrl?: string;
}

export interface UnivaPaySubscription {
  id: string;
  status: string;
  amount: number;
  currency: string;
  period: string;
  nextPaymentDate?: string;
  createdAt: string;
}

export interface UnivaPayWebhookEvent {
  event: string;
  data: {
    id: string;
    status: string;
    amount?: number;
    currency?: string;
    metadata?: Record<string, string>;
    subscription?: {
      id: string;
      status: string;
    };
    [key: string]: unknown;
  };
}

/**
 * UnivaPay APIクライアントクラス
 */
export class UnivaPayClient {
  private appToken: string;
  private secret: string;
  private storeId?: string;
  private baseUrl: string;

  constructor(config?: Partial<UnivaPayConfig>) {
    this.appToken = config?.appToken || process.env.UNIVAPAY_APP_TOKEN || '';
    this.secret = config?.secret || process.env.UNIVAPAY_SECRET || '';
    this.storeId = config?.storeId || process.env.UNIVAPAY_STORE_ID;
    this.baseUrl = UNIVAPAY_API_URL;
  }

  /**
   * 設定が有効かチェック
   */
  isConfigured(): boolean {
    return !!(this.appToken && this.secret);
  }

  /**
   * 認証ヘッダーを生成
   */
  private getAuthHeader(): string {
    const credentials = Buffer.from(`${this.appToken}:${this.secret}`).toString('base64');
    return `Basic ${credentials}`;
  }

  /**
   * APIリクエストを実行
   */
  private async request<T>(
    method: string,
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Authorization': this.getAuthHeader(),
      'Content-Type': 'application/json',
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`UnivaPay API Error: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  /**
   * トークンを作成（カード情報取得用）
   * 注: 実際のカード情報取得はフロントエンドのUnivaPay.jsで行う
   */
  async createToken(transactionToken: string): Promise<{ id: string }> {
    return this.request('POST', '/tokens', {
      transactionToken,
    });
  }

  /**
   * サブスクリプション（定期課金）を作成
   */
  async createSubscription(params: CreateSubscriptionParams): Promise<UnivaPaySubscription> {
    const body: Record<string, unknown> = {
      amount: params.amount,
      currency: params.currency || 'jpy',
      period: params.period || 'monthly',
      metadata: {
        email: params.email,
        ...params.metadata,
      },
    };

    if (this.storeId) {
      body.storeId = this.storeId;
    }

    return this.request('POST', '/subscriptions', body);
  }

  /**
   * サブスクリプションを取得
   */
  async getSubscription(subscriptionId: string): Promise<UnivaPaySubscription> {
    return this.request('GET', `/subscriptions/${subscriptionId}`);
  }

  /**
   * サブスクリプションをキャンセル
   */
  async cancelSubscription(subscriptionId: string): Promise<{ success: boolean }> {
    return this.request('DELETE', `/subscriptions/${subscriptionId}`);
  }

  /**
   * サブスクリプション一覧を取得
   */
  async listSubscriptions(params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: UnivaPaySubscription[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.offset) query.set('offset', params.offset.toString());
    
    const queryString = query.toString();
    const endpoint = `/subscriptions${queryString ? `?${queryString}` : ''}`;
    
    return this.request('GET', endpoint);
  }

  /**
   * Webhookイベントを検証
   */
  verifyWebhookSignature(
    payload: string,
    signature: string,
    webhookSecret: string
  ): boolean {
    // UnivaPay のWebhook署名検証ロジック
    // 実際の検証方法はUnivaPayのドキュメントに従う
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');
    
    return signature === expectedSignature;
  }
}

// シングルトンインスタンス
let univaPayClient: UnivaPayClient | null = null;

/**
 * UnivaPayクライアントのインスタンスを取得
 */
export function getUnivaPayClient(): UnivaPayClient {
  if (!univaPayClient) {
    univaPayClient = new UnivaPayClient();
  }
  return univaPayClient;
}

/**
 * UnivaPayが設定されているかチェック
 */
export function isUnivaPayConfigured(): boolean {
  return getUnivaPayClient().isConfigured();
}

// 月額サポートプラン定義
export const SUBSCRIPTION_PLANS = [
  { 
    id: 'monthly_1000', 
    amount: 1000, 
    label: '¥1,000', 
    description: 'ライトサポート',
    icon: 'coffee'
  },
  { 
    id: 'monthly_3000', 
    amount: 3000, 
    label: '¥3,000', 
    description: 'スタンダードサポート',
    icon: 'heart'
  },
  { 
    id: 'monthly_5000', 
    amount: 5000, 
    label: '¥5,000', 
    description: 'プレミアムサポート',
    icon: 'gift'
  },
  { 
    id: 'monthly_10000', 
    amount: 10000, 
    label: '¥10,000', 
    description: 'スペシャルサポート',
    icon: 'sparkles'
  },
] as const;

export type SubscriptionPlanId = typeof SUBSCRIPTION_PLANS[number]['id'];


