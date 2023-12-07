const wordEl = document.getElementById('word');
const wrongLettersEl = document.getElementById('wrong-letter');
const playAgainBtn = document.getElementById('play-btn');
const popup = document.getElementById('popup-container');
const notification = document.getElementById('notification-container');
const finalMessage = document.getElementById('final-message');
const finalMessageRevealWord = document.getElementById('final-message-reveal-word');

const figureParts = document.querySelectorAll('.figure-part')

const words = ['apple', 'orange', 'pinaple', 'banana', 'bluebarry']

let selectedWords = words[Math.floor(Math.random() * words.length)]

const currectLetters = []
const wrongLetters = []

function desplayWords(){
    wordEl.innerHTML = `${selectedWords .split('').map(letter => `<span class='letter'>
       ${currectLetters.includes(letter) ? letter : ''}
    </span>`).join('')}`

    const innerWord = wordEl.innerText.replace(/\n/g, '')

    if(innerWord === selectedWords){
        finalMessage.innerText = 'Congragulation! You Win! 😀'
        popup.style.display = 'flex'
    }
}

function updateWrongLettersEl(){
    wrongLettersEl.innerHTML = `${wrongLetters.length > 0 ? '<p>Wrong</p>' : ''}
    ${wrongLetters.map(letter => `<span>${letter}</span>`)}`

    figureParts.forEach((part, index) => {
        const errors = wrongLetters.length;
    
        if(index < errors){
            part.style.display = 'block'; 
        } else {
            part.style.display = 'none'
        }
    })

    if(wrongLetters.length === figureParts.length){
        finalMessage.innerText = 'Sorry! You Lost 😢'
        popup.style.display = 'flex'
    }
}

function showNotif(){
    notification.classList.add('show')

    setTimeout(() => {p
        notification.classList.add('show')    
        
    }, 2000)
}

window.addEventListener('keydown', (e) => {
    // console.log(e.keyCode);
    if(e.keyCode >= 65 && e.keyCode <90 ){
        const letter = e.key;

        if(selectedWords.includes(letter)){
            if(!currectLetters.includes(letter)){
                currectLetters.push(letter)

                desplayWords()
            } else {
                showNotif()
            }
        } else {
            if(!wrongLetters.includes(letter)){
                wrongLetters.push(letter);

                updateWrongLettersEl()
            } else {
                showNotif()
            }
        }
    }
} )

playAgainBtn.addEventListener('click', () => {
    currectLetters.splice(0);
    wrongLetters.splice(0);

    selectedWords = words[Math.floor(Math.random() * words.length)];

    desplayWords()

    updateWrongLettersEl()

    popup.style.display = 'none'
})

desplayWords()