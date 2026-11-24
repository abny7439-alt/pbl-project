# 🎓 EduTrack - Student Attendance Management System

A modern, responsive, and fully functional **Student Attendance Management System** crafted with clean semantic **HTML5**, modern **CSS3**, and vanilla **JavaScript (ES6+)**. The system features a corporate blue-and-white theme, interactive analytics dashboards, persistent browser `LocalStorage`, date-wise report generation, and student directory management.

---

## 🌟 Key Features

### 1. 📊 Interactive Dashboard Overview
- **Real-Time Metric Cards**:
  - Total Enrolled Students across active classes
  - Present count & ratio for today's session
  - Absent count & ratio for today's session
  - Automatic calculation of the overall attendance percentage
- **Visual Analytics with Chart.js**:
  - **7-Day Attendance Trend**: Bar chart showcasing presence vs absence counts over the past week.
  - **Today's Distribution Doughnut**: Live proportion of Present, Absent, and Unmarked students.
- **Class-Wise Attendance Performance**: Progress meters comparing participation across classes.
- **Low-Attendance Watchlist**: Automatically flags students whose cumulative attendance drops below **75%** for timely intervention.

### 2. 👥 Student Directory & Management (CRUD)
- **Enrollment Form with Strict Validation**:
  - Student Name (minimum 2 characters, required)
  - Roll Number / Student ID (uniqueness validation across the database, required)
  - Email Address (RFC-compliant email pattern check, required)
  - Assigned Class (dropdown populated from active classes, required)
  - Clear inline error messages and visual field error highlights.
- **Student Data Table**:
  - Displays Roll No, Avatar, Full Name, Email, Assigned Class, Attended Days, and Cumulative Percentage.
  - Eligibility status pills (**Eligible** for $\ge 75\%$, **Warning** for $< 75\%$, or **No Data**).
- **Search & Filter Controls**:
  - Instant live search by student name, roll number, or email.
  - Filter by specific class or view all classes.
  - Sort by Roll Number (asc/desc), Name (A-Z/Z-A), or Attendance Percentage (high/low).
- **Individual Student Attendance History**:
  - Modal viewing a student's full historical log, total marked sessions, days present/absent, and overall percentage.
- **Edit & Delete Actions**:
  - Update student records or safely delete them with a confirmation dialog.

### 3. 📅 Daily Attendance Tracker (Mark Attendance)
- **Date Selector**: Defaulted to the current date with the ability to mark or revisit any past or future date.
- **Class Filtering & Quick Search**: Narrow down to specific classes or students.
- **Instant Attendance Toggle**:
  - Responsive **Present** (emerald green) and **Absent** (crimson red) toggle buttons with immediate visual cues.
  - Auto-saves changes instantly to `LocalStorage` with status feedback.
- **Bulk Action Controls**:
  - **Mark All Present**: One-click action to mark all filtered students present.
  - **Mark All Absent**: One-click action to mark all filtered students absent.
  - **Save Attendance**: Manual commit button with visual indicator and notification toast.
- **Real-time Live Stats Banner**: Dynamically calculates Total, Present, Absent, Daily Percentage, and Unmarked students.

### 4. 📑 Date-Wise Attendance Reports & Export
- **Customizable Query Filters**:
  - Select any specific date.
  - Filter by class or view institution-wide attendance.
  - Filter by status (**All**, **Present Only**, **Absent Only**, **Unmarked Only**).
- **Official Printable Report Sheet**:
  - Formatted institutional document layout with school header, date, class, and teacher/administrator signature lines.
  - Dedicated `@media print` CSS stylesheet for clean, ink-friendly printing (`Print Report` button).
- **CSV Data Export**:
  - One-click **Export CSV** download featuring Date, Roll Number, Student Name, Class, Email, Status on Date, and Overall Attendance Percentage.

### 5. ⚙️ Settings & Database Utilities
- **Class Management**:
  - View enrolled student counts per class.
  - Add new custom classes dynamically.
  - Safely delete empty classes (preventing accidental deletion of classes with enrolled students).
- **Sample Demo Data Seeder**:
  - Pre-populates 12 diverse sample students across 4 classes and 8 days of realistic attendance history with one click.
- **Data Cleanup**:
  - Clear historical attendance logs while preserving student profiles.
  - Complete Factory Reset to wipe `LocalStorage` clean.
- **JSON Backup & Restore**:
  - **Export JSON**: Download a full structured database backup.
  - **Restore JSON**: Upload a JSON backup file to seamlessly restore all records.
