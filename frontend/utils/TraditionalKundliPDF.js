
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DateTime } from 'luxon';
import { getPanchanga } from '../lib/vedicjyotish/services/calcPanchanga';
import { simpleTransliterate } from '../lib/vedicjyotish/services/NepaliLocalization';
import { KundaliGenerationService } from '../lib/kundaliGenerationService';
import { HouseDetails } from '../lib/vedicjyotish/constants/Houses';
import PlanetaryData from '../lib/vedicjyotish/data/PlanetaryRemedies.json';

const kundaliService = new KundaliGenerationService();

// --- MAPPINGS (Internal to avoid dependency issues) ---

const RASHI_MAP = {
  1: 'मेष', 2: 'वृषभ', 3: 'मिथुन', 4: 'कर्क', 5: 'सिंह', 6: 'कन्या',
  7: 'तुला', 8: 'वृश्चिक', 9: 'धनु', 10: 'मकर', 11: 'कुंभ', 12: 'मीन'
};

const NAKSHATRA_MAP = {
  1: 'अश्विनी', 2: 'भरणी', 3: 'कृतिका', 4: 'रोहिणी', 5: 'मृगशिरा', 6: 'आर्द्रा',
  7: 'पुर्नवसु', 8: 'पुष्य', 9: 'अश्लेषा', 10: 'मघा', 11: 'पू.फाल्गुनी', 12: 'उ.फाल्गुनी',
  13: 'हस्त', 14: 'चित्रा', 15: 'स्वाति', 16: 'विशाखा', 17: 'अनुराधा', 18: 'ज्येष्ठा',
  19: 'मूल', 20: 'पू.षाढ़ा', 21: 'उ.षाढ़ा', 22: 'श्रवण', 23: 'धनिष्ठा', 24: 'शतभिषा',
  25: 'पू.भाद्रपद', 26: 'उ.भाद्रपद', 27: 'रेवती'
};

const TITHI_MAP = {
  1: 'प्रतिपदा', 2: 'द्वितीया', 3: 'तृतिया', 4: 'चतुर्थी', 5: 'पंचमी',
  6: 'षष्ठी', 7: 'सप्तमी', 8: 'अष्टमी', 9: 'नवमीं', 10: 'दशमी',
  11: 'एकादशी', 12: 'व्दादशी', 13: 'त्रयोदशी', 14: 'चर्तुदशी',
  15: 'अमावस्या', 30: 'पूर्णिमा'
};

const YOGA_MAP = {
  1: 'विष्कम्भ', 2: 'प्रीति', 3: 'आयुष्मान', 4: 'सौभाग्य', 5: 'शोभन', 6: 'अतिगण्ड',
  7: 'सुकर्मा', 8: 'धृति', 9: 'शूल', 10: 'गंड', 11: 'वृद्धि', 12: 'ध्रुव',
  13: 'व्याघात', 14: 'हर्षण', 15: 'वज्र', 16: 'सिद्धि', 17: 'व्यतिपात', 18: 'वरीयान',
  19: 'परिघ', 20: 'शिव', 21: 'सिद्ध', 22: 'सन्ध्या', 23: 'शुभ', 24: 'शुक्ल',
  25: 'ब्रह्म', 26: 'इंद्र', 27: 'वैधृति'
};

const KARANA_MAP = {
  1: 'बव', 2: 'बालव', 3: 'कौलव', 4: 'तैतिल', 5: 'गर', 6: 'वणिज', 7: 'विष्टि',
  8: 'शकुनि', 9: 'चतुष्पाद', 10: 'नाग', 11: 'किंस्तुघ्न्'
};

const VARA_MAP = {
  0: 'रवि', 1: 'सोम', 2: 'मंगल', 3: 'बुध', 4: 'गुरु', 5: 'शुक्र', 6: 'शनि'
};

const MONTH_MAP = {
  1: 'वैशाख', 2: 'जेष्ठ', 3: 'आषाढ़', 4: 'श्रावण', 5: 'भाद्रपद', 6: 'आश्विन',
  7: 'कार्तिक', 8: 'मार्गशीर्ष', 9: 'पौष', 10: 'माघ', 11: 'फाल्गुन', 12: 'चैत्र'
};

const NAMA_AKSHARA = {
  1: ['चू', 'चे', 'चो', 'ला'], 2: ['ली', 'लू', 'ले', 'लो'], 3: ['अ', 'इ', 'उ', 'ए'],
  4: ['ओ', 'वा', 'वी', 'वू'], 5: ['वे', 'वो', 'का', 'की'], 6: ['कू', 'घ', 'ङ', 'छ'],
  7: ['के', 'को', 'हा', 'ही'], 8: ['हू', 'हे', 'हो', 'डा'], 9: ['डी', 'डू', 'डे', 'डो'],
  10: ['मा', 'मी', 'मू', 'मे'], 11: ['मो', 'टा', 'टी', 'टू'], 12: ['टे', 'टो', 'पा', 'पी'],
  13: ['पू', 'ष', 'ण', 'ठ'], 14: ['पे', 'पो', 'रा', 'री'], 15: ['रू', 'रे', 'रो', 'ता'],
  16: ['ती', 'तू', 'ते', 'तो'], 17: ['ना', 'नी', 'नू', 'ने'], 18: ['नो', 'या', 'यी', 'यू'],
  19: ['ये', 'यो', 'भा', 'भी'], 20: ['भू', 'ध', 'फ', 'ढ'], 21: ['भे', 'भो', 'जा', 'जी'],
  22: ['खी', 'खू', 'खे', 'खो'], 23: ['गा', 'गी', 'गू', 'गे'], 24: ['गो', 'सा', 'सी', 'सू'],
  25: ['से', 'सो', 'दा', 'दी'], 26: ['दू', 'थ', 'झ', 'ञ'], 27: ['दे', 'दो', 'चा', 'ची']
};

const GANA_MAP = { 'Deva': 'देव', 'Manushya': 'मनुष्य', 'Rakshasa': 'राक्षस' };
const NADI_MAP = { 'Adi': 'आदि', 'Madhya': 'मध्य', 'Antya': 'अन्त्य' };
const VARNA_MAP = { 'Brahmana': 'ब्राह्मण', 'Kshatriya': 'क्षत्रिय', 'Vaishya': 'वैश्य', 'Shudra': 'शूद्र', 'Vipra': 'विप्र' };
const VASHYA_MAP = { 'Chatushpada': 'चतुष्पद', 'Manava': 'मानव', 'Jalachar': 'जलचर', 'Keeta': 'कीट', 'Vanchar': 'वनचर', 'Sarpa': 'सर्प' };
const YONI_MAP = {
  'Ashwa': 'अश्व', 'Gaja': 'गज', 'Mesha': 'मेष', 'Sarpa': 'सर्प', 'Shwan': 'श्वान',
  'Marjar': 'मार्जार', 'Mushak': 'मूषक', 'Gau': 'गौ', 'Mahish': 'महिष', 'Vyaghra': 'व्याघ्र',
  'Mrig': 'मृग', 'Deer': 'मृग', 'Vanar': 'वानर', 'Nakul': 'नकुल', 'Singha': 'सिंह'
};

const NATURAL_RULES = {
  1: { exalted: ['Sun'], debilitated: ['Saturn'] }, 2: { exalted: ['Moon'], debilitated: ['Ketu'] },
  3: { exalted: ['Rahu'], debilitated: ['Ketu'] }, 4: { exalted: ['Jupiter'], debilitated: ['Mars'] },
  6: { exalted: ['Mercury'], debilitated: ['Venus'] }, 7: { exalted: ['Saturn'], debilitated: ['Sun'] },
  8: { exalted: ['Ketu'], debilitated: ['Rahu'] }, 9: { exalted: ['Jupiter'], debilitated: ['Rahu'] },
  10: { exalted: ['Mars'], debilitated: [] }, 11: { exalted: ['Mercury'], debilitated: ['Ketu'] },
  12: { exalted: ['Venus'], debilitated: ['Mars'] }
};

// --- HELPER FUNCTIONS ---

