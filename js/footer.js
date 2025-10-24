document.addEventListener("DOMContentLoaded", function() {
    const privacy_modal = document.querySelector('.privacy__modal');
    const privacy_link = document.querySelector('#privacy');

    privacy_link.addEventListener("click", () => {
        privacy_modal.showModal();
        privacy_modal.addEventListener('click', function (e) {
            if (e.target === privacy_modal) {
                privacy_modal.close();
            }
        });
    });

    const privacy_close = document.querySelector('.privacy__close');
    privacy_close.addEventListener("click", () => {
        privacy_modal.close();
        privacy_modal.removeEventListener('click', function (e) {
            if (e.target === privacy_modal) {
                privacy_modal.close();
            }
        });
    });
});