<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { fetchData } from "@/components/DataAccess.mjs";
import AddGroup from "@/components/AddGroup.vue";

const groups = ref([]);
const usersInGroup = ref({});
const addGroupVisible = ref(false);
const isLoading = ref(false);

// Fetch groups data
const fetchGroups = async () => {
    try {
        isLoading.value = true;
        const data = await fetchData();
        groups.value = data.groupsIn?.data || [];
        usersInGroup.value = data.groupUsers || {};
    } catch (error) {
        console.error('Error fetching groups:', error);
    } finally {
        isLoading.value = false;
    }
};

// Initial fetch
onMounted(fetchGroups);

// Show create group modal
async function showCreateGroup() {
    addGroupVisible.value = true;
    await nextTick();
}

// Close modal
function closeCreateGroup() {
    addGroupVisible.value = false;
}

// Handle successful group creation
async function handleGroupCreated() {
    // closeCreateGroup();
    await fetchGroups(); // Refresh the groups list
}
</script>

<template>
    <div class="groups-container">
        <!-- Show existing groups -->
        <ul v-if="groups.length" class="groups-list">
            <li v-for="group in groups" :key="group.pk_group_id" class="group-item">
                <div class="group-header">
                    <h2>{{ group.gruppenname }}</h2>
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
            </li>
        </ul>
        <p v-else class="no-groups">No groups found or loading...</p>
        <button @click="showCreateGroup" class="create-group-btn" :disabled="isLoading">
            <span v-if="isLoading">Lade Gruppen...</span>
            <span v-else>+ Neue Gruppe erstellen</span>
        </button>
    </div>

    <!-- Create Group Modal -->
    <div v-if="addGroupVisible" class="modal-overlay" @click.self="closeCreateGroup">
        <AddGroup @close="closeCreateGroup" @keyup.esc="closeCreateGroup" @group-created="handleGroupCreated"
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

.create-group-btn {
    display: block;
    width: 100%;
    padding: 12px 20px;
    margin-top: 20px;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
}

.create-group-btn:hover:not(:disabled) {
    background: var(--accent-dark);
}

.create-group-btn:disabled {
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