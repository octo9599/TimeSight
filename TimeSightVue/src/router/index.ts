import {createRouter, createWebHistory, type Router} from 'vue-router'
import ListView from '@/ListView.vue';
import AuthPage from '@/AuthPage.vue';
import CalendarView from '@/CalendarView.vue';
import Groups from '@/Groups.vue';
import logoutTest from '@/apiTests/logoutTest.vue';
import {useUserStore} from '@/stores/user';
import AccountPage from '@/components/AccountPage.vue';

const router: Router = createRouter({
	// would be used if the root of the app is not stored at /
	// history: createWebHistory(import.meta.env.BASE_URL),
	history: createWebHistory(),
	routes: [
		{path: "/", component: ListView},
		{path: "/auth", component: AuthPage},
		{path: "/calendar", component: CalendarView},
		{path: "/logout", component: logoutTest},
		{path: "/list", component: ListView},
		{path: "/groups", component: Groups},
		{path: "/account", component: AccountPage}
	],
});

router.beforeEach(async (to) => {

	const userStore = useUserStore();

	// Fetch user only once
	if (userStore.user === null) {
		await userStore.fetchUser();
	}

	// Not logged in → going to protected route
	if (!userStore.user && to.path !== '/auth') {
		return '/auth';
	}

	//Logged in → trying to access auth page
	if (userStore.user && to.path === '/auth') {
		return '/';
	}

	//Allow navigation
	return true;
});


export default router