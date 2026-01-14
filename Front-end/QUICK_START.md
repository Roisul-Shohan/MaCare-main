# Quick Start Guide - MaCare Frontend

## 🚀 Get Started in 30 Seconds

### Step 1: Open the App
Your development server is already running at:
**http://localhost:5173**

### Step 2: Navigate Between Pages
Use the **Demo Navigation Panel** (bottom-right corner) to switch between:

1. **Landing Page** - See the homepage
2. **Login** - Try the login screen
3. **Register** - Test the registration flow
4. **Mother Dashboard** - View mother's panel
5. **Doctor Dashboard** - View doctor's panel

### Step 3: Explore Features

#### On Landing Page:
- Hero section with Bengali text
- 4 feature cards
- Statistics section
- User testimonials
- CTA buttons

#### On Mother Dashboard:
- Pregnancy week tracker (24/40 weeks)
- Appointment reminders
- Vaccine schedule
- Messages from doctor
- **Emergency button** (red)

#### On Doctor Dashboard:
- Patient list with risk indicators
- Today's schedule
- Quick statistics
- Action buttons

## 📱 Test Responsiveness

1. Open browser DevTools (F12)
2. Click "Toggle device toolbar" (Ctrl+Shift+M)
3. Try different screen sizes:
   - Mobile: 375px
   - Tablet: 768px
   - Desktop: 1440px

## 🎨 All Text is in Bengali

Every user-facing element uses Bengali text to ensure accessibility for Bangladesh users:
- "মা ও নবজাতকের যত্নে আপনার ডিজিটাল সহকারী"
- "গর্ভাবস্থা ট্র্যাকার"
- "ডাক্তার/মিডওয়াইফ"

## 🔧 If Server Stops

```bash
cd Front-end
npm run dev
```

## 📝 Key Files to Check

- [App.jsx](src/App.jsx) - Main app with routing
- [MotherDashboard.jsx](src/pages/MotherDashboard.jsx) - Mother's panel
- [DoctorDashboard.jsx](src/pages/DoctorDashboard.jsx) - Doctor's panel
- [LandingPage.jsx](src/pages/LandingPage.jsx) - Homepage
- [index.css](src/index.css) - Tailwind styles

## 🎯 For Presentation

1. Start on **Landing Page** to show the vision
2. Show **Registration flow** (3 steps)
3. Demo **Mother Dashboard** (main user flow)
4. Demo **Doctor Dashboard** (healthcare provider view)
5. Highlight **Emergency button** and **Risk indicators**

## 💡 Pro Tips

- All mock data is in the component files
- To change current page programmatically, edit `currentPage` state in [App.jsx](src/App.jsx)
- Colors defined in [tailwind.config.js](tailwind.config.js)
- Bengali font loaded from Google Fonts

---

**🎉 You're all set! Happy exploring!**
