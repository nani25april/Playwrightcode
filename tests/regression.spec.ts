import { expect, requiredCredential, test } from './fixtures/multi-user.fixture';
import type { Browser, BrowserContext, Locator, Page } from '@playwright/test';
import { BankChargesPage } from '../pages/BankChargesPage';
import { BankAuthoriserPage } from '../pages/BankAuthoriserPage';
import { BankDashboardPage } from '../pages/BankDashboardPage';
import { BankInputterPage } from '../pages/BankInputterPage';
import { CorporateDashboardPage } from '../pages/CorporateDashboardPage';
import { CorporateAcceptancePage } from '../pages/CorporateAcceptancePage';
import { LoginPage } from '../pages/LoginPage';
import { LcDashboardPage } from '../pages/LcDashboardPage';
import { LcDetailsPage } from '../pages/LcDetailsPage';
import { TransactionDetailsPage } from '../pages/TransactionDetailsPage';
import { AttachmentsPage } from '../pages/AttachmentsPage';
import { ReviewPage } from '../pages/ReviewPage';
import {
  collateralBackedData,
  lcDetailsData,
  specialLcConditionsData,
  transactionDetailsData
} from '../test-data/lcIssuance.data';

type FormStep = 'transaction' | 'lc-details' | 'bank-charges' | 'review';

type FieldCase = {
  name: string;
  step: FormStep;
  locator: (page: Page) => Locator;
};

const transactionFields: FieldCase[] = [
  {
    name: 'Beneficiary',
    step: 'transaction',
    locator: (page) => page.getByText('Beneficiary Name*', { exact: true })
      .locator('xpath=following::input[@role="combobox"][1]')
  },
  { name: 'PO/Proforma Invoice Number', step: 'transaction', locator: (page) => page.locator('input[id="input-PO/Proforma-Invoice-No."]') },
  { name: 'PO/Proforma Invoice Date', step: 'transaction', locator: (page) => page.locator('input[id="input-PO/Proforma-Invoice-Date"]') },
  { name: 'Amount', step: 'transaction', locator: (page) => page.locator('input[inputmode="numeric"]').first() },
  { name: 'Currency', step: 'transaction', locator: (page) => page.getByRole('combobox', { name: 'Currency' }) },
  { name: 'Margin %', step: 'transaction', locator: (page) => page.locator('input[id="input-Margin-%"]') },
  { name: 'Debit Account Number', step: 'transaction', locator: (page) => page.getByRole('combobox', { name: 'Debit Account Number' }) },
  { name: 'FD Maturity Date', step: 'transaction', locator: (page) => page.locator('#input-Maturity-Date') },
  { name: 'Confirmation of Credit (49)', step: 'transaction', locator: (page) => page.getByRole('combobox', { name: 'Confirmation of Credit (49)' }) },
  { name: 'Confirming Bank (SBA)', step: 'transaction', locator: (page) => page.getByRole('combobox', { name: 'Confirming Bank (SBA)' }) },
  {
    name: 'Confirming Bank Branch',
    step: 'transaction',
    locator: (page) => page.getByText('Confirming Bank Branch*', { exact: true })
      .locator('xpath=following::input[@role="combobox"][1]')
  }
];

