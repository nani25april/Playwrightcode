# Playwright Page Object Model Framework

This TypeScript Playwright framework automates the IBDIC ITN UAT corporate dashboard using reusable page objects and business-focused tests.

## Layout

```
pages/                 # Page objects and reusable interactions
  BasePage.ts           # Shared navigation and UI helpers
  LoginPage.ts          # IBDIC login locators and actions
  CorporateDashboardPage.ts # Create-request and Letter of Credit actions
tests/                  # Test scenarios
playwright.config.ts    # Execution, artifacts, browser, and reporting setup
```

## Run it

1. Run `npm install`.
2. Run `npx playwright install`.
3. Copy `.env.example` to `.env` and replace the example values with credentials
   for your UAT users. The fresh LC issuance flow in `tests/login.spec.ts` needs
   the `ISSUANCE_*`, `ADVISING_BANK_*`, and `CORPORATE_SELLER_*` credentials
   shown in the example; `LOGIN_*` and `USER_2_*` alone are not sufficient.
4. Run `npx playwright test tests/login.spec.ts` to run that flow, or `npm test`
   to run the full suite.

Useful commands: `npm run test:headed`, `npm run test:ui`, `npm run test:debug`, and `npm run report`.

The included test covers: login → corporate dashboard → Create New Request → Letter of Credit. Keep selectors and UI actions in `pages/`, and keep test scenarios/assertions in `tests/`.

## Review-field regression suite

`npx playwright test tests/regression.spec.ts --grep "Standalone review field propagation" --workers=1` runs one independent review-field test per configured maker field and workflow party. Configure the nine `REGRESSION_*_LC_REFERENCE` values in `.env` with LC references currently waiting at the matching party's review/inputter step. The buyer-maker tests prepare a new request and stop at Review without submitting it. The other party tests inspect the referenced request; inputter tests navigate to Review but do not proceed from that page. Use `--workers=1` because the tests for a party reuse its configured LC reference.
