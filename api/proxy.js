module.exports = async (req, res) => {
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
    };

    const response = await fetch(targetUrl, { headers });

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      return res.status(404).send('Target URL is not an image');
    }

    const arrayBuffer = await response.arrayBuffer();

    // 设置必要头部
    res.setHeader('Content-Type', contentType);
    const contentLength = response.headers.get('content-length');
    if (contentLength) res.setHeader('Content-Length', contentLength);
    const cacheControl = response.headers.get('cache-control');
    if (cacheControl) res.setHeader('Cache-Control', cacheControl);

    res.status(200).send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching target URL: ' + err.message);
  }
};
