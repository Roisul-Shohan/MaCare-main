# MaCare - Doctor & Midwife Separation Implementation

## Overview
This document outlines the complete implementation of separate doctor and midwife roles with comprehensive maternal health tracking capabilities.

---

## System Architecture

### Role Separation
1. **Doctors**
   - Can search and view ANY mother's profile by email
   - View complete medical history (maternal records, health updates, advice history)
   - Send categorized advice to mothers (medication, diet, exercise, emergency, etc.)
   - Set priority levels (low, medium, high, urgent)
   - Track advice read status
   - View all advice they've given

2. **Midwives**
   - Can be assigned maximum of 20 mothers
   - View only assigned mothers' profiles
   - Record and update health details (vital signs, pregnancy progress)
   - Schedule checkup notifications
   - Complete checkups with notes
   - Track daily workload

3. **Mothers**
   - View dashboard with all information
   - See doctor advice from ANY doctor
   - View health updates from assigned midwife
   - Track scheduled checkups
   - Mark advice as read
   - View pregnancy progress

---

## New Database Models

### 1. MidwifeMotherAssignment
**Location**: `/Back-end/src/Models/MidwifeMotherAssignment.model.js`

```javascript
{
  midwifeID: ObjectId (ref: User),
  motherID: ObjectId (ref: User),
  assignedDate: Date,
  status: 'active' | 'inactive',
  notes: String
}
```

**Features**:
- Static method `checkMidwifeCapacity()` enforces 20-mother limit
- Unique index on (midwifeID, motherID) pair
- Timestamps for tracking

### 2. HealthRecordUpdate
**Location**: `/Back-end/src/Models/HealthRecordUpdate.model.js`

```javascript
{
  motherID: ObjectId (ref: User),
  updatedBy: ObjectId (ref: User), // midwife or doctor
  updaterRole: 'midwife' | 'doctor',
  vitalSigns: {
    bloodPressure: String,
    weight: Number,
    temperature: Number,
    pulse: Number
  },
  pregnancyWeek: Number,
  fetalHeartRate: Number,
  fundalHeight: Number,
  symptoms: [String],
  findings: String,
  notes: String
}
```

**Features**:
- Tracks who made the update (midwife or doctor)
- Comprehensive vital signs tracking
- Pregnancy progress monitoring
- Timestamps for audit trail

### 3. DoctorAdvice
**Location**: `/Back-end/src/Models/DoctorAdvice.model.js`

```javascript
{
  doctorID: ObjectId (ref: User),
  motherID: ObjectId (ref: User),
  adviceType: 'general' | 'medication' | 'diet' | 'exercise' | 'emergency' | 'followup',
  priority: 'low' | 'medium' | 'high' | 'urgent',
  subject: String,
  message: String,
  relatedHealthUpdate: ObjectId (ref: HealthRecordUpdate),
  isRead: Boolean,
  readAt: Date,
  followupRequired: Boolean,
  followupDate: Date
}
```

**Features**:
- Categorized advice types
- Priority system for urgent matters
- Read tracking
- Optional follow-up scheduling
- Link to related health updates

### 4. CheckupNotification
**Location**: `/Back-end/src/Models/CheckupNotification.model.js`

```javascript
{
  motherID: ObjectId (ref: User),
  midwifeID: ObjectId (ref: User),
  doctorID: ObjectId (ref: User), // optional
  checkupType: 'routine' | 'followup' | 'emergency' | 'antenatal' | 'postnatal',
  scheduledDate: Date,
  status: 'pending' | 'completed' | 'missed' | 'rescheduled',
  notes: String,
  completedAt: Date,
  reminderSent: Boolean
}
```

**Features**:
- Multiple checkup types
- Status tracking
- Reminder system
- Optional doctor involvement
- Completion tracking

---

## Controllers Implementation

### Midwife Controller
**Location**: `/Back-end/src/Controllers/midwife.controller.js`

#### Functions (8 total):

