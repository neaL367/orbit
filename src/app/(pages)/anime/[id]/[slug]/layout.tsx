export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { slug } = await params;
  return {
    title: `${slug} | Orbit`,
    description: `Discover details about ${slug} on Orbit.`,
  };
}

export default function AnimeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}