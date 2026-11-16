// ==========================================================
// APP.JS - LÓGICA PRINCIPAL MULTI-USUARIO (dgcano / kkvargas)
// ==========================================================

import { INITIAL_RECORDS } from './initialData.js';
import { DEUDAS_AMORTIZACION } from './deudasAmortizacion.js';
import { exportarExcelConDatos, exportarCSV } from './exportExcel.js';
import {
  INITIAL_UNIVERSIDAD_DATA,
  INITIAL_CALCULADORA_ROWS,
  calcularMetricasMateria,
  calcularMetricasSemestre,
  renderUniSemestres,
  renderUniCalificaciones,
  renderUniCalculadora
} from './universidad.js';
import { renderEmprendimiento } from './emprendimiento.js';

let supabaseClient = null;

export const DEFAULT_SUPABASE_URL = 'https://tjghdapguudilkzglhwg.supabase.co';
export const DEFAULT_SUPABASE_KEY = 'sb_publishable_WniQ7BNB3SpUqydE_NyvKg_nuPKgFnT';

export const CATEGORIAS_INGRESO = ['Sueldo', 'Inversion', 'Otros', 'Ahorro'];
export const CATEGORIAS_EGRESO = ['Casa', 'Deudas', 'Gastos', 'Servicios', 'Tanqueo'];

export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const CONCEPTOS_SUGERIDOS = {
  Ingreso: [
    { concepto: 'Sueldo Quincenal', categoria: 'Sueldo', ppto: 900000 },
    { concepto: 'Sueldo Mensual', categoria: 'Sueldo', ppto: 1800000 },
    { concepto: 'Inversion', categoria: 'Inversion', ppto: 0 },
    { concepto: 'Otros Ingresos', categoria: 'Otros', ppto: 0 },
    { concepto: 'Ahorro', categoria: 'Ahorro', ppto: 0 }
  ],
  Egreso: [
    { concepto: 'Mercado', categoria: 'Casa', ppto: 200000 },
    { concepto: 'Cuota Moto', categoria: 'Deudas', ppto: 325000 },
    { concepto: 'Cuota casa', categoria: 'Gastos', ppto: 200000 },
    { concepto: 'Internet', categoria: 'Servicios', ppto: 35000 },
    { concepto: 'Plan Internet', categoria: 'Servicios', ppto: 53900 },
    { concepto: 'Zoe', categoria: 'Gastos', ppto: 100000 },
    { concepto: 'Pasajes', categoria: 'Gastos', ppto: 20000 },
    { concepto: 'Tanqueo', categoria: 'Tanqueo', ppto: 25000 },
    { concepto: 'Parqueadero', categoria: 'Gastos', ppto: 35000 },
    { concepto: 'Inversion', categoria: 'Gastos', ppto: 60000 },
    { concepto: 'Salida', categoria: 'Gastos', ppto: 60000 },
    { concepto: 'Gastos Hormiga', categoria: 'Gastos', ppto: 15000 },
    { concepto: 'Lavada Moto', categoria: 'Gastos', ppto: 35000 },
    { concepto: 'Seguro Moto', categoria: 'Deudas', ppto: 114287 }
  ]
};

const INITIAL_ACEITE = [
  { id: '1', fecha: '2026-02-23', kilometraje: 25996, notas: 'Primer registro' },
  { id: '2', fecha: '2026-04-30', kilometraje: 28211, notas: 'Mantenimiento' },
  { id: '3', fecha: '2026-08-06', kilometraje: 30000, notas: 'Revisión periódica' },
  { id: '4', fecha: '2026-09-10', kilometraje: 31343, notas: 'Aceite sintético' }
];

export const INITIAL_DEUDAS = [
  { id: 'Moto', nombre: 'Moto', saldo_inicial: 11657424, tasa_ea: 0.2199, cuota_mensual: 242863, saldo_pendiente: 9228794, total_abonado: 0, pct_pagado: 20.83 },
  { id: 'Tablet', nombre: 'Tablet', saldo_inicial: 1322856, tasa_ea: 0.2923, cuota_mensual: 55119, saldo_pendiente: 1112618, total_abonado: 100000, pct_pagado: 15.89 },
  { id: 'Credito', nombre: 'Crédito', saldo_inicial: 8924304, tasa_ea: 0.2286, cuota_mensual: 185923, saldo_pendiente: 7308766, total_abonado: 500000, pct_pagado: 18.10 },
  { id: 'Madre', nombre: 'Madre', saldo_inicial: 5189000, tasa_ea: 0.0000, cuota_mensual: 200000, saldo_pendiente: 3589000, total_abonado: 1000000, pct_pagado: 30.83 }
];

export const INITIAL_GASTOS_FIJOS = [
  { id: 'gf_1', nombre: 'Mercado', presupuesto: 400000 },
  { id: 'gf_2', nombre: 'Internet', presupuesto: 70000 },
  { id: 'gf_3', nombre: 'Cuota Moto', presupuesto: 650000 },
  { id: 'gf_4', nombre: 'Pasajes', presupuesto: 40000 },
  { id: 'gf_5', nombre: 'Zoe', presupuesto: 200000 },
  { id: 'gf_6', nombre: 'Plan Internet', presupuesto: 100000 },
  { id: 'gf_7', nombre: 'Parqueadero', presupuesto: 35000 }
];

export const INITIAL_DEVENGADO = {
  ingresoDevengado: 1103755,
  items: [
    { id: 'dev_1', concepto: 'Mercado', monto: 200000 },
    { id: 'dev_2', concepto: 'Internet', monto: 35000 },
    { id: 'dev_3', concepto: 'Cuota Moto', monto: 325000 },
    { id: 'dev_4', concepto: 'Pasajes', monto: 20000 },
    { id: 'dev_5', concepto: 'Zoe', monto: 100000 },
    { id: 'dev_6', concepto: 'Plan Internet', monto: 100000 },
    { id: 'dev_7', concepto: 'Cuotas deudas', monto: 200000 }
  ]
};

export const INITIAL_LOTE_ITEMS = {
  ingresos: [
    { id: 'li_1', concepto: 'Sueldo Quincenal', categoria: 'Sueldo', ppto: 900000 },
    { id: 'li_2', concepto: 'Inversion', categoria: 'Inversion', ppto: 0 },
    { id: 'li_3', concepto: 'Otros Ingresos', categoria: 'Otros', ppto: 0 },
    { id: 'li_4', concepto: 'Ahorro', categoria: 'Ahorro', ppto: 0 }
  ],
  gastosFijos: [
    { id: 'lgf_1', concepto: 'Mercado', categoria: 'Casa', ppto: 200000 },
    { id: 'lgf_2', concepto: 'Cuota Moto', categoria: 'Deudas', ppto: 325000 },
    { id: 'lgf_3', concepto: 'Cuota casa', categoria: 'Gastos', ppto: 200000 },
    { id: 'lgf_4', concepto: 'Internet', categoria: 'Servicios', ppto: 35000 },
    { id: 'lgf_5', concepto: 'Zoe', categoria: 'Gastos', ppto: 100000 },
    { id: 'lgf_6', concepto: 'Pasajes', categoria: 'Gastos', ppto: 20000 },
    { id: 'lgf_7', concepto: 'Plan Internet', categoria: 'Servicios', ppto: 53900 },
    { id: 'lgf_8', concepto: 'Parqueadero', categoria: 'Gastos', ppto: 35000 }
  ],
  gastosVariables: [
    { id: 'lgv_1', concepto: 'Inversion', categoria: 'Gastos', ppto: 60000 },
    { id: 'lgv_2', concepto: 'Salida', categoria: 'Gastos', ppto: 60000 },
    { id: 'lgv_3', concepto: 'Gastos Hormiga', categoria: 'Gastos', ppto: 15000 },
    { id: 'lgv_4', concepto: 'Lavada Moto', categoria: 'Gastos', ppto: 35000 },
    { id: 'lgv_5', concepto: 'Tanqueo', categoria: 'Tanqueo', ppto: 25000 }
  ]
};

export const INITIAL_METAS_AHORRO = [];

function sanitizeLoteItems(loaded) {
  if (!loaded) return JSON.parse(JSON.stringify(INITIAL_LOTE_ITEMS));
  return {
    ingresos: (loaded.ingresos || []).filter(x => x && x.concepto && x.concepto.trim() !== ''),
    gastosFijos: (loaded.gastosFijos || []).filter(x => x && x.concepto && x.concepto.trim() !== ''),
    gastosVariables: (loaded.gastosVariables || []).filter(x => x && x.concepto && x.concepto.trim() !== '')
  };
}

export const state = {
  records: [],
  cambiosAceite: [],
  deudas: [...INITIAL_DEUDAS],
  amortizaciones: DEUDAS_AMORTIZACION,
  deudaExpandidaId: null,
  gastosFijos: [...INITIAL_GASTOS_FIJOS],
  devengadoData: { ...INITIAL_DEVENGADO },
  loteItems: sanitizeLoteItems(null),
  metasAhorro: [...INITIAL_METAS_AHORRO],
  pptoVariablesMes: 350000,
  ingresoQuincena1: 900000,
  ingresoQuincena2: 900000,
  montoSimuladorDeudas: 200000,
  currentTab: 'dashboard',
  selectedMes: 'Noviembre',
  selectedAno: 2026,
  consolidadoAno: 2026,
  compararModo: 'meses',
  compararMes1: 'Octubre',

  universidadData: [...INITIAL_UNIVERSIDAD_DATA],
  activeSemestreId: 'sem_2026_1',
  activeMateriaId: 'mat_1',
  calculadoraRows: [...INITIAL_CALCULADORA_ROWS],
  calculadoraMeta: 3.0,
  emprendimiento: {
    productos: [
      { id: 'prod_boli_500', nombre: 'Boli Pequeño ($500)', precioVenta: 500, stock: 0 },
      { id: 'prod_boli_1000', nombre: 'Boli Grande ($1.000)', precioVenta: 1000, stock: 0 },
      { id: 'prod_oblea', nombre: 'Oblea', precioVenta: 2500, stock: 0 }
    ],
    movimientos: []
  },
  menuAccordion: {
    nomina: true,
    universidad: true
  },
  compararAno1: 2026,
  compararMes2: 'Noviembre',
  compararAno2: 2026,
  searchQuery: '',
  filterCategoria: 'todas',
  filterTipo: 'todos',
  currentPage: 1,
  pageSize: 15,
  supabaseUrl: localStorage.getItem('supabase_url') || DEFAULT_SUPABASE_URL,
  supabaseKey: localStorage.getItem('supabase_key') || DEFAULT_SUPABASE_KEY,
  isConnectedToSupabase: false,
  charts: {
    incomeExpense: null,
    categoryDoughnut: null
  }
};

// ==========================================================
// AISLAMIENTO DE DATOS POR USUARIO (dgcano vs kkvargas)
// ==========================================================
export function getActiveUser() {
  return (localStorage.getItem('auth_user') || 'dgcano').toLowerCase();
}

function getStorageKey(baseKey) {
  const user = getActiveUser();
  return user === 'dgcano' ? baseKey : `${user}_${baseKey}`;
}

function getSupabaseConfigKey() {
  const user = getActiveUser();
  return user === 'dgcano' ? 'global_state' : `global_state_${user}`;
}

export function parseMonto(val) {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const limpio = String(val).replace(/[$ \s]/g, '').replace(/\./g, '').replace(/,/g, '.');
  const num = parseFloat(limpio);
  return isNaN(num) ? 0 : num;
}

export function formatMiles(val) {
  if (val === null || val === undefined || val === '') return '';
  const num = parseMonto(val);
  if (num === 0) return '';
  return Math.round(num).toLocaleString('es-CO');
}

export function formatCOP(val) {
  const num = parseMonto(val);
  return '$ ' + Math.round(num).toLocaleString('es-CO');
}

export function formatNumber(val) {
  const num = parseMonto(val);
  return Math.round(num).toLocaleString('es-CO');
}

// ==========================================================
// INICIALIZACIÓN DE SUPABASE Y CARGA LOCAL
// ==========================================================

