// Bible API utility with caching for popular verses and prayers
// Translations: NKJV, NIV, Catholic (D-R English), Catholic Spanish

interface BibleVerse {
  reference: string;
  text: string;
  translation: string;
  language: 'en' | 'es';
}

interface CatholicPrayer {
  title: string;
  text: string;
  language: 'en' | 'es';
}

// Popular Catholic prayers (pre-loaded, no API needed)
const CATHOLIC_PRAYERS: { en: CatholicPrayer[]; es: CatholicPrayer[] } = {
  en: [
    {
      title: "Eternal Rest",
      text: "Eternal rest grant unto them, O Lord, and let perpetual light shine upon them. May their souls and the souls of all the faithful departed, through the mercy of God, rest in peace. Amen.",
      language: 'en'
    },
    {
      title: "Prayer for the Dead",
      text: "O God, whose nature is ever merciful and forgiving, look lovingly upon the soul of your servant and grant that through the prayers of the Blessed Virgin Mary and all your saints, they may be forgiven their sins and merit to join you in heaven. Amen.",
      language: 'en'
    }
  ],
  es: [
    {
      title: "Descanso Eterno",
      text: "Descanso eterno les otorga, Señor, y que la luz perpetua brille sobre ellos. Que sus almas y las almas de todos los fieles difuntos, por la misericordia de Dios, descansen en paz. Amén.",
      language: 'es'
    },
    {
      title: "Oración por los Difuntos",
      text: "Dios, cuya naturaleza es siempre misericordiosa y perdonadora, mira con amor al alma de tu siervo y concede que, por las oraciones de la Santísima Virgen María y todos tus santos, sean perdonados sus pecados y merezcan unirse a ti en el cielo. Amén.",
      language: 'es'
    }
  ]
};

// Popular Bible verses (pre-loaded)
const POPULAR_VERSES: { en: BibleVerse[]; es: BibleVerse[] } = {
  en: [
    {
      reference: "Psalm 23:1-6",
      text: "The Lord is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake. Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me. Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over. Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the Lord forever.",
      translation: "NKJV",
      language: 'en'
    },
    {
      reference: "John 14:1-3",
      text: "Do not let your hearts be troubled. You believe in God; believe also in me. My Father's house has many rooms; if that were not so, would I have told you that I am going there to prepare a place for you? And if I go and prepare a place for you, I will come back and take you to be with me that you also may be where I am.",
      translation: "NIV",
      language: 'en'
    },
    {
      reference: "Revelation 21:4",
      text: "And God will wipe away every tear from their eyes, and there shall be no more death, nor sorrow, nor crying. There shall be no more pain, for the former things have passed away.",
      translation: "NKJV",
      language: 'en'
    },
    {
      reference: "John 14:1-3",
      text: "Let not your heart be troubled: ye believe in God, believe also in me. In my Father's house are many mansions: if it were not so, I would have told you. I go to prepare a place for you. And if I go and prepare a place for you, I will come again, and receive you unto myself; that where I am, there ye may be also.",
      translation: "NKJV",
      language: 'en'
    }
  ],
  es: [
    {
      reference: "Salmo 23:1-6",
      text: "El Señor es mi pastor, nada me falta. En verdes praderas me hace descansar, junto a aguas tranquilas me conduce. Me renueva las fuerzas, me lleva por sendero de justicia por amor de su nombre. Aunque camine por valle tenebroso, ningún mal temo, porque Tú estás conmigo; Tu vara y tu cayado me dan seguridad. Preparas una mesa frente a mí, ante mis enemigos; perfumas mi cabeza con ungüento, mi copa rebosa. Tu bondad y misericordia me acompañarán todos los días de mi vida, habitaré en la casa del Señor por años sin término.",
      translation: "Catholic",
      language: 'es'
    },
    {
      reference: "Juan 14:1-3",
      text: "No se turbe su corazón; crean en Dios, crean también en mí. En la casa de mi Padre hay muchas moradas; si no fuera así, se lo habría dicho, porque voy a prepararles un lugar. Si me fuere y les preparare un lugar, vendré otra vez y los tomaré conmigo, para que donde yo estoy, ustedes también estén.",
      translation: "Catholic",
      language: 'es'
    },
    {
      reference: "Apocalipsis 21:4",
      text: "Dios enjugará toda lágrima de sus ojos; y ya no habrá muerte, ni duelo, ni llanto, ni dolor, porque las cosas de antes pasaron.",
      translation: "Catholic",
      language: 'es'
    }
  ]
};

