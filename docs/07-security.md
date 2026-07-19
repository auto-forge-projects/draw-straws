# 07 — Güvenlik Tasarımı: draw-straws

- Tarih: 2026-07-19 | Mod: AUTOPILOT | Profil: LITE

Saldırı yüzeyi minimal: kullanıcı girdisi (oyuncu sayısı) SUNUCUYA GİTMEZ; tüm oyun mantığı istemcide çalışır. DB/auth/oturum/çerez/depolama YOK. Sunucu durumsuz: yalnız `express.static` + `GET /health`. Girdi işlenmediği için Injection/SQLi/kalıcı XSS için sunucu yüzeyi yoktur; ana risk istemci bütünlüğü (adil rastgelelik) + statik servis konfigürasyonudur.

## Varlıklar ve veri sınıflandırma
| Veri | Sınıf | Nerede duruyor | Koruma |
|------|-------|----------------|--------|
| Statik dosyalar (html/css/js) | Public | Container `public/` | Salt-okunur servis, HTTPS |
| Geçici oyun durumu (Draw obj) | Internal/kısa-ömürlü | Yalnız tarayıcı belleği | Sayfa yenilenince kaybolur; hiçbir yere yazılmaz (FR-6/NFR-3) |
| Health yanıtı `{"status":"ok"}` | Public | Bellekte üretilir | Hassas veri içermez |
| Kullanıcı/PII/hesap | YOK | — | Toplanmaz (kapsam dışı) |

## Threat model (STRIDE)
| Bileşen | Spoofing | Tampering | Repudiation | Info Disclosure | DoS | Elevation | Önlemler |
|---------|----------|-----------|-------------|-----------------|-----|-----------|----------|
| Express (static+/health) | Yok (auth yok, kimlik yok) | Düşük — salt-okunur | Yok (log gereksiz) | Düşük — hassas veri yok | Orta — proxy/rate önü nginx | Yok — tek proses | `--omit=dev`, güvenlik başlıkları, nginx TLS/rate |
| İstemci game.js | Yok | **Orta — devtools ile sonucu görebilir/değiştirebilir** | — | — | — | — | Yerel-cihaz oyunu; hile "kendini kandırma", kabul edilir risk |
| Rastgelelik (crypto) | — | **Yüksek etki — öngörülebilir/yanlı karıştırma** | — | — | — | — | `crypto.getRandomValues` + rejection sampling (FR-2) |
| Deploy (nginx/TLS) | — | Düşük | — | Düşük | Orta | Düşük | Wildcard TLS, HTTP→HTTPS, `127.0.0.1` bind |

## Auth / Authz stratejisi
Kimlik doğrulama YOK ve GEREKMEZ: anonim, tek cihazlı, durumsuz kamuya açık araç; korunacak kaynak/kullanıcı verisi yok. "Sıra" mantığı (yalnız sıradaki çöp tıklanabilir) bir güvenlik sınırı değil UX kuralıdır — istemci tarafında zorlanır, sunucu yetkilendirmesi devrede değildir.

## OWASP Top 10 (2021) değerlendirmesi (kalite kapısı: HER madde)
| # | Risk | Uygulanabilir mi | Önlem / Neden uygulanamaz |
|---|------|------------------|----------------------------|
| A01 | Broken Access Control | Hayır (N/A) | Korunan kaynak/rol/oturum yok; tüm içerik public. Dizin listelemesi kapalı tutulur |
| A02 | Cryptographic Failures | Kısmen — Evet | Hassas veri yok; ama (1) taşımada HTTPS zorunlu (NFR-4), (2) oyun rastgeleliği `crypto.getRandomValues` (CSPRNG) — `Math.random` yasak |
| A03 | Injection | Hayır (N/A) | Girdi sunucuya gitmez, DB/şablon/shell yok. İstemcide DOM üretimi `textContent`/güvenli API ile (dinamik `innerHTML` yasağı) |
| A04 | Insecure Design | Evet | Adalet tasarımın parçası: rejection sampling ile modulo-bias önleme (FR-2 ±%2); durum saklamama security-by-design (FR-6) |
| A05 | Security Misconfiguration | Evet | Güvenlik başlıkları eklenir (CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy); `x-powered-by` kapatılır; dizin listeleme kapalı; sadece `/health` ve statik expose |
| A06 | Vulnerable/Outdated Components | Evet | Tek runtime dep (express); `npm ci --omit=dev`; `npm audit` Critical/High=0 (Faz 9/12 CI kapısı); `node:alpine` güncel taban |
| A07 | Identification/Auth Failures | Hayır (N/A) | Kimlik/oturum/parola mekanizması yok |
| A08 | Software/Data Integrity Failures | Kısmen — Evet | CDN/harici script yok (kendi statik dosyaları); CSP harici script'i engeller; lockfile ile deterministik bağımlılık; postinstall script'li paket eklenmez |
| A09 | Logging/Monitoring Failures | Düşük | Hassas işlem/kimlik yok; `/health` smoke + deploy CI izlemesi yeter; PII loglanmaz |
| A10 | SSRF | Hayır (N/A) | Sunucu dışa hiçbir istek yapmaz (giden bağlantı yok) |

