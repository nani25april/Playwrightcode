import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export type TransactionDetails = {
  beneficiarySearchBy: 'NAME' | 'PAN' | 'GSTIN';
  beneficiarySearchValue: string;
  proformaInvoiceNumber: string;
  proformaInvoiceDate: string; // DD-MMM-YYYY, e.g. 01-AUG-2026
  amount: string;
  currency: string;
};

export type CollateralBackedDetails = {
  marginPercent: string;
  debitAccountNumber: string;
  /** Leave undefined when the application calculates the FD amount. */
  fdAmount?: string;
  fdMaturityDate: string; // DD-MMM-YYYY
};

export type SpecialLcConditionsDetails = {
  confirmationOfCredit: string;
  confirmingBank: string;
  confirmingBankBranch: string;
};

export class TransactionDetailsPage extends BasePage {
  readonly title = this.page.getByText('Transaction Details', { exact: true });
  readonly beneficiaryAddress = this.page.locator('input[id="input-Beneficiary\'s-Address"]');
  readonly proformaInvoiceNumber = this.page.locator('input[id="input-PO/Proforma-Invoice-No."]');
  readonly proformaInvoiceDate = this.page.locator('input[id="input-PO/Proforma-Invoice-Date"]');
  readonly amount = this.page.locator('input[inputmode="numeric"]').first();
  readonly currency = this.page.getByRole('combobox', { name: 'Currency' });
  readonly nextButton = this.page.getByRole('button', { name: 'Next', exact: true });
  readonly collateralBackedButton = this.page.getByRole('button', { name: 'Collateral Backed', exact: true });
  readonly marginPercent = this.page.locator('input[id="input-Margin-%"]');

  constructor(page: Page) { super(page); }

  async expectLoaded(): Promise<void> {
    await expect(this.title).toBeVisible({ timeout: 30_000 });
    await expect(this.page.getByText('Beneficiary Name*', { exact: true })).toBeVisible({ timeout: 30_000 });
  }

  async fillMandatoryFields(data: TransactionDetails): Promise<void> {
    if (!await this.beneficiarySearchInput().isVisible()) {
      await this.click(this.page.getByText(/Beneficiary Details/).first());
    }
    await expect(this.beneficiarySearchInput()).toBeVisible();
    const searchTab = `${data.beneficiarySearchBy[0]}${data.beneficiarySearchBy.slice(1).toLowerCase()}`;
    await this.click(this.page.getByRole('button', { name: searchTab, exact: true }));
    await this.selectOption(this.beneficiarySearchInput(), data.beneficiarySearchValue);
    await expect(this.beneficiaryAddress).not.toHaveValue('', { timeout: 15_000 });
    await this.fill(this.proformaInvoiceNumber, data.proformaInvoiceNumber);
    await this.fill(this.proformaInvoiceDate, data.proformaInvoiceDate);
    await this.fill(this.amount, data.amount);
    await this.selectOption(this.currency, data.currency);
  }

  async goToLcDetails(): Promise<void> {
    await this.click(this.nextButton);
    await expect(this.page.getByText('LC Details', { exact: true })).toBeVisible({ timeout: 30_000 });
  }

  async selectCollateralBacked(details: CollateralBackedDetails): Promise<void> {
    await this.click(this.collateralBackedButton);
    await this.fill(this.marginPercent, details.marginPercent);
    await this.click(this.page.getByText(/Choose FDs/).last());
    await this.selectOption(this.debitAccountInput(), details.debitAccountNumber);
    if (details.fdAmount) {
      await this.fill(this.fdAmountInput(), details.fdAmount);
    }
    await this.fill(this.fdMaturityDateInput(), details.fdMaturityDate);
  }

  async configureBankConfirmation(details: SpecialLcConditionsDetails): Promise<void> {
    await this.click(this.specialLcConditionsToggle());
    await this.click(this.page.getByText('Bank Confirmation Required', { exact: true }));
    await this.selectOption(
      this.page.getByRole('combobox', { name: 'Confirmation of Credit (49)' }),
      details.confirmationOfCredit
    );
    await this.selectOption(
      this.page.getByRole('combobox', { name: 'Confirming Bank (SBA)' }),
      details.confirmingBank
    );
    const confirmingBankBranch = this.confirmingBankBranchInput();
    await this.fill(confirmingBankBranch, details.confirmingBankBranch);
    await this.click(this.page.getByRole('option', { name: /HYDERABAD/i }).first());
    await this.page.waitForTimeout(2_000);
    await expect(this.page.locator('input[id="input-Confirming-Bank-IFSC-Code"]')).not.toHaveValue('');
  }

  private beneficiarySearchInput(): Locator {
    return this.page.getByText('Beneficiary Name*', { exact: true })
      .locator('xpath=following::input[@role="combobox"][1]');
  }

  private async selectOption(input: Locator, value: string): Promise<void> {
    await this.fill(input, value);
    await this.click(this.page.getByRole('option', { name: value, exact: true }));
  }

  private debitAccountInput(): Locator {
    return this.page.getByRole('combobox', { name: 'Debit Account Number' });
  }

  private fdAmountInput(): Locator {
    return this.page.getByText('FD Amount', { exact: true })
      .locator('xpath=following::input[1]');
  }

  private fdMaturityDateInput(): Locator {
    return this.page.locator('#input-Maturity-Date');
  }

  private specialLcConditionsToggle(): Locator {
    return this.page.getByText('Special LC Conditions', { exact: true })
      .locator('xpath=../following-sibling::div//label');
  }

  private confirmingBankBranchInput(): Locator {
    return this.page.getByText('Confirming Bank Branch*', { exact: true })
      .locator('xpath=following::input[@role="combobox"][1]');
  }
}
