// --- DOM Elements ---
document.addEventListener("DOMContentLoaded", () => {
  // Initialize Icons
  lucide.createIcons();
  
  // Setup Date Badge
  updateDateBadge();

  // Tab Setup
  initTabs();

  // Search Engine Setup
  initSearchEngine();

  // Handover Dropdowns Setup
  initHandoverSelector();

  // Excel Guide & Simulator Setup
  initExcelSimulator();

  // HWP Interactive Map Setup
  initHwpVisualGuide();

  // Expenditure Accordions & Checklists
  initExpenditureModule();

  // Byte Counter & Travel Calc
  initToolsModule();

  // AI Chatbot
  initAiChatbot();

  // Bookmarks
  initBookmarks();
  
  // Theme Toggle
  initThemeToggle();

  // Load default dashboard checklist
  renderDashboardChecklist();
});

/* ==========================================================================
   1. UTILITIES & THEME/DATE MANAGEMENT
   ========================================================================== */
function updateDateBadge() {
  const dateBadge = document.getElementById("today-date-badge");
  if (!dateBadge) return;
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const day = weekdays[now.getDay()];
  
  dateBadge.querySelector("span").textContent = `${year}. ${month}. ${date}.(${day})`;
}

function initThemeToggle() {
  const toggleBtn = document.getElementById("theme-toggle-btn");
  if (!toggleBtn) return;
  
  // Check LocalStorage
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  toggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    showToast(`${newTheme === 'dark' ? '다크 모드' : '라이트 모드'}가 활성화되었습니다.`, 'info');
  });
}

