<template>
  <main>
    <h1>{{ $t("Welcome!") }}</h1>
    <p>{{ $t("Choose what you would like to do to practice Khmer typing today.") }}</p>
    <br>
    <div class="landing-options">
      <router-link
        class="button button-lessons"
        :to="{ path: '/visualKeyboard', query: { lesson: '1.1' } }"
      >
        🎓 {{ $t("Practice Lessons (42 Lessons)") }}
      </router-link>
      <br>
      <router-link
        class="button"
        :to="'/visualKeyboard'"
      >
        ⌨️ {{ $t("Practise with Visual Keyboard") }}
      </router-link>
      <br>
      <router-link
        class="button"
        :to="'/typefast'"
      >
        ⚡ {{ $t("Play Typefast game") }}
      </router-link>
      <br>
      <hr>
      <router-link
        class="button"
        :to="'/highScores'"
      >
        🏆 {{ $t("View high scores") }}
      </router-link>
    </div>
  </main>
</template>

<script>
export default {
  name: 'LandingPage'
}
</script>

<style scoped>
.button-lessons {
  background-color: #4caf50;
  box-shadow: 0px 5px 0px 0px #2e7d32;
  font-weight: bold;
}
.button-lessons:hover {
  background-color: #43a047;
}
</style>

