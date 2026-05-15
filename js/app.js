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
    fetch('content/fields.json')
        .then(response => response.json())
        .then(data => {
            const coursesPanel = document.getElementById('courses-panel');

            data.fields.forEach(field => {
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
        });
}

function loadSubjects(fieldId) {
    fetch('content/subjects.json')
        .then(response => response.json())
        .then(data => {
            const subjectsPanel = document.getElementById('subjects-panel');
            const subjectsPanelCards = document.querySelectorAll('.subject-card');
            subjectsPanelCards.forEach(card => card.remove());

            data.subjects.forEach(subject => {
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
        });
}

function loadCategories(subjectId) {
    fetch('content/categories.json')
        .then(response => response.json())
        .then(data => {
            const categoriesPanel = document.getElementById('categories-panel');
            const categoriesPanelCards = document.querySelectorAll('.category-card');
            categoriesPanelCards.forEach(card => card.remove());

            data.categories.forEach(category => {
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
                }
            });
        });
}

// Init

showTab();
loadCourses();
document.getElementById('home-panel').classList.add('active');
document.querySelector('#nav [data-target="home-panel"]').classList.add('active');
document.querySelector('#subjects-panel .back-button').addEventListener('click', () => {
    goBack('subjects-panel', 'courses-panel');
});
document.querySelector('#categories-panel .back-button').addEventListener('click', () => {
    goBack('categories-panel', 'subjects-panel');
});
