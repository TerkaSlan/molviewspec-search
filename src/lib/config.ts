export const config = {
    api: {
        baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
        endpoints: {
            search: '/api/search',
            mapping: '/api/mapping'
        }
    }
}; 