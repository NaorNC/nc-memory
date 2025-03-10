let gameConfig = {
    duration: 30,
    memorizeTime: 5,
    numberLength: 6,
    gameActive: false,
    timeRemaining: 0,
    numbers: [],
    hiddenIndices: [],
    inputNumbers: [],
    currentInputIndex: 0,
    timerInterval: null,
    gamePhase: 'idle'
};

const gameContainer = document.getElementById('game-container');
const numbersDisplay = document.getElementById('numbers-display');
const gameInstructions = document.getElementById('game-instructions');
const timerValue = document.getElementById('timer-value');
const resultScreen = document.getElementById('result-screen');
const resultIcon = document.getElementById('result-icon');
const resultText = document.getElementById('result-text');
const closeButton = document.getElementById('close-button');
const numpadButtons = document.querySelectorAll('.numpad-button');

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    
    window.addEventListener('message', (event) => {
        const data = event.data;
        
        if (data.action === 'startGame') {
            fullReset();
            startGame(data.duration, data.memorizeTime, data.numberLength);
        }
    });
});

function fullReset() {
    if (gameConfig.timerInterval) {
        clearInterval(gameConfig.timerInterval);
        gameConfig.timerInterval = null;
    }
    
    gameConfig.gameActive = false;
    gameConfig.gamePhase = 'idle';
    gameConfig.numbers = [];
    gameConfig.hiddenIndices = [];
    gameConfig.inputNumbers = [];
    gameConfig.currentInputIndex = 0;
    
    numbersDisplay.innerHTML = '';
    gameInstructions.textContent = '';
    
    gameContainer.classList.remove('active');
    resultScreen.classList.remove('active');
    
    numbersDisplay.classList.remove('numbers-many', 'numbers-lots', 'incorrect');
}

function setupEventListeners() {
    numpadButtons.forEach(button => {
        button.addEventListener('click', () => {
            const value = button.getAttribute('data-value');
            handleNumpadInput(value);
        });
    });
    
    closeButton.addEventListener('click', () => {
        closeGame(false);
    });
    
    document.addEventListener('keydown', (e) => {
        if (!gameConfig.gameActive) return;
        
        if (/^\d$/.test(e.key)) {
            handleNumpadInput(e.key);
        }
        else if (e.key === 'Backspace') {
            handleNumpadInput('clear');
        }
        else if (e.key === 'Enter') {
            handleNumpadInput('submit');
        }
        else if (e.key === 'Escape') {
            closeGame(false);
        }
    });
}

function startGame(duration, memorizeTime, numberLength) {
    gameConfig.duration = duration || 30;
    gameConfig.memorizeTime = memorizeTime || 5;
    gameConfig.numberLength = numberLength || 6;
    gameConfig.timeRemaining = gameConfig.duration;
    gameConfig.gameActive = true;
    gameConfig.gamePhase = 'memorize';
    gameConfig.numbers = [];
    gameConfig.hiddenIndices = [];
    gameConfig.inputNumbers = [];
    gameConfig.currentInputIndex = 0;
    
    for (let i = 0; i < gameConfig.numberLength; i++) {
        gameConfig.numbers.push(Math.floor(Math.random() * 10));
    }
    
    const hideCount = Math.floor(gameConfig.numberLength * (0.4 + Math.random() * 0.2));
    
    const finalHideCount = Math.min(
        Math.max(2, hideCount), 
        Math.floor(gameConfig.numberLength * 0.7)
    );
    
    while (gameConfig.hiddenIndices.length < finalHideCount) {
        const idx = Math.floor(Math.random() * gameConfig.numberLength);
        if (!gameConfig.hiddenIndices.includes(idx)) {
            gameConfig.hiddenIndices.push(idx);
        }
    }
    
    gameConfig.hiddenIndices.sort((a, b) => a - b);
    
    for (let i = 0; i < gameConfig.numberLength; i++) {
        gameConfig.inputNumbers[i] = null;
    }
    
    gameContainer.classList.add('active');
    
    createNumberBoxes();
    
    gameInstructions.textContent = `Memorize these numbers! You have ${gameConfig.memorizeTime} seconds.`;
    
    startTimer();
    
    setTimeout(() => {
        transitionToInputPhase();
    }, gameConfig.memorizeTime * 1000);
}

