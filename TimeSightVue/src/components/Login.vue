<script setup>

    import { ref } from 'vue';
    import axios from 'axios';
    import { useUserStore } from '@/stores/user';

    const API = "http://localhost:3000"
    const email = ref("");
    const password = ref("");

    const userStore = useUserStore();

    async function loginSubmit() {

        console.log(email.value);
        console.log(password.value);

        let user;

        try {

            const res = await axios.post(`${API}/login`, { email: email.value, passwort: password.value }, { withCredentials: true });

            userStore.fetchUser().then(() => {if(userStore.user) { console.log(userStore.user.pk_user_id); }}); 

            console.log(res.data);
            window.location.reload();

        } catch (err) {
            console.log(err);
        }
    }

</script>

<template>
    <p>
        Login
    </p>

    <form @submit.prevent="loginSubmit">
        <input type="email" placeholder="E-Mail" v-model="email" required /> <br>
        <input type="password" placeholder="Password" v-model="password" required /> <br>
        <button type="submit">login</button>
    </form>
</template>

<style scoped>

</style>
