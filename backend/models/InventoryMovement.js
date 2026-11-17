import mongoose from "mongoose";

const inventoryMovementSchema = new mongoose.Schema(
    {
        product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Product reference is required"],
        },

        changeQuantity: {
        type: Number,
        required: [true, "Quantity change is required"],
        validate: [
            {
            validator: Number.isSafeInteger,
            message: "Quantity must be a safe integer",
            },
            {
            validator: (value) => value !== 0,
            message: "Quantity change cannot be zero",
            },
        ],
        },

        previousStock: {
        type: Number,
        required: true,
        min: 0,
        },

        newStock: {
        type: Number,
        required: true,
        min: 0,
        },

        movementType: {
        type: String,
        enum: ["IN", "OUT"],
        required: true,
        },

        reason: {
        type: String,
        required: [true, "Adjustment reason is required"],
        trim: true,
        maxlength: 300,
        },

        performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Admin reference is required"],
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
    );

    const InventoryMovement = mongoose.model(
    "InventoryMovement",
    inventoryMovementSchema
    );

    export default InventoryMovement;
