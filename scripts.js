// scripts.js
document.addEventListener('DOMContentLoaded', () => {
    const addPrayerBtn = document.getElementById('add-prayer-btn');
    const addPrayerPopup = document.getElementById('add-prayer-popup');
    const closePopupBtn = addPrayerPopup.querySelector('.close');
    const prayerForm = document.getElementById('prayer-form');
    const prayerInput = document.getElementById('prayer-input');
    const categorySelect = document.getElementById('category-select');
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');
    const categoryFilter = document.getElementById('category-filter');
    const prevPrayerBtn = document.getElementById('prev-prayer-btn');
    const nextPrayerBtn = document.getElementById('next-prayer-btn');
    const prayerList = document.getElementById('prayer-list');
    const currentIndexDisplay = document.getElementById('current-index');
    const totalCountDisplay = document.getElementById('total-count');

    let prayers = JSON.parse(localStorage.getItem('prayers')) || [];
    let currentIndex = 0;
    let editingId = null;

    const savePrayers = () => {
        localStorage.setItem('prayers', JSON.stringify(prayers));
    };

    const addPrayerToList = (prayer) => {
        const div = document.createElement('div');
        div.classList.add('prayer-card');

        const prayerDetails = document.createElement('div');
        const prayerText = document.createElement('span');
        const prayerCategory = document.createElement('span');
        prayerText.textContent = prayer.text;
        prayerText.style.whiteSpace = 'pre-line'; // 줄 바꿈 표현
        prayerText.style.textAlign = 'left';
        prayerCategory.textContent = `(${prayer.category}) - [시작:${prayer.startdate}, 편집:${prayer.editdate},응답:${prayer.answerdate}]`;
        prayerDetails.appendChild(prayerCategory);
        prayerDetails.appendChild(prayerText);

        if (prayer.completed) {
            prayerText.classList.add('completed');
        }

        const buttons = document.createElement('div');
        buttons.classList.add('buttons');

        const editButton = document.createElement('button');
        editButton.textContent = '편집';
        editButton.classList.add('edit');
        editButton.addEventListener('click', () => {
            prayerInput.value = prayer.text;
            categorySelect.value = prayer.category;
            editingId = prayer.id;
            showPopup();
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = '삭제';
        deleteButton.classList.add('delete');
        deleteButton.addEventListener('click', () => {
            prayers = prayers.filter(p => p.id !== prayer.id);
            savePrayers();
            renderPrayers();
        });

        const toggleButton = document.createElement('button');
        toggleButton.textContent = prayer.completed ? '미완료' : '완료';
        toggleButton.classList.add('toggle');
        toggleButton.addEventListener('click', () => {
            prayer.completed = !prayer.completed;
            if (prayer.completed) {
                prayer.answerdate = new Date().toLocaleDateString();
            }
            else {
                prayer.answerdate = '';
            }

            savePrayers();
            renderPrayers();
        });

        buttons.appendChild(editButton);
        buttons.appendChild(deleteButton);
        buttons.appendChild(toggleButton);

        div.appendChild(prayerDetails);
        div.appendChild(buttons);
        prayerList.appendChild(div);
    };

    const renderPrayers = () => {
        prayerList.innerHTML = '';
        const filteredPrayers = prayers.filter(prayer => {
            const matchesSearch = prayer.text.toLowerCase().includes(searchInput.value.toLowerCase());
            const matchesStatus = statusFilter.value === 'all' || (statusFilter.value === 'completed' && prayer.completed) || (statusFilter.value === 'not-completed' && !prayer.completed);
            const matchesCategory = categoryFilter.value === 'all' || prayer.category === categoryFilter.value;
            return matchesSearch && matchesStatus && matchesCategory;
        });

        if (filteredPrayers.length > 0) {
            const filteredPrayer = filteredPrayers[currentIndex % filteredPrayers.length];
            addPrayerToList(filteredPrayer);
            currentIndexDisplay.textContent = currentIndex + 1;
            totalCountDisplay.textContent = filteredPrayers.length;
        } else {
            currentIndexDisplay.textContent = '0';
            totalCountDisplay.textContent = '0';
        }
    };

    const showPopup = () => {
        addPrayerPopup.classList.add('active');
    };

    const hidePopup = () => {
        addPrayerPopup.classList.remove('active');
        prayerInput.value = '';
        categorySelect.value = 'VIP';
        editingId = null;
    };

    prayerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const prayerText = prayerInput.value.trim();
        const prayerCategory = categorySelect.value;
        const prayerStartDate = new Date().toLocaleDateString();
        const prayerEditDate = new Date().toLocaleDateString();
        if (prayerText !== '') {
            if (editingId !== null) {
                const prayerIndex = prayers.findIndex(p => p.id === editingId);
                if (prayerIndex !== -1) {
                    prayers[prayerIndex].text = prayerText;
                    prayers[prayerIndex].category = prayerCategory;
                    prayers[prayerIndex].editdate = prayerEditDate;
                }
                editingId = null;
            } else {
                const newPrayer = {
                    id: Date.now(),
                    text: prayerText,
                    category: prayerCategory,
                    startdate: prayerStartDate,
                    editdate:'',
                    answerdate:'',
                    completed: false
                };
                prayers.push(newPrayer);
            }
            savePrayers();
            renderPrayers();
            prayerInput.value = '';
            categorySelect.value = 'VIP';
            hidePopup();
        }
    });

    addPrayerBtn.addEventListener('click', showPopup);
    closePopupBtn.addEventListener('click', hidePopup);

    searchInput.addEventListener('input', renderPrayers);
    statusFilter.addEventListener('change', renderPrayers);
    categoryFilter.addEventListener('change', renderPrayers);

    prevPrayerBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex = (currentIndex - 1 + prayers.length) % prayers.length;
            renderPrayers();
        }
    });

    nextPrayerBtn.addEventListener('click', () => {
        if (currentIndex < prayers.length - 1) {
            currentIndex = (currentIndex + 1) % prayers.length;
            renderPrayers();
        }
    });

    currentIndexDisplay.addEventListener('click', (event) => {
        const index = parseInt(event.target.textContent) - 1;
        if (!isNaN(index) && index >= 0 && index < prayers.length) {
            currentIndex = index;
            renderPrayers();
        }
    });

    renderPrayers();
});
