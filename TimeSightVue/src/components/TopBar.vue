<script setup lang="ts">

</script>

<template>
  <div id="topbar-container">
    <!-- actual app icon will go here once available-->
    <a href="/">
      <img class="icons" id="eye-icon" src="../assets/images/TEMPORARY-Logo-Icon.png" alt="TimeSight Logo">
    </a>
    <h1><span class="highlighted">T</span>ime<span class="highlighted">S</span>ight</h1> <!-- janky but working way to make T and S colored differently -->
    <!-- actual account icon will go here once available-->
    <img class="icons" id="acc-icon" src="../assets/images/TEMPORARY-Account-Icon.png" alt="Account Menu">
  </div>
</template>

<style scoped>
h1 {
  font-family: JockeyOne, serif;
  color: var(--text-dark);
  font-size: 94px;
  letter-spacing: 3px;
  margin: 0 40px;
}

span.highlighted {
  color: var(--accent-dark);
}

#topbar-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: #001033 ;
}

img.icons {
  width: max-content;
  height: max-content;
  margin: 0 15px;
}
</style>
