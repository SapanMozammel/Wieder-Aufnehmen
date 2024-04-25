import Footer from '@/components/landing/Footer';
import Header from '@/components/landing/Header';

const layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<>
			<Header />
			<main className="relative">
				{children}
				<div className="absolute inset-0 bg-[url('/noise.png')] bg-repeat opacity-10 animate-noise pointer-events-none select-none"></div>
			</main>
			<Footer />
		</>
	);
};

export default layout;
