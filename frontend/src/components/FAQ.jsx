import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import DOMPurify from 'dompurify';
import { Plus, Minus } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(null);
  const sectionRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    const controller = new AbortController();
    const fetchFaqs = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/content/faqs`, { signal: controller.signal });
        if (response.data.faqs) {
          setFaqs(response.data.faqs);
        }
      } catch (error) {
        if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') return;
        console.error('Failed to fetch FAQs:', error);
        toast({ title: 'Failed to load FAQs', variant: 'destructive' });
        setFaqs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      controller.abort();
      observer.disconnect();
    };
  }, []);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="pt-12 pb-20 md:pt-14 px-6 lg:px-8 bg-black scroll-mt-20">
      <div className="max-w-4xl mx-auto">
        <div ref={sectionRef} className="text-center mb-12 opacity-0">
          <div className="inline-block px-4 py-2 mb-6 rounded-full bg-purple-600/10 border border-purple-500/20">
            <span className="text-white text-sm font-semibold uppercase tracking-wider">
              FAQ
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Your questions
            <span className="block mt-2 pb-2 leading-[1.15] bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              answered
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mt-4">
            Everything you need to know about our services
          </p>
        </div>

        {loading ? (
          <div className="text-center text-white">Loading FAQs...</div>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="group bg-gray-900/50 rounded-2xl border border-gray-800 hover:border-purple-500/50 transition-all duration-300 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                  aria-expanded={openIndex === index}
                >
                  <span className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors pr-8 rich-text-content">
                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(faq.question) }} />
                  </span>
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      openIndex === index
                        ? 'bg-purple-600 rotate-180'
                        : 'bg-gray-800 group-hover:bg-gray-700'
                    }`}
                  >
                    {openIndex === index ? (
                      <Minus className="w-4 h-4 text-white" />
                    ) : (
                      <Plus className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out ${
                    openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="px-6 pb-6">
                    <div className="pt-2 border-t border-gray-800">
                      <div className="text-gray-400 leading-relaxed mt-4 rich-text-content">
                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(faq.answer) }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Optional CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">Still have questions?</p>
          <button
            onClick={() =>
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
          >
            Get in touch →
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
