<script setup>
    import { onMounted, ref } from 'vue';
    import { fetchData } from './DataAccess.mjs';
    import axios from 'axios';

    const emit = defineEmits(['close']);

    const API = "http://localhost:3000";

    let data = null;
    const groupsOfUser = ref("loading...");

    const bezeichnung = ref("");
    const beschreibung = ref("");
    const datum = ref("");
    const uhrzeit = ref("");
    const groupSelect = ref(null);

    onMounted(async () => {
        data = await fetchData();
        groupsOfUser.value = data.groupsIn.data;
    });
    
    async function createTermin() {

        console.log(datum.value);
        console.log(uhrzeit.value);

        await axios.post(`${API}/termin`, {
            bezeichnung: bezeichnung.value,
            beschreibung: beschreibung.value,
            datum: datum.value,
            uhrzeit: uhrzeit.value,
            group_id: groupSelect.value,
            user_id: data.user.pk_user_id
        });

        emit('close');

    }
</script>

<template>
    <form @submit.prevent="createTermin">
        <h2>-- Termin Erstellen --</h2>
        Bezeichnung: <input type="text" v-model="bezeichnung" placeholder="Familientreffen" required/> <br>
        Beschreibung: <input type="text" v-model="beschreibung" placeholder="Treffen bei Oma"/> <br>
        Datum: <input type="date" v-model="datum" placeholder="Batum" required/> <br>
        Uhrzeit: <input type="time" v-model="uhrzeit" placeholder="Uhrzeit"/> <br>
        für Gruppe: 
        <select v-model="groupSelect" required>
            <option v-for="group in groupsOfUser" :value="group.pk_group_id">{{group.gruppenname}}</option>
        </select> <br>
        <button type="submit">Erstellen</button>
    </form>
</template>

<style scoped>

</style>