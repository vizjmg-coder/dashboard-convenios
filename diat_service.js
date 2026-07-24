/**
 * DIATDataService - Capa de servicios para la administración de datos del Portal de Supervisores
 * Diseñado para desacoplar el frontend del almacenamiento físico (Excel / Google Sheets / Base de datos)
 */
class DIATDataService {
    static getChanges() {
        try {
            return JSON.parse(localStorage.getItem('diat_convenio_changes')) || {};
        } catch (e) {
            return {};
        }
    }

    static saveChanges(changes) {
        localStorage.setItem('diat_convenio_changes', JSON.stringify(changes));
    }

    static getTechnicalVisits() {
        try {
            return JSON.parse(localStorage.getItem('diat_technical_visits')) || [];
        } catch (e) {
            return [];
        }
    }

    static saveTechnicalVisits(visits) {
        localStorage.setItem('diat_technical_visits', JSON.stringify(visits));
    }

    static getChangeHistory() {
        try {
            return JSON.parse(localStorage.getItem('diat_change_history')) || [];
        } catch (e) {
            return [];
        }
    }

    static saveChangeHistory(history) {
        localStorage.setItem('diat_change_history', JSON.stringify(history));
    }

    /**
     * Une los datos maestros provenientes del Excel con los cambios locales almacenados en localStorage
     * @param {Array} baseRows Datos leídos directamente desde el Excel
     */
    static mergeData(baseRows) {
        const changes = this.getChanges();
        let changesUpdated = false;

        // Limpiar overrides locales que coinciden con los datos maestros (self-healing)
        baseRows.forEach(row => {
            const id = String(row['CONVENIO']).trim();
            if (changes[id]) {
                Object.keys(changes[id]).forEach(field => {
                    const baseVal = row[field];
                    const overrideVal = changes[id][field];
                    
                    if (baseVal !== undefined) {
                        let match = false;
                        if (typeof overrideVal === 'number' || typeof baseVal === 'number') {
                            const numBase = parseFloat(baseVal) || 0;
                            const numOverride = parseFloat(overrideVal) || 0;
                            match = (Math.abs(numBase - numOverride) < 0.01);
                        } else {
                            match = (String(baseVal).trim().toLowerCase() === String(overrideVal).trim().toLowerCase());
                        }

                        if (match) {
                            delete changes[id][field];
                            changesUpdated = true;
                        }
                    }
                });

                if (Object.keys(changes[id]).length === 0) {
                    delete changes[id];
                    changesUpdated = true;
                }
            }
        });

        if (changesUpdated) {
            this.saveChanges(changes);
        }

        return baseRows.map(row => {
            const id = String(row['CONVENIO']).trim();
            if (changes[id]) {
                const mergedRow = { ...row };
                
                // Mezclar todos los campos locales actualizados
                Object.keys(changes[id]).forEach(field => {
                    mergedRow[field] = changes[id][field];
                });

                // Mapear campos con nombres alternativos utilizados en el frontend
                if (changes[id]['LONGITUD EJECUTADA CUATRENIO(m)'] !== undefined) {
                    mergedRow['LONGITUD EJECUTADA CUATRENIO'] = parseFloat(changes[id]['LONGITUD EJECUTADA CUATRENIO(m)']) || 0;
                }
                if (changes[id]['AREA EJECUTADA CUATRENIO (m2)'] !== undefined) {
                    mergedRow['AREA EJECUTADA CUATRENIO (M2)'] = parseFloat(changes[id]['AREA EJECUTADA CUATRENIO (m2)']) || 0;
                }
                if (changes[id]['LONGITUD EJECUTADA (m)'] !== undefined) {
                    mergedRow['LONGITUD EJECUTADA'] = parseFloat(changes[id]['LONGITUD EJECUTADA (m)']) || 0;
                }
                if (changes[id]['AREA EJECUTADA (m2)'] !== undefined) {
                    mergedRow['AREA EJECUTADA (M2)'] = parseFloat(changes[id]['AREA EJECUTADA (m2)']) || 0;
                }

                // Recalcular avances físicos y financieros para que el frontend los muestre actualizados
                const v = parseInt(mergedRow['VIGENCIA'], 10);
                const isAnterior = !isNaN(v) && v < 2024;
                const alcanceM = isAnterior ? 0 : (parseFloat(mergedRow['ALCANCE (m)'] || mergedRow['ALCANCE (M)']) || 0);
                const alcanceM2 = isAnterior ? 0 : (parseFloat(mergedRow['ALCANCE (m2)'] || mergedRow['ALCANCE (M2)']) || 0);
                const longitud = isAnterior ? (parseFloat(mergedRow['LONGITUD EJECUTADA CUATRENIO']) || 0) : (parseFloat(mergedRow['LONGITUD EJECUTADA']) || 0);
                const area = isAnterior ? (parseFloat(mergedRow['AREA EJECUTADA CUATRENIO (M2)']) || 0) : (parseFloat(mergedRow['AREA EJECUTADA (M2)']) || 0);

                let pfis = 0;
                if (alcanceM > 0) {
                    pfis = (longitud / alcanceM) * 100;
                } else if (alcanceM2 > 0) {
                    pfis = (area / alcanceM2) * 100;
                }
                mergedRow['FISICO_NORM'] = pfis;
                mergedRow['% EJECUCIÓN FÍSICA'] = pfis / 100;

                const desembolsado = parseFloat(mergedRow['VALOR TOTAL DESEMBOLSADO']) || 0;
                const adeudado = parseFloat(mergedRow['VALOR TOTAL AUTORIZADO DEPARTAMENTO']) || 0;

                let pfin = 0;
                if (desembolsado > 0) {
                    pfin = (adeudado / desembolsado) * 100;
                }
                mergedRow['FINANCIERO_NORM'] = pfin;
                mergedRow['% EJECUCIÓN FINANCIERA (RECURSOS DEPARTAMENTO)'] = pfin / 100;

                return mergedRow;
            }
            return row;
        });
    }

