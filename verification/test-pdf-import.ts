import "@/lib/pdf-service";

console.log("PDF Service imported successfully.");

// Mock buffer
const mockBuffer = Buffer.from("dummy pdf content");
// We won't actually parse because we don't have a real PDF, strictly checking import side-effects
console.log("Test complete");
