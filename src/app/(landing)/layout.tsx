import Header from "@/components/Header";

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
      <>
			<Header />
        {children}
      </>
    );
  };
  
  export default layout;
  