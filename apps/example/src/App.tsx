import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";
import { withStencil } from "react-stencilize";

// View components (for rendering)
import { UserView } from "../components/User/View";
import { AlertBannerView } from "../components/AlertBanner/View";
import { ButtonView } from "../components/Button/View";
import { ProfileCardView } from "../components/ProfileCard/View";

// Source code (for display) — Vite ?raw import keeps in sync with actual files
import userViewSource from "../components/User/View.tsx?raw";
import alertBannerViewSource from "../components/AlertBanner/View.tsx?raw";
import buttonViewSource from "../components/Button/View.tsx?raw";
import profileCardViewSource from "../components/ProfileCard/View.tsx?raw";

// --- CodeBlock component ---
function CodeBlock({ code, lang = "tsx" }: { code: string; lang?: string }) {
  const [html, setHtml] = useState("");
  useEffect(() => {
    codeToHtml(code, { lang, theme: "github-dark" }).then(setHtml);
  }, [code, lang]);
  if (!html)
    return (
      <pre className="rounded-lg bg-zinc-950 p-4 text-xs text-zinc-500 font-mono">
        Loading source...
      </pre>
    );
  return (
    <div
      className="text-xs font-mono flex-grow flex flex-col min-h-0 overflow-hidden [&_pre]:overflow-auto [&_pre]:max-h-[380px] [&_pre]:p-5 [&_pre]:!m-0 [&_pre]:!rounded-xl [&_pre]:min-w-full [&_pre]:inline-block"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// --- Skeleton components ---
const SkeletonUser = withStencil(UserView);
const SkeletonAlertBanner = withStencil(AlertBannerView);
const SkeletonButton = withStencil(ButtonView);
const SkeletonProfileCard = withStencil(ProfileCardView);

// --- Mock data ---
const mockUser = {
  image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
  name: "Sarah Jenkins",
  description: "Lead Frontend Engineer at Antigravity Tech",
};

const mockAlert = {
  variant: "info" as const,
  title: "Optimized Build Complete",
  message: "Version 2.4.0 is now live. Features enhanced React 19 concurrent safety.",
};

const mockButton = {
  label: "Execute Process",
  intent: "primary" as const,
  size: "md" as const,
};

const mockProfile = {
  image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
  name: "Alexander Wright",
  role: "VP of Product Engineering",
  bio: "Designing highly concurrent & reactive user interfaces with modern rendering systems.",
  socials: [{ label: "GitHub" }, { label: "Twitter" }, { label: "LinkedIn" }],
};

// --- InteractiveDemo component ---
function InteractiveDemo({
  title,
  description,
  code,
  renderComponent,
  renderSkeleton,
}: {
  title: string;
  description: string;
  code: string;
  renderComponent: () => React.ReactNode;
  renderSkeleton: () => React.ReactNode;
}) {
  const [demoState, setDemoState] = useState<"component" | "skeleton" | "loading">("component");
  const [isLoading, setIsLoading] = useState(false);

  // Simulated loading effect
  useEffect(() => {
    if (demoState === "loading") {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1200); // 1.2s skeleton display for good visual rhythm
      return () => clearTimeout(timer);
    }
    setIsLoading(false);
  }, [demoState]);

  const handleSimulateLoad = () => {
    setDemoState("loading");
  };

  return (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:border-zinc-700/50">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-950/30 px-6 py-4">
        <h2 className="text-lg font-bold text-zinc-100">{title}</h2>
        <p className="text-xs text-zinc-400 mt-0.5">{description}</p>
      </div>

      {/* Content Area (Always simultaneous view with side-by-side split on larger screens) */}
      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          
          {/* Left Column: Source Code */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Source Code
            </h3>
            <div className="font-mono text-sm leading-relaxed rounded-xl border border-zinc-850 bg-zinc-950 p-0 flex-grow overflow-hidden flex flex-col">
              <CodeBlock code={code} />
            </div>
          </div>

          {/* Right Column: Live Playground */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Live Preview
            </h3>
            
            <div className="border border-zinc-850 rounded-xl bg-zinc-950/20 p-4 flex flex-col gap-4 flex-grow justify-between">
              {/* Play Mode Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-850 pb-3">
                <div className="flex bg-zinc-950 border border-zinc-850 p-0.5 rounded-lg">
                  <button
                    onClick={() => setDemoState("component")}
                    disabled={isLoading}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-150 flex items-center gap-1.5 ${
                      demoState === "component"
                        ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                        : "text-zinc-400 hover:text-zinc-200 border border-transparent disabled:opacity-50"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-300"></span>
                    Component
                  </button>
                  <button
                    onClick={() => setDemoState("skeleton")}
                    disabled={isLoading}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-150 flex items-center gap-1.5 ${
                      demoState === "skeleton"
                        ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                        : "text-zinc-400 hover:text-zinc-200 border border-transparent disabled:opacity-50"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-650"></span>
                    Skeleton
                  </button>
                </div>

                <button
                  onClick={handleSimulateLoad}
                  disabled={isLoading}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border flex items-center gap-2 transition-all duration-150 ${
                    isLoading
                      ? "bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed"
                      : "bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-950 hover:shadow-lg hover:shadow-zinc-800/20 active:scale-95 cursor-pointer font-bold"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-zinc-600" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Simulating Load...
                    </>
                  ) : (
                    <>
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                      Simulate Load
                    </>
                  )}
                </button>
              </div>

              {/* Display Box */}
              <div className="relative min-h-[220px] flex items-center justify-center p-6 bg-zinc-950/40 rounded-xl border border-zinc-900 overflow-hidden flex-grow">
                <div className="w-full max-w-sm mx-auto">
                  {demoState === "skeleton" ? (
                    <div className="transition-all duration-300">{renderSkeleton()}</div>
                  ) : demoState === "component" ? (
                    <div className="transition-all duration-300">{renderComponent()}</div>
                  ) : (
                    <div className="relative w-full">
                      {/* Simulated Loading Transition */}
                      {isLoading ? (
                        <div className="opacity-100">
                          {renderSkeleton()}
                        </div>
                      ) : (
                        <div className="animate-[fadeIn_0.5s_ease-out]">
                          {renderComponent()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

// --- Main App Component ---
function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300">
      <div className="mx-auto max-w-6xl space-y-12 px-6 py-12 md:py-16">
        
        {/* Header */}
        <header className="border-b border-zinc-800 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              react-stencilize
            </h1>
            <p className="max-w-2xl text-sm md:text-base text-zinc-400 font-medium">
              Zero-configuration component virtualization that turns any React layout into a highly precise, structurally-accurate skeleton screen.
            </p>
          </div>
          
          {/* Metadata Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-md bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-300">
              React 19 ✓
            </span>
            <span className="inline-flex items-center rounded-md bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-300">
              Vite 7 ✓
            </span>
            <span className="inline-flex items-center rounded-md bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-300">
              Safe Proxy ✓
            </span>
            <span className="inline-flex items-center rounded-md bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-300">
              TypeScript ✓
            </span>
          </div>
        </header>

        {/* Introduction */}
        <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-2xl p-6 text-sm text-zinc-400 space-y-3 leading-relaxed">
          <p>
            🚀 <strong className="text-zinc-200">How it works:</strong> <code className="rounded bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 text-xs text-zinc-300 font-mono">withStencil(View)</code> creates a lightweight wrapper. On fallback execution, it invokes the target component using a deep, non-throwing <strong className="text-zinc-200">Safe Proxy</strong> that acts as infinite mock props, safely captures the rendered JSX, and automatically strips textual and non-primitive attributes to yield a pixel-perfect loading skeleton skeleton structure.
          </p>
          <p>
            💡 <strong className="text-zinc-200">Best Practice:</strong> Keep hooks (state, fetch) in a Container component, and apply <code className="font-mono text-zinc-300">withStencil</code> to a pure View component.
          </p>
        </div>

        {/* Examples List (Stacked vertically for wide side-by-side simultaneous views) */}
        <div className="flex flex-col gap-10">
          
          {/* User Card */}
          <InteractiveDemo
            title="User Card"
            description="Basic component with an image, text, and structure. withStencil automates layout-accurate skeleton generation."
            code={userViewSource}
            renderComponent={() => <UserView user={mockUser} />}
            renderSkeleton={() => <SkeletonUser />}
          />

          {/* Alert Banner (clsx) */}
          <InteractiveDemo
            title="Alert Banner (clsx)"
            description="Conditional class composition with clsx. withStencil handles complex conditional class strings gracefully."
            code={alertBannerViewSource}
            renderComponent={() => <AlertBannerView alert={mockAlert} />}
            renderSkeleton={() => <SkeletonAlertBanner />}
          />

          {/* Button (cva) */}
          <InteractiveDemo
            title="Button (cva)"
            description="Multi-variant styling using class-variance-authority. withStencil safely resolves components utilizing variant libraries."
            code={buttonViewSource}
            renderComponent={() => <ButtonView button={mockButton} />}
            renderSkeleton={() => <SkeletonButton />}
          />

          {/* Profile Card (tailwind-variants) */}
          <InteractiveDemo
            title="Profile Card (tailwind-variants)"
            description="Highly advanced slot-based variants. withStencil supports complex multi-slot variants without any manual mock setups."
            code={profileCardViewSource}
            renderComponent={() => <ProfileCardView profile={mockProfile} />}
            renderSkeleton={() => <SkeletonProfileCard />}
          />

        </div>

        {/* Footer */}
        <footer className="pt-8 border-t border-zinc-900 text-center text-xs text-zinc-500 font-medium">
          react-stencilize example app
        </footer>
      </div>

      {/* Global minimal custom styles for loading transition */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;
