const TABS = [
  ["reglas", "Reglas"],
  ["porra", "Clasificación"],
  ["usuario", "Mi usuario"],
  ["selecciones", "Clubes"],
  ["bombos", "Bombos"],
  ["partidos", "Jornadas"],
  ["elim", "Eliminatorias"],
];

let BOMBOS = [
  ["Estados Unidos", "Croacia", "Noruega", "Jordania"],
  ["Canada", "Marruecos", "Panama", "Cabo Verde"],
  ["Mexico", "Colombia", "Egipto", "Ghana"],
  ["España", "Uruguay", "Argelia", "Curazao"],
  ["Argentina", "Suiza", "Escocia", "Haiti"],
  ["Francia", "Japon", "Paraguay", "Nueva Zelanda"],
  ["Inglaterra", "Senegal", "Tunez", "Bosnia y Herzegovina*"],
  ["Brasil", "Iran", "Costa de Marfil", "Chequia*"],
  ["Portugal", "Corea del Sur", "Uzbekistan", "Turquia*"],
  ["Paises Bajos", "Ecuador", "Catar", "Suecia*"],
  ["Belgica", "Austria", "Arabia Saudi", "RD Congo**"],
  ["Alemania", "Australia", "Sudafrica", "Irak**"],
];

let BOMBO_MAP = Object.fromEntries(
  BOMBOS.flatMap((row) => row.map((team, index) => [cleanTeam(team), index + 1]))
);
Object.assign(BOMBO_MAP, {
  "Canadá": 1,
  "México": 1,
  "Países Bajos": 1,
  "Bélgica": 1,
  "Japón": 2,
  "Irán": 2,
  "Panamá": 3,
  "Túnez": 3,
  "Uzbekistán": 3,
  "Arabia Saudí": 3,
  "Sudáfrica": 3,
  "Haití": 4,
  "Turquía": 4,
  "Turquía*": 4,
});
let CANONICAL_TEAMS = BOMBOS.flatMap((row) =>
  row.map((team, index) => ({ team, bombo: index + 1 }))
);
const BOMBO_COL = ["#0057d8", "#00a66a", "#e1253b", "#b88923"];
const FLAGS = {
  "Alemania": "de",
  "Arabia Saudí": "sa",
  "Arabia Saudi": "sa",
  "Argelia": "dz",
  "Argentina": "ar",
  "Australia": "au",
  "Austria": "at",
  "Bélgica": "be",
  "Belgica": "be",
  "Bosnia y Herzegovina": "ba",
  "Brasil": "br",
  "Cabo Verde": "cv",
  "Canadá": "ca",
  "Canada": "ca",
  "Catar": "qa",
  "Chequia": "cz",
  "Colombia": "co",
  "Corea del Sur": "kr",
  "Costa de Marfil": "ci",
  "Croacia": "hr",
  "Curazao": "cw",
  "Ecuador": "ec",
  "Egipto": "eg",
  "Escocia": "gb-sct",
  "España": "es",
  "Espana": "es",
  "Estados Unidos": "us",
  "Francia": "fr",
  "Ghana": "gh",
  "Haití": "ht",
  "Haiti": "ht",
  "Inglaterra": "gb-eng",
  "Irak": "iq",
  "Irán": "ir",
  "Iran": "ir",
  "Japón": "jp",
  "Japon": "jp",
  "Jordania": "jo",
  "Marruecos": "ma",
  "México": "mx",
  "Mexico": "mx",
  "Noruega": "no",
  "Nueva Zelanda": "nz",
  "Países Bajos": "nl",
  "Paises Bajos": "nl",
  "Panamá": "pa",
  "Panama": "pa",
  "Paraguay": "py",
  "Portugal": "pt",
  "RD Congo": "cd",
  "Senegal": "sn",
  "Sudáfrica": "za",
  "Sudafrica": "za",
  "Suecia": "se",
  "Suiza": "ch",
  "Túnez": "tn",
  "Tunez": "tn",
  "Turquía": "tr",
  "Turquia": "tr",
  "Uruguay": "uy",
  "Uzbekistán": "uz",
  "Uzbekistan": "uz",
};
const DISPLAY_NAMES = {
  "belgica": "Bélgica",
  "canada": "Canadá",
  "espana": "España",
  "haiti": "Haití",
  "iran": "Irán",
  "japon": "Japón",
  "mexico": "México",
  "paises bajos": "Países Bajos",
  "panama": "Panamá",
  "sudafrica": "Sudáfrica",
  "tunez": "Túnez",
  "turquia": "Turquía",
  "uzbekistan": "Uzbekistán",
  "arabia saudi": "Arabia Saudí",
};
const ROUND_LABEL = {
  grupos: "Fase liga",
  R32: "Play-offs",
  R16: "Octavos",
  QF: "Cuartos",
  SF: "Semifinal",
  "3RD": "3er puesto",
  F: "Final",
};
const ROUND_ORDER = { R32: 1, R16: 2, QF: 3, SF: 4, "3RD": 5, F: 6 };
const SCORED_KO_ROUNDS = new Set(["R32", "R16", "QF", "SF", "F"]);
const DRAW_AFTER_90_STATUSES = new Set(["AET", "AOT", "AP", "PEN"]);
const KO_STATUS_LABELS = {
  AET: "AET",
  AOT: "AET",
  AP: "AP",
  PEN: "AP",
};

let DATA = null;
let activeTab = "porra";
let currentUser = null;
let ownProfile = null;
let ownEntry = null;
let ownPredictions = {};
let supabaseClient = null;
let localProfiles = [];
let openAliases = new Set();
let rankingSearch = "";
let rankingSort = "rank";
let rankingMode = "general";
let quinielistaRows = [];
let historyAliases = new Set();
let historyAllSelected = true;
let historyHoverAlias = "";
let historyPinnedAlias = "";
let restoreRankingSearchFocus = false;
let selectionBombo = 0;
let selectionGroup = "";
let groupFilter = "";
let roundFilter = 0;
let matchStatusFilter = "all";
let koRound = "R32";
let predictionRound = "J01";
let predictionDrafts = {};
let authMode = "login";
let authNotice = "";
let authBusyAction = "";
let authRecoveryMode = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("type") === "recovery";
let playerCatalog = [];

applyTheme(initialTheme());

boot();

async function boot() {
  const config = window.PORRA_SUPABASE;
  if (config?.url && config?.publishableKey && !config.url.includes("TU-PROJECT")) {
    supabaseClient = window.supabase.createClient(config.url, config.publishableKey);
    const { data: { user } } = await supabaseClient.auth.getUser();
    currentUser = user;
    if (user) await loadPrivateData();
    supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      currentUser = session?.user || null;
      if (currentUser) await loadPrivateData(); else { ownProfile = null; ownPredictions = {}; }
      if (DATA) render();
    });
  }
  fetch("datos.json")
  .then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then(async (data) => {
    DATA = normalizePayload(data);
    if (supabaseClient) {
      const [{ data: participants }, { data: quinielista }] = await Promise.all([
        supabaseClient.from("public_participants").select("alias, equipos, campeon, subcampeon, pichichi"),
        supabaseClient.from("quinielista_ranking").select("posicion, alias, puntos_quinielista, resultados_exactos, jornadas_ganadas"),
      ]);
      DATA.participantes = (participants || []).map((row) => ({ ...row, puntos_total: 0, desglose: {} }));
      quinielistaRows = quinielista || [];
    }
    openAliases = new Set();
    render();
  })
  .catch((error) => {
    document.querySelector("#metaLine").textContent = "No se pudo cargar datos.json";
    document.querySelector("#hero").innerHTML = `
      <div>
        <h1>Porra Champions League</h1>
        <p>No se pudo cargar <strong>datos.json</strong>.</p>
      </div>
      <div class="prize">${escapeHtml(error.message)}</div>
    `;
    document.querySelector("#app").innerHTML = `<div class="empty">Pendiente de generar datos desde GitHub Actions.</div>`;
  });
}

async function loadPrivateData() {
  const [{ data: profile }, { data: entry }, { data: predictions }, { data: players }] = await Promise.all([
    supabaseClient.from("profiles").select("user_id, alias").maybeSingle(),
    supabaseClient.from("entries").select("*").maybeSingle(),
    supabaseClient.from("predictions").select("match_id, home_score, away_score, confirmed_at"),
    supabaseClient.from("players").select("player_id, full_name, team_name, normalized_name").eq("season", "2026-2027").eq("active", true).order("full_name"),
  ]);
  ownProfile = profile;
  ownEntry = entry;
  ownPredictions = Object.fromEntries((predictions || []).map((row) => [String(row.match_id), row]));
  playerCatalog = players || [];
}

function normalizePayload(data) {
  const bombos = data.bombos || {};
  BOMBOS = [1, 2, 3, 4].map((pot) => Object.keys(bombos).filter((team) => Number(bombos[team]) === pot));
  BOMBO_MAP = Object.fromEntries(Object.entries(bombos).map(([team, pot]) => [cleanTeam(team), Number(pot)]));
  CANONICAL_TEAMS = BOMBOS.flatMap((row, index) => row.map((team) => ({ team, bombo: index + 1 })));
  return {
    meta: data.meta || {},
    bombos,
    participantes: data.participantes || data.participants || [],
    partidos: (data.partidos || data.matches || []).map(normalizeMatch),
    goleadores: data.goleadores || [],
  };
}

function normalizeMatch(match) {
  if (Array.isArray(match)) {
    const [matchid, group, roundnumber, fecha, home, away, hs, as, pasa, ronda] = match;
    return {
      matchid,
      group,
      roundnumber,
      ronda,
      fecha,
      home_team: home,
      away_team: away,
      home_score: hs,
      away_score: as,
      home_score_90: hs,
      away_score_90: as,
      pasa,
      status: "FT",
    };
  }
  return {
    ...match,
    fecha: match.fecha || match.date || match.dateEvent || "",
    group: match.group || null,
    roundnumber: match.roundnumber || null,
    ronda: match.ronda || "grupos",
  };
}

function render() {
  renderChrome();
  const renderers = {
    porra: renderRanking,
    usuario: renderUserExperience,
    selecciones: renderSelections,
    elim: renderKnockouts,
    grupos: renderGroups,
    partidos: renderMatches,
    bombos: renderBombos,
    reglas: renderRules,
  };
  document.querySelector("#app").innerHTML = renderers[activeTab]();
  bindEvents();
  if (restoreRankingSearchFocus) {
    const input = document.querySelector("[data-ranking-search]");
    input?.focus();
    input?.setSelectionRange(input.value.length, input.value.length);
    restoreRankingSearchFocus = false;
  }
}

