import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class InventoryPage extends BasePage {
  readonly pageTitle = this.page.getByText('Products', { exact: true });
  readonly inventoryItems = this.page.locator('.inventory_item');
  readonly cartLink = this.page.locator('.shopping_cart_link');

  constructor(page: Page) { super(page); }
  addToCartButton(productName: string) {
    return this.page.locator('.inventory_item', { hasText: productName }).getByRole('button', { name: /add to cart/i });
  }
  async expectLoaded(): Promise<void> { await expect(this.pageTitle).toBeVisible(); }
  async addProductToCart(productName: string): Promise<void> { await this.click(this.addToCartButton(productName)); }
}
