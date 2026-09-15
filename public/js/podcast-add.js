/* ==========================================================================
Podcast Add Form Script
========================================================================== */
(() => {
    let editId = null;
    let coverImage = '';
    let audioFile = null;
    let currentStatus = 'draft';
    let slugTouched = false;





    document.addEventListener('DOMContentLoaded', () => {
        // Check for edit mode
        const params = new URLSearchParams(location.search);
        editId = params.get('id');
        if (editId) {
            document.getElementById('page-title').textContent = 'ویرایش پادکست';
            document.getElementById('form-heading').textContent = 'ویرایش پادکست';
            document.getElementById('btn-save').innerHTML = '<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> ذخیره تغییرات';
        } else {
            // Set current date in Shamsi
            const today = new Date();
            const shamsiDate = gregorianToJalali(today.getFullYear(), today.getMonth() + 1, today.getDate());
            document.getElementById('f-date').value = `${shamsiDate[0]}/${String(shamsiDate[1]).padStart(2, '0')}/${String(shamsiDate[2]).padStart(2, '0')}`;
        }

        bindTitleSlug();
        bindStatusTabs();
        bindUploads();
        bindFormSubmit();
        bindPreview();
    });

    /* ---------------------- Gregorian to Jalali (Shamsi) Converter ---------------------- */
    function gregorianToJalali(gy, gm, gd) {
        var g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        var gy2 = (gm > 2) ? (gy + 1) : gy;
        var days = 355666 + (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) + gd + g_d_m[gm - 1];
        var jy = -1595 + (33 * Math.floor(days / 12053));
        days %= 12053;
        jy += 4 * Math.floor(days / 1461);
        days %= 1461;
        if (days > 365) {
            jy += Math.floor((days - 1) / 365);
            days = (days - 1) % 365;
        }
        var jm = (days < 186) ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
        var jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
        return [jy, jm, jd];
    }

    /* ---------------------- Title -> Slug auto-generation ---------------------- */
    function bindTitleSlug() {

    }

    /* ---------------------- Status tabs ---------------------- */
    function bindStatusTabs() {
        document.querySelectorAll('.status-toggle__btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.status-toggle__btn').forEach(b => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                currentStatus = btn.dataset.value;
            });
        });
    }

    /* ---------------------- Uploads ---------------------- */

