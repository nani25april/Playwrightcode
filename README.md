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
3. Copy `.env.example` to `.env` and set `LOGIN_EMAIL` and `LOGIN_PASSWORD`.
   For a two-user flow, also set `USER_2_EMAIL` and `USER_2_PASSWORD`.
4. Run `npm test`.

Useful commands: `npm run test:headed`, `npm run test:ui`, `npm run test:debug`, and `npm run report`.

The included test covers: login → corporate dashboard → Create New Request → Letter of Credit. Keep selectors and UI actions in `pages/`, and keep test scenarios/assertions in `tests/`.
