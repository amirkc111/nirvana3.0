try:
    year = int(None)
    print("Success")
except Exception as e:
    print(f"Failed with {type(e).__name__}: {e}")
