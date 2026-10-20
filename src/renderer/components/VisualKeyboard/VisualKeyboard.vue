<template>
  <main>
    <h1>{{ $t('Visual Keyboard') }}</h1>
    <p>{{ $t('Write the whole text as fast as you can with as few mistakes as possible') }}</p>

    <!-- Before Game / Lesson Selection Section -->
    <div id="beforeGameWrap-vk">
      <div class="lesson-selector-wrap">
        <label
          for="lesson-select"
          class="lesson-select-label"
        >
          <strong>{{ $t('Select a lesson') }}</strong>
        </label>
        <div class="selector-row">
          <button
            type="button"
            class="btn-nav"
            :disabled="!prevLesson"
            :title="$t('Previous Lesson')"
            @click="selectLesson(prevLesson ? prevLesson.id : null)"
          >
            ◀
          </button>
          <select
            id="lesson-select"
            v-model="selectedLessonId"
            class="lesson-select"
            @change="onLessonChange"
          >
            <option value="random">
              🎲 {{ $t('Random Article') }}
            </option>
            <optgroup
              v-for="group in lessonGroups"
              :key="group.lessonNumber"
              :label="group.category"
            >
              <option
                v-for="lesson in group.lessons"
                :key="lesson.id"
                :value="lesson.id"
              >
                {{ lesson.title }}
              </option>
            </optgroup>
          </select>
          <button
            type="button"
            class="btn-nav"
            :disabled="!nextLesson"
            :title="$t('Next Lesson')"
            @click="selectLesson(nextLesson ? nextLesson.id : null)"
          >
            ▶
          </button>
        </div>
      </div>

      <!-- Lesson Guidance Card -->
      <div
        v-if="currentLesson"
        class="lesson-card"
      >
        <div class="lesson-card-header">
          <span class="lesson-category-tag">{{ currentLesson.category }}</span>
          <h2 class="lesson-card-title">
            {{ currentLesson.title }}
          </h2>
          <div
            v-if="currentLesson.duration"
            class="lesson-duration"
          >
            <span>⏱ {{ $t('Duration') }}: {{ currentLesson.duration }} {{ $t('seconds') }}</span>
          </div>
        </div>

        <div
          v-if="targetCharacters.length > 0"
          class="target-characters-wrap"
        >
          <span class="target-label">{{ $t('Target keys') }}:</span>
          <span
            v-for="(char, idx) in targetCharacters"
            :key="idx"
            class="target-badge"
          >
            {{ char }}
          </span>
        </div>

        <div
          v-if="currentLesson.info"
          class="lesson-guidance"
        >
          <div class="guidance-title">
            ℹ️ <strong>{{ $t('Lesson Instructions') }}</strong>
          </div>
          <div class="guidance-body">
            {{ currentLesson.info }}
          </div>
        </div>

        <div class="text-preview">
          <span class="preview-label">{{ $t('Text preview') }}:</span>
          <p class="preview-content">
            {{ currentLesson.text }}
          </p>
        </div>
      </div>
      <div
        v-else
        class="lesson-card random-card"
      >
        <h2 class="lesson-card-title">
          🎲 {{ $t('Random Article') }}
        </h2>
        <p>{{ $t('Random article from texts collection') }}</p>
      </div>
    </div>

    <button
      id="cmdTyping-vk"
      @click="startGame"
    >
      {{ $t('Start') }}
    </button>

    <div
      id="gameWrap-vk"
      style="display:none;"
    >
      <div class="in-game-header">
        <div class="in-game-lesson-info">
          <div
            v-if="currentLesson"
            class="in-game-title-wrap"
          >
            <span class="lesson-badge">{{ currentLesson.category }}</span>
            <span class="in-game-lesson-title">{{ currentLesson.title }}</span>
          </div>
          <div
            v-else
            class="in-game-title-wrap"
          >
            <span class="lesson-badge">🎲</span>
            <span class="in-game-lesson-title">{{ $t('Random Article') }}</span>
          </div>
        </div>
        <div class="in-game-actions">
          <button
            v-if="currentLesson && currentLesson.info"
            type="button"
            class="btn-text"
            @click="showInfoInGame = !showInfoInGame"
          >
            {{ showInfoInGame ? $t('Hide instructions') : $t('Show instructions') }}
          </button>
          <button
            type="button"
            class="btn-text btn-danger"
            @click="stopGame"
          >
            {{ $t('Change lesson') }}
          </button>
        </div>
      </div>

      <div
        v-if="currentLesson && currentLesson.info && showInfoInGame"
        class="in-game-guidance"
      >
        <span class="guidance-tag"><strong>{{ $t('Lesson Instructions') }}:</strong></span>
        <div class="in-game-guidance-text">
          {{ currentLesson.info }}
        </div>
      </div>

      <div class="row">
        <div class="runesWrap">
          <strong>{{ runesCounter }}</strong>
          / {{ totalRunes }}
        </div>
        <div class="errorsWrap">
          <strong :class="{'error': alertError}">{{ errors }}</strong> errors
        </div>
      </div>
      <div
        id="textWrap-vk"
        :class="{'error-bg': alertError}"
      >
        <h2 id="text-vk">
          <span
            v-for="rune in runes"
            :key="rune.id"
            class="runes"
            :class="{current: rune.isCurrent, correct: rune.isCorrect, hidden: rune.isHidden}"
            :id="rune.id"
          >{{ rune.rune }}</span>
        </h2>
      </div>

      <div>
        <h4 id="decomposition-vk">
          <span>​</span>
          <!-- This span makes sure that the room for the decompisition doesn't disappear -->
          <span
            v-for="letter in letters"
            :key="letter.id"
            :class="{current: letter.isCurrent, correct: letter.isCorrect}"
            :id="letter.id"
          >{{ letter.letter }}</span>
        </h4>
      </div>

      <div id="handsAndKeyboardWrap-vk">
        <div class="row">
          <leftHand id="leftHand-vk" />
          <keyboard id="keyboard-vk" />
          <rightHand id="rightHand-vk" />
        </div>
      </div>
    </div>
    <v-dialog />
  </main>
