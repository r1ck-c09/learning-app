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

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function showFeedbackBar(isCorrect, correctAnswer, explanation, onContinue) {
    const feedbackBar = document.createElement('div');
    const continueButton = document.createElement('button');
    const answerText = document.createElement('p');
    answerText.textContent = isCorrect ? "Correct!" : `Incorrect. Correct answer: ${correctAnswer}`;
    continueButton.textContent = "Continue";
    continueButton.addEventListener('click', () => {
        feedbackBar.remove();
        onContinue(isCorrect);
    });
    feedbackBar.classList.add('feedback-bar');
    if (isCorrect) {
        feedbackBar.classList.add('correct');
    } else {
        feedbackBar.classList.add('incorrect');
    }
    feedbackBar.appendChild(answerText);
    if (explanation) {
        const explanationText = document.createElement('p');
        explanationText.textContent = explanation;
        feedbackBar.appendChild(explanationText);
    }
    feedbackBar.appendChild(continueButton);
    lessonContent.appendChild(feedbackBar);
}

// renderers

function renderBlock(block, onContinue) {
    if (block.type === "text") {
        const blockText = document.createElement('p');
        const continueButton = document.createElement('button');
        continueButton.textContent = "Continue";
        blockText.textContent = block.content; 
        lessonContent.appendChild(blockText);
        lessonContent.appendChild(continueButton);
        continueButton.addEventListener('click', () => {
            continueButton.remove();
            onContinue(true);
        });
    } else {
        renderQuestion(block.question, onContinue);
    }
}

function renderQuestion(question, onContinue) {
    switch (question.type) {
        case "multiple-choice":
            renderMultipleChoice(question, onContinue);
            break;
        case "fill-in-the-blank":
            renderFillInTheBlank(question, onContinue);
            break;
        case "matching-pairs":
            renderMatchingPairs(question, onContinue);
            break;
        case "ordering":
            renderOrdering(question, onContinue);
            break;
        default:
            console.warn('Unknown question type:', question.type);
    }
}

function renderMultipleChoice(question, onContinue) {
    let chosenIndex = null;
    let alreadyAnswered = false;

    const questionElement = document.createElement('div');
    const questionText = document.createElement('p');
    const checkAnswer = document.createElement('button');

    questionText.textContent = question.question;
    checkAnswer.textContent = "Check";
    checkAnswer.disabled = true;

    questionElement.appendChild(questionText);
    question.options.forEach((option, index) => {
        const questionOption = document.createElement('button');
        questionOption.textContent = option;
        questionOption.addEventListener('click', () => {
            if (alreadyAnswered) return;
            questionElement.querySelectorAll('.selected').forEach(btn => btn.classList.remove('selected'));
            questionOption.classList.add('selected');
            chosenIndex = index;
            checkAnswer.disabled = false;
        });
        questionElement.appendChild(questionOption);
    });

    checkAnswer.addEventListener('click', () => {
        showFeedbackBar(chosenIndex === question.answer, question.options[question.answer], question.explanation, onContinue);
        questionElement.querySelectorAll('button').forEach(btn => btn.disabled = true);
        alreadyAnswered = true;
    });

    questionElement.appendChild(checkAnswer);
    lessonContent.appendChild(questionElement);
}

function renderFillInTheBlank(question, onContinue) {
    let alreadyAnswered = false;

    const questionElement = document.createElement('div');
    const questionText = document.createElement('p');
    const answerField = document.createElement('input');
    const checkAnswer = document.createElement('button');

    questionText.textContent = question.question;
    checkAnswer.textContent = "Check";
    checkAnswer.disabled = true;

    answerField.addEventListener('input', () => {
        if (answerField.value && !alreadyAnswered) {
            checkAnswer.disabled = false;
        } else {
            checkAnswer.disabled = true;
        }
    });

    checkAnswer.addEventListener('click', () => {
        showFeedbackBar(levenshtein(answerField.value.toLowerCase(), question.answer.toLowerCase()) <= 2, question.answer, question.explanation, onContinue);
        checkAnswer.disabled = true;
        answerField.disabled = true;
        alreadyAnswered = true;
    });

    questionElement.appendChild(questionText);
    questionElement.appendChild(answerField);
    questionElement.appendChild(checkAnswer);
    lessonContent.appendChild(questionElement);
}

