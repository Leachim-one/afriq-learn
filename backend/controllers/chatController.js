import 'dotenv/config';
import Groq from 'groq-sdk'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'


// Models in priority order — if one hits rate limit, next is tried
const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-70b-versatile',
  'llama-3.1-8b-instant',
  'gemma2-9b-it',
]

const groqCompletion = async (params) => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  let lastError
  for (const model of GROQ_MODELS) {
    try {
      return await groq.chat.completions.create({ ...params, model })
    } catch (err) {
      const isRateLimit = err?.status === 429 || err?.error?.code === 'rate_limit_exceeded'
      if (isRateLimit) {
        console.warn(`Rate limit hit on ${model}, trying next model...`)
        lastError = err
        continue
      }
      throw err
    }
  }
  throw lastError
}

const normalizeId = (value) => String(value ?? '')

const toPlainRoadmap = (roadmap) => {
  if (!roadmap) return null
  return typeof roadmap.toObject === 'function' ? roadmap.toObject() : roadmap
}

const syncActiveRoadmap = (user, roadmap) => {
  const activeRoadmap = toPlainRoadmap(roadmap)
  if (!activeRoadmap) {
    user.currentRoadmap = null
    return
  }

  user.currentRoadmap = activeRoadmap
  if (user.roadmaps?.length) {
    const activeId = normalizeId(activeRoadmap.id)
    user.roadmaps = user.roadmaps.map(r => {
      const plain = toPlainRoadmap(r)
      const isActive = activeId ? normalizeId(plain.id) === activeId : plain.isActive
      return isActive ? { ...plain, ...activeRoadmap, isActive: true } : { ...plain, isActive: false }
    })
    user.markModified('roadmaps')
  }
  user.markModified('currentRoadmap')
}

const youtubeSearchUrl = (topic) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(`${topic} tutorial`).replace(/%20/g, '+')}`

const officialDocsUrl = (topic) => {
  const t = topic.toLowerCase()
  if (t.includes('html')) return 'https://developer.mozilla.org/en-US/docs/Web/HTML'
  if (t.includes('css')) return 'https://developer.mozilla.org/en-US/docs/Web/CSS'
  if (t.includes('javascript') || t.includes('js')) return 'https://developer.mozilla.org/en-US/docs/Web/JavaScript'
  if (t.includes('react')) return 'https://react.dev/learn'
  if (t.includes('node')) return 'https://nodejs.org/en/learn'
  if (t.includes('python')) return 'https://docs.python.org/3/tutorial/'
  if (t.includes('git')) return 'https://git-scm.com/book/en/v2'
  if (t.includes('database') || t.includes('sql')) return 'https://www.postgresql.org/docs/current/tutorial.html'
  return 'https://developer.mozilla.org/en-US/docs/Learn'
}

const buildFallbackResources = (topic) => [
  { type: 'video', title: `${topic} tutorial`, url: youtubeSearchUrl(topic), source: 'YouTube' },
  { type: 'docs', title: `${topic} documentation`, url: officialDocsUrl(topic), source: 'Official Docs' },
]

const normalizeNodeResources = (node) => {
  const topic = node.label || node.title || 'this topic'
  const resources = Array.isArray(node.resources) ? node.resources.filter(r => r?.url && r?.title) : []
  const hasVideo = resources.some(r => r.type === 'video' || /youtube/i.test(`${r.source || ''} ${r.url || ''}`))
  const merged = hasVideo ? resources : [buildFallbackResources(topic)[0], ...resources]
  const fallback = buildFallbackResources(topic)

  for (const resource of fallback) {
    if (merged.length >= 4) break
    const exists = merged.some(r => r.type === resource.type || r.url === resource.url)
    if (!exists) merged.push(resource)
  }

  return {
    ...node,
    id: normalizeId(node.id || Date.now()),
    status: node.status || 'notStarted',
    resources: merged.slice(0, 4)
  }
}

const normalizeRoadmap = (roadmap) => ({
  ...roadmap,
  nodes: (roadmap.nodes || []).map(normalizeNodeResources)
})

export const chat = async (req, res) => {
  try {

    const { messages, userProfile } = req.body

    // Count how many user messages there have been so far
    const userMessageCount = messages.filter(m => m.role === 'user').length

    const systemContext = `
