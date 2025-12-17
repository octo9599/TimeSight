import {defineStore} from "pinia";
import {ref} from "vue";
import axios from "axios";

export const useUserStore = defineStore("user", () => {
	const user = ref(null);

	async function fetchUser() {
		try {
			const res = await axios.get(`http://localhost:3000/me`, {
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