import express from 'express';
import puppeteer from 'puppeteer';
import cors from 'cors';

const app = express();
const PORT = 3000;

// Middleware CORS pour permettre les requêtes cross-origin
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware pour parser le JSON
app.use(express.json());

// Fonction pour extraire les informations du dashboard et des cartes
async function extractDashboardInfo(page) {
  try {
    console.log('🔍 Extraction des informations du dashboard...');
    
    // Attendre un peu que la page se stabilise après la redirection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Attendre que le dashboard soit chargé avec plusieurs sélecteurs possibles
    try {
      await page.waitForSelector('.l-header__intro-name, .header__intro-name, [class*="intro-name"]', { timeout: 10000 });
    } catch (error) {
      console.log('⚠️ Sélecteur principal non trouvé, essai avec d\'autres sélecteurs...');
      // Essayer d'autres sélecteurs possibles
      try {
        await page.waitForSelector('header, .header, .dashboard, .main-content', { timeout: 5000 });
      } catch (fallbackError) {
        throw new Error(`Dashboard non accessible. URL: ${currentUrl}`);
      }
    }
    
    // Extraire les informations du header avec plusieurs sélecteurs possibles
    const headerInfo = await page.evaluate(() => {
      // Essayer plusieurs sélecteurs pour le nom
      let nameElement = document.querySelector('.l-header__intro-name') || 
                       document.querySelector('.header__intro-name') || 
                       document.querySelector('[class*="intro-name"]') ||
                       document.querySelector('.user-name, .username');
      
      // Essayer plusieurs sélecteurs pour la date
      let dateElement = document.querySelector('.l-header__intro-date') || 
                       document.querySelector('.header__intro-date') || 
                       document.querySelector('[class*="intro-date"]') ||
                       document.querySelector('.last-connection, .connection-date');
      
      return {
        userName: nameElement ? nameElement.textContent.trim() : null,
        lastConnection: dateElement ? dateElement.textContent.trim() : null
      };
    });
    
    // Extraire le nombre de messages
    const messageCount = await page.evaluate(() => {
      const messagerieElement = document.querySelector('#messagerie');
      if (messagerieElement) {
        const badge = messagerieElement.querySelector('.badge');
        return badge ? parseInt(badge.textContent.trim()) || 0 : 0;
      }
      return 0;
    });
    
    console.log('📋 Informations du header extraites');
    console.log(`👤 Utilisateur: ${headerInfo.userName}`);
    console.log(`📅 Dernière connexion: ${headerInfo.lastConnection}`);
    console.log(`📨 Messages: ${messageCount}`);
    
    // Chercher et cliquer sur le menu "Cartes"
    console.log('🔍 Recherche du menu Cartes...');
    
    const cartesMenuFound = await page.evaluate(() => {
      // Chercher le menu cartes dans la liste des menus
      const cartesMenu = document.querySelector('#cartes a, li[id="cartes"] a');
      if (cartesMenu) {
        cartesMenu.click();
        return true;
      }
      return false;
    });
    
    if (!cartesMenuFound) {
      throw new Error('Menu Cartes non trouvé');
    }
    
    console.log('✅ Clic sur le menu Cartes effectué');
    
    // Attendre le chargement de la page des cartes
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Attendre que la page des cartes soit chargée
    await page.waitForSelector('.o-cb', { timeout: 10000 });
    
    console.log('🔍 Extraction des informations de la carte...');
    
    // Extraire les informations de la carte
    const cardInfo = await extractCardInfo(page);
    
    return {
      success: true,
      dashboardInfo: {
        user: {
          name: headerInfo.userName,
          lastConnection: headerInfo.lastConnection
        },
        messages: {
          count: messageCount
        }
      },
      cardInfo: cardInfo
    };
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'extraction du dashboard:', error.message);
    return {
      success: false,
      error: `Erreur extraction dashboard: ${error.message}`
    };
  }
}