const lcDetailsFields: FieldCase[] = [
  { name: 'LC Type', step: 'lc-details', locator: (page) => page.getByRole('combobox', { name: 'LC Type', exact: true }) },
  { name: 'Purpose', step: 'lc-details', locator: (page) => page.getByRole('combobox', { name: 'Purpose', exact: true }) },
  { name: 'Trade Type', step: 'lc-details', locator: (page) => page.getByRole('combobox', { name: 'Trade Type', exact: true }) },
  { name: 'Date of Expiry', step: 'lc-details', locator: (page) => page.locator('#input-Date-of-Expiry') },
  { name: 'Place of Expiry', step: 'lc-details', locator: (page) => page.locator('#input-Place-of-Expiry') },
  { name: 'Request Date', step: 'lc-details', locator: (page) => page.locator('#input-Request-Date') },
  { name: 'UCP Version', step: 'lc-details', locator: (page) => page.getByRole('combobox', { name: 'UCP Version', exact: true }) },
  { name: 'HSN Code', step: 'lc-details', locator: (page) => page.locator('table').filter({ hasText: 'HSN Code' }).locator('tbody tr').first().getByRole('combobox').first() },
  { name: 'Quantity', step: 'lc-details', locator: (page) => page.locator('table').filter({ hasText: 'HSN Code' }).locator('tbody tr').first().locator('td').nth(3).locator('input') },
  { name: 'Tolerance Selection', step: 'lc-details', locator: (page) => page.locator('table').filter({ hasText: 'HSN Code' }).locator('tbody tr').first().locator('td').nth(4).getByRole('combobox') },
  { name: 'Tolerance Value (first part)', step: 'lc-details', locator: (page) => page.locator('table').filter({ hasText: 'HSN Code' }).locator('tbody tr').first().locator('td').nth(5).locator('input').first() },
  { name: 'Tolerance Value (second part)', step: 'lc-details', locator: (page) => page.locator('table').filter({ hasText: 'HSN Code' }).locator('tbody tr').first().locator('td').nth(5).locator('input').nth(1) },
  { name: 'Product Amount', step: 'lc-details', locator: (page) => page.locator('table').filter({ hasText: 'HSN Code' }).locator('tbody tr').first().locator('td').nth(7).locator('input') },
  { name: 'Description of Goods and/or Services (45A)', step: 'lc-details', locator: (page) => page.getByLabel('Description of Goods and/or Services (45A)', { exact: true }) },
  { name: 'INCO Term Version', step: 'lc-details', locator: (page) => page.getByRole('combobox', { name: 'INCO Term Version', exact: true }) },
  { name: 'INCO Term', step: 'lc-details', locator: (page) => page.getByRole('combobox', { name: 'INCO Term', exact: true }) },
  { name: 'INCO Place', step: 'lc-details', locator: (page) => page.locator('#input-Place') },
  { name: 'Partial Shipment Option (43P)', step: 'lc-details', locator: (page) => page.getByRole('combobox', { name: 'Partial Shipment Option (43P)', exact: true }) },
  { name: 'Transshipment Option (43T)', step: 'lc-details', locator: (page) => page.getByRole('combobox', { name: 'Transshipment Option (43T)', exact: true }) },
  { name: 'Place of Receipt (44A)', step: 'lc-details', locator: (page) => page.locator('#input-Place-Of-Receipt-(44A)') },
  { name: 'Latest Shipment Date (44C)', step: 'lc-details', locator: (page) => page.locator('#input-Latest-Shipment-Date-(44C)') },
  { name: 'Port of Loading (44E)', step: 'lc-details', locator: (page) => page.locator('#input-Port-Of-Loading/Airport-Of-Departure-(44E)') },
  { name: 'Port of Discharge (44F)', step: 'lc-details', locator: (page) => page.locator('#input-Port-Of-Discharge/Airport-Of-Destination-(44F)') },
  { name: 'Final Destination (44B)', step: 'lc-details', locator: (page) => page.locator('#input-Place-Of-Final-Destination-(44B)') },
  { name: 'Shipment Period (44D)', step: 'lc-details', locator: (page) => page.locator('#input-Shipment-Period-(44D)') },
  { name: 'Document Type', step: 'lc-details', locator: (page) => page.getByRole('combobox', { name: 'Document Type', exact: true }) },
  { name: 'Document Description', step: 'lc-details', locator: (page) => page.getByLabel('Tracked Text Area', { exact: true }).last() },
  { name: 'Document Presentation Days (48)', step: 'lc-details', locator: (page) => page.getByText('Document To be presented within (Days) (48)', { exact: true }).locator('xpath=..').locator('input').first() },
  { name: 'Document Presentation Event', step: 'lc-details', locator: (page) => page.getByText('Document To be presented within (Days) (48)', { exact: true }).locator('xpath=..').getByRole('combobox') },
  { name: 'Reason for Delay', step: 'lc-details', locator: (page) => page.locator('#input-Reason-for-Delay') },
  { name: 'Credit Available With (41A)', step: 'lc-details', locator: (page) => page.getByRole('combobox', { name: 'Credit Available With (41A)', exact: true }) },
  { name: 'Credit Available By (41A)', step: 'lc-details', locator: (page) => page.getByRole('combobox', { name: 'Credit Available By (41A)', exact: true }) },
  { name: 'Drafts At (42C)', step: 'lc-details', locator: (page) => page.getByRole('combobox', { name: 'Drafts At (42C)', exact: true }) },
  { name: 'Payment Against', step: 'lc-details', locator: (page) => page.getByText('Payment Against', { exact: true }).locator('xpath=following::input[@role="combobox"][1]') },
  { name: 'Tenor Days', step: 'lc-details', locator: (page) => page.getByText('Payment Against', { exact: true }).locator('xpath=following::input[not(@role="combobox")][1]') },
  { name: 'Payment From', step: 'lc-details', locator: (page) => page.getByText('Payment Against', { exact: true }).locator('xpath=following::input[@role="combobox"][2]') },
  { name: 'Payment Amount', step: 'lc-details', locator: (page) => page.getByText('Payment Against', { exact: true }).locator('xpath=following::input[not(@role="combobox")][2]') },
  { name: 'Charge Type', step: 'lc-details', locator: (page) => page.getByText('Charge Type *', { exact: true }).locator('xpath=following::input[@role="combobox"][1]') },
  { name: 'Charge Additional Text', step: 'lc-details', locator: (page) => page.getByText('Charge Type *', { exact: true }).locator('xpath=following::input[@type="text"][1]') },
  { name: 'Additional Conditions (47A)', step: 'lc-details', locator: (page) => page.getByLabel('Additional Conditions (47A)', { exact: true }) },
  { name: 'Instructions to the Paying/Accepting/Negotiating Bank (78)', step: 'lc-details', locator: (page) => page.getByLabel('Instructions to the Paying/Accepting/Negotiating Bank (78)', { exact: true }) }
];

const bankChargeFields: FieldCase[] = [
  {
    name: 'GST Exempted',
    step: 'bank-charges',
    locator: (page) => page.getByText('GST Exempted', { exact: true })
      .locator('xpath=following::input[@role="combobox"][1]')
  }
];

const fieldCases = [...transactionFields, ...lcDetailsFields, ...bankChargeFields];

async function openIssuance(page: Page): Promise<TransactionDetailsPage> {
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login({
    email: requiredCredential('ISSUANCE_CORPORATE_MAKER_EMAIL'),
    password: requiredCredential('ISSUANCE_CORPORATE_MAKER_PASSWORD')
  });

  const dashboard = new CorporateDashboardPage(page);
  await dashboard.expectLoaded();
  await dashboard.openCreateNewRequest();
  await dashboard.selectLetterOfCredit();
  await dashboard.startFreshLcIssuance();

  const transactionDetails = new TransactionDetailsPage(page);
  await transactionDetails.expectLoaded();
  return transactionDetails;
}