function showToast(message, type = 'success') {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let iconName = 'check-circle';
  let borderCol = 'var(--success)';
  if (type === 'warning') { iconName = 'alert-triangle'; borderCol = 'var(--warning)'; }
  if (type === 'danger') { iconName = 'x-circle'; borderCol = 'var(--danger)'; }
  if (type === 'info') { iconName = 'info'; borderCol = 'var(--info)'; }

  toast.style.borderLeft = `4px solid ${borderCol}`;
  toast.innerHTML = `
    <i data-lucide="${iconName}" style="width:16px;height:16px;"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  lucide.createIcons();

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

/* ==========================================================================
   2. BOOKMARKS SYSTEM
   ========================================================================== */
let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [
  { id: 'excel', label: '엑셀 수식 복사', tab: 'excel' },
  { id: 'hwp', label: '공문서 날짜 규칙', tab: 'hwp' }
];

function initBookmarks() {
  renderBookmarksList();
  
  const bmkBtn = document.getElementById("header-bookmark-btn");
  if (!bmkBtn) return;

  bmkBtn.addEventListener("click", () => {
    const currentTab = document.querySelector(".menu-item.active").getAttribute("data-tab");
    const currentTitle = document.getElementById("current-menu-title").textContent.trim();
    
    const existingIndex = bookmarks.findIndex(b => b.tab === currentTab);
    if (existingIndex > -1) {
      bookmarks.splice(existingIndex, 1);
      bmkBtn.classList.remove("bookmarked");
      showToast("즐겨찾기에서 제거되었습니다.", "warning");
    } else {
      bookmarks.push({
        id: currentTab,
        label: currentTitle,
        tab: currentTab
      });
      bmkBtn.classList.add("bookmarked");
      showToast("자주 찾는 페이지에 추가되었습니다.");
    }
    
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    renderBookmarksList();
  });
}

function renderBookmarksList() {
  const container = document.getElementById("bookmarks-list");
  if (!container) return;

  if (bookmarks.length === 0) {
    container.innerHTML = `<p class="bookmark-link" style="color: var(--text-muted); font-size:11px;">등록된 즐겨찾기가 없습니다.</p>`;
    return;
  }

  container.innerHTML = bookmarks.map(b => `
    <a href="#${b.tab}" class="bookmark-link" onclick="switchTab('${b.tab}'); return false;">
      <i data-lucide="star" style="width:12px;height:12px;color:var(--warning);fill:var(--warning)"></i>
      <span>${b.label}</span>
    </a>
  `).join("");
  lucide.createIcons();
}

function updateHeaderBookmarkBtn(tabId) {
  const bmkBtn = document.getElementById("header-bookmark-btn");
  if (!bmkBtn) return;

  const isBookmarked = bookmarks.some(b => b.tab === tabId);
  if (isBookmarked) {
    bmkBtn.classList.add("bookmarked");
  } else {
    bmkBtn.classList.remove("bookmarked");
  }
}

/* ==========================================================================
   3. SPA NAVIGATION & TABS
   ========================================================================== */
const tabMetaData = {
  'dashboard': {
    title: '대시보드',
    desc: '오늘 해야 할 업무와 자주 찾는 업무 지식을 확인하세요.',
    icon: 'layout-dashboard'
  },
  'handover': {
    title: '부서별 인수인계',
    desc: '부서와 담당 팀을 선택하여 수행할 고유 업무와 인수인계 매뉴얼을 찾아보세요.',
    icon: 'folder-git-2'
  },
  'excel': {
    title: '엑셀 실무 마스터',
    desc: '주민번호 추출, 날짜 계산, 명부 대조 등 공직 생활 필수 엑셀 팁과 템플릿입니다.',
    icon: 'file-spreadsheet'
  },
  'hwp': {
    title: '한글 공문서 규칙',
    desc: '올바른 날짜/시간 표기, 띄어쓰기, 붙임 기입 등 공공 기록물 생산 가이드를 제공합니다.',
    icon: 'file-text'
  },
  'expenditure': {
    title: '지출 & 회계 기초',
    desc: '출장 정산, 소모품 공용카드 지출, 강사료 지급 규칙 및 증빙 파일 목록입니다.',
    icon: 'credit-card'
  },
  'tools': {
    title: '행정 도구함',
    desc: '글자수/바이트 계산, 관내/관외 여비 자가진단 등 빠르고 유용한 행정 보조 툴입니다.',
    icon: 'wrench'
  },
  'ai-assistant': {
    title: 'AI 서무 비서',
    desc: '업무용 서무 매뉴얼, 공문 규격 등을 편리하게 묻고 답을 얻는 인공지능 시뮬레이터입니다.',
    icon: 'bot'
  }
};

function initTabs() {
  const menuItems = document.querySelectorAll(".sidebar-menu .menu-item");
  menuItems.forEach(item => {
    item.addEventListener("click", () => {
      const tabId = item.getAttribute("data-tab");
      switchTab(tabId);
    });
  });

  // Handle Hash routing on load
  const hash = window.location.hash.substring(1);
  if (hash && tabMetaData[hash]) {
    switchTab(hash);
  }
}

function switchTab(tabId) {
  if (!tabMetaData[tabId]) return;

  // Update active sidebar item
  document.querySelectorAll(".sidebar-menu .menu-item").forEach(item => {
    if (item.getAttribute("data-tab") === tabId) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // Toggle Tab visibility
  document.querySelectorAll(".tab-content").forEach(content => {
    content.classList.remove("active");
  });
  const activeTab = document.getElementById(`tab-${tabId}`);
  if (activeTab) {
    activeTab.classList.add("active");
  }

  // Update Header text
  const meta = tabMetaData[tabId];
  const headerTitle = document.getElementById("current-menu-title");
  const headerDesc = document.getElementById("current-menu-desc");
  
  if (headerTitle && headerDesc) {
    headerTitle.innerHTML = `<i data-lucide="${meta.icon}" style="color: var(--accent); vertical-align: middle; margin-right: 8px;"></i>${meta.title}`;
    headerDesc.textContent = meta.desc;
    lucide.createIcons();
  }

  // Update Bookmark state in header
  updateHeaderBookmarkBtn(tabId);

  // Set Hash
  window.location.hash = tabId;
}

/* ==========================================================================
   4. UNIFIED SEARCH ENGINE
   ========================================================================== */
const searchDatabase = [
  { title: "출장 여비 지급 기준", category: "지출/여비", tags: "출장, 여비, 교통비, 관내출장, 관외출장", tab: "expenditure", snippet: "관내출장 4시간 이상 20,000원 지급. 관외출장 운임 실비 및 일비 식비 지급 요령." },
  { title: "주민등록번호 성별 추출 엑셀 수식", category: "엑셀 수식", tags: "성별, 주민번호, IF, MID, 마스킹", tab: "excel", snippet: "=IF(OR(MID(A1,8,1)=\"1\",MID(A1,8,1)=\"3\"), \"남\", \"여\") 주민번호 뒷자리 성별 판별 수식." },
  { title: "공문서 날짜 표기법 규정", category: "한글 문서", tags: "공문서, 날짜, 온점, 띄어쓰기", tab: "hwp", snippet: "연, 월, 일 뒤에는 마침표를 찍고 한 칸 띄움. 예: 2026. 5. 26." },
  { title: "공문서 시간 표기법 규정", category: "한글 문서", tags: "시간, 시분, 쌍점", tab: "hwp", snippet: "시와 분은 쌍점(:)으로 표기하고 시분 글자는 생략. 예: 14:00 (14시 00분 X)" },
  { title: "공문서 끝 표시 규칙", category: "한글 문서", tags: "끝, 마침, 공문, 본문끝", tab: "hwp", snippet: "본문 문장이 끝나면 한 칸 띄우고 '끝.' 기재. 첨부물이 있을 경우 첨부물 명칭 뒤 1칸 띄우고 '끝.' 기재." },
  { title: "강사 수당 및 원고료 회계 정산", category: "지출/여비", tags: "강사료, 강사수당, 세금, 원천징수", tab: "expenditure", snippet: "12만 5천원 초과 지급 시 8.8% 세금 원천징수 의무 및 신분증, 통장 사본 확보." },
  { title: "글자수(바이트) 계산기", category: "행정 도구", tags: "바이트, 글자수, 기안문, 제한", tab: "tools", snippet: "한글 2바이트, 영문/공백/숫자 1바이트 기준 공문서 규격 글자수 체크." },
  { title: "공용카드 정산 증빙 서류 목록", category: "지출/여비", tags: "카드, 품의, 영수증, 지출결의", tab: "expenditure", snippet: "공용카드 정산 시 카드 매출전표, 품의서, 납품서(또는 사진대지) 등 첨부 규격." },
  { title: "출장 여비 자동 계산기", category: "행정 도구", tags: "여비계산, 자가진단, 시외출장, 공용차량", tab: "tools", snippet: "관외출장 시 일수 및 숙박 요건에 따른 총 여비 수당 자동 모의 연산 툴." },
  { title: "인사팀 주요 행정 스케줄", category: "부서 인수인계", tags: "인사, 인수인계, 복무, 신입, 교육", tab: "handover", snippet: "기획예산실/행정복지국 내 인사팀 전입 시 필수 숙지 업무 리스트." }
];

function initSearchEngine() {
  const overlay = document.getElementById("search-modal-overlay");
  const trigger = document.getElementById("search-trigger-btn");
  const closeBtn = document.getElementById("search-modal-close-btn");
  const searchInput = document.getElementById("search-modal-input");
  const resultsContainer = document.getElementById("search-results-list");

  if (!overlay || !trigger || !searchInput) return;

  // Toggle modal
  const openModal = () => {
    overlay.classList.add("active");
    searchInput.value = "";
    resultsContainer.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px;">검색어를 입력하시면 관련 서무 지식을 찾아 드립니다.</div>`;
    setTimeout(() => searchInput.focus(), 50);
  };

  const closeModal = () => {
    overlay.classList.remove("active");
  };

  trigger.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);

  // Esc Key & Ctrl+K Key Event
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      openModal();
    }
  });

  // Live Search logic
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
      resultsContainer.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px;">寃?됱뼱瑜??낅젰?섏떆硫?愿???쒕Т 吏?앹쓣 李얠븘 ?쒕┰?덈떎.</div>`;
      return;
    }

    const filtered = searchDatabase.filter(item => 
      item.title.toLowerCase().includes(query) || 
      item.category.toLowerCase().includes(query) || 
      item.tags.toLowerCase().includes(query) || 
      item.snippet.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
      resultsContainer.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px;">寃??寃곌낵媛 ?놁뒿?덈떎.</div>`;
      return;
    }

    resultsContainer.innerHTML = filtered.map(item => `
      <div class="search-result-item" onclick="switchTab('${item.tab}'); document.getElementById('search-modal-overlay').classList.remove('active');">
        <div class="result-header">
          <span class="result-title">${item.title}</span>
          <span class="result-category">${item.category}</span>
        </div>
        <p class="result-snippet">${item.snippet}</p>
      </div>
    `).join("");
  });
}
 const departmentData = {
  planning: {
    label: "기획예산실",
    divisions: {
      "planning-div": {
        label: "기획예산실",
        teams: {
          "planning-team": {
            label: "기획팀",
            updateDate: "2026. 05. 24.",
            duties: [
              { title: "군정 주요 정책 기획 및 조정", cycle: "정기", desc: "양구군 주요 중장기 발전계획 및 정책 기획 조정. 주요 현안 사업 관리.", refs: ["군정방침", "조직운영지침"] },
              { title: "지자체 합동 평가 및 통계 총괄", cycle: "연간(12월)", desc: "정부합동평가 지표 관리 및 군 자체 성과 평가 관리. 양구군 통계연보 편찬.", refs: ["지방정부평가법", "통계조사"] },
              { title: "의회 및 대외 업무 협력", cycle: "수시", desc: "양구군의회 요구 자료 부서별 수합 및 군정 보고 답변서 작성 조율.", refs: ["지방자치법"] }
            ],
            templates: [
              { name: "군정 성과 지표 보고 서식.hwp", size: "320KB" },
              { name: "양구군 통계연보 작성 규격 안내.pdf", size: "2.1MB" }
            ],
            weeklyChecklist: [
              { text: "정부합동평가 주요 실적 대비 목표 도달율 모니터링", checked: false },
              { text: "주간 정책 현안 보고자료 부서별 작성 독려", checked: false }
            ]
          },
          "budget-team": {
            label: "예산팀",
            updateDate: "2026. 05. 25.",
            duties: [
              { title: "세출 예산 편성 및 의회 심의 대응", cycle: "연간(9~12월)", desc: "양구군 실과별 세출 예산 요구액 심사 조정 및 본예산 편성 작업 총괄.", refs: ["지방재정법", "e-호조 시스템"] },
              { title: "추경(추가경정) 예산 조율 및 심사", cycle: "정기(연 2~3회)", desc: "국도비 매칭 변경 사업 반영 및 긴급 예산 소요 조율을 위한 추경 예산 편성.", refs: ["e-호조"] },
              { title: "지방재정 신속집행 실적 관리", cycle: "매주", desc: "상반기 소비투자 예산 집행 현황 모니터링 및 실과별 집행률 제고 회의 개최.", refs: ["신속집행관리지침"] }
            ],
            templates: [
              { name: "2026년도 본예산 편성 세부 요령.hwp", size: "2.4MB" },
              { name: "예산 전용 및 이체 신청서 서식.hwp", size: "115KB" }
            ],
            weeklyChecklist: [
              { text: "e-호조 재정 집행 모니터링 및 집행 저조 부서 통보", checked: false },
              { text: "행안부 신속집행 실적 취합 및 보고대장 작성", checked: true }
            ]
          },
          "audit-team": {
            label: "감사법무팀",
            updateDate: "2026. 05. 24.",
            duties: [
              { title: "자치법규 제·개정 심사 및 소송 수행", cycle: "수시", desc: "조례, 규칙, 훈령, 예규 등 자치법규의 법적 부합성 심사 및 조례규칙심의회 운영. 군정 관련 행정소송 및 행정심판 수행 총괄.", refs: ["지방자치법", "행정소송법", "행정절차법"] },
              { title: "공직기강 확립 및 공직자윤리제도 운영", cycle: "정기", desc: "공직기강 점검, 비위 자가진단 및 조사 처리. 공직자 재산등록·심사, 공직자윤리위원회 운영 및 청렴도 평가 시책 추진.", refs: ["공직자윤리법", "공무원행동강령", "지방공무원법"] },
              { title: "일상감사 및 계약심사 수행", cycle: "수시", desc: "양구군 주요 재정 사업, 공사, 용역, 물품 구매 계약 전 예산 낭비 요인 사전 예방을 위한 일상감사 및 계약심사 실시.", refs: ["지방재정법", "지방계약법", "일상감사지침"] },
              { title: "지방세 납세자보호관 제도 및 고충민원 처리", cycle: "수시", desc: "지방세 관련 고충민원 처리, 세무 상담 및 납세자 권리헌장 준수 실태 점검. 이의신청 및 과세전적부심사 등 청구 사건 해결.", refs: ["지방세기본법", "납세자보호관조례"] }
            ],
            templates: [
              { name: "양구군 조례·규칙 제·개정 기안문 서식.hwp", size: "220KB" },
              { name: "일상감사 및 계약심사 요청서 서식.hwp", size: "145KB" }
            ],
            weeklyChecklist: [
              { text: "금주 접수된 조례·규칙 안건 법적 부합성 사전 심사", checked: false },
              { text: "계약심사 및 일상감사 접수 건 결재 현황 모니터링", checked: true }
            ]
          },
          "pr-team": {
            label: "군정홍보팀",
            updateDate: "2026. 05. 23.",
            duties: [
              { title: "군정 종합 홍보 계획 수립 및 언론 보도 관리", cycle: "매일/정기", desc: "양구군 주요 시책 및 행사 언론 보도자료 배포, 언론사 취재 지원 및 보도 모니터링. 위기 관리 홍보 계획 수립.", refs: ["공보업무지침", "정부공문서규정"] },
              { title: "군정 소식지 및 홍보 매체 제작·운영", cycle: "월간/정기", desc: "양구군 공식 소식지(양구군보) 기사 취재, 편집 및 발간. 청사 내·외 군정 전광판 및 홍보물 설치 관리.", refs: ["양구군보발간조례"] },
              { title: "시각 홍보 자료 제작 및 시책 기록 관리", cycle: "수시", desc: "주요 시책 및 군정 행사 사진·영상 촬영 및 아카이빙 관리. 군 공식 SNS 채널 콘텐츠 제작 지원.", refs: ["공공기록물관리법"] }
            ],
            templates: [
              { name: "양구군 공식 보도자료 배포 표준 양식.hwp", size: "110KB" },
              { name: "군정 소식지 게재 건의 및 원고 작성 안.hwp", size: "95KB" }
            ],
            weeklyChecklist: [
              { text: "금주 배포 예정 보도자료 스케줄링 및 팩트 체크", checked: false },
              { text: "주요 행사 사진 및 영상 촬영 장비 점검 및 아카이빙", checked: true }
            ]
          },
          "strategic-team": {
            label: "미래전략팀",
            updateDate: "2026. 05. 26.",
            duties: [
              { title: "미래전략 기획 및 균형발전 시책 발굴", cycle: "정기", desc: "양구군 중장기 미래 성장동력 확보를 위한 미래전략 기획, 시책 발굴 및 국가 균형발전 관련 업무 수행.", refs: ["국가균형발전특별법", "군정중장기계획"] },
              { title: "공모사업 총괄 및 특수상황지역 개발", cycle: "수시", desc: "국도비 재원 확보를 위한 공모사업 총괄 운영 관리. 접경지역지원사업 및 특수상황지역개발사업 추진 총괄.", refs: ["접경지역지원특별법", "국비공모사업지침"] },
              { title: "백두과학화훈련장 이전 및 봉화산 개발", cycle: "수시", desc: "백두과학화훈련장 이전 추진 및 봉화산 일대 친환경 관광/체육 개발 시책 수립 및 관계 부처 협의.", refs: ["군사시설보호법", "관광진흥법"] },
              { title: "군부대 유휴부지 활용 및 특별자치도 특례 발굴", cycle: "수시", desc: "관내 군부대 해체/이전에 따른 유휴부지 현황 관리 및 주민 편익시설 활용대책 수립. 강원특별자치도법에 따른 지역 맞춤형 특례 발굴 관련 업무 수행.", refs: ["강원특별자치도법", "국방부유휴지매각지침"] }
            ],
            templates: [
              { name: "국비 공모사업 신청 및 총괄 관리 요령.pdf", size: "2.1MB" },
              { name: "강원특별자치도 양구군 특례 제안서 양식.hwp", size: "310KB" }
            ],
            weeklyChecklist: [
              { text: "접경지역 및 특수상황지역 개발 신규 사업 국비 집행 현황 확인", checked: false },
              { text: "군부대 유휴부지 지방 자산 매입 절차 관계 부처 공문 발송", checked: true }
            ]
          }
        }
      }
    }
  },
  admin: {
    label: "행정복지국",
    divisions: {
      "support-div": {
        label: "자치행정과",
        teams: {
          "general-team": {
            label: "자치행정팀",
            updateDate: "2026. 05. 22.",
            duties: [
              { title: "부서 복무 관리 및 당직 편성", cycle: "매일/매월", desc: "직원 출장, 연가, 조퇴 복무 상신 결재 검토 및 청내 일직/숙직 대장 관리.", refs: ["공무원복무규정"] },
              { title: "청내 행사 및 대외 교류 지원", cycle: "수시", desc: "군청 주요 회의실 대관 조율 및 내부 직원 경조사 지원(화환 발송).", refs: ["행정내부예약망"] },
              { title: "과 내부 서무 정기 지출결의", cycle: "매월(25일)", desc: "부서 소모품비, 매점비, 인쇄료, 정기 간담회비 등 카드/계좌이체 일괄 정산.", refs: ["세무회계관리지침"] }
            ],
            templates: [
              { name: "양구군 부서 인수인계서 표준 양식.hwp", size: "220KB" },
              { name: "간담회비 집행 품의 및 참석 명단 서식.hwp", size: "90KB" }
            ],
            weeklyChecklist: [
              { text: "다음 주 군청 당직 대리자 유무 파악 및 배치 결재", checked: false },
              { text: "과 공용 카드 전표 수합 및 e-호조 품의 확인", checked: false }
            ]
          },
          "personnel-team": {
            label: "인사조직팀",
            updateDate: "2026. 05. 20.",
            duties: [
              { title: "인사 평정 및 승진 심사 총괄", cycle: "반기별(4/10월)", desc: "근무성적평정 수합 및 인사위원회 개최 준비, 정기 승진 및 인사이동 조율.", refs: ["지방공무원법", "인사정보시스템"] },
              { title: "직원 맞춤형 복지포인트 관리", cycle: "연간(1~11월)", desc: "직원 맞춤형 복지 카드 정산 및 개인별 복지포인트 한도 배정 및 정산.", refs: ["맞춤형복지지침"] },
              { title: "신규 공무원 임용 및 교육 지원", cycle: "수시", desc: "신규 임용후보자 등록 및 선서서 조율, 강원도인재개발원 연수 일정 조정.", refs: ["인재개발지침"] }
            ],
            templates: [
              { name: "근무성적평정 등급 기준 및 이의신청서.hwp", size: "310KB" },
              { name: "공무원 맞춤형 복지포인트 청구 서식.pdf", size: "1.2MB" }
            ],
            weeklyChecklist: [
              { text: "인사이동에 따른 전입/전출자 인사카드 전자 정리", checked: true },
              { text: "이달의 휴직/복직 신청자 인사 서류 검토", checked: false }
            ]
          },
          "pop-team": { label: "인구정책팀" },
          "coop-team": { label: "민군협력팀" },
          "telecom-team": {
            label: "정보통신팀",
            updateDate: "2026. 05. 12.",
            duties: [
              { title: "청내 정보보안 및 전산기기 보급", cycle: "매일/정기", desc: "해킹 예방 및 개인정보 오남용 필터 모니터링, 업무용 PC 및 프린터 보급 관리.", refs: ["정보보안기본법"] },
              { title: "행정전화번호(내선) 관리", cycle: "수시", desc: "인사이동에 따른 군청 행정 내선번호 배정, 행정지도 내 연락처 DB 업데이트.", refs: ["행정망관리"] }
            ],
            templates: [
              { name: "업무용 PC 및 전산소모품 신청 서식.hwp", size: "110KB" },
              { name: "양구군 행정전화번호 변경 신청서.hwp", size: "85KB" }
            ],
            weeklyChecklist: [
              { text: "매주 사이버 보안 진단의 날 PC 검사 점검표 수합", checked: true },
              { text: "군청 홈페이지 부서 연락처 최신화 상태 점검", checked: false }
            ]
          }
        }
      },
      "civil-div": {
        label: "민원서비스과",
        teams: {
          "civil-admin-team": { label: "민원행정팀" },
          "land-team": { label: "토지관리팀" },
          "gis-team": { label: "공간정보팀" },
          "build-team": { label: "건축팀" },
          "house-team": { label: "주택팀" },
          "survey-team": { label: "지적재조사팀" }
        }
      },
      "education-div": {
        label: "평생교육과",
        teams: {
          "edu-policy-team": { label: "교육정책팀" },
          "learn-team": { label: "평생학습팀" },
          "youth-team": { label: "청소년팀" },
          "dream-team": { label: "드림스타트팀" }
        }
      },
      "welfare-div": {
        label: "사회복지과",
        teams: {
          "welfare-policy-team": { label: "복지정책팀" },
          "elder-disabled-team": { label: "노인장애인팀" },
          "women-child-team": { label: "여성아동팀" },
          "hope-welfare-team": { label: "희망복지팀" },
          "survey-welfare-team": { label: "통합조사팀" },
          "care-team": { label: "통합돌봄팀" }
        }
      },
      "environment-div": {
        label: "환경과",
        teams: {
          "env-policy-team": { label: "환경정책팀" },
          "recycle-team": { label: "자원순환팀" },
          "env-protect-team": { label: "환경보호팀" },
          "env-facility-team": { label: "환경시설관리팀" },
          "water-env-team": { label: "수질환경팀" }
        }
      },
      "accounting-div": {
        label: "세무회계과",
        teams: {
          "tax-team": {
            label: "세정팀",
            updateDate: "2026. 05. 24.",
            duties: [
              { title: "지방세 부과 및 징수 총괄", cycle: "정기", desc: "재산세, 자동차세, 주민세 등 지방세 세목별 부과 발송 및 수납 대사 관리.", refs: ["지방세법"] },
              { title: "지방세 체납액 징수 독려", cycle: "수시", desc: "고액 체납자 대상 독촉 고지서 발송 및 지방세 미납 차량 번호판 영치 계획 수립.", refs: ["지방세징수법"] }
            ],
            templates: [
              { name: "지방세 감면 및 비과세 신청 양식.hwp", size: "140KB" },
              { name: "지방세 체납 압류 예고문 표준안.hwp", size: "105KB" }
            ],
            weeklyChecklist: [
              { text: "지방세 수납액 가상계좌 실시간 수납 대사 작업", checked: true },
              { text: "체납 차량 영치 주간 실적 취합 및 전산 기록", checked: false }
            ]
          },
          "collection-team": { label: "징수팀" },
          "other-tax-team": { label: "세외수입팀" },
          "expenditure-team": {
            label: "경리팀",
            updateDate: "2026. 05. 26.",
            duties: [
              { title: "세출 예산 지출 최종 심사 및 송금", cycle: "매일", desc: "각 부서 지출 전표 및 첨부 증빙 파일 일치성 검토 후 농협(금고) 계좌 이체 실행.", refs: ["지방회계법", "e-호조"] },
              { title: "원천징수 국세/지방세 신고", cycle: "매월(10일)", desc: "양구군에서 집행한 강사료, 계약 대가 지출 공제액 원천징수 홈택스/위택스 자진 납부.", refs: ["소득세법"] }
            ],
            templates: [
              { name: "지출결의 증빙 서류 편철 방식 총괄 매뉴얼.pdf", size: "2.5MB" },
              { name: "원천세 징수 관리 대장 작성 양식.xlsx", size: "480KB" }
            ],
            weeklyChecklist: [
              { text: "일일 자금 운용 상황 및 금고 잔액 대사표 작성", checked: true },
              { text: "이체 오류 반송 금액 계좌번호 오류 실주 확인 정정", checked: false }
            ]
          },
          "contract-team": {
            label: "계약관리팀",
            updateDate: "2026. 05. 18.",
            duties: [
              { title: "공사/용역/물품 계약 의뢰 심사", cycle: "수시", desc: "추정가격 기준 공개입찰 및 수의계약 대상 검토, 조달청 나라장터 공고 진행.", refs: ["지방계약법", "나라장터시스템"] },
              { title: "계약 정보 공개 및 대장 관리", cycle: "매월", desc: "양구군 홈페이지 계약정보공개시스템 내 수의계약 체결 내역 등록 대장 관리.", refs: ["행정정보공개지침"] }
            ],
            templates: [
              { name: "소액 수의계약 요청서 및 견적서 제출 양식.hwp", size: "180KB" },
              { name: "계약보증금 지급각서 및 청구서 서식.hwp", size: "120KB" }
            ],
            weeklyChecklist: [
              { text: "나라장터 계약 체결 공고 완료 상태 매일 확인", checked: false },
              { text: "수의계약 체결 대장 작성 및 결재 상신", checked: true }
            ]
          },
          "property-team": { label: "재산관리팀" }
        }
      }
    }
  },
  economy: {
    label: "경제건설국",
    divisions: {
      "sports-div": {
        label: "경제체육과",
        teams: {
          "economy-policy-team": { label: "경제정책팀" },
          "company-team": { label: "기업지원팀" },
          "job-team": {
            label: "경제일자리팀",
            updateDate: "2026. 05. 22.",
            duties: [
              { title: "양구사랑상품권 발행 및 정산", cycle: "매일/매월", desc: "양구사랑상품권 지류 및 모바일 정산 대사, 가맹점 등록 심사 및 부정유통 모니터링.", refs: ["지역사랑상품권법"] },
              { title: "공공일자리 사업 선발 및 관리", cycle: "반기별", desc: "양구군 공공근로 및 지역공동체일자리 신청자 소득자산 조회, 대상자 선발.", refs: ["일자리지원지침"] }
            ],
            templates: [
              { name: "양구사랑상품권 가맹점 신청 양식.hwp", size: "230KB" },
              { name: "공공일자리 사업 참여 신청 및 자격 동의서.hwp", size: "190KB" }
            ],
            weeklyChecklist: [
              { text: "양구사랑상품권 모바일/카드 판매 대금 농협 정산 대조", checked: false },
              { text: "공공일자리 참여자 출근 기록 및 복무 카드 대사", checked: true }
            ]
          },
          "social-team": { label: "사회적경제팀" },
          "sports-promote-team": { label: "체육진흥팀" },
          "sports-facility-team": { label: "체육시설팀" }
        }
      },
      "tourism-div": {
        label: "관광문화과",
        teams: {
          "tour-policy-team": { label: "관광정책팀" },
          "tour-dev-team": { label: "관광개발팀" },
          "tour-manage-team": { label: "관광지운영팀" },
          "culture-art-team": { label: "문화예술팀" }
        }
      },
      "forest-div": {
        label: "생태산림과",
        teams: {
          "eco-resource-team": { label: "생태자원팀" },
          "forest-create-team": { label: "산림조성팀" },
          "forest-protect-team": { label: "산림보존팀" },
          "green-team": { label: "녹지조성팀" },
          "forest-manage-team": { label: "산림자원관리팀" }
        }
      },
      "safety-div": {
        label: "안전총괄과",
        teams: {
          "safety-manage-team": { label: "안전관리팀" },
          "disaster-team": { label: "방재관리팀" },
          "serious-accident-team": { label: "중대재해팀" },
          "cctv-team": { label: "통합관제팀" }
        }
      },
      "traffic-div": {
        label: "도시교통과",
        teams: {
          "city-plan-team": { label: "도시계획팀" },
          "city-infra-team": { label: "도시기반시설팀" },
          "traffic-admin-team": { label: "교통행정팀" },
          "public-traffic-team": { label: "대중교통팀" },
          "station-dev-team": { label: "역세권개발팀" },
          "dev-action-team": { label: "개발행위팀" }
        }
      },
      "construction-div": {
        label: "건설과",
        teams: {
          "construction-admin-team": {
            label: "건설행정팀",
            updateDate: "2026. 05. 19.",
            duties: [
              { title: "소규모 주민숙원사업 계획 수립", cycle: "연간/수시", desc: "마을별 농로 포장, 용배수로 정비 요구 사항 수합 및 현장 조사 계획 수립.", refs: ["건설행정조례"] },
              { title: "관내 도로 굴착 및 개설 인허가", cycle: "수시", desc: "도로 구역 점용 및 굴착 허가 신청서 서류 심사, 현장 도로 원상복구 확인 검수.", refs: ["도로법"] }
            ],
            templates: [
              { name: "도로점용(굴착) 허가 신청 및 안전조치 계획 서식.hwp", size: "160KB" },
              { name: "주민숙원사업 마을 건의서 표준 작성안.hwp", size: "95KB" }
            ],
            weeklyChecklist: [
              { text: "주간 도로 굴착 인허가 신청 현장 사진 대조 검토", checked: false },
              { text: "주민 불편 건의 현장 조사 대장 이력 기록", checked: true }
            ]
          },
          "disaster-facility-team": { label: "방재시설팀" },
          "road-team": { label: "도로관리팀" },
          "river-team": {
            label: "하천관리팀",
            updateDate: "2026. 05. 21.",
            duties: [
              { title: "관내 지방 하천 정비 및 공사 관리", cycle: "수시/장기", desc: "양구군 내 지방 하천 축제, 보강 정비 사업 공정 관리 및 준공 검사.", refs: ["하천법"] },
              { title: "재해 위험 지구 제방 보강 관리", cycle: "장마 전(3~6월)", desc: "우기 대비 수해 위험지역 제방 보강 공사 발주 및 모래주머니 비치 상태 모니터링.", refs: ["재난대비기준"] }
            ],
            templates: [
              { name: "하천 구역 점용 허가 신청 표준 서식.hwp", size: "150KB" },
              { name: "하천 재해 위험지구 안전 점검표.xlsx", size: "220KB" }
            ],
            weeklyChecklist: [
              { text: "지방하천 제방 균열 우려 지역 일일 안전 순찰", checked: false },
              { text: "소막 골 하천정비 준공계 검수 사진 편철", checked: true }
            ]
          },
          "local-dev-team": { label: "지역개발팀" }
        }
      }
    }
  },
  agri: {
    label: "농업기술센터",
    divisions: {
      "agri-policy-div": {
        label: "농업정책과",
        teams: {
          "agri-planning-team": { label: "농정기획팀" },
          "agri-support-team": { label: "농촌지원팀" },
          "agri-dev-team": { label: "농촌개발팀" },
          "smart-agri-team": { label: "스마트농업팀" },
          "agri-machinery-team": { label: "농업기계팀" }
        }
      },
      "agri-support-div": {
        label: "농업지원과",
        teams: {
          "eco-agri-team": { label: "친환경농업팀" },
          "crop-team": { label: "식량작물팀" },
          "horticulture-team": { label: "원예팀" },
          "fruit-team": { label: "과수특작팀" },
          "smart-agri-tf": { label: "스마트농업TF" }
        }
      },
      "dist-livestock-div": {
        label: "유통축산과",
        teams: {
          "marketing-team": { label: "마케팅팀" },
          "agri-food-team": { label: "농산식품팀" },
          "livestock-team": { label: "축산팀" },
          "animal-prevention-team": { label: "동물방역팀" },
          "inland-water-team": { label: "내수면팀" }
        }
      }
    }
  },
  health: {
    label: "보건소",
    divisions: {
      "health-policy-div": {
        label: "보건정책과",
        teams: {
          "health-admin-team": { label: "보건행정팀" },
          "sanitation-team": { label: "위생관리팀" },
          "infectious-disease-team": { label: "감염병관리팀" },
          "preventive-medicine-team": { label: "예방의약팀" }
        }
      },
      "health-promote-div": {
        label: "건강증진과",
        teams: {
          "health-promote-team": { label: "건강증진팀" },
          "medical-support-team": { label: "진료지원팀" },
          "visiting-health-team": { label: "방문보건팀" },
          "dementia-team": { label: "치매예방팀" }
        }
      }
    }
  },
  water: {
    label: "상하수도사업소",
    divisions: {
      "water-div": {
        label: "상하수도사업소",
        teams: {
          "water-admin-team": { label: "수도행정팀" },
          "water-operate-team": { label: "수도운영팀" },
          "water-facility-team": { label: "수도시설팀" },
          "sewage-team": { label: "하수도팀" }
        }
      }
    }
  },
  town: {
    label: "읍·면 행정복지센터",
    divisions: {
      "yanggu-town": {
        label: "양구읍",
        teams: {
          "yanggu-general-team": { label: "총무팀" },
          "yanggu-civil-team": { label: "민원팀" },
          "yanggu-welfare-team": { label: "맞춤형복지팀" },
          "yanggu-env-team": { label: "환경개발팀" },
          "yanggu-industry-team": { label: "산업팀" }
        }
      },
      "myeon-town": {
        label: "면 행정복지센터",
        teams: {
          "myeon-general-team": { label: "총무민원팀" },
          "myeon-welfare-team": { label: "맞춤형복지팀" },
          "myeon-env-team": { label: "환경개발팀" },
          "myeon-industry-team": { label: "산업팀" }
        }
      }
    }
  },
  assembly: {
    label: "양구군 의회",
    divisions: {
      "assembly-div": {
        label: "의회사무과",
        teams: {
          "assembly-policy-team": { label: "의정팀" },
          "assembly-work-team": { label: "의사팀" }
        }
      }
    }
  }
};

