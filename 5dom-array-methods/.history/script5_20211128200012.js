const main = document.getElementById('main');
const addUserBtn = document.getElementById('add-user');
const doubleBtn = document.getElementById('double');
const showMillionairesBtn = document.getElementById('show-millionaires');
const sortBtn = document.getElementById('sort');
const calculateWealthBtn = document.getElementById('calculate-wealth');

let data = [];

function getRandomUser(){
    fetch('https://rendomuser.me/api')   
}

addUserBtn.addEventListener('click', getRandomUser);
// doubleBtn.addEventListener('click', doubleMoney);
// sortBtn.addEventListener('click', sortByRichest);
// showMillionairesBtn.addEventListener('click', showMillionaires);
// calculateWealthBtn.addEventListener('click', calculateWealth);