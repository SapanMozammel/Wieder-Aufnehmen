'use client';
import { ButtonProps, LinkButtonProps } from '@/app/types/fieldTypes';
import Link, { LinkProps } from 'next/link';

export const Button = (
	props: React.DetailedHTMLProps<
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		HTMLButtonElement
	> &
		ButtonProps
) => {
	const {
		className,
		fill = false,
		children,
		loading,
		disabled,
		...rest
	} = props;

	return (
		<button
			className={`relative inline-flex items-center justify-center !h-9 sm:!h-11 !px-[calc(theme(height.9)*21/44)] sm:!px-[calc(theme(height.11)*21/44)] group/button ${
				className ?? ''
			}`}
			disabled={disabled}
			{...rest}>
			{fill ? (
				<>
					<svg
						className="absolute inset-y-0 left-0 h-full aspect-21/44"
						viewBox="0 0 21 44">
						<path
							className="fill-dark dark:fill-white stroke-dark dark:stroke-white group-hover/button:fill-primary-600 group-hover/button:stroke-primary-600 dark:group-hover/button:fill-warning dark:group-hover/button:stroke-warning group-disabled/button:!fill-secondary-400 group-disabled/button:!stroke-secondary-400 duration-150"
							strokeWidth="2"
							d="M22,43.00005 L8.11111,43.00005 C4.18375,43.00005 1,39.58105 1,35.36365 L1,8.63637 C1,4.41892 4.18375,1 8.11111,1 L21,1"></path>
					</svg>
					<span className="relative h-full">
						<span className="relative z-1 h-full inline-flex items-center justify-center px-[0.5em] text-xs sm:text-sm uppercase font-eb font-bold tracking-wider text-white dark:text-dark group-hover/button:text-white group-disabled/button:!text-secondary-500">
							{children}
						</span>
						<svg
							className="absolute top-0 w-full h-full"
							viewBox="0 0 100 44"
							preserveAspectRatio="none">
							<polygon
								className="fill-dark dark:fill-white group-hover/button:fill-primary-600 dark:group-hover/button:fill-warning group-disabled/button:!fill-secondary-400 duration-150"
								fillRule="nonzero"
								points="101 0 101 44 0 44 0 0"></polygon>
						</svg>
					</span>
					<svg
						className="absolute inset-y-0 right-0 h-full aspect-21/44"
						viewBox="0 0 21 44">
						<path
							className="fill-dark dark:fill-white stroke-dark dark:stroke-white group-hover/button:fill-primary-600 group-hover/button:stroke-primary-600 dark:group-hover/button:fill-warning dark:group-hover/button:stroke-warning group-disabled/button:!fill-secondary-400 group-disabled/button:!stroke-secondary-400 duration-150"
							strokeWidth="2"
							d="M0,43.00005 L5.028,43.00005 L12.24,43.00005 C16.526,43.00005 20,39.58105 20,35.36365 L20,16.85855 C20,14.59295 18.978,12.44425 17.209,10.99335 L7.187,2.77111 C5.792,1.62675 4.034,1 2.217,1 L0,1"></path>
					</svg>
				</>
			) : (
				<>
					<svg
						className="absolute inset-y-0 left-0 h-full aspect-21/44"
						viewBox="0 0 21 44">
						<linearGradient
							id="btn-left"
							x1="50%"
							x2="50%"
							y1="0%"
							y2="100%">
							<stop offset="0%" stopColor="var(--success)" />
							<stop offset="100%" stopColor="var(--primary)" />
						</linearGradient>
						<path
							className="fill-none stroke-[url(#btn-left)] group-disabled/button:!stroke-secondary-400"
							strokeWidth="2"
							d="M22,43.00005 L8.11111,43.00005 C4.18375,43.00005 1,39.58105 1,35.36365 L1,8.63637 C1,4.41892 4.18375,1 8.11111,1 L21,1"></path>
					</svg>
					<span className="relative h-full">
						<span className="relative z-1 h-full inline-flex items-center justify-center px-[0.5em] text-xs sm:text-sm uppercase font-eb font-bold tracking-wider text-dark dark:text-white group-disabled/button:!text-secondary-500">
							{children}
						</span>
						<svg
							className="absolute top-0 w-full h-full"
							viewBox="0 0 100 44"
							preserveAspectRatio="none"
							fill="none">
							<linearGradient
								id="btn-bottom"
								x1="100%"
								x2="0%"
								y1="50%"
								y2="50%">
								<stop offset="0%" stopColor="var(--danger)" />
								<stop
									offset="100%"
									stopColor="var(--primary)"
								/>
							</linearGradient>
							<linearGradient
								id="btn-top"
								x1="100%"
								x2="0%"
								y1="50%"
								y2="50%">
								<stop offset="0%" stopColor="var(--info)" />
								<stop
									offset="100%"
									stopColor="var(--success)"
								/>
							</linearGradient>
							<polygon
								className="fill-[url(#btn-top)] group-disabled/button:fill-secondary-400"
								fillRule="nonzero"
								points="101 0 101 2 0 2 0 0"></polygon>
							<polygon
								className="fill-[url(#btn-bottom)] group-disabled/button:fill-secondary-400"
								fillRule="nonzero"
								points="101 42 101 44 0 44 0 42"></polygon>
						</svg>
					</span>
					<svg
						className="absolute inset-y-0 right-0 h-full aspect-21/44"
						viewBox="0 0 21 44">
						<linearGradient
							id="btn-right"
							x1="14.635%"
							x2="14.635%"
							y1="0%"
							y2="100%">
							<stop offset="0%" stopColor="var(--info)" />
							<stop offset="100%" stopColor="var(--danger)" />
						</linearGradient>
						<path
							className="fill-none stroke-[url(#btn-right)] group-disabled/button:!stroke-secondary-400"
							strokeWidth="2"
							d="M0,43.00005 L5.028,43.00005 L12.24,43.00005 C16.526,43.00005 20,39.58105 20,35.36365 L20,16.85855 C20,14.59295 18.978,12.44425 17.209,10.99335 L7.187,2.77111 C5.792,1.62675 4.034,1 2.217,1 L0,1"></path>
					</svg>
				</>
			)}
		</button>
	);
};

