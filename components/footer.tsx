import Link from 'next/link'
import { Zap, Home, Grid3X3, User, FileText, CreditCard } from 'lucide-react'

const navigationLinks = [
  { href: '#home', label: 'Home', icon: Home },
  { href: '#modules', label: 'Modules', icon: Grid3X3 },
  { href: '#', label: 'Dashboard', icon: User },
  { href: '#', label: 'Terms of Service', icon: FileText },
]

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">Pulse</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              The best client for 1.21.11.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-foreground">Navigation</h3>
            <ul className="mt-4 space-y-3">
              {navigationLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="font-semibold text-foreground">Payment Methods</h3>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-8 items-center rounded bg-white px-2">
                <span className="text-xs font-bold text-blue-600">VISA</span>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded bg-white">
                <div className="flex">
                  <div className="h-4 w-4 rounded-full bg-red-500 opacity-80" />
                  <div className="-ml-2 h-4 w-4 rounded-full bg-yellow-400 opacity-80" />
                </div>
              </div>
              <div className="flex h-8 items-center rounded bg-white px-2">
                <CreditCard className="h-4 w-4 text-gray-600" />
              </div>
            </div>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-semibold text-foreground">Connect With Us</h3>
            <Link
              href="#"
              className="mt-4 flex items-center gap-3 rounded-lg bg-[#5865F2] p-3 transition-opacity hover:opacity-90"
            >
              <div className="flex h-8 w-8 items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Discord Server</p>
                <p className="text-xs text-white/70">Join our community</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="mt-12 border-t border-border/50 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              &copy; 2026 Pulse. All rights reserved.
            </p>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground/70 sm:text-left">
            Pulse Client is not affiliated with Mojang AB. The company&apos;s commercial activities comply with Mojang AB policy.
          </p>
        </div>
      </div>
    </footer>
  )
}
