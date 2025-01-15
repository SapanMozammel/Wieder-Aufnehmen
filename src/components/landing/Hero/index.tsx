import Button from '@/components/common/Button';
import SectionSeparator from '@/components/landing/common/SectionSeparator';
import HeroBackground from './HeroBackground';

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
		<section className="min-h-screen flex flex-col pt-20">
			<div className="grow flex flex-col relative z-1">
				<HeroBackground>
					<SectionSeparator lts rts lbs rbs bl ll rl>
						<div className="container grow py-20 flex flex-col items-start justify-center gap-6 w-full">
							<Button></Button>
						</div>
					</SectionSeparator>
				</HeroBackground>
			</div>
		</section>
	);
};

export default Hero;
