/* ============================================
   Cafe Madan — Signature Section JS
   Parallax + Interaction + Entrance
   ============================================ */
(function () {
    'use strict';

    function init() {
        var section = document.querySelector('.cafemadan-signature-section');
        if (!section) return;

        var visual = section.querySelector('.cafemadan-signature-section__visual');
        var layers = section.querySelectorAll('.cm-layer');
        var listenBtn = document.getElementById('signatureListenBtn');
        var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

        // --- Entrance Animation ---
        if (!prefersReduced) {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        section.classList.add('is-visible');
                        observer.unobserve(section);
                    }
                });
            }, { threshold: 0.2 });
            observer.observe(section);
        } else {
            section.classList.add('is-visible');
        }

        // --- Mouse Parallax (desktop only) ---
        if (!prefersReduced && !isTouchDevice) {
            var ticking = false;
            var containerRect = null;

            function updateContainerRect() {
                containerRect = visual.getBoundingClientRect();
            }

            visual.addEventListener('mouseenter', updateContainerRect);

            visual.addEventListener('mousemove', function (e) {
                if (ticking) return;
                ticking = true;

                requestAnimationFrame(function () {
                    if (!containerRect) updateContainerRect();

                    var centerX = containerRect.left + containerRect.width / 2;
                    var centerY = containerRect.top + containerRect.height / 2;
                    var deltaX = (e.clientX - centerX) / (containerRect.width / 2);
                    var deltaY = (e.clientY - centerY) / (containerRect.height / 2);

                    deltaX = Math.max(-1, Math.min(1, deltaX));
                    deltaY = Math.max(-1, Math.min(1, deltaY));

                    layers.forEach(function (layer) {
                        var speed = parseFloat(layer.getAttribute('data-speed')) || 0.5;
                        var moveX = deltaX * speed * 5;
                        var moveY = deltaY * speed * 3;
                        layer.style.transform = 'translate(' + moveX + 'px, ' + moveY + 'px)';
                    });

                    var waveformGroup = section.querySelector('.cafemadan-signature-section__waveform-group');
                    if (waveformGroup) {
                        var waveX = deltaX * 3;
                        var waveY = deltaY * 2;
                        waveformGroup.style.transform = 'translate(' + waveX + 'px, ' + waveY + 'px)';
                    }

                    var origin = section.querySelector('.cafemadan-signature-section__origin');
                    var originRing = section.querySelector('.cafemadan-signature-section__origin-ring');
                    if (origin) {
                        var ox = deltaX * 2;
                        var oy = deltaY * 1.5;
                        origin.style.transform = 'translate(' + ox + 'px, ' + oy + 'px)';
                    }
                    if (originRing) {
                        var orx = deltaX * 2;
                        var ory = deltaY * 1.5;
                        originRing.style.transform = 'translate(' + orx + 'px, ' + ory + 'px)';
                    }

                    ticking = false;
                });
            });

            visual.addEventListener('mouseleave', function () {
                layers.forEach(function (layer) {
                    layer.style.transform = 'translate(0, 0)';
                });
                var waveformGroup = section.querySelector('.cafemadan-signature-section__waveform-group');
                if (waveformGroup) waveformGroup.style.transform = 'translate(0, 0)';
                var origin = section.querySelector('.cafemadan-signature-section__origin');
                if (origin) origin.style.transform = 'translate(0, 0)';
                var originRing = section.querySelector('.cafemadan-signature-section__origin-ring');
                if (originRing) originRing.style.transform = 'translate(0, 0)';
            });

            window.addEventListener('resize', function () {
                containerRect = null;
            });
        }

        // --- Listen Button Interaction ---
        if (listenBtn) {
            listenBtn.addEventListener('click', function (e) {
                e.preventDefault();
                var isActive = visual.classList.contains('is-active');

                if (isActive) {
                    visual.classList.remove('is-active');
                    listenBtn.classList.remove('is-active');
                } else {
                    document.querySelectorAll('.cafemadan-signature-section__visual.is-active')
                        .forEach(function (el) { el.classList.remove('is-active'); });
                    document.querySelectorAll('.cafemadan-signature-section__primary.is-active')
                        .forEach(function (el) { el.classList.remove('is-active'); });

                    visual.classList.add('is-active');
                    listenBtn.classList.add('is-active');
                }
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();