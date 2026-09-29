// ==========================================
// FLOP CORN MOVIE QUIZ
// ==========================================

const quizData = {

    // 🎬 GUESS THE MOVIE
    movie: [
        {
            question: "Which movie features a superhero named Tony Stark?",
            answers: ["Iron Man", "Batman", "Superman", "Deadpool"],
            correct: "Iron Man"
        },
        {
            question: "Which movie is about a theme park filled with cloned dinosaurs?",
            answers: ["Jurassic Park", "King Kong", "Godzilla", "Jaws"],
            correct: "Jurassic Park"
        },
        {
            question: "Which movie follows the journey to destroy the One Ring?",
            answers: ["The Lord of the Rings", "Harry Potter", "Avatar", "Gladiator"],
            correct: "The Lord of the Rings"
        },
        {
            question: "Which movie features the fictional planet Pandora?",
            answers: ["Avatar", "Interstellar", "Dune", "Gravity"],
            correct: "Avatar"
        },
        {
            question: "Which movie features a young wizard studying at Hogwarts?",
            answers: ["Harry Potter", "The Hobbit", "Narnia", "Percy Jackson"],
            correct: "Harry Potter"
        },
        {
            question: "Which Christopher Nolan movie explores dreams within dreams?",
            answers: ["Inception", "Interstellar", "Tenet", "Dunkirk"],
            correct: "Inception"
        },
        {
            question: "Which movie follows the sinking of a famous passenger ship?",
            answers: ["Titanic", "Poseidon", "Jaws", "Cast Away"],
            correct: "Titanic"
        },
        {
            question: "Which movie features the superhero kingdom of Wakanda?",
            answers: ["Black Panther", "Thor", "Aquaman", "Doctor Strange"],
            correct: "Black Panther"
        },
        {
            question: "Which movie features a clown villain called the Joker?",
            answers: ["The Dark Knight", "Spider-Man", "Iron Man", "Logan"],
            correct: "The Dark Knight"
        },
        {
            question: "Which movie follows a boxer named Rocky Balboa?",
            answers: ["Rocky", "Creed", "Raging Bull", "Warrior"],
            correct: "Rocky"
        },
{
            question: "Which film follows Rancho, Farhan and Raju during their college years?",
            answers: ["3 Idiots", "PK", "Dil Chahta Hai", "Zindagi Na Milegi Dobara"],
            correct: "3 Idiots"
        },
        {
            question: "Which Hindi film revolves around a village cricket match against British rulers?",
            answers: ["Lagaan", "Dangal", "Swades", "Chak De! India"],
            correct: "Lagaan"
        },
        {
            question: "Which film follows Neo as he discovers the truth about a simulated reality?",
            answers: ["The Matrix", "Minority Report", "The Truman Show", "Inception"],
            correct: "The Matrix"
        },
        {
            question: "Which Christopher Nolan film follows Cooper on a mission involving a wormhole and distant worlds?",
            answers: ["Interstellar", "Tenet", "Dunkirk", "Oppenheimer"],
            correct: "Interstellar"
        },
        {
            question: "Which Kannada film follows Rocky's rise in the world of the Kolar Gold Fields?",
            answers: ["K.G.F: Chapter 1", "Kantara", "777 Charlie", "Kirik Party"],
            correct: "K.G.F: Chapter 1"
        },
        {
            question: "Which Kannada film follows Dharma after a dog named Charlie enters his life?",
            answers: ["777 Charlie", "Kantara", "K.G.F: Chapter 1", "Mungaru Male"],
            correct: "777 Charlie"
        }
    ],


    // 🎭 GUESS THE ACTOR
    actor: [
        {
            question: "Who played Iron Man in the Marvel Cinematic Universe?",
            answers: [
                "Robert Downey Jr.",
                "Chris Evans",
                "Chris Hemsworth",
                "Mark Ruffalo"
            ],
            correct: "Robert Downey Jr."
        },
        {
            question: "Who played Jack in Titanic?",
            answers: [
                "Leonardo DiCaprio",
                "Brad Pitt",
                "Tom Cruise",
                "Matt Damon"
            ],
            correct: "Leonardo DiCaprio"
        },
        {
            question: "Who played Captain Jack Sparrow?",
            answers: [
                "Johnny Depp",
                "Orlando Bloom",
                "Tom Hanks",
                "Hugh Jackman"
            ],
            correct: "Johnny Depp"
        },
        {
            question: "Who played Harry Potter in the film series?",
            answers: [
                "Daniel Radcliffe",
                "Rupert Grint",
                "Tom Felton",
                "Robert Pattinson"
            ],
            correct: "Daniel Radcliffe"
        },
        {
            question: "Who played Thor in the Marvel Cinematic Universe?",
            answers: [
                "Chris Hemsworth",
                "Chris Evans",
                "Tom Hiddleston",
                "Jeremy Renner"
            ],
            correct: "Chris Hemsworth"
        },
        {
            question: "Who played Wolverine in the X-Men movies?",
            answers: [
                "Hugh Jackman",
                "Ryan Reynolds",
                "Christian Bale",
                "Henry Cavill"
            ],
            correct: "Hugh Jackman"
        },
        {
            question: "Who played the Joker in The Dark Knight?",
            answers: [
                "Heath Ledger",
                "Joaquin Phoenix",
                "Jared Leto",
                "Jack Nicholson"
            ],
            correct: "Heath Ledger"
        },
        {
            question: "Who played Forrest Gump?",
            answers: [
                "Tom Hanks",
                "Tom Cruise",
                "Brad Pitt",
                "George Clooney"
            ],
            correct: "Tom Hanks"
        },
        {
            question: "Who played Black Panther in the MCU?",
            answers: [
                "Chadwick Boseman",
                "Michael B. Jordan",
                "Anthony Mackie",
                "Idris Elba"
            ],
            correct: "Chadwick Boseman"
        },
        {
            question: "Who played Deadpool?",
            answers: [
                "Ryan Reynolds",
                "Chris Pratt",
                "Hugh Jackman",
                "Jake Gyllenhaal"
            ],
            correct: "Ryan Reynolds"
        }
  ,
{
            question: "Who played Rancho in 3 Idiots?",
            answers: ["Aamir Khan", "Saif Ali Khan", "Ranbir Kapoor", "Shahid Kapoor"],
            correct: "Aamir Khan"
        },
        {
            question: "Who played Raj in Dilwale Dulhania Le Jayenge?",
            answers: ["Shah Rukh Khan", "Aamir Khan", "Akshay Kumar", "Salman Khan"],
            correct: "Shah Rukh Khan"
        },
        {
            question: "Who played Neo in The Matrix?",
            answers: ["Keanu Reeves", "Christian Bale", "Brad Pitt", "Matt Damon"],
            correct: "Keanu Reeves"
        },
        {
            question: "Who played Michael Corleone in The Godfather?",
            answers: ["Al Pacino", "Robert De Niro", "Jack Nicholson", "Dustin Hoffman"],
            correct: "Al Pacino"
        },
        {
            question: "Who played Rocky in K.G.F: Chapter 1?",
            answers: ["Yash", "Sudeep", "Puneeth Rajkumar", "Rakshit Shetty"],
            correct: "Yash"
        },
        {
            question: "Who played Shiva in Kantara?",
            answers: ["Rishab Shetty", "Rakshit Shetty", "Upendra", "Sudeep"],
            correct: "Rishab Shetty"
        }
    ],


    // 😂 GUESS BY EMOJI
    emoji: [
        {
            question: "🚢 🧊 💔",
            answers: ["Titanic", "Frozen", "Jaws", "Avatar"],
            correct: "Titanic"
        },
        {
            question: "🦁 👑",
            answers: ["The Lion King", "Gladiator", "King Kong", "Avatar"],
            correct: "The Lion King"
        },
        {
            question: "🕷️ 👨",
            answers: ["Spider-Man", "Batman", "Ant-Man", "Superman"],
            correct: "Spider-Man"
        },
        {
            question: "🦇 👨 🌃",
            answers: ["Batman", "Superman", "Iron Man", "Thor"],
            correct: "Batman"
        },
        {
            question: "👻 🔫",
            answers: ["Ghostbusters", "The Conjuring", "It", "Scream"],
            correct: "Ghostbusters"
        },
        {
            question: "🦖 🏞️",
            answers: ["Jurassic Park", "Godzilla", "King Kong", "Jumanji"],
            correct: "Jurassic Park"
        },
        {
            question: "🐼 🥋",
            answers: ["Kung Fu Panda", "Madagascar", "Shrek", "Mulan"],
            correct: "Kung Fu Panda"
        },
        {
            question: "🚗 ⚡ 🏁",
            answers: ["Cars", "Fast & Furious", "Rush", "Ford v Ferrari"],
            correct: "Cars"
        },
        {
            question: "👽 🌳 🔵",
            answers: ["Avatar", "Alien", "Star Wars", "Dune"],
            correct: "Avatar"
        },
        {
            question: "🧙‍♂️ 💍 🌋",
            answers: [
                "The Lord of the Rings",
                "Harry Potter",
                "The Hobbit",
                "Doctor Strange"
            ],
            correct: "The Lord of the Rings"
        }
  ,
{
            question: "👨‍🎓 👨‍🎓 👨‍🎓",
            answers: ["3 Idiots", "Dil Chahta Hai", "Dangal", "Lagaan"],
            correct: "3 Idiots"
        },
        {
            question: "🤼‍♀️ 👧 👨",
            answers: ["Dangal", "Mary Kom", "Chak De! India", "Bhaag Milkha Bhaag"],
            correct: "Dangal"
        },
        {
            question: "🕶️ 💊 🖥️",
            answers: ["The Matrix", "Inception", "Tron", "Avatar"],
            correct: "The Matrix"
        },
        {
            question: "🌌 🕳️ 👨‍🚀",
            answers: ["Interstellar", "Gravity", "The Martian", "Ad Astra"],
            correct: "Interstellar"
        },
        {
            question: "⛏️ 🥇 👑",
            answers: ["K.G.F: Chapter 1", "Kantara", "KGF: Chapter 2", "Ugramm"],
            correct: "K.G.F: Chapter 1"
        },
        {
            question: "🧑 🐕 ❤️",
            answers: ["777 Charlie", "Kirik Party", "Kantara", "Rakshit Shetty"],
            correct: "777 Charlie"
        }
    ],


    // 💬 GUESS THE DIALOGUE
    dialogue: [
        {
            question: "Which movie is famous for the line: “I'll be back”?",
            answers: [
                "The Terminator",
                "Predator",
                "RoboCop",
                "Rocky"
            ],
            correct: "The Terminator"
        },
        {
            question: "Which movie is associated with the phrase: “May the Force be with you”?",
            answers: [
                "Star Wars",
                "Star Trek",
                "Avatar",
                "Dune"
            ],
            correct: "Star Wars"
        },
        {
            question: "Which movie features the phrase: “Why so serious?”",
            answers: [
                "The Dark Knight",
                "Joker",
                "Batman Begins",
                "Suicide Squad"
            ],
            correct: "The Dark Knight"
        },
        {
            question: "Which movie is known for the phrase: “You can't handle the truth!”?",
            answers: [
                "A Few Good Men",
                "The Godfather",
                "Goodfellas",
                "Scarface"
            ],
            correct: "A Few Good Men"
        },
        {
            question: "Which movie is associated with the phrase: “Houston, we have a problem”?",
            answers: [
                "Apollo 13",
                "Interstellar",
                "Gravity",
                "The Martian"
            ],
            correct: "Apollo 13"
        },
        {
            question: "Which movie is famous for the phrase: “Here's looking at you, kid”?",
            answers: [
                "Casablanca",
                "Titanic",
                "Gone with the Wind",
                "Citizen Kane"
            ],
            correct: "Casablanca"
        },
        {
            question: "Which movie features the phrase: “I see dead people”?",
            answers: [
                "The Sixth Sense",
                "The Conjuring",
                "Insidious",
                "The Exorcist"
            ],
            correct: "The Sixth Sense"
        },
        {
            question: "Which movie is associated with the phrase: “To infinity and beyond!”?",
            answers: [
                "Toy Story",
                "Cars",
                "Finding Nemo",
                "Up"
            ],
            correct: "Toy Story"
        },
        {
            question: "Which movie features the phrase: “You talking to me?”",
            answers: [
                "Taxi Driver",
                "Goodfellas",
                "Scarface",
                "The Godfather"
            ],
            correct: "Taxi Driver"
        },
        {
            question: "Which film is associated with the phrase: “Bond. James Bond.”?",
            answers: [
                "Dr. No",
                "Mission: Impossible",
                "Kingsman",
                "Jason Bourne"
            ],
            correct: "Dr. No"
        }
    ,
{
            question: "Which Hindi film is associated with the phrase: “Mogambo khush hua”?",
            answers: ["Mr. India", "Shahenshah", "Don", "Agneepath"],
            correct: "Mr. India"
        },
        {
            question: "Which Hindi film is associated with the phrase: “Kitne aadmi the?”?",
            answers: ["Sholay", "Deewaar", "Don", "Zanjeer"],
            correct: "Sholay"
        },
        {
            question: "Which Hollywood film is associated with the phrase: “You had me at hello”?",
            answers: ["Jerry Maguire", "Pretty Woman", "Notting Hill", "Forrest Gump"],
            correct: "Jerry Maguire"
        },
        {
            question: "Which Hollywood film is associated with the phrase: “Wax on, wax off”?",
            answers: ["The Karate Kid", "Rocky", "Top Gun", "Rambo: First Blood"],
            correct: "The Karate Kid"
        },
        {
            question: "Which Kannada film is associated with the phrase: “Salaam Rocky Bhai”?",
            answers: ["K.G.F: Chapter 1", "Kantara", "Ugramm", "K.G.F: Chapter 2"],
            correct: "K.G.F: Chapter 1"
        },
        {
            question: "Which Kannada film features the memorable line: “Aa Watchnalli Koti Nenapugalide”?",
            answers: ["Mungaru Male", "Kirik Party", "Googly", "Milana"],
            correct: "Mungaru Male"
        }
    ]

};


