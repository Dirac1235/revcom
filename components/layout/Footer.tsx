import Link from 'next/link';
import { Container } from './Container';
import { ROUTES } from '@/lib/constants/routes';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-gradient-to-r from-blue-50/50 via-indigo-50/50 to-purple-50/50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 border-blue-100 dark:border-blue-900/50 mt-auto">
      <Container className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              RevCom
            </h3>
            <p className="text-sm text-muted-foreground">
              Ethiopia's premier B2B marketplace connecting buyers and sellers across the nation.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-muted-foreground hover:text-blue-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-blue-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-blue-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-blue-600 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-blue-600 dark:text-blue-400">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={ROUTES.HOME} className="text-muted-foreground hover:text-blue-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href={ROUTES.PRODUCTS} className="text-muted-foreground hover:text-blue-600 transition-colors">
                  Browse Products
                </Link>
              </li>
              <li>
                <Link href={ROUTES.LISTINGS} className="text-muted-foreground hover:text-blue-600 transition-colors">
                  Buyer Requests
                </Link>
              </li>
              <li>
                <Link href={ROUTES.SELLER_EXPLORE} className="text-muted-foreground hover:text-blue-600 transition-colors">
                  Sell on RevCom
                </Link>
              </li>
            </ul>
          </div>

          {/* For Buyers */}
          <div>
            <h4 className="font-semibold mb-4 text-blue-600 dark:text-blue-400">For Buyers</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={ROUTES.BUYER_REQUEST_CREATE} className="text-muted-foreground hover:text-blue-600 transition-colors">
                  Post a Request
                </Link>
              </li>
              <li>
                <Link href={ROUTES.BUYER_REQUESTS} className="text-muted-foreground hover:text-blue-600 transition-colors">
                  My Requests
                </Link>
              </li>
              <li>
                <Link href={ROUTES.BUYER_ORDERS} className="text-muted-foreground hover:text-blue-600 transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href={ROUTES.MESSAGES} className="text-muted-foreground hover:text-blue-600 transition-colors">
                  Messages
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-blue-600 dark:text-blue-400">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Addis Ababa, Ethiopia</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+251 11 123 4567</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>support@revcom.et</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-blue-100 dark:border-blue-900/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>&copy; {currentYear} RevCom. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-blue-600 transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-blue-600 transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-blue-600 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
