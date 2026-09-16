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
            window.location.assign('https://wa.me/96560966155?text=' + encodeURIComponent(lines.join('\n')));
        });
    });
    function initializeReviewCarousel(carousel) {
        if (window.jQuery && window.jQuery.fn.owlCarousel) {
            window.jQuery(carousel).owlCarousel({ autoplay: false, smartSpeed: reducedMotion ? 0 : 400, items: 1, dots: true, loop: false });
        }
    }

    function createReviewItem(review) {
        var item = document.createElement('article');
        item.className = 'testimonial-item review-card text-center';

        var quote = document.createElement('i');
        quote.className = 'fa fa-quote-left fa-2x text-primary mb-3';
        quote.setAttribute('aria-hidden', 'true');

        var stars = document.createElement('div');
        stars.className = 'review-stars mb-3';
        var rating = Math.max(1, Math.min(5, Number(review.rating) || 5));
        stars.textContent = '★'.repeat(rating) + '☆'.repeat(5 - rating);
        stars.setAttribute('aria-label', rating + ' out of 5 stars');

        var message = document.createElement('p');
        message.className = 'fs-4';
        message.textContent = review.review || '';

        var divider = document.createElement('hr');
        divider.className = 'w-25 mx-auto';

        var name = document.createElement('h5');
        name.textContent = review.name || 'Al Medan student';

        item.append(quote, stars, message, divider, name);
        return item;
    }

    document.querySelectorAll('.testimonial-carousel').forEach(function (carousel) {
        var source = carousel.getAttribute('data-reviews-src');
        if (!source) {
            initializeReviewCarousel(carousel);
            return;
        }

        fetch(source)
            .then(function (response) {
                if (!response.ok) throw new Error('Could not load reviews');
                return response.json();
            })
            .then(function (reviews) {
                carousel.replaceChildren();
                reviews.forEach(function (review) {
                    carousel.appendChild(createReviewItem(review));
                });
                if (reviews.length) initializeReviewCarousel(carousel);
                else carousel.textContent = 'No reviews have been published yet.';
            })
            .catch(function () {
                carousel.textContent = 'Reviews could not be loaded right now.';
            });
    });
})();
