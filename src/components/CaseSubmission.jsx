
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, AlertCircle, CheckCircle, ArrowRight, ArrowLeft, CreditCard, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const CaseSubmission = ({ onCaseSubmitted }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    caseType: '',
    description: '',
    amount: '',
    parties: {
      plaintiff: '',
      defendant: ''
    },
    documents: []
  });

  const steps = [
    { number: 1, title: 'Type de litige', description: 'Catégorisez votre conflit' },
    { number: 2, title: 'Description', description: 'Décrivez la situation' },
    { number: 3, title: 'Documents', description: 'Ajoutez vos preuves' },
    { number: 4, title: 'Paiement', description: 'Finalisez votre soumission' }
  ];

  const caseTypes = [
    { id: 'contract', label: 'Litige contractuel', description: 'Non-respect de contrat, services non rendus' },
    { id: 'consumer', label: 'Droit de la consommation', description: 'Produit défectueux, garantie non respectée' },
    { id: 'service', label: 'Prestation de service', description: 'Service mal exécuté ou non conforme' },
    { id: 'rental', label: 'Location/Bail', description: 'Problèmes locataire-propriétaire' },
    { id: 'neighbor', label: 'Voisinage', description: 'Nuisances, troubles de voisinage' },
    { id: 'other', label: 'Autre', description: 'Autre type de conflit civil' }
  ];

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Format non supporté",
          description: `Le fichier ${file.name} n'est pas dans un format supporté (PDF, JPG, PNG).`,
          variant: "destructive"
        });
        return false;
      }
      
      if (file.size > maxSize) {
        toast({
          title: "Fichier trop volumineux",
          description: `Le fichier ${file.name} dépasse la limite de 10MB.`,
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...validFiles.map(file => ({
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          file: file
        }))]
      }));
      
      toast({
        title: "Documents ajoutés",
        description: `${validFiles.length} document(s) ajouté(s) avec succès.`
      });
    }
  };

  const removeDocument = (docId) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== docId)
    }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!formData.caseType || !formData.description || !formData.parties.plaintiff || !formData.parties.defendant) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    onCaseSubmitted(formData);
    
    toast({
      title: "Dossier soumis avec succès",
      description: "Votre dossier est en cours d'analyse. Vous recevrez une notification dès que l'analyse sera terminée."
    });
  };
  
  const handlePayment = () => {
    toast({
      title: "🚧 Fonctionnalité en développement",
      description: "L'intégration de Stripe est en cours. Pour l'instant, nous simulons un paiement réussi.",
    });
    handleSubmit();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.caseType !== '';
      case 2:
        return formData.description && formData.parties.plaintiff && formData.parties.defendant;
      case 3:
        return true; // Documents are optional
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div className="flex items-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center text-center w-24">
                  <div className={`step-indicator ${
                    currentStep === step.number ? 'step-active' :
                    currentStep > step.number ? 'step-completed' : 'step-pending'
                  }`}>
                    {currentStep > step.number ? <CheckCircle className="w-5 h-5" /> : step.number}
                  </div>
                  <p className={`mt-2 text-xs font-medium ${currentStep >= step.number ? 'text-text-primary' : 'text-text-secondary'}`}>{step.title}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 rounded-full mx-2 ${currentStep > index + 1 ? 'bg-success-green' : 'bg-dark-border'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="glass-effect rounded-xl p-8"
        >
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-6 font-serif">Quel type de litige souhaitez-vous soumettre ?</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {caseTypes.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => setFormData(prev => ({ ...prev, caseType: type.id }))}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      formData.caseType === type.id
                        ? 'border-primary-blue bg-primary-blue/10'
                        : 'border-dark-border hover:border-primary-blue/50'
                    }`}
                  >
                    <h3 className="font-semibold text-text-primary mb-2">{type.label}</h3>
                    <p className="text-sm text-text-secondary">{type.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-6 font-serif">Décrivez votre situation</h2>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Demandeur (vous) *</label>
                    <input type="text" value={formData.parties.plaintiff} onChange={(e) => setFormData(prev => ({ ...prev, parties: { ...prev.parties, plaintiff: e.target.value } }))} className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent" placeholder="Votre nom complet" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Défendeur *</label>
                    <input type="text" value={formData.parties.defendant} onChange={(e) => setFormData(prev => ({ ...prev, parties: { ...prev.parties, defendant: e.target.value } }))} className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent" placeholder="Nom de la partie adverse" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Montant en litige (optionnel)</label>
                  <input type="number" value={formData.amount} onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))} className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent" placeholder="Montant en CAD" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Description détaillée du conflit *</label>
                  <textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={6} className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent" placeholder="Décrivez les faits, les dates importantes, etc." />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-6 font-serif">Ajoutez vos documents</h2>
              <div className="mb-6">
                <div className="upload-zone">
                  <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} className="hidden" id="file-upload" />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-primary-blue mx-auto mb-4" />
                    <p className="text-lg font-medium text-text-primary mb-2">Glissez vos fichiers ici ou cliquez pour sélectionner</p>
                    <p className="text-sm text-text-secondary">PDF, JPG, PNG - Maximum 10MB par fichier</p>
                  </label>
                </div>
              </div>
              {formData.documents.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Documents ajoutés ({formData.documents.length})</h3>
                  <div className="space-y-3">
                    {formData.documents.map((doc) => (
                      <div key={doc.id} className="document-preview flex items-center justify-between p-3">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-8 h-8 text-primary-blue" />
                          <div>
                            <p className="font-medium text-text-primary">{doc.name}</p>
                            <p className="text-sm text-text-secondary">{(doc.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button onClick={() => removeDocument(doc.id)} className="text-red-500 hover:text-red-400 transition-colors">Supprimer</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-6 p-4 bg-primary-blue/10 rounded-lg border border-primary-blue/20">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-primary-blue mt-0.5" />
                  <div className="text-sm text-primary-blue/80">
                    <p className="font-medium mb-1 text-primary-blue">Documents recommandés :</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Contrat ou accord initial, Correspondances (emails, lettres), Factures et reçus, Photos ou captures d'écran</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-6 font-serif">Finalisez votre soumission</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-dark-bg/50 rounded-lg p-6 border border-dark-border">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Résumé de votre dossier</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-text-secondary">Type de litige:</span><span className="font-medium text-text-primary">{caseTypes.find(t => t.id === formData.caseType)?.label}</span></div>
                      <div className="flex justify-between"><span className="text-text-secondary">Montant:</span><span className="font-medium text-text-primary">{formData.amount ? `${formData.amount} CAD` : 'Non spécifié'}</span></div>
                      <div className="flex justify-between"><span className="text-text-secondary">Demandeur:</span><span className="font-medium text-text-primary">{formData.parties.plaintiff}</span></div>
                      <div className="flex justify-between"><span className="text-text-secondary">Défendeur:</span><span className="font-medium text-text-primary">{formData.parties.defendant}</span></div>
                      <div className="flex justify-between"><span className="text-text-secondary">Documents:</span><span className="font-medium text-text-primary">{formData.documents.length}</span></div>
                    </div>
                  </div>
                  <div className="legal-disclaimer">
                    <h4 className="font-semibold text-warning-orange mb-2">Conditions d'utilisation</h4>
                    <p className="text-text-secondary text-xs">En procédant au paiement, vous acceptez que l'analyse est non-contraignante et que PAVIA ne fournit pas de conseils juridiques.</p>
                  </div>
                </div>
                <div className="bg-dark-bg/50 rounded-lg p-6 border border-dark-border">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Paiement sécurisé</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-baseline">
                      <span className="text-text-secondary">Frais d'analyse IA</span>
                      <span className="text-2xl font-bold text-text-primary">150.00 <span className="text-base font-normal text-text-secondary">CAD</span></span>
                    </div>
                    <p className="text-xs text-text-secondary">Ce montant unique couvre l'intégralité du processus d'analyse par l'IA, de la soumission à la génération du rapport final.</p>
                    <Button onClick={handlePayment} className="w-full btn-primary flex items-center space-x-2 text-base py-6">
                      <Lock className="w-5 h-5" />
                      <span>Payer 150.00 CAD</span>
                    </Button>
                    <p className="text-xs text-center text-text-secondary/70 flex items-center justify-center space-x-1">
                      <CreditCard className="w-3 h-3" />
                      <span>Paiement sécurisé par Stripe</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <Button onClick={handlePrevious} disabled={currentStep === 1} variant="outline" className="flex items-center space-x-2 border-dark-border text-text-secondary hover:border-primary-blue hover:text-primary-blue">
              <ArrowLeft className="w-4 h-4" />
              <span>Précédent</span>
            </Button>
            {currentStep < 4 && (
              <Button onClick={handleNext} disabled={!canProceed()} className="btn-primary flex items-center space-x-2">
                <span>Suivant</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CaseSubmission;
