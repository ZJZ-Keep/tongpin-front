import myAxios from "../plugis/myAxios.ts";

export const getCurrentUser = async ()=>{
    const res = await myAxios.get('/user/current')
    console.log(res,"currentUser")
    if (res.data){
        return res.data
    }
    return null
}
