// ==========================================================
// MÓDULO UNIVERSIDAD: CONTROL ACADÉMICO, MATERIAS Y CALIFICACIONES
// ==========================================================

export const INITIAL_UNIVERSIDAD_DATA = [
  {
    id: 'sem_2026_1',
    semestre_id: '2026-1',
    nombre_semestre: 'Semestre 2026-1',
    activo: true,
    materias: [
      {
        id: 'mat_1',
        nombre: 'Cálculo Multivariado',
        codigo: 'MAT-201',
        creditos: 3,
        profesor: 'Ing. Carlos Mendoza',
        evaluaciones: [
          { id: 'ev_1', nombre: 'Primer Parcial', porcentaje: 25, nota: 3.5 },
          { id: 'ev_2', nombre: 'Talleres y Quices', porcentaje: 15, nota: 4.2 },
          { id: 'ev_3', nombre: 'Segundo Parcial', porcentaje: 25, nota: 2.8 },
          { id: 'ev_4', nombre: 'Proyecto Aplicado', porcentaje: 15, nota: null },
          { id: 'ev_5', nombre: 'Examen Final', porcentaje: 20, nota: null }
        ]
      },
      {
        id: 'mat_2',
        nombre: 'Programación Web Full Stack',
        codigo: 'INF-302',
        creditos: 4,
        profesor: 'Dra. Elena Gómez',
        evaluaciones: [
          { id: 'ev_21', nombre: 'Primer Corte (Frontend)', porcentaje: 30, nota: 4.5 },
          { id: 'ev_22', nombre: 'Segundo Corte (Backend & APIs)', porcentaje: 30, nota: 4.0 },
          { id: 'ev_23', nombre: 'Proyecto Final & Sustentación', porcentaje: 40, nota: null }
        ]
      },
      {
        id: 'mat_3',
        nombre: 'Física de Ondas y Campos',
        codigo: 'FIS-204',
        creditos: 3,
        profesor: 'Dr. Roberto Silva',
        evaluaciones: [
          { id: 'ev_31', nombre: 'Laboratorios Prácticos', porcentaje: 20, nota: 3.8 },
          { id: 'ev_32', nombre: 'Primer Parcial', porcentaje: 25, nota: 2.6 },
          { id: 'ev_33', nombre: 'Segundo Parcial', porcentaje: 25, nota: null },
          { id: 'ev_34', nombre: 'Examen Final Acumulativo', porcentaje: 30, nota: null }
        ]
      }
    ]
  }
];

export const INITIAL_CALCULADORA_ROWS = [
  { id: 'calc_1', nombre: 'Primer Corte / Parcial 1', porcentaje: 30, nota: 3.5 },
  { id: 'calc_2', nombre: 'Segundo Corte / Parcial 2', porcentaje: 30, nota: 2.8 },
  { id: 'calc_3', nombre: 'Examen Final / Proyecto', porcentaje: 40, nota: null }
];

// ==========================================================
// CÁLCULOS MATEMÁTICOS DE CALIFICACIONES (ESCALA 0.0 - 5.0 | APROBACIÓN: 3.0)
// ==========================================================

