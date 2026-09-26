(function () {
    'use strict';

    // =========================================================
    // Start
    // =========================================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }


    // =========================================================
    // Init
    // =========================================================

    function init() {

        // -----------------------------------------------------
        // Theme
        // -----------------------------------------------------

        setupTheme();


        // -----------------------------------------------------
        // Query ID
        // -----------------------------------------------------

        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');

        if (!id) {
            showError('شناسه خبرنامه مشخص نشده است.');
            return;
        }


        // -----------------------------------------------------
        // Share Button
        // -----------------------------------------------------

        setupShareButton();


        // -----------------------------------------------------
        // Copy Link
        // -----------------------------------------------------

        setupCopyLink();


        // -----------------------------------------------------
        // Load Article
        // -----------------------------------------------------

        loadArticle(id);
    }


    // =========================================================
    // Theme
    // =========================================================

    function setupTheme() {

        const themeToggle =
            document.getElementById('ndThemeToggle');

        const html =
            document.documentElement;

        const savedTheme =
            localStorage.getItem('cm-nd-theme');

        if (savedTheme) {

            html.setAttribute(
                'data-theme',
                savedTheme
            );

        } else if (
            window.matchMedia &&
            window.matchMedia(
                '(prefers-color-scheme: light)'
            ).matches
        ) {

            html.setAttribute(
                'data-theme',
                'light'
            );
        }

        if (!themeToggle) {
            return;
        }

        themeToggle.addEventListener(
            'click',
            function () {

                const current =
                    html.getAttribute('data-theme');

                const next =
                    current === 'dark'
                        ? 'light'
                        : 'dark';

                html.setAttribute(
                    'data-theme',
                    next
                );

                localStorage.setItem(
                    'cm-nd-theme',
                    next
                );
            }
        );
    }


    // =========================================================
    // Share Button
    // =========================================================

    function setupShareButton() {

        const shareBtn =
            document.getElementById('shareBtn');

        if (!shareBtn) {
            return;
        }

        shareBtn.addEventListener(
            'click',
            async function () {

                const titleEl =
                    document.getElementById(
                        'articleTitle'
                    );

                const title =
                    titleEl?.textContent?.trim() ||
                    'خبرنامه کافه معدن';

                // Native Share
                if (
                    navigator.share
                ) {

                    try {

                        await navigator.share({
                            title: title,
                            text: title,
                            url: window.location.href
                        });

                        return;

                    } catch (error) {

                        // کاربر Share را بسته است.
                        console.log(
                            'Share cancelled.'
                        );
                    }
                }

                // اگر Native Share وجود نداشت
                const footerShare =
                    document.querySelector(
                        '.cm-newsletter-detail__footer-share'
                    );

                if (footerShare) {

                    footerShare.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }
        );
    }


    // =========================================================
    // Copy Link
    // =========================================================

    function setupCopyLink() {

        const copyLinkBtn =
            document.getElementById(
                'copyLinkBtn'
            );

        if (!copyLinkBtn) {
            return;
        }

        copyLinkBtn.addEventListener(
            'click',
            async function (e) {

                e.preventDefault();

                const url =
                    window.location.href;

                try {

                    // Modern Clipboard API
                    if (
                        navigator.clipboard &&
                        navigator.clipboard.writeText
                    ) {

                        await navigator.clipboard.writeText(
                            url
                        );

                    } else {

                        // Fallback
                        const textarea =
                            document.createElement(
                                'textarea'
                            );

                        textarea.value = url;

                        textarea.style.position =
                            'fixed';

                        textarea.style.opacity =
                            '0';

                        document.body.appendChild(
                            textarea
                        );

                        textarea.focus();
                        textarea.select();

                        document.execCommand(
                            'copy'
                        );

                        document.body.removeChild(
                            textarea
                        );
                    }

                    showCopyFeedback(
                        copyLinkBtn
                    );

                } catch (error) {

                    console.error(
                        'Copy error:',
                        error
                    );
                }
            }
        );
    }


    // =========================================================
    // Load Article
    // =========================================================

    async function loadArticle(id) {

        showLoading();

        try {

            const response =
                await fetch(
                    '/api/khabarname',
                    {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json'
                        }
                    }
                );

            if (!response.ok) {

                throw new Error(
                    `HTTP ${response.status}`
                );
            }


            const result =
                await response.json();

            console.log(
                'NEWSLETTER API:',
                result
            );


            // -------------------------------------------------
            // Extract Array
            // -------------------------------------------------

            const items =
                extractItems(result);


            if (!items.length) {

                throw new Error(
                    'لیست خبرنامه‌ها خالی است.'
                );
            }


            console.log(
                'NEWSLETTER ITEMS:',
                items
            );


            // -------------------------------------------------
            // Find Article
            // -------------------------------------------------

            const article =
                items.find(function (item) {

                    return String(
                        item.id
                    ) === String(id);

                });


            if (!article) {

                console.error(
                    'Newsletter ID not found:',
                    id
                );

                showError(
                    'خبرنامه موردنظر پیدا نشد.'
                );

                return;
            }


            console.log(
                'SELECTED NEWSLETTER:',
                article
            );


            // -------------------------------------------------
            // Render
            // -------------------------------------------------

            renderArticle(
                article
            );


            // -------------------------------------------------
            // Navigation
            // -------------------------------------------------

            renderNavigation(
                items,
                article
            );


            // -------------------------------------------------
            // Share Links
            // -------------------------------------------------

            setupShareLinks(
                article
            );


            // -------------------------------------------------
            // Hide Loading
            // -------------------------------------------------

            hideLoading();


            console.log(
                'NEWSLETTER RENDERED SUCCESSFULLY'
            );

        } catch (error) {

            console.error(
                'Load newsletter error:',
                error
            );

            showError(
                'خطا در دریافت اطلاعات خبرنامه.'
            );
        }
    }


    // =========================================================
    // Extract Items
    // =========================================================

    function extractItems(result) {

        if (Array.isArray(result)) {
            return result;
        }

        if (
            result &&
            Array.isArray(result.items)
        ) {
            return result.items;
        }

        if (
            result &&
            Array.isArray(result.data)
        ) {
            return result.data;
        }

        if (
            result &&
            Array.isArray(result.khabarnames)
        ) {
            return result.khabarnames;
        }

        if (
            result &&
            Array.isArray(result.newsletters)
        ) {
            return result.newsletters;
        }

        return [];
    }


    // =========================================================
    // Render Article
    // =========================================================

    function renderArticle(article) {

        const numberEl =
            document.getElementById(
                'articleNumber'
            );

        const categoryEl =
            document.getElementById(
                'articleCategory'
            );

        const titleEl =
            document.getElementById(
                'articleTitle'
            );

        const descriptionEl =
            document.getElementById(
                'articleDescription'
            );

        const dateEl =
            document.getElementById(
                'articleDate'
            );

        const timeEl =
            document.getElementById(
                'articleTime'
            );

        const imageEl =
            document.getElementById(
                'articleImage'
            );

        const captionEl =
            document.getElementById(
                'articleImageCaption'
            );

        const contentEl =
            document.getElementById(
                'articleContent'
            );

        const tagsEl =
            document.getElementById(
                'articleTags'
            );


        // =====================================================
        // Number
        // =====================================================

        if (numberEl) {

            numberEl.textContent =
                article.number !== undefined &&
                article.number !== null &&
                article.number !== ''
                    ? 'شماره ' +
                      toPersianNum(
                          article.number
                      )
                    : '';
        }


        // =====================================================
        // Category
        // =====================================================

        if (categoryEl) {

            categoryEl.textContent =
                article.tag ||
                article.category ||
                '';
        }


        // =====================================================
        // Title
        // =====================================================

        if (titleEl) {

            titleEl.textContent =
                article.title ||
                'بدون عنوان';
        }


        // =====================================================
        // Description
        // =====================================================

        if (descriptionEl) {

            descriptionEl.textContent =
                article.desc ||
                article.description ||
                '';
        }


        // =====================================================
        // Date
        // =====================================================

        if (dateEl) {

            const dateValue =
                article.CreatedAt ||
                article.createdAt ||
                article.createdAT ||
                article.date ||
                '';

            dateEl.textContent =
                formatDate(
                    dateValue
                );
        }


        // =====================================================
        // Time
        // =====================================================

        if (timeEl) {

            if (
                article.time !== undefined &&
                article.time !== null &&
                article.time !== ''
            ) {

                timeEl.textContent =
                    toPersianNum(
                        article.time
                    ) +
                    ' دقیقه مطالعه';

            } else {

                timeEl.textContent = '';
            }
        }


        // =====================================================
        // Image
        // =====================================================

        if (imageEl) {

            const imageValue =
                article.image ||
                article.Image ||
                article.imageUrl ||
                article.thumbnail ||
                '';

            if (imageValue) {

                imageEl.src =
                    normalizeImageUrl(
                        imageValue
                    );

                imageEl.alt =
                    article.title ||
                    'خبرنامه کافه معدن';

                imageEl.style.display =
                    'block';

                // اگر تصویر خراب بود
                imageEl.onerror =
                    function () {

                        console.error(
                            'Newsletter image could not be loaded:',
                            imageValue
                        );

                        imageEl.style.display =
                            'none';
                    };

            } else {

                imageEl.removeAttribute(
                    'src'
                );

                imageEl.style.display =
                    'none';
            }
        }


        // =====================================================
        // Image Caption
        // =====================================================

        if (captionEl) {

            captionEl.textContent =
                article.title ||
                '';
        }


        // =====================================================
        // Main Content
        // =====================================================

        if (contentEl) {

            const content =
                article.txt ||
                article.text ||
                article.content ||
                article.body ||
                '';

            if (
                typeof content === 'string' &&
                content.trim()
            ) {

                /*
                 * txt معمولاً HTML ذخیره‌شده
                 * از ویرایشگر پنل مدیریت است.
                 */
                contentEl.innerHTML =
                    content;

            } else if (
                article.desc
            ) {

                contentEl.innerHTML =
                    '<p>' +
                    escapeHtml(
                        article.desc
                    ) +
                    '</p>';

            } else {

                contentEl.innerHTML =
                    '<p>متن این خبرنامه موجود نیست.</p>';
            }
        }


        // =====================================================
        // Tags
        // =====================================================

        if (tagsEl) {

            tagsEl.innerHTML = '';

            const tagValue =
                article.tag ||
                article.tags ||
                '';

            if (Array.isArray(tagValue)) {

                tagValue.forEach(
                    function (tag) {

                        addTag(
                            tagsEl,
                            tag
                        );
                    }
                );

            } else if (
                typeof tagValue === 'string' &&
                tagValue.trim()
            ) {

                const tags =
                    tagValue
                        .split(',')
                        .map(
                            function (x) {
                                return x.trim();
                            }
                        )
                        .filter(Boolean);

                tags.forEach(
                    function (tag) {

                        addTag(
                            tagsEl,
                            tag
                        );
                    }
                );
            }
        }


        // =====================================================
        // Page Title
        // =====================================================

        if (
            article.number !== undefined &&
            article.number !== null &&
            article.number !== ''
        ) {

            document.title =
                'خبرنامه شماره ' +
                toPersianNum(
                    article.number
                ) +
                ' — کافه معدن';

        } else if (article.title) {

            document.title =
                article.title +
                ' — کافه معدن';

        } else {

            document.title =
                'خبرنامه — کافه معدن';
        }


        // =====================================================
        // Wrapper
        // =====================================================

        const wrapper =
            document.getElementById(
                'articleWrapper'
            );

        if (wrapper) {

            wrapper.style.display =
                'block';
        }
    }


    // =========================================================
    // Add Tag
    // =========================================================

    function addTag(
        container,
        tag
    ) {

        if (
            tag === undefined ||
            tag === null ||
            !String(tag).trim()
        ) {
            return;
        }

        const span =
            document.createElement(
                'span'
            );

        span.className =
            'newsletter-tag';

        span.textContent =
            String(tag).trim();

        container.appendChild(
            span
        );
    }


    // =========================================================
    // Previous / Next
    // =========================================================

    function renderNavigation(
        items,
        current
    ) {

        if (
            !Array.isArray(items) ||
            !current
        ) {
            return;
        }


        const sorted =
            [...items].sort(
                function (a, b) {

                    return (
                        Number(
                            a.number || 0
                        ) -
                        Number(
                            b.number || 0
                        )
                    );
                }
            );


        const index =
            sorted.findIndex(
                function (item) {

                    return String(
                        item.id
                    ) === String(
                        current.id
                    );
                }
            );


        const previous =
            index > 0
                ? sorted[index - 1]
                : null;


        const next =
            index >= 0 &&
            index < sorted.length - 1
                ? sorted[index + 1]
                : null;


        setupNavigationButton(
            'previousArticle',
            'previousTitle',
            previous
        );


        setupNavigationButton(
            'nextArticle',
            'nextTitle',
            next
        );
    }


    // =========================================================
    // Navigation Button
    // =========================================================

    function setupNavigationButton(
        linkId,
        titleId,
        article
    ) {

        const link =
            document.getElementById(
                linkId
            );

        const title =
            document.getElementById(
                titleId
            );


        if (!link) {
            return;
        }


        if (!article) {

            link.style.display =
                'none';

            return;
        }


        link.href =
            'newsletter-detail.html?id=' +
            encodeURIComponent(
                article.id
            );


        if (title) {

            title.textContent =
                article.title ||
                '';
        }


        link.style.display =
            '';
    }


    // =========================================================
    // Share Links
    // =========================================================

    function setupShareLinks(
        article
    ) {

        const url =
            encodeURIComponent(
                window.location.href
            );

        const title =
            encodeURIComponent(
                article.title ||
                'خبرنامه کافه معدن'
            );


        const twitter =
            document.getElementById(
                'twitterShare'
            );

        const linkedin =
            document.getElementById(
                'linkedinShare'
            );

        const telegram =
            document.getElementById(
                'telegramShare'
            );


        // -----------------------------------------------------
        // Twitter / X
        // -----------------------------------------------------

        if (twitter) {

            twitter.href =
                'https://twitter.com/intent/tweet?url=' +
                url +
                '&text=' +
                title;
        }


        // -----------------------------------------------------
        // LinkedIn
        // -----------------------------------------------------

        if (linkedin) {

            linkedin.href =
                'https://www.linkedin.com/sharing/share-offsite/?url=' +
                url;
        }


        // -----------------------------------------------------
        // Telegram
        // -----------------------------------------------------

        if (telegram) {

            telegram.href =
                'https://t.me/share/url?url=' +
                url +
                '&text=' +
                title;
        }
    }


    // =========================================================
    // Normalize Image URL
    // =========================================================

    function normalizeImageUrl(
        image
    ) {

        if (!image) {
            return '';
        }


        image =
            String(image).trim();


        // URL کامل
        if (
            image.startsWith('http://') ||
            image.startsWith('https://')
        ) {

            return image;
        }


        // مسیر absolute
        if (
            image.startsWith('/')
        ) {

            return image;
        }


        // مسیر relative
        return '/' + image;
    }


    // =========================================================
    // Format Date
    // =========================================================

    function formatDate(
        value
    ) {

        if (!value) {
            return '';
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return String(
                value
            );
        }


        return date.toLocaleDateString(
            'fa-IR',
            {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }
        );
    }


    // =========================================================
    // Persian Numbers
    // =========================================================

    function toPersianNum(
        value
    ) {

        const digits = [
            '۰',
            '۱',
            '۲',
            '۳',
            '۴',
            '۵',
            '۶',
            '۷',
            '۸',
            '۹'
        ];


        return String(
            value
        ).replace(
            /\d/g,
            function (digit) {

                return digits[
                    Number(digit)
                ];
            }
        );
    }


    // =========================================================
    // HTML Escape
    // =========================================================

    function escapeHtml(
        value
    ) {

        return String(
            value ?? ''
        )
            .replace(
                /&/g,
                '&amp;'
            )
            .replace(
                /</g,
                '&lt;'
            )
            .replace(
                />/g,
                '&gt;'
            )
            .replace(
                /"/g,
                '&quot;'
            )
            .replace(
                /'/g,
                '&#039;'
            );
    }


    // =========================================================
    // Loading
    // =========================================================

    function showLoading() {

        const loading =
            document.getElementById(
                'articleLoading'
            );

        const error =
            document.getElementById(
                'articleError'
            );

        if (loading) {

            loading.style.display =
                'block';
        }

        if (error) {

            error.style.display =
                'none';
        }
    }


    // =========================================================
    // Hide Loading
    // =========================================================

    function hideLoading() {

        const loading =
            document.getElementById(
                'articleLoading'
            );

        if (loading) {

            loading.style.display =
                'none';
        }
    }


    // =========================================================
    // Show Error
    // =========================================================

    function showError(
        message
    ) {

        console.error(
            'Newsletter Error:',
            message
        );


        const loading =
            document.getElementById(
                'articleLoading'
            );

        const error =
            document.getElementById(
                'articleError'
            );

        const wrapper =
            document.getElementById(
                'articleWrapper'
            );

        const content =
            document.getElementById(
                'articleContent'
            );


        if (loading) {

            loading.style.display =
                'none';
        }


        if (wrapper) {

            wrapper.style.display =
                'none';
        }


        if (error) {

            error.textContent =
                message;

            error.style.display =
                'block';

            return;
        }


        /*
         * چون در HTML فعلی ممکن است
         * articleError وجود نداشته باشد،
         * خطا را داخل articleContent هم نمایش می‌دهیم.
         */

        if (content) {

            content.innerHTML =
                '<p class="newsletter-error">' +
                escapeHtml(message) +
                '</p>';

            content.style.display =
                'block';
        }
    }


    // =========================================================
    // Copy Feedback
    // =========================================================

    function showCopyFeedback(
        btn
    ) {

        if (!btn) {
            return;
        }


        const originalHTML =
            btn.innerHTML;


        btn.innerHTML =
            '✓';


        btn.style.color =
            '#22C55E';

        btn.style.borderColor =
            '#22C55E';


        setTimeout(
            function () {

                btn.innerHTML =
                    originalHTML;

                btn.style.color =
                    '';

                btn.style.borderColor =
                    '';

            },
            2000
        );
    }

})();