// Fonction pour extraire les informations détaillées de la carte
async function extractCardInfo(page) {
  try {
    // Attendre que le contenu de la carte soit chargé (chargement AJAX)
    console.log('🔄 Attente du chargement du contenu de la carte...');
    
    try {
      await page.waitForSelector('.o-cb-data', { timeout: 10000 });
      console.log('✅ Contenu de la carte chargé');
    } catch (error) {
      console.log('⚠️  Timeout en attendant .o-cb-data, tentative d\'extraction quand même...');
    }
    
    // Attendre un peu plus pour que le contenu soit stable
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const cardData = await page.evaluate(() => {
      // Vérifier s'il y a plusieurs cartes (présence de la sidebar avec les cartes)
      const cardMenuItems = document.querySelectorAll('.card-menu-item');
      const hasMultipleCards = cardMenuItems.length > 1;
      
      console.log(`Détection: ${hasMultipleCards ? 'Plusieurs cartes' : 'Une seule carte'} (${cardMenuItems.length} cartes trouvées)`);
      
      let allCardsInfo = [];
      
      if (hasMultipleCards) {
        // Cas avec plusieurs cartes - extraire les infos depuis le slider ET la sidebar
        const sliderCards = document.querySelectorAll('#js-cb-slider .slick-slide');
        
        cardMenuItems.forEach((cardItem, index) => {
          const cardInfo = extractCardFromMenuItem(cardItem, index);
          
          // Ajouter les informations visuelles depuis le slider correspondant
          if (sliderCards[index]) {
            const sliderVisual = extractVisualFromSlider(sliderCards[index]);
            if (sliderVisual) {
              // Ajouter le titre de la carte depuis les détails
              sliderVisual.title = cardInfo.details?.title || null;
              cardInfo.visual = sliderVisual;
            }
          }
          
          if (cardInfo) {
            allCardsInfo.push(cardInfo);
          }
        });
        
        // Extraire aussi les détails de la carte actuellement sélectionnée
        const selectedCardDetails = extractSelectedCardDetails();
        if (selectedCardDetails && allCardsInfo.length > 0) {
          // Associer les détails à la carte active
          const activeCardIndex = cardMenuItems.length > 0 ? 
            Array.from(cardMenuItems).findIndex(item => item.classList.contains('is-active')) : 0;
          if (activeCardIndex >= 0 && allCardsInfo[activeCardIndex]) {
            allCardsInfo[activeCardIndex] = { ...allCardsInfo[activeCardIndex], ...selectedCardDetails };
          }
        }
      } else {
        // Cas avec une seule carte - utiliser l'ancienne méthode
        const singleCardInfo = extractSingleCardInfo();
        if (singleCardInfo) {
          allCardsInfo.push(singleCardInfo);
        }
      }
      
      return allCardsInfo;
      
      // Fonction pour extraire les informations visuelles depuis le slider mobile
      function extractVisualFromSlider(sliderSlide) {
        const cardVisual = sliderSlide.querySelector('.o-cb');
        if (!cardVisual) return null;
        
        const backgroundImage = cardVisual.style.backgroundImage;
        const backgroundUrl = backgroundImage ? backgroundImage.match(/url\(["']?([^"'\)]+)["']?\)/)?.[1] : null;
        
        return {
          backgroundImage: backgroundUrl,
          number: cardVisual.querySelector('.o-cb__number')?.textContent?.trim() || null,
          type: cardVisual.querySelector('.o-cb__type')?.textContent?.trim() || null,
          expiration: cardVisual.querySelector('.o-cb__exp')?.textContent?.trim() || null,
          owner: cardVisual.querySelector('.o-cb__owner')?.textContent?.trim() || null,
          company: cardVisual.querySelector('.o-cb__company')?.textContent?.trim() || null
        };
      }
      
      // Fonction pour extraire les infos d'une carte depuis un élément de menu
      function extractCardFromMenuItem(cardItem, index) {
        const cardVisual = cardItem.querySelector('.o-cb');
        let cardInfo = { cardIndex: index };
        
        if (cardVisual) {
          const backgroundImage = cardVisual.style.backgroundImage;
          const backgroundUrl = backgroundImage ? backgroundImage.match(/url\(["']?([^"'\)]+)["']?\)/)?.[1] : null;
          
          cardInfo.visual = {
            backgroundImage: backgroundUrl,
            number: cardVisual.querySelector('.o-cb__number')?.textContent?.trim() || null,
            type: cardVisual.querySelector('.o-cb__type')?.textContent?.trim() || null,
            expiration: cardVisual.querySelector('.o-cb__exp')?.textContent?.trim() || null,
            owner: cardVisual.querySelector('.o-cb__owner')?.textContent?.trim() || null,
            company: cardVisual.querySelector('.o-cb__company')?.textContent?.trim() || null
          };
        }
        
        // Extraire les infos textuelles depuis la partie droite du menu item
        const textSection = cardItem.querySelector('.text-left');
        if (textSection) {
          const titleElement = textSection.querySelector('.h3, h3');
          const cardTitle = titleElement ? titleElement.textContent.trim() : null;
          
          const ownerElement = textSection.querySelector('p.u-font-medium');
          const ownerName = ownerElement ? ownerElement.textContent.trim() : null;
          
          const accountElement = textSection.querySelector('p:last-child');
          let accountNumber = null;
          if (accountElement && accountElement.textContent.includes('*** ')) {
            accountNumber = accountElement.textContent.trim();
          }
          
          const statusElement = cardItem.querySelector('.o-state');
          let cardStatus = null;
          if (statusElement) {
            cardStatus = {
              isActive: statusElement.classList.contains('is-active'),
              text: statusElement.classList.contains('is-active') ? 'Active' : 'Inactive'
            };
          }
          
          cardInfo.details = {
            title: cardTitle,
            owner: ownerName,
            accountNumber: accountNumber,
            status: cardStatus,
            isSelected: cardItem.classList.contains('is-active')
          };
        }
        
        return cardInfo;
      }
      
      // Fonction pour extraire les détails de la carte sélectionnée (plafonds, etc.)
      function extractSelectedCardDetails() {
        const selectedCardSection = document.querySelector('#displayselectedcard');
        if (!selectedCardSection) return null;
        
        let details = {};
        
        // Extraire les informations des plafonds
        const limitsSection = selectedCardSection.querySelector('.o-boxing');
        if (limitsSection && limitsSection.textContent.includes('Plafonds')) {
          const paymentLimit = {};
          const withdrawalLimit = {};
          
          // Plafond de paiement
          const paymentSection = limitsSection.querySelector('.col-xl-6:first-child');
          if (paymentSection) {
            const paymentTexts = paymentSection.querySelectorAll('span');
            paymentTexts.forEach(span => {
              const text = span.textContent.trim();
              if (text.includes('Plafond :')) {
                paymentLimit.ceiling = text.replace('Plafond :', '').trim();
              }
              if (text.includes('Disponible :')) {
                paymentLimit.available = text.replace('Disponible :', '').trim();
              }
            });
            
            const paymentDate = paymentSection.querySelector('.u-font-12.u-color-greyblue');
            if (paymentDate) {
              paymentLimit.validUntil = paymentDate.textContent.trim();
            }
            
            const paymentProgress = paymentSection.querySelector('.progress-bar');
            if (paymentProgress) {
              paymentLimit.usagePercentage = paymentProgress.style.width;
            }
          }
          
          // Plafond de retrait
          const withdrawalSection = limitsSection.querySelector('.col-xl-6:last-child');
          if (withdrawalSection) {
            const withdrawalTexts = withdrawalSection.querySelectorAll('span');
            withdrawalTexts.forEach(span => {
              const text = span.textContent.trim();
              if (text.includes('Plafond :')) {
                withdrawalLimit.ceiling = text.replace('Plafond :', '').trim();
              }
              if (text.includes('Disponible :')) {
                withdrawalLimit.available = text.replace('Disponible :', '').trim();
              }
            });
            
            const withdrawalDate = withdrawalSection.querySelector('.u-font-12.u-color-greyblue');
            if (withdrawalDate) {
              withdrawalLimit.validUntil = withdrawalDate.textContent.trim();
            }
          }
          
          details.limits = {
            payment: paymentLimit,
            withdrawal: withdrawalLimit
          };
        }
        
        // Extraire les actions disponibles
        const actionButtons = [];
        const buttons = selectedCardSection.querySelectorAll('.row.gutters-40 .col-4');
        buttons.forEach(button => {
          const link = button.querySelector('a');
          if (link) {
            actionButtons.push({
              text: link.textContent.trim(),
              available: true
            });
          }
        });
        
        if (actionButtons.length > 0) {
          details.availableActions = actionButtons;
        }
        
        // Extraire le téléphone associé
        const phoneElements = selectedCardSection.querySelectorAll('p');
        phoneElements.forEach(p => {
          if (p.textContent.includes('Téléphone associé')) {
            details.phoneNumber = p.textContent.replace('Téléphone associé :', '').trim();
          }
        });
        
        return details;
      }
      
      // Fonction pour extraire les infos d'une seule carte (ancienne méthode)
      function extractSingleCardInfo() {
        // Extraire les informations de la carte visuelle
        const cardVisual = document.querySelector('.o-cb');
        let cardVisualInfo = {};
        
        if (cardVisual) {
          const backgroundImage = cardVisual.style.backgroundImage;
          const backgroundUrl = backgroundImage ? backgroundImage.match(/url\(["']?([^"'\)]+)["']?\)/)?.[1] : null;
          
          cardVisualInfo = {
            backgroundImage: backgroundUrl,
            number: cardVisual.querySelector('.o-cb__number')?.textContent?.trim() || null,
            type: cardVisual.querySelector('.o-cb__type')?.textContent?.trim() || null,
            expiration: cardVisual.querySelector('.o-cb__exp')?.textContent?.trim() || null,
            owner: cardVisual.querySelector('.o-cb__owner')?.textContent?.trim() || null,
            company: cardVisual.querySelector('.o-cb__company')?.textContent?.trim() || null,
            title: null // Sera ajouté plus tard depuis les détails
          };
        }
        
        // Extraire les détails de la carte
        const cardDetails = document.querySelector('.o-cb-data');
        let cardDetailsInfo = {};
        
        if (cardDetails) {
          // Titre de la carte - chercher dans p.h3 qui commence par "Carte"
          const titleElement = cardDetails.querySelector('p.h3');
          let cardTitle = null;
          if (titleElement && titleElement.textContent.trim().startsWith('Carte')) {
            // Nettoyer le titre : retirer "Carte" et normaliser les espaces
            let rawTitle = titleElement.textContent;
            // Remplacer tous les sauts de ligne et espaces multiples par un seul espace
            let cleanTitle = rawTitle.replace(/\s+/g, ' ').trim();
            // Retirer le mot "Carte" du début
            if (cleanTitle.startsWith('Carte ')) {
              cardTitle = cleanTitle.substring(6).trim();
            } else {
              cardTitle = cleanTitle;
            }
          }
          
          // Numéro de compte
          const accountElements = cardDetails.querySelectorAll('p');
          let accountNumber = null;
          accountElements.forEach(p => {
            if (p.textContent.includes('*** ')) {
              accountNumber = p.textContent.trim();
            }
          });
          
          // Téléphone associé
          let phoneNumber = null;
          accountElements.forEach(p => {
            if (p.textContent.includes('Téléphone associé')) {
              phoneNumber = p.textContent.replace('Téléphone associé :', '').trim();
            }
          });
          
          // Statut de la carte
          const statusElement = cardDetails.querySelector('.o-state');
          let cardStatus = null;
          if (statusElement) {
            cardStatus = {
              isActive: statusElement.classList.contains('is-active'),
              text: statusElement.classList.contains('is-active') ? 'Active' : 'Inactive'
            };
          }
          
          // Actions disponibles
          const actionButtons = [];
          const buttons = cardDetails.querySelectorAll('.row.gutters-40 .col-4');
          buttons.forEach(button => {
            const link = button.querySelector('a');
            if (link) {
              actionButtons.push({
                text: link.textContent.trim(),
                available: true
              });
            }
          });
          
          cardDetailsInfo = {
            title: cardTitle,
            accountNumber: accountNumber,
            phoneNumber: phoneNumber,
            status: cardStatus,
            availableActions: actionButtons
          };
        }
        
        // Extraire les informations des plafonds
        let limitsInfo = {};
        const limitsSection = document.querySelector('.o-boxing');
        if (limitsSection && limitsSection.textContent.includes('Plafonds')) {
          const paymentLimit = {};
          const withdrawalLimit = {};
          
          // Plafond de paiement
          const paymentSection = limitsSection.querySelector('.col-xl-6:first-child');
          if (paymentSection) {
            const paymentTexts = paymentSection.querySelectorAll('span');
            paymentTexts.forEach(span => {
              const text = span.textContent.trim();
              if (text.includes('Plafond :')) {
                paymentLimit.ceiling = text.replace('Plafond :', '').trim();
              }
              if (text.includes('Disponible :')) {
                paymentLimit.available = text.replace('Disponible :', '').trim();
              }
            });
            
            const paymentDate = paymentSection.querySelector('.u-font-12.u-color-greyblue');
            if (paymentDate) {
              paymentLimit.validUntil = paymentDate.textContent.trim();
            }
            
            const paymentProgress = paymentSection.querySelector('.progress-bar');
            if (paymentProgress) {
              paymentLimit.usagePercentage = paymentProgress.style.width;
            }
          }
          
          // Plafond de retrait
          const withdrawalSection = limitsSection.querySelector('.col-xl-6:last-child');
          if (withdrawalSection) {
            const withdrawalTexts = withdrawalSection.querySelectorAll('span');
            withdrawalTexts.forEach(span => {
              const text = span.textContent.trim();
              if (text.includes('Plafond :')) {
                withdrawalLimit.ceiling = text.replace('Plafond :', '').trim();
              }
              if (text.includes('Disponible :')) {
                withdrawalLimit.available = text.replace('Disponible :', '').trim();
              }
            });
            
            const withdrawalDate = withdrawalSection.querySelector('.u-font-12.u-color-greyblue');
            if (withdrawalDate) {
              withdrawalLimit.validUntil = withdrawalDate.textContent.trim();
            }
            
            const withdrawalProgress = withdrawalSection.querySelector('.progress-bar');
            if (withdrawalProgress) {
              withdrawalLimit.usagePercentage = withdrawalProgress.style.width;
            }
          }
          
          limitsInfo = {
            payment: paymentLimit,
            withdrawal: withdrawalLimit
          };
        }
        
        // Ajouter le titre à la partie visual
        if (cardVisualInfo && cardDetailsInfo?.title) {
          cardVisualInfo.title = cardDetailsInfo.title;
        }
        
        return {
          visual: cardVisualInfo,
          details: cardDetailsInfo,
          limits: limitsInfo
        };
      }
    });
    
    console.log('✅ Informations de la carte extraites avec succès');
    return cardData;
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'extraction des informations de carte:', error.message);
    throw error;
  }
}

