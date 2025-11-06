document.addEventListener("DOMContentLoaded", function() {
    const HTPmodal = document.querySelector('.howToPlay__modal');
    const howToPlay__icon = document.querySelector('.howToPlay_icon');

    howToPlay__icon.addEventListener("click", () => {
        HTPmodal.showModal();
        HTPmodal.addEventListener('click', function (e) {
            if (e.target === HTPmodal) {
                HTPmodal.close();
            }
        });
    });

    const howToPlay_close = document.querySelector('.howToPlay__close');
    howToPlay_close.addEventListener("click", () => {
        HTPmodal.close();
        HTPmodal.removeEventListener('click', function (e) {
            if (e.target === HTPmodal) {
                HTPmodal.close();
            }
        });
    });

        
    const statsModal = document.querySelector('.stats__modal');
    const stats__icon = document.querySelector('#stats');

    stats__icon.addEventListener("click", () => {
        setupStatsModal();
        statsModal.showModal();
        statsModal.addEventListener('click', function (e) {
            if (e.target === statsModal) {
                statsModal.close();
            }
        });
    });

    const stats_close = document.querySelector('.stats__close');
    stats_close.addEventListener("click", () => {
        statsModal.close();
        statsModal.removeEventListener('click', function (e) {
            if (e.target === statsModal) {
                statsModal.close();
            }
        });
    });

    initialiseStats()

    // const stats = JSON.parse(localStorage.getItem('stats_5words'));
    // stats.played += 1;
});

initialiseStats  = () =>  {
    const stats = JSON.parse(localStorage.getItem('stats_5words'));
    if (!stats) {
        localStorage.setItem('stats_5words',
            JSON.stringify({
                played: 0,
                wins: 0,
                currentStreak: 0,
                min_checks: 0,
                bestStreak: 0
            })
        );
    };
};


setupStatsModal = () =>  {
    const stats = JSON.parse(localStorage.getItem('stats_5words'));

    const played = document.querySelector('.played');
    played.innerHTML = stats.played;
    const completed = document.querySelector('.completed');
    completed.innerHTML = stats.wins;
    const currentStreak = document.querySelector('.current_streak');
    currentStreak.innerHTML = stats.currentStreak;
    const min_checks = document.querySelector('.checks');
    min_checks.innerHTML = stats.min_checks;
    const best_streak = document.querySelector('.best_streak');
    best_streak.innerHTML = stats.bestStreak;

    const stats_delete = document.querySelector('.stats_delete');

    stats_delete.addEventListener("click", () => {
        localStorage.removeItem('stats_5words');
        initialiseStats();
        setupStatsModal();
    }, { once: true });
};

statsGameComplete = () => {
    statsAddWin();
    statsAddStreak();
    statsBestChecks();
    statsBeststreak();
}

statsAddGames = () => {
    const stats = JSON.parse(localStorage.getItem('stats_5words'));
    stats.played +=1;
    localStorage.setItem('stats_5words', JSON.stringify(stats));
}

statsAddWin = () => {
    const stats = JSON.parse(localStorage.getItem('stats_5words'));
    stats.wins +=1;
    localStorage.setItem('stats_5words', JSON.stringify(stats));
}

statsAddStreak = () => {
    const stats = JSON.parse(localStorage.getItem('stats_5words'));
    stats.currentStreak +=1;
    localStorage.setItem('stats_5words', JSON.stringify(stats));
}

statsBestChecks = () => {
    const stats = JSON.parse(localStorage.getItem('stats_5words'));
    const checks = parseInt(document.querySelector('.counter__count').innerHTML);
    console.log("checks: ", checks)
    if (stats.min_checks > checks) {
        stats.min_checks = checks;
    };
    localStorage.setItem('stats_5words', JSON.stringify(stats));
}

statsBeststreak = () => {
    const stats = JSON.parse(localStorage.getItem('stats_5words'));
    if (stats.currentStreak >  stats.bestStreak) {
        stats.bestStreak = stats.currentStreak;
    };
    localStorage.setItem('stats_5words', JSON.stringify(stats));
}