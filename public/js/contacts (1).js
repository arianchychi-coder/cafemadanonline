/* ==========================================================================
Contact Requests Page Script
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
                        const token = localStorage.getItem("accessToken");
    try {

        if (!token) {
            alert("توکن پیدا نشد");
            window.location.href = "login (1).html";
            return;
        }

        const response = await fetch("/api/admin", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        console.log("STATUS:", response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            console.log("ERROR RESPONSE:", errorData);

            if (response.status === 401 || response.status === 403) {
                alert("شما اجازه دسترسی به این صفحه را ندارید");
                window.location.href = "login (1).html";
                return;
            }

            throw new Error(
                errorData.message || "خطا در دریافت اطلاعات"
            );
        }

        contacts = await response.json();

        console.log("API CONTACTS:", contacts);

        state.page = 1;
        render();

    } catch (error) {
        console.error("Load Contacts Error:", error);

        const tbody = document.getElementById("contacts-tbody");

        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9"
                        style="text-align:center;padding:30px;">
                        خطا در دریافت اطلاعات
                    </td>
                </tr>
            `;
        }
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
            new Date(a.createdAt || 0);

        const dateB =
            new Date(b.createdAt || 0);

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
            document.getElementById("contacts-tbody");

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
                        item.compenyname || ''
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
                    ${CafeUtils.escapeHtml(
                        item.email || ''
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

                <td style="font-size: 1.2rem;">
                    ${CafeUtils.escapeHtml(
                        item.message || ''
                    )}
                </td>

                <td style="display:flex;gap:8px;">

                    <button
                        onclick="editUser('${item.id}')"
                        style="
                            background:#F3B300;
                            color:black;
                            border:none;
                            padding:8px 12px;
                            border-radius:8px;
                            cursor:pointer;
                            font-size: 1rem;
                        "
                    >
                        <i class="bi bi-pencil-square"></i>
                    </button>
                </td>

                <td>
                <button
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
                'contacts-pagination'
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
                        ? 'disabled'
                        : ''}
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

    const token = localStorage.getItem("accessToken");

    if (!token) {
        alert("توکن پیدا نشد");
        window.location.href = "login (1).html";
        return;
    }

    try {

        // اطلاعات را از آرایه فعلی پیدا کن
        const user = contacts.find(x => x.id == id);

        if (!user) {
            alert("اطلاعات مورد نظر پیدا نشد");
            return;
        }

        document.getElementById("edit-id").value = user.id;

        document.getElementById("edit-name").value =
            user.name || "";

        document.getElementById("edit-company").value =
            user.compenyname || "";

        document.getElementById("edit-phone").value =
            user.phone || "";

        document.getElementById("edit-email").value =
            user.email || "";

        document.getElementById("edit-message").value =
            user.message || "";

        document.getElementById("editModal").style.display = "flex";

    } catch (error) {

        console.error("Edit User Error:", error);

        alert("خطا در باز کردن اطلاعات");
    }
}


// =========================================================
// Delete
// =========================================================
async function deleteUser(id) {

    if (!confirm("آیا از حذف حساب مطمئن هستید؟")) {
        return;
    }

    const token = localStorage.getItem("accessToken");

    if (!token) {
        alert("توکن پیدا نشد");
        window.location.href = "login (1).html";
        return;
    }

    try {

        const response = await fetch(
            `/api/admin/${id}`,
            {
                method: "DELETE",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        console.log("DELETE STATUS:", response.status);

        if (response.status === 401 || response.status === 403) {

            alert("شما اجازه حذف این اطلاعات را ندارید");

            window.location.href = "login (1).html";

            return;
        }

        if (!response.ok) {

            const errorData =
                await response.json().catch(() => ({}));

            throw new Error(
                errorData.message || "حذف انجام نشد"
            );
        }


        // ==========================================
        // حذف از آرایه بدون درخواست مجدد به API
        // ==========================================

        contacts = contacts.filter(
            item => item.id != id
        );


        // ==========================================
        // نمایش دوباره جدول بدون Refresh
        // ==========================================

        render();


        // اگر مودال باز بود، ببند
        closeModal();


        // پیام موفقیت
        if (typeof CafeUI !== "undefined" && CafeUI.toast) {

            CafeUI.toast({
                type: "success",
                title: "حذف شد",
                desc: "پیام مورد نظر حذف گردید."
            });

        } else {

            console.log("اطلاعات با موفقیت حذف شد.");

        }

    } catch (error) {

        console.error("Delete User Error:", error);

        alert(
            error.message || "خطا در حذف اطلاعات"
        );
    }
}


// =========================================================
// Save Edit
// =========================================================
async function saveEdit() {

    const id =
        document.getElementById("edit-id").value;

    const token =
        localStorage.getItem("accessToken");


    if (!token) {

        alert("توکن پیدا نشد");

        window.location.href =
            "login (1).html";

        return;
    }


    if (!id) {

        alert("شناسه اطلاعات پیدا نشد");

        return;
    }


    // ==========================================
    // اطلاعات جدید فرم
    // ==========================================

    const updatedData = {

        name:
            document.getElementById("edit-name").value.trim(),

        compenyname:
            document.getElementById("edit-company").value.trim(),

        phone:
            document.getElementById("edit-phone").value.trim(),

        email:
            document.getElementById("edit-email").value.trim(),

        message:
            document.getElementById("edit-message").value.trim()
    };


    try {

        const response = await fetch(
            `/api/admin/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",

                    "Authorization":
                        `Bearer ${token}`
                },

                body: JSON.stringify(updatedData)
            }
        );


        console.log(
            "UPDATE STATUS:",
            response.status
        );


        if (response.status === 401 ||
            response.status === 403) {

            alert(
                "شما اجازه ویرایش این اطلاعات را ندارید"
            );

            window.location.href =
                "login (1).html";

            return;
        }


        if (!response.ok) {

            const errorData =
                await response.json()
                    .catch(() => ({}));

            throw new Error(
                errorData.message ||
                "ویرایش انجام نشد"
            );
        }


        // ==========================================
        // پیدا کردن آیتم داخل آرایه فعلی
        // ==========================================

        const index =
            contacts.findIndex(
                item => item.id == id
            );


        if (index !== -1) {

            // اطلاعات جدید را روی همان آیتم اعمال کن

            contacts[index] = {

                ...contacts[index],

                ...updatedData
            };
        }


        // ==========================================
        // بستن Modal
        // ==========================================

        closeModal();


        // ==========================================
        // رندر مجدد جدول بدون Refresh
        // ==========================================

        render();


        // ==========================================
        // پیام موفقیت
        // ==========================================

        if (
            typeof CafeUI !== "undefined" &&
            CafeUI.toast
        ) {

            CafeUI.toast({

                type: "success",

                title: "ویرایش شد",

                desc:
                    "اطلاعات با موفقیت ویرایش شد."
            });

        } else {

            console.log(
                "اطلاعات با موفقیت ویرایش شد."
            );
        }


    } catch (error) {

        console.error(
            "Save Edit Error:",
            error
        );

        alert(
            error.message ||
            "خطا در ویرایش اطلاعات"
        );
    }
}


// =========================================================
// Close Modal
// =========================================================
function closeModal() {

    const modal =
        document.getElementById("editModal");

    if (modal) {

        modal.style.display = "none";
    }
}


// =========================================================
// Mark As Reviewed
// =========================================================
async function markAsReviewed() {

    const id =
        document.getElementById("edit-id").value;

    const token =
        localStorage.getItem("accessToken");


    if (!id) {
        return;
    }


    if (!token) {

        alert("توکن پیدا نشد");

        window.location.href =
            "login (1).html";

        return;
    }


    try {

        const response = await fetch(
            `/api/admin/${id}`,
            {
                method: "PUT",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${token}`
                },

                body: JSON.stringify({

                    status: "بررسی شده"
                })
            }
        );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            alert(
                "شما اجازه تغییر وضعیت را ندارید"
            );

            window.location.href =
                "login (1).html";

            return;
        }


        if (!response.ok) {

            const errorData =
                await response.json()
                    .catch(() => ({}));

            throw new Error(
                errorData.message ||
                "تغییر وضعیت انجام نشد"
            );
        }


        // ==========================================
        // تغییر وضعیت داخل آرایه بدون API مجدد
        // ==========================================

        const index =
            contacts.findIndex(
                item => item.id == id
            );


        if (index !== -1) {

            contacts[index].status =
                "بررسی شده";
        }


        // بستن Modal
        closeModal();


        // ==========================================
        // تغییر تب به "بررسی شده"
        // ==========================================

        document
            .querySelectorAll(
                "#status-chips .chip"
            )
            .forEach(chip => {

                chip.classList.remove(
                    "is-active"
                );


                if (
                    chip.dataset.status ===
                    "بررسی شده"
                ) {

                    chip.classList.add(
                        "is-active"
                    );
                }
            });


        state.status =
            "بررسی شده";

        state.page = 1;


        // ==========================================
        // رندر بدون Refresh
        // ==========================================

        render();


        // پیام موفقیت
        if (
            typeof CafeUI !== "undefined" &&
            CafeUI.toast
        ) {

            CafeUI.toast({

                type: "success",

                title: "تغییر کرد",

                desc:
                    "وضعیت پیام به «بررسی شده» تغییر کرد."
            });
        }


    } catch (error) {

        console.error(
            "Mark As Reviewed Error:",
            error
        );

        alert(
            error.message ||
            "تغییر وضعیت انجام نشد."
        );
    }
}


    // =========================================================
    // Global functions
    // =========================================================
    window.editUser = editUser;
    window.deleteUser = deleteUser;
    window.saveEdit = saveEdit;
    window.closeModal = closeModal;
    window.markAsReviewed = markAsReviewed;


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
            'contact-detail-body'
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
                            c.createdAt
                                ? new Date(c.createdAt)
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


    // =========================================================
    // Remove
    // =========================================================
    function remove(id) {

        CafeUI.confirmDelete({

            title: 'حذف پیام',

            desc:
                'آیا از حذف این پیام تماس با ما مطمئن هستید؟',

            onConfirm: async () => {

                await deleteUser(id);

                CafeUI.toast({
                    type: 'success',
                    title: 'حذف شد',
                    desc:
                        'پیام مورد نظر حذف گردید.'
                });

            }
        });
    }


    window.ContactsPage = {
        view,
        remove
    };

})();