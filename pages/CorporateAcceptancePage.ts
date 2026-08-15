import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CorporateAcceptancePage extends BasePage {
  constructor(page: Page) { super(page); }

  async expectLoaded(): Promise<void> {
    await expect(this.page.getByRole('tab', { name: /^Advised LCs\b/i })).toBeVisible({ timeout: 30_000 });
  }

  async selectAdvisedLcs(): Promise<void> {
    const tab = this.page.getByRole('tab', { name: /^Advised LCs\b/i });
    await expect(tab).toBeVisible({ timeout: 30_000 });
    await tab.click();
  }

  async selectInReview(): Promise<void> {
    const status = this.page.getByRole('radio', { name: /^In Review\b/i });
    await expect(status).toBeVisible({ timeout: 30_000 });
    await status.click();
    await expect(status).toBeChecked();
  }

  async selectProcessed(): Promise<void> {
    const status = this.page.getByRole('radio', { name: /^Processed\b/i });
    await expect(status).toBeVisible({ timeout: 30_000 });
    await status.click();
    await expect(status).toBeChecked();
  }

  async search(referenceNumber: string): Promise<void> {
    const search = this.page.getByPlaceholder('Quick Search');
    await expect(search).toBeVisible({ timeout: 30_000 });
    await search.fill(referenceNumber);
    await expect(this.page.getByRole('row', { name: new RegExp(referenceNumber) })).toBeVisible({ timeout: 30_000 });
  }

  async clickAction(referenceNumber: string, action: RegExp): Promise<void> {
    const row = this.page.getByRole('row', { name: new RegExp(referenceNumber) });
    await expect(row).toBeVisible({ timeout: 30_000 });
    await row.getByRole('button', { name: action }).click();
  }
}
