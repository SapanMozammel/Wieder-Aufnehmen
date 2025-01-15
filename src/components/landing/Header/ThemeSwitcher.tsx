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
import { MonitorIcon, MoonStarIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCallback, useEffect } from 'react';

const ThemeSwitcher = () => {
	const { theme, setTheme, systemTheme } = useTheme();

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

	console.log(systemTheme);

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
		if (theme === 'light') return <SunIcon className="w-5" />;
		if (theme === 'dark') return <MoonStarIcon className="w-4" />;
		return systemTheme === 'light' ? (
			<SunIcon className="w-5" />
		) : (
			<MoonStarIcon className="w-4" />
		);
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
					<TooltipContent
						align="end"
						className="border-secondary-400 dark:border-secondary-600">
						<p className="capitalize">{theme} Theme</p>
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
							changeTheme('light');
						}}>
						<SunIcon />
						<span>Light Theme</span>
					</DropdownMenuItem>
					<DropdownMenuItem
						className="cursor-pointer"
						onClick={() => {
							changeTheme('dark');
						}}>
						<MoonStarIcon />
						<span>Dark Theme</span>
					</DropdownMenuItem>
					<DropdownMenuItem
						className="cursor-pointer"
						onClick={() => {
							changeTheme('system');
						}}>
						<MonitorIcon />
						<span>System Theme</span>
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ThemeSwitcher;
