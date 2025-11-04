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

// Get popular verses or prayers based on language
export function getPopularContent(language: 'en' | 'es'): Array<{ text: string; reference?: string; title?: string }> {
  const verses = POPULAR_VERSES[language].map(v => ({ text: v.text, reference: v.reference }));
  const prayers = CATHOLIC_PRAYERS[language].map(p => ({ text: p.text, title: p.title }));
  return [...verses, ...prayers];
}

