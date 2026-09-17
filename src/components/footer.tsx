import Link from "next/link";

const socialLinks = [
  { name: "Website", url: "https://storiesbyharsha.in/" },
  { name: "Instagram", url: "https://www.instagram.com/storiesbyharsha/" },
  { name: "YouTube", url: "https://www.youtube.com/@storiesbyharsha" },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between">
        <Link href="/" className="flex items-center">
          <span className="text-sm font-semibold tracking-tight">Stories by Harsha</span>
        </Link>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-[9999px] border border-border px-4 py-1.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.name}
            </a>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Stories by Harsha
        </p>
      </div>
    </footer>
  );
}
