// scripts.js
document.addEventListener('DOMContentLoaded', function () {
    const addPrayerPage = document.getElementById('add-prayer-page');
    const viewPrayersPage = document.getElementById('view-prayers-page');
    const addPrayerBtn = document.getElementById('add-prayer-btn');
    const viewPrayersBtn = document.getElementById('view-prayers-btn');
    const prayerForm = document.getElementById('prayer-form');
    const prayerInput = document.getElementById('prayer-input');
    const categorySelect = document.getElementById('category-select');
    const prayerList = document.getElementById('prayer-list');
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');
    const categoryFilter = document.getElementById('category-filter');

    let prayers = JSON.parse(localStorage.getItem('prayers')) || [];
    let editingIndex = null;

    const savePrayers = () => {
        localStorage.setItem('prayers', JSON.stringify(prayers));
    };

    const addPrayerToList = (prayer, index) => {
        const li = document.createElement('li');
        const prayerText = document.createElement('span');
        prayerText.textContent = `${prayer.text} (${prayer.category}) - ${prayer.date}`;
        if (prayer.completed) {
            prayerText.classList.add('completed');
        }

        const editButton = document.createElement('button');
        editButton.textContent = '편집';
        editButton.classList.add('edit');
        editButton.addEventListener('click', () => {
            prayerInput.value = prayer.text;
            categorySelect.value = prayer.category;
            editingIndex = index;
            switchPage('add');
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = '삭제';
        deleteButton.classList.add('delete');
        deleteButton.addEventListener('click', () => {
            prayers.splice(index, 1);
            savePrayers();
            renderPrayers();
        });

        const toggleButton = document.createElement('button');
        toggleButton.textContent = prayer.completed ? '미완료' : '완료';
        toggleButton.addEventListener('click', () => {
            prayer.completed = !prayer.completed;
            savePrayers();
            renderPrayers();
        });

        li.appendChild(prayerText);
        li.appendChild(toggleButton);
        li.appendChild(editButton);
        li.appendChild(deleteButton);
        prayerList.appendChild(li);
    };

    const renderPrayers = () => {
        prayerList.innerHTML = '';
        const filteredPrayers = prayers.filter(prayer => {
            const matchesSearch = prayer.text.toLowerCase().includes(searchInput.value.toLowerCase());
            const matchesStatus = statusFilter.value === 'all' || (statusFilter.value === 'completed' && prayer.completed) || (statusFilter.value === 'not-completed' && !prayer.completed);
            const matchesCategory = categoryFilter.value === 'all' || prayer.category === categoryFilter.value;
            return matchesSearch && matchesStatus && matchesCategory;
        });
        filteredPrayers.forEach((prayer, index) => {
            addPrayerToList(prayer, index);
        });
    };

    prayerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const prayerText = prayerInput.value.trim();
        const prayerCategory = categorySelect.value;
        const prayerDate = new Date().toLocaleDateString();
        if (prayerText !== '') {
            if (editingIndex !== null) {
                prayers[editingIndex].text = prayerText;
                prayers[editingIndex].category = prayerCategory;
                prayers[editingIndex].date = prayerDate;
                editingIndex = null;
            } else {
                prayers.push({ text: prayerText, category: prayerCategory, date: prayerDate, completed: false });
            }
            savePrayers();
            renderPrayers();
            prayerInput.value = '';
            categorySelect.value = 'VIP';
        }
    });

    const switchPage = (page) => {
        if (page === 'add') {
            addPrayerPage.classList.add('active');
            viewPrayersPage.classList.remove('active');
        } else if (page === 'view') {
            addPrayerPage.classList.remove('active');
            viewPrayersPage.classList.add('active');
        }
    };

    addPrayerBtn.addEventListener('click', () => switchPage('add'));
    viewPrayersBtn.addEventListener('click', () => switchPage('view'));
    searchInput.addEventListener('input', renderPrayers);
    statusFilter.addEventListener('change', renderPrayers);
    categoryFilter.addEventListener('change', renderPrayers);

    switchPage('view'); // 기본 페이지는 기도 제목 보기 페이지
    renderPrayers();
});
