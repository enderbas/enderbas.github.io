import fs from 'node:fs';
import path from 'node:path';

const translations = new Map([
  ['Engin Deniz Erbaş’ın projeleri, notları ve yazı arşivi.','Projects, notes and writing by Engin Deniz Erbaş.'],
  ['Luxar, Enderova ve önceki teknik çalışmalar.','Luxar, Enderova and earlier technical work.'],
  ['Engin Deniz Erbaş hakkında.','About Engin Deniz Erbaş.'],
  ['Engin Deniz Erbaş’ın önceki yazıları.','Earlier writing by Engin Deniz Erbaş.'],
  ['Luxar Studio projection mapping projesi.','The Luxar Studio projection mapping project.'],
  ['İzmir’den yerel gıda ve bölgesel teslimat projesi.','Local food and regional delivery in İzmir.'],
  ['Bu adresi sabit bir CV yerine, yaptığım işleri ve düşüncelerimi zaman içinde bir araya getiren kişisel bir alan olarak görüyorum. Luxar Studio ve Enderova güncel çalışmalarım; önceki teknik yazılarım da arşivde duruyor.','I see this site as a personal space for bringing together my work and thoughts over time. Luxar Studio and Enderova are my current projects; my earlier technical writing remains in the archive.'],
  ['Gömülü sistemlerden web uygulamalarına uzanan farklı alanlarda çalıştım. Son zamanlarda kendi ürün fikirlerimi geliştirmeye daha çok zaman ayırıyorum.','I have worked across fields ranging from embedded systems to web applications. Lately, I have been spending more time developing my own product ideas.'],
  ['Yazılım geliştiriyorum ve farklı fikirleri çalışan ürünlere dönüştürmeyi seviyorum. Burada üzerinde çalıştığım projeleri ve geçmişte yazdığım teknik notları bir araya getiriyorum.','I build software and enjoy turning ideas into working products. This is where I bring together current projects and technical notes from earlier work.'],
  ['Telefon ve Android TV arasında çalışan bir projection mapping uygulaması. Yüzeyleri belirleme, görselleri seçme ve görüntüyü mekâna uyarlama fikrini tek bir akışta topluyor.','A projection mapping app connecting a phone and Android TV. It brings surface setup, visual selection and calibration into one workflow.'],
  ['İzmir’de yerel gıdayı bölgesel teslimatla buluşturan bir girişim. Ürünlerin görünürlüğünden sipariş ve teslimat akışına kadar hem fiziksel hem dijital tarafını geliştiriyorum.','A venture connecting local food in İzmir with regional delivery. I work on both its physical and digital sides, from product discovery to ordering and delivery.'],
  ['Gömülü sistemlerden yazılım mimarisine, daha önce yaptığım işleri anlattığım kayıtlar.','A record of earlier work, from embedded systems to software architecture.'],
  ['Burada ürünlerin kendisinden çok onları geliştirme sürecini, karşılaştığım soruları ve aldığım kararları anlatıyorum.','I focus on how these products were built, the questions I faced and the decisions behind them.'],
  ['Önceki projelerimle ilgili yazıları da arşivde tutuyorum.','Writing about earlier projects remains in the archive.'],
  ['Projeler ve yazılar hakkında konuşmak istersen ','If you would like to talk about a project or a piece of writing, you can send an '],
  [' gönderebilir veya ',' or reach me on '],
  [' üzerinden ulaşabilirsin. Kodlar ve açık çalışmalar için ','. For code and open work, visit my '],
  [' hesabıma bakabilirsin.',' profile.'],
  ['Geçmişte üzerinde çalıştığım konuların kayıtları. Eski yazıların bağlantıları olduğu gibi korunuyor.','A record of subjects I have worked on. The original links to older posts remain available.'],
  ['Telefon ve Android TV’yi aynı projection mapping akışının iki parçası olarak bir araya getiren uygulama.','An app that brings phones and Android TV together in one projection mapping workflow.'],
  ['Luxar’da mobil arayüz projeyi oluşturuyor: yüzeyleri tanımlama, köşeleri ayarlama ve görselleri seçme burada yapılıyor. Android TV ise yerel ağ üzerinden gelen projeyi ekranda işliyor.','The mobile interface builds the project: you define surfaces, adjust corners and select visuals there. Android TV renders the project received over the local network.'],
  ['Uygulama dört köşeli yüzey kalibrasyonu, birden fazla bağımsız yüzey, animasyon ve video oynatma desteği sunuyor. Kontrol ile görüntüleme aynı uygulama paketinde, farklı cihaz rollerinde çalışıyor.','The app supports four-corner calibration, multiple independent surfaces, animation and video playback. Control and rendering run in the same app package with different device roles.'],
  ['Uygulamayı ','You can find the app on '],
  [' inceleyebilirsin.','.'],
  ['İzmir’de yerel ürünleri haftalık bölge teslimatlarıyla buluşturmayı amaçlayan bir girişim.','A venture bringing local products in İzmir to customers through weekly regional deliveries.'],
  ['Yumurta, süt, zeytin, zeytinyağı ve mevsimlik ürünlerin güncel stokları uygulamada görülebiliyor. Android ve iOS müşteri uygulamaları ürün, stok ve teslimat bilgilerini aynı altyapıdan alıyor.','The app shows current availability for eggs, milk, olives, olive oil and seasonal products. Android and iOS clients draw product, stock and delivery information from the same backend.'],
  ['Siparişler haftalık bölge teslimatları için alınıyor. Müşteri ev adresi veya toplu teslimat noktası seçebiliyor; sipariş ve stok akışı dijital olarak yönetiliyor.','Orders are placed for weekly regional deliveries. Customers can choose a home address or a shared pickup point; orders and inventory are managed digitally.'],
  ['Merhaba, ben Engin.','Hello, I’m Engin.'],
  ['Luxar Studio: fikrin ekrana yansıması','Luxar Studio: bringing ideas to the screen'],
  ['Enderova: yerel üretimin dijital yolu','Enderova: a digital path for local food'],
  ['Üzerinde çalıştığım şeyler.','Things I’m working on.'],
  ['Önceki yazılar','Earlier writing'],
  ['Notlar ve önceki yazılar','Notes and earlier writing'],
  ['Yazı arşivi.','Writing archive.'],
  ['Yazı arşivi','Writing archive'],
  ['Teknik çalışmalar','Technical work'],
  ['Bu sayfa','This site'],
  ['İletişim','Contact'],
  ['Ürün ve uygulama','Product and app'],
  ['Teslimat akışı','Delivery workflow'],
  ['Nasıl çalışıyor?','How it works'],
  ['Fikir','The idea'],
  ['ÖNE ÇIKAN PROJE','FEATURED PROJECT'],
  ['ÜZERİNDE ÇALIŞTIĞIM DİĞER ŞEY','ANOTHER CURRENT PROJECT'],
  ['KİŞİSEL SAYFA / İZMİR','PERSONAL SITE / İZMİR'],
  ['NOTLAR VE ARŞİV','NOTES AND ARCHIVE'],
  ['ARŞİVDEN','FROM THE ARCHIVE'],
  ['DAHA ÖNCE','EARLIER WORK'],
  ['HAKKIMDA','ABOUT'],
  ['PROJELER','PROJECTS'],
  ['YAZILAR','WRITING'],
  ['Projenin hikâyesi','Project story'],
  ['Enderova’yı tanı','Explore Enderova'],
  ['Tüm yazılara bak','All writing'],
  ['Tüm arşiv','Full archive'],
  ['Yazılarda ara','Search writing'],
  ['Başlık veya yıl','Title or year'],
  ['Bu arama için yazı bulunamadı.','No writing matches this search.'],
  ['Yazılara dön','Back to writing'],
  ['Yazı arşivine dön','Back to writing archive'],
  ['Projelere dön','Back to projects'],
  ['Temsili görsel','Concept image'],
  ['Projection mapping için temsili görsel','Illustrative projection mapping image'],
  ['Bir binada projection mapping uygulamasını temsil eden görsel','Illustrative projection mapping on a building'],
  ['İzmir Saat Kulesi çizimi','Illustration of the İzmir Clock Tower'],
  ['Ulu zeytin ağacı çizimi','Illustration of an ancient olive tree'],
  ['Enderova için ürün sofrası','A table of Enderova products'],
  ['PROJE / YEREL ÜRETİM / DİJİTAL ÜRÜN','PROJECT / LOCAL FOOD / DIGITAL PRODUCT'],
  ['PROJE / ANDROID / PROJECTION MAPPING','PROJECT / ANDROID / PROJECTION MAPPING'],
  ['Google Play’de','Google Play'],
  ['e-posta','email'],
  ['Ana sayfa','Home'],
  ['Sosyal bağlantılar','Social links'],
  ['Ana menü','Main menu'],
  ['Dil seçimi','Language'],
  ['Renk temasını değiştir','Change color theme'],
  ['Koyu tema','Dark theme'],
  ['E-posta','Email'],
  ['Başlangıç','Home'],
  ['Hakkımda','About'],
  ['Projeler','Projects'],
  ['Yazılar','Writing'],
  ['Notlar','Notes'],
]);