function createNumberBoxes() {
    numbersDisplay.innerHTML = '';
    
    if (gameConfig.numberLength > 14) {
        numbersDisplay.classList.add('numbers-lots');
    } else if (gameConfig.numberLength > 9) {
        numbersDisplay.classList.add('numbers-many');
    } else {
        numbersDisplay.classList.remove('numbers-many', 'numbers-lots');
    }
    
    gameConfig.numbers.forEach(number => {
        const box = document.createElement('div');
        box.className = 'number-box';
        box.textContent = number;
        numbersDisplay.appendChild(box);
    });
}

function transitionToInputPhase() {
    if (gameConfig.gamePhase !== 'memorize') return;
    
    gameConfig.gamePhase = 'input';
    
    const numberBoxes = numbersDisplay.querySelectorAll('.number-box');
    
    gameConfig.hiddenIndices.forEach(index => {
        numberBoxes[index].textContent = '';
        numberBoxes[index].classList.add('hidden');
        numberBoxes[index].setAttribute('data-index', index);
        
        numberBoxes[index].addEventListener('click', () => {
            selectInputBox(index);
        });
    });
    
    gameInstructions.textContent = 'Fill in the missing numbers!';
}

function selectInputBox(index) {
    if (gameConfig.gamePhase !== 'input') return;
    
    const allBoxes = numbersDisplay.querySelectorAll('.number-box');
    allBoxes.forEach(box => box.classList.remove('selected'));
    
    const selectedBox = numbersDisplay.querySelector(`.number-box[data-index="${index}"]`);
    if (selectedBox) {
        selectedBox.classList.add('selected');
        gameConfig.currentInputIndex = index;
    }
}

function handleNumpadInput(value) {
    if (gameConfig.gamePhase !== 'input') return;
    
    switch (value) {
        case 'clear':
            clearInputs();
            break;
            
        case 'submit':
            if (!allInputsFilled()) {
                shakeDisplay();
                return;
            }
            
            checkResult();
            break;
            
        default:
            const numberValue = parseInt(value);
            
            let currentBox = numbersDisplay.querySelector('.number-box.selected');
            if (!currentBox) {
                for (const index of gameConfig.hiddenIndices) {
                    const box = numbersDisplay.querySelector(`.number-box[data-index="${index}"]`);
                    if (!box.textContent) {
                        currentBox = box;
                        gameConfig.currentInputIndex = index;
                        break;
                    }
                }
            }
            
            if (currentBox) {
                currentBox.textContent = numberValue;
                gameConfig.inputNumbers[gameConfig.currentInputIndex] = numberValue;
                
                currentBox.classList.remove('selected');
                
                let nextBoxFound = false;
                for (const index of gameConfig.hiddenIndices) {
                    const box = numbersDisplay.querySelector(`.number-box[data-index="${index}"]`);
                    if (!box.textContent) {
                        box.classList.add('selected');
                        gameConfig.currentInputIndex = index;
                        nextBoxFound = true;
                        break;
                    }
                }
                
                if (allInputsFilled() && !nextBoxFound) {
                    setTimeout(() => {
                        checkResult();
                    }, 500);
                }
            }
            break;
    }
}

function allInputsFilled() {
    for (const index of gameConfig.hiddenIndices) {
        if (gameConfig.inputNumbers[index] === null || gameConfig.inputNumbers[index] === undefined) {
            return false;
        }
    }
    return true;
}

