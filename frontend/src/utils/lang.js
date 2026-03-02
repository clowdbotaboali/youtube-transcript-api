export const LANG = {
  ar: 'ar',
  en: 'en',
  fr: 'fr'
};

const LANG_ORDER = [LANG.ar, LANG.en, LANG.fr];

const FR_MAP = {
  Home: 'Accueil',
  Pricing: 'Tarification',
  Contact: 'Contact',
  Terms: 'Conditions',
  'Privacy Policy': 'Politique de confidentialité',
  'Refund Policy': 'Politique de remboursement',
  'Digital transcript generation service': 'Service numérique de génération de transcriptions',
  'Client Dashboard': 'Tableau client',
  'History & Links': 'Historique et liens',
  'History & Saved Links': 'Historique et liens enregistrés',
  'Account Details': 'Détails du compte',
  'Plans & Pricing': 'Plans et tarification',
  'Quick Actions': 'Actions rapides',
  'Top-up request': 'Demande de recharge',
  'Open settings': 'Ouvrir les paramètres',
  'Sign out': 'Déconnexion',
  'Settings': 'Paramètres',
  'Top up': 'Recharger',
  'Overview': 'Aperçu',
  Users: 'Utilisateurs',
  Payments: 'Paiements',
  'Admin Panel': 'Panneau admin',
  'Admin Login | Transcripta AI': 'Connexion admin | Transcripta AI',
  'Admin Panel | Transcripta AI': 'Panneau admin | Transcripta AI',
  'Admin panel login.': "Connexion au panneau d'administration.",
  'Control panel sign in': 'Connexion au panneau de contrôle',
  Admin: 'Admin',
  'Username or email': "Nom d'utilisateur ou e-mail",
  Password: 'Mot de passe',
  'Signing in...': 'Connexion...',
  'Admin Sign In': 'Connexion Admin',
  Refresh: 'Actualiser',
  Logout: 'Déconnexion',
  'Total Users': 'Utilisateurs totaux',
  'Pending Payments': 'Paiements en attente',
  'Approved Payments': 'Paiements approuvés',
  'Unique Extracted Links': 'Liens extraits uniques',
  Email: 'E-mail',
  Credits: 'Crédits',
  'Paid Credits': 'Crédits payés',
  Created: 'Créé le',
  'User ID': 'ID utilisateur',
  Method: 'Méthode',
  Amount: 'Montant',
  Status: 'Statut',
  Ref: 'Référence',
  Actions: 'Actions',
  Pending: 'En attente',
  Approved: 'Approuvé',
  Rejected: 'Rejeté',
  Approve: 'Approuver',
  Reject: 'Refuser',
  'Admin Settings': 'Paramètres admin',
  Username: "Nom d'utilisateur",
  'New password (optional)': 'Nouveau mot de passe (optionnel)',
  'Save Settings': 'Enregistrer les paramètres',
  'Failed to load admin data': 'Échec du chargement des données admin',
  'Failed to review payment': 'Échec de la revue du paiement',
  'Failed to save admin settings': "Échec de l'enregistrement des paramètres admin",
  'Admin login failed': 'Échec de connexion admin',
  'Transcript Extraction Workspace': 'Espace de génération de transcription',
  'Paste a URL, extract transcript, then process or chat.':
    "Collez un lien, extrayez la transcription, puis lancez l'analyse ou le chat.",
  'Extract transcript from YouTube': 'Extraire la transcription depuis YouTube',
  'Paste YouTube URL here...': "Collez l'URL YouTube ici...",
  'Extract transcript': 'Extraire la transcription',
  'Extracting...': 'Extraction en cours...',
  'Please enter a YouTube URL': 'Veuillez saisir un lien YouTube',
  'Request timed out. Please re-login and try again.':
    'La requête a expiré. Reconnectez-vous puis réessayez.',
  'Transcript extraction failed': "Échec de l'extraction de la transcription",
  'Low-quality transcript detected. Try another video.':
    'Transcription de faible qualité détectée. Essayez une autre vidéo.',
  'Extraction timed out. Please try again.': "Délai d'extraction dépassé. Réessayez.",
  'Connection failed': 'Échec de connexion',
  'Connection failed.': 'Échec de connexion.',
  'Original Transcript': "Transcription d'origine",
  'Result:': 'Résultat :',
  'Word count': 'Nombre de mots',
  Copy: 'Copier',
  Copied: 'Copié',
  Download: 'Télécharger',
  Save: 'Enregistrer',
  Saved: 'Enregistré',
  Summary: 'Résumé',
  Steps: 'Étapes',
  Resources: 'Ressources',
  'Full analysis': 'Analyse complète',
  'AI output': 'Sortie IA',
  'Summary only': 'Résumé uniquement',
  'Extract steps': 'Extraire les étapes',
  'Extract resources': 'Extraire les ressources',
  'Full processing': 'Traitement complet',
  'AI processing options': "Options d'analyse IA",
  'Processing...': 'Traitement en cours...',
  'Task List': 'Liste de tâches',
  Export: 'Exporter',
  Progress: 'Progression',
  Reset: 'Réinitialiser',
  'Reset all tasks?': 'Réinitialiser toutes les tâches ?',
  done: 'terminé',
  'No structured tasks were detected.': 'Aucune tâche structurée détectée.',
  'Saved History': 'Historique enregistré',
  'Saved Links': 'Liens enregistrés',
  'Filter by type': 'Filtrer par type',
  All: 'Tout',
  Extraction: 'Extraction',
  Chat: 'Chat',
  Other: 'Autre',
  View: 'Afficher',
  Delete: 'Supprimer',
  'Delete this item?': 'Supprimer cet élément ?',
  Result: 'Résultat',
  'No transcript.': 'Aucune transcription.',
  'No saved result for this record.': 'Aucun résultat enregistré pour cet élément.',
  'Total items:': 'Éléments totaux :',
  'Total links:': 'Liens totaux :',
  Loading: 'Chargement',
  'Loading...': 'Chargement...',
  'No saved records.': 'Aucun élément enregistré.',
  'No saved links yet.': 'Aucun lien enregistré pour le moment.',
  'Open in workspace': "Ouvrir dans l'espace de travail",
  YouTube: 'YouTube',
  'Search by title or video ID...': 'Rechercher par titre ou ID vidéo...',
  'Plans & Top-up': 'Plans et recharge',
  'Free plan: 5 video links only. Summary and chat on the same video are free.':
    'Plan gratuit : 5 liens vidéo uniquement. Le résumé et le chat pour la même vidéo sont gratuits.',
  'Free Plan': 'Plan gratuit',
  Active: 'Actif',
  '5 video links included': '5 liens vidéo inclus',
  'Each new video link costs 1 credit': 'Chaque nouveau lien vidéo coûte 1 crédit',
  'Same-video summary/chat has no extra charge':
    'Résumé/chat sur la même vidéo sans coût supplémentaire',
  'Paid Top-up': 'Recharge payante',
  Flexible: 'Flexible',
  'Amount in USD ($5 increments)': 'Montant en USD (par paliers de 5 $)',
  'Invalid amount. Choose $5 or its multiples.':
    'Montant invalide. Choisissez 5 $ ou ses multiples.',
  'Total:': 'Total :',
  'Base:': 'Base :',
  'Bonus:': 'Bonus :',
  'Price:': 'Prix :',
  'Payment method': 'Méthode de paiement',
  'Sender/wallet number': "Numéro de l'expéditeur/portefeuille",
  Optional: 'Optionnel',
  'Transfer reference': 'Référence du transfert',
  'Submitting request...': 'Envoi de la demande...',
  'Submit top-up request': 'Envoyer la demande de recharge',
  'Amount must be in $5 increments (5, 10, 15...)':
    'Le montant doit être par paliers de 5 $ (5, 10, 15...)',
  'Digital Service for YouTube Transcript Generation':
    'Service numérique pour la génération de transcription YouTube',
  'Transcript Generation': 'Génération de transcription',
  'Text Analysis': 'Analyse de texte',
  'Context Chat': 'Chat contextuel',
  'This service provides transcript output from user-submitted YouTube links, with optional text analysis tools.':
    "Ce service fournit des transcriptions à partir de liens YouTube fournis par l'utilisateur, avec des outils d'analyse de texte optionnels.",
  'Create account': 'Créer un compte',
  'Start now': 'Commencer',
  'How It Works': 'Comment ça marche',
  'Sign in': 'Se connecter',
  'Submit YouTube URL': "Envoyer l'URL YouTube",
  'Receive Text Output': 'Recevoir la sortie texte',
  'URL to Text': 'URL vers texte',
  'Optional Analysis': 'Analyse optionnelle',
  'Chat Assistance': 'Assistance chat',
  'Usage History': "Historique d'utilisation",
  'Quick Snapshot': 'Aperçu rapide',
  'Welcome to your client workspace': 'Bienvenue dans votre espace client',
  'Start New Extraction': 'Démarrer une nouvelle extraction',
  'Go to Workspace': "Aller à l'espace de travail",
  'Review Saved History': "Consulter l'historique",
  'Open History': "Ouvrir l'historique",
  'Manage Credits': 'Gérer les crédits',
  'Top up credits': 'Recharger les crédits',
  'Top-up starts at': 'Recharge à partir de',
  'Automatic bonus credits for larger amounts':
    'Crédits bonus automatiques pour les montants plus élevés',
  'Digital transcript generation service.': 'Service numérique de génération de transcriptions.',
  'Preparing session...': 'Préparation de la session...',
  'Authentication configuration is missing': "Configuration d'authentification manquante",
  'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel environment variables, then redeploy.':
    "Définissez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans les variables d'environnement Vercel, puis redéployez.",
  'Please sign in to use AI processing.': "Veuillez vous connecter pour utiliser l'analyse IA.",
  'No credits left. Please top up.': 'Plus de crédits disponibles. Veuillez recharger.',
  'Session expired. Please sign in again.': 'Session expirée. Reconnectez-vous.',
  'Failed to save result.': "Échec de l'enregistrement du résultat.",
  'Signed in successfully.': 'Connexion réussie.',
  'Signed out successfully.': 'Déconnexion réussie.',
  'Pricing | Transcripta AI': 'Tarification | Transcripta AI',
  'Pricing plans for Transcripta AI digital transcript generation service.':
    'Plans tarifaires pour le service numérique Transcripta AI.',
  'Transcripta AI is a digital transcript generation service. Payments are for service access only.':
    "Transcripta AI est un service numérique de génération de transcriptions. Les paiements couvrent uniquement l'accès au service.",
  'Service and Compliance Notes': 'Notes de service et conformité',
  'This platform provides digital transcript generation access only. No marketplace functionality is offered. No user-to-user financial transfer is supported. No third-party funds are held by this service. Charges apply solely to transcript generation service access.':
    "Cette plateforme fournit uniquement un accès à la génération numérique de transcriptions. Aucune fonctionnalité de place de marché n'est proposée. Aucun transfert financier entre utilisateurs n'est pris en charge. Aucun fonds tiers n'est détenu par ce service. Les frais s'appliquent uniquement à l'accès au service de transcription.",
  'Privacy Policy | Transcripta AI': 'Politique de confidentialité | Transcripta AI',
  'Terms of Service | Transcripta AI': "Conditions d'utilisation | Transcripta AI",
  'Refund Policy | Transcripta AI': 'Politique de remboursement | Transcripta AI',
  'Contact | Transcripta AI': 'Contact | Transcripta AI',
  'Last updated:': 'Dernière mise à jour :'
};

