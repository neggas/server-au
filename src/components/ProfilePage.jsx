
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { User, Mail, Lock, Bell, FileText, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ProfilePage = ({ user, onBack }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    toast({
      title: "🚧 Fonctionnalité en développement",
      description: "La mise à jour du profil n'est pas encore implémentée.",
    });
  };

  const handleActionClick = () => {
    toast({
      title: "🚧 Fonctionnalité en développement",
      description: "Cette action n'est pas encore disponible.",
    });
  };

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4 mb-8">
          <Button onClick={onBack} variant="outline" className="flex items-center space-x-2 border-dark-border text-text-secondary hover:border-primary-blue hover:text-primary-blue">
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Button>
          <h1 className="text-3xl font-bold text-text-primary font-serif">
            Profil Utilisateur
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="glass-effect rounded-xl p-8"
            >
              <h2 className="text-xl font-semibold text-text-primary mb-6">Informations personnelles</h2>
              <div className="flex items-center space-x-6 mb-8">
                <Avatar className="h-20 w-20 border-4 border-primary-blue">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${formData.name}`} alt={formData.name} />
                  <AvatarFallback>{formData.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Button variant="outline" className="border-dark-border text-text-secondary" onClick={handleActionClick}>Changer la photo</Button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Nom complet</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-dark-bg border border-dark-border rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Adresse e-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-dark-bg border border-dark-border rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSave} className="btn-primary">Enregistrer les modifications</Button>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-effect rounded-xl p-8"
            >
              <h2 className="text-xl font-semibold text-text-primary mb-6">Sécurité</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-text-primary">Changer le mot de passe</h3>
                    <p className="text-sm text-text-secondary">Il est recommandé d'utiliser un mot de passe fort.</p>
                  </div>
                  <Button variant="outline" className="border-dark-border text-text-secondary" onClick={handleActionClick}>Modifier</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-text-primary">Authentification à deux facteurs</h3>
                    <p className="text-sm text-text-secondary">Ajoutez une couche de sécurité supplémentaire.</p>
                  </div>
                  <Button variant="outline" className="border-dark-border text-text-secondary" onClick={handleActionClick}>Activer</Button>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-effect rounded-xl p-6"
            >
              <h2 className="text-lg font-semibold text-text-primary mb-4">Notifications</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <label htmlFor="email-notif" className="text-text-secondary">Par e-mail</label>
                  <input type="checkbox" id="email-notif" className="h-4 w-4 rounded bg-dark-bg border-dark-border text-primary-blue focus:ring-primary-blue" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <label htmlFor="push-notif" className="text-text-secondary">Notifications push</label>
                  <input type="checkbox" id="push-notif" className="h-4 w-4 rounded bg-dark-bg border-dark-border text-primary-blue focus:ring-primary-blue" />
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass-effect rounded-xl p-6"
            >
              <h2 className="text-lg font-semibold text-text-primary mb-4">Informations légales</h2>
              <ul className="space-y-3">
                <li><a href="#" onClick={handleActionClick} className="flex items-center space-x-2 text-sm text-text-secondary hover:text-primary-blue"><FileText className="w-4 h-4" /><span>Conditions d'utilisation</span></a></li>
                <li><a href="#" onClick={handleActionClick} className="flex items-center space-x-2 text-sm text-text-secondary hover:text-primary-blue"><FileText className="w-4 h-4" /><span>Politique de confidentialité</span></a></li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
