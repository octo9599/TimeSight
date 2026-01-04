<script setup>
    import { ref, onMounted } from "vue";
    import { fetchData } from "./DataAccess.mjs"
    import { useUserStore } from "@/stores/user"

    const username = ref("");

    onMounted (async () => {
        const data = await fetchData();
        username.value = data.user.username;

    });
    
</script>
<template>
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
</style>