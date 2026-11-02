import { useState, useEffect, useRef } from "react";
import { P, BD, LV, FL, L, TF, MAX, cnt, has, qt, ans, stat, lvi } from "./data";
import { buildPdf, plainText } from "./pdf";
import { Analytics } from "@vercel/analytics/react";
import { submitLead } from "./lead";
import { countries } from "./countries";

const K = "ppa2026";

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(K) || "{}");
    return { a: d.a || {}, n: Math.min(d.n || 0, L.length - 1) };
  } catch {
    return { a: {}, n: 0 };
  }
}

function burst() {
  const c = ["#ffffff", "#bdbdbd", "#7a7a7a", "#e5e5e5"];
  for (let i = 0; i < 22; i++) {
    const e = document.createElement("span");
    e.className = "cf";
    e.style.left = Math.random() * 100 + "%";
    e.style.background = c[i % 4];
    e.style.animationDelay = Math.random() * 0.4 + "s";
    document.body.appendChild(e);
    setTimeout(() => e.remove(), 2300);
  }
}

function Hud({ A, step, onJump }) {
  const s = stat(A);
  const i = lvi(s.x);
  const nx = LV[i + 1];
  const C = 2 * Math.PI * 22;
  const pc = Math.min(1, s.x / MAX);
  const cp = L[step].pi;
  return (
    <div id="hud" className="glass">
      <div className="hrow" style={{ position: "relative", zIndex: 1 }}>
        <svg width="56" height="56" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r="22" fill="none" stroke="#262626" strokeWidth="5" />
          <circle
            cx="28" cy="28" r="22" fill="none" stroke="#e5e5e5" strokeWidth="5"
            strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pc)}
            transform="rotate(-90 28 28)"
          />
          <text x="28" y="33" textAnchor="middle" fontSize="15" fontWeight="700" fill="#e5e5e5">
            {i + 1}
          </text>
        </svg>
        <div className="hm">
          <div className="rk">Rank {i + 1} of {LV.length}</div>
          <div className="rn">{LV[i][1]}</div>
        </div>
        <div className="xp">
          {s.x} XP
          <small>{nx ? `${nx[0] - s.x} XP to ${nx[1]}` : "Top rank reached"}</small>
        </div>
      </div>
      <div className="dots" style={{ position: "relative", zIndex: 1 }}>
        {P.map((p, j) => (
          <button
            key={j}
            className={"dot" + (s.b.includes(j) ? " on" : "") + (cp === j ? " cur" : "")}
            title={BD[j]}
            onClick={() => onJump(j)}
          >
            {j + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

function Intro({ onStart }) {
  return (
    <>
      <div className="hero">
        <div className="eyebrow">The Becoming</div>
        <h1>The Personal Performance Audit</h1>
        <p className="sub2">Why did the 2026 version of me produce these results?</p>
      </div>
      <div className="stats">
        <div className="stat"><div className="big">8</div><span>parts</span></div>
        <div className="stat"><div className="big">{TF}</div><span>questions</span></div>
        <div className="stat"><div className="big">24h</div><span>to finish</span></div>
      </div>
      <div className="card">
        <p style={{ marginTop: 0 }}>
          This isn’t about judging yourself. It’s about examining the evidence, finding the real
          bottlenecks, and designing a better operating system for the months ahead. You’ll answer
          one question at a time.
        </p>
        <ol>
          <li>Facts first, feelings second, and be honest</li>
          <li>About 50 minutes per sitting, two sittings</li>
          <li>Bring your top 3 findings to Saturday’s call</li>
        </ol>
      </div>
      <div className="card">
        <b>Level up as you go.</b> Every answer earns 10 XP. Finish a part to unlock its badge and
        a 50 XP bonus. Climb from Observer to Author of My Story.
      </div>
      <div className="nav"><span /><button onClick={onStart}>Start the audit</button></div>
    </>
  );
}

function PartScreen({ s, onBack, onNext }) {
  const p = P[s.pi];
  const pv = P[s.pi - 1];
  return (
    <div className="stage glass">
      <div className="ph">
        <div className="pn">0{s.pi + 1}</div>
        <div><h2>{p.n}</h2></div>
      </div>
      <span className="pill">Sitting {p.s}</span>
      <span className="pill">{p.m}</span>
      <span className="pill">Badge: {BD[s.pi]}</span>
      <p className="lead">{p.d}</p>
      {pv && pv.brk && <div className="break">{pv.brk}</div>}
      <div className="nav">
        <button className="ghost" onClick={onBack}>Back</button>
        <button onClick={onNext}>Begin</button>
      </div>
    </div>
  );
}

function QuestionScreen({ s, A, onChange, onBack, onNext, label }) {
  const p = P[s.pi];
  const q = p.q[s.qi];
  let title, sub = "";
  let chip = null;
  if (q.f) {
    const ar = q.l.toLowerCase();
    title = [
      `What improved in your ${ar} this year?`,
      `What declined in your ${ar} this year?`,
      `What stayed the same in your ${ar}?`,
    ][s.fi];
    sub = "Just facts. No explanations yet.";
    chip = (
      <div className="area">
        <span className="ar">{q.l} · {s.qi + 1} of {p.q.length}</span>
        <span className="steps">
          {["↑ Improved", "↓ Declined", "→ Same"].map((x, j) => (
            <span key={j} className={j === s.fi ? "on" : j < s.fi ? "dn" : ""}>{x}</span>
          ))}
        </span>
      </div>
    );
  } else {
    title = qt(q);
    sub = q.s || (p.cs ? "Complete the statement. Write systems, not goals." : "");
  }
  return (
    <div className="stage glass">
      <div className="qp"><i style={{ width: Math.round(((s.n - 1) / TF) * 100) + "%" }} /></div>
      <div className="qc2"><span>{p.n}</span><span>Question {s.n} of {TF}</span></div>
      {chip}
      <div className="qt">{title}</div>
      {sub ? <p className="qs">{sub}</p> : <div style={{ height: 12 }} />}
      <textarea
        rows={6}
        placeholder="Be honest. Nobody sees this."
        value={A[s.id] || ""}
        onChange={(e) => onChange(s.id, e.target.value)}
        autoFocus={window.innerWidth > 700}
      />
      <div className="nav">
        <button className="ghost" onClick={onBack}>Back</button>
        <button onClick={onNext}>{label}</button>
      </div>
    </div>
  );
}

function Review({ A }) {
  return (
    <>
      {P.map((p, pi) => {
        const items = [];
        p.q.forEach((q, i) => {
          if (q.f) {
            q.f.forEach((f, j) => {
              const id = `${pi}.${i}.${j}`;
              if (has(A, id))
                items.push(
                  <div className="ra" key={id}>
                    <b>{q.l} · {FL[j]}</b>
                    <p>{A[id].trim()}</p>
                  </div>
                );
            });
          } else {
            const id = `${pi}.${i}`;
            if (has(A, id))
              items.push(
                <div className="ra" key={id}>
                  <b>{qt(q)}</b>
                  <p>{A[id].trim()}</p>
                </div>
              );
          }
        });
        return (
          <details className="card rv" key={pi}>
            <summary>
              {pi + 1}. {p.n} <span>{ans(A, pi)} / {cnt[pi]}</span>
            </summary>
            {items.length ? items : (
              <p className="lead" style={{ padding: "12px 18px 0" }}>No answers in this section.</p>
            )}
            <div style={{ height: 14 }} />
          </details>
        );
      })}
    </>
  );
}

function DoneScreen({ A, onBack, onClear }) {
  const [msg, setMsg] = useState(null);
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadError, setLeadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const st = stat(A);
  const g = (i) => (has(A, "7." + i) ? A["7." + i] : "(not answered)");

  const download = async () => {
    try {
      const blob = await buildPdf(A);
      const u = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = u;
      a.download = "Personal-Performance-Audit-2026.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(u), 5000);
      setMsg({ t: "Your PDF is downloading. Keep it somewhere safe." });
    } catch {
      setMsg({ t: "Couldn’t create the PDF. Use Copy text instead." });
    }
  };

  const submitAndDownload = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSubmitting(true);
    setLeadError("");
    try {
      await submitLead({
        fullName: String(formData.get("fullName") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        country: String(formData.get("country") || ""),
      });
      setLeadOpen(false);
      await download();
    } catch (error) {
      setLeadError(error instanceof Error ? error.message : "We couldn’t submit your details. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const copy = async () => {
    const t = plainText(A);
    try {
      await navigator.clipboard.writeText(t);
      setMsg({ t: "Copied. Paste it into your notes app." });
    } catch {
      setMsg({ t: "Select all and copy:", ta: t });
    }
  };

  return (
    <>
      <div className="hero">
        <div className="eyebrow">Audit complete</div>
        <h1>{LV[lvi(st.x)][1]}</h1>
        <p className="sub2">{st.x} XP earned</p>
        <div className="badges">
          {st.b.length ? st.b.map((j) => <span key={j}>{BD[j]}</span>) : <span>No badges yet</span>}
        </div>
      </div>
      <h2 style={{ marginTop: 30 }}>Your three for Saturday</h2>
      <div className="card sat">
        <b>Biggest bottleneck</b><p>{g(2)}</p>
        <b>Identity I’m letting die</b><p>{g(3)}</p>
        <b>Non-negotiable</b><p style={{ marginBottom: 0 }}>{g(4)}</p>
      </div>
      <div className="hl">{P[7].end}</div>
      <h2 style={{ marginTop: 34 }}>Your answers</h2>
      <Review A={A} />
      <p className="lead" style={{ marginTop: 20 }}>
        Download your audit as a PDF and keep it somewhere safe. This browser is the only place
        your answers are stored.
      </p>
      <div className="nav">
        <button className="ghost" onClick={onBack}>Back</button>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button className="ghost" onClick={copy}>Copy text</button>
          <button onClick={() => { setLeadError(""); setLeadOpen(true); }}>Download Audit</button>
        </div>
      </div>
      {leadOpen && (
        <div className="lead-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !submitting) setLeadOpen(false);
        }}>
          <section
            className="lead-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-title"
            aria-describedby="lead-description"
            onKeyDown={(event) => {
              if (event.key === "Escape" && !submitting) setLeadOpen(false);
            }}
          >
            <button
              className="lead-close ghost"
              type="button"
              aria-label="Close"
              onClick={() => setLeadOpen(false)}
              disabled={submitting}
            >
              ×
            </button>
            <div className="eyebrow">One last step</div>
            <h2 id="lead-title">Get your audit</h2>
            <p className="lead" id="lead-description">
              Enter your details to download. Your name and email will be sent to our Google Sheet;
              your audit answers are not included.
            </p>
            <form className="lead-form" onSubmit={submitAndDownload}>
              <label htmlFor="lead-full-name">Full name</label>
              <input
                id="lead-full-name"
                name="fullName"
                type="text"
                autoComplete="name"
                maxLength={120}
                required
                autoFocus
              />
              <label htmlFor="lead-email">Email address</label>
              <input
                id="lead-email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={254}
                required
              />
              <label htmlFor="lead-country">Country</label>
              <select id="lead-country" name="country" defaultValue="" required>
                <option value="" disabled>Select your country</option>
                {countries.map(({ code, name, flag }) => (
                  <option key={code} value={code}>
                    {flag} {code} — {name}
                  </option>
                ))}
              </select>
              {leadError && <p className="lead-error" role="alert">{leadError}</p>}
              <div className="lead-actions">
                <button className="ghost" type="button" onClick={() => setLeadOpen(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit & download"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
      {msg && (
        <>
          <div className="card" style={{ textAlign: "center" }}>{msg.t}</div>
          {msg.ta && <textarea rows={10} readOnly value={msg.ta} onFocus={(e) => e.target.select()} />}
        </>
      )}
      <div className="nav">
        <span />
        <button className="danger" onClick={onClear}>Clear all my answers</button>
      </div>
    </>
  );
}

export default function App() {
  const [A, setA] = useState(() => load().a);
  const [step, setStep] = useState(() => load().n);
  const [toast, setToast] = useState("");
  const tt = useRef();

  useEffect(() => {
    try {
      localStorage.setItem(K, JSON.stringify({ a: A, n: step }));
    } catch {}
  }, [A, step]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const go = (d) => setStep((s) => Math.min(Math.max(s + d, 0), L.length - 1));

  useEffect(() => {
    const key = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") go(1);
    };
    const move = (e) => {
      const c = e.target.closest && e.target.closest(".glass");
      if (c) {
        const r = c.getBoundingClientRect();
        c.style.setProperty("--mx", e.clientX - r.left + "px");
        c.style.setProperty("--my", e.clientY - r.top + "px");
      }
    };
    document.addEventListener("keydown", key);
    document.addEventListener("pointermove", move);
    return () => {
      document.removeEventListener("keydown", key);
      document.removeEventListener("pointermove", move);
    };
  }, []);

  const showToast = (m) => {
    setToast(m);
    clearTimeout(tt.current);
    tt.current = setTimeout(() => setToast(""), 2800);
  };

  const onChange = (id, val) => {
    const nA = { ...A, [id]: val };
    const b = stat(A);
    const n = stat(nA);
    if (n.b.length > b.b.length) {
      const nw = n.b.filter((j) => !b.b.includes(j))[0];
      showToast(`Badge unlocked: ${BD[nw]} (+50 XP)`);
      burst();
    } else if (lvi(n.x) > lvi(b.x)) {
      showToast(`Rank up: ${LV[lvi(n.x)][1]}`);
    }
    setA(nA);
  };

  const jump = (j) => setStep(L.findIndex((x) => x.k === "part" && x.pi === j));

  const clear = () => {
    if (window.confirm("Clear everything you wrote? This cannot be undone.")) {
      setA({});
      setStep(0);
    }
  };

  const s = L[step];
  const label = s.k === "q" ? (L[step + 1].k === "done" ? "Finish" : has(A, s.id) ? "Continue" : "Skip") : "";

  let screen;
  if (s.k === "intro") screen = <Intro key={step} onStart={() => go(1)} />;
  else if (s.k === "part") screen = <PartScreen key={step} s={s} onBack={() => go(-1)} onNext={() => go(1)} />;
  else if (s.k === "q")
    screen = (
      <QuestionScreen key={step} s={s} A={A} onChange={onChange} onBack={() => go(-1)} onNext={() => go(1)} label={label} />
    );
  else screen = <DoneScreen key={step} A={A} onBack={() => go(-1)} onClear={clear} />;

  return (
    <>
      <div className="wrap">
        <header className="top">
          <img src="/logo.svg" alt="" />
          <span>Becoming</span>
        </header>
        <Hud A={A} step={step} onJump={jump} />
        <div id="app">{screen}</div>
        <div className="notes">
          <p><b>Private:</b> nobody sees your answers. They stay in this browser.</p>
          <p><b>Write it by hand too:</b> put your answers in your physical journal as well.</p>
        </div>
      </div>
      <footer className="ft" aria-hidden="true">Becoming</footer>
      <div id="toast" className={toast ? "on" : ""}>{toast}</div>
      <Analytics />
    </>
  );
}
