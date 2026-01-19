<script setup>
import { ref, onMounted, watch } from 'vue';
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';
import axios from 'axios';
import { API } from "@/components/DataAccess.mjs";

const emit = defineEmits(['close', 'group-created']);

const gruppenname = ref("");
const inviteCode = ref("");
const isLoading = ref(false);
const error = ref("");
const input = ref(null);
const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const userId = ref(0);
// const markierungsfarbe = ref("");
const disableCreate = ref(false);

onMounted(async () => {
    input.value.focus();
    await userStore.fetchUser();
    userId.value = user.value.pk_user_id;
});

watch(() => gruppenname.value, (newVal) => {
    if (newVal.length > 30) {
        error.value = "Der Gruppenname darf nicht länger als 30 Zeichen sein.";
        disableCreate.value = true;
    } else {
        error.value = "";
        disableCreate.value = false;
    }
}, { immediate: true });

// Helper: generate a 8-letter code
function generateInviteCode() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 8; i++) {
        result += letters[Math.floor(Math.random() * letters.length)];
    }
    inviteCode.value = result;
}

async function checkIfInviteCodeExists(code) {
    try {
        const res = await axios.get(`${API}/gruppe`, {
            params: { invite_code: code }
        });

        // Common safe checks:
        // - If backend returns an array of matches: return res.data.length > 0
        // - If backend returns { exists: true/false }: return !!res.data.exists
        // - If backend returns a single object when found or null when not: return !!res.data
        if (Array.isArray(res.data)) {
            return res.data.length > 0;
        }
        if (res.data && typeof res.data === 'object') {
            if ('exists' in res.data) return !!res.data.exists;
            // if object returned for found, empty object for not found -> check keys
            return Object.keys(res.data).length > 0;
        }
        // fallback for scalar responses
        return !!res.data;
    } catch (err) {
        console.error('Error checking invite code:', err);
        // On network error we return false so we don't block creation — adjust if you prefer otherwise.
        return false;
    }
}

function extractGroupIdFromResponse(data) {
    // Handles multiple backend shapes:
    // - array of group objects -> take first.pk_group_id
    // - single object with pk_group_id
    // - object with nested keys (try common names)
    if (!data) return null;
    if (Array.isArray(data) && data.length > 0) {
        return data[0].pk_group_id ?? data[0].fk_group_id ?? data[0].id ?? null;
    }
    if (typeof data === 'object') {
        return data.pk_group_id ?? data.fk_group_id ?? data.id ?? null;
    }
    return null;
}

async function createGroup() {
    if (!gruppenname.value.trim()) {
        error.value = "Bitte geben Sie einen Gruppennamen ein.";
        return;
    }

    error.value = "";
    isLoading.value = true;

    try {
        do {
            generateInviteCode();
        } while (await checkIfInviteCodeExists(inviteCode.value));

        const response = await axios.post(`${API}/gruppe`, {
            gruppenname: gruppenname.value.trim(),
            invite_code: inviteCode.value
        });

        // After creating the group, fetch it by invite_code to get the pk_group_id
        let groupId = null;
        try {
            const getRes = await axios.get(`${API}/gruppe`, {
                params: { invite_code: inviteCode.value }
            });
            groupId = extractGroupIdFromResponse(getRes.data);

            // Fallback: maybe POST returned the created group id
            if (!groupId && response && response.data) {
                groupId = extractGroupIdFromResponse(response.data);
            }

            if (!groupId) {
                throw new Error("Could not determine group id after creation.");
            }
        } catch (err) {
            console.error("Error fetching group by invite code:", err);
            throw new Error("Gruppe wurde erstellt, aber die Gruppen-ID konnte nicht ermittelt werden.");
        }

        // Insert into Gruppe_User (Zwischentabelle)
        try {
            await axios.post(`${API}/gruppe_user`, {
                // markierungsfarbe: markierungsfarbe.value, // must be hex like "#rrggbb"
                ist_admin: 1,
                kann_bearbeiten: 1,
                kann_loeschen: 1,
                group_id: groupId,
                user_id: userId.value
            });
        } catch (err) {
            console.error("Error inserting into Gruppe_User:", err);
            throw new Error("Gruppe wurde erstellt, aber das Hinzufügen des Benutzers zur Gruppe ist fehlgeschlagen.");
        }

        disableCreate.value = true;

        emit('group-created', response.data);
    } catch (err) {
        console.error('Error creating group:', err);
        error.value = "Fehler beim Erstellen der Gruppe. Bitte versuchen Sie es später erneut.";
    } finally {
        isLoading.value = false;
    }
}
</script>


<template>
    <div class="add-group-form">
        <h2>Neue Gruppe erstellen</h2>

        <form @submit.prevent="createGroup" class="group-form">
            <div class="form-group">
                <label for="groupName">Gruppenname</label>
                <input id="groupName" type="text" v-model="gruppenname" placeholder="Meine Gruppe" :disabled="isLoading"
                    ref="input" />
            </div>

            <!-- NEW: markierungsfarbe input -->
            <!-- <div class="form-group">
                <label for="markierungsfarbe">Markierungsfarbe</label>
                <div style="display:flex; align-items:center; gap:0.5rem;">
                    <input id="markierungsfarbe" type="color" v-model="markierungsfarbe" :disabled="isLoading" />
                    <input type="text" v-model="markierungsfarbe" readonly style="width:8rem; padding:0.4rem; border-radius:4px;" />
                </div>
                <small>Wählen Sie eine Farbe für die Termine dieser Gruppe (accountgebunden)</small>
            </div> -->

            <div v-if="inviteCode" class="invite-code">
                <label>Einladungscode:</label>
                <div class="code-display">{{ inviteCode }}</div>
                <small>Teile diesen Code mit deinen Freunden, damit sie der Gruppe beitreten können.</small>
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
                    :disabled="isLoading || !gruppenname.trim() || disableCreate">
                    <span v-if="!disableCreate">Gruppe erstellen</span>
                    <span v-else>OK</span>
                </button>
            </div>
        </form>
    </div>
</template>

<style scoped>
.add-group-form {
    background: var(--main);
    padding: 2rem;
    border-radius: 8px;
    max-width: 500px;
    margin: 0 auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
    margin-top: 0;
    color: var(--text-primary);
    text-align: center;
    margin-bottom: 1.5rem;
}

.group-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

#groupName {
    border: solid 3px var(--text);
    border-radius: 1.5vmax;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

label {
    font-weight: 500;
    color: var(--text-secondary);
}

input[type="text"] {
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background: var(--input-bg);
    color: var(--text-primary);
    font-size: 1rem;
}

.invite-code {
    background: var(--accent-bg);
    padding: 1rem;
    border-radius: 4px;
    text-align: center;
}

.code-display {
    font-family: monospace;
    font-size: 1.5rem;
    font-weight: bold;
    letter-spacing: 2px;
    margin: 0.5rem 0;
    color: var(--accent);
}

.error-message {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
    padding: 0.75rem;
    border-radius: 4px;
    font-size: 0.9rem;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1rem;
}

.btn {
    padding: 0.75rem 1.5rem;
    border: solid 1.5px var(--text);
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
    /* background: var(--accent); */
    color: var(--text);
}

/* .btn-primary:hover:not(:disabled) {
    background: var(--accent);
}*/

.btn-primary:disabled {
    opacity: 0.5;
    /* cursor: not-allowed; */
}

.btn-secondary {
    background: transparent;
    color: var(--text);
    border: 1px solid var(--text);
}

/* .btn-secondary:hover:not(:disabled) {
    background: var(--hover-bg);
} */
</style>