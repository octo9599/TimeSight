<!-- Does not join group if user is already in group but show user is already in group -->
<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';
import { getTokenSourceMapRange } from 'typescript';
import {API} from "@/components/DataAccess.mjs";

const emit = defineEmits(['close', 'group-joined']);

const inviteCode = ref("");
const isLoading = ref(false);
const error = ref("");
const inviteCodeInput = ref(null);

// For confirmation step
const phase = ref("input"); // "input" or "confirm"
const groupId = ref(null);
const groupName = ref("");
const alreadyInGroup = ref(false);

const alreadySentInvite = ref(false);

const isBanned = ref(false);

// Current user
const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const userId = ref(null);

// const API = "http://localhost:3000";

onMounted(async () => {
    await userStore.fetchUser();
    userId.value = user.value?.pk_user_id;
    inviteCodeInput.value.focus();
});

// Check invite code, group exists, and membership
async function checkIfGroupExists() {
    try {
        const res = await axios.get(`${API}/gruppe`, {
            params: { invite_code: inviteCode.value.trim() }
        });

        if (!Array.isArray(res.data) || res.data.length === 0) {
            return false;
        }

        const group = res.data[0];
        groupId.value = group.pk_group_id;
        groupName.value = group.gruppenname;

        //Check if user is banned from this group
        try {
            const bans = (await axios.get(`${API}/gruppe/${groupId.value}/ban`)).data;
            for (const ban of bans) {
                if(ban.fk_user_id == userId.value) {
                    isBanned.value = true;
                    break;
                }
            }
        } catch (err) {
            console.error("Error while checking if user is banned:", err);
            isBanned.value = false;
        }

        // Check if user is already in the group
        try {
            const membership = await axios.get(`${API}/gruppe_user`, {
                params: {
                    group_id: groupId.value,
                    user_id: userId.value
                }
            });
            alreadyInGroup.value = Array.isArray(membership.data) && membership.data.length > 0;
        } catch (err) {
            console.error("Error checking membership:", err);
            alreadyInGroup.value = false;
        }

        //Check if user already sent an invide to this group
        try {
            const requests = (await axios.get(`${API}/gruppe/${groupId.value}/beitritt_anfrage`)).data;
            for (const request of requests) {
                if(request.fk_user_id == userId.value) {
                    alreadySentInvite.value = true;
                    break;
                }
            }
        } catch (err) {
            console.error("Error checking if user already sent request to group; ", err);
            alreadySentInvite.value = false;
        }

        return true;
    } catch (err) {
        console.error("Error checking group:", err);
        return false;
    }
}

// First step: validate the code and show confirmation UI
async function prepareJoinGroup() {
    error.value = "";
    if (!inviteCode.value.trim()) {
        error.value = "Bitte geben Sie einen Einladungscode ein.";
        return;
    }
    const exists = await checkIfGroupExists();
    if (!exists) {
        error.value = "Gruppe nicht gefunden.";
        return;
    }
    phase.value = "confirm";
}

//replacement for deprecated joinGroup, which sends an invite instead of immediately joining the group.
async function sendInvite() {
    isLoading.value = true;
    error.value = "";

    try {
        await axios.post(`${API}/beitritt_anfrage`, {
            user_id: userId.value,
            group_id: groupId.value
        });

        emit('group-joined');
    } catch (err) {
        //console.error("Error sending invite:", err.response?.data || err);
        error.value = "Fehler beim abschicken der Anfrage";
    } finally {
        isLoading.value = false;
    }
}

// Go back to the invite-code input
function goBack() {
    phase.value = "input";
    error.value = "";
    alreadyInGroup.value = false;
    alreadySentInvite.value = false
}
</script>

<!-- Does not join group if user is already in group but show user is already in group -->
<template>
    <div class="form-container">
        <!-- PHASE: INPUT INVITE CODE -->
        <div v-if="phase === 'input'">
            <h2>Einer Gruppe beitreten</h2>
            <form @submit.prevent="prepareJoinGroup" class="form">
                <div class="form-group">
                    <label for="inviteCode">Einladungscode</label>
                    <input
                        id="inviteCode"
                        type="text"
                        v-model="inviteCode"
                        placeholder="Einladungscode"
                        :disabled="isLoading"
                        ref="inviteCodeInput"
                    />
                </div>

                <div v-if="error" class="error-message">
                    {{ error }}
                </div>

                <div class="form-actions">
                    <button
                        type="button"
                        class="btn btn-secondary"
                        @click="emit('close')"
                        :disabled="isLoading"
                    >
                        Schließen
                    </button>
                    <button
                        type="submit"
                        class="btn btn-primary"
                        :disabled="isLoading || !inviteCode.trim()"
                    >
                        Weiter
                    </button>
                </div>
            </form>
        </div>

        <!-- PHASE: CONFIRM JOIN -->
        <div v-if="phase === 'confirm'">
            <h2>Bestätige Beitritt</h2>
            <p>
                Du bist dabei, eine Beitrittsanfrage an die Gruppe  <i>{{ groupName }}</i> zu senden.
            </p>

            <p v-if="isBanned" style="color:crimson">
                Du wurdest von der Gruppe <i>{{ groupName }}</i> gebannt.
            </p>
            <p v-else-if="alreadyInGroup" class="already-message">
                👍 Du bist bereits in der Gruppe <i>{{ groupName }}</i>.
            </p>
            <p v-else-if="alreadySentInvite" class="already-message">
                👍 Du hast bereits eine Beitritt-Anfrage an Gruppe <i>{{ groupName }}</i> geschickt.
            </p>

            <div v-if="error" class="error-message">
                {{ error }}
            </div>

            <div class="form-actions">
                <button class="btn btn-secondary" @click="goBack" :disabled="isLoading">
                    Zurück
                </button>

                <button
                    v-if="!alreadyInGroup && !alreadySentInvite && !isBanned"
                    class="btn btn-primary"
                    @click="sendInvite"
                    :disabled="isLoading"
                >
                    <span v-if="isLoading">Senden...</span>
                    <span v-else>Senden</span>
                </button>

                <button
                    v-if="alreadyInGroup || alreadySentInvite || isBanned"
                    class="btn btn-primary"
                    @click="emit('close')"
                    :disabled="isLoading"
                >
                    Schließen
                </button>
            </div>
        </div>
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
    border: solid 3px var(--text);
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

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1rem;
}

.already-message {
    margin-top: 1rem;
    color: green;
    font-weight: bold;
}

i {
    color: var(--accent);
}
</style>