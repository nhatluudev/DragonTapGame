import axios from 'axios';
console.log(import.meta.env.VITE_ENV)
console.log(import.meta.env.VITE_SERVER_ORIGIN)
console.log(import.meta.env.VITE_SERVER_LOCAL_ORIGIN)
const newRequest = axios.create({
    baseURL: (import.meta.env.VITE_ENV === 'production' ? import.meta.env.VITE_SERVER_ORIGIN : import.meta.env.VITE_SERVER_LOCAL_ORIGIN) + "/api",
    withCredentials: true,
});

const getLoggedInRequestConfig = (data) => {
    let contentType = 'application/json';
    if (data instanceof FormData) {
        contentType = 'multipart/form-data';
    }
    return {
        headers: {
            "Content-Type": contentType,
        },
        withCredentials: true,
    };
};

const apiUtils = {
    async get(url, data = {}, config = {}) {
        const requestConfig = { ...getLoggedInRequestConfig(data), ...config };
        return newRequest.get(url, data, requestConfig);
    },

    async post(url, data = {}, config = {}) {
        const requestConfig = { ...getLoggedInRequestConfig(data), ...config };
        return newRequest.post(url, data, requestConfig);
    },

    async patch(url, data = {}, config = {}) {
        const requestConfig = { ...getLoggedInRequestConfig(data), ...config };
        return newRequest.patch(url, data, requestConfig);
    },

    async delete(url, config = {}) {
        const requestConfig = { ...getLoggedInRequestConfig(), ...config };
        return newRequest.delete(url, requestConfig);
    }
};

function createFormData(inputs, filesKey, files) {
    const formData = new FormData();

    // Append non-file inputs
    for (const key in inputs) {
        if (inputs.hasOwnProperty(key)) {
            formData.append(key, inputs[key]);
        }
    }

    // Append file inputs
    files.forEach(file => {
        if (file) {
            formData.append(filesKey, file);
        }
    });

    return formData;
}

export { createFormData, newRequest, apiUtils };