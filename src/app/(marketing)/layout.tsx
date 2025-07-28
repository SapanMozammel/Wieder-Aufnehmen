const layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className='marketing-layout'>
			<header>Marketing Header</header>
			<main>{children}</main>
			<footer>Marketing Footer</footer>
		</div>
	);
};

export default layout;
