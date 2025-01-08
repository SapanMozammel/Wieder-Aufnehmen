import { ButtonProps } from '@/app/types/fieldTypes';

const Button = (
	props: React.DetailedHTMLProps<
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		HTMLButtonElement
	> &
		ButtonProps
) => {
	const { className = '', loading, disabled, ...rest } = props;
	return (
		<button
			className={`bg-primary-600 min-h-12 px-8 py-1 inline-flex items-center justify-center rounded-full text-white font-eb ${className}`}
			disabled={disabled}
			{...rest}>
			<span className="inline-flex items-center justify-center text-current text-xl font-bold tracking-wide drop-shadow-button">
				Let&apos;s Talk !
			</span>
		</button>
	);
};

export default Button;
