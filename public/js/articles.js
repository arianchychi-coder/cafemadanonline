/* ==========================================================================
   Articles Page Script — Search, Filters, Pagination, CRUD
   ========================================================================== */

(() => {
  const PAGE_SIZE = 5;
  let state = { search: '', status: 'all', category: 'all', sort: 'newest', page: 1 };
  let allArticles = []; // داده‌های دریافت‌شده از API

  const STATUS_LABELS = {
    published: { text: 'منتشر شده', cls: 'badge--success' },
    draft:     { text: 'پیش‌نویس',   cls: 'badge--warning' },
    archived:  { text: 'بایگانی',   cls: 'badge--neutral' }
  };

  document.addEventListener('DOMContentLoaded', () => {
    CafeShell.mount({ page: 'articles', title: 'مدیریت مقالات', breadcrumb: 'کافه معدن / مقالات' });
    bindControls();
    loadArticles();
  });

  // ─── بارگذاری مقالات از API ───────────────────────────────────────────────
  function loadArticles() {
    fetch('/api/articels')   // املای درست (قبلاً articels بود)
      .then(res => res.json())
      .then(data => {
        allArticles = (data || []).map(item => {

    console.log("ARTICLE:", item);
    console.log("DATE:", item.date);
    console.log("PUBLISH DATE:", item.publishDate);

    return {
        id: item.id,
        title: item.title || '',
        adress: item.adress || '',
        information: item.information || '',
        excerpt: item.excerpt || '',
        category: item.category || 'عمومی',
        status: (item.status || 'draft').toLowerCase(),

        publishDate:
            item.publishDate ||
            item.date ||
            null,

        views: Number(item.views) || 0,
        tags: item.tags || []
    };
});
        populateCategoryFilter();
        render();
      })
      .catch(err => {
        console.log('Error: ', err);
        allArticles = [];
        render();
      });

  }

  function getTodayPersianDate() {
    return new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(new Date());
}

        async function editArticles(id) {

    const user =
        allArticles.find(
            item => String(item.id) === String(id)
        );

    if (!user) {
        return;
    }

    document.getElementById(
        "edit-ids"
    ).value = user.id;

    document.getElementById(
        "edit-title"
    ).value = user.title || "";

    document.getElementById(
        "edit-adress"
    ).value = user.adress || "";

    document.getElementById(
        "edit-information"
    ).value = user.information || user.excerpt || "";

    document.getElementById(
        "edit-date"
    ).value = getTodayPersianDate();

    document.getElementById(
        "editModalArticels"
    ).style.display = "flex";
}


           async function deleteArticels(id) {

    if (!confirm("آیا از حذف این مقاله مطمئن هستید؟")) {
        return;
    }

    try {

        const response = await fetch(
            `/api/articels/${id}`,
            {
                method: "DELETE"
            }
        );

        const result = await response.text();

        console.log("DELETE STATUS:", response.status);
        console.log("DELETE RESPONSE:", result);

        if (!response.ok) {
            throw new Error(
                `Delete failed: ${response.status} - ${result}`
            );
        }

        // حذف از آرایه فعلی
        allArticles = allArticles.filter(
            item => String(item.id) !== String(id)
        );

        // اگر صفحه فعلی بعد از حذف خالی شد
        const totalPages = Math.max(
            1,
            Math.ceil(
                getFiltered().length / PAGE_SIZE
            )
        );

        if (state.page > totalPages) {
            state.page = totalPages;
        }

        // آپدیت جدول بدون Refresh
        render();

        CafeUI.toast({
            type: "success",
            title: "مقاله حذف شد",
            desc: "مقاله با موفقیت حذف گردید."
        });

    } catch (error) {

        console.error("Delete Article Error:", error);

        alert(
            "حذف مقاله انجام نشد.\n\n" +
            error.message
        );
    }
}

function getTodayISODate() {
    return new Date().toISOString();
}

          async function saveArticels() {

    const id =
        document.getElementById("edit-ids").value;

    const formData = new FormData();

    formData.append(
        "title",
        document.getElementById("edit-title").value
    );

    formData.append(
        "adress",
        document.getElementById("edit-adress").value
    );

    formData.append(
        "information",
        document.getElementById("edit-information").value
    );

    formData.append(
    "date",
    getTodayISODate()
);

    const imageInput =
        document.getElementById("edit-image");

    if (
        imageInput &&
        imageInput.files.length > 0
    ) {
        formData.append(
            "image",
            imageInput.files[0]
        );
    }

    const videoInput =
        document.getElementById("edit-video");

    if (
        videoInput &&
        videoInput.files.length > 0
    ) {
        formData.append(
            "video",
            videoInput.files[0]
        );
    }

    try {

        const response = await fetch(
            `/api/articels/${id}`,
            {
                method: "PUT",
                body: formData
            }
        );

        const result =
            await response.text();

        console.log(
            "PUT STATUS:",
            response.status
        );

        console.log(
            "PUT RESPONSE:",
            result
        );

        if (!response.ok) {

            throw new Error(
                `Update failed: ${response.status} - ${result}`
            );
        }

        /*
         * اگر API اطلاعات مقاله آپدیت‌شده
         * را برمی‌گرداند، از همان استفاده کن.
         */

        let updatedArticle = null;

        try {
            updatedArticle =
                JSON.parse(result);
        } catch {
            // پاسخ JSON نبوده
        }

        const index =
            allArticles.findIndex(
                item =>
                    String(item.id) === String(id)
            );

        if (index !== -1) {

            allArticles[index] = {
                ...allArticles[index],

                title:
                    document.getElementById(
                        "edit-title"
                    ).value,

                category:
                    allArticles[index].category,

                excerpt:
                    document.getElementById(
                        "edit-information"
                    ).value,

                publishDate:
                    allArticles[index].publishDate
            };

            // اگر API آبجکت کامل برگرداند
            if (
                updatedArticle &&
                typeof updatedArticle === "object"
            ) {

                allArticles[index] = {
                    ...allArticles[index],
                    ...updatedArticle
                };
            }
        }

        closeArticels();

        // بدون Refresh
        render();

        CafeUI.toast({
            type: "success",
            title: "مقاله به‌روزرسانی شد",
            desc: "اطلاعات مقاله با موفقیت ذخیره شد."
        });

    } catch (error) {

        console.error(
            "Update Article Error:",
            error
        );

        alert(
            "آپدیت مقاله انجام نشد.\n\n" +
            error.message
        );
    }
}


      async function closeArticels() {
        document.getElementById("editModalArticels").style.display = "none"
      }


      window.editArticles = editArticles
      window.deleteArticels = deleteArticels
      window.saveArticels = saveArticels
      window.closeArticels = closeArticels

  function populateCategoryFilter() {
    const categories = [...new Set(allArticles.map(a => a.category))];
    const select = document.getElementById('category-filter');
    categories.forEach(cat => {
      
    });
  }

  function bindControls() {
    document.getElementById('search-input').addEventListener('input', CafeUtils.debounce((e) => {
      state.search = e.target.value.trim();
      state.page = 1;
      render();
    }, 250));

    document.getElementById('category-filter').addEventListener('change', (e) => {
      state.category = e.target.value;
      state.page = 1;
      render();
    });

    document.getElementById('sort-select').addEventListener('change', (e) => {
      state.sort = e.target.value;
      state.page = 1;
      render();
    });

    // ⭐ فیلتر وضعیت — حالا درست کار می‌کنه
    document.querySelectorAll('#status-chips .chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('#status-chips .chip').forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        state.status = chip.dataset.status; // all | published | draft | archived
        state.page = 1;
        render();
      });
    });

    document.getElementById('select-all').addEventListener('change', (e) => {
      document.querySelectorAll('.row-check').forEach(cb => cb.checked = e.target.checked);
    });
  }

  function getFiltered() {
    let list = [...allArticles];

    if (state.status !== 'all') {
      list = list.filter(a => a.status === state.status);
    }
    if (state.category !== 'all') {
      list = list.filter(a => a.category === state.category);
    }
    if (state.search) {
      const q = state.search.toLowerCase();
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        (a.excerpt && a.excerpt.toLowerCase().includes(q))
      );
    }

    switch (state.sort) {
      case 'oldest':
        list.sort((a, b) => new Date(a.publishDate) - new Date(b.publishDate));
        break;
      case 'most-viewed':
        list.sort((a, b) => b.views - a.views);
        break;
      default:
        list.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
    }
    return list;
  }

  // ─── رندر جدول (قبلاً ناقص بود) ───────────────────────────────────────────
  function render() {
    const filtered = getFiltered();
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    if (state.page > totalPages) state.page = totalPages;

    const start = (state.page - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(start, start + PAGE_SIZE);

    const tbody = document.getElementById('articles-tbody');
    const emptyEl = document.getElementById('articles-empty');

    if (pageItems.length === 0) {
      tbody.innerHTML = '';
      emptyEl.style.display = 'block';
      emptyEl.innerHTML = `<div style="text-align:center;padding:3rem;color:var(--color-gray-500);">هیچ مقاله‌ای یافت نشد.</div>`;
      document.getElementById('articles-pagination').innerHTML = '';
      return;
    }

    emptyEl.style.display = 'none';

    tbody.innerHTML = pageItems.map((item, index) => {
      const st = STATUS_LABELS[item.status] || { text: item.status, cls: 'badge--neutral' };
      const dateStr = formatArticleDate(item.publishDate);

      return `
        <tr>
          <td style="font-size: 1.2rem;"><input type="checkbox" class="row-check" value="${item.id}"></td>
          <td style="font-size: 1.2rem;">${CafeUtils.escapeHtml(item.title)}</td>
          <td style="font-size: 1.2rem;">${item.views || 0}</td>
          <td style="font-size: 1.2rem;"><span class="badge ${st.cls}">${st.text}</span></td>
          <td style="font-size: 1.2rem;">${dateStr}</td>
          <td>
            <button onclick="editArticles('${item.id}')"
              style="background:#F3B300;color:black;border:none;padding:8px 12px;border-radius:8px;cursor:pointer;font-size: 1rem;">
              <i class="bi bi-pencil-square"></i>
            </button>
          </td>
          <td>
            <button onclick="deleteArticels('${item.id}')"
              style="background:black;color:white;border:none;padding:8px 12px;border-radius:8px;cursor:pointer;font-size:1rem;">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>`;
    }).join('');

    renderPagination(totalPages, totalItems);
  }

  function renderPagination(totalPages, totalItems) {
    const container = document.getElementById('articles-pagination');
    let pages = '';
    for (let i = 1; i <= totalPages; i++) {
      pages += `<button class="${i === state.page ? 'is-active' : ''}" data-page="${i}">${CafeUtils.toPersianDigits(i)}</button>`;
    }
    container.innerHTML = `
      <div style="font-size: 1rem;" class="pagination__info">نمایش ${CafeUtils.formatNumber(Math.min(PAGE_SIZE, totalItems))} از ${CafeUtils.formatNumber(totalItems)} مقاله</div>
      <div class="pagination__pages">
        <button data-nav="prev" ${state.page === 1 ? 'disabled' : ''}>‹</button>
        ${pages}
        <button data-nav="next" ${state.page === totalPages ? 'disabled' : ''}>›</button>
      </div>`;

    container.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.page = Number(btn.dataset.page);
        render();
      });
    });
    container.querySelector('[data-nav="prev"]')?.addEventListener('click', () => {
      if (state.page > 1) { state.page--; render(); }
    });
    container.querySelector('[data-nav="next"]')?.addEventListener('click', () => {
      if (state.page < totalPages) { state.page++; render(); }
    });
  }

  function preview(id) {
    const a = allArticles.find(x => String(x.id) === String(id));
    if (!a) return;
    const st = STATUS_LABELS[a.status] || { text: a.status, cls: 'badge--neutral' };
    document.getElementById('preview-body').innerHTML = `
      <span class="badge ${st.cls}" style="margin-bottom: var(--sp-3);">${st.text}</span>
      <h2 style="font-size: var(--fs-xl); margin-bottom: var(--sp-2);">${CafeUtils.escapeHtml(a.title)}</h2>
      <div class="text-muted text-sm" style="margin-bottom: var(--sp-5);">
        ${CafeUtils.escapeHtml(a.category)} · ${new Date(a.publishDate).toLocaleDateString('fa-IR')} · ${CafeUtils.formatNumber(a.views)} بازدید
      </div>
      <p style="line-height:1.9; color: var(--color-gray-700);">${CafeUtils.escapeHtml(a.excerpt || '')}</p>
      <div class="chip-group" style="margin-top: var(--sp-5);">
        ${(a.tags || []).map(t => `<span class="chip">${CafeUtils.escapeHtml(t)}</span>`).join('')}
      </div>`;
    CafeUI.openModal('preview-modal');
  }

  function remove(id) {
    const a = allArticles.find(x => String(x.id) === String(id));
    CafeUI.confirmDelete({
      title: 'حذف مقاله',
      desc: `آیا از حذف مقاله «${a?.title || ''}» مطمئن هستید؟ این عملیات قابل بازگشت نیست.`,
      onConfirm: () => {
        allArticles = allArticles.filter(x => String(x.id) !== String(id));
        render();
        CafeUI.toast({ type: 'success', title: 'مقاله حذف شد', desc: 'مقاله با موفقیت حذف گردید.' });
        // اگر API حذف داری، اینجا اضافه کن:
        // fetch(`/api/articles/${id}`, { method: 'DELETE' });
      }
    });
  }

  function edit(id) {
    location.href = `article-form.html?id=${id}`;
  }

function formatArticleDate(date) {

    if (!date) return '—';

    const value = String(date).trim();

    // تبدیل اعداد فارسی به انگلیسی
    const normalized = value.replace(/[۰-۹]/g, d =>
        "۰۱۲۳۴۵۶۷۸۹".indexOf(d)
    );

    // بررسی فرمت 1405/05/19
    const match = normalized.match(
        /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/
    );

    if (!match) {
        return '—';
    }

    const year = match[1];
    const month = match[2].padStart(2, '0');
    const day = match[3].padStart(2, '0');

    // تبدیل دوباره به اعداد فارسی
    const persianDate =
        `${year}/${month}/${day}`.replace(/\d/g, d =>
            "۰۱۲۳۴۵۶۷۸۹"[d]
        );

    return `
        <span
            dir="ltr"
            style="unicode-bidi: isolate;"
        >
            ${persianDate}
        </span>
    `;
}

  window.ArticlesPage = { preview, remove, edit };
})();