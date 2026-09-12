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
                const createdAt   = String(item.createdAT || '').toLowerCase();
                const time   = String(item.time || '').toLowerCase();
                const status = String(item.status || '').toLowerCase();
                const audio = String(item.audio || '').toLowerCase();
                const cover = String(item.cover || '').toLowerCase();

                return (
                    title.includes(state.search) ||
                    episod.includes(state.search) ||
                    createdAT.includes(state.search) ||
                    time.includes(state.search) ||
                    status.includes(state.search) ||
                    audio.includes(state.search) ||
                    cover.includes(state.search)
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
    
    async function editUser(id) {
    try {
        console.log("EDIT ID:", id);

        const response = await fetch("/api/podcast");

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        const podcast = data.find(
            x => String(x.id) === String(id)
        );

        console.log("FOUND PODCAST:", podcast);

        if (!podcast) {
            alert("پادکست پیدا نشد");
            return;
        }

        // ذخیره ID برای saveEdit
        document.getElementById("podcast-id").value = podcast.id;

        // پر کردن اطلاعات
        document.getElementById("edit-title").value =
            podcast.title || "";

        document.getElementById("edit-episod").value =
            podcast.episod || "";

        const today = new Date().toLocaleDateString("fa-IR");

document.getElementById("edit-createdAT").value = today;

        document.getElementById("edit-time").value =
            podcast.time || "";

        document.getElementById("edit-status").value =
            podcast.status || "";

        // فایل جدید
        document.getElementById("edit-audio").value = "";
        document.getElementById("edit-cover").value = "";

        // نمایش کاور قبلی
        const preview = document.getElementById("cover-preview");

        if (preview) {
            if (podcast.cover) {
                preview.src = podcast.cover;
                preview.style.display = "block";
            } else {
                preview.src = "";
                preview.style.display = "none";
            }
        }

        // باز کردن مودال
        document.getElementById("editPodcastModal").style.display = "flex";

    } catch (error) {
        console.error("Edit error:", error);
    }
}



async function saveEdit() {
    const id = document.getElementById("podcast-id").value;

    console.log("FRONTEND ID:", id);

    try {
        const formData = new FormData();

        formData.append("title", document.getElementById("edit-title").value
        );

        formData.append("episod", document.getElementById("edit-episod").value
        );

        formData.append("createdAT",document.getElementById("edit-createdAT").value
        );

        formData.append("time",document.getElementById("edit-time").value
        );

        formData.append("status", document.getElementById("edit-status").value
        );


        // فایل صوتی جدید
        const audioInput = document.getElementById("edit-audio");

        if (audioInput.files.length > 0) {
            formData.append("audio", audioInput.files[0]);
        }


        // کاور جدید
        const coverInput = document.getElementById("edit-cover");

        if (coverInput.files.length > 0) {
            formData.append("cover", coverInput.files[0]);
        }


        const response = await fetch(`/api/podcast/${id}`, {
            method: "PUT",
            body: formData
        });


        const data = await response.json();


        if (!response.ok) {
            alert(data.message || "Err");
            return;
        }


        alert(data.message || "پادکست با موفقیت ویرایش شد.");

        closeModal();

        await loadData();

    } catch (error) {
        console.error("Error: ", error);
    }
}


    // =========================================================
    // Delete
    // =========================================================
    async function deleteUser(id) {
        if (!confirm("آیا از حذف این پاذکست اطمینان دارید؟")) {
            return
        }

        const response = await fetch(`/api/podcast/${id}`,{
            method:"Delete"
        })

        console.log("Respone Status: ",response.status)
    }


        // =========================================================
    // Close Modal
    // =========================================================
    function closeModal() {
        document.getElementById("editPodcastModal").style.display = "none";
    }

    window.editUser=editUser
    window.saveEdit=saveEdit
    window.deleteUser=deleteUser
    window.closeModal=closeModal


    document.getElementById("edit-audio")?.addEventListener("change", function () {
    const file = this.files[0];

    if (!file) return;

    const audio = document.createElement("audio");
    audio.preload = "metadata";

    audio.onloadedmetadata = function () {
        const duration = audio.duration;

        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);

        const formattedTime =
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

        document.getElementById("edit-time").value = formattedTime;

        URL.revokeObjectURL(audio.src);
    };

    audio.src = URL.createObjectURL(file);
});



document.getElementById("edit-audio")?.addEventListener("change", function () {
    const fileName = document.getElementById("audio-file-name");

    if (this.files.length > 0) {
        fileName.textContent = this.files[0].name;
    } else {
        fileName.textContent = "انتخاب فایل صوتی";
    }
});


document.getElementById("edit-cover")?.addEventListener("change", function () {
    const fileName = document.getElementById("cover-file-name");

    if (this.files.length > 0) {
        fileName.textContent = this.files[0].name;
    } else {
        fileName.textContent = "انتخاب تصویر کاور";
    }
});


    // =========================================================
    // Mark as Reviewed
    // =========================================================
    async function markAsReviewed() {
        const id = document.getElementById("podcast-id").value;
        if (!id) return;

       

        try {
            

            if (!response.ok) {
                throw new Error("تغییر وضعیت انجام نشد");
            }

            closeModal();
            await loadData();

            // رفتن به تب بررسی شده
            document.querySelectorAll("#status-chips .chip").forEach(chip => {
                chip.classList.remove("is-active");
                if (chip.dataset.status === "بررسی شده") {
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
    window.closeModal     = closeModal;
    window.markAsReviewed = markAsReviewed;


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