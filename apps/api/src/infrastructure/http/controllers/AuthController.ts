import type { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { env } from '../../../config/env.js';
import { logger } from '../../../config/logger.js';
import type { IUserRepository } from '../../../domain/interfaces/IUserRepository.js';
import { User } from '../../../domain/entities/User.js';
import { GitHubService } from '../../../github/github.service.js';
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  SessionService,
} from '../../../application/services/SessionService.js';

@injectable()
export class AuthController {
  constructor(
    @inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @inject(GitHubService)
    private readonly gitHubService: GitHubService,
    @inject(SessionService)
    private readonly sessionService: SessionService,
  ) {}

  public loginWithGithub = (req: Request, res: Response): void => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(env.GITHUB_CALLBACK_URL)}&scope=read:user,repo`;
    res.redirect(githubAuthUrl);
  };

  public handleGithubCallback = (req: Request, res: Response): void => {
    const code = req.query.code as string;
    if (!code) {
      res.redirect(`${env.WEB_BASE_URL}/login/callback?error=missing_code`);
      return;
    }

    void this.processGithubCallback(code, res);
  };

  private async processGithubCallback(code: string, res: Response): Promise<void> {
    try {
      logger.info('Exchanging OAuth code for token');
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: env.GITHUB_CALLBACK_URL,
        }),
      });

      if (!tokenResponse.ok) {
        const errText = await tokenResponse.text();
        throw new Error(`Failed to exchange code: ${tokenResponse.statusText} - ${errText}`);
      }

      const tokenData = (await tokenResponse.json()) as {
        access_token?: string;
        error?: string;
        error_description?: string;
      };

      if (tokenData.error) {
        throw new Error(tokenData.error_description ?? tokenData.error);
      }

      const accessToken = tokenData.access_token;
      if (!accessToken) {
        throw new Error('Access token not found in response');
      }

      logger.info('Fetching GitHub user profile with access token');
      const githubUser = await this.gitHubService.getAuthenticatedUser(accessToken);

      // Find or create user
      let user =
        (await this.userRepository.findById(githubUser.id.toString())) ??
        (await this.userRepository.findByUsername(githubUser.login));
      if (!user) {
        user = User.create({
          id: githubUser.id.toString(),
          githubId: githubUser.id.toString(),
          username: githubUser.login,
          email: githubUser.email ?? null,
          avatarUrl: githubUser.avatar_url,
          tier: 'FREE',
          githubAccessToken: accessToken,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await this.userRepository.save(user);
        logger.info({ username: user.username }, 'Created new user');
      } else {
        user.updateGithubAccessToken(accessToken);
        await this.userRepository.save(user);
        logger.info({ username: user.username }, 'Existing user logged in');
      }

      const session = this.sessionService.createSession(user.id);
      const isSecure = env.NODE_ENV === 'production' || env.NODE_ENV === 'test';
      res.cookie(SESSION_COOKIE_NAME, session, {
        httpOnly: true,
        secure: isSecure,
        sameSite: isSecure ? 'none' : 'lax',
        maxAge: SESSION_MAX_AGE_SECONDS * 1000,
        path: '/',
      });
      res.redirect(`${env.WEB_BASE_URL}/login/callback`);
    } catch (error: unknown) {
      logger.error(
        { errorType: error instanceof Error ? error.name : typeof error },
        'GitHub OAuth callback error',
      );
      res.redirect(`${env.WEB_BASE_URL}/login/callback?error=auth_failed`);
    }
  }

  public logout = (req: Request, res: Response): void => {
    const isSecure = env.NODE_ENV === 'production' || env.NODE_ENV === 'test';
    res.clearCookie(SESSION_COOKIE_NAME, {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? 'none' : 'lax',
      path: '/',
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  };
}
