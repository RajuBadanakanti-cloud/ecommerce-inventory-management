import catchAsync from "../utils/catchAsync.js"
import AppError from "../utils/AppError.js"
import User from "../model/User.js";

// forgot
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js"; // nodemailer connection

import {
  jwtTokens,
  hashToken,
} from "../utils/jwtTokens.js";

import {
  refreshCookieOptions,
} from "../utils/cookieOptions.js";


// register >>
export const registerUser =  catchAsync( async (req, res, next) => {

    const { name, email, password } = req.body;

    // Basic input validation
    if (!name || !email || !password) {
        return next(new AppError("all field are required!", 400))
    }

    // input validate
    if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
    ) {
    return next(new AppError("Invalid input data", 400));
    }


    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check duplicate email
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
        return next(new AppError("email already exists!", 400))
    }

    // password checking 
    if(password.length < 8){
        return next(new AppError("password must have 8 characters!", 400))
    }

    // Create user
    // Password is hashed automatically by pre-save middleware
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
    });

    // Generate tokens
    const { accessToken, refreshToken } =
       jwtTokens(user);

    // Hash refresh token
    user.refreshToken = hashToken(refreshToken);

    // Store hashed refresh token in MongoDB
    await user.save();

    // Set refresh token in HttpOnly cookie
    res.cookie(
      "refreshToken",
      refreshToken,
      refreshCookieOptions
    );

    // Send response
    return res.status(201).json({
      success: true,
      message: "Registration successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        accessToken,
    });
});


// login >>>
export const loginUser = catchAsync(async (req, res, next) => {

  const { email, password } = req.body;

  // Check required fields
  if (!email || !password) {
    return next(
      new AppError("Email and password are required", 400)
    );
  }

  // Validate input types
  if (
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return next(
      new AppError("Invalid input data", 400)
    );
  }

  // Normalize email
  const normalizedEmail = email.trim().toLowerCase();

  // Find user and explicitly retrieve password
  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  // Verify user credentials
  if (!user){
    return next(new AppError("Invalid email or password", 400))
  }
    
  // user password comparing
  const isMatch =  await user.comparePassword(password)
    if(!isMatch){
        return next(new AppError("Invalid email or password", 401))
    }
   

  // Check account status
  if (!user.isActive) {
    return next(
      new AppError("Your account is inactive. Please contact support.", 403)
    );
  }

  // Generate tokens
  const { accessToken, refreshToken } = jwtTokens(user);

  // Hash refresh token
  user.refreshToken = hashToken(refreshToken);

  // Store hashed refresh token in MongoDB
  await user.save();

  // Set refresh token in HttpOnly cookie
  res.cookie(
    "refreshToken",
    refreshToken,
    refreshCookieOptions
  );

  // Send response
  return res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        accessToken,

    })
});



// forgot password >>
export const forgotPassword = catchAsync(async (req, res, next) => {

  const { email } = req.body;

  // Validate email
  if (typeof email !== "string" || !email.trim()) {
    return next(new AppError("Please provide a valid email", 400));
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Find user
  const user = await User.findOne({
    email: normalizedEmail,
    isActive: true,
  });

  // Generic response prevents email enumeration
  const successResponse = {
    success: true,
    message: "If an account exists with this email, a password reset link will be sent.",
  };

  if (!user) {
    return res.status(200).json(successResponse);
  }

  // Generate cryptographically secure token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // 4. Hash token
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Save token hash and expiration
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

  await user.save();

  // Create reset URL
  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  // Send email

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Request",

        message: `We received a request to reset your password. This link expires in 15 minutes. If you did not request this, please ignore this email.`,

        html: `
          <div style="
            font-family: Arial, sans-serif;
            max-width: 480px;
            margin: auto;
            padding: 30px;
            background: #ffffff;
            color: #0f172a;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
          ">

            <h2 style="color: #2563eb; margin-bottom: 20px;">
              Password Reset Request
            </h2>

            <p style="color: #475569; font-size: 15px; line-height: 1.6;">
              We received a request to reset your account password.
              Click the button below to create a new password.
            </p>

            <a href="${resetURL}" style="
              display: inline-block;
              padding: 12px 24px;
              margin: 15px 0;
              background: #2563eb;
              color: #ffffff;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
            ">
              Reset Password
            </a>

            <p style="
              color: #64748b;
              font-size: 13px;
              background: #f1f5f9;
              padding: 12px;
              border-radius: 6px;
            ">
              <strong>Note:</strong> This link expires in 15 minutes.
              If you didn't request this, please ignore this email.
            </p>

            <hr style="border: 0; border-top: 1px solid #e2e8f0;">

            <p style="
              color: #64748b;
              font-size: 13px;
              margin-bottom: 0;
            ">
              From: E-commerce Support Team
            </p>

          </div>
        `,
      });

    } catch (error) {
      console.error("Email sending failed:", error);
    }


  return res.status(200).json(successResponse);
});


// reset password >>
export const resetPassword = catchAsync(async (req, res, next) => {

  const { token } = req.params;
  const { password } = req.body;

  // 1. Validate inputs
  if (
    typeof token !== "string" ||
    typeof password !== "string"
  ) {
    return next(new AppError("Invalid reset request", 400));
  }

  if (password.length < 8) {
    return next(
      new AppError("Password must contain at least 8 characters", 400)
    );
  }

  // Hash incoming reset token
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // Find user with valid, unexpired reset token
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
    isActive: true,
  })
  .select("+resetPasswordToken +resetPasswordExpires");

  if (!user) {
    return next(
      new AppError("Invalid or expired password reset token", 400)
    );
  }

  // Update password
  user.password = password;

  // Remove reset token (one-time use)
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;

  // Revoke existing refresh token
  user.refreshToken = null;

  // Save changes
  // Password is automatically hashed by pre-save middleware
  await user.save();

  // 8. Clear refresh cookie in browser
  res.clearCookie("refreshToken", refreshCookieOptions);

  return res.status(200).json({
    success: true,
    message: "Password reset successful. Please login with your new password.",
  });
});


// logout >> 
export const logoutUser = catchAsync(async (req, res, next) => {
    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;

    // Clear cookie even if no token exists
    if (!refreshToken) {
      res.clearCookie("refreshToken", refreshCookieOptions);

      return res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    }

    // Hash refresh token before database lookup
    const hashedToken = hashToken(refreshToken);

    // Find user with matching refresh token
    const user = await User.findOne({
      refreshToken: hashedToken,
    }).select("+refreshToken");

    // Remove refresh token from database
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    // Clear refresh token cookie
    res.clearCookie("refreshToken", refreshCookieOptions);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
})