async function prepareFieldStep(page: Page, step: FormStep): Promise<void> {
  const transactionDetails = await openIssuance(page);
  await transactionDetails.fillMandatoryFields(transactionDetailsData);
  await transactionDetails.selectCollateralBacked(collateralBackedData);
  await transactionDetails.configureBankConfirmation(specialLcConditionsData);
  if (step === 'transaction') {
    return;
  }

  await transactionDetails.goToLcDetails();

  const lcDetails = new LcDetailsPage(page);
  await lcDetails.expectLoaded();
  await lcDetails.fillGoodsAndDocuments(lcDetailsData);
  await lcDetails.fillPaymentDetails(lcDetailsData);
  await lcDetails.fillAdditionalConditions(lcDetailsData);
  if (step === 'lc-details') return;

  await lcDetails.clickNext();
  const bankCharges = new BankChargesPage(page);
  await bankCharges.selectGstExempted('No');
  if (step === 'bank-charges') return;

  await bankCharges.clickNext();
  const attachments = new AttachmentsPage(page);
  await attachments.expectLoaded();
  await attachments.clickNext();
  const review = new ReviewPage(page);
  await review.acceptDeclarations();
  await review.selectBillPurchaseDuringPayment();
  await review.selectWorkflow('1M1c');
}

function nextButtonForStep(page: Page): Locator {
  return page.getByRole('button', { name: 'Next', exact: true });
}

async function expectFieldValidation(page: Page, field: Locator): Promise<void> {
  await expect.poll(async () => field.evaluate((element) => {
    const control = element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    return !control.validity.valid || control.getAttribute('aria-invalid') === 'true';
  }), { message: 'Expected required-field validation on the cleared field.' }).toBe(true);
}

async function readToggleState(toggle: Locator): Promise<boolean> {
  return toggle.evaluate((element) => {
    let current: HTMLElement | null = element as HTMLElement;
    for (let depth = 0; current && depth < 6; depth += 1, current = current.parentElement) {
      const control = current.matches('[role="checkbox"], [role="switch"], [role="radio"], [aria-pressed], input[type="checkbox"], input[type="radio"]')
        ? current
        : current.querySelector<HTMLElement>('[role="checkbox"], [role="switch"], [role="radio"], [aria-pressed], input[type="checkbox"], input[type="radio"]');
      if (!control) continue;

      const ariaChecked = control.getAttribute('aria-checked');
      if (ariaChecked !== null) return ariaChecked === 'true';
      const ariaPressed = control.getAttribute('aria-pressed');
      if (ariaPressed !== null) return ariaPressed === 'true';
      const dataState = control.getAttribute('data-state');
      if (dataState !== null) return dataState === 'checked' || dataState === 'on';
      if (control instanceof HTMLInputElement && (control.type === 'checkbox' || control.type === 'radio')) {
        return control.checked;
      }
    }
    throw new Error('Could not determine the selected state of this control.');
  });
}

async function setToggleState(toggle: Locator, selected: boolean): Promise<void> {
  await expect(toggle).toBeVisible();
  if (await readToggleState(toggle) !== selected) await toggle.click();
  await expect.poll(() => readToggleState(toggle)).toBe(selected);
}

type ToggleCase = {
  name: string;
  step: FormStep;
  locator: (page: Page) => Locator;
};

const toggleCases: ToggleCase[] = [
  { name: 'Applicant charge allocation', step: 'lc-details', locator: (page) => page.getByText('Applicant', { exact: true }) },
  { name: 'Beneficiary charge allocation', step: 'lc-details', locator: (page) => page.getByText('Beneficiary', { exact: true }) },
  {
    name: 'Declarations and Undertakings',
    step: 'review',
    locator: (page) => page.getByText(/I have read and I accept all the\s*Declarations and Undertakings/i).first()
  },
  {
    name: 'Request for Bill Purchase during payment',
    step: 'review',
    locator: (page) => page.getByRole('switch', { name: /Request for Bill Purchase during payment/i })
  }
];

const workflowField: ToggleCase = {
  name: 'Workflow',
  step: 'review',
  locator: (page) => page.getByRole('combobox', { name: 'Workflow', exact: true })
};

type CredentialName = Parameters<typeof requiredCredential>[0];
type ReviewFieldValue = { name: string; label?: string; value: string };

