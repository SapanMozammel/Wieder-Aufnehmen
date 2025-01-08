import Footer from '@/components/landing/Footer';
import Header from '@/components/landing/Header';
import { ThemeProvider } from 'next-themes';

const layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="bg-white dark:bg-black text-dark dark:text-white relative">
			<ThemeProvider
				enableSystem={true}
				defaultTheme="system"
				enableColorScheme={false}
				themes={['light', 'dark', 'system']}
				attribute="class">
				<Header />
				<main>{children}</main>
				<Footer />
			</ThemeProvider>
			<div className="absolute inset-0 bg-[url('/noise.png')] bg-repeat opacity-10 dark:opacity-30 animate-noise pointer-events-none select-none z-1"></div>
		</div>
	);
};

export default layout;