const CP1252_REVERSE = {
  '€': 0x80,
  '‚': 0x82,
  'ƒ': 0x83,
  '„': 0x84,
  '…': 0x85,
  '†': 0x86,
  '‡': 0x87,
  'ˆ': 0x88,
  '‰': 0x89,
  'Š': 0x8a,
  '‹': 0x8b,
  'Œ': 0x8c,
  'Ž': 0x8e,
  '‘': 0x91,
  '’': 0x92,
  '“': 0x93,
  '”': 0x94,
  '•': 0x95,
  '–': 0x96,
  '—': 0x97,
  '˜': 0x98,
  '™': 0x99,
  'š': 0x9a,
  '›': 0x9b,
  'œ': 0x9c,
  'ž': 0x9e,
  'Ÿ': 0x9f
};

function looksLikeMojibake(value) {
  return /[ÃÂØÙÐÑâ€]|Ã¯Â¿Â½/.test(String(value || ''));
}

function decodeUnicodeEscapes(value) {
  const raw = String(value || '');
  if (!raw.includes('\\u')) return raw;
  try {
    return raw.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  } catch {
    return raw;
  }
}

function decodeMojibakePass(value) {
  const raw = String(value || '');
  if (!raw || !looksLikeMojibake(raw)) return raw;
  try {
    const bytes = [];
    for (const char of raw) {
      const code = char.charCodeAt(0);
      if (code <= 0xff) {
        bytes.push(code);
        continue;
      }
      if (Object.prototype.hasOwnProperty.call(CP1252_REVERSE, char)) {
        bytes.push(CP1252_REVERSE[char]);
        continue;
      }
      return raw;
    }
    const decoded = new TextDecoder('utf-8').decode(Uint8Array.from(bytes)).trim();
    return decoded || raw;
  } catch {
    return raw;
  }
}