1. **getMidwifeDashboard()**
   - Shows assigned mother count (X/20)
   - Today's scheduled checkups
   - Upcoming appointments
   - Quick stats

2. **getAssignedMothers()**
   - Lists all 20 assigned mothers
   - Calculates current pregnancy week
   - Shows basic contact info
   - Latest health update date

3. **getMotherDetailsByID(motherID)**
   - Verifies assignment before showing data
   - Complete profile with maternal records
   - All health updates history
   - All doctor advice received
   - Scheduled checkups
   - Full pregnancy information

4. **addHealthRecordUpdate(motherID, healthData)**
   - Records vital signs (BP, weight, temperature, pulse)
   - Pregnancy progress (week, fetal heart rate, fundal height)
   - Symptoms and findings
   - Automatically creates next checkup notification (1 week)

5. **scheduleCheckup(motherID, checkupData)**
   - Creates checkup notification
   - Sets checkup type and date
   - Optional doctor involvement
   - Reminder system

6. **getPendingCheckups()**
   - Shows all upcoming checkups for this midwife
   - Sorted by scheduled date
   - Includes mother details

7. **completeCheckup(checkupID, notes)**
   - Marks checkup as completed
   - Records completion time
   - Adds notes about checkup

8. **assignMotherToMidwife(motherID)**
   - Assigns mother to this midwife
   - Enforces 20-mother capacity limit
   - Verifies mother exists and is a mother role
   - Creates active assignment

### Doctor Controller (Enhanced)
**Location**: `/Back-end/src/Controllers/doctor.controller.js`

#### New Functions (4 total):

1. **searchMothers(query)**
   - Search by name, email, or phone
   - Returns up to 20 results
   - Shows pregnancy week for each
   - Basic contact information

2. **getMotherByEmail(email)**
   - Complete profile by email search
   - All maternal records
   - ALL health updates from any midwife/doctor
   - ALL advice from any doctor
   - Full pregnancy history
   - Risk flags
   - Assigned midwife info

3. **sendAdviceToMother(adviceData)**
   - Create categorized advice
   - Set priority level
   - Optional follow-up date
   - Link to health update (optional)
   - Notifications can be sent

4. **getDoctorAdviceHistory()**
   - All advice given by this doctor
   - Sorted by most recent
   - Shows read status
   - Mother details included

### Mother Controller (Enhanced)
**Location**: `/Back-end/src/Controllers/mother.controller.js`

#### Updated Functions:

1. **getMotherDashboard()** - Enhanced with:
   - Recent doctor advice (5 most recent)
   - Recent health updates (5 most recent)
   - Upcoming checkups (5 most recent)
   - Assigned midwife information

#### New Functions (4 total):

2. **getAllDoctorAdvice()**
   - All advice received from any doctor
   - Sorted by most recent
   - Includes doctor details
   - Related health updates

3. **getAllHealthUpdates()**
   - All health records from midwife/doctor
   - Complete vital signs history
   - Pregnancy progress tracking
   - Updater details (who recorded it)

4. **markAdviceAsRead(adviceId)**
   - Mark specific advice as read
   - Records read timestamp
   - Returns updated advice

5. **getMyCheckups()**
   - All scheduled checkups
   - Past and future checkups
   - Checkup status
   - Midwife/doctor details

---

## Routes Implementation

### Midwife Routes
**Location**: `/Back-end/src/Routes/midwife.Route.js`

```
GET    /api/v1/midwife/dashboard
GET    /api/v1/midwife/mothers
GET    /api/v1/midwife/mothers/:motherID
POST   /api/v1/midwife/mothers/:motherID/health-update
POST   /api/v1/midwife/mothers/:motherID/schedule-checkup
GET    /api/v1/midwife/checkups/pending
PATCH  /api/v1/midwife/checkups/:checkupID/complete
POST   /api/v1/midwife/assign-mother
```

### Doctor Routes (Enhanced)
**Location**: `/Back-end/src/Routes/doctor.Route.js`

