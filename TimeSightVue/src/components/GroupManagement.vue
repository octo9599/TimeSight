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
        <button @click="showBanUsername =!showBanUsername">
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
            <button type="submit" class="ban-btn">Ban</button>
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
                <button class = "unban-btn"
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
        id="delete-window"
        v-if="showDeleteForm"
        @click.self="showDeleteForm = false"
    >
        <div class="modal-window">
            Geben Sie den Gruppennamen ({{ group.gruppenname }}) ein, zum
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
    /* =========================
    MODAL BASIS
    ========================= */

    .modal-window {
        width: 92vw;
        max-width: 1200px;
        max-height: 85vh;

        background: var(--main);
        border: 7px solid var(--field);
        border-radius: 22px;

        padding: 32px;
        overflow-y: auto;

        display: flex;
        flex-direction: column;
        gap: 28px;

        box-shadow: none;
        font-weight: 400;
    }

    /* =========================
    HEADER
    ========================= */

    .modal-window > div:first-child {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .modal-window > div:first-child span {
        font-size: 1.6rem;
        font-weight: 400;
        color: var(--text);
    }

    .modal-window > div:first-child button {
        background: var(--field);
        border: none;
        color: var(--text);
        padding: 10px 16px;
        border-radius: 10px;
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 400;
    }

    .modal-window > div:first-child button:last-child {
        background: #ef4444;
        color: #fff;
    }

    /* =========================
    USER CARD
    ========================= */

    .modal-window > div:nth-child(2) > div {
        background: var(--main);
        border: 3px solid var(--field);
        border-radius: 16px;

        padding: 18px 22px;

        display: flex;
        flex-direction: column;
        gap: 14px;
    }

    /* =========================
    USER NAME + ACTIONS
    ========================= */

    .modal-window > div:nth-child(2) > div > p:first-child {
        display: flex;
        align-items: center;
        justify-content: space-between;

        font-size: 1.3rem;
        font-weight: 400;
        color: var(--text);
    }

    /* Kick / Ban */

    /* Kick / Ban – korrekt & kompatibel */

    .modal-window button {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 0.95rem;
        font-weight: 400;
        padding: 0;
    }

    /* Kick → weiß (dark/light kompatibel) */
    .modal-window p:first-child button:first-of-type {
        color: var(--text);
    }

    /* Ban → rot */
    .modal-window p:first-child button:nth-of-type(2) {
        color: #ef4444;
    }


    /* =========================
    RECHTE ZEILE
    ========================= */

    .modal-window p:has(input[type="checkbox"]) {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 16px;

        font-size: 1rem;
        color: var(--text);
    }

    /* =========================
    CHECKBOX – EXAKT WIE TASKVIEW
    ========================= */

    input[type="checkbox"] {
        appearance: none;
        width: 22px;
        height: 22px;
        border-radius: 4px;
        border: 2px solid var(--text);
        display: grid;
        place-content: center;
        cursor: pointer;
    }

    input[type="checkbox"]::before {
        content: "";
        width: 12px;
        height: 12px;
        transform: scale(0);
        transition: 120ms transform ease-in-out;
        background-color: #7fffd4;
    }

    input[type="checkbox"]:checked::before {
        transform: scale(1);
    }

    /* =========================
    UNTERE ACTION-ZEILE
    ========================= */

    .modal-window > div:nth-child(2) > button {
        background: var(--field);
        padding: 12px 16px;
        border-radius: 10px;
        color: var(--text);
        width: fit-content;
    }

    /* Gebannte User anzeigen → rechts */

    .modal-window > div:nth-child(2) {
        position: relative;
    }

    .modal-window > div:nth-child(2) > button:last-of-type {
        position: absolute;
        right: 0;
        bottom: -48px;
    }

    /* =========================
    FOOTER
    ========================= */

    .modal-window > div:last-child button {
        background: #ef4444;
        color: var(--text);
        border-radius: 12px;
        padding: 14px 22px;
        font-weight: 400;
    }

    /* =========================
    HEADER BAR (FIELD)
    ========================= */

    .modal-window > div:first-child {
        background: var(--field);

        margin: -32px -32px 0 -32px; /* gleicht das Padding der modal-window aus */
        padding: 24px 32px;

        border-top-left-radius: 15px;
        border-top-right-radius: 15px;

        display: flex;
        align-items: center;
        justify-content: space-between;
    }
/* =========================
   UNBAN BUTTON
========================= */

.unban-btn {
    color: crimson;
    margin-left: 66px;
}

.ban-btn {
    color: crimson;
    margin-left: 1.5%;
}


</style>