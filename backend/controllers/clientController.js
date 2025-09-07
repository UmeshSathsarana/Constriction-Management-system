const Client = require("../models/Client");
const Project = require("../models/Project");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Create Client
exports.createClient = async (req, res) => {
  try {
    const clientData = { ...req.body };

    // Hash password if provided
    if (clientData.password) {
      const salt = await bcrypt.genSalt(10);
      clientData.password = await bcrypt.hash(clientData.password, salt);
    }

    const newClient = new Client(clientData);
    await newClient.save();

    // Get Socket.IO instance for real-time updates
    const io = req.app.get("io");

    // Emit real-time update to Finance Managers and Admins
    io.to("Financial Manager").emit("client-created", {
      type: "client-created",
      client: newClient,
      message: `New client registered: ${newClient.name}`,
    });

    io.to("Admin").emit("client-created", {
      type: "client-created",
      client: newClient,
      message: `New client registered: ${newClient.name}`,
    });

    res.status(201).json({
      message: "Client created successfully",
      client: newClient,
    });
  } catch (err) {
    console.error("Error creating client:", err);

    // Handle duplicate email error
    if (err.code === 11000 && err.keyValue.email) {
      return res.status(400).json({
        message: "Email address already exists. Please use a different email.",
      });
    }

    res.status(500).json({
      message: "Error creating client",
      error: err.message,
    });
  }
};

// Get All Clients
exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.find()
      .populate("projects", "name status budget")
      .populate("siteSupervisor", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      clients,
      count: clients.length,
    });
  } catch (err) {
    console.error("Error fetching clients:", err);
    res.status(500).json({
      message: "Error fetching clients",
      error: err.message,
    });
  }
};

// Get Client by ID
exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate("projects", "name status budget startDate endDate")
      .populate("siteSupervisor", "name email")
      .populate("agreements.createdBy", "name email")
      .populate("agreements.signedBy.company.signedBy", "name email");

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json({ client });
  } catch (err) {
    console.error("Error fetching client:", err);
    res.status(500).json({
      message: "Error fetching client",
      error: err.message,
    });
  }
};

// Update Client
exports.updateClient = async (req, res) => {
  try {
    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    )
      .populate("projects", "name status budget")
      .populate("siteSupervisor", "name email");

    if (!updatedClient) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Emit real-time update
    const io = req.app.get("io");
    io.emit("client-updated", {
      type: "client-updated",
      client: updatedClient,
      message: `Client ${updatedClient.name} updated`,
    });

    res.status(200).json({
      message: "Client updated successfully",
      client: updatedClient,
    });
  } catch (err) {
    console.error("Error updating client:", err);
    res.status(500).json({
      message: "Error updating client",
      error: err.message,
    });
  }
};

// Delete Client
exports.deleteClient = async (req, res) => {
  try {
    const deletedClient = await Client.findByIdAndDelete(req.params.id);

    if (!deletedClient) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Emit real-time update
    const io = req.app.get("io");
    io.emit("client-deleted", {
      type: "client-deleted",
      clientId: req.params.id,
      message: `Client ${deletedClient.name} deleted`,
    });

    res.status(200).json({
      message: "Client deleted successfully",
      deletedClient: {
        id: deletedClient._id,
        name: deletedClient.name,
      },
    });
  } catch (err) {
    console.error("Error deleting client:", err);
    res.status(500).json({
      message: "Error deleting client",
      error: err.message,
    });
  }
};

// Update Client Budget
exports.updateClientBudget = async (req, res) => {
  try {
    const {
      totalBudget,
      allocatedBudget,
      spentAmount,
      operation = "set",
    } = req.body;

    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Update budget info
    if (totalBudget !== undefined) {
      client.budgetInfo.totalBudget = totalBudget;
    }
    if (allocatedBudget !== undefined) {
      client.budgetInfo.allocatedBudget = allocatedBudget;
    }
    if (spentAmount !== undefined) {
      await client.updateBudget(spentAmount, operation);
    }

    await client.save();

    // Populate client data
    await client.populate("projects", "name status budget");

    // Emit real-time update
    const io = req.app.get("io");
    io.to("Financial Manager").emit("client-budget-updated", {
      type: "client-budget-updated",
      client: client,
      message: `Budget updated for client: ${client.name}`,
    });

    io.to("Admin").emit("client-budget-updated", {
      type: "client-budget-updated",
      client: client,
      message: `Budget updated for client: ${client.name}`,
    });

    res.status(200).json({
      message: "Client budget updated successfully",
      client: client,
    });
  } catch (err) {
    console.error("Error updating client budget:", err);
    res.status(500).json({
      message: "Error updating client budget",
      error: err.message,
    });
  }
};

// Add Agreement to Client
exports.addAgreement = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const agreementData = {
      ...req.body,
      createdBy: req.body.createdBy || req.user?.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await client.addAgreement(agreementData);

    // Populate the updated client
    await client.populate("agreements.createdBy", "name email");

    // Emit real-time update
    const io = req.app.get("io");
    io.emit("agreement-added", {
      type: "agreement-added",
      client: client,
      agreement: agreementData,
      message: `New agreement added for client: ${client.name}`,
    });

    res.status(201).json({
      message: "Agreement added successfully",
      client: client,
    });
  } catch (err) {
    console.error("Error adding agreement:", err);
    res.status(500).json({
      message: "Error adding agreement",
      error: err.message,
    });
  }
};

