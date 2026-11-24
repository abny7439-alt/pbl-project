/**
 * EduTrack - Student Attendance Management System
 * Author: Antigravity PBL Project
 * Core JavaScript Application File
 */

// ==========================================================================
// 1. Storage Keys & Initial Constants
// ==========================================================================
const STORAGE_KEYS = {
  STUDENTS: 'edutrack_students',
  ATTENDANCE: 'edutrack_attendance',
  CLASSES: 'edutrack_classes',
  SETTINGS: 'edutrack_settings'
};

const DEFAULT_CLASSES = [
  'Grade 10-A',
  'Grade 10-B',
  'Grade 11-A',
  'Grade 12-A'
];

// In-Memory Application State
let appState = {
  students: [],
  attendance: {}, // { 'YYYY-MM-DD': { studentId: 'present' | 'absent' } }
  classes: [],
  currentTab: 'dashboard',
  selectedDate: '',
  reportDate: ''
};

// Chart instances
let weeklyTrendChartInstance = null;
let todayDoughnutChartInstance = null;

// ==========================================================================
// 2. Date Helpers
// ==========================================================================
function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function getDayOfWeek(dateStr) {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

// ==========================================================================
// 3. LocalStorage Handlers & Sample Data Seeder
// ==========================================================================
function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    updateStorageSizeDisplay();
  } catch (err) {
    console.error('LocalStorage write failed:', err);
    showToast('Failed to save data. LocalStorage might be full.', 'error');
  }
}

function loadFromStorage(key, fallbackValue) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallbackValue;
  } catch (err) {
    console.error('LocalStorage read failed:', err);
    return fallbackValue;
  }
}

function getInitialSampleData() {
  const students = [
    { id: 'std_101', rollNumber: 'CS-101', name: 'Aarav Sharma', email: 'aarav.sharma@school.edu', className: 'Grade 10-A', createdAt: '2026-11-01' },
    { id: 'std_102', rollNumber: 'CS-102', name: 'Sophia Chen', email: 'sophia.chen@school.edu', className: 'Grade 10-A', createdAt: '2026-11-01' },
    { id: 'std_103', rollNumber: 'CS-103', name: 'Marcus Johnson', email: 'marcus.j@school.edu', className: 'Grade 10-A', createdAt: '2026-11-01' },
    { id: 'std_104', rollNumber: 'CS-104', name: 'Ananya Patel', email: 'ananya.patel@school.edu', className: 'Grade 10-B', createdAt: '2026-11-01' },
    { id: 'std_105', rollNumber: 'CS-105', name: 'Liam Davis', email: 'liam.davis@school.edu', className: 'Grade 10-B', createdAt: '2026-11-01' },
    { id: 'std_106', rollNumber: 'CS-106', name: 'Emma Wilson', email: 'emma.wilson@school.edu', className: 'Grade 10-B', createdAt: '2026-11-01' },
    { id: 'std_107', rollNumber: 'CS-107', name: 'Devon Brooks', email: 'devon.brooks@school.edu', className: 'Grade 11-A', createdAt: '2026-11-01' },
    { id: 'std_108', rollNumber: 'CS-108', name: 'Priya Nair', email: 'priya.nair@school.edu', className: 'Grade 11-A', createdAt: '2026-11-01' },
    { id: 'std_109', rollNumber: 'CS-109', name: 'Lucas Miller', email: 'lucas.miller@school.edu', className: 'Grade 11-A', createdAt: '2026-11-01' },
    { id: 'std_110', rollNumber: 'CS-110', name: 'Olivia Martinez', email: 'olivia.m@school.edu', className: 'Grade 12-A', createdAt: '2026-11-01' },
    { id: 'std_111', rollNumber: 'CS-111', name: 'Ethan Taylor', email: 'ethan.taylor@school.edu', className: 'Grade 12-A', createdAt: '2026-11-01' },
    { id: 'std_112', rollNumber: 'CS-112', name: 'Zara Khan', email: 'zara.khan@school.edu', className: 'Grade 12-A', createdAt: '2026-11-01' }
  ];

  // Generate historical attendance for the last 8 days including today
  const attendance = {};
  const today = new Date();

  // Pattern matrix for realistic attendance across sample students
  const samplePresents = [
    // [std_101, std_102, ... std_112]
    [true, true, true, true, false, true, true, true, true, true, false, true], // Day 7 ago
    [true, true, false, true, true, true, true, false, true, true, true, true],  // Day 6 ago
    [true, true, true, true, true, true, false, true, true, true, true, false], // Day 5 ago
    [true, false, true, true, true, true, true, true, false, true, true, true], // Day 4 ago
    [true, true, true, false, true, true, true, true, true, true, false, true], // Day 3 ago
    [true, true, true, true, true, false, true, true, true, true, true, true],  // Day 2 ago
    [true, true, false, true, true, true, true, true, true, false, true, true], // Yesterday
    [true, true, true, true, false, true, true, true, true, true, true, false]  // Today
  ];

  for (let i = 7; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    attendance[dateStr] = {};
    const pattern = samplePresents[7 - i] || samplePresents[0];
    students.forEach((std, idx) => {
      attendance[dateStr][std.id] = pattern[idx] ? 'present' : 'absent';
    });
  }

  return { students, attendance, classes: DEFAULT_CLASSES };
}

function initializeState() {
  const storedStudents = loadFromStorage(STORAGE_KEYS.STUDENTS, null);
  const storedAttendance = loadFromStorage(STORAGE_KEYS.ATTENDANCE, null);
  const storedClasses = loadFromStorage(STORAGE_KEYS.CLASSES, null);

  if (!storedStudents || storedStudents.length === 0) {
    // Seed initial demo data
    const sample = getInitialSampleData();
    appState.students = sample.students;
    appState.attendance = sample.attendance;
    appState.classes = sample.classes;
    saveToStorage(STORAGE_KEYS.STUDENTS, appState.students);
    saveToStorage(STORAGE_KEYS.ATTENDANCE, appState.attendance);
    saveToStorage(STORAGE_KEYS.CLASSES, appState.classes);
  } else {
    appState.students = storedStudents;
    appState.attendance = storedAttendance || {};
    appState.classes = (storedClasses && storedClasses.length > 0) ? storedClasses : DEFAULT_CLASSES;
  }

  const todayStr = getTodayDateString();
  appState.selectedDate = todayStr;
  appState.reportDate = todayStr;
}

