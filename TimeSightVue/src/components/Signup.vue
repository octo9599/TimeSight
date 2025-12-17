<script setup>
import axios from 'axios';
import {ref} from 'vue';
import {useUserStore} from '@/stores/user';

const API = "http://localhost:3000";

const username = ref("");
const password = ref("");
const password_check = ref("");

const userStore = useUserStore();

async function signupSubmit() {

	console.log(username.value)
	console.log(password.value);

	let user;

	try {
		if (password.value != password_check.value) {
			throw Error("password fields don't match.")
		}

		const signup = await axios.post(`${API}/user`, {
			username: username.value,
			passwort: password.value
		});

		const login = await axios.post(`${API}/login`, {
			username: username.value,
			passwort: password.value
		}, {withCredentials: true});

		window.location.reload();

	} catch (err) {
		console.log(err);
	}

}

</script>

<template>
	<p>
		Signup
	</p>

	<form @submit.prevent="signupSubmit">
		<input v-model="username" placeholder="Username" required type="text"/> <br>
		<input v-model="password" placeholder="Password" required type="password"/> <br>
		<input v-model="password_check" placeholder="Verify Password" type="password"/> <br>
		<button type="submit">login</button>
	</form>
</template>

<style scoped>

</style>