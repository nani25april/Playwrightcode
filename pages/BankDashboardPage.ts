import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class BankDashboardPage extends BasePage {
  constructor(page: Page) { super(page); }

  async expectLoaded(): Promise<void> {
    await expect(this.page.getByText('HDFC BANK INDIA Dashboard', { exact: true })).toBeVisible({ timeout: 30_000 });
  }

  async selectLcAdvisingTab(): Promise<void> {
    const advising = this.page.getByText('LC Advising', { exact: true }).first();
    await expect(advising).toBeVisible({ timeout: 30_000 });
    await advising.click();
  }

  private async findRecord(referenceNumber: string) {
    const search = this.page.getByPlaceholder('Quick Search');
    await expect(search).toBeVisible({ timeout: 30_000 });
    const row = this.page.getByRole('row', { name: new RegExp(referenceNumber) });
    for (let attempt = 0; attempt < 12; attempt++) {
      await search.fill(referenceNumber);
      if (await row.isVisible({ timeout: 5_000 })) {
        await this.page.waitForTimeout(1_000);
        return row;
      }
      await this.page.waitForTimeout(3_000);
    }
    await expect(row).toBeVisible({ timeout: 30_000 });
    return row;
  }

  async openReview(referenceNumber: string): Promise<void> {
    const row = await this.findRecord(referenceNumber);
    await row.getByRole('button', { name: /Review/i }).click();
  }

  async openEdit(referenceNumber: string): Promise<void> {
    const row = await this.findRecord(referenceNumber);
    await row.getByRole('button', { name: /Edit/i }).click();
  }
}
