import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  CurrencyRupeeIcon,
  TruckIcon,
  UserGroupIcon,
  CheckCircleIcon,
  StarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Quality Assurance',
      description: 'Premium quality grains with certified standards and rigorous testing procedures.'
    },
    {
      icon: CurrencyRupeeIcon,
      title: 'Fair Pricing',
      description: 'Transparent pricing that ensures fair returns for farmers and competitive rates for buyers.'
    },
    {
      icon: TruckIcon,
      title: 'Logistics Support',
      description: 'End-to-end logistics solutions from farm to doorstep with real-time tracking.'
    },
    {
      icon: UserGroupIcon,
      title: 'Community Network',
      description: 'Connect with a trusted network of farmers, buyers, and agricultural experts.'
    }
  ];

  const benefits = [
    'Direct connection between farmers and buyers',
    'Transparent pricing with no hidden costs',
        'Quality guarantee on all grain products',
    'Secure payment processing and protection',
    'Comprehensive logistics and delivery support',
    'Multi-language support for better accessibility'
  ];

  const testimonials = [
    {
      name: 'राज कुमार',
      role: 'Farmer',
      location: 'पंजाब',
      content: 'Kisaan platform has revolutionized my farming business. I get better prices and direct access to buyers.',
      rating: 5
    },
    {
      name: 'अमित शर्मा',
      role: 'Buyer',
      location: 'दिल्ली',
      content: 'Excellent quality grains at competitive prices. The logistics support is outstanding.',
      rating: 5
    },
    {
      name: 'सुनीता देवी',
      role: 'Farmer',
      location: 'हरियाणा',
      content: 'Finally, a platform that understands farmers\' needs and provides genuine support.',
      rating: 5
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Happy Farmers' },
    { number: '5,000+', label: 'Trusted Buyers' },
    { number: '1,00,000+', label: 'Quintals Traded' },
    { number: '500+', label: 'Cities Served' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-white/40 dark:bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6"
            >
              🌾 Connecting Farmers to Markets
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto"
            >
              Empowering farmers with direct market access and fair pricing. Join thousands of farmers and buyers in India's premier grain trading platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {!user ? (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
                  >
                    Get Started
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    to="/grains"
                    className="inline-flex items-center justify-center px-8 py-4 border border-green-600 text-base font-medium rounded-md text-green-600 dark:text-green-400 bg-transparent hover:bg-green-50 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    Browse Grains
                  </Link>
                </>
              ) : (
                <Link
                  to={`/${user.role}/dashboard`}
                  className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
                >
                  Go to Dashboard
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Kisaan?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We provide everything you need for successful grain trading, from quality assurance to logistics support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full mb-6">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Benefits of Our Platform
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Join thousands of satisfied farmers and buyers who have transformed their grain trading experience with our comprehensive platform.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start"
                  >
                    <CheckCircleIcon className="h-6 w-6 text-green-500 mt-1 mr-3 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-w-4 aspect-h-3">
                <div className="bg-gradient-to-br from-green-400 to-blue-600 rounded-lg flex items-center justify-center text-white">
                  <div className="text-center p-8">
                    <div className="text-6xl mb-4">🌾</div>
                    <h3 className="text-2xl font-bold mb-2">Farm to Market</h3>
                    <p className="text-lg opacity-90">Direct Connection</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-green-600 dark:bg-green-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Our Impact in Numbers
            </h2>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              See how we're making a difference in the agricultural community across India.
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-lg text-green-100">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Real stories from farmers and buyers who have transformed their business with our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.role} • {testimonial.location}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-700 dark:to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Grain Trading?
            </h2>
            <p className="text-xl text-green-100 mb-12 max-w-2xl mx-auto">
              Join thousands of farmers and buyers who have already discovered the power of direct trading.
            </p>
            {!user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-base font-medium rounded-md text-green-600 bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  Start Trading Today
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/grains"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-base font-medium rounded-md text-white bg-transparent hover:bg-white/10 transition-colors duration-200"
                >
                  Explore Marketplace
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
