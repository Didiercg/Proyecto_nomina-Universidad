-- ==========================================================
-- ESQUEMA DE BASE DE DATOS PARA SUPABASE
-- Proyecto: Control de Nómina, Gastos, Deudas y Presupuesto
-- ==========================================================

-- 1. TABLA PRINCIPAL: registro (equivalente a la hoja BD / Tabla "Registro")
CREATE TABLE IF NOT EXISTS registro (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    mes TEXT NOT NULL,
    año INTEGER NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('Ingreso', 'Egreso')),
    categoria TEXT NOT NULL,
    concepto TEXT NOT NULL,
    presupuesto NUMERIC(12,2) DEFAULT 0,
    monto NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_registro_fecha ON registro(fecha);
CREATE INDEX IF NOT EXISTS idx_registro_mes_ano ON registro(mes, año);
CREATE INDEX IF NOT EXISTS idx_registro_tipo ON registro(tipo);
CREATE INDEX IF NOT EXISTS idx_registro_categoria ON registro(categoria);

-- 2. TABLA: cambio_aceite (Mantenimiento de Moto)
CREATE TABLE IF NOT EXISTS cambio_aceite (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    kilometraje INTEGER NOT NULL,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA: deudas (Consolidado de deudas)
CREATE TABLE IF NOT EXISTS deudas (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    saldo_inicial NUMERIC(12,2) NOT NULL,
    tasa_ea NUMERIC(6,4) DEFAULT 0,
    cuota_mensual NUMERIC(12,2) NOT NULL,
    saldo_pendiente NUMERIC(12,2) NOT NULL,
    total_abonado NUMERIC(12,2) DEFAULT 0,
    pct_pagado NUMERIC(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA: gastos_fijos (Plantilla configurable de gastos fijos mensuales)
CREATE TABLE IF NOT EXISTS gastos_fijos (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    presupuesto NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA: devengado_presupuesto (Control de presupuesto quincenal y restante)
CREATE TABLE IF NOT EXISTS devengado_presupuesto (
    id TEXT PRIMARY KEY,
    concepto TEXT NOT NULL,
    monto NUMERIC(12,2) NOT NULL,
    tipo TEXT DEFAULT 'deduccion', -- 'ingreso' o 'deduccion'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA: universidad_data (Gestión de Semestres, Materias y Calificaciones)
CREATE TABLE IF NOT EXISTS universidad_data (
    id TEXT PRIMARY KEY,
    semestre_id TEXT NOT NULL,
    nombre_semestre TEXT NOT NULL,
    materias JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE registro ENABLE ROW LEVEL SECURITY;
ALTER TABLE cambio_aceite ENABLE ROW LEVEL SECURITY;
ALTER TABLE deudas ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos_fijos ENABLE ROW LEVEL SECURITY;
ALTER TABLE devengado_presupuesto ENABLE ROW LEVEL SECURITY;
ALTER TABLE universidad_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acceso total a registro" ON registro;
CREATE POLICY "Acceso total a registro" ON registro FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso total a cambio_aceite" ON cambio_aceite;
CREATE POLICY "Acceso total a cambio_aceite" ON cambio_aceite FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso total a deudas" ON deudas;
CREATE POLICY "Acceso total a deudas" ON deudas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso total a gastos_fijos" ON gastos_fijos;
CREATE POLICY "Acceso total a gastos_fijos" ON gastos_fijos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso total a devengado_presupuesto" ON devengado_presupuesto;
CREATE POLICY "Acceso total a devengado_presupuesto" ON devengado_presupuesto FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso total a universidad_data" ON universidad_data;
CREATE POLICY "Acceso total a universidad_data" ON universidad_data FOR ALL USING (true) WITH CHECK (true);
