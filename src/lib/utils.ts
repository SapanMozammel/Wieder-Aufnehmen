import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const isMacOS = () => {
	if (typeof navigator !== 'undefined') {
		if ((navigator as any).userAgentData) {
			// Use userAgentData for modern browsers
			return (navigator as any).userAgentData.platform === 'macOS';
		} else {
			// Fallback to userAgent
			return /Mac/.test(navigator.userAgent);
		}
	}
	return false;
};
