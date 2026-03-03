import nodemailer from 'nodemailer';

let cachedTransporter = null;
let lastUsedCreds = null;

const getTransporter = () => {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_APP_PASSWORD;

    if (!emailUser || !emailPass) {
        return null;
    }

    const currentCreds = `${emailUser}:${emailPass}`;

    // Reuse transporter if credentials haven't changed
    if (cachedTransporter && lastUsedCreds === currentCreds) {
        return cachedTransporter;
    }

    cachedTransporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use TLS (STARTTLS)
        auth: {
            user: emailUser,
            pass: emailPass,
        },
        // Increase timeouts for cloud environments like Render
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,
        socketTimeout: 15000,
        dnsTimeout: 5000,
        debug: true, // Enable debug logging for more info if it still fails
        logger: true,
    });

    lastUsedCreds = currentCreds;
    return cachedTransporter;
};


export const sendAbsenceNotification = async (studentName, parentEmail) => {
    const transporter = getTransporter();
    const emailUser = process.env.EMAIL_USER;
    const emailFromName = process.env.EMAIL_FROM_NAME || 'Attendance System';

    if (!transporter) {
        console.log('📧 Email (Mock): Would send absence notification for', studentName, 'to', parentEmail);
        return { success: true, mock: true };
    }

    try {
        const mailOptions = {
            from: `"${emailFromName}" <${emailUser}>`,
            to: parentEmail,
            subject: `Absence Alert: ${studentName}`,
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">📋 Attendance Notification</h1>
                    </div>
                    <div style="background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none;">
                        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">Dear Parent/Guardian,</p>
                        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                            This is to inform you that your child <strong style="color: #1f2937;">${studentName}</strong> was marked
                            <span style="background: #fef2f2; color: #dc2626; padding: 2px 10px; border-radius: 6px; font-weight: 600;">absent</span>
                            today.
                        </p>
                        <div style="background: #f9fafb; border-left: 4px solid #667eea; padding: 16px; border-radius: 0 8px 8px 0; margin: 0 0 24px 0;">
                            <p style="color: #6b7280; font-size: 14px; margin: 0;">
                                If you believe this is an error or have any questions, please contact the school administration.
                            </p>
                        </div>
                    </div>
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                            This is an automated message from the Attendance Management System.
                        </p>
                    </div>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('📧 Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('📧 Email Error:', error.message);
        return { success: false, error: error.message };
    }
};
