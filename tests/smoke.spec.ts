import type { Browser, Page } from '@playwright/test';
import { BankAuthoriserPage } from '../pages/BankAuthoriserPage';
import { BankChargesPage } from '../pages/BankChargesPage';
import { BankDashboardPage } from '../pages/BankDashboardPage';
import { BankInputterPage } from '../pages/BankInputterPage';
import { CorporateAcceptancePage } from '../pages/CorporateAcceptancePage';
import { CorporateDashboardPage } from '../pages/CorporateDashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { LcDetailsPage } from '../pages/LcDetailsPage';
import { LcDashboardPage } from '../pages/LcDashboardPage';
import { ReviewPage } from '../pages/ReviewPage';
import { TransactionDetailsPage } from '../pages/TransactionDetailsPage';
import { AttachmentsPage } from '../pages/AttachmentsPage';
import { expect, requiredCredential, test } from './fixtures/multi-user.fixture';
import {
  collateralBackedData,
  lcDetailsData,
  specialLcConditionsData,
  transactionDetailsData
} from '../test-data/lcIssuance.data';

type CredentialName = Parameters<typeof requiredCredential>[0];

async function withRoleSession<T>(
  browser: Browser,
  baseURL: string,
  emailSecret: CredentialName,
  passwordSecret: CredentialName,
  action: (page: Page) => Promise<T>
): Promise<T> {
  const context = await browser.newContext({ baseURL });
  try {
    const page = await context.newPage();
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login({
      email: requiredCredential(emailSecret),
      password: requiredCredential(passwordSecret)
    });
    return await action(page);
  } finally {
    await context.close();
  }
}

function currentLcReference(): string {
  if (!lcReferenceNumber) {
    throw new Error('The buyer maker test must complete before downstream party tests.');
  }
  return lcReferenceNumber;
}

function uniqueReference(): string {
  return `A${crypto.randomUUID().replace(/-/g, '').slice(0, 5).toUpperCase()}`;
}

let lcReferenceNumber: string | undefined;
let buyerBankTransactionReference: string | undefined;
let sellerBankTransactionReference: string | undefined;

