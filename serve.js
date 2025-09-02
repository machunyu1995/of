import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 设置文件目录为同级的 "public" 文件夹
const publicDirectory = path.join(__dirname, 'deploy')

const server = http.createServer((req, res) => {
  console.log('Received request for:', req.url)
  
  // 添加 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  let filePath = path.join(
    publicDirectory,
    req.url === '/' ? 'index.html' : req.url,
  )

  // 检查请求的路径是否是目录
  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' })
      res.end('404 Not Found', 'utf-8')
      return
    }

    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html')
    }

    const extname = path.extname(filePath)
    let contentType = 'text/html'

    // 设置响应的 Content-Type
    switch (extname) {
      case '.js':
        contentType = 'text/javascript'
        break
      case '.css':
        contentType = 'text/css'
        break
      case '.json':
        contentType = 'application/json'
        break
      case '.png':
        contentType = 'image/png'
        break
      case '.jpg':
        contentType = 'image/jpg'
        break
      case '.svg':
        contentType = 'image/svg+xml'
        break
      case '.ico':
        contentType = 'image/x-icon'
        break
      case '.woff':
        contentType = 'font/woff'
        break
      case '.woff2':
        contentType = 'font/woff2'
        break
      case '.ttf':
        contentType = 'font/ttf'
        break
      case '.pdf':
        contentType = 'application/pdf'
        break
    }

    // 读取并返回文件内容
    fs.readFile(filePath, (error, content) => {
      if (error) {
        console.error('Error reading file:', error)
        console.error('Attempted file path:', filePath)
        if (error.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/html' })
          res.end('404 Not Found', 'utf-8')
        } else {
          res.writeHead(500)
          res.end(`Server Error: ${error.code}`)
        }
      } else {
        console.log('Successfully served:', filePath)
        console.log('Content Type:', contentType)
        
        // 设置通用响应头
        const headers = {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
        
        if (extname === '.pdf') {
          // 对 PDF 文件特殊处理
          headers['Accept-Ranges'] = 'bytes'
          headers['Content-Length'] = content.length
        }
        
        res.writeHead(200, headers)
        res.end(content)
      }
    })
  })
})

server.listen(8848, () => {
  console.log('Server running at http://localhost:8848')
})