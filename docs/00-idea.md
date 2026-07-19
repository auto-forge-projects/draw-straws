# 00 — Fikir (Intake): draw-straws

- Tarih: 2026-07-19 | Mod: AUTOPILOT | Profil: LITE

## Problem (tek cümle)
Bir grubun ("kim yapacak / kim başlayacak / kim ödeyecek" gibi) aralarından adil ve rastgele biri seçmesi için fiziksel çöp/kibrit gerektirmeyen basit, dijital bir "çöp çekme" aracı yok.

## Çözüm fikri
Tarayıcıda çalışan, istemci-taraflı (sunucu/backend gerekmeyen) bir "kısa çöp çekme" oyunu: kullanıcı oyuncu sayısını girer, çöpler karıştırılır, her oyuncu sırayla ("elden ele") ekrana tıklayarak kendi çöpünü açığa çıkarır; son çöp açıldığında en kısa çöpü çeken anında görsel olarak vurgulanır.

## Hedef kitle
Arkadaş grubu, aile veya iş arkadaşları arasında bir kararı adil rastgelelikle vermek isteyen; kurulum/hesap istemeyen, tek ekrandan sırayla kullanılabilen basit bir web aracı arayan kullanıcılar.

## Kısıtlar & varsayımlar (rafine brief'ten aktarıldı)
- Platform/runtime: Web (tarayıcı); coinflip/dice-game paternine benzer küçük Node/Express statik servis + Docker imajı, SSH-push deploy akışına uyumlu.
- Çevrimiçi/çevrimdışı: Tamamen client-side mantık; sunucu tarafında kalıcı veri/DB yok (stateless), hesap yok.
- Zaman/kota bütçesi: Küçük kapsam, LITE profil, düşük efor — coinflip/dice-game ile aynı ölçek.
- Varsayımlar: Tek cihaz, sırayla çekme ("elden ele") modeli — eşzamanlı çok-cihaz/oda modu v1 kapsamı dışında. Oyuncu sayısı kullanıcı tarafından girilir (2-20 arası); tam olarak 1 kısa çöp (kaybeden/seçilen) olacak şekilde rastgele uzunlukta çöpler üretilir. Görsel: minimalist SVG/CSS çöp çizgileri, kısa animasyon.

## Başarı kriterleri
1. Kullanıcı oyuncu sayısını girip "çöpleri karıştır"a bastıktan sonra her oyuncu sırayla tıklayarak kendi çöpünü açığa çıkarabilir; son çöp açıldığında en kısa çöpü çeken 1 saniye içinde görsel olarak vurgulanır.
2. 1000 simülasyonluk otomatik testte her oyuncunun kısa çöpü çekme olasılığı yaklaşık 1/N (±%2) olur (adil rastgelelik doğrulaması).
3. Ürün Docker imajına paketlenir, yerelde `docker run` ile çalışır ve mevcut SSH-push deploy akışıyla `https://draw-straws.apps.sametemek.com` adresine deploy edilebilir.

## Kapsam dışı (v1)
- Çoklu oda / gerçek zamanlı çok-cihaz senkron çekme (her oyuncu kendi telefonundan katılma).
- Kullanıcı hesabı, geçmiş/istatistik kaydı.
- Birden fazla "kısa çöp" (çoklu kaybeden/kazanan) modu — v1 yalnız 1 kısa çöp.

## Açık sorular (rafine brief'ten devralındı, henüz netleşmedi)
- Tek cihazdan sırayla mı ("elden ele") çekilecek, yoksa her oyuncu kendi telefonundan link/QR ile mi katılacak?
- Maksimum oyuncu sayısı ne olmalı (varsayılan 20 yeterli mi)?
- "Kısa çöp" her zaman tam 1 mi olmalı, yoksa kullanıcı kaç kişinin kaybedeceğini seçebilsin mi?

## Önerilen profil
- **LITE** — Solo, küçük kapsamlı, tek sayfalık statik/stateless bir oyun. Faz 1+2 birleşik ilerler (`docs/01-02-value-feasibility.md`).

## Kalite kapısı raporu
- "Problem tek cümlede ifade edilebiliyor" → ✅ GEÇTİ (yukarıdaki "Problem (tek cümle)" bölümü, rafine brief'in "Rafine problem" bölümünden birebir aktarılmıştır; tek cümle, çelişkisiz).
