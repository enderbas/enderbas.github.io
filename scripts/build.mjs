import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, '_site');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'site.config.json'), 'utf8'));
const styleVersion = createHash('sha256').update(fs.readFileSync(path.join(root, 'site/style.css'))).digest('hex').slice(0,8);
const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const unescapeTitle = s => s.replace(/&(?:amp|quot|lt|gt|#39);/g, entity => ({'&amp;':'&','&quot;':'"','&lt;':'<','&gt;':'>','&#39;':"'"}[entity]));
const slug = s => s.toLocaleLowerCase('tr').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const copy = (src, dest) => { fs.mkdirSync(path.dirname(dest), {recursive:true}); fs.cpSync(src, dest, {recursive:true}); };
const write = (relative, body) => { const target = path.join(out, relative); fs.mkdirSync(path.dirname(target), {recursive:true}); fs.writeFileSync(target, body); };

fs.rmSync(out, {recursive:true, force:true});
for (const entry of fs.readdirSync(root, {withFileTypes:true})) {
  if (['.git','.github','_site','scripts','notes','node_modules','package.json','vercel.json','site.config.json','README.md'].includes(entry.name)) continue;
  copy(path.join(root, entry.name), path.join(out, entry.name));
}
write('CNAME', 'www.enderbas.com\n');
write('.nojekyll', '');

const legacy = [];
function scan(directory) {
  for (const entry of fs.readdirSync(directory, {withFileTypes:true})) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory() && full !== out && entry.name !== '.git') scan(full);
    else if (/\/\d{4}\/\d{2}\/\d{2}\/[^/]+\.html$/.test(full)) {
      const raw = fs.readFileSync(full, 'utf8');
      const title = raw.match(/<meta property="og:title" content="([^"]+)"/i)?.[1] || raw.match(/<title>([^<]+)/i)?.[1] || entry.name;
      const date = full.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
      legacy.push({title: unescapeTitle(title), date: `${date[1]}-${date[2]}-${date[3]}`, url: '/' + path.relative(root, full).split(path.sep).join('/')});
    }
  }
}
scan(root);
legacy.sort((a,b) => b.date.localeCompare(a.date));

const notes = fs.readdirSync(path.join(root,'notes')).filter(f=>f.endsWith('.md')).map(file => {
  const raw = fs.readFileSync(path.join(root,'notes',file),'utf8');
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw Error(`Front matter missing: ${file}`);
  const meta = Object.fromEntries(match[1].split('\n').map(line => { const i=line.indexOf(':'); return [line.slice(0,i).trim(),line.slice(i+1).trim()]; }));
  if (!meta.title || !/^\d{4}-\d{2}-\d{2}$/.test(meta.date)) throw Error(`Invalid title/date: ${file}`);
  return {...meta, body: match[2], url:`/notlar/${slug(file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/,''))}/`};
}).sort((a,b)=>b.date.localeCompare(a.date));

