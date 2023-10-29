const word_file = "./assets/5_WORDS.json";
// let words = [];
let chosenWords = [];
let counter = 0;
let checkArray = [];

// async function getData(file) {
//     await fetch(file)
//         .then(response => {
//             return response.text();
//         })
//         .then(data => {
//             console.log(data);
//             console.log(data.length);
//             console.log(data[10]);
//             for (let i = 0; i < data.length; i++) {
//                 words.push(data[i].word);
//                 console.log(data[i].word)
//             };
//         })
//         .catch((error) => {
//             console.log(error);
//             console.log("5_WORDS.json fetch went wrong")
//         });  

// };

// getData(word_file);

const newGame = document.getElementById('newGame');
newGame.addEventListener("click", () => {
    toggle('mainMenu','letterSection');
    populateLetters();
});

// const howToPlay = document.getElementById('howToPlay');
// howToPlay.addEventListener("click", () => toggle('mainMenu','team-selection'));

toggle = (current,newpage) => {
    let current_ = document.getElementById(current);
    current_.classList.add('hide'); //add a class to the element
    let newpage_ = document.getElementById(newpage);
    newpage_.classList.remove('hide');
}

populateLetters = () => {
    for (let i = 0; i < 5; i++) {
        let num = Math.floor(Math.random() * words.length);
        chosenWords.push(words[num]);
        words.splice(num, 1);
    }
    console.log(chosenWords);
    var joinedWords = chosenWords.join('').toUpperCase();
    let shuffledWords = shuffle(joinedWords);
    updateHTML(shuffledWords);
}

shuffle = (allLetters) => {
    var a = allLetters.split(""),
        n = a.length;

    for(var i = n - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a.join("");
}

updateHTML = (letters) => {
    for (let i=0; i < 25; i++) {
        let letterHtml = document.getElementById(`letter_${i+1}`);
        letterHtml.innerHTML = letters[i];
    }
    let letterBoxes = document.getElementById('letter_container');
    letterBoxes.addEventListener("click", (event) => swapLetters(event));
}

swapLetters = (event) => {
    let oldSelected = document.querySelector('.selected');
    let selected = document.getElementById(event.target.id);
    if (!selected.classList.contains('letter_box')) {
        return;
    }
    if (oldSelected && selected !== oldSelected) {
        let oldClasses = oldSelected.classList.value;
        let selClasses = selected.classList.value;
        selected.classList.value = oldClasses;
        oldSelected.classList.value = selClasses;
        swapLettersClasses(selected, 'correct');
        swapLettersClasses(selected, 'correctRow');
        swapLettersClasses(selected, 'correctCol');
        swapLettersClasses(oldSelected, 'correct');
        swapLettersClasses(oldSelected, 'correctRow');
        swapLettersClasses(oldSelected, 'correctCol');
        let buffer = selected.innerHTML;
        selected.innerHTML = oldSelected.innerHTML;
        oldSelected.innerHTML = buffer;
        oldSelected.classList.remove('selected');
        setTimeout(() => {
            selected.classList.remove('selected');
        }, 150);
    } else if (oldSelected === selected) {
        selected.classList.remove('selected');
    } else if (event.target.id.match(/letter_.*/)) {
        selected.classList.add('selected');
    }
}

swapLettersClasses = (obj, className) => {
    if (obj.classList.contains(className)) {
        obj.classList.remove(className);
        obj.classList.add(className + 'Border');
    }
}

let elementsArray = document.querySelectorAll(".check");

elementsArray.forEach(function(elem) {
    elem.addEventListener("click", function() {
        check();
    });
});

check = () => {
    console.log(chosenWords)

    let cB = document.querySelectorAll('.correctBorder');
    cB.forEach(el => {
        el.classList.remove('correctBorder')
    })
    let cRB = document.querySelectorAll('.correctRowBorder');
    cRB.forEach(el => {
        el.classList.remove('correctRowBorder')
    })
    let cCB = document.querySelectorAll('.correctColBorder');
    cCB.forEach(el => {
        el.classList.remove('correctColBorder')
    })

    chosenWords.forEach((word, index) => {
        checkRow(word.toUpperCase(), index);
    });
    checkCol();

    counter++;
    console.log(counter)
    document.querySelector('#counter').innerHTML = counter;
}

checkRow = (word, index) => {
    let row = document.getElementById('row_' + (index + 1)).children;
    let tempWord = word;
    let tempword2;
    for (let i = 0; i < 5; i++) {
        if (row[i].innerHTML === tempWord[i]) {
            row[i].classList.add('correct');
            tempword2 = JSON.parse(JSON.stringify(tempWord.replace(row[i].innerHTML," ")));
            tempWord = JSON.parse(JSON.stringify(tempword2));
        }
    }
    for (let i = 0; i < 5; i++) {
        if (row[i].innerHTML !== tempWord[i] && tempWord.includes(row[i].innerHTML) && !row[i].classList.contains('correct')) {
            row[i].classList.add('correctRow');
            tempword2 = JSON.parse(JSON.stringify(tempWord.replace(row[i].innerHTML," ")));
            tempWord = JSON.parse(JSON.stringify(tempword2));
        }
    }
    checkArray.push(checkArray);
    console.log(checkArray)
}

checkCol = () => {
    //check each column
    for (let i = 0; i < 5; i++) {
        let lettersArray = []
        //populate column letters
        for (let j = 0; j < 5; j++) {
            lettersArray.push(chosenWords[j][i]);
        }
        console.log(lettersArray)
        for (let j = (i+1); j < 26; j+=5) {
            let letter = document.querySelector(`#letter_${j}`);
            if (letter.classList.contains('correct')) {
                for (let k = 0; k < lettersArray.length; k++) {
                    if (lettersArray[k].toUpperCase() === letter.innerHTML) {
                        lettersArray[k] = ' ';
                        break;
                    }
                }
            }
        }
        console.log("pre col: " + lettersArray)
        for (let j = (i+1); j < 26; j+=5) {
            let letter = document.querySelector(`#letter_${j}`);
            if (!letter.classList.contains('correct') &&
            !letter.classList.contains('correctBorder') &&
            !letter.classList.contains('correctRow') &&
            !letter.classList.contains('correctRowBorder')) {
                for (let k = 0; k < lettersArray.length; k++) {
                    console.log(lettersArray[k].toUpperCase() +" - " + letter.innerHTML);
                    if (lettersArray[k].toUpperCase() === letter.innerHTML) {
                        letter.classList.add('correctCol');
                        lettersArray[k] = ' ';
                        break;
                    }
                }
            }   
        }

    }
}