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
		<header className="py-5 border-b border-secondary-800">
			<div className="container">
				<ThemeSwitcher />
			</div>
		</header>
	);
};

export default Header;