// ==========================================================================
// 4. UI Rendering: Navigation & View Switching
// ==========================================================================
function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const menuToggleBtn = document.getElementById('menuToggleBtn');
  const sidebar = document.getElementById('sidebar');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');
  const quickMarkBtn = document.getElementById('quickMarkBtn');
  const dashViewReportsBtn = document.getElementById('dashViewReportsBtn');

  // Toggle mobile sidebar
  function openSidebar() {
    sidebar.classList.add('open');
    sidebarBackdrop.classList.add('active');
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarBackdrop.classList.remove('active');
  }

  if (menuToggleBtn) menuToggleBtn.addEventListener('click', openSidebar);
  if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeSidebar);
  if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebar);

  // Nav click handlers
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = link.getAttribute('data-tab');
      switchTab(tabId);
      closeSidebar();
    });
  });

  // Header quick mark button
  if (quickMarkBtn) {
    quickMarkBtn.addEventListener('click', () => {
      appState.selectedDate = getTodayDateString();
      const datePicker = document.getElementById('attendanceDatePicker');
      if (datePicker) datePicker.value = appState.selectedDate;
      switchTab('mark-attendance');
    });
  }

  // Dashboard view reports shortcut button
  if (dashViewReportsBtn) {
    dashViewReportsBtn.addEventListener('click', () => {
      switchTab('attendance-reports');
    });
  }

  // Handle URL hash changes
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['dashboard', 'students', 'mark-attendance', 'attendance-reports', 'settings'].includes(hash)) {
      switchTab(hash);
    }
  });

  // Trigger initial tab from hash or default to dashboard
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash && ['dashboard', 'students', 'mark-attendance', 'attendance-reports', 'settings'].includes(initialHash)) {
    switchTab(initialHash);
  } else {
    switchTab('dashboard');
  }
}

function switchTab(tabId) {
  appState.currentTab = tabId;

  // Update nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('data-tab') === tabId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Update tab panes
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.remove('active');
  });

  const activePane = document.getElementById(`pane-${tabId}`);
  if (activePane) {
    activePane.classList.add('active');
  }

  // Update Page Title and Subtitle
  const titles = {
    'dashboard': { title: 'Dashboard Overview', subtitle: 'Track, manage and review attendance records' },
    'students': { title: 'Student Directory', subtitle: 'Manage student enrollment, details, and historical logs' },
    'mark-attendance': { title: 'Mark Daily Attendance', subtitle: 'Record student presence or absence for the selected date' },
    'attendance-reports': { title: 'Attendance Analytics & Reports', subtitle: 'Generate printable reports, filter by date, and export CSV' },
    'settings': { title: 'System Settings', subtitle: 'Configure classes, demo data, and database backups' }
  };

  const currentMeta = titles[tabId] || titles['dashboard'];
  document.getElementById('pageTitle').textContent = currentMeta.title;
  document.getElementById('pageSubtitle').textContent = currentMeta.subtitle;

  // Refresh view specific logic
  if (tabId === 'dashboard') {
    renderDashboard();
  } else if (tabId === 'students') {
    renderStudentsTable();
  } else if (tabId === 'mark-attendance') {
    renderMarkAttendance();
  } else if (tabId === 'attendance-reports') {
    renderAttendanceReport();
  } else if (tabId === 'settings') {
    renderSettings();
  }

  updateGlobalBadges();
}

// ==========================================================================
// 5. Global Helpers & Badges
// ==========================================================================
function updateGlobalBadges() {
  const navCount = document.getElementById('navStudentCount');
  if (navCount) {
    navCount.textContent = appState.students.length;
  }
}

function updateStorageSizeDisplay() {
  const el = document.getElementById('storageUsageDisplay');
  if (!el) return;
  let totalBytes = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      totalBytes += (localStorage[key].length + key.length) * 2;
    }
  }
  const kb = (totalBytes / 1024).toFixed(2);
  el.textContent = `${kb} KB (${totalBytes} bytes)`;
}

