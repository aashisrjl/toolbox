import { Link } from "@tanstack/react-router";
import logo from "/tools-logo.png";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/70 bg-card/40 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:gap-12">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <img src={logo} alt="Toolbox logo" height={40} width={40} className="rounded-lg" />
              <span className="font-display text-lg font-bold tracking-tight text-foreground">
                Toolbox
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-muted-foreground">
              A private, fast media utility platform. Convert, compress, trim, and protect your
              images, videos, audio, and documents without clutter or signups.
            </p>
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <a
                href="https://aashishrijal.com.np"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
                <span>Website</span>
              </a>
              <a
                href="https://github.com/aashisrjl/toolshub-aashis"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
                <span>GitHub</span>
              </a>
              <a
                href="mailto:aashisrijal252@gmail.com"
                className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span>Email</span>
              </a>
            </div>
          </div>

          {/* Tools & Services */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Media Tools
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link
                  to="/$slug"
                  params={{ slug: "remove-image-bg" }}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Remove Background
                </Link>
              </li>
              <li>
                <Link
                  to="/$slug"
                  params={{ slug: "compress-image" }}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Compress Image
                </Link>
              </li>
              <li>
                <Link
                  to="/image-collage"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Image Collage
                </Link>
              </li>
              <li>
                <Link
                  to="/$slug"
                  params={{ slug: "convert-video" }}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Convert Video
                </Link>
              </li>
              <li>
                <Link
                  to="/$slug"
                  params={{ slug: "convert-audio" }}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Convert Audio
                </Link>
              </li>
              <li>
                <Link
                  to="/download-youtube-videos"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  YouTube Downloader
                </Link>
              </li>
              <li>
                <Link
                  to="/download-tiktok-videos"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  TikTok Downloader
                </Link>
              </li>
              <li>
                <Link
                  to="/download-facebook-reels"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Facebook Reels
                </Link>
              </li>
              <li>
                <Link
                  to="/download-instagram-videos"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Instagram Downloader
                </Link>
              </li>
            </ul>
          </div>

          {/* Document & Utility Tools */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Documents & PDF
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link
                  to="/image-to-pdf"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Image to PDF
                </Link>
              </li>
              <li>
                <Link
                  to="/merge-pdf"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Merge PDF
                </Link>
              </li>
              <li>
                <Link
                  to="/pdf-to-word"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  PDF to Word
                </Link>
              </li>
              <li>
                <Link
                  to="/word-to-pdf"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Word to PDF
                </Link>
              </li>
              <li>
                <Link
                  to="/protect-pdf"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Protect PDF
                </Link>
              </li>
              <li>
                <Link
                  to="/qr-code-generator"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  QR Code Generator
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              About & Legal
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link
                  to="/about"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-and-conditions"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/aashisrjl/toolshub-aashis"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  GitHub Project
                </a>
              </li>
              <li>
                <a
                  href="https://aashishrijal.com.np"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Creator Website (aashishrijal.com.np)
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {currentYear} Toolbox. Built by{" "}
            <a
              href="https://aashishrijal.com.np"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline decoration-muted-foreground/40 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
            >
              Aashis Rijal
            </a>
            .
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="transition-colors hover:text-foreground">
              Privacy
            </Link>
            <span>•</span>
            <Link to="/terms-and-conditions" className="transition-colors hover:text-foreground">
              Terms
            </Link>
            <span>•</span>
            <Link to="/contact" className="transition-colors hover:text-foreground">
              Contact
            </Link>
            <span>•</span>
            <a
              href="mailto:aashisrijal252@gmail.com"
              className="transition-colors hover:text-primary"
            >
              aashisrijal252@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
