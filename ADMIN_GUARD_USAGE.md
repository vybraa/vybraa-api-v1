# 🔐 Admin Guard and Role-Based Access Control

This document explains how to use the admin guard and role-based access control in the vybraa-api-v1 project.

## 🛡️ Available Guards

### 1. AuthGuard

- **Purpose**: Basic authentication check
- **Usage**: Ensures user is logged in and has a valid JWT token
- **Applies to**: All routes by default (unless marked as `@Public()`)

### 2. AdminGuard

- **Purpose**: Admin-only access control
- **Usage**: Extends AuthGuard and checks if user has `isAdmin: true`
- **Applies to**: Routes marked with `@Admin()`

### 3. RolesGuard

- **Purpose**: Role-based access control
- **Usage**: Extends AuthGuard and checks user roles
- **Applies to**: Routes marked with `@Roles()`

## 🎯 Available Decorators

### 1. @Public()

```typescript
import { Public } from '../decorators';

@Public()
@Get('public-route')
async publicRoute() {
  return 'This route is public';
}
```

### 2. @Admin()

```typescript
import { Admin } from '../decorators';

@Admin()
@Get('admin-only')
async adminRoute() {
  return 'This route requires admin access';
}
```

### 3. @Roles()

```typescript
import { Roles } from '../decorators';
import { Role } from '@prisma/client';

@Roles(Role.ADMIN, Role.CELEBRITY)
@Get('role-protected')
async roleProtectedRoute() {
  return 'This route requires ADMIN or CELEBRITY role';
}
```

## 🚀 Implementation Examples

### Example 1: Admin-Only Controller

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminGuard, Admin } from '../guards';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  @Admin()
  @Get('dashboard')
  async getDashboard() {
    return { message: 'Admin dashboard' };
  }

  @Admin()
  @Get('users')
  async getAllUsers() {
    return { message: 'All users list' };
  }
}
```

### Example 2: Mixed Access Controller

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { RolesGuard, Roles, Public } from '../guards';
import { Role } from '@prisma/client';

@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  @Public()
  @Get('profile')
  async getPublicProfile() {
    return { message: 'Public profile' };
  }

  @Roles(Role.CELEBRITY)
  @Get('celebrity-dashboard')
  async getCelebrityDashboard() {
    return { message: 'Celebrity dashboard' };
  }

  @Roles(Role.ADMIN)
  @Get('admin-users')
  async getAdminUsers() {
    return { message: 'Admin users management' };
  }
}
```

### Example 3: Method-Level Protection

```typescript
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { RolesGuard, Roles, Admin } from '../guards';
import { Role } from '@prisma/client';

@Controller('exchange-rates')
@UseGuards(RolesGuard)
export class ExchangeRatesController {
  @Get()
  @Roles(Role.ADMIN)
  async getAllRates() {
    return { message: 'All exchange rates' };
  }

  @Post()
  @Admin()
  async createRate() {
    return { message: 'Create exchange rate' };
  }

  @Get('public')
  @Public()
  async getPublicRates() {
    return { message: 'Public exchange rates' };
  }
}
```

## 🔧 Global Guard Setup

### Option 1: App Module Level

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
```

### Option 2: Controller Level

```typescript
@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  // All methods in this controller require admin access
}
```

### Option 3: Method Level

```typescript
@Controller('users')
export class UsersController {
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin-only')
  async adminMethod() {
    // This method requires admin role
  }
}
```

## 📋 User Roles and Permissions

### Role Types (from Prisma schema)

- **FAN**: Basic user role
- **CELEBRITY**: Celebrity user role
- **ADMIN**: Admin user role (checked via `isAdmin` field)

### Permission Matrix

| Route Type | FAN | CELEBRITY | ADMIN |
| ---------- | --- | --------- | ----- |
| Public     | ✅  | ✅        | ✅    |
| Fan Only   | ✅  | ❌        | ❌    |
| Celebrity  | ❌  | ✅        | ✅    |
| Admin Only | ❌  | ❌        | ✅    |

## 🚨 Error Handling

### Authentication Errors

- **401 Unauthorized**: Invalid or missing JWT token
- **403 Forbidden**: Valid token but insufficient permissions

### Error Messages

```typescript
// Admin access required
throw new ForbiddenException('Admin access required');

// Role-based access denied
throw new ForbiddenException('Access denied. Required roles: ADMIN, CELEBRITY');
```

## 🔍 Testing Guards

### Test Setup

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AdminGuard } from '../guards';

describe('AdminGuard', () => {
  let guard: AdminGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminGuard],
    }).compile();

    guard = module.get<AdminGuard>(AdminGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
});
```

## 📚 Best Practices

1. **Use @Public() sparingly**: Only mark routes as public when absolutely necessary
2. **Prefer @Roles() over @Admin()**: Use role-based access for better flexibility
3. **Combine guards appropriately**: Use the most specific guard for your use case
4. **Test permissions thoroughly**: Ensure guards work correctly in all scenarios
5. **Document access requirements**: Make it clear which routes require what permissions

## 🔗 Related Files

- `src/guards/auth.guard.ts` - Base authentication guard
- `src/guards/admin.guard.ts` - Admin-specific guard
- `src/guards/roles.guard.ts` - Role-based access guard
- `src/decorators/admin.decorator.ts` - Admin decorator
- `src/decorators/roles.decorator.ts` - Roles decorator
- `src/decorators/auth.decorator.ts` - Public route decorator
