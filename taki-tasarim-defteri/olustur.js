// Boncuk Takı Tasarım Defteri üreticisi
// Kullanım: node olustur.js --pdf  ->  defter.html ve Taki-Tasarim-Defteri.pdf üretir
const fs = require('fs');
const path = require('path');

const SAHIP = 'Ayşe Yaman Portakal';
const YIL = '2026 – 2027';
const C = { murekkep: '#2b3a37', altin: '#b08d57', altinAcik: '#d4b36f', cizgi: '#cfc6b8', soluk: '#8a7f70' };
const f1 = (n) => String(n).replace('.', ',');

// ---------- yardımcılar ----------
let sayfaNo = 0;
const sayfa = (icerik, { sinif = '', numarasiz = false } = {}) => {
  sayfaNo++;
  const no = numarasiz ? '' : `<div class="sayfa-no">${sayfaNo}</div>`;
  return `<section class="sayfa ${sinif}">${icerik}${no}</section>`;
};
const susleme = () => `<svg viewBox="0 0 70 12" width="70" height="12" fill="none" stroke="currentColor" stroke-width=".8">
  <path d="M0 6 H22 M48 6 H70"/><circle cx="26" cy="6" r="2"/><circle cx="35" cy="6" r="4.2"/><circle cx="44" cy="6" r="2"/></svg>`;
const baslik = (ust, ana) => `
  <header class="baslik">
    <div class="ust">${ust}</div>
    <h2>${ana}</h2>
    <div class="susleme">${susleme()}</div>
  </header>`;
const dolu = (etiket, deger, gen = '') => deger ? `<div class="alan" style="${gen}"><span>${etiket}</span><i class="dolu">${deger}</i></div>` : cizgi(etiket, gen);
const cizgi = (etiket, gen = '') => `<div class="alan" style="${gen}"><span>${etiket}</span><i></i></div>`;
const satirlar = (n, cls = '') => `<div class="satirlar ${cls}">${'<div></div>'.repeat(n)}</div>`;
const tablo = (basliklar, satirlar_, cls = 'kucuk') => `<table class="tablo ${cls}"><thead><tr>${basliklar.map(b => Array.isArray(b) ? `<th style="width:${b[1]}">${b[0]}</th>` : `<th>${b}</th>`).join('')}</tr></thead><tbody>${satirlar_.map(r => `<tr>${r.map(h => `<td>${h}</td>`).join('')}</tr>`).join('')}</tbody></table>`;

// Boncuk dizisi (kapak motifi): sarkan bir kolye
const boncukDizi = (w = 160, renk = C.altinAcik) => {
  const parca = [];
  const n = 17;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1) * 2 - 1;           // -1..1
    const x = 80 + t * 72;
    const y = 10 + 46 * (1 - t * t);          // parabol
    const merkez = Math.abs(i - 8);
    const r = merkez === 0 ? 7 : merkez % 2 ? 2.2 : 4.6 - merkez * 0.25;
    const dolu = merkez % 2 === 1;
    parca.push(`<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${r}" ${dolu ? `fill="${renk}"` : ''}/>`);
  }
  return `<svg viewBox="0 0 160 92" width="${w}" height="${w * 92 / 160}" fill="none" stroke="${renk}" stroke-width=".9">
    <path d="M8 10 Q80 102 152 10" stroke-width=".5" opacity=".7"/>
    ${parca.join('')}
    <path d="M80 63 V70" stroke-width=".7"/>
    <path d="M80 70 C88 78 88 86 80 90 C72 86 72 78 80 70 Z"/>
    <circle cx="80" cy="5" r="0" />
  </svg>`;
};

// Boncuk şekilleri (viewBox 40) — kesikli çizgi = delik yönü
const delik = (x1, y1, x2, y2) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${C.altin}" stroke-dasharray="1.6 1.2" stroke-width=".7"/>`;
const sekiller = [
  ['Yuvarlak', `<circle cx="20" cy="20" r="13"/><path d="M12 14 A10 10 0 0 1 18 10" stroke-width=".6"/>${delik(2, 20, 38, 20)}`],
  ['Oval', `<ellipse cx="20" cy="20" rx="16" ry="10"/>${delik(1, 20, 39, 20)}`],
  ['Tüp / silindir', `<rect x="5" y="13" width="30" height="14" rx="2.5"/>${delik(1, 20, 39, 20)}`],
  ['Küp', `<path d="M9 14 L20 9 L31 14 L31 28 L20 33 L9 28 Z M9 14 L20 19 L31 14 M20 19 V33"/>${delik(3, 23, 37, 23)}`],
  ['Bikon', `<path d="M4 20 L20 9 L36 20 L20 31 Z M20 9 V31 M12 14.5 L12 25.5 M28 14.5 L28 25.5" />${delik(0, 20, 40, 20)}`],
  ['Rondel', `<rect x="6" y="12" width="28" height="16" rx="8"/><path d="M13 12.5 V27.5 M20 12 V28 M27 12.5 V27.5" stroke-width=".5"/>${delik(1, 20, 39, 20)}`],
  ['Damla', `<path d="M20 6 C27 15 31 22 31 27 A11 11 0 0 1 9 27 C9 22 13 15 20 6 Z"/><circle cx="20" cy="11" r="1.3"/>`],
  ['Disk / coin', `<circle cx="20" cy="20" r="13"/><circle cx="20" cy="20" r="9" stroke-width=".5"/><circle cx="20" cy="20" r="1.8"/>`],
  ['Çip', `<path d="M7 17 L14 9 L25 10 L33 16 L31 27 L21 32 L10 28 Z"/><path d="M14 9 L19 18 L33 16 M19 18 L21 32" stroke-width=".5"/>`],
  ['Tohum (Miyuki)', `<ellipse cx="20" cy="20" rx="13" ry="10"/><ellipse cx="20" cy="20" rx="4.5" ry="3.4"/>`],
  ['Yaprak', `<path d="M6 30 C6 14 18 6 34 6 C34 22 24 34 6 30 Z M6 30 L28 12" /><circle cx="31" cy="9" r="1.3"/>`],
  ['Kalp', `<path d="M20 33 C6 24 4 16 7 11 C10 6 17 6 20 12 C23 6 30 6 33 11 C36 16 34 24 20 33 Z"/>${delik(20, 4, 20, 36)}`],
];
const sekilSvg = (ic) => `<svg viewBox="0 0 40 40" width="17mm" height="17mm" fill="none" stroke="currentColor" stroke-width=".9">${ic}</svg>`;