// Update Agreement
exports.updateAgreement = async (req, res) => {
  try {
    const { clientId, agreementId } = req.params;

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const agreement = client.agreements.id(agreementId);
    if (!agreement) {
      return res.status(404).json({ message: "Agreement not found" });
    }

    // Update agreement fields
    Object.keys(req.body).forEach((key) => {
      if (key !== "_id") {
        agreement[key] = req.body[key];
      }
    });
    agreement.updatedAt = Date.now();

    await client.save();

    // Populate the updated client
    await client.populate("agreements.createdBy", "name email");

    // Emit real-time update
    const io = req.app.get("io");
    io.emit("agreement-updated", {
      type: "agreement-updated",
      client: client,
      agreement: agreement,
      message: `Agreement updated for client: ${client.name}`,
    });

    res.status(200).json({
      message: "Agreement updated successfully",
      client: client,
    });
  } catch (err) {
    console.error("Error updating agreement:", err);
    res.status(500).json({
      message: "Error updating agreement",
      error: err.message,
    });
  }
};

// Sign Agreement
exports.signAgreement = async (req, res) => {
  try {
    const { clientId, agreementId } = req.params;
    const { signatureType, signatureData, signerName } = req.body; // 'client' or 'company'

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const agreement = client.agreements.id(agreementId);
    if (!agreement) {
      return res.status(404).json({ message: "Agreement not found" });
    }

    // Update signature
    if (signatureType === "client") {
      agreement.signedBy.client = {
        name: signerName,
        signature: signatureData,
        date: new Date(),
      };
    } else if (signatureType === "company") {
      agreement.signedBy.company = {
        name: signerName,
        signature: signatureData,
        date: new Date(),
        signedBy: req.body.signedBy || req.user?.id,
      };
    }

    // Check if both parties have signed
    if (agreement.signedBy.client && agreement.signedBy.company) {
      agreement.status = "Signed";
      agreement.signedDate = new Date();
    }

    agreement.updatedAt = Date.now();
    await client.save();

    // Emit real-time update
    const io = req.app.get("io");
    io.emit("agreement-signed", {
      type: "agreement-signed",
      client: client,
      agreement: agreement,
      signatureType: signatureType,
      message: `Agreement signed by ${signatureType} for client: ${client.name}`,
    });

    res.status(200).json({
      message: "Agreement signed successfully",
      client: client,
    });
  } catch (err) {
    console.error("Error signing agreement:", err);
    res.status(500).json({
      message: "Error signing agreement",
      error: err.message,
    });
  }
};

// Get Client Budget Summary
exports.getClientBudgetSummary = async (req, res) => {
  try {
    const clients = await Client.find({
      "budgetInfo.totalBudget": { $exists: true, $gt: 0 },
    }).populate("projects", "name status budget");

    const budgetSummary = clients.map((client) => ({
      _id: client._id,
      name: client.name,
      company: client.company,
      totalBudget: client.budgetInfo.totalBudget,
      spentBudget: client.budgetInfo.spentBudget,
      remainingBudget: client.remainingBudget,
      utilizationPercentage: client.budgetUtilization,
      budgetStatus: client.budgetInfo.budgetStatus,
      projectCount: client.projects.length,
      lastUpdated: client.budgetInfo.lastUpdated,
    }));

    // Calculate overall statistics
    const totalBudget = budgetSummary.reduce(
      (sum, client) => sum + (client.totalBudget || 0),
      0
    );
    const totalSpent = budgetSummary.reduce(
      (sum, client) => sum + (client.spentBudget || 0),
      0
    );
    const avgUtilization =
      budgetSummary.length > 0
        ? budgetSummary.reduce(
            (sum, client) => sum + client.utilizationPercentage,
            0
          ) / budgetSummary.length
        : 0;

    res.status(200).json({
      clients: budgetSummary,
      summary: {
        totalClients: budgetSummary.length,
        totalBudget,
        totalSpent,
        totalRemaining: totalBudget - totalSpent,
        avgUtilization: Math.round(avgUtilization * 100) / 100,
      },
    });
  } catch (err) {
    console.error("Error fetching client budget summary:", err);
    res.status(500).json({
      message: "Error fetching client budget summary",
      error: err.message,
    });
  }
};

// Get Client Agreements
exports.getClientAgreements = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate("agreements.createdBy", "name email")
      .populate("agreements.signedBy.company.signedBy", "name email")
      .select("name company agreements");

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json({
      client: {
        _id: client._id,
        name: client.name,
        company: client.company,
      },
      agreements: client.agreements,
      count: client.agreements.length,
    });
  } catch (err) {
    console.error("Error fetching client agreements:", err);
    res.status(500).json({
      message: "Error fetching client agreements",
      error: err.message,
    });
  }
};
