# 00 — Rafine Proje Brief'i: draw-straws

> **Faz 0b çıktısı.** Ham fikir, kullanılabilen en iyi modelle yapılandırılmış brief'e dönüştürülür.
> Bu brief kullanıcıya HAM FİKİRLE YAN YANA sunulur; **onaylanmadan Faz 0 (00-idea.md) üretilmez.**
> Onay sonrası bu brief, Faz 0 ve sonraki tüm fazların girdisidir.

- Tarih: 2026-07-19 | Rafine eden model: Claude Sonnet 5 (oturumdaki en iyi mevcut model) | Onay durumu: **Onaylandı** (dashboard, 2026-07-19)

## Ham fikir (kullanıcının girdisi — değiştirilmez)
> kısa çöp uzun çöp oyunu yap

## Rafine problem (tek cümle)
Bir grubun ("kim yapacak / kim başlayacak / kim ödeyecek" gibi) aralarından adil ve rastgele biri seçmesi için fiziksel çöp/kibrit gerektirmeyen basit, dijital bir "çöp çekme" aracı yok.

## Hedef kitle
Arkadaş grubu, aile veya iş arkadaşları arasında bir kararı adil rastgelelikle vermek isteyen; kurulum/hesap istemeyen, tek ekrandan sırayla kullanılabilen basit bir web aracı arayan kullanıcılar.

## Kısıtlar & varsayımlar (AF-001 kapanışı)
- Platform/runtime: Web (tarayıcı); coinflip/dice-game paternine benzer küçük Node/Express statik servis + Docker imajı, SSH-push deploy akışına uyumlu.
- Çevrimiçi/çevrimdışı, veri konumu: Tamamen client-side mantık; sunucu tarafında kalıcı veri/DB yok (stateless), hesap yok.
- Zaman/kota bütçesi: Küçük kapsam, LITE profil, düşük efor — coinflip/dice-game ile aynı ölçek.
- Varsayımlar (rafinasyonda yapıldı — kullanıcı düzeltebilir):
  - **Tek cihaz, sırayla çekme** ("elden ele" / pas-the-phone) modeli varsayıldı — eşzamanlı çok-cihaz/oda modu v1 kapsamı dışında.
  - Oyuncu sayısı kullanıcı tarafından girilir (2-20 arası varsayılan aralık); tam olarak **1 kısa çöp** (seçilen/kaybeden) olacak şekilde rastgele uzunlukta çöpler üretilir.
  - Her oyuncu sırayla ekrana tıklayarak kendi çöpünü çeker (reveal); son çöp açılınca en kısa çöpü çeken anında vurgulanır.
  - Görsel: coinflip/dice-game'teki gibi minimalist SVG/CSS "çöp" çizgileri (farklı uzunlukta), kısa animasyon.

## Başarı kriterleri (ölçülebilir)
1. Kullanıcı oyuncu sayısını girip "çöpleri karıştır"a bastıktan sonra her oyuncu sırayla tıklayarak kendi çöpünü açığa çıkarabilir; son çöp açıldığında en kısa çöpü çeken 1 saniye içinde görsel olarak vurgulanır.
2. 1000 simülasyonluk otomatik testte her oyuncunun kısa çöpü çekme olasılığı yaklaşık 1/N (±%2) olur (adil rastgelelik doğrulaması).
3. Ürün Docker imajına paketlenir, yerelde `docker run` ile çalışır ve mevcut SSH-push deploy akışıyla `https://draw-straws.apps.sametemek.com` adresine deploy edilebilir.

## Kapsam sınırı (v1'de yapılmayacaklar)
- Çoklu oda / gerçek zamanlı çok-cihaz senkron çekme (her oyuncu kendi telefonundan katılma).
- Kullanıcı hesabı, geçmiş/istatistik kaydı.
- Birden fazla "kısa çöp" (çoklu kaybeden/kazanan) modu — v1 yalnız 1 kısa çöp.

## Açık sorular (kullanıcının netleştirmesi önerilen)
- [ ] Tek cihazdan sırayla mı ("elden ele") çekilecek, yoksa her oyuncu kendi telefonundan link/QR ile mi katılacak (gerçek zamanlı çok-cihaz)?
- [ ] Maksimum oyuncu sayısı ne olmalı (varsayılan 20 yeterli mi)?
- [ ] "Kısa çöp" her zaman tam 1 mi olmalı, yoksa kullanıcı kaç kişinin "kaybedeceğini" (ör. 2 kısa çöp) seçebilsin mi?

## Önerilen profil ve ilk mod
- Profil: **LITE** · Gerekçe: Solo, küçük kapsamlı, tek sayfalık statik/stateless bir oyun — coinflip/dice-game ile aynı ölçek; Faz 1+2 birleşik ilerler.

---
## Onay kaydı
- 2026-07-19 — Onaylandı (dashboard)
