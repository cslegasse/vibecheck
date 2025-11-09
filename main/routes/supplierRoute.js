import express from 'express'
const router = express.Router()
import {
  addSupplier,
  getSupplier,
  getSuppliers,
} from '../controllers/supplierController.js'

router.route('/add').post(addSupplier)
router.route('/get').post(getSupplier)
router.route('/getSuppliers').post(getSuppliers)
export default router
