import dynamic from 'next/dynamic';
const ThemeSwitcher = dynamic(() => import('./ThemeSwitcher'), {
	ssr: false,
	loading: () => <Loader />,
});

const Loader = () => {
	return 'Loading...';
};

const Header = () => {
	return (
		<header>
		<div className='container'>
			<ThemeSwitcher />
		</div>
		</header>
	);
};

export default Header;
