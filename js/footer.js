document.addEventListener("DOMContentLoaded", function() {
    document.documentElement.style.setProperty(
        '--scrollbar-width',
        (window.innerWidth - document.documentElement.clientWidth) + 'px'
    );

    const privacy_modal = document.querySelector('.privacy__modal');
    const privacy_links = document.querySelectorAll('.privacy-link');

    privacy_modal.addEventListener('click', function (e) {
        if (e.target === privacy_modal) {
            privacy_modal.close();
        }
    });

    privacy_links.forEach(link => {
        link.addEventListener("click", () => {
            privacy_modal.showModal();
        });
    });

    const privacy_close = document.querySelector('.privacy__close');
    privacy_close.addEventListener("click", () => {
        privacy_modal.close();
    });

    // Terms of Service modal
    const terms_modal = document.querySelector('.terms__modal');
    const terms_links = document.querySelectorAll('.terms-link');

    terms_modal.addEventListener('click', function (e) {
        if (e.target === terms_modal) {
            terms_modal.close();
        }
    });

    terms_links.forEach(link => {
        link.addEventListener("click", () => {
            terms_modal.showModal();
        });
    });

    const terms_close = document.querySelector('.terms__close');
    terms_close.addEventListener("click", () => {
        terms_modal.close();
    });

    // About modal
    const about_modal = document.querySelector('.about__modal');
    const about_links = document.querySelectorAll('.about-link');

    about_modal.addEventListener('click', function (e) {
        if (e.target === about_modal) {
            about_modal.close();
        }
    });

    about_links.forEach(link => {
        link.addEventListener("click", () => {
            about_modal.showModal();
        });
    });

    const about_close = document.querySelector('.about__close');
    about_close.addEventListener("click", () => {
        about_modal.close();
    });
});