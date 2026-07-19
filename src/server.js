'use strict';
const path = require('node:path');
const express = require('express');

const app = express();
app.disable('x-powered-by'); // SEC-4

// SEC-4: güvenlik başlıkları (CSP inline/unsafe yok, nosniff, deny-frame, no-referrer)
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// SEC-7: yalnız public/ servis edilir, dizin listeleme kapalı, /health dışında route yok.
app.use(express.static(path.join(__dirname, '..', 'public'), { index: 'index.html', redirect: false }));

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`draw-straws listening on :${PORT}`);
  });
}

module.exports = app;
