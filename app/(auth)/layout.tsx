import '../globals.css';
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background-app font-main">
        
      {/* LEFT PANEL - Background Graphic (Hidden on mobile) */}
      <div className="hidden md:flex flex-1 relative bg-background-app shrink-0">
        <Image
          src="/backgroundsign.png"
          alt="StrikeIQ Authentication Background"
          fill
          className="object-cover"
          priority
        />
        {/* Text Content Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-5 h-5 rounded-full border-[4px] border-brand-mint"></div>
            <span className="text-brand-mint font-heading tracking-wide text-xl uppercase">STRIKE IQ</span>
          </div>
          <h1 className="text-brand-mint font-heading text-5xl mb-4">Get Started with Us</h1>
          <p className="text-brand-mint/80 font-main text-lg max-w-[280px]">
            Complete these easy steps to register your account.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL - Auth Forms */}
      <div className="w-full md:w-1/2 lg:flex-1 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-16 bg-background-app relative z-10 overflow-hidden">
        {/* Texture Overlay */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.35] mix-blend-overlay"
          style={{ backgroundImage: "url('/texture.png')", backgroundRepeat: "repeat" }}
        ></div>

        {/* Mobile Logo (Hidden on desktop) */}
        <div className="md:hidden flex items-center justify-center gap-2 mb-8 relative z-10">
          <div className="w-4 h-4 rounded-full border-[3px] border-brand-mint"></div>
          <span className="text-brand-mint font-heading tracking-wide text-lg uppercase">STRIKE IQ</span>
        </div>

        <div className="w-full max-w-md relative z-10">
          {children}
        </div>
      </div>
      
    </div>
  );
}
