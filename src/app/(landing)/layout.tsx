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
				<main>{children}</main>
				<Footer />
			</ThemeProvider>
		</>
	);
};

export default layout;
