import express from 'express'
import {
  chat, generateRoadmap, saveRoadmap, getMyRoadmap,
  updateNodeStatus, generateQuiz, saveQuizResult, getQuizResults,
  getAllRoadmaps, saveNewRoadmap, switchRoadmap, deleteRoadmap,
  getTopicContent, getTopicVideos, helpChat, updateRoadmapNodes
} from '../controllers/chatController.js'

const router = express.Router()

router.post('/message', chat)
router.post('/generate-roadmap', generateRoadmap)
router.post('/save-roadmap', saveRoadmap)
router.post('/save-new-roadmap', saveNewRoadmap)
router.get('/my-roadmap', getMyRoadmap)
router.get('/all-roadmaps', getAllRoadmaps)
router.post('/switch-roadmap', switchRoadmap)
router.post('/delete-roadmap', deleteRoadmap)
router.post('/update-node-status', updateNodeStatus)
router.post('/update-roadmap-nodes', updateRoadmapNodes) // #3
router.post('/topic-content', getTopicContent)           // #10/#11/#12
router.post('/topic-videos', getTopicVideos)             // multiple YouTube videos for playlist
router.post('/help', helpChat)                           // #13
router.post('/generate-quiz', generateQuiz)
router.post('/save-quiz-result', saveQuizResult)
router.get('/quiz-results', getQuizResults)

export default router