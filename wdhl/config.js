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
  // If your sheet has a single "Name" column instead of First/Last, set
  //    name: "Name"
  // and remove or leave firstName/lastName empty.
  columns: {
    firstName:           "First",
    lastName:            "Last",
    rating:              "Rating",
    positions:           "Preferred Position",            // accepts "F", "D", "G", "F/D", "Forward", etc.
    previousExperience:  "Previous playing level, experience",
    teamLastSeason:      "Last Season Team",              // <- adjust if the header reads differently
    headshot:            "Picture",                       // filename only, e.g. "cavallaro.png"
    gamesPlayed:         "GP",
    goals:               "Goals",
    assists:             "Assists",
    pointsPerGame:       "Pt/G"
  }
};
