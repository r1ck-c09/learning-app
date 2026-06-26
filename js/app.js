// Data

let fieldsData = null;
let subjectsData = null;
let categoriesData = null;
let lessonsData = null;
let currentFieldName = null;
let currentFieldColor = null;
let currentSubjectName = null;
let currentCategoryName = null;

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
        renderHome();
    });
}

// Helper functions


function setHeader(panelId, small, big) {
    document.querySelector('#' + panelId + ' .panel-title-small').textContent = small;
    document.querySelector('#' + panelId + ' .panel-title-big').textContent = big;
}

function goBack(currentPanelId, targetPanelId){
    const targetPanel = document.getElementById(targetPanelId);
    const currentPanel = document.getElementById(currentPanelId);

    currentPanel.classList.remove('active');
    targetPanel.classList.add('active');
}

function markLessonStarted(lessonId) {
    let started = JSON.parse(localStorage.getItem('startedLessons')) || {};
    if (started[lessonId] === undefined) {
        started[lessonId] = false; // Mark as started but not completed
        localStorage.setItem('startedLessons', JSON.stringify(started));
    }
}

function markLessonCompleted(lessonId) {
    let started = JSON.parse(localStorage.getItem('startedLessons')) || {};
    if (started[lessonId] !== true) addXp(20);
    started[lessonId] = true;
    localStorage.setItem('startedLessons', JSON.stringify(started));
}

function getTodayXp() {
    return parseInt(localStorage.getItem('todayXp') || '0', 10);
}

function addXp(amount) {
    localStorage.setItem('todayXp', getTodayXp() + amount);
}

function getStreak() {
    return parseInt(localStorage.getItem('streak') || '4', 10);
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
            if (target === 'home-panel' && fieldsData) renderHome();
            if (target === 'statistics-panel' && fieldsData) renderStats();
        });
    });
}

function loadCourses() {
    const coursesPanel = document.getElementById('courses-panel');
    coursesPanel.innerHTML = '';
    const started = JSON.parse(localStorage.getItem('startedLessons')) || {};

    const header = document.createElement('div');
    header.classList.add('courses-header');
    header.innerHTML = '<h1 class="courses-title">Learn</h1>';
    coursesPanel.appendChild(header);

    fieldsData.fields.forEach(field => {
        const subjects = subjectsData.subjects.filter(s => s.fieldId === field.id);
        const fieldLessons = lessonsData.lessons.filter(l => {
            const c = categoriesData.categories.find(cat => cat.id === l.categoryId);
            const s = c && subjectsData.subjects.find(sub => sub.id === c.subjectId);
            return s && s.fieldId === field.id;
        });
        const fieldDone = fieldLessons.filter(l => started[l.id] === true).length;
        const pct = fieldLessons.length > 0 ? Math.round((fieldDone / fieldLessons.length) * 100) : 0;

        const card = document.createElement('div');
        card.classList.add('field-card');
        card.style.setProperty('--field-color', field.color);
        card.innerHTML =
            '<div class="field-card-icon">' + field.icon + '</div>' +
            '<div class="field-card-body">' +
                '<div class="field-card-name">' + field.name + '</div>' +
                '<div class="field-card-meta">' + subjects.length + ' subjects · ' + fieldLessons.length + ' lessons</div>' +
            '</div>' +
            '<div class="field-card-footer">' +
                '<div class="field-card-progress-bar"><div class="field-card-progress-fill" style="width:' + pct + '%"></div></div>' +
                '<div class="field-card-progress-label">' + fieldDone + ' of ' + fieldLessons.length + ' done</div>' +
            '</div>';
        card.addEventListener('click', () => {
            currentFieldName = field.name;
            currentFieldColor = field.color;
            document.querySelector('#subjects-panel .panel-title-big').textContent = field.name;
            coursesPanel.classList.remove('active');
            document.getElementById('subjects-panel').classList.add('active');
            loadSubjects(field.id);
        });
        coursesPanel.appendChild(card);
    });
}

