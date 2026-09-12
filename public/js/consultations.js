/* ==========================================================================
   Consultation Requests Page Script
   ========================================================================== */

(() => {
  const PAGE_SIZE = 7;
  let state = { search: '', status: 'all', sort: 'newest', page: 1 };
  let activeEditId = null;
  let consultations = [];

  const STATUS_CLS = {
    'در انتظار تماس': 'badge--warning',
    'تماس گرفته شد': 'badge--success',
    'لغو شد': 'badge--error'
  };

  document.addEventListener('DOMContentLoaded', async () => {

    CafeShell.mount({
        page: 'consultations',
        title: 'درخواست‌های مشاوره',
        breadcrumb: 'کافه مدن / مشاوره'
    });

    bindControls();

    await loadConsultations();
});

  function bindControls() {
    document.getElementById('search-input').addEventListener('input', CafeUtils.debounce((e) => {
      state.search = e.target.value.trim(); state.page = 1; render();
    }, 250));

    document.getElementById('sort-select').addEventListener('change', (e) => { state.sort = e.target.value; render(); });

    document.querySelectorAll('#status-chips .chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('#status-chips .chip').forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        state.status = chip.dataset.status; state.page = 1; render();
      });
    });

    document.getElementById('ec-save').addEventListener('click', () => {
      if (!activeEditId) return;
      CafeStore.Consultations.update(activeEditId, {
        status: document.getElementById('ec-status').value,
        note: document.getElementById('ec-note').value.trim()
      });
      CafeUI.closeModal('edit-consult-modal');
      render();
      CafeUI.toast({ type: 'success', title: 'ذخیره شد', desc: 'وضعیت درخواست مشاوره به‌روزرسانی شد.' });
    });
  }



function getFiltered() {

    let list = [...consultations];

    // ===============================
    // فیلتر وضعیت
    // ===============================
    if (state.status === 'all') {

        // «همه» = درخواست‌هایی که هنوز تماس گرفته نشده‌اند
        list = list.filter(
            c => c.status !== 'تماس گرفته شد'
        );

    } else {

        // «تماس گرفته شد» یا هر وضعیت دیگر
        list = list.filter(
            c => c.status === state.status
        );
    }

    // ===============================
    // جستجو
    // ===============================
    if (state.search) {

        const q = CafeUtils.toEnglishDigits(
            state.search
        );

        list = list.filter(c =>
            String(c.phone || '').includes(q) ||
            String(c.name || '')
                .toLowerCase()
                .includes(
                    state.search.toLowerCase()
                )
        );
    }

    // ===============================
    // مرتب‌سازی
    // ===============================
    list.sort((a, b) =>
        state.sort === 'newest'
            ? new Date(b.createdAt) - new Date(a.createdAt)
            : new Date(a.createdAt) - new Date(b.createdAt)
    );

    return list;
}







async function deleteUser(id) {

    if (!confirm("آیا از حذف درخواست مشاوره مطمئن هستید؟")) {
        return;
    }

    try {

        console.log("DELETE ID:", id);

        const response = await fetch(
            `/api/request/${id}`,
            {
                method: "DELETE"
            }
        );

        const responseText = await response.text();

        console.log("DELETE STATUS:", response.status);
        console.log("DELETE RESPONSE:", responseText);

        if (!response.ok) {
            throw new Error(
                `Delete failed: ${response.status} - ${responseText}`
            );
        }

        // حذف از آرایه بدون Refresh
        consultations = consultations.filter(
            item => item.id != id
        );

        render();

        CafeUI.toast({
            type: 'success',
            title: 'حذف شد',
            desc: 'درخواست مشاوره حذف گردید.'
        });

    } catch (error) {

        console.error("Delete Error:", error);

        alert(
            "حذف انجام نشد.\n\n" +
            error.message
        );
    }
}


async function markAsCalled(id) {

    try {

        console.log("MARK AS CALLED ID:", id);

        const response = await fetch(
            `/api/request/${id}/status`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    status: "تماس گرفته شد"
                })
            }
        );

        const responseText = await response.text();

        console.log("STATUS:", response.status);
        console.log("RESPONSE:", responseText);

        if (!response.ok) {
            throw new Error(
                `تغییر وضعیت انجام نشد: ${response.status} ${responseText}`
            );
        }

        const item = consultations.find(
            c => String(c.id) === String(id)
        );

        if (item) {
            item.status = "تماس گرفته شد";
        }

        render();

        CafeUI.toast({
            type: "success",
            title: "تماس گرفته شد",
            desc: "وضعیت درخواست به «تماس گرفته شد» تغییر کرد."
        });

    } catch (error) {

        console.error(
            "Mark As Called Error:",
            error
        );

        CafeUI.toast({
            type: "error",
            title: "خطا",
            desc: "تغییر وضعیت درخواست انجام نشد."
        });
    }
}

window.markAsCalled = markAsCalled;



window.deleteUser = deleteUser;


function render() {

    const list = getFiltered();

    const totalItems = list.length;

    const totalPages = Math.max(
        1,
        Math.ceil(totalItems / PAGE_SIZE)
    );

    if (state.page > totalPages) {
        state.page = totalPages;
    }

    const start =
        (state.page - 1) * PAGE_SIZE;

    const pageItems =
        list.slice(start, start + PAGE_SIZE);

    renderTable(pageItems);

    renderPagination(
        totalPages,
        totalItems
    );
}


