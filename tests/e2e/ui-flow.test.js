'use strict';
// Faz 11 — Entegrasyon/E2E katmanı (birim testlerinden ayrı: tests/e2e/).
// Gerçek tarayıcı yükleme sırasını simüle eder: index.html + shuffle.js + game.js
// aynı jsdom `window` global kapsamında, <script> etiketleriyle birebir aynı sırayla çalıştırılır.
// Faz 9 birim testleri (tests/shuffle.test.js, tests/health.test.js) çekirdek algoritma (FR-2)
// ve sunucu (FR-5) katmanını kapsar; bu dosya S1→S2→S3 kullanıcı akışını (FR-1, FR-3, FR-4, FR-6)
// gerçek DOM davranışıyla doğrular.
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const PUBLIC_DIR = path.join(__dirname, '..', '..', 'public');
const SERVER_PATH = path.join(__dirname, '..', '..', 'src', 'server.js');

const htmlSource = fs.readFileSync(path.join(PUBLIC_DIR, 'index.html'), 'utf8');
const shuffleSource = fs.readFileSync(path.join(PUBLIC_DIR, 'shuffle.js'), 'utf8');
const gameSource = fs.readFileSync(path.join(PUBLIC_DIR, 'game.js'), 'utf8');

// index.html'deki <script src="..."> etiketleri kaldırılıp yerine gerçek <script> elemanları
// enjekte edilir: shuffle.js/game.js 'use strict' taşıdığı için window.eval() (indirect eval)
// ile yüklenirse üst düzey fonksiyon bildirimleri eval'e özel gölge kapsamda kalır ve dışarı
// sızmaz (ECMA-262 strict eval semantiği) — gerçek <script> etiketi bu izolasyona tabi değildir.
const inlineScriptHtml = htmlSource.replace(/<script src="[^"]+"><\/script>\s*/g, '');

function loadPage() {
  const dom = new JSDOM(inlineScriptHtml, {
    url: 'http://localhost/',
    pretendToBeVisual: true,
    runScripts: 'dangerously',
  });
  const { document } = dom.window;
  for (const source of [shuffleSource, gameSource]) {
    const script = document.createElement('script');
    script.textContent = source;
    document.body.appendChild(script);
  }
  return dom;
}

function setPlayerCount(dom, raw) {
  const { document, Event } = dom.window;
  const input = document.getElementById('playerCount');
  input.value = raw;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  return input;
}

function clickShuffle(dom) {
  dom.window.document.getElementById('shuffleBtn').click();
}

function strawButtons(dom) {
  return Array.from(dom.window.document.querySelectorAll('#strawGrid .straw'));
}

describe('FR-1: Oyuncu sayısı girişi ve doğrulama', () => {
  test('geçersiz sayısal girdilerde (0,1,21,2.5,-3) buton devre dışı kalır ve uyarı gösterilir', () => {
    const dom = loadPage();
    const { document } = dom.window;
    const btn = document.getElementById('shuffleBtn');
    const warning = document.getElementById('setupWarning');
    for (const raw of ['0', '1', '21', '2.5', '-3']) {
      setPlayerCount(dom, raw);
      assert.equal(btn.disabled, true, `raw="${raw}" için buton etkin kalmamalı`);
      assert.equal(warning.hidden, false, `raw="${raw}" için uyarı gösterilmeli`);
    }
  });

  test('harf girişi (abc) — type="number" tarayıcı/jsdom tarafından boş değere sanitize edilir, boş alan gibi davranır (uyarı gösterilmez)', () => {
    const dom = loadPage();
    const { document } = dom.window;
    const btn = document.getElementById('shuffleBtn');
    const warning = document.getElementById('setupWarning');
    const input = setPlayerCount(dom, 'abc');
    assert.equal(input.value, '', 'type="number" harf girişini kabul etmez, değeri boşa döner');
    assert.equal(btn.disabled, true, 'boş değerde buton etkin kalmamalı');
    assert.equal(warning.hidden, true, 'boş alan için uyarı gösterilmemeli (kullanıcı henüz yazmaya başlamamış gibi)');
  });

  test('geçerli girdilerde (2, 5, 20) buton etkinleşir ve uyarı gizlenir', () => {
    const dom = loadPage();
    const { document } = dom.window;
    const btn = document.getElementById('shuffleBtn');
    const warning = document.getElementById('setupWarning');
    for (const n of [2, 5, 20]) {
      setPlayerCount(dom, String(n));
      assert.equal(btn.disabled, false, `n=${n} için buton etkin olmalı`);
      assert.equal(warning.hidden, true, `n=${n} için uyarı gizli olmalı`);
    }
  });

  test('geçerli sayı ile karıştırılınca tam olarak N kapalı çöp üretilir', () => {
    const dom = loadPage();
    setPlayerCount(dom, '7');
    clickShuffle(dom);
    const buttons = strawButtons(dom);
    assert.equal(buttons.length, 7);
    assert.ok(buttons.every((b) => !b.classList.contains('revealed')), 'hiçbir çöp henüz açılmamış olmalı');
  });
});