// Kulak taslağı (küpe şablonu)
const kulak = (ayna = false) => `
<svg viewBox="0 0 44 64" width="30mm" height="44mm" fill="none" stroke="#a89a86" stroke-width=".6" ${ayna ? 'style="transform:scaleX(-1)"' : ''}>
  <path d="M22 3 C36 3 42 14 41 27 C40 37 33 41 31 48 C29 55 24 60 18 59 C12 58 11 52 14 47 C11 41 7 33 5.5 23 C4 11 10 3 22 3 Z"/>
  <path d="M15 12 C22 7 33 11 33 22 C33 30 27 32 24 37 C22 40 20 39 19 36"/>
  <path d="M19 20 C22 17 27 19 26 24"/>
  <circle cx="19.5" cy="53" r=".9" fill="${C.altin}" stroke="none"/>
</svg>`;

// Gerçek boyut boncuk dizisi (aynı boyuttan 5 boncuk yan yana)
const gercekBoncuk = (d) => {
  const adet = d <= 4 ? 5 : d <= 8 ? 3 : 1;
  const w = d * adet;
  const daireler = Array.from({ length: adet }, (_, i) => `<circle cx="${d / 2 + i * d}" cy="${d / 2}" r="${d / 2 - .12}" fill="none" stroke="${C.murekkep}" stroke-width=".2"/>`).join('');
  return `<div class="gercek"><svg width="${w}mm" height="${d}mm" viewBox="0 0 ${w} ${d}">${daireler}</svg><span>${d} mm</span></div>`;
};
const cetvel = () => `<div class="cetvel">${Array.from({ length: 101 }, (_, i) => `<i class="${i % 10 === 0 ? 'u' : i % 5 === 0 ? 'o' : ''}">${i % 10 === 0 ? `<b>${i / 10}</b>` : ''}</i>`).join('')}</div>`;

// ---------- sayfalar ----------
const kapak = () => sayfa(`
  <div class="kapak-cerceve">
    <div class="kapak-ust">Kişisel Tasarım Defteri</div>
    <div class="kapak-elmas">${boncukDizi(270)}</div>
    <h1>Boncuk<br/>Takı Tasarım<br/>Defteri</h1>
    <div class="kapak-ayrac">${susleme()}</div>
    <div class="kapak-alt">boncuk · desen · renk · ilham</div>
    <div class="kapak-isim">${SAHIP}</div>
    <div class="kapak-yil">${YIL}</div>
  </div>`, { sinif: 'kapak', numarasiz: true });

const kimlik = () => sayfa(`
  <div class="kimlik">
    <div class="kimlik-elmas">${boncukDizi(90, C.altin)}</div>
    <div class="ust" style="text-align:center">Bu defter</div>
    <div class="kimlik-isim">${SAHIP}</div>
    <div class="ust" style="text-align:center;margin-bottom:12mm">adına aittir</div>
    ${cizgi('Telefon')}
    ${cizgi('E-posta')}
    ${cizgi('Kurs / Atölye')}
    ${cizgi('Eğitmen')}
    ${cizgi('Ders günleri & saati')}
    ${cizgi('Başlangıç tarihi')}
    <h3>Bu kursta öğrenmek istediğim teknikler</h3>
    ${satirlar(5)}
    <h3>Hayalimdeki ilk boncuk koleksiyonu</h3>
    ${satirlar(4)}
    <p class="alinti">“Her boncuk bir notadır; doğru sırayla dizildiğinde bir şarkıya dönüşür.”</p>
  </div>`);

const dizin = () => {
  let s = '';
  for (let i = 1; i <= 26; i++) s += `<tr><td>${i}</td><td></td><td></td><td></td><td class="durum">○ ○ ○</td></tr>`;
  return sayfa(`${baslik('İçindekiler', 'Proje Dizini')}
    <table class="tablo dizin-tablo">
      <thead><tr><th style="width:9mm">No</th><th>Proje adı</th><th style="width:28mm">Tür</th><th style="width:16mm">Sayfa</th><th style="width:26mm">Eskiz · Yapım · Bitti</th></tr></thead>
      <tbody>${s}</tbody>
    </table>`);
};

// Başvuru 1: boyut & adet
const referansBoyut = () => {
  const boyutlar = [2, 3, 4, 5, 6, 8, 10, 12, 14].map(d => [`<b>${d} mm</b>`, Math.round(100 / d), Math.round(170 / d), Math.round(190 / d), Math.round(420 / d), Math.round(450 / d)]);
  const tohum = [
    ['15/0', '≈ 1,5 mm', '≈ 9 – 10', '≈ 250'],
    ['11/0', '≈ 2,0 mm', '≈ 7', '≈ 110'],
    ['Delica 11/0', '≈ 1,6 mm', '≈ 8', '≈ 200'],
    ['8/0', '≈ 3,0 mm', '≈ 4,5', '≈ 36'],
    ['6/0', '≈ 4,0 mm', '≈ 3,5', '≈ 13'],
  ];
  return sayfa(`${baslik('Başvuru · 1', 'Boncuk Boyutları & Adet Hesabı')}
    <h3>Kaç boncuk gerekir?</h3>
    ${tablo(['Boncuk çapı', '10 cm', 'Bileklik 17 cm', 'Bileklik 19 cm', 'Kolye 42 cm', 'Kolye 45 cm'], boyutlar)}
    <p class="not">Adet = dizi uzunluğu (mm) ÷ boncuk çapı (mm). Kapama ve ara boncuklar bu uzunluktan düşülür; hesabın üzerine %10 yedek ekleyin.</p>
    <div class="iki-kolon">
      <div>
        <h3>Tohum boncuk ölçüleri</h3>
        ${tablo(['Ölçü', 'Çap', 'Adet / cm', 'Adet / gram'], tohum)}
        <p class="not">Büyük numara = küçük boncuk. Değerler yaklaşıktır, markaya göre değişir.</p>
      </div>
      <div>
        <h3>Hızlı formüller</h3>
        <div class="formuller dikey">
          <div><b>Boncuk adedi</b>(uzunluk mm − kapama mm) ÷ çap</div>
          <div><b>İp / tel boyu</b>bitmiş uzunluk + 15 – 20 cm pay</div>
          <div><b>Desen tekrarı</b>toplam adet ÷ bir tekrardaki adet</div>
        </div>
      </div>
    </div>
    <h3>Gerçek boyut boncuklar <small>(%100 ölçekte yazdırın)</small></h3>
    <div class="gercek-sira">${[2, 3, 4, 5, 6, 8, 10, 12, 14].map(gercekBoncuk).join('')}</div>
    ${cetvel()}
    <p class="not" style="text-align:center">Kontrol cetveli: 10 cm. Ölçü tutmuyorsa yazıcıda “gerçek boyut” seçeneğini işaretleyin.</p>`);
};

