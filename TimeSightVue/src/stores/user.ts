import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { API } from '../components/DataAccess.mjs'

export const useUserStore = defineStore('user', () => {
	const user = ref(null)

	async function fetchUser() {
		try {
			const res = await axios.get(`${API}/me`, {
				withCredentials: true
			});
			user.value = res.data;
		} catch {
			user.value = null;
		}
	}

	return {
		user,
		fetchUser
	};
});