    /**
     * Guarda la actualización de un convenio y registra los logs correspondientes en el historial
     */
    static async saveConvenioUpdate(username, convenioId, updatedFields, originalRow) {
        const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwXBFslIOCwVCyAae8-FG0VL5pqotLkjejwJhavm5xoGU4SlyVETwRkGCmDNVkcRPw4/exec";
        let isSuccess = false;

        try {
            // Intento 1: Petición estándar CORS para obtener respuesta de éxito/error estructurada
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "text/plain"
                },
                body: JSON.stringify({
                    convenioId: convenioId,
                    updatedFields: updatedFields
                })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    isSuccess = true;
                } else {
                    throw new Error(result.error || "Error reportado por Apps Script");
                }
            } else {
                throw new Error(`Servidor retornó código ${response.status}`);
            }
        } catch (corsError) {
            if (corsError instanceof TypeError) {
                console.warn("Fallo en intento principal (posible bloqueo CORS o falta de nueva publicación de Apps Script). Reintentando en modo de compatibilidad sin CORS...", corsError);
                
                try {
                    // Intento 2: Modo no-cors (Modo compatible de una vía).
                    // Envía la petición HTTP de forma segura a Google pero no lee la respuesta, evitando bloqueos de CORS del navegador.
                    await fetch(GOOGLE_SCRIPT_URL, {
                        method: "POST",
                        mode: "no-cors",
                        headers: {
                            "Content-Type": "text/plain"
                        },
                        body: JSON.stringify({
                            convenioId: convenioId,
                            updatedFields: updatedFields
                        })
                    });
                    
                    // En modo no-cors no podemos validar la respuesta, por lo que asumimos que se envió correctamente
                    isSuccess = true;
                } catch (fallbackError) {
                    console.error("Fallo definitivo de red al sincronizar con Google Sheets:", fallbackError);
                    alert("Error crítico de red al sincronizar con Google Sheets. Verifica tu conexión.");
                    return false;
                }
            } else {
                console.error("Error devuelto por la ejecución del script:", corsError);
                alert("Error al actualizar convenio: " + corsError.message);
                return false;
            }
        }

        if (isSuccess) {
            // Registrar localmente para auditoría e historial del supervisor
            const changes = this.getChanges();
            if (!changes[convenioId]) {
                changes[convenioId] = {};
            }
            
            const history = this.getChangeHistory();
            const now = new Date();
            const fecha = now.toLocaleDateString('es-CO');
            const hora = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

            Object.keys(updatedFields).forEach(field => {
                const oldVal = originalRow[field] !== undefined ? originalRow[field] : '';
                const newVal = updatedFields[field];

                if (String(oldVal) !== String(newVal)) {
                    changes[convenioId][field] = newVal;
                    history.unshift({
                        usuario: username,
                        fecha: fecha,
                        hora: hora,
                        convenio: convenioId,
                        campo: field,
                        valorAnterior: String(oldVal),
                        valorNew: String(newVal)
                    });
                }
            });

            this.saveChanges(changes);
            this.saveChangeHistory(history);
            return true;
        }
        
        return false;
    }

    /**
     * Sincroniza las visitas técnicas registradas desde el archivo visitas.json de Google Drive
     */
    static async syncTechnicalVisitsFromServer() {
        const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwXBFslIOCwVCyAae8-FG0VL5pqotLkjejwJhavm5xoGU4SlyVETwRkGCmDNVkcRPw4/exec";
        try {
            const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getVisits`);
            if (response.ok) {
                const visits = await response.json();
                if (Array.isArray(visits)) {
                    this.saveTechnicalVisits(visits);
                    return true;
                }
            }
        } catch (e) {
            console.error("Error sincronizando visitas desde Google Drive:", e);
        }
        return false;
    }

    /**
     * Registra una visita técnica localmente y la sincroniza con Google Drive
     */
    static async addTechnicalVisit(username, convenioId, visitData) {
        const newVisit = {
            id: 'VT-' + Date.now(),
            convenioId: String(convenioId).trim(),
            usuario: username,
            fecha: visitData.fecha || new Date().toLocaleDateString('es-CO'),
            tipo: visitData.tipo || 'Avance de obra',
            observaciones: visitData.observaciones || '',
            compromisos: visitData.compromisos || '',
            riesgos: visitData.riesgos || '',
            lat: parseFloat(visitData.lat) || 0,
            lng: parseFloat(visitData.lng) || 0,
            photoCount: parseInt(visitData.photoCount) || 0,
            photos: visitData.photos || []
        };

        // Guardar en caché local
        const visits = this.getTechnicalVisits();
        visits.unshift(newVisit);
        this.saveTechnicalVisits(visits);

        // Sincronizar con Google Drive en segundo plano (POST sin bloquear UI)
        const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwXBFslIOCwVCyAae8-FG0VL5pqotLkjejwJhavm5xoGU4SlyVETwRkGCmDNVkcRPw4/exec";
        try {
            fetch(GOOGLE_SCRIPT_URL, {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type": "text/plain"
                },
                body: JSON.stringify({
                    action: "saveVisit",
                    visit: newVisit
                })
            }).catch(e => console.error("Error asíncrono enviando visita a Drive:", e));
        } catch (e) {
            console.error("Error enviando visita a Google Drive:", e);
        }

        return newVisit;
    }

    /**
     * Actualiza una visita técnica localmente y la sincroniza con Google Drive
     */
    static async updateTechnicalVisit(visitId, visitData) {
        const visits = this.getTechnicalVisits();
        const idx = visits.findIndex(v => v.id === visitId);
        if (idx === -1) return null;

        const updatedVisit = {
            ...visits[idx],
            fecha: visitData.fecha !== undefined ? visitData.fecha : visits[idx].fecha,
            tipo: visitData.tipo !== undefined ? visitData.tipo : visits[idx].tipo,
            observaciones: visitData.observaciones !== undefined ? visitData.observaciones : visits[idx].observaciones,
            compromisos: visitData.compromisos !== undefined ? visitData.compromisos : visits[idx].compromisos,
            riesgos: visitData.riesgos !== undefined ? visitData.riesgos : visits[idx].riesgos,
            lat: visitData.lat !== undefined ? parseFloat(visitData.lat) || 0 : visits[idx].lat,
            lng: visitData.lng !== undefined ? parseFloat(visitData.lng) || 0 : visits[idx].lng,
            photoCount: visitData.photos !== undefined ? visitData.photos.length : visits[idx].photoCount,
            photos: visitData.photos !== undefined ? visitData.photos : visits[idx].photos
        };

        // Guardar en caché local
        visits[idx] = updatedVisit;
        this.saveTechnicalVisits(visits);

        // Sincronizar con Google Drive en segundo plano (POST sin bloquear UI)
        const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwXBFslIOCwVCyAae8-FG0VL5pqotLkjejwJhavm5xoGU4SlyVETwRkGCmDNVkcRPw4/exec";
        try {
            fetch(GOOGLE_SCRIPT_URL, {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type": "text/plain"
                },
                body: JSON.stringify({
                    action: "saveVisit",
                    visit: updatedVisit
                })
            }).catch(e => console.error("Error asíncrono actualizando visita en Drive:", e));
        } catch (e) {
            console.error("Error actualizando visita en Google Drive:", e);
        }

        return updatedVisit;
    }
}

// Exponer la clase globalmente para su uso en index.html y script.js
window.DIATDataService = DIATDataService;