</template>

<script>
  import splitKhmerRunes from '../../split-khmer'
  import mapping from '../../assets/mapping'
  import hands from '../../assets/hands'
  import leftHand from './LeftHand'
  import rightHand from './RightHand'
  import keyboard from './Keyboard'
  import { textsList } from '../texts-list'
  import { lessonsList, lessonGroups, getLessonById } from '../lessons-list'

  function initialState () {
    return {
      text: '',
      seconds: 0,
      runes: [],
      letters: [],
      runesCounter: 0,
      totalRunes: 0,
      errors: 0,
      alertError: false,
      idsBreakBefore: null
    }
  }

  export default {
    name: 'VisualKeyboard',
    components: {
      leftHand,
      rightHand,
      keyboard
    },
    data () {
      return {
        selectedLessonId: '1.1',
        isPlaying: false,
        showInfoInGame: true,
        lessonGroups: lessonGroups,
        ...initialState()
      }
    },
    computed: {
      currentLesson () {
        if (this.selectedLessonId === 'random') {
          return null
        }
        return getLessonById(this.selectedLessonId) || null
      },
      nextLesson () {
        if (this.selectedLessonId === 'random') {
          return null
        }
        const index = lessonsList.findIndex(l => l.id === this.selectedLessonId)
        if (index >= 0 && index < lessonsList.length - 1) {
          return lessonsList[index + 1]
        }
        return null
      },
      prevLesson () {
        if (this.selectedLessonId === 'random') {
          return null
        }
        const index = lessonsList.findIndex(l => l.id === this.selectedLessonId)
        if (index > 0) {
          return lessonsList[index - 1]
        }
        return null
      },
      targetCharacters () {
        if (!this.currentLesson || !this.currentLesson.title) return []
        const match = this.currentLesson.title.match(/[:៖]\s*(.+)$/)
        if (match && match[1]) {
          return match[1].trim().split(/\s+/)
        }
        return []
      }
    },
    watch: {
      '$route.query.lesson': function (newVal) {
        if (newVal && (newVal === 'random' || getLessonById(newVal)) && newVal !== this.selectedLessonId) {
          this.selectedLessonId = newVal
          localStorage.setItem('visualKeyboard.lastLesson', newVal)
        }
      }
    },
    created () {
      this.initSelectedLesson()
    },
    methods: {
      initSelectedLesson: function () {
        var queryLesson = this.$route.query && this.$route.query.lesson
        var savedLesson = localStorage.getItem('visualKeyboard.lastLesson')
        var target = '1.1'
        if (queryLesson && (queryLesson === 'random' || getLessonById(queryLesson))) {
          target = queryLesson
        } else if (savedLesson && (savedLesson === 'random' || getLessonById(savedLesson))) {
          target = savedLesson
        }
        this.selectedLessonId = target
        localStorage.setItem('visualKeyboard.lastLesson', target)
      },
      onLessonChange: function () {
        this.selectLesson(this.selectedLessonId)
      },
      selectLesson: function (lessonId) {
        if (!lessonId) return
        this.selectedLessonId = lessonId
        localStorage.setItem('visualKeyboard.lastLesson', lessonId)
        if (this.$route.query.lesson !== lessonId) {
          this.$router.replace({
            query: Object.assign({}, this.$route.query, { lesson: lessonId })
          }).catch(() => {})
        }
      },
      resetGameState: function () {
        clearInterval(this.timer)
        document.onkeypress = null
        this.resetHints()
        Object.assign(this.$data, initialState())
      },
      stopGame: function () {
        this.resetGameState()
        this.isPlaying = false
        var beforeWrap = document.getElementById('beforeGameWrap-vk')
        if (beforeWrap) beforeWrap.style.display = 'block'
        var cmdTyping = document.getElementById('cmdTyping-vk')
        if (cmdTyping) cmdTyping.style.display = 'inline-block'
        var gameWrap = document.getElementById('gameWrap-vk')
        if (gameWrap) gameWrap.style.display = 'none'
      },
      /**
       * Initializes the game by changing the DOM
       */
      startGame: function () {
        // Change the visible elements
        var beforeWrap = document.getElementById('beforeGameWrap-vk')
        if (beforeWrap) beforeWrap.style.display = 'none'
        var cmdTyping = document.getElementById('cmdTyping-vk')
        if (cmdTyping) cmdTyping.style.display = 'none'
        var gameWrap = document.getElementById('gameWrap-vk')
        if (gameWrap) gameWrap.style.display = 'block'
        this.isPlaying = true

        // Select text from chosen lesson or random texts list
        if (this.selectedLessonId === 'random') {
          var random = Math.floor(Math.random() * (textsList.list.length))
          this.text = textsList.list[random]
        } else {
          var lesson = getLessonById(this.selectedLessonId)
          if (lesson && lesson.text) {
            this.text = lesson.text.replace(/\u00a0/g, ' ').replace(/\r?\n+/g, ' ').trim()
          } else {
            var rand = Math.floor(Math.random() * (textsList.list.length))
            this.text = textsList.list[rand]
          }
        }

        // Start the timer
        clearInterval(this.timer)
        var vm = this
        this.timer = setInterval(() => {
          vm.seconds++
        }, 1000)
        // Start playing
        this.play()
      },
      /**
       * Play the game
       * The user has to type a text in khmer
       */
      play: function () {
        var vm = this
        // Initialization
        // var completeText = ''
        this.runesCounter = 0
        var listRunes = splitKhmerRunes(this.text)
        this.totalRunes = listRunes.length
        this.splitTextIntoSpannedRunes(this.text)
        this.splitRuneIntoSpannedLetters(listRunes[this.runesCounter])
        var listKeys = this.getAllKeys(this.text)
        var currentLetters = ''
        // Highlights
        this.runes[this.runesCounter].isCurrent = true
        this.letters[currentLetters.length].isCurrent = true
        // Display the first hints
        this.resetHints()
        this.nextHint(listKeys)

        // Game progress
        document.onkeypress = function (ev) {
          ev.preventDefault()
          var isCorrect = vm.areRightKeysPressed(ev, listKeys, currentLetters)
          // Pressed key is correct
          if (isCorrect) {
            // completeText += ev.key
            currentLetters += ev.key
            // Highlight correct letter
            vm.letters[currentLetters.length - 1].isCurrent = false
            vm.letters[currentLetters.length - 1].isCorrect = true
            // Check if a grapheme has been completed
            var graphemes = splitKhmerRunes(currentLetters)
            if (graphemes[0] === listRunes[vm.runesCounter]) {
              // We show to the user that the grapheme is completed
              vm.runes[vm.runesCounter].isCurrent = false
              vm.runes[vm.runesCounter].isCorrect = true
              // Current grapheme is completed, we start again to track the next one
              currentLetters = ''
              vm.letters = []
              vm.runesCounter++
              // Display decomposition of the next grapheme if exists
              if (vm.runesCounter < listRunes.length) {
                vm.splitRuneIntoSpannedLetters(listRunes[vm.runesCounter])
              }
              // If we arrive at the end of a line, hide it
              vm.scrollSync()
            }
            // Current action is done
            listKeys.shift()
            // No next action, game is won
            if (listKeys.length === 0) {
              currentLetters = ''
              vm.endGame()
            } else { // We display hints for the next action
              vm.runes[vm.runesCounter].isCurrent = true
              vm.letters[currentLetters.length].isCurrent = true
              vm.resetHints()
              vm.nextHint(listKeys)
            }
          } else { // Pressed key is wrong
            vm.alertWrongKey()
          }
        }
      },
      /**
       * Displays the modal with the scores
       * Also saves the highest score
       * In case user wants to play again, resets data
       */
      endGame: function () {
        clearInterval(this.timer)
        document.onkeypress = null
        var minutes = Math.round((this.seconds / 60) * 100) / 100
        var newSpeed = this.runesCounter / (this.seconds / 60)
        this.seconds = 0
        // Save highest scores in terms of speed and accuracy
        var oldErrors = localStorage.getItem('visualKeyboard.acc.errors') ? localStorage.getItem('visualKeyboard.acc.errors') : Infinity
        if (this.errors < oldErrors) { // best in terms of accuracy
          localStorage.setItem('visualKeyboard.acc.time', minutes)
          localStorage.setItem('visualKeyboard.acc.errors', this.errors)
          localStorage.setItem('visualKeyboard.acc.runes', this.runesCounter)
        }
        var oldMinutes = localStorage.getItem('visualKeyboard.speed.time') ? localStorage.getItem('visualKeyboard.speed.time') : Infinity
        var oldRunes = localStorage.getItem('visualKeyboard.speed.runes') ? localStorage.getItem('visualKeyboard.speed.runes') : 0
        var oldSpeed = oldRunes / oldMinutes
        if (newSpeed > oldSpeed) { // best in terms of speed
          localStorage.setItem('visualKeyboard.speed.time', minutes)
          localStorage.setItem('visualKeyboard.speed.errors', this.errors)
          localStorage.setItem('visualKeyboard.speed.runes', this.runesCounter)
        }

        var modalButtons = []
        var next = this.nextLesson
        if (next) {
          modalButtons.push({
            title: this.$i18n.t('Next Lesson'),
            default: true, // Will be triggered by default if 'Enter' pressed.
            handler: () => {
              this.$modal.hide('dialog')
              this.selectLesson(next.id)
              this.resetGameState()
              this.startGame()
            }
          })
        }
        modalButtons.push(
          {
            title: this.$i18n.t('Play again'),
            default: !next,
            handler: () => {
              this.$modal.hide('dialog')
              this.resetGameState()
              this.startGame()
            }
          },
          {
            title: this.$i18n.t('High scores'),
            handler: () => {
              this.$modal.hide('dialog')
              this.$router.push('highScores')
            }
          },
          {
            title: this.$i18n.t('Home'),
            handler: () => {
              this.$modal.hide('dialog')
              this.$router.push('/')
            }
          }
        )

        // Display results
        this.$modal.show('dialog', {
          title: this.$i18n.t('message.finishedPlaying'),
          text: this.$i18n.t('message.scoreVisualKeyboard', { errors: this.errors, minutes: minutes }),
          buttons: modalButtons
        })
      },
      /**
       * Display the text to be typed by the user
       * with each rune encapsulated in a span and with a specific id
       * to facilitate their highlighting later
       * @param text the text to be typed by the user
       */
      splitTextIntoSpannedRunes: function (text) {
        // Split the string to an array of grapheme clusters (one string each)
        var graphemes = splitKhmerRunes(text)
        for (var i = 0; i < graphemes.length; i++) {
          this.runes.push({'id': 'rune-' + i, 'rune': graphemes[i], 'isCurrent': false, 'isCorrect': false, 'isHidden': false})
        }
      },
      /**
       * Display the rune to be typed by the user
       * with each letter encapsulated in a span and with a specific id
       * to facilitate their highlighting later
       * @param text the text to be typed by the user
       */
      splitRuneIntoSpannedLetters: function (rune) {
        // Split the graph to an array of strings
        var letters = rune.split('')
        for (var i = 0; i < letters.length; i++) {
          var letter = letters[i]
          // Add a space before this specific character, otherwise it doesn't stand out
          if (letter === '្') {
            letter = ' ្'
          }
          this.letters.push({'id': 'letter-' + i, 'letter': letter, 'isCurrent': false, 'isCorrect': false})
        }
      },
      /**
       * Computes where the overflowed text is broken to begin new lines
       */
      getRunesIdsBreakBefore: function () {
        var idBreakBefore = []
        var runes = document.getElementsByClassName('runes')
        // Loop through all the runes
        for (var i = 0; i < runes.length; i++) {
          // If a rune has minimal offsetLeft, it means it's on the left of the element, ie at the beginning of a new line
          if ((!runes[i - 1]) || (runes[i].offsetLeft < runes[i - 1].offsetLeft)) {
            idBreakBefore.push(i)
          }
        }
        return idBreakBefore
      },
      /**
       * When the user arrives at the end of a line
       * Scroll to display the next one
       * @param ids the list of ids of the runes that are at the beginnig of each line
       * @param currentId the id of the current rune, ie the one after the last rune validated
       */
      scrollSync: function (currentId) {
        // We are at a break point
        if (this.idsBreakBefore && this.idsBreakBefore.includes(this.runesCounter)) {
          // Hide all the runes before the current one, ie hide the line
          for (var i = 0; i < this.runesCounter; i++) {
            this.runes[i].isHidden = true
          }
        }
      },
      /**
       * Get the list of ordered keys to type
       * @param text the text to be typed by the user
       * @param hands the object defining which key should be typed with which finger
       * @return an array containing the ordered list of keys to type
       */
      getAllKeys: function (text) {
        // Array of arrays
        var listKeys = []
        // Get the list of actions to be done by the user
        for (var i = 0; i < text.length; i++) {
          var letter = text.substring(i, i + 1)
          var keys = mapping[letter]
          if (keys === undefined) {
            console.log('Mapping undefined: ' + letter)
          } else {
            listKeys.push(keys)
          }
        }
        return listKeys
      },
      /**
       * Checks if the keys the user typed fit with what the action should be
       * @param event the pressedKey event generated when the user typed a new character
       * @param listKeys the current ordered list of keys to type
       * @return a boolean, true if the right keys have have been pressed, false otherwise
       */
      areRightKeysPressed: function (event, listKeys, currentLetters) {
        var keyPressed = mapping[event.key]
        var isCorrect = true
        var keyToPress = listKeys[0]

        // Careful if typing in english letters
        if (keyPressed === undefined) {
          this.$modal.show('dialog', {
            title: this.$i18n.t('Alert!'),
            text: this.$i18n.t('message.alertVisualKeyboard'),
            buttons: [
              {
                title: this.$i18n.t('Close'),
                default: true // Will be triggered by default if 'Enter' pressed.
              }
            ]
          })
          isCorrect = false
        } else if (keyToPress.length > 1) {
        // More than one key to press means the first key is ALT or SHIFT
          if (keyToPress[0].split('_')[1] === 'SHIFT') {
            isCorrect = event.shiftKey
          } else if (keyToPress[0] === 'ALT_GR') {
            // Browsers don't detect the pressing of the ALT_GR key
            // That's why here we check the letters typed instead of the keys pressed
            isCorrect = (event.key === this.letters[currentLetters.length].letter)
          }
          // We've checked SHIFT and ALT, we move on to checking the second key
          keyPressed = keyPressed[1]
          keyToPress = keyToPress[1]
        } else {
          keyPressed = keyPressed[0]
          keyToPress = keyToPress[0]
        }
        isCorrect = ((keyPressed === keyToPress) && (isCorrect))
        return isCorrect
      },
      /**
       * When the user makes a mistake, the text area and error counter blinks in orange
       * and the error counter is incremented
       */
      alertWrongKey: function () {
        var vm = this
        vm.alertError = true
        // Back to normal after 0.5s
        setTimeout(function () {
          vm.alertError = false
        }, 500)
        // Incrementation
        this.errors++
      },
      /**
       * Highlights the fingers and keys to use for the current action in orange
       * To help the user type the text correctly
       * @param listKeys the current ordered list of keys to type
       */
      nextHint: function (listKeys) {
        // These are arrays
        var currentKeys = listKeys[0]
        var currentFingers = []
        for (var j = 0; j < currentKeys.length; j++) {
          currentFingers.push(hands[currentKeys[j]])
        }
        var color = '#ffab40'
        for (var i = 0; i < currentFingers.length; i++) {
          var finger = currentFingers[i]
          var key = currentKeys[i]
          // Space is the only key where we can use two fingers
          if (key === 'SPACE') {
            var leftH = document.getElementById('leftHand')
            if (leftH) leftH.getElementById('left-finger-1').setAttributeNS(null, 'fill', color)
            var rightH = document.getElementById('rightHand')
            if (rightH) rightH.getElementById('right-finger-1').setAttributeNS(null, 'fill', color)
          } else {
            var hand = finger.split('-')[0]
            // Highlight the correct finger on the correct hand
            var targetHand = document.getElementById(hand + 'Hand')
            if (targetHand) targetHand.getElementById(finger).setAttributeNS(null, 'fill', color)
          }
          // Highlight the correct key on the keyboard
          var kb = document.getElementById('keyboard')
          if (kb) kb.getElementById(key).setAttributeNS(null, 'fill', color)
        }
      },
      /**
      * Resets all the fingers and keys to their default color
      */
      resetHints: function () {
        var keys = Object.keys(hands)
        var fingers = ['right-finger-1', 'left-finger-1', 'right-finger-2', 'left-finger-2', 'right-finger-3', 'left-finger-3', 'right-finger-4', 'left-finger-4', 'right-finger-5', 'left-finger-5']
        var greyKeys = ['BACKSPACE', 'MENU', 'FN', 'WINDOWS', 'path5784', 'SPACE', 'ALT_GR', 'ENTER', 'RIGHT_SHIFT', 'RIGHT_CTRL', 'ALT', 'TAB', 'CAPS_LOCK', 'LEFT_SHIFT', 'LEFT_CTRL']
        var hand
        // Loop through all the fingers
        for (var i = 0; i < fingers.length; i++) {
          hand = fingers[i].split('-')[0]
          var handEl = document.getElementById(hand + 'Hand')
          if (handEl && handEl.getElementById(fingers[i])) {
            handEl.getElementById(fingers[i]).setAttributeNS(null, 'fill', 'none')
          }
        }
        var svgKeyboard = document.getElementById('keyboard')
        if (svgKeyboard) {
          // Loop through all the normal keys
          for (i = 0; i < keys.length; i++) {
            var keyEl = svgKeyboard.getElementById(keys[i])
            if (keyEl) keyEl.setAttributeNS(null, 'fill', 'white')
          }
          // Loop through all the grey keys
          for (i = 0; i < greyKeys.length; i++) {
            var greyEl = svgKeyboard.getElementById(greyKeys[i])
            if (greyEl) greyEl.setAttributeNS(null, 'fill', '#C1C0C0')
          }
        }
      }
    },
    beforeDestroy () {
      document.onkeypress = null
      clearInterval(this.timer)
    },
    updated () {
      // The dom has changed, update the list of breaking points in case it's needed
      this.idsBreakBefore = this.getRunesIdsBreakBefore()
    }
  }
