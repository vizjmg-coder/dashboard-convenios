// ====== PESTAÑA 2: MAPA TERRITORIAL ======
let mainMapInst = null;
let mainMapLayerGroup = null;

async function renderMapTab() {
    if (!mainMapInst) {
        mainMapInst = L.map('main-map', { zoomControl: false, preferCanvas: true }).setView([6.55, -75.3], 7);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png', { maxZoom: 22, subdomains: 'abcd' }).addTo(mainMapInst);
        L.control.zoom({ position: 'bottomright' }).addTo(mainMapInst);
        mainMapLayerGroup = L.layerGroup().addTo(mainMapInst);
        window.mainMap = mainMapInst;
        
        ['vigencia', 'supervisor', 'clasificacion', 'municipio', 'subregion', 'estado'].forEach(f => {
            const el = document.getElementById(`map-filter-${f}`);
            if(el) el.addEventListener('change', applyMapFilters);
        });
        const elS = document.getElementById('map-filter-search');
        if(elS) elS.addEventListener('input', applyMapFilters);
    }
    applyMapFilters();
}

let currentMapData = [];

function applyMapFilters() {
    const search = document.getElementById('map-filter-search').value.toLowerCase().trim();
    const vigencia = document.getElementById('map-filter-vigencia').value.trim();
    const municipio = document.getElementById('map-filter-municipio').value.trim();
    const supervisor = document.getElementById('map-filter-supervisor').value.trim();
    const clasificacion = document.getElementById('map-filter-clasificacion').value.trim();
    const subregion = document.getElementById('map-filter-subregion').value.trim();
    const estado = document.getElementById('map-filter-estado').value.trim();

    currentMapData = rawData.filter(row => {
        const rowValsStr = Object.values(row).map(v => String(v || '').toLowerCase()).join(' ');
        const matchSearch = !search || rowValsStr.includes(search);
        const matchVig = !vigencia || String(row['VIGENCIA'] || '').trim() === vigencia;
        const matchMun = !municipio || String(row['MUNICIPIO'] || '').trim() === municipio;
        const matchSup = !supervisor || String(row['SUPERVISOR'] || '').trim() === supervisor;
        const matchClasif = !clasificacion || String(row['CLASIFICACIÓN'] || row['CLASIFICACI"N'] || '').trim() === clasificacion;
        const matchSub = !subregion || String(row['SUBREGION'] || '').trim() === subregion;
        const matchEstado = !estado || String(row['ESTADO CONVENIO'] || '').trim() === estado;
        return matchSearch && matchVig && matchMun && matchSup && matchClasif && matchSub && matchEstado;
    });

    updateMapFilterSelects(search, vigencia, municipio, supervisor, clasificacion, subregion, estado);
    updateMapKPIs();
    renderMapFeatures();
}

function updateMapFilterSelects(cSearch, cVig, cMun, cSup, cClas, cSub, cEst) {
    const getValid = (field, exclude) => {
        const valid = rawData.filter(row => {
            const rowValsStr = Object.values(row).map(v => String(v || '').toLowerCase()).join(' ');
            const matchSearch = !cSearch || rowValsStr.includes(cSearch);
            const matchVig = exclude === 'VIGENCIA' ? true : (!cVig || String(row['VIGENCIA']).trim() === cVig);
            const matchMun = exclude === 'MUNICIPIO' ? true : (!cMun || String(row['MUNICIPIO'] || '').trim() === cMun);
            const matchSup = exclude === 'SUPERVISOR' ? true : (!cSup || String(row['SUPERVISOR'] || '').trim() === cSup);
            const matchClas = exclude === 'CLASIFICACIÓN' ? true : (!cClas || String(row['CLASIFICACIÓN'] || row['CLASIFICACI"N'] || '').trim() === cClas);
            const matchSub = exclude === 'SUBREGION' ? true : (!cSub || String(row['SUBREGION'] || '').trim() === cSub);
            const matchEst = exclude === 'ESTADO CONVENIO' ? true : (!cEst || String(row['ESTADO CONVENIO'] || '').trim() === cEst);
            return matchSearch && matchVig && matchMun && matchSup && matchClas && matchSub && matchEst;
        });
        return [...new Set(valid.map(i => {
            if(field === 'CLASIFICACIÓN') return String(i['CLASIFICACIÓN'] || i['CLASIFICACI"N'] || '').trim();
            return String(i[field] || '').trim();
        }).filter(Boolean))].sort();
    };
    
    const upd = (id, options, current) => {
        const el = document.getElementById(id);
        if(!el) return;
        const finalVal = options.includes(current) ? current : "";
        el.innerHTML = '<option value="">Todos</option>' + options.map(v => `<option value="${v}">${v}</option>`).join('');
        el.value = finalVal;
    };
    
    upd('map-filter-vigencia', getValid('VIGENCIA', 'VIGENCIA').reverse(), cVig);
    upd('map-filter-supervisor', getValid('SUPERVISOR', 'SUPERVISOR'), cSup);
    upd('map-filter-clasificacion', getValid('CLASIFICACIÓN', 'CLASIFICACIÓN'), cClas);
    upd('map-filter-municipio', getValid('MUNICIPIO', 'MUNICIPIO'), cMun);
    upd('map-filter-subregion', getValid('SUBREGION', 'SUBREGION'), cSub);
    upd('map-filter-estado', getValid('ESTADO CONVENIO', 'ESTADO CONVENIO'), cEst);
}

