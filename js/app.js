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
showTab();
document.getElementById('home-panel').classList.add('active');
document.querySelector('#nav [data-target="home-panel"]').classList.add('active');

function loadCourses() {
    fetch('content/fields.json')
        .then(response => response.json())
        .then(data => {
            const dataPanel = document.getElementById('courses-panel');

            data.fields.forEach(field => {
                const card = document.createElement('div');
                card.textContent = field.name;
                card.style.backgroundColor = field.color;
                dataPanel.appendChild(card);
            });
        });
}
loadCourses();