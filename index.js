//SETTING UP FRONT PAGE
async function fetchData() {
    let response = await fetch('https://the-trivia-api.com/api/categories');
    // console.log(response);
    let data = await response.json()
    // console.log(data);
    return data;
}

async function displayCategories() {
    let categoriesObject = await fetchData();
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
            } else {
                let categoryAllCheckbox = document.getElementById('categoryAll');
                if (categoryAllCheckbox.checked === true) {
                    categoryUnselectedCheckboxes.forEach((el)=>{
                       if (el.value != 'All') {
                           el.checked = false;
                       }else{
                        // napisat ako se unchecka i svi su unchecked da vrati na checked
                       }
                    });
                }
            }
        })

    })

}

//RETRIVEING USER INPUT 

function retrievingUserInput() {
    let numberOfQuestions = document.getElementById('numberOfQuestions');
    let chosenCategories = [];
    let chosenDifficulty = document.getElementById('difficulty');
    numberOfQuestions = numberOfQuestions.value || numberOfQuestions.placeholder;
    console.log(numberOfQuestions);
    retriveChosenCategories(chosenCategories);
    console.log(chosenCategories);
    chosenDifficulty = chosenDifficulty.value;
    console.log(chosenDifficulty);
    
}

function retriveChosenCategories(chosenCategories) {
    let categories = document.querySelectorAll('.categoryCheckbox');
    categories.forEach((el)=>{
        if (el.checked) {
            chosenCategories.push(el);
        }
    });
}

let startButton = document.getElementById('startButton');
startButton.addEventListener('click',retrievingUserInput)