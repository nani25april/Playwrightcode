import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class BankInputterPage extends BasePage {
  constructor(page: Page) { super(page); }

  async proceedThroughTransactionDetails(): Promise<void> {
    await this.clickProceed();
  }

  async proceedThroughLcDetails(): Promise<void> {
    await this.clickProceed();
  }

  async proceedThroughBankCharges(): Promise<void> {
    await this.clickProceed();
  }

  async fillBankChargeAccount(accountNumber: string, gstNumber: string): Promise<void> {
    await this.page.getByPlaceholder('Enter charge account number').fill(accountNumber);
    await this.page.getByPlaceholder('Enter GST number').fill(gstNumber);
  }

  async selectChargesAlreadyPaid(): Promise<void> {
    const visualLabel = this.page.locator('label:visible').filter({ hasText: /Charges Already Paid/i }).first();
    await expect(visualLabel).toBeVisible();
    const checkbox = visualLabel.locator('input[type="checkbox"]');
    await visualLabel.click();
    await expect(checkbox).toBeChecked();
    await this.page.waitForTimeout(1_000);
  }

  async proceedThroughAttachments(): Promise<void> {
    await this.clickProceed();
  }

  async proceedThroughReview(): Promise<void> {
    await this.clickProceed();
  }

  async enterBuyerBankTransactionReference(referenceNumber: string): Promise<void> {
    const input = this.page.getByRole('textbox', { name: /Enter Buyer Core Banking Reference Number/i }).first();
    if (await input.count()) {
      await input.click();
      await input.fill('');
      await input.pressSequentially(referenceNumber);
      await input.press('Tab');
      await this.page.waitForTimeout(1_000);
      return;
    }

    const fallback = this.page.getByText('Buyer Bank Transaction Reference Number', { exact: true })
      .locator('xpath=following::input[1]');
    await expect(fallback).toBeVisible();
    await fallback.click();
    await fallback.fill('');
    await fallback.pressSequentially(referenceNumber);
    await fallback.press('Tab');
    await this.page.waitForTimeout(1_000);
  }

  async enterSellerBankTransactionReference(referenceNumber: string): Promise<void> {
    await this.enterBankTransactionReference(/Core Banking Reference Number/i, referenceNumber);
  }

  private async enterBankTransactionReference(fieldLabel: RegExp, referenceNumber: string): Promise<void> {
    const input = this.page.getByRole('textbox', { name: fieldLabel }).first();
    if (await input.count()) {
      await input.click();
      await input.fill('');
      await input.pressSequentially(referenceNumber);
      await input.press('Tab');
      await this.page.waitForTimeout(1_000);
      return;
    }

    const fallback = this.page.getByText(fieldLabel).first()
      .locator('xpath=following::input[1]');
    if (await fallback.count() && await fallback.isVisible()) {
      await fallback.click();
      await fallback.fill('');
      await fallback.pressSequentially(referenceNumber);
      await fallback.press('Tab');
      await this.page.waitForTimeout(1_000);
      return;
    }

    // Advising uses a visual-only label; its reference field is the final visible input.
    const finalReferenceInput = this.page.locator('input:visible').last();
    await expect(finalReferenceInput).toBeVisible();
    await finalReferenceInput.click();
    await finalReferenceInput.fill('');
    await finalReferenceInput.pressSequentially(referenceNumber);
    await finalReferenceInput.press('Tab');
    await this.page.waitForTimeout(500);
  }

  async proceed(): Promise<void> {
    await this.clickProceed();
  }

  private async clickProceed(): Promise<void> {
    await this.page.getByRole('button', { name: 'Proceed', exact: true }).click();
  }
}
