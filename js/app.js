// Data

let fieldsData = null;
let subjectsData = null;
let categoriesData = null;
let lessonsData = null;

function fetchAllData() {
    Promise.all([
        fetch('content/fields.json', { cache: 'no-cache' }).then(r => r.json()),
        fetch('content/subjects.json', { cache: 'no-cache' }).then(r => r.json()),
        fetch('content/categories.json', { cache: 'no-cache' }).then(r => r.json()),
        fetch('content/lessons.json', { cache: 'no-cache' }).then(r => r.json()),
    ]).then(([fields, subjects, categories, lessons]) => {
        fieldsData = fields;
        subjectsData = subjects;
        categoriesData = categories;
        lessonsData = lessons;
        loadCourses();
    });
}

// Helper functions

function loadPanel(panelId, items, filterKey, filterValue, cardClass, nextPanelId, onCardClick) {
    const panel = document.getElementById(panelId);
    const nextPanel = document.getElementById(nextPanelId);
    document.querySelectorAll('.' + cardClass).forEach(card => card.remove());

    items.forEach(item => {
        if (item[filterKey] === filterValue) {
            const itemCard = document.createElement('div');
            itemCard.classList.add(cardClass);
            panel.appendChild(itemCard);
            const itemText = document.createElement('h2');
            itemText.textContent = item.name;
            itemCard.appendChild(itemText);
            const itemIcon = document.createElement('img');
            itemIcon.src = item.icon;
            itemCard.appendChild(itemIcon);
            itemCard.addEventListener('click', () => {
                if (nextPanel) {
                    panel.classList.remove('active');
                    nextPanel.classList.add('active');
                }
                if (onCardClick) {
                    onCardClick(item.id);
                }
            });
        }
    });
}

function goBack(currentPanelId, targetPanelId){
    const targetPanel = document.getElementById(targetPanelId);
    const currentPanel = document.getElementById(currentPanelId);

    currentPanel.classList.remove('active');
    targetPanel.classList.add('active');
}

// Loaders

function showTab(){
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const target = button.getAttribute('data-target');

            tabContents.forEach(content => {
                if (content.id === target) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
            tabButtons.forEach(btn => {
                if (btn === button) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        });
    });
}

function loadCourses() {
    const coursesPanel = document.getElementById('courses-panel');

    fieldsData.fields.forEach(field => {
        const card = document.createElement('div');
        card.classList.add('field-card');
        card.style.setProperty('--accent-color', field.color);
        coursesPanel.appendChild(card);
        const cardText = document.createElement('h2');
        cardText.textContent = field.name;
        card.appendChild(cardText);
        const cardIcon = document.createElement('img');
        cardIcon.src = field.icon;
        card.appendChild(cardIcon);
        card.addEventListener('click', () => {
            const subjectsPanel = document.getElementById('subjects-panel');
            coursesPanel.classList.remove('active');
            subjectsPanel.classList.add('active');
            loadSubjects(field.id);
        });
    });
}

function loadSubjects(fieldId) {
    loadPanel('subjects-panel', subjectsData.subjects, 'fieldId', fieldId, 'subject-card', 'categories-panel', loadCategories);
}

function loadCategories(subjectId) {
    loadPanel('categories-panel', categoriesData.categories, 'subjectId', subjectId, 'category-card', 'lessons-panel', loadLessons);
}

function loadLessons(categoryId) {
    loadPanel('lessons-panel', lessonsData.lessons, 'categoryId', categoryId, 'lesson-card', 'lessons-content-panel', loadLesson);
}

function loadLesson(lessonId) {
    document.getElementById('lesson-content').innerHTML = '';
    document.querySelector('#lessons-content-panel .back-button').style.display = '';
    document.getElementById('nav').style.display = 'none';
    fetch('content/lessons/' + lessonId + '.json', { cache: 'no-cache' })
        .then(r => r.json())
        .then(lesson => {
            let index = 0;
            let mistakes = 0;
            function renderNext(wasCorrect) {
                if (wasCorrect === false) {
                    mistakes++;
                }
                if (index >= lesson.blocks.length) {
                    document.querySelector('#lessons-content-panel .back-button').style.display = 'none';
                    showLessonSummary(mistakes, () => {
                        document.getElementById('nav').style.display = '';
                        goBack('lessons-content-panel', 'lessons-panel');
                    });
                    return;
                }
                const block = lesson.blocks[index];
                index++;
                renderBlock(block, renderNext);
            }
            renderNext();
        });
}

// Init

showTab();
fetchAllData();
document.getElementById('home-panel').classList.add('active');
document.querySelector('#nav [data-target="home-panel"]').classList.add('active');
document.querySelector('#subjects-panel .back-button').addEventListener('click', () => {
    goBack('subjects-panel', 'courses-panel');
});
document.querySelector('#categories-panel .back-button').addEventListener('click', () => {
    goBack('categories-panel', 'subjects-panel');
});
document.querySelector('#lessons-panel .back-button').addEventListener('click', () => {
    goBack('lessons-panel', 'categories-panel');
});
document.querySelector('#lessons-content-panel .back-button').addEventListener('click', () => {
    goBack('lessons-content-panel', 'lessons-panel');
    document.getElementById('nav').style.display = '';
});