function renderChrome() {
  const meta = DATA.meta;
  document.querySelector("#metaLine").textContent =
    `${meta.estado_torneo || "pre"} · ${meta.fuente || "datos.json"} · ${meta.ultima_actualizacion || ""}`;

  document.querySelector("#tabs").innerHTML = TABS.map(([key, label]) => `
    <button class="tab ${activeTab === key ? "active" : ""}" data-tab="${key}">${label}</button>
  `).join("") + `
    <button class="theme-switch" data-theme-toggle aria-label="${themeLabel()}">
      <span class="sun" title="Modo claro">☀</span>
      <span class="moon" title="Modo oscuro">☾</span>
    </button>
  `;

  const pot = DATA.participantes.length * 5;
  const hero = document.querySelector("#hero");
  hero.hidden = activeTab !== "porra";
  if (hero.hidden) {
    hero.innerHTML = "";
    return;
  }
  hero.innerHTML = `
    <div class="hero-stats">
      <div class="hero-stat">
        <strong>${escapeHtml(DATA.participantes.length)}</strong>
        <span>Participantes</span>
      </div>
      <div class="hero-stat">
        <strong>${pot}&euro;</strong>
        <span>Bote estimado</span>
      </div>
      <div class="hero-stat prize-split">
        <strong>${Math.round(pot * .8)}&euro; / ${Math.round(pot * .2)}&euro;</strong>
        <span>Reparto 1&ordm; / 2&ordm;</span>
      </div>
      <p>${escapeHtml(DATA.participantes.length)} participantes · ${escapeHtml(DATA.partidos.length)} partidos cargados · ${escapeHtml(DATA.goleadores.length)} goleadores</p>
    </div>
    <div class="prize" hidden>
      <div>Bote estimado</div>
      <strong>${pot}€</strong>
      <div>1º ${Math.round(pot * .8)}€ · 2º ${Math.round(pot * .2)}€</div>
    </div>
  `;
}

function renderUserExperience() {
  if (supabaseClient) return renderSecureUserExperience();
  return `<div class="empty">El acceso seguro está pendiente de configurar por la organización.</div>`;
  /* Legacy local demo retained below only until the next cleanup pass. */
  const user = localUser || loadStoredUser();
  if (!user) {
    return renderUserRegistration();
  }
  const jornadaMatches = getDemoJornadaMatches();
  const ownPredictions = getOwnPredictions(user.email);
  return `
    <div class="user-shell">
      <section class="user-card">
        <div>
          <p class="eyebrow">Usuario activo</p>
          <h2>${escapeHtml(user.alias || user.email)}</h2>
          <p>${escapeHtml(user.email)}</p>
        </div>
        <button class="secondary" data-user-reset>Salir</button>
      </section>
      <section class="user-card user-card-alt">
        <div class="stack" style="gap: 8px;">
          <p class="eyebrow">Tu flujo de prueba</p>
          <h3>Inscripción inicial</h3>
          <p>Este prototipo simula el registro único por email y te permite volver a entrar sin crear un segundo perfil.</p>
        </div>
        <div class="pill-row">
          <span class="pill">Identidad estable</span>
          <span class="pill">Pronósticos por jornada</span>
          <span class="pill">Edición hasta inicio</span>
        </div>
      </section>
      <section class="user-card">
        <div class="stack" style="gap: 8px;">
          <p class="eyebrow">Jornada de prueba</p>
          <h3>Jornada 1 · Lunes a martes</h3>
          <p>Los partidos se muestran como si estuvieran abiertos para predicción. Puedes modificar los resultados hasta que empiece el partido.</p>
        </div>
        <form class="prediction-form" data-prediction-form>
          ${jornadaMatches.map((match) => renderPredictionRow(match, ownPredictions[match.matchid])).join("")}
          <button class="primary" type="submit">Guardar pronósticos</button>
        </form>
      </section>
    </div>
  `;
}

function renderSecureUserExperience() {
  if (!currentUser || authRecoveryMode) return renderAuthExperience();
  if (!ownProfile) return `
    <div class="user-shell"><section class="user-card"><p class="eyebrow">Perfil</p><h2>Elige tu alias</h2>
    <form class="registration-form" data-secure-profile-form><label><span>Alias</span><input name="alias" required minlength="2" maxlength="32" placeholder="Tu nombre visible"></label><button class="primary" type="submit">Guardar perfil</button></form></section></div>`;
  if (!ownEntry) return renderSecureEntryForm();
  const matches = DATA.partidos.filter((match) => match.ronda === predictionRound);
  const [exactPoints, outcomePoints] = predictionScoreScale(matches[0]?.ronda);
  const completed = matches.filter((match) => ["FT", "AET", "AOT", "AP", "PEN"].includes(String(match.status || "").toUpperCase()));
  const roundPoints = completed.reduce((total, match) => total + predictionScorePoints(ownPredictions[String(match.matchid)], match), 0);
  const exacts = completed.filter((match) => predictionScoreKind(ownPredictions[String(match.matchid)], match) === "exact").length;
  const outcomes = completed.filter((match) => predictionScoreKind(ownPredictions[String(match.matchid)], match) === "outcome").length;
  const allPredictionMatches = DATA.partidos.filter((match) => isPredictionRound(match.ronda));
  const totalPoints = allPredictionMatches.reduce((total, match) => total + predictionScorePoints(ownPredictions[String(match.matchid)], match), 0);
  const pending = allPredictionMatches.filter((match) => isPredictionOpen(match) && !ownPredictions[String(match.matchid)]).length;
  const lastSaved = Object.values(ownPredictions).map((prediction) => prediction.confirmed_at).filter(Boolean).sort().at(-1);
  return `<div class="user-shell"><section class="user-card"><div><p class="eyebrow">Usuario activo</p><h2>${escapeHtml(ownProfile.alias)}</h2><p>${escapeHtml(currentUser.email)}</p></div><button class="secondary" data-secure-sign-out>Salir</button></section>
    <section class="user-dashboard" aria-label="Resumen de mi porra"><div><span>Puntos totales</span><strong>${totalPoints}</strong></div><div><span>Fase activa</span><strong>${escapeHtml(predictionRoundLabel(predictionRound))}</strong></div><div><span>Pendientes abiertos</span><strong>${pending}</strong></div>${lastSaved ? `<small>Último guardado: ${escapeHtml(formatLocalDateTime(lastSaved))}</small>` : ""}</section>
    <section class="user-card user-card-alt"><p class="eyebrow">Pronósticos</p><h3>Jornada 1</h3><p>Puedes guardar partidos individuales o todos los que hayas rellenado. El cierre se valida en la base de datos una hora antes.</p>
      <p class="prediction-legend" aria-label="Puntuación de esta fase"><span>Exacto <strong>${exactPoints} pts</strong></span><span>1X2 <strong>${outcomePoints} pt${outcomePoints === 1 ? "" : "s"}</strong></span></p>
      <p class="prediction-round-summary"><strong>${roundPoints} pts</strong>${completed.length ? ` · ${exacts} exacto${exacts === 1 ? "" : "s"} · ${outcomes} 1X2` : " · Aún no hay partidos finalizados"}</p>
      <form class="prediction-form" data-secure-prediction-form>${matches.map((match) => renderPredictionRow(match, ownPredictions[String(match.matchid)])).join("")}<button class="primary" type="submit">Guardar pronósticos rellenados</button></form></section></div>`;
}

function renderAuthExperience() {
  const reset = authRecoveryMode;
  const signup = authMode === "signup";
  const notice = authNotice ? `<p class="auth-feedback" role="status" aria-live="polite">${escapeHtml(authNotice)}</p>` : "";
  if (reset) return `<div class="user-shell"><section class="user-card auth-card"><p class="eyebrow">Nueva contraseña</p><h2>Recupera tu acceso</h2><p>Define una contraseña nueva para tu cuenta.</p>${notice}<form class="registration-form" data-password-update-form><label><span>Nueva contraseña</span><input name="password" type="password" required minlength="8" autocomplete="new-password"></label><label><span>Repite la contraseña</span><input name="confirm_password" type="password" required minlength="8" autocomplete="new-password"></label><button class="primary" type="submit" ${authBusyAction ? "disabled" : ""}>${authBusyAction ? "Actualizando…" : "Guardar contraseña"}</button></form></section></div>`;
  if (authMode === "reset-request") return `<div class="user-shell"><section class="user-card auth-card"><p class="eyebrow">Recuperar contraseña</p><h2>Recupera tu acceso</h2><p>Te enviaremos instrucciones si existe una cuenta con ese email.</p>${notice}<form class="registration-form" data-password-reset-form><label><span>Email</span><input name="email" type="email" required autocomplete="email" placeholder="usuario@example.com"></label><button class="primary" type="submit" ${authBusyAction ? "disabled" : ""}>${authBusyAction ? "Enviando…" : "Enviar instrucciones"}</button></form><div class="auth-actions"><button type="button" class="text-button" data-auth-login>Volver a entrar</button></div></section></div>`;
  return `<div class="user-shell"><section class="user-card auth-card"><p class="eyebrow">Acceso seguro</p><h2>${signup ? "Crea tu cuenta" : "Entra en tu porra"}</h2><p>Accede con tu cuenta habitual. Tus datos y pronósticos siguen siendo privados.</p>${notice}
    <div class="auth-providers"><button class="secondary" type="button" data-auth-oauth="google" ${authBusyAction ? "disabled" : ""}>Continuar con Google</button><button class="secondary" type="button" data-auth-oauth="azure" ${authBusyAction ? "disabled" : ""}>Continuar con Microsoft</button></div><p class="auth-divider"><span>o</span></p>
    <form class="registration-form" data-password-auth-form><label><span>Email</span><input name="email" type="email" required autocomplete="email" placeholder="usuario@example.com"></label><label><span>Contraseña</span><input name="password" type="password" required minlength="8" autocomplete="${signup ? "new-password" : "current-password"}"></label><button class="primary" type="submit" ${authBusyAction ? "disabled" : ""}>${authBusyAction ? "Espera…" : signup ? "Crear cuenta" : "Entrar"}</button></form>
    <div class="auth-actions"><button type="button" class="text-button" data-auth-toggle>${signup ? "Ya tengo cuenta" : "Crear cuenta"}</button><button type="button" class="text-button" data-auth-reset>¿Has olvidado tu contraseña?</button></div></section></div>`;
}

