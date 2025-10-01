import React from 'react';
import { motion } from 'framer-motion';
import { Scale, FileText, Brain, CheckCircle, ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HomePage = ({ onStartCase }) => {
  const features = [
    {
      icon: FileText,
      title: 'Analyse de documents',
      description: 'Notre IA extrait les faits clés de vos contrats et preuves.'
    },
    {
      icon: Brain,
      title: 'Analyse Juridique',
      description: 'Algorithmes basés sur le droit québécois pour une analyse pertinente.'
    },
    {
      icon: CheckCircle,
      title: 'Résolution Efficace',
      description: 'Recevez une proposition de règlement en moins de 72 heures.'
    },
    {
      icon: Shield,
      title: 'Sécurité Maximale',
      description: 'Vos données sont chiffrées et traitées en toute confidentialité.'
    }
  ];

  const stats = [
    { number: '500+', label: 'Dossiers traités' },
    { number: '85%', label: 'Taux de résolution' },
    { number: '48h', label: 'Délai moyen' },
    { number: '4.8/5', label: 'Satisfaction client' }
  ];

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 text-center">
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-text-primary mb-6 font-serif">
              L'arbitrage de demain,
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-blue to-accent-cyan">
                aujourd'hui.
              </span>
            </h1>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
              PAVIA utilise une IA de pointe pour analyser vos litiges et proposer des solutions équitables, en total respect du cadre juridique québécois.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button 
              onClick={onStartCase}
              className="btn-primary text-lg px-8 py-6"
            >
              Démarrer une analyse
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline"
              className="text-lg px-8 py-6 border-dark-border text-text-secondary hover:text-text-primary hover:border-text-primary"
              onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
            >
              Comment ça marche
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Legal Disclaimer */}
      <section className="py-8 bg-dark-card/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="legal-disclaimer">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-warning-orange mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-warning-orange mb-2">Avertissement Légal</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  <strong>PAVIA fournit des analyses non-contraignantes à titre informatif.</strong> 
                  Nos recommandations ne sont pas des conseils juridiques. Pour des conseils spécifiques, consultez un avocat. Conforme aux règles du Barreau du Québec.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4 font-serif">
              Une plateforme conçue pour la clarté
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Nous transformons la complexité juridique en un processus simple et transparent.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-8 rounded-xl glass-effect card-hover"
              >
                <div className="w-16 h-16 bg-primary-blue/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-primary-blue/20">
                  <feature.icon className="w-8 h-8 text-primary-blue" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-3">{feature.title}</h3>
                <p className="text-text-secondary">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-dark-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4 font-serif">
              Votre résolution en 4 étapes
            </h2>
            <p className="text-xl text-text-secondary">
              Un processus intuitif pour des résultats rapides.
            </p>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-dark-border -translate-y-1/2"></div>
            <div className="grid md:grid-cols-4 gap-12 relative">
              {[
                { step: '1', title: 'Soumission', description: 'Décrivez votre litige et uploadez vos documents en toute sécurité.' },
                { step: '2', title: 'Analyse IA', description: 'Notre IA traite vos informations et identifie les points clés.' },
                { step: '3', title: 'Clarification', description: 'Répondez à quelques questions pour affiner l\'analyse.' },
                { step: '4', title: 'Rapport', description: 'Recevez une analyse complète et des propositions de règlement.' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-dark-card border-2 border-primary-blue text-primary-blue rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold relative z-10">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-3">{item.title}</h3>
                  <p className="text-text-secondary">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center glass-effect p-8 rounded-xl"
              >
                <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-blue to-accent-cyan mb-2">{stat.number}</div>
                <div className="text-text-secondary">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-text-primary mb-6 font-serif">
              Prêt à trouver une solution ?
            </h2>
            <p className="text-xl text-text-secondary mb-8">
              Lancez votre dossier et laissez notre technologie vous guider vers une résolution.
            </p>
            <Button 
              onClick={onStartCase}
              className="btn-primary text-lg px-8 py-6"
            >
              Commencer mon dossier
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;