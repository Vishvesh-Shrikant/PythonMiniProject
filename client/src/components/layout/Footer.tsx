'use client'; // Ensure this runs on the client

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Footer() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

    useEffect(() => {
        // Set the year only on the client side after hydration
        setCurrentYear(new Date().getFullYear());
    }, []);

  return (
    <footer className="bg-secondary text-secondary-foreground py-8 mt-16">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">AcademiaConnect</h3>
          <p className="text-sm text-muted-foreground">Connecting minds for collaborative research.</p>
        </div>
        <div>
          <h4 className="text-md font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/directory" className="hover:text-primary">Directory</Link></li>
            <li><Link href="/matches" className="hover:text-primary">Matches</Link></li>
            <li><Link href="/faq" className="hover:text-primary">FAQs</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-md font-semibold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
            <li><Link href="/contact" className="hover:text-primary">Contact Us</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 pt-4 border-t border-muted">
        <p className="text-center text-sm text-muted-foreground">
          © {currentYear || 'Loading year...'} AcademiaConnect. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

    