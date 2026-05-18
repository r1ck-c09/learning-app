const lessonContent = document.getElementById('lesson-content')

// helpers

function levenshtein(a, b) {
    const dp = [];
    for (let i = 0; i <= a.length; i++) {
        dp[i] = [i];
        for (let j = 1; j <= b.length; j++) {
            dp[i][j] = i === 0 ? j :
                Math.min(
                    dp[i - 1][j] + 1,
                    dp[i][j - 1] + 1,
                    dp[i - 1][j - 1] + (a[i - 1] !== b[j - 1] ? 1 : 0)
                );
        }
    }
    return dp[a.length][b.length];
}

// renderers

function renderBlock(block) {
    if (block.type === "text") {
        const blockText = document.createElement('p');
        blockText.textContent = block.content; 
        lessonContent.appendChild(blockText);
    } else {
        renderQuestion(block.question);
    }
}

function renderQuestion(question) {
    switch (question.type) {
        case "multiple-choice":
            renderMultipleChoice(question);
            break;
        case "fill-in-the-blank":
            renderFillInTheBlank(question);
            break;
        case "matching-pairs":
            // TODO renderMatchingPairs(question);
            break;
        case "ordering":
            // TODO renderOrdering(question);
            break;
    }
}

function renderMultipleChoice(question) {
    let chosenIndex = null;
    const questionElement = document.createElement('div');
    const questionText = document.createElement('p');
    questionText.textContent = question.question; 
    questionElement.appendChild(questionText);
    question.options.forEach((option, index) => {
        const questionOption = document.createElement('button');
        questionOption.textContent = option;
        questionElement.appendChild(questionOption);
        questionOption.addEventListener('click', () => {
            questionElement.querySelectorAll('.selected').forEach(btn => btn.classList.remove('selected'));
            questionOption.classList.add('selected');
            chosenIndex = index;
            checkAnswer.disabled = false;
        });
    });
    const checkAnswer = document.createElement('button');
    checkAnswer.disabled = true;
    checkAnswer.textContent = "Check";
    questionElement.appendChild(checkAnswer);
    checkAnswer.addEventListener('click', () => {
        if (chosenIndex === question.answer) {
            const checkmark = document.createElement('p');
            checkmark.textContent = "✓";
            questionElement.appendChild(checkmark);
            checkmark.classList.add('correct');
        } else {
            const cross = document.createElement('p');
            cross.textContent = "✗";
            questionElement.appendChild(cross);
            cross.classList.add('incorrect');
        }
        checkAnswer.disabled = true; 
    });
    lessonContent.appendChild(questionElement);
}

function renderFillInTheBlank(question) {
    const questionElement = document.createElement('div');
    const questionText = document.createElement('p');
    questionText.textContent = question.question; 
    questionElement.appendChild(questionText);
    const answerField = document.createElement('input');
    questionElement.appendChild(answerField);
    const checkAnswer = document.createElement('button');
    checkAnswer.disabled = true;
    checkAnswer.textContent = "Check";
    questionElement.appendChild(checkAnswer);
    answerField.addEventListener('input', () => {
      if (answerField.value) {
        checkAnswer.disabled = false;
      } else {
        checkAnswer.disabled = true;
      }
    });
    checkAnswer.addEventListener('click', () => {
        if (levenshtein(answerField.value.toLowerCase(), question.answer.toLowerCase()) <= 2) {
            const checkmark = document.createElement('p');
            checkmark.textContent = "✓";
            questionElement.appendChild(checkmark);
            checkmark.classList.add('correct');
        } else {
            const cross = document.createElement('p');
            cross.textContent = "✗";
            questionElement.appendChild(cross);
            cross.classList.add('incorrect');
        }
        checkAnswer.disabled = true; 
    });
    lessonContent.appendChild(questionElement);
}