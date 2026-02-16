# AI Sherly Backend API

Backend Node.js dengan Express untuk AI Sherly Cyber Security Simulation Lab.

## 🚀 Fitur

- ✅ RESTful API dengan Express.js
- ✅ Autentikasi JWT (JSON Web Tokens)
- ✅ Password hashing dengan bcrypt
- ✅ Role-based access control (ADMIN & USER)
- ✅ PostgreSQL database dengan Prisma ORM
- ✅ Security middleware (Helmet, CORS, Rate Limiting)
- ✅ TypeScript untuk type safety
- ✅ Error handling yang komprehensif
- ✅ Validasi input
- ✅ Struktur folder profesional
- ✅ Production-ready

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm atau yarn

## 🔧 Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Salin `.env.example` ke `.env` dan sesuaikan konfigurasi:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Database - Ganti dengan kredensial PostgreSQL Anda
DATABASE_URL="postgresql://username:password@localhost:5432/ai_sherly_db?schema=public"

# JWT - Gunakan secret key yang kuat untuk production
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV=development

# CORS - URL frontend Anda
FRONTEND_URL=http://localhost:5173
```

### 3. Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed database dengan user default
npm run prisma:seed
```

Setelah seeding, Anda akan memiliki 2 user default:
- **Admin**: email: `admin@example.com`, password: `admin123`
- **User**: email: `user@example.com`, password: `user123`

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

Server akan berjalan di `http://localhost:5000`

### Production Mode

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## 📚 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Health Check
```http
GET /api/health
```

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "password123",
  "role": "USER"  // optional, default: USER
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "role": "USER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "username": "admin",
    "role": "ADMIN"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Protected Routes

Semua endpoint di bawah memerlukan header Authorization:
```
Authorization: Bearer <token>
```

#### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "role": "USER",
    "createdAt": "2026-02-08T12:00:00.000Z",
    "updatedAt": "2026-02-08T12:00:00.000Z"
  }
}
```

#### Get All Users (Admin Only)
```http
GET /api/users
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "count": 2,
  "users": [
    {
      "id": "uuid",
      "email": "admin@example.com",
      "username": "admin",
      "role": "ADMIN",
      "createdAt": "2026-02-08T12:00:00.000Z",
      "updatedAt": "2026-02-08T12:00:00.000Z"
    }
  ]
}
```

## 🔒 Security Features

- **Helmet**: Mengatur berbagai HTTP headers untuk keamanan
- **CORS**: Konfigurasi Cross-Origin Resource Sharing
- **Rate Limiting**: Membatasi 100 request per 15 menit per IP
- **JWT Authentication**: Token-based authentication
- **Password Hashing**: bcrypt dengan salt rounds 10
- **Input Validation**: express-validator untuk validasi request
- **Role-based Access Control**: Memisahkan akses ADMIN dan USER

## 📁 Struktur Folder

```
backend/
├── src/
│   ├── config/              # Konfigurasi (database, JWT)
│   │   ├── database.ts
│   │   └── jwt.ts
│   ├── controllers/         # Route handlers
│   │   ├── auth.controller.ts
│   │   └── user.controller.ts
│   ├── middleware/          # Custom middleware
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validator.middleware.ts
│   ├── routes/              # API routes
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   └── index.ts
│   ├── services/            # Business logic
│   │   └── auth.service.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── utils/               # Helper functions
│   │   └── logger.ts
│   └── server.ts            # Entry point
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Database seeding
├── .env.example             # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🔄 Database Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

## 🚀 Deployment

### Environment Variables untuk Production

Pastikan environment variables berikut diset:

```env
DATABASE_URL=your_production_database_url
JWT_SECRET=your_very_secure_random_secret_key
NODE_ENV=production
PORT=5000
FRONTEND_URL=your_frontend_production_url
```

### Build & Start

```bash
npm run build
npm start
```

### Rekomendasi Deployment

- **Hosting**: Railway, Render, Heroku, DigitalOcean
- **Database**: Railway PostgreSQL, Supabase, AWS RDS
- **Environment**: Pastikan semua environment variables diset
- **Security**: 
  - Gunakan HTTPS
  - Set JWT_SECRET dengan nilai random yang kuat
  - Enable firewall
  - Regular security updates

## 🧪 Testing API

### Menggunakan cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "test123",
    "role": "USER"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**Get Profile:**
```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📝 Notes

- Frontend code tetap tidak diubah sesuai requirement
- Untuk integrasi dengan frontend, gunakan endpoint API yang tersedia
- Database migrations ada di folder `prisma/migrations/`
- Password tidak pernah disimpan dalam plain text

## 🤝 Support

Untuk pertanyaan atau issues, silakan hubungi tim development.

---

**Version:** 1.0.0  
**License:** MIT