// ==========================================
// ELEMENTS
// ==========================================

const gameCards = document.querySelectorAll(".game-card");

const gameSection = document.querySelector(".game-section");
const quizHero = document.querySelector(".quiz-hero");

const quizGame = document.getElementById("quizGame");
const quizResults = document.getElementById("quizResults");

const questionNumber = document.getElementById("questionNumber");
const totalQuestions = document.getElementById("totalQuestions");
const scoreElement = document.getElementById("score");

const progressFill = document.getElementById("progressFill");

const questionIcon = document.getElementById("questionIcon");
const questionCategory = document.getElementById("questionCategory");
const questionText = document.getElementById("questionText");

const answerGrid = document.getElementById("answerGrid");
const answerMessage = document.getElementById("answerMessage");

const exitQuiz = document.getElementById("exitQuiz");
const playAgain = document.getElementById("playAgain");

const finalScore = document.getElementById("finalScore");
const resultTitle = document.getElementById("resultTitle");


// ==========================================
// QUIZ STATE
// ==========================================

let currentMode = "";
let currentQuestions = [];

let currentQuestion = 0;
let score = 0;

let answerLocked = false;


// ==========================================
// MODE INFORMATION
// ==========================================

const modeInfo = {

    movie: {
        icon: "🎬",
        title: "GUESS THE MOVIE"
    },

    actor: {
        icon: "🎭",
        title: "GUESS THE ACTOR"
    },

    emoji: {
        icon: "😂",
        title: "GUESS BY EMOJI"
    },

    dialogue: {
        icon: "💬",
        title: "GUESS THE DIALOGUE"
    }

};


