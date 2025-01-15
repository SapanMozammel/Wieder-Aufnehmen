import Logo from '@/components/icons/Logo';
import dynamic from 'next/dynamic';
import Link from 'next/link';
const ThemeSwitcher = dynamic(() => import('./ThemeSwitcher'), {
	ssr: false,
	loading: () => <Loader />,
});

const Loader = () => {
	return 'Loading...';
};

const Header = () => {
	return (
		<header className="fixed backdrop-blur-xl inset-x-0 top-0 h-20 z-2 flex flex-col border-b border-solid border-secondary-400 dark:border-secondary-600">
			<div className="container-fluid grow flex flex-col w-full">
				<div className="grow flex items-center justify-between">
					<Link
						href="/"
						className="flex items-center gap-2 cursor-pointer">
						<Logo className="h-10" />
						<h2 className="text-2xl font-hg font-normal italic leading-none pb-0.5 tracking-tighter scale-y-110 text-black dark:text-white">
							sapan.dev
						</h2>
					</Link>
					<div className="ml-auto space-x-4">
						<ThemeSwitcher />
					</div>
				</div>
			</div>
		</header>
	);
};

export default Header;