export async function initSupabase() {
  cargarDatosLocales();

  const url = state.supabaseUrl || DEFAULT_SUPABASE_URL;
  const key = state.supabaseKey || DEFAULT_SUPABASE_KEY;

  if (url && key) {
    try {
      const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
      supabaseClient = createClient(url, key);

      const { error } = await supabaseClient.from('app_config').select('key').limit(1);
      if (!error) {
        state.isConnectedToSupabase = true;
        updateSupabaseStatusUI(true);
        await cargarDatosDesdeSupabase();

        supabaseClient
          .channel('cambios-globales')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'app_config' },
            async () => {
              await cargarDatosDesdeSupabase(true);
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'registro' },
            async () => {
              await cargarDatosDesdeSupabase(true);
            }
          )
          .subscribe();

        return;
      } else {
        state.isConnectedToSupabase = false;
        updateSupabaseStatusUI(false);
      }
    } catch (e) {
      state.isConnectedToSupabase = false;
      updateSupabaseStatusUI(false);
    }
  } else {
    state.isConnectedToSupabase = false;
    updateSupabaseStatusUI(false);
  }
}

function updateSupabaseStatusUI(connected) {
  const badge = document.getElementById('supabaseStatusBadge');
  const text = document.getElementById('supabaseStatusText');
  const dot = document.getElementById('supabaseStatusDot');
  if (!badge || !text || !dot) return;

  if (connected) {
    badge.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-900/40 text-emerald-300 border border-emerald-700/50';
    dot.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse';
    text.textContent = 'Supabase Conectado';
  } else {
    badge.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-900/40 text-amber-300 border border-amber-700/50';
    dot.className = 'w-2 h-2 rounded-full bg-amber-400';
    text.textContent = 'Modo Local (Offline)';
  }
}