test.describe.serial('LC issuance smoke workflow by party', () => {
  test.only('01 - Buyer maker creates and submits a fresh LC', async ({ browser }) => {
    test.setTimeout(300_000);
    test.skip(
      !Object.values(collateralBackedData).every(Boolean),
      'Populate collateralBackedData with the selected account and FD details.'
    );
    test.skip(
      !Object.values(specialLcConditionsData).every(Boolean),
      'Populate specialLcConditionsData with the selected bank confirmation details.'
    );

    lcReferenceNumber = await withRoleSession(
      browser,
      'https://itn-uat.ibdic.in',
      'ISSUANCE_CORPORATE_MAKER_EMAIL',
      'ISSUANCE_CORPORATE_MAKER_PASSWORD',
      async (page) => {
        const dashboard = new CorporateDashboardPage(page);
        await dashboard.expectLoaded();
        await dashboard.openCreateNewRequest();
        await dashboard.selectLetterOfCredit();
        await dashboard.startFreshLcIssuance();

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

        await expect(page.getByText('Charge Account', { exact: true })).toBeVisible({ timeout: 30_000 });
        const bankCharges = new BankChargesPage(page);
        await bankCharges.selectGstExempted('No');
        await bankCharges.clickNext();

        const attachments = new AttachmentsPage(page);
        
        await attachments.expectLoaded();
        await attachments.uploadFile('C:/Users/HP/Desktop/IBDIC.JPG');
        await attachments.clickNext();

        const review = new ReviewPage(page);
        await review.expectLoaded();
        await review.acceptDeclarations();
        await review.selectBillPurchaseDuringPayment();
        await review.selectWorkflow('1M1c');
        await review.submit();
        await review.confirm();
        const reference = await review.getLcReferenceNumber();
        console.log(`Smoke workflow LC reference: ${reference}`);
        await review.backToDashboard();
        return reference;
      }
    );
  });

  test('02 - Buyer checker approves the maker-submitted LC', async ({ browser }) => {
    test.setTimeout(180_000);
    await withRoleSession(
      browser,
      'https://itn-uat.ibdic.in',
      'ISSUANCE_CORPORATE_CHECKER_EMAIL',
      'ISSUANCE_CORPORATE_CHECKER_PASSWORD',
      async (page) => {
        const dashboard = new CorporateDashboardPage(page);
        await dashboard.expectLoaded();
        await dashboard.openLetterOfCreditInquiry();
        const lcDashboard = new LcDashboardPage(page);
        await lcDashboard.selectIssuanceTab();
        await lcDashboard.openReviewFromSearch(currentLcReference());

        const review = new ReviewPage(page);
        await review.approve();
        await review.confirm();
        await review.backToDashboard();
      }
    );
  });

  test('03 - Buyer bank checker approves the LC', async ({ browser }) => {
    test.setTimeout(180_000);
    await withRoleSession(
      browser,
      'https://itn-uat-hdfc.ibdic.in',
      'ISSUANCE_BANK_CHECKER_EMAIL',
      'ISSUANCE_BANK_CHECKER_PASSWORD',
      async (page) => {
        const dashboard = new BankDashboardPage(page);
        await dashboard.expectLoaded();
        await dashboard.openReview(currentLcReference());

        const review = new ReviewPage(page);
        await review.approve();
        await review.confirm();
        await review.backToDashboard();
      }
    );
  });

  test('04 - Buyer bank inputter updates and confirms LC details', async ({ browser }) => {
    test.setTimeout(240_000);
    await withRoleSession(
      browser,
      'https://itn-uat-hdfc.ibdic.in',
      'ISSUANCE_BANK_INPUTTER_EMAIL',
      'ISSUANCE_BANK_INPUTTER_PASSWORD',
      async (page) => {
        const dashboard = new BankDashboardPage(page);
        await dashboard.expectLoaded();
        await dashboard.openEdit(currentLcReference());

        const inputter = new BankInputterPage(page);
        await inputter.proceedThroughTransactionDetails();
        await inputter.proceedThroughLcDetails();
        await inputter.proceedThroughBankCharges();
        await inputter.proceedThroughAttachments();
        await inputter.proceedThroughReview();
        buyerBankTransactionReference = uniqueReference();
        await inputter.enterBuyerBankTransactionReference(buyerBankTransactionReference);
        await inputter.proceed();

        const review = new ReviewPage(page);
        await review.confirm();
        await review.backToDashboard();
      }
    );
  });

  test('05 - Buyer bank authoriser accepts and verifies the LC', async ({ browser }) => {
    test.setTimeout(180_000);
    await withRoleSession(
      browser,
      'https://itn-uat-hdfc.ibdic.in',
      'ISSUANCE_BANK_AUTHORISER_EMAIL',
      'ISSUANCE_BANK_AUTHORISER_PASSWORD',
      async (page) => {
        const dashboard = new BankDashboardPage(page);
        await dashboard.expectLoaded();
        await dashboard.openReview(currentLcReference());

        const review = new ReviewPage(page);
        await review.accept();
        if (!buyerBankTransactionReference) {
          throw new Error('Buyer bank inputter must complete before the buyer bank authoriser.');
        }
        await new BankAuthoriserPage(page)
          .enterReverifyBuyerCorebankingReference(buyerBankTransactionReference);
        await review.confirm();
        await review.confirm();
        await review.backToDashboard();
      }
    );
  });

  test('06 - Seller bank checker approves the advised LC', async ({ browser }) => {
    test.setTimeout(180_000);
    await withRoleSession(
      browser,
      'https://itn-uat-hdfc.ibdic.in',
      'ADVISING_BANK_CHECKER_EMAIL',
      'ADVISING_BANK_CHECKER_PASSWORD',
      async (page) => {
        const dashboard = new BankDashboardPage(page);
        await dashboard.expectLoaded();
        await dashboard.selectLcAdvisingTab();
        await dashboard.openReview(currentLcReference());

        const review = new ReviewPage(page);
        await review.approve();
        await review.confirm();
        await review.backToDashboard();
      }
    );
  });

  test('07 - Seller bank inputter updates advising charges and confirms', async ({ browser }) => {
    test.setTimeout(240_000);
    await withRoleSession(
      browser,
      'https://itn-uat-hdfc.ibdic.in',
      'ADVISING_BANK_INPUTTER_EMAIL',
      'ADVISING_BANK_INPUTTER_PASSWORD',
      async (page) => {
        const dashboard = new BankDashboardPage(page);
        await dashboard.expectLoaded();
        await dashboard.selectLcAdvisingTab();
        await dashboard.openEdit(currentLcReference());

        const inputter = new BankInputterPage(page);
        await inputter.proceedThroughTransactionDetails();
        await inputter.proceedThroughLcDetails();
        await inputter.proceedThroughBankCharges();
        await inputter.fillBankChargeAccount(
          String(Math.floor(10_000_000 + Math.random() * 90_000_000)),
          crypto.randomUUID().replace(/-/g, '').slice(0, 14).toUpperCase()
        );
        await new BankChargesPage(page).selectGstExempted('No');
        await inputter.selectChargesAlreadyPaid();
        await inputter.proceedThroughAttachments();
        await inputter.proceedThroughReview();

        sellerBankTransactionReference = uniqueReference();
        await inputter.enterSellerBankTransactionReference(sellerBankTransactionReference);
        await inputter.proceed();
        const review = new ReviewPage(page);
        await review.confirm();
        await review.backToDashboard();
      }
    );
  });

  test('08 - Seller bank authoriser accepts and verifies the advised LC', async ({ browser }) => {
    test.setTimeout(180_000);
    await withRoleSession(
      browser,
      'https://itn-uat-hdfc.ibdic.in',
      'ADVISING_BANK_AUTHORISER_EMAIL',
      'ADVISING_BANK_AUTHORISER_PASSWORD',
      async (page) => {
        const dashboard = new BankDashboardPage(page);
        await dashboard.expectLoaded();
        await dashboard.selectLcAdvisingTab();
        await dashboard.openReview(currentLcReference());

        const review = new ReviewPage(page);
        await review.accept();
        if (!sellerBankTransactionReference) {
          throw new Error('Seller bank inputter must complete before the seller bank authoriser.');
        }
        await new BankAuthoriserPage(page)
          .enterReverifyBuyerCorebankingReference(sellerBankTransactionReference);
        await review.confirm();
        await review.confirm();
        await review.backToDashboard();
      }
    );
  });

  test('09 - Seller maker accepts the advised LC', async ({ browser }) => {
    test.setTimeout(180_000);
    await withRoleSession(
      browser,
      'https://itn-uat.ibdic.in',
      'CORPORATE_SELLER_MAKER_EMAIL',
      'CORPORATE_SELLER_MAKER_PASSWORD',
      async (page) => {
        const dashboard = new CorporateDashboardPage(page);
        await dashboard.expectLoaded();
        await dashboard.openAdvisingInquiry();
        const acceptance = new CorporateAcceptancePage(page);
        await acceptance.expectLoaded();
        await acceptance.selectAdvisedLcs();
        await acceptance.selectInReview();
        await acceptance.search(currentLcReference());
        await acceptance.clickAction(currentLcReference(), /Accept/i);

        const review = new ReviewPage(page);
        await review.selectRequestForwardedWorkflow('1M1C');
        await review.accept();
        await review.confirm();
        await review.backToDashboard();
      }
    );
  });

  test('10 - Seller checker approves and downloads the processed LC', async ({ browser }) => {
    test.setTimeout(180_000);
    await withRoleSession(
      browser,
      'https://itn-uat.ibdic.in',
      'CORPORATE_SELLER_CHECKER_EMAIL',
      'CORPORATE_SELLER_CHECKER_PASSWORD',
      async (page) => {
        const dashboard = new CorporateDashboardPage(page);
        await dashboard.expectLoaded();
        await dashboard.openAdvisingInquiry();
        const acceptance = new CorporateAcceptancePage(page);
        await acceptance.expectLoaded();
        await acceptance.selectAdvisedLcs();
        await acceptance.selectInReview();
        await acceptance.search(currentLcReference());
        await acceptance.clickAction(currentLcReference(), /Approve/i);

        const review = new ReviewPage(page);
        await review.approve();
        await review.confirm();
        await review.backToDashboard();
        await acceptance.selectAdvisedLcs();
        await acceptance.selectProcessed();
        await acceptance.search(currentLcReference());
        await acceptance.clickAction(currentLcReference(), /Download/i);
      }
    );
  });
});