function renderMatchingPairs(question, onContinue) {
    let selectedItem = null;
    let matchedPairs = 0;

    const questionElement = document.createElement('div');
    const questionText = document.createElement('p');
    const leftCol = document.createElement('div');
    const rightCol = document.createElement('div');

    questionText.textContent = question.question;
    const rightValues = shuffle(question.pairs.map(p => p.right));

    for (let i = 0; i < question.pairs.length; i++) {
        const leftButton = document.createElement('button');
        const rightButton = document.createElement('button');
        leftButton.textContent = question.pairs[i].left; 
        rightButton.textContent = rightValues[i];
        leftButton.addEventListener('click', () => {
            if (selectedItem === null) {
                leftButton.classList.add('selected');
                selectedItem = {text: leftButton.textContent, side: "left", element: leftButton};
            }
            else if (selectedItem.side === "left") {
                selectedItem.element.classList.remove('selected');
                leftButton.classList.add('selected');
                selectedItem = {text: leftButton.textContent, side: "left", element: leftButton};
            }
            else if (selectedItem.side === "right") {
                const pair = question.pairs.find(p => p.left === leftButton.textContent);
                const matchedElement = selectedItem.element;
                if (pair.right === selectedItem.text) {
                    leftButton.classList.add('correct');
                    matchedElement.classList.add('correct');
                    selectedItem = null;
                    matchedPairs++;
                    setTimeout(() => {
                        leftButton.disabled = true;
                        matchedElement.disabled = true;
                        leftButton.classList.remove('correct');
                        matchedElement.classList.remove('correct');
                        leftButton.classList.add('inactive');
                        matchedElement.classList.add('inactive');
                        if (matchedPairs === question.pairs.length) onContinue(true);
                    }, 1000);
                } else {
                    leftButton.classList.add('incorrect');
                    matchedElement.classList.add('incorrect');
                    selectedItem = null;
                    setTimeout(() => {
                        leftButton.classList.remove('incorrect');
                        matchedElement.classList.remove('incorrect');
                    }, 1000);
                }
            }
        });

        rightButton.addEventListener('click', () => {
            if (selectedItem === null) {
                rightButton.classList.add('selected');
                selectedItem = {text: rightButton.textContent, side: "right", element: rightButton};
            }
            else if (selectedItem.side === "right") {
                selectedItem.element.classList.remove('selected');
                rightButton.classList.add('selected');
                selectedItem = {text: rightButton.textContent, side: "right", element: rightButton};
            }
            else if (selectedItem.side === "left") {
                const pair = question.pairs.find(p => p.right === rightButton.textContent);
                const matchedElement = selectedItem.element;
                if (pair.left === selectedItem.text) {
                    rightButton.classList.add('correct');
                    matchedElement.classList.add('correct');
                    selectedItem = null;
                    matchedPairs++;
                    setTimeout(() => {
                        rightButton.disabled = true;
                        matchedElement.disabled = true;
                        rightButton.classList.remove('correct');
                        matchedElement.classList.remove('correct');
                        rightButton.classList.add('inactive');
                        matchedElement.classList.add('inactive');
                        if (matchedPairs === question.pairs.length) onContinue(true);
                    }, 1000);
                } else {
                    rightButton.classList.add('incorrect');
                    matchedElement.classList.add('incorrect');
                    selectedItem = null;
                    setTimeout(() => {
                        rightButton.classList.remove('incorrect');
                        matchedElement.classList.remove('incorrect');
                    }, 1000);
                }
            }
        });
        
        leftCol.appendChild(leftButton);
        rightCol.appendChild(rightButton);
    }
    questionElement.appendChild(questionText);
    questionElement.appendChild(leftCol);
    questionElement.appendChild(rightCol);
    lessonContent.appendChild(questionElement);
  }

