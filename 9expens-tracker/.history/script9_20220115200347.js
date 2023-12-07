const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');

// const dummyTransactions = [
//   { id: 1, text: 'Flower', amount: -20 },
//   { id: 2, text: 'Salary', amount: 300 },
//   { id: 3, text: 'Book', amount: -10 },
//   { id: 4, text: 'Camera', amount: 150 }
// ];

const localStorageTransactions = JSON.parse(localStorage.getItem('transactions') );
  

let transactions = localStorage.getItem('transactions') !== null ? localStorageTransactions : [];

function addTransaction(e){
    e.preventDefault();

    if(text.value.trim() === '' || amount.value.trim() === ''){
        alert('Please add a text and amount')
    }else{
        const transaction = {
            id: generateId(),
            text: text.value,
            amount: +amount.value
        }

       transactions.push(transaction);

       addTransactionDom(transaction)

       updateValue()

       text.value = '';
       amount.value = '';
    }
}

function generateId(){
    return Math.floor(Math.random() * 10000000)
}

function addTransactionDom (transaction){
    const sing = transaction.amount < 0 ? '-' : '+';

    const item = document.createElement('li');

    item.classList.add(transaction.amount < 0 ? 'minus' : 'plus')

    item.innerHTML = `${transaction.text} <span>${sing}${Math.abs(transaction.amount)}</span> <button class='delete' onClick='removeTransaction(${transaction.id})'>x</button>`

    list.appendChild(item)
}

function updateValue(){
    const amounts = transactions.map(transaction => 
       transaction.amount);

    console.log(amounts)
    
    const total = amounts.reduce((acc, item) => (acc += item), 0)
    .toFixed(2)   

    const income = amounts.filter(item => item > 0)
        .reduce((acc, item) => (acc += item), 0)
        .toFixed(2)
        
    const expense = (amounts.filter(item => item < 0)
        .reduce((acc, item) => (acc += item), 0) * -1).toFixed(2)

    balance.innerHTML = `$${total}`;
    money_plus.innerHTML = `$${income}`;
    money_minus.innerHTML = `$${expense}`;
}

function removeTransaction(id){
    transactions = transactions.filter(transaction => transaction.id !== id)

    init()
}

function init(){
    list.innerHTML = '';

    transactions.forEach(addTransactionDom);
    updateValue()
}

init()

form.addEventListener('submit', addTransaction)