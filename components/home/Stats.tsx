'use client';

import { motion } from 'framer-motion';

const stats = [
  { value: '10K+', label: 'Active Students' },
  { value: '500+', label: 'Courses Available' },
  { value: '200+', label: 'Expert Instructors' },
  { value: '95%', label: 'Satisfaction Rate' },
];

export function Stats() {
  return (
    <section className="py-16 border-t border-border bg-card/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, index) => (
            <motion.div 
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ 
                type: "spring", 
                stiffness: 100, 
                delay: index * 0.1 
              }}
              className="text-center"
            >
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                className="text-4xl font-bold text-primary mb-1"
              >
                {s.value}
              </motion.p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}