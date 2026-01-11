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

    const termin = await axios.post(`${API}/termin`, {
        bezeichnung: bezeichnung.value,
        beschreibung: beschreibung.value,
        datum: datum.value,
        uhrzeit: uhrzeit.value,
        group_id: groupSelect.value,
        user_id: data.user.pk_user_id
    });

    const users = (await axios.get(`${API}/gruppe/${groupSelect.value}/user`)).data;

    console.log(termin.data.id)
    for(const user of users) {
        await axios.post(`${API}/termin_user`, {termin_id: termin.data.id, user_id: user.pk_user_id});
    }

    emit('close');

}
</script>

<template>
    <form class="termin-card" @submit.prevent="createTermin">
        <h2 class="title">Termin erstellen</h2>

        <div class="field">
            <label>Bezeichnung</label>
            <input
                type="text"
                v-model="bezeichnung"
                placeholder="Familientreffen"
                required
            />
        </div>

        <div class="field">
            <label>Beschreibung</label>
            <input
                type="text"
                v-model="beschreibung"
                placeholder="Treffen bei Oma"
            />
        </div>

        <div class="row">
            <div class="field">
                <label>Datum</label>
                <input type="date" v-model="datum" required />
            </div>

            <div class="field">
                <label>Uhrzeit</label>
                <input type="time" v-model="uhrzeit" />
            </div>
        </div>

        <div class="field">
            <label>Team</label>
            <span v-if="groupsOfUser.length > 0">
                <select v-model="groupSelect" required>
                    <option
                        v-for="group in groupsOfUser"
                        :key="group.pk_group_id"
                        :value="group.pk_group_id"
                    >
                        {{ group.gruppenname }}
                    </option>
                </select>
            </span>

            <span v-else class="hint">
                An keinen Gruppen teilnehmend!
                <router-link
                    to="/groups"
                    @click="emit('close')"
                >
                    Gruppe erstellen oder beitreten
                </router-link>
            </span>
        </div>

        <div class="actions">
            <button type="submit" class="primary">
                Erstellen
            </button>
        </div>
    </form>
</template>


<style scoped>
/* =========================
   CARD
========================= */

.termin-card {
    background: var(--main);
    border-radius: 18px;
    padding: 28px;
    width: min(480px, 92vw);

    display: flex;
    flex-direction: column;
    gap: 18px;

    border: 7px solid var(--field);
}


/* =========================
   TITLE
========================= */

.title {
    margin: 0 0 10px 0;
    font-size: 1.4rem;
    text-align: center;
    color: var(--text);
}

/* =========================
   FIELDS
========================= */

.field {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.field label {
    font-size: 0.85rem;
    opacity: 0.85;
    color: var(--text);
}

.field input,
.field select {
    padding: 12px 14px;
    border-radius: 10px;

    background: var(--field);
    border: 2px solid var(--field);

    color: var(--text);
    font-size: 0.95rem;
}

.field input:focus,
.field select:focus {
    outline: none;
    border-color: var(--accent);
}

/* =========================
   ROW (DATE + TIME)
========================= */

.row {
    display: flex;
    gap: 14px;
}

.row .field {
    flex: 1;
}

/* =========================
   ACTIONS
========================= */

.actions {
    display: flex;
    justify-content: center;
    margin-top: 10px;
}

.primary {
    background: var(--today);
    color: white;

    border: none;
    border-radius: 12px;

    padding: 12px 28px;
    font-size: 1rem;
    cursor: pointer;

    transition: opacity 0.15s ease;
}

.primary:hover {
    opacity: 0.9;
}

/* =========================
   HINT / EMPTY STATE
========================= */

.hint {
    font-size: 0.85rem;
    opacity: 0.85;
}

.hint a {
    color: var(--accent);
    text-decoration: none;
}

.hint a:hover {
    text-decoration: underline;
}
</style>