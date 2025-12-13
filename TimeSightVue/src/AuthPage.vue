<script setup>

    import axios from 'axios';
    import { ref, onMounted } from 'vue';
    import { useUserStore } from './stores/user';
    import { useRouter } from 'vue-router';

    import Login from './components/Login.vue';
    import Signup from './components/Signup.vue';

    const isLogin = ref(true);

    const router = useRouter();
	const userStore = useUserStore();

	onMounted( () => {
		authorize_token();
	});

	async function authorize_token() {

		await userStore.fetchUser();
		if(userStore.user != null) {
			router.push("/");
		}

	}

</script>

<template>

    <div>
        <button @click=" isLogin = !isLogin"> Toggle Login/Signup</button>
        <Login v-if="isLogin" />
        <Signup v-else="!isLogin" />
    </div>
</template>

<style scoped>

</style>
