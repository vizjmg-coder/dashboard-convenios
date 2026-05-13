// Variables Globales
let rawData = [];
let filteredData = [];
let charts = {};
let currentPage = 1;
const rowsPerPage = 12;
let currentSort = { column: 'CONVENIO', asc: true };
let currentChartMode = 'top'; // 'top' o 'municipio'
let currentAlertFilter = 'all';

// Variables Mapas
let mapInstance = null;
let currentLayerGroup = null;
let summaryMapInstance = null;
let summaryLayerGroup = null;
let currentExtractedFeatures = []; 

// Variables Galería Lightbox
let currentGalleryImages = [];
let currentImageIndex = 0;

// Utilidades
const formatCurrency = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val || 0);
const formatNumber = (val) => new Intl.NumberFormat('es-CO').format(val || 0);

const parseNum = (val) => {
    if(!val) return 0;
    if(typeof val === 'number') return val;
    return parseFloat(val.toString().replace(/[^0-9.-]+/g,"")) || 0;
};

const parseExcelDate = (excelNum) => {
    if (!excelNum) return '';
    if (typeof excelNum === 'string') return excelNum; 
    if (typeof excelNum === 'number') {
        const date = new Date(Math.round((excelNum - 25569) * 86400 * 1000));
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${day}/${month}/${year}`;
    }
    return excelNum;
};

// --- SISTEMA DE DISEÑO: MAPEO INSTITUCIONAL DE ESTADOS ---
// Se sincroniza con las variables de CSS
function getSystemState(estado) {
    const est = String(estado || 'N/A').toLowerCase();
    
    if (est.includes('liquidado')) return { 
        badgeClass: 'badge-liquidado', 
        hex: '#1a7f5a', 
        label: 'Liquidado' 
    };
    if (est.includes('por liquidar')) return { 
        badgeClass: 'badge-por-liquidar', 
        hex: '#c0392b', 
        label: 'Por Liquidar' 
    };
    if (est.includes('suspendido')) return { 
        badgeClass: 'badge-suspendido', 
        hex: '#b7791f', 
        label: 'Suspendido' 
    };
    if (est.includes('ejecución') || est.includes('ejecucion')) return { 
        badgeClass: 'badge-ejecucion', 
        hex: '#2d6a9f', 
        label: 'En Ejecución' 
    };
    
    return { badgeClass: 'badge-default', hex: '#64748b', label: String(estado).toUpperCase() };
}

// Función para copiar coordenadas al portapapeles
window.copyCoord = function(inputId, btn) {
    const input = document.getElementById(inputId);
    if(!input.value) return;
    
    input.select();
    input.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(input.value).then(() => {
        const oldHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i>';
        btn.classList.add('bg-institutional-primary', 'text-white');
        btn.classList.remove('bg-slate-200', 'text-slate-600');
        
        setTimeout(() => {
            btn.innerHTML = oldHtml;
            btn.classList.remove('bg-institutional-primary', 'text-white');
            btn.classList.add('bg-slate-200', 'text-slate-600');
        }, 1500);
    });
};

function getCoords(layer) {
    let latlngs = [];
    if (layer.getLatLngs) {
        latlngs = layer.getLatLngs();
        function flatten(arr) { return arr.reduce((acc, val) => Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), []); }
        latlngs = flatten(latlngs);
    } else if (layer.getLatLng) { latlngs = [layer.getLatLng()]; }
    
    if (!latlngs || latlngs.length === 0) return null;
    return {
        start: `${latlngs[0].lat.toFixed(6)}, ${latlngs[0].lng.toFixed(6)}`,
        end: `${latlngs[latlngs.length - 1].lat.toFixed(6)}, ${latlngs[latlngs.length - 1].lng.toFixed(6)}`
    };
}

// ------ FUNCIÓN EXPORTAR PDF (Plantilla base en memoria) ------
function generateProfessionalPDF(row) {
    const template = document.getElementById('pdf-template');
    const convenio = row['CONVENIO'];
    const municipio = row['MUNICIPIO'];
    
    const sysState = getSystemState(row['ESTADO CONVENIO']);

    // HTML del PDF
    template.innerHTML = `
        <div class="p-10 bg-white" style="width: 297mm;"> 
            <div class="flex justify-between items-end border-b-4 border-[#0e5e40] pb-4 mb-6">
                <div class="flex items-center gap-4">
                    <img src="https://www.antioquia.gov.co/images/2024/escudo-de-armas%201.jpg" class="w-16 h-16 object-contain" />
                    <div>
                        <h1 class="text-2xl font-black text-slate-900 uppercase tracking-tighter">Ficha Técnica de Seguimiento</h1>
                        <p class="text-[#1a7f5a] font-bold tracking-widest text-xs uppercase mt-1">Gobernación de Antioquia - Secretaría de Infraestructura</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-[10px] font-bold text-slate-400 uppercase">Convenio N°</p>
                    <p class="text-2xl font-black text-slate-800">${convenio}</p>
                </div>
            </div>

            <div class="section-block mb-6">
                <h3 class="bg-slate-800 text-white px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-t-lg">1. Identificación del Proyecto</h3>
                <div class="grid grid-cols-4 border border-slate-200 rounded-b-lg overflow-hidden text-xs">
                    <div class="p-3 border-r border-b border-slate-100 bg-slate-50"><span class="block text-[8px] font-bold text-slate-400 uppercase">Municipio</span><span class="font-bold text-slate-700">${municipio}</span></div>
                    <div class="p-3 border-r border-b border-slate-100 bg-slate-50"><span class="block text-[8px] font-bold text-slate-400 uppercase">Vigencia</span><span class="font-bold text-slate-700">${row['VIGENCIA']}</span></div>
                    <div class="p-3 border-r border-b border-slate-100 bg-slate-50"><span class="block text-[8px] font-bold text-slate-400 uppercase">Indicador</span><span class="font-bold text-slate-700">${row['INDICADOR'] || '-'}</span></div>
                    <div class="p-3 border-b border-slate-100 bg-slate-50"><span class="block text-[8px] font-bold text-slate-400 uppercase">Clasificación</span><span class="font-bold text-slate-700">${row['CLASIFICACIÓN'] || '-'}</span></div>
                    
                    <div class="p-3 border-r border-slate-100 col-span-2"><span class="block text-[8px] font-bold text-slate-400 uppercase">Estado Actual</span><span class="px-2 py-0.5 rounded text-[9px] font-black uppercase border inline-block mt-1" style="background:${sysState.hex}15; color:${sysState.hex}; border-color:${sysState.hex}40;">${sysState.label}</span></div>
                    <div class="p-3 col-span-2"><span class="block text-[8px] font-bold text-slate-400 uppercase">Supervisión</span><span class="font-bold text-slate-700 mt-1 block">Margarita Rosa Lopera Duque</span></div>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-6 section-block">
                <div class="border border-slate-200 p-4 rounded-xl bg-white flex items-center justify-between shadow-sm">
                    <div class="w-2/3">
                        <span class="text-[9px] font-black text-slate-400 uppercase">Avance Físico Global</span>
                        <div class="w-full bg-slate-100 h-3 rounded-full mt-1.5 overflow-hidden border border-slate-200">
                            <div class="h-full rounded-full" style="width: ${row['FISICO_NORM']}%; background: #1a7f5a;"></div>
                        </div>
                    </div>
                    <span class="text-2xl font-black text-[#1a7f5a]">${row['FISICO_NORM'].toFixed(1)}%</span>
                </div>
                <div class="border border-slate-200 p-4 rounded-xl bg-white flex items-center justify-between shadow-sm">
                    <div class="w-2/3">
                        <span class="text-[9px] font-black text-slate-400 uppercase">Avance Financiero</span>
                        <div class="w-full bg-slate-100 h-3 rounded-full mt-1.5 overflow-hidden border border-slate-200">
                            <div class="h-full rounded-full" style="width: ${row['FINANCIERO_NORM']}%; background: #2d6a9f;"></div>
                        </div>
                    </div>
                    <span class="text-2xl font-black text-[#2d6a9f]">${row['FINANCIERO_NORM'].toFixed(1)}%</span>
                </div>
            </div>

            <div class="grid grid-cols-12 gap-6 mb-6 section-block">
                <div class="col-span-7">
                    <h3 class="bg-slate-800 text-white px-4 py-1.5 text-[10px] font-black uppercase rounded-t-lg">2. Resumen Técnico</h3>
                    <div class="border border-slate-200 p-4 bg-white rounded-b-lg space-y-3">
                        <div><span class="text-[8px] font-bold text-slate-400 uppercase">Objeto del Contrato:</span><p class="text-[11px] text-slate-700 italic leading-relaxed mt-0.5">${row['OBJETO']}</p></div>
                        <div class="grid grid-cols-2 gap-3">
                            <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-100"><span class="text-[8px] font-bold text-slate-400 uppercase block">Vía Priorizada</span><span class="text-[10px] font-bold text-slate-800">${row['VIA_PRIORIZADA']}</span></div>
                            <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-100"><span class="text-[8px] font-bold text-slate-400 uppercase block">Metas / Alcance</span><span class="text-[10px] font-bold text-slate-800">${formatNumber(row['ALCANCE (M)'])} m / ${formatNumber(row['ALCANCE (M2)'])} m²</span></div>
                        </div>
                    </div>
                </div>
                <div class="col-span-5">
                    <h3 class="bg-slate-800 text-white px-4 py-1.5 text-[10px] font-black uppercase rounded-t-lg">3. Detalle Financiero</h3>
                    <div class="border border-slate-200 p-4 bg-white rounded-b-lg space-y-2">
                        <div class="flex justify-between border-b border-slate-100 pb-1.5"><span class="text-[9px] text-slate-500">Valor Total</span><span class="font-bold text-xs">${formatCurrency(row['VALOR TOTAL'])}</span></div>
                        <div class="flex justify-between border-b border-slate-100 pb-1.5"><span class="text-[9px] text-slate-500">Aporte Depto.</span><span class="font-bold text-xs">${formatCurrency(row['APORTE DEPARTAMENTO'])}</span></div>
                        <div class="flex justify-between border-b border-slate-100 pb-1.5"><span class="text-[9px] text-slate-500">Aporte Municipio</span><span class="font-bold text-xs">${formatCurrency(row['APORTE MUNICIPIO'])}</span></div>
                        <div class="flex justify-between pt-1"><span class="text-[9px] text-[#2d6a9f] font-bold">Total Desembolsado</span><span class="font-black text-sm text-[#2d6a9f]">${formatCurrency(row['VALOR TOTAL DESEMBOLSADO'])}</span></div>
                        <div class="flex justify-between"><span class="text-[9px] text-[#1a7f5a] font-bold">Total Autorizado</span><span class="font-black text-sm text-[#1a7f5a]">${formatCurrency(row['VALOR TOTAL AUTORIZADO'])}</span></div>
                    </div>
                </div>
            </div>

            <div class="section-block mb-6" style="page-break-before: always;">
                 <h3 class="bg-slate-800 text-white px-4 py-1.5 text-[10px] font-black uppercase rounded-t-lg">4. Detalle Geográfico y Tramos</h3>
                 <div class="grid grid-cols-12 border border-slate-200 rounded-b-lg overflow-hidden">
                    <div class="col-span-12 p-5 bg-white border-b border-slate-200">
                        <table class="w-full text-left text-[9px]">
                            <thead class="bg-slate-100 text-slate-600 uppercase font-black">
                                <tr>
                                    <th class="p-2 border border-slate-200">Nombre del Tramo / Segmento</th>
                                    <th class="p-2 border border-slate-200 text-center">Punto Inicial (Lat, Lng)</th>
                                    <th class="p-2 border border-slate-200 text-center">Punto Final (Lat, Lng)</th>
                                </tr>
                            </thead>
                            <tbody id="pdf-coords-body">
                                </tbody>
                        </table>
                    </div>
                 </div>
            </div>

            <div class="section-block mb-6">
                 <h3 class="bg-slate-800 text-white px-4 py-1.5 text-[10px] font-black uppercase rounded-t-lg">5. Tiempos y Observaciones Técnicas</h3>
                 <div class="border border-slate-200 p-5 bg-white rounded-b-lg">
                    <div class="grid grid-cols-4 gap-3 mb-4 pb-4 border-b border-slate-100">
                        <div><span class="block text-[8px] font-bold text-slate-400 uppercase">Inicio</span><span class="font-semibold text-xs text-slate-700">${row['FECHA DE ACTA DE INICIO']}</span></div>
                        <div><span class="block text-[8px] font-bold text-slate-400 uppercase">Terminación</span><span class="font-semibold text-xs text-slate-700">${row['FECHA DE TERMINACIÓN']}</span></div>
                        <div><span class="block text-[8px] font-bold text-slate-400 uppercase">Prórrogas / Susp.</span><span class="font-semibold text-xs text-slate-700">${row['PRÓRROGA (MESES)']} m / ${row['SUSPENSIÓN(MESES)']} m</span></div>
                        <div><span class="block text-[8px] font-bold text-amber-600 uppercase">Nueva Terminación</span><span class="font-black text-xs text-amber-700">${row['NUEVA FECHA DE TERMINACIÓN'] || 'N/A'}</span></div>
                    </div>
                    <p class="text-[10px] text-slate-600 leading-relaxed italic">${row['OBSERVACIONES'] || 'No se registran observaciones adicionales en el sistema a la fecha de corte.'}</p>
                 </div>
            </div>

            <div class="section-block">
                 <h3 class="bg-slate-800 text-white px-4 py-1.5 text-[10px] font-black uppercase rounded-t-lg">6. Registro Fotográfico de Obra</h3>
                 <div class="border border-slate-200 p-5 bg-white rounded-b-lg grid grid-cols-4 gap-3" id="pdf-gallery-content">
                 </div>
            </div>

            <div class="mt-8 text-center border-t border-slate-200 pt-3">
                <p class="text-[8px] text-slate-400 uppercase tracking-widest">Documento generado automáticamente por el Sistema de Seguimiento - Secretaría de Infraestructura, Gobernación de Antioquia</p>
            </div>
        </div>
    `;

    // Inyectar Coordenadas en la Tabla del PDF
    const coordsBody = template.querySelector('#pdf-coords-body');
    if (currentExtractedFeatures.length > 0) {
        currentExtractedFeatures.forEach(feat => {
            const coords = getCoords(feat.layer);
            if(coords){
                coordsBody.innerHTML += `
                    <tr>
                        <td class="p-2 border border-slate-200 font-bold">${feat.name}</td>
                        <td class="p-2 border border-slate-200 text-center font-mono">${coords.start}</td>
                        <td class="p-2 border border-slate-200 text-center font-mono">${coords.end}</td>
                    </tr>`;
            }
        });
    } else {
        coordsBody.innerHTML = `<tr><td colspan="3" class="p-4 text-center text-slate-400 italic">No se dispone de trazado geométrico para extraer tramos.</td></tr>`;
    }

    // Inyectar Fotos
    const galleryCont = template.querySelector('#pdf-gallery-content');
    const imagesInModal = document.querySelectorAll('#mod-galeria img');
    if(imagesInModal.length > 0) {
        imagesInModal.forEach(img => {
            const wrap = document.createElement('div');
            wrap.className = 'border border-slate-200 rounded-lg overflow-hidden shadow-sm';
            wrap.innerHTML = `<img src="${img.src}" class="w-full h-32 object-cover">`;
            galleryCont.appendChild(wrap);
        });
    } else {
        galleryCont.innerHTML = '<p class="col-span-4 text-center text-slate-400 italic py-4">No se adjuntan fotografías al presente reporte.</p>';
    }

    // Configuración para guardar
    const opt = {
        margin: 0,
        filename: `Ficha_Tecnica_Convenio_${convenio}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(template).save();
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    try {
        const today = new Date();
        document.getElementById('fecha-actualizacion').textContent = today.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
        
        document.getElementById('file-upload').addEventListener('change', handleFileUpload);
        document.getElementById('btn-reset-filters').addEventListener('click', resetFilters);
        document.getElementById('btn-close-modal').addEventListener('click', closeModal);
        
        document.getElementById('btn-export-pdf').addEventListener('click', () => {
            const currentConv = document.getElementById('modal-title').textContent;
            const row = rawData.find(r => String(r['CONVENIO']) === currentConv);
            if(row) generateProfessionalPDF(row);
        });
        
        document.getElementById('btn-prev').addEventListener('click', () => changePage(-1));
        document.getElementById('btn-next').addEventListener('click', () => changePage(1));
        document.getElementById('btn-export').addEventListener('click', exportToCSV);
        
        ['filter-search', 'filter-municipio', 'filter-estado', 'filter-vigencia', 'filter-convenio-num'].forEach(id => {
            document.getElementById(id).addEventListener('change', applyFilters);
            if (id === 'filter-search') document.getElementById(id).addEventListener('input', applyFilters);
        });
        
        document.getElementById('btn-close-lightbox').addEventListener('click', closeLightbox);
        document.getElementById('btn-prev-img').addEventListener('click', () => navigateLightbox(-1));
        document.getElementById('btn-next-img').addEventListener('click', () => navigateLightbox(1));
        document.getElementById('modal-detalle').addEventListener('click', function(e) { if (e.target === this) closeModal(); });
        document.getElementById('modal-lightbox').addEventListener('click', function(e) { if (e.target === this) closeLightbox(); });
        
        document.addEventListener('keydown', (e) => {
            const lightbox = document.getElementById('modal-lightbox');
            if (!lightbox.classList.contains('hidden')) {
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowLeft') navigateLightbox(-1);
                if (e.key === 'ArrowRight') navigateLightbox(1);
            } else if (!document.getElementById('modal-detalle').classList.contains('hidden') && e.key === 'Escape') {
                closeModal();
            }
        });
        
        loadExcelFile();
    } catch (e) { console.error("Error inicial:", e); }
});

