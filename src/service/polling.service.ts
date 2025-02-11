import axios from 'axios';

const PUBLIC_SERVER = 'http://localhost:3001'; // Adjust this URL

interface Task {
    id: string;
    endpoint: string;
    data: any;
    headers: Record<string, string>;
    query: Record<string, string>;
    method: string;
}

export async function pollForTasks(): Promise<void> {
    try {
        // Poll the public server for a new task
        const pollResponse = await axios.get(`${PUBLIC_SERVER}/poll`);
        const task = pollResponse.data as Task;

        if (!task.id) {
            setTimeout(pollForTasks, 500);
            return;
        }

        console.log('Received task:', task);

        const PORT = process.env.PORT || 3000;

        const localEndpoint = `http://localhost:${PORT}${task.endpoint}`;
        let processResponse;


        const filteredHeaders = { ...task.headers };

        // 🚨 Remove headers that might break the request
        delete filteredHeaders['host'];              // Axios sets this automatically
        delete filteredHeaders['connection'];        // Can cause issues
        delete filteredHeaders['content-length'];    // Axios calculates this
        delete filteredHeaders['postman-token'];     // Postman-specific, unnecessar

        try {
            // ✅ Dynamically handle different HTTP methods with headers and query parameters
            switch (task.method.toUpperCase()) {
                case 'GET':
                    processResponse = await axios.get(localEndpoint, {
                        headers: filteredHeaders,
                        params: task.query,
                    });
                    break;
                case 'POST':
                    processResponse = await axios.post(localEndpoint, task.data, {
                        headers: filteredHeaders,
                        params: task.query,
                    });
                    break;
                case 'PATCH':
                    processResponse = await axios.patch(localEndpoint, task.data, {
                        headers: filteredHeaders,
                        params: task.query,
                    });
                    break;
                case 'DELETE':
                    processResponse = await axios.delete(localEndpoint, {
                        headers: filteredHeaders,
                        params: task.query,
                        data: task.data,
                    });
                    break;
                default:
                    throw new Error(`Unsupported HTTP method: ${task.method}`);
            }

            // ✅ Capture both the response status and data
            const result = processResponse.data   // Include response data

            console.log("------- result ", result);

            // ✅ Send both status and response data to the public server
            await axios.post(`${PUBLIC_SERVER}/complete`, { id: task.id, result });

        } catch (requestError: any) {
            // ✅ Capture and send error response if request fails
            console.error('Request failed:', requestError.message);
            const errorResult = {
                status: requestError.response?.status || 500, // Default to 500 if no response
                data: requestError.response?.data || { error: 'Internal Server Error' },
            };

            await axios.post(`${PUBLIC_SERVER}/complete`, { id: task.id, result: errorResult });
        }

    } catch (error: any) {
        console.error('Polling error:', error.message);
    }

    // Continue polling
    setTimeout(pollForTasks, 500);
}