function renderSecureEntryForm() {
  const optionList = (teams) => [...teams].sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" })).map((team) => `<option value="${escapeAttr(team)}">${escapeHtml(team)}</option>`).join("");
  const allTeams = BOMBOS.flat();
  const playerOptions = playerCatalog.map((player) => `<option value="${escapeAttr(`${player.full_name} — ${player.team_name}`)}"></option>`).join("");
  const catalogReady = playerCatalog.length > 0;
  return `<div class="user-shell"><section class="user-card"><p class="eyebrow">Inscripción inicial</p><h2>Define tu porra</h2><p>Esta inscripción se bloquea al comenzar la primera jornada.</p><form class="registration-form" data-secure-entry-form>
    ${[1, 2, 3, 4].map((pot) => `<label><span>Equipo del Bombo ${pot}</span><input name="pot_${pot}_team" list="pot-${pot}-teams" required placeholder="Busca un equipo"><datalist id="pot-${pot}-teams">${optionList(BOMBOS[pot - 1])}</datalist></label>`).join("")}
    <label><span>Campeón</span><input name="champion_team" list="all-teams" required placeholder="Busca un equipo"></label>
    <label><span>Subcampeón</span><input name="runner_up_team" list="all-teams" required placeholder="Busca un equipo"></label><datalist id="all-teams">${optionList(allTeams)}</datalist>
    <label><span>Pichichi</span><input name="top_scorer" list="players" required ${catalogReady ? "" : "disabled"} placeholder="${catalogReady ? "Busca jugador o equipo" : "Pendiente de catálogo UEFA"}"></label><datalist id="players">${playerOptions}</datalist>
    <p class="auth-feedback" data-entry-feedback ${catalogReady ? "hidden" : ""}>El catálogo UEFA se está preparando; podrás confirmar la inscripción cuando esté cargado.</p><button class="primary" type="submit" ${catalogReady ? "" : "disabled"}>Confirmar inscripción</button></form></section></div>`;
}

function renderUserRegistration() {
  return `
    <div class="user-shell">
      <section class="user-card">
        <p class="eyebrow">Prueba de usuario</p>
        <h2>Inscripción inicial</h2>
        <p>Introduce un email y un alias para simular el registro único. Después podrás volver a entrar y ver tus pronósticos.</p>
        <form class="registration-form" data-registration-form>
          <label>
            <span>Alias</span>
            <input name="alias" required placeholder="Tu nombre visible" />
          </label>
          <label>
            <span>Email</span>
            <input name="email" type="email" required placeholder="usuario@example.com" />
          </label>
          <button class="primary" type="submit">Crear mi perfil</button>
        </form>
      </section>
      <section class="user-card user-card-alt">
        <p class="eyebrow">Qué verás</p>
        <ul class="check-list">
          <li>Un perfil único por email</li>
          <li>Una vista de pronósticos por jornada</li>
          <li>Un estado claro de edición disponible</li>
        </ul>
      </section>
    </div>
  `;
}

function renderPredictionRow(match, existing) {
  const editable = isPredictionOpen(match);
  const draft = predictionDrafts[String(match.matchid)] || {};
  const home = draft.home_score ?? existing?.home_score ?? "";
  const away = draft.away_score ?? existing?.away_score ?? "";
  const finished = ["FT", "AET", "AOT", "AP", "PEN"].includes(String(match.status || "").toUpperCase());
  const points = finished ? predictionScorePoints(existing, match) : null;
  const scoreKind = finished ? predictionScoreKind(existing, match) : "";
  const officialHome = Number(match.home_score_90 ?? match.home_score);
  const officialAway = Number(match.away_score_90 ?? match.away_score);
  const officialResult = finished && Number.isFinite(officialHome) && Number.isFinite(officialAway)
    ? `<div class="prediction-result">Resultado: <strong>${officialHome}–${officialAway}</strong></div>`
    : "";
  const closingNotice = predictionClosingNotice(match, editable);
  return `
    <div class="prediction-row">
      <div class="prediction-teams">
        ${closingNotice}
        <strong>${escapeHtml(match.home_team)}</strong>
        <span>vs</span>
        <strong>${escapeHtml(match.away_team)}</strong>
        <div class="muted">${escapeHtml(match.fecha)} · ${escapeHtml(match.ronda)}</div>
      </div>
      <div class="prediction-scores">
        <label>
          <span>Local</span>
          <input name="match-${match.matchid}-home" type="number" min="0" max="10" value="${home}" ${editable ? "" : "disabled"} />
        </label>
        <label>
          <span>Visitante</span>
          <input name="match-${match.matchid}-away" type="number" min="0" max="10" value="${away}" ${editable ? "" : "disabled"} />
        </label>
        ${officialResult}
      </div>
      <div class="prediction-status ${editable ? (existing ? "saved" : "pending") : "locked"}" title="${editable ? (existing ? "Guardado" : "Pendiente de confirmar") : "Bloqueado"}" aria-label="${editable ? (existing ? "Guardado" : "Pendiente de confirmar") : "Bloqueado"}">${editable ? (existing ? "✓" : "◷") : "🔒"}</div>
      <div class="prediction-actions">${finished ? `<span class="prediction-points ${scoreKind}" title="${scoreKind === "exact" ? "Marcador exacto" : scoreKind === "outcome" ? "1X2 acertado" : "Sin acierto"}" aria-label="${scoreKind === "exact" ? "Marcador exacto" : scoreKind === "outcome" ? "1X2 acertado" : "Sin acierto"}: ${points} puntos">${points}p</span>` : editable ? `<button class="secondary icon-button" type="button" data-random-prediction="${escapeAttr(match.matchid)}" title="Generar marcador aleatorio" aria-label="Generar marcador aleatorio">🎲</button><button class="secondary icon-button" type="button" data-save-prediction="${escapeAttr(match.matchid)}" title="Guardar este partido" aria-label="Guardar este partido" disabled>💾</button>` : ""}</div>
    </div>
  `;
}

function loadStoredUser() {
  try {
    const saved = localStorage.getItem("porra-demo-user");
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    localUser = parsed;
    return parsed;
  } catch (error) {
    return null;
  }
}

function getOwnPredictions(email) {
  if (!email) return {};
  if (localPredictions[email]) return localPredictions[email];
  try {
    const saved = localStorage.getItem(`porra-demo-predictions-${email}`);
    if (!saved) return {};
    const parsed = JSON.parse(saved);
    localPredictions[email] = parsed;
    return parsed;
  } catch (error) {
    return {};
  }
}

function getDemoJornadaMatches() {
  return [
    { matchid: 1, fecha: "Lun 08.06", ronda: "R01", home_team: "Real Madrid", away_team: "Inter" },
    { matchid: 2, fecha: "Mar 09.06", ronda: "R01", home_team: "Bayern", away_team: "PSG" },
    { matchid: 3, fecha: "Mar 09.06", ronda: "R01", home_team: "Liverpool", away_team: "Leverkusen" },
  ];
}

function renderRanking() {
  if (rankingMode === "quinielista") return renderQuinielistaRanking();
  if (!DATA.participantes.length) return `<div class="empty">Todavía no hay participantes publicados.</div>`;
  const participants = rankingParticipants();
  return `
    <div class="ranking-title">
      <div>
        <h2>Ranking</h2>
        <p class="section-note">Ordena, busca y compara participantes. La clasificación general usa criterios UEFA de desempate: puntos, diferencia de goles, goles a favor y, si sigue el empate, mejor resultado en enfrentamientos directos.</p>
      </div>
    </div>
    ${rankingModeTabs()}
    ${rankingToolbar(participants)}
    ${participants.length ? `<div class="stack">${participants.map((participant, index) => renderParticipant(participant, index)).join("")}</div>` : `<div class="empty">No hay participantes con ese filtro.</div>`}
    ${renderRankingHistory(participants)}
  `;
}

function rankingModeTabs() {
  return `<div class="ranking-mode-tabs" role="tablist" aria-label="Clasificaciones"><button class="${rankingMode === "general" ? "active" : ""}" data-ranking-mode="general" role="tab">General</button><button class="${rankingMode === "quinielista" ? "active" : ""}" data-ranking-mode="quinielista" role="tab">Quinielista</button></div>`;
}

function renderQuinielistaRanking() {
  const rows = quinielistaRows.filter((row) => !rankingSearch || normalizeSearch(row.alias).includes(normalizeSearch(rankingSearch)));
  return `<div class="ranking-title"><div><h2>Premio Quinielista</h2><p class="section-note">Solo cuenta los puntos de pronósticos. Desempates: resultados exactos y jornadas ganadas. El premio equivale al 20% del bote y es acumulable.</p></div></div>${rankingModeTabs()}${rows.length ? `<div class="stack">${rows.map((row, index) => `<article class="ranking-card ${ownProfile?.alias === row.alias ? "current-user" : ""}"><div class="ranking-head"><div class="rank">${row.posicion || index + 1}</div><div><div class="alias">${escapeHtml(row.alias)}</div><div class="ranking-summary"><span class="summary-chip"><b>Exactos</b>${row.resultados_exactos || 0}</span><span class="summary-chip"><b>Jornadas</b>${row.jornadas_ganadas || 0}</span></div></div><div class="score">${row.puntos_quinielista || 0}<span>quiniela</span></div></div></article>`).join("")}</div>` : `<div class="empty">Aún no hay puntos de quiniela finalizados.</div>`}`;
}

function renderParticipant(participant, index) {
  const breakdown = participant.desglose || {};
  const isOpen = openAliases.has(participant.alias);
  const rank = participant.rank_actual || index + 1;
  return `
    <article class="ranking-card ${isOpen ? "open" : ""} ${ownProfile?.alias === participant.alias ? "current-user" : ""}">
      <button class="ranking-head" data-open="${escapeAttr(participant.alias)}">
        <div class="rank">${rank}${rankDelta(participant)}</div>
        <div>
          <div class="alias">${escapeHtml(participant.alias)}</div>
          <div class="teams">${(participant.equipos || []).map((team) => `<span class="chip">${teamLabel(team, true)}</span>`).join("")}</div>
          ${isOpen ? "" : participantSummary(participant)}
        </div>
        <div class="score">${participant.puntos_total || 0}<span>puntos</span></div>
      </button>
      <div class="details">
        <div class="breakdown">
          ${metric("Fase liga", breakdown.grupos)}
          ${metric("KO resultado", breakdown.playoffs_resultado)}
          ${metric("KO pase", breakdown.playoffs_pase)}
          ${metric("Bonus", breakdown.bonus_final)}
        </div>
        <div class="team-grid">
          ${(participant.team_data || []).map(renderTeamData).join("")}
        </div>
        <div class="teams" style="margin-top:12px">
          <span class="chip"><strong>Campeón</strong> ${teamLabel(participant.campeon || "-")}</span>
          <span class="chip"><strong>Subcampeón</strong> ${teamLabel(participant.subcampeon || "-")}</span>
          <span class="chip"><strong>Pichichi</strong> ${escapeHtml(participant.pichichi || "-")}</span>
        </div>
      </div>
    </article>
  `;
}

function renderTeamData(teamData) {
  const bombo = teamData.bombo || getBombo(teamData.team);
  const color = BOMBO_COL[bombo - 1] || "var(--gold)";
  return `
    <div class="team-card" style="border-color:${color}55">
      <h3>
        <span>${teamLabel(teamData.team, true)}</span>
        <span style="color:${color}">${(teamData.g_pts || 0) + (teamData.ko_pts || 0)}</span>
      </h3>
      <small>Bombo ${bombo} · Fase liga ${teamData.g_pts || 0} · KO ${teamData.ko_pts || 0}</small>
      ${(teamData.rondas_pasadas || []).length ? `<div class="teams">${teamData.rondas_pasadas.map((round) => `<span class="chip">${ROUND_LABEL[round] || round}</span>`).join("")}</div>` : ""}
    </div>
  `;
}

