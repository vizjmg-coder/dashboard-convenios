// Variables Globales
let rawData = [];
let filteredData = [];
let charts = {};
let currentPage = 1;
const rowsPerPage = 12;
let currentSort = { column: 'CONVENIO', asc: true };
let currentChartMode = 'top'; // 'top' o 'municipio'
let currentAlertFilter = 'all';
let planMetric = 'ejecutado';
let planAnualMetric = 'longitud';
let planAnualFilter = 'todos-km';
let planYearFilter = 'todos';
let mapMetric = 'contratado';

// Variables Mini-Mapa (Leaflet — ficha técnica modal y resumen)
let mapInstance = null;
let currentLayerGroup = null;
let summaryMapInstance = null;
let summaryLayerGroup = null;
let currentExtractedFeatures = [];
// (Las variables del mapa territorial principal se declaran en la sección MapLibre GL JS)


const antioquiaSubregiones = {
    "VALLE DE ABURRÁ": ["MEDELLIN", "MEDELLÍN", "BELLO", "ITAGÜÍ", "ITAGUI", "ENVIGADO", "SABANETA", "CALDAS", "COPACABANA", "GIRARDOTA", "LA ESTRELLA", "BARBOSA"],
    "URABÁ": ["APARTADÓ", "APARTADO", "CAREPA", "CHIGORODÓ", "CHIGORODO", "MUTATÁ", "MUTATA", "TURBO", "NECOCLÍ", "NECOCLI", "SAN JUAN DE URABÁ", "SAN JUAN DE URABA", "SAN PEDRO DE URABÁ", "SAN PEDRO DE URABA", "ARBOLETES", "VIGÍA DEL FUERTE", "VIGIA DEL FUERTE", "MURINDÓ", "MURINDO"],
    "BAJO CAUCA": ["CAUCASIA", "EL BAGRE", "NECHÍ", "NECHI", "TARAZÁ", "TARAZA", "CÁCERES", "CACERES", "ZARAGOZA"],
    "MAGDALENA MEDIO": ["PUERTO BERRÍO", "PUERTO BERRIO", "PUERTO NARE", "PUERTO TRIUNFO", "MACEO", "CARACOLÍ", "CARACOLI", "YONDÓ", "YONDO"],
    "ORIENTE": ["RIONEGRO", "MARINILLA", "GUARNE", "LA CEJA", "EL CARMEN DE VIBORAL", "EL RETIRO", "RETIRO", "SANTUARIO", "EL SANTUARIO", "GUATAPÉ", "GUATAPE", "EL PEÑOL", "PEÑOL", "PENOL", "SAN RAFAEL", "SAN CARLOS", "GRANADA", "COCORNÁ", "COCORNA", "SAN LUIS", "SAN FRANCISCO", "ABEJORRAL", "SONSÓN", "SONSON", "NARIÑO", "NARINO", "ARGELIA", "ALEJANDRÍA", "ALEJANDRIA", "CONCEPCIÓN", "CONCEPCION", "SAN VICENTE", "LA UNION", "LA UNIÓN"],
    "OCCIDENTE": ["SANTA FE DE ANTIOQUIA", "SANTAFE DE ANTIOQUIA", "SOPETRÁN", "SOPETRAN", "SAN JERÓNIMO", "SAN JERONIMO", "OLAYA", "SABANALARGA", "LIBORINA", "EBÉJICO", "EBEJICO", "ANZA", "ANZÁ", "CAICEDO", "URAMITA", "DABEIBA", "FRONTINO", "ABRIAQUÍ", "ABRIAQUI", "PEQUE", "BURITICÁ", "BURITICA", "GIRALDO", "CAÑASGORDAS", "CANASGORDAS", "HELICONIA"],
    "SUROESTE": ["ANDES", "CIUDAD BOLÍVAR", "CIUDAD BOLIVAR", "HISPANIA", "JERICÓ", "JERICO", "TARSO", "PUEBLORRICO", "SALGAR", "CONCORDIA", "TITIRIBÍ", "TITIRIBI", "VENECIA", "FREDONIA", "SANTA BÁRBARA", "SANTA BARBARA", "MONTEBELLO", "LA PINTADA", "VALPARAÍSO", "VALPARAISO", "CARAMANTA", "TÁMESIS", "TAMESIS", "AMAGÁ", "AMAGA", "ANGELÓPOLIS", "ANGELOPOLIS", "BETULIA", "URRAO", "ARMENIA", "BETANIA", "JARDIN", "JARDÍN"],
    "NORTE": ["DONMATÍAS", "DONMATIAS", "DON MATIAS", "SAN PEDRO DE LOS MILAGROS", "SAN PEDRO", "ENTRERRÍOS", "ENTRERRIOS", "BELMIRA", "SANTO DOMINGO", "SANTA ROSA DE OSOS", "YARUMAL", "ANGOSTURA", "CAMPAMENTO", "SAN ANDRÉS DE CUERQUIA", "SAN ANDRES", "SAN ANDRÉS", "TOLEDO", "SAN JOSÉ DE LA MONTAÑA", "SAN JOSE DE LA MONTANA", "ITUANGO", "VALDIVIA", "BRICEÑO", "BRICENO", "GÓMEZ PLATA", "GOMEZ PLATA", "GUADALUPE", "CAROLINA DEL PRÍNCIPE", "CAROLINA"],
    "NORDESTE": ["AMALFI", "ANORÍ", "ANORI", "CISNEROS", "YALÍ", "YALI", "YOLOMBÓ", "YOLOMBO", "SAN ROQUE", "SANTO DOMINGO", "MACEO", "REMEDIOS", "SEGOVIA", "VEGACHÍ", "VEGACHI"]
};

const subregionColors = {
    "VALLE DE ABURRÁ": { fill: "#c68664", border: "#000000" },
    "VALLE DE ABURRA": { fill: "#c68664", border: "#000000" },
    "ORIENTE": { fill: "#ffb74d", border: "#000000" },
    "NORDESTE": { fill: "#fefb9e", border: "#000000" },
    "NORTE": { fill: "#faa4b1", border: "#000000" },
    "OCCIDENTE": { fill: "#ffee55", border: "#000000" },
    "SUROESTE": { fill: "#df9ae1", border: "#000000" },
    "URABÁ": { fill: "#a2d984", border: "#000000" },
    "URABA": { fill: "#a2d984", border: "#000000" },
    "BAJO CAUCA": { fill: "#dca2e8", border: "#000000" },
    "MAGDALENA MEDIO": { fill: "#ffa1a1", border: "#000000" },
    "OTRAS": { fill: "#f1f5f9", border: "#000000" }
};

// Variables Galería Lightbox
let currentGalleryImages = [];
let currentImageIndex = 0;

// Utilidades
const formatCurrency = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val || 0);
const formatNumber = (val) => new Intl.NumberFormat('es-CO').format(val || 0);

const getSelectValues = (id) => {
    const el = typeof id === 'string' ? document.getElementById(id) : id;
    if (!el) return [];
    if (el.multiple) {
        return Array.from(el.selectedOptions)
            .map(opt => String(opt.value || '').trim())
            .filter(val => val !== '' && val !== 'todos' && val !== 'TODOS');
    } else {
        const val = el.value ? String(el.value).trim() : '';
        return (val && val !== 'todos' && val !== 'TODOS') ? [val] : [];
    }
};

const parseNum = (val) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    return parseFloat(val.toString().replace(/[^0-9.-]+/g, "")) || 0;
};

const isCuatrenioAnterior = (row) => {
    if (!row) return false;
    const v = parseInt(row['VIGENCIA'], 10);
    return !isNaN(v) && v < 2024;
};

const getRowLongitudEjecutada = (row) => {
    if (!row) return 0;
    return parseNum(row['LONGITUD EJECUTADA']);
};

const getRowAreaEjecutada = (row) => {
    if (!row) return 0;
    return parseNum(row['AREA EJECUTADA (M2)']);
};

const getRowLongitudContratada = (row) => {
    if (!row) return 0;
    return parseNum(row['ALCANCE (M)']) || parseNum(row['LONGITUD CONTRATADA']);
};

const getRowAreaContratada = (row) => {
    if (!row) return 0;
    return parseNum(row['ALCANCE (M2)']) || parseNum(row['AREA CONTRATADA']) || parseNum(row['ÁREA CONTRATADA']);
};

// Funciones específicas para la pestaña Indicadores (Plan de Desarrollo 2024-2027)
// Excluyen cuatrienios anteriores (< 2024) para la medición de cumplimiento del Plan de Desarrollo
const getRowLongitudContratadaPlan = (row) => {
    if (!row || isCuatrenioAnterior(row)) return 0;
    return parseNum(row['ALCANCE (M)']) || parseNum(row['LONGITUD CONTRATADA']);
};

const getRowAreaContratadaPlan = (row) => {
    if (!row || isCuatrenioAnterior(row)) return 0;
    return parseNum(row['ALCANCE (M2)']) || parseNum(row['AREA CONTRATADA']) || parseNum(row['ÁREA CONTRATADA']);
};

const getRowLongitudEjecutadaPlan = (row) => {
    if (!row) return 0;
    if (isCuatrenioAnterior(row)) {
        return parseNum(row['LONGITUD EJECUTADA CUATRENIO']);
    }
    return parseNum(row['LONGITUD EJECUTADA']);
};

const getRowAreaEjecutadaPlan = (row) => {
    if (!row) return 0;
    if (isCuatrenioAnterior(row)) {
        return parseNum(row['AREA EJECUTADA CUATRENIO (M2)']);
    }
    return parseNum(row['AREA EJECUTADA (M2)']);
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
    const est = String(estado || 'N/A').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");

    if (est.includes('ejecutado')) return {
        badgeClass: 'badge-ejecutado',
        hex: '#2563EB',
        label: 'Ejecutado'
    };
    if (est.includes('ejecucion')) return {
        badgeClass: 'badge-ejecucion',
        hex: '#10B981',
        label: 'En Ejecución'
    };
    if (est.includes('proximo') || est.includes('finalizar')) return {
        badgeClass: 'badge-proximo',
        hex: '#F59E0B',
        label: 'Próximo a finalizar'
    };
    if (est.includes('suspendido') || est.includes('riesgo medio') || est.includes('medio')) return {
        badgeClass: 'badge-suspendido',
        hex: '#8B5CF6',
        label: 'Suspendido'
    };
    if (est.includes('por liquidar') || est.includes('riesgo alto') || est.includes('alto') || est.includes('riesgo')) return {
        badgeClass: 'badge-por-liquidar',
        hex: '#F59E0B',
        label: 'Por Liquidar'
    };
    if (est.includes('liquidado')) return {
        badgeClass: 'badge-liquidado',
        hex: '#3B82F6',
        label: 'Liquidado'
    };

    return { badgeClass: 'badge-default', hex: '#9CA3AF', label: String(estado).toUpperCase() };
}


// Función para copiar coordenadas al portapapeles
window.copyCoord = function (inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input.value) return;

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

// ------ LÍNEA DE TIEMPO LIQUIDACIÓN ------
function renderTimeline(row) {
    const tlContainer = document.getElementById('timeline-container');
    if (!tlContainer) return;

    // Helper flexible para encontrar columnas
    const getVal = (keywords) => {
        const key = Object.keys(row).find(k => keywords.some(kw => String(k).toUpperCase().includes(kw)));
        return key ? row[key] : '';
    };

    const estConv = String(row['ESTADO CONVENIO'] || getVal(['ESTADO CONV', 'ESTADO']) || '').toUpperCase();
    const ruta = String(row['RUTA LIQUIDACIÓN'] || getVal(['RUTA LIQUID']) || '').toUpperCase();
    const actJur = String(row['ACTUACIÓN JURÍDICA'] || getVal(['ACTUACI']) || '').toUpperCase();
    const faseCobro = String(row['FASE DE COBRO (SI APLICA)'] || getVal(['FASE DE COBRO']) || '').toUpperCase();
    const estExp = String(row['ESTADO EXPEDIENTE'] || getVal(['ESTADO EXPED']) || '').toUpperCase();
    const fechaCierre = row['FECHA ACTA DE CIERRE DE EXPEDIENTE'] || getVal(['FECHA ACTA DE CIERRE', 'FECHA DE CIERRE']) || '--';

    // Mostrar si tiene que ver con liquidación o tiene datos de la ruta
    if (estConv.includes('LIQUIDA') || ruta || estExp || actJur) {
        tlContainer.classList.remove('hidden');
    } else {
        tlContainer.classList.add('hidden');
        return;
    }

    for (let i = 1; i <= 9; i++) setNodeState(i, 'pending', '--');
    setNodeState('3b', 'pending', '--');
    let maxActiveNode = 0;

    const hasLiqData = ruta || actJur || faseCobro || estExp || (fechaCierre !== '--');

    setNodeState(1, 'completed', row['FECHA DE TERMINACION'] || row['FECHA DE TERMINACIN'] || getVal(['FECHA DE TERMINAC']) || 'Completado');
    maxActiveNode = 1;

    if (hasLiqData) {
        setNodeState(2, 'completed', 'Completado');
        maxActiveNode = 2;
    }

    if (ruta.includes('UNILATERAL')) {
        setNodeState(3, 'failed', 'Incumplimiento');
        setNodeState('3b', 'failed', 'Incumplimiento');
        setNodeState(4, 'completed', 'Resolución Emitida');
        maxActiveNode = 4;

        if (actJur.includes('REPOSICIÓN') || actJur.includes('REPOSICION')) {
            setNodeState(5, 'active', 'En proceso');
            maxActiveNode = 5;
        } else if (actJur.includes('FIRME')) {
            setNodeState(5, 'completed', 'Resuelto');
            setNodeState(6, 'completed', 'Ejecutoriado');
            maxActiveNode = 6;
        }

        if (faseCobro.includes('PERSUASIVO')) {
            setNodeState(7, 'active', 'En curso');
            maxActiveNode = 7;
        } else if (faseCobro.includes('COACTIVO')) {
            setNodeState(7, 'completed', 'Finalizado');
            setNodeState(8, 'active', 'En curso');
            maxActiveNode = 8;
        }
    } else if (ruta.includes('BILATERAL') || ruta.includes('EXITOSA')) {
        setNodeState(3, 'active', 'En proceso');
        maxActiveNode = 3;
    }

    if (estExp === 'CERRADO' || estExp.includes('CERRADO')) {
        if (maxActiveNode > 2 && maxActiveNode < 9 && maxActiveNode !== 3) {
            setNodeState(maxActiveNode, 'completed', 'Finalizado');
        } else if (maxActiveNode === 3) {
            setNodeState(3, 'completed', 'Acuerdo firmado');
        }
        setNodeState(9, 'completed', fechaCierre);
        maxActiveNode = 9;
    }

    const progressLine = document.getElementById('tl-progress-line');
    const pct = ((maxActiveNode - 1) / 8) * 100;
    progressLine.style.width = pct + '%';

    const tipoOblig = String(row['TIPO OBLIGACIÓN (SI APLICA)'] || getVal(['TIPO OBLIG']) || '').toUpperCase();
    const valOblig = row['VALOR OBLIGACIÓN (SI APLICA)'] || getVal(['VALOR OBLIG']) || 0;
    const valNum = parseNum(valOblig);

    let rendVal = 0, recVal = 0;
    if (tipoOblig.includes('RENDIMIENTO')) {
        rendVal = valNum;
    } else if (tipoOblig.includes('REINTEGRO') || tipoOblig.includes('RECURSO') || tipoOblig.includes('SALDO') || tipoOblig.includes('ESPECIAL')) {
        recVal = valNum;
    } else {
        recVal = valNum;
    }

    document.getElementById('tl-fin-rendimientos').textContent = formatCurrency(rendVal);
    document.getElementById('tl-fin-recursos').textContent = formatCurrency(recVal);
    document.getElementById('tl-fin-total').textContent = formatCurrency(rendVal + recVal);

    document.getElementById('tl-fin-fecha').textContent = fechaCierre;
    if (estExp.includes('CERRADO')) {
        document.getElementById('tl-fin-estado').classList.remove('hidden');
    } else {
        document.getElementById('tl-fin-estado').classList.add('hidden');
    }
}

function setNodeState(index, state, dateText) {
    const node = document.getElementById(`node-${index}`);
    const badge = document.getElementById(`tl-badge-${index}`);
    const dateEl = document.getElementById(`tl-date-${index}`);
    if (!node || !badge || !dateEl) return;

    const iconBox = node.querySelector('.icon-box');
    iconBox.className = 'w-12 h-12 rounded-full border-4 flex items-center justify-center shadow-sm transition-all icon-box';
    badge.className = 'text-[8px] px-2 py-0.5 rounded-full mt-1 font-bold tl-badge';
    dateEl.textContent = dateText;

    let tooltipTitle = 'Pendiente';

    if (state === 'pending') {
        iconBox.classList.add('bg-slate-100', 'border-white', 'dark:bg-slate-800', 'dark:border-slate-700', 'text-slate-400');
        badge.classList.add('bg-slate-100', 'text-slate-500');
        badge.textContent = 'Pendiente';
    } else if (state === 'completed') {
        iconBox.classList.add('bg-emerald-500', 'border-emerald-100', 'text-white');
        badge.classList.add('bg-emerald-100', 'text-emerald-700');
        badge.innerHTML = 'Completado <i class="fa-solid fa-check ml-0.5"></i>';
        tooltipTitle = `Completado: ${dateText}`;
    } else if (state === 'active') {
        iconBox.classList.add('bg-institutional-primary', 'border-institutional-pale', 'text-white', 'ring-4', 'ring-institutional-light/20', 'animate-pulse');
        badge.classList.add('bg-institutional-pale', 'text-institutional-primary');
        badge.textContent = 'En Proceso';
        tooltipTitle = `En Proceso: ${dateText}`;
    } else if (state === 'failed') {
        iconBox.classList.add('bg-red-500', 'border-red-100', 'text-white');
        badge.classList.add('bg-red-100', 'text-red-700');
        badge.innerHTML = 'Incumplido <i class="fa-solid fa-xmark ml-0.5"></i>';
        tooltipTitle = `Incumplido: ${dateText}`;
    }

    node.setAttribute('title', tooltipTitle);
}

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

// ------ FUNCIÓN EXPORTAR PDF (Motor pdfmake - Vectorial Institucional) ------

async function getBase64ImageFromURL(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            canvas.getContext('2d').drawImage(img, 0, 0);
            // Use image/png for transparent assets (like our logo) to avoid black backgrounds
            const format = (url.includes('.png') || url.endsWith('.png')) ? 'image/png' : 'image/jpeg';
            resolve(canvas.toDataURL(format, format === 'image/jpeg' ? 0.85 : undefined));
        };
        img.onerror = () => reject(new Error('Image load error: ' + url));
        img.src = url;
    });
}

// Resizes gallery photos to fit within a bounding box of maxDim (default 600px), preserving original aspect ratio, compressed to JPEG at 75% quality
async function getOptimizedBase64Image(url, maxDim = 600) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            let width = img.width;
            let height = img.height;
            if (width > maxDim || height > maxDim) {
                if (width > height) {
                    height = Math.round((height * maxDim) / width);
                    width = maxDim;
                } else {
                    width = Math.round((width * maxDim) / height);
                    height = maxDim;
                }
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.75));
        };
        img.onerror = () => reject(new Error('Image load error: ' + url));
        img.src = url;
    });
}

async function getBase64FromHtmlElement(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return null;

    const mapPane = el.querySelector('.leaflet-map-pane');
    let oldTransform = '';
    let oldLeft = '';
    let oldTop = '';

    if (mapPane) {
        oldTransform = mapPane.style.transform;
        const match = oldTransform.match(/translate3d\(([-0-9.]+)px,\s*([-0-9.]+)px/);
        if (match) {
            mapPane.style.transform = '';
            oldLeft = mapPane.style.left;
            oldTop = mapPane.style.top;
            mapPane.style.left = match[1] + 'px';
            mapPane.style.top = match[2] + 'px';
        }
    }

    try {
        const canvas = await html2canvas(el, { useCORS: true, allowTaint: true, scale: 2, logging: false });

        if (mapPane && oldTransform) {
            mapPane.style.transform = oldTransform;
            mapPane.style.left = oldLeft;
            mapPane.style.top = oldTop;
        }

        return canvas.toDataURL('image/jpeg', 0.85);
    } catch (e) {
        console.warn('Error capturing map:', e);
        if (mapPane && oldTransform) {
            mapPane.style.transform = oldTransform;
            mapPane.style.left = oldLeft;
            mapPane.style.top = oldTop;
        }
        return null;
    }
}

// Helper: resolves subregion based on municipality name
function getSubregion(municipalityName) {
    if (!municipalityName) return 'N/A';
    const norm = (s) => String(s)
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Z ]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    const target = norm(municipalityName);
    for (const [sub, munis] of Object.entries(antioquiaSubregiones)) {
        if (munis.map(m => norm(m)).includes(target)) {
            return sub;
        }
    }
    return 'N/A';
}

async function loadMapData(num) {
    if (!num) return null;
    const cleanNum = String(num).trim();

    // 1. Intentar GeoJSON
    try {
        const geoResp = await fetch(`./assets/mapas/${cleanNum}.geojson`);
        if (geoResp.ok) {
            const data = await geoResp.json();
            return { type: 'geojson', data };
        }
    } catch (e) { }

    // 2. Intentar KML
    try {
        const kmlResp = await fetch(`./assets/mapas/${cleanNum}.kml`);
        if (kmlResp.ok) {
            const data = await kmlResp.text();
            return { type: 'kml', data };
        }
    } catch (e) { }

    // 3. Intentar KMZ (descomprimir en memoria usando JSZip)
    if (typeof JSZip !== 'undefined') {
        try {
            const kmzResp = await fetch(`./assets/mapas/${cleanNum}.kmz`);
            if (kmzResp.ok) {
                const blob = await kmzResp.blob();
                const zip = await JSZip.loadAsync(blob);
                const kmlFileName = Object.keys(zip.files).find(name =>
                    name.toLowerCase().endsWith('.kml') && !name.startsWith('__MACOSX') && !zip.files[name].dir
                );
                if (kmlFileName) {
                    const data = await zip.files[kmlFileName].async('string');
                    return { type: 'kml', data };
                }
            }
        } catch (e) {
            console.warn('Error leyendo KMZ:', e);
        }
    }
    return null;
}

// Generates an off-screen map of the department of Antioquia highlighting the project's municipality
// Generates an off-screen map of the department of Antioquia highlighting the project's municipality
async function generateAntioquiaMapBase64(municipalityName, row) {
    const mapDiv = document.createElement('div');
    mapDiv.id = 'temp-antioquia-map';
    mapDiv.style.width = '500px';
    mapDiv.style.height = '400px';
    mapDiv.style.position = 'absolute';
    mapDiv.style.left = '-9999px';
    mapDiv.style.top = '-9999px';
    document.body.appendChild(mapDiv);

    const tempMap = L.map(mapDiv, {
        zoomControl: false,
        attributionControl: false,
        fadeAnimation: false,
        zoomAnimation: false,
        inertia: false
    });
    tempMap.invalidateSize();

    // CartoDB Positron - very clean grayscale background map
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
        crossOrigin: true
    }).addTo(tempMap);

    let mpioData = mlMpioData;
    if (!mpioData) {
        try {
            const resp = await fetch('./mpio.json');
            if (resp.ok) {
                mpioData = await resp.json();
                mpioData.features = mpioData.features.filter(f => {
                    const dpto = String(f.properties.DPTO || '').trim();
                    const nomDpt = String(f.properties.NOMBRE_DPT || f.properties.NOM_DEPART || '').trim().toUpperCase();
                    return dpto === '05' || dpto === '5' || nomDpt.includes('ANTIOQUIA');
                });
                mlMpioData = mpioData;
            }
        } catch (e) {
            console.error("Error loading mpio for PDF:", e);
        }
    }

    const normMuniName = (s) => String(s)
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Z ]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    const targetNorm = normMuniName(municipalityName);
    let allLayer = null;
    let targetLayer = null;

    if (mpioData) {
        allLayer = L.geoJSON(mpioData, {
            style: (feature) => {
                let mName = feature.properties.NOMBRE_MPI || feature.properties.MPIO_CNMBR || feature.properties.NOM_MPIO || '';
                mName = String(mName)
                    .replace(/\uFFFD/g, 'Ñ')
                    .replace(/\?/g, 'Ñ')
                    .replace(/¥/g, 'Ñ')
                    .replace(/\u00A5/g, 'Ñ');

                const isTarget = normMuniName(mName) === targetNorm;
                if (isTarget) {
                    return {
                        fillColor: '#0B5640', // Institutional teal primary
                        fillOpacity: 0.7,
                        color: '#0B5640',
                        weight: 2
                    };
                }
                return {
                    fillColor: '#f1f5f9',
                    fillOpacity: 0.4,
                    color: '#cbd5e1',
                    weight: 0.5
                };
            },
            onEachFeature: (feature, layer) => {
                let mName = feature.properties.NOMBRE_MPI || feature.properties.MPIO_CNMBR || feature.properties.NOM_MPIO || '';
                mName = String(mName)
                    .replace(/\uFFFD/g, 'Ñ')
                    .replace(/\?/g, 'Ñ')
                    .replace(/¥/g, 'Ñ')
                    .replace(/\u00A5/g, 'Ñ');
                if (normMuniName(mName) === targetNorm) {
                    targetLayer = layer;
                }
            }
        }).addTo(tempMap);

        // Show the entire department of Antioquia, centered, with target municipality and tramos highlighted in context
        tempMap.fitBounds(allLayer.getBounds(), { padding: [10, 10] });
    } else {
        tempMap.setView([7.15, -75.55], 8);
    }

    const num = String(row['CONVENIO']).trim();
    let traceLayer = null;
    try {
        const mapData = await loadMapData(num);
        if (mapData) {
            const customLayer = L.geoJSON(null, {
                style: { color: '#A90F09', weight: 4, opacity: 0.9 },
                pointToLayer: (f, ll) => L.circleMarker(ll, { radius: 4, fillColor: "#A90F09", color: "#fff", weight: 1.5, fillOpacity: 0.9 })
            });
            if (mapData.type === 'geojson') {
                customLayer.addData(mapData.data).addTo(tempMap);
                traceLayer = customLayer;
            } else if (mapData.type === 'kml') {
                if (typeof omnivore !== 'undefined' && omnivore.kml && omnivore.kml.parse) {
                    omnivore.kml.parse(mapData.data, null, customLayer);
                } else if (typeof parseKMLStringToGeoJSON === 'function') {
                    const feats = parseKMLStringToGeoJSON(mapData.data, num);
                    customLayer.addData({ type: 'FeatureCollection', features: feats });
                }
                customLayer.addTo(tempMap);
                traceLayer = customLayer;
            }
        }
    } catch (e) { }

    if (!traceLayer) {
        const la = parseFloat(row['LATITUD']), lo = parseFloat(row['LONGITUD']);
        if (!isNaN(la) && !isNaN(lo) && la !== 0) {
            L.marker([la, lo]).addTo(tempMap);
        }
    }

    await new Promise(resolve => setTimeout(resolve, 800));

    const mapPane = mapDiv.querySelector('.leaflet-map-pane');
    let oldTransform = '';
    let oldLeft = '';
    let oldTop = '';

    if (mapPane) {
        oldTransform = mapPane.style.transform;
        const match = oldTransform.match(/translate3d\(([-0-9.]+)px,\s*([-0-9.]+)px/);
        if (match) {
            mapPane.style.transform = '';
            oldLeft = mapPane.style.left;
            oldTop = mapPane.style.top;
            mapPane.style.left = match[1] + 'px';
            mapPane.style.top = match[2] + 'px';
        }
    }

    let mapBase64 = null;
    try {
        const canvas = await html2canvas(mapDiv, {
            useCORS: true,
            allowTaint: true,
            scale: 2,
            logging: false
        });
        mapBase64 = canvas.toDataURL('image/jpeg', 0.85);
    } catch (e) {
        console.error("Error capturing Antioquia map:", e);
    }

    if (mapPane && oldTransform) {
        mapPane.style.transform = oldTransform;
        mapPane.style.left = oldLeft;
        mapPane.style.top = oldTop;
    }

    tempMap.remove();
    mapDiv.remove();

    return mapBase64;
}

// Helper: creates a styled institutional section header with a vertical colored accent bar
function createSectionHeader(title, pageBreak = null) {
    const headerObj = {
        columns: [
            {
                canvas: [{ type: 'rect', x: 0, y: 0, w: 4, h: 14, r: 2, color: '#018D38' }],
                width: 'auto',
                margin: [0, 2, 6, 0]
            },
            {
                text: title.toUpperCase(),
                fontSize: 11,
                bold: true,
                color: '#0B5640',
                width: '*'
            }
        ],
        margin: [0, 10, 0, 8]
    };
    if (pageBreak) {
        headerObj.pageBreak = pageBreak;
    }
    return headerObj;
}

async function generateProfessionalPDF(row) {
    const btnPdf = document.getElementById('btn-export-pdf');
    const originalText = btnPdf.innerHTML;
    btnPdf.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Generando PDF...';
    btnPdf.disabled = true;

    try {
        // Configure Poppins Font & FontAwesome Solid
        pdfMake.fonts = {
            Poppins: {
                normal: 'https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-400-normal.ttf',
                bold: 'https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-700-normal.ttf',
                italics: 'https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-400-italic.ttf',
                bolditalics: 'https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-700-italic.ttf'
            },
            FontAwesome: {
                normal: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.ttf'
            }
        };

        const getVal = (keywords, isDate = false) => {
            const normalize = str => String(str).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/["“”]/g, "");
            const normalizedKeywords = keywords.map(normalize);
            const key = Object.keys(row).find(k => {
                const normK = normalize(k);
                return normalizedKeywords.some(kw => normK.includes(kw));
            });
            let val = key ? row[key] : '';
            if (isDate && typeof parseExcelDate === 'function') {
                val = parseExcelDate(val);
            }
            return val;
        };

        const formatCurrency = (val) => '$ ' + Number(val || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

        // ===== 1. ASYNCHRONOUS CAPTURE OF LOGOS & MAPS =====
        const logoBase64 = await getBase64ImageFromURL('./assets/escudo_antioquia.png').catch(() => null);

        const photoElements = document.querySelectorAll('#mod-galeria img');
        const photosList = [];
        for (const img of photoElements) {
            const base64 = await getOptimizedBase64Image(img.src).catch(() => null);
            if (base64) {
                photosList.push({
                    base64,
                    stage: img.getAttribute('data-stage') || img.getAttribute('data-folder') || 'Evidencia',
                    src: img.src
                });
            }
        }

        const sysState = getSystemState(row['ESTADO CONVENIO']);

        // ===== 2. LAYOUT HELPERS =====
        // Minimal, dynamic card using standard pdfMake tables
        const cleanCard = (content, bgColor = '#FFFFFF', borderColor = '#E2E8F0', padding = 10) => {
            return {
                table: {
                    widths: ['*'],
                    body: [
                        [{
                            stack: Array.isArray(content) ? content : [content],
                            margin: [padding, padding, padding, padding]
                        }]
                    ]
                },
                layout: {
                    hLineWidth: () => borderColor ? 0.5 : 0,
                    vLineWidth: () => borderColor ? 0.5 : 0,
                    hLineColor: () => borderColor || 'transparent',
                    vLineColor: () => borderColor || 'transparent',
                    paddingLeft: () => 0,
                    paddingRight: () => 0,
                    paddingTop: () => 0,
                    paddingBottom: () => 0
                },
                fillColor: bgColor
            };
        };

        const iconLabel = (iconUnicode, labelText, valueText, isDark = false, isHighlighted = false) => {
            return {
                columns: [
                    {
                        text: iconUnicode,
                        font: 'FontAwesome',
                        fontSize: isHighlighted ? 11 : 9,
                        color: isDark ? '#A3E635' : (isHighlighted ? '#07543A' : '#0B7A53'),
                        width: 14,
                        margin: [0, isHighlighted ? 1 : 1.5, 0, 0]
                    },
                    {
                        stack: [
                            {
                                text: String(labelText).toUpperCase(),
                                fontSize: isHighlighted ? 7.5 : 6.5,
                                bold: true,
                                color: isDark ? '#D1D5DB' : (isHighlighted ? '#07543A' : '#64748B'),
                                letterSpacing: 0.5
                            },
                            {
                                text: String(valueText ?? '-'),
                                fontSize: isHighlighted ? 11 : 8,
                                color: isDark ? '#FFFFFF' : (isHighlighted ? '#07543A' : '#1E293B'),
                                bold: true,
                                margin: [0, 1, 0, 0]
                            }
                        ],
                        width: '*'
                    }
                ],
                margin: [0, 0, 0, 8]
            };
        };

        const progressBar = (pct, color, width = 220, height = 5) => {
            const cappedPct = Math.max(0, Math.min(100, pct || 0));
            return {
                canvas: [
                    { type: 'rect', x: 0, y: 0, w: width, h: height, r: height / 2, color: '#E2E8F0' },
                    { type: 'rect', x: 0, y: 0, w: (cappedPct / 100) * width, h: height, r: height / 2, color: color }
                ],
                margin: [0, 4, 0, 4]
            };
        };

        const progressCard = (title, pct, color) => {
            return cleanCard([
                {
                    columns: [
                        { text: title.toUpperCase(), fontSize: 7, bold: true, color: '#475569', width: '*' },
                        { text: `${(pct || 0).toFixed(1)}%`, fontSize: 11, bold: true, color: color, width: 'auto' }
                    ]
                },
                progressBar(pct, color, 215, 5)
            ], '#FFFFFF', '#E2E8F0', 10);
        };

        // ===== 3. COMPILE ALERTS DYNAMICALLY =====
        const alertsList = [];
        const today = new Date();
        const estStr = String(row['ESTADO CONVENIO'] || '').toLowerCase();
        const isLiquidado = estStr.includes('liquidado') || estStr.includes('resciliado');

        if (!isLiquidado) {
            const fisico = row['FISICO_NORM'] || 0;
            const financiero = row['FINANCIERO_NORM'] || 0;
            const desembolsado = row['VALOR TOTAL DESEMBOLSADO'] || 0;
            const suspMeses = row['PRORROGA (MESES)'] || row['SUSPENSION(MESES)'] || 0;
            const tieneFotos = String(row['TIENE_FOTOS'] || 'SI').toUpperCase();

            let termStr = row['NUEVA FECHA DE TERMINACION'] || row['FECHA DE TERMINACION'];
            let termDate = parseCOPDate(termStr);

            if (termDate && termDate >= today) {
                const msLeft = termDate.getTime() - today.getTime();
                const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
                if (daysLeft <= 30) {
                    alertsList.push({ title: 'Próximo a Terminar', desc: `Faltan ${daysLeft} días para la terminación (${termStr}).`, color: '#D97706' });
                }
            }
            if (termDate && termDate < today) {
                const msPassed = today.getTime() - termDate.getTime();
                const monthsPassed = msPassed / (1000 * 60 * 60 * 24 * 30.43);
                if (monthsPassed >= 24) {
                    alertsList.push({ title: 'Riesgo Extremo: Pérdida de Competencia', desc: `Vencido hace ${monthsPassed.toFixed(1)} meses. Límite legal de competencia de 30 meses en riesgo extremo.`, color: '#DC2626' });
                } else {
                    alertsList.push({ title: 'Vencido sin liquidar', desc: `El convenio finalizó el ${termStr} y sigue en estado abierto.`, color: '#DC2626' });
                }
            }
            if (financiero > fisico + 15) {
                alertsList.push({ title: 'Desfase Financiero Crítico', desc: `Avance financiero (${financiero.toFixed(1)}%) supera al físico (${fisico.toFixed(1)}%) por más de 15%.`, color: '#2563EB' });
            }
            if (tieneFotos === 'NO' || photosList.length === 0) {
                alertsList.push({ title: 'Sin Evidencia Fotográfica', desc: `El convenio no registra fotografías cargadas en el sistema.`, color: '#DC2626' });
            }
            if (estStr.includes('suspendido') && suspMeses >= 3) {
                alertsList.push({ title: 'Suspensión Prolongada', desc: `Acumula ${suspMeses} meses de suspensión.`, color: '#D97706' });
            }
            if (estStr.includes('ejecución') && desembolsado === 0) {
                alertsList.push({ title: 'Cero Desembolsos en Ejecución', desc: `Convenio en ejecución pero no hay desembolsos registrados.`, color: '#D97706' });
            }
        }

        // ===== 4. GENERAL INFORMATION VALUES =====
        let labelContratado = 'Alcance Contratado';
        let valContratado = '';
        const rawAlcanceM = getRowLongitudContratada(row);
        const rawAlcanceM2 = getRowAreaContratada(row);
        const hasM = rawAlcanceM && Number(rawAlcanceM) > 0;
        const hasM2 = rawAlcanceM2 && Number(rawAlcanceM2) > 0;
        if (hasM && hasM2) {
            labelContratado = 'Longitud / Área Contratada';
            valContratado = `${Number(rawAlcanceM).toLocaleString('es-CO')} m / ${Number(rawAlcanceM2).toLocaleString('es-CO')} m²`;
        } else if (hasM) {
            labelContratado = 'Longitud Contratada';
            valContratado = `${Number(rawAlcanceM).toLocaleString('es-CO')} m`;
        } else if (hasM2) {
            labelContratado = 'Área Contratada';
            valContratado = `${Number(rawAlcanceM2).toLocaleString('es-CO')} m²`;
        } else {
            labelContratado = 'Longitud / Área Contratada';
            valContratado = 'N/A';
        }

        let labelEjecutado = 'Ejecución Realizada';
        let valEjecutado = '';
        const rawEjecutadoM = getRowLongitudEjecutada(row);
        const rawEjecutadoM2 = getRowAreaEjecutada(row);
        const hasExeM = rawEjecutadoM && Number(rawEjecutadoM) > 0;
        const hasExeM2 = rawEjecutadoM2 && Number(rawEjecutadoM2) > 0;
        if (hasExeM && hasExeM2) {
            labelEjecutado = 'Longitud / Área Ejecutada';
            valEjecutado = `${Number(rawEjecutadoM).toLocaleString('es-CO')} m / ${Number(rawEjecutadoM2).toLocaleString('es-CO')} m²`;
        } else if (hasExeM) {
            labelEjecutado = 'Longitud Ejecutada';
            valEjecutado = `${Number(rawEjecutadoM).toLocaleString('es-CO')} m`;
        } else if (hasExeM2) {
            labelEjecutado = 'Área Ejecutada';
            valEjecutado = `${Number(rawEjecutadoM2).toLocaleString('es-CO')} m²`;
        } else {
            valEjecutado = 'N/A';
        }

        let plazoInicial = 0;
        for (let key in row) {
            if (key.toUpperCase().trim() === 'PLAZO INICIAL' || key.toUpperCase().trim().includes('PLAZO INICIAL')) {
                plazoInicial = parseNum(row[key]);
                break;
            }
        }
        if (!plazoInicial) plazoInicial = parseNum(row['PLAZO INITIAL'] || row['PLAZO INITIAL'] || 0);
        const prorrogas = parseNum(row['PRORROGA (MESES)'] || row['PRÓRROGA (MESES)'] || row['PRRROGA (MESES)'] || 0);
        const suspensiones = parseNum(row['SUSPENSION(MESES)'] || row['SUSPENSIÓN(MESES)'] || row['SUSPENSIN(MESES)'] || 0);
        const plazoTotal = plazoInicial + prorrogas;

        const termOriginalStr = String(row['FECHA DE TERMINACION'] || row['FECHA DE TERMINACIÓN'] || row['FECHA DE TERMINACIN'] || getVal(['FECHA DE TERMINAC'], false) || '-').trim();
        const termNuevaStr = String(row['NUEVA FECHA DE TERMINACION'] || row['NUEVA FECHA DE TERMINACIÓN'] || row['NUEVA FECHA DE TERMINACIN'] || getVal(['NUEVA FECHA DE TERMINAC'], false) || 'Sin cambios').trim();

        // Logo configuration
        const logoElement = logoBase64
            ? { image: logoBase64, width: 45, margin: [0, 2, 0, 0] }
            : {
                table: {
                    widths: [45],
                    body: [[{ text: 'GOB\nANT', fontSize: 10, bold: true, color: '#ffffff', fillColor: '#07543A', alignment: 'center', margin: [0, 8, 0, 8] }]]
                },
                layout: 'noBorders',
                margin: [0, 2, 0, 0]
            };

        const obsText = row['OBSERVACIONES'] || 'Sin observaciones adicionales registradas por el supervisor en el sistema.';
        const viasText = row['VIA_PRIORIZADA'] || 'No especificada';

        // Parse vias into an array
        const parseVias = (text) => {
            if (!text || text === 'No especificada') return [];
            return text.split(/[\n,;\u2022]+/g)
                .map(s => s.trim())
                .filter(s => s.length > 0);
        };
        const viasArray = parseVias(viasText);

        let viasContent = { text: 'No especificada', fontSize: 8, color: '#334155' };

        if (viasArray.length > 0) {
            const colVias1 = [];
            const colVias2 = [];
            const colVias3 = [];

            viasArray.forEach((v, idx) => {
                const viaBullet = {
                    columns: [
                        { text: '\uf0da', font: 'FontAwesome', fontSize: 6, color: '#0B7A53', width: 8, margin: [0, 1.5, 0, 0] },
                        { text: v, fontSize: 7.5, color: '#334155', lineHeight: 1.1 }
                    ],
                    margin: [0, 0, 0, 3]
                };
                if (idx % 3 === 0) {
                    colVias1.push(viaBullet);
                } else if (idx % 3 === 1) {
                    colVias2.push(viaBullet);
                } else {
                    colVias3.push(viaBullet);
                }
            });

            viasContent = {
                columns: [
                    { stack: colVias1, width: '33%' },
                    { stack: colVias2, width: '33%' },
                    { stack: colVias3, width: '34%' }
                ],
                columnGap: 10
            };
        }

        const objetoText = row['OBJETO'] || 'Sin descripción u objeto definido.';

        let alertsStack = [];
        if (alertsList.length === 0) {
            alertsStack = [
                {
                    columns: [
                        { text: '\uf058', font: 'FontAwesome', fontSize: 10, color: '#0F766E', width: 14 },
                        { text: 'SIN ALERTAS DE RIESGO CONTRACTUAL DETECTADAS', fontSize: 7.5, bold: true, color: '#0F766E', letterSpacing: 0.5 }
                    ],
                    margin: [0, 0, 0, 4]
                },
                { text: 'El convenio no presenta retrasos, vencimientos ni advertencias de control vigentes.', fontSize: 7.5, color: '#334155' }
            ];
        } else {
            alertsStack = [
                {
                    columns: [
                        { text: '\uf071', font: 'FontAwesome', fontSize: 10, color: '#B91C1C', width: 14 },
                        { text: 'ALERTAS DE RIESGO DETECTADAS', fontSize: 7.5, bold: true, color: '#B91C1C', letterSpacing: 0.5 }
                    ],
                    margin: [0, 0, 0, 6]
                }
            ];
            alertsList.forEach((a, idx) => {
                const isLast = idx === alertsList.length - 1;
                alertsStack.push({
                    stack: [
                        { text: a.title.toUpperCase(), fontSize: 7.5, bold: true, color: '#B91C1C' },
                        { text: a.desc, fontSize: 7.5, color: '#475569', margin: [0, 1, 0, 0] }
                    ],
                    margin: [0, 0, 0, isLast ? 0 : 5]
                });
            });
        }

        // ===== 5. TIMELINE GENERATION (PAGE 2) =====
        const timelineSteps = [
            { title: 'Suscripción', date: getVal(['FECHA DE SUSCRIPC'], true) || 'Por registrar', desc: 'Suscripción formal del convenio interadministrativo.' },
            { title: 'Acta de Inicio', date: getVal(['FECHA DE ACTA DE INICIO'], true) || getVal(['ACTA DE INICIO'], true) || 'Pendiente', desc: 'Inicio oficial de la ejecución de las obras.' },
            { title: 'Fecha Acta Terminación', date: getVal(['FECHA DE TERMINAC'], true) || 'Por registrar', desc: 'Fecha contractual de terminación inicial pactada.' },
            { title: 'Prórrogas', date: prorrogas > 0 ? `${prorrogas} Meses` : 'Sin prórrogas', desc: prorrogas > 0 ? `Se registran ${prorrogas} meses de adición de plazo.` : 'No se registran adiciones de plazo en el histórico.' },
            { title: 'Suspensiones', date: suspensiones > 0 ? `${suspensiones} Meses` : 'Sin suspensiones', desc: suspensiones > 0 ? `Se registran ${suspensiones} meses de suspensión de obra.` : 'No se registran suspensiones de obra en el histórico.' },
            { title: 'Nueva Fecha Terminación', date: termNuevaStr !== 'Sin cambios' ? termNuevaStr : termOriginalStr, desc: 'Fecha de terminación vigente con adiciones y plazos.' },
            { title: 'Fecha Acta Liquidación', date: row['FECHA ACTA DE CIERRE DE EXPEDIENTE'] || (isLiquidado ? 'Liquidado' : 'Pendiente'), desc: 'Cierre definitivo y balance final del convenio.' }
        ];

        const timelineContent = [];
        timelineSteps.forEach((s, idx) => {
            const hasDate = s.date && s.date !== 'Pendiente' && s.date !== 'Por registrar' && s.date !== 'Sin cambios' && s.date !== 'Sin suspensiones' && s.date !== 'Sin prórrogas';
            const isLast = idx === timelineSteps.length - 1;

            const nodeColor = hasDate ? '#0B7A53' : '#94A3B8';
            const nodeBg = hasDate ? '#E6F3ED' : '#F1F5F9';

            const canvasItems = [
                { type: 'circle', cx: 15, cy: 15, r: 7, color: nodeBg, lineColor: nodeColor, lineWidth: 1 },
                { type: 'circle', cx: 15, cy: 15, r: 3, color: nodeColor }
            ];

            if (!isLast) {
                canvasItems.unshift({ type: 'line', x1: 15, y1: 15, x2: 15, y2: 45, lineWidth: 1.2, lineColor: '#E2E8F0', dash: { length: 3, space: 3 } });
            }

            timelineContent.push({
                columns: [
                    {
                        width: 30,
                        canvas: canvasItems,
                        height: 38
                    },
                    {
                        width: 110,
                        stack: [
                            { text: s.title.toUpperCase(), fontSize: 7, bold: true, color: '#64748B' },
                            { text: s.date, fontSize: 8.5, bold: true, color: hasDate ? '#07543A' : '#64748B', margin: [0, 1, 0, 0] }
                        ],
                        margin: [0, 6, 0, 0]
                    },
                    {
                        width: '*',
                        stack: [
                            { text: s.desc, fontSize: 7.5, color: '#475569', lineHeight: 1.2 }
                        ],
                        margin: [0, 6, 0, 0]
                    }
                ],
                margin: [0, 0, 0, 2]
            });
        });

        // ===== 6. PHOTO GALLERY GRID GENERATION (PAGE 3) =====
        const photoGalleryContent = [];
        if (photosList.length === 0) {
            photoGalleryContent.push({
                table: {
                    widths: ['*'],
                    body: [[{
                        stack: [
                            { text: '\uf030', font: 'FontAwesome', fontSize: 18, color: '#94A3B8', alignment: 'center', margin: [0, 40, 0, 4] },
                            { text: 'REGISTRO FOTOGRÁFICO DE OBRA', alignment: 'center', fontSize: 10, bold: true, color: '#94A3B8' },
                            { text: 'NO SE DISPONE DE IMÁGENES ASOCIADAS PARA ESTE CONVENIO', alignment: 'center', fontSize: 8, color: '#cbd5e1', margin: [0, 4, 0, 40] }
                        ]
                    }]]
                },
                layout: {
                    hLineWidth: () => 0.5,
                    vLineWidth: () => 0.5,
                    hLineColor: () => '#E2E8F0',
                    vLineColor: () => '#E2E8F0',
                    hLineDash: () => ({ length: 4, space: 4 }),
                    vLineDash: () => ({ length: 4, space: 4 })
                },
                fillColor: '#F8FAFC',
                margin: [0, 15, 0, 10]
            });
        } else {
            const buildPhotoCard = (photoObj, isHorizontal) => {
                const w = isHorizontal ? 252.5 : 165;
                const imgH = isHorizontal ? 150 : 220;

                let stageColor = '#475569';
                if (photoObj.stage === 'Antes') stageColor = '#64748B';
                else if (photoObj.stage === 'Durante') stageColor = '#D97706';
                else if (photoObj.stage === 'Después' || photoObj.stage === 'Despues') stageColor = '#059669';

                return {
                    table: {
                        widths: [w],
                        body: [
                            [
                                {
                                    image: photoObj.base64,
                                    width: w,
                                    height: imgH,
                                    cover: {
                                        width: w,
                                        height: imgH,
                                        valign: 'center',
                                        align: 'center'
                                    }
                                }
                            ],
                            [
                                {
                                    text: photoObj.stage.toUpperCase(),
                                    fontSize: 7,
                                    bold: true,
                                    color: stageColor,
                                    alignment: 'center',
                                    margin: [0, 4, 0, 4],
                                    fillColor: '#F8FAFC'
                                }
                            ]
                        ]
                    },
                    layout: {
                        hLineWidth: (i) => i === 1 ? 0.5 : 0,
                        vLineWidth: () => 0,
                        hLineColor: () => '#E2E8F0',
                        paddingLeft: () => 0,
                        paddingRight: () => 0,
                        paddingTop: () => 0,
                        paddingBottom: () => 0
                    },
                    margin: [0, 4, 0, 8]
                };
            };

            const photoRows = [];
            let photoIndex = 0;
            while (photoIndex < photosList.length) {
                // Row 1: 2 horizontal (landscape) photos
                const horizChunk = photosList.slice(photoIndex, photoIndex + 2);
                if (horizChunk.length > 0) {
                    const columns = horizChunk.map(p => buildPhotoCard(p, true));
                    while (columns.length < 2) {
                        columns.push({ text: '', width: 252.5 });
                    }
                    photoRows.push({
                        columns: columns,
                        columnGap: 10,
                        margin: [0, 0, 0, 10],
                        unbreakable: true
                    });
                    photoIndex += 2;
                }

                // Row 2: 3 vertical (portrait) photos
                const vertChunk = photosList.slice(photoIndex, photoIndex + 3);
                if (vertChunk.length > 0) {
                    const columns = vertChunk.map(p => buildPhotoCard(p, false));
                    while (columns.length < 3) {
                        columns.push({ text: '', width: 165 });
                    }
                    photoRows.push({
                        columns: columns,
                        columnGap: 10,
                        margin: [0, 0, 0, 10],
                        unbreakable: true
                    });
                    photoIndex += 3;
                }
            }
            photoGalleryContent.push(...photoRows);
        }

        // ===== 7. CONSTRUCT CLEAN CARDS FOR PAGE 1 =====
        const progressSection = {
            columns: [
                { stack: [progressCard('Avance Físico Real', row['FISICO_NORM'] || 0, '#1A6B3C')], width: '50%' },
                { stack: [progressCard('Avance Financiero Ejecutado', row['FINANCIERO_NORM'] || 0, '#3B82F6')], width: '50%' }
            ],
            columnGap: 10,
            margin: [0, 0, 0, 10]
        };

        const convenioBanner = cleanCard([
            {
                columns: [
                    { text: 'CONVENIO N°', fontSize: 7.5, bold: true, color: '#1A6B3C', letterSpacing: 0.8, width: 'auto', margin: [0, 4, 8, 0] },
                    { text: row['CONVENIO'] || 'S/N', fontSize: 14, bold: true, color: '#0F172A', width: '*' }
                ],
                margin: [0, 0, 0, 8]
            },
            {
                columns: [
                    {
                        width: '*',
                        stack: [
                            { text: 'OBJETO DEL CONVENIO', fontSize: 6.5, bold: true, color: '#1A6B3C', letterSpacing: 0.5 },
                            { text: objetoText, fontSize: 7.5, color: '#334155', margin: [0, 2, 0, 0], lineHeight: 1.15 }
                        ]
                    },
                    {
                        width: 175,
                        stack: [
                            iconLabel('\uf508', 'Supervisor Responsable', row['SUPERVISOR'] || 'Sin Asignar', false),
                            iconLabel('\uf2b5', 'Conveniante Ejecutor', row['CONVENIANTE EJECUTOR'] || 'N/A', false),
                            iconLabel('\uf073', 'Fecha de Inicio', getVal(['FECHA DE ACTA DE INICIO'], true) || getVal(['ACTA DE INICIO'], true) || 'N/A', false)
                        ],
                        margin: [10, 0, 0, 0]
                    }
                ],
                columnGap: 12
            }
        ], '#F8FAFC', '#E2E8F0', 12);

        const widgetContratado = iconLabel('\uf548', labelContratado, valContratado, false, true);
        widgetContratado.margin = [0, 0, 0, 0];
        const cardContratado = cleanCard([widgetContratado], '#F0FDF4', '#BBF7D0', 8);

        const widgetEjecutado = iconLabel('\uf548', labelEjecutado, valEjecutado, false, true);
        widgetEjecutado.margin = [0, 0, 0, 0];
        const cardEjecutado = cleanCard([widgetEjecutado], '#F0FDF4', '#BBF7D0', 8);

        const infoGeneralCard = cleanCard([
            { text: 'INFORMACIÓN GENERAL', fontSize: 8, bold: true, color: '#1A6B3C', letterSpacing: 0.5, margin: [0, 0, 0, 10] },
            {
                columns: [
                    {
                        width: '*',
                        stack: [
                            iconLabel('\uf073', 'Vigencia', row['VIGENCIA']),
                            iconLabel('\uf02c', 'Clasificación', row['CLASIFICACIÓN'] || row['CLASIFICACI"N'])
                        ]
                    },
                    {
                        width: '*',
                        stack: [
                            iconLabel('\uf3c5', 'Municipio', row['MUNICIPIO']),
                            iconLabel('\uf279', 'Subregión', getSubregion(row['MUNICIPIO']))
                        ]
                    },
                    {
                        width: '*',
                        stack: [
                            iconLabel('\uf201', 'Indicador', row['INDICADOR'] ? (row['INDICADOR'].length > 40 ? row['INDICADOR'].substring(0, 40) + '...' : row['INDICADOR']) : 'N/A'),
                            iconLabel('\uf05a', 'Estado Actual', sysState.label)
                        ]
                    }
                ],
                columnGap: 12,
                margin: [0, 0, 0, 10]
            },
            {
                columns: [
                    {
                        width: '*',
                        stack: [cardContratado]
                    },
                    {
                        width: '*',
                        stack: [cardEjecutado]
                    }
                ],
                columnGap: 10
            }
        ], '#FFFFFF', '#E2E8F0', 12);

        const viasCard = cleanCard([
            {
                columns: [
                    { text: '\uf018', font: 'FontAwesome', fontSize: 9, color: '#1A6B3C', width: 14, margin: [0, 1.5, 0, 0] },
                    { text: 'VÍAS PRIORIZADAS', fontSize: 7.5, bold: true, color: '#1A6B3C', letterSpacing: 0.5 }
                ],
                margin: [0, 0, 0, 6]
            },
            viasContent
        ], '#FFFFFF', '#E2E8F0', 12);

        const obsCard = cleanCard([
            {
                columns: [
                    { text: '\uf075', font: 'FontAwesome', fontSize: 9, color: '#1A6B3C', width: 14, margin: [0, 1.5, 0, 0] },
                    { text: 'OBSERVACIONES TÉCNICAS DE SUPERVISIÓN', fontSize: 7.5, bold: true, color: '#1A6B3C', letterSpacing: 0.5 }
                ],
                margin: [0, 0, 0, 6]
            },
            { text: obsText, fontSize: 7.5, color: '#334155', alignment: 'justify', lineHeight: 1.3 }
        ], '#FFFFFF', '#E2E8F0', 12);

        const alertsCard = cleanCard(
            alertsStack,
            alertsList.length === 0 ? '#F0FDF4' : '#FEF2F2',
            alertsList.length === 0 ? '#BBF7D0' : '#FCA5A5',
            12
        );

        const muniStrPdf = String(row['MUNICIPIO'] || 'N/A').trim().toUpperCase();
        const ejecStrPdf = String(row['CONVENIANTE EJECUTOR'] || '').trim().toUpperCase();
        const isEjecutorDiferentePdf = (ejecStrPdf && ejecStrPdf !== muniStrPdf && ejecStrPdf !== 'N/A');
        const labelAporteMunPdf = isEjecutorDiferentePdf
            ? `APORTE CONVENIANTE EJECUTOR (${String(row['CONVENIANTE EJECUTOR']).toUpperCase()})`
            : 'APORTE MUNICIPIO';

        const adicDeptoPdf = parseFloat(row['ADICION DEPARTAMENTO']) || 0;
        const adicMunPdf = parseFloat(row['ADICION MUNICIPIO']) || 0;
        const aporteDeptoPdf = parseFloat(row['APORTE DEPARTAMENTO']) || 0;
        const totalDeptoCompromisoPdf = aporteDeptoPdf + adicDeptoPdf;
        const valAutorizadoPdf = parseFloat(row['VALOR TOTAL AUTORIZADO DEPARTAMENTO'] || row['VALOR TOTAL AUTORIZADO']) || 0;
        const pctAutorizadoPdf = totalDeptoCompromisoPdf > 0
            ? (valAutorizadoPdf / totalDeptoCompromisoPdf) * 100
            : (row['FINANCIERO_NORM'] || 0);
        const pctFormattedPdf = Number(pctAutorizadoPdf.toFixed(1));

        const inversionTableBody = [
            [
                { text: 'INVERSIÓN TOTAL', fontSize: 9, bold: true, color: '#1A6B3C', margin: [5, 5, 5, 5] },
                { text: formatCurrency((row['APORTE DEPARTAMENTO'] || 0) + (row['APORTE MUNICIPIO'] || 0) + (row['ADICION DEPARTAMENTO'] || 0) + (row['ADICION MUNICIPIO'] || 0)), fontSize: 9.5, bold: true, color: '#1A6B3C', alignment: 'right', margin: [5, 5, 5, 5] }
            ],
            [
                { text: 'APORTE DEPARTAMENTO', fontSize: 8.5, bold: true, color: '#1A6B3C', fillColor: '#F0FDF4', margin: [5, 5, 5, 5] },
                { text: formatCurrency(row['APORTE DEPARTAMENTO']), fontSize: 8.5, bold: true, color: '#1A6B3C', fillColor: '#F0FDF4', alignment: 'right', margin: [5, 5, 5, 5] }
            ],
            [
                { text: labelAporteMunPdf, fontSize: 8, bold: false, color: '#475569', margin: [5, 5, 5, 5] },
                { text: formatCurrency(row['APORTE MUNICIPIO']), fontSize: 8, bold: true, color: '#334155', alignment: 'right', margin: [5, 5, 5, 5] }
            ]
        ];

        if (adicDeptoPdf > 0) {
            inversionTableBody.push([
                { text: 'ADICIÓN DEPARTAMENTO', fontSize: 8, bold: false, color: '#475569', margin: [5, 5, 5, 5] },
                { text: formatCurrency(row['ADICION DEPARTAMENTO']), fontSize: 8, bold: true, color: '#334155', alignment: 'right', margin: [5, 5, 5, 5] }
            ]);
        }

        if (adicMunPdf > 0) {
            inversionTableBody.push([
                { text: 'ADICIÓN MUNICIPIO', fontSize: 8, bold: false, color: '#475569', margin: [5, 5, 5, 5] },
                { text: formatCurrency(row['ADICION MUNICIPIO']), fontSize: 8, bold: true, color: '#334155', alignment: 'right', margin: [5, 5, 5, 5] }
            ]);
        }

        const valDesembolsadoPdf = parseFloat(row['VALOR TOTAL DESEMBOLSADO']) || 0;
        const saldoIdeaPdf = Math.max(0, valDesembolsadoPdf - valAutorizadoPdf);
        const pctSaldoPdf = totalDeptoCompromisoPdf > 0
            ? (saldoIdeaPdf / totalDeptoCompromisoPdf) * 100
            : 0;
        const pctSaldoFormattedPdf = Number(pctSaldoPdf.toFixed(1));

        inversionTableBody.push([
            { text: 'VALOR DESEMBOLSADO EN EL IDEA', fontSize: 8, bold: false, color: '#475569', margin: [5, 5, 5, 5] },
            { text: formatCurrency(valDesembolsadoPdf), fontSize: 8, bold: true, color: '#334155', alignment: 'right', margin: [5, 5, 5, 5] }
        ]);

        inversionTableBody.push([
            { text: `VALOR AUTORIZADO POR EL DEPARTAMENTO (${pctFormattedPdf}%)`, fontSize: 8.5, bold: true, color: '#3B82F6', fillColor: '#EFF6FF', margin: [5, 5, 5, 5] },
            { text: formatCurrency(valAutorizadoPdf), fontSize: 8.5, bold: true, color: '#3B82F6', fillColor: '#EFF6FF', alignment: 'right', margin: [5, 5, 5, 5] }
        ]);

        inversionTableBody.push([
            { text: `SALDO EN EL IDEA (${pctSaldoFormattedPdf}%)`, fontSize: 8.5, bold: true, color: '#0F766E', fillColor: '#F0FDF4', margin: [5, 5, 5, 5] },
            { text: formatCurrency(saldoIdeaPdf), fontSize: 8.5, bold: true, color: '#0F766E', fillColor: '#F0FDF4', alignment: 'right', margin: [5, 5, 5, 5] }
        ]);

        const inversionCard = cleanCard([
            {
                table: {
                    widths: ['*', 150],
                    body: inversionTableBody
                },
                layout: {
                    hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 0 : 0.5,
                    vLineWidth: () => 0,
                    hLineColor: () => '#E2E8F0'
                }
            }
        ], '#FFFFFF', '#E2E8F0', 8);

        const plazoInicialCard = cleanCard([
            iconLabel('\uf073', 'Plazo Inicial', `${plazoInicial} Meses`)
        ], '#F8FAFC', '#E2E8F0', 8);

        const plazoTotalCard = cleanCard([
            iconLabel('\uf073', 'Plazo Total Vigente', `${plazoTotal} Meses`)
        ], '#F0FDF4', '#BBF7D0', 8);

        const docDefinition = {
            pageSize: 'A4',
            pageOrientation: 'portrait',
            pageMargins: [40, 50, 40, 50],
            defaultStyle: { font: 'Poppins', fontSize: 10, color: '#1E293B' },
            header: (currentPage, pageCount) => {
                if (currentPage === 1) return null;
                return {
                    margin: [40, 18, 40, 0],
                    columns: [
                        { text: `Secretaría de Infraestructura Física · Convenio ${row['CONVENIO']}`, fontSize: 7, color: '#94A3B8', font: 'Poppins' }
                    ]
                };
            },
            footer: (currentPage, pageCount) => ({
                margin: [40, 10, 40, 0],
                columns: [
                    { text: 'Por Antioquia Firme 2024–2027', fontSize: 7, color: '#4B5563', font: 'Poppins', bold: true },
                    { text: `Página ${currentPage} de ${pageCount}`, alignment: 'right', fontSize: 7, color: '#4B5563', font: 'Poppins', bold: true }
                ]
            }),
            content: [
                {
                    columns: [
                        logoBase64 ? {
                            image: logoBase64,
                            width: 32,
                            alignment: 'left'
                        } : { text: '' },
                        {
                            stack: [
                                { text: 'GOBERNACIÓN DE ANTIOQUIA', fontSize: 10, bold: true, color: '#1A6B3C', letterSpacing: 0.5 },
                                { text: 'SECRETARÍA DE INFRAESTRUCTURA FÍSICA', fontSize: 7.5, bold: true, color: '#64748B' },
                                { text: 'Dirección de Infraestructura y Apoyo Territorial (DIAT)', fontSize: 7, color: '#94A3B8' }
                            ],
                            margin: [8, 0, 0, 0],
                            width: '*'
                        },
                        {
                            stack: [
                                { text: 'FICHA TÉCNICA DE CONVENIO', fontSize: 9, bold: true, color: '#1A6B3C', alignment: 'right' },
                                {
                                    text: [
                                        { text: 'ESTADO: ', color: '#64748B' },
                                        { text: sysState.label.toUpperCase(), color: sysState.hex }
                                    ],
                                    fontSize: 7.5,
                                    bold: true,
                                    alignment: 'right'
                                },
                                { text: `Generado: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`, fontSize: 7, color: '#94A3B8', alignment: 'right' }
                            ],
                            width: 'auto'
                        }
                    ],
                    margin: [0, 0, 0, 8]
                },
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1.5, lineColor: '#1A6B3C' }], margin: [0, 5, 0, 12] },
                progressSection,
                convenioBanner,
                { text: '', margin: [0, 0, 0, 10] },
                infoGeneralCard,
                { text: '', margin: [0, 0, 0, 10] },
                viasCard,
                { text: '', margin: [0, 0, 0, 10] },
                obsCard,
                { text: '', margin: [0, 0, 0, 10] },
                alertsCard,

                // Page 2
                {
                    pageBreak: 'before',
                    columns: [
                        { text: 'RESUMEN EJECUTIVO DE INVERSIÓN', fontSize: 12, bold: true, color: '#1A6B3C', width: '*' },
                        { text: `CONVENIO N° ${row['CONVENIO']}`, fontSize: 9, bold: true, color: '#4B5563', alignment: 'right', width: 'auto', margin: [0, 2, 0, 0] }
                    ],
                    margin: [0, 0, 0, 6]
                },
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1.5, lineColor: '#1A6B3C' }], margin: [0, 0, 0, 12] },
                inversionCard,

                {
                    columns: [
                        { text: 'LÍNEA DE TIEMPO Y EVENTOS CONTRACTUALES', fontSize: 12, bold: true, color: '#1A6B3C', width: '*' },
                        { text: `CONVENIO N° ${row['CONVENIO']}`, fontSize: 9, bold: true, color: '#4B5563', alignment: 'right', width: 'auto', margin: [0, 2, 0, 0] }
                    ],
                    margin: [0, 15, 0, 6]
                },
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1.5, lineColor: '#1A6B3C' }], margin: [0, 0, 0, 12] },
                {
                    stack: timelineContent,
                    margin: [0, 0, 0, 15]
                },
                {
                    columns: [
                        {
                            stack: [
                                plazoInicialCard
                            ],
                            width: '50%'
                        },
                        {
                            stack: [
                                plazoTotalCard
                            ],
                            width: '50%'
                        }
                    ],
                    columnGap: 10,
                    margin: [0, 0, 0, 0]
                },

                // Page 3
                {
                    pageBreak: 'before',
                    columns: [
                        { text: 'REGISTRO FOTOGRÁFICO DE OBRA', fontSize: 12, bold: true, color: '#1A6B3C', width: '*' },
                        { text: `CONVENIO N° ${row['CONVENIO']}`, fontSize: 9, bold: true, color: '#4B5563', alignment: 'right', width: 'auto', margin: [0, 2, 0, 0] }
                    ],
                    margin: [0, 0, 0, 6]
                },
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1.5, lineColor: '#1A6B3C' }], margin: [0, 0, 0, 12] },
                {
                    stack: photoGalleryContent
                }
            ],
            styles: {}
        };

        // ===== 8. GENERATE AND DOWNLOAD PDF =====
        pdfMake.createPdf(docDefinition).download(`Ficha_Tecnica_Convenio_${row['CONVENIO']}.pdf`);

        btnPdf.innerHTML = originalText;
        btnPdf.disabled = false;

        const toast = document.getElementById('toast-notification');
        if (toast) {
            toast.classList.remove('opacity-0', 'translate-y-20');
            setTimeout(() => toast.classList.add('opacity-0', 'translate-y-20'), 3500);
        }

    } catch (err) {
        console.error('Error generando PDF:', err);
        alert('Ocurrió un error al generar el PDF. Revisa la consola para más detalles.');
        btnPdf.innerHTML = originalText;
        btnPdf.disabled = false;
    }
}

function calculateProyeccionAnualPct(indicadorFilter) {
    const years = ["2024", "2025", "2026", "2027"];
    const acumCantByYear = { "2024": 0, "2025": 0, "2026": 0, "2027": 0 };

    rawData.forEach(row => {
        const ind = normalizarIndicador(row['INDICADOR']);
        if (!ind || !indicadoresEstrategicos[ind]) return;

        const cfg = indicadoresEstrategicos[ind];
        let cant = 0;

        if (cfg.tipo === 'km') {
            const metros = planMetric === 'contratado' ? getRowLongitudContratadaPlan(row) : getRowLongitudEjecutadaPlan(row);
            cant = metros / 1000;
        } else if (cfg.tipo === 'm2') {
            cant = planMetric === 'contratado' ? getRowAreaContratadaPlan(row) : getRowAreaEjecutadaPlan(row);
        } else {
            if (planMetric === 'contratado') {
                cant = isCuatrenioAnterior(row) ? 0 : 1;
            } else {
                const estado = String(row['ESTADO CONVENIO'] || '').toUpperCase();
                const tieneEjecucion = estado.includes('EJECUCI') || estado.includes('EJECUT') ||
                    estado.includes('OPERA') || estado.includes('MEJORAD') ||
                    getRowLongitudEjecutadaPlan(row) > 0 ||
                    getRowAreaEjecutadaPlan(row) > 0 ||
                    parseNum(row['FISICO_NORM']) > 0;
                cant = tieneEjecucion ? 1 : 0;
            }
        }

        const compYear = getRowCompletionYear(row);
        if (compYear && acumCantByYear[compYear] !== undefined) {
            if (indicadorFilter === 'todos-km') {
                if (cfg.tipo === 'km') acumCantByYear[compYear] += cant;
            } else if (indicadorFilter === 'todos-m2') {
                if (cfg.tipo === 'm2') acumCantByYear[compYear] += cant;
            } else if (indicadorFilter === 'todos') {
                acumCantByYear[compYear] += cant;
            } else {
                if (ind === indicadorFilter) acumCantByYear[compYear] += cant;
            }
        }
    });

    let targetTotal = 0;
    Object.keys(indicadoresEstrategicos).forEach(ind => {
        const cfg = indicadoresEstrategicos[ind];
        if (indicadorFilter === 'todos-km' && cfg.tipo !== 'km') return;
        if (indicadorFilter === 'todos-m2' && cfg.tipo !== 'm2') return;
        if (indicadorFilter !== 'todos' && indicadorFilter !== 'todos-km' && indicadorFilter !== 'todos-m2' && ind !== indicadorFilter) return;

        targetTotal += cfg.metas.todos || 0;
    });

    const acumValues = [];
    let runSum = 0;
    years.forEach(y => {
        runSum += acumCantByYear[y] || 0;
        acumValues.push(runSum);
    });

    if (acumValues[3] === acumValues[2] || acumValues[3] === 0) {
        const inc1 = acumValues[0];
        const inc2 = acumValues[1] - acumValues[0];
        const inc3 = acumValues[2] - acumValues[1];
        const avgInc = (inc1 + Math.max(0, inc2) + Math.max(0, inc3)) / 3;
        acumValues[3] = parseFloat((acumValues[2] + Math.max(avgInc, (targetTotal > 0 ? (targetTotal - acumValues[2]) * 0.5 : 1))).toFixed(2));
    }

    const pctValues = acumValues.map(val => {
        if (targetTotal > 0) {
            return parseFloat(Math.min(100, (val / targetTotal) * 100).toFixed(1));
        } else {
            return 0;
        }
    });

    return { years, pctValues, acumValues, targetTotal };
}

function buildVectorChartMetasSVG(indicatorsList) {
    const width = 250;
    const barHeight = 13;
    const gap = 7;
    const marginTop = 12;
    const marginLeft = 90;
    const marginRight = 35;
    const chartWidth = width - marginLeft - marginRight;
    const height = marginTop + indicatorsList.length * (barHeight + gap) + 15;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
    svg += `<rect width="${width}" height="${height}" fill="#F8FAFC" rx="6" ry="6"/>`;

    [0, 25, 50, 75, 100].forEach(p => {
        const x = marginLeft + (p / 100) * chartWidth;
        svg += `<line x1="${x}" y1="${marginTop - 2}" x2="${x}" y2="${height - 14}" stroke="#E2E8F0" stroke-dasharray="2 2" stroke-width="1"/>`;
        svg += `<text x="${x}" y="${height - 4}" font-family="Poppins, sans-serif" font-size="6" fill="#94A3B8" text-anchor="middle">${p}%</text>`;
    });

    indicatorsList.forEach((item, idx) => {
        const y = marginTop + idx * (barHeight + gap);
        let displayName = item.name;
        if (displayName.includes("AEROPUERTOS")) displayName = "Aeropuertos";
        else if (displayName.includes("MUELLES")) displayName = "Muelles";
        else if (displayName.includes("EQUIPAMIENTOS")) displayName = "Equipamientos";
        else if (displayName.includes("TERCIARIAS")) displayName = "Vías Terciarias";
        else if (displayName.includes("ESPACIO")) displayName = "Espacio Público";
        else if (displayName.includes("CABLES")) displayName = "Cables Aéreos";
        else if (displayName.includes("URBANA")) displayName = "Vía Urbana";

        let color = '#EF4444';
        if (item.isNP) color = '#94A3B8';
        else if (item.pct >= 80) color = '#10B981';
        else if (item.pct >= 50) color = '#F59E0B';

        const bw = item.isNP ? 0 : Math.min(chartWidth, (item.pct / 100) * chartWidth);
        const labelTxt = item.isNP ? 'NP' : `${item.pct.toFixed(1)}%`;

        svg += `<text x="${marginLeft - 5}" y="${y + 9}" font-family="Poppins, sans-serif" font-size="6" font-weight="bold" fill="#334155" text-anchor="end">${displayName}</text>`;
        svg += `<rect x="${marginLeft}" y="${y}" width="${chartWidth}" height="${barHeight}" fill="#E2E8F0" rx="3" ry="3"/>`;
        if (bw > 0) {
            svg += `<rect x="${marginLeft}" y="${y}" width="${bw}" height="${barHeight}" fill="${color}" rx="3" ry="3"/>`;
        }
        svg += `<text x="${marginLeft + Math.max(bw + 4, 3)}" y="${y + 9}" font-family="Poppins, sans-serif" font-size="6" font-weight="bold" fill="${color}">${labelTxt}</text>`;
    });

    svg += `</svg>`;
    return svg;
}

function buildVectorChartProyeccionSVG(years, pctValues, chartTitle = "") {
    const width = 250;
    const height = chartTitle ? 138 : 128;
    const marginTop = chartTitle ? 22 : 15;
    const marginBottom = 22;
    const marginLeft = 28;
    const marginRight = 18;
    const chartW = width - marginLeft - marginRight;
    const chartH = height - marginTop - marginBottom;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
    svg += `<rect width="${width}" height="${height}" fill="#F8FAFC" rx="6" ry="6"/>`;

    if (chartTitle) {
        svg += `<text x="${width / 2}" y="13" font-family="Poppins, sans-serif" font-size="6.5" font-weight="bold" fill="#0F172A" text-anchor="middle">${chartTitle}</text>`;
    }

    [0, 25, 50, 75, 100].forEach(p => {
        const y = marginTop + chartH - (p / 100) * chartH;
        svg += `<line x1="${marginLeft}" y1="${y}" x2="${width - marginRight}" y2="${y}" stroke="#E2E8F0" stroke-dasharray="2 2" stroke-width="1"/>`;
        svg += `<text x="${marginLeft - 3}" y="${y + 2}" font-family="Poppins, sans-serif" font-size="5.5" fill="#94A3B8" text-anchor="end">${p}%</text>`;
    });

    const points = pctValues.map((v, i) => {
        const x = marginLeft + (i / (pctValues.length - 1)) * chartW;
        const y = marginTop + chartH - (Math.min(100, v) / 100) * chartH;
        return { x, y, v, year: years[i] };
    });

    let areaPath = `M ${points[0].x} ${marginTop + chartH}`;
    points.forEach(p => { areaPath += ` L ${p.x} ${p.y}`; });
    areaPath += ` L ${points[points.length - 1].x} ${marginTop + chartH} Z`;
    svg += `<path d="${areaPath}" fill="#1A6B3C" fill-opacity="0.12"/>`;

    let linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        linePath += ` L ${points[i].x} ${points[i].y}`;
    }
    svg += `<path d="${linePath}" stroke="#1A6B3C" stroke-width="2" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;

    points.forEach((p) => {
        const isProj = p.year === "2027";
        const dotColor = isProj ? "#018D38" : "#1A6B3C";
        svg += `<circle cx="${p.x}" cy="${p.y}" r="3.5" fill="${dotColor}" stroke="#FFFFFF" stroke-width="1.2"/>`;
        svg += `<text x="${p.x}" y="${p.y - 5}" font-family="Poppins, sans-serif" font-size="6" font-weight="bold" fill="#0F172A" text-anchor="middle">${p.v.toFixed(1)}%</text>`;
        svg += `<text x="${p.x}" y="${height - 6}" font-family="Poppins, sans-serif" font-size="6" fill="#64748B" text-anchor="middle">${isProj ? "2027 (Proy)" : p.year}</text>`;
    });

    svg += `</svg>`;
    return svg;
}

async function generatePlanPDF() {
    const btnPdf = document.getElementById('btn-export-plan-pdf');
    if (!btnPdf) return;
    const originalText = btnPdf.innerHTML;
    btnPdf.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Generando PDF...';
    btnPdf.disabled = true;

    try {
        pdfMake.fonts = {
            Poppins: {
                normal: 'https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-400-normal.ttf',
                bold: 'https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-700-normal.ttf',
                italics: 'https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-400-italic.ttf',
                bolditalics: 'https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-700-italic.ttf'
            },
            FontAwesome: {
                normal: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.ttf'
            }
        };

        const yearFilterText = planYearFilter === 'todos' ? 'Cuatrienio 2024-2027' : `Meta ${planYearFilter}`;
        const metricText = planMetric === 'contratado' ? 'Longitud/Área Contratada' : 'Longitud/Área Ejecutada';

        let cumplidas = 0, proceso = 0, riesgo = 0;
        let inversionTotal = 0;
        let munis = new Set();
        const dataInd = {};
        Object.keys(indicadoresEstrategicos).forEach(k => {
            dataInd[k] = { ejecutado: 0, convenios: 0 };
        });

        let sumCumplimiento = 0;
        let countCumplimiento = 0;

        rawData.forEach(row => {
            const ind = normalizarIndicador(row['INDICADOR']);
            if (!ind || !dataInd[ind]) return;

            const cfg = indicadoresEstrategicos[ind];
            let cant = 0;

            if (cfg.tipo === 'km') {
                const metros = planMetric === 'contratado' ? getRowLongitudContratadaPlan(row) : getRowLongitudEjecutadaPlan(row);
                cant = metros / 1000;
            } else if (cfg.tipo === 'm2') {
                cant = planMetric === 'contratado' ? getRowAreaContratadaPlan(row) : getRowAreaEjecutadaPlan(row);
            } else {
                if (planMetric === 'contratado') {
                    cant = isCuatrenioAnterior(row) ? 0 : 1;
                } else {
                    const estado = String(row['ESTADO CONVENIO'] || '').toUpperCase();
                    const tieneEjecucion = estado.includes('EJECUCI') || estado.includes('EJECUT') ||
                        estado.includes('OPERA') || estado.includes('MEJORAD') ||
                        getRowLongitudEjecutadaPlan(row) > 0 ||
                        getRowAreaEjecutadaPlan(row) > 0 ||
                        parseNum(row['FISICO_NORM']) > 0;
                    cant = tieneEjecucion ? 1 : 0;
                }
            }

            const compYear = getRowCompletionYear(row);
            if (planYearFilter !== 'todos' && compYear !== planYearFilter) {
                return;
            }

            dataInd[ind].ejecutado += cant;
            dataInd[ind].convenios++;
            inversionTotal += parseNum(row['APORTE DEPARTAMENTO']) + parseNum(row['ADICION DEPARTAMENTO']);
            if (row['MUNICIPIO']) munis.add(String(row['MUNICIPIO']).trim());
        });

        const indicatorsList = [];
        Object.keys(indicadoresEstrategicos).forEach(ind => {
            const d = dataInd[ind];
            const cfg = indicadoresEstrategicos[ind];
            const meta = cfg.metas[planYearFilter] !== undefined ? cfg.metas[planYearFilter] : 0;
            const isNP = (meta === 0);
            const e = d.ejecutado;

            let pct = 0;
            let restante = 0;

            if (isNP) {
                pct = 0;
                restante = 0;
            } else {
                pct = meta > 0 ? Math.min((e / meta) * 100, 100) : 0;
                restante = Math.max(meta - e, 0);
            }

            if (!isNP) {
                if (pct >= 80) cumplidas++;
                else if (pct >= 50) proceso++;
                else riesgo++;

                sumCumplimiento += pct;
                countCumplimiento++;
            }

            indicatorsList.push({
                name: ind,
                meta,
                ejecutado: e,
                restante,
                pct,
                isNP,
                unit: cfg.unit,
                convenios: d.convenios
            });
        });

        const promedio = countCumplimiento > 0 ? (sumCumplimiento / countCumplimiento).toFixed(1) : '0.0';
        const logoBase64 = await getBase64ImageFromURL('./assets/escudo_antioquia.png').catch(() => null);

        // 1. Gráfico de Cumplimiento por Indicador (Barras Horizontales Vectorial)
        const svgMetasMarkup = buildVectorChartMetasSVG(indicatorsList);

        // 2. Gráfico 1 General de Proyección
        const proyGeneral = calculateProyeccionAnualPct('todos');
        const svgProyGeneralMarkup = buildVectorChartProyeccionSVG(proyGeneral.years, proyGeneral.pctValues, '1. Proyección General Cuatrienio (%)');

        // 3. Gráficos de Proyección para cada uno de los 7 Indicadores Estratégicos (Total 8 Proyecciones)
        const indKeys = Object.keys(indicadoresEstrategicos);
        const indProyCharts = indKeys.map((indKey, idx) => {
            const d = calculateProyeccionAnualPct(indKey);
            let shortName = indKey;
            if (shortName.includes("AEROPUERTOS")) shortName = "Aeropuertos/Aeródromos";
            else if (shortName.includes("MUELLES")) shortName = "Muelles/Embarcaderos";
            else if (shortName.includes("EQUIPAMIENTOS")) shortName = "Equipamientos Constr.";
            else if (shortName.includes("TERCIARIAS")) shortName = "Vías Terciarias (RVT)";
            else if (shortName.includes("ESPACIO")) shortName = "Espacio Público";
            else if (shortName.includes("CABLES")) shortName = "Cables Aéreos";
            else if (shortName.includes("URBANA")) shortName = "Vía Urbana (RVU)";

            const title = `${idx + 2}. ${shortName} (%)`;
            return {
                title,
                svg: buildVectorChartProyeccionSVG(d.years, d.pctValues, title)
            };
        });

        // Construir filas en pares (2 columnas) para los 7 indicadores
        const chartPairs = [];
        for (let i = 0; i < indProyCharts.length; i += 2) {
            const left = indProyCharts[i];
            const right = indProyCharts[i + 1];
            chartPairs.push({
                columns: [
                    { svg: left.svg, width: 255, alignment: 'center' },
                    right ? { svg: right.svg, width: 255, alignment: 'center' } : { text: '', width: 255 }
                ],
                margin: [0, 0, 0, 8]
            });
        }

        const docDefinition = {
            pageSize: 'LETTER',
            pageOrientation: 'portrait',
            pageMargins: [35, 30, 35, 30],
            defaultStyle: {
                font: 'Poppins',
                fontSize: 8.5,
                color: '#1E293B'
            },
            content: [
                {
                    columns: [
                        logoBase64 ? {
                            image: logoBase64,
                            width: 32,
                            alignment: 'left'
                        } : { text: '' },
                        {
                            stack: [
                                { text: 'GOBERNACIÓN DE ANTIOQUIA', fontSize: 10, bold: true, color: '#1A6B3C', letterSpacing: 0.5 },
                                { text: 'SECRETARÍA DE INFRAESTRUCTURA FÍSICA', fontSize: 7.5, bold: true, color: '#64748B' },
                                { text: 'Dirección de Infraestructura y Apoyo Territorial (DIAT)', fontSize: 7, color: '#94A3B8' }
                            ],
                            margin: [8, 0, 0, 0],
                            width: '*'
                        },
                        {
                            stack: [
                                { text: 'FICHA TÉCNICA DE PLAN DE DESARROLLO', fontSize: 9, bold: true, color: '#1A6B3C', alignment: 'right' },
                                { text: 'INDICADORES ESTRATÉGICOS', fontSize: 7.5, bold: true, color: '#64748B', alignment: 'right' },
                                { text: `Generado: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`, fontSize: 7, color: '#94A3B8', alignment: 'right' }
                            ],
                            width: 'auto'
                        }
                    ],
                    margin: [0, 0, 0, 8]
                },
                {
                    canvas: [{ type: 'line', x1: 0, y1: 0, x2: 542, y2: 0, lineWidth: 1.5, lineColor: '#1A6B3C' }],
                    margin: [0, 0, 0, 10]
                },
                {
                    table: {
                        widths: ['*'],
                        body: [
                            [
                                {
                                    stack: [
                                        {
                                            columns: [
                                                { text: `PERIODO DE METAS EVALUADAS: ${yearFilterText.toUpperCase()}`, bold: true, fontSize: 8, color: '#0F172A' },
                                                { text: `MÉTRICA BASE: ${metricText.toUpperCase()}`, bold: true, fontSize: 8, color: '#1A6B3C', alignment: 'right' }
                                            ]
                                        }
                                    ],
                                    fillColor: '#E8F5EE',
                                    border: [false, false, false, false],
                                    margin: [8, 6, 8, 6]
                                }
                            ]
                        ]
                    },
                    layout: { defaultBorder: false },
                    margin: [0, 0, 0, 10]
                },
                {
                    columns: [
                        {
                            table: {
                                widths: ['*'],
                                body: [
                                    [
                                        {
                                            stack: [
                                                { text: 'AVANCE PROMEDIO GLOBAL', fontSize: 7, bold: true, color: '#1A6B3C', letterSpacing: 0.5 },
                                                { text: `${promedio}%`, fontSize: 32, bold: true, color: '#1A6B3C', margin: [0, 2, 0, 2], letterSpacing: -1 },
                                                { text: 'Cumplimiento promedio acumulado de metas programadas', fontSize: 6.5, color: '#1A6B3C', leading: 1.2 }
                                            ],
                                            fillColor: '#E8F5EE',
                                            padding: 10
                                        }
                                    ]
                                ]
                            },
                            layout: {
                                hLineWidth: () => 1, vLineWidth: () => 1,
                                hLineColor: () => '#C5D9CB', vLineColor: () => '#C5D9CB',
                                paddingLeft: () => 10, paddingRight: () => 10, paddingTop: () => 8, paddingBottom: () => 8
                            },
                            width: 140
                        },
                        {
                            stack: [
                                {
                                    columns: [
                                        {
                                            table: {
                                                widths: ['*'],
                                                body: [
                                                    [
                                                        {
                                                            stack: [
                                                                { text: 'CUMPLIDAS (>=80%)', fontSize: 6.5, bold: true, color: '#10B981' },
                                                                { text: String(cumplidas), fontSize: 14, bold: true, color: '#10B981', margin: [0, 2, 0, 0] }
                                                            ],
                                                            fillColor: '#E8F5EE'
                                                        }
                                                    ]
                                                ]
                                            },
                                            layout: {
                                                hLineWidth: () => 1, vLineWidth: () => 1,
                                                hLineColor: () => '#C5D9CB', vLineColor: () => '#C5D9CB',
                                                paddingLeft: () => 8, paddingRight: () => 8, paddingTop: () => 4, paddingBottom: () => 4
                                            },
                                            margin: [0, 0, 4, 0]
                                        },
                                        {
                                            table: {
                                                widths: ['*'],
                                                body: [
                                                    [
                                                        {
                                                            stack: [
                                                                { text: 'EN PROCESO (50-80%)', fontSize: 6.5, bold: true, color: '#F59E0B' },
                                                                { text: String(proceso), fontSize: 14, bold: true, color: '#F59E0B', margin: [0, 2, 0, 0] }
                                                            ],
                                                            fillColor: '#FFF9DB'
                                                        }
                                                    ]
                                                ]
                                            },
                                            layout: {
                                                hLineWidth: () => 1, vLineWidth: () => 1,
                                                hLineColor: () => '#FFE066', vLineColor: () => '#FFE066',
                                                paddingLeft: () => 8, paddingRight: () => 8, paddingTop: () => 4, paddingBottom: () => 4
                                            },
                                            margin: [4, 0, 4, 0]
                                        },
                                        {
                                            table: {
                                                widths: ['*'],
                                                body: [
                                                    [
                                                        {
                                                            stack: [
                                                                { text: 'EN RIESGO (<50%)', fontSize: 6.5, bold: true, color: '#EF4444' },
                                                                { text: String(riesgo), fontSize: 14, bold: true, color: '#EF4444', margin: [0, 2, 0, 0] }
                                                            ],
                                                            fillColor: '#FCE8E6'
                                                        }
                                                    ]
                                                ]
                                            },
                                            layout: {
                                                hLineWidth: () => 1, vLineWidth: () => 1,
                                                hLineColor: () => '#FAD2CF', vLineColor: () => '#FAD2CF',
                                                paddingLeft: () => 8, paddingRight: () => 8, paddingTop: () => 4, paddingBottom: () => 4
                                            },
                                            margin: [4, 0, 0, 0]
                                        }
                                    ]
                                },
                                {
                                    columns: [
                                        {
                                            table: {
                                                widths: ['*'],
                                                body: [
                                                    [
                                                        {
                                                            stack: [
                                                                { text: 'INVERSIÓN TOTAL ASOCIADA', fontSize: 6.5, bold: true, color: '#1E3A8A' },
                                                                { text: formatCurrency(inversionTotal), fontSize: 11, bold: true, color: '#1E3A8A', margin: [0, 2, 0, 0] }
                                                            ],
                                                            fillColor: '#EFF6FF'
                                                        }
                                                    ]
                                                ]
                                            },
                                            layout: {
                                                hLineWidth: () => 1, vLineWidth: () => 1,
                                                hLineColor: () => '#DBEAFE', vLineColor: () => '#DBEAFE',
                                                paddingLeft: () => 8, paddingRight: () => 8, paddingTop: () => 4, paddingBottom: () => 4
                                            },
                                            margin: [0, 6, 4, 0]
                                        },
                                        {
                                            table: {
                                                widths: ['*'],
                                                body: [
                                                    [
                                                        {
                                                            stack: [
                                                                { text: 'MUNICIPIOS BENEFICIADOS', fontSize: 6.5, bold: true, color: '#475569' },
                                                                { text: `${munis.size} municipios`, fontSize: 11, bold: true, color: '#334155', margin: [0, 2, 0, 0] }
                                                            ],
                                                            fillColor: '#F8FAFC'
                                                        }
                                                    ]
                                                ]
                                            },
                                            layout: {
                                                hLineWidth: () => 1, vLineWidth: () => 1,
                                                hLineColor: () => '#E2E8F0', vLineColor: () => '#E2E8F0',
                                                paddingLeft: () => 8, paddingRight: () => 8, paddingTop: () => 4, paddingBottom: () => 4
                                            },
                                            margin: [4, 6, 0, 0]
                                        }
                                    ]
                                }
                            ],
                            margin: [12, 0, 0, 0],
                            width: '*'
                        }
                    ],
                    margin: [0, 0, 0, 12]
                },
                { text: 'DETALLE DE CUMPLIMIENTO POR INDICADOR ESTRATÉGICO', fontSize: 7.5, bold: true, color: '#475569', letterSpacing: 0.5, margin: [0, 0, 0, 4] },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'],
                        body: [
                            [
                                { text: 'INDICADOR ESTRATÉGICO', bold: true, color: '#FFFFFF', fillColor: '#1A6B3C', fontSize: 7.5 },
                                { text: 'META', bold: true, color: '#FFFFFF', fillColor: '#1A6B3C', fontSize: 7.5, alignment: 'right' },
                                { text: metricText.toUpperCase().split('/')[1] || metricText.toUpperCase(), bold: true, color: '#FFFFFF', fillColor: '#1A6B3C', fontSize: 7.5, alignment: 'right' },
                                { text: 'RESTANTE', bold: true, color: '#FFFFFF', fillColor: '#1A6B3C', fontSize: 7.5, alignment: 'right' },
                                { text: '% AVANCE', bold: true, color: '#FFFFFF', fillColor: '#1A6B3C', fontSize: 7.5, alignment: 'center' },
                                { text: 'CONVENIOS', bold: true, color: '#FFFFFF', fillColor: '#1A6B3C', fontSize: 7.5, alignment: 'center' }
                            ],
                            ...indicatorsList.map((item) => {
                                const isNP = item.isNP;
                                const fmtVal = (val) => {
                                    if (item.unit === 'km') return val.toFixed(1) + ' km';
                                    if (item.unit === 'm²') return val.toLocaleString('es-CO') + ' m²';
                                    return Math.round(val) + ' und';
                                };

                                const metaText = isNP ? 'NP' : fmtVal(item.meta);
                                const ejecutadoText = fmtVal(item.ejecutado);
                                const restanteText = isNP ? '-' : fmtVal(item.restante);
                                const pctText = isNP ? 'NP' : `${item.pct.toFixed(1)}%`;

                                let badgeColor = '#EF4444';
                                let badgeBg = '#FCE8E6';
                                if (isNP) {
                                    badgeColor = '#64748B';
                                    badgeBg = '#F1F5F9';
                                } else if (item.pct >= 80) {
                                    badgeColor = '#10B981';
                                    badgeBg = '#E8F5EE';
                                } else if (item.pct >= 50) {
                                    badgeColor = '#F59E0B';
                                    badgeBg = '#FFF9DB';
                                }

                                return [
                                    { text: item.name, fontSize: 7.5, bold: true, color: '#334155' },
                                    { text: metaText, fontSize: 7.5, alignment: 'right', color: '#475569' },
                                    { text: ejecutadoText, fontSize: 7.5, alignment: 'right', color: '#1A6B3C', bold: true },
                                    { text: restanteText, fontSize: 7.5, alignment: 'right', color: '#EF4444' },
                                    {
                                        text: pctText,
                                        fontSize: 7.5,
                                        bold: true,
                                        alignment: 'center',
                                        color: badgeColor,
                                        fillColor: badgeBg
                                    },
                                    { text: `${item.convenios} conv.`, fontSize: 7, alignment: 'center', color: '#64748B' }
                                ];
                            })
                        ]
                    },
                    layout: {
                        hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 1 : 0.5,
                        vLineWidth: () => 0.5,
                        hLineColor: (i) => i === 0 ? '#1A6B3C' : '#E2E8F0',
                        vLineColor: () => '#E2E8F0',
                        paddingLeft: () => 6,
                        paddingRight: () => 6,
                        paddingTop: () => 4,
                        paddingBottom: () => 4
                    },
                    margin: [0, 0, 0, 12]
                },
                // Sección de Análisis Gráfico Principal
                { text: 'ANÁLISIS GRÁFICO GENERAL (CUMPLIMIENTO Y PROYECCIÓN GLOBAL)', fontSize: 7.5, bold: true, color: '#475569', letterSpacing: 0.5, margin: [0, 0, 0, 4] },
                {
                    columns: [
                        {
                            stack: [
                                { text: '% CUMPLIMIENTO POR INDICADOR', fontSize: 6.5, bold: true, color: '#475569', alignment: 'center', margin: [0, 0, 0, 2] },
                                { svg: svgMetasMarkup, width: 255, alignment: 'center' }
                            ]
                        },
                        {
                            stack: [
                                { text: 'PROYECCIÓN GENERAL CUATRIENIO', fontSize: 6.5, bold: true, color: '#475569', alignment: 'center', margin: [0, 0, 0, 2] },
                                { svg: svgProyGeneralMarkup, width: 255, alignment: 'center' }
                            ]
                        }
                    ],
                    margin: [0, 0, 0, 12]
                },
                // Sección de Proyecciones Detalladas por Indicador (7 Gráficos Vectoriales de Proyección)
                { text: 'PROYECCIÓN DE AVANCE POR INDICADOR ESTRATÉGICO (7 INDICADORES)', fontSize: 8, bold: true, color: '#1A6B3C', letterSpacing: 0.5, margin: [0, 10, 0, 6], pageBreak: 'before' },
                ...chartPairs,
                {
                    text: 'Este reporte refleja la información oficial consolidada de convenios de infraestructura de la Dirección de Apoyo Territorial DIAT. Gobernación de Antioquia Firme.',
                    fontSize: 6.5,
                    color: '#94A3B8',
                    alignment: 'center',
                    margin: [0, 10, 0, 0]
                }
            ]
        };

        pdfMake.createPdf(docDefinition).download(`Ficha_Indicadores_Plan_${planYearFilter}.pdf`);

        btnPdf.innerHTML = originalText;
        btnPdf.disabled = false;

        const toast = document.getElementById('toast-notification');
        if (toast) {
            toast.classList.remove('opacity-0', 'translate-y-20');
            setTimeout(() => toast.classList.add('opacity-0', 'translate-y-20'), 3500);
        }

    } catch (err) {
        console.error('Error generando PDF del Plan:', err);
        alert('Ocurrió un error al generar el PDF de indicadores. Revisa la consola para más detalles.');
        btnPdf.innerHTML = originalText;
        btnPdf.disabled = false;
    }
}

// =========================================================================
// GENERADOR DE MAPA VECTORIAL OPTIMIZADO DE ANTIOQUIA PARA REPORTES PDF
// =========================================================================
async function generateVectorMapAntioquiaSVG(filteredRows, svgWidth = 542, svgHeight = 220) {
    try {
        // 1. Cargar datos de municipios si no están en memoria
        let mpioData = synMpioData;
        if (!mpioData || !mpioData.features || mpioData.features.length === 0) {
            const resp = await fetch('./mpio.json').catch(() => null);
            if (resp && resp.ok) {
                const data = await resp.json();
                data.features = (data.features || []).filter(f => {
                    const dpto = String(f.properties.DPTO || '').trim();
                    const nomDpt = String(f.properties.NOMBRE_DPT || f.properties.NOM_DEPART || '').trim().toUpperCase();
                    return dpto === '05' || dpto === '5' || nomDpt.includes('ANTIOQUIA');
                });
                synMpioData = data;
                mpioData = data;
            }
        }

        if (!mpioData || !mpioData.features || mpioData.features.length === 0) {
            return null;
        }

        // 2. Extraer municipios impactados y convenios activos
        const norm = (s) => String(s || '')
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^A-Z ]/g, '')
            .replace(/\s+/g, ' ')
            .trim();

        const muniCounts = {};
        const impactedConvs = new Set();
        (filteredRows || []).forEach(r => {
            const m = norm(r['MUNICIPIO']);
            if (m) muniCounts[m] = (muniCounts[m] || 0) + 1;
            const cNum = String(r['CONVENIO'] || '').trim();
            if (cNum) impactedConvs.add(cNum);
        });

        // 3. Calcular Bounding Box geográfico de Antioquia
        let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
        mpioData.features.forEach(f => {
            const coords = f.geometry && f.geometry.coordinates;
            if (!coords) return;
            const processRing = (ring) => {
                ring.forEach(pt => {
                    const [lng, lat] = pt;
                    if (lng < minLng) minLng = lng;
                    if (lng > maxLng) maxLng = lng;
                    if (lat < minLat) minLat = lat;
                    if (lat > maxLat) maxLat = lat;
                });
            };
            if (f.geometry.type === 'Polygon') {
                coords.forEach(processRing);
            } else if (f.geometry.type === 'MultiPolygon') {
                coords.forEach(poly => poly.forEach(processRing));
            }
        });

        if (minLng === Infinity || maxLng === -Infinity) {
            minLng = -77.15; maxLng = -73.85; minLat = 5.40; maxLat = 8.90;
        }

        // Proyección equirrectangular ajustada con factor de latitud media
        const paddingX = 10;
        const paddingY = 8;
        const mapW = svgWidth - paddingX * 2;
        const mapH = svgHeight - paddingY * 2;

        const midLat = (minLat + maxLat) / 2;
        const cosLat = Math.cos(midLat * Math.PI / 180);

        const geoW = (maxLng - minLng) * cosLat;
        const geoH = (maxLat - minLat);
        const scale = Math.min(mapW / geoW, mapH / geoH);

        const actualW = geoW * scale;
        const actualH = geoH * scale;
        const offsetX = paddingX + (mapW - actualW) / 2;
        const offsetY = paddingY + (mapH - actualH) / 2;

        const project = (lng, lat) => {
            const x = offsetX + (lng - minLng) * cosLat * scale;
            const y = offsetY + (maxLat - lat) * scale;
            return [x.toFixed(1), y.toFixed(1)];
        };

        // 4. Generar Paths SVG vectoriales para los 125 municipios
        let impactedMuniCount = 0;
        let pathsSvg = '';

        mpioData.features.forEach(f => {
            const rawName = f.properties.NOMBRE_MPI || f.properties.MPIO_CNMBR || f.properties.NOM_MPIO || '';
            const mNorm = norm(rawName);
            const count = muniCounts[mNorm] || 0;
            const isImpacted = count > 0;
            if (isImpacted) impactedMuniCount++;

            const buildPathFromRing = (ring) => {
                if (!ring || ring.length === 0) return '';
                let d = '';
                for (let i = 0; i < ring.length; i++) {
                    const [px, py] = project(ring[i][0], ring[i][1]);
                    d += (i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`);
                }
                return d + ' Z ';
            };

            let pathData = '';
            if (f.geometry && f.geometry.type === 'Polygon') {
                f.geometry.coordinates.forEach(ring => {
                    pathData += buildPathFromRing(ring);
                });
            } else if (f.geometry && f.geometry.type === 'MultiPolygon') {
                f.geometry.coordinates.forEach(poly => {
                    poly.forEach(ring => {
                        pathData += buildPathFromRing(ring);
                    });
                });
            }

            const fillColor = isImpacted ? '#0B5640' : '#F1F5F9';
            const strokeColor = isImpacted ? '#043A2B' : '#CBD5E1';
            const strokeWidth = isImpacted ? '0.75' : '0.4';
            const opacity = isImpacted ? '1' : '0.9';

            pathsSvg += `<path d="${pathData}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" fill-opacity="${opacity}" />\n`;
        });

        // 5. Cargar y proyectar tramos KML si están disponibles
        // Asegurar que todos los KML de los convenios impactados estén en caché
        const toFetchKmls = Array.from(impactedConvs).filter(num => !synKmlCache[num]);
        if (toFetchKmls.length > 0) {
            const promises = toFetchKmls.map(async (num) => {
                try {
                    const mapData = await loadMapData(num);
                    if (mapData) {
                        if (mapData.type === 'kml') {
                            synKmlCache[num] = parseKMLStringToGeoJSON(mapData.data, num);
                        } else if (mapData.type === 'geojson') {
                            const d = mapData.data;
                            const feats = d.features || (d.geometry ? [d] : []);
                            feats.forEach(f => {
                                if (f && f.geometry) {
                                    f.properties = f.properties || {};
                                    f.properties.CONVENIO = num;
                                }
                            });
                            synKmlCache[num] = feats;
                        }
                    }
                } catch (e) { }
            });
            await Promise.all(promises);
        }

        let tramosLinesSvg = '';
        let tramosPointsSvg = '';

        const processedConvs = new Set();
        (filteredRows || []).forEach(row => {
            const cNum = String(row['CONVENIO'] || '').trim();
            if (processedConvs.has(cNum)) return;
            processedConvs.add(cNum);

            const kmlGeo = synKmlCache[cNum];
            const feats = Array.isArray(kmlGeo) ? kmlGeo : (kmlGeo && kmlGeo.features ? kmlGeo.features : []);
            let hasDrawn = false;

            if (feats && feats.length > 0) {
                feats.forEach(feat => {
                    if (feat && feat.geometry) {
                        const renderLine = (pts) => {
                            if (!pts || pts.length === 0) return;
                            let d = '';
                            for (let i = 0; i < pts.length; i++) {
                                const [px, py] = project(pts[i][0], pts[i][1]);
                                d += (i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`);
                            }
                            if (d) {
                                hasDrawn = true;
                                tramosLinesSvg += `<path d="${d}" fill="none" stroke="#043A2B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.75" />\n`;
                                tramosLinesSvg += `<path d="${d}" fill="none" stroke="#00E676" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />\n`;

                                const midIdx = Math.floor(pts.length / 2);
                                const [cx, cy] = project(pts[midIdx][0], pts[midIdx][1]);
                                tramosPointsSvg += `<circle cx="${cx}" cy="${cy}" r="1.9" fill="#00E676" fill-opacity="0.3" />\n`;
                                tramosPointsSvg += `<circle cx="${cx}" cy="${cy}" r="1.2" fill="#00E676" stroke="#043A2B" stroke-width="0.4" />\n`;
                                tramosPointsSvg += `<circle cx="${cx}" cy="${cy}" r="0.4" fill="#FFFFFF" />\n`;
                            }
                        };
                        if (feat.geometry.type === 'LineString') {
                            renderLine(feat.geometry.coordinates);
                        } else if (feat.geometry.type === 'MultiLineString') {
                            feat.geometry.coordinates.forEach(renderLine);
                        } else if (feat.geometry.type === 'Point') {
                            hasDrawn = true;
                            const [cx, cy] = project(feat.geometry.coordinates[0], feat.geometry.coordinates[1]);
                            tramosPointsSvg += `<circle cx="${cx}" cy="${cy}" r="1.9" fill="#00E676" fill-opacity="0.3" />\n`;
                            tramosPointsSvg += `<circle cx="${cx}" cy="${cy}" r="1.2" fill="#00E676" stroke="#043A2B" stroke-width="0.4" />\n`;
                            tramosPointsSvg += `<circle cx="${cx}" cy="${cy}" r="0.4" fill="#FFFFFF" />\n`;
                        }
                    }
                });
            }

            // Fallback: si el convenio no tiene KML/KMZ o no generó trazo, dibujar el punto por LATITUD / LONGITUD
            if (!hasDrawn) {
                const lat = parseFloat(row['LATITUD']), lng = parseFloat(row['LONGITUD']);
                if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
                    const [cx, cy] = project(lng, lat);
                    tramosPointsSvg += `<circle cx="${cx}" cy="${cy}" r="1.9" fill="#00E676" fill-opacity="0.3" />\n`;
                    tramosPointsSvg += `<circle cx="${cx}" cy="${cy}" r="1.2" fill="#00E676" stroke="#043A2B" stroke-width="0.4" />\n`;
                    tramosPointsSvg += `<circle cx="${cx}" cy="${cy}" r="0.4" fill="#FFFFFF" />\n`;
                }
            }
        });

        const totalMpios = mpioData.features.length || 125;

        // 6. Construir Markup SVG Completo y Optimizado
        const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}">
    <rect x="0" y="0" width="${svgWidth}" height="${svgHeight}" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" />
    
    <!-- Grid sutil de coordenadas -->
    <g stroke="#E2E8F0" stroke-width="0.5" stroke-dasharray="2,2">
        <line x1="0" y1="45" x2="${svgWidth}" y2="45" />
        <line x1="0" y1="90" x2="${svgWidth}" y2="90" />
        <line x1="0" y1="135" x2="${svgWidth}" y2="135" />
        <line x1="135" y1="0" x2="135" y2="${svgHeight}" />
        <line x1="270" y1="0" x2="270" y2="${svgHeight}" />
        <line x1="405" y1="0" x2="405" y2="${svgHeight}" />
    </g>

    <!-- Capa de Polígonos de Municipios -->
    <g id="municipios-layer">
        ${pathsSvg}
    </g>

    <!-- Capa de Trazados Viales KML en Verde Metálico Neón -->
    <g id="tramos-lines-layer">
        ${tramosLinesSvg}
    </g>

    <!-- Capa de Puntos Beacon KML Discretos -->
    <g id="tramos-points-layer">
        ${tramosPointsSvg}
    </g>

    <!-- Panel Lateral Izquierdo: Título y Convenciones (Sin tapar el mapa) -->
    <rect x="8" y="8" width="145" height="90" rx="6" fill="#FFFFFF" fill-opacity="0.95" stroke="#E2E8F0" stroke-width="0.8" />
    
    <rect x="12" y="14" width="3" height="13" rx="1.5" fill="#0B5640" />
    <text x="18" y="21" font-family="Poppins, Arial, sans-serif" font-size="6.5" font-weight="bold" fill="#0B5640">DISTRIBUCIÓN TERRITORIAL</text>
    <text x="18" y="29" font-family="Poppins, Arial, sans-serif" font-size="5.5" font-weight="bold" fill="#64748B">${impactedMuniCount} de ${totalMpios} Municipios</text>
    
    <line x1="12" y1="35" x2="147" y2="35" stroke="#E2E8F0" stroke-width="0.6" />
    
    <text x="14" y="44" font-family="Poppins, Arial, sans-serif" font-size="5" font-weight="bold" fill="#94A3B8" letter-spacing="0.5">CONVENCIONES</text>
    
    <!-- Item 1: Impactado -->
    <rect x="14" y="49" width="7" height="7" rx="1.5" fill="#0B5640" stroke="#043A2B" stroke-width="0.5" />
    <text x="25" y="54.5" font-family="Poppins, Arial, sans-serif" font-size="5.5" font-weight="bold" fill="#334155">Impactado (${impactedMuniCount})</text>
    
    <!-- Item 2: Sin Convenio -->
    <rect x="14" y="61" width="7" height="7" rx="1.5" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="0.5" />
    <text x="25" y="66.5" font-family="Poppins, Arial, sans-serif" font-size="5.5" font-weight="bold" fill="#64748B">Sin Convenio (${totalMpios - impactedMuniCount})</text>
    
    <!-- Item 3: Trazado KML -->
    <circle cx="17.5" cy="78.5" r="1.9" fill="#00E676" stroke="#043A2B" stroke-width="0.5" />
    <line x1="22" y1="78.5" x2="33" y2="78.5" stroke="#00E676" stroke-width="1.6" stroke-linecap="round" />
    <text x="37" y="80.5" font-family="Poppins, Arial, sans-serif" font-size="5.5" font-weight="bold" fill="#0B5640">Trazado KML / Punto</text>

    <!-- Panel Lateral Derecho: Resumen de Cobertura y Rosa de los Vientos -->
    <rect x="${svgWidth - 130}" y="8" width="122" height="52" rx="6" fill="#FFFFFF" fill-opacity="0.95" stroke="#E2E8F0" stroke-width="0.8" />
    
    <text x="${svgWidth - 122}" y="19" font-family="Poppins, Arial, sans-serif" font-size="5" font-weight="bold" fill="#94A3B8" letter-spacing="0.5">COBERTURA TERRITORIAL</text>
    <text x="${svgWidth - 122}" y="32" font-family="Poppins, Arial, sans-serif" font-size="9.5" font-weight="bold" fill="#0B5640">${((impactedMuniCount / totalMpios) * 100).toFixed(1)}%</text>
    <text x="${svgWidth - 122}" y="42" font-family="Poppins, Arial, sans-serif" font-size="5.2" font-weight="bold" fill="#64748B">${impactedConvs.size} Convenios en Mapa</text>

    <!-- Flecha Norte en la tarjeta derecha -->
    <g transform="translate(${svgWidth - 36}, 16)">
        <circle cx="8" cy="8" r="7.5" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="0.5" />
        <polygon points="8,2 10.5,8 5.5,8" fill="#0B5640" />
        <polygon points="8,14 10.5,8 5.5,8" fill="#94A3B8" />
        <text x="6.5" y="0.5" font-family="Poppins, Arial, sans-serif" font-size="5" font-weight="bold" fill="#0B5640">N</text>
    </g>
</svg>`;

        return svgMarkup;
    } catch (err) {
        console.error("Error generando mapa vectorial para PDF:", err);
        return null;
    }
}

async function generateResumenPDF() {
    const btnPdf = document.getElementById('btn-export-resumen-pdf');
    if (!btnPdf) return;
    const originalText = btnPdf.innerHTML;
    btnPdf.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Generando PDF...';
    btnPdf.disabled = true;

    try {
        // Configure Poppins Font & FontAwesome Solid
        pdfMake.fonts = {
            Poppins: {
                normal: 'https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-400-normal.ttf',
                bold: 'https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-700-normal.ttf',
                italics: 'https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-400-italic.ttf',
                bolditalics: 'https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-700-italic.ttf'
            },
            FontAwesome: {
                normal: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.ttf'
            }
        };

        // 1. Gather active filters
        const activeFilters = [];
        const checkFilter = (id, label) => {
            const vals = getSelectValues(id);
            if (vals.length > 0) {
                activeFilters.push(`${label}: ${vals.join(', ')}`);
            }
        };
        checkFilter('filter-vigencia', 'Vigencia');
        checkFilter('filter-supervisor', 'Supervisor');
        checkFilter('filter-indicador', 'Indicador');
        checkFilter('filter-clasificacion', 'Clasificación');
        checkFilter('filter-municipio', 'Municipio');
        checkFilter('filter-subregion', 'Subregión');
        checkFilter('filter-estado', 'Estado');
        checkFilter('filter-convenio-num', 'N° Convenio');

        const filtersText = activeFilters.length > 0 ? activeFilters.join(' | ') : 'NINGUNO (MOSTRANDO TODOS LOS CONVENIOS)';

        // 2. Perform calculations mirroring updateKPIs()
        let activos = 0, porLiquidar = 0, suspendidos = 0, sumInv = 0, sumDes = 0, sumAut = 0;
        let totLonCon = 0, totLonEje = 0;
        let totAreCon = 0, totAreEje = 0;

        filteredData.forEach(r => {
            const est = String(r['ESTADO CONVENIO'] || '').toLowerCase();
            const estNorm = est.normalize('NFD').replace(/[\u0300-\u036f]/g, "");

            if (est.includes('ejecuci')) activos++;
            if (est.includes('por liquidar')) porLiquidar++;
            if (estNorm.includes('suspendido') || estNorm.includes('riesgo medio') || estNorm.includes('medio')) suspendidos++;

            sumInv += (r['APORTE DEPARTAMENTO'] || 0) + (r['ADICION DEPARTAMENTO'] || 0);
            sumDes += r['VALOR TOTAL DESEMBOLSADO'] || 0;
            sumAut += r['VALOR TOTAL AUTORIZADO'] || 0;

            totLonCon += getRowLongitudContratada(r);
            totLonEje += getRowLongitudEjecutada(r);
            totAreCon += getRowAreaContratada(r);
            totAreEje += getRowAreaEjecutada(r);
        });

        // 3. Fetch institutional logo & Generate Vector Map
        const [logoBase64, mapSvgMarkup] = await Promise.all([
            getBase64ImageFromURL('./assets/escudo_antioquia.png').catch(() => null),
            generateVectorMapAntioquiaSVG(filteredData, 542, 220).catch(() => null)
        ]);

        // 4. Generate native pdfMake vector chart for a premium, clean presentation
        const maxVal = Math.max(totLonCon, totLonEje);
        const chartHeight = 80;

        const hContratado = maxVal > 0 ? (totLonCon / maxVal) * chartHeight : 0;
        const hEjecutado = maxVal > 0 ? (totLonEje / maxVal) * chartHeight : 0;

        const valConKm = (totLonCon / 1000).toFixed(2);
        const valEjeKm = (totLonEje / 1000).toFixed(2);
        const pctEje = totLonCon > 0 ? ((totLonEje / totLonCon) * 100).toFixed(1) : '0.0';

        // Generate financial comparative vector chart
        const maxFin = Math.max(sumInv, sumAut);
        const hInversion = maxFin > 0 ? (sumInv / maxFin) * chartHeight : 0;
        const hAutorizado = maxFin > 0 ? (sumAut / maxFin) * chartHeight : 0;
        const pctAut = sumInv > 0 ? ((sumAut / sumInv) * 100).toFixed(1) : '0.0';
        const formatShortCurrency = (val) => {
            if (val === 0) return '$0';
            return '$' + Math.round(val / 1000000).toLocaleString('es-CO') + ' M';
        };

        const chartSection = {
            table: {
                widths: ['*', 12, '*'],
                body: [
                    [
                        // Vial Chart Column (Barra de progreso horizontal apilada)
                        {
                            stack: [
                                { text: 'RELACIÓN DE ALCANCE VIAL: CONTRATADO VS EJECUTADO', fontSize: 7, bold: true, color: '#1A6B3C', alignment: 'left', margin: [0, 2, 0, 8] },
                                {
                                    columns: [
                                        { text: 'AVANCE DE EJECUCIÓN', fontSize: 6, bold: true, color: '#10B981' },
                                        { text: `${pctEje}%`, fontSize: 13, bold: true, color: '#10B981', alignment: 'right' }
                                    ],
                                    margin: [0, 0, 0, 4]
                                },
                                {
                                    canvas: [
                                        { type: 'rect', x: 0, y: 0, w: 230, h: 18, color: '#E2E8F0', r: 5 },
                                        { type: 'rect', x: 0, y: 0, w: Math.round(230 * Math.min(Number(pctEje) / 100, 1)), h: 18, color: '#10B981', r: 5 }
                                    ],
                                    margin: [0, 0, 0, 6]
                                },
                                {
                                    columns: [
                                        { text: `Ejecutado: ${valEjeKm} km`, fontSize: 7.5, bold: true, color: '#10B981' },
                                        { text: `Total Contratado: ${valConKm} km`, fontSize: 7.5, bold: true, color: '#64748B', alignment: 'right' }
                                    ]
                                }
                            ],
                            fillColor: '#F8FAFC',
                            margin: [6, 6, 6, 6],
                            border: [true, true, true, true]
                        },
                        // Spacer
                        {
                            text: '',
                            border: [false, false, false, false]
                        },
                        // Financial Chart Column (Barra de progreso horizontal apilada)
                        {
                            stack: [
                                { text: 'COMPARATIVO FINANCIERO: INVERSIÓN VS AUTORIZADO', fontSize: 7, bold: true, color: '#1A6B3C', alignment: 'left', margin: [0, 2, 0, 8] },
                                {
                                    columns: [
                                        { text: 'RECURSOS AUTORIZADOS SIF', fontSize: 6, bold: true, color: '#1A6B3C' },
                                        { text: `${pctAut}%`, fontSize: 13, bold: true, color: '#1A6B3C', alignment: 'right' }
                                    ],
                                    margin: [0, 0, 0, 4]
                                },
                                {
                                    canvas: [
                                        { type: 'rect', x: 0, y: 0, w: 230, h: 18, color: '#E2E8F0', r: 5 },
                                        { type: 'rect', x: 0, y: 0, w: Math.round(230 * Math.min(Number(pctAut) / 100, 1)), h: 18, color: '#1A6B3C', r: 5 }
                                    ],
                                    margin: [0, 0, 0, 6]
                                },
                                {
                                    columns: [
                                        { text: `Autorizado: ${formatShortCurrency(sumAut)}`, fontSize: 7.5, bold: true, color: '#1A6B3C' },
                                        { text: `Inversión: ${formatShortCurrency(sumInv)}`, fontSize: 7.5, bold: true, color: '#64748B', alignment: 'right' }
                                    ]
                                }
                            ],
                            fillColor: '#F8FAFC',
                            margin: [6, 6, 6, 6],
                            border: [true, true, true, true]
                        }
                    ]
                ]
            },
            layout: {
                hLineWidth: () => 1,
                vLineWidth: () => 1,
                hLineColor: () => '#E2E8F0',
                vLineColor: () => '#E2E8F0',
                paddingLeft: () => 0,
                paddingRight: () => 0,
                paddingTop: () => 0,
                paddingBottom: () => 0
            },
            margin: [0, 0, 0, 10]
        };

        // 5. Build the detailed convenios table
        const tableBody = [
            // Header Row
            [
                { text: 'CONVENIO', bold: true, fillColor: '#1A6B3C', color: '#FFFFFF', fontSize: 7.5 },
                { text: 'CONVENIENTE EJECUTOR', bold: true, fillColor: '#1A6B3C', color: '#FFFFFF', fontSize: 7.5 },
                { text: 'SUPERVISOR', bold: true, fillColor: '#1A6B3C', color: '#FFFFFF', fontSize: 7.5 },
                { text: 'ESTADO', bold: true, fillColor: '#1A6B3C', color: '#FFFFFF', fontSize: 7.5, alignment: 'center' },
                { text: 'AV. FÍSICO', bold: true, fillColor: '#1A6B3C', color: '#FFFFFF', fontSize: 7.5, alignment: 'right' },
                { text: 'AV. FINANCIERO', bold: true, fillColor: '#1A6B3C', color: '#FFFFFF', fontSize: 7.5, alignment: 'right' }
            ]
        ];

        if (filteredData.length === 0) {
            tableBody.push([
                { text: 'No se encontraron convenios con los filtros seleccionados.', colSpan: 6, alignment: 'center', fontSize: 8, italics: true },
                {}, {}, {}, {}, {}
            ]);
        } else {
            filteredData.forEach(r => {
                const pfis = r['FISICO_NORM'] || 0;
                const pfin = r['FINANCIERO_NORM'] || 0;
                const sysState = getSystemState(r['ESTADO CONVENIO']);

                let badgeColor = '#64748B';
                let badgeBg = '#F1F5F9';
                if (sysState.badgeClass === 'badge-ejecutado' || sysState.badgeClass === 'badge-ejecucion') {
                    badgeColor = '#10B981';
                    badgeBg = '#E8F5EE';
                } else if (sysState.badgeClass === 'badge-por-liquidar' || sysState.badgeClass === 'badge-proximo') {
                    badgeColor = '#F59E0B';
                    badgeBg = '#FFF9DB';
                } else if (sysState.badgeClass === 'badge-suspendido') {
                    badgeColor = '#EF4444';
                    badgeBg = '#FCE8E6';
                } else if (sysState.badgeClass === 'badge-liquidado') {
                    badgeColor = '#3B82F6';
                    badgeBg = '#E8F0FE';
                }

                // Check executing party and municipality
                const muniStr = String(r['MUNICIPIO'] || 'N/A').trim().toUpperCase();
                const ejecStr = String(r['CONVENIANTE EJECUTOR'] || '').trim().toUpperCase();
                let muniCellContent = {};
                if (ejecStr && ejecStr !== muniStr && ejecStr !== 'N/A') {
                    muniCellContent = {
                        stack: [
                            { text: String(r['CONVENIANTE EJECUTOR']), fontSize: 7.5, bold: true },
                            { text: String(r['MUNICIPIO']), fontSize: 6.5, color: '#64748B', margin: [0, 1, 0, 0] }
                        ]
                    };
                } else {
                    muniCellContent = { text: String(r['MUNICIPIO'] || ''), fontSize: 7.5 };
                }

                tableBody.push([
                    { text: String(r['CONVENIO'] || ''), fontSize: 7.5, bold: true },
                    muniCellContent,
                    { text: String(r['SUPERVISOR'] || 'SIN ASIGNAR'), fontSize: 7 },
                    { text: sysState.label, fontSize: 7, bold: true, color: badgeColor, fillColor: badgeBg, alignment: 'center' },
                    { text: pfis.toFixed(1) + '%', fontSize: 7.5, alignment: 'right', bold: true },
                    { text: pfin.toFixed(1) + '%', fontSize: 7.5, alignment: 'right', bold: true }
                ]);
            });
        }

        // 6. Define the PDF Document
        const docDefinition = {
            pageSize: 'LETTER',
            pageOrientation: 'portrait',
            pageMargins: [35, 30, 35, 30],
            defaultStyle: {
                font: 'Poppins',
                fontSize: 8.5,
                color: '#1E293B'
            },
            content: [
                // Header Row
                {
                    columns: [
                        logoBase64 ? {
                            image: logoBase64,
                            width: 32,
                            alignment: 'left'
                        } : { text: '' },
                        {
                            stack: [
                                { text: 'GOBERNACIÓN DE ANTIOQUIA', fontSize: 10, bold: true, color: '#1A6B3C', letterSpacing: 0.5 },
                                { text: 'SECRETARÍA DE INFRAESTRUCTURA FÍSICA', fontSize: 7.5, bold: true, color: '#64748B' },
                                { text: 'Dirección de Infraestructura y Apoyo Territorial (DIAT)', fontSize: 7, color: '#94A3B8' }
                            ],
                            margin: [8, 0, 0, 0],
                            width: '*'
                        },
                        {
                            stack: [
                                { text: 'REPORTE GERENCIAL CONSOLIDADO', fontSize: 9, bold: true, color: '#1A6B3C', alignment: 'right' },
                                { text: 'RESUMEN EJECUTIVO', fontSize: 7.5, bold: true, color: '#64748B', alignment: 'right' },
                                { text: `Generado: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`, fontSize: 7, color: '#94A3B8', alignment: 'right' }
                            ],
                            width: 'auto'
                        }
                    ],
                    margin: [0, 0, 0, 8]
                },
                // Divider Line
                {
                    canvas: [{ type: 'line', x1: 0, y1: 0, x2: 542, y2: 0, lineWidth: 1.5, lineColor: '#1A6B3C' }],
                    margin: [0, 0, 0, 10]
                },
                // Active Filters Context Callout
                {
                    table: {
                        widths: ['*'],
                        body: [
                            [
                                {
                                    stack: [
                                        { text: 'FILTROS DE BÚSQUEDA ACTIVOS', fontSize: 7, bold: true, color: '#94A3B8', letterSpacing: 0.05 },
                                        { text: filtersText.toUpperCase(), bold: true, fontSize: 8, color: '#1A6B3C', margin: [0, 2, 0, 0] }
                                    ],
                                    fillColor: '#F8FAFC',
                                    border: [false, false, false, false],
                                    margin: [8, 6, 8, 6]
                                }
                            ]
                        ]
                    },
                    margin: [0, 0, 0, 10]
                },
                // KPI Summary Grid (4 columns, single row)
                {
                    columns: [
                        // Col 1: TOTAL CONVENIOS
                        {
                            table: {
                                widths: ['*'],
                                body: [
                                    [
                                        {
                                            stack: [
                                                { text: 'TOTAL CONVENIOS', fontSize: 6.5, bold: true, color: '#64748B' },
                                                { text: String(filteredData.length), fontSize: 13, bold: true, color: '#1E293B', margin: [0, 1, 0, 0] }
                                            ],
                                            fillColor: '#F8FAFC'
                                        }
                                    ]
                                ]
                            },
                            layout: {
                                hLineWidth: () => 1, vLineWidth: () => 1, hLineColor: () => '#E2E8F0', vLineColor: () => '#E2E8F0',
                                paddingLeft: () => 8, paddingRight: () => 8, paddingTop: () => 4, paddingBottom: () => 4
                            },
                            margin: [0, 0, 2, 0]
                        },
                        // Col 2: EN EJECUCIÓN
                        {
                            table: {
                                widths: ['*'],
                                body: [
                                    [
                                        {
                                            stack: [
                                                { text: 'EN EJECUCIÓN', fontSize: 6.5, bold: true, color: '#018D38' },
                                                { text: String(activos), fontSize: 13, bold: true, color: '#018D38', margin: [0, 1, 0, 0] }
                                            ],
                                            fillColor: '#E6F4EA'
                                        }
                                    ]
                                ]
                            },
                            layout: {
                                hLineWidth: () => 1, vLineWidth: () => 1, hLineColor: () => '#CEEAD6', vLineColor: () => '#CEEAD6',
                                paddingLeft: () => 8, paddingRight: () => 8, paddingTop: () => 4, paddingBottom: () => 4
                            },
                            margin: [2, 0, 2, 0]
                        },
                        // Col 3: SUSPENDIDOS
                        {
                            table: {
                                widths: ['*'],
                                body: [
                                    [
                                        {
                                            stack: [
                                                { text: 'SUSPENDIDOS', fontSize: 6.5, bold: true, color: '#C5221F' },
                                                { text: String(suspendidos), fontSize: 13, bold: true, color: '#C5221F', margin: [0, 1, 0, 0] }
                                            ],
                                            fillColor: '#FCE8E6'
                                        }
                                    ]
                                ]
                            },
                            layout: {
                                hLineWidth: () => 1, vLineWidth: () => 1, hLineColor: () => '#FAD2CF', vLineColor: () => '#FAD2CF',
                                paddingLeft: () => 8, paddingRight: () => 8, paddingTop: () => 4, paddingBottom: () => 4
                            },
                            margin: [2, 0, 2, 0]
                        },
                        // Col 4: POR LIQUIDAR
                        {
                            table: {
                                widths: ['*'],
                                body: [
                                    [
                                        {
                                            stack: [
                                                { text: 'POR LIQUIDAR', fontSize: 6.5, bold: true, color: '#C2410C' },
                                                { text: String(porLiquidar), fontSize: 13, bold: true, color: '#C2410C', margin: [0, 1, 0, 0] }
                                            ],
                                            fillColor: '#FFEFE0'
                                        }
                                    ]
                                ]
                            },
                            layout: {
                                hLineWidth: () => 1, vLineWidth: () => 1, hLineColor: () => '#FFD8A8', vLineColor: () => '#FFD8A8',
                                paddingLeft: () => 8, paddingRight: () => 8, paddingTop: () => 4, paddingBottom: () => 4
                            },
                            margin: [2, 0, 0, 0]
                        }
                    ],
                    margin: [0, 0, 0, 10]
                },
                // Mapa Territorial Vectorial de Antioquia
                mapSvgMarkup ? {
                    svg: mapSvgMarkup,
                    width: 542,
                    alignment: 'center',
                    margin: [0, 0, 0, 10]
                } : { text: '' },
                // Premium Charts Section (Alcance Vial and Comparativo Financiero side-by-side)
                chartSection,
                // Detailed Table Header
                { text: `LISTADO DETALLADO DE CONVENIOS FILTRADOS (${filteredData.length})`, fontSize: 7.5, bold: true, color: '#475569', letterSpacing: 0.5, margin: [0, 0, 0, 4] },
                // Detailed Table
                {
                    table: {
                        headerRows: 1,
                        widths: ['auto', '*', 'auto', 'auto', 70, 80],
                        body: tableBody
                    },
                    layout: {
                        hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 1 : 0.5,
                        vLineWidth: () => 0.5,
                        hLineColor: (i) => i === 0 ? '#0B5640' : '#E2E8F0',
                        vLineColor: () => '#E2E8F0',
                        paddingLeft: () => 5,
                        paddingRight: () => 5,
                        paddingTop: () => 4,
                        paddingBottom: () => 4
                    }
                },
                // Footer
                {
                    text: 'Este reporte refleja la información oficial consolidada de convenios de infraestructura de la Dirección de Apoyo Territorial DIAT. Gobernación de Antioquia Firme.',
                    fontSize: 6.5,
                    color: '#94A3B8',
                    alignment: 'center',
                    margin: [0, 15, 0, 0],
                    unbreakable: true
                }
            ]
        };

        // 7. Trigger download
        const pdfVig = getSelectValues('filter-vigencia');
        const pdfClas = getSelectValues('filter-clasificacion');
        const vigenciaStr = pdfVig.length > 0 ? pdfVig.join('_') : 'Todos';
        const clasifStr = pdfClas.length > 0 ? pdfClas.join('_') : 'Todas';
        pdfMake.createPdf(docDefinition).download(`Ficha_Resumen_Ejecutivo_${vigenciaStr}_Clasif_${clasifStr}.pdf`);

        btnPdf.innerHTML = originalText;
        btnPdf.disabled = false;

        const toast = document.getElementById('toast-notification');
        if (toast) {
            toast.classList.remove('opacity-0', 'translate-y-20');
            setTimeout(() => toast.classList.add('opacity-0', 'translate-y-20'), 3500);
        }

    } catch (err) {
        console.error('Error generando PDF de Resumen:', err);
        alert('Ocurrió un error al generar el PDF de resumen. Revisa la consola para más detalles.');
        btnPdf.innerHTML = originalText;
        btnPdf.disabled = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        const today = new Date();
        document.getElementById('fecha-actualizacion').textContent = today.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

        // Dark mode setup
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            const themeIcon = document.getElementById('theme-icon');
            if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
        }

        const btnThemeToggle = document.getElementById('btn-theme-toggle');
        if (btnThemeToggle) {
            btnThemeToggle.addEventListener('click', () => {
                const isDark = document.documentElement.classList.toggle('dark');
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
                const icon = document.getElementById('theme-icon');
                if (isDark) {
                    icon.classList.replace('fa-moon', 'fa-sun');
                } else {
                    icon.classList.replace('fa-sun', 'fa-moon');
                }

                // Redraw charts to update canvas text colors
                if (filteredData.length > 0) updateCharts();
            });
        }

        // Nav Alerts setup
        const btnNavAlerts = document.getElementById('btn-nav-alerts');
        const navAlertsDropdown = document.getElementById('nav-alerts-dropdown');
        if (btnNavAlerts && navAlertsDropdown) {
            btnNavAlerts.addEventListener('click', (e) => {
                e.stopPropagation();
                navAlertsDropdown.classList.toggle('hidden');
            });
            document.addEventListener('click', (e) => {
                if (!navAlertsDropdown.contains(e.target) && !btnNavAlerts.contains(e.target)) {
                    navAlertsDropdown.classList.add('hidden');
                }
            });
        }

        // Updates dropdown setup
        const btnUpdates = document.getElementById('btn-updates');
        const updatesDropdown = document.getElementById('updates-dropdown');
        if (btnUpdates && updatesDropdown) {
            btnUpdates.addEventListener('click', (e) => {
                e.stopPropagation();
                updatesDropdown.classList.toggle('hidden');
                navAlertsDropdown && navAlertsDropdown.classList.add('hidden');
            });
            document.addEventListener('click', (e) => {
                if (!updatesDropdown.contains(e.target) && !btnUpdates.contains(e.target)) {
                    updatesDropdown.classList.add('hidden');
                }
            });
        }

        // Helper: popula el panel de actualizaciones
        window.populateUpdatesPanel = function (changes) {
            const list = document.getElementById('updates-list');
            const badge = document.getElementById('updates-badge');
            const subtitle = document.getElementById('updates-subtitle');
            if (!list) return;
            if (badge) { badge.textContent = changes.length; badge.classList.remove('hidden'); }
            if (subtitle) subtitle.textContent = `${changes.length} actualización(es) — ${new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`;
            list.innerHTML = changes.map(c => `
                <div class="update-item">
                    <div class="update-item-badge"><i class="fa-solid fa-check"></i></div>
                    <div class="update-item-content">
                        <p class="update-item-title">${c.campo}</p>
                        <p class="update-item-desc">${c.valorNuevo}</p>
                        <p class="update-item-time">${c.fecha}</p>
                    </div>
                </div>`).join('');
        };

        document.getElementById('file-upload').addEventListener('change', handleFileUpload);

        document.getElementById('btn-reset-filters').addEventListener('click', resetFilters);
        document.getElementById('btn-close-modal').addEventListener('click', closeModal);

        document.getElementById('btn-export-pdf').addEventListener('click', () => {
            const currentConv = document.getElementById('modal-title').textContent;
            const row = rawData.find(r => String(r['CONVENIO']) === currentConv);
            if (row) generateProfessionalPDF(row);
        });

        const btnExportPlanPdf = document.getElementById('btn-export-plan-pdf');
        if (btnExportPlanPdf) {
            btnExportPlanPdf.addEventListener('click', () => {
                generatePlanPDF();
            });
        }

        const btnExportResumenPdf = document.getElementById('btn-export-resumen-pdf');
        if (btnExportResumenPdf) {
            btnExportResumenPdf.addEventListener('click', () => {
                generateResumenPDF();
            });
        }

        document.getElementById('btn-first').addEventListener('click', () => { currentPage = 1; renderTable(); });
        document.getElementById('btn-prev').addEventListener('click', () => changePage(-1));
        document.getElementById('btn-next').addEventListener('click', () => changePage(1));
        document.getElementById('btn-last').addEventListener('click', () => { currentPage = Math.ceil(filteredData.length / rowsPerPage) || 1; renderTable(); });
        document.getElementById('btn-export').addEventListener('click', exportToCSV);

        ['filter-search', 'filter-municipio', 'filter-supervisor', 'filter-indicador', 'filter-vigencia', 'filter-convenio-num', 'filter-clasificacion', 'filter-subregion', 'filter-estado'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', () => {
                    if (!window.isResettingFilters) applyFilters();
                });
                if (id === 'filter-search') {
                    el.addEventListener('input', () => {
                        if (!window.isResettingFilters) applyFilters();
                    });
                }
            }
        });

        document.getElementById('btn-close-lightbox').addEventListener('click', closeLightbox);
        document.getElementById('btn-prev-img').addEventListener('click', () => navigateLightbox(-1));
        document.getElementById('btn-next-img').addEventListener('click', () => navigateLightbox(1));
        document.getElementById('modal-detalle').addEventListener('click', function (e) { if (e.target === this) closeModal(); });
        document.getElementById('modal-lightbox').addEventListener('click', function (e) { if (e.target === this) closeLightbox(); });

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

        // --- INICIALIZAR PESTAÑAS ---
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetTab = btn.getAttribute('data-tab');

                tabBtns.forEach(b => {
                    b.classList.remove('active', 'border-institutional-primary', 'text-institutional-primary');
                    b.classList.add('border-transparent', 'text-slate-500');
                });
                btn.classList.add('active', 'border-institutional-primary', 'text-institutional-primary');
                btn.classList.remove('border-transparent', 'text-slate-500');

                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.add('hidden');
                    content.classList.remove('block');
                });

                const targetContent = document.getElementById(`tab-${targetTab}`);
                if (targetContent) {
                    targetContent.classList.remove('hidden');
                    targetContent.classList.add('block');
                }

                // Hooks para renderizar mapas o gráficos cuando la pestaña es visible
                if (targetTab === 'resumen') {
                    if (typeof initSyntheticMap === 'function') {
                        if (!synMap) {
                            initSyntheticMap();
                        } else {
                            setTimeout(() => synMap.resize(), 100);
                            updateSyntheticMap();
                        }
                    }
                } else if (targetTab === 'plan' && typeof renderPlanTab === 'function') {
                    renderPlanTab();
                } else if (targetTab === 'portal' && typeof checkAndRenderPortal === 'function') {
                    checkAndRenderPortal();
                }
            });
        });

        // --- MOBILE SIDEBAR DRAWER ---
        const btnSidebarToggle = document.getElementById('btn-sidebar-toggle');
        const sidebar = document.getElementById('main-tabs-nav');
        if (btnSidebarToggle && sidebar) {
            const overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);

            btnSidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                overlay.classList.toggle('active');
            });

            overlay.addEventListener('click', () => {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
            });

            tabBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    sidebar.classList.remove('active');
                    overlay.classList.remove('active');
                });
            });
        }

        // Evento Botón Refrescar Dashboard
        const btnRefreshDashboard = document.getElementById('btn-refresh-dashboard');
        if (btnRefreshDashboard) {
            btnRefreshDashboard.addEventListener('click', refreshDashboardData);
        }

        if (typeof initSupervisorPortal === 'function') {
            initSupervisorPortal();
        }
        loadExcelFile();
    } catch (e) { console.error("Error inicial:", e); }
});

async function refreshDashboardData() {
    const btnRefresh = document.getElementById('btn-refresh-dashboard');
    const btnIcon = document.getElementById('btn-refresh-icon');
    const btnText = document.getElementById('btn-refresh-text');
    const mainEl = document.querySelector('main');
    const mainContentContainer = document.getElementById('main-content');

    // 1. Guardar la posición de scroll actual del contenedor principal
    const savedScrollTop = mainEl ? mainEl.scrollTop : 0;

    // 2. Guardar la pestaña activa actual
    const activeTabBtn = document.querySelector('.tab-btn.active');
    const savedActiveTab = activeTabBtn ? activeTabBtn.getAttribute('data-tab') : 'resumen';

    // 3. Guardar la página de paginación de la tabla
    const savedPage = currentPage;

    // 4. Guardar los valores de todos los controles de filtro
    const filterIds = [
        'filter-search', 'filter-vigencia', 'filter-supervisor',
        'filter-indicador', 'filter-clasificacion', 'filter-municipio',
        'filter-subregion', 'filter-estado', 'filter-convenio-num'
    ];
    const savedFilters = {};
    filterIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (el.tagName === 'SELECT' && el.multiple) {
                savedFilters[id] = getSelectValues(el);
            } else {
                savedFilters[id] = el.value;
            }
        }
    });

    // 5. Estado visual de carga en el botón
    if (btnIcon) btnIcon.className = 'fa-solid fa-rotate-right fa-spin';
    if (btnText) btnText.textContent = 'Sincronizando...';
    if (btnRefresh) {
        btnRefresh.disabled = true;
        btnRefresh.classList.remove('is-success');
    }

    try {
        // 6. Recargar los datos del Excel / Google Sheets
        await loadExcelFile();

        // 7. Restaurar los valores de filtro guardados
        filterIds.forEach(id => {
            const el = document.getElementById(id);
            if (el && savedFilters[id] !== undefined) {
                if (el.tagName === 'SELECT' && el.multiple && Array.isArray(savedFilters[id])) {
                    Array.from(el.options).forEach(o => {
                        o.selected = savedFilters[id].includes(o.value);
                    });
                } else {
                    el.value = savedFilters[id];
                }
            }
        });

        // 8. Restaurar la página de la tabla y reaplicar los filtros
        currentPage = savedPage;
        applyFilters();

        // 9. Asegurar que la pestaña activa se mantenga
        if (savedActiveTab) {
            const tabBtnToSelect = document.querySelector(`.tab-btn[data-tab="${savedActiveTab}"]`);
            if (tabBtnToSelect && !tabBtnToSelect.classList.contains('active')) {
                tabBtnToSelect.click();
            }
        }

        // 10. Restaurar la posición exacta de desplazamiento vertical (scroll)
        if (mainEl) {
            requestAnimationFrame(() => {
                mainEl.scrollTop = savedScrollTop;
            });
            setTimeout(() => {
                mainEl.scrollTop = savedScrollTop;
            }, 80);
        }

        // 11. Disparar animación visual de destello en el contenido principal
        const targetAnimEl = mainContentContainer || mainEl;
        if (targetAnimEl) {
            targetAnimEl.classList.remove('refresh-flash-anim');
            void targetAnimEl.offsetWidth; // Trigger reflow
            targetAnimEl.classList.add('refresh-flash-anim');
            setTimeout(() => targetAnimEl.classList.remove('refresh-flash-anim'), 600);
        }

        // 12. Estado de Éxito Visual en el botón
        if (btnIcon) btnIcon.className = 'fa-solid fa-circle-check text-emerald-600';
        if (btnText) btnText.textContent = '¡Actualizado!';
        if (btnRefresh) btnRefresh.classList.add('is-success');

        // Notificar con Toast
        if (typeof alertToast === 'function') {
            alertToast('Dashboard Sincronizado', 'Se han actualizado los datos del Excel manteniendo tus filtros y posición.');
        }

        // Volver al estado normal del botón después de 1.8 segundos
        setTimeout(() => {
            if (btnIcon) btnIcon.className = 'fa-solid fa-rotate-right';
            if (btnText) btnText.textContent = 'Actualizar';
            if (btnRefresh) {
                btnRefresh.classList.remove('is-success');
                btnRefresh.disabled = false;
            }
        }, 1800);

    } catch (err) {
        console.error('Error al actualizar datos:', err);
        if (btnIcon) btnIcon.className = 'fa-solid fa-rotate-right';
        if (btnText) btnText.textContent = 'Actualizar';
        if (btnRefresh) btnRefresh.disabled = false;
        if (typeof alertToast === 'function') {
            alertToast('Error de Sincronización', 'No se pudieron descargar los datos frescos.', 'error');
        }
    }
}

async function loadExcelFile() {
    const sheetId = '13c4V84sj_T1ZQxoq_HLqNHxUUXINzvZJeKWVgK_H55Q';
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx&gid=1676437891&t=${Date.now()}`;
    const localUrl = './data/convenios.xlsx';

    try {
        const fechaEl = document.getElementById('fecha-actualizacion');
        if (fechaEl) fechaEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1 text-institutional-accent"></i>Sincronizando con nube...';

        let response = await fetch(sheetUrl);
        if (!response.ok) throw new Error('No se pudo conectar a Google Sheets');

        const arrayBuffer = await response.arrayBuffer();
        processExcelData(arrayBuffer);
    } catch (error) {
        console.warn('Fallo al cargar desde Google Sheets, intentando cargar archivo local...', error);
        try {
            const fallbackResponse = await fetch(localUrl);
            if (!fallbackResponse.ok) throw new Error('No se pudo cargar el archivo local');

            const arrayBuffer = await fallbackResponse.arrayBuffer();
            processExcelData(arrayBuffer);
        } catch (localError) {
            console.error('Error cargando datos:', localError);
            const fechaEl = document.getElementById('fecha-actualizacion');
            if (fechaEl) fechaEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation text-red-500 mr-1"></i>Error de conexión';
        }
    }
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => { try { processExcelData(e.target.result); } catch (err) { alert("Error: " + err.message); } };
    reader.readAsArrayBuffer(file);
}

function processExcelData(data) {
    if (typeof XLSX === 'undefined') { alert("SheetJS no cargo."); return; }
    const workbook = XLSX.read(data, { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    let json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    // Helper: find column tolerant to accents and encoding issues
    function col(row) {
        var keys = Object.keys(row);
        var norm = function (s) {
            return String(s || '').replace(/[\u00C0-\u024F]/g, function (c) {
                return c.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            }).toUpperCase().replace(/\s+/g, ' ').trim();
        };
        return function () {
            var candidates = Array.prototype.slice.call(arguments);
            for (var i = 0; i < candidates.length; i++) {
                var c = candidates[i];
                if (row[c] !== undefined && row[c] !== '') return row[c];
                var normC = norm(c);
                for (var j = 0; j < keys.length; j++) {
                    if (norm(keys[j]) === normC && row[keys[j]] !== '') return row[keys[j]];
                }
            }
            return '';
        };
    }

    rawData = json.map(function (row) {
        var c = col(row);
        var pfis = parseNum(c('% EJECUCION FISICA', '% EJECUCION FISCA'));
        if (pfis > 0 && pfis <= 1) pfis *= 100;
        var pfin = parseNum(c('% EJECUCION FINANCIERA (RECURSOS DEPARTAMENTO)', '% EJECUCION FINANCIERA'));
        if (pfin > 0 && pfin <= 1) pfin *= 100;
        var adicionDepto = parseNum(c('ADICIONES RECURSOS DEPARTAMENTO'));
        var adicionMun = parseNum(c('ADICIONES RECURSOS MUNICIPIO'));
        return Object.assign({}, row, {
            'VIGENCIA': String(c('VIGENCIA') || '').trim() || 'Sin Ano',
            'VALOR TOTAL': parseNum(c('VALOR TOTAL', 'VALOR TOTAL CON ADICIONES')),
            'APORTE DEPARTAMENTO': parseNum(c('APORTE DEPARTAMENTO')),
            'APORTE MUNICIPIO': parseNum(c('APORTE MUNICIPIO')),
            'ADICION DEPARTAMENTO': adicionDepto,
            'ADICION MUNICIPIO': adicionMun,
            'ADICIONES RECURSOS DEPARTAMENTO': adicionDepto,
            'ADICIONES RECURSOS MUNICIPIO': adicionMun,
            'VALOR TOTAL DESEMBOLSADO': parseNum(c('VALOR TOTAL DESEMBOLSADO')),
            'VALOR TOTAL AUTORIZADO': parseNum(c('VALOR TOTAL AUTORIZADO DEPARTAMENTO', 'VALOR TOTAL AUTORIZADO')),
            'VALOR TOTAL AUTORIZADO DEPARTAMENTO': parseNum(c('VALOR TOTAL AUTORIZADO DEPARTAMENTO', 'VALOR TOTAL AUTORIZADO')),
            'VIA_PRIORIZADA': c('NOMBRE VIAS PRIORIZADAS', 'NOMBRE VIAS PRIORITARIAS') || 'No especificada',
            'ALCANCE (M)': parseNum(c('ALCANCE (M)', 'ALCANCE (m)')),
            'ALCANCE (M2)': parseNum(c('ALCANCE (M2)', 'ALCANCE (m2)')),
            'LONGITUD EJECUTADA': parseNum(c('LONGITUD EJECUTADA (m)', 'LONGITUD EJECUTADA (M)', 'LONGITUD EJECUTADA')),
            'AREA EJECUTADA (M2)': parseNum(c('AREA EJECUTADA (M2)', 'AREA EJECUTADA (m2)', 'AREA EJECUTADA')),
            'LONGITUD EJECUTADA CUATRENIO': parseNum(c('LONGITUD EJECUTADA CUATRENIO(m)', 'LONGITUD EJECUTADA CUATRENIO (m)', 'LONGITUD EJECUTADA CUATRENIO (M)', 'LONGITUD EJECUTADA CUATRENIO')),
            'AREA EJECUTADA CUATRENIO (M2)': parseNum(c('AREA EJECUTADA CUATRENIO (m2)', 'AREA EJECUTADA CUATRENIO (M2)', 'AREA EJECUTADA CUATRENIO')),
            'CONVENIANTE EJECUTOR': c('CONVENIANTE EJECUTOR', 'EJECUTOR'),
            'SUBREGION': String(c('SUBREGION', 'SUBREGIÓN', 'SUB REGIÓN') || '').trim().toUpperCase(),
            'INDICADOR': String(c('INDICADOR', 'INDICADOR PLAN DE DESARROLLO') || '').trim(),
            'FISICO_NORM': pfis,
            'FINANCIERO_NORM': pfin,
            'FECHA DE ACTA DE INICIO': parseExcelDate(c('FECHA DE ACTA DE INICIO')),
            'FECHA DE SUSCRIPCION': parseExcelDate(c('FECHA DE SUSCRIPCION')),
            'FECHA DE SUSCRIPCION': parseExcelDate(c('FECHA DE SUSCRIPCION')),
            'FECHA DE TERMINACION': parseExcelDate(c('FECHA DE TERMINACION')),
            'FECHA DE TERMINACION': parseExcelDate(c('FECHA DE TERMINACION')),
            'NUEVA FECHA DE TERMINACION': parseExcelDate(c('NUEVA FECHA DE TERMINACION')),
            'NUEVA FECHA DE TERMINACION': parseExcelDate(c('NUEVA FECHA DE TERMINACION')),
            'PRORROGA (MESES)': parseNum(c('PRORROGA (MESES)')),
            'SUSPENSION(MESES)': parseNum(c('SUSPENSION(MESES)', 'SUSPENSION (MESES)'))
        });
    });

    // Parche: Si es vigencia 2025 y el convenio dice 24AS, cambiar a 25AS
    rawData.forEach(r => {
        if (r['VIGENCIA'] === '2025' && String(r['CONVENIO']).startsWith('24AS')) {
            r['CONVENIO'] = String(r['CONVENIO']).replace('24AS', '25AS');
        }
    });

    // Guardar copia de base de datos Excel e integrar cambios de localStorage
    window.baseExcelData = JSON.parse(JSON.stringify(rawData));
    if (window.DIATDataService) {
        rawData = window.DIATDataService.mergeData(window.baseExcelData);
    }

    const welcomeScreen = document.getElementById('welcome-screen');
    if (welcomeScreen) welcomeScreen.style.display = 'none';
    const loader = document.getElementById('dashboard-loader');
    if (loader) loader.style.display = 'none';
    const appLayout = document.getElementById('app-layout');
    if (appLayout) appLayout.style.display = 'flex';
    const mainTabsNav = document.getElementById('main-tabs-nav');
    if (mainTabsNav) mainTabsNav.style.display = 'flex';
    const mainContent = document.getElementById('main-content');
    if (mainContent) mainContent.style.display = 'block';

    // Asignar subregión por defecto si está vacía
    rawData.forEach(r => {
        if (!r['SUBREGION']) {
            const m = String(r['MUNICIPIO']).toUpperCase().trim();
            for (const [sub, munis] of Object.entries(antioquiaSubregiones)) {
                if (munis.includes(m)) {
                    r['SUBREGION'] = sub;
                    break;
                }
            }
            if (!r['SUBREGION']) r['SUBREGION'] = 'OTRAS / NO DEFINIDA';
        }
    });

    applyFilters();

    const today = new Date();
    const fechaEl = document.getElementById('fecha-actualizacion');
    if (fechaEl) {
        fechaEl.textContent = today.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    // Poblar panel de actualizaciones con info de la carga
    if (typeof window.populateUpdatesPanel === 'function') {
        const updateInfo = [{
            convenio: 'SISTEMA',
            fecha: today.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
            supervisor: `${rawData.length} convenios cargados`,
            campo: 'Datos actualizados desde Google Sheets',
            valorAnterior: 'Archivo local',
            valorNuevo: `${rawData.length} registros activos`
        }];
        window.populateUpdatesPanel(updateInfo);
    }
}

function updateFilterOptions(currentSearch, currentVigencia, currentMunicipio, currentSupervisor, currentConvenioNum, currentClasificacion, currentIndicador, currentSubregion, currentEstado) {
    const getValidOptions = (field, excludeField) => {
        const validRows = rawData.filter(row => {
            const rowSearch = Object.values(row).map(v => String(v || '').toLowerCase()).join(' ');
            const matchSearch = !currentSearch || rowSearch.includes(currentSearch);
            const matchVig = excludeField === 'VIGENCIA' ? true : (currentVigencia.length === 0 || currentVigencia.includes(String(row['VIGENCIA'] || '').trim()));
            const matchMun = excludeField === 'MUNICIPIO' ? true : (currentMunicipio.length === 0 || currentMunicipio.includes(String(row['MUNICIPIO'] || '').trim()));
            const matchSup = excludeField === 'SUPERVISOR' ? true : (currentSupervisor.length === 0 || currentSupervisor.includes(String(row['SUPERVISOR'] || '').trim()));
            const matchConv = excludeField === 'CONVENIO' ? true : (currentConvenioNum.length === 0 || currentConvenioNum.includes(String(row['CONVENIO'] || '').trim()));
            const clasifValue = String(row['CLASIFICACIÓN'] || row['CLASIFICACI"N'] || '').trim();
            const matchClasif = excludeField === 'CLASIFICACIÓN' ? true : (currentClasificacion.length === 0 || currentClasificacion.includes(clasifValue));
            const matchInd = excludeField === 'INDICADOR' ? true : (currentIndicador.length === 0 || currentIndicador.includes(String(row['INDICADOR'] || '').trim()));
            const matchSub = excludeField === 'SUBREGION' ? true : (currentSubregion.length === 0 || currentSubregion.includes(String(row['SUBREGION'] || '').trim()));
            const matchEst = excludeField === 'ESTADO CONVENIO' ? true : (currentEstado.length === 0 || currentEstado.includes(String(row['ESTADO CONVENIO'] || '').trim()));
            return matchSearch && matchVig && matchMun && matchSup && matchConv && matchClasif && matchInd && matchSub && matchEst;
        });
        return [...new Set(validRows.map(i => {
            if (field === 'CLASIFICACIÓN') return String(i['CLASIFICACIÓN'] || i['CLASIFICACI"N'] || '').trim();
            return String(i[field] || '').trim();
        }).filter(Boolean))].sort();
    };
    const updateSelect = (id, options, currentValues) => {
        const select = document.getElementById(id);
        if (!select) return;
        const validValues = currentValues.filter(v => options.includes(v));
        select.innerHTML = '<option value="">Todos</option>' + options.map(v => {
            const isSel = validValues.includes(v) ? 'selected' : '';
            return `<option value="${v}" ${isSel}>${v}</option>`;
        }).join('');
        Array.from(select.options).forEach(opt => {
            opt.selected = validValues.includes(opt.value);
        });
    };
    updateSelect('filter-vigencia', getValidOptions('VIGENCIA', 'VIGENCIA').reverse(), currentVigencia);
    updateSelect('filter-municipio', getValidOptions('MUNICIPIO', 'MUNICIPIO'), currentMunicipio);
    updateSelect('filter-supervisor', getValidOptions('SUPERVISOR', 'SUPERVISOR'), currentSupervisor);
    updateSelect('filter-indicador', getValidOptions('INDICADOR', 'INDICADOR'), currentIndicador);
    updateSelect('filter-convenio-num', getValidOptions('CONVENIO', 'CONVENIO'), currentConvenioNum);
    updateSelect('filter-clasificacion', getValidOptions('CLASIFICACIÓN', 'CLASIFICACIÓN'), currentClasificacion);
    updateSelect('filter-subregion', getValidOptions('SUBREGION', 'SUBREGION'), currentSubregion);
    updateSelect('filter-estado', getValidOptions('ESTADO CONVENIO', 'ESTADO CONVENIO'), currentEstado);
}

let summaryMap = null;

async function renderSummaryMiniMap(row) {
    const container = document.getElementById('summary-map');
    const overlay = document.getElementById('summary-map-overlay');
    const msg = document.getElementById('summary-map-msg');
    if (!container || !row) return;

    const convNum = String(row['CONVENIO'] || '').trim();
    if (overlay) overlay.style.display = 'flex';
    if (msg) msg.innerHTML = `<i class="fa-solid fa-satellite-dish fa-fade" style="color:#018D38;"></i> Ubicando trazado...`;

    try {
        if (!summaryMap) {
            summaryMap = new maplibregl.Map({
                container: 'summary-map',
                center: [-75.55, 6.85],
                zoom: 8,
                pitch: 0,
                attributionControl: false
            });
            summaryMap.setStyle('https://tiles.openfreemap.org/styles/positron');
        } else {
            summaryMap.resize();
        }

        const mapData = await loadMapData(convNum);
        let geojson = null;
        if (mapData) {
            if (mapData.type === 'kml') {
                const feats = parseKMLStringToGeoJSON(mapData.data, convNum);
                if (feats && feats.length > 0) {
                    geojson = { type: 'FeatureCollection', features: feats };
                }
            } else if (mapData.type === 'geojson') {
                geojson = mapData.data;
            }
        }

        const applyData = () => {
            if (!summaryMap) return;
            if (summaryMap.getSource('summary-kml-src')) {
                summaryMap.getSource('summary-kml-src').setData(geojson || { type: 'FeatureCollection', features: [] });
            } else {
                summaryMap.addSource('summary-kml-src', {
                    type: 'geojson',
                    data: geojson || { type: 'FeatureCollection', features: [] }
                });
                summaryMap.addLayer({
                    id: 'summary-kml-line',
                    type: 'line',
                    source: 'summary-kml-src',
                    paint: {
                        'line-color': '#0B5640',
                        'line-width': 4.5
                    }
                });
                summaryMap.addLayer({
                    id: 'summary-kml-points',
                    type: 'circle',
                    source: 'summary-kml-src',
                    filter: ['==', '$type', 'Point'],
                    paint: {
                        'circle-color': '#00FF88',
                        'circle-radius': 6,
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#032B18'
                    }
                });
            }

            if (geojson && typeof turf !== 'undefined') {
                try {
                    const bbox = turf.bbox(geojson);
                    if (isFinite(bbox[0]) && isFinite(bbox[1]) && isFinite(bbox[2]) && isFinite(bbox[3])) {
                        summaryMap.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]], {
                            padding: { top: 25, bottom: 25, left: 25, right: 25 },
                            maxZoom: 14,
                            duration: 500
                        });
                        if (overlay) overlay.style.display = 'none';
                        return;
                    }
                } catch (err) { }
            }

            const lat = parseFloat(row['LATITUD']), lng = parseFloat(row['LONGITUD']);
            if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)) {
                summaryMap.flyTo({ center: [lng, lat], zoom: 12, duration: 500 });
                if (overlay) overlay.style.display = 'none';
            } else {
                if (msg) msg.innerHTML = `<i class="fa-solid fa-map-pin" style="color:#94A3B8;"></i> Sin trazado espacial`;
                setTimeout(() => { if (overlay) overlay.style.display = 'none'; }, 800);
            }
        };

        if (summaryMap.isStyleLoaded()) {
            applyData();
        } else {
            summaryMap.once('load', applyData);
        }
    } catch (e) {
        if (overlay) overlay.style.display = 'none';
    }
}

window.showSummaryCard = function (conv) {
    if (!conv) return;
    const cleanConv = String(conv).trim();

    // 1. Si no está en la pestaña resumen, cambiar a ella
    const resumenTabBtn = document.querySelector('.tab-btn[data-tab="resumen"]');
    if (resumenTabBtn && !resumenTabBtn.classList.contains('active')) {
        resumenTabBtn.click();
    }

    // 2. Limpiar buscador general
    const searchInput = document.getElementById('filter-search');
    if (searchInput) searchInput.value = '';

    window.isResettingFilters = true;

    // 3. Resetear otros filtros para evitar colisiones
    ['filter-vigencia', 'filter-supervisor', 'filter-indicador', 'filter-clasificacion', 'filter-municipio', 'filter-subregion', 'filter-estado'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (el.tagName === 'SELECT' && el.multiple) {
                Array.from(el.options).forEach(o => o.selected = false);
            } else {
                el.value = '';
            }
            el.dispatchEvent(new Event('change'));
        }
    });

    // 4. Asegurar y seleccionar en filter-convenio-num
    const convSelect = document.getElementById('filter-convenio-num');
    if (convSelect) {
        const allConvs = Array.from(new Set(rawData.map(r => String(r['CONVENIO'] || '').trim()).filter(Boolean))).sort();
        convSelect.innerHTML = '<option value="">Todos</option>' + allConvs.map(c => `<option value="${c}" ${c === cleanConv ? 'selected' : ''}>${c}</option>`).join('');
        Array.from(convSelect.options).forEach(o => {
            o.selected = (o.value.trim() === cleanConv);
        });
        convSelect.dispatchEvent(new Event('change'));
    }

    window.isResettingFilters = false;

    // 5. Aplicar filtros en todo el sitio
    applyFilters();

    // 6. Scroll fluido hacia el Summary Card
    setTimeout(() => {
        const summaryCard = document.getElementById('summary-card-container');
        if (summaryCard && !summaryCard.classList.contains('hidden')) {
            summaryCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 150);

    // 7. Cerrar dropdown de alertas de navbar si estuviese abierto
    const drop = document.getElementById('nav-alerts-dropdown');
    if (drop) drop.classList.add('hidden');
};

window.hideSummaryCard = function () {
    window.isResettingFilters = true;
    const convSelect = document.getElementById('filter-convenio-num');
    if (convSelect) {
        Array.from(convSelect.options).forEach(o => o.selected = false);
        if (convSelect.options[0]) convSelect.options[0].selected = true;
        convSelect.dispatchEvent(new Event('change'));
    }
    window.isResettingFilters = false;

    const card = document.getElementById('summary-card-container');
    if (card) card.classList.add('hidden');
    const tlCont = document.getElementById('timeline-container');
    if (tlCont) tlCont.classList.add('hidden');

    applyFilters();
};

function applyFilters() {
    const search = document.getElementById('filter-search')?.value.toLowerCase().trim() || '';
    const vigencia = getSelectValues('filter-vigencia');
    const municipio = getSelectValues('filter-municipio');
    const supervisor = getSelectValues('filter-supervisor');
    const indicador = getSelectValues('filter-indicador');
    const convenioNum = getSelectValues('filter-convenio-num');
    const clasificacion = getSelectValues('filter-clasificacion');
    const estado = getSelectValues('filter-estado');
    const subregion = getSelectValues('filter-subregion');

    const activeFiltersCount = [
        search !== '',
        vigencia.length > 0,
        municipio.length > 0,
        supervisor.length > 0,
        indicador.length > 0,
        convenioNum.length > 0,
        clasificacion.length > 0,
        estado.length > 0,
        subregion.length > 0
    ].filter(Boolean).length;

    const badge = document.getElementById('active-filters-badge');
    if (badge) {
        if (activeFiltersCount > 0) {
            badge.textContent = `${activeFiltersCount} activo${activeFiltersCount > 1 ? 's' : ''}`;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    filteredData = rawData.filter(row => {
        const rowValsStr = Object.values(row).map(v => String(v || '').toLowerCase()).join(' ');
        const matchSearch = !search || rowValsStr.includes(search);
        const matchVig = vigencia.length === 0 || vigencia.includes(String(row['VIGENCIA'] || '').trim());
        const matchMun = municipio.length === 0 || municipio.includes(String(row['MUNICIPIO'] || '').trim());
        const matchSup = supervisor.length === 0 || supervisor.includes(String(row['SUPERVISOR'] || '').trim());
        const matchInd = indicador.length === 0 || indicador.includes(String(row['INDICADOR'] || '').trim());
        const matchConv = convenioNum.length === 0 || convenioNum.includes(String(row['CONVENIO'] || '').trim());
        const clasifValue = String(row['CLASIFICACIÓN'] || row['CLASIFICACI"N'] || '').trim();
        const matchClasif = clasificacion.length === 0 || clasificacion.includes(clasifValue);
        const matchEstado = estado.length === 0 || estado.includes(String(row['ESTADO CONVENIO'] || '').trim());
        const matchSub = subregion.length === 0 || subregion.includes(String(row['SUBREGION'] || '').trim());
        return matchSearch && matchVig && matchMun && matchSup && matchInd && matchConv && matchClasif && matchEstado && matchSub;
    });

    updateFilterOptions(search, vigencia, municipio, supervisor, convenioNum, clasificacion, indicador, subregion, estado);

    const summaryCard = document.getElementById('summary-card-container');
    const activeConv = convenioNum.length === 1 ? convenioNum[0] : '';

    if (activeConv && filteredData.length > 0) {
        const selected = filteredData[0];
        const sysState = getSystemState(selected['ESTADO CONVENIO']);

        // Badges y Títulos
        const estBadge = document.getElementById('summary-estado-badge');
        if (estBadge) {
            estBadge.textContent = sysState.label;
            estBadge.className = `px-2.5 py-0.5 rounded-full font-bold text-[10px] tracking-wide uppercase ${sysState.badgeClass}`;
        }
        const subBadge = document.getElementById('summary-subregion-badge');
        if (subBadge) {
            subBadge.textContent = selected['SUBREGION'] || 'ANTIOQUIA';
        }
        const titleEl = document.getElementById('summary-convenio-title');
        if (titleEl) {
            titleEl.textContent = `Convenio ${selected['CONVENIO'] || 'S/N'}`;
        }

        const muniTxt = document.getElementById('summary-municipio-txt');
        if (muniTxt) {
            const mSpan = muniTxt.querySelector('span');
            const muniStr = selected['MUNICIPIO'] || 'N/A';
            const ejecStr = String(selected['CONVENIANTE EJECUTOR'] || '').trim().toUpperCase();
            if (ejecStr && ejecStr !== muniStr.trim().toUpperCase() && ejecStr !== 'N/A') {
                if (mSpan) mSpan.textContent = `${muniStr} (Ejecutor: ${selected['CONVENIANTE EJECUTOR']})`;
                else muniTxt.textContent = `${muniStr} (Ejecutor: ${selected['CONVENIANTE EJECUTOR']})`;
            } else {
                if (mSpan) mSpan.textContent = muniStr;
                else muniTxt.textContent = muniStr;
            }
        }

        const objetoEl = document.getElementById('summary-objeto');
        if (objetoEl) {
            objetoEl.textContent = selected['OBJETO'] || 'Sin descripción u objeto registrado.';
            objetoEl.title = selected['OBJETO'] || '';
        }

        const invEl = document.getElementById('summary-inversion');
        if (invEl) {
            invEl.textContent = formatCurrency(selected['VALOR TOTAL'] || selected['APORTE DEPARTAMENTO'] || 0);
        }

        const btnFicha = document.getElementById('summary-btn-detalle');
        if (btnFicha) {
            btnFicha.setAttribute('onclick', `openModal(${JSON.stringify(selected).replace(/'/g, "&#39;")})`);
        }

        // Tipo / Indicador
        const tipoTxt = document.getElementById('summary-tipo-txt');
        if (tipoTxt) {
            tipoTxt.textContent = selected['INDICADOR'] || selected['CLASIFICACIÓN'] || 'Obra Vial';
        }

        const alcM = getRowLongitudContratada(selected);
        const alcM2 = getRowAreaContratada(selected);
        const ejM = getRowLongitudEjecutada(selected);
        const ejM2 = getRowAreaEjecutada(selected);

        const lblAlc = document.getElementById('lbl-alcance');
        const valAlc = document.getElementById('summary-alcance');
        const unitAlc = document.getElementById('unit-alcance');
        const lblEje = document.getElementById('lbl-ejecutado');
        const valEje = document.getElementById('summary-ejecutado');
        const unitEje = document.getElementById('unit-ejecutado');

        if (alcM2 > 0 && alcM === 0) {
            if (lblAlc) lblAlc.textContent = "Área Contratada";
            if (valAlc) valAlc.textContent = formatNumber(alcM2);
            if (unitAlc) unitAlc.textContent = "m²";
            if (lblEje) lblEje.textContent = "Área Ejecutada";
            if (valEje) valEje.textContent = formatNumber(ejM2);
            if (unitEje) unitEje.textContent = "m²";
        } else {
            if (lblAlc) lblAlc.textContent = "Longitud Contratada";
            if (valAlc) valAlc.textContent = (alcM / 1000).toFixed(2);
            if (unitAlc) unitAlc.textContent = "km";
            if (lblEje) lblEje.textContent = "Longitud Ejecutada";
            if (valEje) valEje.textContent = (ejM / 1000).toFixed(2);
            if (unitEje) unitEje.textContent = "km";
        }

        if (summaryCard) summaryCard.classList.remove('hidden');

        // Render mini mapa del convenio
        renderSummaryMiniMap(selected);

        // Render Timeline legal si aplica
        renderTimeline(selected);
    } else {
        if (summaryCard) summaryCard.classList.add('hidden');
        const tlCont = document.getElementById('timeline-container');
        if (tlCont) tlCont.classList.add('hidden');
    }
    currentPage = 1;
    updateDashboard();
}

function resetFilters() {
    window.isResettingFilters = true;
    ['filter-search', 'filter-vigencia', 'filter-supervisor', 'filter-indicador', 'filter-municipio', 'filter-convenio-num', 'filter-clasificacion', 'filter-subregion', 'filter-estado'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (el.tagName === 'SELECT' && el.multiple) {
                Array.from(el.options).forEach(o => o.selected = false);
            } else {
                el.value = '';
            }
            el.dispatchEvent(new Event('change'));
        }
    });
    window.isResettingFilters = false;
    applyFilters();
}

function updateDashboard() {
    updateKPIs();
    renderTable();
    updateCharts();
    updateTerritorialCharts();
    renderAlerts();
    if (typeof updateSyntheticMap === 'function') {
        updateSyntheticMap();
    }
}

function updateKPIs() {
    let activos = 0, porLiquidar = 0, sumInv = 0, sumDes = 0, sumAut = 0;
    let totLonCon = 0, totLonEje = 0, totAreCon = 0, totAreEje = 0;

    filteredData.forEach(r => {
        const est = String(r['ESTADO CONVENIO']).toLowerCase();
        if (est.includes('ejecuci')) activos++;  // tolera ejecucin / ejecucion
        if (est.includes('por liquidar')) porLiquidar++;
        sumInv += (r['APORTE DEPARTAMENTO'] || 0) + (r['ADICION DEPARTAMENTO'] || 0);
        sumDes += r['VALOR TOTAL DESEMBOLSADO'] || 0;
        sumAut += r['VALOR TOTAL AUTORIZADO'] || 0;

        totLonCon += getRowLongitudContratada(r);
        totLonEje += getRowLongitudEjecutada(r);
        totAreCon += getRowAreaContratada(r);
        totAreEje += getRowAreaEjecutada(r);
    });

    document.getElementById('kpi-total').textContent = filteredData.length;
    document.getElementById('kpi-activos').textContent = activos;
    document.getElementById('kpi-por-liquidar').textContent = porLiquidar;

    // Municipios y Subregiones Impactadas
    const impactedMunis = new Set(filteredData.map(r => String(r['MUNICIPIO'] || '').trim().toUpperCase()).filter(Boolean));
    const elMunis = document.getElementById('kpi-municipios');
    if (elMunis) elMunis.textContent = impactedMunis.size;

    const impactedSubs = new Set(filteredData.map(r => String(r['SUBREGION'] || r['SUBREGIÓN'] || '').trim().toUpperCase()).filter(Boolean));
    const elSubs = document.getElementById('kpi-subregiones');
    if (elSubs) elSubs.textContent = impactedSubs.size;

    // Gráfico de Barras Financiero
    const elInv = document.getElementById('kpi-inversion');
    if (elInv) {
        elInv.textContent = formatCurrency(sumInv);
        elInv.title = formatCurrency(sumInv);
    }
    const elDes = document.getElementById('kpi-desembolsado');
    if (elDes) {
        elDes.textContent = formatCurrency(sumDes);
        elDes.title = formatCurrency(sumDes);
    }
    const elAut = document.getElementById('kpi-autorizado');
    if (elAut) {
        elAut.textContent = formatCurrency(sumAut);
        elAut.title = formatCurrency(sumAut);
    }

    const maxFin = Math.max(sumInv, sumDes, sumAut, 1);
    const barInv = document.getElementById('fin-bar-inversion');
    if (barInv) barInv.style.width = Math.min(100, Math.round((sumInv / maxFin) * 100)) + '%';

    const barDes = document.getElementById('fin-bar-desembolsado');
    if (barDes) barDes.style.width = Math.min(100, Math.round((sumDes / maxFin) * 100)) + '%';

    const pctDes = document.getElementById('fin-pct-desembolsado');
    if (pctDes) pctDes.textContent = (sumInv > 0 ? ((sumDes / sumInv) * 100).toFixed(1) : 0) + '%';

    const barAut = document.getElementById('fin-bar-autorizado');
    if (barAut) barAut.style.width = Math.min(100, Math.round((sumAut / maxFin) * 100)) + '%';

    const pctAut = document.getElementById('fin-pct-autorizado');
    if (pctAut) pctAut.textContent = (sumInv > 0 ? ((sumAut / sumInv) * 100).toFixed(1) : 0) + '%';

    // Physical Execution Totals (New Graphic Scheme)

    // Update Longitud
    const elLonEje = document.getElementById('tot-lon-eje-text');
    if (elLonEje) elLonEje.textContent = (totLonEje / 1000).toFixed(2) + ' km';

    const elLonCon = document.getElementById('tot-lon-con-text');
    if (elLonCon) elLonCon.textContent = (totLonCon / 1000).toFixed(2) + ' km';

    // Update Área
    const elAreEje = document.getElementById('tot-are-eje-text');
    if (elAreEje) elAreEje.textContent = formatNumber(totAreEje) + ' m²';

    const elAreCon = document.getElementById('tot-are-con-text');
    if (elAreCon) elAreCon.textContent = formatNumber(totAreCon);
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
        tr.className = 'table-row-hover cursor-pointer';
        tr.style.borderBottom = '1px solid #F1F5F9';
        tr.setAttribute('onclick', `if(!event.target.closest('button')) showSummaryCard('${row['CONVENIO']}')`);

        const sysState = getSystemState(row['ESTADO CONVENIO']);
        const estStr = String(row['ESTADO CONVENIO'] || '').toLowerCase();

        // Alertas automáticas
        let alertIcon = '';
        let warnings = [];

        if (!estStr.includes('liquidado') && !estStr.includes('resciliado')) {
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
        }

        let municipioColHTML = '';
        const municipioStrRow = String(row['MUNICIPIO'] || 'N/A').trim().toUpperCase();
        const ejecutorStrRow = String(row['CONVENIANTE EJECUTOR'] || '').trim().toUpperCase();
        if (ejecutorStrRow && ejecutorStrRow !== municipioStrRow && ejecutorStrRow !== 'N/A') {
            municipioColHTML = `
                <div style="font-size:11px;font-weight:700;color:#0F172A;line-height:1.2;" title="Conveniente Ejecutor">${row['CONVENIANTE EJECUTOR']}</div>
                <span style="display:block;margin-top:3px;font-size:9px;font-weight:700;color:#94A3B8;text-transform:uppercase;" title="Municipio">
                    <i class="fa-solid fa-location-dot" style="margin-right:3px;"></i>${row['MUNICIPIO'] || 'N/A'}
                </span>
            `;
        } else {
            municipioColHTML = `<span class="municipio-chip">${row['MUNICIPIO'] || 'N/A'}</span>`;
        }

        tr.innerHTML = `
            <td class="px-5 py-3">
                <div style="display:flex;align-items:center;gap:4px;">
                    <span style="font-weight:900;font-size:14px;color:#0F172A;">${row['CONVENIO'] || 'S/N'}</span>
                    ${alertIcon}
                </div>
            </td>
            <td class="px-5 py-3">
                ${municipioColHTML}
            </td>
            <td class="px-5 py-3">
                <div style="width:200px;">
                    <p style="font-size:11px;font-weight:700;color:#0F172A;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${row['INDICADOR'] || '-'}">${row['INDICADOR'] || '-'}</p>
                    <p style="font-size:9px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.08em;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${row['CLASIFICACIÓN'] || row['CLASIFICACI"N'] || '-'}</p>
                </div>
            </td>
            <td class="px-5 py-3">
                <div style="font-size:10px;font-weight:700;color:#64748B;min-width:120px;max-width:200px;white-space:normal;" title="${row['SUPERVISOR'] || row['NOMBRE SUPERVISOR'] || '-'}">${row['SUPERVISOR'] || row['NOMBRE SUPERVISOR'] || '-'}</div>
            </td>
            <td class="px-5 py-3">
                <span class="badge-estado ${sysState.badgeClass}">${sysState.label}</span>
            </td>
            <td class="px-5 py-3">
                <div style="display:flex;flex-direction:column;gap:5px;">
                    <span style="font-size:10px;font-weight:800;color:#0F172A;">${row['FISICO_NORM'].toFixed(1)}%</span>
                    <div class="progress-track"><div class="progress-fisico" style="width: ${Math.min(row['FISICO_NORM'], 100)}%"></div></div>
                </div>
            </td>
            <td class="px-5 py-3">
                <div style="display:flex;flex-direction:column;gap:5px;">
                    <span style="font-size:10px;font-weight:800;color:#0F172A;">${row['FINANCIERO_NORM'].toFixed(1)}%</span>
                    <div class="progress-track"><div class="progress-financiero" style="width: ${Math.min(row['FINANCIERO_NORM'], 100)}%"></div></div>
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

    const maxPage = Math.ceil(filteredData.length / rowsPerPage) || 1;
    document.getElementById('btn-first').disabled = currentPage === 1;
    document.getElementById('btn-prev').disabled = currentPage === 1;
    document.getElementById('btn-next').disabled = currentPage >= maxPage;
    document.getElementById('btn-last').disabled = currentPage >= maxPage;
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
        if (est.toLowerCase().includes('liquidado') || est.toLowerCase().includes('resciliado')) return;

        const conv = row['CONVENIO'] || 'S/N';
        const mun = row['MUNICIPIO'] || 'N/A';
        const fisico = row['FISICO_NORM'] || 0;
        const financiero = row['FINANCIERO_NORM'] || 0;
        const desembolsado = row['VALOR TOTAL DESEMBOLSADO'] || 0;
        const suspMeses = row['SUSPENSION(MESES)'] || row['SUSPENSI�N(MESES)'] || 0;
        const tieneFotos = String(row['TIENE_FOTOS'] || 'SI').toUpperCase();

        let termStr = row['NUEVA FECHA DE TERMINACION'] || row['NUEVA FECHA DE TERMINACI�N'] || row['FECHA DE TERMINACION'] || row['FECHA DE TERMINACI�N'];
        let termDate = parseCOPDate(termStr);

        // 0. Próximos a terminar (<= 30 días)
        if (termDate && termDate >= today) {
            const msLeft = termDate.getTime() - today.getTime();
            const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

            if (daysLeft <= 30) {
                alerts.push({
                    type: 'proximos', icon: 'fa-hourglass-half',
                    title: 'Próximo a Terminar',
                    desc: `Faltan ${daysLeft} ${daysLeft === 1 ? 'día' : 'días'} para su fecha de terminación (${termStr}).`,
                    conv, mun,
                    _sortVal: daysLeft  // menor = más urgente
                });
            }
        }

        // 1. Riesgo de pérdida de competencia (Límite 30 meses)
        if (termDate && termDate < today) {
            const msPassed = today.getTime() - termDate.getTime();
            const monthsPassed = msPassed / (1000 * 60 * 60 * 24 * 30.436875);
            const daysPassed = msPassed / (1000 * 60 * 60 * 24);

            if (monthsPassed >= 24) {
                const limitDate = new Date(termDate);
                limitDate.setMonth(limitDate.getMonth() + 30);
                const limitStr = `${String(limitDate.getDate()).padStart(2, '0')}/${String(limitDate.getMonth() + 1).padStart(2, '0')}/${limitDate.getFullYear()}`;
                const monthsLeft = 30 - monthsPassed;
                const monthsLeftFixed = monthsLeft.toFixed(1);
                const superado = monthsLeft <= 0;
                const faltanTxt = !superado
                    ? `<strong style="color:#991B1B;">¡Faltan ${monthsLeftFixed} meses para perder competencia!</strong>`
                    : `<strong style="color:#7F1D1D;">⚠ Límite superado por ${Math.abs(monthsLeftFixed)} meses</strong>`;
                alerts.push({
                    type: 'competencia', icon: 'fa-gavel fa-beat-fade',
                    title: superado ? '🔴 Competencia Perdida' : 'Riesgo: Pérdida de Competencia',
                    desc: `Finalizó el ${termStr}. Límite legal: 30 meses (${limitStr}). ${faltanTxt}`,
                    conv, mun,
                    _sortVal: monthsLeft  // negativo = ya superó límite (máxima urgencia), positivo = faltan X meses
                });
            } else {
                alerts.push({
                    type: 'vencido', icon: 'fa-calendar-xmark',
                    title: 'Vencido sin liquidar',
                    desc: `Finalizó el ${termStr} y sigue en ${est}. (${monthsPassed.toFixed(1)} meses vencido)`,
                    conv, mun,
                    _sortVal: daysPassed  // mayor = vencido hace más tiempo
                });
            }
        }

        // 2. Pagos adelantados (Desfase > 15%)
        if (financiero > fisico + 15) {
            alerts.push({
                type: 'desfase', icon: 'fa-money-bill-trend-up',
                title: 'Desfase Financiero Crítico',
                desc: `Financiero (${financiero.toFixed(1)}%) supera al físico (${fisico.toFixed(1)}%) por >15%.`,
                conv, mun
            });
        }

        // 3. Sin evidencia
        if (tieneFotos === 'NO') {
            alerts.push({
                type: 'vencido', icon: 'fa-camera-slash',
                title: 'Sin Evidencia Fotográfica',
                desc: `No hay registro fotográfico cargado en el sistema.`,
                conv, mun
            });
        }

        // 4. Suspensión crítica (>= 3 meses)
        if (est.toLowerCase().includes('suspendido') && suspMeses >= 3) {
            alerts.push({
                type: 'suspension', icon: 'fa-pause',
                title: 'Suspensión Prolongada',
                desc: `Acumula ${suspMeses} meses de suspensión.`,
                conv, mun,
                _sortVal: suspMeses
            });
        }

        // 5. Sin desembolsar estando en ejecución
        if (est.toLowerCase().includes('ejecución') && desembolsado === 0) {
            alerts.push({
                type: 'desfase', icon: 'fa-triangle-exclamation',
                title: 'Cero Desembolsos en Ejecución',
                desc: `En ejecución pero no hay pagos registrados ($0).`,
                conv, mun
            });
        }
    });

    // ── ORDENAMIENTO POR URGENCIA ─────────────────────────────────────────
    // Prioridad de tipo:
    //   1 = competencia (pérdida de competencia — MÁXIMA PRIORIDAD)
    //   2 = suspension  (suspensiones prolongadas)
    //   3 = proximos    (próximos a terminar)
    //   4 = vencido     (vencidos sin liquidar)
    //   5 = desfase / otros
    const typePriority = { competencia: 1, suspension: 2, proximos: 3, vencido: 4, desfase: 5 };

    alerts.sort((a, b) => {
        const pa = typePriority[a.type] ?? 9;
        const pb = typePriority[b.type] ?? 9;

        // Primero ordenar por tipo de prioridad
        if (pa !== pb) return pa - pb;

        // Dentro de "competencia": los que ya superaron el límite van primero (sortVal negativo = superado)
        // luego los que están más cerca de superarlo (menor sortVal primero)
        if (a.type === 'competencia' && b.type === 'competencia') {
            return (a._sortVal ?? 0) - (b._sortVal ?? 0);
        }

        // Dentro de "suspension": mayor tiempo suspendido primero
        if (a.type === 'suspension' && b.type === 'suspension') {
            return (b._sortVal ?? 0) - (a._sortVal ?? 0);
        }

        // Dentro de "proximos": los que tienen menos días restantes van primero
        if (a.type === 'proximos' && b.type === 'proximos') {
            return (a._sortVal ?? 999) - (b._sortVal ?? 999);
        }

        // Dentro de "vencido": los vencidos hace más tiempo van primero
        if (a.type === 'vencido' && b.type === 'vencido') {
            return (b._sortVal ?? 0) - (a._sortVal ?? 0);
        }

        return 0;
    });

    const finalAlerts = currentAlertFilter === 'all' ? alerts : alerts.filter(a => a.type === currentAlertFilter);
    countSpan.textContent = finalAlerts.length;

    // Actualizar dinámicamente el contador en los botones de filtro
    const countAll = alerts.length;
    const countCompetencia = alerts.filter(a => a.type === 'competencia').length;
    const countSuspension = alerts.filter(a => a.type === 'suspension').length;
    const countProximos = alerts.filter(a => a.type === 'proximos').length;
    const countVencido = alerts.filter(a => a.type === 'vencido').length;

    const btnAll = document.querySelector('.alert-filter-btn[data-filter="all"]');
    const btnCompetencia = document.querySelector('.alert-filter-btn[data-filter="competencia"]');
    const btnSuspension = document.querySelector('.alert-filter-btn[data-filter="suspension"]');
    const btnProximos = document.querySelector('.alert-filter-btn[data-filter="proximos"]');
    const btnVencido = document.querySelector('.alert-filter-btn[data-filter="vencido"]');

    if (btnAll) btnAll.textContent = `Todas (${countAll})`;
    if (btnCompetencia) btnCompetencia.textContent = `Pérdida de Competencia (${countCompetencia})`;
    if (btnSuspension) btnSuspension.textContent = `Suspensión Prolongada (${countSuspension})`;
    if (btnProximos) btnProximos.textContent = `Próximos a Terminar (${countProximos})`;
    if (btnVencido) btnVencido.textContent = `Vencidos sin Liquidar (${countVencido})`;

    const navFeed = document.getElementById('nav-alerts-list');
    const navCountSpan = document.getElementById('nav-alerts-count');
    const navBadge = document.getElementById('nav-alerts-badge');

    if (navCountSpan) navCountSpan.textContent = alerts.length;
    if (navBadge) {
        if (alerts.length > 0) navBadge.classList.remove('hidden');
        else navBadge.classList.add('hidden');
    }

    if (navFeed) {
        if (alerts.length === 0) {
            navFeed.innerHTML = '<div class="p-6 text-center text-slate-400 font-medium"><i class="fa-solid fa-shield-check text-2xl mb-2 text-emerald-400 opacity-50 block"></i>Todo en orden</div>';
        } else {
            navFeed.innerHTML = alerts.map(a => `
                <div class="p-3 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition" onclick="showSummaryCard('${a.conv}')">
                    <div class="flex gap-3">
                        <div class="mt-0.5"><i class="fa-solid ${a.icon} text-base"></i></div>
                        <div>
                            <h4 class="text-[10px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">${a.title}</h4>
                            <p class="text-[9px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate w-48">${a.mun} - ${a.conv}</p>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    if (finalAlerts.length === 0) {
        feed.innerHTML = `
            <div style="padding:24px;text-align:center;">
                <i class="fa-solid fa-shield-check" style="font-size:28px;color:#018D38;opacity:0.5;display:block;margin-bottom:8px;"></i>
                <p style="font-size:11px;font-weight:600;color:#94A3B8;">No se detectaron riesgos en la selección actual.</p>
            </div>`;
        return;
    }

    const alertTypeMap = {
        competencia: { borderColor: '#A90F09', iconColor: '#A90F09', bg: '#FFFFFF' },
        suspension: { borderColor: '#D97706', iconColor: '#D97706', bg: '#FFFFFF' },
        proximos: { borderColor: '#F28E18', iconColor: '#F28E18', bg: '#FFFFFF' },
        vencido: { borderColor: '#A90F09', iconColor: '#A90F09', bg: '#FFFFFF' },
        desfase: { borderColor: '#3561AB', iconColor: '#3561AB', bg: '#FFFFFF' }
    };

    feed.innerHTML = finalAlerts.map((a, idx) => {
        const colors = alertTypeMap[a.type] || { borderColor: '#94A3B8', iconColor: '#94A3B8', bg: '#F8FAFC' };

        // Badge de urgencia según tipo
        let urgencyBadge = '';
        let urgencyBar = '';
        if (a.type === 'competencia') {
            const monthsLeft = a._sortVal ?? 0;
            if (monthsLeft <= 0) {
                // Ya superó el límite
                urgencyBadge = `<span style="display:inline-flex;align-items:center;gap:3px;background:#7F1D1D;color:#fff;font-size:8px;font-weight:800;padding:2px 7px;border-radius:999px;letter-spacing:0.5px;text-transform:uppercase;margin-left:6px;">⚠ COMPETENCIA PERDIDA</span>`;
            } else {
                // Faltan X meses — barra de urgencia proporcional (0 meses restantes = 100% urgencia)
                const pct = Math.round(((6 - Math.min(monthsLeft, 6)) / 6) * 100);
                const barColor = pct >= 80 ? '#DC2626' : pct >= 50 ? '#D97706' : '#F59E0B';
                urgencyBadge = `<span style="display:inline-flex;align-items:center;gap:3px;background:#FEE2E2;color:#991B1B;font-size:8px;font-weight:800;padding:2px 7px;border-radius:999px;letter-spacing:0.5px;text-transform:uppercase;margin-left:6px;">🔴 ${monthsLeft.toFixed(1)} meses</span>`;
                urgencyBar = `
                    <div style="margin:5px 0 2px 0;background:#F1F5F9;border-radius:4px;height:4px;overflow:hidden;" title="Urgencia: ${pct}%">
                        <div style="width:${pct}%;height:100%;background:${barColor};border-radius:4px;transition:width .3s;"></div>
                    </div>
                    <p style="font-size:8.5px;color:#94A3B8;font-weight:500;margin-bottom:4px;">Urgencia: ${pct}% — faltan ${monthsLeft.toFixed(1)} meses para el límite legal</p>`;
            }
        } else if (a.type === 'suspension') {
            const m = a._sortVal ?? 0;
            urgencyBadge = `<span style="display:inline-flex;align-items:center;gap:3px;background:#FEF3C7;color:#92400E;font-size:8px;font-weight:800;padding:2px 7px;border-radius:999px;letter-spacing:0.5px;text-transform:uppercase;margin-left:6px;"><i class="fa-solid fa-pause text-[7px]"></i> ${m} MESES SUSPENDIDO</span>`;
        }

        // Número de orden por urgencia (solo si vista "Todas")
        const rankBadge = currentAlertFilter === 'all'
            ? `<span style="font-size:8px;font-weight:700;color:#CBD5E1;margin-right:4px;">#${idx + 1}</span>`
            : '';

        return `
        <div class="alert-feed-item alert-${a.type}" onclick="showSummaryCard('${a.conv}')" style="cursor:pointer;${a.type === 'competencia' && (a._sortVal ?? 0) <= 0 ? 'border-left-color:#7F1D1D;background:linear-gradient(to right,#FFF1F1,#FFFFFF);' : (a.type === 'suspension' ? 'border-left-color:#D97706;' : '')}">
            <div class="alert-item-header">
                <div class="alert-item-icon ${a.type}">
                    <i class="fa-solid ${a.icon}"></i>
                </div>
                <div style="flex:1;min-width:0;">
                    <h4 class="alert-item-title" style="display:flex;align-items:center;flex-wrap:wrap;gap:2px;">${rankBadge}${a.title}${urgencyBadge}</h4>
                </div>
            </div>
            ${urgencyBar}
            <p style="font-size:10px;font-weight:500;color:#64748B;line-height:1.5;margin-bottom:6px;">${a.desc}</p>
            <div class="alert-item-meta">
                <span class="alert-item-tag"><i class="fa-solid fa-hashtag" style="font-size:8px;"></i>${a.conv}</span>
                <span class="alert-item-tag"><i class="fa-solid fa-location-dot" style="font-size:8px;"></i>${a.mun}</span>
            </div>
        </div>`;
    }).join('');
}

window.activeFisicoMetric = 'longitud';
window.toggleFisicoMetric = function (metric) {
    window.activeFisicoMetric = metric;
    updateCharts();
};

// Almacena referencias a los 4 charts territoriales para destruirlos al redibujar
const _territorialCharts = {};

// Función global para alternar filtro desde los gráficos territoriales
window.toggleTerritorialFilter = function (filterId, value, event) {
    const select = document.getElementById(filterId);
    if (!select) return;

    const currentValues = getSelectValues(filterId);
    const isCtrlOrShift = event && (event.ctrlKey || event.metaKey || event.shiftKey);
    const targetVal = String(value || '').trim();
    if (!targetVal) return;

    const targetNorm = targetVal.toUpperCase();

    if (isCtrlOrShift) {
        // Modo múltiple selección (toggle individual)
        let found = false;
        Array.from(select.options).forEach(opt => {
            if (opt.value.trim().toUpperCase() === targetNorm) {
                opt.selected = !opt.selected;
                found = true;
            }
        });
        if (!found) {
            const newOpt = new Option(targetVal, targetVal, true, true);
            select.add(newOpt);
        }
    } else {
        // Modo selección única: si ya era el único seleccionado, se deselecciona; si no, se selecciona sólo este
        const isOnlySelected = currentValues.length === 1 && currentValues[0].trim().toUpperCase() === targetNorm;
        Array.from(select.options).forEach(opt => {
            if (isOnlySelected) {
                opt.selected = false;
            } else {
                opt.selected = (opt.value.trim().toUpperCase() === targetNorm);
            }
        });
    }

    // Sincronizar opción "Todos"
    const remaining = Array.from(select.options).filter(o => o.selected && o.value !== '' && o.value !== 'todos' && o.value !== 'TODOS');
    if (remaining.length === 0 && select.options[0]) {
        select.options[0].selected = true;
    } else if (remaining.length > 0 && select.options[0] && (select.options[0].value === '' || select.options[0].value === 'todos' || select.options[0].value === 'TODOS')) {
        select.options[0].selected = false;
    }

    select.dispatchEvent(new Event('change', { bubbles: true }));
};

// Función global para limpiar filtros territoriales
window.clearTerritorialFilters = function () {
    ['filter-subregion', 'filter-municipio'].forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            Array.from(select.options).forEach(o => o.selected = false);
            if (select.options[0]) select.options[0].selected = true;
            select.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
};

function updateTerritorialCharts() {
    if (typeof Chart === 'undefined') return;

    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.04)';

    // ── Helpers ──────────────────────────────────────────────────────────────
    const formatBillones = (v) => {
        if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}B`;
        if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}MM`;
        if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
        return `$${v.toFixed(0)}`;
    };

    const hoverCursor = (e, el) => {
        if (e && e.native && e.native.target) {
            e.native.target.style.cursor = el && el.length > 0 ? 'pointer' : 'default';
        }
    };

    const makeChart = (id, config) => {
        const canvas = document.getElementById(id);
        if (!canvas) return;
        if (_territorialCharts[id]) { _territorialCharts[id].destroy(); }
        _territorialCharts[id] = new Chart(canvas, config);
    };

    // ── Filtros Activos ───────────────────────────────────────────────────────
    const search = document.getElementById('filter-search')?.value.toLowerCase().trim() || '';
    const vigencia = getSelectValues('filter-vigencia');
    const supervisor = getSelectValues('filter-supervisor');
    const indicador = getSelectValues('filter-indicador');
    const convenioNum = getSelectValues('filter-convenio-num');
    const clasificacion = getSelectValues('filter-clasificacion');
    const estado = getSelectValues('filter-estado');
    const activeSubregions = getSelectValues('filter-subregion');
    const activeMunicipios = getSelectValues('filter-municipio');

    // Filas base para subregiones (respetan todos los filtros excepto subregión y municipio para mantener el contexto global comparativo)
    const subregionBaseRows = rawData.filter(row => {
        const rowValsStr = Object.values(row).map(v => String(v || '').toLowerCase()).join(' ');
        const matchSearch = !search || rowValsStr.includes(search);
        const matchVig = vigencia.length === 0 || vigencia.includes(String(row['VIGENCIA'] || '').trim());
        const matchSup = supervisor.length === 0 || supervisor.includes(String(row['SUPERVISOR'] || '').trim());
        const matchInd = indicador.length === 0 || indicador.includes(String(row['INDICADOR'] || '').trim());
        const matchConv = convenioNum.length === 0 || convenioNum.includes(String(row['CONVENIO'] || '').trim());
        const clasifValue = String(row['CLASIFICACIÓN'] || row['CLASIFICACI"N'] || '').trim();
        const matchClasif = clasificacion.length === 0 || clasificacion.includes(clasifValue);
        const matchEstado = estado.length === 0 || estado.includes(String(row['ESTADO CONVENIO'] || '').trim());
        return matchSearch && matchVig && matchSup && matchInd && matchConv && matchClasif && matchEstado;
    });

    // Filas base para municipios (si hay subregión activa, limitan a la subregión activa; si no, usan subregionBaseRows)
    const municipioBaseRows = subregionBaseRows.filter(row => {
        const sub = String(row['SUBREGION'] || getSubregion(row['MUNICIPIO']) || '').trim().toUpperCase();
        return activeSubregions.length === 0 || activeSubregions.some(s => s.toUpperCase() === sub);
    });

    // ── Acumular datos de Subregiones ──────────────────────────────────────────
    const subregLong = {};
    const subregInv = {};
    const subregCount = {};

    subregionBaseRows.forEach(r => {
        const muni = String(r['MUNICIPIO'] || 'S/D').trim();
        const sub = String(r['SUBREGION'] || getSubregion(muni) || 'OTRAS').trim().toUpperCase();
        const longM = getRowLongitudContratada(r) || 0;
        const inv = (r['APORTE DEPARTAMENTO'] || 0) + (r['ADICION DEPARTAMENTO'] || 0);

        subregLong[sub] = (subregLong[sub] || 0) + longM;
        subregInv[sub] = (subregInv[sub] || 0) + inv;
        subregCount[sub] = (subregCount[sub] || 0) + 1;
    });

    // ── Acumular datos de Municipios ──────────────────────────────────────────
    const muniLong = {};
    const muniInv = {};
    const muniCount = {};

    const isInvalidMuni = (m) => {
        const s = String(m || '').trim().toUpperCase();
        return !s || s === 'S/D' || s === 'SD' || s === 'SIN DATO' || s === 'N/A' || s === 'NO DEFINIDO' || s === 'S / D' || s === 'SIN DEFINIR';
    };

    municipioBaseRows.forEach(r => {
        const muni = String(r['MUNICIPIO'] || '').trim().toUpperCase();
        if (isInvalidMuni(muni)) return; // Ocultar registros sin municipio ("S/D") en los gráficos de Top Municipios

        const longM = getRowLongitudContratada(r) || 0;
        const inv = (r['APORTE DEPARTAMENTO'] || 0) + (r['ADICION DEPARTAMENTO'] || 0);

        muniLong[muni] = (muniLong[muni] || 0) + longM;
        muniInv[muni] = (muniInv[muni] || 0) + inv;
        muniCount[muni] = (muniCount[muni] || 0) + 1;
    });

    // ── Actualizar Píldoras de Filtro en el Encabezado ────────────────────────
    const tagsContainer = document.getElementById('territorial-filter-tags');
    if (tagsContainer) {
        const tagItems = [];
        activeSubregions.forEach(sub => {
            tagItems.push(`
                <span style="display:inline-flex;align-items:center;gap:5px;font-size:9.5px;font-weight:700;color:#0B5640;background:#E6F4EA;border:1.5px solid rgba(11,86,64,0.3);padding:2px 8px;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                    <i class="fa-solid fa-map-pin" style="font-size:8.5px;"></i>
                    <span>Subregión: ${sub}</span>
                    <button type="button" onclick="toggleTerritorialFilter('filter-subregion', '${sub}', event)" style="background:none;border:none;cursor:pointer;color:#0B5640;font-size:11px;padding:0 2px;line-height:1;margin-left:2px;font-weight:800;" title="Quitar filtro">✕</button>
                </span>
            `);
        });
        activeMunicipios.forEach(muni => {
            tagItems.push(`
                <span style="display:inline-flex;align-items:center;gap:5px;font-size:9.5px;font-weight:700;color:#0B5640;background:#E6F4EA;border:1.5px solid rgba(11,86,64,0.3);padding:2px 8px;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                    <i class="fa-solid fa-city" style="font-size:8.5px;"></i>
                    <span>Municipio: ${muni}</span>
                    <button type="button" onclick="toggleTerritorialFilter('filter-municipio', '${muni}', event)" style="background:none;border:none;cursor:pointer;color:#0B5640;font-size:11px;padding:0 2px;line-height:1;margin-left:2px;font-weight:800;" title="Quitar filtro">✕</button>
                </span>
            `);
        });
        if (tagItems.length > 0) {
            tagItems.push(`
                <button type="button" onclick="clearTerritorialFilters()" style="font-size:9px;font-weight:700;color:#DC2626;background:#FEE2E2;border:1px solid rgba(220,38,38,0.25);padding:2px 8px;border-radius:10px;cursor:pointer;display:inline-flex;align-items:center;gap:4px;transition:all 0.15s;" title="Restablecer filtros territoriales">
                    <i class="fa-solid fa-rotate-left" style="font-size:8.5px;"></i> Restablecer
                </button>
            `);
            tagsContainer.innerHTML = tagItems.join('');
            tagsContainer.style.display = 'flex';
        } else {
            tagsContainer.innerHTML = '';
            tagsContainer.style.display = 'none';
        }
    }

    // ── GRÁFICO 1: Longitud por Subregión (barras verticales) ─────────────────
    {
        const sorted = Object.entries(subregLong).sort((a, b) => b[1] - a[1]);
        const labels = sorted.map(([k]) => k);
        const data = sorted.map(([, v]) => v / 1000); // km
        const maxVal = Math.max(...data, 1);
        const hasSubSelection = activeSubregions.length > 0;

        const bgColors = labels.map((sub, i) => {
            const isSelected = activeSubregions.some(s => s.toUpperCase() === sub.toUpperCase());
            if (hasSubSelection) {
                return isSelected ? '#0B5640' : 'rgba(11,86,64,0.18)';
            }
            const alpha = 0.35 + 0.65 * (data[i] / maxVal);
            return `rgba(11,86,64,${alpha.toFixed(2)})`;
        });

        const borderColors = labels.map(sub => {
            const isSelected = activeSubregions.some(s => s.toUpperCase() === sub.toUpperCase());
            return isSelected ? '#043d2c' : 'transparent';
        });

        const borderWidths = labels.map(sub => {
            const isSelected = activeSubregions.some(s => s.toUpperCase() === sub.toUpperCase());
            return isSelected ? 2 : 0;
        });

        makeChart('chart-longitud-subregion', {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Longitud (km)',
                    data,
                    backgroundColor: bgColors,
                    borderColor: borderColors,
                    borderWidth: borderWidths,
                    borderRadius: 4,
                    borderSkipped: false,
                    hoverBackgroundColor: '#018D38'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                onHover: hoverCursor,
                onClick: (event, activeEls) => {
                    if (activeEls && activeEls.length > 0) {
                        const idx = activeEls[0].index;
                        const sub = labels[idx];
                        if (sub) window.toggleTerritorialFilter('filter-subregion', sub, event.native);
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.92)',
                        titleColor: '#ffffff',
                        bodyColor: '#f1f5f9',
                        borderColor: '#018D38',
                        borderWidth: 1,
                        padding: 10,
                        cornerRadius: 8,
                        titleFont: { size: 11, weight: 'bold', family: 'Poppins' },
                        bodyFont: { size: 10, family: 'Poppins' },
                        footerFont: { size: 9, weight: '600', family: 'Poppins' },
                        footerColor: '#86efac',
                        callbacks: {
                            label: ctx => {
                                const sub = ctx.label;
                                const cnt = subregCount[sub] || 0;
                                return ` Longitud: ${ctx.parsed.y.toFixed(1)} km (${cnt} convenio${cnt !== 1 ? 's' : ''})`;
                            },
                            footer: items => {
                                if (!items.length) return '';
                                const sub = items[0].label;
                                const isSel = activeSubregions.some(s => s.toUpperCase() === sub.toUpperCase());
                                return isSel ? '✓ Subregión seleccionada · Clic para deseleccionar' : '👆 Clic para filtrar por esta subregión';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: textColor, font: { size: 7.5, weight: '600' }, maxRotation: 30, minRotation: 20 },
                        grid: { display: false }
                    },
                    y: {
                        ticks: { color: textColor, font: { size: 7.5 }, callback: v => `${v}km` },
                        grid: { color: gridColor }
                    }
                }
            }
        });
    }

    // ── GRÁFICO 2: Inversión por Subregión (barras verticales) ────────────────
    {
        const sorted = Object.entries(subregInv).sort((a, b) => b[1] - a[1]);
        const labels = sorted.map(([k]) => k);
        const data = sorted.map(([, v]) => v);
        const hasSubSelection = activeSubregions.length > 0;

        const greenShades = [
            '#0B5640', '#0D6B4E', '#0F7A59', '#118A64', '#14A376',
            '#17BB88', '#1DD3A0', '#22C55E', '#4ADE80', '#86EFAC'
        ];

        const bgColors = labels.map((sub, i) => {
            const isSelected = activeSubregions.some(s => s.toUpperCase() === sub.toUpperCase());
            if (hasSubSelection) {
                return isSelected ? '#018D38' : 'rgba(1, 141, 56, 0.18)';
            }
            return greenShades[i % greenShades.length];
        });

        const borderColors = labels.map(sub => {
            const isSelected = activeSubregions.some(s => s.toUpperCase() === sub.toUpperCase());
            return isSelected ? '#043d2c' : 'transparent';
        });

        const borderWidths = labels.map(sub => {
            const isSelected = activeSubregions.some(s => s.toUpperCase() === sub.toUpperCase());
            return isSelected ? 2 : 0;
        });

        makeChart('chart-inversion-subregion', {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Inversión',
                    data,
                    backgroundColor: bgColors,
                    borderColor: borderColors,
                    borderWidth: borderWidths,
                    borderRadius: 4,
                    borderSkipped: false,
                    hoverBackgroundColor: '#0B5640'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                onHover: hoverCursor,
                onClick: (event, activeEls) => {
                    if (activeEls && activeEls.length > 0) {
                        const idx = activeEls[0].index;
                        const sub = labels[idx];
                        if (sub) window.toggleTerritorialFilter('filter-subregion', sub, event.native);
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.92)',
                        titleColor: '#ffffff',
                        bodyColor: '#f1f5f9',
                        borderColor: '#018D38',
                        borderWidth: 1,
                        padding: 10,
                        cornerRadius: 8,
                        titleFont: { size: 11, weight: 'bold', family: 'Poppins' },
                        bodyFont: { size: 10, family: 'Poppins' },
                        footerFont: { size: 9, weight: '600', family: 'Poppins' },
                        footerColor: '#86efac',
                        callbacks: {
                            label: ctx => {
                                const sub = ctx.label;
                                const cnt = subregCount[sub] || 0;
                                return ` Inversión: ${formatBillones(ctx.parsed.y)} (${cnt} convenio${cnt !== 1 ? 's' : ''})`;
                            },
                            footer: items => {
                                if (!items.length) return '';
                                const sub = items[0].label;
                                const isSel = activeSubregions.some(s => s.toUpperCase() === sub.toUpperCase());
                                return isSel ? '✓ Subregión seleccionada · Clic para deseleccionar' : '👆 Clic para filtrar por esta subregión';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: textColor, font: { size: 7.5, weight: '600' }, maxRotation: 30, minRotation: 20 },
                        grid: { display: false }
                    },
                    y: {
                        ticks: { color: textColor, font: { size: 7.5 }, callback: v => formatBillones(v) },
                        grid: { color: gridColor }
                    }
                }
            }
        });
    }

    // ── GRÁFICO 3: Top 10 Municipios por Longitud (barras verticales) ──────────
    {
        const sorted = Object.entries(muniLong)
            .filter(([k]) => !isInvalidMuni(k))
            .sort((a, b) => b[1] - a[1]).slice(0, 10);
        const labels = sorted.map(([k]) => k);
        const data = sorted.map(([, v]) => v / 1000);
        const maxVal = Math.max(...data, 1);
        const hasMuniSelection = activeMunicipios.length > 0;

        const bgColors = labels.map((muni, i) => {
            const isSelected = activeMunicipios.some(m => m.toUpperCase() === muni.toUpperCase());
            if (hasMuniSelection) {
                return isSelected ? '#0B5640' : 'rgba(11,86,64,0.18)';
            }
            const alpha = 0.45 + 0.55 * (data[i] / maxVal);
            return `rgba(11,86,64,${alpha.toFixed(2)})`;
        });

        const borderColors = labels.map(muni => {
            const isSelected = activeMunicipios.some(m => m.toUpperCase() === muni.toUpperCase());
            return isSelected ? '#043d2c' : 'transparent';
        });

        const borderWidths = labels.map(muni => {
            const isSelected = activeMunicipios.some(m => m.toUpperCase() === muni.toUpperCase());
            return isSelected ? 2 : 0;
        });

        makeChart('chart-top-municipios-longitud', {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Longitud (km)',
                    data,
                    backgroundColor: bgColors,
                    borderColor: borderColors,
                    borderWidth: borderWidths,
                    borderRadius: 4,
                    borderSkipped: false,
                    hoverBackgroundColor: '#018D38'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                onHover: hoverCursor,
                onClick: (event, activeEls) => {
                    if (activeEls && activeEls.length > 0) {
                        const idx = activeEls[0].index;
                        const muni = labels[idx];
                        if (muni) window.toggleTerritorialFilter('filter-municipio', muni, event.native);
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.92)',
                        titleColor: '#ffffff',
                        bodyColor: '#f1f5f9',
                        borderColor: '#018D38',
                        borderWidth: 1,
                        padding: 10,
                        cornerRadius: 8,
                        titleFont: { size: 11, weight: 'bold', family: 'Poppins' },
                        bodyFont: { size: 10, family: 'Poppins' },
                        footerFont: { size: 9, weight: '600', family: 'Poppins' },
                        footerColor: '#86efac',
                        callbacks: {
                            label: ctx => {
                                const muni = ctx.label;
                                const cnt = muniCount[muni] || 0;
                                return ` Longitud: ${ctx.parsed.y.toFixed(1)} km (${cnt} convenio${cnt !== 1 ? 's' : ''})`;
                            },
                            footer: items => {
                                if (!items.length) return '';
                                const muni = items[0].label;
                                const isSel = activeMunicipios.some(m => m.toUpperCase() === muni.toUpperCase());
                                return isSel ? '✓ Municipio seleccionado · Clic para deseleccionar' : '👆 Clic para filtrar por este municipio';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: textColor, font: { size: 7.5 }, maxRotation: 35, minRotation: 25 },
                        grid: { display: false }
                    },
                    y: {
                        ticks: { color: textColor, font: { size: 7.5 }, callback: v => `${v}km` },
                        grid: { color: gridColor }
                    }
                }
            }
        });
    }

    // ── GRÁFICO 4: Top 10 Municipios por Inversión (barras verticales) ────────
    {
        const sorted = Object.entries(muniInv)
            .filter(([k]) => !isInvalidMuni(k))
            .sort((a, b) => b[1] - a[1]).slice(0, 10);
        const labels = sorted.map(([k]) => k);
        const data = sorted.map(([, v]) => v);
        const maxVal = Math.max(...data, 1);
        const hasMuniSelection = activeMunicipios.length > 0;

        const bgColors = labels.map((muni, i) => {
            const isSelected = activeMunicipios.some(m => m.toUpperCase() === muni.toUpperCase());
            if (hasMuniSelection) {
                return isSelected ? '#018D38' : 'rgba(1, 141, 56, 0.18)';
            }
            const alpha = 0.35 + 0.65 * (data[i] / maxVal);
            return `rgba(11,86,64,${alpha.toFixed(2)})`;
        });

        const borderColors = labels.map(muni => {
            const isSelected = activeMunicipios.some(m => m.toUpperCase() === muni.toUpperCase());
            return isSelected ? '#043d2c' : 'transparent';
        });

        const borderWidths = labels.map(muni => {
            const isSelected = activeMunicipios.some(m => m.toUpperCase() === muni.toUpperCase());
            return isSelected ? 2 : 0;
        });

        makeChart('chart-top-municipios-inversion', {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Inversión',
                    data,
                    backgroundColor: bgColors,
                    borderColor: borderColors,
                    borderWidth: borderWidths,
                    borderRadius: 4,
                    borderSkipped: false,
                    hoverBackgroundColor: '#0B5640'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                onHover: hoverCursor,
                onClick: (event, activeEls) => {
                    if (activeEls && activeEls.length > 0) {
                        const idx = activeEls[0].index;
                        const muni = labels[idx];
                        if (muni) window.toggleTerritorialFilter('filter-municipio', muni, event.native);
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.92)',
                        titleColor: '#ffffff',
                        bodyColor: '#f1f5f9',
                        borderColor: '#018D38',
                        borderWidth: 1,
                        padding: 10,
                        cornerRadius: 8,
                        titleFont: { size: 11, weight: 'bold', family: 'Poppins' },
                        bodyFont: { size: 10, family: 'Poppins' },
                        footerFont: { size: 9, weight: '600', family: 'Poppins' },
                        footerColor: '#86efac',
                        callbacks: {
                            label: ctx => {
                                const muni = ctx.label;
                                const cnt = muniCount[muni] || 0;
                                return ` Inversión: ${formatBillones(ctx.parsed.y)} (${cnt} convenio${cnt !== 1 ? 's' : ''})`;
                            },
                            footer: items => {
                                if (!items.length) return '';
                                const muni = items[0].label;
                                const isSel = activeMunicipios.some(m => m.toUpperCase() === muni.toUpperCase());
                                return isSel ? '✓ Municipio seleccionado · Clic para deseleccionar' : '👆 Clic para filtrar por este municipio';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: textColor, font: { size: 7.5 }, maxRotation: 35, minRotation: 25 },
                        grid: { display: false }
                    },
                    y: {
                        ticks: { color: textColor, font: { size: 7.5 }, callback: v => formatBillones(v) },
                        grid: { color: gridColor }
                    }
                }
            }
        });
    }
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
            estMap[e].inversion += (r['APORTE DEPARTAMENTO'] || 0) + (r['ADICION DEPARTAMENTO'] || 0);
            totalVal += (r['APORTE DEPARTAMENTO'] || 0) + (r['ADICION DEPARTAMENTO'] || 0);
        });

        const labelsEstado = Object.keys(estMap).sort((a, b) => estMap[b].count - estMap[a].count);
        const dataCount = labelsEstado.map(l => estMap[l].count);
        const bgColors = labelsEstado.map(label => getSystemState(label).hex);

        const isDark = document.documentElement.classList.contains('dark');
        const textColor = isDark ? '#94a3b8' : '#64748b';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.04)';
        const chartBorderColor = isDark ? '#1e293b' : '#ffffff';

        if (charts['estado']) charts['estado'].destroy();

        const centerTextPlugin = {
            id: 'centerText',
            beforeDraw: function (chart) {
                const width = chart.width, height = chart.height, ctx = chart.ctx;
                ctx.restore();
                const fontSize = (height / 114).toFixed(2);
                ctx.font = `900 ${fontSize}em Poppins`;
                ctx.textBaseline = "middle";
                ctx.fillStyle = isDark ? "#f8fafc" : "#0f172a";
                const text = totalCount.toString();
                const textX = Math.round((width - ctx.measureText(text).width) / 2);
                const textY = height / 2;
                ctx.fillText(text, textX, textY);

                ctx.font = `700 ${(height / 250).toFixed(2)}em Poppins`;
                ctx.fillStyle = isDark ? "#64748b" : "#94a3b8";
                const text2 = "TOTAL";
                const text2X = Math.round((width - ctx.measureText(text2).width) / 2);
                ctx.fillText(text2, text2X, textY - (height / 8));
                ctx.save();
            }
        };

        charts['estado'] = new Chart(canvasEstado, {
            type: 'doughnut',
            data: {
                labels: labelsEstado,
                datasets: [{ data: dataCount, backgroundColor: bgColors, borderWidth: 2, borderColor: chartBorderColor, hoverOffset: 6 }]
            },
            plugins: [centerTextPlugin],
            options: {
                responsive: true, maintainAspectRatio: false, cutout: '78%', onHover: hoverCursor,
                animation: { animateScale: true, animateRotate: true, duration: 800, easing: 'easeOutQuart' },
                onClick: (e, activeEls) => {
                    if (activeEls.length > 0) {
                        const clickedEstado = labelsEstado[activeEls[0].index];
                        const filterEl = document.getElementById('filter-estado');
                        if (filterEl) {
                            filterEl.value = filterEl.value === clickedEstado ? '' : clickedEstado;
                            applyFilters();
                        }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        titleColor: isDark ? '#f8fafc' : '#0f172a',
                        bodyColor: isDark ? '#cbd5e1' : '#475569',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.05)',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8,
                        titleFont: { size: 11, family: 'Poppins' },
                        bodyFont: { size: 13, weight: 'bold', family: 'Poppins' },
                        callbacks: { label: (c) => ` ${c.label}: ${c.raw} convenios` }
                    }
                }
            }
        });

        const legendContainer = document.getElementById('chart-estado-legend');
        if (legendContainer) {
            legendContainer.innerHTML = labelsEstado.map(label => {
                const sysState = getSystemState(label);
                const stat = estMap[label];
                const pct = totalCount > 0 ? Math.round((stat.count / totalCount) * 100) : 0;
                return `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border-radius:10px;transition:all 0.15s;cursor:pointer;border:1.5px solid #E2E8F0;" 
                    onmouseover="this.style.background='rgba(11, 86, 64,0.05)';this.style.borderColor='rgba(11, 86, 64,0.2)';" 
                    onmouseout="this.style.background='transparent';this.style.borderColor='#E2E8F0';"
                    onclick="const f=document.getElementById('filter-estado');if(f){const vals=getSelectValues('filter-estado');const isSel=vals.includes('${label}');Array.from(f.options).forEach(o=>{if(o.value==='${label}')o.selected=!isSel;});f.dispatchEvent(new Event('change', {bubbles:true}));}">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div style="width:12px;height:12px;border-radius:50%;background:${sysState.hex};box-shadow:0 2px 6px ${sysState.hex}40;flex-shrink:0;"></div>
                        <div>
                            <p style="font-size:10px;font-weight:700;color:#0F172A;text-transform:uppercase;letter-spacing:0.04em;line-height:1.2;">${label}</p>
                            <p style="font-size:9px;font-weight:600;color:#94A3B8;margin-top:1px;">${formatCurrency(stat.inversion)}</p>
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <p style="font-size:13px;font-weight:800;color:#0F172A;line-height:1;">${stat.count}</p>
                        <p style="font-size:9px;font-weight:700;color:#94A3B8;">${pct}%</p>
                    </div>
                </div>`;
            }).join('');
        }
    }

    // Gráfico de Ejecución (Barra de Progreso Personalizada Premium)
    const progressBarFill = document.getElementById('progress-bar-fill');
    if (progressBarFill) {
        window.activeFisicoMetric = window.activeFisicoMetric || 'longitud';

        let tCon = 0, tEje = 0;
        let unit = ' km';

        if (window.activeFisicoMetric === 'longitud') {
            filteredData.forEach(r => {
                tCon += getRowLongitudContratada(r);
                tEje += getRowLongitudEjecutada(r);
            });
            // Convertir a kilómetros para visualización en la barra prominente
            tCon = tCon / 1000;
            tEje = tEje / 1000;
            unit = ' km';
        } else {
            filteredData.forEach(r => {
                tCon += getRowAreaContratada(r);
                tEje += getRowAreaEjecutada(r);
            });
            unit = ' m²';
        }

        const pct = tCon > 0 ? (tEje / tCon) * 100 : 0;
        const rest = Math.max(0, tCon - tEje);

        // Update highlight styling of the interactive boxes
        const btnLon = document.getElementById('btn-metric-longitud');
        const btnAre = document.getElementById('btn-metric-area');
        if (window.activeFisicoMetric === 'longitud') {
            if (btnLon) {
                btnLon.style.background = '#F0FDFA';
                btnLon.style.borderColor = 'rgba(1, 141, 56, 0.2)';
                const txt = btnLon.querySelector('#tot-lon-eje-text');
                if (txt) txt.style.color = '#0B5640';
            }
            if (btnAre) {
                btnAre.style.background = '#F8FAFC';
                btnAre.style.borderColor = '#E2E8F0';
                const txt = btnAre.querySelector('#tot-are-eje-text');
                if (txt) {
                    txt.style.color = '#0F172A';
                } else {
                    btnAre.style.color = '#0F172A';
                }
            }
        } else {
            if (btnLon) {
                btnLon.style.background = '#F8FAFC';
                btnLon.style.borderColor = '#E2E8F0';
                const txt = btnLon.querySelector('#tot-lon-eje-text');
                if (txt) {
                    txt.style.color = '#0F172A';
                } else {
                    btnLon.style.color = '#0F172A';
                }
            }
            if (btnAre) {
                btnAre.style.background = '#F0FDFA';
                btnAre.style.borderColor = 'rgba(1, 141, 56, 0.2)';
                const txt = btnAre.querySelector('#tot-are-eje-text');
                if (txt) txt.style.color = '#0B5640';
            }
        }

        // Actualizar elementos de la Barra de Progreso Prominente
        const pctVal = document.getElementById('progress-percentage-val');
        const innerText = document.getElementById('progress-bar-inner-text');
        const remainingText = document.getElementById('progress-remaining-text');
        const totalText = document.getElementById('progress-total-text');

        // Animación suave del ancho
        progressBarFill.style.width = `${pct.toFixed(1)}%`;
        if (pctVal) pctVal.textContent = `${pct.toFixed(1)}%`;

        if (innerText) {
            // Mostrar texto interno si hay suficiente espacio en la barra
            innerText.textContent = pct >= 20
                ? `${tEje.toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}${unit} Ejecutados`
                : '';
        }

        if (remainingText) {
            remainingText.textContent = `Falta: ${rest.toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}${unit}`;
        }

        if (totalText) {
            totalText.textContent = `Contratado: ${tCon.toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}${unit}`;
        }

        // Actualizar el Círculo de Progreso Radial (esquina superior derecha)
        const radialCircle = document.getElementById('radial-progress-circle');
        const radialText = document.getElementById('radial-progress-text');
        if (radialCircle && radialText) {
            // Circunferencia del círculo con radio 17 es 2 * Math.PI * 17 = 106.81
            const circumference = 106.8;
            const offset = circumference - (circumference * pct) / 100;
            radialCircle.style.strokeDashoffset = Math.max(0, Math.min(circumference, offset));
            radialText.textContent = `${Math.round(pct)}%`;
        }
    }
}

// ------ MAPA HÍBRIDO CON TOOLTIPS Y EXTRACCI�"N DE COORDENADAS ------
async function renderMap(row, mapId, overlayId, msgId, inst, cb) {
    const ov = document.getElementById(overlayId), ms = document.getElementById(msgId);
    ov.classList.remove('hidden'); ms.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Trazando Geometría...';

    let m = inst, g = null;
    if (!m) {
        m = L.map(mapId, { zoomControl: false, attributionControl: false, preferCanvas: false, maxZoom: 20 }).setView([6.2, -75.5], 10);

        // Capa Satelital Esri HD única
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 20,
            maxNativeZoom: 18,
            attribution: 'Esri'
        }).addTo(m);

        // Etiquetas sutiles de lugares y vías sobre la imagen satelital
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png', {
            maxZoom: 20,
            maxNativeZoom: 19,
            subdomains: 'abcd'
        }).addTo(m);

        L.control.zoom({ position: 'bottomright' }).addTo(m);

        g = L.layerGroup().addTo(m);
        m._currentLayerGroup = g;
        cb(m, g);
    } else {
        g = m._currentLayerGroup;
        if (g) {
            g.clearLayers();
        } else {
            m.eachLayer(l => { if (l instanceof L.LayerGroup && !(l instanceof L.FeatureGroup)) { g = l; } });
            if (g) g.clearLayers();
        }
        m.invalidateSize();
    }

    const num = String(row['CONVENIO']).trim();
    let ok = false, b = null;
    currentExtractedFeatures = [];

    const tramoStyle = { color: '#A90F09', weight: 5, opacity: 0.9, lineCap: 'round', lineJoin: 'round' };
    const highlightStyle = { color: '#018D38', weight: 8, opacity: 1, lineCap: 'round', lineJoin: 'round' };

    const onEachFeat = (feature, layer) => {
        let name = feature.properties ? (feature.properties.name || feature.properties.Name || feature.properties.NAME) : null;
        if (name) {
            layer.bindTooltip(`<div class="font-bold text-slate-800 text-[10px] uppercase tracking-widest">${name}</div>`, { sticky: true, className: 'custom-leaflet-tooltip' });
            currentExtractedFeatures.push({ name, layer });
            layer.on('click', () => {
                const btnId = `btn-feat-${mapId}-${name.replace(/[^a-zA-Z0-9]/g, '-')}`;
                const btn = document.getElementById(btnId);
                if (btn) btn.click();
            });
        }
    };

    try {
        const mapData = await loadMapData(num);
        if (mapData) {
            const customLayer = L.geoJSON(null, {
                style: tramoStyle,
                pointToLayer: (f, ll) => L.circleMarker(ll, { radius: 6, fillColor: "#A90F09", color: "#fff", weight: 2, fillOpacity: 0.8 }),
                onEachFeature: onEachFeat
            });
            if (mapData.type === 'geojson') {
                customLayer.addData(mapData.data);
                g.addLayer(customLayer);
                b = customLayer.getBounds();
                ok = true;
            } else if (mapData.type === 'kml') {
                if (typeof omnivore !== 'undefined' && omnivore.kml && omnivore.kml.parse) {
                    omnivore.kml.parse(mapData.data, null, customLayer);
                } else if (typeof parseKMLStringToGeoJSON === 'function') {
                    const feats = parseKMLStringToGeoJSON(mapData.data, num);
                    customLayer.addData({ type: 'FeatureCollection', features: feats });
                }
                g.addLayer(customLayer);
                b = customLayer.getBounds();
                ok = true;
            }
        }
    } catch (e) {
        console.error("Error en renderMap:", e);
    }

    if (!ok) {
        const la = parseFloat(row['LATITUD']), lo = parseFloat(row['LONGITUD']);
        if (!isNaN(la) && !isNaN(lo) && la !== 0) { g.addLayer(L.marker([la, lo])); m.setView([la, lo], 15); ok = true; }
    } else if (b && Object.keys(b).length > 0) {
        m.fitBounds(b, { padding: [40, 40], maxZoom: 17 });
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
                btn.className = 'w-full text-left px-3 py-2 text-[11px] leading-tight font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-800 rounded-lg transition border border-transparent focus:outline-none break-words whitespace-normal';
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
                        m.fitBounds(item.layer.getBounds(), { padding: [50, 50], maxZoom: 17 });
                    } else if (item.layer.getLatLng) {
                        m.setView(item.layer.getLatLng(), 16);
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

    if (ok) {
        ov.classList.add('hidden');
    } else {
        ms.innerHTML = '<i class="fa-solid fa-map-location-dot text-3xl mb-2 text-slate-400 opacity-50 block"></i>Sin trazado geográfico';
        ms.classList.remove('text-xs');
        ms.classList.add('text-sm', 'flex', 'flex-col', 'items-center', 'justify-center');
    }
}

// ------ L�"GICA MODAL DETALLE ------
function openModal(row) {
    const sysState = getSystemState(row['ESTADO CONVENIO']);

    // Configurar estado visual del modal
    document.getElementById('modal-state-band').style.background = sysState.hex;
    document.getElementById('modal-badge').className = `badge-estado ${sysState.badgeClass}`;
    document.getElementById('modal-badge').textContent = sysState.label;

    document.getElementById('modal-title').textContent = `${row['CONVENIO']}`;
    const modalMuniStr = String(row['MUNICIPIO'] || 'N/A').trim().toUpperCase();
    const modalEjecStr = String(row['CONVENIANTE EJECUTOR'] || '').trim().toUpperCase();
    let subTxt = `${row['MUNICIPIO']}`;
    if (modalEjecStr && modalEjecStr !== modalMuniStr && modalEjecStr !== 'N/A') subTxt += ` - ${row['CONVENIANTE EJECUTOR']}`;
    subTxt += ` - VIGENCIA ${row['VIGENCIA']}`;
    document.getElementById('modal-subtitle').textContent = subTxt;

    const btnSourcePdf = document.getElementById('btn-open-source-pdf');
    if (btnSourcePdf) {
        btnSourcePdf.href = `./assets/pdfs/${String(row['CONVENIO']).trim()}.pdf`;
    }



    document.getElementById('mod-objeto').textContent = row['OBJETO'] || 'Sin descripción u objeto definido.';

    document.getElementById('mod-via').textContent = row['VIA_PRIORIZADA'];
    const modAlcM = getRowLongitudContratada(row);
    const modAlcM2 = getRowAreaContratada(row);
    const modEjM = getRowLongitudEjecutada(row);
    const modEjM2 = getRowAreaEjecutada(row);
    document.getElementById('mod-alcance').textContent = `${formatNumber(modAlcM)} m / ${formatNumber(modAlcM2)} m²`;
    document.getElementById('mod-ejecutado-areas').textContent = `${formatNumber(modEjM)} m / ${formatNumber(modEjM2)} m²`;

    document.getElementById('mod-valor-total').textContent = formatCurrency(row['VALOR TOTAL']);
    document.getElementById('mod-aporte-depto').textContent = formatCurrency(row['APORTE DEPARTAMENTO']);
    document.getElementById('mod-aporte-mun').textContent = formatCurrency(row['APORTE MUNICIPIO']);
    const isEjecutorDiferente = (modalEjecStr && modalEjecStr !== modalMuniStr && modalEjecStr !== 'N/A');
    const lblAporteMun = document.getElementById('mod-lbl-aporte-mun');
    if (lblAporteMun) {
        if (isEjecutorDiferente) {
            lblAporteMun.textContent = `Aporte Conveniante Ejecutor (${row['CONVENIANTE EJECUTOR']})`;
        } else {
            lblAporteMun.textContent = 'Aporte Municipio';
        }
    }
    document.getElementById('mod-adicion-depto').textContent = formatCurrency(row['ADICION DEPARTAMENTO']);
    document.getElementById('mod-adicion-mun').textContent = formatCurrency(row['ADICION MUNICIPIO']);
    document.getElementById('mod-desembolsado-full').textContent = formatCurrency(row['VALOR TOTAL DESEMBOLSADO']);
    document.getElementById('mod-autorizado-full').textContent = formatCurrency(row['VALOR TOTAL AUTORIZADO']);

    document.getElementById('mod-suscripcion').textContent = row['FECHA DE SUSCRIPCION'] || row['FECHA DE SUSCRIPCI�N'] || 'Por definir';
    document.getElementById('mod-inicio').textContent = row['FECHA DE ACTA DE INICIO'] || 'Por definir';

    let plazoVal = 0;
    for (let key in row) {
        if (key.toUpperCase().trim() === 'PLAZO INICIAL' || key.toUpperCase().trim().includes('PLAZO INICIAL')) {
            plazoVal = parseNum(row[key]);
            break;
        }
    }

    const prorrogasVal = parseNum(row['PRORROGA (MESES)'] || row['PR�RROGA (MESES)']) || 0;
    const plazoTotal = plazoVal + prorrogasVal;

    document.getElementById('mod-plazo-inicial').textContent = plazoVal + ' Meses';
    document.getElementById('mod-plazo-total').textContent = plazoTotal + ' Meses';
    document.getElementById('mod-terminacion').textContent = row['FECHA DE TERMINACION'] || row['FECHA DE TERMINACI�N'] || '-';
    document.getElementById('mod-nueva-terminacion').textContent = row['NUEVA FECHA DE TERMINACION'] || row['NUEVA FECHA DE TERMINACI�N'] || 'Sin cambios';
    document.getElementById('mod-prorrogas').textContent = prorrogasVal + ' Meses';
    document.getElementById('mod-suspensiones').textContent = (row['SUSPENSION(MESES)'] || row['SUSPENSI�N(MESES)'] || 0) + ' Meses';
    document.getElementById('mod-observaciones').innerHTML = row['OBSERVACIONES'] ? row['OBSERVACIONES'].replace(/\n/g, '<br>') : 'Sin observaciones adicionales registradas.';

    const pf = row['FISICO_NORM'] || 0, pfn = row['FINANCIERO_NORM'] || 0;
    document.getElementById('mod-txt-fisico').textContent = pf.toFixed(1) + '%';
    document.getElementById('mod-bar-fisico').style.width = pf + '%';
    document.getElementById('mod-txt-financiero').textContent = pfn.toFixed(1) + '%';
    document.getElementById('mod-bar-financiero').style.width = pfn + '%';

    // Renderizar historial de visitas en el modal de detalle del convenio
    const detailVisitsList = document.getElementById('modal-detalle-visitas-list');
    if (detailVisitsList) {
        detailVisitsList.innerHTML = '';
        if (window.DIATDataService) {
            const allVisits = window.DIATDataService.getTechnicalVisits();
            const convenioVisits = allVisits.filter(v => String(v.convenioId).trim() === String(row['CONVENIO']).trim());
            if (convenioVisits.length === 0) {
                detailVisitsList.innerHTML = `<div class="text-center py-4 text-slate-400 font-medium text-xs italic">No se registran visitas técnicas para este convenio.</div>`;
            } else {
                convenioVisits.forEach(v => {
                    const item = document.createElement('div');
                    item.className = 'p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition cursor-pointer';

                    let photosCountHtml = '';
                    if (v.photos && v.photos.length > 0) {
                        photosCountHtml = `<span class="text-institutional-primary font-bold"><i class="fa-solid fa-camera mr-1"></i>${v.photos.length} foto${v.photos.length > 1 ? 's' : ''}</span>`;
                    }

                    item.innerHTML = `
                        <div class="flex justify-between items-center mb-1.5">
                            <span class="bg-institutional-pale text-institutional-primary px-1.5 py-0.5 rounded font-bold text-[9px] uppercase">${v.tipo}</span>
                            <span class="text-[9px] text-slate-400 font-semibold">${v.fecha}</span>
                        </div>
                        <p class="text-[10px] text-slate-600 line-clamp-2 leading-relaxed mb-1.5 font-medium">${v.observaciones || 'Sin observaciones.'}</p>
                        <div class="flex justify-between items-center text-[9px] text-slate-400 font-semibold">
                            <span>Por: ${v.usuario || 'N/A'}</span>
                            ${photosCountHtml}
                        </div>
                    `;
                    item.addEventListener('click', (e) => {
                        window.openVisitDetailModal(v.id);
                    });
                    detailVisitsList.appendChild(item);
                });
            }
        }
    }

    document.getElementById('modal-detalle').classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
        renderMap(row, 'map', 'map-overlay', 'map-msg', mapInstance, (ni, ng) => {
            mapInstance = ni; currentLayerGroup = ng;
        });
    }, 250);

    const emp = document.getElementById('mod-galeria-empty');
    const galAntes = document.getElementById('mod-galeria-antes');
    const galDurante = document.getElementById('mod-galeria-durante');
    const galDespues = document.getElementById('mod-galeria-despues');
    if (galAntes) galAntes.innerHTML = '';
    if (galDurante) galDurante.innerHTML = '';
    if (galDespues) galDespues.innerHTML = '';
    emp.classList.add('hidden'); currentGalleryImages = [];
    const n = String(row['CONVENIO']).trim();

    const updateGalleryVisibility = () => {
        const totalImgs = document.querySelectorAll('#mod-galeria img').length;
        if (totalImgs > 0) {
            emp.classList.add('hidden');
        } else {
            emp.classList.remove('hidden');
        }

        [
            { gal: galAntes },
            { gal: galDurante },
            { gal: galDespues }
        ].forEach(item => {
            if (item.gal) {
                const imgs = item.gal.querySelectorAll('img').length;
                if (imgs === 0 && item.gal.parentElement) {
                    item.gal.parentElement.classList.add('hidden');
                } else if (item.gal.parentElement) {
                    item.gal.parentElement.classList.remove('hidden');
                }
            }
        });
    };

    // ── Carga de fotos desde index.json (soporta cualquier nombre de archivo) ──
    const addPhotoToGallery = (src, label, container) => {
        const domImg = document.createElement('img');
        domImg.className = 'w-full h-24 object-cover rounded-lg cursor-pointer hover:ring-2 hover:ring-institutional-light transition-all shadow-sm';
        domImg.setAttribute('data-stage', label);
        domImg.setAttribute('data-folder', label);
        domImg.onload = () => { container.appendChild(domImg); updateGalleryVisibility(); };
        domImg.onerror = () => domImg.remove();
        domImg.onclick = () => {
            currentGalleryImages = Array.from(document.querySelectorAll('#mod-galeria img')).map(e => e.src);
            openLightbox(currentGalleryImages.indexOf(domImg.src));
        };
        domImg.src = src;
    };

    const removeLoading = () => {
        const el = document.getElementById('mod-galeria-loading');
        if (el) el.remove();
    };

    // Mostrar indicador de carga
    let loadingEl = document.getElementById('mod-galeria-loading');
    if (!loadingEl) {
        loadingEl = document.createElement('div');
        loadingEl.id = 'mod-galeria-loading';
        loadingEl.className = 'flex flex-col items-center justify-center py-12 text-slate-400 gap-2 font-medium text-xs w-full';
        loadingEl.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin text-lg text-white/50"></i>
            <span class="text-white/50">Cargando fotos desde Google Drive...</span>
        `;
    }
    const modGaleria = document.getElementById('mod-galeria');
    if (modGaleria) {
        modGaleria.appendChild(loadingEl);
    }

    const loadLocalStoragePhotos = () => {
        try {
            const localPhotos = JSON.parse(localStorage.getItem('diat_photos_' + n)) || [];
            localPhotos.forEach(photo => {
                if (photo && photo.base64 && galDespues) {
                    addPhotoToGallery(photo.base64, 'Después', galDespues);
                }
            });
        } catch (e) {
            console.error("Error cargando fotos de localStorage:", e);
        }
        removeLoading();
        updateGalleryVisibility();
    };

    const loadLocalPhotosFallback = () => {
        fetch(`./assets/fotos/${n}/index.json`)
            .then(r => r.ok ? r.json() : null)
            .then(idx => {
                if (idx) {
                    const loadFromIndex = (fileList, container, label) => {
                        if (!container || !fileList || fileList.length === 0) return;
                        fileList.forEach(relPath => {
                            addPhotoToGallery(`./assets/fotos/${n}/${relPath}`, label, container);
                        });
                    };
                    loadFromIndex(idx.antes, galAntes, 'Antes');
                    loadFromIndex(idx.durante, galDurante, 'Durante');
                    loadFromIndex(idx.despues, galDespues, 'Después');
                } else {
                    const extensions = ['jpg', 'jpeg', 'png', 'jfif', 'JPG', 'JPEG', 'PNG', 'JFIF'];
                    const loadImages = (foldersList, container, label) => {
                        if (!container) return;
                        for (let i = 1; i <= 15; i++) {
                            let found = false;
                            const tryCombination = (fi, ei) => {
                                if (found || fi >= foldersList.length) return;
                                if (ei >= extensions.length) { tryCombination(fi + 1, 0); return; }
                                const img = new Image();
                                const src = `./assets/fotos/${n}/${foldersList[fi]}/${i}.${extensions[ei]}`;
                                img.onload = () => { if (found) return; found = true; addPhotoToGallery(src, label, container); };
                                img.onerror = () => tryCombination(fi, ei + 1);
                                img.src = src;
                            };
                            tryCombination(0, 0);
                        }
                    };
                    loadImages(['Antes', 'antes'], galAntes, 'Antes');
                    loadImages(['Durante', 'durante'], galDurante, 'Durante');
                    loadImages(['Despues', 'Después', 'despues', 'después'], galDespues, 'Después');
                }
            })
            .catch(() => { /* sin fotos o sin acceso */ })
            .finally(() => {
                loadLocalStoragePhotos();
            });
    };

    const appsScriptUrl = "https://script.google.com/macros/s/AKfycbwXBFslIOCwVCyAae8-FG0VL5pqotLkjejwJhavm5xoGU4SlyVETwRkGCmDNVkcRPw4/exec";
    fetch(`${appsScriptUrl}?convenio=${encodeURIComponent(n)}`)
        .then(r => r.ok ? r.json() : null)
        .then(idx => {
            const hasPhotos = idx && ((idx.antes && idx.antes.length > 0) || (idx.durante && idx.durante.length > 0) || (idx.despues && idx.despues.length > 0));
            if (hasPhotos) {
                const loadFromIndex = (fileList, container, label) => {
                    if (!container || !fileList || fileList.length === 0) return;
                    fileList.forEach(url => {
                        addPhotoToGallery(url, label, container);
                    });
                };
                loadFromIndex(idx.antes, galAntes, 'Antes');
                loadFromIndex(idx.durante, galDurante, 'Durante');
                loadFromIndex(idx.despues, galDespues, 'Después');
                loadLocalStoragePhotos();
            } else {
                loadLocalPhotosFallback();
            }
        })
        .catch(() => {
            loadLocalPhotosFallback();
        });

    setTimeout(updateGalleryVisibility, 2000);
}

function closeModal() { document.getElementById('modal-detalle').classList.add('hidden'); document.body.style.overflow = 'auto'; }
function openLightbox(i) { currentImageIndex = i; updateLightbox(); document.getElementById('modal-lightbox').classList.remove('hidden'); }
function closeLightbox() { document.getElementById('modal-lightbox').classList.add('hidden'); }
function updateLightbox() {
    if (currentGalleryImages.length === 0) return;
    const im = document.getElementById('lightbox-img'); im.style.opacity = 0;
    setTimeout(() => { im.src = currentGalleryImages[currentImageIndex]; im.style.opacity = 1; }, 150);
    document.getElementById('lightbox-counter').textContent = `${currentImageIndex + 1} / ${currentGalleryImages.length}`;
    const bp = document.getElementById('btn-prev-img'), bn = document.getElementById('btn-next-img');
    if (currentGalleryImages.length > 1) { bp.classList.remove('hidden'); bn.classList.remove('hidden'); } else { bp.classList.add('hidden'); bn.classList.add('hidden'); }
}
function navigateLightbox(d) {
    if (currentGalleryImages.length <= 1) return;
    currentImageIndex = (currentImageIndex + d + currentGalleryImages.length) % currentGalleryImages.length;
    updateLightbox();
}

function changePage(d) { currentPage += d; renderTable(); }
function sortTable(c) { currentSort.asc = (currentSort.column === c) ? !currentSort.asc : true; currentSort.column = c; filteredData.sort((a, b) => (a[c] > b[c] ? 1 : -1) * (currentSort.asc ? 1 : -1)); renderTable(); }
function exportToCSV() { const ws = XLSX.utils.json_to_sheet(filteredData); const csv = XLSX.utils.sheet_to_csv(ws); const blob = new Blob(["\ufeff", csv], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "convenios_margarita.csv"; link.click(); }

document.addEventListener('click', (e) => {
    const btn = e.target.closest('.alert-filter-btn');
    if (btn) {
        document.querySelectorAll('.alert-filter-btn').forEach(b => {
            b.classList.remove('active');
        });
        btn.classList.add('active');
        currentAlertFilter = btn.dataset.filter;
        renderAlerts();
    }
});



// ====== PESTAÑA 2: MAPA TERRITORIAL — MapLibre GL JS ======
let mlMap = null;           // Instancia principal MapLibre GL
let mlMapReady = false;     // Flag: mapa y estilo cargados
let mlKmlGeojson = null;    // GeoJSON acumulado de convenios
let mlVialData = { primaria: null, secundaria: null, terciaria: null }; // Caché de GeoJSON de vías
let mlMpioData = null;      // Caché de GeoJSON de municipios de Antioquia
let mlSearchMarker = null;  // Marcador temporal del buscador de mapa
let currentMLPopup = null;   // Popup informativo activo en el mapa

// Estado de visibilidad de capas
let mlLayersState = {
    municipios: true,
    subregiones: false,
    primaria: false,
    secundaria: false,
    terciaria: false,
    tramosKml: true,
    terrain: false
};

// Colores simbología
const ML_COLORS = {
    kml: '#0066FF',    // Azul eléctrico — convenios (prioridad 1)
    primaria: '#e53e3e',    // Rojo — vías primarias
    secundaria: '#38a169',    // Verde — vías secundarias
    terciaria_municipal: '#d69e2e', // Amarillo — terciaria municipal
    terciaria_invias: '#ed8936', // Naranja — terciaria INVIAS
    municipios_fill: 'transparent',
    municipios_line: '#94a3b8',
    sub_colors: {
        'VALLE DE ABURRÁ': '#c68664', 'VALLE DE ABURRA': '#c68664',
        'ORIENTE': '#ffb74d',
        'NORDESTE': '#fefb9e',
        'NORTE': '#faa4b1',
        'OCCIDENTE': '#ffee55',
        'SUROESTE': '#df9ae1',
        'URABÁ': '#a2d984', 'URABA': '#a2d984',
        'BAJO CAUCA': '#dca2e8',
        'MAGDALENA MEDIO': '#ffa1a1',
        'OTRAS': '#e2e8f0'
    }
};

// ── Helper: construye HTML del popup ──────────────────────────────────────────
function buildMLPopupHTML(props, headerColor, badgeText, titleText, showFichaBtn, rowData) {
    const skip = new Set(['styleUrl', 'visibility', 'name', 'Name', 'NAME', 'description', 'Description', 'FolderName']);
    const rows = Object.entries(props || {})
        .filter(([k, v]) => !skip.has(k) && v !== null && v !== undefined && String(v).trim() !== '')
        .map(([k, v]) => `<tr><td>${k}</td><td>${String(v)}</td></tr>`)
        .join('');

    const table = rows
        ? `<table class="ml-popup-table">${rows}</table>`
        : `<p style="font-size:10px;color:#94a3b8;font-style:italic;padding:4px 0">Sin atributos disponibles.</p>`;

    const fichaBtn = showFichaBtn && rowData
        ? `<button class="ml-popup-action-btn" onclick="(function(){document.querySelector('.maplibregl-popup-close-button')?.click();openModal(${JSON.stringify(rowData).replace(/"/g, "'")})})()">
               <i class="fa-solid fa-folder-open mr-1"></i> Ver Ficha Técnica del Convenio
           </button>`
        : '';

    return `
        <div class="ml-popup-header" style="background:linear-gradient(135deg,${headerColor}dd,${headerColor})">
            <div class="ml-popup-header-badge">${badgeText}</div>
            <div class="ml-popup-header-title">${titleText}</div>
        </div>
        <div class="ml-popup-body">
            ${table}
            ${fichaBtn}
        </div>`;
}

// ── Helper: muestra popup en mapa ─────────────────────────────────────────────
function showMLPopup(lngLat, html) {
    if (!mlMap) return;
    if (currentMLPopup) {
        currentMLPopup.remove();
    }
    currentMLPopup = new maplibregl.Popup({
        closeButton: true,
        maxWidth: '320px',
        offset: 0,
        className: 'map-info-popup'
    })
        .setLngLat(lngLat)
        .setHTML(html)
        .addTo(mlMap);

    currentMLPopup.on('close', () => {
        currentMLPopup = null;
    });
}

// ── FUNCIONES AUXILIARES DE CLICK GLOBALES ─────────────────────────────────────
function handleKmlClick(e, feature) {
    const props = feature.properties || {};
    const convNum = String(props.CONVENIO || props.convenio || props.Convenio || props.NUMERO || props.codigo || '').trim();
    const rowData = rawData.find(r => String(r['CONVENIO']).trim() === convNum) || null;

    const sysState = rowData ? getSystemState(rowData['ESTADO CONVENIO']) : null;
    const headerColor = sysState ? sysState.hex : ML_COLORS.kml;
    const badgeText = sysState ? `Convenio — ${sysState.label}` : 'Tramo KML';
    const titleText = props.name || props.Name || props.NOMBRE_VIA || props.OBJETO || `Convenio ${convNum}` || 'Tramo de Convenio';

    const cleanProps = {
        'Convenio': convNum,
        'Estado': rowData ? rowData['ESTADO CONVENIO'] : (props._estado || 'N/A'),
        'Municipio': rowData ? rowData['MUNICIPIO'] : (props.MUNICIPIO || props.municipio || 'N/A')
    };

    const popupCoord = feature.geometry.type === 'Point'
        ? feature.geometry.coordinates.slice()
        : e.lngLat;

    const html = buildMLPopupHTML(cleanProps, headerColor, badgeText, titleText, !!rowData, rowData);
    showMLPopup(popupCoord, html);
}

function handleVialClick(e, feature, optLayerId) {
    const props = feature.properties || {};
    const lid = (feature.layer && feature.layer.id) || optLayerId || '';
    const id = lid.replace('vial-', '');
    const color = ML_COLORS[id] || '#94a3b8';

    const layerNames = { primaria: 'Vía Primaria', secundaria: 'Vía Secundaria', terciaria: 'Vía Terciaria' };
    const competente = props.COMPETENTE || props.ADMINISTR || '';
    const actualColor = id === 'terciaria'
        ? (competente.toUpperCase().includes('INVIAS') ? ML_COLORS.terciaria_invias : ML_COLORS.terciaria_municipal)
        : color;
    const titleText = props.NOMBRE_VIA || props.NOMBRE || props.name || layerNames[id];
    const html = buildMLPopupHTML(props, actualColor, layerNames[id], titleText, false, null);
    showMLPopup(e.lngLat, html);
}

function handleSubregionClick(e, feature) {
    const props = feature.properties || {};
    const muni = props.NOMBRE_MPI || props.MPIO_CNMBR || props.NOM_MPIO || 'Municipio';
    const sub = props._subregion || 'N/A';
    const subColor = ML_COLORS.sub_colors[sub] || '#94a3b8';
    const popProps = { ...props };
    delete popProps._subregion;
    const html = buildMLPopupHTML(popProps, subColor, 'División Territorial', `${muni} — ${sub}`, false, null);
    showMLPopup(e.lngLat, html);
}

// ── Inicializar el mapa MapLibre GL JS ────────────────────────────────────────
async function renderMapTab() {
    if (!mlMap) {
        // Crear instancia del mapa
        mlMap = new maplibregl.Map({
            container: 'main-map',
            center: [-75.55, 6.85],
            zoom: 7.3,
            pitch: 0, // Vista plana en planta (sin inclinación 3D inicial)
            bearing: 0,
            maxZoom: 18,
            minZoom: 5,
            attributionControl: false
        });

        mlMap.setStyle('https://tiles.openfreemap.org/styles/bright', {
            transformStyle: (previousStyle, nextStyle) => {
                nextStyle.projection = { type: 'globe' };
                nextStyle.sources = {
                    ...nextStyle.sources,
                    satelliteSource: {
                        type: 'raster',
                        tiles: [
                            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                        ],
                        tileSize: 256,
                        maxzoom: 17
                    },
                    terrainSource: {
                        type: 'raster-dem',
                        tiles: [
                            'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'
                        ],
                        encoding: 'terrarium',
                        tileSize: 256
                    },
                    hillshadeSource: {
                        type: 'raster-dem',
                        tiles: [
                            'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'
                        ],
                        encoding: 'terrarium',
                        tileSize: 256
                    }
                };
                if (mlLayersState.terrain) {
                    nextStyle.terrain = {
                        source: 'terrainSource',
                        exaggeration: 1
                    };
                }

                nextStyle.sky = {
                    'atmosphere-blend': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        0, 1,
                        2, 0
                    ],
                };

                // 1. Filtrar y eliminar todas las líneas viales del mapa base que saturan la vista satelital
                nextStyle.layers = nextStyle.layers.filter(layer => {
                    const layerId = (layer.id || '').toLowerCase();
                    const sourceLayer = (layer['source-layer'] || '').toLowerCase();

                    const isBaseRoad = layerId.includes('road') ||
                        layerId.includes('highway') ||
                        layerId.includes('transport') ||
                        layerId.includes('street') ||
                        layerId.includes('tunnel') ||
                        layerId.includes('bridge') ||
                        layerId.includes('path') ||
                        layerId.includes('track') ||
                        layerId.includes('way') ||
                        sourceLayer.includes('transportation') ||
                        sourceLayer.includes('road');

                    return !isBaseRoad;
                });

                nextStyle.layers.push({
                    id: 'hills',
                    type: 'hillshade',
                    source: 'hillshadeSource',
                    layout: { visibility: mlLayersState.terrain ? 'visible' : 'none' },
                    paint: { 'hillshade-shadow-color': '#473B24' }
                });

                const firstNonFillLayer = nextStyle.layers.find(layer => layer.type !== 'fill' && layer.type !== 'background');
                const insertIndex = firstNonFillLayer ? nextStyle.layers.indexOf(firstNonFillLayer) : 0;
                nextStyle.layers.splice(insertIndex, 0, {
                    id: 'satellite',
                    type: 'raster',
                    source: 'satelliteSource',
                    layout: { visibility: 'visible' },
                    paint: { 'raster-opacity': 1 }
                });

                return nextStyle;
            }
        });

        // Controles de navegación
        mlMap.addControl(
            new maplibregl.NavigationControl({
                visualizePitch: true,
                showZoom: true,
                showCompass: true
            }),
            'bottom-right'
        );
        mlMap.addControl(new maplibregl.ScaleControl({ unit: 'metric', maxWidth: 100 }), 'bottom-left');
        mlMap.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');
        mlMap.addControl(new maplibregl.GlobeControl(), 'bottom-right');
        mlMap.addControl(
            new maplibregl.TerrainControl({
                source: 'terrainSource',
                exaggeration: 1
            }),
            'bottom-right'
        );

        // Evento: estilo cargado → añadir fuentes y capas
        mlMap.on('load', async () => {
            mlMapReady = true;

            // ── FUENTE: MUNICIPIOS (mpio.json) ──────────────────────────────
            try {
                const mpioResp = await fetch('./mpio.json');
                if (mpioResp.ok) {
                    let mpioData = await mpioResp.json();

                    // Filtrar para mostrar únicamente los municipios de Antioquia (código de departamento DPTO === '05')
                    mpioData.features = mpioData.features.filter(f => {
                        const dpto = String(f.properties.DPTO || '').trim();
                        const nomDpt = String(f.properties.NOMBRE_DPT || f.properties.NOM_DEPART || '').trim().toUpperCase();
                        return dpto === '05' || dpto === '5' || nomDpt.includes('ANTIOQUIA');
                    });

                    // Enriquecer con subregión
                    // Normalizador robusto
                    const normMuniName = (s) => String(s)
                        .toUpperCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '') // quita tildes/diacríticos: ñ→n, é→e, etc.
                        .replace(/[^A-Z ]/g, '')         // quita cualquier otro char no alfabético
                        .replace(/\s+/g, ' ')
                        .trim();

                    mpioData.features.forEach((f, idx) => {
                        f.id = idx + 1;
                        // Limpiar caracteres corruptos en las propiedades del municipio para mostrar la Ñ correcta
                        ['NOMBRE_MPI', 'MPIO_CNMBR', 'NOM_MPIO'].forEach(key => {
                            if (f.properties[key]) {
                                f.properties[key] = String(f.properties[key])
                                    .replace(/\uFFFD/g, 'Ñ')
                                    .replace(/\?/g, 'Ñ')
                                    .replace(/¥/g, 'Ñ')
                                    .replace(/\u00A5/g, 'Ñ');
                            }
                        });

                        const rawName = f.properties.NOMBRE_MPI || f.properties.MPIO_CNMBR || f.properties.NOM_MPIO || '';
                        const muniNorm = normMuniName(rawName);
                        let subregion = 'OTRAS';
                        outer:
                        for (const [sub, munis] of Object.entries(antioquiaSubregiones)) {
                            for (const m of munis) {
                                if (normMuniName(m) === muniNorm) {
                                    subregion = sub;
                                    break outer;
                                }
                            }
                        }
                        f.properties._subregion = subregion;
                    });


                    // --- DISOLVER MUNICIPIOS EN SUBREGIONES Y DEPARTAMENTO CON TURF.JS ---
                    let subregionesFeatures = [];
                    let antioquiaFeature = null;

                    if (typeof turf !== 'undefined') {
                        try {
                            // 1. Crear polígonos disueltos por subregión
                            for (const subName of Object.keys(antioquiaSubregiones)) {
                                const subFeatures = mpioData.features.filter(f => f.properties._subregion === subName);
                                if (subFeatures.length > 0) {
                                    let unioned = JSON.parse(JSON.stringify(subFeatures[0]));
                                    for (let i = 1; i < subFeatures.length; i++) {
                                        try {
                                            unioned = turf.union(unioned, subFeatures[i]);
                                        } catch (e) {
                                            console.warn(`Error disolviendo municipio ${subFeatures[i].properties.NOMBRE_MPI} en subregión ${subName}:`, e);
                                        }
                                    }
                                    if (unioned) {
                                        unioned.properties = { _subregion: subName };
                                        subregionesFeatures.push(unioned);
                                    }
                                }
                            }

                            // 2. Crear polígono disuelto del Departamento completo
                            if (subregionesFeatures.length > 0) {
                                let deptUnioned = JSON.parse(JSON.stringify(subregionesFeatures[0]));
                                for (let i = 1; i < subregionesFeatures.length; i++) {
                                    try {
                                        deptUnioned = turf.union(deptUnioned, subregionesFeatures[i]);
                                    } catch (e) {
                                        console.warn(`Error disolviendo subregión ${subregionesFeatures[i].properties._subregion} para departamento:`, e);
                                    }
                                }
                                if (deptUnioned) {
                                    deptUnioned.properties = { nombre: 'ANTIOQUIA' };
                                    antioquiaFeature = deptUnioned;
                                }
                            }
                        } catch (turfError) {
                            console.error("Error al disolver con Turf.js:", turfError);
                        }
                    }

                    // Registrar fuentes en el mapa
                    mlMap.addSource('municipios-src', { type: 'geojson', data: mpioData });
                    mlMpioData = mpioData;

                    // Fuente para subregiones disueltas
                    const subregionesGeoJSON = { type: 'FeatureCollection', features: subregionesFeatures };
                    mlMap.addSource('subregiones-disueltas-src', { type: 'geojson', data: subregionesGeoJSON });

                    // Fuente para departamento disuelto
                    if (antioquiaFeature) {
                        mlMap.addSource('antioquia-dpto-src', { type: 'geojson', data: antioquiaFeature });

                        // --- MÁSCARA EXTERIOR INVERTIDA: Opacar todo el contexto fuera de Antioquia ---
                        try {
                            const worldPoly = [[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]];
                            let antioquiaRings = [];
                            if (antioquiaFeature.geometry.type === 'Polygon') {
                                antioquiaRings = [antioquiaFeature.geometry.coordinates[0]];
                            } else if (antioquiaFeature.geometry.type === 'MultiPolygon') {
                                antioquiaRings = antioquiaFeature.geometry.coordinates.map(poly => poly[0]);
                            }
                            if (antioquiaRings.length > 0) {
                                const maskGeoJSON = {
                                    type: 'FeatureCollection',
                                    features: [{
                                        type: 'Feature',
                                        properties: {},
                                        geometry: {
                                            type: 'Polygon',
                                            coordinates: [worldPoly, ...antioquiaRings]
                                        }
                                    }]
                                };
                                mlMap.addSource('outside-antioquia-src', { type: 'geojson', data: maskGeoJSON });
                            }
                        } catch (maskErr) {
                            console.warn("Error creando mascara exterior:", maskErr);
                        }
                    }

                    // --- CAPAS DEL MAPA ---

                    // 0. Capa: Máscara exterior invertida (opacar todo lo que está fuera de Antioquia)
                    if (mlMap.getSource('outside-antioquia-src')) {
                        mlMap.addLayer({
                            id: 'outside-antioquia-mask',
                            type: 'fill',
                            source: 'outside-antioquia-src',
                            layout: { visibility: 'visible' },
                            paint: {
                                'fill-color': '#0F172A',
                                'fill-opacity': 0.62
                            }
                        });
                    }

                    // Centrar y encuadrar el departamento de Antioquia en vista plana 2D
                    try {
                        mlMap.fitBounds([
                            [-77.15, 5.4],
                            [-73.85, 8.88]
                        ], {
                            padding: { top: 30, bottom: 30, left: 30, right: 30 },
                            pitch: 0,
                            bearing: 0,
                            animate: false
                        });
                    } catch (fitErr) { }

                    // 1. Capa: Relleno por subregión (usando las disueltas)
                    mlMap.addLayer({
                        id: 'subregiones-fill',
                        type: 'fill',
                        source: 'subregiones-disueltas-src',
                        layout: { visibility: mlLayersState.subregiones ? 'visible' : 'none' },
                        paint: {
                            'fill-color': [
                                'match', ['get', '_subregion'],
                                'VALLE DE ABURRÁ', '#c68664', 'VALLE DE ABURRA', '#c68664',
                                'ORIENTE', '#ffb74d',
                                'NORDESTE', '#fefb9e',
                                'NORTE', '#faa4b1',
                                'OCCIDENTE', '#ffee55',
                                'SUROESTE', '#df9ae1',
                                'URABÁ', '#a2d984', 'URABA', '#a2d984',
                                'BAJO CAUCA', '#dca2e8',
                                'MAGDALENA MEDIO', '#ffa1a1',
                                '#e2e8f0'
                            ],
                            'fill-opacity': 0.4
                        }
                    });

                    // 2. Capa: Contorno de subregiones (líneas limpias sin relleno de fondo por defecto)
                    mlMap.addLayer({
                        id: 'subregiones-line',
                        type: 'line',
                        source: 'subregiones-disueltas-src',
                        layout: { visibility: 'visible' },
                        paint: {
                            'line-color': '#1E293B', // Tono pizarra oscuro muy elegante
                            'line-width': [
                                'interpolate', ['linear'], ['zoom'],
                                5, 1.2,
                                8, 2.0,
                                12, 3.0
                            ],
                            'line-opacity': 0.75
                        }
                    });

                    // 3. Capa: Contorno exterior del departamento de Antioquia (línea verde encendida muy marcada)
                    if (antioquiaFeature) {
                        mlMap.addLayer({
                            id: 'antioquia-dpto-line',
                            type: 'line',
                            source: 'antioquia-dpto-src',
                            layout: { visibility: 'visible' },
                            paint: {
                                'line-color': '#00E676', // Verde encendido brillante (no se confunde con vías secundarias)
                                'line-width': [
                                    'interpolate', ['linear'], ['zoom'],
                                    5, 2.8,
                                    8, 4.0,
                                    12, 6.0
                                ],
                                'line-opacity': 0.95
                            }
                        });

                        // Sombra exterior para darle relieve premium de elevación
                        mlMap.addLayer({
                            id: 'antioquia-dpto-glow',
                            type: 'line',
                            source: 'antioquia-dpto-src',
                            layout: { visibility: 'visible' },
                            paint: {
                                'line-color': '#00E676',
                                'line-width': [
                                    'interpolate', ['linear'], ['zoom'],
                                    5, 6,
                                    8, 10,
                                    12, 15
                                ],
                                'line-opacity': 0.45,
                                'line-blur': 4
                            }
                        }, 'antioquia-dpto-line');
                    }

                    // 4. Capa: contorno municipios (delicada, oculta al inicio)
                    mlMap.addLayer({
                        id: 'municipios-line',
                        type: 'line',
                        source: 'municipios-src',
                        layout: { visibility: mlLayersState.municipios ? 'visible' : 'none' },
                        paint: {
                            'line-color': '#94a3b8',
                            'line-width': 0.4,
                            'line-opacity': 0.5
                        }
                    });

                    // 5. Capa: hover subregiones
                    mlMap.addLayer({
                        id: 'subregiones-fill-hover',
                        type: 'fill',
                        source: 'subregiones-disueltas-src',
                        layout: { visibility: mlLayersState.subregiones ? 'visible' : 'none' },
                        paint: {
                            'fill-color': ['case', ['boolean', ['feature-state', 'blink'], false], '#ffee55', '#3561AB'],
                            'fill-opacity': ['case',
                                ['boolean', ['feature-state', 'blink'], false], 0.65,
                                ['boolean', ['feature-state', 'hover'], false], 0.25,
                                0
                            ]
                        }
                    });

                    // 6. Etiquetas de municipios (ocultas al inicio)
                    mlMap.addLayer({
                        id: 'municipios-labels',
                        type: 'symbol',
                        source: 'municipios-src',
                        minzoom: 9,
                        layout: {
                            visibility: mlLayersState.municipios ? 'visible' : 'none',
                            'text-field': ['get', 'NOMBRE_MPI'],
                            'text-size': ['interpolate', ['linear'], ['zoom'], 9, 9, 13, 12],
                            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                            'text-anchor': 'center',
                            'text-allow-overlap': false
                        },
                        paint: {
                            'text-color': '#1e293b',
                            'text-halo-color': 'rgba(255,255,255,0.85)',
                            'text-halo-width': 1.5
                        }
                    });

                    // Hover interactivo sobre municipios manejado en el listener unificado del mapa


                }
            } catch (err) {
                console.warn('Error cargando mpio.json:', err);
            }

            // ── FUENTE: RED VIAL (carga diferida) ───────────────────────────
            const loadingEl = document.getElementById('map-layers-loading');

            async function loadVialSource(id, url, color, width, minzoom) {
                try {
                    if (loadingEl) { loadingEl.textContent = `⏳ Cargando ${id}...`; loadingEl.classList.remove('hidden'); }
                    const resp = await fetch(url);
                    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                    const data = await resp.json();
                    if (data.features) {
                        data.features.forEach((f, idx) => {
                            f.id = idx + 1;
                        });
                    }

                    mlMap.addSource(`vial-${id}`, { type: 'geojson', data });
                    mlVialData[id] = data;

                    // Capa de sombra/glow (solo primaria)
                    if (id === 'primaria') {
                        mlMap.addLayer({
                            id: `vial-${id}-glow`,
                            type: 'line',
                            source: `vial-${id}`,
                            minzoom,
                            layout: { visibility: 'visible', 'line-cap': 'round', 'line-join': 'round' },
                            paint: {
                                'line-color': color,
                                'line-width': width + 4,
                                'line-opacity': 0.15,
                                'line-blur': 4
                            }
                        }, 'kml-convenios-glow'); // Insertar DEBAJO de KML
                    }

                    mlMap.addLayer({
                        id: `vial-${id}`,
                        type: 'line',
                        source: `vial-${id}`,
                        minzoom,
                        layout: { visibility: 'visible', 'line-cap': 'round', 'line-join': 'round' },
                        paint: {
                            'line-color': id === 'terciaria'
                                ? ['case',
                                    ['==', ['upcase', ['coalesce', ['get', 'COMPETENTE'], ['get', 'ADMINISTR'], '']], 'INVIAS'],
                                    ML_COLORS.terciaria_invias,
                                    ML_COLORS.terciaria_municipal
                                ]
                                : color,
                            'line-width': ['interpolate', ['linear'], ['zoom'],
                                7, width * 0.6,
                                10, width,
                                14, width * 1.5
                            ],
                            'line-opacity': 0.85
                        }
                    }, 'kml-convenios-glow'); // Insertar DEBAJO de KML

                    // Capa de hover (resaltado blanco al pasar el mouse)
                    mlMap.addLayer({
                        id: `vial-${id}-hover`,
                        type: 'line',
                        source: `vial-${id}`,
                        minzoom,
                        layout: { visibility: 'visible', 'line-cap': 'round', 'line-join': 'round' },
                        paint: {
                            'line-color': ['case', ['boolean', ['feature-state', 'blink'], false], '#ffee55', '#ffffff'],
                            'line-width': ['interpolate', ['linear'], ['zoom'],
                                7, (width * 0.6) + 2,
                                10, width + 3,
                                14, (width * 1.5) + 4
                            ],
                            'line-opacity': ['case',
                                ['boolean', ['feature-state', 'blink'], false], 0.9,
                                ['boolean', ['feature-state', 'hover'], false], 0.8,
                                0
                            ]
                        }
                    }, 'kml-convenios-glow');



                    return true;
                } catch (err) {
                    console.warn(`Error cargando vial-${id}:`, err);
                    return false;
                }
            }

            // ── CAPAS PLACEHOLDER para KML (deben existir antes de insertar viales) ──
            mlMap.addSource('kml-convenios-src', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });

            // KML — capa glow (debajo) — siempre encima por orden de addLayer
            mlMap.addLayer({
                id: 'kml-convenios-glow',
                type: 'line',
                source: 'kml-convenios-src',
                layout: { visibility: 'visible', 'line-cap': 'round', 'line-join': 'round' },
                paint: {
                    'line-color': ML_COLORS.kml,
                    'line-width': 14,
                    'line-opacity': 0.2,
                    'line-blur': 6
                }
            });

            // KML — capa principal
            mlMap.addLayer({
                id: 'kml-convenios',
                type: 'line',
                source: 'kml-convenios-src',
                layout: { visibility: 'visible', 'line-cap': 'round', 'line-join': 'round' },
                paint: {
                    'line-color': ML_COLORS.kml,
                    'line-width': ['interpolate', ['linear'], ['zoom'], 7, 3, 12, 6, 16, 9],
                    'line-opacity': 0.95
                }
            });

            // KML — hover highlight
            mlMap.addLayer({
                id: 'kml-convenios-hover',
                type: 'line',
                source: 'kml-convenios-src',
                layout: { visibility: 'visible', 'line-cap': 'round', 'line-join': 'round' },
                paint: {
                    'line-color': ['case', ['boolean', ['feature-state', 'blink'], false], '#ffee55', '#ffffff'],
                    'line-width': ['interpolate', ['linear'], ['zoom'], 7, 5, 12, 9, 16, 13],
                    'line-opacity': ['case',
                        ['boolean', ['feature-state', 'blink'], false], 0.9,
                        ['boolean', ['feature-state', 'hover'], false], 0.9,
                        0
                    ]
                }
            });

            // ── Cargar viales en paralelo (secundaria y terciaria son grandes) ──
            await loadVialSource('primaria', './data/Primaria.geojson', ML_COLORS.primaria, 3, 6);
            await loadVialSource('secundaria', './data/Secundaria.geojson', ML_COLORS.secundaria, 2.5, 7);
            await loadVialSource('terciaria', './data/Terciaria.geojson', ML_COLORS.terciaria_municipal, 2, 8);

            if (loadingEl) loadingEl.classList.add('hidden');

            // ── Interacción de hover unificada (KML, Red Vial y Municipios) ─────────────
            let hoveredKmlId = null;
            let hoveredVialInfo = null; // { id: layerId, featureId: featId }
            let hoveredMuniId = null;

            mlMap.on('mousemove', (e) => {
                if (!mlMapReady) return;

                // 1. Prioridad 1: Tramo KML
                if (mlLayersState.tramosKml && mlMap.getLayer('kml-convenios')) {
                    const features = mlMap.queryRenderedFeatures(e.point, { layers: ['kml-convenios'] });
                    if (features.length > 0) {
                        // Limpiar hover de vías si estuviera activo
                        if (hoveredVialInfo) {
                            mlMap.setFeatureState(
                                { source: `vial-${hoveredVialInfo.id}`, id: hoveredVialInfo.featureId },
                                { hover: false }
                            );
                            hoveredVialInfo = null;
                        }
                        // Limpiar hover de municipios si estuviera activo
                        if (hoveredMuniId !== null) {
                            mlMap.setFeatureState(
                                { source: 'municipios-src', id: hoveredMuniId },
                                { hover: false }
                            );
                            hoveredMuniId = null;
                        }

                        const featId = features[0].id;
                        if (hoveredKmlId !== featId) {
                            if (hoveredKmlId !== null) {
                                mlMap.setFeatureState({ source: 'kml-convenios-src', id: hoveredKmlId }, { hover: false });
                            }
                            hoveredKmlId = featId;
                            mlMap.setFeatureState({ source: 'kml-convenios-src', id: hoveredKmlId }, { hover: true });
                        }
                        mlMap.getCanvas().style.cursor = 'pointer';
                        return; // Retornar para dar prioridad total al KML
                    }
                }

                // Si no hay hover sobre KML, apagar su resaltado
                if (hoveredKmlId !== null) {
                    mlMap.setFeatureState({ source: 'kml-convenios-src', id: hoveredKmlId }, { hover: false });
                    hoveredKmlId = null;
                }

                // 2. Prioridad 2: Red Vial Oficial
                const activeVialLayers = [];
                ['primaria', 'secundaria', 'terciaria'].forEach(id => {
                    if (mlLayersState[id] && mlMap.getLayer(`vial-${id}`)) {
                        activeVialLayers.push(`vial-${id}`);
                    }
                });

                if (activeVialLayers.length > 0) {
                    const features = mlMap.queryRenderedFeatures(e.point, { layers: activeVialLayers });
                    if (features.length > 0) {
                        // Limpiar hover de municipios si estuviera activo
                        if (hoveredMuniId !== null) {
                            mlMap.setFeatureState(
                                { source: 'municipios-src', id: hoveredMuniId },
                                { hover: false }
                            );
                            hoveredMuniId = null;
                        }

                        const feat = features[0];
                        const layerId = feat.layer.id.replace('vial-', '');
                        const featId = feat.id;

                        if (!hoveredVialInfo || hoveredVialInfo.id !== layerId || hoveredVialInfo.featureId !== featId) {
                            if (hoveredVialInfo) {
                                mlMap.setFeatureState(
                                    { source: `vial-${hoveredVialInfo.id}`, id: hoveredVialInfo.featureId },
                                    { hover: false }
                                );
                            }
                            hoveredVialInfo = { id: layerId, featureId: featId };
                            mlMap.setFeatureState(
                                { source: `vial-${layerId}`, id: featId },
                                { hover: true }
                            );
                        }
                        mlMap.getCanvas().style.cursor = 'pointer';
                        return;
                    }
                }

                // Si no hay hover sobre vías, apagar su resaltado
                if (hoveredVialInfo) {
                    mlMap.setFeatureState(
                        { source: `vial-${hoveredVialInfo.id}`, id: hoveredVialInfo.featureId },
                        { hover: false }
                    );
                    hoveredVialInfo = null;
                }

                // 3. Prioridad 3: División Territorial (Municipio/Subregión)
                if ((mlLayersState.subregiones || mlLayersState.municipios) && mlMap.getLayer('subregiones-fill')) {
                    const features = mlMap.queryRenderedFeatures(e.point, { layers: ['subregiones-fill'] });
                    if (features.length > 0) {
                        const featId = features[0].id;
                        if (hoveredMuniId !== featId) {
                            if (hoveredMuniId !== null) {
                                mlMap.setFeatureState({ source: 'municipios-src', id: hoveredMuniId }, { hover: false });
                            }
                            hoveredMuniId = featId;
                            mlMap.setFeatureState({ source: 'municipios-src', id: hoveredMuniId }, { hover: true });
                        }
                        mlMap.getCanvas().style.cursor = 'pointer';
                        return;
                    }
                }

                // Si no hay hover sobre municipios, apagar su resaltado
                if (hoveredMuniId !== null) {
                    mlMap.setFeatureState({ source: 'municipios-src', id: hoveredMuniId }, { hover: false });
                    hoveredMuniId = null;
                }

                mlMap.getCanvas().style.cursor = '';
            });

            // Limpiar hovers cuando el cursor sale completamente del mapa
            mlMap.on('mouseleave', () => {
                if (hoveredKmlId !== null) {
                    mlMap.setFeatureState({ source: 'kml-convenios-src', id: hoveredKmlId }, { hover: false });
                    hoveredKmlId = null;
                }
                if (hoveredVialInfo) {
                    mlMap.setFeatureState(
                        { source: `vial-${hoveredVialInfo.id}`, id: hoveredVialInfo.featureId },
                        { hover: false }
                    );
                    hoveredVialInfo = null;
                }
                if (hoveredMuniId !== null) {
                    mlMap.setFeatureState({ source: 'municipios-src', id: hoveredMuniId }, { hover: false });
                    hoveredMuniId = null;
                }
                mlMap.getCanvas().style.cursor = '';
            });

            // ── FUNCIONES AUXILIARES DE CLICK (Cambiadas a globales) ──────────

            // ── MANEJADOR DE CLIC UNIFICADO (Jerarquía de Prioridades) ──────
            mlMap.on('click', (e) => {
                // 1. Prioridad Máxima: Convenio KML
                if (mlLayersState.tramosKml && mlMap.getLayer('kml-convenios')) {
                    const features = mlMap.queryRenderedFeatures(e.point, { layers: ['kml-convenios'] });
                    if (features.length > 0) {
                        handleKmlClick(e, features[0]);
                        return;
                    }
                }

                // 2. Prioridad Media: Red Vial Oficial
                const activeVialLayers = [];
                ['primaria', 'secundaria', 'terciaria'].forEach(id => {
                    if (mlLayersState[id] && mlMap.getLayer(`vial-${id}`)) {
                        activeVialLayers.push(`vial-${id}`);
                    }
                });
                if (activeVialLayers.length > 0) {
                    const features = mlMap.queryRenderedFeatures(e.point, { layers: activeVialLayers });
                    if (features.length > 0) {
                        handleVialClick(e, features[0]);
                        return;
                    }
                }

                // 3. Prioridad Mínima: Municipios / Subregiones
                if ((mlLayersState.subregiones || mlLayersState.municipios) && mlMap.getLayer('subregiones-fill')) {
                    const features = mlMap.queryRenderedFeatures(e.point, { layers: ['subregiones-fill'] });
                    if (features.length > 0) {
                        handleSubregionClick(e, features[0]);
                        return;
                    }
                }
            });

            // Inicializar control de capas y buscador del mapa
            initMLLayerControl();
            initMLMapSearch();

            // Cargar KML de convenios activos
            await renderMLMapFeatures();
        });

        // Listeners de filtros del mapa
        ['vigencia', 'supervisor', 'indicador', 'clasificacion', 'municipio', 'subregion', 'estado', 'convenio-num'].forEach(f => {
            const el = document.getElementById(`map-filter-${f}`);
            if (el) el.addEventListener('change', applyMapFilters);
        });
        const elS = document.getElementById('map-filter-search');
        if (elS) elS.addEventListener('input', applyMapFilters);
        const btnReset = document.getElementById('btn-map-reset');
        if (btnReset) btnReset.addEventListener('click', resetMapFilters);

    } else {
        // Mapa ya inicializado — solo actualizar datos
        mlMap.resize();
        await renderMLMapFeatures();
    }

    applyMapFilters();
}

function resetMapFilters() {
    ['map-filter-search', 'map-filter-vigencia', 'map-filter-supervisor', 'map-filter-indicador', 'map-filter-clasificacion',
        'map-filter-municipio', 'map-filter-subregion', 'map-filter-estado', 'map-filter-convenio-num'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
    applyMapFilters();
}

// ── Control de capas — toggle individual ──────────────────────────────────────
function toggleMLLayer(layerKey, isVisible) {
    mlLayersState[layerKey] = isVisible;
    if (!mlMap || !mlMapReady) return;

    const vis = isVisible ? 'visible' : 'none';

    const layerMap = {
        municipios: ['municipios-line', 'municipios-labels'],
        subregiones: ['subregiones-fill', 'subregiones-fill-hover'],
        primaria: ['vial-primaria-glow', 'vial-primaria', 'vial-primaria-hover'],
        secundaria: ['vial-secundaria', 'vial-secundaria-hover'],
        terciaria: ['vial-terciaria', 'vial-terciaria-hover'],
        tramosKml: ['kml-convenios-glow', 'kml-convenios', 'kml-convenios-hover']
    };

    const layers = layerMap[layerKey] || [];
    layers.forEach(lid => {
        if (mlMap.getLayer(lid)) {
            mlMap.setLayoutProperty(lid, 'visibility', vis);
        }
    });

    if (layerKey === 'terrain') {
        if (isVisible) {
            mlMap.setTerrain({ source: 'terrainSource', exaggeration: 1.0 });
            if (mlMap.getLayer('hills')) {
                mlMap.setLayoutProperty('hills', 'visibility', 'visible');
            }
        } else {
            mlMap.setTerrain(null);
            if (mlMap.getLayer('hills')) {
                mlMap.setLayoutProperty('hills', 'visibility', 'none');
            }
        }
    }
}

// ── Inicializar control de capas ──────────────────────────────────────────────
function initMLLayerControl() {
    const checkboxMap = {
        'layer-chk-municipios': 'municipios',
        'layer-chk-subregiones': 'subregiones',
        'layer-chk-primaria': 'primaria',
        'layer-chk-secundaria': 'secundaria',
        'layer-chk-terciaria': 'terciaria',
        'layer-chk-tramosKml': 'tramosKml',
        'layer-chk-terrain': 'terrain'
    };

    for (const [chkId, layerKey] of Object.entries(checkboxMap)) {
        const el = document.getElementById(chkId);
        if (el) {
            el.checked = mlLayersState[layerKey];
            el.addEventListener('change', (e) => {
                toggleMLLayer(layerKey, e.target.checked);
            });
        }
    }

    // Botón "Mostrar todas"
    const btnShowAll = document.getElementById('btn-layers-show-all');
    if (btnShowAll) {
        btnShowAll.addEventListener('click', () => {
            for (const [chkId, layerKey] of Object.entries(checkboxMap)) {
                const el = document.getElementById(chkId);
                if (el && !el.checked) { el.checked = true; toggleMLLayer(layerKey, true); }
            }
        });
    }

    // Botón "Ocultar todas"
    const btnHideAll = document.getElementById('btn-layers-hide-all');
    if (btnHideAll) {
        btnHideAll.addEventListener('click', () => {
            for (const [chkId, layerKey] of Object.entries(checkboxMap)) {
                const el = document.getElementById(chkId);
                if (el && el.checked) { el.checked = false; toggleMLLayer(layerKey, false); }
            }
        });
    }

    // Toggle colapsar panel
    const btnToggle = document.getElementById('btn-toggle-panel');
    const panel = document.getElementById('map-layer-panel');
    if (btnToggle && panel) {
        btnToggle.addEventListener('click', () => {
            panel.classList.toggle('collapsed');
            const icon = btnToggle.querySelector('i');
            if (icon) {
                icon.className = panel.classList.contains('collapsed')
                    ? 'fa-solid fa-chevron-down'
                    : 'fa-solid fa-chevron-up';
            }
        });
    }
}

// ── Cargar/actualizar KML de los convenios filtrados ──────────────────────────
let isRenderingMLMap = false;

async function renderMLMapFeatures() {
    if (!mlMap || !mlMapReady) return;
    if (isRenderingMLMap) return;
    isRenderingMLMap = true;

    const loadingEl = document.getElementById('main-map-loading');
    if (loadingEl) { loadingEl.textContent = 'Sincronizando convenios...'; loadingEl.classList.remove('hidden'); }

    // Acumular features de todos los convenios filtrados
    const allFeatures = [];
    const promises = currentMapData.map(async (row) => {
        const num = String(row['CONVENIO']).trim();
        const sysState = getSystemState(row['ESTADO CONVENIO']);

        try {
            const mapData = await loadMapData(num);
            if (mapData) {
                if (mapData.type === 'geojson') {
                    const d = mapData.data;
                    const feats = d.features || (d.geometry ? [d] : []);
                    feats.forEach(f => {
                        if (f && f.geometry) {
                            f.properties = f.properties || {};
                            f.properties.CONVENIO = num;
                            f.properties._estado = sysState.label;
                            f.properties._color = sysState.hex;
                            allFeatures.push(f);
                        }
                    });
                    return;
                } else if (mapData.type === 'kml') {
                    const cl = L.geoJSON(null);
                    if (typeof omnivore !== 'undefined' && omnivore.kml && omnivore.kml.parse) {
                        omnivore.kml.parse(mapData.data, null, cl);
                    } else if (typeof parseKMLStringToGeoJSON === 'function') {
                        const feats = parseKMLStringToGeoJSON(mapData.data, num);
                        cl.addData({ type: 'FeatureCollection', features: feats });
                    }
                    const gj = cl.toGeoJSON();
                    const feats = gj.features || [];
                    feats.forEach(f => {
                        if (f && f.geometry) {
                            f.properties = f.properties || {};
                            f.properties.CONVENIO = num;
                            f.properties._estado = sysState.label;
                            f.properties._color = sysState.hex;
                            allFeatures.push(f);
                        }
                    });
                    return;
                }
            }
        } catch (e) { }

        // Fallback: punto en LATITUD/LONGITUD
        const la = parseFloat(row['LATITUD']), lo = parseFloat(row['LONGITUD']);
        if (!isNaN(la) && !isNaN(lo) && la !== 0) {
            allFeatures.push({
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [lo, la] },
                properties: {
                    CONVENIO: num,
                    MUNICIPIO: row['MUNICIPIO'],
                    OBJETO: row['OBJETO'],
                    _estado: sysState.label,
                    _color: sysState.hex
                }
            });
        }
    });

    await Promise.all(promises);

    // Asignar IDs secuenciales numéricos para feature-state
    allFeatures.forEach((f, idx) => {
        f.id = idx + 1;
    });

    // Actualizar fuente del mapa
    const geojson = { type: 'FeatureCollection', features: allFeatures };
    mlKmlGeojson = geojson;
    if (mlMap.getSource('kml-convenios-src')) {
        mlMap.getSource('kml-convenios-src').setData(geojson);
    }

    // Ajustar vista si hay features
    if (allFeatures.length > 0) {
        try {
            const coords = [];
            allFeatures.forEach(f => {
                if (f.geometry.type === 'LineString') {
                    coords.push(...f.geometry.coordinates);
                } else if (f.geometry.type === 'MultiLineString') {
                    f.geometry.coordinates.forEach(line => coords.push(...line));
                } else if (f.geometry.type === 'Point') {
                    coords.push(f.geometry.coordinates);
                }
            });
            if (coords.length > 0) {
                const lngs = coords.map(c => c[0]);
                const lats = coords.map(c => c[1]);
                const bounds = [
                    [Math.min(...lngs) - 0.05, Math.min(...lats) - 0.05],
                    [Math.max(...lngs) + 0.05, Math.max(...lats) + 0.05]
                ];
                mlMap.fitBounds(bounds, { padding: 60, maxZoom: 13, duration: 800 });
            }
        } catch (e) { mlMap.setCenter([-75.5, 6.55]); mlMap.setZoom(7.2); }
    } else {
        mlMap.flyTo({ center: [-75.5, 6.55], zoom: 7.2, duration: 800 });
    }

    if (loadingEl) loadingEl.classList.add('hidden');
    isRenderingMLMap = false;
}

// ── Lógica del Buscador Interactivo del Mapa ──────────────────────────────────
function initMLMapSearch() {
    const searchInput = document.getElementById('map-search-input');
    const searchResults = document.getElementById('map-search-results');
    const searchClear = document.getElementById('map-search-clear');
    if (!searchInput || !searchResults || !searchClear) return;

    const normText = (s) => String(s)
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Z0-9 ]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    function getGeometryBounds(geometry) {
        let coords = [];
        if (geometry.type === 'Point') {
            coords = [geometry.coordinates];
        } else if (geometry.type === 'LineString' || geometry.type === 'MultiPoint') {
            coords = geometry.coordinates;
        } else if (geometry.type === 'Polygon' || geometry.type === 'MultiLineString') {
            geometry.coordinates.forEach(c => coords.push(...c));
        } else if (geometry.type === 'MultiPolygon') {
            geometry.coordinates.forEach(poly => poly.forEach(c => coords.push(...c)));
        }
        if (coords.length === 0) return null;
        let lngs = coords.map(c => c[0]);
        let lats = coords.map(c => c[1]);
        return [
            [Math.min(...lngs), Math.min(...lats)],
            [Math.max(...lngs), Math.max(...lats)]
        ];
    }

    function getGeometryCentroid(geometry) {
        if (geometry.type === 'Point') {
            return geometry.coordinates;
        }
        let coords = [];
        if (geometry.type === 'LineString' || geometry.type === 'MultiPoint') {
            coords = geometry.coordinates;
        } else if (geometry.type === 'Polygon' || geometry.type === 'MultiLineString') {
            coords = geometry.coordinates[0];
        } else if (geometry.type === 'MultiPolygon') {
            coords = geometry.coordinates[0][0];
        }
        if (coords.length === 0) return null;
        let lng = coords.reduce((acc, val) => acc + val[0], 0) / coords.length;
        let lat = coords.reduce((acc, val) => acc + val[1], 0) / coords.length;
        return [lng, lat];
    }

    function clearSearch() {
        searchInput.value = '';
        searchResults.innerHTML = '';
        searchResults.classList.add('hidden');
        searchClear.classList.add('hidden');
        if (mlSearchMarker) {
            mlSearchMarker.remove();
            mlSearchMarker = null;
        }
    }

    searchClear.addEventListener('click', clearSearch);

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#map-search-container')) {
            searchResults.classList.add('hidden');
        }
    });

    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim() !== '') {
            searchResults.classList.remove('hidden');
        }
    });

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim();
        if (query === '') {
            clearSearch();
            return;
        }
        searchClear.classList.remove('hidden');
        searchResults.classList.remove('hidden');

        const normalizedQuery = normText(query);
        const suggestions = [];

        // 1. Coordenadas
        const coordRegex = /^\s*(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)\s*$/;
        const coordMatch = query.match(coordRegex);
        if (coordMatch) {
            const val1 = parseFloat(coordMatch[1]);
            const val2 = parseFloat(coordMatch[2]);
            let lat = null, lon = null;
            if (val1 >= -90 && val1 <= 90 && val2 >= -180 && val2 <= 180) {
                lat = val1;
                lon = val2;
            } else if (val2 >= -90 && val2 <= 90 && val1 >= -180 && val1 <= 180) {
                lat = val2;
                lon = val1;
            }
            if (lat !== null && lon !== null) {
                suggestions.push({
                    type: 'coords',
                    name: `Ir a coordenadas: ${lat.toFixed(5)}, ${lon.toFixed(5)}`,
                    lat: lat,
                    lon: lon,
                    category: 'Coordenadas'
                });
            }
        }

        // 2. Municipios de Antioquia
        if (mlMpioData && mlMpioData.features) {
            mlMpioData.features.forEach(f => {
                const name = f.properties.NOMBRE_MPI || f.properties.MPIO_CNMBR || f.properties.NOM_MPIO || '';
                const normMuni = normText(name);
                if (normMuni.includes(normalizedQuery)) {
                    suggestions.push({
                        type: 'municipio',
                        name: name,
                        feature: f,
                        category: 'Municipios'
                    });
                }
            });
        }

        // 3. Convenios KML
        if (mlKmlGeojson && mlKmlGeojson.features) {
            mlKmlGeojson.features.forEach(f => {
                const convNum = String(f.properties.CONVENIO || '').trim();
                const name = String(f.properties.name || f.properties.Name || f.properties.NOMBRE_VIA || f.properties.OBJETO || '').trim();
                const normConvNum = normText(convNum);
                const normName = normText(name);

                if (normConvNum.includes(normalizedQuery) || normName.includes(normalizedQuery)) {
                    suggestions.push({
                        type: 'kml',
                        name: name ? `Convenio ${convNum} - ${name}` : `Convenio ${convNum}`,
                        feature: f,
                        category: 'Convenios'
                    });
                }
            });
        }

        // 4. Red Vial Oficial
        Object.entries(mlVialData).forEach(([layerId, geojson]) => {
            if (geojson && geojson.features) {
                geojson.features.forEach(f => {
                    const name = String(f.properties.NOMBRE_VIA || f.properties.NOMBRE || f.properties.name || '').trim();
                    const code = String(f.properties.CODIGO_VIA || f.properties.CODIGO || f.properties.código || '').trim();
                    const normName = normText(name);
                    const normCode = normText(code);

                    if ((name && normName.includes(normalizedQuery)) || (code && normCode.includes(normalizedQuery))) {
                        const layerNames = { primaria: 'Vía Primaria', secundaria: 'Vía Secundaria', terciaria: 'Vía Terciaria' };
                        suggestions.push({
                            type: 'vial',
                            name: name ? `${name} (${code})` : `Código Vía: ${code}`,
                            subText: layerNames[layerId],
                            feature: f,
                            layerId: layerId,
                            category: 'Red Vial'
                        });
                    }
                });
            }
        });

        if (suggestions.length === 0) {
            searchResults.innerHTML = '<div class="search-no-results"><i class="fa-solid fa-circle-info mr-1"></i> Sin resultados</div>';
            return;
        }

        const limitedSuggestions = suggestions.slice(0, 15);
        const categories = {};
        limitedSuggestions.forEach(s => {
            if (!categories[s.category]) categories[s.category] = [];
            categories[s.category].push(s);
        });

        let html = '';
        Object.entries(categories).forEach(([catName, items]) => {
            html += `<div class="search-category-header">${catName}</div>`;
            items.forEach((item, idx) => {
                const iconMap = {
                    coords: 'fa-location-dot',
                    municipio: 'fa-map-pin',
                    kml: 'fa-route',
                    vial: 'fa-road'
                };
                const icon = iconMap[item.type] || 'fa-location-arrow';
                const subText = item.subText ? `<span class="search-item-sub">${item.subText}</span>` : '';
                html += `
                    <div class="search-item" data-category="${catName}" data-index="${idx}">
                        <div class="search-item-main">
                            <i class="fa-solid ${icon} search-item-icon"></i>
                            <span class="search-item-text" title="${item.name}">${item.name}</span>
                        </div>
                        ${subText}
                    </div>
                `;
            });
        });

        searchResults.innerHTML = html;

        searchResults.querySelectorAll('.search-item').forEach(el => {
            el.addEventListener('click', () => {
                const cat = el.dataset.category;
                const idx = parseInt(el.dataset.index);
                const item = categories[cat][idx];

                searchResults.classList.add('hidden');
                searchInput.value = item.name;

                if (mlSearchMarker) {
                    mlSearchMarker.remove();
                    mlSearchMarker = null;
                }

                if (item.type === 'coords') {
                    mlSearchMarker = new maplibregl.Marker({ color: '#A90F09' })
                        .setLngLat([item.lon, item.lat])
                        .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`
                            <div class="p-3 font-sans text-xs">
                                <div class="font-black text-slate-800 uppercase tracking-widest text-[9px] mb-1">
                                    <i class="fa-solid fa-location-dot text-red-500 mr-1"></i> Búsqueda por Coordenadas
                                </div>
                                <div class="font-bold text-slate-600">${item.lat.toFixed(6)}, ${item.lon.toFixed(6)}</div>
                            </div>
                        `))
                        .addTo(mlMap);

                    mlMap.flyTo({
                        center: [item.lon, item.lat],
                        zoom: 14,
                        pitch: 45,
                        duration: 1500
                    });

                    setTimeout(() => {
                        if (mlSearchMarker) mlSearchMarker.togglePopup();
                    }, 1500);

                } else {
                    const feature = item.feature;
                    const bounds = getGeometryBounds(feature.geometry);
                    const centroid = getGeometryCentroid(feature.geometry);

                    if (bounds && centroid) {
                        mlMap.fitBounds(bounds, {
                            padding: item.type === 'municipio' ? 80 : 100,
                            maxZoom: item.type === 'municipio' ? 12 : 14,
                            duration: 1500
                        });

                        // Lanzar el parpadeo de resaltado durante 2 segundos al llegar
                        setTimeout(() => {
                            const targetSource = item.type === 'municipio'
                                ? 'municipios-src'
                                : (item.type === 'kml' ? 'kml-convenios-src' : `vial-${item.layerId}`);

                            console.log("Iniciando parpadeo para:", targetSource, "feature ID:", feature.id);

                            if (feature.id !== undefined && feature.id !== null) {
                                let isBlink = false;
                                let blinkCount = 0;
                                const intervalId = setInterval(() => {
                                    isBlink = !isBlink;
                                    console.log("Estableciendo estado blink:", isBlink, "para la feature ID:", feature.id);
                                    mlMap.setFeatureState({ source: targetSource, id: feature.id }, { blink: isBlink });
                                    blinkCount++;
                                    if (blinkCount >= 8) {
                                        clearInterval(intervalId);
                                        mlMap.setFeatureState({ source: targetSource, id: feature.id }, { blink: false });
                                        console.log("Parpadeo finalizado");
                                    }
                                }, 250);
                            } else {
                                console.warn("No se pudo iniciar parpadeo: la feature no tiene un ID válido.", feature);
                            }
                        }, 1000);

                        setTimeout(() => {
                            const fakeEvent = { lngLat: { lng: centroid[0], lat: centroid[1] } };
                            console.log("Abriendo popup para:", item.type, "con coordenadas:", fakeEvent.lngLat);
                            if (item.type === 'municipio') {
                                handleSubregionClick(fakeEvent, feature);
                            } else if (item.type === 'kml') {
                                handleKmlClick(fakeEvent, feature);
                            } else if (item.type === 'vial') {
                                handleVialClick(fakeEvent, feature, `vial-${item.layerId}`);
                            }
                        }, 1550);
                    }
                }
            });
        });
    });
}

// ── Variables KPI de mapa ─────────────────────────────────────────────────────
let currentMapData = [];

function applyMapFilters() {
    const search = document.getElementById('map-filter-search')?.value.toLowerCase().trim() || '';
    const vigencia = getSelectValues('map-filter-vigencia');
    const municipio = getSelectValues('map-filter-municipio');
    const supervisor = getSelectValues('map-filter-supervisor');
    const clasificacion = getSelectValues('map-filter-clasificacion');
    const subregion = getSelectValues('map-filter-subregion');
    const estado = getSelectValues('map-filter-estado');
    const convenioNum = getSelectValues('map-filter-convenio-num');
    const indicador = getSelectValues('map-filter-indicador');

    currentMapData = rawData.filter(row => {
        const rowValsStr = Object.values(row).map(v => String(v || '').toLowerCase()).join(' ');
        const matchSearch = !search || rowValsStr.includes(search);
        const matchVig = vigencia.length === 0 || vigencia.includes(String(row['VIGENCIA'] || '').trim());
        const matchMun = municipio.length === 0 || municipio.includes(String(row['MUNICIPIO'] || '').trim());
        const matchSup = supervisor.length === 0 || supervisor.includes(String(row['SUPERVISOR'] || '').trim());
        const matchClasif = clasificacion.length === 0 || clasificacion.includes(String(row['CLASIFICACIÓN'] || row['CLASIFICACI"N'] || '').trim());
        const matchSub = subregion.length === 0 || subregion.includes(String(row['SUBREGION'] || '').trim());
        const matchEstado = estado.length === 0 || estado.includes(String(row['ESTADO CONVENIO'] || '').trim());
        const matchConv = convenioNum.length === 0 || convenioNum.includes(String(row['CONVENIO'] || '').trim());
        const matchInd = indicador.length === 0 || indicador.includes(String(row['INDICADOR'] || '').trim());
        return matchSearch && matchVig && matchMun && matchSup && matchClasif && matchSub && matchEstado && matchConv && matchInd;
    });

    updateMapFilterSelects(search, vigencia, municipio, supervisor, clasificacion, subregion, estado, convenioNum, indicador);
    updateMapKPIs();
    if (mlMap && mlMapReady) renderMLMapFeatures();
}

function updateMapFilterSelects(cSearch, cVig, cMun, cSup, cClas, cSub, cEst, cConv, cInd) {
    const getValid = (field, exclude) => {
        const valid = rawData.filter(row => {
            const rowValsStr = Object.values(row).map(v => String(v || '').toLowerCase()).join(' ');
            const matchSearch = !cSearch || rowValsStr.includes(cSearch);
            const matchVig = exclude === 'VIGENCIA' ? true : (cVig.length === 0 || cVig.includes(String(row['VIGENCIA']).trim()));
            const matchMun = exclude === 'MUNICIPIO' ? true : (cMun.length === 0 || cMun.includes(String(row['MUNICIPIO'] || '').trim()));
            const matchSup = exclude === 'SUPERVISOR' ? true : (cSup.length === 0 || cSup.includes(String(row['SUPERVISOR'] || '').trim()));
            const matchClas = exclude === 'CLASIFICACIÓN' ? true : (cClas.length === 0 || cClas.includes(String(row['CLASIFICACIÓN'] || row['CLASIFICACI"N'] || '').trim()));
            const matchSub = exclude === 'SUBREGION' ? true : (cSub.length === 0 || cSub.includes(String(row['SUBREGION'] || '').trim()));
            const matchEst = exclude === 'ESTADO CONVENIO' ? true : (cEst.length === 0 || cEst.includes(String(row['ESTADO CONVENIO'] || '').trim()));
            const matchConv = exclude === 'CONVENIO' ? true : (cConv.length === 0 || cConv.includes(String(row['CONVENIO'] || '').trim()));
            const matchInd = exclude === 'INDICADOR' ? true : (cInd.length === 0 || cInd.includes(String(row['INDICADOR'] || '').trim()));
            return matchSearch && matchVig && matchMun && matchSup && matchClas && matchSub && matchEst && matchConv && matchInd;
        });
        return [...new Set(valid.map(i => {
            if (field === 'CLASIFICACIÓN') return String(i['CLASIFICACIÓN'] || i['CLASIFICACI"N'] || '').trim();
            return String(i[field] || '').trim();
        }).filter(Boolean))].sort();
    };

    const upd = (id, options, currentValues) => {
        const el = document.getElementById(id);
        if (!el) return;
        const validValues = currentValues.filter(v => options.includes(v));
        el.innerHTML = '<option value="">Todos</option>' + options.map(v => {
            const isSel = validValues.includes(v) ? 'selected' : '';
            return `<option value="${v}" ${isSel}>${v}</option>`;
        }).join('');
        Array.from(el.options).forEach(opt => {
            opt.selected = validValues.includes(opt.value);
        });
    };

    upd('map-filter-vigencia', getValid('VIGENCIA', 'VIGENCIA').reverse(), cVig);
    upd('map-filter-supervisor', getValid('SUPERVISOR', 'SUPERVISOR'), cSup);
    upd('map-filter-indicador', getValid('INDICADOR', 'INDICADOR'), cInd);
    upd('map-filter-clasificacion', getValid('CLASIFICACIÓN', 'CLASIFICACIÓN'), cClas);
    upd('map-filter-municipio', getValid('MUNICIPIO', 'MUNICIPIO'), cMun);
    upd('map-filter-subregion', getValid('SUBREGION', 'SUBREGION'), cSub);
    upd('map-filter-estado', getValid('ESTADO CONVENIO', 'ESTADO CONVENIO'), cEst);
    upd('map-filter-convenio-num', getValid('CONVENIO', 'CONVENIO'), cConv);
}

function updateMapKPIs() {
    const numMun = new Set(currentMapData.map(r => String(r['MUNICIPIO']).trim())).size;
    const numSub = new Set(currentMapData.map(r => String(r['SUBREGION']).trim())).size;
    let act = 0, kmEjecutados = 0, kmContratados = 0, areaEjecutada = 0, areaContratada = 0, inv = 0;
    currentMapData.forEach(r => {
        const est = String(r['ESTADO CONVENIO'] || '').toUpperCase();
        if (est.includes('EJECUCI')) act++;
        kmEjecutados += getRowLongitudEjecutada(r) / 1000;
        kmContratados += getRowLongitudContratada(r) / 1000;
        areaEjecutada += getRowAreaEjecutada(r);
        areaContratada += getRowAreaContratada(r);
        inv += (r['APORTE DEPARTAMENTO'] || 0) + (r['ADICION DEPARTAMENTO'] || 0);
    });

    const mKpi = document.getElementById('kpi-map-mun');
    if (mKpi) mKpi.innerHTML = `${numMun} <span class="text-xs font-semibold text-slate-400 dark:text-slate-500">de 125</span>`;
    const sKpi = document.getElementById('kpi-map-sub');
    if (sKpi) sKpi.innerHTML = `${numSub} <span class="text-xs font-semibold text-slate-400 dark:text-slate-500">/ 9</span>`;
    const kKpi = document.getElementById('kpi-map-km');
    if (kKpi) kKpi.innerHTML = `${kmEjecutados.toFixed(2)} km <span class="text-xs font-semibold text-slate-400 dark:text-slate-500">de ${kmContratados.toFixed(2)} km</span>`;
    const aKpi = document.getElementById('kpi-map-area');
    if (aKpi) aKpi.innerHTML = `${formatNumber(areaEjecutada)} m² <span class="text-xs font-semibold text-slate-400 dark:text-slate-500">de ${formatNumber(areaContratada)} m² contratados</span>`;
    const iKpi = document.getElementById('kpi-map-inv');
    if (iKpi) iKpi.textContent = formatCurrency(inv);
    const acKpi = document.getElementById('kpi-map-activos');
    if (acKpi) acKpi.textContent = act;

    updateMapCharts();
}

function updateMapCharts() {
    const subL = {}, subI = {}, munL = {}, munI = {};
    currentMapData.forEach(r => {
        const s = r['SUBREGION'] || 'OTRAS';
        const m = r['MUNICIPIO'] || 'N/A';
        const l = mapMetric === 'contratado' ? getRowLongitudContratada(r) : getRowLongitudEjecutada(r);
        const i = (r['APORTE DEPARTAMENTO'] || 0) + (r['ADICION DEPARTAMENTO'] || 0);
        subL[s] = (subL[s] || 0) + l;
        subI[s] = (subI[s] || 0) + i;
        munL[m] = (munL[m] || 0) + l;
        munI[m] = (munI[m] || 0) + i;
    });

    const sL = Object.entries(subL).sort((a, b) => b[1] - a[1]);
    const sI = Object.entries(subI).sort((a, b) => b[1] - a[1]);
    const mL = Object.entries(munL).sort((a, b) => b[1] - a[1]).slice(0, 15);
    const mI = Object.entries(munI).sort((a, b) => b[1] - a[1]).slice(0, 15);

    const lblSub = document.getElementById('lbl-map-sub-long');
    const lblMun = document.getElementById('lbl-map-mun-long');
    if (lblSub) lblSub.textContent = mapMetric === 'contratado' ? 'Longitud Contratada por Subregión' : 'Longitud Ejecutada por Subregión';
    if (lblMun) lblMun.textContent = mapMetric === 'contratado' ? 'Top Municipios (Longitud Contratada)' : 'Top Municipios (Longitud Ejecutada)';

    const drawChart = (id, type, dataArr, formatCb, color) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (charts[id]) charts[id].destroy();

        const isDark = document.documentElement.classList.contains('dark');
        const textColor = isDark ? '#94a3b8' : '#64748b';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.04)';

        charts[id] = new Chart(el, {
            type,
            data: {
                labels: dataArr.map(d => d[0]),
                datasets: [{ data: dataArr.map(d => d[1]), backgroundColor: color, borderRadius: 6 }]
            },
            options: {
                indexAxis: (type === 'bar' && (id.includes('top-mun') || id.includes('sub-inv'))) ? 'y' : 'x',
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        titleColor: isDark ? '#f8fafc' : '#0f172a',
                        bodyColor: isDark ? '#cbd5e1' : '#475569',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.05)',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8,
                        titleFont: { size: 11, family: 'Poppins' },
                        bodyFont: { size: 13, weight: 'bold', family: 'Poppins' },
                        callbacks: { label: (c) => ` ${formatCb(c.raw)}` }
                    }
                },
                scales: {
                    x: {
                        grid: { color: (type === 'bar' && (id.includes('top-mun') || id.includes('sub-inv'))) ? gridColor : 'transparent' },
                        ticks: { color: textColor, font: { size: 9, family: 'Poppins', weight: '500' } }
                    },
                    y: {
                        grid: { color: (type === 'bar' && (id.includes('top-mun') || id.includes('sub-inv'))) ? 'transparent' : gridColor },
                        ticks: { color: textColor, font: { size: 9, family: 'Poppins', weight: '500' } }
                    }
                }
            }
        });
    };

    drawChart('chart-sub-long', 'bar', sL, v => formatNumber(v) + ' m', '#018D38');
    drawChart('chart-sub-inv', 'bar', sI, v => formatCurrency(v), '#3561AB');
    drawChart('chart-top-mun-long', 'bar', mL, v => formatNumber(v) + ' m', '#018D38');
    drawChart('chart-top-mun-inv', 'bar', mI, v => formatCurrency(v), '#3561AB');
}

window.setMapMetric = function (val) {
    mapMetric = val;
    const btnContratado = document.getElementById('btn-map-metric-contratado');
    const btnEjecutado = document.getElementById('btn-map-metric-ejecutado');
    if (btnContratado && btnEjecutado) {
        if (val === 'contratado') {
            btnContratado.classList.add('bg-white', 'dark:bg-slate-800', 'text-slate-800', 'dark:text-white', 'shadow-sm');
            btnContratado.classList.remove('text-slate-500', 'dark:text-slate-400', 'hover:text-slate-700', 'dark:hover:text-slate-200');
            btnEjecutado.classList.remove('bg-white', 'dark:bg-slate-800', 'text-slate-800', 'dark:text-white', 'shadow-sm');
            btnEjecutado.classList.add('text-slate-500', 'dark:text-slate-400', 'hover:text-slate-700', 'dark:hover:text-slate-200');
        } else {
            btnEjecutado.classList.add('bg-white', 'dark:bg-slate-800', 'text-slate-800', 'dark:text-white', 'shadow-sm');
            btnEjecutado.classList.remove('text-slate-500', 'dark:text-slate-400', 'hover:text-slate-700', 'dark:hover:text-slate-200');
            btnContratado.classList.remove('bg-white', 'dark:bg-slate-800', 'text-slate-800', 'dark:text-white', 'shadow-sm');
            btnContratado.classList.add('text-slate-500', 'dark:text-slate-400', 'hover:text-slate-700', 'dark:hover:text-slate-200');
        }
    }
    updateMapCharts();
};
// ====== PESTAÑA 3: PLAN DE DESARROLLO ======


// Indicadores estratégicos del Plan de Desarrollo 2024-2027 con metas oficiales
const indicadoresEstrategicos = {
    "AEROPUERTOS O AERÓDROMOS MEJORADOS Y EN OPERACIÓN": {
        metas: { todos: 15, "2024": 0, "2025": 2, "2026": 8, "2027": 5 },
        unit: "und",
        tipo: "und"
    },
    "MUELLES O EMBARCADEROS MEJORADOS": {
        metas: { todos: 4, "2024": 0, "2025": 2, "2026": 0, "2027": 2 },
        unit: "und",
        tipo: "und"
    },
    "EQUIPAMIENTOS CONSTRUIDOS": {
        metas: { todos: 5, "2024": 0, "2025": 1, "2026": 2, "2027": 2 },
        unit: "und",
        tipo: "und"
    },
    "VÍAS TERCIARIAS MEJORADAS. (RVT)": {
        metas: { todos: 500, "2024": 50, "2025": 150, "2026": 100, "2027": 200 },
        unit: "km",
        tipo: "km"
    },
    "ESPACIO PUBLICO": {
        metas: { todos: 100000, "2024": 10000, "2025": 25000, "2026": 30000, "2027": 35000 },
        unit: "m²",
        tipo: "m2"
    },
    "CABLES AÉREOS SOSTENIBLES CONSTRUIDOS Y OPERANDO": {
        metas: { todos: 3, "2024": 0, "2025": 3, "2026": 3, "2027": 3 },
        unit: "und",
        tipo: "und"
    },
    "VÍA URBANA MEJORADA. (RVU)": {
        metas: { todos: 30, "2024": 5, "2025": 10, "2026": 5, "2027": 10 },
        unit: "km",
        tipo: "km"
    }
};

// Normalización ultra-robusta: elimina tildes, espacios extra, caracteres especiales
function normText(s) {
    if (!s) return '';
    return s.toUpperCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita diacríticos (tildes, etc)
        .replace(/[^A-Z0-9 ]/g, ' ')  // reemplaza chars especiales por espacio
        .replace(/\s+/g, ' ')          // colapsa múltiples espacios
        .trim();
}

function normalizarIndicador(ind) {
    if (!ind) return "";
    const i = normText(ind);
    // Aeropuertos / Aeródromos
    if (i.includes("AEROPUERTO") || i.includes("AERODROMO") || i.includes("AERODROMO")) return "AEROPUERTOS O AERÓDROMOS MEJORADOS Y EN OPERACIÓN";
    // Muelles / Embarcaderos
    if (i.includes("MUELLE") || i.includes("EMBARCADERO")) return "MUELLES O EMBARCADEROS MEJORADOS";
    // Equipamientos
    if (i.includes("EQUIPAMIENT") || i.includes("EQUIP")) return "EQUIPAMIENTOS CONSTRUIDOS";
    // Vías Terciarias (RVT) — cualquier combinación que mencione "TERCIARIA"
    if (i.includes("TERCIARIA") || i.includes("RVT")) return "VÍAS TERCIARIAS MEJORADAS. (RVT)";
    // Espacio Público
    if (i.includes("ESPACIO") && i.includes("PUBLI")) return "ESPACIO PUBLICO";
    if (i.includes("ESPACIO PUBLICO")) return "ESPACIO PUBLICO";
    // Cables aéreos
    if (i.includes("CABLE")) return "CABLES AÉREOS SOSTENIBLES CONSTRUIDOS Y OPERANDO";
    // Vía Urbana (RVU)
    if (i.includes("URBANA") || i.includes("RVU")) return "VÍA URBANA MEJORADA. (RVU)";
    return ""; // No mapeado
}

window.setPlanMetric = function (val) {
    planMetric = val;
    const btnContratado = document.getElementById('btn-plan-metric-contratado');
    const btnEjecutado = document.getElementById('btn-plan-metric-ejecutado');
    if (btnContratado && btnEjecutado) {
        if (val === 'contratado') {
            btnContratado.classList.add('bg-white', 'dark:bg-slate-800', 'text-slate-800', 'dark:text-white', 'shadow-sm');
            btnContratado.classList.remove('text-slate-500', 'dark:text-slate-400', 'hover:text-slate-700', 'dark:hover:text-slate-200');
            btnEjecutado.classList.remove('bg-white', 'dark:bg-slate-800', 'text-slate-800', 'dark:text-white', 'shadow-sm');
            btnEjecutado.classList.add('text-slate-500', 'dark:text-slate-400', 'hover:text-slate-700', 'dark:hover:text-slate-200');
        } else {
            btnEjecutado.classList.add('bg-white', 'dark:bg-slate-800', 'text-slate-800', 'dark:text-white', 'shadow-sm');
            btnEjecutado.classList.remove('text-slate-500', 'dark:text-slate-400', 'hover:text-slate-700', 'dark:hover:text-slate-200');
            btnContratado.classList.remove('bg-white', 'dark:bg-slate-800', 'text-slate-800', 'dark:text-white', 'shadow-sm');
            btnContratado.classList.add('text-slate-500', 'dark:text-slate-400', 'hover:text-slate-700', 'dark:hover:text-slate-200');
        }
    }
    renderPlanTab();
};

window.setPlanAnualFilter = function (val) {
    planAnualFilter = val;
    // Map metric type for backward compatibility
    if (val === 'todos-m2' || val === 'ESPACIO PUBLICO') {
        planAnualMetric = 'area';
    } else {
        planAnualMetric = 'longitud';
    }

    // Keep UI selectors synced
    const selectEl = document.getElementById('select-anual-indicador');
    if (selectEl) selectEl.value = val;

    renderPlanTab();
};

window.setPlanAnualMetric = function (val) {
    if (val === 'longitud') {
        window.setPlanAnualFilter('todos-km');
    } else {
        window.setPlanAnualFilter('todos-m2');
    }
};

function getRowCompletionYear(row) {
    let termStr = row['NUEVA FECHA DE TERMINACION'] || row['NUEVA FECHA DE TERMINACIÓN'] || row['NUEVA FECHA DE TERMINACIN'];
    if (!termStr || String(termStr).trim() === '' || String(termStr).trim().toLowerCase() === 'sin cambios') {
        termStr = row['FECHA DE TERMINACION'] || row['FECHA DE TERMINACIÓN'] || row['FECHA DE TERMINACIN'];
    }
    if (termStr) {
        termStr = String(termStr).trim();
        if (!isNaN(termStr) && termStr !== '') {
            const serialNum = parseFloat(termStr);
            if (serialNum > 30000) {
                const dateVal = new Date((serialNum - 25569) * 86400 * 1000);
                if (!isNaN(dateVal.getTime())) {
                    return String(dateVal.getFullYear());
                }
            }
        }
        const parts = termStr.split('/');
        if (parts.length === 3) {
            const yearStr = parts[2].trim();
            if (yearStr.length === 4 && !isNaN(yearStr)) {
                return yearStr;
            }
        }
        const dateVal = new Date(termStr);
        if (!isNaN(dateVal.getTime())) {
            return String(dateVal.getFullYear());
        }
    }
    const vigencia = String(row['VIGENCIA'] || '').trim();
    if (vigencia && !isNaN(vigencia)) {
        return vigencia;
    }
    return null;
}

window.setPlanYearFilter = function (val) {
    planYearFilter = val;
    renderPlanTab();
};

function renderPlanTab() {
    let cumplidas = 0, proceso = 0, riesgo = 0;
    let inversionTotal = 0;
    let munis = new Set();

    // === DIAGNÓSTICO: poblar panel visual y consola ===
    const valoresIndicador = [...new Set(rawData.map(r => String(r['INDICADOR'] || '').trim()).filter(Boolean))];
    console.log('[Plan Tab] Valores únicos de INDICADOR en rawData:', valoresIndicador);
    console.log('[Plan Tab] Total rows en rawData:', rawData.length);
    const debugEl = document.getElementById('plan-debug-indicadores');
    if (debugEl) {
        debugEl.innerHTML = valoresIndicador.length === 0
            ? '<span class="text-xs text-amber-600 italic">No se encontraron valores en el campo INDICADOR. Verifica que el Google Sheet tenga esa columna.</span>'
            : valoresIndicador.map(v => {
                const mapped = normalizarIndicador(v);
                const ok = mapped !== '';
                return `<span class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${ok ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-red-50 text-red-700 border-red-300'}">
                    <i class="fa-solid ${ok ? 'fa-check' : 'fa-xmark'}"></i>
                    ${v}
                    ${ok ? `<span class="font-normal opacity-70">→ ${mapped}</span>` : '<span class="font-normal opacity-70">(no reconocido)</span>'}
                </span>`;
            }).join('');
    }

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
            const metros = planMetric === 'contratado' ? getRowLongitudContratadaPlan(row) : getRowLongitudEjecutadaPlan(row);
            cant = metros / 1000;
        } else if (cfg.tipo === 'm2') {
            cant = planMetric === 'contratado' ? getRowAreaContratadaPlan(row) : getRowAreaEjecutadaPlan(row);
        } else {
            if (planMetric === 'contratado') {
                cant = isCuatrenioAnterior(row) ? 0 : 1;
            } else {
                const estado = String(row['ESTADO CONVENIO'] || '').toUpperCase();
                const tieneEjecucion = estado.includes('EJECUCI') || estado.includes('EJECUT') ||
                    estado.includes('OPERA') || estado.includes('MEJORAD') ||
                    getRowLongitudEjecutadaPlan(row) > 0 ||
                    getRowAreaEjecutadaPlan(row) > 0 ||
                    parseNum(row['FISICO_NORM']) > 0;
                cant = tieneEjecucion ? 1 : 0;
            }
        }

        // 1. Acumulación anual para el gráfico (basado en la fecha de finalización real, para todo el universo de datos)
        const compYear = getRowCompletionYear(row);
        if (compYear && avancePorAnio[compYear] !== undefined) {
            if (planAnualFilter === 'todos-km') {
                if (cfg.tipo === 'km') avancePorAnio[compYear] += cant;
            } else if (planAnualFilter === 'todos-m2') {
                if (cfg.tipo === 'm2') avancePorAnio[compYear] += cant;
            } else {
                if (ind === planAnualFilter) avancePorAnio[compYear] += cant;
            }
        }

        // 2. Filtro de año de finalización real para las KPIs y Tarjetas
        if (planYearFilter !== 'todos' && compYear !== planYearFilter) {
            return;
        }

        dataInd[ind].ejecutado += cant;
        dataInd[ind].convenios++;

        inversionTotal += parseNum(row['APORTE DEPARTAMENTO']) + parseNum(row['ADICION DEPARTAMENTO']);
        if (row['MUNICIPIO']) munis.add(String(row['MUNICIPIO']).trim());
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
    const chartMetasPcts = [];
    const chartMetasColors = [];
    const chartMetasRawInfo = [];

    const labelMetasMetric = planMetric === 'contratado' ? 'Contratado' : 'Ejecutado';

    Object.keys(indicadoresEstrategicos).forEach(ind => {
        const d = dataInd[ind];
        const cfg = indicadoresEstrategicos[ind];
        const meta = cfg.metas[planYearFilter] !== undefined ? cfg.metas[planYearFilter] : 0;
        const isNP = (meta === 0);
        const e = d.ejecutado;

        let pct = 0;
        let restante = 0;

        if (isNP) {
            pct = 0;
            restante = 0;
        } else {
            pct = meta > 0 ? Math.min((e / meta) * 100, 100) : 0;
            restante = Math.max(meta - e, 0);
        }

        if (!isNP) {
            if (pct >= 80) cumplidas++;
            else if (pct >= 50) proceso++;
            else riesgo++;

            sumCumplimiento += pct;
            countCumplimiento++;
        }

        let displayName = ind;
        if (ind.includes("AEROPUERTOS")) displayName = "Aeropuertos/Aeródromos";
        else if (ind.includes("MUELLES")) displayName = "Muelles/Embarcaderos";
        else if (ind.includes("EQUIPAMIENTOS")) displayName = "Equipamientos Constr.";
        else if (ind.includes("TERCIARIAS")) displayName = "Vías Terciarias (RVT)";
        else if (ind.includes("ESPACIO")) displayName = "Espacio Público";
        else if (ind.includes("CABLES")) displayName = "Cables Aéreos";
        else if (ind.includes("URBANA")) displayName = "Vía Urbana (RVU)";

        chartMetasLabels.push(displayName);
        chartMetasPcts.push(isNP ? 0 : parseFloat(pct.toFixed(1)));
        chartMetasRawInfo.push({
            achieved: e,
            target: meta,
            unit: cfg.unit,
            isNP: isNP
        });

        let colorClass = 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
        let barColor = 'bg-red-500';
        let bgClass = 'bg-red-50/60 dark:bg-red-900/10';
        let chartColor = 'rgba(239, 68, 68, 0.85)';

        if (isNP) {
            colorClass = 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800';
            barColor = 'bg-slate-300';
            bgClass = 'bg-slate-50/60 dark:bg-slate-900/10';
            chartColor = 'rgba(148, 163, 184, 0.5)';
        } else if (pct >= 80) {
            colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800';
            barColor = 'bg-emerald-500';
            bgClass = 'bg-emerald-50/60 dark:bg-emerald-900/10';
            chartColor = 'rgba(16, 185, 129, 0.85)';
        } else if (pct >= 50) {
            colorClass = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800';
            barColor = 'bg-amber-500';
            bgClass = 'bg-amber-50/60 dark:bg-amber-900/10';
            chartColor = 'rgba(245, 158, 11, 0.85)';
        }
        chartMetasColors.push(chartColor);

        const fmtVal = (v) => {
            if (cfg.tipo === 'km') return v.toFixed(2) + ' km';
            if (cfg.tipo === 'm2') return formatNumber(Math.round(v)) + ' m²';
            return Math.round(v) + ' und';
        };

        const pctCls = isNP ? 'np' : (pct >= 80 ? 'cumplida' : pct >= 50 ? 'proceso' : 'riesgo');
        const badgeText = isNP ? 'NP' : `${pct.toFixed(1)}%`;
        const metaText = isNP ? 'NP (No Prog.)' : fmtVal(meta);
        const restanteText = isNP ? '-' : fmtVal(restante);

        container.innerHTML += `
            <div class="meta-card meta-${pctCls}">
                <div class="meta-card-header">
                    <h4 class="meta-card-title">${ind}</h4>
                    <span class="meta-pct-badge ${pctCls}">${badgeText}</span>
                </div>
                <div class="meta-progress-track">
                    <div class="meta-progress-fill ${pctCls}" style="width:${isNP ? 0 : Math.min(pct, 100)}%"></div>
                </div>
                <div class="meta-card-footer">
                    <div style="display:flex;gap:12px;">
                        <div>
                            <p style="font-size:8px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:2px;">Meta</p>
                            <p style="font-size:12px;font-weight:800;color:#0F172A;">${metaText}</p>
                        </div>
                        <div>
                            <p style="font-size:8px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:2px;">${labelMetasMetric}</p>
                            <p style="font-size:12px;font-weight:800;color:#0B5640;">${fmtVal(e)}</p>
                        </div>
                        <div>
                            <p style="font-size:8px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:2px;">Restante</p>
                            <p style="font-size:12px;font-weight:800;color:#A90F09;">${restanteText}</p>
                        </div>
                    </div>
                    <span class="meta-meta-text">${d.convenios} convenio(s)</span>
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

    // === 1. GRÁFICO: Cumplimiento Global (Horizontal Bar Chart) ===
    if (charts['plan-metas']) charts['plan-metas'].destroy();

    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.04)';

    charts['plan-metas'] = new Chart(document.getElementById('chart-plan-metas'), {
        type: 'bar',
        data: {
            labels: chartMetasLabels,
            datasets: [{
                label: '% Cumplimiento',
                data: chartMetasPcts,
                backgroundColor: chartMetasColors,
                borderRadius: 5,
                borderWidth: 0,
                barThickness: 16
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    titleColor: isDark ? '#f8fafc' : '#0f172a',
                    bodyColor: isDark ? '#cbd5e1' : '#475569',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.05)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: { size: 11, family: 'Poppins' },
                    bodyFont: { size: 12, family: 'Poppins' },
                    callbacks: {
                        label: function (context) {
                            const index = context.dataIndex;
                            const info = chartMetasRawInfo[index];
                            if (info.isNP) {
                                const rawAchieved = info.unit === 'm²' ? formatNumber(Math.round(info.achieved)) : info.achieved.toFixed(1);
                                return ` No Programado (Ejecutado: ${rawAchieved} ${info.unit})`;
                            }
                            const rawAchieved = info.unit === 'm²' ? formatNumber(Math.round(info.achieved)) : info.achieved.toFixed(1);
                            const rawTarget = info.unit === 'm²' ? formatNumber(Math.round(info.target)) : info.target;
                            return ` ${context.raw}% de cumplimiento (${rawAchieved} ${info.unit} de ${rawTarget} ${info.unit})`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    suggestedMax: 100,
                    grid: { color: gridColor },
                    ticks: {
                        color: textColor,
                        font: { size: 9, family: 'Poppins' },
                        callback: function (value) { return value + '%'; }
                    }
                },
                y: {
                    grid: { display: false },
                    ticks: {
                        color: textColor,
                        font: { size: 9, weight: 'bold', family: 'Poppins' }
                    }
                }
            }
        }
    });

    // === 2. GRÁFICO DE PROYECCIÓN DE AVANCE POR AÑO (%) (Optimizado con curvas y porcentajes) ===
    if (charts['plan-anual']) charts['plan-anual'].destroy();

    const proyWeb = calculateProyeccionAnualPct(planAnualFilter);
    const yearsLabels = proyWeb.years.map(y => y === "2027" ? "2027 (Proyección)" : y);
    const mainColor = '#0B5640';

    const canvasAnual = document.getElementById('chart-plan-anual');
    const ctxAnual = canvasAnual.getContext('2d');

    const gradient = ctxAnual.createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, 'rgba(11, 86, 64, 0.35)');
    gradient.addColorStop(1, 'rgba(11, 86, 64, 0.0)');

    charts['plan-anual'] = new Chart(canvasAnual, {
        type: 'line',
        data: {
            labels: yearsLabels,
            datasets: [{
                label: '% Proyección de Avance Acumulado',
                data: proyWeb.pctValues,
                borderColor: mainColor,
                backgroundColor: gradient,
                fill: true,
                tension: 0.4,
                pointRadius: (ctx) => ctx.dataIndex === 3 ? 6 : 5,
                pointHoverRadius: (ctx) => ctx.dataIndex === 3 ? 8 : 7,
                pointBackgroundColor: (ctx) => ctx.dataIndex === 3 ? '#018D38' : mainColor,
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
            plugins: {
                legend: { position: 'bottom', labels: { font: { size: 10, family: 'Poppins' }, color: textColor } },
                tooltip: {
                    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    titleColor: isDark ? '#f8fafc' : '#0f172a',
                    bodyColor: isDark ? '#cbd5e1' : '#475569',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.05)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: { size: 11, family: 'Poppins' },
                    bodyFont: { size: 13, weight: 'bold', family: 'Poppins' },
                    callbacks: {
                        label: function (context) {
                            return ` ${context.dataset.label}: ${context.raw.toFixed(1)}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: 100,
                    grid: { color: gridColor },
                    ticks: {
                        color: textColor,
                        font: { size: 9, family: 'Poppins' },
                        callback: function (value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: textColor, font: { size: 9, family: 'Poppins' } }
                }
            }
        }
    });
}

// ============================================================
// 34. PORTAL DE SUPERVISORES DIAT - LOGICA INTEGRADA
// ============================================================

// Variables locales del mapa de edición
window.editMapInstance = null;
window.editMarker = null;
window.editUploadedPhotos = [];

// Helper para Toasts dinámicos
function alertToast(title, desc, type = "success") {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;

    const titleEl = toast.querySelector('h4');
    const descEl = toast.querySelector('p');
    const iconEl = toast.querySelector('i');

    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = desc;

    if (iconEl) {
        iconEl.className = 'fa-solid';
        if (type === 'success') {
            iconEl.classList.add('fa-circle-check');
            toast.style.background = 'linear-gradient(135deg, #0B5640, #018D38)';
        } else if (type === 'warning') {
            iconEl.classList.add('fa-triangle-exclamation');
            toast.style.background = 'linear-gradient(135deg, #F28E18, #D97706)';
        } else {
            iconEl.classList.add('fa-circle-xmark');
            toast.style.background = 'linear-gradient(135deg, #A90F09, #DC2626)';
        }
    }

    toast.classList.remove('opacity-0', 'translate-y-20');
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-20');
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(80px)';
    }, 3500);
}

// Convertidor flexible de fechas para input date HTML
function toDateInputValue(str) {
    if (!str || str === '--') {
        return new Date().toISOString().substring(0, 10);
    }
    // Si el formato es DD/MM/YYYY
    const parts = str.split('/');
    if (parts.length === 3) {
        const d = parts[0].padStart(2, '0');
        const m = parts[1].padStart(2, '0');
        const y = parts[2];
        return `${y}-${m}-${d}`;
    }
    return str;
}

// Catálogo de usuarios del portal — añadir más supervisores aquí
const PORTAL_USERS = {
    'JMARINGA': {
        password: '1037653193',
        name: 'Jonathan Marín Gallego',
        // supervisorExcelName: nombre EXACTO como aparece en la columna SUPERVISOR del Excel
        supervisorExcelName: 'JONATHAN MARÍN GALLEGO',
        role: 'Supervisor Técnico DIAT',
        email: 'jmarin@antioquia.gov.co',
        initials: 'JM'
    },
    'CQUIRAMAH': {
        password: '1041610570',
        name: 'Cristian Camilo Quirama Henao',
        supervisorExcelName: 'CRISTIAN CAMILO QUIRAMA HENAO',
        role: 'Supervisor Técnico DIAT',
        email: 'cquirama@antioquia.gov.co',
        initials: 'CQ'
    }
};

// Helper para obtener el usuario autenticado desde sessionStorage o localStorage
function getLoggedUser() {
    try {
        const userSession = sessionStorage.getItem('diat_logged_user');
        if (userSession) return JSON.parse(userSession);
        const userLocal = localStorage.getItem('diat_logged_user');
        if (userLocal) return JSON.parse(userLocal);
    } catch (e) {
        console.error("Error al leer usuario autenticado:", e);
    }
    return null;
}

// Normaliza un nombre para comparación sin importar acentos ni mayúsculas
function normalizeSupervisorName(str) {
    return String(str || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .trim();
}

// Obtiene las filas de rawData asignadas al supervisor actualmente logueado
function getSupervisorRows() {
    const user = getLoggedUser();
    if (!user) return [];
    const excelName = user.supervisorExcelName || user.name;
    const normalizedTarget = normalizeSupervisorName(excelName);
    return rawData.filter(row => {
        const rowSup = normalizeSupervisorName(row['SUPERVISOR']);
        return rowSup === normalizedTarget;
    });
}

// Inicializa el Portal de Supervisores y enlaza sus eventos
function initSupervisorPortal() {
    // 1. Enlace de Login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const userInp = document.getElementById('login-username').value.trim().toUpperCase();
            const passInp = document.getElementById('login-password').value.trim();

            const userDef = PORTAL_USERS[userInp];
            if (userDef && passInp === userDef.password) {
                const userObj = {
                    username: userInp,
                    name: userDef.name,
                    supervisorExcelName: userDef.supervisorExcelName,
                    role: userDef.role,
                    email: userDef.email,
                    initials: userDef.initials || userDef.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                };

                const rememberMe = document.getElementById('login-remember') && document.getElementById('login-remember').checked;
                if (rememberMe) {
                    localStorage.setItem('diat_logged_user', JSON.stringify(userObj));
                    sessionStorage.removeItem('diat_logged_user');
                } else {
                    sessionStorage.setItem('diat_logged_user', JSON.stringify(userObj));
                    localStorage.removeItem('diat_logged_user');
                }

                document.getElementById('modal-login').classList.add('hidden');

                checkAuthStatus();

                // Redirigir a pestaña del Portal y sub-pestaña dashboard
                const portalTabBtn = document.querySelector('.tab-btn[data-tab="portal"]');
                if (portalTabBtn) portalTabBtn.click();

                alertToast('Sesión Iniciada', 'Bienvenido, ' + userDef.name + '.');
            } else {
                alertToast('Credenciales Incorrectas', 'Usuario o contraseña inválidos.', 'error');
            }
        });
    }

    const triggerAuth = document.getElementById('btn-portal-login-trigger');
    if (triggerAuth) {
        triggerAuth.addEventListener('click', () => {
            document.getElementById('modal-login').classList.remove('hidden');
        });
    }

    // 2. Enlace de Perfil en Header
    const headerProfile = document.getElementById('header-user-profile');
    if (headerProfile) {
        headerProfile.addEventListener('click', (e) => {
            e.stopPropagation();
            const logged = getLoggedUser();
            if (logged) {
                document.getElementById('user-menu-dropdown').classList.toggle('hidden');
            } else {
                document.getElementById('modal-login').classList.remove('hidden');
            }
        });
    }

    // Cerrar menú de usuario al hacer clic fuera
    document.addEventListener('click', () => {
        const dd = document.getElementById('user-menu-dropdown');
        if (dd) dd.classList.add('hidden');
    });

    // 3. Acciones de items del Menú de Usuario
    document.querySelectorAll('.user-menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('user-menu-dropdown').classList.add('hidden');
            const action = item.getAttribute('data-action');
            if (action === 'logout') {
                handleLogout();
            } else {
                // Ir a pestaña del portal
                const portalTabBtn = document.querySelector('.tab-btn[data-tab="portal"]');
                if (portalTabBtn) portalTabBtn.click();

                // Cambiar a la sub-pestaña correcta
                const targetSub = action === 'perfil' ? 'dashboard' : action;
                const subtabBtn = document.querySelector(`.portal-subtab-btn[data-subtab="${targetSub}"]`);
                if (subtabBtn) subtabBtn.click();
            }
        });
    });

    // Cerrar sesión desde botón interno del Portal
    const btnLogout = document.getElementById('btn-portal-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', handleLogout);
    }

    // 4. Navegación de sub-pestañas internas del Portal
    const subtabBtns = document.querySelectorAll('.portal-subtab-btn');
    subtabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            subtabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const target = btn.getAttribute('data-subtab');
            document.querySelectorAll('.portal-panel').forEach(p => p.classList.add('hidden'));
            const panel = document.getElementById(`portal-panel-${target}`);
            if (panel) panel.classList.remove('hidden');
        });
    });

    // 5. Navegación de pestañas del Modal de Edición
    const editTabBtns = document.querySelectorAll('.edit-tab-btn');
    editTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            editTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const target = btn.getAttribute('data-edittab');
            document.querySelectorAll('.edit-panel').forEach(p => p.classList.add('hidden'));
            const panel = document.getElementById(`edit-panel-${target}`);
            if (panel) panel.classList.remove('hidden');

            if (target === 'ubicacion' && window.editMapInstance) {
                setTimeout(() => {
                    window.editMapInstance.invalidateSize();
                }, 100);
            }
        });
    });

    // 6. Enlace de carga de fotos generales
    const fotoInput = document.getElementById('edit-foto-input');
    if (fotoInput) {
        fotoInput.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;

            let loaded = 0;
            for (const file of files) {
                try {
                    const compressedBase64 = await compressImage(file);
                    window.editUploadedPhotos.push({
                        name: file.name,
                        base64: compressedBase64
                    });
                } catch (err) {
                    console.error("Error comprimiendo imagen general:", err);
                }
                loaded++;
                if (loaded === files.length) {
                    renderPhotoPreviews();
                    e.target.value = ''; // limpiar input
                }
            }
        });
    }

    // Enlace de carga de fotos para visitas técnicas
    window.visitUploadedPhotos = [];
    const visitFotoInput = document.getElementById('visit-foto-input');
    if (visitFotoInput) {
        visitFotoInput.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;

            let loaded = 0;
            for (const file of files) {
                try {
                    const compressedBase64 = await compressImage(file);
                    window.visitUploadedPhotos.push(compressedBase64);
                } catch (err) {
                    console.error("Error comprimiendo imagen de visita:", err);
                }
                loaded++;
                if (loaded === files.length) {
                    renderVisitPhotoPreviews();
                    e.target.value = ''; // limpiar input
                }
            }
        });
    }

    // 7. Geolocalización celular para visitas
    const btnGPS = document.getElementById('btn-visit-capture-gps');
    if (btnGPS) {
        btnGPS.addEventListener('click', () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        document.getElementById('visit-gps-lat').value = lat.toFixed(6);
                        document.getElementById('visit-gps-lng').value = lng.toFixed(6);

                        if (window.visitMapInstance && window.visitMarker) {
                            const pos = L.latLng(lat, lng);
                            window.visitMarker.setLatLng(pos);
                            window.visitMapInstance.setView(pos, 15);
                        }
                        alertToast("Ubicación capturada con éxito", "success");
                    },
                    (err) => {
                        console.warn("Error de geolocalización, usando mock:", err);
                        // Mock de coordenadas en Antioquia (Medellín/Jericó)
                        const lat = 6.25184 + (Math.random() - 0.5) * 0.05;
                        const lng = -75.56359 + (Math.random() - 0.5) * 0.05;
                        document.getElementById('visit-gps-lat').value = lat.toFixed(6);
                        document.getElementById('visit-gps-lng').value = lng.toFixed(6);
                        if (window.visitMapInstance && window.visitMarker) {
                            const pos = L.latLng(lat, lng);
                            window.visitMarker.setLatLng(pos);
                            window.visitMapInstance.setView(pos, 15);
                        }
                        alertToast("GPS no disponible. Se generaron coordenadas de simulación.", "warning");
                    }
                );
            } else {
                alertToast("Geolocalización no soportada por el navegador", "error");
            }
        });
    }

    // Actualizar marcador al cambiar manualmente lat/lng inputs de visita
    ['visit-gps-lat', 'visit-gps-lng'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', () => {
                const lat = parseFloat(document.getElementById('visit-gps-lat').value);
                const lng = parseFloat(document.getElementById('visit-gps-lng').value);
                if (!isNaN(lat) && !isNaN(lng) && window.visitMapInstance && window.visitMarker) {
                    const pos = L.latLng(lat, lng);
                    window.visitMarker.setLatLng(pos);
                    window.visitMapInstance.setView(pos, 14);
                }
            });
        }
    });

    // Función para inicializar mapa de visita
    window.visitMapInstance = null;
    window.visitMarker = null;
    function initVisitMap(lat, lng) {
        const mapDiv = document.getElementById('visit-map');
        if (!mapDiv) return;

        const initialPos = (lat && lng && lat !== 0 && lng !== 0) ? L.latLng(lat, lng) : L.latLng(6.25184, -75.56359);
        const initialZoom = (lat && lng && lat !== 0 && lng !== 0) ? 14 : 8;

        if (!window.visitMapInstance) {
            window.visitMapInstance = L.map('visit-map', {
                zoomControl: true,
                attributionControl: false
            });

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 18,
                crossOrigin: true
            }).addTo(window.visitMapInstance);

            window.visitMarker = L.marker(initialPos, {
                draggable: true
            }).addTo(window.visitMapInstance);

            window.visitMarker.on('dragend', function () {
                const pos = window.visitMarker.getLatLng();
                document.getElementById('visit-gps-lat').value = pos.lat.toFixed(6);
                document.getElementById('visit-gps-lng').value = pos.lng.toFixed(6);
            });

            window.visitMapInstance.on('click', function (e) {
                window.visitMarker.setLatLng(e.latlng);
                document.getElementById('visit-gps-lat').value = e.latlng.lat.toFixed(6);
                document.getElementById('visit-gps-lng').value = e.latlng.lng.toFixed(6);
            });
        } else {
            window.visitMarker.setLatLng(initialPos);
        }

        window.visitMapInstance.setView(initialPos, initialZoom);
        setTimeout(() => {
            window.visitMapInstance.invalidateSize();
        }, 100);
    }

    // Función para inicializar mapa de detalle de visita (solo lectura)
    window.visitDetailMapInstance = null;
    window.visitDetailMarker = null;
    function initVisitDetailMap(lat, lng) {
        const mapDiv = document.getElementById('visit-detail-map');
        if (!mapDiv) return;

        const initialPos = (lat && lng && lat !== 0 && lng !== 0) ? L.latLng(lat, lng) : L.latLng(6.25184, -75.56359);
        const initialZoom = (lat && lng && lat !== 0 && lng !== 0) ? 14 : 8;

        if (!window.visitDetailMapInstance) {
            window.visitDetailMapInstance = L.map('visit-detail-map', {
                zoomControl: true,
                attributionControl: false
            });

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 18,
                crossOrigin: true
            }).addTo(window.visitDetailMapInstance);

            window.visitDetailMarker = L.marker(initialPos).addTo(window.visitDetailMapInstance);
        } else {
            window.visitDetailMarker.setLatLng(initialPos);
        }

        window.visitDetailMapInstance.setView(initialPos, initialZoom);
        setTimeout(() => {
            window.visitDetailMapInstance.invalidateSize();
        }, 100);
    }

    // Modal para visualizar detalle de visita técnica
    window.openVisitDetailModal = function (visitId) {
        const visits = window.DIATDataService.getTechnicalVisits();
        const v = visits.find(visit => visit.id === visitId);
        if (!v) return;

        document.getElementById('visit-detail-title').textContent = `Visita Técnica - Convenio N° ${v.convenioId}`;
        document.getElementById('visit-detail-subtitle').textContent = `Fecha de Visita: ${v.fecha}`;
        document.getElementById('visit-detail-tipo').textContent = v.tipo;
        document.getElementById('visit-detail-usuario').textContent = v.usuario || 'N/A';
        document.getElementById('visit-detail-obs').textContent = v.observaciones || '--';
        document.getElementById('visit-detail-compromisos').textContent = v.compromisos || '--';
        document.getElementById('visit-detail-riesgos').textContent = v.riesgos || '--';

        // Mostrar botón de editar si el usuario logueado es el creador de la visita
        const loggedUser = getLoggedUser();
        const btnEdit = document.getElementById('btn-edit-visit-detail');
        if (btnEdit) {
            if (loggedUser && v.usuario && loggedUser.name.trim().toUpperCase() === v.usuario.trim().toUpperCase()) {
                btnEdit.classList.remove('hidden');
                btnEdit.dataset.visitId = v.id;
            } else {
                btnEdit.classList.add('hidden');
                delete btnEdit.dataset.visitId;
            }
        }

        // Cargar fotos
        const photosContainer = document.getElementById('visit-detail-photos');
        const emptyPhotos = document.getElementById('visit-detail-photos-empty');
        photosContainer.innerHTML = '';

        if (v.photos && v.photos.length > 0) {
            emptyPhotos.classList.add('hidden');
            photosContainer.classList.remove('hidden');
            v.photos.forEach((photo, idx) => {
                const img = document.createElement('img');
                img.src = photo;
                img.className = 'w-full aspect-square object-cover rounded border border-slate-200 cursor-pointer hover:opacity-90 transition-all';
                img.addEventListener('click', (e) => {
                    e.stopPropagation();
                    window.openVisitPhotoLightbox(v.id, idx);
                });
                photosContainer.appendChild(img);
            });
        } else {
            emptyPhotos.classList.remove('hidden');
            photosContainer.classList.add('hidden');
        }

        // Cargar ubicación
        const lat = parseFloat(v.lat) || 0;
        const lng = parseFloat(v.lng) || 0;
        document.getElementById('visit-detail-lat').textContent = lat !== 0 ? lat.toFixed(6) : 'N/A';
        document.getElementById('visit-detail-lng').textContent = lng !== 0 ? lng.toFixed(6) : 'N/A';

        // Mostrar modal
        document.getElementById('modal-detalle-visita').style.display = 'flex';
        document.getElementById('modal-detalle-visita').classList.remove('hidden');

        // Inicializar mapa de detalle
        setTimeout(() => {
            initVisitDetailMap(lat, lng);
        }, 200);
    };

    // Cerrar modal de detalle de visitas
    ['btn-close-visit-detail-modal', 'btn-close-visit-detail'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('click', () => {
                document.getElementById('modal-detalle-visita').style.display = 'none';
                document.getElementById('modal-detalle-visita').classList.add('hidden');
            });
        }
    });

    window.editingVisitId = null;

    window.openEditVisitModal = function (visitId) {
        const visits = window.DIATDataService.getTechnicalVisits();
        const v = visits.find(visit => visit.id === visitId);
        if (!v) return;

        window.editingVisitId = v.id;

        // Cambiar título del modal
        const titleEl = document.getElementById('modal-registrar-visita-title');
        const descEl = document.getElementById('modal-registrar-visita-desc');
        if (titleEl) titleEl.textContent = "Editar Visita Técnica";
        if (descEl) descEl.textContent = "Modificación de informe de supervisión y geolocalización";

        // Poblar select
        const selectEl = document.getElementById('visit-convenio-select');
        if (selectEl) {
            selectEl.innerHTML = '';
            const opt = document.createElement('option');
            opt.value = v.convenioId;
            opt.textContent = `Convenio ${v.convenioId}`;
            selectEl.appendChild(opt);
            selectEl.disabled = true;
        }

        // Poblar campos
        document.getElementById('visit-fecha').value = toDateInputValue(v.fecha);
        document.getElementById('visit-tipo').value = v.tipo || 'Avance de obra';
        document.getElementById('visit-obs').value = v.observaciones || '';
        document.getElementById('visit-compromisos').value = v.compromisos || '';
        document.getElementById('visit-riesgos').value = v.riesgos || '';

        window.visitUploadedPhotos = v.photos || [];
        renderVisitPhotoPreviews();

        const lat = parseFloat(v.lat) || 0;
        const lng = parseFloat(v.lng) || 0;
        document.getElementById('visit-gps-lat').value = lat !== 0 ? lat.toFixed(6) : '';
        document.getElementById('visit-gps-lng').value = lng !== 0 ? lng.toFixed(6) : '';

        // Mostrar modal
        document.getElementById('modal-registrar-visita').style.display = 'flex';
        document.getElementById('modal-registrar-visita').classList.remove('hidden');

        // Inicializar mapa
        setTimeout(() => {
            initVisitMap(lat, lng);
        }, 200);
    };

    const btnEditVisitDetail = document.getElementById('btn-edit-visit-detail');
    if (btnEditVisitDetail) {
        btnEditVisitDetail.addEventListener('click', () => {
            const visitId = btnEditVisitDetail.dataset.visitId;
            if (visitId) {
                document.getElementById('modal-detalle-visita').style.display = 'none';
                document.getElementById('modal-detalle-visita').classList.add('hidden');
                window.openEditVisitModal(visitId);
            }
        });
    }

    // 8. Guardar Visita en el nuevo modal independiente
    const btnSaveVisit = document.getElementById('btn-save-visit');
    if (btnSaveVisit) {
        btnSaveVisit.addEventListener('click', async () => {
            const convenioId = document.getElementById('visit-convenio-select').value;
            if (!convenioId) {
                alertToast("Error", "Debes seleccionar un convenio para registrar la visita", "error");
                return;
            }

            const fechaVal = document.getElementById('visit-fecha').value;
            const tipo = document.getElementById('visit-tipo').value;
            const observaciones = document.getElementById('visit-obs').value;
            const compromisos = document.getElementById('visit-compromisos').value;
            const riesgos = document.getElementById('visit-riesgos').value;
            const lat = parseFloat(document.getElementById('visit-gps-lat').value) || 0;
            const lng = parseFloat(document.getElementById('visit-gps-lng').value) || 0;

            if (!observaciones.trim()) {
                alertToast("Error", "Las observaciones técnicas son obligatorias para registrar la visita", "error");
                return;
            }

            const user = getLoggedUser();
            const username = user ? user.name : 'Jonathan Marín';

            btnSaveVisit.disabled = true;
            const oldHtml = btnSaveVisit.innerHTML;

            const isEdit = !!window.editingVisitId;
            if (isEdit) {
                btnSaveVisit.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i>Guardando...';
                await window.DIATDataService.updateTechnicalVisit(window.editingVisitId, {
                    fecha: fechaVal ? toDateInputValue(fechaVal) : undefined,
                    tipo,
                    observaciones,
                    compromisos,
                    riesgos,
                    lat,
                    lng,
                    photos: window.visitUploadedPhotos
                });
            } else {
                btnSaveVisit.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i>Registrando...';
                // Guardar visita técnica
                await window.DIATDataService.addTechnicalVisit(username, convenioId, {
                    fecha: fechaVal ? toDateInputValue(fechaVal) : undefined,
                    tipo,
                    observaciones,
                    compromisos,
                    riesgos,
                    lat,
                    lng,
                    photoCount: window.visitUploadedPhotos.length,
                    photos: window.visitUploadedPhotos
                });
            }

            // Si las coordenadas son válidas, actualizar la ubicación del convenio en la base de datos
            if (lat !== 0 && lng !== 0) {
                const row = rawData.find(r => String(r['CONVENIO']).trim() === String(convenioId).trim());
                if (row) {
                    await window.DIATDataService.saveConvenioUpdate(username, convenioId, {
                        'LATITUD': lat,
                        'LONGITUD': lng
                    }, row);
                }
            }

            btnSaveVisit.disabled = false;
            btnSaveVisit.innerHTML = oldHtml;

            // Limpiar campos y cerrar modal
            document.getElementById('visit-obs').value = '';
            document.getElementById('visit-compromisos').value = '';
            document.getElementById('visit-riesgos').value = '';
            window.visitUploadedPhotos = [];
            if (document.getElementById('visit-foto-input')) document.getElementById('visit-foto-input').value = '';
            renderVisitPhotoPreviews();

            // Restaurar estado del selector de convenios
            const selectEl = document.getElementById('visit-convenio-select');
            if (selectEl) selectEl.disabled = false;

            document.getElementById('modal-registrar-visita').style.display = 'none';
            document.getElementById('modal-registrar-visita').classList.add('hidden');

            if (isEdit) {
                alertToast('Visita Actualizada', 'La visita técnica ha sido modificada con éxito.');
            } else {
                alertToast('Visita Registrada', 'La visita técnica ha sido guardada con éxito.');
            }
            window.editingVisitId = null;

            // Recargar datos y fusionar
            if (window.baseExcelData && window.DIATDataService) {
                rawData = window.DIATDataService.mergeData(window.baseExcelData);
            }

            // Actualizar dashboard principal, mapa, listados y portal
            applyFilters();
            renderSupervisorPortal();
        });
    }

    // Al cambiar la selección en el selector de convenios del modal de visitas
    const visitConvenioSelect = document.getElementById('visit-convenio-select');
    if (visitConvenioSelect) {
        visitConvenioSelect.addEventListener('change', () => {
            const convenioId = visitConvenioSelect.value;
            const row = rawData.find(r => String(r['CONVENIO']).trim() === String(convenioId).trim());
            if (row) {
                const lat = parseFloat(row['LATITUD']) || 0;
                const lng = parseFloat(row['LONGITUD']) || 0;
                document.getElementById('visit-gps-lat').value = lat !== 0 ? lat.toFixed(6) : '';
                document.getElementById('visit-gps-lng').value = lng !== 0 ? lng.toFixed(6) : '';
                initVisitMap(lat, lng);
            }
        });
    }

    // 9. Registrar Visita desde pestaña del portal (Abre nuevo modal independiente)
    const btnRegistrarPortal = document.getElementById('btn-registrar-visita-portal');
    if (btnRegistrarPortal) {
        btnRegistrarPortal.addEventListener('click', () => {
            const supervisorRows = getSupervisorRows();
            if (supervisorRows.length === 0) {
                alertToast('Sin convenios', 'No tienes convenios asignados para registrar visitas.', 'warning');
                return;
            }

            window.editingVisitId = null;
            const titleEl = document.getElementById('modal-registrar-visita-title');
            const descEl = document.getElementById('modal-registrar-visita-desc');
            if (titleEl) titleEl.textContent = "Registrar Nueva Visita Técnica";
            if (descEl) descEl.textContent = "Ingreso de informe de supervisión y geolocalización";

            // Resetear inputs del formulario de visita
            document.getElementById('visit-fecha').value = toDateInputValue('');
            document.getElementById('visit-tipo').value = 'Avance de obra';
            document.getElementById('visit-obs').value = '';
            document.getElementById('visit-compromisos').value = '';
            document.getElementById('visit-riesgos').value = '';
            window.visitUploadedPhotos = [];
            if (document.getElementById('visit-foto-input')) document.getElementById('visit-foto-input').value = '';
            renderVisitPhotoPreviews();

            // Poblar dropdown select
            const selectEl = document.getElementById('visit-convenio-select');
            if (selectEl) {
                selectEl.disabled = false;
                selectEl.innerHTML = '';
                supervisorRows.forEach((r, idx) => {
                    const opt = document.createElement('option');
                    opt.value = String(r['CONVENIO']).trim();
                    opt.textContent = `Convenio ${r['CONVENIO']} - ${r['MUNICIPIO'] || ''} (${r['ESTADO CONVENIO'] || ''})`;
                    selectEl.appendChild(opt);
                });
            }

            // Seleccionar el primero por defecto y cargar ubicación
            const firstRow = supervisorRows[0];
            const lat = parseFloat(firstRow['LATITUD']) || 0;
            const lng = parseFloat(firstRow['LONGITUD']) || 0;
            document.getElementById('visit-gps-lat').value = lat !== 0 ? lat.toFixed(6) : '';
            document.getElementById('visit-gps-lng').value = lng !== 0 ? lng.toFixed(6) : '';

            // Mostrar modal
            document.getElementById('modal-registrar-visita').style.display = 'flex';
            document.getElementById('modal-registrar-visita').classList.remove('hidden');

            // Inicializar mapa
            setTimeout(() => {
                initVisitMap(lat, lng);
            }, 200);
        });
    }

    // 10. Botones de cerrar modal de actualización de convenios
    ['btn-close-edit-modal', 'btn-cancel-edit'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('click', () => {
                document.getElementById('modal-actualizar-convenio').style.display = 'none';
                document.getElementById('modal-actualizar-convenio').classList.add('hidden');
            });
        }
    });

    // Cerrar modal de registro de visitas
    ['btn-close-visit-modal', 'btn-cancel-visit'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('click', () => {
                document.getElementById('modal-registrar-visita').style.display = 'none';
                document.getElementById('modal-registrar-visita').classList.add('hidden');
            });
        }
    });

    // 11. Botón guardar cambios de convenio
    const btnSaveEdit = document.getElementById('btn-save-edit');
    if (btnSaveEdit) {
        btnSaveEdit.addEventListener('click', async () => {
            const convenioId = document.getElementById('edit-general-id').value;
            const row = rawData.find(r => String(r['CONVENIO']).trim() === String(convenioId).trim());
            if (!row) return;

            const estado = document.getElementById('edit-general-estado').value;
            const fisico = parseFloat(document.getElementById('edit-seg-fisico').value) || 0;
            const financiero = parseFloat(document.getElementById('edit-seg-financiero').value) || 0;
            const longitud = parseFloat(document.getElementById('edit-seg-longitud').value) || 0;
            const area = parseFloat(document.getElementById('edit-seg-area').value) || 0;
            const desembolsado = parseFloat(document.getElementById('edit-seg-desembolsado').value) || 0;
            const autorizado = parseFloat(document.getElementById('edit-seg-autorizado').value) || 0;
            const corteInput = document.getElementById('edit-seg-corte').value;
            const observaciones = document.getElementById('edit-seg-obs').value;

            if (isNaN(fisico) || fisico < 0) {
                alertToast("Avance Inválido", "El avance físico debe ser mayor o igual a 0", "error");
                return;
            }
            if (isNaN(financiero) || financiero < 0) {
                alertToast("Avance Inválido", "El avance financiero debe ser mayor o igual a 0", "error");
                return;
            }

            // Convertir fecha de corte a DD/MM/YYYY
            let fechaCorte = '';
            if (corteInput) {
                const parts = corteInput.split('-');
                if (parts.length === 3) {
                    fechaCorte = `${parts[2]}/${parts[1]}/${parts[0]}`;
                }
            }

            const isAnterior = isCuatrenioAnterior(row);
            const updatedFields = {
                'ESTADO CONVENIO': estado,
                'VALOR TOTAL DESEMBOLSADO': desembolsado,
                'VALOR TOTAL AUTORIZADO DEPARTAMENTO': autorizado,
                'OBSERVACIONES': observaciones
            };

            if (isAnterior) {
                updatedFields['LONGITUD EJECUTADA CUATRENIO(m)'] = longitud;
                updatedFields['AREA EJECUTADA CUATRENIO (m2)'] = area;
                row['LONGITUD EJECUTADA CUATRENIO'] = longitud;
                row['AREA EJECUTADA CUATRENIO (M2)'] = area;
            } else {
                updatedFields['LONGITUD EJECUTADA (m)'] = longitud;
                updatedFields['AREA EJECUTADA (m2)'] = area;
                row['LONGITUD EJECUTADA'] = longitud;
                row['AREA EJECUTADA (M2)'] = area;
            }

            const user = getLoggedUser();
            const username = user ? user.name : 'Jonathan Marín';

            // Mostrar la barra de progreso y ocultar botones para retroalimentación visual inmediata
            const progressContainer = document.getElementById('edit-save-progress-container');
            const progressText = document.getElementById('edit-save-progress-text');
            const progressPct = document.getElementById('edit-save-progress-pct');
            const progressBar = document.getElementById('edit-save-progress-bar');
            const actionsContainer = document.getElementById('edit-actions-container');

            if (progressContainer && actionsContainer) {
                progressContainer.classList.remove('hidden');
                actionsContainer.classList.add('hidden');
                progressBar.style.width = '20%';
                progressPct.textContent = '20%';
                progressText.textContent = 'Conectando con Google Sheets...';
            }

            // Guardar cambios en el service (Google Sheets de forma real)
            if (progressText && progressBar && progressPct) {
                progressBar.style.width = '40%';
                progressPct.textContent = '40%';
                progressText.textContent = 'Sincronizando con base en la nube...';
            }

            const saveSuccess = await window.DIATDataService.saveConvenioUpdate(username, convenioId, updatedFields, row);

            if (saveSuccess) {
                // Guardar fotos
                localStorage.setItem('diat_photos_' + convenioId, JSON.stringify(window.editUploadedPhotos));

                // Retraso de propagación para que Google Sheets procese los cambios en el XLSX de exportación
                const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

                if (progressText && progressBar && progressPct) {
                    progressBar.style.width = '60%';
                    progressPct.textContent = '60%';
                    progressText.textContent = 'Guardando cambios en Google Sheets...';
                }
                await delay(1000);

                if (progressText && progressBar && progressPct) {
                    progressBar.style.width = '75%';
                    progressPct.textContent = '75%';
                    progressText.textContent = 'Esperando procesamiento de la nube (2s)...';
                }
                await delay(1000);

                if (progressText && progressBar && progressPct) {
                    progressBar.style.width = '90%';
                    progressPct.textContent = '90%';
                    progressText.textContent = 'Esperando procesamiento de la nube (1s)...';
                }
                await delay(1000);

                if (progressText && progressBar && progressPct) {
                    progressBar.style.width = '95%';
                    progressPct.textContent = '95%';
                    progressText.textContent = 'Descargando base de datos actualizada...';
                }

                // Recargar datos directamente desde la nube (Google Sheets) para reflejar los cambios
                await loadExcelFile();

                if (progressText && progressBar && progressPct) {
                    progressBar.style.width = '100%';
                    progressPct.textContent = '100%';
                    progressText.textContent = '¡Sincronización exitosa!';
                }

                setTimeout(() => {
                    // Cerrar modal
                    document.getElementById('modal-actualizar-convenio').style.display = 'none';
                    document.getElementById('modal-actualizar-convenio').classList.add('hidden');

                    // Restaurar botones para la siguiente apertura
                    progressContainer.classList.add('hidden');
                    actionsContainer.classList.remove('hidden');

                    // Actualizar portal
                    renderSupervisorPortal();

                    alertToast("Sincronización Exitosa", "Convenio actualizado y sincronizado con Google Sheets.");
                }, 500);
            } else {
                // Restaurar botones si falla
                if (progressContainer && actionsContainer) {
                    progressContainer.classList.add('hidden');
                    actionsContainer.classList.remove('hidden');
                }
            }
        });
    }

    // Funciones de cálculo automático de avances físico y financiero
    const updateCalculatedFisico = () => {
        const alcanceM = parseFloat(document.getElementById('edit-alcance-m').value) || 0;
        const alcanceM2 = parseFloat(document.getElementById('edit-alcance-m2').value) || 0;
        const longitud = parseFloat(document.getElementById('edit-seg-longitud').value) || 0;
        const area = parseFloat(document.getElementById('edit-seg-area').value) || 0;

        let fisico = 0;
        if (alcanceM > 0) {
            fisico = (longitud / alcanceM) * 100;
        } else if (alcanceM2 > 0) {
            fisico = (area / alcanceM2) * 100;
        }
        document.getElementById('edit-seg-fisico').value = fisico.toFixed(1);
    };

    const updateCalculatedFinanciero = () => {
        const desembolsado = parseFloat(document.getElementById('edit-seg-desembolsado').value) || 0;
        const autorizado = parseFloat(document.getElementById('edit-seg-autorizado').value) || 0;

        let financiero = 0;
        if (desembolsado > 0) {
            financiero = (autorizado / desembolsado) * 100;
        }
        document.getElementById('edit-seg-financiero').value = financiero.toFixed(1);
    };

    // Registrar los escuchas para recalcular automáticamente
    ['edit-seg-longitud', 'edit-seg-area'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updateCalculatedFisico);
    });

    ['edit-seg-desembolsado', 'edit-seg-autorizado'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updateCalculatedFinanciero);
    });

    checkAuthStatus();
}

// Comprueba estado de sesión y dibuja perfil en Header y Portal
function checkAuthStatus() {
    const user = getLoggedUser();
    const btnLoginTrigger = document.getElementById('btn-login-trigger');
    const headerName = document.getElementById('header-user-name');
    const headerRole = document.getElementById('header-user-role');
    const headerAvatarImg = document.getElementById('header-user-avatar-img');

    // Elementos del dropdown
    const ddName = document.getElementById('dropdown-user-name');
    const ddRole = document.getElementById('dropdown-user-role');

    // Paneles del Portal
    const unauthorized = document.getElementById('portal-unauthorized');
    const authorized = document.getElementById('portal-authorized');

    if (user) {
        if (btnLoginTrigger) btnLoginTrigger.classList.add('hidden');
        if (headerName) headerName.textContent = user.name;
        if (headerRole) headerRole.textContent = user.role;
        if (headerAvatarImg) {
            headerAvatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0B5640&color=fff&bold=true`;
        }
        if (ddName) ddName.textContent = user.name;
        if (ddRole) ddRole.textContent = user.role;

        // Actualizar avatar y título de bienvenida del portal
        const portalAvatar = document.getElementById('portal-user-avatar');
        if (portalAvatar) portalAvatar.textContent = user.initials;
        const portalWelcome = document.getElementById('portal-welcome-title');
        if (portalWelcome) portalWelcome.textContent = `Bienvenido, ${user.name}`;

        if (unauthorized) unauthorized.classList.add('hidden');
        if (authorized) authorized.classList.remove('hidden');

        renderSupervisorPortal();
    } else {
        if (btnLoginTrigger) btnLoginTrigger.classList.remove('hidden');
        if (headerName) headerName.textContent = 'Supervisión DIAT';
        if (headerRole) headerRole.textContent = 'Equipo Técnico';
        if (headerAvatarImg) {
            headerAvatarImg.src = './assets/perfil_equipo.jpg';
        }
        if (ddName) ddName.textContent = 'Supervisión DIAT';
        if (ddRole) ddRole.textContent = 'Equipo Técnico';

        if (unauthorized) unauthorized.classList.remove('hidden');
        if (authorized) authorized.classList.add('hidden');
    }
}

// Cierra la sesión
function handleLogout() {
    localStorage.removeItem('diat_logged_user');
    sessionStorage.removeItem('diat_logged_user');
    checkAuthStatus();

    // Regresar a la pestaña principal (Resumen)
    const resumenTabBtn = document.querySelector('.tab-btn[data-tab="resumen"]');
    if (resumenTabBtn) resumenTabBtn.click();

    alertToast("Sesión Cerrada", "Has salido del portal de supervisores.");
}

// Renderización de la pestaña portal si está activa
function checkAndRenderPortal() {
    const user = getLoggedUser();
    if (user) {
        renderSupervisorPortal();
    }
}

// Renderizado principal del dashboard y subpestañas del Portal del Supervisor
function renderSupervisorPortal() {
    const supervisorRows = getSupervisorRows();

    // 1. Calcular KPIs
    let activos = 0, porLiquidar = 0, finalizados = 0, sumInv = 0, sumLong = 0;

    supervisorRows.forEach(r => {
        const state = getSystemState(r['ESTADO CONVENIO']).label;
        if (state === 'En Ejecución') activos++;
        else if (state === 'Por Liquidar') porLiquidar++;
        else if (state === 'Liquidado' || state === 'Ejecutado') finalizados++;

        sumInv += (r['APORTE DEPARTAMENTO'] || 0) + (r['ADICION DEPARTAMENTO'] || 0);
        sumLong += getRowLongitudEjecutada(r);
    });

    const alertsCount = getAlertsCount(supervisorRows);

    // Escribir KPIs en HTML
    document.getElementById('kpi-port-total').textContent = supervisorRows.length;
    document.getElementById('kpi-port-ejec').textContent = activos;
    document.getElementById('kpi-port-liq').textContent = porLiquidar;
    document.getElementById('kpi-port-fin').textContent = finalizados;
    document.getElementById('kpi-port-inv').textContent = formatCurrency(sumInv);
    document.getElementById('kpi-port-long').textContent = formatNumber(sumLong) + ' m';
    document.getElementById('kpi-port-venc').textContent = alertsCount;
    document.getElementById('kpi-port-update').textContent = 'Corte: ' + new Date().toLocaleDateString('es-CO');

    // 2. Renderizar subpestañas y gráficos
    renderSupervisorCharts(supervisorRows);
    renderSupervisorConvenios(supervisorRows);
    renderSupervisorAlertas(supervisorRows);
    renderSupervisorVisitasTable(supervisorRows);
    renderSupervisorHistorialTable(supervisorRows);
}

// Variable global para almacenar las instancias de los gráficos del portal del supervisor
window.portalCharts = {};

function renderSupervisorCharts(supervisorRows) {
    // 1. Chart - Distribución por Estado Contractual
    const estadosCount = {};
    supervisorRows.forEach(r => {
        const label = getSystemState(r['ESTADO CONVENIO']).label || 'Otros';
        estadosCount[label] = (estadosCount[label] || 0) + 1;
    });

    const canvasEstados = document.getElementById('chart-port-estados');
    if (canvasEstados) {
        if (window.portalCharts['estados']) {
            window.portalCharts['estados'].destroy();
        }

        const labels = Object.keys(estadosCount);
        const data = Object.values(estadosCount);

        const colorPalette = {
            'En Ejecución': '#0B5640',
            'Por Liquidar': '#F28E18',
            'Liquidado': '#3561AB',
            'Ejecutado': '#38BDF8',
            'Suspendido': '#94A3B8'
        };
        const backgroundColors = labels.map(l => colorPalette[l] || '#64748B');

        const ctx = canvasEstados.getContext('2d');
        window.portalCharts['estados'] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { family: 'Poppins', size: 10 },
                            color: '#475569'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        padding: 10,
                        titleFont: { family: 'Poppins', size: 11, weight: 'bold' },
                        bodyFont: { family: 'Poppins', size: 12 },
                        cornerRadius: 8
                    }
                },
                cutout: '60%'
            }
        });
    }

    // 2. Chart - Avance Físico vs Financiero por Convenio
    const canvasAvances = document.getElementById('chart-port-avances');
    if (canvasAvances) {
        if (window.portalCharts['avances']) {
            window.portalCharts['avances'].destroy();
        }

        const sortedRows = [...supervisorRows].slice(0, 10);
        const ids = sortedRows.map(r => `Conv. ${String(r['CONVENIO']).trim().slice(-6)}`);
        const fisicos = sortedRows.map(r => parseFloat(r['FISICO_NORM']) || 0);
        const financieros = sortedRows.map(r => parseFloat(r['FINANCIERO_NORM']) || 0);

        const ctx = canvasAvances.getContext('2d');
        window.portalCharts['avances'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ids,
                datasets: [
                    {
                        label: 'Avance Físico (%)',
                        data: fisicos,
                        backgroundColor: '#0B5640',
                        borderRadius: 6,
                        borderWidth: 0
                    },
                    {
                        label: 'Avance Financiero (%)',
                        data: financieros,
                        backgroundColor: '#3561AB',
                        borderRadius: 6,
                        borderWidth: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { family: 'Poppins', size: 10 },
                            color: '#475569'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        padding: 10,
                        titleFont: { family: 'Poppins', size: 11, weight: 'bold' },
                        bodyFont: { family: 'Poppins', size: 12 },
                        cornerRadius: 8,
                        callbacks: {
                            label: function (context) {
                                return ` ${context.dataset.label}: ${context.raw.toFixed(1)}%`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            font: { family: 'Poppins', size: 9 },
                            color: '#64748B'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: '#F1F5F9' },
                        ticks: {
                            font: { family: 'Poppins', size: 9 },
                            color: '#64748B',
                            callback: function (value) { return value + '%'; }
                        }
                    }
                }
            }
        });
    }
}

// Renderiza las tarjetas de convenios asignados
function renderSupervisorConvenios(supervisorRows) {
    const grid = document.getElementById('portal-convenios-grid');
    if (!grid) return;
    grid.innerHTML = '';

    if (supervisorRows.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-12 text-slate-400 font-medium text-sm italic">No tienes convenios asignados bajo tu supervisión.</div>`;
        return;
    }

    supervisorRows.forEach(row => {
        const id = String(row['CONVENIO']).trim();
        const municipio = row['MUNICIPIO'] || 'N/A';
        const fisico = row['FISICO_NORM'] || 0;
        const financiero = row['FINANCIERO_NORM'] || 0;
        const objeto = row['OBJETO'] || 'Sin descripción';
        const truncatedObjeto = objeto.length > 120 ? objeto.substring(0, 120) + '...' : objeto;
        const estado = row['ESTADO CONVENIO'] || 'N/A';
        const sysState = getSystemState(estado);

        const card = document.createElement('div');
        card.className = 'supervisor-card';
        card.innerHTML = `
            <div>
                <div class="flex justify-between items-start gap-2 mb-3">
                    <div>
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Convenio N°</span>
                        <h4 class="text-base font-black text-slate-800">${id}</h4>
                    </div>
                    <span class="badge-estado ${sysState.badgeClass} text-[9px] font-bold uppercase tracking-wider">${sysState.label}</span>
                </div>
                <div class="mb-4">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Municipio</span>
                    <p class="text-sm font-bold text-slate-700">${municipio}</p>
                </div>
                <div class="mb-4">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Objeto</span>
                    <p class="text-xs text-slate-500 font-medium leading-relaxed" title="${objeto}">${truncatedObjeto}</p>
                </div>
                <div class="space-y-3 mb-5">
                    <div>
                        <div class="flex justify-between items-center text-[10px] font-bold mb-1">
                            <span class="text-slate-400 uppercase">Avance Físico</span>
                            <span class="text-institutional-primary font-black">${fisico.toFixed(1)}%</span>
                        </div>
                        <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div class="bg-institutional-primary h-full animate-pulse-slow" style="width: ${fisico}%; background-color: #0B5640;"></div>
                        </div>
                    </div>
                    <div>
                        <div class="flex justify-between items-center text-[10px] font-bold mb-1">
                            <span class="text-slate-400 uppercase">Avance Financiero</span>
                            <span class="text-blue-600 font-black">${financiero.toFixed(1)}%</span>
                        </div>
                        <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div class="bg-blue-600 h-full" style="width: ${financiero}%"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <button type="button" class="w-full py-2.5 bg-institutional-pale hover:bg-institutional-primary/10 text-institutional-primary font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border border-institutional-light/10" onclick="openEditConvenioModal('${id}')">
                    <i class="fa-solid fa-pen-to-square"></i>
                    Actualizar Convenio
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Cuenta de alertas específicas del supervisor
function getAlertsCount(supervisorRows) {
    const today = new Date();
    let count = 0;
    supervisorRows.forEach(row => {
        const estStr = String(row['ESTADO CONVENIO'] || '').toLowerCase();
        if (estStr.includes('liquidado') || estStr.includes('resciliado')) return;

        let termStr = row['NUEVA FECHA DE TERMINACION'] || row['FECHA DE TERMINACION'];
        let termDate = parseCOPDate(termStr);
        const fisico = row['FISICO_NORM'] || 0;
        const financiero = row['FINANCIERO_NORM'] || 0;

        if (termDate && termDate < today) {
            count++;
        } else if (termDate) {
            const msLeft = termDate.getTime() - today.getTime();
            const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
            if (daysLeft <= 30) count++;
        }
        if (financiero > fisico + 15) count++;
    });
    return count;
}

// Renderizado del sub-mapa Leaflet en edición
function initEditMap(lat, lng) {
    const mapDiv = document.getElementById('edit-map');
    if (!mapDiv) return;

    const initialPos = (lat && lng && lat !== 0 && lng !== 0) ? L.latLng(lat, lng) : L.latLng(7.15, -75.55);
    const initialZoom = (lat && lng && lat !== 0 && lng !== 0) ? 14 : 8;

    if (!window.editMapInstance) {
        window.editMapInstance = L.map('edit-map', {
            zoomControl: true,
            attributionControl: false
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 18,
            crossOrigin: true
        }).addTo(window.editMapInstance);

        window.editMarker = L.marker(initialPos, {
            draggable: true
        }).addTo(window.editMapInstance);

        window.editMarker.on('dragend', function () {
            const pos = window.editMarker.getLatLng();
            document.getElementById('edit-gps-lat').value = pos.lat.toFixed(6);
            document.getElementById('edit-gps-lng').value = pos.lng.toFixed(6);
        });

        window.editMapInstance.on('click', function (e) {
            window.editMarker.setLatLng(e.latlng);
            document.getElementById('edit-gps-lat').value = e.latlng.lat.toFixed(6);
            document.getElementById('edit-gps-lng').value = e.latlng.lng.toFixed(6);
        });
    } else {
        window.editMarker.setLatLng(initialPos);
    }

    window.editMapInstance.setView(initialPos, initialZoom);
    window.editMapInstance.invalidateSize();
}

// Helper para comprimir imágenes del lado del cliente usando canvas
function compressImage(file, maxWidth = 1000, maxHeight = 1000) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// Dibuja vistas previas de imágenes cargadas para visitas
function renderVisitPhotoPreviews() {
    const previewContainer = document.getElementById('visit-foto-preview');
    if (!previewContainer) return;
    previewContainer.innerHTML = '';

    if (window.visitUploadedPhotos.length === 0) {
        previewContainer.innerHTML = `<div class="col-span-full text-center py-4 text-slate-400 font-medium text-xs italic">Ninguna fotografía de visita cargada.</div>`;
        return;
    }

    window.visitUploadedPhotos.forEach((photo, index) => {
        const item = document.createElement('div');
        item.className = 'relative group aspect-square rounded-lg overflow-hidden border border-slate-200';
        item.style.height = '60px';
        item.style.width = '60px';
        item.innerHTML = `
            <img src="${photo}" class="w-full h-full object-cover" />
            <button type="button" class="absolute top-0.5 right-0.5 bg-red-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px] hover:bg-red-700" onclick="deleteVisitPhoto(${index})">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        previewContainer.appendChild(item);
    });
}

window.deleteVisitPhoto = function (index) {
    window.visitUploadedPhotos.splice(index, 1);
    renderVisitPhotoPreviews();
};

window.openVisitPhotoLightbox = function (visitId, photoIndex) {
    const visits = window.DIATDataService.getTechnicalVisits();
    const visit = visits.find(v => v.id === visitId);
    if (!visit || !visit.photos || visit.photos.length === 0) return;

    currentGalleryImages = visit.photos;
    openLightbox(photoIndex);
};

// Dibuja vistas previas de imágenes cargadas en el modal
function renderPhotoPreviews() {
    const previewContainer = document.getElementById('edit-galeria-preview');
    if (!previewContainer) return;
    previewContainer.innerHTML = '';

    if (window.editUploadedPhotos.length === 0) {
        previewContainer.innerHTML = `<div class="col-span-full text-center py-6 text-slate-400 font-medium text-xs italic">Ninguna fotografía cargada en esta sesión.</div>`;
        return;
    }

    window.editUploadedPhotos.forEach((photo, index) => {
        const item = document.createElement('div');
        item.className = 'photo-preview-item';
        item.innerHTML = `
            <img src="${photo.base64}" class="photo-preview-img" />
            <button type="button" class="photo-preview-delete" onclick="deleteUploadedPhoto(${index})">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        previewContainer.appendChild(item);
    });
}

// Simulador de barra de progreso de sincronización
function simulateSyncProgress() {
    return new Promise((resolve) => {
        const container = document.getElementById('edit-save-progress-container');
        const text = document.getElementById('edit-save-progress-text');
        const pctText = document.getElementById('edit-save-progress-pct');
        const bar = document.getElementById('edit-save-progress-bar');
        const actions = document.getElementById('edit-actions-container');

        if (container && text && pctText && bar && actions) {
            container.classList.remove('hidden');
            actions.classList.add('hidden');
            bar.style.width = '0%';
            pctText.textContent = '0%';
            text.textContent = 'Validando campos y empaquetando reporte...';

            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                if (progress > 100) progress = 100;

                bar.style.width = `${progress}%`;
                pctText.textContent = `${progress}%`;

                if (progress >= 30 && progress < 60) {
                    text.textContent = 'Guardando cambios en base local...';
                } else if (progress >= 60 && progress < 90) {
                    text.textContent = 'Sincronizando modificaciones con Google Sheets...';
                } else if (progress >= 90) {
                    text.textContent = 'Sincronización completa con Base Maestra.';
                }

                if (progress === 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        container.classList.add('hidden');
                        actions.classList.remove('hidden');
                        resolve();
                    }, 350);
                }
            }, 100);
        } else {
            resolve();
        }
    });
}

// Abre el modal de edición de convenio y carga sus datos correspondientes
window.openEditConvenioModal = function (convenioId) {
    const row = rawData.find(r => String(r['CONVENIO']).trim() === String(convenioId).trim());
    if (!row) return;

    // Resetear pestañas del modal
    document.querySelectorAll('.edit-tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-edittab') === 'general') btn.classList.add('active');
    });
    document.querySelectorAll('.edit-panel').forEach(panel => {
        panel.classList.add('hidden');
        if (panel.id === 'edit-panel-general') panel.classList.remove('hidden');
    });

    // Cargar datos en los inputs del modal
    document.getElementById('edit-modal-title').textContent = `Actualizar Convenio N° ${row['CONVENIO']}`;
    document.getElementById('edit-modal-subtitle').textContent = `${row['MUNICIPIO'] || 'N/A'} — ${row['SUBREGION'] || 'N/A'}`;

    document.getElementById('edit-general-id').value = row['CONVENIO'] || '';
    document.getElementById('edit-general-mun').value = row['MUNICIPIO'] || '';
    document.getElementById('edit-general-sub').value = row['SUBREGION'] || '';
    document.getElementById('edit-general-ejec').value = row['CONVENIANTE EJECUTOR'] || '';
    document.getElementById('edit-general-sup').value = row['SUPERVISOR'] || 'Jonathan Marín Gallego';
    document.getElementById('edit-general-valor').value = formatCurrency(row['VALOR TOTAL'] || 0);

    let plazoVal = 0;
    for (let key in row) {
        if (key.toUpperCase().trim() === 'PLAZO INICIAL' || key.toUpperCase().trim().includes('PLAZO INICIAL')) {
            plazoVal = parseFloat(row[key]) || 0;
            break;
        }
    }
    document.getElementById('edit-general-plazo').value = plazoVal;
    const selectEstado = document.getElementById('edit-general-estado');
    if (selectEstado) {
        const valToSet = row['ESTADO CONVENIO'] || 'En Ejecución';
        let matched = false;
        for (let option of selectEstado.options) {
            if (option.value.toLowerCase() === valToSet.toLowerCase()) {
                selectEstado.value = option.value;
                matched = true;
                break;
            }
        }
        if (!matched) {
            selectEstado.value = 'En Ejecución';
        }
    }

    // Cargar sección de Seguimiento
    document.getElementById('edit-alcance-m').value = getRowLongitudContratada(row);
    document.getElementById('edit-alcance-m2').value = getRowAreaContratada(row);

    document.getElementById('edit-seg-fisico').value = (row['FISICO_NORM'] || 0).toFixed(1);
    document.getElementById('edit-seg-financiero').value = (row['FINANCIERO_NORM'] || 0).toFixed(1);
    document.getElementById('edit-seg-longitud').value = getRowLongitudEjecutada(row);
    document.getElementById('edit-seg-area').value = getRowAreaEjecutada(row);
    document.getElementById('edit-seg-desembolsado').value = row['VALOR TOTAL DESEMBOLSADO'] || 0;
    document.getElementById('edit-seg-autorizado').value = row['VALOR TOTAL AUTORIZADO DEPARTAMENTO'] || 0;

    const corteStr = row['FECHA DE CORTE'] || row['FECHA_CORTE'] || '';
    document.getElementById('edit-seg-corte').value = toDateInputValue(corteStr);
    document.getElementById('edit-seg-obs').value = row['OBSERVACIONES'] || '';

    // Cargar fotos guardadas
    window.editUploadedPhotos = [];
    try {
        const stored = localStorage.getItem('diat_photos_' + row['CONVENIO']);
        if (stored) {
            window.editUploadedPhotos = JSON.parse(stored) || [];
        }
    } catch (e) {
        console.error(e);
    }
    renderPhotoPreviews();

    // Mostrar modal
    document.getElementById('modal-actualizar-convenio').style.display = 'flex';
    document.getElementById('modal-actualizar-convenio').classList.remove('hidden');
};

// Elimina una imagen cargada de la lista
window.deleteUploadedPhoto = function (index) {
    window.editUploadedPhotos.splice(index, 1);
    renderPhotoPreviews();
};

// Carga las visitas de un convenio específico en el modal
function renderEditModalVisitsList(convenioId) {
    const list = document.getElementById('edit-visitas-list');
    if (!list) return;
    list.innerHTML = '';

    if (!window.DIATDataService) {
        list.innerHTML = `<div class="text-center py-4 text-slate-400 font-medium text-xs italic">Error de servicio de datos.</div>`;
        return;
    }

    const allVisits = window.DIATDataService.getTechnicalVisits();
    const filtered = allVisits.filter(v => String(v.convenioId).trim() === String(convenioId).trim());

    if (filtered.length === 0) {
        list.innerHTML = `<div class="text-center py-4 text-slate-400 font-medium text-xs italic">No se registran visitas técnicas previas.</div>`;
        return;
    }

    filtered.forEach(v => {
        const item = document.createElement('div');
        item.className = 'bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1 text-left';

        let photosHtml = '';
        if (v.photos && v.photos.length > 0) {
            photosHtml = `
                <div class="mt-2 grid grid-cols-4 gap-2 pt-2 border-t border-slate-200">
                    ${v.photos.map((photo, idx) => `
                        <img src="${photo}" class="w-12 h-12 object-cover rounded cursor-pointer border border-slate-200 hover:ring-2 hover:ring-institutional-light transition-all" onclick="window.openVisitPhotoLightbox('${v.id}', ${idx})" />
                    `).join('')}
                </div>
            `;
        }

        item.innerHTML = `
            <div class="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                <span>Fecha: ${v.fecha}</span>
                <span class="bg-institutional-pale text-institutional-primary px-1.5 py-0.5 rounded">${v.tipo}</span>
            </div>
            <p class="text-xs font-bold text-slate-700 mt-1">${v.observaciones}</p>
            ${v.compromisos ? `<p class="text-[10px] text-slate-500"><strong class="text-slate-600">Compromisos:</strong> ${v.compromisos}</p>` : ''}
            ${v.riesgos ? `<p class="text-[10px] text-slate-500"><strong class="text-slate-600">Riesgos:</strong> ${v.riesgos}</p>` : ''}
            <div class="text-[9px] text-slate-400 mt-1 flex justify-between">
                <span>Registrado por: ${v.usuario}</span>
            </div>
            ${photosHtml}
        `;
        list.appendChild(item);
    });
}

// Carga las visitas del supervisor en la sub-pestaña del portal
function renderSupervisorVisitasTable(supervisorRows) {
    const tbody = document.getElementById('portal-visitas-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!window.DIATDataService) return;

    const allVisits = window.DIATDataService.getTechnicalVisits();
    const assignedIds = supervisorRows.map(r => String(r['CONVENIO']).trim());
    const filtered = allVisits.filter(v => assignedIds.includes(String(v.convenioId).trim()));

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-slate-400 font-medium text-xs italic">No se registran visitas técnicas en tus convenios.</td></tr>`;
        return;
    }

    filtered.forEach(v => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-slate-100 hover:bg-slate-50 transition-all';
        tr.style.cursor = 'pointer';

        tr.addEventListener('click', (e) => {
            if (e.target.closest('button') || e.target.closest('img')) return;
            window.openVisitDetailModal(v.id);
        });

        let photosHtml = `<span class="text-slate-400 font-bold"><i class="fa-solid fa-image mr-1"></i>0</span>`;
        if (v.photos && v.photos.length > 0) {
            photosHtml = `
                <div class="flex flex-col gap-1 items-center justify-center">
                    <button type="button" class="text-institutional-primary hover:text-institutional-light font-bold text-[10px] uppercase flex items-center gap-1" onclick="event.stopPropagation(); window.openVisitPhotoLightbox('${v.id}', 0)">
                        <i class="fa-solid fa-images"></i> Ver (${v.photos.length})
                    </button>
                    <div class="flex gap-1 justify-center max-w-[80px] overflow-hidden">
                        ${v.photos.slice(0, 3).map((p, idx) => `
                            <img src="${p}" class="w-4 h-4 object-cover rounded cursor-pointer border border-slate-200" onclick="event.stopPropagation(); window.openVisitPhotoLightbox('${v.id}', ${idx})" />
                        `).join('')}
                        ${v.photos.length > 3 ? `<span class="text-[9px] text-slate-400 font-bold">+${v.photos.length - 3}</span>` : ''}
                    </div>
                </div>
            `;
        }

        const truncate = (str, len = 80) => (str && str.length > len) ? str.slice(0, len) + '...' : (str || '--');

        tr.innerHTML = `
            <td class="p-3 font-bold text-slate-700 text-left">${v.convenioId}</td>
            <td class="p-3 whitespace-nowrap text-slate-500 text-center">${v.fecha}</td>
            <td class="p-3 text-slate-600 font-bold text-center"><span class="bg-institutional-pale text-institutional-primary px-1.5 py-0.5 rounded text-[10px]">${v.tipo}</span></td>
            <td class="p-3 text-slate-600 text-left">${truncate(v.observaciones)}</td>
            <td class="p-3 text-slate-500 text-left">${truncate(v.compromisos)}</td>
            <td class="p-3 text-slate-500 text-left">${truncate(v.riesgos)}</td>
            <td class="p-3 text-center">${photosHtml}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Carga el historial de modificaciones del supervisor
function renderSupervisorHistorialTable(supervisorRows) {
    const tbody = document.getElementById('portal-historial-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!window.DIATDataService) return;

    const history = window.DIATDataService.getChangeHistory();
    const assignedIds = supervisorRows.map(r => String(r['CONVENIO']).trim());
    const filtered = history.filter(h => assignedIds.includes(String(h.convenio).trim()));

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-400 font-medium text-xs italic">Sin modificaciones registradas recientemente.</td></tr>`;
        return;
    }

    filtered.forEach(h => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-slate-100 hover:bg-slate-50';
        tr.innerHTML = `
            <td class="p-3 text-slate-500 whitespace-nowrap">${h.fecha} ${h.hora}</td>
            <td class="p-3 font-semibold text-slate-600">${h.usuario}</td>
            <td class="p-3 font-bold text-slate-700">${h.convenio}</td>
            <td class="p-3 text-slate-600 font-bold text-left uppercase text-[10px]">${h.campo}</td>
            <td class="p-3 text-red-600 text-left max-w-[150px] truncate" title="${h.valorAnterior}">${h.valorAnterior || '--'}</td>
            <td class="p-3 text-emerald-600 text-left max-w-[150px] truncate font-bold" title="${h.valorNew}">${h.valorNew || '--'}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Carga las alertas específicas del supervisor en el portal
function renderSupervisorAlertas(supervisorRows) {
    const container = document.getElementById('portal-alertas-list');
    if (!container) return;
    container.innerHTML = '';

    const today = new Date();
    let alertCount = 0;

    supervisorRows.forEach(row => {
        const id = String(row['CONVENIO']).trim();
        const municipio = row['MUNICIPIO'] || 'N/A';
        const fisico = row['FISICO_NORM'] || 0;
        const financiero = row['FINANCIERO_NORM'] || 0;

        let termStr = row['NUEVA FECHA DE TERMINACION'] || row['FECHA DE TERMINACION'];
        let termDate = parseCOPDate(termStr);
        const estStr = String(row['ESTADO CONVENIO'] || '').toLowerCase();
        const isLiquidado = estStr.includes('liquidado') || estStr.includes('resciliado');

        if (!isLiquidado) {
            let alertItem = null;
            if (termDate && termDate < today) {
                alertItem = {
                    type: 'vencido',
                    icon: 'fa-triangle-exclamation',
                    title: 'Convenio Vencido sin Liquidar',
                    desc: `El convenio venció el ${termStr} y continúa abierto sin acta de liquidación.`
                };
            } else if (termDate) {
                const msLeft = termDate.getTime() - today.getTime();
                const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
                if (daysLeft <= 30) {
                    alertItem = {
                        type: 'proximos',
                        icon: 'fa-clock',
                        title: 'Próximo a Vencer',
                        desc: `Faltan ${daysLeft} días para la fecha límite de terminación (${termStr}).`
                    };
                }
            }

            if (financiero > fisico + 15) {
                alertItem = {
                    type: 'desfase',
                    icon: 'fa-chart-pie',
                    title: 'Desfase Financiero Crítico',
                    desc: `El avance financiero (${financiero.toFixed(1)}%) supera al físico (${fisico.toFixed(1)}%) en más del 15%.`
                };
            }

            const suspVal = parseNum(row['SUSPENSION(MESES)'] || row['SUSPENSIÓN(MESES)'] || row['SUSPENSION (MESES)'] || 0);
            if (estStr.includes('suspendido') && suspVal >= 3) {
                alertItem = {
                    type: 'suspension',
                    icon: 'fa-pause',
                    title: 'Suspensión Prolongada',
                    desc: `El convenio acumula ${suspVal} meses en estado suspendido.`
                };
            }

            if (alertItem) {
                alertCount++;
                const itemDiv = document.createElement('div');
                itemDiv.className = `alert-feed-item alert-${alertItem.type} flex justify-between items-center gap-4`;
                itemDiv.innerHTML = `
                    <div class="flex items-start gap-3">
                        <div class="alert-item-icon ${alertItem.type}">
                            <i class="fa-solid ${alertItem.icon}"></i>
                        </div>
                        <div>
                            <h4 class="alert-item-title">${alertItem.title}</h4>
                            <p class="text-xs text-slate-500 leading-relaxed mt-0.5">${alertItem.desc}</p>
                            <div class="alert-item-meta mt-1.5">
                                <span class="alert-item-tag"><i class="fa-solid fa-hashtag"></i>${id}</span>
                                <span class="alert-item-tag"><i class="fa-solid fa-location-dot"></i>${municipio}</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <button type="button" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs uppercase tracking-wider transition-all" onclick="openEditConvenioModal('${id}')">
                            Gestionar
                        </button>
                    </div>
                `;
                container.appendChild(itemDiv);
            }
        }
    });

    if (alertCount === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-8 text-center text-emerald-600 bg-emerald-50/50 rounded-xl border border-emerald-100 p-4">
                <i class="fa-solid fa-circle-check text-2xl mb-2"></i>
                <h4 class="text-xs font-bold uppercase tracking-wider">¡Todo al día!</h4>
                <p class="text-[11px] text-emerald-600/80 mt-0.5">Tus convenios no presentan alertas de riesgo contractual vigentes.</p>
            </div>
        `;
    }
}

// ============================================================
// LÓGICA DE FILTROS COLAPSABLES Y BUSCADORES DE MUNICIPIOS
// ============================================================

// 1. Inicialización de Dropdowns con Buscador Integrado (Vanilla JS + Selección Múltiple)
function initSearchableDropdown(selectId, placeholder = "Seleccionar...") {
    const nativeSelect = document.getElementById(selectId);
    if (!nativeSelect) return;

    // Evitar doble inicialización
    if (nativeSelect.dataset.customSelectInitialized) return;
    nativeSelect.dataset.customSelectInitialized = "true";

    // Ocultar select nativo
    nativeSelect.style.display = 'none';

    // Crear contenedor
    const container = document.createElement('div');
    container.className = 'custom-select-container';
    nativeSelect.parentNode.insertBefore(container, nativeSelect.nextSibling);

    // Crear disparador (Trigger)
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'custom-select-trigger';
    trigger.innerHTML = `
        <span class="trigger-text">${placeholder}</span>
        <i class="fa-solid fa-chevron-down"></i>
    `;
    container.appendChild(trigger);

    // Crear panel desplegable
    const dropdown = document.createElement('div');
    dropdown.className = 'custom-select-dropdown';
    dropdown.innerHTML = `
        <div class="custom-select-search-wrapper">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" class="custom-select-search-input" placeholder="Buscar..." autocomplete="off">
        </div>
        <div class="custom-select-header-actions">
            <button type="button" class="custom-select-action-btn btn-select-all">
                <i class="fa-solid fa-check-double"></i> Seleccionar todos
            </button>
            <button type="button" class="custom-select-action-btn btn-clear-all">
                <i class="fa-solid fa-eraser"></i> Limpiar
            </button>
        </div>
        <div class="custom-select-options"></div>
    `;
    container.appendChild(dropdown);

    const searchInput = dropdown.querySelector('.custom-select-search-input');
    const optionsContainer = dropdown.querySelector('.custom-select-options');
    const btnSelectAll = dropdown.querySelector('.btn-select-all');
    const btnClearAll = dropdown.querySelector('.btn-clear-all');

    function updateTriggerText() {
        const selectedOpts = Array.from(nativeSelect.options).filter(o => o.selected && o.value !== '' && o.value !== 'todos' && o.value !== 'TODOS');
        const triggerText = trigger.querySelector('.trigger-text');

        if (selectedOpts.length === 0) {
            triggerText.textContent = placeholder;
            const badge = trigger.querySelector('.multi-count-badge');
            if (badge) badge.remove();
        } else if (selectedOpts.length === 1) {
            triggerText.textContent = selectedOpts[0].textContent;
            const badge = trigger.querySelector('.multi-count-badge');
            if (badge) badge.remove();
        } else {
            const labels = selectedOpts.map(o => o.textContent);
            const joined = labels.join(', ');
            if (selectedOpts.length <= 3 && joined.length < 24) {
                triggerText.textContent = joined;
            } else {
                triggerText.textContent = `${selectedOpts.length} seleccionados`;
            }
            let badge = trigger.querySelector('.multi-count-badge');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'multi-count-badge';
                trigger.insertBefore(badge, trigger.querySelector('i'));
            }
            badge.textContent = selectedOpts.length;
        }
    }

    // Función para reconstruir las opciones
    function rebuildOptions() {
        optionsContainer.innerHTML = '';
        const options = Array.from(nativeSelect.options);

        if (options.length === 0) {
            optionsContainer.innerHTML = `<div class="custom-select-no-results">No hay opciones disponibles</div>`;
            updateTriggerText();
            return;
        }

        options.forEach(opt => {
            const optionEl = document.createElement('div');
            optionEl.className = 'custom-select-option';
            optionEl.dataset.value = opt.value;

            const isAllOption = opt.value === '' || opt.value === 'todos' || opt.value === 'TODOS';

            if (opt.selected && !isAllOption) {
                optionEl.classList.add('selected');
            }

            if (isAllOption) {
                optionEl.innerHTML = `<div class="custom-select-option-content"><span class="custom-select-option-label">${opt.textContent}</span></div>`;
            } else {
                optionEl.innerHTML = `<div class="custom-select-option-content"><span class="option-checkbox"></span><span class="custom-select-option-label">${opt.textContent}</span></div>`;
            }

            optionEl.addEventListener('click', (e) => {
                e.stopPropagation();

                if (isAllOption) {
                    Array.from(nativeSelect.options).forEach(o => o.selected = false);
                    if (nativeSelect.options[0]) nativeSelect.options[0].selected = true;
                    container.classList.remove('active');
                } else {
                    opt.selected = !opt.selected;
                    const remainingSelected = Array.from(nativeSelect.options).filter(o => o.selected && o.value !== '' && o.value !== 'todos' && o.value !== 'TODOS');
                    if (remainingSelected.length === 0 && nativeSelect.options[0]) {
                        nativeSelect.options[0].selected = true;
                    } else if (remainingSelected.length > 0 && nativeSelect.options[0] && (nativeSelect.options[0].value === '' || nativeSelect.options[0].value === 'todos' || nativeSelect.options[0].value === 'TODOS')) {
                        nativeSelect.options[0].selected = false;
                    }
                }

                const allSelectedVals = Array.from(nativeSelect.options).filter(o => o.selected).map(o => o.value);
                optionsContainer.querySelectorAll('.custom-select-option').forEach(el => {
                    if (el.dataset.value && allSelectedVals.includes(el.dataset.value) && el.dataset.value !== '' && el.dataset.value !== 'todos' && el.dataset.value !== 'TODOS') {
                        el.classList.add('selected');
                    } else {
                        el.classList.remove('selected');
                    }
                });

                updateTriggerText();
                nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
            });

            optionsContainer.appendChild(optionEl);
        });

        updateTriggerText();
    }

    // Inicializar opciones
    rebuildOptions();

    // Acciones del header
    btnSelectAll.addEventListener('click', (e) => {
        e.stopPropagation();
        Array.from(nativeSelect.options).forEach(o => {
            o.selected = (o.value !== '' && o.value !== 'todos' && o.value !== 'TODOS');
        });
        rebuildOptions();
        nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
    });

    btnClearAll.addEventListener('click', (e) => {
        e.stopPropagation();
        Array.from(nativeSelect.options).forEach(o => o.selected = false);
        if (nativeSelect.options[0]) nativeSelect.options[0].selected = true;
        rebuildOptions();
        nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Observar cambios en los <option> del select nativo
    const observer = new MutationObserver(() => {
        rebuildOptions();
    });
    observer.observe(nativeSelect, { childList: true });

    // Sincronizar hacia atrás (si el select cambia por código)
    nativeSelect.addEventListener('change', () => {
        const selectedVals = Array.from(nativeSelect.options).filter(o => o.selected).map(o => o.value);
        dropdown.querySelectorAll('.custom-select-option').forEach(el => {
            if (el.dataset.value && selectedVals.includes(el.dataset.value) && el.dataset.value !== '' && el.dataset.value !== 'todos' && el.dataset.value !== 'TODOS') {
                el.classList.add('selected');
            } else {
                el.classList.remove('selected');
            }
        });
        updateTriggerText();
    });

    // Abrir/Cerrar el desplegable
    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        document.querySelectorAll('.custom-select-container').forEach(c => {
            if (c !== container) c.classList.remove('active');
        });

        container.classList.toggle('active');
        if (container.classList.contains('active')) {
            searchInput.value = '';
            filterOptions('');
            setTimeout(() => searchInput.focus(), 50);
        }
    });

    // Filtrar opciones al escribir
    function filterOptions(query) {
        const cleanQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").trim();
        const optionElements = optionsContainer.querySelectorAll('.custom-select-option');
        let visibleCount = 0;

        optionElements.forEach(el => {
            const text = el.textContent.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
            if (text.includes(cleanQuery)) {
                el.style.display = 'flex';
                visibleCount++;
            } else {
                el.style.display = 'none';
            }
        });

        const noRes = optionsContainer.querySelector('.custom-select-no-results');
        if (noRes) noRes.remove();

        if (visibleCount === 0) {
            const noResultsEl = document.createElement('div');
            noResultsEl.className = 'custom-select-no-results';
            noResultsEl.textContent = 'No se encontraron resultados';
            optionsContainer.appendChild(noResultsEl);
        }
    }

    searchInput.addEventListener('input', (e) => {
        filterOptions(e.target.value);
    });

    // Cerrar al hacer clic fuera del componente
    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            container.classList.remove('active');
        }
    });
}

// 2. Controladores de Eventos de la Interfaz y Filtros Activos
document.addEventListener('DOMContentLoaded', () => {
    // Alternancia de Filtros Avanzados (Resumen)
    const btnToggleFilters = document.getElementById('btn-toggle-filters');
    const filterPanel = document.getElementById('filter-panel-collapsible');

    if (btnToggleFilters && filterPanel) {
        btnToggleFilters.addEventListener('click', (e) => {
            e.preventDefault();
            const isExpanded = filterPanel.classList.toggle('expanded');
            btnToggleFilters.classList.toggle('active', isExpanded);
        });
    }

    // Alternancia de Filtros Avanzados (Mapa)
    const btnToggleMapFilters = document.getElementById('btn-toggle-map-filters');
    const mapFilterPanel = document.getElementById('map-filter-panel-collapsible');

    if (btnToggleMapFilters && mapFilterPanel) {
        btnToggleMapFilters.addEventListener('click', (e) => {
            e.preventDefault();
            const isExpanded = mapFilterPanel.classList.toggle('expanded');
            btnToggleMapFilters.classList.toggle('active', isExpanded);
        });
    }

    // Inicializar dropdowns con buscador personalizados
    initSearchableDropdown('filter-vigencia', 'Seleccionar Vigencia...');
    initSearchableDropdown('filter-supervisor', 'Seleccionar Supervisor...');
    initSearchableDropdown('filter-indicador', 'Seleccionar Indicador...');
    initSearchableDropdown('filter-clasificacion', 'Seleccionar Clasificación...');
    initSearchableDropdown('filter-municipio', 'Seleccionar Municipio...');
    initSearchableDropdown('filter-subregion', 'Seleccionar Subregión...');
    initSearchableDropdown('filter-estado', 'Seleccionar Estado...');
    initSearchableDropdown('filter-convenio-num', 'Seleccionar N° Convenio...');

    initSearchableDropdown('map-filter-vigencia', 'Seleccionar Vigencia...');
    initSearchableDropdown('map-filter-supervisor', 'Seleccionar Supervisor...');
    initSearchableDropdown('map-filter-indicador', 'Seleccionar Indicador...');
    initSearchableDropdown('map-filter-clasificacion', 'Seleccionar Clasificación...');
    initSearchableDropdown('map-filter-municipio', 'Seleccionar Municipio...');
    initSearchableDropdown('map-filter-subregion', 'Seleccionar Subregión...');
    initSearchableDropdown('map-filter-estado', 'Seleccionar Estado...');
    initSearchableDropdown('map-filter-convenio-num', 'Seleccionar N° Convenio...');

    // Contador de filtros activos
    const mainFilters = [
        'filter-vigencia', 'filter-supervisor', 'filter-indicador',
        'filter-clasificacion', 'filter-municipio', 'filter-subregion',
        'filter-estado', 'filter-convenio-num'
    ];

    const mapFilters = [
        'map-filter-vigencia', 'map-filter-supervisor', 'map-filter-indicador',
        'map-filter-clasificacion', 'map-filter-municipio', 'map-filter-subregion',
        'map-filter-estado', 'map-filter-convenio-num'
    ];

    function updateActiveFiltersBadge() {
        let activeCount = 0;
        mainFilters.forEach(id => {
            const vals = getSelectValues(id);
            if (vals.length > 0) {
                activeCount++;
            }
        });

        const badge = document.getElementById('active-filters-badge');
        if (badge) {
            if (activeCount > 0) {
                badge.textContent = `${activeCount} activo${activeCount > 1 ? 's' : ''}`;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    }

    function updateMapActiveFiltersBadge() {
        let activeCount = 0;
        mapFilters.forEach(id => {
            const vals = getSelectValues(id);
            if (vals.length > 0) {
                activeCount++;
            }
        });

        const badge = document.getElementById('map-active-filters-badge');
        if (badge) {
            if (activeCount > 0) {
                badge.textContent = `${activeCount} activo${activeCount > 1 ? 's' : ''}`;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    }

    // Vincular cambio de filtros nativos para actualizar contadores
    mainFilters.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', updateActiveFiltersBadge);
    });

    mapFilters.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', updateMapActiveFiltersBadge);
    });

    // Sincronizar botones de limpiar
    const btnResetFilters = document.getElementById('btn-reset-filters');
    if (btnResetFilters) {
        btnResetFilters.addEventListener('click', () => {
            setTimeout(updateActiveFiltersBadge, 50);
        });
    }

    const btnMapReset = document.getElementById('btn-map-reset');
    if (btnMapReset) {
        btnMapReset.addEventListener('click', () => {
            window.isResettingFilters = true;
            mapFilters.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    if (el.tagName === 'SELECT' && el.multiple) {
                        Array.from(el.options).forEach(o => o.selected = false);
                    } else {
                        el.value = '';
                    }
                    el.dispatchEvent(new Event('change'));
                }
            });
            window.isResettingFilters = false;
            applyMapFilters();
            setTimeout(updateMapActiveFiltersBadge, 50);
        });
    }

    // Alternancia de Pantalla Completa para el Mapa
    const btnMapFullscreen = document.getElementById('btn-map-fullscreen');
    const mapWrapper = document.getElementById('map-wrapper');

    if (btnMapFullscreen && mapWrapper) {
        btnMapFullscreen.addEventListener('click', (e) => {
            e.preventDefault();
            const isFullscreen = mapWrapper.classList.toggle('fullscreen');

            // Cambiar icono
            const icon = btnMapFullscreen.querySelector('i');
            if (icon) {
                icon.className = isFullscreen ? 'fa-solid fa-compress' : 'fa-expand';
                icon.classList.toggle('fa-expand', !isFullscreen);
                icon.classList.toggle('fa-compress', isFullscreen);
            }

            // Redimensionar MapLibre GL
            if (mlMap) {
                setTimeout(() => {
                    mlMap.resize();
                }, 100);
            }
        });

        // Cerrar con la tecla Esc
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mapWrapper.classList.contains('fullscreen')) {
                mapWrapper.classList.remove('fullscreen');
                const icon = btnMapFullscreen.querySelector('i');
                if (icon) {
                    icon.className = 'fa-solid fa-expand';
                }
                if (mlMap) {
                    setTimeout(() => {
                        mlMap.resize();
                    }, 100);
                }
            }
        });
    }

    // Sincronizar visitas técnicas en segundo plano desde Google Drive (visitas.json)
    if (window.DIATDataService) {
        window.DIATDataService.syncTechnicalVisitsFromServer().then(synced => {
            if (synced) {
                // Re-renderizar portal si está activo
                const logged = getLoggedUser();
                if (logged && typeof renderSupervisorPortal === 'function') {
                    renderSupervisorPortal();
                }
            }
        });
    }

    // Ejecución inicial
    updateActiveFiltersBadge();
    updateMapActiveFiltersBadge();
    if (typeof initSyntheticMap === 'function') {
        setTimeout(initSyntheticMap, 200);
    }
});

// =============================================================================
// GEOVISOR TERRITORIAL SINTÉTICO MINIMALISTA (PESTAÑA RESUMEN EJECUTIVO)
// =============================================================================
let synMap = null;
let synMapReady = false;
let synMpioData = null;
let synSubregionesData = null;
let synSubregionesLabelsData = null;
let synKmlGeojson = null;
let synVialData = { primaria: null, secundaria: null, terciaria: null };
let synCurrentPopup = null;
let synLayersState = {
    tramos: true,
    subregiones: false,
    municipios: true,
    primaria: false,
    secundaria: false,
    terciaria: false
};
let synActiveMode = 'general';

const SUBREGION_COLORS = {
    'BAJO CAUCA': '#F97316',        // Naranja vibrante
    'MAGDALENA MEDIO': '#14B8A6',   // Turquesa / Teal
    'NORDESTE': '#EC4899',          // Rosa / Magenta
    'NORTE': '#06B6D4',             // Cian / Sky
    'OCCIDENTE': '#F59E0B',         // Ámbar
    'ORIENTE': '#10B981',           // Esmeralda
    'SUROESTE': '#8B5CF6',          // Violeta
    'URABA': '#6366F1',             // Índigo real
    'VALLE DE ABURRA': '#3B82F6'    // Azul zafiro
};

const MPIO_SUBREGION_MAP = {
    'MEDELLIN': 'VALLE DE ABURRA', 'BELLO': 'VALLE DE ABURRA', 'ITAGUI': 'VALLE DE ABURRA', 'ENVIGADO': 'VALLE DE ABURRA',
    'CALDAS': 'VALLE DE ABURRA', 'COPACABANA': 'VALLE DE ABURRA', 'LA ESTRELLA': 'VALLE DE ABURRA', 'GIRARDOTA': 'VALLE DE ABURRA',
    'BARBOSA': 'VALLE DE ABURRA', 'SABANETA': 'VALLE DE ABURRA',
    'CAUCASIA': 'BAJO CAUCA', 'EL BAGRE': 'BAJO CAUCA', 'NECHI': 'BAJO CAUCA', 'TARAZA': 'BAJO CAUCA', 'CACERES': 'BAJO CAUCA', 'ZARAGOZA': 'BAJO CAUCA',
    'PUERTO BERRIO': 'MAGDALENA MEDIO', 'PUERTO NARE': 'MAGDALENA MEDIO', 'PUERTO TRIUNFO': 'MAGDALENA MEDIO', 'YONDO': 'MAGDALENA MEDIO', 'CARACOLI': 'MAGDALENA MEDIO', 'MACEO': 'MAGDALENA MEDIO',
    'SEGOVIA': 'NORDESTE', 'REMEDIOS': 'NORDESTE', 'AMALFI': 'NORDESTE', 'ANORI': 'NORDESTE', 'YALI': 'NORDESTE', 'VEGACHI': 'NORDESTE', 'YOLOMBO': 'NORDESTE', 'CISNEROS': 'NORDESTE', 'SAN ROQUE': 'NORDESTE', 'SANTO DOMINGO': 'NORDESTE',
    'SANTA ROSA DE OSOS': 'NORTE', 'SAN PEDRO DE LOS MILAGROS': 'NORTE', 'ENTRERRIOS': 'NORTE', 'BELMIRA': 'NORTE', 'DONMATIAS': 'NORTE',
    'SAN JOSE DE LA MONTANA': 'NORTE', 'YARUMAL': 'NORTE', 'ANGOSTURA': 'NORTE', 'BRICENO': 'NORTE', 'ITUANGO': 'NORTE', 'TOLEDO': 'NORTE',
    'SAN ANDRES DE CUERQUIA': 'NORTE', 'VALDIVIA': 'NORTE', 'CAMPAMENTO': 'NORTE', 'GUADALUPE': 'NORTE', 'CAROLINA DEL PRINCIPE': 'NORTE', 'GOMEZ PLATA': 'NORTE',
    'SANTA FE DE ANTIOQUIA': 'OCCIDENTE', 'SOPETRAN': 'OCCIDENTE', 'SAN JERONIMO': 'OCCIDENTE', 'OLAYA': 'OCCIDENTE', 'LIBORINA': 'OCCIDENTE',
    'SABANALARGA': 'OCCIDENTE', 'BURITICA': 'OCCIDENTE', 'GIRALDO': 'OCCIDENTE', 'CANASGORDAS': 'OCCIDENTE', 'URAMITA': 'OCCIDENTE', 'DABEIBA': 'OCCIDENTE',
    'PEQUE': 'OCCIDENTE', 'FRONTINO': 'OCCIDENTE', 'ABRIAQUI': 'OCCIDENTE', 'ANZA': 'OCCIDENTE', 'EBEJICO': 'OCCIDENTE', 'ARMENIA': 'OCCIDENTE', 'ARMENIA MANTEQUILLA': 'OCCIDENTE', 'HELICONIA': 'OCCIDENTE', 'CAICEDO': 'OCCIDENTE',
    'RIONEGRO': 'ORIENTE', 'MARINILLA': 'ORIENTE', 'EL CARMEN DE VIBORAL': 'ORIENTE', 'GUARNE': 'ORIENTE', 'LA CEJA': 'ORIENTE', 'EL RETIRO': 'ORIENTE',
    'EL SANTUARIO': 'ORIENTE', 'SAN VICENTE FERRER': 'ORIENTE', 'SAN VICENTE': 'ORIENTE', 'GUATAPE': 'ORIENTE', 'EL PENOL': 'ORIENTE', 'SAN RAFAEL': 'ORIENTE',
    'SAN CARLOS': 'ORIENTE', 'GRANADA': 'ORIENTE', 'COCORNA': 'ORIENTE', 'SAN LUIS': 'ORIENTE', 'SAN FRANCISCO': 'ORIENTE', 'SONSON': 'ORIENTE',
    'ABEJORRAL': 'ORIENTE', 'LA UNION': 'ORIENTE', 'ARGELIA': 'ORIENTE', 'NARINO': 'ORIENTE', 'CONCEPCION': 'ORIENTE', 'ALEJANDRIA': 'ORIENTE',
    'AMAGA': 'SUROESTE', 'ANGELOPOLIS': 'SUROESTE', 'TITIRIBI': 'SUROESTE', 'VENECIA': 'SUROESTE', 'FREDONIA': 'SUROESTE', 'SANTA BARBARA': 'SUROESTE',
    'MONTEBELLO': 'SUROESTE', 'TARSO': 'SUROESTE', 'JERICO': 'SUROESTE', 'PUEBLORRICO': 'SUROESTE', 'TAMESIS': 'SUROESTE', 'VALPARAISO': 'SUROESTE',
    'LA PINTADA': 'SUROESTE', 'JARDIN': 'SUROESTE', 'ANDES': 'SUROESTE', 'HISPANIA': 'SUROESTE', 'BETANIA': 'SUROESTE', 'CIUDAD BOLIVAR': 'SUROESTE',
    'SALGAR': 'SUROESTE', 'CONCORDIA': 'SUROESTE', 'BETULIA': 'SUROESTE', 'URRAO': 'SUROESTE', 'CARAMANTA': 'SUROESTE',
    'APARTADO': 'URABA', 'TURBO': 'URABA', 'CAREPA': 'URABA', 'CHIGORODO': 'URABA', 'NECOCLI': 'URABA', 'SAN PEDRO DE URABA': 'URABA',
    'SAN JUAN DE URABA': 'URABA', 'ARBOLETES': 'URABA', 'MUTATA': 'URABA', 'MURINDO': 'URABA', 'VIGIA DEL FUERTE': 'URABA'
};

function normalizeSubregionName(name) {
    const s = String(name || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Z ]/g, '').replace(/\s+/g, ' ').trim();
    if (s.includes('ABURRA')) return 'VALLE DE ABURRA';
    if (s.includes('BAJO CAUCA')) return 'BAJO CAUCA';
    if (s.includes('MAGDALENA')) return 'MAGDALENA MEDIO';
    if (s.includes('NORDESTE')) return 'NORDESTE';
    if (s.includes('NORTE')) return 'NORTE';
    if (s.includes('OCCIDENTE')) return 'OCCIDENTE';
    if (s.includes('ORIENTE')) return 'ORIENTE';
    if (s.includes('SUROESTE')) return 'SUROESTE';
    if (s.includes('URABA')) return 'URABA';
    return s || 'ORIENTE';
}

function getSubregionForMuni(muni) {
    const m = String(muni || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Z ]/g, '').replace(/\s+/g, ' ').trim();
    if (MPIO_SUBREGION_MAP[m]) return MPIO_SUBREGION_MAP[m];
    for (const [k, v] of Object.entries(MPIO_SUBREGION_MAP)) {
        if (m.includes(k) || k.includes(m)) return v;
    }
    return 'ORIENTE';
}

async function initSyntheticMap() {
    const container = document.getElementById('synthetic-map');
    if (!container || synMap) return;

    try {
        synMap = new maplibregl.Map({
            container: 'synthetic-map',
            center: [-75.55, 6.85],
            zoom: 7.2,
            pitch: 0,
            bearing: 0,
            maxZoom: 18,
            minZoom: 5,
            attributionControl: false
        });

        // Estilo minimalista claro Positron
        synMap.setStyle('https://tiles.openfreemap.org/styles/positron');

        synMap.addControl(new maplibregl.NavigationControl({ showCompass: false, showZoom: true }), 'bottom-right');

        synMap.on('load', async () => {
            synMapReady = true;
            const loadingBadge = document.getElementById('synthetic-map-loading-badge');
            if (loadingBadge) loadingBadge.classList.remove('hidden');

            // 1. CARGAR Y PREPARAR MUNICIPIOS Y 9 SUBREGIONES DE ANTIOQUIA
            try {
                let mpioGeoData = null;
                // Intento prioritario de cargar desde /data/Municipios.geojson
                try {
                    const respMpio = await fetch('./data/Municipios.geojson');
                    if (respMpio.ok) {
                        mpioGeoData = await respMpio.json();
                    }
                } catch (e) {
                    console.warn('Error cargando ./data/Municipios.geojson, usando fallback mpio.json:', e);
                }

                // Fallback a mpio.json
                if (!mpioGeoData || !mpioGeoData.features || mpioGeoData.features.length === 0) {
                    const resp = await fetch('./mpio.json');
                    if (resp.ok) {
                        mpioGeoData = await resp.json();
                        mpioGeoData.features = mpioGeoData.features.filter(f => {
                            const dpto = String(f.properties.DPTO || '').trim();
                            const nomDpt = String(f.properties.NOMBRE_DPT || f.properties.NOM_DEPART || '').trim().toUpperCase();
                            return dpto === '05' || dpto === '5' || nomDpt.includes('ANTIOQUIA');
                        });
                    }
                }

                if (mpioGeoData && mpioGeoData.features && mpioGeoData.features.length > 0) {
                    const subregGroups = {};

                    mpioGeoData.features.forEach((f, idx) => {
                        f.id = idx + 1;
                        const rawMpio = f.properties.MPIO_NOMBR || f.properties.NOMBRE_MPI || f.properties.MPIO_CNMBR || f.properties.NOM_MPIO || '';
                        f.properties.NOMBRE_MPI = String(rawMpio)
                            .replace(/\uFFFD/g, 'Ñ')
                            .replace(/\?/g, 'Ñ')
                            .replace(/¥/g, 'Ñ')
                            .replace(/\u00A5/g, 'Ñ');

                        // Determinar subregión oficial
                        const rawSub = f.properties.SUBREGION || f.properties.SUBREGIÓN || getSubregionForMuni(f.properties.NOMBRE_MPI);
                        const subNorm = normalizeSubregionName(rawSub);
                        f.properties.SUBREGION = subNorm;
                        f.properties._subregionColor = SUBREGION_COLORS[subNorm] || '#6366F1';

                        if (!subregGroups[subNorm]) subregGroups[subNorm] = [];
                        subregGroups[subNorm].push(f);
                    });

                    synMpioData = mpioGeoData;
                    applyIntervenedStatusToMpio(synMpioData);

                    // --- GENERAR CAPA VECTORIAL DE LAS 9 SUBREGIONES CON TURF.JS ---
                    const subregionFeatures = [];
                    const subregionLabels = [];
                    let subIdx = 1;

                    for (const [subName, mFeatures] of Object.entries(subregGroups)) {
                        if (!subName || mFeatures.length === 0) continue;
                        let dissolved = null;
                        if (typeof turf !== 'undefined') {
                            try {
                                dissolved = JSON.parse(JSON.stringify(mFeatures[0]));
                                for (let i = 1; i < mFeatures.length; i++) {
                                    try {
                                        dissolved = turf.union(dissolved, mFeatures[i]);
                                    } catch (eU) { }
                                }
                            } catch (eDiss) { }
                        }

                        if (!dissolved) {
                            dissolved = {
                                type: 'Feature',
                                geometry: {
                                    type: 'GeometryCollection',
                                    geometries: mFeatures.map(f => f.geometry)
                                }
                            };
                        }

                        const color = SUBREGION_COLORS[subName] || '#6366F1';
                        dissolved.id = subIdx++;
                        dissolved.properties = {
                            SUBREGION: subName,
                            _color: color,
                            _muniCount: mFeatures.length,
                            _municipios: mFeatures.map(f => f.properties.NOMBRE_MPI).sort().join(', ')
                        };
                        subregionFeatures.push(dissolved);

                        // Punto de etiqueta en el centro de masa de la subregión
                        if (typeof turf !== 'undefined' && dissolved.geometry) {
                            try {
                                let labelPt = turf.pointOnFeature(dissolved);
                                if (!labelPt || !labelPt.geometry) {
                                    labelPt = turf.centerOfMass(dissolved);
                                }
                                if (labelPt && labelPt.geometry) {
                                    labelPt.id = dissolved.id;
                                    labelPt.properties = {
                                        SUBREGION: subName,
                                        _color: color,
                                        _muniCount: mFeatures.length
                                    };
                                    subregionLabels.push(labelPt);
                                }
                            } catch (ePt) { }
                        }
                    }

                    synSubregionesData = {
                        type: 'FeatureCollection',
                        features: subregionFeatures
                    };
                    synSubregionesLabelsData = {
                        type: 'FeatureCollection',
                        features: subregionLabels
                    };

                    // --- DISOLVER MUNICIPIOS EN CONTORNO DEPARTAMENTAL (TURF.JS) ---
                    let antioquiaFeature = null;
                    if (typeof turf !== 'undefined' && subregionFeatures.length > 0) {
                        try {
                            let deptUnioned = JSON.parse(JSON.stringify(subregionFeatures[0]));
                            for (let i = 1; i < subregionFeatures.length; i++) {
                                try {
                                    deptUnioned = turf.union(deptUnioned, subregionFeatures[i]);
                                } catch (e) { }
                            }
                            if (deptUnioned) {
                                deptUnioned.properties = { nombre: 'ANTIOQUIA' };
                                antioquiaFeature = deptUnioned;
                            }
                        } catch (turfError) {
                            console.warn("Error al disolver departamento en mapa sintético:", turfError);
                        }
                    }

                    // --- MÁSCARA EXTERIOR INVERTIDA: Opacar todo fuera de Antioquia ---
                    if (antioquiaFeature) {
                        try {
                            const worldPoly = [[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]];
                            let antioquiaRings = [];
                            if (antioquiaFeature.geometry.type === 'Polygon') {
                                antioquiaRings = [antioquiaFeature.geometry.coordinates[0]];
                            } else if (antioquiaFeature.geometry.type === 'MultiPolygon') {
                                antioquiaRings = antioquiaFeature.geometry.coordinates.map(poly => poly[0]);
                            }
                            if (antioquiaRings.length > 0) {
                                const maskGeoJSON = {
                                    type: 'FeatureCollection',
                                    features: [{
                                        type: 'Feature',
                                        properties: {},
                                        geometry: {
                                            type: 'Polygon',
                                            coordinates: [worldPoly, ...antioquiaRings]
                                        }
                                    }]
                                };
                                synMap.addSource('syn-outside-antioquia-src', { type: 'geojson', data: maskGeoJSON });

                                synMap.addLayer({
                                    id: 'syn-outside-antioquia-mask',
                                    type: 'fill',
                                    source: 'syn-outside-antioquia-src',
                                    layout: { visibility: 'visible' },
                                    paint: {
                                        'fill-color': '#0F172A',
                                        'fill-opacity': 0.58
                                    }
                                });

                                // Contorno perimetral del departamento de Antioquia
                                synMap.addSource('syn-antioquia-dpto-src', { type: 'geojson', data: antioquiaFeature });
                                synMap.addLayer({
                                    id: 'syn-antioquia-dpto-line',
                                    type: 'line',
                                    source: 'syn-antioquia-dpto-src',
                                    layout: { visibility: 'visible' },
                                    paint: {
                                        'line-color': '#0B5640',
                                        'line-width': 2.4,
                                        'line-opacity': 0.95
                                    }
                                });
                            }
                        } catch (maskErr) {
                            console.warn("Error creando máscara exterior sintética:", maskErr);
                        }
                    }

                    // --- FUENTES Y CAPAS DE LAS 9 SUBREGIONES ---
                    synMap.addSource('syn-subregiones-src', { type: 'geojson', data: synSubregionesData });
                    synMap.addSource('syn-subregiones-labels-src', { type: 'geojson', data: synSubregionesLabelsData });

                    // 1.1 Relleno invisible para interacción/clic sin fondo visible
                    synMap.addLayer({
                        id: 'syn-subregiones-fill',
                        type: 'fill',
                        source: 'syn-subregiones-src',
                        layout: { visibility: synLayersState.subregiones ? 'visible' : 'none' },
                        paint: {
                            'fill-color': ['get', '_color'],
                            'fill-opacity': 0.0001
                        }
                    });

                    // 1.2 Límite subregional fino, elegante y discontinuo (un solo tono pizarra suave)
                    synMap.addLayer({
                        id: 'syn-subregiones-line',
                        type: 'line',
                        source: 'syn-subregiones-src',
                        layout: { visibility: synLayersState.subregiones ? 'visible' : 'none', 'line-cap': 'round', 'line-join': 'round' },
                        paint: {
                            'line-color': '#1E293B',
                            'line-width': [
                                'interpolate', ['linear'], ['zoom'],
                                6, 1.2,
                                8, 1.6,
                                11, 2.2,
                                14, 2.8
                            ],
                            'line-dasharray': [4, 2],
                            'line-opacity': 0.85
                        }
                    });

                    // --- FUENTES Y CAPAS DE MUNICIPIOS ---
                    synMap.addSource('syn-municipios-src', { type: 'geojson', data: synMpioData });

                    // 1.3 Relleno de municipios según escala cromática de longitud ejecutada
                    synMap.addLayer({
                        id: 'syn-municipios-fill',
                        type: 'fill',
                        source: 'syn-municipios-src',
                        layout: { visibility: synLayersState.municipios ? 'visible' : 'none' },
                        paint: {
                            'fill-color': [
                                'coalesce',
                                ['get', '_colorFill'],
                                '#F8FAFC'
                            ],
                            'fill-opacity': [
                                'case',
                                ['boolean', ['get', '_intervenido'], false],
                                0.88,
                                0.45
                            ]
                        }
                    });

                    // Capa de Hover interactivo en municipios
                    synMap.addLayer({
                        id: 'syn-municipios-hover',
                        type: 'fill',
                        source: 'syn-municipios-src',
                        layout: { visibility: synLayersState.municipios ? 'visible' : 'none' },
                        paint: {
                            'fill-color': '#00FF88',
                            'fill-opacity': [
                                'case',
                                ['boolean', ['feature-state', 'hover'], false],
                                0.45,
                                0
                            ]
                        }
                    });

                    // Capa de Contorno de municipios
                    synMap.addLayer({
                        id: 'syn-municipios-line',
                        type: 'line',
                        source: 'syn-municipios-src',
                        layout: { visibility: synLayersState.municipios ? 'visible' : 'none' },
                        paint: {
                            'line-color': [
                                'case',
                                ['boolean', ['get', '_intervenido'], false],
                                '#254434',
                                '#CBD5E1'
                            ],
                            'line-width': [
                                'case',
                                ['boolean', ['get', '_intervenido'], false],
                                1.1,
                                0.5
                            ],
                            'line-opacity': 0.85
                        }
                    });

                    // Capa de Etiquetas de Texto de Municipios
                    synMap.addLayer({
                        id: 'syn-municipios-labels',
                        type: 'symbol',
                        source: 'syn-municipios-src',
                        minzoom: 7.2,
                        layout: {
                            visibility: synLayersState.municipios ? 'visible' : 'none',
                            'text-field': ['get', 'NOMBRE_MPI'],
                            'text-size': [
                                'interpolate', ['linear'], ['zoom'],
                                7, 8.0,
                                9, 10.0,
                                12, 12.0
                            ],
                            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                            'text-anchor': 'center',
                            'text-allow-overlap': false
                        },
                        paint: {
                            'text-color': [
                                'case',
                                ['boolean', ['get', '_intervenido'], false],
                                '#FFFFFF',
                                '#334155'
                            ],
                            'text-halo-color': [
                                'case',
                                ['boolean', ['get', '_intervenido'], false],
                                '#254434',
                                '#FFFFFF'
                            ],
                            'text-halo-width': 1.6
                        }
                    });

                    // 1.4 Capa de Etiquetas de las 9 Subregiones
                    synMap.addLayer({
                        id: 'syn-subregiones-labels',
                        type: 'symbol',
                        source: 'syn-subregiones-labels-src',
                        layout: {
                            visibility: synLayersState.subregiones ? 'visible' : 'none',
                            'text-field': ['get', 'SUBREGION'],
                            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                            'text-size': [
                                'interpolate', ['linear'], ['zoom'],
                                6, 9.5,
                                8, 12.0,
                                10, 14.5,
                                13, 17.0
                            ],
                            'text-transform': 'uppercase',
                            'text-letter-spacing': 0.08,
                            'text-allow-overlap': true,
                            'text-anchor': 'center'
                        },
                        paint: {
                            'text-color': '#0F172A',
                            'text-halo-color': '#FFFFFF',
                            'text-halo-width': 2.5
                        }
                    });
                }
            } catch (err) {
                console.warn('Error cargando municipios y subregiones en mapa sintético:', err);
            }

            // 2. CARGAR RED VIAL OFICIAL (PRIMARIA, SECUNDARIA, TERCIARIA)
            async function loadSynVial(id, url, color, width) {
                try {
                    const resp = await fetch(url);
                    if (resp.ok) {
                        const data = await resp.json();
                        synVialData[id] = data;
                        synMap.addSource(`syn-vial-${id}-src`, { type: 'geojson', data });

                        synMap.addLayer({
                            id: `syn-vial-${id}`,
                            type: 'line',
                            source: `syn-vial-${id}-src`,
                            layout: { visibility: synLayersState[id] ? 'visible' : 'none', 'line-cap': 'round', 'line-join': 'round' },
                            paint: {
                                'line-color': color,
                                'line-width': [
                                    'interpolate', ['linear'], ['zoom'],
                                    7, width * 0.6,
                                    10, width,
                                    13, width * 1.5
                                ],
                                'line-opacity': 0.8
                            }
                        });
                    }
                } catch (e) {
                    console.warn(`Error cargando red vial ${id} en mapa sintético:`, e);
                }
            }

            await loadSynVial('terciaria', './data/Terciaria.geojson', '#d69e2e', 1.2);
            await loadSynVial('secundaria', './data/Secundaria.geojson', '#38a169', 1.8);
            await loadSynVial('primaria', './data/Primaria.geojson', '#e53e3e', 2.2);

            // 3. FUENTE Y CAPAS DE TRAMOS INTERVENIDOS KML (ALTO CONTRASTE VERDE METÁLICO NEÓN + BEACON POINTS)
            synMap.addSource('syn-tramos-src', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });

            // 3.1 Contorno exterior oscuro sólido de alto contraste
            synMap.addLayer({
                id: 'syn-tramos-casing',
                type: 'line',
                source: 'syn-tramos-src',
                filter: ['!=', '$type', 'Point'],
                layout: { visibility: synLayersState.tramos ? 'visible' : 'none', 'line-cap': 'round', 'line-join': 'round' },
                paint: {
                    'line-color': '#032B18',
                    'line-width': [
                        'interpolate', ['linear'], ['zoom'],
                        6, 5.5,
                        9, 7.5,
                        12, 10.5,
                        15, 14.0
                    ],
                    'line-opacity': 1
                }
            });

            // 3.2 Línea principal verde metálico neón vibrante
            synMap.addLayer({
                id: 'syn-tramos-line',
                type: 'line',
                source: 'syn-tramos-src',
                filter: ['!=', '$type', 'Point'],
                layout: { visibility: synLayersState.tramos ? 'visible' : 'none', 'line-cap': 'round', 'line-join': 'round' },
                paint: {
                    'line-color': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        '#FFFFFF',
                        '#00FF88'
                    ],
                    'line-width': [
                        'interpolate', ['linear'], ['zoom'],
                        6, 3.0,
                        9, 5.0,
                        12, 7.0,
                        15, 10.0
                    ],
                    'line-opacity': 1
                }
            });

            // 3.3 Núcleo central blanco reflectivo
            synMap.addLayer({
                id: 'syn-tramos-core',
                type: 'line',
                source: 'syn-tramos-src',
                filter: ['!=', '$type', 'Point'],
                layout: { visibility: synLayersState.tramos ? 'visible' : 'none', 'line-cap': 'round', 'line-join': 'round' },
                paint: {
                    'line-color': '#FFFFFF',
                    'line-width': [
                        'interpolate', ['linear'], ['zoom'],
                        6, 1.5,
                        9, 2.2,
                        12, 3.2,
                        15, 4.5
                    ],
                    'line-opacity': 0.95
                }
            });

            // 3.4 Puntos Beacon KML: Borde exterior oscuro
            synMap.addLayer({
                id: 'syn-tramos-points-casing',
                type: 'circle',
                source: 'syn-tramos-src',
                filter: ['==', '$type', 'Point'],
                layout: { visibility: synLayersState.tramos ? 'visible' : 'none' },
                paint: {
                    'circle-color': '#032B18',
                    'circle-radius': [
                        'interpolate', ['linear'], ['zoom'],
                        6, 3.5,
                        9, 5.5,
                        12, 7.5,
                        15, 10.0
                    ],
                    'circle-opacity': 1
                }
            });

            // 3.5 Puntos Beacon KML: Cuerpo verde metálico neón
            synMap.addLayer({
                id: 'syn-tramos-points',
                type: 'circle',
                source: 'syn-tramos-src',
                filter: ['==', '$type', 'Point'],
                layout: { visibility: synLayersState.tramos ? 'visible' : 'none' },
                paint: {
                    'circle-color': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        '#FFFFFF',
                        '#00FF88'
                    ],
                    'circle-radius': [
                        'interpolate', ['linear'], ['zoom'],
                        6, 2.5,
                        9, 4.0,
                        12, 5.5,
                        15, 7.5
                    ],
                    'circle-opacity': 1
                }
            });

            // 3.6 Puntos Beacon KML: Núcleo blanco
            synMap.addLayer({
                id: 'syn-tramos-points-core',
                type: 'circle',
                source: 'syn-tramos-src',
                filter: ['==', '$type', 'Point'],
                layout: { visibility: synLayersState.tramos ? 'visible' : 'none' },
                paint: {
                    'circle-color': '#FFFFFF',
                    'circle-radius': [
                        'interpolate', ['linear'], ['zoom'],
                        6, 0.9,
                        9, 1.5,
                        12, 2.2,
                        15, 3.0
                    ],
                    'circle-opacity': 1
                }
            });

            // 3.7 Capa invisible de Hitbox amplia para selección
            synMap.addLayer({
                id: 'syn-tramos-hitbox',
                type: 'line',
                source: 'syn-tramos-src',
                layout: { visibility: synLayersState.tramos ? 'visible' : 'none', 'line-cap': 'round', 'line-join': 'round' },
                paint: {
                    'line-color': '#000000',
                    'line-width': 32,
                    'line-opacity': 0.0001
                }
            });

            // 4. CARGAR TRAMOS KML DE CONVENIOS (PARALELO)
            await renderSyntheticKmlFeatures();

            if (loadingBadge) loadingBadge.classList.add('hidden');

            // 5. EVENTOS DE HOVER Y CLICK UNIFICADOS CON PRIORIDAD
            let synHoveredMuniId = null;
            let synHoveredSubregId = null;
            let synHoveredTramoId = null;

            synMap.on('mousemove', (e) => {
                // 1. Prioridad tramo KML
                if (synLayersState.tramos) {
                    const buffer = 14;
                    const bbox = [
                        [e.point.x - buffer, e.point.y - buffer],
                        [e.point.x + buffer, e.point.y + buffer]
                    ];
                    const tramoHits = synMap.queryRenderedFeatures(bbox, {
                        layers: ['syn-tramos-hitbox', 'syn-tramos-line', 'syn-tramos-points', 'syn-tramos-casing'].filter(id => synMap.getLayer(id))
                    });

                    if (tramoHits && tramoHits.length > 0) {
                        if (synHoveredMuniId !== null) {
                            synMap.setFeatureState({ source: 'syn-municipios-src', id: synHoveredMuniId }, { hover: false });
                            synHoveredMuniId = null;
                        }
                        if (synHoveredSubregId !== null) {
                            synMap.setFeatureState({ source: 'syn-subregiones-src', id: synHoveredSubregId }, { hover: false });
                            synHoveredSubregId = null;
                        }
                        const newTramoId = tramoHits[0].id;
                        if (synHoveredTramoId !== newTramoId) {
                            if (synHoveredTramoId !== null) {
                                synMap.setFeatureState({ source: 'syn-tramos-src', id: synHoveredTramoId }, { hover: false });
                            }
                            synHoveredTramoId = newTramoId;
                            if (synHoveredTramoId !== undefined) {
                                synMap.setFeatureState({ source: 'syn-tramos-src', id: synHoveredTramoId }, { hover: true });
                            }
                        }
                        synMap.getCanvas().style.cursor = 'pointer';
                        return;
                    }
                }

                if (synHoveredTramoId !== null) {
                    synMap.setFeatureState({ source: 'syn-tramos-src', id: synHoveredTramoId }, { hover: false });
                    synHoveredTramoId = null;
                }

                // 2. Si el modo es subregional, hover prioritario en subregión
                if (synActiveMode === 'subregional' && synLayersState.subregiones) {
                    const subHits = synMap.queryRenderedFeatures(e.point, {
                        layers: ['syn-subregiones-fill'].filter(id => synMap.getLayer(id))
                    });
                    if (subHits && subHits.length > 0) {
                        const newSubId = subHits[0].id;
                        if (synHoveredSubregId !== newSubId) {
                            if (synHoveredSubregId !== null) {
                                synMap.setFeatureState({ source: 'syn-subregiones-src', id: synHoveredSubregId }, { hover: false });
                            }
                            synHoveredSubregId = newSubId;
                            if (synHoveredSubregId !== undefined) {
                                synMap.setFeatureState({ source: 'syn-subregiones-src', id: synHoveredSubregId }, { hover: true });
                            }
                        }
                        synMap.getCanvas().style.cursor = 'pointer';
                        return;
                    }
                }

                // 3. Hover en municipio
                if (synLayersState.municipios) {
                    const muniHits = synMap.queryRenderedFeatures(e.point, {
                        layers: ['syn-municipios-fill'].filter(id => synMap.getLayer(id))
                    });

                    if (muniHits && muniHits.length > 0) {
                        const newMuniId = muniHits[0].id;
                        if (synHoveredMuniId !== newMuniId) {
                            if (synHoveredMuniId !== null) {
                                synMap.setFeatureState({ source: 'syn-municipios-src', id: synHoveredMuniId }, { hover: false });
                            }
                            synHoveredMuniId = newMuniId;
                            if (synHoveredMuniId !== undefined) {
                                synMap.setFeatureState({ source: 'syn-municipios-src', id: synHoveredMuniId }, { hover: true });
                            }
                        }
                        synMap.getCanvas().style.cursor = 'pointer';
                        return;
                    }
                }

                if (synHoveredMuniId !== null) {
                    synMap.setFeatureState({ source: 'syn-municipios-src', id: synHoveredMuniId }, { hover: false });
                    synHoveredMuniId = null;
                }
                if (synHoveredSubregId !== null) {
                    synMap.setFeatureState({ source: 'syn-subregiones-src', id: synHoveredSubregId }, { hover: false });
                    synHoveredSubregId = null;
                }
                synMap.getCanvas().style.cursor = '';
            });

            synMap.on('mouseleave', () => {
                if (synHoveredTramoId !== null) {
                    synMap.setFeatureState({ source: 'syn-tramos-src', id: synHoveredTramoId }, { hover: false });
                    synHoveredTramoId = null;
                }
                if (synHoveredMuniId !== null) {
                    synMap.setFeatureState({ source: 'syn-municipios-src', id: synHoveredMuniId }, { hover: false });
                    synHoveredMuniId = null;
                }
                if (synHoveredSubregId !== null) {
                    synMap.setFeatureState({ source: 'syn-subregiones-src', id: synHoveredSubregId }, { hover: false });
                    synHoveredSubregId = null;
                }
                synMap.getCanvas().style.cursor = '';
            });

            // Dispatcher de clics: Tramo KML > Subregión (si modo subregional) > Municipio
            synMap.on('click', (e) => {
                // 1. Tramo KML
                if (synLayersState.tramos) {
                    const buffer = 18;
                    const bbox = [
                        [e.point.x - buffer, e.point.y - buffer],
                        [e.point.x + buffer, e.point.y + buffer]
                    ];
                    const tramoHits = synMap.queryRenderedFeatures(bbox, {
                        layers: ['syn-tramos-hitbox', 'syn-tramos-line', 'syn-tramos-points', 'syn-tramos-casing'].filter(id => synMap.getLayer(id))
                    });

                    if (tramoHits && tramoHits.length > 0) {
                        showSyntheticTramoPopup(tramoHits[0], e.lngLat);
                        return;
                    }
                }

                // 2. Si el modo activo es subregional, abrir ficha de subregión
                if (synActiveMode === 'subregional' && synLayersState.subregiones) {
                    const subHits = synMap.queryRenderedFeatures(e.point, {
                        layers: ['syn-subregiones-fill'].filter(id => synMap.getLayer(id))
                    });
                    if (subHits && subHits.length > 0) {
                        showSyntheticSubregionPopup(subHits[0], e.lngLat);
                        return;
                    }
                }

                // 3. Municipio
                if (synLayersState.municipios) {
                    const muniHits = synMap.queryRenderedFeatures(e.point, {
                        layers: ['syn-municipios-fill'].filter(id => synMap.getLayer(id))
                    });

                    if (muniHits && muniHits.length > 0) {
                        showSyntheticMuniPopup(muniHits[0], e.lngLat);
                        return;
                    }
                }
            });

            // Asegurar que las capas de tramos queden arriba
            ensureSynTramosOnTop();

            // Ajustar encuadre general a Antioquia
            synMap.fitBounds([
                [-77.15, 5.4],
                [-73.85, 8.88]
            ], { padding: { top: 20, bottom: 20, left: 20, right: 20 }, animate: false });
        });

        // Controles de eventos de la interfaz
        setupSyntheticControls();

    } catch (e) {
        console.error('Error inicializando mapa sintético:', e);
    }
}

function showSyntheticSubregionPopup(feature, lngLat) {
    if (!feature || !feature.properties) return;
    const subName = feature.properties.SUBREGION || 'Subregión';
    const color = feature.properties._color || '#4F46E5';
    const muniCount = feature.properties._muniCount || 0;

    // Calcular estadísticas en tiempo real de la subregión según datos filtrados
    const activeData = filteredData && filteredData.length > 0 ? filteredData : rawData;
    let convsInSub = 0;
    let invInSub = 0;
    let munisInSubSet = new Set();

    activeData.forEach(r => {
        const rSub = normalizeSubregionName(r['SUBREGION'] || r['SUBREGIÓN'] || getSubregionForMuni(r['MUNICIPIO']));
        if (rSub === subName) {
            convsInSub++;
            invInSub += (r['APORTE DEPARTAMENTO'] || 0) + (r['ADICION DEPARTAMENTO'] || 0);
            const m = String(r['MUNICIPIO'] || '').trim().toUpperCase();
            if (m) munisInSubSet.add(m);
        }
    });

    const html = `
        <div style="font-family:'Plus Jakarta Sans',sans-serif;padding:3px;min-width:240px;">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.15);">
                <div style="display:flex;align-items:center;gap:6px;">
                    <span style="width:10px;height:10px;border-radius:3px;background:${color};display:inline-block;border:1px solid rgba(255,255,255,0.4);"></span>
                    <span style="font-size:9.5px;font-weight:800;color:#FFFFFF;text-transform:uppercase;letter-spacing:0.06em;">SUBREGIÓN</span>
                </div>
                <span style="font-size:9.5px;font-weight:800;color:${color};background:rgba(255,255,255,0.12);padding:2px 8px;border-radius:99px;">
                    ${muniCount} Municipios
                </span>
            </div>
            <h3 style="font-size:16px;font-weight:900;color:#FFFFFF;margin:0 0 6px;letter-spacing:-0.01em;">${subName}</h3>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px;background:rgba(255,255,255,0.06);padding:6px 8px;border-radius:8px;">
                <div>
                    <span style="font-size:9px;color:#94A3B8;display:block;">Convenios</span>
                    <strong style="font-size:12px;color:#00FF88;">${convsInSub} Proyectos</strong>
                </div>
                <div>
                    <span style="font-size:9px;color:#94A3B8;display:block;">Mpios Impactados</span>
                    <strong style="font-size:12px;color:#38BDF8;">${munisInSubSet.size} de ${muniCount}</strong>
                </div>
            </div>
            <div style="font-size:10.5px;color:#CBD5E1;margin-bottom:8px;">
                <p style="margin:0 0 4px;"><strong style="color:#94A3B8;">Inversión DIAT:</strong> <span style="color:#FBBF24;font-weight:800;">${formatCurrency(invInSub)}</span></p>
                <p style="margin:0;font-size:9.5px;color:#94A3B8;line-height:1.3;"><strong style="color:#CBD5E1;">Municipios:</strong> ${feature.properties._municipios || ''}</p>
            </div>
        </div>
    `;

    if (synCurrentPopup) synCurrentPopup.remove();
    synCurrentPopup = new maplibregl.Popup({
        closeButton: true,
        maxWidth: '300px',
        className: 'synthetic-tooltip',
        anchor: 'bottom',
        offset: [0, -10]
    })
        .setLngLat(lngLat || synMap.getCenter())
        .setHTML(html)
        .addTo(synMap);
}

function showSyntheticTramoPopup(feature, lngLat) {
    if (!feature || !feature.properties) return;
    const convNum = String(feature.properties.CONVENIO || '').trim();
    const row = rawData.find(r => String(r['CONVENIO']).trim() === convNum);

    if (row) {
        if (lngLat) {
            synMap.easeTo({ center: lngLat, offset: [0, 90], duration: 350 });
        }

        const sysState = typeof getSystemState === 'function' ? getSystemState(row['ESTADO CONVENIO']) : { hex: '#0B5640', label: row['ESTADO CONVENIO'] || 'Activo', badgeClass: 'bg-emerald-50 text-emerald-800' };
        const fisPct = (row['FISICO_NORM'] || 0).toFixed(1);
        const lonM = getRowLongitudContratada(row);
        const lonKm = (lonM / 1000).toFixed(2);
        const valTotal = formatCurrency(row['VALOR TOTAL'] || row['APORTE DEPARTAMENTO'] || 0);

        const html = `
            <div style="font-family:'Plus Jakarta Sans',sans-serif;padding:2px;min-width:230px;">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.12);">
                    <span style="font-size:9px;font-weight:800;color:#00B0FF;background:rgba(0,176,255,0.18);padding:2px 6px;border-radius:4px;text-transform:uppercase;letter-spacing:0.06em;">
                        <i class="fa-solid fa-route mr-1"></i>Tramo KML
                    </span>
                    <span style="font-size:9px;font-weight:700;color:#FFFFFF;background:${sysState.hex};padding:2px 8px;border-radius:99px;">
                        ${sysState.label}
                    </span>
                </div>
                <h4 style="font-size:14px;font-weight:900;color:#FFFFFF;margin:0 0 6px;letter-spacing:-0.01em;">Convenio ${convNum}</h4>
                <div style="display:grid;grid-template-columns:1fr;gap:4px;font-size:10.5px;color:#CBD5E1;margin-bottom:8px;">
                    <p style="margin:0;"><strong style="color:#94A3B8;">Municipio:</strong> <span style="color:#FFFFFF;font-weight:700;">${row['MUNICIPIO'] || 'N/A'}</span></p>
                    <p style="margin:0;"><strong style="color:#94A3B8;">Subregión:</strong> <span>${row['SUBREGION'] || row['SUBREGIÓN'] || 'N/A'}</span></p>
                    <p style="margin:0;"><strong style="color:#94A3B8;">Supervisor:</strong> <span>${row['SUPERVISOR'] || 'N/A'}</span></p>
                    <div style="display:flex;justify-content:space-between;background:rgba(255,255,255,0.06);padding:5px 8px;border-radius:6px;margin-top:4px;">
                        <span><strong style="color:#94A3B8;">Avance:</strong> <span style="color:#00B0FF;font-weight:800;">${fisPct}%</span></span>
                        <span><strong style="color:#94A3B8;">Long:</strong> <span style="color:#FFFFFF;font-weight:700;">${lonKm} km</span></span>
                    </div>
                    <p style="margin:4px 0 0;"><strong style="color:#94A3B8;">Inversión:</strong> <span style="color:#FBBF24;font-weight:800;">${valTotal}</span></p>
                </div>
                <button type="button" class="btn-popup-ficha" onclick="openModalFromMap('${convNum}')">
                    <i class="fa-solid fa-folder-open mr-1.5"></i> FICHA TÉCNICA
                </button>
            </div>
        `;

        if (synCurrentPopup) synCurrentPopup.remove();
        synCurrentPopup = new maplibregl.Popup({
            closeButton: true,
            maxWidth: '300px',
            className: 'synthetic-tooltip',
            anchor: 'bottom',
            offset: [0, -10]
        })
            .setLngLat(lngLat || synMap.getCenter())
            .setHTML(html)
            .addTo(synMap);
    }
}

function getMpioColorByLongitud(longKm, hasConvenio) {
    if (!hasConvenio) return '#F8FAFC'; // Sin convenios (0 km)
    const km = Number(longKm) || 0;
    if (km <= 0) return '#D4EFCD';       // Convenio activo pero 0 km ejecutados aún
    if (km <= 2.0) return '#9FD490';     // 0.1 – 2.0 km (verde claro / opaco)
    if (km <= 5.0) return '#5FC466';     // 2.0 – 5.0 km (verde medio)
    if (km <= 10.0) return '#398056';    // 5.0 – 10.0 km (verde fuerte)
    return '#254434';                   // > 10.0 km (verde muy fuerte / oscuro)
}

function showSyntheticMuniPopup(feature, lngLat) {
    if (!feature || !feature.properties) return;
    if (lngLat) {
        synMap.easeTo({ center: lngLat, offset: [0, 50], duration: 350 });
    }
    const props = feature.properties;
    const muniName = props.NOMBRE_MPI || props.MPIO_CNMBR || props.NOM_MPIO || '';
    const subName = props.SUBREGION || getSubregionForMuni(muniName);
    const subColor = SUBREGION_COLORS[subName] || '#6366F1';
    const count = props._convCount || 0;
    const isInterv = props._intervenido;
    const longEjeKm = (props._longEjeKm !== undefined ? Number(props._longEjeKm) : 0).toFixed(2);
    const longConKm = (props._longConKm !== undefined ? Number(props._longConKm) : 0).toFixed(2);
    const colorFill = props._colorFill || '#0B5640';

    const html = `
        <div style="font-family:'Plus Jakarta Sans',sans-serif;padding:4px 6px;min-width:215px;">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:6px;padding-bottom:5px;border-bottom:1px solid rgba(255,255,255,0.12);">
                <p style="font-size:13px;font-weight:900;color:#FFFFFF;margin:0;">${muniName}</p>
                <span style="font-size:9px;font-weight:800;color:${subColor};background:rgba(255,255,255,0.12);padding:2px 6px;border-radius:4px;text-transform:uppercase;">
                    ${subName}
                </span>
            </div>
            ${isInterv ? `
                <div style="display:flex;flex-direction:column;gap:5px;font-size:11px;color:#CBD5E1;">
                    <div style="display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.06);padding:5px 8px;border-radius:6px;">
                        <span style="color:#94A3B8;font-size:10px;"><i class="fa-solid fa-ruler-combined text-emerald-400 mr-1"></i>Long. Ejecutada:</span>
                        <span style="color:#FFFFFF;font-weight:800;display:flex;align-items:center;gap:4px;">
                            <span style="width:8px;height:8px;border-radius:2px;background:${colorFill};display:inline-block;border:1px solid rgba(255,255,255,0.4);"></span>
                            ${longEjeKm} km
                        </span>
                    </div>
                    <div style="display:flex;align-items:center;justify-content:space-between;font-size:10px;padding:0 2px;">
                        <span style="color:#94A3B8;">Long. Contratada:</span>
                        <span style="color:#E2E8F0;font-weight:600;">${longConKm} km</span>
                    </div>
                    <div style="display:flex;align-items:center;justify-content:space-between;font-size:10px;padding:0 2px;">
                        <span style="color:#94A3B8;">Convenios Activos:</span>
                        <span style="color:#00FF88;font-weight:700;">${count} convenio(s)</span>
                    </div>
                </div>
            ` : `
                <p style="font-size:10.5px;font-weight:600;color:#94A3B8;margin:0;">
                    <i class="fa-solid fa-circle-info mr-1"></i> Sin convenios en la selección
                </p>
            `}
        </div>
    `;

    if (synCurrentPopup) synCurrentPopup.remove();
    synCurrentPopup = new maplibregl.Popup({
        closeButton: true,
        maxWidth: '280px',
        className: 'synthetic-tooltip',
        anchor: 'bottom',
        offset: [0, -10]
    })
        .setLngLat(lngLat || synMap.getCenter())
        .setHTML(html)
        .addTo(synMap);
}

function ensureSynTramosOnTop() {
    if (!synMap || !synMapReady) return;
    const topLayers = [
        'syn-subregiones-line',
        'syn-subregiones-labels',
        'syn-antioquia-dpto-line',
        'syn-tramos-casing',
        'syn-tramos-line',
        'syn-tramos-core',
        'syn-tramos-points-casing',
        'syn-tramos-points',
        'syn-tramos-points-core',
        'syn-tramos-hitbox'
    ];
    topLayers.forEach(lid => {
        if (synMap.getLayer(lid)) {
            synMap.moveLayer(lid);
        }
    });
}

function applyIntervenedStatusToMpio(mpioData) {
    if (!mpioData || !mpioData.features) return;
    const norm = (s) => String(s || '')
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Z ]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    const dataToUse = (filteredData && filteredData.length > 0 ? filteredData : rawData) || [];
    const muniCounts = {};
    const muniLongEje = {};
    const muniLongCon = {};

    dataToUse.forEach(r => {
        const m = norm(r['MUNICIPIO']);
        if (m) {
            muniCounts[m] = (muniCounts[m] || 0) + 1;
            const eje = getRowLongitudEjecutada(r) || 0;
            const con = getRowLongitudContratada(r) || 0;
            muniLongEje[m] = (muniLongEje[m] || 0) + eje;
            muniLongCon[m] = (muniLongCon[m] || 0) + con;
        }
    });

    mpioData.features.forEach(f => {
        const rawName = f.properties.NOMBRE_MPI || f.properties.MPIO_CNMBR || f.properties.NOM_MPIO || '';
        const mNorm = norm(rawName);
        const count = muniCounts[mNorm] || 0;
        const longEjeM = muniLongEje[mNorm] || 0;
        const longEjeKm = (longEjeM / 1000);
        const longConM = muniLongCon[mNorm] || 0;
        const longConKm = (longConM / 1000);

        const hasConvenio = count > 0;
        f.properties._intervenido = hasConvenio;
        f.properties._convCount = count;
        f.properties._longEjeM = longEjeM;
        f.properties._longEjeKm = parseFloat(longEjeKm.toFixed(2));
        f.properties._longConM = longConM;
        f.properties._longConKm = parseFloat(longConKm.toFixed(2));
        f.properties._colorFill = getMpioColorByLongitud(longEjeKm, hasConvenio);
    });
}

const synAllKnownKmls = [
    '24AS111B2059', '25AS111B2773', '25AS111B2774', '25AS111B2777', '25AS111B2779',
    '25AS111B2780', '25AS111B2781', '25AS111B2783', '25AS111B2784', '25AS111B2785',
    '25AS111B2786', '25AS111B2787', '25AS111B2788', '25AS111B2789', '25AS111B2790',
    '25AS111B2791', '25AS111B2792', '25AS111B2793', '25AS111B2794', '25AS111B2795',
    '25AS111B2796', '25AS111B2797', '25AS111B2798', '25AS111B2799', '25AS111B2800',
    '25AS111B2801', '25AS111B2802', '25AS111B2803', '25AS111B2809', '25AS111B2813',
    '25AS111B2814', '25AS111B2815', '25AS111B2816', '25AS111B2817', '25AS111B2818',
    '25AS111B2819', '4600018194', '4600018676'
];
const synKmlCache = {};

function parseKMLStringToGeoJSON(kmlText, convNum) {
    try {
        const dom = new DOMParser().parseFromString(kmlText, 'text/xml');
        const features = [];

        function parseCoords(coordStr) {
            if (!coordStr) return [];
            return coordStr.trim().split(/\s+/).map(pair => {
                const parts = pair.split(',').map(Number);
                return [parts[0], parts[1]]; // [lng, lat]
            }).filter(pt => !isNaN(pt[0]) && !isNaN(pt[1]) && isFinite(pt[0]) && isFinite(pt[1]));
        }

        const placemarks = dom.getElementsByTagName('Placemark');
        for (let i = 0; i < placemarks.length; i++) {
            const p = placemarks[i];
            const nameEl = p.getElementsByTagName('name')[0];
            const name = nameEl ? nameEl.textContent.trim() : `Tramo ${convNum}`;

            // LineString directo
            const lineStrings = p.getElementsByTagName('LineString');
            for (let j = 0; j < lineStrings.length; j++) {
                const cEl = lineStrings[j].getElementsByTagName('coordinates')[0];
                if (cEl) {
                    const coords = parseCoords(cEl.textContent);
                    if (coords.length > 0) {
                        features.push({
                            type: 'Feature',
                            properties: { CONVENIO: convNum, name: name },
                            geometry: { type: 'LineString', coordinates: coords }
                        });
                    }
                }
            }

            // MultiGeometry LineStrings
            const multiGeoms = p.getElementsByTagName('MultiGeometry');
            for (let j = 0; j < multiGeoms.length; j++) {
                const mLines = multiGeoms[j].getElementsByTagName('LineString');
                for (let k = 0; k < mLines.length; k++) {
                    const cEl = mLines[k].getElementsByTagName('coordinates')[0];
                    if (cEl) {
                        const coords = parseCoords(cEl.textContent);
                        if (coords.length > 0) {
                            features.push({
                                type: 'Feature',
                                properties: { CONVENIO: convNum, name: name },
                                geometry: { type: 'LineString', coordinates: coords }
                            });
                        }
                    }
                }
            }

            // Points
            const points = p.getElementsByTagName('Point');
            for (let j = 0; j < points.length; j++) {
                const cEl = points[j].getElementsByTagName('coordinates')[0];
                if (cEl) {
                    const coords = parseCoords(cEl.textContent);
                    if (coords.length > 0) {
                        features.push({
                            type: 'Feature',
                            properties: { CONVENIO: convNum, name: name },
                            geometry: { type: 'Point', coordinates: coords[0] }
                        });
                    }
                }
            }

            // Polygons
            const polygons = p.getElementsByTagName('Polygon');
            for (let j = 0; j < polygons.length; j++) {
                const linearRings = polygons[j].getElementsByTagName('LinearRing');
                const rings = [];
                for (let k = 0; k < linearRings.length; k++) {
                    const cEl = linearRings[k].getElementsByTagName('coordinates')[0];
                    if (cEl) {
                        const coords = parseCoords(cEl.textContent);
                        if (coords.length > 0) rings.push(coords);
                    }
                }
                if (rings.length > 0) {
                    features.push({
                        type: 'Feature',
                        properties: { CONVENIO: convNum, name: name },
                        geometry: { type: 'Polygon', coordinates: rings }
                    });
                }
            }
        }

        // Si no se encontraron Placemarks, buscar LineStrings directamente
        if (features.length === 0) {
            const allLineStrings = dom.getElementsByTagName('LineString');
            for (let j = 0; j < allLineStrings.length; j++) {
                const cEl = allLineStrings[j].getElementsByTagName('coordinates')[0];
                if (cEl) {
                    const coords = parseCoords(cEl.textContent);
                    if (coords.length > 0) {
                        features.push({
                            type: 'Feature',
                            properties: { CONVENIO: convNum },
                            geometry: { type: 'LineString', coordinates: coords }
                        });
                    }
                }
            }
        }

        return features;
    } catch (e) {
        console.warn(`Error parseando KML ${convNum}:`, e);
        return [];
    }
}

async function renderSyntheticKmlFeatures() {
    if (!synMap || !synMapReady) return;

    // Determinar qué convenios deben mostrarse
    let convNums = [];
    if (filteredData && filteredData.length > 0) {
        const set = new Set();
        filteredData.forEach(r => {
            const c = String(r['CONVENIO'] || '').trim();
            if (c) set.add(c);
        });
        convNums = Array.from(set);
    } else if (rawData && rawData.length > 0) {
        const set = new Set();
        rawData.forEach(r => {
            const c = String(r['CONVENIO'] || '').trim();
            if (c) set.add(c);
        });
        convNums = Array.from(set);
    } else {
        convNums = synAllKnownKmls;
    }

    // Cargar y almacenar en caché los KMLs que falten
    const toFetch = convNums.filter(num => !synKmlCache[num]);
    if (toFetch.length > 0) {
        const promises = toFetch.map(async (num) => {
            try {
                const mapData = await loadMapData(num);
                if (mapData) {
                    if (mapData.type === 'kml') {
                        synKmlCache[num] = parseKMLStringToGeoJSON(mapData.data, num);
                    } else if (mapData.type === 'geojson') {
                        const d = mapData.data;
                        const feats = d.features || (d.geometry ? [d] : []);
                        feats.forEach(f => {
                            if (f && f.geometry) {
                                f.properties = f.properties || {};
                                f.properties.CONVENIO = num;
                            }
                        });
                        synKmlCache[num] = feats;
                    }
                } else {
                    synKmlCache[num] = [];
                }
            } catch (e) {
                synKmlCache[num] = [];
            }
        });
        await Promise.all(promises);
    }

    // Unir todas las features activas y generar puntos beacon para cada tramo
    const features = [];
    convNums.forEach(num => {
        const feats = synKmlCache[num] || [];
        feats.forEach(f => {
            features.push(f);
            if (f.geometry) {
                if (f.geometry.type === 'LineString' && f.geometry.coordinates && f.geometry.coordinates.length > 0) {
                    const coords = f.geometry.coordinates;
                    const midCoord = coords[Math.floor(coords.length / 2)];
                    features.push({
                        type: 'Feature',
                        geometry: { type: 'Point', coordinates: midCoord },
                        properties: { ...f.properties, _isTramoPoint: true }
                    });
                } else if (f.geometry.type === 'MultiLineString' && f.geometry.coordinates) {
                    f.geometry.coordinates.forEach(line => {
                        if (line.length > 0) {
                            const midCoord = line[Math.floor(line.length / 2)];
                            features.push({
                                type: 'Feature',
                                geometry: { type: 'Point', coordinates: midCoord },
                                properties: { ...f.properties, _isTramoPoint: true }
                            });
                        }
                    });
                }
            }
        });
    });

    features.forEach((f, idx) => {
        f.id = idx + 1;
    });

    synKmlGeojson = { type: 'FeatureCollection', features: features };
    if (synMap.getSource('syn-tramos-src')) {
        synMap.getSource('syn-tramos-src').setData(synKmlGeojson);
    }
    ensureSynTramosOnTop();
}

function setupSyntheticControls() {
    const btnCentrar = document.getElementById('btn-synthetic-centrar');
    if (btnCentrar) {
        btnCentrar.addEventListener('click', () => {
            if (synMap) {
                synMap.fitBounds([
                    [-77.15, 5.4],
                    [-73.85, 8.88]
                ], { padding: { top: 20, bottom: 20, left: 20, right: 20 }, duration: 900 });
            }
        });
    }

    const modeBtns = document.querySelectorAll('.synthetic-mode-btn');
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            synActiveMode = btn.getAttribute('data-mode');
            applySyntheticMode(synActiveMode);
        });
    });

    const tramoLayerIds = [
        'syn-tramos-casing',
        'syn-tramos-line',
        'syn-tramos-core',
        'syn-tramos-points-casing',
        'syn-tramos-points',
        'syn-tramos-points-core',
        'syn-tramos-hitbox'
    ];

    const subregLayerIds = ['syn-subregiones-fill', 'syn-subregiones-line', 'syn-subregiones-labels'];

    const layerCheckboxes = {
        tramos: ['syn-chk-tramos', tramoLayerIds],
        subregiones: ['syn-chk-subregiones', subregLayerIds],
        municipios: ['syn-chk-municipios', ['syn-municipios-fill', 'syn-municipios-line', 'syn-municipios-labels', 'syn-municipios-hover']],
        primaria: ['syn-chk-primaria', ['syn-vial-primaria']],
        secundaria: ['syn-chk-secundaria', ['syn-vial-secundaria']],
        terciaria: ['syn-chk-terciaria', ['syn-vial-terciaria']]
    };

    Object.entries(layerCheckboxes).forEach(([key, [chkId, layerIds]]) => {
        const chk = document.getElementById(chkId);
        if (chk) {
            chk.checked = !!synLayersState[key];
            chk.addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                synLayersState[key] = isChecked;
                if (synMap && synMapReady) {
                    layerIds.forEach(lid => {
                        if (synMap.getLayer(lid)) {
                            synMap.setLayoutProperty(lid, 'visibility', isChecked ? 'visible' : 'none');
                        }
                    });
                    if (key === 'tramos' && isChecked) {
                        ensureSynTramosOnTop();
                    }
                }
            });
        }
    });
}

function setSynTramosVis(visible) {
    const tramoLayerIds = [
        'syn-tramos-casing',
        'syn-tramos-line',
        'syn-tramos-core',
        'syn-tramos-points-casing',
        'syn-tramos-points',
        'syn-tramos-points-core',
        'syn-tramos-hitbox'
    ];
    tramoLayerIds.forEach(lid => setSynLayerVis(lid, visible));
}

function applySyntheticMode(mode) {
    if (!synMap || !synMapReady) return;
    if (mode === 'general') {
        setSynLayerVis('syn-subregiones-fill', synLayersState.subregiones);
        setSynLayerVis('syn-subregiones-line', synLayersState.subregiones);
        setSynLayerVis('syn-subregiones-labels', synLayersState.subregiones);
        setSynLayerVis('syn-municipios-fill', synLayersState.municipios);
        setSynLayerVis('syn-municipios-line', synLayersState.municipios);
        setSynLayerVis('syn-municipios-labels', synLayersState.municipios);
        setSynTramosVis(synLayersState.tramos);
        setSynLayerVis('syn-vial-primaria', synLayersState.primaria);
        setSynLayerVis('syn-vial-secundaria', synLayersState.secundaria);
        setSynLayerVis('syn-vial-terciaria', synLayersState.terciaria);
        ensureSynTramosOnTop();
    } else if (mode === 'subregional') {
        // Enfoque en los límites subregionales
        setSynLayerVis('syn-subregiones-fill', true);
        setSynLayerVis('syn-subregiones-line', true);
        setSynLayerVis('syn-subregiones-labels', true);
        setSynLayerVis('syn-municipios-fill', true);
        setSynLayerVis('syn-municipios-line', true);
        setSynLayerVis('syn-municipios-labels', true);
        setSynTramosVis(true);
        setSynLayerVis('syn-vial-primaria', false);
        setSynLayerVis('syn-vial-secundaria', false);
        setSynLayerVis('syn-vial-terciaria', false);
        ensureSynTramosOnTop();
    } else if (mode === 'vial') {
        setSynLayerVis('syn-subregiones-fill', false);
        setSynLayerVis('syn-subregiones-line', false);
        setSynLayerVis('syn-subregiones-labels', false);
        setSynLayerVis('syn-municipios-fill', true);
        setSynLayerVis('syn-municipios-line', true);
        setSynLayerVis('syn-municipios-labels', false);
        setSynTramosVis(false);
        setSynLayerVis('syn-vial-primaria', true);
        setSynLayerVis('syn-vial-secundaria', true);
        setSynLayerVis('syn-vial-terciaria', true);
    } else if (mode === 'intervenciones') {
        setSynLayerVis('syn-subregiones-fill', synLayersState.subregiones);
        setSynLayerVis('syn-subregiones-line', synLayersState.subregiones);
        setSynLayerVis('syn-subregiones-labels', synLayersState.subregiones);
        setSynLayerVis('syn-municipios-fill', true);
        setSynLayerVis('syn-municipios-line', true);
        setSynLayerVis('syn-municipios-labels', true);
        setSynTramosVis(true);
        setSynLayerVis('syn-vial-primaria', false);
        setSynLayerVis('syn-vial-secundaria', false);
        setSynLayerVis('syn-vial-terciaria', false);
        ensureSynTramosOnTop();
    }
}

function setSynLayerVis(layerId, visible) {
    if (synMap && synMap.getLayer(layerId)) {
        synMap.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
    }
}

function updateSyntheticMap() {
    if (!synMap || !synMapReady) {
        if (!synMap && document.getElementById('synthetic-map')) {
            initSyntheticMap();
        }
        return;
    }

    // Animación sutil de filtro
    const mapEl = document.getElementById('synthetic-map');
    if (mapEl) {
        mapEl.classList.remove('syn-filter-flash');
        void mapEl.offsetWidth; // Forzar reflow para reiniciar la animación
        mapEl.classList.add('syn-filter-flash');
    }

    if (synMpioData) {
        applyIntervenedStatusToMpio(synMpioData);
        if (synMap.getSource('syn-municipios-src')) {
            synMap.getSource('syn-municipios-src').setData(synMpioData);
        }
    }
    renderSyntheticKmlFeatures();

    // Encuadre suave según datos filtrados si hay filtro activo
    const norm = (s) => String(s || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Z ]/g, '').trim();
    if (filteredData && filteredData.length > 0 && filteredData.length < rawData.length && synMpioData) {
        const activeMuniNames = new Set(filteredData.map(r => norm(r['MUNICIPIO'])));
        const matchedFeatures = synMpioData.features.filter(f => {
            const raw = f.properties.NOMBRE_MPI || f.properties.MPIO_CNMBR || f.properties.NOM_MPIO || '';
            return activeMuniNames.has(norm(raw));
        });

        if (matchedFeatures.length > 0 && typeof turf !== 'undefined') {
            try {
                const fc = { type: 'FeatureCollection', features: matchedFeatures };
                const bbox = turf.bbox(fc);
                synMap.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]], {
                    padding: { top: 35, bottom: 35, left: 35, right: 35 },
                    maxZoom: 11,
                    duration: 550
                });
            } catch (err) { }
        }
    }
}

window.openModalFromMap = function (convNum) {
    if (synCurrentPopup) {
        synCurrentPopup.remove();
        synCurrentPopup = null;
    }
    const cleanNum = String(convNum || '').trim();
    const row = rawData.find(r => String(r['CONVENIO']).trim() === cleanNum);
    if (row && typeof openModal === 'function') {
        openModal(row);
    } else {
        alertToast("Convenio no encontrado", `No se encontraron datos detallados para el convenio ${cleanNum}.`, "warning");
    }
};










