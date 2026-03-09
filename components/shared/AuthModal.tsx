import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { grantAffiliateSignupPoints } from '@/app/actions/affiliate';
import { getReferralCode, clearReferralCode } from '@/components/affiliate/AffiliateTracker';
import { claimGuestContent } from '@/app/actions/claim-guest-content';

/** インラインエラー表示コンポーネント */
const InlineError = ({ message }: { message: string | null }) => {
    if (!message) return null;
    return (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="whitespace-pre-line">{message}</span>
        </div>
    );
};

/** 成功メッセージ表示コンポーネント */
const InlineSuccess = ({ message }: { message: string | null }) => {
    if (!message) return null;
    return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
            {message}
        </div>
    );
};

const AuthModal = ({ isOpen, onClose, setUser, isPasswordReset = false, setShowPasswordReset = null, onNavigate, defaultTab = 'signup' }: {
    isOpen: boolean;
    onClose: () => void;
    setUser: (user: any) => void;
    isPasswordReset?: boolean;
    setShowPasswordReset?: ((show: boolean) => void) | null;
    onNavigate?: (page: string) => void;
    defaultTab?: 'login' | 'signup';
}) => {
    const [isLogin, setIsLogin] = useState(defaultTab === 'login');
    const [isResetMode, setIsResetMode] = useState(false);
    const [isChangePasswordMode, setIsChangePasswordMode] = useState(isPasswordReset);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const [resetEmailAddress, setResetEmailAddress] = useState('');
    const [canResend, setCanResend] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(0);

    // エラー・成功メッセージ（インライン表示）
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // パスワード表示/非表示の状態
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Google OAuth ローディング
    const [googleLoading, setGoogleLoading] = useState(false);

    // isPasswordResetが変更されたときにisChangePasswordModeを更新
    useEffect(() => {
        setIsChangePasswordMode(isPasswordReset);
    }, [isPasswordReset]);

    // 再送信タイマー
    useEffect(() => {
        if (resendCountdown > 0) {
            const timer = setTimeout(() => {
                setResendCountdown(resendCountdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (resendCountdown === 0 && resetSent) {
            setCanResend(true);
        }
    }, [resendCountdown, resetSent]);

    // メッセージクリア
    const clearMessages = () => {
        setErrorMessage(null);
        setSuccessMessage(null);
    };

    // ログイン成功後、ゲストが作成したコンテンツをユーザーに紐付ける
    const claimGuestContentIfAny = async (userId: string) => {
        try {
            const stored = localStorage.getItem('guest_content');
            if (!stored) return;
            const items = JSON.parse(stored);
            if (!Array.isArray(items) || items.length === 0) return;
            await claimGuestContent(userId, items);
            localStorage.removeItem('guest_content');
        } catch {}
    };

    if (!isOpen && !isPasswordReset) return null;

    /** エラーメッセージを日本語に変換 */
    const getErrorMessage = (error: any, isLoginMode: boolean): string => {
        const msg = error?.message || '';

        if (msg.includes('is invalid') || msg.includes('invalid format') || msg.includes('Unable to validate email')) {
            return 'メールアドレスの形式が正しくありません。\n正しいメールアドレスを入力してください。';
        }
        if (msg.includes('at least 6 characters') || msg.includes('Password should be')) {
            return 'パスワードは6文字以上で入力してください。';
        }
        if (msg.includes('password is too weak') || msg.includes('Password is too common')) {
            return 'パスワードが簡単すぎます。\n数字や記号を含めた、より強力なパスワードを設定してください。';
        }
        if (msg.includes('Invalid login credentials') || msg.includes('Invalid email or password')) {
            return isLoginMode
                ? 'メールアドレスまたはパスワードが正しくありません。'
                : 'メールアドレスまたはパスワードが正しくありません。';
        }
        if (msg.includes('Email not confirmed')) {
            return 'メールアドレスが確認されていません。確認メールをご確認ください。';
        }
        if (msg.includes('User not found')) {
            return 'このメールアドレスは登録されていません。';
        }
        if (msg.includes('Email rate limit exceeded')) {
            return '送信回数が上限に達しました。しばらく時間をおいてから再度お試しください。';
        }
        if (msg.includes('Network') || msg.includes('Failed to fetch') || msg.includes('Load failed') || msg.includes('fetch')) {
            return 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
        }
        if (msg.includes('500') || msg.includes('Internal Server Error')) {
            return 'サーバーエラーが発生しました。しばらく時間をおいてから再度お試しください。';
        }
        if (msg.includes('timeout') || msg.includes('timed out')) {
            return '接続がタイムアウトしました。もう一度お試しください。';
        }
        return `エラーが発生しました。もう一度お試しください。`;
    };

    /** Google OAuth ログイン */
    const handleGoogleLogin = async () => {
        if (!supabase) return;
        setGoogleLoading(true);
        clearMessages();
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) {
                setErrorMessage('Googleログインに失敗しました。もう一度お試しください。');
                setGoogleLoading(false);
            }
            // 成功時はリダイレクトされるので setGoogleLoading(false) は不要
        } catch {
            setErrorMessage('Googleログインに失敗しました。もう一度お試しください。');
            setGoogleLoading(false);
        }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        clearMessages();

        if (!supabase) {
            setErrorMessage('システムエラー: 認証サービスに接続できません。');
            setLoading(false);
            return;
        }

        try {
            const { data, error } = isLogin
                ? await supabase.auth.signInWithPassword({ email, password })
                : await supabase.auth.signUp({
                    email,
                    password,
                    options: { emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined }
                  });

            if (error) {
                // 重複メールアドレスのエラーハンドリング
                if (!isLogin && (
                    error.message.includes('already registered') ||
                    error.message.includes('User already registered') ||
                    error.message.includes('already been registered') ||
                    error.status === 422 ||
                    error.code === '23505'
                )) {
                    // パスワードが合っているか試してみる
                    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });

                    if (!loginError && loginData.user) {
                        setSuccessMessage('このメールアドレスは既に登録されています。自動的にログインしました。');
                        await claimGuestContentIfAny(loginData.user.id);
                        setTimeout(() => {
                            setUser(loginData.user);
                            if (setShowPasswordReset) setShowPasswordReset(false);
                            onClose();
                        }, 1500);
                        setLoading(false);
                        return;
                    } else {
                        setErrorMessage('このメールアドレスは既に登録されています。\nログインタブに切り替えてお試しください。\nパスワードを忘れた場合は「パスワードをお忘れですか？」をクリックしてください。');
                        setIsLogin(true);
                        setPassword('');
                        setLoading(false);
                        return;
                    }
                }
                throw error;
            }

            // 新規登録の場合
            if (!isLogin && data.user) {
                // 既存ユーザー検出（identities空）
                if (!data.session && data.user.identities && data.user.identities.length === 0) {
                    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });

                    if (!loginError && loginData.user) {
                        setSuccessMessage('このメールアドレスは既に登録されています。自動的にログインしました。');
                        await claimGuestContentIfAny(loginData.user.id);
                        setTimeout(() => {
                            setUser(loginData.user);
                            if (setShowPasswordReset) setShowPasswordReset(false);
                            onClose();
                        }, 1500);
                        setLoading(false);
                        return;
                    } else {
                        setErrorMessage('このメールアドレスは既に登録されています。\nログインタブに切り替えてお試しください。');
                        setIsLogin(true);
                        setPassword('');
                        setLoading(false);
                        return;
                    }
                }

                // セッションがない場合は確認メールが送信された（新規ユーザー）
                if (!data.session) {
                    setSuccessMessage('確認メールを送信しました。メール内のリンクをクリックして認証を完了させてください。');
                    setLoading(false);
                    return;
                }
            }

            if (isLogin && data.user) {
                await claimGuestContentIfAny(data.user.id);
                setUser(data.user);
                if (setShowPasswordReset) setShowPasswordReset(false);
                onClose();
            } else if (!isLogin && data.user) {
                if (!data.session) {
                    setSuccessMessage('確認メールを送信しました。メール内のリンクをクリックして認証を完了させてください。');
                } else {
                    // 新規登録成功時、アフィリエイトポイント付与を試みる
                    try {
                        const referralCode = getReferralCode();
                        if (referralCode && data.user.id) {
                            const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
                            const serviceType = currentPath.includes('/kindle') ? 'kdl' : 'main';

                            const result = await grantAffiliateSignupPoints(referralCode, serviceType, data.user.id);
                            if (result.success) {
                                console.log('[AuthModal] Affiliate signup points granted:', result.pointsGranted);
                            }
                            clearReferralCode();
                        }
                    } catch (affErr) {
                        console.error('[AuthModal] Affiliate signup points error:', affErr);
                    }

                    await claimGuestContentIfAny(data.user.id);
                    setUser(data.user);
                    if (setShowPasswordReset) setShowPasswordReset(false);
                    onClose();
                }
            }
        } catch (e: any) {
            console.error('認証エラー:', e);
            setErrorMessage(getErrorMessage(e, isLogin));
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async (e: React.FormEvent, isResend = false) => {
        e.preventDefault();
        if (!email) {
            setErrorMessage('メールアドレスを入力してください。');
            return;
        }
        if (!supabase) {
            setErrorMessage('システムエラー: 認証サービスに接続できません。');
            return;
        }
        setLoading(true);
        clearMessages();
        try {
            const redirectUrl = typeof window !== 'undefined'
                ? `${window.location.origin}/auth/callback?type=recovery`
                : undefined;

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: redirectUrl,
            });

            if (error) {
                console.error('Password reset error:', error);
            }

            setResetSent(true);
            setResetEmailAddress(email);
            setCanResend(false);
            setResendCountdown(60);

            if (isResend) {
                setSuccessMessage('パスワードリセットメールを再送信しました。');
            }
        } catch (e) {
            console.error('Password reset error:', e);
            setResetSent(true);
            setResetEmailAddress(email);
            setCanResend(false);
            setResendCountdown(60);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        clearMessages();
        if (!newPassword || !confirmPassword) {
            setErrorMessage('新しいパスワードを入力してください。');
            return;
        }
        if (newPassword !== confirmPassword) {
            setErrorMessage('パスワードが一致しません。');
            return;
        }
        if (newPassword.length < 6) {
            setErrorMessage('パスワードは6文字以上で入力してください。');
            return;
        }
        if (!supabase) {
            setErrorMessage('システムエラー: 認証サービスに接続できません。');
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });

            if (error) {
                let msg = 'パスワード変更エラー';
                if (error.message.includes('New password should be different') || error.message.includes('same as the old password')) {
                    msg = '新しいパスワードは、現在のパスワードと異なるものを設定してください。';
                } else if (error.message.includes('Password should be')) {
                    msg = 'パスワードは6文字以上で入力してください。';
                }
                setErrorMessage(msg);
                setLoading(false);
                return;
            }

            setSuccessMessage('パスワードを変更しました。');
            setTimeout(() => {
                setIsChangePasswordMode(false);
                setNewPassword('');
                setConfirmPassword('');
                if (setShowPasswordReset) setShowPasswordReset(false);
                if (onClose) onClose();
            }, 1500);
        } catch (e: any) {
            let msg = 'パスワード変更エラー';
            if (e.message?.includes('New password should be different') || e.message?.includes('same as the old password')) {
                msg = '新しいパスワードは、現在のパスワードと異なるものを設定してください。';
            } else if (e.message?.includes('Password should be')) {
                msg = 'パスワードは6文字以上で入力してください。';
            }
            setErrorMessage(msg);
        } finally {
            setLoading(false);
        }
    };

    // ─── パスワード変更モード ───
    if (isChangePasswordMode) {
        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative animate-fade-in">
                    <h2 className="text-xl font-bold mb-6 text-center text-gray-900">新しいパスワードを設定</h2>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <p className="text-sm text-gray-600 mb-4">
                            新しいパスワードを入力してください。
                        </p>

                        <InlineError message={errorMessage} />
                        <InlineSuccess message={successMessage} />

                        <div className="relative">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                required
                                value={newPassword}
                                onChange={e => { setNewPassword(e.target.value); clearMessages(); }}
                                className="w-full border border-gray-300 p-3 pr-12 rounded-lg bg-gray-50 text-gray-900"
                                placeholder="新しいパスワード"
                                minLength={6}
                            />
                            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700" tabIndex={-1}>
                                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={e => { setConfirmPassword(e.target.value); clearMessages(); }}
                                className="w-full border border-gray-300 p-3 pr-12 rounded-lg bg-gray-50 text-gray-900"
                                placeholder="パスワード（確認）"
                                minLength={6}
                            />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700" tabIndex={-1}>
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-md">
                            {loading ? '処理中...' : 'パスワードを変更'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // ─── パスワードリセットモード ───
    if (isResetMode) {
        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative animate-fade-in">
                    <button onClick={() => { setIsResetMode(false); setResetSent(false); setEmail(''); setCanResend(false); setResendCountdown(0); clearMessages(); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X /></button>
                    <h2 className="text-xl font-bold mb-6 text-center text-gray-900">パスワードリセット</h2>
                    {resetSent ? (
                        <div className="text-center space-y-4">
                            <InlineSuccess message={successMessage} />

                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm text-green-800 font-bold mb-2">
                                    パスワードリセット用のメールを送信しました。
                                </p>
                                <p className="text-xs text-green-700">
                                    送信先: <span className="font-mono">{resetEmailAddress}</span>
                                </p>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                                <p className="text-xs text-blue-900 font-bold mb-2">メール内のリンクをクリック</p>
                                <p className="text-xs text-blue-800 mb-3">
                                    メール内のリンクをクリックして、新しいパスワードを設定してください。
                                </p>
                                <p className="text-xs text-blue-900 font-bold mb-2">メールが届かない場合</p>
                                <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
                                    <li>迷惑メールフォルダをご確認ください</li>
                                    <li>メールアドレスが正しいかご確認ください</li>
                                    <li>数分待ってから再送信をお試しください</li>
                                </ul>
                            </div>

                            <button
                                onClick={(e) => handlePasswordReset(e, true)}
                                disabled={!canResend || loading}
                                className={`w-full font-bold py-3 rounded-lg transition-colors shadow-md ${
                                    canResend && !loading
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                {loading ? '送信中...' : canResend ? 'メールを再送信' : `再送信可能まで ${resendCountdown}秒`}
                            </button>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <p className="text-xs text-yellow-900 mb-2">
                                    <span className="font-bold">それでも解決しない場合</span>
                                </p>
                                <p className="text-xs text-yellow-800 mb-2">
                                    お手数ですが、以下の連絡先までお問い合わせください。
                                </p>
                                <p className="text-xs text-yellow-900 font-mono bg-white px-2 py-1 rounded">
                                    サポート: support@makers.tokyo
                                </p>
                            </div>

                            <button
                                onClick={() => { setIsResetMode(false); setResetSent(false); setEmail(''); setCanResend(false); setResendCountdown(0); clearMessages(); }}
                                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                            >
                                ログイン画面に戻る
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={(e) => handlePasswordReset(e, false)} className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-900 font-bold mb-2">
                                    パスワードをお忘れですか？
                                </p>
                                <p className="text-xs text-blue-800">
                                    登録済みのメールアドレスを入力してください。<br/>
                                    パスワードリセット用のリンクを送信します。
                                </p>
                            </div>

                            <InlineError message={errorMessage} />

                            <input
                                type="email"
                                required
                                value={email}
                                onChange={e => { setEmail(e.target.value); clearMessages(); }}
                                className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900 placeholder:text-gray-400"
                                placeholder="登録済みのメールアドレス"
                            />
                            <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md">
                                {loading ? '送信中...' : 'リセットメールを送信'}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setIsResetMode(false); setEmail(''); clearMessages(); }}
                                className="w-full text-center text-sm text-gray-600 font-bold underline hover:text-gray-800"
                            >
                                ログイン画面に戻る
                            </button>
                        </form>
                    )}
                </div>
            </div>
        );
    }

    // ─── メインのログイン/新規登録モーダル ───
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative animate-fade-in">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X /></button>

                {/* タブ切り替え */}
                <div className="flex justify-center mb-6 border-b border-gray-200">
                    <button
                        type="button"
                        onClick={() => { setIsLogin(true); setEmail(''); setPassword(''); clearMessages(); }}
                        className={`flex-1 py-3 font-bold text-center transition-colors relative ${
                            isLogin ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        ログイン
                        {isLogin && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>}
                    </button>
                    <button
                        type="button"
                        onClick={() => { setIsLogin(false); setEmail(''); setPassword(''); clearMessages(); }}
                        className={`flex-1 py-3 font-bold text-center transition-colors relative ${
                            !isLogin ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        新規登録
                        {!isLogin && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>}
                    </button>
                </div>

                {/* Google OAuth ボタン */}
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={googleLoading}
                    className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors shadow-sm mb-4 disabled:opacity-50"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    {googleLoading ? '接続中...' : 'Googleで続ける'}
                </button>

                {/* 区切り線 */}
                <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-white px-4 text-gray-400">または</span>
                    </div>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    {/* 補足説明テキスト */}
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-center">
                        <p className="text-sm text-indigo-900">
                            {isLogin ? (
                                '登録済みのメールアドレスとパスワードを入力してください'
                            ) : (
                                <>
                                    <span className="font-bold">初めての方は新規登録（1分で完了）</span>
                                    <br />
                                    <span className="text-xs">メールアドレスでログインできます</span>
                                </>
                            )}
                        </p>
                    </div>

                    {/* エラー・成功メッセージ */}
                    <InlineError message={errorMessage} />
                    <InlineSuccess message={successMessage} />

                    {/* メールアドレス入力欄 */}
                    <div>
                        <label htmlFor="auth-email" className="block text-sm font-medium text-gray-700 mb-1">
                            メールアドレス
                        </label>
                        <input
                            id="auth-email"
                            type="email"
                            required
                            value={email}
                            onChange={e => { setEmail(e.target.value); clearMessages(); }}
                            className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900 placeholder:text-gray-400"
                            placeholder="例: user@example.com"
                        />
                    </div>

                    {/* パスワード入力欄 */}
                    <div>
                        <label htmlFor="auth-password" className="block text-sm font-medium text-gray-700 mb-1">
                            パスワード
                        </label>
                        <div className="relative">
                            <input
                                id="auth-password"
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={e => { setPassword(e.target.value); clearMessages(); }}
                                className="w-full border border-gray-300 p-3 pr-12 rounded-lg bg-gray-50 text-gray-900 placeholder:text-gray-400"
                                placeholder="6文字以上"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700" tabIndex={-1}>
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {isLogin && (
                        <div className="text-right">
                            <button
                                type="button"
                                onClick={() => { setIsResetMode(true); clearMessages(); }}
                                className="text-xs text-indigo-600 font-bold underline hover:text-indigo-800"
                            >
                                パスワードをお忘れですか？
                            </button>
                        </div>
                    )}
                    <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-md">
                        {loading ? '処理中...' : (isLogin ? 'ログイン' : '新規登録する')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AuthModal;
