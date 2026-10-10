import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class AttachmentsPage extends BasePage {
  constructor(page: Page) { super(page); }

  async expectLoaded(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Attachments', exact: true })).toBeVisible();
  }

  async uploadFile(file: string | { name: string; mimeType: string; buffer: Buffer }): Promise<void> {
    const [fileChooser] = await Promise.all([
      this.page.waitForEvent('filechooser'),
      this.page.getByText('Click here', { exact: true }).click()
    ]);
    await fileChooser.setFiles(file);
    const fileName = typeof file === 'string' ? file.split(/[\\/]/).pop() ?? file : file.name;
    const displayedName = fileName.replace(/\.[^.]+$/, '');
    await expect(this.page.getByText(displayedName, { exact: true })).toBeVisible({
      timeout: 30_000
    });
  }

  async clickNext(): Promise<void> {
    await this.page.getByRole('button', { name: 'Next', exact: true }).click();
  }
}
