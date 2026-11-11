# RainSafe – Community Rain & Road Hazard Reporting

A student project prototype for sharing community-observed waterlogging and rain-related road hazards.

## Architecture
- Frontend: HTML, CSS, JavaScript (Netlify)
- Backend: Node.js + Express (Render)
- Database: MongoDB Atlas

## Features
- Submit a hazard report with location, type, severity and description
- Store reports in MongoDB
- Display the latest 50 reports
- Basic server-side input validation

## Run locally
1. Install Node.js.
2. In a terminal, enter `cd backend`.
3. Run `npm install`.
4. Copy `.env.example` to `.env` and fill in your MongoDB connection string.
5. Run `npm start`.
6. Open the project root `index.html` with a local web server.
7. In `script.js`, set `API_BASE_URL` to `http://localhost:5000/api`.

## Deployment overview
1. Push the complete project to GitHub.
2. Create a MongoDB Atlas database and copy its connection string.
3. Deploy the `backend` folder as a Render Web Service:
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `npm start`
   - Environment variables: `MONGODB_URI`, `DB_NAME`, `FRONTEND_ORIGIN`
4. Deploy the frontend root folder on Netlify.
5. Update `API_BASE_URL` in `script.js` to `https://YOUR-RENDER-SERVICE.onrender.com/api`, then push the change.
6. Set `FRONTEND_ORIGIN` in Render to your exact Netlify site URL and redeploy.
7. Test the API health route `/api/health`, submit a report, and confirm it appears in MongoDB and on the website.

## Important
- Never commit `.env` or database credentials to GitHub.
- Configure MongoDB Atlas network access carefully. For a public demo, use the provider's secure network-access options and a restricted database user.
- This is an educational demo, not an official weather, flood-warning or emergency-response system. Do not rely on it for emergency decisions.
- Do not submit fabricated hazard reports. Use truthful test data clearly marked as a test if required.
