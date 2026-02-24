'use client';

import React, { useRef, useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { SVGTextElement } from '@/lib/types';

// アスペクト比からviewBoxサイズを計算
function getViewBoxSize(aspectRatio: string): { width: number; height: number } {
  switch (aspectRatio) {
    case '1:1': return { width: 1080, height: 1080 };
    case '9:16': return { width: 1080, height: 1920 };
    case '16:9':
    default: return { width: 1280, height: 720 };
  }
}

// Google Fonts URL
const FONT_IMPORT_URL = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&family=M+PLUS+Rounded+1c:wght@400;700;900&family=Kosugi+Maru&family=Zen+Kaku+Gothic+New:wght@400;700;900&display=swap';

export interface SVGTextOverlayRef {
  getSVGElement: () => SVGSVGElement | null;
}

interface SVGTextOverlayProps {
  backgroundImageUrl: string;
  aspectRatio: string;
  textElements: SVGTextElement[];
  onTextElementsChange: (elements: SVGTextElement[]) => void;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  editable?: boolean;
}

const SVGTextOverlay = forwardRef<SVGTextOverlayRef, SVGTextOverlayProps>(({
  backgroundImageUrl,
  aspectRatio,
  textElements,
  onTextElementsChange,
  selectedElementId,
  onSelectElement,
  editable = true,
}, ref) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; elemX: number; elemY: number } | null>(null);

  const { width: vbWidth, height: vbHeight } = getViewBoxSize(aspectRatio);

  useImperativeHandle(ref, () => ({
    getSVGElement: () => svgRef.current,
  }));

  // Google Fonts をページにロード
  useEffect(() => {
    const linkId = 'svg-overlay-fonts';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = FONT_IMPORT_URL;
      document.head.appendChild(link);
    }
  }, []);

  // マウス/タッチ座標をSVG viewBox座標に変換
  const clientToSVG = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const scaleX = vbWidth / rect.width;
    const scaleY = vbHeight / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, [vbWidth, vbHeight]);

  // ドラッグ開始
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent, elementId: string) => {
    if (!editable) return;
    e.preventDefault();
    e.stopPropagation();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const svgPos = clientToSVG(clientX, clientY);
    const elem = textElements.find(el => el.id === elementId);
    if (!elem) return;

    dragStartRef.current = {
      x: svgPos.x,
      y: svgPos.y,
      elemX: (elem.x / 100) * vbWidth,
      elemY: (elem.y / 100) * vbHeight,
    };
    setDragging(elementId);
    onSelectElement(elementId);
  }, [editable, clientToSVG, textElements, vbWidth, vbHeight, onSelectElement]);

  // ドラッグ移動
  useEffect(() => {
    if (!dragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const svgPos = clientToSVG(clientX, clientY);
      const start = dragStartRef.current;
      if (!start) return;

      const newX = start.elemX + (svgPos.x - start.x);
      const newY = start.elemY + (svgPos.y - start.y);

      // パーセントに変換（0-100 でクランプ）
      const pctX = Math.max(0, Math.min(100, (newX / vbWidth) * 100));
      const pctY = Math.max(0, Math.min(100, (newY / vbHeight) * 100));

      onTextElementsChange(
        textElements.map(el =>
          el.id === dragging ? { ...el, x: pctX, y: pctY } : el
        )
      );
    };

    const handleEnd = () => {
      setDragging(null);
      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', handleMove, { passive: false });
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [dragging, clientToSVG, vbWidth, vbHeight, textElements, onTextElementsChange]);

  // テキストのtext-anchor変換
  const getTextAnchor = (align?: string) => {
    switch (align) {
      case 'left': return 'start';
      case 'right': return 'end';
      default: return 'middle';
    }
  };

  // テキストを改行で分割してtspan群を生成
  const renderTextLines = (elem: SVGTextElement) => {
    const lines = elem.text.split('\n');
    const x = (elem.x / 100) * vbWidth;
    const y = (elem.y / 100) * vbHeight;

    if (lines.length === 1) {
      return <tspan x={x} dy="0">{elem.text}</tspan>;
    }

    return lines.map((line, i) => (
      <tspan
        key={i}
        x={x}
        dy={i === 0 ? '0' : `${elem.fontSize * 1.3}px`}
      >
        {line}
      </tspan>
    ));
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${vbWidth} ${vbHeight}`}
        className="w-full h-auto block rounded-xl"
        style={{ aspectRatio: aspectRatio.replace(':', '/') }}
        onClick={(e) => {
          if (e.target === svgRef.current || (e.target as Element).tagName === 'image') {
            onSelectElement(null);
          }
        }}
      >
        {/* フォント定義 */}
        <defs>
          <style>{`@import url('${FONT_IMPORT_URL}');`}</style>
        </defs>

        {/* 背景画像 */}
        <image
          href={backgroundImageUrl}
          width={vbWidth}
          height={vbHeight}
          preserveAspectRatio="xMidYMid slice"
        />

        {/* テキスト要素 */}
        {textElements.map((elem) => {
          const x = (elem.x / 100) * vbWidth;
          const y = (elem.y / 100) * vbHeight;
          const isSelected = selectedElementId === elem.id;

          return (
            <g key={elem.id}>
              {/* 選択枠 */}
              {editable && isSelected && (
                <rect
                  x={x - (elem.fontSize * elem.text.length * 0.3)}
                  y={y - elem.fontSize * 0.7}
                  width={elem.fontSize * elem.text.length * 0.6}
                  height={elem.fontSize * 1.4}
                  fill="none"
                  stroke="#ec4899"
                  strokeWidth={3}
                  strokeDasharray="8,4"
                  rx={6}
                />
              )}

              {/* テキスト本体 */}
              <text
                x={x}
                y={y}
                fontSize={elem.fontSize}
                fontFamily={`'${elem.fontFamily}', sans-serif`}
                fontWeight={elem.fontWeight}
                fill={elem.color}
                textAnchor={getTextAnchor(elem.textAlign)}
                dominantBaseline="central"
                style={{
                  cursor: editable ? (dragging === elem.id ? 'grabbing' : 'grab') : 'default',
                  userSelect: 'none',
                  paintOrder: 'stroke',
                }}
                stroke={elem.strokeColor || 'none'}
                strokeWidth={elem.strokeWidth || 0}
                strokeLinejoin="round"
                onMouseDown={(e) => handleDragStart(e, elem.id)}
                onTouchStart={(e) => handleDragStart(e, elem.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectElement(elem.id);
                }}
              >
                {renderTextLines(elem)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
});

SVGTextOverlay.displayName = 'SVGTextOverlay';
export default SVGTextOverlay;
