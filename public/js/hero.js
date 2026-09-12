/* ============================================
   Cafe Madan Newsletter Hero — Creative JS
   ============================================ */
(function () {
    'use strict';

    function init() {
        var hero = document.querySelector('.cm-hero');
        if (!hero) return;

        var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) return;

        // Entrance observer
        var rect = hero.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            activateHero(hero);
        } else {
            var obs = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        activateHero(hero);
                        obs.unobserve(hero);
                    }
                });
            }, { threshold: 0.15 });
            obs.observe(hero);
        }

        // Subtle parallax (desktop only)
        if (window.innerWidth >= 1024) {
            initParallax(hero);
        }
    }

    function activateHero(hero) {
        hero.classList.add('cm-hero--visible');

        var waveform = hero.querySelector('.cm-hero__waveform');
        if (waveform) {
            setTimeout(function () { startWavePulse(waveform); }, 1800);
        }
    }

    function startWavePulse(waveform) {
        var lines = waveform.querySelectorAll('line');
        if (!lines.length) return;

        function tick() {
            var t = Date.now() * 0.002;
            lines.forEach(function (line, i) {
                var base = 50;
                var amp = 8 + Math.sin(t + i * 0.35) * 5;
                var y2 = base - Math.abs(Math.sin(t * 1.2 + i * 0.55)) * amp - 5;
                line.setAttribute('y2', y2.toFixed(1));
            });
            waveform._raf = requestAnimationFrame(tick);
        }
        tick();
    }

    function initParallax(hero) {
        var rock = hero.querySelector('.cm-hero__rock-stage');
        var doc = hero.querySelector('.cm-hero__doc');
        var wave = hero.querySelector('.cm-hero__waveform');
        var badge = hero.querySelector('.cm-hero__badge');
        if (!rock || !doc || !wave) return;

        var ticking = false;

        hero.addEventListener('mousemove', function (e) {
            if (ticking) return;
            ticking = true;

            requestAnimationFrame(function () {
                var r = hero.getBoundingClientRect();
                var dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
                var dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);

                rock.style.transform = 'translate(' + (dx * 6) + 'px, ' + (dy * 5) + 'px)';
                doc.style.transform = 'translateY(-50%) rotate(-5deg) translate(' + (dx * -5) + 'px, ' + (dy * -4) + 'px)';
                wave.style.transform = 'translateY(-50%) translate(' + (dx * 4) + 'px, ' + (dy * 3) + 'px)';
                
                if (badge) {
                    badge.style.transform = 'translate(' + (dx * -3) + 'px, ' + (dy * -2) + 'px)';
                }

                ticking = false;
            });
        });

        hero.addEventListener('mouseleave', function () {
            rock.style.transform = '';
            doc.style.transform = 'translateY(-50%) rotate(-5deg)';
            wave.style.transform = 'translateY(-50%)';
            if (badge) badge.style.transform = '';
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();