You are a friendly, warm career guide at Afriq Learn — a platform built to help people in Africa launch tech careers.
You are NOT a formal chatbot. You talk like a knowledgeable friend who genuinely cares about the person you're talking to.

User profile context (use this to personalize but don't repeat it back):
- Skill Level: ${userProfile?.skillLevel || 'Beginner'}
- Preferred Language: ${userProfile?.preferredLanguage || 'Not specified'}
- Learning Pace: ${userProfile?.learningPace || 'Normal'}

YOUR PERSONALITY:
- Warm, encouraging, and conversational — like a big sibling in tech
- Ask follow-up questions naturally, one at a time
- Show genuine interest in their story, background, and dreams
- Share your enthusiasm when they say something interesting
- Be honest about timelines and what it takes
- Use simple, clear language — avoid jargon unless they use it first
- You can use light humor and emojis occasionally

HOW THE CONVERSATION SHOULD FLOW:
Phase 1 — Get to know them (first few exchanges):
  - Let them share their story. Don't rush.
  - Understand their background: are they students, working a job, complete beginners?
  - What got them interested in tech? What have they tried so far?

Phase 2 — Understand what they want (dig deeper):
  - What kind of work excites them? (building apps, working with data, security, etc.)
  - Do they have a specific goal? (get a job, freelance, build their own product, switch careers?)
  - Any tech they've heard of and want to learn? Any they definitely don't want?
  - What's their situation — how much time can they dedicate per week?

Phase 3 — Help them get specific (optional but valuable):
  - If they're torn between paths, help them decide by asking what kind of problems they want to solve
  - Share what the different paths look like day-to-day
  - Validate their choice and get them excited about it

Phase 4 — Generate roadmap ONLY when ready:
  - You should have had AT LEAST 6-8 back-and-forth exchanges before generating a roadmap
  - The user should have expressed a clear direction and you should feel confident you understand what they want
  - When you're truly ready, generate the roadmap using the exact format below
  - Tell them you're building it for them based on everything they've shared

ROADMAP GENERATION FORMAT (use EXACTLY when ready — nothing before or after):
ROADMAP_READY:{"title":"Career Title","description":"Brief description","nodes":[{"id":"1","label":"Topic Name","description":"What this covers","estimatedTime":"1-2 weeks","level":1,"prerequisites":[],"skills":["skill 1","skill 2"],"resources":[{"type":"video","title":"Resource title","url":"https://www.youtube.com/results?search_query=topic+tutorial","source":"YouTube"},{"type":"docs","title":"Resource title","url":"https://developer.mozilla.org/en-US/docs/Web","source":"Official Docs"}]}]}

ROADMAP RULES:
- Generate 10-14 nodes in true prerequisite order (fundamentals first)
- Each node MUST include prerequisites, skills, and 2-3 resources
- For video resources, use YouTube SEARCH links: https://www.youtube.com/results?search_query=topic+tutorial
- For docs, use real URLs from MDN, official docs, etc. — NO freeCodeCamp or competitor links
- Add realistic estimatedTime to each node based on the user's pace
- The roadmap should reflect the SPECIFIC path they discussed, not a generic one

IMPORTANT: Do NOT generate a roadmap until you have had at least 6 back-and-forth exchanges and fully understand what the user wants. If the user asks you to generate one early, tell them you want to make sure it's truly personalized and ask a couple more questions. The conversation should feel natural and complete.
`

    const formattedMessages = [
      { role: 'system', content: systemContext },
      ...messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
    ]

    const completion = await groqCompletion({
      messages: formattedMessages,
      max_tokens: 4000,
      temperature: 0.7
    })

    const response = completion.choices[0].message.content
    res.status(200).json({ message: response })
  } catch (error) {
    console.error('Groq error:', error)
    res.status(500).json({ message: 'AI error', error: error.message })
  }
}

export const generateRoadmap = async (req, res) => {
  try {

    const { careerTitle, userProfile, messages } = req.body

    const prompt = `You are an expert curriculum designer. Generate a detailed, dependency-ordered learning roadmap.

Career Goal: ${careerTitle}
User Profile: ${JSON.stringify(userProfile)}

Respond ONLY with valid JSON, no markdown:
{
  "title": "Career Path Title",
  "description": "Brief description",
  "nodes": [
    {
      "id": "1",
      "label": "Topic Name",
      "description": "What this covers",
      "estimatedTime": "1-2 weeks",
      "level": 1,
      "prerequisites": [],
      "skills": ["concrete skill 1", "concrete skill 2"],
      "resources": [
        {"type": "video", "title": "Title", "url": "https://www.youtube.com/results?search_query=topic+tutorial", "source": "YouTube"},
        {"type": "docs", "title": "Title", "url": "https://developer.mozilla.org", "source": "Official Docs"},
        {"type": "course", "title": "Title", "url": "https://www.freecodecamp.org", "source": "freeCodeCamp"}
      ]
    }
  ]
}

Rules:
- Generate 10-14 nodes in true prerequisite order: fundamentals first, advanced topics last
- Each node MUST have 2-4 resources, including at least one YouTube video search link and one documentation/article/course link
- Every node MUST include realistic prerequisites using earlier node ids only, and 2-4 practical skills
- Use YouTube search links for videos
- estimatedTime should be realistic for the user's skill level and pace`

    const completion = await groqCompletion({
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000,
      temperature: 0.7
    })

    let response = completion.choices[0].message.content
    response = response.replace(/```json/g, '').replace(/```/g, '').trim()
    const roadmap = normalizeRoadmap(JSON.parse(response))
    res.status(200).json({ roadmap })
  } catch (error) {
    console.error('Roadmap generation error:', error)
    res.status(500).json({ message: 'Error generating roadmap', error: error.message })
  }
}

