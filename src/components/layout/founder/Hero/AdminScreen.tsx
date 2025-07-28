import Cloud from '@/components/icons/Cloud';
import {
	ArchiveIcon,
	ArchiveXIcon,
	BoxIcon,
	BugIcon,
	ChevronDownIcon,
	EllipsisVerticalIcon,
	FileIcon,
	InboxIcon,
	ListFilterIcon,
	LogOutIcon,
	MessagesSquareIcon,
	RedoIcon,
	SlidersHorizontalIcon,
	ToggleLeftIcon,
	Trash2Icon,
	TreePineIcon,
	UndoDotIcon,
	UndoIcon,
	UsersIcon,
} from 'lucide-react';

const menuItems = [
	{
		title: 'Projects',
		icon: <BoxIcon className='h-[1.1em] w-[1.1em]' />,
	},
	{
		title: 'Index',
		icon: <InboxIcon className='h-[1.1em] w-[1.1em]' />,
	},
	{
		title: 'Promotions',
		icon: <MessagesSquareIcon className='h-[1.1em] w-[1.1em]' />,
	},
	{
		title: 'Teams',
		icon: <UsersIcon className='h-[1.1em] w-[1.1em]' />,
	},
	{
		title: 'My Issues',
		icon: <BugIcon className='h-[1.1em] w-[1.1em]' />,
	},
	{
		title: 'Junk',
		icon: <ArchiveXIcon className='h-[1.1em] w-[1.1em]' />,
	},
	{
		title: 'Drafts',
		icon: <FileIcon className='h-[1.1em] w-[1.1em]' />,
	},
	{
		title: 'Archive',
		icon: <ArchiveIcon className='h-[1.1em] w-[1.1em]' />,
	},
	{
		title: 'Logout',
		icon: <LogOutIcon className='h-[1.1em] w-[1.1em]' />,
	},
];

const inboxList = [
	{
		name: 'William Smith',
		email: 'williamsmith@example.com',
		title: 'Meeting Tomorrow',
		time: '5 hours ago',
		tags: ['meeting', 'work', 'important'],
		message: `Hi! Lets's have a meeting tomorrow to discuss the project. I've been reviewing the project details and have some ideas I'd like to share. It's crucial that we align on our next steps to ensure the project success. <br /> <br />Please come prepared with any questions or insights you may have. Looking forward to our meeting! <br /> <br /> Best regards, William`,
		status: 'read',
	},
	{
		name: 'Olivia Martinez',
		email: 'oliviamartinez@example.com',
		title: 'Feedback on UI Designs',
		time: '6 hours ago',
		tags: ['design', 'feedback', 'ui'],
		message: `Hi Team, I’ve reviewed the UI designs shared earlier and added some comments for improvement. Please take a look and share your thoughts before the client presentation. <br /> <br />Thanks, Olivia`,
		status: 'unread',
	},
	{
		name: 'Charlotte Lee',
		email: 'charlottelee@example.com',
		title: 'Project Proposal Review',
		time: '2 day ago',
		tags: ['proposal', 'review', 'high-priority'],
		message: `Hello, I have attached the project proposal for your review. Please provide feedback and let me know if there are any changes required. I’d like to finalize this by the end of the week. <br /> <br />Thanks, Sophia`,
		status: 'read',
	},
	{
		name: 'Sophia Johnson',
		email: 'sophiajohnson@example.com',
		title: 'Team Outing Plans',
		time: '3 days ago',
		tags: ['team', 'outing', 'social'],
		message: `Hey Everyone, Let’s finalize the plans for the team outing this Friday. Please RSVP by tomorrow evening so we can make necessary arrangements. <br /> <br />Cheers, Charlotte`,
		status: 'unread',
	},
	{
		name: 'Daniel Miller',
		email: 'danielmiller@example.com',
		title: 'Onboarding New Team Member',
		time: '1 week ago',
		tags: ['onboarding', 'team', 'new-hire'],
		message: `Hi Everyone, Please welcome our new team member, Sarah. She will be joining as a backend developer. Let’s ensure a smooth onboarding process for her. <br /> <br />Regards, Daniel`,
		status: 'unread',
	},
	{
		name: 'Michael Brown',
		email: 'michaelbrown@example.com',
		title: 'Weekly Progress Update',
		time: '2 weeks ago',
		tags: ['update', 'progress', 'weekly'],
		message: `Good morning, Please find the attached weekly progress report for the current sprint. Let me know if you have any questions or need additional details. <br /> <br /> Regards, Michael`,
		status: 'read',
	},
];