function renderOrdering(question, onContinue) {
    let draggedItem = null;
    let touchClone = null;
    let touchOffsetX = 0;
    let touchOffsetY = 0;
    let alreadyAnswered = false;

    const questionElement = document.createElement('div');
    const questionText = document.createElement('p');
    const list = document.createElement('ul');
    const checkAnswer = document.createElement('button');

    questionText.textContent = question.question;
    checkAnswer.textContent = "Check";

    const shuffledItems = shuffle([...question.items]);
    shuffledItems.forEach(text => {
        const li = document.createElement('li');
        li.textContent = text;
        li.draggable = true;

        li.addEventListener('dragstart', () => {
            if (alreadyAnswered) return;
            draggedItem = li;
            setTimeout(() => li.classList.add('dragging'), 0);
        });

        li.addEventListener('dragend', () => {
            li.classList.remove('dragging');
            draggedItem = null;
        });

        li.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (!draggedItem || draggedItem === li) return;
            const rect = li.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;
            if (e.clientY < midY) {
                list.insertBefore(draggedItem, li);
            } else {
                list.insertBefore(draggedItem, li.nextSibling);
            }
        });

        li.addEventListener('touchstart', (e) => {
            if (alreadyAnswered) return;
            draggedItem = li;
            const touch = e.touches[0];
            const rect = li.getBoundingClientRect();
            touchOffsetX = touch.clientX - rect.left;
            touchOffsetY = touch.clientY - rect.top;
            touchClone = li.cloneNode(true);
            touchClone.style.position = 'fixed';
            touchClone.style.width = rect.width + 'px';
            touchClone.style.opacity = '0.8';
            touchClone.style.pointerEvents = 'none';
            touchClone.style.left = (touch.clientX - touchOffsetX) + 'px';
            touchClone.style.top = (touch.clientY - touchOffsetY) + 'px';
            document.body.appendChild(touchClone);
            li.classList.add('dragging');
        }, { passive: true });

        li.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!touchClone) return;
            const touch = e.touches[0];
            touchClone.style.left = (touch.clientX - touchOffsetX) + 'px';
            touchClone.style.top = (touch.clientY - touchOffsetY) + 'px';
            const target = document.elementFromPoint(touch.clientX, touch.clientY);
            if (target && target.tagName === 'LI' && target !== draggedItem) {
                const rect = target.getBoundingClientRect();
                const midY = rect.top + rect.height / 2;
                if (touch.clientY < midY) {
                    list.insertBefore(draggedItem, target);
                } else {
                    list.insertBefore(draggedItem, target.nextSibling);
                }
            }
        });

        li.addEventListener('touchend', () => {
            if (alreadyAnswered) return;
            if (touchClone) {
                document.body.removeChild(touchClone);
                touchClone = null;
            }
            draggedItem.classList.remove('dragging');
            draggedItem = null;
        });

        list.appendChild(li);
    });

    checkAnswer.addEventListener('click', () => {
        const currentOrder = [...list.querySelectorAll('li')].map(li => li.textContent);
        const correct = question.items.every((item, i) => item === currentOrder[i]);
        showFeedbackBar(correct, question.items.join(' → '), question.explanation, onContinue);
        checkAnswer.disabled = true;
        alreadyAnswered = true;
        list.querySelectorAll('li').forEach(item => item.draggable = false);
    });

    questionElement.appendChild(questionText);
    questionElement.appendChild(list);
    questionElement.appendChild(checkAnswer);
    lessonContent.appendChild(questionElement);
}

function showLessonSummary(mistakes, onContinue) {
    lessonContent.innerHTML = '';
    const summaryPage = document.createElement('div');
    const summaryText = document.createElement('p');
    const continueButton = document.createElement('button');
    summaryText.textContent = `Lesson completed! You made ${mistakes} mistake(s).`;
    continueButton.textContent = "Back to lessons";
    continueButton.addEventListener('click', () => {
        onContinue();
    });
    summaryPage.appendChild(summaryText);
    summaryPage.appendChild(continueButton);
    lessonContent.appendChild(summaryPage);
}