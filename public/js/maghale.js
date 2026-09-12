
document.addEventListener("DOMContentLoaded", async () => {

    // =====================================================
    // دریافت مقاله واقعی از بک‌اند
    // =====================================================

    const params = new URLSearchParams(window.location.search);
    const articleId = params.get("id");

    if (!articleId) {
        console.error("شناسه مقاله در URL وجود ندارد");
        return;
    }

    try {

        const response = await fetch("/api/articels");

        if (!response.ok) {
            throw new Error("خطا در دریافت مقالات");
        }

        const articles = await response.json();

        console.log("تمام مقالات:", articles); 
        console.log("اطلاعات مقاله:", articles[0]?.information);

        const article = articles.find(item => item.id === articleId);

        if (!article) {
            console.error("مقاله پیدا نشد:", articleId);
            return;
        }

        // نمایش اطلاعات واقعی مقاله
        renderArticle(article);

        // افزایش بازدید
        fetch(`/api/articels/view/${article.id}`, {
            method: "POST"
        }).catch(error => {
            console.error("خطا در افزایش بازدید:", error);
        });

        // بعد از ساخت مقاله، امکانات صفحه را فعال کن
        initArticlePage();

    } catch (error) {

        console.error("Article Error:", error);

    }


    // =====================================================
    // نمایش اطلاعات مقاله
    // =====================================================


function renderArticle(article) {


// =====================================================
// عنوان صفحه
// =====================================================

document.title =
    `کافه معدن | ${article.title || "مقاله"}`;


// =====================================================
// تصویر اصلی
// =====================================================


// =====================================================
// تصویر اصلی مقاله
// =====================================================

const heroImage =
    document.querySelector(".hero-image img");

if (heroImage) {

    console.log("ARTICLE IMAGE:", article.image);

    if (
        article.image &&
        article.image !== "undefined" &&
        article.image !== "null" &&
        article.image.trim() !== ""
    ) {

        const imagePath =
            `/images/${encodeURIComponent(article.image)}`;

        console.log("IMAGE PATH:", imagePath);

        heroImage.src = imagePath;

        heroImage.alt =
            article.title || "تصویر مقاله";

        heroImage.style.display = "block";

        // اگر عکس پیدا نشد
        heroImage.onerror = function () {

            console.error(
                "تصویر پیدا نشد:",
                imagePath
            );

            this.style.display = "none";
        };

    } else {

        console.warn(
            "برای این مقاله image وجود ندارد"
        );

        heroImage.style.display = "none";
    }
}



// =====================================================
// عنوان مقاله
// =====================================================

const articleTitle =
    document.querySelector(".article-title");

if (articleTitle) {

    articleTitle.textContent =
        article.title || "بدون عنوان";
}


// =====================================================
// عنوان بخش معرفی
// =====================================================

const firstSectionTitle =
    document.querySelector(
        "#section-intro .section-title"
    );

if (firstSectionTitle) {

    firstSectionTitle.textContent =
        article.title || "مقاله";
}


// =====================================================
// توضیح کوتاه مقاله
// =====================================================

const informationElement =
    document.querySelector(
        "#section-intro .section-text"
    );

if (informationElement) {

    if (
        article.information &&
        article.information.trim() !== ""
    ) {

        informationElement.innerHTML =
            escapeHtml(article.information)
                .replace(/\r?\n/g, "<br>");

    } else {

        informationElement.textContent =
            "توضیح کوتاهی برای این مقاله ثبت نشده است.";
    }
}


// =====================================================
// حذف محتوای نمونه قبلی
// =====================================================

const oldContent =
    document.querySelector("#section-content");

if (oldContent) {
    oldContent.remove();
}


// =====================================================
// پیدا کردن بخش اصلی مقاله
// =====================================================

const articleSection =
    document.querySelector(".article-section");

if (!articleSection) {
    console.error(
        "عنصر .article-section پیدا نشد"
    );
    return;
}


// =====================================================
// حذف بخش‌های نمونه اضافی
// =====================================================

const sampleSections =
    articleSection.querySelectorAll(
        ".article-section-block"
    );

sampleSections.forEach(section => {

    // بخش معرفی را نگه می‌داریم
    if (section.id === "section-intro") {
        return;
    }

    // گالری و ویدیو را هم فعلاً حذف می‌کنیم
    // چون پایین‌تر دوباره ساخته می‌شوند
    section.remove();

});


// =====================================================
// اطلاعات مقاله / Meta
// =====================================================

const oldMeta =
    articleSection.querySelector(".article-meta");

if (oldMeta) {
    oldMeta.remove();
}


const meta =
    document.createElement("div");

meta.className =
    "article-meta";

meta.innerHTML = `



    <div class="article-meta-item">

        <i class="fas fa-calendar"></i>

        <span>
    ${formatPersianDate(article.date)}
</span>

    </div>


    <div class="article-meta-item">

        <i class="fas fa-eye"></i>

        <span>
            ${article.views || 0} بازدید
        </span>

    </div>

`;


// قرار دادن meta قبل از اولین بخش

const firstBlock =
    articleSection.querySelector(
        ".article-section-block"
    );

if (firstBlock) {

    articleSection.insertBefore(
        meta,
        firstBlock
    );

} else {

    articleSection.appendChild(meta);
}


// =====================================================
// محتوای کامل مقاله
// =====================================================

if (
    article.txt &&
    article.txt.trim() !== ""
) {

    const contentSection =
        document.createElement("section");

    contentSection.className =
        "article-section-block article-content-section";

    contentSection.id =
        "section-content";


    contentSection.innerHTML = `

        <div class="section-header">

            <div class="section-icon">
                <i class="fas fa-file-alt"></i>
            </div>

            <h2 class="section-title">
                محتوای مقاله
            </h2>

        </div>


        <div class="section-text article-content">
            ${article.txt}
        </div>

    `;


    // قرار دادن محتوای مقاله بعد از بخش معرفی

    const introSection =
        document.querySelector(
            "#section-intro"
        );

    if (introSection) {

        introSection.after(
            contentSection
        );

    } else {

        articleSection.appendChild(
            contentSection
        );
    }

} else {

    console.warn(
        "محتوای txt برای این مقاله وجود ندارد"
    );
}


// =====================================================
// گالری
// =====================================================

renderGallery(
    article.gallery || []
);


// =====================================================
// ویدیو
// =====================================================

renderVideo(
    article.video
);


// =====================================================
// سایدبار
// =====================================================

renderSidebar(
    article
);


}




    // =====================================================
    // گالری
    // =====================================================

    function renderGallery(gallery) {

        if (!gallery || gallery.length === 0) {
            return;
        }

        const articleSection =
            document.querySelector(".article-section");

        if (!articleSection) {
            return;
        }

        const galleryBox =
            document.createElement("section");

        galleryBox.className =
            "article-section-block article-gallery";

        galleryBox.id = "section-gallery";

        galleryBox.innerHTML = `
            <div class="section-header">

                <div class="section-icon">
                    <i class="fas fa-images"></i>
                </div>

                <h2 class="section-title">
                    گالری تصاویر
                </h2>

            </div>

            <div class="gallery-grid">

                ${gallery.map(image => `
                    <img
                        src="/uploads/${encodeURIComponent(image)}"
                        alt="تصویر مقاله"
                        loading="lazy"
                    >
                `).join("")}

            </div>
        `;

        articleSection.appendChild(galleryBox);
    }


    // =====================================================
    // ویدیو
    // =====================================================

    function renderVideo(video) {

        if (!video) {
            return;
        }

        const articleSection =
            document.querySelector(".article-section");

        if (!articleSection) {
            return;
        }

        const videoBox =
            document.createElement("section");

        videoBox.className =
            "article-section-block article-video";

        videoBox.id = "section-video";

        videoBox.innerHTML = `

            <div class="section-header">

                <div class="section-icon">
                    <i class="fas fa-video"></i>
                </div>

                <h2 class="section-title">
                    ویدیو
                </h2>

            </div>

            <video
                controls
                style="
                    width:100%;
                    border-radius:12px;
                "
            >
                <source
                    src="/uploads/${encodeURIComponent(video)}"
                >

                مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.

            </video>
        `;

        articleSection.appendChild(videoBox);
    }


    // =====================================================
    // سایدبار
    // =====================================================

    function renderSidebar(article) {

        const sidebarList =
            document.querySelector(".sidebar-list");

        if (!sidebarList) {
            return;
        }

        sidebarList.innerHTML = `

            <li>

                <a
                    href="#section-intro"
                    class="sidebar-link active"
                    data-section="section-intro"
                >
                    <span>
                        ${escapeHtml(article.title || "مقاله")}
                    </span>
                </a>

            </li>

        `;

        if (article.gallery?.length) {

            sidebarList.innerHTML += `

                <li>

                    <a
                        href="#section-gallery"
                        class="sidebar-link"
                        data-section="section-gallery"
                    >
                        <span>گالری تصاویر</span>
                    </a>

                </li>

            `;
        }

        if (article.video) {

            sidebarList.innerHTML += `

                <li>

                    <a
                        href="#section-video"
                        class="sidebar-link"
                        data-section="section-video"
                    >
                        <span>ویدیو</span>
                    </a>

                </li>

            `;
        }
    }


    // =====================================================
    // راه‌اندازی امکانات صفحه
    // =====================================================

    function initArticlePage() {

        const header =
            document.getElementById("mainHeader");

        const sidebarToggle =
            document.getElementById("sidebarToggle");

        const sidebarNav =
            document.getElementById("sidebarNav");


        // =================================================
        // افکت اسکرول هدر
        // =================================================

        window.addEventListener("scroll", () => {

            const currentScroll =
                window.pageYOffset;

            if (header) {

                if (currentScroll > 50) {
                    header.classList.add("scrolled");
                } else {
                    header.classList.remove("scrolled");
                }

            }

        });


        // =================================================
        // تاگل سایدبار
        // =================================================

        if (sidebarToggle && sidebarNav) {

            sidebarToggle.addEventListener("click", () => {

                sidebarNav.classList.toggle("collapsed");

                sidebarToggle.classList.toggle("collapsed");

            });

        }


        // =================================================
        // بخش‌های مقاله
        // =================================================

        const sectionBlocks =
            document.querySelectorAll(
                ".article-section-block"
            );

        const sidebarLinks =
            document.querySelectorAll(
                ".sidebar-link"
            );


        // =================================================
        // هایلایت بخش فعال هنگام اسکرول
        // =================================================

        const observerOptions = {

            root: null,

            rootMargin:
                "-100px 0px -50% 0px",

            threshold: 0

        };


        const sectionObserver =
            new IntersectionObserver(
                (entries) => {

                    entries.forEach(entry => {

                        if (entry.isIntersecting) {

                            const sectionId =
                                entry.target.id;

                            sectionBlocks.forEach(block => {

                                block.classList.remove(
                                    "active"
                                );

                            });

                            sidebarLinks.forEach(link => {

                                link.classList.remove(
                                    "active"
                                );

                            });

                            entry.target.classList.add(
                                "active"
                            );

                            const activeLink =
                                document.querySelector(
                                    `.sidebar-link[data-section="${sectionId}"]`
                                );

                            if (activeLink) {

                                activeLink.classList.add(
                                    "active"
                                );

                            }

                        }

                    });

                },
                observerOptions
            );


        sectionBlocks.forEach(block => {

            if (block.id) {
                sectionObserver.observe(block);
            }

        });


        // =================================================
        // اسکرول نرم سایدبار
        // =================================================

        sidebarLinks.forEach(link => {

            link.addEventListener("click", (e) => {

                e.preventDefault();

                const targetId =
                    link.getAttribute("data-section");

                const targetElement =
                    document.getElementById(targetId);

                if (targetElement) {

                    const headerOffset = 100;

                    const elementPosition =
                        targetElement.getBoundingClientRect().top;

                    const offsetPosition =
                        elementPosition +
                        window.pageYOffset -
                        headerOffset;

                    window.scrollTo({

                        top: offsetPosition,

                        behavior: "smooth"

                    });

                }

            });

        });


        // =================================================
        // انیمیشن ورود المان‌ها
        // =================================================

        const animateOnScroll = () => {

            const elements =
                document.querySelectorAll(
                    ".article-section-block"
                );

            elements.forEach(el => {

                const elementTop =
                    el.getBoundingClientRect().top;

                const windowHeight =
                    window.innerHeight;

                if (elementTop < windowHeight - 100) {

                    el.style.opacity = "1";

                    el.style.transform =
                        "translateY(0)";

                }

            });

        };


        window.addEventListener(
            "scroll",
            animateOnScroll
        );

        animateOnScroll();


        // =================================================
        // پارالاکس تصویر اصلی
        // =================================================

        const heroImage =
            document.querySelector(
                ".hero-image img"
            );

        window.addEventListener("scroll", () => {

            if (heroImage) {

                const scrolled =
                    window.pageYOffset;

                const rate =
                    scrolled * 0.3;

                heroImage.style.transform =
                    `translateY(${rate}px) scale(1.05)`;

            }

        });

    }


    // =====================================================
    // جلوگیری از XSS
    // =====================================================

    function escapeHtml(value) {

        const div =
            document.createElement("div");

        div.textContent =
            value ?? "";

        return div.innerHTML;
    }



    function formatPersianDate(dateString) {

    if (!dateString) {
        return "";
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return dateString;
    }

    return new Intl.DateTimeFormat(
        "fa-IR-u-ca-persian",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    ).format(date);
}

});
