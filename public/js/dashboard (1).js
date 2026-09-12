/* ==========================================================================
   Dashboard Page Script
   ==============
   ============================================================ */



document.addEventListener('DOMContentLoaded', () => {
  CafeShell.mount({ page: 'dashboard', title: 'داشبورد', breadcrumb: 'کافه معدن / داشبورد' });


  renderStatCards();
  renderActivity();
  renderStatusDonut();
  renderTopArticles();
  initVisitorsChart();
});



/* ---------------------- Statistics Cards ---------------------- */
async function renderStatCards() {

try {

    // =========================
    // تعداد بازدیدکنندگان
    // =========================

    let visitorTotal = 0;

    try {
        const visitorRes = await fetch("/api/visit/total");

        if (visitorRes.ok) {
            const visitorData = await visitorRes.json();
            visitorTotal = visitorData.total || 0;
        }

    } catch (error) {
        console.error("خطا در دریافت بازدیدکنندگان:", error);
    }


    // =========================
    // تعداد مقالات
    // =========================

    let totalArticles = 0;

    try {
        const articlesResponse = await fetch("/api/articels");

        if (articlesResponse.ok) {
            const articles = await articlesResponse.json();
            totalArticles = articles.length;
        }

    } catch (error) {
        console.error("خطا در دریافت مقالات:", error);
    }


    // =========================
    // تعداد تماس‌ها
    // =========================

   // =========================
// تعداد تماس‌ها
// =========================
let totalCall = 0;

try {
    const token = localStorage.getItem("accessToken");

    const callResponse = await fetch("/api/admin", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    console.log("ADMIN STATUS:", callResponse.status);

    if (callResponse.ok) {
        const calls = await callResponse.json();

        console.log("ADMIN CALLS:", calls);

        totalCall = Array.isArray(calls)
            ? calls.length
            : 0;
    } else {
        console.error(
            "خطا در دریافت تماس‌ها:",
            callResponse.status
        );
    }

} catch (error) {
    console.error("خطا در دریافت تماس‌ها:", error);
}


    // =========================
    // تعداد درخواست‌های مشاوره
    // =========================

    let totalConsultations = 0;

    try {

        const consultationResponse = await fetch("/api/request");

        if (consultationResponse.ok) {

            const consultations =
                await consultationResponse.json();

            // اینجا نباید const بنویسیم
            totalConsultations = consultations.length;

        }

    } catch (error) {

        console.error(
            "خطا در دریافت درخواست‌های مشاوره:",
            error
        );

    }


    // =========================
    // کارت‌ها
    // =========================

    const cards = [

        {
            label: "کل مقالات",
            value: totalArticles,
            icon: "file",
            trend: "+۱۲٪",
            up: true
        },

        {
            label: "درخواست‌های مشاوره",
            value: totalConsultations,
            icon: "phone",
            trend: "+۵٪",
            up: true
        },

        {
            label: "پیام‌های تماس با ما",
            value: totalCall,
            icon: "mail",
            trend: "-۲٪",
            up: false
        },

        {
            label: "بازدیدکنندگان سایت",
            value: visitorTotal,
            icon: "chart",
            trend: "+۱۸٪",
            up: true
        }

    ];


    // =========================
    // آیکون‌ها
    // =========================

    const icons = {


file: `
    <path
        d="M6 3h9l3 3v15H6V3z"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linejoin="round"
    />
    <path
        d="M14 3v4h4"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linejoin="round"
    />
    <path
        d="M9 12h6M9 16h6"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
    />
`,

phone: `
    <path
        d="M7 4h3l2 5-2 1.5c1 2.1 2.4 3.5 4.5 4.5L16 13l5 2v3c0 1.1-.9 2-2 2C11.3 20 4 12.7 4 5c0-1.1.9-2 2-2h1z"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
`,

mail: `
    <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        stroke-width="1.8"
    />
    <path
        d="M4 7l8 6 8-6"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
`,

chart: `
    <path
        d="M4 19V5"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
    />
    <path
        d="M4 19h16"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
    />
    <path
        d="M7 15l3-4 3 2 5-6"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
`


};



    // =========================
    // ساخت HTML
    // =========================

    const html = cards.map(c => `

        <div class="stat-card">

            <div class="stat-card__top">

                <div class="stat-card__icon">

                    <svg
                        viewBox="0 0 24 24"
                        width="22"
                        height="22"
                        fill="none"
                    >
                        ${icons[c.icon]}
                    </svg>

                </div>

                <span class="stat-card__trend ${
                    c.up
                        ? "stat-card__trend--up"
                        : "stat-card__trend--down"
                }">

                    ${c.up ? "▲" : "▼"} ${c.trend}

                </span>

            </div>


            <div class="stat-card__value">

                ${CafeUtils.formatNumber(c.value)}

            </div>


            <div class="stat-card__label">

                ${c.label}

            </div>

        </div>

    `).join("");


    document.getElementById("stats-grid").innerHTML = html;


    // برای تست
    console.log("TOTAL ARTICLES:", totalArticles);
    console.log("TOTAL CONSULTATIONS:", totalConsultations);
    console.log("TOTAL CALLS:", totalCall);
    console.log("TOTAL VISITORS:", visitorTotal);


} catch (error) {

    console.error(
        "خطا در نمایش کارت‌های آماری:",
        error
    );

}


}



function toPersianDate(date) {

    if (!date) return "";

    // تاریخ شمسی
    if (
        typeof date === "string" &&
        /^14\d{2}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(date)
    ) {

        const [year, month, day] =
            date.split(/[\/\-]/);

        return `${year}/${month.padStart(2, "0")}/${day.padStart(2, "0")}`;
    }

    // تاریخ میلادی
    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
        console.warn("تاریخ نامعتبر:", date);
        return "";
    }

    return new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(parsedDate);
}

