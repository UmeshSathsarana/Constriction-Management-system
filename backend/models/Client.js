const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Client name is required"],
    trim: true,
  },
  company: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function (v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: "Please enter a valid email address",
    },
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters long"],
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  contactPerson: {
    type: String,
    trim: true,
  },
  projects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
  ],
  siteSupervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  agreements: [
    {
      title: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        required: true,
      },
      agreementType: {
        type: String,
        enum: ["Contract", "NDA", "Service Agreement", "Payment Terms", "Other"],
        default: "Contract",
      },
      status: {
        type: String,
        enum: ["Draft", "Pending", "Signed", "Expired", "Terminated"],
        default: "Draft",
      },
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
      value: {
        type: Number,
        min: 0,
      },
      currency: {
        type: String,
        default: "USD",
      },
      signedDate: {
        type: Date,
      },
      signedBy: {
        client: {
          name: String,
          signature: String, // Base64 encoded signature
          date: Date,
        },
        company: {
          name: String,
          signature: String,
          date: Date,
          signedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        },
      },
      documents: [
        {
          filename: String,
          url: String,
          uploadDate: {
            type: Date,
            default: Date.now,
          },
          uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        },
      ],
      terms: [
        {
          clause: String,
          description: String,
        },
      ],
      paymentTerms: {
        paymentMethod: {
          type: String,
          enum: ["Bank Transfer", "Check", "Cash", "Credit Card", "Other"],
          default: "Bank Transfer",
        },
        paymentSchedule: {
          type: String,
          enum: ["Upfront", "Milestone", "Monthly", "Quarterly", "On Completion"],
          default: "Milestone",
        },
        dueDate: Number, // Days after invoice
      },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  budgetInfo: {
    totalBudget: {
      type: Number,
      min: 0,
    },
    allocatedBudget: {
      type: Number,
      min: 0,
    },
    spentBudget: {
      type: Number,
      min: 0,
      default: 0,
    },
    currency: {
      type: String,
      default: "USD",
    },
    budgetStatus: {
      type: String,
      enum: ["Active", "Exceeded", "Completed", "Suspended"],
      default: "Active",
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
clientSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  
  // Update budget status based on spending
  if (this.budgetInfo && this.budgetInfo.totalBudget > 0) {
    const utilizationPercentage = (this.budgetInfo.spentBudget / this.budgetInfo.totalBudget) * 100;
    
    if (utilizationPercentage > 100) {
      this.budgetInfo.budgetStatus = "Exceeded";
    } else if (utilizationPercentage === 100) {
      this.budgetInfo.budgetStatus = "Completed";
    } else {
      this.budgetInfo.budgetStatus = "Active";
    }
    
    this.budgetInfo.lastUpdated = Date.now();
  }
  
  next();
});

// Virtual for budget utilization percentage
clientSchema.virtual("budgetUtilization").get(function () {
  if (!this.budgetInfo || !this.budgetInfo.totalBudget) return 0;
  return (this.budgetInfo.spentBudget / this.budgetInfo.totalBudget) * 100;
});

// Virtual for remaining budget
clientSchema.virtual("remainingBudget").get(function () {
  if (!this.budgetInfo) return 0;
  return (this.budgetInfo.totalBudget || 0) - (this.budgetInfo.spentBudget || 0);
});

// Method to update client budget
clientSchema.methods.updateBudget = function(spentAmount, operation = 'add') {
  if (!this.budgetInfo) {
    this.budgetInfo = {
      spentBudget: 0,
      currency: 'USD',
      budgetStatus: 'Active',
      lastUpdated: Date.now()
    };
  }
  
  switch (operation) {
    case 'add':
      this.budgetInfo.spentBudget += spentAmount;
      break;
    case 'subtract':
      this.budgetInfo.spentBudget = Math.max(0, this.budgetInfo.spentBudget - spentAmount);
      break;
    case 'set':
      this.budgetInfo.spentBudget = spentAmount;
      break;
  }
  
  return this.save();
};

// Method to add agreement
clientSchema.methods.addAgreement = function(agreementData) {
  this.agreements.push(agreementData);
  return this.save();
};

// Ensure virtuals are included in JSON output
clientSchema.set("toJSON", { virtuals: true });
clientSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Client", clientSchema);