// Başvuru 2: uzunluklar
const referansUzunluk = () => {
  const kolyeler = [
    ['Gerdanlık', '35 – 40 cm', 62],
    ['Prenses', '42 – 48 cm', 82],
    ['Matine', '50 – 60 cm', 104],
    ['Opera', '70 – 90 cm', 132],
    ['Uzun / sautoir', '100 cm +', 160],
  ];
  const yaylar = kolyeler.map(([, , y], i) =>
    `<path d="M${72 - i * 3} 40 C ${76 - i * 3} ${y - 5}, ${124 + i * 3} ${y - 5}, ${128 + i * 3} 40" stroke="${C.altin}" stroke-width="${i === 1 ? 1.1 : .7}" fill="none" stroke-dasharray="${i % 2 ? '0' : '2 1.5'}"/>
     <circle cx="100" cy="${y * 0.75 + 40 * 0.25 - 1}" r="1.6" fill="${C.altin}"/>`).join('');
  const etiketler = kolyeler.map(([ad, uz, y]) =>
    `<text x="146" y="${y * 0.75 + 9}" font-size="5.2" fill="${C.murekkep}" font-family="Jost, sans-serif">${ad}</text>
     <text x="146" y="${y * 0.75 + 15}" font-size="4.6" fill="${C.soluk}" font-family="Jost, sans-serif">${uz}</text>
     <line x1="104" y1="${y * 0.75 + 9}" x2="143" y2="${y * 0.75 + 9}" stroke="${C.cizgi}" stroke-width=".4"/>`).join('');
  const yuzuk = [10, 12, 14, 16, 18, 20].map(tr => [`<b>${tr}</b>`, tr + 40, f1(((tr + 40) / Math.PI).toFixed(1))]);
  return sayfa(`${baslik('Başvuru · 2', 'Uzunluklar & Ölçüler')}
    <h3>Kolye uzunlukları</h3>
    <svg viewBox="0 0 200 135" width="100%" style="max-height:92mm">
      <path d="M85 4 C 86 20, 82 28, 70 34 C 50 42, 25 44, 10 56 L 4 130" stroke="${C.murekkep}" stroke-width=".8" fill="none"/>
      <path d="M115 4 C 114 20, 118 28, 130 34 C 150 42, 175 44, 190 56 L 196 130" stroke="${C.murekkep}" stroke-width=".8" fill="none"/>
      ${yaylar}${etiketler}
    </svg>
    <div class="iki-kolon">
      <div>
        <h3>Bileklik, halhal & küpe</h3>
        ${tablo(['Ölçü', 'Önerilen uzunluk'], [
          ['Bilek 14 – 15 cm', '16 – 16,5 cm'], ['Bilek 15 – 16 cm', '17 – 17,5 cm'], ['Bilek 16 – 17 cm', '18 – 18,5 cm'],
          ['Bilek 17 – 18 cm', '19 – 19,5 cm'], ['Elastik bileklik', 'bilek çevresi + 1 cm'], ['Halhal', '23 – 27 cm'],
          ['Küpe (sallantı)', '3 – 7 cm'], ['Gözlük / maske zinciri', '65 – 75 cm']])}
        <p class="not">Kural: bilek çevresi + 1,5 – 2 cm. İri boncuklarda (10 mm +) pay 0,5 cm artırılır.</p>
      </div>
      <div>
        <h3>Boncuk yüzük ölçüleri</h3>
        ${tablo(['Türk ölçüsü', 'İç çevre (mm)', 'İç çap (mm)'], yuzuk)}
        <p class="not">Türk ölçüsü ≈ iç çevre (mm) − 40. Boncuk yüzükler iç hacim kapladığı için bir ölçü büyük planlayın.</p>
        <h3>Çok sıralı kolye</h3>
        <p class="not" style="margin-top:0">Katmanlar arasında 4 – 5 cm fark bırakın: örn. 40 · 45 · 50 cm.</p>
      </div>
    </div>`);
};

// Başvuru 3: şekiller & malzemeler
const referansSekil = () => {
  const sek = sekiller.map(([ad, ic]) => `<div class="kesim">${sekilSvg(ic)}<span>${ad}</span></div>`).join('');
  const malz = [
    ['Cam', 'Zengin renk, uygun fiyat', 'Yumuşak bezle silin'],
    ['Kristal', 'Fasetli, ışıltılı; keskin delik', 'Çelik tel ile dizin'],
    ['Tohum / Miyuki', 'Düzgün, örme teknikleri için', 'Boyalı olanları sudan koruyun'],
    ['Doğal taş', 'Ağır, doğal desenli', 'Parfüm ve kimyasaldan koruyun'],
    ['İnci', 'Hassas, yumuşak yüzey', 'Arasına düğüm atarak dizin'],
    ['Akrilik', 'Hafif, iri tasarımlar için', 'Isıdan uzak tutun'],
    ['Ahşap', 'Hafif, doğal görünüm', 'Islatmayın'],
    ['Seramik / porselen', 'El yapımı, renkli', 'Darbeden koruyun'],
    ['Metal ara boncuk', 'Ayırıcı, aksesuar', 'Kuru saklayın (kararma)'],
  ];
  return sayfa(`${baslik('Başvuru · 3', 'Boncuk Şekilleri & Malzemeler')}
    <h3>Boncuk şekilleri <small>— kesikli çizgi delik yönünü gösterir</small></h3>
    <div class="kesim-izgara">${sek}</div>
    <h3>Boncuk malzemeleri</h3>
    ${tablo([['Malzeme', '38mm'], 'Özellik', ['Bakım / ipucu', '62mm']], malz)}
    <h3>Boncuk türü notlarım</h3>
    ${satirlar(4)}`);
};

