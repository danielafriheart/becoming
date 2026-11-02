const TARGET_SPREADSHEET_ID = "1vH6YwiL3TP7efWBy6tWOCuMzW-SwjCeWEQKt8LW8oAQ";
const TARGET_SHEET_ID = 0;

function doPost(e) {
  try {
    const fullName = String(e.parameter.fullName || "").trim();
    const email = String(e.parameter.email || "").trim();
    if (
      !fullName ||
      fullName.length > 120 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254
    ) {
      return json({ ok: false, error: "Invalid name or email." });
    }

    const spreadsheet = SpreadsheetApp.openById(TARGET_SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetById(TARGET_SHEET_ID);
    if (!sheet) throw new Error("The target spreadsheet tab was not found.");
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      if (sheet.getLastRow() === 0) sheet.appendRow(["Submitted at", "Full name", "Email"]);
      sheet.appendRow([new Date(), safeCell(fullName), safeCell(email)]);
    } finally {
      lock.releaseLock();
    }
    return json({ ok: true });
  } catch (error) {
    console.error(error);
    return json({ ok: false, error: "Could not save submission." });
  }
}

function safeCell(value) {
  return /^[\s]*[=+\-@]/.test(value) ? "'" + value : value;
}

function json(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
