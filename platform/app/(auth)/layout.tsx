import '../globals.css';
import Image from "next/image";
import type { Metadata } from "next";

// Prevent static prerendering — auth pages require Supabase client at runtime
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Account Login & Register",
  description:
    "Log in or register for Strike IQ to access institutional-grade AI football and basketball betting intelligence.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background-app font-main">
        
      {/* LEFT PANEL - Background Graphic (Hidden on mobile) */}
      <div className="hidden md:flex flex-1 relative bg-black shrink-0">
        <Image
          src="/backgroundsign.png"
          alt="StrikeIQ Authentication Background"
          fill
          className="object-cover"
          priority
        />
        {/* Gradient Overlay for seamless blending into the black background */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/40 to-black z-[5]"></div>
        
        {/* Text Content Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 z-10">
          <div className="flex items-center gap-3 mb-6 bg-black/40 backdrop-blur-md px-6 py-2.5 rounded-full border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <div className="w-5 h-5 rounded-full border-[4px] border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
            <span className="text-white font-heading tracking-wider text-xl uppercase font-bold">STRIKE <span className="text-emerald-500">IQ</span></span>
          </div>
          <h1 className="text-white font-heading font-bold text-5xl mb-4 drop-shadow-2xl">Get Started with Us</h1>
          <p className="text-zinc-300 font-main text-lg max-w-[280px] drop-shadow-md">
            Complete these easy steps to register your account.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL - Auth Forms */}
      <div className="w-full md:w-1/2 lg:flex-1 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-16 bg-black border-l border-zinc-900 shadow-[-20px_0_50px_rgba(0,0,0,0.8)] relative z-10 overflow-hidden">
        {/* Ambient background glow for right panel */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.15),transparent_70%)]"></div>
        
        {/* Texture Overlay */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.25] mix-blend-overlay"
          style={{ backgroundImage: "url('/texture.png')", backgroundRepeat: "repeat" }}
        ></div>

        {/* Mobile Logo (Hidden on desktop) */}
        <div className="md:hidden flex items-center justify-center gap-2 mb-8 relative z-10 bg-[#09090b] px-5 py-2 rounded-full border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <div className="w-4 h-4 rounded-full border-[3px] border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
          <span className="text-white font-heading tracking-wider text-lg uppercase font-bold">STRIKE <span className="text-emerald-500">IQ</span></span>
        </div>

        <div className="w-full max-w-md relative z-10">
          {children}
        </div>
      </div>
      
    </div>
  );
}