// Başvuru 4: ip, tel, kapama, teknikler
const referansIp = () => {
  const ipler = [
    ['Misina (naylon)', '0,20 – 0,50 mm', 'Hafif boncuk, görünmez dizi'],
    ['Çelik boncuk teli', '0,30 – 0,60 mm', 'Kristal, doğal taş; sıkıştırma boncuğuyla biter'],
    ['Elastik ip', '0,5 – 1,0 mm', 'Bileklik; çift düğüm + yapıştırıcı'],
    ['Boncuk ipliği (Nymo, FireLine)', '0,10 – 0,30 mm', 'Miyuki örme: peyote, brick, loom'],
    ['İpek / naylon kordon', '0,5 – 1,0 mm', 'İnci düğümleme, makrome'],
    ['Mumlu ip / deri', '1 – 2 mm', 'Kordon kolye, kayar düğüm'],
    ['Takı teli (bakır, pirinç)', '0,4 – 1,0 mm', 'Tel sarma, halka ve iğne uçları'],
  ];
  const kapamalar = [
    ['Istakoz kilit', 'En yaygın; halkaya takılır'], ['T kilit (toggle)', 'Dekoratif, kolay takılır'],
    ['Mıknatıslı kilit', 'Tek elle takma; hafif dizilerde'], ['Vidalı kilit', 'Küçük ve güvenli'],
    ['Halka (jump ring)', 'Parçaları birleştirir'], ['Sıkıştırma boncuğu (crimp)', 'Çelik teli sabitler'],
    ['Kalot / düğüm kapağı', 'İp ucunu gizler'], ['Uzatma zinciri', 'Ayarlanabilir boy'],
    ['İğne uç (kafa / göz)', 'Küpe sallantısı yapımı'], ['Küpe kancası', 'Kanca, halka, vida'],
    ['Boncuk kapağı', 'Boncuğu süsler'], ['Ara boncuk / ayırıcı', 'Deseni nefeslendirir'],
  ];
  const bitisler = [
    ['Çift düğüm', 'misina ve elastikte temel bitiş'], ['Cerrah düğümü', 'kaymayan, sağlam düğüm'],
    ['Çakmakla eritme', 'misina ucunu hafifçe eritip sabitleme'], ['Geri geçirme', 'ipi birkaç boncuktan geri geçirip gizleme'],
    ['Yapıştırıcı', 'düğüme bir damla şeffaf yapıştırıcı'], ['Sıkıştırma boncuğu', 'çelik telde kapama bağlantısı'],
  ];
  return sayfa(`${baslik('Başvuru · 4', 'İp, Misina & Kapamalar')}
    <h3>İp & tel rehberi</h3>
    ${tablo([['Tür', '52mm'], ['Kalınlık', '30mm'], 'Ne için?'], ipler)}
    <h3>Kapamalar & bağlantı parçaları</h3>
    <div class="kart-izgara">${kapamalar.map(([a, b]) => `<div><b>${a}</b>${b}</div>`).join('')}</div>
    <h3>Düğüm & bitiş yöntemleri <small>— öğrendiklerimi işaretliyorum</small></h3>
    <div class="alet-liste">${bitisler.map(([a, b]) => `<div><span class="kutu"></span><b class="tk">${a}</b><em>${b}</em></div>`).join('')}</div>`);
};

const sablonlar = () => {
  const halkalar = [10, 12, 14, 16, 18, 20].map(tr => {
    const d = (tr + 40) / Math.PI;
    return `<div class="gercek"><svg width="${d + 1}mm" height="${d + 1}mm" viewBox="0 0 ${d + 1} ${d + 1}"><circle cx="${(d + 1) / 2}" cy="${(d + 1) / 2}" r="${d / 2}" fill="none" stroke="${C.murekkep}" stroke-width=".18"/><circle cx="${(d + 1) / 2}" cy="${(d + 1) / 2}" r=".3" fill="${C.altin}"/></svg><span>${tr} · ${f1(d.toFixed(1))}</span></div>`;
  }).join('');
  const cift = `<div class="kulak-cift">${kulak(true)}${kulak(false)}</div>`;
  return sayfa(`${baslik('Şablon', 'Küpe & Yüzük Şablonları')}
    <h3>Küpe çizim şablonu <small>— sallantıyı kulak memesindeki noktadan başlayarak çizin</small></h3>
    <div class="kulak-izgara">${cift}${cift}${cift}${cift}</div>
    <h3>Gerçek boyut yüzük daireleri <small>(Türk ölçüsü · iç çap mm)</small></h3>
    <p class="not">Mevcut bir yüzüğü dairenin üzerine koyun; iç kenarı çizgiyle örtüşen daire yüzük ölçünüzdür.</p>
    <div class="gercek-sira hizali">${halkalar}</div>`);
};

