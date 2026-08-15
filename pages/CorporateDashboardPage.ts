import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CorporateDashboardPage extends BasePage {
  readonly createNewRequest = this.page.getByText(/create\s+new\s+request/i).first();
  readonly letterOfCredit = this.page.locator(':text-is("Letter of Credit"):visible');
  readonly freshLcIssuance = this.page.getByText('Fresh LC Issuance', { exact: true });

  constructor(page: Page) { super(page); }

  async expectLoaded(): Promise<void> {
    await expect(this.createNewRequest).toBeVisible();
  }

  async openCreateNewRequest(): Promise<void> {
    await this.click(this.createNewRequest);
  }

  async selectLetterOfCredit(): Promise<void> {
    await this.click(this.letterOfCredit);
  }

  async startFreshLcIssuance(): Promise<void> {
    await this.click(this.freshLcIssuance);
    await this.expectUrl(/\/lc\/issuance\/create/);
  }

  async openLetterOfCreditInquiry(): Promise<void> {
    // The application renders this hamburger control without an accessible name.
    await expect(this.page.locator('[data-testid="page-loader"]')).toBeHidden({ timeout: 30_000 });
    const menu = this.page.locator('svg:has(path#Rectangle)').first();
    await this.click(menu);
    const letterOfCredit = this.page.getByText(/Letter of Credit\s*\(LC\)/i).first();
    await this.click(letterOfCredit);
    const issuance = this.page.getByText('Issuance', { exact: true }).last();
    await this.click(issuance);
  }

  async openAdvisingInquiry(): Promise<void> {
    await expect(this.page.locator('[data-testid="page-loader"]')).toBeHidden({ timeout: 30_000 });
    await this.click(this.page.locator('svg:has(path#Rectangle)').first());
    await this.click(this.page.getByText(/Letter of Credit\s*\(LC\)/i).first());
    await this.click(this.page.getByText('Advising', { exact: true }).last());
  }
}
