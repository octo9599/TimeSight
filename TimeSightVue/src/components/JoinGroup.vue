<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';
import axios from 'axios';

const emit = defineEmits(['close', 'group-joined']);

const API = "http://localhost:3000";

const inviteCode = ref("");
const isLoading = ref(false);
const error = ref("");
const input = ref(null);
const groupId = ref(null);
const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const userId = ref(0);
const disableCreate = ref(false);
const groupName = ref("");



onMounted(async () => {
    input.value.focus();
    await userStore.fetchUser();
    userId.value = user.value.pk_user_id;
    console.log(userId.value);
    
});

async function checkIfGroupExists() {
    try {
        const res = await axios.get(`${API}/gruppe`, {
            params: { invite_code: inviteCode.value }
        });
        groupId.value = res.data[0].pk_group_id;
        console.log(res.data[0]);
        console.log(groupId.value);
        console.log(res.data); // TODO should be removed later
        return res.data.length > 0 ? true : false;
    } catch (error) {
        console.error("Error checking if group exists:", error);
        return false;
    }
}

// async function joinGroup() {
//     if (!inviteCode.value.trim()) {
//         error.value = "Bitte geben Sie einen Gruppennamen ein.";
//         return;
//     }

//     if(!await checkIfGroupExists()) {
//         error.value = "Gruppe nicht gefunden.";
//         return;
//     }
    
//     try {
//         await axios.post(`${API}/gruppe_user`, {
//             markierungsfarbe: null,
//             ist_admin: 0,
//             kann_bearbeiten: 0,
//             kann_loeschen: 0,
//             group_id: groupId.value,
//             user_id: userId.value
//         });
//         emit('group-joined');
//     } catch (error) {
//         console.error("Error joining group:", error);
//         error.value = "Fehler beim Beitreten der Gruppe. Bitte versuchen Sie es später erneut.";
//     }
// }

async function joinGroup() {
    if (!inviteCode.value.trim()) {
        error.value = "Bitte geben Sie einen Einladungscode ein.";
        return;
    }

    if (!userId.value) {
        error.value = "Benutzer nicht geladen. Bitte erneut versuchen.";
        return;
    }

    const exists = await checkIfGroupExists();
    if (!exists || !groupId.value) {
        error.value = "Gruppe nicht gefunden.";
        return;
    }

    isLoading.value = true;
    error.value = "";

    console.log(groupId.value);
    console.log(userId.value);
    console.log(inviteCode.value);
    

    try {
        await axios.post(`${API}/gruppe_user`, {
            markierungsfarbe: null,
            ist_admin: 0,
            kann_bearbeiten: 0,
            kann_loeschen: 0,
            group_id: groupId.value,
            user_id: userId.value
        });

        emit('group-joined');
    } catch (err) {
        console.error("Error joining group:", err.response?.data || err);
        error.value = "Fehler beim Beitreten der Gruppe.";
    } finally {
        isLoading.value = false;
    }
}

</script>

<template>
    <div class="form-container">
        <h2>Einer Gruppe beitreten</h2>

        <form @submit.prevent="joinGroup" class="form">
            <div class="form-group">
                <label for="inviteCode">Einladungscode</label>
                <input id="inviteCode" type="text" v-model="inviteCode" placeholder="Einladungscode"
                    :disabled="isLoading" ref="input" />
            </div>

            <div v-if="error" class="error-message">
                {{ error }}
            </div>

            <div class="form-actions">
                <button type="button" class="btn btn-secondary" @click="emit('close')" :disabled="isLoading">
                    <span v-if="!inviteCode">Abbrechen</span>
                    <span v-else>Schließen</span>
                </button>
                <button type="submit" class="btn btn-primary"
                    :disabled="isLoading || !inviteCode.trim() || disableCreate">
                    <span v-if="!disableCreate">Gruppe beitreten</span>
                    <span v-else>OK</span>
                </button>
            </div>
        </form>
    </div>
</template>

<style scoped>
.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

label {
    font-weight: 500;
    color: var(--text-secondary);
}

#inviteCode {
    border: solid 3px var(--text-dark);
    border-radius: 1.5vmax;
}

input[type="text"] {
    padding: 0.75rem;
    background: var(--input-bg);
    color: var(--text-primary);
    font-size: 1rem;
}

.btn {
    padding: 0.75rem 1.5rem;
    border: solid 1.5px var(--text-dark);
    background: transparent;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.btn-primary {
    /* background: var(--accent-dark); */
    color: var(--text-dark);
}

/* .btn-primary:hover:not(:disabled) {
    background: var(--accent-dark);
}*/

.btn-primary:disabled {
    opacity: 0.5;
    /* cursor: not-allowed; */
}

.btn-secondary {
    background: transparent;
    color: var(--text-dark);
    border: 1px solid var(--text-dark);
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1rem;
}
</style>