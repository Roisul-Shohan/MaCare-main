# MaCare Backend Testing Guide

## Prerequisites
1. MongoDB running locally or cloud connection
2. Node.js installed
3. All dependencies installed (`npm install`)
4. Environment variables configured

## Setup

### 1. Start the Backend Server
```bash
cd Back-end
npm run dev
```

The server should start on `http://localhost:8000`

---

## Testing Workflows

### Phase 1: User Registration

#### 1.1 Register a Midwife
```bash
curl -X POST http://localhost:8000/api/v1/users/register \
  -F "FullName=Jane Smith" \
  -F "Email=midwife1@test.com" \
  -F "Password=Password123!" \
  -F "PhoneNumber=1234567890" \
  -F "Gender=Female" \
  -F "Role=midwife" \
  -F "DateOfBirth=1990-05-15"
```

#### 1.2 Register a Doctor
```bash
curl -X POST http://localhost:8000/api/v1/users/register \
  -F "FullName=Dr. John Doe" \
  -F "Email=doctor1@test.com" \
  -F "Password=Password123!" \
  -F "PhoneNumber=9876543210" \
  -F "Gender=Male" \
  -F "Role=doctor" \
  -F "DateOfBirth=1985-08-20"
```

#### 1.3 Register Mothers (Create 5 for testing)
```bash
# Mother 1
curl -X POST http://localhost:8000/api/v1/users/register \
  -F "FullName=Mary Johnson" \
  -F "Email=mother1@test.com" \
  -F "Password=Password123!" \
  -F "PhoneNumber=1111111111" \
  -F "Gender=Female" \
  -F "Role=mother" \
  -F "DateOfBirth=1995-03-10"

# Mother 2
curl -X POST http://localhost:8000/api/v1/users/register \
  -F "FullName=Sarah Williams" \
  -F "Email=mother2@test.com" \
  -F "Password=Password123!" \
  -F "PhoneNumber=2222222222" \
  -F "Gender=Female" \
  -F "Role=mother" \
  -F "DateOfBirth=1992-07-25"

# Create 3 more mothers...
```

---

### Phase 2: Authentication & Dashboard Access

#### 2.1 Login as Midwife
```bash
curl -X POST http://localhost:8000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "Email": "midwife1@test.com",
    "Password": "Password123!"
  }'
```

**Save the AccessToken from response!**

#### 2.2 Get Midwife Dashboard
```bash
curl -X GET http://localhost:8000/api/v1/midwife/dashboard \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "assignedMothersCount": 0,
    "capacity": "0/20",
    "todaysCheckups": [],
    "upcomingAppointments": []
  }
}
```

---

### Phase 3: Assign Mothers to Midwife

#### 3.1 Assign First Mother
```bash
curl -X POST http://localhost:8000/api/v1/midwife/assign-mother \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_MIDWIFE_TOKEN" \
  -d '{
    "motherID": "MOTHER1_USER_ID_FROM_REGISTRATION"
  }'
```

#### 3.2 Get Assigned Mothers List
```bash
curl -X GET http://localhost:8000/api/v1/midwife/mothers \
  -H "Authorization: Bearer YOUR_MIDWIFE_TOKEN"
```

**Expected Response**: List with 1 mother showing pregnancy week, contact info

#### 3.3 Test Capacity Limit
Assign 20 mothers, then try to assign 21st:
```bash
# After assigning 20 mothers, this should fail
curl -X POST http://localhost:8000/api/v1/midwife/assign-mother \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_MIDWIFE_TOKEN" \
  -d '{
    "motherID": "21ST_MOTHER_ID"
  }'
```

**Expected**: Error message "Midwife has reached maximum capacity of 20 mothers"

---

### Phase 4: Mother Creates Maternal Record

#### 4.1 Login as Mother
```bash
curl -X POST http://localhost:8000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "Email": "mother1@test.com",
    "Password": "Password123!"
  }'
```

#### 4.2 Create Maternal Record
```bash
curl -X POST http://localhost:8000/api/v1/mother/maternal-record \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_MOTHER_TOKEN" \
  -d '{
    "lmpDate": "2024-06-01",
    "parity": 0
  }'
```

