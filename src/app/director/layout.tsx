import FounderFooter from '@/components/layout/founder/Footer/FounderFooter';
import Header from '@/components/layout/founder/Header';

const layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className='founder-layout'>
			<Header />
			<main>{children}</main>
			<FounderFooter />
		</div>
	);
};

export default layout;
