# enderbas.com

Engin Deniz Erbaş’ın kişisel sitesi. Kaynak dosyalar bu depoda; `npm run build` statik siteyi `_site/` dizinine üretir. Eski yazıların kaynak HTML dosyaları ve URL’leri korunur; yayınlanan sayfalarda güncel menü ve görünüm kullanılır.

Türkçe sayfalar kök adreslerde, İngilizce sayfalar `/en/` altında üretilir. Dil seçici aynı içeriğin diğer dildeki adresine gider. Eski yazıların metinleri yayımlandıkları özgün dilde kalır; çevrelerindeki site arayüzü iki dilde de sunulur.

Sabit sayfa metinleri `scripts/build.mjs` içinde, İngilizce karşılıkları `scripts/localize.mjs` içinde tutulur. Sabit metin değişirse iki dosya birlikte güncellenmelidir.

## Yerel önizleme

```sh
npm run build
python3 -m http.server 4173 --directory _site
```

Ardından `http://localhost:4173` adresini açın. Node.js 22 yeterlidir; ek paket kurulumu gerekmez.

## Yeni not ekleme

`notes/` içine `YYYY-MM-DD-kisa-baslik.md` biçiminde dosya ekleyin:

```md
---
title: Kısa başlık
date: 2026-11-06
summary: Bir cümlelik özet.
---

İlk paragraf.

## Ara başlık

Devamı.
```

Notlar tarih sırasıyla ana sayfadaki kısa listede ve yazı arşivinde görünür. RSS akışı `/feed.xml` adresinde üretilir.

## Yayınlama

`.github/workflows/pages.yml` GitHub Pages için `_site/` klasörünü derleyip yayınlar. GitHub depo ayarlarında Pages kaynağı **GitHub Actions** olarak seçilmelidir. `CNAME` dosyası `www.enderbas.com` alan adını korur. Vercel kullanılırsa `vercel.json` aynı çıktıyı yayınlar.

Bu yenilemenin görsel ve içerik kontrolü tamamlanmadan canlı siteye gönderilmemesi için çalışma `codex/site-refresh` dalında tutulur.
