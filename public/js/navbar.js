
document.addEventListener('DOMContentLoaded', function () {

    const navbar   = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu  = document.getElementById('navMenu');

    // بررسی وجود عناصر
    if (!hamburger || !navMenu) {
        console.error('❌ hamburger یا navMenu پیدا نشد!');
        console.log('hamburger:', hamburger);
        console.log('navMenu:', navMenu);
        return;
    }

    console.log('✅ Navbar JS loaded');

    // باز و بسته کردن منو
    hamburger.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const isOpen = navMenu.classList.contains('active');

        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');

        // جلوگیری از اسکرول صفحه وقتی منو باز است
        document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    // بستن منو وقتی روی لینک کلیک شد
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 1200) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // بستن منو وقتی بیرون از منو کلیک شد
    document.addEventListener('click', function (e) {
        if (window.innerWidth <= 1200 &&
            navMenu.classList.contains('active') &&
            !navMenu.contains(e.target) &&
            !hamburger.contains(e.target)) {
            
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // افکت اسکرول
    window.addEventListener('scroll', function () {
        if (window.pageYOffset > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

});