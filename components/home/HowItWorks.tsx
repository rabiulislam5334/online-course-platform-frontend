'use client';

import { motion } from 'framer-motion';

const steps = [
  { num: '01', title: 'Create Account', desc: 'Sign up as Student or Instructor. Admin approves your account.' },
  { num: '02', title: 'Browse & Enroll', desc: 'Explore published courses and enroll with one click.' },
  { num: '03', title: 'Learn & Complete', desc: 'Watch videos, read content, and mark lessons complete.' },
  { num: '04', title: 'Get Certified', desc: 'Pass the quiz and download your PDF certificate.' },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Process</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How it works</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Get started in minutes and begin your learning journey today.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, index) => (
            <motion.div 
              key={s.num}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="group relative rounded-xl border border-border bg-card p-6 hover:border-primary/30 transition-all overflow-hidden"
            >
              {/* Background Number Decoration */}
              <div className="absolute -right-2 -bottom-2 text-7xl font-bold text-primary/5 group-hover:text-primary/10 transition-colors font-mono">
                {s.num}
              </div>
              
              <div className="mb-4 text-3xl font-bold text-primary/20 font-mono group-hover:text-primary/40 transition-colors">
                {s.num}
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed relative z-10">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}