// SETTING UP FRONT PAGE
async function fetchData() {
    let response = await fetch('https://the-trivia-api.com/api/categories');
    // console.log(response);
    let data = await response.json()
    // console.log(data);
    return data;
}

async function displayCategories() {
    let category = document.getElementById('category');
    let loader = document.createElement('div');
    loader.className = 'loader'
    category.appendChild(loader);
    let categoriesObject = await fetchData();
    category.removeChild(loader)
    let categoryList = document.querySelector('#category');
    let categoryDefaultLabel = document.createElement('label');
    let categoryDefaultCheckbox = document.createElement('input');
    let categoryContainer = document.createElement('div');
    categoryContainer.className = 'categoryContainer';
    categoryDefaultCheckbox.setAttribute('type', 'checkbox');
    categoryDefaultCheckbox.setAttribute('id', 'categoryAll');
    categoryDefaultCheckbox.checked = true;
    categoryDefaultCheckbox.value = 'All';
    categoryDefaultCheckbox.className = 'categoryCheckbox';
    categoryDefaultLabel.setAttribute('for', 'categoryAll');
    categoryDefaultLabel.innerHTML += 'All';
    categoryContainer.appendChild(categoryDefaultLabel);
    categoryContainer.appendChild(categoryDefaultCheckbox);
    categoryList.appendChild(categoryContainer);

    Object.keys(categoriesObject).forEach(el => {
        let categoryLabel = document.createElement('label');
        let categoryCheckbox = document.createElement('input');
        let categoryContainer = document.createElement('div');
        categoryContainer.className = 'categoryContainer';
        categoryLabel.setAttribute('for', `category${el}`);
        categoryCheckbox.setAttribute('type', 'checkbox');
        categoryCheckbox.setAttribute('id', `category${el}`);
        categoryCheckbox.className = 'categoryCheckbox';
        categoryCheckbox.value = el;
        categoryLabel.innerHTML += el;
        categoryContainer.appendChild(categoryLabel);
        categoryContainer.appendChild(categoryCheckbox);
        categoryList.appendChild(categoryContainer);
    });
    addEventListenerToUnselectedCategoryCheckboxes();
}

displayCategories();

async function addEventListenerToUnselectedCategoryCheckboxes() {
    let categoryUnselectedCheckboxes = document.querySelectorAll('.categoryCheckbox');
    // console.log(categoryUnselectedCheckboxes);
    // console.log(el.value);
    categoryUnselectedCheckboxes.forEach((el) => {
        el.addEventListener('change', () => {
            if (el.value != 'All') {
                let categoryAllCheckbox = document.getElementById('categoryAll');
                categoryAllCheckbox.checked = false;
                let counterOfChecked = categoryUnselectedCheckboxes.length;
                categoryUnselectedCheckboxes.forEach((el) => {
                    if (el.checked === false) {
                        counterOfChecked--;
                    }
                })
                if (counterOfChecked === 0 && categoryAllCheckbox.checked !== true) {
                    categoryAllCheckbox.checked = true;
                }
            } else {
                let categoryAllCheckbox = document.getElementById('categoryAll');
                if (categoryAllCheckbox.checked === true) { // console.log('tu');
                    categoryUnselectedCheckboxes.forEach((el) => {
                        if (el.value != 'All') {
                            el.checked = false;
                        }
                    });
                } else {
                    let counterOfChecked = categoryUnselectedCheckboxes.length;
                    categoryUnselectedCheckboxes.forEach((el) => {
                        if (el.checked === false) {
                            counterOfChecked--;
                        }
                    })
                    if (counterOfChecked === 0 && categoryAllCheckbox.checked !== true) {
                        categoryAllCheckbox.checked = true;
                    }
                }
            }
        })
    })
}

// RETRIEVING QUESTIONS

