import Link from "next/link"
import { Github, Twitter, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="relative z-10 border-t bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">VTEX Dashboard</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ecommerce Vtex
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="text-muted-foreground transition-colors hover:text-foreground">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/products"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/orders"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Orders
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/settings"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://developers.vtex.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://help.vtex.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="https://community.vtex.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Community
                </a>
              </li>
              <li>
                <a
                  href="https://status.vtex.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Status
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="https://cv-next-delta.vercel.app/" className="text-muted-foreground transition-colors hover:text-foreground">
                  About
                </Link>
              </li>
              <li>
                <Link href="https://www.linkedin.com/in/yesid-banguera-arboleda-042280167/" className="text-muted-foreground transition-colors hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} VTEX Dashboard. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex gap-4">
            <a
              href="https://github.com/DevYesidArboleda"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="GitHub"
            >
              <Github className="size-5" />
            </a>            
            <a
              href="https://www.linkedin.com/in/yesid-banguera-arboleda-042280167/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="LinkedIn"
            >
              <Linkedin className="size-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