**New Routes**:
```
GET    /api/v1/doctor/search-mothers?query=<text>
GET    /api/v1/doctor/mother/email/:email
POST   /api/v1/doctor/advice/send
GET    /api/v1/doctor/advice/history
```

### Mother Routes (Enhanced)
**Location**: `/Back-end/src/Routes/mother.Route.js`

**New Routes**:
```
GET    /api/v1/mother/doctor-advice
PATCH  /api/v1/mother/doctor-advice/:adviceId/read
GET    /api/v1/mother/health-updates
GET    /api/v1/mother/checkups
```

---

## Frontend Integration

### API Utility Enhanced
**Location**: `/Front-end/src/utils/api.js`

#### Mother APIs (New)
```javascript
api.getAllDoctorAdvice()
api.markAdviceAsRead(adviceId)
api.getAllHealthUpdates()
api.getMyCheckups()
```

#### Doctor APIs (New)
```javascript
api.searchMothers(query)
api.getMotherByEmail(email)
api.sendAdviceToMother(adviceData)
api.getDoctorAdviceHistory()
```

#### Midwife APIs (New)
```javascript
api.getMidwifeDashboard()
api.getAssignedMothers()
api.getMotherDetailsByID(motherID)
api.addHealthRecordUpdate(motherID, healthData)
api.scheduleCheckup(motherID, checkupData)
api.getPendingCheckups()
api.completeCheckup(checkupID, notes)
api.assignMotherToMidwife(motherID)
```

---

## Key Features

### 1. Capacity Management
- Midwives cannot be assigned more than 20 mothers
- `checkMidwifeCapacity()` static method enforces limit
- Dashboard shows "X/20" capacity indicator

### 2. Assignment Verification
- Midwives can only view assigned mothers
- `getMotherDetailsByID()` verifies assignment
- 403 error if accessing non-assigned mother

### 3. Automatic Checkup Scheduling
- When midwife adds health update, next checkup auto-scheduled (1 week)
- Reduces manual scheduling burden
- Ensures regular monitoring

### 4. Comprehensive History Tracking
- Doctors see ALL updates and advice (from any provider)
- Mothers see complete history
- Audit trail with timestamps and updater info

### 5. Priority-Based Advice
- Urgent advice can be highlighted
- Emergency type for critical situations
- Follow-up tracking for ongoing care

### 6. Read Tracking
- Mothers mark advice as read
- Doctors can see if advice was read
- ReadAt timestamp recorded

---

## Security Features

1. **JWT Authentication**: All routes protected with `jwtVerification` middleware
2. **Role-Based Access**: 
   - Midwives can only access assigned mothers
   - Doctors can access any mother but only for medical purposes
   - Mothers can only access their own data
3. **Assignment Verification**: Middleware checks before data access
4. **Unique Indexes**: Prevent duplicate assignments

---

## Database Indexes

### MidwifeMotherAssignment
- Unique compound index: `(midwifeID, motherID)`
- Index on `midwifeID` for dashboard queries
- Index on `motherID` for mother profile queries

### HealthRecordUpdate
- Index on `motherID` for fetching history
- Index on `updatedBy` for provider history
- Index on `createdAt` for sorting

### DoctorAdvice
- Index on `motherID` for mother's advice list
- Index on `doctorID` for doctor's history
- Index on `isRead` for unread filtering
- Index on `createdAt` for sorting

### CheckupNotification
- Compound index: `(midwifeID, status, scheduledDate)`
- Index on `motherID` for mother's checkups
- Index on `scheduledDate` for reminder system

---

## Usage Workflows

