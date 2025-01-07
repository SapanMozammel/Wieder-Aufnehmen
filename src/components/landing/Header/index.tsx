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
		<header className="relative py-5 z-2">
			<div className="container-fluid">
				<ThemeSwitcher />
				Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore laudantium saepe, non exercitationem ipsum iusto itaque ea consequuntur officiis, tempora, deleniti delectus doloribus ratione! Deleniti eligendi illo saepe temporibus molestiae.
			</div>
		</header>
	);
};

export default Header;
