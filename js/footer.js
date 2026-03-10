document.addEventListener("DOMContentLoaded", function() {
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
});