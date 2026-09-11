(function () {
    'use strict';
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var nav = document.querySelector('.navbar');
    var backToTop = document.querySelector('.back-to-top');
    function updateScroll() {
        if (nav) nav.classList.toggle('shadow-sm', window.scrollY > 20);
        if (backToTop) backToTop.style.display = window.scrollY > 300 ? 'flex' : 'none';
    }
    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();
    if (backToTop) backToTop.addEventListener('click', function (event) {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
        var firstLink = document.querySelector('.navbar-brand');
        if (firstLink) firstLink.focus({ preventScroll: true });
    });
    document.querySelectorAll('.enquiry-form').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            if (!form.reportValidity()) return;
            var lines = ['Hello Al Medan, I would like to enquire about driving lessons.'];
            form.querySelectorAll('input, textarea, select').forEach(function (field) {
                var label = form.querySelector('label[for="' + field.id + '"]');
                if (field.value.trim()) lines.push((label ? label.textContent : field.id) + ': ' + field.value.trim());
            });
            window.location.assign('https://wa.me/96550554492?text=' + encodeURIComponent(lines.join('\n')));
        });
    });
    if (window.jQuery && window.jQuery.fn.owlCarousel) {
        window.jQuery('.testimonial-carousel').owlCarousel({ autoplay: false, smartSpeed: reducedMotion ? 0 : 400, items: 1, dots: true, loop: false });
    }
})();