// Search Bible verses using free API (bible-api.com)
export async function searchBibleVerse(query: string, translation: 'NIV' | 'NKJV' | 'Catholic', language: 'en' | 'es'): Promise<BibleVerse | null> {
  try {
    // Map translation codes for bible-api.com
    const translationMap: Record<string, string> = {
      'NIV': 'niv',
      'NKJV': 'kjv',
      'Catholic': language === 'es' ? 'rvr' : 'kjv' // Use KJV as closest for English Catholic
    };
    
    const translationCode = translationMap[translation];
    
    // Parse query (e.g., "John 14:1-3" or "Psalm 23:1")
    const bookMatch = query.match(/^(\d*\s*\w+)\s+(\d+):(\d+)(?:-(\d+))?/i);
    if (!bookMatch) {
      return null;
    }
    
    const [, book, chapter, startVerse, endVerse] = bookMatch;
    const bookName = book.trim();
    
    // Construct API URL
    const apiUrl = `https://bible-api.com/${encodeURIComponent(bookName)} ${chapter}:${startVerse}${endVerse ? `-${endVerse}` : ''}?translation=${translationCode}`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch verse');
    }
    
    const data = await response.json();
    
    return {
      reference: data.reference || query,
      text: data.text || '',
      translation: translation,
      language: language
    };
  } catch (error) {
    console.error('Error searching Bible verse:', error);
    return null;
  }
}

// Search by keywords or paraphrasing (semantic search)
export function searchByKeywords(query: string, language: 'en' | 'es'): Array<{ text: string; reference?: string; title?: string; score: number }> {
  const lowercaseQuery = query.toLowerCase();
  const verses = POPULAR_VERSES[language];
  const prayers = CATHOLIC_PRAYERS[language];
  
  // Keyword mapping for common memorial themes (English & Spanish)
  const keywordMap: Record<string, string[]> = {
    'comfort': ['comfort', 'peace', 'rest', 'troubled', 'fear', 'mercy', 'consuelo', 'paz', 'descanso', 'temor', 'misericordia'],
    'heaven': ['heaven', 'father', 'house', 'mansions', 'place', 'prepare', 'cielo', 'padre', 'casa', 'moradas', 'lugar', 'preparar'],
    'death': ['death', 'departed', 'soul', 'eternal', 'life', 'rest', 'muerte', 'difunto', 'alma', 'eterno', 'vida', 'descanso'],
    'shepherd': ['shepherd', 'pasture', 'water', 'valley', 'rod', 'staff', 'pastor', 'praderas', 'agua', 'valle', 'vara', 'cayado'],
    'tears': ['tears', 'wipe', 'pain', 'sorrow', 'crying', 'lágrimas', 'enjugar', 'dolor', 'llanto', 'llorar'],
    'peace': ['peace', 'calm', 'still', 'rest', 'troubled', 'paz', 'calma', 'tranquilo', 'descanso', 'turbado'],
    'love': ['love', 'mercy', 'goodness', 'kindness', 'amor', 'misericordia', 'bondad', 'amabilidad'],
    'hope': ['hope', 'faith', 'believe', 'trust', 'esperanza', 'fe', 'creer', 'confiar']
  };
  
  // Function to calculate relevance score
  const calculateScore = (text: string, reference?: string): number => {
    let score = 0;
    const lowerText = text.toLowerCase();
    const lowerRef = reference?.toLowerCase() || '';
    
    // Direct word match in text
    const queryWords = lowercaseQuery.split(/\s+/).filter(w => w.length > 2);
    queryWords.forEach(word => {
      if (lowerText.includes(word)) score += 10;
      if (lowerRef.includes(word)) score += 5;
    });
    
    // Semantic keyword matching
    Object.entries(keywordMap).forEach(([theme, keywords]) => {
      if (queryWords.some(qw => theme.includes(qw) || keywords.includes(qw))) {
        keywords.forEach(keyword => {
          if (lowerText.includes(keyword)) score += 3;
        });
      }
    });
    
    return score;
  };
  
  // Score all content
  const scoredVerses = verses.map(v => ({
    text: v.text,
    reference: v.reference,
    score: calculateScore(v.text, v.reference)
  }));
  
  const scoredPrayers = prayers.map(p => ({
    text: p.text,
    title: p.title,
    score: calculateScore(p.text, p.title)
  }));
  
  // Combine and filter results with score > 0
  const results = [...scoredVerses, ...scoredPrayers]
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5); // Return top 5 matches
  
  return results;
}

// Get popular verses or prayers based on language
export function getPopularContent(language: 'en' | 'es'): Array<{ text: string; reference?: string; title?: string }> {
  const verses = POPULAR_VERSES[language].map(v => ({ text: v.text, reference: v.reference }));
  const prayers = CATHOLIC_PRAYERS[language].map(p => ({ text: p.text, title: p.title }));
  return [...verses, ...prayers];
}

