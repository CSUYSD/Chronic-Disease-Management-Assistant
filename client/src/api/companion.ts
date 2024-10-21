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


export function GetPatientInfo() {
    return request ({
        url: "/users/companion/patientInfo",
        method: "GET"
    })
}