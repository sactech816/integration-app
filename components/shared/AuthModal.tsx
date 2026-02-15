import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { grantAffiliateSignupPoints } from '@/app/actions/affiliate';
import { getReferralCode, clearReferralCode } from '@/components/affiliate/AffiliateTracker';

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
    
    // パスワード表示/非表示の状態
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
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
    
    if (!isOpen && !isPasswordReset) return null;
    
    const handleAuth = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            const { data, error } = isLogin 
                ? await supabase.auth.signInWithPassword({ email, password })
                : await supabase.auth.signUp({ 
                    email, 
                    password,
                    options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined }
                  });
            
            if (error) {
                console.log('認証エラー詳細:', error);
                
                // 重複メールアドレスのエラーハンドリング
                // ユーザー体験優先: 自動ログイン機能を提供
                // ※セキュリティ重視に切り替える場合は、下記のコメントアウトされたコードを使用
                if (!isLogin && (
                    error.message.includes('already registered') || 
                    error.message.includes('User already registered') ||
                    error.message.includes('already been registered') ||
                    error.status === 422 || // Supabaseの重複エラーステータス
                    error.code === '23505' // PostgreSQLの重複エラーコード
                )) {
                    console.log('重複メールエラーを検出しました。ログインを試みます。');
                    // パスワードが合っているか試してみる
                    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ 
                        email, 
                        password 
                    });
                    
                    if (!loginError && loginData.user) {
                        // パスワードが合っていた場合、自動的にログイン
                        alert('このメールアドレスは既に登録されています。\n\n自動的にログインしました。');
                        setUser(loginData.user);
                        if (setShowPasswordReset) {
                            setShowPasswordReset(false);
                        }
                        onClose();
                        // トップページからのログインのみダッシュボードにリダイレクト、それ以外はその場に留まる
                        if (typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname === '')) {
                            if (onNavigate) {
                                onNavigate('dashboard');
                            } else {
                                window.location.href = '/dashboard';
                            }
                        }
                        setLoading(false);
                        return;
                    } else {
                        // パスワードが間違っている場合、ログイン画面に切り替え
                        alert(
                            'このメールアドレスは既に登録されています。\n\n' +
                            'ログイン画面に切り替えます。\n' +
                            'パスワードを忘れた場合は「パスワードをお忘れですか？」をクリックしてください。'
                        );
                        setIsLogin(true);
                        setPassword('');
                        setLoading(false);
                        return;
                    }
                    
                    /* ========================================
                     * セキュリティ重視版（将来用）
                     * メールアドレスの存在を推測されないようにする
                     * ----------------------------------------
                    alert(
                        '確認メールを送信しました。\n\n' +
                        'メール内のリンクをクリックして認証を完了させてください。\n\n' +
                        '※既にアカウントをお持ちの場合は、ログイン画面からログインしてください。'
                    );
                    setIsLogin(true);
                    setPassword('');
                    setLoading(false);
                    return;
                     * ======================================== */
                }
                throw error;
            }
            
            // 新規登録の場合
            if (!isLogin && data.user) {
                // セッションがない場合は確認メールが送信された
                if (!data.session) {
                    // ユーザー体験優先: 既存ユーザーかどうか確認
                    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ 
                        email, 
                        password 
                    });
                    
                    if (!loginError && loginData.user) {
                        // ユーザーが既に存在し、パスワードが合っている
                        alert('このメールアドレスは既に登録されています。\n\n自動的にログインしました。');
                        setUser(loginData.user);
                        if (setShowPasswordReset) {
                            setShowPasswordReset(false);
                        }
                        onClose();
                        // トップページからのログインのみダッシュボードにリダイレクト、それ以外はその場に留まる
                        if (typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname === '')) {
                            if (onNavigate) {
                                onNavigate('dashboard');
                            } else {
                                window.location.href = '/dashboard';
                            }
                        }
                        setLoading(false);
                        return;
                    } else {
                        // 新規登録で確認メールが送信された
                        alert('確認メールを送信しました。\n\nメール内のリンクをクリックして認証を完了させてください。');
                        setLoading(false);
                        return;
                    }
                    
                    /* ========================================
                     * セキュリティ重視版（将来用）
                     * ----------------------------------------
                    alert('確認メールを送信しました。\n\nメール内のリンクをクリックして認証を完了させてください。');
                    setLoading(false);
                    return;
                     * ======================================== */
                }
            }

            if (isLogin && data.user) { 
                setUser(data.user); 
                // パスワードリセットモードをリセット
                if (setShowPasswordReset) {
                    setShowPasswordReset(false);
                }
                onClose();
                // トップページからのログインのみダッシュボードにリダイレクト、それ以外はその場に留まる
                if (typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname === '')) {
                    if (onNavigate) {
                        onNavigate('dashboard');
                    } else {
                        window.location.href = '/dashboard';
                    }
                }
            } else if (!isLogin && data.user) {
                if (!data.session) alert('確認メールを送信しました。メール内のリンクをクリックして認証を完了させてください。');
                else { 
                    // 新規登録成功時、アフィリエイトポイント付与を試みる
                    try {
                        const referralCode = getReferralCode();
                        if (referralCode && data.user.id) {
                            // 現在のページからサービスタイプを判定
                            const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
                            const serviceType = currentPath.includes('/kindle') ? 'kdl' : 'main';
                            
                            console.log('[AuthModal] Attempting to grant affiliate signup points:', {
                                referralCode,
                                serviceType,
                                userId: data.user.id,
                            });
                            
                            const result = await grantAffiliateSignupPoints(referralCode, serviceType, data.user.id);
                            if (result.success) {
                                console.log('[AuthModal] Affiliate signup points granted:', result.pointsGranted);
                            } else {
                                console.log('[AuthModal] Affiliate signup points not granted:', result.message);
                            }
                            
                            // 紹介コードをクリア（重複付与防止）
                            clearReferralCode();
                        }
                    } catch (affErr) {
                        console.error('[AuthModal] Affiliate signup points error:', affErr);
                    }
                    
                    setUser(data.user); 
                    // パスワードリセットモードをリセット
                    if (setShowPasswordReset) {
                        setShowPasswordReset(false);
                    }
                    onClose();
                    // トップページからのログインのみダッシュボードにリダイレクト、それ以外はその場に留まる
                    if (typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname === '')) {
                        if (onNavigate) {
                            onNavigate('dashboard');
                        } else {
                            window.location.href = '/dashboard';
                        }
                    }
                }
            }
        } catch (e) { 
            console.error('認証エラー:', e);
            
            // エラーメッセージをユーザーフレンドリーに変換
            let errorMessage = 'エラー';
            
            // メールアドレスの形式エラー
            if (e.message.includes('is invalid') || 
                e.message.includes('invalid format') ||
                e.message.includes('Unable to validate email')) {
                errorMessage = 'メールアドレスの形式が正しくありません。\n\n正しいメールアドレスを入力してください。\n例: user@example.com';
            }
            // パスワードが短い
            else if (e.message.includes('at least 6 characters') || 
                     e.message.includes('Password should be')) {
                errorMessage = 'パスワードは6文字以上で入力してください。';
            }
            // パスワードが弱い
            else if (e.message.includes('password is too weak') || 
                     e.message.includes('Password is too common')) {
                errorMessage = 'パスワードが簡単すぎます。\n\n数字や記号を含めた、より強力なパスワードを設定してください。';
            }
            // ログイン認証エラー
            else if (e.message.includes('Invalid login credentials') || 
                     e.message.includes('Invalid email or password')) {
                errorMessage = isLogin 
                    ? 'メールアドレスまたはパスワードが正しくありません。\n\nパスワードを忘れた場合は「パスワードをお忘れですか？」をクリックしてください。'
                    : 'メールアドレスまたはパスワードが正しくありません。';
            }
            // メール未確認
            else if (e.message.includes('Email not confirmed')) {
                errorMessage = 'メールアドレスが確認されていません。\n\n確認メールをご確認ください。';
            }
            // ユーザーが見つからない
            else if (e.message.includes('User not found')) {
                errorMessage = 'このメールアドレスは登録されていません。';
            }
            // レート制限
            else if (e.message.includes('Email rate limit exceeded')) {
                errorMessage = '送信回数が上限に達しました。\n\nしばらく時間をおいてから再度お試しください。';
            }
            // ネットワークエラー
            else if (e.message.includes('Network') || 
                     e.message.includes('Failed to fetch')) {
                errorMessage = 'ネットワークエラーが発生しました。\n\nインターネット接続を確認して、再度お試しください。';
            }
            // サーバーエラー
            else if (e.message.includes('500') || 
                     e.message.includes('Internal Server Error')) {
                errorMessage = 'サーバーエラーが発生しました。\n\nしばらく時間をおいてから再度お試しください。';
            }
            // タイムアウト
            else if (e.message.includes('timeout') || 
                     e.message.includes('timed out')) {
                errorMessage = '接続がタイムアウトしました。\n\nもう一度お試しください。';
            }
            // 不明なエラー
            else {
                // 開発者向けには詳細を表示、本番では一般的なメッセージ
                const isDevelopment = process.env.NODE_ENV === 'development';
                errorMessage = isDevelopment 
                    ? `エラーが発生しました\n\n${e.message}`
                    : 'エラーが発生しました。\n\nもう一度お試しいただくか、問題が続く場合はサポートにお問い合わせください。';
            }
            
            alert(errorMessage);
        } finally { 
            setLoading(false); 
        }
    };

    const handlePasswordReset = async (e, isResend = false) => {
        e.preventDefault();
        if (!email) {
            alert('メールアドレスを入力してください。');
            return;
        }
        setLoading(true);
        try {
            // リダイレクトURLをルートに設定（パスワードリセット処理を確実に行うため）
            // Supabaseは自動的に #access_token=...&type=recovery をURLに追加します
            const redirectUrl = typeof window !== 'undefined' 
                ? `${window.location.origin}` 
                : undefined;
            
            console.log('パスワードリセットメール送信:', email, 'リダイレクト先:', redirectUrl);
            
            const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: redirectUrl,
            });
            
            // エラーハンドリングの強化
            if (error) {
                // セキュリティのため、詳細なエラーは表示せず一般的なメッセージを表示
                console.error('Password reset error:', error);
                // ただし、ユーザーには成功メッセージを表示（メールアドレスの存在を推測されないため）
            } else {
                console.log('パスワードリセットメール送信成功:', data);
            }
            
            // 成功時の処理
            setResetSent(true);
            setResetEmailAddress(email);
            setCanResend(false);
            setResendCountdown(60); // 60秒後に再送信可能
            
            if (isResend) {
                alert('パスワードリセットメールを再送信しました。');
            }
        } catch (e) {
            // エラーの場合でも、セキュリティのため成功メッセージを表示
            console.error('Password reset error:', e);
            setResetSent(true);
            setResetEmailAddress(email);
            setCanResend(false);
            setResendCountdown(60);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (!newPassword || !confirmPassword) {
            alert('新しいパスワードを入力してください。');
            return;
        }
        if (newPassword !== confirmPassword) {
            alert('パスワードが一致しません。');
            return;
        }
        if (newPassword.length < 6) {
            alert('パスワードは6文字以上で入力してください。');
            return;
        }
        setLoading(true);
        try {
            console.log('パスワード更新を開始します');
            const { data, error } = await supabase.auth.updateUser({
                password: newPassword
            });
            
            if (error) {
                console.error('パスワード更新エラー:', error);
                
                // エラーメッセージをユーザーフレンドリーに変換
                let errorMessage = 'パスワード変更エラー';
                
                if (error.message.includes('New password should be different')) {
                    errorMessage = '新しいパスワードは、現在のパスワードと異なるものを設定してください。';
                } else if (error.message.includes('Password should be')) {
                    errorMessage = 'パスワードは6文字以上で入力してください。';
                } else if (error.message.includes('same as the old password')) {
                    errorMessage = '新しいパスワードは、以前のパスワードと異なるものを設定してください。';
                } else {
                    errorMessage = error.message;
                }
                
                alert(errorMessage);
                setLoading(false);
                return;
            }
            
            console.log('パスワード更新成功:', data);
            alert('パスワードを変更しました。\n\n新しいパスワードでログインできます。');
            
            // 状態をリセット
            setIsChangePasswordMode(false);
            setNewPassword('');
            setConfirmPassword('');
            
            // showPasswordResetをfalseに設定（重要）
            // これがないと、ログイン後もパスワード変更画面が残る
            if (setShowPasswordReset) {
                setShowPasswordReset(false);
            }
            
            // モーダルを閉じる
            if (onClose) {
                onClose();
            }
            
            // トップページからのログインのみダッシュボードにリダイレクト、それ以外はその場に留まる
            if (typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname === '')) {
                if (onNavigate) {
                    onNavigate('dashboard');
                } else {
                    window.location.href = '/dashboard';
                }
            }
        } catch (e) {
            console.error('パスワード変更エラー:', e);
            
            // エラーメッセージをユーザーフレンドリーに変換
            let errorMessage = 'パスワード変更エラー';
            
            if (e.message.includes('New password should be different')) {
                errorMessage = '新しいパスワードは、現在のパスワードと異なるものを設定してください。';
            } else if (e.message.includes('Password should be')) {
                errorMessage = 'パスワードは6文字以上で入力してください。';
            } else if (e.message.includes('same as the old password')) {
                errorMessage = '新しいパスワードは、以前のパスワードと異なるものを設定してください。';
            } else {
                errorMessage = e.message;
            }
            
            alert(errorMessage + '\n\nもう一度お試しください。');
        } finally {
            setLoading(false);
        }
    };

    // パスワード変更モード（メールリンクから来た場合）
    if (isChangePasswordMode) {
        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative animate-fade-in">
                    <h2 className="text-xl font-bold mb-6 text-center text-gray-900">新しいパスワードを設定</h2>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <p className="text-sm text-gray-600 mb-4">
                            新しいパスワードを入力してください。
                        </p>
                        
                        {/* 新しいパスワード入力欄（表示/非表示ボタン付き） */}
                        <div className="relative">
                            <input 
                                type={showNewPassword ? "text" : "password"} 
                                required 
                                value={newPassword} 
                                onChange={e=>setNewPassword(e.target.value)} 
                                className="w-full border border-gray-300 p-3 pr-12 rounded-lg bg-gray-50 text-gray-900" 
                                placeholder="新しいパスワード" 
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                tabIndex={-1}
                            >
                                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        
                        {/* パスワード確認入力欄（表示/非表示ボタン付き） */}
                        <div className="relative">
                            <input 
                                type={showConfirmPassword ? "text" : "password"} 
                                required 
                                value={confirmPassword} 
                                onChange={e=>setConfirmPassword(e.target.value)} 
                                className="w-full border border-gray-300 p-3 pr-12 rounded-lg bg-gray-50 text-gray-900" 
                                placeholder="パスワード（確認）" 
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                tabIndex={-1}
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        
                        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                            {loading ? '処理中...' : 'パスワードを変更'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // パスワードリセットメール送信モード
    if (isResetMode) {
        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative animate-fade-in">
                    <button onClick={() => { setIsResetMode(false); setResetSent(false); setEmail(''); setCanResend(false); setResendCountdown(0); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X/></button>
                    <h2 className="text-xl font-bold mb-6 text-center text-gray-900">パスワードリセット</h2>
                    {resetSent ? (
                        <div className="text-center space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm text-green-800 font-bold mb-2">
                                    パスワードリセット用のメールを送信しました。
                                </p>
                                <p className="text-xs text-green-700">
                                    送信先: <span className="font-mono">{resetEmailAddress}</span>
                                </p>
                            </div>
                            
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                                <p className="text-xs text-blue-900 font-bold mb-2">📧 メール内のリンクをクリック</p>
                                <p className="text-xs text-blue-800 mb-3">
                                    メール内のリンクをクリックして、新しいパスワードを設定してください。
                                </p>
                                <p className="text-xs text-blue-900 font-bold mb-2">⏰ メールが届かない場合</p>
                                <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
                                    <li>迷惑メールフォルダをご確認ください</li>
                                    <li>メールアドレスが正しいかご確認ください</li>
                                    <li>数分待ってから再送信をお試しください</li>
                                </ul>
                            </div>

                            {/* 再送信ボタン */}
                            <button 
                                onClick={(e) => handlePasswordReset(e, true)}
                                disabled={!canResend || loading}
                                className={`w-full font-bold py-3 rounded-lg transition-colors ${
                                    canResend && !loading
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                {loading ? '送信中...' : canResend ? 'メールを再送信' : `再送信可能まで ${resendCountdown}秒`}
                            </button>

                            {/* 管理者への連絡 */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <p className="text-xs text-yellow-900 mb-2">
                                    <span className="font-bold">💡 それでも解決しない場合</span>
                                </p>
                                <p className="text-xs text-yellow-800 mb-2">
                                    お手数ですが、以下の連絡先までお問い合わせください。
                                </p>
                                <p className="text-xs text-yellow-900 font-mono bg-white px-2 py-1 rounded">
                                    サポート: support@makers.tokyo
                                </p>
                            </div>
                            
                            <button 
                                onClick={() => { setIsResetMode(false); setResetSent(false); setEmail(''); setCanResend(false); setResendCountdown(0); }}
                                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors"
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
                            <input 
                                type="email" 
                                required 
                                value={email} 
                                onChange={e=>setEmail(e.target.value)} 
                                className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900" 
                                placeholder="登録済みのメールアドレス" 
                            />
                            <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                                {loading ? '送信中...' : 'リセットメールを送信'}
                            </button>
                            <button 
                                type="button"
                                onClick={() => { setIsResetMode(false); setEmail(''); }} 
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
    
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative animate-fade-in">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X/></button>
                
                {/* タブ切り替え */}
                <div className="flex justify-center mb-6 border-b border-gray-200">
                    <button
                        type="button"
                        onClick={() => {
                            setIsLogin(true);
                            setEmail('');
                            setPassword('');
                        }}
                        className={`flex-1 py-3 font-bold text-center transition-colors relative ${
                            isLogin 
                                ? 'text-indigo-600' 
                                : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        ログイン
                        {isLogin && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setIsLogin(false);
                            setEmail('');
                            setPassword('');
                        }}
                        className={`flex-1 py-3 font-bold text-center transition-colors relative ${
                            !isLogin 
                                ? 'text-indigo-600' 
                                : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        新規登録
                        {!isLogin && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                        )}
                    </button>
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
                    
                    {/* メールアドレス入力欄 */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            メールアドレス
                        </label>
                        <input 
                            id="email"
                            type="email" 
                            required 
                            value={email} 
                            onChange={e=>setEmail(e.target.value)} 
                            className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900" 
                            placeholder="例: user@example.com" 
                        />
                    </div>
                    
                    {/* パスワード入力欄（表示/非表示ボタン付き） */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            パスワード
                        </label>
                        <div className="relative">
                            <input 
                                id="password"
                                type={showPassword ? "text" : "password"} 
                                required 
                                value={password} 
                                onChange={e=>setPassword(e.target.value)} 
                                className="w-full border border-gray-300 p-3 pr-12 rounded-lg bg-gray-50 text-gray-900" 
                                placeholder="6文字以上" 
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                    
                    {isLogin && (
                        <div className="text-right">
                            <button 
                                type="button"
                                onClick={() => setIsResetMode(true)} 
                                className="text-xs text-indigo-600 font-bold underline hover:text-indigo-800"
                            >
                                パスワードをお忘れですか？
                            </button>
                        </div>
                    )}
                    <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                        {loading ? '処理中...' : (isLogin ? 'ログイン' : '新規登録する')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AuthModal;