function decodeMojibake(value) {
  let current = String(value || '');
  for (let i = 0; i < 4; i += 1) {
    const next = decodeMojibakePass(current);
    if (!next || next === current) break;
    current = next;
  }
  return current;
}

function normalize(value) {
  const trimmed = String(value || '').trim();
  const fromEscapes = decodeUnicodeEscapes(trimmed);
  return decodeMojibake(fromEscapes).trim();
}

export function cleanText(value, fallback = '') {
  const normalized = normalize(value);
  return normalized || fallback;
}

function frenchFallback(value) {
  const normalized = normalize(value);
  if (!normalized) return normalized;
  return normalize(FR_MAP[normalized] || normalized);
}

export function tr(lang, ar, en, fr) {
  const arText = normalize(typeof ar === 'string' ? ar : '');
  const enText = normalize(typeof en === 'string' ? en : arText);
  const frText = normalize(typeof fr === 'string' ? fr : '');

  if (lang === LANG.ar) {
    return arText || enText;
  }

  if (lang === LANG.fr) {
    return frText || frenchFallback(enText || arText);
  }

  return enText || arText;
}

export function nextLang(currentLang) {
  const idx = LANG_ORDER.indexOf(currentLang);
  if (idx < 0) return LANG.en;
  return LANG_ORDER[(idx + 1) % LANG_ORDER.length];
}

export function langBadge(lang) {
  if (lang === LANG.ar) return 'AR';
  if (lang === LANG.fr) return 'FR';
  return 'EN';
}