/* ---------------------- Recent Activity ---------------------- */
async function renderActivity() {
try {

    // دریافت اطلاعات از دیتابیس
    const token = localStorage.getItem("accessToken");

const [
    articlesResponse,
    consultationsResponse,
    callResponse
] = await Promise.all([
    fetch("/api/articels"),
    fetch("/api/request"),
    fetch("/api/admin", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })
]);

    const articles = await articlesResponse.json();
    const consultations = await consultationsResponse.json();
    const calls = await callResponse.json();

    // آخرین مقاله
    const latestArticle = articles.length
        ? articles[articles.length - 1]
        : null;

    // آخرین درخواست مشاوره
    const latestConsultation = consultations.length
        ? consultations[consultations.length - 1]
        : null;

    // آخرین درخواست تماس
    const lastCall = calls.length
        ? calls[calls.length - 1]
        : null;

    const activities = [];

    // آخرین مقاله
    if (latestArticle) {

    const articleDate =
        latestArticle.publishDate || latestArticle.date;

    activities.push({

        type: "article",

        icon: "article",

        title: `مقاله «${latestArticle.title}»`,

        desc: latestArticle.status === "published"
            ? "منتشر شد"
            : "ذخیره پیش‌نویس شد",

        date: toPersianDate(articleDate),

        url: '/cafemadan/3a4b5c6d-7e88-4c9f-b333-333333333333/articles'

    });

}

    // آخرین درخواست مشاوره
    if (latestConsultation) {

      const consultationsDate = latestConsultation.publishDate || latestConsultation.createdAt

        activities.push({
            type: "consult",
            icon: "consult",
            title: "درخواست مشاوره جدید",
            desc: CafeUtils.formatPhone(latestConsultation.phone),
            date: toPersianDate(consultationsDate),

            url: '/cafemadan/5c6d7e8f-9011-4ebc-d555-555555555555/consultations'
        });
    }

    // آخرین درخواست تماس
    if (lastCall) {
        activities.push({
            type: "call",
            icon: "call",
            title: "درخواست تماس جدید",
            desc: CafeUtils.formatPhone(lastCall.phone),
            date: lastCall.email,

            url: '/cafemadan/6d7e8f90-1122-4fcd-e666-666666666666/contacts'
        });
    }

    // اگر هیچ فعالیتی نبود
    if (!activities.length) {
        document.getElementById("activity-list").innerHTML =
            emptyStateHtml(
                "هنوز فعالیتی ثبت نشده",
                "فعالیت‌های جدید اینجا نمایش داده می‌شوند."
            );

        return;
    }

    // نمایش فعالیت‌ها
    document.getElementById("activity-list").innerHTML =
        activities.map(item => `
            <a href="${item.url}" class="activity-item">

                <div class="activity-item__icon activity-item__icon--${item.type}">
                    <i class="bi ${
    item.type === "article"
        ? "bi-file-text"
        : item.type === "consult"
            ? "bi-chat-dots"
            : item.type === "call"
                ? "bi-telephone"
                : "bi-info-circle"
}"></i>
                </div>

                <div>
                    <div style="font-size:1rem" class="activity-item__title">
                        ${CafeUtils.escapeHtml(item.title)}
                    </div>

                    <div class="activity-item__desc">
    <span 
     style="font-size:1rem"
        dir="ltr"
        style="unicode-bidi: isolate;"
    >
        ${CafeUtils.escapeHtml(item.desc || "")}
    </span>
</div>
                </div>

                <div  style="font-size:1rem" class="activity-item__time">
    ${CafeUtils.escapeHtml(item.date || "")}
</div>

            </a>
        `).join("");

} catch (error) {
    console.error("خطا در دریافت فعالیت‌ها:", error);
}


}