function metric(label, value) {
  return `<div class="metric"><label>${label}</label><strong>${value || 0}</strong></div>`;
}

function renderSelections() {
  const groups = selectionGroups();
  const teams = computeTeamScores()
    .filter((team) => !selectionBombo || team.bombo === selectionBombo)
    .filter((team) => !selectionGroup || team.group === selectionGroup)
    .sort((a, b) =>
      a.bombo - b.bombo ||
      String(a.group || "").localeCompare(String(b.group || "")) ||
      a.team.localeCompare(b.team)
    );
  return `
    <p class="section-note">Clubes ordenados por bombo UEFA. Los puntos muestran lo que aporta cada club: fase liga + resultado de eliminatorias a 90 minutos + bonus de pase por bombo.</p>
    ${selectionToolbar(groups)}
    <div class="card">
      <table>
        <thead>
          <tr>
            <th>#</th><th>Club</th><th class="center">Bombo</th><th class="num">Fase liga</th><th class="num">KO Result.</th><th class="num">KO pase</th><th class="num">Total</th>
          </tr>
        </thead>
        <tbody>
          ${teams.map((team, index) => `
            <tr>
              <td class="dim">${index + 1}</td>
              <td class="team-name">${teamLabel(team.team)}</td>
              <td class="center pot-${team.bombo}">${team.bombo}</td>
              <td class="num">${team.grupos}</td>
              <td class="num">${team.ko_resultado}</td>
              <td class="num">${team.ko_pase}</td>
              <td class="num gold">${team.total}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function participantSummary(participant) {
  return `
    <div class="ranking-summary">
      <span class="summary-chip"><b>Campeón</b>${teamLabel(participant.campeon || "-")}</span>
      <span class="summary-chip"><b>Sub</b>${teamLabel(participant.subcampeon || "-")}</span>
      <span class="summary-chip"><b>Pichichi</b>${escapeHtml(participant.pichichi || "-")}</span>
    </div>
  `;
}

function rankingToolbar(participants) {
  const toggleAll = openAliases.size ? "none" : "all";
  return `
    <div class="ranking-tools">
      <div class="search-wrap">
        <input class="search-input" type="search" data-ranking-search placeholder="Buscar participante" value="${escapeAttr(rankingSearch)}">
        ${rankingSearch ? `<button class="search-clear" data-ranking-clear aria-label="Borrar búsqueda">×</button>` : ""}
      </div>
      <label class="sort-wrap">
        <span class="sort-label">Ordenar</span>
        <select class="sort-select" data-ranking-sort>
          <option value="rank" ${rankingSort === "rank" ? "selected" : ""}>Clasificación</option>
          <option value="alias-asc" ${rankingSort === "alias-asc" ? "selected" : ""}>Alias A-Z</option>
          <option value="alias-desc" ${rankingSort === "alias-desc" ? "selected" : ""}>Alias Z-A</option>
        </select>
      </label>
      <button class="icon-button" data-ranking-toggle="${toggleAll}" aria-label="${toggleAll === "all" ? "Desplegar todo" : "Replegar todo"}" title="${toggleAll === "all" ? "Desplegar todo" : "Replegar todo"}">${toggleAll === "all" ? "↧" : "↥"}</button>
    </div>
  `;
}

function rankingParticipants() {
  const needle = normalizeSearch(rankingSearch);
  const rows = DATA.participantes
    .filter((participant) => !needle || normalizeSearch(participant.alias).includes(needle));
  return rows.sort((a, b) => {
    if (rankingSort === "alias-asc") return String(a.alias).localeCompare(String(b.alias));
    if (rankingSort === "alias-desc") return String(b.alias).localeCompare(String(a.alias));
    return (a.rank_actual || 9999) - (b.rank_actual || 9999) || String(a.alias).localeCompare(String(b.alias));
  });
}

function rankDelta(participant) {
  const status = participant.rank_status;
  const delta = participant.rank_delta;
  if (status === "nuevo") return `<span class="rank-delta new">Nuevo</span>`;
  if (!delta) return `<span class="rank-delta">=</span>`;
  if (delta > 0) return `<span class="rank-delta up">↑ ${delta}</span>`;
  return `<span class="rank-delta down">↓ ${Math.abs(delta)}</span>`;
}

function renderRankingHistory(visibleParticipants) {
  const history = DATA.meta.ranking_history || [];
  if (!history.length) return "";
  const visibleAliases = visibleParticipants.map((participant) => participant.alias);
  if (historyAllSelected) historyAliases = new Set(visibleAliases);
  else historyAliases = new Set([...historyAliases].filter((alias) => visibleAliases.includes(alias)));
  const aliases = [...historyAliases];
  if (historyPinnedAlias && !aliases.includes(historyPinnedAlias)) historyPinnedAlias = "";
  if (historyHoverAlias && !aliases.includes(historyHoverAlias)) historyHoverAlias = "";
  const focusAlias = historyHoverAlias || historyPinnedAlias;
  const allVisibleSelected = visibleAliases.length > 0 && aliases.length === visibleAliases.length;
  const historyAction = allVisibleSelected ? "clear" : "all";
  const checkpoints = rankingHistoryCheckpoints(history);
  const rows = history.filter((row) => aliases.includes(row.alias));
  const maxRank = Math.max(1, ...history.map((row) => Number(row.posicion) || 1));
  return `
    <section class="history-section">
      <div class="history-head">
        <div>
          <h2>Evolución de la clasificación</h2>
          <p class="section-note">Filtra uno o varios alias para comparar su posición por jornada.</p>
        </div>
      </div>
      <div class="history-filter">
        <div class="history-actions" aria-label="Acciones del filtro de evolución">
          <button class="history-action ${historyAction === "clear" ? "ghost" : ""}" data-history-action="${historyAction}" title="${historyAction === "clear" ? "Limpiar selección" : "Seleccionar todos los participantes"}">
            <span aria-hidden="true">${historyAction === "clear" ? "×" : "✓"}</span> ${historyAction === "clear" ? "Limpiar selección" : "Seleccionar todo"}
          </button>
        </div>
        ${visibleAliases.map((alias) => `<button class="history-chip ${aliases.includes(alias) ? "active" : ""} ${focusAlias === alias ? "focus" : ""}" data-history-alias="${escapeAttr(alias)}">${escapeHtml(alias)}</button>`).join("")}
      </div>
      <div class="history-chart">${historySvg(rows, checkpoints, aliases, maxRank, focusAlias)}</div>
    </section>
  `;
}

function rankingHistoryCheckpoints(history) {
  const fixed = DATA.meta.ranking_checkpoints || [];
  if (fixed.length) {
    return fixed.map((row) => [row.checkpoint, row.label || row.checkpoint]);
  }
  return [...new Map(history.map((row) => [row.checkpoint, row.label || row.checkpoint])).entries()];
}

function historySvg(rows, checkpoints, aliases, maxRank, focusAlias = "") {
  if (!rows.length || !checkpoints.length) return `<div class="empty">Todavía no hay histórico suficiente.</div>`;
  const width = Math.max(760, checkpoints.length * 142);
  const height = 300;
  const pad = { left: 48, right: 150, top: 20, bottom: 44 };
  const xStep = checkpoints.length <= 1 ? 0 : (width - pad.left - pad.right) / (checkpoints.length - 1);
  const y = (rank) => pad.top + ((Number(rank) - 1) / Math.max(1, maxRank - 1)) * (height - pad.top - pad.bottom);
  const x = (index) => pad.left + index * xStep;
  const byAlias = {};
  rows.forEach((row) => {
    (byAlias[row.alias] = byAlias[row.alias] || {})[row.checkpoint] = row;
  });
  const colors = ["#0057d8", "#00a66a", "#e1253b", "#c99a2e", "#7c4dff", "#00a3ff", "#d8273f"];
  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Evolución de posiciones">
      ${checkpoints.map(([checkpoint, label], index) => `
        <line x1="${x(index)}" y1="${pad.top}" x2="${x(index)}" y2="${height - pad.bottom}" stroke="var(--line)" stroke-width="1" />
        <text x="${x(index)}" y="${height - 18}" text-anchor="middle" fill="var(--muted)" font-size="11">${escapeHtml(label)}</text>
      `).join("")}
      ${[1, Math.ceil(maxRank / 2), maxRank].map((rank) => `
        <text x="12" y="${y(rank) + 4}" fill="var(--muted)" font-size="11">#${rank}</text>
        <line x1="${pad.left}" y1="${y(rank)}" x2="${width - pad.right}" y2="${y(rank)}" stroke="var(--line)" stroke-width="1" stroke-dasharray="4 6" />
      `).join("")}
      ${aliases.map((alias, aliasIndex) => {
        const plotted = checkpoints
          .map(([checkpoint], index) => {
            const row = byAlias[alias]?.[checkpoint];
            return row ? { row, index, px: x(index), py: y(row.posicion) } : null;
          })
          .filter(Boolean);
        const points = plotted.map((point) => `${point.px},${point.py}`);
        const last = plotted.at(-1);
        const color = colors[aliasIndex % colors.length];
        const isFocused = focusAlias === alias;
        const isMuted = Boolean(focusAlias) && !isFocused;
        return `
          <g class="history-series ${isFocused ? "active" : ""} ${isMuted ? "muted" : ""}" data-history-focus="${escapeAttr(alias)}" tabindex="0" role="button" aria-label="Resaltar ${escapeAttr(alias)}">
          <polyline points="${points.join(" ")}" fill="none" stroke="${color}" stroke-linecap="round" stroke-linejoin="round" />
          ${plotted.map((point) => `<circle cx="${point.px}" cy="${point.py}" r="4" fill="${color}"><title>${escapeHtml(alias)} · #${point.row.posicion} · ${point.row.puntos} puntos</title></circle>`).join("")}
          ${last ? `
            <line x1="${last.px + 6}" y1="${last.py}" x2="${last.px + 18}" y2="${last.py}" stroke="${color}" stroke-width="2" />
            <text x="${last.px + 22}" y="${last.py + 4}" fill="${color}" font-size="12" font-weight="800">${escapeHtml(alias)} · #${last.row.posicion}</text>
          ` : ""}
          </g>
        `;
      }).join("")}
    </svg>
  `;
}

function selectionToolbar(groups) {
  return `
    <div class="toolbar">
      <span class="toolbar-label">Bombo</span>
      ${[0, 1, 2, 3, 4].map((bombo) => buttonFilter("bombo", String(bombo), bombo ? String(bombo) : "Todos", String(selectionBombo))).join("")}
      ${groups.length ? `<span class="toolbar-label" style="margin-left:8px">Grupo</span>${buttonFilter("selection-group", "", "Todos", selectionGroup)}${groups.map((group) => buttonFilter("selection-group", group, group, selectionGroup)).join("")}` : ""}
    </div>
  `;
}

function renderKnockouts() {
  const matches = DATA.partidos.filter((match) => SCORED_KO_ROUNDS.has(match.ronda));
  if (!matches.length) return `<div class="empty">Todavía no hay eliminatorias cargadas.</div>`;
  const rounds = [...new Set(matches.map((match) => match.ronda))].sort((a, b) => (ROUND_ORDER[a] || 99) - (ROUND_ORDER[b] || 99));
  if (!rounds.includes(koRound)) koRound = rounds[0];
  return `
    <div class="toolbar">${rounds.map((round) => buttonFilter("koround", round, ROUND_LABEL[round] || round, koRound)).join("")}</div>
    <div class="stack">${matches.filter((match) => match.ronda === koRound).map(renderMatchRow).join("")}</div>
  `;
}

function renderGroups() {
  const leagueMatches = DATA.partidos.filter((match) => String(match.ronda || "").startsWith("J"));
  if (leagueMatches.length) {
    const byDate = groupBy(leagueMatches, (match) => match.fecha || "Sin fecha");
    return `<div class="section-note">Fase liga: 36 clubes, ocho jornadas.</div>${Object.entries(byDate).map(([date, rows]) => `
      <div class="date-title">${escapeHtml(date)}</div><div class="stack">${rows.map(renderMatchRow).join("")}</div>`).join("")}`;
  }
  const groups = [...new Set(DATA.partidos.filter((match) => match.group).map((match) => match.group))].sort();
  if (!groups.length) return `<div class="empty">Todavía no hay partidos de fase liga cargados.</div>`;
  return `
    <div class="groups-grid">
      ${groups.map((group) => renderGroupTable(group)).join("")}
    </div>
  `;
}

function renderGroupTable(group) {
  const table = standings(group);
  return `
    <div class="card group-card">
      <table class="group-table">
        <thead><tr><th colspan="8" style="color:var(--gold-bright)">Grupo ${escapeHtml(group)}</th></tr></thead>
        <tbody>
          <tr><th>#</th><th>Selección</th><th class="num">PJ</th><th class="num">G</th><th class="num">E</th><th class="num">P</th><th class="num">DG</th><th class="num">Pts</th></tr>
          ${table.map((row, index) => `
            <tr>
              <td class="dim">${index + 1}</td>
              <td class="team-name">${teamLabel(row.team)}</td>
              <td class="num">${row.PJ}</td>
              <td class="num">${row.G}</td>
              <td class="num">${row.E}</td>
              <td class="num">${row.P}</td>
              <td class="num">${row.DG}</td>
              <td class="num gold">${row.Pts}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderMatches() {
  const matches = DATA.partidos
    .filter((match) => String(match.ronda || "").startsWith("J"))
    .filter((match) => !roundFilter || Number(match.roundnumber) === Number(roundFilter))
    .filter((match) => matchStatusFilter === "all" || (matchStatusFilter === "finished" ? isFinishedMatch(match) : !isFinishedMatch(match)));
  const byDate = groupBy(matches, (match) => match.fecha || "Sin fecha");
  return `
    <div class="toolbar">
      <span class="toolbar-label">Jornada</span>
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((round) => buttonFilter("round", String(round), round ? `J${round}` : "Todas", String(roundFilter))).join("")}
      <span class="toolbar-label">Estado</span>
      ${[["all", "Todos"], ["open", "Pendientes"], ["finished", "Finalizados"]].map(([value, label]) => buttonFilter("match-status", value, label, matchStatusFilter)).join("")}
    </div>
    ${matches.length ? Object.entries(byDate).map(([date, rows]) => `
      <div class="date-title">${escapeHtml(date)}</div>
      <div class="match-grid">${rows.map(renderMatchRow).join("")}</div>
    `).join("") : `<div class="empty">No hay partidos con esos filtros.</div>`}
  `;
}

function renderMatchRow(match) {
  const homeScore = scoreValue(match.home_score_90 ?? match.home_score);
  const awayScore = scoreValue(match.away_score_90 ?? match.away_score);
  const score = homeScore === null || awayScore === null ? "vs" : `${homeScore}-${awayScore}`;
  const status = String(match.status || "").toUpperCase();
  const statusLabel = SCORED_KO_ROUNDS.has(match.ronda) ? KO_STATUS_LABELS[status] : "";
  const location = match.group
    ? `Grupo ${match.group}`
    : match.ronda?.startsWith("J")
      ? `Jornada ${match.ronda.replace("J", "")}`
      : ROUND_LABEL[match.ronda] || match.ronda || "";
  const time = match.starts_at
    ? new Date(match.starts_at).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
    : "Hora pendiente";
  return `
    <div class="match-row">
      <div class="match-date"><strong>${escapeHtml(time)}</strong><br>${escapeHtml(match.fecha || "")}<br>${escapeHtml(location)}</div>
      <div class="home">${teamLabel(match.home_team || "")}</div>
      <div class="result">
        <span>${score}</span>
        ${statusLabel ? `<small class="match-status">${statusLabel}</small>` : ""}
      </div>
      <div class="away">${teamLabel(match.away_team || "")}</div>
    </div>
  `;
}

function renderBombos() {
  const source = Object.entries(DATA.bombos || {});
  const rows = [1, 2, 3, 4].map((pot) => source.filter(([, value]) => Number(value) === pot).map(([team]) => team));
  return `
    <div class="card" style="overflow-x:auto">
      <table style="min-width:640px">
        <thead><tr>${[1, 2, 3, 4].map((bombo) => `<th class="center pot-${bombo}">Bombo ${bombo}</th>`).join("")}</tr></thead>
        <tbody>
          ${Array.from({ length: Math.max(...rows.map((row) => row.length), 0) }, (_, rowIndex) => `
            <tr>${rows.map((pot, index) => `<td class="left pot-${index + 1}">${teamLabel(pot[rowIndex] || "")}</td>`).join("")}</tr>
          `).join("")}
        </tbody>
      </table>
    </div>
    <p class="section-note" style="margin-top:10px">Bombos oficiales de la fase liga UEFA 2025/26.</p>
  `;
}

function renderRules() {
  return `
    <div class="rules rules-compact">
      <section class="rules-hero">
        <div><h2>Reglas de la porra</h2><p>Inscríbete una vez, confirma tus pronósticos y sigue tus puntos durante la Champions 2026/27.</p></div>
        <div class="rules-kpi"><div><strong>4</strong><span>Clubes por persona</span></div><div><strong>8</strong><span>Jornadas de liga</span></div><div><strong>−1 h</strong><span>Cierre por partido</span></div></div>
      </section>
      <nav class="rules-links" aria-label="Secciones de reglas"><a href="#reglas-inscripcion">Inscripción</a><a href="#reglas-pronosticos">Pronósticos</a><a href="#reglas-puntuacion">Puntuación</a><a href="#reglas-bonus">Bonus</a></nav>

      <section class="rules-block rules-full" id="reglas-inscripcion">
        <h2>1. Inscripción</h2>
        <ul><li>Elige un club de cada bombo, campeón, subcampeón y pichichi.</li><li>La inscripción se cierra al comenzar la primera jornada.</li><li>Los datos privados solo los puede consultar y modificar su titular.</li></ul>
      </section>

      <section class="rules-block rules-full" id="reglas-pronosticos">
        <h2>2. Pronósticos</h2>
        <ul><li>Puedes guardar cada partido por separado o varios a la vez.</li><li>El plazo termina una hora antes del inicio oficial, en horario de Madrid.</li><li>Un partido sin pronóstico confirmado a tiempo suma 0 puntos.</li></ul>
      </section>

      <section class="rules-block rules-full" id="reglas-puntuacion">
        <h2>3. Puntuación</h2>
        <h3>Elecciones de equipos</h3>
        <p>Tus cuatro clubes suman <strong>3 puntos por victoria</strong> y <strong>1 por empate</strong>. También reciben el bonus de su bombo al acabar entre los ocho primeros o al alcanzar octavos desde los puestos 9–24, y por cada ronda superada desde octavos.</p>
        <table class="rules-table"><thead><tr><th>Bombo original</th><th>Bonus por clasificación o ronda</th></tr></thead><tbody>
          <tr><td>Bombo 1</td><td>+1 punto</td></tr><tr><td>Bombo 2</td><td>+2 puntos</td></tr><tr><td>Bombo 3</td><td>+3 puntos</td></tr><tr><td>Bombo 4</td><td>+4 puntos</td></tr>
        </tbody></table>
        <p><strong>El play-off no concede bonus.</strong> El bonus se concede una vez al acceder a octavos y por cada ronda superada desde entonces.</p>
        <table class="rules-table"><thead><tr><th>Acierto final</th><th>Puntos</th></tr></thead><tbody>
          <tr><td>Campeón</td><td>+10</td></tr><tr><td>Subcampeón</td><td>+5</td></tr><tr><td>Pichichi</td><td>+7</td></tr><tr><td>Campeón entre tus cuatro clubes</td><td>+6</td></tr>
        </tbody></table>
        <p>El bonus de campeón acertado y el de campeón incluido entre tus cuatro clubes no se acumulan.</p>
        <h3>Quiniela</h3>
        <p>Se usa el resultado a los 90 minutos: el marcador exacto recibe la puntuación mayor y el 1X2 acierta victoria local, empate o victoria visitante.</p>
        <table class="rules-table"><thead><tr><th>Fase</th><th>Exacto</th><th>1X2</th></tr></thead><tbody>
          <tr><td>Fase liga</td><td>3</td><td>1</td></tr><tr><td>Play-off</td><td>3</td><td>1</td></tr><tr><td>Octavos</td><td>6</td><td>2</td></tr><tr><td>Cuartos</td><td>8</td><td>3</td></tr><tr><td>Semifinal</td><td>10</td><td>4</td></tr><tr><td>Final</td><td>12</td><td>5</td></tr>
        </tbody></table>
        <p>La prórroga y los penaltis no cambian el resultado puntuable. Un pronóstico no confirmado o fallado suma 0.</p>
      </section>

      <section class="rules-block rules-full" id="reglas-bonus">
        <h2>4. Bonus y clasificación</h2>
        <ul><li>Los ocho primeros de la fase liga reciben el bonus correspondiente; también los ocho equipos que accedan a octavos desde los puestos 9–24.</li><li>Los bonus de avance empiezan en octavos.</li><li>La clasificación general aplica los criterios UEFA de desempate.</li></ul>
      </section>
    </div>`;
}

function renderRulesLegacy() {
  return `
    <div class="rules">
      <section class="rules-hero">
        <div>
          <h2>Reglas de la porra</h2>
          <p>Elige un club de cada bombo, campeón, subcampeón y pichichi; después confirma tus pronósticos partido a partido durante la Champions 2026/27.</p>
          <p>Cada pronóstico queda bloqueado una hora antes de comenzar el partido.</p>
        </div>
        <div class="rules-kpi">
          <div><strong>5&euro;</strong><span>Cuota de participación</span></div>
          <div><strong>4</strong><span>Clubes por persona</span></div>
          <div><strong>80/20</strong><span>Reparto del bote</span></div>
          <div><strong>8</strong><span>Jornadas de fase liga</span></div>
        </div>
      </section>

      <section class="rules-block rules-half">
        <h2>Inscripción</h2>
        <p>Cada participación debe incluir los datos necesarios para identificar la quiniela y calcular los puntos durante la competición.</p>
        <div class="points-grid">
          <div class="point-card"><strong>Identidad</strong><span>Nombre real, alias público y email de contacto.</span></div>
          <div class="point-card"><strong>Equipos</strong><span>Un equipo del Bombo 1, 2, 3 y 4.</span></div>
          <div class="point-card"><strong>Finales</strong><span>Campeón, subcampeón y pichichi o Bota de Oro.</span></div>
        </div>
        <p style="margin-top:12px">El cierre de registro se anunciará para cada edición antes de su inicio.</p>
      </section>

      <section class="rules-block rules-half">
        <h2>Cuota y premios</h2>
        <ul>
          <li>Cuota de participación: <strong>5 euros</strong>.</li>
          <li>La fecha límite de pago se comunicará junto con la convocatoria.</li>
          <li>Si no se paga a tiempo, la quiniela queda anulada.</li>
          <li>El bote se reparte: 80% para el primero y 20% para el segundo.</li>
        </ul>
      </section>

      <section class="rules-block rules-half">
        <h2>Bombos</h2>
        <p>Cada participante debe elegir un club de cada bombo. Puedes consultar el listado completo en la pestaña <strong>Bombos</strong>.</p>
        <table class="rules-table">
          <thead><tr><th>Bombo</th><th>Elección</th></tr></thead>
          <tbody>
            <tr><td>Bombo 1</td><td>1 club</td></tr>
            <tr><td>Bombo 2</td><td>1 club</td></tr>
            <tr><td>Bombo 3</td><td>1 club</td></tr>
            <tr><td>Bombo 4</td><td>1 club</td></tr>
          </tbody>
        </table>
      </section>

      <section class="rules-block rules-half">
        <h2>Restricción de equipos</h2>
        <p>Para que las quinielas sean variadas, dos participantes no pueden coincidir en 3 o más de sus 4 equipos.</p>
        <ul>
          <li>Si dos quinielas coinciden en 3 o 4 equipos, tiene prioridad la enviada primero.</li>
          <li>La segunda persona tendrá que rehacer su combinación.</li>
        </ul>
      </section>

      <section class="rules-block rules-half">
        <h2>Puntos por partido</h2>
        <p>Solo puntúan los pronósticos confirmados antes del cierre. Se compara el marcador a los 90 minutos: la prórroga y los penaltis no lo modifican.</p>
        <table class="rules-table">
          <thead><tr><th>Fase</th><th>Marcador exacto</th><th>1X2</th></tr></thead>
          <tbody>
            <tr><td>Fase liga</td><td>3 puntos</td><td>1 punto</td></tr>
            <tr><td>Play-off</td><td>4 puntos</td><td>1 punto</td></tr>
            <tr><td>Octavos</td><td>6 puntos</td><td>2 puntos</td></tr>
            <tr><td>Cuartos</td><td>8 puntos</td><td>3 puntos</td></tr>
            <tr><td>Semifinal</td><td>10 puntos</td><td>4 puntos</td></tr>
            <tr><td>Final</td><td>12 puntos</td><td>5 puntos</td></tr>
          </tbody>
        </table>
        <p style="margin-top:12px">El 1X2 acierta si coincide victoria local, empate o victoria visitante. Si el pronóstico no se confirma o falla, suma 0 puntos.</p>
      </section>

      <section class="rules-block rules-half">
        <h2>Rondas con bonus</h2>
        <ul>
          <li>Octavos de final.</li>
          <li>Cuartos de final.</li>
          <li>Semifinal.</li>
          <li>Final.</li>
        </ul>
        <p>El bonus se concede por cada ronda eliminatoria que el club supera.</p>
      </section>

      <section class="rules-block rules-half">
        <h2>Bonus por alcanzar ronda</h2>
        <table class="rules-table">
          <thead><tr><th>Bombo original</th><th>Extra por ronda</th></tr></thead>
          <tbody>
            <tr><td>Bombo 1</td><td>+1 punto</td></tr>
            <tr><td>Bombo 2</td><td>+2 puntos</td></tr>
            <tr><td>Bombo 3</td><td>+3 puntos</td></tr>
            <tr><td>Bombo 4</td><td>+4 puntos</td></tr>
          </tbody>
        </table>
        <p>Ejemplo: un equipo del Bombo 4 que gana la Champions puede sumar hasta 20 puntos extra solo por rondas superadas.</p>
      </section>

      <section class="rules-block rules-half">
        <h2>Bonus finales</h2>
        <table class="rules-table">
          <thead><tr><th>Acierto</th><th>Puntos</th></tr></thead>
          <tbody>
            <tr><td>Campeón acertado</td><td>+10</td></tr>
            <tr><td>Subcampeón acertado</td><td>+5</td></tr>
            <tr><td>Pichichi acertado</td><td>+7</td></tr>
            <tr><td>Campeón real entre tus 4 equipos</td><td>+6</td></tr>
          </tbody>
        </table>
        <p>El bonus de campeón acertado y el bonus de campeón entre tus 4 equipos no se acumulan entre sí.</p>
      </section>

      <section class="rules-block rules-half">
        <h2>Pichichi</h2>
        <p>El desempate de máximo goleador se aplicará según la estadística oficial UEFA que se publique para cada edición.</p>
        <ul>
          <li>Primero se comparan goles.</li>
          <li>Si hay empate, se comparan asistencias.</li>
          <li>Si sigue el empate, gana quien haya jugado menos minutos.</li>
        </ul>
      </section>

      <section class="rules-block rules-half">
        <h2>Desempates</h2>
        <p>Si dos participantes terminan empatados a puntos, se aplicarán los criterios anunciados por la organización antes de la apertura. No se trasladan automáticamente los desempates de clasificación UEFA a la porra.</p>
      </section>

      <section class="rules-block rules-full">
        <h2>Resumen rápido</h2>
        <div class="points-grid four">
          <div class="point-card"><strong>1</strong><span>Resultados de tus clubes en las ocho jornadas de fase liga.</span></div>
          <div class="point-card"><strong>2</strong><span>Resultados de tus clubes en eliminatorias a 90 minutos.</span></div>
          <div class="point-card"><strong>3</strong><span>Bonus por cada ronda que superen tus clubes.</span></div>
          <div class="point-card"><strong>4</strong><span>Bonus finales por campeón, subcampeón y pichichi.</span></div>
        </div>
      </section>
    </div>
  `;
}

function computeTeamScores() {
  const teamGroups = teamGroupMap();
  const publishedTeams = Object.entries(DATA.bombos || {}).map(([team, bombo]) => ({ team, bombo: Number(bombo) }));
  const teams = (publishedTeams.length ? publishedTeams : CANONICAL_TEAMS).map(({ team, bombo }) => ({
    team,
    bombo,
    group: teamGroups[cleanTeam(team)] || teamGroups[looseTeamKey(team)] || "",
    grupos: 0,
    ko_resultado: 0,
    ko_pase: 0,
    total: 0,
    reachedRounds: new Set(),
  }));
  const byName = {};
  teams.forEach((team) => {
    byName[cleanTeam(team.team)] = team;
    byName[looseTeamKey(team.team)] = team;
  });
  DATA.partidos.forEach((match) => {
    [match.home_team, match.away_team].forEach((teamName) => {
      const row = byName[cleanTeam(teamName)] || byName[looseTeamKey(teamName)];
      if (!row) return;
      const isLeague = match.ronda === "grupos" || String(match.ronda || "").startsWith("J");
      const [gf, gc] = goalsFor(match, teamName, !isLeague);
      const status = String(match.status || "").toUpperCase();
      const points = !isLeague && DRAW_AFTER_90_STATUSES.has(status)
        ? 1
        : resultPoints(gf, gc);
      if (isLeague) {
        row.grupos += points;
      } else if (SCORED_KO_ROUNDS.has(match.ronda)) {
        row.ko_resultado += points;
        if (match.ronda !== "R32" && !row.reachedRounds.has(match.ronda)) {
          row.reachedRounds.add(match.ronda);
          row.ko_pase += row.bombo;
        }
      }
      row.total = row.grupos + row.ko_resultado + row.ko_pase;
    });
  });
  return teams;
}

function selectionGroups() {
  return [...new Set(computeTeamScores().map((team) => team.group).filter(Boolean))].sort();
}

function teamGroupMap() {
  const groups = {};
  DATA.partidos
    .filter((match) => match.group)
    .forEach((match) => {
      groups[cleanTeam(match.home_team)] = match.group;
      groups[cleanTeam(match.away_team)] = match.group;
      groups[looseTeamKey(match.home_team)] = match.group;
      groups[looseTeamKey(match.away_team)] = match.group;
    });
  return groups;
}

function standings(group) {
  const rows = {};
  DATA.partidos.filter((match) => match.group === group).forEach((match) => {
    [match.home_team, match.away_team].forEach((team) => {
      if (!rows[team]) rows[team] = { team, PJ: 0, G: 0, E: 0, P: 0, GF: 0, GC: 0, DG: 0, Pts: 0 };
    });
    const hs = scoreValue(match.home_score);
    const as = scoreValue(match.away_score);
    if (hs === null || as === null) return;
    const home = rows[match.home_team];
    const away = rows[match.away_team];
    home.PJ++; away.PJ++;
    home.GF += hs; home.GC += as;
    away.GF += as; away.GC += hs;
    home.DG += hs - as;
    away.DG += as - hs;
    if (hs > as) { home.G++; home.Pts += 3; away.P++; }
    else if (as > hs) { away.G++; away.Pts += 3; home.P++; }
    else { home.E++; away.E++; home.Pts++; away.Pts++; }
  });
  return Object.values(rows).sort((a, b) =>
    b.Pts - a.Pts || b.DG - a.DG || b.GF - a.GF || a.team.localeCompare(b.team)
  );
}

function standingsWithTiebreak(rows) {
  return rows.sort((a, b) => {
    if (b.Pts !== a.Pts) return b.Pts - a.Pts;
    if (b.DG !== a.DG) return b.DG - a.DG;
    if (b.GF !== a.GF) return b.GF - a.GF;
    if (b.GA !== a.GA) return b.GA - a.GA;
    return a.team.localeCompare(b.team);
  });
}

function bindEvents() {
  const securePredictionForm = document.querySelector("[data-secure-prediction-form]");
  if (securePredictionForm) {
    const draftCount = Object.values(predictionDrafts).filter((score) => score.home_score !== undefined || score.away_score !== undefined).length;
    securePredictionForm.closest(".user-card")?.querySelector("h3")?.replaceChildren(predictionRoundLabel(predictionRound));
    const availableRounds = [...new Set(DATA.partidos
      .filter((match) => isPredictionRound(match.ronda))
      .map((match) => match.ronda))].sort((a, b) => predictionRoundOrder(a) - predictionRoundOrder(b));
    securePredictionForm.insertAdjacentHTML("afterbegin", `<div class="prediction-rounds" aria-label="Seleccionar fase">${availableRounds.map((round) => `<button class="filter ${predictionRound === round ? "active" : ""}" type="button" data-prediction-round="${escapeAttr(round)}">${escapeHtml(predictionRoundLabel(round))}</button>`).join("")}</div>`);
    securePredictionForm.insertAdjacentHTML("afterbegin", `<div class="prediction-bulk-actions"><span class="draft-summary" data-draft-summary>${draftCount ? `${draftCount} cambios sin guardar` : "Sin cambios pendientes"}</span><button class="secondary" type="button" data-random-all-predictions title="Generar marcadores aleatorios">🎲 <span>Rellenar jornada</span></button></div>`);
  }
  document.querySelectorAll("[data-prediction-round]").forEach((button) => {
    button.addEventListener("click", () => {
      predictionRound = button.dataset.predictionRound;
      render();
    });
  });
  document.querySelectorAll("[data-match-status]").forEach((button) => {
    button.addEventListener("click", () => {
      matchStatusFilter = button.dataset.matchStatus;
      render();
    });
  });
  document.querySelector("[data-random-all-predictions]")?.addEventListener("click", () => {
    const completed = Array.from(document.querySelectorAll("[data-secure-prediction-form] input:not(:disabled)")).some((input) => input.value !== "");
    if (completed && !window.confirm("Esto sustituirá los marcadores que ya has escrito. ¿Continuar?")) return;
    document.querySelectorAll("[data-secure-prediction-form] input:not(:disabled)").forEach((input) => {
      input.value = String(randomPredictionScore());
      input.dispatchEvent(new Event("input"));
    });
  });
  document.querySelectorAll("[data-random-prediction]").forEach((button) => {
    button.addEventListener("click", () => {
      const matchId = button.dataset.randomPrediction;
      document.querySelector(`[name="match-${matchId}-home"]`).value = String(randomPredictionScore());
      document.querySelector(`[name="match-${matchId}-away"]`).value = String(randomPredictionScore());
      predictionDrafts[matchId] = {
        home_score: Number(document.querySelector(`[name="match-${matchId}-home"]`).value),
        away_score: Number(document.querySelector(`[name="match-${matchId}-away"]`).value),
      };
      document.querySelector(`[data-save-prediction="${matchId}"]`).disabled = false;
    });
  });
  document.querySelectorAll("[data-secure-prediction-form] input[name^=match-]").forEach((input) => {
    input.addEventListener("input", () => {
      const [, matchId, side] = input.name.split("-");
      predictionDrafts[matchId] ||= {};
      predictionDrafts[matchId][side === "home" ? "home_score" : "away_score"] = input.value === "" ? "" : Number(input.value);
      input.closest(".prediction-row")?.classList.add("dirty");
      const home = document.querySelector(`[name="match-${matchId}-home"]`).value;
      const away = document.querySelector(`[name="match-${matchId}-away"]`).value;
      document.querySelector(`[data-save-prediction="${matchId}"]`).disabled = home === "" || away === "";
      const count = Object.keys(predictionDrafts).length;
      const summary = document.querySelector("[data-draft-summary]");
      if (summary) summary.textContent = `${count} cambio${count === 1 ? "" : "s"} sin guardar`;
    });
  });
  document.querySelectorAll("[data-save-prediction]").forEach((button) => {
    button.addEventListener("click", async () => {
      const matchId = button.dataset.savePrediction;
      const home = document.querySelector(`[name="match-${matchId}-home"]`)?.value;
      const away = document.querySelector(`[name="match-${matchId}-away"]`)?.value;
      if (home === "" || away === "") return alert("Completa los goles local y visitante antes de guardar este partido.");
      const { error } = await supabaseClient.rpc("save_prediction", {
        target_match_id: matchId, target_home_score: Number(home), target_away_score: Number(away),
      });
      if (error) return alert(`No se pudo guardar el pronóstico: ${error.message}`);
      await loadPrivateData();
      render();
    });
  });
  document.querySelectorAll("[data-auth-oauth]").forEach((button) => button.addEventListener("click", async () => {
    authBusyAction = button.dataset.authOauth;
    authNotice = "";
    render();
    const options = { redirectTo: PorraAuth.canonicalAuthRedirect() };
    if (button.dataset.authOauth === "azure") options.scopes = "email";
    const { error } = await supabaseClient.auth.signInWithOAuth({ provider: button.dataset.authOauth, options });
    if (error) { authBusyAction = ""; authNotice = "No se pudo iniciar el acceso con ese proveedor. Inténtalo de nuevo."; render(); }
  }));
  document.querySelector("[data-auth-toggle]")?.addEventListener("click", () => {
    authMode = authMode === "signup" ? "login" : "signup";
    authNotice = "";
    render();
  });
  document.querySelector("[data-auth-login]")?.addEventListener("click", () => { authMode = "login"; authNotice = ""; render(); });
  document.querySelector("[data-password-auth-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const email = form.email.value.trim();
    const password = form.password.value;
    if (!PorraAuth.validatePassword(password).valid) { authNotice = "La contraseña debe tener al menos 8 caracteres."; render(); return; }
    authBusyAction = "password";
    render();
    const response = authMode === "signup"
      ? await supabaseClient.auth.signUp({ email, password, options: { emailRedirectTo: PorraAuth.canonicalAuthRedirect() } })
      : await supabaseClient.auth.signInWithPassword({ email, password });
    authBusyAction = "";
    authNotice = response.error
      ? PorraAuth.authMessage("password-login-error")
      : authMode === "signup" ? PorraAuth.authMessage("password-signup-sent") : "";
    if (!response.error && authMode === "login") currentUser = response.data.user;
    render();
  });
  document.querySelector("[data-auth-reset]")?.addEventListener("click", () => {
    authMode = "reset-request";
    authNotice = "Introduce tu email y crea una contraseña nueva desde el correo que recibirás.";
    render();
  });
  document.querySelector("[data-password-reset-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    authBusyAction = "reset";
    render();
    const { error } = await supabaseClient.auth.resetPasswordForEmail(event.currentTarget.email.value.trim(), { redirectTo: PorraAuth.canonicalAuthRedirect() });
    authBusyAction = "";
    authNotice = error ? "No se pudo solicitar la recuperación. Inténtalo de nuevo." : PorraAuth.authMessage("password-reset-sent");
    render();
  });
  document.querySelector("[data-password-update-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.password.value !== form.confirm_password.value) { authNotice = "Las contraseñas no coinciden."; render(); return; }
    if (!PorraAuth.validatePassword(form.password.value).valid) { authNotice = "La contraseña debe tener al menos 8 caracteres."; render(); return; }
    authBusyAction = "update";
    render();
    const { error } = await supabaseClient.auth.updateUser({ password: form.password.value });
    authBusyAction = "";
    authNotice = error ? "No se pudo actualizar la contraseña. Solicita un enlace nuevo e inténtalo de nuevo." : PorraAuth.authMessage("password-updated");
    if (!error) authRecoveryMode = false;
    render();
  });
  document.querySelector("[data-secure-profile-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const alias = event.currentTarget.alias.value.trim();
    const { error } = await supabaseClient.from("profiles").upsert({ user_id: currentUser.id, alias });
    if (error) return alert(`No se pudo guardar el perfil: ${error.message}`);
    await loadPrivateData(); render();
  });
  document.querySelector("[data-secure-entry-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const entry = Object.fromEntries(["pot_1_team", "pot_2_team", "pot_3_team", "pot_4_team", "champion_team", "runner_up_team"].map((key) => [key, form[key].value.trim()]));
    const counts = Object.values(entry).reduce((map, team) => ({ ...map, [team]: (map[team] || 0) + 1 }), {});
    const player = playerCatalog.find((item) => `${item.full_name} — ${item.team_name}` === form.top_scorer.value.trim());
    const feedback = form.querySelector("[data-entry-feedback]");
    if (entry.champion_team === entry.runner_up_team) { feedback.hidden = false; feedback.textContent = "Campeón y subcampeón deben ser distintos."; return; }
    if (Object.values(counts).some((count) => count > 2)) { feedback.hidden = false; feedback.textContent = "Un mismo equipo solo puede elegirse dos veces."; return; }
    if (!player) { feedback.hidden = false; feedback.textContent = "Elige un Pichichi de la lista UEFA."; return; }
    const { error } = await supabaseClient.rpc("save_entry", { target_pot_1: entry.pot_1_team, target_pot_2: entry.pot_2_team, target_pot_3: entry.pot_3_team, target_pot_4: entry.pot_4_team, target_champion: entry.champion_team, target_runner_up: entry.runner_up_team, target_player_id: player.player_id });
    if (error) { feedback.hidden = false; feedback.textContent = "No se pudo confirmar la inscripción. Revisa tus elecciones e inténtalo de nuevo."; return; }
    await loadPrivateData(); render();
  });
  document.querySelector("[data-secure-sign-out]")?.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
  });
  document.querySelector("[data-secure-prediction-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const values = {};
    Array.from(event.currentTarget.elements).forEach((element) => {
      if (!element.name?.startsWith("match-") || element.value === "") return;
      const [, matchId, side] = element.name.split("-");
      values[matchId] ||= {};
      values[matchId][side] = Number(element.value);
    });
    const ready = Object.entries(values).filter(([, score]) => Number.isInteger(score.home) && Number.isInteger(score.away));
    if (!ready.length) return alert("Completa los goles local y visitante de al menos un partido antes de guardar.");
    const results = await Promise.all(ready.map(([matchId, score]) => supabaseClient.rpc("save_prediction", { target_match_id: matchId, target_home_score: score.home, target_away_score: score.away })));
    const error = results.find((result) => result.error)?.error;
    if (error) return alert(`No se pudieron guardar todos los pronósticos: ${error.message}`);
    await loadPrivateData(); render();
  });
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      activeTab = button.dataset.tab;
      render();
    });
  });

  document.querySelector("[data-registration-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const alias = form.alias.value.trim();
    const email = form.email.value.trim().toLowerCase();
    if (!alias || !email) return;
    const profile = { alias, email, user_id: `user::${email}` };
    localStorage.setItem("porra-demo-user", JSON.stringify(profile));
    localUser = profile;
    render();
  });

  document.querySelector("[data-user-reset]")?.addEventListener("click", () => {
    localStorage.removeItem("porra-demo-user");
    localUser = null;
    render();
  });

  document.querySelector("[data-prediction-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const user = localUser || loadStoredUser();
    if (!user) return;
    const predictions = {};
    Array.from(form.elements).forEach((element) => {
      if (!element.name || !element.name.startsWith("match-")) return;
      const matchId = Number(element.name.split("-")[1]);
      const field = element.name.split("-")[2];
      if (!predictions[matchId]) predictions[matchId] = {};
      predictions[matchId][field === "home" ? "home_score" : "away_score"] = element.value === "" ? null : Number(element.value);
    });
    Object.values(predictions).forEach((prediction) => { prediction.confirmed_at = new Date().toISOString(); });
    localStorage.setItem(`porra-demo-predictions-${user.email}`, JSON.stringify(predictions));
    localPredictions[user.email] = predictions;
    render();
  });
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      localStorage.setItem("porra-theme", next);
      applyTheme(next);
      render();
    });
  });
  document.querySelectorAll("[data-open]").forEach((button) => {
    button.addEventListener("click", () => {
      const alias = button.dataset.open;
      if (openAliases.has(alias)) openAliases.delete(alias);
      else openAliases.add(alias);
      render();
    });
  });
  document.querySelectorAll("[data-ranking-search]").forEach((input) => {
    input.addEventListener("input", () => {
      rankingSearch = input.value;
      restoreRankingSearchFocus = true;
      render();
    });
  });
  document.querySelectorAll("[data-ranking-mode]").forEach((button) => {
    button.addEventListener("click", () => { rankingMode = button.dataset.rankingMode; rankingSearch = ""; render(); });
  });
  document.querySelectorAll("[data-ranking-sort]").forEach((select) => {
    select.addEventListener("change", () => {
      rankingSort = select.value;
      render();
    });
  });
  document.querySelectorAll("[data-ranking-clear]").forEach((button) => {
    button.addEventListener("click", () => {
      rankingSearch = "";
      render();
    });
  });
  document.querySelectorAll("[data-ranking-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const participants = rankingParticipants();
      if (button.dataset.rankingToggle === "all") {
        openAliases = new Set(participants.map((participant) => participant.alias));
      } else {
        openAliases = new Set();
      }
      render();
    });
  });
  document.querySelectorAll("[data-history-alias]").forEach((button) => {
    button.addEventListener("click", () => {
      const alias = button.dataset.historyAlias;
      historyAllSelected = false;
      if (historyAliases.has(alias)) historyAliases.delete(alias);
      else historyAliases.add(alias);
      render();
    });
  });
  document.querySelectorAll("[data-history-action]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.historyAction === "all") {
        historyAllSelected = true;
      } else {
        historyAllSelected = false;
        historyAliases = new Set();
      }
      render();
    });
  });
  document.querySelectorAll("[data-history-focus]").forEach((series) => {
    const alias = series.dataset.historyFocus;
    series.addEventListener("mouseenter", () => {
      if (historyHoverAlias === alias) return;
      historyHoverAlias = alias;
      render();
    });
    series.addEventListener("mouseleave", () => {
      if (!historyHoverAlias) return;
      historyHoverAlias = "";
      render();
    });
    series.addEventListener("focus", () => {
      if (historyHoverAlias === alias) return;
      historyHoverAlias = alias;
      render();
    });
    series.addEventListener("blur", () => {
      if (!historyHoverAlias) return;
      historyHoverAlias = "";
      render();
    });
    series.addEventListener("click", () => {
      historyPinnedAlias = historyPinnedAlias === alias ? "" : alias;
      historyHoverAlias = "";
      render();
    });
    series.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      historyPinnedAlias = historyPinnedAlias === alias ? "" : alias;
      historyHoverAlias = "";
      render();
    });
  });
  document.querySelectorAll("[data-bombo]").forEach((button) => {
    button.addEventListener("click", () => {
      selectionBombo = Number(button.dataset.bombo);
      render();
    });
  });
  document.querySelectorAll("[data-selection-group]").forEach((button) => {
    button.addEventListener("click", () => {
      selectionGroup = button.dataset.selectionGroup;
      render();
    });
  });
  document.querySelectorAll("[data-group]").forEach((button) => {
    button.addEventListener("click", () => {
      groupFilter = button.dataset.group;
      render();
    });
  });
  document.querySelectorAll("[data-round]").forEach((button) => {
    button.addEventListener("click", () => {
      roundFilter = Number(button.dataset.round);
      render();
    });
  });
  document.querySelectorAll("[data-koround]").forEach((button) => {
    button.addEventListener("click", () => {
      koRound = button.dataset.koround;
      render();
    });
  });
}

