export const fetchLookupAppData = async (onError: (message: string) => void): Promise<any> => {
    try {
        // Simulate a delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const response = await fetch(`http://localhost:3001/participants`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Remove the `id` field if necessary
        return data.map(({ id, ...rest }: any) => rest);
    } catch (error: any) {
        console.error('Fetch error:', error.message);
        onError(`Problem fetching the data: ${error.message}`);
        throw error; // Re-throw the error to handle it in the calling code
    }
};