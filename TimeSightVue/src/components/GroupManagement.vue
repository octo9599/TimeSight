<script setup>
import axios from "axios";
import { onMounted, ref } from "vue";
import { fetchData, API } from "@/components/DataAccess.mjs";

const props = defineProps(["group"]);
const emit = defineEmits(["close"]);

const users = ref([]);
const bannedUsers = ref([]);
const admins = ref([]);

const showBanUsername = ref(false);
const showNameField = ref(false);
const showBannedUsers = ref(false);
const showDeleteForm = ref(false);

const newName = ref(null);
const banUserName = ref(null);
const deleteGroupname = ref(null);

const error = ref("");

const editChecks = ref({});
const deleteChecks = ref({});

onMounted(async () => {
    await fetchUsers();
    await fetchBannedUsers();
});

async function fetchUsers() {
    try {
        users.value = [];
        admins.value = [];

        const temp_users = (
            await axios.get(
                `${API}/gruppe/${props.group.pk_group_id}/user`
            )
        ).data;

        for (const user of temp_users) {
            if (user.ist_admin != 1) {
                users.value.push(user);
                editChecks.value[user.pk_user_id] =
                    user.kann_bearbeiten == 1;
                deleteChecks.value[user.pk_user_id] =
                    user.kann_loeschen == 1;
            } else {
                admins.value.push(user);
            }
        }
    } catch (err) {
        console.error(
            "Error while fetching users of group:",
            err
        );
    }
}

async function fetchBannedUsers() {
    try {
        bannedUsers.value = [];

        const bans = (
            await axios.get(
                `${API}/gruppe/${props.group.pk_group_id}/ban`
            )
        ).data;

        for (const ban of bans) {
            const user = (
                await axios.get(
                    `${API}/user/${ban.fk_user_id}`
                )
            ).data[0];

            bannedUsers.value.push({
                ...user,
                ban_id: ban.pk_ban_id,
            });
        }
    } catch (err) {
        console.error(
            "Error while banning users: ",
            err
        );
    }
}

async function updateName() {
    try {
        await axios.patch(
            `${API}/gruppe/${props.group.pk_group_id}`,
            {
                gruppenname: newName.value,
            }
        );

        props.group.gruppenname = newName.value;
    } catch (err) {
        console.error(
            "Error while updating group-name:",
            err
        );
    }
}

async function kickUser(user_id) {
    try {
        error.value = "";

        await axios.delete(
            `${API}/gruppe_user`,
            {
                params: {
                    user_id: user_id,
                    group_id: props.group.pk_group_id,
                },
            }
        );

        fetchUsers();
    } catch (err) {
        error.value =
            "Error while kicking user: " + err;
        console.error(error.value);
    }
}

async function banUser(user_id) {
    try {
        error.value = "";

        if (
            !user_id &&
            banUserName.value &&
            banUserName.value !== ""
        ) {
            const user = (
                await axios.get(
                    `${API}/user`,
                    {
                        params: {
                            username: banUserName.value,
                        },
                    }
                )
            ).data[0];

            if (!user) {
                throw new Error(
                    "No user with that username exists."
                );
            }

            banUserName.value = "";
            showBanUsername.value = false;
            user_id = user.pk_user_id;
        }

        if (await isAlreadyBanned(user_id)) {
            throw new Error(
                "User is already banned from this group."
            );
        }

        if (await isUserAdmin(user_id)) {
            throw new Error("Admins can't be banned");
        }

        if (await isInGroup(user_id)) {
            await axios.delete(
                `${API}/gruppe_user`,
                {
                    params: {
                        user_id: user_id,
                        group_id:
                            props.group.pk_group_id,
                    },
                }
            );
        }

        await axios.post(`${API}/ban`, {
            user_id: user_id,
            group_id: props.group.pk_group_id,
        });

        await fetchUsers();
        await fetchBannedUsers();
    } catch (err) {
        error.value =
            "Error while banning user: " + err;
        console.error(error.value);
    }
}

async function isInGroup(user_id) {
    try {
        const user = (
            await axios.get(
                `${API}/user/${user_id}`
            )
        ).data[0];

        let output = false;
        users.value.forEach(
            (usr) =>
                (output =
                    usr.pk_user_id ==
                    user.pk_user_id)
        );

        return output;
    } catch (err) {
        console.error(
            "Error while checking if user is in Group: ",
            err
        );
    }
}

async function isAlreadyBanned(user_id) {
    const ban = (
        await axios.get(`${API}/ban`, {
            params: {
                user_id: user_id,
                group_id: props.group.pk_group_id,
            },
        })
    ).data[0];

    return !!ban;
}

