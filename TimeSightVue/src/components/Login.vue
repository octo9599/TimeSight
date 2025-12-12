<script setup>

    import { ref } from 'vue';
    import axios from 'axios';

    const API = "http://localhost:3000"
    const email = ref("");
    const password = ref("");

    async function loginSubmit() {

        console.log(email.value);
        console.log(password.value);

        let user;

        try {

            const res = await axios.post(`${API}/login`, { email: email.value, passwort: password.value }, { withCredentials: true });

            console.log(res.data);
            return res.data;

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
