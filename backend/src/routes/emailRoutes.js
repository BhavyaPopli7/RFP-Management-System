const express = require("express");
const { inviteVendorsToRfp, createProposalFromEmail } = require("../controllers/emailController");

const router = express.Router();

router.post("/rfp/:id/invite-vendors", inviteVendorsToRfp);
router.post("/rfp/:rfpId/vendor/:vendorId/proposal", createProposalFromEmail);

module.exports = router;
