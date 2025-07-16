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
//start new game event listener
newGame.addEventListener("click", () => {
    toggle('mainMenu','letterSection');
    populateLetters();
});

// const howToPlay = document.getElementById('howToPlay');
// howToPlay.addEventListener("click", () => toggle('mainMenu','team-selection'));

//hide and show pages depending on what page you go to
toggle = (current,newpage) => {
    let current_ = document.getElementById(current);
    current_.classList.add('hide'); //add a class to the element
    let newpage_ = document.getElementById(newpage);
    newpage_.classList.remove('hide');
}

//choose words and shuffle, then draw to screen
populateLetters = () => {
    for (let i = 0; i < 5; i++) {
        let num = Math.floor(Math.random() * words.length);
        chosenWords.push(words[num]);
        words.splice(num, 1); //remove chosen word from words array, so no duplicates
    }
    console.log('chosenWords: ',chosenWords);
    let joinedWords = chosenWords.join('').toUpperCase();
    let shuffledWords = shuffle(joinedWords);
    updateHTML(shuffledWords);
}

//shuffle all letters to randomise order
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

//add chosen letters to board and add event listener for clicks
updateHTML = (letters) => {
    for (let i=0; i < 25; i++) {
        let letterHtml = document.getElementById(`letter_${i+1}`);
        letterHtml.innerHTML = letters[i];
    }
    let letterBoxes = document.getElementById('letter_container');
    letterBoxes.addEventListener("click", (event) => swapLetters(event));
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
        let buffer = lastSelect.innerHTML;
        lastSelect.innerHTML = firstSelect.innerHTML;
        firstSelect.innerHTML = buffer;
        //remove selected classes
        firstSelect.classList.remove('selected');
        setTimeout(() => {
            lastSelect.classList.remove('selected');
        }, 150);
    }
}

//add border classes if the swap contains special classes
swapLettersClasses = (obj, className) => {
    if (obj.classList.contains(className)) {
        obj.classList.remove(className);
        obj.classList.add(className + 'Border');
    }
}

//event listener for check button
let elementsArray = document.querySelectorAll(".check");

//cycle through each letter and check them
elementsArray.forEach(function(elem) {
    elem.addEventListener("click", function() {
        check();
    });
});


//check for correct, correct row then correct column
check = () => {
    checkArray = [];
    console.log(chosenWords)

    //remove all now redundant border classes
    let classes = ['correctBorder', 'correctRowBorder', 'correctColBorder'];
    classes.forEach(borderClassName => {
        document.querySelectorAll(`.${borderClassName}`).forEach(el => el.classList.remove(borderClassName));
    });

    //check letter and row
    chosenWords.forEach((word, index) => {
        checkRow(word.toUpperCase(), index);
    });
    //check column
    checkCol();

    //update counter and counter image
    counter++;
    document.querySelector('#counter').innerHTML = counter;
    let checkImg = document.querySelector('#checkImg');
    let imgName = `./assets/hex_${6 - counter}.png`;
    checkImg.src = imgName
}

checkRow = (word, index) => {
    let row = document.getElementById('row_' + (index + 1)).children;
    let tempWord = word;
    let tempword2;
    //check for correct letters
    console.log('check for correct letter')
    for (let i = 0; i < 5; i++) {
        if (row[i].innerHTML === tempWord[i]) {
            row[i].classList.add('correct');
            tempword2 = tempWord.split('');
            tempword2[i] = " ";
            tempWord = tempword2.join('');
        }
    }
    //check for correct row, but wrong column
    console.log('check for correct row')
    for (let i = 0; i < 5; i++) {
        if (row[i].innerHTML !== tempWord[i] && tempWord.includes(row[i].innerHTML) && !row[i].classList.contains('correct')) {
            row[i].classList.add('correctRow');
            tempword2 = JSON.parse(JSON.stringify(tempWord.replace(row[i].innerHTML," ")));
            tempWord = JSON.parse(JSON.stringify(tempword2));
        }
    }
    checkArray.push(tempWord);
    console.log(checkArray)
}

//check for correct column, but incorrect row
checkCol = () => {
    //check each column
    console.log('check for correct column')
    for (let i = 0; i < 5; i++) {
        for (let j = (i+1); j < 26; j+=5) {
            let letter = document.querySelector(`#letter_${j}`);
            if (!letter.classList.contains('correct') &&
            !letter.classList.contains('correctRow')) {
                for (let k = 0; k < checkArray[i].length; k++) {
                    if (checkArray[k][i].toUpperCase() === letter.innerHTML) {
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
    console.log(checkArray)
}
