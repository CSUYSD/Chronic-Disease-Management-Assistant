import { request } from "@/utils"
import { AxiosResponse } from 'axios';

interface LoginFormData {
    username: string;
    password: string;
}

interface SignUpFormData {
    username: string;
    email: string;
    phone: string;
    password: string;
    dob: string;

}

interface UpdateUserDetails {
    username?: string;
    email?: string;
    // 添加其他可更新的字段
}

/**
 * User Login API
 * @param {LoginFormData} formData - The login form data
 * @returns {Promise<AxiosResponse>} - The API response
 */
export function loginAPI(formData: LoginFormData): Promise<AxiosResponse> {
    console.log("Sending login data:", formData);
    return request({
        url: '/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: formData
    });
}

/**
 * User Sign Up API
 * @param {SignUpFormData} formData - The sign up form data
 * @param role
 * @returns {Promise<AxiosResponse>} - The API response
 */
export function signUpAPI(formData: SignUpFormData, role: string): Promise<AxiosResponse> {
    console.log("Sending sign up data:", formData);
    return request({
        url: '/signup',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: formData,
        params: {role}
    });
}

/**
 * User Logout API
 * @returns {Promise<AxiosResponse>} - The API response
 */
export function logoutAPI(): Promise<AxiosResponse> {
    return request({
        url: '/logout',
        method: 'GET',
    });
}

/**
 * Get User Profile API
 * @returns {Promise<AxiosResponse>} - The API response
 */
export function getProfileAPI(): Promise<AxiosResponse> {
    return request({
        url: '/users/info',
        method: 'GET',
    });
}

/**
 * Update Password API
 * @param {string} oldPassword - The old password
 * @param {string} newPassword - The new password
 * @returns {Promise<AxiosResponse>} - The API response
 */
export function updatePasswordAPI(oldPassword: string, newPassword: string): Promise<AxiosResponse> {
    console.log("Updating password");
    return request({
        url: '/updatePwd',
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            oldPassword,
            newPassword
        }
    });
}

/**
 * Update User API
 * @param {string} id - The user ID
 * @param {UpdateUserDetails} userDetails - The user details to update
 * @returns {Promise<AxiosResponse>} - The API response
 */
export function updateUserAPI(userDetails: UpdateUserDetails): Promise<AxiosResponse> {
    console.log("Updating user details:", userDetails);
    return request({
        url: "/users/update/",
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        data: userDetails
    });
}

/**
 * Update Avatar API
 * @param {string} avatarUrl - The new avatar URL
 * @returns {Promise<AxiosResponse>} - The API response
 */
export function updateAvatarAPI(avatarUrl: string): Promise<AxiosResponse> {
    console.log("Updating avatar URL:", avatarUrl);
    return request({
        url: '/users/updateAvatar',
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            avatar: avatarUrl
        }
    });
}