describe('FR-3: Sıralı ("elden ele") çekme akışı', () => {
  test('yalnızca sıradaki çöp aktif/tıklanabilir; sırası gelmemiş çöpe tıklama etkisiz kalır', () => {
    const dom = loadPage();
    setPlayerCount(dom, '4');
    clickShuffle(dom);
    assert.equal(strawButtons(dom)[0].classList.contains('active'), true);
    strawButtons(dom)[3].click(); // sırası gelmemiş oyuncu
    const buttons = strawButtons(dom);
    assert.ok(buttons.every((b) => !b.classList.contains('revealed')), 'sırası gelmemiş tıklama hiçbir çöpü açmamalı');
    assert.equal(buttons[0].classList.contains('active'), true, 'sıra hâlâ 1. oyuncuda kalmalı');
  });

  test('sıradaki çöpe tıklayınca anında açılır ve sıra bir sonraki oyuncuya geçer', () => {
    const dom = loadPage();
    setPlayerCount(dom, '4');
    clickShuffle(dom);
    strawButtons(dom)[0].click();
    const buttons = strawButtons(dom);
    assert.equal(buttons[0].classList.contains('revealed'), true);
    assert.match(buttons[0].textContent, /Kısa|Uzun/);
    assert.equal(buttons[0].classList.contains('active'), false);
    assert.equal(buttons[1].classList.contains('active'), true);
  });

  test('açılmış bir çöpe tekrar tıklamak idempotenttir (durum değişmez, hata fırlatmaz)', () => {
    const dom = loadPage();
    setPlayerCount(dom, '4');
    clickShuffle(dom);
    strawButtons(dom)[0].click();
    const before = strawButtons(dom)[0].textContent;
    assert.doesNotThrow(() => strawButtons(dom)[0].click());
    assert.equal(strawButtons(dom)[0].textContent, before, 'içerik değişmemeli');
    assert.equal(strawButtons(dom)[1].classList.contains('active'), true, 'sıra ilerlememeli (hâlâ 2. oyuncuda)');
  });
});

describe('FR-4: Kısa çöp vurgusu ve tekli sonuç', () => {
  test('son çöp açılınca sonuç ekranına geçilir ve kısa çöpü çeken oyuncu belirtilir', () => {
    const dom = loadPage();
    const { document } = dom.window;
    setPlayerCount(dom, '3');
    clickShuffle(dom);
    for (let i = 0; i < 3; i++) strawButtons(dom)[i].click();
    assert.equal(document.getElementById('screen-result').hidden, false);
    assert.equal(document.getElementById('screen-draw').hidden, true);
    assert.match(document.getElementById('resultCard').textContent, /Oyuncu \d+/);
  });

  test('sonuç aria-live bölgesiyle (ekran okuyucu) de duyurulur', () => {
    const dom = loadPage();
    const { document } = dom.window;
    setPlayerCount(dom, '3');
    clickShuffle(dom);
    for (let i = 0; i < 3; i++) strawButtons(dom)[i].click();
    const live = document.getElementById('ariaLiveResult');
    assert.equal(live.getAttribute('aria-live'), 'polite');
    assert.match(live.textContent, /oyuncu çekti/i);
  });

  test('"Yeniden Çek" aynı oyuncu sayısıyla bağımsız/yeni bir karıştırma başlatır', () => {
    const dom = loadPage();
    const { document } = dom.window;
    setPlayerCount(dom, '5');
    clickShuffle(dom);
    for (let i = 0; i < 5; i++) strawButtons(dom)[i].click();
    document.getElementById('redrawBtn').click();
    const buttons = strawButtons(dom);
    assert.equal(buttons.length, 5, 'aynı oyuncu sayısı korunmalı');
    assert.ok(buttons.every((b) => !b.classList.contains('revealed')), 'yeni turda tüm çöpler kapalı başlamalı');
    assert.equal(document.getElementById('screen-draw').hidden, false);
    assert.equal(document.getElementById('screen-result').hidden, true);
  });
});

describe('FR-6: Kapsam sınırı — tek cihaz, tek kısa çöp, durum yok', () => {
  test('kaynak kodda localStorage/sessionStorage/cookie kullanımı yoktur (kalıcı durum yasak)', () => {
    const combined = htmlSource + shuffleSource + gameSource;
    assert.doesNotMatch(combined, /localStorage/);
    assert.doesNotMatch(combined, /sessionStorage/);
    assert.doesNotMatch(combined, /document\.cookie/);
  });

  test('sunucu tarafında (server.js) oyun/rastgelelik mantığı yoktur — yalnız statik servis + health', () => {
    const serverSource = fs.readFileSync(SERVER_PATH, 'utf8');
    assert.doesNotMatch(serverSource, /Math\.random|getRandomValues|shuffle|createDraw/i);
  });

  test('ana ekranda yalnız oyuncu sayısı girişi + tek eylem düğmesi bulunur (oda kodu/hesap/geçmiş kontrolü yok)', () => {
    const dom = loadPage();
    const { document } = dom.window;
    const inputs = document.querySelectorAll('input, select, textarea');
    assert.equal(inputs.length, 1, 'yalnızca tek bir giriş alanı (oyuncu sayısı) olmalı');
    const staticButtonIds = Array.from(document.querySelectorAll('main > section > button')).map((b) => b.id).sort();
    assert.deepEqual(staticButtonIds, ['redrawBtn', 'shuffleBtn'].sort());
  });
});

describe('NFR-5: Erişilebilirlik (otomatik doğrulanabilir kısım)', () => {
  test('interaktif öğeler doğal <button>/<input> elemanlarıdır (div+onclick değil) — Tab/Enter erişimi doğal gelir', () => {
    const dom = loadPage();
    setPlayerCount(dom, '3');
    clickShuffle(dom);
    strawButtons(dom).forEach((el) => assert.equal(el.tagName, 'BUTTON'));
    assert.equal(dom.window.document.getElementById('playerCount').tagName, 'INPUT');
  });
});
