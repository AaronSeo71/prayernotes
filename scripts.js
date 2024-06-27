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
    },
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
    const deleteAllBtn = document.getElementById('delete-all-btn');
    const fileInput = document.getElementById('file-input');

    const editBtn = document.getElementById('edit-btn');
    const deleteBtn = document.getElementById('delete-btn');
    const toggleBtn = document.getElementById('toggle-btn');
    const upBtn = document.getElementById('up-btn');
    const downBtn = document.getElementById('down-btn');


    let prayers = JSON.parse(localStorage.getItem('prayers')) || [];
    let currentPrayerIndex = 0;
    let movetoPrayerIndex = 0;
    let currentPrayerId = 0;
    let editingId = null;

    // 날짜 포맷팅 헬퍼 함수
    const formatDate = (date) => {
        const offset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - offset).toISOString().substring(0, 10).replace(/-/g, '.');
    };

    const savePrayers = () => {
        localStorage.setItem('prayers', JSON.stringify(prayers));
    };

    const movePrayer = (fromindex, toindex, direction) => {
        if (direction === 'up' && fromindex > 0) {
            [prayers[fromindex], prayers[toindex]] = [prayers[toindex], prayers[fromindex]];
            prayerList.swiper.slidePrev(100);
        } else if (direction === 'down' && fromindex < prayers.length - 1) {
            [prayers[fromindex], prayers[toindex]] = [prayers[toindex], prayers[fromindex]];
            prayerList.swiper.slideNext(100);

        }
        savePrayers();
        renderPrayers();
    };

    const updateButtonStates = () => {
        currentPrayerIndex = prayers.findIndex(p => p.id === currentPrayerId);
        const prayer = prayers[currentPrayerIndex];
        editBtn.disabled = !prayer;
        deleteBtn.disabled = !prayer;
        toggleBtn.disabled = !prayer;
        upBtn.disabled = !prayer || currentPrayerIndex === 0;
        downBtn.disabled = !prayer || currentPrayerIndex === prayers.length - 1;
        
        if (prayer) {
            toggleBtn.textContent = prayer.completed ? '미응답' : '응답';
        }
    };

    editBtn.addEventListener('click', () => {
        const prayerIndex = prayers.findIndex(p => p.id === currentPrayerId);
        const prayer = prayers[prayerIndex];
        if (prayer) {
            prayerInput.value = prayer.text;
            categorySelect.value = prayer.category;
            editingId = prayer.id;
            showPopup();
        }
    });

    deleteBtn.addEventListener('click', () => {
        currentPrayerIndex = prayers.findIndex(p => p.id === currentPrayerId);
        const prayer = prayers[currentPrayerIndex];
        if (prayer) {
            if (confirm(`정말로 다음 기도 제목을 삭제하시겠습니까?\n\n"${prayer.text.substring(0, 50)}${prayer.text.length > 50 ? '...' : ''}"\n\n이 작업은 되돌릴 수 없습니다.`)) {
                prayers.splice(currentPrayerIndex, 1);
                savePrayers();
                if (currentPrayerIndex >= prayers.length) {
                    currentPrayerIndex = Math.max(prayers.length - 1, 0);
                }
                renderPrayers();
                updateButtonStates();
                alert('기도 제목이 삭제되었습니다.');
            }
        }
    });

    toggleBtn.addEventListener('click', () => {
        currentPrayerIndex = prayers.findIndex(p => p.id === currentPrayerId);
        const prayer = prayers[currentPrayerIndex];
        if (prayer) {
            prayer.completed = !prayer.completed;
            if (prayer.completed) {
                const today = formatDate(new Date());
                prayer.answerdate = today;
            } else {
                prayer.answerdate = '****.**.**';
            }
            savePrayers();
            renderPrayers();
            updateButtonStates();
        }
    });

    upBtn.addEventListener('click', () => {
        if (prayerList.swiper.activeIndex > 0) {
            currentPrayerIndex = prayers.findIndex(p => p.id === currentPrayerId);
            var movetoPrayerId = prayerList.swiper.slides[prayerList.swiper.activeIndex-1].id;
            movetoPrayerIndex = prayers.findIndex(p => p.id === Number(movetoPrayerId));
            movePrayer(currentPrayerIndex,movetoPrayerIndex,'up');
            updateButtonStates();
        }
    });

    downBtn.addEventListener('click', () => {
        if (prayerList.swiper.activeIndex < prayerList.swiper.slides.length - 1) {
            currentPrayerIndex = prayers.findIndex(p => p.id === currentPrayerId);
            var movetoPrayerId = prayerList.swiper.slides[prayerList.swiper.activeIndex+1].id;
            movetoPrayerIndex = prayers.findIndex(p => p.id === Number(movetoPrayerId));
            movePrayer(currentPrayerIndex,movetoPrayerIndex, 'down');
            updateButtonStates();
        }
    });

    const addPrayerToList = (prayer, index) => {
        const div = document.createElement('swiper-slide');
        div.id = prayer.id;
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

        
        div.appendChild(prayerCategory);
        div.appendChild(prayerText);

        prayerList.appendChild(div);
    };

    prayerList.swiper.on('activeIndexChange', (event) => {
        if (prayerList.swiper.slides.length > 0) {
            currentPrayerId = Number(prayerList.swiper.slides[prayerList.swiper.realIndex].id);
        }
        updateButtonStates();
    });
    prayerList.swiper.on('slideChange', (event) => {
        if (prayerList.swiper.slides.length > 0) {
            currentPrayerId = Number(prayerList.swiper.slides[prayerList.swiper.realIndex].id);
        }
        updateButtonStates();
    });

    prayerList.swiper.on('update', (event) => {
        if (prayerList.swiper.slides.length > 0) {
            currentPrayerId = Number(prayerList.swiper.slides[prayerList.swiper.realIndex].id);
        }
        updateButtonStates();
    });
    
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

    deleteAllBtn.addEventListener('click', () => {
        if (confirm('정말로 모든 기도 제목을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            prayers = [];
            savePrayers();
            renderPrayers();
            updateButtonStates();
            alert('모든 기도 제목이 삭제되었습니다.');
        }
    });
    
    renderPrayers();
    updateButtonStates();
});