const makerReviewFieldValues: ReviewFieldValue[] = [
  { name: 'Beneficiary', label: 'Beneficiary Name', value: transactionDetailsData.beneficiarySearchValue },
  { name: 'PO/Proforma Invoice Number', label: 'PO/Proforma Invoice No.', value: transactionDetailsData.proformaInvoiceNumber },
  { name: 'PO/Proforma Invoice Date', value: transactionDetailsData.proformaInvoiceDate },
  { name: 'Transaction Amount', value: transactionDetailsData.amount },
  { name: 'Transaction Currency', value: transactionDetailsData.currency },
  { name: 'Margin %', value: collateralBackedData.marginPercent },
  { name: 'Debit Account Number', value: collateralBackedData.debitAccountNumber },
  ...(collateralBackedData.fdAmount ? [{ name: 'FD Amount', value: collateralBackedData.fdAmount }] : []),
  { name: 'FD Maturity Date', value: collateralBackedData.fdMaturityDate },
  { name: 'Confirmation of Credit (49)', value: specialLcConditionsData.confirmationOfCredit },
  { name: 'Confirming Bank', value: specialLcConditionsData.confirmingBank },
  { name: 'Confirming Bank Branch', value: specialLcConditionsData.confirmingBankBranch },
  { name: 'LC Type', value: lcDetailsData.lcType },
  { name: 'Purpose', value: lcDetailsData.purpose },
  { name: 'Trade Type', value: lcDetailsData.tradeType },
  { name: 'Date of Expiry', value: lcDetailsData.expiryDate },
  { name: 'Place of Expiry', value: lcDetailsData.expiryPlace },
  { name: 'Request Date', value: lcDetailsData.requestDate },
  { name: 'UCP Version', value: lcDetailsData.ucpVersion },
  { name: 'HSN Code', value: lcDetailsData.product.hsnCode },
  { name: 'Quantity', value: lcDetailsData.product.quantity },
  { name: 'Tolerance Selection', value: lcDetailsData.product.toleranceSelection },
  ...lcDetailsData.product.toleranceValue.split('/').map((value, index) => ({
    name: `Tolerance Value ${index + 1}`,
    value
  })),
  { name: 'Product Currency', value: lcDetailsData.product.currency },
  { name: 'Product Amount', value: lcDetailsData.product.amount },
  { name: 'Goods and Services Description (45A)', label: 'Description of Goods and/or Services (45A)', value: lcDetailsData.goodsDescription },
  { name: 'INCO Term Version', value: lcDetailsData.incoTermVersion },
  { name: 'INCO Term', value: lcDetailsData.incoTerm },
  { name: 'INCO Place', value: lcDetailsData.incoPlace },
  { name: 'Partial Shipment Option (43P)', value: lcDetailsData.partialShipment },
  { name: 'Transshipment Option (43T)', value: lcDetailsData.transshipment },
  { name: 'Place of Receipt (44A)', value: lcDetailsData.placeOfReceipt },
  { name: 'Latest Shipment Date (44C)', value: lcDetailsData.latestShipmentDate },
  { name: 'Port of Loading (44E)', value: lcDetailsData.portOfLoading },
  { name: 'Port of Discharge (44F)', value: lcDetailsData.portOfDischarge },
  { name: 'Final Destination (44B)', value: lcDetailsData.finalDestination },
  { name: 'Shipment Period (44D)', value: lcDetailsData.shipmentPeriod },
  { name: 'Document Type', value: lcDetailsData.documentType },
  { name: 'Document Description', value: lcDetailsData.documentDescription },
  { name: 'Document Presentation Days (48)', label: 'Document To be presented within (Days) (48)', value: lcDetailsData.documentDays },
  { name: 'Document Presentation Event', label: 'Document To be presented within (Days) (48)', value: lcDetailsData.documentDaysFrom },
  { name: 'Reason for Delay', value: lcDetailsData.reasonForDelay },
  { name: 'Credit Available With (41A)', value: lcDetailsData.creditAvailableWith },
  { name: 'Credit Available By (41A)', value: lcDetailsData.creditAvailableBy },
  { name: 'Drafts At (42C)', value: lcDetailsData.draftsAt },
  { name: 'Payment Against', value: lcDetailsData.paymentAgainst },
  { name: 'Tenor Days', value: lcDetailsData.tenorDays },
  { name: 'Payment From', value: lcDetailsData.paymentFrom },
  { name: 'Payment Currency', value: lcDetailsData.paymentCurrency },
  { name: 'Payment Amount', value: lcDetailsData.paymentAmount },
  { name: 'Charge Type', value: lcDetailsData.chargeType },
  { name: 'Charge Additional Text', value: lcDetailsData.chargeAdditionalText },
  { name: 'Additional Conditions (47A)', value: lcDetailsData.additionalConditions },
  { name: 'Bank Instructions (78)', value: lcDetailsData.bankInstructions },
  { name: 'GST Exempted', value: 'NO' }
];

function normalizeReviewText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function assertReviewFields(page: Page, party: string): Promise<void> {
  const normalizedReview = normalizeReviewText(await page.locator('body').innerText());
  for (const field of makerReviewFieldValues) {
    await test.step(`${party} review reflects ${field.name}`, async () => {
      const normalizedLabel = normalizeReviewText(field.label ?? field.name);
      expect(
        normalizedReview,
        `${party} review should show the "${field.label ?? field.name}" field label`
      ).toContain(normalizedLabel);
      expect(
        normalizedReview,
        `${party} review should show the maker's ${field.name} value "${field.value}"`
      ).toContain(normalizeReviewText(field.value));
    });
  }
}

async function assertReviewField(page: Page, party: string, field: ReviewFieldValue): Promise<void> {
  const reviewText = normalizeReviewText(await page.locator('body').innerText());
  const label = field.label ?? field.name;
  expect(
    reviewText,
    `${party} review should show the "${label}" field label`
  ).toContain(normalizeReviewText(label));
  expect(
    reviewText,
    `${party} review should reflect the maker's ${field.name} value "${field.value}"`
  ).toContain(normalizeReviewText(field.value));
}

type ReviewParty = {
  name: string;
  baseURL: string;
  emailSecret: CredentialName;
  passwordSecret: CredentialName;
  referenceEnvironment: CredentialName;
  openReview: (page: Page, reference: string) => Promise<void>;
};

