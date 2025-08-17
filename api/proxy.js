// api/proxy.js (Vercel Serverless Function)
import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) {
      return res.status(400).send('Missing url parameter');
    }

    // 请求头模拟浏览器
    const headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0',
      'Accept':
        'image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8,*/*;q=0.5',
      'Referer': 'https://www.pixiv.net/',
      'Cookie': 'PHPSESSID=110137795_euqvdXVCucAW9r4lQXggsmMZkVntkxN7;',
    };

    const response = await fetch(targetUrl, { headers });

    // 检查 content-type 是否是图片
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      return res.status(404).send('Target URL is not an image');
    }

    const buffer = await response.arrayBuffer();

    // 设置必要头部
    res.setHeader('Content-Type', contentType);
    const contentLength = response.headers.get('content-length');
    if (contentLength) res.setHeader('Content-Length', contentLength);
    const cacheControl = response.headers.get('cache-control');
    if (cacheControl) res.setHeader('Cache-Control', cacheControl);

    return res.status(response.status).send(Buffer.from(buffer));
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error fetching target URL: ' + err.message);
  }
}