import twilio from 'twilio';

const getTwilioClient = () => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    // Only initialize Twilio if credentials are configured
    if (accountSid && authToken && !accountSid.includes('your-')) {
        return twilio(accountSid, authToken);
    }
    return null;
};

export const sendAbsenceNotification = async (studentName, parentPhone) => {
    const client = getTwilioClient();
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!client) {
        console.log('📱 SMS (Mock): Would send absence notification for', studentName, 'to', parentPhone);
        return { success: true, mock: true };
    }

    try {
        const message = await client.messages.create({
            body: `Dear Parent, this is to inform you that your child ${studentName} was marked absent today. Please contact the school if you have any questions.`,
            from: twilioPhone,
            to: parentPhone,
        });

        console.log('📱 SMS sent:', message.sid);
        return { success: true, messageId: message.sid };
    } catch (error) {
        console.error('📱 SMS Error:', error.message);
        return { success: false, error: error.message };
    }
};
