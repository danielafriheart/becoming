import { P, FL, qt } from "./data";

export async function buildPdf(A) {
  const { jsPDF } = await import("jspdf");
  var has = function (id) { return !!(A[id] && A[id].trim()) };
  var doc = new jsPDF({ unit: "mm", format: "a4" }), W = 210, M = 20, TW = W - 2 * M, y = 0;
  function cl(s) { return String(s).replace(/[^\t\n\r\x20-\x7E\xA0-\xFF\u2018\u2019\u201C\u201D\u2013\u2014\u2026\u2022]/g, "?") }
  function need(h) { if (y + h > 276) { doc.addPage(); y = M } }
  function tx(s, sz, st, c, lh) { doc.setFont("helvetica", st); doc.setFontSize(sz); doc.setTextColor(c[0], c[1], c[2]); doc.splitTextToSize(cl(s), TW).forEach(function (l) { need(lh); doc.text(l, M, y); y += lh }) }
  doc.setFillColor(10, 10, 10); doc.rect(0, 0, W, 58, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(170, 170, 170); doc.text("Becoming", M, 22);
  doc.setFontSize(24); doc.setTextColor(255, 255, 255); doc.text("The Personal Performance Audit", M, 36);
  doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.setTextColor(190, 190, 190); doc.text("Why did the 2026 version of me produce these results?", M, 46);
  doc.setFontSize(9); doc.text(new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }), M, 53);
  y = 74;
  tx("My three for Saturday", 14, "bold", [20, 20, 20], 7); y += 2;
  [["Biggest bottleneck", "7.2"], ["Identity I am letting die", "7.3"], ["Non-negotiable", "7.4"]].forEach(function (r) { tx(r[0], 9.5, "bold", [110, 110, 110], 5.5); tx(has(r[1]) ? A[r[1]].trim() : "(not answered)", 11, "normal", [20, 20, 20], 5.8); y += 3 });
  y += 2; tx(P[7].end, 11, "italic", [60, 60, 60], 6); y += 6;
  P.forEach(function (p, pi) {
    need(28); doc.setDrawColor(210, 210, 210); doc.line(M, y, W - M, y); y += 9;
    tx((pi + 1) + ".  " + p.n, 15, "bold", [10, 10, 10], 7.5); y += 2;
    var any = false;
    p.q.forEach(function (q, i) {
      if (q.f) { q.f.forEach(function (f, j) { var id = pi + "." + i + "." + j; if (has(id)) { any = true; need(16); tx(q.l + ": " + FL[j].toLowerCase(), 10, "bold", [90, 90, 90], 5.4); tx(A[id].trim(), 10.5, "normal", [25, 25, 25], 5.6); y += 3.5 } }) }
      else { var id2 = pi + "." + i; if (has(id2)) { any = true; need(16); tx(qt(q), 10, "bold", [90, 90, 90], 5.4); tx(A[id2].trim(), 10.5, "normal", [25, 25, 25], 5.6); y += 3.5 } }
    });
    if (!any) { tx("No answers in this section.", 10, "italic", [130, 130, 130], 5.6) }
    y += 6;
  });
  var n = doc.getNumberOfPages();
  for (var i = 1; i <= n; i++) { doc.setPage(i); doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(140, 140, 140); doc.text("Becoming  |  The Personal Performance Audit 2026  |  Page " + i + " of " + n, W / 2, 289, { align: "center" }) }
  return doc.output("blob");
}

export function plainText(A) {
  const has = (id) => !!(A[id] && A[id].trim());
  let t = "THE PERSONAL PERFORMANCE AUDIT 2026\n\n";
  P.forEach((p, pi) => {
    t += "== " + (pi + 1) + ". " + p.n + " ==\n";
    p.q.forEach((q, i) => {
      if (q.f) {
        q.f.forEach((f, j) => {
          const id = pi + "." + i + "." + j;
          if (has(id)) t += q.l + " (" + FL[j] + "): " + A[id].trim() + "\n";
        });
      } else {
        const id = pi + "." + i;
        if (has(id)) t += qt(q) + "\n" + A[id].trim() + "\n";
      }
    });
    t += "\n";
  });
  return t;
}