function predictionScorePoints(prediction, match) {
  const kind = predictionScoreKind(prediction, match);
  if (kind === "miss") return 0;
  const [exactPoints, outcomePoints] = predictionScoreScale(match.ronda);
  return kind === "exact" ? exactPoints : outcomePoints;
}

function predictionScoreKind(prediction, match) {
  if (!prediction || prediction.home_score === undefined || prediction.away_score === undefined) return "miss";
  const home = Number(match.home_score_90 ?? match.home_score);
  const away = Number(match.away_score_90 ?? match.away_score);
  if (!Number.isFinite(home) || !Number.isFinite(away)) return "miss";
  const exact = Number(prediction.home_score) === home && Number(prediction.away_score) === away;
  const outcome = Math.sign(Number(prediction.home_score) - Number(prediction.away_score)) === Math.sign(home - away);
  return exact ? "exact" : outcome ? "outcome" : "miss";
}

function predictionScoreScale(round) {
  const scale = { R32: [3, 1], R16: [6, 2], QF: [8, 3], SF: [10, 4], F: [12, 5] };
  return scale[round] || [3, 1];
}

function isFinishedMatch(match) {
  return ["FT", "AET", "AOT", "AP", "PEN"].includes(String(match.status || "").toUpperCase());
}

function isPredictionOpen(match) {
  return Boolean(match.starts_at) && Date.now() < new Date(match.starts_at).getTime() - 60 * 60 * 1000;
}

