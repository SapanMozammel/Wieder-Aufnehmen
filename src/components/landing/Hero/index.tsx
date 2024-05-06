import StartiseIcon from '@/components/icons/Startise';
import Image from 'next/image';

const Hero = () => {
	return (
		<section className="min-h-screen flex flex-col py-20">
			<div className="container flex flex-col items-start justify-center gap-6 w-full grow">
				<div className="text-5xl font-eb leading-snug w-full">
					<p className="mb-[0.375em] text-secondary dark:text-light">
						Hay There, I&apos;m
					</p>
					<h1 className="flex items-center justify-start text-[2em] leading-none">
						<span className="relative w-[7em] aspect-[1916/532]">
							<Image
								src="/hero/title.png"
								fill
								alt="Sapan Mozammel."
							/>
						</span>
						<span className="sr-only">Sapan Mozammel.</span>
					</h1>
					<h2 className="text-[0.85em] mt-[0.375em] leading-tight">
						<span className="flex items-center justify-start gap-[0.5em] text-[0.8em] text-secondary dark:text-light">
							I am a Professional
						</span>
						<span className="uppercase font-bold text-[1em] leading-snug tracking-wide">
							Frontend Developer
						</span>
						<span className="flex items-center justify-start gap-[0.5em] text-[0.8em] text-secondary dark:text-light">
							from{' '}
							<StartiseIcon className="!h-[0.9em] text-dark dark:text-white !w-auto" />
							<span className="sr-only">startise.com.</span>
						</span>
					</h2>
				</div>
				<div className="w-48 h-1 rounded-full bg-primary"></div>
				<p className="w-7/12 text-secondary dark:text-light text-base leading-relaxed tracking-wider">
					It is a long established fact that a reader will be
					distracted by the readable content of a page when looking at
					its layout. The point of using Lorem Ipsum is that it has a
					more-or-less normal distribution of letters.
				</p>
				<button className="bg-primary min-h-12 px-8 py-1 inline-flex items-center justify-center rounded-full text-white font-eb">Let&apos;s Talk</button>
			</div>
		</section>
	);
};

export default Hero;
