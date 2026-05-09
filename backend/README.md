# PharmaLink Connect Backend

Backend API for PharmaLink Connect - A medicine and pharmacy finder for Addis Ababa, Ethiopia.

## Features

- User authentication (patients and pharmacies)
- Medicine search and inventory management
- Prescription upload and processing
- Pharmacy location and availability
- Real-time stock management
- Secure file uploads

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcrypt
- **Security**: Helmet, CORS, Rate Limiting
- **File Storage**: Cloudinary
- **Email**: Nodemailer

## Getting Started

### Prerequisites

- Node.js 16+
- MongoDB
- Cloudinary account (for file uploads)

### Installation

1. Clone the repository
2. Navigate to backend directory
3. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pharmalink
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173

# Email configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Cloudinary configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Running the Server

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/patient/register` - Register patient
- `POST /api/auth/pharmacy/register` - Register pharmacy
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

### Medicines
- `GET /api/medicines/search` - Search medicines
- `GET /api/medicines/:id` - Get medicine details
- `GET /api/medicines/pharmacy/:pharmacyId` - Get pharmacy inventory

### Pharmacies
- `GET /api/pharmacies/nearby` - Find nearby pharmacies
- `GET /api/pharmacies/:id` - Get pharmacy details
- `PUT /api/pharmacies/:id/inventory` - Update inventory

### Prescriptions
- `POST /api/prescriptions/upload` - Upload prescription
- `GET /api/prescriptions/user/:userId` - Get user prescriptions

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/        # MongoDB models
│   ├── routes/        # API routes
│   ├── utils/         # Utility functions
│   └── index.js       # Server entry point
├── package.json
└── README.md
```

## License

MIT License
