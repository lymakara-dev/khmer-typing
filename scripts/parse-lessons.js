const fs = require('fs')
const path = require('path')

const DEFAULT_SOURCE_DIR = '/home/makara/Downloads/Lesson'
const TARGET_JS_PATH = path.resolve(__dirname, '../src/renderer/components/lessons-list.js')
const TARGET_JSON_PATH = path.resolve(__dirname, '../src/renderer/assets/lessons.json')

const CATEGORY_MAP = {
  1: '១. មូលដ្ឋានគ្រឹះ',
  2: '២. គ្រាប់ចុច េ ិ ែ ី',
  3: '៣. គ្រាប់ចុច រ ុ ឬ ូ',
  4: '៤. គ្រាប់ចុច ង ហ អ ះ',
  5: '៥. របៀបដាក់ជើង និង វណ្ណយុត្តិបន្តក់ (់)',
  6: '៦. គ្រាប់ចុច ច ុំ ជ ុះ',
  7: '៧. គ្រាប់ចុច ម វ ំ េះ',
  8: '៨. គ្រាប់ចុច យ ត ួ ទ',
  9: '៩. គ្រាប់ចុច ាំ ៃ ឌ ធ ញ គ ឡ ោះ',
  10: '១០. គ្រាប់ចុច ន ប ណ ព',
  11: '១១. គ្រាប់ចុច ោ ឹ ៀ ៅ ឺ ឿ',
  12: '១២. គ្រាប់ចុច ផ ឆ ភ ឈ',
  13: '១៣. វណ្ណយុត្តិ (ត្រីសព្ទ មូសិកទន្ដ ៍ ័ ៏ ៌)',
  14: '១៤. គ្រាប់ចុច ឋ ខ ឍ ឃ',
  15: '១៥. ស្រៈពេញតួ',
  16: '១៦. ហ្វឹកហាត់អត្ថបទ'
}

/**
 * Parses an individual lesson file encoded in UTF-16 LE.
 * @param {string} filePath Absolute or relative path to the lesson file
 * @returns {object} Parsed lesson object
 */
function parseLessonFile (filePath) {
  const filename = path.basename(filePath)
  const fileMatch = filename.match(/Lesson(\d+)\.(\d+)\.txt/i)
  if (!fileMatch) {
    throw new Error(`Filename "${filename}" does not match pattern LessonXX.Y.txt`)
  }

  const lessonNumber = parseInt(fileMatch[1], 10)
  const subLesson = parseInt(fileMatch[2], 10)
  const id = `${lessonNumber}.${subLesson}`
  const category = CATEGORY_MAP[lessonNumber] || `មេរៀនទី ${lessonNumber}`

  // Read UTF-16 LE
  let raw = fs.readFileSync(filePath, 'utf16le')

  // Strip BOM if present
  if (raw.charCodeAt(0) === 0xfeff) {
    raw = raw.slice(1)
  }

  // Normalize CRLF to LF
  raw = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  // Find all tag start indices [tagname=
  const tagRegex = /\[([a-zA-Z0-9_]+)=/g
  const tagMatches = []
  let match
  while ((match = tagRegex.exec(raw)) !== null) {
    tagMatches.push({
      tag: match[1],
      start: match.index,
      valStart: match.index + match[0].length
    })
  }

  const tags = {}
  for (let i = 0; i < tagMatches.length; i++) {
    const cur = tagMatches[i]
    const nextStart = (i + 1 < tagMatches.length) ? tagMatches[i + 1].start : raw.length
    let val = raw.substring(cur.valStart, nextStart).trim()

    if (cur.tag === 'info') {
      // In Lesson05.1.txt, a stray ']' prematurely closes info before the Bantak instruction
      val = val.replace(/\]\s*/g, '\n\n').trim()
    } else if (cur.tag === 'text') {
      // In Lesson12.1.txt, a stray ']' occurs before trailing exercise words
      val = val.replace(/\]\s*/g, ' ').trim()
    } else {
      if (val.endsWith(']')) {
        val = val.slice(0, -1).trim()
      }
    }

    tags[cur.tag] = val
  }

  const rawDuration = parseFloat(tags.duration || '0')
  // Duration in seconds: values > 15 (e.g. 59.99) represent ~60s, values <= 15 represent minutes
  const duration = rawDuration > 15 ? Math.round(rawDuration) : Math.round(rawDuration * 60)

  return {
    id,
    filename,
    category,
    title: tags.title || '',
    duration,
    info: tags.info || '',
    text: tags.text || '',
    lessonNumber,
    subLesson,
    rawDuration,
    textbox: parseInt(tags.textbox || '0', 10),
    accuracy: parseInt(tags.accuracy || '0', 10),
    typed: parseInt(tags.typed || '1', 10),
    error: parseInt(tags.error || '0', 10),
    wpm: parseInt(tags.wpm || '1', 10)
  }
}

