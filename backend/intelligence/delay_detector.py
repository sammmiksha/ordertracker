from typing import Dict, Tuple, Optional
from pydantic import BaseModel

class CorridorBenchmark(BaseModel):
    corridor: str
    typical_min_hours: int
    typical_max_hours: int
    median_hours: int

# Major Indian freight corridors and typical ground linehaul times (hours)
FREIGHT_CORRIDOR_BENCHMARKS: Dict[Tuple[str, str], CorridorBenchmark] = {
    ("delhi", "mumbai"): CorridorBenchmark(corridor="Delhi ↔ Mumbai", typical_min_hours=24, typical_max_hours=36, median_hours=30),
    ("jaipur", "mumbai"): CorridorBenchmark(corridor="Jaipur ↔ Mumbai", typical_min_hours=18, typical_max_hours=26, median_hours=22),
    ("bhiwandi", "pune"): CorridorBenchmark(corridor="Bhiwandi ↔ Pune", typical_min_hours=8, typical_max_hours=16, median_hours=12),
    ("surat", "delhi"): CorridorBenchmark(corridor="Surat ↔ Delhi", typical_min_hours=22, typical_max_hours=34, median_hours=28),
    ("bengaluru", "chennai"): CorridorBenchmark(corridor="Bengaluru ↔ Chennai", typical_min_hours=8, typical_max_hours=14, median_hours=10),
    ("bengaluru", "hyderabad"): CorridorBenchmark(corridor="Bengaluru ↔ Hyderabad", typical_min_hours=14, typical_max_hours=22, median_hours=18),
    ("delhi", "kolkata"): CorridorBenchmark(corridor="Delhi ↔ Kolkata", typical_min_hours=30, typical_max_hours=48, median_hours=38),
    ("mumbai", "ahmedabad"): CorridorBenchmark(corridor="Mumbai ↔ Ahmedabad", typical_min_hours=10, typical_max_hours=18, median_hours=14),
}

class DelayAnalysis(BaseModel):
    is_delayed: bool
    current_dwell_or_transit_hours: float
    typical_hours: int
    confidence_score: int
    smart_eta_summary: str
    anomaly_detected: bool

def analyze_corridor_transit(origin_city: str, dest_city: str, hours_elapsed: float) -> DelayAnalysis:
    """
    Evaluates whether an active shipment on an Indian freight corridor is experiencing
    abnormal transit delays compared to standard linehaul benchmarks.
    """
    key1 = (origin_city.lower().strip(), dest_city.lower().strip())
    key2 = (dest_city.lower().strip(), origin_city.lower().strip())

    benchmark = FREIGHT_CORRIDOR_BENCHMARKS.get(key1) or FREIGHT_CORRIDOR_BENCHMARKS.get(key2)

    if not benchmark:
        # Default domestic estimate
        typical = 48
        is_delayed = hours_elapsed > 60
        return DelayAnalysis(
            is_delayed=is_delayed,
            current_dwell_or_transit_hours=hours_elapsed,
            typical_hours=typical,
            confidence_score=72,
            smart_eta_summary="Standard national linehaul transit schedule.",
            anomaly_detected=is_delayed
        )

    is_delayed = hours_elapsed > benchmark.typical_max_hours
    confidence = 88 if is_delayed else 92

    if is_delayed:
        excess = hours_elapsed - benchmark.typical_max_hours
        summary = f"⚠️ Unusual delay on {benchmark.corridor} (+{excess:.1f} hrs beyond standard {benchmark.typical_max_hours} hrs)."
    else:
        summary = f"Normal transit on {benchmark.corridor} (within {benchmark.typical_min_hours}–{benchmark.typical_max_hours} hrs benchmark)."

    return DelayAnalysis(
        is_delayed=is_delayed,
        current_dwell_or_transit_hours=hours_elapsed,
        typical_hours=benchmark.median_hours,
        confidence_score=confidence,
        smart_eta_summary=summary,
        anomaly_detected=is_delayed
    )
