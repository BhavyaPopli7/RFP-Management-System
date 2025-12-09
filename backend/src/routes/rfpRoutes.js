const express = require("express");
const { generateStructuredRfp, submitRfp, removeRfp,getRfpById,getRfpList } = require("../controllers/rfpController");

const router = express.Router();

router.get("/rfp/list", getRfpList);
router.post("/generate/rfp",generateStructuredRfp);
router.post("/submit/rfp",submitRfp);
router.get("/getrfp/:id",getRfpById);
router.delete("/rfp/:id",removeRfp);

module.exports = router;

