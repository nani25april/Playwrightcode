import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class AttachmentsPage extends BasePage {
  constructor(page: Page) { super(page); }

  async expectLoaded(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Attachments', exact: true })).toBeVisible();
  }

  async uploadFile(filePath: string): Promise<void> {
    const [fileChooser] = await Promise.all([
      this.page.waitForEvent('filechooser'),
      this.page.getByText('Click here', { exact: true }).click()
    ]);
    await fileChooser.setFiles(filePath);
    await expect(this.page.getByText('File Uploaded Successfully', { exact: true })).toBeVisible({
      timeout: 30_000
    });
  }

  async clickNext(): Promise<void> {
    await this.page.getByRole('button', { name: 'Next', exact: true }).click();
  }
}
