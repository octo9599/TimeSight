<script setup lang="ts">

</script>

<template>
  <div id="sidebar-container">
    <img src="@/assets/images/Kalender-Dark.png" alt="Group Icon Dark" class="icons"><hr>
    <img src="@/assets/images/List-Dark.png" alt="Group Icon Dark" class="icons"><hr>
    <img src="@/assets/images/Group-Dark.png" alt="Group Icon Dark" class="icons"><hr>
    <img src="@/assets/images/+-Dark.png" alt="Group Icon Dark" class="icons">
  </div>
</template>

<style scoped>
#sidebar-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  background-color: var(--main-dark);
  border-right: 3px var(--text-dark) solid;
  /*border-bottom: 3px white solid;*/
}

img.icons {
  width: 80px;
  height: 80px;
  margin: 4.5vh 15px;
  padding: 0 20px;
}

#sidebar-container > img {

}
</style>
