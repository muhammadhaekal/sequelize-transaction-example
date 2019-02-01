const express = require("express")
const router = express.Router()
const controller = require("./controller")
const helpers = require("../helpers")

// router.get("/search", controller.search)
// router.get("/", controller.get)
// router.get("/:emp_no", controller.getById)
router.post("/register", controller.register)
router.post("/login", controller.login)
router.get("/", helpers.isAuthenticated, controller.get)

// router.put("/:emp_no", controller.put)
// router.delete("/:emp_no", controller.deleteById)

module.exports = router