function markdown(source) {
  const inline = s => esc(s).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,'<a href="$2" rel="noopener noreferrer">$1</a>');
  const lines = source.trim().split(/\r?\n/); let html='', list=false, code=false;
  for (const line of lines) {
    if (line.startsWith('```')) { if (list) {html+='</ul>';list=false;} html+= code?'</code></pre>':'<pre><code>';code=!code;continue; }
    if (code) { html+=esc(line)+'\n';continue; }
    if (/^[-*] /.test(line)) { if (!list) {html+='<ul>';list=true;} html+=`<li>${inline(line.slice(2))}</li>`;continue; }
    if (list) {html+='</ul>';list=false;}
    if (!line.trim()) continue;
    const h=line.match(/^(#{1,3})\s+(.+)$/);
    html+=h?`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`:`<p>${inline(line)}</p>`;
  }
  return html+(list?'</ul>':'')+(code?'</code></pre>':'');
}

const dateTR = d => new Intl.DateTimeFormat('tr-TR',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'}).format(new Date(d+'T00:00:00Z'));
function legacyBody(html, url) {
  const open = /<div\s+class=["']post["'][^>]*>/i.exec(html);
  if (!open) throw Error(`Legacy article body missing: ${url}`);
  const start = open.index + open[0].length;
  let depth = 1;
  for (const tag of html.slice(start).matchAll(/<\/?div\b[^>]*>/gi)) {
    depth += /^<\/div/i.test(tag[0]) ? -1 : 1;
    if (depth === 0) return html.slice(start, start + tag.index).trim();
  }
  throw Error(`Legacy article body unclosed: ${url}`);
}
const englishPath = url => url === '/' ? '/en/' : url.startsWith('/hakkimda/') ? '/en/about/' : url.startsWith('/arsiv/') ? '/en/writing/' : url.startsWith('/portfolio/') ? '/en/projects/' + url.slice('/portfolio/'.length) : url.startsWith('/projeler/') ? '/en/projects/' + url.slice('/projeler/'.length) : url.startsWith('/notlar/') ? '/en/notes/' + url.slice('/notlar/'.length) : '/en' + url;
const social = `<a href="${esc(cfg.github)}" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><i class="icon-github-circled" aria-hidden="true"></i></a><a href="${esc(cfg.linkedin)}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i class="icon-linkedin-squared" aria-hidden="true"></i></a><a href="${esc(cfg.twitter)}" target="_blank" rel="noopener noreferrer" aria-label="X"><span aria-hidden="true" class="x-symbol">𝕏</span></a>`;
function layout(title, description, active, content) {
  const nav = [['/','Başlangıç'],['/hakkimda/','Hakkımda'],['/portfolio/','Projeler'],['/arsiv/','Yazılar']].map(([url,label])=>`<a href="${url}" ${active===url?'aria-current="page"':''}>${label}</a>`).join('');
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#171719"><title>${esc(title)} · ${esc(cfg.name)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${cfg.siteUrl}${active}"><link rel="alternate" hreflang="tr" href="${cfg.siteUrl}${active}"><link rel="alternate" hreflang="en" href="${cfg.siteUrl}${englishPath(active)}"><meta property="og:type" content="website"><meta property="og:title" content="${esc(title)} · ${esc(cfg.name)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${cfg.siteUrl}${active}"><link rel="stylesheet" href="/site/style.css?v=${styleVersion}"><link rel="alternate" type="application/rss+xml" title="Notlar" href="/feed.xml"></head><body><div class="shell"><aside class="identity"><div class="identity-inner"><a href="/" class="portrait-link" aria-label="Ana sayfa"><img class="portrait" src="/assets/port.png" alt="Engin Deniz Erbaş"></a><a class="name" href="/">Engin Deniz Erbaş</a><p class="role">Engineer · Hobbyist</p><div class="social" aria-label="Sosyal bağlantılar">${social}</div><nav aria-label="Ana menü">${nav}</nav><div class="language-switch" aria-label="Dil seçimi"><span aria-current="true">TR</span><a href="${englishPath(active)}" lang="en" hreflang="en">EN</a></div><div class="identity-foot"><span>© ${new Date().getFullYear()}</span><button class="theme-toggle" type="button" aria-label="Renk temasını değiştir" aria-pressed="false">Koyu tema <span class="switch" aria-hidden="true"></span></button></div></div></aside><main id="main">${content}<footer class="footer"><span>Engin Deniz Erbaş</span><span><a href="${esc(cfg.twitter)}" target="_blank" rel="noopener noreferrer">X / Twitter ↗</a> · <a href="${esc(cfg.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a> · <a href="mailto:${esc(cfg.email)}">E-posta ↗</a></span></footer></main></div><script src="/site/site.js" defer></script></body></html>`;
}
const archiveRows = items => items.map(item=>`<a class="archive-row" href="${esc(item.url)}"><time datetime="${item.date}">${dateTR(item.date)}</time><span>${esc(item.title)}</span><b aria-hidden="true">↗</b></a>`).join('');
const intro = `<section class="home-intro"><img class="clock-art" src="/site/assets/izmir-clock-illustration-v2.png" alt="İzmir Saat Kulesi çizimi"><div class="intro-text"><p class="eyebrow">KİŞİSEL SAYFA / İZMİR</p><h1>Merhaba, ben Engin.</h1><p>Yazılım geliştiriyorum ve farklı fikirleri çalışan ürünlere dönüştürmeyi seviyorum. Burada üzerinde çalıştığım projeleri ve geçmişte yazdığım teknik notları bir araya getiriyorum.</p></div></section>`;
const luxar = `<section class="feature feature-luxar"><div class="feature-media"><a href="/projeler/luxar/"><img src="/site/assets/luxar-concept.webp" alt="Bir binada projection mapping uygulamasını temsil eden görsel" loading="lazy"></a><small>Temsili görsel</small></div><div class="feature-copy"><p class="eyebrow">ÖNE ÇIKAN PROJE <span class="eyebrow-line"></span></p><h2><a href="/projeler/luxar/">Luxar Studio: fikrin ekrana yansıması</a></h2><p>Telefon ve Android TV arasında çalışan bir projection mapping uygulaması. Yüzeyleri belirleme, görselleri seçme ve görüntüyü mekâna uyarlama fikrini tek bir akışta topluyor.</p><a class="inline-link" href="/projeler/luxar/">Projenin hikâyesi <span aria-hidden="true">→</span></a></div></section>`;
const enderova = `<section class="feature feature-enderova"><div class="feature-copy"><p class="eyebrow">ÜZERİNDE ÇALIŞTIĞIM DİĞER ŞEY <span class="eyebrow-line"></span></p><h2><a href="/projeler/enderova/">Enderova: yerel üretimin dijital yolu</a></h2><p>İzmir’de yerel gıdayı bölgesel teslimatla buluşturan bir girişim. Ürünlerin görünürlüğünden sipariş ve teslimat akışına kadar hem fiziksel hem dijital tarafını geliştiriyorum.</p><a class="inline-link" href="/projeler/enderova/">Enderova’yı tanı <span aria-hidden="true">→</span></a></div><div class="feature-media feature-media-right"><a href="/projeler/enderova/"><img src="/site/assets/olive-tree-engraving.png" alt="Ulu zeytin ağacı çizimi" loading="lazy"></a></div></section>`;
const recent = `<section class="archive-preview"><div class="section-heading"><p class="eyebrow">${notes.length?'NOTLAR VE ARŞİV':'ARŞİVDEN'}</p><h2>${notes.length?'Notlar ve önceki yazılar':'Önceki yazılar'}</h2><p>Gömülü sistemlerden yazılım mimarisine, daha önce yaptığım işleri anlattığım kayıtlar.</p></div><div class="archive-list">${archiveRows([...notes,...legacy].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4))}</div><a class="inline-link all-link" href="/arsiv/">Tüm yazılara bak <span aria-hidden="true">→</span></a></section>`;
write('index.html', layout('Başlangıç',cfg.description,'/',intro+luxar+enderova+recent));
const portfolio = `<section class="page-heading"><p class="eyebrow">PROJELER</p><h1>Üzerinde çalıştığım şeyler.</h1><p>Burada ürünlerin kendisinden çok onları geliştirme sürecini, karşılaştığım soruları ve aldığım kararları anlatıyorum.</p></section>${luxar}${enderova}<section class="archive-preview"><div class="section-heading"><p class="eyebrow">DAHA ÖNCE</p><h2>Teknik çalışmalar</h2><p>Önceki projelerimle ilgili yazıları da arşivde tutuyorum.</p></div><div class="archive-list">${archiveRows(legacy.slice(0,8))}</div><a class="inline-link all-link" href="/arsiv/">Tüm arşiv <span aria-hidden="true">→</span></a></section>`;
write('portfolio/index.html',layout('Projeler','Luxar, Enderova ve önceki teknik çalışmalar.','/portfolio/',portfolio));
const about = `<section class="page-heading about-heading"><p class="eyebrow">HAKKIMDA</p><h1>Merhaba, ben Engin.</h1><p>Gömülü sistemlerden web uygulamalarına uzanan farklı alanlarda çalıştım. Son zamanlarda kendi ürün fikirlerimi geliştirmeye daha çok zaman ayırıyorum.</p></section><section class="about-prose"><h2>Bu sayfa</h2><p>Bu adresi sabit bir CV yerine, yaptığım işleri ve düşüncelerimi zaman içinde bir araya getiren kişisel bir alan olarak görüyorum. Luxar Studio ve Enderova güncel çalışmalarım; önceki teknik yazılarım da arşivde duruyor.</p><h2>İletişim</h2><p>Projeler ve yazılar hakkında konuşmak istersen <a href="mailto:${esc(cfg.email)}">e-posta</a> gönderebilir veya <a href="${esc(cfg.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn</a> üzerinden ulaşabilirsin. Kodlar ve açık çalışmalar için <a href="${esc(cfg.github)}" target="_blank" rel="noopener noreferrer">GitHub</a> hesabıma bakabilirsin.</p></section>`;
write('hakkimda/index.html',layout('Hakkımda','Engin Deniz Erbaş hakkında.','/hakkimda/',about));
const archive = `<section class="page-heading"><p class="eyebrow">YAZILAR</p><h1>Yazı arşivi.</h1><p>Geçmişte üzerinde çalıştığım konuların kayıtları. Eski yazıların bağlantıları olduğu gibi korunuyor.</p></section><label class="search-label" for="archive-search">Yazılarda ara</label><input id="archive-search" class="archive-search" type="search" placeholder="Başlık veya yıl" autocomplete="off"><div class="archive-list searchable">${archiveRows([...notes,...legacy].sort((a,b)=>b.date.localeCompare(a.date)))}</div><p class="no-results" hidden>Bu arama için yazı bulunamadı.</p>`;
write('arsiv/index.html',layout('Yazı arşivi','Engin Deniz Erbaş’ın önceki yazıları.','/arsiv/',archive));
for (const note of notes) write(note.url.slice(1)+'index.html',layout(note.title,note.summary||note.title,note.url,`<article class="article"><a class="back" href="/arsiv/">← Yazılara dön</a><p class="eyebrow">${dateTR(note.date)}</p><h1>${esc(note.title)}</h1>${note.summary?`<p class="standfirst">${esc(note.summary)}</p>`:''}<div class="article-body">${markdown(note.body)}</div></article>`));
for (const item of legacy) {
  const body = legacyBody(fs.readFileSync(path.join(root,item.url.slice(1)),'utf8'),item.url);
  write(item.url.slice(1),layout(item.title,`${item.title} — yazı arşivi`,item.url,`<article class="article legacy-article"><a class="back" href="/arsiv/">← Yazı arşivine dön</a><p class="eyebrow"><time datetime="${item.date}">${dateTR(item.date)}</time> / ARŞİVDEN</p><h1>${esc(item.title)}</h1><div class="article-body legacy-body">${body}</div></article>`));
}
const extraLegacyUrls = [];
for (const slugName of fs.readdirSync(path.join(root,'portfolio'))) {
  const source = path.join(root,'portfolio',slugName,'index.html');
  if (!fs.existsSync(source)) continue;
  const html = fs.readFileSync(source,'utf8');
  const url = `/portfolio/${slugName}/`;
  const title = unescapeTitle(html.match(/<meta property="og:title" content="([^"]+)"/i)?.[1] || html.match(/<title>([^<]+)/i)?.[1] || slugName);
  const date = html.match(/<meta property="article:published_time" content="(\d{4}-\d{2}-\d{2})/i)?.[1];
  const body = legacyBody(html,url);
  const dateLabel = date ? `<p class="eyebrow"><time datetime="${date}">${dateTR(date)}</time> / ARŞİVDEN</p>` : '<p class="eyebrow">ARŞİVDEN</p>';
  write(url.slice(1)+'index.html',layout(title,`${title} — proje arşivi`,url,`<article class="article legacy-article"><a class="back" href="/portfolio/">← Projelere dön</a>${dateLabel}<h1>${esc(title)}</h1><div class="article-body legacy-body">${body}</div></article>`));
  extraLegacyUrls.push(url);
}
const privacySource = path.join(root,'privacy/easytodo/index.html');
if (fs.existsSync(privacySource)) {
  const html = fs.readFileSync(privacySource,'utf8');
  const title = unescapeTitle(html.match(/<meta property="og:title" content="([^"]+)"/i)?.[1] || 'EasyTodo Privacy Policy');
  const url = '/privacy/easytodo/';
  write(url.slice(1)+'index.html',layout(title,`${title} — EasyTodo`,url,`<article class="article legacy-article"><a class="back" href="/">← Ana sayfa</a><h1>${esc(title)}</h1><div class="article-body legacy-body">${legacyBody(html,url)}</div></article>`));
  extraLegacyUrls.push(url);
}
write('projeler/luxar/index.html',layout('Luxar Studio','Luxar Studio projection mapping projesi.','/projeler/luxar/',`<article class="article project-article"><a class="back" href="/portfolio/">← Projelere dön</a><p class="eyebrow">PROJE / ANDROID / PROJECTION MAPPING</p><h1>Luxar Studio</h1><p class="standfirst">Telefon ve Android TV’yi aynı projection mapping akışının iki parçası olarak bir araya getiren uygulama.</p><figure><img src="/site/assets/luxar-concept.webp" alt="Projection mapping için temsili sahne" loading="eager"><figcaption>Projection mapping için temsili görsel</figcaption></figure><div class="article-body"><h2>Fikir</h2><p>Luxar’da mobil arayüz projeyi oluşturuyor: yüzeyleri tanımlama, köşeleri ayarlama ve görselleri seçme burada yapılıyor. Android TV ise yerel ağ üzerinden gelen projeyi ekranda işliyor.</p><h2>Nasıl çalışıyor?</h2><p>Uygulama dört köşeli yüzey kalibrasyonu, birden fazla bağımsız yüzey, animasyon ve video oynatma desteği sunuyor. Kontrol ile görüntüleme aynı uygulama paketinde, farklı cihaz rollerinde çalışıyor.</p><p>Uygulamayı <a href="https://play.google.com/store/apps/details?id=com.luxar.studio" target="_blank" rel="noopener noreferrer">Google Play’de</a> inceleyebilirsin.</p></div><figure class="brand-figure"><img src="/site/assets/luxar-banner.webp" alt="Luxar Studio Android TV görseli" loading="lazy"></figure></article>`));
write('projeler/enderova/index.html',layout('Enderova','İzmir’den yerel gıda ve bölgesel teslimat projesi.','/projeler/enderova/',`<article class="article project-article"><a class="back" href="/portfolio/">← Projelere dön</a><p class="eyebrow">PROJE / YEREL ÜRETİM / DİJİTAL ÜRÜN</p><h1>Enderova</h1><p class="standfirst">İzmir’de yerel ürünleri haftalık bölge teslimatlarıyla buluşturmayı amaçlayan bir girişim.</p><figure><img src="/site/assets/enderova-photo.webp" alt="Enderova için ürün sofrası" loading="eager"></figure><div class="article-body"><h2>Ürün ve uygulama</h2><p>Yumurta, süt, zeytin, zeytinyağı ve mevsimlik ürünlerin güncel stokları uygulamada görülebiliyor. Android ve iOS müşteri uygulamaları ürün, stok ve teslimat bilgilerini aynı altyapıdan alıyor.</p><h2>Teslimat akışı</h2><p>Siparişler haftalık bölge teslimatları için alınıyor. Müşteri ev adresi veya toplu teslimat noktası seçebiliyor; sipariş ve stok akışı dijital olarak yönetiliyor.</p></div></article>`));
write('about/index.html','<!doctype html><html lang="tr"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/hakkimda/"><link rel="canonical" href="https://www.enderbas.com/hakkimda/"><a href="/hakkimda/">Hakkımda sayfasına git</a></html>');
write('articles/index.html','<!doctype html><html lang="tr"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/arsiv/"><link rel="canonical" href="https://www.enderbas.com/arsiv/"><a href="/arsiv/">Yazı arşivine git</a></html>');
write('feed.xml',`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${esc(cfg.name)} · Notlar</title><link>${cfg.siteUrl}</link><description>${esc(cfg.description)}</description><language>tr</language>${notes.map(n=>`<item><title>${esc(n.title)}</title><link>${cfg.siteUrl}${n.url}</link><guid>${cfg.siteUrl}${n.url}</guid><pubDate>${new Date(n.date+'T12:00:00Z').toUTCString()}</pubDate><description>${esc(n.summary||'')}</description></item>`).join('')}</channel></rss>`);
const localizedUrls = ['/','/hakkimda/','/portfolio/','/arsiv/','/projeler/luxar/','/projeler/enderova/',...notes.map(n=>n.url),...legacy.map(n=>n.url),...extraLegacyUrls];
const {localize} = await import('./localize.mjs');
localize({out,cfg,urls:localizedUrls,englishPath});
write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...localizedUrls,...localizedUrls.map(englishPath)].map(u=>`<url><loc>${cfg.siteUrl}${u}</loc></url>`).join('')}</urlset>`);
console.log(`Built ${notes.length} new notes and preserved ${legacy.length} legacy articles in _site/`);