const toNepaliNum = (num, decimals = 0) => {
  if (num === null || num === undefined || num === '') return '';
  const n = Number(num);
  if (isNaN(n)) return simpleTransliterate(String(num));

  const fixed = decimals > 0 ? n.toFixed(decimals) : Math.floor(Math.abs(n)).toString();
  const map = {
    '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
    '5': '५', '6': '६', '7': '७', '8': '८', '9': '९', '.': '.'
  };
  return fixed.split('').map(char => map[char] || char).join('');
};

const getNextTithi = (num) => {
  let next = (num % 30) + 1;
  return TITHI_MAP[next] || '_______';
};

const getNextNak = (num) => {
  let next = (num % 27) + 1;
  return NAKSHATRA_MAP[next] || '_______';
};

const getSankrantiDay = (dateAD) => {
  // Very rough approximation for Nepali calendar day within solar month
  // Ideally use a real AD to BS converter. 
  // For Nov 2, it's usually Kartik 17 in BS.
  const d = new Date(dateAD);
  const day = d.getDate();
  // Simple offset - not accurate for all months but better than constant
  return (day + 15) % 31 + 1;
};

const simpleTransliterate_placeholder = null; // Replaced by import

const deepFind = (obj, key) => {
  if (!obj) return undefined;
  if (obj[key] !== undefined) return obj[key];
  const searchPaths = ['kundaliData', 'kundliData', 'facts', 'analysis', 'basicInfo'];
  for (const path of searchPaths) {
    if (obj[path] && obj[path][key] !== undefined) return obj[path][key];
    if (obj[path] && typeof obj[path] === 'object') {
      const res = deepFind(obj[path], key);
      if (res !== undefined) return res;
    }
  }
  return undefined;
};


const getAyana = (month) => {
  // Rough estimate: Jan(1)-Jun(6) ~ Uttarayana, Jul(7)-Dec(12) ~ Dakshinayana (approx)
  // Or based on Solar ingress. Keeping simple for now based on Gregorian month.
  if (month >= 1 && month <= 6) return 'उत्तरायणे';
  return 'दक्षिणायने';
};

const getRitu = (month) => {
  if (month === 2 || month === 3) return 'वसंत';
  if (month === 4 || month === 5) return 'ग्रीष्म';
  if (month === 6 || month === 7) return 'वर्षा';
  if (month === 8 || month === 9) return 'शरद';
  if (month === 10 || month === 11) return 'हेमंत';
  return 'शिशिर';
};

const calculateGhatiPalaFromJD = (jdTime, jdSunrise) => {
  // 1 Julian Day = 60 Ghati
  let diff = jdTime - jdSunrise;
  // If event is mathematically before sunrise (negative diff), we assume it's part of the same cycle for display
  // or handle as previous day. But usually end times are > sunrise.
  if (diff < 0) diff += 1;

  const totalGhatis = diff * 60;
  const ghati = Math.floor(totalGhatis);
  const remainder = totalGhatis - ghati;
  const pala = Math.floor(remainder * 60);
  return { ghati, pala };
};

const VIMS_ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
const VIMS_DURATIONS = [7, 20, 6, 10, 7, 18, 16, 19, 17];
const VIMS_LABELS = {
  'Ketu': 'के', 'Venus': 'शु', 'Sun': 'आ', 'Moon': 'चं',
  'Mars': 'भौ', 'Rahu': 'रा', 'Jupiter': 'वृ', 'Saturn': 'श', 'Mercury': 'बु'
};

const renderVimsottariTable = (moonLon, birthYear) => {
  if (!moonLon || isNaN(moonLon)) return '<div style="text-align:center; color: #666; font-size: 14px; margin: 10px 0;">Moon Longitude Missing for Dasha calculation</div>';

  const nakIdx = Math.floor(moonLon / 13.3333333);
  const dashaIdx = nakIdx % 9;
  const elapsedFraction = (moonLon % 13.3333333) / 13.3333333;

  const dashaData = [];
  let runningYear = birthYear + VIMS_DURATIONS[dashaIdx] * (1 - elapsedFraction);

  for (let i = 0; i < 9; i++) {
    const idx = (dashaIdx + i) % 9;
    const planet = VIMS_ORDER[idx];
    const duration = VIMS_DURATIONS[idx];

    dashaData.push({
      planet: VIMS_LABELS[planet],
      duration: i === 0 ? (duration * (1 - elapsedFraction)).toFixed(1) : duration,
      endYear: Math.floor(runningYear)
    });

    if (i < 8) {
      const nextIdx = (dashaIdx + i + 1) % 9;
      runningYear += VIMS_DURATIONS[nextIdx];
    }
  }

  const row1 = `<td style="border: 1px solid #800000; padding: 4px; font-weight: bold; background:rgba(128,0,0,0.1); width: 60px;">ग्र.</td>` + dashaData.map(d => `<td style="border: 1px solid #800000; padding: 4px; font-weight: bold;">${d.planet}</td>`).join('');
  const row2 = `<td style="border: 1px solid #800000; padding: 4px; background:rgba(128,0,0,0.1);">वर्ष</td>` + dashaData.map(d => `<td style="border: 1px solid #800000; padding: 4px;">${toNepaliNum(d.duration, 1)}</td>`).join('');
  const row3 = `<td style="border: 1px solid #800000; padding: 4px; background:rgba(128,0,0,0.1);">जम्मा वर्ष</td>` + dashaData.map(d => `<td style="border: 1px solid #800000; padding: 4px;">${toNepaliNum(d.endYear)}</td>`).join('');

  return `
    <div style="margin-top: 15px; margin-bottom: 20px;">
      <div style="font-weight: bold; text-align: center; font-size: 18px; margin-bottom: 5px; color: #800000;">॥ विंशोत्तरीय महादशा चक्रम् ॥</div>
      <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 13px; border: 1.5px solid #800000; color: #800000;">
        <tr>${row1}</tr>
        <tr>${row2}</tr>
        <tr>${row3}</tr>
      </table>
    </div>
  `;
};

const renderTribhagiTable = (moonLon, birthYear) => {
  if (!moonLon || isNaN(moonLon)) return '';
  const nakIdx = Math.floor(moonLon / 13.3333333);
  const dashaIdx = nakIdx % 9;
  const elapsedFraction = (moonLon % 13.3333333) / 13.3333333;

  const dashaData = [];
  let runningTotalDays = (birthYear * 365.25) + (VIMS_DURATIONS[dashaIdx] / 3 * (1 - elapsedFraction) * 365.25);

  const getYM = (totalDays) => {
    const y = Math.floor(totalDays / 365.25);
    const m = Math.floor(((totalDays / 365.25) - y) * 12);
    return { y, m };
  };

  for (let i = 0; i < 9; i++) {
    const idx = (dashaIdx + i) % 9;
    const dur = VIMS_DURATIONS[idx] / 3;
    const balance = i === 0 ? dur * (1 - elapsedFraction) : dur;
    const { y: dy, m: dm } = getYM(balance * 365.25);
    const { y: ey, m: em } = getYM(runningTotalDays);

    dashaData.push({ planet: VIMS_LABELS[VIMS_ORDER[idx]], dy, dm, ey, em });
    if (i < 8) runningTotalDays += (VIMS_DURATIONS[(idx + 1) % 9] / 3) * 365.25;
  }

  const r1 = `<td style="border: 1px solid #800000; padding: 2px; background:rgba(128,0,0,0.1);">ग्र.</td>` + dashaData.map(d => `<td style="border: 1px solid #800000; padding: 2px;">${d.planet}</td>`).join('');
  const r2 = `<td style="border: 1px solid #800000; padding: 2px; background:rgba(128,0,0,0.1);">वर्ष</td>` + dashaData.map(d => `<td style="border: 1px solid #800000; padding: 2px;">${toNepaliNum(d.dy)}</td>`).join('');
  const r3 = `<td style="border: 1px solid #800000; padding: 2px; background:rgba(128,0,0,0.1);">मास</td>` + dashaData.map(d => `<td style="border: 1px solid #800000; padding: 2px;">${toNepaliNum(d.dm)}</td>`).join('');
  const r4 = `<td style="border: 1px solid #800000; padding: 2px; background:rgba(128,0,0,0.1);">जम्मा वर्ष</td>` + dashaData.map(d => `<td style="border: 1px solid #800000; padding: 2px;">${toNepaliNum(d.ey)}</td>`).join('');
  const r5 = `<td style="border: 1px solid #800000; padding: 2px; background:rgba(128,0,0,0.1);">मास</td>` + dashaData.map(d => `<td style="border: 1px solid #800000; padding: 2px;">${toNepaliNum(d.em)}</td>`).join('');

  return `
    <div style="margin-top: 15px;">
      <div style="font-weight: bold; text-align: center; font-size: 16px; margin-bottom: 5px; color: #800000;">॥ त्रिभागीय महादशा चक्रम् ॥</div>
      <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 12px; border: 1.5px solid #800000; color: #800000;">
        <tr>${r1}</tr><tr>${r2}</tr><tr>${r3}</tr><tr>${r4}</tr><tr>${r5}</tr>
      </table>
    </div>
  `;
};

