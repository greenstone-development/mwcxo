/*
 * ============================================
 * Matt Walsh CXO — Contact Form Handler
 * Google Apps Script (Web App)
 * ============================================
 *
 * SETUP INSTRUCTIONS:
 * 
 * 1. Go to https://script.google.com
 * 2. Click "New Project"
 * 3. Delete any existing code and paste this entire file
 * 4. Click "Deploy" → "New Deployment"
 * 5. Choose type: "Web app"
 * 6. Set "Execute as": Me (your Google account)
 * 7. Set "Who has access": Anyone
 * 8. Click "Deploy" and authorize when prompted
 * 9. Copy the Web App URL — it will look like:
 *    https://script.google.com/macros/s/XXXXXXXXX/exec
 * 10. Paste that URL into contact.html where it says YOUR_APPS_SCRIPT_URL
 *
 * That's it. Every form submission will:
 *   - Send an email to matt.walsh@greenstone.co
 *   - BCC 44026395@bcc.na2.hubspot.com (HubSpot tracking)
 *   - Log to a Google Sheet (optional, see below)
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    var name    = data.name    || '(no name)';
    var email   = data.email   || '(no email)';
    var company = data.company || '(not provided)';
    var message = data.message || '(no message)';
    
    // ── Send Email ──────────────────────────────
    var subject = 'New inquiry from ' + name + (company !== '(not provided)' ? ' at ' + company : '');
    
    var htmlBody = '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">'
      + '<div style="background:#1A6B62;padding:24px 32px;border-radius:4px 4px 0 0;">'
      + '<h2 style="color:white;margin:0;font-size:18px;">New Contact Form Submission</h2>'
      + '</div>'
      + '<div style="background:#F2EDE3;padding:32px;border:1px solid #E8E0D2;border-top:none;border-radius:0 0 4px 4px;">'
      + '<table style="width:100%;border-collapse:collapse;">'
      + '<tr><td style="padding:8px 0;color:#7A8480;font-size:12px;text-transform:uppercase;letter-spacing:1px;vertical-align:top;width:100px;">Name</td>'
      + '<td style="padding:8px 0;color:#141C1A;font-size:15px;">' + name + '</td></tr>'
      + '<tr><td style="padding:8px 0;color:#7A8480;font-size:12px;text-transform:uppercase;letter-spacing:1px;vertical-align:top;">Email</td>'
      + '<td style="padding:8px 0;color:#141C1A;font-size:15px;"><a href="mailto:' + email + '" style="color:#1A6B62;">' + email + '</a></td></tr>'
      + '<tr><td style="padding:8px 0;color:#7A8480;font-size:12px;text-transform:uppercase;letter-spacing:1px;vertical-align:top;">Company</td>'
      + '<td style="padding:8px 0;color:#141C1A;font-size:15px;">' + company + '</td></tr>'
      + '<tr><td colspan="2" style="padding:16px 0 8px;border-top:1px solid #E8E0D2;color:#7A8480;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Message</td></tr>'
      + '<tr><td colspan="2" style="padding:0 0 8px;color:#3A4440;font-size:15px;line-height:1.7;">' + message.replace(/\n/g, '<br>') + '</td></tr>'
      + '</table>'
      + '<div style="margin-top:24px;padding-top:16px;border-top:1px solid #E8E0D2;">'
      + '<a href="mailto:' + email + '?subject=Re: Your inquiry" style="display:inline-block;background:#1A6B62;color:white;padding:10px 24px;border-radius:2px;text-decoration:none;font-size:13px;font-weight:bold;letter-spacing:0.5px;text-transform:uppercase;">Reply to ' + name.split(' ')[0] + '</a>'
      + '</div>'
      + '</div>'
      + '</div>';
    
    var plainBody = 'New Contact Form Submission\n\n'
      + 'Name: ' + name + '\n'
      + 'Email: ' + email + '\n'
      + 'Company: ' + company + '\n\n'
      + 'Message:\n' + message;
    
    GmailApp.sendEmail(
      'matt.walsh@greenstone.co',     // TO
      subject,
      plainBody,
      {
        htmlBody: htmlBody,
        bcc: '44026395@bcc.na2.hubspot.com',
        replyTo: email,
        name: 'Matt Walsh CXO — Contact Form'
      }
    );
    
    // ── Optional: Log to Google Sheet ───────────
    // Uncomment the lines below and replace SHEET_ID with your Google Sheet ID
    // to keep a running log of all submissions.
    //
    // var sheet = SpreadsheetApp.openById('1k_XIp5ARW4vtHkIcNyhT053CPGx3NHacJwmxNOTNqcI').getActiveSheet();
    // sheet.appendRow([new Date(), name, email, company, message]);
    
    // ── Return success ─────────────────────────
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Required for CORS preflight from browser fetch
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Contact form handler is running.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