function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconClass = type === 'success' ? 'fa-circle-check' :
                    type === 'error' ? 'fa-circle-exclamation' :
                    type === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-info';

  toast.innerHTML = `
    <i class="fa-solid ${iconClass} toast-icon"></i>
    <span class="toast-message">${escapeHtml(message)}</span>
    <button class="toast-close" aria-label="Dismiss toast"><i class="fa-solid fa-xmark"></i></button>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  const closeBtn = toast.querySelector('.toast-close');
  const dismiss = () => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 300);
  };

  closeBtn.addEventListener('click', dismiss);
  setTimeout(dismiss, duration);
}

function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Calculate individual student stats
function getStudentAttendanceStats(studentId) {
  let totalMarkedDays = 0;
  let daysPresent = 0;
  let daysAbsent = 0;

  for (const date in appState.attendance) {
    const dayRecords = appState.attendance[date];
    if (dayRecords && dayRecords[studentId]) {
      totalMarkedDays++;
      if (dayRecords[studentId] === 'present') {
        daysPresent++;
      } else if (dayRecords[studentId] === 'absent') {
        daysAbsent++;
      }
    }
  }

  const percentage = totalMarkedDays > 0 ? ((daysPresent / totalMarkedDays) * 100).toFixed(1) : 0;
  return { totalMarkedDays, daysPresent, daysAbsent, percentage: Number(percentage) };
}

// ==========================================================================
// 6. Dashboard Tab Logic & Chart Rendering
// ==========================================================================
function renderDashboard() {
  const todayStr = getTodayDateString();
  const students = appState.students;
  const totalStudents = students.length;
  const classesSet = new Set(students.map(s => s.className));

  // Current day attendance
  const todayAttendance = appState.attendance[todayStr] || {};
  let presentCount = 0;
  let absentCount = 0;

  students.forEach(std => {
    const status = todayAttendance[std.id];
    if (status === 'present') presentCount++;
    else if (status === 'absent') absentCount++;
  });

  const markedTotal = presentCount + absentCount;
  const attendanceRate = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : 0;

  // Update Top Metric Cards
  const totalEl = document.getElementById('dashTotalStudents');
  const totalClassesEl = document.getElementById('dashTotalClasses');
  const presentEl = document.getElementById('dashPresentToday');
  const presentRatioEl = document.getElementById('dashPresentRatio');
  const absentEl = document.getElementById('dashAbsentToday');
  const absentRatioEl = document.getElementById('dashAbsentRatio');
  const rateEl = document.getElementById('dashAttendanceRate');
  const rateBarEl = document.getElementById('dashRateBar');

  if (totalEl) totalEl.textContent = totalStudents;
  if (totalClassesEl) totalClassesEl.textContent = `Across ${classesSet.size} classes`;
  if (presentEl) presentEl.textContent = presentCount;
  if (presentRatioEl) {
    const pctOfMarked = markedTotal > 0 ? ((presentCount / markedTotal) * 100).toFixed(1) : 0;
    presentRatioEl.textContent = `${pctOfMarked}% of marked students`;
  }
  if (absentEl) absentEl.textContent = absentCount;
  if (absentRatioEl) absentRatioEl.textContent = `${absentCount} students marked absent`;
  if (rateEl) rateEl.textContent = `${attendanceRate}%`;
  if (rateBarEl) rateBarEl.style.width = `${Math.min(100, attendanceRate)}%`;

  // Render Charts
  renderWeeklyTrendChart();
  renderTodayDoughnutChart(presentCount, absentCount, totalStudents - markedTotal);

  // Render Class-wise Breakdown
  renderDashClassBreakdown(todayAttendance);

  // Render Low Attendance Watchlist
  renderDashWatchlist();
}

function renderWeeklyTrendChart() {
  const canvas = document.getElementById('weeklyAttendanceChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Build the last 7 dates
  const dates = [];
  const labels = [];
  const presentData = [];
  const absentData = [];

  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    dates.push(dateStr);

    const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
    labels.push(label);

    const log = appState.attendance[dateStr] || {};
    let pres = 0;
    let abs = 0;
    appState.students.forEach(std => {
      if (log[std.id] === 'present') pres++;
      else if (log[std.id] === 'absent') abs++;
    });

    presentData.push(pres);
    absentData.push(abs);
  }

  if (weeklyTrendChartInstance) {
    weeklyTrendChartInstance.destroy();
  }

  weeklyTrendChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Present',
          data: presentData,
          backgroundColor: '#2563eb',
          borderRadius: 6,
          barPercentage: 0.65,
          categoryPercentage: 0.8
        },
        {
          label: 'Absent',
          data: absentData,
          backgroundColor: '#f87171',
          borderRadius: 6,
          barPercentage: 0.65,
          categoryPercentage: 0.8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            boxWidth: 12,
            boxHeight: 12,
            font: { family: 'Inter', size: 12, weight: '600' },
            color: '#475569'
          }
        },
        tooltip: {
          padding: 10,
          titleFont: { family: 'Inter', size: 13, weight: '700' },
          bodyFont: { family: 'Inter', size: 12 }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 2,
            color: '#64748b',
            font: { family: 'Inter', size: 11 }
          },
          grid: {
            color: '#f1f5f9'
          }
        },
        x: {
          ticks: {
            color: '#64748b',
            font: { family: 'Inter', size: 11 }
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

function renderTodayDoughnutChart(present, absent, unmarked) {
  const canvas = document.getElementById('todayDoughnutChart');
  const legendContainer = document.getElementById('todayDoughnutLegend');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  if (todayDoughnutChartInstance) {
    todayDoughnutChartInstance.destroy();
  }

  // If completely zero records, provide placeholder
  const hasData = (present + absent + unmarked) > 0;
  const dataValues = hasData ? [present, absent, unmarked] : [0, 0, 1];
  const bgColors = hasData ? ['#10b981', '#ef4444', '#cbd5e1'] : ['#e2e8f0'];

  todayDoughnutChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Present', 'Absent', 'Unmarked'],
      datasets: [{
        data: dataValues,
        backgroundColor: bgColors,
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: hasData,
          callbacks: {
            label: function(item) {
              const val = item.raw;
              const total = present + absent + unmarked;
              const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
              return ` ${item.label}: ${val} (${pct}%)`;
            }
          }
        }
      }
    }
  });

  if (legendContainer) {
    legendContainer.innerHTML = `
      <div class="legend-item"><span class="legend-color" style="background:#10b981"></span> Present (${present})</div>
      <div class="legend-item"><span class="legend-color" style="background:#ef4444"></span> Absent (${absent})</div>
      <div class="legend-item"><span class="legend-color" style="background:#cbd5e1"></span> Unmarked (${unmarked})</div>
    `;
  }
}

function renderDashClassBreakdown(todayAttendance) {
  const container = document.getElementById('dashClassBreakdown');
  if (!container) return;

  const classes = appState.classes;
  if (!classes || classes.length === 0) {
    container.innerHTML = `<p class="text-muted">No classes configured.</p>`;
    return;
  }

  let html = '';
  classes.forEach(cls => {
    const classStudents = appState.students.filter(s => s.className === cls);
    const count = classStudents.length;
    let presentInClass = 0;

    classStudents.forEach(s => {
      if (todayAttendance[s.id] === 'present') presentInClass++;
    });

    const rate = count > 0 ? Math.round((presentInClass / count) * 100) : 0;

    html += `
      <div class="class-breakdown-row">
        <div class="class-name-col">${escapeHtml(cls)}</div>
        <div class="class-progress-col">
          <div class="class-bar-bg">
            <div class="class-bar-fill" style="width: ${rate}%;"></div>
          </div>
        </div>
        <div class="class-stats-col">
          <span>${presentInClass}/${count} (${rate}%)</span>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function renderDashWatchlist() {
  const container = document.getElementById('dashWatchlist');
  const badge = document.getElementById('watchlistCount');
  if (!container) return;

  // Filter students whose overall attendance is below 75%
  const flagged = [];
  appState.students.forEach(std => {
    const stats = getStudentAttendanceStats(std.id);
    if (stats.totalMarkedDays >= 2 && stats.percentage < 75) {
      flagged.push({ student: std, stats });
    }
  });

  if (badge) {
    badge.textContent = `${flagged.length} flagged`;
    badge.className = flagged.length > 0 ? 'status-pill status-pill-danger' : 'status-pill status-pill-success';
  }

  if (flagged.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 1.5rem 0; color: #10b981;">
        <i class="fa-solid fa-circle-check" style="font-size: 1.8rem; margin-bottom: 0.5rem; display:block;"></i>
        <p style="font-size: 0.88rem; font-weight: 600;">Good news! No students currently below the 75% threshold.</p>
      </div>
    `;
    return;
  }

  // Sort lowest attendance first
  flagged.sort((a, b) => a.stats.percentage - b.stats.percentage);

  let html = '';
  flagged.slice(0, 5).forEach(({ student, stats }) => {
    html += `
      <div class="watchlist-item">
        <div class="watchlist-student-info">
          <div class="watchlist-avatar">${escapeHtml(student.name.charAt(0))}</div>
          <div>
            <div class="watchlist-name">${escapeHtml(student.name)}</div>
            <div class="watchlist-meta">Roll: ${escapeHtml(student.rollNumber)} | ${escapeHtml(student.className)}</div>
          </div>
        </div>
        <div class="watchlist-rate">${stats.percentage}% (${stats.daysPresent}/${stats.totalMarkedDays} days)</div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// ==========================================================================
// 7. Students Registry Tab Logic (CRUD, Table, Search)
// ==========================================================================
function setupStudentsTab() {
  const addBtn = document.getElementById('openAddStudentModalBtn');
  const emptyAddBtn = document.getElementById('emptyStateAddBtn');
  const searchInput = document.getElementById('studentSearchInput');
  const clearSearchBtn = document.getElementById('clearStudentSearch');
  const classFilter = document.getElementById('studentClassFilter');
  const sortFilter = document.getElementById('studentSortFilter');

  if (addBtn) addBtn.addEventListener('click', () => openStudentModal());
  if (emptyAddBtn) emptyAddBtn.addEventListener('click', () => openStudentModal());

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      if (clearSearchBtn) {
        clearSearchBtn.style.display = searchInput.value.trim() ? 'block' : 'none';
      }
      renderStudentsTable();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearSearchBtn.style.display = 'none';
      renderStudentsTable();
    });
  }

  if (classFilter) classFilter.addEventListener('change', renderStudentsTable);
  if (sortFilter) sortFilter.addEventListener('change', renderStudentsTable);

  setupStudentFormModal();
  setupHistoryModal();
}

