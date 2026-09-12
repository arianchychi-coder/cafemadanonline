/* ==========================================================================
   Utilities — Persian digits, date & phone formatting, helpers
   ========================================================================== */

const CafeUtils = (() => {

  const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

  // Convert any English digits in a string/number to Persian digits
  function toPersianDigits(value) {
    return String(value).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[d]);
  }

  // Convert Persian digits back to English (useful for parsing input)
  function toEnglishDigits(value) {
    return String(value).replace(/[۰-۹]/g, (d) => PERSIAN_DIGITS.indexOf(d));
  }

  // Format a number with thousands separators using Persian digits
  function formatNumber(num) {
    const formatted = Number(num).toLocaleString('en-US');
    return toPersianDigits(formatted);
  }

  const PERSIAN_MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

  // Very small Gregorian -> Jalali conversion (sufficient for display purposes)
  function toJalali(gy, gm, gd) {
    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    let jy;
    gy = gm > 2 ? gy + 1 : gy;
    let days = 355666 + (365 * gy) + Math.floor((gy + 8) / 4) - Math.floor((gy + 99) / 100) +
      Math.floor((gy + 399) / 400) + gd + g_d_m[gm - 1];
    jy = -1595 + (33 * Math.floor(days / 12053));
    days %= 12053;
    jy += 4 * Math.floor(days / 1461);
    days %= 1461;
    if (days > 365) {
      jy += Math.floor((days - 1) / 365);
      days = (days - 1) % 365;
    }
    let jm, jd;
    if (days < 186) {
      jm = 1 + Math.floor(days / 31);
      jd = 1 + (days % 31);
    } else {
      jm = 7 + Math.floor((days - 186) / 30);
      jd = 1 + ((days - 186) % 30);
    }
    return { jy, jm, jd };
  }

  // Format a JS Date (or ISO string) into a Persian display date e.g. "۱۲ مهر ۱۴۰۴"
  function formatPersianDate(dateInput, withTime = false) {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    const { jy, jm, jd } = toJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
    let result = `${toPersianDigits(jd)} ${PERSIAN_MONTHS[jm - 1]} ${toPersianDigits(jy)}`;
    if (withTime) {
      const hh = String(date.getHours()).padStart(2, '0');
      const mm = String(date.getMinutes()).padStart(2, '0');
      result += ` - ${toPersianDigits(hh)}:${toPersianDigits(mm)}`;
    }
    return result;
  }

  // Relative "time ago" in Persian
  function timeAgo(dateInput) {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'همین الان';
    if (mins < 60) return `${toPersianDigits(mins)} دقیقه پیش`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${toPersianDigits(hours)} ساعت پیش`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${toPersianDigits(days)} روز پیش`;
    return formatPersianDate(date);
  }

  // Format Iranian phone numbers into readable grouped format
  // Mobile: 09123456789 -> 0912 345 6789
  // Landline w/ area code: 0212220000 -> 021 222 0000 (best effort)
  function formatPhone(raw) {
    if (!raw) return '';
    const digits = toEnglishDigits(String(raw)).replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('09')) {
      return toPersianDigits(`${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`);
    }
    if (digits.length === 11 && digits.startsWith('0')) {
      return toPersianDigits(`${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`);
    }
    if (digits.length === 8) {
      return toPersianDigits(`${digits.slice(0, 4)} ${digits.slice(4)}`);
    }
    return toPersianDigits(digits);
  }

  // Validate Iranian mobile number
  function isValidMobile(raw) {
    const digits = toEnglishDigits(String(raw || '')).replace(/\D/g, '');
    return /^09\d{9}$/.test(digits);
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '');
  }

  function debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  function uid(prefix = 'id') {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
  }

  function slugify(str) {
    return String(str)
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, '');
  }

  return {
    toPersianDigits, toEnglishDigits, formatNumber, formatPersianDate, timeAgo,
    formatPhone, isValidMobile, isValidEmail, debounce, uid, escapeHtml, slugify
  };
})();
