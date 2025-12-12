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

// Cache for API responses
const cache = new Map<string, { data: BibleVerse | CatholicPrayer; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60 * 24 * 7; // 7 days

// Popular Catholic prayers (pre-loaded, no API needed)
const CATHOLIC_PRAYERS: { en: CatholicPrayer[]; es: CatholicPrayer[] } = {
  en: [
    {
      title: "Our Father",
      text: "Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.",
      language: 'en'
    },
    {
      title: "Hail Mary",
      text: "Hail Mary, full of grace. The Lord is with thee. Blessed art thou amongst women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.",
      language: 'en'
    },
    {
      title: "Eternal Rest",
      text: "Eternal rest grant unto them, O Lord, and let perpetual light shine upon them. May their souls and the souls of all the faithful departed, through the mercy of God, rest in peace. Amen.",
      language: 'en'
    },
    {
      title: "Prayer for the Dead",
      text: "O God, whose nature is ever merciful and forgiving, look lovingly upon the soul of your servant and grant that through the prayers of the Blessed Virgin Mary and all your saints, they may be forgiven their sins and merit to join you in heaven. Amen.",
      language: 'en'
    },
    {
      title: "Saint Michael Prayer",
      text: "Saint Michael the Archangel, defend us in battle. Be our protection against the wickedness and snares of the devil. May God rebuke him, we humbly pray, and do thou, O Prince of the heavenly hosts, by the divine power of God, cast into hell Satan and all the evil spirits who prowl through the world seeking the ruin of souls. Amen.",
      language: 'en'
    }
  ],
  es: [
    {
      title: "Padre Nuestro",
      text: "Padre nuestro que estás en el cielo, santificado sea tu Nombre; venga a nosotros tu reino; hágase tu voluntad en la tierra como en el cielo. Danos hoy nuestro pan de cada día; perdona nuestras ofensas, como también nosotros perdonamos a los que nos ofenden; no nos dejes caer en la tentación, y líbranos del mal. Amén.",
      language: 'es'
    },
    {
      title: "Ave María",
      text: "Dios te salve, María, llena eres de gracia, el Señor es contigo. Bendita tú eres entre todas las mujeres, y bendito es el fruto de tu vientre, Jesús. Santa María, Madre de Dios, ruega por nosotros, pecadores, ahora y en la hora de nuestra muerte. Amén.",
      language: 'es'
    },
    {
      title: "Descanso Eterno",
      text: "Descanso eterno les otorga, Señor, y que la luz perpetua brille sobre ellos. Que sus almas y las almas de todos los fieles difuntos, por la misericordia de Dios, descansen en paz. Amén.",
      language: 'es'
    },
    {
      title: "Oración por los Difuntos",
      text: "Dios, cuya naturaleza es siempre misericordiosa y perdonadora, mira con amor al alma de tu siervo y concede que, por las oraciones de la Santísima Virgen María y todos tus santos, sean perdonados sus pecados y merezcan unirse a ti en el cielo. Amén.",
      language: 'es'
    },
    {
      title: "Oración a San Miguel",
      text: "San Miguel Arcángel, defiéndenos en la batalla. Sé nuestro amparo contra la perversidad y asechanzas del demonio. Que Dios manifieste contra él su poder, te rogamos suplicantes. Y tú, príncipe del ejército celestial, con el poder de Dios, arroja al infierno a Satanás y a todos los espíritus malignos que vagan por el mundo buscando la perdición de las almas. Amén.",
      language: 'es'
    }
  ]
};

// Popular Bible verses (pre-loaded, cached) - NIV, NKJV, Catholic only
const POPULAR_VERSES: { en: BibleVerse[]; es: BibleVerse[] } = {
  en: [
    {
      reference: "Psalm 23:1-6",
      text: "\"The Lord is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake. Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me. Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over. Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the Lord forever.\" - Psalm 23",
      translation: "NKJV",
      language: 'en'
    },
    {
      reference: "John 14:1-3",
      text: "\"Do not let your hearts be troubled. You believe in God; believe also in me. My Father's house has many rooms; if that were not so, would I have told you that I am going there to prepare a place for you? And if I go and prepare a place for you, I will come back and take you to be with me that you also may be where I am.\" - John 14:1-3",
      translation: "NIV",
      language: 'en'
    },
    {
      reference: "Revelation 21:4",
      text: "\"And God will wipe away every tear from their eyes, and there shall be no more death, nor sorrow, nor crying. There shall be no more pain, for the former things have passed away.\" - Revelation 21:4",
      translation: "NKJV",
      language: 'en'
    },
    {
      reference: "Isaiah 43:1-2",
      text: "\"Fear not, for I have redeemed you; I have called you by your name; you are Mine. When you pass through the waters, I will be with you; and through the rivers, they shall not overflow you.\" - Isaiah 43:1-2",
      translation: "NKJV",
      language: 'en'
    },
    {
      reference: "1 Corinthians 13:4-8",
      text: "\"Love suffers long and is kind; love does not envy; love does not parade itself, is not puffed up; does not behave rudely, does not seek its own, is not provoked, thinks no evil; does not rejoice in iniquity, but rejoices in the truth; bears all things, believes all things, hopes all things, endures all things. Love never fails.\" - 1 Corinthians 13:4-8",
      translation: "NKJV",
      language: 'en'
    }
  ],
  es: [
    {
      reference: "Salmo 23:1-6",
      text: "\"El Señor es mi pastor, nada me falta. En verdes praderas me hace descansar, junto a aguas tranquilas me conduce. Me renueva las fuerzas, me lleva por sendero de justicia por amor de su nombre. Aunque camine por valle tenebroso, ningún mal temo, porque Tú estás conmigo; Tu vara y tu cayado me dan seguridad. Preparas una mesa frente a mí, ante mis enemigos; perfumas mi cabeza con ungüento, mi copa rebosa. Tu bondad y misericordia me acompañarán todos los días de mi vida, habitaré en la casa del Señor por años sin término.\" - Salmo 23",
      translation: "Catholic",
      language: 'es'
    },
    {
      reference: "Juan 14:1-3",
      text: "\"No se turbe su corazón; crean en Dios, crean también en mí. En la casa de mi Padre hay muchas moradas; si no fuera así, se lo habría dicho, porque voy a prepararles un lugar. Si me fuere y les preparare un lugar, vendré otra vez y los tomaré conmigo, para que donde yo estoy, ustedes también estén.\" - Juan 14:1-3",
      translation: "Catholic",
      language: 'es'
    },
    {
      reference: "Apocalipsis 21:4",
      text: "\"Dios enjugará toda lágrima de sus ojos; y ya no habrá muerte, ni duelo, ni llanto, ni dolor, porque las cosas de antes pasaron.\" - Apocalipsis 21:4",
      translation: "Catholic",
      language: 'es'
    },
    {
      reference: "Isaías 43:1-2",
      text: "\"No temas, porque yo te he rescatado, te he llamado por tu nombre, tú eres mío. Cuando pases por las aguas, yo estaré contigo; si por los ríos, no te arrastrarán.\" - Isaías 43:1-2",
      translation: "Catholic",
      language: 'es'
    },
    {
      reference: "1 Corintios 13:4-8",
      text: "\"El amor es paciente, es bondadoso; el amor no es envidioso, no es jactancioso, no se engríe. Todo lo soporta, todo lo cree, todo lo espera, todo lo tolera. El amor jamás pasará.\" - 1 Corintios 13:4-8",
      translation: "Catholic",
      language: 'es'
    }
  ]
};

// Get popular verses or prayers based on language
export function getPopularContent(language: 'en' | 'es'): Array<BibleVerse | CatholicPrayer> {
  return [
    ...POPULAR_VERSES[language],
    ...CATHOLIC_PRAYERS[language]
  ];
}

// Check cache validity
function isCacheValid(key: string): boolean {
  const cached = cache.get(key);
  if (!cached) return false;
  return Date.now() - cached.timestamp < CACHE_DURATION;
}

// Get from cache or fetch from API
export async function getBibleVerse(
  reference: string,
  translation: string = 'NIV',
  language: 'en' | 'es' = 'en'
): Promise<BibleVerse> {
  const cacheKey = `${reference}-${translation}-${language}`;
  
  if (isCacheValid(cacheKey)) {
    const cached = cache.get(cacheKey)!;
    return cached.data as BibleVerse;
  }
  
  // TODO: Implement API.Bible integration when API key is available
  // For now, return from pre-loaded verses
  const verses = POPULAR_VERSES[language];
  const found = verses.find(v => v.reference === reference);
  
  if (found) {
    cache.set(cacheKey, { data: found, timestamp: Date.now() });
    return found;
  }
  
  // Fallback
  return {
    reference,
    text: `\"${reference}\"`,
    translation,
    language
  };
}

// Search verses by keyword
export function searchVerses(keyword: string, language: 'en' | 'es'): BibleVerse[] {
  const verses = POPULAR_VERSES[language];
  const keywordLower = keyword.toLowerCase();
  return verses.filter(verse => 
    verse.text.toLowerCase().includes(keywordLower) ||
    verse.reference.toLowerCase().includes(keywordLower)
  );
}

// Get all verses
export function getAllVerses(language: 'en' | 'es'): BibleVerse[] {
  return POPULAR_VERSES[language];
}

// Get all prayers
export function getAllPrayers(language: 'en' | 'es'): CatholicPrayer[] {
  return CATHOLIC_PRAYERS[language];
}

