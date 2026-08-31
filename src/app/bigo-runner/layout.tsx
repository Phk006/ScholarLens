import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Big-O Runner — Learn Time Complexity",
  description:
    "An endless runner where the three lanes are the three answer options. Swipe to the right answer and learn DSA on the go.",
};

export default function BigORunnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white overflow-hidden">{children}</body>
    </html>
  );
}
