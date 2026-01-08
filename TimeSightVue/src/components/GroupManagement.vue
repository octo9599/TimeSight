<script setup>
    import axios from "axios";
    import { onMounted, ref } from "vue";
    import { fetchData, API } from "@/components/DataAccess.mjs";

    const props = defineProps(['group'])
    const emit = defineEmits(['close']);

    const users = ref([]);
    const bannedUsers = ref([]);

    const showBanUsername = ref(false);
    const showNameField = ref(false);
    const showBannedUsers = ref(false);

    const newName = ref(null);
    const banUserName = ref(null);

    const error = ref("");

    const editChecks = ref({});
    const deleteChecks = ref({});

    onMounted(fetchUsers);

    async function fetchUsers() {
        try {
            //only allow managing users that arent admins (since optional goal of multiple admins wont be implemented)
            users.value = [];
            const temp_users = (await axios.get(`${API}/gruppe/${props.group.pk_group_id}/user`)).data;
            for(const user of temp_users) {
                const user_perms = (await axios.get(`${API}/gruppe_user`, {
                    params: { user_id: user.pk_user_id, group_id: props.group.pk_group_id }
                })).data[0];
                if(user_perms.ist_admin != 1) {
                    users.value.push(user);
                    editChecks.value[user.pk_user_id] = user_perms.kann_bearbeiten == 1;
                    deleteChecks.value[user.pk_user_id] = user_perms.kann_loeschen == 1;
                }
            }
        } catch (err) {
            console.error("Error while fetching users of group:", err)
        }
    }

    async function updateName() {
        try {
            await axios.patch(`${API}/gruppe/${props.group.pk_group_id}`, {
                gruppenname: newName.value
            });
            props.group.gruppenname = newName.value;
        } catch (err) {
            console.error("Error while updating group-name:", err)
        }
    }

    async function kickUser(user_id) {
        try {
            await axios.delete(`${API}/gruppe_user`, {
                params: { user_id: user_id, group_id: props.group.pk_group_id }
            });
            fetchUsers();
        } catch (err) {
            error.value = "Error while kicking user: " + err;
            console.error(error.value);
        }
    }

    async function banUser(user_id) {
        try {

            if(!user_id && banUserName.value && banUserName.value !== "") {
                const user = (await axios.get(`${API}/user`, {
                    params: {username: banUserName.value}
                })).data[0];
                if(!user) {
                    throw new Error("No user with that username exists.");
                }
                banUserName.value = "";
                showBanUsername.value = false;
                user_id = user.pk_user_id;
            }

            console.log(user_id);
            if(await isInGroup(user_id)) {
                await axios.delete(`${API}/gruppe_user`, {
                    params: { user_id: user_id, group_id: props.group.pk_group_id }
                });
            }
            await fetchUsers();
        } catch (err) {
            error.value = "Error while banning user: " + err;
            console.error(error.value);
        }
    }

    async function isInGroup(user_id) {
        try {
            const user = (await axios.get(`${API}/user/${user_id}`)).data[0];
            console.log(users.value.includes(user));
            return users.value.includes(user);
        } catch (err) {
            console.error("Error while checking if user is in Group: ", err);
        }
        
    }

    async function updateUserPerms(user_id, isDeletePerm) {

        const edits = {};
        try {
            if(!isDeletePerm) {
                console.log(Number(editChecks.value[user_id]));
                edits.kann_bearbeiten = Number(editChecks.value[user_id]);
            } else {
                edits.kann_loeschen = Number(editChecks.value[user_id]);
            }
            await axios.patch(`${API}/gruppe_user`, edits, {
                params: { group_id: props.group.pk_group_id, user_id: user_id }
            });
        } catch (err) {
            console.error("Error while editing a users group-rights: ", err);
        }

    }
    
    async function unbanUser(user_id) {



    }

</script>

<template>
    <div>
        <span v-if="!showNameField">
            Name: {{ props.group.gruppenname }}
            <button @click="showNameField = true">Ändern</button>
        </span>
        <form @submit.prevent="updateName" v-else>
            Name: <input type="text" placeholder="Neuer Name" v-model="newName" required/>
            <button type="submit">Bestätigen</button>
        </form>
        <button @click="emit('close')">X</button>
    </div>
    <div>
        <button @click="showBanUsername = !showBanUsername">Per Username bannen</button>
        <form v-if="showBanUsername" @submit.prevent="banUser(null)">
            <input type="text" placeholder="Username" v-model="banUserName" required/>
            <button type="submit">Ban</button>
        </form>
        <div v-for="user in users">
            <p>
                {{ user.username }}
                <button @click="kickUser(user.pk_user_id)">Kick</button>
                <button @click="banUser(user.pk_user_id)">Ban</button>
                <p>Bearbeiten <input type="checkbox" v-model="editChecks[user.pk_user_id]" @change="updateUserPerms(user.pk_user_id, false)" /></p>
                <p>Löschen <input type="checkbox" v-model="deleteChecks[user.pk_user_id]" @change="updateUserPerms(user.pk_user_id, true)" /></p>
            </p>
        </div>
        <button @click="showBanUsername = !showBannedUsers">Gebannte User anzeigen</button>
        <div v-if="showBannedUsers">
            <div v-for="user in bannedUsers">
                {{  user.username }}
                <button @click="unbanUser(user.pk_user_id)">Unban</button>
            </div>
        </div>
    </div>
    <div>
        <span style="color:crimson">{{ error }}</span>
    </div>
</template>

<style scoped>

</style>