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
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.ok) {
      console.error("Google Sheets submission failed.", response.status, result?.error);
      return res.status(502).json({ ok: false, error: "Google Sheets could not save your details." });
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Google Sheets submission request failed.", error);
    return res.status(502).json({ ok: false, error: "Could not reach Google Sheets. Please try again." });
  }
}