function loadSubjects(fieldId) {
    const panel = document.getElementById('subjects-panel');
    panel.querySelectorAll('.list-row').forEach(r => r.remove());

    subjectsData.subjects
        .filter(s => s.fieldId === fieldId)
        .forEach(subject => {
            const categoryCount = categoriesData.categories.filter(c => c.subjectId === subject.id).length;
            const row = document.createElement('div');
            row.classList.add('list-row');
            row.innerHTML =
                '<div class="list-row-chip" style="background:' + subject.color + '33;color:' + subject.color + '">' + subject.name[0] + '</div>' +
                '<div class="list-row-body">' +
                    '<span class="list-row-name">' + subject.name + '</span>' +
                    '<span class="list-row-sub">' + categoryCount + (categoryCount === 1 ? ' category' : ' categories') + '</span>' +
                '</div>' +
                '<span class="list-row-chevron">›</span>';
            row.addEventListener('click', () => {
                currentSubjectName = subject.name;
                setHeader('categories-panel', currentFieldName, subject.name);
                panel.classList.remove('active');
                document.getElementById('categories-panel').classList.add('active');
                loadCategories(subject.id);
            });
            panel.appendChild(row);
        });
}

function loadCategories(subjectId) {
    const panel = document.getElementById('categories-panel');
    panel.querySelectorAll('.list-row').forEach(r => r.remove());
    const started = JSON.parse(localStorage.getItem('startedLessons')) || {};

    categoriesData.categories
        .filter(c => c.subjectId === subjectId)
        .forEach(category => {
            const lessons = lessonsData.lessons.filter(l => l.categoryId === category.id);
            const completed = lessons.filter(l => started[l.id] === true).length;
            const total = lessons.length;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            const row = document.createElement('div');
            row.classList.add('list-row');
            row.innerHTML =
                '<div class="list-row-chip" style="background:' + category.color + '33;color:' + category.color + '">' + category.name[0] + '</div>' +
                '<div class="list-row-body">' +
                    '<span class="list-row-name">' + category.name + '</span>' +
                    '<div class="list-row-progress"><div class="list-row-progress-bar" style="width:' + pct + '%;background:' + category.color + '"></div></div>' +
                    '<span class="list-row-sub">' + completed + '/' + total + ' lessons</span>' +
                '</div>' +
                '<span class="list-row-chevron">›</span>';
            row.addEventListener('click', () => {
                currentCategoryName = category.name;
                setHeader('lessons-panel', currentFieldName + ' › ' + currentSubjectName, category.name);
                panel.classList.remove('active');
                document.getElementById('lessons-panel').classList.add('active');
                loadLessons(category.id);
            });
            panel.appendChild(row);
        });
}

function loadLessons(categoryId) {
    const lessons = lessonsData.lessons.filter(lesson => lesson.categoryId === categoryId);
    renderTrail(lessons, currentFieldColor);
}

