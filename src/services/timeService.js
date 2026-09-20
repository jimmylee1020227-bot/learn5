// src/services/timeService.js
// 全球伺服器時間同步核心機制
// 避免使用者隨意修改電腦本機時間作弊，一律使用外部伺服器時間作為系統基準

let serverTimeOffset = 0; // 伺服器時間與本機時間的差值 (毫秒)
let isTimeSynced = false;
let syncPromise = null;

/**
 * 初始化時間同步
 * 對外部可靠的 HTTPS 伺服器發送 HEAD 請求抓取 Date Header。
 * 由於不需要等 Response Body，速度極快且不耗頻寬。
 */
export async function syncServerTime() {
  if (isTimeSynced) return;
  if (syncPromise) return syncPromise;

  syncPromise = (async () => {
    try {
      // 紀錄發送請求前的本機時間
      const startLocalTime = Date.now();
      
      // 這裡使用完全支援跨域 (CORS) 的 timeapi.io 來獲取 UTC 絕對時間
      // 加上 cache: 'no-store' 確保不會被瀏覽器快取
      const response = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=UTC', { 
        method: 'GET',
        cache: 'no-store'
      });
      
      const data = await response.json();
      if (data && data.dateTime) {
        const endLocalTime = Date.now();
        // 假設網路延遲是來回對稱的，伺服器真實時間大約等於 serverDate 加上單趟延遲
        const roundTripTime = endLocalTime - startLocalTime;
        // 注意：必須在字串尾部加上 'Z'，讓 JS 知道這是絕對的 UTC 時間，不受使用者電腦時區干擾
        const serverTimeMs = new Date(data.dateTime + 'Z').getTime() + (roundTripTime / 2);
        
        // 算出時差
        serverTimeOffset = serverTimeMs - endLocalTime;
        isTimeSynced = true;
        console.log(`[TimeSync] 成功同步伺服器時間，與本機時差: ${serverTimeOffset} ms`);
      } else {
        throw new Error("無法取得 timeapi.io 的時間資料");
      }
    } catch (err) {
      console.warn(`[TimeSync] 伺服器時間同步失敗，退回使用本機時間: ${err.message}`);
      // 失敗時保持 offset 為 0，也就是預設使用本機時間
      serverTimeOffset = 0;
      isTimeSynced = true; 
    }
  })();

  return syncPromise;
}

/**
 * 取得校正過後的「真實絕對時間」 (毫秒)
 * 應該取代全系統的 Date.now()
 */
export function getRealTime() {
  return Date.now() + serverTimeOffset;
}

/**
 * 取得校正過後的「真實 Date 物件」
 * 應該取代全系統的 new Date() (無參數時)
 */
export function getRealDate() {
  return new Date(getRealTime());
}
