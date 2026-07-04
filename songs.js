/* SaxHero data: fingerings, songs, lessons.
   Notes are written pitch for alto sax (treble clef). Durations are in beats. */

/* Fingering lanes: [octave, L1, L2, L3, R1, R2, R3] — standard alto/tenor fingerings */
const FINGERINGS = {
  'D4':  [0,1,1,1,1,1,1],
  'E4':  [0,1,1,1,1,1,0],
  'F4':  [0,1,1,1,1,0,0],
  'F#4': [0,1,1,1,0,1,0],
  'G4':  [0,1,1,1,0,0,0],
  'A4':  [0,1,1,0,0,0,0],
  'Bb4': [0,1,0,0,1,0,0],
  'B4':  [0,1,0,0,0,0,0],
  'C5':  [0,0,1,0,0,0,0],
  'C#5': [0,0,0,0,0,0,0],
  'D5':  [1,1,1,1,1,1,1],
  'E5':  [1,1,1,1,1,1,0],
  'F5':  [1,1,1,1,1,0,0],
  'F#5': [1,1,1,1,0,1,0],
  'G5':  [1,1,1,1,0,0,0],
  'A5':  [1,1,1,0,0,0,0],
  'Bb5': [1,1,0,0,1,0,0],
  'B5':  [1,1,0,0,0,0,0],
  'C6':  [1,0,1,0,0,0,0],
  'C#6': [1,0,0,0,0,0,0],
};

/* Staff step index relative to E4 (bottom line of treble staff) */
const STAFF_STEPS = { C: -2, D: -1, E: 0, F: 1, G: 2, A: 3, B: 4 };