function loadLesson(lessonId) {
    document.getElementById('lesson-content').innerHTML = '';
    document.querySelector('#lessons-content-panel .back-button').style.display = '';
    document.getElementById('nav').style.display = 'none';
    markLessonStarted(lessonId);
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
                    markLessonCompleted(lessonId);
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

// Renderers

function renderTrail(lessons, fieldColor) {
    fieldColor = fieldColor || '#3b82f6';
    const started = JSON.parse(localStorage.getItem('startedLessons')) || {};
    const existing = document.querySelector('#lessons-panel .trail-container');
    if (existing) existing.remove();

    const leftCX   = 80;
    const rightCX  = 230;
    const paddingTop = 44;
    const vStep    = 152;
    const nodeSize = 72;
    const r        = nodeSize / 2;

    const firstUncompleted = lessons.findIndex(l => started[l.id] !== true);

    const nodes = lessons.map((lesson, i) => ({
        lesson,
        cx: i % 2 === 0 ? leftCX : rightCX,
        cy: paddingTop + r + i * vStep,
        isCompleted: started[lesson.id] === true,
        isCurrent:   i === firstUncompleted,
        isLocked:    started[lesson.id] !== true && i !== firstUncompleted,
    }));

    const containerH = paddingTop + lessons.length * vStep + 60;

    const container = document.createElement('div');
    container.classList.add('trail-container');
    container.style.height = containerH + 'px';
    container.style.setProperty('--field-color', fieldColor);

    // SVG paths
    if (nodes.length > 1) {
        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('width', '310');
        svg.setAttribute('height', containerH);
        svg.classList.add('trail-svg');

        let fullD = `M ${nodes[0].cx} ${nodes[0].cy + r}`;
        for (let i = 0; i < nodes.length - 1; i++) {
            const from = nodes[i], to = nodes[i + 1];
            const sy = from.cy + r, ey = to.cy - r, my = (sy + ey) / 2;
            fullD += ` C ${from.cx} ${my}, ${to.cx} ${my}, ${to.cx} ${ey}`;
        }
        const fullPath = document.createElementNS(svgNS, 'path');
        fullPath.setAttribute('d', fullD);
        fullPath.setAttribute('fill', 'none');
        fullPath.setAttribute('stroke', fieldColor);
        fullPath.setAttribute('stroke-width', '5');
        fullPath.setAttribute('stroke-dasharray', '10 7');
        fullPath.setAttribute('stroke-opacity', '0.3');
        fullPath.setAttribute('stroke-linecap', 'round');
        svg.appendChild(fullPath);

        const doneEnd = firstUncompleted === -1 ? nodes.length - 1 : firstUncompleted;
        if (doneEnd > 0) {
            let doneD = `M ${nodes[0].cx} ${nodes[0].cy + r}`;
            for (let i = 0; i < doneEnd; i++) {
                const from = nodes[i], to = nodes[i + 1];
                const sy = from.cy + r, ey = to.cy - r, my = (sy + ey) / 2;
                doneD += ` C ${from.cx} ${my}, ${to.cx} ${my}, ${to.cx} ${ey}`;
            }
            const donePath = document.createElementNS(svgNS, 'path');
            donePath.setAttribute('d', doneD);
            donePath.setAttribute('fill', 'none');
            donePath.setAttribute('stroke', fieldColor);
            donePath.setAttribute('stroke-width', '5');
            donePath.setAttribute('stroke-opacity', '0.45');
            donePath.setAttribute('stroke-linecap', 'round');
            svg.appendChild(donePath);
        }

        container.appendChild(svg);
    }

    // Node divs
    nodes.forEach(({ lesson, cx, cy, isCompleted, isCurrent, isLocked }) => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('trail-node-wrapper');
        wrapper.style.left = (cx - r) + 'px';
        wrapper.style.top  = (cy - r) + 'px';

        if (isCurrent) {
            const pulse = document.createElement('div');
            pulse.classList.add('trail-pulse');
            wrapper.appendChild(pulse);
        }

        const node = document.createElement('div');
        const icon = document.createElement('span');

        if (isCompleted) {
            node.classList.add('lesson-node', 'completed');
            icon.textContent = '✓';
        } else if (isCurrent) {
            node.classList.add('lesson-node', 'available');
            icon.textContent = '▶';
        } else {
            node.classList.add('lesson-node', 'locked');
            icon.textContent = '🔒';
        }

        node.appendChild(icon);
        wrapper.appendChild(node);

        const label = document.createElement('span');
        label.classList.add('trail-label');
        label.textContent = lesson.name;
        wrapper.appendChild(label);

        if (isCurrent) {
            const startLabel = document.createElement('span');
            startLabel.classList.add('trail-start');
            startLabel.textContent = 'START';
            wrapper.appendChild(startLabel);
        }

        if (!isLocked) {
            node.addEventListener('click', () => {
                document.getElementById('lessons-panel').classList.remove('active');
                document.getElementById('lessons-content-panel').classList.add('active');
                loadLesson(lesson.id);
            });
        }

        container.appendChild(wrapper);
    });

    document.getElementById('lessons-panel').appendChild(container);
}

