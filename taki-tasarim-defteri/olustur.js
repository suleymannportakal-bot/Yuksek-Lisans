// Takı Tasarım Defteri üreticisi
// Kullanım: node olustur.js  ->  defter.html ve Taki-Tasarim-Defteri.pdf üretir
const fs = require('fs');
const path = require('path');

const SAHIP = 'Ayşe Yaman Portakal';
const YIL = '2026 – 2027';

// ---------- yardımcılar ----------
let sayfaNo = 0;
const sayfa = (icerik, { sinif = '', numarasiz = false } = {}) => {
  sayfaNo++;
  const no = numarasiz ? '' : `<div class="sayfa-no">${sayfaNo}</div>`;
  return `<section class="sayfa ${sinif}">${icerik}${no}</section>`;
};
const baslik = (ust, ana) => `
  <header class="baslik">
    <div class="ust">${ust}</div>
    <h2>${ana}</h2>
    <div class="susleme">${elmasKucuk()}</div>
  </header>`;
const cizgi = (etiket, gen = '') => `<div class="alan" style="${gen}"><span>${etiket}</span><i></i></div>`;
const satirlar = (n, cls = '') => `<div class="satirlar ${cls}">${'<div></div>'.repeat(n)}</div>`;

// Elmas (pırlanta) çizimi — kapak ve süsleme için
const elmas = (w = 120, renk = 'currentColor', kalinlik = 1) => `
<svg viewBox="0 0 120 100" width="${w}" height="${w * 100 / 120}" fill="none" stroke="${renk}" stroke-width="${kalinlik}" stroke-linejoin="round">
  <path d="M30 10 H90 L115 35 L60 95 L5 35 Z"/>
  <path d="M5 35 H115"/>
  <path d="M30 10 L45 35 L60 10 L75 35 L90 10"/>
  <path d="M30 10 L18 35 M90 10 L102 35"/>
  <path d="M18 35 L60 95 L45 35 M75 35 L60 95 L102 35"/>
</svg>`;
const elmasKucuk = () => `<svg viewBox="0 0 60 12" width="60" height="12" fill="none" stroke="currentColor" stroke-width=".8">
  <path d="M0 6 H22 M38 6 H60"/><path d="M26 2 H34 L37 5 L30 11 L23 5 Z M23 5 H37"/></svg>`;

// Taş kesim şekilleri
const kesimler = [
  ['Yuvarlak', '<circle cx="20" cy="20" r="16"/><polygon points="20,9 28,12 31,20 28,28 20,31 12,28 9,20 12,12"/>'],
  ['Oval', '<ellipse cx="20" cy="20" rx="12" ry="17"/><ellipse cx="20" cy="20" rx="6.5" ry="10"/>'],
  ['Armut', '<path d="M20 3 C27 12 32 20 32 26 A12 12 0 0 1 8 26 C8 20 13 12 20 3 Z"/><path d="M20 12 C24 18 26 22 26 26 A6 6 0 0 1 14 26 C14 22 16 18 20 12 Z"/>'],
  ['Markiz', '<path d="M20 2 C31 12 31 28 20 38 C9 28 9 12 20 2 Z"/><path d="M20 10 C25 16 25 24 20 30 C15 24 15 16 20 10 Z"/>'],
  ['Kalp', '<path d="M20 34 C6 24 3 16 6 10 C9 4 17 4 20 11 C23 4 31 4 34 10 C37 16 34 24 20 34 Z"/><path d="M20 26 C13 21 11 17 13 14 C15 11 18 12 20 16 C22 12 25 11 27 14 C29 17 27 21 20 26 Z"/>'],
  ['Prenses', '<rect x="5" y="5" width="30" height="30"/><path d="M5 5 L35 35 M35 5 L5 35"/><rect x="13" y="13" width="14" height="14"/>'],
  ['Zümrüt', '<polygon points="11,3 29,3 34,8 34,32 29,37 11,37 6,32 6,8"/><polygon points="14,9 26,9 28,11 28,29 26,31 14,31 12,29 12,11"/>'],
  ['Yastık', '<rect x="5" y="5" width="30" height="30" rx="9"/><rect x="12" y="12" width="16" height="16" rx="4"/>'],
  ['Baget', '<rect x="11" y="3" width="18" height="34"/><rect x="15" y="8" width="10" height="24"/>'],
  ['Trilyon', '<path d="M20 4 Q22 4 36 31 Q36 34 33 34 H7 Q4 34 4 31 Q18 4 20 4 Z"/><path d="M20 15 L28 29 H12 Z"/>'],
  ['Kabaşon', '<ellipse cx="20" cy="24" rx="16" ry="6"/><path d="M4 24 C4 10 36 10 36 24"/>'],
  ['Asscher', '<polygon points="12,5 28,5 35,12 35,28 28,35 12,35 5,28 5,12"/><polygon points="16,12 24,12 28,16 28,24 24,28 16,28 12,24 12,16"/>'],
];
const kesimSvg = (ic) => `<svg viewBox="0 0 40 40" width="17mm" height="17mm" fill="none" stroke="currentColor" stroke-width=".9">${ic}</svg>`;

