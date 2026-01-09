<script setup>
    import axios from 'axios';
    import { ref } from 'vue';
    import { fetchData, API } from "./DataAccess.mjs";

    const termin = ref({});
    const id = ref(0);
    const bezeichnung = ref("");
    const beschreibung = ref("");
    const datum = ref("");
    const gruppenname = ref("");
    const erstellername = ref("");

    const newName = ref(null);
    const newDesc = ref(null);
    const newDate = ref(null);
    const newGroup = ref(null);
    const newTime = ref(null);

    const groups = ref([]);
    const userPerms = ref({});
    const showEdit = ref(false);

    const is_checked = ref(false);

    let is_changed = false;

    const emit = defineEmits(['close']);

    async function init_termin(termin_id) {
        try {
            id.value = termin_id;

            if(id.value == 0) {
                throw new Error("termin_id is undefined");
            }

            termin.value = (await axios.get(`${API}/termin/${id.value}`)).data[0];

            bezeichnung.value = termin.value.bezeichnung;
            beschreibung.value = termin.value.beschreibung;
            datum.value = termin.value.datum;
            gruppenname.value = (await axios.get(`${API}/gruppe/${termin.value.fk_group_id}`)).data[0].gruppenname;
            erstellername.value = (await axios.get(`${API}/user/${termin.value.fk_ersteller_id}`)).data[0].username;

            is_checked.value = termin.value.ist_erledigt === 1;

            newName.value = bezeichnung.value;
            newDesc.value = beschreibung.value;
            newDate.value = datum.value.substring(0, datum.value.indexOf(' '));
            newTime.value = datum.value.substring(datum.value.indexOf(' ')+1, datum.value.indexOf(':00'));
            newGroup.value = termin.value.fk_group_id;

            await getUserPerms();

        } catch(err) {
            console.log(err);
        }
    }

    async function getUserPerms() {

        try {

            const data = await fetchData();
            groups.value = data.groupsIn.data;
            const perms = (await axios.get(`${API}/gruppe_user`, {
                params: {user_id: data.user.pk_user_id, group_id: termin.value.fk_group_id}
            })).data[0];
            if(perms.ist_admin == 1 || termin.value.fk_ersteller_id == data.user.pk_user_id) {
                userPerms.value['kann_bearbeiten'] = true;
                userPerms.value['kann_loeschen'] = true;
            } else {
                userPerms.value['kann_bearbeiten'] = perms.kann_bearbeiten == 1;
                userPerms.value['kann_loeschen'] = perms.kann_loeschen == 1;
            }

        } catch (err) {
            console.error("Error while fetching user's permission: ", err);
        }

    }

    async function updateTask() {

        try {
            const date_time = `${newDate.value} ${newTime.value}:00`;
            await axios.patch(`${API}/termin/${id.value}`, {
                bezeichnung: newName.value,
                beschreibung: newDesc.value,
                datum: date_time,
                fk_group_id: newGroup.value,
            });
            showEdit.value = false;
            init_termin(id.value);
        } catch (err) {
            console.error("Error while updating Task: ", err);
        }

    }

    async function deleteTask() {

        try {

            await axios.delete(`${API}/termin/${id.value}`);
            is_changed = true;
            closeTermin();

        } catch (err) {
            console.error("Error while deleting Task: ", err);
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
<div class="taskview" v-if="!showEdit">
    <button class="close-btn" @click="closeTermin">x</button>
    <div class="header">
        <h2>-- {{ bezeichnung }} --</h2>
        <div class="desc-row">
            <span id="desc">{{ beschreibung }}</span>
            <span class="cdesc">Erledigt: </span><input id="done" type="checkbox" v-model="is_checked" @change="change_erledigt" />
        </div>
    </div>
    <div class="content">
        <p><span class="cdesc">Am: </span> {{ datum }}</p>
        <p><span class="cdesc">Gruppe: </span> {{ gruppenname }}</p>
        <p><span class="cdesc">Ersteller: </span> {{ erstellername }}</p>
    </div>
    <button v-if="userPerms['kann_bearbeiten']" @click="showEdit = true">Bearbeiten</button>
    <button v-if="userPerms['kann_loeschen']" @click="deleteTask">Termin Löschen</button>
</div>
<div v-else>
    <form @submit.prevent="updateTask">
        <input type="text" v-model="newName" required/> <br>
        <input type="text" v-model="newDesc"/> <br>
        <input type="date" v-model="newDate" required/> <br>
        <input type="time" v-model="newTime" required/> <br>
        <select v-model="newGroup">
            <option v-for="group in groups" :value="group.pk_group_id">
                {{ group.gruppenname }}
            </option>
        </select> <br>
        <button type="submit">Bestätigen</button>
        <button @click="showEdit = false">Abbrechen</button>
    </form>
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

    .cdesc {
        color: var(--field-light);
    }

    h2 {
        margin: 0;
        line-height: 1.2;
    }


</style>