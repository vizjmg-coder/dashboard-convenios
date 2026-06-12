// Variables Globales
let rawData = [];
let filteredData = [];
let charts = {};
let currentPage = 1;
const rowsPerPage = 12;
let currentSort = { column: 'CONVENIO', asc: true };
let currentChartMode = 'top'; // 'top' o 'municipio'
let currentAlertFilter = 'all';
let planMetric = 'contratado';
let planAnualMetric = 'longitud';
let planAnualFilter = 'todos-km';
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
    const est = String(estado || 'N/A').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    
    if (est.includes('ejecutado')) return {
        badgeClass: 'badge-ejecutado',
        hex: '#3561AB', 
        label: 'Ejecutado'
    };
    if (est.includes('ejecucion')) return {
        badgeClass: 'badge-ejecucion',
        hex: '#018D38', 
        label: 'En Ejecución'
    };
    if (est.includes('proximo') || est.includes('finalizar')) return {
        badgeClass: 'badge-proximo',
        hex: '#F28E18', 
        label: 'Próximo a finalizar'
    };
    if (est.includes('suspendido') || est.includes('riesgo medio') || est.includes('medio')) return {
        badgeClass: 'badge-suspendido',
        hex: '#8B4A97', 
        label: 'Suspendido'
    };
    if (est.includes('por liquidar') || est.includes('riesgo alto') || est.includes('alto') || est.includes('riesgo')) return {
        badgeClass: 'badge-por-liquidar',
        hex: '#F28E18', 
        label: 'Por Liquidar'
    };
    if (est.includes('liquidado')) return {
        badgeClass: 'badge-liquidado',
        hex: '#3561AB', 
        label: 'Liquidado'
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

    for(let i=1; i<=9; i++) setNodeState(i, 'pending', '--');
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

// Crops and resizes gallery photos to a standard 4:3 aspect ratio, compressed to JPEG at 75% quality
async function getOptimizedBase64Image(url, maxWidth = 600, maxHeight = 450) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = maxWidth;
            canvas.height = maxHeight;
            const ctx = canvas.getContext('2d');
            
            // Standard landscape crop (4:3 aspect ratio)
            const targetRatio = maxWidth / maxHeight;
            let srcWidth = img.width;
            let srcHeight = img.height;
            let srcX = 0;
            let srcY = 0;
            
            if (img.width / img.height > targetRatio) {
                // Image is wider, crop sides
                srcWidth = img.height * targetRatio;
                srcX = (img.width - srcWidth) / 2;
            } else {
                // Image is taller, crop top/bottom
                srcHeight = img.width / targetRatio;
                srcY = (img.height - srcHeight) / 2;
            }
            
            ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, 0, 0, maxWidth, maxHeight);
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
        const r = await fetch(`./assets/mapas/${num}.geojson`);
        if(r.ok) {
            const d = await r.json();
            traceLayer = L.geoJSON(d, {
                style: { color: '#A90F09', weight: 4, opacity: 0.9 },
                pointToLayer: (f, ll) => L.circleMarker(ll, { radius: 4, fillColor: "#A90F09", color: "#fff", weight: 1.5, fillOpacity: 0.9 })
            }).addTo(tempMap);
        } else if (typeof omnivore !== 'undefined') {
            traceLayer = await new Promise(res => {
                const customLayer = L.geoJSON(null, {
                    style: { color: '#A90F09', weight: 4, opacity: 0.9 },
                    pointToLayer: (f, ll) => L.circleMarker(ll, { radius: 4, fillColor: "#A90F09", color: "#fff", weight: 1.5, fillOpacity: 0.9 })
                });
                const k = omnivore.kml(`./assets/mapas/${num}.kml`, null, customLayer).on('ready', () => {
                    k.addTo(tempMap);
                    res(k);
                }).on('error', () => res(null));
            });
        }
    } catch(e) {}

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
    } catch(e) {
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
        // Configure Poppins Font using Fontsource CDN
        pdfMake.fonts = {
            Poppins: {
                normal: 'https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-400-normal.ttf',
                bold: 'https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-700-normal.ttf',
                italics: 'https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-400-italic.ttf',
                bolditalics: 'https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-700-italic.ttf'
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

        // ===== 1. ASYNCHRONOUS CAPTURE OF LOGOS & MAPS =====
        const logoBase64 = await getBase64ImageFromURL('./assets/escudo_antioquia.png').catch(() => null);
        const mapBase64 = await getBase64FromHtmlElement('map');
        const antioquiaMapBase64 = await generateAntioquiaMapBase64(row['MUNICIPIO'], row).catch(() => null);

        const antesImgs = document.querySelectorAll('#mod-galeria-antes img');
        const despuesImgs = document.querySelectorAll('#mod-galeria-despues img');
        
        const antesBase64 = await Promise.all(Array.from(antesImgs).map(img => getOptimizedBase64Image(img.src).catch(() => null)));
        const despuesBase64 = await Promise.all(Array.from(despuesImgs).map(img => getOptimizedBase64Image(img.src).catch(() => null)));
        
        const validAntes = antesBase64.filter(Boolean);
        const validDespues = despuesBase64.filter(Boolean);
        const hasPhotos = validAntes.length > 0 || validDespues.length > 0;

        const sysState = getSystemState(row['ESTADO CONVENIO']);

        // ===== 2. LAYOUT & TEXT CELL BUILDERS =====
        const thCell = (text) => ({ text, fontSize: 8.5, bold: true, color: '#ffffff', fillColor: '#0B5640', margin: [6, 5, 6, 5] });
        const tdCell = (text, opts = {}) => ({ text: String(text ?? '-'), fontSize: 8.5, color: '#1E293B', margin: [6, 4, 6, 4], ...opts });
        const tdRight = (text, opts = {}) => tdCell(text, { alignment: 'right', ...opts });

        const zebraLayout = {
            fillColor: function (rowIndex, node, columnIndex) {
                return (rowIndex > 0 && rowIndex % 2 === 0) ? '#F8FAFC' : null;
            },
            hLineColor: function (i, node) { return '#E2E8F0'; },
            vLineColor: function (i, node) { return '#E2E8F0'; },
            hLineWidth: function (i, node) { return (i === 0 || i === node.table.body.length) ? 0 : 0.5; },
            vLineWidth: function (i, node) { return 0; }
        };

        // ===== 3. COMPONENT GENERATION (KPI, PROGRESS, GRID, TIMELINE) =====
        const kpiCard = (title, value, accentColor) => ({
            table: {
                widths: ['*'],
                body: [[
                    {
                        stack: [
                            { text: title.toUpperCase(), fontSize: 6.5, bold: true, color: '#64748B', letterSpacing: 0.5, margin: [0, 0, 0, 4] },
                            { text: value, fontSize: 11.5, bold: true, color: '#1E293B' }
                        ],
                        margin: [8, 6, 8, 6]
                    }
                ]]
            },
            layout: {
                hLineWidth: () => 0.5,
                vLineWidth: (i) => i === 0 ? 3 : 0.5,
                hLineColor: () => '#E2E8F0',
                vLineColor: (i) => i === 0 ? accentColor : '#E2E8F0',
                fillColor: () => '#FFFFFF'
            }
        });

        const largeKpiCard = (title, value, accentColor) => ({
            table: {
                widths: ['*'],
                body: [[
                    {
                        stack: [
                            { text: title.toUpperCase(), fontSize: 7, bold: true, color: '#64748B', letterSpacing: 0.5, margin: [0, 0, 0, 3] },
                            { text: value, fontSize: 13, bold: true, color: '#1E293B' }
                        ],
                        margin: [10, 8, 10, 8]
                    }
                ]]
            },
            layout: {
                hLineWidth: () => 0.5,
                vLineWidth: (i) => i === 0 ? 4 : 0.5,
                hLineColor: () => '#E2E8F0',
                vLineColor: (i) => i === 0 ? accentColor : '#E2E8F0',
                fillColor: () => '#FFFFFF'
            },
            margin: [0, 0, 0, 6]
        });

        const progressBar = (pct, color, width = 210, height = 5) => {
            return {
                canvas: [
                    { type: 'rect', x: 0, y: 0, w: width, h: height, r: height / 2, color: '#F1F5F9' },
                    { type: 'rect', x: 0, y: 0, w: Math.max(0, Math.min(width, (pct / 100) * width)), h: height, r: height / 2, color: color }
                ],
                margin: [0, 5, 0, 5]
            };
        };

        const progressCard = (title, pct, color, isLarge = false) => {
            const width = isLarge ? 220 : 210;
            const height = isLarge ? 8 : 5;
            const labelSize = isLarge ? 8.5 : 7.5;
            const pctSize = isLarge ? 14 : 11;
            return {
                table: {
                    widths: ['*'],
                    body: [[
                        {
                            stack: [
                                {
                                    columns: [
                                        { text: title.toUpperCase(), fontSize: labelSize, bold: true, color: '#64748B', width: '*' },
                                        { text: `${(pct || 0).toFixed(1)}%`, fontSize: pctSize, bold: true, color: color, width: 'auto' }
                                    ],
                                    margin: [0, 0, 0, 4]
                                },
                                progressBar(pct, color, width, height)
                            ],
                            margin: isLarge ? [12, 10, 12, 10] : [10, 8, 10, 8]
                        }
                    ]]
                },
                layout: {
                    hLineWidth: () => 0.5,
                    vLineWidth: (i) => i === 0 ? 3 : 0.5,
                    hLineColor: () => '#E2E8F0',
                    vLineColor: (i) => i === 0 ? color : '#E2E8F0',
                    fillColor: () => '#FFFFFF'
                }
            };
        };

        const infoGridCard = (label, value) => ({
            table: {
                widths: ['*'],
                body: [[
                    {
                        stack: [
                            { text: label.toUpperCase(), fontSize: 6.5, bold: true, color: '#64748B', letterSpacing: 0.5, margin: [0, 0, 0, 2] },
                            { text: String(value ?? '-'), fontSize: 9, bold: true, color: '#1E293B' }
                        ],
                        margin: [8, 6, 8, 6]
                    }
                ]]
            },
            layout: {
                hLineWidth: () => 0.5,
                vLineWidth: () => 0.5,
                hLineColor: () => '#E2E8F0',
                vLineColor: () => '#E2E8F0',
                fillColor: () => '#FFFFFF'
            }
        });

        const highlightedInfoGridCard = (label, value, accentColor = '#018D38', bgColor = '#F0FDFA') => ({
            table: {
                widths: ['*'],
                body: [[
                    {
                        stack: [
                            { text: label.toUpperCase(), fontSize: 6.5, bold: true, color: accentColor, letterSpacing: 0.5, margin: [0, 0, 0, 2] },
                            { text: String(value ?? '-'), fontSize: 9.5, bold: true, color: '#1E293B' }
                        ],
                        margin: [8, 6, 8, 6]
                    }
                ]]
            },
            layout: {
                hLineWidth: () => 0.5,
                vLineWidth: (i) => i === 0 ? 3 : 0.5,
                hLineColor: () => '#E2E8F0',
                vLineColor: (i) => i === 0 ? accentColor : '#E2E8F0',
                fillColor: () => bgColor
            }
        });

        const timelineMilestone = (title, date, completed) => ({
            stack: [
                {
                    canvas: [
                        { type: 'rect', x: 0, y: 0, w: 100, h: 4, r: 2, color: completed ? '#018D38' : '#E2E8F0' },
                        { type: 'circle', cx: 50, cy: 2, r: 5, color: completed ? '#0B5640' : '#64748B' }
                    ],
                    margin: [0, 0, 0, 4]
                },
                { text: title.toUpperCase(), fontSize: 6.5, bold: true, color: '#64748B', alignment: 'center' },
                { text: date || '-', fontSize: 8, bold: true, color: '#1E293B', alignment: 'center', margin: [0, 2, 0, 0] }
            ]
        });

        const alertCard = (title, desc, color) => ({
            table: {
                widths: ['*'],
                body: [[
                    {
                        stack: [
                            { text: title.toUpperCase(), fontSize: 7, bold: true, color: color, letterSpacing: 0.5, margin: [0, 0, 0, 2] },
                            { text: desc, fontSize: 8, color: '#475569' }
                        ],
                        margin: [8, 6, 8, 6]
                    }
                ]]
            },
            layout: {
                hLineWidth: () => 0.5,
                vLineWidth: (i) => i === 0 ? 3 : 0.5,
                hLineColor: () => '#E2E8F0',
                vLineColor: (i) => i === 0 ? color : '#E2E8F0',
                fillColor: () => '#FFFFFF'
            },
            margin: [0, 2, 0, 4]
        });

        // ===== 4. COMPILE ALERTS DYNAMICALLY =====
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
                    alertsList.push({ title: 'Próximo a Terminar', desc: `Faltan ${daysLeft} días para la terminación (${termStr}).`, color: '#F28E18' });
                }
            }
            if (termDate && termDate < today) {
                const msPassed = today.getTime() - termDate.getTime();
                const monthsPassed = msPassed / (1000 * 60 * 60 * 24 * 30.43);
                if (monthsPassed >= 24) {
                    alertsList.push({ title: 'Riesgo: Pérdida de Competencia', desc: `Vencido hace ${monthsPassed.toFixed(1)} meses. Límite legal de competencia de 30 meses en riesgo extremo.`, color: '#A90F09' });
                } else {
                    alertsList.push({ title: 'Vencido sin liquidar', desc: `El convenio finalizó el ${termStr} y sigue en estado abierto.`, color: '#A90F09' });
                }
            }
            if (financiero > fisico + 15) {
                alertsList.push({ title: 'Desfase Financiero Crítico', desc: `Avance financiero (${financiero.toFixed(1)}%) supera al físico (${fisico.toFixed(1)}%) por más de 15%.`, color: '#3561AB' });
            }
            if (tieneFotos === 'NO') {
                alertsList.push({ title: 'Sin Evidencia Fotográfica', desc: `El convenio no registra fotografías cargadas en el sistema.`, color: '#A90F09' });
            }
            if (estStr.includes('suspendido') && suspMeses >= 3) {
                alertsList.push({ title: 'Suspensión Prolongada', desc: `Acumula ${suspMeses} meses de suspensión.`, color: '#F28E18' });
            }
            if (estStr.includes('ejecución') && desembolsado === 0) {
                alertsList.push({ title: 'Cero Desembolsos en Ejecución', desc: `Convenio en ejecución pero no hay desembolsos registrados.`, color: '#F28E18' });
            }
        }

        // ===== 5. GENERAL INFORMATION VALUES =====
        const generatedAt = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        let labelContratado = 'Alcance Contratado';
        let valContratado = '';
        const rawAlcanceM = row['ALCANCE (M)'] || getVal(['ALCANCE (M)']);
        const rawAlcanceM2 = row['ALCANCE (M2)'] || getVal(['ALCANCE (M2)']);
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
        const rawEjecutadoM = row['LONGITUD EJECUTADA'] || getVal(['LONGITUD EJECUTADA']);
        const rawEjecutadoM2 = row['AREA EJECUTADA (M2)'] || getVal(['AREA EJECUTADA (M2)']) || row['AREA_EJECUTADA'];
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
            if (hasM && !hasM2) {
                labelEjecutado = 'Longitud Ejecutada';
            } else if (hasM2 && !hasM) {
                labelEjecutado = 'Área Ejecutada';
            } else {
                labelEjecutado = 'Longitud / Área Ejecutada';
            }
            valEjecutado = 'N/A';
        }

        // Parse duration & dates
        let plazoInicial = 0;
        for (let key in row) {
            if (key.toUpperCase().trim() === 'PLAZO INICIAL' || key.toUpperCase().trim().includes('PLAZO INICIAL')) {
                plazoInicial = parseInt(row[key]) || 0;
                break;
            }
        }
        if (!plazoInicial) {
            plazoInicial = parseInt(row['PLAZO INICIAL'] || row['PLAZO_INICIAL'] || 0) || 0;
        }
        const prorrogas = parseInt(row['PRORROGA (MESES)'] || row['PRÓRROGA (MESES)'] || row['PRRROGA (MESES)'] || 0) || 0;
        const suspensiones = parseInt(row['SUSPENSION(MESES)'] || row['SUSPENSIÓN(MESES)'] || row['SUSPENSIN(MESES)'] || 0) || 0;
        const plazoTotal = plazoInicial + prorrogas;

        const termOriginalStr = String(row['FECHA DE TERMINACION'] || row['FECHA DE TERMINACIÓN'] || row['FECHA DE TERMINACIN'] || getVal(['FECHA DE TERMINAC'], false) || '-').trim();
        const termNuevaStr = String(row['NUEVA FECHA DE TERMINACION'] || row['NUEVA FECHA DE TERMINACIÓN'] || row['NUEVA FECHA DE TERMINACIN'] || getVal(['NUEVA FECHA DE TERMINAC'], false) || 'Sin cambios').trim();

        const logoElement = logoBase64 
            ? { image: logoBase64, width: 34, margin: [0, 2, 8, 0] } 
            : {
                table: {
                    widths: [40],
                    body: [[{ text: 'GOB\nANT', fontSize: 7, bold: true, color: '#ffffff', fillColor: '#0B5640', alignment: 'center', margin: [0, 8, 0, 8] }]]
                },
                layout: 'noBorders',
                margin: [0, 0, 8, 0]
              };

        // ===== 6. TRAMS & GEOGRAPHIC RECORDS =====
        let geoRows = [];
        if (currentExtractedFeatures && currentExtractedFeatures.length > 0) {
            geoRows = currentExtractedFeatures.map(feat => {
                const c = getCoords(feat.layer) || { start: 'N/A', end: 'N/A' };
                return [tdCell(feat.name), tdRight(c.start), tdRight(c.end)];
            });
        } else {
            const la = parseFloat(row['LATITUD']), lo = parseFloat(row['LONGITUD']);
            if (!isNaN(la) && !isNaN(lo) && la !== 0) {
                geoRows = [[tdCell('Punto de Referencia Único (Coordenadas Centrales)'), tdRight(`${la.toFixed(6)}, ${lo.toFixed(6)}`), tdRight(`${la.toFixed(6)}, ${lo.toFixed(6)}`)]];
            } else {
                geoRows = [[{ text: 'No hay datos geográficos disponibles para este convenio.', colSpan: 3, alignment: 'center', italics: true, fontSize: 8, color: '#94a3b8', margin: [6, 6, 6, 6] }, {}, {}]];
            }
        }

        // ===== 7. PHOTO GALLERY COMPONENT =====
        const photoCard = (base64Img, caption) => ({
            table: {
                widths: ['*'],
                body: [
                    [{ image: base64Img, width: 210, height: 140, alignment: 'center' }],
                    [{ text: caption.toUpperCase(), alignment: 'center', fontSize: 7, bold: true, color: '#64748B', margin: [0, 4, 0, 4] }]
                ]
            },
            layout: {
                hLineWidth: () => 0.5,
                vLineWidth: () => 0.5,
                hLineColor: () => '#E2E8F0',
                vLineColor: () => '#E2E8F0',
                fillColor: () => '#FFFFFF'
            },
            margin: [0, 4, 0, 8]
        });

        const createPhotoPlaceholder = (stage) => ({
            table: {
                widths: ['*'],
                body: [[{
                    stack: [
                        { text: 'REGISTRO FOTOGRÁFICO', alignment: 'center', fontSize: 8, bold: true, color: '#94a3b8', margin: [0, 30, 0, 0] },
                        { text: `NO DISPONIBLE (${stage.toUpperCase()})`, alignment: 'center', fontSize: 7, color: '#cbd5e1', margin: [0, 2, 0, 30] }
                    ]
                }]]
            },
            layout: {
                hLineWidth: () => 1,
                vLineWidth: () => 1,
                hLineColor: () => '#cbd5e1',
                vLineColor: () => '#cbd5e1',
                hLineDash: () => ({ length: 4, space: 4 }),
                vLineDash: () => ({ length: 4, space: 4 })
            },
            fillColor: '#F8FAFC',
            margin: [0, 4, 0, 8]
        });

        const photoContent = [];
        if (hasPhotos) {
            if (validAntes.length === 0 && validDespues.length > 0) {
                const itemsPerPage = 6;
                for (let i = 0; i < validDespues.length; i += itemsPerPage) {
                    const chunk = validDespues.slice(i, i + itemsPerPage);
                    const pageIndex = Math.floor(i / itemsPerPage);
                    photoContent.push(createSectionHeader(pageIndex === 0 ? '5. REGISTRO FOTOGRÁFICO DE OBRA' : '5. REGISTRO FOTOGRÁFICO DE OBRA (CONTINUACIÓN)', 'before'));
                    photoContent.push({ text: 'Registro Fotográfico (Después de la Intervención)', fontSize: 9, bold: true, color: '#0B5640', margin: [0, 4, 0, 4] });
                    const chunkRows = [];
                    for (let j = 0; j < chunk.length; j += 2) {
                        const imgIndexLeft = i + j;
                        const left = photoCard(chunk[j], `Registro Después - Imagen ${imgIndexLeft + 1}`);
                        const right = chunk[j + 1] ? photoCard(chunk[j + 1], `Registro Después - Imagen ${imgIndexLeft + 2}`) : { text: '', margin: [6, 4, 0, 4] };
                        chunkRows.push([left, right]);
                    }
                    photoContent.push({ table: { widths: ['*', '*'], body: chunkRows }, layout: 'noBorders', margin: [0, 4, 0, 0] });
                }
            } else if (validDespues.length === 0 && validAntes.length > 0) {
                const itemsPerPage = 6;
                for (let i = 0; i < validAntes.length; i += itemsPerPage) {
                    const chunk = validAntes.slice(i, i + itemsPerPage);
                    const pageIndex = Math.floor(i / itemsPerPage);
                    photoContent.push(createSectionHeader(pageIndex === 0 ? '5. REGISTRO FOTOGRÁFICO DE OBRA' : '5. REGISTRO FOTOGRÁFICO DE OBRA (CONTINUACIÓN)', 'before'));
                    photoContent.push({ text: 'Registro Fotográfico (Antes de la Intervención)', fontSize: 9, bold: true, color: '#0B5640', margin: [0, 4, 0, 4] });
                    const chunkRows = [];
                    for (let j = 0; j < chunk.length; j += 2) {
                        const imgIndexLeft = i + j;
                        const left = photoCard(chunk[j], `Registro Antes - Imagen ${imgIndexLeft + 1}`);
                        const right = chunk[j + 1] ? photoCard(chunk[j + 1], `Registro Antes - Imagen ${imgIndexLeft + 2}`) : { text: '', margin: [6, 4, 0, 4] };
                        chunkRows.push([left, right]);
                    }
                    photoContent.push({ table: { widths: ['*', '*'], body: chunkRows }, layout: 'noBorders', margin: [0, 4, 0, 0] });
                }
            } else {
                const maxPhotos = Math.max(validAntes.length, validDespues.length);
                const itemsPerPage = 3; 
                for (let i = 0; i < maxPhotos; i += itemsPerPage) {
                    const pageIndex = Math.floor(i / itemsPerPage);
                    photoContent.push(createSectionHeader(pageIndex === 0 ? '5. REGISTRO FOTOGRÁFICO DE OBRA' : '5. REGISTRO FOTOGRÁFICO DE OBRA (CONTINUACIÓN)', 'before'));
                    photoContent.push({ text: 'Registro Fotográfico Comparativo (Antes vs Después)', fontSize: 9, bold: true, color: '#0B5640', margin: [0, 4, 0, 4] });
                    const chunkRows = [];
                    const limit = Math.min(i + itemsPerPage, maxPhotos);
                    for (let k = i; k < limit; k++) {
                        const left = validAntes[k] ? photoCard(validAntes[k], `Registro Antes - Imagen ${k + 1}`) : createPhotoPlaceholder('Antes');
                        const right = validDespues[k] ? photoCard(validDespues[k], `Registro Después - Imagen ${k + 1}`) : createPhotoPlaceholder('Después');
                        chunkRows.push([left, right]);
                    }
                    photoContent.push({ table: { widths: ['*', '*'], body: chunkRows }, layout: 'noBorders', margin: [0, 4, 0, 0] });
                }
            }
        } else {
            photoContent.push(createSectionHeader('5. REGISTRO FOTOGRÁFICO DE OBRA', 'before'));
            photoContent.push({ text: 'Registro Fotográfico Comparativo (Estandarizado)', fontSize: 9, bold: true, color: '#0B5640', margin: [0, 4, 0, 4] });
            photoContent.push({ 
                table: {
                    widths: ['*'],
                    body: [[{
                        stack: [
                            { text: 'REGISTRO FOTOGRÁFICO DE OBRA', alignment: 'center', fontSize: 10, bold: true, color: '#94a3b8', margin: [0, 40, 0, 0] },
                            { text: 'NO SE DISPONE DE IMÁGENES ASOCIADAS PARA ESTE CONVENIO', alignment: 'center', fontSize: 8.5, color: '#cbd5e1', margin: [0, 4, 0, 40] }
                        ]
                    }]]
                },
                layout: {
                    hLineWidth: () => 1,
                    vLineWidth: () => 1,
                    hLineColor: () => '#cbd5e1',
                    vLineColor: () => '#cbd5e1',
                    hLineDash: () => ({ length: 4, space: 4 }),
                    vLineDash: () => ({ length: 4, space: 4 })
                },
                fillColor: '#F8FAFC',
                margin: [0, 4, 0, 10]
            });
        }

        // ===== 8. DOCUMENT DEFINTION (LETTER VERTICAL, 20MM MARGINS) =====
        const docDefinition = {
            pageSize: 'LETTER',
            pageOrientation: 'portrait',
            pageMargins: [56.7, 56.7, 56.7, 56.7],

            defaultStyle: {
                font: 'Poppins',
                fontSize: 10,
                color: '#1E293B'
            },

            header: (currentPage, pageCount) => ({
                margin: [56.7, 18, 56.7, 0],
                columns: [
                    { text: `Secretaría de Infraestructura Física · Ficha Convenio ${row['CONVENIO']}`, fontSize: 7, color: '#94A3B8', font: 'Poppins' },
                    { text: `Página ${currentPage} de ${pageCount}`, alignment: 'right', fontSize: 7, color: '#94A3B8', font: 'Poppins', bold: true }
                ]
            }),

            footer: (currentPage, pageCount) => ({
                margin: [56.7, 10, 56.7, 0],
                columns: [
                    { text: 'Gobernación de Antioquia\nSecretaría de Infraestructura Física', fontSize: 6.5, color: '#94A3B8', font: 'Poppins' },
                    { text: 'Dirección de Infraestructura y Apoyo Territorial\nFicha de Seguimiento Técnico Contractual', fontSize: 6.5, color: '#94A3B8', alignment: 'center', font: 'Poppins' },
                    { text: `Generado: ${generatedAt}`, fontSize: 6.5, color: '#94A3B8', alignment: 'right', font: 'Poppins' }
                ]
            }),

            content: [
                // ============================================================
                // PÁGINA 1 – INFORMACIÓN GENERAL Y OBSERVACIONES/ALERTAS
                // ============================================================
                {
                    table: {
                        widths: ['*'],
                        body: [
                            [
                                {
                                    canvas: [{ type: 'rect', x: 0, y: 0, w: 498, h: 4, r: 2, color: '#018D38' }],
                                    margin: [-10, -10, -10, 6]
                                }
                            ],
                            [
                                {
                                    columns: [
                                        logoElement,
                                        {
                                            stack: [
                                                { text: 'FICHA TÉCNICA DE SEGUIMIENTO', fontSize: 8.5, bold: true, color: '#64748B', letterSpacing: 0.8 },
                                                { text: `Convenio N° ${row['CONVENIO']}`, fontSize: 16, bold: true, color: '#0B5640', margin: [0, 2, 0, 2] },
                                                { text: `Objeto: ${row['OBJETO'] ? (row['OBJETO'].length > 120 ? row['OBJETO'].substring(0, 120) + '...' : row['OBJETO']) : 'N/A'}`, fontSize: 8.5, color: '#475569', lineHeight: 1.2 }
                                            ],
                                            width: '*'
                                        },
                                        {
                                            stack: [
                                                { text: 'ESTADO', fontSize: 7, bold: true, color: '#64748B', alignment: 'right' },
                                                {
                                                    table: {
                                                        body: [[{ text: sysState.label.toUpperCase(), fontSize: 8, bold: true, color: '#FFFFFF', alignment: 'center', margin: [6, 3, 6, 3] }]]
                                                    },
                                                    layout: { defaultBorder: false, fillColor: sysState.hex },
                                                    margin: [0, 3, 0, 4],
                                                    alignment: 'right'
                                                },
                                                { text: `Corte: ${new Date().toLocaleDateString('es-CO')}`, fontSize: 7, color: '#94A3B8', alignment: 'right' }
                                            ],
                                            width: 'auto',
                                            margin: [10, 0, 0, 0]
                                        }
                                    ],
                                    margin: [10, 0, 10, 8]
                                }
                            ]
                        ]
                    },
                    layout: {
                        hLineWidth: (i) => (i === 0 || i === 2) ? 0.5 : 0,
                        vLineWidth: (i) => (i === 0 || i === 1) ? 0.5 : 0,
                        hLineColor: () => '#E2E8F0',
                        vLineColor: () => '#E2E8F0',
                        fillColor: () => '#FFFFFF'
                    },
                    margin: [0, 0, 0, 10]
                },

                // Progress Bars side-by-side (en la portada, un poco más grandes debajo del header)
                {
                    columns: [
                        { stack: [ progressCard('Avance Físico Real', row['FISICO_NORM'] || 0, '#018D38', true) ], width: '50%', margin: [0, 0, 2, 0] },
                        { stack: [ progressCard('Avance Financiero Ejecutado', row['FINANCIERO_NORM'] || 0, '#3561AB', true) ], width: '50%', margin: [2, 0, 0, 0] }
                    ],
                    margin: [0, 0, 0, 10]
                },

                createSectionHeader('1. Información General del Convenio'),
                
                // Information Grid (2 columns x 4 rows)
                {
                    columns: [
                        {
                            stack: [
                                infoGridCard('Municipio', row['MUNICIPIO']),
                                { text: '', margin: [0, 2] },
                                infoGridCard('Indicador Plan de Desarrollo', row['INDICADOR']),
                                { text: '', margin: [0, 2] },
                                infoGridCard('Supervisor Responsable', row['SUPERVISOR'] || 'Sin Asignar'),
                                { text: '', margin: [0, 2] },
                                highlightedInfoGridCard(labelContratado, valContratado, '#018D38', '#F0FDFA')
                            ],
                            width: '50%',
                            margin: [0, 0, 2, 0]
                        },
                        {
                            stack: [
                                infoGridCard('Subregión', getSubregion(row['MUNICIPIO'])),
                                { text: '', margin: [0, 2] },
                                infoGridCard('Clasificación', row['CLASIFICACIÓN'] || row['CLASIFICACI"N']),
                                { text: '', margin: [0, 2] },
                                infoGridCard('Vigencia', row['VIGENCIA']),
                                { text: '', margin: [0, 2] },
                                highlightedInfoGridCard(labelEjecutado, valEjecutado, '#018D38', '#F0FDFA')
                            ],
                            width: '50%',
                            margin: [2, 0, 0, 0]
                        }
                    ],
                    margin: [0, 0, 0, 10]
                },

                createSectionHeader('Observaciones y Alertas de Riesgo'),
                {
                    columns: [
                        // Left: Supervisor Observations
                        {
                            stack: [
                                {
                                    table: {
                                        widths: ['*'],
                                        body: [[
                                            {
                                                stack: [
                                                    { text: 'OBSERVACIONES TÉCNICAS', fontSize: 7, bold: true, color: '#018D38', letterSpacing: 0.5, margin: [0, 0, 0, 4] },
                                                    { text: row['OBSERVACIONES'] || 'Sin observaciones registradas por el supervisor.', fontSize: 8.5, color: '#1E293B', alignment: 'justify', lineHeight: 1.3 }
                                                ],
                                                margin: [8, 6, 8, 6]
                                            }
                                        ]]
                                    },
                                    layout: {
                                        hLineWidth: () => 0,
                                        vLineWidth: (i) => i === 0 ? 3 : 0,
                                        vLineColor: () => '#018D38',
                                        fillColor: () => '#F8FAFC'
                                    }
                                }
                            ],
                            width: '55%',
                            margin: [0, 0, 4, 0]
                        },
                        // Right: Alerts List
                        {
                            stack: alertsList.length === 0 
                                ? [ alertCard('Sin Alertas Activas', 'El convenio no presenta retrasos ni advertencias contractuales.', '#018D38') ]
                                : alertsList.map(a => alertCard(a.title, a.desc, a.color)),
                            width: '45%',
                            margin: [4, 0, 0, 0]
                        }
                    ],
                    margin: [0, 0, 0, 0]
                },

                // ============================================================
                // PÁGINA 2 – RESUMEN EJECUTIVO, CRONOLOGÍA Y LOCALIZACIÓN
                // ============================================================
                createSectionHeader('2. Resumen Ejecutivo de Inversión', 'before'),
                
                // Columnas de Resumen Ejecutivo: Tabla a la izquierda (58%), Dos Tarjetas Grandes a la derecha (42%)
                {
                    columns: [
                        {
                            stack: [
                                {
                                    table: {
                                        widths: ['*', 'auto'],
                                        body: [
                                            [
                                                { text: 'CONCEPTO DE INVERSIÓN', fontSize: 7, bold: true, color: '#64748B', fillColor: '#F8FAFC', margin: [8, 5, 8, 5] },
                                                { text: 'VALOR COMPROMETIDO', fontSize: 7, bold: true, color: '#64748B', fillColor: '#F8FAFC', alignment: 'right', margin: [8, 5, 8, 5] }
                                            ],
                                            [
                                                { text: '1. APORTE DEPARTAMENTO', fontSize: 8, color: '#475569', margin: [8, 5, 8, 5] },
                                                { text: formatCurrency(row['APORTE DEPARTAMENTO'] || 0), fontSize: 8.5, bold: true, color: '#1E293B', alignment: 'right', margin: [8, 5, 8, 5] }
                                            ],
                                            [
                                                { text: '2. APORTE MUNICIPIO', fontSize: 8, color: '#475569', margin: [8, 5, 8, 5] },
                                                { text: formatCurrency(row['APORTE MUNICIPIO'] || 0), fontSize: 8.5, bold: true, color: '#1E293B', alignment: 'right', margin: [8, 5, 8, 5] }
                                            ],
                                            [
                                                { text: '3. ADICIÓN DEPARTAMENTO', fontSize: 8, color: '#475569', margin: [8, 5, 8, 5] },
                                                { text: formatCurrency(row['ADICION DEPARTAMENTO'] || 0), fontSize: 8.5, bold: true, color: '#1E293B', alignment: 'right', margin: [8, 5, 8, 5] }
                                            ],
                                            [
                                                { text: '4. ADICIÓN MUNICIPIO', fontSize: 8, color: '#475569', margin: [8, 5, 8, 5] },
                                                { text: formatCurrency(row['ADICION MUNICIPIO'] || 0), fontSize: 8.5, bold: true, color: '#1E293B', alignment: 'right', margin: [8, 5, 8, 5] }
                                            ],
                                            [
                                                { text: 'INVERSIÓN TOTAL (DEPTO + MPIO)', fontSize: 8.5, bold: true, color: '#0B5640', fillColor: '#E6F3ED', margin: [8, 6, 8, 6] },
                                                { text: formatCurrency(
                                                    (row['APORTE DEPARTAMENTO'] || 0) + 
                                                    (row['APORTE MUNICIPIO'] || 0) + 
                                                    (row['ADICION DEPARTAMENTO'] || 0) + 
                                                    (row['ADICION MUNICIPIO'] || 0)
                                                  ), fontSize: 8.5, bold: true, color: '#0B5640', fillColor: '#E6F3ED', alignment: 'right', margin: [8, 6, 8, 6] }
                                            ]
                                        ]
                                    },
                                    layout: {
                                        hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 1.5 : 0.5,
                                        vLineWidth: () => 0,
                                        hLineColor: (i, node) => (i === 0 || i === node.table.body.length) ? '#CBD5E1' : '#E2E8F0'
                                    }
                                }
                            ],
                            width: '58%',
                            margin: [0, 0, 10, 0]
                        },
                        {
                            stack: [
                                largeKpiCard('TOTAL DESEMBOLSADO (IDEA)', formatCurrency(row['VALOR TOTAL DESEMBOLSADO']), '#3561AB'),
                                largeKpiCard('TOTAL AUTORIZADO', formatCurrency(row['VALOR TOTAL AUTORIZADO DEPARTAMENTO'] || row['VALOR TOTAL AUTORIZADO']), '#8B4A97')
                            ],
                            width: '42%'
                        }
                    ],
                    margin: [0, 0, 0, 10]
                },

                createSectionHeader('3. Cronología del Convenio'),

                // Horizontal timeline
                {
                    columns: [
                        { stack: [ timelineMilestone('Suscripción', getVal(['FECHA DE SUSCRIPC'], true), true) ], width: '25%' },
                        { stack: [ timelineMilestone('Acta Inicio', getVal(['FECHA DE ACTA DE INICIO'], true) || getVal(['ACTA DE INICIO'], true), getVal(['FECHA DE ACTA DE INICIO'], true) ? true : false) ], width: '25%' },
                        { stack: [ timelineMilestone('Terminación', getVal(['NUEVA FECHA DE TERMINAC'], true) || getVal(['FECHA DE TERMINAC'], true), getVal(['FECHA DE TERMINAC'], true) ? true : false) ], width: '25%' },
                        { stack: [ timelineMilestone('Cierre / Liq.', row['FECHA ACTA DE CIERRE DE EXPEDIENTE'] || (isLiquidado ? 'Liquidado' : 'Pendiente'), isLiquidado) ], width: '25%' }
                    ],
                    margin: [0, 4, 0, 4]
                },

                // Plazo inicial, plazo total, novedades y nueva fecha de terminación resaltada (4 columnas de tarjetas del mismo alto)
                {
                    columns: [
                        { stack: [ infoGridCard('PLAZO INICIAL', `${plazoInicial} Meses`) ], width: '25%', margin: [0, 0, 3, 0] },
                        { stack: [ infoGridCard('NOVEDADES ACUMULADAS', `${prorrogas} m. prórr. / ${suspensiones} m. susp.`) ], width: '25%', margin: [3, 0, 3, 0] },
                        { stack: [ highlightedInfoGridCard('PLAZO TOTAL', `${plazoTotal} Meses`, '#0B5640', '#E6F3ED') ], width: '25%', margin: [3, 0, 3, 0] },
                        { stack: [ highlightedInfoGridCard('NUEVA FECHA TERMINACIÓN', termNuevaStr, '#D97706', '#FEF3C7') ], width: '25%', margin: [3, 0, 0, 0] }
                    ],
                    margin: [0, 8, 0, 8]
                },

                createSectionHeader('4. Localización Geográfica del Proyecto'),
                {
                    table: {
                        widths: ['50%', '50%'],
                        body: [
                            [
                                { text: 'Ubicación General (Departamento)', alignment: 'center', fontSize: 7.5, bold: true, color: '#64748B', margin: [0, 4, 0, 4] },
                                { text: 'Detalle del Trazado (Localización)', alignment: 'center', fontSize: 7.5, bold: true, color: '#64748B', margin: [0, 4, 0, 4] }
                            ],
                            [
                                antioquiaMapBase64 
                                    ? { image: antioquiaMapBase64, width: 220, height: 160, alignment: 'center', margin: [0, 0, 0, 4] }
                                    : { text: 'Mapa del departamento no disponible.', alignment: 'center', fontSize: 8, margin: [0, 30], color: '#94A3B8', italics: true },
                                mapBase64
                                    ? { image: mapBase64, width: 220, height: 160, alignment: 'center', margin: [0, 0, 0, 4] }
                                    : { text: 'Trazado geográfico detallado no disponible.', alignment: 'center', fontSize: 8, margin: [0, 30], color: '#94A3B8', italics: true }
                            ]
                        ]
                    },
                    layout: {
                        hLineWidth: (i) => (i === 0 || i === 2) ? 0.5 : 0,
                        vLineWidth: (i) => (i === 0 || i === 2) ? 0.5 : 0,
                        hLineColor: () => '#E2E8F0',
                        vLineColor: () => '#E2E8F0',
                        fillColor: () => '#FFFFFF'
                    },
                    margin: [0, 2, 0, 6]
                },

                { text: 'Segmentos de Referencia e Inventario Geográfico', fontSize: 9, bold: true, color: '#0B5640', margin: [0, 4, 0, 4] },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 'auto', 'auto'],
                        body: [
                            [thCell('Tramo / Segmento de Intervención'), thCell('Coordenada Inicio (Lat, Lng)'), thCell('Coordenada Fin (Lat, Lng)')],
                            ...geoRows
                        ]
                    },
                    layout: zebraLayout,
                    margin: [0, 0, 0, 0]
                },

                // ============================================================
                // PÁGINA 3+ – REGISTRO FOTOGRÁFICO
                // ============================================================
                ...photoContent
            ],

            styles: {
                secHeader: {
                    fontSize: 10,
                    bold: true,
                    color: '#ffffff',
                    fillColor: '#0B5640',
                    margin: [0, 8, 0, 10]
                },
                subHeader: {
                    fontSize: 9,
                    bold: true,
                    color: '#0B5640',
                    margin: [0, 6, 0, 4]
                },
                fieldLabel: {
                    fontSize: 8.5,
                    bold: true,
                    color: '#64748b',
                    margin: [0, 1, 0, 2]
                },
                fieldValue: {
                    fontSize: 8.5,
                    color: '#334155',
                    margin: [0, 1, 0, 5]
                }
            }
        };

        // ===== 9. GENERATE AND DOWNLOAD PDF =====
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
                if(filteredData.length > 0) updateCharts();
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
        window.populateUpdatesPanel = function(changes) {
            const list = document.getElementById('updates-list');
            const badge = document.getElementById('updates-badge');
            const subtitle = document.getElementById('updates-subtitle');
            if (!list) return;
            if (badge) { badge.textContent = changes.length; badge.classList.remove('hidden'); }
            if (subtitle) subtitle.textContent = `${changes.length} actualización(es) — ${new Date().toLocaleTimeString('es-CO', {hour:'2-digit', minute:'2-digit'})}`;
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
            if(row) generateProfessionalPDF(row);
        });
        
        document.getElementById('btn-first').addEventListener('click', () => { currentPage = 1; renderTable(); });
        document.getElementById('btn-prev').addEventListener('click', () => changePage(-1));
        document.getElementById('btn-next').addEventListener('click', () => changePage(1));
        document.getElementById('btn-last').addEventListener('click', () => { currentPage = Math.ceil(filteredData.length / rowsPerPage) || 1; renderTable(); });
        document.getElementById('btn-export').addEventListener('click', exportToCSV);
        
        ['filter-search', 'filter-municipio', 'filter-supervisor', 'filter-indicador', 'filter-vigencia', 'filter-convenio-num', 'filter-clasificacion', 'filter-subregion', 'filter-estado'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', applyFilters);
                if (id === 'filter-search') el.addEventListener('input', applyFilters);
            }
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
                if (targetTab === 'mapa' && typeof renderMapTab === 'function') {
                    renderMapTab();
                } else if (targetTab === 'plan' && typeof renderPlanTab === 'function') {
                    renderPlanTab();
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

        loadExcelFile();
    } catch (e) { console.error("Error inicial:", e); }
});

