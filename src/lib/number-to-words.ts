/**
 * Convert numbers to Persian words.
 * Example: 1500000 -> یک میلیون و پانصد هزار
 */

const yekan = ['صفر', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'];
const dahgan = ['', '', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
const dahTaNuzdah = ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'];
const sadgan = ['', 'صد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'];
const bases = ['', 'هزار', 'میلیون', 'میلیارد', 'تریلیون'];

function getGroupWords(num: number): string {
  let words = [];
  const h = Math.floor(num / 100);
  const t = Math.floor((num % 100) / 10);
  const u = num % 10;

  if (h > 0) words.push(sadgan[h]);
  
  if (t === 1) {
    words.push(dahTaNuzdah[u]);
  } else {
    if (t > 1) words.push(dahgan[t]);
    if (u > 0) words.push(yekan[u]);
  }

  return words.join(' و ');
}

export function numberToPersianWords(num: number | string): string {
  if (num === 0 || num === '0') return yekan[0];
  
  const str = num.toString().replace(/,/g, '');
  if (isNaN(Number(str))) return '';

  let n = parseInt(str, 10);
  let baseIndex = 0;
  let finalWords = [];

  while (n > 0) {
    const group = n % 1000;
    if (group > 0) {
      const groupWords = getGroupWords(group);
      const baseWord = bases[baseIndex] ? ' ' + bases[baseIndex] : '';
      finalWords.unshift(groupWords + baseWord);
    }
    n = Math.floor(n / 1000);
    baseIndex++;
  }

  return finalWords.join(' و ');
}
