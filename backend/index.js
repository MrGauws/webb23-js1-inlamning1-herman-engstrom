const express = require('express'); // Express framework for building web applications
const fs = require('fs'); // File system module for working with files
const path = require('path'); // Path module for working with file paths

const app = express();
const port = 3000; // Set the port number for the server to listen on

app.use(express.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Läs highscores från JSON-fil
function getHighscores() {
    const rawData = fs.readFileSync(path.join(__dirname, 'data', 'highscore.json'));
    const highscores = JSON.parse(rawData);
    highscores.sort((a, b) => b.score - a.score);
    return highscores;
}

// Spara highscores till JSON-fil
function saveHighscores(highscores) {
    const jsonData = JSON.stringify(highscores);
    fs.writeFileSync(path.join(__dirname, 'data', 'highscore.json'), jsonData);
}

// Hämta highscore-listan
app.get('/highscore', (req, res) => {
    const highscores = getHighscores();
    res.send(highscores);
});

// Lägg till nytt highscore-objekt med namn och poäng
app.post('/highscore', (req, res) => {
    const { name, score } = req.body;
    const highscores = getHighscores();

    // Lägg till det nya highscore-objektet
    highscores.push({ name, score });

    // Sortera listan i fallande ordning utifrån score-värdet
    highscores.sort((a, b) => b.score - a.score);

    // Begränsa listan till de 5 bästa highscores
    highscores.splice(5);

    // Spara highscores till JSON-fil
    saveHighscores(highscores);

    // Returnera den uppdaterade highscore-listan med namnen och poängen
    res.json({ highscores });
});

// Start the Express server and have it listen on the specified port
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