async function loadExcelFile() {
    const sheetId = '13c4V84sj_T1ZQxoq_HLqNHxUUXINzvZJeKWVgK_H55Q';
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx&gid=1676437891`;
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
        var norm = function(s) {
            return String(s || '').replace(/[\u00C0-\u024F]/g, function(c) {
                return c.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            }).toUpperCase().replace(/\s+/g, ' ').trim();
        };
        return function() {
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

    rawData = json.map(function(row) {
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
            'ALCANCE (M)': parseNum(c('ALCANCE (M)')),
            'ALCANCE (M2)': parseNum(c('ALCANCE (M2)')),
            'LONGITUD EJECUTADA': parseNum(c('LONGITUD EJECUTADA (m)', 'LONGITUD EJECUTADA (M)', 'LONGITUD EJECUTADA')),
            'CONVENIANTE EJECUTOR': c('CONVENIANTE EJECUTOR', 'EJECUTOR'),
            'SUBREGION': String(c('SUBREGION', 'SUBREGIÓN', 'SUB REGIÓN') || '').trim().toUpperCase(),
            'INDICADOR': String(c('INDICADOR', 'INDICADOR PLAN DE DESARROLLO') || '').trim(),
            'AREA EJECUTADA (M2)': parseNum(c('AREA EJECUTADA (M2)')),
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
    if(fechaEl) {
        fechaEl.textContent = today.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    // Poblar panel de actualizaciones con info de la carga
    if (typeof window.populateUpdatesPanel === 'function') {
        const updateInfo = [{
            convenio: 'SISTEMA',
            fecha: today.toLocaleTimeString('es-CO', {hour:'2-digit', minute:'2-digit'}),
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
            const matchVig = excludeField === 'VIGENCIA' ? true : (!currentVigencia || String(row['VIGENCIA']).trim() === currentVigencia);
            const matchMun = excludeField === 'MUNICIPIO' ? true : (!currentMunicipio || String(row['MUNICIPIO'] || '').trim() === currentMunicipio);
            const matchSup = excludeField === 'SUPERVISOR' ? true : (!currentSupervisor || String(row['SUPERVISOR'] || '').trim() === currentSupervisor);
            const matchConv = excludeField === 'CONVENIO' ? true : (!currentConvenioNum || String(row['CONVENIO'] || '').trim() === currentConvenioNum);
            const clasifValue = String(row['CLASIFICACIÓN'] || row['CLASIFICACI"N'] || '').trim();
            const matchClasif = excludeField === 'CLASIFICACIÓN' ? true : (!currentClasificacion || clasifValue === currentClasificacion);
            const matchInd = excludeField === 'INDICADOR' ? true : (!currentIndicador || String(row['INDICADOR'] || '').trim() === currentIndicador);
            const matchSub = excludeField === 'SUBREGION' ? true : (!currentSubregion || String(row['SUBREGION'] || '').trim() === currentSubregion);
            const matchEst = excludeField === 'ESTADO CONVENIO' ? true : (!currentEstado || String(row['ESTADO CONVENIO'] || '').trim() === currentEstado);
            return matchSearch && matchVig && matchMun && matchSup && matchConv && matchClasif && matchInd && matchSub && matchEst;
        });
        return [...new Set(validRows.map(i => {
            if(field === 'CLASIFICACIÓN') return String(i['CLASIFICACIÓN'] || i['CLASIFICACI"N'] || '').trim();
            return String(i[field] || '').trim();
        }).filter(Boolean))].sort();
    };
    const updateSelect = (id, options, currentValue) => {
        const select = document.getElementById(id);
        if (!select) return;
        const finalValue = options.includes(currentValue) ? currentValue : "";
        select.innerHTML = '<option value="">Todos</option>' + options.map(v => `<option value="${v}">${v}</option>`).join('');
        select.value = finalValue;
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

function applyFilters() {
    const search = document.getElementById('filter-search').value.toLowerCase().trim();
    const vigencia = document.getElementById('filter-vigencia').value.trim();
    const municipio = document.getElementById('filter-municipio').value.trim();
    const supervisor = document.getElementById('filter-supervisor').value.trim();
    const indicador = document.getElementById('filter-indicador') ? document.getElementById('filter-indicador').value.trim() : '';
    const convenioNum = document.getElementById('filter-convenio-num').value.trim();
    const clasificacion = document.getElementById('filter-clasificacion').value.trim();
    const estado = document.getElementById('filter-estado') ? document.getElementById('filter-estado').value.trim() : '';
    const subregion = document.getElementById('filter-subregion') ? document.getElementById('filter-subregion').value.trim() : '';

    const activeFiltersCount = [search, vigencia, municipio, supervisor, indicador, convenioNum, clasificacion, estado, subregion].filter(val => val !== '').length;
    const badge = document.getElementById('active-filters-badge');
    if (badge) {
        if (activeFiltersCount > 0) {
            badge.textContent = activeFiltersCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    filteredData = rawData.filter(row => {
        const rowValsStr = Object.values(row).map(v => String(v || '').toLowerCase()).join(' ');
        const matchSearch = !search || rowValsStr.includes(search);
        const matchVig = !vigencia || String(row['VIGENCIA'] || '').trim() === vigencia;
        const matchMun = !municipio || String(row['MUNICIPIO'] || '').trim() === municipio;
        const matchSup = !supervisor || String(row['SUPERVISOR'] || '').trim() === supervisor;
        const matchInd = !indicador || String(row['INDICADOR'] || '').trim() === indicador;
        const matchConv = !convenioNum || String(row['CONVENIO'] || '').trim() === convenioNum;
        const clasifValue = String(row['CLASIFICACIÓN'] || row['CLASIFICACI"N'] || '').trim();
        const matchClasif = !clasificacion || clasifValue === clasificacion;
        const matchEstado = !estado || String(row['ESTADO CONVENIO'] || '').trim() === estado;
        const matchSub = !subregion || String(row['SUBREGION'] || '').trim() === subregion;
        return matchSearch && matchVig && matchMun && matchSup && matchInd && matchConv && matchClasif && matchEstado && matchSub;
    });

    updateFilterOptions(search, vigencia, municipio, supervisor, convenioNum, clasificacion, indicador, subregion, estado);

    const summaryCard = document.getElementById('summary-card-container');
    const activeConv = document.getElementById('filter-convenio-num').value.trim();

    if (activeConv && filteredData.length > 0) {
        const selected = filteredData[0]; 
        document.getElementById('summary-num').textContent = selected['CONVENIO'] || 'S/N';
        const btnFicha = document.getElementById('btn-abrir-ficha');
        if (btnFicha) {
            btnFicha.setAttribute('onclick', `openModal(${JSON.stringify(selected).replace(/'/g, "&#39;")})`);
        }
        document.getElementById('summary-municipio').textContent = selected['MUNICIPIO'] || 'N/A';
        const ejecutorEl = document.getElementById('summary-ejecutor');
        const ejecutorContainer = document.getElementById('summary-ejecutor-container');
        const municipioStr = String(selected['MUNICIPIO'] || 'N/A').trim().toUpperCase();
        const ejecutorStr = String(selected['CONVENIANTE EJECUTOR'] || '').trim().toUpperCase();
        if (ejecutorEl && ejecutorContainer) {
            if (ejecutorStr && ejecutorStr !== municipioStr && ejecutorStr !== 'N/A') {
                ejecutorEl.textContent = selected['CONVENIANTE EJECUTOR'];
                ejecutorContainer.classList.remove('hidden');
            } else {
                ejecutorContainer.classList.add('hidden');
            }
        }
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
            document.getElementById('summary-alcance').textContent = (alcM / 1000).toFixed(2);
            document.getElementById('unit-alcance').textContent = "km";
            document.getElementById('lbl-ejecutado').textContent = "Longitud Ejecutada";
            document.getElementById('summary-ejecutado').textContent = (ejM / 1000).toFixed(2);
            document.getElementById('unit-ejecutado').textContent = "km";
        }
        const pfis = selected['FISICO_NORM'] || 0, pfin = selected['FINANCIERO_NORM'] || 0;
        document.getElementById('summary-fisico-txt').textContent = pfis.toFixed(1) + '%';
        document.getElementById('summary-financiero-txt').textContent = pfin.toFixed(1) + '%';
        
        const supervisorName = selected['SUPERVISOR'] || 'Sin Asignar';
        const supNameEl = document.getElementById('summary-supervisor-name');
        const supImgEl = document.getElementById('summary-supervisor-img');
        if (supNameEl) supNameEl.textContent = supervisorName;
        if (supImgEl) {
            supImgEl.src = `./assets/supervisor/${supervisorName}.jpg`;
        }
        
        summaryCard.classList.remove('hidden');
        setTimeout(() => {
            document.getElementById('gauge-fisico').style.strokeDashoffset = 251.2 - (251.2 * pfis / 100);
            document.getElementById('gauge-financiero').style.strokeDashoffset = 251.2 - (251.2 * pfin / 100);
        }, 50);
        setTimeout(() => { renderMap(selected, 'summary-map', 'summary-map-overlay', 'summary-map-msg', summaryMapInstance, (ni, ng) => { summaryMapInstance = ni; summaryLayerGroup = ng; }); }, 100);
        
        renderTimeline(selected);
    } else { 
        summaryCard.classList.add('hidden'); 
        const tlCont = document.getElementById('timeline-container');
        if (tlCont) tlCont.classList.add('hidden');
    }
    currentPage = 1; updateDashboard();
}