// Kolye dizilim planı (boncuk tahtası)
const dizilimPlani = () => {
  const W = 180, cx = 90, y0 = 8, A = 78, B = 120;
  const N = 2000, pts = [];
  for (let i = 0; i <= N; i++) { const t = -Math.PI / 2 + Math.PI * i / N; pts.push([cx + A * Math.sin(t), y0 + B * Math.cos(t)]); }
  const kum = [0]; for (let i = 1; i <= N; i++) kum.push(kum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const yarim = kum[N] / 2, olcek = yarim / 26;  // her yanda 26 cm
  const nokta = (s) => { const hedef = yarim + s * olcek; let i = kum.findIndex(k => k >= hedef); if (i < 1) i = 1; const [x1, y1] = pts[i - 1], [x2, y2] = pts[i]; const L = Math.hypot(x2 - x1, y2 - y1); return { x: x2, y: y2, nx: -(y2 - y1) / L, ny: (x2 - x1) / L }; };
  let isaret = '';
  for (let s = -26; s <= 26; s++) {
    if (s === 0) continue;
    for (const yon of [1]) {
      const p = nokta(s); const uz = s % 5 === 0 ? 4 : 2; const sg = s < 0 ? -1 : 1;
      // normal dış tarafa
      let nx = p.nx * sg, ny = p.ny * sg;
      if (ny < 0 && Math.abs(s) < 3) { nx = -nx; ny = -ny; }
      isaret += `<line x1="${p.x}" y1="${p.y}" x2="${p.x + nx * uz}" y2="${p.y + ny * uz}" stroke="${C.murekkep}" stroke-width="${s % 5 === 0 ? .35 : .2}"/>`;
      if (s % 5 === 0) isaret += `<text x="${p.x + nx * 7.5}" y="${p.y + ny * 7.5 + 1.2}" font-size="3.2" text-anchor="middle" fill="${C.soluk}" font-family="Jost, sans-serif">${Math.abs(s)}</text>`;
    }
  }
  const std = [[17.5, '35'], [20, '40'], [22.5, '45'], [25, '50']].map(([s, et]) => [-s, s].map(v => { const p = nokta(v); const sg = v < 0 ? -1 : 1; return `<circle cx="${p.x}" cy="${p.y}" r="1.4" fill="${C.altin}"/><text x="${p.x - p.nx * sg * 6}" y="${p.y - p.ny * sg * 6 + 1.2}" font-size="3" text-anchor="middle" fill="${C.altin}" font-family="Jost, sans-serif">${et}</text>`; }).join('')).join('');
  const d = pts.filter((_, i) => i % 10 === 0).map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ');
  const mp = nokta(0);
  return sayfa(`${baslik('Planlama', 'Kolye Dizilim Planı')}
    <p class="not" style="text-align:center;margin-top:-3mm">Boncuk tahtası mantığı: merkezden her iki yana cm işaretleri (ölçekli). Altın noktalar toplam 35 · 40 · 45 · 50 cm kolye bitişleridir.</p>
    <svg viewBox="0 0 ${W} 140" width="100%" style="height:140mm;margin-top:2mm">
      <path d="${d}" fill="none" stroke="${C.murekkep}" stroke-width=".45"/>
      <path d="${pts.filter((_, i) => i % 10 === 0).map((p, i) => `${i ? 'L' : 'M'}${(cx + (p[0] - cx) * .82).toFixed(2)} ${(y0 + (p[1] - y0) * .82).toFixed(2)}`).join(' ')}" fill="none" stroke="${C.cizgi}" stroke-width=".35" stroke-dasharray="1.5 1.2"/>
      ${isaret}${std}
      <circle cx="${mp.x}" cy="${mp.y}" r="2.6" fill="none" stroke="${C.altin}" stroke-width=".6"/>
      <text x="${mp.x}" y="${mp.y - 5}" font-size="3.2" text-anchor="middle" fill="${C.altin}" font-family="Jost, sans-serif">MERKEZ</text>
    </svg>
    <div class="iki-kolon">
      <div>${cizgi('Kolye adı')}${cizgi('Toplam uzunluk')}${cizgi('Merkez boncuk')}${cizgi('Kapama')}</div>
      <div>${cizgi('Desen tekrarı')}${cizgi('Toplam boncuk')}${cizgi('İp / tel')}${cizgi('Tarih')}</div>
    </div>
    <h3>Notlar</h3>${satirlar(3)}`);
};

// Desen ızgaraları
const renkAnahtari = () => `<div class="renk-anahtar"><span>Renk anahtarı</span>${Array.from({ length: 8 }, (_, i) => `<div><i></i><em></em></div>`).join('')}</div>`;
const desenUst = (ad) => `
  <div class="desen-ust">
    <div class="desen-tur">${ad}</div>
    <div class="sira" style="flex:1">${cizgi('Desen adı', 'flex:2')}${cizgi('Tarih', 'flex:1')}</div>
  </div>${renkAnahtari()}`;
const izgaraSvg = (tur) => {
  const W = 180, H = 240; let s = '';
  const st = `fill="none" stroke="#cbc1b2" stroke-width=".16"`;
  if (tur === 'kare') {
    const c = 4; const nx = Math.floor(W / c), ny = Math.floor(H / c);
    for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) s += `<rect x="${x * c + .25}" y="${y * c + .25}" width="${c - .5}" height="${c - .5}" rx=".5" ${st}/>`;
    for (let x = 4; x < nx; x += 5) s += `<line x1="${x * c + c}" y1="0" x2="${x * c + c}" y2="${ny * c}" stroke="${C.altinAcik}" stroke-width=".12"/>`;
    for (let y = 4; y < ny; y += 5) s += `<line x1="0" y1="${y * c + c}" x2="${nx * c}" y2="${y * c + c}" stroke="${C.altinAcik}" stroke-width=".12"/>`;
  } else if (tur === 'peyote') {
    const w = 3.2, h = 4.2; const nx = Math.floor(W / w), ny = Math.floor((H - h / 2) / h);
    for (let x = 0; x < nx; x++) for (let y = 0; y < ny; y++) s += `<rect x="${x * w + .2}" y="${y * h + (x % 2 ? h / 2 : 0) + .2}" width="${w - .4}" height="${h - .4}" rx=".6" ${st}/>`;
  } else if (tur === 'brick') {
    const w = 4.2, h = 3.2; const nx = Math.floor((W - w / 2) / w), ny = Math.floor(H / h);
    for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) s += `<rect x="${x * w + (y % 2 ? w / 2 : 0) + .2}" y="${y * h + .2}" width="${w - .4}" height="${h - .4}" rx=".6" ${st}/>`;
  }
  if (tur === 'ndebele') {
    const w = 2.9, h = 4.0, cift = 8.4, dy = 3.3; const nc = Math.floor(W / cift), ny = Math.floor((H - 4) / dy);
    for (let c = 0; c < nc; c++) for (let y = 0; y < ny; y++) for (const [dx, a] of [[-1.8, -28], [1.8, 28]]) {
      const x = c * cift + cift / 2 + dx, yy = y * dy + 2.6;
      s += `<rect x="${(x - w / 2).toFixed(2)}" y="${(yy - h / 2).toFixed(2)}" width="${w}" height="${h}" rx=".7" transform="rotate(${a} ${x.toFixed(2)} ${yy.toFixed(2)})" ${st}/>`;
    }
  }
  return `<svg class="izgara" viewBox="0 0 ${W} ${H}" width="${W}mm" height="${H}mm">${s}</svg>`;
};
const desenAdlari = { kare: 'Kare örgü / loom ızgarası', peyote: 'Peyote ızgarası', brick: 'Tuğla (brick) ızgarası', ndebele: 'Ndebele / balıksırtı ızgarası' };
const desen = (tur) => sayfa(`${desenUst(desenAdlari[tur])}${izgaraSvg(tur)}`, { sinif: 'desen' });

const seritler = () => {
  const serit = () => {
    const n = 40, d = 3.8, ar = 4.4;
    const c = Array.from({ length: n }, (_, i) => `<circle cx="${i * ar + d / 2 + .3}" cy="${d / 2 + .3}" r="${d / 2}" fill="none" stroke="#bfb4a3" stroke-width=".18"/>${(i + 1) % 5 === 0 ? `<text x="${i * ar + d / 2 + .3}" y="${d + 3.4}" font-size="2.2" text-anchor="middle" fill="${C.soluk}" font-family="Jost, sans-serif">${i + 1}</text>` : ''}`).join('');
    return `<div class="serit"><div class="sira">${cizgi('Dizi', 'flex:2')}${cizgi('Tekrar', 'flex:1')}${cizgi('Uzunluk', 'flex:1')}</div><svg viewBox="0 0 ${n * ar} 8" width="${n * ar}mm" height="8mm">${c}</svg></div>`;
  };
  return sayfa(`${baslik('Planlama', 'Dizilim Şeritleri')}
    <p class="not" style="text-align:center;margin-top:-3mm">Her daire bir boncuk: renkleri doldurarak dizi sırasını ve desen tekrarını planlayın.</p>
    ${Array.from({ length: 10 }, serit).join('')}`);
};

const palet = () => {
  const daireler = Array.from({ length: 6 }, () => `
    <div class="palet-satir">
      <div class="palet-ad">${cizgi('Kombinasyon')}</div>
      <div class="palet-renkler">${'<div class="renk"></div>'.repeat(5)}</div>
      <div class="palet-not">${cizgi('Boncuk türü')}</div>
    </div>`).join('');
  return sayfa(`${baslik('Renk Çalışması', 'Renk & Boncuk Paleti')}
    <p class="not">Daireleri boya kalemiyle doldurun ya da boncuğun kendisini bantla yapıştırın; ilham kaynağını not edin.</p>
    ${daireler}
    <h3>Renk uyumu notlarım <small>— zıt renkler, tek renk tonları, metalik vurgular</small></h3>
    ${satirlar(4)}`);
};