const enDate = value => new Intl.DateTimeFormat('en-US',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'}).format(new Date(value+'T00:00:00Z'));

export function localize({out,cfg,urls,englishPath}) {
  const known = new Set(urls);
  for (const url of urls) {
    const source = path.join(out,url.slice(1),url.endsWith('/')?'index.html':'');
    const enUrl = englishPath(url);
    const target = path.join(out,enUrl.slice(1),enUrl.endsWith('/')?'index.html':'');
    let html = fs.readFileSync(source,'utf8');
    html = html.replace('<html lang="tr">','<html lang="en">');
    html = html.replace(`<link rel="canonical" href="${cfg.siteUrl}${url}">`,`<link rel="canonical" href="${cfg.siteUrl}${enUrl}">`);
    html = html.replace(`<meta property="og:url" content="${cfg.siteUrl}${url}">`,`<meta property="og:url" content="${cfg.siteUrl}${enUrl}">`);
    html = html.replace(/<div class="language-switch"[^>]*>.*?<\/div>/,`<div class="language-switch" aria-label="Language"><a href="${url}" lang="tr" hreflang="tr">TR</a><span aria-current="true">EN</span></div>`);
    for (const [tr,en] of [...translations].sort((a,b)=>b[0].length-a[0].length)) html = html.replaceAll(tr,en);
    html = html.replace(/<time datetime="(\d{4}-\d{2}-\d{2})">[^<]*<\/time>/g,(_,date)=>`<time datetime="${date}">${enDate(date)}</time>`);
    html = html.replace(/href="(\/[^"]*)"/g, (match,href) => known.has(href) ? `href="${englishPath(href)}"` : match);
    // Keep the language switch pointing back to the original Turkish page.
    html = html.replace(`<div class="language-switch" aria-label="Language"><a href="${englishPath(url)}"`, `<div class="language-switch" aria-label="Language"><a href="${url}"`);
    fs.mkdirSync(path.dirname(target),{recursive:true});
    fs.writeFileSync(target,html);
  }
}