const YOGINI_ORDER = ['मं', 'पिं', 'धा', 'भ्रा', 'भ', 'उ', 'सि', 'सं'];
const YOGINI_DURS = [1, 2, 3, 4, 5, 6, 7, 8];

const renderYoginiTable = (moonLon, birthYear) => {
  if (!moonLon || isNaN(moonLon)) return '';
  const nakIdx = Math.floor(moonLon / 13.3333333) + 1; // 1-27
  const yoginiIdx = (nakIdx + 3) % 8; // R=1 is Mangala (idx 0)
  const startIdx = (yoginiIdx === 0 ? 8 : yoginiIdx) - 1;
  const elapsedFraction = (moonLon % 13.3333333) / 13.3333333;

  const dashaData = [];
  let runningYear = birthYear + YOGINI_DURS[startIdx] * (1 - elapsedFraction);

  for (let i = 0; i < 8; i++) {
    const idx = (startIdx + i) % 8;
    const dur = YOGINI_DURS[idx];
    dashaData.push({ label: YOGINI_ORDER[idx], dur: i === 0 ? (dur * (1 - elapsedFraction)).toFixed(1) : dur, ey: Math.floor(runningYear) });
    if (i < 7) runningYear += YOGINI_DURS[(idx + 1) % 8];
  }

  const r1 = `<td style="border: 1px solid #800000; padding: 2px; background:rgba(128,0,0,0.1);">यो.</td>` + dashaData.map(d => `<td style="border: 1px solid #800000; padding: 2px;">${d.label}</td>`).join('');
  const r2 = `<td style="border: 1px solid #800000; padding: 2px; background:rgba(128,0,0,0.1);">वर्ष</td>` + dashaData.map(d => `<td style="border: 1px solid #800000; padding: 2px;">${toNepaliNum(d.dur, 1)}</td>`).join('');
  const r3 = `<td style="border: 1px solid #800000; padding: 2px; background:rgba(128,0,0,0.1);">वर्ष</td>` + dashaData.map(d => `<td style="border: 1px solid #800000; padding: 2px;">${toNepaliNum(d.ey)}</td>`).join('');

  return `
    <div style="margin-top: 15px;">
      <div style="font-weight: bold; text-align: center; font-size: 16px; margin-bottom: 5px; color: #800000;">॥ योगिनी महादशा चक्रम् ॥</div>
      <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 12px; border: 1.5px solid #800000; color: #800000;">
        <tr>${r1}</tr><tr>${r2}</tr><tr>${r3}</tr>
      </table>
    </div>
  `;
};

const renderSpashtaTable = (planets, ascendantDegree) => {
  const planetList = [
    { key: 'Sun', label: 'सू.' },
    { key: 'Moon', label: 'चं.' },
    { key: 'Mars', label: 'भौ.' },
    { key: 'Mercury', label: 'बु.' },
    { key: 'Jupiter', label: 'वृ.' },
    { key: 'Venus', label: 'शु.' },
    { key: 'Saturn', label: 'श.' },
    { key: 'Rahu', label: 'रा.' },
    { key: 'Ketu', label: 'के.' },
    { key: 'Asc', label: 'ल.' }
  ];

  const rows = {
    rashi: [],
    degree: [],
    minute: [],
    second: [],
    status: [],
    maitri: []
  };

  planetList.forEach(p => {
    let rawDeg = 0;
    let isRetro = false;
    let rasiNum = 1;

    if (p.key === 'Asc') {
      rawDeg = ascendantDegree || 0;
      rasiNum = Math.floor(rawDeg / 30) + 1;
    } else {
      const data = planets[p.key] || {};
      rawDeg = data.degree || 0;
      isRetro = data.isRetrograde || false;
      rasiNum = data.rasi || Math.floor(rawDeg / 30) + 1;
    }

    const degInRasi = rawDeg % 30;
    const deg = Math.floor(degInRasi);
    const totalSeconds = (degInRasi - deg) * 3600;
    const min = Math.floor(totalSeconds / 60);
    const sec = Math.round(totalSeconds % 60);

    rows.rashi.push(toNepaliNum(rasiNum));
    rows.degree.push(toNepaliNum(deg));
    rows.minute.push(toNepaliNum(min));
    rows.second.push(toNepaliNum(sec));
    rows.status.push(isRetro ? 'वक्र' : 'मार्गि');
    rows.maitri.push('---'); // Placeholder
  });

  const getRow = (label, dataArr) => {
    return `<tr><td style="border: 1px solid #800000; padding: 2px; background:rgba(128,0,0,0.1); font-weight:bold;">${label}</td>${dataArr.map(d => `<td style="border: 1px solid #800000; padding: 2px;">${d}</td>`).join('')}</tr>`;
  };

  return `
    <div style="margin-top: 15px; margin-bottom: 15px;">
      <div style="font-weight: bold; text-align: center; font-size: 18px; margin-bottom: 5px; color: #800000;">॥ एतत्समयजा ग्रहाणांस्पष्टा ॥</div>
      <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 13px; border: 1.5px solid #800000; color: #800000;">
        <tr>
          <td style="border: 1px solid #800000; padding: 2px; background:rgba(128,0,0,0.1); font-weight:bold;">ग्र.</td>
          ${planetList.map(p => `<td style="border: 1px solid #800000; padding: 2px; font-weight:bold;">${p.label}</td>`).join('')}
        </tr>
        ${getRow('रा.', rows.rashi)}
        ${getRow('अं.', rows.degree)}
        ${getRow('क.', rows.minute)}
        ${getRow('वि.', rows.second)}
        ${getRow('व.मा.', rows.status)}
        ${getRow('उ.अ.', rows.maitri)}
      </table>
    </div>
  `;
};

