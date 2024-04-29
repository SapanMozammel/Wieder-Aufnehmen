'use client'

import { useTheme } from 'next-themes';
const Header = () => {
	const { theme, setTheme } = useTheme();
	return (
		<div className='space-x-4'>
			<button onClick={() => setTheme('light')}>Light</button>
			<button onClick={() => setTheme('dark')}>Dark</button>
			<button onClick={() => setTheme('system')}>system</button>
		</div>
	);
};

export default Header;
