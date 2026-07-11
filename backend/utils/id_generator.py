import random


def generate_meeting_id() -> str:
    """Generates a Zoom-style 9-digit public meeting ID, e.g. '823-912-456'."""
    digits = [str(random.randint(0, 9)) for _ in range(9)]
    joined = "".join(digits)
    return f"{joined[0:3]}-{joined[3:6]}-{joined[6:9]}"
