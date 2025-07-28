'use client';
import { ButtonProps, LinkButtonProps } from '@/types/button';
import Link, { LinkProps } from 'next/link';

export const Button = (props: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & ButtonProps) => {
	const { className, fill = false, children, loading, disabled, ...rest } = props;

	return (
		<button
			className={`group/button relative inline-flex !h-9 items-center justify-center !px-[calc(theme(height.9)*21/44)] sm:!h-11 sm:!px-[calc(theme(height.11)*21/44)] ${className ?? ''}`}
			disabled={disabled}
			{...rest}
		>
			{fill ? (
				<>
					<svg className='absolute inset-y-0 left-0 aspect-21/44 h-full' viewBox='0 0 21 44'>
						<path
							className='fill-dark stroke-dark group-hover/button:fill-primary group-hover/button:stroke-primary dark:group-hover/button:fill-success dark:group-hover/button:stroke-success group-disabled/button:!fill-secondary-400 group-disabled/button:!stroke-secondary-400 duration-150 dark:fill-white dark:stroke-white'
							strokeWidth='2'
							d='M22,43.00005 L8.11111,43.00005 C4.18375,43.00005 1,39.58105 1,35.36365 L1,8.63637 C1,4.41892 4.18375,1 8.11111,1 L21,1'
						/>
					</svg>
					<span className='relative h-full'>
						<span className='font-eb dark:text-dark group-disabled/button:!text-secondary-500 relative z-1 inline-flex h-full items-center justify-center px-[0.5em] text-xs font-bold tracking-wider text-white uppercase group-hover/button:text-white sm:text-sm'>
							{children}
						</span>
						<svg className='absolute top-0 h-full w-full' viewBox='0 0 100 44' preserveAspectRatio='none'>
							<polygon
								className='fill-dark group-hover/button:fill-primary dark:group-hover/button:fill-success group-disabled/button:!fill-secondary-400 duration-150 dark:fill-white'
								fillRule='nonzero'
								points='101 0 101 44 0 44 0 0'
							/>
						</svg>
					</span>
					<svg className='absolute inset-y-0 right-0 aspect-21/44 h-full' viewBox='0 0 21 44'>
						<path
							className='fill-dark stroke-dark group-hover/button:fill-primary group-hover/button:stroke-primary dark:group-hover/button:fill-success dark:group-hover/button:stroke-success group-disabled/button:!fill-secondary-400 group-disabled/button:!stroke-secondary-400 duration-150 dark:fill-white dark:stroke-white'
							strokeWidth='2'
							d='M0,43.00005 L5.028,43.00005 L12.24,43.00005 C16.526,43.00005 20,39.58105 20,35.36365 L20,16.85855 C20,14.59295 18.978,12.44425 17.209,10.99335 L7.187,2.77111 C5.792,1.62675 4.034,1 2.217,1 L0,1'
						/>
					</svg>
				</>
			) : (
				<>
					<svg className='absolute inset-y-0 left-0 aspect-21/44 h-full' viewBox='0 0 21 44'>
						<linearGradient id='btn-left' x1='50%' x2='50%' y1='0%' y2='100%'>
							<stop offset='0%' stopColor='var(--color-success)' />
							<stop offset='100%' stopColor='var(--color-primary)' />
						</linearGradient>
						<path
							className='group-disabled/button:!stroke-secondary-400 fill-none stroke-[url(#btn-left)]'
							strokeWidth='2'
							d='M22,43.00005 L8.11111,43.00005 C4.18375,43.00005 1,39.58105 1,35.36365 L1,8.63637 C1,4.41892 4.18375,1 8.11111,1 L21,1'
						/>
					</svg>
					<span className='relative h-full'>
						<span className='font-eb text-dark group-disabled/button:!text-secondary-500 relative z-1 inline-flex h-full items-center justify-center px-[0.5em] text-xs font-bold tracking-wider uppercase sm:text-sm dark:text-white'>
							{children}
						</span>
						<svg className='absolute top-0 h-full w-full' viewBox='0 0 100 44' preserveAspectRatio='none' fill='none'>
							<linearGradient id='btn-bottom' x1='100%' x2='0%' y1='50%' y2='50%'>
								<stop offset='0%' stopColor='var(--color-danger)' />
								<stop offset='100%' stopColor='var(--color-primary)' />
							</linearGradient>
							<linearGradient id='btn-top' x1='100%' x2='0%' y1='50%' y2='50%'>
								<stop offset='0%' stopColor='var(--color-info)' />
								<stop offset='100%' stopColor='var(--color-success)' />
							</linearGradient>
							<polygon className='group-disabled/button:fill-secondary-400 fill-[url(#btn-top)]' fillRule='nonzero' points='101 0 101 2 0 2 0 0' />
							<polygon className='group-disabled/button:fill-secondary-400 fill-[url(#btn-bottom)]' fillRule='nonzero' points='101 42 101 44 0 44 0 42' />
						</svg>
					</span>
					<svg className='absolute inset-y-0 right-0 aspect-21/44 h-full' viewBox='0 0 21 44'>
						<linearGradient id='btn-right' x1='14.635%' x2='14.635%' y1='0%' y2='100%'>
							<stop offset='0%' stopColor='var(--color-info)' />
							<stop offset='100%' stopColor='var(--color-danger)' />
						</linearGradient>
						<path
							className='group-disabled/button:!stroke-secondary-400 fill-none stroke-[url(#btn-right)]'
							strokeWidth='2'
							d='M0,43.00005 L5.028,43.00005 L12.24,43.00005 C16.526,43.00005 20,39.58105 20,35.36365 L20,16.85855 C20,14.59295 18.978,12.44425 17.209,10.99335 L7.187,2.77111 C5.792,1.62675 4.034,1 2.217,1 L0,1'
						/>
					</svg>
				</>
			)}
		</button>
	);
};

