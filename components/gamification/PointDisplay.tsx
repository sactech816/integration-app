'use client';

import React, { useState, useEffect } from 'react';
import { getPointBalance } from '@/app/actions/gamification';
import { Coins, TrendingUp } from 'lucide-react';

interface PointDisplayProps {
  userId?: string;
  className?: string;
  showTotal?: boolean;
  size?: 'sm' | 'md' | 'lg';
  refreshTrigger?: number; // 値が変わると再取得
}

export default function PointDisplay({
  userId,
  className = '',
  showTotal = false,
  size = 'md',
  refreshTrigger,
}: PointDisplayProps) {
  const [currentPoints, setCurrentPoints] = useState<number | null>(null);
  const [totalPoints, setTotalPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [animating, setAnimating] = useState(false);
  const [prevPoints, setPrevPoints] = useState<number | null>(null);

  useEffect(() => {
    async function loadBalance() {
      try {
        console.log('[PointDisplay] Loading balance, userId:', userId, 'refreshTrigger:', refreshTrigger);
        const balance = await getPointBalance(userId);
        
        console.log('[PointDisplay] Balance loaded:', balance);
        
        if (balance) {
          // ポイントが増えた場合はアニメーション
          if (prevPoints !== null && balance.current_points > prevPoints) {
            console.log('[PointDisplay] Points increased from', prevPoints, 'to', balance.current_points);
            setAnimating(true);
            setTimeout(() => setAnimating(false), 600);
          }
          
          setPrevPoints(currentPoints);
          setCurrentPoints(balance.current_points);
          setTotalPoints(balance.total_accumulated_points);
        } else {
          console.warn('[PointDisplay] No balance returned, setting to 0');
          setCurrentPoints(0);
          setTotalPoints(0);
        }
      } catch (error) {
        console.error('[PointDisplay] Error loading point balance:', error);
        setCurrentPoints(0);
        setTotalPoints(0);
      } finally {
        setLoading(false);
      }
    }

    loadBalance();
  }, [userId, refreshTrigger]);

  // サイズに応じたスタイル
  const sizeStyles = {
    sm: {
      container: 'px-3 py-1.5',
      icon: 'w-4 h-4',
      label: 'text-xs',
      value: 'text-lg',
    },
    md: {
      container: 'px-4 py-2',
      icon: 'w-5 h-5',
      label: 'text-xs',
      value: 'text-xl',
    },
    lg: {
      container: 'px-6 py-3',
      icon: 'w-6 h-6',
      label: 'text-sm',
      value: 'text-2xl',
    },
  };

  const styles = sizeStyles[size];

  if (loading) {
    return (
      <div className={`inline-flex items-center gap-2 bg-gray-100 rounded-full ${styles.container} ${className}`}>
        <div className={`${styles.icon} bg-gray-300 rounded-full animate-pulse`} />
        <div className="h-4 w-12 bg-gray-300 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* 現在のポイント */}
      <div
        className={`
          flex items-center gap-2 
          bg-gradient-to-r from-amber-100 to-orange-100 
          rounded-full ${styles.container}
          ${animating ? 'animate-point-pop' : ''}
        `}
      >
        <Coins className={`${styles.icon} text-amber-600`} />
        <div>
          <span className={`${styles.label} text-amber-700 block leading-none`}>ポイント</span>
          <span className={`${styles.value} font-bold text-amber-800 leading-none`}>
            {(currentPoints ?? 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* 累計ポイント */}
      {showTotal && totalPoints !== null && (
        <div className={`flex items-center gap-1.5 text-gray-500 ${styles.label}`}>
          <TrendingUp className="w-3 h-3" />
          <span>累計 {totalPoints.toLocaleString()} pt</span>
        </div>
      )}

      <style jsx>{`
        @keyframes point-pop {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        .animate-point-pop {
          animation: point-pop 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

























