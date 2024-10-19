import { request } from "@/utils"

interface diseaseFormData {
    accountName: string
}


export function createDisease(formData: diseaseFormData) {
    return request ({
        url: "/account/create",
        method: "POST",
        data: formData
    })
}


export function switchDisease(id: string) {
    return request ({
        url: "/account/switch",
        method: "GET",
        params: {
            accountId: id
        }
    })
}

export function getCurrentDisease() {
    return request ({
        url: "/account/current",
        method: "GET",
    })
}


export function GetRandomString() {
    return request ({
        url: "/users/randomString",
        method: "GET",
    })
}


export function GetAllDiseases() {
    return request ({
        url: "/account/all",
        method: "GET"
    })
}