const reviewParties: ReviewParty[] = [
  {
    name: 'Buyer checker',
    baseURL: 'https://itn-uat.ibdic.in',
    emailSecret: 'ISSUANCE_CORPORATE_CHECKER_EMAIL',
    passwordSecret: 'ISSUANCE_CORPORATE_CHECKER_PASSWORD',
    referenceEnvironment: 'REGRESSION_BUYER_CHECKER_LC_REFERENCE',
    openReview: async (page, reference) => {
      const dashboard = new CorporateDashboardPage(page);
      await dashboard.expectLoaded();
      await dashboard.openLetterOfCreditInquiry();
      const lcDashboard = new LcDashboardPage(page);
      await lcDashboard.selectIssuanceTab();
      await lcDashboard.openReviewFromSearch(reference);
    }
  },
  {
    name: 'Buyer bank checker',
    baseURL: 'https://itn-uat-hdfc.ibdic.in',
    emailSecret: 'ISSUANCE_BANK_CHECKER_EMAIL',
    passwordSecret: 'ISSUANCE_BANK_CHECKER_PASSWORD',
    referenceEnvironment: 'REGRESSION_BUYER_BANK_CHECKER_LC_REFERENCE',
    openReview: async (page, reference) => {
      await new BankDashboardPage(page).expectLoaded();
      await new BankDashboardPage(page).openReview(reference);
    }
  },
  {
    name: 'Buyer bank inputter',
    baseURL: 'https://itn-uat-hdfc.ibdic.in',
    emailSecret: 'ISSUANCE_BANK_INPUTTER_EMAIL',
    passwordSecret: 'ISSUANCE_BANK_INPUTTER_PASSWORD',
    referenceEnvironment: 'REGRESSION_BUYER_BANK_INPUTTER_LC_REFERENCE',
    openReview: async (page, reference) => {
      const dashboard = new BankDashboardPage(page);
      await dashboard.expectLoaded();
      await dashboard.openEdit(reference);
      const inputter = new BankInputterPage(page);
      await inputter.proceedThroughTransactionDetails();
      await inputter.proceedThroughLcDetails();
      await inputter.proceedThroughBankCharges();
      await inputter.proceedThroughAttachments();
      await inputter.proceedThroughReview();
    }
  },
  {
    name: 'Buyer bank authoriser',
    baseURL: 'https://itn-uat-hdfc.ibdic.in',
    emailSecret: 'ISSUANCE_BANK_AUTHORISER_EMAIL',
    passwordSecret: 'ISSUANCE_BANK_AUTHORISER_PASSWORD',
    referenceEnvironment: 'REGRESSION_BUYER_BANK_AUTHORISER_LC_REFERENCE',
    openReview: async (page, reference) => {
      await new BankDashboardPage(page).expectLoaded();
      await new BankDashboardPage(page).openReview(reference);
    }
  },
  {
    name: 'Seller bank checker',
    baseURL: 'https://itn-uat-hdfc.ibdic.in',
    emailSecret: 'ADVISING_BANK_CHECKER_EMAIL',
    passwordSecret: 'ADVISING_BANK_CHECKER_PASSWORD',
    referenceEnvironment: 'REGRESSION_SELLER_BANK_CHECKER_LC_REFERENCE',
    openReview: async (page, reference) => {
      const dashboard = new BankDashboardPage(page);
      await dashboard.expectLoaded();
      await dashboard.selectLcAdvisingTab();
      await dashboard.openReview(reference);
    }
  },
  {
    name: 'Seller bank inputter',
    baseURL: 'https://itn-uat-hdfc.ibdic.in',
    emailSecret: 'ADVISING_BANK_INPUTTER_EMAIL',
    passwordSecret: 'ADVISING_BANK_INPUTTER_PASSWORD',
    referenceEnvironment: 'REGRESSION_SELLER_BANK_INPUTTER_LC_REFERENCE',
    openReview: async (page, reference) => {
      const dashboard = new BankDashboardPage(page);
      await dashboard.expectLoaded();
      await dashboard.selectLcAdvisingTab();
      await dashboard.openEdit(reference);
      const inputter = new BankInputterPage(page);
      await inputter.proceedThroughTransactionDetails();
      await inputter.proceedThroughLcDetails();
      await inputter.proceedThroughBankCharges();
      await inputter.proceedThroughAttachments();
      await inputter.proceedThroughReview();
    }
  },
  {
    name: 'Seller bank authoriser',
    baseURL: 'https://itn-uat-hdfc.ibdic.in',
    emailSecret: 'ADVISING_BANK_AUTHORISER_EMAIL',
    passwordSecret: 'ADVISING_BANK_AUTHORISER_PASSWORD',
    referenceEnvironment: 'REGRESSION_SELLER_BANK_AUTHORISER_LC_REFERENCE',
    openReview: async (page, reference) => {
      const dashboard = new BankDashboardPage(page);
      await dashboard.expectLoaded();
      await dashboard.selectLcAdvisingTab();
      await dashboard.openReview(reference);
    }
  },
  {
    name: 'Seller maker',
    baseURL: 'https://itn-uat.ibdic.in',
    emailSecret: 'CORPORATE_SELLER_MAKER_EMAIL',
    passwordSecret: 'CORPORATE_SELLER_MAKER_PASSWORD',
    referenceEnvironment: 'REGRESSION_SELLER_MAKER_LC_REFERENCE',
    openReview: async (page, reference) => {
      const dashboard = new CorporateDashboardPage(page);
      await dashboard.expectLoaded();
      await dashboard.openAdvisingInquiry();
      const acceptance = new CorporateAcceptancePage(page);
      await acceptance.expectLoaded();
      await acceptance.selectAdvisedLcs();
      await acceptance.selectInReview();
      await acceptance.search(reference);
      await acceptance.clickAction(reference, /Accept/i);
    }
  },
  {
    name: 'Seller checker',
    baseURL: 'https://itn-uat.ibdic.in',
    emailSecret: 'CORPORATE_SELLER_CHECKER_EMAIL',
    passwordSecret: 'CORPORATE_SELLER_CHECKER_PASSWORD',
    referenceEnvironment: 'REGRESSION_SELLER_CHECKER_LC_REFERENCE',
    openReview: async (page, reference) => {
      const dashboard = new CorporateDashboardPage(page);
      await dashboard.expectLoaded();
      await dashboard.openAdvisingInquiry();
      const acceptance = new CorporateAcceptancePage(page);
      await acceptance.expectLoaded();
      await acceptance.selectAdvisedLcs();
      await acceptance.selectInReview();
      await acceptance.search(reference);
      await acceptance.clickAction(reference, /Approve/i);
    }
  }
];