function renderHome() {
    if (!fieldsData) return;
    const panel = document.getElementById('home-panel');
    panel.innerHTML = '';
    const started = JSON.parse(localStorage.getItem('startedLessons')) || {};
    const xp = getTodayXp();
    const streak = getStreak();

    // Header
    const h = new Date().getHours();
    const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const header = document.createElement('div');
    header.classList.add('home-header');
    header.innerHTML =
        '<span class="home-greeting">' + greeting + '</span>' +
        '<h1 class="home-title">Today</h1>' +
        '<p class="home-date">' + dateStr + '</p>';
    panel.appendChild(header);

    // Streak + goal row
    const statsRow = document.createElement('div');
    statsRow.classList.add('home-stats-row');

    const todayDay = (new Date().getDay() + 6) % 7;
    const streakDots = Array.from({length: 7}, function(_, i) {
        const diff = todayDay - i;
        if (diff === 0) return '<span class="streak-dot today"></span>';
        if (diff > 0 && diff < streak) return '<span class="streak-dot done"></span>';
        return '<span class="streak-dot"></span>';
    }).join('');
    const streakCard = document.createElement('div');
    streakCard.classList.add('home-card', 'streak-card');
    streakCard.innerHTML =
        '<div class="streak-header-row"><span class="streak-flame">🔥</span><span class="streak-count">' + streak + '</span></div>' +
        '<span class="streak-label">Day streak</span>' +
        '<div class="streak-dots">' + streakDots + '</div>';
    statsRow.appendChild(streakCard);

    const r = 36, circ = parseFloat((2 * Math.PI * r).toFixed(1));
    const offset = parseFloat((circ * (1 - Math.min(xp / 50, 1))).toFixed(1));
    const goalCard = document.createElement('div');
    goalCard.classList.add('home-card', 'goal-card');
    goalCard.innerHTML =
        '<svg class="goal-ring" viewBox="0 0 88 88" width="88" height="88">' +
            '<circle cx="44" cy="44" r="36" fill="none" stroke="#2a2a3a" stroke-width="7"/>' +
            '<circle cx="44" cy="44" r="36" fill="none" stroke="#9b87f5" stroke-width="7"' +
            ' stroke-linecap="round" stroke-dasharray="' + circ + '" stroke-dashoffset="' + offset + '"' +
            ' transform="rotate(-90 44 44)"/>' +
            '<text x="44" y="44" text-anchor="middle" dominant-baseline="central"' +
            ' fill="#f5f5fa" font-size="16" font-weight="700" font-family="DM Sans,sans-serif">' + xp + '</text>' +
        '</svg>' +
        '<span class="goal-label">/ 50 XP today</span>';
    statsRow.appendChild(goalCard);
    panel.appendChild(statsRow);

    // Continue learning
    const inProgress = lessonsData.lessons.find(function(l) { return started[l.id] === false; });
    const nextNew = !inProgress ? lessonsData.lessons.find(function(l) { return started[l.id] === undefined; }) : null;
    const activeLesson = inProgress || nextNew;
    if (activeLesson) {
        const cat = categoriesData.categories.find(function(c) { return c.id === activeLesson.categoryId; });
        const sub = cat && subjectsData.subjects.find(function(s) { return s.id === cat.subjectId; });
        const field = sub && fieldsData.fields.find(function(f) { return f.id === sub.fieldId; });
        const color = field ? field.color : '#9b87f5';
        const breadcrumb = [field && field.name, sub && sub.name, cat && cat.name].filter(Boolean).join(' › ');
        const catLessons = lessonsData.lessons.filter(function(l) { return l.categoryId === activeLesson.categoryId; });
        const catDone = catLessons.filter(function(l) { return started[l.id] === true; }).length;
        const catPct = Math.round((catDone / catLessons.length) * 100);
        const continueCard = document.createElement('div');
        continueCard.classList.add('home-continue');
        continueCard.style.setProperty('--card-color', color);
        continueCard.innerHTML =
            '<span class="continue-eyebrow">Continue learning</span>' +
            '<div class="continue-name">' + activeLesson.name + '</div>' +
            '<div class="continue-crumb">' + breadcrumb + '</div>' +
            '<div class="continue-bar"><div class="continue-fill" style="width:' + catPct + '%;background:' + color + '"></div></div>';
        continueCard.addEventListener('click', function() {
            if (field) { currentFieldName = field.name; currentFieldColor = field.color; }
            if (sub) currentSubjectName = sub.name;
            if (cat) {
                currentCategoryName = cat.name;
                setHeader('lessons-panel', currentFieldName + ' › ' + currentSubjectName, cat.name);
                loadLessons(cat.id);
            }
            panel.classList.remove('active');
            document.getElementById('lessons-content-panel').classList.add('active');
            loadLesson(activeLesson.id);
        });
        panel.appendChild(continueCard);
    }

    // Keep exploring
    const exploreSection = document.createElement('div');
    exploreSection.classList.add('home-explore');
    exploreSection.innerHTML = '<div class="home-section-title">Keep exploring</div>';
    const fieldRow = document.createElement('div');
    fieldRow.classList.add('home-field-row');
    fieldsData.fields.forEach(function(field) {
        const subs = subjectsData.subjects.filter(function(s) { return s.fieldId === field.id; });
        const fieldLessons = lessonsData.lessons.filter(function(l) {
            const c = categoriesData.categories.find(function(cat) { return cat.id === l.categoryId; });
            const s = c && subjectsData.subjects.find(function(sub) { return sub.id === c.subjectId; });
            return s && s.fieldId === field.id;
        });
        const fieldDone = fieldLessons.filter(function(l) { return started[l.id] === true; }).length;
        const fieldPct = fieldLessons.length > 0 ? Math.round((fieldDone / fieldLessons.length) * 100) : 0;
        const card = document.createElement('div');
        card.classList.add('home-field-card');
        card.innerHTML =
            '<div class="home-field-chip" style="background:' + field.color + '22;color:' + field.color + '">' + field.name[0] + '</div>' +
            '<div class="home-field-name">' + field.name + '</div>' +
            '<div class="home-field-sub">' + subs.length + ' subjects</div>' +
            '<div class="home-field-bar"><div class="home-field-fill" style="width:' + fieldPct + '%;background:' + field.color + '"></div></div>';
        card.addEventListener('click', function() {
            currentFieldName = field.name;
            currentFieldColor = field.color;
            document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });
            document.querySelectorAll('.tab-button').forEach(function(b) { b.classList.remove('active'); });
            document.querySelector('[data-target="courses-panel"]').classList.add('active');
            document.getElementById('subjects-panel').classList.add('active');
            document.querySelector('#subjects-panel .panel-title-big').textContent = field.name;
            loadSubjects(field.id);
        });
        fieldRow.appendChild(card);
    });
    exploreSection.appendChild(fieldRow);
    panel.appendChild(exploreSection);
}

