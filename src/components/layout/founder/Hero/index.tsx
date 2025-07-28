import { LinkButton } from '@/components/layout/founder/common/Button';
import SectionSeparator from '@/components/layout/founder/common/SectionSeparator';
import TextUnderline from '@/components/layout/founder/common/TextUnderline';
import AdminScreen from '@/components/layout/founder/Hero/AdminScreen';
import HeroBackground from '@/components/layout/founder/Hero/HeroBackground';

const Hero = () => {
	return (
		<section className='flex flex-col pt-20'>
			<div className='relative z-2 flex grow flex-col'>
				<HeroBackground>
					<SectionSeparator lts rts lbs rbs bl ll rl>
						<div className='container flex w-full grow flex-col items-center justify-center gap-4 pt-16 text-center sm:pt-24 lg:pt-32'>
							<h1 className='sr-only'>
								Hi, I am Sapan Mozammel, <br /> a fullstack frontend developer.
							</h1>
							<h2 className='font-hg dark:from-slat-600 dark:via-light inline-block bg-radial from-slate-500 via-black via-45% to-slate-500 to-75% bg-clip-text text-lg !leading-tight font-extrabold text-transparent sm:text-4xl lg:text-5xl dark:to-slate-400'>
								With every line of <TextUnderline className='text-black dark:text-white'>JavaScript</TextUnderline>
								, <br /> shaping the future of web development.
							</h2>
							<p className='text-secondary-600 dark:text-secondary-400 inline-flex max-w-[90ch] text-sm !leading-relaxed tracking-wider sm:text-base'>
								With 5+ years of dynamic experience building applications using React, Redux, GraphQL, Next.js, Three.js, Node.js and many more, I take pride in writing clean, maintainable code while
								adhering to engineering best practices.
							</p>
							<LinkButton href='/' target='_blank' className='mt-0 sm:mt-4' fill>
								Let&apos;s Talk
							</LinkButton>
							<div className='mt-4 -mb-[20vw] w-3/4 sm:mt-10 lg:mt-14'>
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
