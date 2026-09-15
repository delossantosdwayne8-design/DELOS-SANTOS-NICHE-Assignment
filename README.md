# Global Public Holidays Explorer

An interactive single-page application built with HTML, CSS, and Vanilla JavaScript that consumes the Nager.Date Public REST API to explore national holidays worldwide.

## Features
- **Dynamic Country Selector:** Dynamically pulls the official country list from Nager.Date API.
- **Year Filter:** Switch between 2024–2027 holiday schedules.
- **Live Search Filter:** Instant client-side search filtering by English or local holiday names.
- **Real-Time Next Holiday Countdown:** Automatically detects the closest upcoming holiday for the selected nation and ticks down live in Days, Hours, Minutes, and Seconds.
- **Highlighted Card Indicator:** Highlights the upcoming holiday card within the list.

## API & Key Security Information
- **API Used:** [Nager.Date API](https://date.nager.at/)
- **API Key Required:** **None** (Open CORS REST API).
- **Security Note:** Because Nager.Date is an open public API, no secret API key management or backend server proxies are required. Client-side browser `fetch()` requests directly query the public endpoints safely.

## Local Setup
1. Clone the repository:
   ```bash
   git clone <YOUR_REPOSITORY_LINK>
   cd <YOUR_REPOSITORY_NAME>