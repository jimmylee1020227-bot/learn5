import React, { useState } from 'react';
import { BookOpen, X, Info, HelpCircle } from 'lucide-react';
import MathText from './MathText';

// 國中課本與會考標準數學符號資料庫
export const MATH_SYMBOLS_DB = [
  {
    id: 'sqrt',
    symbol: '√',
    latex: '\\sqrt{x}',
    name: '根號 (二次方根)',
    readAs: '根號 x',
    meaning: '代表非負實數的平方根，即 $y^2 = x$ (且 $y \\ge 0$) 之正數解 $y = \\sqrt{x}$。',
    example: '$\\sqrt{25} = 5$、$\\sqrt{12} = 2\\sqrt{3}$',
    detect: (text) => text.includes('\\sqrt') || text.includes('√')
  },
  {
    id: 'times',
    symbol: '×',
    latex: 'a \\times b',
    name: '乘號',
    readAs: 'a 乘以 b',
    meaning: '課本四則運算標準乘法符號，非英文字母 x。代數中常省略或記為圓點 $\\cdot$。',
    example: '$3 \\times (-5) = -15$、$2 \\times 3x = 6x$',
    detect: (text) => text.includes('\\times') || text.includes('×')
  },
  {
    id: 'div',
    symbol: '÷',
    latex: 'a \\div b',
    name: '除號',
    readAs: 'a 除以 b',
    meaning: '課本算式除法符號，代表將 a 分割為 b 等份，亦可化為上下垂直分數 $\\frac{a}{b}$。',
    example: '$12 \\div (-4) = -3$、$\\frac{6}{2} = 3$',
    detect: (text) => text.includes('\\div') || text.includes('÷')
  },
  {
    id: 'frac',
    symbol: 'a/b',
    latex: '\\frac{a}{b}',
    name: '分數 (水平分數線)',
    readAs: 'b 分之 a',
    meaning: '課本標準排版垂直分數，水平橫線上方為「分子」，下方為「分母」（分母不得為 0）。',
    example: '$\\frac{3}{4}$、$\\frac{1}{x} + \\frac{1}{y}$',
    detect: (text) => text.includes('\\frac')
  },
  {
    id: 'power',
    symbol: 'xⁿ',
    latex: 'x^n',
    name: '次方 (指數冪)',
    readAs: 'x 的 n 次方',
    meaning: '上標數字代表基數 x 連續相乘 n 次。',
    example: '$2^3 = 8$、$(x - 3)^2 = x^2 - 6x + 9$',
    detect: (text) => text.includes('^') || /[a-zA-Z0-9]\^[0-9]/.test(text)
  },
  {
    id: 'abs',
    symbol: '|x|',
    latex: '|x|',
    name: '絕對值',
    readAs: 'x 的絕對值',
    meaning: '數線上點 x 到原點 0 的距離，值恆為非負數（$|x| \\ge 0$）。',
    example: '$|-5| = 5$、$|a - b|$ 代表 a 與 b 兩點的距離',
    detect: (text) => /\|[^|]+\|/.test(text)
  },
  {
    id: 'gcd',
    symbol: '(a, b)',
    latex: '(a, b)',
    name: '最大公因數 / 坐標',
    readAs: 'a 與 b 的最大公因數 或 點坐標',
    meaning: '圓括號在數論單元中表示兩整數的最大公因數 (GCD)；在直角坐標中代表平面上的點。',
    example: '$(12, 18) = 6$；點 $P(3, 4)$',
    detect: (text) => text.includes('最大公因數') || /\(\d+,\s*\d+\)/.test(text)
  },
  {
    id: 'lcm',
    symbol: '[a, b]',
    latex: '[a, b]',
    name: '最小公倍數',
    readAs: 'a 與 b 的最小公倍數',
    meaning: '中括號在數論單元中代表兩整數的最小公倍數 (LCM)。',
    example: '$[12, 18] = 36$、$[5, 7] = 35$',
    detect: (text) => text.includes('最小公倍數') || /\[\d+,\s*\d+\]/.test(text)
  },
  {
    id: 'triangle',
    symbol: '△',
    latex: '\\triangle ABC',
    name: '三角形',
    readAs: '三角形 ABC',
    meaning: '幾何中由 A、B、C 三個頂點與三條邊構成的平面幾何圖形。',
    example: '$\\triangle ABC \\cong \\triangle DEF$',
    detect: (text) => text.includes('\\triangle') || text.includes('△')
  },
  {
    id: 'angle',
    symbol: '∠',
    latex: '\\angle A',
    name: '角',
    readAs: '角 A',
    meaning: '兩射線自同一頂點發散所形成的夾角或其度數代號。',
    example: '$\\angle 1 = 35^\\circ$、$\\angle C = 90^\\circ$',
    detect: (text) => text.includes('\\angle') || text.includes('∠')
  },
  {
    id: 'degree',
    symbol: '°',
    latex: 'x^\\circ',
    name: '度數',
    readAs: 'x 度',
    meaning: '角度測量的基本單位（圓周一周角為 360 度，直角為 90 度）。',
    example: '$180^\\circ$（平角）、$90^\\circ$（直角）',
    detect: (text) => text.includes('^\\circ') || text.includes('°')
  },
  {
    id: 'parallel',
    symbol: '//',
    latex: 'L_1 \\parallel L_2',
    name: '平行',
    readAs: 'L₁ 平行於 L₂',
    meaning: '同一平面上同方向且永不相交的兩直線。',
    example: '$DE \\parallel BC$（截出等比例線段）',
    detect: (text) => text.includes('//') || text.includes('\\parallel')
  },
  {
    id: 'perp',
    symbol: '⊥',
    latex: 'L_1 \\perp L_2',
    name: '垂直',
    readAs: 'L₁ 垂直於 L₂',
    meaning: '兩直線或線段相交形成 90 度直角。',
    example: '$AB \\perp BC$',
    detect: (text) => text.includes('\\perp') || text.includes('⊥')
  },
  {
    id: 'sim',
    symbol: '∼',
    latex: '\\triangle ABC \\sim \\triangle DEF',
    name: '相似',
    readAs: '相似於',
    meaning: '兩圖形對應角相等、對應邊成等比例，形狀相同但大小可能不同。',
    example: '$\\triangle ADE \\sim \\triangle ABC$（面積比為邊長平方比）',
    detect: (text) => text.includes('\\sim') || text.includes('相似')
  },
  {
    id: 'cong',
    symbol: '≅',
    latex: '\\triangle ABC \\cong \\triangle DEF',
    name: '全等',
    readAs: '全等於',
    meaning: '兩圖形對應角相等且對應邊等長，形狀與大小完全相同。',
    example: '由 SAS 全等性質可知兩三角形全等',
    detect: (text) => text.includes('\\cong') || text.includes('≅') || text.includes('全等')
  },
  {
    id: 'ineq',
    symbol: '≤ / ≥',
    latex: 'a \\le b',
    name: '不等號',
    readAs: '小於等於 / 大於等於',
    meaning: '表示兩數或兩式的大小關係，包含等於的可能。',
    example: '$|2x - 5| \\le 9$',
    detect: (text) => text.includes('\\le') || text.includes('\\ge') || text.includes('≤') || text.includes('≥')
  },
  {
    id: 'pm',
    symbol: '±',
    latex: '\\pm x',
    name: '正負號',
    readAs: '正負 x',
    meaning: '同時代表正值或負值，常出現在一元二次方程式的公式解中。',
    example: '$x = \\pm \\sqrt{5}$',
    detect: (text) => text.includes('\\pm') || text.includes('±')
  },
  {
    id: 'pi',
    symbol: 'π',
    latex: '\\pi',
    name: '圓周率',
    readAs: '圓周率 (pi)',
    meaning: '圓的周長與直徑的比值，為無理數，國中計算常記為 $\\pi$ 或以 3.14 近似。',
    example: '圓面積 $= \\pi r^2$、圓周長 $= 2\\pi r$',
    detect: (text) => text.includes('\\pi') || text.includes('π')
  }
];

