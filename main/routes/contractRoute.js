import express from 'express'

const router = express.Router()
import { verifyContract } from '../controllers/contractController.js'

router.route('/verify').post(verifyContract)

export default router
