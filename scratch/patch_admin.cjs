const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.jsx', 'utf8');

const target1 = `                                {/* 題幹文字（支援 SVG 圖表題、純文字與 LaTeX MathText） */}
                                <div style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--theme-border, var(--theme-border, #17324d))', lineHeight: 1.7, background: 'var(--theme-card, var(--theme-card, #fffdf9))', padding: '12px 14px', borderRadius: '10px', border: '1px solid #ded3c5' }}>
                                  {q.question && q.question.includes('<svg') ? (
                                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(q.question, { USE_PROFILES: { svg: true, html: true }, ADD_TAGS: ['svg','path','line','circle','rect','text','g','polyline','polygon'] }) }} style={{ overflowX: 'auto' }} />
                                  ) : (
                                    <MathText text={q.question || \`【題目代碼 \${q.id}】：某題庫標準觀念評量題。\` } />
                                  )}
                                </div>`;

// Check if target1 matches without strict whitespace:
const index1 = code.indexOf(`{/* 題幹文字（支援 SVG 圖表題、純文字與 LaTeX MathText） */}`);
if (index1 !== -1) {
  // Find preceding newline
  const prevLine = code.lastIndexOf('\n', index1);
  const endDiv = code.indexOf('</div>', index1) + 6;
  const chunkToReplace = code.substring(prevLine + 1, endDiv);
  
  const newChunk = `                                {/* 閱讀測驗長文區塊 */}
                                {(q.isReading || q.readingText) && q.readingText && (
                                  <div style={{ background: '#fcf8e3', border: '1.5px solid #faebcc', borderRadius: '10px', padding: '12px 16px', marginBottom: '8px' }}>
                                    <span style={{ display: 'inline-block', background: '#8a6d3b', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 900, marginBottom: '6px' }}>
                                      📖 閱讀素養文本
                                    </span>
                                    <div style={{ fontSize: '0.88rem', lineHeight: 1.7, fontWeight: 600, color: '#4a4a4a', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-serif)' }}>
                                      {q.readingText}
                                    </div>
                                  </div>
                                )}

                                {/* SVG 向量幾何/圖形題區塊 */}
                                {(q.isSvg || q.svgContent) && q.svgContent && (
                                  <div style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: '10px', padding: '14px', marginBottom: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <div
                                      className="quiz-svg-wrapper"
                                      style={{ maxWidth: '100%', width: '100%', display: 'flex', justifyContent: 'center' }}
                                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(q.svgContent, {
                                        USE_PROFILES: { svg: true, svgFilters: true },
                                        ADD_TAGS: ['svg', 'path', 'line', 'circle', 'rect', 'text', 'g', 'polyline', 'polygon', 'ellipse', 'defs', 'marker', 'linearGradient', 'stop'],
                                        ADD_ATTR: ['viewBox', 'xmlns', 'style', 'fill', 'stroke', 'stroke-width', 'rx', 'ry', 'text-anchor', 'font-size', 'font-weight', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'points', 'width', 'height', 'transform', 'd'],
                                        FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
                                        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
                                      }) }}
                                    />
                                  </div>
                                )}

${chunkToReplace}`;

  code = code.replace(chunkToReplace, newChunk);
  console.log('Replaced target 1 in AdminDashboard!');
}

const index2 = code.indexOf(`{/* 題幹內容 */}`);
if (index2 !== -1) {
  const prevLine2 = code.lastIndexOf('\n', index2);
  const endDiv2 = code.indexOf('</div>', index2) + 6;
  const chunkToReplace2 = code.substring(prevLine2 + 1, endDiv2);

  const newChunk2 = `                        {/* 閱讀測驗長文區塊 */}
                        {(log.isReading || log.readingText) && log.readingText && (
                          <div style={{ background: '#fcf8e3', border: '1.5px solid #faebcc', borderRadius: '10px', padding: '12px 16px', marginBottom: '8px' }}>
                            <span style={{ display: 'inline-block', background: '#8a6d3b', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 900, marginBottom: '6px' }}>
                              📖 閱讀素養文本
                            </span>
                            <div style={{ fontSize: '0.88rem', lineHeight: 1.7, fontWeight: 600, color: '#4a4a4a', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-serif)' }}>
                              {log.readingText}
                            </div>
                          </div>
                        )}

                        {/* SVG 向量幾何/圖形題區塊 */}
                        {(log.isSvg || log.svgContent) && log.svgContent && (
                          <div style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: '10px', padding: '14px', marginBottom: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <div
                              className="quiz-svg-wrapper"
                              style={{ maxWidth: '100%', width: '100%', display: 'flex', justifyContent: 'center' }}
                              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(log.svgContent, {
                                USE_PROFILES: { svg: true, svgFilters: true },
                                ADD_TAGS: ['svg', 'path', 'line', 'circle', 'rect', 'text', 'g', 'polyline', 'polygon', 'ellipse', 'defs', 'marker', 'linearGradient', 'stop'],
                                ADD_ATTR: ['viewBox', 'xmlns', 'style', 'fill', 'stroke', 'stroke-width', 'rx', 'ry', 'text-anchor', 'font-size', 'font-weight', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'points', 'width', 'height', 'transform', 'd'],
                                FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
                                FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
                              }) }}
                            />
                          </div>
                        )}

${chunkToReplace2}`;

  code = code.replace(chunkToReplace2, newChunk2);
  console.log('Replaced target 2 in AdminDashboard!');
}

fs.writeFileSync('src/components/AdminDashboard.jsx', code, 'utf8');
