import { createApp } from 'vue'
//import './style.css'
import App from './App.vue'
import vant from 'vant'
// 2. 引入组件样式
import 'vant/lib/index.css';
import {createRouter, createWebHashHistory} from "vue-router";
import {routes} from "./config/route.ts";
import {getCurrentUser} from "./services/user.ts";
import {getCurrentUserState, setCurrentUserState} from "./state/user.ts";


const router=createRouter({
    history: createWebHashHistory(),
    routes
})

// 不需要登录就能访问的页面
const WHITE_LIST = ['/login', '/register']

// 全局路由守卫：未登录一律跳登录页，登录成功后再回到原来想去的页面
router.beforeEach(async (to) => {
    if (WHITE_LIST.includes(to.path)) {
        return true
    }
    // 已经拿过登录态就直接放行，避免每次跳转都请求一次接口
    let currentUser: any = getCurrentUserState()
    if (!currentUser) {
        try {
            currentUser = await getCurrentUser()
        } catch (e) {
            currentUser = null
        }
        if (currentUser) {
            setCurrentUserState(currentUser)
        }
    }
    if (!currentUser) {
        return {
            path: '/login',
            query: {redirect: to.fullPath}
        }
    }
    return true
})

const app=createApp(App)
app.use(vant)
app.use(router)
app.mount('#app')
