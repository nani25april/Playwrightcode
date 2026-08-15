import type {
  CollateralBackedDetails,
  SpecialLcConditionsDetails,
  TransactionDetails
} from '../pages/TransactionDetailsPage';
import type { LcDetailsData } from '../pages/LcDetailsPage';

function systemDate(): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Calcutta',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).formatToParts(new Date());
  const day = parts.find((part) => part.type === 'day')!.value;
  const monthNumber = parts.find((part) => part.type === 'month')!.value;
  const year = parts.find((part) => part.type === 'year')!.value;
  const month = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][Number(monthNumber) - 1];
  return `${day}-${month}-${year}`;
}

/** Keep all business inputs here; page objects contain no hard-coded test values. */
export const transactionDetailsData: TransactionDetails = {
  beneficiarySearchBy: 'NAME',
  beneficiarySearchValue: 'HONDA CARS INDIA LIMITED',
  proformaInvoiceNumber: 'PO4353453',
  proformaInvoiceDate: '01-AUG-2026',
  amount: '100000',
  currency: 'INR'
};

/** Populate these values once the business selects the intended FD and debit account. */
export const collateralBackedData: CollateralBackedDetails = {
  marginPercent: '10',
  debitAccountNumber: '4000000002',
  fdMaturityDate: '01-AUG-2027'
};

export const specialLcConditionsData: SpecialLcConditionsDetails = {
  // Choose the required value from the Confirmation of Credit (49) dropdown.
  confirmationOfCredit: 'CONFIRM',
  confirmingBank: 'HDFC',
  confirmingBankBranch: 'HYDERABAD'
};

export const lcDetailsData: LcDetailsData = {
  lcType: 'IRREVOCABLE',
  purpose: 'CAPEX',
  tradeType: 'HIGH SEA TRADE',
  expiryDate: '01-JUL-2027',
  expiryPlace: 'HYDERABAD',
  requestDate: systemDate(),
  ucpVersion: 'CPT',
  product: {
    hsnCode: '10011100',
    quantity: '1',
    toleranceSelection: 'UNIT',
    toleranceValue: '1/2',
    currency: 'INR',
    amount: '100000'
  },
  goodsDescription: 'RE',
  incoTermVersion: '2020',
  incoTerm: 'DAP 2020',
  incoPlace: 'Hyderabad',
  partialShipment: 'CONDITIONAL',
  transshipment: 'CONDITIONAL',
  placeOfReceipt: 'HYDERABAD',
  latestShipmentDate: systemDate(),
  portOfLoading: 'HYDERABAD',
  portOfDischarge: 'MUMBAI',
  finalDestination: 'MUMBAI',
  shipmentPeriod: '50',
  documentType: 'GRGC',
  documentDescription: 'RE',
  documentDays: '21',
  documentDaysFrom: 'Bill of Lading',
  reasonForDelay: 'RE',
  creditAvailableWith: 'Issuing Bank',
  creditAvailableBy: 'By Acceptance',
  draftsAt: 'Issuing Bank',
  paymentAgainst: 'Usance',
  tenorDays: '60',
  paymentFrom: 'LADING DATE',
  paymentCurrency: 'INR',
  paymentAmount: '100000',
  chargeType: 'Issuing Bank Charges',
  chargeApplicant: true,
  chargeBeneficiary: false,
  chargeAdditionalText: 'RE',
  additionalConditions: 'RE',
  bankInstructions: 'RE'
};