async function getQuestions() {
    let [numberOfQuestions, chosenCategories, chosenDifficulty] = getUserInput();
    console.log(chosenDifficulty);
    let url = 'https://the-trivia-api.com/api/questions?categories='
    chosenCategories.forEach((el) => {
        url += el.value.replace(/&/g, 'and').replace(/\s/g, '_').toLowerCase() + ',';
    })
    url.length = url.length - 1;
    startLoader();
    let questionsArr = [];
    try {
        while (numberOfQuestions != questionsArr.length) {
            let questions;
            if (questionsArr.length + 20 <= numberOfQuestions) {
                let fetchUrl = `${url}&limit=20`
                if (chosenDifficulty != 'random') {
                    fetchUrl += `&difficulty=${chosenDifficulty}`
                }
                questions = await fetch(fetchUrl);
                questions = await questions.json();
                // console.log(questions);
            } else {
                let fetchUrl = `${url}&limit=${
                    numberOfQuestions - questionsArr.length
                }`
                if (chosenDifficulty != 'random') {
                    fetchUrl += `&difficulty=${chosenDifficulty}`
                }
                questions = await fetch(fetchUrl);
                questions = await questions.json();
            } questionsArr.push(... questions);
            // console.log(questionsArr);
            console.log(questionsArr.length);
            let repeatCounter = 0;
            for (let i = 0; i < questionsArr.length; i++) {
                for (let j = 0; j < questionsArr.length; j++) {
                    if (questionsArr[i].question === questionsArr[j].question) {
                        repeatCounter++;
                        if (repeatCounter === 2) {
                            questionsArr.splice(j, 1);
                            j--;
                            // i--;
                            repeatCounter--;
                        }
                    }
                }
                repeatCounter = 0;
            }
        }
        stopLoader();
    } catch (error) {
        console.error(error);
        console.log(questionsArr.length);
        let errorMessage = document.createElement('h2')
        errorMessage.innerHTML = 'API crashed, try again later with fewer questions'
        let container = document.getElementById('container');
        container.appendChild(errorMessage);
    }

    // console.log(questionsArr.length);
   firstDisplayQuestion(questionsArr);
}

// DISPLAYING QUESTIONS

function firstDisplayQuestion(questionsArr) {
    let displayQuestionsArr = [];

    for (let i = 0; i < questionsArr.length; i++) {
        displayQuestionsArr.push(generateHTMLQuestionAndAnswer(questionsArr[i]));
    }

    displayQuestion(displayQuestionsArr[0].html);
    questionsArr.splice(0,1);
    localStorage.setItem('questionsArr',JSON.stringify(questionsArr));
    
}

function displayQuestion(questionNode = 0) {
    try {
    if (questionNode === 0) {
        let questionsArr = JSON.parse(localStorage.getItem('questionsArr'));
        let displayQuestionsArr = questionsArr.map((el) => { return el = generateHTMLQuestionAndAnswer(el); });
            questionNode = displayQuestionsArr[0].html ;
            // console.log(displayQuestionsArr);
            questionsArr.splice(0,1);
            localStorage.setItem('questionsArr',JSON.stringify(questionsArr));
        }
        let container = document.getElementById('container');
        clearContainer();
        container.appendChild(questionNode);
    } catch (error) {
        console.log("no more questions");
        displayThankYouScreen();
    }
}

function generateHTMLQuestionAndAnswer(question) {
    let questionParent = document.createElement('div');
    let questionChild = document.createElement('h3');
    let categoryChild = document.createElement('h2');
    let answersParent = document.createElement('div');
    let answers = [
        ... question.incorrectAnswers,
        question.correctAnswer
    ];
    // console.log(answers);
    categoryChild.innerHTML = question.category;
    questionChild.innerHTML = question.question;
    questionParent.appendChild(categoryChild);
    questionParent.appendChild(questionChild);
    questionParent.className = 'questionContainer';
    answersParent.className = 'answersContainer';
    answers.sort((a, b) => {
        return a.localeCompare(b);
    });
    // console.log(answers);

    for (let i = 0; i < answers.length; i++) {
        let answerChild = document.createElement('button');
        answerChild.innerHTML = answers[i];
        answerChild.value = answers[i];
        answerChild.className = 'answer';    
        function answerChildClickHandler() {
            if (answerChild.value === question.correctAnswer) {
                console.log(question.correctAnswer);
                let answerArr = document.querySelectorAll('.answer');
                let answersParentDiv = document.querySelector('.answersContainer');
                answersParentDiv.innerHTML = ''
                answerArr.forEach((el)=>{
                    let newAnswerChild = document.createElement('button');
                    newAnswerChild.innerHTML = el.innerHTML;
                    newAnswerChild.value = el.value;
                    newAnswerChild.className = 'answer';
                    if (newAnswerChild.value === question.correctAnswer) {
                        newAnswerChild.style.backgroundColor = 'lightgreen';
                        counterOfAnswers(true);
                    }
                    answersParentDiv.appendChild(newAnswerChild);
                });
                setTimeout(displayQuestion,1000);
            }else{
                console.log(answerChild.value+'W');
                let answerArr = document.querySelectorAll('.answer');
                let answersParentDiv = document.querySelector('.answersContainer');
                answersParentDiv.innerHTML = ''
                answerArr.forEach((el)=>{
                    let newAnswerChild = document.createElement('button');
                    newAnswerChild.innerHTML = el.innerHTML;
                    newAnswerChild.value = el.value;
                    newAnswerChild.className = 'answer';
                    
                    if (question.incorrectAnswers.includes(newAnswerChild.value)) {
                        newAnswerChild.style.backgroundColor = 'pink';
                        // counterOfAnswers(false);
                    }else{
                        newAnswerChild.style.backgroundColor = 'lightgreen';
                        counterOfAnswers(false);
                    }
                    answersParentDiv.appendChild(newAnswerChild);
                });
                setTimeout(displayQuestion,1000);
                
            }
    }
        answerChild.addEventListener('click', answerChildClickHandler, { once : true });
        answersParent.appendChild(answerChild);
    }
    questionParent.appendChild(answersParent);
    return {
        html : questionParent,
        question : question.question,
        answer : question.correctAnswer
    }

}



