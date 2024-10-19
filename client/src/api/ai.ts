import { request } from "@/utils"
import { AxiosResponse } from 'axios';


interface FluxMessageParams {
    prompt: string;
    sessionId: string;
}

interface UploadFileFormData extends FormData {
    append(name: string, value: Blob | string, fileName?: string): void;
}

interface ChatWithFileParams {
    prompt: string;
    conversationId: string;
}

const MessageAPI = 'ai/chat'

const DocumentAPI = 'vector-db'

const AnalyserAPI = 'ai/analyser'

/**
 * Flux Message with History API
 * @param {FluxMessageParams} params - The message form data
 * @returns {Promise<AxiosResponse<string>>} - The API response
 */
export function FluxMessageWithHistoryAPI(params: FluxMessageParams): Promise<AxiosResponse<string>> {
    console.log("Sending flux message data:", params);
    return request({
        url: `${MessageAPI}/general`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        params: params
    });
}

/**
 * Upload File API
 * @param {UploadFileFormData} formData - The file form data
 * @returns {Promise<AxiosResponse>} - The API response
 */
export function UploadFileAPI(formData: UploadFileFormData): Promise<AxiosResponse> {
    console.log("Uploading file data:", formData);
    return request({
        url: `${DocumentAPI}/etl/read/multipart`,
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data: formData
    });
}

/**
 * Clear File API
 * @returns {Promise<AxiosResponse>} - The API response
 */
export function ClearFileAPI(): Promise<AxiosResponse> {
    return request({
        url: `${DocumentAPI}/etl/clear`,
        method: 'GET'
    });
}

/**
 * Clear File by FileName API
 * @returns {Promise<AxiosResponse>} - The API response
 * @param fileName
 */
export function ClearFileByFileName(fileName: string): Promise<AxiosResponse> {
    return request ({
        url: `${DocumentAPI}/etl/delete/${fileName}`,
        method: "DELETE"
    })
}

/**
 * Chat with File API
 * @param {ChatWithFileParams} params - The chat form data
 * @returns {Promise<AxiosResponse<string>>} - The API response
 */
export function ChatWithFileAPI(params: ChatWithFileParams): Promise<AxiosResponse<string>> {
    console.log("Sending chat with file data:", params);
    return request({
        url: `${MessageAPI}/rag`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        params: params
    });
}

/**
 * Chat with File API
 * @returns {Promise<AxiosResponse<string>>} - The API response
 */
export function GenerateReportAPI(): Promise<AxiosResponse<string>> {
    console.log("generate ai report");
    return request({
        url: `${AnalyserAPI}/health-report`,
        method: 'POST',
        responseType: 'text'
    });
}