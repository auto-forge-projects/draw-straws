# draw-straws v0.1.0 — Release Notes

- Tarih: 2026-07-22 | SemVer: **v0.1.0** (0.x = API garanti yok) | Mod: AUTOPILOT

## Öne çıkanlar
İlk sürüm (M1, Faz 8 planı) — kimlik/oturum gerektirmeyen, elden-ele çöp çekme aracı. Tek Docker imajı, ağ round-trip'siz istemci mantığı.

## Özellikler
- Oyuncu sayısı girişi (2-20, tam sayı doğrulama).
- CSPRNG (`crypto.getRandomValues` + rejection sampling) ile tarafsız Fisher-Yates karıştırma (FR-2, 1000-sim ±%2 doğrulandı).
- Elden-ele akış: yalnız sıradaki çöp tıklanabilir, açığa çıkarma idempotent.
- Sonuç ekranı: kısa çöp sahibi ≤1sn vurgu + `aria-live` erişilebilirlik duyurusu; "Yeniden Çek".
- `GET /health` → `200 {"status":"ok"}` (Express, statik `public/` servis).

## Güvenlik
OWASP Top 10 (2021) tamamı değerlendirildi (`docs/07-security.md`) — kimlik doğrulama/PII/kalıcı veri yok, N/A maddeler gerekçeli. `--omit=dev`, güvenlik başlıkları, TLS nginx katmanında. AI tedarik zinciri tehditleri (üründe LLM yok) N/A.

## Bilinen sınırlar
Tek cihaz/elden-ele varsayımı (çoklu-cihaz senkron akış kapsam dışı); `public/game.js` node coverage aracında ayrı satır görünmez (E2E `<script>` enjeksiyonuyla ölçülür, bkz. `docs/11-test/results.md`). Detay: `docs/15-maintenance.md` (Faz 15).

## Kurulum
```
docker build -t draw-straws:0.1.0 .
docker run -d --rm -p 3000:3000 --name draw-straws draw-straws:0.1.0
curl http://localhost:3000/health
```
Uzak dağıtım: `deploy.json` (nginx proxy, `host_port:5002`, wildcard TLS) → `https://draw-straws.apps.sametemek.com`.

## Rollback planı (kalite kapısı)
1. **Kod:** Bu sürüm tek commit aralığında (`git log --oneline`); önceki yeşil tag/commit'e `git revert` veya `git reset --hard <önceki-sha>` + push.
2. **Veri uyumluluğu:** Yok — uygulama durumsuz (server tarafında kalıcı veri/DB yok), downgrade veri kaybı riski taşımaz.
3. **Doğrulama:** Rollback sonrası `GET /health` → `200 {"status":"ok"}` + tarayıcıda 3 ekranlık akış (S1→S2→S3) manuel smoke.
4. **Dağıtım:** `deploy-image.yml` önceki SHA/`latest` tag'iyle yeniden build+push edilir; sunucuda `docker run` önceki image tag'iyle tekrar başlatılır (host_port aynı, nginx bloğu değişmez).

## Kalite kapısı raporu
- "Rollback prosedürü tanımlı" → ✅
- "Sürüm plana uygun" → ✅ (Faz 8 M1 milestone: v0.1.0, FR-1..FR-6 kapsandı)
