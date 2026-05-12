// FALLBACK DATA — used only if the live CSV from your Google Sheet can't be
// loaded (e.g., when you open index.html directly without hosting it).
// The real source of truth is the published sheet referenced in config.js.
//
// FIELD NOTES:
//   id              -> unique slug, lowercase, no spaces (keep stable)
//   positions       -> array, one or more of "Forward", "Defense", "Goalie"
//   rating          -> integer 1-7 (7 = strongest)
//   teamLastSeason  -> string
//   bio             -> free-text bio shown in the detail overlay
//   gamesPlayed,
//   goals,
//   assists,
//   pointsPerGame   -> Winter 25/26 stats (strings or numbers)
//   headshot        -> path to image file, e.g. "headshots/cavallaro.png"

const PLAYERS = [
  {
    id: "joseph-cavallaro",
    name: "Joseph Cavallaro",
    positions: ["Forward"],
    rating: 7,
    teamLastSeason: "Bison",
    bio: "",
    headshot: "headshots/cavallaro.png"
  },
  {
    id: "joel-vlasin",
    name: "Joel Vlasin",
    positions: ["Forward", "Defense"],
    rating: 7,
    teamLastSeason: "Bison",
    bio: "",
    headshot: "headshots/vlasin.png"
  },
  {
    id: "lance-shimomura",
    name: "Lance Shimomura",
    positions: ["Defense"],
    rating: 7,
    teamLastSeason: "Bison",
    bio: "",
    headshot: "headshots/shimomura.png"
  },
  {
    id: "todd-vanderstelt",
    name: "Todd VanderStelt",
    positions: ["Forward"],
    rating: 7,
    teamLastSeason: "Bison",
    bio: "",
    headshot: "headshots/vanderStelt.png"
  },
  {
    id: "paul-moreau",
    name: "Paul Moreau",
    positions: ["Forward", "Defense"],
    rating: 6,
    teamLastSeason: "Bison",
    bio: "",
    headshot: "headshots/moreau.png"
  }
];