// Hydration Helper for empty teams
function getTeamDetails(deptKey, divKey, teamKey) {
  const dept = departmentData[deptKey];
  if (!dept) return null;
  const div = dept.divisions[divKey];
  if (!div) return null;
  const team = div.teams[teamKey];
  if (!team) return null;

  // Hydrate with dynamic fallback data if not defined
  if (!team.updateDate) team.updateDate = "2026. 05. 26.";
  
  if (!team.duties) {
    const label = team.label;
    let duties = [];
    let refs = [];
    let templates = [];
    let weeklyChecklist = [];

    if (label.includes("민원")) {
      duties = [
        { title: `${label} 기본 인허가 및 민원 상담`, cycle: "매일", desc: `양구군 주민 대상 ${label} 접수, 검토 및 새올행정민원 시스템 등록.`, refs: ["민원처리에관한법률"] },
        { title: `${label} 관련 공부 및 대장 관리`, cycle: "주간", desc: "민원 신청서 발급 내역 통계 취합 및 법정 보관 서류 시스템 백업.", refs: ["행정망기록보관"] }
      ];
      refs = ["민원법", "행정절차법"];
      templates = [
        { name: `${label} 신청 서식 및 안내장.hwp`, size: "140KB" },
        { name: `민원 신청서 검토 서식 대장.xlsx`, size: "320KB" }
      ];
      weeklyChecklist = [
        { text: "새올전자민원 접수 건 지연 유무 점검 및 결재", checked: false },
        { text: "주간 민원 만족도 모니터링 현황 보고서 작성", checked: false }
      ];
    } else if (label.includes("교육") || label.includes("평생") || label.includes("청소년") || label.includes("드림")) {
      duties = [
        { title: `${label} 프로그램 수립 및 홍보`, cycle: "정기", desc: "지역 주민/청소년 대상 교육 및 아동 보육 프로그램 설계 및 강사 모집 공고.", refs: ["평생교육법", "청소년복지법"] },
        { title: "프로그램 수당 및 정산 관리", cycle: "매월(25일)", desc: "외부 초빙 강사 자격 검증, 강의일지 취합 후 정산 지출결의서 회계 처리.", refs: ["세무지출규정"] }
      ];
      refs = ["평생교육법", "지자체교육조례"];
      templates = [
        { name: `${label} 프로그램 강사 일지 및 정산 서식.hwp`, size: "180KB" },
        { name: `수강생 명부 및 프로그램 운영 통계.xlsx`, size: "290KB" }
      ];
      weeklyChecklist = [
        { text: "교육장 및 프로그램 소모품 비치 및 청소 점검", checked: true },
        { text: "강사별 주간 강의 실적 일지 취합", checked: false }
      ];
    } else if (label.includes("복지") || label.includes("노인") || label.includes("장애") || label.includes("여성") || label.includes("아동")) {
      duties = [
        { title: `관내 취약계층 대상 복지 수급 자격 심사`, cycle: "수시", desc: "사회복지통합망(행복e음)을 통한 기초수급 및 복지 급여 자격 심사 및 현장 방문 상담.", refs: ["사회보장기본법", "행복e음"] },
        { title: "복지 급여비 정기 지급 및 대사", cycle: "매월(20일)", desc: "급여 대상자 통장 일치 확인 및 오류 반송 대금 재송금 작업 처리.", refs: ["사회보장급여법"] }
      ];
      refs = ["국민기초생활보장법", "행복e음시스템"];
      templates = [
        { name: `${label} 급여 수급 자격 신청 서식.hwp`, size: "210KB" },
        { name: `취약계층 방문 복지 상담 일지 서식.hwp`, size: "115KB" }
      ];
      weeklyChecklist = [
        { text: "행복e음 복지 수급자 자격 변동 내역 모니터링", checked: false },
        { text: "독거어르신 및 긴급지원가구 주간 현장 실태 조사", checked: true }
      ];
    } else if (label.includes("환경") || label.includes("자원") || label.includes("수질")) {
      duties = [
        { title: "관내 환경 오염 배출 시설 단속 및 점검", cycle: "수시", desc: "대기, 수질, 비산먼지 등 관내 사업장 오염물질 배출 현장 실태점검 및 지도단속.", refs: ["대기환경보존법", "물환경보존법"] },
        { title: "환경부담금 부과 및 폐기물 인허가", cycle: "정기", desc: "환경개선부담금 산정 부과 및 공사장 생활폐기물 온라인 배출 인허가 대장 관리.", refs: ["폐기물관리법"] }
      ];
      refs = ["환경보전법", "지방재정세입"];
      templates = [
        { name: `비산먼지 발생 및 특정공사 신고 양식.hwp`, size: "160KB" },
        { name: `환경개선부담금 규정 안내서.pdf`, size: "1.2MB" }
      ];
      weeklyChecklist = [
        { text: "미세먼지 비상저감조치 발령 대비 비상연락망 점검", checked: false },
        { text: "폐기물 불법소각 우려 지역 주간 순찰 대장 작성", checked: true }
      ];
    } else if (label.includes("농") || label.includes("축산") || label.includes("식품") || label.includes("동물")) {
      duties = [
        { title: "농가/축산 보조금 지원 사업 심사 및 교부", cycle: "정기", desc: "친환경 농업 지원금 및 축산 방역 소모품 구매 지원금 교부 신청 검토 및 정산.", refs: ["농업농촌공익직불법", "보조금법"] },
        { title: "가축 전염병 예방 방역 및 소독 관리", cycle: "매일/수시", desc: "거점 소독 시설 운영 현황 점검 및 축산 농가 예방 백신 공급 내역 대장 기록.", refs: ["가축전염병예방법"] }
      ];
      refs = ["농지법", "가축방역지침"];
      templates = [
        { name: `농업경영체 등록 및 보조금 교부 신청 서식.hwp`, size: "260KB" },
        { name: `가축방역 및 동물방역 관리대장 템플릿.xlsx`, size: "410KB" }
      ];
      weeklyChecklist = [
        { text: "가축 거점소독 초소 방역 차량 통계 대사", checked: true },
        { text: "농업 기계 임대 대여료 수납 실적 e-호조 확인", checked: false }
      ];
    } else if (label.includes("보건") || label.includes("건강") || label.includes("감염") || label.includes("치매")) {
      duties = [
        { title: "지역 보건 행정 및 의료 인허가", cycle: "정기", desc: "관내 약국, 의원 개설 허가 및 약무 지도 단속, 보건소 진료 실적 대사.", refs: ["지역보건법", "의료법"] },
        { title: "감염병 예방 관리 및 백신 접종 지원", cycle: "매일", desc: "코로나/독감 백신 접종 내역 질병관리청 시스템 대사 및 이상반응 모니럼.", refs: ["감염병예방법"] }
      ];
      refs = ["지역보건법", "의료법"];
      templates = [
        { name: `${label} 프로그램 신청 안내서.hwp`, size: "150KB" },
        { name: `치매 조기 검진 및 방문 보건 대장 서식.xlsx`, size: "380KB" }
      ];
      weeklyChecklist = [
        { text: "감염병 신고 핫라인 수신 상태 및 일일 실적 보고", checked: true },
        { text: "보건소 진료 의약품 잔고 파악 및 청구 결재", checked: false }
      ];
    } else if (label.includes("수도") || label.includes("하수도") || label.includes("상하수도")) {
      duties = [
        { title: "상하수도 요금 부과 및 징수 관리", cycle: "매월", desc: "수도 계량기 검침 데이터 취합 및 세입 가상계좌 수납 대사, 체납자 고지 송부.", refs: ["수도법", "지방세입법"] },
        { title: "취정수장 및 하수 처리 시설 유지보수", cycle: "매일/수시", desc: "정수장 수질 분석 결과 점검 및 노후관 교체 공사 현장 준공 대사.", refs: ["수도법"] }
      ];
      refs = ["하수도법", "지자체공기업회계"];
      templates = [
        { name: `상하수도 요금 감면 및 명의변경 신청 양식.hwp`, size: "120KB" },
        { name: `노후관 교체 공사 시공 전후 사진대지 서식.hwp`, size: "90KB" }
      ];
      weeklyChecklist = [
        { text: "양구 정수장 주간 수질 검사 결과표 확인 및 게시", checked: true },
        { text: "수도 요금 미납 체납 차량 압류 예고 결재", checked: false }
      ];
    } else if (label.includes("의정") || label.includes("의사") || label.includes("의회")) {
      duties = [
        { title: "의회 임시회/정례회 의사 일정 조율", cycle: "정기", desc: "양구군의회 본회의 및 위원회 소집 공고, 의원 발의 조례안 심의 일정 편성.", refs: ["지방자치법", "의회회의규칙"] },
        { title: "의정 본회의록 기록 및 공개", cycle: "매회", desc: "의원 발언 및 심의 결과 속기 취합, 최종 속기록 서명 날인 및 누리집 공포.", refs: ["공공기록물법"] }
      ];
      refs = ["지방자치법", "의회규칙"];
      templates = [
        { name: `양구군의회 임시회 소집 통지문 양식.hwp`, size: "110KB" },
        { name: `본회의 조례안 심의 의사록 표준 서식.hwp`, size: "230KB" }
      ];
      weeklyChecklist = [
        { text: "의회 제출용 안건 사전 검토 및 정리", checked: false },
        { text: "최종 통과 조례안 군수 이송 대장 작성 및 편철", checked: true }
      ];
    } else {
      // Default fallback
      duties = [
        { title: `${label} 시행 계획 수립 및 총괄`, cycle: "연간/정기", desc: `양구군 ${label} 세부 추진 계획 및 법정 지표 달성 관리 업무.`, refs: ["지방자치법"] },
        { title: `부서 예산 집행 및 지출 결의`, cycle: "매월(25일)", desc: `${label} 실무비 및 사업비 e-호조 전표 상신 및 증빙 문서 편철 관리.`, refs: ["지방회계법"] }
      ];
      refs = ["지방자치법", "행안부처리지침"];
      templates = [
        { name: `${label} 관련 표준 기안 서식 템플릿.hwp`, size: "130KB" },
        { name: `${label} 실무 행정 지침 가이드북.pdf`, size: "1.2MB" }
      ];
      weeklyChecklist = [
        { text: "부서 전자결재 미결 목록 및 지연문서 모니터링", checked: false },
        { text: "주간 업무 보고서 및 실과별 협조 목록 확인", checked: true }
      ];
    }

    team.duties = duties;
    team.refs = refs;
    team.templates = templates;
    team.weeklyChecklist = weeklyChecklist;
  }

  return team;
}