function resetFilters() {
    ['filter-search', 'filter-vigencia', 'filter-supervisor', 'filter-indicador', 'filter-municipio', 'filter-convenio-num', 'filter-clasificacion', 'filter-subregion', 'filter-estado'].forEach(id => {
        if(document.getElementById(id)) document.getElementById(id).value = '';
    });
    applyFilters();
}

function updateDashboard() { updateKPIs(); renderTable(); updateCharts(); renderAlerts(); }

function updateKPIs() {
    let activos = 0, porLiquidar = 0, sumInv = 0, sumDes = 0, sumAut = 0;
    let totLonCon = 0, totLonEje = 0, totAreCon = 0, totAreEje = 0;
    
    filteredData.forEach(r => {
        const est = String(r['ESTADO CONVENIO']).toLowerCase();
        if(est.includes('ejecuci')) activos++;  // tolera ejecucin / ejecucion
        if(est.includes('por liquidar')) porLiquidar++; 
        sumInv += (r['APORTE DEPARTAMENTO'] || 0) + (r['ADICION DEPARTAMENTO'] || 0);
        sumDes += r['VALOR TOTAL DESEMBOLSADO'] || 0;
        sumAut += r['VALOR TOTAL AUTORIZADO'] || 0;
        
        totLonCon += r['ALCANCE (M)'] || 0;
        totLonEje += r['LONGITUD EJECUTADA'] || 0;
        totAreCon += r['ALCANCE (M2)'] || 0;
        totAreEje += r['AREA EJECUTADA (M2)'] || 0;
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

        let ejecutorHTML = '';
        const municipioStrRow = String(row['MUNICIPIO'] || 'N/A').trim().toUpperCase();
        const ejecutorStrRow = String(row['CONVENIANTE EJECUTOR'] || '').trim().toUpperCase();
        if (ejecutorStrRow && ejecutorStrRow !== municipioStrRow && ejecutorStrRow !== 'N/A') {
            ejecutorHTML = `<span style="display:block;margin-top:3px;font-size:9px;font-weight:700;color:#94A3B8;text-transform:uppercase;" title="Conveniente Ejecutor"><i class="fa-solid fa-building-user" style="margin-right:3px;"></i>${row['CONVENIANTE EJECUTOR']}</span>`;
        }

        tr.innerHTML = `
            <td class="px-5 py-3">
                <div style="display:flex;align-items:center;gap:4px;">
                    <span style="font-weight:900;font-size:14px;color:#0F172A;">${row['CONVENIO'] || 'S/N'}</span>
                    ${alertIcon}
                </div>
            </td>
            <td class="px-5 py-3">
                <span class="municipio-chip">${row['MUNICIPIO'] || 'N/A'}</span>
                ${ejecutorHTML}
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
                    conv, mun
                });
            }
        }

        // 1. Riesgo de pérdida de competencia (Límite 30 meses)
        if (termDate && termDate < today) {
            const msPassed = today.getTime() - termDate.getTime();
            const monthsPassed = msPassed / (1000 * 60 * 60 * 24 * 30.436875);
            
            if (monthsPassed >= 24) {
                const limitDate = new Date(termDate);
                limitDate.setMonth(limitDate.getMonth() + 30);
                const limitStr = `${String(limitDate.getDate()).padStart(2, '0')}/${String(limitDate.getMonth() + 1).padStart(2, '0')}/${limitDate.getFullYear()}`;
                const monthsLeft = (30 - monthsPassed).toFixed(1);
                const faltanTxt = monthsLeft > 0 
                    ? `<strong style="color:#991B1B;">¡Faltan ${monthsLeft} meses!</strong>` 
                    : `<strong style="color:#7F1D1D;">¡Límite superado por ${Math.abs(monthsLeft).toFixed(1)} meses!</strong>`;
                alerts.push({
                    type: 'competencia', icon: 'fa-gavel fa-beat-fade',
                    title: 'Riesgo: Pérdida de Competencia',
                    desc: `Finalizó el ${termStr}. Límite legal: 30 meses (${limitStr}). ${faltanTxt}`,
                    conv, mun
                });
            } else {
                alerts.push({
                    type: 'vencido', icon: 'fa-calendar-xmark',
                    title: 'Vencido sin liquidar',
                    desc: `Finalizó el ${termStr} y sigue en ${est}.`,
                    conv, mun
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
                type: 'competencia', icon: 'fa-pause',
                title: 'Suspensión Prolongada',
                desc: `Acumula ${suspMeses} meses de suspensión.`,
                conv, mun
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

    const finalAlerts = currentAlertFilter === 'all' ? alerts : alerts.filter(a => a.type === currentAlertFilter);
    countSpan.textContent = finalAlerts.length;

    // Actualizar dinámicamente el contador en los botones de filtro
    const countAll = alerts.length;
    const countProximos = alerts.filter(a => a.type === 'proximos').length;
    const countCompetencia = alerts.filter(a => a.type === 'competencia').length;
    const countVencido = alerts.filter(a => a.type === 'vencido').length;

    const btnAll = document.querySelector('.alert-filter-btn[data-filter="all"]');
    const btnProximos = document.querySelector('.alert-filter-btn[data-filter="proximos"]');
    const btnCompetencia = document.querySelector('.alert-filter-btn[data-filter="competencia"]');
    const btnVencido = document.querySelector('.alert-filter-btn[data-filter="vencido"]');

    if (btnAll) btnAll.textContent = `Todas (${countAll})`;
    if (btnProximos) btnProximos.textContent = `Próximos a terminar (${countProximos})`;
    if (btnCompetencia) btnCompetencia.textContent = `Pérdida de competencia (${countCompetencia})`;
    if (btnVencido) btnVencido.textContent = `Vencidos sin liquidar (${countVencido})`;

    const navFeed = document.getElementById('nav-alerts-list');
    const navCountSpan = document.getElementById('nav-alerts-count');
    const navBadge = document.getElementById('nav-alerts-badge');

    if (navCountSpan) navCountSpan.textContent = alerts.length;
    if (navBadge) {
        if (alerts.length > 0) navBadge.classList.remove('hidden');
        else navBadge.classList.add('hidden');
    }

    window.showSummaryCard = function(conv) {
        document.getElementById('filter-convenio-num').value = conv;
        applyFilters();
        window.scrollTo({top: 0, behavior: 'smooth'});
        const drop = document.getElementById('nav-alerts-dropdown');
        if(drop) drop.classList.add('hidden');
    };

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
        proximos:    { borderColor: '#F28E18', iconColor: '#F28E18', bg: '#FFFFFF' },
        competencia: { borderColor: '#A90F09', iconColor: '#A90F09', bg: '#FFFFFF' },
        vencido:     { borderColor: '#A90F09', iconColor: '#A90F09', bg: '#FFFFFF' },
        desfase:     { borderColor: '#3561AB', iconColor: '#3561AB', bg: '#FFFFFF' }
    };

    feed.innerHTML = finalAlerts.map(a => {
        const colors = alertTypeMap[a.type] || { borderColor: '#94A3B8', iconColor: '#94A3B8', bg: '#F8FAFC' };
        return `
        <div class="alert-feed-item alert-${a.type}" onclick="showSummaryCard('${a.conv}')" style="cursor:pointer;">
            <div class="alert-item-header">
                <div class="alert-item-icon ${a.type}">
                    <i class="fa-solid ${a.icon}"></i>
                </div>
                <div style="flex:1;">
                    <h4 class="alert-item-title">${a.title}</h4>
                </div>
            </div>
            <p style="font-size:10px;font-weight:500;color:#64748B;line-height:1.5;margin-bottom:6px;">${a.desc}</p>
            <div class="alert-item-meta">
                <span class="alert-item-tag"><i class="fa-solid fa-hashtag" style="font-size:8px;"></i>${a.conv}</span>
                <span class="alert-item-tag"><i class="fa-solid fa-location-dot" style="font-size:8px;"></i>${a.mun}</span>
            </div>
        </div>`;
    }).join('');
}

window.activeFisicoMetric = 'longitud';
window.toggleFisicoMetric = function(metric) {
    window.activeFisicoMetric = metric;
    updateCharts();
};

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

        if(charts['estado']) charts['estado'].destroy();

        const centerTextPlugin = {
            id: 'centerText',
            beforeDraw: function(chart) {
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
                ctx.fillText(text2, text2X, textY - (height/8));
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
                        titleFont: {size: 11, family: 'Poppins'},
                        bodyFont: {size: 13, weight: 'bold', family: 'Poppins'},
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
                    onclick="const f=document.getElementById('filter-estado');if(f){f.value=f.value==='${label}' ?'' :'${label}';applyFilters();}">
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
    
    // Gráfico de Ejecución (Barras)
    const canvasEjecucion = document.getElementById('chart-ejecucion');
    if (canvasEjecucion) {
        window.activeFisicoMetric = window.activeFisicoMetric || 'longitud';
        
        let tCon = 0, tEje = 0;
        let metricLabel = 'Longitud (m)';
        let tooltipSuffix = ' m';
        
        if (window.activeFisicoMetric === 'longitud') {
            filteredData.forEach(r => {
                tCon += r['ALCANCE (M)'] || 0;
                tEje += r['LONGITUD EJECUTADA'] || 0;
            });
            metricLabel = 'Longitud (m)';
            tooltipSuffix = ' m';
        } else {
            filteredData.forEach(r => {
                tCon += r['ALCANCE (M2)'] || 0;
                tEje += r['AREA EJECUTADA (M2)'] || r['AREA_EJECUTADA'] || r['ÁREA EJECUTADA'] || 0;
            });
            metricLabel = 'Área (m²)';
            tooltipSuffix = ' m²';
        }
        
        const isDark = document.documentElement.classList.contains('dark');
        const textColor = isDark ? '#94a3b8' : '#64748b';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.04)';
        
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
        
        if (charts['ejecucion']) charts['ejecucion'].destroy();
        charts['ejecucion'] = new Chart(canvasEjecucion, {
            type: 'bar',
            data: {
                labels: [metricLabel],
                datasets: [
                    { label: 'Contratado', data: [tCon], backgroundColor: '#94a3b8', borderRadius: 6, barPercentage: 0.7, categoryPercentage: 0.8 },
                    { label: 'Ejecutado', data: [tEje], backgroundColor: '#018D38', borderRadius: 6, barPercentage: 0.7, categoryPercentage: 0.8 }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { 
                    legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8, font: {size: 10, family: 'Poppins'}, color: textColor } }, 
                    tooltip: {
                        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        titleColor: isDark ? '#f8fafc' : '#0f172a',
                        bodyColor: isDark ? '#cbd5e1' : '#475569',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.05)',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8,
                        titleFont: {size: 11, family: 'Poppins'},
                        bodyFont: {size: 13, weight: 'bold', family: 'Poppins'},
                        callbacks: { label: (c) => ` ${c.dataset.label}: ${formatNumber(c.raw)}${tooltipSuffix}` }
                    } 
                },
                scales: {
                    x: { grid: { display: false }, ticks: { color: textColor, font: {family: 'Poppins', weight: 'bold', size: 10} } },
                    y: { border: { display: false }, grid: { color: gridColor }, beginAtZero: true, ticks: { color: textColor, font: {family: 'Poppins', size: 10}, maxTicksLimit: 6, callback: (v) => formatNumber(v) } }
                },
                animation: { duration: 800, easing: 'easeOutQuart' }
            }
        });
    }
}

// ------ MAPA HÍBRIDO CON TOOLTIPS Y EXTRACCI�"N DE COORDENADAS ------
async function renderMap(row, mapId, overlayId, msgId, inst, cb) {
    const ov = document.getElementById(overlayId), ms = document.getElementById(msgId);
    ov.classList.remove('hidden'); ms.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Trazando Geometría...';
    
    let m = inst, g = null;
    if(!m){ 
        m = L.map(mapId, { zoomControl: false, attributionControl: false, preferCanvas: false }).setView([6.2, -75.5], 10); 
        L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { maxZoom: 22, maxNativeZoom: 20 }).addTo(m);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png', { maxZoom: 22, maxNativeZoom: 19, subdomains: 'abcd' }).addTo(m);
        L.control.zoom({ position: 'bottomright' }).addTo(m);
        g = L.layerGroup().addTo(m); 
        m._currentLayerGroup = g;
        cb(m, g);
    } else { 
        g = m._currentLayerGroup;
        if (g) {
            g.clearLayers();
        } else {
            m.eachLayer(l => { if(l instanceof L.LayerGroup && !(l instanceof L.FeatureGroup)) { g = l; } });
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
                pointToLayer: (f, ll) => L.circleMarker(ll, { radius: 6, fillColor: "#A90F09", color: "#fff", weight: 2, fillOpacity: 0.8 }),
                onEachFeature: onEachFeat
            });
            g.addLayer(l); b = l.getBounds(); ok = true;
        }
    } catch(e){}

    if(!ok && typeof omnivore !== 'undefined'){
        ok = await new Promise(res => {
            const customLayer = L.geoJSON(null, {
                style: tramoStyle,
                pointToLayer: (f, ll) => L.circleMarker(ll, { radius: 6, fillColor: "#A90F09", color: "#fff", weight: 2, fillOpacity: 0.8 }),
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

    if(ok) {
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
    
    // Configurar enlace del PDF
    document.getElementById('btn-open-source-pdf').href = `./assets/pdfs/${String(row['CONVENIO']).trim()}.pdf`;
    
    document.getElementById('mod-objeto').textContent = row['OBJETO'] || 'Sin descripción u objeto definido.';
    
    document.getElementById('mod-via').textContent = row['VIA_PRIORIZADA'];
    document.getElementById('mod-alcance').textContent = `${formatNumber(row['ALCANCE (M)'])} m / ${formatNumber(row['ALCANCE (M2)'])} m²`;
    document.getElementById('mod-ejecutado-areas').textContent = `${formatNumber(row['LONGITUD EJECUTADA'])} m / ${formatNumber(row['AREA EJECUTADA (M2)'])} m²`;

    document.getElementById('mod-valor-total').textContent = formatCurrency(row['VALOR TOTAL']);
    document.getElementById('mod-aporte-depto').textContent = formatCurrency(row['APORTE DEPARTAMENTO']);
    document.getElementById('mod-aporte-mun').textContent = formatCurrency(row['APORTE MUNICIPIO']);
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

    document.getElementById('modal-detalle').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => { 
        renderMap(row, 'map', 'map-overlay', 'map-msg', mapInstance, (ni, ng) => { 
            mapInstance = ni; currentLayerGroup = ng; 
        }); 
    }, 250);

    const emp = document.getElementById('mod-galeria-empty');
    const galAntes = document.getElementById('mod-galeria-antes');
    const galDespues = document.getElementById('mod-galeria-despues');
    if (galAntes) galAntes.innerHTML = '';
    if (galDespues) galDespues.innerHTML = '';
    emp.classList.add('hidden'); currentGalleryImages = [];
    const n = String(row['CONVENIO']).trim();

    const loadImages = (folder, container) => {
        if (!container) return;
        for(let i=1; i<=8; i++){
            const img = document.createElement('img');
            img.src = `./assets/fotos/${n}/${folder}/${i}.jpg`;
            img.className = 'w-full h-24 object-cover rounded-lg cursor-pointer hover:ring-2 hover:ring-institutional-light transition-all shadow-sm';
            img.onerror = () => img.remove();
            img.onload = () => { 
                img.onclick = () => { 
                    currentGalleryImages = Array.from(document.querySelectorAll('#mod-galeria img')).map(e => e.src); 
                    openLightbox(currentGalleryImages.indexOf(img.src)); 
                }; 
                container.appendChild(img); 
            };
        }
    };

    loadImages('antes', galAntes);
    loadImages('despues', galDespues);

    setTimeout(() => { 
        const totalImgs = document.querySelectorAll('#mod-galeria img').length;
        if(totalImgs === 0) {
            emp.classList.remove('hidden'); 
        }
        
        if (galAntes && galAntes.querySelectorAll('img').length === 0 && galAntes.parentElement) galAntes.parentElement.classList.add('hidden');
        else if (galAntes && galAntes.parentElement) galAntes.parentElement.classList.remove('hidden');

        if (galDespues && galDespues.querySelectorAll('img').length === 0 && galDespues.parentElement) galDespues.parentElement.classList.add('hidden');
        else if (galDespues && galDespues.parentElement) galDespues.parentElement.classList.remove('hidden');
    }, 600);
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
    municipios:   true,
    subregiones:  true,
    primaria:     true,
    secundaria:   true,
    terciaria:    true,
    tramosKml:    true,
    terrain:      true
};

// Colores simbología
const ML_COLORS = {
    kml:        '#0066FF',    // Azul eléctrico — convenios (prioridad 1)
    primaria:   '#e53e3e',    // Rojo — vías primarias
    secundaria: '#38a169',    // Verde — vías secundarias
    terciaria_municipal: '#d69e2e', // Amarillo — terciaria municipal
    terciaria_invias:    '#ed8936', // Naranja — terciaria INVIAS
    municipios_fill:  'transparent',
    municipios_line:  '#94a3b8',
    sub_colors: {
        'VALLE DE ABURRÁ': '#c68664', 'VALLE DE ABURRA': '#c68664',
        'ORIENTE':         '#ffb74d',
        'NORDESTE':        '#fefb9e',
        'NORTE':           '#faa4b1',
        'OCCIDENTE':       '#ffee55',
        'SUROESTE':        '#df9ae1',
        'URABÁ':           '#a2d984', 'URABA': '#a2d984',
        'BAJO CAUCA':      '#dca2e8',
        'MAGDALENA MEDIO': '#ffa1a1',
        'OTRAS':           '#e2e8f0'
    }
};

// ── Helper: construye HTML del popup ──────────────────────────────────────────
function buildMLPopupHTML(props, headerColor, badgeText, titleText, showFichaBtn, rowData) {
    const skip = new Set(['styleUrl','visibility','name','Name','NAME','description','Description','FolderName']);
    const rows = Object.entries(props || {})
        .filter(([k, v]) => !skip.has(k) && v !== null && v !== undefined && String(v).trim() !== '')
        .map(([k, v]) => `<tr><td>${k}</td><td>${String(v)}</td></tr>`)
        .join('');

    const table = rows
        ? `<table class="ml-popup-table">${rows}</table>`
        : `<p style="font-size:10px;color:#94a3b8;font-style:italic;padding:4px 0">Sin atributos disponibles.</p>`;

    const fichaBtn = showFichaBtn && rowData
        ? `<button class="ml-popup-action-btn" onclick="(function(){document.querySelector('.maplibregl-popup-close-button')?.click();openModal(${JSON.stringify(rowData).replace(/"/g,"'")})})()">
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
            center: [-75.5, 6.55],
            zoom: 7.2,
            pitch: 30,
            bearing: 0,
            maxZoom: 18,
            minZoom: 5,
            attributionControl: false
        });

        mlMap.setStyle('https://tiles.openfreemap.org/styles/bright', {
            transformStyle: (previousStyle, nextStyle) => {
                nextStyle.projection = {type: 'globe'};
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
                nextStyle.terrain = {
                    source: 'terrainSource',
                    exaggeration: 1
                };

                nextStyle.sky = {
                    'atmosphere-blend': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        0, 1,
                        2, 0
                    ],
                };

                nextStyle.layers.push({
                    id: 'hills',
                    type: 'hillshade',
                    source: 'hillshadeSource',
                    layout: { visibility: 'visible' },
                    paint: { 'hillshade-shadow-color': '#473B24' }
                });

                const firstNonFillLayer = nextStyle.layers.find(layer => layer.type !== 'fill' && layer.type !== 'background');
                nextStyle.layers.splice(nextStyle.layers.indexOf(firstNonFillLayer), 0, {
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


                    mlMap.addSource('municipios-src', { type: 'geojson', data: mpioData });
                    mlMpioData = mpioData;

                    // Capa: relleno por subregión
                    mlMap.addLayer({
                        id: 'subregiones-fill',
                        type: 'fill',
                        source: 'municipios-src',
                        layout: { visibility: 'visible' },
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
                            'fill-opacity': 0.5
                        }
                    });

                    // Capa: contorno municipios
                    mlMap.addLayer({
                        id: 'municipios-line',
                        type: 'line',
                        source: 'municipios-src',
                        layout: { visibility: 'visible' },
                        paint: {
                            'line-color': '#94a3b8',
                            'line-width': 0.4,
                            'line-opacity': 0.7
                        }
                    });

                    // Capa: contorno subregiones (líneas negras gruesas)
                    // Se implementa con una expresión de agrupación por subregión
                    mlMap.addLayer({
                        id: 'subregiones-line',
                        type: 'line',
                        source: 'municipios-src',
                        layout: { visibility: 'visible' },
                        paint: {
                            'line-color': '#374151',
                            'line-width': [
                                'interpolate', ['linear'], ['zoom'],
                                5, 0.8,
                                8, 1.6,
                                12, 2.5
                            ],
                            'line-opacity': 0.65
                        }
                    });

                    // Capa: hover subregiones
                    mlMap.addLayer({
                        id: 'subregiones-fill-hover',
                        type: 'fill',
                        source: 'municipios-src',
                        layout: { visibility: 'visible' },
                        paint: {
                            'fill-color': ['case', ['boolean', ['feature-state', 'blink'], false], '#ffee55', '#3561AB'],
                            'fill-opacity': ['case',
                                ['boolean', ['feature-state', 'blink'], false], 0.65,
                                ['boolean', ['feature-state', 'hover'], false], 0.25,
                                0
                            ]
                        }
                    });

                    // Etiquetas de municipios
                    mlMap.addLayer({
                        id: 'municipios-labels',
                        type: 'symbol',
                        source: 'municipios-src',
                        minzoom: 9,
                        layout: {
                            visibility: 'visible',
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
            await loadVialSource('primaria',   './data/Primaria.geojson',   ML_COLORS.primaria,   3, 6);
            await loadVialSource('secundaria', './data/Secundaria.geojson', ML_COLORS.secundaria, 2.5, 7);
            await loadVialSource('terciaria',  './data/Terciaria.geojson',  ML_COLORS.terciaria_municipal, 2, 8);

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
        ['vigencia','supervisor','indicador','clasificacion','municipio','subregion','estado','convenio-num'].forEach(f => {
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
    ['map-filter-search','map-filter-vigencia','map-filter-supervisor','map-filter-indicador','map-filter-clasificacion',
     'map-filter-municipio','map-filter-subregion','map-filter-estado','map-filter-convenio-num'].forEach(id => {
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
        municipios:  ['municipios-line', 'municipios-labels'],
        subregiones: ['subregiones-fill', 'subregiones-line', 'subregiones-fill-hover'],
        primaria:    ['vial-primaria-glow', 'vial-primaria', 'vial-primaria-hover'],
        secundaria:  ['vial-secundaria', 'vial-secundaria-hover'],
        terciaria:   ['vial-terciaria', 'vial-terciaria-hover'],
        tramosKml:   ['kml-convenios-glow', 'kml-convenios', 'kml-convenios-hover']
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
        'layer-chk-municipios':  'municipios',
        'layer-chk-subregiones': 'subregiones',
        'layer-chk-primaria':    'primaria',
        'layer-chk-secundaria':  'secundaria',
        'layer-chk-terciaria':   'terciaria',
        'layer-chk-tramosKml':   'tramosKml',
        'layer-chk-terrain':     'terrain'
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

        // Intentar GeoJSON primero
        try {
            const r = await fetch(`./assets/mapas/${num}.geojson`);
            if (r.ok) {
                const d = await r.json();
                const feats = d.features || [d];
                feats.forEach(f => {
                    if (f && f.geometry) {
                        f.properties = f.properties || {};
                        f.properties.CONVENIO = num;
                        f.properties._estado = sysState.label;
                        f.properties._color  = sysState.hex;
                        allFeatures.push(f);
                    }
                });
                return;
            }
        } catch (e) {}

        // Intentar KML via omnivore (Leaflet helper) — parsear a GeoJSON
        if (typeof omnivore !== 'undefined') {
            try {
                await new Promise((res) => {
                    const cl = L.geoJSON(null);
                    omnivore.kml(`./assets/mapas/${num}.kml`, null, cl)
                        .on('ready', () => {
                            const gj = cl.toGeoJSON();
                            const feats = gj.features || [];
                            feats.forEach(f => {
                                if (f && f.geometry) {
                                    f.properties = f.properties || {};
                                    f.properties.CONVENIO = num;
                                    f.properties._estado = sysState.label;
                                    f.properties._color  = sysState.hex;
                                    allFeatures.push(f);
                                }
                            });
                            res();
                        })
                        .on('error', () => res());
                });
                return;
            } catch (e) {}
        }

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
    const search      = document.getElementById('map-filter-search')?.value.toLowerCase().trim() || '';
    const vigencia    = document.getElementById('map-filter-vigencia')?.value.trim() || '';
    const municipio   = document.getElementById('map-filter-municipio')?.value.trim() || '';
    const supervisor  = document.getElementById('map-filter-supervisor')?.value.trim() || '';
    const clasificacion = document.getElementById('map-filter-clasificacion')?.value.trim() || '';
    const subregion   = document.getElementById('map-filter-subregion')?.value.trim() || '';
    const estado      = document.getElementById('map-filter-estado')?.value.trim() || '';
    const convenioNum = document.getElementById('map-filter-convenio-num')?.value.trim() || '';
    const indicador   = document.getElementById('map-filter-indicador')?.value.trim() || '';

    currentMapData = rawData.filter(row => {
        const rowValsStr = Object.values(row).map(v => String(v || '').toLowerCase()).join(' ');
        const matchSearch    = !search      || rowValsStr.includes(search);
        const matchVig       = !vigencia    || String(row['VIGENCIA'] || '').trim() === vigencia;
        const matchMun       = !municipio   || String(row['MUNICIPIO'] || '').trim() === municipio;
        const matchSup       = !supervisor  || String(row['SUPERVISOR'] || '').trim() === supervisor;
        const matchClasif    = !clasificacion || String(row['CLASIFICACIÓN'] || row['CLASIFICACI"N'] || '').trim() === clasificacion;
        const matchSub       = !subregion   || String(row['SUBREGION'] || '').trim() === subregion;
        const matchEstado    = !estado      || String(row['ESTADO CONVENIO'] || '').trim() === estado;
        const matchConv      = !convenioNum || String(row['CONVENIO'] || '').trim() === convenioNum;
        const matchInd       = !indicador   || String(row['INDICADOR'] || '').trim() === indicador;
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
            const matchVig    = exclude === 'VIGENCIA'         ? true : (!cVig  || String(row['VIGENCIA']).trim() === cVig);
            const matchMun    = exclude === 'MUNICIPIO'        ? true : (!cMun  || String(row['MUNICIPIO'] || '').trim() === cMun);
            const matchSup    = exclude === 'SUPERVISOR'       ? true : (!cSup  || String(row['SUPERVISOR'] || '').trim() === cSup);
            const matchClas   = exclude === 'CLASIFICACIÓN'    ? true : (!cClas || String(row['CLASIFICACIÓN'] || row['CLASIFICACI"N'] || '').trim() === cClas);
            const matchSub    = exclude === 'SUBREGION'        ? true : (!cSub  || String(row['SUBREGION'] || '').trim() === cSub);
            const matchEst    = exclude === 'ESTADO CONVENIO'  ? true : (!cEst  || String(row['ESTADO CONVENIO'] || '').trim() === cEst);
            const matchConv   = exclude === 'CONVENIO'         ? true : (!cConv || String(row['CONVENIO'] || '').trim() === cConv);
            const matchInd    = exclude === 'INDICADOR'        ? true : (!cInd  || String(row['INDICADOR'] || '').trim() === cInd);
            return matchSearch && matchVig && matchMun && matchSup && matchClas && matchSub && matchEst && matchConv && matchInd;
        });
        return [...new Set(valid.map(i => {
            if (field === 'CLASIFICACIÓN') return String(i['CLASIFICACIÓN'] || i['CLASIFICACI"N'] || '').trim();
            return String(i[field] || '').trim();
        }).filter(Boolean))].sort();
    };

    const upd = (id, options, current) => {
        const el = document.getElementById(id);
        if (!el) return;
        const finalVal = options.includes(current) ? current : '';
        el.innerHTML = '<option value="">Todos</option>' + options.map(v => `<option value="${v}">${v}</option>`).join('');
        el.value = finalVal;
    };

    upd('map-filter-vigencia',     getValid('VIGENCIA', 'VIGENCIA').reverse(), cVig);
    upd('map-filter-supervisor',   getValid('SUPERVISOR', 'SUPERVISOR'), cSup);
    upd('map-filter-indicador',    getValid('INDICADOR', 'INDICADOR'), cInd);
    upd('map-filter-clasificacion',getValid('CLASIFICACIÓN', 'CLASIFICACIÓN'), cClas);
    upd('map-filter-municipio',    getValid('MUNICIPIO', 'MUNICIPIO'), cMun);
    upd('map-filter-subregion',    getValid('SUBREGION', 'SUBREGION'), cSub);
    upd('map-filter-estado',       getValid('ESTADO CONVENIO', 'ESTADO CONVENIO'), cEst);
    upd('map-filter-convenio-num', getValid('CONVENIO', 'CONVENIO'), cConv);
}

function updateMapKPIs() {
    const numMun = new Set(currentMapData.map(r => String(r['MUNICIPIO']).trim())).size;
    const numSub = new Set(currentMapData.map(r => String(r['SUBREGION']).trim())).size;
    let act = 0, kmEjecutados = 0, kmContratados = 0, areaEjecutada = 0, areaContratada = 0, inv = 0;
    currentMapData.forEach(r => {
        const est = String(r['ESTADO CONVENIO'] || '').toUpperCase();
        if (est.includes('EJECUCI')) act++;
        kmEjecutados  += (r['LONGITUD EJECUTADA'] || 0) / 1000;
        kmContratados += (r['ALCANCE (M)'] || 0) / 1000;
        areaEjecutada  += (r['AREA EJECUTADA (M2)'] || 0);
        areaContratada += (r['ALCANCE (M2)'] || 0);
        inv  += (r['APORTE DEPARTAMENTO'] || 0) + (r['ADICION DEPARTAMENTO'] || 0);
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
    const acKpi= document.getElementById('kpi-map-activos');
    if (acKpi) acKpi.textContent = act;

    updateMapCharts();
}

function updateMapCharts() {
    const subL = {}, subI = {}, munL = {}, munI = {};
    currentMapData.forEach(r => {
        const s = r['SUBREGION'] || 'OTRAS';
        const m = r['MUNICIPIO'] || 'N/A';
        const l = mapMetric === 'contratado' ? (r['ALCANCE (M)'] || 0) : (r['LONGITUD EJECUTADA'] || 0);
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
                        titleFont: {size: 11, family: 'Poppins'},
                        bodyFont: {size: 13, weight: 'bold', family: 'Poppins'},
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

    drawChart('chart-sub-long',     'bar', sL, v => formatNumber(v) + ' m', '#018D38');
    drawChart('chart-sub-inv',      'bar', sI, v => formatCurrency(v),       '#3561AB');
    drawChart('chart-top-mun-long', 'bar', mL, v => formatNumber(v) + ' m', '#018D38');
    drawChart('chart-top-mun-inv',  'bar', mI, v => formatCurrency(v),       '#3561AB');
}

window.setMapMetric = function(val) {
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
    "AEROPUERTOS O AERÓDROMOS MEJORADOS Y EN OPERACIÓN": { meta: 15,     unit: "und",   tipo: "und" },
    "MUELLES O EMBARCADEROS MEJORADOS":                  { meta: 4,      unit: "und",   tipo: "und" },
    "VÍAS TERCIARIAS MEJORADAS. (RVT)":                  { meta: 500,    unit: "km",    tipo: "km"  },
    "ESPACIO PUBLICO":                                   { meta: 20000,  unit: "m²",    tipo: "m2"  },
    "CABLES AÉREOS SOSTENIBLES CONSTRUIDOS Y OPERANDO":  { meta: 3,      unit: "und",   tipo: "und" },
    "VÍA URBANA MEJORADA. (RVU)":                        { meta: 30,     unit: "km",    tipo: "km"  }
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
    if (i.includes("AEROPUERTO") || i.includes("AERODROMO") || i.includes("AERODROMO")) return "AEROPUERTOS O AER\u00d3DROMOS MEJORADOS Y EN OPERACI\u00d3N";
    // Muelles / Embarcaderos
    if (i.includes("MUELLE") || i.includes("EMBARCADERO")) return "MUELLES O EMBARCADEROS MEJORADOS";
    // Vías Terciarias (RVT) — cualquier combinación que mencione "TERCIARIA"
    if (i.includes("TERCIARIA") || i.includes("RVT")) return "V\u00cdAS TERCIARIAS MEJORADAS. (RVT)";
    // Espacio Público
    if (i.includes("ESPACIO") && i.includes("PUBLI")) return "ESPACIO PUBLICO";
    if (i.includes("ESPACIO PUBLICO")) return "ESPACIO PUBLICO";
    // Cables aéreos
    if (i.includes("CABLE")) return "CABLES A\u00c9REOS SOSTENIBLES CONSTRUIDOS Y OPERANDO";
    // Vía Urbana (RVU)
    if (i.includes("URBANA") || i.includes("RVU")) return "V\u00cdA URBANA MEJORADA. (RVU)";
    return ""; // No mapeado
}

window.setPlanMetric = function(val) {
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

window.setPlanAnualFilter = function(val) {
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

window.setPlanAnualMetric = function(val) {
    if (val === 'longitud') {
        window.setPlanAnualFilter('todos-km');
    } else {
        window.setPlanAnualFilter('todos-m2');
    }
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
            const metros = planMetric === 'contratado' ? parseNum(row['ALCANCE (M)']) : parseNum(row['LONGITUD EJECUTADA']);
            cant = metros / 1000;
        } else if (cfg.tipo === 'm2') {
            cant = planMetric === 'contratado' ? parseNum(row['ALCANCE (M2)']) : parseNum(row['AREA EJECUTADA (M2)']);
        } else {
            if (planMetric === 'contratado') {
                cant = 1;
            } else {
                const estado = String(row['ESTADO CONVENIO'] || '').toUpperCase();
                const tieneEjecucion = estado.includes('EJECUCI') || estado.includes('EJECUT') ||
                                       estado.includes('OPERA') || estado.includes('MEJORAD') ||
                                       parseNum(row['LONGITUD EJECUTADA']) > 0 ||
                                       parseNum(row['FISICO_NORM']) > 0;
                cant = tieneEjecucion ? 1 : 0;
            }
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
    const chartMetasPcts = [];
    const chartMetasColors = [];
    const chartMetasRawInfo = [];

    const labelMetasMetric = planMetric === 'contratado' ? 'Contratado' : 'Ejecutado';

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

        let displayName = ind;
        if (ind.includes("AEROPUERTOS")) displayName = "Aeropuertos/Aeródromos";
        else if (ind.includes("MUELLES")) displayName = "Muelles/Embarcaderos";
        else if (ind.includes("TERCIARIAS")) displayName = "Vías Terciarias (RVT)";
        else if (ind.includes("ESPACIO")) displayName = "Espacio Público";
        else if (ind.includes("CABLES")) displayName = "Cables Aéreos";
        else if (ind.includes("URBANA")) displayName = "Vía Urbana (RVU)";

        chartMetasLabels.push(displayName);
        chartMetasPcts.push(parseFloat(pct.toFixed(1)));
        chartMetasRawInfo.push({
            achieved: e,
            target: meta,
            unit: cfg.unit
        });

        let colorClass = 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
        let barColor = 'bg-red-500';
        let bgClass = 'bg-red-50/60 dark:bg-red-900/10';
        let chartColor = 'rgba(239, 68, 68, 0.85)';
        
        if (pct >= 80)  { 
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

        const pctCls = pct >= 80 ? 'cumplida' : pct >= 50 ? 'proceso' : 'riesgo';
        container.innerHTML += `
            <div class="meta-card meta-${pctCls}">
                <div class="meta-card-header">
                    <h4 class="meta-card-title">${ind}</h4>
                    <span class="meta-pct-badge ${pctCls}">${pct.toFixed(1)}%</span>
                </div>
                <div class="meta-progress-track">
                    <div class="meta-progress-fill ${pctCls}" style="width:${Math.min(pct, 100)}%"></div>
                </div>
                <div class="meta-card-footer">
                    <div style="display:flex;gap:12px;">
                        <div>
                            <p style="font-size:8px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:2px;">Meta</p>
                            <p style="font-size:12px;font-weight:800;color:#0F172A;">${fmtVal(meta)}</p>
                        </div>
                        <div>
                            <p style="font-size:8px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:2px;">${labelMetasMetric}</p>
                            <p style="font-size:12px;font-weight:800;color:#0B5640;">${fmtVal(e)}</p>
                        </div>
                        <div>
                            <p style="font-size:8px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:2px;">Restante</p>
                            <p style="font-size:12px;font-weight:800;color:#A90F09;">${fmtVal(restante)}</p>
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
                    titleFont: {size: 11, family: 'Poppins'},
                    bodyFont: {size: 12, family: 'Poppins'},
                    callbacks: {
                        label: function(context) {
                            const index = context.dataIndex;
                            const info = chartMetasRawInfo[index];
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
                        callback: function(value) { return value + '%'; }
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

    // === 2. GRÁFICO DE AVANCE ACUMULADO POR AÑO (Optimizado con curvas y gradiente) ===
    if (charts['plan-anual']) charts['plan-anual'].destroy();
    
    const years = Object.keys(avancePorAnio);
    const yearlyRaw = Object.values(avancePorAnio);
    const yearlyAccumulated = [];
    let accum = 0;
    for (let idx = 0; idx < yearlyRaw.length; idx++) {
        accum += yearlyRaw[idx];
        yearlyAccumulated.push(parseFloat(accum.toFixed(2)));
    }

    let labelAnualMetric = '';
    let unitAnual = '';
    let mainColor = '#0B5640'; // Default institutional green

    if (planAnualFilter === 'todos-km') {
        labelAnualMetric = 'Longitud Acumulada (km)';
        unitAnual = 'km';
        mainColor = '#0B5640';
    } else if (planAnualFilter === 'todos-m2') {
        labelAnualMetric = 'Área Acumulada (m²)';
        unitAnual = 'm²';
        mainColor = '#018D38';
    } else {
        const cfg = indicadoresEstrategicos[planAnualFilter];
        unitAnual = cfg ? cfg.unit : 'und';
        labelAnualMetric = `${planAnualFilter} (${unitAnual})`;
        if (cfg && cfg.tipo === 'km') {
            mainColor = '#0B5640';
        } else if (cfg && cfg.tipo === 'm2') {
            mainColor = '#018D38';
        } else {
            mainColor = '#3561AB'; // Blue for units
        }
    }

    const canvasAnual = document.getElementById('chart-plan-anual');
    const ctxAnual = canvasAnual.getContext('2d');
    
    // Hex to RGBA helpers for gradients
    let startGrad = 'rgba(11, 86, 64, 0.35)'; // Verde Oscuro
    let endGrad = 'rgba(11, 86, 64, 0.0)';
    if (mainColor === '#018D38') {
        startGrad = 'rgba(1, 141, 56, 0.35)';
    } else if (mainColor === '#3561AB') {
        startGrad = 'rgba(53, 97, 171, 0.35)';
    }

    const gradient = ctxAnual.createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, startGrad);
    gradient.addColorStop(1, endGrad);

    // Label last year as projection
    const yearsLabels = years.map(y => y === "2027" ? "2027 (Proyección)" : y);

    charts['plan-anual'] = new Chart(canvasAnual, {
        type: 'line',
        data: {
            labels: yearsLabels,
            datasets: [{
                label: labelAnualMetric,
                data: yearlyAccumulated,
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
                    titleFont: {size: 11, family: 'Poppins'},
                    bodyFont: {size: 13, weight: 'bold', family: 'Poppins'},
                    callbacks: {
                        label: function(context) {
                            const valFmt = unitAnual === 'm²' ? formatNumber(Math.round(context.raw)) : context.raw;
                            return ` ${context.dataset.label}: ${valFmt} ${unitAnual}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: gridColor },
                    ticks: {
                        color: textColor,
                        font: { size: 9, family: 'Poppins' },
                        callback: function(value) {
                            return unitAnual === 'm²' ? formatNumber(value) + ' m²' : (unitAnual === 'km' ? value + ' km' : value + ' und');
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


