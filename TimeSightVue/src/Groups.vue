<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { fetchData, API } from "@/components/DataAccess.mjs";
import AddGroup from "@/components/AddGroup.vue";
import JoinGroup from "@/components/JoinGroup.vue";
import GroupManagement from './components/GroupManagement.vue';
import axios from "axios";

const groups = ref([]);
const usersInGroup = ref({});
const addGroupVisible = ref(false);
const joinGroupVisible = ref(false);
const isLoading = ref(false);

const inviteCode = ref("");
const showCodes = ref({});
const inviteRequests = ref({});
const isUserAdmin = ref({});
const showGroupManagement = ref({});

const fetchGroups = async () => {
    try {
        isLoading.value = true;
        const data = await fetchData();
        groups.value = data.groupsIn?.data || [];
        usersInGroup.value = data.groupUsers || {};

        for (const group of groups.value) {
            inviteRequests.value[group.pk_group_id] =
                await fetchInviteRequests(group.pk_group_id);

            const user_perms = (await axios.get(`${API}/gruppe_user`, {
                params: { user_id: data.user.pk_user_id, group_id: group.pk_group_id }
            })).data[0];

            isUserAdmin.value[group.pk_group_id] = user_perms?.ist_admin == 1;
            showGroupManagement.value[group.pk_group_id] = false;
        }
    } catch (error) {
        console.error('Error fetching groups:', error);
    } finally {
        isLoading.value = false;
    }
};

async function fetchInviteRequests(group_id) {
    try {
        const requests =
            (await axios.get(`${API}/gruppe/${group_id}/beitritt_anfrage`)).data;

        if (requests.length === 0) return null;

        const output = [];
        for (const request of requests) {
            const user =
                (await axios.get(`${API}/user/${request.fk_user_id}`)).data[0];
            output.push({
                anfrage_id: request.pk_anfrage_id,
                user_id: request.fk_user_id,
                group_id,
                username: user.username
            });
        }
        return output;
    } catch (err) {
        console.error('Error fetching invite-requests: ', err);
    }
}

onMounted(fetchGroups);

async function showCreateGroup() {
    addGroupVisible.value = true;
    await nextTick();
}

function closeCreateGroup() {
    addGroupVisible.value = false;
}

async function handleGroupCreated() {
    await fetchGroups();
}

async function showJoinGroup() {
    joinGroupVisible.value = true;
    await nextTick();
}

function closeJoinGroup() {
    joinGroupVisible.value = false;
}

async function handleGroupJoined() {
    closeJoinGroup();
    await fetchGroups();
}

function generateInviteCode() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    inviteCode.value = Array.from({ length: 8 }, () =>
        letters[Math.floor(Math.random() * letters.length)]
    ).join("");
}

async function checkIfInviteCodeExists(code) {
    try {
        const res = await axios.get(`${API}/gruppe`, {
            params: { invite_code: code }
        });
        return Array.isArray(res.data) ? res.data.length > 0 : !!res.data;
    } catch {
        return false;
    }
}

async function updateCode(group_id) {
    do {
        generateInviteCode();
    } while (await checkIfInviteCodeExists(inviteCode.value));

    await axios.patch(`${API}/gruppe/${group_id}`, {
        invite_code: inviteCode.value
    });

    await fetchGroups();
}

function showCode(group_id) {
    showCodes.value[group_id] = !showCodes.value[group_id];
}