function renderStats() {
    if (!fieldsData) return;
    const panel = document.getElementById('statistics-panel');
    panel.innerHTML = '';
    const started = JSON.parse(localStorage.getItem('startedLessons')) || {};
    const xp = getTodayXp();
    const streak = getStreak();
    const lessonsDone = Object.values(started).filter(function(v) { return v === true; }).length;
    const minutes = lessonsDone * 3;

    // Header
    const header = document.createElement('div');
    header.classList.add('stats-header');
    header.innerHTML = '<h1 class="stats-title">Stats</h1>';
    panel.appendChild(header);

    // 2x2 stat tiles
    const tiles = [
        { value: xp + ' XP', label: 'Total XP', icon: '⚡' },
        { value: streak, label: 'Day streak', icon: '🔥' },
        { value: lessonsDone, label: 'Lessons done', icon: '📖' },
        { value: minutes + ' min', label: 'Time spent', icon: '⏱' },
    ];
    const tilesGrid = document.createElement('div');
    tilesGrid.classList.add('stats-tiles');
    tiles.forEach(function(t) {
        const tile = document.createElement('div');
        tile.classList.add('stats-tile');
        tile.innerHTML =
            '<span class="stats-tile-icon">' + t.icon + '</span>' +
            '<span class="stats-tile-value">' + t.value + '</span>' +
            '<span class="stats-tile-label">' + t.label + '</span>';
        tilesGrid.appendChild(tile);
    });
    panel.appendChild(tilesGrid);

    // This week bar chart
    const weekSection = document.createElement('div');
    weekSection.classList.add('stats-section');
    weekSection.innerHTML = '<div class="stats-section-title">This week</div>';
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const todayDay = (new Date().getDay() + 6) % 7;
    const placeholderPast = [2, 4, 1, 3, 2, 5];
    const barData = days.map(function(_, i) {
        if (i === todayDay) return Math.max(lessonsDone, 1);
        if (i < todayDay) return placeholderPast[i % placeholderPast.length];
        return 0;
    });
    const maxBar = Math.max.apply(null, barData.concat([1]));
    const chart = document.createElement('div');
    chart.classList.add('stats-chart');
    days.forEach(function(day, i) {
        const col = document.createElement('div');
        col.classList.add('stats-chart-col');
        const bar = document.createElement('div');
        bar.classList.add('stats-chart-bar');
        bar.style.height = Math.round((barData[i] / maxBar) * 100) + '%';
        if (i === todayDay) bar.classList.add('today');
        else if (i > todayDay) bar.classList.add('future');
        const label = document.createElement('div');
        label.classList.add('stats-chart-label');
        if (i === todayDay) label.classList.add('today');
        label.textContent = day;
        col.appendChild(bar);
        col.appendChild(label);
        chart.appendChild(col);
    });
    weekSection.appendChild(chart);
    panel.appendChild(weekSection);

    // Per-field progress
    const progressSection = document.createElement('div');
    progressSection.classList.add('stats-section');
    progressSection.innerHTML = '<div class="stats-section-title">Your progress</div>';
    fieldsData.fields.forEach(function(field) {
        const fieldLessons = lessonsData.lessons.filter(function(l) {
            const c = categoriesData.categories.find(function(cat) { return cat.id === l.categoryId; });
            const s = c && subjectsData.subjects.find(function(sub) { return sub.id === c.subjectId; });
            return s && s.fieldId === field.id;
        });
        const fieldDone = fieldLessons.filter(function(l) { return started[l.id] === true; }).length;
        const pct = fieldLessons.length > 0 ? Math.round((fieldDone / fieldLessons.length) * 100) : 0;
        const row = document.createElement('div');
        row.classList.add('stats-progress-row');
        row.innerHTML =
            '<div class="stats-progress-header">' +
                '<div class="stats-progress-chip" style="background:' + field.color + '22;color:' + field.color + '">' + field.name[0] + '</div>' +
                '<div class="stats-progress-name">' + field.name + '</div>' +
                '<div class="stats-progress-count" style="color:' + field.color + '">' + fieldDone + ' / ' + fieldLessons.length + '</div>' +
            '</div>' +
            '<div class="stats-progress-bar"><div class="stats-progress-fill" style="width:' + pct + '%;background:' + field.color + '"></div></div>';
        progressSection.appendChild(row);
    });
    panel.appendChild(progressSection);

    // Achievements
    const langField = fieldsData.fields.find(function(f) { return f.name.toLowerCase().includes('lang'); });
    const langDone = langField ? lessonsData.lessons.some(function(l) {
        if (started[l.id] !== true) return false;
        const c = categoriesData.categories.find(function(cat) { return cat.id === l.categoryId; });
        const s = c && subjectsData.subjects.find(function(sub) { return sub.id === c.subjectId; });
        return s && s.fieldId === langField.id;
    }) : false;
    const achievements = [
        { icon: '🎉', name: 'First Steps', desc: 'Complete your first lesson', unlocked: lessonsDone >= 1 },
        { icon: '📚', name: 'On a Roll', desc: 'Complete 3 lessons', unlocked: lessonsDone >= 3 },
        { icon: '🔥', name: 'Week Warrior', desc: 'Reach a 3-day streak', unlocked: streak >= 3 },
        { icon: '🗣️', name: 'Language Lover', desc: 'Complete a language lesson', unlocked: langDone },
        { icon: '🏆', name: 'Champion', desc: 'Complete 10 lessons', unlocked: lessonsDone >= 10 },
        { icon: '⚡', name: 'Power Learner', desc: 'Earn 100 XP', unlocked: xp >= 100 },
    ];
    const achSection = document.createElement('div');
    achSection.classList.add('stats-section');
    achSection.innerHTML = '<div class="stats-section-title">Achievements</div>';
    const achGrid = document.createElement('div');
    achGrid.classList.add('stats-achievements');
    achievements.forEach(function(ach) {
        const badge = document.createElement('div');
        badge.classList.add('stats-badge');
        if (!ach.unlocked) badge.classList.add('locked');
        badge.innerHTML =
            '<div class="stats-badge-icon">' + (ach.unlocked ? ach.icon : '🔒') + '</div>' +
            '<div class="stats-badge-name">' + ach.name + '</div>' +
            '<div class="stats-badge-desc">' + ach.desc + '</div>';
        achGrid.appendChild(badge);
    });
    achSection.appendChild(achGrid);
    panel.appendChild(achSection);
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