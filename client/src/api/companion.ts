import { request } from "@/utils/request"

interface BindPatientFormData {
    randomString: string
}


export function BindPatientAPI(requestBody: BindPatientFormData) {
    return request ({
        url: "/users/bindCompanion",
        method: "POST",
        data: requestBody
    })
}


export function GetRandomString(id) {
    return request ({
        url: `/users/randomString/${id}`,
        method: "GET",
    })
}