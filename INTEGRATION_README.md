# MaCare - Maternal & Child Healthcare Platform

A comprehensive healthcare platform designed to improve maternal and child health outcomes in Bangladesh through digital health monitoring, appointment scheduling, and remote consultations.

## Features

### For Mothers
- **Pregnancy Tracking**: Monitor pregnancy progress with week-by-week updates
- **Appointment Management**: Schedule and track appointments with doctors
- **Health Records**: Maintain maternal and child health records
- **Vaccination Tracking**: Keep track of child vaccination schedules
- **Messaging**: Direct communication with healthcare providers
- **Emergency Contact**: Quick access to emergency healthcare services

### For Healthcare Providers (Doctors/Midwives)
- **Patient Management**: View and manage assigned patients
- **Dashboard Analytics**: Overview of patient statistics and risk assessment
- **Appointment Scheduling**: Manage appointment schedules
- **Visit Records**: Add and update patient visit records
- **Risk Assessment**: Track and manage high-risk pregnancies
- **Secure Messaging**: Communicate with patients

## Tech Stack

### Frontend
- **React 19.2.0**: Modern UI library
- **Vite 7.2.4**: Fast build tool
- **Tailwind CSS 3.x**: Utility-first CSS framework
- **Bengali Language**: Full support for Bengali interface

### Backend
- **Node.js with Express 5.1.0**: Backend framework
- **MongoDB with Mongoose 8.18.3**: Database
- **JWT Authentication**: Secure token-based authentication
- **Multer**: File upload handling
- **Cloudinary**: Image storage
- **Socket.io 4.7.5**: Real-time messaging (future feature)

## Project Structure

```
MaCare-main/
├── Front-end/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── utils/            # Utility functions and API
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Entry point
│   ├── public/               # Static assets
│   ├── .env.example          # Environment variables template
│   └── package.json
├── Back-end/
│   ├── src/
│   │   ├── Controllers/      # Business logic
│   │   ├── Models/           # Database models
│   │   ├── Routes/           # API routes
│   │   ├── Middleware/       # Authentication, validation
│   │   ├── Utils/            # Helper functions
│   │   ├── DB/               # Database configuration
│   │   └── app.js            # Express app setup
│   ├── public/Temp/          # Temporary file storage
│   ├── .env.example          # Environment variables template
│   └── package.json
```

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn package manager

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd Back-end
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables in `.env`:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/MaCare
   ACCESS_TOKEN_SECRET=your_secret_key_here
   REFRESH_TOKEN_SECRET=your_refresh_secret_here
   ACCESS_TOKEN_EXPIRY=15m
   REFRESH_TOKEN_EXPIRY=7d
   PORT=8000
   CORS_ORIGIN=http://localhost:5173
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   ```

5. **Start MongoDB:**
   ```bash
   # On Linux/Mac
   sudo systemctl start mongod
   
   # On Windows
   net start MongoDB
   ```

6. **Start the backend server:**
   ```bash
   npm start
   ```
   
   Backend will run on `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd Front-end
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables in `.env`:**
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   Frontend will run on `http://localhost:5173`

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/v1/user/register
Content-Type: multipart/form-data

Body:
- FullName: string (required)
- UserName: string (required)
- Email: string (required)
- Password: string (required, min 8 characters)
- PhoneNumber: string (required)
- Role: enum ["mother", "doctor", "midWife"] (required)
- Gender: enum ["Male", "Female", "Other"] (required)
- DateOfBirth: date (required)
- address: string (required)
- ProfileImage: file (optional)
```

#### Login User
```http
POST /api/v1/user/login
Content-Type: application/json

Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "AccessToken": "jwt_token",
    "RefreshToken": "jwt_token",
    "LogInUser": {
      "_id": "user_id",
      "FullName": "User Name",
      "Email": "user@example.com",
      "Role": "mother"
    }
  }
}
```

#### Logout User
```http
POST /api/v1/user/logout
Authorization: Bearer {access_token}
```

### Mother Endpoints

#### Get Mother Dashboard
```http
GET /api/v1/mother/dashboard
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "data": {
    "pregnancyWeek": 24,
    "nextAppointment": {...},
    "recentMessages": [...],
    "vaccinesDue": [...]
  }
}
```

#### Get Mother Appointments
```http
GET /api/v1/mother/appointments
Authorization: Bearer {access_token}
```

#### Create Maternal Record
```http
POST /api/v1/mother/maternal-record
Authorization: Bearer {access_token}
Content-Type: application/json

