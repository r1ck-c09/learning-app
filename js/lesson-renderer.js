const lessonContent = document.getElementById('lesson-content')

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
        case "flashcard":
            // TODO renderFlashcard(question);
            break;
        case "fill-in-the-blank":
            // TODO renderFillInTheBlank(question);
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
        });
    });
    const checkAnswer = document.createElement('button');
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
    });
    lessonContent.appendChild(questionElement);
}