async function loadExcelFile() {
    try {
        const response = await fetch('./data/convenios.xlsx');
        if (!response.ok) throw new Error();
        const arrayBuffer = await response.arrayBuffer();
        processExcelData(arrayBuffer);
    } catch (error) {} 
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => { try { processExcelData(e.target.result); } catch (err) { alert("Error: " + err.message); } };
    reader.readAsArrayBuffer(file);
}

function processExcelData(data) {
    if (typeof XLSX === 'undefined') { alert("SheetJS no cargó."); return; }
    const workbook = XLSX.read(data, { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    let json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
    rawData = json.map(row => {
        let pfis = parseNum(row['% EJECUCIÓN FÍSICA']); if(pfis > 0 && pfis <= 1) pfis *= 100;
        let pfin = parseNum(row['% EJECUCIÓN FINANCIERA (RECURSOS DEPARTAMENTO)'] || row['% EJECUCIÓN FINANCIERA']); if(pfin > 0 && pfin <= 1) pfin *= 100;
        return {
            ...row,
            'VIGENCIA': String(row['VIGENCIA'] || '').trim() || 'Sin Año',
            'VALOR TOTAL': parseNum(row['VALOR TOTAL'] || row['VALOR TOTAL CON ADICIONES']),
            'APORTE DEPARTAMENTO': parseNum(row['APORTE DEPARTAMENTO']), 
            'APORTE MUNICIPIO': parseNum(row['APORTE MUNICIPIO']),       
            'VALOR TOTAL DESEMBOLSADO': parseNum(row['VALOR TOTAL DESEMBOLSADO']),
            'VALOR TOTAL AUTORIZADO': parseNum(row['VALOR TOTAL AUTORIZADO DEPARTAMENTO']),
            'VIA_PRIORIZADA': row['NOMBRE VIAS PRIORIZADAS'] || 'No especificada',
            'ALCANCE (M)': parseNum(row['ALCANCE (M)']),
            'ALCANCE (M2)': parseNum(row['ALCANCE (M2)']),
            'LONGITUD EJECUTADA': parseNum(row['LONGITUD EJECUTADA']),
            'AREA EJECUTADA (M2)': parseNum(row['AREA EJECUTADA (M2)']),
            'FISICO_NORM': pfis,
            'FINANCIERO_NORM': pfin,
            'FECHA DE ACTA DE INICIO': parseExcelDate(row['FECHA DE ACTA DE INICIO']),
            'FECHA DE SUSCRIPCIÓN': parseExcelDate(row['FECHA DE SUSCRIPCIÓN']),
            'FECHA DE TERMINACIÓN': parseExcelDate(row['FECHA DE TERMINACIÓN']),
            'NUEVA FECHA DE TERMINACIÓN': parseExcelDate(row['NUEVA FECHA DE TERMINACIÓN']),
            'PRÓRROGA (MESES)': parseNum(row['PRÓRROGA (MESES)']),
            'SUSPENSIÓN(MESES)': parseNum(row['SUSPENSIÓN(MESES)'])
        };
    });
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    applyFilters(); 
}

function updateFilterOptions(currentSearch, currentVigencia, currentMunicipio, currentEstado, currentConvenioNum) {
    const getValidOptions = (field, excludeField) => {
        const validRows = rawData.filter(row => {
            const rowSearch = Object.values(row).map(v => String(v || '').toLowerCase()).join(' ');
            const matchSearch = !currentSearch || rowSearch.includes(currentSearch);
            const matchVig = excludeField === 'VIGENCIA' ? true : (!currentVigencia || String(row['VIGENCIA']).trim() === currentVigencia);
            const matchMun = excludeField === 'MUNICIPIO' ? true : (!currentMunicipio || String(row['MUNICIPIO'] || '').trim() === currentMunicipio);
            const matchEst = excludeField === 'ESTADO CONVENIO' ? true : (!currentEstado || String(row['ESTADO CONVENIO'] || '').trim() === currentEstado);
            const matchConv = excludeField === 'CONVENIO' ? true : (!currentConvenioNum || String(row['CONVENIO'] || '').trim() === currentConvenioNum);
            return matchSearch && matchVig && matchMun && matchEst && matchConv;
        });
        return [...new Set(validRows.map(i => String(i[field] || '').trim()).filter(Boolean))].sort();
    };
    const updateSelect = (id, options, currentValue) => {
        const select = document.getElementById(id);
        const finalValue = options.includes(currentValue) ? currentValue : "";
        select.innerHTML = '<option value="">Todos</option>' + options.map(v => `<option value="${v}">${v}</option>`).join('');
        select.value = finalValue;
    };
    updateSelect('filter-vigencia', getValidOptions('VIGENCIA', 'VIGENCIA').reverse(), currentVigencia);
    updateSelect('filter-municipio', getValidOptions('MUNICIPIO', 'MUNICIPIO'), currentMunicipio);
    updateSelect('filter-estado', getValidOptions('ESTADO CONVENIO', 'ESTADO CONVENIO'), currentEstado);
    updateSelect('filter-convenio-num', getValidOptions('CONVENIO', 'CONVENIO'), currentConvenioNum);
}

function applyFilters() {
    const search = document.getElementById('filter-search').value.toLowerCase().trim();
    const vigencia = document.getElementById('filter-vigencia').value.trim();
    const municipio = document.getElementById('filter-municipio').value.trim();
    const estado = document.getElementById('filter-estado').value.trim();
    const convenioNum = document.getElementById('filter-convenio-num').value.trim();

    filteredData = rawData.filter(row => {
        const rowValsStr = Object.values(row).map(v => String(v || '').toLowerCase()).join(' ');
        const matchSearch = !search || rowValsStr.includes(search);
        const matchVig = !vigencia || String(row['VIGENCIA'] || '').trim() === vigencia;
        const matchMun = !municipio || String(row['MUNICIPIO'] || '').trim() === municipio;
        const matchEst = !estado || String(row['ESTADO CONVENIO'] || '').trim() === estado;
        const matchConv = !convenioNum || String(row['CONVENIO'] || '').trim() === convenioNum;
        return matchSearch && matchVig && matchMun && matchEst && matchConv;
    });

    updateFilterOptions(search, vigencia, municipio, estado, convenioNum);

    const summaryCard = document.getElementById('summary-card-container');
    const activeConv = document.getElementById('filter-convenio-num').value.trim();

    if (activeConv && filteredData.length > 0) {
        const selected = filteredData[0]; 
        document.getElementById('summary-num').textContent = selected['CONVENIO'] || 'S/N';
        document.getElementById('summary-municipio').textContent = selected['MUNICIPIO'] || 'N/A';
        const alcM = selected['ALCANCE (M)'] || 0, alcM2 = selected['ALCANCE (M2)'] || 0;
        const ejM = selected['LONGITUD EJECUTADA'] || 0, ejM2 = selected['AREA EJECUTADA (M2)'] || 0;
        if (alcM2 > 0 && alcM === 0) {
            document.getElementById('lbl-alcance').textContent = "Área Contratada";
            document.getElementById('summary-alcance').textContent = formatNumber(alcM2);
            document.getElementById('unit-alcance').textContent = "m²";
            document.getElementById('lbl-ejecutado').textContent = "Área Ejecutada";
            document.getElementById('summary-ejecutado').textContent = formatNumber(ejM2);
            document.getElementById('unit-ejecutado').textContent = "m²";
        } else {
            document.getElementById('lbl-alcance').textContent = "Longitud Contratada";
            document.getElementById('summary-alcance').textContent = formatNumber(alcM);
            document.getElementById('unit-alcance').textContent = "m";
            document.getElementById('lbl-ejecutado').textContent = "Longitud Ejecutada";
            document.getElementById('summary-ejecutado').textContent = formatNumber(ejM);
            document.getElementById('unit-ejecutado').textContent = "m";
        }
        const pfis = selected['FISICO_NORM'] || 0, pfin = selected['FINANCIERO_NORM'] || 0;
        document.getElementById('summary-fisico-txt').textContent = pfis.toFixed(1) + '%';
        document.getElementById('summary-financiero-txt').textContent = pfin.toFixed(1) + '%';
        summaryCard.classList.remove('hidden');
        setTimeout(() => {
            document.getElementById('gauge-fisico').style.strokeDashoffset = 251.2 - (251.2 * pfis / 100);
            document.getElementById('gauge-financiero').style.strokeDashoffset = 251.2 - (251.2 * pfin / 100);
        }, 50);
        setTimeout(() => { renderMap(selected, 'summary-map', 'summary-map-overlay', 'summary-map-msg', summaryMapInstance, (ni, ng) => { summaryMapInstance = ni; summaryLayerGroup = ng; }); }, 100);
    } else { summaryCard.classList.add('hidden'); }
    currentPage = 1; updateDashboard();
}

function resetFilters() {
    ['filter-search', 'filter-vigencia', 'filter-municipio', 'filter-estado', 'filter-convenio-num'].forEach(id => document.getElementById(id).value = '');
    applyFilters();
}

function updateDashboard() { updateKPIs(); renderTable(); updateCharts(); renderAlerts(); }

function updateKPIs() {
    let activos = 0, porLiquidar = 0, sumInv = 0, sumDes = 0, sumAut = 0;
    filteredData.forEach(r => {
        const est = String(r['ESTADO CONVENIO']).toLowerCase();
        if(est.includes('ejecución')) activos++;
        if(est.includes('por liquidar')) porLiquidar++; 
        sumInv += r['VALOR TOTAL'] || 0;
        sumDes += r['VALOR TOTAL DESEMBOLSADO'] || 0;
        sumAut += r['VALOR TOTAL AUTORIZADO'] || 0;
    });

    document.getElementById('kpi-total').textContent = filteredData.length;
    document.getElementById('kpi-activos').textContent = activos;
    document.getElementById('kpi-por-liquidar').textContent = porLiquidar;

    document.getElementById('kpi-inversion').textContent = formatCurrency(sumInv);
    document.getElementById('kpi-inversion').title = formatCurrency(sumInv);
    document.getElementById('kpi-desembolsado').textContent = formatCurrency(sumDes);
    document.getElementById('kpi-desembolsado').title = formatCurrency(sumDes);
    document.getElementById('kpi-autorizado').textContent = formatCurrency(sumAut);
    document.getElementById('kpi-autorizado').title = formatCurrency(sumAut);
}

function renderTable() {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';
    const start = (currentPage - 1) * rowsPerPage;
    const paginated = filteredData.slice(start, start + rowsPerPage);

    if (paginated.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="px-5 py-12 text-center text-slate-400 font-medium text-sm"><i class="fa-solid fa-folder-open text-3xl mb-3 block opacity-30"></i>No se encontraron convenios con los parámetros actuales.</td></tr>`;
        document.getElementById('table-info').textContent = `Mostrando 0 registros`;
        return;
    }

    paginated.forEach(row => {
        const tr = document.createElement('tr');
        tr.className = 'table-row-hover border-b border-slate-100 group';
        
        const sysState = getSystemState(row['ESTADO CONVENIO']);
        
        // Alertas automáticas
        let alertIcon = '';
        let warnings = [];
        if (row['FISICO_NORM'] > (row['FINANCIERO_NORM'] + 5)) {
            warnings.push("Desfase: Avance físico es mayor al financiero.");
        }
        
        const tieneGeo = String(row['TIENE_GEOJSON'] || 'SI').toUpperCase();
        const tieneFotos = String(row['TIENE_FOTOS'] || 'SI').toUpperCase();
        if (tieneGeo === 'NO') warnings.push("Falta trazado espacial.");
        if (tieneFotos === 'NO') warnings.push("Sin registro fotográfico.");
        
        if (warnings.length > 0) {
            alertIcon = `<span class="alert-icon-pulse" title="${warnings.join(' \n')}"><i class="fa-solid fa-triangle-exclamation text-xs fa-beat-fade" style="--fa-animation-duration: 2.5s;"></i></span>`;
        }

        tr.innerHTML = `
            <td class="px-5 py-3">
                <div class="flex items-center">
                    <span class="font-black text-slate-800 text-sm">${row['CONVENIO'] || 'S/N'}</span>
                    ${alertIcon}
                </div>
            </td>
            <td class="px-5 py-3">
                <span class="municipio-chip">${row['MUNICIPIO'] || 'N/A'}</span>
            </td>
            <td class="px-5 py-3">
                <div class="w-[200px]">
                    <p class="text-[11px] font-bold text-slate-700 truncate" title="${row['INDICADOR'] || '-'}">${row['INDICADOR'] || '-'}</p>
                    <p class="text-[9px] text-slate-400 uppercase tracking-widest mt-1 truncate">${row['CLASIFICACIÓN'] || '-'}</p>
                </div>
            </td>
            <td class="px-5 py-3">
                <span class="badge-estado ${sysState.badgeClass}">${sysState.label}</span>
            </td>
            <td class="px-5 py-3">
                <div class="flex flex-col gap-1.5">
                    <div class="flex justify-between items-end">
                        <span class="text-[10px] font-black text-slate-700">${row['FISICO_NORM'].toFixed(1)}%</span>
                    </div>
                    <div class="progress-track"><div class="progress-fisico" style="width: ${row['FISICO_NORM']}%"></div></div>
                </div>
            </td>
            <td class="px-5 py-3">
                <div class="flex flex-col gap-1.5">
                    <div class="flex justify-between items-end">
                        <span class="text-[10px] font-black text-slate-700">${row['FINANCIERO_NORM'].toFixed(1)}%</span>
                    </div>
                    <div class="progress-track"><div class="progress-financiero" style="width: ${row['FINANCIERO_NORM']}%"></div></div>
                </div>
            </td>
            <td class="px-5 py-3 text-center">
                <button onclick='openModal(${JSON.stringify(row).replace(/'/g, "&#39;")})' title="Ver Ficha" class="btn-gestion">
                    <i class="fa-solid fa-folder-open icon-accent"></i> Ficha
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('table-info').textContent = `Mostrando convenios ${start + 1} - ${Math.min(start + rowsPerPage, filteredData.length)} de ${filteredData.length}`;
    document.getElementById('btn-prev').disabled = currentPage === 1;
    document.getElementById('btn-next').disabled = start + rowsPerPage >= filteredData.length;
}

function parseCOPDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    return new Date(parts[2], parts[1] - 1, parts[0]);
}

function renderAlerts() {
    const feed = document.getElementById('alert-feed');
    const countSpan = document.getElementById('alerts-count');
    if (!feed || !countSpan) return;

    let alerts = [];
    const today = new Date();

    filteredData.forEach(row => {
        const est = String(row['ESTADO CONVENIO'] || '').trim();
        const conv = row['CONVENIO'] || 'S/N';
        const mun = row['MUNICIPIO'] || 'N/A';
        const fisico = row['FISICO_NORM'] || 0;
        const financiero = row['FINANCIERO_NORM'] || 0;
        const desembolsado = row['VALOR TOTAL DESEMBOLSADO'] || 0;
        const suspMeses = row['SUSPENSIÓN(MESES)'] || 0;
        const tieneFotos = String(row['TIENE_FOTOS'] || 'SI').toUpperCase();
        
        let termStr = row['NUEVA FECHA DE TERMINACIÓN'] || row['FECHA DE TERMINACIÓN'];
        let termDate = parseCOPDate(termStr);

        // 1. Riesgo de pérdida de competencia (Límite 30 meses)
        if (est.toLowerCase() !== 'liquidado' && termDate && termDate < today) {
            const msPassed = today.getTime() - termDate.getTime();
            const monthsPassed = msPassed / (1000 * 60 * 60 * 24 * 30.436875);
            
            if (monthsPassed >= 24) { // Le faltan menos de 6 meses para el límite de 30
                const limitDate = new Date(termDate);
                limitDate.setMonth(limitDate.getMonth() + 30);
                const limitStr = `${String(limitDate.getDate()).padStart(2, '0')}/${String(limitDate.getMonth() + 1).padStart(2, '0')}/${limitDate.getFullYear()}`;
                
                const monthsLeft = (30 - monthsPassed).toFixed(1);
                const faltanTxt = monthsLeft > 0 
                    ? `<span class="inline-block mt-1 font-bold bg-red-200 text-red-900 px-1.5 py-0.5 rounded shadow-sm border border-red-300">¡Faltan ${monthsLeft} meses!</span>` 
                    : `<span class="inline-block mt-1 font-black bg-red-600 text-white px-1.5 py-0.5 rounded shadow-sm">¡Límite superado por ${Math.abs(monthsLeft).toFixed(1)} meses!</span>`;
                
                alerts.push({
                    type: 'competencia', icon: 'fa-gavel text-red-600 fa-beat-fade', bg: 'bg-red-50', border: 'border-red-300',
                    title: 'Riesgo: Pérdida de Competencia',
                    desc: `Finalizó el ${termStr}. Límite legal es a los 30 meses (${limitStr}).<br>${faltanTxt}`,
                    conv, mun
                });
            } else {
                alerts.push({
                    type: 'vencido', icon: 'fa-calendar-xmark text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100',
                    title: 'Vencido sin liquidar',
                    desc: `Finalizó el ${termStr} y sigue en ${est}.`,
                    conv, mun
                });
            }
        }

        // 2. Pagos adelantados (Desfase > 15%)
        if (financiero > fisico + 15) {
            alerts.push({
                type: 'desfase', icon: 'fa-money-bill-trend-up text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100',
                title: 'Desfase Financiero Crítico',
                desc: `Financiero (${financiero.toFixed(1)}%) supera al físico (${fisico.toFixed(1)}%) por >15%.`,
                conv, mun
            });
        }

        // 3. Sin evidencia
        if (tieneFotos === 'NO') {
            alerts.push({
                type: 'evidencia', icon: 'fa-camera-slash text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200',
                title: 'Sin Evidencia Fotográfica',
                desc: `No hay registro fotográfico cargado en el sistema.`,
                conv, mun
            });
        }

        // 4. Suspensión crítica (>= 3 meses)
        if (est.toLowerCase().includes('suspendido') && suspMeses >= 3) {
            alerts.push({
                type: 'suspension', icon: 'fa-pause text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100',
                title: 'Suspensión Prolongada',
                desc: `Acumula ${suspMeses} meses de suspensión.`,
                conv, mun
            });
        }

        // 5. Sin desembolsar estando en ejecución
        if (est.toLowerCase().includes('ejecución') && desembolsado === 0) {
            alerts.push({
                type: 'nulo', icon: 'fa-triangle-exclamation text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100',
                title: 'Cero Desembolsos en Ejecución',
                desc: `En ejecución pero no hay pagos registrados ($0).`,
                conv, mun
            });
        }
    });

    const finalAlerts = currentAlertFilter === 'all' ? alerts : alerts.filter(a => a.type === currentAlertFilter);
    countSpan.textContent = finalAlerts.length;

    if (finalAlerts.length === 0) {
        feed.innerHTML = `<div class="p-6 text-center text-slate-400 font-medium border border-dashed border-slate-200 rounded-xl"><i class="fa-solid fa-shield-check text-3xl mb-3 block text-emerald-400 opacity-50"></i>No se detectaron riesgos en la selección actual para este filtro.</div>`;
        return;
    }

    feed.innerHTML = finalAlerts.map(a => `
        <div class="p-3 rounded-xl border ${a.border} ${a.bg} flex gap-3 items-start transition hover:shadow-sm cursor-pointer" onclick="const row=filteredData.find(r=>String(r['CONVENIO']).trim()==='${a.conv}'); if(row) openModal(row);">
            <div class="mt-0.5"><i class="fa-solid ${a.icon} text-lg"></i></div>
            <div>
                <h4 class="text-[11px] font-black text-slate-800 uppercase tracking-tight">${a.title}</h4>
                <p class="text-[10px] text-slate-600 font-medium leading-tight mt-0.5">${a.desc}</p>
                <div class="mt-1.5 flex gap-2 items-center">
                    <span class="text-[9px] font-bold bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">${a.conv}</span>
                    <span class="text-[9px] font-semibold text-slate-500 truncate max-w-[120px]">${a.mun}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function updateCharts() {
    if (typeof Chart === 'undefined') return;
    const hoverCursor = (e, el) => { e.native.target.style.cursor = el[0] ? 'pointer' : 'default'; };

    const canvasEstado = document.getElementById('chart-estado');
    if (canvasEstado) {
        const estMap = {}; 
        let totalVal = 0;
        let totalCount = filteredData.length;

        filteredData.forEach(r => { 
            const e = String(r['ESTADO CONVENIO'] || 'Sin Estado').trim(); 
            if (!estMap[e]) estMap[e] = { count: 0, inversion: 0 };
            estMap[e].count += 1; 
            estMap[e].inversion += (r['VALOR TOTAL'] || 0);
            totalVal += (r['VALOR TOTAL'] || 0);
        });
        
        const labelsEstado = Object.keys(estMap);
        const dataCount = labelsEstado.map(l => estMap[l].count);
        const bgColors = labelsEstado.map(label => getSystemState(label).hex); 

        if(charts['estado']) charts['estado'].destroy();

        const centerTextPlugin = {
            id: 'centerText',
            beforeDraw: function(chart) {
                const width = chart.width, height = chart.height, ctx = chart.ctx;
                ctx.restore();
                const fontSize = (height / 114).toFixed(2);
                ctx.font = `900 ${fontSize}em Inter`;
                ctx.textBaseline = "middle";
                ctx.fillStyle = "#1e293b";
                const text = totalCount.toString();
                const textX = Math.round((width - ctx.measureText(text).width) / 2);
                const textY = height / 2;
                ctx.fillText(text, textX, textY);
                
                ctx.font = `700 ${(height / 250).toFixed(2)}em Inter`;
                ctx.fillStyle = "#64748b";
                const text2 = "TOTAL";
                const text2X = Math.round((width - ctx.measureText(text2).width) / 2);
                ctx.fillText(text2, text2X, textY - (height/8));
                ctx.save();
            }
        };

        charts['estado'] = new Chart(canvasEstado, {
            type: 'doughnut',
            data: { 
                labels: labelsEstado, 
                datasets: [{ data: dataCount, backgroundColor: bgColors, borderWidth: 2, borderColor: '#ffffff', hoverOffset: 6 }] 
            },
            plugins: [centerTextPlugin],
            options: { 
                responsive: true, maintainAspectRatio: false, cutout: '75%', onHover: hoverCursor, 
                animation: { animateScale: true, animateRotate: true, duration: 800, easing: 'easeOutQuart' },
                onClick: (e, activeEls) => { if (activeEls.length > 0) { document.getElementById('filter-estado').value = labelsEstado[activeEls[0].index]; applyFilters(); } }, 
                plugins: { 
                    legend: { display: false }, 
                    tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.95)', padding: 12, cornerRadius: 8, titleFont: {size: 11}, bodyFont: {size: 13, weight: 'bold'}, callbacks: { label: (c) => ` ${c.label}: ${c.raw} convenios` } } 
                } 
            }
        });

        const legendContainer = document.getElementById('chart-estado-legend');
        if (legendContainer) {
            legendContainer.innerHTML = labelsEstado.sort((a,b) => estMap[b].count - estMap[a].count).map(label => {
                const sysState = getSystemState(label);
                const stat = estMap[label];
                const pct = totalCount > 0 ? Math.round((stat.count / totalCount) * 100) : 0;
                return `
                <div class="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer border border-transparent hover:border-slate-100" onclick="document.getElementById('filter-estado').value='${label}'; applyFilters();">
                    <div class="flex items-center gap-3">
                        <div class="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm" style="background-color: ${sysState.hex}"></div>
                        <div>
                            <p class="text-[10px] font-black text-slate-700 uppercase tracking-tight">${label}</p>
                            <p class="text-[9px] font-semibold text-slate-500 mt-0.5">${formatCurrency(stat.inversion)}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-xs font-black text-slate-800">${stat.count}</p>
                        <p class="text-[9px] font-bold text-slate-400">${pct}%</p>
                    </div>
                </div>
                `;
            }).join('');
        }
    }
}

// ------ MAPA HÍBRIDO CON TOOLTIPS Y EXTRACCIÓN DE COORDENADAS ------
async function renderMap(row, mapId, overlayId, msgId, inst, cb) {
    const ov = document.getElementById(overlayId), ms = document.getElementById(msgId);
    ov.classList.remove('hidden'); ms.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Trazando Geometría...';
    
    let m = inst, g = null;
    if(!m){ 
        m = L.map(mapId, { zoomControl: false, attributionControl: false, preferCanvas: true }).setView([6.2, -75.5], 10); 
        L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { maxZoom: 22, maxNativeZoom: 20 }).addTo(m);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png', { maxZoom: 22, maxNativeZoom: 19, subdomains: 'abcd' }).addTo(m);
        L.control.zoom({ position: 'bottomright' }).addTo(m);
        g = L.layerGroup().addTo(m); cb(m, g);
    } else { 
        m.eachLayer(l => { if(l instanceof L.LayerGroup) { g = l; g.clearLayers(); }}); 
        m.invalidateSize(); 
    }
    
    const num = String(row['CONVENIO']).trim();
    let ok = false, b = null;
    currentExtractedFeatures = []; 
    
    const tramoStyle = { color: '#ef4444', weight: 5, opacity: 0.9, lineCap: 'round', lineJoin: 'round' };
    const highlightStyle = { color: '#10b981', weight: 8, opacity: 1, lineCap: 'round', lineJoin: 'round' };

    const onEachFeat = (feature, layer) => {
        let name = feature.properties ? (feature.properties.name || feature.properties.Name || feature.properties.NAME) : null;
        if (name) {
            layer.bindTooltip(`<div class="font-bold text-slate-800 text-[10px] uppercase tracking-widest">${name}</div>`, { sticky: true, className: 'custom-leaflet-tooltip' });
            currentExtractedFeatures.push({ name, layer });
            layer.on('click', () => {
                const btnId = `btn-feat-${mapId}-${name.replace(/[^a-zA-Z0-9]/g, '-')}`;
                const btn = document.getElementById(btnId);
                if(btn) btn.click();
            });
        }
    };

    try {
        const r = await fetch(`./assets/mapas/${num}.geojson`);
        if(r.ok) {
            const d = await r.json();
            const l = L.geoJSON(d, { 
                style: tramoStyle, 
                pointToLayer: (f, ll) => L.circleMarker(ll, { radius: 6, fillColor: "#ef4444", color: "#fff", weight: 2, fillOpacity: 0.8 }),
                onEachFeature: onEachFeat
            });
            g.addLayer(l); b = l.getBounds(); ok = true;
        }
    } catch(e){}

    if(!ok && typeof omnivore !== 'undefined'){
        ok = await new Promise(res => {
            const customLayer = L.geoJSON(null, {
                style: tramoStyle,
                pointToLayer: (f, ll) => L.circleMarker(ll, { radius: 6, fillColor: "#ef4444", color: "#fff", weight: 2, fillOpacity: 0.8 }),
                onEachFeature: onEachFeat
            });
            const k = omnivore.kml(`./assets/mapas/${num}.kml`, null, customLayer).on('ready', () => { 
                g.addLayer(k); b = k.getBounds(); res(true); 
            }).on('error', () => res(false));
        });
    }

    if(!ok){
        const la = parseFloat(row['LATITUD']), lo = parseFloat(row['LONGITUD']);
        if(!isNaN(la) && !isNaN(lo) && la!==0){ g.addLayer(L.marker([la, lo])); m.setView([la, lo], 15); ok = true; }
    } else if(b && Object.keys(b).length > 0) { 
        m.fitBounds(b, { padding: [40,40] }); 
    }
    
    // Panel Lateral
    const sidebar = document.getElementById(`${mapId}-sidebar`);
    const featureList = document.getElementById(`${mapId}-feature-list`);
    const featureDetails = document.getElementById('map-feature-details');
    
    if (sidebar && featureList && featureDetails) {
        featureList.innerHTML = '';
        featureDetails.classList.add('hidden');
        featureDetails.classList.remove('flex');

        if (currentExtractedFeatures.length > 0) {
            sidebar.classList.remove('hidden');
            sidebar.classList.add('flex');
            
            currentExtractedFeatures.forEach((item) => {
                const btn = document.createElement('button');
                btn.id = `btn-feat-${mapId}-${item.name.replace(/[^a-zA-Z0-9]/g, '-')}`;
                btn.className = 'w-full text-left px-2 py-2 text-[9px] font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-800 rounded-lg transition border border-transparent focus:outline-none truncate';
                btn.title = item.name;
                btn.innerHTML = `<i class="fa-solid fa-route mr-1 opacity-50"></i> ${item.name}`;

                btn.onclick = () => {
                    currentExtractedFeatures.forEach(f => { if (f.layer.setStyle && typeof f.layer.setStyle === 'function') f.layer.setStyle(tramoStyle); });
                    Array.from(featureList.children).forEach(b => {
                        b.classList.remove('bg-institutional-pale', 'border-institutional-light', 'text-institutional-primary');
                        b.classList.add('hover:bg-slate-100', 'text-slate-600');
                    });

                    if (item.layer.setStyle && typeof item.layer.setStyle === 'function') item.layer.setStyle(highlightStyle);
                    btn.classList.add('bg-institutional-pale', 'border-institutional-light', 'text-institutional-primary');
                    btn.classList.remove('hover:bg-slate-100', 'text-slate-600');

                    if (item.layer.getBounds) {
                        m.fitBounds(item.layer.getBounds(), { padding: [50, 50] });
                    } else if (item.layer.getLatLng) {
                        m.setView(item.layer.getLatLng(), 18);
                    }

                    let coords = getCoords(item.layer);
                    if (coords) {
                        featureDetails.classList.remove('hidden');
                        featureDetails.classList.add('flex');
                        document.getElementById('coord-name').textContent = item.name;
                        document.getElementById('coord-name').title = item.name;
                        document.getElementById('coord-start').value = coords.start;
                        document.getElementById('coord-end').value = coords.end;
                    }
                    btn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                };
                featureList.appendChild(btn);
            });
            setTimeout(() => m.invalidateSize(), 300);
        } else {
            sidebar.classList.add('hidden');
            sidebar.classList.remove('flex');
            setTimeout(() => m.invalidateSize(), 300);
        }
    }

    if(ok) ov.classList.add('hidden'); else ms.innerHTML = "Sin trazado geográfico";
}

// ------ LÓGICA MODAL DETALLE ------
function openModal(row) {
    const sysState = getSystemState(row['ESTADO CONVENIO']);
    
    // Configurar estado visual del modal
    document.getElementById('modal-state-band').style.background = sysState.hex;
    document.getElementById('modal-badge').className = `badge-estado ${sysState.badgeClass}`;
    document.getElementById('modal-badge').textContent = sysState.label;

    document.getElementById('modal-title').textContent = `${row['CONVENIO']}`;
    document.getElementById('modal-subtitle').textContent = `${row['MUNICIPIO']} - VIGENCIA ${row['VIGENCIA']}`;
    
    // Configurar enlace del PDF
    document.getElementById('btn-open-source-pdf').href = `./assets/pdfs/${String(row['CONVENIO']).trim()}.pdf`;
    
    document.getElementById('mod-objeto').textContent = row['OBJETO'] || 'Sin descripción u objeto definido.';
    document.getElementById('mod-via').textContent = row['VIA_PRIORIZADA'];
    document.getElementById('mod-alcance').textContent = `${formatNumber(row['ALCANCE (M)'])} m / ${formatNumber(row['ALCANCE (M2)'])} m²`;
    document.getElementById('mod-ejecutado-areas').textContent = `${formatNumber(row['LONGITUD EJECUTADA'])} m / ${formatNumber(row['AREA EJECUTADA (M2)'])} m²`;

    document.getElementById('mod-valor-total').textContent = formatCurrency(row['VALOR TOTAL']);
    document.getElementById('mod-aporte-depto').textContent = formatCurrency(row['APORTE DEPARTAMENTO']);
    document.getElementById('mod-aporte-mun').textContent = formatCurrency(row['APORTE MUNICIPIO']);
    document.getElementById('mod-desembolsado-full').textContent = formatCurrency(row['VALOR TOTAL DESEMBOLSADO']);
    document.getElementById('mod-autorizado-full').textContent = formatCurrency(row['VALOR TOTAL AUTORIZADO']);

    document.getElementById('mod-inicio').textContent = row['FECHA DE ACTA DE INICIO'] || 'Por definir';
    
    let plazoVal = 0;
    for (let key in row) {
        if (key.toUpperCase().trim() === 'PLAZO INICIAL' || key.toUpperCase().trim().includes('PLAZO INICIAL')) {
            plazoVal = row[key];
            break;
        }
    }
    
    document.getElementById('mod-plazo-inicial').textContent = (plazoVal || 0) + ' Meses';
    document.getElementById('mod-terminacion').textContent = row['FECHA DE TERMINACIÓN'];
    document.getElementById('mod-nueva-terminacion').textContent = row['NUEVA FECHA DE TERMINACIÓN'] || 'Sin cambios';
    document.getElementById('mod-prorrogas').textContent = (row['PRÓRROGA (MESES)'] || 0) + ' Meses';
    document.getElementById('mod-suspensiones').textContent = (row['SUSPENSIÓN(MESES)'] || 0) + ' Meses';
    document.getElementById('mod-observaciones').innerHTML = row['OBSERVACIONES'] ? row['OBSERVACIONES'].replace(/\n/g, '<br>') : 'Sin observaciones adicionales registradas.';
    
    const pf = row['FISICO_NORM'] || 0, pfn = row['FINANCIERO_NORM'] || 0;
    document.getElementById('mod-txt-fisico').textContent = pf.toFixed(1) + '%';
    document.getElementById('mod-bar-fisico').style.width = pf + '%';
    document.getElementById('mod-txt-financiero').textContent = pfn.toFixed(1) + '%';
    document.getElementById('mod-bar-financiero').style.width = pfn + '%';

    document.getElementById('modal-detalle').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => { 
        renderMap(row, 'map', 'map-overlay', 'map-msg', mapInstance, (ni, ng) => { 
            mapInstance = ni; currentLayerGroup = ng; 
        }); 
    }, 250);

    const gal = document.getElementById('mod-galeria'), emp = document.getElementById('mod-galeria-empty');
    gal.innerHTML = ''; emp.classList.add('hidden'); currentGalleryImages = [];
    const n = String(row['CONVENIO']).trim();
    for(let i=1; i<=8; i++){
        const img = document.createElement('img');
        img.src = `./assets/fotos/${n}/${i}.jpg`;
        img.className = 'w-full h-24 object-cover rounded-lg cursor-pointer hover:ring-2 hover:ring-institutional-light transition-all shadow-sm';
        img.onerror = () => img.remove();
        img.onload = () => { 
            img.onclick = () => { 
                currentGalleryImages = Array.from(gal.querySelectorAll('img')).map(e => e.src); 
                openLightbox(currentGalleryImages.indexOf(img.src)); 
            }; 
            gal.appendChild(img); 
        };
    }
    setTimeout(() => { if(gal.querySelectorAll('img').length === 0) emp.classList.remove('hidden'); }, 600);
}

function closeModal() { document.getElementById('modal-detalle').classList.add('hidden'); document.body.style.overflow = 'auto'; }
function openLightbox(i) { currentImageIndex = i; updateLightbox(); document.getElementById('modal-lightbox').classList.remove('hidden'); }
function closeLightbox() { document.getElementById('modal-lightbox').classList.add('hidden'); }
function updateLightbox() {
    if(currentGalleryImages.length === 0) return;
    const im = document.getElementById('lightbox-img'); im.style.opacity = 0;
    setTimeout(() => { im.src = currentGalleryImages[currentImageIndex]; im.style.opacity = 1; }, 150);
    document.getElementById('lightbox-counter').textContent = `${currentImageIndex + 1} / ${currentGalleryImages.length}`;
    const bp = document.getElementById('btn-prev-img'), bn = document.getElementById('btn-next-img');
    if(currentGalleryImages.length > 1){ bp.classList.remove('hidden'); bn.classList.remove('hidden'); } else { bp.classList.add('hidden'); bn.classList.add('hidden'); }
}
function navigateLightbox(d) {
    if(currentGalleryImages.length <= 1) return;
    currentImageIndex = (currentImageIndex + d + currentGalleryImages.length) % currentGalleryImages.length;
    updateLightbox();
}

function changePage(d) { currentPage += d; renderTable(); }
function sortTable(c) { currentSort.asc = (currentSort.column === c) ? !currentSort.asc : true; currentSort.column = c; filteredData.sort((a,b) => (a[c] > b[c] ? 1 : -1) * (currentSort.asc ? 1 : -1)); renderTable(); }
function exportToCSV() { const ws = XLSX.utils.json_to_sheet(filteredData); const csv = XLSX.utils.sheet_to_csv(ws); const blob = new Blob(["\ufeff", csv], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "convenios_margarita.csv"; link.click(); }

document.addEventListener('click', (e) => {
    const btn = e.target.closest('.alert-filter-btn');
    if (btn) {
        document.querySelectorAll('.alert-filter-btn').forEach(b => {
            b.classList.remove('active', 'bg-slate-800', 'text-white');
            b.classList.add('bg-slate-100', 'text-slate-600', 'hover:bg-slate-200', 'hover:text-slate-800');
        });
        btn.classList.remove('bg-slate-100', 'text-slate-600', 'hover:bg-slate-200', 'hover:text-slate-800');
        btn.classList.add('active', 'bg-slate-800', 'text-white');
        currentAlertFilter = btn.dataset.filter;
        renderAlerts();
    }
});
