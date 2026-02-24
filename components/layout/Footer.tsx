import Link from "next/link";
import { Container } from "./Container";
import { ROUTES } from "@/lib/constants/routes";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background border-border mt-auto">
      <Container className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="space-y-6">
            <h3 className="text-2xl font-serif font-bold text-foreground tracking-tight">
              RevCom
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ethiopia's premier B2B marketplace connecting buyers and sellers
              across the nation.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-medium mb-6 text-foreground">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href={ROUTES.HOME}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.PRODUCTS}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Browse Products
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.REQUESTS}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Buyer Requests
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.SELLER_EXPLORE}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sell on RevCom
                </Link>
              </li>
            </ul>
          </div>

          {/* For Buyers */}
          <div>
            <h4 className="font-medium mb-6 text-foreground">For Buyers</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href={ROUTES.BUYER_REQUEST_CREATE}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Post a Request
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.BUYER_REQUESTS}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  My Requests
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.BUYER_ORDERS}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  My Orders
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.MESSAGES}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Messages
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-medium mb-6 text-foreground">Contact Us</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Addis Ababa, Ethiopia</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-4 h-4 shrink-0" />
                <span>+251 11 123 4567</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-4 h-4 shrink-0" />
                <span>support@revcom.et</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>&copy; {currentYear} RevCom. All rights reserved.</p>
            <div className="flex gap-8">
              <Link
                href="#"
                className="hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="#"
                className="hover:text-foreground transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