export function normalizarClave(texto) {
  if (!texto) return '';
  return String(texto)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function getAmortizacionSchedule(deudaOrId) {
  if (!deudaOrId) return [];

  let id = typeof deudaOrId === 'object' ? deudaOrId.id : deudaOrId;
  let nombre = typeof deudaOrId === 'object' ? deudaOrId.nombre : null;

  if (!nombre && state && state.deudas) {
    const dEncontrada = state.deudas.find(d =>
      d.id === id ||
      normalizarClave(d.nombre) === normalizarClave(id) ||
      normalizarClave(d.id) === normalizarClave(id)
    );
    if (dEncontrada) {
      nombre = dEncontrada.nombre;
      id = dEncontrada.id;
    }
  }

  if (id && state.amortizaciones && state.amortizaciones[id] && Array.isArray(state.amortizaciones[id])) {
    return state.amortizaciones[id];
  }
  if (nombre && state.amortizaciones && state.amortizaciones[nombre] && Array.isArray(state.amortizaciones[nombre])) {
    return state.amortizaciones[nombre];
  }

  const targets = [normalizarClave(nombre), normalizarClave(id)].filter(Boolean);
  if (state.amortizaciones) {
    for (const [clave, cuotas] of Object.entries(state.amortizaciones)) {
      const claveNorm = normalizarClave(clave);
      if (targets.includes(claveNorm) && Array.isArray(cuotas)) {
        if (id) state.amortizaciones[id] = cuotas;
        if (nombre) state.amortizaciones[nombre] = cuotas;
        return cuotas;
      }
    }
  }

  if (getActiveUser() === 'dgcano') {
    for (const t of targets) {
      if (t.includes('moto') && DEUDAS_AMORTIZACION['Moto']) return DEUDAS_AMORTIZACION['Moto'];
      if (t.includes('tab') && DEUDAS_AMORTIZACION['Tablet']) return DEUDAS_AMORTIZACION['Tablet'];
      if (t.includes('mad') && DEUDAS_AMORTIZACION['Madre']) return DEUDAS_AMORTIZACION['Madre'];
      if ((t.includes('cred') || t.includes('cr') || t.includes('prest')) && DEUDAS_AMORTIZACION['Credito']) return DEUDAS_AMORTIZACION['Credito'];
    }
  }

  return [];
}

function safeParse(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw || raw === 'undefined' || raw === 'null') return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function cargarDatosLocales() {
  const user = getActiveUser();
  const isNewUser = user !== 'dgcano';

  state.records = safeParse(getStorageKey('local_records'), isNewUser ? [] : [...INITIAL_RECORDS]);

  const rawAceite = safeParse(getStorageKey('local_aceite'), isNewUser ? [] : [...INITIAL_ACEITE]);
  const seenAceiteLoc = new Set();
  state.cambiosAceite = rawAceite.filter(a => {
    const sig = `${a.fecha}_${Number(a.kilometraje)}`;
    if (seenAceiteLoc.has(sig)) return false;
    seenAceiteLoc.add(sig);
    return true;
  });

  state.deudas = safeParse(getStorageKey('local_deudas'), isNewUser ? [] : [...INITIAL_DEUDAS]);

  const parsedAmort = safeParse(getStorageKey('local_amortizaciones'), null);
  state.amortizaciones = isNewUser
    ? (parsedAmort || {})
    : (parsedAmort ? { ...DEUDAS_AMORTIZACION, ...parsedAmort } : { ...DEUDAS_AMORTIZACION });

  state.deudas.forEach(d => {
    const sched = getAmortizacionSchedule(d);
    if (sched && sched.length > 0) {
      state.amortizaciones[d.id] = sched;
      state.amortizaciones[d.nombre] = sched;
      state.amortizaciones[normalizarClave(d.nombre)] = sched;
    }
  });

  state.gastosFijos = safeParse(getStorageKey('local_gastos_fijos'), isNewUser ? [] : [...INITIAL_GASTOS_FIJOS]);
  state.devengadoData = safeParse(
    getStorageKey('local_devengado'),
    isNewUser ? { ingresoDevengado: 0, items: [] } : JSON.parse(JSON.stringify(INITIAL_DEVENGADO))
  );

  const defaultLoteVacio = { ingresos: [], gastosFijos: [], gastosVariables: [] };
  state.loteItems = isNewUser
    ? safeParse(getStorageKey('local_lote_items'), defaultLoteVacio)
    : sanitizeLoteItems(safeParse(getStorageKey('local_lote_items'), null));

  const parsedMetas = safeParse(getStorageKey('local_metas_ahorro'), []);
  state.metasAhorro = Array.isArray(parsedMetas) ? parsedMetas : [];

  const savedPpto = localStorage.getItem(getStorageKey('local_ppto_variables'));
  state.pptoVariablesMes = savedPpto !== null ? (Number(savedPpto) || 0) : (isNewUser ? 0 : 350000);

  const savedQ1 = localStorage.getItem(getStorageKey('local_ingreso_q1'));
  state.ingresoQuincena1 = savedQ1 !== null ? (Number(savedQ1) || 0) : (isNewUser ? 0 : 900000);

  const savedQ2 = localStorage.getItem(getStorageKey('local_ingreso_q2'));
  state.ingresoQuincena2 = savedQ2 !== null ? (Number(savedQ2) || 0) : (isNewUser ? 0 : 900000);

  const savedSim = localStorage.getItem(getStorageKey('local_monto_simulador'));
  state.montoSimuladorDeudas = savedSim !== null ? (Number(savedSim) || 0) : (isNewUser ? 0 : 200000);

  state.universidadData = safeParse(getStorageKey('local_universidad_data'), JSON.parse(JSON.stringify(INITIAL_UNIVERSIDAD_DATA)));
  state.calculadoraRows = safeParse(getStorageKey('local_calculadora_rows'), JSON.parse(JSON.stringify(INITIAL_CALCULADORA_ROWS)));

  state.emprendimiento = safeParse(getStorageKey('local_emprendimiento'), {
    productos: [
      { id: 'prod_boli_500', nombre: 'Boli Pequeño ($500)', precioVenta: 500, stock: 0 },
      { id: 'prod_boli_1000', nombre: 'Boli Grande ($1.000)', precioVenta: 1000, stock: 0 },
      { id: 'prod_oblea', nombre: 'Oblea', precioVenta: 2500, stock: 0 }
    ],
    movimientos: []
  });

  const localActiveSem = localStorage.getItem(getStorageKey('local_active_semestre'));
  if (localActiveSem) state.activeSemestreId = localActiveSem;

  actualizarTodaLaApp();
}

export function guardarEnLocalStorage() {
  const payload = {
    records: state.records || [],
    cambiosAceite: state.cambiosAceite || [],
    deudas: state.deudas || [],
    amortizaciones: state.amortizaciones || {},
    gastosFijos: state.gastosFijos || [],
    devengadoData: state.devengadoData || { ingresoDevengado: 0, items: [] },
    loteItems: state.loteItems || { ingresos: [], gastosFijos: [], gastosVariables: [] },
    metasAhorro: state.metasAhorro || [],
    pptoVariablesMes: state.pptoVariablesMes ?? 0,
    ingresoQuincena1: state.ingresoQuincena1 ?? 0,
    ingresoQuincena2: state.ingresoQuincena2 ?? 0,
    montoSimuladorDeudas: state.montoSimuladorDeudas ?? 0,
    universidadData: state.universidadData || [],
    calculadoraRows: state.calculadoraRows || [],
    calculadoraMeta: state.calculadoraMeta ?? 3.0,
    emprendimiento: state.emprendimiento || { productos: [], movimientos: [] }
  };

  localStorage.setItem(getStorageKey('local_records'), JSON.stringify(payload.records));
  localStorage.setItem(getStorageKey('local_aceite'), JSON.stringify(payload.cambiosAceite));
  localStorage.setItem(getStorageKey('local_deudas'), JSON.stringify(payload.deudas));
  localStorage.setItem(getStorageKey('local_amortizaciones'), JSON.stringify(payload.amortizaciones));
  localStorage.setItem(getStorageKey('local_gastos_fijos'), JSON.stringify(payload.gastosFijos));
  localStorage.setItem(getStorageKey('local_devengado'), JSON.stringify(payload.devengadoData));
  localStorage.setItem(getStorageKey('local_lote_items'), JSON.stringify(payload.loteItems));
  localStorage.setItem(getStorageKey('local_metas_ahorro'), JSON.stringify(payload.metasAhorro));
  localStorage.setItem(getStorageKey('local_ppto_variables'), payload.pptoVariablesMes);
  localStorage.setItem(getStorageKey('local_ingreso_q1'), payload.ingresoQuincena1);
  localStorage.setItem(getStorageKey('local_ingreso_q2'), payload.ingresoQuincena2);
  localStorage.setItem(getStorageKey('local_monto_simulador'), payload.montoSimuladorDeudas);
  localStorage.setItem(getStorageKey('local_universidad_data'), JSON.stringify(payload.universidadData));
  localStorage.setItem(getStorageKey('local_calculadora_rows'), JSON.stringify(payload.calculadoraRows));
  localStorage.setItem(getStorageKey('local_emprendimiento'), JSON.stringify(payload.emprendimiento));

  if (supabaseClient) {
    supabaseClient
      .from('app_config')
      .upsert({
        key: getSupabaseConfigKey(),
        value: payload
      }, { onConflict: 'key' })
      .then(({ error }) => {
        if (error) console.warn('Error sincronizando estado a Supabase:', error.message);
      });
  }
}

export async function cargarDatosDesdeSupabase(silencioso = false) {
  if (!supabaseClient) return;
  const user = getActiveUser();

  try {
    if (!silencioso) showToast('Sincronizando con Supabase...', 'info');

    // 1. Si es dgcano, cargar sus movimientos históricos de la tabla 'registro'
    if (user === 'dgcano') {
      let data = [];
      let offset = 0;
      const limit = 1000;
      while (true) {
        const { data: page, error } = await supabaseClient
          .from('registro')
          .select('*')
          .order('fecha', { ascending: false })
          .range(offset, offset + limit - 1);
        if (error) throw error;
        if (!page || page.length === 0) break;
        data = data.concat(page);
        if (page.length < limit) break;
        offset += limit;
      }

      if (data && data.length > 0) {
        const seenSigs = new Set();
        state.records = data.filter(r => {
          if (r.usuario && r.usuario !== 'dgcano') return false;
          const sig = `${r.fecha}_${r.tipo}_${r.categoria}_${r.concepto}_${r.presupuesto}_${r.monto}`;
          if (seenSigs.has(sig)) return false;
          seenSigs.add(sig);
          return true;
        });
        localStorage.setItem(getStorageKey('local_records'), JSON.stringify(state.records));
      }

      const { data: dataAceite } = await supabaseClient.from('cambio_aceite').select('*').order('fecha', { ascending: false });
      if (dataAceite && dataAceite.length > 0) {
        const seenAceite = new Set();
        state.cambiosAceite = dataAceite.filter(a => {
          const sig = `${a.fecha}_${Number(a.kilometraje)}`;
          if (seenAceite.has(sig)) return false;
          seenAceite.add(sig);
          return true;
        });
      }
    }

    // 2. Descargar el estado aislado del usuario desde app_config (global_state o global_state_kkvargas)
    const { data: cfgRow, error: cfgErr } = await supabaseClient
      .from('app_config')
      .select('value')
      .eq('key', getSupabaseConfigKey())
      .maybeSingle();

    if (!cfgErr && cfgRow && cfgRow.value) {
      const v = cfgRow.value;
      if (user !== 'dgcano' && Array.isArray(v.records)) state.records = v.records;
      if (v.ingresoQuincena1 !== undefined) state.ingresoQuincena1 = v.ingresoQuincena1;
      if (v.ingresoQuincena2 !== undefined) state.ingresoQuincena2 = v.ingresoQuincena2;
      if (v.pptoVariablesMes !== undefined) state.pptoVariablesMes = v.pptoVariablesMes;
      if (Array.isArray(v.deudas)) state.deudas = v.deudas;
      if (v.amortizaciones) {
        state.amortizaciones = user === 'dgcano'
          ? { ...DEUDAS_AMORTIZACION, ...v.amortizaciones }
          : v.amortizaciones;
      }
      if (Array.isArray(v.gastosFijos)) state.gastosFijos = v.gastosFijos;
      if (v.devengadoData) state.devengadoData = v.devengadoData;
      if (v.loteItems) {
        state.loteItems = user === 'dgcano' ? sanitizeLoteItems(v.loteItems) : v.loteItems;
      }
      if (Array.isArray(v.metasAhorro)) state.metasAhorro = v.metasAhorro;
      if (Array.isArray(v.cambiosAceite)) state.cambiosAceite = v.cambiosAceite;
      if (Array.isArray(v.universidadData)) state.universidadData = v.universidadData;
      if (Array.isArray(v.calculadoraRows)) state.calculadoraRows = v.calculadoraRows;
      if (v.calculadoraMeta !== undefined) state.calculadoraMeta = v.calculadoraMeta;
      if (v.emprendimiento) state.emprendimiento = v.emprendimiento;

      localStorage.setItem(getStorageKey('local_records'), JSON.stringify(state.records));
      localStorage.setItem(getStorageKey('local_deudas'), JSON.stringify(state.deudas));
      localStorage.setItem(getStorageKey('local_amortizaciones'), JSON.stringify(state.amortizaciones));
      localStorage.setItem(getStorageKey('local_gastos_fijos'), JSON.stringify(state.gastosFijos));
      localStorage.setItem(getStorageKey('local_devengado'), JSON.stringify(state.devengadoData));
      localStorage.setItem(getStorageKey('local_lote_items'), JSON.stringify(state.loteItems));
      localStorage.setItem(getStorageKey('local_universidad_data'), JSON.stringify(state.universidadData));
      localStorage.setItem(getStorageKey('local_emprendimiento'), JSON.stringify(state.emprendimiento));
    }

    actualizarTodaLaApp();
  } catch (err) {
    console.error('Error al cargar datos desde Supabase:', err);
    if (!silencioso) showToast('Error sincronizando con Supabase: ' + err.message, 'error');
  }
}

export async function sincronizarDatosInicialesASupabase() {
  if (getActiveUser() !== 'dgcano') {
    guardarEnLocalStorage();
    showToast('Datos personales sincronizados en la nube.', 'success');
    return;
  }
  if (!supabaseClient) {
    alert('No hay conexión activa con Supabase.');
    return;
  }
  try {
    showToast('Verificando registros en Supabase...', 'info');
    let existentes = [];
    let offset = 0;
    const limit = 1000;
    while (true) {
      const { data: page, error } = await supabaseClient
        .from('registro')
        .select('fecha, tipo, categoria, concepto, presupuesto, monto')
        .range(offset, offset + limit - 1);
      if (error) throw error;
      if (!page || page.length === 0) break;
      existentes = existentes.concat(page);
      if (page.length < limit) break;
      offset += limit;
    }

    const firmasExistentes = new Set(
      existentes.map(r => `${r.fecha}_${r.tipo}_${r.categoria}_${r.concepto}_${Number(r.presupuesto) || 0}_${Number(r.monto) || 0}`)
    );

    const batch = state.records
      .filter(r => {
        const firma = `${r.fecha}_${r.tipo}_${r.categoria}_${r.concepto}_${Number(r.presupuesto) || 0}_${Number(r.monto) || 0}`;
        return !firmasExistentes.has(firma);
      })
      .map(r => ({
        fecha: r.fecha,
        mes: r.mes,
        año: r.año,
        tipo: r.tipo,
        categoria: r.categoria,
        concepto: r.concepto,
        presupuesto: Number(r.presupuesto) || 0,
        monto: Number(r.monto) || 0,
        usuario: 'dgcano'
      }));

    if (batch.length === 0) {
      showToast(`Tu base de datos ya está al día (${existentes.length} registros).`, 'success');
      return;
    }

    const chunkSize = 100;
    for (let i = 0; i < batch.length; i += chunkSize) {
      const chunk = batch.slice(i, i + chunkSize);
      const { error } = await supabaseClient.from('registro').insert(chunk);
      if (error) throw error;
    }
    showToast(`¡Éxito! Se subieron ${batch.length} registros nuevos.`, 'success');
  } catch (err) {
    alert('Error al sincronizar: ' + err.message);
  }
}

export async function limpiarDuplicadosSupabase() {
  if (!supabaseClient) return;
  showToast('Analizando duplicados...', 'info');
}

// ==========================================================
// OPERACIONES CRUD DE REGISTROS
// ==========================================================

export async function agregarRegistro(nuevo) {
  const fechaObj = new Date(nuevo.fecha + 'T00:00:00');
  const mesNombre = MESES[fechaObj.getMonth()];
  const anoNum = fechaObj.getFullYear();

  const record = {
    id: nuevo.id || 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    fecha: nuevo.fecha,
    mes: mesNombre,
    año: anoNum,
    tipo: nuevo.tipo,
    categoria: nuevo.categoria,
    concepto: nuevo.concepto.trim(),
    presupuesto: Number(nuevo.presupuesto) || 0,
    monto: Number(nuevo.monto) || 0
  };

  if (state.isConnectedToSupabase && supabaseClient && getActiveUser() === 'dgcano') {
    try {
      const { data, error } = await supabaseClient.from('registro').insert([{
        fecha: record.fecha,
        mes: record.mes,
        año: record.año,
        tipo: record.tipo,
        categoria: record.categoria,
        concepto: record.concepto,
        presupuesto: record.presupuesto,
        monto: record.monto,
        usuario: 'dgcano'
      }]).select();
      if (!error && data && data[0]) record.id = data[0].id;
    } catch (e) {
      console.error('Error al guardar en Supabase:', e);
    }
  }

  state.records.unshift(record);
  guardarEnLocalStorage();
  actualizarTodaLaApp();
  showToast('Movimiento registrado con éxito', 'success');
  return record;
}

export async function agregarLoteRegistros(lista) {
  if (!lista || lista.length === 0) return;

  const prepped = lista.map(item => {
    const fechaObj = new Date(item.fecha + 'T00:00:00');
    const mesNombre = MESES[fechaObj.getMonth()];
    const anoNum = fechaObj.getFullYear();
    return {
      id: 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      fecha: item.fecha,
      mes: mesNombre,
      año: anoNum,
      tipo: item.tipo,
      categoria: item.categoria,
      concepto: item.concepto.trim(),
      presupuesto: Number(item.presupuesto) || 0,
      monto: Number(item.monto) || 0
    };
  });

  if (state.isConnectedToSupabase && supabaseClient && getActiveUser() === 'dgcano') {
    try {
      await supabaseClient.from('registro').insert(prepped.map(p => ({
        fecha: p.fecha,
        mes: p.mes,
        año: p.año,
        tipo: p.tipo,
        categoria: p.categoria,
        concepto: p.concepto,
        presupuesto: p.presupuesto,
        monto: p.monto,
        usuario: 'dgcano'
      })));
    } catch (e) {
      console.error('Error al guardar lote en Supabase:', e);
    }
  }

  state.records.unshift(...prepped);
  guardarEnLocalStorage();
  actualizarTodaLaApp();
  showToast(`Se guardaron ${prepped.length} movimientos correctamente.`, 'success');
}

export async function eliminarRegistro(id) {
  if (!confirm('¿Estás seguro de eliminar este registro?')) return;

  if (state.isConnectedToSupabase && supabaseClient && getActiveUser() === 'dgcano') {
    try {
      await supabaseClient.from('registro').delete().eq('id', id);
    } catch (e) {
      console.error('Error al eliminar en Supabase:', e);
    }
  }

  state.records = state.records.filter(r => r.id !== id);
  guardarEnLocalStorage();
  actualizarTodaLaApp();
  showToast('Registro eliminado.', 'info');
}

// ==========================================================
// RENDERIZADO DEL DASHBOARD, TANQUEO Y DEVENGADO
// ==========================================================

export function renderDashboard() {
  const mes = state.selectedMes.toLowerCase();
  const ano = Number(state.selectedAno);

  const mesRecords = state.records.filter(r => {
    const rMes = (r.mes || '').toLowerCase();
    const rAno = Number(r.año);
    return rMes === mes && rAno === ano;
  });

  let ingresosReal = 0, ingresosPpto = 0;
  let egresosReal = 0, egresosPpto = 0;

  const porCategoria = {};
  [...CATEGORIAS_INGRESO, ...CATEGORIAS_EGRESO].forEach(c => {
    porCategoria[c] = { real: 0, ppto: 0 };
  });

  mesRecords.forEach(r => {
    const monto = Number(r.monto) || 0;
    const ppto = Number(r.presupuesto) || 0;
    const cat = r.categoria;

    if (r.tipo === 'Ingreso') {
      ingresosReal += monto;
      ingresosPpto += ppto;
    } else {
      egresosReal += monto;
      egresosPpto += ppto;
    }

    if (porCategoria[cat]) {
      porCategoria[cat].real += monto;
      porCategoria[cat].ppto += ppto;
    } else {
      porCategoria[cat] = { real: monto, ppto: ppto };
    }
  });

  const saldoReal = ingresosReal - egresosReal;
  const difIngresos = ingresosReal - ingresosPpto;
  const difEgresos = egresosReal - egresosPpto;

  const elIngReal = document.getElementById('dashIngresosReal');
  if (elIngReal) elIngReal.textContent = formatCOP(ingresosReal);
  const elIngPpto = document.getElementById('dashIngresosPpto');
  if (elIngPpto) elIngPpto.textContent = 'Ppto: ' + formatCOP(ingresosPpto);
  const elIngDif = document.getElementById('dashIngresosDif');
  if (elIngDif) elIngDif.textContent = 'Dif: ' + (difIngresos >= 0 ? '+' : '') + formatCOP(difIngresos);

  const elEgReal = document.getElementById('dashEgresosReal');
  if (elEgReal) elEgReal.textContent = formatCOP(egresosReal);
  const elEgPpto = document.getElementById('dashEgresosPpto');
  if (elEgPpto) elEgPpto.textContent = 'Ppto: ' + formatCOP(egresosPpto);
  const elEgDif = document.getElementById('dashEgresosDif');
  if (elEgDif) elEgDif.textContent = 'Dif: ' + (difEgresos <= 0 ? '' : '+') + formatCOP(difEgresos);

  const pctEgresos = egresosPpto > 0 ? (egresosReal / egresosPpto) * 100 : 0;
  const egresosBarEl = document.getElementById('dashEgresosProgressBar');
  const egresosPctEl = document.getElementById('dashEgresosPctText');
  const egresosBadgeEl = document.getElementById('dashEgresosStatusBadge');
  if (egresosBarEl && egresosPctEl && egresosBadgeEl) {
    egresosPctEl.textContent = pctEgresos.toFixed(1) + '%';
    egresosBarEl.style.width = Math.min(100, Math.max(0, pctEgresos)) + '%';
    if (pctEgresos <= 80) {
      egresosBarEl.style.background = 'linear-gradient(90deg, #10b981, #059669)';
      egresosBadgeEl.textContent = 'En Rango (Verde)';
      egresosBadgeEl.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
      egresosBadgeEl.style.color = '#34d399';
    } else if (pctEgresos <= 100) {
      egresosBarEl.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
      egresosBadgeEl.textContent = 'Precaución (Amarillo)';
      egresosBadgeEl.style.backgroundColor = 'rgba(245, 158, 11, 0.2)';
      egresosBadgeEl.style.color = '#fbbf24';
    } else {
      egresosBarEl.style.background = 'linear-gradient(90deg, #ef4444, #b91c1c)';
      egresosBadgeEl.textContent = 'Excedido (Rojo)';
      egresosBadgeEl.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
      egresosBadgeEl.style.color = '#f87171';
    }
  }

  const saldoEl = document.getElementById('dashSaldoReal');
  if (saldoEl) {
    saldoEl.textContent = formatCOP(saldoReal);
    saldoEl.className = 'text-2xl sm:text-3xl font-extrabold ' + (saldoReal >= 0 ? 'text-emerald-400' : 'text-rose-400');
  }

  renderTablaResumen('tablaResumenIngresos', CATEGORIAS_INGRESO, porCategoria);
  renderTablaResumen('tablaResumenEgresos', CATEGORIAS_EGRESO, porCategoria);

  renderTablaDetalleConceptos('tablaDetalleServicios', mesRecords.filter(r => r.categoria === 'Servicios'));
  renderTablaDetalleConceptos('tablaDetalleGastos', mesRecords.filter(r => r.categoria === 'Gastos'));
  renderTablaDetalleConceptos('tablaDetalleDeudas', mesRecords.filter(r => r.categoria === 'Deudas'));

  renderTanqueoWidget(mesRecords);
  renderDevengadoWidget();
  renderGastosFijosWidget();
  renderCentroAlertasFinancieras(mesRecords);
  renderSemaforoGastosVariables(mesRecords);
  renderPlanificadorQuincenal(mesRecords);
  renderMetasAhorroWidget();
  actualizarGraficosDashboard(mesRecords, porCategoria);
}

function renderTanqueoWidget(mesRecords) {
  const container = document.getElementById('dashTanqueoList');
  const totalEl = document.getElementById('dashTanqueoTotal');
  if (!container || !totalEl) return;

  const tanqueos = mesRecords.filter(r => r.categoria === 'Tanqueo' || (r.concepto || '').toLowerCase().includes('gasolina'));
  const total = tanqueos.reduce((acc, cur) => acc + (Number(cur.monto) || 0), 0);
  totalEl.textContent = formatCOP(total);

  if (tanqueos.length === 0) {
    container.innerHTML = `<tr><td colspan="2" class="py-3 px-3 text-center text-xs text-slate-500 italic">Sin tanqueos en ${state.selectedMes} ${state.selectedAno}</td></tr>`;
    return;
  }

  container.innerHTML = tanqueos.map(t => `
    <tr class="border-b border-slate-700/40 hover:bg-slate-800/30 text-xs">
      <td class="py-1.5 px-3 text-slate-300 font-mono">${t.fecha}</td>
      <td class="py-1.5 px-3 text-right font-medium text-amber-300 font-mono">${formatCOP(t.monto)}</td>
    </tr>
  `).join('');
}

export function renderDevengadoWidget() {
  const listEl = document.getElementById('devengadoItemsList');
  const devengadoInput = document.getElementById('inputDevengadoBase');
  const totalDedEl = document.getElementById('devengadoTotalDeducciones');
  const restanteEl = document.getElementById('devengadoRestante');
  if (!listEl || !devengadoInput || !totalDedEl || !restanteEl) return;

  devengadoInput.value = formatNumber(state.devengadoData.ingresoDevengado);

  let totalDeducciones = 0;
  let html = '';

  (state.devengadoData.items || []).forEach((it, idx) => {
    const m = Number(it.monto) || 0;
    totalDeducciones += m;
    html += `
      <div class="flex items-center justify-between gap-2 p-2 bg-slate-800/60 rounded-xl border border-slate-700/40 text-xs">
        <span class="font-medium text-slate-200 truncate">${it.concepto}</span>
        <div class="flex items-center gap-2">
          <input type="text" inputmode="numeric" oninput="window.formatearInputMiles(this)" value="${formatNumber(m)}" onchange="window.actualizarMontoDevengado(${idx}, this.value)" class="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-right text-xs font-mono text-cyan-300 focus:outline-none focus:border-indigo-500">
          <button onclick="window.eliminarItemDevengado(${idx})" class="text-slate-500 hover:text-rose-400 p-1" title="Eliminar">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>
    `;
  });

  listEl.innerHTML = html;
  totalDedEl.textContent = formatCOP(totalDeducciones);

  const restante = Number(state.devengadoData.ingresoDevengado) - totalDeducciones;
  restanteEl.textContent = formatCOP(restante);
  restanteEl.className = 'text-xl sm:text-2xl font-extrabold font-mono ' + (restante >= 0 ? 'text-emerald-400' : 'text-rose-400');
}

export function renderGastosFijosWidget() {
  const listEl = document.getElementById('gastosFijosList');
  const totalMensualEl = document.getElementById('gastosFijosTotalMensual');
  const totalQuincenalEl = document.getElementById('gastosFijosTotalQuincenal');
  if (!listEl || !totalMensualEl || !totalQuincenalEl) return;

  let totalMensual = 0;
  let html = '';

  (state.gastosFijos || []).forEach((gf, idx) => {
    const p = Number(gf.presupuesto) || 0;
    totalMensual += p;
    html += `
      <div class="flex items-center justify-between gap-2 p-2 bg-slate-800/60 rounded-xl border border-slate-700/40 text-xs">
        <span class="font-medium text-slate-200 truncate">${gf.nombre}</span>
        <div class="flex items-center gap-2">
          <input type="text" inputmode="numeric" oninput="window.formatearInputMiles(this)" value="${formatNumber(p)}" onchange="window.actualizarPresupuestoGastoFijo(${idx}, this.value)" class="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-right text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500">
          <button onclick="window.eliminarGastoFijo(${idx})" class="text-slate-500 hover:text-rose-400 p-1" title="Eliminar">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>
    `;
  });

  listEl.innerHTML = html;
  totalMensualEl.textContent = formatCOP(totalMensual);
  totalQuincenalEl.textContent = formatCOP(totalMensual / 2);
}

export function renderCentroAlertasFinancieras(mesRecords) {
  const container = document.getElementById('dashCentroAlertasContainer');
  if (!container) return;

  const totalCuotasDeudas = (state.deudas || []).reduce((acc, d) => acc + (Number(d.cuota_mensual) || 0), 0);
  const egresosDeudasMes = (mesRecords || []).filter(r => r.tipo === 'Egreso' && r.categoria === 'Deudas');
  const pagadoDeudasMes = egresosDeudasMes.reduce((acc, r) => acc + (Number(r.monto) || 0), 0);
  const pendienteDeudasMes = Math.max(0, totalCuotasDeudas - pagadoDeudasMes);
  const deudasCubiertas = totalCuotasDeudas > 0 && pagadoDeudasMes >= totalCuotasDeudas;

  const ultimoAceite = (state.cambiosAceite && state.cambiosAceite.length > 0) ? state.cambiosAceite[0] : null;
  const kmUltimo = ultimoAceite ? Number(ultimoAceite.kilometraje) || 0 : 0;
  const kmSugerido = kmUltimo > 0 ? kmUltimo + 3000 : 0;

  const ingresoTotalEsperado = (Number(state.ingresoQuincena1) || 0) + (Number(state.ingresoQuincena2) || 0);
  const gastosFijosTotal = (state.gastosFijos || []).reduce((acc, gf) => acc + (Number(gf.presupuesto) || 0), 0);
  const variablesGastados = (mesRecords || []).filter(r => r.tipo === 'Egreso' && r.categoria === 'Gastos').reduce((acc, r) => acc + (Number(r.monto) || 0), 0);
  const sobranteProyectado = ingresoTotalEsperado - gastosFijosTotal - totalCuotasDeudas - variablesGastados;

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div class="bg-slate-900/80 border ${deudasCubiertas ? 'border-emerald-600/40 bg-emerald-950/20' : 'border-indigo-600/40'} rounded-xl p-3 flex items-start gap-3 shadow-md">
        <div class="p-2 rounded-lg ${deudasCubiertas ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'} shrink-0 mt-0.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-300">Cuotas de Deuda</span>
            <span class="text-[10px] px-2 py-0.5 rounded-full font-bold ${deudasCubiertas ? 'bg-emerald-900/60 text-emerald-300' : 'bg-indigo-900/60 text-indigo-300'}">
              ${deudasCubiertas ? '✓ Al día' : 'En curso'}
            </span>
          </div>
          <p class="text-xs font-mono font-semibold text-slate-100 mt-1">
            ${formatCOP(pagadoDeudasMes)} <span class="text-slate-400 font-normal">de ${formatCOP(totalCuotasDeudas)}</span>
          </p>
          <p class="text-[10px] text-slate-400 mt-0.5 truncate">
            ${pendienteDeudasMes > 0 ? `Faltan ${formatCOP(pendienteDeudasMes)} por cubrir este mes` : 'Sin cuotas pendientes este mes'}
          </p>
        </div>
      </div>

      <div class="bg-slate-900/80 border ${sobranteProyectado >= 0 ? 'border-emerald-600/40' : 'border-rose-600/40 bg-rose-950/20'} rounded-xl p-3 flex items-start gap-3 shadow-md">
        <div class="p-2 rounded-lg ${sobranteProyectado >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'} shrink-0 mt-0.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-300">Sobrante Proyectado</span>
            <span class="text-[10px] px-2 py-0.5 rounded-full font-bold ${sobranteProyectado >= 0 ? 'bg-emerald-900/60 text-emerald-300' : 'bg-rose-900/60 text-rose-300'}">
              ${sobranteProyectado >= 0 ? 'Disponible' : 'Déficit'}
            </span>
          </div>
          <p class="text-xs font-mono font-bold ${sobranteProyectado >= 0 ? 'text-emerald-400' : 'text-rose-400'} mt-1">
            ${formatCOP(sobranteProyectado)}
          </p>
          <p class="text-[10px] text-slate-400 mt-0.5 truncate">
            ${sobranteProyectado >= 0 ? 'Saldo libre estimado' : 'Ajusta variables para equilibrar el mes'}
          </p>
        </div>
      </div>

      <div class="bg-slate-900/80 border border-amber-600/40 rounded-xl p-3 flex items-start gap-3 shadow-md">
        <div class="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-300">Cambio de Aceite</span>
            <button onclick="window.switchTab('aceite')" class="text-[10px] text-amber-400 hover:underline">Ver historial →</button>
          </div>
          <p class="text-xs font-mono font-semibold text-slate-100 mt-1">
            ${kmUltimo > 0 ? `${formatNumber(kmUltimo)} km (Último)` : 'Sin registrar'}
          </p>
          <p class="text-[10px] text-slate-400 mt-0.5 truncate">
            ${kmSugerido > 0 ? `Próximo cambio sugerido: ~${formatNumber(kmSugerido)} km` : 'Registra tu kilometraje actual'}
          </p>
        </div>
      </div>
    </div>
  `;
}

export function renderSemaforoGastosVariables(mesRecords) {
  const container = document.getElementById('dashSemaforoVariablesContainer');
  if (!container) return;

  const egresosVariables = (mesRecords || []).filter(r => r.tipo === 'Egreso' && r.categoria === 'Gastos');
  const gastado = egresosVariables.reduce((acc, cur) => acc + (Number(cur.monto) || 0), 0);
  const ppto = Number(state.pptoVariablesMes) || 0;
  const pct = ppto > 0 ? (gastado / ppto) * 100 : 0;
  const saldoLibre = Math.max(0, ppto - gastado);

  const hoy = new Date();
  const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
  const diasRestantes = Math.max(1, ultimoDiaMes - hoy.getDate());
  const gastoDiarioSugerido = Math.round(saldoLibre / diasRestantes);

  let estadoTexto = 'Ritmo Saludable (Verde)';
  let colorHex = '#10b981';
  let barraFondo = 'linear-gradient(90deg, #10b981 0%, #059669 100%)';
  let glowSombra = '0 0 12px rgba(16, 185, 129, 0.4)';
  let badgeBg = 'rgba(16, 185, 129, 0.15)';
  let badgeBorder = 'rgba(16, 185, 129, 0.4)';
  let mensaje = ppto > 0 ? `Te sobran ${formatCOP(saldoLibre)} para gastos varios este mes.` : 'Configura un cupo mensual para activar el semáforo.';
  let activoVerde = true, activoAmarillo = false, activoRojo = false;

  if (pct > 70 && pct <= 90) {
    estadoTexto = 'Atención (Amarillo)';
    colorHex = '#f59e0b';
    barraFondo = 'linear-gradient(90deg, #10b981 0%, #f59e0b 100%)';
    glowSombra = '0 0 12px rgba(245, 158, 11, 0.4)';
    badgeBg = 'rgba(245, 158, 11, 0.15)';
    badgeBorder = 'rgba(245, 158, 11, 0.4)';
    mensaje = `Has consumido el ${pct.toFixed(0)}% de tu cupo variable. Te quedan ${formatCOP(saldoLibre)}.`;
    activoVerde = false; activoAmarillo = true;
  } else if (pct > 90) {
    estadoTexto = 'Alerta Máxima (Rojo)';
    colorHex = '#ef4444';
    barraFondo = 'linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)';
    glowSombra = '0 0 14px rgba(239, 68, 68, 0.5)';
    badgeBg = 'rgba(239, 68, 68, 0.15)';
    badgeBorder = 'rgba(239, 68, 68, 0.4)';
    mensaje = `¡Cuidado! Te queda solo ${formatCOP(saldoLibre)}.`;
    activoVerde = false; activoRojo = true;
  }

  container.innerHTML = `
    <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3.5" style="border-color: ${badgeBorder}">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
            <span style="width: 12px; height: 12px; border-radius: 50%; background-color: ${activoVerde ? '#10b981' : '#064e3b'}; display: inline-block;"></span>
            <span style="width: 12px; height: 12px; border-radius: 50%; background-color: ${activoAmarillo ? '#f59e0b' : '#78350f'}; display: inline-block;"></span>
            <span style="width: 12px; height: 12px; border-radius: 50%; background-color: ${activoRojo ? '#ef4444' : '#7f1d1d'}; display: inline-block;"></span>
          </div>
          <div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-100">Semáforo de Gastos Variables & Hormiga</h3>
            <p class="text-[11px] text-slate-400">Control visual de presupuesto, salidas y consumos imprevistos</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="window.editarPresupuestoVariables()" class="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1 font-mono">
            <span>⚙️ Ppto:</span>
            <strong class="text-indigo-300">${formatCOP(ppto)}</strong>
          </button>
          <span class="text-xs px-3 py-1 rounded-full font-bold border" style="background-color: ${badgeBg}; color: ${colorHex}; border-color: ${badgeBorder};">
            ${estadoTexto}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
        <div>
          <span class="text-[10px] text-slate-400 block uppercase font-medium">Gastado este Mes</span>
          <span class="text-base sm:text-lg font-bold font-mono" style="color: ${colorHex}">${formatCOP(gastado)}</span>
        </div>
        <div>
          <span class="text-[10px] text-slate-400 block uppercase font-medium">Cupo Asignado</span>
          <span class="text-base sm:text-lg font-bold font-mono text-slate-200">${formatCOP(ppto)}</span>
        </div>
        <div>
          <span class="text-[10px] text-slate-400 block uppercase font-medium">Disponible Restante</span>
          <span class="text-base sm:text-lg font-bold font-mono text-emerald-400">${formatCOP(saldoLibre)}</span>
        </div>
        <div>
          <span class="text-[10px] text-slate-400 block uppercase font-medium">Sugerido por Día</span>
          <span class="text-base sm:text-lg font-bold font-mono text-cyan-300">${formatCOP(gastoDiarioSugerido)}/día</span>
        </div>
      </div>

      <div class="space-y-1.5 pt-1">
        <div class="flex justify-between items-center text-xs font-mono">
          <span class="text-slate-300 font-medium">Avance del Gasto: <strong style="color: ${colorHex}; font-size: 13px;">${pct.toFixed(1)}%</strong></span>
          <span class="text-slate-400 text-[11px]">${mensaje}</span>
        </div>
        <div style="background-color: #0b132b; height: 16px; border-radius: 9999px; overflow: hidden; border: 1px solid #334155; padding: 2px;">
          <div style="height: 100%; border-radius: 9999px; width: ${Math.min(100, Math.max(3, pct))}%; background: ${barraFondo}; transition: width 0.7s; box-shadow: ${glowSombra};"></div>
        </div>
      </div>
    </div>
  `;
}

export function renderPlanificadorQuincenal(mesRecords) {
  const container = document.getElementById('dashPlanificadorQuincenalContainer');
  if (!container) return;

  const hoyDia = new Date().getDate();
  const esQ1Activa = hoyDia <= 15;

  const q1Records = (mesRecords || []).filter(r => r.fecha && (Number(r.fecha.slice(8, 10)) || 1) <= 15);
  const q2Records = (mesRecords || []).filter(r => r.fecha && (Number(r.fecha.slice(8, 10)) || 1) > 15);

  const egresosQ1 = q1Records.filter(r => r.tipo === 'Egreso').reduce((acc, c) => acc + (Number(c.monto) || 0), 0);
  const egresosQ2 = q2Records.filter(r => r.tipo === 'Egreso').reduce((acc, c) => acc + (Number(c.monto) || 0), 0);

  const ingresoQ1 = Number(state.ingresoQuincena1) || 0;
  const ingresoQ2 = Number(state.ingresoQuincena2) || 0;

  const saldoQ1 = ingresoQ1 - egresosQ1;
  const saldoQ2 = ingresoQ2 - egresosQ2;

  container.innerHTML = `
    <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-indigo-300">Planificador de Quincenas (Flujo de Caja: Días 1-15 vs 16-30)</h3>
          <p class="text-[11px] text-slate-400">Controla qué entra y qué debes cubrir en cada quincena</p>
        </div>
        <button onclick="window.editarIngresosQuincenales()" class="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors w-fit">
          ⚙️ Ajustar Ingresos Q1/Q2
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-slate-800/40 border ${esQ1Activa ? 'border-emerald-500/60 ring-2 ring-emerald-500/20' : 'border-slate-700/40'} rounded-xl p-3.5 space-y-3 relative">
          <div class="flex items-center gap-2">
            <span class="w-7 h-7 rounded-lg bg-indigo-600/30 flex items-center justify-center font-bold text-xs text-indigo-300">Q1</span>
            <div class="text-xs font-bold text-slate-200">1.ª Quincena (Días 1 al 15)</div>
          </div>
          <div class="grid grid-cols-3 gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <div>
              <span class="text-[10px] text-slate-400 block">Ingreso Base</span>
              <span class="text-xs font-bold font-mono text-emerald-300">${formatCOP(ingresoQ1)}</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 block">Gastado</span>
              <span class="text-xs font-bold font-mono text-rose-300">${formatCOP(egresosQ1)}</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 block">Saldo Restante</span>
              <span class="text-xs font-bold font-mono ${saldoQ1 >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${formatCOP(saldoQ1)}</span>
            </div>
          </div>
        </div>

        <div class="bg-slate-800/40 border ${!esQ1Activa ? 'border-emerald-500/60 ring-2 ring-emerald-500/20' : 'border-slate-700/40'} rounded-xl p-3.5 space-y-3 relative">
          <div class="flex items-center gap-2">
            <span class="w-7 h-7 rounded-lg bg-purple-600/30 flex items-center justify-center font-bold text-xs text-purple-300">Q2</span>
            <div class="text-xs font-bold text-slate-200">2.ª Quincena (Días 16 al Fin de mes)</div>
          </div>
          <div class="grid grid-cols-3 gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <div>
              <span class="text-[10px] text-slate-400 block">Ingreso Base</span>
              <span class="text-xs font-bold font-mono text-emerald-300">${formatCOP(ingresoQ2)}</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 block">Gastado</span>
              <span class="text-xs font-bold font-mono text-rose-300">${formatCOP(egresosQ2)}</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 block">Saldo Restante</span>
              <span class="text-xs font-bold font-mono ${saldoQ2 >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${formatCOP(saldoQ2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderMetasAhorroWidget() {
  const container = document.getElementById('dashMetasAhorroContainer');
  if (!container) return;

  const metas = state.metasAhorro || [];
  let html = `
    <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-4">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-100">Bolsillos & Metas de Ahorro Programado</h3>
          <p class="text-[11px] text-slate-400">Ahorro con nombre y objetivo para no gastarlo en imprevistos</p>
        </div>
        <button onclick="window.abrirModalNuevaMetaAhorro()" class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow">
          + Nueva Meta
        </button>
      </div>
  `;

  if (metas.length === 0) {
    html += `
      <div class="p-6 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
        <p class="text-xs font-semibold text-slate-300">No tienes bolsillos o metas de ahorro activas</p>
        <p class="text-[11px] text-slate-500 mt-1">Haz clic en <button onclick="window.abrirModalNuevaMetaAhorro()" class="text-emerald-400 underline font-semibold">+ Nueva Meta</button> para crear una.</p>
      </div>
    </div>`;
    container.innerHTML = html;
    return;
  }

  html += `<div class="grid grid-cols-1 md:grid-cols-3 gap-3.5">`;
  metas.forEach((m, idx) => {
    const meta = Number(m.meta) || 1;
    const actual = Number(m.actual) || 0;
    const pct = Math.min(100, Math.max(0, (actual / meta) * 100));
    html += `
      <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3.5 space-y-2.5 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-200">${m.nombre}</span>
            <span class="text-[11px] font-bold font-mono text-emerald-400">${pct.toFixed(0)}%</span>
          </div>
          <div class="mt-2 space-y-1">
            <div class="flex justify-between text-[11px] font-mono text-slate-400">
              <span>Ahorrado: <strong class="text-slate-100">${formatCOP(actual)}</strong></span>
              <span>Meta: ${formatCOP(meta)}</span>
            </div>
            <div class="w-full bg-slate-700/60 h-2 rounded-full overflow-hidden">
              <div class="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full" style="width: ${pct}%"></div>
            </div>
          </div>
        </div>
        <div class="pt-2 border-t border-slate-700/40 flex items-center justify-between gap-2">
          <button onclick="window.abrirModalAporteMeta(${idx})" class="w-full py-1.5 px-2 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 hover:text-white border border-emerald-500/40 text-[11px] font-bold">
            + Aportar
          </button>
          <button onclick="window.eliminarMetaAhorro(${idx})" class="p-1.5 text-slate-500 hover:text-rose-400">✕</button>
        </div>
      </div>
    `;
  });
  html += `</div></div>`;
  container.innerHTML = html;
}

export function renderSimuladorAvalancha() {
  const container = document.getElementById('simuladorAvalanchaContainer');
  if (!container) return;

  const abono = Number(state.montoSimuladorDeudas) || 200000;
  const ordenadas = [...(state.deudas || [])].sort((a, b) => (Number(b.tasa_ea) || 0) - (Number(a.tasa_ea) || 0));

  let html = `
    <div class="bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-700/40 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4 mb-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-900/60 pb-3">
        <div>
          <h3 class="text-sm font-bold text-white uppercase tracking-wider">Simulador de Abonos Extra (Efecto Avalancha)</h3>
          <p class="text-xs text-slate-400 mt-1">Simula qué pasa si abonas un dinero extra y a cuál deuda conviene pagarle primero.</p>
        </div>
        <div class="flex items-center gap-1">
          <button onclick="window.cambiarMontoSimulador(100000)" class="px-2 py-1 text-[11px] rounded ${abono === 100000 ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-800 text-slate-300 border border-slate-700'} font-mono">$100k</button>
          <button onclick="window.cambiarMontoSimulador(200000)" class="px-2 py-1 text-[11px] rounded ${abono === 200000 ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-800 text-slate-300 border border-slate-700'} font-mono">$200k</button>
          <button onclick="window.cambiarMontoSimulador(500000)" class="px-2 py-1 text-[11px] rounded ${abono === 500000 ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-800 text-slate-300 border border-slate-700'} font-mono">$500k</button>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
  `;

  ordenadas.forEach((d, idx) => {
    const tasa = Number(d.tasa_ea) || 0;
    const esTop = idx === 0 && tasa > 0;
    html += `
      <div class="bg-slate-900/90 border ${esTop ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-slate-800'} rounded-xl p-3.5 flex flex-col justify-between space-y-3">
        <div>
          <div class="flex items-center justify-between">
            <span class="font-bold text-sm text-slate-100">${d.nombre}</span>
            <span class="text-xs font-mono font-bold text-indigo-300">${(tasa * 100).toFixed(2)}% E.A.</span>
          </div>
          <div class="mt-2.5 text-xs font-mono flex justify-between text-slate-400">
            <span>Saldo Pendiente:</span>
            <span class="text-slate-200 font-bold">${formatCOP(d.saldo_pendiente)}</span>
          </div>
        </div>
        <button onclick="window.abrirModalAbonoConMonto('${d.id}', ${abono})" class="w-full py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs">
          Abonar ${formatCOP(abono)} →
        </button>
      </div>
    `;
  });

  html += `</div></div>`;
  container.innerHTML = html;
}

export async function registrarGastoCalle(concepto, monto, categoria = 'Gastos') {
  const hoyStr = new Date().toISOString().slice(0, 10);
  await agregarRegistro({
    fecha: hoyStr,
    tipo: 'Egreso',
    categoria: categoria,
    concepto: concepto,
    presupuesto: monto,
    monto: monto
  });
  showToast(`¡Listo! ${concepto} (${formatCOP(monto)}) registrado.`, 'success');
}

function renderTablaResumen(containerId, categorias, porCategoria) {
  const tbody = document.getElementById(containerId);
  if (!tbody) return;

  let totalPpto = 0, totalReal = 0;
  let html = '';

  categorias.forEach(cat => {
    const data = porCategoria[cat] || { real: 0, ppto: 0 };
    totalPpto += data.ppto;
    totalReal += data.real;
    const dif = data.real - data.ppto;
    html += `
      <tr class="border-b border-slate-700/50 hover:bg-slate-800/40 text-sm">
        <td class="py-2 px-3 font-medium text-slate-200">${cat}</td>
        <td class="py-2 px-3 text-right text-slate-400 font-mono text-xs">${formatCOP(data.ppto)}</td>
        <td class="py-2 px-3 text-right font-semibold text-slate-100 font-mono text-xs">${formatCOP(data.real)}</td>
        <td class="py-2 px-3 text-right font-mono text-xs ${dif > 0 ? 'text-amber-400' : 'text-slate-400'}">${dif === 0 ? '-' : (dif > 0 ? '+' : '') + formatCOP(dif)}</td>
      </tr>
    `;
  });

  const totalDif = totalReal - totalPpto;
  html += `
    <tr class="bg-slate-800/80 font-bold text-sm text-slate-100">
      <td class="py-2 px-3">Total</td>
      <td class="py-2 px-3 text-right text-slate-300 font-mono text-xs">${formatCOP(totalPpto)}</td>
      <td class="py-2 px-3 text-right text-emerald-400 font-mono text-xs">${formatCOP(totalReal)}</td>
      <td class="py-2 px-3 text-right text-slate-300 font-mono text-xs">${totalDif === 0 ? '-' : (totalDif > 0 ? '+' : '') + formatCOP(totalDif)}</td>
    </tr>
  `;
  tbody.innerHTML = html;
}

function renderTablaDetalleConceptos(containerId, records) {
  const tbody = document.getElementById(containerId);
  if (!tbody) return;

  if (records.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="py-3 px-3 text-center text-xs text-slate-500 italic">Sin movimientos este mes</td></tr>`;
    return;
  }

  const agrupado = {};
  records.forEach(r => {
    if (!agrupado[r.concepto]) agrupado[r.concepto] = { ppto: 0, monto: 0 };
    agrupado[r.concepto].ppto += Number(r.presupuesto) || 0;
    agrupado[r.concepto].monto += Number(r.monto) || 0;
  });

  let html = '';
  let sumPpto = 0, sumMonto = 0;

  Object.entries(agrupado).forEach(([concepto, val]) => {
    sumPpto += val.ppto;
    sumMonto += val.monto;
    html += `
      <tr class="border-b border-slate-700/40 hover:bg-slate-800/30 text-xs">
        <td class="py-1.5 px-3 text-slate-300">${concepto}</td>
        <td class="py-1.5 px-3 text-right text-slate-400 font-mono">${formatCOP(val.ppto)}</td>
        <td class="py-1.5 px-3 text-right font-medium text-slate-100 font-mono">${formatCOP(val.monto)}</td>
      </tr>
    `;
  });

  html += `
    <tr class="bg-slate-800/60 font-semibold text-xs text-slate-200">
      <td class="py-1.5 px-3">Total</td>
      <td class="py-1.5 px-3 text-right font-mono">${formatCOP(sumPpto)}</td>
      <td class="py-1.5 px-3 text-right text-cyan-400 font-mono">${formatCOP(sumMonto)}</td>
    </tr>
  `;
  tbody.innerHTML = html;
}

function actualizarGraficosDashboard(mesRecords, porCategoria) {
  if (!window.Chart) return;

  const egresoCats = CATEGORIAS_EGRESO.filter(c => (porCategoria[c]?.real || 0) > 0);
  const egresoValores = egresoCats.map(c => porCategoria[c].real);
  const colors = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4'];

  const ctxDoughnut = document.getElementById('chartCategoryDoughnut')?.getContext('2d');
  if (ctxDoughnut) {
    if (state.charts.categoryDoughnut) state.charts.categoryDoughnut.destroy();
    state.charts.categoryDoughnut = new window.Chart(ctxDoughnut, {
      type: 'doughnut',
      data: {
        labels: egresoCats.length ? egresoCats : ['Sin datos'],
        datasets: [{
          data: egresoValores.length ? egresoValores : [1],
          backgroundColor: egresoValores.length ? colors.slice(0, egresoCats.length) : ['#334155'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 11 } } }
        }
      }
    });
  }

  const ano = Number(state.selectedAno);
  const ingresosPorMes = new Array(12).fill(0);
  const egresosPorMes = new Array(12).fill(0);

  state.records.filter(r => Number(r.año) === ano).forEach(r => {
    const idx = MESES.findIndex(m => m.toLowerCase() === (r.mes || '').toLowerCase());
    if (idx !== -1) {
      const m = Number(r.monto) || 0;
      if (r.tipo === 'Ingreso') ingresosPorMes[idx] += m;
      else egresosPorMes[idx] += m;
    }
  });

  const ctxBar = document.getElementById('chartIncomeExpense')?.getContext('2d');
  if (ctxBar) {
    if (state.charts.incomeExpense) state.charts.incomeExpense.destroy();
    state.charts.incomeExpense = new window.Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: MESES.map(m => m.substring(0, 3)),
        datasets: [
          { label: 'Ingresos', data: ingresosPorMes, backgroundColor: '#10b981', borderRadius: 4 },
          { label: 'Egresos', data: egresosPorMes, backgroundColor: '#f43f5e', borderRadius: 4 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
          y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8', font: { size: 10 } } }
        },
        plugins: { legend: { position: 'top', labels: { color: '#cbd5e1', font: { size: 11 } } } }
      }
    });
  }
}

// ==========================================================
// RENDERIZADO DE DEUDAS
// ==========================================================

export function renderDeudas() {
  const tbody = document.getElementById('tablaConsolidadoDeudasBody');
  if (!tbody) return;

  renderSimuladorAvalancha();

  let totalInicial = 0, totalPendiente = 0, totalCuota = 0;
  let html = '';

  (state.deudas || []).forEach(d => {
    totalInicial += Number(d.saldo_inicial) || 0;
    totalPendiente += Number(d.saldo_pendiente) || 0;
    totalCuota += Number(d.cuota_mensual) || 0;

    const amortizado = d.saldo_inicial - d.saldo_pendiente;
    const pct = d.pct_pagado || (d.saldo_inicial > 0 ? Math.min(100, Math.max(0, (amortizado / d.saldo_inicial) * 100)) : 0);
    const isExpanded = state.deudaExpandidaId === d.id;

    html += `
      <tr class="border-b border-slate-700/60 hover:bg-slate-800/50 cursor-pointer transition-colors ${isExpanded ? 'bg-slate-800/80 font-bold' : ''}" onclick="window.toggleExpandirDeuda('${d.id}')">
        <td class="py-3 px-3.5 flex items-center gap-2">
          <span class="w-6 h-6 rounded-lg bg-indigo-600/30 flex items-center justify-center text-indigo-300">
            <svg class="w-3.5 h-3.5 transform transition-transform ${isExpanded ? 'rotate-90' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
          </span>
          <span class="font-bold text-slate-100 text-sm">${d.nombre}</span>
        </td>
        <td class="py-3 px-3 text-right font-mono text-slate-300 text-xs">${formatCOP(d.saldo_inicial)}</td>
        <td class="py-3 px-3 text-center text-xs font-mono text-indigo-300">${(d.tasa_ea * 100).toFixed(2)}%</td>
        <td class="py-3 px-3 text-right font-mono text-cyan-300 text-xs font-semibold">${formatCOP(d.cuota_mensual)}</td>
        <td class="py-3 px-3 text-right font-mono text-rose-300 text-xs font-bold">${formatCOP(d.saldo_pendiente)}</td>
        <td class="py-3 px-3 text-center">
          <span class="text-xs font-bold text-emerald-400 font-mono">${pct.toFixed(1)}%</span>
        </td>
        <td class="py-3 px-3 text-center" onclick="event.stopPropagation()">
          <button onclick="window.abrirModalAbono('${d.id}')" class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600/40 hover:bg-indigo-600 text-indigo-200 border border-indigo-500/40">
            + Abono
          </button>
        </td>
      </tr>
    `;

    if (isExpanded) {
      const schedule = getAmortizacionSchedule(d);
      html += `
        <tr class="bg-slate-950/90 border-b border-indigo-900/50">
          <td colspan="7" class="p-3 sm:p-4">
            <div class="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-3">
              <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                <span class="text-xs font-bold uppercase tracking-wider text-indigo-300">Tabla de Amortización: ${d.nombre}</span>
                <button onclick="window.toggleExpandirDeuda('${d.id}')" class="text-xs text-slate-400 hover:text-white">✕ Ocultar</button>
              </div>
              <div class="max-h-72 overflow-y-auto">
                <table class="w-full text-left text-xs">
                  <thead class="sticky top-0 bg-slate-900 text-slate-400 border-b border-slate-800 text-[10px] uppercase">
                    <tr>
                      <th class="py-1.5 px-2">N.º</th>
                      <th class="py-1.5 px-2">Fecha Pago</th>
                      <th class="py-1.5 px-2 text-right">Saldo Inicial</th>
                      <th class="py-1.5 px-2 text-right">Cuota</th>
                      <th class="py-1.5 px-2 text-right">Interés</th>
                      <th class="py-1.5 px-2 text-right">Saldo Final</th>
                      <th class="py-1.5 px-2 text-center">Estado</th>
                      <th class="py-1.5 px-2 text-right">Abono</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${schedule.map((q, qIdx) => {
                      const isPagado = (q.estado || '').toUpperCase() === 'PAGADO';
                      return `
                        <tr class="border-b border-slate-800/40 hover:bg-slate-800/30">
                          <td class="py-1.5 px-2 font-mono text-slate-400">${q.num}</td>
                          <td class="py-1.5 px-2 font-mono text-slate-300">${q.fecha || '-'}</td>
                          <td class="py-1.5 px-2 text-right font-mono text-slate-300">${formatCOP(q.saldo_inicial)}</td>
                          <td class="py-1.5 px-2 text-right font-mono text-slate-200 font-semibold">${formatCOP(q.cuota)}</td>
                          <td class="py-1.5 px-2 text-right font-mono text-slate-400">${formatCOP(q.interes)}</td>
                          <td class="py-1.5 px-2 text-right font-mono text-slate-300">${formatCOP(q.saldo_final)}</td>
                          <td class="py-1.5 px-2 text-center">
                            <button onclick="window.toggleEstadoCuota('${d.id}', ${qIdx})" class="px-2 py-0.5 rounded text-[10px] font-bold ${isPagado ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' : 'bg-slate-800 text-slate-400'}">
                              ${isPagado ? 'PAGADO ✓' : 'PENDIENTE'}
                            </button>
                          </td>
                          <td class="py-1.5 px-2 text-right font-mono text-slate-400">${q.abono > 0 ? formatCOP(q.abono) : '-'}</td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </td>
        </tr>
      `;
    }
  });

  if (state.deudas.length === 0) {
    html = `<tr><td colspan="7" class="py-6 text-center text-slate-500 text-xs italic">No hay deudas registradas.</td></tr>`;
  }

  tbody.innerHTML = html;
  const totalAmort = totalInicial - totalPendiente;
  const totalPct = totalInicial > 0 ? (totalAmort / totalInicial) * 100 : 0;

  const elTotPend = document.getElementById('deudasTotalPendiente');
  if (elTotPend) elTotPend.textContent = formatCOP(totalPendiente);
  const elTotCuota = document.getElementById('deudasTotalCuota');
  if (elTotCuota) elTotCuota.textContent = formatCOP(totalCuota);
  const elTotPct = document.getElementById('deudasTotalPct');
  if (elTotPct) elTotPct.textContent = totalPct.toFixed(1) + '%';
}

// ==========================================================
// CONSOLIDADOS, HISTORIAL Y ACEITE
// ==========================================================

export function renderConsolidados() {
  const ano = Number(state.consolidadoAno || state.selectedAno);
  const anoRecords = state.records.filter(r => Number(r.año) === ano);

  const mensualTbody = document.getElementById('tablaConsolidadoMensual');
  if (mensualTbody) {
    let sumIng = 0, sumEg = 0, prevBal = null, html = '';
    MESES.forEach(mes => {
      const mRecs = anoRecords.filter(r => (r.mes || '').toLowerCase() === mes.toLowerCase());
      const ing = mRecs.filter(r => r.tipo === 'Ingreso').reduce((acc, c) => acc + (Number(c.monto) || 0), 0);
      const eg = mRecs.filter(r => r.tipo === 'Egreso').reduce((acc, c) => acc + (Number(c.monto) || 0), 0);
      const bal = ing - eg;
      sumIng += ing; sumEg += eg;
      let difMes = '-';
      if (prevBal !== null && (ing > 0 || eg > 0)) {
        const delta = bal - prevBal;
        difMes = (delta >= 0 ? '+' : '') + formatCOP(delta);
      }
      if (ing > 0 || eg > 0) prevBal = bal;

      html += `
        <tr class="border-b border-slate-700/50 hover:bg-slate-800/30 text-sm">
          <td class="py-2 px-3 font-medium text-slate-200">${mes}</td>
          <td class="py-2 px-3 text-right text-emerald-400 font-mono text-xs">${formatCOP(ing)}</td>
          <td class="py-2 px-3 text-right text-rose-400 font-mono text-xs">${formatCOP(eg)}</td>
          <td class="py-2 px-3 text-right font-mono font-semibold text-xs ${bal >= 0 ? 'text-emerald-300' : 'text-rose-300'}">${formatCOP(bal)}</td>
          <td class="py-2 px-3 text-right font-mono text-xs text-slate-400 hidden sm:table-cell">${difMes}</td>
        </tr>
      `;
    });
    mensualTbody.innerHTML = html;
  }

  const anosTbody = document.getElementById('tablaConsolidadoAnualMulti');
  if (anosTbody) {
    let html = '';
    [2025, 2026, 2027, 2028].forEach(a => {
      const recs = state.records.filter(r => Number(r.año) === a);
      const ing = recs.filter(r => r.tipo === 'Ingreso').reduce((acc, c) => acc + (Number(c.monto) || 0), 0);
      const eg = recs.filter(r => r.tipo === 'Egreso').reduce((acc, c) => acc + (Number(c.monto) || 0), 0);
      const bal = ing - eg;
      html += `
        <tr class="border-b border-slate-700/50 hover:bg-slate-800/30 text-sm">
          <td class="py-2 px-3 font-bold text-slate-100">${a}</td>
          <td class="py-2 px-3 text-right text-emerald-400 font-mono text-xs">${formatCOP(ing)}</td>
          <td class="py-2 px-3 text-right text-rose-400 font-mono text-xs">${formatCOP(eg)}</td>
          <td class="py-2 px-3 text-right font-mono font-semibold text-xs ${bal >= 0 ? 'text-emerald-300' : 'text-rose-300'}">${formatCOP(bal)}</td>
        </tr>
      `;
    });
    anosTbody.innerHTML = html;
  }
  renderComparativoCaraACara();
}

export function renderComparativoCaraACara() {
  const container = document.getElementById('comparativoCaraACaraBody');
  if (!container) return;

  const modo = state.compararModo;
  let label1 = '', label2 = '', recs1 = [], recs2 = [];
  if (modo === 'meses') {
    label1 = `${state.compararMes1} ${state.compararAno1}`;
    label2 = `${state.compararMes2} ${state.compararAno2}`;
    recs1 = state.records.filter(r => (r.mes || '').toLowerCase() === state.compararMes1.toLowerCase() && Number(r.año) === Number(state.compararAno1));
    recs2 = state.records.filter(r => (r.mes || '').toLowerCase() === state.compararMes2.toLowerCase() && Number(r.año) === Number(state.compararAno2));
  } else {
    label1 = `Año ${state.compararAno1}`;
    label2 = `Año ${state.compararAno2}`;
    recs1 = state.records.filter(r => Number(r.año) === Number(state.compararAno1));
    recs2 = state.records.filter(r => Number(r.año) === Number(state.compararAno2));
  }

  const h1 = document.getElementById('compColHeader1');
  if (h1) h1.textContent = label1;
  const h2 = document.getElementById('compColHeader2');
  if (h2) h2.textContent = label2;

  const ing1 = recs1.filter(r => r.tipo === 'Ingreso').reduce((acc, c) => acc + (Number(c.monto) || 0), 0);
  const ing2 = recs2.filter(r => r.tipo === 'Ingreso').reduce((acc, c) => acc + (Number(c.monto) || 0), 0);
  const eg1 = recs1.filter(r => r.tipo === 'Egreso').reduce((acc, c) => acc + (Number(c.monto) || 0), 0);
  const eg2 = recs2.filter(r => r.tipo === 'Egreso').reduce((acc, c) => acc + (Number(c.monto) || 0), 0);

  container.innerHTML = `
    <tr class="bg-slate-800/80 font-bold border-b border-slate-700/60 text-xs">
      <td class="py-2.5 px-3 text-emerald-400">Ingresos Totales</td>
      <td class="py-2.5 px-3 text-right font-mono">${formatCOP(ing1)}</td>
      <td class="py-2.5 px-3 text-right font-mono">${formatCOP(ing2)}</td>
      <td class="py-2.5 px-3 text-right font-mono">${formatCOP(ing2 - ing1)}</td>
    </tr>
    <tr class="bg-slate-800/80 font-bold border-b border-slate-700/60 text-xs">
      <td class="py-2.5 px-3 text-rose-400">Egresos Totales</td>
      <td class="py-2.5 px-3 text-right font-mono">${formatCOP(eg1)}</td>
      <td class="py-2.5 px-3 text-right font-mono">${formatCOP(eg2)}</td>
      <td class="py-2.5 px-3 text-right font-mono">${formatCOP(eg2 - eg1)}</td>
    </tr>
  `;
}

export function renderHistorial() {
  const tbody = document.getElementById('tablaHistorialBody');
  if (!tbody) return;

  let filtrados = [...state.records];
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    filtrados = filtrados.filter(r =>
      (r.concepto || '').toLowerCase().includes(q) ||
      (r.categoria || '').toLowerCase().includes(q)
    );
  }
  if (state.filterTipo !== 'todos') filtrados = filtrados.filter(r => r.tipo === state.filterTipo);
  if (state.filterCategoria !== 'todas') filtrados = filtrados.filter(r => r.categoria === state.filterCategoria);

  const countEl = document.getElementById('historialTotalCount');
  if (countEl) countEl.textContent = `${filtrados.length} movimientos`;

  const totalPages = Math.ceil(filtrados.length / state.pageSize) || 1;
  if (state.currentPage > totalPages) state.currentPage = totalPages;
  const start = (state.currentPage - 1) * state.pageSize;
  const paginados = filtrados.slice(start, start + state.pageSize);

  if (paginados.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-slate-500">Sin movimientos registrados.</td></tr>`;
    return;
  }

  tbody.innerHTML = paginados.map(r => {
    const isIngreso = r.tipo === 'Ingreso';
    return `
      <tr class="border-b border-slate-700/50 hover:bg-slate-800/40 text-sm">
        <td class="py-2.5 px-3 text-slate-300 font-mono text-xs">${r.fecha || ''}</td>
        <td class="py-2.5 px-3"><span class="px-2 py-0.5 rounded text-xs font-semibold ${isIngreso ? 'bg-emerald-950/80 text-emerald-300' : 'bg-rose-950/80 text-rose-300'}">${r.tipo}</span></td>
        <td class="py-2.5 px-3 text-slate-300">${r.categoria || ''}</td>
        <td class="py-2.5 px-3 text-slate-200">${r.concepto || ''}</td>
        <td class="py-2.5 px-3 text-right text-slate-400 font-mono text-xs">${formatCOP(r.presupuesto)}</td>
        <td class="py-2.5 px-3 text-right font-semibold font-mono ${isIngreso ? 'text-emerald-400' : 'text-slate-100'}">${formatCOP(r.monto)}</td>
        <td class="py-2.5 px-3 text-center"><button onclick="window.eliminarItem('${r.id}')" class="text-slate-500 hover:text-rose-400">✕</button></td>
      </tr>
    `;
  }).join('');
}

export function renderAceite() {
  const listContainer = document.getElementById('aceiteHistorialList');
  if (!listContainer) return;

  const ordenados = [...(state.cambiosAceite || [])].sort((a, b) => Number(b.kilometraje) - Number(a.kilometraje));
  const ultimo = ordenados[0] || { kilometraje: 0, fecha: '-' };

  const elUltKm = document.getElementById('aceiteUltimoKm');
  if (elUltKm) elUltKm.textContent = formatNumber(ultimo.kilometraje) + ' km';
  const elUltFecha = document.getElementById('aceiteUltimaFecha');
  if (elUltFecha) elUltFecha.textContent = ultimo.fecha;
  const elProxKm = document.getElementById('aceiteProximoKm');
  if (elProxKm) elProxKm.textContent = (ultimo.kilometraje > 0 ? formatNumber(Number(ultimo.kilometraje) + 2500) : '0') + ' km';

  listContainer.innerHTML = ordenados.map(c => `
    <tr class="border-b border-slate-700/50 text-sm">
      <td class="py-2.5 px-3 text-slate-300 font-mono text-xs">${c.fecha}</td>
      <td class="py-2.5 px-3 font-semibold text-slate-100 font-mono">${formatNumber(c.kilometraje)} km</td>
      <td class="py-2.5 px-3 text-right text-slate-400 font-mono text-xs">+2.500 km</td>
      <td class="py-2.5 px-3 text-slate-400 text-xs">${c.notas || 'Cambio de aceite'}</td>
    </tr>
  `).join('');
}

export async function agregarCambioAceite(fecha, km, notas = '') {
  const kmNum = Number(km);
  if (!fecha || isNaN(kmNum) || kmNum <= 0) return;

  const nuevo = { id: 'oil_' + Date.now(), fecha, kilometraje: kmNum, notas: notas || 'Cambio de aceite' };
  if (state.isConnectedToSupabase && supabaseClient && getActiveUser() === 'dgcano') {
    await supabaseClient.from('cambio_aceite').insert([{ fecha, kilometraje: kmNum, notas: nuevo.notas }]);
  }
  state.cambiosAceite.unshift(nuevo);
  guardarEnLocalStorage();
  renderAceite();
  showToast('Cambio de aceite guardado.', 'success');
}

// ==========================================================
// NAVEGACIÓN Y TOASTS
// ==========================================================

export function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  const colors = {
    info: 'bg-blue-900/90 text-blue-200 border-blue-700',
    success: 'bg-emerald-900/90 text-emerald-200 border-emerald-700',
    warning: 'bg-amber-900/90 text-amber-200 border-amber-700',
    error: 'bg-rose-900/90 text-rose-200 border-rose-700'
  };
  toast.className = `px-4 py-2.5 rounded-lg shadow-xl border text-sm font-medium ${colors[type] || colors.info}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

export function switchTab(tabName) {
  state.currentTab = tabName;

  document.querySelectorAll('.nav-btn').forEach(btn => {
    const isCurrent = btn.dataset.tab === tabName;
    btn.className = isCurrent
      ? 'nav-btn w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
      : 'nav-btn w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-medium text-sm text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors';
  });

  document.querySelectorAll('.drawer-nav-btn').forEach(btn => {
    const isCurrent = btn.dataset.tab === tabName;
    btn.className = isCurrent
      ? 'drawer-nav-btn flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 text-white shadow-lg'
      : 'drawer-nav-btn flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm text-slate-300 hover:bg-slate-800/60';
  });

  document.querySelectorAll('.tab-section').forEach(sec => sec.classList.add('hidden'));
  const activeSec = document.getElementById(`tab-${tabName}`);
  if (activeSec) activeSec.classList.remove('hidden');

  const drawer = document.getElementById('mobileDrawer');
  if (drawer && !drawer.classList.contains('hidden')) drawer.classList.add('hidden');

  if (tabName === 'dashboard') renderDashboard();
  if (tabName === 'historial') renderHistorial();
  if (tabName === 'consolidados') renderConsolidados();
  if (tabName === 'deudas') renderDeudas();
  if (tabName === 'aceite') renderAceite();
  if (tabName === 'uni-semestres') renderUniSemestres(state);
  if (tabName === 'uni-calificaciones') renderUniCalificaciones(state);
  if (tabName === 'uni-calculadora') renderUniCalculadora(state);
  if (tabName === 'emprendimiento') renderEmprendimiento(state);
}

export function actualizarTodaLaApp() {
  renderDashboard();
  renderHistorial();
  renderConsolidados();
  renderDeudas();
  renderAceite();
  if (getActiveUser() === 'kkvargas') renderEmprendimiento(state);
  if (state.currentTab === 'uni-semestres') renderUniSemestres(state);
  if (state.currentTab === 'uni-calificaciones') renderUniCalificaciones(state);
  if (state.currentTab === 'uni-calculadora') renderUniCalculadora(state);
}

// ==========================================================
// MÓDULO UNIVERSIDAD
// ==========================================================

export function toggleAccordion(modulo) {
  if (!state.menuAccordion) state.menuAccordion = { nomina: true, universidad: true };
  state.menuAccordion[modulo] = !state.menuAccordion[modulo];
  renderAccordionUI();
}

export function renderAccordionUI() {
  ['nomina', 'universidad'].forEach(mod => {
    const isExpanded = state.menuAccordion ? state.menuAccordion[mod] !== false : true;
    const contDesk = document.getElementById(`accordion-content-${mod}`);
    const chevronDesk = document.getElementById(`accordion-chevron-${mod}`);
    if (contDesk) contDesk.classList.toggle('hidden', !isExpanded);
    if (chevronDesk) chevronDesk.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)';

    const contMob = document.getElementById(`mobile-accordion-content-${mod}`);
    const chevronMob = document.getElementById(`mobile-accordion-chevron-${mod}`);
    if (contMob) contMob.classList.toggle('hidden', !isExpanded);
    if (chevronMob) chevronMob.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)';
  });
}

export function cambiarSemestreActivo(semestreId) {
  state.activeSemestreId = semestreId;
  localStorage.setItem(getStorageKey('local_active_semestre'), semestreId);
  renderUniSemestres(state);
}

export function abrirModalNuevoSemestre() {
  document.getElementById('modalNuevoSemestre')?.classList.remove('hidden');
}
export function cerrarModalNuevoSemestre() {
  document.getElementById('modalNuevoSemestre')?.classList.add('hidden');
}
export async function confirmarNuevoSemestre() {
  const nombre = document.getElementById('inputNombreSemestre')?.value.trim();
  if (!nombre) return;
  const nuevoSem = { id: 'sem_' + Date.now(), semestre_id: nombre.toLowerCase(), nombre_semestre: nombre, activo: true, materias: [] };
  state.universidadData.push(nuevoSem);
  state.activeSemestreId = nuevoSem.id;
  guardarEnLocalStorage();
  cerrarModalNuevoSemestre();
  renderUniSemestres(state);
}

export function abrirModalNuevaMateria() {
  document.getElementById('modalNuevaMateria')?.classList.remove('hidden');
}
export function cerrarModalNuevaMateria() {
  document.getElementById('modalNuevaMateria')?.classList.add('hidden');
}
export async function confirmarNuevaMateria() {
  const nombre = document.getElementById('inputMateriaNombre')?.value.trim();
  if (!nombre) return;
  const semActual = state.universidadData.find(s => s.id === state.activeSemestreId) || state.universidadData[0];
  if (!semActual) return;
  semActual.materias = semActual.materias || [];
  semActual.materias.push({
    id: 'mat_' + Date.now(),
    nombre,
    codigo: document.getElementById('inputMateriaCodigo')?.value.trim() || 'MAT',
    creditos: Number(document.getElementById('inputMateriaCreditos')?.value) || 3,
    profesor: document.getElementById('inputMateriaProfesor')?.value.trim() || '',
    evaluaciones: [
      { id: 'ev_' + Date.now() + '_1', nombre: 'Corte 1', porcentaje: 30, nota: null },
      { id: 'ev_' + Date.now() + '_2', nombre: 'Corte 2', porcentaje: 30, nota: null },
      { id: 'ev_' + Date.now() + '_3', nombre: 'Final', porcentaje: 40, nota: null }
    ]
  });
  guardarEnLocalStorage();
  cerrarModalNuevaMateria();
  renderUniSemestres(state);
}

export async function eliminarMateria(materiaId) {
  if (!confirm('¿Eliminar materia?')) return;
  const semActual = state.universidadData.find(s => s.id === state.activeSemestreId);
  if (semActual) semActual.materias = semActual.materias.filter(m => m.id !== materiaId);
  guardarEnLocalStorage();
  renderUniSemestres(state);
}

export function irACalificacionesMateria(materiaId) {
  state.activeMateriaId = materiaId;
  switchTab('uni-calificaciones');
}

export function abrirModalNuevaEvaluacion(materiaId) {
  state.activeMateriaId = materiaId;
  document.getElementById('modalNuevaEvaluacion')?.classList.remove('hidden');
}
export function cerrarModalNuevaEvaluacion() {
  document.getElementById('modalNuevaEvaluacion')?.classList.add('hidden');
}
export async function confirmarNuevaEvaluacion() {
  const nombre = document.getElementById('inputEvalNombre')?.value.trim();
  const porcentaje = Number(document.getElementById('inputEvalPorcentaje')?.value);
  const notaVal = document.getElementById('inputEvalNota')?.value;
  const nota = notaVal !== '' ? Number(notaVal) : null;
  if (!nombre || isNaN(porcentaje)) return;
  const semActual = state.universidadData.find(s => s.id === state.activeSemestreId);
  const materia = semActual?.materias.find(m => m.id === state.activeMateriaId);
  if (materia) {
    materia.evaluaciones.push({ id: 'ev_' + Date.now(), nombre, porcentaje, nota });
    guardarEnLocalStorage();
    cerrarModalNuevaEvaluacion();
    renderUniCalificaciones(state);
    renderUniSemestres(state);
  }
}

export async function actualizarNotaEvaluacion(materiaId, evaluacionId, nuevaNotaStr) {
  const semActual = state.universidadData.find(s => s.id === state.activeSemestreId);
  const materia = semActual?.materias.find(m => m.id === materiaId);
  const ev = materia?.evaluaciones.find(e => e.id === evaluacionId);
  if (ev) {
    ev.nota = nuevaNotaStr === '' ? null : Math.min(5.0, Math.max(0.0, parseFloat(nuevaNotaStr)));
    guardarEnLocalStorage();
    renderUniCalificaciones(state);
    renderUniSemestres(state);
  }
}

export async function eliminarEvaluacion(materiaId, evaluacionId) {
  const semActual = state.universidadData.find(s => s.id === state.activeSemestreId);
  const materia = semActual?.materias.find(m => m.id === materiaId);
  if (materia) {
    materia.evaluaciones = materia.evaluaciones.filter(e => e.id !== evaluacionId);
    guardarEnLocalStorage();
    renderUniCalificaciones(state);
    renderUniSemestres(state);
  }
}

export function agregarFilaCalculadora() {
  state.calculadoraRows = state.calculadoraRows || [];
  state.calculadoraRows.push({ id: 'calc_' + Date.now(), nombre: `Nota ${state.calculadoraRows.length + 1}`, porcentaje: 20, nota: null });
  guardarEnLocalStorage();
  renderUniCalculadora(state);
}
export function eliminarFilaCalculadora(id) {
  state.calculadoraRows = (state.calculadoraRows || []).filter(r => r.id !== id);
  guardarEnLocalStorage();
  renderUniCalculadora(state);
}
export function actualizarFilaCalculadora(id, campo, valor) {
  const row = (state.calculadoraRows || []).find(r => r.id === id);
  if (!row) return;
  if (campo === 'nombre') row.nombre = valor;
  if (campo === 'porcentaje') row.porcentaje = Math.max(0, Math.min(100, Number(valor) || 0));
  if (campo === 'nota') row.nota = valor === '' ? null : Math.min(5.0, Math.max(0.0, parseFloat(valor)));
  guardarEnLocalStorage();
  renderUniCalculadora(state);
}
export function cambiarMetaCalculadora(meta) {
  state.calculadoraMeta = parseFloat(meta) || 3.0;
  guardarEnLocalStorage();
  renderUniCalculadora(state);
}
export function cargarPresetCalculadora() {}
export function limpiarCalculadora() {
  state.calculadoraRows = [
    { id: 'c1', nombre: 'Nota 1', porcentaje: 50, nota: null },
    { id: 'c2', nombre: 'Nota 2', porcentaje: 50, nota: null }
  ];
  guardarEnLocalStorage();
  renderUniCalculadora(state);
}

// ==========================================================
// SINCRONIZACIÓN AUTOMÁTICA AL VOLVER A LA PESTAÑA
// ==========================================================
let ultimaSincronizacion = 0;
async function sincronizarSilenciosamente() {
  const ahora = Date.now();
  if (!supabaseClient || (ahora - ultimaSincronizacion) < 4000) return;
  ultimaSincronizacion = ahora;
  await cargarDatosDesdeSupabase(true);
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') sincronizarSilenciosamente();
});
window.addEventListener('focus', sincronizarSilenciosamente);