function bindUploads() {

    // =========================
    // Audio Upload
    // =========================

    const audioBox = document.getElementById('audio-upload');
    const audioInput = document.getElementById('audio-input');
    const audioFileInfo = document.getElementById('audio-file-info');
    const audioFileName = document.getElementById('audio-file-name');
    const removeAudio = document.getElementById('remove-audio');

    if (audioBox && audioInput) {

        // کلیک روی باکس
        audioBox.addEventListener('click', (e) => {

            if (
                e.target.id === 'remove-audio' ||
                e.target.closest('#remove-audio')
            ) {
                return;
            }

            audioInput.click();
        });


        // انتخاب فایل صوتی
        audioInput.addEventListener('change', () => {

            const file = audioInput.files[0];

            if (!file) return;


            // حداکثر 50MB
            if (file.size > 50 * 1024 * 1024) {

                showToast(
                    'error',
                    'حجم فایل زیاد است',
                    'حجم فایل صوتی نباید بیشتر از ۵۰ مگابایت باشد.'
                );

                audioInput.value = '';
                return;
            }


            // فرمت‌های مجاز
            const allowedTypes = [
                'audio/mpeg',
                'audio/wav',
                'audio/x-wav',
                'audio/mp4',
                'audio/ogg',
                'audio/webm'
            ];

            if (!allowedTypes.includes(file.type)) {

                showToast(
                    'error',
                    'فرمت نامعتبر',
                    'فرمت فایل صوتی باید MP3، WAV، M4A، OGG یا WebM باشد.'
                );

                audioInput.value = '';
                return;
            }


            // ذخیره فایل
            audioFile = file;


            // نمایش نام فایل
            if (audioFileName) {
                audioFileName.textContent = file.name;
            }


            // نمایش اطلاعات فایل
            if (audioFileInfo) {
                audioFileInfo.style.display = 'flex';
            }


            // گرفتن مدت واقعی Audio
            const audio = document.createElement('audio');

            audio.preload = 'metadata';

            const objectUrl = URL.createObjectURL(file);

            audio.onloadedmetadata = () => {

                const duration = audio.duration;

                const hours = Math.floor(duration / 3600);
                const minutes = Math.floor((duration % 3600) / 60);
                const seconds = Math.floor(duration % 60);

                let formattedDuration = '';

                if (hours > 0) {

                    formattedDuration =
                        `${String(hours).padStart(2, '0')}:` +
                        `${String(minutes).padStart(2, '0')}:` +
                        `${String(seconds).padStart(2, '0')}`;

                } else {

                    formattedDuration =
                        `${String(minutes).padStart(2, '0')}:` +
                        `${String(seconds).padStart(2, '0')}`;
                }

                document.getElementById('f-duration').value =
                    formattedDuration;

                URL.revokeObjectURL(objectUrl);
            };

            audio.onerror = () => {

                console.error('خطا در خواندن مدت فایل صوتی');

                URL.revokeObjectURL(objectUrl);
            };

            audio.src = objectUrl;


            clearFieldError(
                audioBox.closest('.form-field')
            );
        });


        // حذف فایل صوتی
        if (removeAudio) {

            removeAudio.addEventListener('click', (e) => {

                e.stopPropagation();

                audioFile = null;

                audioInput.value = '';

                if (audioFileName) {
                    audioFileName.textContent = '';
                }

                if (audioFileInfo) {
                    audioFileInfo.style.display = 'none';
                }
            });
        }
    }


    // =========================
// Cover Upload
// =========================

const coverBox = document.getElementById('cover-upload');
const coverInput = document.getElementById('cover-input');

if (coverBox && coverInput) {

    // کلیک روی باکس
    coverBox.addEventListener('click', () => {
        coverInput.click();
    });

    // انتخاب عکس
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

            return;
        }

        // تبدیل عکس به preview
        readAsDataUrl(file, (result) => {

            coverImage = result;

            renderCoverPreview();

        });

    });
}


}



    function readAsDataUrl(file, cb) {
        const reader = new FileReader();
        reader.onload = () => cb(reader.result);
        reader.readAsDataURL(file);
    }

    function renderCoverPreview() {
        const wrap = document.getElementById('cover-preview');
        wrap.innerHTML = coverImage ? `
            <div class="upload-preview__item">
                <img src="${coverImage}" alt="تصویر کاور">
                <button type="button" class="upload-preview__remove" onclick="PodcastForm.removeCover()">✕</button>
            </div>
        ` : '';
    }

    function removeCover() {
        coverImage = '';
        document.getElementById('cover-input').value = '';
        renderCoverPreview();
    }

    /* ---------------------- Validation ---------------------- */
    function setFieldError(field, hasError) {
        field.classList.toggle('has-error', hasError);
        field.classList.toggle('is-valid', !hasError);
    }
    function clearFieldError(field) { field.classList.remove('has-error'); }

    function validate() {
        let valid = true;
        const fields = [
            { el: document.getElementById('f-title'), check: v => v.trim().length > 2 },

            { el: document.getElementById('f-date'), check: v => v !== '' }
        ];
        
        fields.forEach(f => {
            const ok = f.check(f.el.value);
            setFieldError(f.el.closest('.form-field'), !ok);
            if (!ok) valid = false;
        });

        const audioField = document.getElementById('audio-upload').closest('.form-field');
const audioError = document.getElementById('audio-error');

if (!audioFile) {

    audioField.classList.add('has-error');
    audioError.style.display = 'flex';
    valid = false;

} else {

    audioField.classList.remove('has-error');
    audioError.style.display = 'none';
}

        const coverField = document.getElementById('cover-upload').closest('.form-field');
        const coverError = document.getElementById('cover-error');
        if (!coverImage) {
            coverField.classList.add('has-error');
            coverError.style.display = 'flex';
            valid = false;
        } else {
            coverField.classList.remove('has-error');
            coverError.style.display = 'none';
        }

        return valid;
    }

    /* ---------------------- Submit ---------------------- */
    function bindFormSubmit() {
        document.getElementById('btn-save').addEventListener('click', (e) => {
            e.preventDefault();
            save();
        });
    }



    function resetPodcastForm() {

    const form = document.getElementById('podcast-form');

    if (form) {
        form.reset();
    }

    // -------------------------
    // Reset JS state
    // -------------------------

    coverImage = '';
    audioFile = null;
    currentStatus = 'draft';


    // -------------------------
    // Reset status buttons
    // -------------------------

    document.querySelectorAll('.status-toggle__btn').forEach(btn => {
        btn.classList.remove('is-active');

        if (btn.dataset.value === 'draft') {
            btn.classList.add('is-active');
        }
    });

    const statusInput = document.getElementById('status');

    if (statusInput) {
        statusInput.value = 'draft';
    }


    // -------------------------
    // Reset audio UI
    // -------------------------

    const audioInput = document.getElementById('audio-input');
    const audioFileInfo = document.getElementById('audio-file-info');
    const audioFileName = document.getElementById('audio-file-name');
    const durationInput = document.getElementById('f-duration');

    if (audioInput) {
        audioInput.value = '';
    }

    if (audioFileInfo) {
        audioFileInfo.style.display = 'none';
    }

    if (audioFileName) {
        audioFileName.textContent = '';
    }

    if (durationInput) {
        durationInput.value = '';
    }


    // -------------------------
    // Reset cover UI
    // -------------------------

    const coverInput = document.getElementById('cover-input');
    const coverPreview = document.getElementById('cover-preview');

    if (coverInput) {
        coverInput.value = '';
    }

    if (coverPreview) {
        coverPreview.innerHTML = '';
    }


    // -------------------------
    // Reset date
    // -------------------------

    if (!editId) {

        const today = new Date();

        const shamsiDate = gregorianToJalali(
            today.getFullYear(),
            today.getMonth() + 1,
            today.getDate()
        );

        const dateInput = document.getElementById('f-date');

        if (dateInput) {
            dateInput.value =
                `${shamsiDate[0]}/` +
                `${String(shamsiDate[1]).padStart(2, '0')}/` +
                `${String(shamsiDate[2]).padStart(2, '0')}`;
        }
    }


    // -------------------------
    // Reset validation errors
    // -------------------------

    document.querySelectorAll('.has-error').forEach(el => {
        el.classList.remove('has-error');
    });

    document.querySelectorAll('.is-valid').forEach(el => {
        el.classList.remove('is-valid');
    });

    document.querySelectorAll('.form-error').forEach(el => {
        el.style.display = 'none';
    });

}


