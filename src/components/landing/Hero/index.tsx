import Button from '@/components/common/Button';
import Hexagon from '@/components/icons/Hexagon';
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
		<section className="min-h-screen flex flex-col py-20 relative z-1">
			<div className="container flex flex-col items-start justify-center gap-6 w-full grow">
				<div className="text-5xl font-eb leading-snug w-full">
					<p className="mb-[0.375em] text-secondary dark:text-light">
						{personalInfo.intro}
					</p>
					<h1 className="flex items-center justify-start text-[2em] leading-none">
						<span className="relative w-[7em] aspect-[1916/532]">
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
					<h2 className="text-[0.85em] mt-[0.375em] leading-tight">
						<span className="flex items-center justify-start gap-[0.5em] text-[0.8em] text-secondary dark:text-light">
							{personalInfo.conclusion.intro}
						</span>
						<span className="uppercase font-bold text-[1em] leading-snug tracking-wide">
							{personalInfo.conclusion.expertise}
						</span>
						<span className="flex items-center justify-start gap-[0.5em] text-[0.8em] text-secondary dark:text-light">
							{`${personalInfo.conclusion.extend} `}
							<StartiseIcon className="!h-[0.9em] text-dark dark:text-white !w-auto" />
							<span className="sr-only">
								{personalInfo.conclusion.company}
							</span>
						</span>
					</h2>
				</div>
				<div className="w-48 h-1 rounded-full bg-primary" />
				<p className="w-7/12 text-secondary dark:text-light text-base leading-relaxed tracking-wider">
					{personalInfo.description}
				</p>
				<Button className="mt-3" />
			</div>
			<div className="absolute inset-0 -z-1 pointer-events-none select-none opacity-20 dark:opacity-25 mix-blend-multiply">
				<div className="absolute inset-0 flex items-center justify-center opacity-30">
					<WorldMap className="w-9/12 h-auto fill-secondary" />
				</div>
				<div className="absolute inset-0 flex items-center justify-center">
					<Hexagon className="w-11/12 h-auto fill-slate-300 dark:fill-slate-700 stroke-slate-500 dark:stroke-slate-400 opacity-75 dark:opacity-50" />
				</div>
			</div>
		</section>
	);
};

export default Hero;
