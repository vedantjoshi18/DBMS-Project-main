const { sendEmail } = require('../utils/email');
const { escapeHtml, normalizeText } = require('../utils/sanitize');

// @desc    Send contact email
// @route   POST /api/contact
// @access  Public
const sendContactEmail = async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    try {
        const safeName = escapeHtml(normalizeText(name));
        const safeEmail = escapeHtml(normalizeText(email));
        const safeSubject = escapeHtml(normalizeText(subject || 'No Subject'));
        const safeMessage = escapeHtml(normalizeText(message));

        const info = await sendEmail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            replyTo: email,
            to: process.env.EMAIL_USER,
            subject: `New Contact Form Submission: ${safeSubject}`,
            text: `Name: ${normalizeText(name)}\nEmail: ${normalizeText(email)}\n\nMessage:\n${normalizeText(message)}`,
            html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Subject:</strong> ${safeSubject}</p>
        <p><strong>Message:</strong></p>
                <p>${safeMessage.replaceAll('\n', '<br>')}</p>
      `
        });

        console.log('Message sent: %s', info.messageId);

        res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'Server error: Failed to send email' });
    }
};

module.exports = {
    sendContactEmail
};
