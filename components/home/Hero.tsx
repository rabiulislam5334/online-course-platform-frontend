'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Users, Award, ArrowRight, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  // অ্যানিমেশন ভ্যারিয়েন্টস
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const stats = [
    { icon: <Users className="h-4 w-4" />, text: '10,000+ Students' },
    { icon: <BookOpen className="h-4 w-4" />, text: '500+ Courses' },
    { icon: <Award className="h-4 w-4" />, text: 'Verified Certificates' },
    { icon: <Star className="h-4 w-4 text-yellow-400" />, text: '4.9/5 Rating' },
  ];

  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.2 }}
          className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" 
        />
      </div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center"
      >
        {/* Top Badge */}
        <motion.div variants={fadeInUp} className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
          <Zap className="h-3 w-3" /> The smart way to learn online
        </motion.div>

        {/* Heading */}
        <motion.h1 
          variants={fadeInUp}
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6 tracking-tight"
        >
          Learn, Grow & <span className="text-primary">Get Certified</span>
        </motion.h1>

        {/* Description */}
        <motion.p 
          variants={fadeInUp}
          className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground mb-10"
        >
          Access courses taught by expert instructors. Track your progress, take quizzes, and earn certificates to showcase your skills.
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
          variants={fadeInUp}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button asChild size="lg" className="gap-2 text-base px-8 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
            <Link href="/auth/register">
              Start Learning Free <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-base px-8 hover:bg-secondary/80">
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </motion.div>

        {/* Stats Badges */}
        <motion.div 
          variants={staggerContainer}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
        >
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="flex items-center gap-2 bg-secondary/30 px-3 py-1.5 rounded-full border border-border/50 shadow-sm"
            >
              {stat.icon}
              <span className="font-medium">{stat.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}