## AI tedarik zinciri & fabrika tehditleri
| Tehdit | Uygulanabilir? | Önlem / Neden uygulanamaz |
|--------|----------------|----------------------------|
| Prompt injection | Hayır | Üründe LLM/model yok |
| Repo/artefakt prompt poisoning | Düşük | Küçük repo, insan-denetimli; harici içerik alınmaz |
| Dependency confusion | Düşük | Yalnız public `express`; iç paket adı yok |
| Malicious package scripts | Evet | Tek dep; `npm ci` + lockfile; `npm audit`; postinstall'lı paket eklenmez |
| Shell komut güvenliği | Hayır | Kullanıcı içeriği kabuğa geçmez |
| Workspace/path & symlink escape | Düşük | `express.static` yalnız `public/`; path traversal express tarafından engellenir |
| Secret leakage | Düşük | Ürün sır kullanmaz; deploy sırları GitHub Secrets'ta (repoda düz sır yok) |
| Docker build izolasyonu | Evet | `node:alpine`, `--omit=dev`, root olmayan çalıştırma önerilir |
| Üretilen CI güvenliği | Evet | Workflow least-privilege; `npm audit` gate; sır enjeksiyonu yok |
| MCP/tool izinleri | Yok | Üründe tool/agent yüzeyi yok |

## Faz 9'a güvenlik gereksinimleri (Development checklist)
- [ ] SEC-1: Karıştırma `window.crypto.getRandomValues` KULLANIR; `Math.random` yasak (FR-2).
- [ ] SEC-2: Rastgele indeks üretiminde **rejection sampling** ile modulo-bias önlenir (aralık dışı örnekler atılır); düzgün dağılım.
- [ ] SEC-3: Fisher-Yates tarafsız uygulanır; 1000-sim dağılım testi 1/N ±%2 (FR-2 kabul kriteri).
- [ ] SEC-4: Express güvenlik başlıkları eklenir: `Content-Security-Policy: default-src 'self'` (inline yok, unsafe-* yok), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`; `app.disable('x-powered-by')`.
- [ ] SEC-5: DOM güncellemeleri `textContent`/güvenli DOM API ile; kullanıcı sayısı dinamik `innerHTML`'e ASLA verilmez (XSS-defense-in-depth).
- [ ] SEC-6: Sunucu durumsuz kalır; oyun/kullanıcı verisi için DB/dosya/çerez/localStorage/sessionStorage yazımı = 0 (FR-6/NFR-3).
- [ ] SEC-7: `express.static` yalnız `public/`'i servis eder; dizin listeleme kapalı; `/health` dışında route yok.
- [ ] SEC-8: `package.json` tek runtime dep (express); lockfile commit'lenir; `npm ci --omit=dev`; `npm audit` Critical/High=0 (Faz 12 CI gate).
- [ ] SEC-9: (Deploy/NFR-4) HTTP→HTTPS yönlendirme ve container `127.0.0.1:host_port` bind nginx katmanında doğrulanır.

## Kalite kapısı raporu
- "OWASP Top 10 değerlendirildi" → ✅ (A01–A10 tamamı ele alındı; N/A olanlar gerekçelendirildi)
- "AI/tedarik zinciri tehditleri değerlendirildi" → ✅ (10 madde ele alındı)
- "Hassas veri sınıflandırması eksiksiz" → ✅ (PII/hesap yok; geçici istemci durumu ve public statik varlıklar sınıflandırıldı)