export const LinkButton = (props: React.AnchorHTMLAttributes<HTMLAnchorElement> & LinkButtonProps & Pick<LinkProps, 'href'>) => {
	const { className, fill = false, children, loading, href, ...rest } = props;

	return (
		<Link
			className={`group/link-button relative inline-flex !h-9 items-center justify-center !px-[calc(theme(height.9)*21/44)] sm:!h-11 sm:!px-[calc(theme(height.11)*21/44)] ${className ?? ''}`}
			href={href}
			{...rest}
		>
			{fill ? (
				<>
					<svg className='absolute inset-y-0 left-0 aspect-21/44 h-full' viewBox='0 0 21 44'>
						<path
							className='fill-dark stroke-dark group-hover/link-button:fill-primary group-hover/link-button:stroke-primary dark:group-hover/link-button:fill-success dark:group-hover/link-button:stroke-success group-disabled/link-button:!fill-secondary-400 group-disabled/link-button:!stroke-secondary-400 duration-150 dark:fill-white dark:stroke-white'
							strokeWidth='2'
							d='M22,43.00005 L8.11111,43.00005 C4.18375,43.00005 1,39.58105 1,35.36365 L1,8.63637 C1,4.41892 4.18375,1 8.11111,1 L21,1'
						/>
					</svg>
					<span className='relative h-full'>
						<span className='font-eb dark:text-dark group-disabled/link-button:!text-secondary-500 relative z-1 inline-flex h-full items-center justify-center px-[0.5em] text-xs font-bold tracking-wider text-white uppercase group-hover/link-button:text-white sm:text-sm'>
							{children}
						</span>
						<svg className='absolute top-0 h-full w-full' viewBox='0 0 100 44' preserveAspectRatio='none'>
							<polygon
								className='fill-dark group-hover/link-button:fill-primary dark:group-hover/link-button:fill-success group-disabled/link-button:!fill-secondary-400 duration-150 dark:fill-white'
								fillRule='nonzero'
								points='101 0 101 44 0 44 0 0'
							/>
						</svg>
					</span>
					<svg className='absolute inset-y-0 right-0 aspect-21/44 h-full' viewBox='0 0 21 44'>
						<path
							className='fill-dark stroke-dark group-hover/link-button:fill-primary group-hover/link-button:stroke-primary dark:group-hover/link-button:fill-success dark:group-hover/link-button:stroke-success group-disabled/link-button:!fill-secondary-400 group-disabled/link-button:!stroke-secondary-400 duration-150 dark:fill-white dark:stroke-white'
							strokeWidth='2'
							d='M0,43.00005 L5.028,43.00005 L12.24,43.00005 C16.526,43.00005 20,39.58105 20,35.36365 L20,16.85855 C20,14.59295 18.978,12.44425 17.209,10.99335 L7.187,2.77111 C5.792,1.62675 4.034,1 2.217,1 L0,1'
						/>
					</svg>
				</>
			) : (
				<>
					<svg className='absolute inset-y-0 left-0 aspect-21/44 h-full' viewBox='0 0 21 44'>
						<linearGradient id='btn-left' x1='50%' x2='50%' y1='0%' y2='100%'>
							<stop offset='0%' stopColor='var(--color-success)' />
							<stop offset='100%' stopColor='var(--color-primary)' />
						</linearGradient>
						<path
							className='group-disabled/link-button:!stroke-secondary-400 fill-none stroke-[url(#btn-left)]'
							strokeWidth='2'
							d='M22,43.00005 L8.11111,43.00005 C4.18375,43.00005 1,39.58105 1,35.36365 L1,8.63637 C1,4.41892 4.18375,1 8.11111,1 L21,1'
						/>
					</svg>
					<span className='relative h-full'>
						<span className='font-eb text-dark group-disabled/link-button:!text-secondary-500 relative z-1 inline-flex h-full items-center justify-center px-[0.5em] text-xs font-bold tracking-wider uppercase sm:text-sm dark:text-white'>
							{children}
						</span>
						<svg className='absolute top-0 h-full w-full' viewBox='0 0 100 44' preserveAspectRatio='none' fill='none'>
							<linearGradient id='btn-bottom' x1='100%' x2='0%' y1='50%' y2='50%'>
								<stop offset='0%' stopColor='var(--color-danger)' />
								<stop offset='100%' stopColor='var(--color-primary)' />
							</linearGradient>
							<linearGradient id='btn-top' x1='100%' x2='0%' y1='50%' y2='50%'>
								<stop offset='0%' stopColor='var(--color-info)' />
								<stop offset='100%' stopColor='var(--color-success)' />
							</linearGradient>
							<polygon className='group-disabled/link-button:fill-secondary-400 fill-[url(#btn-top)]' fillRule='nonzero' points='101 0 101 2 0 2 0 0' />
							<polygon className='group-disabled/link-button:fill-secondary-400 fill-[url(#btn-bottom)]' fillRule='nonzero' points='101 42 101 44 0 44 0 42' />
						</svg>
					</span>
					<svg className='absolute inset-y-0 right-0 aspect-21/44 h-full' viewBox='0 0 21 44'>
						<linearGradient id='btn-right' x1='14.635%' x2='14.635%' y1='0%' y2='100%'>
							<stop offset='0%' stopColor='var(--color-info)' />
							<stop offset='100%' stopColor='var(--color-danger)' />
						</linearGradient>
						<path
							className='group-disabled/link-button:!stroke-secondary-400 fill-none stroke-[url(#btn-right)]'
							strokeWidth='2'
							d='M0,43.00005 L5.028,43.00005 L12.24,43.00005 C16.526,43.00005 20,39.58105 20,35.36365 L20,16.85855 C20,14.59295 18.978,12.44425 17.209,10.99335 L7.187,2.77111 C5.792,1.62675 4.034,1 2.217,1 L0,1'
						/>
					</svg>
				</>
			)}
		</Link>
	);
};
