export async function submitLead({ fullName, email }) {
  const response = await fetch("/api/submit-lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName, email }),
  });
  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.ok) {
    throw new Error(result?.error || "Could not submit details.");
  }
}
