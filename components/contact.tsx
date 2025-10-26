'use client';

import { Calendar, Mail, Phone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Contact() {
  return (
    <div id="contact" className="w-full flex items-center justify-center px-3 pt-12 pb-18 bg-black">
      <div className="w-full max-w-[500px] space-y-3">
        {/* Header */}
        <div className="text-center space-y-0.5 mb-4">
          <h1 className="text-2xl sm:text-2xl font-bold text-white">
            Get In Touch
          </h1>
          <p className="text-[10px] sm:text-xs text-gray-400">
            We typically respond within 24 hours
          </p>
        </div>

        {/* Book a Session Card */}
        <div className="border border-gray-700 bg-zinc-900 p-3 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-gray-300" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-white">
                Book a Free Session
              </h2>
              <p className="text-[10px] text-gray-400">
                Schedule a consultation
              </p>
            </div>
            <Button
              asChild
              className="border border-gray-600 bg-zinc-900 text-gray-300 hover:bg-gray-800 hover:border-gray-500 font-medium px-4 py-2 text-xs rounded-md h-auto flex-shrink-0"
            >
              <a
                href="https://calendly.com/pakalfz/ingredient"
                target="_blank"
                rel="noopener noreferrer"
              >
                Schedule
              </a>
            </Button>
          </div>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-2 gap-2">
          {/* Email */}
          <div className="border border-gray-700 bg-zinc-900 p-2.5 rounded-lg transition-all">
            <div className="flex flex-col items-center text-center gap-1.5">
              <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center">
                <Mail className="w-3.5 h-3.5 text-gray-300" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-[10px]">Email</h3>
                <a
                  href="mailto:team@ingredia.pro"
                  className="text-[9px] text-gray-400 hover:text-gray-300 transition-colors break-all block"
                >
                  team@ingredia.pro
                </a>
              </div>
            </div>
          </div>

          {/* Phone */}
          <div className="border border-gray-700 bg-zinc-900 p-2.5 rounded-lg transition-all">
            <div className="flex flex-col items-center text-center gap-1.5">
              <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center">
                <Phone className="w-3.5 h-3.5 text-gray-300" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-[10px]">Call</h3>
                <a
                  href="tel:+447743768694"
                  className="text-[9px] text-gray-400 hover:text-gray-300 transition-colors block"
                >
                  +44 7743 768694
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* SMS */}
        <div className="border border-gray-700 bg-zinc-900 p-2.5 rounded-lg transition-all">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-3.5 h-3.5 text-gray-300" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-[10px]">
                Text Message
              </h3>
              <p className="text-[9px] text-gray-400">
                Prefer texting? Send us a message
              </p>
            </div>
            <Button
              asChild
              className="border border-gray-600 bg-zinc-900 text-gray-300 hover:bg-gray-800 hover:border-gray-500 flex-shrink-0 text-[10px] px-3 py-1.5 h-auto rounded-md"
            >
              <a href="sms:+447743768694">Send SMS</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
