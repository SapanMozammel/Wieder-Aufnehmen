import { DM_Sans, EB_Garamond, Hanken_Grotesk } from 'next/font/google';

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

export const hankenGrotesk = Hanken_Grotesk({
  display: 'swap',
  weight: ['200','300','400','500','600','700','800','900'],
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-hg',
});
