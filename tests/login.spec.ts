import { expect, requiredCredential, test } from './fixtures/multi-user.fixture';
import { CorporateDashboardPage } from '../pages/CorporateDashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { TransactionDetailsPage } from '../pages/TransactionDetailsPage';
import { LcDetailsPage } from '../pages/LcDetailsPage';
import { BankChargesPage } from '../pages/BankChargesPage';
import { AttachmentsPage } from '../pages/AttachmentsPage';
import { ReviewPage } from '../pages/ReviewPage';
import { LcDashboardPage } from '../pages/LcDashboardPage';
import { BankDashboardPage } from '../pages/BankDashboardPage';
import { BankInputterPage } from '../pages/BankInputterPage';
import { BankAuthoriserPage } from '../pages/BankAuthoriserPage';
import { CorporateAcceptancePage } from '../pages/CorporateAcceptancePage';
import {
  collateralBackedData,
  lcDetailsData,
  specialLcConditionsData,
  transactionDetailsData
} from '../test-data/lcIssuance.data';

function uniqueAlphaNumericReference(): string {
  return `A${crypto.randomUUID().replace(/-/g, '').slice(0, 5).toUpperCase()}`;
}

test.describe('Fresh LC issuance flow', () => {
  test.afterEach(async ({ page }, testInfo) => {
    await page.screenshot({
      path: testInfo.outputPath('final-state.png'),
      fullPage: true
    });
  });

  test('completes Transaction Details and opens LC Details', async ({ page, openUser2Session }) => {
    test.setTimeout(300_000);
    test.skip(
      !Object.values(collateralBackedData).every(Boolean),
      'Populate collateralBackedData with the chosen financial account and FD values before running this flow.'
    );
    test.skip(
      !Object.values(specialLcConditionsData).every(Boolean),
      'Set Confirmation of Credit (49) in specialLcConditionsData before running this flow.'
    );
    const loginPage = new LoginPage(page);
    const corporateDashboardPage = new CorporateDashboardPage(page);
    const transactionDetailsPage = new TransactionDetailsPage(page);
    const lcDetailsPage = new LcDetailsPage(page);
    const bankChargesPage = new BankChargesPage(page);
    const attachmentsPage = new AttachmentsPage(page);
    const reviewPage = new ReviewPage(page);
    const lcDashboardPage = new LcDashboardPage(page);

    await loginPage.open();
    await loginPage.login({
      email: requiredCredential('ISSUANCE_CORPORATE_MAKER_EMAIL'),
      password: requiredCredential('ISSUANCE_CORPORATE_MAKER_PASSWORD')
    });

    await expect(page).toHaveURL(/\/dashboard\/corporate/);
    await corporateDashboardPage.expectLoaded();
    await corporateDashboardPage.openCreateNewRequest();
    await corporateDashboardPage.selectLetterOfCredit();
    await corporateDashboardPage.startFreshLcIssuance();
    await transactionDetailsPage.expectLoaded();
    await transactionDetailsPage.fillMandatoryFields(transactionDetailsData);
    await transactionDetailsPage.selectCollateralBacked(collateralBackedData);
    await transactionDetailsPage.configureBankConfirmation(specialLcConditionsData);
    await transactionDetailsPage.goToLcDetails();
    await lcDetailsPage.expectLoaded();
    await lcDetailsPage.fillGoodsAndDocuments(lcDetailsData);
    await lcDetailsPage.fillPaymentDetails(lcDetailsData);
    await lcDetailsPage.fillAdditionalConditions(lcDetailsData);
    await lcDetailsPage.clickNext();
    await expect(page.getByText('Charge Account', { exact: true })).toBeVisible({ timeout: 30_000 });
    await bankChargesPage.selectGstExempted('No');
    await bankChargesPage.clickNext();

    await attachmentsPage.expectLoaded();
    await attachmentsPage.uploadFile('C:/Users/HP/Desktop/IBDIC.JPG');
    await attachmentsPage.clickNext();
    await reviewPage.expectLoaded();
    await reviewPage.acceptDeclarations();
    await reviewPage.selectBillPurchaseDuringPayment();
    await reviewPage.selectWorkflow('1M1c');
    await reviewPage.submit();
    await reviewPage.confirm();
    const lcReferenceNumber = await reviewPage.getLcReferenceNumber();
    console.log(`LC Reference Number: ${lcReferenceNumber}`);
    await reviewPage.backToDashboard();
    await expect(page.getByText('Dashboards', { exact: true }).first()).toBeVisible({ timeout: 30_000 });
    await lcDashboardPage.searchInReview(lcReferenceNumber);

    // Open user 2 only after user 1 has completed the maker workflow.
    const user2 = await openUser2Session();
    const { page: user2Page, loginPage: user2LoginPage } = user2;
    await user2LoginPage.open();
    await user2LoginPage.login({
      email: requiredCredential('ISSUANCE_CORPORATE_CHECKER_EMAIL'),
      password: requiredCredential('ISSUANCE_CORPORATE_CHECKER_PASSWORD')
    });
    await expect(user2Page).toHaveURL(/\/dashboard\/corporate/);

    const user2Dashboard = new CorporateDashboardPage(user2Page);
    const user2LcDashboard = new LcDashboardPage(user2Page);
    await user2Dashboard.expectLoaded();
    await user2Dashboard.openLetterOfCreditInquiry();
    await user2LcDashboard.selectIssuanceTab();
    await user2LcDashboard.openReviewFromSearch(lcReferenceNumber);

    const user2ReviewPage = new ReviewPage(user2Page);
    await user2ReviewPage.approve();
    await user2ReviewPage.confirm();
    await user2ReviewPage.backToDashboard();
    await expect(user2Page.getByText('Dashboards', { exact: true }).first()).toBeVisible({ timeout: 30_000 });
    await user2.close();

    const bankContext = await page.context().browser()!.newContext({
      baseURL: 'https://itn-uat-hdfc.ibdic.in'
    });
    const bankCheckerPage = await bankContext.newPage();
    const bankCheckerLoginPage = new LoginPage(bankCheckerPage);
    await bankCheckerLoginPage.open();
    await bankCheckerLoginPage.login({
      email: requiredCredential('ISSUANCE_BANK_CHECKER_EMAIL'),
      password: requiredCredential('ISSUANCE_BANK_CHECKER_PASSWORD')
    });
    await expect(bankCheckerPage).not.toHaveURL(/\/login/i);
    const bankCheckerDashboard = new BankDashboardPage(bankCheckerPage);
    await bankCheckerDashboard.expectLoaded();
    console.log(`Issuance bank checker dashboard loaded: ${bankCheckerPage.url()}`);
    await bankCheckerDashboard.openReview(lcReferenceNumber);

    const bankCheckerReviewPage = new ReviewPage(bankCheckerPage);
    await bankCheckerReviewPage.approve();
    await bankCheckerReviewPage.confirm();
    await bankCheckerReviewPage.backToDashboard();
    await bankContext.close();

    const bankInputterContext = await page.context().browser()!.newContext({
      baseURL: 'https://itn-uat-hdfc.ibdic.in'
    });
    const bankInputterPage = await bankInputterContext.newPage();
    const bankInputterLoginPage = new LoginPage(bankInputterPage);
    await bankInputterLoginPage.open();
    await bankInputterLoginPage.login({
      email: requiredCredential('ISSUANCE_BANK_INPUTTER_EMAIL'),
      password: requiredCredential('ISSUANCE_BANK_INPUTTER_PASSWORD')
    });
    await expect(bankInputterPage).not.toHaveURL(/\/login/i);

    const bankInputterDashboard = new BankDashboardPage(bankInputterPage);
    await bankInputterDashboard.expectLoaded();
    await bankInputterDashboard.openEdit(lcReferenceNumber);

    const bankInputterWorkflow = new BankInputterPage(bankInputterPage);
    await bankInputterWorkflow.proceedThroughTransactionDetails();
    await bankInputterWorkflow.proceedThroughLcDetails();
    await bankInputterWorkflow.proceedThroughBankCharges();
    await bankInputterWorkflow.proceedThroughAttachments();
    await bankInputterWorkflow.proceedThroughReview();
    const bankTransactionReference = uniqueAlphaNumericReference();
    await bankInputterWorkflow.enterBuyerBankTransactionReference(bankTransactionReference);
    console.log(`Buyer Bank Transaction Reference Number: ${bankTransactionReference}`);
    await bankInputterWorkflow.proceed();
    const bankInputterReviewPage = new ReviewPage(bankInputterPage);
    await bankInputterReviewPage.confirm();
    await bankInputterReviewPage.backToDashboard();
    await bankInputterContext.close();

    const bankAuthoriserContext = await page.context().browser()!.newContext({
      baseURL: 'https://itn-uat-hdfc.ibdic.in'
    });
    const bankAuthoriserPage = await bankAuthoriserContext.newPage();
    const bankAuthoriserLoginPage = new LoginPage(bankAuthoriserPage);
    await bankAuthoriserLoginPage.open();
    await bankAuthoriserLoginPage.login({
      email: requiredCredential('ISSUANCE_BANK_AUTHORISER_EMAIL'),
      password: requiredCredential('ISSUANCE_BANK_AUTHORISER_PASSWORD')
    });
    await expect(bankAuthoriserPage).not.toHaveURL(/\/login/i);

    const bankAuthoriserDashboard = new BankDashboardPage(bankAuthoriserPage);
    await bankAuthoriserDashboard.expectLoaded();
    await bankAuthoriserDashboard.openReview(lcReferenceNumber);

    const bankAuthoriserReviewPage = new ReviewPage(bankAuthoriserPage);
    await bankAuthoriserReviewPage.accept();
    const bankAuthoriserWorkflow = new BankAuthoriserPage(bankAuthoriserPage);
    await bankAuthoriserWorkflow.enterReverifyBuyerCorebankingReference(bankTransactionReference);
    await bankAuthoriserReviewPage.confirm();
    await bankAuthoriserReviewPage.confirm();
    await bankAuthoriserReviewPage.backToDashboard();
    await bankAuthoriserContext.close();

    const advisingCheckerContext = await page.context().browser()!.newContext({
      baseURL: 'https://itn-uat-hdfc.ibdic.in'
    });
    const advisingCheckerPage = await advisingCheckerContext.newPage();
    const advisingCheckerLoginPage = new LoginPage(advisingCheckerPage);
    await advisingCheckerLoginPage.open();
    await advisingCheckerLoginPage.login({
      email: requiredCredential('ADVISING_BANK_CHECKER_EMAIL'),
      password: requiredCredential('ADVISING_BANK_CHECKER_PASSWORD')
    });
    const advisingCheckerDashboard = new BankDashboardPage(advisingCheckerPage);
    await advisingCheckerDashboard.expectLoaded();
    await advisingCheckerDashboard.selectLcAdvisingTab();
    await advisingCheckerDashboard.openReview(lcReferenceNumber);
    const advisingCheckerReviewPage = new ReviewPage(advisingCheckerPage);
    await advisingCheckerReviewPage.approve();
    await advisingCheckerReviewPage.confirm();
    await advisingCheckerReviewPage.backToDashboard();
    await advisingCheckerContext.close();

    const advisingInputterContext = await page.context().browser()!.newContext({
      baseURL: 'https://itn-uat-hdfc.ibdic.in'
    });
    const advisingInputterPage = await advisingInputterContext.newPage();
    const advisingInputterLoginPage = new LoginPage(advisingInputterPage);
    await advisingInputterLoginPage.open();
    await advisingInputterLoginPage.login({
      email: requiredCredential('ADVISING_BANK_INPUTTER_EMAIL'),
      password: requiredCredential('ADVISING_BANK_INPUTTER_PASSWORD')
    });
    const advisingInputterDashboard = new BankDashboardPage(advisingInputterPage);
    await advisingInputterDashboard.expectLoaded();
    await advisingInputterDashboard.selectLcAdvisingTab();
    await advisingInputterDashboard.openEdit(lcReferenceNumber);
    const advisingInputterWorkflow = new BankInputterPage(advisingInputterPage);
    await advisingInputterWorkflow.proceedThroughTransactionDetails();
    await advisingInputterWorkflow.proceedThroughLcDetails();
    await advisingInputterWorkflow.proceedThroughBankCharges();
    const advisingChargeAccount = String(Math.floor(10_000_000 + Math.random() * 90_000_000));
    const advisingGstNumber = crypto.randomUUID().replace(/-/g, '').slice(0, 14).toUpperCase();
    await advisingInputterWorkflow.fillBankChargeAccount(advisingChargeAccount, advisingGstNumber);
    console.log(`Advising charge account: ${advisingChargeAccount}`);
    console.log(`Advising GST number: ${advisingGstNumber}`);
    const advisingBankChargesPage = new BankChargesPage(advisingInputterPage);
    await advisingBankChargesPage.selectGstExempted('No');
    await advisingInputterWorkflow.selectChargesAlreadyPaid();
    await advisingInputterWorkflow.proceedThroughAttachments();
    await advisingInputterWorkflow.proceedThroughReview();
    const advisingBankTransactionReference = uniqueAlphaNumericReference();
    await advisingInputterWorkflow.enterSellerBankTransactionReference(advisingBankTransactionReference);
    console.log(`Advising Bank Transaction Reference Number: ${advisingBankTransactionReference}`);
    await advisingInputterWorkflow.proceed();
    const advisingInputterReviewPage = new ReviewPage(advisingInputterPage);
    await advisingInputterReviewPage.confirm();
    await advisingInputterReviewPage.backToDashboard();
    await advisingInputterContext.close();

    const advisingAuthoriserContext = await page.context().browser()!.newContext({
      baseURL: 'https://itn-uat-hdfc.ibdic.in'
    });
    const advisingAuthoriserPage = await advisingAuthoriserContext.newPage();
    const advisingAuthoriserLoginPage = new LoginPage(advisingAuthoriserPage);
    await advisingAuthoriserLoginPage.open();
    await advisingAuthoriserLoginPage.login({
      email: requiredCredential('ADVISING_BANK_AUTHORISER_EMAIL'),
      password: requiredCredential('ADVISING_BANK_AUTHORISER_PASSWORD')
    });
    const advisingAuthoriserDashboard = new BankDashboardPage(advisingAuthoriserPage);
    await advisingAuthoriserDashboard.expectLoaded();
    await advisingAuthoriserDashboard.selectLcAdvisingTab();
    await advisingAuthoriserDashboard.openReview(lcReferenceNumber);
    const advisingAuthoriserReviewPage = new ReviewPage(advisingAuthoriserPage);
    await advisingAuthoriserReviewPage.accept();
    const advisingAuthoriserWorkflow = new BankAuthoriserPage(advisingAuthoriserPage);
    await advisingAuthoriserWorkflow.enterReverifyBuyerCorebankingReference(advisingBankTransactionReference);
    await advisingAuthoriserReviewPage.confirm();
    await advisingAuthoriserReviewPage.confirm();
    await advisingAuthoriserReviewPage.backToDashboard();
    await advisingAuthoriserContext.close();

    const sellerMakerContext = await page.context().browser()!.newContext({
      baseURL: 'https://itn-uat.ibdic.in'
    });
    const sellerMakerPage = await sellerMakerContext.newPage();
    const sellerMakerLoginPage = new LoginPage(sellerMakerPage);
    await sellerMakerLoginPage.open();
    await sellerMakerLoginPage.login({
      email: requiredCredential('CORPORATE_SELLER_MAKER_EMAIL'),
      password: requiredCredential('CORPORATE_SELLER_MAKER_PASSWORD')
    });
    const sellerMakerDashboard = new CorporateDashboardPage(sellerMakerPage);
    await sellerMakerDashboard.expectLoaded();
    await sellerMakerDashboard.openAdvisingInquiry();
    const sellerMakerAcceptance = new CorporateAcceptancePage(sellerMakerPage);
    await sellerMakerAcceptance.expectLoaded();
    await sellerMakerAcceptance.selectAdvisedLcs();
    await sellerMakerAcceptance.selectInReview();
    await sellerMakerAcceptance.search(lcReferenceNumber);
    await sellerMakerAcceptance.clickAction(lcReferenceNumber, /Accept/i);
    const sellerMakerReviewPage = new ReviewPage(sellerMakerPage);
    await sellerMakerReviewPage.selectRequestForwardedWorkflow('1M1C');
    await sellerMakerReviewPage.accept();
    await sellerMakerReviewPage.confirm();
    await sellerMakerReviewPage.backToDashboard();
    await sellerMakerContext.close();

    const sellerCheckerContext = await page.context().browser()!.newContext({
      baseURL: 'https://itn-uat.ibdic.in'
    });
    const sellerCheckerPage = await sellerCheckerContext.newPage();
    const sellerCheckerLoginPage = new LoginPage(sellerCheckerPage);
    await sellerCheckerLoginPage.open();
    await sellerCheckerLoginPage.login({
      email: requiredCredential('CORPORATE_SELLER_CHECKER_EMAIL'),
      password: requiredCredential('CORPORATE_SELLER_CHECKER_PASSWORD')
    });
    const sellerCheckerDashboard = new CorporateDashboardPage(sellerCheckerPage);
    await sellerCheckerDashboard.expectLoaded();
    await sellerCheckerDashboard.openAdvisingInquiry();
    const sellerCheckerAcceptance = new CorporateAcceptancePage(sellerCheckerPage);
    await sellerCheckerAcceptance.expectLoaded();
    await sellerCheckerAcceptance.selectAdvisedLcs();
    await sellerCheckerAcceptance.selectInReview();
    await sellerCheckerAcceptance.search(lcReferenceNumber);
    await sellerCheckerAcceptance.clickAction(lcReferenceNumber, /Approve/i);
    const sellerCheckerReviewPage = new ReviewPage(sellerCheckerPage);
    await sellerCheckerReviewPage.approve();
    await sellerCheckerReviewPage.confirm();
    await sellerCheckerReviewPage.backToDashboard();
    await sellerCheckerAcceptance.selectAdvisedLcs();
    await sellerCheckerAcceptance.selectProcessed();
    await sellerCheckerAcceptance.search(lcReferenceNumber);
    await sellerCheckerAcceptance.clickAction(lcReferenceNumber, /Download/i);
    await sellerCheckerContext.close();
  });
});