function predictionClosingNotice(match, editable) {
  if (!editable || !match.starts_at) return "";
  const milliseconds = new Date(match.starts_at).getTime() - 60 * 60 * 1000 - Date.now();
  if (milliseconds <= 0 || milliseconds > 24 * 60 * 60 * 1000) return "";
  const hours = Math.floor(milliseconds / (60 * 60 * 1000));
  const minutes = Math.ceil((milliseconds % (60 * 60 * 1000)) / 60000);
  return `<span class="prediction-countdown">Cierra en ${hours} h ${minutes} min</span>`;
}

function formatLocalDateTime(value) {
  return new Date(value).toLocaleString("es-ES", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function isPredictionRound(round) {
  return /^J\d{2}$/.test(String(round || "")) || SCORED_KO_ROUNDS.has(round);
}

function predictionRoundOrder(round) {
  if (/^J\d{2}$/.test(String(round || ""))) return Number(String(round).slice(1));
  return 100 + (ROUND_ORDER[round] || 99);
}

function predictionRoundLabel(round) {
  return /^J\d{2}$/.test(String(round || ""))
    ? `Jornada ${Number(String(round).slice(1))}`
    : ROUND_LABEL[round] || String(round || "Partidos");
}

function randomPredictionScore() {
  const values = [0, 0, 0, 0, 1, 1, 1, 2, 2, 3, 4, 5];
  return values[Math.floor(Math.random() * values.length)];
}

function buttonFilter(kind, value, label, active) {
  return `<button class="filter ${String(active) === String(value) ? "active" : ""}" data-${kind}="${escapeAttr(value)}">${escapeHtml(label)}</button>`;
}

function resultPoints(gf, gc) {
  if (gf === null || gc === null) return 0;
  if (gf > gc) return 3;
  if (gf === gc) return 1;
  return 0;
}

function goalsFor(match, team, use90) {
  const home = scoreValue(use90 ? match.home_score_90 : match.home_score);
  const away = scoreValue(use90 ? match.away_score_90 : match.away_score);
  if (match.home_team === team) return [home, away];
  return [away, home];
}

function getBombo(team) {
  return BOMBO_MAP[cleanTeam(team)] || 0;
}

function cleanTeam(team) {
  return String(team || "").replace(/\*+/g, "").trim();
}

function looseTeamKey(team) {
  return cleanTeam(team)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function teamLabel(team, showCompetitionStatus = false) {
  const cleaned = cleanTeam(team);
  const display = displayTeamName(cleaned);
  const code = FLAGS[cleaned] || FLAGS[display] || FLAGS[String(team || "")];
  const suffix = String(team || "").includes("**") ? "**" : String(team || "").includes("*") ? "*" : "";
  const badge = DATA?.meta?.team_badges?.[cleaned];
  const flag = badge
    ? `<img class="flag" src="${escapeAttr(badge)}" alt="" onerror="this.remove()">`
    : code ? `<img class="flag" src="https://flagcdn.com/w40/${code}.png" alt="">` : "";
  const competitionStatus = showCompetitionStatus ? teamCompetitionStatus(team) : "";
  const statusIcon = competitionStatus === "alive"
    ? `<span class="competition-status alive" role="img" aria-label="Sigue en competición">✓</span>`
    : competitionStatus === "eliminated"
      ? `<span class="competition-status eliminated" role="img" aria-label="Eliminada">×</span>`
      : "";
  return `<span class="team-label">${flag}<span>${escapeHtml(display)}${suffix}</span>${statusIcon}</span>`;
}

function teamCompetitionStatus(team) {
  const knockoutMatches = DATA.partidos.filter((match) => SCORED_KO_ROUNDS.has(match.ronda));
  if (!knockoutMatches.length) return "";

  const teamKey = looseTeamKey(team);
  const teamMatches = knockoutMatches.filter((match) =>
    [match.home_team, match.away_team].some((name) => looseTeamKey(name) === teamKey)
  );
  if (!teamMatches.length) return "eliminated";

  const latestRound = Math.max(...teamMatches.map((match) => ROUND_ORDER[match.ronda] || 0));
  const latestMatch = teamMatches.find((match) => (ROUND_ORDER[match.ronda] || 0) === latestRound);
  const status = String(latestMatch.status || "").toUpperCase();
  if (!["FT", "AET", "AOT", "AP", "PEN"].includes(status)) return "alive";

  if (latestMatch.pasa) {
    return looseTeamKey(latestMatch.pasa) === teamKey ? "alive" : "eliminated";
  }

  const homeScore = scoreValue(latestMatch.home_score);
  const awayScore = scoreValue(latestMatch.away_score);
  if (homeScore === null || awayScore === null || homeScore === awayScore) return "";
  const winner = homeScore > awayScore ? latestMatch.home_team : latestMatch.away_team;
  return looseTeamKey(winner) === teamKey ? "alive" : "eliminated";
}

function displayTeamName(team) {
  const key = looseTeamKey(team);
  return DISPLAY_NAMES[key] || team;
}

function scoreValue(value) {
  return value === null || value === undefined || value === "" ? null : Number(value);
}

function groupBy(items, fn) {
  return items.reduce((acc, item) => {
    const key = fn(item);
    (acc[key] = acc[key] || []).push(item);
    return acc;
  }, {});
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

function normalizeSearch(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function initialTheme() {
  const stored = localStorage.getItem("porra-theme");
  if (stored) return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

function themeLabel() {
  return document.documentElement.dataset.theme === "dark" ? "Modo claro" : "Modo oscuro";
}
