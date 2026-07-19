# 01-02 — Değer & Fizibilite (LITE birleşik faz): draw-straws

> LITE profil: yarım sayfa hedefi, paydaş analizi yok.

- Tarih: 2026-07-19 | Mod: AUTOPILOT | Profil: LITE

## Değer önerisi

Bir grup için "kim yapacak / kim başlayacak" gibi kararları fiziksel çöp/kibrit bulmaya gerek kalmadan, tek ekrandan sırayla çekilen dijital bir "kısa çöp çekme" aracıyla adil ve rastgele verir — coinflip/dice-game ile aynı ölçekte, kurulum/hesap istemeyen, saniyeler içinde açılıp kullanılan bir demo/ürün daha.

## KPI'lar (kalite kapısı: en az 3, ölçülebilir)

1. Çekme akışı gecikmesi: son oyuncunun çöpünü açması → en kısa çöpü çekenin görsel vurgusu ≤ 1 sn (idea Başarı Kriteri 1 ile birebir).
2. Rastgelelik adaleti: 1000 simülasyonluk otomatik testte her oyuncunun kısa çöpü çekme olasılığı yaklaşık 1/N (±%2) (idea Başarı Kriteri 2 ile birebir).
3. Dağıtım hazırlığı süresi: `docker build` → yerel `docker run` ile çalışan container elde etme süresi ≤ 15 dakika (coinflip/dice-game emsali).
4. Sayfa boyutu/yüklenme: ana sayfa ilk yüklemesi (HTML+CSS+JS toplam) ≤ 200 KB (stateless/statik servis hedefiyle tutarlı hafiflik ölçütü).

## Fizibilite

- Teknik: Node.js/Express statik servis + tarayıcı tarafı `Math.random()` tabanlı adil karıştırma (Fisher-Yates) ve SVG/CSS çöp görselleştirme — coinflip/dice-game'de kanıtlanmış, düşük riskli, bilinen bir kalıp; sunucu tarafında durum/DB yok. ✅
- Ekonomik: Altyapı maliyeti 0 (statik dosyalar + hafif Express sunucusu, dış servis/DB yok); geliştirme tahmini ~1 gün (dice-game ile benzer ölçek, ek olarak sıra/oyuncu-sayısı girişi). ✅
- Zaman: v1 tek milestone'da (≤ 2-3 gün) teslim edilebilir; mevcut SSH-push deploy akışı ve Docker paketleme coinflip/dice-game'den doğrudan uyarlanabilir, yeni altyapı kurulumu gerekmez. ✅

## GO / NO-GO önerisi: **GO**

Gerekçe: Teknik/ekonomik/zaman fizibilitesinin üçü de pozitif; kapsam coinflip/dice-game emsaliyle büyük ölçüde örtüştüğü için mimari/deploy riski asgari düzeyde. KPI'lar ölçülebilir ve büyük çoğunluğu Faz 9/11'de otomatik test ile doğrulanabilir niteliktedir (özellikle KPI-2 adalet testi, Fisher-Yates karıştırmanın istatistiksel doğrulaması). idea'daki üç açık soru (tek cihaz/çok cihaz, maksimum oyuncu sayısı, tek/çoklu kısa çöp) ürünün temel değer önerisini veya fizibilitesini değiştirmiyor — mevcut varsayımlar (tek cihaz elden ele, 2-20 oyuncu, tam 1 kısa çöp) altında da fizibilite pozitif; bunlar Faz 3 (Requirement) ve Faz 6 (UI/UX)'da netleştirilecek kapsam/UI detayı niteliğindedir. Geri dönüş maliyeti düşük (henüz kod yazılmadı), bu nedenle daha fazla kapsam netleştirmesi beklemeden GO ile ilerlemek zaman/kota bütçesine (LITE, düşük efor) uygundur.

## Kalite kapısı raporu

- "En az 3 ölçülebilir KPI" → ✅ GEÇTİ (4 KPI tanımlandı, her biri hedef değer + ölçüm yöntemiyle; KPI 1-2 idea'daki başarı kriterleriyle birebir izlenebilir).
- "GO/NO-GO kararı gerekçeli" → ✅ GEÇTİ (GO; üç fizibilite ekseni pozitif, gerekçe ve açık soruların sonraki fazlara devri yukarıda açıkça yazılı).

## Açık sorular (idea'dan devralındı, bu fazda kapatılmadı)

- Tek cihazdan sırayla mı ("elden ele") çekilecek, yoksa çok-cihaz/QR modu mu? → v1 kapsamında tek cihaz varsayımıyla GO verildi; Faz 3'te teyit edilecek.
- Maksimum oyuncu sayısı (varsayılan 20) yeterli mi? → Faz 3'te netleştirilecek.
- "Kısa çöp" her zaman tam 1 mi olmalı? → v1 kapsamında tam 1 varsayımıyla GO verildi; çoklu-kaybeden modu kapsam dışı bırakıldı (idea'da netleşti).

Bu sorular GO/NO-GO kararını veya KPI'ları etkilemiyor (hepsi mevcut varsayımlar altında da fizibilite pozitif); bu nedenle fazın kapanması için beklenmelerine gerek görülmedi.
