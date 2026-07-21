# 11 — Test Planı: draw-straws

- Tarih: 2026-07-21 | Mod: AUTOPILOT | İnceleyen: test-engineer (inline, ⟲)

## Strateji
- Birim (Faz 9, `tests/shuffle.test.js` + `tests/health.test.js`): saf algoritma (FR-2) + sunucu (FR-5).
- E2E (`tests/e2e/ui-flow.test.js`, jsdom + gerçek `<script>` enjeksiyonu): S1→S2→S3 kullanıcı akışı (FR-1, FR-3, FR-4, FR-6). Faz 10 review'un F1 bulgusunu (game.js UI mantığı test edilmiyor) kapatır.

## Kritik senaryolar

| Senaryo | FR/NFR/SEC | Test | Katman |
|---------|-----------|------|--------|
| Geçersiz sayısal girdi (0,1,21,2.5,-3) → buton kapalı + uyarı | FR-1 | ui-flow.test.js FR-1 | E2E |
| `type="number"` harf girişi → tarayıcı sanitizasyonu (boş değer), uyarı yok | FR-1 | ui-flow.test.js FR-1 | E2E |
| Geçerli girdi (2,5,20) → buton açılır | FR-1 | ui-flow.test.js FR-1 | E2E |
| Karıştırma sonrası tam N çöp, 1 kısa | FR-1, FR-4 | ui-flow.test.js + shuffle.test.js | E2E + Birim |
| Fisher-Yates adil dağılım (±%2, 20k örneklem) | FR-2, SEC-1/2/3 | shuffle.test.js | Birim |
| Sıradaki oyuncu dışında tıklama no-op | FR-3 | ui-flow.test.js FR-3 | E2E |
| Açık çöpe tekrar tıklama idempotent | FR-3 | ui-flow.test.js FR-3 | E2E |
| Son çöp açılınca sonuç + aria-live duyurusu | FR-4 | ui-flow.test.js FR-4 | E2E |
| "Yeniden Çek" bağımsız yeni tur başlatır | FR-4 | ui-flow.test.js FR-4 | E2E |
| Kalıcı durum yok (localStorage/sessionStorage/cookie) | FR-6 | ui-flow.test.js FR-6 | E2E |
| Sunucu tarafında oyun/rastgelelik mantığı yok | FR-6, NFR-3 | ui-flow.test.js FR-6 | E2E |
| `/health` 200 + güvenlik başlıkları | FR-5, SEC-4 | health.test.js | Birim |
| Klavye erişilebilirliği (native button/input) | NFR-5 | ui-flow.test.js NFR-5 | E2E |

- Kapsam dışı (bilinçli): Çoklu-tarayıcı/gerçek-cihaz matrisi (NFR-6), görsel kontrast ölçümü (NFR-5) ve Docker imaj boyutu/build süresi (NFR-7) — otomatik E2E kapsamı dışında, manuel/CI doğrulaması Faz 12/14'e bırakıldı (DL-11-001).

## Kalite kapısı raporu
- "Kritik senaryolar %100 geçti" → ✅ (bkz. `results.md`)
