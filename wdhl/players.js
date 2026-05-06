// Edit this file to add or update players.
// Each player needs: id, name, age, position, rating, teamLastSeason, experience, headshot
//
// FIELD NOTES:
//   id              -> unique slug, lowercase, no spaces (used internally; keep stable)
//   position        -> exactly "Forward", "Defense", or "Goalie"
//   rating          -> integer 1-7 (7 = strongest)
//   headshot        -> path to image file, e.g. "headshots/john-smith.jpg"
//                       (leave as empty string "" to show initials placeholder)
//
// To add a player: copy one of the entries below, paste at the bottom (before
// the closing ]; ), update the values, and save the file. Refresh the browser.

const PLAYERS = [
  {
    id: "John_Smith",
    name: "John Smith",
    age: 45,
    position: "Forward",
    rating: 5,
    teamLastSeason: "Ice Breakers",
    experience: "Played D1 college hockey at UMass, then 15+ years of beer league. Strong skater with good hands. Comfortable at center or wing.",
    headshot: "headshots/CDI_1.png"
  },
  {
    id: "CDI_2",
    name: "Sarah Jones",
    age: 42,
    position: "Goalie",
    rating: 6,
    teamLastSeason: "Pucks of Hazzard",
    experience: "Started goaltending at age 12, played in college. Coming off a strong season with .912 save percentage. Available most weeknights.",
    headshot: "headshots/sarah-jones.jpg"
  },
  {
    id: "CDI_3",
    name: "Mike Bauer",
    age: 48,
    position: "Defense",
    rating: 4,
    teamLastSeason: "Slap Happy",
    experience: "Reliable stay-at-home defender. 20 years of adult league experience. Good gap control, solid shot from the point. Prefers right side.",
    headshot: "headshots/mike-bauer.jpg"
  },
  {
    id: "CDI_4",
    name: "Anna Cheung",
    age: 41,
    position: "Forward",
    rating: 7,
    teamLastSeason: "Top Shelf",
    experience: "Former NCAA D1 player at Boston College. Captained team last 2 seasons. Skilled offensive forward, plays both ways.",
    headshot: "headshots/anna-cheung.jpg"
  }
];