const ilham = () => sayfa(`${baslik('Moodboard', 'İlham Panosu')}
  <div class="ilham-izgara">
    <div class="foto b1"><span>fotoğraf / kesik</span></div>
    <div class="foto b2"><span>doku</span></div>
    <div class="foto b3"><span>renk</span></div>
    <div class="foto b4"><span>form</span></div>
    <div class="foto b5"><span>doğa</span></div>
    <div class="foto b6"><span>boncuk örneği</span></div>
  </div>
  <div class="iki-kolon" style="margin-top:6mm">
    <div>${cizgi('Tema')}${cizgi('Anahtar kelimeler')}${cizgi('Hedef kişi / kullanım')}</div>
    <div>${cizgi('Kaynaklar')}${cizgi('Hissettirdiği duygu')}${cizgi('Koleksiyon adı')}</div>
  </div>`);

const envanter = () => {
  let r = '';
  for (let i = 0; i < 24; i++) r += '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
  return sayfa(`${baslik('Atölye', 'Boncuk & Malzeme Envanteri')}
    <table class="tablo">
      <thead><tr><th>Boncuk / malzeme</th><th style="width:22mm">Tür</th><th style="width:16mm">Boyut</th><th style="width:20mm">Renk</th><th style="width:14mm">Adet</th><th style="width:17mm">Fiyat</th><th style="width:26mm">Nereden</th></tr></thead>
      <tbody>${r}</tbody>
    </table>`);
};

const tedarik = () => {
  let r = '';
  for (let i = 0; i < 9; i++) r += '<tr><td></td><td></td><td></td><td></td></tr>';
  const aletler = ['Yuvarlak uçlu pense', 'Yassı (düz) pense', 'Kesme pensesi', 'Sıkıştırma (crimp) pensesi', 'Boncuk iğneleri', 'Boncuk tablası / keçe', 'Boncuk tahtası', 'Boncuk durdurucu (stopper)', 'Küçük makas', 'İp yakıcı / çakmak', 'Şeffaf takı yapıştırıcısı', 'Mezura & cetvel', 'Bölmeli saklama kutusu', 'Loom (boncuk tezgâhı)', 'Kumihimo diski', 'Bitirme halkası açıcı'];
  return sayfa(`${baslik('Atölye', 'Tedarikçiler & Aletler')}
    <h3>Tedarikçiler</h3>
    <table class="tablo">
      <thead><tr><th>Firma / dükkân</th><th>Ürünler</th><th style="width:34mm">İletişim</th><th style="width:22mm">Not</th></tr></thead>
      <tbody>${r}</tbody>
    </table>
    <h3>Alet kontrol listesi</h3>
    <div class="alet-liste">${aletler.map(a => `<div><span class="kutu"></span>${a}</div>`).join('')}${'<div><span class="kutu"></span><i></i></div>'.repeat(4)}</div>`);
};

let tasarimNo = 0;
const tasarim = (teknik = '') => {
  tasarimNo++;
  const turler = ['Kolye', 'Bileklik', 'Küpe', 'Yüzük', 'Halhal', 'Set', 'Diğer'];
  let malz = '';
  for (let i = 0; i < 6; i++) malz += '<tr><td></td><td></td><td></td><td></td><td></td></tr>';
  const n = 40, ar = 4.4, d = 3.8;
  const serit = Array.from({ length: n }, (_, i) => `<circle cx="${i * ar + d / 2 + .3}" cy="${d / 2 + .3}" r="${d / 2}" fill="none" stroke="#bfb4a3" stroke-width=".18"/>`).join('');
  return sayfa(`
    <div class="tasarim-ust">
      <div class="no-rozet"><small>Tasarım</small><b>${String(tasarimNo).padStart(2, '0')}</b></div>${teknik ? `<div class="teknik-etiket">${teknik}</div>` : ''}
      <div class="tasarim-alanlar">
        <div class="sira">${cizgi('Proje adı', 'flex:2.2')}${cizgi('Tarih', 'flex:1')}</div>
        <div class="turler">${turler.map(t => `<span><i class="kutu"></i>${t}</span>`).join('')}</div>
      </div>
    </div>
    <div class="cizim-alani buyuk"><span class="kose">Ana eskiz</span></div>
    <div class="gorunumler">
      <div class="cizim-alani"><span class="kose">Detay / yakın</span></div>
      <div class="cizim-alani"><span class="kose">Kapama & bitiş</span></div>
      <div class="cizim-alani"><span class="kose">Alternatif renk</span></div>
    </div>
    <div class="dizi-serit"><span>Dizilim sırası</span><svg viewBox="0 0 ${n * ar} 4.4" width="${n * ar}mm" height="4.4mm">${serit}</svg></div>
    <div class="tasarim-alt">
      <div>
        <table class="tablo kucuk malz">
          <thead><tr><th>Boncuk / malzeme</th><th style="width:11mm">Boyut</th><th style="width:13mm">Renk</th><th style="width:10mm">Adet</th><th style="width:13mm">Maliyet</th></tr></thead>
          <tbody>${malz}</tbody>
          <tfoot><tr><td>Toplam</td><td></td><td></td><td></td><td></td></tr></tfoot>
        </table>
      </div>
      <div class="teknik">
        ${cizgi('İp / tel')}${cizgi('Kapama')}${dolu('Teknik', teknik)}
        <div class="sira">${cizgi('Uzunluk', 'flex:1')}${cizgi('Boncuk adedi', 'flex:1')}</div>
        <div class="sira">${cizgi('Süre', 'flex:1')}${cizgi('Satış fiyatı', 'flex:1')}</div>
        <div class="degerlendirme"><span>Sonuç</span>${'<i>☆</i>'.repeat(5)}<span class="durumlar"><i class="kutu"></i>Eskiz <i class="kutu"></i>Yapımda <i class="kutu"></i>Bitti</span></div>
      </div>
    </div>`, { sinif: 'tasarim' });
};

let dersNo = 0;
const ders = (konu = '') => {
  dersNo++;
  return sayfa(`
    <div class="ders-ust">
      <div class="no-rozet"><small>Ders</small><b>${String(dersNo).padStart(2, '0')}</b></div>
      <div class="tasarim-alanlar">
        <div class="sira">${dolu('Konu / teknik', konu, 'flex:2.2')}${cizgi('Tarih', 'flex:1')}</div>
        <div class="sira">${cizgi('Kullanılan boncuk & aletler', 'flex:1')}</div>
      </div>
    </div>
    <div class="ders-govde">
      <div>${satirlar(27, 'ders-satir')}</div>
      <aside>
        <div class="kenar-kutu"><b>Önemli ipuçları</b>${satirlar(6)}</div>
        <div class="kenar-kutu"><b>Ödev / pratik</b>${satirlar(5)}</div>
        <div class="kenar-kutu cizim-alani kucuk-izgara"><span class="kose">Hızlı çizim</span></div>
      </aside>
    </div>`, { sinif: 'ders' });
};

