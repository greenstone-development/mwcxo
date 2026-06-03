/**
 * WDHL Business Submission handler — Google Apps Script
 *
 * SETUP STEPS:
 *  1. Open your spreadsheet: https://docs.google.com/spreadsheets/d/1CdKOf3ADGkc3cy4QR52BL7N0i67mgOR5OM9V8iqKaG8/edit
 *  2. Top menu: Extensions → Apps Script. A new tab opens.
 *  3. Delete whatever's in Code.gs. Paste this ENTIRE file in.
 *  4. (Optional but recommended) Create a folder in your Google Drive
 *     called "WDHL submissions" (or whatever you like). Open the folder
 *     and look at its URL: …/folders/THIS_LONG_ID. Copy that ID and paste
 *     it into DRIVE_FOLDER_ID below. Without this, uploaded images go
 *     to the root of your My Drive.
 *  5. Click the disk icon to save.
 *  6. Click Deploy (top right) → New deployment.
 *       • Description: "WDHL business form" (anything)
 *       • Type: Web app  (use the gear icon if Type isn't visible)
 *       • Execute as: Me
 *       • Who has access: Anyone
 *       Click Deploy. Approve any permission prompts (Drive + Sheets).
 *  7. Copy the "Web app URL" it gives you.
 *  8. Open index.html, find `const GOOGLE_APPS_SCRIPT_URL = '';` near
 *     the bottom of the <script>, paste the URL between the quotes.
 *  9. Make sure the spreadsheet has a tab named exactly "new additions"
 *     with a header row in row 1. Suggested headers:
 *
 *        Timestamp | Company Name | Company Overview | Company Website |
 *        Logo URL | Contact Name | Contact Email | Headshot URL
 *
 * That's it. New submissions append as rows.
 *
 * IF YOU CHANGE THIS SCRIPT LATER: in Apps Script, Deploy → Manage
 * deployments → pencil-edit your deployment → Version: New version →
 * Deploy. (Editing Code.gs doesn't take effect on the live URL until
 * you deploy a new version.)
 */

const SHEET_ID                = '1CdKOf3ADGkc3cy4QR52BL7N0i67mgOR5OM9V8iqKaG8';
const SHEET_NAME              = 'new additions';
const CORRECTIONS_SHEET_NAME  = 'corrections';
const DRIVE_FOLDER_ID         = '1R1AM0ttaIziMx_vTovpyLSZkKIqmxD7a';
const NOTIFY_EMAIL            = 'matt.walsh@greenstone.co';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.type === 'correction') return handleCorrection(data);
    return handleBusiness(data);
  } catch (err) {
    return jsonOut({ success: false, error: String(err) });
  }
}

function handleBusiness(data) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Tab "' + SHEET_NAME + '" not found in the spreadsheet.');

  const logoUrl     = data.company_logo     ? saveImage(data.company_logo,     (data.company_name || 'company') + '_logo')         : '';
  const headshotUrl = data.contact_headshot ? saveImage(data.contact_headshot, (data.contact_name || 'contact') + '_headshot')     : '';

  sheet.appendRow([
    new Date(),
    data.company_name     || '',
    data.company_overview || '',
    data.company_website  || '',
    logoUrl,
    data.contact_name     || '',
    data.contact_email    || '',
    headshotUrl
  ]);

  sendBusinessNotification(data);
  return jsonOut({ success: true });
}

function handleCorrection(data) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(CORRECTIONS_SHEET_NAME);
  if (!sheet) throw new Error('Tab "' + CORRECTIONS_SHEET_NAME + '" not found in the spreadsheet.');

  const imageUrl = data.image ? saveImage(data.image, 'correction_' + (data.name || 'submission')) : '';

  // Columns: A Timestamp | B Name | C Email | D Image URL | E Feedback
  sheet.appendRow([
    new Date(),
    data.name     || '',
    data.email    || '',
    imageUrl,
    data.feedback || ''
  ]);

  sendCorrectionNotification(data, imageUrl);
  return jsonOut({ success: true });
}

function sendBusinessNotification(data) {
  if (!NOTIFY_EMAIL) return;
  const subject = 'New WDHL business submission: ' + (data.company_name || '(no name)');
  const lines = [
    'A new business has been submitted via the WDHL Business Showcase form.',
    '',
    'Company Name:    ' + (data.company_name    || ''),
    'Company Website: ' + (data.company_website || ''),
    '',
    'Company Overview:',
    (data.company_overview || ''),
    '',
    'Contact Name:  ' + (data.contact_name  || ''),
    'Contact Email: ' + (data.contact_email || ''),
    '',
    'View all submissions: https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/edit'
  ];
  try {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: subject,
      body: lines.join('\n'),
      replyTo: data.contact_email || undefined
    });
  } catch (err) {
    Logger.log('Notification email failed: ' + err);
  }
}

function sendCorrectionNotification(data, imageUrl) {
  if (!NOTIFY_EMAIL) return;
  const subject = 'WDHL correction/feedback from ' + (data.name || '(no name)');
  const lines = [
    'A new correction/feedback has been submitted via the WDHL Players page.',
    '',
    'Name:  ' + (data.name  || ''),
    'Email: ' + (data.email || ''),
    '',
    'Feedback:',
    (data.feedback || ''),
    ''
  ];
  if (imageUrl) lines.push('Image: ' + imageUrl, '');
  lines.push('View all corrections: https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/edit#gid=2097809801');
  try {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: subject,
      body: lines.join('\n'),
      replyTo: data.email || undefined
    });
  } catch (err) {
    Logger.log('Notification email failed: ' + err);
  }
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Accepts a data: URL (e.g. "data:image/png;base64,iVBORw…"), saves to
 *  Drive (in DRIVE_FOLDER_ID if set, otherwise root), makes it shareable,
 *  returns its viewer URL. */
function saveImage(dataUrl, baseName) {
  const m = String(dataUrl).match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!m) return '';
  const mimeType = m[1];
  const ext      = mimeType.split('/')[1].replace('jpeg', 'jpg');
  const safe     = String(baseName).replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '').toLowerCase() || 'upload';
  const blob     = Utilities.newBlob(Utilities.base64Decode(m[2]), mimeType, safe + '.' + ext);

  const file = DRIVE_FOLDER_ID
    ? DriveApp.getFolderById(DRIVE_FOLDER_ID).createFile(blob)
    : DriveApp.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

/** Optional: lets you sanity-check the deployment by visiting the URL
 *  in a browser. Should return a small JSON status. */
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, message: 'WDHL submission handler is live.' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/** RUN THIS ONCE from the Apps Script editor to grant the script the
 *  Drive + Sheets permissions it needs.
 *
 *  In the Apps Script editor: select "authorize" from the function
 *  dropdown next to the Run button, click Run, and accept the prompts.
 *  After this completes, the deployed web app will be able to write to
 *  Drive and the spreadsheet. */
function authorize() {
  SpreadsheetApp.openById(SHEET_ID).getName();
  MailApp.getRemainingDailyQuota();
  if (DRIVE_FOLDER_ID) {
    try { DriveApp.getFolderById(DRIVE_FOLDER_ID).getName(); } catch (e) {}
  }
  Logger.log('Permissions granted. You can now use the deployed web app.');
}
