document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("callform");
    
    // ========== منطق فرم تماس ==========
    contactForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const formData = {
            fullname: document.getElementById("fullname").value.trim(),
            company: document.getElementById("company").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            email: document.getElementById("email").value.trim(),
            message: document.getElementById("message").value.trim()
        };

        console.log("اطلاعات فرم برای ارسال: ", formData);

        if (!formData.fullname || !formData.phone || !formData.email || !formData.message) {
            alert("لطفاً تمامی فیلدهای ضروری را به درستی تکمیل کنید.");
            return;
        }

        alert("درخواست شما با موفقیت ثبت شد. کارشناسان ما به زودی با شما تماس می‌گیرند.");
        contactForm.reset();
    });

    // ========== منطق مودال کارشناسان ==========
    const expertCards = document.querySelectorAll(".expert-card");
    const modalOverlay = document.getElementById("expertModal");
    const modalClose = document.getElementById("modalClose");
    const modalAvatar = document.getElementById("modalAvatar");
    const modalName = document.getElementById("modalName");
    const modalRole = document.getElementById("modalRole");
    const modalDescription = document.getElementById("modalDescription");
    const modalQuestions = document.getElementById("modalQuestions");
    const modalCallBtn = document.getElementById("modalCallBtn");
    const modalWhatsappBtn = document.getElementById("modalWhatsappBtn");

    // متغیر برای ذخیره شماره تلفن فعلی
    let currentPhone = "";

    // باز کردن مودال با کلیک روی کارت
    expertCards.forEach(card => {
        card.addEventListener("click", function(e) {
            // جلوگیری از باز شدن مودال وقتی روی آیکون واتساپ کلیک می‌شود
            if (e.target.classList.contains("whatsapp-icon")) {
                e.stopPropagation();
                return;
            }

            // دریافت اطلاعات از data attributes
            const name = this.getAttribute("data-name");
            const role = this.getAttribute("data-role");
            const image = this.getAttribute("data-image");
            const description = this.getAttribute("data-description");
            const questions = this.getAttribute("data-questions");
            const phone = this.querySelector(".expert-contact span").textContent.trim();

            // پر کردن محتوای مودال
            modalAvatar.src = image;
            modalAvatar.alt = name;
            modalName.textContent = name;
            modalRole.textContent = role;
            modalDescription.textContent = description;
            currentPhone = phone;

            // پاک کردن سوالات قبلی و افزودن سوالات جدید
            modalQuestions.innerHTML = "";
            const questionsList = questions.split("\n").filter(q => q.trim() !== "");
            questionsList.forEach(question => {
                const li = document.createElement("li");
                li.textContent = question.replace("•", "").trim();
                modalQuestions.appendChild(li);
            });

            // نمایش مودال
            modalOverlay.classList.add("active");
            document.body.style.overflow = "hidden"; // جلوگیری از اسکرول صفحه
        });
    });

    // بستن مودال با دکمه بستن
    modalClose.addEventListener("click", closeModal);

    // بستن مودال با کلیک روی overlay (خارج از مودال)
    modalOverlay.addEventListener("click", function(e) {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // بستن مودال با کلید Escape
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape" && modalOverlay.classList.contains("active")) {
            closeModal();
        }
    });

    // تابع بستن مودال
    function closeModal() {
        modalOverlay.classList.remove("active");
        document.body.style.overflow = ""; // بازگرداندن اسکرول
    }

    // دکمه تماس مستقیم
    modalCallBtn.addEventListener("click", function() {
        if (currentPhone) {
            // تبدیل شماره به فرمت مناسب برای لینک tel:
            const cleanPhone = currentPhone.replace(/\s/g, "");
            window.location.href = `tel:${cleanPhone}`;
        }
    });

    // دکمه واتساپ
    modalWhatsappBtn.addEventListener("click", function() {
        if (currentPhone) {
            // تبدیل شماره به فرمت بین‌المللی برای واتساپ
            const cleanPhone = currentPhone.replace(/\s/g, "");
            // فرض بر اینکه شماره‌ها ایرانی هستند (98+)
            let whatsappPhone = cleanPhone;
            if (cleanPhone.startsWith("0")) {
                whatsappPhone = "98" + cleanPhone.substring(1);
            }
            const message = encodeURIComponent(`سلام ${modalName.textContent}، وقت بخیر. از طریق سایت کافه معدن با شما تماس گرفتم.`);
            window.open(`https://wa.me/${whatsappPhone}?text=${message}`, "_blank");
        }
    });

    // جلوگیری از بسته شدن مودال با کلیک روی دکمه‌های داخلی
    document.querySelectorAll(".modal-btn").forEach(btn => {
        btn.addEventListener("click", function(e) {
            e.stopPropagation();
        });
    });

    // ================================================================
    // 🍔 HAMBURGER MENU ENHANCEMENTS (صفحه تماس با ما)
    // ================================================================
    // navbar.js قبلاً باز/بسته‌کردن منو، ESC و کلیک روی لینک‌ها را هندل
    // می‌کند. اینجا موارد اضافی برای تجربه حرفه‌ای اضافه می‌کنیم:
    //   1) کلیک خارج از منو → بستن منو
    //   2) Focus trap داخل منو (دسترسی‌پذیری کیبورد)
    //   3) همگام‌سازی aria-expanded روی دکمه hamburger
    //   4) tabindex روی expert-cardها برای دسترسی‌پذیری کیبورد
    // توجه: این کد فقط به این صفحه اضافه شده تا روی صفحات دیگر
    // اثر نگذارد. تمام قابلیت‌های موجود در navbar.js حفظ می‌شود.
    // ================================================================

    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger && navMenu) {
        // ── 1) کلیک خارج از منو → بستن ──────────────────────────────
        document.addEventListener('click', function(e) {
            // اگر منو بسته است → کاری نداریم
            if (!navMenu.classList.contains('active')) return;

            const clickedInsideMenu = navMenu.contains(e.target);
            const clickedHamburger = hamburger.contains(e.target);

            if (!clickedInsideMenu && !clickedHamburger) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });

        // ── 2) Focus trap داخل منو (دسترسی‌پذیری کیبورد) ─────────────
        const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled])';
        let lastFocusedElement = null;

        document.addEventListener('keydown', function(e) {
            if (e.key !== 'Tab' || !navMenu.classList.contains('active')) return;

            const focusable = navMenu.querySelectorAll(focusableSelector);
            if (focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey) {
                // Shift+Tab از اول → رفتن به آخر
                if (document.activeElement === first || document.activeElement === hamburger) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                // Tab از آخر → رفتن به اول
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });

        // ── 3) همگام‌سازی aria-expanded و مدیریت focus ─────────────
        // استفاده از MutationObserver برای تشخیص تغییر کلاس active
        const menuObserver = new MutationObserver(function() {
            const isOpen = navMenu.classList.contains('active');
            hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

            if (isOpen) {
                lastFocusedElement = document.activeElement;
                // تاخیر کوتاه برای اتمام انیمیشن و سپس focus روی اولین لینک
                setTimeout(function() {
                    const firstLink = navMenu.querySelector('a[href]');
                    if (firstLink) firstLink.focus();
                }, 250);
            } else if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
                // بازگرداندن focus به آخرین المان قبل از باز شدن منو
                lastFocusedElement.focus();
                lastFocusedElement = null;
            }
        });
        menuObserver.observe(navMenu, { attributes: true, attributeFilter: ['class'] });

        // مقدار اولیه aria-expanded
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-controls', 'navMenu');
    }

    // ================================================================
    // ♿ دسترسی‌پذیری: tabindex روی expert-cardها
    // ================================================================
    // برای اینکه کاربران کیبوردی بتوانند روی کارت‌های کارشناسان focus
    // کنند و با Enter بازش کنند، tabindex=0 اضافه می‌کنیم.
    document.querySelectorAll('.expert-card').forEach(function(card) {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', 'مشاهده اطلاعات ' + (card.getAttribute('data-name') || 'کارشناس'));

        // باز شدن مودال با کلید Enter یا Space
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });

    console.log('✅ صفحه تماس با ما بارگذاری شد — بهبودهای ریسپانسیو فعال است');
});
