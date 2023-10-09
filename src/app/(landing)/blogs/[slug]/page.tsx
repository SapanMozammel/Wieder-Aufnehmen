const Page = ({ params }: { params: { slug: string } }) => {
  return <div>My Blogs: {params.slug}</div>;
};

export default Page;
