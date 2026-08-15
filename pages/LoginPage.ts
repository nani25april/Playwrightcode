import { type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export type LoginCredentials = {
  email: string;
  password: string;
};

export class LoginPage extends BasePage {
  readonly emailInput = this.page.getByRole('textbox', { name: 'Email*', exact: true });
  readonly passwordInput = this.page.getByRole('textbox', { name: 'Password*', exact: true });
  readonly loginButton = this.page.getByRole('button', { name: 'Login' });
  readonly errorMessage = this.page.locator('[role="alert"], .alert, .error-message').first();

  constructor(page: Page) { super(page); }
  async open(): Promise<void> { await this.goto('/'); }
  async login(credentials: LoginCredentials): Promise<void> {
    await this.fill(this.emailInput, credentials.email);
    await this.fill(this.passwordInput, credentials.password);
    await this.click(this.loginButton);

    try {
      await this.page.waitForURL(/\/dashboard\//, { timeout: 20_000 });
    } catch {
      const alertText = await this.errorMessage.textContent().catch(() => '');
      throw new Error(
        `Login failed for ${credentials.email}. ${alertText ? `Server response: ${alertText.trim()}.` : 'No dashboard redirect was observed after login.'}`
      );
    }
  }
}
