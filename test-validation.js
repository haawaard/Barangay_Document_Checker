// Quick test to check validation logic
const formData = {
  LastName: "Doe",
  FirstName: "John",
  MiddleName: "Middle",
  Address: "123 Test St",
  Birthdate: "1990-01-01",
  ContactNumber: "12345678901",
  Gender: "Male",
  Purpose: "Test purpose"
};

console.log("Testing validation with form data:", formData);

const requiredFields = {
  'Last Name': formData.LastName,
  'First Name': formData.FirstName,
  'Address': formData.Address,
  'Birthdate': formData.Birthdate,
  'Contact Number': formData.ContactNumber,
  'Gender': formData.Gender,
  'Purpose': formData.Purpose
};

const emptyFields = Object.entries(requiredFields)
  .filter(([, value]) => {
    // More robust validation
    if (!value) return true; // null, undefined, or empty string
    if (typeof value !== 'string') return true; // not a string
    if (value.trim() === '') return true; // only whitespace
    return false;
  })
  .map(([key]) => key);

console.log("Empty fields found:", emptyFields);
console.log("Validation result:", emptyFields.length === 0 ? "PASS" : "FAIL");