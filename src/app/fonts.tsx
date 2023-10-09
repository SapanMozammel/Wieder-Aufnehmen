import { DM_Sans, EB_Garamond, Sigmar_One } from 'next/font/google';

export const dmSans = DM_Sans({
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  style: ['normal'],
  variable: '--font-dm',
});

export const ebGaramond = EB_Garamond({
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  style: ['normal'],
  variable: '--font-eb',
});

export const sigmaOne = Sigmar_One({
  display: 'swap',
  weight: ['400'],
  subsets: ['latin'],
  style: ['normal'],
  variable: '--font-sigma',
});
