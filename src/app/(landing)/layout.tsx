import Footer from '@/components/landing/Footer';
import Header from '@/components/landing/Header';

const layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<>
			<Header />
			<main>{children}</main>
			<Footer />
		</>
	);
};

export default layout;
