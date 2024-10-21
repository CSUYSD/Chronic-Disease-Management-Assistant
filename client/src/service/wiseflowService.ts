import PocketBase from 'pocketbase';

const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://127.0.0.1:8090');

export async function fetchCrawledInfo() {
    try {
        // Authenticate with PocketBase (use environment variables for credentials)
        await pb.admins.authWithPassword(
            process.env.POCKETBASE_ADMIN_EMAIL!,
            process.env.POCKETBASE_ADMIN_PASSWORD!
        );

        // Fetch crawled information from PocketBase
        const records = await pb.collection('insights').getList(1, 50, {
            sort: '-created',
        });

        return records.items;
    } catch (error) {
        console.error('Error fetching crawled information:', error);
        throw error;
    }
}

export function startPeriodicFetch(callback: (info: any) => void, interval = 300000) { // Default to fetch every 5 minutes
    return setInterval(async () => {
        try {
            const info = await fetchCrawledInfo();
            callback(info);
        } catch (error) {
            console.error('Error during periodic fetch:', error);
        }
    }, interval);
}