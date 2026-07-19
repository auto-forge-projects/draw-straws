# 04 — Çözüm Analizi: draw-straws

- Tarih: 2026-07-19 | Mod: AUTOPILOT | Profil: LITE

## Karar problemi
Tek cihazdan elden-ele oynanan, tüm oyun mantığı (Fisher-Yates) istemcide çalışan, statik dosya + `/health` sunan çöp-çekme aracı için sunum/paketleme mimarisi ne olmalı? Belirleyici kısıtlar: mantık istemcide olmalı (FR-2/FR-5), sunucuda durum/DB yok (NFR-3), `/health` deploy için şart (FR-5/NFR-8), sayfa ≤200KB (NFR-2), imaj ≤150MB & build ≤15dk (NFR-7), coinflip/dice-game SSH-push deploy akışıyla uyumlu.

## Alternatifler (kalite kapısı: en az 2 GERÇEK alternatif)
- **A — Node/Express statik servis + tarayıcı JS (Fisher-Yates istemcide).** Küçük Express sunucusu yalnız `public/` statik dosyaları ve `GET /health` sunar; oyun mantığı vanilla JS ile istemcide. coinflip/dice-game emsaliyle birebir kalıp.
- **B — Salt statik (tek/çok HTML+JS, nginx/http-server ile servis).** Sunucu kodu yok; nginx veya `serve` ile statik servis. `/health` için ayrı bir statik dosya veya proxy kuralı.
- **C — SSR/full-stack framework (Next.js/SvelteKit vb.).** Framework tabanlı, sunucu render + client hydration.

## Trade-off matrisi
| Kriter | A (Express+client JS) | B (Salt statik/nginx) | C (SSR framework) |
|--------|------------------------|------------------------|-------------------|
| Sayfa boyutu (NFR-2 ≤200KB) | ✅ vanilla, ~10-30KB | ✅ vanilla, en küçük | ⚠️ framework runtime kolay 200KB'ı aşar |
| `/health` (FR-5/NFR-8) | ✅ tek route, doğal | ⚠️ statik `health` dosyası; gerçek uygulama-sağlığı zayıf | ✅ route mümkün ama fazla katman |
| Sunucuda durum yok (NFR-3) | ✅ salt statik+health, DB yok | ✅ hiç sunucu mantığı yok | ⚠️ SSR gereksiz saldırı yüzeyi |
| İmaj/build (NFR-7 ≤150MB/≤15dk) | ✅ `node:alpine` ~50-70MB, dep'siz | ✅ `nginx:alpine` en küçük | ❌ node_modules+build şişkin, build uzun |
| Deploy uyumu (SSH-push, mevcut) | ✅ coinflip/dice-game ile aynı | ⚠️ ayrı nginx-in-container kalıbı, emsal yok | ❌ farklı runtime, yeni akış |
| Karmaşıklık / geliştirme (~1 gün) | ✅ düşük, bilinen | ✅ en düşük | ❌ yüksek, overkill |
| Geri alınabilirlik | ✅ Yüksek (statik `public/` her yere taşınır) | ✅ Yüksek | ⚠️ Orta (framework kilidi) |

## Seçim: **A — Node/Express statik servis + tarayıcı JS**
**Gerekçe:** A, tüm NFR'leri karşılarken (küçük imaj, ≤200KB sayfa, durumsuz) `GET /health` için birinci-sınıf bir route sağlar (NFR-8/FR-5) ve coinflip/dice-game'in kanıtlanmış SSH-push deploy + Dockerfile kalıbıyla birebir uyumludur — sıfır yeni altyapı. B (salt statik) marjinal olarak daha küçük olsa da `/health`'i gerçek uygulama-sağlığı yerine statik dosyaya indirger ve mevcut deploy emsalinden sapar (yeni nginx-in-container kalıbı riski); kazancı (birkaç KB) riski karşılamaz. C (SSR framework) bu durumsuz, mantığı-istemcide üründe tamamen gereksizdir: sayfa boyutu, imaj boyutu ve build süresi NFR'lerini tehdit eder, saldırı yüzeyini büyütür ve deploy akışını bozar — elendi. A ile oyun mantığı zaten istemcide kaldığı için FR-2 (client-side rastgelelik) ve NFR-3 (sunucuda veri yok) doğal olarak sağlanır.

## Teknoloji yığını kararı
- **Sunucu:** Node.js (LTS) + Express — yalnız statik servis (`express.static('public')`) + `GET /health → 200 {"status":"ok"}`. Sunucuda oyun/rastgelelik mantığı YOK (FR-5/NFR-3).
- **İstemci:** Vanilla JS (framework yok) + HTML + CSS; Fisher-Yates `crypto.getRandomValues`/`Math.random` ile istemcide (FR-2). Durum saklama yok (NFR-3/FR-6). Erişilebilirlik: `aria-live` + klavye (NFR-5).
- **Paketleme:** Dockerfile `node:*-alpine` tabanlı, tek katman `npm ci --omit=dev` (yalnız express) → ~50-70MB (NFR-7 ≤150MB). Faz 12 CI/CD bu Dockerfile'ı kullanır; SSH-push deploy coinflip/dice-game ile aynı.
- **Test:** Node test runner / basit birim testi ile Fisher-Yates dağılım testi (KPI-2, 1000 sim ±%2) ve `/health` smoke testi (NFR-8).

## Kalite kapısı raporu
- "En az 2 alternatif karşılaştırıldı" → ✅ GEÇTİ — 3 gerçek alternatif (A/B/C), 7 kriterli trade-off matrisiyle satır satır karşılaştırıldı; her biri NFR-2/3/7/8 ve deploy uyumuna bağlandı.
- Seçim NFR'lere gerekçelendirildi → ✅ (A seçildi; B ve C eleme gerekçeleri açık).
