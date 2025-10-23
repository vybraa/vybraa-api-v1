import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminGuard } from './admin.guard';
import { AuthGuard } from './auth.guard';
import { IS_ADMIN_KEY } from '../decorators/admin.decorator';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let reflector: Reflector;
  let mockAuthGuard: jest.Mocked<AuthGuard>;

  const mockExecutionContext = {
    switchToHttp: () => ({
      getRequest: () => ({
        user: { id: '1', email: 'admin@test.com', isAdmin: true },
      }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<AdminGuard>(AdminGuard);
    reflector = module.get<Reflector>(Reflector);

    // Mock the parent AuthGuard
    mockAuthGuard = {
      canActivate: jest.fn(),
    } as any;

    // Replace the parent guard method
    jest.spyOn(guard as any, 'super.canActivate').mockResolvedValue(true);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow access when admin is not required', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      const result = await guard.canActivate(mockExecutionContext);
      expect(result).toBe(true);
    });

    it('should allow access when user is admin', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const result = await guard.canActivate(mockExecutionContext);
      expect(result).toBe(true);
    });

    it('should deny access when user is not admin', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const mockContextWithNonAdmin = {
        ...mockExecutionContext,
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: '2', email: 'user@test.com', isAdmin: false },
          }),
        }),
      } as ExecutionContext;

      await expect(guard.canActivate(mockContextWithNonAdmin)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should deny access when user is not found in request', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const mockContextWithoutUser = {
        ...mockExecutionContext,
        switchToHttp: () => ({
          getRequest: () => ({}),
        }),
      } as ExecutionContext;

      await expect(guard.canActivate(mockContextWithoutUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should deny access when authentication fails', async () => {
      jest.spyOn(guard as any, 'super.canActivate').mockResolvedValue(false);

      const result = await guard.canActivate(mockExecutionContext);
      expect(result).toBe(false);
    });
  });

  describe('error messages', () => {
    it('should provide clear error message for missing user', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const mockContextWithoutUser = {
        ...mockExecutionContext,
        switchToHttp: () => ({
          getRequest: () => ({}),
        }),
      } as ExecutionContext;

      try {
        await guard.canActivate(mockContextWithoutUser);
      } catch (error) {
        expect(error.message).toBe('User not found in request');
      }
    });

    it('should provide clear error message for non-admin access', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const mockContextWithNonAdmin = {
        ...mockExecutionContext,
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: '2', email: 'user@test.com', isAdmin: false },
          }),
        }),
      } as ExecutionContext;

      try {
        await guard.canActivate(mockContextWithNonAdmin);
      } catch (error) {
        expect(error.message).toBe('Admin access required');
      }
    });
  });
});
