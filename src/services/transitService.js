/**
 * Transit Verification Service
 * Handles checking layover permissions and filtering flights based on passport restrictions
 */

const LAYOVER_API_URL = import.meta.env.VITE_LAYOVER_API_URL || 'https://jowly-microseismic-keira.ngrok-free.dev/check';

/**
 * Check layover permission for a specific country and passport
 * @param {string} country - Country or airport code
 * @param {string} passport - Passport nationality
 * @returns {Promise<Object>} - Permission details
 */
export async function checkLayoverPermission(country, passport) {
  try {
    const url = `${LAYOVER_API_URL}?country=${encodeURIComponent(country)}&passport=${encodeURIComponent(passport)}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[Transit Check] Error:', error);
    return null;
  }
}

/**
 * Extract layover airports from flight segments
 * @param {Array|string} segments - Flight segments
 * @returns {Array} - List of layover airport codes
 */
export function extractLayoverAirports(segments) {
  try {
    const parsedSegments = typeof segments === 'string' ? JSON.parse(segments) : segments;
    
    if (!Array.isArray(parsedSegments) || parsedSegments.length <= 1) {
      return [];
    }

    // Get all intermediate airports (not the final destination)
    const layovers = [];
    for (let i = 0; i < parsedSegments.length - 1; i++) {
      const airport = parsedSegments[i].arrivalAirportCode || 
                     parsedSegments[i].arrivalAirport || 
                     parsedSegments[i].arrivalAirportName;
      if (airport) {
        layovers.push(airport);
      }
    }

    return [...new Set(layovers)]; // Remove duplicates
  } catch (error) {
    console.error('[Layover Extract] Error:', error);
    return [];
  }
}

/**
 * Calculate layover duration in hours
 * @param {Array|string} segments - Flight segments
 * @returns {Array} - List of layover durations with airport info
 */
export function calculateLayoverDurations(segments) {
  try {
    const parsedSegments = typeof segments === 'string' ? JSON.parse(segments) : segments;
    
    if (!Array.isArray(parsedSegments) || parsedSegments.length <= 1) {
      return [];
    }

    const layovers = [];
    for (let i = 0; i < parsedSegments.length - 1; i++) {
      const arrTime = parsedSegments[i].arrivalDateTime || parsedSegments[i].arrivalTime;
      const depTime = parsedSegments[i + 1].departureDateTime || parsedSegments[i + 1].departureTime;
      
      if (arrTime && depTime) {
        const arrival = new Date(arrTime);
        const departure = new Date(depTime);
        const durationMs = departure - arrival;
        const durationHours = durationMs / (1000 * 60 * 60);
        
        layovers.push({
          airport: parsedSegments[i].arrivalAirportCode || parsedSegments[i].arrivalAirport,
          airportName: parsedSegments[i].arrivalAirportName,
          durationHours: durationHours,
          durationFormatted: formatDuration(durationHours)
        });
      }
    }

    return layovers;
  } catch (error) {
    console.error('[Layover Duration] Error:', error);
    return [];
  }
}

/**
 * Format duration in hours to human-readable format
 * @param {number} hours - Duration in hours
 * @returns {string} - Formatted duration (e.g., "8h 30m")
 */
function formatDuration(hours) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/**
 * Check all layovers in a flight for a specific passport
 * @param {Object} flight - Flight object with segments
 * @param {string} passport - Passport nationality
 * @returns {Promise<Object>} - Verification results
 */
export async function verifyFlightTransit(flight, passport) {
  const layoverAirports = extractLayoverAirports(flight.segments || flight.itinerary);
  
  if (layoverAirports.length === 0) {
    return {
      isDirect: true,
      isAllowed: true,
      layovers: [],
      restrictedAirports: []
    };
  }

  const results = {};
  const restrictedAirports = [];

  for (const airport of layoverAirports) {
    const permission = await checkLayoverPermission(airport, passport);
    results[airport] = permission;
    
    if (permission && permission.allowed === false) {
      restrictedAirports.push({
        airport,
        country: permission.layover_country,
        reason: permission.message
      });
    }
  }

  return {
    isDirect: false,
    isAllowed: restrictedAirports.length === 0,
    layovers: results,
    restrictedAirports
  };
}

/**
 * Filter flights based on passport restrictions
 * @param {Array} flights - List of flight offers
 * @param {string} passport - Passport nationality
 * @returns {Promise<Object>} - Filtered flights with restriction info
 */
export async function filterFlightsByPassport(flights, passport) {
  if (!flights || !Array.isArray(flights) || !passport) {
    return {
      allowedFlights: flights || [],
      restrictedFlights: [],
      restrictions: {}
    };
  }

  const allowedFlights = [];
  const restrictedFlights = [];
  const restrictions = {};

  for (const flight of flights) {
    const verification = await verifyFlightTransit(flight, passport);
    
    if (verification.isAllowed) {
      allowedFlights.push({
        ...flight,
        transitVerified: true,
        transitStatus: 'allowed'
      });
    } else {
      restrictedFlights.push({
        ...flight,
        transitVerified: true,
        transitStatus: 'restricted',
        restrictedAirports: verification.restrictedAirports
      });
      
      // Store restriction details
      restrictions[flight.id || flight.offerId] = verification.restrictedAirports;
    }
  }

  return {
    allowedFlights,
    restrictedFlights,
    restrictions,
    totalChecked: flights.length,
    totalAllowed: allowedFlights.length,
    totalRestricted: restrictedFlights.length
  };
}

/**
 * Check if a flight has long layovers (8+ hours)
 * @param {Object} flight - Flight object
 * @param {number} thresholdHours - Minimum hours to consider "long" (default: 8)
 * @returns {Object} - Long layover info
 */
export function hasLongLayover(flight, thresholdHours = 8) {
  const layovers = calculateLayoverDurations(flight.segments || flight.itinerary);
  const longLayovers = layovers.filter(l => l.durationHours >= thresholdHours);
  
  return {
    hasLong: longLayovers.length > 0,
    longLayovers,
    allLayovers: layovers
  };
}
