import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Eye, Clock, CheckCircle, AlertCircle, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard = ({ cases, currentCase, onViewCase, onStartNewCase }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted':
        return <Clock className="w-5 h-5 text-primary-blue" />;
      case 'analysis_ready':
        return <CheckCircle className="w-5 h-5 text-success-green" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-success-green" />;
      default:
        return <AlertCircle className="w-5 h-5 text-text-secondary" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'submitted':
        return 'En cours d\'analyse';
      case 'analysis_ready':
        return 'Analyse disponible';
      case 'completed':
        return 'Terminé';
      default:
        return 'En attente';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'submitted':
        return 'status-processing';
      case 'analysis_ready':
        return 'status-completed';
      case 'completed':
        return 'status-completed';
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCurrentTimelineStep = (timeline) => {
    const currentStep = timeline.find(step => step.status === 'current');
    return currentStep ? currentStep.step : 'Terminé';
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary font-serif">
              Tableau de bord
            </h1>
            <p className="text-text-secondary mt-2">
              Suivez l'évolution de vos dossiers d'arbitrage.
            </p>
          </div>
          <Button
            onClick={onStartNewCase}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nouveau dossier</span>
          </Button>
        </div>

        {currentCase && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-effect rounded-xl p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text-primary">
                Dossier en cours
              </h2>
              <div className="flex items-center space-x-2">
                {getStatusIcon(currentCase.status)}
                <span className={`status-badge ${getStatusBadgeClass(currentCase.status)}`}>
                  {getStatusText(currentCase.status)}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-sm text-text-secondary mb-1">Type de litige</p>
                <p className="font-medium text-text-primary">
                  {currentCase.caseType === 'contract' ? 'Litige contractuel' : 'Autre'}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-1">Parties</p>
                <p className="font-medium text-text-primary">
                  {currentCase.parties.plaintiff} vs {currentCase.parties.defendant}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-1">Étape actuelle</p>
                <p className="font-medium text-text-primary">
                  {getCurrentTimelineStep(currentCase.timeline)}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Progression</h3>
              <div className="space-y-4">
                {currentCase.timeline.map((item, index) => (
                  <div key={index} className="timeline-item">
                    <div className={`timeline-dot ${
                      item.status === 'completed' ? 'timeline-completed' :
                      item.status === 'current' ? 'timeline-current' : 'timeline-pending'
                    }`} />
                    <div className="ml-4">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-text-primary">{item.step}</h4>
                        {item.status === 'current' && (
                          <span className="text-xs text-primary-blue font-medium">En cours</span>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary mt-1">{item.description}</p>
                      {item.timestamp && (
                        <p className="text-xs text-text-secondary/70 mt-1">
                          {formatDate(item.timestamp)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {currentCase.status === 'analysis_ready' && (
              <div className="bg-success-green/10 border border-success-green/30 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-success-green" />
                  <div>
                    <h4 className="font-semibold text-success-green">Analyse terminée</h4>
                    <p className="text-text-secondary text-sm">
                      Votre analyse est prête. Consultez les résultats et recommandations.
                    </p>
                  </div>
                  <Button
                    onClick={() => onViewCase(currentCase.id)}
                    className="btn-primary ml-auto"
                  >
                    Voir l'analyse
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        <div className="glass-effect rounded-xl p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-6">
            Historique des dossiers ({cases.length})
          </h2>

          {cases.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-dark-border mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">
                Aucun dossier pour le moment
              </h3>
              <p className="text-text-secondary mb-6">
                Commencez par soumettre votre premier dossier d'arbitrage.
              </p>
              <Button
                onClick={onStartNewCase}
                className="btn-primary"
              >
                Créer mon premier dossier
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cases.map((caseItem) => (
                <motion.div
                  key={caseItem.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-dark-card rounded-lg border border-dark-border p-6 hover:border-primary-blue/50 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-text-primary">
                          Dossier #{caseItem.id.slice(-6)}
                        </h3>
                        <span className={`status-badge ${getStatusBadgeClass(caseItem.status)}`}>
                          {getStatusText(caseItem.status)}
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-text-secondary">Type: </span>
                          <span className="font-medium text-text-primary">
                            {caseItem.caseType === 'contract' ? 'Contractuel' : 'Autre'}
                          </span>
                        </div>
                        <div>
                          <span className="text-text-secondary">Parties: </span>
                          <span className="font-medium text-text-primary">
                            {caseItem.parties.plaintiff} vs {caseItem.parties.defendant}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4 text-text-secondary/70" />
                          <span className="text-text-secondary">
                            {formatDate(caseItem.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {getStatusIcon(caseItem.status)}
                      <Button
                        onClick={() => onViewCase(caseItem.id)}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-2 border-dark-border text-text-secondary hover:border-primary-blue hover:text-primary-blue"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Voir</span>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;