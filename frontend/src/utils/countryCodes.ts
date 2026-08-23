import type { CountryCodeInfo } from '../types/auth';

export const COUNTRY_CODES: CountryCodeInfo[] = [
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    dialCode: '+91',
    format: '##### #####',
    sample: '98765 43210'
  },
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    dialCode: '+1',
    format: '(###) ###-####',
    sample: '(555) 234-5678'
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    dialCode: '+44',
    format: '#### ######',
    sample: '7911 123456'
  },
  {
    code: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    dialCode: '+65',
    format: '#### ####',
    sample: '8123 4567'
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    dialCode: '+971',
    format: '## ### ####',
    sample: '50 123 4567'
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    dialCode: '+1',
    format: '(###) ###-####',
    sample: '(416) 555-0199'
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    dialCode: '+61',
    format: '### ### ###',
    sample: '412 345 678'
  },
  {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    dialCode: '+49',
    format: '#### #######',
    sample: '1512 3456789'
  },
  {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    dialCode: '+33',
    format: '# ## ## ## ##',
    sample: '6 12 34 56 78'
  },
  {
    code: 'JP',
    name: 'Japan',
    flag: '🇯🇵',
    dialCode: '+81',
    format: '## #### ####',
    sample: '90 1234 5678'
  },
  {
    code: 'CH',
    name: 'Switzerland',
    flag: '🇨🇭',
    dialCode: '+41',
    format: '## ### ## ##',
    sample: '79 123 45 67'
  }
];

export const DEFAULT_COUNTRY = COUNTRY_CODES[0]; // India (+91)
