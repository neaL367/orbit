export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="mt-5 mb-24 relative">
      {children}
    </main>
  );
}
