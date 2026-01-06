exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
    
    try {
        const data = JSON.parse(event.body);
        
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;
        
        if (!botToken || !chatId) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Server configuration error' })
            };
        }
        
        const message = `
New Contact Form Submission:

Name: ${data.name}
Email: ${data.email}
Subject: ${data.subject}
Reference: ${data.reference || 'Not provided'}

Message:
${data.message}

Submitted: ${new Date().toISOString()}
        `;
        
        const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });
        
        const telegramResult = await telegramResponse.json();
        
        if (!telegramResponse.ok) {
            return {
                statusCode: 500,
                body: JSON.stringify({ 
                    error: 'Failed to send notification',
                    telegramError: telegramResult.description
                })
            };
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                success: true, 
                message: 'Form submitted successfully'
            })
        };
        
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
