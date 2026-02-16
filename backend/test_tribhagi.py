from tribhagi_resolver import resolve_tribhagi, FatalError
import json

def test():
    print("Testing Tribhagi Resolver...")

    # 1. Happy Path
    state = {
        "maha": "Venus",
        "maha_start": "2080-01-01",
        "maha_end": "2085-01-01",
        "antar": "Moon",
        "prat": "Rahu"
    }
    today = "2082-06-15"
    
    # Total days approx: 5 years = 1826 days
    # Elapsed: 2082-06-15 - 2080-01-01 ~= 2.5 years
    # Ratio ~= 0.5 -> Madhya (1/2) ?
    
    try:
        res = resolve_tribhagi(state, today)
        print("Result:", json.dumps(res, indent=2, ensure_ascii=False))
    except Exception as e:
        print("FAIL Happy Path:", e)

    # 2. Fail Safe - Seed
    print("\nTesting Fail Safe (Seed)...")
    try:
        resolve_tribhagi(state, today, debug_input={"seed": 123})
        print("FAIL: Should have raised FatalError")
    except FatalError as e:
        print("PASS:", e)
    except Exception as e:
        print("FAIL: Wrong exception type", type(e))

    # 3. Fail Safe - V Index
    print("\nTesting Fail Safe (V-Index)...")
    try:
        resolve_tribhagi(state, today, debug_input={"V1": "test"})
        print("FAIL: Should have raised FatalError")
    except FatalError as e:
        print("PASS:", e)
    except Exception as e:
        print("FAIL: Wrong exception type", type(e))

if __name__ == "__main__":
    test()
