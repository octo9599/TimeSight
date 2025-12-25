<script setup>
    import axios from 'axios';
import { onMounted, ref } from 'vue';

    const props = defineProps(['termin_id']);
    const bezeichnung = ref("");
    const beschreibung = ref("");
    const datum = ref("");
    const gruppenname = ref("");
    const erstellername = ref("");

    const is_checked = ref(false);

    const API = "http://localhost:3000";
    let termin;
    async function init_termin() {
        try {
            termin = (await axios.get(`${API}/termin/${props.termin_id}`)).data[0];
            bezeichnung.value = termin.bezeichnung;
            beschreibung.value = termin.beschreibung;
            datum.value = termin.datum;

            gruppenname.value = (await axios.get(`${API}/gruppe/${termin.fk_group_id}`)).data[0].gruppenname;
            erstellername.value = (await axios.get(`${API}/user/${termin.fk_ersteller_id}`)).data[0].username;

            is_checked.value = termin.ist_erledigt === 1;
            console.log(is_checked.value);

        } catch(err) {
            console.log(err);
        }
    }

    async function change_erledigt() {

        try {
            console.log((await axios.patch(`${API}/termin/${props.termin_id}`, {
                ist_erledigt: is_checked.value
            })).data);

        } catch (err) {
            console.log(err);
        }

    }

</script>

<template>
    <button @click="init_termin">init termin</button>
    <div>
        {{ bezeichnung }} <br>
        <input type="checkbox" v-model="is_checked" @change="change_erledigt"/> <br>
        {{ beschreibung }} <br>
        {{ datum }} <br>
        {{ gruppenname }} <br>
        {{ erstellername }}
    </div>
</template>

<style scoped>
    div {
        color: black;
    }
</style>