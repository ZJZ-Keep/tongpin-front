import Index from "../pages/Index.vue";
import TeamPage from "../pages/TeamPage.vue";
import UserPage from "../pages/UserPage.vue";
import SearchPage from "../pages/SearchPage.vue";
import UserEditPage from "../pages/UserEditPage.vue";
import searchResultPage from "../pages/SearchResultPage.vue";
import UserLoginPage from "../pages/UserLoginPage.vue";
import UserRegisterPage from "../pages/UserRegisterPage.vue";
import TeamAddPage from "../pages/TeamAddPage.vue";
import UserTeamCreatePage from "../pages/UserTeamCreatePage.vue";
import UserTeamJoinPage from "../pages/UserTeamJoinPage.vue";
import UserEditTagsPage from "../pages/UserEditTagsPage.vue";
import ChatPage from "../pages/ChatPage.vue";
import MessageListPage from "../pages/MessageListPage.vue";

export const routes=[
    {
        path:'/',
        title: '首页',
        component: Index
    },
    {
        path:'/team',
        title: '找队伍',
        component: TeamPage
    },
    {
        path: '/user',
        title: '用户信息',
        component: UserPage
    },
    {
        path: '/search',
        title: '搜索',
        component: SearchPage
    },
    {
        path: '/user/edit',
        title: '用户信息修改',
        component: UserEditPage
    },
    {
        path: '/search/searchResult',
        title: '搜索结果',
        component: searchResultPage
    },
    {
        path: '/login',
        title: '登录',
        component: UserLoginPage
    },
    {
        path: '/register',
        title: '注册',
        component: UserRegisterPage
    },
    {
        path: '/team/add',
        title: '创建队伍',
        component: TeamAddPage
    },
    {
        path: '/user/team/create',
        title: '我创建的队伍',
        component: UserTeamCreatePage
    },
    {
        path: '/user/team/join',
        title: '我加入的队伍',
        component: UserTeamJoinPage
    },
    {
        path: '/user/tags',
        title: '我的标签',
        component: UserEditTagsPage
    },
    {
        path: '/chat/:userId',
        title: '聊天',
        component: ChatPage
    },
    {
        path: '/messages',
        title: '消息',
        component: MessageListPage
    }
]