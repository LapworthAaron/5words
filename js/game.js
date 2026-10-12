const word_file = "./assets/5_WORDS.json";
// let words = [];
let chosenWords = [];
let counter = 0;
let checkArray = [];
let currentGame = 0;
let latestGame = 0;
let liveGame = 0;
let counterEl = null;
let checkBtn = null;

//archive mode plays a past puzzle. It keeps its own saved board so it can't
//clobber today's game, and it never touches the daily streak or played/wins.
let archiveMode = false;
let archiveId = 0;

//which localStorage slot this board lives in
const boardKey = () => archiveMode ? `board_5words_archive_${archiveId}` : 'board_5words';

// getData(word_file);
document.addEventListener("DOMContentLoaded", async () => {
    counterEl = document.querySelector('.counter__count');
    checkBtn = document.querySelector(".check");

    archiveMode = document.body.dataset.gameMode === 'archive';
    const started = archiveMode ? await startArchiveGame() : await startDailyGame();
    if (!started) {
        return;
    }

    //event listener for check button
    checkBtn.addEventListener("click", handleCheck);
});

//today's puzzle - resume the saved board if it's still today's, otherwise deal a new one
const startDailyGame = async () => {
    const daily = await dailyWords();
    if (!daily) {
        showGameError("We couldn't load today's puzzle. Please try again shortly.");
        return false;
    }
    latestGame = daily.gameId;

    //if statement to load complete board from local storage or populateletters if not
    const boardArray = JSON.parse(localStorage.getItem(boardKey()));
    if (boardArray) {
        if (boardArray.id === latestGame) {
            loadGameBoard();
            currentGame = boardArray.id ? boardArray.id : 0;
            liveGame = currentGame;
            document.querySelector(".share__container").classList.remove("share__show");
        } else {
            liveGame = latestGame;
            populateLetters(daily);
            //check if didn't complete yesterdays game
            if (boardArray.complete === "n") {
                statsStreakOver();
            }
        }
        if (boardArray.complete === "y") {
            //disable letters
            //disable check button
        }
    } else {
        liveGame = latestGame;
        populateLetters(daily);
    }
    return true;
}

//a past puzzle, chosen from the archive via ?game=<id>
const startArchiveGame = async () => {
    archiveId = parseInt(new URLSearchParams(window.location.search).get('game'), 10);
    if (!Number.isInteger(archiveId) || archiveId < 1) {
        showGameError("That puzzle number isn't valid. Pick one from the archive.");
        return false;
    }

    const game = await archiveWords(archiveId);
    if (!game) {
        showGameError(`We couldn't find puzzle #${archiveId}. It may not exist yet.`);
        return false;
    }

    latestGame = game.gameId;
    liveGame = game.gameId;
    archiveSetHeading(game);

    const boardArray = JSON.parse(localStorage.getItem(boardKey()));
    if (boardArray && boardArray.id === game.gameId) {
        loadGameBoard();
        currentGame = boardArray.id;
        document.querySelector(".share__container").classList.remove("share__show");
    } else {
        populateLetters(game);
    }
    return true;
}

//put the puzzle number and date above the board, and tell share.js what to call it
const archiveSetHeading = (game) => {
    const heading = document.querySelector('.archive-game__heading');
    if (heading) {
        heading.textContent = `Puzzle #${game.gameId}`;
    }
    const dateEl = document.querySelector('.archive-game__date');
    if (dateEl && game.gameDate) {
        const d = new Date(game.gameDate + 'T00:00:00Z');
        dateEl.textContent = d.toLocaleDateString('en-GB', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
        });
        dateEl.setAttribute('datetime', game.gameDate);
    }
    window.shareLabel = `5WORDS puzzle #${game.gameId}`;
    window.shareUrl = `https://5words.co.uk/archive-game?game=${game.gameId}`;
}

const showGameError = (message) => {
    const target = document.querySelector('.game-error');
    if (target) {
        target.textContent = message;
        target.classList.add('game-error--show');
    }
    if (checkBtn) {
        checkBtn.disabled = true;
    }
}

//non api based random words game - practice mode?
// console.log(chosenWords)
// for (let i = 0; i < 5; i++) {
//     let num = Math.floor(Math.random() * words.length);
//     chosenWords.push(words[num]);
//     words.splice(num, 1); //remove chosen word from words array, so no duplicates
// }

