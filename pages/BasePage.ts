import { expect, type Locator, type Page } from '@playwright/test';

/** Common browser operations shared by all application pages. */
export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  async goto(path = ''): Promise<void> { await this.page.goto(path); }
  async click(target: Locator): Promise<void> { await expect(target).toBeVisible(); await target.click(); }
  async fill(target: Locator, value: string): Promise<void> { await expect(target).toBeVisible(); await target.fill(value); }
  async expectUrl(pathOrUrl: string | RegExp): Promise<void> { await expect(this.page).toHaveURL(pathOrUrl); }
}