- **Storage Monitor**: Real-time display of bytes and KB utilized in browser `LocalStorage`.

### 6. 📱 Responsive & Accessible UI
- Designed with a **Modern Blue and White Professional Palette**:
  - Deep Navy & Electric Blue accents (`#1e3a8a`, `#2563eb`, `#3b82f6`)
  - Crisp white cards with subtle borders and elevation shadows
  - Accessible contrast ratios for readability
- **Mobile Responsive Drawer**:
  - Collapsible sidebar with smooth transition and backdrop on mobile/tablet viewports ($\le 992\text{px}$).
  - Adaptive grids adjusting from 4 columns to 2 columns and 1 column on smaller screens.
- **Floating Toast Notifications**:
  - Clean animated toast alerts for success, error, warning, and informational events.

---

## 📁 File Structure

```
pbl_project/
├── index.html        # Semantic HTML5 single-page application structure & modals
├── style.css         # Modern blue/white design system, typography, responsive & print styles
├── script.js         # State management, LocalStorage CRUD, Chart.js charts, filters & exports
└── README.md         # Comprehensive project documentation & user guide
```

---

## 🚀 How to Run the Application

Because this application is built with vanilla web technologies, **no server setup, node modules, or build steps are required**.

### Option 1: Direct Browser Launch
1. Navigate to the project folder (`c:\Users\Adinoor\Documents\pbl_project`).
2. Double-click `index.html` or right-click and choose **Open with** -> **Google Chrome** / **Microsoft Edge** / **Mozilla Firefox**.

### Option 2: Local HTTP Server (Optional)
If you prefer running via a local server (e.g., using Python or VS Code Live Server):

```bash
# Using Python 3
python -m http.server 8000
```
Then open `http://localhost:8000` in your web browser.

---

## 💾 LocalStorage Schema

The system stores all state client-side in browser `LocalStorage` using the following keys:

| Key | Type | Description |
|---|---|---|
| `edutrack_students` | `Array<Student>` | Array of student objects containing `id`, `rollNumber`, `name`, `email`, `className`, `createdAt`. |
| `edutrack_attendance` | `Record<string, Record<string, string>>` | Date-keyed map (`YYYY-MM-DD` -> `{ [studentId]: 'present' \| 'absent' }`). |
| `edutrack_classes` | `Array<string>` | List of active class divisions (e.g. `['Grade 10-A', 'Grade 10-B', ...]`). |

---

## 🛠️ Technologies & CDNs Used

- **HTML5**: Semantic tags, accessible modals, SVG icons, and print containers.
- **CSS3**: CSS Custom Properties (Variables), Flexbox, CSS Grid, animations, and Print Media Queries.
- **JavaScript**: ES6+ modules, `LocalStorage` API, Blob API for CSV export, FileReader API for JSON restore.
- **Chart.js (v4.4.1)**: Loaded via CDN for responsive trend and distribution charts.
- **Font Awesome (v6.5.1)**: Loaded via CDN for UI icons.
- **Google Fonts (Inter)**: Clean corporate typography.

---

## 📋 Step-by-Step User Guide

1. **Dashboard Overview**:
   - Check today's present/absent numbers and the 7-day attendance trend.
   - Click **Mark Today** in the top-right header to quickly jump to today's marking session.
2. **Adding a New Student**:
   - Go to the **Students** tab.
   - Click the **+ Add New Student** button.
   - Fill in Name, Roll Number, Email, and select a Class.
   - Click **Save Student**. The table and badges will update immediately.
3. **Marking Attendance**:
   - Go to the **Mark Attendance** tab.
   - Pick the desired date (defaults to today).
   - Filter by class if required.
   - Click **Present** or **Absent** next to each student, or use **Mark All Present** / **Mark All Absent**.
   - Your choices are auto-saved to `LocalStorage` instantly.
4. **Generating and Printing Reports**:
   - Open **Attendance Reports**.
   - Pick the target date and class division.
   - Review the summary cards and student breakdown.
   - Click **Export CSV** to download a spreadsheet, or click **Print Report** to generate a clean PDF or printed page with verification signature lines.
5. **Backing Up Data**:
   - Open **Settings**.
   - Click **Export JSON** to save a snapshot of all records on your computer.
   - To restore later or on another device, use the **Restore JSON** option.

---

## 🛡️ License
This project is open-source and free to use for educational and institutional attendance tracking.
