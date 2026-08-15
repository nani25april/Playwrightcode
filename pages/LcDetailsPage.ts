import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export type LcDetailsData = {
  lcType: string;
  purpose: string;
  tradeType: string;
  expiryDate: string;
  expiryPlace: string;
  requestDate: string;
  ucpVersion: string;
  product: {
    hsnCode: string;
    quantity: string;
    toleranceSelection: string;
    toleranceValue: string;
    currency: string;
    amount: string;
  };
  goodsDescription: string;
  incoTermVersion: string;
  incoTerm: string;
  incoPlace: string;
  partialShipment: string;
  transshipment: string;
  placeOfReceipt: string;
  latestShipmentDate: string;
  portOfLoading: string;
  portOfDischarge: string;
  finalDestination: string;
  shipmentPeriod: string;
  documentType: string;
  documentDescription: string;
  documentDays: string;
  documentDaysFrom: string;
  reasonForDelay: string;
  creditAvailableWith: string;
  creditAvailableBy: string;
  draftsAt: string;
  paymentAgainst: string;
  tenorDays: string;
  paymentFrom: string;
  paymentCurrency: string;
  paymentAmount: string;
  chargeType: string;
  chargeApplicant: boolean;
  chargeBeneficiary: boolean;
  chargeAdditionalText: string;
  additionalConditions: string;
  bankInstructions: string;
};

export class LcDetailsPage extends BasePage {
  constructor(page: Page) { super(page); }

  private async select(label: string, value: string): Promise<void> {
    const input = this.page.getByRole('combobox', { name: label, exact: true });
    await expect(input).toBeVisible();
    await input.fill(value);
    await this.page.getByRole('option', { name: value, exact: true }).click();
  }

  private async fillLabel(label: string, value: string): Promise<void> {
    const labelElement = this.page.locator('label').filter({ hasText: label }).first();
    const fieldId = await labelElement.getAttribute('for');
    if (!fieldId) throw new Error(`No input target found for label: ${label}`);
    const target = this.page.locator(`[id="${fieldId}"]`);
    const input = (await target.evaluate((element) => element.tagName)) === 'INPUT'
      ? target
      : target.locator('input, textarea').first();
    await input.fill(value);
  }

  private async fillId(id: string, value: string): Promise<void> {
    await this.page.locator(`[id="${id}"]`).fill(value);
  }

