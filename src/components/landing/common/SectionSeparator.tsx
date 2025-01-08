import { SeparatorTypes } from '@/app/types/accessoriesTypes';
import { Plus } from 'lucide-react';
import React from 'react';

const SectionSeparator = (
	props: React.DetailedHTMLProps<
		React.AllHTMLAttributes<HTMLDivElement>,
		HTMLDivElement
	> &
		SeparatorTypes
) => {
	const {
		lts = false,
		rts = false,
		lbs = false,
		rbs = false,
		tl = false,
		bl = false,
		ll = false,
		rl = false,
		className,
		children,
		...rest
	} = props;

	const starClasses = 'w-3 md:w-4 text-primary-600 dark:text-warning-light z-1';
	const lineClasses =
		'border-solid border-secondary-400 dark:border-secondary-600';

	return (
		<React.Fragment>
			<div
				className={`${className} section-separator pointer-events-none select-none`}
				{...rest}>
				{lts ? (
					<Plus
						strokeWidth={6}
						className={`${starClasses} absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2`}
					/>
				) : (
					<></>
				)}
				{rts ? (
					<Plus
						strokeWidth={6}
						className={`${starClasses} absolute right-0 top-0 translate-x-1/2 -translate-y-1/2`}
					/>
				) : (
					<></>
				)}
				{lbs ? (
					<Plus
						strokeWidth={6}
						className={`${starClasses} absolute left-0 bottom-0 -translate-x-1/2 translate-y-1/2`}
					/>
				) : (
					<></>
				)}
				{rbs ? (
					<Plus
						strokeWidth={6}
						className={`${starClasses} absolute right-0 bottom-0 translate-x-1/2 translate-y-1/2`}
					/>
				) : (
					<></>
				)}
				{tl ? (
					<span
						className={`${lineClasses} absolute border-t top-0 inset-x-0 -translate-y-1/2`}
					/>
				) : (
					<></>
				)}
				{bl ? (
					<span
						className={`${lineClasses} absolute border-b bottom-0 inset-x-0 translate-y-1/2`}
					/>
				) : (
					<></>
				)}
				{ll ? (
					<span
						className={`${lineClasses} absolute border-l left-0 inset-y-0 -translate-x-1/2`}
					/>
				) : (
					<></>
				)}
				{rl ? (
					<span
						className={`${lineClasses} absolute border-r right-0 inset-y-0 translate-x-1/2`}
					/>
				) : (
					<></>
				)}
			</div>
			{children}
		</React.Fragment>
	);
};

export default SectionSeparator;