// ==========================================
// SHUFFLE
// ==========================================

function shuffleArray(array) {

    return [...array].sort(() => Math.random() - 0.5);

}


// ==========================================
// START QUIZ
// ==========================================

gameCards.forEach(card => {

    card.addEventListener("click", () => {

        currentMode = card.dataset.mode;

        startQuiz(currentMode);

    });

});


function startQuiz(mode) {

    currentQuestions = shuffleArray(quizData[mode]);

    currentQuestion = 0;
    score = 0;

    scoreElement.textContent = score;
    totalQuestions.textContent = currentQuestions.length;

    gameSection.classList.add("hidden");
    quizHero.classList.add("hidden");
    quizResults.classList.add("hidden");

    quizGame.classList.remove("hidden");

    showQuestion();

}


// ==========================================
// SHOW QUESTION
// ==========================================

function showQuestion() {

    answerLocked = false;

    answerMessage.textContent = "";

    const question = currentQuestions[currentQuestion];

    questionNumber.textContent = currentQuestion + 1;

    scoreElement.textContent = score;

    progressFill.style.width =
        ((currentQuestion + 1) / currentQuestions.length) * 100 + "%";

    questionIcon.textContent =
        modeInfo[currentMode].icon;

    questionCategory.textContent =
        modeInfo[currentMode].title;

    questionText.textContent =
        question.question;

    answerGrid.innerHTML = "";


    // Shuffle answers every time

    const shuffledAnswers =
        shuffleArray(question.answers);


    shuffledAnswers.forEach(answer => {

        const button =
            document.createElement("button");

        button.classList.add("answer-button");

        button.textContent = answer;

        button.addEventListener("click", () => {

            checkAnswer(
                button,
                answer,
                question.correct
            );

        });

        answerGrid.appendChild(button);

    });

}


