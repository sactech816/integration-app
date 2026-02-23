'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export default function StatsBar() {
  const [totalCounts, setTotalCounts] = useState<Record<string, number>>({
    all: 0, quiz: 0, profile: 0, business: 0, survey: 0,
    booking: 0, attendance: 0, salesletter: 0, gamification: 0,
  });

  const fetchTotalCounts = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('content_creation_counts')
        .select('content_type, total_count');
      if (error) { console.error('Count fetch error:', error); return; }
      if (data) {
        const counts = data.reduce((acc, row) => {
          acc[row.content_type] = row.total_count;
          return acc;
        }, {} as Record<string, number>);
        setTotalCounts({
          all: Object.values(counts).reduce((a, b) => a + b, 0),
          quiz: counts.quiz || 0,
          profile: counts.profile || 0,
          business: counts.lp || 0,
          survey: counts.survey || 0,
          booking: counts.booking || 0,
          attendance: counts.attendance || 0,
          salesletter: counts.salesletter || 0,
          gamification: counts.game || 0,
        });
      }
    } catch (error) { console.error('Count fetch error:', error); }
  }, []);

  useEffect(() => {
    fetchTotalCounts();
  }, [fetchTotalCounts]);

  return (
    <section className="py-6 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-black">{totalCounts.all.toLocaleString()}</div>
            <div className="text-xs sm:text-sm opacity-80">総作品数</div>
          </div>
          <div className="hidden sm:block w-px h-10 bg-white/30"></div>
          {[
            { label: 'クイズ', count: totalCounts.quiz },
            { label: 'プロフィール', count: totalCounts.profile },
            { label: 'LP', count: totalCounts.business },
            { label: 'アンケート', count: totalCounts.survey },
            { label: '予約', count: totalCounts.booking },
            { label: '出欠', count: totalCounts.attendance },
            { label: 'セールス', count: totalCounts.salesletter },
            { label: 'ゲーム', count: totalCounts.gamification },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="text-lg sm:text-xl font-bold">{item.count.toLocaleString()}</div>
              <div className="text-xs opacity-80">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
