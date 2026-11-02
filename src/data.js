export const P=[
{n:"The Evidence",m:"15 min",s:1,d:"Don’t explain anything yet. Just collect facts. If a stranger examined your life from January until today, what evidence would they find? We’ll go through each area one at a time: what improved, what declined, and what stayed the same.",q:["Spiritual life","Trading","Finances","Health","Relationships","Learning","Discipline","Character","Emotional health"].map(function(x){return{l:x,f:["improved","declined","same"]}})},
{n:"The Patterns",m:"15 min",s:1,d:"Now become a detective.",q:["What mistake repeated itself the most?","Which months were your best? Why?","Which months were your worst? Why?","What emotions usually came before your bad decisions?","What environments made you thrive?","Which people helped you grow?","Which situations brought out your worst?"]},
{n:"Root Cause Analysis",m:"15 min",s:1,d:"Pick your top 3 recurring problems. For each one, keep asking “Why?” until you hit a belief instead of a behavior. Example: “I wasn’t consistent.” Why? “I kept procrastinating.” Why? “I waited until I felt motivated.” Why? “I don’t trust my systems.” That last line is the belief. Fix that, not the procrastination.",q:[{t:"Recurring problem 1",s:"Write the problem, then keep asking “Why?” until you hit a belief."},{t:"Recurring problem 2",s:"Write the problem, then keep asking “Why?” until you hit a belief."},{t:"Recurring problem 3",s:"Write the problem, then keep asking “Why?” until you hit a belief."}]},
{n:"Ownership",m:"10 min",s:1,d:"This is probably the most important section. Be honest.",q:["Where did I blame circumstances instead of taking responsibility?","What excuses have I repeated all year?","If I couldn’t blame anyone else, what would I have to change?","In what ways have I been a spectator in my own life?","What decision have I been postponing?"],brk:"Take a break here. Come back fresh for Sitting 2."},
{n:"Bottlenecks and Multipliers",m:"10 min",s:2,d:"Not every problem deserves attention. Find the leverage.",q:["What 20% of my habits created 80% of my problems?","What 20% of my habits created 80% of my progress?","Which habit gave me the highest return?","Which relationship improved my life the most?","Which decision changed everything?","If I could only keep three habits next year, which would they be?"]},
{n:"Identity",m:"10 min",s:2,d:"Instead of goals, look at who you are.",q:["Who did I become this year?","Who am I becoming if nothing changes?","Is that someone I admire?","What identity must I let die?","What identity do I want to build?"]},
{n:"Build the New Operating System",m:"15 min",s:2,cs:1,d:"Don’t write goals. Write systems. Complete each statement.",q:["I will stop...","I will continue...","I will start...","Every day I will...","Every week I will...","Every month I will review...","When I fail, I will...","My non-negotiables are..."]},
{n:"Letter from December 31st, 2027",m:"10 min",s:2,d:"Write to yourself one year from now. Then pick your three things to share on Saturday.",q:["If next year’s review looked exactly like this year’s, how would I feel?","What has to change today to make sure that never happens?",{t:"What’s your biggest bottleneck?",s:"One of your three to share on Saturday."},{t:"Which identity are you letting die?",s:"One of your three to share on Saturday."},{t:"What’s one non-negotiable you’ll state out loud?",s:"One of your three to share on Saturday."}],end:"If my life is a product of my daily decisions, which decisions should I keep making, and which ones must end today?"}
];
export const BD=["Evidence Collector","Pattern Detective","Root Finder","Owner","Multiplier","Identity Shaper","System Builder","Time Traveler"];
export const LV=[[0,"Observer"],[150,"Detective"],[350,"Truth-Teller"],[600,"Architect"],[850,"Author of My Story"]];

export const FL = ["What improved", "What declined", "What stayed the same"];

let nq = 0;
export const cnt = [];
export const L = [{ k: "intro" }];
P.forEach((p, pi) => {
  let c = 0;
  L.push({ k: "part", pi });
  p.q.forEach((q, qi) => {
    if (q.f) {
      q.f.forEach((f, fi) => {
        c++;
        L.push({ k: "q", pi, qi, fi, id: pi + "." + qi + "." + fi, n: ++nq });
      });
    } else {
      c++;
      L.push({ k: "q", pi, qi, id: pi + "." + qi, n: ++nq });
    }
  });
  cnt[pi] = c;
});
L.push({ k: "done" });
export const TF = nq;
export const MAX = TF * 10 + P.length * 50;

export const has = (A, id) => !!(A[id] && A[id].trim());
export const qt = (q) => (typeof q === "string" ? q : q.t);
export const ans = (A, pi) =>
  Object.keys(A).filter((k) => k.startsWith(pi + ".") && has(A, k)).length;
export function stat(A) {
  let f = 0;
  const b = [];
  P.forEach((p, i) => {
    const a = ans(A, i);
    f += a;
    if (a >= Math.ceil(cnt[i] / 2)) b.push(i);
  });
  return { x: f * 10 + b.length * 50, b };
}
export const lvi = (x) => {
  let r = 0;
  LV.forEach((l, i) => {
    if (x >= l[0]) r = i;
  });
  return r;
};
