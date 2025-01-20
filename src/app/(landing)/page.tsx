import Hero from '@/components/landing/Hero';
import SectionSeparator from '@/components/landing/common/SectionSeparator';

const page = () => {
	return (
		<>
			<Hero />
			<section className="h-screen pt-[20vw] relative z-1">
				<SectionSeparator lts rts lbs rbs bl ll rl>
					<div className="container grow py-8 sm:py-12 lg:py-16 flex flex-col items-center justify-start gap-4 w-full text-center">
						Lorem ipsum dolor sit amet consectetur adipisicing elit.
						Asperiores dolore facilis voluptatibus saepe porro dolor
						illum, sed exercitationem vitae quas explicabo,
						accusamus libero necessitatibus vel dicta commodi
						deserunt nesciunt! Velit.
					</div>
				</SectionSeparator>
			</section>
		</>
	);
};

export default page;
