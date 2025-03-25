import { Link } from "next-view-transitions"

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold">AniVerse</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Discover and explore anime with detailed information and recommendations.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Navigation</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/trending" className="text-muted-foreground hover:text-primary">
                  Trending
                </Link>
              </li>
              <li>
                <Link href="/genres" className="text-muted-foreground hover:text-primary">
                  Genres
                </Link>
              </li>
              <li>
                <Link href="/seasonal" className="text-muted-foreground hover:text-primary">
                  Seasonal
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Resources</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <a
                  href="https://anilist.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  AniList
                </a>
              </li>
              <li>
                <a
                  href="https://nextjs.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  Next.js
                </a>
              </li>
              <li>
                <a
                  href="https://upstash.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  Upstash Redis
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Legal</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} AniVerse. All rights reserved.</p>
          <p className="mt-2">
            Powered by{" "}
            <a
              href="https://anilist.co"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary"
            >
              AniList
            </a>
            . This website is not affiliated with or endorsed by AniList.
          </p>
        </div>
      </div>
    </footer>
  )
}

