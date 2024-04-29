import Footer from '@/components/landing/Footer';
import Header from '@/components/landing/Header';
import { ThemeProvider } from 'next-themes';

const layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<>
			<ThemeProvider
				enableSystem={true}
				defaultTheme="system"
				enableColorScheme={false}
				themes={['light', 'dark', 'system']}
				attribute="class">
				<Header />
				<main className="relative">
					{children}
					<div className="absolute inset-0 bg-[url('/noise.png')] bg-repeat opacity-10 animate-noise pointer-events-none select-none"></div>
				</main>
				<Footer />
			</ThemeProvider>
		</>
	);
};

export default layout;
