// Data

let fieldsData = null;
let subjectsData = null;
let categoriesData = null;
let lessonsData = null;

function fetchAllData() {
    Promise.all([
        fetch('content/fields.json').then(r => r.json()),
        fetch('content/subjects.json').then(r => r.json()),
        fetch('content/categories.json').then(r => r.json()),
        fetch('content/lessons.json').then(r => r.json()),
    ]).then(([fields, subjects, categories, lessons]) => {
        fieldsData = fields;
        subjectsData = subjects;
        categoriesData = categories;
        lessonsData = lessons;
        loadCourses();
    });
}

// Helper functions

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
    const subjectsPanel = document.getElementById('subjects-panel');
    document.querySelectorAll('.subject-card').forEach(card => card.remove());

    subjectsData.subjects.forEach(subject => {
        if (subject.fieldId === fieldId) {
            const subjectCard = document.createElement('div');
            subjectCard.classList.add('subject-card');
            subjectsPanel.appendChild(subjectCard);
            const subjectText = document.createElement('h2');
            subjectText.textContent = subject.name;
            subjectCard.appendChild(subjectText);
            const subjectIcon = document.createElement('img');
            subjectIcon.src = subject.icon;
            subjectCard.appendChild(subjectIcon);
            subjectCard.addEventListener('click', () => {
                const categoriesPanel = document.getElementById('categories-panel');
                subjectsPanel.classList.remove('active');
                categoriesPanel.classList.add('active');
                loadCategories(subject.id);
            });
        }
    });
}

function loadCategories(subjectId) {
    const categoriesPanel = document.getElementById('categories-panel');
    document.querySelectorAll('.category-card').forEach(card => card.remove());

    categoriesData.categories.forEach(category => {
        if (category.subjectId === subjectId) {
            const categoryCard = document.createElement('div');
            categoryCard.classList.add('category-card');
            categoriesPanel.appendChild(categoryCard);
            const categoryText = document.createElement('h2');
            categoryText.textContent = category.name;
            categoryCard.appendChild(categoryText);
            const categoryIcon = document.createElement('img');
            categoryIcon.src = category.icon;
            categoryCard.appendChild(categoryIcon);
            categoryCard.addEventListener('click', () => {
                const lessonsPanel = document.getElementById('lessons-panel');
                categoriesPanel.classList.remove('active');
                lessonsPanel.classList.add('active');
                loadLessons(category.id);
            });
        }
    });
}

function loadLessons(categoryId) {
    const lessonsPanel = document.getElementById('lessons-panel');
    document.querySelectorAll('.lesson-card').forEach(card => card.remove());

    lessonsData.lessons.forEach(lesson => {
        if (lesson.categoryId === categoryId) {
            const lessonCard = document.createElement('div');
            lessonCard.classList.add('lesson-card');
            lessonsPanel.appendChild(lessonCard);
            const lessonText = document.createElement('h2');
            lessonText.textContent = lesson.name;
            lessonCard.appendChild(lessonText);
            const lessonIcon = document.createElement('img');
            lessonIcon.src = lesson.icon;
            lessonCard.appendChild(lessonIcon);
        }
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