function requiredReference(name: CredentialName): string {
  return requiredCredential(name);
}

async function openRoleSession(
  browser: Browser,
  contexts: BrowserContext[],
  baseURL: string,
  emailSecret: CredentialName,
  passwordSecret: CredentialName
): Promise<Page> {
  const context = await browser.newContext({ baseURL });
  contexts.push(context);
  const page = await context.newPage();
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login({
    email: requiredCredential(emailSecret),
    password: requiredCredential(passwordSecret)
  });
  return page;
}

function uniqueReference(): string {
  return `A${crypto.randomUUID().replace(/-/g, '').slice(0, 5).toUpperCase()}`;
}

test.describe('Corporate buyer maker field regression', () => {
  for (const fieldCase of fieldCases) {
    test(`${fieldCase.name} - positive: visible and accepts the configured value`, async ({ page }) => {
      test.setTimeout(180_000);
      await prepareFieldStep(page, fieldCase.step);
      const field = fieldCase.locator(page);
      await expect(field, `${fieldCase.name} should be visible`).toBeVisible();
      await expect(field, `${fieldCase.name} should contain its configured value`).not.toHaveValue('');
    });

    test(`${fieldCase.name} - negative: required validation is shown when empty`, async ({ page }) => {
      test.setTimeout(180_000);
      await prepareFieldStep(page, fieldCase.step);
      const field = fieldCase.locator(page);
      await expect(field, `${fieldCase.name} should be visible`).toBeVisible();
      await field.fill('');
      await nextButtonForStep(page).click();
      await expect(field, `${fieldCase.name} should remain visible after invalid submission`).toBeVisible();
      await expectFieldValidation(page, field);
    });
  }

  for (const toggleCase of toggleCases) {
    test(`${toggleCase.name} - positive: can be selected`, async ({ page }) => {
      test.setTimeout(180_000);
      await prepareFieldStep(page, toggleCase.step);
      await setToggleState(toggleCase.locator(page), true);
    });

    test(`${toggleCase.name} - negative: can be cleared without submitting the LC`, async ({ page }) => {
      test.setTimeout(180_000);
      await prepareFieldStep(page, toggleCase.step);
      await setToggleState(toggleCase.locator(page), false);
    });
  }

  test('Workflow - positive: configured option is visible and selected', async ({ page }) => {
    test.setTimeout(180_000);
    await prepareFieldStep(page, workflowField.step);
    const workflow = workflowField.locator(page);
    await expect(workflow).toBeVisible();
    await expect(workflow).not.toHaveValue('');
  });

  test('Workflow - negative: selection can be cleared without submitting the LC', async ({ page }) => {
    test.setTimeout(180_000);
    await prepareFieldStep(page, workflowField.step);
    const workflow = workflowField.locator(page);
    await expect(workflow).toBeVisible();
    await workflow.fill('');
    await expect(workflow).toHaveValue('');
    await expect(workflow).toBeVisible();
  });

  test('Maker review fields are reflected through every buyer and seller workflow party', async ({ page }) => {
    test.setTimeout(900_000);
    const browser = page.context().browser();
    if (!browser) throw new Error('A browser instance is required for the multi-party review regression.');
    const contexts: BrowserContext[] = [];

    try {
      const loginPage = new LoginPage(page);
      await loginPage.open();
      await loginPage.login({
        email: requiredCredential('ISSUANCE_CORPORATE_MAKER_EMAIL'),
        password: requiredCredential('ISSUANCE_CORPORATE_MAKER_PASSWORD')
      });

      const makerDashboard = new CorporateDashboardPage(page);
      await makerDashboard.expectLoaded();
      await makerDashboard.openCreateNewRequest();
      await makerDashboard.selectLetterOfCredit();
      await makerDashboard.startFreshLcIssuance();

      const transactionDetails = new TransactionDetailsPage(page);
      await transactionDetails.expectLoaded();
      await transactionDetails.fillMandatoryFields(transactionDetailsData);
      await transactionDetails.selectCollateralBacked(collateralBackedData);
      await transactionDetails.configureBankConfirmation(specialLcConditionsData);
      await transactionDetails.goToLcDetails();

      const lcDetails = new LcDetailsPage(page);
      await lcDetails.expectLoaded();
      await lcDetails.fillGoodsAndDocuments(lcDetailsData);
      await lcDetails.fillPaymentDetails(lcDetailsData);
      await lcDetails.fillAdditionalConditions(lcDetailsData);
      await lcDetails.clickNext();

      const bankCharges = new BankChargesPage(page);
      await bankCharges.selectGstExempted('No');
      await bankCharges.clickNext();
      const attachments = new AttachmentsPage(page);
      await attachments.expectLoaded();
      await attachments.clickNext();

      const makerReview = new ReviewPage(page);
      await assertReviewFields(page, 'Buyer maker');
      await makerReview.acceptDeclarations();
      await makerReview.selectBillPurchaseDuringPayment();
      await makerReview.selectWorkflow('1M1c');
      await makerReview.submit();
      await makerReview.confirm();
      const lcReferenceNumber = await makerReview.getLcReferenceNumber();
      await makerReview.backToDashboard();

      const buyerCheckerPage = await openRoleSession(
        browser, contexts, 'https://itn-uat.ibdic.in',
        'ISSUANCE_CORPORATE_CHECKER_EMAIL', 'ISSUANCE_CORPORATE_CHECKER_PASSWORD'
      );
      const buyerCheckerDashboard = new CorporateDashboardPage(buyerCheckerPage);
      await buyerCheckerDashboard.expectLoaded();
      await buyerCheckerDashboard.openLetterOfCreditInquiry();
      const buyerCheckerLcDashboard = new LcDashboardPage(buyerCheckerPage);
      await buyerCheckerLcDashboard.selectIssuanceTab();
      await buyerCheckerLcDashboard.openReviewFromSearch(lcReferenceNumber);
      await assertReviewFields(buyerCheckerPage, 'Buyer checker');
      const buyerCheckerReview = new ReviewPage(buyerCheckerPage);
      await buyerCheckerReview.approve();
      await buyerCheckerReview.confirm();
      await buyerCheckerReview.backToDashboard();

      const buyerBankCheckerPage = await openRoleSession(
        browser, contexts, 'https://itn-uat-hdfc.ibdic.in',
        'ISSUANCE_BANK_CHECKER_EMAIL', 'ISSUANCE_BANK_CHECKER_PASSWORD'
      );
      const buyerBankCheckerDashboard = new BankDashboardPage(buyerBankCheckerPage);
      await buyerBankCheckerDashboard.expectLoaded();
      await buyerBankCheckerDashboard.openReview(lcReferenceNumber);
      await assertReviewFields(buyerBankCheckerPage, 'Buyer bank checker');
      const buyerBankCheckerReview = new ReviewPage(buyerBankCheckerPage);
      await buyerBankCheckerReview.approve();
      await buyerBankCheckerReview.confirm();
      await buyerBankCheckerReview.backToDashboard();

      const buyerBankInputterPage = await openRoleSession(
        browser, contexts, 'https://itn-uat-hdfc.ibdic.in',
        'ISSUANCE_BANK_INPUTTER_EMAIL', 'ISSUANCE_BANK_INPUTTER_PASSWORD'
      );
      const buyerBankInputterDashboard = new BankDashboardPage(buyerBankInputterPage);
      await buyerBankInputterDashboard.expectLoaded();
      await buyerBankInputterDashboard.openEdit(lcReferenceNumber);
      const buyerBankInputter = new BankInputterPage(buyerBankInputterPage);
      await buyerBankInputter.proceedThroughTransactionDetails();
      await buyerBankInputter.proceedThroughLcDetails();
      await buyerBankInputter.proceedThroughBankCharges();
      await buyerBankInputter.proceedThroughAttachments();
      await buyerBankInputter.proceedThroughReview();
      await assertReviewFields(buyerBankInputterPage, 'Buyer bank inputter');
      const buyerBankReference = uniqueReference();
      await buyerBankInputter.enterBuyerBankTransactionReference(buyerBankReference);
      await buyerBankInputter.proceed();
      const buyerBankInputterReview = new ReviewPage(buyerBankInputterPage);
      await buyerBankInputterReview.confirm();
      await buyerBankInputterReview.backToDashboard();

      const buyerBankAuthoriserPage = await openRoleSession(
        browser, contexts, 'https://itn-uat-hdfc.ibdic.in',
        'ISSUANCE_BANK_AUTHORISER_EMAIL', 'ISSUANCE_BANK_AUTHORISER_PASSWORD'
      );
      const buyerBankAuthoriserDashboard = new BankDashboardPage(buyerBankAuthoriserPage);
      await buyerBankAuthoriserDashboard.expectLoaded();
      await buyerBankAuthoriserDashboard.openReview(lcReferenceNumber);
      await assertReviewFields(buyerBankAuthoriserPage, 'Buyer bank authoriser');
      const buyerBankAuthoriserReview = new ReviewPage(buyerBankAuthoriserPage);
      await buyerBankAuthoriserReview.accept();
      await new BankAuthoriserPage(buyerBankAuthoriserPage)
        .enterReverifyBuyerCorebankingReference(buyerBankReference);
      await buyerBankAuthoriserReview.confirm();
      await buyerBankAuthoriserReview.confirm();
      await buyerBankAuthoriserReview.backToDashboard();

      const sellerBankCheckerPage = await openRoleSession(
        browser, contexts, 'https://itn-uat-hdfc.ibdic.in',
        'ADVISING_BANK_CHECKER_EMAIL', 'ADVISING_BANK_CHECKER_PASSWORD'
      );
      const sellerBankCheckerDashboard = new BankDashboardPage(sellerBankCheckerPage);
      await sellerBankCheckerDashboard.expectLoaded();
      await sellerBankCheckerDashboard.selectLcAdvisingTab();
      await sellerBankCheckerDashboard.openReview(lcReferenceNumber);
      await assertReviewFields(sellerBankCheckerPage, 'Seller bank checker');
      const sellerBankCheckerReview = new ReviewPage(sellerBankCheckerPage);
      await sellerBankCheckerReview.approve();
      await sellerBankCheckerReview.confirm();
      await sellerBankCheckerReview.backToDashboard();

      const sellerBankInputterPage = await openRoleSession(
        browser, contexts, 'https://itn-uat-hdfc.ibdic.in',
        'ADVISING_BANK_INPUTTER_EMAIL', 'ADVISING_BANK_INPUTTER_PASSWORD'
      );
      const sellerBankInputterDashboard = new BankDashboardPage(sellerBankInputterPage);
      await sellerBankInputterDashboard.expectLoaded();
      await sellerBankInputterDashboard.selectLcAdvisingTab();
      await sellerBankInputterDashboard.openEdit(lcReferenceNumber);
      const sellerBankInputter = new BankInputterPage(sellerBankInputterPage);
      await sellerBankInputter.proceedThroughTransactionDetails();
      await sellerBankInputter.proceedThroughLcDetails();
      await sellerBankInputter.proceedThroughBankCharges();
      await sellerBankInputter.fillBankChargeAccount(
        String(Math.floor(10_000_000 + Math.random() * 90_000_000)),
        crypto.randomUUID().replace(/-/g, '').slice(0, 14).toUpperCase()
      );
      await new BankChargesPage(sellerBankInputterPage).selectGstExempted('No');
      await sellerBankInputter.selectChargesAlreadyPaid();
      await sellerBankInputter.proceedThroughAttachments();
      await sellerBankInputter.proceedThroughReview();
      await assertReviewFields(sellerBankInputterPage, 'Seller bank inputter');
      const sellerBankReference = uniqueReference();
      await sellerBankInputter.enterSellerBankTransactionReference(sellerBankReference);
      await sellerBankInputter.proceed();
      const sellerBankInputterReview = new ReviewPage(sellerBankInputterPage);
      await sellerBankInputterReview.confirm();
      await sellerBankInputterReview.backToDashboard();

      const sellerBankAuthoriserPage = await openRoleSession(
        browser, contexts, 'https://itn-uat-hdfc.ibdic.in',
        'ADVISING_BANK_AUTHORISER_EMAIL', 'ADVISING_BANK_AUTHORISER_PASSWORD'
      );
      const sellerBankAuthoriserDashboard = new BankDashboardPage(sellerBankAuthoriserPage);
      await sellerBankAuthoriserDashboard.expectLoaded();
      await sellerBankAuthoriserDashboard.selectLcAdvisingTab();
      await sellerBankAuthoriserDashboard.openReview(lcReferenceNumber);
      await assertReviewFields(sellerBankAuthoriserPage, 'Seller bank authoriser');
      const sellerBankAuthoriserReview = new ReviewPage(sellerBankAuthoriserPage);
      await sellerBankAuthoriserReview.accept();
      await new BankAuthoriserPage(sellerBankAuthoriserPage)
        .enterReverifyBuyerCorebankingReference(sellerBankReference);
      await sellerBankAuthoriserReview.confirm();
      await sellerBankAuthoriserReview.confirm();
      await sellerBankAuthoriserReview.backToDashboard();

      const sellerMakerPage = await openRoleSession(
        browser, contexts, 'https://itn-uat.ibdic.in',
        'CORPORATE_SELLER_MAKER_EMAIL', 'CORPORATE_SELLER_MAKER_PASSWORD'
      );
      const sellerMakerDashboard = new CorporateDashboardPage(sellerMakerPage);
      await sellerMakerDashboard.expectLoaded();
      await sellerMakerDashboard.openAdvisingInquiry();
      const sellerMakerAcceptance = new CorporateAcceptancePage(sellerMakerPage);
      await sellerMakerAcceptance.expectLoaded();
      await sellerMakerAcceptance.selectAdvisedLcs();
      await sellerMakerAcceptance.selectInReview();
      await sellerMakerAcceptance.search(lcReferenceNumber);
      await sellerMakerAcceptance.clickAction(lcReferenceNumber, /Accept/i);
      const sellerMakerReview = new ReviewPage(sellerMakerPage);
      await assertReviewFields(sellerMakerPage, 'Seller maker');
      await sellerMakerReview.selectRequestForwardedWorkflow('1M1C');
      await sellerMakerReview.accept();
      await sellerMakerReview.confirm();
      await sellerMakerReview.backToDashboard();

      const sellerCheckerPage = await openRoleSession(
        browser, contexts, 'https://itn-uat.ibdic.in',
        'CORPORATE_SELLER_CHECKER_EMAIL', 'CORPORATE_SELLER_CHECKER_PASSWORD'
      );
      const sellerCheckerDashboard = new CorporateDashboardPage(sellerCheckerPage);
      await sellerCheckerDashboard.expectLoaded();
      await sellerCheckerDashboard.openAdvisingInquiry();
      const sellerCheckerAcceptance = new CorporateAcceptancePage(sellerCheckerPage);
      await sellerCheckerAcceptance.expectLoaded();
      await sellerCheckerAcceptance.selectAdvisedLcs();
      await sellerCheckerAcceptance.selectInReview();
      await sellerCheckerAcceptance.search(lcReferenceNumber);
      await sellerCheckerAcceptance.clickAction(lcReferenceNumber, /Approve/i);
      await assertReviewFields(sellerCheckerPage, 'Seller checker');
      const sellerCheckerReview = new ReviewPage(sellerCheckerPage);
      await sellerCheckerReview.approve();
      await sellerCheckerReview.confirm();
      await sellerCheckerReview.backToDashboard();
    } finally {
      await Promise.all(contexts.map((context) => context.close()));
    }
  });
});

test.describe('Standalone review field propagation', () => {
  test.describe('Buyer maker review fields', () => {
    for (const field of makerReviewFieldValues) {
      test(`Buyer maker review reflects ${field.name}`, async ({ page }) => {
        test.setTimeout(180_000);
        await prepareFieldStep(page, 'review');
        await assertReviewField(page, 'Buyer maker', field);
      });
    }
  });

  for (const party of reviewParties) {
    test.describe(`${party.name} review fields`, () => {
      for (const field of makerReviewFieldValues) {
        test(`${party.name} review reflects ${field.name}`, async ({ browser }) => {
          test.setTimeout(180_000);
          const context = await browser.newContext({ baseURL: party.baseURL });
          try {
            const page = await context.newPage();
            const loginPage = new LoginPage(page);
            await loginPage.open();
            await loginPage.login({
              email: requiredCredential(party.emailSecret),
              password: requiredCredential(party.passwordSecret)
            });
            await party.openReview(page, requiredReference(party.referenceEnvironment));
            await assertReviewField(page, party.name, field);
          } finally {
            await context.close();
          }
        });
      }
    });
  }
});