# 06 — UI/UX: draw-straws

- Tarih: 2026-07-19 | Mod: AUTOPILOT | Profil: LITE
- Ürün tipi: web (tek sayfa, tek cihaz/elden ele)

## Yüzey sözleşmesi

Tek ekran, üç durum (aynı sayfada state geçişi, route yok):

| Ekran/durum | İçerik | Geçiş |
|---|---|---|
| S1 — Kurulum | Oyuncu sayısı input (2-20), "Çöpleri Karıştır" butonu (geçersiz girdide disabled + uyarı) | Geçerli N → S2 |
| S2 — Elden Ele Çekiliş | N kapalı çöp (numaralı), yalnız sıradaki tıklanabilir, "Sıra: Oyuncu X" göstergesi | Her tıkta bir çöp açılır; son çöp → S3 |
| S3 — Sonuç | Kısa çöpü çeken oyuncu vurgulu (renk+ikon+animasyon), `aria-live` duyuru metni, "Yeniden Çek" butonu | Yeniden Çek → S1 (N korunur, yeni karıştırma) |

## Ana akış — uçtan uca (kalite kapısı)

```
[S1] N=5 gir → "Çöpleri Karıştır"
[S2] "Sıra: Oyuncu 1" → çöp 1'e tıkla → "Uzun" açılır, sıra Oyuncu 2'ye geçer
     ... (tıklanamaz: henüz sırası gelmemiş çöpler; tekrar tık = no-op)
[S2] Oyuncu 5 (son) tıklar → "Kısa" açılır
[S3] "🎯 Kısa çöpü Oyuncu 5 çekti!" (görsel vurgu + aria-live: "Kısa çöpü 5. oyuncu çekti")
[S3] "Yeniden Çek" → [S2] N=5 ile yeni bağımsız karıştırma
```

## Çıktı/görsel şablonları

- Geçersiz oyuncu sayısı: input altında kırmızı satır içi uyarı — `"2 ile 20 arası bir sayı girin."`
- Sıra göstergesi: `"Sıra: Oyuncu {n}"` (aktif çöp üzerinde belirgin çerçeve/glow)
- Sonuç vurgusu: kısa çöpü çeken çöp kartı kırmızı/turuncu arka plan + 🎯 ikon + kısa "pop" animasyonu (≤300ms, `prefers-reduced-motion` saygılı — animasyonsuz fallback)
- `aria-live="polite"` bölge metni: `"Kısa çöpü {n}. oyuncu çekti."`
- Boş/başlangıç durumu: S1'de placeholder `"Kaç oyuncu? (2-20)"`

## Tasarım notları

- **Ton:** sade, oyunbaz ama gürültüsüz; emoji yalnız sonuç vurgusunda (🎯), kurulum ekranında yok.
- **Renk/kontrast:** metin/arka plan ≥4.5:1 (NFR-5); kısa-çöp vurgusu renk körlüğüne dayanıklı olsun diye yalnız renkle değil ikon+metinle de işaretlenir.
- **Erişilebilirlik:** tüm etkileşimler `Tab`/`Enter` ile ulaşılabilir; sıradaki çöp `autofocus` alır; buton `disabled` durumları `aria-disabled` ile eşleşir.
- **Responsive:** ≥360px mobil viewport'ta çöp kartları grid/wrap ile taşmadan sığar (NFR-6).
- **Boru hattı uyumu:** framework yok — tüm markup `public/index.html` + `style.css` + `game.js` (bkz. `docs/05-architecture.md` dosya yapısı).

## Kalite kapısı raporu
- "Ana kullanıcı akışları uçtan uca çizildi" → ✅ GEÇTİ — S1→S2→S3→(Yeniden Çek→S1) döngüsü, hata/uyarı durumu ve erişilebilirlik duyurusu dahil uçtan uca tanımlandı.
