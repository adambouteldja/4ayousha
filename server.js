const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const https = require('https');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

const TOKEN = 'توكن_البوت';
const CHAT_ID = '7979695376';

app.post('/send', (req, res) => {

    const { question, answer } = req.body;

    const text =
`سؤال:
${question}

جواب:
${answer}`;

    const data = JSON.stringify({
        chat_id: CHAT_ID,
        text: text
    });

    const options = {
        hostname: 'api.telegram.org',
        path: `/bot${TOKEN}/sendMessage`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const request = https.request(options, response => {

        let body = '';

        response.on('data', chunk => {
            body += chunk;
        });

        response.on('end', () => {
            console.log(body);
            res.json({ success: true });
        });

    });

    request.on('error', error => {
        console.log(error);
        res.json({
            success: false,
            error: error.message
        });
    });

    request.write(data);
    request.end();

});

app.listen(3000, () => {
    console.log('server running');
});const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

const TOKEN = '8660352218:AAEK9IRazoQ9oxwmKjwj60BMcUaF0RmQRCA';
const CHAT_ID = '7979695376';

app.post('/send', async (req, res) => {
    try {
        const { question, answer } = req.body;

        const text =
`سؤال:
${question}

جواب:
${answer}`;

        await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text
            })
        });

        res.json({ status: 'success' });

    } catch (err) {
        res.json({
            status: 'error',
            message: err.message
        });
    }
});

app.listen(3000, () => {
    console.log('server running');
});