function populateClassDropdowns() {
  const studentClassFilter = document.getElementById('studentClassFilter');
  const markClassFilter = document.getElementById('attendanceClassFilter');
  const reportClassFilter = document.getElementById('reportClassFilter');
  const formClassSelect = document.getElementById('studentClassSelect');

  const classes = appState.classes;

  // Populate Filter Selects
  const filterDropdowns = [studentClassFilter, markClassFilter, reportClassFilter];
  filterDropdowns.forEach(dropdown => {
    if (!dropdown) return;
    const currentVal = dropdown.value;
    dropdown.innerHTML = `<option value="ALL">All Classes</option>`;
    classes.forEach(cls => {
      const opt = document.createElement('option');
      opt.value = cls;
      opt.textContent = cls;
      dropdown.appendChild(opt);
    });
    if (classes.includes(currentVal)) {
      dropdown.value = currentVal;
    }
  });

  // Populate Student Form Class Select
  if (formClassSelect) {
    const currentFormVal = formClassSelect.value;
    formClassSelect.innerHTML = `<option value="">Select a class...</option>`;
    classes.forEach(cls => {
      const opt = document.createElement('option');
      opt.value = cls;
      opt.textContent = cls;
      formClassSelect.appendChild(opt);
    });
    if (classes.includes(currentFormVal)) {
      formClassSelect.value = currentFormVal;
    }
  }
}

