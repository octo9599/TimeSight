<script setup>
    import axios from 'axios';
    import { ref } from 'vue';

    const id = ref(0);
    const bezeichnung = ref("");
    const beschreibung = ref("");
    const datum = ref("");
    const gruppenname = ref("");
    const erstellername = ref("");

    const is_checked = ref(false);

    let is_changed = false;

    const emit = defineEmits(['close']);

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
            is_changed = true;
            console.log((await axios.patch(`${API}/termin/${id.value}`, {
                ist_erledigt: is_checked.value
            })).data);

        } catch (err) {
            console.log(err);
        }

    }

    function closeTermin() {
        emit('close', is_changed);
    }

    defineExpose({init_termin});

</script>

<template>
<div class="taskview">
    <button class="close-btn" @click="closeTermin">x</button>
    <div class="header">
        <h2>-- {{ bezeichnung }} --</h2>
        <div class="desc-row">
            <span id="desc">{{ beschreibung }}</span>
            <cdesc>Erledigt: </cdesc><input id="done" type="checkbox" v-model="is_checked" @change="change_erledigt" />
        </div>
    </div>
    <div class="content">
        <p><cdesc>Am: </cdesc> {{ datum }}</p>
        <p><cdesc>Gruppe: </cdesc> {{ gruppenname }}</p>
        <p><cdesc>Ersteller: </cdesc> {{ erstellername }}</p>
    </div>
</div>
</template>



<style scoped>
    .taskview {
        position: relative;
        padding: 1.5rem 2rem;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
    }

    .close-btn {
        position: absolute;
        top: 12px;
        right: 12px;
        padding-left: 1.5%;
        padding-right:1.5%;
        font-size: 1.2rem;
    }

    .header {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding-right: 2.5rem;
        margin-bottom: 0;
    }

    .desc-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin: 0;
    }

    .content {
        line-height: 1.2;
        margin: 0;
    }

    .content p {
        margin: 0.25rem 0;
    }

    #desc {
        margin: 0;
        line-height: 1.2;
        color: var(--field-light);
        flex: 1;
    }

    cdesc {
        color: var(--field-light);
    }

    h2 {
        margin: 0;
        line-height: 1.2;
    }


</style>