// ==========================================
// CHECK ANSWER
// ==========================================

function checkAnswer(
    selectedButton,
    selectedAnswer,
    correctAnswer
) {

    if (answerLocked) {
        return;
    }

    answerLocked = true;


    const allButtons =
        document.querySelectorAll(".answer-button");


    allButtons.forEach(button => {

        button.disabled = true;

        if (button.textContent === correctAnswer) {

            button.classList.add("correct");

        }

    });


    if (selectedAnswer === correctAnswer) {

        selectedButton.classList.add("correct");

        answerMessage.textContent =
            "Correct! +10 points 🍿";

        score += 10;

        scoreElement.textContent = score;

    }

    else {

        selectedButton.classList.add("wrong");

        answerMessage.textContent =
            "Wrong! The correct answer was " +
            correctAnswer;

    }


    // Next question automatically

    setTimeout(() => {

        currentQuestion++;

        if (
            currentQuestion <
            currentQuestions.length
        ) {

            showQuestion();

        }

        else {

            showResults();

        }

    }, 1500);

}


// ==========================================
// SHOW RESULTS
// ==========================================

function showResults() {

    quizGame.classList.add("hidden");

    quizResults.classList.remove("hidden");

    finalScore.textContent = score;


    if (score >= 90) {

        resultTitle.textContent =
            "Flop Corn Movie Master 🏆🍿";

    }

    else if (score >= 70) {

        resultTitle.textContent =
            "Cinema Expert 🎬🔥";

    }

    else if (score >= 50) {

        resultTitle.textContent =
            "Movie Fan ⭐🍿";

    }

    else {

        resultTitle.textContent =
            "Movie Rookie 🎞️";

    }

}


// ==========================================
// EXIT QUIZ
// ==========================================

exitQuiz.addEventListener("click", () => {

    quizGame.classList.add("hidden");

    quizResults.classList.add("hidden");

    gameSection.classList.remove("hidden");
    quizHero.classList.remove("hidden");

});


// ==========================================
// PLAY AGAIN
// ==========================================

playAgain.addEventListener("click", () => {

    quizResults.classList.add("hidden");

    gameSection.classList.remove("hidden");
    quizHero.classList.remove("hidden");

});