**Response**: Maternal record with calculated EDD (280 days from LMP)

---

### Phase 5: Midwife Records Health Updates

#### 5.1 Add Health Record Update
```bash
curl -X POST http://localhost:8000/api/v1/midwife/mothers/MOTHER_ID/health-update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_MIDWIFE_TOKEN" \
  -d '{
    "vitalSigns": {
      "bloodPressure": "120/80",
      "weight": 65.5,
      "temperature": 37.0,
      "pulse": 78
    },
    "pregnancyWeek": 24,
    "fetalHeartRate": 145,
    "fundalHeight": 22,
    "symptoms": ["mild back pain"],
    "findings": "Normal development, mother is healthy",
    "notes": "Advised to continue prenatal vitamins"
  }'
```

**Expected**: Health update created + automatic checkup scheduled for 1 week

#### 5.2 Get Mother Details (Verify Assignment)
```bash
curl -X GET http://localhost:8000/api/v1/midwife/mothers/MOTHER_ID \
  -H "Authorization: Bearer YOUR_MIDWIFE_TOKEN"
```

**Expected**: Complete profile with maternal records, health updates, doctor advice, checkups

#### 5.3 Try Accessing Non-Assigned Mother
```bash
curl -X GET http://localhost:8000/api/v1/midwife/mothers/NON_ASSIGNED_MOTHER_ID \
  -H "Authorization: Bearer YOUR_MIDWIFE_TOKEN"
```

**Expected**: 403 Forbidden error

---

### Phase 6: Doctor Searches and Advises

#### 6.1 Login as Doctor
```bash
curl -X POST http://localhost:8000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "Email": "doctor1@test.com",
    "Password": "Password123!"
  }'
```

#### 6.2 Search Mothers
```bash
curl -X GET "http://localhost:8000/api/v1/doctor/search-mothers?query=Mary" \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN"
```

#### 6.3 Get Mother Profile by Email
```bash
curl -X GET "http://localhost:8000/api/v1/doctor/mother/email/mother1@test.com" \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN"
```

**Expected**: Complete history with ALL health updates and ALL advice from any doctor

#### 6.4 Send Advice to Mother
```bash
curl -X POST http://localhost:8000/api/v1/doctor/advice/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN" \
  -d '{
    "motherID": "MOTHER_USER_ID",
    "adviceType": "medication",
    "priority": "high",
    "subject": "Iron Supplement Prescription",
    "message": "Please take the prescribed iron supplements twice daily with meals to help with anemia.",
    "followupRequired": true,
    "followupDate": "2024-02-15"
  }'
```

#### 6.5 Get Doctor Advice History
```bash
curl -X GET http://localhost:8000/api/v1/doctor/advice/history \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN"
```

---

### Phase 7: Mother Views Dashboard

#### 7.1 Get Mother Dashboard
```bash
curl -X GET http://localhost:8000/api/v1/mother/dashboard \
  -H "Authorization: Bearer YOUR_MOTHER_TOKEN"
```

**Expected Response Includes**:
- Pregnancy week and EDD
- Risk flags
- Appointments
- Messages
- Assigned doctor and midwife
- **Recent doctor advice (5 most recent)**
- **Recent health updates (5 most recent)**
- **Upcoming checkups (5 most recent)**
- Children and vaccine info

#### 7.2 Get All Doctor Advice
```bash
curl -X GET http://localhost:8000/api/v1/mother/doctor-advice \
  -H "Authorization: Bearer YOUR_MOTHER_TOKEN"
```

#### 7.3 Mark Advice as Read
```bash
curl -X PATCH http://localhost:8000/api/v1/mother/doctor-advice/ADVICE_ID/read \
  -H "Authorization: Bearer YOUR_MOTHER_TOKEN"
```

#### 7.4 Get All Health Updates
```bash
curl -X GET http://localhost:8000/api/v1/mother/health-updates \
  -H "Authorization: Bearer YOUR_MOTHER_TOKEN"
```

#### 7.5 Get All Checkups
```bash
curl -X GET http://localhost:8000/api/v1/mother/checkups \
  -H "Authorization: Bearer YOUR_MOTHER_TOKEN"
```

---

### Phase 8: Midwife Manages Checkups

