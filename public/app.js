// Application state
let appState = {
    currentScreen: 'welcome',
    currentSession: null,
    currentProblem: null,
    sessionHistory: [],
    userStats: {
        totalProblems: 0,
        totalCorrect: 0,
        currentStreak: 0,
        bestStreak: 0,
        achievementsUnlocked: []
    },
    timer: null,
    timeRemaining: 0
};

// Data from application_data_json
const gameData = {
    defaultSettings: {
        operations: ["addition", "subtraction", "multiplication", "division", "square", "sqrt", "cbrt", "trigonometry"],
        difficulties: ["beginner", "easy", "intermediate", "hard", "expert"],
        timerOptions: [0, 10, 20, 30, 40, 50, 60, 120, 300],
        problemCounts: [5, 10, 20, 50, 100],
        numberRanges: {
            beginner: [1, 10],
            easy: [1, 50], 
            intermediate: [1, 100],
            hard: [1, 500],
            expert: [1, 1000]
        }
    },
    errorCategories: [
        "calculation_error",
        "careless_mistake", 
        "conceptual_error",
        "time_pressure_error"
    ],
    achievements: [
        {id: "accuracy_80", name: "Getting Better", description: "Achieve 80% accuracy", icon: "🎯"},
        {id: "accuracy_90", name: "Almost Perfect", description: "Achieve 90% accuracy", icon: "⭐"},
        {id: "accuracy_95", name: "Math Master", description: "Achieve 95% accuracy", icon: "🏆"},
        {id: "streak_10", name: "Hot Streak", description: "Get 10 problems correct in a row", icon: "🔥"},
        {id: "streak_25", name: "Unstoppable", description: "Get 25 problems correct in a row", icon: "⚡"},
        {id: "problems_50", name: "Dedicated Learner", description: "Complete 50 problems", icon: "📚"},
        {id: "problems_100", name: "Century Club", description: "Complete 100 problems", icon: "💯"},
        {id: "problems_500", name: "Math Champion", description: "Complete 500 problems", icon: "👑"}
    ],
    encouragingMessages: [
        "Great job!", "Excellent work!", "You're getting better!", "Keep it up!",
        "Fantastic!", "Well done!", "Perfect!", "Outstanding!"
    ],
    helpfulTips: {
        addition: [
            "Break large numbers into smaller parts",
            "Use the number line method for visualization",
            "Remember to carry over when numbers add up to 10 or more"
        ],
        subtraction: [
            "Check if you need to borrow from the next column",
            "Use addition to check your subtraction answers",
            "Count up from the smaller number to the larger number"
        ],
        multiplication: [
            "Learn your times tables by heart",
            "Use the distributive property: 6×14 = 6×10 + 6×4",
            "Check your answer by estimating first"
        ],
        division: [
            "Use multiplication to check your division answers",
            "Start with easier division facts you know",
            "Long division: Divide, Multiply, Subtract, Bring down"
        ],
        square: [
            "Squaring a number means multiplying it by itself.",
            "The last digit of a squared number can only be 0, 1, 4, 5, 6, or 9."
        ],
        sqrt: [
            "Think of a number that, when multiplied by itself, gives the number in the square root.",
            "Estimating is a good way to start."
        ],
        cbrt: [
            "Think of a number that, when multiplied by itself three times, gives the number in the cube root.",
        ],
        trigonometry: [
            "Remember SOH CAH TOA: Sin = Opposite/Hypotenuse, Cos = Adjacent/Hypotenuse, Tan = Opposite/Adjacent.",
            "The unit circle is your friend! It helps you visualize the values of sine and cosine for different angles.",
            "Know the special angles: 0°, 30°, 45°, 60°, 90° and their radian equivalents."
        ]
    }
};

