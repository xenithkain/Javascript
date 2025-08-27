import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

//Constants
// Opens a readline interface that knows how and where to input and output to the console since in the import
//we say that input and output are stdin and stdout
const rl = readline.createInterface({ input, output });
const words = [
    "apple",
    "bear",
    "cellphone",
    "platypus",
    "banjo",
    "china",
    "blaster",
    "candy",
    "rock and roll",
];
//secret word uses math library to grab one from array
const secret = words[Math.floor(Math.random() * words.length)];

//Variables
let guessed_letters = [];
let guessed = 0;
let game_running = true;
let printString = "";
//same length as secret, is 0 for not guessed, 1 for guessed
let key = Array(secret.length).fill(0);
let lives = 3;

while (game_running) {
    //Create a string to print with letters and _
    for (let i = 0; i < key.length; i++) {
        switch (key[i]) {
            case 0:
                printString += "_";
                break;
            case 1:
                printString += secret[i];
                break;
        }
    }

    console.log(printString);
    console.log("Lives remaining " + lives + ".");
    //Use the readline interface to get a answer from user
    let answer = await rl.question(
        "Guess a letter, press enter after the letter."
    );
    answer = answer.toLowerCase().trim();
    //Check to see if theyve already guessed it, if so continue to next game loop
    if (guessed_letters.includes(answer)) {
        continue;
    }
    //Check if they guessed it right, if so
    let guessed_right = false;
    for (let i = 0; i < secret.length; i++) {
        if (secret[i] == answer) {
            key[i] = 1;
            guessed_right = true;
            guessed++;
        }
    }
    if (!guessed_right) {
        console.log("Oof " + answer + " was not correct!");
        lives--;
        if (lives == 0) {
            console.log("Game Over! The word was " + secret + "!");
            game_running = false;
        }
    }
    guessed_letters.push(answer);
    //If they are all right, you win
    if (guessed == secret.length) {
        console.log("You Win!!!");
        game_running = false;
        continue;
    }
}
rl.close();
