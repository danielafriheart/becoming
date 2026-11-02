export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed." });
  }

  const fullName = typeof req.body?.fullName === "string" ? req.body.fullName.trim() : "";
  const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
  const country = typeof req.body?.country === "string" ? req.body.country.trim() : "";
  if (
    !fullName ||
    fullName.length > 120 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    !/^[A-Z]{2}$/.test(country)
  ) {
    return res.status(400).json({ ok: false, error: "Enter a valid name, email address, and country." });
  }

  const endpoint = process.env.GOOGLE_APPS_SCRIPT_URL;
  if (!endpoint) {
    return res.status(503).json({ ok: false, error: "Google Sheets is not configured." });
  }

  let url;
  try {
    url = new URL(endpoint);
  } catch {
    return res.status(500).json({ ok: false, error: "Google Sheets endpoint is invalid." });
  }
  if (url.protocol !== "https:" || url.hostname !== "script.google.com") {
    return res.status(500).json({ ok: false, error: "Google Sheets endpoint is invalid." });
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: new URLSearchParams({ fullName, email, country }),
      signal: AbortSignal.timeout(15000),
    });
    const responseText = await response.text();
    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      result = null;
    }
    if (!response.ok || !result?.ok) {
      const contentType = response.headers.get("content-type") || "unknown content type";
      const finalHost = response.url ? new URL(response.url).hostname : "";
      const isHtml =
        contentType.includes("text/html") ||
        /^\s*<!doctype html|^\s*<html/i.test(responseText);
      let error = result?.error;
      if (!error && isHtml) {
        error = "Google returned a sign-in or HTML page instead of the Apps Script response. Check that GOOGLE_APPS_SCRIPT_URL is the deployed /exec URL and that the web app is accessible to anyone.";
      } else if (!error) {
        error = `Apps Script returned an unexpected response (HTTP ${response.status}, ${contentType}${finalHost ? `, ${finalHost}` : ""}). Check the deployed web-app URL and Apps Script execution logs.`;
      }
      console.error("Google Sheets submission failed.", {
        status: response.status,
        contentType,
        finalHost,
        hasJsonResponse: Boolean(result),
        scriptError: result?.error,
      });
      return res.status(502).json({
        ok: false,
        error,
      });
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Google Sheets submission request failed.", error);
    return res.status(502).json({ ok: false, error: "Could not reach Google Sheets. Please try again." });
  }
}
