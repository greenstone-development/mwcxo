// ===== WDHL Members — App Config =====
//
// Edit this file to point the app at your published Google Sheet and to map
// the columns. The right-hand strings below must match the EXACT column
// header text in your sheet (case sensitive).
//
// To re-publish: in Google Sheets, File -> Share -> Publish to web -> CSV.

const APP_CONFIG = {
  // Published CSV URL from Google Sheets
  csvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ5zgxuVbvHc7xJSyOkQyGlNES3M8uftGWAp1vv9ZbSYlmrSyrQlxGXNnjPlXTHII1pZ2xb73uSvPIT/pub?output=csv",

  // Map internal field -> column header in your sheet.
  // The right-hand string must match the exact header text in the sheet.
  //
  // NOTE: the sheet reuses the same header text for the Winter block (H-N)
  // and the Summer block (P-V). When a header appears more than once, the
  // app uses the FIRST one, so the names below always resolve to the Winter
  // columns. The Summer block is addressed by column letter in
  // summerColumns, below.
  columns: {
    name:                "Name",
    rating:              "Rating",
    positions:           "Preferred Position",            // accepts "F", "D", "G", "F/D", "Forward", etc.
    bio:                 "Bio",
    teamLastSeason:      "Previous Team",
    isSubstitute:        "Sub",                           // "yes"/"no" → controls the SUB badge on cards
    headshot:            "Picture",                       // filename only, e.g. "cavallaro.png"
    gamesPlayed:         "GP",
    goals:               "Goals",
    assists:             "Assists",
    pointsPerGame:       "P/G",
    // Goalie-specific stats
    goalsAgainst:        "GA",
    goalsAgainstAvg:     "GAA",
    savePercentage:      "SV%",
    // "yes"/"no" → is this player signed up for Summer 2026?
    inSummer2026:        "Summer"
  },

  // ----- Summer 26 stats -----
  // Addressed by COLUMN LETTER (not header text) because the sheet repeats
  // the same header names for the Winter and Summer blocks.
  //   P = GP | Q = P/G | R = Goals | S = Assists | T = GA | U = GAA | V = SV%
  //   W = summer team (STeam)
  // A player gets a "Summer 26 stats" row only when the GP column below
  // holds at least one game played.
  summerColumns: {
    gamesPlayed:      "P",
    pointsPerGame:    "Q",
    goals:            "R",
    assists:          "S",
    // Goalie-specific stats
    goalsAgainst:     "T",
    goalsAgainstAvg:  "U",
    savePercentage:   "V",
    team:             "W"
  },

  // ----- Businesses tab -----
  // Published CSV URL for the business_list tab. If your sheet was published
  // with "Entire Document" selected, you can target any tab by appending
  // &gid=<tab id>&single=true to the pub URL. Otherwise publish the tab
  // separately and paste its CSV URL here.
  businessCsvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ5zgxuVbvHc7xJSyOkQyGlNES3M8uftGWAp1vv9ZbSYlmrSyrQlxGXNnjPlXTHII1pZ2xb73uSvPIT/pub?gid=681917990&single=true&output=csv",

  // Map internal business field -> column header in the business_list tab.
  // Adjust these to match your actual column headers.
  businessColumns: {
    name:             "Name",
    url:              "URL",
    logo:             "Logo Image",       // filename, e.g. "logo_cdi.png" (relative to headshots/)
    overview:         "Description",
    category:         "Category",
    contactName:      "Contact Name",
    contactEmail:     "Contact Email",
    contactHeadshot:  "Headshot Image"    // filename, e.g. "maciolek.png" (relative to headshots/)
    // displayUrl: not in the sheet — derived from URL (strips https:// and www.)
  }
};
