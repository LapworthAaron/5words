const word_file = "./assets/5_WORDS.json";
// let words = [];
let chosenWords = [];
let counter = 0;
let checkArray = [];

// getData(word_file);
document.addEventListener("DOMContentLoaded", function() {
  populateLetters();
});


//choose words and shuffle, then draw to screen
populateLetters = async() => {
    const { words: api_words, shuffled: api_shuffle } = await callapi();
    chosenWords = api_words;
    // console.log(chosenWords)
    // for (let i = 0; i < 5; i++) {
    //     let num = Math.floor(Math.random() * words.length);
    //     chosenWords.push(words[num]);
    //     words.splice(num, 1); //remove chosen word from words array, so no duplicates
    // }
    //console.log('chosenWords: ', chosenWords);
    updateHTML(api_shuffle);
}

 //call the api to get the days 5 words
callapi = async() => {
    try {
        const response = await fetch('https://5words.co.uk/api/get_daily_words.php');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json(); // or response.text() if it's not JSON
        return { words: [data[0].word_1, data[0].word_2, data[0].word_3, data[0].word_4, data[0].word_5], shuffled: data[0].shuffle_words};
    } catch (error) {
        console.error('Error fetching daily words:', error);
    } 
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
    //validate win
    checkWin();
    //check column
    checkCol();

    //update counter and counter image
    counter++;
    document.querySelector('.counter__count').innerHTML = counter;
    //let checkImg = document.querySelector('#checkImg');
    // let imgName = `./assets/hex_${6 - counter}.png`;
    // checkImg.src = imgName
}

checkWin = () => {
    let correctWords = 0;
    for (let i = 0; i < 5; i++) {
        let row = document.getElementById('row_' + (i + 1)).children;
        if (row[i].classList.contains('correct')) {
            correctWords += 1;
        }
    }
    console.log("correct words: ",correctWords)

    if (correctWords === 5) {
        console.log("complete");
    }
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
    console.log(checkArray);
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
