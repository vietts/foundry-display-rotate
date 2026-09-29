/**
 * Display Rotate: ruota la vista del solo client display (es. utente "Tester" di Monk's Common Display)
 * quando la scena rende di più girata di 90°. Si ruota il body via CSS e si scambiano le misure di finestra
 * lette da Foundry (window.innerWidth/innerHeight) e da Monk's ($('body')); i dati di scena non cambiano.
 */

const ID = "display-rotate";
const ROTATIONS = [0, 90, -90, 180];
const CLASSES = ["dr-rot", "dr-r90", "dr-r-90", "dr-r180"];

let current = 0;

const setting = key => game.settings.get(ID, key);

/** Misure reali della finestra, non toccate dalla rotazione del body. */
function realSize() {
  const el = document.documentElement;
  return [el.clientWidth, el.clientHeight];
}

/** Da qui in poi Foundry vede la finestra con i lati scambiati quando la vista è girata di 90°. */
function patchWindowSize() {
  const swapped = () => Math.abs(current) === 90;
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    get: () => realSize()[swapped() ? 1 : 0]
  });
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    get: () => realSize()[swapped() ? 0 : 1]
  });
}

/**
 * Il controllo di risoluzione di Foundry (ClientIssues, 1024×768 minimo) legge le misure scambiate e con la vista
 * girata dà l'avviso a vuoto: lo si scarta solo mentre la rotazione è di 90°.
 */
function patchResolutionWarning() {
  const proto = foundry.applications.ui.Notifications.prototype;
  const notify = proto.notify;
  proto.notify = function(message, ...args) {
    if ( (Math.abs(current) === 90) && (typeof message === "string") && message.startsWith("ERROR.RESOLUTION.") ) return;
    return notify.call(this, message, ...args);
  };
}

function isDisplayClient() {
  const name = (setting("displayUser") || "").trim().toLowerCase();
  return !!name && game.user?.name.trim().toLowerCase() === name;
}

/** Rotazione voluta per la scena: forzata dal flag, altrimenti gira se la scena ci sta più grande. */
function wantedRotation(scene) {
  if ( !scene || !isDisplayClient() ) return 0;
  const flag = scene.getFlag(ID, "rotation") ?? "auto";
  if ( flag !== "auto" ) return ROTATIONS.includes(Number(flag)) ? Number(flag) : 0;
  const { sceneWidth: w, sceneHeight: h } = scene.dimensions;
  const [W, H] = realSize();
  if ( !w || !h || !W || !H ) return 0;
  const fitStraight = Math.min(W / w, H / h);
  const fitTurned = Math.min(H / w, W / h);
  return fitTurned > fitStraight * setting("threshold") ? Number(setting("direction")) : 0;
}

function applyRotation(deg) {
  if ( deg === current ) return false;
  current = deg;
  const cl = document.documentElement.classList;
  cl.remove(...CLASSES);
  if ( deg ) cl.add("dr-rot", `dr-r${deg}`);
  window.dispatchEvent(new Event("resize"));
  console.log(`${ID} | rotazione display: ${deg}°`);
  return true;
}

/** Inquadra tutta la scena, come la modalità "scene" di Monk's. */
function fitScene() {
  const d = canvas.dimensions;
  const scale = Math.min(window.innerWidth / d.sceneWidth, window.innerHeight / d.sceneHeight);
  canvas.animatePan({ x: d.sceneX + (d.sceneWidth / 2), y: d.sceneY + (d.sceneHeight / 2), scale, duration: 500 });
}

/** Cambio a canvas già pronto (flag o impostazioni modificati dal GM). */
function refresh() {
  if ( !canvas.ready ) return;
  if ( applyRotation(wantedRotation(canvas.scene)) ) fitScene();
}

Hooks.once("init", () => {
  game.settings.register(ID, "displayUser", {
    name: "Utente display",
    hint: "Nome dell'utente che mostra la mappa sul display da tavolo. Solo il suo client viene ruotato.",
    scope: "world", config: true, type: String, default: "Tester",
    onChange: refresh
  });
  game.settings.register(ID, "direction", {
    name: "Verso della rotazione",
    hint: "Da che parte si girano le scene verticali. Scegli in base a dove sei seduto rispetto al display.",
    scope: "world", config: true, type: String, default: "90",
    choices: { "90": "Orario (+90°)", "-90": "Antiorario (−90°)" },
    onChange: refresh
  });
  game.settings.register(ID, "threshold", {
    name: "Soglia",
    hint: "Gira solo se la scena, girata, viene grande almeno questo fattore in più (1,1 = +10%). Evita di girare le mappe quasi quadrate.",
    scope: "world", config: true, type: Number, default: 1.1,
    range: { min: 1, max: 2, step: 0.05 },
    onChange: refresh
  });
  patchWindowSize();
  patchResolutionWarning();
});

Hooks.once("ready", () => {
  game.modules.get(ID).api = { rotation: () => current, wantedRotation, refresh };
});

// Prima del disegno della scena: il resize finale di Foundry e l'inquadratura di Monk's usano già le misure girate.
Hooks.on("canvasInit", c => applyRotation(wantedRotation(c.scene)));

Hooks.on("updateScene", (scene, changes) => {
  if ( scene !== canvas.scene ) return;
  if ( foundry.utils.hasProperty(changes, `flags.${ID}`) || foundry.utils.hasProperty(changes, `flags.-=${ID}`) ) refresh();
});

Hooks.on("renderSceneConfig", (app, html) => {
  const root = html instanceof HTMLElement ? html : html[0];
  const tab = root?.querySelector('.tab[data-tab="basics"]');
  if ( !tab || tab.querySelector(".dr-field") ) return;
  const value = String(app.document.getFlag(ID, "rotation") ?? "auto");
  const options = [
    ["auto", "Automatica (gira se la scena è verticale)"],
    ["0", "Dritta"],
    ["90", "Orario (+90°)"],
    ["-90", "Antiorario (−90°)"],
    ["180", "Capovolta (180°)"]
  ].map(([v, label]) => `<option value="${v}"${v === value ? " selected" : ""}>${label}</option>`).join("");
  const group = document.createElement("div");
  group.className = "form-group dr-field";
  group.innerHTML = `<label>Rotazione display</label>
    <div class="form-fields"><select name="flags.${ID}.rotation">${options}</select></div>
    <p class="hint">Vale solo per il client del display da tavolo. Le coordinate della scena non cambiano.</p>`;
  tab.querySelector("fieldset")?.append(group);
});
