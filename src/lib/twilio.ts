export function formatPhoneNumber(phoneNumber: string): string {
    let formatted = phoneNumber.replace(/\s+/g, "").replace(/-/g, "");
    if (!formatted.startsWith("+")) {
        formatted = "+65" + formatted.replace(/^65/, "");
    }
    return formatted;
}

export async function sendWhatsApp(
    phoneNumber: string,
    jewelryName: string,
    imageUrl: string,
): Promise<{ messageSid: string; status: string; to: string }> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM;
    const contentSid = process.env.WHATSAPP_CONTENT_SID;

    if (!accountSid || !authToken || !fromNumber || !contentSid) {
        throw new Error("WhatsApp service not configured");
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    const toWhatsApp = `whatsapp:${formattedPhone}`;
    const fromWhatsApp = `whatsapp:${fromNumber}`;

    const contentVariables = JSON.stringify({
        name: jewelryName || "Beautiful Jewelry",
        link: imageUrl,
    });

    const formData = new URLSearchParams();
    formData.append("To", toWhatsApp);
    formData.append("From", fromWhatsApp);
    formData.append("ContentSid", contentSid);
    formData.append("ContentVariables", contentVariables);

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const authHeader = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    console.log("=== TWILIO REQUEST ===");
    console.log("To:", toWhatsApp);
    console.log("From:", fromWhatsApp);
    console.log("ContentVariables:", contentVariables);

    const response = await fetch(twilioUrl, {
        method: "POST",
        headers: {
            Authorization: `Basic ${authHeader}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
    });

    const result = await response.json();

    console.log("=== TWILIO RESPONSE ===");
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(result, null, 2));

    if (!response.ok) {
        throw new Error(result.message || result.error_message || "Failed to send WhatsApp");
    }

    return {
        messageSid: result.sid,
        status: result.status,
        to: formattedPhone,
    };
}
