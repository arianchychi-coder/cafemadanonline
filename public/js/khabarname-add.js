
/*
|--------------------------------------------------------------------------
| Podcast Add Form Script
|--------------------------------------------------------------------------
*/

(() => {
    let editId = null;
    let coverImage = '';
    let currentStatus = 'draft';

    document.addEventListener('DOMContentLoaded', () => {

        // ---------------------------------------------------------
        // Edit Mode
        // ---------------------------------------------------------

        const params = new URLSearchParams(window.location.search);
        editId = params.get('id');

        const pageTitle = document.getElementById('page-title');
        const formHeading = document.getElementById('form-heading');

        if (editId) {
            if (pageTitle) {
                pageTitle.textContent = 'ویرایش پادکست';
            }

            if (formHeading) {
                formHeading.textContent = 'ویرایش پادکست';
            }
        } else {
            setTodayDate();
        }

        // ---------------------------------------------------------
        // Bind Events
        // ---------------------------------------------------------

        bindStatusTabs();
        bindCoverUpload();
        bindFormSubmit();
        bindPreview();
    });


    // =============================================================
    // تاریخ شمسی
    // =============================================================

    function setTodayDate() {
        const dateInput = document.getElementById('f-date');

        if (!dateInput) return;

        const today = new Date();

        const shamsiDate = gregorianToJalali(
            today.getFullYear(),
            today.getMonth() + 1,
            today.getDate()
        );

        dateInput.value =
            `${shamsiDate[0]}/` +
            `${String(shamsiDate[1]).padStart(2, '0')}/` +
            `${String(shamsiDate[2]).padStart(2, '0')}`;
    }


    function gregorianToJalali(gy, gm, gd) {

        const g_d_m = [
            0, 31, 59, 90, 120, 151,
            181, 212, 243, 273, 304, 334
        ];

        const gy2 = (gm > 2) ? (gy + 1) : gy;

        let days =
            355666 +
            (365 * gy) +
            Math.floor((gy2 + 3) / 4) -
            Math.floor((gy2 + 99) / 100) +
            Math.floor((gy2 + 399) / 400) +
            gd +
            g_d_m[gm - 1];

        let jy = -1595 + (33 * Math.floor(days / 12053));

        days %= 12053;

        jy += 4 * Math.floor(days / 1461);

        days %= 1461;

        if (days > 365) {
            jy += Math.floor((days - 1) / 365);
            days = (days - 1) % 365;
        }

        const jm =
            (days < 186)
                ? 1 + Math.floor(days / 31)
                : 7 + Math.floor((days - 186) / 30);

        const jd =
            1 +
            (
                (days < 186)
                    ? (days % 31)
                    : ((days - 186) % 30)
            );

        return [jy, jm, jd];
    }


    // =============================================================
    // وضعیت انتشار
    // =============================================================

    function bindStatusTabs() {

        const buttons =
            document.querySelectorAll('.status-toggle__btn');

        const statusInput =
            document.getElementById('status');

        buttons.forEach(button => {

            button.addEventListener('click', () => {

                buttons.forEach(btn => {
                    btn.classList.remove('is-active');
                });

                button.classList.add('is-active');

                currentStatus = button.dataset.value;

                if (statusInput) {
                    statusInput.value = currentStatus;
                }
            });

        });
    }


    // =============================================================
    // آپلود تصویر کاور
    // =============================================================

    function bindCoverUpload() {

        const coverBox =
            document.getElementById('cover-upload');

        const coverInput =
            document.getElementById('cover-input');

        if (!coverBox || !coverInput) return;


        // کلیک روی باکس آپلود

        coverBox.addEventListener('click', (event) => {

            // اگر خود input کلیک شد، دوباره click نکن
            if (event.target === coverInput) {
                return;
            }

            coverInput.click();
        });


        // انتخاب فایل

        coverInput.addEventListener('change', () => {

            const file = coverInput.files[0];

            if (!file) return;


            // حداکثر 5MB

            if (file.size > 5 * 1024 * 1024) {

                showToast(
                    'error',
                    'حجم فایل زیاد است',
                    'حجم تصویر کاور نباید بیشتر از ۵ مگابایت باشد.'
                );

                coverInput.value = '';
                coverImage = '';

                renderCoverPreview();

                return;
            }


            // فرمت‌های مجاز

            const allowedTypes = [
                'image/jpeg',
                'image/png',
                'image/webp'
            ];

            if (!allowedTypes.includes(file.type)) {

                showToast(
                    'error',
                    'فرمت نامعتبر',
                    'فرمت تصویر باید JPG، PNG یا WebP باشد.'
                );

                coverInput.value = '';
                coverImage = '';

                renderCoverPreview();

                return;
            }


            // Preview

            readAsDataUrl(file, (result) => {

                coverImage = result;

                renderCoverPreview();

            });

        });
    }


    // =============================================================
    // خواندن فایل به Data URL
    // =============================================================

    function readAsDataUrl(file, callback) {

        const reader = new FileReader();

        reader.onload = () => {
            callback(reader.result);
        };

        reader.onerror = () => {
            showToast(
                'error',
                'خطا',
                'خواندن تصویر با مشکل مواجه شد.'
            );
        };

        reader.readAsDataURL(file);
    }


    // =============================================================
    // نمایش Preview تصویر
    // =============================================================

    function renderCoverPreview() {

        const wrap =
            document.getElementById('cover-preview');

        if (!wrap) return;


        if (!coverImage) {

            wrap.innerHTML = '';

            return;
        }


        wrap.innerHTML = `
            <div class="upload-preview__item">

                <img
                    src="${coverImage}"
                    alt="تصویر کاور پادکست"
                >

                <button
                    type="button"
                    class="upload-preview__remove"
                    id="remove-cover-btn"
                >
                    ✕
                </button>

            </div>
        `;


        const removeButton =
            document.getElementById('remove-cover-btn');

        if (removeButton) {

            removeButton.addEventListener(
                'click',
                removeCover
            );

        }
    }


    // =============================================================
    // حذف تصویر
    // =============================================================

    function removeCover() {

        coverImage = '';

        const coverInput =
            document.getElementById('cover-input');

        const preview =
            document.getElementById('cover-preview');

        if (coverInput) {
            coverInput.value = '';
        }

        if (preview) {
            preview.innerHTML = '';
        }
    }


    // =============================================================
    // Validation
    // =============================================================

    function setFieldError(field, hasError) {

        if (!field) return;

        field.classList.toggle(
            'has-error',
            hasError
        );
    }


    function validate() {

        let valid = true;


        // ---------------------------------------------------------
        // عنوان
        // ---------------------------------------------------------

        const titleInput =
            document.getElementById('f-title');

        if (
            !titleInput ||
            titleInput.value.trim().length < 3
        ) {

            setFieldError(
                titleInput?.closest('.form-field'),
                true
            );

            valid = false;

        } else {

            setFieldError(
                titleInput.closest('.form-field'),
                false
            );
        }


        // ---------------------------------------------------------
        // توضیحات
        // ---------------------------------------------------------

        const descInput =
            document.querySelector('input[name="desc"]');

        if (
            !descInput ||
            descInput.value.trim().length < 2
        ) {

            setFieldError(
                descInput?.closest('.form-field'),
                true
            );

            valid = false;

        } else {

            setFieldError(
                descInput.closest('.form-field'),
                false
            );
        }


        // ---------------------------------------------------------
        // تگ
        // ---------------------------------------------------------

        const tagInput =
            document.querySelector('input[name="tag"]');

        if (
            !tagInput ||
            tagInput.value.trim().length < 1
        ) {

            setFieldError(
                tagInput?.closest('.form-field'),
                true
            );

            valid = false;

        } else {

            setFieldError(
                tagInput.closest('.form-field'),
                false
            );
        }


        // ---------------------------------------------------------
        // شماره
        // ---------------------------------------------------------

        const numberInput =
            document.getElementById('f-episode');

        if (
            !numberInput ||
            numberInput.value.trim().length < 1
        ) {

            setFieldError(
                numberInput?.closest('.form-field'),
                true
            );

            valid = false;

        } else {

            setFieldError(
                numberInput.closest('.form-field'),
                false
            );
        }


        // ---------------------------------------------------------
        // تاریخ
        // ---------------------------------------------------------

        const dateInput =
            document.getElementById('f-date');

        if (
            !dateInput ||
            dateInput.value.trim() === ''
        ) {

            setFieldError(
                dateInput?.closest('.form-field'),
                true
            );

            valid = false;

        } else {

            setFieldError(
                dateInput.closest('.form-field'),
                false
            );
        }


        // ---------------------------------------------------------
        // تصویر کاور
        // ---------------------------------------------------------

        const coverInput =
            document.getElementById('cover-input');

        const coverField =
            document
                .getElementById('cover-upload')
                ?.closest('.form-field');

        const coverError =
            document.getElementById('cover-error');


        if (
            !coverImage &&
            !(coverInput && coverInput.files.length)
        ) {

            if (coverField) {
                coverField.classList.add('has-error');
            }

            if (coverError) {
                coverError.style.display = 'flex';
            }

            valid = false;

        } else {

            if (coverField) {
                coverField.classList.remove('has-error');
            }

            if (coverError) {
                coverError.style.display = 'none';
            }
        }


        return valid;
    }


    // =============================================================
    // Submit Form
    // =============================================================

    function bindFormSubmit() {

        const form =
            document.getElementById('podcast-form');

        if (!form) return;


        form.addEventListener('submit', async (event) => {

            event.preventDefault();

            await save();

        });
    }


    // =============================================================
    // ذخیره پادکست
    // =============================================================

    async function save() {


        const token = localStorage.getItem("accessToken")

        if (!validate()) {

            showToast(
                'error',
                'اطلاعات ناقص است',
                'لطفاً فیلدهای الزامی مشخص‌شده را تکمیل کنید.'
            );


            const firstError =
                document.querySelector('.has-error');

            if (firstError) {

                firstError.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });

            }

            return;
        }


        const form =
            document.getElementById('podcast-form');

        const formData =
            new FormData();


        // ---------------------------------------------------------
        // عنوان
        // ---------------------------------------------------------

        formData.append(
            'title',
            document.getElementById('f-title').value.trim()
        );


        // ---------------------------------------------------------
        // توضیحات
        // ---------------------------------------------------------

        const descInput =
            document.querySelector('input[name="desc"]');

        if (descInput) {

            formData.append(
                'desc',
                descInput.value.trim()
            );
        }


        // ---------------------------------------------------------
        // تگ
        // ---------------------------------------------------------

        const tagInput =
            document.querySelector('input[name="tag"]');

        if (tagInput) {

            formData.append(
                'tag',
                tagInput.value.trim()
            );
        }


        // ---------------------------------------------------------
        // شماره
        // ---------------------------------------------------------

        const numberInput =
            document.getElementById('f-episode');

        if (numberInput) {

            formData.append(
                'number',
                numberInput.value.trim()
            );
        }


        // ---------------------------------------------------------
        // تاریخ
        // ---------------------------------------------------------

        formData.append(
            'CreatedAt',
            document.getElementById('f-date').value
        );


        // ---------------------------------------------------------
        // مدت زمان
        // ---------------------------------------------------------

        const durationInput =
            document.getElementById('f-duration');

        if (durationInput) {

            formData.append(
                'time',
                durationInput.value.trim()
            );
        }


        // ---------------------------------------------------------
        // وضعیت
        // ---------------------------------------------------------

        formData.append(
            'status',
            currentStatus
        );


        // ---------------------------------------------------------
        // تصویر
        // ---------------------------------------------------------

        const coverInput =
            document.getElementById('cover-input');

        if (
            coverInput &&
            coverInput.files &&
            coverInput.files.length > 0
        ) {

            formData.append(
                'image',
                coverInput.files[0]
            );
        }


        const txtInput = document.getElementById('editorContent');

if (txtInput) {
    formData.append(
        'txt',
        (txtInput.innerHTML || '').trim()
    );
}



        // ---------------------------------------------------------
        // ID در حالت ویرایش
        // ---------------------------------------------------------

        if (editId) {

            formData.append(
                'id',
                editId
            );
        }


        // ---------------------------------------------------------
        // ارسال به API
        // ---------------------------------------------------------

        try {

            for (const [key, value] of formData.entries()) {
    console.log(
        key,
        value instanceof File
            ? {
                name: value.name,
                size: value.size,
                type: value.type
            }
            : value
    );
}

            const response =
                await fetch('/khabarname', {
                    method: 'POST',
                    headers:{"Authorization" : `Bearer ${token}`},
                    body: formData
                });


            let data = {};

            try {
                data = await response.json();
            } catch {
                data = {};
            }


            if (!response.ok) {

                showToast(
                    'error',
                    'خطا',
                    data.message ||
                    'خطا در ذخیره پادکست'
                );

                return;
            }


            showToast(
                'success',
                editId
                    ? 'پادکست ویرایش شد'
                    : 'پادکست با موفقیت ذخیره شد',
                editId
                    ? 'تغییرات با موفقیت ذخیره شد.'
                    : 'پادکست جدید با موفقیت اضافه شد.'
            );


            resetPodcastForm();

        } catch (error) {

            console.error(
                'Podcast save error:',
                error
            );

            showToast(
                'error',
                'خطا',
                'ارتباط با سرور برقرار نشد.'
            );
        }
    }


    // =============================================================
    // Reset Form
    // =============================================================

    function resetPodcastForm() {

        const form =
            document.getElementById('podcast-form');

        if (form) {
            form.reset();
        }


        // وضعیت

        currentStatus = 'draft';

        const statusInput =
            document.getElementById('status');

        if (statusInput) {
            statusInput.value = 'draft';
        }


        document
            .querySelectorAll('.status-toggle__btn')
            .forEach(button => {

                button.classList.toggle(
                    'is-active',
                    button.dataset.value === 'draft'
                );

            });


        // کاور

        removeCover();


        // تاریخ

        if (!editId) {
            setTodayDate();
        }


        // خطاها

        document
            .querySelectorAll('.has-error')
            .forEach(element => {

                element.classList.remove(
                    'has-error'
                );

            });


        document
            .querySelectorAll('.form-error')
            .forEach(element => {

                element.style.display = 'none';

            });
    }


    // =============================================================
    // Preview
    // =============================================================

    function bindPreview() {

        const previewButton =
            document.getElementById('btn-preview');

        if (!previewButton) return;


        previewButton.addEventListener(
            'click',
            () => {

                const title =
                    document
                        .getElementById('f-title')
                        ?.value
                        .trim() ||
                    'بدون عنوان';


                const desc =
                    document
                        .querySelector('input[name="desc"]')
                        ?.value
                        .trim() ||
                    'توضیحی وارد نشده است';


                const number =
                    document
                        .getElementById('f-episode')
                        ?.value
                        .trim() ||
                    '';


                const tag =
                    document
                        .querySelector('input[name="tag"]')
                        ?.value
                        .trim() ||
                    '';


                const date =
                    document
                        .getElementById('f-date')
                        ?.value ||
                    'تاریخ مشخص نشده';


                const duration =
                    document
                        .getElementById('f-duration')
                        ?.value
                        .trim() ||
                    'مدت زمان مشخص نشده';


                const coverHtml = coverImage

                    ? `
                        <img
                            src="${coverImage}"
                            class="podcast-preview-card__cover"
                            alt="کاور پادکست"
                        >
                    `

                    : `
                        <div
                            class="podcast-preview-card__cover"
                            style="
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                color:var(--color-gray-400);
                            "
                        >
                            <svg
                                width="48"
                                height="48"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.5"
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                    `;


                const previewBody =
                    document.getElementById(
                        'preview-body'
                    );

                if (!previewBody) return;


                previewBody.innerHTML = `

                    <div class="podcast-preview-card">

                        ${coverHtml}

                        <div class="podcast-preview-card__content">

                            <div class="podcast-preview-card__meta">

                                <span class="text-muted text-xs">
                                    ${date}
                                </span>

                                ${
                                    number
                                        ? `
                                            <span class="text-muted text-xs">
                                                •
                                            </span>

                                            <span class="text-muted text-xs">
                                                شماره ${number}
                                            </span>
                                        `
                                        : ''
                                }

                                ${
                                    duration !== 'مدت زمان مشخص نشده'
                                        ? `
                                            <span class="text-muted text-xs">
                                                •
                                            </span>

                                            <span class="text-muted text-xs">
                                                ${duration}
                                            </span>
                                        `
                                        : ''
                                }

                            </div>


                            <h2 class="podcast-preview-card__title">
                                ${escapeHtml(title)}
                            </h2>


                            <p class="podcast-preview-card__excerpt">
                                ${escapeHtml(desc)}
                            </p>


                            ${
                                tag
                                    ? `
                                        <div class="text-muted text-xs">
                                            تگ: ${escapeHtml(tag)}
                                        </div>
                                    `
                                    : ''
                            }


                        </div>

                    </div>
                `;


                const modal =
                    document.getElementById(
                        'preview-modal'
                    );

                if (modal) {
                    modal.classList.add('is-open');
                }
            }
        );
    }


    // =============================================================
    // جلوگیری از HTML Injection در Preview
    // =============================================================

    function escapeHtml(value) {

        const div =
            document.createElement('div');

        div.textContent = value;

        return div.innerHTML;
    }


    // =============================================================
    // Toast
    // =============================================================

    function showToast(type, title, desc) {

        const stack =
            document.getElementById('toast-stack');

        if (!stack) return;


        const toast =
            document.createElement('div');

        toast.className =
            `toast toast--${type}`;


        let iconSvg = '';


        if (type === 'success') {

            iconSvg = `
                <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                    />
                </svg>
            `;

        } else {

            iconSvg = `
                <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            `;
        }


        toast.innerHTML = `

            <div class="toast__icon">
                ${iconSvg}
            </div>

            <div>

                <div class="toast__title">
                    ${escapeHtml(title)}
                </div>

                <div class="toast__desc">
                    ${escapeHtml(desc)}
                </div>

            </div>

            <button
                type="button"
                class="toast__close"
            >
                <svg
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </button>
        `;


        stack.appendChild(toast);


        const closeButton =
            toast.querySelector('.toast__close');

        if (closeButton) {

            closeButton.addEventListener(
                'click',
                () => toast.remove()
            );

        }


        setTimeout(() => {

            toast.classList.add(
                'is-leaving'
            );

            setTimeout(
                () => toast.remove(),
                300
            );

        }, 4000);
    }


    // =============================================================
    // بستن Modal
    // =============================================================

    document
        .querySelectorAll('[data-close]')
        .forEach(button => {

            button.addEventListener(
                'click',
                () => {

                    const modalId =
                        button.dataset.close;

                    const modal =
                        document.getElementById(
                            modalId
                        );

                    if (modal) {
                        modal.classList.remove(
                            'is-open'
                        );
                    }
                }
            );

        });


    // =============================================================
    // Public API
    // =============================================================

    window.PodcastForm = {
        removeCover
    };

})();


