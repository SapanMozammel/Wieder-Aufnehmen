import { LinkButton } from '@/components/common/Button';
import SectionSeparator from '@/components/landing/common/SectionSeparator';
import TextUnderline from '../common/TextUnderline';
import AdminScreen from './AdminScreen';
import HeroBackground from './HeroBackground';

const Hero = () => {
	return (
		<section className="flex flex-col pt-20">
			<div className="grow flex flex-col relative z-1">
				<HeroBackground>
					<SectionSeparator lts rts lbs rbs bl ll rl>
						<div className="container grow pt-16 sm:pt-24 lg:pt-32 flex flex-col items-center justify-center gap-4 w-full text-center">
							<h1 className="sr-only">
								Hi, I am Sapan Mozammel, <br /> a fullstack
								frontend developer.
							</h1>
							<h2 className="inline-block font-hg text-lg sm:text-4xl lg:text-5xl font-extrabold !leading-tight bg-gradient-radial via-45% to-75% from-slate-500 via-black to-slate-500 dark:from-slat-600 dark:via-light dark:to-slate-400 text-transparent bg-clip-text">
								With every line of{' '}
								<TextUnderline className="text-black dark:text-white">
									JavaScript
								</TextUnderline>
								, <br /> shaping the future of web development.
							</h2>
							<p className="inline-flex text-sm sm:text-base text-secondary-600 dark:text-secondary-400 !leading-relaxed tracking-wider max-w-[90ch]">
								With 5+ years of dynamic experience building
								applications using React, Redux, GraphQL,
								Next.js, Three.js, Node.js and many more, I take
								pride in writing clean, maintainable code while
								adhering to engineering best practices.
							</p>
							<LinkButton
								href="/"
								target="_blank"
								className="mt-4"
								fill>
								Let&apos;s Talk
							</LinkButton>
							<div className="mt-8 sm:mt-10 lg:mt-14 w-3/4 -mb-[20vw]">
								<AdminScreen />
							</div>
						</div>
					</SectionSeparator>
				</HeroBackground>
			</div>
		</section>
	);
};

export default Hero;
