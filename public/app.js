const TABS = [
  ["porra", "Clasificación"],
  ["usuario", "Mi usuario"],
  ["reglas", "Reglas"],
  ["selecciones", "Clubes"],
  ["bombos", "Bombos"],
  ["partidos", "Jornadas"],
  ["elim", "Eliminatorias"],
];

const BOMBOS = [
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

const BOMBO_MAP = Object.fromEntries(
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
const CANONICAL_TEAMS = BOMBOS.flatMap((row) =>
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
let localUser = null;
let localPredictions = {};
let localProfiles = [];
let openAliases = new Set();
let rankingSearch = "";
let rankingSort = "rank";
let historyAliases = new Set();
let historyAllSelected = true;
let historyHoverAlias = "";
let historyPinnedAlias = "";
let restoreRankingSearchFocus = false;
let selectionBombo = 0;
let selectionGroup = "";
let groupFilter = "";
let roundFilter = 0;
let koRound = "R32";

applyTheme(initialTheme());

fetch("datos.json")
  .then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then((data) => {
    DATA = normalizePayload(data);
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

function normalizePayload(data) {
  return {
    meta: data.meta || {},
    bombos: data.bombos || {},
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
  const editable = true;
  const home = existing?.home_score ?? "";
  const away = existing?.away_score ?? "";
  return `
    <div class="prediction-row">
      <div>
        <strong>${escapeHtml(match.home_team)}</strong>
        <span>vs</span>
        <strong>${escapeHtml(match.away_team)}</strong>
        <div class="muted">${escapeHtml(match.fecha)} · ${escapeHtml(match.ronda)}</div>
      </div>
      <div class="prediction-scores">
        <label>
          <span>Local</span>
          <input name="match-${match.matchid}-home" type="number" min="0" max="10" value="${home}" />
        </label>
        <label>
          <span>Visitante</span>
          <input name="match-${match.matchid}-away" type="number" min="0" max="10" value="${away}" />
        </label>
      </div>
      <div class="prediction-status ${editable ? "editable" : "locked"}">${editable ? "Editable" : "Bloqueado"}</div>
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
  if (!DATA.participantes.length) return `<div class="empty">Todavía no hay participantes publicados.</div>`;
  const participants = rankingParticipants();
  return `
    <div class="ranking-title">
      <div>
        <h2>Ranking</h2>
        <p class="section-note">Ordena, busca y compara participantes. La clasificación general usa criterios UEFA de desempate: puntos, diferencia de goles, goles a favor y, si sigue el empate, mejor resultado en enfrentamientos directos.</p>
      </div>
    </div>
    ${rankingToolbar(participants)}
    ${participants.length ? `<div class="stack">${participants.map((participant, index) => renderParticipant(participant, index)).join("")}</div>` : `<div class="empty">No hay participantes con ese filtro.</div>`}
    ${renderRankingHistory(participants)}
  `;
}

function renderParticipant(participant, index) {
  const breakdown = participant.desglose || {};
  const isOpen = openAliases.has(participant.alias);
  const rank = participant.rank_actual || index + 1;
  return `
    <article class="ranking-card ${isOpen ? "open" : ""}">
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
    .filter((match) => !roundFilter || Number(match.roundnumber) === Number(roundFilter));
  const byDate = groupBy(matches, (match) => match.fecha || "Sin fecha");
  return `
    <div class="toolbar">
      <span class="toolbar-label">Jornada</span>
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((round) => buttonFilter("round", String(round), round ? `J${round}` : "Todas", String(roundFilter))).join("")}
    </div>
    ${matches.length ? Object.entries(byDate).map(([date, rows]) => `
      <div class="date-title">${escapeHtml(date)}</div>
      <div class="stack">${rows.map(renderMatchRow).join("")}</div>
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
  return `
    <div class="match-row">
      <div class="match-date">${escapeHtml(match.fecha || "")}<br>${escapeHtml(location)}</div>
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
    <div class="rules">
      <section class="rules-hero">
        <div>
          <h2>Reglas de la porra</h2>
          <p>Elige cuatro clubes, uno por bombo, y suma puntos según sus resultados en la fase liga y eliminatorias. Esta publicación usa la temporada histórica UEFA 2025/26 como referencia verificable.</p>
          <p>Las fechas, formulario y condiciones de una edición futura se publicarán antes de abrir inscripciones.</p>
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
        <p>Tus cuatro clubes suman puntos en las ocho jornadas de fase liga y en eliminatorias. En eliminatorias solo cuenta el marcador a los 90 minutos.</p>
        <div class="points-grid">
          <div class="point-card"><strong>3</strong><span>Victoria</span></div>
          <div class="point-card"><strong>1</strong><span>Empate</span></div>
          <div class="point-card"><strong>0</strong><span>Derrota</span></div>
        </div>
        <p style="margin-top:12px">La prórroga y los penaltis no cambian los puntos por resultado. Si tu selección empata a los 90 minutos y gana en penaltis, suma 1 punto por el partido.</p>
      </section>

      <section class="rules-block rules-half">
        <h2>Rondas con bonus</h2>
        <ul>
          <li>Play-offs eliminatorios.</li>
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
        if (!row.reachedRounds.has(match.ronda)) {
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
  const flag = code ? `<img class="flag" src="https://flagcdn.com/w40/${code}.png" alt="">` : "";
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
