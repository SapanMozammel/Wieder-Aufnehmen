const Page = ({ params }: { params: { slug: string } }) => {
  return <div>My Service: {params.slug}</div>;
};

export default Page;
