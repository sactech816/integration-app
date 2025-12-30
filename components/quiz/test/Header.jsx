import React, { useState } from 'react';
import { Sparkles, User, LayoutDashboard, TrendingUp, Menu, X, LogOut, HelpCircle, FileText, Lightbulb, Mail, Shield, Scale, PlusCircle, Bell, Play, Heart } from 'lucide-react';

const Header = ({ setPage, user, onLogout, setShowAuth }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleNav = (page) => {
        setPage(page);
        setIsMenuOpen(false);
    };

    // ★修正: 未ログインユーザーも作成可能（エディタでログインを促す）
    const handleCreate = () => {
        handleNav('editor'); // エディタへ遷移（ログイン状態に関わらず）
        setIsMenuOpen(false);
    };

    return (
        <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="font-bold text-xl flex items-center gap-2 text-indigo-700 cursor-pointer" onClick={()=>handleNav('portal')}>
                    <Sparkles className="text-pink-500"/> 診断クイズメーカー
                </div>

                {/* 右側メニューエリア */}
                <div className="flex items-center gap-2">
                    {/* PC版：重要な機能のみ外部に表示 */}
                    <div className="hidden md:flex items-center gap-4 text-sm font-bold text-gray-600">
                        <button onClick={handleCreate} className="hover:text-pink-500 flex items-center gap-1"><PlusCircle size={16}/> 診断クイズを作成</button>
                        <button onClick={()=>handleNav('donation')} className="hover:text-rose-500 flex items-center gap-1 text-rose-600"><Heart size={16}/> 寄付</button>
                        {user ? (
                            <button onClick={()=>handleNav('dashboard')} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full flex items-center gap-2 hover:bg-indigo-100 transition-colors">
                                <LayoutDashboard size={16}/> マイページ
                            </button>
                        ) : (
                            <button onClick={()=>setShowAuth(true)} className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2">
                                <User size={16}/> ログイン
                            </button>
                        )}
                    </div>

                    {/* ハンバーガーメニューボタン（PC・スマホ共通） */}
                    <button className="text-gray-600 p-2" onClick={()=>setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={28}/> : <Menu size={28}/>}
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <div className="bg-white border-t absolute w-full left-0 top-16 shadow-xl py-4 px-6 flex flex-col gap-2 animate-fade-in z-50 h-[calc(100vh-64px)] overflow-y-auto pb-20">
                    <p className="text-xs font-bold text-gray-400 mt-4 mb-2">メニュー</p>
                    <button onClick={handleCreate} className="flex items-center gap-3 py-3 border-b border-gray-100 text-pink-600 font-bold"><PlusCircle size={20}/> 診断クイズを作成</button>
                    <button onClick={()=>handleNav('demo-quiz')} className="flex items-center gap-3 py-3 border-b border-gray-100 text-green-600 font-bold"><Play size={20}/> デモを試す</button>
                    <button onClick={()=>handleNav('logic')} className="flex items-center gap-3 py-3 border-b border-gray-100 text-orange-600 font-bold"><Lightbulb size={20}/> 売れる診断の作り方</button>
                    <button onClick={()=>handleNav('effective')} className="flex items-center gap-3 py-3 border-b border-gray-100 text-indigo-600 font-bold"><TrendingUp size={20}/> 効果的な活用法</button>
                    <button onClick={()=>handleNav('announcements')} className="flex items-center gap-3 py-3 border-b border-gray-100 text-indigo-600 font-bold"><Bell size={20}/> お知らせ</button>
                    <button onClick={()=>handleNav('contact')} className="flex items-center gap-3 py-3 border-b border-gray-100 text-gray-700 font-bold"><Mail size={20}/> お問い合わせ</button>
                    <button onClick={()=>handleNav('donation')} className="flex items-center gap-3 py-3 border-b border-gray-100 text-rose-600 font-bold"><Heart size={20}/> 寄付・サポート</button>
                    
                    <p className="text-xs font-bold text-gray-400 mt-6 mb-2">サポート・規約</p>
                    <button onClick={()=>handleNav('howto')} className="flex items-center gap-3 py-3 border-b border-gray-100 text-gray-700 font-bold"><FileText size={20}/> 使い方・機能一覧</button>
                    <button onClick={()=>handleNav('faq')} className="flex items-center gap-3 py-3 border-b border-gray-100 text-gray-700 font-bold"><HelpCircle size={20}/> よくある質問</button>
                    <button onClick={()=>handleNav('legal')} className="flex items-center gap-3 py-3 border-b border-gray-100 text-gray-500 font-bold text-xs"><Scale size={16}/> 特定商取引法に基づく表記</button>
                    <button onClick={()=>handleNav('privacy')} className="flex items-center gap-3 py-3 border-b border-gray-100 text-gray-500 font-bold text-xs"><Shield size={16}/> プライバシーポリシー</button>
                    
                    <div className="mt-8">
                    {user ? (
                        <>
                            <button onClick={()=>handleNav('dashboard')} className="w-full bg-indigo-50 text-indigo-700 py-3 rounded-xl flex items-center justify-center gap-2 font-bold mb-2"><LayoutDashboard size={20}/> マイページ</button>
                            <button onClick={()=>{onLogout(); setIsMenuOpen(false);}} className="w-full border border-red-100 text-red-600 py-3 rounded-xl flex items-center justify-center gap-2 font-bold"><LogOut size={20}/> ログアウト</button>
                        </>
                    ) : (
                        <button onClick={()=>{setShowAuth(true); setIsMenuOpen(false);}} className="bg-black text-white w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                            <User size={20}/> ログイン / 新規登録
                        </button>
                    )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Header;