const serbest = () => sayfa(`
  <div class="serbest-ust">${cizgi('Serbest çizim', 'flex:2.2')}${cizgi('Tarih', 'flex:1')}</div>
  <div class="cizim-alani tam"></div>`, { sinif: 'serbest' });

const teknikKarti = () => sayfa(`${baslik('Teknik Kartı', 'Yeni Bir Teknik')}
  <div class="iki-kolon">
    <div>${cizgi('Tekniğin adı')}${cizgi('Zorluk  ○ ○ ○ ○ ○')}${cizgi('Boncuk türü & boyutu')}${cizgi('İp / iğne')}</div>
    <div class="cizim-alani" style="height:42mm"><span class="kose">İp yolu / örnek çizim</span></div>
  </div>
  <h3>Adım adım</h3>
  <div class="adimlar">${Array.from({ length: 8 }, (_, i) => `<div class="adim"><b>${i + 1}</b><div class="cizim-alani mini"></div><div>${satirlar(4)}</div></div>`).join('')}</div>
  <div class="iki-kolon">
    <div><h3>Dikkat edilecekler</h3>${satirlar(3)}</div>
    <div><h3>Hatalarım & çözümler</h3>${satirlar(3)}</div>
  </div>`);

const arkaKapak = () => sayfa(`
  <div class="kapak-cerceve arka">
    <div class="kapak-elmas">${boncukDizi(130)}</div>
    <div class="kapak-alt" style="margin-top:6mm">${SAHIP}</div>
    <div class="kapak-yil">Boncuk Takı Tasarım Defteri</div>
  </div>`, { sinif: 'kapak', numarasiz: true });

// ---------- kurs müfredatı (tahtadaki plan) ----------
const MALZ = {
  makas: 'Makas', cakmak: 'Çakmak', karga: 'Kargaburun', keski: 'Keski', kivirma: 'Kıvırma pensesi',
  bez: 'Çalışma bezi', dikis: 'Dikiş iğnesi', boncukIgne: 'Boncuk iğnesi',
};
const BOLUMLER = [
  { ad: 'Hapishane İşi', ek: 'ders',
    aciklama: 'Geleneksel Türk boncuk işçiliği. Adını cezaevlerinde yapılmasından alır; renkli boncuklar misina ya da iple sık ve sağlam bir örgüyle işlenir. Tespih püskülü, anahtarlık, kolye ucu ve küçük figürlerde kullanılır.',
    malz: ['Misina', 'Renkli boncuk', MALZ.boncukIgne, MALZ.makas, MALZ.cakmak, MALZ.bez] },
  { ad: 'Çivi Kıvırma Teknikleri', ek: 'ders',
    aciklama: 'Boncuğu iğne uca (çiviye) dizip ucunu kıvırma pensesiyle ilmek hâline getirme tekniği. Basit ilmek ve sarmalı ilmek ile küpe sallantıları, tespih zinciri ve bağlantı parçaları yapılır.',
    malz: ['İğne uç / çivi', 'Halka', 'Boncuk', MALZ.karga, MALZ.kivirma, MALZ.keski] },
  { ad: 'Misinalı Modeller', ek: 'serit',
    aciklama: 'Boncukların misinaya dizilip çapraz geçişlerle şekillendirildiği modeller. Uçlar düğümlenir, fazlası kesilir ve çakmakla hafifçe eritilerek sabitlenir.',
    malz: ['Misina', 'Boncuk', MALZ.makas, MALZ.cakmak, MALZ.bez, 'Kapama'] },
  { ad: 'Peyote', ust: 'Miyuki Yapım Teknikleri · 1', ek: 'peyote',
    aciklama: 'Miyuki boncukların yarım boncuk kaydırılarak dikey sıralarla örüldüğü teknik. Desenli bileklik bantları, yüzükler ve kılıflar için idealdir.',
    malz: ['Miyuki boncuk', 'Boncuk ipliği', MALZ.boncukIgne, MALZ.makas, MALZ.cakmak, MALZ.bez] },
  { ad: 'Tuğla (Brick)', ust: 'Miyuki Yapım Teknikleri · 2', ek: 'brick',
    aciklama: 'Her boncuğun alt sıradaki ipliğe tutturulduğu, tuğla duvar gibi yatay kaydırmalı örgü. Küpe, üçgen ve yelpaze formlar için uygundur.',
    malz: ['Miyuki boncuk', 'Boncuk ipliği', MALZ.boncukIgne, MALZ.makas, MALZ.cakmak, MALZ.bez] },
  { ad: 'Ndebele (Balıksırtı)', ust: 'Miyuki Yapım Teknikleri · 3', ek: 'ndebele',
    aciklama: 'Boncukların ikişer ikişer V biçiminde dizildiği, balıksırtı dokulu akışkan örgü. Halat kolye ve esnek bantlar için kullanılır.',
    malz: ['Miyuki boncuk', 'Boncuk ipliği', MALZ.boncukIgne, MALZ.makas, MALZ.cakmak, MALZ.bez] },
  { ad: 'Dönen Mineli', ek: 'ders',
    aciklama: 'Mineli (renkli emaye) parçalarla yapılan dönen model. Eğitmenin gösterdiği yapım sırasını, parça ve boncuk dizilimini aşağıya not edin.',
    malz: ['Mineli parça', 'Boncuk', 'Halka', MALZ.karga, MALZ.kivirma, MALZ.keski] },
  { ad: 'Şeker Topu Dönence', ek: 'ders',
    aciklama: 'Küçük boncuklarla örülen şeker topu motifleriyle yapılan dönence modeli. Bir topta kaç boncuk kullanıldığını ve geçiş sırasını not edin.',
    malz: ['Boncuk', 'Misina / iplik', MALZ.boncukIgne, MALZ.makas, MALZ.cakmak, MALZ.bez] },
  { ad: 'Cevşen Set Takımı', ek: 'ders',
    aciklama: 'Cevşen motifli kolye, küpe ve bileklikten oluşan uyumlu set. Parçaların oranlarını ve ortak renk düzenini birlikte planlayın.',
    malz: ['Cevşen parçası', 'Zincir', 'Kapama', MALZ.karga, MALZ.kivirma, MALZ.keski] },
  { ad: 'Nazo ve Taş Bezeme', ek: 'ders',
    aciklama: 'Nazo ve renkli taşlarla yapılan bezeme. Taşlar boncuk ya da dikiş iğnesiyle zemine veya diziye tutturulur; eğitmenin gösterdiği yapım sırasını aşağıya not edin.',
    malz: ['Nazo', 'Taşlar', MALZ.dikis, MALZ.boncukIgne, 'İplik', MALZ.makas] },
];
const ON_SAYFA = 11, BOLUM_SAYFA = 4;
const bolumSayfasi = (i) => ON_SAYFA + 1 + i * BOLUM_SAYFA;