// Kulak taslağı (küpe şablonu)
const kulak = (ayna = false) => `
<svg viewBox="0 0 44 64" width="30mm" height="44mm" fill="none" stroke="#a89a86" stroke-width=".6" ${ayna ? 'style="transform:scaleX(-1)"' : ''}>
  <path d="M22 3 C36 3 42 14 41 27 C40 37 33 41 31 48 C29 55 24 60 18 59 C12 58 11 52 14 47 C11 41 7 33 5.5 23 C4 11 10 3 22 3 Z"/>
  <path d="M15 12 C22 7 33 11 33 22 C33 30 27 32 24 37 C22 40 20 39 19 36"/>
  <path d="M19 20 C22 17 27 19 26 24"/>
  <circle cx="19.5" cy="53" r=".9" fill="#b08d57" stroke="none"/>
</svg>`;

// ---------- sayfalar ----------
const kapak = () => sayfa(`
  <div class="kapak-cerceve">
    <div class="kapak-ust">Kişisel Tasarım Defteri</div>
    <div class="kapak-elmas">${elmas(150, '#d4b36f', 1.1)}</div>
    <h1>Takı<br/>Tasarım<br/>Defteri</h1>
    <div class="kapak-ayrac">${elmasKucuk()}</div>
    <div class="kapak-alt">eskiz · malzeme · teknik · ilham</div>
    <div class="kapak-isim">${SAHIP}</div>
    <div class="kapak-yil">${YIL}</div>
  </div>`, { sinif: 'kapak', numarasiz: true });

