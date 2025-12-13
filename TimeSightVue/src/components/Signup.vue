<script setup lang="ts">
    import axios from 'axios';
    import { ref } from 'vue';

    const API = "http://localhost:3000";

    const username = ref("");
    const email = ref("");
    const password = ref("");
    const password_check = ref("");
    async function signupSubmit() {

        console.log(username.value)
        console.log(email.value);
        console.log(password.value);

        let user;

        try {
            if(password.value != password_check.value) {
                throw Error("password fields don't match.")
            }

            const signup = await axios.post(`${API}/user`, {
                username: username.value,
                email: email.value,
                passwort: password.value
            });

            const login = await axios.post(`${API}/login`, { 
                email: email.value, 
                passwort: password.value 
            }, { withCredentials: true });

            console.log(signup.data)
            console.log(login.data);
            return signup.data;

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
        <input type="text" placeholder="Username" v-model="username" required /> <br>
        <input type="email" placeholder="E-Mail" v-model="email" required /> <br>
        <input type="password" placeholder="Password" v-model="password" required /> <br>
        <input type="password" placeholder="Verify Password" v-model="password_check" /> <br>
        <button type="submit">login</button>
    </form>
</template>

<style scoped>

</style>
