
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Users, Calendar, DollarSign, ScanText, Loader2 } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { toast } from '@/components/ui/use-toast';
import * as pdfjs from 'pdfjs-dist';

const generateSimulatedAnalysis = (text) => {
  if (!text) {
    return {
      type: "Non déterminé",
      summary: "Le texte n'a pas pu être extrait ou est trop court pour une analyse significative.",
      extractedEntities: [],
      keyClauses: [],
      relevance: "Impossible de déterminer la pertinence sans contenu textuel."
    };
  }

  const textLower = text.toLowerCase();
  let type = "Document général";
  if (textLower.includes("contrat")) type = "Contrat";
  if (textLower.includes("facture")) type = "Facture";
  if (textLower.includes("mise en demeure")) type = "Mise en demeure";

  const summary = `Ce document semble être un(e) ${type}. L'analyse préliminaire du texte suggère qu'il traite de ${textLower.includes("paiement") ? "questions financières" : "termes et conditions"}. Le contenu mentionne des éléments clés qui nécessitent une attention particulière.`;

  const entities = [];
  const nameRegex = /(?:M\.|Mme|Monsieur|Madame)\s+([A-Z][a-z]+)\s+([A-Z][a-z]+)/g;
  let match;
  while ((match = nameRegex.exec(text)) !== null) {
    entities.push({ icon: Users, label: "Personne mentionnée", value: `${match[1]} ${match[2]}` });
  }
  if (entities.length === 0) {
     entities.push({ icon: Users, label: "Parties", value: "Non identifiées" });
  }

  const dateRegex = /\d{1,2}\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{4}/g;
  const foundDates = text.match(dateRegex);
  if (foundDates && foundDates.length > 0) {
    entities.push({ icon: Calendar, label: "Date identifiée", value: foundDates[0] });
  }

  const amountRegex = /(\d[\d\s,.]*)\s*(?:CAD|\$|euros)/g;
  const foundAmounts = text.match(amountRegex);
  if (foundAmounts && foundAmounts.length > 0) {
    entities.push({ icon: DollarSign, label: "Montant identifié", value: foundAmounts[0] });
  }

  const clauses = [];
  const clauseRegex = /(?:clause|article|section)\s+\d+/ig;
  const foundClauses = text.match(clauseRegex);
  if(foundClauses) {
    clauses.push({ title: `Référence à ${foundClauses[0]}`, content: "Le texte fait référence à cette section, une analyse approfondie est recommandée." });
  }
  if(textLower.includes("résiliation")){
     clauses.push({ title: "Clause potentielle de Résiliation", content: "Des termes liés à la fin du contrat semblent présents." });
  }


  return {
    type,
    summary,
    extractedEntities: entities.slice(0, 4),
    keyClauses: clauses.slice(0, 3),
    relevance: `Ce document est probablement pertinent car il s'agit d'un(e) ${type} qui établit des faits ou des obligations entre les parties.`
  };
};


