<script setup>
    import axios from 'axios';
    import { onMounted, ref } from 'vue';

    const id = ref(0);
    const bezeichnung = ref("");
    const beschreibung = ref("");
    const datum = ref("");
    const gruppenname = ref("");
    const erstellername = ref("");

    const is_checked = ref(false);

    const API = "http://localhost:3000";
    let termin;
    async function init_termin(termin_id) {
        try {
            id.value = termin_id;

            if(id.value == 0) {
                throw new Error("termin_id is undefined");
            }

            termin = (await axios.get(`${API}/termin/${id.value}`)).data[0];

            bezeichnung.value = termin.bezeichnung;
            beschreibung.value = termin.beschreibung;
            datum.value = termin.datum;
            gruppenname.value = (await axios.get(`${API}/gruppe/${termin.fk_group_id}`)).data[0].gruppenname;
            erstellername.value = (await axios.get(`${API}/user/${termin.fk_ersteller_id}`)).data[0].username;

            is_checked.value = termin.ist_erledigt === 1;

        } catch(err) {
            console.log(err);
        }
    }

    async function change_erledigt() {

        try {
            console.log((await axios.patch(`${API}/termin/${id.value}`, {
                ist_erledigt: is_checked.value
            })).data);

        } catch (err) {
            console.log(err);
        }

    }

    defineExpose({init_termin});

</script>

<template>
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