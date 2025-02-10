// poller.ts
import axios from 'axios';

const PUBLIC_SERVER = 'http://localhost:3001'; // Adjust this URL


// Export a function to process data so the poller can use it directly
export async function processData(data: any): Promise<any> {
    // Simulate processing delay and then return the processed result
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ processedData: data, message: 'Processed by local backend.' });
        }, 1000);
    });
}

export async function pollForTasks(): Promise<void> {
    try {
        // Poll the public server for a new task
        const pollResponse = await axios.get(`${PUBLIC_SERVER}/poll`);
        const task = pollResponse.data as any;

        // If no task is available, task.id will be null
        if (!task.id) {
            setTimeout(pollForTasks, 1000);
            return;
        }

        console.log('Received task:', task);

        const PORT = process.env.PORT || 3000
        const localEndpoint = `http://localhost:${PORT}${task.endpoint}`;
        let processResponse;
        
        // ✅ Dynamically handle different HTTP methods
        switch (task.method.toUpperCase()) {
            case 'GET':
                processResponse = await axios.get(localEndpoint);
                break;
            case 'POST':
                processResponse = await axios.post(localEndpoint, task.data);
                break;
            case 'PATCH':
                processResponse = await axios.patch(localEndpoint, task.data);
                break;
            case 'DELETE':
                processResponse = await axios.delete(localEndpoint, { data: task.data });
                break;
                default:
                    throw new Error(`Unsupported HTTP method: ${task.method}`);
                }
                
        const result = processResponse.data;
        console.log("------- result ", result)

        // Send the result back to the public server
        await axios.post(`${PUBLIC_SERVER}/complete`, { id: task.id, result });
    } catch (error: any) {
        console.error('Error during polling or processing:', error.message);
    }
    // Continue polling
    setTimeout(pollForTasks, 500);
}