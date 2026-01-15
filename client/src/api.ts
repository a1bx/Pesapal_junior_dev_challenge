import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

export const executeQuery = async (query: string) => {
    const response = await axios.post(`${API_BASE}/query`, { query });
    return response.data;
};

export const getStudents = async () => {
    const response = await axios.get(`${API_BASE}/students`);
    return response.data;
};

export const getCourses = async () => {
    const response = await axios.get(`${API_BASE}/courses`);
    return response.data;
};

export const getEnrollments = async () => {
    const response = await axios.get(`${API_BASE}/enrollments`);
    return response.data;
};