</script>

<style scoped>
.hidden {
  display: none;
}
.current {
  color: #ffc10a;
}

.correct {
  color: #3f51b5;
}

.runesWrap,
.errorsWrap {
  font-size: 1.5em;
  width: 50%;
  color: #ffc10a;
  margin-bottom: 1%;
}

.runesWrap {
  text-align: start;
}
.errorsWrap {
  text-align: end;
}

#leftHand-vk,
#rightHand-vk {
  width: 15%;
}
#keyboard-vk {
  width: 70%;
}

#decomposition-vk,
#text-vk {
  font-weight: normal;
  word-break: break-all;
}

#text-vk {
  line-height: 1.5em;
  font-size: 3em;
  max-height: 3em;
  overflow: hidden;
  margin: 0 auto;
}

#decomposition-vk {
  font-size: 2em;
  margin: 1% auto 3% auto;
}

#textWrap-vk {
  background-color: #ddd;
  border-radius: 5px;
}

.error-bg {
  animation: errorAnimationBackground 0.5s;
}

@keyframes errorAnimationBackground {
  0% {
    background-color: #ddd;
  }
  33% {
    background-color: #ffc10a;
  }
  100% {
    background-color: #ddd;
  }
}

.error {
  animation: errorAnimation 0.5s;
}

