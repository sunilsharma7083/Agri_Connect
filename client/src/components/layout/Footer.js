import React from 'react';
import { Link } from 'react-router-dom';
import {
  RectangleStackIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import {
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  LinkedInIcon
} from '../common/SocialIcons';

const Footer = () => {
  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'How It Works', href: '/how-it-works' },
      { name: 'Careers', href: '/careers' },
      { name: 'Blog', href: '/blog' }
    ],
    farmers: [
      { name: 'Sell Grain', href: '/farmer/add-grain' },
      { name: 'Farmer Guide', href: '/farmer-guide' },
      { name: 'Quality Standards', href: '/quality-standards' },
      { name: 'Pricing', href: '/pricing' }
    ],
    buyers: [
      { name: 'Browse Grains', href: '/grains' },
      { name: 'Buyer Guide', href: '/buyer-guide' },
      { name: 'Bulk Orders', href: '/bulk-orders' },
      { name: 'Logistics', href: '/logistics' }
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Report Issue', href: '/report' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Refund Policy', href: '/refunds' }
    ]
  };

  const socialLinks = [
    { name: 'Facebook', icon: FacebookIcon, href: '#' },
    { name: 'Twitter', icon: TwitterIcon, href: '#' },
    { name: 'Instagram', icon: InstagramIcon, href: '#' },
    { name: 'LinkedIn', icon: LinkedInIcon, href: '#' }
  ];

  const contactInfo = [
    {
      icon: PhoneIcon,
      label: 'Phone',
      value: '+91 98765 43210'
    },
    {
      icon: EnvelopeIcon,
      label: 'Email',
      value: 'support@kisaan.com'
    },
    {
      icon: MapPinIcon,
      label: 'Address',
      value: 'New Delhi, India'
    }
  ];

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <div className="bg-green-600 text-white p-2 rounded-lg">
                <RectangleStackIcon className="h-6 w-6" />
              </div>
              <span className="ml-2 text-xl font-bold">Kisaan</span>
            </div>
            <p className="text-gray-300 dark:text-gray-400 mb-6 max-w-md">
              Connecting farmers with buyers for transparent, fair, and efficient grain trading across India.
            </p>
            
            {/* Social links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-green-400 transition-colors duration-200"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Company links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-200 dark:text-gray-300 uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 dark:text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Farmers links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-200 dark:text-gray-300 uppercase tracking-wider mb-4">
              For Farmers
            </h3>
            <ul className="space-y-3">
              {footerLinks.farmers.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 dark:text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Buyers links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-200 dark:text-gray-300 uppercase tracking-wider mb-4">
              For Buyers
            </h3>
            <ul className="space-y-3">
              {footerLinks.buyers.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 dark:text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-200 dark:text-gray-300 uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 dark:text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact section */}
        <div className="border-t border-gray-800 dark:border-gray-700 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <h3 className="text-lg font-semibold text-gray-200 dark:text-gray-300 mb-4 md:col-span-3">
              Get in Touch
            </h3>
            {contactInfo.map((contact, index) => (
              <div key={index} className="flex items-start">
                <contact.icon className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-200 dark:text-gray-300">{contact.label}</p>
                  <p className="text-sm text-gray-300 dark:text-gray-400">{contact.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter signup */}
        <div className="border-t border-gray-800 dark:border-gray-700 py-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-gray-200 dark:text-gray-300 mb-2">
                Newsletter
              </h3>
              <p className="text-gray-300 dark:text-gray-400 text-sm">
                Stay updated with the latest news and offers from Kisaan.
              </p>
            </div>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 min-w-0 px-4 py-2 bg-gray-800 dark:bg-gray-700 border border-gray-600 dark:border-gray-500 rounded-l-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-400"
              />
              <button className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-r-md transition-colors duration-200">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Legal links */}
        <div className="border-t border-gray-800 dark:border-gray-700 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex flex-wrap space-x-6 mb-4 md:mb-0">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-300 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              © {new Date().getFullYear()} Kisaan. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
