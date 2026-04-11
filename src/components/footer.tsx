"use client";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/[0.04] py-6 mt-auto">
      <p className="text-center text-xs text-muted-foreground/50">
        Created by{" "}
        <a
          href="https://pratik-gupta-portfolio.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary/70 hover:text-primary font-medium transition-colors"
        >
          Pratik Gupta
        </a>
      </p>
    </footer>
  );
}
