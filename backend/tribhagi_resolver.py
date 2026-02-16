from datetime import datetime
import math

class FatalError(Exception):
    pass

def compute_phase(start_date_str, end_date_str, today_str):
    """
    Computes the phase of the Tribhagi dasha based on the Vimshottari period.
    Segments:
    - Purva (1/4): 0% to 25%
    - Madhya (1/2): 25% to 75%
    - Paschima (1/4): 75% to 100%
    """
    try:
        # Parse dates (assuming YYYY-MM-DD format based on user example)
        # Using a flexible parser or specific format? User example: "2080-01-01"
        fmt = "%Y-%m-%d"
        start = datetime.strptime(start_date_str, fmt)
        end = datetime.strptime(end_date_str, fmt)
        today = datetime.strptime(today_str, fmt)

        total_duration = (end - start).total_seconds()
        elapsed = (today - start).total_seconds()
        
        if total_duration <= 0:
            return "Unknown"

        ratio = elapsed / total_duration

        if ratio < 0.25:
            return "Purva (¼)"
        elif ratio < 0.75:
            return "Madhya (½)"
        else:
            return "Paschima (¼)"
            
    except Exception as e:
        return f"Error: {str(e)}"

def resolve_tribhagi(vimshottari_state, today, debug_input=None):
    """
    Tribhāgī must be read-only and derived ONLY from Vimshottari Mahadasha.
    It must NEVER see seed, nakshatra, or V-index.
    """

    # HARD FAIL-SAFE
    if debug_input:
        if "seed" in debug_input or "nakshatra" in debug_input:
            raise FatalError("TRIBHAGI MUST NOT USE SEED / NAKSHATRA")
        # Check for V-indices keys
        if any(k.startswith("V") and k[1:].isdigit() for k in debug_input.keys()):
             raise FatalError("TRIBHAGI USING VIMSHOTTARI INDEX")
        # Also check values just in case, though prompt implies keys usually? 
        # User prompt: if any(v in debug_input for v in ["V1","V2"...]) 
        # Python 'in' on dict checks keys. 
        # The user's pseudo-code: if any(v in debug_input for v in ["V1"...]) checks keys.
        # My stricter check above covers V1...V99.

    # Compute phase (¼, ½, etc.) relative to Vimshottari Mahadasha
    maha_start = vimshottari_state["maha_start"]
    maha_end = vimshottari_state["maha_end"]

    phase = compute_phase(maha_start, maha_end, today)

    # Return canonical Tribhāgī
    return {
        "system": "Tribhagi",
        "maha": vimshottari_state["maha"],
        "antar": vimshottari_state["antar"],
        "prat": vimshottari_state["prat"],
        "phase": phase
    }
