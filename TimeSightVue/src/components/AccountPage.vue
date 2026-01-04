<script setup>
import { ref, onMounted } from "vue";
import { fetchData } from "./DataAccess.mjs"

let logged = ref(false);
const failed = ref("");

const username = ref("");

onMounted(async () => {
    const data = await fetchData();
    username.value = data.user.username;

});

async function loginSubmit() {
    try {
        logged.value = true;
    } catch (err) {
        if (err.status == 401) {
            failed.value = "Falsches Passwort."
        } else {
            failed.value = `Error Code ${err.status}: Something went wrong during login process.`;
        }
    }
}
</script>
<template>
    <template v-if="!logged">
        <form @submit.prevent="loginSubmit" class="auth-card">
            <div class="headline">
                <h2>Bitte bestätige dein Passwort, um Änderungen vorzunehmen</h2>
            </div>
            <input type="password" placeholder="Passwort" v-model="password" required />

            <div id="error">{{ failed }}</div>

            <button type="submit" class="btn-primary">Login</button>
        </form>
    </template>

    <template v-if="logged">
        <div id="field">
            <table>
                <th colspan="3">
                    <h1>Verwalten</h1>
                </th>
                <tr>
                    <td>Name</td>
                    <td>{{ username }}</td>
                    <td><button class="change-button">ändern</button></td>
                </tr>
                <tr>
                    <td>Passwort</td>
                    <td>••••••••••••••</td>
                    <td><button class="change-button">ändern</button></td>
                </tr>
            </table>
            <div id="del-container">
                <button id="del-button">Account löschen</button>
            </div>
        </div>
    </template>
</template>
<style scoped>
#field {
    background-color: var(--field-dark);
    border: 5px solid var(--field-dark);
    border-radius: 10px;
    margin: 2rem 10rem 2rem 10rem;
}

h1 {
    text-align: left;
    padding: 1rem;
    margin: 0px auto;
}

h2 {
    margin: 0px;
}

table {
    border-collapse: collapse;
    width: 100%;
}

tr {
    border-bottom: 5px solid var(--field-dark);
}

td {
    width: 50%;
    padding: 1rem;
    font-size: larger;
    background-color: var(--main-dark);
}

#del-container {
    text-align: right;
    padding: 0.5rem 1rem;
}

input {
    background-color: var(--text-dark);
    border: 0px;
    border-radius: 3px;
}

button {
    font-size: medium;
    padding: 0.3rem 0.5rem;
    border: 2px;
    border-radius: 4px;
}

#del-button {
    color: var(--text-dark);
    background-color: var(--main-dark);
}

.change-button {
    color: var(--text-dark);
    background-color: var(--field-dark);
}


#error {
  color:crimson;
}

.auth-card{
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  width: min(520px, 92vw);
  padding: 26px;

  background: var(--main-dark);
  border: 6px solid var(--field-dark);
  border-radius: 8px;

  font-family: "Goodland", system-ui, sans-serif;
  color: var(--text-dark);
}

.headline{
  text-align: left;
  margin-bottom: 14px;
}

.btn-primary{
  margin-top: 16px;
  width: 100%;
  height: 42px;

  font-family: "Goodland", system-ui, sans-serif;
  font-size: 14px;
  font-weight: 800;

  color: var(--text-dark);
  background: var(--today-dark);
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}
</style>