async function answerInvite(request, accepted) {
    await axios.delete(`${API}/beitritt_anfrage/${request.anfrage_id}`);
    if (accepted) {
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
}

async function changeShowGroupMngmt(group_id) {
    showGroupManagement.value[group_id] =
        !showGroupManagement.value[group_id];

    if (!showGroupManagement.value[group_id]) {
        await fetchGroups();
    }
}

async function leaveGroup(group_id) {

    try {

        const data = await fetchData();
        await axios.delete(`${API}/gruppe_user`, { params: {user_id: data.user.pk_user_id, group_id} });

        await fetchGroups();

    } catch (err) {
        console.error("Error leaving group: ", err);
    }

}

</script>

<template>
    <div class="groups-container">
        <ul v-if="groups.length" class="groups-list">
            <li v-for="group in groups"
                :key="group.pk_group_id"
                class="group-item">

                <div class="group-header">
                    <h2>{{ group.gruppenname }}</h2>

                    <span v-if="isUserAdmin[group.pk_group_id]">
                        <button @click="updateCode(group.pk_group_id)">
                            Code neu generieren
                        </button>
                        <button @click="showCode(group.pk_group_id)">
                            Toggle Code
                        </button>
                        <button @click="changeShowGroupMngmt(group.pk_group_id)">
                            Gruppe Verwalten
                        </button>
                    </span>
                    <span v-else>
                        <button id="btn-leave" @click="leaveGroup(group.pk_group_id)">
                            Gruppe verlassen
                        </button>
                    </span>
                </div>

                <!-- Invite Code (Variante B, eigene Zeile) -->
                <div v-if="showCodes[group.pk_group_id]"
                     class="invite-code-row">
                    {{ group.invite_code }}
                </div>

                <!-- Group Management Modal -->
                <div v-if="showGroupManagement[group.pk_group_id]"
                     class="modal-overlay"
                     @click.self="changeShowGroupMngmt(group.pk_group_id)">
                    <div class="modal-window">
                        <GroupManagement
                            :group="group"
                            @close="changeShowGroupMngmt(group.pk_group_id)"
                        />
                    </div>
                </div>

                <div v-if="usersInGroup[group.pk_group_id]"
                     class="members-list">
                    <h3>Members:</h3>
                    <span class="member-names">
                        {{ usersInGroup[group.pk_group_id]
                            .map(u => u.username)
                            .join(', ') }}
                    </span>
                </div>

                <div v-else class="no-members">
                    No members found
                </div>

                <ul v-if="isUserAdmin[group.pk_group_id]
                        && inviteRequests[group.pk_group_id]"
                    class="invite-reqs">
                    Invite Requests:
                    <li v-for="request in inviteRequests[group.pk_group_id]">
                        {{ request.username }} will beitreten
                        <button @click="answerInvite(request, true)">
                            Annehmen
                        </button>
                        <button @click="answerInvite(request, false)">
                            Ablehnen
                        </button>
                    </li>
                </ul>
            </li>
        </ul>

        <p v-else class="no-groups">
            No groups found or loading...
        </p>

        <button @click="showCreateGroup"
                class="create-group-btn"
                :disabled="isLoading">
            <span v-if="isLoading">Lade Gruppen…</span>
            <span v-else>+ Neue Gruppe erstellen</span>
        </button>

        <button @click="showJoinGroup"
                class="join-group-btn">
            Gruppe beitreten
        </button>
    </div>

    <!-- Create Group -->
    <div v-if="addGroupVisible"
         class="modal-overlay"
         @click.self="closeCreateGroup">
        <AddGroup
            class="modal-window"
            @close="closeCreateGroup"
            @group-created="handleGroupCreated"
        />
    </div>

    <!-- Join Group -->
    <div v-if="joinGroupVisible"
         class="modal-overlay"
         @click.self="closeJoinGroup">
        <JoinGroup
            class="modal-window"
            @close="closeJoinGroup"
            @group-joined="handleGroupJoined"
        />
    </div>
</template>

<style scoped>
    h1, h2, h3 {
    letter-spacing: 1px;
    color: var(--text);
}

.groups-container {
    padding: 24px;
    max-width: 900px;
    margin: 0 auto;
    min-height: 60vh;

    display: flex;
    flex-direction: column;
    align-items: center;
}

.groups-list {
    list-style: none;
    padding: 0;
    margin: 0;
    width: 100%;

    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.group-item {
    width: 100%;
    max-width: 900px;

    background: var(--main);
    border: 7px solid var(--field);
    border-radius: 16px;

    padding: 0;
    position: relative;
    box-shadow: none;
}

/* =========================
   HEADER
========================= */

.group-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 16px 20px;
    background: var(--field);

    border-bottom: 2px solid var(--field);
}

.group-header h2 {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 600;
}

.group-header > span {
    display: flex;
    align-items: center;
    gap: 20px;
}

.group-header button {
    background: none;
    border: none;
    color: var(--accent);
    font-size: 0.85rem;
    cursor: pointer;
    padding: 0;

    white-space: nowrap;
}

.group-header button:hover {
    text-decoration: underline;
}

/* =========================
   INVITE CODE – VARIANTE B
========================= */

.invite-code-row {
    display: flex;
    justify-content: center;
    align-items: center;

    margin: 12px auto 0 auto;
    width: fit-content;

    font-family: monospace;
    font-size: 1.1rem;
    letter-spacing: 2px;

    color: var(--accent);
    background: var(--main);

    padding: 10px 20px;
    border-radius: 12px;
    border: 2px solid var(--field);
}

/* =========================
   MEMBERS
========================= */

.members-list {
    padding: 18px 20px;

    display: flex;
    flex-direction: column;
    gap: 6px;
}

.members-list h3 {
    font-size: 0.9rem;
    opacity: 0.7;
    margin-bottom: 6px;

    text-transform: uppercase;
    letter-spacing: 1px;
}

.member-names {
    font-size: 0.95rem;
    line-height: 1.5;
    opacity: 0.9;
}

/* =========================
   INVITE REQUESTS
========================= */

.invite-reqs {
    list-style: none;
    padding: 14px 20px;
    margin: 12px 0 0 0;

    background: var(--main);
    border-top: 2px solid var(--field);
    font-size: 0.9rem;
}

.invite-reqs li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
}

.invite-reqs button {
    background: none;
    border: none;
    font-size: 0.85rem;
    cursor: pointer;
    padding: 0;
}

.invite-reqs button:first-of-type {
    color: var(--done);
}

.invite-reqs button:last-of-type {
    color: #ef4444;
}

.invite-reqs button:hover {
    text-decoration: underline;
}

/* =========================
   EMPTY STATES
========================= */

.no-members,
.no-groups {
    color: var(--text);
    text-align: center;
    font-size: 1.1rem;
    opacity: 0.7;
    margin-top: 2rem;
}

/* =========================
   BOTTOM BUTTONS
========================= */

.create-group-btn,
.join-group-btn {
    width: 100%;
    max-width: 900px;

    padding: 16px;
    margin-top: 20px;

    background: var(--field);
    color: var(--text);

    border: 2px solid var(--field);
    border-radius: 14px;

    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;

    transition: background 0.15s ease;
}

.create-group-btn:hover,
.join-group-btn:hover {
    background: var(--accent);
    color: #fff;
}

/* =========================
   MODAL (GroupManagement)
========================= */

.modal-overlay {
    position: fixed;
    inset: 0;

    background: rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(6px);

    display: flex;
    align-items: center;
    justify-content: center;

    z-index: 1000;
}

.modal-window {
    background: var(--main);
    border-radius: 16px;

    width: min(700px, 90vw);
    max-height: 90vh;
    overflow-y: auto;

    padding: 1.5rem;

    border: 2px solid var(--field);
}

#btn-leave {
    color: crimson;
}

</style>