function renderTable(items) {

    const tbody =
        document.getElementById("consult-tbody");

    if (!tbody) return;

    tbody.innerHTML = "";

    if (items.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    style="
                        text-align:center;
                        padding:30px;
                    "
                >
                    موردی پیدا نشد
                </td>
            </tr>
        `;

        return;
    }

    items.forEach((item, index) => {

        const row =
            document.createElement("tr");

        const realIndex =
            ((state.page - 1) * PAGE_SIZE) +
            index +
            1;

        row.innerHTML = `

            <td style="font-size: 1.2rem;">
                ${CafeUtils.toPersianDigits(realIndex)}
            </td>

            <td style="font-size: 1.2rem;">
                ${CafeUtils.escapeHtml(
                    item.name || ''
                )}
            </td>

            <td style="font-size: 1.2rem; direction: ltr; text-align: right;">
    ${CafeUtils.escapeHtml(
        (item.phone || '')
            .replace(/\D/g, '')
            .replace(/^(\d{4})(\d{3})(\d{4})$/, '$1 $2 $3')
    )}
</td>

            <td style="font-size: 1.2rem;">
                ${
                    item.createdAt
                        ? new Date(item.createdAt)
                            .toLocaleDateString("fa-IR")
                        : ''
                }
            </td>

            <td>
            
${
    item.status === "تماس گرفته شد"

    ? `
        <span
            style="
                display:inline-flex;
                align-items:center;
                gap:6px;
                background:#F3B300;
                color:white;
                padding:8px 12px;
                border-radius:8px;
                font-size:1rem;
            "
        >
            <i class="bi bi-check-circle"></i>
            تماس گرفته شد
        </span>
    `

    : `
        <button
            type="button"
            onclick="markAsCalled('${item.id}')"
            style="
                background:#198754;
                color:white;
                border:none;
                padding:8px 12px;
                border-radius:8px;
                cursor:pointer;
                font-size:1rem;
                margin-left:6px;
            "
            title="تماس گرفته شده"
        >
           <i class="bi bi-check2"></i>
             
        </button>
    `
}
            </td>

            <td>



                <button
                    type="button"
                    onclick="deleteUser('${item.id}')"
                    style="
                        background:black;
                        color:white;
                        border:none;
                        padding:8px 12px;
                        border-radius:8px;
                        cursor:pointer;
                        font-size: 1rem;
                    "
                >
                    <i class="bi bi-trash"></i>
                </button>

            </td>
        `;

        tbody.appendChild(row);
    });
}


  function renderPagination(totalPages, totalItems) {
    const container = document.getElementById('consult-pagination');
    let pages = '';
    for (let i = 1; i <= totalPages; i++) {
      pages += `<button class="${i === state.page ? 'is-active' : ''}" data-page="${i}">${CafeUtils.toPersianDigits(i)}</button>`;
    }
    container.innerHTML = `
      <div style="font-size: 1rem;" class="pagination__info">نمایش ${CafeUtils.formatNumber(Math.min(PAGE_SIZE, totalItems))} از ${CafeUtils.formatNumber(totalItems)} درخواست</div>
      <div class="pagination__pages">
        <button data-nav="prev" ${state.page === 1 ? 'disabled' : ''}>‹</button>${pages}<button data-nav="next" ${state.page === totalPages ? 'disabled' : ''}>›</button>
      </div>`;
    container.querySelectorAll('[data-page]').forEach(btn => btn.addEventListener('click', () => { state.page = Number(btn.dataset.page); render(); }));
    container.querySelector('[data-nav="prev"]')?.addEventListener('click', () => { state.page--; render(); });
    container.querySelector('[data-nav="next"]')?.addEventListener('click', () => { state.page++; render(); });
  }

  function edit(id) {
    const c = CafeStore.Consultations.get(id);
    if (!c) return;
    activeEditId = id;
    document.getElementById('ec-phone').value = CafeUtils.formatPhone(c.phone);
    document.getElementById('ec-status').value = c.status;
    document.getElementById('ec-note').value = c.note || '';
    CafeUI.openModal('edit-consult-modal');
  }

  function remove(id) {
    CafeUI.confirmDelete({
      title: 'حذف درخواست مشاوره',
      desc: 'آیا از حذف این درخواست مشاوره مطمئن هستید؟',
      onConfirm: () => {
        CafeStore.Consultations.remove(id);
        render();
        CafeUI.toast({ type: 'success', title: 'حذف شد', desc: 'درخواست مشاوره حذف گردید.' });
      }
    });
  }

  window.ConsultPage = { edit, remove };




async function loadConsultations() {

    try {

        const response = await fetch("/api/request");

        if (!response.ok) {
            throw new Error("خطا در دریافت درخواست‌ها");
        }

        const data = await response.json();

        console.log("CONSULTATIONS:", data);

        // اطلاعات fetch اینجا ذخیره می‌شود
        consultations = Array.isArray(data)
            ? data
            : [];

        state.page = 1;

        // جدول از همین آرایه ساخته می‌شود
        render();

    } catch (error) {

        console.error(
            "Load Consultations Error:",
            error
        );

    }
}
})();