function updateMapKPIs() {
    const numMun = new Set(currentMapData.map(r => String(r['MUNICIPIO']).trim())).size;
    const numSub = new Set(currentMapData.map(r => String(r['SUBREGION']).trim())).size;
    let act = 0, km = 0, inv = 0, area = 0;
    currentMapData.forEach(r => {
        const est = String(r['ESTADO CONVENIO'] || '').toUpperCase();
        if(est.includes('EJECUCI')) act++;
        km += (r['LONGITUD EJECUTADA'] || 0) / 1000;
        area += (r['AREA EJECUTADA (M2)'] || 0);
        inv += (r['APORTE DEPARTAMENTO'] || 0) + (r['ADICION DEPARTAMENTO'] || 0);
    });
    
    document.getElementById('kpi-map-mun').textContent = numMun;
    document.getElementById('kpi-map-sub').textContent = numSub;
    document.getElementById('kpi-map-km').textContent = km.toFixed(2);
    document.getElementById('kpi-map-area').textContent = formatNumber(area);
    document.getElementById('kpi-map-inv').textContent = formatCurrency(inv);
    document.getElementById('kpi-map-activos').textContent = act;
    
    updateMapCharts();
}

function updateMapCharts() {
    const subL = {}, subI = {}, munL = {}, munI = {};
    currentMapData.forEach(r => {
        const s = r['SUBREGION'] || 'OTRAS';
        const m = r['MUNICIPIO'] || 'N/A';
        const l = r['LONGITUD EJECUTADA'] || 0;
        const i = (r['APORTE DEPARTAMENTO'] || 0) + (r['ADICION DEPARTAMENTO'] || 0);
        
        subL[s] = (subL[s] || 0) + l;
        subI[s] = (subI[s] || 0) + i;
        munL[m] = (munL[m] || 0) + l;
        munI[m] = (munI[m] || 0) + i;
    });
    
    const sL = Object.entries(subL).sort((a,b) => b[1]-a[1]);
    const sI = Object.entries(subI).sort((a,b) => b[1]-a[1]);
    const mL = Object.entries(munL).sort((a,b) => b[1]-a[1]).slice(0, 15);
    const mI = Object.entries(munI).sort((a,b) => b[1]-a[1]).slice(0, 15);
    
    const drawChart = (id, type, dataArr, formatCb, color) => {
        const el = document.getElementById(id);
        if(!el) return;
        if(charts[id]) charts[id].destroy();
        charts[id] = new Chart(el, {
            type: type,
            data: {
                labels: dataArr.map(d => d[0]),
                datasets: [{ data: dataArr.map(d => d[1]), backgroundColor: color, borderRadius: 4 }]
            },
            options: {
                indexAxis: type === 'bar' && id.includes('top-mun') ? 'y' : (id.includes('sub-inv') ? 'y' : 'x'),
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${formatCb(c.raw)}` } } },
                scales: {
                    x: { ticks: { font: {size: 9} } },
                    y: { ticks: { font: {size: 9} } }
                }
            }
        });
    };
    
    drawChart('chart-sub-long', 'bar', sL, v => formatNumber(v) + ' m', '#018D38');
    drawChart('chart-sub-inv', 'bar', sI, v => formatCurrency(v), '#3561AB');
    drawChart('chart-top-mun-long', 'bar', mL, v => formatNumber(v) + ' m', '#018D38');
    drawChart('chart-top-mun-inv', 'bar', mI, v => formatCurrency(v), '#3561AB');
}

let isRenderingMap = false;
async function renderMapFeatures() {
    if(isRenderingMap) return;
    isRenderingMap = true;
    
    const loadingEl = document.getElementById('main-map-loading');
    if(loadingEl) loadingEl.classList.remove('hidden');
    
    if(mainMapLayerGroup) mainMapLayerGroup.clearLayers();
    
    const promises = currentMapData.map(async (row) => {
        const num = String(row['CONVENIO']).trim();
        const sysState = getSystemState(row['ESTADO CONVENIO']);
        const color = sysState.hex;
        
        const style = { color: color, weight: 5, opacity: 0.9 };
        const highlightStyle = { color: '#000', weight: 8, opacity: 1 };
        
        const popupContent = `
            <div class="text-xs w-64 p-1">
                <div class="mb-2 pb-2 border-b border-slate-200">
                    <span class="badge-estado ${sysState.badgeClass} mb-1.5 inline-block text-[9px] px-1.5 py-0.5 rounded">${sysState.label}</span>
                    <h4 class="font-black text-slate-800 text-sm uppercase leading-tight">${num}</h4>
                    <p class="font-bold text-slate-600 mt-0.5"><i class="fa-solid fa-location-dot mr-1"></i> ${row['MUNICIPIO']}</p>
                </div>
                <div class="space-y-1.5">
                    <p><strong>Ejecutor:</strong> ${row['CONVENIANTE EJECUTOR'] || row['MUNICIPIO']}</p>
                    <p><strong>Clasificación:</strong> ${row['CLASIFICACIÓN'] || row['CLASIFICACI"N'] || 'N/A'}</p>
                    <p><strong>Longitud Ejecutada:</strong> ${formatNumber(row['LONGITUD EJECUTADA'])} m</p>
                    <p><strong>Inversión Total:</strong> ${formatCurrency(row['VALOR TOTAL'])}</p>
                    <div class="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200 text-center">
                        <div><span class="block text-[8px] uppercase font-bold text-slate-500">Físico</span><span class="font-black text-[#1a7f5a]">${(row['FISICO_NORM']||0).toFixed(1)}%</span></div>
                        <div><span class="block text-[8px] uppercase font-bold text-slate-500">Financiero</span><span class="font-black text-[#2d6a9f]">${(row['FINANCIERO_NORM']||0).toFixed(1)}%</span></div>
                    </div>
                </div>
            </div>
        `;
        
        const onEachFeat = (feature, layer) => {
            layer.bindPopup(popupContent, { maxWidth: 300, className: 'custom-popup' });
            layer.on('mouseover', () => { if(layer.setStyle) layer.setStyle(highlightStyle); });
            layer.on('mouseout', () => { if(layer.setStyle) layer.setStyle(style); });
        };

        try {
            const r = await fetch(`./assets/mapas/${num}.geojson`);
            if(r.ok) {
                const d = await r.json();
                const l = L.geoJSON(d, { 
                    style: style, 
                    pointToLayer: (f, ll) => L.circleMarker(ll, { radius: 6, fillColor: color, color: "#fff", weight: 2, fillOpacity: 0.8 }),
                    onEachFeature: onEachFeat
                });
                mainMapLayerGroup.addLayer(l);
                return;
            }
        } catch(e) {}
        
        if(typeof omnivore !== 'undefined') {
            try {
                await new Promise((res, rej) => {
                    const cl = L.geoJSON(null, {
                        style: style,
                        pointToLayer: (f, ll) => L.circleMarker(ll, { radius: 6, fillColor: color, color: "#fff", weight: 2, fillOpacity: 0.8 }),
                        onEachFeature: onEachFeat
                    });
                    const k = omnivore.kml(`./assets/mapas/${num}.kml`, null, cl).on('ready', () => {
                        mainMapLayerGroup.addLayer(k); res(true);
                    }).on('error', () => res(false));
                });
                return;
            } catch(e) {}
        }
        
        // Marker if no map
        const la = parseFloat(row['LATITUD']), lo = parseFloat(row['LONGITUD']);
        if(!isNaN(la) && !isNaN(lo) && la!==0) {
            const marker = L.circleMarker([la, lo], { radius: 8, fillColor: color, color: "#fff", weight: 2, fillOpacity: 0.9 });
            marker.bindPopup(popupContent);
            mainMapLayerGroup.addLayer(marker);
        }
    });

    await Promise.all(promises);
    
    // Fit bounds if layers exist
    if (mainMapLayerGroup.getLayers().length > 0) {
        try {
            const bounds = L.featureGroup(mainMapLayerGroup.getLayers()).getBounds();
            mainMapInst.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        } catch(e) {}
    } else {
        mainMapInst.setView([6.55, -75.3], 7);
    }
    
    if(loadingEl) loadingEl.classList.add('hidden');
    isRenderingMap = false;
}

// ====== PESTAÑA 3: PLAN DE DESARROLLO ======

// Indicadores estratégicos del Plan de Desarrollo 2024-2027 con metas oficiales
const indicadoresEstrategicos = {
    "AEROPUERTOS O AERÓDROMOS MEJORADOS Y EN OPERACIÓN": { meta: 15,    unit: "und", tipo: "und" },
    "MUELLES O EMBARCADEROS MEJORADOS":                  { meta: 4,     unit: "und", tipo: "und" },
    "VÍAS TERCIARIAS MEJORADAS. (RVT)":                  { meta: 500,   unit: "km",  tipo: "km"  },
    "ESPACIO PUBLICO":                                   { meta: 20000, unit: "m²",  tipo: "m2"  },
    "CABLES AÉREOS SOSTENIBLES CONSTRUIDOS Y OPERANDO":  { meta: 3,     unit: "und", tipo: "und" },
    "VÍA URBANA MEJORADA. (RVU)":                        { meta: 30,    unit: "km",  tipo: "km"  }
};

function normalizarIndicador(ind) {
    if (!ind) return "";
    const norm = s => s.toUpperCase()
        .replace(/Á/g,'A').replace(/É/g,'E').replace(/Í/g,'I').replace(/Ó/g,'O').replace(/Ú/g,'U')
        .replace(/Ñ/g,'N').trim();
    const i = norm(ind);
    if (i.includes("AEROPUERTO") || i.includes("AERODROMO")) return "AEROPUERTOS O AERÓDROMOS MEJORADOS Y EN OPERACIÓN";
    if (i.includes("MUELLE") || i.includes("EMBARCADERO"))   return "MUELLES O EMBARCADEROS MEJORADOS";
    if (i.includes("TERCIARIA") && (i.includes("MEJORA") || i.includes("RVT"))) return "VÍAS TERCIARIAS MEJORADAS. (RVT)";
    if (i.includes("ESPACIO"))                               return "ESPACIO PUBLICO";
    if (i.includes("CABLE"))                                 return "CABLES AÉREOS SOSTENIBLES CONSTRUIDOS Y OPERANDO";
    if (i.includes("URBANA") || i.includes("RVU"))           return "VÍA URBANA MEJORADA. (RVU)";
    return ""; // No mapeado a ningún indicador estratégico
}

function renderPlanTab() {
    let cumplidas = 0, proceso = 0, riesgo = 0;
    let inversionTotal = 0;
    let munis = new Set();
    
    // Inicializar acumuladores por indicador
    const dataInd = {};
    Object.keys(indicadoresEstrategicos).forEach(k => {
        dataInd[k] = { ejecutado: 0, convenios: 0 };
    });

    let sumCumplimiento = 0;
    let countCumplimiento = 0;
    const avancePorAnio = { "2024": 0, "2025": 0, "2026": 0, "2027": 0 };

    rawData.forEach(row => {
        const ind = normalizarIndicador(row['INDICADOR']);
        if (!ind || !dataInd[ind]) return;

        const cfg = indicadoresEstrategicos[ind];
        let cant = 0;

        if (cfg.tipo === 'km') {
            // LONGITUD EJECUTADA viene en metros → convertir a km
            const metros = parseNum(row['LONGITUD EJECUTADA']);
            cant = metros / 1000;
        } else if (cfg.tipo === 'm2') {
            cant = parseNum(row['AREA EJECUTADA (M2)']);
        } else {
            // Unidades: contar 1 por convenio con ejecución
            const estado = String(row['ESTADO CONVENIO'] || '').toUpperCase();
            const tieneEjecucion = estado.includes('EJECUCI') || estado.includes('EJECUT') ||
                                   estado.includes('OPERA') || estado.includes('MEJORAD') ||
                                   parseNum(row['LONGITUD EJECUTADA']) > 0 ||
                                   parseNum(row['FISICO_NORM']) > 0;
            cant = tieneEjecucion ? 1 : 0;
        }

        dataInd[ind].ejecutado += cant;
        dataInd[ind].convenios++;

        inversionTotal += parseNum(row['APORTE DEPARTAMENTO']) + parseNum(row['ADICION DEPARTAMENTO']);
        if (row['MUNICIPIO']) munis.add(String(row['MUNICIPIO']).trim());

        const vig = String(row['VIGENCIA'] || '').trim();
        if (avancePorAnio[vig] !== undefined) {
            if (planAnualFilter === 'todos-km') {
                if (cfg.tipo === 'km') avancePorAnio[vig] += cant;
            } else if (planAnualFilter === 'todos-m2') {
                if (cfg.tipo === 'm2') avancePorAnio[vig] += cant;
            } else {
                if (ind === planAnualFilter) avancePorAnio[vig] += cant;
            }
        }
    });

    // Calculate projection for 2027 if it has no actual data
    if (!avancePorAnio["2027"] || avancePorAnio["2027"] === 0) {
        const val24 = avancePorAnio["2024"] || 0;
        const val25 = avancePorAnio["2025"] || 0;
        const val26 = avancePorAnio["2026"] || 0;
        const countNonZero = (val24 > 0 ? 1 : 0) + (val25 > 0 ? 1 : 0) + (val26 > 0 ? 1 : 0);
        const avgVal = countNonZero > 0 ? (val24 + val25 + val26) / countNonZero : 0;
        avancePorAnio["2027"] = parseFloat(avgVal.toFixed(2));
    }

    const container = document.getElementById('plan-indicadores-container');
    container.innerHTML = '';

    const chartMetasLabels = [];
    const chartMetasTargets = [];
    const chartMetasAchieved = [];

    Object.keys(indicadoresEstrategicos).forEach(ind => {
        const d = dataInd[ind];
        const cfg = indicadoresEstrategicos[ind];
        const meta = cfg.meta;
        const e = d.ejecutado;
        const pct = meta > 0 ? Math.min((e / meta) * 100, 100) : 0;
        const restante = Math.max(meta - e, 0);

        if (pct >= 80) cumplidas++;
        else if (pct >= 50) proceso++;
        else riesgo++;

        sumCumplimiento += pct;
        countCumplimiento++;

        chartMetasLabels.push(ind.length > 20 ? ind.substring(0, 20) + '…' : ind);
        chartMetasTargets.push(meta);
        chartMetasAchieved.push(parseFloat(e.toFixed(2)));

        let colorClass = 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
        let barColor = 'bg-red-500';
        let bgClass = 'bg-red-50/60 dark:bg-red-900/10';
        if (pct >= 80)  { colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'; barColor = 'bg-emerald-500'; bgClass = 'bg-emerald-50/60 dark:bg-emerald-900/10'; }
        else if (pct >= 50) { colorClass = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'; barColor = 'bg-amber-500'; bgClass = 'bg-amber-50/60 dark:bg-amber-900/10'; }

        const fmtVal = (v) => {
            if (cfg.tipo === 'km') return v.toFixed(2) + ' km';
            if (cfg.tipo === 'm2') return formatNumber(Math.round(v)) + ' m²';
            return Math.round(v) + ' und';
        };

        container.innerHTML += `
            <div class="border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm bg-white dark:bg-slate-800 flex flex-col gap-2 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start gap-2">
                    <h4 class="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest leading-tight">${ind}</h4>
                    <span class="${colorClass} text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap border shrink-0">${pct.toFixed(1)}%</span>
                </div>
                <div class="grid grid-cols-3 gap-2 text-center">
                    <div class="${bgClass} rounded-lg p-2">
                        <p class="text-[8px] uppercase font-bold text-slate-400 mb-0.5">Meta</p>
                        <p class="text-[11px] font-black text-slate-800 dark:text-slate-100 leading-none">${fmtVal(meta)}</p>
                    </div>
                    <div class="${bgClass} rounded-lg p-2">
                        <p class="text-[8px] uppercase font-bold text-slate-400 mb-0.5">Ejecutado</p>
                        <p class="text-[11px] font-black text-slate-800 dark:text-slate-100 leading-none">${fmtVal(e)}</p>
                    </div>
                    <div class="${bgClass} rounded-lg p-2">
                        <p class="text-[8px] uppercase font-bold text-slate-400 mb-0.5">Restante</p>
                        <p class="text-[11px] font-black text-slate-800 dark:text-slate-100 leading-none">${fmtVal(restante)}</p>
                    </div>
                </div>
                <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                    <div class="${barColor} h-2 rounded-full transition-all duration-1000" style="width: ${pct.toFixed(1)}%"></div>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-[9px] text-slate-400 font-medium">${d.convenios} convenio(s) vinculado(s)</span>
                    <span class="text-[9px] font-bold text-slate-400">${cfg.unit}</span>
                </div>
            </div>
        `;
    });

    document.getElementById('kpi-plan-cumplidas').textContent = cumplidas;
    document.getElementById('kpi-plan-proceso').textContent = proceso;
    document.getElementById('kpi-plan-riesgo').textContent = riesgo;
    const promedio = countCumplimiento > 0 ? (sumCumplimiento / countCumplimiento).toFixed(1) : '0.0';
    document.getElementById('kpi-plan-promedio').textContent = promedio + '%';
    const promBar = document.getElementById('kpi-plan-promedio-bar');
    if (promBar) promBar.style.width = promedio + '%';

    // Dynamic progress marker coloring
    const valProm = parseFloat(promedio);
    const m0 = document.getElementById('plan-marker-0');
    const m25 = document.getElementById('plan-marker-25');
    const m50 = document.getElementById('plan-marker-50');
    const m75 = document.getElementById('plan-marker-75');
    const m100 = document.getElementById('plan-marker-100');
    if (m0) m0.classList.toggle('active', valProm >= 0);
    if (m25) m25.classList.toggle('active', valProm >= 25);
    if (m50) m50.classList.toggle('active', valProm >= 50);
    if (m75) m75.classList.toggle('active', valProm >= 75);
    if (m100) m100.classList.toggle('active', valProm >= 100);
    document.getElementById('kpi-plan-inv').textContent = formatCurrency(inversionTotal);
    document.getElementById('kpi-plan-mun').textContent = munis.size;

    // Gráfico: Meta Global vs Ejecutado Total
    if (charts['plan-metas']) charts['plan-metas'].destroy();
    charts['plan-metas'] = new Chart(document.getElementById('chart-plan-metas'), {
        type: 'bar',
        data: {
            labels: chartMetasLabels,
            datasets: [
                { label: 'Meta',      data: chartMetasTargets,  backgroundColor: 'rgba(203,213,225,0.8)', borderColor: '#94a3b8', borderWidth: 1 },
                { label: 'Ejecutado', data: chartMetasAchieved, backgroundColor: 'rgba(11, 86, 64, 0.85)',  borderColor: '#0B5640',  borderWidth: 1 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } } },
            scales: { y: { beginAtZero: true, ticks: { font: { size: 9 } } }, x: { ticks: { font: { size: 9 } } } }
        }
    });

    // Gráfico: Avance Acumulado por Año
    if (charts['plan-anual']) charts['plan-anual'].destroy();

    const years = Object.keys(avancePorAnio);
    const yearlyRaw = Object.values(avancePorAnio);
    const yearlyAccumulated = [];
    let accum = 0;
    for (let idx = 0; idx < yearlyRaw.length; idx++) {
        accum += yearlyRaw[idx];
        yearlyAccumulated.push(parseFloat(accum.toFixed(2)));
    }

    const yearsLabels = years.map(y => y === "2027" ? "2027 (Proyección)" : y);

    charts['plan-anual'] = new Chart(document.getElementById('chart-plan-anual'), {
        type: 'line',
        data: {
            labels: yearsLabels,
            datasets: [{
                label: 'Acumulado (km / und / m²)',
                data: yearlyAccumulated,
                borderColor: '#2d6a9f',
                backgroundColor: 'rgba(45,106,159,0.08)',
                fill: true,
                tension: 0.4,
                pointRadius: (ctx) => ctx.dataIndex === 3 ? 6 : 5,
                pointHoverRadius: (ctx) => ctx.dataIndex === 3 ? 8 : 7,
                pointBackgroundColor: (ctx) => ctx.dataIndex === 3 ? '#018D38' : '#2d6a9f',
                pointBorderColor: (ctx) => ctx.dataIndex === 3 ? '#0B5640' : '#ffffff',
                pointBorderWidth: 2,
                borderWidth: 3,
                segment: {
                    borderDash: (ctx) => ctx.p0DataIndex >= 2 ? [6, 6] : undefined
                }
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } } },
            scales: { y: { beginAtZero: true, ticks: { font: { size: 9 } } }, x: { ticks: { font: { size: 9 } } } }
        }
    });
}


