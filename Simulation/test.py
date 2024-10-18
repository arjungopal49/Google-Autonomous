import pandas as pd

# Corrected simulated data:
all_employee_ids = [100, 101, 102, 145, 146, 201, 108, 205, 114, 204, 103, 109, 176, 177, 206,
 110, 121, 120, 122, 112, 111, 178, 113, 123, 203, 179, 104, 202, 105, 106,
 200, 107, 192, 193, 115, 116, 117, 126, 118, 119]  # Adjusted to include 206

# Provided list of employee IDs (based on your image)
provided_ids = [
    206, 205, 200, 100, 101, 102, 109, 110, 111, 112, 113, 108, 203, 103, 104, 105, 106, 107,
    201, 202, 204, 115, 116, 117, 118, 119, 114, 145, 146, 176
]

# Filter to find all IDs not in the provided list
unlisted_ids = [eid for eid in all_employee_ids if eid not in provided_ids]

print(unlisted_ids)
