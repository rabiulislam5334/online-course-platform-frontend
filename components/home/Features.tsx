'use client';

import { motion } from 'framer-motion';
import { BookOpen, Zap, Award, Shield, Globe, CheckCircle } from 'lucide-react';

const features = [
  { icon: <BookOpen className="h-6 w-6" />, title: 'Expert-led Courses', desc: 'Learn from industry professionals with real-world experience in their fields.', color: 'text-primary bg-primary/10 border-primary/20' },
  { icon: <Zap className="h-6 w-6" />, title: 'Interactive Quizzes', desc: 'Test your knowledge with timed quizzes and get instant feedback on your answers.', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  { icon: <Award className="h-6 w-6" />, title: 'Earn Certificates', desc: 'Pass the quiz and download your certificate of completion as a PDF instantly.', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  { icon: <Shield className="h-6 w-6" />, title: 'Role-based Access', desc: 'Separate dashboards for Admins, Instructors, and Students with permissions.', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  { icon: <Globe className="h-6 w-6" />, title: 'Learn Anywhere', desc: 'Fully responsive design lets you learn on any device, anytime, anywhere.', color: 'text-pink-400 bg-pink-400/10 border-pink-400/20' },
  { icon: <CheckCircle className="h-6 w-6" />, title: 'Track Progress', desc: 'Visual progress bars show exactly how far you have come in each course.', color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' },
];

export function Features() {
  return (
    <section id="features" className="py-20 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Features</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Everything you need to succeed</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">A complete learning management system built for students, instructors, and administrators.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, index) => (
            <motion.div 
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border ${f.color}`}>
                {f.icon}
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}