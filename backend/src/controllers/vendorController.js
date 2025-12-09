const Vendor = require("../models/vendor");

async function createVendor(req, res) {
  const { name, email, phonenumber } = req.body;

  if (!name || !email || !phonenumber) {
    return res.status(400).json({ error: "Missing required field(s)" });
  }

  try {
    const newVendor = new Vendor({
      name,
      email,
      phone: phonenumber,
    });

    await newVendor.save();

    return res.status(201).json({
      success: true,
      message: "New vendor added successfully",
      data: newVendor,
    });
  } catch (error) {
    console.error(error);
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return res.status(409).json({
        success: false,
        message: "Vendor with this email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

async function getAllVendors(req, res) {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 }); // latest first

    return res.status(200).json({
      success: true,
      count: vendors.length,
      data: vendors,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch vendors",
      error: error.message,
    });
  }
}

async function removeVendor(req, res) {
  const { id } = req.params;

  try {
    // Await the deletion and get the deleted doc (or null if not found)
    const deletedVendor = await Vendor.findByIdAndDelete(id);

    if (!deletedVendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vendor deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting vendor:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete vendor",
      error: err.message,
    });
  }
}

module.exports = {
  createVendor,
  getAllVendors,
  removeVendor
};
