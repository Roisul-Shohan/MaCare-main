# MaCare API Endpoints Documentation

## Base URL
`http://localhost:8000/api/v1`

---

## Authentication Endpoints (`/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/users/register` | Register new user | No |
| POST | `/users/login` | User login | No |
| POST | `/users/logout` | User logout | Yes |
| POST | `/users/renewaccestoken` | Refresh access token | No |
| POST | `/users/changepassword` | Change password | Yes |
| PATCH | `/users/UpdateProfilePicture` | Update profile picture | Yes |
| GET | `/users/profile/:id` | Get user public profile | No |

---

## Mother Endpoints (`/mother`)

### Dashboard & Profile
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/mother/dashboard` | Get mother dashboard (includes pregnancyWeek, edd, appointments, messages, doctor advice, health updates, checkups) | Yes |
| GET | `/mother/profile` | Get mother profile | Yes |

### Maternal Records
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/mother/maternal-record` | Get maternal record | Yes |
| POST | `/mother/maternal-record` | Create maternal record | Yes |
| POST | `/mother/visit` | Add self-reported visit | Yes |

### Child Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/mother/child/register` | Register child | Yes |
| GET | `/mother/child/:childId/vaccines` | Get vaccine schedule | Yes |

### Appointments & Messages
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/mother/appointments` | Get all appointments | Yes |
| GET | `/mother/messages` | Get all messages | Yes |
| PATCH | `/mother/messages/:messageId/read` | Mark message as read | Yes |

### Doctor Advice & Health Updates (NEW)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/mother/doctor-advice` | Get all doctor advice | Yes |
| PATCH | `/mother/doctor-advice/:adviceId/read` | Mark advice as read | Yes |
| GET | `/mother/health-updates` | Get all health updates from midwife | Yes |
| GET | `/mother/checkups` | Get all scheduled checkups | Yes |

---

## Doctor Endpoints (`/doctor`)

### Dashboard & Patients
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/doctor/dashboard` | Get doctor dashboard | Yes |
| GET | `/doctor/patients` | Get all assigned patients | Yes |
| GET | `/doctor/patients/:patientId` | Get patient details | Yes |
| POST | `/doctor/patients/assign` | Assign patient to doctor | Yes |
| POST | `/doctor/patients/:patientId/visit` | Add patient visit | Yes |
| PATCH | `/doctor/patients/:patientId/risk-flags` | Update risk flags | Yes |

### Appointments
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/doctor/appointments` | Get appointments (optional ?date=YYYY-MM-DD) | Yes |
| POST | `/doctor/appointments/create` | Create appointment | Yes |
| PATCH | `/doctor/appointments/:appointmentId/status` | Update appointment status | Yes |

### Messages
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/doctor/messages/send` | Send message to patient | Yes |

### Mother Search & Advice (NEW)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/doctor/search-mothers?query=<text>` | Search mothers by name/email/phone | Yes |
| GET | `/doctor/mother/email/:email` | Get mother profile by email (complete history) | Yes |
| POST | `/doctor/advice/send` | Send advice to mother | Yes |
| GET | `/doctor/advice/history` | Get all advice given by this doctor | Yes |

---

## Midwife Endpoints (`/midwife`) - NEW

### Dashboard & Assigned Mothers
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/midwife/dashboard` | Get midwife dashboard (shows X/20 capacity, today's checkups) | Yes |
| GET | `/midwife/mothers` | Get all assigned mothers (max 20) | Yes |
| GET | `/midwife/mothers/:motherID` | Get specific mother details (verifies assignment) | Yes |
| POST | `/midwife/assign-mother` | Assign mother to midwife (enforces 20 limit) | Yes |

### Health Records & Updates
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/midwife/mothers/:motherID/health-update` | Add health record update (BP, weight, symptoms, etc.) | Yes |

### Checkup Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/midwife/mothers/:motherID/schedule-checkup` | Schedule checkup notification | Yes |
| GET | `/midwife/checkups/pending` | Get pending checkups | Yes |
| PATCH | `/midwife/checkups/:checkupID/complete` | Mark checkup as completed | Yes |

---

## Data Models

### User Roles
- `mother` - Pregnant women or mothers
- `doctor` - Medical doctors
- `midwife` - Midwives (max 20 assigned mothers)

### Doctor Advice Types
- `general` - General advice
- `medication` - Medication recommendations
- `diet` - Dietary advice
- `exercise` - Exercise recommendations
- `emergency` - Emergency instructions
- `followup` - Follow-up required

### Doctor Advice Priority
- `low` - Low priority
- `medium` - Medium priority
- `high` - High priority
- `urgent` - Urgent attention required

### Checkup Types
- `routine` - Routine checkup
- `followup` - Follow-up checkup
- `emergency` - Emergency checkup
- `antenatal` - Antenatal care
- `postnatal` - Postnatal care

### Checkup Status
- `pending` - Scheduled but not completed
- `completed` - Completed successfully
- `missed` - Missed appointment
- `rescheduled` - Rescheduled to new date

---

## Request/Response Examples

### Doctor: Send Advice to Mother
**POST** `/api/v1/doctor/advice/send`
```json
{
  "motherID": "60d5ec49f1b2c72b8c8e4a1b",
  "adviceType": "medication",
  "priority": "high",
  "subject": "Iron Supplement Prescription",
  "message": "Please take the prescribed iron supplements twice daily with meals.",
  "followupRequired": true,
  "followupDate": "2024-02-15"
}
```

### Midwife: Add Health Update
**POST** `/api/v1/midwife/mothers/:motherID/health-update`
```json
{
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
}
```

### Mother: Get Dashboard
**GET** `/api/v1/mother/dashboard`

Response includes:
- Pregnancy week and EDD
- Risk flags
- Upcoming appointments
- Recent messages
- Assigned doctor and midwife
- Recent doctor advice (5 most recent)
- Recent health updates (5 most recent)
- Upcoming checkups (5 most recent)
- Children and vaccine info

---

## Authentication
All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <access_token>
```

Access tokens expire after a set time. Use `/users/renewaccestoken` with refresh token to get new access token.

---

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
