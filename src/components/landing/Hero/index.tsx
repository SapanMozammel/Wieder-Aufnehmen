import WorldMap from '@/components/icons/WorldMap';
import SectionSeparator from '@/components/landing/common/SectionSeparator';

const personalInfo = {
	intro: `Hay There, I'm`,
	title: `Sapan Mozammel.`,
	conclusion: {
		intro: `I am a Professional`,
		expertise: `Frontend Developer`,
		extend: `from`,
		company: `startise.com.`,
	},
	description: `I'm an open-minded, determined learner, specializing in JavaScript, React, Node, and Three.js. With a focus on crafting pixel-perfect, performant,  accessible, and responsive applications, I'm essentially a FrontEnd developer addict, always focused on perfecting digital experiences.`,
};

const Hero = () => {
	return (
		<section className="min-h-screen flex flex-col relative z-1">
			<SectionSeparator lts rts lbs rbs tl bl ll rl>
				<div className="container grow py-20 flex flex-col items-start justify-center gap-6 w-full">
					Lorem ipsum dolor sit amet consectetur adipisicing elit.
					Autem quisquam, rerum accusantium optio error nemo, impedit
					cumque exercitationem dolor cupiditate libero aperiam
					dolorem aut vel illo praesentium tempore adipisci
					consectetur.
				</div>
			</SectionSeparator>
			<div className="absolute inset-0 -z-2 pointer-events-none select-none">
				<div className="absolute inset-0 flex items-center justify-center">
					<WorldMap className="w-full h-auto fill-secondary-100 dark:fill-gray-500/25" />
				</div>
			</div>
		</section>
	);
};

export default Hero;