async function save() {

    if (!validate()) {

        showToast(
            'error',
            'اطلاعات ناقص است',
            'لطفا فیلدهای الزامی مشخص‌شده را تکمیل کنید.'
        );

        const firstError = document.querySelector('.has-error');

        if (firstError) {
            firstError.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }

        return;
    }

    const formData = new FormData();

    // عنوان
    formData.append(
        'title',
        document.getElementById('f-title').value.trim()
    );

    // شماره اپیزود
    formData.append(
        'episod',
       document.getElementById('f-episode').value
    );

    // مدت زمان
    formData.append(
        'time',
        document.getElementById('f-duration').value.trim()
    );

    // وضعیت
    formData.append(
        'status',
        currentStatus
    );

    // تاریخ
    formData.append(
        'createdAT',
        document.getElementById('f-date').value
    );

    // فایل صوتی
    if (audioFile) {
        formData.append(
            'audio',
            audioFile
        );
    }

    // تصویر کاور
    const coverInput = document.getElementById('cover-input');

    if (coverInput.files[0]) {
        formData.append(
            'cover',
            coverInput.files[0]
        );
    }

    try {

        const response = await fetch('/api/podcast', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {

            showToast(
                'error',
                'خطا',
                data.message || 'خطا در ذخیره پادکست'
            );

            return;
        }

        showToast(
            'success',
            'پادکست با موفقیت ذخیره شد',
            'پادکست جدید اضافه شد.'
        );

        resetPodcastForm();

        

    } catch (error) {

        console.error('Error:', error);

        showToast(
            'error',
            'خطا',
            'ارتباط با سرور برقرار نشد.'
        );
    }
}

    /* ---------------------- Preview Modal ---------------------- */
    function bindPreview() {
        document.getElementById('btn-preview').addEventListener('click', () => {
            const title = document.getElementById('f-title').value.trim() || 'بدون عنوان';
            const excerpt = document.getElementById('f-excerpt').value.trim() || 'توضیحی وارد نشده است.';
            const date = document.getElementById('f-date').value || 'تاریخ مشخص نشده';
            const duration = document.getElementById('f-duration').value.trim() || 'مدت زمان مشخص نشده';

            const coverHtml = coverImage 
                ? `<img src="${coverImage}" class="podcast-preview-card__cover" alt="کاور پادکست">`
                : `<div class="podcast-preview-card__cover" style="display:flex;align-items:center;justify-content:center;color:var(--color-gray-400);"><svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>`;

            document.getElementById('preview-body').innerHTML = `
                <div class="podcast-preview-card">
                    ${coverHtml}
                    <div class="podcast-preview-card__content">
                        <div class="podcast-preview-card__meta">
                            <span class="text-muted text-xs">${date}</span>
                            <span class="text-muted text-xs">•</span>
                            <span class="text-muted text-xs">${duration}</span>
                        </div>
                        <h2 class="podcast-preview-card__title">${title}</h2>
                        <p class="podcast-preview-card__excerpt">${excerpt}</p>
                        
                        <div class="podcast-preview-card__player-mock">
                            <button class="podcast-preview-card__play-btn" type="button">
                                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            </button>
                            <div class="podcast-preview-card__waveform"></div>
                            <span class="podcast-preview-card__time">${duration}</span>
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('preview-modal').classList.add('is-open');
        });
    }

    /* ---------------------- Toast Notification ---------------------- */
    function showToast(type, title, desc) {
        const stack = document.getElementById('toast-stack');
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        
        let iconSvg = '';
        if (type === 'success') iconSvg = '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
        else if (type === 'error') iconSvg = '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
        
        toast.innerHTML = `
            <div class="toast__icon">${iconSvg}</div>
            <div>
                <div class="toast__title">${title}</div>
                <div class="toast__desc">${desc}</div>
            </div>
            <button class="toast__close" onclick="this.parentElement.remove()">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        `;
        
        stack.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('is-leaving');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.dataset.close;
            document.getElementById(modalId).classList.remove('is-open');
        });
    });

    window.PodcastForm = { removeCover };
})();

