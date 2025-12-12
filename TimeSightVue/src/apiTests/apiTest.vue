<script setup>
import axios from 'axios'

const API = "http://localhost:3000";

function print(obj) {
  const out = document.getElementById("output");
  if (typeof obj === "string") {
    out.innerHTML += `<pre>${obj}</pre>`;
  } else {
    out.innerHTML += `<pre>${JSON.stringify(obj, null, 2)}</pre>`;
  }
}

async function test() {
  const API = "http://localhost:3000";

  try {
    let user_id;
    let group_id;
    let termin_id;
    let anfrage_id;

    // POST Endpoints
    print("Creating group...");
    const resGroup = await axios.post(`${API}/gruppe`, {
      gruppenname: "My Group",
      invite_code: "ABCDEF"
    });
    group_id = resGroup.data.id;
    print(resGroup.data);

    print("Creating user...");
    const resUser = await axios.post(`${API}/user`, {
      username: "john",
      email: "john@example.com",
      passwort: "1234"
    });
    user_id = resUser.data.id;
    print(resUser.data);

    print("Creating termin...");
    const resTermin = await axios.post(`${API}/termin`, {
      bezeichnung: "Homework",
      beschreibung: "Math exercises",
      datum: "2025-01-01",
      group_id,
      user_id
    });
    termin_id = resTermin.data.id;
    print(resTermin.data);

    print("Adding user to group...");
    const resGU = await axios.post(`${API}/gruppe_user`, {
      markierungsfarbe: null,
      ist_admin: 1,
      kann_bearbeiten: 1,
      kann_loeschen: 1,
      group_id,
      user_id
    });
    print(resGU.data);

    print("Creating beitritt_anfrage...");
    const resBA = await axios.post(`${API}/beitritt_anfrage`, {
      user_id,
      group_id
    });
    anfrage_id = resBA.data.id;
    print(resBA.data);

    // GET Endpoints
    print("GET termin by ID:");
    print((await axios.get(`${API}/termin/${termin_id}`)).data);

    print("GET termin by filters:");
    print((await axios.get(`${API}/gruppe/${group_id}/termin`, { params: { is_past_due: 1 } })).data);

    print("GET group:");
    print((await axios.get(`${API}/gruppe/${group_id}`)).data);

    print("GET group by invite code:");
    print(
      (await axios.get(`${API}/gruppe`, {
        params: { invite_code: "ABCDEF" }
      })).data
    );

    print("GET groups of user:");
    print((await axios.get(`${API}/user/${user_id}/gruppe`)).data);

    print("GET user:");
    print((await axios.get(`${API}/user/${user_id}`)).data);

    print("GET Gruppe_User:");
    print(
      (await axios.get(`${API}/gruppe_user`, {
        params: { user_id, group_id }
      })).data
    );

    print("GET users in group:");
    print((await axios.get(`${API}/gruppe/${group_id}/user`)).data);

    

    print("GET beitritt_anfrage by ID:");
    print((await axios.get(`${API}/beitritt_anfrage/${anfrage_id}`)).data);

    print("GET beitritt_anfrage of group:");
    print(
      (await axios.get(`${API}/gruppe/${group_id}/beitritt_anfrage`)).data
    );

    // PATCH Endpoints
    print("PATCH user update:");
    print(
      (
        await axios.patch(`${API}/user/${user_id}`, {
          email: "newmail@example.com",
          username: "updatedName"
        })
      ).data
    );

    print("PATCH group update:");
    print(
      (
        await axios.patch(`${API}/gruppe/${group_id}`, {
          gruppenname: "New Name"
        })
      ).data
    );

    print("PATCH termin update:");
    print(
      (
        await axios.patch(`${API}/termin/${termin_id}`, {
          beschreibung: "New description",
          ist_erledigt: true
        })
      ).data
    );

    print("PATCH gruppe_user update:");
    print(
      (
        await axios.patch(
          `${API}/gruppe_user`,
          {
            ist_admin: 0,
            kann_bearbeiten: 1
          },
          {
            params: { group_id, user_id }
          }
        )
      ).data
    );

    // DELETE Endpoints
    print("DELETE termin:");
    print((await axios.delete(`${API}/termin/${termin_id}`)).data);

    print("DELETE gruppe_user:");
    print(
      (
        await axios.delete(`${API}/gruppe_user`, {
          params: { user_id, group_id }
        })
      ).data
    );

    print("DELETE beitritt_anfrage:");
    print(
      (await axios.delete(`${API}/beitritt_anfrage/${anfrage_id}`)).data
    );

    print("DELETE user:");
    print((await axios.delete(`${API}/user/${user_id}`)).data);

    print("DELETE group:");
    print((await axios.delete(`${API}/gruppe/${group_id}`)).data);

    print("All API requests completed!");

  } catch (err) {
    print("ERROR:");
    print(err.response?.data || err.message || err);
  }

}
</script>

<template>
  <button @click="test"> Run Test </button>
  <div id="output"></div>
</template>

<style scoped>

</style>
