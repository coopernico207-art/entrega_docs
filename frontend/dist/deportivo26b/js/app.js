/* COBAT ESTATAL DEPORTIVO 2026 LOGIC WITH PROMINENT DAY/DATE DISPLAY */
document.addEventListener("DOMContentLoaded", () => {
  const DATA = window.DEPORTIVO26_DATA;
  if (!DATA) { console.error("No se encontro DEPORTIVO26_DATA"); return; }

  // Update counters on stats cards if present
  const elTotalPartidos = document.getElementById("stat-total-partidos");
  if (elTotalPartidos) elTotalPartidos.textContent = DATA.partidos.length;

  const elTotalAtletismo = document.getElementById("stat-total-atletismo");
  if (elTotalAtletismo) elTotalAtletismo.textContent = DATA.atletismo.length;

  const elTotalPlanteles = document.getElementById("stat-total-planteles");
  if (elTotalPlanteles) elTotalPlanteles.textContent = DATA.planteles.length;

  function getSportEmoji(deporte) {
    switch (deporte) {
      case "Fútbol": return "⚽";
      case "Voleibol": return "🏐";
      case "Basquetbol": return "🏀";
      case "Tochito": return "🏈";
      case "Atletismo": return "🏃";
      default: return "🏆";
    }
  }

  function getFormattedDay(p) {
    if (p.fecha_corta === "29/09") return "Martes 29/09";
    if (p.fecha_corta === "30/09") return "Miércoles 30/09";
    if (p.fecha_corta === "01/10") return "Jueves 01/10";
    if (p.dia) {
      const parts = p.dia.split(" de ");
      return parts[0]; // ej. "Martes 29"
    }
    return p.fecha_corta || "";
  }

  // --- MATCHES & SEPARATED SPORT/STAGE/DAY FILTERING (FOR DEPORTES.HTML) ---
  const matchesContainer = document.getElementById("matches-container");
  const searchInput = document.getElementById("search-input");
  const filterDeporteRama = document.getElementById("filter-deporte-rama");
  const filterDia = document.getElementById("filter-dia");
  const filterEtapa = document.getElementById("filter-etapa");
  const filterGrupo = document.getElementById("filter-grupo");
  const btnReset = document.getElementById("btn-reset-filters");
  const resultsCount = document.getElementById("results-count");
  const pillBtns = document.querySelectorAll(".pill-btn");

  let activePillCategory = "ALL";

  function renderMatches() {
    if (!matchesContainer) return;

    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const depRamaVal = filterDeporteRama ? filterDeporteRama.value : "";
    const diaVal = filterDia ? filterDia.value : "";
    const etapaVal = filterEtapa ? filterEtapa.value : "";
    const grupoVal = filterGrupo ? filterGrupo.value : "";

    const filtered = DATA.partidos.filter(p => {
      // 1. Filter by Deporte & Rama combined selector
      if (depRamaVal) {
        const [dep, rama] = depRamaVal.split("|");
        if (p.deporte !== dep || p.rama !== rama) return false;
      }

      // 2. Filter by Día
      if (diaVal && p.fecha_corta !== diaVal) return false;

      // 3. Filter by Quick Pill Category
      if (activePillCategory !== "ALL") {
        if (activePillCategory === "FINALES") {
          if (!["Final", "Serie Final", "3er Lugar"].includes(p.grupo)) return false;
        } else if (p.deporte !== activePillCategory) {
          return false;
        }
      }

      // 4. Filter by Etapa (Partidos de Grupos / Semifinales / Finales)
      if (etapaVal) {
        if (etapaVal === "GRUPOS") {
          if (["Final", "3er Lugar", "Serie Final"].includes(p.grupo)) return false;
        } else if (etapaVal === "3ER_LUGAR") {
          if (p.grupo !== "3er Lugar") return false;
        } else if (etapaVal === "FINALES") {
          if (!["Final", "Serie Final", "3er Lugar"].includes(p.grupo)) return false;
        }
      }

      // 5. Filter by Grupo Específico
      if (grupoVal && !p.grupo.includes(grupoVal)) return false;

      // 6. Search query (text match)
      if (query) {
        const textToSearch = (p.equipo1 + " " + p.equipo2 + " " + p.cancha + " " + p.deporte + " " + p.rama + " " + p.dia + " " + p.fecha_corta + " " + p.grupo + " " + (p.notas || "")).toLowerCase();
        if (!textToSearch.includes(query)) return false;
      }

      return true;
    });

    if (resultsCount) {
      resultsCount.innerHTML = `Mostrando <strong>${filtered.length}</strong> de ${DATA.partidos.length} partidos`;
    }

    if (filtered.length === 0) {
      matchesContainer.innerHTML = '<div style="text-align:center; padding:40px; background:white; border-radius:16px; border:1px solid #E5E7EB;"><div style="font-size:40px; margin-bottom:10px;">🔍</div><h3 style="font-size:18px; color:#111827; font-weight:800;">No se encontraron partidos</h3><p style="color:#6B7280; font-size:14px; margin-top:4px;">Intenta ajustando o limpiando los filtros de búsqueda.</p></div>';
      return;
    }

    let html = '<div class="matches-grid">';
    filtered.forEach(p => {
      const emoji = getSportEmoji(p.deporte);
      const dayText = getFormattedDay(p);
      const notasHtml = p.notas ? ('<div class="match-notes">⚠️ ' + p.notas + '</div>') : '';
      
      html += '<div class="match-card"><div><div class="match-card-header"><span class="sport-badge">' + emoji + ' ' + p.deporte + ' ' + p.rama + '</span><span class="group-badge">' + p.grupo + '</span></div><div class="match-teams-horizontal"><span class="team-name-inline">' + p.equipo1 + '</span><span class="vs-inline">VS</span><span class="team-name-inline">' + p.equipo2 + '</span></div>' + notasHtml + '</div><div class="match-card-footer"><div class="datetime-group"><span class="date-badge">📅 ' + dayText + '</span><span class="time-badge">🕒 ' + p.hora + ' HRS</span></div><span class="venue-badge">📍 ' + p.cancha + '</span></div></div>';
    });
    html += '</div>';
    matchesContainer.innerHTML = html;
  }

  if (matchesContainer) {
    if (searchInput) searchInput.addEventListener("input", renderMatches);
    if (filterDeporteRama) filterDeporteRama.addEventListener("change", renderMatches);
    if (filterDia) filterDia.addEventListener("change", renderMatches);
    if (filterEtapa) filterEtapa.addEventListener("change", renderMatches);
    if (filterGrupo) filterGrupo.addEventListener("change", renderMatches);

    pillBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        pillBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activePillCategory = btn.getAttribute("data-pill");
        renderMatches();
      });
    });

    if (btnReset) {
      btnReset.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        if (filterDeporteRama) filterDeporteRama.value = "";
        if (filterDia) filterDia.value = "";
        if (filterEtapa) filterEtapa.value = "";
        if (filterGrupo) filterGrupo.value = "";
        activePillCategory = "ALL";
        pillBtns.forEach(b => b.classList.remove("active"));
        const firstPill = document.querySelector('.pill-btn[data-pill="ALL"]');
        if (firstPill) firstPill.classList.add("active");
        renderMatches();
      });
    }
    renderMatches();
  }

  // --- RENDER ALL ATLETISMO CARDS DIRECTLY ---
  const atletismoContainer = document.getElementById("atletismo-container");
  if (atletismoContainer) {
    let html = "";
    DATA.atletismo.forEach(ev => {
      const atlStr = ev.atletas ? ('<span>👥 Atletas: <strong>' + ev.atletas + '</strong></span>') : '';
      html += '<div class="atletismo-card"><div style="display:flex; align-items:center; gap:16px;"><div class="atletismo-code">' + ev.num_evento + '</div><div class="atletismo-main"><div class="atletismo-title">' + ev.prueba + '</div><div class="atletismo-meta"><span>🏃 Rama: <strong>' + ev.rama + '</strong></span><span>📋 Fase: <strong>' + ev.fase + '</strong></span>' + atlStr + '</div></div></div><div style="text-align:right;"><span class="sport-badge">' + ev.tipo + '</span><div style="font-size:14px; font-weight:800; color:#ab0033; margin-top:6px;">📅 ' + ev.fecha_corta + ' • 🕒 ' + ev.hora + ' HRS</div><div style="font-size:11px; color:#6B7280; font-weight:600;">📍 ' + ev.lugar + '</div></div></div>';
    });
    atletismoContainer.innerHTML = html;
  }

  // --- RENDER PLANTELES DIRECTLY ---
  const plantelesContainer = document.getElementById("planteles-container");
  if (plantelesContainer) {
    let html = '<div class="planteles-grid">';
    DATA.planteles.forEach(p => {
      const matchesCount = DATA.partidos.filter(m => m.equipo1.includes(p) || m.equipo2.includes(p)).length;
      html += '<div class="plantel-card"><div class="plantel-icon">🏫</div><div class="plantel-name">' + p + '</div><div style="font-size:12px; color:#6B7280; font-weight:700; margin-top:6px;">🏆 ' + matchesCount + ' Partidos Asignados</div></div>';
    });
    html += '</div>';
    plantelesContainer.innerHTML = html;
  }
});