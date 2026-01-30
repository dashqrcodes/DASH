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
];