const kimlik = () => sayfa(`
  <div class="kimlik">
    <div class="kimlik-elmas">${elmas(70, '#b08d57', .9)}</div>
    <div class="ust" style="text-align:center">Bu defter</div>
    <div class="kimlik-isim">${SAHIP}</div>
    <div class="ust" style="text-align:center;margin-bottom:14mm">adına aittir</div>
    ${cizgi('Telefon')}
    ${cizgi('E-posta')}
    ${cizgi('Kurs / Atölye')}
    ${cizgi('Eğitmen')}
    ${cizgi('Ders günleri & saati')}
    ${cizgi('Başlangıç tarihi')}
    <h3>Bu kursta öğrenmek istediklerim</h3>
    ${satirlar(5)}
    <h3>Hayalimdeki ilk koleksiyon</h3>
    ${satirlar(4)}
    <p class="alinti">“Her takı, taşıyanın hikâyesini anlatan küçük bir mimaridir.”</p>
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

const referansOlcu = () => {
  let yuzuk = '';
  for (let tr = 8; tr <= 22; tr++) {
    const cevre = tr + 40;
    const cap = (cevre / Math.PI).toFixed(1);
    const us = Math.round(((cevre - 36.5) / 2.55) * 2) / 2;
    yuzuk += `<tr><td><b>${tr}</b></td><td>${cevre}</td><td>${cap}</td><td>${us}</td></tr>`;
  }
  const metaller = [
    ['24 ayar altın', '999', '%99,9', '19,3'],
    ['22 ayar altın', '916', '%91,6', '17,8'],
    ['18 ayar altın', '750', '%75,0', '15,5'],
    ['14 ayar altın', '585', '%58,5', '13,1'],
    ['8 ayar altın', '333', '%33,3', '11,2'],
    ['Saf gümüş', '999', '%99,9', '10,5'],
    ['Gümüş (sterling)', '925', '%92,5', '10,4'],
    ['Platin', '950', '%95,0', '21,4'],
    ['Bakır', '—', '—', '8,9'],
    ['Pirinç', '—', 'Cu + Zn', '8,5'],
    ['Bronz', '—', 'Cu + Sn', '8,8'],
  ].map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('');
  const teller = [[14, 1.63], [16, 1.29], [18, 1.02], [20, 0.81], [22, 0.64], [24, 0.51], [26, 0.40], [28, 0.32]]
    .map(([g, mm]) => `<tr><td>${g}</td><td>${mm.toFixed(2).replace('.', ',')}</td></tr>`).join('');
  return sayfa(`${baslik('Başvuru · 1', 'Ölçüler & Metaller')}
    <div class="iki-kolon">
      <div>
        <h3>Yüzük ölçü tablosu</h3>
        <table class="tablo kucuk">
          <thead><tr><th>Türk ölçüsü</th><th>İç çevre (mm)</th><th>İç çap (mm)</th><th>ABD (≈)</th></tr></thead>
          <tbody>${yuzuk}</tbody>
        </table>
        <p class="not">Türk ölçüsü ≈ iç çevre (mm) − 40. Geniş bantlı yüzüklerde yarım–bir ölçü büyük seçin.</p>
      </div>
      <div>
        <h3>Metal ayarları & özkütle</h3>
        <table class="tablo kucuk">
          <thead><tr><th>Metal</th><th>Milyem</th><th>Saflık</th><th>g/cm³</th></tr></thead>
          <tbody>${metaller}</tbody>
        </table>
        <p class="not">Tahmini ağırlık (g) = hacim (cm³) × özkütle. Renkli altınlarda özkütle alaşıma göre değişir.</p>
        <h3>Tel kalınlıkları</h3>
        <table class="tablo kucuk">
          <thead><tr><th>AWG (gauge)</th><th>Çap (mm)</th></tr></thead>
          <tbody>${teller}</tbody>
        </table>
      </div>
    </div>
    <h3>Hızlı formüller</h3>
    <div class="formuller">
      <div><b>Çevre</b> = iç çap × 3,14</div>
      <div><b>Yüzük teli boyu</b> = (iç çap + tel kalınlığı) × 3,14</div>
      <div><b>Ağırlık (g)</b> = hacim (cm³) × özkütle</div>
    </div>
    <h3>Ölçü notlarım</h3>
    ${satirlar(5)}`);
};

const referansUzunluk = () => {
  const kolyeler = [
    ['Gerdanlık', '35 – 40 cm', 62],
    ['Prenses', '42 – 48 cm', 82],
    ['Matine', '50 – 60 cm', 104],
    ['Opera', '70 – 90 cm', 132],
    ['Uzun / rope', '100 cm +', 160],
  ];
  const yaylar = kolyeler.map(([, , y], i) =>
    `<path d="M${72 - i * 3} 40 C ${76 - i * 3} ${y - 5}, ${124 + i * 3} ${y - 5}, ${128 + i * 3} 40" stroke="#b08d57" stroke-width="${i === 1 ? 1.1 : .7}" fill="none" stroke-dasharray="${i % 2 ? '0' : '2 1.5'}"/>
     <circle cx="100" cy="${y * 0.75 + 40 * 0.25 - 1}" r="1.6" fill="#b08d57"/>`).join('');
  const etiketler = kolyeler.map(([ad, uz, y]) =>
    `<text x="146" y="${y * 0.75 + 9}" font-size="5.2" fill="#2b3a37" font-family="Jost, sans-serif">${ad}</text>
     <text x="146" y="${y * 0.75 + 15}" font-size="4.6" fill="#8a7f70" font-family="Jost, sans-serif">${uz}</text>
     <line x1="104" y1="${y * 0.75 + 9}" x2="143" y2="${y * 0.75 + 9}" stroke="#cfc6b8" stroke-width=".4"/>`).join('');
  const sertlik = [
    ['Elmas', 10], ['Yakut · Safir', 9], ['Topaz', 8], ['Zümrüt · Akuamarin', 7.5], ['Ametist · Sitrin · Kuvars', 7],
    ['Peridot', 6.5], ['Opal · Ay taşı', 6], ['Turkuaz · Lapis', 5.5], ['Mercan', 3.5], ['İnci', 3], ['Kehribar', 2.5],
  ].map(([ad, m]) => `<div class="sertlik"><span>${ad}</span><div class="bar"><i style="width:${m * 10}%"></i></div><b>${String(m).replace('.', ',')}</b></div>`).join('');
  return sayfa(`${baslik('Başvuru · 2', 'Uzunluklar & Taşlar')}
    <h3>Kolye uzunlukları</h3>
    <svg viewBox="0 0 200 135" width="100%" style="max-height:95mm">
      <path d="M85 4 C 86 20, 82 28, 70 34 C 50 42, 25 44, 10 56 L 4 130" stroke="#2b3a37" stroke-width=".8" fill="none"/>
      <path d="M115 4 C 114 20, 118 28, 130 34 C 150 42, 175 44, 190 56 L 196 130" stroke="#2b3a37" stroke-width=".8" fill="none"/>
      ${yaylar}${etiketler}
    </svg>
    <div class="iki-kolon">
      <div>
        <h3>Bileklik & halhal</h3>
        <table class="tablo kucuk">
          <thead><tr><th>Bilek çevresi</th><th>Önerilen uzunluk</th></tr></thead>
          <tbody>
            <tr><td>14 – 15 cm</td><td>16 cm</td></tr>
            <tr><td>15 – 16 cm</td><td>17 – 17,5 cm</td></tr>
            <tr><td>16 – 17 cm</td><td>18 – 18,5 cm</td></tr>
            <tr><td>17 – 18 cm</td><td>19 – 19,5 cm</td></tr>
            <tr><td>Halhal (ayak bileği)</td><td>23 – 27 cm</td></tr>
            <tr><td>Kelepçe (iç çap)</td><td>5,8 – 6,5 cm</td></tr>
          </tbody>
        </table>
        <p class="not">Kural: bilek çevresi + 1,5 – 2 cm. Kalın boncuklarda pay artırılır.</p>
      </div>
      <div>
        <h3>Taş sertliği (Mohs)</h3>
        ${sertlik}
        <p class="not">7'nin altındaki taşlar günlük kullanımda çizilebilir; yüzükte korumalı yuva tercih edin.</p>
      </div>
    </div>`);
};

const referansKesim = () => {
  const kesim = kesimler.map(([ad, ic]) => `<div class="kesim">${kesimSvg(ic)}<span>${ad}</span></div>`).join('');
  const yuvarlak = [2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16]
    .map(d => `<div class="gercek"><svg width="${d}mm" height="${d}mm" viewBox="0 0 ${d} ${d}"><circle cx="${d / 2}" cy="${d / 2}" r="${d / 2 - .1}" fill="none" stroke="#2b3a37" stroke-width=".15"/></svg><span>${d}</span></div>`).join('');
  const oval = [[6, 4], [7, 5], [8, 6], [10, 8], [12, 10], [14, 10], [16, 12], [18, 13], [20, 15]]
    .map(([h, w]) => `<div class="gercek"><svg width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}"><ellipse cx="${w / 2}" cy="${h / 2}" rx="${w / 2 - .1}" ry="${h / 2 - .1}" fill="none" stroke="#2b3a37" stroke-width=".15"/></svg><span>${h}×${w}</span></div>`).join('');
  const kare = [4, 5, 6, 8, 10, 12]
    .map(d => `<div class="gercek"><svg width="${d}mm" height="${d}mm" viewBox="0 0 ${d} ${d}"><rect x=".1" y=".1" width="${d - .2}" height="${d - .2}" fill="none" stroke="#2b3a37" stroke-width=".22"/></svg><span>${d}</span></div>`).join('');
  return sayfa(`${baslik('Başvuru · 3', 'Taş Kesimleri & Boyutlar')}
    <h3>Kesim şekilleri</h3>
    <div class="kesim-izgara">${kesim}</div>
    <h3>Gerçek boyut şablonları <small>(mm — %100 ölçekte yazdırın)</small></h3>
    <div class="etiket">Yuvarlak</div><div class="gercek-sira">${yuvarlak}</div>
    <div class="etiket">Oval</div><div class="gercek-sira">${oval}</div>
    <div class="etiket">Kare / prenses</div><div class="gercek-sira">${kare}</div>
    <div class="cetvel">${Array.from({ length: 101 }, (_, i) => `<i class="${i % 10 === 0 ? 'u' : i % 5 === 0 ? 'o' : ''}">${i % 10 === 0 ? `<b>${i / 10}</b>` : ''}</i>`).join('')}</div>
    <p class="not" style="text-align:center">Kontrol cetveli: 10 cm. Ölçü tutmuyorsa yazıcıda “gerçek boyut” seçeneğini işaretleyin.</p>`);
};