function renderStudentsTable() {
  const tbody = document.getElementById('studentsTableBody');
  const emptyState = document.getElementById('studentsEmptyState');
  const countSummary = document.getElementById('studentsCountSummary');
  const searchInput = document.getElementById('studentSearchInput');
  const classFilter = document.getElementById('studentClassFilter');
  const sortFilter = document.getElementById('studentSortFilter');

  if (!tbody) return;

  const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const selectedClass = classFilter ? classFilter.value : 'ALL';
  const sortBy = sortFilter ? sortFilter.value : 'roll-asc';

  // Filter students
  let filtered = appState.students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm) ||
                          student.rollNumber.toLowerCase().includes(searchTerm) ||
                          student.email.toLowerCase().includes(searchTerm);
    const matchesClass = selectedClass === 'ALL' || student.className === selectedClass;
    return matchesSearch && matchesClass;
  });

  // Sort students
  filtered.sort((a, b) => {
    const statsA = getStudentAttendanceStats(a.id);
    const statsB = getStudentAttendanceStats(b.id);

    if (sortBy === 'roll-asc') return a.rollNumber.localeCompare(b.rollNumber, undefined, { numeric: true });
    if (sortBy === 'roll-desc') return b.rollNumber.localeCompare(a.rollNumber, undefined, { numeric: true });
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
    if (sortBy === 'rate-asc') return statsA.percentage - statsB.percentage;
    if (sortBy === 'rate-desc') return statsB.percentage - statsA.percentage;
    return 0;
  });

  if (countSummary) {
    countSummary.textContent = `Showing ${filtered.length} of ${appState.students.length} students`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  let html = '';
  filtered.forEach(student => {
    const stats = getStudentAttendanceStats(student.id);
    const statusPillClass = stats.totalMarkedDays === 0 ? 'status-pill-unmarked' :
                            stats.percentage >= 75 ? 'status-pill-success' : 'status-pill-danger';
    const statusText = stats.totalMarkedDays === 0 ? 'No Data' :
                       stats.percentage >= 75 ? 'Eligible' : 'Warning';

    html += `
      <tr>
        <td><span class="roll-badge">${escapeHtml(student.rollNumber)}</span></td>
        <td>
          <div class="student-cell">
            <div class="student-avatar-badge">${escapeHtml(student.name.charAt(0))}</div>
            <div>
              <span class="student-name-text">${escapeHtml(student.name)}</span>
              <span class="student-email-sub">${escapeHtml(student.email)}</span>
            </div>
          </div>
        </td>
        <td><span class="class-badge">${escapeHtml(student.className)}</span></td>
        <td>${escapeHtml(student.email)}</td>
        <td><strong>${stats.daysPresent}</strong> / ${stats.totalMarkedDays}</td>
        <td>
          <strong>${stats.percentage}%</strong>
        </td>
        <td>
          <span class="status-pill ${statusPillClass}">${statusText}</span>
        </td>
        <td class="text-right">
          <div class="action-buttons">
            <button class="table-icon-btn" title="View History" onclick="viewStudentHistory('${student.id}')">
              <i class="fa-solid fa-clock-rotate-left"></i>
            </button>
            <button class="table-icon-btn" title="Edit Student" onclick="openStudentModal('${student.id}')">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="table-icon-btn delete-btn" title="Delete Student" onclick="promptDeleteStudent('${student.id}')">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// ==========================================================================
// 8. Student Form Modal & Validation
// ==========================================================================
function setupStudentFormModal() {
  const modal = document.getElementById('studentFormModal');
  const form = document.getElementById('studentForm');
  const closeBtn = document.getElementById('closeStudentModalBtn');
  const cancelBtn = document.getElementById('cancelStudentModalBtn');

  function closeModal() {
    modal.classList.remove('show');
    resetStudentFormErrors();
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  // Close when clicking on backdrop outside modal dialog
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Handle Form Submit with Strict Validation
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (validateAndSaveStudent()) {
      closeModal();
    }
  });

  // Real-time input validation listeners
  ['studentNameInput', 'studentRollInput', 'studentEmailInput', 'studentClassSelect'].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', () => clearFieldError(id));
      input.addEventListener('change', () => clearFieldError(id));
    }
  });
}

function openStudentModal(studentId = null) {
  const modal = document.getElementById('studentFormModal');
  const modalTitle = document.getElementById('studentModalTitle');
  const modalIcon = document.getElementById('studentModalIcon');
  const submitBtn = document.getElementById('submitStudentBtn');

  const idField = document.getElementById('studentFormId');
  const nameInput = document.getElementById('studentNameInput');
  const rollInput = document.getElementById('studentRollInput');
  const emailInput = document.getElementById('studentEmailInput');
  const classSelect = document.getElementById('studentClassSelect');

  resetStudentFormErrors();
  populateClassDropdowns();

  if (studentId) {
    const student = appState.students.find(s => s.id === studentId);
    if (!student) return;

    idField.value = student.id;
    nameInput.value = student.name;
    rollInput.value = student.rollNumber;
    emailInput.value = student.email;
    classSelect.value = student.className;

    modalTitle.textContent = 'Edit Student Details';
    modalIcon.innerHTML = '<i class="fa-solid fa-user-pen"></i>';
    submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> <span>Update Student</span>';
  } else {
    idField.value = '';
    nameInput.value = '';
    rollInput.value = '';
    emailInput.value = '';
    classSelect.value = '';

    modalTitle.textContent = 'Add New Student';
    modalIcon.innerHTML = '<i class="fa-solid fa-user-plus"></i>';
    submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> <span>Save Student</span>';
  }

  modal.classList.add('show');
  setTimeout(() => nameInput.focus(), 100);
}

function setFieldError(fieldId, errorId, message) {
  const field = document.getElementById(fieldId);
  const errEl = document.getElementById(errorId);
  if (field) field.classList.add('is-invalid');
  if (errEl) {
    errEl.textContent = message;
    errEl.classList.add('active');
  }
}

function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  if (field) field.classList.remove('is-invalid');

  const errorMap = {
    'studentNameInput': 'nameError',
    'studentRollInput': 'rollError',
    'studentEmailInput': 'emailError',
    'studentClassSelect': 'classError'
  };

  const errEl = document.getElementById(errorMap[fieldId]);
  if (errEl) {
    errEl.textContent = '';
    errEl.classList.remove('active');
  }
}

function resetStudentFormErrors() {
  ['studentNameInput', 'studentRollInput', 'studentEmailInput', 'studentClassSelect'].forEach(id => {
    clearFieldError(id);
  });
}

function validateAndSaveStudent() {
  const id = document.getElementById('studentFormId').value.trim();
  const name = document.getElementById('studentNameInput').value.trim();
  const rollNumber = document.getElementById('studentRollInput').value.trim();
  const email = document.getElementById('studentEmailInput').value.trim();
  const className = document.getElementById('studentClassSelect').value.trim();

  let isValid = true;
  resetStudentFormErrors();

  // Validate Name
  if (!name) {
    setFieldError('studentNameInput', 'nameError', 'Student full name is required.');
    isValid = false;
  } else if (name.length < 2) {
    setFieldError('studentNameInput', 'nameError', 'Name must be at least 2 characters.');
    isValid = false;
  }

  // Validate Roll Number
  if (!rollNumber) {
    setFieldError('studentRollInput', 'rollError', 'Roll number is required.');
    isValid = false;
  } else {
    // Check uniqueness (ignoring the student itself if editing)
    const existing = appState.students.find(s => s.rollNumber.toLowerCase() === rollNumber.toLowerCase() && s.id !== id);
    if (existing) {
      setFieldError('studentRollInput', 'rollError', `Roll number "${rollNumber}" is already assigned to ${existing.name}.`);
      isValid = false;
    }
  }

  // Validate Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    setFieldError('studentEmailInput', 'emailError', 'Email address is required.');
    isValid = false;
  } else if (!emailRegex.test(email)) {
    setFieldError('studentEmailInput', 'emailError', 'Please enter a valid email address.');
    isValid = false;
  }

  // Validate Class
  if (!className) {
    setFieldError('studentClassSelect', 'classError', 'Please select an assigned class.');
    isValid = false;
  }

  if (!isValid) return false;

  if (id) {
    // Edit existing student
    const studentIdx = appState.students.findIndex(s => s.id === id);
    if (studentIdx !== -1) {
      appState.students[studentIdx] = {
        ...appState.students[studentIdx],
        name,
        rollNumber,
        email,
        className
      };
      saveToStorage(STORAGE_KEYS.STUDENTS, appState.students);
      showToast(`Student ${name} updated successfully!`, 'success');
    }
  } else {
    // Add new student
    const newStudent = {
      id: `std_${Date.now()}`,
      rollNumber,
      name,
      email,
      className,
      createdAt: getTodayDateString()
    };
    appState.students.push(newStudent);
    saveToStorage(STORAGE_KEYS.STUDENTS, appState.students);
    showToast(`Student ${name} registered successfully!`, 'success');
  }

  updateGlobalBadges();
  renderStudentsTable();
  if (appState.currentTab === 'dashboard') renderDashboard();
  if (appState.currentTab === 'mark-attendance') renderMarkAttendance();
  return true;
}

// Student History Modal
function setupHistoryModal() {
  const modal = document.getElementById('studentHistoryModal');
  const closeBtn = document.getElementById('closeHistoryModalBtn');
  const closeBtn2 = document.getElementById('closeHistoryModalBtn2');

  const close = () => modal.classList.remove('show');
  if (closeBtn) closeBtn.addEventListener('click', close);
  if (closeBtn2) closeBtn2.addEventListener('click', close);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
}

window.viewStudentHistory = function(studentId) {
  const student = appState.students.find(s => s.id === studentId);
  if (!student) return;

  const modal = document.getElementById('studentHistoryModal');
  const nameEl = document.getElementById('historyModalStudentName');
  const metaEl = document.getElementById('historyModalStudentMeta');
  const tbody = document.getElementById('historyLogTableBody');

  const totalEl = document.getElementById('histTotalDays');
  const presentEl = document.getElementById('histDaysPresent');
  const absentEl = document.getElementById('histDaysAbsent');
  const rateEl = document.getElementById('histPercentage');

  const stats = getStudentAttendanceStats(student.id);

  nameEl.textContent = `${student.name}'s Attendance History`;
  metaEl.textContent = `Roll No: ${student.rollNumber} | Class: ${student.className} | Email: ${student.email}`;

  totalEl.textContent = stats.totalMarkedDays;
  presentEl.textContent = stats.daysPresent;
  absentEl.textContent = stats.daysAbsent;
  rateEl.textContent = `${stats.percentage}%`;

  // Get sorted list of all dates logged
  const dates = Object.keys(appState.attendance).sort().reverse();
  let rowsHtml = '';

  dates.forEach(date => {
    const status = appState.attendance[date] ? appState.attendance[date][student.id] : null;
    if (status) {
      const pill = status === 'present' ? 'status-pill-success' : 'status-pill-danger';
      const label = status === 'present' ? 'Present' : 'Absent';
      rowsHtml += `
        <tr>
          <td><strong>${escapeHtml(formatDisplayDate(date))}</strong></td>
          <td>${escapeHtml(getDayOfWeek(date))}</td>
          <td class="text-center"><span class="status-pill ${pill}">${label}</span></td>
          <td>${status === 'present' ? 'On time / Present in class' : 'Recorded Absent'}</td>
        </tr>
      `;
    }
  });

  if (!rowsHtml) {
    rowsHtml = `<tr><td colspan="4" class="text-center" style="padding: 2rem; color: #64748b;">No attendance recorded for this student yet.</td></tr>`;
  }

  tbody.innerHTML = rowsHtml;
  modal.classList.add('show');
};

// Prompt Delete Confirmation Modal
window.promptDeleteStudent = function(studentId) {
  const student = appState.students.find(s => s.id === studentId);
  if (!student) return;

  openConfirmModal(
    'Delete Student Record',
    `Are you sure you want to delete <strong>${escapeHtml(student.name)}</strong> (Roll: ${escapeHtml(student.rollNumber)})? All historical attendance logs for this student will be permanently removed.`,
    () => {
      // Delete student
      appState.students = appState.students.filter(s => s.id !== studentId);
      // Clean up attendance map
      for (const d in appState.attendance) {
        if (appState.attendance[d] && appState.attendance[d][studentId]) {
          delete appState.attendance[d][studentId];
        }
      }
      saveToStorage(STORAGE_KEYS.STUDENTS, appState.students);
      saveToStorage(STORAGE_KEYS.ATTENDANCE, appState.attendance);
      showToast(`Student ${student.name} deleted successfully.`, 'info');
      updateGlobalBadges();
      renderStudentsTable();
      if (appState.currentTab === 'dashboard') renderDashboard();
    }
  );
};

// ==========================================================================
// 9. Mark Attendance Tab Logic
// ==========================================================================
function setupMarkAttendanceTab() {
  const datePicker = document.getElementById('attendanceDatePicker');
  const classFilter = document.getElementById('attendanceClassFilter');
  const searchInput = document.getElementById('attendanceSearchInput');
  const markAllPresentBtn = document.getElementById('markAllPresentBtn');
  const markAllAbsentBtn = document.getElementById('markAllAbsentBtn');
  const saveBtn = document.getElementById('saveAttendanceBtn');

  // Set default date
  if (datePicker) {
    datePicker.value = appState.selectedDate || getTodayDateString();
    datePicker.addEventListener('change', (e) => {
      appState.selectedDate = e.target.value || getTodayDateString();
      renderMarkAttendance();
    });
  }

  if (classFilter) {
    classFilter.addEventListener('change', renderMarkAttendance);
  }

  if (searchInput) {
    searchInput.addEventListener('input', renderMarkAttendance);
  }

  if (markAllPresentBtn) {
    markAllPresentBtn.addEventListener('click', () => bulkMarkAttendance('present'));
  }

  if (markAllAbsentBtn) {
    markAllAbsentBtn.addEventListener('click', () => bulkMarkAttendance('absent'));
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      saveToStorage(STORAGE_KEYS.ATTENDANCE, appState.attendance);
      triggerSavedIndicator('Saved Successfully!');
      showToast('Attendance records saved successfully to LocalStorage!', 'success');
      if (appState.currentTab === 'dashboard') renderDashboard();
    });
  }
}

