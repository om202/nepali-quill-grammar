'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "How does Vyakaranly help improve my Nepali writing?",
    answer: "Vyakaranly uses advanced AI to analyze your Nepali text and provide suggestions for grammar corrections, style improvements, and better word choices. It helps you write more confidently in Devanagari script while learning proper Nepali grammar rules."
  },
  {
    question: "Can I type in English and get Nepali text?",
    answer: "Yes! Vyakaranly supports romanized input, allowing you to type in English characters that automatically convert to Nepali Devanagari script. For example, typing 'namaste' will convert to 'नमस्ते'. This makes it easy for anyone to write in Nepali."
  },
  {
    question: "Is my text data secure and private?",
    answer: "Absolutely. We take your privacy seriously. Your text is processed securely and is not stored permanently on our servers. We use enterprise-grade encryption and follow strict data protection protocols to ensure your writing remains confidential."
  },
  {
    question: "Do I need to create an account to use Vyakaranly?",
    answer: "Yes, you need to create a free account to use Vyakaranly. This allows us to provide you with personalized suggestions, save your writing history, and give you access to all features including advanced grammar analysis and keyboard shortcuts."
  },
  {
    question: "How accurate are the grammar and style suggestions?",
    answer: "Our AI is specifically trained on Nepali language patterns and grammar rules. While we strive for high accuracy, we recommend reviewing suggestions as language can be contextual. The system continuously learns and improves from usage patterns."
  },
  {
    question: "Can I use Vyakaranly for different types of writing?",
    answer: "Currently, Vyakaranly provides general Nepali grammar and style suggestions. We're working on adding support for different writing styles like formal documents, creative writing, and academic papers. Stay tuned for these exciting features!"
  },
  {
    question: "Is there a limit to how much text I can analyze?",
    answer: "Currently, there are no limits on how much text you can analyze - it's completely unlimited! However, we're planning to introduce usage tiers in the future to ensure sustainable service for all users."
  },
  {
    question: "What browsers and devices are supported?",
    answer: "Vyakaranly works on all modern web browsers including Chrome, Firefox, Safari, and Edge. It's fully responsive and works on desktop computers, tablets, and mobile phones for writing on the go."
  },
  {
    question: "How do I learn the romanized keyboard layout?",
    answer: "We provide an interactive keyboard guide that shows you how English characters map to Nepali Devanagari script. You can access this guide anytime while writing, and with practice, typing in Nepali becomes second nature."
  },
  {
    question: "Can I export or save my corrected text?",
    answer: "Yes! You can easily copy your improved text and use it anywhere. Your writing history is automatically saved in your account, so you can always access your previous texts and corrections for future reference."
  }
];

export const FAQSection: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className='w-full bg-white py-16 px-4'>
      <div className='max-w-4xl mx-auto'>
        {/* Section Header */}
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold text-gray-900 mb-4'>
            Frequently Asked Questions
          </h2>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            Everything you need to know about Vyakaranly and improving your Nepali writing
          </p>
        </div>

        {/* FAQ Items */}
        <div className='space-y-4'>
          {faqData.map((item, index) => (
            <div
              key={index}
              className='border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors duration-200'
            >
              <button
                onClick={() => toggleItem(index)}
                className='w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:bg-gray-50'
              >
                <span className='font-semibold text-gray-900 pr-4'>
                  {item.question}
                </span>
                {openItems.includes(index) ? (
                  <ChevronUp className='h-5 w-5 text-gray-500 flex-shrink-0' />
                ) : (
                  <ChevronDown className='h-5 w-5 text-gray-500 flex-shrink-0' />
                )}
              </button>
              
              {openItems.includes(index) && (
                <div className='px-6 pb-4 pt-2 border-t border-gray-100 bg-gray-50'>
                  <p className='text-gray-700 leading-relaxed'>
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className='text-center mt-12 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg'>
          <h3 className='text-xl font-semibold text-gray-900 mb-2'>
            Still have questions?
          </h3>
          <p className='text-gray-600 mb-4'>
            We're here to help you get the most out of Vyakaranly
          </p>
          <button className='bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200'>
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}; 