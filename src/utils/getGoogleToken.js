const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const http = require('http');
const url = require('url');
const path = require('path');
const open = (...args) => import('open').then(mod => mod.default(...args));
const destroyer = require('server-destroy');

const CREDENTIALS_PATH = path.join(__dirname, '../utils/credentials.json');
const TOKEN_PATH = path.join(__dirname, './token.json');

async function main() {
    const content = fs.readFileSync(CREDENTIALS_PATH);
    const credentials = JSON.parse(content);
    const { client_secret, client_id } = credentials.web; // <- fixed

    const redirectUri = 'http://localhost:3000/oauth2callback';

    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirectUri);

    const authorizeUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/analytics.readonly'],
    });

    const server = http.createServer(async (req, res) => {
        if (req.url.indexOf('/oauth2callback') > -1) {
            const qs = new url.URL(req.url, 'http://localhost:3000').searchParams;x
            const code = qs.get('code');

            res.end('Authentication successful! You can close this tab.');
            server.destroy();

            const { tokens } = await oAuth2Client.getToken(code);
            oAuth2Client.setCredentials(tokens);

            fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
        }
    }).listen(3000, () => {
        open(authorizeUrl, { wait: false }).then(cp => cp.unref());
    });

    destroyer(server);
}

main().catch(console.error);
