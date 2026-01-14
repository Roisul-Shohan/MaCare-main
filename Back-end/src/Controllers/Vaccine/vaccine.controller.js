import { AsynHandler } from "../../Utils/AsyncHandler.js";
import { ApiError } from "../../Utils/ApiError.js";
import { ApiResponse } from "../../Utils/ApiResponse.js";
import { VaccineRecord } from "../../Models/Vaccine/VaccineRecord.model.js";
import { FileUpload, FileDelete } from "../../Utils/Cloudinary.js";

/**
 * Create a new vaccine record
 */
const createVaccine = AsynHandler(async (req, res) => {
  const motherID = req.user._id;
  const { vaccineName, scheduledDate, notes } = req.body;

  if (!vaccineName || !scheduledDate) {
    throw new ApiError(400, "Vaccine name and scheduled date are required");
  }

  const vaccine = await VaccineRecord.create({
    motherID,
    vaccineName,
    scheduledDate: new Date(scheduledDate),
    status: "Pending",
    notes: notes || ""
  });

  return res.status(201).json(
    new ApiResponse(201, vaccine, "Vaccine added successfully")
  );
});

/**
 * Get vaccine schedule for logged-in mother
 */
const getVaccineSchedule = AsynHandler(async (req, res) => {
  const motherID = req.user._id;

  const vaccines = await VaccineRecord.find({ motherID }).sort({ scheduledDate: 1 });

  return res.status(200).json(
    new ApiResponse(200, vaccines, "Vaccine schedule fetched successfully")
  );
});

/**
 * Mark vaccine as completed
 * Updates status and taken date
 */
const markVaccineCompleted = AsynHandler(async (req, res) => {
  const { vaccineId } = req.params;
  const { takenDate, notes } = req.body;
  const motherID = req.user._id;

  // Find vaccine and verify ownership
  const vaccine = await VaccineRecord.findById(vaccineId);
  
  if (!vaccine) {
    throw new ApiError(404, "Vaccine record not found");
  }

  if (vaccine.motherID.toString() !== motherID.toString()) {
    throw new ApiError(403, "Access denied");
  }

  // Update vaccine
  vaccine.status = "Completed";
  vaccine.takenDate = takenDate || new Date();
  if (notes) vaccine.notes = notes;

  await vaccine.save();

  return res.status(200).json(
    new ApiResponse(200, vaccine, "Vaccine marked as completed")
  );
});

/**
 * Upload vaccine confirmation PDF
 * Uploads PDF to Cloudinary and links to vaccine record
 */
const uploadVaccinePDF = AsynHandler(async (req, res) => {
  const { vaccineId } = req.params;
  const motherID = req.user._id;

  // Find vaccine and verify ownership
  const vaccine = await VaccineRecord.findById(vaccineId);
  
  if (!vaccine) {
    throw new ApiError(404, "Vaccine record not found");
  }

  if (vaccine.motherID.toString() !== motherID.toString()) {
    throw new ApiError(403, "Access denied");
  }

  // Check if PDF file was uploaded
  if (!req.file) {
    throw new ApiError(400, "PDF file is required");
  }

  // Validate file type
  if (req.file.mimetype !== 'application/pdf') {
    throw new ApiError(400, "Only PDF files are allowed");
  }

  // Delete old PDF if exists
  if (vaccine.pdfPublicId) {
    await FileDelete(vaccine.pdfPublicId);
  }

  // Upload new PDF to Cloudinary
  console.log("Attempting to upload PDF to Cloudinary from path:", req.file.path);
  const pdfUpload = await FileUpload(req.file.path);
  
  if (!pdfUpload) {
    console.error("Cloudinary upload returned null for file:", req.file.path);
    throw new ApiError(500, "Error uploading PDF to cloud storage. Please check Cloudinary configuration.");
  }

  console.log("PDF uploaded successfully. URL:", pdfUpload.secure_url);

  // Update vaccine with PDF details
  vaccine.pdfUrl = pdfUpload.secure_url;
  vaccine.pdfPublicId = pdfUpload.public_id;

  await vaccine.save();

  return res.status(200).json(
    new ApiResponse(200, vaccine, "Vaccine PDF uploaded successfully")
  );
});

/**
 * Delete vaccine PDF
 */
const deleteVaccinePDF = AsynHandler(async (req, res) => {
  const { vaccineId } = req.params;
  const motherID = req.user._id;

  const vaccine = await VaccineRecord.findById(vaccineId);
  
  if (!vaccine) {
    throw new ApiError(404, "Vaccine record not found");
  }

  if (vaccine.motherID.toString() !== motherID.toString()) {
    throw new ApiError(403, "Access denied");
  }

  if (!vaccine.pdfPublicId) {
    throw new ApiError(404, "No PDF found for this vaccine");
  }

  // Delete from Cloudinary
  await FileDelete(vaccine.pdfPublicId);

  // Update vaccine record
  vaccine.pdfUrl = undefined;
  vaccine.pdfPublicId = undefined;

  await vaccine.save();

  return res.status(200).json(
    new ApiResponse(200, {}, "Vaccine PDF deleted successfully")
  );
});

/**
 * Delete a vaccine record
 */
const deleteVaccine = AsynHandler(async (req, res) => {
  const { vaccineId } = req.params;
  const motherID = req.user._id;

  const vaccine = await VaccineRecord.findById(vaccineId);
  
  if (!vaccine) {
    throw new ApiError(404, "Vaccine record not found");
  }

  if (vaccine.motherID.toString() !== motherID.toString()) {
    throw new ApiError(403, "Access denied");
  }

  // Delete PDF from Cloudinary if exists
  if (vaccine.pdfPublicId) {
    await FileDelete(vaccine.pdfPublicId);
  }

  await VaccineRecord.findByIdAndDelete(vaccineId);

  return res.status(200).json(
    new ApiResponse(200, {}, "Vaccine deleted successfully")
  );
});

/**
 * Reset vaccine status to pending
 */
const resetVaccineStatus = AsynHandler(async (req, res) => {
  const { vaccineId } = req.params;
  const motherID = req.user._id;

  const vaccine = await VaccineRecord.findById(vaccineId);
  
  if (!vaccine) {
    throw new ApiError(404, "Vaccine record not found");
  }

  if (vaccine.motherID.toString() !== motherID.toString()) {
    throw new ApiError(403, "Access denied");
  }

  vaccine.status = "Pending";
  vaccine.takenDate = undefined;
  vaccine.notes = undefined;

  await vaccine.save();

  return res.status(200).json(
    new ApiResponse(200, vaccine, "Vaccine status reset to pending")
  );
});

export {
  createVaccine,
  getVaccineSchedule,
  markVaccineCompleted,
  uploadVaccinePDF,
  deleteVaccinePDF,
  deleteVaccine,
  resetVaccineStatus
};
