import Logo from '@/components/icons/Logo';
import { GithubIcon, LoaderCircleIcon } from 'lucide-react';
import Link from 'next/link';
// const ThemeSwitcher = dynamic(
//   () => import("@/components/layout/founder/common/ThemeSwitcher"),
//   {
//     ssr: false,
//     loading: () => <Loader />,
//   },
// );

const Loader = () => {
	return (
		<span className='text-secondary-500 dark:text-secondary-300 inline-flex aspect-square h-8 items-center justify-center'>
			<LoaderCircleIcon className='w-5 animate-spin' />
		</span>
	);
};

const Header = () => {
	return (
		<header className='border-secondary-400 dark:border-secondary-600 fixed inset-x-0 top-0 z-10 flex h-20 flex-col border-b border-solid backdrop-blur-xl'>
			<div className='container-fluid flex w-full grow flex-col'>
				<div className='flex grow items-center justify-between'>
					<Link href='/' className='flex cursor-pointer flex-row items-center gap-1.5 sm:gap-2 rtl:flex-row-reverse'>
						<Logo className='h-8 sm:h-10' />
						<h2 className='font-hg scale-y-110 pb-0.5 text-xl !leading-none font-normal tracking-tighter text-black italic sm:text-2xl dark:text-white'>sapan.dev</h2>
					</Link>
					<div className='ms-auto flex items-center gap-x-2 gap-y-1'>
						{/* <ThemeSwitcher /> */}
						<Link
							href='https://github.com/SapanMozammel'
							target='_blank'
							className='hover:text-primary dark:hover:text-success inline-flex aspect-square h-8 cursor-pointer items-center justify-center text-black ease-in-out dark:text-white'
						>
							<GithubIcon className='w-5' />
						</Link>
					</div>
				</div>
			</div>
		</header>
	);
};

export default Header;
