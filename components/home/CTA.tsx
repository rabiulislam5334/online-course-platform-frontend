'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTA() {
  return (
    <section className="py-20 border-t border-border">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-primary/20 bg-primary/5 p-10 md:p-14 relative overflow-hidden group"
        >
          {/* Animated Background Pulse */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3] 
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute inset-0 bg-primary/5 rounded-full blur-3xl -z-10"
          />

          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to start learning?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Join thousands of students already on <span className="text-primary font-semibold">Skillora</span>. 
            Create your free account today and unlock your potential.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild size="lg" className="gap-2 px-8 w-full sm:w-auto shadow-xl shadow-primary/20">
                <Link href="/auth/register">
                  Create Free Account <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild size="lg" variant="outline" className="px-8 w-full sm:w-auto">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}