export function extractMathSymbols(fullText) {
  if (!fullText || typeof fullText !== 'string') return [];
  return MATH_SYMBOLS_DB.filter(item => item.detect(fullText));
}

export default function MathSymbolLegend({ question, compact = false }) {
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [showFullModal, setShowFullModal] = useState(false);

  // 合併題幹、選項、提示與詳解作為偵測內容
  const combinedText = [
    question?.question || '',
    ...(Array.isArray(question?.options) ? question.options : []),
    question?.hint || '',
    question?.explanation || ''
  ].join(' ');

  const detectedSymbols = extractMathSymbols(combinedText);

  // 如果這題完全沒有任何數學符號且非數學科，可隱藏或只顯示手冊按鈕
  if (detectedSymbols.length === 0 && compact) {
    return null;
  }

  return (
    <div style={{ margin: '8px 0 12px 0' }}>
      {/* 題目旁的符號標註膠囊區 */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#6b7280', fontSize: '0.78rem', fontWeight: 800 }}>
          <Info size={14} color="#ef8354" />
          <span>本題符號標註：</span>
        </div>

        {detectedSymbols.length > 0 ? (
          detectedSymbols.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedSymbol(selectedSymbol?.id === item.id ? null : item)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                borderRadius: '8px',
                background: selectedSymbol?.id === item.id ? '#ef8354' : '#f4ede4',
                color: selectedSymbol?.id === item.id ? '#ffffff' : '#17324d',
                border: '1px solid #ded3c5',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title={`點擊查看 ${item.name} 詳細課本說明`}
            >
              <span style={{ fontWeight: 900, color: selectedSymbol?.id === item.id ? '#ffffff' : '#ef8354' }}>
                {item.symbol}
              </span>
              <span>{item.name}</span>
            </button>
          ))
        ) : (
          <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600 }}>
            本題為基礎常數文字運算
          </span>
        )}

        {/* 課本符號手冊入口按鈕 */}
        <button
          type="button"
          onClick={() => setShowFullModal(true)}
          style={{
            marginLeft: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: '6px',
            background: 'transparent',
            color: '#6366f1',
            border: '1px dashed #c7d2fe',
            fontSize: '0.72rem',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          <BookOpen size={12} />
          <span>課本符號手冊</span>
        </button>
      </div>

      {/* 單一符號快速解析展開卡片 */}
      {selectedSymbol && (
        <div 
          style={{
            marginTop: '10px',
            padding: '12px 16px',
            borderRadius: '12px',
            background: '#ffffff',
            border: '1.5px solid #ef8354',
            boxShadow: '0 4px 12px rgba(239, 131, 84, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            position: 'relative'
          }}
        >
          <button
            type="button"
            onClick={() => setSelectedSymbol(null)}
            style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
          >
            <X size={16} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ef8354' }}>
              <MathText text={`$${selectedSymbol.latex}$`} />
            </span>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#17324d' }}>
              【{selectedSymbol.name}】
            </span>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: '4px' }}>
              讀作：{selectedSymbol.readAs}
            </span>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#374151', lineHeight: 1.5 }}>
            {selectedSymbol.meaning}
          </div>

          <div style={{ fontSize: '0.78rem', color: '#4f46e5', fontWeight: 700, background: '#eef2ff', padding: '4px 8px', borderRadius: '6px' }}>
            課本範例：<MathText text={selectedSymbol.example} />
          </div>
        </div>
      )}

      {/* 國中數學課本標準符號總表對照彈窗 */}
      {showFullModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
          onClick={() => setShowFullModal(false)}
        >
          <div 
            style={{
              background: '#fffdf9',
              border: '3px solid #17324d',
              borderRadius: '24px',
              padding: '24px 28px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '8px 8px 0px #17324d',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 彈窗標題列 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #ded3c5', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={22} color="#ef8354" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#17324d' }}>
                  國中 108 課綱／會考標準數學符號手冊
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowFullModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '0.85rem', color: '#4b5563', lineHeight: 1.5 }}>
              本系統嚴格遵循教育部 108 課綱與國中教育會考規範，全部數學試題均採用國際標準 LaTeX/KaTeX 進行向量字型排版：
            </p>

            {/* 符號表格 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {MATH_SYMBOLS_DB.map(sym => (
                <div 
                  key={sym.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    background: '#ffffff'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: 900, minWidth: '45px', color: '#ef8354' }}>
                        <MathText text={`$${sym.latex}$`} />
                      </span>
                      <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#17324d' }}>
                        {sym.name}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: '4px' }}>
                      讀法：{sym.readAs}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#4b5563', marginTop: '2px' }}>
                    {sym.meaning}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#4f46e5', fontWeight: 600 }}>
                    範例：<MathText text={sym.example} />
                  </div>
                </div>
              ))}
            </div>

            {/* 關閉按鈕 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowFullModal(false)}
                style={{ padding: '8px 24px', fontWeight: 800 }}
              >
                關閉手冊
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
