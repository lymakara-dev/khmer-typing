<template>
  <main>
    <h1>khmer-typing</h1>
    <p>{{ $t("Khmer-Typing was developped by a team working for the french NGO Passerelles Numériques (meaning 'Digital Bridges'). Our mission is to provide education, technical and professional training in the digital sector to young underprivileged people by leveraging their potential and willpower.") }}</p>
    <a
      href="https://www.passerellesnumeriques.org/"
      rel="noopener"
      target="_blank"
    >
      <img
        src="static/images/PN_Logo.jpg"
        all="Passerelles Numeriques logo"
      >
    </a>
    <p>{{ $t("This project was born in PN's cambodian school, as a way to facilitate the learning of khmer typing for students. In order for it to benefit to as many people as possible, we then decided to make it open source and available on Windows and Linux stores.") }}</p>
    <div class="attribution-card">
      <h3>{{ $t("Credits & Attribution") }}</h3>
      <p>{{ $t("All credit for the creation and development of Khmer-Typing belongs to the original author Benjamin BALET and Passerelles Numériques.") }}</p>
      <p>{{ $t("This fork adds 42 structured typing lessons with step-by-step finger instructions and guided progression.") }}</p>
    </div>
    <hr>
    <div id="aboutLinks">
      <a
        href="https://www.microsoft.com/store/apps/9MZTL2KK24P7"
        rel="noopener"
        target="_blank"
      >Windows store</a>
      <a
        href="https://snapcraft.io/khmer-typing"
        rel="noopener"
        target="_blank"
      >Snapraft (Linux store)</a>
      <a
        href="https://github.com/passerelles-numeriques/khmer-typing"
        rel="noopener"
        target="_blank"
      >Github</a>
      <a
        href="https://www.passerellesnumeriques.org/"
        rel="noopener"
        target="_blank"
      >Passerelles Numériques</a>
    </div>
    <hr>
    <p style="text-align:center">
      v{{ version }}
    </p>
  </main>
</template>

<script>
  export default {
    name: 'About',
    data() {
      return {
        version: process.env.VUE_APP_VERSION
      }
    }
  }
</script>

<style lang="scss" scoped>
img {
  height: 10vh;
  margin-top: 3%;
}
#aboutLinks {
  margin-top: 3%;
  display: flex;
  flex-direction: column;
}
a {
  margin: 1% auto;
}
.attribution-card {
  background: #f1f5f9;
  border-left: 4px solid #3F51B5;
  border-radius: 6px;
  padding: 12px 18px;
  margin: 20px auto;
  max-width: 600px;
  text-align: left;

  h3 {
    margin: 0 0 6px 0;
    font-size: 1.05rem;
    color: #1e293b;
  }

  p {
    margin: 4px 0;
    font-size: 0.9rem;
    line-height: 1.4;
    color: #475569;
  }
}
</style>