@keyframes errorAnimation {
  0% {
    color: #ffc10a;
  }
  33% {
    color: black;
  }
  100% {
    color: #ffc10a;
  }
}

.lesson-selector-wrap {
  margin: 20px auto 10px auto;
  max-width: 750px;
}

.lesson-select-label {
  display: block;
  font-size: 1.15em;
  color: #3f51b5;
  margin-bottom: 8px;
}

.selector-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.lesson-select {
  flex: 1;
  max-width: 650px;
  height: 42px;
  font-size: 1.05em;
  padding: 4px 10px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 6px;
  color: #333;
}

.btn-nav {
  padding: 8px 14px;
  font-size: 1.1em;
  margin: 0;
  border-radius: 6px;
  background-color: #3f51b5;
  box-shadow: 0 3px 0 0 #283593;
}

.btn-nav:disabled {
  background-color: #bbb;
  box-shadow: none;
  cursor: not-allowed;
  opacity: 0.6;
}

.lesson-card {
  max-width: 750px;
  margin: 15px auto 20px auto;
  padding: 16px 20px;
  background-color: #fafafa;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  text-align: left;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.lesson-card-header {
  margin-bottom: 10px;
}

.lesson-category-tag {
  display: inline-block;
  background-color: #e8eaf6;
  color: #3f51b5;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.85em;
  font-weight: bold;
}

