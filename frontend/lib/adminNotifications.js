/**
 * Trigger an admin notification
 * @param {('info'|'success'|'warning'|'error')} type - The type of notification
 * @param {string} title - The title of the notification
 * @param {string} body - The body text of the notification
 * @param {string} [link] - Optional link to redirect to
 */
export async function createAdminNotification(type, title, body, link = null) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        await fetch(`${baseUrl}/api/admin/notifications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type,
                title,
                body,
                link
            }),
        });
    } catch (error) {
        console.error('Failed to create admin notification:', error);
    }
}