const AdminScreen = () => {
	return (
		<div className='group/admin-dashboard relative aspect-[16/10] w-full text-left text-[0.75vw] !font-light text-black dark:text-white'>
			<div className='bg-light/20 dark:bg-dark/20 border-info/30 shadow-info/10 pointer-events-none flex h-full w-full rounded-[0.6em] border-[0.025em] border-solid shadow-lg backdrop-blur transition-transform delay-500 duration-1000 ease-in-out select-none group-hover/admin-dashboard:scale-105'>
				<div className='flex h-full w-full overflow-hidden rounded-[0.6em] tracking-widest'>
					<div className='border-info/30 flex w-1/4 shrink-0 flex-col gap-[1em] border-e-[0.025em] border-solid bg-white/50 p-[1.25em] dark:bg-black/50'>
						<div className='border-info/30 flex items-center gap-[0.75em] rounded-[0.4em] border-[0.025em] border-solid py-[0.75em] ps-[1em] pe-[0.8em] uppercase'>
							<TreePineIcon className='h-[1.5em] w-[1.5em]' />
							<div className='text-[0.9em]'>Patrick Dean</div>
							<ChevronDownIcon className='ms-auto h-[1em] w-[1em]' />
						</div>
						<div className='mt-[2em] flex grow flex-col gap-[1.25em]'>
							{menuItems.map((item, index) => (
								<div
									key={Math.random()}
									className={`flex items-center gap-[0.5em] border-s-[0.25em] border-solid py-[0.75em] ps-[1em] pe-[0.6em] ${
										index === 1 ? 'from-info/30 rtl:to-info/30 border-info/50 bg-gradient-to-r to-transparent rtl:from-transparent' : 'border-transparent bg-transparent'
									} uppercase ${index === menuItems?.length - 1 ? 'before:bg-info/20 relative mt-auto before:absolute before:-top-[1.25em] before:left-0 before:h-[0.05em] before:w-full' : ''}`}
								>
									{item?.icon}
									<div className='text-[0.8em]'>{item?.title}</div>
								</div>
							))}
						</div>
					</div>
					<div className='flex h-full grow'>
						<div className='border-info/30 w-7/12 shrink-0 border-e-[0.025em] border-solid'>
							<div className='border-info/30 flex h-[3.5em] items-center border-b-[0.025em] border-solid p-[1em]'>
								<div className='text-[1.1em] font-semibold'>Inbox</div>
								<div className='ms-auto flex items-center gap-[1em]'>
									<ListFilterIcon className='text-secondary-500 dark:text-secondary-400 h-[1.05em] w-[1.05em]' />
									<SlidersHorizontalIcon className='text-secondary-500 dark:text-secondary-400 h-[0.9em] w-[0.9em]' />
								</div>
							</div>
							<div className='flex flex-col gap-[0.5em] p-[1em]'>
								{inboxList.map((inbox, index) => (
									<div
										key={Math.random()}
										className={`flex flex-col gap-[0.5em] rounded-[0.5em] border-[0.025em] border-solid p-[1em] ${index === 0 ? 'bg-info/30 border-transparent' : 'border-info/30'}`}
									>
										<div className='flex items-start gap-[1em]'>
											<div className='flex flex-col gap-[0.35em]'>
												<div
													className={`inline-flex items-center gap-[0.5em] text-[1em] leading-none font-bold ${
														inbox.status === 'unread' ? 'after:bg-primary after:aspect-square after:h-[0.6em] after:rounded-full' : ''
													}`}
												>
													{inbox.name}
												</div>
												<div className='text-[0.8em] leading-none'>{inbox.title}</div>
											</div>

											<div className='text-secondary-500 dark:text-secondary-400 ms-auto text-[0.6em]'>{inbox.time}</div>
										</div>
										<div className='text-secondary-500 dark:text-secondary-400 line-clamp-1 text-[0.7em]'>{inbox.message}</div>
										<div className='mt-[0.1em] flex flex-wrap gap-[0.5em]'>
											{inbox?.tags?.map((tags) => (
												<div
													key={Math.random()}
													className='border-info/30 text-secondary-500 dark:text-secondary-400 rounded-[0.25em] border-[0.025em] border-solid px-[0.7em] py-[0.5em] text-[0.6em] leading-none'
												>
													{tags}
												</div>
											))}
										</div>
									</div>
								))}
							</div>
						</div>
						<div className='border-info/30 flex w-5/12 shrink-0 flex-col border-e-[0.025em] border-solid'>
							<div className='border-info/30 flex h-[3.5em] items-center border-b-[0.025em] border-solid p-[1em]'>
								<div className='flex items-center gap-[1em]'>
									<ArchiveIcon className='h-[0.9em] w-[0.9em]' />
									<ArchiveXIcon className='h-[0.9em] w-[0.9em]' />
									<Trash2Icon className='h-[0.9em] w-[0.9em]' />
								</div>
								<div className='ms-auto flex items-center gap-[1em]'>
									<UndoIcon className='text-secondary-400 dark:text-secondary-400 h-[1.1em] w-[1.1em]' />
									<UndoDotIcon className='text-secondary-400 dark:text-secondary-400 h-[1.1em] w-[1.1em]' />
									<RedoIcon className='text-secondary-400 dark:text-secondary-400 h-[1.1em] w-[1.1em]' />
									<EllipsisVerticalIcon className='text-secondary-400 dark:text-secondary-400 h-[1.1em] w-[1.1em]' />
								</div>
							</div>
							<div className='border-info/30 flex gap-[1em] border-b-[0.025em] border-solid p-[1em]'>
								<div className='bg-info/30 inline-flex aspect-square h-[3em] items-center justify-center rounded-full'>WS</div>
								<div className='flex w-full flex-col gap-[0.35em]'>
									<div className='inline-flex items-center gap-[0.5em] text-[1em] leading-snug font-bold'>
										<div>{inboxList[0].name}</div>
										<div className='text-secondary-500 dark:text-secondary-400 ms-auto text-[0.7em]'>{inboxList[0].time}</div>
									</div>
									<div className='text-secondary-500 dark:text-secondary-400 text-[0.7em] leading-none'>{inboxList[0].title}</div>
									<div className='text-secondary-500 dark:text-secondary-400 text-[0.7em] leading-none'>Reply-To: {inboxList[0].email}</div>
								</div>
							</div>
							<div className='border-info/30 grow border-b-[0.025em] border-solid p-[1em]'>
								<div
									className='text-secondary-600 dark:text-secondary-300 text-[0.65em] leading-relaxed'
									dangerouslySetInnerHTML={{
										__html: inboxList[0].message,
									}}
								/>
							</div>
							<div className='flex flex-col gap-[0.75em] p-[1em]'>
								<div className='border-info/30 text-secondary-600 dark:text-secondary-300 h-[6em] w-full rounded-[0.4em] border-[0.025em] border-solid p-[1em] text-[0.8em] leading-none'>
									Reply William Smith...
								</div>
								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-[0.5em] text-[0.8em]'>
										<ToggleLeftIcon className='text-secondary-300 dark:text-secondary-600 h-[2em] w-[2em]' />
										<div className='text-secondary-500 dark:text-secondary-400'>Mute the thread</div>
									</div>
									<div className='bg-info/30 inline-flex h-[2.5em] items-center justify-center rounded-[0.4em] px-[1.25em] text-[0.8em] font-bold uppercase'>Send</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className='border-info/20 bg-light/10 dark:bg-dark/10 pointer-events-none absolute -top-[4em] -right-[4em] flex w-[22em] flex-col items-start rounded-[2.25em] border-[0.05em] border-solid p-[1.5em] backdrop-blur transition-transform delay-500 duration-1000 ease-in-out select-none group-hover/admin-dashboard:-translate-x-[1em] group-hover/admin-dashboard:scale-105'>
				<div className='dark:bg-dark/30 border-info/30 flex w-full items-center justify-center rounded-[1em] border-[0.05em] border-solid bg-white/30 p-[1em] backdrop:blur-md'>
					<Cloud className='w-[9em]' />
				</div>
				<div className='mt-[0.9em] text-[1.4em] leading-snug font-semibold'>Designing a Travel App</div>
				<div className='text-secondary-600 dark:text-secondary-300 mt-[0.8em] text-[0.9em] leading-snug font-light'>
					Embark on a creative journey as you learn how to design a captivating travel app from concept to user-centric experience. This comprehensive course in Figma will immerse you in the world of travel app
					design, covering everything from user interface aesthetics to intuitive user experiences (UX).
				</div>
				<div className='bg-info/30 mt-[1.3em] inline-flex h-[2.5em] items-center justify-center rounded-[0.4em] px-[1.5em] text-[1em] font-bold uppercase'>Accept</div>
			</div>
			<div className='border-info/50 bg-light/70 dark:bg-dark/70 pointer-events-none absolute top-[20em] right-0 aspect-square h-[12em] translate-x-1/2 rounded-full border-[0.05em] border-solid backdrop-blur select-none'>
				<div className='absolute inset-[0.2em]'>
					<svg className='absolute inset-[1.3em] fill-none' viewBox='-3.5 -3 112 112'>
						<path
							d='M105 53C105 82.2711 81.4949 106 52.5 106C23.5051 106 0 82.2711 0 53C0 23.7289 23.5051 0 52.5 0C81.4949 0 105 23.7289 105 53Z'
							className='stroke-info'
							strokeOpacity='0.5'
							strokeWidth='5'
							strokeDasharray='0.5 5'
						/>
					</svg>
					<div className='border-info/50 absolute inset-[1em] rounded-full border-[0.25em] border-solid' />
					<div className='absolute inset-[1em] flex items-center justify-center text-center text-[3.75em] font-extrabold text-black/70 dark:text-white/70'>98</div>
					<svg className='animate-spin-slow absolute inset-[0.1em]' viewBox='0 0 100 100'>
						<path id='curve-text' fill='transparent' strokeWidth='none' d='M0 50a1 1 0 0 1 100 0A1 1 0 0 1 0 50' />
						<text>
							<textPath className='fill-info/80' dominantBaseline='Hanging' fontFamily='"Inter", sans-serif' fontSize='6' href='#curve-text' letterSpacing='0.1em'>
								PERFORMANCE - PERFORMANCE - PERFORMANCE - PERFORMANCE - PERFORMANCE - PERFORMANCE -
							</textPath>
						</text>
					</svg>
				</div>
			</div>
			<div className='border-info/50 bg-light/70 dark:bg-dark/70 pointer-events-none absolute top-[7em] -left-[2.5em] aspect-square h-[9em] -translate-x-1/2 -translate-y-1/2 rounded-full border-[0.05em] border-solid backdrop-blur select-none'>
				<div className='absolute inset-[0.2em]'>
					<svg viewBox='-4 -4 148 148' xmlns='http://www.w3.org/2000/svg' className='absolute -inset-[1.1em] fill-none'>
						<g filter='url(#half-wave-wrapper)'>
							<path
								d='M70 140C88.5652 140 106.37 132.625 119.497 119.497C132.625 106.37 140 88.5652 140 70C140 51.4349 132.625 33.6301 119.497 20.5025C106.37 7.37499 88.5652 8.63117e-06 70 0'
								stroke='url(#half-wave-stroke)'
								strokeWidth='8'
								strokeDasharray='0.8 5'
							/>
						</g>
						<defs>
							<filter id='half-wave-wrapper' x='70' y='-4' width='74' height='148' filterUnits='userSpaceOnUse' colorInterpolationFilters='sRGB'>
								<feFlood floodOpacity='0' result='BackgroundImageFix' />
								<feBlend mode='normal' in='SourceGraphic' in2='BackgroundImageFix' result='shape' />
								<feColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha' />
								<feOffset dy='1' />
								<feComposite in2='hardAlpha' operator='arithmetic' k2='-1' k3='1' />
								<feColorMatrix type='matrix' values='0 0 0 0 0.556863 0 0 0 0 0.607843 0 0 0 0 0.682353 0 0 0 0.5 0' />
								<feBlend mode='normal' in2='shape' result='effect1_innerShadow_23632_3864' />
							</filter>
							<linearGradient id='half-wave-stroke' x1='99.1609' y1='3.0511' x2='130.689' y2='119.502' gradientUnits='userSpaceOnUse'>
								<stop stopColor='#FFD057' />
								<stop offset='0.965972' stopColor='#41EAD4' />
							</linearGradient>
						</defs>
					</svg>
					<svg xmlns='http://www.w3.org/2000/svg' className='absolute inset-0 fill-none' viewBox='-1 -1 124 124'>
						<path
							fill='url(#half-line-gradient)'
							d='M61 120.17c0 1.011.82 1.833 1.83 1.803a61.01 61.01 0 0 0 54.527-37.63 61 61 0 0 0 0-46.687A61 61 0 0 0 62.83.027C61.82-.003 61 .82 61 1.83s.82 1.827 1.83 1.86a57.34 57.34 0 0 1 0 114.621c-1.01.032-1.83.848-1.83 1.859'
						/>
						<path
							stroke='#fff'
							strokeOpacity='0.1'
							d='M61 120.17c0 1.011.82 1.833 1.83 1.803a61.01 61.01 0 0 0 54.527-37.63 61 61 0 0 0 0-46.687A61 61 0 0 0 62.83.027C61.82-.003 61 .82 61 1.83s.82 1.827 1.83 1.86a57.34 57.34 0 0 1 0 114.621c-1.01.032-1.83.848-1.83 1.859Z'
						/>
						<defs>
							<linearGradient id='half-line-gradient' x1='19.409' x2='122' y1='0' y2='122' gradientUnits='userSpaceOnUse'>
								<stop stopColor='#fff' />
								<stop offset='0.75' stopColor='#1f8fff' />
							</linearGradient>
						</defs>
					</svg>
					<svg xmlns='http://www.w3.org/2000/svg' className='absolute bottom-[0.1em] left-1/2 aspect-square w-[4em] -translate-x-1/2 translate-y-1/2 fill-none' viewBox='-1 -1 51 51'>
						<g filter='url(#triangle-wrapper)'>
							<path
								fill='url(#triangle-fill)'
								fillOpacity='0.9'
								d='M35.23 25.292c2.018 3.278-.27 7.51-4.117 7.618l-13.11.368c-3.848.108-6.37-3.99-4.539-7.376l6.237-11.537c1.83-3.386 6.64-3.52 8.657-.243z'
							/>
						</g>
						<defs>
							<radialGradient id='triangle-fill' cx='0' cy='0' r='1' gradientTransform='matrix(-19.23654 -10.39856 5.15443 -9.53531 24.295 24.342)' gradientUnits='userSpaceOnUse'>
								<stop stopColor='#2E335A' />
								<stop offset='1' stopColor='#1C1B33' stopOpacity='0.7' />
							</radialGradient>
							<filter id='triangle-wrapper' width='45.127' height='43.537' x='1.854' y='0.743' colorInterpolationFilters='sRGB' filterUnits='userSpaceOnUse'>
								<feFlood floodOpacity='0' result='BackgroundImageFix' />
								<feGaussianBlur in='BackgroundImageFix' stdDeviation='5' />
								<feComposite in2='SourceAlpha' operator='in' result='effect1_backgroundBlur_23632_3869' />
								<feBlend in='SourceGraphic' in2='effect1_backgroundBlur_23632_3869' result='shape' />
								<feColorMatrix in='SourceAlpha' result='hardAlpha' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' />
								<feOffset />
								<feGaussianBlur stdDeviation='10' />
								<feComposite in2='hardAlpha' k2='-1' k3='1' operator='arithmetic' />
								<feColorMatrix values='0 0 0 0 0.497041 0 0 0 0 0.638518 0 0 0 0 0.740967 0 0 0 0.52 0' />
								<feBlend in2='shape' result='effect2_innerShadow_23632_3869' />
							</filter>
						</defs>
					</svg>
					<div className='absolute inset-0 inline-flex items-center justify-center text-[2.75em] font-extrabold tracking-tighter text-black/70 dark:text-white/70'>50%</div>
				</div>
			</div>
		</div>
	);
};

export default AdminScreen;
