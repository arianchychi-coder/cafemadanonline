/* ==========================================================================
List Page Script (Reusable)
========================================================================== */
console.log("🔥 NEW all-podcasts.js LOADED");
(() => {

    const PAGE_SIZE = 7;

    let state = {
        search: '',
        status: 'all',
        sort: 'newest',
        page: 1
    };

    // اطلاعات واقعی از API
    let items = [];


    // =========================================================
    // شروع صفحه
    // =========================================================
    document.addEventListener('DOMContentLoaded', async () => {

        CafeShell.mount({
            page: 'allPodcast',
            title: 'لیست پادکست ها',
            breadcrumb: 'کافه معدن / پادکست‌ها / لیست'
        });

        bindControls();
        await loadData()

    });


    async function loadData() {
    try {
        const response = await fetch('/api/podcast');

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log("API RESPONSE:", data);

        items = Array.isArray(data)
            ? data
            : (data.items || data.data || []);

        state.page = 1;
        render();

    } catch (error) {
        console.error('خطا در دریافت پادکست‌ها:', error);

        items = [];
        render();
    }
}


    // =========================================================
    // دریافت اطلاعات از API
    // =========================================================


    // =========================================================
    // کنترل فیلترها
    // =========================================================
    function bindControls() {
        const searchInput = document.getElementById('search-input');
        const sortSelect  = document.getElementById('sort-select');

        // جستجو
        if (searchInput) {
            searchInput.addEventListener('input', CafeUtils.debounce((e) => {
                state.search = e.target.value.trim().toLowerCase();
                state.page = 1;
                render();
            }, 250));
        }

        // مرتب‌سازی
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                state.sort = e.target.value;
                state.page = 1;
                render();
            });
        }

        // وضعیت
        document.querySelectorAll('#status-chips .chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('#status-chips .chip')
                    .forEach(c => c.classList.remove('is-active'));

                chip.classList.add('is-active');
                state.status = chip.dataset.status;
                state.page = 1;
                render();
            });
        });
    }


    // =========================================================
    // فیلتر اطلاعات
    // =========================================================
    function getFiltered() {
        let list = [...items];

        // فیلتر وضعیت
        if (state.status !== 'all') {
            list = list.filter(item => {
                const status = String(item.status || '').trim();
                return status === state.status;
            });
        }

        // جستجو
        if (state.search) {
            list = list.filter(item => {
                const title    = String(item.title || '').toLowerCase();
                const episod = String(item.episod || '').toLowerCase();
                const createdAT = String(item.createdAT || '').toLowerCase();
                const time   = String(item.time || '').toLowerCase();
                const status = String(item.status || '').toLowerCase();
                const audio = String(item.audio || '').toLowerCase();
                const cover = String(item.cover || '').toLowerCase();
                const appleMusic = String(item.apple_music || '').toLowerCase();
                const castbox = String(item.castbox || '').toLowerCase();
                const soundcloud = String(item.soundcloud || '').toLowerCase();

                return (
                    title.includes(state.search) ||
                    episod.includes(state.search) ||
                    createdAT.includes(state.search) ||
                    time.includes(state.search) ||
                    status.includes(state.search) ||
                    audio.includes(state.search) ||
                    cover.includes(state.search) ||
                    link.includes(state.search) ||
                    appleMusic.includes(state.search) ||
                    castbox.includes(state.search) ||
                    soundcloud.includes(state.search)
                )
            });
        }

        // مرتب‌سازی
        list.sort((a, b) => {
            const dateA = new Date(a.createdAT || 0);
            const dateB = new Date(b.createdAT || 0);

            return state.sort === 'newest'
                ? dateB - dateA
                : dateA - dateB;
        });

        return list;
    }


    // =========================================================
    // Render
    // =========================================================
    function render() {
        const list = getFiltered();
        const totalItems = list.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

        if (state.page > totalPages) {
            state.page = totalPages;
        }

        const start = (state.page - 1) * PAGE_SIZE;
        const end   = start + PAGE_SIZE;
        const pageItems = list.slice(start, end);

        renderTable(pageItems);
        renderPagination(totalPages, totalItems, pageItems.length);
    }



    function getFileName(path) {
    if (!path) return '';

    // اگر URL یا مسیر کامل باشد
    return String(path)
        .split(/[\\/]/)
        .pop()
        .split('?')[0];
}

    // =========================================================
    // نمایش جدول
    // =========================================================
    function renderTable(pageItems) {
    const tbody = document.getElementById("podcast-tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (pageItems.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;padding:30px;">
                    موردی پیدا نشد
                </td>
            </tr>
        `;
        return;
    }

    pageItems.forEach((item, index) => {

        const row = document.createElement("tr");

        const realIndex =
            ((state.page - 1) * PAGE_SIZE) + index + 1;

        const audioFile = getFileName(item.audio);
        const imageFile = getFileName(item.cover);

        row.innerHTML = `
            <td>${realIndex}</td>

            <td style="font-size:1.2rem;">
                ${CafeUtils.escapeHtml(item.title || '')}
            </td>

            <td style="font-size:1.2rem;">
                ${CafeUtils.escapeHtml(item.episod || '')}
            </td>

            <td style="font-size:1.2rem;">
                ${
                    item.createdAT
                        ? new Date(item.createdAT).toLocaleDateString("fa-IR")
                        : ''
                }
            </td>

            <td style="font-size:1.2rem;">
                ${CafeUtils.escapeHtml(item.time || '')}
            </td>

            <td style="font-size:1.2rem;">
                ${CafeUtils.escapeHtml(item.status || '')}
            </td>

            <td style="font-size:1rem;">
                ${
                    audioFile
                        ? `<i class="bi bi-music-note-beamed"></i>
                           ${CafeUtils.escapeHtml(audioFile)}`
                        : '—'
                }
            </td>

            <td style="font-size:1rem;">
                ${
                    imageFile
                        ? `<i class="bi bi-image"></i>
                           ${CafeUtils.escapeHtml(imageFile)}`
                        : '—'
                }
            </td>

            <td style="font-size:1rem;">
    <div style="display:flex;flex-direction:column;gap:8px;">

        ${
            item.apple_music
                ? `<a href="${CafeUtils.escapeHtml(item.apple_music)}"
                      target="_blank"
                      rel="noopener noreferrer"
                      style="text-decoration:none;">
                        🎵 Apple Music
                   </a>`
                : ''
        }

        ${
            item.castbox
                ? `<a href="${CafeUtils.escapeHtml(item.castbox)}"
                      target="_blank"
                      rel="noopener noreferrer"
                      style="text-decoration:none;">
                        📦 Castbox
                   </a>`
                : ''
        }

        ${
            item.soundcloud
                ? `<a href="${CafeUtils.escapeHtml(item.soundcloud)}"
                      target="_blank"
                      rel="noopener noreferrer"
                      style="text-decoration:none;">
                        ☁️ SoundCloud
                   </a>`
                : ''
        }

        ${
            !item.apple_music &&
            !item.castbox &&
            !item.soundcloud
                ? '—'
                : ''
        }

    </div>
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
                            margin-bottom:2rem;
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
    function renderPagination(totalPages, totalItems, currentPageItems) {
        const container = document.getElementById('list-pagination');
        if (!container) return;

        let pages = '';
        for (let i = 1; i <= totalPages; i++) {
            pages += `
                <button
                    class="${i === state.page ? 'is-active' : ''}"
                    data-page="${i}"
                >
                    ${CafeUtils.toPersianDigits(i)}
                </button>
            `;
        }

        const from = totalItems === 0 ? 0 : ((state.page - 1) * PAGE_SIZE) + 1;
        const to   = Math.min(state.page * PAGE_SIZE, totalItems);

        container.innerHTML = `
            <div style="font-size: 1rem;" class="pagination__info">
                نمایش
                ${CafeUtils.formatNumber(from)}
                تا
                ${CafeUtils.formatNumber(to)}
                از
                ${CafeUtils.formatNumber(totalItems)}
                مورد
            </div>

            <div class="pagination__pages">
                <button data-nav="prev" ${state.page === 1 ? 'disabled' : ''}>
                    ‹
                </button>
                ${pages}
                <button data-nav="next" ${state.page === totalPages ? 'disabled' : ''}>
                    ›
                </button>
            </div>
        `;

        // صفحات
        container.querySelectorAll('[data-page]').forEach(btn => {
            btn.addEventListener('click', () => {
                state.page = Number(btn.dataset.page);
                render();
            });
        });

        // قبلی
        container.querySelector('[data-nav="prev"]')?.addEventListener('click', () => {
            if (state.page > 1) {
                state.page--;
                render();
            }
        });

        // بعدی
        container.querySelector('[data-nav="next"]')?.addEventListener('click', () => {
            if (state.page < totalPages) {
                state.page++;
                render();
            }
        });
    }


// =========================================================
// Edit
// =========================================================

function editUser(id) {

    try {

        console.log("EDIT ID:", id);

        // پیدا کردن پادکست از اطلاعات فعلی صفحه
        const podcast = items.find(
            x => String(x.id) === String(id)
        );

        if (!podcast) {
            alert("پادکست پیدا نشد");
            return;
        }

        console.log("FOUND PODCAST:", podcast);

        // ذخیره ID
        document.getElementById("podcast-id").value = podcast.id;

        // اطلاعات
        document.getElementById("edit-title").value =
            podcast.title || "";

        document.getElementById("edit-episod").value =
            podcast.episod || "";

        document.getElementById("edit-createdAT").value =
            podcast.createdAT || "";

        document.getElementById("edit-time").value =
            podcast.time || "";

        document.getElementById("edit-status").value =
            podcast.status || "";

        // فایل‌های جدید
        document.getElementById("edit-audio").value = "";
        document.getElementById("edit-cover").value = "";

        // نمایش نام فایل‌ها
        const audioFileName =
            document.getElementById("audio-file-name");

        if (audioFileName) {
            audioFileName.textContent =
                "انتخاب فایل صوتی";
        }

        const coverFileName =
            document.getElementById("cover-file-name");

        if (coverFileName) {
            coverFileName.textContent =
                "انتخاب تصویر کاور";
        }


        document.getElementById("edit-apple-music").value =
    podcast.apple_music || "";

document.getElementById("edit-castbox").value =
    podcast.castbox || "";

document.getElementById("edit-soundcloud").value =
    podcast.soundcloud || "";

        // نمایش کاور قبلی
        const preview =
            document.getElementById("cover-preview");

        if (preview) {

            if (podcast.cover) {

                preview.src = podcast.cover;
                preview.style.display = "block";

            } else {

                preview.src = "";
                preview.style.display = "none";

            }
        }

        // باز کردن Modal
        document.getElementById(
            "editPodcastModal"
        ).style.display = "flex";

    } catch (error) {

        console.error("Edit error:", error);

        alert("خطا در باز کردن اطلاعات پادکست");
    }
}


// =========================================================
// Save Edit
// =========================================================

async function saveEdit() {

    const token = localStorage.getItem("accessToken")
    const id =
        document.getElementById("podcast-id").value;

    console.log("FRONTEND ID:", id);

    if (!id) {
        alert("شناسه پادکست پیدا نشد");
        return;
    }

    try {

        const formData = new FormData();

        formData.append(
            "title",
            document.getElementById("edit-title").value.trim()
        );

        formData.append(
            "episod",
            document.getElementById("edit-episod").value.trim()
        );

        formData.append(
            "createdAT",
            document.getElementById("edit-createdAT").value.trim()
        );

        formData.append(
            "time",
            document.getElementById("edit-time").value.trim()
        );

        formData.append(
            "status",
            document.getElementById("edit-status").value
        );


        // فایل صوتی جدید
        const audioInput =
            document.getElementById("edit-audio");

        if (
            audioInput &&
            audioInput.files &&
            audioInput.files.length > 0
        ) {

            formData.append(
                "audio",
                audioInput.files[0]
            );
        }


        // کاور جدید
        const coverInput =
            document.getElementById("edit-cover");

        if (
            coverInput &&
            coverInput.files &&
            coverInput.files.length > 0
        ) {

            formData.append(
                "cover",
                coverInput.files[0]
            );
        }


        formData.append(
    "apple_music",
    document.getElementById("edit-apple-music")?.value.trim() || ""
);

formData.append(
    "castbox",
    document.getElementById("edit-castbox")?.value.trim() || ""
);

formData.append(
    "soundcloud",
    document.getElementById("edit-soundcloud")?.value.trim() || ""
);


        const response = await fetch(
            `/api/podcast/${id}`,
            {
                method: "PUT",
                headers:{"Authorization" : `Bearer ${token}`},
                body: formData
            }
        );


        const data =
            await response.json().catch(() => ({}));


        if (!response.ok) {

            alert(
                data.message ||
                "ویرایش پادکست انجام نشد"
            );

            return;
        }


        // ==========================================
        // آپدیت آرایه فعلی بدون درخواست مجدد
        // ==========================================

        const index =
            items.findIndex(
                x => String(x.id) === String(id)
            );


        if (index !== -1) {

            items[index] = {

                ...items[index],

                title:
                    document.getElementById(
                        "edit-title"
                    ).value.trim(),

                episod:
                    document.getElementById(
                        "edit-episod"
                    ).value.trim(),

                createdAT:
                    document.getElementById(
                        "edit-createdAT"
                    ).value.trim(),

                time:
                    document.getElementById(
                        "edit-time"
                    ).value.trim(),

                status:
                    document.getElementById(
                        "edit-status"
                    ).value
            };


            // اگر API اطلاعات فایل جدید را برگرداند
            if (data.podcast) {

                items[index] = {
                    ...items[index],
                    ...data.podcast
                };

            } else if (data.data) {

                items[index] = {
                    ...items[index],
                    ...data.data
                };
            }
        }


        // بستن Modal
        closeModal();


        // رندر دوباره بدون Refresh
        render();


        if (
            typeof CafeUI !== "undefined" &&
            CafeUI.toast
        ) {

            CafeUI.toast({

                type: "success",

                title: "ویرایش شد",

                desc:
                    "پادکست با موفقیت ویرایش شد."
            });

        } else {

            alert(
                data.message ||
                "پادکست با موفقیت ویرایش شد."
            );
        }


    } catch (error) {

        console.error(
            "Save Edit Error:",
            error
        );

        alert(
            error.message ||
            "خطا در ویرایش پادکست"
        );
    }
}


// =========================================================
// Delete
// =========================================================

async function deleteUser(id) {


    const token = localStorage.getItem("accessToken")

    if (
        !confirm(
            "آیا از حذف این پادکست اطمینان دارید؟"
        )
    ) {
        return;
    }


    try {

        const response = await fetch(
            `/api/podcast/${id}`,
            {
                method: "DELETE",
                headers:{"Authorization" : `Bearer ${token}`}
            }
        );


        const data =
            await response.json().catch(() => ({}));


        console.log(
            "DELETE STATUS:",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "حذف پادکست انجام نشد"
            );
        }


        // ==========================================
        // حذف از آرایه فعلی
        // ==========================================

        items = items.filter(
            x =>
                String(x.id) !==
                String(id)
        );


        // ==========================================
        // رندر بدون Refresh
        // ==========================================

        render();


        // بستن Modal در صورت باز بودن
        closeModal();


        if (
            typeof CafeUI !== "undefined" &&
            CafeUI.toast
        ) {

            CafeUI.toast({

                type: "success",

                title: "حذف شد",

                desc:
                    "پادکست با موفقیت حذف شد."
            });

        } else {

            alert(
                data.message ||
                "پادکست با موفقیت حذف شد."
            );
        }


    } catch (error) {

        console.error(
            "Delete Podcast Error:",
            error
        );

        alert(
            error.message ||
            "خطا در حذف پادکست"
        );
    }
}


// =========================================================
// Close Modal
// =========================================================

function closeModal() {

    const modal =
        document.getElementById(
            "editPodcastModal"
        );

    if (modal) {

        modal.style.display = "none";
    }
}


// =========================================================
// Mark As Reviewed
// =========================================================

async function markAsReviewed() {
    const id = document.getElementById("podcast-id")?.value?.trim();

    const token = localStorage.getItem("accessToken")

    if (!id) {
        alert("شناسه پادکست پیدا نشد");
        return;
    }

    try {
        const formData = new FormData();

        formData.append("title",
            document.getElementById("edit-title")?.value.trim() || ""
        );

        formData.append("episod",
            document.getElementById("edit-episod")?.value.trim() || ""
        );

        formData.append("createdAT",
            document.getElementById("edit-createdAT")?.value.trim() || ""
        );

        formData.append("time",
            document.getElementById("edit-time")?.value.trim() || ""
        );


        formData.append(
    "apple_music",
    document.getElementById("edit-apple-music")?.value.trim() || ""
);

formData.append(
    "castbox",
    document.getElementById("edit-castbox")?.value.trim() || ""
);

formData.append(
    "soundcloud",
    document.getElementById("edit-soundcloud")?.value.trim() || ""
);

        // مقدار واقعی وضعیت
        formData.append("status", "published");

        const response = await fetch(`/api/podcast/${id}`, {
            method: "PUT",
            headers:{"Authorization" : `Bearer ${token}`},
            body: formData
        });

        const data = await response.json().catch(() => ({}));

        console.log("MARK AS REVIEWED:", response.status, data);

        if (!response.ok) {
            throw new Error(
                data.message || "تغییر وضعیت انجام نشد"
            );
        }

        // آپدیت آرایه
        const index = items.findIndex(
            x => String(x.id) === String(id)
        );

        if (index !== -1) {
            items[index] = {
                ...items[index],
                status: "published"
            };

            if (data.podcast) {
                items[index] = {
                    ...items[index],
                    ...data.podcast,
                    status: "published"
                };
            }

            if (data.data) {
                items[index] = {
                    ...items[index],
                    ...data.data,
                    status: "published"
                };
            }
        }

        // انتخاب تب «بررسی شده»
        document
            .querySelectorAll("#status-chips .chip")
            .forEach(chip => {
                chip.classList.remove("is-active");

                if (chip.dataset.status === "published") {
                    chip.classList.add("is-active");
                }
            });

        state.status = "published";
        state.page = 1;

        closeModal();
        render();

        if (
            typeof CafeUI !== "undefined" &&
            CafeUI.toast
        ) {
            CafeUI.toast({
                type: "success",
                title: "تغییر کرد",
                desc: "وضعیت پادکست به «بررسی شده» تغییر کرد."
            });
        }

    } catch (error) {
        console.error("Mark As Reviewed Error:", error);

        alert(
            error.message ||
            "تغییر وضعیت انجام نشد."
        );
    }
}

// =========================================================
// Global functions
// =========================================================

window.editUser =
    editUser;

window.saveEdit =
    saveEdit;

window.deleteUser =
    deleteUser;

window.closeModal =
    closeModal;

window.markAsReviewed =
    markAsReviewed;



    // =========================================================
    // View
    // =========================================================
    function view(id) {
        const item = items.find(x => x.id == id);
        if (!item) return;

        document.getElementById('detail-body').innerHTML = `
            <div class="form-grid form-grid--1" style="gap:var(--sp-4);">
                <div>
                    <div class="text-xs text-muted">نام و نام خانوادگی</div>
                    <div class="font-semibold">${CafeUtils.escapeHtml(item.name || '')}</div>
                </div>
                <div>
                    <div class="text-xs text-muted">نام شرکت</div>
                    <div class="font-semibold">${CafeUtils.escapeHtml(item.compenyname || '')}</div>
                </div>
                <div>
                    <div class="text-xs text-muted">شماره تماس</div>
                    <div class="font-semibold cell-ltr" style="text-align:right;">
                        ${CafeUtils.formatPhone(item.phone || '')}
                    </div>
                </div>
                <div>
                    <div class="text-xs text-muted">ایمیل</div>
                    <div class="font-semibold cell-ltr" style="text-align:right;">
                        ${CafeUtils.escapeHtml(item.email || '')}
                    </div>
                </div>
                <div>
                    <div class="text-xs text-muted">تاریخ ارسال</div>
                    <div class="font-semibold">
                        ${item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString("fa-IR")
                            : ''}
                    </div>
                </div>
                <div>
                    <div class="text-xs text-muted" style="margin-bottom:6px;">متن پیام</div>
                    <div style="
                        background:var(--color-gray-100);
                        border-radius:var(--radius-md);
                        padding:var(--sp-4);
                        line-height:1.9;
                    ">
                        ${CafeUtils.escapeHtml(item.message || '')}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('call-btn').href =
            `tel:${CafeUtils.toEnglishDigits(item.phone || '')}`;

        CafeUI.openModal('view-modal');
    }


    // =========================================================
    // Remove
    // =========================================================



    window.ListPage = {
        view
    };

})();