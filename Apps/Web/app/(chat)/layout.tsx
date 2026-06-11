import Menu from "@/components/UI/Menu";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Menu>{children}</Menu>;
}
