<script setup>
import {ref, onMounted} from 'vue';
import {fetchData} from "@/components/DataAccess.mjs";

const groups = ref([]);
const usersInGroup = ref({});

onMounted(async () => {
    try {
        const data = await fetchData();
        console.log('Fetched data:', data);
        groups.value = data.groupsIn?.data || [];
        usersInGroup.value = data.groupUsers || {};
    } catch (error) {
        console.error('Error fetching groups:', error);
    }
});
</script>

<template>
    <div class="groups-container">
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
</style>