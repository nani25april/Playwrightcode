import { test as base, type BrowserContext, type Page } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

type User2Session = {
  context: BrowserContext;
  page: Page;
  loginPage: LoginPage;
  close: () => Promise<void>;
};

type MultiUserFixtures = {
  openUser2Session: () => Promise<User2Session>;
};

/** Opens a second isolated session on demand; call only after user 1 is finished. */
export const test = base.extend<MultiUserFixtures>({
  openUser2Session: async ({ browser }, use) => {
    let context: BrowserContext | undefined;
    const close = async () => {
      if (context) {
        await context.close();
        context = undefined;
      }
    };

    await use(async () => {
      if (context) throw new Error('User 2 session is already open. Close it before opening another.');
      context = await browser.newContext();
      const page = await context.newPage();
      return { context, page, loginPage: new LoginPage(page), close };
    });

    await close();
  }
});

export { expect } from '@playwright/test';

export function requiredCredential(name:
  | 'LOGIN_EMAIL'
  | 'LOGIN_PASSWORD'
  | 'USER_2_EMAIL'
  | 'USER_2_PASSWORD'
  | 'ISSUANCE_CORPORATE_MAKER_EMAIL'
  | 'ISSUANCE_CORPORATE_MAKER_PASSWORD'
  | 'ISSUANCE_CORPORATE_CHECKER_EMAIL'
  | 'ISSUANCE_CORPORATE_CHECKER_PASSWORD'
  | 'ISSUANCE_BANK_CHECKER_EMAIL'
  | 'ISSUANCE_BANK_CHECKER_PASSWORD'
  | 'ISSUANCE_BANK_INPUTTER_EMAIL'
  | 'ISSUANCE_BANK_INPUTTER_PASSWORD'
  | 'ISSUANCE_BANK_AUTHORISER_EMAIL'
  | 'ISSUANCE_BANK_AUTHORISER_PASSWORD'
  | 'ADVISING_BANK_CHECKER_EMAIL'
  | 'ADVISING_BANK_CHECKER_PASSWORD'
  | 'ADVISING_BANK_INPUTTER_EMAIL'
  | 'ADVISING_BANK_INPUTTER_PASSWORD'
  | 'ADVISING_BANK_AUTHORISER_EMAIL'
  | 'ADVISING_BANK_AUTHORISER_PASSWORD'
  | 'CORPORATE_SELLER_MAKER_EMAIL'
  | 'CORPORATE_SELLER_MAKER_PASSWORD'
  | 'CORPORATE_SELLER_CHECKER_EMAIL'
  | 'CORPORATE_SELLER_CHECKER_PASSWORD'
  | 'REGRESSION_BUYER_CHECKER_LC_REFERENCE'
  | 'REGRESSION_BUYER_BANK_CHECKER_LC_REFERENCE'
  | 'REGRESSION_BUYER_BANK_INPUTTER_LC_REFERENCE'
  | 'REGRESSION_BUYER_BANK_AUTHORISER_LC_REFERENCE'
  | 'REGRESSION_SELLER_BANK_CHECKER_LC_REFERENCE'
  | 'REGRESSION_SELLER_BANK_INPUTTER_LC_REFERENCE'
  | 'REGRESSION_SELLER_BANK_AUTHORISER_LC_REFERENCE'
  | 'REGRESSION_SELLER_MAKER_LC_REFERENCE'
  | 'REGRESSION_SELLER_CHECKER_LC_REFERENCE'
): string {
  const value = process.env[name];
  if (!value) throw new Error(`Set ${name} in .env before running a multi-user test.`);
  return value;
}
