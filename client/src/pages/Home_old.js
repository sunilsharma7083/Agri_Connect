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
  ];

  const testimonials = [
    {
      name: 'राज कुमार',
      role: t('home.testimonials.farmer'),
      location: 'पंजाब',
      content: t('home.testimonials.farmer1'),
      rating: 5
    },
    {
      name: 'अमित शर्मा',
      role: t('home.testimonials.buyer'),
      location: 'दिल्ली',
      content: t('home.testimonials.buyer1'),
      rating: 5
    },
    {
      name: 'सुनीता देवी',
      role: t('home.testimonials.farmer'),
      location: 'हरियाणा',
      content: t('home.testimonials.farmer2'),
      rating: 5
    }
  ];

  const stats = [
    { number: '10,000+', label: t('home.stats.farmers') },
    { number: '5,000+', label: t('home.stats.buyers') },
    { number: '1,00,000+', label: t('home.stats.quintals') },
    { number: '500+', label: t('home.stats.cities') }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-secondary-50 overflow-hidden">
        <div className="absolute inset-0 bg-white/40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              {t('home.hero.title')}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              {t('home.hero.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              {!user ? (
                <>
                  <Link
                    to="/register"
                    className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 flex items-center"
                  >
                    {t('home.hero.getStarted')}
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </Link>
                  
                  <Link
                    to="/grains"
                    className="border-2 border-primary-600 text-primary-600 hover:bg-primary-50 px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200"
                  >
                    {t('home.hero.browseGrains')}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to={`/${user.role}/dashboard`}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 flex items-center"
                  >
                    {t('home.hero.goToDashboard')}
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </Link>
                  
                  <Link
                    to="/grains"
                    className="border-2 border-primary-600 text-primary-600 hover:bg-primary-50 px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200"
                  >
                    {t('home.hero.browseGrains')}
                  </Link>
                </>
              )}
            </motion.div>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-24 text-white" fill="currentColor" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,60 Q300,120 600,60 T1200,60 L1200,120 L0,120 Z"></path>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('home.features.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('home.features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300"
              >
                <div className="bg-primary-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {t('home.benefits.title')}
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                {t('home.benefits.subtitle')}
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center"
                  >
                    <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl p-8 h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center mb-6 mx-auto shadow-lg">
                    <UserGroupIcon className="h-12 w-12 text-primary-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {t('home.benefits.joinCommunity')}
                  </h3>
                  <p className="text-gray-600">
                    {t('home.benefits.communityDescription')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('home.testimonials.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('home.testimonials.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-sm"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.content}"
                </p>
                
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">
                    {testimonial.role} • {testimonial.location}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t('home.cta.title')}
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            {t('home.cta.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <Link
                  to="/register"
                  className="bg-white text-primary-600 hover:bg-gray-50 px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 inline-flex items-center justify-center"
                >
                  {t('home.cta.joinNow')}
                </Link>
                
                <Link
                  to="/login"
                  className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200"
                >
                  {t('home.cta.signIn')}
                </Link>
              </>
            ) : (
              <Link
                to={`/${user.role}/dashboard`}
                className="bg-white text-primary-600 hover:bg-gray-50 px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 inline-flex items-center justify-center"
              >
                {t('home.cta.goToDashboard')}
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
