/****************************************/
/* Archive index - list every past game */
/****************************************/

//one puzzle per day, so a puzzle's date is just today's date minus the id difference.
//we anchor off whatever the api reports as today rather than a hardcoded epoch,
//so this stays correct even if the run ever shifts.
const archiveDateFor = (id, latestId, latestDate) => {
    const anchor = Date.parse(latestDate + 'T00:00:00Z');
    return new Date(anchor - (latestId - id) * 86400000);
};

const archiveDoneIds = () => {
    try {
        const raw = JSON.parse(localStorage.getItem('archive_5words_done'));
        return Array.isArray(raw) ? raw.map(Number) : [];
    } catch (e) {
        return [];
    }
};

const archiveMonthLabel = (d) => d.toLocaleDateString('en-GB', {
    month: 'long', year: 'numeric', timeZone: 'UTC'
});

const archiveFullLabel = (d) => d.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
});

const buildArchive = (latestId, latestDate) => {
    const list = document.querySelector('.archive__months');
    const done = archiveDoneIds();

    //newest first - today's puzzle lives on /todays-game, so the archive stops at latestId - 1
    const months = new Map();
    for (let id = latestId - 1; id >= 1; id--) {
        const d = archiveDateFor(id, latestId, latestDate);
        const key = d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0');
        if (!months.has(key)) {
            months.set(key, { label: archiveMonthLabel(d), items: [] });
        }
        months.get(key).items.push({ id, date: d });
    }

    const fragment = document.createDocumentFragment();
    months.forEach((month) => {
        const section = document.createElement('section');
        section.className = 'archive-month';

        const heading = document.createElement('h2');
        heading.className = 'archive-month__heading';
        heading.textContent = month.label;
        section.appendChild(heading);

        const grid = document.createElement('ul');
        grid.className = 'archive-month__grid';

        month.items.forEach((item) => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.className = 'archive-tile' + (done.includes(item.id) ? ' archive-tile--done' : '');
            a.href = `/archive-game?game=${item.id}`;
            a.setAttribute('aria-label',
                `Puzzle number ${item.id}, ${archiveFullLabel(item.date)}` +
                (done.includes(item.id) ? ', completed' : ''));

            const day = document.createElement('span');
            day.className = 'archive-tile__day';
            day.textContent = item.date.getUTCDate();

            const num = document.createElement('span');
            num.className = 'archive-tile__num';
            num.textContent = '#' + item.id;

            a.appendChild(day);
            a.appendChild(num);
            li.appendChild(a);
            grid.appendChild(li);
        });

        section.appendChild(grid);
        fragment.appendChild(section);
    });

    list.innerHTML = '';
    list.appendChild(fragment);

    const count = document.querySelector('.archive__count');
    if (count) {
        const total = latestId - 1;
        count.textContent = `${total} past puzzle${total === 1 ? '' : 's'} to play` +
            (done.length ? ` — you've solved ${done.length}.` : '.');
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    const list = document.querySelector('.archive__months');
    if (!list) {
        return;
    }
    try {
        const response = await fetch('https://5words.co.uk/api/get_daily_words.php');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        buildArchive(parseInt(data[0].game_id, 10), data[0].game_date);
    } catch (error) {
        console.error('Error building archive:', error);
        list.innerHTML = '<p class="home-section__copy">We couldn\'t load the archive just now. Please try again shortly.</p>';
    }
});
