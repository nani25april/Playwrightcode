import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ReviewPage extends BasePage {
  constructor(page: Page) { super(page); }

  async expectLoaded(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Request Forwarded To', exact: true })).toBeVisible({
      timeout: 30_000
    });
  }

  async acceptDeclarations(): Promise<void> {
    const acceptanceText = this.page.getByText(/I have read and I accept all the/i);
    await expect(acceptanceText).toBeVisible({ timeout: 30_000 });
    await acceptanceText.click();
  }

  async selectBillPurchaseDuringPayment(): Promise<void> {
    const option = this.page.getByRole('switch', {
      name: /Request for Bill Purchase during payment/i
    });
    await expect(option).toBeVisible({ timeout: 30_000 });
    await option.check({ force: true });
    await expect(option).toHaveAttribute('aria-checked', 'true');
  }

  async selectWorkflow(workflow: string): Promise<void> {
    const input = this.page.getByRole('combobox', { name: 'Workflow', exact: true });
    await input.fill(workflow);
    await this.page.getByRole('option', { name: new RegExp(`^${workflow}$`, 'i') }).click();
  }

  async selectRequestForwardedWorkflow(workflow: string): Promise<void> {
    const input = this.page.getByRole('combobox', { name: /Request forwarded to Workflow|Workflow/i }).first();
    await expect(input).toBeVisible({ timeout: 30_000 });
    await input.fill(workflow);
    await this.page.getByRole('option', { name: new RegExp(`^${workflow}$`, 'i') }).click();
  }

  async submit(): Promise<void> {
    await this.page.getByRole('button', { name: 'Submit', exact: true }).click();
  }

  async approve(): Promise<void> {
    await this.page.getByRole('button', { name: 'Approve', exact: true }).click();
  }

  async accept(): Promise<void> {
    await this.page.getByRole('button', { name: 'Accept', exact: true }).click();
  }

  async confirm(): Promise<void> {
    const confirmButton = this.page.getByRole('button', { name: 'Confirm', exact: true }).last();
    await expect(confirmButton).toBeVisible({ timeout: 30_000 });
    await confirmButton.click();
    await this.page.waitForTimeout(750);
  }

  async getLcReferenceNumber(): Promise<string> {
    await expect(this.page.getByText('Success', { exact: true })).toBeVisible({ timeout: 30_000 });
    const body = await this.page.locator('body').innerText();
    const match = body.match(/Reference Number\s+([A-Z0-9-]+)/i);
    if (!match) throw new Error('LC reference number was not found on the Success page.');
    return match[1];
  }

  
  async backToDashboard(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Success', exact: true })).toBeVisible({ timeout: 30_000 });
    await this.page.getByRole('button', { name: 'Back to Dashboard', exact: true }).click();
  }
}
