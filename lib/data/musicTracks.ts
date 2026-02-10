"use client";

export type MusicTrack = {
  id: string;
  title: string;
  artist: string;
  duration: string;
  audioUrl: string;
  sourceUrl: string;
  licenseName: string;
  licenseUrl: string;
};

export const musicTracks: MusicTrack[] = [
  {
    id: "satie-gymnopedie-1",
    title: "Gymnopédie No. 1",
    artist: "Erik Satie (performance by Teknopazzo)",
    duration: "3:25",
    audioUrl:
      "https://upload.wikimedia.org/wikipedia/commons/transcoded/b/b7/Gymnopedie_No._1..ogg/Gymnopedie_No._1..ogg.mp3?download",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Gymnopedie_No._1..ogg",
    licenseName: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  {
    id: "satie-gymnopedie-3",
    title: "Gymnopédie No. 3",
    artist: "Erik Satie (performance by Teknopazzo)",
    duration: "2:36",
    audioUrl:
      "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/ce/Gymnop%C3%A9die_no.3.ogg/Gymnop%C3%A9die_no.3.ogg.mp3?download",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Gymnop%C3%A9die_no.3.ogg",
    licenseName: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  {
    id: "bach-wtc-1",
    title: "Prelude & Fugue No. 1 in C major (BWV 846)",
    artist: "J.S. Bach (Musopen)",
    duration: "4:14",
    audioUrl:
      "https://upload.wikimedia.org/wikipedia/commons/transcoded/a/ac/JS_Bach_-_Well_Tempered_Clavier_-_Prelude_in_Fugue_No.1_in_C_major.ogg/JS_Bach_-_Well_Tempered_Clavier_-_Prelude_in_Fugue_No.1_in_C_major.ogg.mp3?download",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:JS_Bach_-_Well_Tempered_Clavier_-_Prelude_in_Fugue_No.1_in_C_major.ogg",
    licenseName: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  {
    id: "beethoven-minuet-g",
    title: "Minuet in G (WoO 10 No. 2)",
    artist: "L. van Beethoven (performance by Peter Johnston)",
    duration: "2:24",
    audioUrl:
      "https://upload.wikimedia.org/wikipedia/commons/transcoded/d/db/Minuet_in_G_%28Beethoven%29%2C_piano.ogg/Minuet_in_G_%28Beethoven%29%2C_piano.ogg.mp3?download",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Minuet_in_G_(Beethoven),_piano.ogg",
    licenseName: "Public Domain",
    licenseUrl: "https://creativecommons.org/publicdomain/mark/1.0/deed.en",
  },
  {
    id: "satie-gymnopedie-1-musopen",
    title: "Gymnopédies No. 1 (Lent et douloureux)",
    artist: "Erik Satie (performance by Robin Alciatore)",
    duration: "3:04",
    audioUrl:
      "https://upload.wikimedia.org/wikipedia/commons/transcoded/9/90/Erik_Satie_-_gymnopedies_-_la_1_ere._lent_et_douloureux.ogg/Erik_Satie_-_gymnopedies_-_la_1_ere._lent_et_douloureux.ogg.mp3?download",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Erik_Satie_-_gymnopedies_-_la_1_ere._lent_et_douloureux.ogg",
    licenseName: "Public Domain",
    licenseUrl: "https://creativecommons.org/publicdomain/mark/1.0/deed.en",
  },
  {
    id: "gershwin-rhapsody-in-blue",
    title: "Rhapsody in Blue (Piano Solo)",
    artist: "George Gershwin (performance by hmscomp)",
    duration: "15:57",
    audioUrl:
      "https://upload.wikimedia.org/wikipedia/commons/8/85/George_Gershwin%27s_%22Rhapsody_in_Blue%22_piano_solo.mp3",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:George_Gershwin%27s_%22Rhapsody_in_Blue%22_piano_solo.mp3",
    licenseName: "CC0 1.0 (performance)",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  {
    id: "bach-wtc-prelude-1-kimiko",
    title: "Prelude No. 1 in C major (BWV 846)",
    artist: "J.S. Bach (performance by Kimiko Ishizaka)",
    duration: "2:43",
    audioUrl:
      "https://upload.wikimedia.org/wikipedia/commons/transcoded/b/b6/Kimiko_Ishizaka_-_Bach_-_Well-Tempered_Clavier%2C_Book_1_-_01_Prelude_No._1_in_C_major%2C_BWV_846.ogg/Kimiko_Ishizaka_-_Bach_-_Well-Tempered_Clavier%2C_Book_1_-_01_Prelude_No._1_in_C_major%2C_BWV_846.ogg.mp3?download",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Kimiko_Ishizaka_-_Bach_-_Well-Tempered_Clavier,_Book_1_-_01_Prelude_No._1_in_C_major,_BWV_846.ogg",
    licenseName: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  {
    id: "bach-art-of-fugue-contrapunctus-1",
    title: "Contrapunctus 1 (Art of Fugue, BWV 1080)",
    artist: "J.S. Bach (performance by Kimiko Ishizaka)",
    duration: "3:05",
    audioUrl:
      "https://upload.wikimedia.org/wikipedia/commons/transcoded/3/3b/Kimiko_Ishizaka_-_J.S._Bach%2C_The_Art_of_Fugue%2C_BWV_1080_-_01_Contrapunctus_1.ogg/Kimiko_Ishizaka_-_J.S._Bach%2C_The_Art_of_Fugue%2C_BWV_1080_-_01_Contrapunctus_1.ogg.mp3?download",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Kimiko_Ishizaka_-_J.S._Bach,_The_Art_of_Fugue,_BWV_1080_-_01_Contrapunctus_1.ogg",
    licenseName: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  {
    id: "bach-goldberg-aria",
    title: "Goldberg Variations — Aria",
    artist: "J.S. Bach (performance by Kimiko Ishizaka)",
    duration: "5:00",
    audioUrl:
      "https://upload.wikimedia.org/wikipedia/commons/transcoded/7/7d/Goldberg_Variations_BWV_988_01_Aria.flac/Goldberg_Variations_BWV_988_01_Aria.flac.mp3?download",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Goldberg_Variations_BWV_988_01_Aria.flac",
    licenseName: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  {
    id: "chopin-nocturne-op9-no1",
    title: "Nocturne No. 1 in B-flat minor (Op. 9)",
    artist: "Frédéric Chopin (performance by Vadim Chaimovich)",
    duration: "6:37",
    audioUrl:
      "https://upload.wikimedia.org/wikipedia/commons/transcoded/b/bf/Chopin,_Nocturne_No._1_in_B_Flat_Minor,_Op._9.ogg/Chopin,_Nocturne_No._1_in_B_Flat_Minor,_Op._9.ogg.mp3?download",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Chopin,_Nocturne_No._1_in_B_Flat_Minor,_Op._9.ogg",
    licenseName: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  {
    id: "chopin-nocturne-op9-no2",
    title: "Nocturne No. 2 in E-flat major (Op. 9)",
    artist: "Frédéric Chopin (performance by Peter Johnston)",
    duration: "4:19",
    audioUrl:
      "https://upload.wikimedia.org/wikipedia/commons/transcoded/0/04/Chopin_Nocturne_No._2_in_E_Flat_Major,_Op._9.ogg/Chopin_Nocturne_No._2_in_E_Flat_Major,_Op._9.ogg.mp3?download",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Chopin_Nocturne_No._2_in_E_Flat_Major,_Op._9.ogg",
    licenseName: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  {
    id: "bach-wtc-prelude-5-kimiko",
    title: "Prelude No. 5 in D major (BWV 850)",
    artist: "J.S. Bach (performance by Kimiko Ishizaka)",
    duration: "1:33",
    audioUrl:
      "https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a0/Kimiko_Ishizaka_-_Bach_-_Well-Tempered_Clavier%2C_Book_1_-_09_Prelude_No._5_in_D_major%2C_BWV_850.ogg/Kimiko_Ishizaka_-_Bach_-_Well-Tempered_Clavier%2C_Book_1_-_09_Prelude_No._5_in_D_major%2C_BWV_850.ogg.mp3?download",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Kimiko_Ishizaka_-_Bach_-_Well-Tempered_Clavier,_Book_1_-_09_Prelude_No._5_in_D_major,_BWV_850.ogg",
    licenseName: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  {
    id: "bach-wtc-prelude-16-kimiko",
    title: "Prelude No. 16 in G minor (BWV 861)",
    artist: "J.S. Bach (performance by Kimiko Ishizaka)",
    duration: "2:14",
    audioUrl:
      "https://upload.wikimedia.org/wikipedia/commons/transcoded/1/19/Kimiko_Ishizaka_-_Bach_-_Well-Tempered_Clavier%2C_Book_1_-_31_Prelude_No._16_in_G_minor%2C_BWV_861.ogg/Kimiko_Ishizaka_-_Bach_-_Well-Tempered_Clavier%2C_Book_1_-_31_Prelude_No._16_in_G_minor%2C_BWV_861.ogg.mp3?download",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Kimiko_Ishizaka_-_Bach_-_Well-Tempered_Clavier,_Book_1_-_31_Prelude_No._16_in_G_minor,_BWV_861.ogg",
    licenseName: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  {
    id: "bach-goldberg-variatio-1",
    title: "Goldberg Variations — Variatio 1",
    artist: "J.S. Bach (performance by Kimiko Ishizaka)",
    duration: "1:56",
    audioUrl:
      "https://upload.wikimedia.org/wikipedia/commons/transcoded/1/1b/Goldberg_Variations_02_Variatio_1_a_1_Clav.ogg/Goldberg_Variations_02_Variatio_1_a_1_Clav.ogg.mp3?download",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Goldberg_Variations_02_Variatio_1_a_1_Clav.ogg",
    licenseName: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  {
    id: "bach-goldberg-variatio-2",
    title: "Goldberg Variations — Variatio 2",
    artist: "J.S. Bach (performance by Kimiko Ishizaka)",
    duration: "2:04",
    audioUrl:
      "https://upload.wikimedia.org/wikipedia/commons/transcoded/b/bc/Goldberg_Variations_03_Variatio_2_a_1_Clav.ogg/Goldberg_Variations_03_Variatio_2_a_1_Clav.ogg.mp3?download",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Goldberg_Variations_03_Variatio_2_a_1_Clav.ogg",
    licenseName: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  {
    id: "bach-goldberg-variatio-9-canon-terza",
    title: "Goldberg Variations — Variatio 9 (Canon at the 3rd)",
    artist: "J.S. Bach (performance by Kimiko Ishizaka)",
    duration: "2:06",
    audioUrl:
      "https://upload.wikimedia.org/wikipedia/commons/transcoded/1/18/Goldberg_Variations_10_Variatio_9_a_1_Clav._Canone_alla_Terza.ogg/Goldberg_Variations_10_Variatio_9_a_1_Clav._Canone_alla_Terza.ogg.mp3?download",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Goldberg_Variations_10_Variatio_9_a_1_Clav._Canone_alla_Terza.ogg",
    licenseName: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  {
    id: "bach-goldberg-variatio-16-ouverture",
    title: "Goldberg Variations — Variatio 16 (Ouverture)",
    artist: "J.S. Bach (performance by Kimiko Ishizaka)",
    duration: "3:09",
    audioUrl:
      "https://upload.wikimedia.org/wikipedia/commons/transcoded/f/f6/Goldberg_Variations_17_Variatio_16_a_1_Clav._Ouverture.ogg/Goldberg_Variations_17_Variatio_16_a_1_Clav._Ouverture.ogg.mp3?download",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Goldberg_Variations_17_Variatio_16_a_1_Clav._Ouverture.ogg",
    licenseName: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  {
    id: "bach-goldberg-variatio-24-canon-ottava",
    title: "Goldberg Variations — Variatio 24 (Canon at the Octave)",
    artist: "J.S. Bach (performance by Kimiko Ishizaka)",
    duration: "2:46",
    audioUrl:
      "https://upload.wikimedia.org/wikipedia/commons/transcoded/d/d0/Goldberg_Variations_25_Variatio_24_a_1_Clav._Canone_all_Ottava.ogg/Goldberg_Variations_25_Variatio_24_a_1_Clav._Canone_all_Ottava.ogg.mp3?download",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Goldberg_Variations_25_Variatio_24_a_1_Clav._Canone_all_Ottava.ogg",
    licenseName: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  {
    id: "bach-goldberg-aria-da-capo",
    title: "Goldberg Variations — Aria da Capo",
    artist: "J.S. Bach (performance by Kimiko Ishizaka)",
    duration: "2:50",
    audioUrl:
      "https://upload.wikimedia.org/wikipedia/commons/transcoded/9/94/Goldberg_Variations_32_Aria_da_Capo_%C3%A8_Fine.ogg/Goldberg_Variations_32_Aria_da_Capo_%C3%A8_Fine.ogg.mp3?download",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Goldberg_Variations_32_Aria_da_Capo_%C3%A8_Fine.ogg",
    licenseName: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
];