document.addEventListener('DOMContentLoaded', function () {

    const editor = document.getElementById('editorContent');
    const editorWrapper = document.getElementById('editorWrapper');
    const wordCountEl = document.getElementById('wordCount');
    const charCountEl = document.getElementById('charCount');
    const toast = document.getElementById('toast');

    // ===== Persian Number Converter =====
    function toPersianNum(num) {
        const persianDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
        return num.toString().replace(/\d/g, d => persianDigits[d]);
    }

    // ===== Toolbar Buttons =====
    const toolbarButtons = document.querySelectorAll('.toolbar-btn[data-command]');

    toolbarButtons.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const command = this.getAttribute('data-command');
            const value = this.getAttribute('data-value') || null;

            editor.focus();

            if (command === 'formatBlock') {
                document.execCommand('formatBlock', false, '<' + value + '>');
            } else {
                document.execCommand(command, false, value);
            }

            updateToolbarState();
        });
    });

    // ===== Font Size =====
    const fontSizeSelect = document.getElementById('fontSizeSelect');
    fontSizeSelect.addEventListener('change', function () {
        editor.focus();
        document.execCommand('fontSize', false, this.value);
    });

    // ===== Font Color =====
    const btnFontColor = document.getElementById('btnFontColor');
    const fontColorPicker = document.getElementById('fontColorPicker');
    const fontColorIndicator = document.getElementById('fontColorIndicator');

    btnFontColor.addEventListener('click', function () {
        fontColorPicker.click();
    });

    fontColorPicker.addEventListener('input', function () {
        fontColorIndicator.style.background = this.value;
        editor.focus();
        document.execCommand('foreColor', false, this.value);
    });

    // ===== Background Color =====
    const btnBgColor = document.getElementById('btnBgColor');
    const bgColorPicker = document.getElementById('bgColorPicker');
    const bgColorIndicator = document.getElementById('bgColorIndicator');

    btnBgColor.addEventListener('click', function () {
        bgColorPicker.click();
    });

    bgColorPicker.addEventListener('input', function () {
        bgColorIndicator.style.background = this.value;
        editor.focus();
        document.execCommand('hiliteColor', false, this.value);
    });

    // ===== Update Toolbar Active State =====
    function updateToolbarState() {
        toolbarButtons.forEach(function (btn) {
            const command = btn.getAttribute('data-command');
            if (command === 'bold') {
                btn.classList.toggle('active', document.queryCommandState('bold'));
            } else if (command === 'italic') {
                btn.classList.toggle('active', document.queryCommandState('italic'));
            } else if (command === 'underline') {
                btn.classList.toggle('active', document.queryCommandState('underline'));
            } else if (command === 'strikeThrough') {
                btn.classList.toggle('active', document.queryCommandState('strikeThrough'));
            } else if (command === 'subscript') {
                btn.classList.toggle('active', document.queryCommandState('subscript'));
            } else if (command === 'superscript') {
                btn.classList.toggle('active', document.queryCommandState('superscript'));
            } else if (command === 'insertUnorderedList') {
                btn.classList.toggle('active', document.queryCommandState('insertUnorderedList'));
            } else if (command === 'insertOrderedList') {
                btn.classList.toggle('active', document.queryCommandState('insertOrderedList'));
            } else if (command === 'justifyRight') {
                btn.classList.toggle('active', document.queryCommandState('justifyRight'));
            } else if (command === 'justifyCenter') {
                btn.classList.toggle('active', document.queryCommandState('justifyCenter'));
            } else if (command === 'justifyLeft') {
                btn.classList.toggle('active', document.queryCommandState('justifyLeft'));
            } else if (command === 'justifyFull') {
                btn.classList.toggle('active', document.queryCommandState('justifyFull'));
            }
        });
    }

    editor.addEventListener('keyup', updateToolbarState);
    editor.addEventListener('mouseup', updateToolbarState);
    editor.addEventListener('click', updateToolbarState);
    editor.addEventListener('input', updateWordCount);

    // ===== Word & Character Count =====
    function updateWordCount() {
        const text = editor.innerText || '';
        const trimmed = text.trim();

        // Character count
        const charCount = trimmed.length;
        charCountEl.textContent = toPersianNum(charCount) + ' حرف';

        // Word count (Persian/English)
        let wordCount = 0;
        if (trimmed) {
            const words = trimmed.split(/\s+/).filter(w => w.length > 0);
            wordCount = words.length;
        }
        wordCountEl.textContent = toPersianNum(wordCount) + ' کلمه';
    }

    // ===== Keyboard Shortcuts =====
    editor.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.key === 'b') {
            e.preventDefault();
            document.execCommand('bold');
            updateToolbarState();
        }
        if (e.ctrlKey && e.key === 'i') {
            e.preventDefault();
            document.execCommand('italic');
            updateToolbarState();
        }
        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
            document.execCommand('underline');
            updateToolbarState();
        }
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            document.execCommand('undo');
        }
        if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            document.execCommand('redo');
        }
        if (e.key === 'Tab') {
            e.preventDefault();
            document.execCommand('insertText', false, '\u00A0\u00A0\u00A0\u00A0');
        }
        // Ctrl+K for link
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            openModal('linkModal');
        }
    });

    // ===== Paste Handling =====
    editor.addEventListener('paste', function (e) {
        e.preventDefault();
        const html = (e.clipboardData || window.clipboardData).getData('text/html');
        const text = (e.clipboardData || window.clipboardData).getData('text/plain');

        if (html) {
            // Clean up pasted HTML
            const temp = document.createElement('div');
            temp.innerHTML = html;

            // Remove scripts and styles
            temp.querySelectorAll('script, style, meta, link').forEach(el => el.remove());

            document.execCommand('insertHTML', false, temp.innerHTML);
        } else {
            document.execCommand('insertText', false, text);
        }
        updateWordCount();
    });

    // ===== Drag & Drop Images =====
    editor.addEventListener('dragover', function (e) {
        e.preventDefault();
        editor.style.background = 'rgba(240, 165, 0, 0.05)';
    });

    editor.addEventListener('dragleave', function () {
        editor.style.background = '';
    });

    editor.addEventListener('drop', function (e) {
        e.preventDefault();
        editor.style.background = '';

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            Array.from(files).forEach(function (file) {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function (ev) {
                        editor.focus();
                        document.execCommand('insertImage', false, ev.target.result);
                        showToast('تصویر با موفقیت اضافه شد', 'success');
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    });

    // ===== Fullscreen =====
    const btnFullscreen = document.getElementById('btnFullscreen');
    btnFullscreen.addEventListener('click', function () {
        editorWrapper.classList.toggle('fullscreen');
        if (editorWrapper.classList.contains('fullscreen')) {
            this.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>';
            showToast('حالت تمام‌صفحه فعال شد', 'info');
        } else {
            this.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>';
            showToast('حالت تمام‌صفحه غیرفعال شد', 'info');
        }
    });

    // ===== Theme Toggle =====
    const btnThemeToggle = document.getElementById('btnThemeToggle');
    btnThemeToggle.addEventListener('click', function () {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        showToast(isDark ? 'تم تاریک فعال شد' : 'تم روشن فعال شد', 'info');
    });

    // ===== Clear Format =====
    document.getElementById('btnClearFormat').addEventListener('click', function () {
        editor.focus();
        document.execCommand('removeFormat', false, null);
        document.execCommand('formatBlock', false, '<P>');
        showToast('فرمت‌ها حذف شدند', 'info');
    });

    // ===== Print =====
    document.getElementById('btnPrint').addEventListener('click', function () {
        window.print();
    });

    // ===== Export HTML =====
    document.getElementById('btnExportHTML').addEventListener('click', function () {
        const html = editor.innerHTML;
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'article.html';
        a.click();
        URL.revokeObjectURL(url);
        showToast('فایل HTML دانلود شد', 'success');
    });

    // ===== Modal System =====
    function openModal(id) {
        document.getElementById(id).classList.add('show');
    }

    function closeModal(id) {
        document.getElementById(id).classList.remove('show');
    }

    // Close modal on overlay click
    document.querySelectorAll('.modal-overlay').forEach(function (overlay) {
        overlay.addEventListener('click', function (e) {
            if (e.target === this) {
                this.classList.remove('show');
            }
        });
    });

    // ===== Link Modal =====
    const btnInsertLink = document.getElementById('btnInsertLink');
    const linkModal = document.getElementById('linkModal');

    btnInsertLink.addEventListener('click', function () {
        const selection = window.getSelection();
        if (selection.toString()) {
            document.getElementById('linkText').value = selection.toString();
        }
        openModal('linkModal');
    });

    document.getElementById('closeLinkModal').addEventListener('click', function () {
        closeModal('linkModal');
    });

    document.getElementById('cancelLink').addEventListener('click', function () {
        closeModal('linkModal');
    });

    document.getElementById('insertLinkBtn').addEventListener('click', function () {
        const url = document.getElementById('linkUrl').value.trim();
        const text = document.getElementById('linkText').value.trim();
        const newTab = document.getElementById('linkNewTab').checked;

        if (!url) {
            showToast('لطفاً آدرس URL را وارد کنید', 'error');
            return;
        }

        editor.focus();

        if (text) {
            const target = newTab ? ' target="_blank" rel="noopener"' : '';
            const linkHTML = '<a href="' + url + '"' + target + '>' + text + '</a>';
            document.execCommand('insertHTML', false, linkHTML);
        } else {
            document.execCommand('createLink', false, url);
            if (newTab) {
                const links = editor.querySelectorAll('a[href="' + url + '"]');
                links.forEach(function (link) {
                    link.setAttribute('target', '_blank');
                    link.setAttribute('rel', 'noopener');
                });
            }
        }

        closeModal('linkModal');
        document.getElementById('linkUrl').value = '';
        document.getElementById('linkText').value = '';
        showToast('لینک اضافه شد', 'success');
    });

    // ===== Unlink =====
    document.getElementById('btnUnlink').addEventListener('click', function () {
        editor.focus();
        document.execCommand('unlink', false, null);
        showToast('لینک حذف شد', 'info');
    });

    // ===== Image Modal =====
    const btnInsertImage = document.getElementById('btnInsertImage');
    const imageModal = document.getElementById('imageModal');

    btnInsertImage.addEventListener('click', function () {
        openModal('imageModal');
    });

    document.getElementById('closeImageModal').addEventListener('click', function () {
        closeModal('imageModal');
    });

    document.getElementById('cancelImage').addEventListener('click', function () {
        closeModal('imageModal');
    });

    document.getElementById('insertImageBtn').addEventListener('click', function () {
        const url = document.getElementById('imageUrl').value.trim();
        const alt = document.getElementById('imageAlt').value.trim();
        const width = document.getElementById('imageWidth').value.trim();

        if (!url) {
            showToast('لطفاً آدرس تصویر را وارد کنید', 'error');
            return;
        }

        editor.focus();

        let imgHTML = '<img src="' + url + '"';
        if (alt) imgHTML += ' alt="' + alt + '"';
        if (width) imgHTML += ' width="' + width + '"';
        imgHTML += '>';

        document.execCommand('insertHTML', false, imgHTML);

        closeModal('imageModal');
        document.getElementById('imageUrl').value = '';
        document.getElementById('imageAlt').value = '';
        document.getElementById('imageWidth').value = '';
        showToast('تصویر اضافه شد', 'success');
    });

    // ===== Table Modal =====
    const btnInsertTable = document.getElementById('btnInsertTable');
    const tableModal = document.getElementById('tableModal');
    const gridPreview = document.getElementById('gridPreview');
    const gridInfo = document.getElementById('gridInfo');

    // Create grid cells
    const gridCells = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 10; c++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.row = r + 1;
            cell.dataset.col = c + 1;
            gridPreview.appendChild(cell);
            gridCells.push(cell);
        }
    }

    let hoverRows = 0, hoverCols = 0;

    gridCells.forEach(function (cell) {
        cell.addEventListener('mouseenter', function () {
            hoverRows = parseInt(this.dataset.row);
            hoverCols = parseInt(this.dataset.col);

            gridCells.forEach(function (c) {
                const r = parseInt(c.dataset.row);
                const col = parseInt(c.dataset.col);
                c.classList.toggle('hovered', r <= hoverRows && col <= hoverCols);
            });

            gridInfo.textContent = toPersianNum(hoverRows) + ' × ' + toPersianNum(hoverCols);
        });

        cell.addEventListener('click', function () {
            document.getElementById('tableRows').value = hoverRows;
            document.getElementById('tableCols').value = hoverCols;
        });
    });

    gridPreview.addEventListener('mouseleave', function () {
        gridCells.forEach(function (c) { c.classList.remove('hovered'); });
        gridInfo.textContent = '۰ × ۰';
    });

    btnInsertTable.addEventListener('click', function () {
        openModal('tableModal');
    });

    document.getElementById('closeTableModal').addEventListener('click', function () {
        closeModal('tableModal');
    });

    document.getElementById('cancelTable').addEventListener('click', function () {
        closeModal('tableModal');
    });

    document.getElementById('insertTableBtn').addEventListener('click', function () {
        const rows = parseInt(document.getElementById('tableRows').value) || 3;
        const cols = parseInt(document.getElementById('tableCols').value) || 3;

        editor.focus();

        let tableHTML = '<table><thead><tr>';
        for (let c = 0; c < cols; c++) {
            tableHTML += '<th>عنوان ' + toPersianNum(c + 1) + '</th>';
        }
        tableHTML += '</tr></thead><tbody>';

        for (let r = 0; r < rows - 1; r++) {
            tableHTML += '<tr>';
            for (let c = 0; c < cols; c++) {
                tableHTML += '<td>محتوا</td>';
            }
            tableHTML += '</tr>';
        }
        tableHTML += '</tbody></table><p></p>';

        document.execCommand('insertHTML', false, tableHTML);

        closeModal('tableModal');
        showToast('جدول اضافه شد (' + toPersianNum(rows) + ' سطر × ' + toPersianNum(cols) + ' ستون)', 'success');
    });

    // ===== Find & Replace Modal =====
    const btnFindReplace = document.getElementById('btnFindReplace');
    const findReplaceModal = document.getElementById('findReplaceModal');
    const findResult = document.getElementById('findResult');

    btnFindReplace.addEventListener('click', function () {
        openModal('findReplaceModal');
    });

    document.getElementById('closeFindModal').addEventListener('click', function () {
        closeModal('findReplaceModal');
    });

    document.getElementById('findBtn').addEventListener('click', function () {
        const searchText = document.getElementById('findText').value.trim();
        if (!searchText) {
            findResult.textContent = 'لطفاً متن جستجو را وارد کنید';
            return;
        }

        const content = editor.innerText;
        const regex = new RegExp(searchText, 'g');
        const matches = content.match(regex);
        const count = matches ? matches.length : 0;

        findResult.textContent = toPersianNum(count) + ' مورد یافت شد';

        if (count > 0) {
            // Highlight first occurrence
            editor.focus();
            if (window.find) {
                window.find(searchText);
            }
        }
    });

    document.getElementById('replaceOneBtn').addEventListener('click', function () {
        const searchText = document.getElementById('findText').value.trim();
        const replaceText = document.getElementById('replaceText').value;

        if (!searchText) {
            showToast('لطفاً متن جستجو را وارد کنید', 'error');
            return;
        }

        const content = editor.innerHTML;
        const regex = new RegExp(searchText, '');
        const newContent = content.replace(regex, replaceText);

        if (content !== newContent) {
            editor.innerHTML = newContent;
            findResult.textContent = 'یک مورد جایگزین شد';
            showToast('جایگزین شد', 'success');
        } else {
            findResult.textContent = 'موردی یافت نشد';
        }
    });

    document.getElementById('replaceAllBtn').addEventListener('click', function () {
        const searchText = document.getElementById('findText').value.trim();
        const replaceText = document.getElementById('replaceText').value;

        if (!searchText) {
            showToast('لطفاً متن جستجو را وارد کنید', 'error');
            return;
        }

        const content = editor.innerHTML;
        const regex = new RegExp(searchText, 'g');
        const matches = content.match(regex);
        const count = matches ? matches.length : 0;
        const newContent = content.replace(regex, replaceText);

        if (count > 0) {
            editor.innerHTML = newContent;
            findResult.textContent = toPersianNum(count) + ' مورد جایگزین شد';
            showToast(toPersianNum(count) + ' مورد جایگزین شد', 'success');
        } else {
            findResult.textContent = 'موردی یافت نشد';
        }
    });

    // ===== Toast =====
    function showToast(message, type) {
        const existing = document.querySelector('.toast.show');
        if (existing) {
            existing.classList.remove('show');
        }

        toast.textContent = message;
        toast.className = 'toast ' + (type || 'info');

        requestAnimationFrame(function () {
            toast.classList.add('show');
        });

        setTimeout(function () {
            toast.classList.remove('show');
        }, 3000);
    }

    // ===== Auto-save to localStorage =====
    const STORAGE_KEY = 'article_editor_content';

    function autoSave() {
        const content = editor.innerHTML;
        localStorage.setItem(STORAGE_KEY, content);
    }

    function loadSaved() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && saved.trim()) {
            editor.innerHTML = saved;
            updateWordCount();
            showToast('محتوای ذخیره‌شده بازیابی شد', 'info');
        }
    }

    // Auto-save every 5 seconds
    setInterval(autoSave, 5000);

    // Load on start
    loadSaved();

    // ===== Escape key to close modals =====
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.show').forEach(function (modal) {
                modal.classList.remove('show');
            });
            if (editorWrapper.classList.contains('fullscreen')) {
                editorWrapper.classList.remove('fullscreen');
            }
        }
    });

    // ===== Initial word count =====
    updateWordCount();

});