import myAxios from "../plugis/myAxios.ts";
import type {UserType} from "../models/user";

export const getCurrentUser: () => Promise<UserType> = async ()=>{
    const res = await myAxios.get('/user/current')
    console.log(res,"currentUser")
    if (res.data){
        return res.data
    }
    return null
}
