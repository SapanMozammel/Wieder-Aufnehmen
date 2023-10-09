const Page = ({ params }: { params: { slug: string } }) => {
  return <div>My Portfolio: {params.slug}</div>;
};

export default Page;
