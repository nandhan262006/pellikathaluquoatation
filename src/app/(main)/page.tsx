import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.webp"
              alt="Pellikathalu"
              width={226}
              height={36}
              preload
              className="h-9 w-auto"
            />
          </Link>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 py-4 flex-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-4xl mb-2">
          Capture Your Best Moments
        </h1>
        <p className="text-base text-muted-foreground mb-4 max-w-2xl mx-auto">
          Professional photography services tailored to your needs. Book a
          session with our talented photographers.
        </p>
        <Link
          href="/estimator"
          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-primary text-primary-foreground px-4 h-9 text-sm font-medium hover:bg-primary/80"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Estimate an Event
        </Link>
      </section>
    </div>
  );
}
