document.addEventListener('DOMContentLoaded', () => {

    /* =========================================================
       متغیرهای سراسری برای مدیریت هوشمند فیلتر و جستجو
       ========================================================= */
    let activeFilter = 'all'; // 'all', 'article', 'video'
    let searchQuery = '';
    const searchInput = document.querySelector('.search-input');
    const clearBtn = document.getElementById('clearBtn');
    const dropdown = document.querySelector('.dropdown');
    const tabLinks = document.querySelectorAll('.tab-link');
    const cards = document.querySelectorAll('.article-card');

    /* =========================================================
       تابع هسته‌ای: اعمال همزمان فیلتر تب و جستجو
       ========================================================= */
    function applyFilters() {
        let visibleCount = 0;

        document.querySelectorAll('.article-card').forEach(card => {
            const type = card.getAttribute('data-type');
            const name = (card.getAttribute('data-name') || '').toLowerCase();

            // بررسی تطابق با فیلتر تب
            const matchesType = (activeFilter === 'all') || (activeFilter === type);
            // بررسی تطابق با متن جستجو
            const matchesSearch = (searchQuery === '') || name.includes(searchQuery);

            if (matchesType && matchesSearch) {
                card.style.display = 'block';
                // اگر کارت قبلاً fade-in شده، نیازی به تکرار نیست، اما اگر مخفی بوده، دوباره انیمیشن اجرا می‌شود
                if (!card.classList.contains('fade-in')) {
                    card.classList.add('fade-in');
                }
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // مدیریت پیام "موردی یافت نشد"
        let noResultsMsg = document.getElementById('no-results-msg');
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.id = 'no-results-msg';
            noResultsMsg.className = 'no-results';
            noResultsMsg.innerHTML = `
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    <line x1="8" y1="8" x2="14" y2="14"/><line x1="14" y1="8" x2="8" y2="14"/>
                </svg>
                <p>متأسفانه مقاله‌ای با این مشخصات یافت نشد.</p>
            `;
            document.querySelector('.articles-grid').parentNode.appendChild(noResultsMsg);
        }
        noResultsMsg.style.display = visibleCount === 0 ? 'flex' : 'none';
    }

    /* =========================================================
       بخش ۱: مدیریت جستجو و دکمه پاک‌سازی
       ========================================================= */
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchQuery = this.value.trim().toLowerCase();
            
            // نمایش/مخفی کردن دکمه ضربدر
            if (clearBtn) {
                if (searchQuery.length > 0) {
                    clearBtn.classList.add('visible');
                } else {
                    clearBtn.classList.remove('visible');
                }
            }
            
            applyFilters();
        });

        // عملکرد دکمه پاک‌سازی
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                searchQuery = '';
                clearBtn.classList.remove('visible');
                searchInput.focus();
                applyFilters();
            });
        }
    }

    /* =========================================================
       بخش ۲: مدیریت فیلتر تب‌ها و بستن خودکار منو در موبایل
       ========================================================= */
    tabLinks.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();

            // ۱. به‌روزرسانی کلاس active
            tabLinks.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // ۲. تعیین فیلتر بر اساس متن
            activeFilter = this.dataset.filter;

            // ۳. بستن خودکار منوی کشویی (حل مشکل موبایل)
            if (dropdown) {
                dropdown.classList.remove('dropdown-open');
                // خارج کردن فوکوس از لینک برای جلوگیری از ماندن حالت hover در موبایل
                if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                }
            }

            // ۴. اعمال فیلتر
            applyFilters();
        });
    });

    // باز و بسته کردن منو با کلیک روی دکمه اصلی (مخصوص موبایل)
    const allArticlesBtn = document.getElementById('allArticlesBtn');
    if (allArticlesBtn && dropdown) {
        allArticlesBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('dropdown-open');
        });
    }

    // بستن منو با کلیک در هر جای دیگر صفحه
    document.addEventListener('click', (e) => {
        if (dropdown && !dropdown.contains(e.target)) {
            dropdown.classList.remove('dropdown-open');
        }
    });

    /* =========================================================
       بخش ۳: HERO SECTION (همان کدهای قبلی با بهینه‌سازی جزئی)
       ========================================================= */
    const heroSection = document.getElementById('heroSection');
    if (heroSection) {
        const bgImage = heroSection.querySelector('.hero-bg-image');
        const topoPattern = heroSection.querySelector('.hero-topo-pattern');
        const heroContent = heroSection.querySelector('.hero-content');

        setTimeout(() => heroSection.classList.add('loaded'), 200);

        let ticking = false;
        function updateParallax() {
            const scrollY = window.pageYOffset;
            const heroHeight = heroSection.offsetHeight;
            if (scrollY <= heroHeight) {
                if (bgImage) bgImage.style.transform = `scale(1) translateY(${scrollY * 0.3}px)`;
                if (topoPattern) topoPattern.style.transform = `translateY(${scrollY * 0.15}px)`;
                if (heroContent) {
                    const opacity = 1 - (scrollY / heroHeight) * 1.5;
                    heroContent.style.opacity = Math.max(0, opacity);
                    heroContent.style.transform = `translateY(${scrollY * 0.4}px)`;
                }
            }
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) { requestAnimationFrame(updateParallax); ticking = true; }
        }, { passive: true });

        let desktopParallaxEnabled = window.innerWidth > 768;
        function handleMouseMove(e) {
            if (!desktopParallaxEnabled || !bgImage || !topoPattern) return;
            const rect = heroSection.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            bgImage.style.transform = `scale(1.05) translate(${x * -15}px, ${y * -10}px)`;
            topoPattern.style.transform = `translate(${x * 8}px, ${y * 5}px)`;
        }
        function resetParallaxTransforms() {
            if (bgImage) bgImage.style.transform = 'scale(1)';
            if (topoPattern) topoPattern.style.transform = 'translate(0, 0)';
        }

        heroSection.addEventListener('mousemove', handleMouseMove);
        heroSection.addEventListener('mouseleave', resetParallaxTransforms);
        window.addEventListener('resize', () => {
            desktopParallaxEnabled = window.innerWidth > 768;
            if (!desktopParallaxEnabled) resetParallaxTransforms();
        });

        function addDynamicTopoLines() {
            if (!topoPattern) return;
            const ns = 'http://www.w3.org/2000/svg';
            for (let i = 0; i < 5; i++) {
                const path = document.createElementNS(ns, 'path');
                const startY = 50 + Math.random() * 500;
                path.setAttribute('d', `M0,${startY} C${200 + Math.random()*400},${startY - 50 + Math.random()*100} ${600 + Math.random()*400},${startY + 20 - Math.random()*60} ${1200 + Math.random()*240},${startY - 20 + Math.random()*80}`);
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke', 'url(#topoGrad)');
                path.setAttribute('stroke-width', (0.4 + Math.random() * 0.8).toFixed(2));
                path.classList.add('topo-line');
                path.style.animationDelay = `${1.5 + i * 0.2}s`;
                topoPattern.appendChild(path);
            }
        }
        addDynamicTopoLines();

        function createGoldParticles() {
            const isSmallScreen = window.innerWidth <= 480;
            const fragment = document.createDocumentFragment();
            for (let i = 0; i < (isSmallScreen ? 8 : 15); i++) {
                const particle = document.createElement('div');
                particle.className = 'gold-particle';
                particle.style.cssText = `position: absolute; width: ${1 + Math.random() * 2}px; height: ${1 + Math.random() * 2}px; background: rgba(212, 160, 23, ${0.1 + Math.random() * 0.3}); border-radius: 50%; top: ${Math.random() * 100}%; left: ${Math.random() * 100}%; z-index: 5; pointer-events: none; animation: goldFloat ${3 + Math.random() * 4}s ease-in-out infinite alternate; animation-delay: ${Math.random() * 3}s;`;
                fragment.appendChild(particle);
            }
            heroSection.appendChild(fragment);
            if (!document.getElementById('goldParticleStyle')) {
                const style = document.createElement('style');
                style.id = 'goldParticleStyle';
                style.textContent = `@keyframes goldFloat { 0% { transform: translate(0, 0) scale(1); opacity: 0.3; } 50% { transform: translate(15px, -20px) scale(1.5); opacity: 0.6; } 100% { transform: translate(-10px, 10px) scale(0.8); opacity: 0.2; } }`;
                document.head.appendChild(style);
            }
        }
        createGoldParticles();

        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => { if (entry.isIntersecting) heroSection.classList.add('loaded'); });
        }, { threshold: 0.1 });
        heroObserver.observe(heroSection);
    }

    /* =========================================================
       بخش ۴: ARTICLE CARDS ANIMATION & LAZY LOAD
       ========================================================= */
    if (cards.length) {
        const fadeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const domIndex = Array.prototype.indexOf.call(cards, entry.target);
                    setTimeout(() => entry.target.classList.add('fade-in'), domIndex * 120);
                    fadeObserver.unobserve(entry.target);
                }
            });
        }, { root: null, rootMargin: '0px 0px -40px 0px', threshold: 0.15 });
        cards.forEach(card => fadeObserver.observe(card));

        const images = document.querySelectorAll('.card-image');
        const imgObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const revealImage = () => {
                        img.style.transition = 'opacity 0.6s ease';
                        img.style.opacity = '1';
                    };
                    if (img.complete && img.naturalWidth !== 0) revealImage();
                    else img.addEventListener('load', revealImage, { once: true });
                    imgObserver.unobserve(img);
                }
            });
        }, { threshold: 0.1 });
        images.forEach(img => imgObserver.observe(img));
    }

    console.log('✅ تمام ماژول‌های صفحه مقالات با موفقیت بارگذاری شدند.');
});



let allArticles = [];

async function loadArticles() {

    const response = await fetch("/api/articels");

    allArticles = await response.json();

    renderArticles(allArticles);

    
}

loadArticles();