const sablonlar = () => {
  const halkalar = [8, 10, 12, 14, 16, 18, 20].map(tr => {
    const d = (tr + 40) / Math.PI;
    return `<div class="gercek"><svg width="${d + 1}mm" height="${d + 1}mm" viewBox="0 0 ${d + 1} ${d + 1}"><circle cx="${(d + 1) / 2}" cy="${(d + 1) / 2}" r="${d / 2}" fill="none" stroke="#2b3a37" stroke-width=".18"/><circle cx="${(d + 1) / 2}" cy="${(d + 1) / 2}" r=".3" fill="#b08d57"/></svg><span>${tr} · ${d.toFixed(1)}</span></div>`;
  }).join('');
  const cift = `<div class="kulak-cift">${kulak(true)}${kulak(false)}</div>`;
  return sayfa(`${baslik('Şablon', 'Küpe & Yüzük Şablonları')}
    <h3>Küpe çizim şablonu <small>— küpeyi kulak memesindeki noktadan başlayarak çizin</small></h3>
    <div class="kulak-izgara">${cift}${cift}${cift}${cift}</div>
    <h3>Gerçek boyut yüzük daireleri <small>(Türk ölçüsü · iç çap mm)</small></h3>
    <p class="not">Mevcut bir yüzüğü dairenin üzerine koyun; iç kenarı çizgiyle örtüşen daire yüzük ölçünüzdür.</p>
    <div class="gercek-sira hizali">${halkalar}</div>`);
};

