const TARGET_SPREADSHEET_ID = "1vH6YwiL3TP7efWBy6tWOCuMzW-SwjCeWEQKt8LW8oAQ";
const TARGET_SHEET_ID = 0;

function doPost(e) {
  try {
    const fullName = String(e.parameter.fullName || "").trim();
    const email = String(e.parameter.email || "").trim();
    const country = String(e.parameter.country || "").trim();
    if (
      !fullName ||
      fullName.length > 120 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254 ||
      !/^[A-Z]{2}$/.test(country)
    ) {
      return json({ ok: false, error: "Invalid name or email." });
    }

    const spreadsheet = SpreadsheetApp.openById(TARGET_SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetById(TARGET_SHEET_ID);
    if (!sheet) throw new Error("The target spreadsheet tab was not found.");
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(["Submitted at", "Full name", "Email", "Country"]);
      } else {
        const headers = sheet.getRange(1, 1, 1, 4).getValues()[0];
        if (
          headers[0] !== "Submitted at" ||
          headers[1] !== "Full name" ||
          headers[2] !== "Email"
        ) {
          throw new Error("The target sheet headers do not match the expected submission columns.");
        }
        if (!headers[3]) sheet.getRange(1, 4).setValue("Country");
        else if (headers[3] !== "Country") throw new Error("The target sheet country column is occupied.");
      }
      sheet.appendRow([new Date(), safeCell(fullName), safeCell(email), country]);
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