// const targetNode = document.getElementById('container');
//     const config = { attributes: true, childList: true, subtree: true };
//     const callback = (mutationList, observer) => {
//         for (const mutation of mutationList) {
//           if (mutation.type === 'childList') {
//             console.log('A child node has been added or removed.');
//           } else if (mutation.type === 'attributes') {
//             console.log(`The ${mutation.attributeName} attribute was modified.`);
//           }
//         }

//       };
//       const observer = new MutationObserver(callback);
//       observer.observe(targetNode, config);
//     //   observer.disconnect();


// RETRIVEING USER INPUT

function getUserInput() {
    let numberOfQuestions = document.getElementById('numberOfQuestions');
    let chosenCategories = [];
    let chosenDifficulty = document.getElementById('difficulty');
    numberOfQuestions = numberOfQuestions.value || numberOfQuestions.placeholder;
    // console.log(numberOfQuestions);
    retriveChosenCategories(chosenCategories);
    // console.log(chosenCategories);
    chosenDifficulty = chosenDifficulty.value;
    return [numberOfQuestions, chosenCategories, chosenDifficulty]
}

function retriveChosenCategories(chosenCategories) {
    let categories = document.querySelectorAll('.categoryCheckbox');
    categories.forEach((el) => {
        if (el.checked) {
            chosenCategories.push(el);
        }
    });
}

//Extras

function startLoader() {
    let container = document.getElementById('container')
    let loader = document.createElement('div');
    loader.className = 'loader';
    clearContainer();
    container.appendChild(loader);
}

function stopLoader() {
    document.querySelector('.loader').remove();
}

function clearContainer() {
    let container = document.getElementById('container')
    let containerChildNodesArr = [... container.childNodes];
    containerChildNodesArr.forEach((el) => {
        el.remove()
    });
}

function displayThankYouScreen(){
    let thankYouContainer = document.createElement('div');
    let thankYouMessage = document.createElement('h1');
    let answersStatus = document.createElement('h2');
    let playAgainLink = document.createElement('a');
    playAgainLink.setAttribute('href','./index.html');
    playAgainLink.innerHTML = 'Play again';
    let counterOfAnswers = JSON.parse(localStorage.getItem('counterOfAnswers'));
    answersStatus.innerHTML = `Score: ${counterOfAnswers.correctAnswer} / ${counterOfAnswers.correctAnswer + counterOfAnswers.incorrectAnswer}`;
    let container = document.getElementById('container');
    thankYouMessage.innerHTML = 'Thank you for playing';
    thankYouMessage.id = 'thankYouMessage';
    clearContainer();
    thankYouContainer.appendChild(thankYouMessage);
    thankYouContainer.appendChild(answersStatus);
    thankYouContainer.appendChild(playAgainLink);
    container.appendChild(thankYouContainer);
    //CLEARED LOCAL STORAGE
    localStorage.clear()
};

function counterOfAnswers(answerState){
    console.log(localStorage.getItem('counterOfAnswers'));
    if(!localStorage.getItem('counterOfAnswers')){
        localStorage.setItem('counterOfAnswers',JSON.stringify({'correctAnswer' : 0, 'incorrectAnswer' : 0}));
        console.log('bog');
    }
        let counterOfAnswers = JSON.parse(localStorage.getItem('counterOfAnswers'));
        if (answerState) {
            counterOfAnswers.correctAnswer += 1;
            console.log(counterOfAnswers);
        }else{
            counterOfAnswers.incorrectAnswer += 1;
            console.log(counterOfAnswers);
        }
    
    localStorage.setItem('counterOfAnswers',JSON.stringify({correctAnswer : counterOfAnswers.correctAnswer, incorrectAnswer : counterOfAnswers.incorrectAnswer}));
}

let startButton = document.getElementById('startButton');
startButton.addEventListener('click', getQuestions)
