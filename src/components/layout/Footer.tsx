import { Link } from "react-router-dom";
import { Gift, MapPin, Mail, Phone } from "lucide-react";

const footerLinks = {
  marketplace: [
    { name: "Browse Gifts", path: "/vendors" },
    { name: "Categories", path: "/categories" },
    { name: "Featured Vendors", path: "/vendors" },
  ],
  vendors: [
    { name: "Become a Vendor", path: "/register" },
    { name: "Vendor Guidelines", path: "/register" },
    { name: "Success Stories", path: "/" },
  ],
  company: [
    { name: "About Giftora", path: "/" },
    { name: "Contact Us", path: "/" },
    { name: "Privacy Policy", path: "/" },
  ],
};

const regions = ["Nigeria", "Dubai", "United Kingdom", "United States"];

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/50">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-gold shadow-soft">
                <Gift className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-heading text-2xl font-bold text-foreground">
                Giftora
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              The global marketplace for premium gifts. Connect with trusted
              vendors for gift boxes, hampers, and customized gifts worldwide.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {regions.map((region) => (
                <span
                  key={region}
                  className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  <MapPin className="h-3 w-3" />
                  {region}
                </span>
              ))}
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-foreground">
              Marketplace
            </h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.marketplace.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Vendors */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-foreground">
              For Vendors
            </h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.vendors.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-foreground">
              Company
            </h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2024 Giftora. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="mailto:hello@giftora.com"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <Mail className="h-4 w-4" />
              hello@giftora.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
