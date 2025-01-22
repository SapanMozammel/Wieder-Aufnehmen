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
		icon: <BoxIcon className="w-[1.1em] h-[1.1em]" />,
	},
	{
		title: 'Index',
		icon: <InboxIcon className="w-[1.1em] h-[1.1em]" />,
	},
	{
		title: 'Promotions',
		icon: <MessagesSquareIcon className="w-[1.1em] h-[1.1em]" />,
	},
	{
		title: 'Teams',
		icon: <UsersIcon className="w-[1.1em] h-[1.1em]" />,
	},
	{
		title: 'My Issues',
		icon: <BugIcon className="w-[1.1em] h-[1.1em]" />,
	},
	{
		title: 'Junk',
		icon: <ArchiveXIcon className="w-[1.1em] h-[1.1em]" />,
	},
	{
		title: 'Drafts',
		icon: <FileIcon className="w-[1.1em] h-[1.1em]" />,
	},
	{
		title: 'Archive',
		icon: <ArchiveIcon className="w-[1.1em] h-[1.1em]" />,
	},
	{
		title: 'Logout',
		icon: <LogOutIcon className="w-[1.1em] h-[1.1em]" />,
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
		title: 'Team Outing Plans',
		time: '2 days ago',
		tags: ['team', 'outing', 'social'],
		message: `Hey Everyone, Let’s finalize the plans for the team outing this Friday. Please RSVP by tomorrow evening so we can make necessary arrangements. <br /> <br />Cheers, Charlotte`,
		status: 'read',
	},
	{
		name: 'Sophia Johnson',
		email: 'sophiajohnson@example.com',
		title: 'Project Proposal Review',
		time: '3 day ago',
		tags: ['proposal', 'review', 'high-priority'],
		message: `Hello, I have attached the project proposal for your review. Please provide feedback and let me know if there are any changes required. I’d like to finalize this by the end of the week. <br /> <br />Thanks, Sophia`,
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
		<div className="w-full aspect-[16/10] relative text-[0.75vw] text-left !font-light text-black dark:text-white group/admin-dashboard">
			<div className="h-full w-full flex bg-light/20 dark:bg-dark/20 backdrop-blur rounded-[0.6em] border-[0.025em] border-solid border-info/30 shadow-lg shadow-info/10 transition-transform group-hover/admin-dashboard:scale-105 ease-in-out duration-1000 delay-500 pointer-events-none select-none">
				<div className="h-full w-full flex rounded-[0.6em] overflow-hidden tracking-widest">
					<div className="w-1/4 shrink-0 bg-white/50 dark:bg-black/50 flex flex-col gap-[1em] border-e-[0.025em] border-solid border-info/30 p-[1.25em]">
						<div className="ps-[1em] pe-[0.8em] gap-[0.75em] py-[0.75em] rounded-[0.4em] flex items-center border-[0.025em] border-solid border-info/30 uppercase">
							<TreePineIcon className="w-[1.5em] h-[1.5em]" />
							<div className="text-[0.9em]">Patrick Dean</div>
							<ChevronDownIcon className="ms-auto w-[1em] h-[1em]" />
						</div>
						<div className="grow flex flex-col mt-[2em] gap-[1.25em]">
							{menuItems.map((item, index) => (
								<div
									key={Math.random()}
									className={`ps-[1em] pe-[0.6em] gap-[0.5em] py-[0.75em] flex items-center border-s-[0.25em] border-solid ${
										index === 1
											? 'bg-gradient-to-r from-info/30 rtl:from-transparent to-transparent rtl:to-info/30 border-info/50'
											: 'bg-transparent border-transparent'
									} uppercase ${
										index === menuItems?.length - 1
											? 'mt-auto relative before:absolute before:w-full before:h-[0.05em] before:-top-[1.25em] before:left-0 before:bg-info/20'
											: ''
									}`}>
									{item?.icon}
									<div className="text-[0.8em]">
										{item?.title}
									</div>
								</div>
							))}
						</div>
					</div>
					<div className="grow h-full flex">
						<div className="w-7/12 shrink-0 border-e-[0.025em] border-solid border-info/30">
							<div className="h-[3.5em] border-b-[0.025em] border-solid border-info/30 p-[1em] flex items-center">
								<div className="text-[1.1em] font-semibold">
									Inbox
								</div>
								<div className="ms-auto flex items-center gap-[1em]">
									<ListFilterIcon className="w-[1.05em] h-[1.05em] text-secondary-500 dark:text-secondary-400" />
									<SlidersHorizontalIcon className="w-[0.9em] h-[0.9em] text-secondary-500 dark:text-secondary-400" />
								</div>
							</div>
							<div className="p-[1em] flex flex-col gap-[0.5em]">
								{inboxList.map((inbox, index) => (
									<div
										key={Math.random()}
										className={`p-[1em] flex flex-col gap-[0.5em] rounded-[0.5em] border-[0.025em] border-solid ${
											index === 0
												? 'border-transparent bg-info/30'
												: 'border-info/30'
										}`}>
										<div className="flex items-start gap-[1em]">
											<div className="flex flex-col gap-[0.35em]">
												<div
													className={`inline-flex items-center gap-[0.5em] text-[1em] leading-none font-bold ${
														inbox.status ===
														'unread'
															? 'after:h-[0.6em] after:aspect-square after:bg-primary-600 after:rounded-full'
															: ''
													}`}>
													{inbox.name}
												</div>
												<div className="text-[0.8em] leading-none">
													{inbox.title}
												</div>
											</div>

											<div className="text-[0.6em] ms-auto text-secondary-500 dark:text-secondary-400">
												{inbox.time}
											</div>
										</div>
										<div className="text-[0.7em] line-clamp-1 text-secondary-500 dark:text-secondary-400">
											{inbox.message}
										</div>
										<div className="mt-[0.1em] flex flex-wrap gap-[0.5em]">
											{inbox?.tags?.map((tags) => (
												<div
													key={Math.random()}
													className="px-[0.7em] py-[0.5em] rounded-[0.25em] border-[0.025em] border-solid border-info/30 text-[0.6em] leading-none text-secondary-500 dark:text-secondary-400">
													{tags}
												</div>
											))}
										</div>
									</div>
								))}
							</div>
						</div>
						<div className="w-5/12 shrink-0 flex flex-col border-e-[0.025em] border-solid border-info/30">
							<div className="h-[3.5em] border-b-[0.025em] border-solid border-info/30 p-[1em] flex items-center">
								<div className="flex items-center gap-[1em]">
									<ArchiveIcon className="w-[0.9em] h-[0.9em]" />
									<ArchiveXIcon className="w-[0.9em] h-[0.9em]" />
									<Trash2Icon className="w-[0.9em] h-[0.9em]" />
								</div>
								<div className="ms-auto flex items-center gap-[1em]">
									<UndoIcon className="w-[1.1em] h-[1.1em] text-secondary-400 dark:text-secondary-400" />
									<UndoDotIcon className="w-[1.1em] h-[1.1em] text-secondary-400 dark:text-secondary-400" />
									<RedoIcon className="w-[1.1em] h-[1.1em] text-secondary-400 dark:text-secondary-400" />
									<EllipsisVerticalIcon className="w-[1.1em] h-[1.1em] text-secondary-400 dark:text-secondary-400" />
								</div>
							</div>
							<div className="border-b-[0.025em] border-solid border-info/30 p-[1em] flex gap-[1em]">
								<div className="h-[3em] aspect-square rounded-full bg-info/30 inline-flex items-center justify-center">
									WS
								</div>
								<div className="flex flex-col gap-[0.35em] w-full">
									<div className="inline-flex items-center gap-[0.5em] text-[1em] leading-snug font-bold">
										<div>{inboxList[0].name}</div>
										<div className="text-[0.7em] ms-auto text-secondary-500 dark:text-secondary-400">
											{inboxList[0].time}
										</div>
									</div>
									<div className="text-[0.7em] leading-none text-secondary-500 dark:text-secondary-400">
										{inboxList[0].title}
									</div>
									<div className="text-[0.7em] leading-none text-secondary-500 dark:text-secondary-400">
										Reply-To: {inboxList[0].email}
									</div>
								</div>
							</div>
							<div className="border-b-[0.025em] border-solid border-info/30 p-[1em] grow">
								<div
									className="text-[0.65em] leading-relaxed text-secondary-600 dark:text-secondary-300"
									dangerouslySetInnerHTML={{
										__html: inboxList[0].message,
									}}
								/>
							</div>
							<div className="p-[1em] flex flex-col gap-[0.75em]">
								<div className="w-full border-[0.025em] border-solid border-info/30 rounded-[0.4em] h-[6em] p-[1em] text-[0.8em] leading-none text-secondary-600 dark:text-secondary-300">
									Reply William Smith...
								</div>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-[0.5em] text-[0.8em]">
										<ToggleLeftIcon className="w-[2em] h-[2em] text-secondary-300 dark:text-secondary-600" />
										<div className=" text-secondary-500 dark:text-secondary-400">
											Mute the thread
										</div>
									</div>
									<div className="h-[2.5em] px-[1.25em] text-[0.8em] font-bold bg-info/30 uppercase rounded-[0.4em] inline-flex items-center justify-center">
										Send
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="absolute h-[12em] right-0 top-[20em] aspect-square translate-x-1/2 rounded-full border-[0.05em] border-solid border-info/50 bg-light/70 dark:bg-dark/70 backdrop-blur pointer-events-none select-none">
				<div className="absolute inset-[0.2em]">
					<svg
						className="absolute inset-[1.3em] fill-none"
						viewBox="-3.5 -3 112 112">
						<path
							d="M105 53C105 82.2711 81.4949 106 52.5 106C23.5051 106 0 82.2711 0 53C0 23.7289 23.5051 0 52.5 0C81.4949 0 105 23.7289 105 53Z"
							className="stroke-info"
							strokeOpacity="0.5"
							strokeWidth="5"
							strokeDasharray="0.5 5"></path>
					</svg>
					<div className="absolute inset-[1em] rounded-full border-[0.25em] border-solid border-info/50" />
					<div className="absolute inset-[1em] text-[3.75em] font-extrabold flex items-center justify-center text-center text-black/70 dark:text-white/70">
						98
					</div>
					<svg
						className="absolute inset-[0.1em] fill-none"
						viewBox="0 0 142 142">
						<path
							d="M71.0221 13.6042C71.0221 13.2841 71.2818 13.0243 71.6019 13.0275C83.5023 13.1465 95.0829 16.9269 104.766 23.8619C114.606 30.9094 121.993 40.8611 125.89 52.3204C129.786 63.7796 129.997 76.1714 126.493 87.7567C123.045 99.1569 116.169 109.213 106.808 116.562C106.556 116.76 106.192 116.712 105.997 116.458V116.458C105.802 116.205 105.85 115.841 106.101 115.643C115.271 108.442 122.005 98.5896 125.384 87.4211C128.818 76.0675 128.611 63.9236 124.792 52.6935C120.974 41.4634 113.735 31.7108 104.091 24.8042C94.6049 18.0102 83.2602 14.3056 71.6019 14.1867C71.2818 14.1834 71.0221 13.9242 71.0221 13.6042V13.6042Z"
							fill="url(#svg-603159127_4294_paint1_linear_23183_18738)"></path>
						<defs>
							<linearGradient
								id="svg-603159127_4294_paint1_linear_23183_18738"
								x1="137.227"
								y1="94.1453"
								x2="0.0444619"
								y2="29.9987"
								gradientUnits="userSpaceOnUse">
								<stop stopColor="#41ead4"></stop>
								<stop
									offset="0.75"
									stopColor="transparent"></stop>
							</linearGradient>
						</defs>
					</svg>
					<svg
						className="absolute inset-[0.1em] animate-spin-slow"
						viewBox="0 0 100 100">
						<path
							id="curve-text"
							fill="transparent"
							strokeWidth="none"
							d="M0 50a1 1 0 0 1 100 0A1 1 0 0 1 0 50"></path>
						<text>
							<textPath
								className="fill-info/80"
								dominantBaseline="Hanging"
								fontFamily='"Inter", sans-serif'
								fontSize="6"
								href="#curve-text"
								letterSpacing="0.1em">
								PERFORMANCE - PERFORMANCE - PERFORMANCE -
								PERFORMANCE - PERFORMANCE - PERFORMANCE -
							</textPath>
						</text>
					</svg>
				</div>
			</div>
		</div>
	);
};

export default AdminScreen;