const renderNorthIndianChart = (houses, planets) => {
  // houses is an array of signs starting from 1st house [signH1, signH2, ... signH12]
  // planets is an object { PlanetName: { degree, rasi, house } }

  if (!houses || houses.length < 12) return '<div style="color:red">Chart Data Missing</div>';

  // 1. Define Geometry & Coordinates (migrated from DynamicKundliChart)
  // ViewBox: 0 0 400 266.6667

  const houseConfig = {
    1: { center: { x: 200, y: 88 }, sign: { x: 200, y: 120 }, d: "M 200,0 Q 200,36.3636 241.665,38.095 Q 283.33,39.8264 283.33,76.19 L 210 123.33 L 200 123.33 L 200 133.33 L 190 133.33 L 190 123.33 L 116.67 76.19 Q 116.67,39.8264 158.335,38.095 Q 200,36.3636 200,0 z" },
    2: { center: { x: 97, y: 42 }, sign: { x: 130, y: 25 }, d: "M 116.67,76.19 Q 116.67,39.8264 158.335,38.095 Q 200,36.3636 200,0 L 0, 0 z" },
    3: { center: { x: 58, y: 76 }, sign: { x: 40, y: 40 }, d: "M 0,133.33 Q 36.3636,133.33 58.335,104.76 Q 80.3064,76.19 116.67,76.19 L 0, 0 z" },
    4: { center: { x: 100, y: 133 }, sign: { x: 160, y: 133 }, d: "M 200,133.33 L 200,143.33 L 190,143.33 L 116.67,192 Q 80.3064,192 58.335,162.665 Q 36.3636,133.33 0,133.33 Q 36.3636,133.33 58.335,104.76 Q 80.3064,76.19 116.67,76.19 L 190,123.33 L 190,133.33 z" },
    5: { center: { x: 58, y: 190 }, sign: { x: 40, y: 226 }, d: "M 116.67,192 Q 80.3064,192 58.335,162.665 Q 36.3636,133.33 0,133.33 L 0, 266.67 z" },
    6: { center: { x: 97, y: 228 }, sign: { x: 130, y: 245 }, d: "M 200,266.67 Q 200,230.3064 158.335,229.335 Q 116.67,228.3636 116.67,192 L 0, 266.67 z" },
    7: { center: { x: 200, y: 178 }, sign: { x: 200, y: 146 }, d: "M 200,133.33 L 210,133.33 L 210,143.33 L 283.33,192 Q 283.33,228.3636 241.665,229.335 Q 200,230.3064 200,266.67 Q 200,230.3064 158.335,229.335 Q 116.67,228.3636 116.67,192 L 190,143.33 L 200,143.33 z" },
    8: { center: { x: 304, y: 228 }, sign: { x: 270, y: 245 }, d: "M 283.33,192 Q 283.33,228.3636 241.665,229.335 Q 200,230.3064 200,266.67 L 400, 266.67 z" },
    9: { center: { x: 341, y: 190 }, sign: { x: 360, y: 226 }, d: "M 400,133.33 Q 363.6364,133.33 341.665,162.665 Q 319.6936,192 283.33,192 L 400, 266.67 z" },
    10: { center: { x: 300, y: 133 }, sign: { x: 240, y: 133 }, d: "M 283.33 76.19 Q 319.6936,76.19 341.665,104.76 Q 363.6364,133.33 400,133.33 Q 363.6364,133.33 341.665,162.665 Q 319.6936,192 283.33,192 L 210,143.33 L 210,133.33 L 200 133.33 L 200 123.33 L 210 123.33 z" },
    11: { center: { x: 341, y: 76 }, sign: { x: 360, y: 40 }, d: "M 283.33,76.19 Q 319.6936,76.19 341.665,104.76 Q 363.6364,133.33 400,133.33 L 400, 0 z" },
    12: { center: { x: 304, y: 42 }, sign: { x: 270, y: 25 }, d: "M 200,0 Q 200,36.3636 241.665,38.095 Q 283.33,39.8264 283.33,76.19 L 400, 0 z" }
  };

  // 2. Map Planets to Houses
  const planetLabels = {
    'Sun': 'सू', 'Moon': 'चं', 'Mars': 'मं', 'Mercury': 'बु',
    'Jupiter': 'गु', 'Venus': 'शु', 'Saturn': 'श', 'Rahu': 'रा', 'Ketu': 'के',
    // Support English inputs just in case
    'Su': 'सू', 'Mo': 'चं', 'Ma': 'मं', 'Me': 'बु', 'Ju': 'गु', 'Ve': 'शु', 'Sa': 'श', 'Ra': 'रा', 'Ke': 'के'
  };

  const houseContent = Array(13).fill(null).map(() => []); // 1-12 index

  Object.entries(planets).forEach(([name, data]) => {
    // If name is Ascendant/Lagna, skip (or handle if desired)
    if (name === 'Ascendant' || name === 'Lagna') return;

    // Use mapped short label or first 2 chars
    const label = planetLabels[name] || planetLabels[name.substring(0, 2)] || name.substring(0, 2);

    // Check Retrograde
    const isRetro = data.isRetro || data.isRetrograde;
    const finalLabel = label + (isRetro ? '(व)' : ''); // 'व' for Vakri/Retro

    const hIdx = data.house || 1;
    if (hIdx >= 1 && hIdx <= 12) {
      houseContent[hIdx].push({ ...data, label: finalLabel });
    }
  });

  // 3. Render SVG
  // Style: Maroon (#800000) mainly to match PDF.
  // We use the new geometry but keep the transparent/paper background.

  let pathsSvg = '';
  let signsSvg = '';
  let planetsSvg = '';

  for (let i = 1; i <= 12; i++) {
    const cfg = houseConfig[i];

    // Path
    pathsSvg += `<path d="${cfg.d}" fill="none" stroke="#800000" stroke-width="1.5" />`;

    // Sign Number
    const signNum = toNepaliNum(houses[i - 1]);
    signsSvg += `<text x="${cfg.sign.x}" y="${cfg.sign.y}" text-anchor="middle" dominant-baseline="middle" font-family="'Yatra One', cursive" font-size="12" font-weight="bold" fill="#800000" opacity="0.8">${signNum}</text>`;

    // Planets
    const planetsInHouse = houseContent[i];
    if (planetsInHouse.length > 0) {
      planetsInHouse.forEach((p, idx) => {
        // Stack vertically centered
        const yOffset = (idx - (planetsInHouse.length - 1) / 2) * 14;
        planetsSvg += `<text x="${cfg.center.x}" y="${cfg.center.y + yOffset}" text-anchor="middle" dominant-baseline="middle" font-family="'Yatra One', cursive" font-size="13" font-weight="bold" fill="#800000">${p.label}</text>`;
      });
    }
  }

  // Add Center Cross Lines manually (as in DynamicKundliChart)
  const crossLines = `
    <line x1="190" y1="133.33" x2="210" y2="133.33" stroke="#800000" stroke-width="1.5" />
    <line x1="200" y1="123.33" x2="200" y2="143.33" stroke="#800000" stroke-width="1.5" />
  `;

  // Scale down for PDF container if needed, or rely on container size.
  // Original ViewBox is 400 wide. We width="250" in PDF.

  return `
    <svg width="250" height="166" viewBox="0 0 400 266.6667" style="display: block; margin: 0 auto; overflow: visible;">
      <rect x="0" y="0" width="400" height="266.6667" fill="none" stroke="#800000" stroke-width="2" />
      ${pathsSvg}
      ${crossLines}
      ${signsSvg}
      ${planetsSvg}
    </svg>
  `;
};

// --- MAIN GENERATOR FUNCTION ---