const palet = () => {
  const daireler = Array.from({ length: 6 }, (_, r) => `
    <div class="palet-satir">
      <div class="palet-ad">${cizgi('Kombinasyon')}</div>
      <div class="palet-renkler">${'<div class="renk"></div>'.repeat(5)}</div>
      <div class="palet-not">${cizgi('Metal / taş')}</div>
    </div>`).join('');
  return sayfa(`${baslik('Renk Çalışması', 'Renk & Taş Paleti')}
    <p class="not">Daireleri boya kalemi ya da suluboyayla doldurun; ilham aldığınız kaynağı ve uyumlu metali not edin.</p>
    ${daireler}
    <h3>Renk uyumu notlarım</h3>
    ${satirlar(4)}`);
};

const ilham = () => sayfa(`${baslik('Moodboard', 'İlham Panosu')}
  <div class="ilham-izgara">
    <div class="foto b1"><span>fotoğraf / kesik</span></div>
    <div class="foto b2"><span>doku</span></div>
    <div class="foto b3"><span>renk</span></div>
    <div class="foto b4"><span>form</span></div>
    <div class="foto b5"><span>doğa</span></div>
    <div class="foto b6"><span>mimari</span></div>
  </div>
  <div class="iki-kolon" style="margin-top:6mm">
    <div>${cizgi('Tema')}${cizgi('Anahtar kelimeler')}${cizgi('Hedef kişi / kullanım')}</div>
    <div>${cizgi('Kaynaklar')}${cizgi('Hissettirdiği duygu')}${cizgi('Koleksiyon adı')}</div>
  </div>`);

const envanter = () => {
  let r = '';
  for (let i = 0; i < 24; i++) r += '<tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
  return sayfa(`${baslik('Atölye', 'Malzeme Envanteri')}
    <table class="tablo">
      <thead><tr><th>Malzeme / taş</th><th style="width:22mm">Renk</th><th style="width:20mm">Ölçü</th><th style="width:16mm">Adet</th><th style="width:20mm">Fiyat</th><th style="width:30mm">Nereden</th></tr></thead>
      <tbody>${r}</tbody>
    </table>`);
};

