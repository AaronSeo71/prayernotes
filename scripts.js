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
    const exportPrayersBtn = document.getElementById('export-prayers-btn');
    const importPrayersBtn = document.getElementById('import-prayers-btn');
    const fileInput = document.getElementById('file-input');


    let prayers = JSON.parse(localStorage.getItem('prayers')) || [];
    let currentIndex = 0;
    let editingId = null;

    const savePrayers = () => {
        localStorage.setItem('prayers', JSON.stringify(prayers));
    };

    const addPrayerToList = (prayer) => {
        const div = document.createElement('div');
        //div.classList.add('prayer-card');
        div.classList.add('prayer-card');

        const prayerText = document.createElement('div');
        prayerText.classList.add('prayer-text');
        prayerText.style.whiteSpace = "pre-line";
        prayerText.style.marginTop = "10px";
        prayerText.style.wordBreak = "break-all";
        prayerText.style.textAlign = "left";

        const prayerCategory = document.createElement('div');
        prayerCategory.classList.add('prayer-head');
        prayerText.textContent = prayer.text;
        prayerCategory.textContent = `[${prayer.category}][시작:${prayer.startdate}][편집:${prayer.editdate}][응답:${prayer.answerdate}]`;
        prayerCategory.style.display = "inline-block";


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
        toggleButton.textContent = prayer.completed ? '미응답' : '응답';
        toggleButton.classList.add('toggle');
        toggleButton.addEventListener('click', () => {
            prayer.completed = !prayer.completed;
            if (prayer.completed) {
                const offset = new Date().getTimezoneOffset() * 60000;
                const today = new Date(Date.now()-offset).toISOString().substring(0,10).replace(/-/g,'.');
                prayer.answerdate = today;
            }
            else {
                prayer.answerdate = '****.**.**';
            }

            savePrayers();
            renderPrayers();
        });

        buttons.appendChild(editButton);
        buttons.appendChild(deleteButton);
        buttons.appendChild(toggleButton);

        div.appendChild(prayerCategory);
        div.appendChild(buttons);
        div.appendChild(prayerText);

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
            if(currentIndex >= filteredPrayers.length) {
                currentIndex = filteredPrayers.length-1;
            }
            const filteredPrayer = filteredPrayers[currentIndex];
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
        const offset = new Date().getTimezoneOffset() * 60000;
        const today = new Date(Date.now()-offset).toISOString().substring(0,10).replace(/-/g,'.');
        const prayerStartDate = today;
        const prayerEditDate = today;
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
                    editdate: '****.**.**',
                    answerdate: '****.**.**',
                    completed: false
                };
                prayers.push(newPrayer);
            }
            savePrayers();
            renderPrayers();
            prayerInput.value = '';
            //categorySelect.value = 'VIP';
            // hidePopup();
        }
    });

    addPrayerBtn.addEventListener('click', showPopup);
    closePopupBtn.addEventListener('click', hidePopup);

    searchInput.addEventListener('input', renderPrayers);
    statusFilter.addEventListener('change', renderPrayers);
    categoryFilter.addEventListener('change', renderPrayers);

    prevPrayerBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex = (currentIndex - 1 ) % totalCountDisplay.textContent;
            renderPrayers();
        }
    });

    nextPrayerBtn.addEventListener('click', () => {
        if (currentIndex < totalCountDisplay.textContent-1) {
            currentIndex = (currentIndex + 1) % totalCountDisplay.textContent;
            renderPrayers();
        }
    });
 /* 
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
    }); */

    exportPrayersBtn.addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(prayers, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const offset = new Date().getTimezoneOffset() * 60000;
        const today = new Date(Date.now()-offset);
        fileversion = today.toISOString().split('.')[0].replace(/[^\d]/gi, '.');
        a.href = url;
        a.download = 'prayers-' + fileversion + '.json';
        a.click();
        URL.revokeObjectURL(url);
    });

    importPrayersBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedPrayers = JSON.parse(e.target.result);
                    if (Array.isArray(importedPrayers)) {
                        prayers = importedPrayers;
                        savePrayers();
                        renderPrayers();
                    } else {
                        alert('잘못된 파일 형식입니다.');
                    }
                } catch (error) {
                    alert('파일을 읽는 중 오류가 발생했습니다.');
                }
            };
            reader.readAsText(file);
        }
    });
    renderPrayers();
});
