// Declaring the choices, since the choices never change, they are uppercase.
const ROCK = "rock";
const PAPER = "paper";
const SCISSORS = "scissors";

// Variables to keep track of the game
let playerScore = 0;
let roundNumber = 1;
let playerName = "";
let computerScore = 0;

// ********************** QUERY-SELECTORS ********************** //
const rockBtn = document.querySelector("#rock");
const paperBtn = document.querySelector("#paper");
const scissorsBtn = document.querySelector("#scissors");
const resultText = document.querySelector("#result");
const playerScoreText = document.querySelector("#player-score");
const computerScoreText = document.querySelector("#computer-score");
const submitButton = document.getElementById('submitButton');
const highscoreList = document.getElementById('highscore-list');

// ************************** FUNCTIONS ************************** //

// Updated playRound function
async function playRound(playerSelection) {
    const computerSelection = computerPlay();
    const winner = getWinner(playerSelection, computerSelection);

    if (winner === "player") {
        playerScore++;
    } else if (winner === "computer") {
        // Skicka resultatet till backend när datorn vinner
        await postPlayerData(playerName, playerScore);
        playerScore = 0; // Återställ spelarens poäng om datorn vinner
    }

    handleWin(winner, playerSelection, computerSelection);
}

function handleWin(winner, playerSelection, computerSelection) {
    resultText.textContent = `Round ${roundNumber}: ${playerName} chose ${playerSelection}, Computer chose ${computerSelection}. `;

    if (winner === "player") {
        resultText.textContent += `${playerName} wins! ${playerSelection} beats ${computerSelection}`;
    } else if (winner === "computer") {
        resultText.textContent += `Computer wins! ${computerSelection} beats ${playerSelection}`;
        roundNumber = 1; // Nollställ roundNumber när datorn vinner
    } else {
        resultText.textContent += `It's a tie! You both chose ${playerSelection}`;
    }

    updateScoreboard();

    if (playerScore >= 3) {
        resultText.textContent = `Congratulations, ${playerName}! You won the game!`;
        postPlayerData(playerName, playerScore);
    } else if (computerScore >= 3) {
        resultText.textContent += ` Better luck next time.`;
        updateScoreboard();
        postPlayerData(playerName, playerScore);
        playerScore = 0;
        roundNumber = 1;
    }

    // Uppdatera highscore-listan oavsett om spelaren eller datorn vinner
    updateHighscoreList();

    roundNumber++;
}

// Function to start the game
async function startGame(event) {
    event.preventDefault(); // Prevent form submission from refreshing the page
    playerName = document.getElementById('name').value;

    // Sends the players name and score to the server
    await postPlayerData(playerName, playerScore);
}

// Define an asynchronous function called postPlayerData that takes 'name' and 'score' as parameters
async function postPlayerData(name, score) {
    try {
        // Use the 'fetch' API to make a POST request to 'http://localhost:3000/highscore'
        const response = await fetch('http://localhost:3000/highscore', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, score }), // Convert 'name' and 'score' to JSON and include in the request body
        });

        if (response.ok) {
            console.log('Spelarens namn och poäng har lagts till i highscore-listan');
            // Uppdatera highscore-listan och visa den på skärmen
            await updateHighscoreList();
        } else {
            console.error('Fel vid läggning till highscore-listan');
        }
    } catch (error) {
        console.error('Ett fel uppstod:', error);
    }
}

async function updateHighscoreList() {
    try {
        // Hämta den uppdaterade highscore-listan från servern
        const highscores = await getHighscores();

        // Uppdatera highscore-listan på skärmen
        displayScoreList(highscores);
    } catch (error) {
        console.error('Ett fel uppstod:', error);
    }
}

// Function to create an array of available choices, generate a random index within the range of the choices array, and return the choice at the randomly generated index.
function computerPlay() {
    const choices = [ROCK, PAPER, SCISSORS];
    const randomIndex = Math.floor(Math.random() * choices.length);
    return choices[randomIndex];
}

// Function to determine the winner
function getWinner(playerSelection, computerSelection) {
    if (
        (playerSelection === ROCK && computerSelection === SCISSORS) ||
        (playerSelection === PAPER && computerSelection === ROCK) ||
        (playerSelection === SCISSORS && computerSelection === PAPER)
    ) {
        return "player"; // Return "player" indicating that the player wins
    } else if (
        (computerSelection === ROCK && playerSelection === SCISSORS) ||
        (computerSelection === PAPER && playerSelection === ROCK) ||
        (computerSelection === SCISSORS && playerSelection === PAPER)
    ) {
        return "computer"; // Return "computer" indicating that the computer wins
    } else {
        return "tie"; // Return "tie" indicating a tie if none of the above conditions are met
    }
}

// Function to update the scoreboard
function updateScoreboard() {
    playerScoreText.textContent = `${playerName}: ${playerScore}`;
    computerScoreText.textContent = `Computer: ${computerScore}`;
}

// Function to end the game and display a message
function endGame(message) {
    resultText.textContent = message; // Set the result text content to the provided message
    resultText.textContent = message.replace("You", playerName); // Replace "You" with the player's name in the message

    // Show the restart button
    const restartBtn = document.createElement("button");
    restartBtn.textContent = "Restart Game";
    restartBtn.addEventListener("click", restartGame); // Add a click event listener to restart the game
    resultText.appendChild(restartBtn); // Append the restart button to the result text
}

// Function to restart the game
function restartGame() {
    playerScore = 0; // Reset player's score
    computerScore = 0; // Reset computer's score
    roundNumber = 1; // Reset round number
    resultText.textContent = ""; // Clear the result text
    updateScoreboard(); // Update the scoreboard
}

// Event listeners for player's choices
rockBtn.addEventListener("click", () => playRound(ROCK));
paperBtn.addEventListener("click", () => playRound(PAPER));
scissorsBtn.addEventListener("click", () => playRound(SCISSORS));

// Event listener for form submission
submitButton.addEventListener('click', startGame);

// Additional code for displaying highscore list
async function getHighscores() {
    try {
        const response = await fetch('http://localhost:3000/highscore');
        if (response.ok) {
            const highscores = await response.json();
            return highscores;
        } else {
            console.error('Fel vid hämtning av highscore-lista');
            return [];
        }
    } catch (error) {
        console.error('Ett fel uppstod:', error);
        return [];
    }
}

function displayScoreList(scoreArray) {
    highscoreList.innerHTML = ''; // Clear the existing list
    // Loop through each 'scores' object in 'scoreArray'
    for (const scores of scoreArray) {
        const { name, score } = scores; // Destructure 'name' and 'score' from the current 'scores' object
        const li = document.createElement("li");
        li.innerText = `${name}: ${score}`; // Set the text content of the 'li' element to display the player's name and score
        highscoreList.appendChild(li);
    }
}

// Add an event listener to execute the following code when the page finishes loading
window.addEventListener('load', async () => {
    // Call the 'getHighscores' function asynchronously to retrieve highscore data
    const highscores = await getHighscores();
    displayScoreList(highscores);
});