function initHandoverSelector() {
  const deptSelect = document.getElementById("handover-dept-selector");
  const divSelect = document.getElementById("handover-div-selector");
  const teamSelect = document.getElementById("handover-team-selector");
  const detailsArea = document.getElementById("handover-details-area");

  if (!deptSelect || !divSelect || !teamSelect || !detailsArea) return;

  // 1. Dept Change -> Populate Divisions
  deptSelect.addEventListener("change", () => {
    const deptKey = deptSelect.value;
    divSelect.innerHTML = `<option value="">-- 과 선택 --</option>`;
    teamSelect.innerHTML = `<option value="">-- 먼저 과를 선택하세요 --</option>`;
    divSelect.disabled = true;
    teamSelect.disabled = true;
    detailsArea.classList.remove("active");

    if (deptKey && departmentData[deptKey]) {
      const divisions = departmentData[deptKey].divisions;
      for (const divKey in divisions) {
        divSelect.innerHTML += `<option value="${divKey}">${divisions[divKey].label}</option>`;
      }
      divSelect.disabled = false;
    }
  });

  // 2. Division Change -> Populate Teams
  divSelect.addEventListener("change", () => {
    const deptKey = deptSelect.value;
    const divKey = divSelect.value;
    teamSelect.innerHTML = `<option value="">-- 팀 선택 --</option>`;
    teamSelect.disabled = true;
    detailsArea.classList.remove("active");

    if (deptKey && divKey && departmentData[deptKey].divisions[divKey]) {
      const teams = departmentData[deptKey].divisions[divKey].teams;
      for (const teamKey in teams) {
        teamSelect.innerHTML += `<option value="${teamKey}">${teams[teamKey].label}</option>`;
      }
      teamSelect.disabled = false;
    }
  });

  // 3. Team Change -> Populate Details Page
  teamSelect.addEventListener("change", () => {
    const deptKey = deptSelect.value;
    const divKey = divSelect.value;
    const teamKey = teamSelect.value;

    const team = getTeamDetails(deptKey, divKey, teamKey);

    if (team) {
      // Update UI Text
      document.getElementById("handover-team-title").textContent = `${team.label} 업무 요람`;
      
      // Render Duties
      const dutiesContainer = document.getElementById("handover-duties-list");
      dutiesContainer.innerHTML = team.duties.map(d => `
        <div class="duty-item">
          <div class="duty-header">
            <span class="duty-title">${d.title}</span>
            <span class="duty-cycle">${d.cycle}</span>
          </div>
          <p class="duty-desc">${d.desc}</p>
          <div class="duty-refs">
            ${d.refs.map(r => `<span class="ref-tag"># ${r}</span>`).join("")}
          </div>
        </div>
      `).join("");

      // Render Templates
      const templatesContainer = document.getElementById("handover-templates-list");
      templatesContainer.innerHTML = team.templates.map(t => `
        <button class="template-download-btn" onclick="triggerTemplateDownload('${t.name}')">
          <i data-lucide="download" style="width:14px;height:14px;"></i>
          <span>${t.name} (${t.size})</span>
        </button>
      `).join("");

      // Render Checklist
      const checklistContainer = document.getElementById("handover-weekly-checklist");
      checklistContainer.innerHTML = team.weeklyChecklist.map((c, i) => `
        <div class="todo-item">
          <input type="checkbox" class="todo-checkbox" id="weekly-chk-${i}" ${c.checked ? 'checked' : ''}>
          <label class="todo-text" for="weekly-chk-${i}">${c.text}</label>
        </div>
      `).join("");

      // Show panel & load icons
      detailsArea.classList.add("active");
      lucide.createIcons();
      showToast(`${team.label} 매뉴얼이 바인딩되었습니다.`, 'success');
    } else {
      detailsArea.classList.remove("active");
    }
  });
}

function triggerTemplateDownload(filename) {
  showToast(`[다운로드 시뮬레이션] ${filename} 파일 다운로드가 시작되었습니다.`, 'info');
}

/* ==========================================================================
   6. EXCEL GUIDE & INTERACTIVE TRY-OUT
   ========================================================================== */
const excelDatabase = [
  {
    category: "text",
    title: "주민등록번호 뒷자리 마스킹하기",
    formula: '=LEFT(A1,8)&"******"',
    desc: "개인정보 보호를 위해 주민등록번호 뒷자리 중 첫 자리를 제외하고 마스킹(별표) 처리하여 가리는 수식입니다.",
    example: '입력: 950824-1023456 -> 출력: 950824-1******'
  },
  {
    category: "text",
    title: "주민등록번호 기준 성별 판별하기",
    formula: '=IF(OR(MID(A1,8,1)="1",MID(A1,8,1)="3"), "남성", "여성")',
    desc: "주민등록번호 8번째 글자가 1 또는 3이면 '남성', 2 또는 4면 '여성'을 자동으로 반환하는 수식입니다. (외국인일 경우 5,7은 남성 / 6,8은 여성으로 확장 가능)",
    example: '입력: 010315-3012345 -> 출력: 남성'
  },
  {
    category: "lookup",
    title: "직원 명부에서 직급에 따른 전화번호 찾기",
    formula: '=VLOOKUP(찾을이름, 명부범위, 열번호, FALSE)',
    desc: "원하는 직원의 이름을 대입하여 인사 대장에서 해당하는 부서, 직급, 내선번호 등을 원클릭으로 추출할 때 사용합니다.",
    example: '=VLOOKUP("홍길동", A2:F100, 4, FALSE)'
  },
  {
    category: "math",
    title: "특정 부서(예: 기획팀) 예산 지출 총합 구하기",
    formula: '=SUMIF(부서열범위, "기획팀", 지출금액열범위)',
    desc: "조건부 집계식으로, 지정 범위에서 특정 키워드에 해당하는 셀의 값만 조건 합계를 내어 줍니다.",
    example: '=SUMIF(C2:C50, "기획팀", E2:E50)'
  },
  {
    category: "date",
    title: "두 날짜 사이의 근무 개월 수 계산 (근속 개월)",
    formula: '=DATEDIF(입사일, 오늘, "M") & "개월"',
    desc: "인사업무에서 근속 월수나 정기 휴가 일수 등을 정밀 계산할 때 유용한 비공식 엑셀 날짜 차이 함수입니다. 마지막 인수가 'M'이면 개월 수, 'Y'면 연 수.",
    example: '=DATEDIF(B2, TODAY(), "M")'
  }
];

function initExcelSimulator() {
  const container = document.getElementById("excel-formula-list");
  if (!container) return;

  // Render Formulas List
  renderExcelList('all');

  // Filter Event Listeners
  const filterBtns = document.querySelectorAll(".excel-filter-bar .filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const category = btn.getAttribute("data-filter");
      renderExcelList(category);
    });
  });

  // Simulator Inputs
  const ssnInput = document.getElementById("practice-ssn-input");
  const joinDateInput = document.getElementById("practice-join-date");
  
  if (ssnInput && joinDateInput) {
    const calculateSimulator = () => {
      const ssn = ssnInput.value.trim();
      const joinDateVal = joinDateInput.value;

      // 1. Calculate Gender & Birth
      let genderText = "형식 오류";
      if (ssn.length >= 8) {
        const keyChar = ssn.charAt(7); // 8th position
        if (keyChar === "1" || keyChar === "3") {
          genderText = "남성";
        } else if (keyChar === "2" || keyChar === "4") {
          genderText = "여성";
        } else {
          genderText = "기타/오류";
        }
      }
      document.getElementById("practice-gender-output").textContent = genderText;

      // 2. Calculate Tenure Months
      let tenureText = "날짜 오류";
      if (joinDateVal) {
        const start = new Date(joinDateVal);
        const end = new Date(); // today
        if (!isNaN(start.getTime())) {
          let months = (end.getFullYear() - start.getFullYear()) * 12;
          months -= start.getMonth();
          months += end.getMonth();
          tenureText = `${months <= 0 ? 0 : months}개월`;
        }
      }
      document.getElementById("practice-tenure-output").textContent = tenureText;
    };

    ssnInput.addEventListener("input", calculateSimulator);
    joinDateInput.addEventListener("change", calculateSimulator);
    calculateSimulator(); // run once on init
  }
}

function renderExcelList(filterCategory) {
  const container = document.getElementById("excel-formula-list");
  if (!container) return;

  const filtered = filterCategory === 'all' 
    ? excelDatabase 
    : excelDatabase.filter(f => f.category === filterCategory);

  container.innerHTML = filtered.map((f, i) => `
    <div class="excel-item">
      <div class="excel-header">
        <span class="excel-tag excel-tag-${f.category}">${getCategoryLabel(f.category)}</span>
        <button class="copy-btn" onclick="copyToClipboard('${f.formula.replace(/'/g, "\\'")}')">
          <i data-lucide="copy" style="width:12px;height:12px;"></i>
          <span>복사</span>
        </button>
      </div>
      <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 8px;">${f.title}</h3>
      <div class="excel-formula-box">${escapeHtml(f.formula)}</div>
      <p class="excel-description">${f.desc}</p>
      <div class="excel-example">${f.example}</div>
    </div>
  `).join("");
  lucide.createIcons();
}

function getCategoryLabel(cat) {
  if (cat === 'text') return '텍스트/추출';
  if (cat === 'lookup') return '찾기/참조';
  if (cat === 'math') return '수식/집계';
  if (cat === 'date') return '날짜/근속';
  return '기타';
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`클립보드에 수식이 복사되었습니다: ${text}`);
  }).catch(err => {
    showToast("클립보드 복사에 실패했습니다.", "danger");
  });
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ==========================================================================
   7. HWP INTERACTIVE VISUAL GUIDE
   ========================================================================== */
const hwpInstructions = {
  margins: {
    title: "편집용지 여백 및 폰트 표준",
    instructions: [
      "<strong>편집 여백:</strong> 위 20mm, 아래 15mm, 머리말 15mm, 꼬리말 15mm, 왼쪽/오른쪽은 각 20mm를 기본으로 합니다.",
      "<strong>기본 폰트:</strong> 공공서식 표준 폰트는 나눔고딕, 맑은 고딕 등을 주로 쓰며 본문 본 글꼴 크기는 12pt, 장평 100%, 자간 0% 기준입니다."
    ],
    wrong: "위 여백 35mm 과다 설정 또는 폰트 혼용(돋움, 궁서 혼용 X)",
    right: "정부공통 가이드 기준 한글 F7 용지 설정값 일치"
  },
  header: {
    title: "행정기관명 및 수신자 표시 규칙",
    instructions: [
      "<strong>행정기관명:</strong> 굵은 글씨로 14pt~16pt 정도로 기재하며, 기안 부서가 아닌 정식 지자체/기관명 표기.",
      "<strong>수신:</strong> 수신자명을 명기하고 괄호 안에 업무를 담당하는 과나 팀(예: 인사팀)을 참조 표기합니다."
    ],
    wrong: "수신: 인사과장 (과장 직위자 개인 수신처 지정 X)",
    right: "수신: 인사담당관(인사팀장) 또는 수신처 참조"
  },
  title: {
    title: "기안문 제목 작성법",
    instructions: [
      "기안문 제목은 제목 첫 시작 글자에서 띄어쓰기 없이 바로 이어서 작성합니다.",
      "줄바꿈이 생길 경우, 아래 행은 앞글자의 시작점과 정렬을 맞춰 들여쓰기를 수동 적용해야 문서가 깔끔합니다."
    ],
    wrong: "제 목 [띄어쓰기 과다] 신임 공직자 역량강화...",
    right: "제 목 신임 공직자 역량강화..."
  },
  body: {
    title: "본문 구성 및 띄어쓰기 규칙",
    instructions: [
      "본문의 첫 단락은 두 칸을 들여쓰고, 각 일련번호(1., 가., 1), 가))는 계층 구조에 맞춰 들여쓰기 깊이를 넓힙니다.",
      "날짜/시각 적기: 연, 월, 일 단위 뒤에 온점을 찍고 한 칸 띄는 것이 원칙이며 시분은 쌍점을 사용합니다."
    ],
    wrong: "일시: 2026.05.26 14시 (점 미적용 및 한글 시분 기재 X)",
    right: "일시: 2026. 5. 26. 14:00 (온점 및 공백 적용)"
  },
  attachment: {
    title: "붙임 파일 기입 요령",
    instructions: [
      "본문 내용 하단에 첨부 자료가 있을 때 '붙임'을 시작하고 번호를 메겨 명시합니다.",
      "여러 개일 때는 줄을 맞춰 적으며, 최종 붙임 리스트 끝에서 한 칸 띄우고 <strong>'끝.'</strong>을 기입합니다."
    ],
    wrong: "붙임: 교육 계획서 1부 끝. (붙임과 파일명 사이 공백 누락)",
    right: "붙임  1. 교육 계획서 1부.<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2. 명단 1부.  끝."
  },
  footer: {
    title: "발신 명의 및 직인",
    instructions: [
      "중요 공식 기안일 경우 해당 기관장 또는 결재권 위임 전결자의 직위를 명시합니다.",
      "명의의 오른쪽 여백 끝부분에 맞추거나 이름 뒤에 직인을 날인(혹은 전자 이미지 날인)합니다."
    ],
    wrong: "자치행정과 (과 이름만 적고 장 직위 누락 X)",
    right: "자치행정과장"
  }
};

function initHwpVisualGuide() {
  const markers = document.querySelectorAll(".hwp-marker");
  const panelTitle = document.querySelector("#hwp-detail-panel h4 span");
  const panelList = document.getElementById("hwp-detail-contents");
  const panelWrong = document.querySelector("#hwp-detail-comparison .comp-wrong");
  const panelRight = document.querySelector("#hwp-detail-comparison .comp-right");

  if (markers.length === 0 || !panelList) return;

  markers.forEach(marker => {
    const section = marker.getAttribute("data-section");
    
    // Hover & Click Effect
    marker.addEventListener("click", () => {
      const data = hwpInstructions[section];
      if (!data) return;

      // Update Panel UI
      panelTitle.textContent = data.title;
      panelList.innerHTML = data.instructions.map(inst => `
        <div class="instruction-item">
          <i data-lucide="check" style="width:14px;height:14px;color:var(--accent);"></i>
          <span>${inst}</span>
        </div>
      `).join("");
      
      panelWrong.innerHTML = `<strong>틀린 표기</strong><br>${data.wrong}`;
      panelRight.innerHTML = `<strong>올바른 표기</strong><br>${data.right}`;
      
      lucide.createIcons();
      showToast(`${data.title} 가이드가 표시되었습니다.`, 'info');
    });
  });
}

/* ==========================================================================
   8. EXPENDITURE ACCORDIONS & ATTACHMENTS
   ========================================================================== */
const expenditureChecklistData = {
  travel: [
    { text: "출장 품의서 결재 대장 출력본", required: true },
    { text: "출장 여비 청구서 및 정산 내역", required: true },
    { text: "시외/관외 출장 시 운임(KTX/고속버스) 실비 영수증", required: true },
    { text: "식비 및 통행료(민간 차량 이용 시) 증빙 전표", required: false }
  ],
  "card-goods": [
    { text: "소모품 구입 지출 품의서", required: true },
    { text: "공공구매카드 신용카드 매출전표", required: true },
    { text: "납품서 (또는 검수 보고서)", required: true },
    { text: "구입 전/후 물품 검수 증빙 사진대지", required: true },
    { text: "견적서 (소액 이상 구매 시)", required: false }
  ],
  lecturer: [
    { text: "강사 초빙 기획(자문) 품의서", required: true },
    { text: "외부 강사 이력서 및 프로필 자료", required: true },
    { text: "강사 본인 명의 통장 사본", required: true },
    { text: "주민등록증 사본 (원천세 신고용)", required: true },
    { text: "강의(자문) 일지 및 참석부 원본", required: true }
  ],
  repair: [
    { text: "공사/수선 기안문 및 계약 성립 서류", required: true },
    { text: "시공(수리) 완료 전/후 대조 사진대지", required: true },
    { text: "세금계산서 또는 업체 청구 영수증", required: true },
    { text: "사업자등록증 사본", required: true },
    { text: "통장 및 통장사본 일치 이체 의뢰서", required: true }
  ]
};

function initExpenditureModule() {
  // Accordions Toggle
  const accordionHeaders = document.querySelectorAll(".accordion-header");
  accordionHeaders.forEach(header => {
    header.addEventListener("click", () => {
      const item = header.parentElement;
      const isActive = item.classList.contains("active");
      
      // Close all accordions
      document.querySelectorAll(".accordion-item").forEach(acc => {
        acc.classList.remove("active");
        acc.querySelector(".accordion-body").style.maxHeight = null;
      });

      // Toggle current accordion
      if (!isActive) {
        item.classList.add("active");
        const body = item.querySelector(".accordion-body");
        body.style.maxHeight = body.scrollHeight + "px";
      }
    });
  });

  // Attachments dynamic checklist
  const typeSelect = document.getElementById("expenditure-type-select");
  if (typeSelect) {
    typeSelect.addEventListener("change", () => {
      renderExpenditureChecklist(typeSelect.value);
    });
    renderExpenditureChecklist(typeSelect.value); // default
  }
}

function renderExpenditureChecklist(type) {
  const container = document.getElementById("expenditure-checklist-results");
  if (!container || !expenditureChecklistData[type]) return;

  const items = expenditureChecklistData[type];
  container.innerHTML = items.map((item, idx) => `
    <div class="todo-item">
      <input type="checkbox" class="todo-checkbox" id="exp-chk-${idx}">
      <div class="todo-text">
        ${item.text}
        ${item.required ? `<span style="font-size:10px; font-weight:700; color:var(--danger); background:var(--danger-bg); padding:1px 4px; border-radius:3px; margin-left:4px;">필수</span>` : `<span style="font-size:10px; font-weight:700; color:var(--text-muted); background:var(--bg-base); padding:1px 4px; border-radius:3px; margin-left:4px;">해당시</span>`}
      </div>
    </div>
  `).join("");
}

/* ==========================================================================
   9. HANDHELD TOOLS & CALCULATORS
   ========================================================================== */
function initToolsModule() {
  // 1. Byte Counter
  const textarea = document.getElementById("tools-textarea");
  if (textarea) {
    textarea.addEventListener("input", () => {
      const text = textarea.value;
      const totalLen = text.length;
      const noSpaceLen = text.replace(/\s/g, "").length;
      
      // Public Service Byte Calculation Rule:
      // Korean, Chinese, Japanese, Special Full-width chars: 2 bytes
      // English, Numbers, Space, Tab, Standard Punctuation: 1 byte
      let byteCount = 0;
      for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        if (code > 127) {
          byteCount += 2; // Korean, etc
        } else {
          byteCount += 1; // English/spaces, etc
        }
      }

      document.getElementById("char-total-count").textContent = totalLen;
      document.getElementById("char-no-space-count").textContent = noSpaceLen;
      document.getElementById("char-byte-count").textContent = byteCount;
    });
  }

  // 2. Travel Allowance Calculator
  const calcType = document.getElementById("travel-calc-type");
  const calcCarSelect = document.getElementById("travel-calc-car");
  const localCarGroup = document.getElementById("local-car-group");
  const nationalDetailsGroup = document.getElementById("national-details-group");
  
  const calcDays = document.getElementById("travel-calc-days");
  const calcLodging = document.getElementById("travel-calc-lodging");
  const calcResult = document.getElementById("travel-calc-result");

  if (calcType && calcResult) {
    const updateTravelResult = () => {
      const type = calcType.value;
      let total = 0;

      if (type === 'local-short') {
        localCarGroup.style.display = 'block';
        nationalDetailsGroup.style.display = 'none';
        
        // 4시간 미만 관내 출장 기본 10,000원
        total = 10000;
        
        // Local Short also checks car usage (some policies reduce for car usage but standard is no reduction or 5,000)
        // We will keep it simple.
      } else if (type === 'local-long') {
        localCarGroup.style.display = 'block';
        nationalDetailsGroup.style.display = 'none';
        
        // 4시간 이상 관내 출장 기본 20,000원
        total = 20000;
        if (calcCarSelect.value === 'yes') {
          total -= 10000; // 10,000 KRW reduction for public car
        }
      } else if (type === 'national') {
        localCarGroup.style.display = 'none';
        nationalDetailsGroup.style.display = 'grid';

        const days = parseInt(calcDays.value) || 1;
        const lodging = parseInt(calcLodging.value) || 0;

        // National: 
        // 1. Daily Allowance (일비): 20,000 KRW per day
        // 2. Meal Allowance (식비): 25,000 KRW per day (or meals depend on days)
        // 3. Lodging Allowance (숙박비): Standard 70,000 KRW per night
        const dailyAllowance = days * 20000;
        const mealAllowance = days * 25000;
        const lodgingAllowance = lodging * 70000;

        total = dailyAllowance + mealAllowance + lodgingAllowance;
      }

      calcResult.textContent = `${total.toLocaleString()} 원`;
    };

    calcType.addEventListener("change", updateTravelResult);
    calcCarSelect.addEventListener("change", updateTravelResult);
    calcDays.addEventListener("input", updateTravelResult);
    calcLodging.addEventListener("input", updateTravelResult);
    
    updateTravelResult(); // init
  }
}

/* ==========================================================================
   10. AI ASSISTANT (CHATBOT MOCKUP)
   ========================================================================== */
const aiQADatabase = [
  {
    keywords: ["출장", "여비", "교통비", "일비"],
    answer: "🚗 <strong>출장 여비 규정 안내:</strong><br>- 관내출장(4시간 이상): 2만원 지급 (공용 차량 이용 시 1만원 차감)<br>- 관내출장(4시간 미만): 1만원 지급<br>- 관외출장(시외): 일비 2만원, 식비 2.5만원이 일수 기준 지급되며, 숙박비는 1박당 최대 7만원 실비 증빙 범위 내에서 정지급됩니다. 영수증 편철이 필수입니다. 상세 연산은 <strong>'행정 도구함'</strong> 탭의 여비 자가진단을 활용해보세요."
  },
  {
    keywords: ["엑셀", "주민번호", "성별", "주민등록번호"],
    answer: "📊 <strong>주민등록번호 성별 판별법:</strong><br>엑셀 셀(A1)에 주민등록번호가 입력되어 있다면 아래 수식을 사용하십시오.<br><code>=IF(OR(MID(A1,8,1)=\"1\",MID(A1,8,1)=\"3\"), \"남성\", \"여성\")</code><br>주민번호 8번째 자리를 추출(MID)하여 1 또는 3일 때 남성으로 분류해 줍니다. <strong>'엑셀 실무 마스터'</strong> 탭에서 라이브 실습이 가능합니다."
  },
  {
    keywords: ["날짜", "공문서", "한글", "시간", "띄어쓰기"],
    answer: "✍️ <strong>공문서 규격 날짜/시간 기입 규칙:</strong><br>- 날짜: <strong>'2026. 5. 26.'</strong> 과 같이 연, 월, 일 숫자 뒤에 마침표를 찍고 반드시 한 칸을 띕니다.<br>- 시간: 24시간 형식으로 작성하며 시/분 글자 대신 쌍점(:)을 씁니다. 예: <strong>'14:00'</strong> (14시 0분 X)<br>더 시각적인 설명은 <strong>'한글 공문서 규칙'</strong> 탭의 도큐먼트 핫스팟 가이드를 클릭해 보세요."
  },
  {
    keywords: ["지출", "회계", "카드", "증빙", "결의서"],
    answer: "💳 <strong>지출결의서 증빙 서류 요건:</strong><br>공용카드로 소모품 등을 구입 시 아래 서류를 누락 없이 편철해야 회계 부서에서 승인됩니다.<br>1. 지출 품의서<br>2. 신용카드 영수증 원본<br>3. 납품서 또는 거래내역서<br>4. 검수 완료 전/후 사진대지<br>더 정확한 지출유형별 구비 서류는 <strong>'지출 & 회계 기초'</strong> 탭의 자동 판별기를 써보십시오."
  },
  {
    keywords: ["인수인계", "매뉴얼", "부서", "팀"],
    answer: "📂 <strong>부서별 인수인계 찾기:</strong><br>상단 메뉴의 <strong>'부서별 인수인계'</strong> 탭으로 가시면 기획예산실, 행정복지국 등의 상세 부서별 고유 업무 정보와 연간 일정, 인수인계용 표준 양식들을 즉시 다운로드할 수 있습니다."
  }
];

function initAiChatbot() {
  const sendBtn = document.getElementById("ai-chat-send-btn");
  const chatInput = document.getElementById("ai-chat-input");
  const messagesContainer = document.getElementById("ai-chat-messages-container");

  if (!sendBtn || !chatInput || !messagesContainer) return;

  const handleUserMessage = (msgText) => {
    if (!msgText.trim()) return;

    // 1. Render User Bubble
    renderChatBubble(msgText, 'user');
    chatInput.value = "";
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // 2. Simulate AI thinking & reply
    setTimeout(() => {
      let matchedAnswer = "죄송합니다. 질문하신 키워드에 대한 기본 답변 데이터가 등록되어 있지 않습니다. '여비', '엑셀 성별', '공문서 날짜', '카드 정산' 등으로 다시 질문해주시겠습니까?";
      
      const query = msgText.toLowerCase();
      for (const item of aiQADatabase) {
        const found = item.keywords.some(kw => query.includes(kw));
        if (found) {
          matchedAnswer = item.answer;
          break;
        }
      }
      
      renderChatBubble(matchedAnswer, 'ai');
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 600);
  };

  sendBtn.addEventListener("click", () => {
    handleUserMessage(chatInput.value);
  });

  chatInput.addEventListener("keydown", (e) => {
    if (e.key === 'Enter') {
      handleUserMessage(chatInput.value);
    }
  });
}

function askAi(question) {
  // Global function called when suggestion chips are clicked
  const chatInput = document.getElementById("ai-chat-input");
  if (chatInput) {
    chatInput.value = question;
    const sendBtn = document.getElementById("ai-chat-send-btn");
    if (sendBtn) sendBtn.click();
  }
}

function renderChatBubble(text, sender) {
  const container = document.getElementById("ai-chat-messages-container");
  if (!container) return;

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const bubbleWrapper = document.createElement("div");
  bubbleWrapper.className = `chat-bubble-wrapper ${sender}`;

  bubbleWrapper.innerHTML = `
    <div class="chat-avatar">${sender === 'ai' ? 'AI' : '나'}</div>
    <div class="chat-bubble">${text}</div>
    <div class="chat-time">${timeStr}</div>
  `;

  container.appendChild(bubbleWrapper);
}

/* ==========================================================================
   11. INITIAL DASHBOARD DATA (TODO LISTS)
   ========================================================================== */
const defaultTodos = [
  { text: "자치행정과 공문 수발신 내역 결재 대장 취합", priority: "urgent", checked: false },
  { text: "외부 자문 강사료 지급결의 기안서 상신", priority: "normal", checked: false },
  { text: "이번 주 소속 부서 간담회비 카드 정산 증빙 편철", priority: "normal", checked: true },
  { text: "보도자료 요약문 글자수 계산기 활용 바이트 검토", priority: "low", checked: false }
];

function renderDashboardChecklist() {
  const container = document.getElementById("dashboard-todo-list");
  if (!container) return;

  container.innerHTML = defaultTodos.map((t, i) => `
    <div class="todo-item">
      <input type="checkbox" class="todo-checkbox" id="dash-todo-${i}" ${t.checked ? 'checked' : ''} onchange="toggleDashTodo(${i})">
      <label class="todo-text" for="dash-todo-${i}">${t.text}</label>
      <span class="todo-badge badge-${t.priority}">${getPriorityLabel(t.priority)}</span>
    </div>
  `).join("");
}

function toggleDashTodo(idx) {
  if (defaultTodos[idx]) {
    defaultTodos[idx].checked = !defaultTodos[idx].checked;
    renderDashboardChecklist();
    showToast(defaultTodos[idx].checked ? "작업을 완료로 표시했습니다." : "작업을 미완료로 돌렸습니다.", "info");
  }
}

function getPriorityLabel(pr) {
  if (pr === 'urgent') return '긴급';
  if (pr === 'normal') return '일반';
  if (pr === 'low') return '낮음';
  return '';
}
