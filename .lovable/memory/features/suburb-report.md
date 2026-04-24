---
name: Suburb profile report
description: Downloadable PDF (HTML print) of a single suburb — snapshot, demographics, history, infra, listings. Edge function generate-suburb-report.
type: feature
---
# Suburb Report

`generate-suburb-report` edge function returns printable HTML matching the user's reference SuburbReport sample. Sections:
1. Cover (PropertyMate brand, suburb, postcode, date, prepared-for)
2. Snapshot (median price, growth, yield, vacancy, pop growth, DOM)
3. Why this suburb (`reasoning`)
4. Demographics (population_total, median_age, household_composition)
5. History (suburb_history)
6. Infra & Amenities (schools, hospital, train, shopping, projects)
7. Market Performance (house/unit rent, range, stamp duty)
8. Investment Maths (weekly out-of-pocket)
9. Matching Listings table (realestate.com.au + Domain deep links)
10. Footer (sources, disclaimer)

If older `suburb_results` rows are missing demographics/history fields, the function lazy-fills them via Gemini and writes back to the row.

Frontend: `<SuburbReportButton>` per Results card. Opens HTML in a new tab and auto-triggers print → user saves as PDF. Inserts a `report_ready` notification.