.lesson-card-title {
  margin: 6px 0;
  color: #1a237e;
  font-size: 1.35em;
}

.lesson-duration {
  font-size: 0.9em;
  color: #666;
}

.target-characters-wrap {
  margin: 10px 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.target-label {
  font-weight: bold;
  color: #e65100;
  margin-right: 4px;
}

.target-badge {
  display: inline-block;
  padding: 2px 10px;
  background-color: #fff3e0;
  border: 1px solid #ffb74d;
  border-radius: 4px;
  font-size: 1.25em;
  font-weight: bold;
  color: #d84315;
}

.lesson-guidance {
  margin: 12px 0;
  padding: 12px 15px;
  background-color: #e8f5e9;
  border-left: 4px solid #4caf50;
  border-radius: 4px;
}

.guidance-title {
  color: #2e7d32;
  margin-bottom: 6px;
}

.guidance-body {
  white-space: pre-line;
  line-height: 1.6;
  color: #263238;
}

.text-preview {
  margin-top: 12px;
  font-size: 0.95em;
}

.preview-label {
  font-weight: bold;
  color: #555;
}

.preview-content {
  margin: 4px 0 0 0;
  padding: 8px 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
  border: 1px dashed #ccc;
  color: #444;
  line-height: 1.5;
  max-height: 80px;
  overflow-y: auto;
  word-break: break-all;
}

.random-card {
  text-align: center;
  padding: 30px;
}

.in-game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid #e0e0e0;
  flex-wrap: wrap;
  gap: 10px;
}

.in-game-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lesson-badge {
  background-color: #3f51b5;
  color: #fff;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.8em;
}

.in-game-lesson-title {
  font-size: 1.15em;
  font-weight: bold;
  color: #333;
}

.in-game-actions {
  display: flex;
  gap: 8px;
}

.btn-text {
  background: none;
  border: 1px solid #3f51b5;
  color: #3f51b5;
  box-shadow: none;
  font-size: 0.9em;
  padding: 4px 10px;
  margin: 0;
  border-radius: 4px;
}

.btn-text:active {
  transform: none;
  box-shadow: none;
  background-color: #e8eaf6;
}

.btn-text.btn-danger {
  border-color: #e53935;
  color: #e53935;
}

.btn-text.btn-danger:active {
  background-color: #ffebee;
}

.in-game-guidance {
  text-align: left;
  background-color: #e8f5e9;
  border-left: 4px solid #4caf50;
  padding: 8px 12px;
  margin-bottom: 12px;
  border-radius: 4px;
  font-size: 0.95em;
}

.in-game-guidance-text {
  white-space: pre-line;
  margin-top: 4px;
  color: #263238;
}
</style>
