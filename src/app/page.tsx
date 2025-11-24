"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const LandingPage = () => {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-linear-to-br from-primary via-tertiary to-accent animate-landing-gradient">
        <div className="absolute inset-0 backdrop-blur-3xl"></div>
      </div>

      {/* Content overlay */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-bold animate-text-color mb-6">
            Transform Your{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-pink-300 to-indigo-300">
              Career
            </span>
          </h1>
          <p className="text-xl animate-text-color max-w-2xl mx-auto">
            Create stunning CVs in minutes with our AI-powered platform
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="group p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 transition-all">
            <h3 className="text-2xl font-semibold animate-text-color mb-4 group-hover:translate-x-2 transition-transform">
              AI-Assisted Path ✨
            </h3>
            <p className="animate-text-color opacity-80">
              Upload your existing CV and watch our AI transform it instantly
              into a professional format.
            </p>
          </div>

          <div className="group p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 transition-all">
            <h3 className="text-2xl font-semibold animate-text-color mb-4 group-hover:translate-x-2 transition-transform">
              Manual Creation <PenSquare className="inline-block ml-1" />
            </h3>
            <p className="animate-text-color opacity-80">
              Start fresh and build your perfect CV using our intuitive
              interface.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 text-lg"
          >
            <Link href="/register">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="animate-signin-button px-8 text-lg hover:bg-white/20"
          >
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
