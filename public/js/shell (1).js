/* ==========================================================================
   App Shell — Injects Sidebar + Topbar markup (single source of truth)
   ========================================================================== */

const CafeShell = (() => {

  const NAV_ITEMS = [
    { page: 'dashboard', href: '/cafemadan/2f3c4d5e-6f77-4b8d-a222-222222222222/dashboard', label: 'داشبورد', icon: 'grid' },
    { page: 'articles', href: '/cafemadan/3a4b5c6d-7e88-4c9f-b333-333333333333/articles', label: 'مقالات', icon: 'file' },
    { page: 'article-add', href: '/cafemadan/4b5c6d7e-8f99-4dab-c444-444444444444/article-form', label: 'افزودن مقاله', icon: 'plus' },
    { page: 'consultations', href: '/cafemadan/5c6d7e8f-9011-4ebc-d555-555555555555/consultations', label: 'درخواست‌های مشاوره', icon: 'phone', badgeKey: 'consultations' },
    { page: 'contacts', href: '/cafemadan/6d7e8f90-1122-4fcd-e666-666666666666/contacts', label: 'تماس با ما', icon: 'mail', badgeKey: 'contacts' },
    { page: 'analytics', href: '/cafemadan/7e8f9011-2233-40de-f777-777777777777/analytics', label: 'آمار بازدید', icon: 'chart' },
    { page: 'کاربران', href: '/cafemadan/9f902156-4455-42ef-a999-999999999999/user', label: 'کاربران', icon: 'user' },
    { page: 'settings', href: '/cafemadan/8f901122-3344-41ef-a888-888888888888/settings', label: 'تنظیمات', icon: 'settings' },
    { page: 'podcast-add', href: '/cafemadan/7f902565-8899-82ef-a409-207656b976789/podcast-add', label: 'افزودن پادکست', icon: 'file' },
    { page: 'allPodcast', href: '/cafemadan/lf892565-1010-102ef-a609-7982793782905/allPodcast', label: 'پادکست ها', icon: 'mic' },
    { page: 'khabarname-add', href: '/cafemadan/fhieu418-1122-122ef-a809-9494217183980/khabarname-add', label: 'افزودن خبرنامه', icon: 'newspaper' },
    { page: 'khabarname', href: '/cafemadan/gfdy738f-2233-132ef-a909-6781246587190/khabarname', label: ' خبرنامه ها', icon: 'newspapers' },
  ];

  const ICONS = {
    grid: '<path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zm0 9h7v7h-7v-7zm-9 0h7v7H4v-7z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M14 2v6h6" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    plus: '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    mail: '<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M22 6l-10 7L2 6" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    chart: '<path d="M3 3v18h18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M7 15l4-5 3 3 5-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    settings: '<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 17l5-5-5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 12H9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    user: `
  <path
    d="M20 21a8 8 0 0 0-16 0"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
  />
  <circle
    cx="12"
    cy="7"
    r="4"
    stroke="currentColor"
    stroke-width="1.8"
  />
`,
mic: `
    <path
        d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
    <path
        d="M19 11a7 7 0 0 1-14 0"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
    />
    <path
        d="M12 18v3"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
    />
    <path
        d="M9 21h6"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
    />
`,
newspaper: '<rect x="3" y="4" width="18" height="16" rx="1.5" stroke="currentColor" stroke-width="1.8"/><path d="M7 8h10M7 12h6M7 16h4M16 12h2.5v4H16z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
newspapers: '<rect x="3" y="5" width="18" height="15" rx="1.5" stroke="currentColor" stroke-width="1.8"/><path d="M7 8h10M7 11h10M7 14h4M7 17h6M15 14h2v3h-2z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'
  };
  

  function renderSidebar(activePage) {
    const consultCount = CafeStore.Consultations.all().filter(c => c.status === 'در انتظار تماس').length;
    const contactCount = CafeStore.Contacts.all().filter(c => c.status === 'جدید').length;
    const badgeMap = { consultations: consultCount, contacts: contactCount };

    const links = NAV_ITEMS.map(item => {
      const badge = item.badgeKey && badgeMap[item.badgeKey] > 0
        ? `<span style="font-size:0.9rem;" class="sidebar__badge">${CafeUtils.toPersianDigits(badgeMap[item.badgeKey])}</span>` : '';
      return `
        <a  style="font-size:1.1rem" href="${item.href}" class="sidebar__link" data-page="${item.page}">
          <svg viewBox="0 0 24 24" fill="none">${ICONS[item.icon]}</svg>
          <span>${item.label}</span>
          ${badge}
        </a>`;
    }).join('');

    return `
      <div class="sidebar__brand">
        <div class="sidebar__logo">CM</div>
        <div class="sidebar__brand-text">
          <div  style="font-size:1.5rem"  class="sidebar__brand-title">کافه معدن</div>
          <div  style="font-size:1.2rem" class="sidebar__brand-sub">پنل مدیریت</div>
        </div>
        <button class="sidebar__close" aria-label="بستن منو">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </div>
      <div  style="font-size:1.2rem" class="sidebar__section-label">مدیریت محتوا</div>
      <nav class="sidebar__nav">${links}</nav>
      <div class="sidebar__footer">
        <a href="/index.html" class="sidebar__link" style="font-size:1.1rem">
          <svg  viewBox="0 0 24 24" fill="none">${ICONS.logout}</svg>
          <span>خروج</span>
        </a>
      </div>
      `;
  }


async function updateBadges() {

    // =========================
    // درخواست‌های مشاوره
    // =========================
    try {

        const response =
            await fetch("/api/request");

        if (!response.ok) {
            throw new Error(
                "خطا در دریافت درخواست‌های مشاوره"
            );
        }

        const data =
            await response.json();

        const consultCount =
            Array.isArray(data)
                ? data.filter(
                    item =>
                        item.status !== "تماس گرفته شد"
                ).length
                : 0;

        updateBadge(
            "consultations",
            consultCount
        );

    } catch (error) {

        console.error(
            "Consultation Badge Error:",
            error
        );

    }


    // =========================
    // تماس با ما
    // =========================
    try {
    const token = localStorage.getItem("accessToken");

    const response = await fetch("/api/admin", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "خطا در دریافت پیام‌های تماس"
        );
    }

    const contactCount = Array.isArray(data)
        ? data.filter(item => item.status === "جدید").length
        : 0;

    updateBadge("contacts", contactCount);

} catch (error) {
    console.error(
        "Contact Badge Error:",
        error
    );
}
}


// =========================
// آپدیت Badge
// =========================
function updateBadge(
    badgeKey,
    count
) {

    const page =
        badgeKey === "consultations"
            ? "consultations"
            : "contacts";

    const link =
        document.querySelector(
            `.sidebar__link[data-page="${page}"]`
        );

    if (!link) return;

    let badge =
        link.querySelector(
            ".sidebar__badge"
        );


    // اگر تعداد صفر است Badge حذف شود
    if (count <= 0) {

        badge?.remove();

        return;
    }


    // اگر Badge وجود ندارد بساز
    if (!badge) {

        badge =
            document.createElement("span");

        badge.className =
            "sidebar__badge";

        link.appendChild(badge);
    }


    // عدد فارسی
    badge.textContent =
        CafeUtils.toPersianDigits(count);
}




async function updateConsultationBadge() {
    try {
        const response = await fetch("/api/request");

        if (!response.ok) {
            throw new Error("خطا در دریافت درخواست‌های مشاوره");
        }

        const data = await response.json();

        // فقط درخواست‌هایی که هنوز تماس گرفته نشده‌اند
        const count = Array.isArray(data)
            ? data.filter(
                item => item.status !== "تماس گرفته شد"
            ).length
            : 0;

        const badge = document.querySelector(
            '.sidebar__link[data-page="consultations"] .sidebar__badge'
        );

        const link = document.querySelector(
            '.sidebar__link[data-page="consultations"]'
        );

        if (!link) return;

        if (count > 0) {

            if (badge) {
                badge.textContent =
                    CafeUtils.toPersianDigits(count);
            } else {
                link.insertAdjacentHTML(
                    "beforeend",
                    `<span  class="sidebar__badge">
                        ${CafeUtils.toPersianDigits(count)}
                    </span>`
                );
            }

        } else {

            badge?.remove();

        }

    } catch (error) {

        console.error(
            "Consultation Badge Error:",
            error
        );

    }
}



  function renderTopbar({ title, breadcrumb }) {
    return `
      <div class="topbar__left">
        <button class="topbar__menu-btn" aria-label="باز کردن منو">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
        <div>
          <div class="topbar__page-title">${title}</div>
          ${breadcrumb ? `<div  style="font-size:1rem"  class="topbar__breadcrumb">${breadcrumb}</div>` : ''}
        </div>
      </div>
      <div class="topbar__right">
        <div class="user-mini">
          <div class="user-mini__avatar">م.م</div>
          <div class="user-mini__text">
            <div class="user-mini__name" style="font-size:1.1rem">مدیر معدن</div>
            <div class="user-mini__role" style="font-size:1rem">مدیر کل</div>
          </div>
        </div>
      </div>`;
  }



function mount({
    page,
    title,
    breadcrumb
}) {

    const sidebarRoot =
        document.getElementById(
            'sidebar-root'
        );

    const topbarRoot =
        document.getElementById(
            'topbar-root'
        );


    if (sidebarRoot) {

        sidebarRoot.innerHTML =
            renderSidebar(page);

    }


    if (topbarRoot) {

        topbarRoot.innerHTML =
            renderTopbar({
                title,
                breadcrumb
            });

    }


    document.body.dataset.page =
        page;


    // گرفتن تعداد واقعی از API
    updateBadges();
}





  return { mount };
})();


const token = localStorage.getItem("accessToken")

document.addEventListener("DOMContentLoaded",async()=>{
    const check = await fetch("/api/admin",{
        headers:{
            Authorization : `Bearer ${token}`
        }
    })


    if (check.status === 403 || check.status === 401) {
        alert("شما اجازه دسترسی به این صفحه رو ندارید")
        window.location.href = "login (1).html"
    }
})