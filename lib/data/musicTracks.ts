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

const formatDuration = (totalSeconds: number) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
};

const openverseAmbientSeed: Array<
  [string, string, string, number, string, string]
> = [
  [
    "08409a78-b70e-4c15-a96c-5a2accbbbb08",
    "Action music loop with dark ambient drones",
    "burning-mir",
    29,
    "https://cdn.freesound.org/previews/155/155139_2098884-hq.mp3",
    "https://freesound.org/people/burning-mir/sounds/155139",
  ],
  [
    "17cd4cd6-ff63-43f6-9688-bad5c3007e0e",
    "Dark Ambient backgrounding 001",
    "steaq",
    80,
    "https://cdn.freesound.org/previews/238/238251_1474204-hq.mp3",
    "https://freesound.org/people/steaq/sounds/238251",
  ],
  [
    "8386b680-fe33-4789-880b-3b5055d3e4ae",
    "Stressing Ambient",
    "onderwish",
    103,
    "https://cdn.freesound.org/previews/273/273306_2694940-hq.mp3",
    "https://freesound.org/people/onderwish/sounds/273306",
  ],
  [
    "d4d1f6c8-c835-4022-a123-69e9d366f8bd",
    "Atmospheric Ambient Spacy Synth Beat.wav",
    "RutgerMuller",
    33,
    "https://cdn.freesound.org/previews/51/51230_179538-hq.mp3",
    "https://freesound.org/people/RutgerMuller/sounds/51230",
  ],
  [
    "62f25e3a-3d20-4de7-8766-0483234bff52",
    "beneath ambient 2.wav",
    "tradeshowmusic",
    101,
    "https://cdn.freesound.org/previews/136/136721_1060964-hq.mp3",
    "https://freesound.org/people/tradeshowmusic/sounds/136721",
  ],
  [
    "211af5c0-44f7-4c6b-ac20-eecb44118842",
    "[Ambient Hits] Atmospheric boom",
    "waveplaySFX",
    55,
    "https://cdn.freesound.org/previews/329/329593_1676145-hq.mp3",
    "https://freesound.org/people/waveplaySFX/sounds/329593",
  ],
  [
    "fb59db88-8694-4eff-98c6-b0a2ac4458a9",
    "Space Organ Ambient Music 2013-11-30",
    "unfa",
    470,
    "https://cdn.freesound.org/previews/209/209315_1038806-hq.mp3",
    "https://freesound.org/people/unfa/sounds/209315",
  ],
  [
    "15a35d53-a478-43ee-99b7-b16635bd80e1",
    "ambient dream.wav",
    "spacydreamy",
    439,
    "https://cdn.freesound.org/previews/460/460304_9192836-hq.mp3",
    "https://freesound.org/people/spacydreamy/sounds/460304",
  ],
  [
    "a6dc2660-cb78-4f8d-840b-d2e59172f521",
    "[Ambient Bass] Deep atmospheric pad",
    "waveplaySFX",
    128,
    "https://cdn.freesound.org/previews/238/238780_1676145-hq.mp3",
    "https://freesound.org/people/waveplaySFX/sounds/238780",
  ],
  [
    "a698a149-5368-42be-bf09-48f736dfd6c6",
    "Ambient Guitar Sounds",
    "edtijo",
    43,
    "https://cdn.freesound.org/previews/241/241071_2376154-hq.mp3",
    "https://freesound.org/people/edtijo/sounds/241071",
  ],
  [
    "1c6b9bd3-cd24-4856-ba3c-5bc3738e4beb",
    "space music ambient",
    "evanjones4",
    79,
    "https://cdn.freesound.org/previews/243/243998_1738784-hq.mp3",
    "https://freesound.org/people/evanjones4/sounds/243998",
  ],
  [
    "f3130afc-4aaf-42a1-9c85-a482df9de35b",
    "Dark Ambient 1",
    "strathamer",
    289,
    "https://cdn.freesound.org/previews/415/415891_5406086-hq.mp3",
    "https://freesound.org/people/strathamer/sounds/415891",
  ],
  [
    "04211b58-1d75-438f-bf10-b8ef118c4e8e",
    "Long Ambient Pad",
    "indigo.cloud",
    48,
    "https://cdn.freesound.org/previews/254/254856_4680767-hq.mp3",
    "https://freesound.org/people/indigo.cloud/sounds/254856",
  ],
  [
    "20502270-b305-450f-927f-1bc502814064",
    "Ambient Space Texture",
    "Andrewkn",
    316,
    "https://cdn.freesound.org/previews/474/474864_7038073-hq.mp3",
    "https://freesound.org/people/Andrewkn/sounds/474864",
  ],
  [
    "463b582e-6ebc-4a23-8511-cd6a86db8f9e",
    "Witches Ambient Horror (Invented language).wav",
    "maurolupo",
    80,
    "https://cdn.freesound.org/previews/331/331302_3931578-hq.mp3",
    "https://freesound.org/people/maurolupo/sounds/331302",
  ],
  [
    "5be71d9a-ae46-400a-85e1-3679eddd1773",
    "Calm And Sad Ambient",
    "Sami_Hiltunen",
    115,
    "https://cdn.freesound.org/previews/652/652432_4912242-hq.mp3",
    "https://freesound.org/people/Sami_Hiltunen/sounds/652432",
  ],
  [
    "079858da-dfe5-4805-b2d0-dca0f8b48557",
    "ambient key swirl.wav",
    "yammerhant",
    107,
    "https://cdn.freesound.org/previews/215/215751_4035005-hq.mp3",
    "https://freesound.org/people/yammerhant/sounds/215751",
  ],
  [
    "bb9c593e-bbad-4717-b548-e5121d38b603",
    "Dark Ambient 2",
    "strathamer",
    349,
    "https://cdn.freesound.org/previews/415/415890_5406086-hq.mp3",
    "https://freesound.org/people/strathamer/sounds/415890",
  ],
  [
    "e93a2d6d-96e7-4b5c-9ede-dc656b639d25",
    "Dark Ambient backgrounding 002",
    "steaq",
    43,
    "https://cdn.freesound.org/previews/238/238252_1474204-hq.mp3",
    "https://freesound.org/people/steaq/sounds/238252",
  ],
  [
    "33b617a8-88cf-46a4-9980-47bb5234ccb6",
    "image31_s ambient pad.wav",
    "Karma-Ron",
    140,
    "https://cdn.freesound.org/previews/240/240622_16058-hq.mp3",
    "https://freesound.org/people/Karma-Ron/sounds/240622",
  ],
  [
    "4481e1b3-7177-4395-af57-74e9ecc3d447",
    "Ambiente Calle",
    "eldiariosonoro_",
    593,
    "https://cdn.freesound.org/previews/539/539362_11961848-hq.mp3",
    "https://freesound.org/people/eldiariosonoro_/sounds/539362",
  ],
  [
    "22da027f-57c6-4c79-a528-c3711bd430ef",
    "Ambient soundscape",
    "gusgus26",
    43,
    "https://cdn.freesound.org/previews/128/128687_2147722-hq.mp3",
    "https://freesound.org/people/gusgus26/sounds/128687",
  ],
  [
    "666ffbb3-30d8-4704-92b1-fb82e84e1f69",
    "Gothic Ambient Noise 1 Stereo C3",
    "Vanyamba",
    63,
    "https://cdn.freesound.org/previews/529/529152_1063450-hq.mp3",
    "https://freesound.org/people/Vanyamba/sounds/529152",
  ],
  [
    "90670cc8-b301-4e8b-b4eb-54f29c566616",
    "Ambient E Wall of Sound",
    "unfa",
    247,
    "https://cdn.freesound.org/previews/269/269341_1038806-hq.mp3",
    "https://freesound.org/people/unfa/sounds/269341",
  ],
  [
    "1f9f767d-cc3f-4d88-8111-54caa9b13949",
    "Slow Sad Mood Orchestral Strings Choir Cinematic Ambient Atmo Music Surround.wav",
    "szegvari",
    82,
    "https://cdn.freesound.org/previews/609/609657_2282212-hq.mp3",
    "https://freesound.org/people/szegvari/sounds/609657",
  ],
  [
    "17add8a4-eb28-43a8-9f40-b375c254cdf8",
    "[FX] ambient echo 7",
    "waveplaySFX",
    41,
    "https://cdn.freesound.org/previews/187/187522_1676145-hq.mp3",
    "https://freesound.org/people/waveplaySFX/sounds/187522",
  ],
  [
    "931e7d7e-e2e6-4485-8791-8a09d0583c3e",
    "DivKid 4 Voice Ambient Reel - MIX.wav",
    "makenoisemusic",
    160,
    "https://cdn.freesound.org/previews/423/423664_7700251-hq.mp3",
    "https://freesound.org/people/makenoisemusic/sounds/423664",
  ],
  [
    "ee031263-d338-41e6-8d68-027baf7351ac",
    "Ambient Wave 48 (Tribute)",
    "Erokia",
    198,
    "https://cdn.freesound.org/previews/496/496757_9497060-hq.mp3",
    "https://freesound.org/people/Erokia/sounds/496757",
  ],
  [
    "c53ffc69-39fa-48a8-95c4-3518373a24fd",
    "Space ambient music fragment.Wav",
    "Clacksberg",
    66,
    "https://cdn.freesound.org/previews/491/491288_10147508-hq.mp3",
    "https://freesound.org/people/Clacksberg/sounds/491288",
  ],
  [
    "80b89bcd-f44f-4738-a6a4-2e59f1d4d684",
    "Ethereal Ambient music..wav",
    "Clacksberg",
    78,
    "https://cdn.freesound.org/previews/500/500218_10147508-hq.mp3",
    "https://freesound.org/people/Clacksberg/sounds/500218",
  ],
  [
    "a3f1ed45-1262-4082-826d-a0a234727ad4",
    "ambient space rock2M.wav",
    "spacydreamy",
    272,
    "https://cdn.freesound.org/previews/477/477170_9192836-hq.mp3",
    "https://freesound.org/people/spacydreamy/sounds/477170",
  ],
  [
    "cca5d5fb-3f2b-4b12-9b69-c0c9dd1aa904",
    "DivKid 4 Voice Ambient Reel - DRY ONLY.wav",
    "makenoisemusic",
    160,
    "https://cdn.freesound.org/previews/423/423666_7700251-hq.mp3",
    "https://freesound.org/people/makenoisemusic/sounds/423666",
  ],
  [
    "6dd30c53-8859-4033-b1fb-67d68765843d",
    "DivKid 4 Voice Ambient Reel - FX ONLY.wav",
    "makenoisemusic",
    160,
    "https://cdn.freesound.org/previews/423/423665_7700251-hq.mp3",
    "https://freesound.org/people/makenoisemusic/sounds/423665",
  ],
  [
    "0796b3fd-3e8a-407a-bf9b-e3e9917dc0f3",
    "Pinecone ambient",
    "evanjones4",
    110,
    "https://cdn.freesound.org/previews/318/318685_1738784-hq.mp3",
    "https://freesound.org/people/evanjones4/sounds/318685",
  ],
  [
    "161d3a1f-7483-4c35-849f-90e1e4328d24",
    "Ambient 18062016",
    "cabled_mess",
    287,
    "https://cdn.freesound.org/previews/348/348592_5450487-hq.mp3",
    "https://freesound.org/people/cabled_mess/sounds/348592",
  ],
  [
    "10e529c8-ce0c-4703-8bae-aaf7f88e0e57",
    "Ambient and Saturated Pad",
    "Geoff-Bremner-Audio",
    270,
    "https://cdn.freesound.org/previews/613/613784_10643461-hq.mp3",
    "https://freesound.org/people/Geoff-Bremner-Audio/sounds/613784",
  ],
  [
    "7e0f9da1-f31f-462e-9ce0-07c575435faf",
    "Ambient game",
    "JeltsinSH",
    44,
    "https://cdn.freesound.org/previews/481/481121_6580639-hq.mp3",
    "https://freesound.org/people/JeltsinSH/sounds/481121",
  ],
  [
    "f7c7cb60-8ff6-4200-b5dc-478e9d1c995e",
    "Ambient Riser/Sting",
    "AbrahamMast",
    68,
    "https://cdn.freesound.org/previews/617/617003_4859416-hq.mp3",
    "https://freesound.org/people/AbrahamMast/sounds/617003",
  ],
  [
    "7c3eb586-4e4e-41d9-b528-a414ff6b211b",
    "Ambient synth in A 10052016",
    "cabled_mess",
    146,
    "https://cdn.freesound.org/previews/345/345591_5450487-hq.mp3",
    "https://freesound.org/people/cabled_mess/sounds/345591",
  ],
  [
    "8defaf4f-e62e-4f2f-9810-eebbce99aa16",
    "ambient space noise",
    "g0ggs",
    82,
    "https://cdn.freesound.org/previews/342/342602_1181012-hq.mp3",
    "https://freesound.org/people/g0ggs/sounds/342602",
  ],
  [
    "2bcccdf7-0b82-4f91-b3d9-773d306d4f44",
    "Magical Atmosphere (Ambient)",
    "tonijsstrods",
    497,
    "https://cdn.freesound.org/previews/603/603989_7993693-hq.mp3",
    "https://freesound.org/people/tonijsstrods/sounds/603989",
  ],
  [
    "013dfc64-e357-4249-b84b-53921e5d4090",
    "New York Club - Electric Cinemaric House Ambient Dance EDM Music - Mastered.wav",
    "szegvari",
    41,
    "https://cdn.freesound.org/previews/607/607298_2282212-hq.mp3",
    "https://freesound.org/people/szegvari/sounds/607298",
  ],
  [
    "92c98567-f264-4e42-88d3-15a3833feb32",
    "Ambient Lofi Melody Loop 88 BPM.wav",
    "holizna",
    44,
    "https://cdn.freesound.org/previews/629/629148_12574855-hq.mp3",
    "https://freesound.org/people/holizna/sounds/629148",
  ],
  [
    "3abd0715-78e4-4260-9c6f-de6393e4a9e0",
    "Overlook (uplifting ambient loop)",
    "SondreDrakensson",
    78,
    "https://cdn.freesound.org/previews/506/506495_6628165-hq.mp3",
    "https://freesound.org/people/SondreDrakensson/sounds/506495",
  ],
  [
    "20327c77-6a2c-4d00-a547-733a40682089",
    "space ambient v02.wav",
    "burning-mir",
    152,
    "https://cdn.freesound.org/previews/524/524951_2098884-hq.mp3",
    "https://freesound.org/people/burning-mir/sounds/524951",
  ],
  [
    "3c8782e2-1183-4aad-a8e2-a6656e8c73d9",
    "Sci-fi ambient stern calm int.wav",
    "martian",
    30,
    "https://cdn.freesound.org/previews/513/513509_84709-hq.mp3",
    "https://freesound.org/people/martian/sounds/513509",
  ],
  [
    "d4718d1e-b865-474b-a2e0-3aea17758876",
    "Dark ambient drone sound",
    "martinbeltov",
    49,
    "https://cdn.freesound.org/previews/244/244196_3213161-hq.mp3",
    "https://freesound.org/people/martinbeltov/sounds/244196",
  ],
  [
    "9b21423b-bc6d-453c-8daa-d03b5aaf14ed",
    "Ambient Sting Crescendo",
    "AbrahamMast",
    38,
    "https://cdn.freesound.org/previews/514/514631_4859416-hq.mp3",
    "https://freesound.org/people/AbrahamMast/sounds/514631",
  ],
  [
    "aa9bd9ac-b756-464c-9c72-48b3fa88f0da",
    "Ambient Sound #1",
    "danlucaz",
    181,
    "https://cdn.freesound.org/previews/515/515240_9996727-hq.mp3",
    "https://freesound.org/people/danlucaz/sounds/515240",
  ],
  [
    "324c61a9-fdef-4b59-bf82-0cd5fe04a059",
    "powerful ambient sub bass pulses",
    "chestnutjam",
    163,
    "https://cdn.freesound.org/previews/399/399442_2955613-hq.mp3",
    "https://freesound.org/people/chestnutjam/sounds/399442",
  ],
];

const openverseAmbientTracks: MusicTrack[] = openverseAmbientSeed.map(
  ([id, title, artist, seconds, audioUrl, sourceUrl]) => ({
    id: `openverse-${id}`,
    title,
    artist,
    duration: formatDuration(seconds),
    audioUrl,
    sourceUrl,
    licenseName: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
  })
);

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
  ...openverseAmbientTracks,
];
