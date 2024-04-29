'use client';

import { useTheme } from 'next-themes';
import { useCallback } from 'react';

const ThemeSwitcher = () => {
	const themes = ['system', 'light', 'dark'];
	const { theme, setTheme } = useTheme();

	const cycleTheme = useCallback(() => {
		const themeString = theme as string;
		setTheme(themes[(themes.indexOf(themeString) + 1) % themes.length]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [theme]);

	const themeIcon = (value: string | undefined) => {
		switch (value) {
			case 'light':
				return 'Light';
			case 'dark':
				return 'Dark';
			case 'system':
			default:
				return 'System';
		}
	};

	return (
		<div className="space-x-4">
			<button onClick={cycleTheme}>{themeIcon(theme)}</button>
		</div>
	);
};

export default ThemeSwitcher;
