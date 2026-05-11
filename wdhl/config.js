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
    name:                "Name",
    rating:              "Rating",
    positions:           "Preferred Position",            // accepts "F", "D", "G", "F/D", "Forward", etc.
    bio:                 "Bio",
    teamLastSeason:      "Previous Team",
    headshot:            "Picture",                       // filename only, e.g. "cavallaro.png"
    gamesPlayed:         "GP",
    goals:               "Goals",
    assists:             "Assists",
    pointsPerGame:       "P/G"
  },

  // ----- Businesses tab (used by index2.html) -----
  // Published CSV URL for the business_list tab. If your sheet was published
  // with "Entire Document" selected, you can target any tab by appending
  // &gid=<tab id>&single=true to the pub URL. Otherwise publish the tab
  // separately and paste its CSV URL here.
  businessCsvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ5zgxuVbvHc7xJSyOkQyGlNES3M8uftGWAp1vv9ZbSYlmrSyrQlxGXNnjPlXTHII1pZ2xb73uSvPIT/pub?gid=681917990&single=true&output=csv",

  // Map internal business field -> column header in the business_list tab.
  // Adjust these to match your actual column headers.
  businessColumns: {
    name:         "Name",
    url:          "URL",
    logo:         "Image Name",    // filename, e.g. "logo_cdi.png" (relative to headshots/)
    overview:     "Description",
    category:     "Category",
    contactName:  "Contact Name",
    contactEmail: "Contact Email"
    // displayUrl: not in the sheet — derived from URL (strips https:// and www.)
  }
};
