// ==========================================================
// EMPRENDIMIENTO.JS - INVENTARIO, VENTAS Y GANANCIAS (BOLIS & OBLEAS)
// ==========================================================

export function renderEmprendimiento(state) {
  const container = document.getElementById('emprendimientoContainer');
  if (!container) return;

  if (!state.emprendimiento) {
    state.emprendimiento = {
      productos: [
        { id: 'prod_boli_500', nombre: 'Boli Pequeño ($500)', precioVenta: 500, stock: 0 },
        { id: 'prod_boli_1000', nombre: 'Boli Grande ($1.000)', precioVenta: 1000, stock: 0 },
        { id: 'prod_oblea', nombre: 'Oblea', precioVenta: 2500, stock: 0 }
      ],
      movimientos: []
    };
  }

  const { productos, movimientos } = state.emprendimiento;

  const totalVentas = movimientos
    .filter(m => m.tipo === 'Venta')
    .reduce((acc, m) => acc + (Number(m.total) || 0), 0);

  const totalGastos = movimientos
    .filter(m => m.tipo === 'Gasto')
    .reduce((acc, m) => acc + (Number(m.total) || 0), 0);

  const gananciaNeta = totalVentas - totalGastos;
  const formatCOP = (n) => '$ ' + Math.round(Number(n) || 0).toLocaleString('es-CO');

  container.innerHTML = `
    <div class="space-y-5">
      <!-- RESUMEN DE GANANCIAS -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="bg-slate-900 border border-emerald-800/50 rounded-2xl p-4 shadow-lg">
          <span class="text-[11px] uppercase font-bold text-slate-400">Total Ventas (Ingresos)</span>
          <div class="text-2xl font-extrabold font-mono text-emerald-400 mt-1">${formatCOP(totalVentas)}</div>
        </div>
        <div class="bg-slate-900 border border-rose-800/50 rounded-2xl p-4 shadow-lg">
          <span class="text-[11px] uppercase font-bold text-slate-400">Gastos / Insumos</span>
          <div class="text-2xl font-extrabold font-mono text-rose-400 mt-1">${formatCOP(totalGastos)}</div>
        </div>
        <div class="bg-slate-900 border ${gananciaNeta >= 0 ? 'border-cyan-700/60' : 'border-amber-700/60'} rounded-2xl p-4 shadow-lg">
          <span class="text-[11px] uppercase font-bold text-slate-400">Ganancia Neta</span>
          <div class="text-2xl font-extrabold font-mono ${gananciaNeta >= 0 ? 'text-cyan-400' : 'text-amber-400'} mt-1">${formatCOP(gananciaNeta)}</div>
        </div>
      </div>

      <!-- INVENTARIO ACTUAL DE PRODUCTOS -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 class="text-sm font-bold text-white uppercase tracking-wider">Inventario Disponible</h3>
            <p class="text-xs text-slate-400">Unidades listas para vender y precios unitarios</p>
          </div>
          <button onclick="window.agregarProductoEmprendimiento()" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition">
            + Nuevo Producto
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          ${productos.map((p, idx) => `
            <div class="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <h4 class="font-bold text-sm text-white">${p.nombre}</h4>
                  <span class="text-xs font-mono text-emerald-400 font-semibold">Precio venta: ${formatCOP(p.precioVenta)}</span>
                </div>
                <span class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${p.stock > 5 ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50' : 'bg-amber-950 text-amber-300 border border-amber-700/50'}">
                  Stock: ${p.stock}
                </span>
              </div>

              <div class="flex items-center gap-2 pt-1">
                <button onclick="window.ajustarStockEmprendimiento(${idx}, 1)" class="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold border border-slate-700">
                  +1 Producido
                </button>
                <button onclick="window.ajustarStockMasivo(${idx})" class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-semibold border border-slate-700">
                  + Lote
                </button>
                <button onclick="window.editarPrecioProducto(${idx})" class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-xs border border-slate-700" title="Editar precio">
                  ✎
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- FORMULARIOS RÁPIDOS: REGISTRAR VENTA vs REGISTRAR GASTO -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <h3 class="text-xs font-bold uppercase tracking-wider text-emerald-400">Registrar Venta</h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <select id="empVentaProducto" class="sm:col-span-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
              ${productos.map(p => `<option value="${p.id}">${p.nombre} (${formatCOP(p.precioVenta)})</option>`).join('')}
            </select>
            <input type="number" id="empVentaCantidad" min="1" value="1" placeholder="Cant." class="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono text-center" />
          </div>
          <button onclick="window.registrarVentaEmprendimiento()" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow transition">
            ✓ Guardar Venta y Descontar Inventario
          </button>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <h3 class="text-xs font-bold uppercase tracking-wider text-rose-400">Registrar Gasto / Insumos</h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <input type="text" id="empGastoConcepto" placeholder="Ej: Pulpa, Leche, Obleas, Arequipe..." class="sm:col-span-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" />
            <input type="number" id="empGastoMonto" min="1" placeholder="Monto ($)" class="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono" />
          </div>
          <button onclick="window.registrarGastoEmprendimiento()" class="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow transition">
            + Registrar Gasto del Negocio
          </button>
        </div>
      </div>

      <!-- HISTORIAL DE VENTAS Y GASTOS -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div class="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-200">Movimientos del Emprendimiento</h3>
          <span class="text-xs text-slate-400 font-mono">${movimientos.length} registros</span>
        </div>
        <div class="overflow-x-auto max-h-80">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-800/70 text-[10px] text-slate-400 uppercase">
              <tr>
                <th class="py-2.5 px-3">Fecha</th>
                <th class="py-2.5 px-3">Tipo</th>
                <th class="py-2.5 px-3">Detalle</th>
                <th class="py-2.5 px-3 text-center">Cant.</th>
                <th class="py-2.5 px-3 text-right">Total</th>
                <th class="py-2.5 px-3 text-center">Borrar</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              ${movimientos.length === 0 ? `
                <tr><td colspan="6" class="p-6 text-center text-slate-500 italic">Aún no hay ventas ni gastos registrados.</td></tr>
              ` : movimientos.map((m, idx) => `
                <tr class="hover:bg-slate-800/30">
                  <td class="py-2 px-3 font-mono text-slate-400">${m.fecha}</td>
                  <td class="py-2 px-3">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold ${m.tipo === 'Venta' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50' : 'bg-rose-950 text-rose-300 border border-rose-800/50'}">
                      ${m.tipo}
                    </span>
                  </td>
                  <td class="py-2 px-3 text-slate-200 font-medium">${m.detalle}</td>
                  <td class="py-2 px-3 text-center font-mono text-slate-300">${m.cantidad || '-'}</td>
                  <td class="py-2 px-3 text-right font-mono font-bold ${m.tipo === 'Venta' ? 'text-emerald-400' : 'text-rose-400'}">
                    ${m.tipo === 'Venta' ? '+' : '-'}${formatCOP(m.total)}
                  </td>
                  <td class="py-2 px-3 text-center">
                    <button onclick="window.eliminarMovimientoEmprendimiento(${idx})" class="text-slate-500 hover:text-rose-400">✕</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
