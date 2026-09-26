/* ==========================================================================
درخواست‌های تماس با ما - اسکریپت صفحه
========================================================================== */

(() => {

    const PAGE_SIZE = 7;

    let state = {
        search: '',
        status: 'all',
        sort: 'newest',
        page: 1
    };

    // اطلاعات واقعی از API
    let contacts = [];


    // =========================================================
    // شروع صفحه
    // =========================================================
    document.addEventListener('DOMContentLoaded', async () => {

        CafeShell.mount({
            page: 'contacts',
            title: 'تماس با ما',
            breadcrumb: 'کافه معدن / تماس با ما'
        });

        bindControls();

        await loadContacts();
    });


    // =========================================================
    // دریافت اطلاعات از API
    // =========================================================
  async function loadContacts() {
    try {
        const accessToken = localStorage.getItem("accessToken");

const response = await fetch("/user", {
    method: "GET",
    headers: {
        "Authorization": `Bearer ${accessToken}`
    }
});

        if (!response.ok) {
            throw new Error(`خطا: ${response.status}`);
        }

        const data = await response.json();

        console.log("USERS API DATA:", data);

        contacts = data;

        state.page = 1;
        render();

    } catch (error) {
        console.error("Load Users Error:", error);
    }
}


    // =========================================================
    // کنترل فیلترها
    // =========================================================
    function bindControls() {

        const searchInput =
            document.getElementById('search-input');

        const sortSelect =
            document.getElementById('sort-select');


        // جستجو
        if (searchInput) {

            searchInput.addEventListener(
                'input',
                CafeUtils.debounce((e) => {

                    state.search =
                        e.target.value.trim().toLowerCase();

                    state.page = 1;

                    render();

                }, 250)
            );
        }


        // مرتب سازی
        if (sortSelect) {

            sortSelect.addEventListener('change', (e) => {

                state.sort = e.target.value;

                state.page = 1;

                render();
            });
        }


        // وضعیت
        document
            .querySelectorAll('#status-chips .chip')
            .forEach(chip => {

                chip.addEventListener('click', () => {

                    document
                        .querySelectorAll('#status-chips .chip')
                        .forEach(c =>
                            c.classList.remove('is-active')
                        );

                    chip.classList.add('is-active');

                    state.status =
                        chip.dataset.status;

                    state.page = 1;

                    render();
                });

            });
    }


    // =========================================================
    // فیلتر اطلاعات
    // =========================================================
    function getFiltered() {

    let list = [...contacts];

    // =========================
    // فیلتر وضعیت
    // =========================
    if (state.status !== 'all') {

    list = list.filter(item => {

        const status = String(item.status || '').trim();

        console.log({
            name: item.name,
            status: status,
            selected: state.status,
            match: status === state.status
        });

        return status === state.status;
    });
}

    // =========================
    // جستجو
    // =========================
    if (state.search) {

        list = list.filter(item => {

            const name =
                String(item.name || '').toLowerCase();

            const company =
                String(item.compenyname || '').toLowerCase();

            const phone =
                String(item.phone || '').toLowerCase();

            const email =
                String(item.email || '').toLowerCase();

            const message =
                String(item.message || '').toLowerCase();

            return (
                name.includes(state.search) ||
                company.includes(state.search) ||
                phone.includes(state.search) ||
                email.includes(state.search) ||
                message.includes(state.search)
            );
        });
    }

    // =========================
    // مرتب سازی
    // =========================
    list.sort((a, b) => {

        const dateA =
            new Date(a.creatAt || 0);

        const dateB =
            new Date(b.creatAt || 0);

        if (state.sort === 'newest') {
            return dateB - dateA;
        }

        return dateA - dateB;
    });

    return list;
}


    // =========================================================
    // Render
    // =========================================================
    function render() {

        const list = getFiltered();

        const totalItems = list.length;

        const totalPages =
            Math.max(
                1,
                Math.ceil(totalItems / PAGE_SIZE)
            );


        // اگر صفحه فعلی بیشتر از تعداد صفحات شد
        if (state.page > totalPages) {
            state.page = totalPages;
        }


        const start =
            (state.page - 1) * PAGE_SIZE;

        const end =
            start + PAGE_SIZE;


        const pageItems =
            list.slice(start, end);


        renderTable(pageItems);

        renderPagination(
            totalPages,
            totalItems,
            pageItems.length
        );
    }


    // =========================================================
    // نمایش جدول
    // =========================================================
    function renderTable(items) {

        const tbody =
            document.getElementById("users-tbody");

        if (!tbody) return;


        tbody.innerHTML = "";


        if (items.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td
                        colspan="7"
                        style="text-align:center;padding:30px;"
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

                <td >${realIndex}</td>

                <td style="font-size: 1.2rem;">
                    ${CafeUtils.escapeHtml(
                        item.name || ''
                    )}
                </td>


                <td style="font-size: 1.2rem;">
                    ${CafeUtils.escapeHtml(
                        item.lastname || ''
                    )}
                </td>


                 <td style="font-size: 1.2rem;">
                    ${CafeUtils.escapeHtml(
                        item.email || ''
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
                        item.creatAt
                            ? new Date(item.creatAt)
                                .toLocaleDateString("fa-IR")
                            : ''
                    }
                </td>


              <td>
    <div
        class="role-dropdown"
        data-id="${item.id}"
    >

        <button
            type="button"
            class="role-dropdown__trigger"
        >
            <span class="role-dropdown__current">
                ${
                    item.role === 'admin'
                        ? `
                            <span class="role-badge role-badge--admin">
                                <i class="bi bi-shield-check"></i>
                                ادمین
                            </span>
                        `
                        : `
                            <span class="role-badge role-badge--user">
                                <i class="bi bi-person"></i>
                                کاربر
                            </span>
                        `
                }
            </span>

            <i class="bi bi-chevron-down role-dropdown__arrow"></i>
        </button>


        <div class="role-dropdown__menu">

            <button
                type="button"
                class="role-option ${
                    item.role === 'user'
                        ? 'is-selected'
                        : ''
                }"
                data-role="user"
            >
                <span class="role-option__icon role-option__icon--user">
                    <i class="bi bi-person"></i>
                </span>

                <span class="role-option__content">
                    <strong>کاربر</strong>
                    <small>دسترسی معمولی</small>
                </span>

                ${
                    item.role === 'user'
                        ? `
                            <i class="bi bi-check2 role-option__check"></i>
                        `
                        : ''
                }
            </button>


            <button
                type="button"
                class="role-option ${
                    item.role === 'admin'
                        ? 'is-selected'
                        : ''
                }"
                data-role="admin"
            >
                <span class="role-option__icon role-option__icon--admin">
                    <i class="bi bi-shield-check"></i>
                </span>

                <span class="role-option__content">
                    <strong>ادمین</strong>
                    <small>دسترسی مدیریت</small>
                </span>

                ${
                    item.role === 'admin'
                        ? `
                            <i class="bi bi-check2 role-option__check"></i>
                        `
                        : ''
                }
            </button>

        </div>
    </div>
</td>


                <td style="display:flex;gap:8px;">

                    <button
                        onclick="deleteUser('${item.id}')"
                        style="
                            background:#0a0a0a;
                            color:white;
                            border:none;
                            padding:8px 12px;
                            border-radius:8px;
                            cursor:pointer;
                            font-size: 1rem;
                        "
                    >
                        <i  class="bi bi-trash"></i>
                    </button>
                </td>
            `;


            tbody.appendChild(row);
        });
        bindRoleDropdowns   ();
    }


 function bindRoleDropdowns() {

    const tbody = document.getElementById('users-tbody');

    if (!tbody) return;

    // جلوگیری از ثبت چندباره event
    if (tbody.dataset.roleBound === 'true') {
        return;
    }

    tbody.dataset.roleBound = 'true';

    tbody.addEventListener('click', async function (e) {

        // ==========================================
        // کلیک روی دکمه اصلی Dropdown
        // ==========================================

        const trigger =
            e.target.closest('.role-dropdown__trigger');

        if (trigger) {

            e.preventDefault();
            e.stopPropagation();

            const dropdown =
                trigger.closest('.role-dropdown');

            if (!dropdown) return;

            // بستن سایر dropdownها
            tbody
                .querySelectorAll('.role-dropdown.is-open')
                .forEach(other => {

                    if (other !== dropdown) {
                        other.classList.remove('is-open');
                    }

                });

            // باز / بسته کردن
            dropdown.classList.toggle('is-open');

            return;
        }


        // ==========================================
        // کلیک روی گزینه نقش
        // ==========================================

        const option =
            e.target.closest('.role-option');

        if (option) {

    e.preventDefault();
    e.stopPropagation();

    const dropdown =
        option.closest('.role-dropdown');

    if (!dropdown) return;

    const id =
        dropdown.dataset.id;

    const newRole =
        option.dataset.role;

    console.log('ROLE CLICK:', {
        id,
        newRole
    });

    const user =
        contacts.find(
            item =>
                String(item.id) === String(id)
        );

    if (!user) {
        console.error('User not found:', id);
        return;
    }

    try {

        const accessToken = localStorage.getItem("accessToken");

console.log("ROLE ACCESS TOKEN:", accessToken);

const response = await fetch(`/userrole/${id}`, {
    method: "PUT",

    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
    },

    body: JSON.stringify({
        role: newRole
    })
});

        if (!response.ok) {
            throw new Error("تغییر role انجام نشد");
        }

        // فقط بعد از موفقیت Backend
        user.role = newRole;

        dropdown.classList.remove('is-open');

        render();

        CafeUI.toast({
            type: 'success',
            title: 'نقش تغییر کرد',
            desc:
                newRole === 'admin'
                    ? 'کاربر به ادمین تبدیل شد.'
                    : 'ادمین به کاربر تبدیل شد.'
        });

    } catch (error) {

        console.error("Update Role Error:", error);

        CafeUI.toast({
            type: 'error',
            title: 'خطا',
            desc: 'تغییر نقش انجام نشد.'
        });
    }

    return;
}

    });
}



document.addEventListener('click', function () {

    document
        .querySelectorAll('.role-dropdown.is-open')
        .forEach(dropdown => {
            dropdown.classList.remove('is-open');
        });

});



    // =========================================================
    // Pagination
    // =========================================================
    function renderPagination(
        totalPages,
        totalItems,
        currentPageItems
    ) {

        const container =
            document.getElementById(
                'user-pagination'
            );

        if (!container) return;


        let pages = '';


        for (
            let i = 1;
            i <= totalPages;
            i++
        ) {

            pages += `
                <button
                    class="${i === state.page
                        ? 'is-active'
                        : ''}"
                    data-page="${i}"
                >
                    ${CafeUtils.toPersianDigits(i)}
                </button>
            `;
        }


        const from =
            totalItems === 0
                ? 0
                : ((state.page - 1) * PAGE_SIZE) + 1;


        const to =
            Math.min(
                state.page * PAGE_SIZE,
                totalItems
            );


        container.innerHTML = `

            <div style="font-size: 1rem;" class="pagination__info">
                نمایش
                ${CafeUtils.formatNumber(from)}
                تا
                ${CafeUtils.formatNumber(to)}
                از
                ${CafeUtils.formatNumber(totalItems)}
                پیام
            </div>

            <div class="pagination__pages">

                <button
                    data-nav="prev"
                    ${state.page === 1 ? 'disabled' : ''}
                >
                    ‹
                </button>

                ${pages}

                <button
                    data-nav="next"
                    ${state.page === totalPages
                        ? 'disabled' : ''}
                >
                    ›
                </button>

            </div>
        `;


        // صفحات
        container
            .querySelectorAll('[data-page]')
            .forEach(btn => {

                btn.addEventListener('click', () => {

                    state.page =
                        Number(btn.dataset.page);

                    render();
                });

            });


        // قبلی
        container
            .querySelector('[data-nav="prev"]')
            ?.addEventListener('click', () => {

                if (state.page > 1) {

                    state.page--;

                    render();
                }

            });


        // بعدی
        container
            .querySelector('[data-nav="next"]')
            ?.addEventListener('click', () => {

                if (state.page < totalPages) {

                    state.page++;

                    render();
                }

            });
    }


    // =========================================================
    // Edit
    // =========================================================
    async function editUser(id) {

        try {

            const res =
                await fetch("/user");

            const users =
                await res.json();


            const user =
                users.find(x => x.id == id);


            if (!user) return;


            document.getElementById(
                "edit-id"
            ).value = user.id;


            document.getElementById(
                "edit-name"
            ).value = user.name || '';


            document.getElementById(
                "edit-company"
            ).value =
                user.compenyname || '';


            document.getElementById(
                "edit-phone"
            ).value =
                user.phone || '';


            document.getElementById(
                "edit-email"
            ).value =
                user.email || '';


            document.getElementById(
                "edit-message"
            ).value =
                user.message || '';


            document.getElementById(
                "editModal"
            ).style.display = "flex";


        } catch (error) {

            console.error(error);

        }
    }


    // =========================================================
    // Save Edit
    // =========================================================
    async function saveEdit() {

        const id =
            document.getElementById(
                "edit-id"
            ).value;


        try {

            const response =
                await fetch(
                    `/user/${id}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            name:
                                document.getElementById(
                                    "edit-name"
                                ).value,

                            compenyname:
                                document.getElementById(
                                    "edit-company"
                                ).value,

                            phone:
                                document.getElementById(
                                    "edit-phone"
                                ).value,

                            email:
                                document.getElementById(
                                    "edit-email"
                                ).value,

                            message:
                                document.getElementById(
                                    "edit-message"
                                ).value
                        })
                    }
                );


            if (response.ok) {

                closeModal();

                // دوباره اطلاعات را از API بگیر
                await loadContacts();

            } else {

                alert("ویرایش انجام نشد.");
            }


        } catch (error) {

            console.error(error);

            alert("خطا در ویرایش اطلاعات");
        }
    }





   async function deleteUser(id) {
    const token = localStorage.getItem("accessToken");

    if (!confirm("آیا از حذف این مورد اطمینان دارید؟")) {
        return;
    }

    try {
        const response = await fetch(`/userrole/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        console.log("DELETE response:", response.status, data);

        if (!response.ok) {
            alert(data.message || "حذف انجام نشد.");
            return;
        }

        // حذف از آرایه‌ی اصلی
        contacts = contacts.filter(
            item => String(item.id) !== String(id)
        );

        // اگر صفحه فعلی بعد از حذف خالی شد،
        // به صفحه قبل برو
        const filtered = getFiltered();

        const totalPages = Math.max(
            1,
            Math.ceil(filtered.length / PAGE_SIZE)
        );

        if (state.page > totalPages) {
            state.page = totalPages;
        }

        // بدون رفرش، جدول را دوباره رسم کن
        render();

        CafeUI.toast({
            type: "success",
            title: "حذف شد",
            desc: data.message || "کاربر با موفقیت حذف شد."
        });

    } catch (error) {
        console.error("Delete Error:", error);

        CafeUI.toast({
            type: "error",
            title: "خطا",
            desc: "حذف اطلاعات انجام نشد."
        });
    }
}


    // =========================================================
    // Close Modal
    // =========================================================
    function closeModal() {

        document.getElementById(
            "editModal"
        ).style.display = "none";
    }



    
async function markAsReviewed() {

    const id =
        document.getElementById("edit-id").value;

    if (!id) {
        return;
    }

    try {

        const response = await fetch(
            `/user/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    status: "بررسی شده"
                })
            }
        );

        if (!response.ok) {
            throw new Error("تغییر وضعیت انجام نشد");
        }

        // بستن مودال
        closeModal();

        // دوباره گرفتن اطلاعات
        await loadContacts();

        // رفتن به تب بررسی شده
        document
            .querySelectorAll("#status-chips .chip")
            .forEach(chip => {

                chip.classList.remove("is-active");

                if (
                    chip.dataset.status === "بررسی شده"
                ) {
                    chip.classList.add("is-active");
                }
            });

        state.status = "بررسی شده";
        state.page = 1;

        render();

    } catch (error) {

        console.error(error);

        alert("تغییر وضعیت انجام نشد.");
    }
}


    // =========================================================
    // Global functions
    // =========================================================
    window.editUser = editUser;
    window.saveEdit = saveEdit;
    window.closeModal = closeModal;
    window.markAsReviewed = markAsReviewed;
    window.deleteUser = deleteUser

    // =========================================================
    // View
    // =========================================================
    function view(id) {

        const c =
            contacts.find(
                item => item.id == id
            );


        if (!c) return;


        document.getElementById(
            'inquiry-detail-body'
        ).innerHTML = `

            <div
                class="form-grid form-grid--1"
                style="gap:var(--sp-4);"
            >

                <div>
                    <div class="text-xs text-muted">
                        نام و نام خانوادگی
                    </div>

                    <div class="font-semibold">
                        ${CafeUtils.escapeHtml(
                            c.name || ''
                        )}
                    </div>
                </div>


                <div>
                    <div class="text-xs text-muted">
                        نام شرکت
                    </div>

                    <div class="font-semibold">
                        ${CafeUtils.escapeHtml(
                            c.compenyname || ''
                        )}
                    </div>
                </div>


                <div>
                    <div class="text-xs text-muted">
                        شماره تماس
                    </div>

                    <div
                        class="font-semibold cell-ltr"
                        style="text-align:right;"
                    >
                        ${CafeUtils.formatPhone(
                            c.phone || ''
                        )}
                    </div>
                </div>


                <div>
                    <div class="text-xs text-muted">
                        ایمیل
                    </div>

                    <div
                        class="font-semibold cell-ltr"
                        style="text-align:right;"
                    >
                        ${CafeUtils.escapeHtml(
                            c.email || ''
                        )}
                    </div>
                </div>


                <div>
                    <div class="text-xs text-muted">
                        تاریخ ارسال
                    </div>

                    <div class="font-semibold">
                        ${
                            c.creatAt
                                ? new Date(c.creatAt)
                                    .toLocaleDateString(
                                        "fa-IR"
                                    )
                                : ''
                        }
                    </div>
                </div>


                <div>

                    <div
                        class="text-xs text-muted"
                        style="margin-bottom:6px;"
                    >
                        متن پیام
                    </div>

                    <div
                        style="
                            background:var(--color-gray-100);
                            border-radius:var(--radius-md);
                            padding:var(--sp-4);
                            line-height:1.9;
                        "
                    >
                        ${CafeUtils.escapeHtml(
                            c.message || ''
                        )}
                    </div>

                </div>

            </div>
        `;


        document.getElementById(
            'contact-call-btn'
        ).href =
            `tel:${CafeUtils.toEnglishDigits(
                c.phone || ''
            )}`;


        CafeUI.openModal(
            'view-contact-modal'
        );
    }



    window.ContactsPage = {
        view,
    };

})();