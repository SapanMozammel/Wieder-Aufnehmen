'use client';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { isMacOS } from '@/lib/utils';
import { MoonIcon, SunIcon, SunMoonIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCallback, useEffect } from 'react';

const ThemeSwitcher = () => {
	const { theme, setTheme } = useTheme();

	const changeTheme = useCallback(
		(value?: string) => {
			const themes = ['system', 'light', 'dark'];
			const themeString = theme as string;
			if (value) {
				return setTheme(themes[themes.indexOf(value.toLowerCase())]);
			}
			return setTheme(
				themes[(themes.indexOf(themeString) + 1) % themes.length]
			);
			// eslint-disable-next-line react-hooks/exhaustive-deps
		},
		[theme, setTheme]
	);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			const baseKey =
				(isMacOS() && event.metaKey) || (!isMacOS() && event.ctrlKey);
			if (
				baseKey &&
				event.altKey &&
				event.code.toLowerCase() === 'KeyT'.toLowerCase()
			) {
				event.preventDefault(); // Prevent default browser behavior if any
				changeTheme();
			}
		},
		[changeTheme]
	);

	useEffect(() => {
		// Add keydown event listener on mount
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			// Clean up event listener on unmount
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [theme, handleKeyDown]);

	const themeIcon = (value: string | undefined) => {
		switch (value) {
			case 'light':
				return <SunIcon />;
			case 'dark':
				return <MoonIcon />;
			case 'system':
			default:
				return <SunMoonIcon />;
		}
	};

	return (
		<DropdownMenu>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger>
						<DropdownMenuTrigger
							className="outline-none h-8 aspect-square inline-flex items-center justify-center cursor-pointer"
							asChild>
							<button>{themeIcon(theme)}</button>
						</DropdownMenuTrigger>
					</TooltipTrigger>
					<TooltipContent align='end' className="border-secondary-400 dark:border-secondary-600">
						<p className="capitalize">{theme} Mode</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
			<DropdownMenuContent
				className="w-56 border-secondary-400 dark:border-secondary-600"
				align="end">
				<DropdownMenuLabel className="flex items-center gap-1">
					<span>Change Theme</span>
					<DropdownMenuShortcut>⌘⎇T</DropdownMenuShortcut>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem
						className="cursor-pointer"
						onClick={() => {
							changeTheme('system');
						}}>
						<SunMoonIcon className="!w-3.5" />
						<span>System Mode</span>
					</DropdownMenuItem>
					<DropdownMenuItem
						className="cursor-pointer"
						onClick={() => {
							changeTheme('light');
						}}>
						<SunIcon className="!w-3.5" />
						<span>Light Mode</span>
					</DropdownMenuItem>
					<DropdownMenuItem
						className="cursor-pointer"
						onClick={() => {
							changeTheme('dark');
						}}>
						<MoonIcon className="!w-3.5" />
						<span>Dark Mode</span>
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ThemeSwitcher;