function toPersianDate(date) {
    if (!date) return "";

    let value = String(date).trim();

    // تبدیل اعداد فارسی به انگلیسی برای پردازش
    value = value.replace(/[۰-۹]/g, d =>
        "۰۱۲۳۴۵۶۷۸۹".indexOf(d)
    );

    // تبدیل اعداد عربی به انگلیسی
    value = value.replace(/[٠-٩]/g, d =>
        "٠١٢٣٤٥٦٧٨٩".indexOf(d)
    );

    // اگر تاریخ شمسی باشد
    if (/^14\d{2}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(value)) {

        const [year, month, day] =
            value.split(/[\/\-]/);

        const result =
            `${year}/${month.padStart(2, "0")}/${day.padStart(2, "0")}`;

        // تبدیل اعداد انگلیسی به فارسی
        return result.replace(/\d/g, d =>
            "۰۱۲۳۴۵۶۷۸۹"[d]
        );
    }

    // اگر تاریخ میلادی باشد
    const parsedDate = new Date(value);

    if (isNaN(parsedDate.getTime())) {
        console.warn("تاریخ نامعتبر:", date);
        return "";
    }

    return new Intl.DateTimeFormat("fa-IR", {
        calendar: "persian",
        numberingSystem: "arabext",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(parsedDate);
}

/* ---------------------- Status Donut ---------------------- */
async function renderStatusDonut() {
try {
// دریافت مقاله‌ها از دیتابیس
const response = await fetch("/api/articels");


    if (!response.ok) {
        throw new Error("خطا در دریافت مقالات");
    }

    const articles = await response.json();

    console.log("ARTICLES:", articles);
console.log("STATUSES:", articles.map(a => a.status));

    // شمارش وضعیت‌ها
    const counts = {
        published: 0,
        draft: 0,
        archived: 0
    };

    articles.forEach(article => {
        if (counts[article.status] !== undefined) {
            counts[article.status]++;
        }
    });

    const segments = [
        {
            key: "draft",
            label: "منتشر شده",
            value: counts.published,
            color: "#F3B300"
        },
        {
            key: "published",
            label: "پیش‌نویس",
            value: counts.draft,
            color: "#2B2B26"
        },
        {
            key: "archived",
            label: "بایگانی",
            value: counts.archived,
            color: "#C8C3B8"
        }
    ];

    // رسم نمودار
    const canvas = document.getElementById("status-donut");

    CafeCharts.drawDonutChart(canvas, segments);

    // نمایش Legend
    document.getElementById("status-legend").innerHTML =
        segments.map(s => `
            <div style="font-size:1rem" class="mini-donut-legend__row">
                <i style="background:${s.color}"></i>
                ${s.label}
                <b>${CafeUtils.formatNumber(s.value)}</b>
            </div>
        `).join("");

} catch (error) {
    console.error("خطا در دریافت وضعیت مقالات:", error);
}


}


/* ---------------------- Top Articles ---------------------- */
function renderTopArticles() {
  const top = [...CafeStore.Articles.all()].sort((a, b) => b.views - a.views).slice(0, 4);
  const el = document.getElementById('top-articles');
  if (!top.length) { el.innerHTML = emptyStateHtml('مقاله‌ای وجود ندارد', ''); return; }

  el.innerHTML = `<div style="display:flex; flex-direction:column; gap: var(--sp-4);">` + top.map((a, i) => `
    <div style="display:flex; align-items:center; gap: var(--sp-3);">
      <div style="width:28px; height:28px; border-radius:8px; background:var(--color-gray-100); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:var(--color-gray-500); flex-shrink:0;">
        ${CafeUtils.toPersianDigits(i + 1)}
      </div>
      <div style="flex:1; min-width:0;">
        <div style="font-size: var(--fs-sm); font-weight:600; color:var(--color-black); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${CafeUtils.escapeHtml(a.title)}</div>
        <div style="font-size: var(--fs-xs); color:var(--color-gray-500);">${a.category}</div>
      </div>
      <div style="font-size: var(--fs-sm); font-weight:700; color: var(--color-primary-dark); flex-shrink:0;">${CafeUtils.formatNumber(a.views)}</div>
    </div>`).join('') + `</div>`;
}

/* ---------------------- Visitors Chart ---------------------- */
function initVisitorsChart() {
  const canvas = document.getElementById('visitors-chart');
  let currentRange = 'weekly';

  function render() {
    const data = CafeStore.getVisitorSeries(currentRange);
    CafeCharts.drawAreaChart(canvas, data);
  }
  render();
  window.addEventListener('resize', CafeUtils.debounce(render, 200));

  document.querySelectorAll('#range-tabs button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#range-tabs button').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      currentRange = btn.dataset.range;
      render();
    });
  });
}

/* ---------------------- Shared Empty State Helper ---------------------- */
function emptyStateHtml(title, desc) {
  return `
    <div class="empty-state">
      <div class="empty-state__icon">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none"><path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zm0 9h7v7h-7v-7zm-9 0h7v7H4v-7z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
      </div>
      <div class="empty-state__title">${title}</div>
      <div class="empty-state__desc">${desc}</div>
    </div>`;
}




async function loadDashboardChart(range="weekly") {

    const res = await fetch(`/api/visit/chart?range=${range}`);

    const result = await res.json();


    const data = result.labels.map((label,index)=>({
        label: label,
        value: result.data[index]
    }));


    console.log("DASHBOARD CHART:", data);


    const canvas = document.getElementById("visitors-chart");


    CafeCharts.drawAreaChart(
        canvas,
        data
    );

}





document.addEventListener("DOMContentLoaded",()=>{

    loadDashboardChart();


});




document.querySelectorAll("#range-tabs button")
.forEach(btn=>{


    btn.addEventListener("click",()=>{


        document.querySelectorAll("#range-tabs button")
        .forEach(b=>b.classList.remove("is-active"));


        btn.classList.add("is-active");


        loadDashboardChart(
            btn.dataset.range
        );


    });


});