const DocumentAnalysisModal = ({ document, isOpen, onClose }) => {
  const [ocrText, setOcrText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const workerRef = useRef(null);

  useEffect(() => {
    const processDocument = async () => {
      if (!isOpen || !document || !document.file) return;

      setIsProcessing(true);
      setOcrText('');
      setAnalysis(null);
      setProcessingStatus("Initialisation de l'analyse...");
      
      try {
        const worker = await createWorker('fra');
        workerRef.current = worker;
        let fullText = '';

        if (document.file.type.startsWith('image/')) {
          setProcessingStatus("Analyse de l'image en cours...");
          const ret = await worker.recognize(document.file);
          fullText = ret.data.text;
        } else if (document.file.type === 'application/pdf') {
          const fileReader = new FileReader();
          
          const promise = new Promise((resolve, reject) => {
              fileReader.onload = async function() {
                  try {
                      const typedarray = new Uint8Array(this.result);
                      const pdf = await pdfjs.getDocument(typedarray).promise;
                      let pdfText = '';
                      
                      for (let i = 1; i <= pdf.numPages; i++) {
                          setProcessingStatus(`Analyse de la page ${i} sur ${pdf.numPages}...`);
                          const page = await pdf.getPage(i);
                          const viewport = page.getViewport({ scale: 1.5 });
                          const canvas = document.createElement('canvas');
                          const context = canvas.getContext('2d');
                          canvas.height = viewport.height;
                          canvas.width = viewport.width;
                          
                          await page.render({ canvasContext: context, viewport: viewport }).promise;
                          
                          const { data: { text } } = await worker.recognize(canvas.toDataURL());
                          pdfText += text + `\n\n--- Page ${i} ---\n\n`;
                          setOcrText(pdfText);
                      }
                      resolve(pdfText);
                  } catch (e) {
                      reject(e);
                  }
              };
              fileReader.onerror = reject;
              fileReader.readAsArrayBuffer(document.file);
          });
          fullText = await promise;

        } else {
          fullText = "Ce format de fichier n'est pas supporté pour l'analyse OCR (uniquement images et PDF).";
        }
        
        setOcrText(fullText);
        setAnalysis(generateSimulatedAnalysis(fullText));

      } catch (error) {
        console.error("Erreur OCR:", error);
        setOcrText("Une erreur est survenue lors de l'analyse OCR.");
        setAnalysis(generateSimulatedAnalysis(null));
        toast({
          title: "Erreur OCR",
          description: "Impossible d'analyser le document. Veuillez réessayer.",
          variant: "destructive",
        });
      } finally {
         setIsProcessing(false);
         setProcessingStatus('');
         if (workerRef.current) {
            await workerRef.current.terminate();
            workerRef.current = null;
         }
      }
    };

    processDocument();

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [isOpen, document]);

  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl bg-dark-card border-dark-border text-text-primary">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-2xl font-serif text-primary-blue">
            <FileText className="w-7 h-7" />
            <span>Analyse : {document.name}</span>
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            Analyse détaillée générée par l'IA de PAVIA.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 grid gap-6 max-h-[70vh] overflow-y-auto pr-4">
          {isProcessing && !analysis ? (
             <div className="flex flex-col items-center justify-center h-full text-text-secondary min-h-[40vh]">
                <Loader2 className="w-12 h-12 animate-spin text-primary-blue mb-4" />
                <p className="text-lg font-semibold">{processingStatus}</p>
                <p className="text-sm">(Cela peut prendre quelques instants)</p>
            </div>
          ) : analysis && (
            <>
              <div className="bg-dark-bg/50 rounded-lg p-4 border border-dark-border">
                <h3 className="font-semibold text-text-primary mb-2">Résumé du document ({analysis.type})</h3>
                <p className="text-sm text-text-secondary">{analysis.summary}</p>
              </div>

              {analysis.extractedEntities.length > 0 && (
                <div>
                  <h3 className="font-semibold text-text-primary mb-3">Entités extraites</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {analysis.extractedEntities.map((entity, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <entity.icon className="w-5 h-5 text-primary-blue mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-text-secondary">{entity.label}</p>
                          <p className="text-base font-semibold text-text-primary">{entity.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.keyClauses.length > 0 && (
                <div>
                  <h3 className="font-semibold text-text-primary mb-3">Clauses importantes</h3>
                  <div className="space-y-3">
                    {analysis.keyClauses.map((clause, index) => (
                      <div key={index} className="border border-dark-border rounded-lg p-3 bg-dark-bg/30">
                        <p className="font-semibold text-primary-blue mb-1">{clause.title}</p>
                        <p className="text-sm text-text-secondary italic">"{clause.content}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-primary-blue/10 border-l-4 border-primary-blue p-4 rounded-r-lg">
                <h3 className="font-semibold text-primary-blue mb-2">Pertinence pour le dossier</h3>
                <p className="text-sm text-text-secondary">{analysis.relevance}</p>
              </div>
            </>
          )}

          <div>
            <h3 className="font-semibold text-text-primary mb-3 flex items-center space-x-2">
              <ScanText className="w-5 h-5 text-text-secondary" />
              <span>Texte extrait (Analyse OCR)</span>
            </h3>
            <div className="bg-dark-bg rounded-lg p-4 min-h-[10rem] max-h-48 overflow-y-auto border border-dark-border">
              {isProcessing && !ocrText ? (
                <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-blue mb-2" />
                  <p>{processingStatus || "En attente de l'analyse..."}</p>
                </div>
              ) : (
                <pre className="text-xs text-text-secondary whitespace-pre-wrap font-mono">
                  {ocrText || "Aucun texte n'a pu être extrait ou le fichier n'est pas encore analysé."}
                </pre>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="btn-primary">Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentAnalysisModal;