const kursPlani = () => {
  const satir = BOLUMLER.map((b, i) => `<tr><td>${i + 1}</td><td><b>${b.ad}</b>${b.ust ? `<em> · Miyuki</em>` : ''}</td><td></td><td>${bolumSayfasi(i)}</td><td class="durum">○ ○ ○</td></tr>`).join('');
  return sayfa(`${baslik('Kurs Programı', 'Temel Teknikler')}
    <table class="tablo dizin-tablo plan-tablo">
      <thead><tr><th style="width:9mm">No</th><th>Teknik</th><th style="width:30mm">Ders tarihi</th><th style="width:15mm">Sayfa</th><th style="width:28mm">Öğrendim · Denedim · Ustalaştım</th></tr></thead>
      <tbody>${satir}</tbody>
    </table>
    <h3>Kurs boyunca hedeflerim</h3>${satirlar(4)}
    <h3>Eğitmenin genel önerileri</h3>${satirlar(5)}`);
};

const temelMalzemeler = () => {
  const ana = [
    ['Makas', 'Misina ve ip kesimi; ucu sivri küçük makas tercih edin.'],
    ['Çakmak', 'Misina ve ip uçlarını hafifçe eritip düğümü sabitlemek için.'],
    ['Kargaburun', 'Tutma, halka açıp kapama, çivi ve teli bükme.', true],
    ['Keski', 'Çivi, tel ve zinciri temiz şekilde kesme.'],
    ['Kıvırma pensesi', 'Yuvarlak uçlu; çiviyi kıvırıp düzgün ilmek yapma.', true],
    ['Çalışma bezi', 'Boncukların yuvarlanmasını önler, gözü yormaz.'],
    ['Dikiş iğnesi', 'Kalın delikli boncuklar, nazo ve taş bezeme dikişi.'],
    ['Boncuk iğnesi', 'İnce ve uzun; Miyuki ve küçük delikli boncuklar için.'],
  ];
  const ek = ['Misina', 'Boncuk ipliği', 'Miyuki boncuk (11/0 · 15/0)', 'İğne uç / çivi', 'Halka (jump ring)', 'Kapama', 'Zincir', 'Nazo', 'Mineli parçalar', 'Cevşen parçası', 'Şeffaf yapıştırıcı', 'Bölmeli boncuk kutusu'];
  return sayfa(`${baslik('Kurs Programı', 'Temel Malzemeler')}
    <p class="not" style="text-align:center;margin-top:-3mm">★ Eğitmenin özellikle işaretlediği aletler</p>
    <div class="malz-kartlar">${ana.map(([a, b, y]) => `<div class="${y ? 'yildiz' : ''}"><div class="mk-ust"><span class="kutu"></span><b>${a}${y ? ' <i>★</i>' : ''}</b></div><p>${b}</p>${cizgi('Nereden / fiyat')}</div>`).join('')}</div>
    <h3>Ek malzemeler <small>— derslere göre gerekenler</small></h3>
    <div class="alet-liste">${ek.map(a => `<div><span class="kutu"></span>${a}</div>`).join('')}${'<div><span class="kutu"></span><i></i></div>'.repeat(2)}</div>`);
};

const bolumAcilis = (b, i) => sayfa(`
  <div class="bolum-ust">
    <div class="no-rozet buyuk-rozet"><small>Bölüm</small><b>${String(i + 1).padStart(2, '0')}</b></div>
    <div><div class="ust">${b.ust || 'Temel Teknik'}</div><h2 class="bolum-ad">${b.ad}</h2></div>
  </div>
  <p class="bolum-aciklama">${b.aciklama}</p>
  <div class="iki-kolon">
    <div><h3>Bu bölümün malzemeleri</h3><div class="alet-liste tek">${b.malz.map(m => `<div><span class="kutu"></span>${m}</div>`).join('')}<div><span class="kutu"></span><i></i></div></div></div>
    <div>${cizgi('Ders tarihi')}${cizgi('Zorluk  ○ ○ ○ ○ ○')}<div class="cizim-alani" style="height:41mm;margin-top:2mm"><span class="kose">Örnek / sonuç</span></div></div>
  </div>
  <h3>Adım adım</h3>
  <div class="adimlar">${Array.from({ length: 6 }, (_, k) => `<div class="adim"><b>${k + 1}</b><div class="cizim-alani mini"></div><div>${satirlar(5)}</div></div>`).join('')}</div>
  <div class="iki-kolon">
    <div><h3>Eğitmen ipuçları</h3>${satirlar(4)}</div>
    <div><h3>Hatalarım & çözümler</h3>${satirlar(4)}</div>
  </div>`, { sinif: 'bolum' });

const ekSayfa = (b) => {
  if (b.ek === 'serit') return seritler();
  if (['peyote', 'brick', 'ndebele'].includes(b.ek)) return desen(b.ek);
  return ders(b.ad);
};

// ---------- düzen (56 sayfa) ----------
const govde = [kapak(), kimlik(), kursPlani(), temelMalzemeler(), dizin(), referansBoyut(), referansUzunluk(), referansIp(), sablonlar(), dizilimPlani(), palet()];
if (sayfaNo !== ON_SAYFA) throw new Error('Ön sayfa sayısı ' + sayfaNo);
BOLUMLER.forEach((b, i) => govde.push(bolumAcilis(b, i), tasarim(b.ad), tasarim(b.ad), ekSayfa(b)));
govde.push(ilham(), envanter(), tedarik(), serbest());
govde.push(arkaKapak());

const css = fs.readFileSync(path.join(__dirname, 'stil.css'), 'utf8');
const html = `<!doctype html>
<html lang="tr"><head><meta charset="utf-8"/>
<title>Boncuk Takı Tasarım Defteri</title>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet"/>
<style>${css}</style></head>
<body>${govde.join('\n')}</body></html>`;

fs.writeFileSync(path.join(__dirname, 'defter.html'), html);
console.log(`defter.html yazıldı — ${sayfaNo} sayfa`);

if (process.argv.includes('--pdf')) {
  (async () => {
    const { chromium } = require('playwright');
    const b = await chromium.launch();
    const p = await b.newPage();
    await p.goto('file://' + path.join(__dirname, 'defter.html'), { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.pdf({ path: path.join(__dirname, 'Taki-Tasarim-Defteri.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true });
    await b.close();
    console.log('Taki-Tasarim-Defteri.pdf yazıldı');
  })();
}
