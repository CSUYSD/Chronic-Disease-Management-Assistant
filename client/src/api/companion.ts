import { request } from "@/utils/request"



export function BindPatientAPI(randomString: string) {
    return request ({
        url: "/companion/bind",
        method: "POST",
        params: {
            uuid: randomString
        }
    })
}


export function GetPatientInfo() {
    return request ({
        url: "/companion/patientInfo",
        method: "GET"
    })
}

export function GetPatientRecords(accountName: string) {
    return request ({
        url: "/companion/bind-patient-records",
        method: "GET",
        params: {
            accountName: accountName
        }
    })
}

export function GetPatientWarningRecords() {
    return request ({
        url: "/warning",
        method: "GET"
    })
}