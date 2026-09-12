/* ==========================================================================
   Data Store — localStorage-backed persistence with seed data
   (Replace with real API calls when connecting to the backend)
   ========================================================================== */

const CafeStore = (() => {

  const KEYS = {
    articles: 'cafemadan_articles',
    consultations: 'cafemadan_consultations',
    contacts: 'cafemadan_contacts',
    visitors: 'cafemadan_visitors',
    seeded: 'cafemadan_seeded_v1'
  };

  /* ---------------------- Seed data ---------------------- */
  function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
  }

  const SEED_ARTICLES = [
    { id: 'a1', title: 'راهنمای کامل خرید دستگاه اسپرسو خانگی', slug: 'espresso-machine-guide', excerpt: 'در این مقاله بررسی می‌کنیم چگونه بهترین دستگاه اسپرسو را برای خانه انتخاب کنید.', category: 'تجهیزات قهوه', tags: ['اسپرسو', 'خرید'], status: 'published', cover: '', publishDate: daysAgo(2), views: 1240 },
    { id: 'a2', title: 'تفاوت دان قهوه عربیکا و روبوستا', slug: 'arabica-vs-robusta', excerpt: 'شناخت تفاوت این دو نوع دانه قهوه به شما در انتخاب طعم مورد علاقه کمک می‌کند.', category: 'آموزش قهوه', tags: ['عربیکا', 'روبوستا'], status: 'published', cover: '', publishDate: daysAgo(5), views: 980 },
    { id: 'a3', title: 'روش دم‌آوری قهوه با پورآور', slug: 'pour-over-brewing', excerpt: 'آموزش گام به گام دم‌آوری قهوه با روش پورآور برای طعمی تمیز و شفاف.', category: 'دم‌آوری', tags: ['پورآور', 'دم‌آوری'], status: 'draft', cover: '', publishDate: daysAgo(1), views: 0 },
    { id: 'a4', title: 'معرفی ۵ کافه برتر تهران', slug: 'top-5-cafes-tehran', excerpt: 'سفری کوتاه به بهترین کافه‌های تهران برای عاشقان قهوه.', category: 'معرفی کافه', tags: ['تهران', 'کافه‌گردی'], status: 'published', cover: '', publishDate: daysAgo(10), views: 2310 },
    { id: 'a5', title: 'چگونه قهوه را در خانه آسیاب کنیم؟', slug: 'grinding-coffee-at-home', excerpt: 'نکاتی کاربردی برای آسیاب صحیح دانه قهوه در خانه.', category: 'آموزش قهوه', tags: ['آسیاب', 'آموزش'], status: 'archived', cover: '', publishDate: daysAgo(40), views: 540 },
    { id: 'a6', title: 'شیر مناسب برای لاته آرت', slug: 'milk-for-latte-art', excerpt: 'انتخاب و آماده‌سازی شیر برای طرح‌های زیبای لاته آرت.', category: 'لاته آرت', tags: ['شیر', 'لاته'], status: 'published', cover: '', publishDate: daysAgo(15), views: 1670 }
  ];

  const CONSULT_STATUSES = ['در انتظار تماس', 'تماس گرفته شد', 'لغو شد'];
  const SEED_CONSULTATIONS = Array.from({ length: 14 }).map((_, i) => ({
    id: `c${i + 1}`,
    phone: `09${String(120000000 + i * 987654).slice(0, 9)}`,
    date: daysAgo(i),
    status: CONSULT_STATUSES[i % 3],
    note: i % 3 === 1 ? 'مشتری متقاضی مشاوره راه‌اندازی کافه بود.' : ''
  }));

  const SEED_CONTACTS = [
    { id: 'ct1', company: 'کافه بن‌مانو', fullName: 'علی رضایی', phone: '09121234567', email: 'ali.rezaei@example.com', message: 'سلام، برای همکاری در تامین دان قهوه با شما در تماس هستیم. لطفا اطلاعات بیشتری ارسال کنید.', date: daysAgo(0), status: 'جدید' },
    { id: 'ct2', company: '—', fullName: 'مریم احمدی', phone: '09354567890', email: 'maryam.a@example.com', message: 'می‌خواستم بدونم دوره آموزش باریستا برگزار می‌کنید یا نه؟', date: daysAgo(1), status: 'بررسی شده' },
    { id: 'ct3', company: 'رست‌هاوس', fullName: 'محمد کریمی', phone: '02122334455', email: 'info@rosthouse.ir', message: 'درخواست همکاری B2B برای تامین قهوه رست‌شده به صورت عمده.', date: daysAgo(3), status: 'جدید' },
    { id: 'ct4', company: '—', fullName: 'سارا محمودی', phone: '09198887766', email: 'sara.m@example.com', message: 'قیمت دستگاه اسپرسوی خانگی معرفی‌شده در مقاله چقدر است؟', date: daysAgo(6), status: 'بررسی شده' }
  ];

  function seedIfNeeded() {
    if (localStorage.getItem(KEYS.seeded)) return;
    localStorage.setItem(KEYS.articles, JSON.stringify(SEED_ARTICLES));
    localStorage.setItem(KEYS.consultations, JSON.stringify(SEED_CONSULTATIONS));
    localStorage.setItem(KEYS.contacts, JSON.stringify(SEED_CONTACTS));
    localStorage.setItem(KEYS.seeded, '1');
  }

  function read(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch (e) { return []; }
  }
  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  /* ---------------------- Generic collection API ---------------------- */
  function makeCollection(key) {
    return {
      all: () => read(key),
      get: (id) => read(key).find(item => item.id === id),
      add: (item) => {
        const list = read(key);
        list.unshift(item);
        write(key, list);
        return item;
      },
      update: (id, patch) => {
        const list = read(key);
        const idx = list.findIndex(i => i.id === id);
        if (idx === -1) return null;
        list[idx] = { ...list[idx], ...patch };
        write(key, list);
        return list[idx];
      },
      remove: (id) => {
        const list = read(key).filter(i => i.id !== id);
        write(key, list);
      },
      removeMany: (ids) => {
        const idSet = new Set(ids);
        const list = read(key).filter(i => !idSet.has(i.id));
        write(key, list);
      }
    };
  }

  const Articles = makeCollection(KEYS.articles);
  const Consultations = makeCollection(KEYS.consultations);
  const Contacts = makeCollection(KEYS.contacts);

  /* ---------------------- Visitor analytics (mock generator) ---------------------- */
  function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }




 async function getVisitorSeries(range){

    const response = await fetch(
        `/api/visit/chart?range=${range}`
    );


    const result = await response.json();


    return result.labels.map((label,index)=>{

        return {
            label: label,
            value: result.data[index]
        };

    });

}





  function getStats() {
    const articles = Articles.all();
    const consultations = Consultations.all();
    const contacts = Contacts.all();
    return {
      totalArticles: articles.length,
      totalConsultations: consultations.length,
      totalContacts: contacts.length,
      totalVisitors: 48210
    };
  }

  return {
      KEYS,
    seedIfNeeded,
    Articles,
    Consultations,
    Contacts,
    getVisitorSeries,
    getStats
  };
})();

CafeStore.seedIfNeeded();
