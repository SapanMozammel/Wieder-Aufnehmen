import Pattern from '@/components/icons/Pattern';
import WorldMap from '@/components/icons/WorldMap';
import React from 'react';

const HeroBackground = (
	props: React.DetailedHTMLProps<
		React.AllHTMLAttributes<HTMLDivElement>,
		HTMLDivElement
	>
) => {
	const { children, className, ...rest } = props;
	return (
		<React.Fragment>
			{children}
			<div
				className={`${className} absolute inset-0 -z-2 pointer-events-none select-none overflow-hidden`}
				{...rest}>
				<div className="absolute inset-0 flex items-center justify-center">
					<WorldMap className="h-full w-auto fill-secondary-100 dark:fill-gray-500/25" />
				</div>
				<div className="absolute inset-0 flex items-center justify-center">
					<Pattern className="h-full w-auto text-secondary-700 dark:text-secondary-400" />
				</div>
				<div className="absolute h-256 aspect-square top-1/2 left-1/2 bg-gradient-radial from-info-500/50 via-info-500/15 via-40% to-transparent to-60% -translate-x-1/2 -translate-y-1/2"></div>
			</div>
		</React.Fragment>
	);
};

export default HeroBackground;
