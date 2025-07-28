import { SeparatorTypes } from '@/types/separator';
import { Plus } from 'lucide-react';
import React from 'react';

const SectionSeparator = (props: React.DetailedHTMLProps<React.AllHTMLAttributes<HTMLDivElement>, HTMLDivElement> & SeparatorTypes) => {
	const { lts = false, rts = false, lbs = false, rbs = false, tl = false, bl = false, ll = false, rl = false, className, children, ...rest } = props;

	const starClasses = 'w-3 md:w-4 text-primary dark:text-success z-1';
	const lineClasses = 'border-solid border-secondary-400 dark:border-secondary-600';

	return (
		<React.Fragment>
			<div className={`section-separator pointer-events-none select-none ${className ?? ''}`} {...rest}>
				{lts ? <Plus strokeWidth={6} className={`${starClasses} absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2`} /> : <></>}
				{rts ? <Plus strokeWidth={6} className={`${starClasses} absolute top-0 right-0 translate-x-1/2 -translate-y-1/2`} /> : <></>}
				{lbs ? <Plus strokeWidth={6} className={`${starClasses} absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2`} /> : <></>}
				{rbs ? <Plus strokeWidth={6} className={`${starClasses} absolute right-0 bottom-0 translate-x-1/2 translate-y-1/2`} /> : <></>}
				{tl ? <span className={`${lineClasses} absolute inset-x-0 top-0 -translate-y-1/2 border-t`} /> : <></>}
				{bl ? <span className={`${lineClasses} absolute inset-x-0 bottom-0 translate-y-1/2 border-b`} /> : <></>}
				{ll ? <span className={`${lineClasses} absolute inset-y-0 left-0 -translate-x-1/2 border-l`} /> : <></>}
				{rl ? <span className={`${lineClasses} absolute inset-y-0 right-0 translate-x-1/2 border-r`} /> : <></>}
			</div>
			{children}
		</React.Fragment>
	);
};

export default SectionSeparator;
