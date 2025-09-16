'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SignUpButton, useUser } from '@clerk/nextjs';

interface CarouselSlide {
  id: number;
  title: string;
  subtitle?: string;
  description: string;
  gradient: string;
}

const slides: CarouselSlide[] = [
  {
    id: 1,
    title: "Unleash Your Creativity",
    subtitle: "and Boost Your Productivity",
    description: "Storm Notes is an intelligent suite powered by Gemini. Generate stunning content, from text to images, and streamline your workflow with powerful productivity tools.",
    gradient: "from-blue-600 via-purple-600 to-blue-800"
  },
  {
    id: 2,
    title: "Content Generator",
    subtitle: "Bring Your Ideas to Life",
    description: "Select your content type and let Gemini create for you. Generate stunning content, from text to images, with AI-powered creativity tools.",
    gradient: "from-green-600 via-teal-600 to-blue-600"
  },
  {
    id: 3,
    title: "Productivity Suite",
    subtitle: "Intelligent Dashboard",
    description: "Your intelligent dashboard for time management, contacts, and document workflows. Streamline your productivity with powerful tools.",
    gradient: "from-purple-600 via-purple-500 to-blue-600"
  },
  {
    id: 4,
    title: "AI-Powered Workflows",
    subtitle: "Gemini Integration",
    description: "Transform your workflow with intelligent automation. Built for professionals, teams, and anyone who values efficient time management.",
    gradient: "from-pink-600 via-rose-600 to-orange-600"
  },
  {
    id: 5,
    title: "Storm Notes Platform",
    subtitle: "All-in-One Solution",
    description: "Comprehensive productivity platform combining content generation, time management, and workflow automation in one intelligent suite.",
    gradient: "from-indigo-600 via-blue-600 to-cyan-600"
  }
];

interface HeroCarouselProps {
  onGetStarted: () => void;
}

export default function HeroCarousel({ onGetStarted }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { isSignedIn } = useUser();

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  return (
    <div className="relative w-4/5 h-96 overflow-hidden rounded-2xl mx-auto mt-6 shadow-2xl">
      {/* Carousel Container */}
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`min-w-full h-full bg-gradient-to-r ${slide.gradient} flex items-center justify-center text-white relative`}
          >
            <div className="text-center px-8 max-w-4xl">
              {/* Main Content */}
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                {slide.title}
                {slide.subtitle && (
                  <>
                    <br />
                    <span className="text-blue-200">{slide.subtitle}</span>
                  </>
                )}
              </h1>
              
              <p className="text-lg md:text-xl opacity-90 leading-relaxed max-w-3xl mx-auto mb-8">
                {slide.description}
              </p>

              {/* Get Started Button - only on first slide */}
              {index === 0 && (
                <div className="mt-6">
                  {isSignedIn ? (
                    <button 
                      onClick={onGetStarted}
                      className="rounded-md bg-white/20 backdrop-blur-sm hover:bg-white/30 px-6 py-3 text-lg font-semibold text-white shadow-sm border border-white/20 hover:border-white/40 transition-all duration-200"
                    >
                      Get Started
                    </button>
                  ) : (
                    <SignUpButton>
                      <button className="rounded-md bg-white/20 backdrop-blur-sm hover:bg-white/30 px-6 py-3 text-lg font-semibold text-white shadow-sm border border-white/20 hover:border-white/40 transition-all duration-200">
                        Get Started
                      </button>
                    </SignUpButton>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-200 group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-200 group"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentSlide 
                ? 'bg-white scale-110' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Auto-play indicator */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-200"
          aria-label={isAutoPlaying ? "Pause auto-play" : "Resume auto-play"}
        >
          <div className={`w-4 h-4 ${isAutoPlaying ? 'animate-pulse' : ''}`}>
            {isAutoPlaying ? (
              <div className="w-full h-full bg-white rounded-full"></div>
            ) : (
              <div className="w-full h-full border-2 border-white rounded-full"></div>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
