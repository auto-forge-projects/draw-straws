# 15 — Bakım: draw-straws

- Tarih: 2026-07-22 | Mod: AUTOPILOT
- Bu dosya ÜRÜNÜN teknik borcunu izler; fabrikanın eksikleri `AUTOFORGE-FEEDBACK.md`'ye.

## Bilinen sorunlar
Yok (Blocker/Critical=0, `docs/10-review/PR-1.md`). F1 (UI/DOM test boşluğu) Faz 11'de E2E ile kapatıldı (`tests/e2e/ui-flow.test.js`, 23/23 yeşil).

## Teknik borç (kalite kapısı: önceliklendirilmiş)
| # | Borç | Kaynak (DL/review bulgusu) | Öncelik (P1/P2/P3) | Not |
|---|------|---------------------------|--------------------|-----|
| TD-1 | Dockerfile `root` kullanıcı ile çalışıyor, `USER node` eklenmemiş | F2 (docs/10-review/PR-1.md) | P2 | Defense-in-depth; runtime davranışını değiştirmez, tek satır ekleme |
| TD-2 | Statik varlık yanıtlarında (`GET /`) güvenlik başlığı regresyon testi yok — yalnız `/health` test ediliyor | F3 (docs/10-review/PR-1.md) | P3 | Middleware zaten tüm route'lara uygulanıyor; testin eksikliği regresyon riskini büyütür |
| TD-3 | `shuffle.js` `createDraw` shuffle'dan önce gereksiz ilk atama yapıyor (zararsız, sonuç tarafsız) | F4 (docs/10-review/PR-1.md) | P3 | Sadeleştirme, davranış değişmez |
| TD-4 | CSP yalnız `default-src 'self'`; `base-uri`/`object-src`/`frame-ancestors` eksik | F5 (docs/10-review/PR-1.md) | P3 | XFO zaten framing'i kapatıyor; opsiyonel sertleştirme |
| TD-5 | Uzak sunucuda önceki imaj SHA'sı elle takip edilmezse rollback için doğru tag bulmak gecikebilir | DL-13-001 | P3 | İmaj etiketleme/temizlik politikası tanımlanmadı |
| TD-6 | Otomatik uptime/alerting altyapısı yok, yalnız manuel `/health` kontrolü | DL-14-001 | P3 | LITE ölçeğinde kabul edilen risk; ölçek büyürse P2'ye yükseltilebilir |

## Bağımlılık güncelleme planı
Tek runtime bağımlılık (`express`); `package-lock.json` sabitli. Dependabot/otomasyon LITE kapsamında kurulmadı — sürüm başı (her yeni faz-16 sonrası) `npm outdated` + `npm audit` elle çalıştırılır; kritik CVE çıkarsa ad-hoc patch release.

## Bakım ritmi
Sürüm başı: `npm audit`, TD listesi gözden geçir (P1 varsa önce o). Aylık ritim bu ölçekte gereksiz (solo/durgun trafik ürünü) — yalnız yeni ihtiyaç/geri besleme geldiğinde (↺ Yeni İhtiyaç fazı) tetiklenir.

## Kalite kapısı raporu
- "Teknik borç önceliklendirilmiş" → ✅ (6 borç, kaynak DL/review referanslı; 0 P1, 1 P2, 5 P3)
