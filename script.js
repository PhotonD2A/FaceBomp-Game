// Game state variables
let score = 0;
let timeLeft = 30;
let gameTimer = null;
let popupTimer = null;
let isPlaying = false;
let playerName = '';

// DOM elements
const holes = document.querySelectorAll('.hole');
const faces = document.querySelectorAll('.face');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('timer');
const startButton = document.getElementById('startButton');
const endMessage = document.getElementById('endMessage');
const tapSound = document.getElementById('tapSound');

// Event listeners
startButton.addEventListener('click', startGame);
faces.forEach(face => face.addEventListener('click', whack));

/**
 * Starts or restarts the game
 */
function startGame() {
    // Get and validate player name
    playerName = document.getElementById('playerName').value.trim();
    if (!playerName) {
        alert('Please enter your name first!');
        return;
    }
    
    // Get and validate custom time
    const customTime = parseInt(document.getElementById('gameTime').value);
    if (isNaN(customTime) || customTime < 5 || customTime > 60) {
        alert('Please enter a valid time between 5 and 60 seconds!');
        return;
    }
    
    // Hide inputs during game
    document.getElementById('playerName').disabled = true;
    document.getElementById('gameTime').disabled = true;
    
    // Reset game state with custom time
    score = 0;
    timeLeft = customTime;
    isPlaying = true;
    
    // Update UI
    scoreDisplay.textContent = score;
    timeDisplay.textContent = timeLeft;
    endMessage.textContent = '';
    endMessage.classList.remove('visible');
    startButton.textContent = 'Game In Progress';
    startButton.disabled = true;

    // Clear any existing timers
    if (gameTimer) clearInterval(gameTimer);
    if (popupTimer) clearInterval(popupTimer);

    // Start the game timers
    gameTimer = setInterval(updateTimer, 1000);
    showFace(); // Show first face immediately
}

/**
 * Updates the countdown timer and ends game when time runs out
 */
function updateTimer() {
    timeLeft--;
    timeDisplay.textContent = timeLeft;
    
    if (timeLeft <= 0) {
        endGame();
    }
}

/**
 * Randomly shows a face in one of the holes
 */
function showFace() {
    // Hide all faces first
    holes.forEach(hole => {
        hole.classList.remove('up');
        hole.classList.remove('clicked');
        // Reset any lingering styles
        const face = hole.querySelector('.face');
        face.style.transform = '';
        face.style.opacity = '';
    });
    
    // Select random hole
    const randomHole = holes[Math.floor(Math.random() * holes.length)];
    randomHole.classList.add('up');

    // Set random time for face to stay up (between 0.5 and 1.5 seconds)
    const popupTime = Math.random() * 1000 + 500;

    // Schedule next face if game is still active
    popupTimer = setTimeout(() => {
        if (randomHole.classList.contains('up') && !randomHole.classList.contains('clicked')) {
            randomHole.classList.remove('up');
            if (isPlaying) showFace();
        }
    }, popupTime);
}

/**
 * Handles clicking/whacking a face
 * @param {Event} event - The click event
 */
function whack(event) {
    if (!isPlaying) return;

    const face = event.target;
    const hole = face.parentElement;

    // Only score if the hole is 'up' and hasn't been clicked
    if (hole.classList.contains('up') && !hole.classList.contains('clicked')) {
        // Play tap sound
        tapSound.currentTime = 0;  // Reset sound to start
        tapSound.play().catch(e => console.log('Error playing sound:', e));
        
        score++;
        scoreDisplay.textContent = score;
        
        // Add click effect - zoom the whole hole
        hole.style.transform = 'scale(1.1)';
        hole.style.transition = 'transform 0.1s';
        
        // Reset hole transform after animation
        setTimeout(() => {
            hole.style.transform = '';
        }, 100);
        
        hole.classList.add('clicked');
        
        // Remove the face slightly faster after click
        setTimeout(() => {
            hole.classList.remove('up');
            hole.classList.remove('clicked');
            if (isPlaying) showFace();
        }, 200);
    }
}

/**
 * Ends the game and displays final message
 */
function endGame() {
    isPlaying = false;
    clearInterval(gameTimer);
    clearTimeout(popupTimer);
    
    // Hide all faces
    holes.forEach(hole => {
        hole.classList.remove('up');
        hole.style.transform = ''; // Reset any remaining transforms
    });
    
    // Reset button and enable inputs
    startButton.disabled = false;
    startButton.textContent = 'Play Again';
    document.getElementById('playerName').disabled = false;
    document.getElementById('gameTime').disabled = false;

    // Show end message based on score
    let message;
    if (score === 0) {
        message = "did you fall asleep? 😴";
    } else if (score < 5) {
        message = "needs more practice! ☕";
    } else if (score < 10) {
        message = "is getting better! 👍";
    } else if (score < 15) {
        message = "is a natural face-bomper! 🌟";
    } else {
        message = "is a FaceBomp champion! 🏆";
    }

    endMessage.textContent = `Game Over! ${playerName} ${message}\nFinal Score: ${score}`;
    endMessage.classList.add('visible');
} 