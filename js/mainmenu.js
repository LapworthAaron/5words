document.addEventListener("DOMContentLoaded", function() {
    const modal = document.querySelector('.howToPlay__modal');
    const howToPlay = document.getElementById('howToPlay');
    howToPlay.addEventListener("click", () => {
        modal.showModal();
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                modal.close();
            }
        });
    });

    const howToPlay_close = document.querySelector('.howToPlay__close');
    howToPlay_close.addEventListener("click", () => {
        modal.close();
        modal.removeEventListener('click', function (e) {
            if (e.target === modal) {
                modal.close();
            }
        });
    });

});
