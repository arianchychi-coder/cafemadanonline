/* ==========================================================================
   Podcast List Page Script (Reusable)
========================================================================== */

console.log("🔥 NEW podcast-list.js LOADED");

(() => {

    const PODCAST_PAGE_SIZE = 7;

    let podcastState = {
        search: '',
        status: 'all',
        sort: 'newest',
        page: 1
    };

    // اطلاعات واقعی از API
    let podcastItems = [];


    // =========================================================
    // شروع صفحه
    // =========================================================

    document.addEventListener('DOMContentLoaded', async () => {

        CafeShell.mount({
            page: 'khabarname',
            title: 'لیست خبرنامه ها',
            breadcrumb: 'کافه معدن / خبرنامه ها / لیست'
        });

        bindPodcastControls();
        await loadPodcasts();

    });


    // =========================================================
    // دریافت اطلاعات پادکست‌ها
    // =========================================================

    async function loadPodcasts() {

        try {

            const response = await fetch('/api/khabarname');

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            console.log("PODCAST API RESPONSE:", data);

            podcastItems = Array.isArray(data)
                ? data
                : (data.items || data.data || []);

            podcastState.page = 1;

            renderPodcastList();

        } catch (error) {

            console.error(
                'خطا در دریافت پادکست‌ها:',
                error
            );

            podcastItems = [];

            renderPodcastList();
        }
    }


    // =========================================================
    // کنترل فیلترها
    // =========================================================

    function bindPodcastControls() {

        const searchInput =
            document.getElementById('search-input');

        const sortSelect =
            document.getElementById('sort-select');


        // -----------------------------------------------------
        // جستجو
        // -----------------------------------------------------

        if (searchInput) {

            searchInput.addEventListener(
                'input',
                CafeUtils.debounce((e) => {

                    podcastState.search =
                        e.target.value
                            .trim()
                            .toLowerCase();

                    podcastState.page = 1;

                    renderPodcastList();

                }, 250)
            );
        }


        // -----------------------------------------------------
        // مرتب‌سازی
        // -----------------------------------------------------

        if (sortSelect) {

            sortSelect.addEventListener(
                'change',
                (e) => {

                    podcastState.sort =
                        e.target.value;

                    podcastState.page = 1;

                    renderPodcastList();
                }
            );
        }


        // -----------------------------------------------------
        // وضعیت
        // -----------------------------------------------------

        document
            .querySelectorAll('#status-chips .chip')
            .forEach(chip => {

                chip.addEventListener(
                    'click',
                    () => {

                        document
                            .querySelectorAll(
                                '#status-chips .chip'
                            )
                            .forEach(c =>
                                c.classList.remove(
                                    'is-active'
                                )
                            );


                        chip.classList.add(
                            'is-active'
                        );


                        podcastState.status =
                            chip.dataset.status;

                        podcastState.page = 1;

                        renderPodcastList();
                    }
                );
            });
    }


    // =========================================================
    // فیلتر پادکست‌ها
    // =========================================================

// =========================================================
// فیلتر + جستجو + مرتب‌سازی پادکست‌ها
// =========================================================

function normalize(value) {
    return String(value ?? '')
        .trim()
        .toLowerCase();
}

function getFilteredPodcasts() {
    let filteredPodcasts = [...podcastItems];

    const selectedStatus = normalize(podcastState.status);

    // "همه" = موارد بررسی‌نشده
    if (selectedStatus === 'all') {
        filteredPodcasts = filteredPodcasts.filter(podcast => {
            return normalize(podcast.status) === 'draft';
        });
    } else {
        filteredPodcasts = filteredPodcasts.filter(podcast => {
            return normalize(podcast.status) === selectedStatus;
        });
    }

    // جستجو
    if (podcastState.search) {
        filteredPodcasts = filteredPodcasts.filter(podcast => {
            const title = normalize(podcast.title);
            const desc = normalize(podcast.desc);
            const number = normalize(podcast.number);
            const tag = normalize(podcast.tag);
            const time = normalize(podcast.time);
            const status = normalize(podcast.status);
            const image = normalize(podcast.image);
            const id = normalize(podcast.id);

            return (
                title.includes(podcastState.search) ||
                desc.includes(podcastState.search) ||
                number.includes(podcastState.search) ||
                tag.includes(podcastState.search) ||
                time.includes(podcastState.search) ||
                status.includes(podcastState.search) ||
                image.includes(podcastState.search) ||
                id.includes(podcastState.search)
            );
        });
    }

    // مرتب‌سازی
    filteredPodcasts.sort((a, b) => {
        const dateA = new Date(
            a.CreatedAt ?? a.createdAt ?? a.createdAT ?? 0
        );

        const dateB = new Date(
            b.CreatedAt ?? b.createdAt ?? b.createdAT ?? 0
        );

        return podcastState.sort === 'newest'
            ? dateB - dateA
            : dateA - dateB;
    });

    return filteredPodcasts;
}


    // =========================================================
    // Render اصلی
    // =========================================================

    function renderPodcastList() {

        const filteredPodcasts =
            getFilteredPodcasts();

        const totalItems =
            filteredPodcasts.length;

        const totalPages =
            Math.max(
                1,
                Math.ceil(
                    totalItems /
                    PODCAST_PAGE_SIZE
                )
            );


        if (
            podcastState.page >
            totalPages
        ) {

            podcastState.page =
                totalPages;
        }


        const start =
            (podcastState.page - 1) *
            PODCAST_PAGE_SIZE;


        const end =
            start +
            PODCAST_PAGE_SIZE;


        const currentPodcasts =
            filteredPodcasts.slice(
                start,
                end
            );


        renderPodcastTable(
            currentPodcasts
        );


        renderPodcastPagination(
            totalPages,
            totalItems,
            currentPodcasts.length
        );
    }


    // =========================================================
    // گرفتن نام فایل
    // =========================================================

    function getPodcastFileName(path) {

        if (!path) {
            return '';
        }


        return String(path)
            .split(/[\\/]/)
            .pop()
            .split('?')[0];
    }


    // =========================================================
    // نمایش جدول پادکست‌ها
    // =========================================================

    function renderPodcastTable(
        currentPodcasts
    ) {

        const tbody =
            document.getElementById(
                "podcast-tbody"
            );


        if (!tbody) {
            return;
        }


        tbody.innerHTML = "";


        // -----------------------------------------------------
        // بدون نتیجه
        // -----------------------------------------------------

        if (
            currentPodcasts.length === 0
        ) {

            tbody.innerHTML = `
                <tr>
                    <td
                        colspan="8"
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


        // -----------------------------------------------------
        // ساخت ردیف‌ها
        // -----------------------------------------------------

        currentPodcasts.forEach(
            (podcast, index) => {

                const row =
                    document.createElement(
                        "tr"
                    );


                const realIndex =
                    (
                        (podcastState.page - 1) *
                        PODCAST_PAGE_SIZE
                    ) +
                    index +
                    1;


                const imageFile =
                    getPodcastFileName(
                        podcast.image
                    );


                row.innerHTML = `

                    <td>
                        ${realIndex}
                    </td>


                    <td
                        style="font-size:1.2rem;"
                    >
                        ${
                            CafeUtils.escapeHtml(
                                podcast.title || ''
                            )
                        }
                    </td>


                     <td
                        style="font-size:1.2rem;"
                    >
                        ${
                            CafeUtils.escapeHtml(
                                podcast.desc || ''
                            )
                        }
                    </td>


                    <td
                        style="font-size:1.2rem;"
                    >
                        ${
                            CafeUtils.escapeHtml(
                                podcast.number || ''
                            )
                        }
                    </td>


                    <td
                        style="font-size:1.2rem;"
                    >
                        ${
                            CafeUtils.escapeHtml(
                                podcast.tag || ''
                            )
                        }
                    </td>


                    <td
                        style="font-size:1.2rem;"
                    >
                        ${
                            podcast.CreatedAt
                                ? new Date(
                                    podcast.CreatedAt
                                ).toLocaleDateString(
                                    "fa-IR"
                                )
                                : ''
                        }
                    </td>


                    <td
                        style="font-size:1.2rem;"
                    >
                        ${
                            CafeUtils.escapeHtml(
                                podcast.time || ''
                            )
                        }
                    </td>


                    <td
                        style="font-size:1.2rem;"
                    >
                        ${
                            CafeUtils.escapeHtml(
                                podcast.status || ''
                            )
                        }
                    </td>



                    <td
                        style="font-size:1rem;"
                    >
                        ${
                            imageFile

                                ? `
                                    <i
                                        class="bi bi-image"
                                    ></i>

                                    ${
                                        CafeUtils.escapeHtml(
                                            imageFile
                                        )
                                    }
                                  `

                                : '—'
                        }
                    </td>


                    <td
                        style="
                            display:flex;
                            gap:8px;
                        "
                    >

                        <button
                            onclick="
                                editKhabarname(
                                    '${podcast.id}'
                                )
                            "
                            style="
                                background:#F3B300;
                                color:black;
                                border:none;
                                padding:8px 12px;
                                border-radius:8px;
                                cursor:pointer;
                                font-size:1rem;
                            "
                        >
                            <i
                                class="bi bi-pencil-square"
                            ></i>
                        </button>

                    </td>


                    <td>

                        <button
                            onclick="
                                deleteKhabarname(
                                    '${podcast.id}'
                                )
                            "
                            style="
                                background:black;
                                color:white;
                                border:none;
                                padding:8px 12px;
                                margin-bottom:2rem;
                                border-radius:8px;
                                cursor:pointer;
                                font-size:1rem;
                            "
                        >
                            <i
                                class="bi bi-trash"
                            ></i>
                        </button>

                    </td>
                `;


                tbody.appendChild(row);
            }
        );
    }


    // =========================================================
    // Pagination
    // =========================================================

    function renderPodcastPagination(
        totalPages,
        totalItems,
        currentPageItems
    ) {

        const container =
            document.getElementById(
                'list-pagination'
            );


        if (!container) {
            return;
        }


        let pages = '';


        for (
            let pageNumber = 1;
            pageNumber <= totalPages;
            pageNumber++
        ) {

            pages += `
                <button
                    class="${
                        pageNumber ===
                        podcastState.page
                            ? 'is-active'
                            : ''
                    }"

                    data-page="${pageNumber}"
                >
                    ${
                        CafeUtils.toPersianDigits(
                            pageNumber
                        )
                    }
                </button>
            `;
        }


        const from =
            totalItems === 0
                ? 0
                : (
                    (podcastState.page - 1) *
                    PODCAST_PAGE_SIZE
                  ) + 1;


        const to =
            Math.min(
                podcastState.page *
                PODCAST_PAGE_SIZE,
                totalItems
            );


        container.innerHTML = `

            <div
                style="font-size:1rem;"
                class="pagination__info"
            >

                نمایش

                ${
                    CafeUtils.formatNumber(
                        from
                    )
                }

                تا

                ${
                    CafeUtils.formatNumber(
                        to
                    )
                }

                از

                ${
                    CafeUtils.formatNumber(
                        totalItems
                    )
                }

                مورد

            </div>


            <div class="pagination__pages">

                <button
                    data-nav="prev"
                    ${
                        podcastState.page === 1
                            ? 'disabled'
                            : ''
                    }
                >
                    ‹
                </button>


                ${pages}


                <button
                    data-nav="next"
                    ${
                        podcastState.page ===
                        totalPages
                            ? 'disabled'
                            : ''
                    }
                >
                    ›
                </button>

            </div>
        `;


        // -----------------------------------------------------
        // صفحات
        // -----------------------------------------------------

        container
            .querySelectorAll('[data-page]')
            .forEach(button => {

                button.addEventListener(
                    'click',
                    () => {

                        podcastState.page =
                            Number(
                                button.dataset.page
                            );

                        renderPodcastList();
                    }
                );
            });


        // -----------------------------------------------------
        // قبلی
        // -----------------------------------------------------

        container
            .querySelector(
                '[data-nav="prev"]'
            )
            ?.addEventListener(
                'click',
                () => {

                    if (
                        podcastState.page > 1
                    ) {

                        podcastState.page--;

                        renderPodcastList();
                    }
                }
            );


        // -----------------------------------------------------
        // بعدی
        // -----------------------------------------------------

        container
            .querySelector(
                '[data-nav="next"]'
            )
            ?.addEventListener(
                'click',
                () => {

                    if (
                        podcastState.page <
                        totalPages
                    ) {

                        podcastState.page++;

                        renderPodcastList();
                    }
                }
            );
    }


    // =========================================================
    // Edit Podcast
    // =========================================================

    function editKhabarname(id) {

        try {

            console.log(
                "EDIT PODCAST ID:",
                id
            );


            // -------------------------------------------------
            // پیدا کردن پادکست
            // -------------------------------------------------

            const podcast =
                podcastItems.find(
                    podcast =>
                        String(podcast.id) ===
                        String(id)
                );


            if (!podcast) {

                alert(
                    "پادکست پیدا نشد"
                );

                return;
            }


            console.log(
                "FOUND PODCAST:",
                podcast
            );


            // -------------------------------------------------
            // ذخیره ID
            // -------------------------------------------------

            document.getElementById(
                "khabarname-id"
            ).value =
                podcast.id;


            // -------------------------------------------------
            // اطلاعات پادکست
            // -------------------------------------------------

            document.getElementById(
                "khabarname-title"
            ).value =
                podcast.title || "";


            document.getElementById(
                "khabarname-desc"
            ).value =
                podcast.desc || "";

                 document.getElementById(
                "khabarname-number"
            ).value =
                podcast.number || "";

                 document.getElementById(
                "khabarname-tag"
            ).value =
                podcast.tag || "";


            document.getElementById(
                "khabarname-CreatedAt"
            ).value =
                podcast.CreatedAt || "";


                 document.getElementById(
                "khabarname-time"
            ).value =
                podcast.time || "";


            document.getElementById(
                "khabarname-status"
            ).value =
                podcast.status || "";


            // -------------------------------------------------
            // فایل‌های جدید
            // -------------------------------------------------



            document.getElementById(
                "khabarname-image"
            ).value = "";



            // -------------------------------------------------
            // نام فایل کاور
            // -------------------------------------------------

            const coverFileName =
                document.getElementById(
                    "image-file-name"
                );


            if (coverFileName) {

                coverFileName.textContent =
                    "انتخاب تصویر کاور";
            }


            // -------------------------------------------------
            // نمایش کاور قبلی
            // -------------------------------------------------

            const preview =
                document.getElementById(
                    "image-preview"
                );


            if (preview) {

                if (podcast.image) {

                    preview.src =
                        podcast.image;

                    preview.style.display =
                        "block";

                } else {

                    preview.src = "";

                    preview.style.display =
                        "none";
                }
            }


            // -------------------------------------------------
            // باز کردن Modal
            // -------------------------------------------------

            const editModal =
                document.getElementById(
                    "editKhabarname"
                );


            if (editModal) {

                editModal.style.display =
                    "flex";
            }


        } catch (error) {

            console.error(
                "Edit Podcast Error:",
                error
            );


            alert(
                "خطا در باز کردن اطلاعات پادکست"
            );
        }
    }


    // =========================================================
    // Save Podcast Edit
    // =========================================================

    async function saveKhabarname() {

        const token = localStorage.getItem("accessToken")

        const id =
            document.getElementById(
                "khabarname-id"
            ).value;


        console.log(
            "FRONTEND PODCAST ID:",
            id
        );


        if (!id) {

            alert(
                "شناسه پادکست پیدا نشد"
            );

            return;
        }


        try {

            const formData =
                new FormData();


            // -------------------------------------------------
            // اطلاعات
            // -------------------------------------------------

            formData.append(
                "title",
                document.getElementById(
                    "khabarname-title"
                ).value.trim()
            );


            formData.append(
                "desc",
                document.getElementById(
                    "khabarname-desc"
                ).value.trim()
            );



            formData.append(
                "number",
                document.getElementById(
                    "khabarname-number"
                ).value.trim()
            );



             formData.append(
                "tag",
                document.getElementById(
                    "khabarname-tag"
                ).value.trim()
            );


            formData.append(
                "CreatedAt",
                document.getElementById(
                    "khabarname-CreatedAt"
                ).value.trim()
            );

            formData.append(
                "time",
                document.getElementById(
                    "khabarname-time"
                ).value.trim()
            );


            formData.append(
    "status",
    document.getElementById("khabarname-status")?.value || "draft"
);



            // -------------------------------------------------
            // کاور جدید
            // -------------------------------------------------

            const coverInput =
                document.getElementById(
                    "khabarname-image"
                );


            if (
                coverInput &&
                coverInput.files &&
                coverInput.files.length > 0
            ) {

                formData.append(
                    "image",
                    coverInput.files[0]
                );
            }


            // -------------------------------------------------
            // ارسال درخواست
            // -------------------------------------------------

            const response =
                await fetch(
                    `/api/putkhabarname/${id}`,
                    {
                        method: "PUT",
                        headers:{"Authorization" : `Bearer ${token}`},
                        body: formData
                    }
                );


            const data =
                await response
                    .json()
                    .catch(() => ({}));


            if (!response.ok) {

                alert(
                    data.message ||
                    "ویرایش پادکست انجام نشد"
                );

                return;
            }


            // =================================================
            // آپدیت آرایه فعلی
            // =================================================

            const index =
                podcastItems.findIndex(
                    podcast =>
                        String(podcast.id) ===
                        String(id)
                );


            if (index !== -1) {

                podcastItems[index] = {

                    ...podcastItems[index],

                    title:
                        document.getElementById(
                            "khabarname-title"
                        ).value.trim(),

                    desc:
                        document.getElementById(
                            "khabarname-desc"
                        ).value.trim(),


                        number:
                        document.getElementById(
                            "khabarname-number"
                        ).value.trim(),


                        tag:
                        document.getElementById(
                            "khabarname-tag"
                        ).value.trim(),

                    CreatedAt:
                        document.getElementById(
                            "khabarname-CreatedAt"
                        ).value.trim(),

                    time:
                        document.getElementById(
                            "khabarname-time"
                        ).value.trim(),

                    status:
                        document.getElementById(
                            "khabarname-status"
                        ).value
                };


                // -------------------------------------------------
                // اگر API پادکست جدید را برگرداند
                // -------------------------------------------------

                if (data.podcast) {

                    podcastItems[index] = {

                        ...podcastItems[index],

                        ...data.podcast
                    };

                } else if (data.data) {

                    podcastItems[index] = {

                        ...podcastItems[index],

                        ...data.data
                    };
                }
            }


            // -------------------------------------------------
            // بستن Modal
            // -------------------------------------------------

            closePodcastModal();


            // -------------------------------------------------
            // رندر دوباره
            // -------------------------------------------------

            renderPodcastList();


            // -------------------------------------------------
            // پیام موفقیت
            // -------------------------------------------------

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
                "Save Podcast Edit Error:",
                error
            );


            alert(
                error.message ||
                "خطا در ویرایش پادکست"
            );
        }
    }


    // =========================================================
    // Delete Podcast
    // =========================================================

    async function deleteKhabarname(id) {
        if (!confirm("آیا از حذف این مورد مظمعنید؟")) {
            return
        }


        const token = localStorage.getItem("accessToken")


        try {
            const response = await fetch(`/api/deletekhabarname/${id}`,{
                method:"DELETE",
                headers:{"Authorization" : `Bearer ${token}`}
            })

            const data = await response.json()
            console.log("Delete", response.status)


            if (!response.ok) {
                alert(data.message)
                return
            }

            else{
                alert(data.message)
            }
        } catch (error) {
            console.log("Error: ",error)
        }
    }


    // =========================================================
    // Close Podcast Modal
    // =========================================================

    function closePodcastModal() {

        const modal =
            document.getElementById(
                "editKhabarname"
            );


        if (modal) {

            modal.style.display =
                "none";
        }
    }


    // =========================================================
    // Mark Podcast As Reviewed
    // =========================================================


async function markPodcastAsReviewed() {
    const id = document.getElementById("khabarname-id")?.value?.trim();

    const token = localStorage.getItem("accessToken")

    if (!id) {
        alert("شناسه خبرنامه پیدا نشد");
        return;
    }

    try {
        const formData = new FormData();

        formData.append(
            "title",
            document.getElementById("khabarname-title")?.value || ""
        );

        formData.append(
            "desc",
            document.getElementById("khabarname-desc")?.value || ""
        );

        formData.append(
            "number",
            document.getElementById("khabarname-number")?.value || ""
        );

        formData.append(
            "tag",
            document.getElementById("khabarname-tag")?.value || ""
        );

        formData.append(
            "CreatedAt",
            document.getElementById("khabarname-CreatedAt")?.value || ""
        );

        formData.append(
            "time",
            document.getElementById("khabarname-time")?.value || ""
        );

        formData.append("status", "published");

        const response = await fetch(`/api/putkhabarname/${id}`, {
            method: "PUT",
            headers:{"Authorization" : `Bearer ${token}`},
            body: formData
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                data.message ||
                data.error ||
                `خطای سرور: ${response.status}`
            );
        }

        // پیدا کردن آیتم
        const index = podcastItems.findIndex(
            item => String(item.id) === String(id)
        );

        // تغییر وضعیت آیتم به published
        if (index !== -1) {
            podcastItems[index].status = "published";
        }

        // خیلی مهم:
        // بعد از بررسی، روی «همه» بمان
        podcastState.status = "all";
        podcastState.page = 1;

        // فعال کردن چیپ «همه»
        document.querySelectorAll("#status-chips .chip").forEach(chip => {
            chip.classList.remove("is-active");

            if (chip.dataset.status === "all") {
                chip.classList.add("is-active");
            }
        });

        // بستن مودال
        closePodcastModal();

        // رندر مجدد
        renderPodcastList();

        if (typeof CafeUI !== "undefined" && CafeUI.toast) {
            CafeUI.toast({
                type: "success",
                title: "موفق",
                desc: "خبرنامه بررسی شد."
            });
        }

    } catch (error) {
        console.error("markPodcastAsReviewed error:", error);

        if (typeof CafeUI !== "undefined" && CafeUI.toast) {
            CafeUI.toast({
                type: "error",
                title: "خطا",
                desc: error.message
            });
        }
    }
}


    // =========================================================
    // View Podcast
    // =========================================================

    function viewPodcast(id) {

        const podcast =
            podcastItems.find(
                item =>
                    item.id == id
            );


        if (!podcast) {
            return;
        }


        document.getElementById(
            'detail-body'
        ).innerHTML = `

            <div
                class="form-grid form-grid--1"
                style="gap:var(--sp-4);"
            >

                <div>

                    <div
                        class="text-xs text-muted"
                    >
                        نام و نام خانوادگی
                    </div>

                    <div
                        class="font-semibold"
                    >
                        ${
                            CafeUtils.escapeHtml(
                                podcast.name || ''
                            )
                        }
                    </div>

                </div>


                <div>

                    <div
                        class="text-xs text-muted"
                    >
                        نام شرکت
                    </div>

                    <div
                        class="font-semibold"
                    >
                        ${
                            CafeUtils.escapeHtml(
                                podcast.compenyname || ''
                            )
                        }
                    </div>

                </div>


                <div>

                    <div
                        class="text-xs text-muted"
                    >
                        شماره تماس
                    </div>

                    <div
                        class="font-semibold cell-ltr"
                        style="text-align:right;"
                    >
                        ${
                            CafeUtils.formatPhone(
                                podcast.phone || ''
                            )
                        }
                    </div>

                </div>


                <div>

                    <div
                        class="text-xs text-muted"
                    >
                        ایمیل
                    </div>

                    <div
                        class="font-semibold cell-ltr"
                        style="text-align:right;"
                    >
                        ${
                            CafeUtils.escapeHtml(
                                podcast.email || ''
                            )
                        }
                    </div>

                </div>


                <div>

                    <div
                        class="text-xs text-muted"
                    >
                        تاریخ ارسال
                    </div>

                    <div
                        class="font-semibold"
                    >
                        ${
                            podcast.createdAt
                                ? new Date(
                                    podcast.createdAt
                                ).toLocaleDateString(
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
                        ${
                            CafeUtils.escapeHtml(
                                podcast.message || ''
                            )
                        }
                    </div>

                </div>

            </div>
        `;


        document.getElementById(
            'call-btn'
        ).href =
            `tel:${CafeUtils.toEnglishDigits(
                podcast.phone || ''
            )}`;


        CafeUI.openModal(
            'viewPodcast-modal'
        );
    }


    // =========================================================
    // Global Functions
    // =========================================================

    window.editKhabarname =
        editKhabarname;


    window.saveKhabarname =
        saveKhabarname;



        window.deleteKhabarname = deleteKhabarname


    window.closePodcastModal =
        closePodcastModal;


    window.markPodcastAsReviewed =
        markPodcastAsReviewed;


    window.PodcastListPage = {

        viewPodcast,

        render:
            renderPodcastList,

        load:
            loadPodcasts

    };


})();