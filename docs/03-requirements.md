# 03 — Requirement Analizi: draw-straws

- Tarih: 2026-07-19 | Mod: AUTOPILOT | Profil: LITE

## Bu fazda kapatılan açık sorular (bkz. `docs/00-idea.md` ve `docs/01-02-value-feasibility.md`)

Faz 0/1-2'den devralınan 3 açık soru, aşağıdaki FR'lerin içine **varsayım olarak** kapatılmıştır (gerekçe ve alternatifler için bkz. `decisions/DL-03-001.md`). AUTOPILOT modda üretildi; kullanıcı sonradan denetler ve itiraz ederse revize edilecektir:

1. **Tek cihaz mı, çok cihaz/QR mı?** → Tek cihaz, sırayla "elden ele" (FR-3). idea'daki v1 varsayımıyla tutarlı; çok-cihaz senkron mod v1 kapsamı dışı.
2. **Maksimum oyuncu sayısı ne olmalı?** → 2-20 arası (FR-1). idea'daki varsayılan aralık requirement'a sabitlendi.
3. **Kısa çöp her zaman tam 1 mi olmalı?** → Evet, her koşumda tam 1 kısa çöp (FR-4). Çoklu-kaybeden modu v1 kapsamı dışı (idea'da zaten netleşmişti).

## Fonksiyonel gereksinimler

### FR-1: Oyuncu Sayısı Girişi
- **User story:** Bir grup üyesi olarak, çekilişten önce oyuncu sayısını girmek istiyorum, böylece herkese tam olarak bir çöp ayrılsın.
- **Kabul kriterleri (zorunlu):**
  - Given ana sayfa, when kullanıcı oyuncu sayısı alanına 2-20 arası bir tam sayı girer, then "Çöpleri Karıştır" eylemi etkinleşir.
  - Given oyuncu sayısı alanı, when kullanıcı 1'den küçük, 20'den büyük, ondalık veya sayısal olmayan bir değer girer, then eylem devre dışı kalır ve kullanıcıya geçerli aralığı belirten bir uyarı gösterilir.
  - Given geçerli bir oyuncu sayısı girildi, when "Çöpleri Karıştır"a tıklanır, then tam olarak girilen sayı kadar çöp (biri kısa, kalanı uzun) üretilir.
- **Öncelik:** Must

### FR-2: Adil Karıştırma (Fisher-Yates)
- **User story:** Grup üyesi olarak, çöp sırasının hileli olmadığından emin olmak istiyorum, böylece sonuca güvenebileyim.
- **Kabul kriterleri (zorunlu):**
  - Given N oyunculuk bir çekiliş, when çöpler karıştırılır, then karıştırma algoritması Fisher-Yates (veya kanıtlanmış eşdeğer düzgün-dağılımlı bir algoritma) ile yapılır; `Math.random()` doğrudan sırayla `sort()`'a verilmez (yanlı sonuç riski).
  - Given 1000 simülasyonluk otomatik bir test örneklemi çalıştırılır, when her oyuncu pozisyonunun kısa çöpü alma sıklığı ölçülür, then her pozisyon yaklaşık 1/N (±%2) sıklıkla kısa çöpü alır.
  - Given karıştırma mantığı, when kaynak koda bakılır, then rastgelelik istemci tarafında üretilir; sunucu tarafında sonucu etkileyen/önceden belirleyen hiçbir kod bulunmaz.
- **Öncelik:** Must

### FR-3: Sıralı ("Elden Ele") Çekme Akışı
- **User story:** Bir oyuncu olarak, sırası geldiğinde tek bir tıkla kendi çöpümü açığa çıkarmak istiyorum, böylece diğer oyuncuların çöpünü önceden görmeden adil şekilde katılayım.
- **Kabul kriterleri (zorunlu):**
  - Given çöpler karıştırıldı, when ekran gösterilir, then N adet kapalı/gizli çöp sırayla (1. oyuncudan N. oyuncuya) numaralandırılmış şekilde görünür ve yalnızca SIRADAKİ oyuncunun çöpü tıklanabilir durumdadır.
  - Given sıradaki oyuncu kendi çöpüne tıklar, when çöp açığa çıkar, then o çöpün uzunluğu/durumu (kısa/uzun) anında görünür hale gelir ve sıra bir sonraki oyuncuya geçer; henüz sırası gelmemiş çöpler tıklanamaz.
  - Given bir oyuncu zaten açılmış bir çöpe tekrar tıklar, when tıklama gerçekleşir, then hiçbir durum değişikliği olmaz (idempotent, hatasız).
- **Öncelik:** Must

### FR-4: Kısa Çöp Vurgusu ve Tekli Sonuç
- **User story:** Grup üyesi olarak, son çöp açıldığında kimin kısa çöpü çektiğini anında ve net görmek istiyorum, böylece sonuç tartışmasız olsun.
- **Kabul kriterleri (zorunlu):**
  - Given her koşumda tam olarak 1 kısa çöp üretilir (bkz. FR-2), when tüm N çöp sırayla açılır, then son çöp açıldığı anda kısa çöpü çeken oyuncu(nun numarası/etiketi) ≤ 1 saniye içinde görsel olarak (renk/vurgu/animasyon) belirginleştirilir.
  - Given sonuç belirginleştirildi, when ekran okuyucu kullanılır, then sonuç metinsel/`aria-live` bölgesiyle de duyurulur (örn. "Kısa çöpü 3. oyuncu çekti").
  - Given sonuç gösterildi, when kullanıcı "Yeniden Çek" eylemine tıklar, then aynı oyuncu sayısıyla yeni, bağımsız bir karıştırma+çekiliş başlar (önceki sonuçtan bağımsız).
- **Öncelik:** Must

### FR-5: Statik Dosya Servisi ve Health Check
- **User story:** Operatör (deploy eden) olarak, container'ın sağlıklı çalışıp çalışmadığını hızlıca doğrulamak istiyorum, böylece coinflip/dice-game ile aynı SSH-push deploy akışını güvenle kullanabileyim.
- **Kabul kriterleri (zorunlu):**
  - Given container `docker run` ile başlatılır, when `GET /health` isteği atılır, then `200 OK` ve `{"status":"ok"}` (veya eşdeğer basit JSON) döner.
  - Given tarayıcı ana sayfayı ister, when Express sunucusuna `GET /` isteği gelir, then statik HTML/CSS/JS dosyaları servis edilir; sunucu tarafında karıştırma/rastgelelik hesaplaması YAPILMAZ (tüm oyun mantığı istemcide çalışır — bkz. FR-2).
- **Öncelik:** Must

### FR-6: Kapsam Sınırı — Tek Cihaz, Tek Kısa Çöp, Durum Yok
- **User story:** Grup üyesi olarak, hesap/kurulum veya birden fazla cihaz koordinasyonu olmadan hızlıca ortak ekrandan çekiliş yapmak istiyorum, böylece deneyim basit ve hızlı kalsın.
- **Kabul kriterleri (zorunlu):**
  - Given ana sayfa yüklenir, when arayüz incelenir, then tek cihazdan/tek ekrandan sırayla çekim dışında (ör. oda kodu, çok-cihaz senkron katılım, kullanıcı hesabı, geçmiş/istatistik kaydı, çoklu kısa çöp seçimi) hiçbir kontrol arayüzde YER ALMAZ.
  - Given kullanıcı sayfayı yeniler, when sayfa yeniden yüklenir, then önceki çekilişin sonucu/geçmişi hiçbir yerde (sunucu, `localStorage`, `sessionStorage`, çerez) saklanmamıştır.
- **Öncelik:** Must

## Fonksiyonel olmayan gereksinimler (kalite kapısı: ölçülebilir)

| ID | Kategori | Gereksinim | Ölçüt / Hedef |
|----|----------|------------|----------------|
| NFR-1 | Performans | Son çöp açılışından sonuç vurgusuna kadar geçen süre kısa olmalı | ≤ 1 sn, tarayıcı içi zaman ölçümüyle doğrulanır |
| NFR-2 | Performans / Boyut | Ana sayfanın ilk yüklemesi hafif olmalı | Toplam HTML+CSS+JS boyutu ≤ 200 KB (sıkıştırılmamış) |
| NFR-3 | Güvenlik | Sunucu, istemciden gelen hiçbir veriyi kalıcı olarak saklamamalı; saldırı yüzeyi asgaride tutulmalı | Sunucu tarafında oyun/kullanıcı verisi için DB/dosya yazımı = 0; girdi alanı sunucuya gitmediğinden (yalnızca statik GET + health), XSS/SQLi saldırı yüzeyi yoktur — statik kod taramasında (ör. `npm audit`) Critical/High bulgu = 0 |
| NFR-4 | Güvenlik | Trafik şifreli taşınmalı | Prod ortamda tüm trafik HTTPS üzerinden servis edilir (mevcut wildcard TLS deploy altyapısı, `https://draw-straws.apps.sametemek.com`); HTTP isteği HTTPS'e yönlendirilir |
| NFR-5 | Erişilebilirlik | Çekiliş klavye ile tam kullanılabilir ve ekran okuyucu uyumlu olmalı | Tüm interaktif öğeler yalnızca `Tab`/`Enter` ile ulaşılabilir (%100 klavye erişilebilirliği); sonuç `aria-live` bölgesiyle duyurulur; metin/arka plan kontrast oranı ≥ 4,5:1 (WCAG 2.1 AA) |
| NFR-6 | Uyumluluk | Güncel tarayıcılarda çalışmalı | Chrome, Firefox, Safari, Edge'in her birinin son 2 major sürümünde ve ≥360px genişlikteki mobil viewport'ta hatasız çalışır |
| NFR-7 | Dağıtılabilirlik | Docker imajı hafif ve hızlı üretilebilir olmalı | Docker imaj boyutu ≤ 150 MB; `docker build` → yerelde çalışan `docker run` container'ı elde etme süresi ≤ 15 dakika |
| NFR-8 | Güvenilirlik | Health check her zaman doğru durum bildirmeli | CI/smoke testinde `GET /health` başarı oranı = %100 (200 OK) |

## İzlenebilirlik

| FR | Karşıladığı KPI / iş hedefi |
|----|------------------------------|
| FR-1 (Oyuncu sayısı girişi) | idea "Kısıtlar" (2-20 oyuncu) · FR-2/FR-3'ün ön koşulu |
| FR-2 (Adil karıştırma) | KPI-2 (1000 çekilişte 1/N ±%2 dağılım) · idea Başarı Kriteri 2 |
| FR-3 (Sıralı elden-ele çekme) | idea Çözüm fikri ("her oyuncu sırayla kendi çöpünü açığa çıkarır") · Değer önerisi |
| FR-4 (Kısa çöp vurgusu) | KPI-1 (gecikme ≤ 1 sn) · idea Başarı Kriteri 1 |
| FR-5 (Statik servis/health) | KPI-3 (dağıtım hazırlığı süresi ≤ 15 dk) · idea Başarı Kriteri 3 |
| FR-6 (Tek cihaz/tek kısa çöp/durum yok) | idea "Kapsam dışı (v1)" · Değer önerisi (basitlik/hız) |

## Kalite kapısı raporu
- "Her FR'nin kabul kriteri var" → ✅ GEÇTİ — FR-1..FR-6'nın her biri en az 2 adet Given/When/Then formatında somut kabul kriteri içeriyor.
- "NFR'ler ölçülebilir" → ✅ GEÇTİ — NFR-1..NFR-8'in her biri somut bir sayı/eşik içeriyor (≤1sn, ≤200KB, ≥4,5:1 kontrast, ≤150MB imaj, ≤15dk build, %100 klavye erişilebilirliği, %100 health check başarısı, 0 Critical/High bulgu).
