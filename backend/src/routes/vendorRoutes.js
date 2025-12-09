const express = require("express");
const { createVendor, getAllVendors ,removeVendor} = require("../controllers/vendorController");

const router = express.Router();

router.post("/create/vendor", createVendor);
router.get("/list/vendor", getAllVendors);
router.delete("/vendor/:id",removeVendor);

module.exports = router;