export function calcularMetricasMateria(materia, notaMinima = 3.0) {
  const evaluaciones = materia.evaluaciones || [];
  
  let totalConfiguradoPct = 0;
  let evaluadoPct = 0;
  let acumulado = 0;

  evaluaciones.forEach(ev => {
    const pct = Number(ev.porcentaje) || 0;
    totalConfiguradoPct += pct;

    if (ev.nota !== null && ev.nota !== undefined && ev.nota !== '' && !isNaN(Number(ev.nota))) {
      const n = Math.min(5.0, Math.max(0.0, Number(ev.nota)));
      evaluadoPct += pct;
      acumulado += (n * pct) / 100;
    }
  });

  const pendientePct = Math.max(0, 100 - evaluadoPct);
  const promedioEvaluado = evaluadoPct > 0 ? (acumulado / (evaluadoPct / 100)) : 0;
  
  let notaNecesaria = null;
  let estado = 'en_curso'; // 'aprobada', 'viable', 'exigente', 'inalcanzable', 'reprobada'
  let mensaje = '';

  if (acumulado >= notaMinima) {
    notaNecesaria = 0.0;
    estado = 'aprobada';
    mensaje = `¡Materia Aprobada! Ya acumulaste ${acumulado.toFixed(2)} sobre ${notaMinima.toFixed(1)}.`;
  } else if (pendientePct <= 0) {
    if (acumulado >= notaMinima) {
      estado = 'aprobada';
      notaNecesaria = 0.0;
      mensaje = `Materia Aprobada con nota final de ${acumulado.toFixed(2)}.`;
    } else {
      estado = 'reprobada';
      notaNecesaria = null;
      mensaje = `Materia Reprobada con nota final de ${acumulado.toFixed(2)} (Mínimo requerido: ${notaMinima.toFixed(1)}).`;
    }
  } else {
    const puntosFaltantes = notaMinima - acumulado;
    const req = puntosFaltantes / (pendientePct / 100);

    if (req <= 0) {
      notaNecesaria = 0.0;
      estado = 'aprobada';
      mensaje = `¡Garantizada! Ya tienes ${acumulado.toFixed(2)} y alcanzas la nota mínima.`;
    } else if (req <= 3.5) {
      notaNecesaria = req;
      estado = 'viable';
      mensaje = `Necesitas sacar al menos ${req.toFixed(2)} en el ${pendientePct}% restante para aprobar con ${notaMinima.toFixed(1)}.`;
    } else if (req <= 5.0) {
      notaNecesaria = req;
      estado = 'exigente';
      mensaje = `Exigente: Necesitas ${req.toFixed(2)} en el ${pendientePct}% restante para alcanzar ${notaMinima.toFixed(1)}.`;
    } else {
      notaNecesaria = req;
      estado = 'inalcanzable';
      const maximoAlcanzable = acumulado + (5.0 * pendientePct / 100);
      mensaje = `Alerta: Matemáticamente se requiere ${req.toFixed(2)} (> 5.0). La nota máxima posible al 100% es ${maximoAlcanzable.toFixed(2)}.`;
    }
  }

  return {
    totalConfiguradoPct,
    evaluadoPct,
    pendientePct,
    acumulado: Number(acumulado.toFixed(2)),
    promedioEvaluado: Number(promedioEvaluado.toFixed(2)),
    notaNecesaria: notaNecesaria !== null ? Number(notaNecesaria.toFixed(2)) : null,
    estado,
    mensaje
  };
}

export function calcularMetricasSemestre(semestre) {
  const materias = (semestre && semestre.materias) ? semestre.materias : [];
  let totalCreditos = 0;
  let sumaPonderada = 0;
  let creditosEvaluados = 0;
  let aprobadas = 0;
  let enRiesgo = 0;

  materias.forEach(mat => {
    const cred = Number(mat.creditos) || 3;
    totalCreditos += cred;
    const m = calcularMetricasMateria(mat);

    if (m.estado === 'aprobada') {
      aprobadas++;
    } else if (m.estado === 'inalcanzable' || m.estado === 'reprobada' || (m.notaNecesaria && m.notaNecesaria > 4.2)) {
      enRiesgo++;
    }

    if (m.evaluadoPct > 0) {
      sumaPonderada += m.promedioEvaluado * cred;
      creditosEvaluados += cred;
    }
  });

  const promedioPonderadoSemestre = creditosEvaluados > 0 
    ? Number((sumaPonderada / creditosEvaluados).toFixed(2))
    : 0.0;

  return {
    totalMaterias: materias.length,
    totalCreditos,
    aprobadas,
    enRiesgo,
    promedioPonderadoSemestre
  };
}

// ==========================================================
// RENDERIZADO DE VISTAS UNIVERSITARIAS
// ==========================================================