async function isUserAdmin(user_id) {
    try {
        const user = (
            await axios.get(
                `${API}/user/${user_id}`
            )
        ).data[0];

        let output = false;
        admins.value.forEach(
            (usr) =>
                (output =
                    usr.pk_user_id ==
                    user.pk_user_id)
        );

        return output;
    } catch (err) {
        console.error(
            "Error while checking if user is admin: ",
            err
        );
    }
}

async function updateUserPerms(
    user_id,
    isDeletePerm
) {
    const edits = {};

    try {
        if (!isDeletePerm) {
            edits.kann_bearbeiten = Number(
                editChecks.value[user_id]
            );
        } else {
            edits.kann_loeschen = Number(
                deleteChecks.value[user_id]
            );
        }

        await axios.patch(
            `${API}/gruppe_user`,
            edits,
            {
                params: {
                    group_id:
                        props.group.pk_group_id,
                    user_id: user_id,
                },
            }
        );
    } catch (err) {
        console.error(
            "Error while editing a users group-rights: ",
            err
        );
    }
}

async function unbanUser(ban_id) {
    try {
        error.value = "";

        await axios.delete(
            `${API}/ban/${ban_id}`
        );

        await fetchBannedUsers();
    } catch (err) {
        error.value =
            "Error while unbanning user: " + err;
        console.error(error.value);
    }
}

async function deleteGroup() {
    try {
        error.value = "";

        if (
            deleteGroupname.value !=
            props.group.gruppenname
        ) {
            throw new Error(
                "Eingegebener Text nicht gleich wie Gruppenname"
            );
        }

        await axios.delete(
            `${API}/gruppe/${props.group.pk_group_id}`
        );

        showDeleteForm.value = false;
        emit("close");
    } catch (err) {
        error.value =
            "Error deleting group: " + err;
        console.error(error.value);
    }
}
</script>

<template>
    <div>
        <span v-if="!showNameField">
            Name: {{ props.group.gruppenname }}
            <button @click="showNameField = true">
                Ändern
            </button>
        </span>

        <form
            v-else
            @submit.prevent="updateName"
        >
            Name:
            <input
                type="text"
                placeholder="Neuer Name"
                v-model="newName"
                required
            />
            <button type="submit">
                Bestätigen
            </button>
        </form>

        <button @click="emit('close')">X</button>
    </div>

    <div>
        <button
            @click="
                showBanUsername =
                    !showBanUsername
            "
        >
            Per Username bannen
        </button>

        <form
            v-if="showBanUsername"
            @submit.prevent="banUser(null)"
        >
            <input
                type="text"
                placeholder="Username"
                v-model="banUserName"
                required
            />
            <button type="submit">Ban</button>
        </form>

        <div v-for="user in users">
            <p>
                {{ user.username }}
                <button
                    @click="
                        kickUser(user.pk_user_id)
                    "
                >
                    Kick
                </button>
                <button
                    @click="
                        banUser(user.pk_user_id)
                    "
                >
                    Ban
                </button>

                <p>
                    Bearbeiten
                    <input
                        type="checkbox"
                        v-model="
                            editChecks[
                                user.pk_user_id
                            ]
                        "
                        @change="
                            updateUserPerms(
                                user.pk_user_id,
                                false
                            )
                        "
                    />
                </p>

                <p>
                    Löschen
                    <input
                        type="checkbox"
                        v-model="
                            deleteChecks[
                                user.pk_user_id
                            ]
                        "
                        @change="
                            updateUserPerms(
                                user.pk_user_id,
                                true
                            )
                        "
                    />
                </p>
            </p>
        </div>

        <button
            @click="
                showBannedUsers =
                    !showBannedUsers
            "
        >
            Gebannte User anzeigen
        </button>

        <div v-if="showBannedUsers">
            <div v-for="user in bannedUsers">
                {{ user.username }}
                <button
                    @click="unbanUser(user.ban_id)"
                >
                    Unban
                </button>
            </div>
        </div>
    </div>

    <div>
        <button
            @click="showDeleteForm = true"
            style="background-color: crimson;"
        >
            Gruppe Löschen
        </button>
        <span style="color: crimson;">
            {{ error }}
        </span>
    </div>

    <div
        class="modal-overlay"
        v-if="showDeleteForm"
        @click.self="showDeleteForm = false"
    >
        <div class="modal-window">
            Geben Sie den Gruppennamen ein, zum
            Bestätigen, die Gruppe löschen zu
            wollen.

            <span style="color: crimson;">
                ACHTUNG: Diese Aktion löscht auch
                alle Termine dieser Gruppe.
            </span>

            <form
                @submit.prevent="deleteGroup"
            >
                <input
                    type="text"
                    v-model="deleteGroupname"
                    placeholder="Gruppenname"
                    required
                />
                <button type="submit">
                    Löschen
                </button>
                <p style="color: crimson;">
                    {{ error }}
                </p>
            </form>
        </div>
    </div>
</template>

<style scoped>
</style>