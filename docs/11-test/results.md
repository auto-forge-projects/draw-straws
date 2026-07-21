# 11 — Sonuç Raporu: draw-straws

- Tarih: 2026-07-21 | `npm test` bağımsız çalıştırıldı (workspace kökünde)

## Sonuç raporu

| Metrik | Değer |
|--------|-------|
| Toplam test | 23 |
| Geçti / Kaldı | 23 / 0 |
| Coverage (line / branch / funcs) | 98.92% / 97.10% / 97.92% (`shuffle.js`, `server.js`, birim+E2E dosyaları — `node --test --experimental-test-coverage`) |

`npm test` çıktısı (node:test özeti): `# pass 23`, `# fail 0`.

- Not: `public/game.js` node coverage aracında ayrı satır olarak görünmez çünkü `require()` ile değil, E2E testinde gerçek `<script>` enjeksiyonuyla jsdom içinde çalıştırılıyor (Node'un yerleşik coverage'ı yalnız `require`'lanan modülleri izler); işlevsel kapsam FR-1/3/4 E2E senaryolarıyla doğrulandı (bkz. test-plan.md).

## Başarısızlık analizi (koşum kesintisi sırasında bulunan ve düzeltilen 2 sorun)

Bu faz bir önceki koşumda `tests/e2e/ui-flow.test.js` yazılmış ama tamamlanmadan kesilmişti (ORPHANED_RUN). Kaldığı yerden devam edilirken dosya ilk kez çalıştırıldığında 8/22 test kalıyordu — kök neden **test harness hatasıydı, ürün kodunda değil**:

1. **`loadPage()` script yükleme hatası:** `dom.window.eval(source)` ile `shuffle.js`/`game.js` yüklemesi kullanılmıştı; her iki dosya da `'use strict'` taşıdığı için ECMA-262'ye göre *indirect eval*'de üst düzey fonksiyon bildirimleri (`createDraw`, `randomInt`, `fisherYatesShuffle`) eval'e özel gölge kapsamda kalıp dışarı sızmıyor — `game.js` çalışırken `ReferenceError: createDraw is not defined` fırlatıyordu. Gerçek `<script>` etiketleri bu izolasyona tabi değildir (tarayıcıda sorun yoktur). **Düzeltme:** `loadPage()` artık `<script src>` etiketlerini kaldırıp yerine gerçek `<script>` elemanları (`textContent` + `runScripts:'dangerously'`) enjekte ediyor — 6 test bunun sonucunda düzeldi.
2. **Yanlış test varsayımı ("abc" girişi):** `<input type="number">` alanına programatik olarak harf ataması yapılırsa tarayıcı/jsdom değeri otomatik boşa (`""`) sanitize eder — kullanıcı gerçekte klavyeyle harf giremez. Test, "abc"nin ham metin olarak kalacağını ve uyarı göstereceğini varsayıyordu; gerçek davranış boş alanla aynıdır (uyarı yok). **Düzeltme:** "abc" senaryosu ayrı bir teste taşındı ve gerçek sanitize-davranışını doğrulayacak şekilde düzeltildi (ürün kodu DEĞİŞMEDİ — davranış zaten doğruydu).

Her iki düzeltme de yalnız `tests/e2e/ui-flow.test.js` içinde yapıldı; Faz 9 çıktısı (`src/`, `public/`) değişmedi, Faz 9/10'a geri besleme gerekmedi.

## Kalite kapısı raporu
- "Kritik senaryolar %100 geçti" → ✅ (23/23 pass, Kaldı: 0)
