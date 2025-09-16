'use client';

import React from 'react';
import { Clock, FileText, Users, Zap } from 'lucide-react';

interface FeatureCard {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
}

const features: FeatureCard[] = [
  {
    id: 1,
    title: "Time Management",
    description: "Intelligent timezone cards, time conversion tools, and smart reminders to keep you organized across global schedules.",
    icon: <Clock className="w-8 h-8" />,
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    id: 2,
    title: "Content Generation",
    description: "AI-powered content creation with Gemini integration. Generate text, images, and multimedia content effortlessly.",
    icon: <FileText className="w-8 h-8" />,
    gradient: "from-purple-500 to-pink-500"
  },
  {
    id: 3,
    title: "Contact Management",
    description: "Smart contact organization with AI-enhanced search, categorization, and relationship mapping for better networking.",
    icon: <Users className="w-8 h-8" />,
    gradient: "from-green-500 to-teal-500"
  },
  {
    id: 4,
    title: "Workflow Automation",
    description: "Streamline repetitive tasks with intelligent automation, document processing, and seamless integration workflows.",
    icon: <Zap className="w-8 h-8" />,
    gradient: "from-orange-500 to-red-500"
  }
];

export default function FeatureCards() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">Powerful Features</h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Discover the comprehensive suite of tools designed to enhance your productivity and creativity
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => (
          <div
            key={feature.id}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:transform hover:scale-105 group"
          >
            <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <div className="text-white">
                {feature.icon}
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-300 transition-colors">
              {feature.title}
            </h3>
            
            <p className="text-gray-400 leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
