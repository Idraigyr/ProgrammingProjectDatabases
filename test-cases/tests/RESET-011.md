# Password Reset Test Cases

## Test Case 11: Password Reset Functionality Test

- **Test Case ID:** RESET-011
- **Test Case Description:** Verify that users can reset their password by providing their username and a new password.
- **Preconditions:** 
  - The password reset feature is accessible and functional.
- **Test Steps:** 
  1. Access Password Reset Form:
     - Navigate to the password reset page or form.
  2. Enter Username and New Password:
     - Input the user's username into the appropriate field.
     - Enter a new password into the corresponding field.
  3. Submit Form:
     - Click on the "Reset Password" or similar button to submit the form.
  4. Verify Password Reset:
     - Ensure that the password is successfully reset for the provided username with the new password.
     - Attempt to login using the new password to confirm successful password reset.
- **Expected Results:** 
  - Users should be able to reset their password by providing their username and a new password.
  - After submitting the password reset form, the password for the provided username should be updated with the new password.
  - Users should be able to login using the new password after the password reset process is completed.
- **Postconditions:** 
  - The user should have successfully reset their password and be able to access their account using the new password.
- **Notes:** 
  - Ensure that the password reset form is secure and protects user privacy by not revealing existing passwords.
  - Test the functionality with various usernames and new passwords to ensure robustness.
  - Verify that appropriate error messages are displayed if the provided username is not found.