// Screen management
function showScreen(screenId) {
    try {
        // Hide all screens
        const allScreens = document.querySelectorAll('.screen');
        allScreens.forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        const targetScreen = document.getElementById(`${screenId}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            appState.currentScreen = screenId;
            
            // Update screen-specific content
            if (screenId === 'welcome') {
                updateWelcomeStats();
            } else if (screenId === 'progress') {
                updateProgressDisplay();
            } else if (screenId === 'error-analysis') {
                updateErrorAnalysis();
            }
        } else {
            console.error(`Screen not found: ${screenId}-screen`);
        }
    } catch (error) {
        console.error('Error in showScreen:', error);
    }
}

// Session management
function startPracticeSession() {
    try {
        const settings = getSessionSettings();
        if (!validateSettings(settings)) {
            alert('Please select at least one operation type.');
            return;
        }
        
        appState.currentSession = {
            settings: settings,
            problems: [],
            currentProblemIndex: 0,
            startTime: Date.now(),
            correct: 0,
            incorrect: 0,
            streak: 0,
            bestStreak: 0,
            errors: []
        };
        
        generateProblems();
        showScreen('practice');
        loadNextProblem();
    } catch (error) {
        console.error('Error starting practice session:', error);
        alert('Error starting practice session. Please try again.');
    }
}

function getSessionSettings() {
    const operations = [];
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
        operations.push(checkbox.value);
    });
    
    return {
        operations: operations,
        difficulty: document.getElementById('difficulty').value,
        timer: parseInt(document.getElementById('timer').value),
        problemCount: parseInt(document.getElementById('problem-count').value)
    };
}

function validateSettings(settings) {
    return settings.operations && settings.operations.length > 0;
}

// Problem generation
function generateProblems() {
    const session = appState.currentSession;
    const { operations, difficulty, problemCount } = session.settings;
    const range = gameData.defaultSettings.numberRanges[difficulty];
    
    session.problems = [];
    
    for (let i = 0; i < problemCount; i++) {
        const operation = operations[Math.floor(Math.random() * operations.length)];
        const problem = generateSingleProblem(operation, range);
        session.problems.push(problem);
    }
}

function generateSingleProblem(operation, range) {
    const [min, max] = range;
    let num1, num2, answer, display, answerOptions;

    switch (operation) {
        case 'addition':
            num1 = Math.floor(Math.random() * (max - min + 1)) + min;
            num2 = Math.floor(Math.random() * (max - min + 1)) + min;
            answer = num1 + num2;
            display = `${num1} + ${num2}`;
            break;

        case 'subtraction':
            num1 = Math.floor(Math.random() * (max - min + 1)) + min;
            num2 = Math.floor(Math.random() * (num1 - min + 1)) + min;
            answer = num1 - num2;
            display = `${num1} - ${num2}`;
            break;

        case 'multiplication':
            const multMax = Math.min(max, 20); // Keep multiplication reasonable
            num1 = Math.floor(Math.random() * multMax) + 1;
            num2 = Math.floor(Math.random() * multMax) + 1;
            answer = num1 * num2;
            display = `${num1} × ${num2}`;
            break;

        case 'division':
            num2 = Math.floor(Math.random() * 12) + 1; // Divisor 1-12
            answer = Math.floor(Math.random() * 20) + 1; // Quotient 1-20
            num1 = num2 * answer; // Ensure clean division
            display = `${num1} ÷ ${num2}`;
            break;

        case 'square':
            num1 = Math.floor(Math.random() * (Math.min(max, 30) - min + 1)) + min;
            answer = num1 * num1;
            display = `${num1}²`;
            break;

        case 'sqrt':
            answer = Math.floor(Math.random() * (Math.min(max, 30) - min + 1)) + min;
            num1 = answer * answer;
            display = `√${num1}`;
            break;

        case 'cbrt':
            answer = Math.floor(Math.random() * (Math.min(max, 12) - min + 1)) + min;
            num1 = answer * answer * answer;
            display = `∛${num1}`;
            break;

        case 'trigonometry':
            const trigFunctions = ['sin', 'cos', 'tan'];
            const trigFunction = trigFunctions[Math.floor(Math.random() * trigFunctions.length)];
            const unit = Math.random() < 0.5 ? 'deg' : 'rad';

            const specialAngles = [
                { deg: 0, rad: '0', sin: '0', cos: '1', tan: '0' },
                { deg: 30, rad: 'π/6', sin: '1/2', cos: '√3/2', tan: '√3/3' },
                { deg: 45, rad: 'π/4', sin: '√2/2', cos: '√2/2', tan: '1' },
                { deg: 60, rad: 'π/3', sin: '√3/2', cos: '1/2', tan: '√3' },
                { deg: 90, rad: 'π/2', sin: '1', cos: '0', tan: 'undefined' },
                { deg: 120, rad: '2π/3', sin: '√3/2', cos: '-1/2', tan: '-√3' },
                { deg: 135, rad: '3π/4', sin: '√2/2', cos: '-√2/2', tan: '-1' },
                { deg: 150, rad: '5π/6', sin: '1/2', cos: '-√3/2', tan: '-√3/3' },
                { deg: 180, rad: 'π', sin: '0', cos: '-1', tan: '0' },
                { deg: 210, rad: '7π/6', sin: '-1/2', cos: '√3/2', tan: '√3/3' },
                { deg: 225, rad: '5π/4', sin: '-√2/2', cos: '-√2/2', tan: '1' },
                { deg: 240, rad: '4π/3', sin: '-√3/2', cos: '-1/2', tan: '√3' },
                { deg: 270, rad: '3π/2', sin: '-1', cos: '0', tan: 'undefined' },
                { deg: 300, rad: '5π/3', sin: '-√3/2', cos: '1/2', tan: '-√3' },
                { deg: 315, rad: '7π/4', sin: '-√2/2', cos: '√2/2', tan: '-1' },
                { deg: 330, rad: '11π/6', sin: '-1/2', cos: '√3/2', tan: '-√3/3' },
                { deg: 360, rad: '2π', sin: '0', cos: '1', tan: '0' }
            ];

            let angle = specialAngles[Math.floor(Math.random() * specialAngles.length)];
            // Ensure tan is not undefined
            while (trigFunction === 'tan' && angle.tan === 'undefined') {
                angle = specialAngles[Math.floor(Math.random() * specialAngles.length)];
            }

            if (unit === 'deg') {
                display = `${trigFunction}(${angle.deg}°)`;
            } else {
                display = `${trigFunction}(${angle.rad})`;
            }

            answer = angle[trigFunction];

            const allAnswers = ['0', '1/2', '√2/2', '√3/2', '1', '-1/2', '-√2/2', '-√3/2', '-1', '√3/3', '√3', '-√3/3', '-√3'];
            answerOptions = [answer];
            while (answerOptions.length < 4) {
                const randomAnswer = allAnswers[Math.floor(Math.random() * allAnswers.length)];
                if (!answerOptions.includes(randomAnswer)) {
                    answerOptions.push(randomAnswer);
                }
            }
            answerOptions = answerOptions.sort(() => Math.random() - 0.5);

            break;
    }

    return {
        operation,
        num1,
        num2,
        answer,
        display,
        answerOptions,
        timeStarted: null,
        timeEnded: null,
        userAnswer: null,
        correct: false
    };
}

// Problem display and interaction
function loadNextProblem() {
    try {
        const session = appState.currentSession;

        if (session.currentProblemIndex >= session.problems.length) {
            endSession();
            return;
        }

        appState.currentProblem = session.problems[session.currentProblemIndex];
        appState.currentProblem.timeStarted = Date.now();

        // Update display
        document.getElementById('problem-text').textContent = `${appState.currentProblem.display} = ?`;
        document.getElementById('problem-counter').textContent =
            `Problem ${session.currentProblemIndex + 1} of ${session.problems.length}`;

        // Update progress bar
        const progressPercent = ((session.currentProblemIndex) / session.problems.length) * 100;
        document.getElementById('progress-fill').style.width = `${progressPercent}%`;

        // Clear previous answer and feedback
        const answerInput = document.getElementById('answer-input');
        const multipleChoiceAnswers = document.getElementById('multiple-choice-answers');
        const submitButton = document.querySelector('.answer-section .btn');

        answerInput.value = '';
        answerInput.focus();
        multipleChoiceAnswers.innerHTML = '';
        document.getElementById('feedback').classList.add('hidden');
        document.getElementById('next-button').classList.add('hidden');
        submitButton.disabled = false;

        if (appState.currentProblem.operation === 'trigonometry') {
            answerInput.style.display = 'none';
            submitButton.style.display = 'none';
            multipleChoiceAnswers.style.display = 'grid';

            appState.currentProblem.answerOptions.forEach(option => {
                const button = document.createElement('button');
                button.className = 'btn btn--secondary';
                button.innerHTML = option;
                button.onclick = () => checkAnswer(option);
                multipleChoiceAnswers.appendChild(button);
            });
        } else {
            answerInput.style.display = 'block';
            submitButton.style.display = 'block';
            multipleChoiceAnswers.style.display = 'none';
        }

        // Update session stats
        updateSessionStats();

        // Start timer if enabled
        if (session.settings.timer > 0) {
            startProblemTimer();
        } else {
            document.getElementById('problem-timer').textContent = '';
        }
    } catch (error) {
        console.error('Error loading next problem:', error);
    }
}

function updateSessionStats() {
    const session = appState.currentSession;
    const totalAnswered = session.correct + session.incorrect;
    const accuracy = totalAnswered > 0 ? Math.round((session.correct / totalAnswered) * 100) : 100;

    document.getElementById('current-accuracy').textContent = `${accuracy}%`;
    document.getElementById('session-streak').textContent = session.streak;
}

function startProblemTimer() {
    const session = appState.currentSession;
    appState.timeRemaining = session.settings.timer;

    updateTimerDisplay();

    appState.timer = setInterval(() => {
        appState.timeRemaining--;
        updateTimerDisplay();

        if (appState.timeRemaining <= 0) {
            clearInterval(appState.timer);
            timeoutAnswer();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(appState.timeRemaining / 60);
    const seconds = appState.timeRemaining % 60;
    document.getElementById('problem-timer').textContent =
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function timeoutAnswer() {
    const session = appState.currentSession;
    const problem = appState.currentProblem;

    problem.timeEnded = Date.now();
    problem.userAnswer = null;
    problem.correct = false;

    session.incorrect++;
    session.streak = 0;

    // Record error
    session.errors.push({
        problem: problem,
        category: 'time_pressure_error',
        userAnswer: 'No answer (timeout)'
    });

    showFeedback(false, 'Time\'s up!', `The correct answer was ${problem.answer}`);

    appState.userStats.totalProblems++;
    saveUserStats();
    updateSessionStats();
}

// Answer checking
function checkAnswer(selectedAnswer) {
    try {
        let userAnswer;
        if (selectedAnswer) {
            userAnswer = selectedAnswer;
        } else {
            userAnswer = document.getElementById('answer-input').value.trim();
        }

        if (userAnswer === '') {
            alert('Please enter an answer.');
            return;
        }

        if (appState.timer) {
            clearInterval(appState.timer);
        }

        const session = appState.currentSession;
        const problem = appState.currentProblem;

        problem.timeEnded = Date.now();
        problem.userAnswer = userAnswer;
        if (problem.operation === 'trigonometry') {
            problem.correct = userAnswer === problem.answer;
        } else {
            problem.correct = parseFloat(userAnswer) === problem.answer;
        }

        if (problem.correct) {
            session.correct++;
            session.streak++;
            session.bestStreak = Math.max(session.bestStreak, session.streak);
            appState.userStats.currentStreak++;
            appState.userStats.bestStreak = Math.max(appState.userStats.bestStreak, appState.userStats.currentStreak);

            const message = gameData.encouragingMessages[Math.floor(Math.random() * gameData.encouragingMessages.length)];
            showFeedback(true, message);

            // Check for streak achievements
            checkStreakAchievements();
            
            setTimeout(nextProblem, 1000);
        } else {
            session.incorrect++;
            session.streak = 0;
            appState.userStats.currentStreak = 0;

            // Categorize error
            const errorCategory = categorizeError(problem, userAnswer);
            session.errors.push({
                problem: problem,
                category: errorCategory,
                userAnswer: userAnswer
            });

            showFeedback(false, 'Not quite right.', `The correct answer is ${problem.answer}`);
            
            setTimeout(() => {
                document.getElementById('next-button').classList.remove('hidden');
            }, 200);
        }

        appState.userStats.totalProblems++;
        appState.userStats.totalCorrect += problem.correct ? 1 : 0;
        saveUserStats();

        updateSessionStats();

        // Disable submit button
        if (problem.operation === 'trigonometry') {
            const answerButtons = document.querySelectorAll('#multiple-choice-answers .btn');
            answerButtons.forEach(button => {
                button.disabled = true;
                if (button.innerHTML === problem.answer) {
                    button.classList.add('correct');
                } else if (button.innerHTML === userAnswer) {
                    button.classList.add('incorrect');
                }
            });
        } else {
            const submitButton = document.querySelector('.answer-section .btn');
            if(submitButton) {
                submitButton.disabled = true;
            }
        }
    } catch (error) {
        console.error('Error checking answer:', error);
    }
}


function categorizeError(problem, userAnswer) {
    const diff = Math.abs(parseFloat(userAnswer) - problem.answer);
    
    if (problem.timeEnded - problem.timeStarted < 3000) {
        return 'time_pressure_error';
    } else if (diff === 1) {
        return 'careless_mistake';
    } else if (diff > problem.answer * 0.5) {
        return 'conceptual_error';
    } else {
        return 'calculation_error';
    }
}

function showFeedback(correct, message, explanation = '') {
    const feedback = document.getElementById('feedback');
    const icon = document.getElementById('feedback-icon');
    const messageEl = document.getElementById('feedback-message');
    const explanationEl = document.getElementById('feedback-explanation');
    
    feedback.className = correct ? 'feedback correct' : 'feedback incorrect';
    icon.textContent = correct ? '✓' : '✗';
    messageEl.textContent = message;
    
    if (explanation) {
        explanationEl.textContent = explanation;
        explanationEl.classList.remove('hidden');
    } else {
        explanationEl.classList.add('hidden');
    }
    
    feedback.classList.remove('hidden');
}

// Navigation
function nextProblem() {
    const session = appState.currentSession;
    session.currentProblemIndex++;
    
    if (session.currentProblemIndex >= session.problems.length) {
        endSession();
    } else {
        loadNextProblem();
    }
}

function endSession() {
    try {
        if (appState.timer) {
            clearInterval(appState.timer);
        }
        
        const session = appState.currentSession;
        session.endTime = Date.now();
        
        // Calculate final stats
        const totalTime = (session.endTime - session.startTime) / 1000;
        const averageTime = totalTime / session.problems.length;
        const totalAnswered = session.correct + session.incorrect;
        const accuracy = totalAnswered > 0 ? (session.correct / totalAnswered) * 100 : 0;
        
        // Save to history
        appState.sessionHistory.push({
            date: new Date().toLocaleDateString(),
            accuracy: Math.round(accuracy),
            problemsCorrect: session.correct,
            totalProblems: session.problems.length,
            averageTime: averageTime.toFixed(1),
            bestStreak: session.bestStreak,
            operations: session.settings.operations.join(', '),
            difficulty: session.settings.difficulty
        });
        
        // Check achievements
        const newAchievements = checkAchievements(accuracy);
        
        // Update results screen
        updateResultsScreen(session, accuracy, averageTime, newAchievements);
        showScreen('results');
    } catch (error) {
        console.error('Error ending session:', error);
    }
}

// Results and achievements
function updateResultsScreen(session, accuracy, averageTime, newAchievements) {
    document.getElementById('final-accuracy').textContent = `${Math.round(accuracy)}%`;
    document.getElementById('problems-correct').textContent = `${session.correct}/${session.problems.length}`;
    document.getElementById('average-time').textContent = `${averageTime.toFixed(1)}s`;
    document.getElementById('best-streak').textContent = session.bestStreak;
    
    // Show achievements
    const achievementsSection = document.getElementById('achievements-section');
    const achievementsList = document.getElementById('new-achievements');
    
    if (newAchievements.length > 0) {
        achievementsSection.style.display = 'block';
        achievementsList.innerHTML = '';
        
        newAchievements.forEach(achievement => {
            const badge = createAchievementBadge(achievement);
            achievementsList.appendChild(badge);
        });
    } else {
        achievementsSection.style.display = 'none';
    }
}

function checkAchievements(accuracy) {
    const newAchievements = [];
    let statsChanged = false;
    
    gameData.achievements.forEach(achievement => {
        if (appState.userStats.achievementsUnlocked.includes(achievement.id)) {
            return;
        }
        
        let unlocked = false;
        
        switch (achievement.id) {
            case 'accuracy_80':
                unlocked = accuracy >= 80;
                break;
            case 'accuracy_90':
                unlocked = accuracy >= 90;
                break;
            case 'accuracy_95':
                unlocked = accuracy >= 95;
                break;
            case 'streak_10':
                unlocked = appState.userStats.bestStreak >= 10;
                break;
            case 'streak_25':
                unlocked = appState.userStats.bestStreak >= 25;
                break;
            case 'problems_50':
                unlocked = appState.userStats.totalProblems >= 50;
                break;
            case 'problems_100':
                unlocked = appState.userStats.totalProblems >= 100;
                break;
            case 'problems_500':
                unlocked = appState.userStats.totalProblems >= 500;
                break;
        }
        
        if (unlocked) {
            appState.userStats.achievementsUnlocked.push(achievement.id);
            newAchievements.push(achievement);
            statsChanged = true;
        }
    });
    
    if (statsChanged) {
        saveUserStats();
    }
    
    return newAchievements;
}

function checkStreakAchievements() {
    const streak = appState.userStats.currentStreak;
    let achievementUnlocked = false;
    
    if ((streak === 10 && !appState.userStats.achievementsUnlocked.includes('streak_10')) ||
        (streak === 25 && !appState.userStats.achievementsUnlocked.includes('streak_25'))) {
        
        const achievement = gameData.achievements.find(a => 
            (a.id === 'streak_10' && streak === 10) || 
            (a.id === 'streak_25' && streak === 25)
        );
        
        if (achievement && !appState.userStats.achievementsUnlocked.includes(achievement.id)) {
            appState.userStats.achievementsUnlocked.push(achievement.id);
            showAchievementModal(achievement);
            achievementUnlocked = true;
        }
    }

    if (achievementUnlocked) {
        saveUserStats();
    }
}

function createAchievementBadge(achievement) {
    const badge = document.createElement('div');
    badge.className = 'achievement-badge';
    badge.innerHTML = `
        <span class="icon">${achievement.icon}</span>
        <div class="name">${achievement.name}</div>
        <div class="description">${achievement.description}</div>
    `;
    return badge;
}

function showAchievementModal(achievement) {
    document.getElementById('achievement-name').textContent = achievement.name;
    document.getElementById('achievement-description').textContent = achievement.description;
    document.querySelector('.achievement-icon').textContent = achievement.icon;
    document.getElementById('achievement-modal').classList.remove('hidden');
}

function closeAchievementModal() {
    document.getElementById('achievement-modal').classList.add('hidden');
}

// Error analysis
function updateErrorAnalysis() {
    if (!appState.currentSession) return;
    
    const session = appState.currentSession;
    const errors = session.errors;
    
    document.getElementById('total-errors').textContent = errors.length;
    const errorRate = ((errors.length / session.problems.length) * 100).toFixed(0);
    document.getElementById('error-rate').textContent = `${errorRate}%`;
    
    // Error categories
    const categoryList = document.getElementById('error-category-list');
    categoryList.innerHTML = '';
    
    const categoryCounts = {};
    errors.forEach(error => {
        categoryCounts[error.category] = (categoryCounts[error.category] || 0) + 1;
    });
    
    Object.entries(categoryCounts).forEach(([category, count]) => {
        const item = document.createElement('div');
        item.className = 'category-item';
        item.innerHTML = `
            <span>${formatCategoryName(category)}</span>
            <span>${count} error${count !== 1 ? 's' : ''}</span>
        `;
        categoryList.appendChild(item);
    });
    
    // Missed problems
    const problemsList = document.getElementById('missed-problems-list');
    problemsList.innerHTML = '';
    
    errors.forEach(error => {
        const item = document.createElement('div');
        item.className = 'problem-item';
        item.innerHTML = `
            <span>${error.problem.display} = ${error.problem.answer}</span>
            <span>Your answer: ${error.userAnswer}</span>
        `;
        problemsList.appendChild(item);
    });
    
    // Tips
    const tipsList = document.getElementById('tips-list');
    tipsList.innerHTML = '';
    
    const operations = [...new Set(errors.map(e => e.problem.operation))];
    operations.forEach(operation => {
        const tips = gameData.helpfulTips[operation];
        if (tips) {
            tips.forEach(tip => {
                const item = document.createElement('div');
                item.className = 'tip-item';
                item.textContent = tip;
                tipsList.appendChild(item);
            });
        }
    });
}

function formatCategoryName(category) {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Progress and statistics
function updateWelcomeStats() {
    try {
        document.getElementById('total-problems-solved').textContent = appState.userStats.totalProblems;
        
        const accuracy = appState.userStats.totalProblems > 0 ? 
            Math.round((appState.userStats.totalCorrect / appState.userStats.totalProblems) * 100) : 0;
        document.getElementById('overall-accuracy').textContent = `${accuracy}%`;
        document.getElementById('current-streak').textContent = appState.userStats.currentStreak;
    } catch (error) {
        console.error('Error updating welcome stats:', error);
    }
}

function updateProgressDisplay() {
    try {
        // Update overview stats
        document.getElementById('lifetime-problems').textContent = appState.userStats.totalProblems;
        
        const accuracy = appState.userStats.totalProblems > 0 ? 
            Math.round((appState.userStats.totalCorrect / appState.userStats.totalProblems) * 100) : 0;
        document.getElementById('lifetime-accuracy').textContent = `${accuracy}%`;
        document.getElementById('sessions-completed').textContent = appState.sessionHistory.length;
        
        // Update achievements display
        const achievementsGrid = document.getElementById('all-achievements');
        achievementsGrid.innerHTML = '';
        
        gameData.achievements.forEach(achievement => {
            const unlocked = appState.userStats.achievementsUnlocked.includes(achievement.id);
            const item = document.createElement('div');
            item.className = `achievement-item ${unlocked ? '' : 'locked'}`;
            item.innerHTML = `
                <span class="icon">${achievement.icon}</span>
                <div class="name">${achievement.name}</div>
                <div class="description">${achievement.description}</div>
            `;
            achievementsGrid.appendChild(item);
        });
        
        // Update session history
        const sessionList = document.getElementById('session-history');
        sessionList.innerHTML = '';
        
        const recentSessions = appState.sessionHistory.slice(-5).reverse();
        recentSessions.forEach(session => {
            const item = document.createElement('div');
            item.className = 'session-item';
            item.innerHTML = `
                <div class="session-info">
                    <span class="session-date">${session.date}</span>
                    <span class="status status--info">${session.operations}</span>
                </div>
                <div class="session-stats">
                    <span>${session.accuracy}% accuracy</span>
                    <span>${session.problemsCorrect}/${session.totalProblems} correct</span>
                </div>
            `;
            sessionList.appendChild(item);
        });
    } catch (error) {
        console.error('Error updating progress display:', error);
    }
}

// Practice weak areas
function practiceWeakAreas() {
    if (!appState.currentSession || appState.currentSession.errors.length === 0) {
        alert('No errors to practice!');
        return;
    }
    
    // Set up practice session with similar problems
    const errors = appState.currentSession.errors;
    const operations = [...new Set(errors.map(e => e.problem.operation))];
    
    // Update settings checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = operations.includes(checkbox.value);
    });
    
    showScreen('settings');
}

// Initialize the application
function initApp() {
    try {
        loadUserStats();
        updateWelcomeStats();
        
        // Add enter key support for answer input
        const answerInput = document.getElementById('answer-input');
        if (answerInput) {
            answerInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const nextButton = document.getElementById('next-button');
                    if (!nextButton.classList.contains('hidden')) {
                        nextProblem();
                    } else {
                        checkAnswer();
                    }
                }
            });
        }
        
        console.log('Math Calculator Trainer initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

// Function to save user stats to localStorage
function saveUserStats() {
    try {
        localStorage.setItem('mathTrainer.userStats', JSON.stringify(appState.userStats));
    } catch (error) {
        console.error('Error saving user stats:', error);
    }
}

// Function to load user stats from localStorage
function loadUserStats() {
    try {
        const savedStats = localStorage.getItem('mathTrainer.userStats');
        if (savedStats) {
            appState.userStats = JSON.parse(savedStats);
        }
    } catch (error) {
        console.error('Error loading user stats:', error);
    }
}

// Make functions globally available
window.showScreen = showScreen;
window.startPracticeSession = startPracticeSession;
window.checkAnswer = checkAnswer;
window.nextProblem = nextProblem;
window.endSession = endSession;
window.closeAchievementModal = closeAchievementModal;
window.practiceWeakAreas = practiceWeakAreas;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initApp);