### Midwife Daily Workflow
1. Login and view dashboard (see X/20 capacity, today's checkups)
2. View assigned mothers list
3. Click on mother to see detailed profile
4. Record health update (BP, weight, symptoms, findings)
5. System auto-schedules next checkup
6. View pending checkups for today
7. Complete checkup with notes

### Doctor Workflow
1. Login and view dashboard
2. Search for mother by email
3. View complete history (all health updates, all advice)
4. Send advice with category and priority
5. Set follow-up date if needed
6. View advice history to track responses

### Mother Workflow
1. Login and view dashboard
2. See recent advice from doctors (any doctor)
3. See recent health updates from midwife
4. View upcoming checkups
5. Click to view all advice history
6. Mark advice as read
7. View all health updates history
8. Track pregnancy progress

---

## Testing Checklist

### Backend Testing
- [ ] Register midwife user
- [ ] Assign 20 mothers to midwife
- [ ] Try assigning 21st mother (should fail with capacity error)
- [ ] Midwife add health update → verify auto-checkup creation
- [ ] Midwife try accessing non-assigned mother (should fail with 403)
- [ ] Doctor search mother by email
- [ ] Doctor send advice with different priorities
- [ ] Doctor view advice history
- [ ] Mother view dashboard with all data
- [ ] Mother mark advice as read
- [ ] Verify timestamps on all records

### Frontend Testing
- [ ] Create frontend components for midwife dashboard
- [ ] Create frontend components for doctor advice form
- [ ] Create frontend components for mother advice viewing
- [ ] Test API integration for all new endpoints
- [ ] Test error handling for capacity limit
- [ ] Test role-based UI rendering

---

## Next Steps

### Immediate (Required for MVP)
1. Create frontend components:
   - Midwife Dashboard
   - Midwife Assigned Mothers List
   - Midwife Health Update Form
   - Doctor Search & Advice Form
   - Mother Advice Viewer
   - Mother Health Updates Viewer

2. Test complete workflow end-to-end

### Future Enhancements
1. Real-time notifications when advice is received
2. SMS/Email reminders for checkups
3. Generate health reports in PDF
4. Analytics dashboard for administrators
5. Telemedicine video consultation integration
6. Mother mobile app for easier access
7. Automated risk flag detection based on vital signs
8. Prescription management system
9. Lab results integration
10. Vaccine reminder system enhancement

---

## File Structure Summary

```
Back-end/
├── src/
│   ├── Models/
│   │   ├── User.Model.js (fixed)
│   │   ├── MidwifeMotherAssignment.model.js (NEW)
│   │   ├── HealthRecordUpdate.model.js (NEW)
│   │   ├── DoctorAdvice.model.js (NEW)
│   │   ├── CheckupNotification.model.js (NEW)
│   │   ├── MaternalRecord.model.js
│   │   ├── ChildRecord.model.js
│   │   ├── Appointment.model.js
│   │   ├── Message.model.js
│   │   └── DoctorPatient.model.js
│   ├── Controllers/
│   │   ├── midwife.controller.js (NEW - 8 functions)
│   │   ├── doctor.controller.js (ENHANCED - 4 new functions)
│   │   ├── mother.controller.js (ENHANCED - 4 new functions)
│   │   └── user.controller.js
│   ├── Routes/
│   │   ├── midwife.Route.js (NEW)
│   │   ├── doctor.Route.js (ENHANCED)
│   │   ├── mother.Route.js (ENHANCED)
│   │   └── User.Route.js
│   └── app.js (UPDATED - midwife routes mounted)
├── API_ENDPOINTS.md (NEW - Complete API documentation)
└── IMPLEMENTATION.md (THIS FILE)

Front-end/
├── src/
│   ├── utils/
│   │   ├── api.js (ENHANCED - 16 new methods)
│   │   └── AuthContext.jsx (fixed)
│   ├── pages/
│   │   ├── Login.jsx (fixed)
│   │   └── Register.jsx (fixed)
│   └── App.jsx
└── [TODO: Add new components for midwife/doctor/mother features]
```

---

## Conclusion

The system now has complete separation of doctor and midwife roles with:

✅ Midwives can manage up to 20 mothers
✅ Doctors can access any mother's complete history
✅ Mothers can view all advice and health updates
✅ Automatic checkup scheduling
✅ Priority-based advice system
✅ Read tracking for advice
✅ Comprehensive audit trails
✅ Role-based access control
✅ Complete API documentation

**All backend implementation is COMPLETE and ready for frontend integration!**