function triggerSavedIndicator(customText = 'Saved to LocalStorage') {
  const badge = document.getElementById('attendanceSaveIndicator');
  const textEl = document.getElementById('saveStatusText');
  if (badge && textEl) {
    textEl.textContent = customText;
    badge.style.transform = 'scale(1.05)';
    setTimeout(() => {
      badge.style.transform = 'scale(1)';
    }, 250);
  }
}

function renderMarkAttendance() {
  const datePicker = document.getElementById('attendanceDatePicker');
  const classFilter = document.getElementById('attendanceClassFilter');
  const searchInput = document.getElementById('attendanceSearchInput');
  const tbody = document.getElementById('markingTableBody');
  const emptyState = document.getElementById('markingEmptyState');

  if (!tbody) return;

  const date = (datePicker && datePicker.value) ? datePicker.value : getTodayDateString();
  appState.selectedDate = date;

  // Ensure attendance object exists for this date
  if (!appState.attendance[date]) {
    appState.attendance[date] = {};
  }
  const dayRecords = appState.attendance[date];

  const selectedClass = classFilter ? classFilter.value : 'ALL';
  const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

  // Filter students
  const filtered = appState.students.filter(std => {
    const matchesClass = selectedClass === 'ALL' || std.className === selectedClass;
    const matchesSearch = std.name.toLowerCase().includes(searchTerm) ||
                          std.rollNumber.toLowerCase().includes(searchTerm);
    return matchesClass && matchesSearch;
  });

  // Calculate live stats for the current filter selection
  let presentCount = 0;
  let absentCount = 0;
  let unmarkedCount = 0;

  filtered.forEach(std => {
    const status = dayRecords[std.id];
    if (status === 'present') presentCount++;
    else if (status === 'absent') absentCount++;
    else unmarkedCount++;
  });

  const total = filtered.length;
  const markedTotal = presentCount + absentCount;
  const rate = total > 0 ? ((presentCount / total) * 100).toFixed(1) : 0;

  // Update Summary Pill Banner
  document.getElementById('markStatTotal').textContent = total;
  document.getElementById('markStatPresent').textContent = presentCount;
  document.getElementById('markStatAbsent').textContent = absentCount;
  document.getElementById('markStatRate').textContent = `${rate}%`;
  document.getElementById('markStatUnmarked').textContent = unmarkedCount;

  if (total === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  let html = '';
  filtered.forEach(student => {
    const status = dayRecords[student.id]; // 'present' | 'absent' | undefined
    const isPresent = status === 'present';
    const isAbsent = status === 'absent';

    let statusPill = `<span class="status-pill status-pill-unmarked">Not Marked</span>`;
    if (isPresent) {
      statusPill = `<span class="status-pill status-pill-success">Present</span>`;
    } else if (isAbsent) {
      statusPill = `<span class="status-pill status-pill-danger">Absent</span>`;
    }

    html += `
      <tr id="marking-row-${student.id}">
        <td><span class="roll-badge">${escapeHtml(student.rollNumber)}</span></td>
        <td>
          <div class="student-cell">
            <div class="student-avatar-badge">${escapeHtml(student.name.charAt(0))}</div>
            <div>
              <span class="student-name-text">${escapeHtml(student.name)}</span>
            </div>
          </div>
        </td>
        <td><span class="class-badge">${escapeHtml(student.className)}</span></td>
        <td>${escapeHtml(student.email)}</td>
        <td class="text-center" id="status-cell-${student.id}">${statusPill}</td>
        <td class="text-center">
          <div class="attendance-toggle-group">
            <button type="button" class="att-btn btn-present ${isPresent ? 'active' : ''}"
              onclick="setAttendanceStatus('${student.id}', 'present')">
              <i class="fa-solid fa-check"></i> Present
            </button>
            <button type="button" class="att-btn btn-absent ${isAbsent ? 'active' : ''}"
              onclick="setAttendanceStatus('${student.id}', 'absent')">
              <i class="fa-solid fa-xmark"></i> Absent
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

window.setAttendanceStatus = function(studentId, status) {
  const date = appState.selectedDate || getTodayDateString();
  if (!appState.attendance[date]) {
    appState.attendance[date] = {};
  }

  appState.attendance[date][studentId] = status;
  saveToStorage(STORAGE_KEYS.ATTENDANCE, appState.attendance);
  triggerSavedIndicator('Auto-saved to LocalStorage');

  // Fast re-render for smooth response
  renderMarkAttendance();
};

function bulkMarkAttendance(status) {
  const date = appState.selectedDate || getTodayDateString();
  if (!appState.attendance[date]) {
    appState.attendance[date] = {};
  }

  const classFilter = document.getElementById('attendanceClassFilter');
  const searchInput = document.getElementById('attendanceSearchInput');
  const selectedClass = classFilter ? classFilter.value : 'ALL';
  const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

  const targets = appState.students.filter(std => {
    const matchesClass = selectedClass === 'ALL' || std.className === selectedClass;
    const matchesSearch = std.name.toLowerCase().includes(searchTerm) ||
                          std.rollNumber.toLowerCase().includes(searchTerm);
    return matchesClass && matchesSearch;
  });

  if (targets.length === 0) {
    showToast('No students match the current filters.', 'warning');
    return;
  }

  targets.forEach(std => {
    appState.attendance[date][std.id] = status;
  });

  saveToStorage(STORAGE_KEYS.ATTENDANCE, appState.attendance);
  triggerSavedIndicator('Bulk Changes Saved');
  showToast(`Marked ${targets.length} student(s) as ${status.toUpperCase()} for ${formatDisplayDate(date)}.`, 'success');
  renderMarkAttendance();
}

// ==========================================================================
// 10. Attendance Reports Tab Logic (Date-wise, Filter, Print, CSV)
// ==========================================================================
function setupReportsTab() {
  const datePicker = document.getElementById('reportDatePicker');
  const classFilter = document.getElementById('reportClassFilter');
  const statusFilter = document.getElementById('reportStatusFilter');
  const searchInput = document.getElementById('reportSearchInput');
  const printBtn = document.getElementById('printReportBtn');
  const exportCsvBtn = document.getElementById('exportReportCsvBtn');

  if (datePicker) {
    datePicker.value = appState.reportDate || getTodayDateString();
    datePicker.addEventListener('change', (e) => {
      appState.reportDate = e.target.value || getTodayDateString();
      renderAttendanceReport();
    });
  }

  if (classFilter) classFilter.addEventListener('change', renderAttendanceReport);
  if (statusFilter) statusFilter.addEventListener('change', renderAttendanceReport);
  if (searchInput) searchInput.addEventListener('input', renderAttendanceReport);

  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', exportReportToCsv);
  }
}

function renderAttendanceReport() {
  const datePicker = document.getElementById('reportDatePicker');
  const classFilter = document.getElementById('reportClassFilter');
  const statusFilter = document.getElementById('reportStatusFilter');
  const searchInput = document.getElementById('reportSearchInput');
  const tbody = document.getElementById('reportTableBody');
  const emptyState = document.getElementById('reportEmptyState');

  if (!tbody) return;

  const date = (datePicker && datePicker.value) ? datePicker.value : getTodayDateString();
  appState.reportDate = date;

  const selectedClass = classFilter ? classFilter.value : 'ALL';
  const selectedStatus = statusFilter ? statusFilter.value : 'ALL';
  const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

  const dayRecords = appState.attendance[date] || {};

  // Update Printable Document Meta Info
  const metaDate = document.getElementById('repMetaDate');
  const metaClass = document.getElementById('repMetaClass');
  const metaGenTime = document.getElementById('repMetaGenTime');

  if (metaDate) metaDate.textContent = formatDisplayDate(date);
  if (metaClass) metaClass.textContent = selectedClass === 'ALL' ? 'All Classes' : selectedClass;
  if (metaGenTime) metaGenTime.textContent = new Date().toLocaleString();

  // Filter students
  let filtered = appState.students.filter(std => {
    const matchesClass = selectedClass === 'ALL' || std.className === selectedClass;
    const matchesSearch = std.name.toLowerCase().includes(searchTerm) ||
                          std.rollNumber.toLowerCase().includes(searchTerm);

    const status = dayRecords[std.id] || 'unmarked';
    const matchesStatus = selectedStatus === 'ALL' || status === selectedStatus;

    return matchesClass && matchesSearch && matchesStatus;
  });

  // Calculate stats for all students in the class regardless of status filter
  const classStudents = appState.students.filter(std => selectedClass === 'ALL' || std.className === selectedClass);
  let totalPresent = 0;
  let totalAbsent = 0;
  classStudents.forEach(std => {
    if (dayRecords[std.id] === 'present') totalPresent++;
    else if (dayRecords[std.id] === 'absent') totalAbsent++;
  });

  const totalEnrolled = classStudents.length;
  const markedTotal = totalPresent + totalAbsent;
  const rate = totalEnrolled > 0 ? ((totalPresent / totalEnrolled) * 100).toFixed(1) : 0;
  const presentPctOfMarked = markedTotal > 0 ? ((totalPresent / markedTotal) * 100).toFixed(1) : 0;
  const absentPctOfMarked = markedTotal > 0 ? ((totalAbsent / markedTotal) * 100).toFixed(1) : 0;

  // Update Highlight Cards
  document.getElementById('repStatTotal').textContent = totalEnrolled;
  document.getElementById('repStatPresent').textContent = totalPresent;
  document.getElementById('repStatPresentSub').textContent = `${presentPctOfMarked}% of marked`;
  document.getElementById('repStatAbsent').textContent = totalAbsent;
  document.getElementById('repStatAbsentSub').textContent = `${absentPctOfMarked}% of marked`;
  document.getElementById('repStatRate').textContent = `${rate}%`;
  document.getElementById('repStatDateText').textContent = `On ${formatDisplayDate(date)}`;

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  let html = '';
  filtered.forEach((student, index) => {
    const status = dayRecords[student.id];
    const overallStats = getStudentAttendanceStats(student.id);

    let statusBadge = `<span class="status-pill status-pill-unmarked">Not Marked</span>`;
    if (status === 'present') {
      statusBadge = `<span class="status-pill status-pill-success">Present</span>`;
    } else if (status === 'absent') {
      statusBadge = `<span class="status-pill status-pill-danger">Absent</span>`;
    }

    html += `
      <tr>
        <td>${index + 1}</td>
        <td><span class="roll-badge">${escapeHtml(student.rollNumber)}</span></td>
        <td><strong>${escapeHtml(student.name)}</strong></td>
        <td><span class="class-badge">${escapeHtml(student.className)}</span></td>
        <td>${escapeHtml(student.email)}</td>
        <td class="text-center">${statusBadge}</td>
        <td class="text-center"><strong>${overallStats.percentage}%</strong> (${overallStats.daysPresent}/${overallStats.totalMarkedDays})</td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function exportReportToCsv() {
  const date = appState.reportDate || getTodayDateString();
  const classFilter = document.getElementById('reportClassFilter');
  const selectedClass = classFilter ? classFilter.value : 'ALL';
  const dayRecords = appState.attendance[date] || {};

  const targets = appState.students.filter(std => selectedClass === 'ALL' || std.className === selectedClass);

  if (targets.length === 0) {
    showToast('No student records to export for this selection.', 'warning');
    return;
  }

  let csvContent = 'Date,Roll Number,Student Name,Class,Email,Status,Overall Attendance %\r\n';

  targets.forEach(std => {
    const status = dayRecords[std.id] || 'Unmarked';
    const overall = getStudentAttendanceStats(std.id);
    const row = [
      `"${date}"`,
      `"${std.rollNumber}"`,
      `"${std.name}"`,
      `"${std.className}"`,
      `"${std.email}"`,
      `"${status.toUpperCase()}"`,
      `"${overall.percentage}%"`
    ].join(',');
    csvContent += row + '\r\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Attendance_Report_${date}_${selectedClass.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Attendance CSV Report downloaded successfully.', 'success');
}

// ==========================================================================
// 11. Settings Tab & Data Management Logic
// ==========================================================================
function setupSettingsTab() {
  const addClassForm = document.getElementById('addClassForm');
  const loadDemoBtn = document.getElementById('loadDemoDataBtn');
  const clearAttendanceBtn = document.getElementById('clearAttendanceDataBtn');
  const resetEntireDbBtn = document.getElementById('resetEntireDbBtn');
  const exportBackupBtn = document.getElementById('exportBackupJsonBtn');
  const importBackupBtn = document.getElementById('importJsonBtn');
  const importFileInput = document.getElementById('importJsonFileInput');

  // Add Class
  if (addClassForm) {
    addClassForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('newClassNameInput');
      const errEl = document.getElementById('newClassError');
      const val = input.value.trim();

      if (!val) {
        errEl.textContent = 'Please enter a valid class name.';
        errEl.classList.add('active');
        return;
      }

      if (appState.classes.map(c => c.toLowerCase()).includes(val.toLowerCase())) {
        errEl.textContent = `Class "${val}" already exists.`;
        errEl.classList.add('active');
        return;
      }

      errEl.textContent = '';
      errEl.classList.remove('active');

      appState.classes.push(val);
      saveToStorage(STORAGE_KEYS.CLASSES, appState.classes);
      input.value = '';
      populateClassDropdowns();
      renderSettings();
      showToast(`Class "${val}" added successfully.`, 'success');
    });
  }

  // Load Demo Data
  if (loadDemoBtn) {
    loadDemoBtn.addEventListener('click', () => {
      openConfirmModal(
        'Load Sample Demo Data',
        'This will populate 12 sample students and 8 days of realistic attendance history. Any existing custom records will be replaced. Continue?',
        () => {
          const sample = getInitialSampleData();
          appState.students = sample.students;
          appState.attendance = sample.attendance;
          appState.classes = sample.classes;
          saveToStorage(STORAGE_KEYS.STUDENTS, appState.students);
          saveToStorage(STORAGE_KEYS.ATTENDANCE, appState.attendance);
          saveToStorage(STORAGE_KEYS.CLASSES, appState.classes);
          populateClassDropdowns();
          updateGlobalBadges();
          renderSettings();
          showToast('Sample demo data loaded successfully!', 'success');
        }
      );
    });
  }

  // Clear Attendance Only
  if (clearAttendanceBtn) {
    clearAttendanceBtn.addEventListener('click', () => {
      openConfirmModal(
        'Clear Attendance Records',
        'Are you sure you want to clear all historical attendance records? All enrolled students will be kept, but all presence/absence logs will be cleared.',
        () => {
          appState.attendance = {};
          saveToStorage(STORAGE_KEYS.ATTENDANCE, appState.attendance);
          renderSettings();
          showToast('All attendance logs have been wiped.', 'info');
        }
      );
    });
  }

  // Factory Reset Database
  if (resetEntireDbBtn) {
    resetEntireDbBtn.addEventListener('click', () => {
      openConfirmModal(
        'Permanent Factory Reset',
        'Are you sure you want to reset everything? All students, classes, and attendance history will be completely erased from your browser.',
        () => {
          appState.students = [];
          appState.attendance = {};
          appState.classes = [...DEFAULT_CLASSES];
          localStorage.removeItem(STORAGE_KEYS.STUDENTS);
          localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
          saveToStorage(STORAGE_KEYS.CLASSES, appState.classes);
          populateClassDropdowns();
          updateGlobalBadges();
          renderSettings();
          showToast('Database wiped clean.', 'info');
        }
      );
    });
  }

  // Export JSON Backup
  if (exportBackupBtn) {
    exportBackupBtn.addEventListener('click', () => {
      const backupData = {
        version: '1.2.0',
        exportedAt: new Date().toISOString(),
        students: appState.students,
        attendance: appState.attendance,
        classes: appState.classes
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `EduTrack_Backup_${getTodayDateString()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Database JSON backup downloaded.', 'success');
    });
  }

  // Restore JSON Backup
  if (importBackupBtn && importFileInput) {
    importBackupBtn.addEventListener('click', () => {
      importFileInput.click();
    });

    importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(evt) {
        try {
          const parsed = JSON.parse(evt.target.result);
          if (!parsed.students || !Array.isArray(parsed.students)) {
            throw new Error('Invalid file structure: missing students array.');
          }

          appState.students = parsed.students;
          appState.attendance = parsed.attendance || {};
          appState.classes = parsed.classes || DEFAULT_CLASSES;

          saveToStorage(STORAGE_KEYS.STUDENTS, appState.students);
          saveToStorage(STORAGE_KEYS.ATTENDANCE, appState.attendance);
          saveToStorage(STORAGE_KEYS.CLASSES, appState.classes);

          populateClassDropdowns();
          updateGlobalBadges();
          renderSettings();
          showToast('Database successfully restored from JSON backup!', 'success');
        } catch (err) {
          console.error(err);
          showToast('Failed to parse backup file. Please ensure it is a valid EduTrack JSON backup.', 'error');
        }
        importFileInput.value = '';
      };
      reader.readAsText(file);
    });
  }
}

function renderSettings() {
  renderClassesBadgeList();
  updateStorageSizeDisplay();
}

function renderClassesBadgeList() {
  const container = document.getElementById('classesListContainer');
  if (!container) return;

  const classes = appState.classes;
  if (!classes || classes.length === 0) {
    container.innerHTML = '<span class="text-muted">No classes configured.</span>';
    return;
  }

  let html = '';
  classes.forEach(cls => {
    const studentCount = appState.students.filter(s => s.className === cls).length;
    html += `
      <div class="class-pill-item">
        <span>${escapeHtml(cls)} (${studentCount} students)</span>
        <button class="class-delete-btn" title="Delete Class" onclick="deleteClass('${escapeHtml(cls)}')">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `;
  });

  container.innerHTML = html;
}

window.deleteClass = function(className) {
  const enrolledCount = appState.students.filter(s => s.className === className).length;
  if (enrolledCount > 0) {
    showToast(`Cannot delete class "${className}". There are ${enrolledCount} student(s) currently enrolled in it.`, 'warning');
    return;
  }

  openConfirmModal(
    'Delete Class',
    `Are you sure you want to delete class "<strong>${escapeHtml(className)}</strong>"?`,
    () => {
      appState.classes = appState.classes.filter(c => c !== className);
      saveToStorage(STORAGE_KEYS.CLASSES, appState.classes);
      populateClassDropdowns();
      renderSettings();
      showToast(`Class "${className}" removed.`, 'info');
    }
  );
};

// ==========================================================================
// 12. Generic Confirmation Modal
// ==========================================================================
let pendingConfirmCallback = null;

function setupConfirmModal() {
  const modal = document.getElementById('confirmModal');
  const closeBtn = document.getElementById('closeConfirmModalBtn');
  const cancelBtn = document.getElementById('confirmCancelBtn');
  const proceedBtn = document.getElementById('confirmProceedBtn');

  function closeModal() {
    modal.classList.remove('show');
    pendingConfirmCallback = null;
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  if (proceedBtn) {
    proceedBtn.addEventListener('click', () => {
      if (typeof pendingConfirmCallback === 'function') {
        const cb = pendingConfirmCallback;
        closeModal();
        cb();
      } else {
        closeModal();
      }
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

function openConfirmModal(title, message, onProceed) {
  const modal = document.getElementById('confirmModal');
  const titleEl = document.getElementById('confirmModalTitle');
  const messageEl = document.getElementById('confirmModalMessage');

  if (titleEl) titleEl.textContent = title;
  if (messageEl) messageEl.innerHTML = message;
  pendingConfirmCallback = onProceed;

  modal.classList.add('show');
}

// ==========================================================================
// 13. Initialization & Event Bootstrapper
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Update live date in header
  const dateDisplay = document.getElementById('currentDateDisplay');
  if (dateDisplay) {
    const today = new Date();
    dateDisplay.textContent = today.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  // 1. Initialize State from LocalStorage or Demo Data
  initializeState();

  // 2. Populate Class dropdowns
  populateClassDropdowns();

  // 3. Setup Tab Modules
  setupNavigation();
  setupStudentsTab();
  setupMarkAttendanceTab();
  setupReportsTab();
  setupSettingsTab();
  setupConfirmModal();

  // 4. Initial Render
  updateGlobalBadges();
  renderDashboard();
  updateStorageSizeDisplay();

  console.log('EduTrack Attendance Management System successfully initialized.');
});
