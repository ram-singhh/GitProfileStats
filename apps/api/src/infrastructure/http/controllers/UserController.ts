import type { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { GetUserProfileUseCase } from '../../../application/use-cases/user/GetUserProfileUseCase.js';
import { UpdateUserSettingsUseCase } from '../../../application/use-cases/user/UpdateUserSettingsUseCase.js';
import type { IUserRepository } from '../../../domain/interfaces/IUserRepository.js';
import { UserNotFoundError } from '../../../domain/errors/DomainError.js';
import type { IUserSettings } from '../../../domain/entities/User.js';
import type { IResponseCache } from '../../cache/IResponseCache.js';
import { invalidateUserCache } from '../middleware/cacheMiddleware.js';

import type { IAuthenticatedRequest } from '../middleware/authGuard.js';

@injectable()
export class UserController {
  constructor(
    @inject(GetUserProfileUseCase)
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    @inject(UpdateUserSettingsUseCase)
    private readonly updateUserSettingsUseCase: UpdateUserSettingsUseCase,
    @inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @inject('ResponseCache')
    private readonly responseCache?: IResponseCache,
  ) {}

  public getUserProfile = (req: Request, res: Response, next: NextFunction): void => {
    const userId = (req as IAuthenticatedRequest).user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    this.getUserProfileUseCase
      .execute(userId)
      .then((profile) => {
        res.status(200).json({ success: true, data: profile });
      })
      .catch(next);
  };

  public updateUserSettings = (req: Request, res: Response, next: NextFunction): void => {
    const userId = (req as IAuthenticatedRequest).user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    this.updateUserSettingsUseCase
      .execute(userId, req.body as Partial<IUserSettings>)
      .then((profile) => {
        res.status(200).json({ success: true, data: profile });
      })
      .catch(next);
  };

  public setGithubToken = (req: Request, res: Response, next: NextFunction): void => {
    const userId = (req as IAuthenticatedRequest).user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const token = req.body?.token;
    if (typeof token !== 'string' || token.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_GITHUB_TOKEN', message: 'A GitHub token is required' },
      });
      return;
    }

    void this.userRepository
      .findById(userId)
      .then(async (user) => {
        if (!user) {
          throw new UserNotFoundError(userId);
        }
        user.updateGithubAccessToken(token.trim());
        await this.userRepository.save(user);
        await invalidateUserCache(userId, this.responseCache);
      })
      .then(() => {
        res.status(200).json({ success: true, data: { hasGithubToken: true } });
      })
      .catch(next);
  };

  public clearGithubToken = (req: Request, res: Response, next: NextFunction): void => {
    const userId = (req as IAuthenticatedRequest).user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    void this.userRepository
      .findById(userId)
      .then(async (user) => {
        if (!user) {
          throw new UserNotFoundError(userId);
        }
        user.clearGithubAccessToken();
        await this.userRepository.save(user);
        await invalidateUserCache(userId, this.responseCache);
      })
      .then(() => {
        res.status(200).json({ success: true, data: { hasGithubToken: false } });
      })
      .catch(next);
  };
}
