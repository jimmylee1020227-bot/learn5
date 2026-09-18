import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function cloudSyncPlugin() {
  const dataDir = path.resolve(__dirname, 'server_data')
  const dataFile = path.resolve(dataDir, 'cloud_state.json')

  // 初始化儲存目錄與資料庫檔案
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify({}, null, 2), 'utf-8')
  }

  const sseClients = new Set()

  function broadcast(data) {
    const payload = `data: ${JSON.stringify(data)}\n\n`
    for (const client of sseClients) {
      try {
        client.write(payload)
      } catch (err) {
        sseClients.delete(client)
      }
    }
  }

  function readState() {
    try {
      const content = fs.readFileSync(dataFile, 'utf-8')
      return JSON.parse(content || '{}')
    } catch {
      return {}
    }
  }

  function writeState(state) {
    try {
      fs.writeFileSync(dataFile, JSON.stringify(state, null, 2), 'utf-8')
    } catch (e) {
      console.error('Failed to write cloud_state.json', e)
    }
  }

  function mergeStateKey(state, key, value) {
    if (key === 'practice_history' && Array.isArray(value)) {
      const existing = Array.isArray(state.practice_history) ? state.practice_history : []
      const map = new Map()
      // 先放新記錄，再補充舊記錄
      value.forEach(item => { if (item?.id) map.set(item.id, item) })
      existing.forEach(item => { if (item?.id && !map.has(item.id)) map.set(item.id, item) })
      const merged = Array.from(map.values()).sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
      state.practice_history = merged.slice(0, 5000)
      return state.practice_history
    }
    if (key === 'mistake_notebook' && typeof value === 'object' && value !== null) {
      if (!state.mistake_notebook || typeof state.mistake_notebook !== 'object') {
        state.mistake_notebook = {}
      }
      Object.keys(value).forEach(uId => {
        const serverUserList = Array.isArray(state.mistake_notebook[uId]) ? state.mistake_notebook[uId] : []
        const clientUserList = Array.isArray(value[uId]) ? value[uId] : []
        const qMap = new Map()
        clientUserList.forEach(m => { if (m?.questionId) qMap.set(m.questionId, m) })
        serverUserList.forEach(m => { if (m?.questionId && !qMap.has(m.questionId)) qMap.set(m.questionId, m) })
        state.mistake_notebook[uId] = Array.from(qMap.values())
      })
      return state.mistake_notebook
    }
    if (key === 'community_reports' && Array.isArray(value)) {
      const existing = Array.isArray(state.community_reports) ? state.community_reports : []
      const map = new Map()
      value.forEach(r => { if (r?.id) map.set(r.id, r) })
      existing.forEach(r => { if (r?.id && !map.has(r.id)) map.set(r.id, r) })
      const merged = Array.from(map.values()).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      state.community_reports = merged.slice(0, 1000)
      return state.community_reports
    }
    if (key === 'community_posts' && Array.isArray(value)) {
      const existing = Array.isArray(state.community_posts) ? state.community_posts : []
      const deletedSet = new Set(Array.isArray(state.deleted_community_post_ids) ? state.deleted_community_post_ids : [])
      const map = new Map()
      value.forEach(p => { if (p?.id && !deletedSet.has(p.id)) map.set(p.id, p) })
      existing.forEach(p => { if (p?.id && !deletedSet.has(p.id) && !map.has(p.id)) map.set(p.id, p) })
      state.community_posts = Array.from(map.values()).slice(0, 1000)
      return state.community_posts
    }
    if (key.startsWith('deleted_') && Array.isArray(value)) {
      const existing = Array.isArray(state[key]) ? state[key] : []
      state[key] = Array.from(new Set([...existing, ...value]))
      return state[key]
    }
    if (key === 'question_overrides' && typeof value === 'object' && value !== null) {
      state.question_overrides = { ...(state.question_overrides || {}), ...value }
      return state.question_overrides
    }
    if (key === 'support_chats' && typeof value === 'object' && value !== null) {
      if (!state.support_chats || typeof state.support_chats !== 'object') {
        state.support_chats = {}
      }
      Object.keys(value).forEach(threadKey => {
        const existingMsgs = Array.isArray(state.support_chats[threadKey]) ? state.support_chats[threadKey] : []
        const clientMsgs = Array.isArray(value[threadKey]) ? value[threadKey] : []
        const msgMap = new Map()
        existingMsgs.forEach(m => { if (m?.id) msgMap.set(m.id, m) })
        clientMsgs.forEach(m => { if (m?.id) msgMap.set(m.id, m) })
        const merged = Array.from(msgMap.values()).sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0))
        state.support_chats[threadKey] = merged.slice(-200)
      })
      return state.support_chats
    }
    state[key] = value
    return value
  }

  function handleCloudMiddleware(req, res, next) {
    const url = req.url?.split('?')[0]

    // 1. 即時 SSE 串流：推送給所有連線設備 (同學手機、其他電腦、管理員電腦)
    if (url === '/api/cloud-stream') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      })
      res.write('data: {"type":"CONNECTED"}\n\n')
      sseClients.add(res)

      // 定期發送心跳保持行動裝置連線活躍
      const keepAliveTimer = setInterval(() => {
        try {
          res.write(': keep-alive\n\n')
        } catch {
          clearInterval(keepAliveTimer)
          sseClients.delete(res)
        }
      }, 15000)

      req.on('close', () => {
        clearInterval(keepAliveTimer)
        sseClients.delete(res)
      })
      return
    }

    // 2. 獲取全域跨設備共享資料庫
    if (url === '/api/cloud-sync' && req.method === 'GET') {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Access-Control-Allow-Origin', '*')
      const state = readState()
      res.end(JSON.stringify({ ok: true, state }))
      return
    }

    // 3. 寫入或更新全域跨設備資料庫 (支援 Smart Merging，杜絕多端做題覆蓋遺失)
    if (url === '/api/cloud-sync' && req.method === 'POST') {
      let body = ''
      req.on('data', chunk => { body += chunk })
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}')
          const state = readState()
          let broadcastValue = payload.value

          if (payload.key) {
            broadcastValue = mergeStateKey(state, payload.key, payload.value)
          }
          if (payload.batch && typeof payload.batch === 'object') {
            Object.entries(payload.batch).forEach(([k, v]) => {
              mergeStateKey(state, k, v)
            })
          }
          writeState(state)

          // 廣播給所有連線設備（包括同學與管理員）
          broadcast({
            type: 'SYNC_UPDATE',
            key: payload.key,
            value: broadcastValue,
            timestamp: Date.now()
          })

          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.end(JSON.stringify({ ok: true, timestamp: Date.now() }))
        } catch (err) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ok: false, error: err.message }))
        }
      })
      return
    }

    next()
  }

  return {
    name: 'cloud-sync-backend',
    configureServer(server) {
      server.middlewares.use(handleCloudMiddleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleCloudMiddleware)
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './', // 支援 GitHub Pages 與各類靜態部署子路徑
  plugins: [react(), cloudSyncPlugin()],
  server: {
    host: true,
    port: 5173
  },
  preview: {
    host: true,
    port: 5173
  }
})
