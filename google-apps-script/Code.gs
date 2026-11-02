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
    if (!sheet) throw new Error("TARGET_TAB_NOT_FOUND");
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const requiredHeaders = ["Submitted at", "Full name", "Email", "Country"];
      const lastColumn = sheet.getLastColumn();
      const headers = lastColumn
        ? sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0]
        : [];
      const headerColumns = requiredHeaders.map((header) =>
        headers.findIndex((value) => String(value).trim().toLowerCase() === header.toLowerCase()) + 1
      );
      let nextColumn = lastColumn + 1;
      headerColumns.forEach((column, index) => {
        if (column) return;
        headerColumns[index] = nextColumn;
        sheet.getRange(1, nextColumn).setValue(requiredHeaders[index]);
        nextColumn += 1;
      });

      const values = Array(Math.max(lastColumn, nextColumn - 1)).fill("");
      [
        new Date(),
        safeCell(fullName),
        safeCell(email),
        country,
      ].forEach((value, index) => {
        values[headerColumns[index] - 1] = value;
      });
      sheet.appendRow(values);
    } finally {
      lock.releaseLock();
    }
    return json({ ok: true });
  } catch (error) {
    console.error(error);
    const message = error && error.message;
    if (message === "TARGET_TAB_NOT_FOUND") {
      return json({ ok: false, error: "The target spreadsheet tab was not found. Check that the tab still has gid=0." });
    }
    if (/permission|authorization|access/i.test(String(message))) {
      return json({
        ok: false,
        error: "Apps Script cannot access the spreadsheet. Check that the web app executes as your account and that your account can edit the sheet.",
      });
    }
    return json({
      ok: false,
      error: "Apps Script couldn't write to the spreadsheet. Check the latest Apps Script execution for details.",
    });
  }
}

function safeCell(value) {
  return /^[\s]*[=+\-@]/.test(value) ? "'" + value : value;
}

function json(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