/**
 * Parses all 42 lessons from source directory and generates outputs.
 * @param {string} sourceDir Directory containing LessonXX.Y.txt files
 */
function parseAllLessons (sourceDir = DEFAULT_SOURCE_DIR) {
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Source directory "${sourceDir}" does not exist.`)
  }

  const files = fs.readdirSync(sourceDir)
    .filter(f => /^Lesson\d+\.\d+\.txt$/i.test(f))
    .sort((a, b) => {
      const matchA = a.match(/Lesson(\d+)\.(\d+)\.txt/i)
      const matchB = b.match(/Lesson(\d+)\.(\d+)\.txt/i)
      const numA = parseInt(matchA[1], 10) * 100 + parseInt(matchA[2], 10)
      const numB = parseInt(matchB[1], 10) * 100 + parseInt(matchB[2], 10)
      return numA - numB
    })

  console.log(`Found ${files.length} lesson files in ${sourceDir}`)

  const lessons = files.map(file => {
    const fullPath = path.join(sourceDir, file)
    return parseLessonFile(fullPath)
  })

  // Build grouped structure (Lessons 1 through 16)
  const groupMap = new Map()
  for (let i = 1; i <= 16; i++) {
    groupMap.set(i, {
      lessonNumber: i,
      category: CATEGORY_MAP[i] || `មេរៀនទី ${i}`,
      lessons: []
    })
  }

  lessons.forEach(lesson => {
    if (groupMap.has(lesson.lessonNumber)) {
      groupMap.get(lesson.lessonNumber).lessons.push(lesson)
    }
  })

  const lessonGroups = Array.from(groupMap.values()).filter(g => g.lessons.length > 0)

  // Ensure target directories exist
  fs.mkdirSync(path.dirname(TARGET_JS_PATH), { recursive: true })
  fs.mkdirSync(path.dirname(TARGET_JSON_PATH), { recursive: true })

  // Write JSON asset
  fs.writeFileSync(TARGET_JSON_PATH, JSON.stringify({
    lessons,
    groups: lessonGroups
  }, null, 2), 'utf8')
  console.log(`Saved JSON output to ${TARGET_JSON_PATH}`)

  // Write lessons-list.js formatted for Standard JS
  const jsContent = `/**
 * Khmer Typing Lessons Module
 * Auto-generated by scripts/parse-lessons.js
 * Contains all 42 lessons parsed from original UTF-16 LE lesson files.
 */

export const lessonsList = ${JSON.stringify(lessons, null, 2)}

// Compatibility with textsList / wordsList pattern
lessonsList.list = lessonsList

export const lessonGroups = ${JSON.stringify(lessonGroups, null, 2)}

/**
 * Find lesson by ID (e.g. '1.1')
 * @param {string} id
 * @returns {object|undefined}
 */
export function getLessonById (id) {
  return lessonsList.find(l => l.id === id)
}

/**
 * Get all lessons for a specific lesson group number (1 to 16)
 * @param {number} lessonNumber
 * @returns {Array}
 */
export function getLessonsByGroup (lessonNumber) {
  return lessonsList.filter(l => l.lessonNumber === lessonNumber)
}

export default lessonsList
`

  fs.writeFileSync(TARGET_JS_PATH, jsContent, 'utf8')
  console.log(`Saved JS module to ${TARGET_JS_PATH}`)

  return { lessons, lessonGroups }
}

if (require.main === module) {
  const customDir = process.argv[2] || DEFAULT_SOURCE_DIR
  try {
    const { lessons, lessonGroups } = parseAllLessons(customDir)
    console.log(`Successfully parsed ${lessons.length} lessons into ${lessonGroups.length} groups.`)
  } catch (err) {
    console.error('Parsing failed:', err)
    process.exit(1)
  }
}

module.exports = {
  parseLessonFile,
  parseAllLessons,
  CATEGORY_MAP
}
