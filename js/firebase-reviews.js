import { firebaseConfig } from './firebase-config.js';

const carousel = document.querySelector('.testimonial-carousel');
const form = document.querySelector('.review-form');
const status = form.querySelector('[data-review-status]');
const button = form.querySelector('button[type="submit"]');
const summary = document.querySelector('[data-rating-summary]');
let store;
let sdk;
let reviews = [];
let ready = false;
button.disabled = true;

function render() {
    if (window.jQuery(carousel).hasClass('owl-loaded')) {
        window.jQuery(carousel).trigger('destroy.owl.carousel');
    }
    carousel.replaceChildren();
    for (const review of reviews) {
        const card = document.createElement('article');
        card.className = 'testimonial-item review-card text-center';
        const stars = document.createElement('div');
        stars.className = 'review-stars mb-3';
        const rating = Math.max(1, Math.min(5, Math.round(Number(review.rating) || 1)));
        stars.textContent = '★'.repeat(rating) + '☆'.repeat(5 - rating);
        stars.setAttribute('aria-label', `${rating} out of 5 stars`);
        const message = document.createElement('p');
        message.className = 'fs-4';
        message.textContent = review.review;
        const name = document.createElement('h5');
        name.textContent = review.name;
        card.append(stars, message, name);
        carousel.append(card);
    }
    summary.textContent = reviews.length
        ? `${(reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length).toFixed(1)} / 5 · ${reviews.length} displayed reviews`
        : '';
    if (!reviews.length) carousel.textContent = 'Be the first to leave a review.';
    if (reviews.length && window.jQuery.fn.owlCarousel) {
        window.jQuery(carousel).owlCarousel({ items: 1, dots: true, loop: false, autoplay: false,
            smartSpeed: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 400 });
    } else carousel.style.display = 'block';
}

async function start() {
    const configured = firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId;
    try {
        const response = await fetch(carousel.dataset.reviewsSrc);
        if (!response.ok) throw new Error('Existing reviews unavailable');
        reviews = await response.json();
        render();
    } catch {
        carousel.textContent = 'Existing reviews could not be loaded.';
        carousel.style.display = 'block';
    }
    if (!configured) {
        status.textContent = 'Review submissions are not available yet. Please try again later.';
        return;
    }
    try {
        const [appSdk, firestoreSdk] = await Promise.all([
            import('https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js'),
            import('https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js')
        ]);
        sdk = firestoreSdk;
        store = sdk.getFirestore(appSdk.initializeApp(firebaseConfig));
        const snapshot = await sdk.getDocs(sdk.query(sdk.collection(store, 'reviews'),
            sdk.orderBy('createdAt', 'desc'), sdk.limit(100)));
        reviews = [...snapshot.docs.map(doc => doc.data()), ...reviews];
        render();
        ready = true;
        button.disabled = false;
        status.textContent = '';
    } catch (error) {
        console.error('Firebase reviews initialization failed:', error.code || error.message);
        status.textContent = 'Online reviews are temporarily unavailable. Please try again later.';
    }
}

form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!ready || !form.reportValidity() || button.disabled) return;
    const fields = new FormData(form);
    if (fields.get('_gotcha')) return;
    const review = { name: fields.get('name').trim(), rating: Number(fields.get('rating')),
        review: fields.get('review').trim() };
    if (!review.name || !review.review || !Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5) {
        status.textContent = 'Please enter your name, review, and a rating from 1 to 5.';
        return;
    }
    button.disabled = true;
    status.textContent = 'Submitting your review…';
    try {
        await sdk.addDoc(sdk.collection(store, 'reviews'), { ...review, createdAt: sdk.serverTimestamp() });
        reviews.unshift(review);
        render();
        form.reset();
        status.textContent = 'Thank you. Your review is now published.';
    } catch (error) {
        console.error('Review submission failed:', error.code || error.message);
        status.textContent = 'Your review could not be saved. Please try again.';
    } finally {
        button.disabled = false;
    }
});

start();
