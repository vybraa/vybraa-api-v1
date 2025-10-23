# Vybraa Authentication Service

This document outlines the complete authentication system implemented in the Vybraa API.

## Overview

The authentication service provides a comprehensive authentication system with the following features:

- **User Registration** with email verification
- **User Login** with password authentication
- **Social Authentication** (Google, Facebook, Apple)
- **Password Reset** functionality
- **Email Verification** with token-based verification
- **JWT-based Authentication** with refresh tokens
- **User Profile Management**

## API Endpoints

### Authentication Endpoints

#### 1. User Registration

```http
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "securepassword123"
}
```

**Response:**

```json
{
  "message": "NEEDS_TO_VERIFY_EMAIL",
  "user": {
    "id": "uuid",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "userType": "FAN",
    "isVerified": false
  },
  "accessToken": "jwt_token"
}
```

#### 2. User Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "securepassword123"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "userType": "FAN",
    "isVerified": true
  },
  "accessToken": "jwt_token"
}
```

#### 3. Social Authentication

```http
POST /auth/social-auth
Content-Type: application/json

{
  "provider": "google",
  "accessToken": "google_access_token",
  "email": "user@gmail.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Supported Providers:**

- `google`
- `facebook`
- `apple`

#### 4. Email Verification

```http
POST /auth/verify-token
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "token": "12345"
}
```

#### 5. Request New Verification Token

```http
POST /auth/request-token
Authorization: Bearer <jwt_token>
```

#### 6. Forgot Password

```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "john.doe@example.com"
}
```

#### 7. Reset Password

```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset_token",
  "newPassword": "newsecurepassword123"
}
```

#### 8. Refresh Token

```http
POST /auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "refresh_token"
}
```

#### 9. Get Current User

```http
GET /auth/me
Authorization: Bearer <jwt_token>
```

#### 10. Logout

```http
POST /auth/logout
Authorization: Bearer <jwt_token>
```

## Database Schema

### User Model

```prisma
model User {
  id         String   @id @default(uuid())
  email      String   @unique
  password   String
  firstName  String
  lastName   String
  userType   Role     @default(FAN)
  isVerified Boolean  @default(false)
  createdAt  DateTime @default(now())
}

enum Role {
  FAN
  CELEBRITY
}
```

### Verification Token Model

```prisma
model VerifyToken {
  id    String   @id @default(uuid())
  token String
  ttl   DateTime
}
```

### Reset Token Model

```prisma
model ResetToken {
  id        String   @id @default(uuid())
  token     String   @unique
  email     String
  ttl       DateTime
  createdAt DateTime @default(now())
}
```

## Security Features

### Password Security

- Passwords are hashed using **Argon2** (industry-standard hashing algorithm)
- Password validation and strength requirements
- Secure password reset flow with time-limited tokens

### JWT Security

- JWT tokens with configurable expiration
- Refresh token mechanism for secure token renewal
- Stateless authentication for scalability

### Email Verification

- Email verification required for account activation
- Time-limited verification tokens (15 minutes)
- Automatic email sending via Brevo (formerly Sendinblue)

### Social Authentication

- Secure token verification with social providers
- Automatic user creation for new social users
- Pre-verified accounts for social authentication

## Environment Variables

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/vybraa_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# Email Service (Brevo)
SMTP_API_KEY="your-brevo-api-key"

# Frontend URL (for password reset links)
FRONTEND_URL="http://localhost:3000"
```

## Email Templates

The service uses Brevo email templates:

- **Dit_Verify_Mail** (Template ID: 2) - Email verification
- **Dit_Password_Reset_Mail** (Template ID: 3) - Password reset

## Error Handling

The service provides comprehensive error handling:

- **400 Bad Request** - Invalid input data
- **401 Unauthorized** - Invalid credentials or missing token
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server-side errors

## Mobile UI Integration

The authentication service is designed to work seamlessly with the Vybraa mobile app:

### Authentication Flow

1. **Registration** → Email verification required
2. **Login** → JWT token returned
3. **Social Auth** → Direct login with social provider
4. **Password Reset** → Email-based reset flow
5. **Token Refresh** → Automatic token renewal

### Mobile App Features

- Social login buttons (Google, Facebook, Apple)
- Email verification screen with 6-digit code input
- Password reset functionality
- Persistent authentication state
- Automatic token refresh

## Security Best Practices

1. **HTTPS Only** - All API calls should use HTTPS in production
2. **Rate Limiting** - Implement rate limiting for auth endpoints
3. **CORS Configuration** - Proper CORS setup for mobile app
4. **Input Validation** - Comprehensive input validation using DTOs
5. **Error Messages** - Generic error messages to prevent information leakage
6. **Token Expiration** - Short-lived access tokens with refresh mechanism
7. **Secure Headers** - Implement security headers (HSTS, CSP, etc.)

## Development Setup

1. **Install Dependencies:**

   ```bash
   npm install
   ```

2. **Database Setup:**

   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

3. **Environment Configuration:**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Development Server:**
   ```bash
   npm run start:dev
   ```

## Testing

The authentication service includes comprehensive testing:

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Production Deployment

1. **Environment Variables** - Set all required environment variables
2. **Database Migration** - Run production migrations
3. **Email Templates** - Configure Brevo email templates
4. **SSL Certificate** - Ensure HTTPS is enabled
5. **Rate Limiting** - Implement API rate limiting
6. **Monitoring** - Set up application monitoring and logging

## API Documentation

For detailed API documentation, refer to the Swagger documentation at:

```
http://localhost:3000/api/docs
```

## Support

For issues and questions regarding the authentication service, please refer to the project documentation or contact the development team.
