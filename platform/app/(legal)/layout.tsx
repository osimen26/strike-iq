import NavBar from '@/components/landing/NavBar';
import Footer from '@/components/landing/Footer';
import '@/app/marketing-index.css';
import '@/app/marketing-app.css';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="App w-full min-h-screen bg-[#050B14] flex flex-col">
      <NavBar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-32 text-zinc-300 font-sans prose prose-invert prose-emerald">
        {children}
      </main>
      <Footer />
    </div>
  );
}
