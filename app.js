const $ = id => document.getElementById(id);
const KEY = "santa_result_v1";
const norm = s => String(s).trim().toLowerCase().replace(/\s+/g, " ");
const LABELS = [
  ["hobbies", "Հոբբիներ"], ["favoriteColor", "Սիրած գույնը"], ["clothingSize", "Հագուստի չափս"],
  ["music", "Երաժշտական ժանրեր/արտիստներ"], ["books", "Գրքերի ժանրեր/գրողներ"],
  ["movies", "Ֆիլմեր, Սերիալներ կամ Մուլտֆիլմեր"], ["sport", "Սպորտ"],
  ["sweets", "Ինչ քաղցրավենիք եք սիրում?"], ["jewelry", "Զարդի տեսակ"],
  ["dislikes", "Անցանկալի բաներ"], ["notes", "Հավելում/Ամփոփում"]
];
const MSG = {
  noName: "Ընտրեք ձեր անունը",
  badCode: "Սխալ կոդ",
  net: "Կապի սխալ, փորձեք նորից",
  empty: "Ցանկը դատարկ է, դիմեք կազմակերպչին",
  noData: "Անկետան չի գտնվել, դիմեք կազմակերպչին"
};

NAMES.forEach(n => { const o = document.createElement("option"); o.value = n; o.textContent = n; $("name").appendChild(o); });

function profileOf(name) {
  const k = Object.keys(PROFILES).find(k => norm(k) === norm(name));
  return k ? PROFILES[k] : null;
}

function showResult(target) {
  const p = profileOf(target);
  $("gate").hidden = true; $("draw").hidden = true; $("result").hidden = false;
  if (!p) { $("who").textContent = target; $("info").innerHTML = ""; $("info").textContent = MSG.noData; return; }
  $("who").textContent = (p.firstName + " " + p.lastName).trim();
  const dl = $("info"); dl.innerHTML = "";
  LABELS.forEach(([key, label]) => {
    const v = (p[key] || "").trim();
    if (!v) return;
    const row = document.createElement("div");
    const dt = document.createElement("dt"); dt.textContent = label;
    const dd = document.createElement("dd");
    if (key === "hobbies") {
      v.split(",").map(s => s.trim()).filter(Boolean).forEach(h => {
        const s = document.createElement("span"); s.className = "tag"; s.textContent = h; dd.appendChild(s);
      });
    } else dd.textContent = v;
    row.append(dt, dd); dl.appendChild(row);
  });
  window.scrollTo(0, 0);
}

async function drawRemote(me, code) {
  const r = await fetch(CONFIG.SCRIPT_URL + "?name=" + encodeURIComponent(me) + "&code=" + encodeURIComponent(code));
  return r.json();
}

function animate(ms) {
  return new Promise(res => {
    const t0 = Date.now();
    const id = setInterval(() => {
      $("roll").textContent = NAMES[Math.floor(Math.random() * NAMES.length)];
      if (Date.now() - t0 >= ms) { clearInterval(id); res(); }
    }, 90);
  });
}

$("go").addEventListener("click", async () => {
  const me = $("name").value, code = $("code").value.trim();
  $("err").textContent = "";
  if (!me) return ($("err").textContent = MSG.noName);
  if (code.length < 4) return ($("err").textContent = MSG.badCode);
  $("go").disabled = true;
  $("gate").hidden = true; $("draw").hidden = false;
  try {
    const [res] = await Promise.all([drawRemote(me, code), animate(CONFIG.ANIM_MS)]);
    if (res.error || !res.target) throw new Error(res.error || "x");
    localStorage.setItem(KEY, JSON.stringify({ me, target: res.target }));
    showResult(res.target);
  } catch (e) {
    $("draw").hidden = true; $("gate").hidden = false; $("go").disabled = false;
    const m = String(e.message);
    $("err").textContent = m === "empty" ? MSG.empty : m === "bad_code" ? MSG.badCode : MSG.net;
  }
});

// Автооткрытие сохранённого результата
try {
  const saved = JSON.parse(localStorage.getItem(KEY) || "null");
  if (saved && saved.target) showResult(saved.target);
} catch (e) {}
