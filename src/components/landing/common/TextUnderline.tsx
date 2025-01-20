import React from 'react';

const TextUnderline = (
	props: React.DetailedHTMLProps<
		React.AllHTMLAttributes<HTMLDivElement>,
		HTMLDivElement
	>
) => {
	const { children, className, ...rest } = props;
	return (
		<span className={`relative ${className ?? ''}`} {...rest}>
			{children}
			<svg
				className="absolute inset-x-0 -bottom-[0.25em] aspect-[372/32]"
				viewBox="0 0 372 32">
				<g clipPath="url(#clip0_1682_152)">
					<path
						fill="url(#paint0_linear_1682_152)"
						d="M372 7.009c-4.59.905-8.865 2.09-13.227 2.543-28.469 2.957-56.925 6.074-85.452 8.524-25.009 2.158-50.104 3.476-75.157 5.26-9.766.693-19.546 1.373-29.256 2.545-9.28 1.118-17.759-.32-25.595-5.035-13.87-8.35-29.557-10.508-45.271-8.896-20.763 2.13-41.425 5.633-61.888 9.589-9.223 1.784-17.845 6.166-26.825 9.163-2.688.905-6.349 2.97-7.836-1.319-2.145-6.126-2.53-7.75 2.603-9.429C34.925 9.792 66.583 3.293 99.243 1.668 115.9.842 131.916 3.48 146.587 11.723c7.636 4.289 16.416 4.022 25.052 3.463 18.818-1.212 37.679-2.104 56.468-3.636 29.342-2.397 58.655-5.207 87.983-7.884 9.724-.88 19.418-1.945 29.142-2.797 5.248-.453 10.51-.786 15.772-.866 4.762-.08 8.837 1.252 10.996 7.019z"></path>
				</g>
				<defs>
					<linearGradient
						id="paint0_linear_1682_152"
						x1="0"
						x2="372"
						y1="16"
						y2="16"
						gradientUnits="userSpaceOnUse">
						<stop stopColor="#1f8fff"></stop>
						<stop offset="1" stopColor="#41EAD4"></stop>
					</linearGradient>
					<clipPath id="clip0_1682_152">
						<path fill="#fff" d="M0 0h372v32H0z"></path>
					</clipPath>
				</defs>
			</svg>
		</span>
	);
};

export default TextUnderline;
