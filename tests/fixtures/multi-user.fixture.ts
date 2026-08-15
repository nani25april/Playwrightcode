import { test as base, type BrowserContext, type Page } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

type MultiUserFixtures = {
  user2Context: BrowserContext;
  user2Page: Page;
  user2LoginPage: LoginPage;
};

/** A second isolated browser session; the default `page` fixture is user 1. */
export const test = base.extend<MultiUserFixtures>({
  user2Context: async ({ browser }, use) => {
    const context = await browser.newContext();
    await use(context);
    await context.close();
  },
  user2Page: async ({ user2Context }, use) => {
    await use(await user2Context.newPage());
  },
  user2LoginPage: async ({ user2Page }, use) => {
    await use(new LoginPage(user2Page));
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
): string {
  const value = process.env[name];
  if (!value) throw new Error(`Set ${name} in .env before running a multi-user test.`);
  return value;
}
