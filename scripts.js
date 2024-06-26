// scripts.js
const swiperEl = document.querySelector('swiper-container')
const params = {
    injectStyles: [`
      .swiper-pagination-bullet {
        width: 20px;
        height: 20px;
        text-align: center;
        line-height: 20px;
        font-size: 12px;
        color: #000;
        opacity: 1;
        background: rgba(0, 0, 0, 0.2);
      }

      .swiper-pagination-bullet-active {
        color: #fff;
        background: #007aff;
      }
      `],
    pagination: {
        clickable: true,
        renderBullet: function (index, className) {
            return '<span class="' + className + '">' + (index + 1) + "</span>";
        },
    },
    scrollbar: {
        draggable: true,
        dragSize: 30,
    }
}
Object.assign(swiperEl, params)
swiperEl.initialize();
// 윈도우 크기가 변경될 때 Swiper 업데이트
window.addEventListener('resize', () => {
    swiperEl.swiper.update();
});

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

    // 날짜 포맷팅 헬퍼 함수
    const formatDate = (date) => {
        const offset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - offset).toISOString().substring(0, 10).replace(/-/g, '.');
    };

    const savePrayers = () => {
        localStorage.setItem('prayers', JSON.stringify(prayers));
    };

    const movePrayer = (index, direction) => {
        if (direction === 'up' && index > 0) {
            [prayers[index], prayers[index - 1]] = [prayers[index - 1], prayers[index]];
            prayerList.swiper.slidePrev(100);
        } else if (direction === 'down' && index < prayers.length - 1) {
            [prayers[index], prayers[index + 1]] = [prayers[index + 1], prayers[index]];
            prayerList.swiper.slideNext(100);

        }
        savePrayers();
        renderPrayers();
    };

    const addPrayerToList = (prayer, index) => {
        const div = document.createElement('swiper-slide');
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
                const today = formatDate(new Date());
                prayer.answerdate = today;
            }
            else {
                prayer.answerdate = '****.**.**';
            }

            savePrayers();
            renderPrayers();
        });

        // New Up and Down Buttons
        const upButton = document.createElement('button');
        upButton.textContent = '위로';
        upButton.classList.add('up');
        upButton.addEventListener('click', () => {
            movePrayer(index, 'up');
        });

        const downButton = document.createElement('button');
        downButton.textContent = '아래로';
        downButton.classList.add('down');
        downButton.addEventListener('click', () => {
            movePrayer(index, 'down');
        });

        buttons.appendChild(editButton);
        buttons.appendChild(deleteButton);
        buttons.appendChild(toggleButton);
        buttons.appendChild(upButton);
        buttons.appendChild(downButton);

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
        filteredPrayers.forEach((prayer, index) => {
            addPrayerToList(prayer, index);
        });
        prayerList.swiper.update();
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
        const today = formatDate(new Date());
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
        }
    });

    addPrayerBtn.addEventListener('click', showPopup);
    closePopupBtn.addEventListener('click', hidePopup);

    searchInput.addEventListener('input', renderPrayers);
    statusFilter.addEventListener('change', renderPrayers);
    categoryFilter.addEventListener('change', renderPrayers);

    exportPrayersBtn.addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(prayers, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const offset = new Date().getTimezoneOffset() * 60000;
        const today = new Date(Date.now() - offset);
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
