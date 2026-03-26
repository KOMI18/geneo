export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen mx-auto bg-zinc-50 dark:bg-[#080808] flex items-center  justify-center">
      {children}
    </div>
  );
}