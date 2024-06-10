import Button from '@/components/common/Button';
import StartiseIcon from '@/components/icons/Startise';
import WorldMap from '@/components/icons/WorldMap';
import Image from 'next/image';

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
		<section className="min-h-screen flex flex-col py-20 relative z-1 overflow-hidden">
			<div className="container flex flex-col items-start justify-center gap-6 w-full grow">
				<div className="text-6xl font-eb leading-snug w-full">
					<p className="mb-[0.25em] text-secondary-500 dark:text-secondary-300">
						{personalInfo.intro}
					</p>
					<h1 className="flex items-center justify-start text-[2em] leading-none">
						<span className="relative w-[5.125em] aspect-[1916/532]">
							<Image
								src="/hero/title.png"
								fill
								priority
								sizes="(max-width: 768px) 100vw, 33vw"
								alt={personalInfo.title}
							/>
						</span>
						<span className="sr-only">{personalInfo.title}</span>
					</h1>
					<h2 className="text-[0.75em] mt-[0.25em] leading-tight">
						<span className="flex items-center justify-start text-secondary-500 dark:text-secondary-300">
							{personalInfo.conclusion.intro}
						</span>
						<span className="text-[1.25em] font-semibold leading-tighter tracking-wider text-dark dark:text-white">
							{personalInfo.conclusion.expertise}
						</span>
						<span className="flex items-center justify-start gap-[0.375em] text-secondary-500 dark:text-secondary-300">
							{`${personalInfo.conclusion.extend} `}
							<StartiseIcon className="!h-[0.9em] text-dark dark:text-white !w-auto" />
							<span className="sr-only">
								{personalInfo.conclusion.company}
							</span>
						</span>
					</h2>
				</div>
				<div className="w-48 h-1 rounded-full bg-primary" />
				<p className="w-7/12 text-secondary-500 dark:text-secondary-200 text-base leading-relaxed tracking-wider">
					{personalInfo.description}
				</p>
				<Button className="mt-5" />
			</div>
			<div className="absolute inset-0 -z-1 pointer-events-none select-none">
				<div className="absolute inset-0 flex items-center justify-center">
					<WorldMap className="w-full h-auto fill-secondary-100 dark:fill-slate-500/25" />
				</div>
			</div>
		</section>
	);
};

export default Hero;
