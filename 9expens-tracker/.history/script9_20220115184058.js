const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');

const dummyTransactions = [
  { id: 1, text: 'Flower', amount: -20 },
  { id: 2, text: 'Salary', amount: 300 },
  { id: 3, text: 'Book', amount: -10 },
  { id: 4, text: 'Camera', amount: 150 }
];

let transactions = dummyTransactions;

function addTransaction(e){
    e.preventDefault();

    if(text.value.trim() === '' || amount.value.trim() === ''){
        alert('Please add a text and amount')
    }else{
        const transaction = {
            id: generateId(),
            text: text.value,
            amount: amount.value
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

    item.innerHTML = `${transaction.text} <span>${sing}${Math.abs(transaction.amount)}</span> <button class='delete'>x</button>`

    list.appendChild(item)
}

function updateValue(){
    const amounts = transaction.map(transaction => 
       transaction.amount);
    
    console.log(amounts)
}

function init(){
    list.innerHTML = '';

    transaction.forEach(addTransactionDom);
    updateValue()
}

init()

form.addEventListener('submit', addTransaction)