#### 8.1 Get Pending Checkups
```bash
curl -X GET http://localhost:8000/api/v1/midwife/checkups/pending \
  -H "Authorization: Bearer YOUR_MIDWIFE_TOKEN"
```

#### 8.2 Schedule Additional Checkup
```bash
curl -X POST http://localhost:8000/api/v1/midwife/mothers/MOTHER_ID/schedule-checkup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_MIDWIFE_TOKEN" \
  -d '{
    "checkupType": "routine",
    "scheduledDate": "2024-02-20T10:00:00Z",
    "notes": "Regular antenatal checkup"
  }'
```

#### 8.3 Complete Checkup
```bash
curl -X PATCH http://localhost:8000/api/v1/midwife/checkups/CHECKUP_ID/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_MIDWIFE_TOKEN" \
  -d '{
    "notes": "Mother is doing well, all vitals normal. Next checkup in 2 weeks."
  }'
```

---

## Verification Checklist

### Midwife Role
- [ ] Can view dashboard with X/20 capacity
- [ ] Can assign mothers (max 20)
- [ ] Cannot assign 21st mother (capacity error)
- [ ] Can view assigned mothers list
- [ ] Can view assigned mother details
- [ ] Cannot view non-assigned mother (403 error)
- [ ] Can add health update
- [ ] Health update auto-creates checkup (1 week)
- [ ] Can schedule checkup manually
- [ ] Can view pending checkups
- [ ] Can complete checkup

### Doctor Role
- [ ] Can search mothers by name/email/phone
- [ ] Can view ANY mother by email (no assignment restriction)
- [ ] Can see complete history (all health updates, all advice)
- [ ] Can send advice with category and priority
- [ ] Can set follow-up date
- [ ] Can view own advice history
- [ ] Can see read status on advice

### Mother Role
- [ ] Dashboard shows all information
- [ ] Can see recent doctor advice (5)
- [ ] Can see recent health updates (5)
- [ ] Can see upcoming checkups (5)
- [ ] Can view all doctor advice
- [ ] Can mark advice as read
- [ ] Can view all health updates
- [ ] Can view all checkups
- [ ] Can see assigned midwife info

### Data Integrity
- [ ] Timestamps recorded correctly
- [ ] Advice read status updates
- [ ] Checkup auto-creation works
- [ ] Capacity limit enforced
- [ ] Assignment verification works
- [ ] All relationships properly linked

---

## Common Issues & Solutions

### Issue 1: "Token expired" error
**Solution**: Login again to get new access token

### Issue 2: "User not found" or "Mother not found"
**Solution**: Make sure you're using the correct MongoDB ObjectId (not email)

### Issue 3: "Midwife has reached maximum capacity"
**Solution**: This is expected after 20 mothers. Test successful!

### Issue 4: "Access denied - Mother not assigned to this midwife"
**Solution**: This is correct - midwife can only access assigned mothers

### Issue 5: Health update created but no checkup
**Solution**: Check if auto-scheduling code is correct (should create checkup 1 week ahead)

---

## Database Queries for Verification

### Check Midwife Assignments
```javascript
db.midwifemotherassignments.find({ midwifeID: ObjectId("MIDWIFE_ID") }).count()
// Should show count ≤ 20
```

### Check Health Updates
```javascript
db.healthrecordupdates.find({ motherID: ObjectId("MOTHER_ID") }).sort({ createdAt: -1 })
```

### Check Doctor Advice
```javascript
db.doctoradvices.find({ motherID: ObjectId("MOTHER_ID") }).sort({ createdAt: -1 })
```

### Check Checkup Notifications
```javascript
db.checkupnotifications.find({ 
  midwifeID: ObjectId("MIDWIFE_ID"),
  status: "pending" 
}).sort({ scheduledDate: 1 })
```

---

## Next: Frontend Testing

Once backend tests pass:
1. Create React components for each role
2. Integrate with API utility
3. Test UI workflows
4. Add error handling
5. Add loading states
6. Add notifications

---

## Support

If you encounter issues:
1. Check server logs in terminal
2. Verify MongoDB connection
3. Check JWT token validity
4. Verify user roles in database
5. Check request body format matches schema
