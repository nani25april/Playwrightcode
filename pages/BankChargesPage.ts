import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class BankChargesPage extends BasePage {
  constructor(page: Page) { super(page); }

  async selectGstExempted(value: string): Promise<void> {
    const gstExempted = this.page.getByText('GST Exempted', { exact: true })
      .locator('xpath=following::input[@role="combobox"][1]');
    await expect(gstExempted).toBeVisible();
    await gstExempted.fill(value);
    await this.page.getByRole('option', { name: new RegExp(`^${value}$`, 'i') }).click();
    await expect(this.page.getByText(value.toUpperCase(), { exact: true })).toBeVisible();
  }

  async clickNext(): Promise<void> {
    const next = this.page.getByRole('button', { name: 'Next', exact: true });
    await next.click();
    await this.page.waitForTimeout(1_500);
    if (await this.page.getByText('Charge Account', { exact: true }).isVisible()) {
      await next.click();
    }
  }
}