/* n = note name ('R' = rest), d = duration in beats */
const SONGS = [
  {
    id: 'careless-whisper', rank: 1, title: 'Careless Whisper', artist: 'George Michael',
    difficulty: 'Medium', tempo: 76, free: true,
    notes: [
      {n:'G4',d:0.5},{n:'A4',d:0.5},{n:'B4',d:0.5},{n:'D5',d:0.5},
      {n:'C5',d:2},{n:'B4',d:1},{n:'A4',d:1},{n:'F#4',d:3},{n:'R',d:1},
      {n:'G4',d:0.5},{n:'A4',d:0.5},{n:'B4',d:0.5},{n:'D5',d:0.5},
      {n:'B4',d:2},{n:'A4',d:1},{n:'G4',d:1},{n:'E4',d:3},{n:'R',d:1},
      {n:'E5',d:2},{n:'D5',d:1},{n:'B4',d:1},{n:'C5',d:2},
      {n:'B4',d:1},{n:'G4',d:1},{n:'A4',d:4},
    ]
  },
  {
    id: 'baker-street', rank: 2, title: 'Baker Street', artist: 'Gerry Rafferty',
    difficulty: 'Medium', tempo: 105, free: true,
    notes: [
      {n:'A4',d:0.5},{n:'B4',d:0.5},{n:'D5',d:1},{n:'D5',d:0.5},{n:'E5',d:0.5},
      {n:'D5',d:1},{n:'B4',d:1},{n:'A4',d:2},{n:'R',d:0.5},
      {n:'A4',d:0.5},{n:'B4',d:0.5},{n:'D5',d:0.5},{n:'E5',d:1.5},{n:'E5',d:0.5},
      {n:'F#5',d:0.5},{n:'E5',d:0.5},{n:'D5',d:1},{n:'B4',d:2},{n:'R',d:0.5},
      {n:'G5',d:2},{n:'F#5',d:1},{n:'E5',d:1},{n:'D5',d:1},{n:'B4',d:1},{n:'A4',d:3},
    ]
  },
  {
    id: 'pink-panther', rank: 3, title: 'The Pink Panther Theme', artist: 'Henry Mancini',
    difficulty: 'Easy', tempo: 120, free: false,
    notes: [
      {n:'D4',d:0.5},{n:'E4',d:1.5},{n:'F#4',d:0.5},{n:'G4',d:1.5},
      {n:'D4',d:0.5},{n:'E4',d:0.5},{n:'F#4',d:0.5},{n:'G4',d:0.5},
      {n:'C5',d:0.5},{n:'B4',d:0.5},{n:'E4',d:0.5},{n:'G4',d:0.5},{n:'B4',d:0.5},
      {n:'Bb4',d:2.5},{n:'R',d:1},
      {n:'A4',d:0.5},{n:'G4',d:0.5},{n:'E4',d:0.5},{n:'D4',d:0.5},{n:'E4',d:3},
    ]
  },
  {
    id: 'take-five', rank: 4, title: 'Take Five', artist: 'Dave Brubeck Quartet',
    difficulty: 'Hard', tempo: 88, free: false,
    notes: [
      {n:'E5',d:1},{n:'B4',d:0.5},{n:'E5',d:0.5},{n:'F#5',d:0.5},{n:'G5',d:0.5},
      {n:'F#5',d:0.5},{n:'E5',d:0.5},{n:'D5',d:1},{n:'E5',d:2},{n:'R',d:0.5},
      {n:'E5',d:1},{n:'B4',d:0.5},{n:'E5',d:0.5},{n:'F#5',d:0.5},{n:'G5',d:0.5},
      {n:'F#5',d:0.5},{n:'E5',d:0.5},{n:'B4',d:1},{n:'A4',d:2},{n:'R',d:0.5},
      {n:'G5',d:1},{n:'F#5',d:1},{n:'E5',d:1},{n:'D5',d:1},{n:'E5',d:3},
    ]
  },
  {
    id: 'yakety-sax', rank: 5, title: 'Yakety Sax', artist: 'Boots Randolph',
    difficulty: 'Hard', tempo: 140, free: false,
    notes: [
      {n:'E4',d:0.25},{n:'G4',d:0.25},{n:'A4',d:0.25},{n:'B4',d:0.25},
      {n:'C5',d:0.5},{n:'A4',d:0.5},{n:'C5',d:0.5},{n:'A4',d:0.5},
      {n:'C5',d:0.25},{n:'B4',d:0.25},{n:'A4',d:0.25},{n:'G4',d:0.25},
      {n:'E4',d:0.5},{n:'G4',d:0.5},{n:'A4',d:1},{n:'R',d:0.5},
      {n:'E4',d:0.25},{n:'G4',d:0.25},{n:'A4',d:0.25},{n:'B4',d:0.25},
      {n:'C5',d:0.5},{n:'A4',d:0.5},{n:'C5',d:0.5},{n:'D5',d:0.5},
      {n:'B4',d:0.5},{n:'G4',d:0.5},{n:'G4',d:0.25},{n:'A4',d:0.25},{n:'B4',d:0.25},{n:'C5',d:0.25},{n:'A4',d:2},
    ]
  },
  {
    id: 'fly-me-to-the-moon', rank: 6, title: 'Fly Me to the Moon', artist: 'Frank Sinatra',
    difficulty: 'Easy', tempo: 110, free: false,
    notes: [
      {n:'C5',d:1.5},{n:'B4',d:0.5},{n:'A4',d:1},{n:'G4',d:1},
      {n:'F4',d:2},{n:'G4',d:1},{n:'A4',d:1},{n:'C5',d:1},{n:'B4',d:3},{n:'R',d:1},
      {n:'A4',d:1.5},{n:'G4',d:0.5},{n:'F4',d:1},{n:'E4',d:1},
      {n:'D4',d:2},{n:'E4',d:1},{n:'F4',d:1},{n:'A4',d:1},{n:'G4',d:3},
    ]
  },
  {
    id: 'summertime', rank: 7, title: 'Summertime', artist: 'George Gershwin',
    difficulty: 'Easy', tempo: 80, free: false,
    notes: [
      {n:'E5',d:2},{n:'C5',d:0.5},{n:'D5',d:0.5},{n:'E5',d:1},
      {n:'D5',d:0.5},{n:'C5',d:0.5},{n:'A4',d:2},{n:'R',d:0.5},
      {n:'C5',d:1},{n:'A4',d:1},{n:'G4',d:1},{n:'A4',d:3},{n:'R',d:1},
      {n:'E5',d:1.5},{n:'D5',d:0.5},{n:'C5',d:1},{n:'D5',d:1},{n:'E5',d:2},{n:'D5',d:1},{n:'C5',d:1},{n:'A4',d:3},
    ]
  },
  {
    id: 'just-the-two-of-us', rank: 8, title: 'Just the Two of Us', artist: 'Grover Washington Jr.',
    difficulty: 'Medium', tempo: 96, free: false,
    notes: [
      {n:'D5',d:0.5},{n:'C5',d:0.5},{n:'B4',d:1},{n:'G4',d:0.5},{n:'A4',d:0.5},
      {n:'B4',d:0.5},{n:'C5',d:0.5},{n:'B4',d:0.5},{n:'A4',d:0.5},{n:'G4',d:1.5},{n:'R',d:0.5},
      {n:'E4',d:0.5},{n:'G4',d:0.5},{n:'A4',d:1},{n:'B4',d:0.5},{n:'A4',d:0.5},
      {n:'G4',d:0.5},{n:'E4',d:0.5},{n:'D4',d:2},{n:'R',d:0.5},
      {n:'G4',d:0.5},{n:'A4',d:0.5},{n:'B4',d:0.5},{n:'D5',d:1},{n:'B4',d:0.5},{n:'A4',d:0.5},{n:'G4',d:2.5},
    ]
  },
  {
    id: 'girl-from-ipanema', rank: 9, title: 'The Girl from Ipanema', artist: 'Stan Getz & João Gilberto',
    difficulty: 'Easy', tempo: 120, free: false,
    notes: [
      {n:'G4',d:1.5},{n:'E4',d:0.5},{n:'E4',d:1},{n:'D4',d:1},
      {n:'G4',d:1.5},{n:'G4',d:0.5},{n:'E4',d:1},{n:'D4',d:1},
      {n:'G4',d:1},{n:'G4',d:1},{n:'E4',d:1},{n:'E4',d:1},
      {n:'G4',d:1},{n:'F4',d:1},{n:'E4',d:1},{n:'D4',d:1},{n:'E4',d:3},
    ]
  },
  {
    id: 'my-heart-will-go-on', rank: 10, title: 'My Heart Will Go On', artist: 'Céline Dion (Titanic)',
    difficulty: 'Easy', tempo: 100, free: false,
    notes: [
      {n:'B4',d:2},{n:'A4',d:1},{n:'B4',d:1},{n:'A4',d:1},{n:'B4',d:1},{n:'C5',d:2},
      {n:'B4',d:2},{n:'A4',d:2},{n:'G4',d:3},{n:'R',d:1},
      {n:'B4',d:2},{n:'A4',d:1},{n:'B4',d:1},{n:'C5',d:1},{n:'D5',d:2},{n:'C5',d:1},
      {n:'B4',d:2},{n:'A4',d:1},{n:'G4',d:4},
    ]
  },
];

