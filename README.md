# Smart Habit Tracker

A visually impressive, feature-rich web app to help users build and maintain positive habits, with analytics, reminders, achievements, and social features. Built with React and Firebase.

---

## 🚀 Project Overview
Smart Habit Tracker is a modern web application designed to help users create, track, and sustain healthy habits. It offers advanced features like reminders, analytics, achievements, and social sharing, all wrapped in a beautiful, accessible UI.

---

## ✨ Key Features
- **User Authentication:** Email/password & Google sign-in, secure and easy.
- **Dashboard:** Add, complete, delete habits; progress charts; streaks; AI-powered habit suggestions; motivational quotes; confetti celebration; user profile card; logout with confirmation; dark/light theme toggle; 404 page; loading spinners; accessibility; mobile responsiveness.
- **Profile Page:** Editable display name, avatar upload, bio, phone, birthday, city, LinkedIn, Twitter (with validation), profile completion bar, last login, theme preference, delete account, save notification.
- **Habit Reminders & Notifications:** Set daily/weekly reminders, receive browser notifications at chosen times.
- **Achievements & Badges:** Earn badges for milestones (first habit, streaks, completions, shares, cheers, hard habits), with confetti and animations.
- **Analytics & Insights:** Heatmap calendar, pie chart by category, best time, week-over-week comparison.
- **Habit Sharing & Social Feed:** Share progress via public link, cheer/like on shared habits, view popular habits in a social feed.
- **Progressive Difficulty:** Track and reward habits by difficulty (Easy/Medium/Hard).
- **Export to CSV:** Download your habit data for offline use.
- **Accessibility & Mobile Ready:** Fully responsive and accessible design.

---

## 🛠️ Tech Stack
- **Frontend:** React, Material-UI (MUI)
- **Backend/Database:** Firebase (Firestore, Auth, Storage)
- **Other:** Chart.js/Recharts, Day.js, Confetti, Service Workers

---

## 🖥️ Setup Instructions
1. **Clone the repository:**
   ```bash
   git clone <https://github.com/jhansinip/smart-habit-tracker.git>
   cd habit-tracker
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Firebase:**
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com/).
   - Enable Authentication (Email/Password, Google), Firestore, and Storage.
   - Copy your Firebase config to `src/firebase.js` (create this file if missing):
     ```js
     import { initializeApp } from 'firebase/app';
     const firebaseConfig = { /* your config */ };
     export const app = initializeApp(firebaseConfig);
     ```
4. **Start the development server:**
   ```bash
   npm start
   ```
5. **Open in your browser:**
   - Visit [http://localhost:3000](http://localhost:3000)

---

## 📖 Usage Guide
- **Sign up or log in** with email/password or Google.
- **Add new habits** with category, color, reminder, time, and difficulty.
- **Mark habits as complete** each day; track your streaks and progress.
- **Edit your profile** and complete all fields for a profile completion badge.
- **Set reminders** and allow browser notifications for habit alerts.
- **Share habits** via the Share button; view and cheer on the social feed.
- **Earn badges** for milestones and view them on your dashboard/profile.
- **Export your data** to CSV for backup or analysis.
- **View analytics** for deep insights into your habit journey.

---


## 👩‍💻 Credits
- **Developer:** Jhansi Gonuguntla
- **UI/UX:** Material-UI, custom design
- **Special Thanks:** OpenAI, Firebase, and the open-source community

---

## 📄 License
This project is for academic and portfolio use. For other uses, please contact the author. 