export function renderUniSemestres(state, callbacks) {
  const selectSem = document.getElementById('uniSemestreSelect');
  const gridMaterias = document.getElementById('uniMateriasGrid');
  const avgEl = document.getElementById('uniPromedioSemestre');
  const totalMatEl = document.getElementById('uniTotalMaterias');
  const aprobadasEl = document.getElementById('uniMateriasAprobadas');
  const riesgoEl = document.getElementById('uniMateriasRiesgo');
  const creditosEl = document.getElementById('uniTotalCreditos');

  if (!gridMaterias) return;

  const semestres = state.universidadData || [];
  if (semestres.length === 0) {
    gridMaterias.innerHTML = `<div class="col-span-full p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400">No hay semestres registrados. Crea tu primer semestre arriba.</div>`;
    return;
  }

  // Poblar selector de semestre
  if (selectSem) {
    selectSem.innerHTML = semestres.map(s => `
      <option value="${s.id}" ${s.id === state.activeSemestreId ? 'selected' : ''}>${s.nombre_semestre}</option>
    `).join('');
  }

  let semestreActual = semestres.find(s => s.id === state.activeSemestreId) || semestres[0];
  state.activeSemestreId = semestreActual.id;

  // Calcular métricas del semestre
  const metSem = calcularMetricasSemestre(semestreActual);

  if (avgEl) {
    avgEl.textContent = metSem.promedioPonderadoSemestre.toFixed(2);
    if (metSem.promedioPonderadoSemestre >= 3.8) {
      avgEl.className = 'text-3xl font-extrabold font-mono text-emerald-400';
    } else if (metSem.promedioPonderadoSemestre >= 3.0) {
      avgEl.className = 'text-3xl font-extrabold font-mono text-cyan-400';
    } else {
      avgEl.className = 'text-3xl font-extrabold font-mono text-amber-400';
    }
  }
  if (totalMatEl) totalMatEl.textContent = metSem.totalMaterias;
  if (aprobadasEl) aprobadasEl.textContent = metSem.aprobadas;
  if (riesgoEl) riesgoEl.textContent = metSem.enRiesgo;
  if (creditosEl) creditosEl.textContent = metSem.totalCreditos + ' cr';

  // Renderizar materias
  const materias = semestreActual.materias || [];
  if (materias.length === 0) {
    gridMaterias.innerHTML = `
      <div class="col-span-full p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 space-y-3">
        <p>Aún no tienes materias registradas en este semestre.</p>
        <button onclick="window.abrirModalNuevaMateria()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow">
          + Agregar Primera Materia
        </button>
      </div>
    `;
    return;
  }

  gridMaterias.innerHTML = materias.map(mat => {
    const m = calcularMetricasMateria(mat);
    
    let badgeClass = 'bg-cyan-950 text-cyan-300 border-cyan-700/50';
    let badgeText = `En Curso (${m.evaluadoPct}%)`;
    let barColor = 'linear-gradient(90deg, #06b6d4, #3b82f6)';
    let highlightColor = '#38bdf8';

    if (m.estado === 'aprobada') {
      badgeClass = 'bg-emerald-950 text-emerald-300 border-emerald-700/50';
      badgeText = '✓ Aprobada';
      barColor = 'linear-gradient(90deg, #10b981, #059669)';
      highlightColor = '#34d399';
    } else if (m.estado === 'exigente') {
      badgeClass = 'bg-amber-950 text-amber-300 border-amber-700/50';
      badgeText = 'Exigente';
      barColor = 'linear-gradient(90deg, #f59e0b, #d97706)';
      highlightColor = '#fbbf24';
    } else if (m.estado === 'inalcanzable' || m.estado === 'reprobada') {
      badgeClass = 'bg-rose-950 text-rose-300 border-rose-700/50';
      badgeText = '⚠️ En Riesgo';
      barColor = 'linear-gradient(90deg, #ef4444, #b91c1c)';
      highlightColor = '#f87171';
    }

    return `
      <div class="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 shadow-xl flex flex-col justify-between space-y-4 transition-all">
        <div>
          <div class="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold text-white tracking-tight">${mat.nombre}</h3>
                <span class="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">${mat.codigo || 'MAT'}</span>
              </div>
              <p class="text-[11px] text-slate-400 mt-0.5">
                ${mat.creditos || 3} Créditos • ${mat.profesor ? mat.profesor : 'Docente sin asignar'}
              </p>
            </div>
            <span class="text-[11px] font-bold px-2 py-0.5 rounded-full border ${badgeClass} shrink-0">
              ${badgeText}
            </span>
          </div>

          <!-- Métricas de Avance Evaluativo -->
          <div class="pt-3 space-y-2">
            <div class="flex items-center justify-between text-xs font-mono">
              <span class="text-slate-400">Acumulado Actual:</span>
              <span class="font-bold text-base" style="color: ${highlightColor}">${m.acumulado.toFixed(2)} <span class="text-[10px] text-slate-500">/ 5.0</span></span>
            </div>

            <!-- Barra de Avance Evaluativo -->
            <div class="space-y-1">
              <div class="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Evaluado: <strong>${m.evaluadoPct}%</strong></span>
                <span>Pendiente: <strong>${m.pendientePct}%</strong></span>
              </div>
              <div style="background-color: #0b132b; height: 10px; border-radius: 9999px; overflow: hidden; border: 1px solid #334155; padding: 1px;">
                <div style="height: 100%; border-radius: 9999px; width: ${Math.min(100, Math.max(0, m.evaluadoPct))}%; background: ${barColor}; transition: width 0.5s ease;"></div>
              </div>
            </div>

            <!-- Proyección para Aprobar con 3.0 -->
            <div class="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-[11px] text-slate-300 space-y-0.5">
              <div class="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                <span>Meta Mínima: 3.0</span>
                <span>${m.estado === 'aprobada' ? '<span class="text-emerald-400 font-bold">¡Aprobada!</span>' : (m.notaNecesaria !== null ? `Req: <strong>${m.notaNecesaria.toFixed(2)}</strong>` : '')}</span>
              </div>
              <p class="text-[11px] text-slate-300 italic">${m.mensaje}</p>
            </div>
          </div>
        </div>

        <!-- Botones de Acción -->
        <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <button onclick="window.irACalificacionesMateria('${mat.id}')" class="flex-1 py-1.5 px-2.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white text-xs font-semibold border border-indigo-500/40 transition-all flex items-center justify-center gap-1.5">
            <i data-lucide="award" class="w-3.5 h-3.5"></i>
            <span>Ver Calificaciones</span>
          </button>
          <button onclick="window.eliminarMateria('${mat.id}')" class="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700/60 transition-colors" title="Eliminar Materia">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

export function renderUniCalificaciones(state, callbacks) {
  const selectMateria = document.getElementById('uniCalificacionesMateriaSelect');
  const containerDetalle = document.getElementById('uniDetalleMateriaContainer');
  if (!containerDetalle) return;

  const semestres = state.universidadData || [];
  const semestreActual = semestres.find(s => s.id === state.activeSemestreId) || semestres[0];
  if (!semestreActual || !semestreActual.materias || semestreActual.materias.length === 0) {
    containerDetalle.innerHTML = `
      <div class="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 space-y-3">
        <p>No hay materias disponibles para calificar en este semestre.</p>
        <button onclick="window.switchTab('uni-semestres')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow">
          Ir a Semestres y Materias
        </button>
      </div>
    `;
    return;
  }

  // Poblar dropdown de materias
  if (selectMateria) {
    selectMateria.innerHTML = semestreActual.materias.map(m => `
      <option value="${m.id}" ${m.id === state.activeMateriaId ? 'selected' : ''}>${m.nombre} (${m.codigo || 'MAT'})</option>
    `).join('');
  }

  let materia = semestreActual.materias.find(m => m.id === state.activeMateriaId) || semestreActual.materias[0];
  state.activeMateriaId = materia.id;

  const met = calcularMetricasMateria(materia);
  const evaluaciones = materia.evaluaciones || [];

  // Tarjeta de Proyección y Alerta
  let bannerBg = 'from-indigo-950/80 via-slate-900 to-cyan-950/60 border-cyan-500/40';
  let bannerIcon = '🎯';
  let bannerTitulo = 'En Seguimiento Académico';
  if (met.estado === 'aprobada') {
    bannerBg = 'from-emerald-950/80 via-slate-900 to-emerald-900/60 border-emerald-500/40';
    bannerIcon = '🏆';
    bannerTitulo = '¡Materia Aprobada con Éxito!';
  } else if (met.estado === 'exigente') {
    bannerBg = 'from-amber-950/80 via-slate-900 to-amber-900/60 border-amber-500/40';
    bannerIcon = '⚡';
    bannerTitulo = 'Requiere Rendimiento Alto';
  } else if (met.estado === 'inalcanzable' || met.estado === 'reprobada') {
    bannerBg = 'from-rose-950/80 via-slate-900 to-rose-900/60 border-rose-500/40';
    bannerIcon = '⚠️';
    bannerTitulo = 'Alerta Máxima de Riesgo';
  }

  containerDetalle.innerHTML = `
    <!-- BANNER DE ESTADO Y PROYECCIÓN -->
    <div class="bg-gradient-to-r ${bannerBg} border rounded-2xl p-4 shadow-xl space-y-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <span class="text-2xl">${bannerIcon}</span>
          <div>
            <h2 class="text-sm sm:text-base font-extrabold text-white">${bannerTitulo} — ${materia.nombre}</h2>
            <p class="text-xs text-slate-300">${met.mensaje}</p>
          </div>
        </div>
        <div class="text-right font-mono">
          <span class="text-[10px] text-slate-400 block uppercase">Acumulado</span>
          <span class="text-2xl font-extrabold text-emerald-400">${met.acumulado.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <!-- TARJETAS DE MÉTRICAS RÁPIDAS -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
        <span class="text-[10px] text-slate-400 uppercase font-medium block">Porcentaje Evaluado</span>
        <span class="text-lg font-bold font-mono text-cyan-300">${met.evaluadoPct}%</span>
        <span class="text-[10px] text-slate-500 block">de 100% total</span>
      </div>
      <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
        <span class="text-[10px] text-slate-400 uppercase font-medium block">Porcentaje Pendiente</span>
        <span class="text-lg font-bold font-mono text-amber-300">${met.pendientePct}%</span>
        <span class="text-[10px] text-slate-500 block">por evaluar</span>
      </div>
      <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
        <span class="text-[10px] text-slate-400 uppercase font-medium block">Promedio Calificado</span>
        <span class="text-lg font-bold font-mono text-indigo-300">${met.promedioEvaluado.toFixed(2)}</span>
        <span class="text-[10px] text-slate-500 block">sobre 5.0</span>
      </div>
      <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
        <span class="text-[10px] text-slate-400 uppercase font-medium block">Nota Necesaria (3.0)</span>
        <span class="text-lg font-bold font-mono ${met.notaNecesaria && met.notaNecesaria > 5.0 ? 'text-rose-400' : 'text-emerald-400'}">
          ${met.estado === 'aprobada' ? '0.0 ✓' : (met.notaNecesaria !== null ? met.notaNecesaria.toFixed(2) : 'N/A')}
        </span>
        <span class="text-[10px] text-slate-500 block">en el ${met.pendientePct}% restante</span>
      </div>
    </div>

    <!-- TABLA DE EVALUACIONES -->
    <div class="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      <div class="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-200">Desglose de Evaluaciones y Cortes</h3>
          <p class="text-[11px] text-slate-400">Ingresa o edita la calificación de cada corte (Escala 0.0 a 5.0)</p>
        </div>
        <button onclick="window.abrirModalNuevaEvaluacion('${materia.id}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center gap-1.5 self-start sm:self-auto">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i>
          <span>+ Agregar Evaluación</span>
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-800/60 text-[10px] text-slate-400 uppercase font-semibold border-b border-slate-700/60">
            <tr>
              <th class="py-2.5 px-3">Corte / Evaluación</th>
              <th class="py-2.5 px-3 text-center">Peso (%)</th>
              <th class="py-2.5 px-3 text-center">Nota (0.0 - 5.0)</th>
              <th class="py-2.5 px-3 text-right">Aporte Ponderado</th>
              <th class="py-2.5 px-3 text-center">Estado</th>
              <th class="py-2.5 px-3 text-center">Acción</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/80">
            ${evaluaciones.length === 0 ? `
              <tr>
                <td colspan="6" class="p-6 text-center text-slate-500 italic">No hay evaluaciones registradas en esta materia. Haz clic en "+ Agregar Evaluación".</td>
              </tr>
            ` : evaluaciones.map(ev => {
              const tieneNota = ev.nota !== null && ev.nota !== undefined && ev.nota !== '' && !isNaN(Number(ev.nota));
              const notaVal = tieneNota ? Number(ev.nota).toFixed(1) : '';
              const aporte = tieneNota ? ((Number(ev.nota) * Number(ev.porcentaje)) / 100).toFixed(2) : '0.00';

              return `
                <tr class="hover:bg-slate-800/30 transition-colors">
                  <td class="py-2.5 px-3 font-medium text-slate-200">
                    <span>${ev.nombre}</span>
                  </td>
                  <td class="py-2.5 px-3 text-center font-mono text-cyan-300 font-semibold">
                    ${ev.porcentaje}%
                  </td>
                  <td class="py-2.5 px-3 text-center">
                    <input type="number" step="0.1" min="0" max="5.0" value="${notaVal}" placeholder="Pendiente"
                      onchange="window.actualizarNotaEvaluacion('${materia.id}', '${ev.id}', this.value)"
                      class="w-24 bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-lg px-2 py-1 text-center font-mono text-xs text-white placeholder:text-slate-600 focus:outline-none">
                  </td>
                  <td class="py-2.5 px-3 text-right font-mono font-bold ${tieneNota ? 'text-emerald-400' : 'text-slate-600'}">
                    +${aporte}
                  </td>
                  <td class="py-2.5 px-3 text-center">
                    ${tieneNota ? `
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/50">Calificada</span>
                    ` : `
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700/50">Pendiente</span>
                    `}
                  </td>
                  <td class="py-2.5 px-3 text-center">
                    <button onclick="window.eliminarEvaluacion('${materia.id}', '${ev.id}')" class="text-slate-500 hover:text-rose-400 p-1 transition-colors" title="Eliminar Evaluación">
                      <i data-lucide="trash" class="w-3.5 h-3.5"></i>
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
          <tfoot class="bg-slate-800/40 border-t border-slate-700 text-xs font-semibold text-slate-300">
            <tr>
              <td class="py-2.5 px-3">TOTALES</td>
              <td class="py-2.5 px-3 text-center font-mono ${met.totalConfiguradoPct === 100 ? 'text-emerald-400' : 'text-amber-400'}">
                ${met.totalConfiguradoPct}% ${met.totalConfiguradoPct !== 100 ? `<span class="text-[10px] text-amber-400 block">(!= 100%)</span>` : ''}
              </td>
              <td class="py-2.5 px-3 text-center font-mono text-slate-400">Promedio: ${met.promedioEvaluado.toFixed(2)}</td>
              <td class="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold">${met.acumulado.toFixed(2)}</td>
              <td colspan="2" class="py-2.5 px-3 text-center text-[11px] text-slate-400">
                ${met.estado === 'aprobada' ? '✓ Aprobada' : `Falta ${met.pendientePct}%`}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
}

export function renderUniCalculadora(state, callbacks) {
  const container = document.getElementById('uniCalculadoraContainer');
  if (!container) return;

  const rows = state.calculadoraRows || [];
  const meta = Number(state.calculadoraMeta) || 3.0;

  // Cálculos matemáticos de la calculadora
  let totalPorcentaje = 0;
  let evaluadoPct = 0;
  let acumulado = 0;

  rows.forEach(r => {
    const pct = Number(r.porcentaje) || 0;
    totalPorcentaje += pct;

    if (r.nota !== null && r.nota !== undefined && r.nota !== '' && !isNaN(Number(r.nota))) {
      const n = Math.min(5.0, Math.max(0.0, Number(r.nota)));
      evaluadoPct += pct;
      acumulado += (n * pct) / 100;
    }
  });

  const pendientePct = Math.max(0, 100 - evaluadoPct);
  const promedioEvaluado = evaluadoPct > 0 ? (acumulado / (evaluadoPct / 100)) : 0;

  let reqNota = null;
  let mensajeResultado = '';
  let colorBadge = 'emerald';

  if (totalPorcentaje > 100) {
    colorBadge = 'rose';
    mensajeResultado = `⚠️ La suma de porcentajes es ${totalPorcentaje}% (> 100%). Por favor ajusta los porcentajes para que la suma no supere el 100%.`;
  } else if (acumulado >= meta) {
    colorBadge = 'emerald';
    mensajeResultado = `🎉 ¡Meta superada! Ya acumulaste ${acumulado.toFixed(2)} puntos (meta: ${meta.toFixed(1)}). Incluso con 0.0 en lo restante tienes la materia aprobada.`;
  } else if (pendientePct <= 0) {
    if (acumulado >= meta) {
      colorBadge = 'emerald';
      mensajeResultado = `✓ Aprobada: Tu nota final acumulada es ${acumulado.toFixed(2)}.`;
    } else {
      colorBadge = 'rose';
      mensajeResultado = `❌ Reprobada: Nota final de ${acumulado.toFixed(2)} (no alcanzó la meta mínima de ${meta.toFixed(1)}).`;
    }
  } else {
    const puntosFaltantes = meta - acumulado;
    const req = puntosFaltantes / (pendientePct / 100);
    reqNota = req;

    if (req <= 3.5) {
      colorBadge = 'cyan';
      mensajeResultado = `Para alcanzar ${meta.toFixed(1)}, necesitas sacar una nota promedio de <strong>${req.toFixed(2)}</strong> en el <strong>${pendientePct}%</strong> restante.`;
    } else if (req <= 5.0) {
      colorBadge = 'amber';
      mensajeResultado = `Exigencia Alta: Necesitas sacar al menos <strong>${req.toFixed(2)}</strong> en el <strong>${pendientePct}%</strong> restante para alcanzar ${meta.toFixed(1)}.`;
    } else {
      colorBadge = 'rose';
      const maximo = acumulado + (5.0 * pendientePct / 100);
      mensajeResultado = `⚠️ Inalcanzable: Requerirías <strong>${req.toFixed(2)}</strong> (> 5.0). La nota máxima posible obteniendo 5.0 en lo restante sería <strong>${maximo.toFixed(2)}</strong>.`;
    }
  }

  container.innerHTML = `
    <div class="space-y-4">
      
      <!-- BARRA DE PRESETS Y META -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-bold text-white flex items-center gap-2">
            <i data-lucide="calculator" class="w-5 h-5 text-cyan-400"></i>
            <span>Calculadora y Simulador de Notas Universitarias</span>
          </h2>
          <p class="text-xs text-slate-400">Simula tus cortes, notas requeridas y promedio ponderado en tiempo real</p>
        </div>

        <div class="flex items-center gap-2 self-start md:self-auto">
          <span class="text-xs text-slate-400">Meta de Aprobación:</span>
          <select id="calcInputMeta" onchange="window.cambiarMetaCalculadora(this.value)" class="bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-emerald-400 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500">
            <option value="3.0" ${meta === 3.0 ? 'selected' : ''}>3.0 (Mínima)</option>
            <option value="3.5" ${meta === 3.5 ? 'selected' : ''}>3.5 (Buena)</option>
            <option value="4.0" ${meta === 4.0 ? 'selected' : ''}>4.0 (Sobresaliente)</option>
            <option value="4.5" ${meta === 4.5 ? 'selected' : ''}>4.5 (Excelente)</option>
          </select>
        </div>
      </div>

      <!-- BOTONES DE PLANTILLAS RÁPIDAS -->
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider pr-1">Plantillas Frecuentes:</span>
        <button onclick="window.cargarPresetCalculadora('3cortes')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors">
          3 Cortes (30%, 30%, 40%)
        </button>
        <button onclick="window.cargarPresetCalculadora('4cortes')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors">
          4 Evaluaciones (25% c/u)
        </button>
        <button onclick="window.cargarPresetCalculadora('5cortes')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors">
          5 Evaluaciones (20% c/u)
        </button>
        <button onclick="window.cargarPresetCalculadora('35_35_30')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors">
          35% • 35% • 30%
        </button>
        <button onclick="window.limpiarCalculadora()" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 text-xs font-medium border border-slate-700 transition-colors ml-auto">
          Limpiar Todo
        </button>
      </div>

      <!-- RESULTADO PRINCIPAL PROYECTADO -->
      <div class="bg-gradient-to-r from-slate-900 via-slate-800/80 to-slate-900 border ${colorBadge === 'rose' ? 'border-rose-500/50' : (colorBadge === 'amber' ? 'border-amber-500/50' : 'border-emerald-500/50')} rounded-2xl p-4 shadow-xl space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div class="space-y-1">
            <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Diagnóstico de Aprobación</span>
            <div class="text-sm text-slate-200">${mensajeResultado}</div>
          </div>
          <div class="flex items-center gap-4 shrink-0 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div>
              <span class="text-[9px] text-slate-400 uppercase block">Acumulado</span>
              <span class="text-xl font-bold font-mono text-emerald-400">${acumulado.toFixed(2)}</span>
            </div>
            <div class="border-l border-slate-800 pl-3">
              <span class="text-[9px] text-slate-400 uppercase block">Nota Necesaria</span>
              <span class="text-xl font-bold font-mono ${reqNota && reqNota > 5.0 ? 'text-rose-400' : 'text-cyan-400'}">
                ${acumulado >= meta ? '0.0 ✓' : (reqNota !== null ? reqNota.toFixed(2) : 'N/A')}
              </span>
            </div>
          </div>
        </div>

        <!-- Indicador de Porcentajes -->
        <div class="space-y-1">
          <div class="flex justify-between text-xs font-mono">
            <span class="text-slate-300">Configurado: <strong class="${totalPorcentaje > 100 ? 'text-rose-400' : (totalPorcentaje === 100 ? 'text-emerald-400' : 'text-amber-400')}">${totalPorcentaje}%</strong> de 100%</span>
            <span class="text-slate-400">Evaluado: <strong>${evaluadoPct}%</strong> | Pendiente: <strong>${pendientePct}%</strong></span>
          </div>
          <div style="background-color: #0b132b; height: 12px; border-radius: 9999px; overflow: hidden; border: 1px solid #334155; padding: 1px;">
            <div style="height: 100%; border-radius: 9999px; width: ${Math.min(100, Math.max(0, evaluadoPct))}%; background: linear-gradient(90deg, #10b981, #06b6d4); transition: width 0.4s ease;"></div>
          </div>
        </div>
      </div>

      <!-- TABLA DINÁMICA DE ENTRADA DE NOTAS -->
      <div class="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div class="p-3.5 border-b border-slate-800 flex items-center justify-between">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-200">Evaluaciones Simuladas</h3>
          <button onclick="window.agregarFilaCalculadora()" class="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center gap-1.5">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i>
            <span>+ Agregar Fila</span>
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-800/60 text-[10px] text-slate-400 uppercase font-semibold border-b border-slate-700/60">
              <tr>
                <th class="py-2.5 px-3">Nombre de la Evaluación</th>
                <th class="py-2.5 px-3 text-center">Porcentaje (%)</th>
                <th class="py-2.5 px-3 text-center">Nota Obtenida (0.0 - 5.0)</th>
                <th class="py-2.5 px-3 text-right">Aporte Ponderado</th>
                <th class="py-2.5 px-3 text-center">Eliminar</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/80">
              ${rows.map((r, idx) => {
                const tieneNota = r.nota !== null && r.nota !== undefined && r.nota !== '' && !isNaN(Number(r.nota));
                const aporte = tieneNota ? ((Number(r.nota) * Number(r.porcentaje)) / 100).toFixed(2) : '0.00';

                return `
                  <tr class="hover:bg-slate-800/30 transition-colors">
                    <td class="py-2 px-3">
                      <input type="text" value="${r.nombre}" 
                        onchange="window.actualizarFilaCalculadora(${idx}, 'nombre', this.value)"
                        class="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none">
                    </td>
                    <td class="py-2 px-3 text-center">
                      <div class="inline-flex items-center gap-1">
                        <input type="number" min="1" max="100" value="${r.porcentaje}" 
                          oninput="window.actualizarFilaCalculadora(${idx}, 'porcentaje', this.value)"
                          class="w-16 bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-lg px-2 py-1 text-center font-mono text-xs text-cyan-300 font-bold focus:outline-none">
                        <span class="text-slate-500 font-mono">%</span>
                      </div>
                    </td>
                    <td class="py-2 px-3 text-center">
                      <input type="number" step="0.1" min="0" max="5.0" value="${r.nota !== null ? r.nota : ''}" placeholder="Pendiente"
                        oninput="window.actualizarFilaCalculadora(${idx}, 'nota', this.value)"
                        class="w-24 bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-lg px-2 py-1 text-center font-mono text-xs text-white placeholder:text-slate-600 focus:outline-none font-bold">
                    </td>
                    <td class="py-2 px-3 text-right font-mono font-bold ${tieneNota ? 'text-emerald-400' : 'text-slate-600'}">
                      +${aporte}
                    </td>
                    <td class="py-2 px-3 text-center">
                      <button onclick="window.eliminarFilaCalculadora(${idx})" class="text-slate-500 hover:text-rose-400 p-1 transition-colors" title="Eliminar fila">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
            <tfoot class="bg-slate-800/40 border-t border-slate-700 text-xs font-semibold text-slate-300">
              <tr>
                <td class="py-2.5 px-3">SUMATORIA</td>
                <td class="py-2.5 px-3 text-center font-mono font-bold ${totalPorcentaje > 100 ? 'text-rose-400' : (totalPorcentaje === 100 ? 'text-emerald-400' : 'text-amber-400')}">
                  ${totalPorcentaje}%
                </td>
                <td class="py-2.5 px-3 text-center font-mono text-slate-400">
                  Promedio de notas: ${promedioEvaluado.toFixed(2)}
                </td>
                <td class="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold">
                  ${acumulado.toFixed(2)} pts
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
}