const tedarik = () => {
  let r = '';
  for (let i = 0; i < 9; i++) r += '<tr><td></td><td></td><td></td><td></td></tr>';
  const aletler = ['Yassı pense', 'Yuvarlak pense', 'Kesme pensesi', 'Kıl testere', 'Eğe seti', 'Yüzük mastarı', 'Yüzük ölçü çubuğu (mandrel)', 'Kumpas', 'Hassas terazi', 'Lehim makinesi / şalümo', 'Zımpara & polisaj', 'Tokmak / çekiç', 'Matkap uçları', 'Cımbız', 'Büyüteç / lup', 'Boncuk ipi & iğne'];
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
const tasarim = () => {
  tasarimNo++;
  const turler = ['Yüzük', 'Kolye', 'Küpe', 'Bileklik', 'Broş', 'Set', 'Diğer'];
  let malz = '';
  for (let i = 0; i < 6; i++) malz += '<tr><td></td><td></td><td></td></tr>';
  return sayfa(`
    <div class="tasarim-ust">
      <div class="no-rozet"><small>Tasarım</small><b>${String(tasarimNo).padStart(2, '0')}</b></div>
      <div class="tasarim-alanlar">
        <div class="sira">${cizgi('Proje adı', 'flex:2.2')}${cizgi('Tarih', 'flex:1')}</div>
        <div class="turler">${turler.map(t => `<span><i class="kutu"></i>${t}</span>`).join('')}</div>
      </div>
    </div>
    <div class="cizim-alani buyuk"><span class="kose">Ana eskiz</span></div>
    <div class="gorunumler">
      <div class="cizim-alani"><span class="kose">Ön görünüm</span></div>
      <div class="cizim-alani"><span class="kose">Yan görünüm</span></div>
      <div class="cizim-alani"><span class="kose">Üst / detay</span></div>
    </div>
    <div class="tasarim-alt">
      <div>
        <table class="tablo kucuk malz">
          <thead><tr><th>Malzeme</th><th style="width:14mm">Miktar</th><th style="width:16mm">Maliyet</th></tr></thead>
          <tbody>${malz}</tbody>
          <tfoot><tr><td>Toplam</td><td></td><td></td></tr></tfoot>
        </table>
      </div>
      <div class="teknik">
        ${cizgi('Metal / ayar')}${cizgi('Taş / boncuk')}${cizgi('Teknik')}${cizgi('Ölçüler')}
        <div class="sira">${cizgi('Ağırlık', 'flex:1')}${cizgi('Süre', 'flex:1')}</div>
        <div class="degerlendirme"><span>Sonuç</span>${'<i>☆</i>'.repeat(5)}<span class="durumlar"><i class="kutu"></i>Eskiz <i class="kutu"></i>Yapımda <i class="kutu"></i>Bitti</span></div>
      </div>
    </div>`, { sinif: 'tasarim' });
};

let dersNo = 0;
const ders = () => {
  dersNo++;
  return sayfa(`
    <div class="ders-ust">
      <div class="no-rozet"><small>Ders</small><b>${String(dersNo).padStart(2, '0')}</b></div>
      <div class="tasarim-alanlar">
        <div class="sira">${cizgi('Konu', 'flex:2.2')}${cizgi('Tarih', 'flex:1')}</div>
        <div class="sira">${cizgi('Kullanılan aletler', 'flex:1')}</div>
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
    <div>${cizgi('Tekniğin adı')}${cizgi('Zorluk  ○ ○ ○ ○ ○')}${cizgi('Gerekli aletler')}${cizgi('Malzemeler')}</div>
    <div class="cizim-alani" style="height:42mm"><span class="kose">Örnek / sonuç çizimi</span></div>
  </div>
  <h3>Adım adım</h3>
  <div class="adimlar">${Array.from({ length: 8 }, (_, i) => `<div class="adim"><b>${i + 1}</b><div class="cizim-alani mini"></div><div>${satirlar(4)}</div></div>`).join('')}</div>
  <div class="iki-kolon">
    <div><h3>Dikkat edilecekler</h3>${satirlar(3)}</div>
    <div><h3>Hatalarım & çözümler</h3>${satirlar(3)}</div>
  </div>`);

const arkaKapak = () => sayfa(`
  <div class="kapak-cerceve arka">
    <div class="kapak-elmas">${elmas(60, '#d4b36f', 1)}</div>
    <div class="kapak-alt" style="margin-top:6mm">${SAHIP}</div>
    <div class="kapak-yil">Takı Tasarım Defteri</div>
  </div>`, { sinif: 'kapak', numarasiz: true });

// ---------- düzen ----------
const govde = [kapak(), kimlik(), dizin(), referansOlcu(), referansUzunluk(), referansKesim(), sablonlar(), palet(), ilham(), envanter(), tedarik()];
for (let h = 0; h < 6; h++) {
  govde.push(ders(), tasarim(), tasarim(), tasarim(), tasarim(), h % 2 ? serbest() : teknikKarti());
}
govde.push(arkaKapak());

const css = fs.readFileSync(path.join(__dirname, 'stil.css'), 'utf8');
const html = `<!doctype html>
<html lang="tr"><head><meta charset="utf-8"/>
<title>Takı Tasarım Defteri</title>
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
    if (process.argv.includes('--onizle')) {
      await p.setViewportSize({ width: 794, height: 1123 });
      const sayfalar = await p.$$('section.sayfa');
      const dir = process.argv[process.argv.indexOf('--onizle') + 1];
      for (let i = 0; i < sayfalar.length; i++) {
        if ([0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 16, 17, 22].includes(i)) await sayfalar[i].screenshot({ path: path.join(dir, `s${String(i + 1).padStart(2, '0')}.png`) });
      }
    }
    await b.close();
    console.log('Taki-Tasarim-Defteri.pdf yazıldı');
  })();
}