function clearInputs() {
    gameConfig.hiddenIndices.forEach(index => {
        gameConfig.inputNumbers[index] = null;
        
        const box = numbersDisplay.querySelector(`.number-box[data-index="${index}"]`);
        if (box) {
            box.textContent = '';
            box.classList.remove('correct', 'incorrect');
        }
    });
    
    if (gameConfig.hiddenIndices.length > 0) {
        const firstBox = numbersDisplay.querySelector(`.number-box[data-index="${gameConfig.hiddenIndices[0]}"]`);
        if (firstBox) {
            const allBoxes = numbersDisplay.querySelectorAll('.number-box');
            allBoxes.forEach(box => box.classList.remove('selected'));
            
            firstBox.classList.add('selected');
            gameConfig.currentInputIndex = gameConfig.hiddenIndices[0];
        }
    }
}

function startTimer() {
    updateTimerDisplay();
    
    gameConfig.timerInterval = setInterval(() => {
        gameConfig.timeRemaining--;
        
        updateTimerDisplay();
        
        if (gameConfig.timeRemaining <= 0) {
            clearInterval(gameConfig.timerInterval);
            gameConfig.timerInterval = null;
            
            if (gameConfig.gamePhase === 'memorize') {
                transitionToInputPhase();
            }
            
            if (gameConfig.gamePhase === 'input') {
                showResult(false, 'Time\'s up!');
            }
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(gameConfig.timeRemaining / 60);
    const seconds = gameConfig.timeRemaining % 60;
    
    timerValue.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    if (gameConfig.timeRemaining <= 5) {
        timerValue.style.color = '#e74c3c';
    } else if (gameConfig.timeRemaining <= 10) {
        timerValue.style.color = '#f39c12';
    } else {
        timerValue.style.color = '#3498db';
    }
}

function checkResult() {
    let correct = true;
    
    for (const index of gameConfig.hiddenIndices) {
        const inputValue = gameConfig.inputNumbers[index];
        const targetValue = gameConfig.numbers[index];
        
        const box = numbersDisplay.querySelector(`.number-box[data-index="${index}"]`);
        
        if (inputValue !== targetValue) {
            correct = false;
            if (box) box.classList.add('incorrect');
        } else {
            if (box) box.classList.add('correct');
        }
    }
    
    if (correct) {
        setTimeout(() => {
            showResult(true, 'Success!');
        }, 1000);
    } else {
        shakeDisplay();
        
        setTimeout(() => {
            clearInputs();
        }, 1000);
    }
}

function shakeDisplay() {
    numbersDisplay.classList.add('incorrect');
    
    setTimeout(() => {
        numbersDisplay.classList.remove('incorrect');
    }, 500);
}

function showResult(success, message) {
    gameConfig.gamePhase = 'result';
    
    if (gameConfig.timerInterval) {
        clearInterval(gameConfig.timerInterval);
        gameConfig.timerInterval = null;
    }
    
    if (success) {
        resultIcon.innerHTML = '<i class="fa-solid fa-check-circle success-text"></i>';
        resultText.textContent = message || 'Success!';
        resultText.classList.add('success-text');
        resultText.classList.remove('failure-text');
    } else {
        resultIcon.innerHTML = '<i class="fa-solid fa-times-circle failure-text"></i>';
        resultText.textContent = message || 'Failed!';
        resultText.classList.add('failure-text');
        resultText.classList.remove('success-text');
    }
    
    resultScreen.classList.add('active');
    
    setTimeout(() => {
        closeGame(success);
    }, 2000);
}

function closeGame(success) {
    if (gameConfig.timerInterval) {
        clearInterval(gameConfig.timerInterval);
        gameConfig.timerInterval = null;
    }
    
    gameConfig.gameActive = false;
    gameConfig.gamePhase = 'idle';
    
    gameContainer.classList.remove('active');
    resultScreen.classList.remove('active');
    
    fetch('https://nc-memory/gameComplete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({
            success: success
        })
    }).catch(err => {
        console.error('Failed to send game result:', err);
    });
}