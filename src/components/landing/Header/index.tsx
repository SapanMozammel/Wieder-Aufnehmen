import dynamic from 'next/dynamic';
const ThemeSwitcher = dynamic(() => import('./ThemeSwitcher'), {
	ssr: false,
	loading: () => <Loader />,
});

const Loader = () => {
	return 'Loading...';
};

const Header = () => {
	return <ThemeSwitcher />;
};

export default Header;
