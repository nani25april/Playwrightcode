import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class BankAuthoriserPage extends BasePage {
  constructor(page: Page) { super(page); }

  async enterReverifyBuyerCorebankingReference(referenceNumber: string): Promise<void> {
    const input = this.page.getByLabel(/Reverify .*Core Banking Reference Number/i).first();
    if (await input.count()) {
      await input.fill(referenceNumber);
      return;
    }

    const fallback = this.page.getByText(/Reverify .*Core Banking Reference Number/i).first()
      .locator('xpath=following::input[1]');
    await expect(fallback).toBeVisible();
    await fallback.fill(referenceNumber);
  }
}
