const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// Load credentials from the OAuth JSON file
const credentialsPath = path.join(__dirname, '../config/credentials.json');
const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8')).web;

const { client_id, client_secret, redirect_uris } = credentials;

const authClient = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0] // use the first redirect URI
);

// Now, load the tokens from a token.json file (which you will have to generate)
const tokenPath = path.join(__dirname, '../utils/token.json'); // << you'll need this file

try {
    const token = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));
    authClient.setCredentials(token);
} catch (err) {
    console.error('Token not found or invalid. You need to generate one via consent screen.');
    process.exit(1);
}

const analyticsData = google.analyticsdata({ version: 'v1beta', auth: authClient });

const fetchAnalyticsData = async () => {
    try {
        const res = await analyticsData.properties.runReport({
            property: 'properties/457737392', // Replace this with your real property ID
            requestBody: {
                dateRanges: [
                    {
                        startDate: '7daysAgo',
                        endDate: 'today',
                    },
                ],
                dimensions: [{ name: 'city' }],
                metrics: [{ name: 'sessions' }],
            },
        });
    } catch (error) {
        console.error('Error fetching analytics data:', error);
    }
};

fetchAnalyticsData();