handleCheck = () => {
  check(true);
}


//choose words and shuffle, then draw to screen
populateLetters = async(daily) => {
    chosenWords = daily.words;
    updateHTML(daily.shuffled.toUpperCase());
    saveGameBoard("n");
    //past puzzles don't count towards games played
    if (!archiveMode) {
        statsAddGames();
    }
}

//shape a row from the api into the object the game works with
const mapGameRow = (row) => ({
    gameId: row.game_id,
    gameDate: row.game_date,
    words: [
        row.word_1,
        row.word_2,
        row.word_3,
        row.word_4,
        row.word_5
    ],
    shuffled: row.shuffle_words
});

//api call
const dailyWords = async () => {
    try {
        const response = await fetch('https://5words.co.uk/api/get_daily_words.php');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return mapGameRow(data[0]);
    } catch (error) {
        console.error('Error fetching daily words:', error);
        return null;
    }
};

//api call for a single past puzzle
const archiveWords = async (id) => {
    try {
        const response = await fetch(`https://5words.co.uk/api/get_game.php?game_id=${encodeURIComponent(id)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        if (!Array.isArray(data) || !data.length) {
            return null;
        }
        return mapGameRow(data[0]);
    } catch (error) {
        console.error('Error fetching archive words:', error);
        return null;
    }
};

//click event for clicking on letters
const letterHandler = (event) => swapLetters(event);
initialiseLetterClick = () => {
    document.getElementById('letter_container').addEventListener("click",letterHandler);
}

//add chosen letters to board and add event listener for clicks
updateHTML = (letters) => {
    for (let i=0; i < 25; i++) {
        let letterHtml = document.getElementById(`letter_${i+1}`);
        letterHtml.textContent = letters[i];
    }
    initialiseLetterClick();
}

//swap letters
swapLetters = (event) => {
    let firstSelect = document.querySelector('.selected');
    let lastSelect = document.getElementById(event.target.id);
    if (!lastSelect.classList.contains('letter_box')) {
        return;
    }
    if (firstSelect === lastSelect) {
        lastSelect.classList.remove('selected');
        return;
    }
    if (event.target.id.match(/letter_.*/)) {
        lastSelect.classList.add('selected');
    }
    if (firstSelect && lastSelect !== firstSelect) {
        //swap classes
        let firstClasses = firstSelect.classList.value;
        let lastClasses = lastSelect.classList.value;
        lastSelect.classList.value = firstClasses;
        firstSelect.classList.value = lastClasses;
        //add border classes if applicable
        swapLettersClasses(lastSelect, 'correct');
        swapLettersClasses(lastSelect, 'correctRow');
        swapLettersClasses(lastSelect, 'correctCol');
        swapLettersClasses(firstSelect, 'correct');
        swapLettersClasses(firstSelect, 'correctRow');
        swapLettersClasses(firstSelect, 'correctCol');
        //swap text values
        let buffer = lastSelect.textContent;
        lastSelect.textContent = firstSelect.textContent;
        firstSelect.textContent = buffer;
        //remove selected classes
        firstSelect.classList.remove('selected');
        setTimeout(() => {
            lastSelect.classList.remove('selected');
        }, 150);
    }
    //save board status
    saveGameBoard("n");
}

//add border classes if the swap contains special classes
swapLettersClasses = (obj, className) => {
    if (obj.classList.contains(className)) {
        obj.classList.remove(className);
        obj.classList.add(className + 'Border');
    }
}

//check for correct, correct row then correct column
check = (counter) => {
    //update counter if counter is true
    if (counter) {
        let count = counterEl.textContent;
        counterEl.textContent = Number(count) + 1;
    }

    checkArray = [];
    //console.log(chosenWords)

    //remove all now redundant border classes
    let classes = ['correctBorder', 'correctRowBorder', 'correctColBorder'];
    classes.forEach(borderClassName => {
        document.querySelectorAll(`.${borderClassName}`).forEach(el => el.classList.remove(borderClassName));
    });

    //check letter and row
    chosenWords.forEach((word, index) => {
        checkRow(word.toUpperCase(), index);
    });
    //validate win
    let win = checkWin();

    if (!win) {
        //check column
        checkCol();
        //save board status
        saveGameBoard("n");
    }
}

//check if the game is won
checkWin = () => {
    let correctletters = 0;
    for (let i = 0; i < 5; i++) {
        let row = document.getElementById('row_' + (i + 1)).children;
        for (let i of row) {
            if (i.classList.contains('correct')) {
                correctletters += 1;
            }
        }
    }
    
    if (correctletters === 25) {
        //add win to stats - past puzzles are kept out of the daily streak
        if (archiveMode) {
            archiveMarkComplete(archiveId);
        } else {
            statsGameComplete();
        }
        //save board status
        saveGameBoard("y");
        //load modal
        let checks = parseInt(counterEl.textContent);
        generateImageWithNumber(checks);
        const statsModal = document.querySelector('.stats__modal');
        setupStatsModal();
        statsModal.showModal();
        statsModal.querySelector(".share__container").classList.add("share__show");
        document.getElementById('letter_container').removeEventListener("click", letterHandler);
        checkBtn.removeEventListener("click", handleCheck);
        //disable letters
        //disable check button
        return true;
    };
    return false;
}

//check if the letters are in the correct row
checkRow = (word, index) => {
    let row = document.getElementById('row_' + (index + 1)).children;
    let tempWord = word;
    let tempword2;
    //check for correct letters
    //console.log('check for correct letter')
    for (let i = 0; i < 5; i++) {
        if (row[i].textContent === tempWord[i]) {
            row[i].classList.add('correct');
            tempword2 = tempWord.split('');
            tempword2[i] = " ";
            tempWord = tempword2.join('');
        }
    }
    //check for correct row, but wrong column
    //console.log('check for correct row')
    for (let i = 0; i < 5; i++) {
        if (row[i].textContent !== tempWord[i] && tempWord.includes(row[i].textContent) && !row[i].classList.contains('correct')) {
            row[i].classList.add('correctRow');
            tempWord = tempWord.replace(row[i].textContent, " ");

        }
    }
    checkArray.push(tempWord);
    //console.log(checkArray);
}

//check for correct column, but incorrect row
checkCol = () => {
    //check each column
    //console.log('check for correct column')
    for (let i = 0; i < 5; i++) {
        for (let j = (i+1); j < 26; j+=5) {
            let letter = document.querySelector(`#letter_${j}`);
            if (!letter.classList.contains('correct') &&
            !letter.classList.contains('correctRow')) {
                for (let k = 0; k < checkArray[i].length; k++) {
                    if (checkArray[k][i].toUpperCase() === letter.textContent) {
                        letter.classList.add('correctCol');
                        let str = checkArray[k];               // a string
                        let charArray = str.split('');             // convert to array of characters
                        charArray[i] = ' ';                        // modify
                        checkArray[k] = charArray.join('');    // reassign the modified string
                        break;
                    }
                }
            }   
        }
    }
    //console.log(checkArray)
}

//store game board so it doesn't reset each load
saveGameBoard = (completeGame) => {
    let boardArray = document.getElementById('letterSection').innerHTML;
    localStorage.setItem(boardKey(),
        JSON.stringify({
            id: liveGame,
            date: new Date().toJSON().slice(0, 10),
            board: boardArray,
            counter: counterEl.textContent,
            words: chosenWords,
            complete: completeGame
        })
    );
}

//load game board so it doesn't reset each load
loadGameBoard = () => {
    const boardArray = JSON.parse(localStorage.getItem(boardKey()));
    document.getElementById('letterSection').innerHTML = boardArray.board;
    chosenWords = boardArray.words;
    counterEl.textContent = boardArray.counter;
    initialiseLetterClick();
}

//remember which past puzzles have been solved, so the archive list can tick them off
const archiveCompletedIds = () => {
    try {
        const raw = JSON.parse(localStorage.getItem('archive_5words_done'));
        return Array.isArray(raw) ? raw : [];
    } catch (e) {
        return [];
    }
}

const archiveMarkComplete = (id) => {
    const done = archiveCompletedIds();
    if (!done.includes(id)) {
        done.push(id);
        localStorage.setItem('archive_5words_done', JSON.stringify(done));
    }
}

