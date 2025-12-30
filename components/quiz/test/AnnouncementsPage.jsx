import React, { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, Calendar, Plus, X, Bell, Edit3, Trash2 } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import { supabase } from '../lib/supabase';

const AnnouncementsPage = ({ onBack, isAdmin, setPage, user, onLogout, setShowAuth, serviceType = 'quiz' }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);
    const [announcementForm, setAnnouncementForm] = useState({
        title: '',
        content: '',
        link_url: '',
        link_text: '',
        is_active: true,
        announcement_date: '',
        service_type: 'all'
    });

    useEffect(() => {
        document.title = "お知らせ | 診断クイズメーカー";
        window.scrollTo(0, 0);
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        if (!supabase) return;
        try {
            // サービスタイプでフィルタリング（'all'と指定されたserviceTypeのお知らせを取得）
            let query = supabase.from('announcements').select('*');
            
            // 管理者以外は表示中のみ
            if (!isAdmin) {
                query = query.eq('is_active', true);
            }
            
            // サービスタイプでフィルタリング（'all'または指定されたserviceType）
            query = query.or(`service_type.eq.all,service_type.eq.${serviceType}`);
            
            query = query.order('created_at', { ascending: false });
            
            const { data, error } = await query;
            if (error) throw error;
            setAnnouncements(data || []);
        } catch (e) {
            console.error('お知らせの取得エラー:', e);
            alert('お知らせの取得に失敗しました: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAnnouncementSubmit = async (e) => {
        e.preventDefault();
        if (!supabase || !isAdmin) return;
        
        try {
            const payload = {
                title: announcementForm.title,
                content: announcementForm.content,
                link_url: announcementForm.link_url || null,
                link_text: announcementForm.link_text || null,
                is_active: announcementForm.is_active,
                announcement_date: announcementForm.announcement_date || null,
                service_type: announcementForm.service_type || 'all'
            };

            if (editingAnnouncement) {
                const { error } = await supabase
                    .from('announcements')
                    .update(payload)
                    .eq('id', editingAnnouncement.id);
                if (error) throw error;
                alert('お知らせを更新しました');
            } else {
                const { error } = await supabase
                    .from('announcements')
                    .insert([payload]);
                if (error) throw error;
                alert('お知らせを作成しました');
            }

            setShowAnnouncementForm(false);
            setEditingAnnouncement(null);
            setAnnouncementForm({
                title: '',
                content: '',
                link_url: '',
                link_text: '',
                is_active: true,
                announcement_date: '',
                service_type: 'all'
            });
            await fetchAnnouncements();
        } catch (e) {
            alert('エラー: ' + e.message);
        }
    };

    const handleEditAnnouncement = (announcement) => {
        setEditingAnnouncement(announcement);
        // announcement_dateが存在する場合はそれを使用、なければcreated_atを使用
        const displayDate = announcement.announcement_date 
            ? new Date(announcement.announcement_date).toISOString().split('T')[0]
            : (announcement.created_at ? new Date(announcement.created_at).toISOString().split('T')[0] : '');
        setAnnouncementForm({
            title: announcement.title,
            content: announcement.content,
            link_url: announcement.link_url || '',
            link_text: announcement.link_text || '',
            is_active: announcement.is_active,
            announcement_date: displayDate,
            service_type: announcement.service_type || 'all'
        });
        setShowAnnouncementForm(true);
    };

    const handleDeleteAnnouncement = async (id) => {
        if (!confirm('本当に削除しますか？')) return;
        if (!supabase || !isAdmin) return;
        
        try {
            const { error } = await supabase
                .from('announcements')
                .delete()
                .eq('id', id);
            if (error) throw error;
            alert('削除しました');
            await fetchAnnouncements();
        } catch (e) {
            alert('削除エラー: ' + e.message);
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans flex flex-col">
            <Header setPage={setPage} user={user} onLogout={onLogout} setShowAuth={setShowAuth} isAdmin={isAdmin} />
            
            <div className="flex-grow">
                <div className="max-w-4xl mx-auto py-12 px-4">
                    <button 
                        onClick={onBack} 
                        className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-bold mb-8 transition-colors"
                    >
                        <ArrowLeft size={20} /> トップに戻る
                    </button>

                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">お知らせ</h1>
                            <p className="text-gray-600">最新の情報やお知らせをお届けします</p>
                        </div>
                        {isAdmin && (
                            <button 
                                onClick={() => {
                                    setEditingAnnouncement(null);
                                    setAnnouncementForm({
                                        title: '',
                                        content: '',
                                        link_url: '',
                                        link_text: '',
                                        is_active: true,
                                        announcement_date: '',
                                        service_type: 'all'
                                    });
                                    setShowAnnouncementForm(true);
                                }}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 flex items-center gap-2"
                            >
                                <Plus size={16}/> 新規作成
                            </button>
                        )}
                    </div>

                    {/* 管理者向けお知らせ作成・編集フォーム */}
                    {isAdmin && showAnnouncementForm && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Bell size={20} className="text-red-600"/> 
                                    {editingAnnouncement ? 'お知らせを編集' : '新規お知らせを作成'}
                                    <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">ADMIN</span>
                                </h3>
                                <button 
                                    onClick={() => {
                                    setShowAnnouncementForm(false);
                                    setEditingAnnouncement(null);
                                    setAnnouncementForm({
                                        title: '',
                                        content: '',
                                        link_url: '',
                                        link_text: '',
                                        is_active: true,
                                        service_type: 'all'
                                    });
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={20}/>
                            </button>
                        </div>
                            <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">タイトル *</label>
                                    <input
                                        type="text"
                                        required
                                        value={announcementForm.title}
                                        onChange={e => setAnnouncementForm({...announcementForm, title: e.target.value})}
                                        className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900"
                                        placeholder="お知らせのタイトル"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">内容 *</label>
                                    <textarea
                                        required
                                        value={announcementForm.content}
                                        onChange={e => setAnnouncementForm({...announcementForm, content: e.target.value})}
                                        className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900 h-32"
                                        placeholder="お知らせの内容"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">リンクURL（オプション）</label>
                                        <input
                                            type="url"
                                            value={announcementForm.link_url}
                                            onChange={e => setAnnouncementForm({...announcementForm, link_url: e.target.value})}
                                            className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900"
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">リンクテキスト（オプション）</label>
                                        <input
                                            type="text"
                                            value={announcementForm.link_text}
                                            onChange={e => setAnnouncementForm({...announcementForm, link_text: e.target.value})}
                                            className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900"
                                            placeholder="詳細はこちら"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">表示日付</label>
                                        <input
                                            type="date"
                                            value={announcementForm.announcement_date}
                                            onChange={e => setAnnouncementForm({...announcementForm, announcement_date: e.target.value})}
                                            className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">空欄の場合は作成日時が表示されます</p>
                                    </div>
                                    <div className="flex items-center gap-2 pt-8">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={announcementForm.is_active}
                                            onChange={e => setAnnouncementForm({...announcementForm, is_active: e.target.checked})}
                                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                                        />
                                        <label htmlFor="is_active" className="text-sm font-bold text-gray-700">表示する</label>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">サービス区分</label>
                                    <select
                                        value={announcementForm.service_type}
                                        onChange={e => setAnnouncementForm({...announcementForm, service_type: e.target.value})}
                                        className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900"
                                    >
                                        <option value="all">全サービス共通</option>
                                        <option value="quiz">診断クイズメーカー専用</option>
                                        <option value="profile">プロフィールLPメーカー専用</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">どのサービスでお知らせを表示するか選択してください</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        {editingAnnouncement ? '更新する' : '作成する'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                        setShowAnnouncementForm(false);
                                        setEditingAnnouncement(null);
                                        setAnnouncementForm({
                                            title: '',
                                            content: '',
                                            link_url: '',
                                            link_text: '',
                                            is_active: true,
                                            service_type: 'all'
                                        });
                                    }}
                                    className="px-6 bg-gray-100 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    キャンセル
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                    {loading ? (
                        <div className="text-center py-20">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                            <p className="mt-4 text-gray-500">読み込み中...</p>
                        </div>
                    ) : announcements.length === 0 ? (
                        <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                            <p className="text-gray-500 font-bold">現在、お知らせはありません</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {announcements
                                .filter(announcement => isAdmin || announcement.is_active)
                                .map((announcement) => (
                                <div 
                                    key={announcement.id} 
                                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow relative"
                                >
                                    {isAdmin && (
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            <button
                                                onClick={() => handleEditAnnouncement(announcement)}
                                                className="text-indigo-600 hover:text-indigo-700 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="編集"
                                            >
                                                <Edit3 size={16}/>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteAnnouncement(announcement.id)}
                                                className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                title="削除"
                                            >
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex items-start justify-between mb-3 pr-20">
                                        <h2 className="text-xl font-bold text-gray-900">{announcement.title}</h2>
                                        <div className="flex items-center gap-2">
                                            {isAdmin && !announcement.is_active && (
                                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">
                                                    非表示
                                                </span>
                                            )}
                                            {isAdmin && announcement.service_type && (
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                    announcement.service_type === 'all' ? 'bg-blue-100 text-blue-700' :
                                                    announcement.service_type === 'quiz' ? 'bg-purple-100 text-purple-700' :
                                                    'bg-green-100 text-green-700'
                                                }`}>
                                                    {announcement.service_type === 'all' ? '全サービス' :
                                                     announcement.service_type === 'quiz' ? '診断クイズ' :
                                                     'プロフィールLP'}
                                                </span>
                                            )}
                                            <span className="text-xs text-gray-500 flex items-center gap-1 whitespace-nowrap ml-4">
                                                <Calendar size={14} />
                                                {announcement.announcement_date 
                                                    ? new Date(announcement.announcement_date).toLocaleDateString('ja-JP', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })
                                                    : new Date(announcement.created_at).toLocaleDateString('ja-JP', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })
                                                }
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap">
                                        {announcement.content}
                                    </div>

                                    {announcement.link_url && (
                                        <a 
                                            href={announcement.link_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold text-sm transition-colors"
                                        >
                                            {announcement.link_text || '詳細はこちら'}
                                            <ExternalLink size={16} />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Footer setPage={setPage} onCreate={()=>setPage('editor')} user={user} setShowAuth={setShowAuth} />
        </div>
    );
};

export default AnnouncementsPage;

