import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-border pt-12 pb-8">
      <div className="max-w-1280 mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-2xl font-serif font-bold text-primary mb-4 block">
              Hiredan
            </Link>
            <p className="text-gray-600 max-w-sm">
              The most trusted and legitimate place in Ghana to find apartments.
              Connecting renters with verified landlords and agents.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-600 hover:text-primary">About Hiredan</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-primary">Contact Us</Link></li>
              <li><Link href="/dashboard/listings/new" className="text-gray-600 hover:text-primary">Post an Apartment</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/terms" className="text-gray-600 hover:text-primary">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-gray-600 hover:text-primary">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © 2026 Hiredan. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            {/* Social media placeholders */}
            <span className="text-gray-400 hover:text-primary cursor-pointer">Facebook</span>
            <span className="text-gray-400 hover:text-primary cursor-pointer">Instagram</span>
            <span className="text-gray-400 hover:text-primary cursor-pointer">Twitter</span>
            <span className="text-gray-400 hover:text-primary cursor-pointer">WhatsApp</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
