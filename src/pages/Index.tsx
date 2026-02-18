import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mic, Brain, Globe, Zap, ArrowRight, CheckCircle } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';
import Navbar from '@/components/Navbar';

const features = [
  {
    icon: Globe,
    title: 'Multiple Languages',
    desc: 'Practice Hindi, Spanish, French, and more with AI-generated sentences.',
  },
  {
    icon: Mic,
    title: 'Speech Analysis',
    desc: 'Speak sentences and get instant feedback on your pronunciation.',
  },
  {
    icon: Brain,
    title: 'AI-Powered',
    desc: 'Smart sentence generation adapts to your skill level over time.',
  },
  {
    icon: Zap,
    title: 'Real-time Feedback',
    desc: 'Instant accuracy scoring with corrections and translations.',
  },
];

const steps = [
  'Select your target language',
  'AI generates a practice sentence',
  'Speak the sentence aloud',
  'Get instant pronunciation feedback',
];

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-6">
              <Zap className="h-3.5 w-3.5" /> AI-Powered Language Learning
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Master Speaking with{' '}
              <span className="text-gradient">AI Precision</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground mb-10">
              Practice pronunciation in any language. Get real-time AI feedback on your speech
              and improve fluency faster than ever.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/signup"
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground hover:opacity-90 transition-opacity glow-primary"
              >
                Start Free <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-border px-8 py-3.5 text-base font-semibold text-foreground hover:bg-secondary transition-colors"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why <span className="text-gradient">SpeakAI</span>?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Our AI-powered platform gives you the tools to practice speaking naturally.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 hover:border-primary/30 transition-colors"
              >
                <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">Four simple steps to better pronunciation.</p>
          </motion.div>

          <div className="mx-auto max-w-lg space-y-4">
            {steps.map((step, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass rounded-xl p-4 flex items-center gap-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                  {i + 1}
                </div>
                <span className="text-sm font-medium">{step}</span>
                <CheckCircle className="ml-auto h-5 w-5 text-primary/40" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-12 md:p-16 max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to speak with <span className="text-gradient">confidence</span>?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Join thousands of learners improving their pronunciation with AI.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 font-semibold text-primary-foreground hover:opacity-90 transition-opacity glow-primary"
            >
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 SpeakAI. Built with AI microservices.
        </div>
      </footer>
    </div>
  );
};

export default Index;