export const saveRoadmap = async (req, res) => {
  try {
    const { roadmap } = req.body
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'Not authorized' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)
    const normalizedRoadmap = normalizeRoadmap(roadmap)
    syncActiveRoadmap(user, normalizedRoadmap)
    await user.save()
    res.status(200).json({ message: 'Roadmap saved!' })
  } catch (error) {
    res.status(500).json({ message: 'Error saving roadmap', error: error.message })
  }
}

export const saveNewRoadmap = async (req, res) => {
  try {
    const { roadmap } = req.body
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'Not authorized' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)

    if (!user.roadmaps) user.roadmaps = []
    if (user.roadmaps.length >= 2) {
      return res.status(400).json({ message: 'You can only save up to 2 roadmaps. Please delete one first.' })
    }

    const normalizedRoadmap = normalizeRoadmap(roadmap)
    const newRoadmap = {
      id: Date.now().toString(),
      title: normalizedRoadmap.title,
      description: normalizedRoadmap.description,
      nodes: normalizedRoadmap.nodes,
      createdAt: new Date(),
      isActive: true
    }

    user.roadmaps = user.roadmaps.map(r => ({ ...r, isActive: false }))
    user.roadmaps.push(newRoadmap)
    syncActiveRoadmap(user, newRoadmap)
    user.markModified('roadmaps')
    await user.save()

    res.status(200).json({ message: 'Roadmap saved!', roadmap: newRoadmap })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const getMyRoadmap = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'Not authorized' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)
    res.status(200).json({ roadmap: user.currentRoadmap })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const getAllRoadmaps = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'Not authorized' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)
    const current = toPlainRoadmap(user.currentRoadmap)
    const roadmaps = (user.roadmaps || []).map(r => {
      const plain = toPlainRoadmap(r)
      if (current && (plain.isActive || normalizeId(plain.id) === normalizeId(current.id))) {
        return { ...plain, ...current, isActive: true }
      }
      return plain
    })
    res.status(200).json({ roadmaps })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const switchRoadmap = async (req, res) => {
  try {
    const { roadmapId } = req.body
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'Not authorized' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)

    user.roadmaps = user.roadmaps.map(r => ({ ...toPlainRoadmap(r), isActive: normalizeId(r.id) === normalizeId(roadmapId) }))
    const active = user.roadmaps.find(r => normalizeId(r.id) === normalizeId(roadmapId))
    if (!active) return res.status(404).json({ message: 'Roadmap not found' })
    syncActiveRoadmap(user, active)
    await user.save()

    res.status(200).json({ message: 'Switched!', roadmap: active })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const deleteRoadmap = async (req, res) => {
  try {
    const { roadmapId } = req.body
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'Not authorized' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)

    user.roadmaps = user.roadmaps.filter(r => normalizeId(r.id) !== normalizeId(roadmapId)).map(toPlainRoadmap)
    if (user.roadmaps.length > 0) {
      user.roadmaps[0].isActive = true
      syncActiveRoadmap(user, user.roadmaps[0])
    } else {
      user.currentRoadmap = null
      user.markModified('currentRoadmap')
    }
    user.markModified('roadmaps')
    await user.save()

    res.status(200).json({ message: 'Deleted!' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const updateNodeStatus = async (req, res) => {
  try {
    const { nodeId, status } = req.body
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'Not authorized' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)

    if (user.currentRoadmap && user.currentRoadmap.nodes) {
      const updatedRoadmap = {
        ...toPlainRoadmap(user.currentRoadmap),
        nodes: user.currentRoadmap.nodes.map(node => {
        if (normalizeId(node.id) === normalizeId(nodeId)) return { ...node, status }
        return node
        })
      }
      syncActiveRoadmap(user, updatedRoadmap)
      await user.save()
    }

    res.status(200).json({ message: 'Status updated' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const generateQuiz = async (req, res) => {
  try {

    const { topic, difficulty, count = 5 } = req.body
    const safeCount = Math.min(Math.max(Number(count) || 5, 3), 15)

    const prompt = `You are an expert quiz writer for a tech learning app.

Create a ${difficulty || 'beginner'} quiz about "${topic}".

Respond ONLY with valid JSON, no markdown:
{
  "topic": "${topic}",
  "difficulty": "${difficulty || 'beginner'}",
  "questions": [
    {
      "id": "1",
      "question": "Clear multiple-choice question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Short explanation of why the answer is correct"
    }
  ]
}

Rules:
- Generate exactly ${safeCount} questions
- Each question must have exactly 4 options
- correctAnswer must be the zero-based index of the correct option
- Focus on practical understanding, not trick questions
- Match the difficulty level`

    const completion = await groqCompletion({
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.7
    })

    let response = completion.choices[0].message.content
    response = response.replace(/```json/g, '').replace(/```/g, '').trim()
    const quiz = JSON.parse(response)
    res.status(200).json({ quiz })
  } catch (error) {
    console.error('Quiz generation error:', error)
    res.status(500).json({ message: 'Error generating quiz', error: error.message })
  }
}

export const saveQuizResult = async (req, res) => {
  try {
    const { topic, difficulty, score, total, passed, questions, answers, timeTaken } = req.body
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'Not authorized' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)

    if (!user.quizResults) user.quizResults = []
    user.quizResults.push({ topic, difficulty, score, total, passed, questions, answers, timeTaken, takenAt: new Date() })
    await user.save()

    res.status(200).json({ message: 'Quiz result saved!' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const getQuizResults = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'Not authorized' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)

    res.status(200).json({ results: user.quizResults || [] })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// ---- YouTube helper (#11/#12) ----
const fetchYouTubeVideo = async (query) => {
  try {
    if (!process.env.YOUTUBE_API_KEY) return null
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query + ' tutorial')}&type=video&videoEmbeddable=true&maxResults=1&relevanceLanguage=en&safeSearch=strict&order=relevance&key=${process.env.YOUTUBE_API_KEY}`
    const r = await fetch(url)
    const data = await r.json()
    const item = data.items?.[0]
    if (!item) return null
    return {
      videoId: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.medium?.url
    }
  } catch (e) {
    console.warn('YouTube fetch failed:', e.message)
    return null
  }
}

const fetchYouTubeVideos = async (query, maxResults = 4) => {
  try {
    if (!process.env.YOUTUBE_API_KEY) return []
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query + ' tutorial')}&type=video&videoEmbeddable=true&maxResults=${maxResults}&relevanceLanguage=en&safeSearch=strict&order=relevance&key=${process.env.YOUTUBE_API_KEY}`
    const r = await fetch(url)
    const data = await r.json()
    if (!data.items?.length) return []
    return data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.medium?.url
    }))
  } catch (e) {
    console.warn('YouTube videos fetch failed:', e.message)
    return []
  }
}

export const getTopicVideos = async (req, res) => {
  try {
    const { topic, maxResults = 4 } = req.body
    const videos = await fetchYouTubeVideos(topic, maxResults)
    res.status(200).json({ videos })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching videos', error: error.message })
  }
}

export const getTopicContent = async (req, res) => {
  try {
    const { topic, skillLevel } = req.body

    const prompt = `You are a tech tutor for Afriq Learn. For the topic "${topic}" (learner level: ${skillLevel || 'Beginner'}), respond ONLY with a valid JSON object. No markdown fences, no code blocks, no extra text before or after. All string values must be plain text with no newlines, no backticks, no unescaped quotes.

Use exactly this structure:
{"summary":"2-3 sentence plain-language explanation of what this is and why it matters","notes":"A concise lesson under 300 words. Use plain text only, no markdown, no code blocks, no special characters.","keyPoints":["short takeaway 1","short takeaway 2","short takeaway 3"],"searchQuery":"best short youtube search phrase for this topic"}`

    const completion = await groqCompletion({
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.4
    })

    let txt = completion.choices[0].message.content

    // Strip any markdown fences the model added despite instructions
    txt = txt.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()

    // Extract just the JSON object in case there's surrounding text
    const jsonMatch = txt.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON object found in response')
    txt = jsonMatch[0]

    // Remove control characters that break JSON.parse
    txt = txt.replace(/[\u0000-\u001F\u007F]/g, (char) => {
      if (char === '\n') return '\\n'
      if (char === '\r') return ''
      if (char === '\t') return ' '
      return ''
    })

    let content
    try {
      content = JSON.parse(txt)
    } catch {
      // Fallback if parsing still fails
      content = {
        summary: `This topic covers ${topic}. Watch the video below to learn the core concepts.`,
        notes: `Study ${topic} carefully. Focus on the fundamentals before moving to advanced concepts.`,
        keyPoints: ['Understand the basics first', 'Practice with small examples', 'Build a project to solidify your knowledge'],
        searchQuery: `${topic} tutorial for beginners`
      }
    }

    const video = await fetchYouTubeVideo(content.searchQuery || topic)
    res.status(200).json({ content, video })
  } catch (error) {
    console.error('Topic content error:', error)
    res.status(500).json({ message: 'Error fetching content', error: error.message })
  }
}

// ---- (#13) In-app help/support chatbot ----
export const helpChat = async (req, res) => {
  try {
    const { messages } = req.body

    const system = `You are "Afriq Helper", the in-app support assistant for Afriq Learn, a learning platform for aspiring African tech talent.
You help users understand how to USE the app and answer quick learning questions.
Features you can explain:
- Dashboard: streak, active roadmap, quick links.
- Chat: talk to the AI to generate a personalised career roadmap (saved under My Roadmaps, max 2).
- Roadmap page: stages with status (Not Started / In Progress / Done), resources, in-app videos and notes per topic; users can edit, add and delete stages.
- Quizzes: pick a topic from the roadmap, choose difficulty and number of questions, timed quizzes, and review past results question-by-question.
- Profile: edit name, preferred language, skill level, pace, toggle email reminders.
Keep answers short, friendly and practical. If asked something off-topic, gently steer back to learning or using the app.`

    const completion = await groqCompletion({
      messages: [{ role: 'system', content: system }, ...messages],
      max_tokens: 700,
      temperature: 0.6
    })
    res.status(200).json({ message: completion.choices[0].message.content })
  } catch (error) {
    res.status(500).json({ message: 'Help error', error: error.message })
  }
}

// ---- (#3) Save edited/added/deleted nodes ----
export const updateRoadmapNodes = async (req, res) => {
  try {
    const { nodes } = req.body
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'Not authorized' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)

    if (user.currentRoadmap) {
      const updatedRoadmap = normalizeRoadmap({ ...toPlainRoadmap(user.currentRoadmap), nodes })
      syncActiveRoadmap(user, updatedRoadmap)
      await user.save()
    }
    res.status(200).json({ message: 'Roadmap updated', roadmap: user.currentRoadmap })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}