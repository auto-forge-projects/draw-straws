# 10 — Code Review: PR-1 (draw-straws)

- Tarih: 2026-07-19 | Mod: AUTOPILOT | İnceleyen: code-reviewer (Opus, blind) — yazan (Faz 9, Sonnet) ile FARKLI (Author ≠ Reviewer)
- İncelenen: `src/server.js`, `public/{shuffle,game}.js`, `public/index.html`, `public/style.css`, `tests/{shuffle,health}.test.js`, `Dockerfile`, `package.json` · Referans: docs/03, docs/05, docs/07

## Yöntem
Tüm kaynak modüller elle okundu (kör: HANDOFF/DL gerekçesi okunmadı, yalnız artefakt + sabit checklist). Testler bağımsız çalıştırıldı: `npm test` → 9/9 pass. Fairness (SEC-3/FR-2) dağılımı test sonucuyla doğrulandı. OWASP/SEC-1..9 çapraz kontrolü yapıldı; FR↔kod izlenebilirliği çıkarıldı.

## Bulgular
| # | Severity | Dosya:Satır | Bulgu | Aksiyon |
|---|----------|-------------|-------|---------|
| F1 | Major | public/game.js:22-102 | İstemci UI mantığı (FR-1 giriş doğrulama, FR-3 elden-ele sıra kilidi + idempotent tekrar-tık, FR-4 sonuç vurgusu/aria-live/yeniden-çek) için hiç otomatik test yok; yalnız saf `shuffle.js` mantığı test ediliyor. | Faz 11 (Test): DOM/entegrasyon senaryolarıyla kapsa (idempotency, sıra dışı tık no-op, sonuç duyurusu) |
| F2 | Minor | Dockerfile:1-9 | Konteyner `root` olarak çalışıyor; güvenlik tasarımı (docs/07 Docker izolasyonu) "root olmayan çalıştırma önerilir" diyor. `USER node` eklenmemiş. | Faz 12/15: `USER node` (veya non-root) direktifi ekle (defense-in-depth) |
| F3 | Minor | tests/health.test.js:13-19 | Güvenlik başlıkları yalnız `/health` üzerinde test ediliyor; statik varlık yanıtlarında (middleware tümüne uygulasa da) regresyon testi yok. | Faz 11: statik yol için başlık assertion'ı ekle |
| F4 | Nit | public/shuffle.js:32-34 | `createDraw` shuffle'dan ÖNCE `randomInt(n)` ile kısa çöpü konumlandırıyor; sonraki Fisher-Yates zaten düzgün dağıttığı için bu ilk atama gereksiz (zararsız, sonuç tarafsız). | Sadeleştirilebilir (opsiyonel) |
| F5 | Nit | src/server.js:10 | CSP yalnız `default-src 'self'`; `base-uri 'self'`, `object-src 'none'`, `frame-ancestors 'none'` ile sertleştirilebilir (XFO:DENY framing'i zaten kapatıyor, default-src script/object'i kapsıyor). | Opsiyonel sertleştirme |

**Blocker: 0 · Critical: 0 · Major: 1 · Minor: 2 · Nit: 2**

## İzlenebilirlik (FR ↔ kod)
| FR | Karşılayan modül | Durum |
|----|------------------|-------|
| FR-1 Oyuncu sayısı girişi (2-20) | game.js `isValidCount` + input/click handler, index.html `#playerCount` | ✅ karşılandı (UI testi yok — F1) |
| FR-2 Adil Fisher-Yates | shuffle.js `fisherYatesShuffle`+`randomInt` (crypto+rejection) | ✅ karşılandı + test doğruladı |
| FR-3 Sıralı elden-ele akış | game.js `onStrawClick` (sıra kilidi + idempotent), `renderStrawGrid` (yalnız active tıklanır) | ✅ karşılandı (UI testi yok — F1) |
| FR-4 Kısa çöp vurgusu/tekli sonuç | game.js `showResult` (aria-live + resultCard), `redrawBtn`; shuffle.js tam 1 kısa | ✅ karşılandı |
| FR-5 Statik servis + /health | server.js `express.static('public')` + `GET /health` | ✅ karşılandı + test doğruladı |
| FR-6 Tek cihaz/durum yok | Hiçbir storage/DB/cookie yok; sunucu durumsuz | ✅ karşılandı |

## Güvenlik (SEC-*) uygulama kontrolü
- SEC-1: ✅ `crypto.getRandomValues` kullanılıyor; `Math.random` yok (repo genelinde).
- SEC-2: ✅ Rejection sampling — `max = 256 - (256 % n)`, aralık dışı örnek atılıyor (modulo-bias yok).
- SEC-3: ✅ Standart Fisher-Yates (i..1, j∈[0,i]); 20000-örneklem dağılım testi ±%2 içinde geçti.
- SEC-4: ✅ CSP `default-src 'self'`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `x-powered-by` disabled — test doğruladı.
- SEC-5: ✅ DOM güncellemeleri `textContent` ile; `innerHTML` yalnız `''` (temizleme) olarak kullanılıyor — kullanıcı verisi innerHTML'e geçmiyor.
- SEC-6: ✅ DB/dosya/çerez/localStorage/sessionStorage yazımı yok; sunucu durumsuz.
- SEC-7: ✅ `express.static` yalnız `public/`, `redirect:false`; `/health` dışında route yok.
- SEC-8: ✅ Tek runtime dep (express); `package-lock.json` mevcut; Dockerfile `npm ci --omit=dev`. (`npm audit` gate'i Faz 12'ye ait.)
- SEC-9: N/A (deploy/nginx katmanı — kod review kapsamı dışı; Faz 12/14'te doğrulanır).

## Test kalitesi değerlendirmesi
`shuffle.js` saf mantığı güçlü kapsanmış: aralık, düzgün dağılım (50k örneklem), Fisher-Yates korunum, tam-1-kısa değişmezi, dağılım ±%2 (20k), bağımsız çağrı. Sibling projeden flaky ders (küçük örneklem) doğru içselleştirilmiş — örneklem büyütülmüş, eşik gevşetilmemiş. `/health` + statik servis + güvenlik başlıkları entegrasyon testli. **Boşluk:** en yüksek kullanıcı-etkileşimli yol olan `game.js` UI akışı (sıra kilidi, idempotent tekrar-tık FR-3, sonuç duyurusu FR-4) otomatik test edilmiyor (F1) — Faz 11'in birincil hedefi olmalı.

## Karar
**Kapı GEÇTİ** (Blocker=0, Critical=0). 1 Major (UI test boşluğu) + 2 Minor + 2 Nit KAYDEDİLDİ. LITE review_loop threshold=critical olduğu için Major/Minor düzeltme dayatılmaz; F1/F3 Faz 11 (Test)'e, F2 Faz 12/15'e, F4/F5 opsiyonel borç olarak yönlendirilir. Faz 9'a geri besleme (feedback loop) GEREKMEZ.

## Kalite kapısı raporu
- "Blocker/Critical bulgu = 0" → ✅ (Blocker: 0, Critical: 0)
- Bağımsız test çalıştırması: `npm test` → 9 pass / 0 fail