export const LinkButton = (
	props: React.AnchorHTMLAttributes<HTMLAnchorElement> &
		LinkButtonProps &
		Pick<LinkProps, 'href'>
) => {
	const { className, fill = false, children, loading, href, ...rest } = props;

	return (
		<Link
			className={`relative inline-flex items-center justify-center !h-9 sm:!h-11 !px-[calc(theme(height.9)*21/44)] sm:!px-[calc(theme(height.11)*21/44)] group/link-button ${
				className ?? ''
			}`}
			href={href}
			{...rest}>
			{fill ? (
				<>
					<svg
						className="absolute inset-y-0 left-0 h-full aspect-21/44"
						viewBox="0 0 21 44">
						<path
							className="fill-dark dark:fill-white stroke-dark dark:stroke-white group-hover/link-button:fill-primary-600 group-hover/link-button:stroke-primary-600 dark:group-hover/link-button:fill-warning dark:group-hover/link-button:stroke-warning group-disabled/link-button:!fill-secondary-400 group-disabled/link-button:!stroke-secondary-400 duration-150"
							strokeWidth="2"
							d="M22,43.00005 L8.11111,43.00005 C4.18375,43.00005 1,39.58105 1,35.36365 L1,8.63637 C1,4.41892 4.18375,1 8.11111,1 L21,1"></path>
					</svg>
					<span className="relative h-full">
						<span className="relative z-1 h-full inline-flex items-center justify-center px-[0.5em] text-xs sm:text-sm uppercase font-eb font-bold tracking-wider text-white dark:text-dark group-hover/link-button:text-white group-disabled/link-button:!text-secondary-500">
							{children}
						</span>
						<svg
							className="absolute top-0 w-full h-full"
							viewBox="0 0 100 44"
							preserveAspectRatio="none">
							<polygon
								className="fill-dark dark:fill-white group-hover/link-button:fill-primary-600 dark:group-hover/link-button:fill-warning group-disabled/link-button:!fill-secondary-400 duration-150"
								fillRule="nonzero"
								points="101 0 101 44 0 44 0 0"></polygon>
						</svg>
					</span>
					<svg
						className="absolute inset-y-0 right-0 h-full aspect-21/44"
						viewBox="0 0 21 44">
						<path
							className="fill-dark dark:fill-white stroke-dark dark:stroke-white group-hover/link-button:fill-primary-600 group-hover/link-button:stroke-primary-600 dark:group-hover/link-button:fill-warning dark:group-hover/link-button:stroke-warning group-disabled/link-button:!fill-secondary-400 group-disabled/link-button:!stroke-secondary-400 duration-150"
							strokeWidth="2"
							d="M0,43.00005 L5.028,43.00005 L12.24,43.00005 C16.526,43.00005 20,39.58105 20,35.36365 L20,16.85855 C20,14.59295 18.978,12.44425 17.209,10.99335 L7.187,2.77111 C5.792,1.62675 4.034,1 2.217,1 L0,1"></path>
					</svg>
				</>
			) : (
				<>
					<svg
						className="absolute inset-y-0 left-0 h-full aspect-21/44"
						viewBox="0 0 21 44">
						<linearGradient
							id="btn-left"
							x1="50%"
							x2="50%"
							y1="0%"
							y2="100%">
							<stop offset="0%" stopColor="var(--success)" />
							<stop offset="100%" stopColor="var(--primary)" />
						</linearGradient>
						<path
							className="fill-none stroke-[url(#btn-left)] group-disabled/link-button:!stroke-secondary-400"
							strokeWidth="2"
							d="M22,43.00005 L8.11111,43.00005 C4.18375,43.00005 1,39.58105 1,35.36365 L1,8.63637 C1,4.41892 4.18375,1 8.11111,1 L21,1"></path>
					</svg>
					<span className="relative h-full">
						<span className="relative z-1 h-full inline-flex items-center justify-center px-[0.5em] text-xs sm:text-sm uppercase font-eb font-bold tracking-wider text-dark dark:text-white group-disabled/link-button:!text-secondary-500">
							{children}
						</span>
						<svg
							className="absolute top-0 w-full h-full"
							viewBox="0 0 100 44"
							preserveAspectRatio="none"
							fill="none">
							<linearGradient
								id="btn-bottom"
								x1="100%"
								x2="0%"
								y1="50%"
								y2="50%">
								<stop offset="0%" stopColor="var(--danger)" />
								<stop
									offset="100%"
									stopColor="var(--primary)"
								/>
							</linearGradient>
							<linearGradient
								id="btn-top"
								x1="100%"
								x2="0%"
								y1="50%"
								y2="50%">
								<stop offset="0%" stopColor="var(--info)" />
								<stop
									offset="100%"
									stopColor="var(--success)"
								/>
							</linearGradient>
							<polygon
								className="fill-[url(#btn-top)] group-disabled/link-button:fill-secondary-400"
								fillRule="nonzero"
								points="101 0 101 2 0 2 0 0"></polygon>
							<polygon
								className="fill-[url(#btn-bottom)] group-disabled/link-button:fill-secondary-400"
								fillRule="nonzero"
								points="101 42 101 44 0 44 0 42"></polygon>
						</svg>
					</span>
					<svg
						className="absolute inset-y-0 right-0 h-full aspect-21/44"
						viewBox="0 0 21 44">
						<linearGradient
							id="btn-right"
							x1="14.635%"
							x2="14.635%"
							y1="0%"
							y2="100%">
							<stop offset="0%" stopColor="var(--info)" />
							<stop offset="100%" stopColor="var(--danger)" />
						</linearGradient>
						<path
							className="fill-none stroke-[url(#btn-right)] group-disabled/link-button:!stroke-secondary-400"
							strokeWidth="2"
							d="M0,43.00005 L5.028,43.00005 L12.24,43.00005 C16.526,43.00005 20,39.58105 20,35.36365 L20,16.85855 C20,14.59295 18.978,12.44425 17.209,10.99335 L7.187,2.77111 C5.792,1.62675 4.034,1 2.217,1 L0,1"></path>
					</svg>
				</>
			)}
		</Link>
	);
};