Body:
{
  "LMP": "2024-01-01",
  "bloodType": "O+",
  "allergies": ["None"],
  "previousPregnancies": 0
}
```

### Doctor Endpoints

#### Get Doctor Dashboard
```http
GET /api/v1/doctor/dashboard
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "data": {
    "totalPatients": 45,
    "highRiskPatients": 5,
    "todaysAppointments": [...],
    "recentPatients": [...]
  }
}
```

#### Get Doctor Patients
```http
GET /api/v1/doctor/patients
Authorization: Bearer {access_token}
```

#### Get Patient Details
```http
GET /api/v1/doctor/patients/:patientId
Authorization: Bearer {access_token}
```

#### Create Appointment
```http
POST /api/v1/doctor/appointments/create
Authorization: Bearer {access_token}
Content-Type: application/json

Body:
{
  "motherID": "patient_id",
  "appointmentDate": "2024-06-15",
  "appointmentTime": "10:00",
  "type": "নিয়মিত চেকআপ",
  "notes": "Regular checkup"
}
```

## Database Models

### User Model
- FullName: String
- UserName: String (unique)
- Email: String (unique)
- Password: String (hashed)
- PhoneNumber: String
- Role: Enum ["mother", "doctor", "midWife", "admin"]
- Gender: Enum ["Male", "Female", "Other"]
- DateOfBirth: Date
- address: String
- ProfileImage: String (Cloudinary URL)

### Maternal Record Model
- motherID: ObjectId (ref: User)
- LMP: Date (Last Menstrual Period)
- EDD: Date (Estimated Delivery Date)
- bloodType: String
- allergies: [String]
- previousPregnancies: Number
- visits: [Visit Schema]
- riskFlags: [String]

### Child Record Model
- motherID: ObjectId (ref: User)
- childName: String
- dateOfBirth: Date
- gender: String
- birthWeight: Number
- vaccinations: [Vaccination Schema]

### Appointment Model
- motherID: ObjectId (ref: User)
- doctorID: ObjectId (ref: User)
- appointmentDate: Date
- appointmentTime: String
- type: String
- status: Enum ["confirmed", "pending", "completed", "cancelled"]
- notes: String

### Message Model
- senderID: ObjectId (ref: User)
- receiverID: ObjectId (ref: User)
- message: String
- isRead: Boolean
- messageType: Enum ["text", "voice", "image"]

## Testing

### Create Test Users

You can create test users using the registration endpoint or directly through MongoDB:

```javascript
// Mother Account
{
  "FullName": "Test Mother",
  "UserName": "testmother",
  "Email": "mother@test.com",
  "Password": "password123",
  "PhoneNumber": "01712345678",
  "Role": "mother",
  "Gender": "Female",
  "DateOfBirth": "1995-01-01",
  "address": "Dhaka, Bangladesh"
}

// Doctor Account
{
  "FullName": "Dr. Test Doctor",
  "UserName": "testdoctor",
  "Email": "doctor@test.com",
  "Password": "password123",
  "PhoneNumber": "01798765432",
  "Role": "doctor",
  "Gender": "Male",
  "DateOfBirth": "1985-01-01",
  "address": "Chittagong, Bangladesh"
}
```

## Features Roadmap

### Completed ✅
- User authentication (register, login, logout)
- Mother dashboard with pregnancy tracking
- Doctor dashboard with patient management
- Appointment scheduling
- Maternal and child health records
- Messaging system
- Bengali language UI

### In Progress 🚧
- Real-time messaging with Socket.io
- Push notifications
- Vaccination reminders

### Planned 📋
- Mobile app (React Native)
- Telemedicine video consultations
- AI-powered risk assessment
- Health analytics and reporting
- Multi-language support (English, Hindi)
- SMS notifications
- Offline mode with data sync

## Security Features

- JWT-based authentication with access and refresh tokens
- Password hashing with bcrypt
- HTTP-only cookies for token storage
- CORS configuration
- Input validation and sanitization
- File upload size restrictions
- Rate limiting (to be implemented)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@macare.com or create an issue in the repository.

## Acknowledgments

- Bangladesh Ministry of Health and Family Welfare
- WHO Maternal Health Guidelines
- Community healthcare workers and midwives who provided valuable feedback

---

**MaCare** - মা ও শিশুর সুস্বাস্থ্য আমাদের লক্ষ্য 💝
