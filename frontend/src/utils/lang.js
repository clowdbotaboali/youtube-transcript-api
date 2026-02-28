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
  'Privacy Policy': 'Politique de confidentialitÃ©',
  'Refund Policy': 'Politique de remboursement',
  'Digital transcript generation service': 'Service numÃ©rique de gÃ©nÃ©ration de transcriptions',
  'Client Dashboard': 'Tableau client',
  'History & Links': 'Historique et liens',
  'History & Saved Links': 'Historique et liens enregistrÃ©s',
  'Account Details': 'DÃ©tails du compte',
  'Plans & Pricing': 'Plans et tarification',
  'Quick Actions': 'Actions rapides',
  'Top-up request': 'Demande de recharge',
  'Open settings': 'Ouvrir les paramÃ¨tres',
  'Sign out': 'DÃ©connexion',
  'Settings': 'ParamÃ¨tres',
  'Top up': 'Recharger',
  'Overview': 'AperÃ§u',
  Users: 'Utilisateurs',
  Payments: 'Paiements',
  'Admin Panel': 'Panneau admin',
  'Admin Login | Transcript AI': 'Connexion admin | Transcript AI',
  'Admin Panel | Transcript AI': 'Panneau admin | Transcript AI',
  'Admin panel login.': "Connexion au panneau d'administration.",
  'Control panel sign in': 'Connexion au panneau de contrÃ´le',
  Admin: 'Admin',
  'Username or email': "Nom d'utilisateur ou e-mail",
  Password: 'Mot de passe',
  'Signing in...': 'Connexion...',
  'Admin Sign In': 'Connexion Admin',
  Refresh: 'Actualiser',
  Logout: 'DÃ©connexion',
  'Total Users': 'Utilisateurs totaux',
  'Pending Payments': 'Paiements en attente',
  'Approved Payments': 'Paiements approuvÃ©s',
  'Unique Extracted Links': 'Liens extraits uniques',
  Email: 'E-mail',
  Credits: 'CrÃ©dits',
  'Paid Credits': 'CrÃ©dits payÃ©s',
  Created: 'CrÃ©Ã© le',
  'User ID': 'ID utilisateur',
  Method: 'MÃ©thode',
  Amount: 'Montant',
  Status: 'Statut',
  Ref: 'RÃ©fÃ©rence',
  Actions: 'Actions',
  Pending: 'En attente',
  Approved: 'ApprouvÃ©',
  Rejected: 'RejetÃ©',
  Approve: 'Approuver',
  Reject: 'Refuser',
  'Admin Settings': 'ParamÃ¨tres admin',
  Username: "Nom d'utilisateur",
  'New password (optional)': 'Nouveau mot de passe (optionnel)',
  'Save Settings': 'Enregistrer les paramÃ¨tres',
  'Failed to load admin data': 'Ã‰chec du chargement des donnÃ©es admin',
  'Failed to review payment': 'Ã‰chec de la revue du paiement',
  'Failed to save admin settings': "Ã‰chec de l'enregistrement des paramÃ¨tres admin",
  'Admin login failed': 'Ã‰chec de connexion admin',
  'Transcript Extraction Workspace': 'Espace de gÃ©nÃ©ration de transcription',
  'Paste a URL, extract transcript, then process or chat.':
    "Collez un lien, extrayez la transcription, puis lancez l'analyse ou le chat.",
  'Extract transcript from YouTube': 'Extraire la transcription depuis YouTube',
  'Paste YouTube URL here...': "Collez l'URL YouTube ici...",
  'Extract transcript': 'Extraire la transcription',
  'Extracting...': 'Extraction en cours...',
  'Please enter a YouTube URL': 'Veuillez saisir un lien YouTube',
  'Request timed out. Please re-login and try again.':
    'La requÃªte a expirÃ©. Reconnectez-vous puis rÃ©essayez.',
  'Transcript extraction failed': "Ã‰chec de l'extraction de la transcription",
  'Low-quality transcript detected. Try another video.':
    'Transcription de faible qualitÃ© dÃ©tectÃ©e. Essayez une autre vidÃ©o.',
  'Extraction timed out. Please try again.': "DÃ©lai d'extraction dÃ©passÃ©. RÃ©essayez.",
  'Connection failed': 'Ã‰chec de connexion',
  'Connection failed.': 'Ã‰chec de connexion.',
  'Original Transcript': "Transcription d'origine",
  'Result:': 'RÃ©sultat :',
  'Word count': 'Nombre de mots',
  Copy: 'Copier',
  Copied: 'CopiÃ©',
  Download: 'TÃ©lÃ©charger',
  Save: 'Enregistrer',
  Saved: 'EnregistrÃ©',
  Summary: 'RÃ©sumÃ©',
  Steps: 'Ã‰tapes',
  Resources: 'Ressources',
  'Full analysis': 'Analyse complÃ¨te',
  'AI output': 'Sortie IA',
  'Summary only': 'RÃ©sumÃ© uniquement',
  'Extract steps': 'Extraire les Ã©tapes',
  'Extract resources': 'Extraire les ressources',
  'Full processing': 'Traitement complet',
  'AI processing options': "Options d'analyse IA",
  'Processing...': 'Traitement en cours...',
  'Task List': 'Liste de tÃ¢ches',
  Export: 'Exporter',
  Progress: 'Progression',
  Reset: 'RÃ©initialiser',
  'Reset all tasks?': 'RÃ©initialiser toutes les tÃ¢ches ?',
  done: 'terminÃ©',
  'No structured tasks were detected.': 'Aucune tÃ¢che structurÃ©e dÃ©tectÃ©e.',
  'Saved History': 'Historique enregistrÃ©',
  'Saved Links': 'Liens enregistrÃ©s',
  'Filter by type': 'Filtrer par type',
  All: 'Tout',
  Extraction: 'Extraction',
  Chat: 'Chat',
  Other: 'Autre',
  View: 'Afficher',
  Delete: 'Supprimer',
  'Delete this item?': 'Supprimer cet Ã©lÃ©ment ?',
  Result: 'RÃ©sultat',
  'No transcript.': 'Aucune transcription.',
  'No saved result for this record.': 'Aucun rÃ©sultat enregistrÃ© pour cet Ã©lÃ©ment.',
  'Total items:': 'Ã‰lÃ©ments totaux :',
  'Total links:': 'Liens totaux :',
  Loading: 'Chargement',
  'Loading...': 'Chargement...',
  'No saved records.': 'Aucun Ã©lÃ©ment enregistrÃ©.',
  'No saved links yet.': 'Aucun lien enregistrÃ© pour le moment.',
  'Open in workspace': "Ouvrir dans l'espace de travail",
  YouTube: 'YouTube',
  'Search by title or video ID...': 'Rechercher par titre ou ID vidÃ©o...',
  'Plans & Top-up': 'Plans et recharge',
  'Free plan: 5 video links only. Summary and chat on the same video are free.':
    'Plan gratuit : 5 liens vidÃ©o uniquement. Le rÃ©sumÃ© et le chat pour la mÃªme vidÃ©o sont gratuits.',
  'Free Plan': 'Plan gratuit',
  Active: 'Actif',
  '5 video links included': '5 liens vidÃ©o inclus',
  'Each new video link costs 1 credit': 'Chaque nouveau lien vidÃ©o coÃ»te 1 crÃ©dit',
  'Same-video summary/chat has no extra charge':
    'RÃ©sumÃ©/chat sur la mÃªme vidÃ©o sans coÃ»t supplÃ©mentaire',
  'Paid Top-up': 'Recharge payante',
  Flexible: 'Flexible',
  'Amount in USD ($5 increments)': 'Montant en USD (par paliers de 5 $)',
  'Invalid amount. Choose $5 or its multiples.':
    'Montant invalide. Choisissez 5 $ ou ses multiples.',
  'Total:': 'Total :',
  'Base:': 'Base :',
  'Bonus:': 'Bonus :',
  'Price:': 'Prix :',
  'Payment method': 'MÃ©thode de paiement',
  'Sender/wallet number': "NumÃ©ro de l'expÃ©diteur/portefeuille",
  Optional: 'Optionnel',
  'Transfer reference': 'RÃ©fÃ©rence du transfert',
  'Submitting request...': 'Envoi de la demande...',
  'Submit top-up request': 'Envoyer la demande de recharge',
  'Amount must be in $5 increments (5, 10, 15...)':
    'Le montant doit Ãªtre par paliers de 5 $ (5, 10, 15...)',
  'Digital Service for YouTube Transcript Generation':
    'Service numÃ©rique pour la gÃ©nÃ©ration de transcription YouTube',
  'Transcript Generation': 'GÃ©nÃ©ration de transcription',
  'Text Analysis': 'Analyse de texte',
  'Context Chat': 'Chat contextuel',
  'This service provides transcript output from user-submitted YouTube links, with optional text analysis tools.':
    "Ce service fournit des transcriptions Ã  partir de liens YouTube fournis par l'utilisateur, avec des outils d'analyse de texte optionnels.",
  'Create account': 'CrÃ©er un compte',
  'Start now': 'Commencer',
  'How It Works': 'Comment Ã§a marche',
  'Sign in': 'Se connecter',
  'Submit YouTube URL': "Envoyer l'URL YouTube",
  'Receive Text Output': 'Recevoir la sortie texte',
  'URL to Text': 'URL vers texte',
  'Optional Analysis': 'Analyse optionnelle',
  'Chat Assistance': 'Assistance chat',
  'Usage History': "Historique d'utilisation",
  'Quick Snapshot': 'AperÃ§u rapide',
  'Welcome to your client workspace': 'Bienvenue dans votre espace client',
  'Start New Extraction': 'DÃ©marrer une nouvelle extraction',
  'Go to Workspace': "Aller Ã  l'espace de travail",
  'Review Saved History': "Consulter l'historique",
  'Open History': "Ouvrir l'historique",
  'Manage Credits': 'GÃ©rer les crÃ©dits',
  'Top up credits': 'Recharger les crÃ©dits',
  'Top-up starts at': 'Recharge Ã  partir de',
  'Automatic bonus credits for larger amounts':
    'CrÃ©dits bonus automatiques pour les montants plus Ã©levÃ©s',
  'Digital transcript generation service.': 'Service numÃ©rique de gÃ©nÃ©ration de transcriptions.',
  'Preparing session...': 'PrÃ©paration de la session...',
  'Authentication configuration is missing': "Configuration d'authentification manquante",
  'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel environment variables, then redeploy.':
    "DÃ©finissez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans les variables d'environnement Vercel, puis redÃ©ployez.",
  'Please sign in to use AI processing.': "Veuillez vous connecter pour utiliser l'analyse IA.",
  'No credits left. Please top up.': 'Plus de crÃ©dits disponibles. Veuillez recharger.',
  'Session expired. Please sign in again.': 'Session expirÃ©e. Reconnectez-vous.',
  'Failed to save result.': "Ã‰chec de l'enregistrement du rÃ©sultat.",
  'Signed in successfully.': 'Connexion rÃ©ussie.',
  'Signed out successfully.': 'DÃ©connexion rÃ©ussie.',
  'Pricing | Transcript AI': 'Tarification | Transcript AI',
  'Pricing plans for Transcript AI digital transcript generation service.':
    'Plans tarifaires pour le service numÃ©rique Transcript AI.',
  'Transcript AI is a digital transcript generation service. Payments are for service access only.':
    "Transcript AI est un service numÃ©rique de gÃ©nÃ©ration de transcriptions. Les paiements couvrent uniquement l'accÃ¨s au service.",
  'Service and Compliance Notes': 'Notes de service et conformitÃ©',
  'This platform provides digital transcript generation access only. No marketplace functionality is offered. No user-to-user financial transfer is supported. No third-party funds are held by this service. Charges apply solely to transcript generation service access.':
    "Cette plateforme fournit uniquement un accÃ¨s Ã  la gÃ©nÃ©ration numÃ©rique de transcriptions. Aucune fonctionnalitÃ© de place de marchÃ© n'est proposÃ©e. Aucun transfert financier entre utilisateurs n'est pris en charge. Aucun fonds tiers n'est dÃ©tenu par ce service. Les frais s'appliquent uniquement Ã  l'accÃ¨s au service de transcription.",
  'Privacy Policy | Transcript AI': 'Politique de confidentialitÃ© | Transcript AI',
  'Terms of Service | Transcript AI': "Conditions d'utilisation | Transcript AI",
  'Refund Policy | Transcript AI': 'Politique de remboursement | Transcript AI',
  'Contact | Transcript AI': 'Contact | Transcript AI',
  'Last updated:': 'DerniÃ¨re mise Ã  jour :'
};

function normalize(value) {
  return String(value || '').trim();
}

function frenchFallback(value) {
  const normalized = normalize(value);
  if (!normalized) return normalized;
  return FR_MAP[normalized] || normalized;
}

export function tr(lang, ar, en, fr) {
  const arText = typeof ar === 'string' ? ar : '';
  const enText = typeof en === 'string' ? en : arText;
  const frText = typeof fr === 'string' ? fr : '';
  const hasBrokenArabic = /\?{2,}|Ã¯Â¿Â½/.test(arText);

  if (lang === LANG.ar && !hasBrokenArabic) {
    return arText;
  }

  if (lang === LANG.fr) {
    return frText || frenchFallback(enText || arText);
  }

  return enText;
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
