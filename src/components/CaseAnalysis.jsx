import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain, Scale, FileText, AlertTriangle, CheckCircle, Download, MessageSquare, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import DocumentAnalysisModal from '@/components/DocumentAnalysisModal';

const CaseAnalysis = ({ case: caseData, onBack, onUpdateCase }) => {
  const [activeTab, setActiveTab] = useState('analysis');
  const [selectedDocument, setSelectedDocument] = useState(null);

  const analysisData = {
    confidence: 85,
    summary: "Analyse d'un litige contractuel concernant une prestation de service non conforme aux termes convenus.",
    keyFindings: [
      "Contrat valide signé entre les parties le 15 mars 2024",
      "Prestation livrée avec 3 semaines de retard",
      "Qualité du service inférieure aux spécifications",
      "Tentatives de résolution amiable documentées"
    ],
    legalBasis: [
      "Code civil du Québec, art. 1590 - Exécution de l'obligation",
      "Code civil du Québec, art. 1604 - Demeure du débiteur",
      "Loi sur la protection du consommateur, art. 272"
    ],
    recommendations: {
      primary: "Demande de résolution amiable avec compensation partielle",
      alternatives: [
        "Médiation par un tiers neutre",
        "Recours en dommages-intérêts limités",
        "Résiliation du contrat avec remboursement"
      ],
      estimatedAmount: "2,500 - 4,000 CAD"
    },
    riskAssessment: {
      level: "Modéré",
      factors: [
        "Documentation solide du contrat initial",
        "Preuves de non-conformité disponibles",
        "Tentatives de résolution documentées",
        "Montant en litige raisonnable"
      ]
    }
  };

  const [questions, setQuestions] = useState(caseData.questions || [
    { id: 1, question: "Avez-vous tenté une résolution amiable directe avec la partie adverse ?", type: "boolean", answer: null },
    { id: 2, question: "Disposez-vous de témoins de la prestation défaillante ?", type: "boolean", answer: null },
    { id: 3, question: "Quel délai maximum accepteriez-vous pour une résolution ?", type: "choice", options: ["1 mois", "3 mois", "6 mois", "Plus de 6 mois"], answer: null }
  ]);

  const handleActionClick = () => {
    toast({
      title: "🚧 Fonctionnalité en développement",
      description: "Cette action n'est pas encore disponible. Revenez bientôt ! 🚀"
    });
  };

  const handleQuestionAnswer = (questionId, answer) => {
    const updatedQuestions = questions.map(q => q.id === questionId ? { ...q, answer } : q);
    setQuestions(updatedQuestions);
    onUpdateCase({ ...caseData, questions: updatedQuestions });
    toast({
      title: "Réponse enregistrée",
      description: "Votre réponse a été prise en compte pour affiner l'analyse."
    });
  };

  return (
    <>
      <div className="min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button onClick={onBack} variant="outline" className="flex items-center space-x-2 border-dark-border text-text-secondary hover:border-primary-blue hover:text-primary-blue">
                <ArrowLeft className="w-4 h-4" />
                <span>Retour</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-text-primary font-serif">
                  Analyse du dossier #{caseData.id.slice(-6)}
                </h1>
                <p className="text-text-secondary mt-1">
                  {caseData.parties.plaintiff} vs {caseData.parties.defendant}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button onClick={handleActionClick} variant="outline" className="flex items-center space-x-2 border-dark-border text-text-secondary hover:border-primary-blue hover:text-primary-blue">
                <Download className="w-4 h-4" />
                <span>Télécharger</span>
              </Button>
              <Button onClick={handleActionClick} className="btn-primary flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>Consulter un avocat</span>
              </Button>
            </div>
          </div>

          <div className="legal-disclaimer mb-8">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-warning-orange mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-warning-orange mb-2">Avertissement important</h3>
                <p className="text-text-secondary text-sm">
                  Cette analyse est générée par IA et fournie <strong>à titre informatif uniquement</strong>. Elle ne constitue pas un conseil juridique et n'a aucune valeur contraignante.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="border-b border-dark-border">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'analysis', label: 'Analyse IA', icon: Brain },
                  { id: 'questions', label: 'Questions', icon: MessageSquare },
                  { id: 'documents', label: 'Documents', icon: FileText }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary-blue text-primary-blue'
                        : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-500'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {activeTab === 'analysis' && (
              <div className="space-y-8">
                <div className="glass-effect rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-text-primary">Niveau de confiance</h2>
                    <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-blue to-accent-cyan">{analysisData.confidence}%</div>
                  </div>
                  <div className="confidence-bar"><div className="confidence-fill" style={{ width: `${analysisData.confidence}%` }}/></div>
                  <p className="text-sm text-text-secondary mt-2">Basé sur la qualité des documents et la clarté des faits.</p>
                </div>

                <div className="glass-effect rounded-xl p-6"><h2 className="text-xl font-semibold text-text-primary mb-4">Résumé de l'analyse</h2><p className="text-text-secondary leading-relaxed">{analysisData.summary}</p></div>

                <div className="glass-effect rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-text-primary mb-4">Faits saillants</h2>
                  <div className="space-y-3">
                    {analysisData.keyFindings.map((finding, index) => (
                      <div key={index} className="flex items-start space-x-3"><CheckCircle className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" /><p className="text-text-secondary">{finding}</p></div>
                    ))}
                  </div>
                </div>

                <div className="glass-effect rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-text-primary mb-4">Base juridique (informative)</h2>
                  <div className="space-y-2">
                    {analysisData.legalBasis.map((basis, index) => (
                      <div key={index} className="flex items-start space-x-3"><Scale className="w-5 h-5 text-primary-blue mt-0.5 flex-shrink-0" /><p className="text-text-secondary text-sm">{basis}</p></div>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="glass-effect rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-text-primary mb-4">Recommandations</h2>
                    <div className="mb-6"><h3 className="font-semibold text-success-green mb-2">Recommandation principale</h3><p className="text-text-secondary bg-success-green/10 p-3 rounded-lg">{analysisData.recommendations.primary}</p></div>
                    <div className="mb-6"><h3 className="font-semibold text-text-primary mb-2">Alternatives</h3>
                      <ul className="space-y-2">
                        {analysisData.recommendations.alternatives.map((alt, index) => (
                          <li key={index} className="text-text-secondary text-sm flex items-start space-x-2"><span className="w-1.5 h-1.5 bg-dark-border rounded-full mt-2 flex-shrink-0" /><span>{alt}</span></li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-primary-blue/10 p-4 rounded-lg"><h4 className="font-semibold text-primary-blue mb-1">Estimation financière</h4><p className="text-text-primary text-lg font-bold">{analysisData.recommendations.estimatedAmount}</p></div>
                  </div>

                  <div className="glass-effect rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-text-primary mb-4">Évaluation des risques</h2>
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2"><span className="text-sm text-text-secondary">Niveau de risque:</span><span className={`status-badge ${analysisData.riskAssessment.level === 'Modéré' ? 'status-processing' : 'status-error'}`}>{analysisData.riskAssessment.level}</span></div>
                    </div>
                    <div><h3 className="font-semibold text-text-primary mb-2">Facteurs considérés</h3>
                      <ul className="space-y-2">
                        {analysisData.riskAssessment.factors.map((factor, index) => (
                          <li key={index} className="text-text-secondary text-sm flex items-start space-x-2"><CheckCircle className="w-4 h-4 text-success-green mt-0.5 flex-shrink-0" /><span>{factor}</span></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'questions' && (
              <div className="glass-effect rounded-xl p-6">
                <h2 className="text-xl font-semibold text-text-primary mb-6">Questions de clarification</h2>
                <p className="text-text-secondary mb-8">Vos réponses affinent l'analyse pour des recommandations plus précises.</p>
                <div className="space-y-6">
                  {questions.map((question) => (
                    <div key={question.id} className={`border rounded-lg p-6 transition-colors ${question.answer !== null ? 'bg-success-green/10 border-success-green/30' : 'border-dark-border'}`}>
                      <h3 className="font-medium text-text-primary mb-4">{question.question}</h3>
                      {question.type === 'boolean' && (
                        <div className="flex space-x-4">
                          <Button onClick={() => handleQuestionAnswer(question.id, true)} variant={question.answer === true ? 'default' : 'outline'} className={`flex-1 ${question.answer === true ? 'bg-primary-blue text-white' : 'border-dark-border text-text-secondary'}`}>Oui</Button>
                          <Button onClick={() => handleQuestionAnswer(question.id, false)} variant={question.answer === false ? 'default' : 'outline'} className={`flex-1 ${question.answer === false ? 'bg-primary-blue text-white' : 'border-dark-border text-text-secondary'}`}>Non</Button>
                        </div>
                      )}
                      {question.type === 'choice' && (
                        <div className="grid grid-cols-2 gap-3">
                          {question.options.map((option) => (
                            <Button key={option} onClick={() => handleQuestionAnswer(question.id, option)} variant={question.answer === option ? 'default' : 'outline'} className={`text-left justify-start ${question.answer === option ? 'bg-primary-blue text-white' : 'border-dark-border text-text-secondary'}`}>{option}</Button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="glass-effect rounded-xl p-6">
                <h2 className="text-xl font-semibold text-text-primary mb-6">Documents analysés</h2>
                {caseData.documents && caseData.documents.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {caseData.documents.map((doc) => (
                      <motion.div key={doc.id} whileHover={{ scale: 1.03 }} className="document-preview cursor-pointer" onClick={() => setSelectedDocument(doc)}>
                        <div className="flex items-center space-x-3 mb-3">
                          <FileText className="w-8 h-8 text-primary-blue" />
                          <div className="flex-1"><p className="font-medium text-text-primary truncate">{doc.name}</p><p className="text-sm text-text-secondary">{(doc.size / 1024 / 1024).toFixed(2)} MB</p></div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-text-secondary">
                          <span className="status-badge status-completed">Analysé</span>
                          <div className="flex items-center space-x-1 text-primary-blue font-medium"><Search className="w-4 h-4" /><span>Voir l'analyse</span></div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8"><FileText className="w-16 h-16 text-dark-border mx-auto mb-4" /><p className="text-text-secondary">Aucun document n'a été soumis pour ce dossier.</p></div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <DocumentAnalysisModal document={selectedDocument} isOpen={!!selectedDocument} onClose={() => setSelectedDocument(null)} />
    </>
  );
};

export default CaseAnalysis;