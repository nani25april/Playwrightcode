import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class AttachmentsPage extends BasePage {
  constructor(page: Page) { super(page); }

  async expectLoaded(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Attachments', exact: true })).toBeVisible();
    const emptyState = this.page.getByText('No document categories are configured for this product and event.', { exact: true });
    const uploadCategory = this.page.getByRole('button', { name: 'Upload From Vault', exact: true }).first();
    await expect(emptyState.or(uploadCategory)).toBeVisible();
  }

  async clickNext(): Promise<void> {
    await this.page.getByRole('button', { name: 'Next', exact: true }).click();
  }
}