export const generateTraditionalKundliPDF = async (kundli, mode = 'download') => {
  try {
    // 0. Ensure Swiss Ephemeris is initialized
    await kundaliService.initialize();
    console.log("Generating Traditional PDF for:", kundli.name);

    // Extract & Calculate Data
    const fullData = kundli;

    // Look for avakahada in multiple possible nests
    let avakahada = deepFind(fullData, 'avakahada') || {};
    console.log("PDF: avakahada keys:", Object.keys(avakahada));

    // Look for panchang in multiple possible nests
    let panchang = deepFind(fullData, 'panchanga') || {};
    console.log("PDF: panchang keys:", Object.keys(panchang));

    // 0. Recalculate Panchang on the fly
    const birthDateTime = DateTime.fromObject({
      year: kundli.birth_year,
      month: kundli.birth_month,
      day: kundli.birth_day,
      hour: kundli.birth_hour,
      minute: kundli.birth_minute
    }, { zone: kundli.timezoneName || 'Asia/Kathmandu' });

    const lat = kundli.birth_latitude || 27.7172;
    const lon = kundli.birth_longitude || 85.3240;

    // Deep merge calculation with stored data
    const storedPanchang = deepFind(fullData, 'panchanga') || {};
    try {
      // Fix: getPanchanga expects (dt, longitude, latitude)
      const calculatedPanchang = getPanchanga(birthDateTime, lon, lat);
      panchang = { ...storedPanchang, ...calculatedPanchang };
      console.log("Panchang merged: calculated + stored");
    } catch (e) {
      console.error("Panchang Calc Failed, using stored only:", e);
      panchang = storedPanchang;
    }

    console.log("PDF: Final Panchang keys:", Object.keys(panchang));
    console.log("PDF: Avakahada Yoni:", avakahada.yoni);
    console.log("PDF: Avakahada Gana:", avakahada.gana);

    // Prepare Variables
    const vikramSamvat = toNepaliNum(kundli.birth_year + 57);
    const shakaSamvat = toNepaliNum(kundli.birth_year - 78);
    const samvatsaraName = panchang.samvatsara?.name?.hindi || panchang.samvatsara?.name || panchang.samvatsara || '__________';

    const ayana = getAyana(kundli.birth_month);
    const ritu = getRitu(kundli.birth_month);

    // Masa (Month) - Use Lunar month from Panchang if possible, else map Gregorian
    const masaName = panchang.masa?.name?.hindi || MONTH_MAP[kundli.birth_month] || '_______';

    const paksha = panchang.tithi?.paksha_name === 'Shukla' || panchang.tithi?.paksha === 'Shukla' || panchang.tithi?.paksh === 'Shukla' ? 'शुक्ल' : 'कृष्ण';
    const vasara = VARA_MAP[panchang.vara?.num] || VARA_MAP[birthDateTime.weekday % 7] || '_______';

    const tithiVal = panchang.tithi?.name?.hindi || panchang.tithi?.num || panchang.tithi;
    const tithiName = TITHI_MAP[tithiVal] || (typeof tithiVal === 'string' ? simpleTransliterate(tithiVal) : '_______');

    // Tithi ending time (Ghati/Pala)
    let tithiGhati = '____', tithiPala = '____';
    let sunriseJD = panchang.sunrise?.jd || panchang.sunrise;
    console.log("PDF: Initial sunriseJD:", sunriseJD);

    // Fix for case where sunrise is a string time (like "06:15 AM")
    if (typeof sunriseJD === 'string' && sunriseJD.includes(':')) {
      console.log("PDF: Converting string sunrise:", sunriseJD);
      const [h, m] = sunriseJD.replace(/[APM ]/g, '').split(':').map(Number);
      const hourOffset = sunriseJD.includes('PM') && h < 12 ? h + 12 : (sunriseJD.includes('AM') && h === 12 ? 0 : h);
      const sunriseDT = birthDateTime.startOf('day').set({ hour: hourOffset, minute: m });
      sunriseJD = sunriseDT.toMillis() / 86400000 + 2440587.5;
    }

    if (!sunriseJD || isNaN(sunriseJD)) {
      console.log("PDF: Sunrise missing or NaN, estimating 6:00 AM");
      const sunriseDT = birthDateTime.startOf('day').set({ hour: 6, minute: 0 });
      sunriseJD = sunriseDT.toMillis() / 86400000 + 2440587.5;
    }
    console.log("PDF: Final sunriseJD used:", sunriseJD);

    if (panchang.tithi?.end?.jd && sunriseJD && !isNaN(sunriseJD)) {
      const { ghati, pala } = calculateGhatiPalaFromJD(panchang.tithi.end.jd, sunriseJD);
      tithiGhati = toNepaliNum(ghati);
      tithiPala = toNepaliNum(pala);
    }

    const nakVal = panchang.nakshatra?.name?.hindi || panchang.nakshatra?.nakshatra_num || panchang.nakshatra;
    const nakName = NAKSHATRA_MAP[nakVal] || (typeof nakVal === 'string' ? simpleTransliterate(nakVal) : '_______');
    let nakGhati = '____', nakPala = '____';
    if (panchang.nakshatra?.end?.jd && sunriseJD) {
      const { ghati, pala } = calculateGhatiPalaFromJD(panchang.nakshatra.end.jd, sunriseJD);
      nakGhati = toNepaliNum(ghati);
      nakPala = toNepaliNum(pala);
    }

    // Birth Time in Ghati/Pala (Ishtakal)
    let birthGhati = '____', birthPala = '____';
    if (sunriseJD && !isNaN(sunriseJD)) {
      const birthGhatiCalc = calculateGhatiPalaFromJD(birthDateTime.toMillis() / 86400000 + 2440587.5, sunriseJD);
      birthGhati = toNepaliNum(birthGhatiCalc.ghati);
      birthPala = toNepaliNum(birthGhatiCalc.pala);
    }

    const yogaVal = panchang.yoga?.name?.hindi || panchang.yoga?.yoga_num || panchang.yoga;
    const yogaName = YOGA_MAP[yogaVal] || (typeof yogaVal === 'string' ? simpleTransliterate(yogaVal) : '_______');
    const karanaVal = panchang.karana?.name?.hindi || panchang.karana?.num || panchang.karana;
    const karanaName = KARANA_MAP[karanaVal] || (typeof karanaVal === 'string' ? simpleTransliterate(karanaVal) : '_______');

    const sunSankrantiDay = toNepaliNum(getSankrantiDay(kundli.birth_date || `${kundli.birth_year}-${kundli.birth_month}-${kundli.birth_day}`));

    // Use BS Date Conversion for Tarikha and Masa
    let nepaliDate = toNepaliNum(kundli.birth_day);
    let nepaliMonth = masaName;
    try {
      // Import or use dynamic logic for AD to BS
      // We know ad-bs-date-conversion is in package.json.
      // For now, let's try a very stable fallback if formatToNepaliDate fails
      const npDateStr = formatToNepaliDate(birthDateTime);
      if (npDateStr && npDateStr.includes('/')) {
        const parts = npDateStr.split('/');
        nepaliDate = parts[2] || toNepaliNum(kundli.birth_day);
        // Month: If it's something like 2054/08/17, 08 is Kartika.
        const bsMonthIdx = parseInt(parts[1]);
        if (!isNaN(bsMonthIdx)) {
          nepaliMonth = MONTH_MAP[bsMonthIdx] || masaName;
        }
      }
    } catch (e) {
      console.log("Nepali Date Calc failed, using fallbacks");
    }

    const nextTithiNum = (panchang.tithi?.num || 1) % 30 + 1;
    const nextTithi = TITHI_MAP[nextTithiNum] || '_______';
    const nextNakNum = (panchang.nakshatra?.nakshatra_num || 1) % 27 + 1;
    const nextNak = NAKSHATRA_MAP[nextNakNum] || '_______';

    const birthYearAD = toNepaliNum(kundli.birth_year);
    const birthHour = toNepaliNum(kundli.birth_hour > 12 ? kundli.birth_hour - 12 : kundli.birth_hour);
    const birthMin = toNepaliNum(kundli.birth_minute);
    const birthSec = toNepaliNum(kundli.birth_second || 0);

    // Calculate Lagna and Navamsha accurately
    // Resolve 'swe' from global/window
    // @ts-ignore
    const swe = typeof window !== 'undefined' ? window.swe : global.swe;

    let lagna = '_______', navamsha = '_______';
    let houses = { ascmc: [0] }; // Default in case swe is not available
    if (swe && sunriseJD) {
      const jd_ut = birthDateTime.toUTC().toMillis() / 86400000 + 2440587.5;
      houses = swe.swe_houses(jd_ut, lat, lon, "P");
      const ascDegree = houses.ascmc[0];
      lagna = RASHI_MAP[Math.floor(ascDegree / 30) + 1];

      // Navamsha of Moon
      const moon_lon = panchang.moon_lon || 0; // Assume we have it or can fallback
      const navDegree = (moon_lon * 9) % 360;
      navamsha = RASHI_MAP[Math.floor(navDegree / 30) + 1];
    }

    const lagnaHouses = Array.from({ length: 12 }, (_, i) => {
      const startSign = Math.floor(houses.ascmc[0] / 30) + 1;
      return (startSign + i - 1) % 12 + 1;
    });

    const navamshaHouses = Array.from({ length: 12 }, (_, i) => {
      // Simplification: Navamsha chart usually starts with the Navamsha sign of Ascendant
      const ascNavDegree = (houses.ascmc[0] * 9) % 360;
      const startSign = Math.floor(ascNavDegree / 30) + 1;
      return (startSign + i - 1) % 12 + 1;
    });

    // Helper to map planets to house index for a specific chart
    const getPlanetHouseMap = (planetData, houseSigns) => {
      const map = {};
      Object.entries(planetData).forEach(([name, data]) => {
        const sign = data.rasi || Math.floor(data.degree / 30) + 1;
        // Find which house this sign corresponds to in the current chart's houseSigns array
        const houseIdx = houseSigns.indexOf(sign);
        map[name] = { ...data, house: houseIdx + 1 }; // house is 1-indexed
      });
      return map;
    };

    const lagnaPlanets = getPlanetHouseMap(deepFind(fullData, 'planets') || {}, lagnaHouses);
    const navPlanets = fullData.divisionalCharts?.D9?.planets || getPlanetHouseMap(deepFind(fullData, 'planets') || {}, navamshaHouses);

    const lagnaChartHtml = renderNorthIndianChart(lagnaHouses, lagnaPlanets);
    const navChartHtml = renderNorthIndianChart(navamshaHouses, navPlanets);

    const moonRashiNum = panchang.moon_rashi?.rasi_num || panchang.moon_rashi?.num;
    const moonRashi = panchang.moon_rashi?.name?.hindi || RASHI_MAP[moonRashiNum] || panchang.moon_rashi || '_______';

    const charan = avakahada.pada || avakahada.charan || 1;
    const nakIndex = panchang.nakshatra?.nakshatra_num || 1;
    const nameSyllable = NAMA_AKSHARA[nakIndex] ? NAMA_AKSHARA[nakIndex][charan - 1] : '_______';

    const bi = kundli.basicInfo || {};
    const extract = (keys) => {
      // Helper to check validity (must be non-empty string/number)
      const isValid = (val) => val !== undefined && val !== null && String(val).trim().length > 0;

      // 1. Direct check on root and basicInfo
      for (const k of keys) {
        if (isValid(kundli[k])) return kundli[k];
        if (isValid(bi[k])) return bi[k];
      }

      // 2. Deep check in known nested containers (database JSON columns)
      const containers = [
        kundli.kundli_data,
        kundli.data?.kundliData,
        kundli.astrological_profile,
        kundli.data,
        kundli
      ];

      for (const container of containers) {
        if (!container) continue;
        for (const k of keys) {
          if (isValid(container[k])) return container[k];
          if (container.basicInfo && isValid(container.basicInfo[k])) return container.basicInfo[k];
        }
      }

      return '';
    };

    let rawPlace = extract(['birth_place', 'city', 'place', 'City']) || '';
    if (rawPlace && typeof rawPlace === 'string') {
      // Split by comma first
      const parts = rawPlace.split(',').map(s => s.trim()).filter(s => s);

      if (parts.length >= 3) {
        // If "Municipality, District, Country", take only "District, Country"
        // This drops the specific municipality name entirely as requested
        rawPlace = `${parts[parts.length - 2]}, ${parts[parts.length - 1]}`;
      } else {
        // If just "City, Country", keep it. 
        // Clean up any lingering keywords if present (optional but safe)
        rawPlace = parts.join(', ').replace(/Municipality|Rural|Muni\.|Sub-Metropolitan|Metropolitan/gi, '').trim();
      }
    }
    const place = bi.placeNp || bi.cityNp || simpleTransliterate(rawPlace) || '_______';
    const gotra = bi.gotraNp || simpleTransliterate(extract(['gotra', 'Gotra']) || '') || '_______';
    const fatherName = bi.fatherNameNp || simpleTransliterate(extract(['father_name', 'fatherName', 'FatherName']) || '') || '_______';
    const motherName = bi.motherNameNp || simpleTransliterate(extract(['mother_name', 'motherName', 'MotherName']) || '') || '_______';
    const nawranName = bi.nawranNameNp || simpleTransliterate(extract(['nawran_name', 'nawranName']) || '') || '_______';
    const formalName = bi.nameNp || simpleTransliterate(extract(['name', 'Name']) || '') || '_______';

    const genderTerm = (kundli.gender?.toLowerCase() === 'female' || bi.gender?.toLowerCase() === 'female') ? 'पुत्री' : 'पुत्र';

    const yoniNp = YONI_MAP[avakahada.yoni] || simpleTransliterate(avakahada.yoni) || avakahada.yoni || '_______';
    const ganaNp = GANA_MAP[avakahada.gana || avakahada.gan] || simpleTransliterate(avakahada.gana || avakahada.gan) || (avakahada.gana || avakahada.gan) || '_______';
    const nadiNp = NADI_MAP[avakahada.nadi] || simpleTransliterate(avakahada.nadi) || avakahada.nadi || '_______';
    const vashyaNp = VASHYA_MAP[avakahada.vashya] || simpleTransliterate(avakahada.vashya) || avakahada.vashya || '_______';
    const varnaNp = VARNA_MAP[avakahada.varna] || simpleTransliterate(avakahada.varna) || avakahada.varna || '_______';

    // DYNAMIC TEXT TEMPLATE - SPLIT INTO PAGES
    const page1Html = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Yatra+One&display=swap');
      </style>
      <div id="pdf-page-1" style="
        font-family: 'Yatra One', cursive;
        width: 800px;
        height: 1131px;
        padding: 85px 70px 0 70px;
        background: url('/traditional_bg_1.jpg') no-repeat center center;
        background-size: cover;
        color: black;
        line-height: 1.8;
        font-size: 16px;
        font-weight: bold;
        text-align: justify;
        box-sizing: border-box;
        position: relative;
      ">
        <!-- Traditional Swastika Icon Border -->
        <div style="position: absolute; inset: 10px; pointer-events: none; z-index: 50;">
          <!-- Top -->
          <div style="position: absolute; top: 0; left: 0; right: 0; height: 24px; background: url('/swastika_icon.png') repeat-x; background-size: 24px; filter: invert(19%) sepia(91%) saturate(3190%) hue-rotate(348deg) brightness(86%) contrast(92%);"></div>
          <!-- Bottom -->
          <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 24px; background: url('/swastika_icon.png') repeat-x; background-size: 24px; filter: invert(19%) sepia(91%) saturate(3190%) hue-rotate(348deg) brightness(86%) contrast(92%);"></div>
          <!-- Left -->
          <div style="position: absolute; top: 24px; bottom: 24px; left: 0; width: 24px; background: url('/swastika_icon.png') repeat-y; background-size: 24px; filter: invert(19%) sepia(91%) saturate(3190%) hue-rotate(348deg) brightness(86%) contrast(92%);"></div>
          <!-- Right -->
          <div style="position: absolute; top: 24px; bottom: 24px; right: 0; width: 24px; background: url('/swastika_icon.png') repeat-y; background-size: 24px; filter: invert(19%) sepia(91%) saturate(3190%) hue-rotate(348deg) brightness(86%) contrast(92%);"></div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; margin-top: 0; line-height: 1;">
          <img src="/topbg.png" style="width: 65%; height: auto; display: block;" />
          <div style="text-align: center; margin-top: -10px; color: #c52c17;">
            <div style="font-weight: bold; font-size: 20px;">श्री मन्मङ्गलमूर्तय नमः ॥</div>
            <div style="font-weight: bold; font-size: 20px;">श्री सरस्वत्यै नमः ॥</div><br>
          </div>
        </div>

        <div style="text-align: center; margin-bottom: 15px; font-style: italic; font-size: 14px; line-height: 1.6; color: #c52c17;">
          आदित्यादिग्रहाः सर्वे सनक्षत्राः सराशय: ।<br/>
          दीर्घमायुः प्रयच्छन्तु यस्यैषा जन्मपत्रिका ॥१॥<br/>
          ब्रह्मा करोतु दीर्घायु विष्णु कुर्याच्च सम्पदम् ।<br/>
          हरो रक्षतु गात्राणि यस्यैषा जन्मपत्रिका ॥२॥<br/>
          उमा, गौरी, शिवा, दुर्गा, भद्रा, भगवती तथा ।<br/>
          कुलदेव्याथ, चामण्डा रक्षतां बालकः सदा ||३||
        </div>

        <div style="margin-bottom: 15px;">
          श्री शालिवाहनीयशाके <strong style="color: #c52c17;">${shakaSamvat}</strong> विक्रमादित्यसवत् <strong style="color: #c52c17;">${vikramSamvat}</strong> सौरमानेन <strong style="color: #c52c17;">${samvatsaraName}</strong> नाम संवत्सरे श्रीसूर्ये <strong style="color: #c52c17;">${ayana}</strong> <strong style="color: #c52c17;">${ritu}</strong> ऋतु <strong style="color: #c52c17;">${masaName}</strong>
          मासे <strong style="color: #c52c17;">${paksha}</strong> पक्षे <strong style="color: #c52c17;">${vasara}</strong> वासरे <strong style="color: #c52c17;">${tithiName}</strong> तिथौ <strong style="color: #c52c17;">${tithiGhati}</strong> घटी <strong style="color: #c52c17;">${tithiPala}</strong> पलानि तत <strong style="color: #c52c17;">${nextTithi}</strong> तिथौ <strong style="color: #c52c17;">${nakName}</strong> नक्षत्रे <strong style="color: #c52c17;">${nakGhati}</strong> घटी <strong style="color: #c52c17;">${nakPala}</strong> पलानि तत <strong style="color: #c52c17;">${nextNak}</strong> नक्षत्रस्य जन्मसमये
          <strong style="color: #c52c17;">${birthGhati}</strong> घटी <strong style="color: #c52c17;">${birthPala}</strong> पलानि तत <strong style="color: #c52c17;">${yogaName}</strong> योगे <strong style="color: #c52c17;">${karanaName}</strong> करणे जन्मेति पञ्चाङ्ग सौरमानेन <strong style="color: #c52c17;">${masaName}</strong> मासे सूर्यसंक्रमाद् दिनगता <strong style="color: #c52c17;">${sunSankrantiDay}</strong> तदनुसार <strong style="color: #c52c17;">${nepaliDate}</strong> तारिका <strong style="color: #c52c17;">${nepaliMonth}</strong> 
          मास सन <strong style="color: #c52c17;">${birthYearAD}</strong> अत्र <strong style="color: #c52c17;">${vasara}</strong> वासरे सूर्योदय दिष्ट <strong style="color: #c52c17;">${birthGhati}</strong> घटी <strong style="color: #c52c17;">${birthPala}</strong> पलानि <strong style="color: #c52c17;">${birthHour}</strong> घण्टा <strong style="color: #c52c17;">${birthMin}</strong> मिनेट <strong style="color: #c52c17;">${birthSec}</strong> तदा जन्मसन् <strong style="color: #c52c17;">${lagna}</strong> लग्नोदये <strong style="color: #c52c17;">${navamsha}</strong> नवमांशे <strong style="color: #c52c17;">${moonRashi}</strong>
          राशिगते चन्द्रमसि एब विधेपञ्चाङ्ग शुद्धेशुभ पुण्यदिने शुभमूहूर्तबेलाया श्रीमद् ब्रम्हा धारणात्मके भूगोलैक देशे भारतवर्षे भरतखण्डे जम्बू आर्यावर्तान्तर्गत हिमवतो 
          दक्षिण पार्श्वे नेपाल देसो <strong style="color: #c52c17;">${place}</strong> स्थाने निवसतः सकलमनोर स्वःकुलदीपक सद्गुणालंकृत <strong style="color: #c52c17;">${gotra}</strong> गोत्रोत्पन्नस्य श्री <strong style="color: #c52c17;">${fatherName}</strong> तस्य पाणिगृहीताया धर्मपत्न श्रीमत्याह
          <strong style="color: #c52c17;">${motherName}</strong> देव्याः सुवर्णमयकुक्षौ <strong style="color: #c52c17;">${genderTerm}</strong> गर्भा <strong style="color: #c52c17;">${genderTerm}</strong> रत्नमजीजनत् । असय होराशास्त्रप्रमाणेन <strong style="color: #c52c17;">${nakName}</strong> नक्षत्र <strong style="color: #c52c17;">${toNepaliNum(charan)}</strong> चरणत्वेन <strong style="color: #c52c17;">${nameSyllable}</strong> काराक्षरस्य <strong style="color: #c52c17;">${yoniNp}</strong> योनिः
          <strong style="color: #c52c17;">${ganaNp}</strong> गणः <strong style="color: #c52c17;">${nadiNp}</strong> नाडी <strong style="color: #c52c17;">${vashyaNp}</strong> वर्ग <strong style="color: #c52c17;">${varnaNp}</strong> वर्णात्मक श्री <strong style="color: #c52c17;">${nawranName}</strong> चिरञ्जीवतु शुभनाम देवद्विजाशिर्वादैः दीर्घमायूर्भूयात्
        </div>

        ${renderSpashtaTable(deepFind(fullData, 'planets') || {}, houses.ascmc[0])}
      </div>
    `;

    const page2Html = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Yatra+One&display=swap');
      </style>
      <div id="pdf-page-2" style="
        font-family: 'Yatra One', cursive;
        width: 800px;
        height: 1131px;
        padding: 50px 70px;
        background: url('/traditional_bg_1.jpg') no-repeat center center;
        background-size: cover;
        color: black;
        line-height: 1.8;
        font-size: 16px;
        font-weight: bold;
        box-sizing: border-box;
        position: relative;
      ">
        <!-- Traditional Swastika Icon Border -->
        <div style="position: absolute; inset: 10px; pointer-events: none; z-index: 50;">
          <!-- Top -->
          <div style="position: absolute; top: 0; left: 0; right: 0; height: 24px; background: url('/swastika_icon.png') repeat-x; background-size: 24px; filter: invert(19%) sepia(91%) saturate(3190%) hue-rotate(348deg) brightness(86%) contrast(92%);"></div>
          <!-- Bottom -->
          <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 24px; background: url('/swastika_icon.png') repeat-x; background-size: 24px; filter: invert(19%) sepia(91%) saturate(3190%) hue-rotate(348deg) brightness(86%) contrast(92%);"></div>
          <!-- Left -->
          <div style="position: absolute; top: 24px; bottom: 24px; left: 0; width: 24px; background: url('/swastika_icon.png') repeat-y; background-size: 24px; filter: invert(19%) sepia(91%) saturate(3190%) hue-rotate(348deg) brightness(86%) contrast(92%);"></div>
          <!-- Right -->
          <div style="position: absolute; top: 24px; bottom: 24px; right: 0; width: 24px; background: url('/swastika_icon.png') repeat-y; background-size: 24px; filter: invert(19%) sepia(91%) saturate(3190%) hue-rotate(348deg) brightness(86%) contrast(92%);"></div>
        </div>
        <div style="display: flex; justify-content: space-around; margin-bottom: 25px; margin-top: 20px;">
           <div>
              <div style="font-weight: bold; text-align: center; margin-bottom:10px; color: #800000;">॥ लग्न कुण्डली ॥</div>
              ${lagnaChartHtml}
           </div>
           <div>
              <div style="font-weight: bold; text-align: center; margin-bottom:10px; color: #800000;">॥ नवांश कुण्डली ॥</div>
              ${navChartHtml}
           </div>
        </div>

        ${renderVimsottariTable(panchang.moon_lon || (deepFind(fullData, 'planets')?.Moon?.degree), (parseInt(kundli.birth_year) || 0) + 57)}
        ${renderTribhagiTable(panchang.moon_lon || (deepFind(fullData, 'planets')?.Moon?.degree), (parseInt(kundli.birth_year) || 0) + 57)}
        ${renderYoginiTable(panchang.moon_lon || (deepFind(fullData, 'planets')?.Moon?.degree), (parseInt(kundli.birth_year) || 0) + 57)}
      </div>
    `;

    // --- PAGE 3: PLANETARY ANALYSIS ---
    // Extract planet details properly
    const planetDetails = deepFind(fullData, 'planets') || {};
    const shadbala = deepFind(fullData, 'shadbala') || {};

    const NP_PLANETS = {
      'Sun': 'सूर्य', 'Moon': 'चन्द्र', 'Mars': 'मंगल', 'Mercury': 'बुध',
      'Jupiter': 'बृहस्पति', 'Venus': 'शुक्र', 'Saturn': 'शनि', 'Rahu': 'राहु', 'Ketu': 'केतु'
    };

    const NP_SIGNS = {
      'Aries': 'मेष', 'Taurus': 'वृषभ', 'Gemini': 'मिथुन', 'Cancer': 'कर्क',
      'Leo': 'सिंह', 'Virgo': 'कन्या', 'Libra': 'तुला', 'Scorpio': 'वृश्चिक',
      'Sagittarius': 'धनु', 'Capricorn': 'मकर', 'Aquarius': 'कुंभ', 'Pisces': 'मीन'
    };

    // Check if we have enough data to render analysis
    // Check if we have enough data to render analysis
    const renderPlanetCard = (planetName) => {
      const pInfo = planetDetails[planetName];
      if (!pInfo) return '';

      const houseNum = pInfo.house;
      const houseInfo = houseNum ? HouseDetails[houseNum] : null;
      const remedyInfo = houseNum ? PlanetaryData[planetName]?.[String(houseNum)] : null;
      if (!houseInfo || !remedyInfo) return '';

      // Logic from AIKundliAnalysis
      const rules = houseNum ? NATURAL_RULES[houseNum] : null;
      let naturalStatus = null;
      if (rules?.exalted.includes(planetName)) naturalStatus = 'exalted';
      if (rules?.debilitated.includes(planetName)) naturalStatus = 'debilitated';

      let baseStrength = 62;
      const shad = shadbala?.[planetName];
      if (shad && shad.required > 0) {
        baseStrength = Math.round((shad.total / shad.required) * 100);
      }
      if (naturalStatus === 'exalted') baseStrength += 19;
      if (naturalStatus === 'debilitated') baseStrength -= 21;
      const variance = (planetName.length * 3 + houseNum * 7) % 9;
      const strengthPct = Math.min(98, Math.max(12, baseStrength + variance - 4));
      const challengesPct = 100 - strengthPct;

      const pNameNp = NP_PLANETS[planetName] || planetName;
      const signName = pInfo.sign || '';
      const signNp = NP_SIGNS[signName] || NP_SIGNS[signName.charAt(0).toUpperCase() + signName.slice(1).toLowerCase()] || simpleTransliterate(signName) || signName;

      const houseNumNp = toNepaliNum(houseNum);
      const akaNp = houseInfo.akaNp || houseInfo.aka;
      const descriptionNp = houseInfo.descriptionNp || houseInfo.description;
      const goodNp = remedyInfo.goodNp || remedyInfo.good;
      const badNp = remedyInfo.badNp || remedyInfo.bad;
      const foundationSign = NP_SIGNS[houseInfo.naturalSign] || houseInfo.naturalSign;
      const placementRule = houseInfo.exaltationDetailNp || houseInfo.exaltationDetail;

      const meaningText = (goodNp || "शुभ फल").split('।')[0];

      return `
        <div style="font-family: 'Mukta', sans-serif; border: 1px solid rgba(128,0,0,0.2); background: rgba(255,255,255,0.6); border-radius: 6px; padding: 6px; margin-bottom: 0; page-break-inside: avoid;">
           <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(128,0,0,0.1); padding-bottom: 3px; margin-bottom: 4px;">
              <div>
                <span style="font-weight: 800; font-size: 14px; text-transform: uppercase; color: #000;">${pNameNp}</span>
                <span style="font-size: 10px; color: #444; margin-left: 5px; font-weight: 600;">भाव ${houseNumNp} • ${signNp}</span>
              </div>
              <div>
                 ${naturalStatus === 'exalted' ? '<span style="background: rgba(0,128,0,0.1); color: green; font-size: 9px; padding: 1px 4px; border-radius: 3px; border: 1px solid green; font-weight: 700;">उच्च</span>' : ''}
                 ${naturalStatus === 'debilitated' ? '<span style="background: rgba(255,0,0,0.1); color: red; font-size: 9px; padding: 1px 4px; border-radius: 3px; border: 1px solid red; font-weight: 700;">नीच</span>' : ''}
              </div>
           </div>
           
           <div style="font-size: 10px; color: #222; margin-bottom: 5px; line-height: 1.35; font-weight: 500;">
              तपाईंको <b>${pNameNp}</b> ${houseNumNp} भावमा छ (${akaNp})। <span style="white-space:nowrap;"><span style="color:#006400; font-weight: 700;">${toNepaliNum(strengthPct)}% शुभ</span> / <span style="color:#8b0000; font-weight: 700;">${toNepaliNum(challengesPct)}% चुनौती</span></span>
              <br/>
              <i style="color: #444; display:block; margin-top:2px; font-size: 9.5px; font-weight: 400;">"${meaningText}..."</i>
           </div>

           <div style="background: rgba(128,0,50,0.05); padding: 4px; border-radius: 4px; font-size: 9.5px; color: #111; margin-bottom: 4px;">
              <div style="font-weight: 800; color: #800000; font-size: 9.5px;">${akaNp}</div>
              <div style="margin-top: 1px; leading: 1.25; font-weight: 500;">${descriptionNp}</div>
           </div>
           
           <div style="display:flex; gap: 4px;">
              <div style="flex:1; background: rgba(0,128,0,0.05); padding: 4px; border-radius: 4px;">
                 <div style="color: #006400; font-weight: 800; font-size: 9px;">सकारात्मक</div>
                 <div style="font-size: 9px; color: #333; line-height: 1.25; font-weight: 500;">${goodNp || '-'}</div>
              </div>
              <div style="flex:1; background: rgba(255,0,0,0.05); padding: 4px; border-radius: 4px;">
                 <div style="color: #8b0000; font-weight: 800; font-size: 9px;">नकारात्मक</div>
                 <div style="font-size: 9px; color: #333; line-height: 1.25; font-weight: 500;">${badNp || '-'}</div>
              </div>
           </div>
        </div>
      `;
    };

    const planetsList = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    const cardsHtml = planetsList.map(p => renderPlanetCard(p)).join('');

    const page3Html = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Yatra+One&family=Mukta:wght@400;500;600;700;800&display=swap');
      </style>
      <div id="pdf-page-3" style="
        font-family: 'Yatra One', cursive;
        width: 800px;
        height: 1131px;
        padding: 40px 60px 70px 60px;
        background: url('/traditional_bg_1.jpg') no-repeat center center;
        background-size: cover;
        color: black;
        line-height: 1.5;
        font-size: 16px;
        font-weight: bold;
        box-sizing: border-box;
        position: relative;
        overflow: hidden;
      ">
        <div style="position: absolute; inset: 10px; pointer-events: none; z-index: 50;">
          <div style="position: absolute; top: 0; left: 0; right: 0; height: 24px; background: url('/swastika_icon.png') repeat-x; background-size: 24px; filter: invert(19%) sepia(91%) saturate(3190%) hue-rotate(348deg) brightness(86%) contrast(92%);"></div>
          <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 24px; background: url('/swastika_icon.png') repeat-x; background-size: 24px; filter: invert(19%) sepia(91%) saturate(3190%) hue-rotate(348deg) brightness(86%) contrast(92%);"></div>
          <div style="position: absolute; top: 24px; bottom: 24px; left: 0; width: 24px; background: url('/swastika_icon.png') repeat-y; background-size: 24px; filter: invert(19%) sepia(91%) saturate(3190%) hue-rotate(348deg) brightness(86%) contrast(92%);"></div>
          <div style="position: absolute; top: 24px; bottom: 24px; right: 0; width: 24px; background: url('/swastika_icon.png') repeat-y; background-size: 24px; filter: invert(19%) sepia(91%) saturate(3190%) hue-rotate(348deg) brightness(86%) contrast(92%);"></div>
        </div>

        <div style="font-weight: bold; text-align: center; font-size: 22px; margin-bottom: 15px; color: #800000; margin-top: 5px; text-shadow: 1px 1px 0px rgba(255,255,255,0.5);">॥ ग्रह फल कथन ॥</div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; align-content: start;">
           ${cardsHtml}
        </div>
      </div>
    `;

    // 3. Render and Capture
    console.log("PDF: Rendering pages individually...");
    const wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.left = '-2000px';
    wrapper.style.top = '0';
    wrapper.innerHTML = `<div>${page1Html}</div><div>${page2Html}</div><div>${page3Html}</div>`;
    document.body.appendChild(wrapper);

    console.log("PDF: Waiting for template backgrounds...");
    await new Promise(r => setTimeout(r, 1200));

    const capturePage = async (id) => {
      const el = wrapper.querySelector(`#${id}`);
      return html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: true,
        windowWidth: 1000
      });
    };

    const canvas1 = await capturePage('pdf-page-1');
    const canvas2 = await capturePage('pdf-page-2');
    const canvas3 = await capturePage('pdf-page-3');

    document.body.removeChild(wrapper);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Add Page 1
    const imgData1 = canvas1.toDataURL('image/jpeg', 0.8);
    pdf.addImage(imgData1, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

    // Add Page 2
    pdf.addPage();
    const imgData2 = canvas2.toDataURL('image/jpeg', 0.8);
    pdf.addImage(imgData2, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

    // Add Page 3
    pdf.addPage();
    const imgData3 = canvas3.toDataURL('image/jpeg', 0.8);
    pdf.addImage(imgData3, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

    if (mode === 'view') {
      console.log("PDF: Opening in new tab...");
      window.open(pdf.output('bloburl'), '_blank');
      return true;
    } else if (mode === 'blob') {
      console.log("PDF: Returning blob URL...");
      return pdf.output('bloburl');
    } else {
      console.log("PDF: Saving final multi-page file...");
      pdf.save(`${kundli.name}_Traditional_Kundli.pdf`);
      return true;
    }

  } catch (error) {
    console.error("Error generating Traditional PDF:", error);
    alert("Failed to generate PDF. Check console for details.");
    return false;
  }
};