  private async selectFollowingText(label: string, value: string, position = 1): Promise<void> {
    const input = this.page.getByText(label, { exact: true }).last()
      .locator(`xpath=following::input[@role="combobox"][${position}]`);
    await input.scrollIntoViewIfNeeded();
    await input.fill(value);
    await this.page.getByRole('option', { name: value, exact: true }).click();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page.getByText('Goods, Services & Documents', { exact: true })).toBeVisible();
  }

  async fillGoodsAndDocuments(data: LcDetailsData): Promise<void> {
    await this.page.getByText('Goods, Services & Documents', { exact: true }).click();
    await this.select('LC Type', data.lcType);
    await this.select('Purpose', data.purpose);
    await this.select('Trade Type', data.tradeType);
    await this.fillId('input-Date-of-Expiry', data.expiryDate);
    await this.fillId('input-Place-of-Expiry', data.expiryPlace);
    await this.fillId('input-Request-Date', data.requestDate);
    await this.select('UCP Version', data.ucpVersion);
    await this.page.getByText('Capital', { exact: true }).click();

    const productRow = this.page.locator('table').filter({ hasText: 'HSN Code' }).locator('tbody tr').first();
    const hsn = productRow.getByRole('combobox').first();
    await hsn.fill(data.product.hsnCode);
    await this.page.getByRole('option', { name: data.product.hsnCode, exact: true }).click();
    const productCells = productRow.locator('td');
    await productCells.nth(3).locator('input').fill(data.product.quantity);
    await productCells.nth(4).getByRole('combobox').fill(data.product.toleranceSelection);
    await this.page.getByRole('option', { name: new RegExp(data.product.toleranceSelection, 'i') }).first().click();
    const toleranceInputs = productCells.nth(5).locator('input');
    const toleranceParts = data.product.toleranceValue.split('/');
    await toleranceInputs.nth(0).fill(toleranceParts[0]);
    if (await toleranceInputs.count() > 1) await toleranceInputs.nth(1).fill(toleranceParts[1]);
    await productCells.nth(7).locator('input').fill(data.product.amount);

    await this.page.getByLabel('Description of Goods and/or Services (45A)', { exact: true }).fill(data.goodsDescription);
    await this.select('INCO Term Version', data.incoTermVersion);
    await this.select('INCO Term', data.incoTerm);
    await this.fillId('input-Place', data.incoPlace);
    await this.select('Partial Shipment Option (43P)', data.partialShipment);
    await this.select('Transshipment Option (43T)', data.transshipment);
    await this.fillId('input-Place-Of-Receipt-(44A)', data.placeOfReceipt);
    await this.fillId('input-Latest-Shipment-Date-(44C)', data.latestShipmentDate);
    await this.fillId('input-Port-Of-Loading/Airport-Of-Departure-(44E)', data.portOfLoading);
    await this.fillId('input-Port-Of-Discharge/Airport-Of-Destination-(44F)', data.portOfDischarge);
    await this.fillId('input-Place-Of-Final-Destination-(44B)', data.finalDestination);
    await this.fillId('input-Shipment-Period-(44D)', data.shipmentPeriod);

    await this.select('Document Type', data.documentType);
    await this.page.getByLabel('Tracked Text Area', { exact: true }).last().fill(data.documentDescription);
    const documentTiming = this.page.getByText('Document To be presented within (Days) (48)', { exact: true }).locator('xpath=..');
    await documentTiming.locator('input').first().fill(data.documentDays);
    await documentTiming.getByRole('button', { name: 'After', exact: true }).click();
    const documentEvent = documentTiming.getByRole('combobox');
    await documentEvent.fill(data.documentDaysFrom);
    await this.page.getByRole('option', { name: /bill of lading/i }).first().click();
    await this.fillId('input-Reason-for-Delay', data.reasonForDelay);
  }

  async fillPaymentDetails(data: LcDetailsData): Promise<void> {
    await this.page.getByText('Payment Details', { exact: true }).click();
    await this.select('Credit Available With (41A)', data.creditAvailableWith);
    await this.select('Credit Available By (41A)', data.creditAvailableBy);
    const drafts = this.page.getByRole('combobox', { name: 'Drafts At (42C)', exact: true });
    if (await drafts.count()) await this.select('Drafts At (42C)', data.draftsAt);
    const paymentHeader = this.page.getByText('Payment Against', { exact: true });
    await this.selectFollowingText('Payment Against', data.paymentAgainst, 1);
    await paymentHeader.locator('xpath=following::input[not(@role="combobox")][1]').fill(data.tenorDays);
    await this.selectFollowingText('Payment Against', data.paymentFrom, 2);
    await paymentHeader.locator('xpath=following::input[not(@role="combobox")][2]').fill(data.paymentAmount);
    await this.selectFollowingText('Charge Type *', data.chargeType);
    if (data.chargeApplicant) await this.page.getByText('Applicant', { exact: true }).click();
    if (data.chargeBeneficiary) await this.page.getByText('Beneficiary', { exact: true }).click();
    await this.page.getByText('Charge Type *', { exact: true })
      .locator('xpath=following::input[@type="text"][1]')
      .fill(data.chargeAdditionalText);
  }

  async fillAdditionalConditions(data: LcDetailsData): Promise<void> {
    await this.page.getByText('Additional Conditions', { exact: true }).click();
    await this.page.getByLabel('Additional Conditions (47A)', { exact: true }).fill(data.additionalConditions);
    await this.page.getByLabel('Instructions to the Paying/Accepting/Negotiating Bank (78)', { exact: true }).fill(data.bankInstructions);
  }

  async clickNext(): Promise<void> {
    const next = this.page.getByRole('button', { name: 'Next', exact: true });
    await this.page.waitForTimeout(1_000);
    await next.click();
    await this.page.waitForTimeout(1_500);
    if (await this.page.getByText('Goods, Services & Documents', { exact: true }).isVisible()) {
      await next.click();
    }
  }
}
