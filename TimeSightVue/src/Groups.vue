<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { fetchData, API } from "@/components/DataAccess.mjs";
import AddGroup from "@/components/AddGroup.vue";
import JoinGroup from "@/components/JoinGroup.vue";
import axios from "axios";

const groups = ref([]);
const usersInGroup = ref({});
const addGroupVisible = ref(false);
const joinGroupVisible = ref(false);
const isLoading = ref(false);

const inviteCode = ref("");
const showCodes = ref({});
const inviteRequests = ref({});

// Fetch groups data
const fetchGroups = async () => {
    try {
        isLoading.value = true;
        const data = await fetchData();
        groups.value = data.groupsIn?.data || [];
        usersInGroup.value = data.groupUsers || {};
        for(const group of groups.value) {
            inviteRequests.value[group.pk_group_id] = await fetchInviteRequests(group.pk_group_id);
        }
        console.log(inviteRequests.value);
    } catch (error) {
        console.error('Error fetching groups:', error);
    } finally {
        isLoading.value = false;
    }
};

async function fetchInviteRequests(group_id) {

    try {
        const requests = (await axios.get(`${API}/gruppe/${group_id}/beitritt_anfrage`)).data;
        const output = [];
        for(const request of requests) {
            const user = (await axios.get(`${API}/user/${request.fk_user_id}`)).data[0];
            output.push({ anfrage_id: request.pk_anfrage_id, user_id: request.fk_user_id, group_id, username: user.username});
        }
        if(requests.length === 0) {
            return null;
        }
        
        return output;
    } catch (err) {
        console.error('Error fetching invite-requests: ', err);
    }
}

// Initial fetch
onMounted(fetchGroups);

// Show create group modal
async function showCreateGroup() {
    addGroupVisible.value = true;
    await nextTick();
}

// Close create group modal
function closeCreateGroup() {
    addGroupVisible.value = false;
}

// Handle successful group creation
async function handleGroupCreated() {
    await fetchGroups();
}

// Show join group modal
async function showJoinGroup() {
    joinGroupVisible.value = true;
    await nextTick();
}

// Close join group modal
function closeJoinGroup() {
    joinGroupVisible.value = false;
}

// Handle successful group joining
async function handleGroupJoined() {
    closeJoinGroup();
    await fetchGroups();
}

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

async function updateCode(group_id) {

    try {
        if(!group_id) {
            throw new Error("updateCode() called without group_id");
        }
        do {
            generateInviteCode();
        } while (await checkIfInviteCodeExists(inviteCode.value));
        await axios.patch(`${API}/gruppe/${group_id}`, {invite_code: inviteCode.value});
        await fetchGroups();

        
    } catch (err) {
        console.error(err);
    }

}

function showCode(group_id) {
    showCodes.value[group_id] = !showCodes.value[group_id];

}

async function answerInvite(request, is_accepted) {

    try {

        await axios.delete(`${API}/beitritt_anfrage/${request.anfrage_id}`);
        if(is_accepted) {
            await axios.post(`${API}/gruppe_user`, {
                markierungsfarbe: null,
                ist_admin: 0,
                kann_bearbeiten: 0,
                kann_loeschen: 0,
                group_id: request.group_id,
                user_id: request.user_id
            });
        }

        await fetchGroups();

    } catch(err) {
        console.error("Error answering invite: ", err);
    }

}

</script>

<template>
    <div class="groups-container">
        <!-- Show existing groups -->
        <ul v-if="groups.length" class="groups-list">
            <li v-for="group in groups" :key="group.pk_group_id" class="group-item">
                <div class="group-header">
                    <h2>{{ group.gruppenname }}</h2>
                    <span>
                        <button @click="updateCode(group.pk_group_id)">Code neu generieren</button>
                        <button @click="showCode(group.pk_group_id)">Toggle Code</button>
                        <div v-if="showCodes[group.pk_group_id]">{{ group.invite_code }}</div>
                    </span>
                </div>
                <div v-if="usersInGroup[group.pk_group_id]" class="members-list">
                    <h3>Members:</h3>
                    <span class="member-names">
                        {{ usersInGroup[group.pk_group_id].map(user => user.username).join(', ') }}
                    </span>
                </div>
                <div v-else class="no-members">
                    No members found
                </div>
                <ul v-if="inviteRequests[group.pk_group_id] != null" class="invite-reqs">
                    Invite Requests:
                    <li v-for="request of inviteRequests[group.pk_group_id]">
                        {{ request.username }} will beitreten
                        <button @click="answerInvite(request, true)">Annehmen</button>
                        <button @click="answerInvite(request, false)">Ablehnen</button>
                    </li>
                </ul>
            </li>
        </ul>
        <p v-else class="no-groups">No groups found or loading...</p>
        <button @click="showCreateGroup" class="create-group-btn" :disabled="isLoading">
            <span v-if="isLoading">Lade Gruppen...</span>
            <span v-else>+ Neue Gruppe erstellen</span>
        </button>
        <button @click="showJoinGroup" class="join-group-btn">
            <span>Gruppe beitreten</span>
        </button>
    </div>

    <!-- Create Group Modal -->
    <div v-if="addGroupVisible" class="modal-overlay" @click.self="closeCreateGroup">
        <AddGroup @close="closeCreateGroup" @keyup.esc="closeCreateGroup" @group-created="handleGroupCreated"
            class="modal-window" />
    </div>

    <!-- Join Group Modal -->
    <div v-if="joinGroupVisible" class="modal-overlay" @click.self="closeJoinGroup">
        <JoinGroup @close="closeJoinGroup" @keyup.esc="closeJoinGroup" @group-joined="handleGroupJoined"
            class="modal-window" />
    </div>
</template>

<style scoped>
h1, h2, h3 {
    letter-spacing: 1px;
}

.groups-container {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
    min-height: 60vh;
}

.create-group-btn, .join-group-btn {
    display: block;
    width: 100%;
    padding: 12px 20px;
    margin-top: 20px;
    background: var(--accent);
    color: white;
    border: var(--text-dark) solid 2px;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
}

.create-group-btn:hover:not(:disabled), .join-group-btn:hover:not(:disabled) {
    background: var(--accent-dark);
}

.create-group-btn:disabled, .join-group-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.groups-list {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 1.5em;
}

.group-item {
    background-color: var(--main-dark);
    border: 5px solid var(--field-dark);
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.group-header {
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #222;
}

.members-list {
    margin-top: 10px;
    padding-left: 20px;
}

.member-item {
    padding: 5px 0;
    list-style-type: disc;
}

.no-members,
.no-groups {
    color: var(--text-dark);
    text-align: center;
    font-size: 1.5rem;
}

h2 {
    color: var(--text-dark);
    margin: 0 auto;
    text-align: center;
}

h3 {
    color: var(--text-dark);
    margin: 10px 0 5px 0;
    font-size: 1rem;
}

.member-names {
    color: var(--text-dark);
    font-size: 0.9em;
    line-height: 1.4;
}

.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);

    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);

    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    z-index: 1000;
}

.modal-window {
    background: var(--main-dark);
    border-radius: 12px;
    width: min(600px, 90vw);
    max-height: 85vh;
    overflow-y: auto;

    padding: 1.5rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);

    animation: modalIn 0.2s ease-out;
}
</style>