/* Interactive lesson exercises reuse the player. Info lessons open a modal. */
const LESSONS = [
  {
    id: 'l1', num: 1, title: 'Get to know your sax', sub: 'Parts, assembly, and the reed', type: 'info', free: true,
    body: `<p><strong>The three parts:</strong> the mouthpiece (with the reed), the neck, and the body. Twist the neck gently into the body, then slide the mouthpiece about halfway onto the neck cork.</p>
      <p><strong>The reed</strong> is what makes the sound. Wet it in your mouth for 30 seconds, then clamp it to the mouthpiece with the ligature — the flat side against the mouthpiece, tip aligned with the mouthpiece tip.</p>
      <p><strong>The keys:</strong> your left hand covers the top three main keys plus the octave key (your thumb, on the back). Your right hand covers the bottom three. That's exactly what the colored circles in every SaxHero tutorial show.</p>`
  },
  {
    id: 'l2', num: 2, title: 'Your first sound', sub: 'Embouchure and breathing', type: 'info', free: true,
    body: `<p><strong>Embouchure:</strong> top teeth rest on top of the mouthpiece, bottom lip rolls slightly over your bottom teeth as a cushion. Corners of your mouth seal around it — like saying "emm".</p>
      <p><strong>Breathe from your belly,</strong> take in air through the corners of your mouth, and blow a steady, warm stream — like fogging a mirror. Don't puff your cheeks.</p>
      <p>Try to hold one steady note for 4 slow counts. Wobbly is normal on day one. When you can hold it, you're ready for Lesson 3.</p>`
  },
  {
    id: 'l3', num: 3, title: 'First three notes: B, A, G', sub: 'Play along • left hand only', type: 'play', free: true,
    song: {
      id: 'lesson-bag', title: 'Lesson 3: B, A, G', artist: 'Long tones — left hand only',
      difficulty: 'Easy', tempo: 70, free: true,
      notes: [
        {n:'B4',d:4},{n:'R',d:2},{n:'B4',d:4},{n:'R',d:2},
        {n:'A4',d:4},{n:'R',d:2},{n:'A4',d:4},{n:'R',d:2},
        {n:'G4',d:4},{n:'R',d:2},{n:'G4',d:4},{n:'R',d:2},
        {n:'B4',d:2},{n:'A4',d:2},{n:'G4',d:4},
      ]
    }
  },
  {
    id: 'l4', num: 4, title: 'Your first song', sub: 'Play along • “Mary Had a Little Lamb”', type: 'play', free: true,
    song: {
      id: 'lesson-mary', title: 'Lesson 4: Mary Had a Little Lamb', artist: 'Uses B, A, G — left hand only',
      difficulty: 'Easy', tempo: 90, free: true,
      notes: [
        {n:'B4',d:1},{n:'A4',d:1},{n:'G4',d:1},{n:'A4',d:1},
        {n:'B4',d:1},{n:'B4',d:1},{n:'B4',d:2},
        {n:'A4',d:1},{n:'A4',d:1},{n:'A4',d:2},
        {n:'B4',d:1},{n:'B4',d:1},{n:'B4',d:2},
        {n:'B4',d:1},{n:'A4',d:1},{n:'G4',d:1},{n:'A4',d:1},
        {n:'B4',d:1},{n:'B4',d:1},{n:'B4',d:1},{n:'B4',d:1},
        {n:'A4',d:1},{n:'A4',d:1},{n:'B4',d:1},{n:'A4',d:1},{n:'G4',d:4},
      ]
    }
  },
  {
    id: 'l5', num: 5, title: 'Adding the right hand', sub: 'Play along • walking down to D', type: 'play', free: false,
    song: {
      id: 'lesson-rh', title: 'Lesson 5: Adding the right hand', artist: 'G down to D and back',
      difficulty: 'Easy', tempo: 72, free: false,
      notes: [
        {n:'G4',d:2},{n:'F4',d:2},{n:'E4',d:2},{n:'D4',d:4},{n:'R',d:2},
        {n:'D4',d:2},{n:'E4',d:2},{n:'F4',d:2},{n:'G4',d:4},{n:'R',d:2},
        {n:'G4',d:1},{n:'E4',d:1},{n:'F4',d:1},{n:'D4',d:1},{n:'G4',d:4},
      ]
    }
  },
];