// Fonction de validation des identifiants avec Puppeteer
async function validateLogin(username, password) {
  let browser = null;
  
  try {
    // Lancer le navigateur Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    await page.setViewport({width: 1080, height: 1024});
    
    // Navigation vers la page de connexion
    await page.goto('https://www.bcinet.nc/service/login', {waitUntil: 'domcontentloaded'});
    
    // Attendre que la page soit chargée
    await page.waitForSelector('input[type="number"][inputmode="number"][maxlength="10"]');
    
    // Gérer la popup d'alerte si elle apparaît
    try {
      const continueButton = await page.$('button:contains("Continuer"), input[value*="Continuer"]');
      if (continueButton) {
        await continueButton.click();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      // Ignorer si pas de popup
    }

    // Détecter et remplir le champ identifiant
    const identifiantField = await page.$('input[type="number"][inputmode="number"][maxlength="10"]');
    if (!identifiantField) {
      throw new Error('Impossible de trouver le champ identifiant');
    }
    
    const identifiantId = await page.evaluate(field => field.id, identifiantField);
    
    await identifiantField.focus();
    await identifiantField.type(username, { delay: 20 });
    
    // Déclencher l'événement blur pour activer le champ OTP
    await page.evaluate((fieldId) => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.blur();
        if (typeof window[`filterContent${fieldId}`] === 'function') {
          window[`filterContent${fieldId}`]();
        }
      }
    }, identifiantId);
    
    // Attendre l'activation du champ OTP
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Détecter le champ OTP
    const otpSelectors = [
      'input[type="password"][maxlength="256"]',
      'input[type="password"]',
      '#dispositif input[type="password"]',
      'input[type="password"]:not([maxlength="10"])'
    ];
    
    let otpField = null;
    for (const selector of otpSelectors) {
      otpField = await page.$(selector);
      if (otpField) break;
    }
    
    if (!otpField) {
      throw new Error('Impossible de trouver le champ mot de passe');
    }
    
    // Vérifier si le champ OTP est activé
    const isOtpEnabled = await page.evaluate(field => {
      return field && !field.disabled;
    }, otpField);
    
    if (!isOtpEnabled) {
      return {
        success: false,
        message: 'Le champ mot de passe n\'a pas été activé. Vérifiez l\'identifiant.',
        code: 'FIELD_NOT_ENABLED'
      };
    }
    
    // Remplir le champ mot de passe
    await page.evaluate(field => {
      field.focus();
      field.value = '';
    }, otpField);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    await otpField.type(password, { delay: 20 });
    
    // Vérifier si le bouton de connexion est activé
    const isButtonEnabled = await page.evaluate(() => {
      const selectors = [
        'input[value="Connexion"]',
        '#loginbtn',
        'input[type="button"][value="Connexion"]',
        'button[type="submit"]'
      ];
      
      for (const selector of selectors) {
        try {
          const button = document.querySelector(selector);
          if (button && !button.disabled) {
            return true;
          }
        } catch (e) {
          continue;
        }
      }
      return false;
    });
    
    if (!isButtonEnabled) {
      return {
        success: false,
        message: 'Le bouton de connexion n\'est pas activé',
        code: 'BUTTON_NOT_ENABLED'
      };
    }
    
    // Soumettre le formulaire
    const submitSuccess = await page.evaluate(() => {
      const selectors = [
        '#loginbtn',
        'input[value="Connexion"]',
        'input[type="button"][value="Connexion"]'
      ];
      
      for (const selector of selectors) {
        const button = document.querySelector(selector);
        if (button && !button.disabled) {
          button.click();
          return true;
        }
      }
      
      // Fallback: appeler la fonction de login directement
      if (typeof dologinbtn === 'function') {
        dologinbtn();
        return true;
      }
      
      return false;
    });
    
    if (!submitSuccess) {
      return {
        success: false,
        message: 'Impossible de soumettre le formulaire',
        code: 'SUBMIT_FAILED'
      };
    }
    
    // Attendre la réponse du serveur
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Analyser le résultat de la connexion
    const connectionResult = await page.evaluate(() => {
      // Vérifier les messages d'erreur
      const errorSelectors = [
        '#Msg.alert-danger',
        '.alert-danger',
        '.alert.alert-danger',
        '[class*="alert-danger"]'
      ];
      
      for (const selector of errorSelectors) {
        const errorElement = document.querySelector(selector);
        if (errorElement && errorElement.textContent.trim()) {
          return {
            success: false,
            message: errorElement.textContent.trim(),
            type: 'error'
          };
        }
      }
      
      // Vérifier les messages de succès
      const successSelectors = [
        '#Msg.alert-success',
        '.alert-success',
        '.alert.alert-success'
      ];
      
      for (const selector of successSelectors) {
        const successElement = document.querySelector(selector);
        if (successElement && successElement.textContent.trim()) {
          return {
            success: true,
            message: successElement.textContent.trim(),
            type: 'success'
          };
        }
      }
      
      // Vérifier la redirection
      if (window.location.href !== 'https://www.bcinet.nc/service/login') {
        return {
          success: true,
          message: `Redirection vers: ${window.location.href}`,
          type: 'redirect',
          url: window.location.href
        };
      }
      
      return {
        success: null,
        message: 'Aucun résultat détecté',
        type: 'unknown'
      };
    });
    
    // Retourner le résultat formaté
    if (connectionResult.success === true) {
      console.log('✅ Connexion réussie, extraction des informations du dashboard...');
      
      // Si la connexion est réussie, extraire les informations du dashboard
      const dashboardData = await extractDashboardInfo(page);
      
      return {
        success: true,
        message: connectionResult.message,
        code: connectionResult.type === 'redirect' ? 'LOGIN_SUCCESS_REDIRECT' : 'LOGIN_SUCCESS',
        redirectUrl: connectionResult.url || null,
        data: dashboardData.success ? {
          user: dashboardData.dashboardInfo.user,
          messages: dashboardData.dashboardInfo.messages,
          card: dashboardData.cardInfo
        } : null,
        extractionError: dashboardData.success ? null : dashboardData.error
      };
    } else if (connectionResult.success === false) {
      return {
        success: false,
        message: connectionResult.message,
        code: 'LOGIN_FAILED'
      };
    } else {
      return {
        success: false,
        message: 'Résultat de connexion indéterminé',
        code: 'UNKNOWN_RESULT'
      };
    }
    
  } catch (error) {
    return {
      success: false,
      message: `Erreur technique: ${error.message}`,
      code: 'TECHNICAL_ERROR'
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Route API pour valider les identifiants
app.post('/api/validate-login', async (req, res) => {
  const { username, password } = req.body;
  
  // Validation des paramètres
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username et password sont requis',
      code: 'MISSING_PARAMETERS'
    });
  }
  
  console.log(`🔍 Tentative de validation pour l'utilisateur: ${username}`);
  
  try {
    const result = await validateLogin(username, password);
    
    // Log du résultat
    if (result.success) {
      console.log(`✅ Connexion réussie pour ${username}`);
    } else {
      console.log(`❌ Connexion échouée pour ${username}: ${result.message}`);
    }
    
    // Retourner la réponse avec le bon code de statut HTTP
    const statusCode = result.success ? 200 : 401;
    res.status(statusCode).json(result);
    
  } catch (error) {
    console.error(`💥 Erreur lors de la validation pour ${username}:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API de validation BCInet opérationnelle',
    timestamp: new Date().toISOString()
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 API Server démarré sur http://localhost:${PORT}`);
  console.log(`📋 Endpoints disponibles:`);
  console.log(`   POST /api/validate-login - Valider des identifiants`);
  console.log(`   GET  /api/health - Vérifier l'état de l'API`);
});

export default app;
