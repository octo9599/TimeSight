<script setup>
    import axios from 'axios';
    import { ref } from 'vue';
    import { useUserStore } from '@/stores/user';

    const API = "http://localhost:3000";

    const username = ref("");
    const email = ref("");
    const password = ref("");
    const password_check = ref("");

    const userStore = useUserStore();

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

            userStore.fetchUser().then(() => {if(userStore.user) { console.log(userStore.user.pk_user_id); }}); 

            console.log(signup.data)
            console.log(login.data);
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
        <input type="text" placeholder="Username" v-model="username" required /> <br>
        <input type="email" placeholder="E-Mail" v-model="email" required /> <br>
        <input type="password" placeholder="Password" v-model="password" required /> <br>
        <input type="password" placeholder="Verify Password" v-model="password_check" /> <br>
        <button type="submit">login</button>
    </form>
</template>

<style scoped>

</style>
