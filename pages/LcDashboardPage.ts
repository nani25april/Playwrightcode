import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LcDashboardPage extends BasePage {
  constructor(page: Page) { super(page); }

  async selectIssuanceTab(): Promise<void> {
    const issuance = this.page.getByRole('tab', { name: /^Issuance\b/i });
    await expect(issuance).toBeVisible({ timeout: 30_000 });
    await issuance.click();
    await expect(issuance).toHaveAttribute('aria-selected', 'true');
  }

  async openReviewFromSearch(referenceNumber: string): Promise<void> {
    const search = this.page.getByPlaceholder('Quick Search');
    await expect(search).toBeVisible({ timeout: 30_000 });
    await search.fill(referenceNumber);
    const row = this.page.getByRole('row', { name: new RegExp(referenceNumber) });
    await expect(row).toBeVisible({ timeout: 30_000 });
    await row.getByRole('button', { name: /Review/i }).click();
  }

  async searchInReview(referenceNumber: string): Promise<void> {
    const issuance = this.page.getByText('Issuance', { exact: true }).last();
    await expect(issuance).toBeVisible({ timeout: 30_000 });
    await issuance.click();
    // Issuance opens on Draft by default. Switch status tabs explicitly.
    const draft = this.page.getByRole('radio', { name: /^Draft\b/i });
    await expect(draft).toBeVisible({ timeout: 30_000 });
    const inReview = this.page.getByRole('radio', { name: /^In Review\b/i });
    await expect(inReview).toBeVisible({ timeout: 30_000 });
    await inReview.click();
    await expect(inReview).toBeChecked();
    const search = this.page.getByPlaceholder('Quick Search');
    await expect(search).toBeVisible();
    await search.fill(referenceNumber);
    await expect(this.page.getByText(referenceNumber, { exact: true })).toBeVisible({ timeout: 30_000 });
  }
}
